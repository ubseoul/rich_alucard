#!/usr/bin/env python3
"""Record ART SHIP 013 exact-byte HQ promotion and frozen authority."""

from __future__ import annotations

import json
from pathlib import Path


SHIP = Path(__file__).resolve().parents[1]
REPO = SHIP.parents[2]
CANDIDATE = "eec5c40c45a40dd842ded38f9b87063d67965d3c"
ENGINEERING = "a66170218375e52404715789dde48c23726a6044"
EVIDENCE = [
    "art_department/APPROVAL_LEDGER.md",
    "art_department/ships/art_ship_013/ART_SHIP_MANIFEST.json",
    "art_department/ships/art_ship_013/HQ_DECISION.md",
    "art_department/ships/art_ship_013/PROMOTION_EVIDENCE.json",
    "art_department/ships/art_ship_013/SOURCE_PRESERVATION_EVIDENCE.json",
]

RECORDS = [
    {
        "request_id": "AS13-01", "asset_id": "mom", "state": "default/neutral family-holiday standing state",
        "candidate": "art_department/ships/art_ship_013/candidates/native/characters/mom_neutral_80x96.png",
        "production": "assets/before_the_fame/characters/mom/mom_neutral_80x96.png",
        "sha256": "2fbbf02d8ddfc9c9fde5a967f54ab25765bf68f8dd569a76f11760d35178fa4d",
        "role": "approved fictional Nigerian-American family identity anchor; Mom",
        "category": "CHARACTER_ANCHOR", "surfaces": ["family_house|left:mom,mid:rich,right:dad"],
    },
    {
        "request_id": "AS13-02", "asset_id": "dad", "state": "default/neutral family-holiday standing state",
        "candidate": "art_department/ships/art_ship_013/candidates/native/characters/dad_neutral_80x96.png",
        "production": "assets/before_the_fame/characters/dad/dad_neutral_80x96.png",
        "sha256": "5d208ef3c344fa34a2450310ef331f5ae3c0b2e14ee734a3d4b83ffb644eca30",
        "role": "approved fictional Nigerian-American family identity anchor; Dad",
        "category": "CHARACTER_ANCHOR", "surfaces": ["family_house|left:dad,mid:rich", "family_house|left:mom,mid:rich,right:dad"],
    },
    {
        "request_id": "AS13-03", "asset_id": "sister", "state": "default/neutral family-holiday standing state",
        "candidate": "art_department/ships/art_ship_013/candidates/native/characters/sister_neutral_80x96.png",
        "production": "assets/before_the_fame/characters/sister/sister_neutral_80x96.png",
        "sha256": "ecfe922ea7d5c114246897e6050ff1c2d4c9503d151cf47fa41f93812cb1a321",
        "role": "approved fictional Nigerian-American adult sibling identity anchor; Sister",
        "category": "CHARACTER_ANCHOR", "surfaces": ["family_house|left:sister,mid:rich"],
    },
    {
        "request_id": "AS13-04", "asset_id": "portobello_wife", "state": "default/neutral Portobello household state",
        "candidate": "art_department/ships/art_ship_013/candidates/native/characters/portobello_wife_neutral_80x96.png",
        "production": "assets/before_the_fame/characters/portobello_wife/portobello_wife_neutral_80x96.png",
        "sha256": "befad71977141eedcbb05db8d0f0f0f1e08018a54f609ab96c8c0c896f4381cb",
        "role": "approved fictional Portobello-only wife identity anchor",
        "category": "CHARACTER_ANCHOR", "surfaces": ["portobello_bedroom|left:portobello_wife,mid:rich_portobello", "portobello_bedroom|farRight:portobello_kid2,left:portobello_wife,mid:rich_portobello,right:portobello_kid1", "portobello_porch|left:rich_portobello@porch_seated,right:portobello_wife"],
    },
    {
        "request_id": "AS13-05", "asset_id": "portobello_kid1", "state": "default/neutral older-child Portobello household state",
        "candidate": "art_department/ships/art_ship_013/candidates/native/characters/portobello_kid1_neutral_80x96.png",
        "production": "assets/before_the_fame/characters/portobello_kid1/portobello_kid1_neutral_80x96.png",
        "sha256": "cfa3487c650b6180a709d3741c92fdeabe91ed175d1bcf49f5e2a1e82f08b8c6",
        "role": "approved fictional Portobello-only older child identity anchor",
        "category": "CHARACTER_ANCHOR", "surfaces": ["portobello_bedroom|farRight:portobello_kid2,left:portobello_wife,mid:rich_portobello,right:portobello_kid1", "portobello_bedroom|left:portobello_kid1,mid:rich_portobello,right:portobello_kid2"],
    },
    {
        "request_id": "AS13-06", "asset_id": "portobello_kid2", "state": "default/neutral younger-child Portobello household state",
        "candidate": "art_department/ships/art_ship_013/candidates/native/characters/portobello_kid2_neutral_80x96.png",
        "production": "assets/before_the_fame/characters/portobello_kid2/portobello_kid2_neutral_80x96.png",
        "sha256": "ae0d440f797bdeeae61d4884ae341df2a82bde2a1eac23f8a84b8c9ea5e322cb",
        "role": "approved fictional Portobello-only younger child identity anchor",
        "category": "CHARACTER_ANCHOR", "surfaces": ["portobello_bedroom|farRight:portobello_kid2,left:portobello_wife,mid:rich_portobello,right:portobello_kid1", "portobello_bedroom|left:portobello_kid1,mid:rich_portobello,right:portobello_kid2"],
    },
    {
        "request_id": "AS13-07", "asset_id": "rich.hookah_seated.corrected", "state": "corrected seated hookah/hose state",
        "candidate": "art_department/ships/art_ship_013/candidates/native/characters/rich_hookah_seated_corrected_80x96.png",
        "production": "assets/before_the_fame/characters/rich/rich_hookah_seated_corrected_80x96.png",
        "sha256": "c46f395004151d94365601fad9e72a8abba092ef03669dca71f2e492f8917634",
        "role": "approved Rich identity-continuity correction; seated hookah state",
        "category": "CHARACTER_STATE_DELTA", "surfaces": ["minigame:hookah", "minigame:hookah?company=ROOKOKO", "minigame:hookah?company=HOMIES"],
    },
]


def load(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def write(path: Path, data: dict) -> None:
    path.write_text(json.dumps(data, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")


def main() -> None:
    register_path = REPO / "art_department/ASSET_REGISTER.json"
    register = load(register_path)
    if len(register["assets"]) != 352:
        raise SystemExit(f"Expected 352 pre-promotion register entries, found {len(register['assets'])}")
    paths = {item["path"] for item in register["assets"]}
    if any(record["production"] in paths for record in RECORDS):
        raise SystemExit("Refusing duplicate production path")

    original = next(item for item in register["assets"] if item["path"] == "assets/before_the_fame/characters/rich/rich_hookah_seated_80x96.png")
    original["default_style_reference"] = False
    original["superseded_by"] = "assets/before_the_fame/characters/rich/rich_hookah_seated_corrected_80x96.png"
    original["supersession_authority"] = "HQ DECISION — ART SHIP 013: PASS 7/7 / PROMOTE + FREEZE AUTHORIZED"
    original["historical_preservation"] = "Original frozen byte stream remains immutable provenance/history; do not delete or rewrite."

    for record in RECORDS:
        is_rich = record["request_id"] == "AS13-07"
        register["assets"].append({
            "path": record["production"],
            "sha256": record["sha256"],
            "role": record["role"],
            "status": "FROZEN",
            "default_style_reference": True,
            "approval_evidence": EVIDENCE,
            "dimensions": [80, 96],
            "mode": "RGBA",
            "ship_id": "ART SHIP 013",
            "asset_id": record["asset_id"],
            "category": record["category"],
            "state": record["state"],
            "source_anchor": [40, 88],
            "presentation_scale": None,
            "approval_status": "APPROVED MASTER",
            "alpha": [0, 255],
            "freeze_scope": (
                "Exact HQ-accepted 80x96 candidate pixels, RGBA binary alpha and contact (40,88) for the submitted role only. "
                + ("Compact Rich loc mass, shades, warm face, green earring, black fit, bright shoe grammar and seated hookah/hose function are locked. Original source history is preserved. " if is_rich else "No additional state, name, personality, likeness or family canon is inferred. ")
                + "Runtime integration, Presentation Director mapping, PASS/HOLD movement, merge and deployment are excluded."
            ),
            "runtime_surfaces": record["surfaces"],
            "runtime_integration_status": "PENDING ENGINEERING INTEGRATION AND RUNTIME QA",
            "source_candidate": {"commit": CANDIDATE, "path": record["candidate"], "sha256": record["sha256"]},
            **({
                "source_master": {"path": "assets/before_the_fame/characters/rich/rich_hookah_seated_80x96.png", "sha256": "c260180a4b3636fc2765534e0053abd1cab25b2ca2c43c83f800e6b55ee20696"},
                "supersedes_at_runtime_mapping": "rich.hookah_seated",
                "authorized_delta_evidence": "art_department/ships/art_ship_013/SOURCE_PRESERVATION_EVIDENCE.json",
            } if is_rich else {}),
        })
    write(register_path, register)

    manifest_path = SHIP / "ART_SHIP_MANIFEST.json"
    manifest = load(manifest_path)
    manifest.update({
        "status": "APPROVED MASTER / FROZEN / COMPLETE",
        "accepted_candidate_checkpoint": CANDIDATE,
        "promotion_authority": "HQ DECISION — ART SHIP 013: PASS 7/7 / PROMOTE + FREEZE AUTHORIZED",
        "approval_claimed": True,
        "frozen_claimed": True,
        "frozen_corpus_before": 212,
        "frozen_corpus_after": 219,
        "register_entries_before": 352,
        "register_entries_after": 359,
        "current_runtime_authority": {"branch": "claude/hold-clearance-001", "commit": ENGINEERING, "pass": 108, "hold": 13, "changed_by_this_ship": False},
        "promotion_policy": "All seven exact candidate byte streams promoted without regeneration, redraw, retouch, resize, recolor, repalette, reinterpretation, optimization or re-encoding.",
        "freeze_scope": "The seven exact submitted PNG byte streams, submitted roles, 80x96 RGBA binary-alpha contracts and contact (40,88). Runtime integration, PASS/HOLD movement, additional identities/states, merge and deployment are excluded.",
        "stop_point": "ART SHIP 013 — APPROVED MASTER / FROZEN / COMPLETE — READY FOR HQ HANDOFF",
    })
    by_id = {record["request_id"]: record for record in RECORDS}
    for item in manifest["files"]:
        record = by_id[item["id"]]
        item.update({
            "candidate_path": record["candidate"],
            "production_path": record["production"],
            "path": record["production"],
            "approval_status": "APPROVED MASTER / FROZEN",
        })
    write(manifest_path, manifest)

    package = load(SHIP / "CANDIDATE_PACKAGE_MANIFEST.json")
    package["status"] = "APPROVED MASTER / FROZEN / COMPLETE"
    package["accepted_candidate_checkpoint"] = CANDIDATE
    package["approval"] = {"approved": True, "frozen": True, "runtime_integrated": False}
    write(SHIP / "CANDIDATE_PACKAGE_MANIFEST.json", package)

    runtime = load(SHIP / "RUNTIME_DEMAND_MAP.json")
    runtime["status"] = "APPROVED MASTER / FROZEN — PENDING ENGINEERING INTEGRATION AND RUNTIME QA"
    runtime["current_runtime_authority"] = {"branch": "claude/hold-clearance-001", "commit": ENGINEERING, "pass": 108, "hold": 13, "changed_by_this_ship": False}
    for item in runtime["assets"]:
        item["candidate_status"] = "APPROVED MASTER / FROZEN — PENDING ENGINEERING INTEGRATION AND RUNTIME QA"
    write(SHIP / "RUNTIME_DEMAND_MAP.json", runtime)

    states = load(SHIP / "STATE_LAYER_DEFINITIONS.json")
    states["status"] = "APPROVED MASTER / FROZEN — PENDING ENGINEERING INTEGRATION AND RUNTIME QA"
    write(SHIP / "STATE_LAYER_DEFINITIONS.json", states)

    print(json.dumps({"promoted": len(RECORDS), "frozen_corpus_after": 219, "register_entries_after": len(register["assets"])}, indent=2))


if __name__ == "__main__":
    main()
