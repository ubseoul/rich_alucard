#!/usr/bin/env python3
"""Build closeout review evidence without modifying candidate pixels."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


SHIP = Path(__file__).resolve().parents[1]
CANDIDATES = SHIP / "candidates" / "native" / "characters"
REJECTED = SHIP / "rejected"
REVIEW = SHIP / "review"

PASSED = [
    ("PORTOBELLO MANAGER", CANDIDATES / "portobello_manager_neutral_80x96.png"),
    ("NAIJA MART AUNTIE", CANDIDATES / "auntie_register_neutral_80x96.png"),
    ("OCEAN SOUL", CANDIDATES / "ocean_soul_climbing_80x96.png"),
    ("TRAINING DUMMY", CANDIDATES / "training_dummy_combat_80x96.png"),
]

REJECTS = [
    ("REJECTED: INITIAL NATURALISTIC", REJECTED / "buckhead_initial_naturalistic_rejected_80x96.png"),
    ("REJECTED: DETERMINISTIC REDRAW", REJECTED / "buckhead_deterministic_native_grid_rejected_80x96.png"),
]


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


def board(entries: list[tuple[str, Path]], scale: int, filename: str, rejected: bool = False) -> None:
    label_h = 34 if scale == 1 else 46
    art_w, art_h = 80 * scale, 96 * scale
    cell_w, cell_h = max(160, art_w), art_h + label_h
    out = Image.new("RGB", (cell_w * len(entries), cell_h), (18, 21, 28))
    draw = ImageDraw.Draw(out)
    for index, (label, path) in enumerate(entries):
        cell_x = index * cell_w
        x = cell_x + (cell_w - art_w) // 2
        bg = checker((art_w, art_h), max(4, 4 * scale))
        art = Image.open(path).convert("RGBA").resize((art_w, art_h), Image.Resampling.NEAREST)
        bg.paste(art, (0, 0), art)
        out.paste(bg, (x, label_h))
        color = (255, 110, 110) if rejected else (126, 225, 169)
        draw.text((cell_x + 4, 7), label, fill=color, font=font(7 if scale == 1 else 11))
        draw.line((x, label_h + 88 * scale, x + art_w - 1, label_h + 88 * scale), fill=(255, 70, 170), width=max(1, scale // 2))
    out.save(REVIEW / filename, optimize=True)


def main() -> None:
    REVIEW.mkdir(parents=True, exist_ok=True)
    board(PASSED, 1, "01_hq_passed_candidates_native_1x.png")
    board(PASSED, 4, "02_hq_passed_candidates_exact_4x.png")
    board(REJECTS, 4, "03_buckhead_rejected_provenance_exact_4x.png", rejected=True)
    print("Built 3 closeout review boards; candidate/rejected source bytes unchanged.")


if __name__ == "__main__":
    main()
