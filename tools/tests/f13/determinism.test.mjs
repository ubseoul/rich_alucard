// F13 harness — deterministic replay + save/reload continuation.
import assert from 'node:assert/strict';
import { simulate } from './_lib.mjs';

export async function test() {
  // 1. Same seed + same policy => byte-identical continuation (fingerprint + action trace).
  const a = await simulate({ seed: 7, policy: 'completionist', days: 4 });
  const b = await simulate({ seed: 7, policy: 'completionist', days: 4 });
  assert.equal(a.fingerprint, b.fingerprint, 'same seed/policy must fingerprint identically');
  assert.deepEqual(a.trace, b.trace, 'same seed/policy must execute the same action trace');
  assert.equal(a.invariants.failures.length, 0, `clean run invariants: ${JSON.stringify(a.invariants.failures)}`);

  // 2. Different seeds diverge where RNG exists (randomized policy uses the harness RNG on every decision).
  const r1 = await simulate({ seed: 11, policy: 'randomized', days: 5 });
  const r2 = await simulate({ seed: 12, policy: 'randomized', days: 5 });
  assert.notEqual(r1.fingerprint, r2.fingerprint, 'different seeds must diverge under a randomized policy');

  // 3. Save/reload continuation: the same captured save + RNG position continues identically, twice.
  const head = await simulate({ seed: 3, policy: 'completionist', days: 3, captureState: true });
  const contA = await simulate({ seed: 3, policy: 'completionist', days: 3, startSave: head.finalSave, rngState: head.rngState });
  const contB = await simulate({ seed: 3, policy: 'completionist', days: 3, startSave: head.finalSave, rngState: head.rngState });
  assert.equal(contA.fingerprint, contB.fingerprint, 'a loaded save must continue deterministically');
  assert.deepEqual(contA.trace, contB.trace, 'a loaded save must produce the same action trace');

  // 4. Split run === whole run when the save AND the RNG position are carried across the boundary.
  const whole = await simulate({ seed: 3, policy: 'completionist', days: 6 });
  assert.equal(whole.fingerprint, contA.fingerprint, 'split run must equal the uninterrupted run');
  assert.deepEqual(whole.trace, [...head.trace, ...contA.trace], 'split action trace must equal the whole trace');

  console.log(`PASS f13 deterministic replay (same-seed identical fingerprint/trace; seeds diverge; save+reload continuation equals the whole run: ${whole.fingerprint.slice(0, 12)}…)`);
}
