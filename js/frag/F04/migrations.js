(function(){
 'use strict';
 // F04 — PLAYMAKERS WAR ROOM — migrations.js
 // Loaded BEFORE js/engine/state.js via the glob {"glob":"js/frag/*/migrations.js"}.
 // Declares the F04 save namespace and submits the one additive migration module.
 // The integration owner assigns the version number in migration_ledger.js.

 // Namespace defaults: everything F04 touches in save.frag.F04.
 window.RAMigrations.namespace('F04', {
  // Route state
  offer: {
   status: 'unavailable',   // unavailable | available | declined_once | accepted | declined_final | closed_fame
   declinedOnDay: null,
   acceptedOnDay: null,
   secondOfferDay: null
  },
  // Active flag (shorthand: offer.status === 'accepted')
  active: false,
  // Districts: keyed by district id
  districts: {},
  // Crew: handled by RACrew service (save.frag.if1.crew.units); F04 tracks job history here
  jobs: {
   log: [],           // [{day, jobId, type, district, result, ogas, heatDelta, cashDelta, newStories, gone}]
   nightsSinceStart: 0,
   slotsPerNight: 1   // 1 early; 2 once crew has 6+ active Ogas
  },
  // HAND BACK state
  handBack: {
   pending: false,
   startedOnDay: null,
   resolved: false
  },
  // Report cards (last 20)
  reportCards: [],
  // Connections: one-time world-reaction flags
  reactions: {
   officerNoddStaring: false,
   nnekaSilent: false,
   bllad33HookahLine: false,
   vampgramToneShifted: false
  },
  // VampGram: which posts have been made (dedup)
  vgPosts: {}
 });

 // Migration module: additive, no-op for new saves (defaults cover them).
 // For saves that existed at v16, frag.F04 simply will not exist — fill() in
 // RAMigrations.normalize handles the additive fill when the namespace is present.
 window.RAMigrations.submit({
  id: 'F04.init-war-room',
  fragment: 'F04',
  note: 'Additive: stamps frag.F04 namespace into saves that do not have it yet (no-op for new saves)',
  migrate(save) {
   // RAMigrations.normalize handles default-filling when the namespace key exists.
   // This migration ensures the key exists in upgraded saves.
   if (!save.frag) save.frag = {};
   if (!save.frag.F04) save.frag.F04 = {};
   return save;
  }
 });
})();
