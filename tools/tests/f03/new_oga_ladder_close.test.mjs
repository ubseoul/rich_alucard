// F03 NEW_OGA_LADDER_CLOSE — fragment regression suite (auto-discovered by tools/run-tests.mjs).
// Covers M9 THE TRIBUTE, M10 VICE PRESIDENT, drive telemetry, TRIBUTED persistence, the SR-17 NAH path,
// grants/withholding, VampGPT, Koreatown ordering, the PRE-FCPB THE ALTERNATIVE chair restoration, and
// flag-OFF zero behavior change. The fragment is loaded explicitly in the headless harness (btf-test.mjs
// loads accepted content only), so the accepted M1–M7 gate stays independent.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import {pathToFileURL} from 'node:url';

const FRAG='js/frag/F03/new_oga_ladder_close.js';
const MIGRATIONS='js/frag/F03/migrations.js';

async function harness(root){
 const {loadBtf,walk}=await import(pathToFileURL(path.join(root,'tools','btf-test.mjs')).href);
 const game=async(flag=true,{seedState=null}={})=>{
  const ctx=await loadBtf(root,{seedState});
  vm.runInContext(await readFile(path.join(root,MIGRATIONS),'utf8'),ctx,{filename:MIGRATIONS});
  vm.runInContext(await readFile(path.join(root,FRAG),'utf8'),ctx,{filename:FRAG});
  ctx.RAFeatures.set('F03.new_oga_ladder_close',!!flag);
  ctx.RAClock.wake({first:true});
  return ctx;
 };
 const choose=label=>list=>Math.max(0,list.findIndex(c=>c.label===label));
 const setupM9=(c,{day=15}={})=>{
  c.RAState.patch('life.world.day',day);
  if(!c.RALife.hasCar(c.RACars.SUPRA))c.RALife.addCar({id:c.RACars.SUPRA,short:'SUPRA'});
  c.RAState.patch('life.newOga',{...c.RAState.get().life.newOga,status:'m8_hold',mission:7,rank:4,title:'SENIOR ASSOCIATE',rank4Granted:true,m5Completed:true,m6Completed:true,m7Completed:true,m7Eligible:false,m9Resolved:false,lastMissionDay:day-1});
 };
 const setupM10=(c,{day=16,withheld=false}={})=>{
  c.RAState.patch('life.world.day',day);
  c.RAState.patch('life.newOga',{...c.RAState.get().life.newOga,status:withheld?'senior_associate':'vice_president',mission:9,rank:withheld?4:5,title:withheld?'SENIOR ASSOCIATE':'VICE PRESIDENT',rank4Granted:true,m5Completed:true,m6Completed:true,m7Completed:true,m9Resolved:true,m9Outcome:withheld?'nah':'give',m9TributedCar:null,m9GrantsWithheld:withheld,m10GrantsApplied:false,m10GrantsWithheld:false,m10Completed:false,m10Outcome:null,finaleBegun:false,lastMissionDay:day-1});
 };
 return {game,walk,choose,setupM9,setupM10};
}

export async function test(root){
 const {game,walk,choose,setupM9,setupM10}=await harness(root);

 // --- flag OFF: zero behavior change; nothing registered, nothing written ---
 {const c=await game(false);
  assert.equal(c.RAFeatures.enabled('F03.new_oga_ladder_close'),false);
  assert.equal(c.RANewOgaLadder.enabled(),false);
  setupM9(c);
  assert.equal(c.RANewOgaLadder.m9Ready(c.RALife.L()),false,'M9 eligible with the flag OFF');
  assert.equal(c.RAAdventures.available('NEW_OGA_M9'),false,'M9 available with the flag OFF');
  assert.equal(c.RANewOgaLadder.favoriteCar().id,c.RACars.SUPRA,'favorite-car resolver must still work OFF (read-only)');
  c.RANewOga.observeTouge({course:'angeles_crest',result:{outcome:'done',score:1,data:{car:'supra'}}});
  assert.equal(c.RAVehicles.driveCount(c.RACars.SUPRA),0,'flag OFF recorded a drive');
  assert.equal(c.RAFrag.has('F03'),false,'flag OFF created save.frag.F03');
  c.RAClock.sleep();c.RAClock.sleep();
  assert(!/NEW_OGA_M9|NEW_OGA_M10/.test(JSON.stringify(c.RAState.get().life.adventures.records)),'a NEW OGA M9/M10 record existed with the flag OFF');
  assert(c.RAState.get().life.newOga.m9Resolved!==true,'flag OFF resolved M9');
  console.log('PASS F03 flag OFF (M9/M10 dark, no telemetry, no fragment namespace, no state writes)');}

 // --- M9 qualifying entry + voice-note priority + ladder order ---
 {const c=await game(true);setupM9(c);
  assert.equal(c.RANewOgaLadder.m9Ready(c.RALife.L()),true);
  const trigger=c.RAWakeTriggers.list().find(w=>w.adventure==='NEW_OGA_M9');
  assert(trigger,'M9 wake trigger missing');assert.equal(trigger.priority,76,'M9 voice-note priority');assert.equal(trigger.when(c.RALife.L()),true);
  assert(!c.RAWakeTriggers.list().some(w=>w.adventure==='NEW_OGA_M8'),'F03 must not register M8 (F07)');
  assert.equal(c.RAWakeTriggers.list().find(w=>w.adventure==='NEW_OGA_M10').priority,75,'M10 voice-note priority');
  assert.equal(c.RAWakeTriggers.pick(),'NEW_OGA_M9','M9 did not arrive on the first qualifying WAKE');
  assert.equal(c.RAAdventures.available('NEW_OGA_M10'),false,'M10 fired before M9 resolved');
  console.log('PASS F03 M9 qualifying entry (priority 76, M8 reserved, M10 gated on M9)');}

 // --- M9 GIVE: favorite-car telemetry, Rank 5, TRIBUTED not deleted, reload ---
 {const c=await game(true);setupM9(c);
  c.RALife.addCar({id:c.RACars.CATALOG.s15.id,short:'S15'});
  c.RANewOgaLadder.recordDrive(c.RACars.SUPRA,{by:3});
  assert.equal(c.RANewOgaLadder.favoriteCar().id,c.RACars.SUPRA,'favorite car must be the most-driven one');
  walk(c,'NEW_OGA_M9',{pick:choose('GIVE IT')});
  const s=c.RANewOga.current();
  assert.equal(s.m9Outcome,'give');assert.equal(s.rank,5);assert.equal(s.title,'VICE PRESIDENT');assert.equal(s.m9Resolved,true);
  assert.equal(s.trust,0,'GIVE has no authored Trust change');
  assert.equal(s.m9TributedCar,c.RACars.SUPRA);
  assert.equal(c.RAVehicles.isTributed(c.RACars.SUPRA),true,'Supra not marked TRIBUTED');
  assert.equal(c.RALife.hasCar(c.RACars.SUPRA),true,'TRIBUTED vehicle was deleted from ownership');
  assert.equal(c.RANewOgaLadder.favoriteCar().id,c.RACars.CATALOG.s15.id,'TRIBUTED car still selectable as favorite');
  const saved=c.RAState.get();
  const reload=await game(true,{seedState:saved});
  assert.equal(reload.RANewOga.current().m9TributedCar,c.RACars.SUPRA,'tribute lost on reload');
  assert.equal(reload.RALife.hasCar(c.RACars.SUPRA),true,'ownership lost on reload');
  assert.equal(reload.RAVehicles.isTributed(c.RACars.SUPRA),true,'tribute flag lost on reload');
  assert.equal(reload.RAVehicles.driveCount(c.RACars.SUPRA),3,'drive telemetry lost on reload');
  const once=JSON.stringify(c.RANewOga.current());c.RANewOgaLadder.completeM9('give');assert.equal(JSON.stringify(c.RANewOga.current()),once,'M9 applied twice');
  console.log('PASS F03 M9 GIVE (drive telemetry picks favorite, Rank 5, TRIBUTED hidden-not-deleted, reload, once-guard)');}

 // --- M9 OFFER ANOTHER CAR: exotic tributed instead, Trust −1, Rank 5 ---
 {const c=await game(true);setupM9(c);
  c.RALife.addCar({id:c.RACars.CATALOG.urus.id,short:'URUS'});
  c.RANewOgaLadder.recordDrive(c.RACars.SUPRA,{by:2});
  walk(c,'NEW_OGA_M9',{pick:(list)=>{const i=list.findIndex(x=>x.label==='OFFER ANOTHER CAR');return i<0?0:i;}});
  const s=c.RANewOga.current();
  assert.equal(s.m9Outcome,'other');assert.equal(s.rank,5);assert.equal(s.trust,-1,'OFFER ANOTHER CAR is Trust −1');
  assert.equal(s.m9TributedCar,c.RACars.CATALOG.urus.id,'the exotic should be tributed');
  assert.equal(c.RAVehicles.isTributed(c.RACars.SUPRA),false,'the favorite must be untouched');
  console.log('PASS F03 M9 OFFER ANOTHER CAR (exotic tributed, Trust −1, Rank 5, favorite untouched)');}

 // --- M9 NAH (SR-17): Rank 4, Trust −1, M10 still fires, no substitute content ---
 {const c=await game(true);setupM9(c);
  walk(c,'NEW_OGA_M9',{pick:choose('NAH')});
  const s=c.RANewOga.current();
  assert.equal(s.m9Outcome,'nah');assert.equal(s.rank,4,'NAH must not advance rank');assert.equal(s.title,'SENIOR ASSOCIATE');
  assert.equal(s.trust,-1,'NAH is Trust −1');assert.equal(s.m9GrantsWithheld,true);assert.equal(s.m9TributedCar,null);
  assert.equal(c.RAVehicles.isTributed(c.RACars.SUPRA),false,'NAH must not tribute a car');
  c.RAState.patch('life.world.day',16);
  assert.equal(c.RANewOgaLadder.m10Ready(c.RALife.L()),true,'M10 must still fire after M9 NAH');
  assert.equal(c.RAWakeTriggers.pick(),'NEW_OGA_M10','M10 did not fire after M9 NAH');
  console.log('PASS F03 M9 NAH / SR-17 (Rank 4, Trust −1, grants withheld, VampGPT still fires)');}

 // --- drive telemetry: TOUGE wrapper + route wrapper ---
 {const c=await game(true);setupM9(c);
  c.RALife.addCar({id:c.RACars.CATALOG.s15.id,short:'S15'});
  c.RANewOga.observeTouge({course:'angeles_crest',result:{outcome:'done',score:1,data:{car:'s15'}}});
  c.RANewOga.observeTouge({course:'angeles_crest',result:{outcome:'done',score:1,data:{car:'supra'}}});
  c.RANewOga.observeTouge({course:'angeles_crest',result:{outcome:'done',score:1,data:{car:'supra'}}});
  assert.equal(c.RAVehicles.driveCount(c.RACars.CATALOG.s15.id),1,'S15 touge drive not counted');
  assert.equal(c.RAVehicles.driveCount(c.RACars.SUPRA),2,'Supra touge drives not counted');
  assert.equal(c.RANewOgaLadder.favoriteCar().id,c.RACars.SUPRA);
  // route-drive wrapper: a car-route sets vars.car then calls Nodd.maybeStop.
  c.RAAdventures.start('NEW_OGA_M9',{from:'test'});c.RAAdventures.patchActive({vars:{car:c.RACars.CATALOG.s15.id}});
  c.RANodd.maybeStop();c.RAAdventures.abandon();
  assert.equal(c.RAVehicles.driveCount(c.RACars.CATALOG.s15.id),2,'route drive not counted');
  console.log('PASS F03 drive telemetry (TOUGE + route wrappers, flag-gated)');}

 // --- M10 qualifying entry + grant path ---
 {const c=await game(true);setupM10(c);
  assert.equal(c.RANewOgaLadder.m10Ready(c.RALife.L()),true);
  assert.equal(c.RAWakeTriggers.pick(),'NEW_OGA_M10','M10 did not arrive after Rank 5');
  walk(c,'NEW_OGA_M10',{pick:choose('…SAY LESS.')});
  const s=c.RANewOga.current();
  assert.equal(s.m10GrantsApplied,true,'M10 grants not applied');assert.equal(s.office,'vice_president');
  assert.deepEqual([...s.recruits],['gbenga_boy_1','gbenga_boy_2'],'recruits not granted');
  assert.equal(s.rank,5);assert.equal(s.title,'VICE PRESIDENT');
  assert.equal(s.finaleBegun,true,'SAY LESS must begin the finale (F07)');
  assert.equal(s.m10Outcome,'say_less');
  assert.equal(c.RANewOgaLadder.koreatownControlled(),true,'Koreatown not controlled after the VP grant');
  assert.equal(c.RADistricts.get('koreatown').fragment,'F03','F03 must own the Koreatown definition (queued before War Room)');
  // weekly income
  c.RAState.patch('life.world.day',22);
  const before=c.RALife.money();c.RAClock.sleep();
  assert.equal(c.RALife.money()-before,15000,'M10 weekly $15K income did not land');
  assert(c.RAMoneyLedger.query({source:'new_oga:m10'}).some(e=>e.delta===15000),'income not tagged new_oga:m10');
  console.log('PASS F03 M10 grants (office, recruits, Koreatown before War Room, $15K/week, finale flag)');}

 // --- M10 withheld (after M9 NAH): scene still fires, no grants ---
 {const c=await game(true);setupM10(c,{withheld:true});
  assert.equal(c.RANewOgaLadder.m10Ready(c.RALife.L()),true);
  const before=c.RALife.money();
  walk(c,'NEW_OGA_M10',{pick:choose('…SAY LESS.')});
  const s=c.RANewOga.current();
  assert.equal(s.m10GrantsApplied,false,'withheld path applied grants');
  assert.equal(s.office,undefined,'withheld path created an office');
  assert.equal(s.recruits,undefined,'withheld path granted recruits');
  assert.equal(s.rank,4,'withheld path advanced rank');
  assert.equal(s.finaleBegun,true,'VampGPT must still fire on the withheld path');
  assert.equal(s.m10GrantsWithheld,true);
  assert.equal(c.RANewOgaLadder.koreatownControlled(),false,'withheld path granted Koreatown');
  c.RAState.patch('life.world.day',30);const m=c.RALife.money();c.RAClock.sleep();
  assert.equal(c.RALife.money(),m,'withheld path paid weekly income');
  assert.equal(c.RALife.money(),before,'withheld M10 changed money');
  console.log('PASS F03 M10 withheld (VampGPT fires; grants/rank/Koreatown/income all withheld)');}

 // --- VampGPT behavior: NAH, I'M GOOD HERE → re-ask in 7 sleeps, stay VP ---
 {const c=await game(true);setupM10(c);
  walk(c,'NEW_OGA_M10',{pick:choose('NAH, I\u2019M GOOD HERE.')});
  let s=c.RANewOga.current();
  assert.equal(s.m10Outcome,'nah_stay');assert.equal(s.finaleBegun,false);assert.equal(s.rank,5);
  assert.equal(s.m10VampgptReaskDay,16+7,'VampGPT re-ask day');
  c.RAState.patch('life.world.day',23);
  assert.equal(c.RANewOgaLadder.m10Ready(c.RALife.L()),true,'VampGPT did not re-ask after 7 sleeps');
  walk(c,'NEW_OGA_M10',{pick:choose('…SAY LESS.')});
  s=c.RANewOga.current();assert.equal(s.finaleBegun,true,'second M10 did not resolve');
  c.RAState.patch('life.world.day',30);
  assert.equal(c.RANewOgaLadder.m10Ready(c.RALife.L()),false,'M10 kept re-firing after SAY LESS');
  console.log('PASS F03 M10 VampGPT (stay VP re-asks in 7 sleeps; SAY LESS ends the loop)');}

 // --- THE ALTERNATIVE chair restoration (PRE-FCPB) ---
 {const off=await game(false);
  const offAlt=off.RAAdventures.get('NEW_OGA_ALTERNATIVE');
  assert.equal(offAlt.nodes.voice.next(),'delivery','flag OFF must keep the frozen scene fallback');
  assert.equal(typeof offAlt.nodes.delivery.end.fx,'function','scene fallback end fx missing');
  const on=await game(true);
  const onAlt=on.RAAdventures.get('NEW_OGA_ALTERNATIVE');
  assert.equal(onAlt.nodes.voice.next(),'chairs','flag ON must restore the chair activity');
  const params=onAlt.nodes.chairs.minigame.params();
  assert.equal(onAlt.nodes.chairs.minigame.id,'slurp','restoration must reuse the accepted SLURP harness');
  assert.equal(params.canopyDuty,true);
  assert.equal(params.totalChairs,on.RANewOgaTunables.chairs.AUTHORED_TOTAL);
  assert.equal(params.durationMs,on.RANewOgaTunables.chairs.DURATION_MS);
  assert.equal(params.bundleSize,on.RANewOgaTunables.chairs.BUNDLE_SIZE);
  on.RAState.patch('life.world.day',11);
  on.RAState.patch('life.newOga',{...on.RAState.get().life.newOga,status:'alternative_pending',mission:4,rank:1,title:'INTERN',carlosMutual:true,m4Outcome:'beat_1',alternativePending:true,lastMissionDay:10});
  const before=on.RALife.money();
  walk(on,'NEW_OGA_ALTERNATIVE',{minigame:()=>({outcome:'done',score:60,data:{stacked:60,total:60,success:true}})});
  assert.equal(on.RANewOga.current().alternativeCompleted,true,'chair restoration did not complete The Alternative');
  assert.equal(on.RALife.money()-before,on.RANewOgaTunables.m4.AUTHORED_ALTERNATIVE_PAY,'Alternative reward regression');
  console.log('PASS F03 THE ALTERNATIVE chair restoration (SLURP canopyDuty reused; flag OFF fallback preserved)');}

 // --- historical M1–M7 regression: lane untouched by F03 ---
 {const c=await game(true);
  for(const id of ['NEW_OGA_M1','NEW_OGA_M2','NEW_OGA_M3','NEW_OGA_M4','NEW_OGA_ALTERNATIVE','NEW_OGA_M5','NEW_OGA_M6','NEW_OGA_M7'])assert(c.RAAdventures.get(id),`accepted ${id} missing`);
  assert.equal(c.RAAdventures.get('NEW_OGA_M8'),null,'F03 must not implement M8');
  const chips=c.RAAdventures.get('NEW_OGA_M3').nodes.chairs.minigame.params();
  assert.equal(chips.totalChairs,c.RANewOgaTunables.chairs.AUTHORED_TOTAL,'M3 chairs changed');
  assert.equal(c.RANewOgaTunables.trust.M3_BACKOUT,-1,'accepted tunables changed');
  console.log('PASS F03 historical M1–M7 regression (accepted lane + tunables unchanged)');}

 console.log('PASS F03 NEW_OGA_LADDER_CLOSE (M9 + M10 + THE ALTERNATIVE restoration)');
}
