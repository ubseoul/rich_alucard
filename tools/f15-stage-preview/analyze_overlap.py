#!/usr/bin/env python3
"""Silhouette overlap + extent analysis of candidate layouts, from the runtime-candidate sheets.
Each dancer loops on its own frame count from a shared restart; we sample 3000 frames of joint time.
Reports, per layout at a 370px-wide stage: max/mean adjacent-pair overlap (alpha px, as % of the
smaller dancer's mean silhouette) and left/right stage-edge margins at the animation extremes."""
import json, os, sys
import numpy as np
from PIL import Image
D = os.path.dirname(os.path.abspath(__file__))
M = json.load(open(os.path.join(D, "runtime_candidates", "manifest.json")))["dancers"]
LAY = json.load(open(os.path.join(D, "layouts.json")))
W = 370.0
def masks(name, k):
    d = M[name]; cw, ch = d["cell"]; im = np.array(Image.open(os.path.join(D, "runtime_candidates", d["file"])))[:, :, 3]
    s = 3 * k; w, h = max(1, round(cw * s)), max(1, round(ch * s)); out = []
    for i in range(d["frames"]):
        c, r = i % d["cols"], i // d["cols"]
        cell = im[r*ch:(r+1)*ch, c*cw:(c+1)*cw] > 32
        out.append(np.array(Image.fromarray((cell*255).astype(np.uint8)).resize((w, h), Image.NEAREST)) > 0)
    return out, d["anchor_in_cell_px"][0] * s, h
def run(layout):
    k = layout["refScale"] * W / layout["refStageWidth"]
    sl = layout["slots"]; H = 600
    mk = {}; 
    for s in sl:
        kk = k * s.get("scaleMul", 1)
        mk[s["id"]] = masks(s["id"], kk) + (s["cx"] * W,)
    canvas_w = int(W) + 400
    res = []
    for t in range(3000):
        layers = []
        for s in sl:
            m, ax, h, cx = mk[s["id"]]
            f = m[t % len(m)]
            full = np.zeros((h, canvas_w), bool)
            x0 = int(round(cx - ax)) + 200
            full[:, x0:x0 + f.shape[1]] = f
            layers.append((full, h))
        row = []
        for a in range(len(layers) - 1):
            la, ha = layers[a]; lb, hb = layers[a + 1]
            hh = min(ha, hb); ov = (la[-hh:] & lb[-hh:]).sum()
            small = min(la.sum(), lb.sum()); row.append(ov / max(1, small))
        res.append(row)
    res = np.array(res)
    ext = []
    for s in sl:
        m, ax, h, cx = mk[s["id"]]
        xs = [np.nonzero(f.any(0))[0] for f in m]
        ext.append((cx - ax + min(x.min() for x in xs), cx - ax + max(x.max() for x in xs) + 1))
    return k, res.max(0), res.mean(0), ext, {s["id"]: round(mk[s["id"]][2]) for s in sl}
if __name__ == "__main__":
    for name, lay in LAY["layouts"].items():
        k, mx, mean, ext, hs = run(lay)
        print(name, "css px / master px = %.3f" % k, "heights", hs)
        print("  adjacent overlap max %s mean %s (fraction of smaller silhouette)" % (np.round(mx, 3), np.round(mean, 3)))
        print("  x extents on %dpx stage:" % W, [(round(a), round(b)) for a, b in ext])
