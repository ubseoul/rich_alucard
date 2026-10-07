(function(){
 'use strict';
 // F04 — PLAYMAKERS WAR ROOM — migrations.js
 // Loaded BEFORE js/engine/state.js via the glob {"glob":"js/frag/*/migrations.js"}.
 // DECLARATION ONLY (FCPB convergence): declares the F04 save namespace. F04 submits NO migration module: the former
 // 'F04.init-war-room' body only stamped an empty frag.F04, which every F04 reader already defaults lazily (RAFrag.read with
 // defaults; RAMigrations.normalize fills the namespace defaults wherever frag.F04 exists). An unassigned submission made
 // RAMigrations.validate() and RAIF1.selfCheck() report a problem, and no schema version was ever assigned to it.

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
})();
