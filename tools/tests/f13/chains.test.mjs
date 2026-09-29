// F13 post-audit repair — driveChain hard depth guard regression.
// Finite authored chains are unchanged; a cyclical or overlong synthetic chain terminates with an explicit failure
// sentinel instead of looping forever (never a silent success).
import assert from 'node:assert/strict';
import { loadGame, pilotModule } from './_lib.mjs';

export async function test() {
  const ctx = await loadGame();
  const { drive, driveChain, chained } = await pilotModule();
  const A = ctx.RAAdventures;
  const define = (id, chain) => A.define({ id, title: 'QA F13', memory: 'qa f13 link', repeatable: true, lane: 'life', start: 'end', nodes: { end: { end: { outcome: id, chain: chain || null } } } });

  // 1. A finite chain behaves exactly as before (one link followed, no failure).
  define('QA_F13_N1', 'QA_F13_N2');
  define('QA_F13_N2', null);
  const normal = driveChain(ctx, drive(ctx, 'QA_F13_N1', {}));
  assert.deepEqual(chained(normal), ['QA_F13_N2'], 'a normal one-link chain is unchanged');
  assert(!normal.some(r => r && r.chainError), 'a finite chain reports no failure');
  assert.equal(normal.length, 2);

  // 2. A cyclical chain terminates at the default cap with an explicit failure.
  define('QA_F13_C1', 'QA_F13_C2');
  define('QA_F13_C2', 'QA_F13_C1');
  const cycle = driveChain(ctx, drive(ctx, 'QA_F13_C1', {}));
  const failure = cycle.find(r => r && r.chainError);
  assert(failure, 'a cyclical chain must report a failure');
  assert.equal(failure.chainError, 'MAX_CHAIN_DEPTH');
  assert.match(failure.message, /chain depth exceeded 10/);
  assert.equal(cycle.length, 1 + 10 + 1, 'initial + 10 chained + one failure sentinel');
  assert.equal(chained(cycle).at(-1), failure.id, 'the failure sentinel is the last entry');

  // 3. The cap is deterministic and configurable; a smaller cap stops sooner, still with a failure.
  const one = driveChain(ctx, drive(ctx, 'QA_F13_C1', {}), { maxChains: 1 });
  assert.equal(one.length, 1 + 1 + 1, 'maxChains:1 follows one link then fails');
  assert.equal(one.find(r => r && r.chainError).maxChains, 1);

  // 4. Same input => same result (determinism).
  const again = driveChain(ctx, drive(ctx, 'QA_F13_C1', {}));
  assert.deepEqual(again.map(r => r && { id: r.id, chainError: r.chainError || null }), cycle.map(r => r && { id: r.id, chainError: r.chainError || null }));

  A.abandon();
  console.log(`PASS f13 chains (finite chain unchanged; cyclical chain terminates at depth 10 with MAX_CHAIN_DEPTH; deterministic and configurable)`);
}
