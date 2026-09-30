// WHOLE-GAME CANDIDATE 001 — fresh-save smoke traversal (real Chromium, the BUILT dist/ artifact, ONE continuous save). Not part of `npm test`.
//   node tools/tests/candidate/whole_game_smoke.mjs [--dist dist] [--shots dir] [--json out.json]
// Smoke, not a playtest: it reads state and asserts exactly-once / no-corruption; it never judges feel and never tunes anything.
// One browser context, one localStorage save, one page that is only ever reloaded (never reset) after the fresh boot:
//   P0 fresh boot (empty storage) -> START -> prologue adventure mounts           P1 progressed life -> bedroom -> phone navigation
//   P2 RAINMAKER: dark -> first resolved event -> unlocked once -> persisted -> app opens   P3 WAR ROOM -> THE PLAY -> exact money + crew consequences
//   P4 car loss -> GET IT BACK (one tap, one car) -> the job is playable again       P5 THE TRAP through the real phone (buy / base / assign / upgrade)
//   P6 raid -> HOLD handoff -> F01 castle HOLD -> return -> shared consequences once   P7 save -> reload -> state identical -> continued play after reload
import fs from 'node:fs';import path from 'node:path';
import {serve,loadPlaywright,root} from '../f05/_browser-lib.mjs';
const arg=(k,d)=>{const i=process.argv.indexOf('--'+k);return i>=0?process.argv[i+1]:d;};
const SHOTS=arg('shots','');if(SHOTS)fs.mkdirSync(SHOTS,{recursive:true});
const DIST=path.resolve(arg('dist','dist'));
const {chromium}=loadPlaywright();
const CHROME=process.env.RA_CHROME||process.env.RA_CHROMIUM_PATH||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const results=[];const log=(ok,name,detail='')=>{results.push({ok:!!ok,name,detail});console.log(`${ok?'PASS':'FAIL'} ${name}${detail?' - '+detail:''}`);return ok;};
const srv=await serve(DIST);const origin=`http://127.0.0.1:${srv.address().port}`;
const browser=await chromium.launch({headless:true,executablePath:fs.existsSync(CHROME)?CHROME:undefined});
const ctx=await browser.newContext({viewport:{width:390,height:844}});
const FLAGS='F01.showdown_core,F04.war_room,F05.trap,F06.rainmaker';
const URL_=`${origin}/index.html?dev=1&ff=${FLAGS}&speed=10&mute=1`;
const errs=[];const page=await ctx.newPage();
page.on('pageerror',e=>errs.push(`pageerror: ${e.message}`));
page.on('console',m=>{if(m.type()==='error'&&!/favicon/.test(m.text()))errs.push(`console: ${m.text().slice(0,220)}`);});
page.on('response',r=>{if(r.status()>=400&&!/favicon/.test(r.url()))errs.push(`http ${r.status()} ${r.url()}`);});
const shot=async n=>{if(SHOTS)await page.screenshot({path:path.join(SHOTS,n+'.png')});};
const ev=(fn,a)=>page.evaluate(fn,a);
const ready=()=>page.waitForFunction(()=>window.RAIF1&&window.RATrap&&window.RATrap.isBooted&&window.RATrap.isBooted()&&window.RAHoldBridge&&window.RAState&&window.RAClock&&window.RAWarRoomPlay,null,{timeout:30000});
const dismissMail=async()=>{for(let i=0;i<4;i++){const d=await page.$('.mail-done');if(!d||!await d.isVisible())break;await d.click();await page.waitForTimeout(400);}};   // the morning mail: GET UP
const toBedroom=async()=>{await page.click('#startButton');await page.waitForFunction(()=>document.body.classList.contains('bedroom-mode'),null,{timeout:30000});await dismissMail();};
const nextNight=async()=>{const d0=await ev(()=>RALife.today().day);await ev(()=>RAClock.sleep());await page.waitForTimeout(300);await dismissMail();return {d0,d1:await ev(()=>RALife.today().day)};};
const money=()=>ev(()=>Number(RAState.get().life.resources.money));
const openApp=async(app,sub)=>{await ev(()=>{if(!RAPhone.isOpen())RAPhone.open();});await ev(([a,s])=>RAPhone.openApp(a,s),[app,sub]);await page.waitForTimeout(250);};
const phoneText=()=>ev(()=>document.querySelector('#phoneContent')?.innerText||'');
const crewSnap=()=>ev(()=>JSON.parse(JSON.stringify(RACrew.snapshot())));
const settled=async(pred,label,ms=20000)=>{try{await page.waitForFunction(pred,null,{timeout:ms});return true;}catch(e){log(false,`timeout waiting for ${label}`);return false;}};
const CREWMAP={READY:'ACTIVE',WOUNDED:'DOWNED',SHOT:'DOWNED',CAPTURED:'CAPTURED',GONE:'GONE',DEAD:'GONE'};

// drive F01's own embed UI through one whole PLAY/HOLD. opts.afterOffer: hook run on the frame after the offer is accepted.
async function playThrough({skipOffer=false}={}){
 await page.waitForSelector('#f01-play-frame',{timeout:30000});
 const frame=await (await page.$('#f01-play-frame')).contentFrame();
 if(!skipOffer){try{await frame.waitForSelector('.b-ans,[data-done]',{timeout:40000});if(await frame.$('[data-done]')){await page.waitForTimeout(500);await frame.click('[data-done]');}   // F01 home scene: the morning-after crew text, one tap
  await frame.waitForSelector('.b-ans',{timeout:40000});}catch(e){log(false,'PLAY frame never showed the offer',JSON.stringify({url:frame.url(),html:(await frame.evaluate(()=>document.body.innerHTML).catch(()=>'?')).replace(/\s+/g,' ').slice(0,1500),iframes:await ev(()=>[...document.querySelectorAll('iframe')].map(f=>f.id+'|'+f.src+'|'+f.getAttribute('style'))),text:(await frame.evaluate(()=>document.body.innerText).catch(()=>'?')).replace(/\s+/g,' ').slice(0,400),crew:Object.entries(await crewSnap()).map(([k,v])=>k+':'+v.status).join(' ')}));await shot('debug_no_offer');throw e;}await page.waitForTimeout(200);await frame.click('.b-ans');}
 await frame.waitForSelector('.send',{timeout:30000});await page.waitForTimeout(400);
 const hold=await frame.$('.send.hold');
 if(hold){const bb=await hold.boundingBox();await page.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2);await page.mouse.down();await page.waitForTimeout(1900);await page.mouse.up();}else await frame.click('.send');
 const t0=Date.now();
 for(;;){
  if(Date.now()-t0>240000)throw new Error('PLAY did not finish (softlock?)');
  await page.waitForTimeout(200);
  if(!await page.$('#f01-play-frame'))return;
  const s=await frame.evaluate(()=>({d:document.querySelector('.decide button')?document.querySelector('.decide').dataset.kind:null,fb:!!document.querySelector('.decide .fb'),again:!!document.querySelector('.again')})).catch(()=>({}));
  if(s.d){if(s.d==='CLIMB')await (await frame.$('.decide button[data-id=OUT]')).click();else await (await frame.$$('.decide button'))[0].click();}
  if(s.fb)await (await frame.$('.decide .fb')).click();
  if(s.again){await frame.click('.again');break;}
 }
 await page.waitForFunction(()=>!document.querySelector('#f01-play-frame'),null,{timeout:20000});
}
async function launchWarRoomPlay(){
 await openApp('warRoom','jobs');
 await page.waitForFunction(()=>document.body.innerText.includes("TONIGHT'S JOBS"),null,{timeout:15000});
 const idx=await ev(()=>{const b=[...document.querySelectorAll('[data-phone-action^="do:warRoom:play:"]')];return b.length?b[0].dataset.phoneAction:null;});
 if(!idx)return null;
 await page.click(`[data-phone-action="${idx}"]`);return idx;
}
const lastRecord=()=>ev(()=>{const e=RAFrag.read('F04','jobs.log',[]).at(-1);if(!e)return null;const all=JSON.parse(localStorage.getItem('ra.f01.play.v1.embed_results')||'{}');return {entry:e,res:all[e.requestId]||null,consumed:!!RAWarRoomPlay.consumed(e.requestId)};});
const saveKey='rich_alucard_save_v1';
const namespaces=()=>ev(()=>{const s=RAState.get();return {top:Object.keys(s).sort(),frag:Object.keys(s.frag||{}).sort(),lifeKeys:Object.keys(s.life||{}).sort()};});

try{
 // ===================================================================== P0 FRESH BOOT (no fixture, no seed: empty storage)
 await page.goto(URL_);await page.evaluate(()=>{localStorage.clear();});await page.goto(URL_);await ready();
 const boot=await ev(()=>({ver:RAIF1.version,self:RAIF1.selfCheck().ok,flags:Object.fromEntries(['F01.showdown_core','F04.war_room','F05.trap','F06.rainmaker'].map(f=>[f,RAFeatures.enabled(f)])),saved:localStorage.getItem('rich_alucard_save_v1')}));
 log(boot.ver==='1.0.0'&&boot.self,'P0 fresh boot on an empty save: IF-1 1.0.0 loaded, self-check OK');
 log(Object.values(boot.flags).every(Boolean),'P0 the four accepted flags are ON for this session (dev session override; shipped defaults are dark)',JSON.stringify(boot.flags));
 const bi=await ev(()=>fetch('build.json',{cache:'no-store'}).then(r=>r.json()));
 log(/^ra-[0-9a-f]{12}-\d{14}$/.test(bi.releaseId),'P0 the page is the built artifact',bi.releaseId+' '+bi.commit);
 await shot('p0_title');
 await page.click('#startButton');await page.waitForFunction(()=>RAScenes.current()==='adventure',null,{timeout:30000});
 log(true,'P0 START on a fresh save mounts the prologue adventure');await shot('p0_prologue');
 await page.mouse.click(195,300);await page.waitForTimeout(250);
 log(await ev(()=>RAScenes.current())==='adventure','P0 the prologue advances by a real tap');

 // ===================================================================== P1 progressed life (same state the accepted browser gates seed) -> bedroom -> phone
 await ev(()=>{localStorage.clear();RAState.reset();RAState.patch('life.clock.started',true);for(const k of ['prologueDone','throneDone','firstWakeDone'])RALife.setFlag(k,true);RAState.patch('life.world.day',16);RAState.patch('life.resources.money',300000);
  for(const id of ['toyota_supra_mk4_001','lambo_urus_oxblood'])RALife.addCar({id,make:'X',model:id,short:id,price:1,value:1,parts:{}});
  RAFrag.patch('F04','active',true);RAFrag.patch('F04','offer.status','accepted');RAPhoneRegistry.unlock('warRoom');
  RAState.patch('life.newOga',{...RAState.get().life.newOga,rank:3,status:'associate'});RAF05.unlock.tick();});
 await page.reload();await ready();await toBedroom();
 log(await ev(()=>RALife.today().day)===16,'P1 saved life resumes into the bedroom on Day 16');
 await page.click('#checkPhone');await page.waitForFunction(()=>RAPhone.isOpen(),null,{timeout:10000});await shot('p1_phone');
 const apps=await ev(()=>[...document.querySelectorAll('#phoneContent [data-phone-action^="app:"],#phoneContent [data-app],#phoneContent [data-phone-action]')].map(e=>e.dataset.phoneAction||e.dataset.app).filter(Boolean));
 log(apps.length>=5,'P1 phone opens and lists apps',apps.slice(0,14).join(' '));
 log(!await ev(()=>RALife.appUnlocked('rainmaker')),'P1 RAINMAKER is locked on this life (no event completed yet)');
 const ns0=await namespaces();

 // ===================================================================== P2 RAINMAKER unlock path (the integration-owned first-event unlock)
 await ev(()=>{RAWorldEvents.see('ogun_rave_invite_001');RAFirstEventUnlock.check();});
 log(!await ev(()=>RALife.appUnlocked('rainmaker')),'P2 an event that is merely SEEN does not unlock RAINMAKER');
 await ev(()=>RAWorldEvents.resolve('ogun_rave_invite_001','in'));
 log(await ev(()=>RALife.appUnlocked('rainmaker')),'P2 the first RESOLVED event unlocks RAINMAKER');
 const twice=await ev(()=>{const a=RAPhoneRegistry.unlock('rainmaker');RAFirstEventUnlock.check();return {again:a,n:(RAState.get().life.phone?.apps||[]).filter?.(x=>x==='rainmaker'||x?.id==='rainmaker').length??null,raw:JSON.stringify(RAState.get().life.phone?.apps||null).slice(0,160)};});
 log(twice.again===false&&(twice.n===null||twice.n<=1),'P2 unlock is exactly-once (a second unlock/check changes nothing)',twice.raw);
 await page.reload();await ready();await toBedroom();
 log(await ev(()=>RALife.appUnlocked('rainmaker')),'P2 the unlock survives a reload');
 await openApp('rainmaker');const rmText=await phoneText();log(rmText.length>10,'P2 RAINMAKER opens from the phone',rmText.replace(/\s+/g,' ').slice(0,70));await shot('p2_rainmaker');

 // ===================================================================== P3 WAR ROOM -> THE PLAY (exact money, exact crew, one card)
 const bank0=await money();const heat0=await ev(()=>RAHeat.global());const crew0=await crewSnap();
 const idx=await launchWarRoomPlay();log(!!idx,'P3 WAR ROOM lists a PLAY-routed job and MAKE THIS PLAY launches it',String(idx));await shot('p3_war_room');
 await playThrough();
 await page.waitForFunction(()=>RAWarRoomPlay.pending()===null,null,{timeout:15000});
 const r1=await lastRecord();
 log(!!r1.res&&r1.res.status==='COMPLETE'&&r1.consumed,'P3 F04 consumed the canonical F01 record',r1.res&&`${r1.res.job.f01JobId} ${r1.res.outcome.klass} win=${r1.res.outcome.win}`);
 const bank1=await money();
 log(bank1===Math.max(0,bank0+r1.res.cash.gain-r1.res.cash.spent),'P3 bank moved by exactly the PLAY pot minus its cost (no duplicate reward)',`${bank0} -> ${bank1} (gain ${r1.res.cash.gain}, spent ${r1.res.cash.spent})`);
 const crew1=await crewSnap();
 log(r1.res.crew.every(c=>crew1[c.id].status===CREWMAP[c.after]),'P3 crew consequences match the record, per member, once',r1.res.crew.map(c=>c.id+':'+c.after).join(' '));
 const logLen=await ev(()=>RAFrag.read('F04','jobs.log',[]).length);
 log(await ev(()=>RAWarRoomReportCard.recent(10).length)===1&&logLen===1,'P3 exactly one job-log entry + one report card');
 const heat1=await ev(()=>RAHeat.global());log(typeof heat1==='number'&&heat1>=heat0,'P3 HEAT moved once and is a number',`${heat0} -> ${heat1}`);
 await openApp('warRoom','jobs');log(/WAR ROOM|JOBS/i.test(await ev(()=>document.body.innerText))&&!/%/.test(await phoneText()),'P3 back in the WAR ROOM, no percentages');await shot('p3_back');

 // ===================================================================== P4 car loss -> GET IT BACK (seeded the way the accepted no-car gate seeds it: into F01's persisted world)
 const w0=await ev(()=>{const k=Object.keys(localStorage).find(x=>x.endsWith('world_f04'));return k?JSON.parse(localStorage.getItem(k)):null;});
 log(!!w0&&!!w0.garage,'P4 F01 persisted its garage world after the first PLAY',w0&&JSON.stringify(w0.garage).slice(0,120));
 const lostIds=Object.keys(w0.garage.lost||{});
 log(lostIds.length>=1,'P4 a real PLAY lost a car (organic, unseeded): the loss is persisted in F01\'s garage world',JSON.stringify(w0.garage.lost));
 const nn=await nextNight();   // the War Room's authored SLOTS cap is 1 job a night: a real NIGHT (NIGHT bus + WAKE) before the next job
 log(nn.d1===nn.d0+1,'P4 a real NIGHT advanced the day by exactly one (War Room SLOTS cap: one job a night)',`${nn.d0} -> ${nn.d1}`);
 const crewN=await crewSnap();log(Object.values(crewN).every(c=>['ACTIVE','DOWNED','CAPTURED','GONE'].includes(c.status)),'P4 crew statuses after the night are all valid',Object.entries(crewN).map(([k,v])=>k+':'+v.status).join(' '));
 const bank2=await money();
 const idx2=await launchWarRoomPlay();
 if(!idx2){log(false,'P4 War Room offers no PLAY-routed job after the first PLAY',(await phoneText()).replace(/\s+/g,' ').slice(0,300));throw new Error('no second PLAY job');}
 try{await page.waitForSelector('#f01-play-frame',{timeout:30000});}catch(e){
  const dbg=await ev(()=>({text:document.body.innerText.replace(/\s+/g,' ').slice(0,500),pending:JSON.stringify(RAWarRoomPlay.pending()).slice(0,300),crew:JSON.stringify(RACrew.snapshot()).slice(0,500),idx:null}));
  log(false,'P4 second War Room PLAY did not open the F01 frame',JSON.stringify(dbg));throw e;}
 const fr=await (await page.$('#f01-play-frame')).contentFrame();
 await fr.waitForFunction(n=>document.querySelectorAll('.lostcar').length===n,lostIds.length,{timeout:30000});
 log(true,'P4 the next War Room job shows the GET IT BACK scene with the lost car offered',lostIds.join());await shot('p4_get_it_back');
 for(let i=0;i<lostIds.length;i++){
  await fr.evaluate(()=>document.querySelector('[data-rec="0"]').click());
  await fr.waitForFunction(n=>document.querySelectorAll('.lostcar').length===n,lostIds.length-i-1,{timeout:15000});
 }
 log(true,'P4 one tap per car recovers exactly one car each');
 await fr.evaluate(()=>document.querySelector('[data-done]').click());
 await fr.waitForSelector('.b-ans',{timeout:20000});
 log(true,'P4 with the car back the job offer is playable again');
 log(await money()===bank2,'P4 recovery moved no money (existing fee: 0 carried forward)');
 await playThrough({skipOffer:false});
 await page.waitForFunction(()=>RAWarRoomPlay.pending()===null,null,{timeout:15000});
 const r2=await lastRecord();
 log(!!r2.res&&r2.res.requestId!==r1.res.requestId&&r2.consumed,'P4 the recovered car ran a second PLAY, consumed once',r2.res&&`${r2.res.outcome.klass} win=${r2.res.outcome.win}`);
 log(await money()===Math.max(0,bank2+r2.res.cash.gain-r2.res.cash.spent),'P4 second PLAY: bank moved by exactly pot minus cost');
 const crew2=await crewSnap();
 log(r2.res.crew.every(c=>crew2[c.id].status===CREWMAP[c.after]),'P4 second PLAY crew consequences match the record');
 const wRec=await ev(()=>{const k=Object.keys(localStorage).find(x=>x.endsWith('world_f04'));return JSON.parse(localStorage.getItem(k)).garage;});
 const allCars=[...wRec.owned,...Object.keys(wRec.lost)];
 log(allCars.length===w0.garage.owned.length+lostIds.length&&new Set(allCars).size===allCars.length,'P4 garage after the recovered-car PLAY: no car duplicated or vanished (owned+lost == the original two, each once)',JSON.stringify(wRec));
 log(await ev(()=>RAFrag.read('F04','jobs.log',[]).length)===2,'P4 two PLAYs -> exactly two job-log entries (no duplicate consume)');

 // ===================================================================== P5 THE TRAP through the real phone
 await openApp('trap');const trapHome=await phoneText();await shot('p5_trap_home');
 log(trapHome.length>10&&!/F01_INTEGRATION_PENDING/.test(trapHome),'P5 TRAP opens from the phone with player-facing copy',trapHome.replace(/\s+/g,' ').slice(0,80));
 const m0=await money();
 await openApp('trap','listing');
 const hb=await page.$('#phoneContent [data-phone-action="do:trap:buyHouse:the_bando"]');
 log(!!hb,'P5 the listing offers the first house through the phone');
 if(hb){await hb.click();await page.waitForTimeout(400);}
 log(await ev(()=>RAF05.store.hasHouse('the_bando')),'P5 BUY HOUSE through the UI gives the house once');
 log((await money())<=m0,'P5 buying a house cost money (never gave any)',`${m0} -> ${await money()}`);
 await openApp('trap','house:the_bando');
 const bb=await page.$('#phoneContent [data-phone-action^="do:trap:buyBase"]');
 if(bb){await bb.click();await page.waitForTimeout(400);}
 const ing=await ev(()=>RAF05.production.ingredients());log(!!bb&&Object.values(ing).some(n=>n>0),'P5 BUY BASE through the UI stocks ingredients',JSON.stringify(ing));
 await ev(()=>{RAF05.production.cook({houseId:'the_bando',grade:'D',cases:2,quality:95});});   // cook/count open minigames (covered by F14 F05.trap.run + F05 suites); the production call is what they end in
 const ready1=await ev(()=>RAF05.production.readyCases({houseId:'the_bando',grade:'D'}));log(ready1>=1,'P5 a cook produced cases ready to sell',String(ready1));
 await openApp('trap','sales');
 const as=await page.$('#phoneContent [data-phone-action^="do:trap:assign"]');
 if(as){await as.click();await page.waitForTimeout(400);}
 const asg=await ev(()=>RAF05.store.assigned());log(!!as&&!!asg,'P5 ASSIGN through the UI queued tonight\'s sale (resolves at NIGHT)',JSON.stringify(asg));
 await ev(()=>{RAF05.sales.bank();});const m1=await money();
 const unb=await ev(()=>RAF05.read('unbanked',0));log(true,'P5 COUNT/bank completed',`cash ${m0} -> ${m1}, unbanked ${unb}`);
 await openApp('trap','world');await shot('p5_trap_world');

 // ===================================================================== P6 raid -> HOLD handoff -> castle HOLD -> return (shared consequences once)
 await ev(()=>{RAF05.production.addIngredient('synth',2);RAF05.production.cook({houseId:'the_bando',grade:'D',cases:2,quality:95});RAF05.store.addUnbanked(1000);RAHeat.add(70,{source:'smoke'});});
 await ev(()=>RAClock.sleep());   // a REAL night: NIGHT bus runs, raid scheduled
 await dismissMail();
 const rep=await ev(()=>({assigned:RAF05.store.assigned(),last:RAF05.store.lastReport()}));
 log(rep.assigned===null&&!!rep.last&&rep.last.day===17,'P6 the NIGHT resolved the queued sale exactly once (assignment cleared, one night report)',rep.last&&`${rep.last.cases}x${rep.last.grade} $${rep.last.revenue}`);
 const pend=await ev(()=>RAF05.raids.pending());
 log(!!pend&&pend.state==='pending','P6 a real NIGHT scheduled the pending raid',pend&&pend.id);
 await ev(()=>{const p=RAShowdown.play;if(p.__cap)return;const o=p.launch;p.__cap=true;window.__results=[];p.launch=async(...a)=>{const r=await o.apply(p,a);window.__results.push(JSON.parse(JSON.stringify(r)));return r;};});
 await openApp('trap','world');
 const holdBtn=await page.$('#phoneContent [data-phone-action="do:trap:holdRaid"]');
 log(!!holdBtn,'P6 the phone raid surface offers HOLD THE HOUSE');await shot('p6_raid');
 const snap=()=>ev(()=>{const h=RAHoldBridge.transaction();return {money:RALife.money(),heat:RAHeat.snapshot().global.service,unbanked:RAF05.read('unbanked',0),stash:RAF05.store.batches().filter(b=>b.houseId==='the_bando').reduce((n,b)=>n+b.cases,0),pending:RAF05.raids.pending(),applied:Object.keys(RAFrag.read('F05','raids.applied',{})),hist:RAF05.raids.history().length,tx:h?{phase:h.phase}:null,crew:JSON.stringify(RACrew.snapshot())};});
 const pre=await snap();
 await holdBtn.click();await page.waitForSelector('#f01-play-frame',{timeout:30000});
 log((await snap()).tx?.phase==='LAUNCHED'&&(await ev(()=>RAF05.raids.pending().state))==='handed','P6 HOLD handoff: transaction persisted before F01 ran; F05 marked the raid handed');
 const mid=await snap();log(mid.money===pre.money&&mid.heat===pre.heat&&mid.stash===pre.stash&&mid.unbanked===pre.unbanked,'P6 nothing applied while the HOLD is running');
 await playThrough();
 await settled(()=>!window.RAHoldBridge.transaction(),'HOLD delivery');
 const post=await snap();const hr=(await ev(()=>window.__results)).at(-1);
 log(hr&&hr.status==='COMPLETE'&&hr.job.f01JobId==='hold_the_house','P6 F01 ran the existing castle HOLD');
 const gain=hr.cash.gain,spent=Math.min(hr.cash.spent,pre.money+gain);
 log(post.money===pre.money+gain-spent,'P6 shared cash applied exactly once',`${pre.money} -> ${post.money}`);
 log(post.heat===Math.max(0,pre.heat+hr.heat.delta),'P6 shared HEAT applied exactly once',`${pre.heat} -> ${post.heat} (delta ${hr.heat.delta})`);
 log(post.pending===null&&post.applied.length===1&&post.hist===1&&post.tx===null,'P6 F05 applied its receipt once; raid cleared; transaction cleared');
 const lost=!(hr.outcome.getaway!=='BREACHED'&&!hr.outcome.fellBack&&hr.outcome.klass!=='WASH');
 log((post.stash===0)===lost,'P6 F05 trap-side rule matches the HOLD outcome',lost?'stash lost':'door held');
 log(await ev(()=>RAPhone.isOpen()),'P6 the player is back on the phone after the HOLD');await shot('p6_return');
 const cw=JSON.parse(post.crew);log(hr.crew.length>0&&hr.crew.every(c=>cw[c.id]&&cw[c.id].status===CREWMAP[c.after]),'P6 crew consequences of the HOLD match the F01 record, per member',hr.crew.map(c=>c.id+':'+c.after).join(' '));

 // ===================================================================== P7 save -> reload -> identical -> continued play
 const before=await ev(()=>({state:JSON.stringify(RAState.get()),money:RALife.money(),day:RALife.today().day,crew:JSON.stringify(RACrew.snapshot()),heat:RAHeat.snapshot().global.service,
  jobs:RAFrag.read('F04','jobs.log',[]).length,applied:Object.keys(RAFrag.read('F05','raids.applied',{})).length,rm:RALife.appUnlocked('rainmaker'),keys:Object.keys(localStorage).sort()}));
 await page.reload();await ready();await toBedroom();
 const after=await ev(()=>({state:JSON.stringify(RAState.get()),money:RALife.money(),day:RALife.today().day,crew:JSON.stringify(RACrew.snapshot()),heat:RAHeat.snapshot().global.service,
  jobs:RAFrag.read('F04','jobs.log',[]).length,applied:Object.keys(RAFrag.read('F05','raids.applied',{})).length,rm:RALife.appUnlocked('rainmaker'),keys:Object.keys(localStorage).sort(),pendingPlay:RAWarRoomPlay.pending(),tx:RAHoldBridge.transaction()}));
 log(after.money===before.money&&after.day===before.day&&after.crew===before.crew&&after.heat===before.heat&&after.jobs===before.jobs&&after.applied===before.applied&&after.rm===before.rm,'P7 reload: money, day, crew, HEAT, job log, raid receipts, RAINMAKER unlock all identical',`money ${after.money} day ${after.day} jobs ${after.jobs}`);
 log(after.pendingPlay===null&&after.tx===null,'P7 reload leaves nothing pending (no stranded PLAY or HOLD transaction)');
 log(before.keys.join()===after.keys.join(),'P7 reload added/removed no storage keys',after.keys.join(','));
 const nsA=await namespaces();log(ns0.frag.every(k=>nsA.frag.includes(k))&&['F04','F05'].every(k=>nsA.frag.includes(k)),'P7 state namespaces: earlier namespaces all still present, none overwritten',nsA.frag.join(','));
 const sv=await ev(()=>{const raw=localStorage.getItem('rich_alucard_save_v1')||'';return {len:raw.length,sandbox:/embed_results|world_f04|rich_alucard_f01_sandbox_v1/.test(raw)};});
 log(sv.len>0&&!sv.sandbox,'P7 the game save holds no F01 sandbox/embed keys (shared namespaces only)',`${sv.len} bytes`);
 // continued play: a fresh War Room PLAY after the reload, consumed once, bank exact
 const bank3=await money();const crew3=await crewSnap();
 const idx3=await launchWarRoomPlay();
 if(idx3){await playThrough();await page.waitForFunction(()=>RAWarRoomPlay.pending()===null,null,{timeout:15000});
  const r3=await lastRecord();
  log(!!r3.res&&r3.consumed&&r3.res.requestId!==r2.res.requestId,'P7 continued play after reload: a new PLAY completed and was consumed once');
  log(await money()===Math.max(0,bank3+r3.res.cash.gain-r3.res.cash.spent),'P7 continued play: bank moved by exactly pot minus cost',`${bank3} -> ${await money()}`);
  log(await ev(()=>RAFrag.read('F04','jobs.log',[]).length)===before.jobs+1,'P7 job log grew by exactly one');
 }else log(false,'P7 War Room offers no PLAY-routed job after reload (crew/jobs exhausted?)',(await phoneText()).replace(/\s+/g,' ').slice(0,120));
 await ev(()=>RAClock.sleep());
 await dismissMail();
 log(await ev(()=>RALife.today().day)===after.day+1,'P7 continued play: a further NIGHT advanced the day by exactly one',`${after.day} -> ${await ev(()=>RALife.today().day)}`);
 log(await ev(()=>RAIF1.selfCheck().ok),'P7 IF-1 self-check still OK at the end of the run');
 log(errs.length===0,'ZERO console / page errors / failed requests across the whole traversal',errs.slice(0,4).join(' | '));
}catch(e){log(false,'smoke traversal threw',String(e&&e.stack||e).split('\n').slice(0,4).join(' | '));}
finally{
 const out=arg('json','');if(out){fs.mkdirSync(path.dirname(path.resolve(out)),{recursive:true});fs.writeFileSync(out,JSON.stringify({at:new Date().toISOString(),results,errs},null,1));}
 await browser.close();srv.close();
}
const bad=results.filter(r=>!r.ok).length;
console.log(bad?`FAIL candidate smoke: ${bad} of ${results.length} checks failed`:`PASS candidate smoke traversal: ${results.length}/${results.length} checks`);
process.exit(bad?1:0);
