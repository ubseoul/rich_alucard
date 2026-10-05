// F6-TUNABLE — OL-002/OL-004/OL-008/OL-010 bounded implementation values for NEW OGA M1–M7.
// Keep every discretionary number for this lane here. Authored prices, rewards and HP are labeled separately.
(function(){
 'use strict';
 // Deterministic novice telemetry: [angle degrees, speed km/h, share of run, clips cleared after segment].
 // Scoring is deliberately not implemented here; TOUGE consumes these traces through its live score primitives.
 const NOVICE_BOT_RUNS=Object.freeze([
  Object.freeze([[20,52,.22,0],[24,58,.20,0],[18,48,.12,0]]),
  Object.freeze([[22,56,.24,1],[27,62,.22,0],[19,50,.12,0]]),
  Object.freeze([[24,60,.25,0],[29,66,.22,1],[21,54,.14,0]]),
  Object.freeze([[21,55,.20,1],[26,64,.24,0],[31,68,.16,0]]),
  Object.freeze([[25,62,.24,1],[30,69,.24,1],[34,72,.18,0]])
 ]);
 window.RANewOgaTunables=Object.freeze({
  trustThresholds:Object.freeze({LOW_MAX:0,HIGH_MIN:3}),
  clout:Object.freeze({M1_SUCCESS:1,M1_BACKOUT:0,M2_ALL_PATHS:0,M3_COMPLETE:1,M3_BACKOUT:0,M4_WALK_IN:3,M4_BACKOUT:0,M4_RUN:0,ALTERNATIVE:1,M5_SUCCESS:2,M5_SHORT:1,M5_GREEDY:0,M5_BACKOUT:0,M6_ALL:0}),
  trust:Object.freeze({M1_ALL_PATHS:0,M2_HONEST:1,M2_FLEX:0,M2_FISH:1,M2_WORK_OFF:1,M2_PAY_END:0,M3_COMPLETE:1,M3_BACKOUT:-1,M4_WALK_IN:1,M4_BEAT_1:-1,M4_BEAT_2:-2,M4_BEAT_3:-1,M4_RUN:0,M5_SUCCESS:1,M5_SHORT:0,M5_GREEDY:-1,M5_BACKOUT:0,M6_WALKED:2,M6_LOST:-3,M7_TAKE:1,M7_REFUSE:0,M9_GIVE:0,M9_OTHER:-1,M9_NAH:0}),
  tendency:Object.freeze({M4_WALK_IN_MESSY:3,M4_RUN_SOLID:2,M5_SUCCESS_MESSY:1,M5_SHORT_MESSY:1,M5_GREEDY_MESSY:1,M5_BACKOUT_SOLID:1}),
  heat:Object.freeze({STICK_UP:12,SWITCH_THE_BAG:3,TOUGE_ESCAPE:7,BACKOUT:0,M5_SUCCESS:3,M5_SHORT:3,M5_GREEDY:8,M5_BACKOUT:0,M6_ALL:0}),
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
   NOVICE_BOT_RUNS
  }),
  m5:Object.freeze({
   AUTHORED_DEBT_TARGET:30000,
   AUTHORED_KEEP_NUMERATOR:20,
   AUTHORED_KEEP_DENOMINATOR:100,
   SONG_SECONDS:60, // authorized 45–75s
   BILL_VALUE:1000,
   BILL_SPAWN_MS:550,
   BILL_LIFETIME_MS:4500,
   ATTENTION_MAX:100,
   ATTENTION_RISE:5,
   ATTENTION_DECAY_PER_SECOND:10,
   QUICK_CATCH_WINDOW_MS:600,
   QUICK_CATCH_ACCELERATION:6
  }),
  m6:Object.freeze({
   PROMPT_WINDOW_MS:10000 // reuses HATCH's existing 10-second interaction window
  }),
  // F03 NEW_OGA_LADDER_CLOSE. M9 trust is authored (+/− symbols map to ±1). M10 weekly income is the authored $15K/week.
  m10:Object.freeze({
   WEEKLY_INCOME:15000,
   REASK_DAYS:7 // "VampGPT asks again in 7 sleeps" (VICE PRESIDENT stay)
  })
 });
})();
