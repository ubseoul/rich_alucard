#!/usr/bin/env python3
"""Update the machine-readable current gap record after Ship 014 freeze."""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
path = ROOT / "art_department/CURRENT_OPEN_ART_GAPS.json"
value = json.loads(path.read_text(encoding="utf-8"))
value["schema_version"] = 4
value["recorded_date"] = "2026-09-27"
value["frozen_snapshot"]["frozen_corpus_assets"] = 404
value["frozen_snapshot"]["register_entries"] = 544
value["ship_014"] = {
    "status": "APPROVED MASTER / FROZEN / COMPLETE",
    "approved_frozen_assets": 180,
    "mechanical_validation": "180/180",
    "candidate_duplicate_groups": 0,
    "semantic_derivative_frozen_unintended_equalities": 0,
    "pre_ship_014_frozen_verification": "224/224",
    "corrected_lo_sha256": "8da6cea7350c6bc395971067ac0e7f31810fe8fb4263e4a041df4fd65ff0e9ed",
    "runtime_integration": "PENDING ENGINEERING MAPPING/INTEGRATION/QA",
    "runtime_pass_hold_changed": False,
    "package_h_authority": "UI VISUAL-TREATMENT AUTHORITY ONLY; example information is not runtime data authority",
    "ship_011": "separately frozen/unassigned and unchanged",
    "manifest": "art_department/ships/art_ship_014/ART_SHIP_MANIFEST.json",
    "completion_ledger": "art_department/ships/art_ship_014/FINAL_COMPLETION_LEDGER.json",
    "engineering_handoff": "art_department/ships/art_ship_014/ENGINEERING_ASSET_MAP.json"
}
value["missing_environment_ids"] = ["catacomb_dead", "halloween"]
value["missing_identity_ids"] = ["brother1", "brother2", "god", "og_hooper"]
value["blocked_by_canon"] = [
    "A-family-brother1",
    "A-family-brother2",
    "A-family-brother1-avatar",
    "A-family-brother2-avatar",
    "A-god",
    "A-og-hooper"
]
value["ship_014_mapping_engineering_decisions"] = ["C-big-fish", "D-runtime-delivery", "D-runtime-damaged", "G-env-catacomb_dead", "G-env-halloween"]
value["ship_014_conditional_existing_art_tests"] = ["A-RICH-hungover", "A-RICH-portobello_wake", "D-supra-world", "E-cube", "G-castle_party", "G-grave"]
value["excluded"] = list(dict.fromkeys(value.get("excluded", []) + ["Ship 014 runtime/gameplay integration without separate HQ authorization", "using Package H example information as runtime data authority", "SEALED/HQ-only material"]))
value["recommended_next_step"] = "HQ verifies the Art return; Engineering may later perform a separately authorized integration from the Ship 014 Engineering map. Art stops."
path.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
