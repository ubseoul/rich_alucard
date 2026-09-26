#!/usr/bin/env python3
"""Nativeize the generated Buckhead source and build review-only evidence."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont


SHIP = Path(__file__).resolve().parents[1]
REPO = SHIP.parents[2]
SOURCE = SHIP / "source_renders/buckhead_final_revision_source.png"
CANDIDATE = SHIP / "candidates/native/characters/buckhead_vampire_neutral_80x96.png"
REVIEW = SHIP / "review"
ENVIRONMENT = REPO / "assets/before_the_fame/environments/lennox/lennox_scare_270x480.png"
CAST = [
    ("RICH", REPO / "assets/rich_standing_right.png"),
    ("MS PATRICE", REPO / "assets/before_the_fame/characters/ms_patrice/ms_patrice_neutral_80x96.png"),
    ("UNCLE SUNDAY", REPO / "assets/before_the_fame/characters/uncle_sunday/uncle_sunday_neutral_80x96.png"),
    ("BLLAD33", REPO / "assets/bllad33/masters/bllad33_neutral_candidate_80x96.png"),
]
REJECTED = [
    ("REJECTED: INITIAL", SHIP / "rejected/buckhead_initial_naturalistic_rejected_80x96.png"),
    ("REJECTED: DETERMINISTIC", SHIP / "rejected/buckhead_deterministic_native_grid_rejected_80x96.png"),
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
    pixels = np.asarray(image.convert("RGBA")).copy()
    alpha = np.where(pixels[:, :, 3] >= 96, 255, 0).astype(np.uint8)
    pixels[:, :, 3] = alpha
    pixels[:, :, :3][alpha == 0] = 0
    return Image.fromarray(pixels, "RGBA")


def nativeize() -> Image.Image:
    raw = Image.open(SOURCE).convert("RGBA")
    crop = raw.crop(significant_bbox(raw))
    max_size = (36, 58)
    scale = min(max_size[0] / crop.width, max_size[1] / crop.height)
    size = (max(1, round(crop.width * scale)), max(1, round(crop.height * scale)))
    reduced = crop.resize(size, Image.Resampling.BOX)
    reduced = binary_alpha(reduced)
    alpha = reduced.getchannel("A")
    rgb = reduced.convert("RGB").quantize(
        colors=14,
        method=Image.Quantize.MEDIANCUT,
        dither=Image.Dither.NONE,
    ).convert("RGB")
    reduced = rgb.convert("RGBA")
    reduced.putalpha(alpha)
    reduced = binary_alpha(reduced)
    canvas = Image.new("RGBA", (80, 96), (0, 0, 0, 0))
    left = 40 - reduced.width // 2
    top = 89 - reduced.height
    canvas.alpha_composite(reduced, (left, top))
    return binary_alpha(canvas)


def font(size: int) -> ImageFont.ImageFont:
    try:
        return ImageFont.truetype("DejaVuSansMono.ttf", size)
    except OSError:
        return ImageFont.load_default()


def checker(size: tuple[int, int], block: int) -> Image.Image:
    out = Image.new("RGB", size, (198, 198, 198))
    draw = ImageDraw.Draw(out)
    for y in range(0, size[1], block):
        for x in range(0, size[0], block):
            if (x // block + y // block) % 2:
                draw.rectangle((x, y, min(x + block - 1, size[0] - 1), min(y + block - 1, size[1] - 1)), fill=(158, 158, 158))
    return out


def isolated(scale: int, filename: str) -> None:
    art_w, art_h = 80 * scale, 96 * scale
    label_h = 34 if scale == 1 else 46
    board = Image.new("RGB", (max(320, art_w), art_h + label_h), (18, 21, 28))
    draw = ImageDraw.Draw(board)
    x = (board.width - art_w) // 2
    bg = checker((art_w, art_h), max(4, 4 * scale))
    art = Image.open(CANDIDATE).convert("RGBA").resize((art_w, art_h), Image.Resampling.NEAREST)
    bg.paste(art, (0, 0), art)
    board.paste(bg, (x, label_h))
    draw.text((8, 7), "BUCKHEAD FINAL REVISION | CANDIDATE", fill=(126, 225, 169), font=font(8 if scale == 1 else 12))
    draw.line((x, label_h + 88 * scale, x + art_w - 1, label_h + 88 * scale), fill=(255, 70, 170), width=max(1, scale // 2))
    board.save(REVIEW / filename, optimize=True)


def comparison(scale: int, filename: str) -> None:
    entries = CAST + [("BUCKHEAD CANDIDATE", CANDIDATE)]
    label_h = 28 if scale == 1 else 42
    art_w, art_h = 80 * scale, 96 * scale
    cell_w = max(160, art_w)
    board = Image.new("RGB", (cell_w * len(entries), art_h + label_h), (18, 21, 28))
    draw = ImageDraw.Draw(board)
    for index, (label, path) in enumerate(entries):
        cell_x = index * cell_w
        x = cell_x + (cell_w - art_w) // 2
        bg = checker((art_w, art_h), max(4, 4 * scale))
        art = Image.open(path).convert("RGBA").resize((art_w, art_h), Image.Resampling.NEAREST)
        bg.paste(art, (0, 0), art)
        board.paste(bg, (x, label_h))
        draw.text((cell_x + 5, 7), label, fill=(240, 240, 245), font=font(8 if scale == 1 else 12))
        draw.line((x, label_h + 88 * scale, x + art_w - 1, label_h + 88 * scale), fill=(255, 70, 170), width=max(1, scale // 2))
    board.save(REVIEW / filename, optimize=True)


def context() -> None:
    scene = Image.open(ENVIRONMENT).convert("RGBA")
    actor = Image.open(CANDIDATE).convert("RGBA").resize((120, 144), Image.Resampling.NEAREST)
    # Representative review-only combat placement; runtime owns final transform.
    scene.alpha_composite(actor, (124, 228))
    draw = ImageDraw.Draw(scene)
    draw.rectangle((0, 0, scene.width - 1, 28), fill=(15, 18, 25, 255))
    draw.text((6, 7), "REVIEW ONLY | LENNOX SCARE | 1.5x", fill=(240, 240, 245, 255), font=font(10))
    scene.convert("RGB").save(REVIEW / "08_buckhead_final_lennox_context_1x.png", optimize=True)


def rejected_comparison() -> None:
    entries = REJECTED + [("NEW CANDIDATE", CANDIDATE)]
    scale, label_h = 4, 42
    art_w, art_h = 80 * scale, 96 * scale
    board = Image.new("RGB", (art_w * len(entries), art_h + label_h), (18, 21, 28))
    draw = ImageDraw.Draw(board)
    for index, (label, path) in enumerate(entries):
        x = index * art_w
        bg = checker((art_w, art_h), 16)
        art = Image.open(path).convert("RGBA").resize((art_w, art_h), Image.Resampling.NEAREST)
        bg.paste(art, (0, 0), art)
        board.paste(bg, (x, label_h))
        color = (255, 110, 110) if label.startswith("REJECTED") else (126, 225, 169)
        draw.text((x + 5, 7), label, fill=color, font=font(12))
        draw.line((x, label_h + 88 * scale, x + art_w - 1, label_h + 88 * scale), fill=(255, 70, 170), width=2)
    board.save(REVIEW / "09_buckhead_revision_history_exact_4x.png", optimize=True)


def facts() -> dict[str, object]:
    image = Image.open(CANDIDATE).convert("RGBA")
    alpha = image.getchannel("A")
    bbox = alpha.getbbox()
    colors = {rgb for rgb, a in zip(image.convert("RGB").getdata(), alpha.getdata()) if a}
    return {
        "runtime_asset_id": "buckhead",
        "path": CANDIDATE.relative_to(REPO).as_posix(),
        "sha256": sha256(CANDIDATE),
        "dimensions": list(image.size),
        "mode": image.mode,
        "alpha_values": sorted(set(alpha.getdata())),
        "opaque_bbox": list(bbox) if bbox else None,
        "opaque_rgb_colors": len(colors),
        "contact": [40, 88],
        "contact_row_pass": bool(bbox and bbox[3] - 1 == 88),
        "source_render": {
            "path": SOURCE.relative_to(REPO).as_posix(),
            "sha256": sha256(SOURCE),
            "dimensions": list(Image.open(SOURCE).size),
            "method": "built-in ImageGen with transparent background"
        },
        "nativeization": {
            "significant_alpha_crop_threshold": 48,
            "maximum_opaque_envelope": [36, 58],
            "downsample": "Pillow BOX",
            "palette": "14-color adaptive MEDIANCUT, no dither",
            "alpha": "binary threshold at 96",
            "contact_alignment": [40, 88],
            "manual_or_procedural_anatomy_alteration": False
        }
    }


def main() -> None:
    CANDIDATE.parent.mkdir(parents=True, exist_ok=True)
    REVIEW.mkdir(parents=True, exist_ok=True)
    nativeize().save(CANDIDATE, optimize=True)
    isolated(1, "04_buckhead_final_native_1x.png")
    isolated(4, "05_buckhead_final_exact_4x.png")
    comparison(1, "06_buckhead_final_corpus_comparison_native_1x.png")
    comparison(4, "07_buckhead_final_corpus_comparison_exact_4x.png")
    context()
    rejected_comparison()
    record = facts()
    (SHIP / "BUCKHEAD_FINAL_TECHNICAL_FACTS.json").write_text(json.dumps(record, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(record, indent=2))


if __name__ == "__main__":
    main()
