"""Build a 7-frame nightclub idle from the snapped native sprite.
Pure integer row shifts (no resampling), so palette / pixels never change."""
import sys, numpy as np
from PIL import Image

native = np.array(Image.open(sys.argv[1]).convert('RGBA'))
outdir = sys.argv[2]
H, W = native.shape[:2]
PADX, PADT, PADB, SCALE = 4, 4, 3, 4

# row landmarks (native px rows)
SHOULDER, WAIST, KNEE, BOOT, HAIR_X, HAIR_Y = 38, 58, 100, 113, 40, 42

def profile(sway, bounce):
    """per-row (dx, dy) and hair-lag for a pose. sway in {-1,0,1}."""
    dx = np.zeros(H, int); dy = np.zeros(H, int)
    for r in range(H):
        if sway:
            if SHOULDER <= r < 47: dx[r] = -sway          # shoulders counter the hips
            elif WAIST <= r < KNEE: dx[r] = sway          # hips + thighs lead
        if bounce and r < KNEE: dy[r] = 1                 # knees soften, body drops 1px
    return dx, dy, -sway                                  # hair trails opposite the sway

def render(sway=0, bounce=0):
    dx, dy, hair = profile(sway, bounce)
    canvas = np.zeros((H+PADT+PADB, W+2*PADX, 4), np.uint8)
    # draw bottom rows first so shifted upper rows overwrite (bounce overlap)
    order = sorted(range(H), key=lambda r: -(r+dy[r]))
    for r in order:
        row = native[r]
        ty = r+dy[r]+PADT
        if r < HAIR_Y and hair:
            cut = HAIR_X
            left, right = row[:cut], row[cut:]
            canvas[ty, PADX+dx[r]:PADX+dx[r]+cut] = np.where(left[:, 3:] > 0, left, canvas[ty, PADX+dx[r]:PADX+dx[r]+cut])
            rx = PADX+cut+dx[r]+hair
            if hair > 0:  # close the 1px gap by extending the pixel next to it
                gap = PADX+cut+dx[r]
                canvas[ty, gap] = left[-1] if left[-1, 3] else right[0]
            seg = canvas[ty, rx:rx+len(right)]
            canvas[ty, rx:rx+len(right)] = np.where(right[:, 3:] > 0, right, seg)
        else:
            seg = canvas[ty, PADX+dx[r]:PADX+dx[r]+W]
            canvas[ty, PADX+dx[r]:PADX+dx[r]+W] = np.where(row[:, 3:] > 0, row, seg)
    return canvas

frames = [render(0,0), render(-1,0), render(0,0), render(1,0), render(0,0), render(0,1), render(0,0)]
assert (frames[0] == frames[-1]).all()
fh, fw = frames[0].shape[:2]
up = lambda a: np.kron(a, np.ones((SCALE, SCALE, 1), np.uint8))
sheet = np.concatenate([up(f) for f in frames], axis=1)
Image.fromarray(sheet).save(f'{outdir}/idle_dance_sheet.png')
Image.fromarray(np.concatenate(frames, axis=1)).save(f'{outdir}/idle_dance_sheet_1x.png')
# preview gif (loops frames 1-6; frame 7 == frame 1 so it is dropped to avoid a doubled hold)
bg = lambda a: (lambda im: (im.alpha_composite(Image.fromarray(up(a))), im.convert('P'))[1])(Image.new('RGBA', (fw*SCALE, fh*SCALE), (30, 20, 40, 255)))
gif = [bg(f) for f in frames[:-1]]
gif[0].save(f'{outdir}/idle_dance_preview.gif', save_all=True, append_images=gif[1:], duration=160, loop=0)
print('frame', fw, fh, 'x', SCALE, '| sheet', sheet.shape[1], sheet.shape[0])
