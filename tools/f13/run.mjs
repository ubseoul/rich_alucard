// F13 HOLISTIC BALANCE HARNESS — run driver (INFRASTRUCTURE ONLY).
// Advances whole days through the REAL life clock (RAClock.sleep is the only day advance) and drives the accepted
// route surfaces through the REAL engine calls (tools/pilot/headless.mjs drive/driveChain). One policy, one seed,
// deterministic. No gameplay number is written by this file.
import { root, loadGame, pilotModule } from './game.mjs';
import { Rng } from './rng.mjs';
import { buildCatalog, executeAction } from './catalog.mjs';
import { getPolicy } from './policies.mjs';
import { createMetrics } from './metrics.mjs';
import { runInvariants } from './invariants.mjs';
import { buildAdapters, STATUS } from './adapters.mjs';
import { fingerprintCtx, snapshot } from './serialize.mjs';

export const DEFAULTS = Object.freeze({
  seed: 1,
  policy: 'conservative',
  days: 60,
  // A normal bedroom night offers a handful of outings; 4 keeps a run comparable to tools/pilot/coverage-sim.mjs
  // while remaining fully configurable.
  maxActionsPerDay: 4,
  // 'post-prologue' skips the new-game prologue exactly as tools/pilot/coverage-sim.mjs does; 'fresh' plays from
  // day 1 with no flags set.
  start: 'post-prologue',
  // Declared PLAYER-BLIND / released legacy flows (tools/pilot/headless.mjs SEEDS), applied at run start.
  seedFlows: [],
  // Synthetic minigame rewards are OFF: the economy only sees rewards the accepted code grants.
  syntheticRewards: false,
  // DEV fragment flag overrides (session-only). Unregistered ids are ignored.
  fragmentFlags: {},
  if1: true,
  startSave: null,
  // Restore the policy RNG stream position (from a previous run) so a split run continues exactly.
  rngState: null,
  captureState: false
});

export async function simulate(config = {}) {
  const options = { ...DEFAULTS, ...config };
  const ctx = await loadGame({ seedState: options.startSave, if1: options.if1, fragmentFlags: options.fragmentFlags });
  const policy = getPolicy(options.policy);
  const seedLabel = String(options.seed);
  const rng = options.rngState ? Rng.from(options.rngState) : new Rng(`${seedLabel}:${policy.id}`);
  const pilot = await pilotModule();
  const adapters = buildAdapters(root, ctx);
  const initialMoney = ctx.RALife.money();

  const metrics = createMetrics({ seed: seedLabel, policy: policy.id, requestedDays: options.days });
  let currentDay = ctx.RALife.today().day;
  const seen = {
    surface: action => metrics.seeAction(action, currentDay),
    adventure: (id, kind) => metrics.seeAdventure(id, kind, currentDay)
  };

  // Start the life through the accepted clock. On a resume the save already had its wake, so we do not replay it.
  const fresh = !options.startSave;
  if (fresh) ctx.RAClock.wake({ first: true });
  if (fresh && options.start === 'post-prologue') {
    ctx.RALife.setFlag('prologueDone', true);
    ctx.RALife.setFlag('throneDone', true);
    ctx.RALife.setFlag('firstWakeDone', true);
  }
  if (fresh) for (const name of options.seedFlows || []) {
    try { pilot.seed(ctx, name); } catch (error) { metrics.recordAction({ day: currentDay, action: { id: `seed:${name}`, kind: 'seed', target: name }, result: { ok: false, changed: false, error: String(error?.message || error) } }); }
  }
  const startDay = ctx.RALife.today().day;

  const executedActions = [];
  let maxActionsObserved = 0;
  const daysSimulated = [];

  for (let n = 1; n <= options.days; n++) {
    // A resumed save has already played its current day; the next simulated day begins after the next sleep.
    if (!fresh || n > 1) ctx.RAClock.sleep();
    currentDay = ctx.RALife.today().day;
    daysSimulated.push(currentDay);
    const tried = new Set();
    let count = 0;
    let nightEnded = false;

    while (count < options.maxActionsPerDay && !nightEnded) {
      const catalog = buildCatalog(ctx, { offers: pilot.offers, day: currentDay, seen });
      const legal = catalog.filter(a => a.executable && !tried.has(a.id));
      if (!legal.length) break;
      const chosen = policy.chooseAction(ctx, legal, {
        rng, day: currentDay, ctx, tried, actionCount: count, syntheticRewards: options.syntheticRewards
      });
      if (!chosen) break;
      tried.add(chosen.id);
      const result = executeAction(ctx, chosen, { policy, rng, pilot, syntheticRewards: options.syntheticRewards, day: currentDay });
      executedActions.push({ id: chosen.id, day: currentDay, kind: chosen.kind, target: chosen.target, legalAtSelection: true });
      metrics.recordAction({ day: currentDay, action: chosen, result });
      if (result.nightEnded) nightEnded = true;
      count += 1;
    }
    maxActionsObserved = Math.max(maxActionsObserved, count);
    metrics.sample(ctx, currentDay);
  }

  const metricsOut = metrics.finish(ctx, { adapters });
  const integratedFragments = Object.values(adapters.fragments).filter(f => f.status === STATUS.AVAILABLE).map(f => f.id);
  const fragmentFlagsOn = (ctx.RAFeatures?.list?.() || []).filter(f => f.fragment !== 'if1' && f.enabled).map(f => f.id);
  const runState = {
    metrics: metricsOut,
    executedActions,
    maxActionsObserved,
    maxActionsPerDay: options.maxActionsPerDay,
    initialMoney,
    integratedFragments,
    allFragmentsOff: fragmentFlagsOn.length === 0
  };
  const invariants = runInvariants(ctx, runState);

  const result = {
    schema: 'f13.run/1',
    seed: seedLabel,
    policy: policy.id,
    policyLabel: policy.label,
    requestedDays: options.days,
    startDay,
    endDay: ctx.RALife.today().day,
    days: daysSimulated.length,
    fingerprint: fingerprintCtx(ctx),
    rngState: rng.state(),
    metrics: metricsOut,
    invariants,
    adapters,
    trace: executedActions.map(a => `${a.day}:${a.id}`),
    finalSave: options.captureState ? snapshot(ctx) : undefined
  };
  return result;
}

// Run a matrix of seeds × policies. Each run is independent (fresh context).
export async function simulateBatch({ seeds = [1], policies = ['conservative'], ...rest } = {}) {
  const runs = [];
  for (const seed of seeds) for (const policy of policies) runs.push(await simulate({ ...rest, seed, policy }));
  return runs;
}
