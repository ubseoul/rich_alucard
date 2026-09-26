#!/usr/bin/env python3
"""Validate the final Buckhead candidate and immutable ART SHIP 012/013 inputs."""

from __future__ import annotations

import hashlib
import json
import subprocess
from pathlib import Path

from PIL import Image


SHIP = Path(__file__).resolve().parents[1]
REPO = SHIP.parents[2]
BASE = "34568801571244b75aeb6c698861a7bf4976fc30"
IMMUTABLE_PASSED = {
    "candidates/native/characters/portobello_manager_neutral_80x96.png": "0e69dc024e59fc9dbd5bed7944081fbc9f83226ba44d7c9c16b3c9b6d68ff26c",
    "candidates/native/characters/auntie_register_neutral_80x96.png": "cf5ae278f87c9a339ac15c115f9a754f78cd58d6efa2e289515f90036ae9836e",
    "candidates/native/characters/ocean_soul_climbing_80x96.png": "21b21879c070ba61944091683201eb89c57a18e05731f66f5fce3e687ed8dbd1",
    "candidates/native/characters/training_dummy_combat_80x96.png": "e30e3189af01afdd05300fc913ea541aab0e0f1f8c88704a094afac2b5f9face",
}
IMMUTABLE_REJECTED = {
    "rejected/buckhead_initial_naturalistic_rejected_80x96.png": "26bc338ca53b12aac0b051189745dadba4b4fb6d29c745e85253fa8c8e01265c",
    "rejected/buckhead_deterministic_native_grid_rejected_80x96.png": "f178b6b63a8d01f3acbbb9d38228da5b97be2fad9fcc8a6ccb7f8ffa0fc6333e",
}
CANDIDATE = SHIP / "candidates/native/characters/buckhead_vampire_neutral_80x96.png"
SOURCE = SHIP / "source_renders/buckhead_final_revision_source.png"
EXPECTED_SOURCE = "1a66de8b753dab31f0d07e296d1dfbd1a0d6de1ff5593fd591b82797b9829f0f"
EXPECTED_CANDIDATE = "710bede4d4372f20cd27956313d6589df528c3ec9b795b3c4e5cc996ea033b97"


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def check_hashes(expected: dict[str, str]) -> list[dict[str, object]]:
    results = []
    for relative, expected_hash in expected.items():
        path = SHIP / relative
        actual = sha256(path) if path.is_file() else "MISSING"
        results.append({"path": path.relative_to(REPO).as_posix(), "expected": expected_hash, "actual": actual, "pass": actual == expected_hash})
    return results


def frozen_checks() -> tuple[int, int, list[dict[str, str]]]:
    register = json.loads((REPO / "art_department/ASSET_REGISTER.json").read_text(encoding="utf-8"))
    frozen = [entry for entry in register["assets"] if entry.get("status") == "FROZEN"]
    failures = []
    for entry in frozen:
        path = REPO / entry["path"]
        actual = sha256(path) if path.is_file() else "MISSING"
        if actual != entry["sha256"]:
            failures.append({"path": entry["path"], "expected": entry["sha256"], "actual": actual})
    return len(register["assets"]), len(frozen), failures


def main() -> int:
    passed = check_hashes(IMMUTABLE_PASSED)
    rejected = check_hashes(IMMUTABLE_REJECTED)
    image = Image.open(CANDIDATE).convert("RGBA")
    alpha_values = sorted(set(image.getchannel("A").getdata()))
    bbox = image.getchannel("A").getbbox()
    source_image = Image.open(SOURCE).convert("RGBA")
    candidate_hash = sha256(CANDIDATE)
    source_hash = sha256(SOURCE)
    register_count, frozen_count, frozen_failures = frozen_checks()
    changed = subprocess.run(["git", "diff", "--name-only", BASE, "--"], cwd=REPO, text=True, capture_output=True, check=True).stdout.splitlines()
    untracked = subprocess.run(["git", "ls-files", "--others", "--exclude-standard"], cwd=REPO, text=True, capture_output=True, check=True).stdout.splitlines()
    changes = sorted(set(changed + untracked))
    prefix = "art_department/ships/art_ship_012_closeout/"
    out_of_scope = [path for path in changes if not path.startswith(prefix)]
    runtime_changes = [path for path in changes if path.startswith(("js/", "css/", "index.html", "docs/presentation/"))]
    boards = sorted(path.relative_to(REPO).as_posix() for path in (SHIP / "review").glob("0[4-9]_*.png"))
    candidate_contract = all([
        list(image.size) == [80, 96],
        image.mode == "RGBA",
        alpha_values == [0, 255],
        bool(bbox and bbox[3] - 1 == 88),
        candidate_hash == EXPECTED_CANDIDATE,
    ])
    source_contract = all([
        source_hash == EXPECTED_SOURCE,
        source_image.mode == "RGBA",
        0 in source_image.getchannel("A").getextrema(),
    ])
    overall = all([
        all(item["pass"] for item in passed),
        all(item["pass"] for item in rejected),
        candidate_contract,
        source_contract,
        register_count == 359,
        frozen_count == 219,
        not frozen_failures,
        not out_of_scope,
        not runtime_changes,
        len(boards) == 6,
    ])
    report = {
        "ship_id": "ART SHIP 012 CLOSEOUT",
        "status": "BUCKHEAD FINAL REVISION — READY FOR HQ REVIEW",
        "foundation_commit": BASE,
        "candidate": {
            "path": CANDIDATE.relative_to(REPO).as_posix(),
            "sha256": candidate_hash,
            "dimensions": list(image.size),
            "mode": image.mode,
            "alpha_values": alpha_values,
            "opaque_bbox": list(bbox) if bbox else None,
            "contact": [40, 88],
            "contact_row_pass": bool(bbox and bbox[3] - 1 == 88),
            "contract_pass": candidate_contract,
        },
        "generated_source": {
            "path": SOURCE.relative_to(REPO).as_posix(),
            "sha256": source_hash,
            "dimensions": list(source_image.size),
            "mode": source_image.mode,
            "method": "built-in ImageGen",
            "contract_pass": source_contract,
        },
        "immutable_hq_passed_candidates": passed,
        "immutable_rejected_provenance": rejected,
        "asset_register_entries": register_count,
        "frozen_assets_checked": frozen_count,
        "frozen_hash_failures": frozen_failures,
        "review_boards": boards,
        "changed_files_from_foundation": changes,
        "out_of_scope_changes": out_of_scope,
        "runtime_files_changed": runtime_changes,
        "self_pass_claimed": False,
        "promoted": False,
        "frozen": False,
        "runtime_integrated": False,
        "overall_pass": overall,
    }
    (SHIP / "BUCKHEAD_FINAL_VALIDATION_REPORT.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "overall_pass": overall,
        "candidate_sha256": candidate_hash,
        "candidate_contract_pass": candidate_contract,
        "source_contract_pass": source_contract,
        "immutable_passed": sum(item["pass"] for item in passed),
        "immutable_rejected": sum(item["pass"] for item in rejected),
        "frozen_assets_checked": frozen_count,
        "frozen_hash_failures": len(frozen_failures),
        "out_of_scope_changes": len(out_of_scope),
        "runtime_files_changed": len(runtime_changes),
        "review_boards": len(boards),
    }, indent=2))
    return 0 if overall else 1


if __name__ == "__main__":
    raise SystemExit(main())
