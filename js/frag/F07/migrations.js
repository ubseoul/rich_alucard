// F07 M8_AND_FINALE — fragment migration declaration (IF-1 4B).
// Loaded BEFORE js/engine/state.js by the loader glob `js/frag/*/migrations.js`.
//
// NO SCHEMA NUMBER IS CLAIMED HERE (the integration owner assigns versions in js/if1/migration_ledger.js). Mission progression
// (m8Resolved, finaleCrew, finaleDone, finaleEnding, rank 6 ...) extends the accepted NEW OGA lane on `life.newOga` through the
// lane's own `RANewOga.patch`: additive fields, absent on old saves, written only while F07.m8_and_finale is ON. The F07
// namespace holds what the lane cannot:
//   play     the THE PLAY seam: the one pending request (persisted BEFORE F01 is asked, so a reload cannot lose or duplicate it),
//            consumed results keyed by requestId (idempotent), and the request sequence
//   loan     M8's squad of Gbenga's boys ON LOAN (re-defined on load; never a War Room slot)
//   finale   one-time grants applied once (districts, War Room start, tribute return, receipts)
// Lazy (IF-1 RAFrag): with the flag OFF nothing is written and save.frag.F07 never exists.
(function(){
 'use strict';
 window.RAMigrations?.namespace?.('F07',{
  play:{pending:null,consumed:{},seq:0},
  loan:{defined:false},
  finale:{applied:false,warRoom:null,tributeReturned:false,fameFloorDay:null}
 });
})();
