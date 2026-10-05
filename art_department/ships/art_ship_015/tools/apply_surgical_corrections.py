from __future__ import annotations

import hashlib
import json
import shutil
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[4]
SHIP = ROOT / "art_department" / "ships" / "art_ship_015"
NATIVE = SHIP / "candidates" / "native"
EVIDENCE = SHIP / "evidence" / "pre_surgical_correction"

EXPECTED = {
    "A-family-brother1-avatar.png": "70f46469eba728c9aa9383654bfee46b722c2abe07cedfecc1dda65daf899d20",
    "A-family-brother1.png": "8ca1f2505a29b00df7629c5258921e58c820d1b97c3dd7bdb1df03bce56b71ef",
    "A-family-brother2-avatar.png": "3bfa7ab316eb03c6913b9869ba5dbf666273036d1c9c659eb94861af78d82dc3",
    "A-family-brother2.png": "9afe9279d0fcde25a7d24e9063ce73f0084ef7d3dd4b6c186b165164a271ec2d",
    "A-god-fading.png": "2136508b442c4531af3a606a504f1f4ae1992668ea336d0da27ce78fd57c5656",
    "A-god-seated_on_curb.png": "87ab26d0ce4f9345169727c23b00c145d672e89b1d0828fbb0b5cfc417081693",
    "A-og-hooper.png": "d8e83445df058f83ce5bf4d180d0ed232d5ff9cc22d5ac26bc3b0b7b62239041",
}


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def rgba(value: tuple[int, int, int, int]) -> list[int]:
    return list(value)


def main() -> None:
    before_hashes = {name: sha256(NATIVE / name) for name in EXPECTED}
    if before_hashes != EXPECTED:
        raise SystemExit("Pre-correction candidate hashes do not match HQ-reviewed inputs")

    EVIDENCE.mkdir(parents=True, exist_ok=True)
    for name in ("A-god-seated_on_curb.png", "A-god-fading.png", "A-og-hooper.png"):
        shutil.copy2(NATIVE / name, EVIDENCE / name)

    deltas: dict[str, list[dict[str, object]]] = {}

    # FIX 01: a handful of intentional warm edge pixels, distributed across
    # hair and wrap. Existing internal identity pixels remain untouched.
    cream = (232, 211, 162, 255)
    gold = (219, 165, 75, 255)
    god_points = {
        (33, 39): cream,
        (40, 39): cream,
        (30, 40): cream,
        (48, 43): cream,
        (24, 48): gold,
        (22, 59): gold,
        (58, 62): gold,
        (57, 70): gold,
        (54, 82): gold,
    }
    for name in ("A-god-seated_on_curb.png", "A-god-fading.png"):
        image = Image.open(NATIVE / name).convert("RGBA")
        changes = []
        for (x, y), new in god_points.items():
            old = image.getpixel((x, y))
            # Preserve the fading subtraction: do not restore an already-faded
            # pixel. The seated state receives every selected edge note.
            if name.endswith("fading.png") and old[3] == 0:
                continue
            if old != new:
                image.putpixel((x, y), new)
                changes.append({"x": x, "y": y, "before": rgba(old), "after": rgba(new)})
        image.save(NATIVE / name, optimize=False)
        deltas[name] = changes

    # FIX 02: change only the existing upper-garment pixels. Skin/arms remain
    # byte-identical, while the torso separates into a faded sleeveless tee.
    name = "A-og-hooper.png"
    image = Image.open(NATIVE / name).convert("RGBA")
    changes = []
    garment_map = {
        (158, 75, 41, 255): (126, 61, 45, 255),
        (106, 46, 28, 255): (83, 38, 36, 255),
        (135, 54, 33, 255): (104, 44, 38, 255),
        (102, 65, 39, 255): (99, 49, 40, 255),
    }
    for y in range(35, 61):
        if y <= 39:
            left, right = 33, 47
        elif y <= 47:
            left, right = 31, 49
        else:
            left, right = 32, 50
        for x in range(left, right + 1):
            old = image.getpixel((x, y))
            new = garment_map.get(old)
            if new is not None and new != old:
                image.putpixel((x, y), new)
                changes.append({"x": x, "y": y, "before": rgba(old), "after": rgba(new)})
    image.save(NATIVE / name, optimize=False)
    deltas[name] = changes

    after_hashes = {name: sha256(NATIVE / name) for name in EXPECTED}
    brother_names = [
        "A-family-brother1.png",
        "A-family-brother2.png",
        "A-family-brother1-avatar.png",
        "A-family-brother2-avatar.png",
    ]
    report = {
        "authority": "ART SHIP 015 — HQ TASTE REVIEW; NEEDS FIX — SURGICAL CORRECTION ONLY",
        "before_hashes": before_hashes,
        "after_hashes": after_hashes,
        "brother_files_byte_unchanged": all(before_hashes[n] == after_hashes[n] for n in brother_names),
        "changed_files": [name for name in EXPECTED if before_hashes[name] != after_hashes[name]],
        "pixel_deltas": deltas,
    }
    (SHIP / "SURGICAL_PIXEL_DELTA.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
