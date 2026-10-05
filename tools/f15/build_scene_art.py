#!/usr/bin/env python3
"""F15 scene-art integration - reproducible asset step (STOVE Y).

Inputs (all read-only, hash-verified against the recorded values before anything is written):
  * the approved art package art_department/production/f15-date-scene-assets/ (commit 75459f40, in this branch's history)
  * the frozen Granny Bing anchor, read from its freeze commit 61a8a559 (never merged; one asset + its provenance only)

Outputs under assets/:
  f15/environments/<name>_270x480.png   BYTE COPIES of the seven approved production backgrounds (no decode/re-encode)
  f15/characters/spirit_of_uncle_bunmi_444x222.png   the ONLY derivative (technical; master stays unchanged in the art package)
  f15/layers/lights_off_270x480.png     flat scene overlay for ROSALYN'S APARTMENT - LIGHTS OFF (not derived from approved art)
  before_the_fame/characters/granny_bing/cga_f2_032/...80x96_v1.png   byte copy of the frozen file
  f15/scene_art_manifest.json           measured bytes / hashes / dimensions / transform of every file above

Cockroach derivative (the master is 1774x887 RGBA with accepted partial alpha and is never modified):
  one area (BOX) resize of the whole canvas to 444x222 on PREMULTIPLIED alpha (Pillow does this for RGBA).
  Same aspect (2:1 exactly), whole canvas, so nothing can be clipped or re-centred; no sharpening, recolour, alpha edit or repack.
  Scale 444/1774 = 0.25028 (1774 is 2x887, 887 is prime, so no integer reduction exists). Runtime shows it with nearest-neighbour
  at a fixed world scale (see js/frag/F15/dates.js ROACH).

    python tools/f15/build_scene_art.py [--granny-from-git <repo>]   # default repo = this checkout
"""
import argparse, hashlib, io, json, os, subprocess
import numpy as np
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PKG = 'art_department/production/f15-date-scene-assets'
GRANNY_COMMIT = '61a8a5599d6c73c573aee8a0494254b8e52004fa'
GRANNY_PATH = 'assets/before_the_fame/characters/granny_bing/cga_f2_032/granny_bing_neutral_calling_numbers_anchor_80x96_v1.png'
GRANNY_SHA = '6f042de972f6fe7fa89178095829ac44e96650cf7b067ad0004f2ca208ddf4ee'
BACKGROUNDS = {  # name -> approved production sha256 (APPROVAL_ADDENDUM.json / manifest.json)
    'the_bing': '16c82c11f017960da8eb18a8e5f5363132aca4c1d124088f5d2ac5c8ec410fe0',
    'roxy_apartment': 'f30c32450876b2077d6374165630ed7b1dc9b05b42c56f80c92c6a7d9c3f0b51',
    'rosalyn_apartment': '8247c05d7c6bafdb9009f08b3c98ebe274db63f1aadaeff4c65b0eb6f403e8e7',
    'boxing_gym': '9a0e80798bc8c7a74d96c06578c6d4e02ee4170284651d93ac4569432877f24f',
    'plenitude': '686b97067b6776c8e7de992fb60f67c663610489cfc567b4c3fb8c8c2314b9cb',
    'convention_hall': '469564c607b94bcd7fdceb64d1bcacdd5bf9ff02c7f343a7798636ec885d8664',
    'shrine_auditorium': '58359742eb37d7cd4ff9f05c9312207f109528a59397268cd7d73491ae02cab9',
}
ROACH = 'spirit_of_uncle_bunmi_candidate_original.png'
ROACH_SHA = '2c1589a8214c8f3eda935f416e1808a83aa71ec3be1d4c3f4b8d29a0333aa783'
ROACH_OUT = (444, 222)
LIGHTS_OFF_RGBA = (6, 5, 20, 150)   # flat deep-navy, ~59 % - the "lights off" treatment as a layer

sha = lambda b: hashlib.sha256(b).hexdigest()
def need(cond, msg):
    if not cond: raise SystemExit('VERIFY FAIL: ' + msg)
def out(rel, data):
    p = os.path.join(ROOT, rel); os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, 'wb') as f: f.write(data)
def info(rel, data, **kw):
    im = Image.open(io.BytesIO(data))
    return {'path': rel, 'bytes': len(data), 'sha256': sha(data), 'dimensions': list(im.size), 'mode': im.mode, **kw}

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--granny-from-git', default=ROOT); a = ap.parse_args()
    files = []
    for name, want in BACKGROUNDS.items():
        src = f'{PKG}/production/{name}_270x480.png'
        b = open(os.path.join(ROOT, src), 'rb').read()
        need(sha(b) == want, f'{name} sha')
        rel = f'assets/f15/environments/{name}_270x480.png'; out(rel, b)
        files.append(info(rel, b, role='approved production background (byte copy)', source=src, approved_sha256=want))
    mb = open(os.path.join(ROOT, f'{PKG}/production/{ROACH}'), 'rb').read()
    need(sha(mb) == ROACH_SHA, 'cockroach master sha')
    master = Image.open(io.BytesIO(mb)); need(master.size == (1774, 887) and master.mode == 'RGBA', 'cockroach master format')
    d = master.resize(ROACH_OUT, Image.Resampling.BOX)
    buf = io.BytesIO(); d.save(buf, 'PNG', optimize=True); db = buf.getvalue()
    rel = 'assets/f15/characters/spirit_of_uncle_bunmi_444x222.png'; out(rel, db)
    ma, da = np.array(master)[..., 3], np.array(d)[..., 3]
    def box(al):
        ys, xs = np.where(al > 0); return [int(xs.min()), int(ys.min()), int(xs.max() - xs.min() + 1), int(ys.max() - ys.min() + 1)]
    mbox, dbox = box(ma), box(da)
    sx = ROACH_OUT[0] / master.size[0]
    exp = [mbox[0] * sx, mbox[1] * sx, (mbox[0] + mbox[2]) * sx, (mbox[1] + mbox[3]) * sx]
    # clipping check: every master alpha>0 pixel maps inside the derivative canvas (same aspect, whole canvas) and the derivative's
    # alpha bounds touch no edge unless the master's did
    need(dbox[0] >= 0 and dbox[1] >= 0 and dbox[0] + dbox[2] <= ROACH_OUT[0] and dbox[1] + dbox[3] <= ROACH_OUT[1], 'derivative bounds')
    edge_master = mbox[0] == 0 or mbox[1] == 0 or mbox[0] + mbox[2] == 1774 or mbox[1] + mbox[3] == 887
    edge_deriv = dbox[0] == 0 or dbox[1] == 0 or dbox[0] + dbox[2] == ROACH_OUT[0] or dbox[1] + dbox[3] == ROACH_OUT[1]
    need(edge_master == edge_deriv, 'derivative adds edge contact')
    partial = lambda al: int(((al > 0) & (al < 255)).sum())
    files.append(info(rel, db, role='cockroach runtime derivative (BOX 444x222, premultiplied alpha); master unchanged', source=f'{PKG}/production/{ROACH}',
                      master_sha256=ROACH_SHA, master_dimensions=[1774, 887], master_alpha_box=mbox, derivative_alpha_box=dbox,
                      expected_alpha_box_from_master_scaled=[round(v, 2) for v in exp], master_touches_canvas_edge=bool(edge_master),
                      derivative_touches_canvas_edge=bool(edge_deriv), master_partial_alpha_pixels=partial(ma), derivative_partial_alpha_pixels=partial(da),
                      derivative_alpha_extrema=[int(da.min()), int(da.max())]))
    lo = Image.new('RGBA', (270, 480), LIGHTS_OFF_RGBA); buf = io.BytesIO(); lo.save(buf, 'PNG', optimize=True)
    rel = 'assets/f15/layers/lights_off_270x480.png'; out(rel, buf.getvalue())
    files.append(info(rel, buf.getvalue(), role='flat lights-off overlay layer (not derived from approved art)', rgba=list(LIGHTS_OFF_RGBA)))
    gb = subprocess.run(['git', '-C', a.granny_from_git, 'cat-file', 'blob', f'{GRANNY_COMMIT}:{GRANNY_PATH}'], capture_output=True, check=True).stdout
    need(sha(gb) == GRANNY_SHA, 'granny sha')
    out(GRANNY_PATH, gb)
    files.append(info(GRANNY_PATH, gb, role='frozen Granny Bing anchor (byte copy)', source=f'{GRANNY_COMMIT}:{GRANNY_PATH}', approved_sha256=GRANNY_SHA))
    man = {'schema': 1, 'generator': 'tools/f15/build_scene_art.py', 'art_package_commit': '75459f401d9fe6115e7fdf8c8f2bed572df55746', 'granny_commit': GRANNY_COMMIT,
           'files': files, 'total_bytes': sum(f['bytes'] for f in files)}
    out('assets/f15/scene_art_manifest.json', (json.dumps(man, indent=1) + '\n').encode())
    print(json.dumps({'files': len(files), 'total_bytes': man['total_bytes'], 'roach': files[7]}, indent=1))

if __name__ == '__main__': main()
