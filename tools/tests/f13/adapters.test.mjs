// F13 harness — missing-fragment adapters produce NOT_AVAILABLE, never fake behaviour.
import assert from 'node:assert/strict';
import { buildAdapters, fragmentCensus, FRAGMENTS, loadGame, mkdir, path, rm, STATUS, writeFile } from './_lib.mjs';
import os from 'node:os';

export async function test(root) {
  const ctx = await loadGame();
  const adapters = buildAdapters(root, ctx);

  // No campaign fragment is integrated at this base (js/frag has no fragment manifests).
  for (const f of FRAGMENTS) {
    assert.equal(adapters.fragments[f.id].status, STATUS.NOT_AVAILABLE, `${f.id} must be NOT_AVAILABLE (not integrated)`);
    assert(adapters.fragments[f.id].reason, `${f.id} must explain why`);
  }

  // IF-1 services exist, but fragment-populated content inside them does not.
  assert.equal(adapters.services.moneyLedger.status, STATUS.AVAILABLE);
  assert.equal(adapters.services.heat.status, STATUS.AVAILABLE);
  assert.equal(adapters.services.crew.status, STATUS.AVAILABLE);
  assert.equal(adapters.content.crew.status, STATUS.NOT_AVAILABLE, 'crew registry has no units');
  assert.equal(adapters.content.districts.status, STATUS.NOT_AVAILABLE, 'no district is defined');
  assert.equal(adapters.content.salesChannels.status, STATUS.NOT_AVAILABLE, 'TRAP / RAINMAKER channels are reserved but unclaimed');
  assert.equal(adapters.content.adventures.status, STATUS.AVAILABLE, 'accepted adventures are available');
  assert(adapters.notAvailable.length > 0, 'notAvailable report is populated');
  assert(adapters.notAvailable.some(n => n.id === 'fragment:F01'));
  assert(adapters.notAvailable.some(n => n.id === 'content:crew'));

  // A present fragment manifest is detected as AVAILABLE without touching the repository.
  const base = await mkdirTemp();
  try {
    await mkdir(path.join(base, 'js', 'frag', 'F91'), { recursive: true });
    await writeFile(path.join(base, 'js', 'frag', 'F91', 'manifest.json'), JSON.stringify({ files: ['js/frag/F91/a.js'] }));
    const census = fragmentCensus(base, ctx, 'F91');
    assert.equal(census.status, STATUS.AVAILABLE, 'a fragment with a manifest is detected as integrated');
    assert.deepEqual(census.files, ['js/frag/F91/a.js']);
  } finally {
    await rm(base, { recursive: true, force: true });
  }

  console.log(`PASS f13 adapters (${FRAGMENTS.length} fragments NOT_AVAILABLE; crew/districts/sales content NOT_AVAILABLE; manifest detection works; ${adapters.notAvailable.length} unavailable surfaces reported)`);
}

async function mkdirTemp() {
  const base = path.join(os.tmpdir(), `f13-adapters-${process.pid}-${Date.now()}`);
  await mkdir(base, { recursive: true });
  return base;
}
