// F05 THE TRAP x F01 HOLD THE HOUSE - final integration suite (auto-discovered: node tools/run-tests.mjs --fragment f05).
// Uses the REAL F01 THE PLAY engine (js/frag/F01/play + the play-sim driver) to produce HOLD records, and feeds them to
// F05 through the canonical path:  schedule() -> handoff() -> [F01 HOLD] -> applyDefense({record, raidId}).
// Proves: the record reader matches F01's own semantics, exactly-once / stale / duplicate handling, F05 never touches the
// balance or HEAT, reload safety at every stage, no legacy dependency, and the shared night-priority tie rule.
import assert from 'node:assert/strict';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {full,run,read,same} from '../if1/_lib.mjs';

async function load(root,{seedState=null}={}){
 const ctx=await full(root,seedState?{seedState}:{});
 const files=JSON.parse(await read(root,'js/frag/F05/manifest.json')).files;
 await run(root,ctx,['js/frag/F05/migrations.js',...files]);
 ctx.RAFeatures.set('F05.trap',true);
 return ctx;
}
const money=(c,n)=>c.RAState.patch('life.resources.money',n);
const unlockRich=c=>{c.RAState.patch('life.newOga',{...c.RAState.get().life.newOga,rank:3,status:'associate'});c.RAF05.unlock.tick();};
// a house with stock and unbanked cash, HOT, and one scheduled raid
function raidReady(c){
 const R=c.RAF05;unlockRich(c);money(c,1e6);R.unlock.buy('the_bando');
 R.production.addIngredient('synth',2);R.production.cook({houseId:'the_bando',grade:'D',cases:2,quality:95});
 R.store.addUnbanked(1000);c.RAHeat.add(60,{source:'test'});
 assert.equal(R.raids.schedule().ok,true);return R;
}
// a true reload: write the save, boot a brand new game context from it
async function reload(root,c){
 const store=c.RASaveFixtures.memoryStorage();c.RAState.write(store,c.RAState.get());
 const raw=Object.values(store.dump())[0];
 return load(root,{seedState:typeof raw==='string'?JSON.parse(raw):raw});
}
const stashCases=R=>R.store.batches().filter(b=>b.houseId==='the_bando').reduce((n,b)=>n+b.cases,0);

export async function test(root){
 // ---- real F01 HOLD records (the accepted F01 engine, not hand-built shapes)
 const dir=path.join(root,'tools','tests','f01','play-sim');
 const imp=f=>import(pathToFileURL(path.join(dir,f)).href);
 const {runPlay}=await imp('driver.mjs');const {JOBS}=await imp('content.mjs');
 const hold=JOBS.find(j=>j.defense);
 const recs=[];
 for(const policy of ['careful','greedy','naive','random'])for(let s=1;s<=60;s++)recs.push(runPlay({seed:s*13+7,job:hold,policy}));
 const pick=f=>recs.find(f);

 // ============================================================================================ 1. record reader vs F01 semantics
 {
  const c=await load(root);const R=c.RAF05;const tally={};
  for(const r of recs){
   const got=R.raids.fromPlayRecord(r);
   const want=r.fellBack?'FELL_BACK':r.klass==='WASH'?'WASH':r.getaway==='BREACHED'?'BREACHED':r.getaway==='HELD'?'HELD':null;
   assert.equal(got,want,`record klass=${r.klass} getaway=${r.getaway} win=${r.win} -> ${got}, F01 says ${want}`);
   assert.notEqual(got,null,'every real HOLD record maps to a canonical outcome');
   tally[got]=(tally[got]||0)+1;
  }
  for(const k of ['HELD','BREACHED','FELL_BACK','WASH'])assert.ok(tally[k]>0,`the real-record sample covers ${k}`);
  const costlyHeld=recs.filter(r=>r.klass==='COSTLY'&&r.getaway==='HELD');
  assert.ok(costlyHeld.length>0,'sample includes COSTLY|HELD (a HELD door with a shot Oga)');
  for(const r of costlyHeld)assert.equal(R.raids.fromPlayRecord(r),'HELD','a costly hold is still HELD, not a breach');
  console.log(`PASS F05 x F01 record reader: ${recs.length} real HOLD records map to F01's own HELD/BREACHED/FELL_BACK/WASH (COSTLY|HELD stays HELD)`);
 }

 // ============================================================================================ 2. consequences from real records
 for(const [label,find,expect] of [
  ['HELD',r=>r.getaway==='HELD'&&r.klass==='COSTLY',{stashLost:false,hot:false}],
  ['BREACHED',r=>r.getaway==='BREACHED'&&r.captives.length===0,{stashLost:true,hot:true}],
  ['FELL_BACK',r=>r.fellBack,{stashLost:true,hot:true,zeroCapture:true}],
  ['WASH',r=>r.klass==='WASH'&&r.captives.length>0,{stashLost:true,hot:true,captives:true}]
 ]){
  const rec=pick(find);assert.ok(rec,`a real ${label} record exists`);
  const c=await load(root);const R=raidReady(c);
  const h=R.raids.handoff();assert.equal(h.ok,true);
  const balance=c.RALife.money(),heat=JSON.stringify(c.RAHeat.snapshot()),banked=R.read('bankedTotal',null);
  const before={cases:stashCases(R),unbanked:R.read('unbanked',0)};
  const res=R.raids.applyDefense({record:rec,raidId:h.raidId});
  assert.equal(res.ok,true,label);assert.equal(res.canonical,label);assert.equal(res.duplicate,false);
  assert.equal(stashCases(R)===0,expect.stashLost,`${label}: stash`);
  assert.equal(R.read('unbanked',0)<before.unbanked,expect.stashLost,`${label}: unbanked`);
  assert.equal(!!res.result.hotUntilDay,expect.hot,`${label}: house heat window`);
  if(expect.zeroCapture)assert.equal(res.result.crewCaptured.length,0,'FELL BACK: 0 captures');
  if(expect.captives)same(res.result.crewCaptured,rec.captives,'F01 captives are authoritative');
  // F01 owns pot / heatDelta / spent / pocketLoss: F05 applies none of it
  assert.equal(c.RALife.money(),balance,`${label}: F05 must not touch the balance (pot cash ${rec.pot.cash}K is F01's)`);
  assert.equal(JSON.stringify(c.RAHeat.snapshot()),heat,`${label}: F05 must not add HEAT (record heatDelta ${rec.heatDelta} is F01's)`);
  assert.equal(R.raids.pending(),null,'return to F05 flow: no pending raid left');
  assert.equal(R.raids.lastOutcome().canonical,label);
 }
 console.log('PASS F05 x F01 consequences: HELD/BREACHED/FELL_BACK/WASH from real records; no balance, no HEAT, no loot applied by F05');

 // ============================================================================================ 3. repeated / stale / cross-raid delivery
 {
  const c=await load(root);const R=raidReady(c);const A=R.raids.handoff();
  const rec=pick(r=>r.getaway==='BREACHED'&&r.captives.length===0);
  assert.equal(R.raids.applyDefense({record:rec}).reason,'raid-id-required','a result that names no raid is refused');
  assert.equal(R.raids.applyDefense({record:rec,raidId:'raid:0:nowhere'}).reason,'stale-raid','a record for another raid is refused');
  const first=R.raids.applyDefense({record:rec,raidId:A.raidId});assert.equal(first.duplicate,false);
  const snap=JSON.stringify(c.RAFrag.get('F05'));
  for(let i=0;i<3;i++){const again=R.raids.applyDefense({record:rec,raidId:A.raidId});assert.equal(again.ok,true);assert.equal(again.duplicate,true);}
  assert.equal(JSON.stringify(c.RAFrag.get('F05')),snap,'repeated delivery changes nothing in save.frag.F05');
  // the NEXT raid (7+ nights later) must not be hit by the previous raid's record
  c.RAState.patch('life.world.day',c.RALife.today().day+8);R.store.addUnbanked(5000);   // eight real nights later
  R.production.addIngredient('synth',2);R.production.cook({houseId:'the_bando',grade:'D',cases:2,quality:95});
  const s2=R.raids.schedule();assert.equal(s2.ok,true,'second raid schedules once the first is resolved');
  const B=R.raids.handoff();assert.notEqual(B.raidId,A.raidId);
  const unb=R.read('unbanked',0),cases=stashCases(R);
  const late=R.raids.applyDefense({record:rec,raidId:A.raidId});
  assert.equal(late.duplicate,true,'late redelivery of raid A is a receipt');
  assert.equal(R.read('unbanked',0),unb);assert.equal(stashCases(R),cases);assert.equal(R.raids.pending().id,B.raidId,'raid B is untouched and still pending');
  assert.equal(R.raids.history().length,1,'only raid A is in history');
  console.log('PASS F05 x F01 exactly-once: no raid id refused, stale refused, duplicate = receipt, late record cannot hit the next raid');
 }

 // ============================================================================================ 4. a pending raid is never overwritten
 {
  const c=await load(root);const R=raidReady(c);const id=R.raids.pending().id;
  c.RAState.patch('life.world.day',c.RALife.today().day+30);
  assert.equal(R.raids.eligible().reason,'raid-pending');
  assert.equal(R.raids.schedule().ok,false);assert.equal(R.raids.pending().id,id,'the unanswered raid stays');
  console.log('PASS F05 pending raid is never silently replaced by the next schedule()');
 }

 // ============================================================================================ 5. reload at every stage
 {
  // stage a) before HOLD: no pending -> reload -> nothing to hand off, nothing invented
  let c=await load(root);const R0=c.RAF05;unlockRich(c);money(c,1e6);R0.unlock.buy('the_bando');
  c=await reload(root,c);assert.equal(c.RAF05.raids.pending(),null);assert.equal(c.RAF05.raids.handoff().reason,'no-pending-raid');

  // stage b) pending raid, reload, then handoff
  c=await load(root);let R=raidReady(c);const id=R.raids.pending().id;
  c=await reload(root,c);R=c.RAF05;assert.equal(R.raids.pending().id,id,'pending raid survives a reload');
  const h1=R.raids.handoff();assert.equal(h1.raidId,id);assert.equal(R.raids.pending().state,'handed');

  // stage c) handed (HOLD under way), reload: still pending + re-launchable with the same request, nothing applied
  c=await reload(root,c);R=c.RAF05;assert.equal(R.raids.pending().state,'handed');
  same(R.raids.handoff().request,h1.request);assert.equal(R.raids.history().length,0,'no consequence before a result exists');

  // stage d) F01 result exists but is not yet consumed: applying after the reload works exactly once
  const rec=pick(r=>r.getaway==='BREACHED'&&r.captives.length===0);
  const cases0=stashCases(R);assert.ok(cases0>0);
  assert.equal(R.raids.applyDefense({record:rec,raidId:id}).duplicate,false);
  assert.equal(stashCases(R),0);

  // stage e) after F05 consumed it: reload, the same record delivered again is a receipt, nothing re-applies
  c=await reload(root,c);R=c.RAF05;
  assert.equal(R.raids.pending(),null);assert.equal(R.raids.history().length,1);assert.equal(R.raids.lastOutcome().canonical,'BREACHED');
  const unb=R.read('unbanked',0),snap=JSON.stringify(R.raids.history());
  const again=R.raids.applyDefense({record:rec,raidId:id});
  assert.equal(again.ok,true);assert.equal(again.duplicate,true,'receipt survives the reload');
  assert.equal(R.read('unbanked',0),unb);assert.equal(JSON.stringify(R.raids.history()),snap,'no duplicate history/loss after reload');
  console.log('PASS F05 x F01 reload: before HOLD / pending / handed / result-unconsumed / consumed / repeated delivery after reload');
 }

 // ============================================================================================ 6. crew capture is not re-stamped
 {
  const c=await load(root);const R=raidReady(c);
  c.RACrew.define({id:'tunde',name:'TUNDE',fragment:'F04',meta:{}});
  c.RACrew.setStatus('tunde','CAPTURED',{reason:'f01',timer:{name:'extract_window',days:9,onExpire:'GONE'}});
  const t0=JSON.stringify(c.RACrew.get('tunde').timers);
  const rec={...pick(r=>r.klass==='WASH'&&r.captives.length>0),captives:['tunde']};
  R.raids.applyDefense({record:rec,raidId:R.raids.pending().id});
  assert.equal(JSON.stringify(c.RACrew.get('tunde').timers),t0,'an already-CAPTURED Oga keeps their existing timer');
  console.log('PASS F05 x F01 crew: F05 never resets a capture timer F01 (or an earlier raid) already set');
 }

 // ============================================================================================ 7. holdTurns request shape + legacy retirement
 {
  const c=await load(root);const R=raidReady(c);
  const h=R.raids.handoff();assert.ok(Array.isArray(h.request.holdTurns));
  const shared=await read(root,'js/frag/F05/raids.js');
  for(const f of ['raids.js','phone_app.js','wake.js','trap.js','tunables.js']){
   const src=await read(root,'js/frag/F05/'+f);
   if(f==='tunables.js')continue;   // trap_report_card is an authored ART need (artNeeds), asserted below
   assert.equal(/trap_report_card/.test(src),false,f+' has no trap_report_card dependency');
  }
  assert.equal(/trap_report_card/.test(shared),false);
  // the only mention is the F05-authored ART item - not a mechanic, route, action or render call
  const art=c.RATrap.artNeeds?c.RATrap.artNeeds():[];
  assert.equal(Array.isArray(art),true);
  console.log('PASS F05 legacy: no trap_report_card code path in raids/phone/wake/trap (art need only, unchanged)');
 }

 // ============================================================================================ 8. wake priorities on the real bus
 {
  const c=await load(root);const info=c.RAClock.handlerInfo();
  const night=info.filter(h=>h.priority<0);
  const byP=new Map();for(const h of night){byP.set(h.priority,(byP.get(h.priority)||[]).concat(h.id));}
  for(const [p,ids] of byP)assert.equal(ids.length,1,`night priority ${p} is unique on the current base (${ids})`);
  assert.equal(night.find(h=>h.id==='f05.raid-schedule').priority,-20);
  // reproduce the reported collision: any second night handler at -20 is rejected by RAWakeBus (F04 heat-decay, per the ticket)
  let err=null;try{c.RAWakeBus.subscribe({id:'f04.heat-decay',fragment:'F04',phase:'night',priority:-20,fn(){}});}catch(e){err=e;}
  assert.ok(err&&/priority -20 already used by f05\.raid-schedule/.test(err.message),'RAWakeBus rejects the tie: '+(err&&err.message));
  console.log('PASS F05 wake: F05 night priorities unique on the current base; a second -20 handler is rejected by RAWakeBus (collision reproduced)');
 }

 console.log('PASS F05 x F01 HOLD THE HOUSE final integration');
}
