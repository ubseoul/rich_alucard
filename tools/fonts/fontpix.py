"""Pixel-font helpers: read TrueType rectangle-pixel glyphs as pixel sets and write pixel sets back as outlines."""
from fontTools.ttLib import TTFont
from fontTools.pens.recordingPen import DecomposingRecordingPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
import math

def unit(font):
    """Pixel size in font units: gcd of all outline coordinates."""
    g = 0
    gs = font.getGlyphSet()
    for name in font.getGlyphOrder():
        glyf = font['glyf'][name]
        if glyf.numberOfContours == 0: continue
        coords, _, _ = glyf.getCoordinates(font['glyf'])
        for x, y in coords:
            g = math.gcd(g, abs(int(x))); g = math.gcd(g, abs(int(y)))
    return g

def contours(font, name):
    pen = DecomposingRecordingPen(font.getGlyphSet())
    font.getGlyphSet()[name].draw(pen)
    out, cur = [], []
    for op, args in pen.value:
        if op == 'moveTo': cur = [args[0]]
        elif op == 'lineTo': cur.append(args[0])
        elif op in ('closePath', 'endPath'):
            if cur: out.append(cur)
            cur = []
        else: raise ValueError('curve in pixel font: ' + op)
    return out

def pixels(font, name, u):
    """Set of (x,y) pixel cells covered (even-odd fill of the contours, sampled at cell centres)."""
    cs = contours(font, name)
    if not cs: return set()
    xs = [p[0] for c in cs for p in c]; ys = [p[1] for c in cs for p in c]
    res = set()
    for py in range(int(min(ys)) // u - 1, int(max(ys)) // u + 1):
        for px in range(int(min(xs)) // u - 1, int(max(xs)) // u + 1):
            cx, cy = (px + .5) * u, (py + .5) * u; inside = False
            for c in cs:
                n = len(c)
                for i in range(n):
                    (x1, y1), (x2, y2) = c[i], c[(i + 1) % n]
                    if (y1 > cy) != (y2 > cy) and cx < x1 + (cy - y1) * (x2 - x1) / (y2 - y1): inside = not inside
            if inside: res.add((px, py))
    return res

def show(pix):
    if not pix: return '(empty)'
    xs = [p[0] for p in pix]; ys = [p[1] for p in pix]
    rows = []
    for y in range(max(ys), min(ys) - 1, -1):
        rows.append(f'{y:3d} ' + ''.join('#' if (x, y) in pix else '.' for x in range(min(0, min(xs)), max(xs) + 1)))
    return '\n'.join(rows)

def glyph_from_pixels(pix, u):
    """One square contour per pixel run (horizontal runs merged), clockwise for TrueType."""
    pen = TTGlyphPen(None)
    rows = {}
    for x, y in pix: rows.setdefault(y, []).append(x)
    for y, xs in sorted(rows.items()):
        xs.sort(); start = prev = xs[0]
        for x in xs[1:] + [None]:
            if x is not None and x == prev + 1: prev = x; continue
            x0, x1, y0, y1 = start * u, (prev + 1) * u, y * u, (y + 1) * u
            pen.moveTo((x0, y0)); pen.lineTo((x0, y1)); pen.lineTo((x1, y1)); pen.lineTo((x1, y0)); pen.closePath()
            if x is not None: start = prev = x
    return pen.glyph()
