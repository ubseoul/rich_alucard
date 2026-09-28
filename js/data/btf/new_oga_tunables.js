// F6-TUNABLE — OL-002/OL-004 bounded implementation values for NEW OGA M1–M4.
// Keep every discretionary number for this lane here. Authored prices, rewards and HP are labeled separately.
(function(){
 'use strict';
 const NOVICE_BOT_PROFILES=Object.freeze([
  Object.freeze([[20,42,.24],[27,48,.16]]),Object.freeze([[22,45,.26],[31,52,.14]]),
  Object.freeze([[24,48,.28],[34,55,.12]]),Object.freeze([[19,44,.22],[29,50,.18]]),
  Object.freeze([[25,46,.25],[32,54,.15]])
 ]);
 function noviceBotMedianScore(durationSeconds=30){
  const seconds=Math.max(1,Number(durationSeconds)||30),frame=(angle,speed,dt)=>Math.max(0,Math.min(60,angle)-15)*(Math.max(0,speed)/10)*.1*dt;
  const scores=NOVICE_BOT_PROFILES.map(parts=>Math.round(parts.reduce((sum,[angle,speed,share])=>sum+frame(angle,speed,seconds*share),0))).sort((a,b)=>a-b);
  return scores[Math.floor(scores.length/2)];
 }
 window.RANewOgaTunables=Object.freeze({
  trustThresholds:Object.freeze({LOW_MAX:0,HIGH_MIN:3}),
  clout:Object.freeze({M1_SUCCESS:1,M1_BACKOUT:0,M2_ALL_PATHS:0,M3_COMPLETE:1,M3_BACKOUT:0,M4_WALK_IN:3,M4_BACKOUT:0,M4_RUN:0,ALTERNATIVE:1}),
  trust:Object.freeze({M1_ALL_PATHS:0,M2_HONEST:1,M2_FLEX:0,M2_FISH:1,M2_WORK_OFF:1,M2_PAY_END:0,M3_COMPLETE:1,M3_BACKOUT:-1,M4_WALK_IN:1,M4_BEAT_1:-1,M4_BEAT_2:-2,M4_BEAT_3:-1,M4_RUN:0}),
  tendency:Object.freeze({M4_WALK_IN_MESSY:3,M4_RUN_SOLID:2}),
  heat:Object.freeze({STICK_UP:12,SWITCH_THE_BAG:3,TOUGE_ESCAPE:7,BACKOUT:0}),
  combat:Object.freeze({
   SMALLIE:Object.freeze({archetype:'lil_smack',attacks:Object.freeze({primary:14,secondary:10})}),
   COUSIN:Object.freeze({archetype:'coffe',attacks:Object.freeze({primary:14,secondary:10})})
  }),
  // AUTHORED_* values are centralized for shared consumption but are not tuning discretion.
  touge:Object.freeze({AUTHORED_DURATION_SECONDS:45,SUCCESS_THRESHOLD:3000}),
  chairs:Object.freeze({AUTHORED_TOTAL:60,DURATION_MS:45000,BUNDLE_SIZE:10}),
  m4:Object.freeze({
   AUTHORED_WALK_IN_PAY:12000,
   AUTHORED_ALTERNATIVE_PAY:3000,
   ESCAPE_DURATION_SECONDS:30,
   LOW_SCORE_REFERENCE:'NOVICE_BOT_MEDIAN',
   LOW_SCORE_RATIO:1,
   NOVICE_BOT_PROFILES
  })
 });
 window.RANewOgaTougeBenchmark=Object.freeze({noviceBotMedianScore});
})();
