// Composition root: connects loader → slicer → animator → renderer → UI.
import { loadSpriteSheet } from './core/spriteLoader.js';
import { sliceSpriteSheet } from './core/spriteSlicer.js';
import { Animator } from './core/animator.js';
import { Renderer } from './render/renderer.js';
import { defaultScene } from './scenes/index.js';
import { bindControls } from './ui/controls.js';

const DEFAULT_FPS = 12;

const animator = new Animator({ fps: DEFAULT_FPS, loop: true });
const renderer = new Renderer(document.getElementById('stage'), animator, defaultScene);

const ui = bindControls(
  {
    async onFile(file) {
      try {
        const sheet = await loadSpriteSheet(file);
        const slices = sliceSpriteSheet(sheet);
        // Only the sprite changes: scene, FPS and loop setting carry over.
        renderer.setSprite({ bitmap: sheet.bitmap, frames: slices.frames, content: slices.content });
        animator.setFrameCount(slices.frameCount);
        ui.setLoaded({ name: sheet.name, ...slices });
      } catch (err) {
        ui.setError(err.message);
      }
    },
    onPlay: () => animator.play(),
    onPause: () => animator.pause(),
    onRestart: () => animator.restart(),
    onFps: (fps) => animator.setFps(fps),
    onLoop: (loop) => animator.setLoop(loop),
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
