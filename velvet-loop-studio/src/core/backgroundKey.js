// Background keying: many generators export a solid (usually white) background
// instead of transparency. If the image border is one flat colour, flood-fill it
// from the edges and make it transparent. Flood fill (not a global colour match)
// keeps same-coloured pixels inside the character, e.g. eye highlights, intact.
// Pure function over RGBA data; mutates `pixels`.

const TOLERANCE = 36; // max per-channel distance from the background colour

/** @returns {boolean} true if a background was removed */
export function keyOutSolidBackground(pixels, width, height) {
  const at = (x, y) => (y * width + x) * 4;

  // Already transparent along the border? Nothing to do.
  const corners = [at(0, 0), at(width - 1, 0), at(0, height - 1), at(width - 1, height - 1)];
  if (corners.some((i) => pixels[i + 3] < 250)) return false;

  const bg = [pixels[corners[0]], pixels[corners[0] + 1], pixels[corners[0] + 2]];
  const near = (i) =>
    Math.abs(pixels[i] - bg[0]) <= TOLERANCE &&
    Math.abs(pixels[i + 1] - bg[1]) <= TOLERANCE &&
    Math.abs(pixels[i + 2] - bg[2]) <= TOLERANCE &&
    pixels[i + 3] > 250;
  if (!corners.every(near)) return false;

  const seen = new Uint8Array(width * height);
  const stack = [];
  const push = (x, y) => {
    const k = y * width + x;
    if (!seen[k] && near(k * 4)) {
      seen[k] = 1;
      stack.push(k);
    }
  };
  for (let x = 0; x < width; x++) { push(x, 0); push(x, height - 1); }
  for (let y = 0; y < height; y++) { push(0, y); push(width - 1, y); }

  while (stack.length) {
    const k = stack.pop();
    const x = k % width, y = (k - x) / width;
    pixels[k * 4 + 3] = 0;
    if (x > 0) push(x - 1, y);
    if (x < width - 1) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y < height - 1) push(x, y + 1);
  }
  return true;
}
