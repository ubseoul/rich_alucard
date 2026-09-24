import vm from 'node:vm';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..', '..');

function loadFile(context, rel) {
  const code = fs.readFileSync(path.join(root, rel), 'utf8');
  vm.runInContext(code, context, { filename: rel });
}

function makeWindow() {
  const stubEl = () => ({
    style: {},
    classList: { add() {}, remove() {} },
    append() {},
    appendChild() {},
    remove() {},
    setAttribute() {},
    addEventListener() {},
    removeEventListener() {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 270, height: 480 }),
  });
  const document = {
    createElement: () => ({
      ...stubEl(),
      getContext: () => ({
        fillRect() {}, save() {}, restore() {}, translate() {}, rotate() {}, scale() {},
        beginPath() {}, arc() {}, fill() {}, fillText() {}, measureText: () => ({ width: 0 }),
        moveTo() {}, lineTo() {}, clip() {}, rect() {}, setLineDash() {},
        set fillStyle(v) {}, set font(v) {}, set globalAlpha(v) {}, set textAlign(v) {}, set textBaseline(v) {},
      }),
      width: 0, height: 0,
    }),
    querySelector: () => null,
    body: { classList: { add() {}, remove() {} } },
  };
  const window = {
    document,
    requestAnimationFrame: () => 0,
    cancelAnimationFrame() {},
    addEventListener() {},
    removeEventListener() {},
    localStorage: { getItem: () => null, setItem() {} },
    performance: { now: () => 0 },
  };
  window.window = window;
  return window;
}

export async function test(root2) {
  const window = makeWindow();
  const context = vm.createContext(window);
  loadFile(context, 'js/engine/pixel.js');
  context.window.RAMinigames = { register(id, def) { context.window.__registered = { id, def }; } };
  // touge.js is loaded first so garage.js can exercise the "reuse window.RAMinigameLogic.touge" path.
  loadFile(context, 'js/minigames/touge.js');
  loadFile(context, 'js/minigames/garage.js');

  const logic = context.window.RAMinigameLogic && context.window.RAMinigameLogic.garage;
  assert.ok(logic, 'RAMinigameLogic.garage missing');
  const { parts, feelOf, pinkyRating, canBuy } = logic;

  assert.ok(Array.isArray(parts) && parts.length >= 8, 'expected a parts table');
  const ids = parts.map(p => p.id);
  for (const expected of ['tires', 'coilovers', 'lsd', 'anglekit', 'hydro', 'turbo', 'weight', 'bucket']) {
    assert.ok(ids.includes(expected), `parts table missing ${expected}`);
  }

  // --- canBuy ---
  assert.equal(canBuy('tires', 's15', {}, 500), false, 'not enough money');
  assert.equal(canBuy('tires', 's15', {}, 5000), true, 'enough money, not owned');
  assert.equal(canBuy('tires', 's15', { tires: true }, 5000), false, 'already owned');
  assert.equal(canBuy('bodykit', 's15', {}, 99999), true, 'bodykit allowed on s15');
  assert.equal(canBuy('bodykit', 'supra', {}, 99999), false, 'bodykit is s15-only');
  assert.equal(canBuy('rwd', 'r34_awd', {}, 99999), true, 'rwd conversion allowed on r34_awd');
  assert.equal(canBuy('rwd', 'r34_rwd', {}, 99999), false, 'rwd conversion not applicable to r34_rwd');
  assert.equal(canBuy('turbo', 's15', { turbo: 3 }, 99999), false, 'turbo maxed out at 3 levels');

  // --- feelOf: buying tires+lsd should make a car feel more "slidey" ---
  const before = feelOf('s15', {});
  const after = feelOf('s15', { tires: true, lsd: true });
  assert.ok(after.slidey > before.slidey, 'tires+lsd should raise slidey feel');
  assert.ok(before.slidey >= 0 && before.slidey <= 1 && after.slidey >= 0 && after.slidey <= 1, 'feel values normalized 0..1');
  assert.ok(before.snappy >= 0 && before.snappy <= 1, 'snappy normalized 0..1');

  // --- pinkyRating ---
  assert.equal(pinkyRating({ tires: true }), null, 'fewer than 4 parts: no rating yet');
  assert.equal(
    pinkyRating({ tires: true, lsd: true, anglekit: true, coilovers: true }),
    "that's a real drift car now.",
    'core drift parts should earn the real-drift-car rating'
  );
  assert.equal(
    pinkyRating({ livery: true, hydro: true, bucket: true, weight: true }),
    'you built a meme.',
    'non-core parts should earn the meme rating'
  );

  console.log('PASS garage (parts table, canBuy, feelOf, pinkyRating)');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  test().catch(err => { console.error(err); process.exit(1); });
}
