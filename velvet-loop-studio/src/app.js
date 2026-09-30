// Composition root: connects loader → slicer → (restyle) → animator → renderer → UI.
import { loadSpriteSheet } from './core/spriteLoader.js';
import { loadAnimation } from './core/animationLoader.js';
import { sliceSpriteSheet, extractFrames } from './core/spriteSlicer.js';
import { richify, levelOptions, LEVELS, unionBounds } from './core/richify.js';
import { Animator } from './core/animator.js';
import { Renderer } from './render/renderer.js';
import { defaultScene } from './scenes/index.js';
import { bindControls } from './ui/controls.js';

const DEFAULT_FPS = 12;

const animator = new Animator({ fps: DEFAULT_FPS, loop: true });
const renderer = new Renderer(document.getElementById('stage'), animator, defaultScene);

// What is currently loaded, kept so the restyle toggle can rebuild without re-picking the file.
let source = null; // { name, sheet?, slices?, frames? }
let style = { richify: false, level: 'medium', colors: null };
let restyled = null; // last Rich Alucard-ified output, for download

const toCanvas = ({ width, height, data }) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d').putImageData(new ImageData(data, width, height), 0, 0);
  return canvas;
};

const framesToSprite = (images) => {
  const canvases = images.map(toCanvas);
  const { width, height } = images[0];
  return {
    frames: canvases.map((image) => ({ image, x: 0, y: 0, w: width, h: height })),
    content: unionBounds(images) ?? { x: 0, y: 0, w: width, h: height },
  };
};

const nextPaint = () => new Promise((r) => requestAnimationFrame(() => setTimeout(r)));

/** Turn `source` + `style` into a sprite on screen. Scene, FPS and loop setting carry over. */
async function present() {
  let sprite, info, note = '';
  restyled = null;

  if (style.richify) {
    ui.setBusy('Rich Alucard-ifying…');
    await nextPaint();
    const raw = source.sheet ? extractFrames(source.sheet.pixels, source.sheet.width, source.slices.frames) : source.frames;
    const out = richify(raw, levelOptions(style.level, style.colors));
    restyled = out;
    if (!out) throw new Error('No visible pixels found in this file.');
    sprite = framesToSprite(out.frames);
    info = { frameCount: out.frames.length, frameWidth: out.width, frameHeight: out.height };
    note = `Rich Alucard ${LEVELS[style.level].label} · ${out.palette.length} colors`;
  } else if (source.sheet) {
    const { frames, content, frameCount, frameWidth, frameHeight } = source.slices;
    sprite = { bitmap: source.sheet.bitmap, frames, content };
    info = { frameCount, frameWidth, frameHeight };
  } else {
    sprite = framesToSprite(source.frames);
    info = { frameCount: source.frames.length, frameWidth: source.frames[0].width, frameHeight: source.frames[0].height };
  }

  renderer.setSprite(sprite);
  animator.setFrameCount(info.frameCount);
  ui.setLoaded({ name: source.name, note, ...info });
}

const ui = bindControls(
  {
    async onFile(file) {
      try {
        ui.setBusy(`Loading ${file.name}…`);
        const anim = await loadAnimation(file);
        if (anim) {
          source = { name: anim.name, frames: anim.frames };
          animator.setFps(anim.fps); // clips carry their own timing
          ui.setFps(anim.fps);
        } else {
          const sheet = await loadSpriteSheet(file);
          source = { name: sheet.name, sheet, slices: sliceSpriteSheet(sheet) };
        }
        await present();
      } catch (err) {
        ui.setError(err.message);
      }
    },
    onPlay: () => animator.play(),
    onPause: () => animator.pause(),
    onRestart: () => animator.restart(),
    onFps: (fps) => animator.setFps(fps),
    onLoop: (loop) => animator.setLoop(loop),
    onDownload() {
      if (!restyled) return;
      const { frames, width, height } = restyled;
      const sheet = document.createElement('canvas'); // frames side by side: loads straight back into this tool
      sheet.width = width * frames.length;
      sheet.height = height;
      const ctx = sheet.getContext('2d');
      frames.forEach((f, i) => ctx.putImageData(new ImageData(f.data, width, height), i * width, 0));
      sheet.toBlob((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${source.name.replace(/\.[^.]+$/, '')}_richalucard_${style.level}.png`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      }, 'image/png');
    },
    async onStyle(next) {
      style = next;
      if (!source) return;
      try {
        await present();
      } catch (err) {
        ui.setError(err.message);
      }
    },
  },
  { fps: DEFAULT_FPS, loop: true },
);

// Keep play/pause highlight in sync (also flips when a non-looping run ends).
let shown = null;
(function syncButtons() {
  if (animator.hasSheet && shown !== animator.playing) {
    shown = animator.playing;
    ui.setPlaying(shown);
  }
  requestAnimationFrame(syncButtons);
})();

renderer.start();
