// F05 THE TRAP x F01 HOLD THE HOUSE - real-Chromium flow check (STOVE J). Not part of `npm test` (needs a browser).
//   node tools/f05-hold-browser.mjs [--shots dir]
// Two REAL pages on one static server:
//   GAME  /index.html?dev=1&ff=F05.the_trap        THE TRAP: setup -> real sleep()/NIGHT bus -> raid pending -> WAKE notice -> handoff()
//   PLAY  /assets/f01/play/index.html?hold=1       F01 THE PLAY runs HOLD THE HOUSE through its own UI and produces the record
// The record is carried from PLAY to GAME (what a host bridge would do) and delivered to RATrap.raids.applyDefense({record, raidId}).
// Then: repeated delivery, a real page reload at every stage, a second raid, a stale record, responsive widths.
// Exit 0 = every check passed: no console/page errors, no dead end, no duplicate processing.
import fs from 'node:fs';import path from 'node:path';
import {serve,loadPlaywright} from './f05-hold-browser-lib.mjs';
const arg=(k,d)=>{const i=process.argv.indexOf('--'+k);return i>=0?process.argv[i+1]:d;};
const SHOTS=arg('shots','');if(SHOTS)fs.mkdirSync(SHOTS,{recursive:true});
const {chromium}=loadPlaywright();
const CHROME=process.env.RA_CHROME||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const results=[];const log=(ok,name,detail='')=>{results.push({ok,name});console.log(`${ok?'PASS':'FAIL'} ${name}${detail?' - '+detail:''}`);return ok;};
const srv=await serve();const origin=`http://127.0.0.1:${srv.address().port}`;
const browser=await chromium.launch({headless:true,executablePath:fs.existsSync(CHROME)?CHROME:undefined});
const ctx=await browser.newContext({viewport:{width:390,height:844}});   // ONE context = one origin's localStorage: the game save persists across reloads
const errs=[];
function watch(page,tag){
 page.on('pageerror',e=>errs.push(`${tag} pageerror: ${e.message}`));
 page.on('console',m=>{if(m.type()==='error'&&!/favicon/.test(m.text()))errs.push(`${tag} console: ${m.text().slice(0,200)}`);});
 page.on('response',r=>{if(r.status()>=400&&!/favicon/.test(r.url()))errs.push(`${tag} http ${r.status()} ${r.url()}`);});
}
const shot=async(page,n)=>{if(SHOTS)await page.screenshot({path:path.join(SHOTS,n+'.png')});};
const GAME=`${origin}/index.html?dev=1&ff=F05.the_trap`;
const game=await ctx.newPage();watch(game,'GAME');
const ready=()=>game.waitForFunction(()=>window.RATrap&&window.RATrap.isBooted&&window.RATrap.isBooted()&&window.RAClock&&window.RAState,null,{timeout:30000});
const f05=fn=>game.evaluate(fn);

// ---- PLAY: drive F01's own UI through one HOLD THE HOUSE and return its record
async function playHold(seed){
 const p=await ctx.newPage();watch(p,'PLAY');
 await p.goto(`${origin}/assets/f01/play/index.html?speed=10&fresh=1&mute=1&seed=${seed}&hold=1`);
 await p.click('.title');await p.waitForSelector('.b-ans',{timeout:30000});
 const sawNotice=await p.evaluate(()=>!document.querySelector('.decide button')||true);
 await p.click('.b-ans');await p.waitForSelector('.send',{timeout:20000});await p.waitForTimeout(400);
 const hold=await p.$('.send.hold');
 if(hold){const bb=await hold.boundingBox();await p.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2);await p.mouse.down();await p.waitForTimeout(1700);await p.mouse.up();}else await p.click('.send');
 const t0=Date.now();
 for(;;){
  if(Date.now()-t0>240000)throw new Error('PLAY did not finish (softlock?)');
  await p.waitForTimeout(200);
  const s=await p.evaluate(()=>({d:document.querySelector('.decide button')?document.querySelector('.decide').dataset.kind:null,fb:!!document.querySelector('.decide .fb'),again:!!document.querySelector('.again')}));
  if(s.d){if(s.d==='CLIMB')await (await p.$('.decide button[data-id=OUT]')).click();else await (await p.$$('.decide button'))[0].click();}
  if(s.fb)await (await p.$('.decide .fb')).click();
  if(s.again)break;
 }
 await shot(p,`play_hold_${seed}`);
 const rec=await p.evaluate(()=>JSON.parse(JSON.stringify(window.__raPlay.G.last.rec)));
 await p.close();return rec;
}

try{
 // ================================================================ GAME: boot + authored setup
 await game.goto(GAME);await ready();
 log(await f05(()=>window.RAFeatures.enabled('F05.the_trap')&&window.RAFeatures.enabled('F05.trap')),'GAME: flag ON via ff=F05.the_trap, reserved F05.trap mirrored');
 log(await f05(()=>!!window.RAPhoneApps.get('trap')&&window.RAPhoneApps.get('trap').section==='money'),'GAME: TRAP phone app declared in the reserved slot');
 log(await f05(()=>window.RAWakeBus.order('night').filter(id=>id.startsWith('f05.')).length===3),'GAME: F05 NIGHT handlers registered on the bus (no collision at boot)');
 // HEAT 70, not 60: HOT is 60 and the NIGHT bus decays 3 (priority -35) BEFORE the raid check (-20)
 await f05(()=>{const R=window.RAF05;window.RAState.patch('life.newOga',{...window.RAState.get().life.newOga,rank:3,status:'associate'});R.unlock.tick();window.RAState.patch('life.resources.money',1e6);
  R.unlock.buy('the_bando');R.production.addIngredient('synth',2);R.production.cook({houseId:'the_bando',grade:'D',cases:2,quality:95});R.store.addUnbanked(1000);window.RAHeat.add(70,{source:'browser'});});
 log(await f05(()=>window.RAF05.store.ownedHouses().includes('the_bando')&&window.RAF05.store.batches().length>0),'GAME: authored setup - traphouse owned, product cooked, unbanked cash, HEAT HOT');
 const homeHtml=await f05(()=>window.RAPhoneApps.get('trap').render(null));
 log(/BANDO|the_bando/i.test(homeHtml)||homeHtml.length>50,'GAME: TRAP app renders the house',homeHtml.slice(0,60).replace(/\s+/g,' '));

 // ================================================================ GAME: real NIGHT -> WAKE
 const day0=await f05(()=>window.RALife.today().day);
 await f05(()=>window.RAClock.sleep());
 const st1=await f05(()=>({p:window.RAF05.raids.pending(),mail:(window.RALife.life().clock.mail||[]).filter(m=>/^trap:raid:/.test(m.id)).length,day:window.RALife.today().day}));
 log(!!st1.p&&st1.p.state==='pending'&&st1.day===day0+1,'GAME: real sleep() ran the NIGHT bus and scheduled the raid',st1.p&&st1.p.id);
 log(st1.mail===1,'GAME: WAKE delivered exactly one RAID notice');
 const worldHtml=await f05(()=>window.RAPhoneApps.get('trap').render('world'));
 log(/RAIDS/.test(worldHtml)&&/incoming/.test(worldHtml)&&!/F01_INTEGRATION_PENDING/.test(worldHtml),'GAME: raid card is player-facing (no dev marker)');
 const raidId=st1.p.id;

 // ================================================================ GAME: handoff, then reload while the HOLD is under way
 const h=await f05(()=>window.RATrap.raids.handoff());
 log(h.ok&&h.raidId===raidId&&h.play.job==='hold_the_house'&&Array.isArray(h.request.holdTurns),'GAME: handoff() -> canonical HOLD THE HOUSE request for the pending raid');
 log(JSON.stringify(Object.keys(h.request).sort())===JSON.stringify(['attacker','bigRaid','day','defenders','holdTurns','houseId','raidId','supports']),'GAME: request carries authored/state data only');
 await game.reload();await ready();
 const afterReload1=await f05(()=>({p:window.RAF05.raids.pending(),hist:window.RAF05.raids.history().length}));
 log(afterReload1.p&&afterReload1.p.id===raidId&&afterReload1.p.state==='handed'&&afterReload1.hist===0,'RELOAD (HOLD under way): raid still pending + handed, nothing applied');
 log(await f05(()=>window.RATrap.raids.handoff().raidId)===raidId,'RELOAD: handoff() re-launches the same raid');

 // ================================================================ PLAY: F01 runs the HOLD in its own UI
 const rec=await playHold(12);
 log(rec.job==='hold_the_house'&&rec.shape==='HOLD THE HOUSE',`PLAY: F01 ran HOLD THE HOUSE through its UI -> klass ${rec.klass}, getaway ${rec.getaway}`);

 // ================================================================ GAME: consume the result exactly once
 const before=await f05(()=>({bal:window.RALife.money(),heat:JSON.stringify(window.RAHeat.snapshot()),cases:window.RAF05.store.batches().reduce((n,b)=>n+b.cases,0),unb:window.RAF05.read('unbanked',0)}));
 const res=await game.evaluate(([r,id])=>window.RATrap.raids.applyDefense({record:r,raidId:id}),[rec,raidId]);
 const canonical=rec.fellBack?'FELL_BACK':rec.klass==='WASH'?'WASH':rec.getaway==='BREACHED'?'BREACHED':'HELD';
 log(res.ok&&res.duplicate===false&&res.canonical===canonical,`GAME: applyDefense consumed the real F01 record -> ${res.canonical}`);
 const after=await f05(()=>({bal:window.RALife.money(),heat:JSON.stringify(window.RAHeat.snapshot()),cases:window.RAF05.store.batches().reduce((n,b)=>n+b.cases,0),unb:window.RAF05.read('unbanked',0),p:window.RAF05.raids.pending(),hist:window.RAF05.raids.history()}));
 log(after.bal===before.bal,'GAME: balance untouched by F05 (F01 owns HOLD money)');
 log(after.heat===before.heat,'GAME: HEAT untouched by F05 (F01 owns HOLD heat)');
 const lost=canonical!=='HELD';
 log((after.cases===0)===lost&&((after.unb<before.unb)===lost),`GAME: stash/unbanked ${lost?'lost (breach path)':'kept (door held)'}`);
 log(after.p===null&&after.hist.length===1,'GAME: return to F05 flow - no pending raid, one history entry');
 await shot(game,'game_after_result');

 // ================================================================ repeated delivery + reload after consume
 const snap=await f05(()=>JSON.stringify(window.RAFrag.get('F05')));
 for(let i=0;i<3;i++){const again=await game.evaluate(([r,id])=>window.RATrap.raids.applyDefense({record:r,raidId:id}),[rec,raidId]);if(!(again.ok&&again.duplicate===true))log(false,'repeat delivery not a receipt');}
 log(await f05(()=>JSON.stringify(window.RAFrag.get('F05')))===snap,'GAME: 3x repeated delivery changes nothing in save.frag.F05');
 await game.reload();await ready();
 const afterReload2=await f05(()=>({p:window.RAF05.raids.pending(),hist:window.RAF05.raids.history().length,last:window.RAF05.raids.lastOutcome()}));
 log(afterReload2.p===null&&afterReload2.hist===1&&afterReload2.last.canonical===canonical,'RELOAD (after consume): state survived, no stranded pending');
 const dup=await game.evaluate(([r,id])=>window.RATrap.raids.applyDefense({record:r,raidId:id}),[rec,raidId]);
 log(dup.ok&&dup.duplicate===true&&(await f05(()=>window.RAF05.raids.history().length))===1,'RELOAD: redelivery after reload is a receipt (no double application)');

 // ================================================================ second raid: stale record cannot hit it
 await f05(()=>{const R=window.RAF05;R.production.addIngredient('synth',2);R.production.cook({houseId:'the_bando',grade:'D',cases:2,quality:95});R.store.addUnbanked(3000);window.RAHeat.add(70,{source:'browser'});});
 for(let i=0;i<8;i++)await f05(()=>window.RAClock.sleep());
 const raid2=await f05(()=>window.RAF05.raids.pending());
 log(!!raid2&&raid2.id!==raidId,'GAME: second raid scheduled by the real NIGHT bus after the cadence',raid2&&raid2.id);
 const state2=()=>f05(()=>({unb:window.RAF05.read('unbanked',0),cases:window.RAF05.store.batches().reduce((n,b)=>n+b.cases,0),p:window.RAF05.raids.pending().id,hist:window.RAF05.raids.history().length}));
 const pre2=await state2();
 const stale=await game.evaluate(([r,id])=>window.RATrap.raids.applyDefense({record:r,raidId:id}),[rec,raidId]);
 const snap2=await state2();
 log(stale.duplicate===true&&snap2.p===raid2.id&&JSON.stringify(snap2)===JSON.stringify(pre2)&&pre2.cases>0,'GAME: raid-1 record replayed against raid 2 is a receipt - raid 2 untouched');
 log((await game.evaluate(id=>window.RATrap.raids.applyDefense({record:{},raidId:id}),'raid:0:nowhere')).reason==='stale-raid','GAME: a record naming a different raid is refused (stale-raid)');
 await f05(()=>window.RATrap.raids.handoff());
 await game.reload();await ready();
 log(await f05(()=>window.RAF05.raids.pending().id)===raid2.id,'RELOAD (raid 2 handed): pending survives');
 const rec2=await playHold(31);
 const res2=await game.evaluate(([r,id])=>window.RATrap.raids.applyDefense({record:r,raidId:id}),[rec2,raid2.id]);
 log(res2.ok&&res2.duplicate===false&&(await f05(()=>window.RAF05.raids.history().length))===2&&(await f05(()=>window.RAF05.raids.pending()))===null,`GAME: second HOLD consumed once -> ${res2.canonical}; history 2, none stranded`);

 // ================================================================ runtime integrity
 for(const [w,hh] of [[360,640],[390,844],[430,932]]){
  await game.setViewportSize({width:w,height:hh});await game.waitForTimeout(150);
  const m=await game.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}));
  log(m.sw<=m.cw+1,`GAME: ${w}x${hh} no horizontal overflow`,`${m.sw}/${m.cw}`);
 }
 log(errs.length===0,'no console errors / page errors / failed requests across GAME and PLAY',errs.join(' | '));
}catch(e){log(false,'script error',String(e&&e.stack||e));}
finally{await browser.close();srv.close();}
const failed=results.filter(r=>!r.ok);console.log(`\n${results.length-failed.length}/${results.length} checks passed`);
process.exit(failed.length?1:0);
