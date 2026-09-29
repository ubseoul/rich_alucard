(function(){
 'use strict';
 // F04 — PLAYMAKERS WAR ROOM — jobs.js
 // The full jobs framework: authored RUN job types + SHOWDOWN stubs.
 // SOURCE: Vol 7 §3.2 (job menu), §3.3 (RUNS vs SHOWDOWNS), §4 (RUN SEQUENCES).
 //
 // SHOWDOWN BOUNDARY: Jobs of type TAKE_THE_BLOCK, EXTRACT, and retaliation raids
 // have their authored setup, state, eligibility and entry hooks implemented here,
 // but tactical execution is marked F01_INTEGRATION_PENDING.

 if (!window.RAFeatures?.get('F04.war_room')) return;

 // ── Job type catalogue (Vol 7 §3.2) ──────────────────────────────────────────
 // RUN types (resolve as RUN SEQUENCE — non-Showdown):
 //   DROP, RE_UP, COLLECT, PROTECT, BAIT
 // SHOWDOWN types (full tactical battle — F01_INTEGRATION_PENDING for final execution):
 //   TAKE_THE_BLOCK, EXTRACT (+ retaliation raids)
 const JOB_TYPES = Object.freeze({
  // RUN types
  DROP:         { kind: 'run',      label: 'DROP' },
  RE_UP:        { kind: 'run',      label: 'RE-UP' },
  COLLECT:      { kind: 'run',      label: 'COLLECT' },
  PROTECT:      { kind: 'run',      label: 'PROTECT' },
  BAIT:         { kind: 'run',      label: 'BAIT' },
  // SHOWDOWN types
  TAKE_THE_BLOCK: { kind: 'showdown', label: 'TAKE THE BLOCK' },
  EXTRACT:      { kind: 'showdown', label: 'EXTRACT' },
  RETALIATION:  { kind: 'showdown', label: 'RETALIATION RAID' }
 });

 // ── Night modifier table (Vol 7 §3.2) ──────────────────────────────────────
 function nightModifiers() {
  const life = window.RALife.today();
  const day = life.day;
  const mods = [];
  // RAIN: stealth +10%, WHEELS -10%
  if (window.RAState.get().life?.world?.rain) {
   mods.push({ id: 'rain', label: 'RAIN', stealth: +10, wheels: -10 });
  }
  // FULL MOON: werewolf trouble on Inglewood jobs
  if (day % 28 === 0) { // placeholder; actual moon cycle from life_clock if available
   mods.push({ id: 'full_moon', label: 'FULL MOON', inglewood_penalty: true });
  }
  // FRIDAY: demand ×1.5, heat ×1.5
  const weekday = ((day - 1) % 7); // 0=Mon … 6=Sun; 4=Fri (placeholder)
  if (weekday === 4) {
   mods.push({ id: 'friday', label: 'FRIDAY', demand_mult: 1.5, heat_mult: 1.5 });
  }
  // OFFICER NODD ON PATROL: any WHEELS job +10% risk
  const nodd = window.RAState.get().life?.world?.flags?.noddOnPatrol;
  if (nodd) {
   mods.push({ id: 'officer_nodd', label: 'OFFICER NODD ON PATROL', wheels_risk: +10 });
  }
  // HOT DISTRICT: heat ×2 (checked per district in job generation)
  return mods;
 }

 // ── RUN SEQUENCE resolution ─────────────────────────────────────────────────
 // Vol 7 §4: 3–4 decision beats, each with 2–3 choices driven by squad composition.
 // Approach: QUIET | LOUD | OCTOPUS_BRAIN
 const APPROACHES = Object.freeze(['QUIET', 'LOUD', 'OCTOPUS_BRAIN']);

 // Authored beat pool (Vol 7 §4 examples + genre patterns).
 // Each beat: {id, text, options: [{label, stat, baseOdds, heatDelta, cashMod, notes}]}
 // Odds are computed from the squad's actual stats — shown to the player honestly (Vol 7 §5.3).
 function beatOdds(base, squad, stat) {
  // Each Oga with the matching class adds a bonus; stories add +5 each (Vol 7 §6.1).
  let bonus = 0;
  for (const oga of squad) {
   if (oga.class === stat) bonus += 10;
   // Count active stories for this Oga
   const storyCount = Object.keys(oga.stories || {}).length;
   bonus += storyCount * 2; // minor; authored story perks are per-perk in crew.js
  }
  return Math.min(98, Math.max(5, base + bonus));
 }

 // Beat library (subset — enough for a full 3-job rotation).
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

 // ── Job card builder ──────────────────────────────────────────────────────
 // Builds a job card object (shown in the War Room UI).
 // Vol 7 §3.2: "DISTRICT · TYPE · SQUAD SIZE · ODDS · REWARD · HEAT · MODIFIERS · who's recommended"
 function buildJobCard({ type, district, squadSize = 2, approach = 'LOUD', night = null }) {
  const distDef = window.RADistricts.get(district);
  if (!distDef) return null;
  const isShowdown = JOB_TYPES[type]?.kind === 'showdown';
  const mods = night || nightModifiers();
  const heat_mult = mods.find(m => m.heat_mult)?.heat_mult || 1;
  const distHeat = window.RAHeat.district(district);
  const isHotDistrict = window.RAHeat.tierFor(distHeat) === 'HOT' || window.RAHeat.tierFor(distHeat) === 'ON FIRE';

  return {
   id: `${district}_${type}_${window.RALife.today().day}`,
   type,
   kind: JOB_TYPES[type]?.kind || 'run',
   district,
   districtLabel: distDef.label,
   squadSize,
   approach,
   modifiers: mods,
   heat_mult: isHotDistrict ? heat_mult * 2 : heat_mult,
   isShowdown,
   // For showdown jobs: authored setup data (tactical execution is F01_INTEGRATION_PENDING)
   showdownSetup: isShowdown ? buildShowdownSetup({ type, district }) : null,
   recommended: recommendedClasses(type),
   label: JOB_TYPES[type]?.label || type
  };
 }

 function recommendedClasses(type) {
  const map = {
   DROP: ['GHOST', 'TALKER'],
   RE_UP: ['WHEELS', 'MUSCLE'],
   COLLECT: ['MUSCLE', 'TALKER'],
   PROTECT: ['MUSCLE', 'SHOOTER'],
   BAIT: ['TALKER', 'GHOST'],
   TAKE_THE_BLOCK: ['MUSCLE', 'SHOOTER'],
   EXTRACT: ['DOC', 'GHOST'],
   RETALIATION: ['MUSCLE', 'SHOOTER']
  };
  return map[type] || [];
 }

 // ── SHOWDOWN setup stubs (F01_INTEGRATION_PENDING) ─────────────────────
 // SOURCE: Vol 7 §3.3, §5
 // These produce authored state/data for hand-off to SHOWDOWN_CORE.
 // The grid, turn execution and resolution are F01_INTEGRATION_PENDING.
 function buildShowdownSetup({ type, district }) {
  return {
   // Authored location description (Vol 7 §5.1)
   location: {
    TAKE_THE_BLOCK: `${district.replace(/_/g,' ')} — contested corner`,
    EXTRACT:        `${district.replace(/_/g,' ')} — hostile zone`,
    RETALIATION:    'the castle\'s own halls'
   }[type] || district,
   gridSize: { cols: 6, rows: 9 }, // Vol 7 §5.1: 6×9 portrait grid
   // F01_INTEGRATION_PENDING: grid, cover, enemy pods, turn execution, result
   f01Pending: 'F01_INTEGRATION_PENDING',
   // Entry hook contract (to be called by SHOWDOWN_CORE when F01 is integrated)
   entryContract: {
    requiredFields: ['squadIds', 'carId', 'approach', 'district', 'jobId'],
    richCanPullUp: true,          // Vol 7 §5.6
    pullUpFrom: 'turn_3',
    richStats: {
     hp: 12,
     moves: ['BLOOD_BATH','VAMPIRE_BITE','OCTOPUS_BRAIN','REVENGE'] // Vol 7 §5.6
    }
   },
   // Resolution interface (what SHOWDOWN_CORE must return to the War Room)
   resolutionContract: {
    fields: ['outcome','ogas_status','heat_delta','cash_delta','stories','rich_used_pullup','rich_visible']
   }
  };
 }

 // ── RUN SEQUENCE executor ─────────────────────────────────────────────────
 // Resolves a run (non-Showdown) job through 3–4 beat decisions.
 // Called by the War Room phone app when a job is confirmed.
 // Returns a resolution object that feeds into report_card.js.
 function executeRun({ jobCard, squad, carId, approach, playerChoices }) {
  // playerChoices: array of {beatId, optionIndex}
  const results = [];
  let cashDelta = 0;
  let heatDelta = 0;
  let success = true;
  let escalatedToShowdown = false;
  const newStories = {};

  const mods = jobCard.modifiers || [];
  const fraudMult = mods.find(m => m.heat_mult)?.heat_mult || 1;

  // Select beats for this run (3 for QUIET, 4 for LOUD; OCTOPUS_BRAIN uses special beats)
  const beatCount = approach === 'LOUD' ? 4 : 3;
  const beats = selectBeats(jobCard.type, beatCount);

  for (let i = 0; i < beats.length; i++) {
   const beat = beats[i];
   const choice = playerChoices?.[i];
   const option = choice != null ? beat.options[choice.optionIndex] : beat.options[0];
   if (!option) { success = false; break; }

   // Compute odds
   const odds = option.stat ? beatOdds(option.baseOdds, squad, option.stat) : option.baseOdds;

   // Roll (deterministic in tests; live uses Math.random)
   const roll = typeof window._testRoll === 'function'
    ? window._testRoll(beat.id, i)
    : Math.floor(Math.random() * 100) + 1;
   const passed = roll <= odds;

   results.push({ beatId: beat.id, optionLabel: option.label, odds, roll, passed });

   if (!passed) {
    // Beat failure
    if (option.splitSquad) {
     // Each Oga rolls alone — simplified: 50% chance each
     for (const oga of squad) {
      const ogaRoll = Math.floor(Math.random() * 100) + 1;
      if (ogaRoll > 50) {
       // Oga at risk
       window.RAWarRoomCrew.setDowned(oga.id, { reason: `beat_fail_${beat.id}` });
      }
     }
    }
    // Bad beat can escalate to Showdown (Vol 7 §4: "Complications can escalate...")
    if (Math.random() < 0.2 && jobCard.kind !== 'showdown') {
     escalatedToShowdown = true;
     // F01_INTEGRATION_PENDING: escalation leads to emergency Showdown
     success = false;
     break;
    }
    heatDelta += Math.round(2 * fraudMult);
    if (!option.abort) success = false;
    if (option.abort) break;
   } else {
    // Passed — accumulate results
    cashDelta += option.cashMod || 0;
    heatDelta += Math.round((option.heatDelta || 0) * fraudMult);

    // Story opportunity: first time passing a beat with this stat earns a story
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

  // Base cash reward for successful run
  if (success && !escalatedToShowdown) {
   cashDelta += baseReward(jobCard.type, jobCard.district);
   // Record jobs-together for bond tracking
   for (let a = 0; a < squad.length; a++) {
    for (let b = a + 1; b < squad.length; b++) {
     window.RAWarRoomCrew.recordJobTogether(squad[a].id, squad[b].id);
    }
   }
   // Vehicle drive count
   if (carId) window.RAVehicles?.recordDrive?.(carId, { by: 1 });
  }

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
   cashDelta,
   heatDelta,
   newStories,
   squadIds: squad.map(o => o.id),
   carId,
   day: window.RALife.today().day
  };
 }

 function selectBeats(type, count) {
  // Rotate through the library deterministically based on type hash
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

 function baseReward(type, district) {
  // Authored base cash by type. SOURCE_REQUIRED: authored numbers not in OPEN; provisional.
  const base = { DROP: 8000, RE_UP: 6000, COLLECT: 10000, PROTECT: 7000, BAIT: 5000 };
  const distMult = { koreatown: 1.2, arts_district: 1.5, inglewood: 1.0 };
  return Math.round((base[type] || 5000) * (distMult[district] || 1));
 }

 // ── Night job menu builder ───────────────────────────────────────────────
 // Produces 2–4 job cards for tonight (Vol 7 §3.1).
 function buildNightMenu() {
  const activeDistricts = window.RADistricts.list()
   .filter(d => d.fragment === 'F04' && d.state !== 'CONTROLLED' || d.holder === 'rich');
  const cards = [];

  for (const dist of activeDistricts) {
   // One run job per controlled/contested district
   const runType = pickRunType(dist.id);
   cards.push(buildJobCard({ type: runType, district: dist.id }));

   // Roughly 1-in-4 chance of a Showdown job (Vol 7 §3.3)
   const day = window.RALife.today().day;
   const showdownSeed = (day * 7 + dist.id.charCodeAt(0)) % 4;
   if (showdownSeed === 0) {
    cards.push(buildJobCard({ type: 'TAKE_THE_BLOCK', district: dist.id }));
   }
  }

  // EXTRACT jobs for any CAPTURED Ogas (Vol 7 §5.7: expires in 3 nights)
  const captured = window.RACrew.list({ status: 'CAPTURED', fragment: 'F04' });
  for (const oga of captured) {
   const timer = oga.timers?.extract_window;
   if (timer) {
    cards.push(buildJobCard({ type: 'EXTRACT', district: extractDistrict(oga.id) }));
   }
  }

  return cards.slice(0, 4); // max 4 per night
 }

 function pickRunType(districtId) {
  const types = ['DROP', 'RE_UP', 'COLLECT', 'PROTECT'];
  const day = window.RALife.today().day;
  return types[(day + districtId.charCodeAt(0)) % types.length];
 }

 function extractDistrict(ogaId) {
  // Look up where the Oga was captured (stored in job log)
  const log = window.RAFrag.read('F04', 'jobs.log', []);
  const entry = [...log].reverse().find(e => e.ogas?.includes(ogaId) && e.result === 'captured');
  return entry?.district || 'koreatown'; // fallback
 }

 // ── Apply run resolution to world state ─────────────────────────────────
 function applyRunResult(resolution) {
  if (!resolution) return;

  // Heat
  if (resolution.heatDelta) {
   window.RAHeat.add(resolution.heatDelta, { district: resolution.district, source: 'war_room:run' });
   // Also adjust global heat for being seen (Vol 7 §10)
   window.RAHeat.add(Math.round(resolution.heatDelta * 0.3), { source: 'war_room:run:global' });
  }

  // Cash
  if (resolution.cashDelta) {
   if (resolution.cashDelta > 0) {
    window.RAMoneyLedger.credit(resolution.cashDelta, { source: 'war_room:run' });
    window.RAState.patch('life.resources.money',
     (window.RAState.get().life.resources.money || 0) + resolution.cashDelta);
   } else {
    window.RAMoneyLedger.debit(-resolution.cashDelta, { source: 'war_room:run' });
    window.RALife.spend?.(-resolution.cashDelta);
   }
  }

  // New stories
  for (const [ogaId, storyList] of Object.entries(resolution.newStories || {})) {
   for (const { key, line } of storyList) {
    window.RAWarRoomCrew.addStory(ogaId, key, line);
   }
  }

  // District pressure reset (successfully serviced this district tonight)
  if (resolution.success) {
   window.RAWarRoomDistricts.resetPressure(resolution.district);
  }

  // Log the job
  const log = window.RAFrag.read('F04', 'jobs.log', []);
  log.push({
   day: resolution.day,
   jobId: resolution.jobId,
   type: resolution.type,
   district: resolution.district,
   result: resolution.success ? 'success' : 'failed',
   ogas: resolution.squadIds,
   heatDelta: resolution.heatDelta,
   cashDelta: resolution.cashDelta,
   newStories: Object.keys(resolution.newStories || {}).length
  });
  if (log.length > 50) log.shift();
  window.RAFrag.patch('F04', 'jobs.log', log);

  // VampGram: notable runs may generate a report card post (handled by report_card.js)
 }

 // ── HAND BACK ────────────────────────────────────────────────────────────
 // Vol 7 §9: Rich goes to December and HAND BACK THE BLOCKS.
 // One final SHOWDOWN job; after it the route closes.
 // Rich keeps money, cars, stories and surviving Ogas.
 function initiateHandBack() {
  if (!window.RAFeatures.enabled('F04.war_room')) return { ok: false, reason: 'flag-off' };
  const offer = window.RAFrag.read('F04', 'offer', {});
  if (offer.status !== 'accepted') return { ok: false, reason: 'route-not-active' };
  const hb = window.RAFrag.read('F04', 'handBack', {});
  if (hb.resolved || hb.pending) return { ok: false, reason: 'already-initiated' };

  const day = window.RALife.today().day;
  window.RAFrag.patch('F04', 'handBack', { pending: true, startedOnDay: day, resolved: false });

  // Build the hand-back Showdown job card
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
  // Called after the hand-back Showdown resolves (or after F01 integration).
  window.RAFrag.patch('F04', 'handBack', { pending: false, resolved: true });
  window.RAFrag.patch('F04', 'offer.status', 'closed_fame');
  window.RAFrag.patch('F04', 'active', false);
  // Rich keeps his money, cars, stories and surviving Ogas — nothing is reset.
  // Heat decays normally (Vol 7 §9).
  // What December says is sealed (Vol 7 §9).
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
  initiateHandBack,
  resolveHandBack,
  // For test access
  _beatLibrary: BEAT_LIBRARY,
  _baseReward: baseReward
 });
})();
