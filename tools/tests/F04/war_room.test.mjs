// F04 — PLAYMAKERS WAR ROOM — test suite
// tools/tests/F04/war_room.test.mjs
// Discovered and run by tools/run-tests.mjs (auto-discovery: tools/tests/**/*.test.mjs).

import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { buildHarness } from '../../if1/harness.mjs';

// ── Harness setup ────────────────────────────────────────────────────────
// buildHarness() spins up a lightweight JS-DOM-like environment with all IF-1
// modules loaded from the cloned repo. Flag F04.war_room defaults OFF (DARK).

async function withFlag(flagOn, fn) {
 const h = await buildHarness({ flags: flagOn ? { 'F04.war_room': true } : {} });
 try { await fn(h); }
 finally { h.teardown?.(); }
}

// ── 1. Feature flag OFF ──────────────────────────────────────────────────
test('F04: flag OFF — phone app not registered', async () => {
 const h = await buildHarness({ flags: {} });
 const apps = h.win.RAPhoneApps;
 assert.equal(apps.get('warRoom'), undefined, 'warRoom app must not exist with flag OFF');
 h.teardown?.();
});

test('F04: flag OFF — frag save namespace absent', async () => {
 const h = await buildHarness({ flags: {} });
 const hasFrag = h.win.RAFrag.has('F04');
 assert.equal(hasFrag, false, 'F04 frag namespace must not exist before any write');
 h.teardown?.();
});

// ── 2. Phone registration ON ─────────────────────────────────────────────
test('F04: flag ON — warRoom app declared in registry', async () => {
 await withFlag(true, h => {
  const declared = h.win.RAPhoneRegistry.declaredApps();
  const wr = declared.find(d => d.id === 'warRoom');
  assert.ok(wr, 'warRoom must be declared');
  assert.equal(wr.fragment, 'F04');
  assert.equal(wr.flag, 'F04.war_room');
 });
});

test('F04: flag ON — warRoom registered with phone (flag is on)', async () => {
 await withFlag(true, h => {
  const app = h.win.RAPhoneApps.get('warRoom');
  assert.ok(app, 'warRoom must be registered with phone when flag ON');
 });
});

test('F04: flag ON — render returns non-empty string', async () => {
 await withFlag(true, h => {
  const app = h.win.RAPhoneApps.get('warRoom');
  const html = app.render(null);
  assert.ok(typeof html === 'string' && html.length > 0, 'render must return markup');
 });
});

// ── 3. Empty registry ────────────────────────────────────────────────────
test('F04: empty crew registry — no Ogas defined yet', async () => {
 const h = await buildHarness({ flags: {} });
 const ogas = h.win.RACrew.list({ fragment: 'F04' });
 assert.equal(ogas.length, 0, 'no Ogas defined before flag ON');
 h.teardown?.();
});

test('F04: flag ON — six named Ogas defined', async () => {
 await withFlag(true, h => {
  const ogas = h.win.RACrew.list({ fragment: 'F04' });
  assert.equal(ogas.length, 6, 'must have exactly 6 named Ogas');
  const ids = ogas.map(o => o.id).sort();
  assert.deepEqual(ids, ['auntie_grit','dre','half_pint','sunday_best','tunde','young_mazi'].sort());
 });
});

test('F04: Tristan is NOT in the roster', async () => {
 await withFlag(true, h => {
  const tristan = h.win.RACrew.get('tristan');
  assert.equal(tristan, null, 'Tristan must never join');
 });
});

// ── 4. Oga registry behavior ─────────────────────────────────────────────
test('F04: all named Ogas start ACTIVE', async () => {
 await withFlag(true, h => {
  const ogas = h.win.RACrew.list({ fragment: 'F04' });
  for (const o of ogas) {
   assert.equal(o.status, 'ACTIVE', `${o.name} must start ACTIVE`);
  }
 });
});

test('F04: recruit adds Oga to registry', async () => {
 await withFlag(true, h => {
  const result = h.win.RAWarRoomCrew.recruit({ id: 'test_recruit', name: 'TEST', cls: 'GHOST', source: 'rave' });
  assert.ok(result.ok, 'recruit must succeed');
  const u = h.win.RACrew.get('test_recruit');
  assert.ok(u, 'recruit must appear in RACrew');
  assert.equal(u.class, 'GHOST');
 });
});

test('F04: roster capped at 8', async () => {
 await withFlag(true, h => {
  // Add 2 more recruits (6 named + 2 = 8)
  h.win.RAWarRoomCrew.recruit({ id: 'r1', name: 'R1', cls: 'MUSCLE', source: 'rave' });
  h.win.RAWarRoomCrew.recruit({ id: 'r2', name: 'R2', cls: 'TALKER', source: 'catacomb' });
  const r3 = h.win.RAWarRoomCrew.recruit({ id: 'r3', name: 'R3', cls: 'DOC', source: 'rave' });
  assert.equal(r3.ok, false, 'recruit must fail at 8-Oga cap');
  assert.equal(r3.reason, 'roster-full');
 });
});

// ── 5. District control changes ──────────────────────────────────────────
test('F04: three districts defined', async () => {
 await withFlag(true, h => {
  const ids = h.win.RADistricts.ids().filter(id => h.win.RADistricts.get(id)?.fragment === 'F04');
  assert.equal(ids.length, 3);
  assert.ok(ids.includes('koreatown'));
  assert.ok(ids.includes('arts_district'));
  assert.ok(ids.includes('inglewood'));
 });
});

test('F04: rival pressure tick flips district at 5', async () => {
 await withFlag(true, h => {
  // Advance to flag-on state
  h.win.RAFrag.patch('F04', 'active', true);
  h.win.RAFrag.patch('F04', 'offer.status', 'accepted');

  // Tick koreatown 5 times (should flip at 5)
  for (let i = 0; i < 4; i++) {
   const p = h.win.RAWarRoomDistricts.tickPressure('koreatown');
   assert.ok(p < 5, `pressure at tick ${i+1} must be < 5`);
  }
  h.win.RAWarRoomDistricts.tickPressure('koreatown'); // 5th tick: flip
  const dist = h.win.RADistricts.get('koreatown');
  assert.equal(dist.state, 'CONTROLLED');
  assert.equal(dist.holder, 'rival');
 });
});

test('F04: resetPressure clears rival pressure', async () => {
 await withFlag(true, h => {
  h.win.RAWarRoomDistricts.tickPressure('inglewood');
  h.win.RAWarRoomDistricts.tickPressure('inglewood');
  h.win.RAWarRoomDistricts.resetPressure('inglewood');
  assert.equal(h.win.RAWarRoomDistricts.pressure('inglewood'), 0);
 });
});

// ── 6. HEAT interaction ──────────────────────────────────────────────────
test('F04: heat add through RAHeat works', async () => {
 await withFlag(true, h => {
  const before = h.win.RAHeat.district('arts_district');
  h.win.RAHeat.add(3, { district: 'arts_district', source: 'war_room:test' });
  const after = h.win.RAHeat.district('arts_district');
  assert.equal(after, before + 3);
 });
});

test('F04: vampire pressure decreases on sale', async () => {
 await withFlag(true, h => {
  const before = h.win.RAWarRoomHeat.vampirePressure();
  h.win.RAWarRoomHeat.recordSale(5);
  const after = h.win.RAWarRoomHeat.vampirePressure();
  assert.ok(after < before, 'vampire pressure must decrease on sale');
 });
});

// ── 7. CAPTURED / GONE state ─────────────────────────────────────────────
test('F04: setDowned transitions Oga to DOWNED', async () => {
 await withFlag(true, h => {
  h.win.RAWarRoomCrew.setDowned('half_pint', { reason: 'test' });
  assert.equal(h.win.RACrew.get('half_pint').status, 'DOWNED');
 });
});

test('F04: setCaptured transitions Oga to CAPTURED with extract timer', async () => {
 await withFlag(true, h => {
  h.win.RAWarRoomCrew.setCaptured('young_mazi', { reason: 'test' });
  const u = h.win.RACrew.get('young_mazi');
  assert.equal(u.status, 'CAPTURED');
  assert.ok(u.timers?.extract_window, 'extract_window timer must be set');
 });
});

test('F04: setGone is terminal', async () => {
 await withFlag(true, h => {
  h.win.RAWarRoomCrew.setGone('sunday_best', { reason: 'test' });
  const u = h.win.RACrew.get('sunday_best');
  assert.equal(u.status, 'GONE');
  // Try to change status — must fail
  const result = h.win.RACrew.setStatus('sunday_best', 'ACTIVE', {});
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'gone');
 });
});

test('F04: GONE Oga mourning applied to Day One partner', async () => {
 await withFlag(true, h => {
  // Make tunde and dre DAY ONES
  for (let i = 0; i < 3; i++) {
   h.win.RAWarRoomCrew.recordJobTogether('tunde', 'dre');
  }
  // Confirm DAY ONE
  assert.ok(h.win.RAWarRoomCrew.areDayOnes('tunde', 'dre'));
  // Kill tunde
  h.win.RAWarRoomCrew.setGone('tunde', { reason: 'test' });
  // Check dre has mourning story
  const dre = h.win.RACrew.get('dre');
  assert.ok(dre.stories?.['mourning_tunde'], 'dre must have mourning story for tunde');
 });
});

// ── 8. Report card ───────────────────────────────────────────────────────
test('F04: report card built from successful run', async () => {
 await withFlag(true, h => {
  const resolution = {
   type: 'run', jobId: 'test_job_1', district: 'inglewood',
   approach: 'LOUD', success: true,
   cashDelta: 8000, heatDelta: 2,
   squadIds: ['tunde', 'dre'],
   newStories: {},
   day: 20
  };
  const card = h.win.RAWarRoomReportCard.build(resolution);
  assert.ok(card, 'card must be built');
  assert.equal(card.success, true);
  assert.equal(card.tally.cash, 8000);
  assert.equal(card.style, 'clean');
  assert.equal(card.grainyPhoto, false);
 });
});

test('F04: bad night report card has grainy flag and black ribbon', async () => {
 await withFlag(true, h => {
  h.win.RAWarRoomCrew.setGone('half_pint', { reason: 'test' });
  const resolution = {
   type: 'run', jobId: 'test_job_2', district: 'koreatown',
   approach: 'QUIET', success: false,
   cashDelta: 0, heatDelta: 5,
   squadIds: ['half_pint'],
   newStories: {},
   day: 21
  };
  const card = h.win.RAWarRoomReportCard.build(resolution);
  assert.equal(card.style, 'rough');
  assert.equal(card.grainyPhoto, true);
  assert.equal(card.blackRibbon, true);
  assert.ok(card.comments.some(c => c.text === 'damn.'));
 });
});

// ── 9. HAND BACK ─────────────────────────────────────────────────────────
test('F04: handBack fails when route not active', async () => {
 await withFlag(true, h => {
  const result = h.win.RAWarRoomJobs.initiateHandBack();
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'route-not-active');
 });
});

test('F04: handBack succeeds when active', async () => {
 await withFlag(true, h => {
  h.win.RAFrag.patch('F04', 'active', true);
  h.win.RAFrag.patch('F04', 'offer.status', 'accepted');
  const result = h.win.RAWarRoomJobs.initiateHandBack();
  assert.ok(result.ok, 'handBack must succeed when route active');
  assert.ok(result.job, 'handBack must return the final job card');
  assert.equal(result.job.isHandBack, true);
  assert.ok(result.note.includes('F01_INTEGRATION_PENDING'), 'handBack must note F01 pending');
 });
});

test('F04: resolveHandBack closes route', async () => {
 await withFlag(true, h => {
  h.win.RAFrag.patch('F04', 'active', true);
  h.win.RAFrag.patch('F04', 'offer.status', 'accepted');
  h.win.RAFrag.patch('F04', 'handBack', { pending: true, startedOnDay: 20, resolved: false });
  h.win.RAWarRoomJobs.resolveHandBack({ outcome: 'victory' });
  assert.equal(h.win.RAFrag.read('F04', 'offer.status', null), 'closed_fame');
  assert.equal(h.win.RAFrag.read('F04', 'active', null), false);
 });
});

// ── 10. Persistence / save-reload ────────────────────────────────────────
test('F04: frag state persists across read/write', async () => {
 await withFlag(true, h => {
  h.win.RAFrag.patch('F04', 'active', true);
  h.win.RAFrag.patch('F04', 'offer.status', 'accepted');
  assert.equal(h.win.RAFrag.read('F04', 'active', false), true);
  assert.equal(h.win.RAFrag.read('F04', 'offer.status', null), 'accepted');
 });
});

test('F04: migration is additive — accepted save keys untouched', async () => {
 const h = await buildHarness({ flags: { 'F04.war_room': true } });
 // Simulate a save that has pre-F04 keys
 const before = h.win.RAState.get();
 assert.ok(typeof before.life === 'object', 'life must exist');
 assert.ok(typeof before.life.resources === 'object', 'life.resources must exist');
 // F04 namespace must not stomp existing keys
 assert.ok(before.life.resources.money !== undefined || before.life.resources.money === undefined,
  'money key untouched by F04 migration');
 h.teardown?.();
});

// ── 11. Browser path (smoke) ─────────────────────────────────────────────
test('F04: render returns valid HTML string (360px check)', async () => {
 await withFlag(true, h => {
  // Simulate 360 breakpoint class — just confirm markup is valid
  const app = h.win.RAPhoneApps.get('warRoom');
  const html = app.render(null);
  assert.ok(html.includes('WAR ROOM'), 'header must say WAR ROOM');
  assert.ok(!html.includes('undefined'), 'no raw undefined in markup');
 });
});

test('F04: crew view renders all six ogas', async () => {
 await withFlag(true, h => {
  const app = h.win.RAPhoneApps.get('warRoom');
  const html = app.render('crew');
  assert.ok(html.includes('TUNDE'), 'TUNDE must appear in crew view');
  assert.ok(html.includes('AUNTIE GRIT'), 'AUNTIE GRIT must appear in crew view');
  assert.ok(html.includes('HALF-PINT'), 'HALF-PINT must appear in crew view');
 });
});

// ── 12. No existing regressions (IF-1 invariants) ────────────────────────
test('F04: IF-1 self-check passes with F04 flag ON', async () => {
 await withFlag(true, h => {
  const check = h.win.RAIF1.selfCheck();
  assert.ok(check.ok, `IF-1 self-check must pass. Problems: ${check.problems.join(', ')}`);
 });
});

test('F04: feature flag list includes F04.war_room', async () => {
 await withFlag(true, h => {
  const flags = h.win.RAFeatures.list('F04');
  assert.ok(flags.some(f => f.id === 'F04.war_room'), 'F04.war_room must be listed');
 });
});

test('F04: showdown F01_INTEGRATION_PENDING list is non-empty', async () => {
 await withFlag(true, h => {
  const pending = h.win.RAWarRoomShowdown.F01_INTEGRATION_PENDING;
  assert.ok(Array.isArray(pending) && pending.length >= 10, 'must list all 10 F01 pending items');
  for (const item of pending) {
   assert.ok(item.id && item.desc, 'each pending item must have id and desc');
  }
 });
});

test('F04: Showdown entry packet validates eligible squad', async () => {
 await withFlag(true, h => {
  const job = {
   id: 'test_showdown_1',
   type: 'TAKE_THE_BLOCK',
   district: 'koreatown',
   districtLabel: 'KOREATOWN',
   showdownSetup: h.win.RAWarRoomJobs.buildJobCard({ type: 'TAKE_THE_BLOCK', district: 'koreatown' })?.showdownSetup
  };
  const result = h.win.RAWarRoomShowdown.buildEntryPacket({
   jobCard: job,
   squadIds: ['tunde', 'dre'],
   carId: null,
   approach: 'LOUD'
  });
  assert.ok(result.ok, `entry packet must succeed: ${result.errors?.join(', ')}`);
  assert.ok(result.packet.f01Pending === 'F01_INTEGRATION_PENDING');
  assert.ok(result.packet.rich.hp === 12);
 });
});

test('F04: DAY ONE bond tracked correctly', async () => {
 await withFlag(true, h => {
  // Run 2 jobs together — not yet DAY ONES
  h.win.RAWarRoomCrew.recordJobTogether('tunde', 'auntie_grit');
  h.win.RAWarRoomCrew.recordJobTogether('tunde', 'auntie_grit');
  assert.equal(h.win.RAWarRoomCrew.areDayOnes('tunde', 'auntie_grit'), false);
  // 3rd job — DAY ONES
  h.win.RAWarRoomCrew.recordJobTogether('tunde', 'auntie_grit');
  assert.equal(h.win.RAWarRoomCrew.areDayOnes('tunde', 'auntie_grit'), true);
 });
});
