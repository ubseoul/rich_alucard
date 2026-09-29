(function(){
 'use strict';
 // F04 — PLAYMAKERS WAR ROOM — showdown_stub.js
 // Authored setup, state, eligibility and data contracts for jobs that enter SHOWDOWN.
 // Tactical execution is F01_INTEGRATION_PENDING throughout.
 // SOURCE: Vol 7 §3.3, §5 (Showdowns), §5.6 (Rich slides in), §6.4 (GONE rules).
 //
 // F01_INTEGRATION_PENDING items (complete list at bottom of this file):
 //   1. Grid rendering (6×9 portrait grid, cover overlay, prop placement)
 //   2. Turn execution loop (Oga actions, enemy POD reveals, enemy turn)
 //   3. Hit-chance computation against enemy stats
 //   4. Rich PULL UP cutscene and field entry (from turn 3 onward)
 //   5. Rich move execution: BLOOD_BATH, VAMPIRE_BITE, OCTOPUS_BRAIN, REVENGE
 //   6. End-of-showdown result resolution (which Ogas are DOWNED/CAPTURED/GONE)
 //   7. Escalation from RUN beat failure into emergency Showdown (4-turn grid fight)
 //   8. Hand-Back final Showdown execution
 //   9. What December says in HAND BACK (sealed / HQ-only)
 //  10. Final Report Card sealed wording on fame arrival

 // ── Showdown state machine ─────────────────────────────────────────────────
 // States: IDLE | SETUP | PENDING_F01 | RESOLVING | DONE
 // Transitions managed here; tactical execution (PENDING_F01 → RESOLVING) is F01's job.
 const STATE_MACHINE = Object.freeze({
  IDLE:        'IDLE',
  SETUP:       'SETUP',
  PENDING_F01: 'PENDING_F01',   // F01_INTEGRATION_PENDING: waiting for SHOWDOWN_CORE
  RESOLVING:   'RESOLVING',
  DONE:        'DONE'
 });

 // ── Showdown eligibility ──────────────────────────────────────────────────
 function isEligible({ squadIds, carId, approach, district, jobId } = {}) {
  const errors = [];
  if (!squadIds || squadIds.length < 1) errors.push('squad required');
  if (!district) errors.push('district required');
  if (!jobId) errors.push('jobId required');
  // Squad must include only ACTIVE Ogas
  for (const id of (squadIds || [])) {
   const u = window.RACrew.get(id);
   if (!u) errors.push(`unknown oga: ${id}`);
   else if (u.status !== 'ACTIVE') errors.push(`oga ${id} is ${u.status}, not ACTIVE`);
  }
  // Car must be owned (if specified)
  if (carId && !window.RAVehicles.has(carId)) errors.push(`car ${carId} not owned`);
  return { eligible: errors.length === 0, errors };
 }

 // ── Build showdown entry packet ───────────────────────────────────────────
 // This is the complete authored data contract handed to SHOWDOWN_CORE (F01).
 function buildEntryPacket({ jobCard, squadIds, carId, approach } = {}) {
  const check = isEligible({ squadIds, carId, approach, district: jobCard?.district, jobId: jobCard?.id });
  if (!check.eligible) return { ok: false, errors: check.errors };

  const squad = (squadIds || []).map(id => {
   const u = window.RACrew.get(id);
   return {
    id: u.id,
    name: u.name,
    class: u.class,
    stories: { ...u.stories },
    bonds: { ...u.bonds },
    // Per-class action budget (Vol 7 §5.2)
    actionsPerTurn: 2,
    // Authored stats — SOURCE_REQUIRED for exact authored values; provisional scaling
    stats: buildOgaStats(u)
   };
  });

  const car = carId ? window.RAVehicles.list().find(c => c.id === carId) : null;

  const packet = {
   // Identity
   jobId: jobCard.id,
   jobType: jobCard.type,
   isHandBack: !!jobCard.isHandBack,
   district: jobCard.district,
   districtLabel: jobCard.districtLabel,
   approach,

   // Grid spec (Vol 7 §5.1)
   grid: {
    cols: 6,
    rows: 9,
    location: jobCard.showdownSetup?.location || jobCard.district
   },

   // Squad
   squad,

   // Car (Vol 7 §5.6: Rich slides in his car)
   car: car ? { id: car.id, handling: car.handling || 50, stats: car.service } : null,

   // Rich's authored stats on field (Vol 7 §5.6)
   rich: {
    hp: 12,
    canBeGone: false, // worst case: knocked down, whole squad retreats
    moves: [
     { id: 'BLOOD_BATH',      area: 3, damage: 4,  type: 'area' },
     { id: 'VAMPIRE_BITE',    range: 'adjacent', damage: 4, heal: 2, type: 'melee' },
     { id: 'OCTOPUS_BRAIN',   uses: 3, type: 'context' }, // 3 per showdown
     { id: 'REVENGE',         type: 'reflect' }
    ],
    pullUpFromTurn: 3,           // Vol 7 §5.6
    heatCostIfVisible: 15,       // Vol 7 §5.6: +15 HEAT if Rich is seen
    vgPostIfVisible: true        // Vol 7 §5.6
   },

   // Night modifiers applicable to this showdown
   modifiers: window.RAWarRoomJobs.nightModifiers(),

   // Enemy faction (Vol 7 §5.4)
   enemies: buildEnemyRoster(jobCard.type, jobCard.district),

   // What F01 must return (resolution contract)
   resolutionContract: {
    required: ['outcome','ogaResults','heatDelta','cashDelta','richUsedPullUp','richVisible'],
    ogaResultFields: ['id','finalStatus'], // ACTIVE | DOWNED | CAPTURED | GONE
    outcomes: ['victory','defeat','retreat']
   },

   // Pending marker for audit trail
   f01Pending: 'F01_INTEGRATION_PENDING'
  };

  // Persist entry state
  window.RAFrag.patch('F04', 'showdown', {
   state: STATE_MACHINE.PENDING_F01,
   packet,
   startedDay: window.RALife.today().day
  });

  return { ok: true, packet };
 }

 function buildOgaStats(unit) {
  // Provisional class-based stats. SOURCE_REQUIRED for authored numbers.
  const base = { mobility: 4, aim: 65, hp: 6, defense: 0 };
  const classBonus = {
   GHOST:   { mobility: +2, aim: +5 },
   TALKER:  { aim: +5 },
   MUSCLE:  { hp: +2, defense: +10 },
   SHOOTER: { aim: +10, mobility: -1 },
   WHEELS:  { mobility: +3 },
   DOC:     { hp: +1 }
  };
  const bonus = classBonus[unit.class] || {};
  // Story perks (Vol 7 §6.1 examples)
  let storyAimBonus = 0;
  if (unit.stories?.survived_car_wash) storyAimBonus += 5;   // +5 aim when in half cover
  if (unit.stories?.saw_95_miss)       storyAimBonus += 5;   // +5 aim, forever, out of spite
  return {
   mobility: (base.mobility + (bonus.mobility || 0)),
   aim:      Math.min(95, (base.aim + (bonus.aim || 0) + storyAimBonus)),
   hp:       (base.hp + (bonus.hp || 0)),
   defense:  (base.defense + (bonus.defense || 0))
  };
 }

 function buildEnemyRoster(jobType, district) {
  // SOURCE: Vol 7 §5.4 (Rivals / Hunters)
  // OPEN MOUTH GANG: Lil Smack's crew — matching tracksuits, green, gold fronts, always eating.
  // HUNTERS: streetwear under tactical vests, crossbows with silver bolts.
  const factions = {
   TAKE_THE_BLOCK: [
    { type: 'CHEWER',     faction: 'open_mouth_gang', count: 3 },
    { type: 'ENFORCER',   faction: 'open_mouth_gang', count: 1 }
   ],
   EXTRACT: [
    { type: 'CHEWER',     faction: 'open_mouth_gang', count: 2 },
    { type: 'LIEUTENANT', faction: 'open_mouth_gang', count: 1 }
   ],
   RETALIATION: [
    { type: 'HUNTER',     faction: 'hunters',         count: 2 },
    { type: 'HUNTER',     faction: 'hunters',         count: 1 }
   ]
  };
  return factions[jobType] || factions['TAKE_THE_BLOCK'];
 }

 // ── Resolution receiver ──────────────────────────────────────────────────
 // Called by SHOWDOWN_CORE (F01) after tactical execution completes.
 // Applies the authored outcome: status updates, heat, cash, stories.
 function receiveResolution(resolution) {
  // Validate contract
  const required = ['outcome','ogaResults','heatDelta','cashDelta'];
  for (const f of required) {
   if (resolution[f] === undefined) throw new Error(`Showdown resolution missing: ${f}`);
  }

  const { outcome, ogaResults, heatDelta, cashDelta, richUsedPullUp, richVisible } = resolution;
  const packet = window.RAFrag.read('F04', 'showdown.packet', {});

  // Apply Oga final statuses
  for (const ogaResult of (ogaResults || [])) {
   const { id, finalStatus } = ogaResult;
   if (finalStatus === 'GONE') {
    window.RAWarRoomCrew.setGone(id, { reason: 'showdown' });
   } else if (finalStatus === 'CAPTURED') {
    window.RAWarRoomCrew.setCaptured(id, { reason: 'showdown' });
   } else if (finalStatus === 'DOWNED') {
    window.RAWarRoomCrew.setDowned(id, { reason: 'showdown' });
   }
   // ACTIVE: no change needed
  }

  // Heat (including Rich visibility penalty)
  const totalHeat = heatDelta + (richVisible ? 15 : 0);
  if (totalHeat) {
   window.RAHeat.add(totalHeat, { district: packet.district, source: 'war_room:showdown' });
  }

  // Cash
  if (cashDelta > 0) {
   window.RAMoneyLedger.credit(cashDelta, { source: 'war_room:showdown' });
  } else if (cashDelta < 0) {
   window.RAMoneyLedger.debit(-cashDelta, { source: 'war_room:showdown' });
  }

  // VampGram post if Rich was visible (Vol 7 §5.6)
  if (richVisible) {
   window.RAVampGramAPI.post('whosrunla', {
    id: `showdown:rich_visible:${window.RALife.today().day}`,
    text: 'YOUNG PLAYMAKER pulled up himself. 🚗',
    likes: Math.floor(Math.random() * 50) + 20
   });
  }

  // Update showdown state
  window.RAFrag.patch('F04', 'showdown.state', STATE_MACHINE.DONE);
  window.RAFrag.patch('F04', 'showdown.resolution', resolution);

  // Hand back resolution
  const hb = window.RAFrag.read('F04', 'handBack', {});
  if (hb.pending) {
   window.RAWarRoomJobs.resolveHandBack({ outcome });
  }

  // Build and record report card
  const fakeRun = {
   type: 'showdown',
   jobId: packet.jobId,
   district: packet.district,
   approach: packet.approach,
   success: outcome === 'victory',
   cashDelta,
   heatDelta: totalHeat,
   squadIds: (ogaResults || []).map(r => r.id),
   newStories: {},
   day: window.RALife.today().day
  };
  window.RAWarRoomReportCard.record(fakeRun);

  return { ok: true, outcome };
 }

 // ── F01_INTEGRATION_PENDING registry ────────────────────────────────────
 // Machine-readable list for the handoff document and audit.
 const F01_INTEGRATION_PENDING = Object.freeze([
  { id: 'grid_render',      desc: 'War Room Showdown 6×9 portrait grid rendering + cover/prop overlay' },
  { id: 'turn_loop',        desc: 'Per-Oga 2-action turn execution loop; enemy POD reveal; enemy turn' },
  { id: 'hit_chance',       desc: 'Hit chance computation against enemy stats; crit (base 10%, ×1.5 dmg); 95%??? caption' },
  { id: 'rich_pullup',      desc: 'Rich PULL UP cutscene (turn ≥3): headlights, PLAYMAKERS drop, field entry from car' },
  { id: 'rich_moves',       desc: 'BLOOD_BATH, VAMPIRE_BITE, OCTOPUS_BRAIN (3 context uses), REVENGE — execution on grid' },
  { id: 'showdown_end',     desc: 'End-of-showdown Oga status resolution (DOWNED→CARRY→EXTRACT zone; LEFT_BEHIND→CAPTURED)' },
  { id: 'escalation',       desc: 'RUN beat failure escalation to emergency 4-turn grid fight' },
  { id: 'handback_exec',    desc: 'HAND BACK THE BLOCKS final Showdown tactical execution' },
  { id: 'december_handback',desc: 'What December says in HAND BACK — SEALED / HQ-only' },
  { id: 'fame_report_seal', desc: 'Final report card sealed wording on fame arrival — SEALED / HQ-only' }
 ]);

 window.RAWarRoomShowdown = Object.freeze({
  STATE_MACHINE,
  isEligible,
  buildEntryPacket,
  receiveResolution,
  F01_INTEGRATION_PENDING,
  currentState: () => window.RAFrag.read('F04', 'showdown.state', STATE_MACHINE.IDLE)
 });
})();
