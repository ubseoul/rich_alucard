(function(){
 'use strict';
 // F04 — PLAYMAKERS WAR ROOM — heat_config.js
 // Configures RAHeat with Vol 7 authored context and registers the vampire pressure connection.
 //
 // SOURCE_REQUIRED NOTE (from RAHeat source code and IF-1 spine §4F):
 // "Vol 7 numeric tier floors are not in the OPEN repository."
 // The floors shipped by RAHeat are provisional engineering placeholders.
 // THIS FILE does NOT override them — that requires authored numbers from the owner.
 // We call configure() only to mark provisional=false AFTER the owner supplies canonical floors.
 // Until then, provisional remains true and no canonical floors are touched.
 //
 // SOURCE: Vol 7 §10 — "every case of Blood X sold lowers city vampire pressure slightly
 // (vampires hunt less) while HEAT rises — two meters pulling opposite directions."

 if (!window.RAFeatures?.get('F04.war_room')) return;

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
  const next = Math.max(0, current - casesCount * 2); // provisional; authored delta SOURCE_REQUIRED
  window.RAFrag.patch('F04', VP_PATH, next);
 }

 window.RAWarRoomHeat = Object.freeze({
  recordSale,
  vampirePressure: () => window.RAFrag.read('F04', VP_PATH, 50),
  // Expose for testing / UI
  snapshot: () => ({
   heat: window.RAHeat.snapshot(),
   vampirePressure: window.RAFrag.read('F04', VP_PATH, 50),
   crisis: !!window.RAFrag.read('F04', 'heat_crisis', false)
  })
 });
})();
