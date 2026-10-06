// ============================================================================
// F03 NEW_OGA_LADDER_CLOSE — M9 THE TRIBUTE + M10 VICE PRESIDENT + the VampGPT scene (OPEN source: Rich_Alucard_PLAYMAKERS_Patch1_NEW_OGA)
// and the PRE-FCPB restoration of THE ALTERNATIVE (js/data/btf/adventures/new_oga_m4.js). DARK behind F03.new_oga_ladder_close.
//
// NOT here: M8 THE TURF WAR / the finale (F07 m8_and_finale). M9 waits for `life.newOga.m8Resolved` (ANY resolved M8 outcome,
// SEND THE BOYS included); F03 never writes it.
//
// Delivery: every mission arrives by WAKE, at most ONE per WAKE (the accepted RAWakeTriggers arbiter), and never on the WAKE of
// the mission before it (`day > lastMissionDay`). VampGPT arrives on the WAKE AFTER M10.
// State: ladder fields extend the accepted lane (life.newOga, via RANewOga.patch). Koreatown and the recruit queue live in
// save.frag.F03 — F03 is the sole owner of Koreatown progression; F04 only reads it.
// ============================================================================
(function(){
 'use strict';
 if(window.RANewOgaLadder)return;
 const FLAG='F03.new_oga_ladder_close',F04_FLAG='F04.war_room';
 const T=()=>window.RANewOgaTunables||{};
 const O=()=>window.RANewOga;
 const V=()=>window.RAVehicles;
 const L=()=>window.RALife;
 const F=()=>window.RAFeatures;
 const enabled=()=>!!F()?.enabled?.(FLAG);
 const state=()=>O()?.current?.()||{};
 const day=()=>L().today().day;
 const rd=(path,dflt)=>window.RAFrag.read('F03',path,dflt);
 const wr=(path,value)=>window.RAFrag.patch('F03',path,value);
 const tunables=()=>({trust:{M9_GIVE:0,M9_OTHER:-1,M9_NAH:0,...(T().trust||{})},m10:{WEEKLY_INCOME:15000,REASK_DAYS:7,...(T().m10||{})}});

 // ------------------------------------------------------------------ cars
 // A car is AVAILABLE when Rich holds it and it is not TRIBUTED (RALife.ownedCars already hides those), LOST or IMPOUNDED.
 // LOST / IMPOUNDED are read from the accepted ownershipStatus field; this base has no other runtime record of them.
 const carState=c=>{
  if(!c)return null;
  if(V()?.isTributed?.(c.id))return 'TRIBUTED';
  const s=String(c.ownershipStatus||'').toUpperCase();
  return s==='LOST'||s==='IMPOUNDED'?s:'AVAILABLE';
 };
 const availableCars=()=>V().available();
 // TOUGE reports its car as a catalog key; map it back to the owned record so the drive is counted for THAT car.
 function ownedCarForTougeKey(key){
  if(!key)return null;
  const cars=L().ownedCars(),C=window.RACars;
  return cars.find(c=>(C?.keyOf?.(c)||'supra')===key)||null;
 }
 function recordDrive(idOrCar,{by=1}={}){
  if(!enabled())return {ok:false,reason:'flag-off'};
  const id=typeof idOrCar==='string'?idOrCar:idOrCar?.id;
  if(!id)return {ok:false,reason:'no-car'};
  if(V()?.isTributed?.(id))return {ok:false,reason:'tributed'};
  return V()?.recordDrive?.(id,{by})||{ok:false,reason:'no-service'};
 }
 // The favorite: the MOST-DRIVEN available car (ties: the one Rich got first).
 function favoriteCar(){
  let best=null,bestN=-1;
  for(const c of availableCars()){const n=Number(V()?.driveCount?.(c.id))||0;if(n>bestN){best=c;bestN=n;}}
  return best;
 }
 // OFFER ANOTHER CAR: only while Rich holds an AVAILABLE Urus or Aventador. Prefers one that is not the favorite.
 function exoticCar(){
  const C=window.RACars?.CATALOG||{},ids=[C.urus?.id,C.aventador?.id].filter(Boolean),fav=favoriteCar();
  const cars=availableCars().filter(c=>ids.includes(c.id));
  return cars.find(c=>c.id!==fav?.id)||cars[0]||null;
 }
 const tributeCar=car=>car&&V()?.tribute?.(car.id,{reason:'new_oga:m9'})?.ok?car.id:null;
 // TAKEOVER ending (F07 calls this): the tributed car comes back; the TRIBUTED mark is cleared, nothing is recreated.
 function returnTribute(){
  const id=state().m9TributedCar;if(!id)return {ok:false,reason:'no-tribute'};
  const r=V()?.returnTribute?.(id);if(!r?.ok)return r||{ok:false,reason:'no-service'};
  O().patch({m9TributeReturnedDay:day()});return {ok:true,id};
 }

 // ---------------------------------------------------------------------- M9
 // M9 requires m8Resolved (any resolved M8 outcome, SEND THE BOYS included) and a car to give. With no available car it WAITS.
 const m9Ready=S=>{
  if(!enabled())return false;
  const s=S.life?.newOga;if(!s)return false;
  return !!s.m8Resolved&&!s.m9Resolved&&S.day>s.lastMissionDay&&!!favoriteCar();
 };
 function completeM9(outcome){
  const s=state();if(s.m9Resolved)return s;
  const d=day(),tv=tunables().trust;
  if(outcome==='give'||outcome==='other'){
    const carId=tributeCar(outcome==='give'?favoriteCar():exoticCar());
    if(!carId)return s; // A stale choice cannot grant a promotion with no car.
   return O().patch({status:'vice_president',mission:9,rank:5,title:'VICE PRESIDENT',m9Resolved:true,m9Outcome:outcome,
    m9TributedCar:carId,m9TributedDay:carId?d:null,trust:s.trust+(Number(outcome==='other'?tv.M9_OTHER:tv.M9_GIVE)||0),lastMissionDay:d});
  }
  if(outcome==='nah'){
   return O().patch({status:'senior_associate',mission:9,rank:4,title:'SENIOR ASSOCIATE',m9Resolved:true,m9Outcome:'nah',
    m9TributedCar:null,m9TributedDay:null,trust:s.trust+(Number(tv.M9_NAH)||0),lastMissionDay:d});
  }
  throw new Error(`Unknown M9 outcome ${outcome}`);
 }

 // ------------------------------------------------------ Koreatown (F03-OWNED)
 // F03 defines the district and owns its progression state. F04 and F07 READ it (koreatown()); nobody else defines or shadows it.
 // M10 grants control to Rich. While the War Room is inactive the grant is QUEUED (save.frag.F03.koreatown.pending) and applied
 // on the first WAKE the War Room is active.
 const warRoomActive=()=>!!F()?.enabled?.(F04_FLAG)&&window.RAFrag.read('F04','active',false)===true&&!!window.RAWarRoomCrew&&!!window.RADistricts?.get?.('koreatown');
 const koreatown=()=>{const k=rd('koreatown',{})||{};let controlled=false;try{controlled=window.RADistricts?.get?.('koreatown')?.state==='CONTROLLED'&&window.RADistricts.get('koreatown').holder==='rich';}catch(e){}
  return {granted:!!k.granted,pending:!!k.pending,grantDay:k.grantDay??null,appliedDay:k.appliedDay??null,controlled};};
 function applyKoreatown(){
  const k=rd('koreatown',{});if(!k.granted||!k.pending)return false;
  if(!warRoomActive())return false;
  try{window.RADistricts.setControl('koreatown','CONTROLLED',{holder:'rich',reason:'new_oga:m10'});}catch(e){console.error('F03 koreatown grant',e);return false;}
  wr('koreatown',{...k,pending:false,appliedDay:day()});return true;
 }
 function grantKoreatown(){
  if(rd('koreatown.granted',false))return;
  wr('koreatown',{granted:true,pending:true,grantDay:day(),appliedDay:null});
  applyKoreatown();
 }

 // ----------------------------------------------------------------- crew
 // M10's two boys are GENERIC recruits through the War Room's normal recruit path: normal crew cap (RAWarRoomCrew.recruit),
 // normal mortality (ordinary RACrew statuses), and QUEUED while the crew is full or the War Room is inactive.
 // The M8 squad is ON LOAN and never consumes a slot (units flagged meta.onLoan are not counted by the cap).
 // Class and name are PLACEHOLDERS: the source authors neither (SOURCE_REQUIRED). The class cycles the six existing classes.
 const recruitSpec=slot=>{const C=window.RAWarRoomCrew?.CLASSES||['MUSCLE'];return {id:`new_oga_m10_recruit_${slot}`,name:`NEW RECRUIT ${slot}`,cls:C[(day()+slot)%C.length],source:'new_oga_m10'};};
 function drainCrew(){
  const q=[...(rd('crew.queue',[])||[])];if(!q.length||!warRoomActive())return {recruited:[],queued:q.length};
  const got=[],left=[];
  for(const spec of q){
   if(left.length){left.push(spec);continue;}
   const r=window.RAWarRoomCrew.recruit(spec);
   if(r.ok||r.reason==='already-defined')got.push(spec.id);else left.push(spec);   // roster-full (or any refusal): stays queued
  }
  wr('crew',{queue:left,recruited:[...(rd('crew.recruited',[])||[]),...got]});
  return {recruited:got,queued:left.length};
 }
 function grantRecruits(){
  if((rd('crew.queue',[])||[]).length||(rd('crew.recruited',[])||[]).length)return;
  wr('crew',{queue:[recruitSpec(1),recruitSpec(2)],recruited:[]});
  drainCrew();
 }

 // --------------------------------------------------------------------- M10
 // Creator ruling (docs/engineering/F03_NEW_OGA_LADDER_CLOSE.md): M10 arrives
 // after M9 including NAH; normal grants remain reachable. The withheld flag is
 // retained only for compatibility with older explicitly-withheld saves.
 const m10Ready=S=>{
  if(!enabled())return false;
  const s=S.life?.newOga;if(!s||!s.m9Resolved||s.m9GrantsWithheld||s.m10Completed||s.finaleBegun)return false;
  return S.day>s.lastMissionDay;
 };
 function applyM10Grants(){
  const s=state();if(s.m10GrantsApplied||s.m9GrantsWithheld)return s;
  O().patch({m10GrantsApplied:true,m10GrantDay:day(),office:'vice_president'});
  grantKoreatown();grantRecruits();
  return state();
 }
 function completeM10(){
  const s=state();if(s.m10Completed)return s;
  applyM10Grants();
  return O().patch({status:'vice_president',mission:10,rank:5,title:'VICE PRESIDENT',m10Fired:true,m10Completed:true,lastMissionDay:day()});
 }

 // ------------------------------------------------------------------ VampGPT
 // The NEXT WAKE after M10 (or an older explicitly-withheld M9 save). ...SAY LESS. records finaleBegun for F07 (the finale is F07's);
 // NAH, I'M GOOD HERE. re-asks in REASK_DAYS sleeps, repeatable.
 const vampgptReady=S=>{
  if(!enabled())return false;
  const s=S.life?.newOga;if(!s||!s.m9Resolved||s.finaleBegun)return false;
  if(!s.m10Completed&&!s.m9GrantsWithheld)return false;
  if(s.m10VampgptReaskDay!=null&&S.day<s.m10VampgptReaskDay)return false;
  return S.day>s.lastMissionDay;
 };
 function completeVampgpt(outcome){
  const s=state(),d=day();
  if(outcome==='say_less'){
   if(s.finaleBegun)return s;
   return O().patch({status:'finale_pending',m10Outcome:'say_less',m10GrantsWithheld:!!s.m9GrantsWithheld,finaleBegun:true,lastMissionDay:d});
  }
  if(outcome==='nah_stay'){
   return O().patch({status:s.m10GrantsApplied?'vice_president':'senior_associate',m10Outcome:'nah_stay',m10GrantsWithheld:!!s.m9GrantsWithheld,
    m10VampgptReaskDay:d+(Number(tunables().m10.REASK_DAYS)||7),lastMissionDay:d});
  }
  throw new Error(`Unknown VampGPT outcome ${outcome}`);
 }

 // ------------------------------------------------------------- WAKE handlers
 // Weekly VP income: the authored $15K/week (tunables.m10.WEEKLY_INCOME), every 7th day after the grant.
 window.RAWakeBus?.subscribe?.({id:'F03.m10-income',fragment:'F03',phase:'wake',priority:73,flag:FLAG,fn:()=>{
  const s=state(),grant=Number(s.m10GrantDay)||0,d=day();
  if(!s.m10GrantsApplied||!grant||d<=grant||(d-grant)%7!==0)return;
  const amount=tunables().m10.WEEKLY_INCOME;
  if(window.RAMoneyLedger)window.RAMoneyLedger.credit(amount,{source:'new_oga:m10',memo:'vice president weekly'});else L().addMoney(amount);
 }});
 // Queued grants (Koreatown, recruits) land the first WAKE their system is available.
 window.RAWakeBus?.subscribe?.({id:'F03.queued-grants',fragment:'F03',phase:'wake',priority:74,flag:FLAG,fn:()=>{applyKoreatown();drainCrew();}});

 // --------------------------------------------------------------- drive telemetry (flag ON only)
 const prevObserve=window.RANewOga?.observeTouge;
 if(typeof prevObserve==='function'){
  window.RANewOga.observeTouge=function(args){
   const result=prevObserve.call(this,args);
   try{if(enabled()){const car=ownedCarForTougeKey(args?.result?.data?.car)||favoriteCar();if(car)recordDrive(car.id);}}catch(e){console.error('F03 touge telemetry',e);}
   return result;
  };
 }
 const prevMaybeStop=window.RANodd?.maybeStop;
 if(typeof prevMaybeStop==='function'){
  window.RANodd.maybeStop=function(){
   try{if(enabled()){const id=window.RAAdventures?.active?.()?.vars?.car;if(id)recordDrive(id);}}catch(e){console.error('F03 route telemetry',e);}
   return prevMaybeStop.apply(this,arguments);
  };
 }

 // ------------------------------------------------------------------- registry
 // F03 DEFINES Koreatown (sole owner). RADistricts.define throws on a second definer, so a shadow cannot be added silently.
 try{window.RADistricts?.define?.({id:'koreatown',fragment:'F03',label:'Koreatown'});}catch(e){if(!/already defined/.test(String(e.message)))console.error(e);}

 // --------------------------------------------------------------- adventures
 const {S,N,RC}=window.RAContent,D=window.RAAdventures.define;
 const carName=c=>(c?.short||c?.model||'car').toLowerCase();

 D({id:'NEW_OGA_M9',title:'THE TRIBUTE',lane:'money',memoryType:'money',start:'voice',available:m9Ready,
  testSetup:ctx=>{ctx.RAState.patch('life.world.day',15);ctx.RALife.addCar({id:ctx.RACars.SUPRA,short:'SUPRA'});
   ctx.RAState.patch('life.newOga',{...ctx.RAState.get().life.newOga,status:'m8_hold',mission:7,rank:4,title:'SENIOR ASSOCIATE',rank4Granted:true,m7Completed:true,m6Completed:true,m5Completed:true,m8Resolved:true,lastMissionDay:14});},
  nodes:{
   voice:{env:'gbenga_rentals',actors:{left:'rich',right:'gbenga'},title:'VOICE NOTE · THE TRIBUTE',
    lines:()=>{const c=favoriteCar();return [N(c?`uncle wants your ${carName(c)} under his canopy commitment expensive as fuck`:"uncle wants your favorite car not a handshake")];},
    next:'choice'},
   choice:{lines:[N("car or promotion pick your pain")],choices:[
    {label:'GIVE IT',next:'give'},
    {label:'OFFER ANOTHER CAR',sub:'URUS / AVENTADOR',when:()=>!!exoticCar(),hideLocked:false,next:'other'},
    {label:'NAH',next:'nah'}
   ]},
   give:{lines:()=>{const c=favoriteCar();return [N(c?`${carName(c)} under uncles canopy gbenga crying like its graduation`:"car gone uncle emotional damn")];},
    end:{outcome:'give',fx:()=>completeM9('give'),memory:{text:'tributed the car Rich drove most to Gbenga',lane:'cars'}}},
   other:{lines:[N("exotic car accepted uncle likes expensive apologies")],
    end:{outcome:'other',fx:()=>completeM9('other'),memory:{text:'tributed the exotic instead of the favorite car',lane:'cars'}}},
   nah:{lines:[N("car stays rank stays four uncle petty too")],
    end:{outcome:'nah',fx:()=>completeM9('nah'),memory:{text:'refused to tribute a car for the NEW OGA ladder',lane:'cars'}}}
  }});

 D({id:'NEW_OGA_M10',title:'VICE PRESIDENT',lane:'money',memoryType:'money',start:'voice',available:m10Ready,
  testSetup:ctx=>{ctx.RAState.patch('life.world.day',16);ctx.RALife.addCar({id:ctx.RACars.SUPRA,short:'SUPRA'});
   ctx.RAState.patch('life.newOga',{...ctx.RAState.get().life.newOga,status:'vice_president',mission:9,rank:5,title:'VICE PRESIDENT',rank4Granted:true,m7Completed:true,m6Completed:true,m5Completed:true,m8Resolved:true,m9Resolved:true,m9Outcome:'give',lastMissionDay:15});},
  nodes:{
   voice:{env:'gbenga_rentals',actors:{left:'rich',right:'gbenga'},title:'VICE PRESIDENT',
    lines:[N("vice president now koreatown block $15000 a week two boys warehouse office damn")],
    next:'grant'},
   grant:{lines:[N("gold nameplate vice president rent finally scared of you")],end:{outcome:'vice_president',fx:()=>completeM10(),memory:{text:'was named VICE PRESIDENT by Gbenga',lane:'money'}}}
  }});

 D({id:'NEW_OGA_VAMPGPT',title:'VAMPGPT',lane:'money',memoryType:'money',start:'vampgpt',repeatable:true,available:vampgptReady,
  testSetup:ctx=>{ctx.RAState.patch('life.world.day',17);ctx.RALife.addCar({id:ctx.RACars.SUPRA,short:'SUPRA'});
   ctx.RAState.patch('life.newOga',{...ctx.RAState.get().life.newOga,status:'vice_president',mission:10,rank:5,title:'VICE PRESIDENT',rank4Granted:true,m7Completed:true,m8Resolved:true,m9Resolved:true,m9Outcome:'give',m10Completed:true,m10GrantsApplied:true,lastMissionDay:16});},
  nodes:{
   vampgpt:{env:'bedroom',actors:{left:'rich'},title:'VAMPGPT · WAKE',
    lines:[S('vampgpt',"oga you listening"),RC("yeah bro whats up"),S('vampgpt',"you know oga means boss right"),S('vampgpt',"boss bro act like it"),S('vampgpt',"climbing his ladder for what own the damn building")],
    choices:[{label:'…SAY LESS.',next:'say_less'},{label:'NAH, I’M GOOD HERE.',next:'nah_stay'}]},
   say_less:{lines:[N("vampgpt shuts up finally time to take the chair")],
    end:{outcome:'say_less',fx:()=>completeVampgpt('say_less'),memory:{text:'decided to take Gbenga’s chair',lane:'money'}}},
   nah_stay:{lines:[N("vice president for now vampgpt back in seven nights like a subscription")],
    end:{outcome:'nah_stay',fx:()=>completeVampgpt('nah_stay'),memory:{text:'stayed VICE PRESIDENT after all',lane:'money'}}}
  }});

 // Mission voice notes (accepted ladder 85 … 78; 77 is reserved for NEW_OGA_M8 / F07): F03 takes 76 (M9) and 75 (M10).
 window.RAWakeBus?.voiceNotes?.define?.('F03',[
  {adventure:'NEW_OGA_M9',priority:76,when:m9Ready,flag:FLAG},
  {adventure:'NEW_OGA_M10',priority:75,when:m10Ready,flag:FLAG}
 ]);
 // The mission voice-note band (75–89) is full, so VampGPT rides the SAME one-per-WAKE arbiter just below it. The integration
 // owner may re-number it (INTEGRATION REQUEST); ordering against M10 is unaffected because M10 must complete first.
 window.RAWakeTriggers?.define?.([{adventure:'NEW_OGA_VAMPGPT',priority:74,when:vampgptReady}]);

 window.RANewOgaLadder={FLAG,enabled,carState,availableCars,favoriteCar,exoticCar,tributeCar,returnTribute,recordDrive,ownedCarForTougeKey,
  m9Ready,m10Ready,vampgptReady,completeM9,applyM10Grants,completeM10,completeVampgpt,koreatown,applyKoreatown,drainCrew,warRoomActive};
})();
