// F03 NEW_OGA_LADDER_CLOSE — fragment migration declaration (IF-1 4B).
// This file is loaded BEFORE js/engine/state.js by the loader glob `js/frag/*/migrations.js`.
//
// NO SCHEMA NUMBER IS CLAIMED HERE. Per docs/engineering/INTEGRATION_OWNER.md a fragment only SUBMITS migration
// declarations; the integration owner assigns versions in js/if1/migration_ledger.js. F03 needs no structural
// migration: it extends the accepted NEW OGA lane on `life.newOga` with additive fields (absent/undefined on old saves,
// written only while F03.new_oga_ladder_close is ON), exactly like the accepted M1–M7 additions.
//
// The F03 save namespace is declared so a future F03-local record has declared defaults. It is lazy (IF-1 RAFrag):
// with the flag OFF nothing is written and save.frag.F03 never exists.
(function(){
 'use strict';
 window.RAMigrations?.namespace?.('F03',{
  // Reserved for fragment-local records; current F03 progression lives on the accepted NEW OGA lane (life.newOga).
  ladder:{m9:null,m10:null}
 });
})();
