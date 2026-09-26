"""Record the exact-byte ART SHIP 011 HQ promotion without touching PNG bytes."""
from __future__ import annotations

import json
from pathlib import Path


SHIP = Path(__file__).resolve().parents[1]
REPO = SHIP.parents[2]
CANDIDATE_CHECKPOINT = "28aa98c8ab04a643d175192b1aecb9ae7b372c76"
EVIDENCE = [
    "art_department/APPROVAL_LEDGER.md",
    "art_department/ships/art_ship_011/ART_SHIP_MANIFEST.json",
    "art_department/ships/art_ship_011/HQ_DECISION.md",
    "art_department/ships/art_ship_011/PROMOTION_EVIDENCE.json",
    "art_department/ships/art_ship_011/SOURCE_PRESERVATION_EVIDENCE.json",
]


def load(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def write(path: Path, data: dict) -> None:
    path.write_text(json.dumps(data, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")


def main() -> None:
    register_path = REPO / "art_department/ASSET_REGISTER.json"
    register = load(register_path)
    entries = [item for item in register["assets"] if item.get("ship_id") == "ART SHIP 011"]
    if len(entries) != 9:
        raise SystemExit(f"Expected 9 Ship 011 register entries, found {len(entries)}")
    for item in entries:
        if item["status"] != "CANDIDATE \u2014 HQ REVIEW REQUIRED":
            raise SystemExit(f"Unexpected pre-promotion status for {item['path']}: {item['status']}")
        item["role"] = item["role"].replace("production-staged", "approved production", 1)
        item["status"] = "FROZEN"
        item["approval_evidence"] = EVIDENCE
        item["approval_status"] = "APPROVED MASTER"
        item["freeze_scope"] = (
            "Exact approved candidate pixels, native dimensions, RGBA binary alpha, origin, contact, stable production ID, "
            "category and documented placement constraints for this anonymous adult population fragment. Runtime screen "
            "assignment, Presentation Director mapping, HOLD movement and environment modification are excluded."
        )
    write(register_path, register)

    manifest_path = SHIP / "ART_SHIP_MANIFEST.json"
    manifest = load(manifest_path)
    manifest.update({
        "status": "APPROVED MASTER / FROZEN / COMPLETE",
        "authorization": "Explicit HQ PASS supplied for all 9/9 exact candidate byte streams at the accepted candidate checkpoint.",
        "approval_claimed": True,
        "frozen_claimed": True,
        "accepted_candidate_checkpoint": CANDIDATE_CHECKPOINT,
        "promotion_authority": "HQ PASS \u2014 ART SHIP 011",
        "frozen_corpus_before": 203,
        "frozen_corpus_after": 212,
        "register_entries_before": 352,
        "register_entries_after": 352,
        "promotion_policy": "All nine submitted native candidates promoted and frozen byte-for-byte; no regeneration, redraw, retouch, resize, palette change, re-encoding or reinterpretation.",
        "freeze_scope": "The exact nine production PNG byte streams, stable IDs, native dimensions, RGBA binary-alpha contracts, contacts/origins, categories and placement constraints. Runtime placement, Presentation Director mappings, environments, HOLD status, merge and deployment are excluded.",
        "stop_point": "ART SHIP 011 \u2014 FROZEN",
    })
    for item in manifest["files"]:
        item["approval_status"] = "APPROVED MASTER / FROZEN"
    write(manifest_path, manifest)

    runtime_path = SHIP / "RUNTIME_DEMAND_MAP.json"
    runtime = load(runtime_path)
    runtime["status"] = "APPROVED MASTER / FROZEN \u2014 NO RUNTIME ASSIGNMENT"
    runtime["purpose"] = "Frozen reusable population library; specific runtime screens remain intentionally unassigned."
    for item in runtime["entries"]:
        item["status"] = "APPROVED MASTER / FROZEN \u2014 NO RUNTIME ASSIGNMENT"
    write(runtime_path, runtime)

    states_path = SHIP / "STATE_LAYER_DEFINITIONS.json"
    states = load(states_path)
    states["status"] = "APPROVED MASTER / FROZEN \u2014 NO RUNTIME ASSIGNMENT"
    write(states_path, states)

    promotion_path = SHIP / "PROMOTION_EVIDENCE.json"
    promotion = load(promotion_path)
    promotion["status"] = "PASS \u2014 APPROVED MASTER / FROZEN"
    promotion["accepted_candidate_checkpoint"] = CANDIDATE_CHECKPOINT
    for item in promotion["records"]:
        item["approval_status"] = "APPROVED MASTER / FROZEN"
    write(promotion_path, promotion)

    provenance = load(SHIP / "SOURCE_PROVENANCE.json")
    source_evidence = {
        "ship_id": "ART SHIP 011",
        "status": "PASS \u2014 APPROVED MASTER / FROZEN promotion",
        "accepted_candidate_checkpoint": CANDIDATE_CHECKPOINT,
        "exploratory_source_commit": provenance["source_commit"],
        "records": [
            {
                "asset_id": item["asset_id"],
                "selected_design_source_path": item["selected_design_source_path"],
                "selected_design_source_sha256": item["selected_design_source_sha256"],
                "exploratory_native_path": item["exploratory_native_path"],
                "exploratory_native_sha256": item["exploratory_native_sha256"],
                "preserved": True,
            }
            for item in provenance["records"]
        ],
        "canonical_promoted_byte_for_byte": True,
        "runtime_code_changed": False,
        "runtime_placement_authorized": False,
    }
    write(SHIP / "SOURCE_PRESERVATION_EVIDENCE.json", source_evidence)
    print(json.dumps({"register_entries": len(register["assets"]), "promoted": len(entries), "frozen_corpus_after": 212}, indent=2))


if __name__ == "__main__":
    main()
