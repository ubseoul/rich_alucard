(function(){
 'use strict';
 // F05 - THE TRAP - migrations.js
 // Loaded BEFORE js/engine/state.js via the fragment migrations glob ({"glob":"js/frag/*/migrations.js"}).
 //
 // DECLARATION ONLY. No version number is claimed and RAMigrations.submit() is deliberately NOT called: the
 // integration owner assigns schema versions in js/if1/migration_ledger.js, and an orphaned submission would make
 // RAMigrations.validate() (and RAIF1.selfCheck) report an unassigned module. The namespace is lazy - save.frag.F05
 // does not exist until the fragment writes - so with every flag OFF a save stays byte-identical to pre-IF-1.
 // RAMigrations.normalize() fills these defaults additively wherever save.frag.F05 already exists.
 if(!window.RAMigrations)return;
 window.RAMigrations.namespace('F05',{
  schema:1,
  unlocked:false,
  unlockedDay:null,
  // Route progression
  route:{
   active:false,
   level:1,
   casesSold:0,
   levelJobs:{},        // jobId -> {done, day, source}
   countingRoom:false,  // Level 4 unlock
   upgrades:{}          // upgradeId -> {owned, boughtDay}
  },
  // Traphouses: id -> {owned,boughtDay,hotUntilDay}
  houses:{},
  // Aged/ready product: [{id,houseId,grade,quality,cases,readyDay,premium,rare,madeDay}]
  batches:[],
  // Base ingredients and the weekly rare ingredient
  ingredients:{synth:0,standard:0,good:0,premium:0,rare:0},
  rare:{lastGainedDay:null,count:0},
  // The night's assigned sales: {houseId,grade,cases,channel,day} or null
  assignment:null,
  // Cash physically in the house until COUNT THE MONEY
  unbanked:0,
  banked:0,
  // Runner skimming
  robbery:{suspectId:null,notice:false,noticeDay:null,resolved:null},
  // Trap roles: crewId -> {role,loyalty}
  roles:{},
  // One-time world reactions: reactionId -> day
  reactions:{},
  // Elite clients: clientId -> {lost,lostDay}
  clients:{},
  // Raids (F01 OL-023: setup/state + canonical defense-outcome consumption; no tactical execution)
  raids:{lastDay:null,pending:null,history:[],lastOutcome:null},
  // Night reports (last 10)
  reports:[],
  // F02 seam local fallback (used ONLY when F02 is absent, to avoid duplicating F02 ownership)
  weapons:{},
  weaponsPending:null,
  // VampGram dedupe
  vgPosts:{}
 });
})();
