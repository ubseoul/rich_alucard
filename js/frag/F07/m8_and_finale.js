// ============================================================================
// F07 M8_AND_FINALE — M8 THE TURF WAR and the finale "NEW OGA" (OPEN source: Rich_Alucard_PLAYMAKERS_Patch1_NEW_OGA §3 M8, §4, §5).
// DARK behind F07.m8_and_finale.
//
// M8 (WAKE arbiter priority 77, reserved by F03; delivered as JOB TEXT ONLY — no voice note, no voice UI): a normal PLAY / Showdown-class mission on F01's PLAY seam (see play_bridge.js) —
// NOT a BIG PLAY. Rich leads a squad of Gbenga's boys (on loan) + any Ogas against the Open Mouth Gang's Koreatown block. $18K, +12 HEAT.
// A loss resolves nothing (retry). SEND THE BOYS is the back-out path (no cost value is authored: none is invented, see the D-queue). It writes the canonical `life.newOga.m8Resolved`, the exact
// field F03's M9 prerequisite reads (ANY resolved outcome, SEND THE BOYS included) — F03 is not modified.
//
// FINALE (arrives on the WAKE after VampGPT's ...SAY LESS. wrote `finaleBegun`): plan (pick 3 lanes) → Phase 1 THE PARTY (PLAY) →
// Phase 2 THE OFFICE (Combat 2.0 vs GBENGA, see gbenga_combat.js) → one of three endings, every one of which makes Rich the NEW OGA.
//
// Dialogue rule: no new dialogue is authored here. Scenes use narration that restates the source, the authored lines
// (Mama Gbenga's phone line, Gbenga's VampGram post and voice-note greeting) and choice labels only. No Rich [VP] line exists.
// ============================================================================
(function(){
 'use strict';
 if(window.RAF07)return;
 const FLAG='F07.m8_and_finale',F04_FLAG='F04.war_room';
 const T=()=>window.RAF07Tunables;
 const O=()=>window.RANewOga;
 const F=()=>window.RAFeatures;
 const FR=()=>window.RAFrag;
 const enabled=()=>!!F()?.enabled?.(FLAG);
 const state=()=>O()?.current?.()||{};
 const day=()=>window.RALife.today().day;
 const rd=(path,dflt)=>FR().read('F07',path,dflt);
 const wr=(path,value)=>FR().patch('F07',path,value);
 const credit=(amount,source)=>{if(window.RAMoneyLedger)window.RAMoneyLedger.credit(amount,{source,memo:source});else window.RALife.addMoney(amount);};

 // ---------------------------------------------------------------------- M8
 const m8Ready=S=>{
  if(!enabled())return false;
  const s=S.life?.newOga;if(!s)return false;
  return !!s.m7Completed&&!s.m8Resolved&&S.day>s.lastMissionDay;
 };
 // Resolution. 'win' = GO MYSELF and the PLAY was won; 'send_the_boys' = the back-out. Idempotent (a second call changes nothing).
 function completeM8(outcome){
  const s=state();if(s.m8Resolved)return s;
  const t=T().m8,d=day();
  if(outcome==='win'){
   credit(t.AUTHORED_PAY,'new_oga:m8');
   return O().patch({status:'m8_resolved',mission:8,m8Resolved:true,m8Outcome:'win',m8Rewarded:true,m8Day:d,m8Pay:t.AUTHORED_PAY,
    gangClout:s.gangClout+t.clout.WIN,trust:s.trust+t.trust.WIN,heat:s.heat+t.AUTHORED_HEAT,lastMissionDay:d});
  }
  if(outcome==='send_the_boys'){
   // the back-out costs something, never nothing: no pay, no clout, trust down (F07-TUNABLE). No HEAT: the boys take it.
   return O().patch({status:'m8_resolved',mission:8,m8Resolved:true,m8Outcome:'send_the_boys',m8Rewarded:false,m8Day:d,
    gangClout:s.gangClout+t.clout.BACKOUT,trust:s.trust+t.trust.BACKOUT,lastMissionDay:d});
  }
  throw new Error(`Unknown M8 outcome ${outcome}`);
 }

 // -------------------------------------------------------------------- finale
 // Lanes (§4.1: pick 3 of). Conditional lanes show only when their condition is true.
 // D6 (creator-delegated): lane effects the source does not author stay NEUTRAL; the UI shows names only and implies no effect.
 const LANES=Object.freeze([
  {id:'ogas',label:'THE OGAS',person:null},
  {id:'shannon',label:'SHANNON',person:'shannon_001'},
  {id:'mazda',label:'MAZDA',person:'mazda_human'},
  {id:'pinky',label:'PINKY',person:'pinky'},
  {id:'tristan',label:'TRISTAN',person:'tristan'},
  {id:'carlos',label:'CARLOS',person:'carlos',when:s=>s.m4Outcome==='walk_in'},
  {id:'senator',label:'SENATOR',person:'senator',when:s=>!!s.senatorCommands}
 ]);

 const lanesAvailable=(s=state())=>LANES.filter(l=>!l.when||l.when(s));
 const laneById=id=>LANES.find(l=>l.id===id);
 const finaleReady=S=>{
  if(!enabled())return false;
  const s=S.life?.newOga;if(!s||!s.finaleBegun||s.finaleDone)return false;
  return S.day>s.lastMissionDay;
 };
 // Districts: "Gbenga's blocks already his". RADistricts is the shared interface for finale state (IF-1 4J); Koreatown is F03-defined,
 // Inglewood F04-defined. A district that is not registered is skipped and reported, never invented.
 function takeBlocks(){
  const got=[];
  for(const id of ['koreatown','inglewood']){
   try{if(window.RADistricts?.get?.(id)){window.RADistricts.setControl(id,'CONTROLLED',{holder:'rich',reason:'f07:finale'});got.push(id);}}catch(e){console.error('F07 district',id,e);}
  }
  return got;
 }
 // "the War Room (Vol 7) — begins immediately if it hasn't": the same state the phone app's ACCEPT writes. Queued while F04 is dark.
 function warRoomRunning(){return FR().read('F04','active',false)===true;}
 function startWarRoom(){
  if(!F()?.enabled?.(F04_FLAG))return 'queued';
  if(warRoomRunning())return 'already';
  FR().patch('F04','offer.status','accepted');FR().patch('F04','offer.acceptedOnDay',day());FR().patch('F04','active',true);FR().patch('F04','jobs.nightsSinceStart',0);
  try{window.RAWarRoomVG?.fireWorldReactions?.();window.RAWarRoomVG?.postYoungPlaymaker?.();}catch(e){console.error('F07 war room reactions',e);}
  try{window.RAPhoneRegistry?.unlock?.('warRoom',{badge:true});}catch(e){console.error('F07 war room phone',e);}
  return 'started';
 }
 const HEADLINES=Object.freeze(['WHO IS THE NEW OGA OF LA','GBENGA’S FORMER INTERN TAKES OVER','CARLOS SPEAKS OUT']);
 // Completion. `ending`: 'blessing' (RETIRE, UNCLE) | 'consigliere' (WORK FOR ME) | 'takeover' (win the fight). All three make Rich the NEW OGA.
 function completeFinale(ending,{lanes=[]}={}){
  const s=state();if(s.finaleDone)return s;
  if(!['blessing','consigliere','takeover'].includes(ending))throw new Error(`Unknown finale ending ${ending}`);
  const d=day();
  // "Gbenga's boys can join Rich's crew as recruits after the finale": recorded as available; no recruit identity or class is invented (D-queue D5).
  O().patch({status:'new_oga',mission:11,rank:6,title:'NEW OGA',gbengasBoysCanJoin:true,finaleDone:true,finaleEnding:ending,finaleDay:d,finaleCrew:[...lanes],
   finaleHighTrust:s.trust>=window.RANewOgaTunables.trustThresholds.HIGH_MIN,enterprisesRenamed:true,gbengaEnterprises:'RICH ENTERPRISES',lastMissionDay:d});
  const blocks=takeBlocks();
  if(ending==='takeover'){
   const r=window.RANewOgaLadder?.returnTribute?.();   // F03: the tributed car comes back (THE TAKEOVER); nothing is recreated
   if(r?.ok)wr('finale.tributeReturned',true);
   O().patch({gbengaLeftLA:true,rentalWarehouseOwned:true});
  }
  if(ending==='blessing'){
   O().patch({sundayDinnerInvite:true,earpieceGiven:true});
   window.RAVampGram?.post?.({id:`f07:gbenga-blessing:${d}`,handle:'gbenga',text:'My son is now my oga. I am proud. I am also angry.',likes:0});
  }
  if(ending==='consigliere')O().patch({consigliere:true});
  // §4.3 "Every ending": the Blood X operation begins immediately with Gbenga's blocks already his.
  const wr8=startWarRoom();
  wr('finale',{applied:true,warRoom:wr8,tributeReturned:rd('finale.tributeReturned',false),fameFloorDay:T().finale.FAME_FLOOR_DAY,blocks});
  // §5 FAME: taking the chair is a SPARK; the headlines ride the fame ending's receipt roll (the accepted fame system, unchanged).
  const m=window.RAState.get().life.momentum||{};
  if(!m.sparkId)window.RAState.patch('life.momentum.sparkId','new_oga:chair');
  HEADLINES.forEach((caption,i)=>window.RALife.receipt?.({id:`f07:headline:${i+1}`,caption,vp:false,lane:'money'}));
  return state();
 }

 // ------------------------------------------------------------- WAKE / NIGHT handlers
 const bus=window.RAWakeBus;
 // The queued War Room start lands the first WAKE F04 is available.
 bus?.subscribe?.({id:'F07.queued-grants',fragment:'F07',phase:'wake',priority:68,flag:FLAG,fn:()=>{
  if(rd('finale.warRoom',null)==='queued'&&F()?.enabled?.(F04_FLAG)){wr('finale.warRoom',startWarRoom());}
 }});
 // "Hello. Hello. Oga. Hello." — THE CONSIGLIERE's voice notes continue, addressed to the new oga.
 bus?.subscribe?.({id:'F07.consigliere',fragment:'F07',phase:'wake',priority:69,flag:FLAG,fn:()=>{
  const s=state(),every=T().finale.CONSIGLIERE_EVERY_DAYS,d=day();
  if(!s.consigliere||!s.finaleDay||d<=s.finaleDay||(d-s.finaleDay)%every!==0)return;
  window.RALife.text?.('gbenga','GBENGA','Hello. Hello. Oga. Hello.',{id:`f07:consigliere:${d}`});
 }});
 // §5: fame fires on the next sleep if Day >= 25, otherwise on the first sleep of Day 25. The Life Momentum dimension requirement is waived;
 // the floor is not. (The accepted fame-night handler still evaluates its own rules; this only adds the chair route.)
 bus?.subscribe?.({id:'F07.chair-fame',fragment:'F07',phase:'night',priority:-11,flag:FLAG,fn:()=>{
  const s=state();if(!s.finaleDone)return;
  const m=window.RAState.get().life.momentum||{};if(m.fameFired||m.fameEligible)return;
  if(day()>=T().finale.FAME_FLOOR_DAY)window.RAState.patch('life.momentum.fameEligible',true);
 }});

 // --------------------------------------------------------------- adventures
 // F07-owned environment adapter: the frozen OWAMBE PARTY interior (art_department/production/f07-warehouse-backgrounds, byte-identical copy
 // under assets/f07/backgrounds/) as its own complete opaque background for the finale's warehouse party scenes. Nothing else keys off it, and the
 // shared 'gbenga_rentals' placeholder (M1-M4, F03, the three endings) is untouched. Drawn by the stock nearest-neighbour image path.
 const PARTY_ENV='f07_warehouse_party';
 (()=>{const R=window.RAEnvironments;if(!R||R.get(PARTY_ENV))return;
  const def={id:PARTY_ENV,name:'GBENGA EVENT RENTALS · INGLEWOOD',image:'assets/f07/backgrounds/warehouse_owambe_party_270x480.png',floorY:372,base:1,cover:false,approved:true};
  const get=R.get,all=R.all;R.get=id=>id===PARTY_ENV?def:get(id);R.all=()=>[...all(),def];})();
 const {S,N,E}=window.RAContent,D=window.RAAdventures.define;
 const smackThere=()=>!window.RALife.flag('lilSmackGone');
 // Player-facing explanations for the PLAY refusals (UI strings only; F01's rules are unchanged, no loaner is offered).
 const REFUSAL_TEXT={
  NO_CAR:'THE PLAY WILL NOT RUN: RICH HAS NO CAR. THE PLAY NEEDS A CAR.',
  NO_CAR_FITS:'THE PLAY WILL NOT RUN: NO CAR THAT SEATS THIS CREW. THE PLAY NEEDS A CAR THAT SEATS THE SQUAD.',
  NOBODY_READY:'THE PLAY WILL NOT RUN: NOBODY IS READY.',
  NO_SQUAD:'THE PARTY HAS NO SQUAD: THE OGAS ARE NOT IN THE PLAN.'
 };
 const refusalLine=A=>REFUSAL_TEXT[A.get('refusal')]||'THE PLAY IS NOT AVAILABLE RIGHT NOW.';
 const playNext=(A,res)=>{
  const r=res||{},d=r.data||{};
  if(r.quit||r.outcome==='refused'||d.refused){A.set('refusal',d.code||'QUIT');A.set('refusalReason',d.reason||'');return 'refused';}
  return r.outcome==='win'?'won':'lost';
 };

 D({id:'NEW_OGA_M8',title:'THE TURF WAR',lane:'money',memoryType:'money',start:'job',repeatable:true,oncePerNight:true,available:m8Ready,
  testSetup:ctx=>{ctx.RAState.patch('life.world.day',15);ctx.RALife.addCar({id:ctx.RACars.SUPRA,short:'SUPRA'});
   ctx.RAState.patch('life.newOga',{...ctx.RAState.get().life.newOga,status:'m8_hold',mission:7,rank:4,title:'SENIOR ASSOCIATE',rank4Granted:true,m5Completed:true,m6Completed:true,m7Completed:true,lastMissionDay:14});},
  nodes:{
   job:{env:'bedroom',actors:{left:'rich'},title:'JOB TEXT · THE TURF WAR',
    lines:()=>[N('Gbenga’s first real Showdown for Rich: take a Koreatown block from the Open Mouth Gang.'),
     N('Rich leads a squad of Gbenga’s boys and any Ogas.'),
     ...(smackThere()?[N('Lil Smack is there, chewing.')]:[]),
     N(`The job pays $${T().m8.AUTHORED_PAY.toLocaleString('en-US')}.`)],
    next:'choice'},
   choice:{lines:[N('The block is on the line.')],choices:[
    {label:'GO MYSELF',sub:'SHOWDOWN',next:'play'},
    {label:'SEND THE BOYS',sub:'BACK OUT',next:'send_boys'}
   ]},
   play:{lines:[N('The Showdown begins.')],minigame:{id:'f07_play',params:{kind:'m8'},next:playNext}},
   won:{lines:[N('The Open Mouth Gang loses the block.')],
    end:{outcome:'win',fx:()=>completeM8('win'),memory:{text:'took a Koreatown block from the Open Mouth Gang for Gbenga',lane:'money'}}},
   lost:{lines:[N('The Open Mouth Gang holds the block.')],choices:[
    {label:'TRY AGAIN',next:'play'},
    {label:'SEND THE BOYS',sub:'BACK OUT',next:'send_boys'}
   ]},
   refused:{lines:A=>[N(refusalLine(A))],choices:[
    {label:'SEND THE BOYS',sub:'BACK OUT',next:'send_boys'},
    {label:'NOT YET',next:'postponed'}
   ]},
   postponed:{lines:[N('The Showdown waits.')],end:{outcome:'postponed',memory:{text:'put off the Koreatown Showdown',lane:'money'}}},
   send_boys:{lines:[N('Rich sends the boys.')],
    end:{outcome:'send_the_boys',fx:()=>completeM8('send_the_boys'),memory:{text:'sent Gbenga’s boys to take the Koreatown block',lane:'money'}}}
  }});

 // The finale. D3 (creator-delegated): THE OGAS is mandatory and fills ONE of the THREE lane slots; it is shown preselected and cannot be deselected
 // (a locked entry). The player chooses TWO other eligible lanes. A plan saved before this ruling (no THE OGAS, or three others) is reconciled by
 // routePlan(): THE OGAS is fixed, every other selected lane is kept, and when three others were saved selection reopens with those marked
 // PREVIOUSLY PICKED — nothing is dropped silently. A plan built through this UI can never reach the PLAY without a squad.
 const lanesOf=A=>A.get('lanes')||[];
 const othersOf=A=>lanesOf(A).filter(id=>id!=='ogas');
 function routePlan(A){
  const others=othersOf(A);
  if(others.length>T().finale.PICKS-1){A.set('prior',others);A.set('lanes',['ogas']);return 'plan';}
  A.set('lanes',['ogas',...others]);
  return others.length===T().finale.PICKS-1?'crew':others.length===1?'pick2':'plan';
 }
 const pickNode=(n,next)=>({env:'castle_exterior',actors:{left:'rich'},title:n===1?'THE CASTLE · THE PLAN':undefined,
  enter:A=>{if(!lanesOf(A).includes('ogas'))A.set('lanes',['ogas',...othersOf(A)]);},
  lines:n===1?[N('Rich plans the takeover at the castle with whoever he trusts.'),N('THE OGAS are in the plan. Two more.')]:[N('One more.')],
  choices:A=>{const chosen=lanesOf(A),prior=A.get('prior')||[];
   return [{label:'THE OGAS',sub:'SQUAD · FIXED',when:()=>false,hideLocked:false,next:'plan'},
    ...lanesAvailable().filter(l=>l.id!=='ogas'&&!chosen.includes(l.id)).map(l=>({id:l.id,label:l.label,sub:prior.includes(l.id)?'PREVIOUSLY PICKED':undefined,fx:X=>X.set('lanes',[...lanesOf(X),l.id]),next}))];}});
 const laneLine={
  shannon:'Shannon reads Gbenga’s business filings: the rental company is legally in Mama Gbenga’s name.',
  tristan:'Tristan refuses, then shows up anyway with snacks.',
  carlos:'Carlos knows the warehouse better than anyone, and he wants revenge on everyone including Rich.',
  senator:'Senator follows Rich’s Yoruba commands now.'
 };
 const crewActors=A=>{
  const people=(A.get('lanes')||[]).map(laneById).filter(l=>l?.person).map(l=>l.person),slots=['mid','right','farRight','farLeft'];
  return {left:'rich',...Object.fromEntries(people.slice(0,4).map((p,i)=>[slots[i],p]))};
 };
 const tributed=()=>!!state().m9TributedCar;
 const finish=ending=>A=>completeFinale(ending,{lanes:A.get('lanes')||[]});

 D({id:'NEW_OGA_FINALE',title:'NEW OGA',lane:'money',memoryType:'money',start:'plan',repeatable:true,oncePerNight:true,available:finaleReady,
  testSetup:ctx=>{ctx.RAState.patch('life.world.day',18);ctx.RALife.addCar({id:ctx.RACars.SUPRA,short:'SUPRA'});
   ctx.RAState.patch('life.newOga',{...ctx.RAState.get().life.newOga,status:'finale_pending',mission:10,rank:5,title:'VICE PRESIDENT',rank4Granted:true,m7Completed:true,m8Resolved:true,m9Resolved:true,m9Outcome:'give',m10Completed:true,finaleBegun:true,leftoversAte:true,trust:1,lastMissionDay:17});},
  nodes:{
   plan:{...pickNode(1,'pick2'),title:'THE CASTLE · THE PLAN'},
   pick2:pickNode(2,'crew'),
   // saved plans from before D3 (a third pick, or no THE OGAS) and a refused squad are reconciled here
   pick3:{lines:[N('The plan is reopened with THE OGAS fixed.')],next:A=>routePlan(A)},
   replan:{lines:[N('The plan is reopened with THE OGAS fixed.')],next:A=>routePlan(A)},
   crew:{env:'castle_exterior',actors:crewActors,title:'THE PLAN',
    lines:A=>[...(A.get('lanes')||[]).filter(id=>laneLine[id]).map(id=>N(laneLine[id])),
     N('The date: Gbenga’s own 55th-birthday owambe at the warehouse.'),N('Every canopy Rich ever delivered is up. Every aunty is there.')],next:A=>{const r=routePlan(A);return r==='crew'?'party':r;}},
   party:{env:PARTY_ENV,actors:{left:'rich'},title:'THE PARTY',
    lines:[N('Rich clears Gbenga’s boys through a warehouse full of canopies and stacked chairs without disrupting the owambe.'),
     N('A canopy pole collapses on whoever is under it, Rich included. The aunties are non-combatants: they block lines of fire and critique Rich’s tactics out loud.')],next:A=>{const r=routePlan(A);return r==='crew'?'p1':r;}},
   p1:{minigame:{id:'f07_play',params:A=>({kind:'finale_p1',lanes:A.get('lanes')||[]}),next:(A,res)=>{const n=playNext(A,res);return n==='won'?'office':n==='lost'?'p1_lost':'p1_refused';}}},
   p1_lost:{lines:[N('Gbenga’s boys hold the warehouse.')],choices:[{label:'TRY AGAIN',next:'p1'}]},
   p1_refused:{lines:A=>[N(refusalLine(A))],choices:A=>[
    ...(A.get('refusal')==='NO_SQUAD'?[{label:'REMAKE THE PLAN',next:'replan'}]:[]),
    {label:'NOT YET',next:'postponed'}]},
   postponed:{lines:[N('The owambe waits.')],end:{outcome:'postponed',memory:{text:'put off taking Gbenga’s chair',lane:'money'}}},
   office:{env:PARTY_ENV,actors:{left:'rich',right:'gbenga'},title:'THE OFFICE',
    lines:[N('A glass office, and a framed photo of Gbenga shaking hands with himself.')],next:'duel'},
   duel:{fight:{enemy:'gbenga',params:()=>({hp:window.RAGbengaFight.hpFor(state().trust),env:PARTY_ENV,intro:'GBENGA · OGA OF THE BLOCK'}),
    win:'takeover',lose:'office_lost',run:'office_lost',spared:(A,r)=>r?.octopus==='recruit'?'consigliere':'blessing'}},
   office_lost:{lines:[N('Gbenga keeps the chair.')],choices:[{label:'TRY AGAIN',next:'duel'}]},
   blessing:{env:'gbenga_rentals',actors:{left:'rich',right:'gbenga'},
    lines:[N('Gbenga hands Rich his earpiece.'),N('Mama Gbenga invites Rich to Sunday dinner, still.'),
     N('Gbenga posts on VampGram: “My son is now my oga. I am proud. I am also angry.”'),
     N('GBENGA ENTERPRISES becomes RICH ENTERPRISES. The sign is repainted badly; GBENGA is still faintly visible.')],
    end:{outcome:'blessing',fx:finish('blessing'),memory:{text:'became the NEW OGA: Gbenga retired and gave Rich his blessing',lane:'money'}}},
   consigliere:{env:'gbenga_rentals',actors:{left:'rich',right:'gbenga'},
    lines:[N('Gbenga stays in the office as Rich’s advisor.'),S('gbenga','Hello. Hello. Oga. Hello.'),
     N('GBENGA ENTERPRISES becomes RICH ENTERPRISES. The sign is repainted badly; GBENGA is still faintly visible.')],
    end:{outcome:'consigliere',fx:finish('consigliere'),memory:{text:'became the NEW OGA: Gbenga stayed on as consigliere',lane:'money'}}},
   takeover:{env:'gbenga_rentals',actors:{left:'rich'},
    lines:()=>[N('Gbenga leaves LA. His rental warehouse becomes Rich’s.'),
     ...(tributed()?[N('The canopy with Rich’s tributed car is pulled back: it’s still there. Rich gets it back.')]:[]),
     N('GBENGA ENTERPRISES becomes RICH ENTERPRISES. The sign is repainted badly; GBENGA is still faintly visible.')],
    end:{outcome:'takeover',fx:finish('takeover'),memory:{text:'became the NEW OGA: took Gbenga’s chair and his warehouse',lane:'money'}}}
  }});

 // M8 rides the accepted one-per-WAKE arbiter at the priority F03 reserved for it (77). It is registered as a plain WAKE trigger, not as
 // a voice note: M8 is JOB TEXT ONLY.
 window.RAWakeTriggers?.define?.([{adventure:'NEW_OGA_M8',priority:77,when:m8Ready}]);
 // The finale rides the same one-per-WAKE arbiter just below VampGPT (74), which must complete first.
 window.RAWakeTriggers?.define?.([{adventure:'NEW_OGA_FINALE',priority:72,when:finaleReady}]);

 window.RAF07={FLAG,enabled,m8Ready,finaleReady,completeM8,completeFinale,lanes:LANES,lanesAvailable,takeBlocks,startWarRoom,HEADLINES};
})();
