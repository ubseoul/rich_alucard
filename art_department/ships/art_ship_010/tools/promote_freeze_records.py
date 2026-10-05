"""Append the four HQ-approved ART SHIP 010 assets to the Asset Register.

This is an exact-byte promotion record helper. It never decodes, resizes,
re-encodes or otherwise mutates a promoted PNG.
"""
from __future__ import annotations

import json
from pathlib import Path


REPO = Path(__file__).resolve().parents[4]
REGISTER_PATH = REPO / "art_department" / "ASSET_REGISTER.json"
EVIDENCE = [
    "art_department/APPROVAL_LEDGER.md",
    "art_department/ships/art_ship_010/ART_SHIP_MANIFEST.json",
    "art_department/ships/art_ship_010/HQ_DECISION.md",
    "art_department/ships/art_ship_010/SOURCE_PRESERVATION_EVIDENCE.json",
]


def character(path: str, sha: str, asset_id: str, state: str, surfaces: list[str]) -> dict:
    return {
        "path": path,
        "sha256": sha,
        "role": "approved production character state; ART SHIP 010 id " + asset_id,
        "status": "FROZEN",
        "default_style_reference": False,
        "approval_evidence": EVIDENCE,
        "dimensions": [80, 96],
        "mode": "RGBA",
        "ship_id": "ART SHIP 010",
        "asset_id": asset_id,
        "category": "CHARACTER_STATE",
        "state": state,
        "source_anchor": [40, 88],
        "presentation_scale": None,
        "approval_status": "APPROVED MASTER",
        "alpha": [0, 255],
        "intentional_variant": "Portobello Rich short-hair transformation is intentional and explicitly authorized by the Portobello visual contract; this is not identity drift. Other Rich states are outside this Ship and remain unchanged.",
        "freeze_scope": "Exact 80x96 approved candidate pixels, binary alpha and contact (40,88) for the named Portobello Rich state only; runtime integration remains pending.",
        "runtime_surfaces": surfaces,
        "runtime_integration_status": "PENDING ENGINEERING INTEGRATION AND RUNTIME QA",
        "source_master": {"path": "assets/rich_standing_right.png", "sha256": "765170076e8d3a9af9e8857e176e079b2a68c7ee1daafb7c8d551482228f144b"},
    }


def main() -> None:
    register = json.loads(REGISTER_PATH.read_text(encoding="utf-8"))
    existing = {item["path"] for item in register["assets"]}
    entries = [
        character(
            "assets/before_the_fame/characters/rich_portobello/rich_portobello_standing_80x96.png",
            "022a83c5c5adae243820241af7eb4d66b7c1be9cb19ed4eaf1ed7973af38ce27",
            "rich_portobello",
            "standing/default intentional Portobello transformation",
            [
                "portobello_bedroom|farRight:portobello_kid2,left:portobello_wife,mid:rich_portobello,right:portobello_kid1",
                "portobello_bedroom|left:portobello_kid1,mid:rich_portobello,right:portobello_kid2",
                "portobello_bedroom|left:portobello_wife,mid:rich_portobello",
            ],
        ),
        character(
            "assets/before_the_fame/characters/rich_portobello/rich_portobello_presenting_80x96.png",
            "3803ef5e8b3caa8cecc035613b2dd1f2d94901b505541a95b1eb7e320bcabb25",
            "rich_portobello.presenting",
            "presenting intentional Portobello transformation",
            ["portobello_office|left:rich_portobello,right:portobello_manager"],
        ),
        character(
            "assets/before_the_fame/characters/rich_portobello/rich_portobello_porch_seated_80x96.png",
            "855ee348e4d983292d2056d75cf50e441a33418e26ee67eba3839aec3d400f44",
            "rich_portobello.porch_seated",
            "porch seated intentional Portobello transformation",
            ["portobello_porch|left:rich_portobello,right:portobello_wife"],
        ),
        {
            "path": "assets/before_the_fame/environments/rooftop_dtla/layers/rooftop_dtla_party_crowd_overlay_270x480.png",
            "sha256": "89125564e976fd72c60a08cc3ab3224b9bd4d2f3c3478ace8e274a441e8702e2",
            "role": "approved production environment condition layer; ART SHIP 010 id rooftop_dtla.party_crowd_condition",
            "status": "FROZEN",
            "default_style_reference": False,
            "approval_evidence": EVIDENCE,
            "dimensions": [270, 480],
            "mode": "RGBA",
            "ship_id": "ART SHIP 010",
            "asset_id": "rooftop_dtla.party_crowd_condition",
            "category": "ENVIRONMENT_CONDITION_LAYER",
            "state": "anonymous rooftop party crowd condition",
            "source_anchor": [0, 0],
            "presentation_scale": None,
            "approval_status": "APPROVED MASTER",
            "alpha": [0, 255],
            "freeze_scope": "Exact 270x480 approved additive condition-layer pixels at exact origin (0,0) for NC-FA-12; frozen rooftop master remains unchanged; layer stays behind named actors and leaves the protected Rich corridor clear.",
            "runtime_surfaces": ["rooftop_dtla|left:rich"],
            "runtime_integration_status": "PENDING ENGINEERING INTEGRATION AND RUNTIME QA",
            "source_master": {"path": "assets/before_the_fame/environments/rooftop_dtla/downtown_la_rooftop_party_270x480.png", "sha256": "af41cbb7c045a55848421434e14e9e122dabc61becc2d1c2dcc1fb1ceebf5ebf"},
            "related_visual_references": [
                {"path": "assets/before_the_fame/environments/hollow_bowl/layers/hollow_bowl_stage_band_crowd_overlay_270x480.png", "sha256": "fb0dd0b070818db692999ed285d761d985f3dad66bc1e3ae4442425f2e8b846a"},
                {"path": "assets/before_the_fame/environments/catacomb/layers/catacomb_crowd_overlay_270x480.png", "sha256": "5468959ed5029d5202b09f2bc651f1b117d156a2fb1ea6b1acf6f72dda4bcd18"},
            ],
            "layer_role": "additive party crowd condition below named actors",
            "draw_order": "frozen base -> party crowd condition -> named actors -> UI",
            "protected_rich_corridor": {"x": [38, 110], "y": [196, 371]},
            "actor_contact_line": 372,
        },
    ]
    duplicate = [item["path"] for item in entries if item["path"] in existing]
    if duplicate:
        raise SystemExit("Register entries already exist: " + ", ".join(duplicate))
    register["assets"].extend(entries)
    REGISTER_PATH.write_text(json.dumps(register, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")
    print(json.dumps({"register_entries": len(register["assets"]), "appended": len(entries)}, indent=2))


if __name__ == "__main__":
    main()
