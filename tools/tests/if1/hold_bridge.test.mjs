// FCPB convergence — the F05 raid -> F01 HOLD -> shared consequences -> F05 applyDefense host bridge (js/if1/hold_bridge.js).
// The F01 side is the REAL F01 PLAY engine (headless transport through the real adapter); F04/F05 are the real fragments in production load
// order. Reloads are true reloads: the save is written, a brand-new game context boots from it, and the F01 result store (which lives in
// F01's own page storage, outside the game save) is kept, exactly as the browser does.
import assert from 'node:assert/strict';
import {full,run,read} from './_lib.mjs';
import {F01_FILES,F04_FILES,F03_PROVIDER,playHost,activate} from '../F04/_lib.mjs';
import vm from 'node:vm';

const J=v=>JSON.parse(JSON.stringify(v));
const money=c=>Number(c.RAState.get().life.resources.money);

async function boot(root,{seedState=null,f05=true}={}){
 const ctx=await full(root,seedState?{seedState}:{});
 await run(root,ctx,F01_FILES);
 vm.runInContext(F03_PROVIDER,ctx,{filename:'F03-provider-fixture'});
 await run(root,ctx,F04_FILES);
 const f05files=JSON.parse(await read(root,'js/frag/F05/manifest.json')).files;
 await run(root,ctx,['js/frag/F05/migrations.js',...f05files,'js/if1/hold_bridge.js']);
 ctx.RAFeatures.set('F04.war_room',true);ctx.RAFeatures.set('F01.showdown_core',true);if(f05)ctx.RAFeatures.set('F05.trap',true);
 return ctx;
}
async function reload(root,ctx,host,opts={}){
 const store=ctx.RASaveFixtures.memoryStorage();ctx.RAState.write(store,ctx.RAState.get());
 const raw=Object.values(store.dump())[0];
 const next=await boot(root,{seedState:typeof raw==='string'?JSON.parse(raw):raw,...opts});
 if(host)next.RAShowdown.play.setTransport(host.transport);
 return next;
}
// a traphouse with stock + unbanked cash, HOT, and one scheduled raid (mirrors the F05 integration suite)
function raidReady(c){
 const R=c.RAF05;activate(c);
 c.RAState.patch('life.newOga',{...c.RAState.get().life.newOga,rank:3,status:'associate'});R.unlock.tick();
 c.RAState.patch('life.resources.money',1e6);R.unlock.buy('the_bando');
 R.production.addIngredient('synth',2);R.production.cook({houseId:'the_bando',grade:'D',cases:2,quality:95});
 R.store.addUnbanked(1000);c.RAHeat.add(60,{source:'test'});
 assert.equal(R.raids.schedule().ok,true);return R;
}
const stash=R=>R.store.batches().filter(b=>b.houseId==='the_bando').reduce((n,b)=>n+b.cases,0);
const snap=c=>({money:money(c),heat:c.RAHeat.snapshot().global.service,crew:J(c.RACrew.snapshot()),unbanked:c.RAF05.read('unbanked',0),stash:stash(c.RAF05),
 applied:Object.keys(c.RAFrag.read('F05','raids.applied',{})),history:c.RAF05.read('raids.history',[]).length});

export async function test(root){
 // ============================================================================================ 1. the happy path, every outcome, real F01 records
 const seen={};
 for(const policy of ['careful','greedy','naive','random'])for(let s=0;s<4;s++){
  const c=await boot(root);raidReady(c);const R=c.RAF05;
  const host=await playHost(root,{policy});c.RAShowdown.play.setTransport(host.transport);
  const raidId=R.raids.pending().id;
  const pre={money:money(c),heat:c.RAHeat.snapshot().global.service,unbanked:R.read('unbanked',0),stash:stash(R)};
  // burn `s` launches on other seeds so the four attempts differ (the seed derives from the launch id)
  c.RAF05.patch('raids.pending',{...R.raids.pending(),id:`raid:${5+s*7}:the_bando`});
  const rid=R.raids.pending().id;
  const out=await c.RAHoldBridge.start({origin:{app:'trap'}});
  assert.equal(out.ok,true,`${policy}/${s}: ${JSON.stringify(out)}`);
  assert.equal(out.applied,true);assert.equal(host.calls,1,'F01 ran the HOLD exactly once');
  const {req,res}=host.trace[0];
  // the request: the existing castle HOLD, canonical shared ids, house context inert
  assert.equal(req.job.f01JobId,'hold_the_house');assert.equal(req.job.context.source,'F05.raid');assert.equal(req.job.context.raidId,rid);
  assert.deepEqual(req.roster.map(o=>o.id).sort(),['auntie_grit','dre','half_pint','sunday_best','tunde','young_mazi'],'the shared RACrew ids, unchanged');
  for(const o of req.roster)assert.ok(c.RACrew.get(o.id),'every id is a shared RACrew id');
  assert.equal(c.RAHoldBridge.transaction(),null,'the completed transaction is cleared');
  // shared side, once: cash net (gain first, spend clamped) and the full HEAT delta on global
  const gain=res.cash.gain,spent=Math.min(res.cash.spent,pre.money+gain);
  assert.equal(money(c),pre.money+gain-spent,'shared cash = F01 pot - F01 spend, once, never negative');
  assert.equal(c.RAHeat.snapshot().global.service,Math.max(0,pre.heat+res.heat.delta),'HEAT delta applied once to GLOBAL');
  // F05 side: its own ledger, its own numbers, its own receipt
  const canon=out.canonical;seen[canon]=(seen[canon]||0)+1;
  const lost=canon!=='HELD';
  assert.equal(stash(R),lost?0:pre.stash,`${canon}: stash`);
  assert.equal(R.read('unbanked',0),lost?pre.unbanked-Math.round(pre.unbanked*0.3):pre.unbanked,`${canon}: 30% of unbanked, NOT a fifth`);
  assert.equal(R.raids.pending(),null);assert.ok(R.read('raids.applied',{})[rid],'F05 receipt');
  assert.equal(JSON.stringify(R.read('raids.history',[])).includes('supply'),false,'no castle SUPPLY loss anywhere');
  // capture clock: one timer, the accepted 3-night window; F01's inclusive counter is derived, never stored twice
  for(const cr of res.crew.filter(x=>x.after==='CAPTURED')){
   const u=c.RACrew.get(cr.id);assert.equal(u.status,'CAPTURED');assert.deepEqual(Object.keys(u.timers),['extract_window']);
   assert.equal(u.timers.extract_window.until-c.RALife.today().day,3);assert.equal((u.timers.extract_window.until-c.RALife.today().day)+1,4,'F01 CLOCK_START 4 == the 3-night window, inclusive');
  }
 }
 for(const k of ['HELD','BREACHED'])assert.ok(seen[k],`the sample covers ${k} (saw ${JSON.stringify(seen)})`);
 console.log(`PASS HOLD bridge happy path: 16 real F01 HOLDs (${JSON.stringify(seen)}): F01 once, shared cash/HEAT once, F05 stash + 30% only, receipt, one capture timer, RACrew ids end to end`);

 // ============================================================================================ 2. refusals before anything happens
 {
  const c=await boot(root,{f05:false});assert.equal(c.RAHoldBridge.available(),false);
  assert.equal((await c.RAHoldBridge.start()).code,'F05_OFF');
  const d=await boot(root);raidReady(d);d.RAFeatures.set('F01.showdown_core',false);
  assert.equal((await d.RAHoldBridge.start()).code,'F01_OFF','F01 dark: launch refused, raid untouched');assert.ok(d.RAF05.raids.pending());assert.equal(d.RAHoldBridge.transaction(),null);
  const e=await boot(root);activate(e);assert.equal((await e.RAHoldBridge.start()).code,'NO_RAID');
  console.log('PASS HOLD bridge refusals: F05 off / F01 off / no raid change nothing');
 }

 // ============================================================================================ 3. reload before handoff / after handoff before launch
 {
  let c=await boot(root);const R=raidReady(c);const host=await playHost(root);c.RAShowdown.play.setTransport(host.transport);
  const before=J(R.raids.pending());
  c=await reload(root,c,host);assert.deepEqual(J(c.RAF05.raids.pending()),before,'before handoff: the pending raid is intact');
  assert.equal(c.RAF05.raids.handoff().ok,true);
  c=await reload(root,c,host);assert.equal(c.RAF05.raids.pending().state,'handed');assert.equal(c.RAHoldBridge.transaction(),null,'after handoff, before launch: no transaction yet');
  const out=await c.RAHoldBridge.start();assert.equal(out.ok,true,JSON.stringify(out));assert.equal(out.applied,true,'the handed raid is still launchable');
  console.log('PASS HOLD bridge reload before handoff / after handoff before launch: raid intact and launchable');
 }

 // ============================================================================================ 4. reload during HOLD, then the F01 result already committed
 {
  let c=await boot(root);raidReady(c);const host=await playHost(root);
  const S0=snap(c);
  // F01 never answers (the player is mid-HOLD when the page dies)
  c.RAShowdown.play.setTransport(()=>new Promise(()=>{}));c.RAHoldBridge.start({origin:{app:'trap'}});
  await new Promise(r=>setTimeout(r,20));
  const t=c.RAHoldBridge.transaction();assert.equal(t.phase,'LAUNCHED');assert.equal(t.raidId,c.RAF05.raids.pending().id);
  assert.deepEqual(snap(c),S0,'during HOLD nothing is applied');
  c=await reload(root,c,host);
  assert.equal(c.RAHoldBridge.transaction().phase,'LAUNCHED');assert.equal(c.RAHoldBridge.transaction().launchId,t.launchId);
  assert.deepEqual(snap(c),S0,'reload during HOLD: no loss, no payout, raid intact');
  // F01 finished (committed its record) but the host died before receiving it: the SAME launch id is answered from F01's record
  const first=await host.transport(J(t.request));
  const c2=await reload(root,c,host);
  const out=await c2.RAHoldBridge.start();assert.equal(out.ok,true,JSON.stringify(out));
  assert.equal(host.calls,1,'relaunch of the interrupted HOLD did not replay it: F01 answered from its record');assert.equal(host.answeredFromRecord,1);
  assert.equal(out.canonical!=null,true);assert.equal(out.raidId,t.raidId);
  const S1=snap(c2);
  // and delivering that same record again changes nothing
  assert.equal((c2.RAHoldBridge.receive(J(first))).code,'NO_TRANSACTION');assert.deepEqual(snap(c2),S1);
  console.log('PASS HOLD bridge reload during HOLD: nothing applied, same launch id relaunched, F01 record reused not replayed');
 }

 // ============================================================================================ 5. result held before consumption; crash during delivery; repeated delivery
 for(const mode of ['held','delivering']){
  let c=await boot(root);raidReady(c);const host=await playHost(root);c.RAShowdown.play.setTransport(host.transport);
  const raidId=c.RAF05.raids.pending().id;const S0=snap(c);
  if(mode==='held'){
   // the result exists but F05 is not consuming (flag dark at that instant): it is HELD, durably, and applies nothing
   c.RAShowdown.play.setTransport(async req=>{const r=await host.transport(req);c.RAFeatures.set('F05.trap',false);return r;});
   const out=await c.RAHoldBridge.start();assert.equal(out.code,'F05_OFF');
   assert.equal(c.RAHoldBridge.transaction().phase,'RESULT_HELD');assert.deepEqual(snap(c),S0,'held result applied nothing');
  }else{
   // crash after the shared consequences landed but before F05 consumed: applyDefense throws once
   const raids=c.RATrap.raids,real=raids.applyDefense;let thrown=false;raids.applyDefense=(...a)=>{if(!thrown){thrown=true;throw new Error('crash');}return real(...a);};
   await assert.rejects(()=>c.RAHoldBridge.start(),/crash/);
   assert.equal(c.RAHoldBridge.transaction().phase,'DELIVERING');
   assert.equal(c.RAF05.raids.pending().id,raidId,'F05 had not consumed');
  }
  const held=J(c.RAHoldBridge.transaction());const shared=snap(c);
  c=await reload(root,c,host,{f05:false});             // the reload, THE TRAP still dark: nothing can consume yet
  assert.ok(c.RAHoldBridge.transaction(),'the transaction survived the reload');assert.equal(c.RAHoldBridge.transaction().launchId,held.launchId);
  assert.equal(c.RAHoldBridge.transaction().phase,mode==='held'?'RESULT_HELD':'DELIVERING');
  assert.equal(snap(c).applied.length,0,'nothing consumed while dark');
  c.RAFeatures.set('F05.trap',true);                    // the flag turning on recovers the held transaction with no UI, exactly once
  assert.equal(c.RAHoldBridge.transaction(),null,'recovered on its own');
  const S1=snap(c);assert.equal(S1.applied.length,1,'one F05 receipt');
  // exactly once: the shared totals equal a single application, however many times delivery is retried
  const res=held.record;const pre=S0.money,gain=res.cash.gain,spent=Math.min(res.cash.spent,pre+gain);
  assert.equal(S1.money,pre+gain-spent,`${mode}: cash applied once`);assert.equal(S1.heat,Math.max(0,S0.heat+res.heat.delta),`${mode}: HEAT applied once`);
  for(let i=0;i<3;i++){assert.equal(c.RAHoldBridge.recover().idle,true);assert.equal(c.RAHoldBridge.deliver().code,'NOTHING_TO_DELIVER');}
  assert.equal(c.RAHoldBridge.receive(J(res)).code,'NO_TRANSACTION','a repeated result is inert');
  assert.deepEqual(snap(c),S1,'repeated delivery: no second HEAT, cash, capture, stash loss or receipt');
  const again=c.RATrap.raids.applyDefense({record:{raidId,job:'hold_the_house',defense:true,getaway:'BREACHED',captives:[],lost:{guns:[]}},raidId});
  assert.equal(again.duplicate,true,'F05 answers a second delivery from its receipt');assert.deepEqual(snap(c),S1);
 }
 console.log('PASS HOLD bridge result held / crash during delivery / repeated delivery: recovered once, HEAT+cash+capture+stash exactly once, F05 receipt final');

 // ============================================================================================ 6. crash INSIDE the shared plan (a step threw)
 {
  let c=await boot(root);raidReady(c);const host=await playHost(root);c.RAShowdown.play.setTransport(host.transport);
  const S0=snap(c);const led=c.RAMoneyLedger,realCredit=led.credit,realDebit=led.debit;let boom=true;const realErr=console.error;console.error=()=>{};
  led.credit=(...a)=>{if(boom)throw new Error('disk full');return realCredit(...a);};led.debit=(...a)=>{if(boom)throw new Error('disk full');return realDebit(...a);};
  const out=await c.RAHoldBridge.start();
  const t=c.RAHoldBridge.transaction();
  if(t){assert.equal(t.phase,'DELIVERING');assert.equal(out.code,'SHARED_STEP_FAILED');assert.equal(c.RAF05.raids.pending()!==null,true,'F05 was NOT applied over a failed shared step');}
  boom=false;console.error=realErr;
  if(t){const got=c.RAHoldBridge.recover();assert.equal(got.ok,true,JSON.stringify(got));}
  const res=host.trace[0].res;const spent=Math.min(res.cash.spent,S0.money+res.cash.gain);
  assert.equal(money(c),S0.money+res.cash.gain-spent,'the failed shared step was retried once and landed once');
  assert.equal(snap(c).applied.length,1);
  console.log('PASS HOLD bridge shared-step failure: F05 not applied, retried idempotently');
 }

 // ============================================================================================ 7. stale / malformed / unknown results, back-out and relaunch
 // openHold(): a HOLD in flight whose F01 answer we hold in our hands (the page-level transport never answers; we deliver by hand)
 const openHold=async()=>{
  const c=await boot(root);const R=raidReady(c);const host=await playHost(root);let asked=null;
  c.RAShowdown.play.setTransport(req=>{asked=J(req);return new Promise(()=>{});});
  c.RAHoldBridge.start({origin:{app:'trap'}});await new Promise(r=>setTimeout(r,10));
  const t=c.RAHoldBridge.transaction();assert.equal(t.phase,'LAUNCHED');
  const real=J(await host.transport(asked));assert.equal(real.status,'COMPLETE');
  return {c,R,host,t,real,S0:snap(c),raidId:R.raids.pending().id};
 };
 {
  const {c,R,t,real,S0,raidId}=await openHold();
  assert.equal(c.RAHoldBridge.receive({...real,requestId:'hold:someone-else#9'}).code,'STALE_RESULT','a result for another launch is ignored');
  assert.equal(c.RAHoldBridge.transaction().phase,'LAUNCHED','a stale result leaves the transaction alone');assert.deepEqual(snap(c),S0);
  // a stale result for a PREVIOUS raid after that raid is answered and a new one is pending
  const ok=c.RAHoldBridge.receive(real);assert.equal(ok.ok,true,JSON.stringify(ok));
  const S1=snap(c);assert.equal(c.RAHoldBridge.receive(real).code,'NO_TRANSACTION');assert.deepEqual(snap(c),S1);
 }
 for(const [label,mutate,code] of [
  ['broken contract',r=>{r.schema='nope';},'BAD_RESULT'],
  ['truncated',r=>{delete r.cash;},'BAD_RESULT'],
  ['unknown crew id',r=>{r.crew[0].id='dre_ghost';},'UNKNOWN_CREW'],
  ['name-matched id',r=>{r.captured=['DRE'];},'UNKNOWN_CREW'],
  ['not a HOLD',r=>{r.job.f01JobId='tupperware';},'BAD_RESULT'],
  ['no canonical outcome',r=>{r.outcome.getaway=null;r.outcome.klass='CLEAN';r.outcome.fellBack=false;},'UNKNOWN_OUTCOME']
 ]){
  const {c,R,real,S0,raidId}=await openHold();const bad=J(real);mutate(bad);
  const out=c.RAHoldBridge.receive(bad);
  assert.equal(out.code,code,label);assert.equal(out.relaunchable,true);assert.equal(c.RAHoldBridge.transaction(),null,`${label}: transaction cleared`);
  assert.deepEqual(snap(c),S0,`${label}: applied nothing`);assert.equal(R.raids.pending().id,raidId,`${label}: raid kept`);
 }
 {
  // backing out (DECLINED) applies nothing, the raid stays pending and re-launchable under a NEW launch id; then it completes
  const c=await boot(root);const R=raidReady(c);const host=await playHost(root);c.RAShowdown.play.setTransport(host.transport);
  const S0=snap(c);const seq=c.RAFrag.read('if1','hold.seq',0);
  const declined=await c.RAHoldBridge.start({transport:async req=>({schema:'F01.play_result',version:1,requestId:req.requestId,status:'DECLINED',cash:{gain:0,spent:50}})});
  assert.equal(declined.status,'DECLINED');assert.equal(declined.relaunchable,true);assert.deepEqual(snap(c),S0,'back-out: no penalty of any kind (not even call spend)');
  assert.equal(R.raids.pending().state,'handed');assert.equal(c.RAHoldBridge.transaction(),null);
  const refused=await c.RAHoldBridge.start({transport:async req=>({schema:'F01.play_result',version:1,requestId:req.requestId,status:'REFUSED',code:'NOBODY_READY',reason:'NOBODY IS READY',cash:{gain:0,spent:0}})});
  assert.equal(refused.status,'REFUSED');assert.deepEqual(snap(c),S0,'a refusal applies nothing either');
  assert.ok(c.RAFrag.read('if1','hold.seq')>seq+1,'every relaunch gets a new launch id');
  const done=await c.RAHoldBridge.start();assert.equal(done.ok,true,JSON.stringify(done));assert.equal(done.applied,true);assert.equal(snap(c).applied.length,1);
  console.log('PASS HOLD bridge stale / malformed / unknown-crew / non-HOLD / unreadable results and back-out: all inert, raid kept, relaunch completes once');
 }

 // ============================================================================================ 8. persistence surface: shared namespaces only
 {
  const c=await boot(root);raidReady(c);const host=await playHost(root);c.RAShowdown.play.setTransport(host.transport);
  await c.RAHoldBridge.start();
  const save=c.RAState.get();const text=JSON.stringify(save);
  for(const key of ['rich_alucard_f01_sandbox_v1','world_f04','embed_results','world2'])assert.equal(text.includes(key),false,`sandbox/embed key ${key} never enters the shared save`);
  assert.equal(save.version,16,'schema is still v16: no schema invention');assert.deepEqual(Object.keys(save.frag).sort().filter(k=>!['F01','F04','F05','if1'].includes(k)),[],'shared namespaces only');
  assert.equal(save.frag.if1.hold.tx,null,'the bridge holds one transaction and it is cleared: no permanent applied ledger');
  assert.deepEqual(Object.keys(save.frag.if1.hold).sort(),['seq','tx'].concat(save.frag.if1.hold.lastRefusal?['lastRefusal']:[]).sort());
  console.log('PASS HOLD bridge persistence: shared namespaces only, no sandbox keys, schema v16, transaction cleared');
 }
}
