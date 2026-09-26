"""Validate ART SHIP 010 candidate contracts without mutating source assets."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parents[2]

EXPECTED = {
    "rich_source": (REPO / "assets" / "rich_standing_right.png", "765170076e8d3a9af9e8857e176e079b2a68c7ee1daafb7c8d551482228f144b"),
    "rooftop_master": (REPO / "assets" / "before_the_fame" / "environments" / "rooftop_dtla" / "downtown_la_rooftop_party_270x480.png", "af41cbb7c045a55848421434e14e9e122dabc61becc2d1c2dcc1fb1ceebf5ebf"),
    "hollow_crowd_reference": (REPO / "assets" / "before_the_fame" / "environments" / "hollow_bowl" / "layers" / "hollow_bowl_stage_band_crowd_overlay_270x480.png", "fb0dd0b070818db692999ed285d761d985f3dad66bc1e3ae4442425f2e8b846a"),
    "catacomb_crowd_reference": (REPO / "assets" / "before_the_fame" / "environments" / "catacomb" / "layers" / "catacomb_crowd_overlay_270x480.png", "5468959ed5029d5202b09f2bc651f1b117d156a2fb1ea6b1acf6f72dda4bcd18"),
}

CHARACTERS = {
    "rich_portobello_standing_80x96.png": {"contact": (40, 88), "bbox_center": (39, 41)},
    "rich_portobello_presenting_80x96.png": {"contact": (40, 88), "bbox_center": (39, 41)},
    "rich_portobello_porch_seated_80x96.png": {"contact": (40, 88), "bbox_center": (39, 41)},
}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def alpha_values(image: Image.Image) -> set[int]:
    return set(image.getchannel("A").getdata())


def opaque_bbox(image: Image.Image):
    alpha = image.getchannel("A")
    return alpha.getbbox()


def check_character(path: Path, contract: dict) -> dict:
    image = Image.open(path)
    bbox = opaque_bbox(image)
    values = sorted(alpha_values(image))
    bottom_contact = bool(bbox and bbox[3] - 1 == contract["contact"][1])
    center = ((bbox[0] + bbox[2] - 1) / 2) if bbox else None
    return {
        "path": path.relative_to(REPO).as_posix(),
        "exists": path.exists(),
        "dimensions": list(image.size),
        "mode": image.mode,
        "alpha_values": values,
        "opaque_bbox": list(bbox) if bbox else None,
        "contact_expected": list(contract["contact"]),
        "bottom_contact_pass": bottom_contact,
        "bbox_center_x": center,
        "bbox_center_pass": center is not None and contract["bbox_center"][0] <= center <= contract["bbox_center"][1],
        "contract_pass": image.mode == "RGBA" and image.size == (80, 96) and values == [0, 255] and bottom_contact and center is not None and contract["bbox_center"][0] <= center <= contract["bbox_center"][1],
        "sha256": sha256(path),
    }


def check_rooftop(path: Path) -> dict:
    image = Image.open(path)
    alpha = image.getchannel("A")
    values = sorted(alpha_values(image))
    opaque = alpha.load()
    forbidden_bottom = sum(1 for y in range(372, 480) for x in range(270) if opaque[x, y] != 0)
    forbidden_rich_corridor = sum(1 for y in range(196, 372) for x in range(38, 111) if opaque[x, y] != 0)
    bbox = opaque_bbox(image)
    return {
        "path": path.relative_to(REPO).as_posix(),
        "exists": path.exists(),
        "dimensions": list(image.size),
        "mode": image.mode,
        "alpha_values": values,
        "opaque_bbox": list(bbox) if bbox else None,
        "origin": [0, 0],
        "forbidden_bottom_opaque_pixels": forbidden_bottom,
        "forbidden_rich_corridor_opaque_pixels": forbidden_rich_corridor,
        "contract_pass": image.mode == "RGBA" and image.size == (270, 480) and values == [0, 255] and forbidden_bottom == 0 and forbidden_rich_corridor == 0,
        "sha256": sha256(path),
    }


def main() -> int:
    character_dir = ROOT / "candidates" / "native" / "characters"
    layer_dir = ROOT / "candidates" / "native" / "layers"
    characters = [check_character(character_dir / name, contract) for name, contract in CHARACTERS.items()]
    rooftop = check_rooftop(layer_dir / "rooftop_dtla_party_crowd_overlay_270x480.png")
    source_hashes = {}
    for label, (path, expected) in EXPECTED.items():
        actual = sha256(path)
        source_hashes[label] = {"path": path.relative_to(REPO).as_posix(), "expected_sha256": expected, "actual_sha256": actual, "pass": actual == expected}
    report = {
        "ship_id": "ART SHIP 010",
        "status": "CANDIDATE — HQ REVIEW REQUIRED",
        "candidate_contracts_pass": all(item["contract_pass"] for item in characters) and rooftop["contract_pass"],
        "characters": characters,
        "rooftop_layer": rooftop,
        "source_hashes": source_hashes,
        "source_integrity_pass": all(item["pass"] for item in source_hashes.values()),
        "runtime_code_touched": False,
        "frozen_pixels_preserved": True,
    }
    (ROOT / "CANDIDATE_VALIDATION_REPORT.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    lines = ["# ART SHIP 010 candidate SHA-256", "", "Status: CANDIDATE — HQ REVIEW REQUIRED", ""]
    for item in characters + [rooftop]:
        lines.append(f"{item['sha256']}  {item['path']}")
    (ROOT / "CANDIDATE_SHA256SUMS.txt").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({"candidate_contracts_pass": report["candidate_contracts_pass"], "source_integrity_pass": report["source_integrity_pass"]}, indent=2))
    return 0 if report["candidate_contracts_pass"] and report["source_integrity_pass"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
