#!/usr/bin/env python3
"""F15 launch trio - production dancer sprite-sheet builder (reproducible).

Reads the FROZEN 688x688 RGBA masters (never modified, never copied into this repo) and writes
one PNG sprite sheet per dancer + manifest.json into assets/f15/dancers/.
Derived from tools/f15-stage-preview/build_derivatives.py @ 74fdd5ac (byte-identical output, verified).

Masters are read from the exact art commit; they are NOT part of this branch:
    python tools/f15/build_derivatives.py --from-git <path-to-any-clone-with-that-commit>
or from an already-extracted package directory:
    python tools/f15/build_derivatives.py --masters <dir>/f15-launch-trio-masters

Method (identical for all three dancers)
  * Frame order, count and 24 FPS are untouched: every master frame becomes one cell, including
    WOLF's exact A A B B duplicate pairs (no de-duplication, no interpolation, no retiming).
  * One fixed crop box per dancer (its own frozen occupied bounds, grown outward to the 3-px grid),
    applied to every frame - so nothing is recentred or rescaled frame by frame.
  * Grid is anchored at master (x=0, y=1) so the shared floor baseline (master y=664, exclusive) lies
    exactly on a cell boundary: derivative bottom edge == master baseline for all three dancers.
  * Exact integer 3:1 area (BOX) downsample on premultiplied alpha. No sharpening, no smoothing
    beyond the area average, no alpha edits, no clipping repair.
  * Cells are packed row-major into a PNG sheet (12 columns), frame i at (i % 12, i // 12).
"""
import argparse, hashlib, io, json, os, subprocess, sys, tarfile, tempfile
import numpy as np
from PIL import Image

ART_COMMIT = "7b034a92f602db70a044466188dcec983bab0ec9"
RUNTIME_REF = "4800055a96cf9ce06434c3451d5a4f61c6ec195d"
PKG = "art_department/production/f15-launch-trio-masters"
DANCERS = ["wolf", "dragon", "pink"]
DIV = 3
GRID_AX, GRID_AY = 0, 1          # grid origin; (664 - 1) % 3 == 0 puts the baseline on a boundary
BASELINE_Y = 664
ANCHOR_X = 344                   # master canvas centre; all three occupied unions are centred here (+-0.5)
COLS = 12
# Scene portraits (adventure actors are 80x96 boxes): frame 0 of each frozen master, one shared scale
# (96/600 = WOLF's occupied height) so relative size stays native; feet on the box bottom, anchor x on the box centre.
PORT_W, PORT_H, PORT_SCALE = 80, 96, 96.0 / 600.0


def sequence_hash(files):
    h = hashlib.sha256()
    for name, data in files:
        h.update(os.path.basename(name).encode("utf-8"))
        h.update(data)
    return h.hexdigest()


def extract_from_git(repo, dest):
    p = subprocess.run(["git", "-C", repo, "archive", "--format=tar", ART_COMMIT, PKG],
                       check=True, stdout=subprocess.PIPE)
    with tarfile.open(fileobj=io.BytesIO(p.stdout)) as t:
        t.extractall(dest)
    return os.path.join(dest, PKG)


# ---- WOLF v2 (STOVE N: thin outline, 4-px grid, cleaned gaps; creator-approved replacement) ---------------------------------------
V2_DIV = 4                      # the art is drawn on a 4-px grid, so 4:1 is the exact-integer area downsample (3:1 would alias it)
V2_HEIGHT_REF = 600             # the previous WOLF's occupied height in master px: Layout A's apparent size is preserved with scale_mul
def build_wolf_v2(pkg, out_dir, manifest):
    """Package: CANDIDATE_PENDING_UBE_REVIEW_v2_outline_4px_LAUNCH_PACKAGE (145 frames, 688x688 masters, translation (96,48)).
    Verifies the per-frame manifest + sequence hash (HASH_METHOD.md), then one FIXED transform for the whole sequence:
    crop = union of occupied pixels grown to the 4-px grid (origin 0,0), anchor x = union centre (344), baseline = union bottom.
    Frame order, count (145), timing (24 fps) and every pixel are kept; no de-duplication, retiming, alpha edit or clip repair."""
    meta = json.load(open(os.path.join(pkg, "animation.json"), encoding="utf-8"))
    fdir = os.path.join(pkg, "master_688_RGBA")
    names = sorted(f for f in os.listdir(fdir) if f.endswith(".png"))
    raw = [(f, open(os.path.join(fdir, f), "rb").read()) for f in names]
    mf = "".join(f + chr(9) + hashlib.sha256(d).hexdigest() + chr(10) for f, d in raw).encode("utf-8")
    got = hashlib.sha256(mf).hexdigest()
    want = meta["sequence_hashes"]["master_688_RGBA"]["sha256"]
    if got != want:
        sys.exit("wolf v2: master sequence hash mismatch %s != %s" % (got, want))
    n = len(raw)
    assert n == meta["frame_count"] == 145 and meta["fps"]["numerator"] == 24 and meta["fps"]["denominator"] == 1
    ux0 = uy0 = 10 ** 6; ux1 = uy1 = 0
    for f, d in raw:
        im = Image.open(io.BytesIO(d)); assert im.mode == "RGBA" and im.size == (688, 688)
        ys, xs = np.nonzero(np.array(im)[:, :, 3] > 0)
        ux0, ux1, uy0, uy1 = min(ux0, xs.min()), max(ux1, xs.max() + 1), min(uy0, ys.min()), max(uy1, ys.max() + 1)
    ux0, uy0, ux1, uy1 = int(ux0), int(uy0), int(ux1), int(uy1)
    x0, x1 = (ux0 // V2_DIV) * V2_DIV, -(-ux1 // V2_DIV) * V2_DIV
    y0, y1 = (uy0 // V2_DIV) * V2_DIV, -(-uy1 // V2_DIV) * V2_DIV
    cw, ch = (x1 - x0) // V2_DIV, (y1 - y0) // V2_DIV
    anchor_x = (ux0 + ux1) / 2.0
    rows = -(-n // COLS)
    sheet = Image.new("RGBA", (COLS * cw, rows * ch), (0, 0, 0, 0))
    for i, (f, d) in enumerate(raw):
        im = Image.open(io.BytesIO(d))
        a = np.array(im)[:, :, 3].copy(); a[y0:y1, x0:x1] = 0
        assert not a.any(), "wolf v2 frame %d has pixels outside the crop box" % i
        cell = im.crop((x0, y0, x1, y1)).convert("RGBa").resize((cw, ch), Image.BOX).convert("RGBA")
        sheet.paste(cell, ((i % COLS) * cw, (i // COLS) * ch))
        if i == 0:
            sc = 96.0 / (uy1 - uy0)
            pw, ph = max(1, round((ux1 - ux0) * sc)), max(1, round((uy1 - uy0) * sc))
            small = im.crop((ux0, uy0, ux1, uy1)).convert("RGBa").resize((pw, ph), Image.BOX).convert("RGBA")
            port = Image.new("RGBA", (PORT_W, PORT_H), (0, 0, 0, 0))
            port.paste(small, (max(0, int(round(PORT_W / 2 - (anchor_x - ux0) * sc))), PORT_H - ph))
            port.save(os.path.join(out_dir, "..", "portraits", "wolf.png"), optimize=True)
    path = os.path.join(out_dir, "wolf.png"); sheet.save(path, optimize=True)
    manifest["dancers"]["wolf"] = {
        "file": "wolf.png", "frames": n, "fps": 24, "div": V2_DIV, "duration_s": n / 24.0, "cell": [cw, ch], "cols": COLS, "rows": rows,
        "sheet_px": list(sheet.size), "master_crop_xywh": [x0, y0, x1 - x0, y1 - y0],
        "occupied_union_master_xyxy": [int(ux0), int(uy0), int(ux1), int(uy1)],
        "anchor_in_cell_px": [(anchor_x - x0) / V2_DIV, (uy1 - y0) / V2_DIV],   # feet = union bottom (fixed for the whole sequence)
        "scale_mul": V2_HEIGHT_REF / float(uy1 - uy0),                            # Layout A apparent height of the previous WOLF
        "master_sequence_sha256": got, "package_status": meta["status"], "source_video_sha256": meta["source_provenance"]["video_sha256"],
        "download_bytes": os.path.getsize(path), "decoded_bytes": sheet.size[0] * sheet.size[1] * 4,
        "sheet_sha256": hashlib.sha256(open(path, "rb").read()).hexdigest(),
    }


def build(masters, out_dir, wolf_v2=None):
    os.makedirs(out_dir, exist_ok=True)
    manifest = {
        "status": "F15 RUNTIME DERIVATIVES - Layout A accepted by Ube (size + softer animation rendering); masters unchanged",
        "art_package": {"branch": "art/f15-launch-trio-masters", "commit": ART_COMMIT, "path": PKG},
        "runtime_reference": RUNTIME_REF,
        "method": {
            "downsample": "exact %d:1 BOX (area average) on premultiplied alpha" % DIV,
            "grid_origin_master_xy": [GRID_AX, GRID_AY],
            "baseline_master_y": BASELINE_Y, "anchor_master_x": ANCHOR_X,
            "pack": "row-major, %d columns, frame i at col i%%%d row i//%d" % (COLS, COLS, COLS),
            "fps": 24, "no_dedupe_no_interpolation_no_retiming": True,
        },
        "dancers": {},
    }
    for name in DANCERS:
        meta = json.load(open(os.path.join(masters, name, "animation.json"), encoding="utf-8"))
        names = sorted(f for f in os.listdir(os.path.join(masters, name, "frames")) if f.endswith(".png"))
        raw = [(f, open(os.path.join(masters, name, "frames", f), "rb").read()) for f in names]
        got = sequence_hash(raw)
        want = meta["frozen_frame_sequence_sha256"]
        if got != want:
            sys.exit("%s: master sequence hash mismatch %s != %s" % (name, got, want))
        assert len(raw) == meta["production_frame_count"] and meta["production_fps"] == 24
        ux0, uy0, ux1, uy1 = meta["occupied_character_bounds"]["master_union"]
        assert uy1 == BASELINE_Y
        x0 = GRID_AX + ((ux0 - GRID_AX) // DIV) * DIV
        x1 = GRID_AX + -(-(ux1 - GRID_AX) // DIV) * DIV
        y0 = GRID_AY + ((uy0 - GRID_AY) // DIV) * DIV
        y1 = BASELINE_Y
        assert (y1 - GRID_AY) % DIV == 0
        cw, ch = (x1 - x0) // DIV, (y1 - y0) // DIV
        n = len(raw)
        rows = -(-n // COLS)
        sheet = Image.new("RGBA", (COLS * cw, rows * ch), (0, 0, 0, 0))
        cells = []
        for i, (f, data) in enumerate(raw):
            im = Image.open(io.BytesIO(data))
            assert im.mode == "RGBA" and im.size == (688, 688)
            a = np.array(im)[:, :, 3].copy()
            a[y0:y1, x0:x1] = 0
            assert not a.any(), "%s frame %d has pixels outside the crop box" % (name, i)
            cell = im.crop((x0, y0, x1, y1)).convert("RGBa").resize((cw, ch), Image.BOX).convert("RGBA")
            sheet.paste(cell, ((i % COLS) * cw, (i // COLS) * ch))
            cells.append(cell.tobytes())
            if i == 0:
                px0, py0, px1, py1 = ux0, uy0, ux1, uy1
                pw, ph = max(1, round((px1 - px0) * PORT_SCALE)), max(1, round((py1 - py0) * PORT_SCALE))
                small = im.crop((px0, py0, px1, py1)).convert("RGBa").resize((pw, ph), Image.BOX).convert("RGBA")
                port = Image.new("RGBA", (PORT_W, PORT_H), (0, 0, 0, 0))
                ox = int(round(PORT_W / 2 - (ANCHOR_X - px0) * PORT_SCALE))
                port.paste(small, (max(0, ox), PORT_H - ph))
                os.makedirs(os.path.join(out_dir, "..", "portraits"), exist_ok=True)
                port.save(os.path.join(out_dir, "..", "portraits", ("wolf_prev" if name == "wolf" else name) + ".png"), optimize=True)
        key = "wolf_prev" if name == "wolf" else name   # the previous WOLF stays recoverable; the v2 replacement takes the "wolf" slot
        path = os.path.join(out_dir, key + ".png")
        sheet.save(path, optimize=True)
        extra = {}
        if name == "wolf":   # A A B B pairs must survive derivation as exact byte-equal cell pairs
            extra["wolf_AABB_pairs_intact"] = all(cells[2 * k] == cells[2 * k + 1] for k in range(n // 2)) and \
                all(cells[2 * k + 1] != cells[2 * k + 2] for k in range(n // 2 - 1))
        manifest["dancers"][key] = {
            "file": key + ".png", "frames": n, "fps": 24, "div": DIV, "scale_mul": 1,
            "duration_s": n / 24.0, "cell": [cw, ch], "cols": COLS, "rows": rows,
            "sheet_px": list(sheet.size),
            "master_crop_xywh": [x0, y0, x1 - x0, y1 - y0],
            "anchor_in_cell_px": [(ANCHOR_X - x0) / DIV, (BASELINE_Y - y0) / DIV],
            "master_sequence_sha256": want,
            "download_bytes": os.path.getsize(path),
            "decoded_bytes": sheet.size[0] * sheet.size[1] * 4,
            "sheet_sha256": hashlib.sha256(open(path, "rb").read()).hexdigest(),
            **extra,
        }
    if wolf_v2:
        build_wolf_v2(wolf_v2, out_dir, manifest)
    t = manifest["dancers"].values()
    manifest["totals"] = {"download_bytes": sum(d["download_bytes"] for d in t),
                          "decoded_bytes": sum(d["decoded_bytes"] for d in t)}
    json.dump(manifest, open(os.path.join(out_dir, "manifest.json"), "w"), indent=2)
    return manifest


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument("--masters", help="extracted f15-launch-trio-masters directory")
    g.add_argument("--from-git", help="git repo containing the art commit")
    ap.add_argument("--wolf-v2", help="extracted STOVE N v2 outline 4px LAUNCH_PACKAGE directory (replaces WOLF; the previous WOLF is kept as wolf_prev)")
    ap.add_argument("--out", default=os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "assets", "f15", "dancers"))
    a = ap.parse_args()
    if a.from_git:
        with tempfile.TemporaryDirectory() as tmp:
            m = build(extract_from_git(a.from_git, tmp), a.out, a.wolf_v2)
    else:
        m = build(a.masters, a.out, a.wolf_v2)
    print(json.dumps(m["totals"]))
    for k, d in m["dancers"].items():
        print(k, d["cell"], d["sheet_px"], d["download_bytes"], d["decoded_bytes"], d.get("wolf_AABB_pairs_intact", ""))
