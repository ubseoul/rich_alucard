// F03 NEW_OGA_LADDER_CLOSE — fragment migration declaration (IF-1 4B).
// Loaded BEFORE js/engine/state.js by the loader glob `js/frag/*/migrations.js`.
//
// NO SCHEMA NUMBER IS CLAIMED HERE (the integration owner assigns versions in js/if1/migration_ledger.js). F03 needs no
// structural migration: ladder progression extends the accepted NEW OGA lane on `life.newOga` with additive fields (absent on
// old saves, written only while F03.new_oga_ladder_close is ON). The F03 namespace holds what the lane cannot:
//   koreatown  F03 is the SOLE OWNER of Koreatown progression state. F04 (War Room) and F07 only READ it, never redefine or shadow it.
//   crew       M10's two generic recruits, queued until the War Room is active and the crew has room.
// Lazy (IF-1 RAFrag): with the flag OFF nothing is written and save.frag.F03 never exists.
(function(){
 'use strict';
 window.RAMigrations?.namespace?.('F03',{
  koreatown:{granted:false,pending:false,grantDay:null,appliedDay:null},
  crew:{queue:[],recruited:[]}
 });
})();
