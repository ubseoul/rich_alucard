// F15 VELVET ROTATION (launch trio) — configuration and tuning. ONE place for every value the creator has not authored.
//
// AUTHORED (creator rulings 2026-10-01, art/f15-launch-trio-masters rulings/): Roxy, Rosalyn and Emerald (adults 21+) are on
// stage every WAKE, the player chooses whom to support, spend on a dancer counts toward her progress INCLUDING floor bills,
// at most one date per WAKE globally, no club income / favor currency, four scenes per dancer.
//
// NOT AUTHORED — everything below marked TUNING is an engineer's proposal for Ube's review, never canon:
//   IDENTITY    which animation handle (wolf / dragon / pink) is which dancer (no 1:1 binding metadata exists in the frozen corpus)
//   THRESHOLDS  the cumulative-spend T1..T4 that make each scene AVAILABLE (IMPLEMENTATION TUNING — PENDING REVIEW)
//   COMBAT      the spar and cockroach encounter numbers (creative approval does not author attack numbers)
//   MONEY       scene money amounts the script leaves open
(function(global){
 'use strict';
 const clone=v=>JSON.parse(JSON.stringify(v));
 const T={
  FLAG:'F15.velvet_rotation',
  DANCERS:['roxy','rosalyn','emerald'],
  NAMES:{roxy:'ROXY',rosalyn:'ROSALYN',emerald:'EMERALD'},

  // ---- IDENTITY MAPPING — UNPROVEN, PENDING UBE CONFIRMATION --------------------------------------------------------
  // The approved foundation cards are named roxy/rosalyn/emerald-foundation.png and the dance masters wolf/dragon/pink, but
  // the frozen corpus carries NO 1:1 binding metadata (START_HERE §4). The default below rests on VISUAL/SOURCE EVIDENCE only:
  // the roxy card is a wolf (and the F15 audit lists Roxy as a wolf); the audit lists Emerald as a green dragon with a gemstone
  // name; the pink master is the remaining dancer. Nothing here is final until Ube confirms it in the club's IDENTITY CHECK
  // panel (which only persists an override in save.frag.F15.mapping — it never touches progress, which is keyed by NAME).
  IDENTITY:{
   status:'PROVISIONAL — PENDING UBE CONFIRMATION',
   binding:{roxy:'wolf',rosalyn:'pink',emerald:'dragon'},
   evidence:{
    roxy:'foundation card (roxy-foundation.png) is a wolf; F15 audit §D2 lists Roxy as a wolf',
    emerald:'F15 audit §D2 lists Emerald as a green dragon with a gemstone name',
    rosalyn:'by elimination (the remaining master); no source states her species'
   }
  },
  HANDLES:['wolf','dragon','pink'],

  // ---- THRESHOLDS — IMPLEMENTATION TUNING — PENDING REVIEW ---------------------------------------------------------
  // Cumulative dollars spent ON ONE DANCER (every bill thrown at her, floor/missed bills included) that make scene L1..L4
  // AVAILABLE. Availability is not completion: scenes still play in order, one per WAKE globally.
  // Basis (F13 economy, unchanged): a MAKE IT RAIN round is a $5K / $10K / $25K budget; F13's "normal" player rains $5K about
  // once a week, its "spender" rains $25K daily. Proposed table => (rounds needed at $5K / $10K / $25K):
  //   T1 $10,000 ( 2 /  1 / 1 )   first scene after about one real session
  //   T2 $35,000 ( 7 /  4 / 2 )
  //   T3 $80,000 (16 /  8 / 4 )
  //   T4 $150,000 (30 / 15 / 6 )  a late-game commitment, in line with a mid-price F13 purchase, never a grind wall
  // Spend is the player's own money going out; F15 pays nothing back, so the locked economy is untouched.
  THRESHOLDS:{
   status:'IMPLEMENTATION TUNING — PENDING REVIEW (not canon)',
   levels:[10000,35000,80000,150000]
  },

  // ---- STAGE LAYOUT A (accepted by Ube: size + the softer animation rendering) -------------------------------------
  // Per-dancer transform is fixed for the whole sequence. refScale = CSS px per master px on a 370 px stage, scaled linearly with
  // stage width and capped so the tallest figure keeps headroomPx under the F06 HUD. cx = anchor x (master 344) / stage width.
  LAYOUT:{
   refStageWidth:370,refScale:0.28,headroomPx:6,tallestMasterPx:600,deckFeetFrac:0.55,hudLogicalY:61,
   slots:{dragon:{cx:0.21,z:1},wolf:{cx:0.50,z:2},pink:{cx:0.79,z:1}},
   fps:24
  },

  // ---- COMBAT — IMPLEMENTATION TUNING — PENDING REVIEW -------------------------------------------------------------
  // Existing Combat 2.0, narrowly configured. No new engine, no unrelated rewards, no defeat penalty.
  COMBAT:{
   status:'IMPLEMENTATION TUNING — PENDING REVIEW (attack numbers are not authored)',
   spar:{hp:60,jab:6,cross:9,noPenalty:true},
   roach:{hp:90,scuttle:7,antenna:0,stare:5,flies:12,noPenalty:true}
  },

  // ---- MONEY — scene amounts ----------------------------------------------------------------------------------------
  // Rosalyn L1: the check is $212.47 split exactly in half (authored). The game's money is whole dollars (RALife.addMoney
  // rounds), so Rich's real debit is his half rounded DOWN to whole dollars.
  MONEY:{
   rosalynL1RichHalf:106,
   // Roxy L4: "PAID BY: RICH" — the script authors NO amount for the curry, so none is invented (0 = no debit). Configurable.
   roxyL4Curry:0
  },

  clone:()=>clone(T)
 };
 global.RAF15Tunables=T;
})(window);
