#!/usr/bin/env python3
"""Promote the Ube/HQ-approved ART SHIP 014 candidate bytes and close Art records."""

from __future__ import annotations

import hashlib
import json
import shutil
from collections import Counter
from datetime import date
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[4]
SHIP = ROOT / "art_department/ships/art_ship_014"
CANDIDATE_MANIFEST = SHIP / "NATIVE_CANDIDATE_MANIFEST_V4.json"
LEDGER_SOURCE = SHIP / "CORRECTED_COMPLETION_LEDGER_V3.json"
REGISTER_PATH = ROOT / "art_department/ASSET_REGISTER.json"
CANONICAL_ROOT = ROOT / "assets/before_the_fame/art_ship_014"
ACCEPTED_LO_SHA = "8da6cea7350c6bc395971067ac0e7f31810fe8fb4263e4a041df4fd65ff0e9ed"
BASE_ART_COMMIT = "920912ff3d006c33d9b002d2436b8e1b0ed83f72"
RUNTIME_COMMIT = "a66170218375e52404715789dde48c23726a6044"


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, value) -> None:
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def package_for(asset_id: str) -> str:
    package = asset_id.split("-", 1)[0]
    if package not in set("ABCDEFGH"):
        raise ValueError(f"Unrecognized package for {asset_id}")
    return package


def category_for(package: str) -> str:
    return {
        "A": "CHARACTER_STATE_OR_VISUAL",
        "B": "CREATURE_STATE",
        "C": "CREATURE_OR_PROP",
        "D": "VEHICLE_ASSET",
        "E": "GEAR_ITEM_UI_TILE",
        "F": "BEDROOM_PROP_OR_OVERLAY",
        "G": "ENVIRONMENT_OR_CONDITION",
        "H": "UI_VISUAL_TREATMENT_REFERENCE",
    }[package]


def main() -> None:
    manifest = load(CANDIDATE_MANIFEST)
    items = manifest["items"]
    assert len(items) == 180 == manifest["count"]
    assert len({x["id"] for x in items}) == 180

    promoted = []
    for item in items:
        src_rel = item["path"]
        src = ROOT / src_rel
        assert src.is_file(), src
        assert sha(src) == item["sha256"], item["id"]
        package = package_for(item["id"])
        dst_rel = f"assets/before_the_fame/art_ship_014/package_{package.lower()}/{src.name}"
        dst = ROOT / dst_rel
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(src, dst)
        assert src.read_bytes() == dst.read_bytes()
        with Image.open(dst) as im:
            dimensions = list(im.size)
            mode = im.mode
            alpha_values = sorted(set(im.getchannel("A").getdata())) if "A" in im.getbands() else []
        assert dimensions == item["dimensions"]
        assert mode == "RGBA"
        assert set(alpha_values).issubset({0, 255})
        promoted.append({
            "id": item["id"],
            "package": package,
            "requirement": item["requirement"],
            "candidate_path": src_rel,
            "production_path": dst_rel,
            "sha256": item["sha256"],
            "dimensions": dimensions,
            "mode": mode,
            "alpha": "binary 0/255",
            "approval_status": "APPROVED MASTER / FROZEN",
            "runtime_integration_status": "PENDING ENGINEERING INTEGRATION AND RUNTIME QA",
            "frozen_anchor": item.get("frozen_anchor"),
            "method": item.get("method"),
        })

    lo = next(x for x in promoted if x["id"] == "A-lo-arm_fall")
    assert lo["sha256"] == ACCEPTED_LO_SHA

    register = load(REGISTER_PATH)
    existing_paths = {x["path"] for x in register["assets"]}
    assert len(register["assets"]) == 364
    for item in promoted:
        assert item["production_path"] not in existing_paths
        note = (
            "UI visual-treatment authority only; example text, values, listings, feeds, and states are not runtime data authority"
            if item["package"] == "H"
            else "Exact Ube/HQ-approved ART SHIP 014 byte stream; submitted role only"
        )
        register["assets"].append({
            "path": item["production_path"],
            "sha256": item["sha256"],
            "role": f"ART SHIP 014 approved {item['requirement']}",
            "status": "FROZEN",
            "default_style_reference": True,
            "approval_evidence": [
                "Ube/HQ Taste Pass — PASS",
                "ART SHIP 014 FINAL PROMOTION + FREEZE authorization",
                "art_department/ships/art_ship_014/HQ_DECISION.md",
            ],
            "dimensions": item["dimensions"],
            "mode": item["mode"],
            "ship_id": "ART SHIP 014",
            "asset_id": item["id"],
            "category": category_for(item["package"]),
            "state": item["requirement"],
            "alpha": item["alpha"],
            "freeze_scope": note,
            "runtime_integration_status": item["runtime_integration_status"],
            "source_candidate": {
                "path": item["candidate_path"],
                "sha256": item["sha256"],
                "accepted_set": "NATIVE_CANDIDATE_MANIFEST_V4.json",
            },
            **({"ui_data_authority": False} if item["package"] == "H" else {}),
        })
    assert len(register["assets"]) == 544
    write_json(REGISTER_PATH, register)

    ledger = load(LEDGER_SOURCE)
    candidate_ids = {x["id"] for x in promoted}
    changed = 0
    promoted_by_id = {x["id"]: x for x in promoted}
    for row in ledger["requirements"]:
        if row["id"] in candidate_ids:
            assert row["status"] == "NATIVE CANDIDATE — PRODUCED", row["id"]
            item = promoted_by_id[row["id"]]
            row["status"] = "APPROVED MASTER / FROZEN"
            row["evidence_path"] = item["production_path"]
            row["evidence_sha256"] = item["sha256"]
            row["evidence_registry_status"] = "FROZEN"
            row["approval"] = "UBE/HQ TASTE PASS — PASS; exact-byte promotion"
            changed += 1
    assert changed == 180
    ledger["schema_version"] = 3
    ledger["art_authority_commit_before_promotion"] = BASE_ART_COMMIT
    ledger["runtime_authority_commit"] = RUNTIME_COMMIT
    ledger["final_status"] = "APPROVED MASTER / FROZEN"
    ledger["counts"] = dict(sorted(Counter(x["status"] for x in ledger["requirements"]).items()))
    assert len(ledger["requirements"]) == 308
    assert ledger["counts"]["APPROVED MASTER / FROZEN"] == 180
    write_json(SHIP / "FINAL_COMPLETION_LEDGER.json", ledger)

    blockers = [x for x in ledger["requirements"] if x["status"] == "BLOCKED BY CANON"]
    mappings = [x for x in ledger["requirements"] if x["status"] == "MAPPING / ENGINEERING DECISION"]
    conditional = [x for x in ledger["requirements"] if x["status"] == "CONDITIONAL — EXISTING ART MUST BE TESTED FIRST"]
    sealed = [x for x in ledger["requirements"] if x["status"] == "SEALED / DO NOT TOUCH"]
    assert len(blockers) == 6 and len(mappings) == 5 and len(conditional) == 6 and len(sealed) == 1

    final_manifest = {
        "schema_version": 1,
        "ship": "ART SHIP 014",
        "status": "APPROVED MASTER / FROZEN / COMPLETE",
        "approval": "UBE/HQ TASTE PASS — PASS",
        "promotion_scope": "Art-only exact-byte promotion; runtime integration excluded",
        "accepted_candidate_manifest": "art_department/ships/art_ship_014/NATIVE_CANDIDATE_MANIFEST_V4.json",
        "accepted_assets": len(promoted),
        "mechanical_validation": "180/180",
        "frozen_corpus_before": 224,
        "frozen_corpus_after": 404,
        "asset_register_before": 364,
        "asset_register_after": 544,
        "corrected_lo_sha256": ACCEPTED_LO_SHA,
        "package_h_authority": "UI VISUAL-TREATMENT AUTHORITY ONLY; displayed example information is not runtime data authority",
        "ship_011_status": "separately frozen/unassigned and unchanged",
        "runtime_authority": {"branch": "claude/hold-clearance-001", "commit": RUNTIME_COMMIT, "pass": 108, "hold": 13, "changed": False},
        "blocked_requirements": [{"id": x["id"], "requirement": x["requirement"], "status": x["status"]} for x in blockers],
        "mapping_requirements": [{"id": x["id"], "requirement": x["requirement"], "status": x["status"]} for x in mappings],
        "conditional_requirements": [{"id": x["id"], "requirement": x["requirement"], "status": x["status"]} for x in conditional],
        "items": promoted,
    }
    write_json(SHIP / "ART_SHIP_MANIFEST.json", final_manifest)

    engineering = {
        "schema_version": 1,
        "ship": "ART SHIP 014",
        "status": "ART APPROVED MASTER / FROZEN — ENGINEERING INTEGRATION PENDING",
        "runtime_changes_in_this_ship": 0,
        "runtime_authority_unchanged": {"branch": "claude/hold-clearance-001", "commit": RUNTIME_COMMIT, "pass": 108, "hold": 13},
        "integration_rule": "Engineering must map only where authorized, integrate exact frozen bytes, and perform runtime/Presentation QA before changing PASS/HOLD.",
        "package_h_rule": "Visual treatment only. Do not bake example names, listings, balances, messages, values, or other static example information into runtime UI.",
        "assets": [{
            "asset_id": x["id"], "package": x["package"], "production_path": x["production_path"],
            "sha256": x["sha256"], "dimensions": x["dimensions"], "requirement": x["requirement"],
            "integration_status": "PENDING ENGINEERING MAPPING/INTEGRATION/QA",
        } for x in promoted],
        "mapping_decisions_remaining": final_manifest["mapping_requirements"],
        "canon_blockers_remaining": final_manifest["blocked_requirements"],
        "conditional_existing_art_tests_remaining": final_manifest["conditional_requirements"],
    }
    write_json(SHIP / "ENGINEERING_ASSET_MAP.json", engineering)

    provenance = {
        "schema_version": 1,
        "ship": "ART SHIP 014",
        "accepted_source": "native_candidates_v4",
        "approval": "UBE/HQ TASTE PASS — PASS",
        "copy_method": "binary file copy; no decode/re-encode, resize, optimization, repaint, or regeneration",
        "candidate_equals_production": all(sha(ROOT / x["candidate_path"]) == sha(ROOT / x["production_path"]) for x in promoted),
        "candidate_count": 180,
        "corrected_lo": {"asset_id": "A-lo-arm_fall", "sha256": ACCEPTED_LO_SHA},
        "base_frozen_corpus": {"count": 224, "authority_commit": BASE_ART_COMMIT, "verification": "see PROMOTION_VALIDATION_REPORT.json"},
        "items": [{"id": x["id"], "candidate_path": x["candidate_path"], "production_path": x["production_path"], "sha256": x["sha256"]} for x in promoted],
    }
    write_json(SHIP / "SOURCE_PROVENANCE.json", provenance)

    (SHIP / "PROMOTED_SHA256SUMS.txt").write_text("".join(f"{x['sha256']}  {x['production_path']}\n" for x in promoted), encoding="utf-8")

    package_counts = Counter(x["package"] for x in promoted)
    decision = """# ART SHIP 014 — Ube/HQ final decision\n\nStatus: **UBE/HQ TASTE PASS — PASS**\n\nUbe/HQ approved the complete 180/180 mechanically validated candidate corpus for exact-byte promotion and freeze. The corrected `A-lo-arm_fall` passes at SHA-256 `8da6cea7350c6bc395971067ac0e7f31810fe8fb4263e4a041df4fd65ff0e9ed`.\n\nPromotion is Art-only. Accepted pixels may not be regenerated, repainted, resampled, optimized, reinterpreted, or otherwise altered. Package H is UI visual-treatment authority only and does not authorize baking static example information into runtime UI. Unresolved identity/canon blockers remain blockers; Ship 011 remains separately frozen/unassigned; runtime/gameplay integration, Engineering/main merge, and deployment are not authorized.\n\n**HQ decision: ART SHIP 014 — APPROVED FOR PROMOTION + FREEZE.**\n"""
    (SHIP / "HQ_DECISION.md").write_text(decision, encoding="utf-8")

    map_md = [
        "# ART SHIP 014 — Engineering asset/mapping handoff", "",
        "Status: **ART APPROVED MASTER / FROZEN — ENGINEERING INTEGRATION PENDING**", "",
        "No runtime/gameplay file is changed by this Art operation. Engineering must map and integrate exact frozen bytes separately, then complete runtime and Presentation QA before changing the accepted 108 PASS / 13 HOLD result.", "",
        "Package H is **UI VISUAL-TREATMENT AUTHORITY** only. Example information in those pixels is not runtime data authority.", "",
        "| Asset ID | Package | Production path | SHA-256 | Requirement |", "|---|---:|---|---|---|",
    ]
    map_md.extend(f"| `{x['id']}` | {x['package']} | `{x['production_path']}` | `{x['sha256']}` | {x['requirement'].replace('|', '/')} |" for x in promoted)
    map_md += ["", "## Decisions and blockers preserved", "", "See `FINAL_COMPLETION_LEDGER.json` for the complete 308-row record. The 5 mapping decisions, 6 conditional existing-art tests, 6 canon blockers, and SEALED exclusion were not converted into completed art or runtime truth.", ""]
    (SHIP / "ENGINEERING_ASSET_MAP.md").write_text("\n".join(map_md), encoding="utf-8")

    index = ROOT / "art_department/APPROVED_ASSET_INDEX.md"
    section = ["", "## ART SHIP 014 — OPEN Visual Completion", "", "All 180 accepted native assets are **APPROVED MASTER / FROZEN** at exact reviewed bytes. Runtime integration is pending and excluded from this Art freeze.", "", "| Asset ID | Path | SHA-256 |", "|---|---|---|"]
    section.extend(f"| `{x['id']}` | `{x['production_path']}` | `{x['sha256']}` |" for x in promoted)
    section += ["", "Package H entries are visual-treatment authority only; example UI information is not runtime data authority. Exact scope and outstanding blockers are recorded in `ships/art_ship_014/ART_SHIP_MANIFEST.json` and `FINAL_COMPLETION_LEDGER.json`.", ""]
    index.write_text(index.read_text(encoding="utf-8").rstrip() + "\n" + "\n".join(section), encoding="utf-8")

    approval_ledger = ROOT / "art_department/APPROVAL_LEDGER.md"
    ledger_section = f"""

## ART SHIP 014 — OPEN VISUAL COMPLETION (recorded {date.today().isoformat()})

48. ART SHIP 014 audited 308 sourced OPEN requirements and produced 180 native candidates while retaining 6 canon blockers, 5 Engineering mapping decisions, 6 conditional existing-art tests and 1 SEALED exclusion. Frozen-source authority, candidate comparison evidence and Ship provenance remain under `ships/art_ship_014/`.
49. Final native validation passed 180/180; candidate duplicates were 0; semantic derivative/frozen unintended equalities were 0; the pre-Ship-014 frozen corpus verified 224/224. The corrected `A-lo-arm_fall` passed Ube/HQ Taste Pass at `{ACCEPTED_LO_SHA}`, while the other 179 accepted candidate bytes remained unchanged.
50. Explicit Ube/HQ decision: **ART SHIP 014 — UBE/HQ TASTE PASS: PASS; APPROVED FOR PROMOTION + FREEZE.** All 180 exact accepted byte streams are now **APPROVED MASTER / FROZEN**. The frozen corpus is **404 assets across 544 Asset Register entries**.

No accepted image was regenerated, decoded/re-encoded, resized, optimized or modified during promotion. Package H is visual-treatment authority only, not runtime-data authority. Unresolved blockers and mapping decisions remain open. Runtime/gameplay integration, PASS/HOLD movement, Engineering/main merge and deployment are excluded. No SEALED material was accessed. ART SHIP 014 is **APPROVED MASTER / FROZEN / COMPLETE**.
"""
    approval_ledger.write_text(approval_ledger.read_text(encoding="utf-8").rstrip() + ledger_section, encoding="utf-8")

    ship_md = f"""# ART SHIP 014 — OPEN VISUAL COMPLETION

Status: **APPROVED MASTER / FROZEN / COMPLETE**

## Freeze result

- Ube/HQ Taste Pass: **PASS**.
- Exact accepted assets promoted: **180/180**.
- Package counts: {', '.join(f'{k}={package_counts[k]}' for k in sorted(package_counts))}.
- Frozen corpus: **404**; Asset Register: **544 entries**.
- Corrected `A-lo-arm_fall`: `{ACCEPTED_LO_SHA}`.
- Every canonical file is byte-for-byte identical to its accepted `native_candidates_v4` source.
- The 308-row completion ledger is preserved as `FINAL_COMPLETION_LEDGER.json`.

## Boundaries preserved

Package H is UI visual-treatment authority only; example information is not runtime data authority. Six canon blockers, five Engineering mapping decisions and six conditional existing-art tests remain accurately open. Ship 011 remains separately frozen/unassigned. Current Engineering authority remains `{RUNTIME_COMMIT}` at **108 PASS / 13 HOLD**.

No runtime/gameplay integration, PASS/HOLD movement, Engineering/main merge, deployment or SEALED access occurred.

## Stop

**ART SHIP 014 — APPROVED MASTER / FROZEN / COMPLETE.**
"""
    (SHIP / "ART_SHIP.md").write_text(ship_md, encoding="utf-8")


if __name__ == "__main__":
    main()
