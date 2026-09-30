(function(){
 'use strict';
 // F04 — PLAYMAKERS WAR ROOM — heat_config.js
 // Registers the War Room HEAT tier listener and the vampire pressure connection (Vol 7 §10).
 //
 // HEAT FLOORS — AUTHORED, Vol 7 §8 (COOL 0–29, WARM 30–59, HOT 60–84, ON FIRE 85+) are configured by the shared,
 // integration-owned RAHeatFloors (js/if1/heat_floors.js), the single owner for F04 and F05. This file never calls
 // RAHeat.configure().
 //
 // SOURCE: Vol 7 §10 — "every case of Blood X sold lowers city vampire pressure slightly
 // (vampires hunt less) while HEAT rises — two meters pulling opposite directions."

 if (!window.RAFeatures?.get('F04.war_room')) return;

 // ── HEAT tier floors ─────────────────────────────────────────────────────
 // FCPB convergence: the authored floors are configured by ONE integration-owned module, RAHeatFloors (js/if1/heat_floors.js),
 // shared with F05. F04 no longer calls RAHeat.configure(); ensure() applies them (idempotently) while this fragment is ON.
 window.RAHeatFloors.ensure();

 // Register a heat tier-change listener for War Room effects.
 window.RAHeat.onTierChange(event => {
  if (!window.RAFeatures.enabled('F04.war_room')) return;
  const { scope, to, from, direction } = event;

  // HOT DISTRICT effect (Vol 7 §3.2): heat ×2 on jobs in a hot district.
  // This is communicated through the night modifiers in jobs.js; no extra action needed here.

  // GLOBAL ON FIRE: add visual cue flag (read by the phone app UI).
  if (scope === 'global' && to === 'ON FIRE') {
   window.RAFrag.patch('F04', 'heat_crisis', true);
  }
  if (scope === 'global' && to === 'COOL' && direction === 'down') {
   window.RAFrag.patch('F04', 'heat_crisis', false);
  }
 });

 // Vampire pressure hook (Vol 7 §10).
 // Each Blood X case sold through War Room lowers global vampire pressure.
 // "Vampire pressure" is tracked as a F04 frag value (not a canon system from another fragment).
 const VP_PATH = 'vampirePressure';
 function recordSale(casesCount = 1) {
  if (!window.RAFeatures.enabled('F04.war_room')) return;
  const current = window.RAFrag.read('F04', VP_PATH, 50); // starts at 50 (midpoint)
  const next = Math.max(0, current - casesCount * 2);
  window.RAFrag.patch('F04', VP_PATH, next);
 }

 window.RAWarRoomHeat = Object.freeze({
  recordSale,
  vampirePressure: () => window.RAFrag.read('F04', VP_PATH, 50),
  // true when the shared owner (RAHeatFloors) has configured the authored floors
  configured: () => window.RAHeatFloors.applied(),
  // Authored floor constants exposed for tests and UI.
  AUTHORED_FLOORS: window.RAHeatFloors.FLOORS,
  // Expose for testing / UI
  snapshot: () => ({
   heat: window.RAHeat.snapshot(),
   vampirePressure: window.RAFrag.read('F04', VP_PATH, 50),
   crisis: !!window.RAFrag.read('F04', 'heat_crisis', false)
  })
 });
})();
