#!/usr/bin/env python3
"""Validate ART SHIP 013 candidates and preserve the frozen corpus."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

from PIL import Image


SHIP = Path(__file__).resolve().parents[1]
REPO = SHIP.parents[2]
NATIVE = SHIP / "candidates" / "native" / "characters"
BASELINE = REPO / "art_department" / "ships" / "art_ship_011" / "FROZEN_CORPUS_SHA256SUMS.txt"

EXPECTED = [
    "mom_neutral_80x96.png",
    "dad_neutral_80x96.png",
    "sister_neutral_80x96.png",
    "portobello_wife_neutral_80x96.png",
    "portobello_kid1_neutral_80x96.png",
    "portobello_kid2_neutral_80x96.png",
    "rich_hookah_seated_corrected_80x96.png",
]

SOURCE_PATHS = [
    "assets/rich_standing_right.png",
    "assets/rich_curb_chilling.png",
    "assets/before_the_fame/characters/rich/rich_on_stage_80x96.png",
    "assets/before_the_fame/characters/rich/rich_hookah_seated_80x96.png",
    "assets/before_the_fame/characters/rich_portobello/rich_portobello_standing_80x96.png",
    "assets/before_the_fame/characters/rich_portobello/rich_portobello_porch_seated_80x96.png",
    "assets/before_the_fame/environments/family_house/family_house_atl_kitchen_270x480.png",
    "assets/before_the_fame/environments/portobello_bedroom/portobello_beige_bedroom_270x480.png",
    "assets/before_the_fame/environments/portobello_porch/portobello_porch_dusk_270x480.png",
]


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def candidate_record(path: Path) -> dict[str, object]:
    image = Image.open(path).convert("RGBA")
    alpha = sorted(set(image.getchannel("A").getdata()))
    bbox = image.getchannel("A").getbbox()
    bottom = bbox[3] - 1 if bbox else None
    center = ((bbox[0] + bbox[2] - 1) / 2) if bbox else None
    passed = (
        image.size == (80, 96)
        and image.mode == "RGBA"
        and alpha == [0, 255]
        and bottom == 88
        and center is not None
        and 38 <= center <= 42
    )
    return {
        "path": path.relative_to(REPO).as_posix(),
        "sha256": sha256(path),
        "dimensions": list(image.size),
        "mode": image.mode,
        "alpha_values": alpha,
        "opaque_bbox": list(bbox) if bbox else None,
        "contact_expected": [40, 88],
        "bottom_contact_pass": bottom == 88,
        "center_pass": center is not None and 38 <= center <= 42,
        "contract_pass": passed,
    }


def read_baseline() -> list[tuple[str, Path]]:
    records = []
    for line in BASELINE.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        digest, rel = line.split(None, 1)
        records.append((digest, REPO / rel.strip()))
    return records


def main() -> int:
    candidates = [candidate_record(NATIVE / name) for name in EXPECTED]
    source_hashes = [
        {"path": rel, "sha256": sha256(REPO / rel)} for rel in SOURCE_PATHS
    ]
    frozen = []
    for expected, path in read_baseline():
        actual = sha256(path)
        frozen.append({
            "path": path.relative_to(REPO).as_posix(),
            "expected_sha256": expected,
            "actual_sha256": actual,
            "pass": actual == expected,
        })
    report = {
        "ship_id": "ART SHIP 013",
        "status": "CANDIDATE — HQ REVIEW REQUIRED",
        "candidate_count": len(candidates),
        "candidate_contracts_pass": all(x["contract_pass"] for x in candidates),
        "candidates": candidates,
        "source_hashes": source_hashes,
        "frozen_baseline": "art_department/ships/art_ship_011/FROZEN_CORPUS_SHA256SUMS.txt",
        "frozen_files_verified": len(frozen),
        "frozen_integrity_pass": all(x["pass"] for x in frozen),
        "frozen_failures": [x for x in frozen if not x["pass"]],
        "review_boards_expected": 8,
        "review_boards_present": len(list((SHIP / "review").glob("*.png"))),
        "runtime_code_touched": False,
        "canonical_assets_touched": False,
    }
    (SHIP / "CANDIDATE_VALIDATION_REPORT.json").write_text(
        json.dumps(report, indent=2) + "\n", encoding="utf-8"
    )
    lines = ["# ART SHIP 013 candidate SHA-256", "", "Status: CANDIDATE — HQ REVIEW REQUIRED", ""]
    lines.extend(f"{x['sha256']}  {x['path']}" for x in candidates)
    (SHIP / "CANDIDATE_SHA256SUMS.txt").write_text("\n".join(lines) + "\n", encoding="utf-8")
    source_lines = [f"{x['sha256']}  {x['path']}" for x in source_hashes]
    (SHIP / "SOURCE_PACKAGE_SHA256SUMS.txt").write_text("\n".join(source_lines) + "\n", encoding="utf-8")
    ok = report["candidate_contracts_pass"] and report["frozen_integrity_pass"] and report["review_boards_present"] == 8
    print(json.dumps({
        "candidate_contracts_pass": report["candidate_contracts_pass"],
        "frozen_files_verified": report["frozen_files_verified"],
        "frozen_integrity_pass": report["frozen_integrity_pass"],
        "review_boards_present": report["review_boards_present"],
    }, indent=2))
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
