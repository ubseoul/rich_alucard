(function(){
 'use strict';
 // F04 — PLAYMAKERS WAR ROOM — jobs.js
 // The full jobs framework: authored RUN job types + SHOWDOWN stubs.
 // SOURCE: Vol 7 §3.2 (job menu, authored reward/heat tables), §3.3 (RUNS vs SHOWDOWNS),
 //         §4 (RUN SEQUENCES), §8 (strategy test).
 //
 // SHOWDOWN BOUNDARY: Jobs of type TAKE_THE_BLOCK, EXTRACT, and retaliation raids
 // have their authored setup, state, eligibility and entry hooks implemented here,
 // but tactical execution is marked F01_INTEGRATION_PENDING.

 if (!window.RAFeatures?.get('F04.war_room')) return;

 // ── Job type catalogue — Vol 7 §3.2 (authored) ─────────────────────────
 // RUN types (resolve as RUN SEQUENCE — non-Showdown):
 //   DROP, RE_UP, COLLECT, PROTECT, BAIT, LAY_LOW
 // SHOWDOWN types (full tactical battle — F01_INTEGRATION_PENDING):
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
   squadSize: 3,
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
  EXTRACT:        { kind: 'showdown', label: 'EXTRACT',         squadSize: 2, reward: { type: 'showdown' }, heat: 0 },
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

 // ── RUN SEQUENCE resolution ─────────────────────────────────────────────
 // Vol 7 §4: 3–4 decision beats, each with 2–3 choices driven by squad composition.
 // Approach: QUIET | LOUD | OCTOPUS_BRAIN
 const APPROACHES = Object.freeze(['QUIET', 'LOUD', 'OCTOPUS_BRAIN']);

 // Beat pool (Vol 7 §4 examples + genre patterns).
 function beatOdds(base, squad, stat) {
  let bonus = 0;
  for (const oga of squad) {
   if (oga.class === stat) bonus += 10;
   const storyCount = Object.keys(oga.stories || {}).length;
   bonus += storyCount * 2;
  }
  return Math.min(98, Math.max(5, base + bonus));
 }

 const BEAT_LIBRARY = [
  {
   id: 'beat_doorman',
   text: 'THE DOORMAN WANTS MORE.',
   options: [
    { label: 'TALK', stat: 'TALKER', baseOdds: 68 },
    { label: 'PAY ($3K)', stat: null, baseOdds: 100, cashMod: -3000, repNote: 'loses STREET REP' },
    { label: 'LEAN ON HIM', stat: 'MUSCLE', baseOdds: 54, heatDelta: 1 }
   ]
  },
  {
   id: 'beat_headlights',
   text: 'HEADLIGHTS BEHIND YOU.',
   options: [
    { label: 'LOSE THEM', stat: 'WHEELS', baseOdds: 65 },
    { label: 'PULL OVER CALM', stat: 'TALKER', baseOdds: 70 },
    { label: 'SPLIT UP', stat: null, baseOdds: 50, splitSquad: true }
   ]
  },
  {
   id: 'beat_corner_lookout',
   text: 'RIVAL LOOKOUT CLOCKING THE CORNER.',
   options: [
    { label: 'GHOST PAST', stat: 'GHOST', baseOdds: 72 },
    { label: 'BRIBE', stat: null, baseOdds: 100, cashMod: -1500 },
    { label: 'SEND MUSCLE', stat: 'MUSCLE', baseOdds: 60, heatDelta: 2 }
   ]
  },
  {
   id: 'beat_buyer_cold',
   text: 'BUYER GOING COLD.',
   options: [
    { label: 'DRE TALKS HIM BACK', stat: 'TALKER', baseOdds: 74 },
    { label: 'SHOW THE PRODUCT', stat: null, baseOdds: 80, heatDelta: 1 },
    { label: 'WALK — COME BACK TOMORROW', stat: null, baseOdds: 100, cashMod: 0, delayNote: true }
   ]
  },
  {
   id: 'beat_doc_needed',
   text: 'SOMEONE GOT CLIPPED. NEED A DOC.',
   options: [
    { label: 'AUNTIE GRIT PATCHES IT', stat: 'DOC', baseOdds: 88 },
    { label: 'PUSH THROUGH', stat: null, baseOdds: 100, crewRisk: 'injured' },
    { label: 'ABORT', stat: null, baseOdds: 100, abort: true }
   ]
  }
 ];

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
 function buildJobCard({ type, district, approach = 'LOUD', night = null }) {
  const typeDef = JOB_TYPES[type];
  if (!typeDef) return null;
  const distDef = window.RADistricts.get(district);
  const isShowdown = typeDef.kind === 'showdown';
  const mods = night || nightModifiers();
  const heat_mult = mods.find(m => m.heat_mult)?.heat_mult || 1;
  const distHeat = district ? window.RAHeat.district(district) : 0;
  const isHotDistrict = window.RAHeat.tierFor(distHeat) === 'HOT' || window.RAHeat.tierFor(distHeat) === 'ON FIRE';

  return {
   id: `${district || 'global'}_${type}_${window.RALife.today().day}`,
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
   showdownSetup: isShowdown ? buildShowdownSetup({ type, district }) : null,
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

 // ── SHOWDOWN setup stubs (F01_INTEGRATION_PENDING) ─────────────────────
 function buildShowdownSetup({ type, district }) {
  return {
   location: {
    TAKE_THE_BLOCK: `${(district||'').replace(/_/g,' ')} — contested corner`,
    EXTRACT:        `${(district||'').replace(/_/g,' ')} — hostile zone`,
    RETALIATION:    'the castle\'s own halls'
   }[type] || district,
   gridSize: { cols: 6, rows: 9 },
   f01Pending: 'F01_INTEGRATION_PENDING',
   entryContract: {
    requiredFields: ['squadIds', 'carId', 'approach', 'district', 'jobId'],
    richCanPullUp: true,
    pullUpFrom: 'turn_3',
    richStats: { hp: 12, moves: ['BLOOD_BATH','VAMPIRE_BITE','OCTOPUS_BRAIN','REVENGE'] }
   },
   resolutionContract: {
    fields: ['outcome','ogas_status','heat_delta','cash_delta','stories','rich_used_pullup','rich_visible']
   }
  };
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

 // ── RUN SEQUENCE executor ─────────────────────────────────────────────────
 function executeRun({ jobCard, squad, carId, approach, playerChoices }) {
  const typeDef = JOB_TYPES[jobCard.type];
  const results = [];
  let beatCashDelta = 0;
  let beatHeatDelta = 0;
  let success = true;
  let escalatedToShowdown = false;
  const newStories = {};

  const mods = jobCard.modifiers || [];
  const heatMult = mods.find(m => m.heat_mult)?.heat_mult || 1;

  // LAY LOW: no beats, no squad. Immediate resolution.
  if (jobCard.type === 'LAY_LOW') {
   const reward = resolveReward(typeDef, jobCard.district, window.RALife.today().day);
   return {
    type: 'run',
    jobId: jobCard.id,
    district: jobCard.district,
    approach: 'LAY_LOW',
    success: true,
    escalatedToShowdown: false,
    escalatedShowdownSetup: null,
    f01Pending: null,
    beats: [],
    cashDelta: reward.cashDelta,
    heatDelta: reward.heatDelta,
    supplyDelta: reward.supplyDelta || 0,
    pressureDelta: reward.pressureDelta || 0,
    rewardEffects: reward.effects,
    newStories: {},
    squadIds: [],
    carId: null,
    day: window.RALife.today().day
   };
  }

  // Normal run: 3–4 beats
  const beatCount = approach === 'LOUD' ? 4 : 3;
  const beats = selectBeats(jobCard.type, beatCount);

  for (let i = 0; i < beats.length; i++) {
   const beat = beats[i];
   const choice = playerChoices?.[i];
   const option = choice != null ? beat.options[choice.optionIndex] : beat.options[0];
   if (!option) { success = false; break; }

   const odds = option.stat ? beatOdds(option.baseOdds, squad, option.stat) : option.baseOdds;
   const roll = typeof window._testRoll === 'function'
    ? window._testRoll(beat.id, i)
    : Math.floor(Math.random() * 100) + 1;
   const passed = roll <= odds;

   results.push({ beatId: beat.id, optionLabel: option.label, odds, roll, passed });

   if (!passed) {
    if (option.splitSquad) {
     for (const oga of squad) {
      const ogaRoll = Math.floor(Math.random() * 100) + 1;
      if (ogaRoll > 50) {
       window.RAWarRoomCrew.setDowned(oga.id, { reason: `beat_fail_${beat.id}` });
      }
     }
    }
    if (Math.random() < 0.2 && jobCard.kind !== 'showdown') {
     escalatedToShowdown = true;
     success = false;
     break;
    }
    beatHeatDelta += Math.round(2 * heatMult);
    if (!option.abort) success = false;
    if (option.abort) break;
   } else {
    beatCashDelta += option.cashMod || 0;
    beatHeatDelta += Math.round((option.heatDelta || 0) * heatMult);

    if (option.stat && squad.length > 0) {
     const heroOga = squad.find(o => o.class === option.stat) || squad[0];
     const storyKey = `beat_${beat.id}`;
     if (!heroOga.stories?.[storyKey]) {
      const storyLine = storyLineFor(beat.id, heroOga);
      newStories[heroOga.id] = newStories[heroOga.id] || [];
      newStories[heroOga.id].push({ key: storyKey, line: storyLine });
     }
    }
   }
  }

  // Authored reward resolution on success (Vol 7 §3.2)
  const reward = success && !escalatedToShowdown
   ? resolveReward(typeDef, jobCard.district, window.RALife.today().day)
   : { cashDelta: 0, heatDelta: 0, supplyDelta: 0, pressureDelta: 0, effects: [] };

  if (success && !escalatedToShowdown) {
   for (let a = 0; a < squad.length; a++) {
    for (let b = a + 1; b < squad.length; b++) {
     window.RAWarRoomCrew.recordJobTogether(squad[a].id, squad[b].id);
    }
   }
   if (carId) window.RAVehicles?.recordDrive?.(carId, { by: 1 });
  }

  // Total HEAT: authored job heat + beat heat adjustments
  const totalHeat = Math.round((reward.heatDelta + beatHeatDelta) * (jobCard.heat_mult || 1));
  // Total cash: authored reward + beat cash adjustments
  const totalCash = reward.cashDelta + beatCashDelta;

  return {
   type: 'run',
   jobId: jobCard.id,
   district: jobCard.district,
   approach,
   success,
   escalatedToShowdown,
   escalatedShowdownSetup: escalatedToShowdown ? buildShowdownSetup({ type: jobCard.type, district: jobCard.district }) : null,
   f01Pending: escalatedToShowdown ? 'F01_INTEGRATION_PENDING' : null,
   beats: results,
   cashDelta: totalCash,
   heatDelta: totalHeat,
   supplyDelta: reward.supplyDelta || 0,
   pressureDelta: reward.pressureDelta || 0,
   rewardEffects: reward.effects,
   newStories,
   squadIds: squad.map(o => o.id),
   carId,
   day: window.RALife.today().day
  };
 }

 function selectBeats(type, count) {
  const seed = type.charCodeAt(0) + (type.charCodeAt(1) || 0);
  const out = [];
  for (let i = 0; i < count; i++) {
   out.push(BEAT_LIBRARY[(seed + i) % BEAT_LIBRARY.length]);
  }
  return out;
 }

 function storyLineFor(beatId, oga) {
  const lines = {
   beat_doorman:       `talked the door (${oga.name})`,
   beat_headlights:    `lost them on the 10`,
   beat_corner_lookout:`ghosted the corner`,
   beat_buyer_cold:    `closed the deal cold`,
   beat_doc_needed:    `kept it together`
  };
  return lines[beatId] || `survived the run`;
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
    cards.push(buildJobCard({ type: 'EXTRACT', district: extractDistrict(oga.id) }));
   }
  }

  // District jobs (RUN or SHOWDOWN)
  const activeDistricts = window.RADistricts.list()
   .filter(d => d.fragment === 'F04' && (d.state !== 'CONTROLLED' || d.holder === 'rich'));

  for (const dist of activeDistricts) {
   if (cards.length >= 3) break; // keep room for LAY LOW within 4 total jobs
   const day = window.RALife.today().day;
   const showdownSeed = (day * 7 + dist.id.charCodeAt(0)) % 4;
   if (showdownSeed === 0) {
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
  return entry?.district || 'koreatown';
 }

 // ── Apply run resolution to world state ─────────────────────────────────
 function applyRunResult(resolution) {
  if (!resolution) return;

  // HEAT: authored per-type delta, already computed in resolution.heatDelta
  if (resolution.heatDelta) {
   if (resolution.district) {
    window.RAHeat.add(resolution.heatDelta, { district: resolution.district, source: `war_room:${resolution.approach}` });
   }
   // Global heat contribution (scaled fraction of district heat for visibility)
   const globalDelta = Math.round(Math.abs(resolution.heatDelta) * 0.3) * Math.sign(resolution.heatDelta);
   if (globalDelta) {
    window.RAHeat.add(globalDelta, { source: `war_room:${resolution.approach}:global` });
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

 // ── HAND BACK ────────────────────────────────────────────────────────────
 function initiateHandBack() {
  if (!window.RAFeatures.enabled('F04.war_room')) return { ok: false, reason: 'flag-off' };
  const offer = window.RAFrag.read('F04', 'offer', {});
  if (offer.status !== 'accepted') return { ok: false, reason: 'route-not-active' };
  const hb = window.RAFrag.read('F04', 'handBack', {});
  if (hb.resolved || hb.pending) return { ok: false, reason: 'already-initiated' };

  const day = window.RALife.today().day;
  window.RAFrag.patch('F04', 'handBack', { pending: true, startedOnDay: day, resolved: false });

  const handBackJob = buildJobCard({ type: 'TAKE_THE_BLOCK', district: 'koreatown' });
  handBackJob.id = `hand_back_${day}`;
  handBackJob.isHandBack = true;
  handBackJob.label = 'HAND BACK THE BLOCKS';

  return {
   ok: true,
   job: handBackJob,
   note: 'Final Showdown: F01_INTEGRATION_PENDING for tactical execution. Route closes after resolution regardless of outcome.'
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
  APPROACHES,
  nightModifiers,
  buildJobCard,
  buildNightMenu,
  executeRun,
  applyRunResult,
  resolveReward,
  initiateHandBack,
  resolveHandBack,
  _beatLibrary: BEAT_LIBRARY,
  _rollRange: rollRange
 });
})();
