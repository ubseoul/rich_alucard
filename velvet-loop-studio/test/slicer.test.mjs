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
