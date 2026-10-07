(function(){
 'use strict';
 // F05 - THE TRAP (TRAPHOUSE & BLOOD X PRODUCTION) - tunables.js
 // ---------------------------------------------------------------------------------------------------------------
 // SOURCE AUTHORITY: Rich_Alucard_PLAYMAKERS_Patch2_THE_TRAP.docx (OPEN) + Rich_Alucard_BTF_Vol7_PLAYMAKERS_
 // Blood_X_Operations.docx (OPEN). THE TRAP says HEAT is shared with Vol 7; Vol 7 sec.8 supplies the numeric HEAT
 // floors. Every AUTHORED number below is quoted from one of those two documents. Anything the source leaves silent
 // is ZERO unless it is required for the system to run, in which case it lives under `provisional` with
 //   provisional:true, owner:'F13'
 // and never claims to be authored canon. Global balance remains F13-owned; do not tune here opportunistically.
 window.RAF05=window.RAF05||{};
 const R=window.RAF05;

 // ===============================================================================================================
 // AUTHORED - do not change without a new source document.
 // ===============================================================================================================
 const AUTHORED=Object.freeze({
  source:{
   patch:'Rich_Alucard_PLAYMAKERS_Patch2_THE_TRAP.docx',
   vol7:'Rich_Alucard_BTF_Vol7_PLAYMAKERS_Blood_X_Operations.docx',
   classification:'OPEN'
  },

  // ---- Vol 7 sec.8 HEAT (shared; THE TRAP sec.7 "HEAT (shared with Vol 7)") ----
  heat:{
   tiers:['COOL','WARM','HOT','ON FIRE'],
   floors:{COOL:0,WARM:30,HOT:60,'ON FIRE':85},   // Vol 7 sec.8 "COOL 0-29 · WARM 30-59 · HOT 60-84 · ON FIRE 85+"
   decayPerSleep:-3                                 // Vol 7 sec.8 "HEAT decay: -3 per sleep"
  },

  // ---- THE TRAP sec.2 THE TRAPHOUSES ----
  houses:{
   the_bando:{id:'the_bando',label:'THE BANDO',where:'Boarded-up house, South LA',price:45000,capacity:2,
    flavor:"Plywood windows, a couch outside, a dog that isn't yours"},
   the_cul_de_sac:{id:'the_cul_de_sac',label:'THE CUL-DE-SAC',where:'A too-nice suburban house, Carson',price:140000,capacity:4,
    flavor:'An HOA president (a vampire) who fines you for trash cans and never notices the product'},
   laundromat_back_room:{id:'laundromat_back_room',label:'THE LAUNDROMAT BACK ROOM',where:'Koreatown (links to the Catacomb building if owned)',price:260000,capacity:6,
    flavor:'Dryers hide the machine noise'},
   the_warehouse:{id:'the_warehouse',label:'THE WAREHOUSE',where:'Former Gbenga Enterprises (only if NEW OGA finished)',price:0,capacity:10,
    flavor:'The canopies are still up',requires:'new_oga_finished',freeWithChair:true}
  },

  // ---- THE TRAP sec.3 THE PRODUCT - BLOOD X GRADES ----
  grades:{
   D:{id:'D',street:'TAP WATER',madeFrom:'Cheap synth base',sellsTo:'Desperate street vamps',price:1200,base:'synth',aging:0,rare:false},
   C:{id:'C',street:'HOUSE RED',madeFrom:'Standard base',sellsTo:'Clubs, parties',price:3500,base:'standard',aging:0,rare:false},
   B:{id:'B',street:'VINTAGE',madeFrom:'Good base + aging (2 sleeps)',sellsTo:"Rich vamps, the Royal Glitch crowd won't buy it (neutral ground)",price:7000,base:'good',aging:2,rare:false},
   A:{id:'A',street:'RESERVE',madeFrom:'Premium base + aging (4 sleeps) + a perfect cook',sellsTo:"Ogun's circle, elite parties",price:14000,base:'premium',aging:4,rare:false,perfectCook:true},
   S:{id:'S',street:'BLUE BLOOD',madeFrom:'Reserve + a rare ingredient (one per week: dragon scale from Mazda\'s roost, an Agege crumb, a fish scale - which Rich must handle himself)',sellsTo:'The Obas, the Duchess',price:40000,base:'premium',aging:0,rare:true}
  },
  // THE TRAP sec.3 quality rules
  quality:{premiumAt:90,premiumMult:1.25,lowBelow:50,lowMult:0.5},

  // ---- THE TRAP sec.5 SALES CHANNELS ----
  channels:{
   corner:{id:'corner',label:'CORNER (STREET)',needs:'1 runner',risk:'Medium',notes:'D-C grades; fast cash',
    grades:['D','C'],usesRunner:true,requires:{runner:1}},
   clubs:{id:'clubs',label:'CLUBS & PARTIES',needs:'Clout MID',risk:'Low-Medium',notes:'C-B; Ogun, Catacomb, castle parties',
    grades:['C','B'],requires:{cloutTier:'MID'}},
   bing:{id:'bing',label:'THE BING',needs:'BIG TIPPER status',risk:'Low',notes:"B-A; dancers' clients; can't sell during your own visit",
    grades:['B','A'],requires:{bigTipper:true}},
   elite:{id:'elite',label:'ELITE DROPS',needs:'Vampire Rep HIGH',risk:'Low risk, high stakes',notes:'A-S; the Duchess, the Obas; one mistake loses the client forever',
    grades:['A','S'],requires:{repTier:'HIGH'},eliteClients:true},
   wholesale:{id:'wholesale',label:'WHOLESALE (Gbenga / December)',needs:'NEW OGA or Offer accepted',risk:'Very low',notes:'60% price, zero heat; the safe option',
    grades:['D','C','B','A','S'],multiplier:0.6,heatOverride:0,requires:{newOgaOrOffer:true}}
  },

  // ---- THE TRAP sec.6 LEVELS ----
  levels:{
   1:{level:1,name:'BANDO',unlocks:['Cook D-C'],visual:'Plywood, one lamp'},
   2:{level:2,name:'TRAP',unlocks:['Grade B','one runner slot','a lookout'],visual:'Real furniture, a TV, a dog bed'},
   3:{level:3,name:'FACTORY',unlocks:['Grade A','two cooks','aging racks'],visual:'Lab lighting, stacked cases'},
   4:{level:4,name:'DISTRIBUTION',unlocks:['Elite drops','a second property','the COUNTING ROOM at the castle'],visual:'Neon sign on a back door, cameras'},
   5:{level:5,name:'EMPIRE',unlocks:['Grade S','WHOLESALE to other cities (Tokyo tease)','your name known everywhere'],visual:'Gold accents, a portrait of Rich on the wall that he did not ask for'}
  },
  // THE TRAP sec.6 level-up: total cases sold + an authored LEVEL-UP JOB at each tier. THE HOA MEETING is the
  // authored example for Level 3 (premise quoted verbatim). The full scene text is NOT authored in OPEN, so the
  // system treats a level job as a gate only when authored content is registered; otherwise the gate degrades to
  // cases-sold and reports level.jobSourceRequired=true. No invented dialogue.
  levelJobs:{
    2:{id:'F05_LEVELUP_2',name:'LEVEL-UP JOB',premise:null,contentSourceRequired:true},
    3:{id:'F05_LEVELUP_3',name:'THE HOA MEETING',premise:'the Cul-de-Sac HOA calls a meeting about "noise," and Rich must survive a suburban meeting full of vampires in cardigans',contentSourceRequired:true},
    4:{id:'F05_LEVELUP_4',name:'LEVEL-UP JOB',premise:null,contentSourceRequired:true},
    5:{id:'F05_LEVELUP_5',name:'LEVEL-UP JOB',premise:null,contentSourceRequired:true}
  },
  // THE TRAP sec.6 upgrades (equipment). Costs are not authored -> provisional (F13); effects documented.
  upgrades:{
   better_burner:{id:'better_burner',label:'BETTER BURNER',effect:'+heat stability'},
   aging_racks:{id:'aging_racks',label:'AGING RACKS',effect:'aging capacity'},
   vault:{id:'vault',label:'VAULT',effect:"cash can't be stolen"},
   cameras:{id:'cameras',label:'CAMERAS',effect:'see raids early'},
   money_counter:{id:'money_counter',label:'MONEY COUNTER',effect:'faster count'},
   panic_room:{id:'panic_room',label:'PANIC ROOM',effect:'protects crew during raids'}
  },

  // ---- THE TRAP sec.7 THE COST ----
  cost:{
   raidCadenceNights:7,                 // "at most one per 7 nights"
   raidLossUnbankedPct:0.3,             // "lose the stash (cases + 30% of unbanked cash)"
   raidHotNights:5,                     // "the house is 'hot' for 5 nights (no production)"
   badProductEndsClient:true,           // "selling low-quality product to elite clients ends that client forever"
   bigRaidLevel:5,                      // "at EMPIRE level, one authored 'BIG RAID' can take a property permanently"
   bigRaidKeeps:['castle','cars','counting room banked cash']
  },

  // ---- THE TRAP sec.5 COUNT THE MONEY ----
  counter:{bandSize:10000},             // "bands snap on every $10K"

  // ---- THE TRAP sec.5 nightly loop, sec.4 cook ----
  cook:{seconds:60},                    // "Three stations, ~60 seconds"
  aging:{B:2,A:4},                      // duplicated from grades for clarity

  // ---- THE TRAP sec.10 ART / SOUND ----
  artNeeds:[
   {id:'trap_bando_interior',kind:'environment',states:['L1','L3','L5'],artSourceRequired:true},
   {id:'trap_cul_de_sac_interior',kind:'environment',states:['L1','L3','L5'],artSourceRequired:true},
   {id:'trap_laundromat_interior',kind:'environment',states:['L1','L3','L5'],artSourceRequired:true},
   {id:'trap_warehouse_interior',kind:'environment',states:['L1','L3','L5'],artSourceRequired:true},
   {id:'trap_counting_room',kind:'environment',artSourceRequired:true},
   {id:'trap_hoa_meeting_room',kind:'environment',artSourceRequired:true},
   {id:'trap_hoa_president',kind:'character',artSourceRequired:true},
   {id:'trap_cook_a',kind:'character',artSourceRequired:true},
   {id:'trap_cook_b',kind:'character',artSourceRequired:true},
   {id:'trap_runner_a',kind:'character',artSourceRequired:true},
   {id:'trap_runner_b',kind:'character',artSourceRequired:true},
   {id:'trap_lookout',kind:'character',artSourceRequired:true},
   {id:'trap_grade_stamp',kind:'ui',artSourceRequired:true},
   {id:'trap_cook_bench',kind:'ui',artSourceRequired:true},
   {id:'trap_money_counter',kind:'ui',artSourceRequired:true},
   {id:'trap_report_card',kind:'ui',artSourceRequired:true}
  ],
  sound:{                                  // THE TRAP sec.10 "neutral codes TR_01-TR_06"
   'TR_01':'bubbling flask loop',
   'TR_02':'burner click + whoosh',
   'TR_03':'vial clink into case',
   'TR_04':'grade stamp slam',
   'TR_05':'money counter whir loop with bill flicks',
   'TR_06':'rubber band snap on a band'
  }
 });

 // ===============================================================================================================
 // PROVISIONAL - system-operation values the source does not number. owner F13. NOT canon. Centralized here only.
 // ===============================================================================================================
 const PROVISIONAL=Object.freeze({
  provisional:true,owner:'F13',
  // HEAT added per case sold. THE TRAP sec.7 says "every sale adds heat by channel and grade" but gives no
  // numbers; these are the minimum weights that let the shared HEAT system operate.
  heatPerCase:{corner:2,clubs:1,bing:1,elite:2,wholesale:0},
  heatGradeAdd:{D:0,C:0,B:1,A:1,S:2},
  // Crew cooking is "lower quality" (THE TRAP sec.4) - the exact quality is not authored.
  crewCookQuality:55,
  // The trap level reports jobSourceRequired when no authored scene is registered; with F13/authoring the gate
  // becomes cases + job. Until then level-up uses the cases-sold thresholds below.
  casesSoldForLevel:{2:40,3:120,4:300,5:700},
  // Base ingredient acquisition costs per case (Gbenga's "markup" is not numbered). F13 BALANCE LOCK (was 0 across the board):
  // 20% of the base's reference grade price (synth->D $1,200, standard->C $3,500, good->B $7,000, premium->A $14,000), i.e. a third
  // of its WHOLESALE price. Measured: at $0 a case was pure profit, so the trap out-earned the War Room 2-3.5x with no working capital
  // and a raided stash cost nothing to replace. Every standard-quality sale stays profitable on every channel; the rare stays free
  // (it is gated weekly by the source). Evidence: docs/engineering/F13_BALANCE_LOCK.md.
  ingredientCost:{synth:250,standard:700,good:1400,premium:2800,rare:0},
  // Upgrade prices. F13: only BETTER BURNER has a wired economic effect (sale HEAT x betterBurnerHeatMult); it is priced against the
  // authored LAY LOW rate ($10K per 15 HEAT): $50K ~ 75 HEAT points. The other five have no wired economic effect in the integrated
  // game (VAULT: skimming never triggers; PANIC ROOM: the HOLD bridge always supplies F01's captive list; CAMERAS: a warning flag;
  // MONEY COUNTER / AGING RACKS: no economic effect), so they stay free rather than charge the player for nothing (SOURCE_REQUIRED).
  upgradeCost:{better_burner:50000,aging_racks:0,vault:0,cameras:0,money_counter:0,panic_room:0},
  // Runner skimming (THE TRAP sec.7 "a runner with low loyalty can skim").
  loyalty:{start:3,max:5,lowMax:2},
  robbery:{chance:0.25,amountPct:0.1},
  // How strongly a bought upgrade moves its documented effect where a number is needed.
  betterBurnerHeatMult:0.5,
  vaultRobberyProtection:1,
  moneyCounterSpeedMult:0.5,
  // Raid eligibility: source says "at most one per 7 nights" and "HEAT tiers bring ... hunters sniffing".
  raidHeatTier:'HOT'
 });

 R.AUTHORED=AUTHORED;
 R.PROVISIONAL=PROVISIONAL;
 R.tunables=()=>({authored:AUTHORED,provisional:PROVISIONAL});
})();
