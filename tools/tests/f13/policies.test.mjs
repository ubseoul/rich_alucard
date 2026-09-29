// F13 harness — policy interface and legality.
import assert from 'node:assert/strict';
import { createRng, describePolicies, getPolicy, POLICY_IDS, simulate } from './_lib.mjs';

const legalAction = extra => ({ id: 'legal', executable: true, kind: 'place', surface: 'place', target: 'X', firstTime: true, risk: 0, cost: 0, lane: 'life', ...extra });
const illegalAction = extra => ({ id: 'illegal', executable: false, kind: 'place', surface: 'place', target: 'Y', firstTime: true, risk: 0, cost: 0, lane: 'life', ...extra });

export async function test() {
  assert.equal(POLICY_IDS.length, 6, 'six neutral policies are registered');
  for (const id of ['conservative', 'spend-heavy', 'completionist', 'low-risk', 'high-risk', 'randomized']) assert(POLICY_IDS.includes(id), `missing policy ${id}`);
  assert.equal(describePolicies().length, 6);
  assert.throws(() => getPolicy('nope'));

  // A policy may only select from executable (legal) actions, even when a non-executable one is in front.
  for (const id of POLICY_IDS) {
    const policy = getPolicy(id);
    const actions = [illegalAction(), legalAction()];
    const env = { rng: createRng(`${id}:legality`), day: 1, ctx: { RALife: { money: () => 1000000 } } };
    for (let i = 0; i < 25; i++) {
      const chosen = policy.chooseAction(null, actions, env);
      assert(!chosen || chosen.id === 'legal', `${id} selected a non-executable action`);
    }
  }

  // The runner itself only ever marks executed actions legal at selection time (enforced by the invariant).
  const run = await simulate({ seed: 4, policy: 'randomized', days: 3, captureState: true });
  assert(run.metrics.actions.length > 0, 'randomized policy must take actions');
  const bad = run.invariants.failures.find(f => f.id === 'unavailable-content-not-selected');
  assert(!bad, `unavailable action selected: ${JSON.stringify(bad)}`);
  const cap = run.invariants.failures.find(f => f.id === 'no-infinite-action-loop');
  assert(!cap, `action cap violated: ${JSON.stringify(cap)}`);

  console.log(`PASS f13 policies (6 policies; no policy selects a non-executable action; ${run.metrics.actions.length} randomized actions with no legality/cap invariant failures)`);
}
