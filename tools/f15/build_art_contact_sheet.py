#!/usr/bin/env python3
"""Labeled review contact sheets from the real-Chromium frames written by
   node tools/tests/f15/browser-check.mjs --only art --shots <dir>
Pillow only; frames are scaled with nearest-neighbour for the sheet (the originals are copied unmodified).
    python tools/f15/build_art_contact_sheet.py <shots_dir> <out_dir>
"""
import glob, os, re, shutil, sys
from PIL import Image, ImageDraw

shots, out = sys.argv[1], sys.argv[2]
FRAMES = [  # (scene, env-key, label)
    ('ROXY_L1', 'f15_bing', 'THE BING  (Roxy L1)'), ('ROXY_L2', 'f15_gym', 'BOXING GYM  (Roxy L2)'), ('ROXY_L2', 'combat', 'BOXING GYM spar - combat'),
    ('ROXY_L4', 'f15_roxy_apartment', "ROXY'S APARTMENT  (Roxy L4)"), ('ROSALYN_L1', 'f15_plenitude', 'PLENITUDE  (Rosalyn L1)'),
    ('ROSALYN_L3', 'f15_convention', 'CONVENTION HALL  (Rosalyn L3)'), ('ROSALYN_L4', 'f15_rosalyn_apartment_dark', 'ROSALYN APT - LIGHTS OFF + cockroach'),
    ('ROSALYN_L4', 'combat', 'COCKROACH combat (Rosalyn L4)'), ('ROSALYN_L4', 'f15_rosalyn_apartment', "ROSALYN'S APARTMENT - lights on"),
    ('EMERALD_L3', 'f15_bing', 'THE BING + GRANNY BING  (Emerald L3)'), ('EMERALD_L4', 'f15_shrine', 'SHRINE AUDITORIUM  (Emerald L4)')]
def find(w, scene, key):
    pat = re.compile(rf'^art_{w}_F15_{scene}_{key}_(\d+)\.png$')
    hits = sorted((int(m.group(1)), f) for f in os.listdir(shots) if (m := pat.match(f)))
    return os.path.join(shots, hits[-1][1]) if key == 'f15_rosalyn_apartment_dark' and False else (os.path.join(shots, hits[0][1]) if hits else None)
def sheet(items, cols, cell_w, path, title):
    pad, lab = 12, 34
    imgs = [(Image.open(p).convert('RGB'), l) for p, l in items if p]
    cell_h = round(cell_w * imgs[0][0].height / imgs[0][0].width)
    rows = (len(imgs) + cols - 1) // cols
    W, H = pad + cols * (cell_w + pad), 44 + rows * (cell_h + lab + pad)
    sh = Image.new('RGB', (W, H), '#14101f'); d = ImageDraw.Draw(sh); d.text((pad, 14), title, fill='#ffd870')
    for i, (im, l) in enumerate(imgs):
        x, y = pad + (i % cols) * (cell_w + pad), 44 + (i // cols) * (cell_h + lab + pad)
        sh.paste(im.resize((cell_w, cell_h), Image.Resampling.NEAREST), (x, y + lab)); d.text((x, y + 10), l, fill='#ffffff')
    sh.save(path, optimize=True)
os.makedirs(out + '/screens', exist_ok=True)
items390 = [(find(390, s, k), f'{l}  [390]') for s, k, l in FRAMES]
sheet(items390, 4, 300, out + '/contact_sheet_390.png', 'F15 scene art - real Chromium, 390x844 @2x, nearest-neighbour. Actor/UI placement checked by measurement; for Ube presentation review.')
wid = []
for s, k, l in [('EMERALD_L3', 'f15_bing', 'GRANNY BING'), ('ROSALYN_L4', 'combat', 'COCKROACH combat'), ('EMERALD_L4', 'f15_shrine', 'SHRINE')]:
    for w in (360, 390, 430): wid.append((find(w, s, k), f'{l}  [{w}]'))
sheet(wid, 3, 300, out + '/contact_sheet_widths_360_390_430.png', 'F15 scene art - widths 360 / 390 / 430')
for (s, k, l) in FRAMES:
    p = find(390, s, k)
    if p: shutil.copy(p, f"{out}/screens/390_{s}_{k}.png")
print('sheets + %d screenshots -> %s' % (len(os.listdir(out + '/screens')), out))
