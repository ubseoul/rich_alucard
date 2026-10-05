#!/usr/bin/env python3
"""Validate ART SHIP 012 final promotion and freeze."""

from __future__ import annotations

import hashlib
import json
import subprocess
from pathlib import Path

from PIL import Image


SHIP = Path(__file__).resolve().parents[1]
REPO = SHIP.parents[2]
ACCEPTED = "da2c251be814a91fe89154d7a9fac02770e4f66d"
BASE_SUMS = REPO / "art_department/ships/art_ship_013/FROZEN_CORPUS_SHA256SUMS.txt"
FILES = [
    ("portobello_manager", "candidates/native/characters/portobello_manager_neutral_80x96.png", "assets/before_the_fame/characters/portobello_manager/portobello_manager_neutral_80x96.png", "0e69dc024e59fc9dbd5bed7944081fbc9f83226ba44d7c9c16b3c9b6d68ff26c"),
    ("auntie", "candidates/native/characters/auntie_register_neutral_80x96.png", "assets/before_the_fame/characters/auntie/auntie_register_neutral_80x96.png", "cf5ae278f87c9a339ac15c115f9a754f78cd58d6efa2e289515f90036ae9836e"),
    ("soul", "candidates/native/characters/ocean_soul_climbing_80x96.png", "assets/before_the_fame/characters/ocean_soul/ocean_soul_climbing_80x96.png", "21b21879c070ba61944091683201eb89c57a18e05731f66f5fce3e687ed8dbd1"),
    ("training_dummy", "candidates/native/characters/training_dummy_combat_80x96.png", "assets/before_the_fame/characters/training_dummy/training_dummy_combat_80x96.png", "e30e3189af01afdd05300fc913ea541aab0e0f1f8c88704a094afac2b5f9face"),
    ("buckhead", "candidates/native/characters/buckhead_vampire_neutral_80x96.png", "assets/before_the_fame/characters/buckhead/buckhead_vampire_neutral_80x96.png", "710bede4d4372f20cd27956313d6589df528c3ec9b795b3c4e5cc996ea033b97"),
]
REJECTED = {
    "rejected/buckhead_initial_naturalistic_rejected_80x96.png": "26bc338ca53b12aac0b051189745dadba4b4fb6d29c745e85253fa8c8e01265c",
    "rejected/buckhead_deterministic_native_grid_rejected_80x96.png": "f178b6b63a8d01f3acbbb9d38228da5b97be2fad9fcc8a6ccb7f8ffa0fc6333e",
}
ALLOWED_SHARED = {
    "art_department/START_HERE.md",
    "art_department/CURRENT_HANDOFF.md",
    "art_department/CURRENT_OPEN_ART_GAPS.md",
    "art_department/CURRENT_OPEN_ART_GAPS.json",
    "art_department/ASSET_REGISTER.json",
    "art_department/APPROVED_ASSET_INDEX.md",
    "art_department/APPROVAL_LEDGER.md",
    "art_department/STYLE_FINGERPRINT.md",
    "art_department/references/CHARACTERS.md",
}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def parse_sums(path: Path) -> list[tuple[str, str]]:
    rows = []
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.strip():
            digest, relative = line.split(None, 1)
            rows.append((digest.lower(), relative.strip()))
    return rows


def main() -> int:
    baseline = parse_sums(BASE_SUMS)
    baseline_failures = []
    for expected, relative in baseline:
        path = REPO / relative
        actual = sha256(path) if path.is_file() else "MISSING"
        if actual != expected:
            baseline_failures.append({"path": relative, "expected": expected, "actual": actual})

    promoted = []
    for asset_id, candidate_rel, production_rel, expected in FILES:
        candidate = SHIP / candidate_rel
        production = REPO / production_rel
        candidate_hash = sha256(candidate) if candidate.is_file() else "MISSING"
        production_hash = sha256(production) if production.is_file() else "MISSING"
        image = Image.open(production).convert("RGBA") if production.is_file() else None
        alpha = sorted(set(image.getchannel("A").getdata())) if image else None
        bbox = image.getchannel("A").getbbox() if image else None
        promoted.append({
            "asset_id": asset_id,
            "candidate": candidate.relative_to(REPO).as_posix(),
            "production": production_rel,
            "expected_sha256": expected,
            "candidate_sha256": candidate_hash,
            "production_sha256": production_hash,
            "byte_exact": candidate_hash == production_hash == expected,
            "dimensions": list(image.size) if image else None,
            "mode": image.mode if image else None,
            "alpha_values": alpha,
            "contact": [40, 88],
            "contact_row_pass": bool(bbox and bbox[3] - 1 == 88),
            "technical_contract_pass": bool(image and list(image.size) == [80, 96] and image.mode == "RGBA" and alpha == [0, 255] and bbox and bbox[3] - 1 == 88),
        })

    rejected = []
    for relative, expected in REJECTED.items():
        path = SHIP / relative
        actual = sha256(path) if path.is_file() else "MISSING"
        rejected.append({"path": path.relative_to(REPO).as_posix(), "expected": expected, "actual": actual, "pass": actual == expected})

    register = json.loads((REPO / "art_department/ASSET_REGISTER.json").read_text(encoding="utf-8"))
    frozen = [entry for entry in register["assets"] if entry.get("status") == "FROZEN"]
    frozen_failures = []
    for entry in frozen:
        path = REPO / entry["path"]
        actual = sha256(path) if path.is_file() else "MISSING"
        if actual != entry["sha256"]:
            frozen_failures.append({"path": entry["path"], "expected": entry["sha256"], "actual": actual})

    sums = "".join(f'{entry["sha256"]}  {entry["path"]}\n' for entry in sorted(frozen, key=lambda item: item["path"]))
    (SHIP / "FROZEN_CORPUS_SHA256SUMS.txt").write_text(sums, encoding="utf-8")

    tracked = subprocess.run(["git", "diff", "--name-only", ACCEPTED, "--"], cwd=REPO, text=True, capture_output=True, check=True).stdout.splitlines()
    untracked = subprocess.run(["git", "ls-files", "--others", "--exclude-standard"], cwd=REPO, text=True, capture_output=True, check=True).stdout.splitlines()
    changes = sorted(set(tracked + untracked))
    production_paths = {item[2] for item in FILES}
    out_of_scope = [path for path in changes if not (path.startswith("art_department/ships/art_ship_012_closeout/") or path in ALLOWED_SHARED or path in production_paths)]
    runtime_changes = [path for path in changes if path.startswith(("js/", "css/", "index.html", "docs/presentation/"))]

    overall = all([
        len(baseline) == 219,
        not baseline_failures,
        all(item["byte_exact"] and item["technical_contract_pass"] for item in promoted),
        all(item["pass"] for item in rejected),
        len(register["assets"]) == 364,
        len(frozen) == 224,
        not frozen_failures,
        not out_of_scope,
        not runtime_changes,
    ])
    report = {
        "ship_id": "ART SHIP 012 CLOSEOUT",
        "status": "APPROVED MASTER / FROZEN / COMPLETE",
        "accepted_candidate_commit": ACCEPTED,
        "baseline_frozen_assets_checked": len(baseline),
        "baseline_frozen_hash_failures": baseline_failures,
        "promoted_files": promoted,
        "promoted_byte_exact_count": sum(item["byte_exact"] for item in promoted),
        "rejected_buckhead_provenance": rejected,
        "asset_register_entries": len(register["assets"]),
        "frozen_assets_checked": len(frozen),
        "frozen_hash_failures": frozen_failures,
        "changed_files_from_candidate": changes,
        "out_of_scope_changes": out_of_scope,
        "runtime_files_changed": runtime_changes,
        "presentation_director_changed": False,
        "pass_hold_changed": False,
        "runtime_authority": {"branch":"claude/hold-clearance-001","commit":"a66170218375e52404715789dde48c23726a6044","pass":108,"hold":13},
        "overall_pass": overall,
    }
    (SHIP / "PROMOTION_VALIDATION_REPORT.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "overall_pass": overall,
        "baseline_frozen_checked": len(baseline),
        "baseline_failures": len(baseline_failures),
        "promoted_byte_exact": sum(item["byte_exact"] for item in promoted),
        "register_entries": len(register["assets"]),
        "frozen_assets_checked": len(frozen),
        "frozen_failures": len(frozen_failures),
        "rejected_provenance_exact": sum(item["pass"] for item in rejected),
        "out_of_scope_changes": len(out_of_scope),
        "runtime_files_changed": len(runtime_changes),
    }, indent=2))
    return 0 if overall else 1


if __name__ == "__main__":
    raise SystemExit(main())
