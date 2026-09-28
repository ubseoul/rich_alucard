// F6-TUNABLE — OL-002 bounded implementation values for NEW OGA M1–M3.
// Keep every discretionary number for this lane here. Authored prices, rewards and HP are labeled separately.
(function(){
 'use strict';
 window.RANewOgaTunables=Object.freeze({
  trustThresholds:Object.freeze({LOW_MAX:0,HIGH_MIN:3}),
  clout:Object.freeze({M1_SUCCESS:1,M1_BACKOUT:0,M2_ALL_PATHS:0,M3_COMPLETE:1,M3_BACKOUT:0}),
  trust:Object.freeze({M1_ALL_PATHS:0,M2_HONEST:1,M2_FLEX:0,M2_FISH:1,M2_WORK_OFF:1,M2_PAY_END:0,M3_COMPLETE:1,M3_BACKOUT:-1}),
  heat:Object.freeze({STICK_UP:12,SWITCH_THE_BAG:3,TOUGE_ESCAPE:7,BACKOUT:0}),
  combat:Object.freeze({
   SMALLIE:Object.freeze({archetype:'lil_smack',attacks:Object.freeze({primary:14,secondary:10})}),
   COUSIN:Object.freeze({archetype:'coffe',attacks:Object.freeze({primary:14,secondary:10})})
  }),
  // AUTHORED_* values are centralized for shared consumption but are not tuning discretion.
  touge:Object.freeze({AUTHORED_DURATION_SECONDS:45,SUCCESS_THRESHOLD:3000}),
  chairs:Object.freeze({AUTHORED_TOTAL:60,DURATION_MS:45000,BUNDLE_SIZE:10})
 });
})();
