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
  const listeners = {};
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
    addEventListener(name, fn) { (listeners[name] = listeners[name] || []).push(fn); },
    removeEventListener() {},
    localStorage: { getItem: () => null, setItem() {} },
    performance: { now: () => 0 },
  };
  window.window = window;
  return window;
}

export async function test(root) {
  const window = makeWindow();
  const context = vm.createContext(window);
  loadFile(context, 'js/engine/pixel.js');
  // RAMinigames stub is not needed for logic-only assertions, but touge.js checks
  // for window.RAMinigames before mounting UI, so provide a minimal stub too.
  context.window.RAMinigames = { register(id, def) { context.window.__registered = { id, def }; } };
  loadFile(context, 'js/minigames/touge.js');

  const logic = context.window.RAMinigameLogic && context.window.RAMinigameLogic.touge;
  assert.ok(logic, 'RAMinigameLogic.touge missing');
  const { cars, computeHandling, scoreSlideFrame, clipBonus, nextChain, buildCourse, step } = logic;

  // --- cars table ---
  assert.ok(cars.s15 && cars.supra && cars.r34_awd && cars.r34_rwd, 'expected car ids present');
  assert.equal(cars.r34_awd.driftEase, 1, 'r34_awd should barely drift by default');

  // --- computeHandling ---
  const s15Base = computeHandling('s15', {});
  const s15Tuned = computeHandling('s15', { tires: true, lsd: true, anglekit: true });
  assert.ok(s15Tuned.driftEase > s15Base.driftEase, 'parts should raise driftEase');
  assert.equal(s15Tuned.maxAngle, 75, 'angle kit should raise maxAngle to 75');
  const r34Converted = computeHandling('r34_awd', { rwd: true });
  assert.ok(r34Converted.driftEase > computeHandling('r34_awd', {}).driftEase, 'rwd conversion should raise driftEase');

  // --- scoring ---
  assert.equal(scoreSlideFrame(10, 100, 1, 60), 0, 'below 15deg threshold scores 0');
  assert.ok(scoreSlideFrame(45, 100, 1, 60) > 0, 'above threshold scores positive');
  assert.equal(clipBonus(2), 1000);
  assert.equal(nextChain(3.8), 4, 'chain caps at 4');
  assert.equal(nextChain(1), 1.5);

  // --- buildCourse ---
  const course = buildCourse('angeles_crest', 'seed-1');
  assert.ok(course.length > 500, 'course should have meaningful length');
  assert.ok(Array.isArray(course.clips) && course.clips.length > 0, 'course should have clip markers');
  assert.equal(typeof course.xAt, 'function');
  const course2 = buildCourse('angeles_crest', 'seed-1');
  assert.equal(course.length, course2.length, 'seeded course should be deterministic');

  // --- physics: spin-out when angle exceeds max, no countersteer ---
  {
    const handling = computeHandling('s15', {});
    let state = { heading: 0, slideAngle: 0, speed: 90, x: 0, distance: 0, sliding: false, spinning: false };
    let sawSpin = false;
    for (let i = 0; i < 90; i++) {
      state = step(state, { steer: 0, throttle: 1, ebrake: true }, 1 / 30, handling);
      if (state.spinning) { sawSpin = true; break; }
    }
    assert.ok(sawSpin, 'flooring throttle with no countersteer should eventually spin out the s15');
  }

  // --- physics: AWD r34 barely slides under the same abuse ---
  {
    const handling = computeHandling('r34_awd', {});
    let state = { heading: 0, slideAngle: 0, speed: 90, x: 0, distance: 0, sliding: false, spinning: false };
    for (let i = 0; i < 90; i++) {
      state = step(state, { steer: 0, throttle: 1, ebrake: true }, 1 / 30, handling);
    }
    assert.ok(Math.abs(state.slideAngle) < 15, `AWD r34 should barely slide, got ${state.slideAngle}`);
    assert.ok(!state.spinning, 'AWD r34 should not spin out under the same input');
  }

  // --- physics: countersteer + moderate throttle holds a controllable slide ---
  {
    const handling = computeHandling('s15', {});
    let state = { heading: 0, slideAngle: 0, speed: 90, x: 0, distance: 0, sliding: false, spinning: false };
    for (let i = 0; i < 10; i++) state = step(state, { steer: 0, throttle: 1, ebrake: true }, 1 / 30, handling);
    const dir = Math.sign(state.slideAngle) || 1;
    for (let i = 0; i < 60; i++) {
      state = step(state, { steer: -dir * 0.4, throttle: 0.4, ebrake: false }, 1 / 30, handling);
    }
    assert.ok(!state.spinning, 'countersteering should prevent spin-out');
    assert.ok(Math.abs(state.slideAngle) > 8 && Math.abs(state.slideAngle) < handling.maxAngle,
      `countersteer should hold a controllable slide, got ${state.slideAngle}`);
  }

  console.log('PASS touge (cars, computeHandling, scoring, buildCourse, step: spin-out / AWD grip / countersteer hold)');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  test().catch(err => { console.error(err); process.exit(1); });
}
