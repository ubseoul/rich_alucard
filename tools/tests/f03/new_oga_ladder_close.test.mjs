// F03 NEW_OGA_LADDER_CLOSE (bounded R3 port): M9 THE TRIBUTE -> M10 VICE PRESIDENT -> VampGPT on the NEXT WAKE, car tribute, crew,
// F03-owned Koreatown, the pure F07 tribute reader, THE ALTERNATIVE restoration. M8 is NOT implemented here: `m8Resolved` is the
// smallest explicit fixture (RANewOga.patch) this suite uses; F07 will write it.
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import path from 'node:path';
import {full,run,load} from '../if1/_lib.mjs';
import {F01_FILES,F04_FILES,activate,card} from '../F04/_lib.mjs';

const J=v=>JSON.parse(JSON.stringify(v));
const FLAG='F03.new_oga_ladder_close';
const SUPRA='toyota_supra_mk4_001',URUS='lambo_urus_oxblood',AVENT='lambo_aventador',S2K='honda_s2000_pink';
const car=(ctx,id,extra={})=>ctx.RALife.addCar({id,make:'X',model:id,short:id.split('_')[1]||id,price:1,value:1,parts:{},...extra});

// production order: F03 (migrations, then files) before F04
async function boot(root,{flag=true,seedState=null}={}){
 const ctx=await full(root,seedState?{seedState}:{});
 await run(root,ctx,['js/frag/F03/migrations.js',...F01_FILES,'js/frag/F03/new_oga_ladder_close.js',...F04_FILES]);
 if(flag)ctx.RAFeatures.set(FLAG,true);
 return ctx;
}
// A life where M8 is resolved by fixture and the ladder may run. lastMissionDay 14, today 15.
function ladder(ctx,{cars=[SUPRA],m8=true,m8Outcome='SEND THE BOYS',day=15,last=14}={}){
 ctx.RAClock.wake({first:true});ctx.RAState.patch('life.world.day',day);ctx.RAState.patch('life.resources.money',500000);
 for(const id of cars)car(ctx,id);
 ctx.RANewOga.patch({status:'m8_hold',mission:7,rank:4,title:'SENIOR ASSOCIATE',rank4Granted:true,m5Completed:true,m6Completed:true,m7Completed:true,...(m8?{m8Resolved:true,m8Outcome}:{}),lastMissionDay:last});
}
// the WAKE arbiter delivers one adventure per morning; unrelated world adventures (rain, etc.) are not what these tests are about
const only=id=>/^NEW_OGA_/.test(id||'')?id:null;
const wake=ctx=>{ctx.RAClock.sleep();return only(ctx.RAWakeTriggers.pick());};
const day=ctx=>ctx.RALife.today().day;
const lane=ctx=>ctx.RANewOga.current();
const warRoomOn=ctx=>{ctx.RAFeatures.set('F04.war_room',true);ctx.RAFeatures.set('F01.showdown_core',true);ctx.RAFrag.patch('F04','active',true);ctx.RAFrag.patch('F04','offer.status','accepted');};
async function walkOf(root,ctx,id,opts){const {walk}=await load(root,'tools/btf-test.mjs');return walk(ctx,id,opts);}
const pickChoice=label=>(list)=>Math.max(0,list.findIndex(c=>c.label===label));

export async function test(root){
 // ===================================================================== 0. dark by default
 {
  const c=await boot(root,{flag:false});ladder(c,{cars:[SUPRA,URUS]});
  assert.equal(c.RAAdventures.available('NEW_OGA_M9'),false,'flag OFF: M9 unavailable');
  assert.equal(only(c.RAWakeTriggers.pick()),null);
  assert.equal(c.RAFrag.has('F03'),false,'flag OFF: no F03 namespace is written');
  assert.equal(c.RADistricts.get('koreatown').fragment,'F03','Koreatown is defined by F03 even dark');
  assert.equal(c.RADistricts.get('koreatown').state,'UNCONTROLLED');
  console.log('PASS f03 dark: flag OFF -> nothing available, no namespace, Koreatown defined-but-uncontrolled');
 }

 // ===================================================================== 1-3. M9 prerequisite: m8Resolved (ANY outcome)
 {
  const c=await boot(root);ladder(c,{m8:false});
  assert.equal(c.RAAdventures.available('NEW_OGA_M9'),false,'1. M9 locked before m8Resolved');
  assert.equal(wake(c),null,'1. no mission voice note without m8Resolved');
  for(const o of ['SEND THE BOYS','GO MYSELF','WALK AWAY','anything_resolved','']){
   const k=await boot(root);ladder(k,{m8Outcome:o,day:15});
   assert.equal(k.RAAdventures.available('NEW_OGA_M9'),true,`2. M9 unlocked by m8Resolved outcome "${o}"`);
  }
  const k=await boot(root);ladder(k,{m8Outcome:'SEND THE BOYS'});
  assert.equal(only(k.RAWakeTriggers.pick()),'NEW_OGA_M9','3. SEND THE BOYS qualifies: M9 is the WAKE voice note');
  console.log('PASS f03 M9 prerequisite: locked before m8Resolved; every resolved M8 outcome (SEND THE BOYS included) unlocks it');
 }

 // ===================================================================== 4. no eligible car -> M9 waits
 {
  const c=await boot(root);ladder(c,{cars:[]});
  assert.equal(c.RAAdventures.available('NEW_OGA_M9'),false,'4. no owned car: M9 waits');
  car(c,SUPRA,{ownershipStatus:'lost'});assert.equal(c.RAAdventures.available('NEW_OGA_M9'),false,'4. only a LOST car: waits');
  car(c,URUS,{ownershipStatus:'impounded'});assert.equal(c.RAAdventures.available('NEW_OGA_M9'),false,'4. LOST + IMPOUNDED: waits');
  car(c,S2K);c.RAVehicles.tribute(S2K);assert.equal(c.RAAdventures.available('NEW_OGA_M9'),false,'4. a TRIBUTED car is not eligible: waits');
  assert.equal(lane(c).m9Resolved,undefined,'waiting resolves nothing');
  car(c,AVENT);assert.equal(c.RAAdventures.available('NEW_OGA_M9'),true,'a car becomes available -> M9 arrives');
  console.log('PASS f03 M9 waits: no owned / LOST / IMPOUNDED / TRIBUTED car -> M9 does not fire');
 }

 // ===================================================================== 5. favorite = most-driven eligible car
 {
  const c=await boot(root);ladder(c,{cars:[SUPRA,URUS,S2K]});const L=c.RANewOgaLadder;
  assert.equal(L.favoriteCar().id,SUPRA,'ties go to the first car Rich got');
  L.recordDrive(URUS,{by:3});L.recordDrive(S2K,{by:2});assert.equal(L.favoriteCar().id,URUS,'5. most-driven car wins');
  c.RALife.patchCar(URUS,{ownershipStatus:'lost'});assert.equal(L.favoriteCar().id,S2K,'5. LOST is skipped');
  c.RALife.patchCar(S2K,{ownershipStatus:'impounded'});assert.equal(L.favoriteCar().id,SUPRA,'5. IMPOUNDED is skipped');
  c.RALife.patchCar(S2K,{ownershipStatus:'owned'});c.RAVehicles.tribute(S2K);assert.equal(L.favoriteCar().id,SUPRA,'5. TRIBUTED is skipped');
  assert.equal(L.recordDrive(S2K).ok,false,'a TRIBUTED car no longer accrues drives');
  // telemetry seams: a TOUGE result counts for the car it was driven in
  c.RALife.patchCar(URUS,{ownershipStatus:'owned'});const n=c.RAVehicles.driveCount(URUS);
  c.RANewOga.observeTouge({course:'angeles_crest',result:{data:{car:'urus'},quit:false}});assert.equal(c.RAVehicles.driveCount(URUS),n+1,'TOUGE telemetry counts the car driven');
  console.log('PASS f03 favorite: most-driven eligible car; LOST / IMPOUNDED / TRIBUTED excluded');
 }

 // ===================================================================== 6, 18. GIVE IT: TRIBUTED hidden-not-deleted; pure F07 reader
 let given;
 {
  const c=await boot(root);ladder(c,{cars:[SUPRA,URUS]});c.RANewOgaLadder.recordDrive(SUPRA,{by:5});
  assert.equal(c.RAVehicles.tributedCar(),null,'18. reader: null before any tribute');
  const {res}=await walkOf(root,c,'NEW_OGA_M9',{pick:pickChoice('GIVE IT')});assert.equal(res.id,'NEW_OGA_M9');
  const s=lane(c);assert.equal(s.m9Outcome,'give');assert.equal(s.rank,5);assert.equal(s.title,'VICE PRESIDENT');assert.equal(s.m9TributedCar,SUPRA);
  assert.equal(c.RAVehicles.isTributed(SUPRA),true);
  assert.equal(c.RALife.ownedCars().some(x=>x.id===SUPRA),false,'6. TRIBUTED car is hidden from normal availability');
  assert.equal(c.RALife.heldCars().some(x=>x.id===SUPRA),true,'6. ...but retained');
  assert.equal(c.RALife.hasCar(SUPRA),true,'6. ...still represented in ownership');
  assert.equal(c.RAState.get().life.ownership.cars.find(x=>x.id===SUPRA).ownershipStatus,'owned','6. the ownership record is never edited or deleted');
  assert.equal(c.RAVehicles.list().find(x=>x.id===SUPRA).service.tributed,true,'6. still listed (service.tributed)');
  assert.equal(c.RAVehicles.driveCount(SUPRA),5,'6. drive history is retained');
  // 18. pure reader
  const before=JSON.stringify(c.RAState.get());let mutations=0;const orig=c.RAVehicles.tribute;c.RAVehicles.tribute=(...a)=>{mutations++;return orig(...a);};
  assert.equal(c.RAVehicles.tributedCar(),SUPRA,'18. RAVehicles.tributedCar() returns m9TributedCar');
  assert.equal(c.RAVehicles.tributedCar(),c.RANewOga.current().m9TributedCar);
  assert.equal(mutations,0,'18. the reader never calls the mutator tribute()');assert.equal(JSON.stringify(c.RAState.get()),before,'18. the reader writes nothing');
  c.RAVehicles.tribute=orig;
  given=c;
  console.log('PASS f03 GIVE IT: favorite TRIBUTED, hidden but retained (record untouched, drives kept); RAVehicles.tributedCar() is a pure reader');
 }

 // ===================================================================== 7. a TRIBUTED car cannot PLAY
 {
  const c=await boot(root);warRoomOn(c);activate(c,{cars:[SUPRA,URUS]});
  const before=c.RAWarRoomPlay.buildRequest(card(c,'DROP','inglewood'));assert.deepEqual(J(before.request.garage.owned),['SUPRA','URUS']);
  c.RANewOga.patch({status:'m8_hold',mission:7,rank:4,rank4Granted:true,m7Completed:true,m8Resolved:true,lastMissionDay:0});
  c.RANewOgaLadder.recordDrive(SUPRA,{by:2});assert.equal(c.RANewOgaLadder.favoriteCar().id,SUPRA);
  c.RANewOgaLadder.completeM9('give');
  const after=c.RAWarRoomPlay.buildRequest(card(c,'DROP','inglewood'));
  assert.deepEqual(J(after.request.garage.owned),['URUS'],'7. the PLAY garage offers only the Urus');assert.equal(after.carMap.SUPRA,undefined,'7. the tributed Supra cannot be selected for PLAY');
  console.log('PASS f03 PLAY: a TRIBUTED car is not offered to PLAY');
 }

 // ===================================================================== 8. OFFER ANOTHER CAR gate (Urus / Aventador, available)
 {
  const offer=async(cars,fix)=>{const c=await boot(root);ladder(c,{cars});fix?.(c);const run0=c.RAAdventures.start('NEW_OGA_M9',{from:'test'});c.RAAdventures.enter('voice');c.RAAdventures.enter('choice');
   const ch=c.RAAdventures.choicesFor('choice').find(x=>x.label==='OFFER ANOTHER CAR');return {c,ch};};
  assert.equal((await offer([SUPRA])).ch.locked,true,'8. no Urus/Aventador: OFFER ANOTHER CAR locked');
  assert.equal((await offer([SUPRA,S2K])).ch.locked,true,'8. other cars never unlock it');
  assert.equal((await offer([SUPRA,URUS])).ch.locked,false,'8. an available Urus unlocks it');
  assert.equal((await offer([SUPRA,AVENT])).ch.locked,false,'8. an available Aventador unlocks it');
  assert.equal((await offer([SUPRA,URUS],c=>c.RALife.patchCar(URUS,{ownershipStatus:'impounded'}))).ch.locked,true,'8. an IMPOUNDED Urus does not');
  assert.equal((await offer([SUPRA,AVENT],c=>c.RAVehicles.tribute(AVENT))).ch.locked,true,'8. a TRIBUTED Aventador does not');
  // OTHER: the exotic is tributed, the favorite stays; Trust -1
  const {c}=await offer([SUPRA,URUS]);c.RANewOgaLadder.recordDrive(SUPRA,{by:4});const t0=lane(c).trust;
  c.RAAdventures.abandon?.();
  const k=await boot(root);ladder(k,{cars:[SUPRA,URUS]});k.RANewOgaLadder.recordDrive(SUPRA,{by:4});const t1=lane(k).trust;
  const r=await walkOf(root,k,'NEW_OGA_M9',{pick:pickChoice('OFFER ANOTHER CAR')});
  assert.equal(lane(k).m9Outcome,'other');assert.equal(lane(k).m9TributedCar,URUS,'OFFER ANOTHER: the exotic is tributed');assert.equal(k.RAVehicles.isTributed(SUPRA),false,'the favorite stays');
  assert.equal(lane(k).trust-t1,-1,'authored Trust -1');assert.equal(lane(k).rank,5);
  console.log('PASS f03 OFFER ANOTHER CAR: available only with an available Urus / Aventador; tributes the exotic, favorite stays');
 }

 // ===================================================================== 9. TAKEOVER returns the tribute
 {
  const c=given;assert.equal(c.RAVehicles.isTributed(SUPRA),true);
  const r=c.RANewOgaLadder.returnTribute();assert.equal(r.ok,true);
  assert.equal(c.RAVehicles.isTributed(SUPRA),false);assert.equal(c.RALife.ownedCars().some(x=>x.id===SUPRA),true,'9. the car is back in normal availability');
  assert.equal(c.RAVehicles.driveCount(SUPRA),5,'9. it comes back as the same car (history intact)');assert.ok(lane(c).m9TributeReturnedDay>0);
  assert.equal(c.RANewOgaLadder.returnTribute().ok,false,'returning twice is a no-op');
  console.log('PASS f03 TAKEOVER: returnTribute() gives the tributed car back');
 }

 // ===================================================================== NAH (CREATOR RULING: Rank 4, NO trust penalty, M10 + normal grants stay reachable)
 {
  const c=await boot(root);ladder(c,{cars:[SUPRA]});const t0=lane(c).trust;
  await walkOf(root,c,'NEW_OGA_M9',{pick:pickChoice('NAH')});
  const s=lane(c);assert.equal(s.m9Outcome,'nah');assert.equal(s.rank,4,'1. NAH leaves Rank at 4');assert.equal(s.trust-t0,0,'2. NAH does not reduce trust');
  assert.ok(!s.m9GrantsWithheld,'3. NAH withholds nothing');assert.equal(c.RAVehicles.isTributed(SUPRA),false);
  assert.equal(c.RAAdventures.available('NEW_OGA_M10'),false,'4. no same-day chaining: M10 not on the NAH day');
  assert.equal(wake(c),'NEW_OGA_M10','4. M10 arrives on the next WAKE after NAH');
  await walkOf(root,c,'NEW_OGA_M10',{});
  const m=lane(c);assert.equal(m.m10Completed,true);assert.equal(m.m10GrantsApplied,true,'3. normal M10 grants apply after NAH');
  assert.equal(c.RANewOgaLadder.koreatown().granted,true,'3. Koreatown granted after NAH');
  const cr=c.RAFrag.read('F03','crew',{});assert.equal(((cr.queue||[]).length+(cr.recruited||[]).length),2,'3. two recruits granted after NAH');
  assert.equal(c.RAAdventures.available('NEW_OGA_VAMPGPT'),false,'4. VampGPT not on the M10 WAKE');
  assert.equal(wake(c),'NEW_OGA_VAMPGPT','4. VampGPT arrives on the WAKE after M10');
  console.log('PASS f03 NAH (creator ruling): Rank 4, no trust penalty, no tribute, M10 + normal grants reachable, VampGPT after M10');
 }

 // ===================================================================== 10, 11. one mission voice note per WAKE; M10 -> VampGPT next WAKE
 {
  const c=await boot(root);ladder(c,{cars:[SUPRA]});
  // a second mission-grade candidate is also ready: the arbiter still delivers exactly one
  c.RAWakeTriggers.define([{adventure:'NEW_OGA_VAMPGPT',priority:1,when:()=>true}]);
  assert.equal(c.RAWakeTriggers.pick(),'NEW_OGA_M9','10. exactly one wake adventure: the higher-priority mission');assert.equal(c.RAWakeTriggers.pick(),'NEW_OGA_M9','10. stable for the day');assert.equal(c.RAWakeTriggers.list().filter(w=>w.priority>=75&&w.priority<=89).length,10,'the mission voice-note band: M1..M7, ALTERNATIVE, M9, M10');
  c.RAFeatures.set(FLAG,true);
  await walkOf(root,c,'NEW_OGA_M9',{pick:pickChoice('GIVE IT')});
  assert.equal(c.RAAdventures.available('NEW_OGA_M10'),false,'10. no same-day chaining: M10 is not available the day M9 resolved');
  assert.equal(c.RAAdventures.available('NEW_OGA_VAMPGPT'),false,'10. VampGPT is not available before M10');
  const w=wake(c);assert.equal(w,'NEW_OGA_M10','10. M10 arrives on the NEXT WAKE');
  await walkOf(root,c,'NEW_OGA_M10');
  assert.equal(lane(c).m10Completed,true);assert.equal(c.RAAdventures.available('NEW_OGA_VAMPGPT'),false,'11. VampGPT does not arrive the same WAKE as M10');assert.equal(c.RAAdventures.available('NEW_OGA_M10'),false);
  assert.equal(wake(c),'NEW_OGA_VAMPGPT','11. VampGPT arrives on the WAKE after M10');
  // choices: SAY LESS / re-ask in 7 sleeps
  const d0=day(c);await walkOf(root,c,'NEW_OGA_VAMPGPT',{pick:pickChoice('NAH, I’M GOOD HERE.')});
  assert.equal(lane(c).m10VampgptReaskDay,d0+7);
  for(let i=0;i<6;i++)assert.equal(wake(c),null,'no re-ask before 7 sleeps');
  assert.equal(wake(c),'NEW_OGA_VAMPGPT','re-asked after 7 sleeps');
  await walkOf(root,c,'NEW_OGA_VAMPGPT',{pick:pickChoice('…SAY LESS.')});assert.equal(lane(c).finaleBegun,true,'SAY LESS records finaleBegun for F07');
  assert.equal(wake(c),null,'once the finale begins nothing further arrives from F03');
  console.log('PASS f03 delivery: one mission voice note per WAKE, no chaining, M10 -> VampGPT next WAKE, 7-sleep re-ask, SAY LESS -> finaleBegun');
 }

 // ===================================================================== source certification (Patch 1 NEW OGA, OPEN)
 {
  const src=await readFile(path.join(process.cwd(),'js/frag/F03/new_oga_ladder_close.js'),'utf8');
  const seq=["S('vampgpt','oga.')","RC('yeah.')","S('vampgpt','you know what oga means right.')","S('vampgpt','…boss.')","S('vampgpt','why are you climbing his ladder. you could own the building.')"];
  let at=-1;for(const piece of seq){const i=src.indexOf(piece,at+1);assert.ok(i>at,`VampGPT scene keeps the authored Patch 1 sequence: ${piece}`);at=i;}
  assert.ok(src.includes("label:'…SAY LESS.'")&&src.includes("label:'NAH, I’M GOOD HERE.'"),'VampGPT authored choices');
  console.log('PASS f03 source certification: VampGPT scene = Patch 1 NEW OGA sequence incl. Rich "yeah."');
 }

 // ===================================================================== 12. M8 loan squad takes no crew slot
 {
  const c=await boot(root);warRoomOn(c);const R=c.RAWarRoomCrew;
  for(let i=1;i<=8;i++)c.RACrew.define({id:`m8_loan_${i}`,name:`LOAN ${i}`,class:'MUSCLE',fragment:'F04',meta:{onLoan:true}});
  assert.equal(R.allOgas().length,14,'6 named + 8 loaned');
  assert.equal(R.recruit({id:'r1',name:'ONE',cls:'MUSCLE'}).ok,true,'12. eight on-loan units consume no crew slot');
  assert.equal(R.recruit({id:'r2',name:'TWO',cls:'TALKER'}).ok,true);
  assert.equal(R.recruit({id:'r3',name:'THREE',cls:'GHOST'}).reason,'roster-full','12. the normal cap (8) still binds the rest');
  console.log('PASS f03 crew: an M8 squad ON LOAN (meta.onLoan) consumes no slot; the normal cap of 8 still applies');
 }

 // ===================================================================== 13, 14. M10 recruits: generic, normal cap, queued if full
 {
  const c=await boot(root);ladder(c,{cars:[SUPRA]});warRoomOn(c);c.RAClock.sleep();
  c.RANewOgaLadder.completeM9('give');c.RAClock.sleep();c.RANewOgaLadder.completeM10();
  const rec=c.RAFrag.read('F03','crew.recruited',[]);assert.deepEqual(J(rec),['new_oga_m10_recruit_1','new_oga_m10_recruit_2'],'13. two recruits join');
  for(const id of rec){const u=c.RACrew.get(id);assert.equal(u.fragment,'F04','recruits are ordinary War Room crew');assert.ok(c.RAWarRoomCrew.CLASSES.includes(u.class),'generic: one of the existing classes');
   assert.equal(u.status,'ACTIVE');assert.equal(c.RACrew.setStatus(id,'GONE').ok,true,'13. normal mortality applies');assert.equal(c.RACrew.get(id).status,'GONE');}
  assert.equal(c.RAFrag.read('F03','crew.queue',[]).length,0);
  // 14. full crew: queued, never dropped
  const f=await boot(root);ladder(f,{cars:[SUPRA]});warRoomOn(f);f.RAClock.sleep();
  f.RAWarRoomCrew.recruit({id:'x1',name:'X1',cls:'MUSCLE'});    // 7 of 8
  f.RANewOgaLadder.completeM9('give');f.RAClock.sleep();f.RANewOgaLadder.completeM10();
  assert.equal(f.RAFrag.read('F03','crew.recruited',[]).length,1,'14. the first recruit takes the last slot');
  assert.equal(f.RAFrag.read('F03','crew.queue',[]).length,1,'14. the second is QUEUED (crew full)');
  for(let i=0;i<3;i++)f.RAClock.sleep();assert.equal(f.RAFrag.read('F03','crew.queue',[]).length,1,'14. still queued while full; not dropped, not forced past the cap');
  assert.equal(f.RAWarRoomCrew.allOgas().length,8,'the cap held');
  // War Room inactive: both queue, then land when it becomes active
  const q=await boot(root);ladder(q,{cars:[SUPRA]});q.RANewOgaLadder.completeM9('give');q.RAClock.sleep();q.RANewOgaLadder.completeM10();
  assert.equal(q.RAFrag.read('F03','crew.queue',[]).length,2,'inactive War Room: both recruits queued');assert.equal(q.RAWarRoomCrew.allOgas().filter(u=>u.meta?.recruit).length,0);
  warRoomOn(q);q.RAClock.sleep();assert.equal(q.RAFrag.read('F03','crew.queue',[]).length,0,'queue drains the first WAKE the War Room is active');assert.equal(q.RAFrag.read('F03','crew.recruited',[]).length,2);
  console.log('PASS f03 recruits: generic War Room crew, normal mortality, normal cap, queued while full or War Room inactive');
 }

 // ===================================================================== 15, 16, 17. Koreatown: F03-owned, never shadowed, grant queued while inactive
 {
  const c=await boot(root);ladder(c,{cars:[SUPRA]});
  const k=c.RADistricts.get('koreatown');assert.equal(k.fragment,'F03','15. Koreatown is defined by F03');
  assert.equal(c.RAWarRoomDistricts.provider().owned.koreatown,'F03');assert.deepEqual(J(c.RAWarRoomDistricts.provider().errors),[]);
  assert.equal(c.RAWarRoomDistricts.usable('koreatown'),true,'F04 consumes the F03 definition');
  assert.throws(()=>c.RADistricts.define({id:'koreatown',fragment:'F04',label:'KOREATOWN'}),/already defined by F03/,'16. a shadow definition is refused');
  assert.equal(c.RADistricts.get('koreatown').fragment,'F03','16. F04 never redefined it');
  for(const f of F04_FILES){const src=(await readFile(path.join(root,f),'utf8')).replace(/^\s*\/\/.*$/gm,'');assert.equal(/RADistricts\??\.define\(/.test(src)&&/koreatown/i.test(src.match(/RADistricts\??\.define\([^;]*/)?.[0]||''),false,`16. ${f} does not define koreatown`);}
  // 17. grant while the War Room is inactive
  c.RANewOgaLadder.completeM9('give');c.RAClock.sleep();c.RANewOgaLadder.completeM10();
  let kt=c.RANewOgaLadder.koreatown();assert.deepEqual([kt.granted,kt.pending,kt.controlled],[true,true,false],'17. inactive War Room: the grant is QUEUED, not applied, no error');
  assert.equal(c.RADistricts.get('koreatown').state,'UNCONTROLLED');
  c.RAClock.sleep();assert.equal(c.RANewOgaLadder.koreatown().pending,true,'17. stays queued across WAKEs');
  warRoomOn(c);c.RAClock.sleep();kt=c.RANewOgaLadder.koreatown();
  assert.deepEqual([kt.granted,kt.pending,kt.controlled],[true,false,true],'17. applied the first WAKE the War Room is active');
  const dk=c.RADistricts.get('koreatown');assert.equal(dk.holder,'rich');assert.equal(dk.history.length,1,'applied exactly once');assert.equal(dk.fragment,'F03');
  c.RAClock.sleep();assert.equal(c.RADistricts.get('koreatown').history.length,1,'never re-applied');
  // War Room already active at M10: applied immediately
  const a=await boot(root);ladder(a,{cars:[SUPRA]});warRoomOn(a);a.RANewOgaLadder.completeM9('give');a.RAClock.sleep();a.RANewOgaLadder.completeM10();
  assert.deepEqual([a.RANewOgaLadder.koreatown().pending,a.RANewOgaLadder.koreatown().controlled],[false,true],'active War Room: applied at M10');
  console.log('PASS f03 Koreatown: defined and owned by F03, shadow refused, F04 only consumes; M10 grant queues while the War Room is inactive and applies once');
 }

 // ===================================================================== 19. M10 income stays $15K / week
 {
  const c=await boot(root);ladder(c,{cars:[SUPRA]});
  assert.equal(c.RANewOgaTunables.m10.WEEKLY_INCOME,15000,'19. authored $15K/week');assert.equal(c.RANewOgaTunables.m10.REASK_DAYS,7);
  c.RANewOgaLadder.completeM9('give');c.RAClock.sleep();c.RANewOgaLadder.completeM10();const g=lane(c).m10GrantDay;
  for(let i=0;i<14;i++)c.RAClock.sleep();
  const paid=c.RAMoneyLedger.query({source:'new_oga:m10'});assert.deepEqual(J(paid.map(e=>[e.day-g,e.delta])),[[7,15000],[14,15000]],'19. exactly $15,000 on every 7th day after the grant');
  const nah=await boot(root);ladder(nah,{cars:[SUPRA]});nah.RANewOgaLadder.completeM9('nah');nah.RAClock.sleep();nah.RANewOgaLadder.completeM10();const gn=lane(nah).m10GrantDay;for(let i=0;i<7;i++)nah.RAClock.sleep();
  assert.deepEqual(J(nah.RAMoneyLedger.query({source:'new_oga:m10'}).map(e=>[e.day-gn,e.delta])),[[7,15000]],'NAH then M10: normal $15K/week');
  console.log('PASS f03 income: M10 pays the authored $15,000 every 7 days; also after NAH');
 }

 // ===================================================================== 20. save / reload preserves F03 state
 {
  const c=await boot(root);ladder(c,{cars:[SUPRA,URUS]});c.RANewOgaLadder.recordDrive(URUS,{by:2});
  c.RANewOgaLadder.completeM9('give');c.RAClock.sleep();c.RANewOgaLadder.completeM10();
  const store=c.RASaveFixtures.memoryStorage();c.RAState.write(store,c.RAState.get());const raw=Object.values(store.dump())[0];
  const r=await boot(root,{seedState:typeof raw==='string'?JSON.parse(raw):raw});
  const s=lane(r);assert.equal(s.m9TributedCar,URUS);assert.equal(s.m9Resolved,true);assert.equal(s.m10Completed,true);assert.equal(s.m10GrantsApplied,true);assert.equal(s.rank,5);assert.equal(s.office,'vice_president');
  assert.equal(r.RAVehicles.tributedCar(),URUS,'20. the reader survives reload');assert.equal(r.RAVehicles.isTributed(URUS),true);assert.equal(r.RALife.ownedCars().some(x=>x.id===URUS),false,'20. still hidden after reload');assert.equal(r.RALife.heldCars().some(x=>x.id===URUS),true,'20. still retained');
  const k=r.RANewOgaLadder.koreatown();assert.deepEqual([k.granted,k.pending],[true,true],'20. the queued Koreatown grant survives reload');
  assert.equal(r.RAFrag.read('F03','crew.queue',[]).length,2,'20. the recruit queue survives reload');
  warRoomOn(r);r.RAClock.sleep();assert.equal(r.RANewOgaLadder.koreatown().controlled,true,'20. ...and applies after reload');
  assert.equal(r.RAFrag.read('F03','crew.recruited',[]).length,2);
  console.log('PASS f03 save/reload: ladder lane, TRIBUTED state, queued Koreatown + recruit queue all persist and then apply');
 }

 // ===================================================================== THE ALTERNATIVE restoration
 {
  const setup=async flag=>{const c=await boot(root,{flag});c.RAClock.wake({first:true});c.RAState.patch('life.world.day',11);
   c.RAState.patch('life.newOga',{...c.RAState.get().life.newOga,status:'alternative_pending',mission:4,rank:1,title:'INTERN',carlosMutual:true,m4Outcome:'beat_1',alternativePending:true,lastMissionDay:10});return c;};
  const on=await setup(true);const w=await walkOf(root,on,'NEW_OGA_ALTERNATIVE',{minigame:()=>({outcome:'win',score:9999,data:{success:true},rewards:{}})});
  assert.ok(w.visited.includes('chairs')&&w.visited.includes('critique'),'flag ON: the chair activity (SLURP canopyDuty) replaces the scene fallback');assert.equal(lane(on).alternativeCompleted,true);
  const off=await setup(false);const w2=await walkOf(root,off,'NEW_OGA_ALTERNATIVE');
  assert.deepEqual(w2.visited,['voice','delivery'],'flag OFF: the frozen fallback is unchanged');assert.equal(lane(off).alternativeCompleted,true);
  const m4=await readFile(path.join(root,'js/data/btf/adventures/new_oga_m4.js'),'utf8');assert.ok(m4.includes("canopyDuty:true,totalChairs:T().chairs.AUTHORED_TOTAL"),'the SAME harness params as NEW_OGA_M3');
  console.log('PASS f03 THE ALTERNATIVE: chair activity via the accepted SLURP harness when ON; fallback byte-identical when OFF');
 }

 // ===================================================================== ownership: nobody but F03 defines Koreatown
 {
  const defs=[];for(const dir of ['js/frag','js/if1','js/systems','js/scenes','js/data'])for(const f of await walk(path.join(root,dir))){
   const src=(await readFile(f,'utf8')).replace(/^\s*\/\/.*$/gm,'');
   if(/RADistricts\??\.define\?*\.?\([^)]*koreatown/i.test(src)||/define\?*\.?\(\{[^}]*id:\s*['"]koreatown['"]/i.test(src))defs.push(path.relative(root,f));}
  assert.deepEqual(defs,['js/frag/F03/new_oga_ladder_close.js'],'F03 is the SOLE definer of Koreatown');
  console.log('PASS f03 ownership scan: js/frag/F03 is the only definer of Koreatown in shipped code');
 }
}
async function walk(dir){const out=[];let es;try{es=await readdir(dir,{withFileTypes:true});}catch(e){return out;}
 for(const e of es){const p=path.join(dir,e.name);if(e.isDirectory())out.push(...await walk(p));else if(/\.(js|mjs|html)$/.test(e.name))out.push(p);}return out;}
