(function(){
 // IF-1 MIGRATION LEDGER — INTEGRATION-OWNER ONLY. The ONLY place a save-schema version number is assigned.
 // Entry N: "step that upgrades a v(N-1) save to vN" -> id of a module a fragment SUBMITTED through
 // RAMigrations.submit() (fragment file: js/frag/<ID>/migrations.js, loaded before js/engine/state.js).
 // Fragments never choose numbers; they submit modules and the owner assigns the next free number here.
 // Base: accepted schema v16 (F1 + NEW OGA M1–M7). F00 assigns none — IF-1 changes no save shape.
 window.RAMigrationLedger=Object.freeze({
  base:16,
  assigned:Object.freeze({
   // 17:{id:'F01.example-step',fragment:'F01',note:'assigned by the integration owner'}
  })
 });
})();
