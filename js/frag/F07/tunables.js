// F07 M8_AND_FINALE — tunables. AUTHORED_* values are transcribed from Patch 1 NEW OGA (§3, §4, §5, §8) and are not tuning
// discretion. Everything else is an F07-TUNABLE engineering placeholder: the source does not author it (see the SOURCE GAPS list in
// docs/engineering/F07_M8_AND_FINALE.md). Keep every discretionary number here.
(function(){
 'use strict';
 window.RAF07Tunables=Object.freeze({
  m8:Object.freeze({
   AUTHORED_PAY:18000,            // §8 "Job pay … M8 $18K"
   AUTHORED_HEAT:12,              // "+12 HEAT" (Vol 7 HEAT scale, written through the lane like every NEW OGA job)
   LOAN_SQUAD:3,                  // F07-TUNABLE: how many of Gbenga's boys are ON LOAN (the source says "a squad")
   LOAN_CLASSES:Object.freeze(['MUSCLE','SHOOTER','GHOST']), // F07-TUNABLE placeholder classes (source authors none)
   JOB_SMACK:'smack_crib',        // F01 PLAY job: Lil Smack is there
   JOB_LIEUTENANT:'car_wash_stickup', // F01 PLAY job: the LIEUTENANT leads (used while lilSmackGone is set)
   clout:Object.freeze({WIN:2,BACKOUT:0}),   // F07-TUNABLE (M5 SUCCESS precedent for a clean win)
   trust:Object.freeze({WIN:0,BACKOUT:-1})   // F07-TUNABLE: §1 "backing out always costs something, never nothing"
  }),
  finale:Object.freeze({
   PICKS:3,                       // §4.1 "pick 3 of"
   HP:260,                        // §4.2 Gbenga HP
   HP_HIGH_TRUST:320,             // §4.2 "320 if trust was high"
   SWEEP_DAMAGE:24,               // AGBADA SWEEP
   MY_SON_HEAL:30,                // "MY SON" heals 30
   DRACO_DAMAGE:20,DRACO_HITS:2,  // THE GOLDEN DRACO 2 × 20
   DRACO_BELOW:.3,                // "Below 30% HP"
   SHAME_AT:.5,                   // phase trigger at 50%
   FAME_FLOOR_DAY:25,             // §5 authored floor
   FINALE_JOB:'car_wash_stickup', // F01 PLAY job for Phase 1 (Gbenga's boys = ENFORCER / CHEWER + one LIEUTENANT, §8)
   RECRUITS:3,                    // F07-TUNABLE: Gbenga's boys offered as recruits after the finale
   CONSIGLIERE_EVERY_DAYS:7       // F07-TUNABLE: "voice notes forever" cadence
  })
 });
})();
