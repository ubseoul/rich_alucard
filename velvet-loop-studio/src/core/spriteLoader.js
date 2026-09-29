// Sprite loading: turns a user-chosen File into decoded pixel data.
// Knows nothing about slicing, playback or rendering.

/**
 * Decode an image File into an ImageBitmap plus its raw RGBA pixels.
 * @param {File} file
 * @returns {Promise<{name: string, bitmap: ImageBitmap, width: number, height: number, pixels: Uint8ClampedArray}>}
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
  const { data } = ctx.getImageData(0, 0, width, height);

  return { name: file.name, bitmap, width, height, pixels: data };
}
