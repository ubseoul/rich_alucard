from __future__ import annotations

from pathlib import Path
from PIL import Image


ROOT = Path(__file__).resolve().parents[4]
SHIP = ROOT / "art_department" / "ships" / "art_ship_015"
SRC = SHIP / "source_generation"
OUT = SHIP / "candidates" / "native"


def alpha_bbox(image: Image.Image) -> tuple[int, int, int, int]:
    # Built-in generations can carry nearly invisible fringe alpha far from the
    # authored sprite. Ignore it when establishing the native-grid crop.
    alpha = image.getchannel("A").point(lambda a: 255 if a >= 128 else 0)
    bbox = alpha.getbbox()
    if bbox is None:
        raise ValueError("source contains no visible pixels")
    return bbox


def isolate_half(image: Image.Image, side: str) -> Image.Image:
    midpoint = image.width // 2
    if side == "left":
        return image.crop((0, 0, midpoint, image.height))
    if side == "right":
        return image.crop((midpoint, 0, image.width, image.height))
    raise ValueError(side)


def quantize_rgba(image: Image.Image, colors: int) -> Image.Image:
    image = image.convert("RGBA")
    alpha = image.getchannel("A").point(lambda a: 255 if a >= 128 else 0)
    # FASTOCTREE supports RGBA and gives a compact cartridge-scale palette.
    quantized = image.quantize(colors=colors, method=Image.Quantize.FASTOCTREE).convert("RGBA")
    quantized.putalpha(alpha)
    return quantized


def remove_isolated_alpha(image: Image.Image) -> Image.Image:
    """Remove only one-pixel islands; do not smooth silhouettes or fill holes."""
    px = image.load()
    clear: list[tuple[int, int]] = []
    for y in range(image.height):
        for x in range(image.width):
            if px[x, y][3] == 0:
                continue
            neighbors = 0
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    if dx == 0 and dy == 0:
                        continue
                    xx, yy = x + dx, y + dy
                    if 0 <= xx < image.width and 0 <= yy < image.height and px[xx, yy][3] != 0:
                        neighbors += 1
            if neighbors == 0:
                clear.append((x, y))
    for x, y in clear:
        px[x, y] = (0, 0, 0, 0)
    return image


def reconstruct(
    source: Image.Image,
    target_size: tuple[int, int],
    contact: tuple[int, int],
    palette_colors: int,
    crop_padding: int = 0,
) -> Image.Image:
    source = source.convert("RGBA")
    bbox = alpha_bbox(source)
    left = max(0, bbox[0] - crop_padding)
    top = max(0, bbox[1] - crop_padding)
    right = min(source.width, bbox[2] + crop_padding)
    bottom = min(source.height, bbox[3] + crop_padding)
    crop = source.crop((left, top, right, bottom))
    crop = crop.resize(target_size, Image.Resampling.NEAREST)
    crop = quantize_rgba(crop, palette_colors)
    crop = remove_isolated_alpha(crop)

    canvas = Image.new("RGBA", (80, 96), (0, 0, 0, 0))
    # Contact is the center-bottom registration point. Visible feet may reach it,
    # while the final eight rows remain the established transparent safety band.
    x = contact[0] - crop.width // 2
    y = contact[1] - crop.height
    canvas.alpha_composite(crop, (x, y))
    return canvas


def avatar_from_master(master: Image.Image) -> Image.Image:
    """Exact-pixel portrait crop: preserve source pixels and palette without repainting."""
    master = master.convert("RGBA")
    bbox = alpha_bbox(master)
    height = bbox[3] - bbox[1]
    # Retain head, torso and clothing identity; crop before the lower-body read.
    portrait_bottom = bbox[1] + max(24, round(height * 0.62))
    portrait = master.crop((bbox[0], bbox[1], bbox[2], min(bbox[3], portrait_bottom)))
    canvas = Image.new("RGBA", (80, 96), (0, 0, 0, 0))
    x = 40 - portrait.width // 2
    y = 48 - portrait.height // 2
    canvas.alpha_composite(portrait, (x, y))
    return canvas


def fading_from_master(master: Image.Image) -> Image.Image:
    """Exact-identity fading derivative: subtract pixels and add sparse edge motes only."""
    image = master.copy().convert("RGBA")
    px = image.load()
    bbox = alpha_bbox(image)
    fade_start = bbox[0] + round((bbox[2] - bbox[0]) * 0.72)
    for y in range(bbox[1], bbox[3]):
        for x in range(fade_start, bbox[2]):
            if px[x, y][3] and ((x * 3 + y * 5) % 7) < (x - fade_start + 1):
                px[x, y] = (0, 0, 0, 0)

    # Tiny warm edge notes; no filled glow body, halo, or soft alpha.
    glow = (226, 166, 65, 255)
    for x, y in ((55, 42), (58, 46), (57, 53), (61, 57), (59, 64), (63, 69), (58, 76)):
        if 0 <= x < image.width and 0 <= y < image.height:
            px[x, y] = glow
    return image


def save(name: str, image: Image.Image) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    image.save(OUT / name, optimize=False)


def main() -> None:
    brother1 = reconstruct(
        Image.open(SRC / "brother1_source.png"),
        target_size=(38, 64),
        contact=(40, 88),
        palette_colors=15,
    )
    brother2 = reconstruct(
        Image.open(SRC / "brother2_source.png"),
        target_size=(35, 61),
        contact=(40, 88),
        palette_colors=16,
    )
    god_sheet = Image.open(SRC / "god_states_source.png").convert("RGBA")
    god_seated = reconstruct(
        isolate_half(god_sheet, "left"),
        target_size=(38, 49),
        contact=(40, 88),
        palette_colors=17,
    )
    god_fading = fading_from_master(god_seated)
    og_hooper = reconstruct(
        Image.open(SRC / "og_hooper_source.png"),
        target_size=(36, 65),
        contact=(40, 88),
        palette_colors=17,
    )

    save("A-family-brother1.png", brother1)
    save("A-family-brother2.png", brother2)
    save("A-family-brother1-avatar.png", avatar_from_master(brother1))
    save("A-family-brother2-avatar.png", avatar_from_master(brother2))
    save("A-god-seated_on_curb.png", god_seated)
    save("A-god-fading.png", god_fading)
    save("A-og-hooper.png", og_hooper)


if __name__ == "__main__":
    main()
