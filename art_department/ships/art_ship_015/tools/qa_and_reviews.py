from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any

from PIL import Image, ImageDraw, ImageFont
from build_candidates import avatar_from_master


ROOT = Path(__file__).resolve().parents[4]
SHIP = ROOT / "art_department" / "ships" / "art_ship_015"
NATIVE = SHIP / "candidates" / "native"
REVIEW = SHIP / "review"
FONT = ImageFont.load_default()


SPECS = [
    {
        "id": "A-family-brother1",
        "file": "A-family-brother1.png",
        "state": "NEUTRAL",
        "contact_or_origin": {"contact": [40, 88]},
        "canon": "Ube/HQ Art Ship 015 older-brother decision + VOL2/VOL5 OPEN family card",
        "source": "source_generation/brother1_source.png",
    },
    {
        "id": "A-family-brother2",
        "file": "A-family-brother2.png",
        "state": "NEUTRAL",
        "contact_or_origin": {"contact": [40, 88]},
        "canon": "Ube/HQ Art Ship 015 younger-brother decision + VOL2/VOL5 OPEN family card",
        "source": "source_generation/brother2_source.png",
    },
    {
        "id": "A-family-brother1-avatar",
        "file": "A-family-brother1-avatar.png",
        "state": "FAMILY_THREAD_AVATAR",
        "contact_or_origin": {"origin": [0, 0], "contact": None},
        "canon": "Exact-pixel portrait derivative of A-family-brother1; no new identity",
        "source": "candidates/native/A-family-brother1.png",
    },
    {
        "id": "A-family-brother2-avatar",
        "file": "A-family-brother2-avatar.png",
        "state": "FAMILY_THREAD_AVATAR",
        "contact_or_origin": {"origin": [0, 0], "contact": None},
        "canon": "Exact-pixel portrait derivative of A-family-brother2; no new identity",
        "source": "candidates/native/A-family-brother2.png",
    },
    {
        "id": "A-god",
        "file": "A-god-seated_on_curb.png",
        "state": "SEATED_ON_CURB",
        "contact_or_origin": {"contact": [40, 88], "stage_contact": [158, 406]},
        "canon": "Original VOL2 God definition reaffirmed by Ube/HQ; pure-light proposal revoked",
        "source": "source_generation/god_states_source.png",
    },
    {
        "id": "A-god",
        "file": "A-god-fading.png",
        "state": "FADING",
        "contact_or_origin": {"contact": [40, 88], "stage_contact": [158, 406]},
        "canon": "Exact-identity subtractive derivative of SEATED_ON_CURB with sparse edge motes",
        "source": "candidates/native/A-god-seated_on_curb.png",
    },
    {
        "id": "A-og-hooper",
        "file": "A-og-hooper.png",
        "state": "NEUTRAL / COURT_READY",
        "contact_or_origin": {"contact": [40, 88]},
        "canon": "Ube/HQ Art Ship 015 OG Hooper decision + VOL2 OPEN identity row",
        "source": "source_generation/og_hooper_source.png",
    },
]


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for block in iter(lambda: f.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


def image_stats(path: Path) -> dict[str, Any]:
    image = Image.open(path).convert("RGBA")
    alpha = image.getchannel("A")
    alpha_values = sorted({a for a in alpha.getdata()})
    rgba_colors = image.getcolors(image.width * image.height) or []
    opaque_rgb = {
        (r, g, b)
        for _, (r, g, b, a) in rgba_colors
        if a == 255
    }
    return {
        "dimensions": [image.width, image.height],
        "mode": "RGBA",
        "alpha_values": alpha_values,
        "binary_alpha": set(alpha_values).issubset({0, 255}),
        "visible_bbox": list(alpha.getbbox()) if alpha.getbbox() else None,
        "visible_pixels": sum(1 for a in alpha.getdata() if a),
        "opaque_rgb_colors": len(opaque_rgb),
        "sha256": sha256(path),
    }


def checker(size: tuple[int, int], cell: int = 8) -> Image.Image:
    image = Image.new("RGBA", size, (15, 20, 32, 255))
    draw = ImageDraw.Draw(image)
    for y in range(0, size[1], cell):
        for x in range(0, size[0], cell):
            if (x // cell + y // cell) % 2:
                draw.rectangle((x, y, x + cell - 1, y + cell - 1), fill=(24, 31, 48, 255))
    return image


def label(draw: ImageDraw.ImageDraw, xy: tuple[int, int], text: str) -> None:
    draw.text(xy, text, font=FONT, fill=(239, 229, 194, 255))


def save_native_contact_sheet() -> None:
    width = len(SPECS) * 92
    board = checker((width, 116), 8)
    draw = ImageDraw.Draw(board)
    for i, spec in enumerate(SPECS):
        sprite = Image.open(NATIVE / spec["file"]).convert("RGBA")
        x = i * 92 + 6
        board.alpha_composite(sprite, (x, 14))
        label(draw, (x, 2), spec["state"][:13])
    board.save(REVIEW / "native_review_1x.png")


def save_integer_enlargement() -> None:
    scale = 8
    cols = 4
    cell_w, cell_h = 80 * scale + 20, 96 * scale + 34
    rows = (len(SPECS) + cols - 1) // cols
    board = checker((cols * cell_w, rows * cell_h), 16)
    draw = ImageDraw.Draw(board)
    for i, spec in enumerate(SPECS):
        sprite = Image.open(NATIVE / spec["file"]).convert("RGBA")
        enlarged = sprite.resize((80 * scale, 96 * scale), Image.Resampling.NEAREST)
        x = (i % cols) * cell_w + 10
        y = (i // cols) * cell_h + 24
        board.alpha_composite(enlarged, (x, y))
        label(draw, (x, y - 16), f'{spec["id"]} / {spec["state"]}')
    board.save(REVIEW / "candidate_review_8x_nearest.png")


def save_surgical_reviews() -> None:
    god_names = [
        ("SEATED_ON_CURB", "A-god-seated_on_curb.png"),
        ("FADING", "A-god-fading.png"),
    ]
    god_native = checker((176, 116), 8)
    god_native_draw = ImageDraw.Draw(god_native)
    for i, (state, name) in enumerate(god_names):
        sprite = Image.open(NATIVE / name).convert("RGBA")
        x = 6 + i * 86
        god_native.alpha_composite(sprite, (x, 14))
        label(god_native_draw, (x, 2), state)
    god_native.save(REVIEW / "god_native_review_1x.png")

    scale = 8
    god_large = checker((2 * (80 * scale + 16), 96 * scale + 32), 16)
    god_large_draw = ImageDraw.Draw(god_large)
    for i, (state, name) in enumerate(god_names):
        sprite = Image.open(NATIVE / name).convert("RGBA")
        sprite = sprite.resize((80 * scale, 96 * scale), Image.Resampling.NEAREST)
        x = 8 + i * (80 * scale + 16)
        god_large.alpha_composite(sprite, (x, 24))
        label(god_large_draw, (x, 6), state)
    god_large.save(REVIEW / "god_enlarged_review_8x_nearest.png")

    og = Image.open(NATIVE / "A-og-hooper.png").convert("RGBA")
    og_native = checker((92, 116), 8)
    og_native_draw = ImageDraw.Draw(og_native)
    og_native.alpha_composite(og, (6, 14))
    label(og_native_draw, (6, 2), "COURT_READY")
    og_native.save(REVIEW / "og_hooper_native_review_1x.png")

    og_large = checker((80 * scale + 16, 96 * scale + 32), 16)
    og_large_draw = ImageDraw.Draw(og_large)
    og_large.alpha_composite(og.resize((80 * scale, 96 * scale), Image.Resampling.NEAREST), (8, 24))
    label(og_large_draw, (8, 6), "NEUTRAL / COURT_READY — SLEEVELESS TEE")
    og_large.save(REVIEW / "og_hooper_enlarged_review_8x_nearest.png")


def save_family_board() -> None:
    paths = [
        ("RICH", ROOT / "assets" / "rich_standing_right.png"),
        ("MOM", ROOT / "assets" / "before_the_fame" / "characters" / "mom" / "mom_neutral_80x96.png"),
        ("DAD", ROOT / "assets" / "before_the_fame" / "characters" / "dad" / "dad_neutral_80x96.png"),
        ("SISTER", ROOT / "assets" / "before_the_fame" / "characters" / "sister" / "sister_neutral_80x96.png"),
        ("BROTHER 1 CANDIDATE", NATIVE / "A-family-brother1.png"),
        ("BROTHER 2 CANDIDATE", NATIVE / "A-family-brother2.png"),
    ]
    scale = 6
    cell_w, cell_h = 80 * scale + 16, 96 * scale + 32
    board = checker((len(paths) * cell_w, cell_h), 12)
    draw = ImageDraw.Draw(board)
    for i, (name, path) in enumerate(paths):
        sprite = Image.open(path).convert("RGBA")
        sprite = sprite.resize((80 * scale, 96 * scale), Image.Resampling.NEAREST)
        x = i * cell_w + 8
        board.alpha_composite(sprite, (x, 24))
        label(draw, (x, 6), name)
    board.save(REVIEW / "family_comparison_board_6x_nearest.png")


def place_contact(scene: Image.Image, sprite: Image.Image, contact: tuple[int, int]) -> None:
    x = contact[0] - 40
    y = contact[1] - 88
    scene.alpha_composite(sprite.convert("RGBA"), (x, y))


def save_god_staging() -> None:
    env = Image.open(ROOT / "assets" / "powder_springs_night_270x480.png").convert("RGBA")
    rich = Image.open(ROOT / "assets" / "rich_curb_chilling.png").convert("RGBA")
    god = Image.open(NATIVE / "A-god-seated_on_curb.png").convert("RGBA")
    staged = env.copy()
    place_contact(staged, rich, (112, 406))
    place_contact(staged, god, (158, 406))
    staged.save(REVIEW / "god_curb_staging_native_1x.png")
    staged.resize((810, 1440), Image.Resampling.NEAREST).save(REVIEW / "god_curb_staging_3x_nearest.png")


def save_og_staging() -> None:
    env = Image.open(
        ROOT / "assets" / "before_the_fame" / "environments" / "venice" / "venice_courts_night_270x480.png"
    ).convert("RGBA")
    og = Image.open(NATIVE / "A-og-hooper.png").convert("RGBA")
    staged = env.copy()
    place_contact(staged, og, (135, 408))
    staged.save(REVIEW / "og_hooper_court_staging_native_1x.png")
    staged.resize((810, 1440), Image.Resampling.NEAREST).save(REVIEW / "og_hooper_review_board_3x_nearest.png")


def duplicate_audit(candidate_rows: list[dict[str, Any]]) -> dict[str, Any]:
    candidate_hashes: dict[str, list[str]] = {}
    for row in candidate_rows:
        candidate_hashes.setdefault(row["sha256"], []).append(row["file"])
    corpus_hashes: dict[str, list[str]] = {}
    for path in ROOT.rglob("*.png"):
        if SHIP in path.parents:
            continue
        corpus_hashes.setdefault(sha256(path), []).append(path.relative_to(ROOT).as_posix())
    candidate_semantic: list[dict[str, Any]] = []
    candidate_images = {
        row["file"]: Image.open(NATIVE / row["file"]).convert("RGBA") for row in candidate_rows
    }
    names = list(candidate_images)
    for i, first in enumerate(names):
        for second in names[i + 1 :]:
            a, b = candidate_images[first], candidate_images[second]
            if a.size == b.size and a.tobytes() == b.tobytes():
                candidate_semantic.append({"first": first, "second": second})

    frozen_semantic: list[dict[str, Any]] = []
    frozen_manifest = ROOT / "art_department" / "ships" / "art_ship_014" / "FROZEN_CORPUS_SHA256SUMS.txt"
    frozen_paths = []
    for raw in frozen_manifest.read_text(encoding="utf-8").splitlines():
        if raw.strip():
            _, rel = raw.split(maxsplit=1)
            path = ROOT / rel.strip()
            if path.suffix.lower() == ".png":
                frozen_paths.append(path)
    by_size: dict[tuple[int, int], list[Path]] = {}
    for path in frozen_paths:
        try:
            with Image.open(path) as frozen_image:
                by_size.setdefault(frozen_image.size, []).append(path)
        except OSError:
            continue
    for name, candidate in candidate_images.items():
        data = candidate.tobytes()
        for path in by_size.get(candidate.size, []):
            with Image.open(path) as frozen_image:
                if frozen_image.convert("RGBA").tobytes() == data:
                    frozen_semantic.append(
                        {"candidate": name, "frozen_match": path.relative_to(ROOT).as_posix()}
                    )

    return {
        "candidate_internal_exact_duplicates": [v for v in candidate_hashes.values() if len(v) > 1],
        "candidate_internal_semantic_duplicates": candidate_semantic,
        "candidate_to_preexisting_exact_matches": [
            {"candidate": row["file"], "matches": corpus_hashes[row["sha256"]]}
            for row in candidate_rows
            if row["sha256"] in corpus_hashes
        ],
        "candidate_to_frozen_semantic_matches": frozen_semantic,
        "pass": all(len(v) == 1 for v in candidate_hashes.values())
        and not any(row["sha256"] in corpus_hashes for row in candidate_rows)
        and not candidate_semantic
        and not frozen_semantic,
    }


def frozen_verification() -> dict[str, Any]:
    manifest = ROOT / "art_department" / "ships" / "art_ship_014" / "FROZEN_CORPUS_SHA256SUMS.txt"
    rows = []
    for raw in manifest.read_text(encoding="utf-8").splitlines():
        if not raw.strip():
            continue
        expected, rel = raw.split(maxsplit=1)
        path = ROOT / rel.strip()
        actual = sha256(path) if path.exists() else None
        rows.append({"path": rel.strip(), "expected": expected, "actual": actual, "pass": actual == expected})
    failures = [row for row in rows if not row["pass"]]
    return {
        "baseline": "art_department/ships/art_ship_014/FROZEN_CORPUS_SHA256SUMS.txt",
        "expected_count": len(rows),
        "verified_count": len(rows) - len(failures),
        "failure_count": len(failures),
        "failures": failures,
        "pass": not failures,
    }


def derivative_audit() -> dict[str, Any]:
    avatar_pairs = [
        ("A-family-brother1.png", "A-family-brother1-avatar.png"),
        ("A-family-brother2.png", "A-family-brother2-avatar.png"),
    ]
    avatars = []
    for master_name, avatar_name in avatar_pairs:
        master = Image.open(NATIVE / master_name).convert("RGBA")
        avatar = Image.open(NATIVE / avatar_name).convert("RGBA")
        expected = avatar_from_master(master)
        avatars.append(
            {
                "master": master_name,
                "avatar": avatar_name,
                "exact_crop_derivative": avatar.tobytes() == expected.tobytes(),
                "master_sha256": sha256(NATIVE / master_name),
            }
        )

    seated = Image.open(NATIVE / "A-god-seated_on_curb.png").convert("RGBA")
    fading = Image.open(NATIVE / "A-god-fading.png").convert("RGBA")
    glow = (226, 166, 65, 255)
    identity_preserved = True
    for source_px, fade_px in zip(seated.getdata(), fading.getdata()):
        if fade_px[3] and fade_px != glow and fade_px != source_px:
            identity_preserved = False
            break
    god = {
        "master": "A-god-seated_on_curb.png",
        "derivative": "A-god-fading.png",
        "operation": "subtractive pixel fade plus declared warm edge/mote colors",
        "surviving_identity_pixels_unchanged": identity_preserved,
    }
    return {
        "avatars": avatars,
        "god_fading": god,
        "pass": all(x["exact_crop_derivative"] for x in avatars) and identity_preserved,
    }


def surgical_regression() -> dict[str, Any]:
    delta = json.loads((SHIP / "SURGICAL_PIXEL_DELTA.json").read_text(encoding="utf-8"))
    brother_names = [
        "A-family-brother1.png",
        "A-family-brother2.png",
        "A-family-brother1-avatar.png",
        "A-family-brother2-avatar.png",
    ]
    brother_results = {
        name: sha256(NATIVE / name) == delta["before_hashes"][name] for name in brother_names
    }

    god_allowed = {(33, 39), (40, 39), (30, 40), (48, 43), (24, 48), (22, 59), (58, 62), (57, 70), (54, 82)}
    god_results = {}
    for name in ("A-god-seated_on_curb.png", "A-god-fading.png"):
        before = Image.open(SHIP / "evidence" / "pre_surgical_correction" / name).convert("RGBA")
        after = Image.open(NATIVE / name).convert("RGBA")
        changed = {
            (x, y)
            for y in range(96)
            for x in range(80)
            if before.getpixel((x, y)) != after.getpixel((x, y))
        }
        god_results[name] = {
            "changed_pixel_count": len(changed),
            "changed_only_allowed_edge_pixels": changed.issubset(god_allowed),
            "changed_pixels": [list(p) for p in sorted(changed)],
        }

    og_name = "A-og-hooper.png"
    og_before = Image.open(SHIP / "evidence" / "pre_surgical_correction" / og_name).convert("RGBA")
    og_after = Image.open(NATIVE / og_name).convert("RGBA")
    og_changed = {
        (x, y)
        for y in range(96)
        for x in range(80)
        if og_before.getpixel((x, y)) != og_after.getpixel((x, y))
    }
    def in_garment(x: int, y: int) -> bool:
        if not 35 <= y <= 60:
            return False
        if y <= 39:
            left, right = 33, 47
        elif y <= 47:
            left, right = 31, 49
        else:
            left, right = 32, 50
        return left <= x <= right
    alpha_unchanged = all(
        og_before.getpixel((x, y))[3] == og_after.getpixel((x, y))[3] for x, y in og_changed
    )
    og_result = {
        "changed_pixel_count": len(og_changed),
        "changed_only_upper_garment_region": all(in_garment(x, y) for x, y in og_changed),
        "alpha_and_silhouette_unchanged": alpha_unchanged,
    }
    passed = (
        all(brother_results.values())
        and all(v["changed_only_allowed_edge_pixels"] for v in god_results.values())
        and og_result["changed_only_upper_garment_region"]
        and og_result["alpha_and_silhouette_unchanged"]
    )
    return {
        "brother_files": brother_results,
        "god": god_results,
        "og_hooper": og_result,
        "pass": passed,
    }
def main() -> None:
    REVIEW.mkdir(parents=True, exist_ok=True)
    candidate_rows = []
    for spec in SPECS:
        row = dict(spec)
        row.update(image_stats(NATIVE / spec["file"]))
        row["path"] = f'art_department/ships/art_ship_015/candidates/native/{spec["file"]}'
        row["technical_pass"] = (
            row["dimensions"] == [80, 96]
            and row["mode"] == "RGBA"
            and row["binary_alpha"]
            and row["visible_bbox"] is not None
        )
        candidate_rows.append(row)

    duplicate = duplicate_audit(candidate_rows)
    frozen = frozen_verification()
    derivatives = derivative_audit()
    regression = surgical_regression()
    report = {
        "ship": "ART SHIP 015 — SURGICAL CORRECTIONS",
        "status": "CANDIDATE — READY FOR FINAL UBE/HQ TASTE PASS",
        "candidate_count": len(candidate_rows),
        "all_candidate_technical_checks_pass": all(r["technical_pass"] for r in candidate_rows),
        "all_alpha_binary": all(r["binary_alpha"] for r in candidate_rows),
        "duplicate_audit_pass": duplicate["pass"],
        "preexisting_frozen_corpus_unchanged": frozen["pass"],
        "derivative_audit_pass": derivatives["pass"],
        "surgical_regression_pass": regression["pass"],
        "candidates": candidate_rows,
    }
    (SHIP / "CANDIDATE_QA.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    (SHIP / "DUPLICATE_AUDIT.json").write_text(json.dumps(duplicate, indent=2) + "\n", encoding="utf-8")
    (SHIP / "FROZEN_CORPUS_VERIFICATION.json").write_text(json.dumps(frozen, indent=2) + "\n", encoding="utf-8")
    (SHIP / "DERIVATIVE_AUDIT.json").write_text(json.dumps(derivatives, indent=2) + "\n", encoding="utf-8")
    (SHIP / "SURGICAL_REGRESSION_REPORT.json").write_text(json.dumps(regression, indent=2) + "\n", encoding="utf-8")
    manifest = {
        "ship": "ART SHIP 015",
        "title": "SURGICAL CORRECTIONS",
        "status": "CANDIDATE — READY FOR FINAL UBE/HQ TASTE PASS",
        "authority": "Ube/HQ request dated 2026-09-27; current frozen authority ART SHIP 014 at f1ae59a",
        "scope": [
            "A-family-brother1",
            "A-family-brother2",
            "A-family-brother1-avatar",
            "A-family-brother2-avatar",
            "A-god:SEATED_ON_CURB",
            "A-god:FADING",
            "A-og-hooper",
        ],
        "approval_status": "Not approved, not frozen, not runtime-integrated",
        "candidate_files": candidate_rows,
        "qa": {
            "technical": report["all_candidate_technical_checks_pass"],
            "binary_alpha": report["all_alpha_binary"],
            "duplicates": duplicate["pass"],
            "derivatives": derivatives["pass"],
            "frozen_corpus_unchanged": frozen["pass"],
        },
    }
    (SHIP / "ART_SHIP_MANIFEST.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    sums = "".join(f'{row["sha256"]}  candidates/native/{row["file"]}\n' for row in candidate_rows)
    (SHIP / "CANDIDATE_SHA256SUMS.txt").write_text(sums, encoding="utf-8")

    save_native_contact_sheet()
    save_integer_enlargement()
    save_surgical_reviews()
    save_family_board()
    save_god_staging()
    save_og_staging()

    if not (
        report["all_candidate_technical_checks_pass"]
        and duplicate["pass"]
        and frozen["pass"]
        and derivatives["pass"]
        and regression["pass"]
    ):
        raise SystemExit("QA failed; inspect Ship 015 reports")


if __name__ == "__main__":
    main()
