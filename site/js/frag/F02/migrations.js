(function(){
 'use strict';
 // F02 IRON & GRACE — fragment save namespace (IF-1 4B).
 // Loaded by the loader BEFORE js/engine/state.js (the js/frag/*/migrations.js glob slot), so it may only touch IF-1.
 // No version number is claimed: RAMigrations.submit() is deliberately NOT called. The namespace is lazy — it does not
 // exist in a save until an F02 flag is ON and something writes. The integration owner assigns a schema version in
 // js/if1/migration_ledger.js only if a structural (additive) migration is ever required; the ready module shape is
 // documented in tools/tests/f02/migration.test.mjs (sandboxed submission, never shipped orphaned).
 if(!window.RAMigrations)return;
 window.RAMigrations.namespace('F02',{
  schema:1,
  equipped:null,       // primary gun id chosen in the Armory
  loadout:[],          // ordered F02-managed gun ids (1 slot, or 2 once the ARMORY WALL room is owned)
  mods:{},             // gunId -> [modId, ...]  (max 2 per gun)
  modsOwned:{},        // modId -> true (bought from Deacon Brass's workbench)
  engravings:{},       // gunId -> authored name (CUSTOM ENGRAVING text)
  acquired:{},         // gunId -> { day, source }
  range:{},            // gunId -> { best, attempts, cleared, story }
  medals:{},           // gunId -> 'bronze' | 'silver' | 'gold'
  discounts:{},        // modId -> 0..1 (one Range Day medal discount per gun)
  trap:{},             // ownerId -> gunId  (TRAP-facing assignment; F04/F05 bind later)
  stats:{attempts:0,shots:0,hits:0,discountsUsed:0},
  seen:{goldNotice:false}
 });
})();
