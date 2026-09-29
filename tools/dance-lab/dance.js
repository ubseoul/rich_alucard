/* Dance Lab — programmatic animation of a FROZEN pixel sprite.
 *
 * Nothing is drawn or resampled. Each output pixel is an exact copy of one source pixel,
 * chosen by integer row/column remaps ("scanline warp"):
 *   - per-row horizontal offset  -> hips sway, torso counter-sways, head follows late
 *   - per-row vertical remap     -> upper body bobs, feet stay planted
 *   - per-column warp in a hair band -> ponytail lags behind the head (monotone, so no tearing)
 * Every term is periodic in the phase, so the loop is seamless.
 *
 * Reuse for another character: load its PNG, adjust RIG (landmarks are fractions of the
 * sprite's opaque bounding box, 0 = top of head, 1 = soles of feet).
 */
'use strict';

const RIG = {
  feetU: 0.97,      // at/below this: fully planted (no motion)
  hipU: 0.56,       // hips: full sway
  shoulderU: 0.30,  // shoulders: full counter-motion
  headU: 0.16,      // head: extra delayed lag
  counter: 1.5,     // torso counter-motion strength relative to hips
  lag: 0.5,         // radians of phase lag for torso
  headLag: 1.0,     // radians of phase lag for head
  bobFullU: 0.62,   // vertical bob reaches full strength here
  // Hair band (source-pixel coords as fractions of bbox width/height). null = disabled.
  hair: { yTop: 0.0, yBot: 0.40, xStartTop: 0.35, xStartBot: 0.70, xTip: 1.0, rows: [0.0, 0.5] },
};

const P = {
  amp: 1.0,        // intensity multiplier
  speed: 1.0,      // cycle = BASE_CYCLE / speed
  baseCycle: 4.0,  // seconds
  hipPx: 24,       // sway distance in source px at amp=1
  bobPx: 10,        // bounce in source px at amp=1
  hairPx: 30,      // ponytail lag at amp=1
  fps: 24,         // 0 = every display frame
  hair: true,
};

const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

class Sprite {
  constructor(img) {
    this.w = img.naturalWidth; this.h = img.naturalHeight;
    const c = document.createElement('canvas'); c.width = this.w; c.height = this.h;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.imageSmoothingEnabled = false;
    g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, this.w, this.h);
    this.src = new Uint32Array(d.data.buffer.slice(0));
    // opaque bbox
    let x0 = this.w, x1 = -1, y0 = this.h, y1 = -1;
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      if ((this.src[y * this.w + x] >>> 24) > 32) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    }
    this.bbox = { x0, x1, y0, y1, w: x1 - x0 + 1, h: y1 - y0 + 1 };
    // output canvas = bbox + margin so sway never clips
    this.margin = 48;
    this.ow = this.bbox.w + this.margin * 2; this.oh = this.bbox.h + this.margin * 2;
    this.out = new Uint32Array(this.ow * this.oh);
    this.id = new ImageData(new Uint8ClampedArray(this.out.buffer), this.ow, this.oh);
  }

  /** Render pose at phase (radians, one full sway cycle = 2π) into this.out. */
  render(phase, amp) {
    const { src, w, h, bbox, ow, oh, margin, out } = this;
    out.fill(0);
    const R = RIG;
    const s = Math.sin(phase);
    const sLag = Math.sin(phase - R.lag);
    const sHead = Math.sin(phase - R.headLag);
    const bob = 0.5 + 0.5 * Math.cos(2 * phase);          // 2 bounces per cycle (one per weight shift)
    const hipA = P.hipPx * amp, bobA = P.bobPx * amp, hairA = P.hairPx * amp;
    const hairSway = Math.sin(phase - 1.6);                // ponytail lags ~1/4 beat behind
    const hairLift = 0.5 + 0.5 * Math.cos(2 * phase - 1.2);

    // ---- build per-output-row tables ----
    const srcRowOf = new Int32Array(oh), offOf = new Int32Array(oh);
    for (let yo = 0; yo < oh; yo++) {
      // vertical: sample source row = yo - dy, dy grows from 0 (feet) to bobA*bob (upper body)
      const uOut = (yo - margin) / bbox.h;
      const dy = Math.round(bobA * bob * smooth(R.feetU, R.bobFullU, uOut) * (1 - 0) - bobA * 0.5 * smooth(R.feetU, R.bobFullU, uOut));
      const ys = yo - margin + bbox.y0 - dy;
      srcRowOf[yo] = ys;
      const u = (ys - bbox.y0) / bbox.h;
      const hipW = smooth(R.feetU, R.hipU, u);              // 0 at feet -> 1 at hips
      const c = smooth(R.hipU, R.shoulderU, u);             // 0 at hips -> 1 at shoulders
      const hd = smooth(R.shoulderU, R.headU, u);           // 0 at shoulders -> 1 at head
      const off = hipA * (hipW * s - c * R.counter * sLag) + hipA * 0.45 * hd * sHead;
      offOf[yo] = Math.round(off);
    }

    // ---- hair band ----
    const H = P.hair && R.hair ? R.hair : null;
    const hy0 = bbox.y0 + (H ? H.yTop * bbox.h : 0), hy1 = bbox.y0 + (H ? H.yBot * bbox.h : 0);
    const hxTip = bbox.x0 + (H ? H.xTip * bbox.w : 0);

    for (let yo = 0; yo < oh; yo++) {
      const ys = srcRowOf[yo];
      if (ys < 0 || ys >= h) continue;
      const off = offOf[yo];
      const so = ys * w, oo = yo * ow;
      let hairE = 0, xa = 0, xb = 0;
      if (H && ys >= hy0 && ys <= hy1) {
        const v = (ys - hy0) / (hy1 - hy0);
        xa = bbox.x0 + (H.xStartTop + (H.xStartBot - H.xStartTop) * v) * bbox.w;
        xb = hxTip;
        hairE = hairA * (hairSway * 0.8 + 0.2 * (hairLift - 0.5)) * (0.35 + 0.65 * v);
      }
      for (let xo = 0; xo < ow; xo++) {
        let xs = xo - margin + bbox.x0 - off;
        if (hairE !== 0 && xs > xa) xs -= Math.round(hairE * smooth(xa, xb, xs));
        if (xs < 0 || xs >= w) continue;
        out[oo + xo] = src[so + xs];
      }
    }
    return this.id;
  }

  /** True if the amp=0 render reproduces the source bbox crop bit-for-bit. */
  verifyFrozen() {
    this.render(0, 0);
    const { src, w, bbox, ow, margin, out } = this;
    let bad = 0;
    for (let y = 0; y < bbox.h; y++) for (let x = 0; x < bbox.w; x++) {
      if (out[(y + margin) * ow + x + margin] !== src[(y + bbox.y0) * w + x + bbox.x0]) bad++;
    }
    return bad;
  }
}

/* ---------------- UI wiring ---------------- */
(function () {
  if (typeof document === 'undefined' || !document.getElementById('view')) return;
  const $ = (id) => document.getElementById(id);
  const view = $('view'), vg = view.getContext('2d');
  const ref = $('ref'), rg = ref.getContext('2d');
  let sprite = null, playing = true, tAcc = 0, last = performance.now(), lastFrameIdx = -1, manualPhase = null;

  function setZoom() {
    const z = parseFloat($('zoom').value);
    for (const c of [view, ref]) { c.style.width = (c.width * z) + 'px'; c.style.height = (c.height * z) + 'px'; }
  }

  function load(src) {
    const img = new Image();
    img.onload = () => {
      sprite = new Sprite(img);
      for (const c of [view, ref]) { c.width = sprite.ow; c.height = sprite.oh; }
      vg.imageSmoothingEnabled = false; rg.imageSmoothingEnabled = false;
      // static reference: exact source crop
      rg.clearRect(0, 0, ref.width, ref.height);
      rg.drawImage(img, sprite.bbox.x0, sprite.bbox.y0, sprite.bbox.w, sprite.bbox.h, sprite.margin, sprite.margin, sprite.bbox.w, sprite.bbox.h);
      setZoom(); lastFrameIdx = -1;
      const bad = sprite.verifyFrozen();
      $('verify').textContent = bad === 0 ? 'amp=0 render == source: 0 differing pixels ✔' : 'amp=0 mismatch: ' + bad + ' px ✘';
      $('meta').textContent = `${sprite.w}×${sprite.h} source · bbox ${sprite.bbox.w}×${sprite.bbox.h}`;
    };
    img.src = src;
  }

  function frame(now) {
    const dt = (now - last) / 1000; last = now;
    if (playing) tAcc += dt * P.speed;
    if (sprite) {
      let phase = manualPhase !== null ? manualPhase : (tAcc / P.baseCycle) * Math.PI * 2;
      if (P.fps > 0 && manualPhase === null) {
        const step = Math.round((tAcc / P.baseCycle) * P.fps * P.baseCycle);
        const q = P.fps * P.baseCycle; // frames per cycle at speed 1
        phase = ((step % q) / q) * Math.PI * 2;
        if (step === lastFrameIdx) { requestAnimationFrame(frame); return; }
        lastFrameIdx = step;
      }
      vg.putImageData(sprite.render(phase, P.amp), 0, 0);
      $('phase').textContent = 'phase ' + (((phase / (Math.PI * 2)) % 1 + 1) % 1).toFixed(3) + ' · cycle ' + (P.baseCycle / P.speed).toFixed(2) + 's';
    }
    requestAnimationFrame(frame);
  }

  $('play').onclick = () => { playing = !playing; $('play').textContent = playing ? 'Pause' : 'Play'; };
  $('speed').oninput = (e) => { P.speed = +e.target.value; $('speedv').textContent = P.speed.toFixed(2) + '×'; };
  $('amp').oninput = (e) => { P.amp = +e.target.value; $('ampv').textContent = P.amp.toFixed(2) + '×'; lastFrameIdx = -1; };
  $('fps').onchange = (e) => { P.fps = +e.target.value; lastFrameIdx = -1; };
  $('hair').onchange = (e) => { P.hair = e.target.checked; lastFrameIdx = -1; };
  $('zoom').onchange = setZoom;
  $('showref').onchange = (e) => { $('refwrap').style.display = e.target.checked ? '' : 'none'; };
  $('reset').onclick = () => {
    P.amp = 1; P.speed = 1; P.fps = 24; P.hair = true; tAcc = 0; playing = true; manualPhase = null; lastFrameIdx = -1;
    $('amp').value = 1; $('speed').value = 1; $('fps').value = 24; $('hair').checked = true; $('zoom').value = '0.5';
    $('play').textContent = 'Pause'; $('amp').oninput({ target: $('amp') }); $('speed').oninput({ target: $('speed') }); setZoom();
  };
  $('file').onchange = (e) => { const f = e.target.files[0]; if (f) load(URL.createObjectURL(f)); };
  window.addEventListener('keydown', (e) => { if (e.code === 'Space') { e.preventDefault(); $('play').click(); } });

  window.DanceLab = { P, RIG, get sprite() { return sprite; }, setPhase(p) { manualPhase = p; lastFrameIdx = -1; }, Sprite };
  $('zoom').value = window.innerHeight > 1300 ? '1' : '0.5';
  load('data:image/png;base64,' + window.SPRITE_PNG_B64);
  requestAnimationFrame(frame);
})();
