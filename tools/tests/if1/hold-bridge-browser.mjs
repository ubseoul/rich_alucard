// FCPB convergence — REAL-BROWSER HOLD flow through the shared host bridge (js/if1/hold_bridge.js). Not part of `npm test` (needs Chromium).
//   node tools/tests/if1/hold-bridge-browser.mjs [--shots dir] [--dist dist]
// One game page (index.html), the real phone (CHECK PHONE -> TRAP -> world -> HOLD THE HOUSE button), the real F01 PLAY page in its embed
// iframe running the accepted castle HOLD through its own UI, the canonical result carried back by the real postMessage transport, shared
// consequences + F05 applyDefense applied by the bridge. Reloads are real page reloads; the game save and F01's own page storage live in the
// same browser context exactly as in production.
// Scenarios: S1 pending raid -> phone launch -> castle HOLD -> shared result -> F05 application; S2 reload after handoff before launch;
// S3 reload DURING the HOLD then relaunch; S4 reload after the result exists but before consumption; S5 reload during delivery;
// S6 repeated / stale / malformed delivery; S7 responsive widths (360 / 390 / 430) over the phone surface and the HOLD; zero console/page errors.
import fs from 'node:fs';import path from 'node:path';
import {serve,loadPlaywright,root} from '../f05/_browser-lib.mjs';
const arg=(k,d)=>{const i=process.argv.indexOf('--'+k);return i>=0?process.argv[i+1]:d;};
const SHOTS=arg('shots','');if(SHOTS)fs.mkdirSync(SHOTS,{recursive:true});
const DIST=arg('dist','');
const {chromium}=loadPlaywright();
const CHROME=process.env.RA_CHROME||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const results=[];const log=(ok,name,detail='')=>{results.push({ok,name});console.log(`${ok?'PASS':'FAIL'} ${name}${detail?' - '+detail:''}`);return ok;};
const srv=await serve(DIST?path.resolve(DIST):root);const origin=`http://127.0.0.1:${srv.address().port}`;
const browser=await chromium.launch({headless:true,executablePath:fs.existsSync(CHROME)?CHROME:undefined});
const ctx=await browser.newContext({viewport:{width:390,height:844}});
const errs=[];
const FLAGS='F01.showdown_core,F04.war_room,F05.trap,F06.rainmaker';
const URL_=`${origin}/index.html?dev=1&ff=${FLAGS}&speed=10&mute=1`;
const page=await ctx.newPage();
page.on('pageerror',e=>errs.push(`pageerror: ${e.message}`));
page.on('console',m=>{if(m.type()==='error'&&!/favicon/.test(m.text()))errs.push(`console: ${m.text().slice(0,220)}`);});
page.on('response',r=>{if(r.status()>=400&&!/favicon/.test(r.url()))errs.push(`http ${r.status()} ${r.url()}`);});
const shot=async n=>{if(SHOTS)await page.screenshot({path:path.join(SHOTS,n+'.png')});};
const ev=(fn,a)=>page.evaluate(fn,a);
const ready=()=>page.waitForFunction(()=>window.RATrap&&window.RATrap.isBooted&&window.RATrap.isBooted()&&window.RAHoldBridge&&window.RAState&&window.RAClock,null,{timeout:30000});

// ---- a fresh life with WAR ROOM active, a traphouse with stock + unbanked cash, HEAT HOT, and (optionally) a real NIGHT that schedules the raid
async function fresh({realNight=false,schedule=true}={}){
 await page.goto(URL_);await ready();
 await ev(()=>{localStorage.clear();RAState.reset();RAState.patch('life.clock.started',true);for(const k of ['prologueDone','throneDone','firstWakeDone'])RALife.setFlag(k,true);RAState.patch('life.world.day',9);RAState.patch('life.resources.money',1e6);});
 await page.reload();await ready();
 await ev(()=>{
  RAFrag.patch('F04','active',true);RAFrag.patch('F04','offer.status','accepted');
  const R=window.RAF05;RAState.patch('life.newOga',{...RAState.get().life.newOga,rank:3,status:'associate'});R.unlock.tick();
  R.unlock.buy('the_bando');R.production.addIngredient('synth',2);R.production.cook({houseId:'the_bando',grade:'D',cases:2,quality:95});R.store.addUnbanked(1000);RAHeat.add(70,{source:'browser'});
 });
 if(realNight){await ev(()=>RAClock.sleep());}
 else if(schedule)await ev(()=>{if(!RAF05.raids.pending())RAF05.raids.schedule();});
 await page.reload();await ready();
 await page.click('#startButton');await page.waitForFunction(()=>document.body.classList.contains('bedroom-mode'),null,{timeout:20000});
}
const snap=()=>ev(()=>{
 const h=RAHoldBridge.transaction();
 return {money:RALife.money(),heat:RAHeat.snapshot().global.service,unbanked:RAF05.read('unbanked',0),stash:RAF05.store.batches().filter(b=>b.houseId==='the_bando').reduce((n,b)=>n+b.cases,0),
  pending:RAF05.raids.pending(),applied:Object.keys(RAFrag.read('F05','raids.applied',{})),hist:RAF05.raids.history().length,
  tx:h?{phase:h.phase,launchId:h.launchId,raidId:h.raidId}:null,crew:JSON.stringify(RACrew.snapshot())};
});
// keep the real result the bridge received (for exactness maths and replay)
const capture=()=>ev(()=>{const p=RAShowdown.play;if(p.__cap)return;const o=p.launch;p.__cap=true;window.__results=[];p.launch=async(...a)=>{const r=await o.apply(p,a);window.__results.push(JSON.parse(JSON.stringify(r)));return r;};});
async function openRaidSurface(){
 for(let i=0;i<4;i++){const done=await page.$('.mail-done');if(!done||!await done.isVisible())break;await done.click();await page.waitForTimeout(400);}   // the morning mail after a real night: GET UP
 await page.click('#checkPhone');await page.waitForFunction(()=>window.RAPhone&&window.RAPhone.isOpen(),null,{timeout:10000});
 await ev(()=>window.RAPhone.openApp('trap','world'));
 await page.waitForSelector('#phoneContent .phone-card',{timeout:10000});
}
const holdButton=()=>page.$('#phoneContent [data-phone-action="do:trap:holdRaid"]');
// ---- drive F01's own embed UI through the castle HOLD
async function playThrough({leaveAt=null}={}){
 await page.waitForSelector('#f01-play-frame',{timeout:30000});
 const fh=await page.$('#f01-play-frame');const frame=await fh.contentFrame();
 await frame.waitForSelector('.b-ans',{timeout:40000});await page.waitForTimeout(200);
 await frame.click('.b-ans');await frame.waitForSelector('.send',{timeout:30000});await page.waitForTimeout(400);
 if(leaveAt==='send')return frame;
 const hold=await frame.$('.send.hold');
 if(hold){const bb=await hold.boundingBox();await page.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2);await page.mouse.down();await page.waitForTimeout(1700);await page.mouse.up();}else await frame.click('.send');
 if(leaveAt==='live'){await page.waitForTimeout(1500);return frame;}
 const t0=Date.now();
 for(;;){
  if(Date.now()-t0>240000)throw new Error('the HOLD did not finish (softlock?)');
  await page.waitForTimeout(200);
  if(!await page.$('#f01-play-frame'))return null;
  const s=await frame.evaluate(()=>({d:document.querySelector('.decide button')?document.querySelector('.decide').dataset.kind:null,fb:!!document.querySelector('.decide .fb'),again:!!document.querySelector('.again')})).catch(()=>({}));
  if(s.d){if(s.d==='CLIMB')await (await frame.$('.decide button[data-id=OUT]')).click();else await (await frame.$$('.decide button'))[0].click();}
  if(s.fb)await (await frame.$('.decide .fb')).click();
  if(s.again){await frame.click('.again');break;}
 }
 await page.waitForFunction(()=>!document.querySelector('#f01-play-frame'),null,{timeout:20000});
 return null;
}
const expectShared=(pre,res)=>{const gain=res.cash.gain,spent=Math.min(res.cash.spent,pre.money+gain);return {money:pre.money+gain-spent,heat:Math.max(0,pre.heat+res.heat.delta)};};
const canon=r=>r.outcome.fellBack?'FELL_BACK':r.outcome.klass==='WASH'?'WASH':r.outcome.getaway==='BREACHED'?'BREACHED':'HELD';
async function settled(pred,label,ms=20000){try{await page.waitForFunction(pred,null,{timeout:ms});return true;}catch(e){log(false,`timeout waiting for ${label}`);return false;}}

try{
 // ================================================================ S1: pending raid -> phone launch -> castle HOLD -> shared result -> F05 application
 await fresh({realNight:true});await capture();
 const pend=await ev(()=>RAF05.raids.pending());
 log(!!pend&&pend.state==='pending','S1 a real NIGHT scheduled the pending raid',pend&&pend.id);
 await openRaidSurface();
 log(!!await holdButton(),'S1 the phone raid surface offers HOLD THE HOUSE (host bridge available)');
 const html=await ev(()=>document.querySelector('#phoneContent').innerHTML);
 log(/incoming/.test(html)&&!/F01_INTEGRATION_PENDING/.test(html),'S1 raid card is player-facing');
 await shot('s1_raid_surface');
 const pre1=await snap();
 await page.click('#phoneContent [data-phone-action="do:trap:holdRaid"]');
 await page.waitForSelector('#f01-play-frame',{timeout:30000});
 log((await snap()).tx&&(await snap()).tx.phase==='LAUNCHED','S1 the transaction was persisted BEFORE F01 was asked',JSON.stringify((await snap()).tx));
 log(await ev(()=>RAF05.raids.pending().state)==='handed','S1 F05 handoff() ran (raid handed)');
 const mid=await snap();log(mid.money===pre1.money&&mid.heat===pre1.heat&&mid.stash===pre1.stash&&mid.unbanked===pre1.unbanked,'S1 during the HOLD nothing is applied');
 await shot('s1_hold_open');
 await playThrough();
 await settled(()=>!window.RAHoldBridge.transaction(),'S1 delivery');
 const post1=await snap();const res1=(await ev(()=>window.__results)).at(-1);
 log(res1&&res1.status==='COMPLETE'&&res1.job.f01JobId==='hold_the_house','S1 F01 ran the existing castle HOLD (job hold_the_house)');
 const want1=expectShared(pre1,res1);
 log(post1.money===want1.money,`S1 shared cash applied once (${pre1.money} -> ${post1.money}, F01 gain ${res1.cash.gain} spend ${res1.cash.spent})`);
 log(post1.heat===want1.heat,`S1 HEAT delta applied once to global (${pre1.heat} -> ${post1.heat}, delta ${res1.heat.delta})`);
 const c1=canon(res1),lost=c1!=='HELD';
 log(post1.pending===null&&post1.applied.length===1&&post1.hist===1&&post1.tx===null,`S1 F05 applied its receipt once -> ${c1}; raid cleared; transaction cleared`);
 log((post1.stash===0)===lost&&((post1.unbanked<pre1.unbanked)===lost),`S1 F05 trap-side rule: ${lost?'stash lost + 30% of unbanked':'door held: stash and unbanked kept'}`);
 if(lost)log(post1.unbanked===pre1.unbanked-Math.round(pre1.unbanked*0.3),'S1 exactly 30% of unbanked (not a fifth), no supply/castle loss');
 log(await ev(()=>!!document.querySelector('#phoneContent')&&RAPhone.isOpen()),'S1 the player is back on the phone, safe');
 await shot('s1_after');
 const save1=await ev(()=>({keys:Object.keys(localStorage),game:localStorage.getItem('rich_alucard_save_v1')||''}));
 log(!/embed_results|world_f04|rich_alucard_f01_sandbox_v1/.test(save1.game),'S1 the game save holds no F01 sandbox/embed keys',save1.keys.join(','));

 // ================================================================ S6 (part 1): repeated delivery of the same result after completion
 const snapDone=await snap();
 const again=await ev(r=>({recv:RAHoldBridge.receive(r).code,f05:RATrap.raids.applyDefense({record:{raidId:r.requestId,defense:true,getaway:'BREACHED',captives:[]},raidId:RAHoldBridge.transaction()?RAHoldBridge.transaction().raidId:Object.keys(RAFrag.read('F05','raids.applied',{}))[0]}).duplicate,deliver:RAHoldBridge.deliver().code}),res1);
 log(again.recv==='NO_TRANSACTION'&&again.f05===true&&again.deliver==='NOTHING_TO_DELIVER','S6 repeated delivery is inert (bridge) and a receipt (F05)');
 const snapAfter=await snap();log(JSON.stringify(snapAfter)===JSON.stringify(snapDone),'S6 repeated delivery: no second HEAT, cash, capture, stash loss or receipt');
 await page.reload();await ready();
 log(JSON.stringify(await snap())===JSON.stringify(snapDone),'S1 reload after completion: state survived, nothing stranded, nothing re-applied');

 // ================================================================ S2: reload after handoff, before launch
 await fresh();await capture();
 const raid2=await ev(()=>{RATrap.raids.handoff();return RAF05.raids.pending();});
 await page.reload();await ready();
 const s2=await snap();log(s2.pending&&s2.pending.id===raid2.id&&s2.pending.state==='handed'&&!s2.tx,'S2 reload after handoff, before launch: raid intact and launchable');
 await page.click('#startButton');await page.waitForFunction(()=>document.body.classList.contains('bedroom-mode'),null,{timeout:20000});await capture();
 await openRaidSurface();
 const b2=await holdButton();log(!!b2&&/BACK IN/.test(await b2.innerText()),'S2 the handed raid offers BACK IN');
 const pre2=await snap();await b2.click();await playThrough();await settled(()=>!window.RAHoldBridge.transaction(),'S2 delivery');
 const post2=await snap();const res2=(await ev(()=>window.__results)).at(-1);
 log(post2.pending===null&&post2.applied.length===1&&post2.money===expectShared(pre2,res2).money,'S2 the handed raid completed once');

 // ================================================================ S3: reload DURING the HOLD, then relaunch
 await fresh();await capture();
 await openRaidSurface();const pre3=await snap();
 await page.click('#phoneContent [data-phone-action="do:trap:holdRaid"]');
 const frame3=await playThrough({leaveAt:'live'});
 const tx3=(await snap()).tx;log(tx3&&tx3.phase==='LAUNCHED','S3 mid-HOLD: transaction LAUNCHED');
 const midS=await snap();log(midS.money===pre3.money&&midS.heat===pre3.heat&&midS.stash===pre3.stash&&midS.applied.length===0,'S3 mid-HOLD: no loss / payout applied');
 await page.reload();await ready();
 const s3=await snap();
 log(s3.tx&&s3.tx.launchId===tx3.launchId&&s3.tx.phase==='LAUNCHED'&&s3.pending&&s3.money===pre3.money&&s3.heat===pre3.heat&&s3.stash===pre3.stash&&s3.applied.length===0,'S3 reload during the HOLD: raid + transaction intact, nothing applied');
 await page.click('#startButton');await page.waitForFunction(()=>document.body.classList.contains('bedroom-mode'),null,{timeout:20000});await capture();
 await openRaidSurface();
 log(/BACK IN/.test(await (await holdButton()).innerText()),'S3 the interrupted HOLD offers BACK IN (backing out costs nothing; the raid is still pending)');
 await page.click('#phoneContent [data-phone-action="do:trap:holdRaid"]');await playThrough();await settled(()=>!window.RAHoldBridge.transaction(),'S3 delivery');
 const post3=await snap();const res3=(await ev(()=>window.__results)).at(-1);
 log(res3.requestId===tx3.launchId,'S3 the relaunch reused the SAME launch id (same raid identity)');
 log(post3.pending===null&&post3.applied.length===1&&post3.money===expectShared(pre3,res3).money&&post3.heat===expectShared(pre3,res3).heat,'S3 the relaunched HOLD applied once');

 // ================================================================ S4: reload after the result exists, before consumption
 await fresh();await capture();
 await ev(()=>{const p=RAShowdown.play,o=p.launch;p.launch=async(...a)=>{const r=await o.apply(p,a);window.__results=(window.__results||[]);window.__results.push(JSON.parse(JSON.stringify(r)));RAFeatures.set('F05.trap',false);return r;};});
 await openRaidSurface();const pre4=await snap();
 await page.click('#phoneContent [data-phone-action="do:trap:holdRaid"]');await playThrough();
 await settled(()=>window.RAHoldBridge.transaction()&&window.RAHoldBridge.transaction().phase==='RESULT_HELD','S4 result held');
 const held4=await snap();
 log(held4.tx.phase==='RESULT_HELD'&&held4.money===pre4.money&&held4.heat===pre4.heat&&held4.stash===pre4.stash&&held4.applied.length===0,'S4 result durably held, nothing applied yet');
 const res4=(await ev(()=>window.__results)).at(-1);
 await page.reload();await ready();
 await settled(()=>!window.RAHoldBridge.transaction(),'S4 recovery');
 const post4=await snap();
 log(post4.applied.length===1&&post4.pending===null&&post4.money===expectShared(pre4,res4).money&&post4.heat===expectShared(pre4,res4).heat,'S4 reload after result before consumption: recovered and delivered exactly once');

 // ================================================================ S5: reload during delivery (shared consequences landed, F05 not yet)
 await fresh();await capture();
 await ev(()=>{RATrap.raids.applyDefense=()=>({ok:false,reason:'flag-off'});});    // the page dies between the shared step and F05's consumption
 await openRaidSurface();const pre5=await snap();
 await page.click('#phoneContent [data-phone-action="do:trap:holdRaid"]');await playThrough();
 await settled(()=>window.RAHoldBridge.transaction()&&window.RAHoldBridge.transaction().phase==='DELIVERING','S5 delivering');
 const mid5=await snap();const res5=(await ev(()=>window.__results)).at(-1);const w5=expectShared(pre5,res5);
 log(mid5.tx.phase==='DELIVERING'&&mid5.money===w5.money&&mid5.heat===w5.heat&&mid5.applied.length===0&&!!mid5.pending,'S5 shared consequences landed, F05 not yet consumed');
 await page.reload();await ready();
 await settled(()=>!window.RAHoldBridge.transaction(),'S5 recovery');
 const post5=await snap();
 log(post5.applied.length===1&&post5.pending===null&&post5.money===w5.money&&post5.heat===w5.heat,'S5 reload during delivery: F05 consumed once; shared money + HEAT NOT applied twice');
 await page.reload();await ready();
 log(JSON.stringify(await snap())===JSON.stringify(post5),'S5 a further reload changes nothing');

 // ================================================================ S6 (part 2): stale + malformed results, back-out relaunch
 await fresh();await capture();
 await openRaidSurface();const pre6=await snap();
 await page.click('#phoneContent [data-phone-action="do:trap:holdRaid"]');
 await playThrough({leaveAt:'send'});
 const tx6=(await snap()).tx;
 const stale=await ev(()=>RAHoldBridge.receive({schema:'F01.play_result',version:1,requestId:'hold:someone-else#9',status:'COMPLETE'}).code);
 log(stale==='STALE_RESULT'&&(await snap()).tx.launchId===tx6.launchId,'S6 a stale result is ignored and leaves the open HOLD alone');
 const bad=await ev(id=>RAHoldBridge.receive({schema:'nope',requestId:id}).code,tx6.launchId);
 const afterBad=await snap();
 log(bad==='BAD_RESULT'&&afterBad.tx===null&&afterBad.pending&&afterBad.pending.id===pre6.pending.id&&afterBad.money===pre6.money&&afterBad.heat===pre6.heat&&afterBad.applied.length===0,'S6 a malformed result is refused; the raid is kept, nothing applied');
 await page.reload();await ready();await page.click('#startButton');await page.waitForFunction(()=>document.body.classList.contains('bedroom-mode'),null,{timeout:20000});await capture();
 await openRaidSurface();
 await page.click('#phoneContent [data-phone-action="do:trap:holdRaid"]');await playThrough();await settled(()=>!window.RAHoldBridge.transaction(),'S6 relaunch delivery');
 const post6=await snap();const res6=(await ev(()=>window.__results)).at(-1);
 log(post6.applied.length===1&&post6.pending===null&&res6.requestId!==tx6.launchId,'S6 the relaunch after the refused result completes once under a new launch id');

 // ================================================================ S7: responsive widths over the phone surface and the HOLD
 await fresh();await capture();
 for(const [w,h] of [[360,640],[390,844],[430,932]]){
  await page.setViewportSize({width:w,height:h});await page.waitForTimeout(200);
  if(!await ev(()=>window.RAPhone.isOpen()))await openRaidSurface();else await ev(()=>window.RAPhone.openApp('trap','world'));
  const m=await ev(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,btn:(()=>{const b=document.querySelector('#phoneContent [data-phone-action="do:trap:holdRaid"]');if(!b)return null;const r=b.getBoundingClientRect();return {l:r.left,r:r.right,w:innerWidth};})()}));
  log(m.sw<=m.cw+1&&m.btn&&m.btn.l>=0&&m.btn.r<=m.btn.w+1,`S7 ${w}x${h} phone raid surface: no horizontal overflow, HOLD button on-screen`,`${m.sw}/${m.cw}`);
 }
 await page.setViewportSize({width:360,height:640});
 await page.click('#phoneContent [data-phone-action="do:trap:holdRaid"]');
 const fr=await playThrough({leaveAt:'live'});
 for(const [w,h] of [[360,640],[390,844],[430,932]]){
  await page.setViewportSize({width:w,height:h});await page.waitForTimeout(250);
  const m=await fr.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth})).catch(()=>({sw:0,cw:1}));
  const outer=await ev(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}));
  log(m.sw<=m.cw+1&&outer.sw<=outer.cw+1,`S7 ${w}x${h} HOLD embed: no horizontal overflow`,`frame ${m.sw}/${m.cw}, page ${outer.sw}/${outer.cw}`);
  await shot(`s7_hold_${w}`);
 }
 log(errs.length===0,'zero console errors / page errors / failed requests across every scenario',errs.join(' | '));
}catch(e){log(false,'script error',String(e&&e.stack||e));}
finally{await browser.close();srv.close();}
const failed=results.filter(r=>!r.ok);console.log(`\n${results.length-failed.length}/${results.length} checks passed`);
process.exitCode=failed.length?1:0;
