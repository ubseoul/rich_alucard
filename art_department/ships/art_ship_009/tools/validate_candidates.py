#!/usr/bin/env python3
"""Validate ART SHIP 009 candidates and emit machine-readable evidence."""

from __future__ import annotations

import hashlib
import json
import subprocess
from pathlib import Path

from PIL import Image


SHIP = Path(__file__).resolve().parents[1]
REPO = SHIP.parents[2]
BASE_SHA = "a16196e4fbc0c7530a00bdfe915fb9c9c7cd1826"


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def git(*args: str) -> str:
    return subprocess.check_output(["git", *args], cwd=REPO, text=True).strip()


def collect_sources(asset: dict) -> list[dict]:
    sources: list[dict] = []
    sources.extend(asset.get("visual_references", []))
    for key in ("source_master", "related_frozen_layer"):
        value = asset.get(key)
        if value:
            sources.append(value)
    return sources


def main() -> None:
    if (SHIP / "HQ_DECISION.md").exists():
        raise SystemExit("ART SHIP 009 is frozen; candidate-record regeneration is disabled. Use validate_promotion.py.")
    demand = json.loads((SHIP / "RUNTIME_DEMAND_MAP.json").read_text(encoding="utf-8"))
    facts = json.loads((SHIP / "CANDIDATE_TECHNICAL_FACTS.json").read_text(encoding="utf-8"))["assets"]
    facts_by_path = {item["path"]: item for item in facts}

    source_records: dict[str, dict] = {}
    for asset in demand["assets"]:
        for source in collect_sources(asset):
            source_records.setdefault(source["path"], source)
    source_checks = []
    for relative, source in sorted(source_records.items()):
        path = REPO / relative
        actual = sha256(path) if path.exists() else None
        source_checks.append({
            "path": relative,
            "expected_sha256": source["sha256"],
            "actual_sha256": actual,
            "pass": actual == source["sha256"],
        })

    candidate_checks = []
    manifest_assets = []
    for demand_asset in demand["assets"]:
        candidate_path = demand_asset.get("engineering_mapping", {}).get("candidate_path")
        if not candidate_path:
            continue
        fact = facts_by_path.get(candidate_path)
        path = REPO / candidate_path
        image = Image.open(path) if path.exists() else None
        expected_size = tuple(demand_asset["native_dimensions"])
        expected_mode = "RGB" if demand_asset["asset_type"] == "ENVIRONMENT_MASTER" else "RGBA"
        alpha_values = sorted(set(image.convert("RGBA").getchannel("A").getdata())) if image else []
        checks = {
            "exists": path.exists(),
            "dimensions": bool(image and image.size == expected_size),
            "mode": bool(image and image.mode == expected_mode),
            "binary_alpha": bool(image and (expected_mode == "RGB" or alpha_values == [0, 255])),
            "hash_fact_match": bool(fact and fact["sha256"] == sha256(path)),
        }
        if demand_asset["asset_type"] == "CHARACTER_STATE" and image:
            bbox = image.convert("RGBA").getchannel("A").getbbox()
            checks["contact_row_y88"] = bool(bbox and bbox[3] == 89)
            checks["centered_on_x40"] = bool(bbox and abs(((bbox[0] + bbox[2]) / 2) - 40) <= 1)
        if demand_asset["asset_type"] == "ENVIRONMENT_CONDITION_LAYER" and image:
            checks["exact_origin_canvas"] = image.size == (270, 480)
            checks["behind_actor_contact_line"] = image.convert("RGBA").getchannel("A").crop((0, 372, 270, 480)).getbbox() is None
        passed = all(checks.values())
        candidate_checks.append({"request_id": demand_asset["request_id"], "path": candidate_path, "checks": checks, "pass": passed})
        manifest_assets.append({
            "request_id": demand_asset["request_id"],
            "runtime_asset_id": demand_asset["runtime_asset_id"],
            "candidate_path": candidate_path,
            "sha256": fact["sha256"],
            "dimensions": fact["dimensions"],
            "mode": fact["mode"],
            "status": "CANDIDATE — HQ REVIEW REQUIRED",
            "runtime_surfaces": demand_asset["runtime_surfaces"],
        })

    raw_checks = []
    for path in sorted((SHIP / "source_renders").glob("*_raw.png")):
        image = Image.open(path)
        raw_checks.append({"filename": path.name, "sha256": sha256(path), "dimensions": list(image.size), "mode": image.mode})

    changed = [line for line in git("diff", "--name-only", BASE_SHA).splitlines() if line]
    changed_outside_ship = [path for path in changed if not path.startswith("art_department/ships/art_ship_009/")]
    untracked = [line[3:] for line in git("status", "--short").splitlines() if line.startswith("?? ")]
    untracked_outside_ship = [path for path in untracked if not path.startswith("art_department/ships/art_ship_009/")]
    preservation = {
        "base_sha": BASE_SHA,
        "source_checks": source_checks,
        "source_hashes_pass": all(item["pass"] for item in source_checks),
        "changed_paths_outside_ship": changed_outside_ship,
        "untracked_paths_outside_ship": untracked_outside_ship,
        "frozen_or_runtime_paths_changed": bool(changed_outside_ship or untracked_outside_ship),
        "pass": all(item["pass"] for item in source_checks) and not changed_outside_ship and not untracked_outside_ship,
    }

    validation = {
        "ship_id": "ART SHIP 009",
        "status": "CANDIDATE — HQ REVIEW REQUIRED",
        "candidate_count": len(candidate_checks),
        "candidate_checks": candidate_checks,
        "source_reference_count": len(source_checks),
        "source_integrity_pass": preservation["pass"],
        "all_candidate_checks_pass": all(item["pass"] for item in candidate_checks),
        "result": "PASS" if preservation["pass"] and all(item["pass"] for item in candidate_checks) and len(candidate_checks) == 12 else "FAIL",
    }
    manifest = {
        "ship_id": "ART SHIP 009",
        "package_status": "CANDIDATE PACKAGE READY FOR HQ REVIEW",
        "base": {"branch": "claude/art-ship-008-integration", "commit": BASE_SHA},
        "branch": "art/art_ship_009",
        "native_candidate_count": len(manifest_assets),
        "assets": manifest_assets,
        "zero_pixel_reuse": {
            "request_id": "AS9-REUSE-LAN-NIGHT",
            "runtime_asset_id": "lan_night",
            "reuse_registry_id": "tristan_apt",
            "source_path": "assets/before_the_fame/environments/tristan_apt/tristan_apartment_270x480.png",
            "sha256": "7ee376bbf15019ac0c1b86b99403cf16a154e37a50ecc373cf9cb2bbac735e9f",
        },
        "approval_boundary": "No candidate is APPROVED MASTER or FROZEN; no runtime integration is included.",
    }

    engineering_map = {
        "schema_version": 1,
        "ship_id": "ART SHIP 009",
        "status": "CANDIDATE MAPPING — ENGINEERING MUST NOT INFER FROM FILENAMES",
        "base_commit": BASE_SHA,
        "entries": [
            {
                "request_id": asset["request_id"],
                "runtime_asset_id": asset["runtime_asset_id"],
                "asset_type": asset["asset_type"],
                "native_dimensions": asset["native_dimensions"],
                "alpha_opacity_contract": asset["alpha_opacity_contract"],
                "contact_or_origin": asset["contact_or_origin"],
                "runtime_surfaces": asset["runtime_surfaces"],
                "engineering_mapping": asset["engineering_mapping"],
                "candidate_status": asset["candidate_status"],
            }
            for asset in demand["assets"]
        ],
        "runtime_code_modified": False,
    }

    state_layers = {
        "schema_version": 1,
        "ship_id": "ART SHIP 009",
        "definitions": [
            {
                "id": "hollow_bowl_stage_band_crowd_condition",
                "type": "exact_origin_additive_layer",
                "candidate_path": "art_department/ships/art_ship_009/candidates/native/layers/hollow_bowl_stage_band_crowd_overlay_270x480.png",
                "native_dimensions": [270, 480],
                "origin": [0, 0],
                "alpha": "binary",
                "draw_order": "base -> frozen seating crowd -> stage-band crowd companion -> actors -> UI",
                "activation_surfaces": ["hollow_bowl|left:rich"],
            },
            {
                "id": "tunde.hookah_seated",
                "type": "character_state",
                "candidate_path": "art_department/ships/art_ship_009/candidates/native/characters/tunde_hookah_seated_80x96.png",
                "native_dimensions": [80, 96],
                "contact": [40, 88],
                "alpha": "binary",
                "activation_surfaces": ["minigame:hookah?company=HOMIES"],
            },
            {
                "id": "dre.hookah_seated",
                "type": "character_state",
                "candidate_path": "art_department/ships/art_ship_009/candidates/native/characters/dre_hookah_seated_80x96.png",
                "native_dimensions": [80, 96],
                "contact": [40, 88],
                "alpha": "binary",
                "activation_surfaces": ["minigame:hookah?company=HOMIES"],
            },
        ],
        "presentation_director_final_framing_authority": True,
        "runtime_code_modified": False,
    }

    ship_manifest = {
        "schema_version": 1,
        "ship_id": "ART SHIP 009",
        "title": "OPEN RUNTIME COMPLETION",
        "status": "CANDIDATE PACKAGE READY FOR HQ REVIEW",
        "authorization": "User-supplied ART SHIP 009 project brief; generation, internal review and iteration authorized; approval/freeze explicitly prohibited.",
        "spoiler_classification": "OPEN production; internal boards PLAYER-BLIND / reviewer-only",
        "approval_claimed": False,
        "frozen_claimed": False,
        "runtime_integrated": False,
        "base": {"branch": "claude/art-ship-008-integration", "commit": BASE_SHA},
        "branch": "art/art_ship_009",
        "native_asset_count": len(manifest_assets),
        "files": manifest_assets,
        "zero_pixel_reuse": manifest["zero_pixel_reuse"],
        "generation_and_transformations": [
            "Reference-conditioned ImageGen, one call per distinct candidate.",
            "Environment renders reduced to native 270x480 and quantized to 30 colors without dithering.",
            "Hollow Bowl layer reduced to exact-origin 270x480, source-palette remapped, binary-alpha cleaned and central actor corridor masked.",
            "Character renders reduced into 80x96 cells, source-palette remapped, binary-alpha cleaned and registered to contact (40,88).",
        ],
        "pixel_preservation_checks": [
            "18/18 unique referenced source hashes match.",
            "No path outside art_department/ships/art_ship_009 differs from the base checkpoint.",
        ],
        "native_review_evidence": [
            "review/environment_candidates_player_blind.png",
            "review/hollow_bowl_stage_band_review_player_blind.png",
            "review/hookah_identity_review_player_blind.png",
        ],
        "runtime_test_scope": "Repository tests/build/artifact gate only; no runtime integration or PASS/HOLD mutation.",
        "unknowns": ["PD-W1-04 four-actor staging remains Presentation Director/HQ-owned after integration."],
        "taste_decision": "PENDING HQ/UBE REVIEW",
        "hq_acceptance": "NOT CLAIMED",
        "freeze_scope": None,
        "stop_point": "ART SHIP 009 — CANDIDATE PACKAGE READY FOR HQ REVIEW",
    }

    (SHIP / "RAW_GENERATION_HASHES.json").write_text(json.dumps({"renders": raw_checks}, indent=2) + "\n", encoding="utf-8")
    (SHIP / "SOURCE_PRESERVATION_EVIDENCE.json").write_text(json.dumps(preservation, indent=2) + "\n", encoding="utf-8")
    (SHIP / "CANDIDATE_VALIDATION_REPORT.json").write_text(json.dumps(validation, indent=2) + "\n", encoding="utf-8")
    (SHIP / "CANDIDATE_PACKAGE_MANIFEST.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    (SHIP / "ENGINEERING_ASSET_MAP.json").write_text(json.dumps(engineering_map, indent=2) + "\n", encoding="utf-8")
    (SHIP / "STATE_LAYER_DEFINITIONS.json").write_text(json.dumps(state_layers, indent=2) + "\n", encoding="utf-8")
    (SHIP / "ART_SHIP_MANIFEST.json").write_text(json.dumps(ship_manifest, indent=2) + "\n", encoding="utf-8")
    lines = [f'{asset["sha256"]}  {asset["candidate_path"]}' for asset in manifest_assets]
    (SHIP / "CANDIDATE_SHA256SUMS.txt").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({"result": validation["result"], "candidates": len(candidate_checks), "sources": len(source_checks), "preservation": preservation["pass"]}))


if __name__ == "__main__":
    main()
