#!/usr/bin/env python3
"""Deterministically prepare ART SHIP 013 native candidates and review boards."""

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

RICH = REPO / "assets/rich_standing_right.png"
RICH_CURB = REPO / "assets/rich_curb_chilling.png"
RICH_STAGE = REPO / "assets/before_the_fame/characters/rich/rich_on_stage_80x96.png"
RICH_HOOKAH_OLD = REPO / "assets/before_the_fame/characters/rich/rich_hookah_seated_80x96.png"
PORTO_RICH = REPO / "assets/before_the_fame/characters/rich_portobello/rich_portobello_standing_80x96.png"
FAMILY_ENV = REPO / "assets/before_the_fame/environments/family_house/family_house_atl_kitchen_270x480.png"
PORTO_ENV = {
    "bedroom": REPO / "assets/before_the_fame/environments/portobello_bedroom/portobello_beige_bedroom_270x480.png",
    "porch": REPO / "assets/before_the_fame/environments/portobello_porch/portobello_porch_dusk_270x480.png",
}

SPECS = {
    "mom_neutral_80x96.png": ("mom_raw.png", (32, 55), "character_anchor"),
    "dad_neutral_80x96.png": ("dad_raw.png", (31, 56), "character_anchor"),
    "sister_neutral_80x96.png": ("sister_raw.png", (31, 55), "character_anchor"),
    "portobello_wife_neutral_80x96.png": ("portobello_wife_raw.png", (29, 54), "character_anchor"),
    "portobello_kid1_neutral_80x96.png": ("portobello_kid1_raw.png", (24, 35), "character_anchor"),
    "portobello_kid2_neutral_80x96.png": ("portobello_kid2_raw.png", (23, 32), "character_anchor"),
    "rich_hookah_seated_corrected_80x96.png": ("rich_hookah_seated_raw.png", (43, 54), "character_state"),
}


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def significant_alpha_bbox(image: Image.Image) -> tuple[int, int, int, int]:
    alpha = np.asarray(image.convert("RGBA").getchannel("A"))
    mask = alpha >= 128
    rows = np.flatnonzero(mask.sum(axis=1) >= max(8, int(image.width * 0.006)))
    cols = np.flatnonzero(mask.sum(axis=0) >= max(8, int(image.height * 0.004)))
    if not len(rows) or not len(cols):
        bbox = image.getchannel("A").getbbox()
        if bbox is None:
            raise ValueError("transparent source render")
        return bbox
    return int(cols[0]), int(rows[0]), int(cols[-1] + 1), int(rows[-1] + 1)


def binary_alpha(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    alpha = np.asarray(rgba.getchannel("A"))
    rgba.putalpha(Image.fromarray(np.where(alpha >= 128, 255, 0).astype(np.uint8), "L"))
    px = np.asarray(rgba).copy()
    px[:, :, :3][px[:, :, 3] == 0] = 0
    return Image.fromarray(px, "RGBA")


def adaptive_reduce(image: Image.Image, colors: int = 16) -> Image.Image:
    rgba = binary_alpha(image)
    alpha = rgba.getchannel("A")
    rgb = rgba.convert("RGB").quantize(
        colors=colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE
    ).convert("RGB")
    out = rgb.convert("RGBA")
    out.putalpha(alpha)
    return binary_alpha(out)


def opaque_palette(paths: list[Path]) -> list[tuple[int, int, int]]:
    colors: set[tuple[int, int, int]] = set()
    for path in paths:
        rgba = Image.open(path).convert("RGBA")
        colors.update(
            rgb
            for rgb, a in zip(rgba.convert("RGB").getdata(), rgba.getchannel("A").getdata())
            if a
        )
    return sorted(colors)


def remap_to_palette(image: Image.Image, palette: list[tuple[int, int, int]]) -> Image.Image:
    rgba = binary_alpha(image)
    px = np.asarray(rgba).copy()
    mask = px[:, :, 3] > 0
    source = px[:, :, :3][mask].astype(np.int32)
    choices = np.asarray(palette, dtype=np.int32)
    distances = ((source[:, None, :] - choices[None, :, :]) ** 2).sum(axis=2)
    px[:, :, :3][mask] = choices[distances.argmin(axis=1)].astype(np.uint8)
    px[:, :, :3][~mask] = 0
    return Image.fromarray(px, "RGBA")


def native_character(raw_path: Path, max_size: tuple[int, int], rich_palette: bool = False) -> Image.Image:
    raw = Image.open(raw_path).convert("RGBA")
    crop = raw.crop(significant_alpha_bbox(raw))
    max_w, max_h = max_size
    scale = min(max_w / crop.width, max_h / crop.height)
    size = (max(1, round(crop.width * scale)), max(1, round(crop.height * scale)))
    crop = crop.resize(size, Image.Resampling.BOX)
    crop = (
        remap_to_palette(crop, opaque_palette([RICH, RICH_CURB]))
        if rich_palette
        else adaptive_reduce(crop, 16)
    )
    canvas = Image.new("RGBA", (80, 96), (0, 0, 0, 0))
    canvas.alpha_composite(crop, (40 - crop.width // 2, 89 - crop.height))
    return binary_alpha(canvas)


def font(size: int = 14) -> ImageFont.ImageFont:
    try:
        return ImageFont.truetype("DejaVuSans.ttf", size)
    except OSError:
        return ImageFont.load_default()


def strip_board(title: str, items: list[tuple[str, Path]], scale: int, out_name: str) -> None:
    label_h = 42
    cell_w = 80 * scale
    cell_h = 96 * scale + label_h
    board = Image.new("RGBA", (cell_w * len(items), cell_h), (18, 20, 27, 255))
    draw = ImageDraw.Draw(board)
    for i, (label, path) in enumerate(items):
        x = i * cell_w
        art = Image.open(path).convert("RGBA").resize((80 * scale, 96 * scale), Image.Resampling.NEAREST)
        board.alpha_composite(art, (x, label_h))
        draw.text((x + 5, 5), label, fill=(244, 244, 248, 255), font=font(12 if scale == 1 else 14))
        draw.line((x, label_h + 88 * scale, x + cell_w - 1, label_h + 88 * scale), fill=(255, 70, 170, 255), width=max(1, scale // 2))
    draw.text((6, cell_h - 18), title, fill=(170, 175, 190, 255), font=font(10))
    board.convert("RGB").save(REVIEW / out_name, optimize=True)


def place_actor(scene: Image.Image, actor: Image.Image, x_contact: int, y_contact: int = 372) -> None:
    scene.alpha_composite(actor.convert("RGBA"), (x_contact - 40, y_contact - 88))


def context_board(out_name: str, panels: list[tuple[str, Path, list[tuple[Path, int]]]]) -> None:
    scale = 2
    label_h = 36
    board = Image.new("RGBA", (270 * scale * len(panels), 480 * scale + label_h), (16, 18, 24, 255))
    draw = ImageDraw.Draw(board)
    for i, (label, env_path, actors) in enumerate(panels):
        panel = Image.open(env_path).convert("RGBA")
        for actor_path, x in actors:
            place_actor(panel, Image.open(actor_path).convert("RGBA"), x)
        x0 = i * 270 * scale
        board.alpha_composite(panel.resize((270 * scale, 480 * scale), Image.Resampling.NEAREST), (x0, label_h))
        draw.text((x0 + 8, 8), label, fill=(244, 244, 248, 255), font=font(14))
    board.convert("RGB").save(REVIEW / out_name, optimize=True)


def technical_fact(path: Path, kind: str) -> dict[str, object]:
    image = Image.open(path).convert("RGBA")
    alpha = sorted(set(image.getchannel("A").getdata()))
    bbox = image.getchannel("A").getbbox()
    opaque_colors = {
        rgb
        for rgb, a in zip(image.convert("RGB").getdata(), image.getchannel("A").getdata())
        if a
    }
    return {
        "path": path.relative_to(REPO).as_posix(),
        "kind": kind,
        "sha256": sha256(path),
        "dimensions": list(image.size),
        "mode": image.mode,
        "alpha_values": alpha,
        "opaque_rgb_colors": len(opaque_colors),
        "opaque_bbox": list(bbox) if bbox else None,
        "contact": [40, 88],
    }


def main() -> None:
    NATIVE.mkdir(parents=True, exist_ok=True)
    REVIEW.mkdir(parents=True, exist_ok=True)
    facts = []
    paths: dict[str, Path] = {}
    for name, (raw_name, max_size, kind) in SPECS.items():
        out = NATIVE / name
        native_character(RAW / raw_name, max_size, name.startswith("rich_hookah")).save(out, optimize=True)
        paths[name] = out
        facts.append(technical_fact(out, kind))

    family = [("RICH", RICH), ("MOM", paths["mom_neutral_80x96.png"]), ("DAD", paths["dad_neutral_80x96.png"]), ("SISTER", paths["sister_neutral_80x96.png"])]
    strip_board("ART SHIP 013 / FAMILY / NATIVE 1X", family, 1, "01_family_native_1x.png")
    strip_board("ART SHIP 013 / FAMILY / EXACT 6X", family, 6, "02_family_exact_6x.png")
    context_board("03_family_context_2x.png", [("FAMILY HOUSE / REVIEW ONLY", FAMILY_ENV, [(paths["mom_neutral_80x96.png"], 48), (RICH, 113), (paths["dad_neutral_80x96.png"], 178), (paths["sister_neutral_80x96.png"], 228)])])

    porto = [("PORTO RICH", PORTO_RICH), ("WIFE", paths["portobello_wife_neutral_80x96.png"]), ("KID 1", paths["portobello_kid1_neutral_80x96.png"]), ("KID 2", paths["portobello_kid2_neutral_80x96.png"])]
    strip_board("ART SHIP 013 / PORTOBELLO HOUSEHOLD / NATIVE 1X", porto, 1, "04_portobello_household_native_1x.png")
    strip_board("ART SHIP 013 / PORTOBELLO HOUSEHOLD / EXACT 6X", porto, 6, "05_portobello_household_exact_6x.png")
    context_board("06_portobello_contexts_2x.png", [
        ("BEDROOM / FAMILY LINEUP", PORTO_ENV["bedroom"], [(paths["portobello_wife_neutral_80x96.png"], 45), (PORTO_RICH, 108), (paths["portobello_kid1_neutral_80x96.png"], 169), (paths["portobello_kid2_neutral_80x96.png"], 222)]),
        ("PORCH / WARM DOMESTIC BEAT", PORTO_ENV["porch"], [(PORTO_RICH, 100), (paths["portobello_wife_neutral_80x96.png"], 168)]),
    ])

    continuity = [("STANDING", RICH), ("CURB", RICH_CURB), ("ON STAGE", RICH_STAGE), ("CURRENT DRIFT", RICH_HOOKAH_OLD), ("CORRECTED", paths["rich_hookah_seated_corrected_80x96.png"])]
    strip_board("ART SHIP 013 / RICH CONTINUITY / NATIVE 1X", continuity, 1, "07_rich_continuity_native_1x.png")
    strip_board("ART SHIP 013 / RICH CONTINUITY / EXACT 6X", continuity, 6, "08_rich_continuity_exact_6x.png")

    (SHIP / "CANDIDATE_TECHNICAL_FACTS.json").write_text(json.dumps({"assets": facts}, indent=2) + "\n", encoding="utf-8")
    raw_hashes = [
        {"path": p.relative_to(REPO).as_posix(), "sha256": sha256(p), "selected": "rejected" not in p.name}
        for p in sorted(RAW.glob("*.png"))
    ]
    (SHIP / "RAW_GENERATION_HASHES.json").write_text(json.dumps({"source_renders": raw_hashes}, indent=2) + "\n", encoding="utf-8")
    print(f"Built {len(facts)} native candidates and 8 review boards.")


if __name__ == "__main__":
    main()
