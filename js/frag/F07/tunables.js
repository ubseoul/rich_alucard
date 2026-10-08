// F07 M8_AND_FINALE — tunables. AUTHORED_* values are transcribed from Patch 1 NEW OGA (§3, §4, §5, §8) and are not tuning
// discretion. Everything else is an F07-TUNABLE engineering placeholder: the source does not author it (see the SOURCE GAPS list in
// docs/engineering/F07_M8_AND_FINALE.md). Keep every discretionary number here.
(function(){
 'use strict';
 window.RAF07Tunables=Object.freeze({
  m8:Object.freeze({
   AUTHORED_PAY:18000,            // §8 "Job pay … M8 $18K"
   AUTHORED_HEAT:12,              // "+12 HEAT" (Vol 7 HEAT scale, written through the lane like every NEW OGA job)
   LOAN_SQUAD:3,                  // MECHANICAL: how many of Gbenga's boys are ON LOAN for the Showdown ("a squad"; transient, never persistent crew)
   LOAN_CLASSES:Object.freeze(['MUSCLE','SHOOTER','GHOST']), // MECHANICAL stat-block placeholder (the PLAY contract needs a class); no identity is invented
   JOB_SMACK:'smack_crib',        // F01 PLAY job: Lil Smack is there
   JOB_LIEUTENANT:'car_wash_stickup', // F01 PLAY job: the LIEUTENANT leads (used while lilSmackGone is set)
   // NO clout / trust / penalty values: Patch 1 authors none for M8 (§2 says clout is "earned by completing jobs" without an amount; §1 says a
   // back-out "always costs something" without saying what). Nothing is invented: both stay 0 until the creator rules (D-queue D1, D2).
   clout:Object.freeze({WIN:0,BACKOUT:0}),
   trust:Object.freeze({WIN:0,BACKOUT:0})
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
   FINALE_JOB:'owambe_party',     // the F07-owned PLAY job for Phase 1 (js/frag/F07/play/owambe.mjs): ENFORCER / CHEWER + one LIEUTENANT (§8)
   CONSIGLIERE_EVERY_DAYS:7       // MECHANICAL cadence of the authored "Hello. Hello. Oga. Hello." (the source says the voice notes continue)
  })
 });
})();
