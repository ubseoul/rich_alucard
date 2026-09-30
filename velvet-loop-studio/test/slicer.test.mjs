import test from 'node:test';
import assert from 'node:assert/strict';
import { sliceSpriteSheet } from '../src/core/spriteSlicer.js';
import { Animator } from '../src/core/animator.js';

// Build a strip of `n` frames, fw x h, each with a body block inset by `margin`.
function strip(n, fw, h, margin = 4) {
  const width = n * fw;
  const pixels = new Uint8ClampedArray(width * h * 4);
  for (let f = 0; f < n; f++)
    for (let y = margin; y < h - margin; y++)
      for (let x = margin; x < fw - margin; x++) pixels[(y * width + f * fw + x) * 4 + 3] = 255;
  return { pixels, width, height: h };
}

test('square frames', () => {
  const r = sliceSpriteSheet(strip(8, 64, 64));
  assert.deepEqual([r.frameCount, r.frameWidth, r.frameHeight], [8, 64, 64]);
});
test('non-square frames', () => {
  const r = sliceSpriteSheet(strip(6, 48, 96));
  assert.deepEqual([r.frameCount, r.frameWidth, r.frameHeight], [6, 48, 96]);
});
test('wide frames', () => {
  const r = sliceSpriteSheet(strip(5, 100, 40));
  assert.deepEqual([r.frameCount, r.frameWidth, r.frameHeight], [5, 100, 40]);
});
test('single frame', () => {
  assert.equal(sliceSpriteSheet(strip(1, 64, 64)).frameCount, 1);
});
test('content bounds', () => {
  const r = sliceSpriteSheet(strip(4, 32, 32, 6));
  assert.deepEqual(r.content, { x: 6, y: 6, w: 20, h: 20 });
});
test('animator loops, stops when not looping, keeps fps on new sheet', () => {
  const a = new Animator({ fps: 10, loop: true });
  a.setFrameCount(4);
  for (let t = 0; t <= 450; t += 50) a.update(t);
  assert.ok(a.frame >= 0 && a.frame < 4 && a.playing);
  a.setFps(30);
  a.setLoop(false);
  a.setFrameCount(3);
  assert.equal(a.fps, 30);
  for (let t = 1000; t <= 2000; t += 50) a.update(t);
  assert.equal(a.frame, 2);
  assert.equal(a.playing, false);
  a.play();
  assert.equal(a.frame, 0);
});

import { keyOutSolidBackground } from '../src/core/backgroundKey.js';

test('white background is keyed out but interior white is kept', () => {
  const w = 12, h = 12;
  const px = new Uint8ClampedArray(w * h * 4).fill(255); // opaque white
  const paint = (x, y, r, g, b) => px.set([r, g, b, 255], (y * w + x) * 4);
  for (let y = 3; y < 9; y++) for (let x = 3; x < 9; x++) paint(x, y, 200, 20, 60);
  paint(5, 5, 255, 255, 255); // enclosed highlight
  assert.equal(keyOutSolidBackground(px, w, h), true);
  assert.equal(px[3], 0); // corner now transparent
  assert.equal(px[(5 * w + 5) * 4 + 3], 255); // highlight survives
});
test('transparent images are left alone', () => {
  assert.equal(keyOutSolidBackground(new Uint8ClampedArray(4 * 4 * 4), 4, 4), false);
});

import { richify } from '../src/core/richify.js';

test('richify: native cell, feet on contact row, binary alpha, limited palette, outline', () => {
  // 100x200 figure with a smooth gradient torso, on transparent
  const W = 120, H = 220;
  const frames = [0, 1].map((f) => {
    const data = new Uint8ClampedArray(W * H * 4);
    for (let y = 10; y < 210; y++)
      for (let x = 30 + f * 4; x < 90 + f * 4; x++) {
        const i = (y * W + x) * 4;
        data.set([x * 2 % 256, y, 120 + (x % 40), 255], i);
      }
    return { width: W, height: H, data };
  });
  const out = richify(frames, { colors: 12 });
  assert.equal(out.width, 80);
  assert.equal(out.height, 96);
  const d = out.frames[0].data;
  const colors = new Set();
  let lastOpaqueRow = -1, bodyTop = 999;
  for (let y = 0; y < 96; y++)
    for (let x = 0; x < 80; x++) {
      const a = d[(y * 80 + x) * 4 + 3];
      assert.ok(a === 0 || a === 255);
      if (a === 255) {
        colors.add(d[(y * 80 + x) * 4] + ',' + d[(y * 80 + x) * 4 + 1] + ',' + d[(y * 80 + x) * 4 + 2]);
        lastOpaqueRow = Math.max(lastOpaqueRow, y);
        bodyTop = Math.min(bodyTop, y);
      }
    }
  assert.ok(colors.size <= 13, `palette ${colors.size}`);
  assert.equal(lastOpaqueRow, 87); // outline sits on the row above the y88 contact edge
  assert.ok(lastOpaqueRow - bodyTop + 1 >= 54 && lastOpaqueRow - bodyTop + 1 <= 57);
});
