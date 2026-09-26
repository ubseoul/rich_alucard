#!/usr/bin/env python3
"""Deterministically nativeize ART SHIP 012 source renders and build review evidence."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont


SHIP = Path(__file__).resolve().parents[1]
REPO = SHIP.parents[2]
RAW = SHIP / "source_renders"
NATIVE = SHIP / "candidates" / "native" / "characters"
REVIEW = SHIP / "review"

ASSETS = {
    "portobello_manager": {"raw": "portobello_manager_raw.png", "file": "portobello_manager_neutral_80x96.png", "max": (34, 56), "colors": 16},
    "auntie": {"raw": "auntie_raw.png", "file": "auntie_register_neutral_80x96.png", "max": (36, 57), "colors": 18},
    "soul": {"raw": "ocean_soul_raw.png", "file": "ocean_soul_climbing_80x96.png", "max": (35, 64), "colors": 12},
    "training_dummy": {"raw": "training_dummy_raw.png", "file": "training_dummy_combat_80x96.png", "max": (42, 58), "colors": 14},
    "buckhead": {"raw": "buckhead_raw.png", "file": "buckhead_vampire_neutral_80x96.png", "max": (36, 58), "colors": 17},
}

CONTEXTS = {
    "portobello_manager": (REPO / "assets/before_the_fame/environments/portobello_office/portobello_kpi_office_270x480.png", 184, 372),
    "auntie": (REPO / "assets/before_the_fame/environments/naija_mart/naija_mart_interior_270x480.png", 185, 372),
    "soul": (REPO / "assets/goldfish_years/masters/ocean_floor_base_270x480.png", 154, 360),
    "buckhead": (REPO / "assets/before_the_fame/environments/lennox/lennox_scare_270x480.png", 184, 372),
}
LADDER = REPO / "assets/goldfish_years/layers/ladder_intact_overlay_270x480.png"
THRONE = REPO / "assets/throne_room_scene.png"

COMPARISONS = [
    REPO / "assets/rich_standing_right.png",
    REPO / "assets/before_the_fame/characters/ms_patrice/ms_patrice_neutral_80x96.png",
    REPO / "assets/before_the_fame/characters/uncle_sunday/uncle_sunday_neutral_80x96.png",
    REPO / "assets/before_the_fame/characters/velvet/velvet_vantablack_profile_80x96.png",
    REPO / "assets/before_the_fame/characters/bonesworth/sir_bonesworth_hungover_80x96.png",
]


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def significant_bbox(image: Image.Image) -> tuple[int, int, int, int]:
    alpha = np.asarray(image.convert("RGBA").getchannel("A"))
    mask = alpha >= 48
    rows = np.flatnonzero(mask.sum(axis=1) >= max(4, int(image.width * 0.002)))
    cols = np.flatnonzero(mask.sum(axis=0) >= max(4, int(image.height * 0.002)))
    if not len(rows) or not len(cols):
        bbox = image.getchannel("A").getbbox()
        if bbox is None:
            raise ValueError("transparent source render")
        return bbox
    return int(cols[0]), int(rows[0]), int(cols[-1] + 1), int(rows[-1] + 1)


def binary_alpha(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    pixels = np.asarray(rgba).copy()
    alpha = np.where(pixels[:, :, 3] >= 96, 255, 0).astype(np.uint8)
    pixels[:, :, 3] = alpha
    pixels[:, :, :3][alpha == 0] = 0
    return Image.fromarray(pixels, "RGBA")


def reduce_colors(image: Image.Image, colors: int) -> Image.Image:
    rgba = binary_alpha(image)
    alpha = rgba.getchannel("A")
    rgb = rgba.convert("RGB").quantize(colors=colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert("RGB")
    out = rgb.convert("RGBA")
    out.putalpha(alpha)
    return binary_alpha(out)


def nativeize(raw_path: Path, max_size: tuple[int, int], colors: int) -> Image.Image:
    raw = Image.open(raw_path).convert("RGBA")
    crop = raw.crop(significant_bbox(raw))
    scale = min(max_size[0] / crop.width, max_size[1] / crop.height)
    size = (max(1, round(crop.width * scale)), max(1, round(crop.height * scale)))
    crop = crop.resize(size, Image.Resampling.BOX)
    crop = reduce_colors(crop, colors)
    canvas = Image.new("RGBA", (80, 96), (0, 0, 0, 0))
    left = 40 - crop.width // 2
    top = 89 - crop.height
    canvas.alpha_composite(crop, (left, top))
    return binary_alpha(canvas)


def font(size: int = 14) -> ImageFont.ImageFont:
    try:
        return ImageFont.truetype("DejaVuSansMono.ttf", size)
    except OSError:
        return ImageFont.load_default()


def checker(size: tuple[int, int], block: int = 8) -> Image.Image:
    out = Image.new("RGB", size, (198, 198, 198))
    draw = ImageDraw.Draw(out)
    for y in range(0, size[1], block):
        for x in range(0, size[0], block):
            if (x // block + y // block) % 2:
                draw.rectangle((x, y, min(x + block - 1, size[0] - 1), min(y + block - 1, size[1] - 1)), fill=(158, 158, 158))
    return out


def isolated_board(paths: dict[str, Path], scale: int, filename: str) -> None:
    label_h = 54
    cell_w, cell_h = 80 * scale, 96 * scale + label_h
    board = Image.new("RGB", (cell_w * 5, cell_h), (19, 23, 31))
    draw = ImageDraw.Draw(board)
    for index, (asset_id, path) in enumerate(paths.items()):
        x = index * cell_w
        bg = checker((80 * scale, 96 * scale), max(1, 4 * scale))
        art = Image.open(path).convert("RGBA").resize((80 * scale, 96 * scale), Image.Resampling.NEAREST)
        bg.paste(art, (0, 0), art)
        board.paste(bg, (x, label_h))
        draw.text((x + 6, 6), asset_id, fill=(242, 242, 246), font=font(12 if scale == 1 else 14))
        draw.text((x + 6, 26), "80x96 | contact (40,88)", fill=(123, 220, 170), font=font(10 if scale == 1 else 12))
        draw.line((x, label_h + 88 * scale, x + cell_w - 1, label_h + 88 * scale), fill=(255, 70, 170), width=max(1, scale // 2))
    board.save(REVIEW / filename, optimize=True)


def comparison_board(paths: dict[str, Path]) -> None:
    entries = [(p.stem, p) for p in COMPARISONS] + [(k, p) for k, p in paths.items()]
    scale, label_h = 4, 38
    board = Image.new("RGB", (80 * scale * 5, (96 * scale + label_h) * 2), (18, 21, 28))
    draw = ImageDraw.Draw(board)
    for i, (label, path) in enumerate(entries):
        col, row = i % 5, i // 5
        x, y = col * 80 * scale, row * (96 * scale + label_h)
        bg = checker((80 * scale, 96 * scale), 16)
        art = Image.open(path).convert("RGBA").resize((80 * scale, 96 * scale), Image.Resampling.NEAREST)
        bg.paste(art, (0, 0), art)
        board.paste(bg, (x, y + label_h))
        draw.text((x + 5, y + 8), label[:28], fill=(240, 240, 245), font=font(12))
        draw.line((x, y + label_h + 88 * scale, x + 80 * scale - 1, y + label_h + 88 * scale), fill=(255, 70, 170), width=2)
    board.save(REVIEW / "03_approved_corpus_comparison_4x.png", optimize=True)


def place_actor(scene: Image.Image, actor: Image.Image, x: int, y: int) -> Image.Image:
    out = scene.convert("RGBA").copy()
    out.alpha_composite(actor.convert("RGBA"), (x - 40, y - 88))
    return out


def context_board(paths: dict[str, Path]) -> None:
    panels: list[tuple[str, Image.Image]] = []
    for asset_id in ("portobello_manager", "auntie", "soul", "buckhead"):
        env_path, x, y = CONTEXTS[asset_id]
        scene = Image.open(env_path).convert("RGBA")
        if asset_id == "soul":
            scene = Image.alpha_composite(scene, Image.open(LADDER).convert("RGBA"))
        panels.append((asset_id, place_actor(scene, Image.open(paths[asset_id]), x, y)))
    scale, label_h = 2, 34
    board = Image.new("RGB", (270 * scale * 4, 480 * scale + label_h), (15, 18, 25))
    draw = ImageDraw.Draw(board)
    for i, (label, panel) in enumerate(panels):
        x = i * 270 * scale
        board.paste(panel.convert("RGB").resize((270 * scale, 480 * scale), Image.Resampling.NEAREST), (x, label_h))
        draw.text((x + 8, 8), f"REVIEW ONLY | {label}", fill=(240, 240, 245), font=font(13))
    board.save(REVIEW / "04_frozen_environment_contexts_2x.png", optimize=True)


def training_context(path: Path) -> None:
    scene = Image.open(THRONE).convert("RGBA")
    actor = Image.open(path).convert("RGBA").resize((120, 144), Image.Resampling.NEAREST)
    # Review-only representative placement; runtime combat authority owns final transform.
    scene.alpha_composite(actor, (145, 176))
    draw = ImageDraw.Draw(scene)
    draw.rectangle((0, 0, scene.width - 1, 28), fill=(15, 18, 25, 255))
    draw.text((6, 7), "REVIEW ONLY | FROZEN THRONE | 1.5x DUMMY", fill=(240, 240, 245, 255), font=font(10))
    scene.convert("RGB").save(REVIEW / "05_training_dummy_throne_context_1x.png", optimize=True)


def technical_fact(asset_id: str, path: Path) -> dict[str, object]:
    image = Image.open(path).convert("RGBA")
    alpha = image.getchannel("A")
    bbox = alpha.getbbox()
    colors = {rgb for rgb, a in zip(image.convert("RGB").getdata(), alpha.getdata()) if a}
    return {
        "runtime_asset_id": asset_id,
        "path": path.relative_to(REPO).as_posix(),
        "sha256": sha256(path),
        "dimensions": list(image.size),
        "mode": "RGBA",
        "alpha_values": sorted(set(alpha.getdata())),
        "opaque_bbox": list(bbox) if bbox else None,
        "opaque_rgb_colors": len(colors),
        "contact": [40, 88],
        "contact_row_pass": bool(bbox and bbox[3] - 1 == 88),
    }


def main() -> None:
    NATIVE.mkdir(parents=True, exist_ok=True)
    REVIEW.mkdir(parents=True, exist_ok=True)
    paths: dict[str, Path] = {}
    for asset_id, spec in ASSETS.items():
        path = NATIVE / spec["file"]
        nativeize(RAW / spec["raw"], spec["max"], spec["colors"]).save(path, optimize=True)
        paths[asset_id] = path
    isolated_board(paths, 1, "01_isolated_native_1x.png")
    isolated_board(paths, 4, "02_isolated_exact_4x.png")
    comparison_board(paths)
    context_board(paths)
    training_context(paths["training_dummy"])
    facts = [technical_fact(asset_id, path) for asset_id, path in paths.items()]
    raw_hashes = [{"path": p.relative_to(REPO).as_posix(), "sha256": sha256(p)} for p in sorted(RAW.glob("*.png"))]
    (SHIP / "CANDIDATE_TECHNICAL_FACTS.json").write_text(json.dumps({"assets": facts}, indent=2) + "\n", encoding="utf-8")
    (SHIP / "RAW_GENERATION_HASHES.json").write_text(json.dumps({"source_renders": raw_hashes}, indent=2) + "\n", encoding="utf-8")
    print(f"Built {len(paths)} candidates and 5 review boards.")


if __name__ == "__main__":
    main()
