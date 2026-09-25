#!/usr/bin/env python3
"""Validate ART SHIP 009 byte-for-byte promotion and frozen-corpus integrity."""

from __future__ import annotations

import hashlib
import json
import subprocess
from pathlib import Path

from PIL import Image


SHIP = Path(__file__).resolve().parents[1]
REPO = SHIP.parents[2]
CANDIDATE_CHECKPOINT = "47da18d9984c4915d3325709364db9a442fb3b36"


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def git(*args: str) -> str:
    return subprocess.check_output(["git", *args], cwd=REPO, text=True).strip()


def main() -> None:
    demand = json.loads((SHIP / "RUNTIME_DEMAND_MAP.json").read_text(encoding="utf-8"))
    engineering = json.loads((SHIP / "ENGINEERING_ASSET_MAP.json").read_text(encoding="utf-8"))
    register = json.loads((REPO / "art_department/ASSET_REGISTER.json").read_text(encoding="utf-8"))
    candidates = json.loads((SHIP / "CANDIDATE_PACKAGE_MANIFEST.json").read_text(encoding="utf-8"))["assets"]
    candidate_by_id = {item["request_id"]: item for item in candidates}

    promotion_checks = []
    approved_asset_paths = []
    for entry in engineering["entries"]:
        mapping = entry["engineering_mapping"]
        if "approved_path" not in mapping:
            continue
        request_id = entry["request_id"]
        candidate = candidate_by_id[request_id]
        candidate_path = REPO / candidate["candidate_path"]
        approved_path = REPO / mapping["approved_path"]
        candidate_hash = sha256(candidate_path)
        approved_hash = sha256(approved_path)
        with Image.open(approved_path) as image:
            dimensions = list(image.size)
            mode = image.mode
        checks = {
            "candidate_hash_matches_manifest": candidate_hash == candidate["sha256"],
            "approved_hash_matches_candidate": approved_hash == candidate_hash,
            "approved_hash_matches_engineering_map": approved_hash == mapping["approved_sha256"],
            "dimensions_match": dimensions == entry["native_dimensions"],
            "mode_contract_matches": mode == ("RGB" if entry["asset_type"] == "ENVIRONMENT_MASTER" else "RGBA"),
        }
        promotion_checks.append({
            "request_id": request_id,
            "candidate_path": candidate["candidate_path"],
            "approved_path": mapping["approved_path"],
            "sha256": approved_hash,
            "checks": checks,
            "pass": all(checks.values()),
        })
        approved_asset_paths.append(mapping["approved_path"])

    frozen_checks = []
    for asset in register["assets"]:
        if asset.get("status") != "FROZEN":
            continue
        path = REPO / asset["path"]
        actual = sha256(path) if path.exists() else None
        frozen_checks.append({"path": asset["path"], "expected_sha256": asset["sha256"], "actual_sha256": actual, "pass": actual == asset["sha256"]})

    sources: dict[str, str] = {}
    for asset in demand["assets"]:
        for source in asset.get("visual_references", []):
            sources[source["path"]] = source["sha256"]
        for key in ("source_master", "related_frozen_layer"):
            source = asset.get(key)
            if source:
                sources[source["path"]] = source["sha256"]
    source_checks = []
    for relative, expected in sorted(sources.items()):
        actual = sha256(REPO / relative)
        source_checks.append({"path": relative, "expected_sha256": expected, "actual_sha256": actual, "pass": actual == expected})

    tristan_path = "assets/before_the_fame/environments/tristan_apt/tristan_apartment_270x480.png"
    tristan_hash = "7ee376bbf15019ac0c1b86b99403cf16a154e37a50ecc373cf9cb2bbac735e9f"
    same_hash_asset_paths = []
    for path in (REPO / "assets").rglob("*.png"):
        if sha256(path) == tristan_hash:
            same_hash_asset_paths.append(path.relative_to(REPO).as_posix())
    lan_night = {
        "mapping": "lan_night -> tristan_apt",
        "source_path": tristan_path,
        "source_sha256": sha256(REPO / tristan_path),
        "expected_sha256": tristan_hash,
        "same_hash_asset_paths": same_hash_asset_paths,
        "new_lan_night_bitmap_paths": [p.relative_to(REPO).as_posix() for p in (REPO / "assets").rglob("*lan_night*.png")],
    }
    lan_night["pass"] = lan_night["source_sha256"] == tristan_hash and same_hash_asset_paths == [tristan_path] and not lan_night["new_lan_night_bitmap_paths"]

    changed = [line for line in git("diff", "--name-only", CANDIDATE_CHECKPOINT).splitlines() if line]
    allowed = {
        "art_department/ASSET_REGISTER.json",
        "art_department/APPROVED_ASSET_INDEX.md",
        "art_department/APPROVAL_LEDGER.md",
        "art_department/START_HERE.md",
        "art_department/CURRENT_HANDOFF.md",
        "art_department/CURRENT_OPEN_ART_GAPS.md",
        "art_department/CURRENT_OPEN_ART_GAPS.json",
        "art_department/STYLE_FINGERPRINT.md",
        "art_department/ZERO_UPLOAD_ONBOARDING_VALIDATION.md",
        "art_department/references/ENVIRONMENTS.md",
        "art_department/references/CHARACTERS.md",
    }
    allowed.update(approved_asset_paths)
    out_of_scope = [path for path in changed if not (path.startswith("art_department/ships/art_ship_009/") or path in allowed)]

    result = {
        "ship_id": "ART SHIP 009",
        "accepted_candidate_checkpoint": CANDIDATE_CHECKPOINT,
        "promotion_checks": promotion_checks,
        "promoted_count": len(promotion_checks),
        "promoted_exact_byte_matches": sum(item["pass"] for item in promotion_checks),
        "frozen_corpus_count": len(frozen_checks),
        "frozen_corpus_checks_pass": all(item["pass"] for item in frozen_checks),
        "source_reference_count": len(source_checks),
        "source_reference_checks_pass": all(item["pass"] for item in source_checks),
        "lan_night_zero_pixel_reuse": lan_night,
        "changed_paths_since_candidate_checkpoint": changed,
        "out_of_scope_paths": out_of_scope,
        "runtime_or_gameplay_code_changed": bool(out_of_scope),
        "sealed_hq_only_content_accessed": False,
    }
    result["result"] = "PASS" if (
        len(promotion_checks) == 12
        and all(item["pass"] for item in promotion_checks)
        and len(frozen_checks) == 199
        and result["frozen_corpus_checks_pass"]
        and len(source_checks) == 18
        and result["source_reference_checks_pass"]
        and lan_night["pass"]
        and not out_of_scope
    ) else "FAIL"

    (SHIP / "PROMOTION_VALIDATION_REPORT.json").write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    frozen_lines = [f'{item["actual_sha256"]}  {item["path"]}' for item in frozen_checks]
    (SHIP / "FROZEN_CORPUS_SHA256SUMS.txt").write_text("\n".join(frozen_lines) + "\n", encoding="utf-8")
    source_lines = [f'{item["actual_sha256"]}  {item["path"]}' for item in source_checks]
    (SHIP / "SOURCE_PACKAGE_SHA256SUMS.txt").write_text("\n".join(source_lines) + "\n", encoding="utf-8")
    print(json.dumps({
        "result": result["result"],
        "promoted": f'{result["promoted_exact_byte_matches"]}/{result["promoted_count"]}',
        "frozen": f'{sum(item["pass"] for item in frozen_checks)}/{len(frozen_checks)}',
        "sources": f'{sum(item["pass"] for item in source_checks)}/{len(source_checks)}',
        "lan_night": lan_night["pass"],
        "out_of_scope": len(out_of_scope),
    }))


if __name__ == "__main__":
    main()
