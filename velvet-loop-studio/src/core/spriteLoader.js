// Sprite loading: turns a user-chosen File into decoded pixel data.
// Knows nothing about slicing, playback or rendering.
import { keyOutSolidBackground } from './backgroundKey.js';

/**
 * Decode an image File into an drawable image plus its raw RGBA pixels.
 * @param {File} file
 * @returns {Promise<{name: string, bitmap: CanvasImageSource, width: number, height: number, pixels: Uint8ClampedArray}>}
 */
export async function loadSpriteSheet(file) {
  let bitmap;
  try {
    bitmap = await createImageBitmap(file, { premultiplyAlpha: 'none', colorSpaceConversion: 'none' });
  } catch {
    throw new Error(`"${file.name}" is not a readable image.`);
  }

  const { width, height } = bitmap;
  const probe = document.createElement('canvas');
  probe.width = width;
  probe.height = height;
  const ctx = probe.getContext('2d', { willReadFrequently: true });
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(bitmap, 0, 0);
  const image = ctx.getImageData(0, 0, width, height);

  // Solid-colour background (e.g. white)? Make it transparent and draw from the cleaned canvas.
  let source = bitmap;
  if (keyOutSolidBackground(image.data, width, height)) {
    ctx.putImageData(image, 0, 0);
    source = probe;
  }

  return { name: file.name, bitmap: source, width, height, pixels: image.data };
}
