// F13 harness — invariant checks are source-derived and their reporting is usable.
import assert from 'node:assert/strict';
import { loadGame, probeOnceOnly, rankBounds, runInvariants, trustBounds } from './_lib.mjs';

export async function test() {
  const ctx = await loadGame();
  ctx.RAClock.wake({ first: true });

  // Bounds come from accepted source/tunables — no invented caps.
  const rank = rankBounds(ctx);
  assert(rank.legal.includes(0), 'rank 0 (default) is legal');
  assert(rank.max >= 4, `source-derived max rank should include Rank 4 (got ${rank.max})`);
  assert(rank.min >= 0);
  const trust = trustBounds(ctx);
  assert(trust.min < 0 && trust.max > 0, `trust bounds must span the authored deltas (got ${trust.min}..${trust.max})`);
  assert.equal(trust.thresholds.HIGH_MIN, 3, 'thresholds read from RANewOgaTunables');

  // Reusable once-only idempotency probe against a real accepted completion.
  ctx.RAState.patch('life.world.day', 9);
  const probe = probeOnceOnly(ctx, {
    invoke: c => c.RANewOga.completeM1('STICK_UP'),
    select: c => { const life = c.RAState.get().life; return { money: life.resources.money, items: life.ownership.items, newOga: life.newOga }; }
  });
  assert(probe.firstChanged, 'the first M1 completion changes state');
  assert(probe.secondChanged === false && probe.stable, 'a second M1 completion must be a no-op (no duplicate payout)');

  // The invariant reporter flags fabricated corruption (duplicate payout, illegal action selection).
  const synthetic = {
    metrics: { duplicates: { onceOnly: [{ source: 'new_oga:m1', count: 2 }], historyIds: ['dup'] } },
    executedActions: [{ id: 'cheat', legalAtSelection: false }],
    maxActionsObserved: 99,
    maxActionsPerDay: 12,
    allFragmentsOff: true,
    integratedFragments: []
  };
  const result = runInvariants(ctx, synthetic);
  const ids = result.failures.map(f => f.id);
  assert(result.checked >= 10, 'a reusable invariant set is installed');
  for (const expected of ['no-duplicate-once-only-payout', 'history-ids-unique', 'unavailable-content-not-selected', 'no-infinite-action-loop']) {
    assert(ids.includes(expected), `invariant reporter missed ${expected}`);
  }

  console.log(`PASS f13 invariants (${result.checked} checks; source-derived rank ${JSON.stringify(rank.legal)}, trust [${trust.min}, ${trust.max}]; duplicate-payout and legality corruption are reported)`);
}
