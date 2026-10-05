// ============================================================================
// F03 NEW_OGA_LADDER_CLOSE — M9 THE TRIBUTE + M10 VICE PRESIDENT (OPEN source:
// Rich_Alucard_PLAYMAKERS_Patch1_NEW_OGA), plus the PRE-FCPB restoration of the
// THE ALTERNATIVE chair activity. Integrates DARK behind F03.new_oga_ladder_close.
//
// NOT here: M8 THE TURF WAR / the finale (F07 m8_and_finale). M8's mission voice-note
// priority 77 is intentionally left free for F07; F03 uses 76 (M9) and 75 (M10).
//
// State: extends the accepted NEW OGA lane (life.newOga) with additive fields through
// RANewOga.patch — the same lane object M1–M7 use, so the business card and the F07
// finale read one ladder. With the flag OFF no field is ever written.
//
// TRIBUTED vehicles: RAVehicles.tribute() records the tribute; the accepted ownership
// record is NOT deleted (RALife.hasCar stays true) so the finale can return the car.
// ============================================================================
(function(){
 'use strict';
 if(window.RANewOgaLadder)return;
 const FLAG='F03.new_oga_ladder_close';
 const T=()=>window.RANewOgaTunables||{};
 const O=()=>window.RANewOga;
 const V=()=>window.RAVehicles;
 const L=()=>window.RALife;
 const F=()=>window.RAFeatures;
 const enabled=()=>!!F()?.enabled?.(FLAG);
 const state=()=>O()?.current?.()||{};
 const day=()=>L().today().day;
 const tunables=()=>({trust:{M9_OTHER:-1,M9_NAH:-1,...(T().trust||{})},m10:{WEEKLY_INCOME:15000,REASK_DAYS:7,...(T().m10||{})}});

 // ---------------------------------------------------------------- telemetry
 // A TOUGE result reports its car as a catalog key (e.g. 'supra'); map it back to the
 // owned record so RAVehicles.recordDrive can count it. Falls back to the currently
 // selected / favorite car.
 function ownedCarForTougeKey(key){
  if(!key)return null;
  const cars=L().ownedCars(),C=window.RACars;
  if(C?.SUPRA&&key==='supra'){const supra=cars.find(c=>c.id===C.SUPRA);if(supra)return supra;}
  return cars.find(c=>(C?.keyOf?.(c)||'supra')===key)||null;
 }
 function recordDrive(idOrCar,{by=1,source=null}={}){
  if(!enabled())return {ok:false,reason:'flag-off'};
  const id=typeof idOrCar==='string'?idOrCar:idOrCar?.id;
  if(!id)return {ok:false,reason:'no-car'};
  if(V()?.isTributed?.(id))return {ok:false,reason:'tributed'};
  return V()?.recordDrive?.(id,{by})||{ok:false,reason:'no-service'};
 }
 function favoriteCar(){
  const cars=L().ownedCars().filter(c=>!V()?.isTributed?.(c));
  if(!cars.length)return null;
  let best=null,bestN=-1;
  for(const c of cars){const n=Number(V()?.driveCount?.(c))||0;if(n>bestN){best=c;bestN=n;}}
  return best;
 }
 function alternateCar(){
  const C=window.RACars?.CATALOG||{},exotic=[C.urus?.id,C.aventador?.id].filter(Boolean);
  const fav=favoriteCar(),cars=L().ownedCars().filter(c=>!V()?.isTributed?.(c));
  return cars.find(c=>exotic.includes(c.id)&&c.id!==fav?.id)||cars.find(c=>exotic.includes(c.id))||null;
 }
 function tributeCar(car){return car?((V()?.tribute?.(car.id,{reason:'new_oga:m9'}),car.id)):null;}

 // ---------------------------------------------------------------------- M9
 const hasDriveableCar=()=>!!favoriteCar();
 const m9Ready=S=>{
  if(!enabled())return false;
  const s=S.life?.newOga;if(!s)return false;
  return s.rank===4&&s.rank4Granted&&s.m7Completed&&!s.m9Resolved&&S.day>s.lastMissionDay&&hasDriveableCar();
 };
 function completeM9(outcome){
  const s=state();if(s.m9Resolved)return s;
  const d=day(),tv=tunables().trust;
  if(outcome==='give'||outcome==='other'){
   const car=outcome==='give'?favoriteCar():alternateCar();
   const carId=tributeCar(car);
   return O().patch({status:'vice_president',mission:9,rank:5,title:'VICE PRESIDENT',m9Resolved:true,m9Outcome:outcome,
    m9TributedCar:carId,m9TributedDay:carId?d:null,trust:s.trust+(outcome==='other'?(Number(tv.M9_OTHER)||0):0),lastMissionDay:d});
  }
  if(outcome==='nah'){
   return O().patch({status:'senior_associate',mission:9,rank:4,title:'SENIOR ASSOCIATE',m9Resolved:true,m9Outcome:'nah',
    m9GrantsWithheld:true,m9TributedCar:null,m9TributedDay:null,trust:s.trust+(Number(tv.M9_NAH)||0),lastMissionDay:d});
  }
  throw new Error(`Unknown M9 outcome ${outcome}`);
 }

 // --------------------------------------------------------------------- M10
 const m10Ready=S=>{
  if(!enabled())return false;
  const s=S.life?.newOga;if(!s||!s.m9Resolved||s.finaleBegun)return false;
  if(s.m10Outcome==='nah_stay')return S.day>=(Number(s.m10VampgptReaskDay)||0)&&S.day>s.lastMissionDay;
  if(s.m10Completed)return false;
  return S.day>s.lastMissionDay;
 };
 function applyM10Grants(){
  const s=state();
  if(s.m10GrantsApplied||s.m9GrantsWithheld)return s;
  const d=day();
  O().patch({status:'vice_president',mission:10,rank:5,title:'VICE PRESIDENT',m10GrantsApplied:true,m10GrantDay:d,
   office:'vice_president',recruits:['gbenga_boy_1','gbenga_boy_2']});
  // Koreatown: F03 owns the definition so the later War Room (F04) consumes it instead of redefining it.
  try{window.RADistricts?.setControl?.('koreatown','CONTROLLED',{holder:'rich',reason:'new_oga:m10'});}catch(e){console.error('F03 koreatown grant',e);}
  for(const id of ['gbenga_boy_1','gbenga_boy_2'])try{window.RACrew?.story?.(id,'recruited',true);}catch(e){console.error('F03 recruit',e);}
  return state();
 }
 function completeM10(outcome){
  const s=state(),d=day(),tt=tunables();
  if(outcome==='say_less'){
   if(s.finaleBegun)return s;
   return O().patch({status:'finale_pending',mission:10,rank:s.rank,m10Fired:true,m10Completed:true,m10Outcome:'say_less',
    m10GrantsApplied:!!s.m10GrantsApplied,m10GrantsWithheld:!!s.m9GrantsWithheld,finaleBegun:true,lastMissionDay:d});
  }
  if(outcome==='nah_stay'){
   return O().patch({status:s.m10GrantsApplied?'vice_president':'senior_associate',mission:10,m10Fired:true,m10Completed:true,
    m10Outcome:'nah_stay',m10GrantsApplied:!!s.m10GrantsApplied,m10GrantsWithheld:!!s.m9GrantsWithheld,
    m10VampgptReaskDay:d+(Number(tt.m10.REASK_DAYS)||7),lastMissionDay:d});
  }
  throw new Error(`Unknown M10 outcome ${outcome}`);
 }
 const koreatownControlled=()=>{try{return window.RADistricts?.get?.('koreatown')?.state==='CONTROLLED';}catch(e){return false;}};

 // ------------------------------------------------------- weekly VP income (WAKE)
 window.RAWakeBus?.subscribe?.({
  id:'F03.m10-income',fragment:'F03',phase:'wake',priority:71,flag:FLAG,
  fn:()=>{
   const s=state(),grant=Number(s.m10GrantDay)||0,d=day();
   if(!s.m10GrantsApplied||!grant||d<=grant||(d-grant)%7!==0)return;
   window.RAMoneyLedger?.credit?.(tunables().m10.WEEKLY_INCOME,{source:'new_oga:m10',memo:'vice president weekly'});
  }
 });

 // --------------------------------------------------------------- drive wrappers
 const prevObserve=window.RANewOga?.observeTouge;
 if(typeof prevObserve==='function'){
  window.RANewOga.observeTouge=function(args){
   const result=prevObserve.call(this,args);
   try{if(enabled()){const car=ownedCarForTougeKey(args?.result?.data?.car)||favoriteCar();if(car)recordDrive(car.id,{source:'touge'});}}catch(e){console.error('F03 touge telemetry',e);}
   return result;
  };
 }
 const prevMaybeStop=window.RANodd?.maybeStop;
 if(typeof prevMaybeStop==='function'){
  window.RANodd.maybeStop=function(){
   try{if(enabled()){const id=window.RAAdventures?.active?.()?.vars?.car;if(id)recordDrive(id,{source:'route'});}}catch(e){console.error('F03 route telemetry',e);}
   return prevMaybeStop.apply(this,arguments);
  };
 }

 // ------------------------------------------------------------------- registry
 try{window.RADistricts?.define?.({id:'koreatown',fragment:'F03',label:'Koreatown'});}catch(e){if(!/already defined/.test(String(e.message)))console.error(e);}
 for(const [id,name] of [['gbenga_boy_1',"Gbenga's Boy 1"],['gbenga_boy_2',"Gbenga's Boy 2"]])try{window.RACrew?.define?.({id,fragment:'F03',name,class:'oga'});}catch(e){if(!/already defined/.test(String(e.message)))console.error(e);}

 // --------------------------------------------------------------- adventures
 const {S,N}=window.RAContent,D=window.RAAdventures.define;

 D({id:'NEW_OGA_M9',title:'THE TRIBUTE',lane:'money',memoryType:'money',start:'voice',available:m9Ready,
  testSetup:ctx=>{ctx.RAState.patch('life.world.day',15);ctx.RALife.addCar({id:ctx.RACars.SUPRA,short:'SUPRA'});
   ctx.RAState.patch('life.newOga',{...ctx.RAState.get().life.newOga,status:'m8_hold',mission:7,rank:4,title:'SENIOR ASSOCIATE',rank4Granted:true,m7Completed:true,m6Completed:true,m5Completed:true,lastMissionDay:14});},
  nodes:{
   voice:{env:'gbenga_rentals',actors:{left:'rich',right:'gbenga'},title:'VOICE NOTE · THE TRIBUTE',
    lines:()=>{const c=favoriteCar();return [N(c?`Gbenga asks for a sign of commitment: the ${(c.short||c.model||'car').toLowerCase()} — the car Rich has driven most. It will sit in his warehouse under a canopy.`:'Gbenga asks for a sign of commitment: your favorite car.')];},
    next:'choice'},
   choice:{lines:[N('The car is on the line.')],choices:[
    {label:'GIVE IT',next:'give'},
    {label:'OFFER ANOTHER CAR',sub:'URUS / AVENTADOR',when:()=>!!alternateCar(),hideLocked:false,next:'other'},
    {label:'NAH',next:'nah'}
   ]},
   give:{lines:()=>{const c=favoriteCar();return [N(c?`Rich gives up the ${(c.short||c.model||'car').toLowerCase()}. It sits in Gbenga's warehouse under a canopy. Gbenga cries a little.`:'Rich gives up the car. Gbenga cries a little.')];},
    end:{outcome:'give',fx:()=>completeM9('give'),memory:{text:'tributed the car Rich drove most to Gbenga',lane:'cars'}}},
   other:{lines:[N('Gbenga accepts the flex. The exotic is tributed instead.')],
    end:{outcome:'other',fx:()=>completeM9('other'),memory:{text:'tributed the exotic instead of the favorite car',lane:'cars'}}},
   nah:{lines:[N('Gbenga hears the no. The car stays. The rank stays four.')],
    end:{outcome:'nah',fx:()=>completeM9('nah'),memory:{text:'refused to tribute a car for the NEW OGA ladder',lane:'cars'}}}
  }});

 D({id:'NEW_OGA_M10',title:'VICE PRESIDENT',lane:'money',memoryType:'money',start:'voice',repeatable:true,available:m10Ready,
  testSetup:ctx=>{ctx.RAState.patch('life.world.day',16);ctx.RALife.addCar({id:ctx.RACars.SUPRA,short:'SUPRA'});
   ctx.RAState.patch('life.newOga',{...ctx.RAState.get().life.newOga,status:'vice_president',mission:9,rank:5,title:'VICE PRESIDENT',rank4Granted:true,m7Completed:true,m6Completed:true,m5Completed:true,m9Resolved:true,m9Outcome:'give',lastMissionDay:15});},
  nodes:{
   voice:{env:'gbenga_rentals',actors:{left:'rich',right:'gbenga'},title:'VICE PRESIDENT',
    lines:()=>state().m9GrantsWithheld?[]:[N('Gbenga names Rich VICE PRESIDENT: a block of his own in Koreatown, fifteen thousand a week, two of his boys, and an office at the warehouse.')],
    next:()=>(state().m9GrantsWithheld||state().m10GrantsApplied)?'vampgpt':'grant'},
   grant:{lines:[N('The nameplate says VICE PRESIDENT in gold.')],enter:()=>applyM10Grants(),next:'vampgpt'},
   vampgpt:{env:'bedroom',actors:{left:'rich'},title:'VAMPGPT · WAKE',
    lines:[S('vampgpt','oga.'),N('Rich already knows what is coming.'),S('vampgpt','you know what oga means right.'),S('vampgpt','…boss.'),S('vampgpt','why are you climbing his ladder. you could own the building.')],
    choices:[{label:'…SAY LESS.',next:'say_less'},{label:'NAH, I\u2019M GOOD HERE.',next:'nah_stay'}]},
   say_less:{lines:[N('VampGPT goes quiet. The plan for the chair begins.')],
    end:{outcome:'say_less',fx:()=>completeM10('say_less'),memory:{text:'decided to take Gbenga\u2019s chair',lane:'money'}}},
   nah_stay:{lines:[N('Rich stays VICE PRESIDENT. VampGPT will ask again in seven sleeps.')],
    end:{outcome:'nah_stay',fx:()=>completeM10('nah_stay'),memory:{text:'stayed VICE PRESIDENT after all',lane:'money'}}}
  }});

 // Mission voice notes: the accepted ladder occupies 85 (M1) … 78 (M7). 77 is reserved for NEW_OGA_M8 (F07);
 // F03 takes the next free numbers 76 (M9) and 75 (M10), so the WAKE arbitration keeps ladder order.
 window.RAWakeBus?.voiceNotes?.define?.('F03',[
  {adventure:'NEW_OGA_M9',priority:76,when:m9Ready,flag:FLAG},
  {adventure:'NEW_OGA_M10',priority:75,when:m10Ready,flag:FLAG}
 ]);

 window.RANewOgaLadder={FLAG,enabled,favoriteCar,alternateCar,tributeCar,recordDrive,ownedCarForTougeKey,
  m9Ready,m10Ready,completeM9,applyM10Grants,completeM10,koreatownControlled};
})();
