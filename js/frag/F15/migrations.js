// F15 VELVET ROTATION (launch trio) — fragment migration declaration (IF-1 4B).
// Loaded BEFORE js/engine/state.js by the loader glob `js/frag/*/migrations.js`.
//
// NO SCHEMA NUMBER IS CLAIMED HERE (the integration owner assigns versions in js/if1/migration_ledger.js). The namespace is
// additive and lazy (IF-1 RAFrag): with F15.velvet_rotation OFF nothing is written and save.frag.F15 never exists.
//   selected   the dancer the player is currently supporting (null until chosen)
//   mapping    optional creator-confirmation override of the dancer -> animation-handle binding (null = RAF15Tunables.IDENTITY)
//   dancers    per-dancer CUMULATIVE money spent on her (floor/missed bills included) and the number of throws; this is its own
//              ledger — it is never a score, a wardrobe tier or a relationship level
//   paid       one-time scene money effects already applied, keyed by scene id (a replay can never debit twice)
// Date completion is NOT stored here: it is read from the accepted adventure records (life.adventures.records), which already
// persist once-only completion and survive save/reload.
(function(){
 'use strict';
 window.RAMigrations?.namespace?.('F15',{
  v:1,selected:null,mapping:null,
  dancers:{roxy:{spent:0,throws:0},rosalyn:{spent:0,throws:0},emerald:{spent:0,throws:0}},
  paid:{}
 });
})();
