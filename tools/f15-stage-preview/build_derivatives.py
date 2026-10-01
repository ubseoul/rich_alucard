#!/usr/bin/env python3
"""F15 three-dancer stage preview - runtime-candidate derivative builder.

Reads the FROZEN 688x688 RGBA masters (never modified, never copied into this repo) and writes
one PNG sprite sheet per dancer + manifest.json into ./runtime_candidates/.

Masters are read from the exact art commit; they are NOT part of this branch:
    python tools/f15-stage-preview/build_derivatives.py --from-git <path-to-any-clone-with-that-commit>
or from an already-extracted package directory:
    python tools/f15-stage-preview/build_derivatives.py --masters <dir>/f15-launch-trio-masters

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


def build(masters, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    manifest = {
        "status": "CANDIDATE - PENDING UBE STAGE REVIEW (preview-only derivatives, not final runtime assets)",
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
        path = os.path.join(out_dir, name + ".png")
        sheet.save(path, optimize=True)
        extra = {}
        if name == "wolf":   # A A B B pairs must survive derivation as exact byte-equal cell pairs
            extra["wolf_AABB_pairs_intact"] = all(cells[2 * k] == cells[2 * k + 1] for k in range(n // 2)) and \
                all(cells[2 * k + 1] != cells[2 * k + 2] for k in range(n // 2 - 1))
        manifest["dancers"][name] = {
            "file": name + ".png", "frames": n, "fps": 24,
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
    ap.add_argument("--out", default=os.path.join(os.path.dirname(os.path.abspath(__file__)), "runtime_candidates"))
    a = ap.parse_args()
    if a.from_git:
        with tempfile.TemporaryDirectory() as tmp:
            m = build(extract_from_git(a.from_git, tmp), a.out)
    else:
        m = build(a.masters, a.out)
    print(json.dumps(m["totals"]))
    for k, d in m["dancers"].items():
        print(k, d["cell"], d["sheet_px"], d["download_bytes"], d["decoded_bytes"], d.get("wolf_AABB_pairs_intact", ""))
