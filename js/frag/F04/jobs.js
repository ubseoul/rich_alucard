(function(){
 'use strict';
 // F04 — PLAYMAKERS WAR ROOM — jobs.js
 // The strategic jobs framework: the authored job catalogue, the night menu, LAY LOW, HAND BACK state.
 // SOURCE: Vol 7 §3.2 (job menu, authored reward/heat tables), §3.3 (RUNS vs SHOWDOWNS),
 //         §4 (RUN SEQUENCES), §8 (strategy test).
 //
 // PLAY BOUNDARY (OL-023): every job that sends crew out is EXECUTED by F01 THE PLAY (see play_adapter.js, RAWarRoomPlay).
 // The old F04 RUN SEQUENCE (beat cards, odds, approach) and the SHOWDOWN stub are RETIRED: F04 no longer resolves a job
 // tactically and shows no tactical surface. LAY LOW (no crew) is the only job F04 still resolves itself.

 if (!window.RAFeatures?.get('F04.war_room')) return;

 // ── Job type catalogue — Vol 7 §3.2 (authored) ─────────────────────────
 // RUN types (resolve as RUN SEQUENCE — non-Showdown):
 //   DROP, RE_UP, COLLECT, PROTECT, BAIT, LAY_LOW
 // Crew-out types beyond RUN (all executed by F01 THE PLAY):
 //   TAKE_THE_BLOCK, EXTRACT, RETALIATION
 //
 // AUTHORED REWARD / HEAT TABLE (Vol 7 §3.2):
 //   DROP         Reward: $8K–$25K              HEAT: +4
 //   RE-UP        Reward: +3–6 SUPPLY           HEAT: +3
 //   COLLECT      Reward: $10K–$40K             HEAT: +5
 //   PROTECT      Reward: $15K + STREET REP     HEAT: +2
 //   BAIT         Reward: Rival Pressure −2     HEAT: +6
 //   LAY LOW      Cost: $−10K   Effect: HEAT−15  Squad: 0
 const JOB_TYPES = Object.freeze({
  // RUN types
  DROP: {
   kind: 'run',   label: 'DROP',
   squadSize: 2,
   reward: { type: 'cash_range', min: 8000, max: 25000 },
   heat: 4
  },
  RE_UP: {
   kind: 'run',   label: 'RE-UP',
   squadSize: 2,
   reward: { type: 'supply_range', min: 3, max: 6 },
   heat: 3
  },
  COLLECT: {
   kind: 'run',   label: 'COLLECT',
   squadSize: 2,
   reward: { type: 'cash_range', min: 10000, max: 40000 },
   heat: 5
  },
  PROTECT: {
   kind: 'run',   label: 'PROTECT',
   squadSize: 3,
   reward: { type: 'cash_and_rep', cash: 15000, rep: true },
   heat: 2
  },
  BAIT: {
   kind: 'run',   label: 'BAIT',
   squadSize: 2,
   reward: { type: 'pressure_reduce', pressureDelta: -2 },
   heat: 6
  },
  LAY_LOW: {
   kind: 'run',   label: 'LAY LOW',
   squadSize: 0,
   reward: { type: 'heat_reduce', heatDelta: -15, cashCost: 10000 },
   heat: 0  // net effect: HEAT −15 (from reward), cost $10K
  },
  // SHOWDOWN types
  TAKE_THE_BLOCK: { kind: 'showdown', label: 'TAKE THE BLOCK', squadSize: 3, reward: { type: 'showdown' }, heat: 0 },
  EXTRACT:        { kind: 'showdown', label: 'EXTRACT',         squadSize: 3, reward: { type: 'showdown' }, heat: 0 },
  RETALIATION:    { kind: 'showdown', label: 'RETALIATION RAID',squadSize: 3, reward: { type: 'showdown' }, heat: 0 }
 });

 // ── Night modifier table (Vol 7 §3.2) ──────────────────────────────────
 function nightModifiers() {
  const life = window.RALife.today();
  const day = life.day;
  const mods = [];
  // RAIN: stealth +10%, WHEELS -10%
  if (window.RAState.get().life?.world?.rain) {
   mods.push({ id: 'rain', label: 'RAIN', stealth: +10, wheels: -10 });
  }
  // FULL MOON: werewolf trouble on Inglewood jobs
  if (day % 28 === 0) {
   mods.push({ id: 'full_moon', label: 'FULL MOON', inglewood_penalty: true });
  }
  // FRIDAY: demand ×1.5, heat ×1.5
  const weekday = ((day - 1) % 7);
  if (weekday === 4) {
   mods.push({ id: 'friday', label: 'FRIDAY', demand_mult: 1.5, heat_mult: 1.5 });
  }
  // OFFICER NODD ON PATROL: any WHEELS job +10% risk
  const nodd = window.RAState.get().life?.world?.flags?.noddOnPatrol;
  if (nodd) {
   mods.push({ id: 'officer_nodd', label: 'OFFICER NODD ON PATROL', wheels_risk: +10 });
  }
  // HOT DISTRICT: heat ×2 (checked per district in job card)
  return mods;
 }

 // (RUN SEQUENCE beat library / odds / approach retired — OL-023: F01 THE PLAY owns crew, car, approach and outcome.)

 // ── Authored reward range computation ────────────────────────────────────
 // Where Vol 7 §3.2 specifies a RANGE, the rolled value is uniformly distributed
 // within the authored min/max, using the project's existing hash-based seeded
 // randomization convention (RALife.hash) for determinism in tests.
 function rollRange(min, max, seed) {
  if (min === max) return min;
  const h = typeof window._testRoll === 'function'
   ? window._testRoll('range', seed)
   : Math.floor(Math.random() * 100) + 1;
  const span = max - min;
  return min + Math.round((h / 100) * span);
 }

 // ── Job card builder ──────────────────────────────────────────────────────
 function buildJobCard({ type, district, approach = 'LOUD', night = null, target = null }) {
  const typeDef = JOB_TYPES[type];
  if (!typeDef) return null;
  const distDef = window.RADistricts.get(district);
  const isShowdown = typeDef.kind === 'showdown';
  const mods = night || nightModifiers();
  const heat_mult = mods.find(m => m.heat_mult)?.heat_mult || 1;
  const distHeat = district ? window.RAHeat.district(district) : 0;
  const isHotDistrict = window.RAHeat.tierFor(distHeat) === 'HOT' || window.RAHeat.tierFor(distHeat) === 'ON FIRE';

  return {
   id: `${district || 'global'}_${type}${target ? `_${target}` : ''}_${window.RALife.today().day}`,
   target,
   type,
   kind: typeDef.kind,
   district,
   districtLabel: distDef?.label || district || '—',
   squadSize: typeDef.squadSize,
   approach,
   modifiers: mods,
   heat_mult: isHotDistrict ? heat_mult * 2 : heat_mult,
   isShowdown,
   authoredHeat: typeDef.heat,
   authoredReward: typeDef.reward,
   routesToPlay: type !== 'LAY_LOW',
   recommended: recommendedClasses(type),
   label: typeDef.label
  };
 }

 function recommendedClasses(type) {
  const map = {
   DROP: ['GHOST', 'TALKER'],
   RE_UP: ['WHEELS', 'MUSCLE'],
   COLLECT: ['MUSCLE', 'TALKER'],
   PROTECT: ['MUSCLE', 'SHOOTER'],
   BAIT: ['TALKER', 'GHOST'],
   LAY_LOW: [],
   TAKE_THE_BLOCK: ['MUSCLE', 'SHOOTER'],
   EXTRACT: ['DOC', 'GHOST'],
   RETALIATION: ['MUSCLE', 'SHOOTER']
  };
  return map[type] || [];
 }

 // ── Resolve authored reward for a successful RUN ────────────────────────
 function resolveReward(typeDef, district, day) {
  const r = typeDef.reward;
  if (!r) return { cashDelta: 0, heatDelta: typeDef.heat, supplyDelta: 0, effects: [] };

  const result = {
   cashDelta: 0,
   heatDelta: typeDef.heat,
   supplyDelta: 0,
   pressureDelta: 0,
   effects: []
  };

  switch (r.type) {
   case 'cash_range':
    result.cashDelta = rollRange(r.min, r.max, day);
    result.effects.push(`+$${result.cashDelta.toLocaleString()}`);
    break;

   case 'supply_range':
    result.supplyDelta = rollRange(r.min, r.max, day);
    result.effects.push(`+${result.supplyDelta} SUPPLY`);
    break;

   case 'cash_and_rep':
    result.cashDelta = r.cash;
    result.effects.push(`+$${r.cash.toLocaleString()}`);
    if (r.rep) {
     result.effects.push('+STREET REP');
    }
    break;

   case 'pressure_reduce':
    result.pressureDelta = r.pressureDelta; // −2
    result.effects.push(`RIVAL PRESSURE ${r.pressureDelta}`);
    break;

   case 'heat_reduce':
    // LAY LOW: cost $10K, HEAT −15, no squad
    result.cashDelta = -(r.cashCost || 10000);
    result.heatDelta = r.heatDelta; // −15
    result.effects.push(`HEAT ${r.heatDelta}`, `-$${r.cashCost?.toLocaleString() || '10,000'}`);
    break;
  }

  return result;
 }

 // ── LAY LOW (the only job F04 resolves itself: no squad, no car, no PLAY) ──────────────
 // Every other job type is executed by F01 THE PLAY through RAWarRoomPlay.launch(jobCard).
 function executeRun({ jobCard } = {}) {
  if (!jobCard || jobCard.type !== 'LAY_LOW') {
   throw new Error('RUN_RETIRED: F04 no longer resolves crew jobs; use RAWarRoomPlay.launch(jobCard) (F01 THE PLAY)');
  }
  const typeDef = JOB_TYPES.LAY_LOW;
  const reward = resolveReward(typeDef, jobCard.district, window.RALife.today().day);
  return {
   type: 'run',
   jobId: jobCard.id,
   district: jobCard.district,
   approach: 'LAY_LOW',
   success: true,
   cashDelta: reward.cashDelta,
   heatDelta: reward.heatDelta,
   supplyDelta: 0,
   pressureDelta: 0,
   rewardEffects: reward.effects,
   newStories: {},
   squadIds: [],
   carId: null,
   day: window.RALife.today().day
  };
 }

 // ── Night job menu builder ───────────────────────────────────────────────
 // Vol 7 §3.1: "each in-game night the War Room offers 2–4 JOBS"
 function buildNightMenu() {
  const cards = [];

  // EXTRACT jobs for any CAPTURED Ogas (high priority)
  const captured = window.RACrew.list({ status: 'CAPTURED', fragment: 'F04' });
  for (const oga of captured) {
   const timer = oga.timers?.extract_window;
   if (timer) {
    cards.push(buildJobCard({ type: 'EXTRACT', district: extractDistrict(oga.id), target: oga.id }));
   }
  }

  // A retaliation that came due (wake.js sets retaliationPending) is surfaced as the RETALIATION job (F01 plays it as HOLD THE HOUSE).
  for (const distId of window.RAWarRoomDistricts.activeIds()) {
   if (window.RAFrag.read('F04', `districts.${distId}.retaliationPending`, false)) {
    cards.push(buildJobCard({ type: 'RETALIATION', district: distId }));
    break;
   }
  }

  // District jobs (RUN or SHOWDOWN)
  // (Koreatown is F03-defined; the War Room consumes it through activeIds(), whoever registered the district.)
  const activeDistricts = window.RAWarRoomDistricts.activeIds()
   .map(id => window.RADistricts.get(id))
   .filter(d => d && (d.state !== 'CONTROLLED' || d.holder === 'rich'));

  for (const dist of activeDistricts) {
   if (cards.length >= 3) break; // keep room for LAY LOW within 4 total jobs
   const day = window.RALife.today().day;
   const showdownSeed = (day * 7 + dist.id.charCodeAt(0)) % 4;
   // RC2 (OL-063): a brand-new crew's first two nights offer routine runs only; TAKE THE BLOCK shows up from the third night.
   if (showdownSeed === 0 && Number(window.RAFrag.read('F04', 'jobs.nightsSinceStart', 0)) >= 2) {
    cards.push(buildJobCard({ type: 'TAKE_THE_BLOCK', district: dist.id }));
   } else {
    const runType = pickRunType(dist.id);
    cards.push(buildJobCard({ type: runType, district: dist.id }));
   }
  }

  // LAY LOW is always available as a standing job option (Vol 7 §3.2, §8)
  cards.push(buildJobCard({ type: 'LAY_LOW', district: null }));

  return cards;
 }

 function pickRunType(districtId) {
  const types = ['DROP', 'RE_UP', 'COLLECT', 'PROTECT', 'BAIT'];
  const day = window.RALife.today().day;
  return types[(day + districtId.charCodeAt(0)) % types.length];
 }

 function extractDistrict(ogaId) {
  const log = window.RAFrag.read('F04', 'jobs.log', []);
  const entry = [...log].reverse().find(e => e.ogas?.includes(ogaId) && e.result === 'captured');
  return entry?.district || window.RAWarRoomDistricts.activeIds()[0] || null;
 }

 // ── Apply run resolution to world state ─────────────────────────────────
 function applyRunResult(resolution) {
  if (!resolution) return;

  // HEAT: authored per-type delta, already computed in resolution.heatDelta
  if (resolution.heatDelta) {
   if (resolution.district) {
    window.RAHeat.add(resolution.heatDelta, { district: resolution.district, source: `war_room:${resolution.approach}` });
    // Global heat contribution (scaled fraction of district heat for visibility)
    const globalDelta = Math.round(Math.abs(resolution.heatDelta) * 0.3) * Math.sign(resolution.heatDelta);
    if (globalDelta) {
     window.RAHeat.add(globalDelta, { source: `war_room:${resolution.approach}:global` });
    }
   } else {
    // F13: a districtless job (LAY LOW, the only one) has no district to hold the delta, so its whole authored delta is GLOBAL
    // (Vol 7 §3.2 "HEAT −15", as its card shows). The 30% share above was an artifact of every other job having a district.
    window.RAHeat.add(resolution.heatDelta, { source: `war_room:${resolution.approach}:global` });
   }
  }

  // CASH
  if (resolution.cashDelta > 0) {
   window.RAMoneyLedger.credit(resolution.cashDelta, { source: 'war_room:run' });
  } else if (resolution.cashDelta < 0) {
   window.RAMoneyLedger.debit(-resolution.cashDelta, { source: 'war_room:run' });
  }

  // SUPPLY: RE-UP reward (Vol 7 §3.2: "+3–6 SUPPLY")
  if (resolution.supplyDelta && resolution.supplyDelta > 0) {
   // Supply is Blood X cases: tracked in frag state
   const current = window.RAFrag.read('F04', 'supply', 0);
   window.RAFrag.patch('F04', 'supply', current + resolution.supplyDelta);
   // Each case sold lowers vampire pressure (Vol 7 §10)
   window.RAWarRoomHeat?.recordSale?.(resolution.supplyDelta);
  }

  // STREET REP: PROTECT reward (Vol 7 §3.2: "+STREET REP")
  if (resolution.rewardEffects?.includes('+STREET REP') && resolution.success) {
   window.RASocial?.streetClout?.add?.(1);
  }

  // RIVAL PRESSURE: BAIT reward (Vol 7 §3.2: "Rival Pressure −2")
  if (resolution.pressureDelta && resolution.district) {
   const current = window.RAWarRoomDistricts.pressure(resolution.district);
   const next = Math.max(0, current + resolution.pressureDelta);
   window.RAFrag.patch('F04', `districts.${resolution.district}.rivalPressure`, next);
  }

  // New stories
  for (const [ogaId, storyList] of Object.entries(resolution.newStories || {})) {
   for (const { key, line } of storyList) {
    window.RAWarRoomCrew.addStory(ogaId, key, line);
   }
  }

  // District pressure reset (successfully serviced this district tonight)
  if (resolution.success && resolution.district) {
   window.RAWarRoomDistricts.resetPressure(resolution.district);
  }

  // Log the job
  const log = window.RAFrag.read('F04', 'jobs.log', []);
  log.push({
   day: resolution.day,
   jobId: resolution.jobId,
   type: resolution.approach === 'LAY_LOW' ? 'LAY_LOW' : resolution.type,
   district: resolution.district,
   result: resolution.success ? 'success' : 'failed',
   ogas: resolution.squadIds,
   heatDelta: resolution.heatDelta,
   cashDelta: resolution.cashDelta,
   supplyDelta: resolution.supplyDelta || 0,
   pressureDelta: resolution.pressureDelta || 0,
   newStories: Object.keys(resolution.newStories || {}).length
  });
  if (log.length > 50) log.shift();
  window.RAFrag.patch('F04', 'jobs.log', log);
 }

 // ── Nightly SLOTS (Vol 7 §3.1: 1 job slot a night, 2 once 6+ Ogas are active) ─────────────────
 // F13: the board always showed SLOTS but nothing spent them, so a night could run any number of paid PLAYs / LAY LOWs.
 // A slot is spent by a job that happened tonight (a consumed PLAY or a LAY LOW in the job log). EXTRACT stays off the cap
 // (F01 R1 brake: one EXTRACT per capture group, EXTRACT off the nightly cap) and HAND BACK, the one-time closing job, is exempt.
 const OFF_CAP = ['EXTRACT'];
 function slotsUsedTonight(day = window.RALife.today().day) {
  return window.RAFrag.read('F04', 'jobs.log', [])
   .filter(e => e.day === day && !OFF_CAP.includes(e.type) && !String(e.jobId || '').startsWith('hand_back_')).length;
 }
 // Tonight's SLOTS are the number the board shows (set at WAKE from the active roster), so a PLAY that wounds an Oga does not
 // take back a slot the player was already shown.
 const slotsTonight = () => Math.max(1, Number(window.RAFrag.read('F04', 'jobs.slotsPerNight', 1)) || 1);
 function canRunTonight(jobCard) {
  const slots = slotsTonight();
  if (!jobCard) return { ok: false, reason: 'no-job', slots, used: slotsUsedTonight() };
  if (OFF_CAP.includes(jobCard.type) || jobCard.isHandBack) return { ok: true, exempt: true, slots, used: slotsUsedTonight() };
  const used = slotsUsedTonight();
  return used < slots ? { ok: true, slots, used } : { ok: false, reason: 'no-slot', slots, used };
 }

 // ── HAND BACK ────────────────────────────────────────────────────────────
 function buildHandBackJob() {
  const dist = window.RAWarRoomDistricts.usable('koreatown') ? 'koreatown' : (window.RAWarRoomDistricts.activeIds()[0] || null);
  const job = buildJobCard({ type: 'TAKE_THE_BLOCK', district: dist });
  job.id = `hand_back_${window.RAFrag.read('F04', 'handBack.startedOnDay', window.RALife.today().day)}`;
  job.isHandBack = true;
  job.label = 'HAND BACK THE BLOCKS';
  return job;
 }

 function initiateHandBack() {
  if (!window.RAFeatures.enabled('F04.war_room')) return { ok: false, reason: 'flag-off' };
  const offer = window.RAFrag.read('F04', 'offer', {});
  if (offer.status !== 'accepted') return { ok: false, reason: 'route-not-active' };
  const hb = window.RAFrag.read('F04', 'handBack', {});
  if (hb.resolved || hb.pending) return { ok: false, reason: 'already-initiated' };

  const day = window.RALife.today().day;
  window.RAFrag.patch('F04', 'handBack', { pending: true, startedOnDay: day, resolved: false });

  const handBackJob = buildHandBackJob();

  return {
   ok: true,
   job: handBackJob,
   note: 'Final job: executed by F01 THE PLAY via RAWarRoomPlay.launch. Route closes after resolution regardless of outcome.'
  };
 }

 function resolveHandBack({ outcome } = {}) {
  window.RAFrag.patch('F04', 'handBack', { pending: false, resolved: true });
  window.RAFrag.patch('F04', 'offer.status', 'closed_fame');
  window.RAFrag.patch('F04', 'active', false);
 }

 // Expose the jobs framework.
 window.RAWarRoomJobs = Object.freeze({
  JOB_TYPES,
  nightModifiers,
  buildJobCard,
  buildNightMenu,
  executeRun,
  applyRunResult,
  resolveReward,
  initiateHandBack,
  buildHandBackJob,
  resolveHandBack,
  slotsTonight,
  slotsUsedTonight,
  canRunTonight,
  _rollRange: rollRange
 });
})();
