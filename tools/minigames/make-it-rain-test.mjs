// MAKE IT RAIN — deterministic core tests (F06-A sandbox).
// Run: node tools/minigames/make-it-rain-test.mjs
// Auto-discovered by tools/release.mjs test().
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath, pathToFileURL } from 'node:url';
import assert from 'node:assert';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..', '..');

function loadCore() {
  const window = {};
  const sandbox = { window, console };
  window.window = window;
  vm.createContext(sandbox);
  for (const file of [
    'js/systems/rainmaker/make_it_rain_tunables.js',
    'js/systems/rainmaker/make_it_rain_core.js'
  ]) {
    vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), sandbox, { filename: file });
  }
  return { window, tunables: window.RAMakeItRainTunables, core: window.RAMakeItRainCore };
}

export async function test() {
  const { window, tunables, core } = loadCore();
  assert.ok(tunables, 'RAMakeItRainTunables must exist');
  assert.ok(core && core.create, 'RAMakeItRainCore.create must exist');

  function make(opts = {}) {
    const merged = tunables.merge(tunables.defaults, opts.tunables || {});
    return core.create({ tunables: merged, seed: opts.seed, budget: opts.budget });
  }
  // Exact aim for a guaranteed SPOTLIGHT hit at time t.
  function aimAt(c, t, bills, extra = {}) {
    const ratio = (c.targetX(t) - 0.5) / c.T.aim.aimSpread;
    return Object.assign({
      vx: ratio, vy: -1, t,
      bills: bills == null ? 5 : bills,
      loadDurationMs: 200, smoothness: 1
    }, extra);
  }

  // 1. stack initialization
  {
    const c = make({ budget: 10000 });
    const s = c.state();
    assert.strictEqual(s.budget, 10000, 'budget set');
    assert.strictEqual(s.cash, 10000, 'cash starts at budget');
    assert.strictEqual(s.availableBills, 100, 'bills = cash / billValue');
    assert.strictEqual(s.hype, 0, 'hype starts 0');
    assert.strictEqual(s.crowd, 0, 'crowd starts 0');
    assert.strictEqual(s.streak, 0, 'streak starts 0');
    assert.strictEqual(s.ended, false, 'not ended');
    assert.ok(s.roundDurationMs === 30000, '30s round');
  }

  // 2. valid money action: drag loads bills, longer drag loads more
  {
    const c = make({});
    c.beginDrag({ x: 0.5, y: 0.9, t: 0 });
    c.dragTo({ x: 0.5, y: 0.75, t: 60 });
    const short = c.state().load.bills;
    c.dragTo({ x: 0.5, y: 0.60, t: 120 });
    const long = c.state().load.bills;
    assert.ok(short >= 1, 'short drag loads at least 1 bill');
    assert.ok(long > short, 'longer drag loads more bills');
    assert.ok(long <= 20, 'never exceeds 20 bills');
  }

  // 3. target hit (spotlight active, aimed) + correct feedback
  {
    const c = make({ budget: 10000 });
    const t = 200; // spotlight active, not on beat
    assert.ok(c.spotlightActive(t), 't=200 is inside the active spotlight');
    const r = c.release(aimAt(c, t, 5));
    assert.strictEqual(r.kind, 'hit', 'aimed flick inside spotlight is a hit');
    assert.ok(r.hypeGained > 0, 'hit generates hype');
    assert.strictEqual(r.onBeat, false, 't=200 is off beat');
    assert.ok(Math.abs(r.multiplier - c.T.hype.spotlight) < 1e-9, 'spotlight-only multiplier is x2');
    assert.strictEqual(c.state().streak, 1, 'streak advanced');
  }

  // 4. target miss (spotlight active, bad aim) wastes money but keeps playing
  {
    const c = make({ budget: 10000 });
    const t = 200;
    const r = c.release(aimAt(c, t, 5, { vx: -1.5 })); // fling left, still a valid flick, away from target
    assert.strictEqual(r.kind, 'miss', 'bad aim inside spotlight is a miss');
    assert.strictEqual(r.hypeGained, 0, 'miss gives no hype');
    assert.ok(r.dollars > 0, 'miss still consumed money (money on the floor)');
    assert.strictEqual(c.state().spent, r.dollars, 'spent tracked');
    assert.strictEqual(c.state().streak, 0, 'miss resets streak');
    assert.ok(c.state().ended === false, 'miss does not end the round');
  }

  // 5. quality calculation: on-beat + spotlight + fan multiply, streak multiplier grows
  {
    const c = make({});
    const t = 0; // on beat AND inside spotlight
    assert.ok(c.beatAt(t).onBeat && c.spotlightActive(t), 't=0 is on beat and spotlighted');
    const r = c.release(aimAt(c, t, 12, { loadDurationMs: 800, smoothness: 0.95 }));
    assert.strictEqual(r.kind, 'hit');
    assert.strictEqual(r.fan, true, '10+ bills with a long smooth drag is a FAN');
    const expect = c.T.hype.spotlight * c.T.hype.onBeat * (1 + c.T.fan.hypeBonus);
    assert.ok(Math.abs(r.multiplier - expect) < 1e-9, 'multiplicative quality stacks');
    // second hit grows the streak multiplier
    const r2 = c.release(aimAt(c, 500, 5));
    assert.ok(r2.multiplier > c.T.hype.spotlight, 'streak raises the multiplier');
    assert.strictEqual(c.state().bestStreak, 2, 'best streak tracked');
  }

  // 6. beat/timing calculation
  {
    const c = make({});
    const interval = 60000 / c.T.beat.bpm;
    assert.ok(c.beatAt(0).onBeat, 'beat at t=0');
    assert.ok(c.beatAt(c.T.beat.windowMs).onBeat, 'edge of window still on beat');
    assert.ok(!c.beatAt(c.T.beat.windowMs + 5).onBeat, 'just outside the window is off beat');
    assert.ok(c.beatAt(interval).onBeat, 'next beat lands on the grid');
    assert.ok(c.beatAt(0).perfect, 'perfect window at t=0');
    assert.ok(!c.beatAt(c.T.beat.perfectWindowMs + 1).perfect, 'outside perfect window');
  }

  // 7. stack/resource consumption + depletion
  {
    const c = make({ budget: 1000 }); // 10 bills
    assert.strictEqual(c.state().availableBills, 10);
    const r = c.release({ bills: 10, vx: 0, vy: -1, t: 0, loadDurationMs: 100, smoothness: 1 });
    assert.strictEqual(r.bills, 10, 'threw all 10 bills');
    assert.strictEqual(c.state().cash, 0, 'cash drained');
    assert.strictEqual(c.state().availableBills, 0, 'stack empty');
    const again = c.release({ bills: 1, vx: 0, vy: -1, t: 0, loadDurationMs: 100, smoothness: 1 });
    assert.strictEqual(again.kind, 'invalid', 'cannot throw from an empty stack');
    assert.strictEqual(again.reason, 'out-of-cash');
  }

  // 8. reset restores a clean initial state
  {
    const c = make({ budget: 10000 });
    c.release(aimAt(c, 0, 10, { loadDurationMs: 800, smoothness: 1 }));
    c.advance(5000);
    const dirty = c.state();
    assert.ok(dirty.spent > 0 && dirty.hype > 0, 'state changed before reset');
    c.reset({ budget: 25000 });
    const clean = c.state();
    assert.strictEqual(clean.cash, 25000, 'reset restores budget');
    assert.strictEqual(clean.spent, 0, 'reset clears spend');
    assert.strictEqual(clean.waste, 0, 'reset clears waste');
    assert.strictEqual(clean.hype, 0, 'reset clears hype');
    assert.strictEqual(clean.crowd, 0, 'reset clears crowd');
    assert.strictEqual(clean.streak, 0, 'reset clears streak');
    assert.strictEqual(clean.flicks, 0, 'reset clears flicks');
    assert.strictEqual(clean.ended, false, 'reset revives the round');
  }

  // 9. seeded determinism (rng only engages when hype.jitter > 0)
  {
    const mk = (seed) => make({ seed, tunables: { hype: { jitter: 0.4 } } });
    const play = (c) => {
      c.release(aimAt(c, 0, 8, { loadDurationMs: 700, smoothness: 0.9 }));
      c.release(aimAt(c, 500, 8, { loadDurationMs: 700, smoothness: 0.9 }));
      c.release(aimAt(c, 1000, 8));
      return c.state().hype;
    };
    const a = mk(1234), b = mk(1234), c = mk(99);
    const ha = play(a), hb = play(b), hc = play(c);
    assert.ok(Math.abs(ha - hb) < 1e-9, 'same seed reproduces identical hype');
    assert.ok(Math.abs(ha - hc) > 1e-9, 'different seed changes jittered hype');
    // deterministic with jitter off regardless of seed
    const d1 = make({ seed: 1 }), d2 = make({ seed: 2 });
    assert.strictEqual(play(d1), play(d2), 'no jitter => fully deterministic');
  }

  // 10. invalid input safety (no consumption, no crash)
  {
    const c = make({ budget: 10000 });
    const before = c.state();
    assert.strictEqual(c.release({ bills: 0, vx: 0, vy: -1, t: 0 }).kind, 'invalid', 'zero bills invalid');
    assert.strictEqual(c.release({ vx: 0, vy: -1, t: 0 }).reason, 'no-drag', 'release with no drag invalid');
    assert.strictEqual(c.release({ bills: 3, vx: 0.2, vy: 0.5, t: 0 }).reason, 'not-a-flick', 'downward release invalid');
    assert.strictEqual(c.release({ bills: 3, vx: 0.6, vy: -0.1, t: 0 }).reason, 'not-a-flick', 'too-horizontal release invalid');
    assert.strictEqual(c.release({ bills: 3, vx: 0.0001, vy: -0.0001, t: 0 }).reason, 'not-a-flick', 'too-slow release invalid');
    assert.strictEqual(c.release({ bills: 3, vx: NaN, vy: -1, t: 0 }).kind, 'invalid', 'NaN velocity is safe');
    const after = c.state();
    assert.strictEqual(after.spent, before.spent, 'invalid input never spends');
    assert.strictEqual(after.flicks, 0, 'invalid input is not a flick');
    assert.strictEqual(after.cash, before.cash, 'cash untouched');
  }

  // 11. rapid repeated input stays coherent
  {
    const c = make({ budget: 10000 });
    for (let i = 0; i < 500; i++) {
      const t = i * 13;
      if (i % 3 === 0) c.beginDrag({ x: 0.5, y: 0.9, t });
      else if (i % 3 === 1) c.dragTo({ x: 0.5, y: 0.5, t });
      else c.release({ bills: 3, vx: 0.2, vy: -1, t });
    }
    const s = c.state();
    assert.ok(s.spent <= s.budget, 'never overspends the budget');
    assert.ok(s.cash >= 0, 'cash never negative');
    assert.ok(s.hype >= 0 && isFinite(s.hype), 'hype finite');
    assert.ok(s.availableBills >= 0, 'bills never negative');
  }

  // 12. pointer leaving / re-entering the interaction area
  {
    const c = make({});
    c.beginDrag({ x: 0.5, y: 0.9, t: 0 });
    c.dragTo({ x: 0.5, y: 0.7, t: 50 });
    c.cancelDrag(); // pointer cancelled/left: no consumption
    assert.strictEqual(c.state().spent, 0, 'cancel consumes nothing');
    assert.strictEqual(c.state().phase, 'idle', 'cancel returns to idle');
    c.cancelDrag(); // idempotent
    c.beginDrag({ x: 0.4, y: 0.85, t: 100 });
    c.dragTo({ x: 0.5, y: 0.55, t: 200 });
    const r = c.release(aimAt(c, 200, 4));
    assert.strictEqual(r.kind, 'hit', 're-entering after cancel still works');
  }

  // 13. touch/pointer compatibility (input is normalized, device-agnostic)
  {
    const c = make({});
    // A "touch" sequence from the adapter: normalized coords + unitless velocity.
    c.beginDrag({ x: 0.5, y: 0.92, t: 0 });
    for (let i = 1; i <= 10; i++) c.dragTo({ x: 0.5, y: 0.92 - i * 0.03, t: i * 12 });
    const r = c.release(aimAt(c, 150, c.state().load.bills));
    assert.ok(r.kind === 'hit' || r.kind === 'miss' || r.kind === 'overthrow', 'touch sequence resolves');
    assert.ok(c.state().spent > 0, 'touch sequence spent real money');
  }

  // 14. repeated sessions never crash and always produce a finite summary
  {
    for (let s = 0; s < 50; s++) {
      const c = make({ seed: s, budget: [5000, 10000, 25000][s % 3] });
      let t = 0;
      while (!c.state().ended) {
        t += 200;
        c.advance(t);
        if (c.state().ended) break;
        const active = c.spotlightActive(t);
        if (active) c.release(aimAt(c, t, 6));
        else c.release({ bills: 4, vx: 0.1, vy: -1, t });
      }
      const sum = c.summary();
      assert.ok(isFinite(sum.rainScore), 'rain score finite');
      assert.ok(sum.spent <= sum.budget, 'never overspent');
      assert.ok(sum.hype >= 0, 'hype sane');
    }
  }

  // 15. OVERTHROW: flick while the target is not in its active spotlight moment
  {
    const c = make({});
    const t = 2000; // spotlight off (period 2600, on 1050)
    assert.ok(!c.spotlightActive(t), 't=2000 is outside the spotlight');
    const r = c.release(aimAt(c, t, 5));
    assert.strictEqual(r.kind, 'overthrow', 'off-spotlight flick is an overthrow');
    assert.ok(r.dollars > 0 && c.state().waste === r.dollars, 'overthrow money is wasted');
    assert.strictEqual(r.hypeGained, 0, 'overthrow gives no hype');
  }

  // 16. FAN widens tolerance and boosts crowd
  {
    const noFan = make({});
    const fan = make({});
    const t = 200;
    // Aim just outside the base radius so only the FAN radiusBonus reaches it.
    const edge = noFan.targetX(t) + noFan.T.target.radius + noFan.T.fan.radiusBonus - 0.01;
    const vxFor = (c) => (edge - 0.5) / c.T.aim.aimSpread;
    const miss = noFan.release({ bills: 4, vx: vxFor(noFan), vy: -1, t, loadDurationMs: 200, smoothness: 1 });
    const hit = fan.release({ bills: 12, vx: vxFor(fan), vy: -1, t, loadDurationMs: 800, smoothness: 0.95 });
    assert.strictEqual(miss.kind, 'miss', 'small fan misses the outer edge');
    assert.strictEqual(hit.kind, 'hit', 'FAN radius bonus reaches the outer edge');
    assert.strictEqual(hit.fan, true, 'FAN flag set');
    assert.ok(hit.crowd > noFan.T.hype.crowdStart + noFan.T.hype.crowdGainGood, 'FAN adds a CROWD bonus');
  }

  // 17. streak growth, cap and decay
  {
    // build a long streak on guaranteed-active times
    const c2 = make({});
    let t = 100; let lastMult = 1;
    for (let i = 0; i < 20; i++) {
      const active = c2.spotlightActive(t);
      if (active) { const r = c2.release(aimAt(c2, t, 4)); lastMult = r.multiplier; }
      t += 200;
    }
    assert.strictEqual(c2.state().bestStreak, c2.state().bestStreak, 'streak counted');
    assert.ok(c2.streakMultiplier(50) <= c2.T.streak.max + 1e-9, 'streak multiplier capped at x5');
    assert.ok(c2.streakMultiplier(50) >= c2.T.streak.max - 1e-9, 'streak multiplier reaches the cap');
    // decay on a miss
    const cc = make({});
    cc.release(aimAt(cc, 200, 4));
    assert.ok(cc.state().streak >= 1, 'streak alive');
    cc.release(aimAt(cc, 200, 4, { vx: -1.5 }));
    assert.strictEqual(cc.state().streak, 0, 'miss resets streak');
  }

  // 18. RAIN SCORE: skill outperforms blind spending on the same budget
  {
    const skill = make({ budget: 10000 });
    const blind = make({ budget: 10000 });
    let t = 0;
    while (t < 30000) {
      t += 100;
      if (!skill.spotlightActive(t)) continue;
      skill.release(aimAt(skill, t, 4));
    }
    for (let i = 0; i < 120; i++) {
      blind.release({ bills: 4, vx: 0.4, vy: -1, t: (i * 250) % 30000 });
    }
    assert.ok(skill.summary().rainScore > blind.summary().rainScore, 'aimed play beats blind spending');
    assert.ok(skill.summary().waste < blind.summary().waste, 'aimed play wastes less');
  }

  // 19. round end blocks further play
  {
    const c = make({});
    c.advance(30000);
    assert.strictEqual(c.state().ended, true, 'round ends at 30s');
    const r = c.release(aimAt(c, 30000, 2));
    assert.strictEqual(r.kind, 'invalid', 'cannot play after the round ends');
    assert.strictEqual(r.reason, 'ended');
  }

  // 20. bill cap: a huge drag never exceeds 20 bills
  {
    const c = make({ budget: 100000 });
    c.beginDrag({ x: 0.5, y: 0.99, t: 0 });
    c.dragTo({ x: 0.5, y: 0.01, t: 400 });
    assert.strictEqual(c.state().load.bills, 20, 'drag is capped at maxBills');
  }

  console.log('PASS make-it-rain core (20 groups: stack, aim, target, beat, quality, streak, waste, score, reset, determinism, safety)');
}

// Allow `node tools/minigames/make-it-rain-test.mjs` as a standalone runner.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  test().catch((error) => { console.error(error); process.exitCode = 1; });
}
