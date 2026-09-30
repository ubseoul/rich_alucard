// Rendering: owns the canvas, the requestAnimationFrame loop, and the cached
// static stage. Draws exactly one animated element: the sprite frame.

export class Renderer {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {import('../core/animator.js').Animator} animator
   * @param {object} scene
   */
  constructor(canvas, animator, scene) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.animator = animator;
    this.scene = scene;
    this.sprite = null; // { bitmap?, frames, content }
    this._stage = document.createElement('canvas');
    this._layout = null;
    this._dirty = true;
    this._raf = 0;

    new ResizeObserver(() => this._resize()).observe(canvas.parentElement);
    this._resize();
  }

  setSprite(sprite) {
    this.sprite = sprite;
    this._dirty = true;
  }

  setScene(scene) {
    this.scene = scene;
    this._dirty = true;
  }

  start() {
    const tick = (now) => {
      this._raf = requestAnimationFrame(tick);
      this.animator.update(now);
      this._draw();
    };
    this._raf = requestAnimationFrame(tick);
  }

  _resize() {
    const box = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = Math.max(1, Math.round(box.width * dpr));
    const h = Math.max(1, Math.round(box.height * dpr));
    if (w === this.canvas.width && h === this.canvas.height) return;
    this.canvas.width = w;
    this.canvas.height = h;
    this._dirty = true;
  }

  _rebuildStage() {
    const { width, height } = this.canvas;
    const content = this.sprite ? this.sprite.content : { x: 0, y: 0, w: height * 0.25, h: height * 0.7 };
    this._layout = this.scene.layout({ width, height, content });
    this._stage.width = width;
    this._stage.height = height;
    this.scene.paintStage(this._stage.getContext('2d'), { width, height, layout: this._layout });
    this._dirty = false;
  }

  _draw() {
    if (this._dirty) this._rebuildStage();
    const ctx = this.ctx;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(this._stage, 0, 0);
    if (!this.sprite) return;

    const f = this.sprite.frames[this.animator.frame];
    const L = this._layout;
    ctx.drawImage(f.image || this.sprite.bitmap, f.x, f.y, f.w, f.h, L.x, L.y, f.w * L.scale, f.h * L.scale);
  }
}
