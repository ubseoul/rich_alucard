// Pure logic test for BARS. Run: node tools/minigames/bars-test.mjs
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..', '..');

export async function test() {
  const window = {};
  const document = {
    createElement: () => ({ style: {}, addEventListener() {}, append() {}, remove() {} }),
    head: { appendChild() {} },
    body: { classList: { add() {}, remove() {} } },
    querySelector: () => null,
  };
  const sandbox = {
    window, document,
    performance: { now: () => Date.now() },
    requestAnimationFrame: () => 0,
    cancelAnimationFrame: () => {},
    console,
    localStorage: { getItem: () => null, setItem: () => {} },
  };
  window.window = window;
  window.document = document;
  vm.createContext(sandbox);

  for (const file of ['js/engine/pixel.js', 'js/engine/minigames.js', 'js/minigames/bars.js']) {
    const code = fs.readFileSync(path.join(root, file), 'utf8');
    vm.runInContext(code, sandbox, { filename: file });
  }

  const logic = window.RAMinigameLogic && window.RAMinigameLogic.bars;
  assert.ok(logic, 'RAMinigameLogic.bars must exist');
  assert.ok(window.RAMinigames.get('bars'), 'bars must be registered');

  // rhymes()
  assert.strictEqual(logic.rhymes('DUCK', 'TRUCK', { combo: 0 }), true, 'DUCK/TRUCK should rhyme');
  assert.strictEqual(logic.rhymes('DUCK', 'DUCK', { combo: 0 }), false, 'identical word is never a valid rhyme');
  assert.strictEqual(logic.rhymes('GOOD', 'FOOD', { combo: 0 }), false, 'GOOD/FOOD is a false friend, never correct');
  assert.strictEqual(logic.isFalseFriend('GOOD', 'FOOD'), true);
  assert.strictEqual(logic.isFalseFriend('DUCK', 'TRUCK'), false);

  // CURVEBALL: slant rhyme only counts at combo >= 10
  assert.strictEqual(logic.rhymes('DUCK', 'CUP', { combo: 0 }), false, 'slant rhyme wrong below combo 10');
  assert.strictEqual(logic.rhymes('DUCK', 'CUP', { combo: 12 }), true, 'slant rhyme correct at combo >= 10');

  // speedFor
  assert.strictEqual(logic.speedFor(0), 1);
  assert.ok(logic.speedFor(25) > logic.speedFor(5), 'speed should rise with combo');
  assert.ok(Math.abs(logic.speedFor(25) - 1.25) < 1e-9, '+5% per 5 combo');

  // buildChoices: deterministic-ish via seeded rng, always >=4 choices with >=1 correct
  let seed = 42;
  const rng = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  for (let i = 0; i < 25; i++) {
    const choices = logic.buildChoices('DUCK', rng, { combo: i, pool: 'default', seedWords: ['RATS', 'MAZDA'] });
    assert.strictEqual(choices.length, 4, 'buildChoices must return exactly 4 choices');
    assert.ok(choices.some(c => c.correct), 'buildChoices must include >=1 correct choice');
    const words = new Set(choices.map(c => c.word));
    assert.strictEqual(words.size, choices.length, 'choices must be unique words');
  }

  // scoreTap: correct increments combo/score, wrong resets combo
  const state = { combo: 0, score: 0, chainWord: 'DUCK' };
  const r1 = logic.scoreTap(state, 'TRUCK', 1000);
  assert.strictEqual(r1.correct, true);
  assert.strictEqual(state.combo, 1);
  assert.strictEqual(r1.points, 100);
  assert.strictEqual(state.chainWord, 'TRUCK');

  const r2 = logic.scoreTap(state, 'LUCK', 1100);
  assert.strictEqual(r2.correct, true);
  assert.strictEqual(state.combo, 2);
  assert.strictEqual(r2.points, 200, '+100 x combo');

  const before = state.score;
  const r3 = logic.scoreTap(state, 'BANANA', 1200);
  assert.strictEqual(r3.correct, false);
  assert.strictEqual(state.combo, 0, 'wrong tap resets combo');
  assert.strictEqual(state.score, before, 'wrong tap adds no score');

  // punchline: flat +1000 regardless of chain word
  const state2 = { combo: 3, score: 0, chainWord: 'DUCK' };
  const rp = logic.scoreTap(state2, 'JOLLOF', 1300);
  assert.strictEqual(rp.correct, true);
  assert.strictEqual(rp.points, 1000);
  assert.strictEqual(rp.punchline, true);

  // multi opt doubles points
  const state3 = { combo: 4, score: 0, chainWord: 'DUCK' };
  const rm = logic.scoreTap(state3, 'TRUCK', 1400, { multi: true });
  assert.strictEqual(state3.combo, 5, 'combo increments on correct tap');
  assert.strictEqual(rm.points, 1000, '100 * combo(5) after increment, x2 multi = 1000');
  assert.strictEqual(rm.multi, true);

  console.log('PASS bars (rhymes, isFalseFriend, buildChoices, scoreTap, speedFor)');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  test().catch(e => { console.error('FAIL bars', e); process.exit(1); });
}
