#!/usr/bin/env python3
"""Deterministically nativeize ART SHIP 010 retained source renders.

This script reads frozen references without modifying them. It produces only
Ship-local candidates, review boards, hashes and technical facts.
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
REVIEW = SHIP / "review_internal_player_blind"

RICH_SOURCE = REPO / "assets/rich_standing_right.png"
ROOFTOP = REPO / "assets/before_the_fame/environments/rooftop_dtla/downtown_la_rooftop_party_270x480.png"
PORTO_ENVIRONMENTS = {
    "standing": REPO / "assets/before_the_fame/environments/portobello_bedroom/portobello_beige_bedroom_270x480.png",
    "presenting": REPO / "assets/before_the_fame/environments/portobello_office/portobello_kpi_office_270x480.png",
    "porch_seated": REPO / "assets/before_the_fame/environments/portobello_porch/portobello_porch_dusk_270x480.png",
}
CHARACTERS = {
    "rich_portobello_standing": {"raw": "rich_portobello_standing_raw.png", "max": (31, 56)},
    "rich_portobello_presenting": {"raw": "rich_portobello_presenting_raw.png", "max": (44, 56)},
    "rich_portobello_porch_seated": {"raw": "rich_portobello_porch_seated_raw.png", "max": (43, 51)},
}
CROWD_REFERENCES = [
    REPO / "assets/before_the_fame/environments/hollow_bowl/layers/hollow_bowl_stage_band_crowd_overlay_270x480.png",
    REPO / "assets/before_the_fame/environments/catacomb/layers/catacomb_crowd_overlay_270x480.png",
]


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
    pixels = np.asarray(rgba).copy()
    pixels[:, :, :3][pixels[:, :, 3] == 0] = 0
    return Image.fromarray(pixels, "RGBA")


def adaptive_reduce(image: Image.Image, colors: int) -> Image.Image:
    rgba = binary_alpha(image)
    alpha = rgba.getchannel("A")
    rgb = rgba.convert("RGB").quantize(colors=colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert("RGB")
    out = rgb.convert("RGBA")
    out.putalpha(alpha)
    return binary_alpha(out)


def opaque_palette(paths: list[Path]) -> list[tuple[int, int, int]]:
    colors: set[tuple[int, int, int]] = set()
    for path in paths:
        rgba = Image.open(path).convert("RGBA")
        colors.update(rgb for rgb, a in zip(rgba.convert("RGB").getdata(), rgba.getchannel("A").getdata()) if a)
    return sorted(colors)


def remap_to_palette(image: Image.Image, palette: list[tuple[int, int, int]]) -> Image.Image:
    rgba = binary_alpha(image)
    pixels = np.asarray(rgba).copy()
    mask = pixels[:, :, 3] > 0
    if not mask.any():
        return rgba
    source = pixels[:, :, :3][mask].astype(np.int32)
    choices = np.asarray(palette, dtype=np.int32)
    distances = ((source[:, None, :] - choices[None, :, :]) ** 2).sum(axis=2)
    pixels[:, :, :3][mask] = choices[distances.argmin(axis=1)].astype(np.uint8)
    pixels[:, :, :3][~mask] = 0
    return Image.fromarray(pixels, "RGBA")


def native_character(raw_path: Path, max_size: tuple[int, int]) -> Image.Image:
    raw = Image.open(raw_path).convert("RGBA")
    crop = raw.crop(significant_alpha_bbox(raw))
    max_width, max_height = max_size
    scale = min(max_width / crop.width, max_height / crop.height)
    size = (max(1, round(crop.width * scale)), max(1, round(crop.height * scale)))
    crop = crop.resize(size, Image.Resampling.BOX)
    crop = adaptive_reduce(crop, 16)
    canvas = Image.new("RGBA", (80, 96), (0, 0, 0, 0))
    left = 40 - crop.width // 2
    top = 89 - crop.height
    canvas.alpha_composite(crop, (left, top))
    return binary_alpha(canvas)


def native_rooftop_layer(raw_path: Path) -> Image.Image:
    raw = crop_to_aspect(Image.open(raw_path).convert("RGBA"), 270, 480)
    layer = raw.resize((270, 480), Image.Resampling.BOX)
    alpha = np.asarray(layer.getchannel("A")).copy()
    alpha = np.where(alpha >= 128, 255, 0).astype(np.uint8)
    # Exact NC-FA-12 contract: conversation band only, behind contact, Rich corridor clear.
    alpha[:188, :] = 0
    alpha[372:, :] = 0
    alpha[196:372, 38:111] = 0
    # Keep the far-right party cluster out of the control-safe edge.
    alpha[:, 252:] = 0
    layer.putalpha(Image.fromarray(alpha, "L"))
    layer = remap_to_palette(layer, opaque_palette(CROWD_REFERENCES))
    return binary_alpha(layer)


def font(size: int = 16) -> ImageFont.ImageFont:
    try:
        return ImageFont.truetype("DejaVuSans.ttf", size)
    except OSError:
        return ImageFont.load_default()


def place_actor(scene: Image.Image, actor: Image.Image, x_contact: int, y_contact: int) -> Image.Image:
    out = scene.convert("RGBA").copy()
    out.alpha_composite(actor.convert("RGBA"), (x_contact - 40, y_contact - 88))
    return out


def character_board(paths: dict[str, Path]) -> None:
    refs = [("RICH SOURCE", RICH_SOURCE)] + [(name.upper().replace("RICH_PORTOBELLO_", "PORTO "), path) for name, path in paths.items()]
    scale = 6
    label_h = 34
    cell_w, cell_h = 80 * scale, 96 * scale + label_h
    board = Image.new("RGBA", (cell_w * len(refs), cell_h), (20, 21, 28, 255))
    draw = ImageDraw.Draw(board)
    for i, (label, path) in enumerate(refs):
        x = i * cell_w
        art = Image.open(path).convert("RGBA").resize((80 * scale, 96 * scale), Image.Resampling.NEAREST)
        board.alpha_composite(art, (x, label_h))
        draw.text((x + 8, 8), label, fill=(240, 240, 245, 255), font=font(14))
        draw.line((x, label_h + 88 * scale, x + cell_w - 1, label_h + 88 * scale), fill=(255, 70, 170, 255), width=2)
    board.convert("RGB").save(REVIEW / "01_rich_portobello_states_player_blind.png")


def context_board(paths: dict[str, Path]) -> None:
    panels = []
    mapping = [
        ("BEDROOM / STANDING", PORTO_ENVIRONMENTS["standing"], paths["rich_portobello_standing"], 135),
        ("OFFICE / PRESENTING", PORTO_ENVIRONMENTS["presenting"], paths["rich_portobello_presenting"], 92),
        ("PORCH / SEATED", PORTO_ENVIRONMENTS["porch_seated"], paths["rich_portobello_porch_seated"], 92),
    ]
    for label, env_path, actor_path, x in mapping:
        env = Image.open(env_path).convert("RGBA")
        actor = Image.open(actor_path).convert("RGBA")
        panels.append((label, place_actor(env, actor, x, 372)))
    scale = 2
    label_h = 34
    board = Image.new("RGBA", (270 * scale * 3, 480 * scale + label_h), (15, 16, 22, 255))
    draw = ImageDraw.Draw(board)
    for i, (label, panel) in enumerate(panels):
        x = i * 270 * scale
        board.alpha_composite(panel.resize((270 * scale, 480 * scale), Image.Resampling.NEAREST), (x, label_h))
        draw.text((x + 8, 8), label, fill=(240, 240, 245, 255), font=font(14))
        draw.line((x, label_h + 372 * scale, x + 270 * scale - 1, label_h + 372 * scale), fill=(255, 70, 170, 255), width=2)
    board.convert("RGB").save(REVIEW / "02_portobello_contexts_player_blind.png")


def rooftop_board(layer_path: Path) -> None:
    base = Image.open(ROOFTOP).convert("RGBA")
    layer = Image.open(layer_path).convert("RGBA")
    rich = Image.open(RICH_SOURCE).convert("RGBA")
    composite = place_actor(Image.alpha_composite(base, layer), rich, 72, 372)
    states = [("FROZEN BASE", base), ("ADDITIVE LAYER", layer), ("BASE + LAYER + RICH", composite)]
    scale = 2
    label_h = 34
    board = Image.new("RGBA", (270 * scale * 3, 480 * scale + label_h), (15, 16, 22, 255))
    draw = ImageDraw.Draw(board)
    for i, (label, art) in enumerate(states):
        x = i * 270 * scale
        board.alpha_composite(art.resize((270 * scale, 480 * scale), Image.Resampling.NEAREST), (x, label_h))
        draw.text((x + 8, 8), label, fill=(240, 240, 245, 255), font=font(14))
        draw.line((x, label_h + 372 * scale, x + 270 * scale - 1, label_h + 372 * scale), fill=(255, 70, 170, 255), width=2)
    board.convert("RGB").save(REVIEW / "03_rooftop_party_condition_player_blind.png")


def technical_fact(path: Path, kind: str) -> dict[str, object]:
    image = Image.open(path)
    rgba = image.convert("RGBA")
    alpha = sorted(set(rgba.getchannel("A").getdata()))
    opaque = [(rgb, a) for rgb, a in zip(rgba.convert("RGB").getdata(), rgba.getchannel("A").getdata()) if a]
    bbox = rgba.getchannel("A").getbbox()
    return {
        "path": path.relative_to(REPO).as_posix(),
        "kind": kind,
        "sha256": sha256(path),
        "dimensions": list(image.size),
        "mode": image.mode,
        "alpha_values": alpha,
        "opaque_rgb_colors": len({rgb for rgb, _ in opaque}),
        "opaque_bbox": list(bbox) if bbox else None,
    }


def main() -> None:
    for directory in [NATIVE / "characters", NATIVE / "layers", REVIEW]:
        directory.mkdir(parents=True, exist_ok=True)

    character_paths: dict[str, Path] = {}
    for name, spec in CHARACTERS.items():
        out = NATIVE / "characters" / f"{name}_80x96.png"
        native_character(RAW / spec["raw"], spec["max"]).save(out, optimize=True)
        character_paths[name] = out

    rooftop_path = NATIVE / "layers" / "rooftop_dtla_party_crowd_overlay_270x480.png"
    native_rooftop_layer(RAW / "rooftop_dtla_party_crowd_raw.png").save(rooftop_path, optimize=True)

    character_board(character_paths)
    context_board(character_paths)
    rooftop_board(rooftop_path)

    facts = [technical_fact(path, "character_anchor" if name.endswith("standing") else "character_state") for name, path in character_paths.items()]
    facts.append(technical_fact(rooftop_path, "environment_condition_layer"))
    (SHIP / "CANDIDATE_TECHNICAL_FACTS.json").write_text(json.dumps({"assets": facts}, indent=2) + "\n", encoding="utf-8")

    raw_hashes = [{"path": path.relative_to(REPO).as_posix(), "sha256": sha256(path), "selected": "_raw_v1" not in path.name} for path in sorted(RAW.glob("*.png"))]
    (SHIP / "RAW_GENERATION_HASHES.json").write_text(json.dumps({"source_renders": raw_hashes}, indent=2) + "\n", encoding="utf-8")
    print(f"Built {len(facts)} native candidates and 3 PLAYER-BLIND review boards.")


if __name__ == "__main__":
    main()
