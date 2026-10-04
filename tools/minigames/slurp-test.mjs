// Pure logic test for SLURP. Run: node tools/minigames/slurp-test.mjs
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

  for (const file of ['js/engine/pixel.js', 'js/engine/minigames.js', 'js/minigames/slurp.js']) {
    const code = fs.readFileSync(path.join(root, file), 'utf8');
    vm.runInContext(code, sandbox, { filename: file });
  }

  const logic = window.RAMinigameLogic && window.RAMinigameLogic.slurp;
  assert.ok(logic, 'RAMinigameLogic.slurp must exist');
  assert.ok(window.RAMinigames.get('slurp'), 'slurp must be registered');

  let seed = 7;
  const rng = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };

  // makeOrder shape
  for (let i = 0; i < 20; i++) {
    const order = logic.makeOrder(rng, { jollofRamen: false });
    assert.ok(logic.BROTHS.includes(order.broth), 'broth must be one of BROTHS');
    assert.ok(logic.NOODLES.includes(order.noodles), 'noodles must be one of NOODLES');
    assert.ok(order.toppings.length >= 1 && order.toppings.length <= 3, 'toppings 1-3');
    assert.ok(!order.toppings.includes('JOLLOF'), 'no jollof topping unless unlocked');
  }
  // RC2 B3: orders are broth → noodles → meat → topping, and the order card shows exactly that
  for (let i = 0; i < 30; i++) {
    const o = logic.makeOrder(rng, { jollofRamen: true });
    if (o.kevin) continue;
    assert.ok(logic.MEATS.includes(o.meat), 'meat is a MEAT');
    assert.ok(logic.TOPS.includes(o.topping) || o.topping === 'JOLLOF', 'topping is a TOPPING (or JOLLOF)');
    assert.deepStrictEqual([...o.toppings], [o.meat, o.topping], 'toppings = [meat, topping] so checkBowl stays compatible');
  }
  assert.ok(window.RAMinigames.get('slurp').rule.split(/[.!?]/).filter(Boolean).length === 1, 'slurp has a one-sentence rule');
  let sawJollof = false;
  for (let i = 0; i < 60 && !sawJollof; i++) {
    const order = logic.makeOrder(rng, { jollofRamen: true });
    if (order.toppings.includes('JOLLOF')) sawJollof = true;
  }
  assert.ok(sawJollof, 'JOLLOF topping should appear once unlocked (jollofRamen:true)');

  // kevin batch order
  let sawKevin = false;
  for (let i = 0; i < 5; i++) {
    const order = logic.makeOrder(rng, { kevin: true });
    if (order.kevin) { sawKevin = true; assert.strictEqual(order.batch, 40); }
  }
  assert.ok(sawKevin, 'kevin:true should produce a batch order');

  // checkBowl
  const order = { broth: 'MISO', noodles: 'THICK', toppings: ['EGG', 'NORI'] };
  assert.deepStrictEqual(logic.checkBowl(order, { broth: 'MISO', noodles: 'THICK', toppings: ['NORI', 'EGG'] }).perfect, true, 'topping order should not matter');
  assert.strictEqual(logic.checkBowl(order, { broth: 'SHOYU', noodles: 'THICK', toppings: ['EGG', 'NORI'] }).perfect, false, 'wrong broth fails');
  assert.strictEqual(logic.checkBowl(order, { broth: 'MISO', noodles: 'THICK', toppings: ['EGG'] }).perfect, false, 'missing topping fails');
  const wrongRes = logic.checkBowl(order, { broth: 'SHOYU', noodles: 'THIN', toppings: [] });
  assert.strictEqual(wrongRes.wrong, true);

  // tipFor: faster = bigger tip, clamped to [2,10]
  assert.ok(logic.tipFor(2) >= logic.tipFor(10), 'faster orders should tip more');
  assert.ok(logic.tipFor(0) <= 10 && logic.tipFor(0) >= 2);
  assert.ok(logic.tipFor(100) <= 10 && logic.tipFor(100) >= 2, 'tip stays clamped for very slow orders');

  // orderInterval: speeds up toward rush (6000ms -> 3000ms)
  assert.strictEqual(logic.orderInterval(0), 6000);
  assert.ok(logic.orderInterval(90000) <= 3000 + 1, 'interval shrinks to ~3000ms at rush');
  assert.ok(logic.orderInterval(45000) < logic.orderInterval(0), 'interval should shrink over time');

  assert.deepStrictEqual(JSON.parse(JSON.stringify(logic.chairProgress(0,60))),{stacked:0,total:60,remaining:60,success:false});
  assert.deepStrictEqual(JSON.parse(JSON.stringify(logic.chairProgress(60,60))),{stacked:60,total:60,remaining:0,success:true});
  assert.strictEqual(logic.chairProgress(90,60).stacked,60,'chair progress caps at the authored total');

  console.log('PASS slurp (makeOrder, checkBowl, tipFor, orderInterval, canopy chair harness)');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  test().catch(e => { console.error('FAIL slurp', e); process.exit(1); });
}
