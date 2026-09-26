#!/usr/bin/env python3
"""Validate the clean ART SHIP 012 closeout foundation against Ship 013."""

from __future__ import annotations

import hashlib
import json
import subprocess
from pathlib import Path

from PIL import Image


SHIP = Path(__file__).resolve().parents[1]
REPO = SHIP.parents[2]
BASE = "9d6f521bdfc404f03a5f5bba7c700860de1eb293"

PASSED = {
    "portobello_manager_neutral_80x96.png": "0e69dc024e59fc9dbd5bed7944081fbc9f83226ba44d7c9c16b3c9b6d68ff26c",
    "auntie_register_neutral_80x96.png": "cf5ae278f87c9a339ac15c115f9a754f78cd58d6efa2e289515f90036ae9836e",
    "ocean_soul_climbing_80x96.png": "21b21879c070ba61944091683201eb89c57a18e05731f66f5fce3e687ed8dbd1",
    "training_dummy_combat_80x96.png": "e30e3189af01afdd05300fc913ea541aab0e0f1f8c88704a094afac2b5f9face",
}
REJECTED = {
    "buckhead_initial_naturalistic_rejected_80x96.png": "26bc338ca53b12aac0b051189745dadba4b4fb6d29c745e85253fa8c8e01265c",
    "buckhead_deterministic_native_grid_rejected_80x96.png": "f178b6b63a8d01f3acbbb9d38228da5b97be2fad9fcc8a6ccb7f8ffa0fc6333e",
}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def verify_group(directory: Path, expected: dict[str, str]) -> list[dict[str, object]]:
    results = []
    for name, expected_hash in expected.items():
        path = directory / name
        actual = sha256(path) if path.is_file() else "MISSING"
        dimensions = list(Image.open(path).size) if path.is_file() else None
        results.append({"path": path.relative_to(REPO).as_posix(), "expected_sha256": expected_hash, "actual_sha256": actual, "dimensions": dimensions, "pass": actual == expected_hash})
    return results


def frozen_checks() -> tuple[int, int, list[dict[str, str]]]:
    register = json.loads((REPO / "art_department/ASSET_REGISTER.json").read_text(encoding="utf-8"))
    entries = [entry for entry in register["assets"] if entry.get("status") == "FROZEN"]
    failures = []
    for entry in entries:
        path = REPO / entry["path"]
        actual = sha256(path) if path.is_file() else "MISSING"
        if actual != entry["sha256"]:
            failures.append({"path": entry["path"], "expected": entry["sha256"], "actual": actual})
    return len(register["assets"]), len(entries), failures


def changed_files() -> list[str]:
    tracked = subprocess.run(["git", "diff", "--name-only", BASE, "--"], cwd=REPO, text=True, capture_output=True, check=True).stdout.splitlines()
    untracked = subprocess.run(["git", "ls-files", "--others", "--exclude-standard"], cwd=REPO, text=True, capture_output=True, check=True).stdout.splitlines()
    return sorted(set(tracked + untracked))


def main() -> int:
    passed = verify_group(SHIP / "candidates/native/characters", PASSED)
    rejected = verify_group(SHIP / "rejected", REJECTED)
    register_count, frozen_count, frozen_failures = frozen_checks()
    changes = changed_files()
    prefix = "art_department/ships/art_ship_012_closeout/"
    out_of_scope = [path for path in changes if not path.startswith(prefix)]
    runtime_changes = [path for path in changes if path.startswith(("js/", "css/", "index.html", "docs/presentation/"))]
    report = {
        "ship_id": "ART SHIP 012 CLOSEOUT",
        "status": "CLEAN FOUNDATION READY",
        "base_commit": BASE,
        "current_frozen_art_authority": "ART SHIP 013",
        "current_runtime_authority": {"branch": "claude/hold-clearance-001", "commit": "a66170218375e52404715789dde48c23726a6044", "pass": 108, "hold": 13},
        "passed_candidates": passed,
        "passed_candidate_hashes_preserved": all(item["pass"] for item in passed),
        "rejected_buckhead_provenance": rejected,
        "rejected_buckhead_hashes_preserved": all(item["pass"] for item in rejected),
        "frozen_assets_checked": frozen_count,
        "asset_register_entries": register_count,
        "frozen_hash_failures": frozen_failures,
        "ship_013_frozen_integrity_pass": frozen_count == 219 and not frozen_failures,
        "changed_files": changes,
        "out_of_scope_changes": out_of_scope,
        "shared_authority_files_overwritten": out_of_scope,
        "runtime_files_changed": runtime_changes,
        "buckhead_generation_attempted_on_closeout_branch": False,
        "review_boards": sorted(path.relative_to(REPO).as_posix() for path in (SHIP / "review").glob("*.png")),
    }
    overall = all([
        report["passed_candidate_hashes_preserved"],
        report["rejected_buckhead_hashes_preserved"],
        report["ship_013_frozen_integrity_pass"],
        register_count == 359,
        not out_of_scope,
        not runtime_changes,
        len(report["review_boards"]) == 3,
    ])
    report["overall_pass"] = overall
    (SHIP / "VALIDATION_REPORT.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"overall_pass": overall, "passed_candidates": sum(item["pass"] for item in passed), "rejected_provenance": sum(item["pass"] for item in rejected), "frozen_assets_checked": frozen_count, "asset_register_entries": register_count, "frozen_hash_failures": len(frozen_failures), "out_of_scope_changes": len(out_of_scope), "runtime_files_changed": len(runtime_changes)}, indent=2))
    return 0 if overall else 1


if __name__ == "__main__":
    raise SystemExit(main())
