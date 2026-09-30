// Sprite slicing: detects frame layout of a single horizontal strip and
// computes per-frame source rectangles. Pure functions, no DOM access.

const ALPHA_THRESHOLD = 8;
const MAX_CUT_BLEED = 0.12; // cut columns may hold at most this share of an average column's pixels
const MIN_FRAME_WIDTH = 4;

function opaqueInColumn(pixels, width, height, x) {
  let count = 0;
  for (let y = 0; y < height; y++) {
    if (pixels[(y * width + x) * 4 + 3] > ALPHA_THRESHOLD) count++;
  }
  return count;
}

/**
 * How much of the character a set of cut lines would slice through, relative to
 * an average column (0 = every cut lands in a gap, ~1 = cuts go through bodies).
 * Relative, so a stray ponytail tip crossing one cut doesn't disqualify the layout.
 */
function cutBleed(columnOpacity, width, n) {
  if (n <= 1) return 0;
  const fw = width / n;
  let total = 0;
  for (let x = 0; x < width; x++) total += columnOpacity[x];
  if (total === 0) return 0;
  let atCuts = 0;
  for (let i = 1; i < n; i++) atCuts += columnOpacity[i * fw - 1] + columnOpacity[i * fw];
  return atCuts / (2 * (n - 1)) / (total / width);
}

/** Number of runs of non-empty columns, ignoring gaps narrower than 2px. */
function countFigures(columnOpacity) {
  let figures = 0, gap = Infinity;
  for (const c of columnOpacity) {
    if (c > 0) {
      if (gap >= 2) figures++;
      gap = 0;
    } else gap++;
  }
  return figures;
}

/**
 * Work out how many equal-width frames a horizontal strip contains.
 * Frame height is always the sheet height.
 */
export function detectFrameCount(pixels, width, height) {
  if (width <= height) return 1;

  const columnOpacity = new Uint32Array(width);
  for (let x = 0; x < width; x++) columnOpacity[x] = opaqueInColumn(pixels, width, height, x);

  const candidates = [];
  for (let n = 1; n <= width / MIN_FRAME_WIDTH; n++) {
    if (width % n === 0) candidates.push({ n, bleed: cutBleed(columnOpacity, width, n) });
  }
  const clean = candidates.filter((c) => c.bleed <= MAX_CUT_BLEED);

  // The most frames whose cut lines all fall on transparent gaps. Divisors of
  // the true count are also clean (their cuts are a subset of the real ones),
  // while multiples cut through the character, so the largest clean count wins.
  if (clean.length > 1) return clean[clean.length - 1].n;

  // Uneven width (frames not exactly equal): count the separated figures instead.
  const figures = countFigures(columnOpacity);
  if (figures > 1) return figures;

  // Nothing is clean (e.g. opaque background): fall back to nearest-to-square.
  if (width % height === 0) return width / height;
  const best = candidates
    .filter((c) => c.n > 1)
    .sort((a, b) => Math.abs(width / a.n / height - 1) - Math.abs(width / b.n / height - 1))[0];
  return best ? best.n : 1;
}

/** Union bounding box of all opaque pixels, measured within each frame's own coordinates. */
export function measureContentBounds(pixels, sheetWidth, frames) {
  let minX = Infinity, minY = Infinity, maxX = -1, maxY = -1;
  for (const f of frames) {
    for (let y = 0; y < f.h; y++) {
      const row = (f.y + y) * sheetWidth;
      for (let x = 0; x < f.w; x++) {
        if (pixels[(row + f.x + x) * 4 + 3] > ALPHA_THRESHOLD) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
  }
  if (maxX < 0) return { x: 0, y: 0, w: frames[0].w, h: frames[0].h };
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

/**
 * @returns {{frameCount:number, frameWidth:number, frameHeight:number,
 *            frames:{x:number,y:number,w:number,h:number}[],
 *            content:{x:number,y:number,w:number,h:number}}}
 */
export function sliceSpriteSheet({ pixels, width, height }) {
  let frameCount = detectFrameCount(pixels, width, height);
  const frameWidth = Math.floor(width / frameCount);
  frameCount = Math.max(1, frameCount);
  const frames = Array.from({ length: frameCount }, (_, i) => ({ x: i * frameWidth, y: 0, w: frameWidth, h: height }));
  return {
    frameCount,
    frameWidth,
    frameHeight: height,
    frames,
    content: measureContentBounds(pixels, width, frames),
  };
}

/** Copy each frame rectangle of a sheet out as its own RGBA image. */
export function extractFrames(pixels, sheetWidth, frames) {
  return frames.map((f) => {
    const data = new Uint8ClampedArray(f.w * f.h * 4);
    for (let y = 0; y < f.h; y++) {
      const from = ((f.y + y) * sheetWidth + f.x) * 4;
      data.set(pixels.subarray(from, from + f.w * 4), y * f.w * 4);
    }
    return { width: f.w, height: f.h, data };
  });
}
