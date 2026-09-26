#!/usr/bin/env python3
"""Validate ART SHIP 012 candidates and source-preservation contracts."""

from __future__ import annotations

import hashlib
import json
import subprocess
from pathlib import Path

from PIL import Image


SHIP = Path(__file__).resolve().parents[1]
REPO = SHIP.parents[2]
BASE = "c6a49410e558be34aa44703015556c00a4e592c9"
EXPECTED = {
    "portobello_manager": ("portobello_manager_neutral_80x96.png", "0e69dc024e59fc9dbd5bed7944081fbc9f83226ba44d7c9c16b3c9b6d68ff26c", 16),
    "auntie": ("auntie_register_neutral_80x96.png", "cf5ae278f87c9a339ac15c115f9a754f78cd58d6efa2e289515f90036ae9836e", 18),
    "soul": ("ocean_soul_climbing_80x96.png", "21b21879c070ba61944091683201eb89c57a18e05731f66f5fce3e687ed8dbd1", 12),
    "training_dummy": ("training_dummy_combat_80x96.png", "e30e3189af01afdd05300fc913ea541aab0e0f1f8c88704a094afac2b5f9face", 14),
    "buckhead": ("buckhead_vampire_neutral_80x96.png", "26bc338ca53b12aac0b051189745dadba4b4fb6d29c745e85253fa8c8e01265c", 17),
}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def check_candidate(asset_id: str, spec: tuple[str, str, int]) -> dict[str, object]:
    name, expected_hash, max_colors = spec
    path = SHIP / "candidates/native/characters" / name
    image = Image.open(path).convert("RGBA")
    alpha = image.getchannel("A")
    bbox = alpha.getbbox()
    colors = {rgb for rgb, a in zip(image.convert("RGB").getdata(), alpha.getdata()) if a}
    actual = sha256(path)
    passed = (
        image.size == (80, 96)
        and sorted(set(alpha.getdata())) == [0, 255]
        and bbox is not None
        and bbox[3] - 1 == 88
        and len(colors) <= max_colors
        and actual == expected_hash
    )
    return {
        "runtime_asset_id": asset_id,
        "path": path.relative_to(REPO).as_posix(),
        "dimensions": list(image.size),
        "mode": "RGBA",
        "alpha_values": sorted(set(alpha.getdata())),
        "opaque_bbox": list(bbox) if bbox else None,
        "opaque_colors": len(colors),
        "maximum_colors": max_colors,
        "contact": [40, 88],
        "sha256": actual,
        "expected_sha256": expected_hash,
        "pass": passed,
    }


def frozen_checks() -> tuple[int, list[dict[str, str]]]:
    register = json.loads((REPO / "art_department/ASSET_REGISTER.json").read_text(encoding="utf-8"))
    entries = [entry for entry in register["assets"] if entry.get("status") == "FROZEN"]
    failures = []
    for entry in entries:
        path = REPO / entry["path"]
        actual = sha256(path) if path.is_file() else "MISSING"
        if actual != entry["sha256"]:
            failures.append({"path": entry["path"], "expected": entry["sha256"], "actual": actual})
    return len(entries), failures


def changed_files() -> list[str]:
    tracked = subprocess.run(["git", "diff", "--name-only", BASE, "--"], cwd=REPO, text=True, capture_output=True, check=True).stdout.splitlines()
    untracked = subprocess.run(["git", "ls-files", "--others", "--exclude-standard"], cwd=REPO, text=True, capture_output=True, check=True).stdout.splitlines()
    return sorted(set(tracked + untracked))


def main() -> int:
    candidates = [check_candidate(asset_id, spec) for asset_id, spec in EXPECTED.items()]
    frozen_count, frozen_failures = frozen_checks()
    changes = changed_files()
    runtime_changes = [p for p in changes if p.startswith(("js/", "css/", "index.html", "tools/build/", "package"))]
    forbidden = [p for p in changes if "playmakers" in p.lower() or "sealed" in p.lower()]
    json_paths = list(SHIP.glob("*.json")) + [REPO / "art_department/ASSET_REGISTER.json", REPO / "art_department/CURRENT_OPEN_ART_GAPS.json"]
    json_failures = []
    for path in json_paths:
        try:
            json.loads(path.read_text(encoding="utf-8"))
        except Exception as exc:  # noqa: BLE001
            json_failures.append({"path": path.relative_to(REPO).as_posix(), "error": str(exc)})
    report = {
        "ship_id": "ART SHIP 012",
        "status": "CANDIDATE — HQ REVIEW REQUIRED",
        "candidate_count": len(candidates),
        "candidate_contracts_pass": all(item["pass"] for item in candidates),
        "candidates": candidates,
        "frozen_assets_checked": frozen_count,
        "frozen_hash_failures": frozen_failures,
        "source_integrity_pass": not frozen_failures,
        "runtime_files_changed": runtime_changes,
        "runtime_boundary_pass": not runtime_changes,
        "forbidden_boundary_changes": forbidden,
        "forbidden_boundary_pass": not forbidden,
        "json_files_checked": len(json_paths),
        "json_failures": json_failures,
        "json_pass": not json_failures,
        "review_boards": sorted(path.relative_to(REPO).as_posix() for path in (SHIP / "review").glob("*.png")),
        "review_board_count": len(list((SHIP / "review").glob("*.png"))),
        "approval_claimed": False,
        "frozen_claimed": False,
        "runtime_status_changed": False
    }
    overall = all([
        report["candidate_contracts_pass"], report["source_integrity_pass"], report["runtime_boundary_pass"],
        report["forbidden_boundary_pass"], report["json_pass"], report["review_board_count"] == 5,
    ])
    report["overall_pass"] = overall
    (SHIP / "CANDIDATE_VALIDATION_REPORT.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    lines = ["# ART SHIP 012 candidate SHA-256", "", "Status: CANDIDATE — HQ REVIEW REQUIRED", ""]
    lines.extend(f"{item['sha256']}  {item['path']}" for item in candidates)
    (SHIP / "CANDIDATE_SHA256SUMS.txt").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({"overall_pass": overall, "candidate_contracts_pass": report["candidate_contracts_pass"], "frozen_assets_checked": frozen_count, "frozen_hash_failures": len(frozen_failures), "runtime_files_changed": len(runtime_changes), "review_boards": report["review_board_count"]}, indent=2))
    return 0 if overall else 1


if __name__ == "__main__":
    raise SystemExit(main())
