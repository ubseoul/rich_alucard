// Animation loading: decodes videos (MP4, WebM incl. alpha) and animated images
// (GIF, APNG, animated WebP) into a list of RGBA frames with real alpha.
// Returns null for a still image so the caller can treat it as a sprite sheet.
import { keyOutSolidBackground } from './backgroundKey.js';

const MAX_FRAMES = 240;
const MAX_HEIGHT = 540; // keep memory sane; the stage never shows more than this
const VIDEO_SAMPLE_FPS = 12;

function fitSize(w, h) {
  const k = Math.min(1, MAX_HEIGHT / h);
  return { w: Math.max(1, Math.round(w * k)), h: Math.max(1, Math.round(h * k)) };
}

function grab(canvas, ctx, source, w, h) {
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(source, 0, 0, w, h);
  const img = ctx.getImageData(0, 0, w, h);
  keyOutSolidBackground(img.data, w, h); // no-op when the clip already has transparency
  return { width: w, height: h, data: img.data };
}

function newCanvas(w, h) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  return { canvas, ctx: canvas.getContext('2d', { willReadFrequently: true }) };
}

export const isVideo = (file) => file.type.startsWith('video/') || /\.(mp4|webm|mov|m4v|ogv)$/i.test(file.name);

async function loadVideo(file) {
  const url = URL.createObjectURL(file);
  try {
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.src = url;
    await new Promise((resolve, reject) => {
      video.onloadeddata = resolve;
      video.onerror = () => reject(new Error(`"${file.name}" is not a video this app can decode (try MP4, or WebM for transparency).`));
    });

    // Some WebM files (e.g. browser recordings) report no duration until seeked to the end.
    if (!Number.isFinite(video.duration)) {
      await new Promise((r) => {
        video.addEventListener('durationchange', r, { once: true });
        video.currentTime = 1e9;
      });
    }
    const { w, h } = fitSize(video.videoWidth, video.videoHeight);
    const duration = video.duration;
    if (!Number.isFinite(duration) || duration <= 0) throw new Error(`Could not read the length of "${file.name}".`);
    const sampleFps = Math.min(VIDEO_SAMPLE_FPS, MAX_FRAMES / duration);
    const count = Math.max(1, Math.floor(duration * sampleFps));
    const { canvas, ctx } = newCanvas(w, h);

    const frames = [];
    for (let i = 0; i < count; i++) {
      const seeked = new Promise((r) => video.addEventListener('seeked', r, { once: true }));
      video.currentTime = Math.min(duration - 0.001, i / sampleFps);
      await seeked;
      frames.push(grab(canvas, ctx, video, w, h));
    }
    return { frames, fps: Math.max(1, Math.round(sampleFps)) };
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function loadAnimatedImage(file) {
  if (typeof ImageDecoder === 'undefined') return null;
  const type = file.type || 'image/gif';
  if (!(await ImageDecoder.isTypeSupported(type))) return null;

  const decoder = new ImageDecoder({ data: await file.arrayBuffer(), type });
  await decoder.tracks.ready;
  await decoder.completed;
  const track = decoder.tracks.selectedTrack;
  if (!track || track.frameCount < 2) {
    decoder.close();
    return null;
  }

  const count = Math.min(track.frameCount, MAX_FRAMES);
  const first = (await decoder.decode({ frameIndex: 0 })).image;
  const { w, h } = fitSize(first.displayWidth, first.displayHeight);
  const { canvas, ctx } = newCanvas(w, h);
  const frames = [];
  const delays = [];
  first.close();
  for (let i = 0; i < count; i++) {
    const { image } = await decoder.decode({ frameIndex: i });
    delays.push((image.duration || 100000) / 1000); // µs -> ms, default 100ms
    frames.push(grab(canvas, ctx, image, w, h));
    image.close();
  }
  decoder.close();
  delays.sort((a, b) => a - b);
  const median = delays[delays.length >> 1] || 100;
  return { frames, fps: Math.min(60, Math.max(1, Math.round(1000 / median))) };
}

/** @returns {Promise<{name:string, frames:object[], fps:number} | null>} */
export async function loadAnimation(file) {
  let result;
  if (isVideo(file)) {
    result = await loadVideo(file);
  } else {
    try {
      result = await loadAnimatedImage(file);
    } catch {
      result = null; // undecodable here: let the still-image path report it
    }
  }
  return result ? { name: file.name, ...result } : null;
}
