// F13 harness — feature-flag-aware execution; flag OFF creates no fragment progression.
import assert from 'node:assert/strict';
import { simulate, STATUS } from './_lib.mjs';

export async function test() {
  // A default run has every fragment flag OFF and must not create a per-fragment save namespace.
  const off = await simulate({ seed: 5, policy: 'completionist', days: 3, captureState: true });
  assert.equal(off.metrics.crew.status, STATUS.NOT_AVAILABLE);
  const offNamespaces = off.finalSave?.frag ? Object.keys(off.finalSave.frag) : [];
  assert(!offNamespaces.some(ns => ns !== 'if1'), `flag OFF wrote a fragment namespace: ${offNamespaces.join(', ')}`);
  const ff = off.invariants.failures.find(f => f.id === 'feature-off-no-fragment-progression');
  assert(!ff, `feature-off invariant failed: ${JSON.stringify(ff)}`);

  // Enabling a reserved fragment flag makes the registry report it ON, but with the fragment's code absent there is
  // still no progression and no fragment namespace — the harness does not fabricate fragment behaviour.
  const on = await simulate({ seed: 5, policy: 'completionist', days: 3, captureState: true, fragmentFlags: { 'F05.trap': true } });
  const flag = on.adapters.fragments.F05.flags.find(f => f.id === 'F05.trap');
  assert(flag && flag.enabled === true, 'F05.trap must read enabled when force-set');
  assert.equal(on.adapters.fragments.F05.status, STATUS.NOT_AVAILABLE, 'the fragment itself is still not integrated');
  const onNamespaces = on.finalSave?.frag ? Object.keys(on.finalSave.frag) : [];
  assert(!onNamespaces.includes('F05'), 'no F05 namespace is created without fragment code');
  const allow = on.invariants.failures.find(f => f.id === 'save-namespace-allowlist');
  assert(!allow, `namespace allowlist invariant failed: ${JSON.stringify(allow)}`);

  console.log(`PASS f13 flags (default all-OFF writes no fragment namespace; forcing F05.trap ON still produces NOT_AVAILABLE content and no F05 save namespace)`);
}
