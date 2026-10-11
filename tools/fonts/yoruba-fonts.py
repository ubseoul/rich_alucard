"""Add Yoruba letters (dot-below and tone marks) to the game's two pixel fonts, drawn on each font's own pixel grid.
usage: python yoruba-fonts.py <src-font-dir> <out-font-dir> [--preview out.png]
Existing glyphs are untouched; only missing code points are added."""
import sys, os
from fontTools.ttLib import TTFont
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fontpix import pixels, glyph_from_pixels, show

src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)

def add_glyph(font, name, pix, u, advance, cps, mark=False):
    glyf = font['glyf']
    g = glyph_from_pixels(pix, u)
    order = font.getGlyphOrder()
    if name in order: raise SystemExit('glyph exists ' + name)
    order.append(name); font.setGlyphOrder(order)
    glyf.glyphs[name] = g; g.recalcBounds(glyf)
    font['hmtx'].metrics[name] = (advance, g.xMin if pix else 0)
    for t in font['cmap'].tables:
        if t.isUnicode():
            for cp in cps:
                if t.format == 4 and cp > 0xFFFF: continue
                t.cmap[cp] = name
    if mark and 'GDEF' in font and font['GDEF'].table.GlyphClassDef:
        font['GDEF'].table.GlyphClassDef.classDefs[name] = 3

def build(file, u, cell_w, spec, rename=None, note=''):
    f = TTFont(os.path.join(src, file)); cm = f.getBestCmap()
    adv = f['hmtx'][cm[ord('a')]][0]
    base = lambda ch: set(pixels(f, cm[ord(ch)], u))
    added = []
    for cp, name, fn, mark in spec(base, cell_w, adv // u):
        if cp in cm: continue
        pix = fn()
        add_glyph(f, name, pix, u, 0 if mark else adv, [cp], mark)
        added.append((chr(cp), name, pix))
    f['maxp'].recalc(f)
    for r in f['name'].names:
        if r.nameID == 0: r.string = str(r) + note
        if r.nameID == 5: r.string = str(r) + '; RA Yoruba 1'
        if rename and r.nameID in (1, 3, 4, 6, 16, 18):
            s = str(r)
            r.string = s.replace('Press Start 2P', rename).replace('PressStart2P', rename.replace(' ', ''))
    f.save(os.path.join(out, file))
    return added

def shift(pix, dx=0, dy=0): return {(x + dx, y + dy) for x, y in pix}

# ---------- Monogram: 5px-wide letters in a 6px cell; x-height row 4, cap height row 6, descenders to row -2 ----------
def mono_spec(base, w, cell):
    # accents sit one empty row above the letter, like the dot of "i"
    def acute(top): return {(2, top + 2), (3, top + 3)}
    def grave(top): return {(2, top + 2), (1, top + 3)}
    def i_body(): return {p for p in base('i') if p[1] <= 4}   # i without its dot
    low, cap = 4, 6
    spec = []
    for lo, up in zip('aeiou', 'AEIOU'):
        for kind, accent in (('grave', grave), ('acute', acute)):
            cp_lo = ord({'grave': {'a': 'à', 'e': 'è', 'i': 'ì', 'o': 'ò', 'u': 'ù'}, 'acute': {'a': 'á', 'e': 'é', 'i': 'í', 'o': 'ó', 'u': 'ú'}}[kind][lo])
            cp_up = ord({'grave': {'A': 'À', 'E': 'È', 'I': 'Ì', 'O': 'Ò', 'U': 'Ù'}, 'acute': {'A': 'Á', 'E': 'É', 'I': 'Í', 'O': 'Ó', 'U': 'Ú'}}[kind][up])
            body = i_body if lo == 'i' else (lambda lo=lo: base(lo))
            spec.append((cp_lo, lo + kind, lambda body=body, accent=accent: body() | accent(low), False))
            spec.append((cp_up, up + kind, lambda up=up, accent=accent: base(up) | accent(cap), False))
    spec += [(0x144, 'nacute', lambda: base('n') | acute(low), False), (0x1F9, 'ngrave', lambda: base('n') | grave(low), False),
             (0x143, 'Nacute', lambda: base('N') | acute(cap), False), (0x1F8, 'Ngrave', lambda: base('N') | grave(cap), False)]
    dot = {(2, -2)}  # one row gap under the baseline, inside the font's 2-row descent
    for ch, cp in (('s', 0x1E63), ('S', 0x1E62), ('e', 0x1EB9), ('E', 0x1EB8), ('o', 0x1ECD), ('O', 0x1ECC)):
        spec.append((cp, ch + 'dotbelow', lambda ch=ch: base(ch) | dot, False))
    # zero-width combining marks, drawn over the previous 6px cell (for ẹ́ ọ̀ etc.)
    spec += [(0x300, 'gravecomb', lambda: shift(grave(low), -cell), True), (0x301, 'acutecomb', lambda: shift(acute(low), -cell), True),
             (0x323, 'dotbelowcomb', lambda: shift(dot, -cell), True)]
    return spec

# ---------- Press Start 2P: 7px letters in an 8px cell; body rows 1-5 (caps 1-7), descender row 0 ----------
def ps2p_spec(base, w, cell):
    dot = {(3, -1), (4, -1)}  # 2x1 like the dot of "i", one row gap below the letters
    spec = []
    for ch, cp in (('s', 0x1E63), ('S', 0x1E62), ('e', 0x1EB9), ('E', 0x1EB8), ('o', 0x1ECD), ('O', 0x1ECC)):
        spec.append((cp, ch + 'dotbelow', lambda ch=ch: base(ch) | dot, False))
    # ǹ / Ǹ: the font's own ń / Ń with the accent mirrored into a grave (as à mirrors á)
    def regrave(ch):
        pix = base(ch); acc = {p for p in pix if p[1] >= 6}
        return (pix - acc) | {(6 - x, y) for x, y in acc}
    spec += [(0x1F9, 'ngrave', lambda: regrave('ń'), False), (0x1F8, 'Ngrave', lambda: regrave('Ń'), False)]
    spec.append((0x323, 'dotbelowcomb', lambda: shift(dot, -cell), True))
    return spec

note = ' Modified 2026-10-11 for Rich Alucard: added Yoruba letters (dot below, tone marks).'
a1 = build('monogram.ttf', 64, 5, mono_spec, note=note)
a2 = build('press-start-2p.ttf', 125, 7, ps2p_spec, rename='RA Press Start', note=note)
for fname, added in (('monogram', a1), ('press-start-2p', a2)):
    print('==', fname, 'added', len(added), ''.join(c for c, _, _ in added))
    if '--show' in sys.argv:
        for c, n, p in added: print(n); print(show(p))
