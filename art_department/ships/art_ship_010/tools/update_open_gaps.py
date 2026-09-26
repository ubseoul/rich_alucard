"""Update current Art open-gap state after ART SHIP 010 freeze."""
from __future__ import annotations

import json
from pathlib import Path


REPO = Path(__file__).resolve().parents[4]
path = REPO / "art_department" / "CURRENT_OPEN_ART_GAPS.json"
data = json.loads(path.read_text(encoding="utf-8"))
data["recorded_date"] = "2026-09-26"
data["runtime_authority"] = {
    "branch": "origin/claude/art-ship-009-integration",
    "commit": "5af730a132c035f6f2f5afb20eef5149ca3f2761",
    "sources": ["docs/art_integration/README.md", "docs/art_integration/INTEGRATION_MATRIX.json", "docs/presentation/NEEDS_CREATIVE.md"],
}
snapshot = data["frozen_snapshot"]
snapshot.update({
    "frozen_corpus_assets": 203,
    "register_entries": 343,
    "ship_004_010_handoff_files": 183,
    "ship_009_approved_pending_integration_runtime_qa": 12,
    "ship_010_approved_pending_integration_runtime_qa": 4,
})
data["runtime_snapshot"].update({"pass_final_art": 105, "hold": 16})
data["ship_010_pending_integration"] = [
    {
        "id": "NC-FA-07",
        "severity": "BLOCKING",
        "held_screens": 5,
        "frozen_assets": 3,
        "blocked_identities": ["portobello_wife", "portobello_kid1", "portobello_kid2", "portobello_manager"],
        "art_status": "Rich states APPROVED MASTER / FROZEN; four companion identities BLOCKED BY CANON — PENDING ENGINEERING INTEGRATION AND RUNTIME QA",
    },
    {
        "id": "NC-FA-12",
        "severity": "BLOCKING",
        "held_screens": 1,
        "frozen_assets": 1,
        "art_status": "APPROVED MASTER / FROZEN — PENDING ENGINEERING INTEGRATION AND RUNTIME QA",
    },
]
for identity in ["portobello_wife", "portobello_kid1", "portobello_kid2", "portobello_manager"]:
    if identity not in data["missing_identity_ids"]:
        data["missing_identity_ids"].append(identity)
canon_note = "Portobello wife, kid1, kid2 and manager identities have no committed OPEN/GUIDED visual cards"
if canon_note not in data["blocked_by_canon"]:
    data["blocked_by_canon"].append(canon_note)
data["ship_010_forecast"] = {
    "frozen_assets": 4,
    "rooftop_hold_potentially_cleared": 1,
    "projected_pass_after_rooftop_integration": 106,
    "projected_hold_after_rooftop_integration": 15,
    "portobello_screens_remain_blocked_until_companion_identities_exist": 5,
    "promotion_complete": True,
    "runtime_integration_complete": False,
    "forecast_is_current_runtime_acceptance": False,
    "map": "art_department/ships/art_ship_010/RUNTIME_DEMAND_MAP.json",
}
data["ship_010_status"] = "APPROVED MASTER / FROZEN / COMPLETE"
data["accepted_candidate_checkpoint"] = "a1e265d0f28a75d2e5f6a1dd67a0ebdff02cd4ab"
data["recommended_next_step"] = "Engineering integrates the 16 pending frozen Ship 009/010 assets and mappings, performs Presentation Director review including PD-W1-04, and reruns Integration Matrix/runtime visual QA before PASS/HOLD changes."
path.write_text(json.dumps(data, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")
print(json.dumps({"frozen_corpus_assets": snapshot["frozen_corpus_assets"], "register_entries": snapshot["register_entries"], "pass": data["runtime_snapshot"]["pass_final_art"], "hold": data["runtime_snapshot"]["hold"]}, indent=2))
