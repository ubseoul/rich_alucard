// F04 WAR ROOM -> F01 THE PLAY -> F04: the real round trip. The host is the REAL F01 PLAY engine (js/frag/F01/play/*.mjs through the F01
// adapter, headless, deterministic); the War Room side is the real F04 code in production load order. Nothing is mocked across the seam.
import assert from 'node:assert/strict';
import {loadWar,saveOf,playHost,activate,card,money} from './_lib.mjs';

const J=v=>JSON.parse(JSON.stringify(v));
const prime=async(root,o={})=>{const ctx=await loadWar(root,o.load);activate(ctx,o.act);const host=await playHost(root,o.host);ctx.RAShowdown.play.setTransport(host.transport);return {ctx,host};};
const play=async(ctx,job,o)=>ctx.RAWarRoomPlay.launch(job,o);

export async function test(root){
 // ---- 1. REQUEST: strategic, versioned, no F01 simulation / F04 tactical stat blocks
 {const {ctx}=await prime(root);
  const b=ctx.RAWarRoomPlay.buildRequest(card(ctx,'TAKE_THE_BLOCK','koreatown'));assert.ok(b.ok,b.errors);const r=J(b.request);
  assert.equal(r.schema,'F04.play_request');assert.equal(r.version,ctx.RAPlayContract.VERSION);assert.ok(ctx.RAPlayContract.validateRequest(r).ok);
  assert.deepEqual(r.roster.map(o=>o.id).sort(),['auntie_grit','dre','half_pint','sunday_best','tunde','young_mazi']);
  assert.ok(r.roster.every(o=>o.status==='ACTIVE'&&!('stats' in o)&&!('actionsPerTurn' in o)),'no provisional stat block, no tactical fields');
  assert.deepEqual([...r.garage.owned].sort(),['HOOPTIE','SUPRA','URUS'],"personal cars plus B1's existing encounter transport");
  assert.equal(r.bank,money(ctx));assert.equal(r.job.district,'koreatown');assert.ok(['car_wash_stickup','smack_crib'].includes(r.job.f01JobId));
  assert.equal(r.rich,undefined,'Rich does not go: no field stats');assert.equal(r.grid,undefined,'no grid / seating / approach');assert.equal(JSON.stringify(r).includes('%'),false);
  for(const t of ['DROP','RE_UP','COLLECT','PROTECT','BAIT','TAKE_THE_BLOCK','RETALIATION'])assert.ok(ctx.RAWarRoomPlay.buildRequest(card(ctx,t,'inglewood')).ok,`${t} maps to a PLAY`);
  assert.equal(ctx.RAWarRoomPlay.buildRequest(card(ctx,'LAY_LOW',null)).code,'NOT_A_PLAY','LAY LOW never goes to F01');}

 // ---- 2. WAR ROOM -> PLAY -> WAR ROOM through the real phone action, applied exactly once from the canonical record
 {const {ctx,host}=await prime(root);
  const before={bank:money(ctx),heat:ctx.RAHeat.global(),dHeat:ctx.RAHeat.district('inglewood')};
  const menu=ctx.RAWarRoomJobs.buildNightMenu();const i=menu.findIndex(j=>j.type!=='LAY_LOW');const job=menu[i];
  await ctx.RAPhoneApps.get('warRoom').onAction('play',String(i),{refresh(){}});
  assert.equal(host.calls,1,'F01 ran the PLAY exactly once');assert.equal(host.trace.length,1);
  const {req,res}=host.trace[0];assert.equal(res.status,'COMPLETE');assert.ok(ctx.RAPlayContract.validateResult(res).ok);
  assert.equal(ctx.RAWarRoomPlay.pending(),null,'nothing pending once consumed');
  const done=ctx.RAWarRoomPlay.consumed(req.requestId);assert.ok(done&&done.errors.length===0,'consumed cleanly: '+JSON.stringify(done));
  // crew: F01 vocabulary -> RACrew, recoverable injuries are NOT bleed-outs
  for(const c of res.crew){const u=ctx.RACrew.get(c.id);const want={READY:'ACTIVE',WOUNDED:'DOWNED',SHOT:'DOWNED',CAPTURED:'CAPTURED',GONE:'GONE',DEAD:'GONE'}[c.after];assert.equal(u.status,want,`${c.id} ${c.after}`);
   if(want==='DOWNED'){assert.ok(u.timers.recovery&&u.timers.recovery.onExpire==='ACTIVE'&&!u.timers.bleed,'a carried-home injury recovers; it does not bleed out to GONE');}}
  // money: exactly the PLAY's banked pot minus what it cost Rich. No authored cash on top (no duplicate rewards), never below zero.
  assert.equal(money(ctx),Math.max(0,before.bank+res.cash.gain-res.cash.spent),'bank = PLAY pot - PLAY spend, once');
  // HEAT: the PLAY's number in F04's existing district + 30% global distribution; the authored per-type HEAT is NOT added
  const d=res.heat.delta;assert.equal(ctx.RAHeat.district(job.district)-before.dHeat,d);assert.equal(ctx.RAHeat.global()-before.heat,Math.round(Math.abs(d)*0.3)*Math.sign(d));
  // the strategic record: log + report card, no PLAY presentation, no numbers from the tactical layer
  const log=ctx.RAFrag.read('F04','jobs.log',[]).at(-1);assert.equal(log.via,'play');assert.equal(log.requestId,req.requestId);
  const rc=ctx.RAWarRoomReportCard.recent(1)[0];assert.equal(rc.success,res.outcome.win);assert.ok(!('f01Pending' in rc));
  assert.equal(ctx.RAFrag.read('F04','jobs.nightsSinceStart',0),1);}

 // ---- 3. idempotency: the same record can never pay twice
 {const {ctx,host}=await prime(root);
  const out=await play(ctx,card(ctx,'COLLECT','arts_district'));assert.ok(out.ok);
  const {req,res}=host.trace[0];const bank=money(ctx),heat=ctx.RAHeat.global(),crew=J(ctx.RACrew.snapshot());
  const again=ctx.RAWarRoomPlay.consume(J(res));assert.equal(again.duplicate,true,'consuming the same requestId again is a no-op');
  assert.equal(money(ctx),bank);assert.equal(ctx.RAHeat.global(),heat);assert.deepEqual(J(ctx.RACrew.snapshot()),crew);
  assert.equal(ctx.RAFrag.read('F04','jobs.log',[]).filter(e=>e.requestId===req.requestId).length,1,'one log entry');
  assert.equal(ctx.RAWarRoomReportCard.recent(20).length,1,'one report card');
  // a NEW launch is a new request (new id), and a completed request re-asked of F01 is answered from its record, not replayed
  const second=await play(ctx,card(ctx,'COLLECT','arts_district'));assert.ok(second.ok);assert.notEqual(host.trace[1].req.requestId,req.requestId);
  const replay=await host.transport(req);assert.equal(replay.digest,res.digest);assert.equal(host.calls,2,'no third simulation');assert.equal(host.answeredFromRecord,1);}

 // ---- 4. reload / persistence, including a reload BETWEEN F01 finishing and F04 consuming (the crash window)
 {const {ctx,host}=await prime(root);
  // F04 persists the request BEFORE asking F01
  const built=ctx.RAWarRoomPlay.buildRequest(card(ctx,'TAKE_THE_BLOCK','inglewood'));
  ctx.RAFrag.patch('F04','play.pending',{request:built.request,carMap:built.carMap,jobMeta:built.jobMeta,seq:built.seq,startedDay:1});
  const res=await host.transport(built.request);          // F01 completed ... and the tab died before F04 consumed
  assert.equal(res.status,'COMPLETE');const bank0=money(ctx);
  const c2=await loadWar(root,{seedState:saveOf(ctx)});
  assert.equal(c2.RAWarRoomPlay.pending().request.requestId,built.request.requestId,'the pending request survived the reload');
  assert.equal(money(c2),bank0,'nothing was applied yet');
  c2.RAShowdown.play.setTransport(host.transport);
  const out=await c2.RAWarRoomPlay.resume();assert.ok(out.ok&&!out.duplicate);
  assert.equal(host.calls,1,'F01 answered from its record: no second simulation');assert.equal(host.answeredFromRecord,1);
  assert.equal(money(c2),Math.max(0,bank0+res.cash.gain-res.cash.spent));
  // reload after consumption: everything persisted, nothing pending, and a stray re-delivery is still a no-op
  const c3=await loadWar(root,{seedState:saveOf(c2)});
  assert.equal(c3.RAWarRoomPlay.pending(),null);assert.ok(c3.RAWarRoomPlay.consumed(built.request.requestId));
  for(const c of res.crew)assert.equal(c3.RACrew.get(c.id).status,{READY:'ACTIVE',WOUNDED:'DOWNED',SHOT:'DOWNED',CAPTURED:'CAPTURED',GONE:'GONE',DEAD:'GONE'}[c.after]);
  const bank3=money(c3);c3.RAFrag.patch('F04','play.pending',{request:built.request,carMap:built.carMap,jobMeta:built.jobMeta,seq:built.seq});
  assert.equal(c3.RAWarRoomPlay.consume(J(res)).duplicate,true);assert.equal(money(c3),bank3);
  assert.equal(c3.RAWarRoomPlay.pending(),null,'a duplicate delivery also clears the stale pending marker');}

 // ---- 5. BANKED MONEY IS SAFE: a poor Rich, across many PLAYs, never goes negative; the ledger agrees
 {const {ctx,host}=await prime(root,{act:{money:2500},host:{policy:'naive'}});
  for(let n=0;n<8;n++){const act=ctx.RAWarRoomCrew.activeOgas();if(act.length<3)break;
   const b=money(ctx);await play(ctx,card(ctx,['COLLECT','TAKE_THE_BLOCK','DROP'][n%3],['inglewood','arts_district'][n%2]));
   assert.ok(money(ctx)>=0,'bank never negative');
   const t=host.trace.at(-1);if(t&&t.res.status==='COMPLETE')assert.ok(money(ctx)>=b-t.res.cash.spent);
   for(const o of ctx.RACrew.list())if(o.status==='DOWNED'&&o.timers.recovery)ctx.RACrew.setStatus(o.id,'ACTIVE',{reason:'test-heal'});}
  const led=ctx.RAMoneyLedger.byFamily().war_room;assert.ok(led&&led.count>0,'every credit / debit is tagged war_room');}

 // ---- 6. district ownership: Koreatown jobs run; the request carries the F03-owned id
 {const {ctx,host}=await prime(root);
  const out=await play(ctx,card(ctx,'TAKE_THE_BLOCK','koreatown'));assert.ok(out.ok);assert.equal(host.trace[0].req.job.district,'koreatown');
  assert.equal(ctx.RADistricts.get('koreatown').fragment,'F03');}

 // ---- 7. REFUSALS change nothing (flag off / F01 absent / bad contract / bad result). RC2 (OL-063): a Rich who owns no mappable car is NOT refused:
 //         the first PLAY is reachable on Day 2, so the crew's own hooptie is the ride (F01 car HOOPTIE) until he owns a car F01 knows.
 {const {ctx,host}=await prime(root,{act:{cars:[]}});                       // Rich owns no mappable car
  const built=ctx.RAWarRoomPlay.buildRequest(card(ctx,'TAKE_THE_BLOCK','inglewood'));
  assert.ok(built.ok);assert.deepEqual(J(built.request.garage.owned),['HOOPTIE'],'no car owned: the crew hooptie, nothing invented, nothing owned');
  const out=await play(ctx,card(ctx,'TAKE_THE_BLOCK','inglewood'));
  assert.ok(out.ok&&!out.refused,'a Rich with no car still makes the PLAY');assert.equal(ctx.RAWarRoomPlay.pending(),null);assert.equal(ctx.RAVehicles.list().length,0,"the hooptie is never added to Rich garage");
  const off=await loadWar(root,{f04Flag:true});activate(off);off.RAFeatures.set('F01.showdown_core',false);
  const o2=await off.RAWarRoomPlay.launch(card(off,'DROP','inglewood'));assert.equal(o2.code,'FLAG_OFF');assert.equal(off.RAWarRoomPlay.pending(),null,'nothing persisted when F01 is off');
  const noF01=await loadWar(root,{f01:false});activate(noF01);assert.equal((await noF01.RAWarRoomPlay.launch(card(noF01,'DROP','inglewood'))).code,'F01_ABSENT');
  // a transport that returns garbage is refused by the F01 facade; F04 records the refusal and stays unchanged
  const g=await loadWar(root);activate(g);g.RAShowdown.play.setTransport(async req=>({schema:'nope',requestId:req.requestId}));
  const bg=money(g);const o3=await g.RAWarRoomPlay.launch(card(g,'DROP','inglewood'));assert.equal(o3.refused,true);assert.equal(o3.code,'BAD_RESULT');assert.equal(money(g),bg);
  // the F01 facade validates the request too
  const bad=await g.RAShowdown.play.launch({schema:'F04.play_request',version:1});assert.equal(bad.status,'REFUSED');assert.equal(bad.code,'BAD_REQUEST');}

 // ---- 8. EXTRACT, RETALIATION, HAND BACK all go through the same seam
 {const {ctx,host}=await prime(root);
  ctx.RAWarRoomCrew.setCaptured('young_mazi',{reason:'test'});
  const ex=ctx.RAWarRoomJobs.buildNightMenu().find(j=>j.type==='EXTRACT');assert.ok(ex&&ex.target==='young_mazi','EXTRACT card names its target');
  const out=await play(ctx,ex);assert.ok(out.ok);const t=host.trace.at(-1);assert.equal(t.req.job.f01JobId,'extract');assert.deepEqual(t.req.job.captive.ids,['young_mazi']);
  if(t.res.rescued.includes('young_mazi')){assert.equal(ctx.RACrew.get('young_mazi').status,'ACTIVE');assert.equal(ctx.RACrew.get('young_mazi').timers.extract_window,undefined,'the extract window closes');}
  else assert.ok(['CAPTURED','GONE'].includes(ctx.RACrew.get('young_mazi').status),'a failed extract does not silently free anyone');}
 {const {ctx,host}=await prime(root);
  ctx.RAFrag.patch('F04','districts.inglewood.retaliationPending',true);
  const rt=ctx.RAWarRoomJobs.buildNightMenu().find(j=>j.type==='RETALIATION');assert.ok(rt,'a due retaliation is surfaced as a job');
  await play(ctx,rt);assert.equal(host.trace[0].req.job.f01JobId,'hold_the_house');assert.equal(ctx.RAFrag.read('F04','districts.inglewood.retaliationPending',null),false,'answered retaliation clears');}
 {const {ctx,host}=await prime(root);
  ctx.RAFrag.patch('F04','active',true);ctx.RAFrag.patch('F04','offer.status','accepted');
  const hb=ctx.RAWarRoomJobs.initiateHandBack();assert.ok(hb.ok);
  await Promise.resolve(ctx.RAPhoneApps.get('warRoom').onAction('handBack',null,{refresh(){}})); // a second initiate is refused: the route is already pending
  assert.equal(ctx.RAWarRoomPlay.pending(),null,'a refused second initiate launches nothing');
  const out=await play(ctx,hb.job);assert.ok(out.ok,JSON.stringify(out));
  assert.equal(ctx.RAFrag.read('F04','offer.status',null),'closed_fame','HAND BACK closes the route when its result is consumed');assert.equal(ctx.RAFrag.read('F04','active',null),false);}

 // ---- 9. consuming odd records is safe: recruit cap, unknown crew, spent > bank
 {const {ctx}=await prime(root);
  const b=ctx.RAWarRoomPlay.buildRequest(card(ctx,'DROP','inglewood'));
  const put=()=>ctx.RAFrag.patch('F04','play.pending',{request:b.request,carMap:b.carMap,jobMeta:b.jobMeta,seq:b.seq});
  ctx.RAWarRoomCrew.recruit({id:'r1',name:'R1',cls:'GHOST'});ctx.RAWarRoomCrew.recruit({id:'r2',name:'R2',cls:'DOC'}); // roster now 8
  const rec={schema:'F01.play_result',version:1,requestId:b.request.requestId,status:'COMPLETE',outcome:{win:true},crew:[{id:'tunde',before:'ACTIVE',after:'READY',away:0},{id:'ghost_unknown',before:'ACTIVE',after:'GONE',away:0}],
   cash:{gain:1000,spent:9999999},heat:{delta:0},car:{id:null,lost:false},recruits:[{id:'g100',name:'NEW',cls:'GHOST'}],rescued:[],captured:[],loot:[],storySeeds:[],newBonds:[]};
  put();const ce=console.error;console.error=()=>{};let out;try{out=ctx.RAWarRoomPlay.consume(rec);}finally{console.error=ce;}assert.ok(out.ok);assert.ok(money(ctx)>=0,'spent is clamped to what Rich has');
  assert.equal(ctx.RACrew.get('g100'),null,'roster cap (8) is F04\'s: the recruit is rejected, not forced in');
  assert.ok(out.summary.rejectedRecruits.some(r=>r.id==='g100'&&r.reason==='roster-full'));
  assert.ok(out.errors.some(e=>e.startsWith('crew:ghost_unknown')),'an unknown crew id is reported, the rest still applies');}

 // ---- 9b. F01 status vocabulary -> RACrew, pinned deterministically (a hurt Oga who came home recovers; he does not bleed out to GONE)
 {const {ctx}=await prime(root);
  const b=ctx.RAWarRoomPlay.buildRequest(card(ctx,'TAKE_THE_BLOCK','inglewood'));
  ctx.RAFrag.patch('F04','play.pending',{request:b.request,carMap:b.carMap,jobMeta:b.jobMeta,seq:b.seq});
  const rec={schema:'F01.play_result',version:1,requestId:b.request.requestId,status:'COMPLETE',outcome:{win:false},
   crew:[{id:'tunde',before:'ACTIVE',after:'READY',away:0},{id:'dre',before:'ACTIVE',after:'WOUNDED',away:1},{id:'half_pint',before:'ACTIVE',after:'SHOT',away:2},{id:'young_mazi',before:'ACTIVE',after:'CAPTURED',away:0},{id:'sunday_best',before:'ACTIVE',after:'GONE',away:0}],
   cash:{gain:0,spent:0},heat:{delta:6},car:{id:'SUPRA',lost:true,route:'DEALER',cause:'CRASH',crashed:true},recruits:[],rescued:[],captured:['young_mazi'],loot:[],storySeeds:[],newBonds:[]};
  assert.ok(ctx.RAWarRoomPlay.consume(rec).ok);
  const st=id=>ctx.RACrew.get(id);
  assert.equal(st('tunde').status,'ACTIVE');
  assert.equal(st('dre').status,'DOWNED');assert.ok(st('dre').timers.recovery&&st('dre').timers.recovery.onExpire==='ACTIVE'&&!st('dre').timers.bleed,'WOUNDED recovers');
  assert.equal(st('half_pint').status,'DOWNED');assert.ok(st('half_pint').timers.recovery.until>st('dre').timers.recovery.until,'SHOT stays out longer than WOUNDED');
  assert.equal(st('young_mazi').status,'CAPTURED');assert.ok(st('young_mazi').timers.extract_window,'CAPTURED opens the EXTRACT window');
  assert.equal(st('sunday_best').status,'GONE');
  ctx.RACrew.tick(ctx.RALife.today().day+1);assert.equal(st('dre').status,'ACTIVE','one night later the WOUNDED Oga is back');assert.equal(st('half_pint').status,'DOWNED');
  ctx.RACrew.tick(ctx.RALife.today().day+2);assert.equal(st('half_pint').status,'ACTIVE','SHOT is back after two nights, never GONE');
  assert.equal(st('dre').status,'ACTIVE');assert.notEqual(st('tunde').status,'GONE');
  assert.ok(ctx.RAFrag.read('F04','jobs.log',[]).at(-1).result==='captured','a PLAY that leaves someone behind is logged as captured');}

 // ---- 10. the War Room surface: no tactical RUN presentation, no squad/car/approach UI, no percentages, no pending marker
 {const {ctx}=await prime(root);
  const app=ctx.RAPhoneApps.get('warRoom');
  for(const sub of [null,'jobs','crew','reports','handback','squad:0']){const html=app.render(sub);
   for(const bad of ['F01_INTEGRATION_PENDING','SELECT SQUAD','APPROACH','OCTOPUS_BRAIN','SHOWDOWN','🚗 RUN','⚔','%','QUIET','LOUD'])assert.equal(html.includes(bad),false,`${sub||'board'} must not contain ${bad}`);}
  const jobs=app.render('jobs');assert.ok(jobs.includes('MAKE THIS PLAY'));assert.equal(jobs.includes('REWARD: $'),false,'cash comes from the PLAY, not from an authored card');
  assert.equal(jobs.includes('type="checkbox"'),false);assert.equal(jobs.includes('type="radio"'),false);}

 console.log('PASS F04 -> F01 -> F04 round trip (real F01 engine: request contract, single application, no duplicate rewards, banked money safe, crew/HEAT/district/vehicle state, reload incl. crash window, EXTRACT / RETALIATION / HAND BACK, refusals inert, no tactical RUN UI)');
}
