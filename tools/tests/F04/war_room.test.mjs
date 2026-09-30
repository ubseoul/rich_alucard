// F04 — PLAYMAKERS WAR ROOM — test suite
// tools/tests/F04/war_room.test.mjs
// Discovered and run by tools/run-tests.mjs (auto-discovery: tools/tests/**/*.test.mjs).

import assert from 'node:assert/strict';
import { same } from '../if1/_lib.mjs';
import { loadWar } from './_lib.mjs';

async function loadF04(root, { flagOn = true } = {}) {
  return loadWar(root, { flagOn });
}

export async function test(root) {
  // ── 1. Feature flag OFF — zero change ───────────────────────────────────
  {
    const ctx = await loadF04(root, { flagOn: false });
    const apps = ctx.RAPhoneApps;
    assert.equal(apps.get('warRoom'), null, 'warRoom app must not be registered with flag OFF');
    assert.equal(ctx.RAFrag.has('F04'), false, 'F04 frag namespace must not exist before any write');
  }

  // ── 2. Phone registration ON ────────────────────────────────────────────
  {
    const ctx = await loadF04(root, { flagOn: true });
    const declared = ctx.RAPhoneRegistry.declaredApps();
    const wr = declared.find(d => d.id === 'warRoom');
    assert.ok(wr, 'warRoom must be declared in phone registry');
    assert.equal(wr.fragment, 'F04');
    assert.equal(wr.flag, 'F04.war_room');

    const app = ctx.RAPhoneApps.get('warRoom');
    assert.ok(app, 'warRoom must be registered with RAPhoneApps when flag ON');

    const html = app.render(null);
    assert.ok(typeof html === 'string' && html.length > 0, 'render must return markup');
    assert.ok(html.includes('WAR ROOM'), 'render must include WAR ROOM title');
  }

  // ── 3. Named 6 & Tristan exclusion ──────────────────────────────────────
  {
    const ctx = await loadF04(root, { flagOn: true });
    const ogas = ctx.RACrew.list({ fragment: 'F04' });
    assert.equal(ogas.length, 6, 'must have exactly 6 named Ogas');
    const ids = ogas.map(o => o.id).sort();
    same(ids, ['auntie_grit','dre','half_pint','sunday_best','tunde','young_mazi'].sort(), 'named 6 exact ids');

    const tristan = ctx.RACrew.get('tristan');
    assert.equal(tristan, null, 'Tristan must never join');
  }

  // ── 4. Oga registry behavior & roster cap ───────────────────────────────
  {
    const ctx = await loadF04(root, { flagOn: true });
    const ogas = ctx.RACrew.list({ fragment: 'F04' });
    for (const o of ogas) {
      assert.equal(o.status, 'ACTIVE', `${o.name} must start ACTIVE`);
    }

    const recRes = ctx.RAWarRoomCrew.recruit({ id: 'test_recruit', name: 'TEST', cls: 'GHOST', source: 'rave' });
    assert.ok(recRes.ok, 'recruit must succeed');
    const u = ctx.RACrew.get('test_recruit');
    assert.ok(u, 'recruit must appear in RACrew');
    assert.equal(u.class, 'GHOST');

    ctx.RAWarRoomCrew.recruit({ id: 'r2', name: 'R2', cls: 'TALKER', source: 'catacomb' });
    const r3 = ctx.RAWarRoomCrew.recruit({ id: 'r3', name: 'R3', cls: 'DOC', source: 'rave' });
    assert.equal(r3.ok, false, 'recruit must fail when roster cap (8) is reached');
    assert.equal(r3.reason, 'roster-full');
  }

  // ── 5. Authored HEAT tier boundaries (Vol 7 §8) ─────────────────────────
  {
    const ctx = await loadF04(root, { flagOn: true });
    const heat = ctx.RAHeat;
    assert.equal(heat.tierFor(0), 'COOL');
    assert.equal(heat.tierFor(29), 'COOL');
    assert.equal(heat.tierFor(30), 'WARM');
    assert.equal(heat.tierFor(59), 'WARM');
    assert.equal(heat.tierFor(60), 'HOT');
    assert.equal(heat.tierFor(84), 'HOT');
    assert.equal(heat.tierFor(85), 'ON FIRE');
    assert.equal(heat.tierFor(120), 'ON FIRE');
    assert.equal(heat.describe().provisional, false, 'HEAT provisional must be false after F04 configures authored floors');
  }

  // ── 6. Authored job rewards & HEAT deltas (Vol 7 §3.2) ──────────────────
  {
    const ctx = await loadF04(root, { flagOn: true });

    // DROP: $8K–$25K, HEAT +4
    const drop = ctx.RAWarRoomJobs.JOB_TYPES.DROP;
    assert.equal(drop.heat, 4);
    assert.equal(drop.squadSize, 2);
    assert.equal(drop.reward.type, 'cash_range');
    assert.equal(drop.reward.min, 8000);
    assert.equal(drop.reward.max, 25000);
    for (let seed = 1; seed <= 20; seed++) {
      const res = ctx.RAWarRoomJobs.resolveReward(drop, 'koreatown', seed);
      assert.ok(res.cashDelta >= 8000 && res.cashDelta <= 25000, `DROP reward ${res.cashDelta} in $8K-$25K`);
      assert.equal(res.heatDelta, 4);
    }

    // RE-UP: +3–6 SUPPLY, HEAT +3
    const reup = ctx.RAWarRoomJobs.JOB_TYPES.RE_UP;
    assert.equal(reup.heat, 3);
    assert.equal(reup.squadSize, 2);
    assert.equal(reup.reward.type, 'supply_range');
    assert.equal(reup.reward.min, 3);
    assert.equal(reup.reward.max, 6);
    for (let seed = 1; seed <= 20; seed++) {
      const res = ctx.RAWarRoomJobs.resolveReward(reup, 'koreatown', seed);
      assert.ok(res.supplyDelta >= 3 && res.supplyDelta <= 6, `RE-UP supply ${res.supplyDelta} in 3-6`);
      assert.equal(res.heatDelta, 3);
    }

    // COLLECT: $10K–$40K, HEAT +5
    const collect = ctx.RAWarRoomJobs.JOB_TYPES.COLLECT;
    assert.equal(collect.heat, 5);
    assert.equal(collect.squadSize, 3);
    assert.equal(collect.reward.type, 'cash_range');
    assert.equal(collect.reward.min, 10000);
    assert.equal(collect.reward.max, 40000);
    for (let seed = 1; seed <= 20; seed++) {
      const res = ctx.RAWarRoomJobs.resolveReward(collect, 'arts_district', seed);
      assert.ok(res.cashDelta >= 10000 && res.cashDelta <= 40000, `COLLECT reward ${res.cashDelta} in $10K-$40K`);
      assert.equal(res.heatDelta, 5);
    }

    // PROTECT: $15K + STREET REP, HEAT +2
    const protect = ctx.RAWarRoomJobs.JOB_TYPES.PROTECT;
    assert.equal(protect.heat, 2);
    assert.equal(protect.squadSize, 3);
    const protectRes = ctx.RAWarRoomJobs.resolveReward(protect, 'inglewood', 1);
    assert.equal(protectRes.cashDelta, 15000);
    assert.equal(protectRes.heatDelta, 2);
    assert.ok(protectRes.effects.includes('+STREET REP'));

    // BAIT: Rival Pressure -2, HEAT +6
    const bait = ctx.RAWarRoomJobs.JOB_TYPES.BAIT;
    assert.equal(bait.heat, 6);
    assert.equal(bait.squadSize, 2);
    const baitRes = ctx.RAWarRoomJobs.resolveReward(bait, 'koreatown', 1);
    assert.equal(baitRes.pressureDelta, -2);
    assert.equal(baitRes.heatDelta, 6);
  }

  // ── 7. LAY LOW implementation (Vol 7 §3.2, §8) ──────────────────────────
  {
    const ctx = await loadF04(root, { flagOn: true });
    const layLow = ctx.RAWarRoomJobs.JOB_TYPES.LAY_LOW;
    assert.ok(layLow, 'LAY_LOW must be defined');
    assert.equal(layLow.squadSize, 0, 'squad size must be 0');
    assert.equal(layLow.reward.type, 'heat_reduce');
    assert.equal(layLow.reward.cashCost, 10000);
    assert.equal(layLow.reward.heatDelta, -15);

    ctx.RAState.patch('life.resources.money', 50000);
    ctx.RAHeat.add(40, { source: 'test' });
    const heatBefore = ctx.RAHeat.global();

    const jobCard = ctx.RAWarRoomJobs.buildJobCard({ type: 'LAY_LOW', district: null });
    assert.equal(jobCard.squadSize, 0);

    const res = ctx.RAWarRoomJobs.executeRun({ jobCard });
    assert.equal(res.success, true);
    assert.equal(res.cashDelta, -10000);
    assert.equal(res.heatDelta, -15);
    assert.equal(res.squadIds.length, 0);

    ctx.RAWarRoomJobs.applyRunResult(res);

    assert.equal(ctx.RAState.get().life.resources.money, 40000, 'must deduct $10,000');
    assert.ok(ctx.RAHeat.global() < heatBefore, 'heat must decrease');

    const menu = ctx.RAWarRoomJobs.buildNightMenu();
    assert.ok(menu.some(j => j.type === 'LAY_LOW'), 'LAY_LOW must be included in night menu');
  }

  // ── 8. District control & pressure (Koreatown is F03's: F04 consumes it) ───────────
  {
    const ctx = await loadF04(root, { flagOn: true });
    const owner = id => ctx.RADistricts.get(id)?.fragment;
    assert.equal(owner('koreatown'), 'F03', 'Koreatown stays F03-owned');
    assert.equal(owner('arts_district'), 'F04');
    assert.equal(owner('inglewood'), 'F04');
    same([...ctx.RAWarRoomDistricts.activeIds()], ['koreatown', 'arts_district', 'inglewood'], 'all three districts usable by the War Room');

    ctx.RAFrag.patch('F04', 'active', true);
    ctx.RAFrag.patch('F04', 'offer.status', 'accepted');

    for (let i = 0; i < 4; i++) {
      const p = ctx.RAWarRoomDistricts.tickPressure('koreatown');
      assert.ok(p < 5, `pressure at tick ${i+1} must be < 5`);
    }
    ctx.RAWarRoomDistricts.tickPressure('koreatown'); // 5th tick: flip
    const dist = ctx.RADistricts.get('koreatown');
    assert.equal(dist.state, 'CONTROLLED');
    assert.equal(dist.holder, 'rival');

    ctx.RAWarRoomDistricts.tickPressure('inglewood');
    ctx.RAWarRoomDistricts.tickPressure('inglewood');
    ctx.RAWarRoomDistricts.resetPressure('inglewood');
    assert.equal(ctx.RAWarRoomDistricts.pressure('inglewood'), 0);
    assert.ok(ctx.RAWarRoomDistricts.demand('arts_district') > 0 && ctx.RAWarRoomDistricts.demand('koreatown') === 0, 'a lost district has no demand; strategic weights are F04-owned data');
  }

  // ── 9. CAPTURED / GONE state ────────────────────────────────────────────
  {
    const ctx = await loadF04(root, { flagOn: true });

    ctx.RAWarRoomCrew.setDowned('half_pint', { reason: 'test' });
    assert.equal(ctx.RACrew.get('half_pint').status, 'DOWNED');

    ctx.RAWarRoomCrew.setCaptured('young_mazi', { reason: 'test' });
    const uCap = ctx.RACrew.get('young_mazi');
    assert.equal(uCap.status, 'CAPTURED');
    assert.ok(uCap.timers?.extract_window, 'extract_window timer must be set');

    ctx.RAWarRoomCrew.setGone('sunday_best', { reason: 'test' });
    const uGone = ctx.RACrew.get('sunday_best');
    assert.equal(uGone.status, 'GONE');
    const result = ctx.RACrew.setStatus('sunday_best', 'ACTIVE', {});
    assert.equal(result.ok, false);
    assert.equal(result.reason, 'gone');

    for (let i = 0; i < 3; i++) {
      ctx.RAWarRoomCrew.recordJobTogether('tunde', 'dre');
    }
    assert.ok(ctx.RAWarRoomCrew.areDayOnes('tunde', 'dre'));
    ctx.RAWarRoomCrew.setGone('tunde', { reason: 'test' });
    const dre = ctx.RACrew.get('dre');
    assert.ok(dre.stories?.['mourning_tunde'], 'dre must have mourning story for tunde');
  }

  // ── 10. Report card ─────────────────────────────────────────────────────
  {
    const ctx = await loadF04(root, { flagOn: true });

    const cleanRes = {
      type: 'run', jobId: 'test_job_1', district: 'inglewood',
      approach: 'LOUD', success: true,
      cashDelta: 15000, heatDelta: 2,
      squadIds: ['tunde', 'dre'],
      newStories: {},
      day: 20
    };
    const cleanCard = ctx.RAWarRoomReportCard.build(cleanRes);
    assert.ok(cleanCard, 'clean card must be built');
    assert.equal(cleanCard.success, true);
    assert.equal(cleanCard.tally.cash, 15000);
    assert.equal(cleanCard.style, 'clean');
    assert.equal(cleanCard.grainyPhoto, false);

    ctx.RAWarRoomCrew.setGone('half_pint', { reason: 'test' });
    const roughRes = {
      type: 'run', jobId: 'test_job_2', district: 'koreatown',
      approach: 'QUIET', success: false,
      cashDelta: 0, heatDelta: 5,
      squadIds: ['half_pint'],
      newStories: {},
      day: 21
    };
    const roughCard = ctx.RAWarRoomReportCard.build(roughRes);
    assert.equal(roughCard.style, 'rough');
    assert.equal(roughCard.grainyPhoto, true);
    assert.equal(roughCard.blackRibbon, true);
    assert.ok(roughCard.comments.some(c => c.text === 'damn.'));
  }

  // ── 11. HAND BACK ───────────────────────────────────────────────────────
  {
    const ctx = await loadF04(root, { flagOn: true });

    ctx.RAFrag.patch('F04', 'active', true);
    ctx.RAFrag.patch('F04', 'offer.status', 'accepted');
    const hbRes = ctx.RAWarRoomJobs.initiateHandBack();
    assert.ok(hbRes.ok, 'handBack must succeed when route active');
    assert.ok(hbRes.job, 'handBack must return final job card');
    assert.equal(hbRes.job.isHandBack, true);
    assert.ok(hbRes.note.includes('F01 THE PLAY'));

    ctx.RAWarRoomJobs.resolveHandBack({ outcome: 'victory' });
    assert.equal(ctx.RAFrag.read('F04', 'offer.status', null), 'closed_fame');
    assert.equal(ctx.RAFrag.read('F04', 'active', null), false);
  }

  // ── 12. The old tactical RUN / SHOWDOWN-stub surfaces are retired (OL-023) ───────────
  {
    const ctx = await loadF04(root, { flagOn: true });
    assert.equal(ctx.RAWarRoomShowdown, undefined, 'the showdown stub is gone');
    assert.equal(ctx.RAWarRoomJobs._beatLibrary, undefined, 'the RUN SEQUENCE beat library is gone');
    assert.equal(ctx.RAWarRoomJobs.APPROACHES, undefined, 'QUIET / LOUD / OCTOPUS approach picking is gone (F01 backstage)');
    assert.throws(() => ctx.RAWarRoomJobs.executeRun({ jobCard: ctx.RAWarRoomJobs.buildJobCard({ type: 'DROP', district: 'inglewood' }) }), /RUN_RETIRED/, 'F04 no longer resolves a crew job itself');
    const c = ctx.RAWarRoomJobs.buildJobCard({ type: 'TAKE_THE_BLOCK', district: 'inglewood' });
    assert.equal(c.routesToPlay, true);
    assert.equal(c.showdownSetup, undefined, 'no F01_INTEGRATION_PENDING setup blob');
    assert.equal(ctx.RAWarRoomJobs.buildJobCard({ type: 'LAY_LOW', district: null }).routesToPlay, false, 'LAY LOW is the only job F04 resolves itself');
    assert.ok(ctx.RAWarRoomPlay && typeof ctx.RAWarRoomPlay.launch === 'function', 'RAWarRoomPlay is the single seam');
  }

  // ── 13. Invariant self-check & Owner Ledger Integration ─────────────────
  {
    const ctx = await loadF04(root, { flagOn: true });
    // Verify all IF-1 modules present
    const desc = ctx.RAIF1.describe();
    assert.equal(desc.modules.RAPhoneRegistry.present, true);
    assert.equal(desc.modules.RAHeat.present, true);
    assert.equal(desc.modules.RACrew.present, true);
    assert.equal(desc.modules.RADistricts.present, true);

    // Verify pending ledger submission is reported accurately (owner assigns in migration_ledger.js)
    const problems = ctx.RAMigrations.validate();
    same(problems, ['submitted module F04.init-war-room has no version assigned by the integration owner']);
  }

  console.log('PASS F04 PLAYMAKERS WAR ROOM test suite (authored HEAT floors, job tables, LAY LOW, F03-owned Koreatown consumed, crew, report cards, hand back, tactical RUN retired, invariants)');
}
