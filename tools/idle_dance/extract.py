"""Snap the source image to its native pixel grid and quantize the palette."""
import sys, numpy as np
from PIL import Image
src, out = sys.argv[1], sys.argv[2]
a = np.array(Image.open(src).convert('RGBA')).astype(float)
H, W = a.shape[:2]
PX, PY, OX, OY = 8.7, 8.55, 1.2, 3.25
nx, ny = int((W-OX)//PX), int((H-OY)//PY)
cells = np.zeros((ny, nx, 4), np.uint8)
for j in range(ny):
    for i in range(nx):
        x0, x1 = OX+i*PX, OX+(i+1)*PX
        y0, y1 = OY+j*PY, OY+(j+1)*PY
        cx, cy = (x0+x1)/2, (y0+y1)/2
        r = a[int(cy-PY*.25):int(cy+PY*.25)+1, int(cx-PX*.25):int(cx+PX*.25)+1].reshape(-1, 4)
        cells[j, i] = np.median(r, axis=0)
alpha = cells[..., 3] > 127
rgb = cells[..., :3].astype(int)
# quantize with simple k-means over foreground colors
fg = rgb[alpha].astype(float)
rng = np.random.default_rng(1)
K = 18
cent = fg[rng.choice(len(fg), K, replace=False)]
for _ in range(40):
    d = ((fg[:, None]-cent[None])**2).sum(2); l = d.argmin(1)
    for k in range(K):
        if (l == k).any(): cent[k] = fg[l == k].mean(0)
pal = cent.round().astype(np.uint8)
res = np.zeros((ny, nx, 4), np.uint8)
d = ((rgb[..., None, :]-pal[None, None].astype(int))**2).sum(3)
res[..., :3] = pal[d.argmin(2)]
res[..., 3] = np.where(alpha, 255, 0)
# crop to content
ys, xs = np.where(alpha)
res = res[ys.min():ys.max()+1, xs.min():xs.max()+1]
Image.fromarray(res).save(out)
print(res.shape, len(np.unique(res.reshape(-1, 4), axis=0)))
