// "Rich Alucard-ify": restyle frames toward the project's native pixel grammar
// (see art_department/STYLE_FINGERPRINT.md and sources/ART_PRODUCTION_STANDARD_v1.md):
//   - native cell 80x96, feet on the common contact edge (y88), visible body ~54px tall
//   - hard edges only: binary alpha, no anti-aliasing, no gradients
//   - small flat palette (a few tones per material), one global palette per clip
//   - ~1px dark contour, isolated stray pixels cleaned up
// Pure functions over { width, height, data: Uint8ClampedArray(RGBA) }; no DOM.

const ALPHA_THRESHOLD = 8;

export const RICHIFY_DEFAULTS = {
  bodyHeight: 54, // visible body height in native pixels (Rich 52, Ogun 56, CEO 61)
  colors: 16, // palette size before the outline colour is added
  cellWidth: 80,
  cellHeight: 96,
  contactFromBottom: 8, // cell 96 -> contact y88
  outline: true,
};

const blank = (width, height) => ({ width, height, data: new Uint8ClampedArray(width * height * 4) });

export function unionBounds(frames) {
  let minX = Infinity, minY = Infinity, maxX = -1, maxY = -1;
  for (const { width, height, data } of frames) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (data[(y * width + x) * 4 + 3] > ALPHA_THRESHOLD) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
  }
  if (maxX < 0) return null;
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

/** Area-average (box) resample of `rect` from `src` into a dw x dh region of `dst` at (ox, oy); binary alpha out. */
function resampleInto(src, rect, dst, ox, oy, dw, dh) {
  const sx = rect.w / dw, sy = rect.h / dh;
  for (let dy = 0; dy < dh; dy++) {
    const y0 = rect.y + dy * sy, y1 = rect.y + (dy + 1) * sy;
    for (let dx = 0; dx < dw; dx++) {
      const x0 = rect.x + dx * sx, x1 = rect.x + (dx + 1) * sx;
      let r = 0, g = 0, b = 0, a = 0, area = 0;
      for (let y = Math.floor(y0); y < Math.ceil(y1); y++) {
        if (y < 0 || y >= src.height) { area += 0; continue; }
        const wy = Math.min(y + 1, y1) - Math.max(y, y0);
        for (let x = Math.floor(x0); x < Math.ceil(x1); x++) {
          if (x < 0 || x >= src.width) continue;
          const w = wy * (Math.min(x + 1, x1) - Math.max(x, x0));
          const i = (y * src.width + x) * 4;
          const al = (src.data[i + 3] / 255) * w;
          r += src.data[i] * al; g += src.data[i + 1] * al; b += src.data[i + 2] * al;
          a += al;
          area += w;
        }
      }
      if (area === 0 || a / area < 0.5) continue;
      const o = ((oy + dy) * dst.width + ox + dx) * 4;
      dst.data[o] = r / a; dst.data[o + 1] = g / a; dst.data[o + 2] = b / a; dst.data[o + 3] = 255;
    }
  }
}

/** Median-cut palette from opaque pixels of all frames. Returns [[r,g,b], ...]. */
export function buildPalette(frames, count) {
  const samples = [];
  let total = 0;
  for (const f of frames) for (let i = 3; i < f.data.length; i += 4) if (f.data[i] === 255) total++;
  const step = Math.max(1, Math.floor(total / 60000));
  let n = 0;
  for (const f of frames) {
    for (let i = 0; i < f.data.length; i += 4) {
      if (f.data[i + 3] === 255 && n++ % step === 0) samples.push([f.data[i], f.data[i + 1], f.data[i + 2]]);
    }
  }
  if (!samples.length) return [[0, 0, 0]];

  const boxes = [samples];
  while (boxes.length < count) {
    // split the box with the widest channel range (weighted by population)
    let best = -1, bestScore = 0, bestCh = 0;
    boxes.forEach((box, bi) => {
      if (box.length < 2) return;
      for (let ch = 0; ch < 3; ch++) {
        let lo = 255, hi = 0;
        for (const p of box) { if (p[ch] < lo) lo = p[ch]; if (p[ch] > hi) hi = p[ch]; }
        const score = (hi - lo) * Math.sqrt(box.length);
        if (score > bestScore) { bestScore = score; best = bi; bestCh = ch; }
      }
    });
    if (best < 0 || bestScore === 0) break;
    const box = boxes[best].sort((p, q) => p[bestCh] - q[bestCh]);
    const mid = box.length >> 1;
    boxes.splice(best, 1, box.slice(0, mid), box.slice(mid));
  }
  return boxes.map((box) => {
    const s = [0, 0, 0];
    for (const p of box) { s[0] += p[0]; s[1] += p[1]; s[2] += p[2]; }
    return s.map((v) => Math.round(v / box.length));
  });
}

function nearest(palette, r, g, b) {
  let best = 0, bestD = Infinity;
  for (let i = 0; i < palette.length; i++) {
    const p = palette[i];
    const rm = (p[0] + r) / 2; // "redmean" weighting: closer to perceived difference than plain RGB
    const dr = p[0] - r, dg = p[1] - g, db = p[2] - b;
    const d = (2 + rm / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm) / 256) * db * db;
    if (d < bestD) { bestD = d; best = i; }
  }
  return best;
}

function applyPalette(frame, palette) {
  const cache = new Map();
  const d = frame.data;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] !== 255) continue;
    const key = (d[i] << 16) | (d[i + 1] << 8) | d[i + 2];
    let idx = cache.get(key);
    if (idx === undefined) { idx = nearest(palette, d[i], d[i + 1], d[i + 2]); cache.set(key, idx); }
    const p = palette[idx];
    d[i] = p[0]; d[i + 1] = p[1]; d[i + 2] = p[2];
  }
}

/** Remove stray pixels and pinholes so clusters stay large and deliberate. */
function cleanup(frame) {
  const { width: W, height: H } = frame;
  const src = new Uint8ClampedArray(frame.data);
  const d = frame.data;
  const opaque = (x, y) => x >= 0 && y >= 0 && x < W && y < H && src[(y * W + x) * 4 + 3] === 255;
  const dirs4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      let n = 0;
      for (const [dx, dy] of dirs4) if (opaque(x + dx, y + dy)) n++;
      if (src[i + 3] === 255) {
        if (n === 0) d[i + 3] = 0; // lone pixel
      } else if (n >= 3) {
        // pinhole: fill from the first opaque neighbour
        for (const [dx, dy] of dirs4) {
          if (opaque(x + dx, y + dy)) {
            const j = ((y + dy) * W + x + dx) * 4;
            d[i] = src[j]; d[i + 1] = src[j + 1]; d[i + 2] = src[j + 2]; d[i + 3] = 255;
            break;
          }
        }
      }
    }
  }
}

function darkest(palette) {
  let best = palette[0], bl = Infinity;
  for (const p of palette) {
    const l = 0.3 * p[0] + 0.59 * p[1] + 0.11 * p[2];
    if (l < bl) { bl = l; best = p; }
  }
  return best;
}

/** One-pixel contour on the outside of the silhouette. */
function addOutline(frame, color) {
  const { width: W, height: H } = frame;
  const src = new Uint8ClampedArray(frame.data);
  const d = frame.data;
  const opaque = (x, y) => x >= 0 && y >= 0 && x < W && y < H && src[(y * W + x) * 4 + 3] === 255;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      if (src[i + 3] === 255) continue;
      if (opaque(x + 1, y) || opaque(x - 1, y) || opaque(x, y + 1) || opaque(x, y - 1)) {
        d[i] = color[0]; d[i + 1] = color[1]; d[i + 2] = color[2]; d[i + 3] = 255;
      }
    }
  }
}

/**
 * @param {{width:number,height:number,data:Uint8ClampedArray}[]} frames  equal-size RGBA frames with real alpha
 * @returns {{frames: object[], palette: number[][], width: number, height: number} | null}
 */
export function richify(frames, options = {}) {
  const o = { ...RICHIFY_DEFAULTS, ...options };
  const bounds = unionBounds(frames);
  if (!bounds) return null;

  // One scale for the whole clip so motion and proportions survive.
  const scale = o.bodyHeight / bounds.h;
  const dw = Math.max(1, Math.round(bounds.w * scale));
  const dh = o.bodyHeight;
  const cw = Math.max(o.cellWidth, dw + 6);
  const ch = Math.max(o.cellHeight, dh + o.contactFromBottom + 4);
  const ox = Math.round((cw - dw) / 2);
  const oy = ch - o.contactFromBottom - 1 - dh; // last body row sits just above the contact edge

  const out = frames.map((f) => {
    const cell = blank(cw, ch);
    resampleInto(f, bounds, cell, ox, oy, dw, dh);
    return cell;
  });

  const palette = buildPalette(out, o.colors);
  for (const f of out) {
    applyPalette(f, palette);
    cleanup(f);
  }
  if (o.outline) {
    const line = darkest(palette).map((v) => Math.round(v * 0.45));
    for (const f of out) addOutline(f, line);
    palette.push(line);
  }
  return { frames: out, palette, width: cw, height: ch };
}
