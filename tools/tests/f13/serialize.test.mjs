// F13 harness — serialization, normalization and reload.
import assert from 'node:assert/strict';
import { fingerprint, loadGame, normalize, resume, simulate, snapshot } from './_lib.mjs';

export async function test() {
  // Volatile wall-clock fields are scrubbed: two saves differing only in `at` fingerprint the same.
  const a = { version: 16, life: { history: [{ id: 'e', at: '2026-01-01T00:00:00.000Z' }], resources: { money: 1 } } };
  const b = { version: 16, life: { history: [{ id: 'e', at: '2030-09-09T12:34:56.000Z' }], resources: { money: 1 } } };
  assert.equal(fingerprint(a), fingerprint(b), 'wall-clock `at` must not affect the fingerprint');
  assert.equal(normalize(a).life.history[0].at, undefined);
  // The accepted rent-collection event embeds Date.now() in its id; it is scrubbed too.
  assert.equal(fingerprint({ id: 'rent-collected:5:111' }), fingerprint({ id: 'rent-collected:5:999' }));

  // A captured save reloads into a fresh context with the same normalized fingerprint.
  const run = await simulate({ seed: 2, policy: 'conservative', days: 2, captureState: true });
  const reloaded = await resume(run.finalSave);
  assert.equal(fingerprint(snapshot(reloaded)), run.fingerprint, 'reloaded save fingerprints identically');

  // Missing/garbage input is tolerated by the accepted save pipeline (never a throw).
  const fresh = await loadGame();
  assert.equal(typeof fresh.RAState.get().life.resources.money, 'number');

  console.log('PASS f13 serialize (volatile fields scrubbed; captured save reloads to the same fingerprint)');
}
