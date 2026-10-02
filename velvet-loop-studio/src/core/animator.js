// Animation playback: a small clock-driven state machine. Owns frame timing
// only; it never touches the DOM or the canvas.

export const MIN_FPS = 1;
export const MAX_FPS = 60;

export class Animator {
  constructor({ fps = 12, loop = true } = {}) {
    this.fps = fps;
    this.loop = loop;
    this.frameCount = 0;
    this.frame = 0;
    this.playing = false;
    this._acc = 0; // fractional frames accumulated since last advance
    this._last = null;
  }

  get hasSheet() {
    return this.frameCount > 0;
  }

  /** Swap in a new sheet, keeping fps and loop settings, and start playing from frame 0. */
  setFrameCount(count) {
    this.frameCount = count;
    this.restart();
  }

  setFps(fps) {
    this.fps = Math.min(MAX_FPS, Math.max(MIN_FPS, fps));
  }

  setLoop(loop) {
    this.loop = loop;
  }

  play() {
    if (!this.hasSheet) return;
    // Finished a non-looping run: play starts it over.
    if (!this.loop && this.frame >= this.frameCount - 1) this.frame = 0;
    this.playing = true;
    this._last = null;
  }

  pause() {
    this.playing = false;
  }

  restart() {
    this.frame = 0;
    this._acc = 0;
    this.playing = this.hasSheet;
    this._last = null;
  }

  /** Advance to time `now` (ms, e.g. the requestAnimationFrame timestamp). */
  update(now) {
    if (!this.playing || !this.hasSheet) return;
    if (this._last === null) this._last = now;
    // Clamp so a backgrounded tab doesn't fast-forward through the loop.
    const dt = Math.min(now - this._last, 250);
    this._last = now;

    this._acc += (dt / 1000) * this.fps;
    const steps = Math.floor(this._acc);
    if (steps < 1) return;
    this._acc -= steps;

    const next = this.frame + steps;
    if (next < this.frameCount) {
      this.frame = next;
    } else if (this.loop) {
      this.frame = next % this.frameCount;
    } else {
      this.frame = this.frameCount - 1;
      this.playing = false;
    }
  }
}
