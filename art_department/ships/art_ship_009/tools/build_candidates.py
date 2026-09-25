#!/usr/bin/env python3
"""Build native ART SHIP 009 candidates from retained source renders.

This is deterministic post-processing only: crop, native reduction, palette
discipline, binary-alpha cleanup, placement, review boards and technical facts.
It never reads from or writes to the frozen corpus except to composite review
copies in memory.
"""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont


SHIP = Path(__file__).resolve().parents[1]
REPO = SHIP.parents[2]
RAW = SHIP / "source_renders"
NATIVE = SHIP / "candidates" / "native"
REVIEW = SHIP / "review"

ENVIRONMENTS = {
    "atl_house_party": "atl_house_party_raw.png",
    "la_sky": "la_sky_raw.png",
    "naija_lot": "naija_lot_raw.png",
    "neighbor_castle": "neighbor_castle_raw.png",
    "portobello_bedroom": "portobello_bedroom_raw.png",
    "portobello_office": "portobello_office_raw.png",
    "portobello_porch": "portobello_porch_raw.png",
    "rooftop_dtla": "rooftop_dtla_raw.png",
    "tokyo_tease": "tokyo_tease_raw.png",
}

CHARACTERS = {
    "tunde_hookah_seated": {
        "raw": "tunde_hookah_seated_raw.png",
        "anchor": REPO / "assets/before_the_fame/characters/tunde/tunde_neutral_80x96.png",
    },
    "dre_hookah_seated": {
        "raw": "dre_hookah_seated_raw.png",
        "anchor": REPO / "assets/before_the_fame/characters/dre/dre_neutral_80x96.png",
    },
}


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def crop_to_aspect(image: Image.Image, width: int, height: int) -> Image.Image:
    target = width / height
    current = image.width / image.height
    if current > target:
        new_width = round(image.height * target)
        left = (image.width - new_width) // 2
        return image.crop((left, 0, left + new_width, image.height))
    new_height = round(image.width / target)
    top = (image.height - new_height) // 2
    return image.crop((0, top, image.width, top + new_height))


def native_environment(raw_path: Path) -> Image.Image:
    image = crop_to_aspect(Image.open(raw_path).convert("RGB"), 270, 480)
    image = image.resize((270, 480), Image.Resampling.BOX)
    # Frozen environment authority is typically 28-30 colors.
    image = image.quantize(colors=30, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    return image.convert("RGB")


def opaque_palette(path: Path) -> list[tuple[int, int, int]]:
    image = Image.open(path).convert("RGBA")
    colors = sorted({rgb for rgb, alpha in zip(image.convert("RGB").getdata(), image.getchannel("A").getdata()) if alpha})
    return colors


def remap_to_palette(image: Image.Image, palette: list[tuple[int, int, int]]) -> Image.Image:
    rgba = image.convert("RGBA")
    pixels = np.asarray(rgba).copy()
    alpha = pixels[:, :, 3]
    mask = alpha > 0
    if not mask.any():
        return rgba
    source = pixels[:, :, :3][mask].astype(np.int16)
    choices = np.asarray(palette, dtype=np.int16)
    # Candidate cells are tiny after native reduction; this is intentionally exact.
    distances = ((source[:, None, :] - choices[None, :, :]) ** 2).sum(axis=2)
    pixels[:, :, :3][mask] = choices[distances.argmin(axis=1)].astype(np.uint8)
    pixels[:, :, 3] = np.where(alpha >= 128, 255, 0).astype(np.uint8)
    pixels[:, :, :3][pixels[:, :, 3] == 0] = 0
    return Image.fromarray(pixels, "RGBA")


def significant_alpha_bbox(image: Image.Image) -> tuple[int, int, int, int]:
    alpha = np.asarray(image.convert("RGBA").getchannel("A"))
    mask = alpha >= 128
    row_counts = mask.sum(axis=1)
    col_counts = mask.sum(axis=0)
    row_threshold = max(8, int(image.width * 0.01))
    col_threshold = max(8, int(image.height * 0.006))
    rows = np.flatnonzero(row_counts >= row_threshold)
    cols = np.flatnonzero(col_counts >= col_threshold)
    if not len(rows) or not len(cols):
        bbox = image.getchannel("A").getbbox()
        if bbox is None:
            raise ValueError("transparent source render")
        return bbox
    return int(cols[0]), int(rows[0]), int(cols[-1] + 1), int(rows[-1] + 1)


def native_character(raw_path: Path, anchor_path: Path) -> Image.Image:
    raw = Image.open(raw_path).convert("RGBA")
    crop = raw.crop(significant_alpha_bbox(raw))
    max_width, max_height = 46, 56
    scale = min(max_width / crop.width, max_height / crop.height)
    size = (max(1, round(crop.width * scale)), max(1, round(crop.height * scale)))
    crop = crop.resize(size, Image.Resampling.BOX)
    crop = remap_to_palette(crop, opaque_palette(anchor_path))
    canvas = Image.new("RGBA", (80, 96), (0, 0, 0, 0))
    # Bottommost opaque row lands on y=88; horizontal envelope centers on x=40.
    left = 40 - crop.width // 2
    top = 89 - crop.height
    canvas.alpha_composite(crop, (left, top))
    alpha = np.asarray(canvas.getchannel("A"))
    binary = Image.fromarray(np.where(alpha >= 128, 255, 0).astype(np.uint8), "L")
    canvas.putalpha(binary)
    return remap_to_palette(canvas, opaque_palette(anchor_path))


def native_hollow_layer(raw_path: Path) -> Image.Image:
    raw = crop_to_aspect(Image.open(raw_path).convert("RGBA"), 270, 480)
    layer = raw.resize((270, 480), Image.Resampling.BOX)
    alpha = np.asarray(layer.getchannel("A"))
    alpha = np.where(alpha >= 128, 255, 0).astype(np.uint8)
    # Preserve the named-actor corridor while retaining audience on the flanks.
    alpha[270:372, 96:174] = 0
    alpha[372:, :] = 0
    layer.putalpha(Image.fromarray(alpha, "L"))
    frozen_crowd = REPO / "assets/before_the_fame/environments/hollow_bowl/layers/hollow_bowl_crowd_overlay_270x480.png"
    return remap_to_palette(layer, opaque_palette(frozen_crowd))


def font(size: int = 16) -> ImageFont.ImageFont:
    try:
        return ImageFont.truetype("DejaVuSans.ttf", size)
    except OSError:
        return ImageFont.load_default()


def environment_board(paths: list[tuple[str, Path]]) -> None:
    scale = 2
    label_height = 34
    cell_width, cell_height = 270 * scale, 480 * scale + label_height
    board = Image.new("RGB", (cell_width * 3, cell_height * 3), (15, 16, 22))
    draw = ImageDraw.Draw(board)
    for index, (name, path) in enumerate(paths):
        x = (index % 3) * cell_width
        y = (index // 3) * cell_height
        art = Image.open(path).convert("RGB").resize((270 * scale, 480 * scale), Image.Resampling.NEAREST)
        board.paste(art, (x, y + label_height))
        draw.text((x + 10, y + 8), name, fill=(235, 235, 240), font=font(16))
        contact_y = y + label_height + 372 * scale
        draw.line((x, contact_y, x + cell_width - 1, contact_y), fill=(255, 70, 170), width=2)
    board.save(REVIEW / "environment_candidates_player_blind.png")


def character_board(candidate_paths: dict[str, Path]) -> None:
    refs = [
        ("TUNDE ANCHOR", CHARACTERS["tunde_hookah_seated"]["anchor"]),
        ("TUNDE SEATED", candidate_paths["tunde_hookah_seated"]),
        ("DRE ANCHOR", CHARACTERS["dre_hookah_seated"]["anchor"]),
        ("DRE SEATED", candidate_paths["dre_hookah_seated"]),
    ]
    scale = 6
    cell_width, cell_height = 80 * scale, 96 * scale + 34
    board = Image.new("RGBA", (cell_width * 4, cell_height), (20, 21, 28, 255))
    draw = ImageDraw.Draw(board)
    for index, (name, path) in enumerate(refs):
        art = Image.open(path).convert("RGBA").resize((80 * scale, 96 * scale), Image.Resampling.NEAREST)
        x = index * cell_width
        board.alpha_composite(art, (x, 34))
        draw.text((x + 8, 8), name, fill=(240, 240, 245, 255), font=font(15))
        draw.line((x, 34 + 88 * scale, x + cell_width - 1, 34 + 88 * scale), fill=(255, 70, 170, 255), width=2)
    board.convert("RGB").save(REVIEW / "hookah_identity_review_player_blind.png")


def hollow_board(new_layer_path: Path) -> None:
    base = Image.open(REPO / "assets/before_the_fame/environments/hollow_bowl/hollow_bowl_night_270x480.png").convert("RGBA")
    old = Image.open(REPO / "assets/before_the_fame/environments/hollow_bowl/layers/hollow_bowl_crowd_overlay_270x480.png").convert("RGBA")
    new = Image.open(new_layer_path).convert("RGBA")
    states = [
        ("FROZEN BASE", base),
        ("BASE + FROZEN CROWD", Image.alpha_composite(base, old)),
        ("+ STAGE-BAND CANDIDATE", Image.alpha_composite(Image.alpha_composite(base, old), new)),
    ]
    scale = 2
    label_height = 34
    board = Image.new("RGBA", (270 * scale * 3, 480 * scale + label_height), (15, 16, 22, 255))
    draw = ImageDraw.Draw(board)
    for index, (name, art) in enumerate(states):
        x = index * 270 * scale
        board.alpha_composite(art.resize((270 * scale, 480 * scale), Image.Resampling.NEAREST), (x, label_height))
        draw.text((x + 8, 8), name, fill=(240, 240, 245, 255), font=font(15))
        draw.line((x, label_height + 372 * scale, x + 270 * scale - 1, label_height + 372 * scale), fill=(255, 70, 170, 255), width=2)
    board.convert("RGB").save(REVIEW / "hollow_bowl_stage_band_review_player_blind.png")


def technical_fact(path: Path, kind: str) -> dict[str, object]:
    image = Image.open(path)
    rgba = image.convert("RGBA")
    alpha_values = sorted(set(rgba.getchannel("A").getdata()))
    opaque_colors = len({rgb for rgb, alpha in zip(rgba.convert("RGB").getdata(), rgba.getchannel("A").getdata()) if alpha})
    return {
        "path": path.relative_to(REPO).as_posix(),
        "kind": kind,
        "sha256": sha256(path),
        "dimensions": list(image.size),
        "mode": image.mode,
        "alpha_values": alpha_values,
        "opaque_rgb_colors": opaque_colors,
    }


def main() -> None:
    if (SHIP / "HQ_DECISION.md").exists():
        raise SystemExit("ART SHIP 009 is frozen; candidate rebuild is disabled. Use validate_promotion.py for read-only verification.")
    for directory in [NATIVE / "environments", NATIVE / "layers", NATIVE / "characters", REVIEW]:
        directory.mkdir(parents=True, exist_ok=True)

    env_paths: list[tuple[str, Path]] = []
    for name, raw_name in ENVIRONMENTS.items():
        out = NATIVE / "environments" / f"{name}_270x480.png"
        native_environment(RAW / raw_name).save(out, optimize=True)
        env_paths.append((name, out))

    hollow_path = NATIVE / "layers" / "hollow_bowl_stage_band_crowd_overlay_270x480.png"
    native_hollow_layer(RAW / "hollow_bowl_stage_band_raw.png").save(hollow_path, optimize=True)

    character_paths: dict[str, Path] = {}
    for name, spec in CHARACTERS.items():
        out = NATIVE / "characters" / f"{name}_80x96.png"
        native_character(RAW / spec["raw"], spec["anchor"]).save(out, optimize=True)
        character_paths[name] = out

    environment_board(env_paths)
    character_board(character_paths)
    hollow_board(hollow_path)

    facts = [technical_fact(path, "environment_master") for _, path in env_paths]
    facts.append(technical_fact(hollow_path, "environment_condition_layer"))
    facts.extend(technical_fact(path, "character_state") for path in character_paths.values())
    (SHIP / "CANDIDATE_TECHNICAL_FACTS.json").write_text(json.dumps({"assets": facts}, indent=2) + "\n", encoding="utf-8")

    print(f"Built {len(facts)} native candidates and 3 internal review boards.")


if __name__ == "__main__":
    main()
