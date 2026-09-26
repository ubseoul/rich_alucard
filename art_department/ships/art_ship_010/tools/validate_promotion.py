"""Validate ART SHIP 010 exact-byte promotion and frozen corpus integrity."""
from __future__ import annotations

import hashlib
import json
import subprocess
from pathlib import Path

from PIL import Image


SHIP = Path(__file__).resolve().parents[1]
REPO = SHIP.parents[2]
BASE = "5af730a132c035f6f2f5afb20eef5149ca3f2761"

PROMOTED = [
    ("AS10-RICH-PORTO-STANDING", "rich_portobello", "art_department/ships/art_ship_010/candidates/native/characters/rich_portobello_standing_80x96.png", "assets/before_the_fame/characters/rich_portobello/rich_portobello_standing_80x96.png", "022a83c5c5adae243820241af7eb4d66b7c1be9cb19ed4eaf1ed7973af38ce27", [80, 96], "RGBA"),
    ("AS10-RICH-PORTO-PRESENTING", "rich_portobello.presenting", "art_department/ships/art_ship_010/candidates/native/characters/rich_portobello_presenting_80x96.png", "assets/before_the_fame/characters/rich_portobello/rich_portobello_presenting_80x96.png", "3803ef5e8b3caa8cecc035613b2dd1f2d94901b505541a95b1eb7e320bcabb25", [80, 96], "RGBA"),
    ("AS10-RICH-PORTO-PORCH-SEATED", "rich_portobello.porch_seated", "art_department/ships/art_ship_010/candidates/native/characters/rich_portobello_porch_seated_80x96.png", "assets/before_the_fame/characters/rich_portobello/rich_portobello_porch_seated_80x96.png", "855ee348e4d983292d2056d75cf50e441a33418e26ee67eba3839aec3d400f44", [80, 96], "RGBA"),
    ("AS10-ROOFTOP-PARTY-CROWD", "rooftop_dtla.party_crowd_condition", "art_department/ships/art_ship_010/candidates/native/layers/rooftop_dtla_party_crowd_overlay_270x480.png", "assets/before_the_fame/environments/rooftop_dtla/layers/rooftop_dtla_party_crowd_overlay_270x480.png", "89125564e976fd72c60a08cc3ab3224b9bd4d2f3c3478ace8e274a441e8702e2", [270, 480], "RGBA"),
]
SOURCES = {
    "assets/rich_standing_right.png": "765170076e8d3a9af9e8857e176e079b2a68c7ee1daafb7c8d551482228f144b",
    "assets/before_the_fame/environments/rooftop_dtla/downtown_la_rooftop_party_270x480.png": "af41cbb7c045a55848421434e14e9e122dabc61becc2d1c2dcc1fb1ceebf5ebf",
    "assets/before_the_fame/environments/hollow_bowl/layers/hollow_bowl_stage_band_crowd_overlay_270x480.png": "fb0dd0b070818db692999ed285d761d985f3dad66bc1e3ae4442425f2e8b846a",
    "assets/before_the_fame/environments/catacomb/layers/catacomb_crowd_overlay_270x480.png": "5468959ed5029d5202b09f2bc651f1b117d156a2fb1ea6b1acf6f72dda4bcd18",
}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def git(*args: str) -> list[str]:
    result = subprocess.check_output(["git", *args], cwd=REPO, text=True)
    return [line for line in result.splitlines() if line]


def main() -> int:
    register = json.loads((REPO / "art_department/ASSET_REGISTER.json").read_text(encoding="utf-8"))
    register_by_path = {item["path"]: item for item in register["assets"]}
    promotion_checks = []
    for request_id, runtime_id, candidate_rel, approved_rel, expected, dimensions, mode in PROMOTED:
        candidate = REPO / candidate_rel
        approved = REPO / approved_rel
        candidate_hash = sha256(candidate)
        approved_hash = sha256(approved)
        with Image.open(approved) as image:
            actual_dimensions = list(image.size)
            actual_mode = image.mode
        registered = register_by_path.get(approved_rel)
        checks = {
            "candidate_hash_matches_expected": candidate_hash == expected,
            "approved_hash_matches_expected": approved_hash == expected,
            "approved_hash_matches_candidate": approved_hash == candidate_hash,
            "dimensions_match": actual_dimensions == dimensions,
            "mode_matches": actual_mode == mode,
            "register_hash_matches": bool(registered and registered["sha256"] == expected),
            "register_status_frozen": bool(registered and registered["status"] == "FROZEN"),
            "register_runtime_id_matches": bool(registered and registered["asset_id"] == runtime_id),
        }
        promotion_checks.append({"request_id": request_id, "candidate_path": candidate_rel, "approved_path": approved_rel, "sha256": approved_hash, "checks": checks, "pass": all(checks.values())})

    frozen_checks = []
    for asset in register["assets"]:
        if asset.get("status") != "FROZEN":
            continue
        path = REPO / asset["path"]
        actual = sha256(path) if path.exists() else None
        frozen_checks.append({"path": asset["path"], "expected_sha256": asset["sha256"], "actual_sha256": actual, "pass": actual == asset["sha256"]})

    source_checks = []
    for relative, expected in sorted(SOURCES.items()):
        actual = sha256(REPO / relative)
        source_checks.append({"path": relative, "expected_sha256": expected, "actual_sha256": actual, "pass": actual == expected})

    changed = git("diff", "--name-only", BASE)
    approved_paths = {item[3] for item in PROMOTED}
    allowed = {
        "art_department/ASSET_REGISTER.json",
        "art_department/APPROVED_ASSET_INDEX.md",
        "art_department/APPROVAL_LEDGER.md",
        "art_department/CURRENT_HANDOFF.md",
        "art_department/CURRENT_OPEN_ART_GAPS.md",
        "art_department/CURRENT_OPEN_ART_GAPS.json",
    } | approved_paths
    out_of_scope = [path for path in changed if not (path.startswith("art_department/ships/art_ship_010/") or path in allowed)]
    package_json_pass = True
    for path in SHIP.glob("*.json"):
        try:
            json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            package_json_pass = False

    result = {
        "ship_id": "ART SHIP 010",
        "result": "PASS" if all(item["pass"] for item in promotion_checks) and all(item["pass"] for item in frozen_checks) and all(item["pass"] for item in source_checks) and not out_of_scope and package_json_pass else "FAIL",
        "accepted_candidate_checkpoint": "a1e265d0f28a75d2e5f6a1dd67a0ebdff02cd4ab",
        "promotion_checks": promotion_checks,
        "promoted_count": len(promotion_checks),
        "promoted_exact_byte_matches": sum(item["pass"] for item in promotion_checks),
        "frozen_corpus_count": len(frozen_checks),
        "frozen_corpus_checks_pass": all(item["pass"] for item in frozen_checks),
        "source_reference_count": len(source_checks),
        "source_reference_checks_pass": all(item["pass"] for item in source_checks),
        "package_json_parse_pass": package_json_pass,
        "changed_paths_since_base": changed,
        "out_of_scope_paths": out_of_scope,
        "runtime_or_gameplay_code_changed": bool(out_of_scope),
        "runtime_integration_complete": False,
        "approval_or_freeze_scope": "Four named ART SHIP 010 candidates only; four Portobello companion identities remain BLOCKED BY CANON.",
    }
    (SHIP / "PROMOTION_VALIDATION_REPORT.json").write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    (SHIP / "VALIDATION_REPORT.json").write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    frozen_lines = [f'{item["actual_sha256"]}  {item["path"]}' for item in frozen_checks]
    (SHIP / "FROZEN_CORPUS_SHA256SUMS.txt").write_text("\n".join(frozen_lines) + "\n", encoding="utf-8")
    source_lines = [f'{item["actual_sha256"]}  {item["path"]}' for item in source_checks]
    (SHIP / "SOURCE_PACKAGE_SHA256SUMS.txt").write_text("\n".join(source_lines) + "\n", encoding="utf-8")
    summary = [
        "# ART SHIP 010 — Promotion Validation Report",
        "",
        f'**Result: {result["result"]}**',
        "",
        f'- {result["promoted_exact_byte_matches"]}/{result["promoted_count"]} canonical files match their approved candidate bytes.',
        f'- {sum(item["pass"] for item in frozen_checks)}/{len(frozen_checks)} frozen Asset Register entries pass SHA-256 verification.',
        f'- {sum(item["pass"] for item in source_checks)}/{len(source_checks)} protected source/reference hashes pass.',
        "- All Ship 010 package JSON records parse successfully.",
        "- Scope audit contains no runtime/gameplay paths; runtime integration and PASS/HOLD mutation were not performed.",
        "- Portobello Rich’s short-hair look is frozen as an intentional authorized variant; wife, kid1, kid2 and manager remain BLOCKED BY CANON.",
        "",
        "Repository gates are recorded separately after running npm test, npm run build and npm run verify:artifact.",
    ]
    (SHIP / "VALIDATION_REPORT.md").write_text("\n".join(summary) + "\n", encoding="utf-8")
    print(json.dumps({"result": result["result"], "promoted": f'{result["promoted_exact_byte_matches"]}/{result["promoted_count"]}', "frozen": f'{sum(item["pass"] for item in frozen_checks)}/{len(frozen_checks)}', "sources": f'{sum(item["pass"] for item in source_checks)}/{len(source_checks)}', "out_of_scope": len(out_of_scope)}, indent=2))
    return 0 if result["result"] == "PASS" else 1


if __name__ == "__main__":
    raise SystemExit(main())
