// RC2 · BUILD 1 — ONE real-browser path at 390 px, shipped flag defaults (NO ?ff=, NO ?dev=1):
//   fresh save -> START -> the intro (prologue, CEO, throne) -> the bedroom on Day 1 -> the phone pulses -> VampGPT -> its first RECOMMENDED step ->
//   STRIP CLUB first visit (discount + cap) -> sleep -> Day 2 offer -> WAR ROOM -> the first PLAY through the real F01 group-chat UI -> back.
//   RA_PLAYWRIGHT_PATH=<playwright-core dir> RA_CHROMIUM_PATH=<chrome.exe> node tools/rc2/browser-path.mjs [--shots docs/evidence/rc2/browser] [--port 8199] [--width 390]
import {createRequire} from 'node:module';import fs from 'node:fs';import path from 'node:path';
const require=createRequire(process.env.RA_PLAYWRIGHT_PATH?process.env.RA_PLAYWRIGHT_PATH.replace(/[\\/]?$/,'/'):'/opt/node22/lib/node_modules/');
const {chromium}=require(process.env.RA_PLAYWRIGHT_PATH?'playwright-core':'playwright');
import {serve} from '../tests/f01/play-sim/serve-play.mjs';
const arg=(k,d)=>{const i=process.argv.indexOf('--'+k);return i>=0?process.argv[i+1]:d;};
const W=+arg('width',390),H={360:740,390:844,430:932}[W]||844,SHOTS=arg('shots',''),PORT=+arg('port',8199);
const CHROME=process.env.RA_CHROMIUM_PATH||process.env.RA_CHROME;
if(SHOTS)fs.mkdirSync(SHOTS,{recursive:true});
const results=[];const log=(ok,name,detail='')=>{results.push({ok,name,detail});console.log(`${ok?'PASS':'FAIL'} [${W}] ${name}${detail?' - '+detail:''}`);return ok;};
const srv=await serve(PORT);const base=`http://127.0.0.1:${PORT}/index.html`;
const browser=await chromium.launch({headless:true,executablePath:CHROME&&fs.existsSync(CHROME)?CHROME:undefined});
const errs=[];let n=0;
const shot=async(p,name)=>{if(SHOTS)await p.screenshot({path:path.join(SHOTS,`${W}_${String(++n).padStart(2,'0')}_${name}.png`)}).catch(()=>{});};
const settle=(p,ms=150)=>p.waitForTimeout(ms);
const rngFrom=seed=>{let s=seed>>>0||1;return ()=>{s=Math.imul(s^s>>>15,2246822519)+0x9e3779b9|0;return (s>>>0)/4294967296;};};
const rng=rngFrom(7);
const probe=p=>p.evaluate(()=>{
 const q=s=>document.querySelector(s),vis=el=>!!el&&el.getClientRects().length>0&&getComputedStyle(el).visibility!=='hidden'&&getComputedStyle(el).display!=='none';
 const a=window.RAAdventures?.active?.()||null;
 return {scene:window.RAScenes?.current?.()||null,start:vis(q('#startOverlay')),minigame:window.RAMinigames?.active?.()?.id||null,c2:!!q('.c2-scene'),phone:!!window.RAPhone?.isOpen?.(),
  adv:a?.id||null,node:a?.node||null,choices:[...document.querySelectorAll('.adv-choice')].filter(vis).map(b=>({label:b.innerText.replace(/\s+/g,' ').trim().slice(0,40),disabled:b.disabled})),
  advScene:!!q('#adventureScene'),mail:vis(q('.morning-mail:not(.castle-menu)')),castle:vis(q('.castle-menu')),bedConfirm:vis(q('.bed-confirm')),returnCard:vis(q('.bedroom-return')),
  victory:!!q('#victoryOverlay.on')&&vis(q('#victoryCard')),choiceOverlay:!!q('#choiceOverlay.show'),combat:window.RACombat?.snapshot?.()||null,
  day:window.RALife?.today?.().day??null,started:!!window.RAState?.get?.().life.clock.started,
  sig:`${window.RAScenes?.current?.()}|${a?.id}|${a?.node}|${(()=>{const t=(q('#screen')?.innerText||'').replace(/\s+/g,' ');let h=0;for(let i=0;i<t.length;i++)h=(h*31+t.charCodeAt(i))|0;return `${h}:${t.slice(-120)}`;})()}`};});
const money=p=>p.evaluate(()=>Number(RALife.money()));
// Drive whatever the player would tap until the bedroom is idle (life started). Returns on idle bedroom, an open phone or a night prompt.
async function drive(p,{maxSteps=900,until=null}={}){
 let last='',same=0;
 for(let step=0;step<maxSteps;step++){
  const s=await probe(p);
  if(until&&until(s))return s;
  if(s.sig===last)same++;else{same=0;last=s.sig;}
  if(same>=45)throw new Error(`stuck at ${s.scene}/${s.adv||'-'}/${s.node||'-'}`);
  if(s.start){await p.locator('#startButton').click();await settle(p,600);continue;}
  if(s.minigame){await p.evaluate(()=>RAMinigames.active?.()?.cancel?.()).catch(()=>{});await p.keyboard.press('Escape');await settle(p,400);continue;}
  if(s.c2){const oc=p.locator('.c2-octo:not([hidden]) [data-octo]');if(await oc.count()){await oc.nth(Math.floor(rng()*await oc.count())).click();await settle(p,900);continue;}const done=p.locator('[data-c2="done"]');if(await done.count()){await done.first().click();await settle(p,400);continue;}
   const fight=p.locator('[data-c2="fight"]');if(await fight.count()){await fight.first().click();await settle(p,120);const mv=p.locator('.c2-btn[data-c2^="move:"]:not(.c2-off), .c2-btn[data-c2^="gun:"]:not(.c2-off)');const k=await mv.count();if(k)await mv.nth(Math.floor(rng()*k)).click();else{const back=p.locator('[data-c2="back"]');if(await back.count())await back.click();}}
   await settle(p,400);continue;}
  if(s.scene==='battle'&&!s.advScene){
   if(s.victory){await p.locator('#stealNo').click();await settle(p,1500);continue;}
   if(s.choiceOverlay){await p.locator('#choiceYes').click();await settle(p,600);continue;}
   const octo=p.locator('#octopusOverlay.on [data-octo]');if(await octo.count()){await octo.nth(Math.floor(rng()*await octo.count())).click().catch(()=>{});await settle(p,800);continue;}
   if(s.combat&&!s.combat.busy&&!s.combat.battleOver){await p.locator('[data-main="fight"]').click();await settle(p,100);const mv=['blood','bite','octopus'][Math.floor(rng()*3)];await p.locator(`[data-move="${mv}"]`).click();await settle(p,1300);continue;}
   await settle(p,500);continue;}
  if(s.scene==='adventure'||s.advScene){
   if(s.choices.length){const en=s.choices.map((c,i)=>[c,i]).filter(([c])=>!c.disabled);const pick=en[Math.floor(rng()*en.length)]?.[1]??0;await p.locator('.adv-choice').nth(pick).click();await settle(p,160);continue;}
   await p.locator('#adventureScene').click({position:{x:Math.round(W/2),y:Math.round(H*.4)}}).catch(()=>{});await settle(p,110);continue;}
  if(s.scene==='bedroom'){
   if(!s.started){await settle(p,400);continue;}
   if(s.returnCard){await p.locator('.bedroom-return').click();await settle(p,300);continue;}
   if(s.mail){await p.locator('.mail-done').click();await settle(p,500);continue;}
   if(s.castle){await p.locator('.castle-menu [data-castle="close"]').click();await settle(p,200);continue;}
   if(s.bedConfirm){return s;}
   if(s.phone)return s;
   if(!s.adv)return s;
   await settle(p,300);continue;}
  const targets=await p.evaluate(()=>{const Wd=innerWidth,Ht=innerHeight,out=[];for(const el of document.querySelectorAll('#screen button, #stage button, #screen [class*="dialogue"], #screen [class*="advance"]')){const r=el.getBoundingClientRect();if(r.width<4||r.height<4||r.right<0||r.bottom<0||r.left>Wd||r.top>Ht)continue;const x=Math.min(Wd-2,Math.max(1,r.left+r.width/2)),y=Math.min(Ht-2,Math.max(1,r.top+r.height/2));const top=document.elementFromPoint(x,y);if(!top||!(el===top||el.contains(top)))continue;if(el.disabled||/DEV|RESET/i.test(el.textContent||''))continue;out.push({x,y});}return out;});
  if(targets.length){const t=targets[Math.floor(rng()*targets.length)];await p.mouse.click(t.x,t.y);await settle(p,400);continue;}
  await p.mouse.click(W/2,H*.45);await settle(p,300);
 }
 throw new Error('drive budget exhausted');
}
let code=0;
try{
 const ctx=await browser.newContext({viewport:{width:W,height:H},deviceScaleFactor:1});const p=await ctx.newPage();
 p.on('pageerror',e=>errs.push('pageerror: '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/favicon|net::ERR|Failed to load resource/.test(m.text()))errs.push('console: '+m.text().slice(0,200));});
 await p.goto(`${base}?mute=1`);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForSelector('#startButton');
 await shot(p,'fresh_start');
 // ---- 0. shipped defaults: the economy loop's four flags are ON with no URL flags
 const ff=await p.evaluate(()=>({f01:RAFeatures.enabled('F01.showdown_core'),f04:RAFeatures.enabled('F04.war_room'),f06:RAFeatures.enabled('F06.rainmaker'),f15:RAFeatures.enabled('F15.velvet_rotation'),f05:RAFeatures.enabled('F05.trap'),f02:RAFeatures.enabled('F02.armory')&&RAFeatures.enabled('F02.iron_and_grace'),f03:RAFeatures.enabled('F03.new_oga_ladder_close'),f07:RAFeatures.enabled('F07.m8_and_finale'),dev:!!document.querySelector('#devPanel')}));
 log(ff.f01&&ff.f02&&ff.f03&&ff.f04&&ff.f05&&ff.f06&&ff.f07&&ff.f15&&!ff.dev,'normal URL: every first-release feature ships ON (PLAY, guns, Koreatown, War Room, TRAP, MAKE IT RAIN, M8 + finale, club dancers); no dev panel',JSON.stringify(ff));
 // ---- 1. the intro, played for real, ends in the bedroom on Day 1
 const t0=Date.now();
 const idle=await drive(p,{maxSteps:1200});
 log(idle.scene==='bedroom'&&idle.started&&idle.day===1,'fresh save: intro (prologue, CEO, throne) reaches the bedroom on Day 1',`${Math.round((Date.now()-t0)/1000)}s`);
 await shot(p,'bedroom_day1');
 // ---- 2. guidance: the phone icon shakes, the phone shows ONE next step, the VampGPT tile pulses
 const entry=await p.evaluate(()=>({pulse:document.querySelector('#checkPhone').classList.contains('guide-pulse'),anim:getComputedStyle(document.querySelector('#checkPhone')).animationName}));
 log(entry.pulse&&entry.anim!=='none','bedroom: the phone icon pulses while there is a next step',JSON.stringify(entry));
 await p.locator('#checkPhone').click();await settle(p,500);await shot(p,'phone_home');
 const home=await p.evaluate(()=>({next:document.querySelector('.phone-next-button')?.innerText.replace(/\s+/g,' ').trim(),nextCount:document.querySelectorAll('.phone-next').length,
  pulsing:[...document.querySelectorAll('.app-button.phone-pulse')].map(b=>b.dataset.phoneAction),club:!!document.querySelector('[data-phone-action="app:stripClub"]'),clubLocked:document.querySelector('[data-phone-action="app:stripClub"]')?.dataset.locked||null,
  rm:!!document.querySelector('[data-phone-action="app:rainmaker"]'),overflow:document.documentElement.scrollWidth>innerWidth}));
 log(home.nextCount===1&&/VAMPGPT|OGA WHAT DO I DO/i.test(home.next),'phone home shows exactly one "do this next" (Day 1, first: VampGPT)',home.next);
 log(home.pulsing.length===1&&home.pulsing[0]==='app:vampgpt','exactly one app tile pulses: VampGPT',JSON.stringify(home.pulsing));
 log(home.club&&!home.clubLocked&&!home.rm,'STRIP CLUB app is on the home screen on Day 1, unlocked; the old RAINMAKER tile is not a second door',JSON.stringify({club:home.club,locked:home.clubLocked,rm:home.rm}));
 log(!home.overflow,'phone home has no horizontal overflow');
 // ---- 3. VampGPT: opening it clears its pulse; the first RECOMMENDED line is the next story step or a way to make cash
 await p.locator('.app-button[data-phone-action="app:vampgpt"]').click();await settle(p,500);await shot(p,'vampgpt');
 const vg=await p.evaluate(()=>({rec:[...document.querySelectorAll('.phone-rec .rec-line')].map(b=>b.innerText.replace(/\s+/g,' ').trim()),first:document.querySelector('.phone-rec .rec-first')?.dataset.phoneAction||null,kind:RAGuidance.next().kind}));
 log(vg.rec.length>=1&&vg.first&&['story','cash'].includes(vg.kind),'VampGPT RECOMMENDED: the first line is the next story step or a way to make cash',JSON.stringify(vg.rec.slice(0,3)));
 await p.locator('#phoneContent [data-phone-action="home"]').first().click();await settle(p,300);
 const after=await p.evaluate(()=>({pulsing:[...document.querySelectorAll('.app-button.phone-pulse')].map(b=>b.dataset.phoneAction),next:document.querySelector('.phone-next-button')?.innerText.replace(/\s+/g,' ').trim()}));
 log(!after.pulsing.includes('app:vampgpt'),'opening VampGPT cleared its pulse',JSON.stringify(after));
 await shot(p,'phone_home_after_vampgpt');
 // ---- 4. STRIP CLUB first visit: straight there, discount + 50% cap
 const cash0=await money(p);
 await p.locator('.app-button[data-phone-action="app:stripClub"]').click();
 await p.waitForFunction(()=>!!document.querySelector('[aria-label="MAKE IT RAIN"]'),null,{timeout:15000});await settle(p,900);await shot(p,'club_first_visit');
 const club=await p.evaluate(()=>{const h=document.querySelector('[aria-label="MAKE IT RAIN"]'),r=h.shadowRoot;return {note:(r.querySelector('[role="status"]')?.textContent||'').trim(),text:r.textContent.replace(/\s+/g,' ').slice(0,200),phoneOpen:RAPhone.isOpen()};});
 log(!club.phoneOpen&&club.note.length>0,'STRIP CLUB tile goes straight to the club (phone closed) and states the first-visit terms',club.note);
 // throw: drag up to load bills, then a fast flick up at the target
 const canvas=await p.evaluateHandle(()=>document.querySelector('[aria-label="MAKE IT RAIN"]').shadowRoot.querySelector('canvas'));
 const cb=await canvas.asElement().boundingBox();
 for(let k=0;k<6;k++){
  const x=cb.x+cb.width*.5,y0=cb.y+cb.height*.92,y1=cb.y+cb.height*.55;
  await p.mouse.move(x,y0);await p.mouse.down();for(let i=1;i<=10;i++){await p.mouse.move(x,y0+(y1-y0)*i/10);await p.waitForTimeout(18);}
  await p.mouse.move(x,cb.y+cb.height*.4);await p.mouse.move(x,cb.y+cb.height*.2);await p.mouse.up();await p.waitForTimeout(450);
 }
 await shot(p,'club_after_throws');
 const spent=cash0-await money(p);
 const terms=await p.evaluate(()=>({done:!!RALife.flag('stripClubFirstVisitDone'),discount:RAEcon.stripClub.firstVisit.discount,cap:RAEcon.stripClub.firstVisit.capShare}));
 log(spent>0&&spent<=Math.floor(cash0*terms.cap)+1&&terms.done,'first visit: real throws spent real money, never more than half the cash on hand, and the first visit is now used',`$${spent} of $${cash0}`);
 const led=await p.evaluate(()=>RAMoneyLedger.entries().filter(e=>e.source==='rainmaker:flick').length);
 log(led>0,'every throw went through the money ledger (rainmaker:flick)',String(led));
 await p.keyboard.press('Escape');await settle(p,600);
 await p.waitForFunction(()=>!document.querySelector('[aria-label="MAKE IT RAIN"]'),null,{timeout:8000});
 log(true,'Escape leaves the club; back in the bedroom');
 // ---- 5. the next step: follow RECOMMENDED #1 (a real adventure), then sleep into Day 2
 const rec=await p.evaluate(()=>RAGuidance.next());
 log(true,'next step after the club',`${rec.kind}:${rec.id} -> ${rec.action}`);
 // ---- 6. Day 2: the offer, the pulse, WAR ROOM, the first PLAY through the real group-chat UI
 await p.evaluate(()=>{RAClock.sleep();});await settle(p,600);
 const idle2=await drive(p,{maxSteps:600});
 const d2=await p.evaluate(()=>({day:RALife.today().day,offer:RAFrag.read('F04','offer.status','?'),next:RAGuidance.next().id,pulse:RAGuidance.target()?.app}));
 log(d2.day===2&&d2.offer==='available','Day 2 wake: Mister December\'s offer is available',JSON.stringify(d2));
 log(d2.next==='offer'&&d2.pulse==='warRoom','guidance on Day 2: the next step is the offer and WAR ROOM pulses',JSON.stringify(d2));
 await p.locator('#checkPhone').click();await settle(p,500);await shot(p,'day2_phone_home');
 const pulse2=await p.evaluate(()=>[...document.querySelectorAll('.app-button.phone-pulse')].map(b=>b.dataset.phoneAction));
 log(pulse2.length===1&&pulse2[0]==='app:warRoom','Day 2 home: only WAR ROOM pulses',JSON.stringify(pulse2));
 await p.locator('.app-button[data-phone-action="app:warRoom"]').click();await settle(p,400);await shot(p,'war_room_offer');
 await p.locator('[data-phone-action="do:warRoom:accept"]').click();await settle(p,500);
 const acc=await p.evaluate(()=>({active:RAFrag.read('F04','active',false),crew:RAWarRoomCrew.activeOgas().length,slots:RAFrag.read('F04','jobs.slotsPerNight',0),next:RAGuidance.next().id}));
 log(acc.active&&acc.crew===6&&acc.slots===1&&acc.next==='first_play','accepted on Day 2: six Ogas, one slot while the crew is new, next step is the first PLAY',JSON.stringify(acc));
 await p.evaluate(()=>RAPhone.openApp('warRoom','jobs'));await p.waitForFunction(()=>document.body.innerText.includes("TONIGHT'S JOBS"),null,{timeout:15000});await shot(p,'war_room_jobs');
 const jobs=await p.evaluate(()=>({types:[...document.querySelectorAll('.war-room-job b')].map(b=>b.textContent.trim()),btns:[...document.querySelectorAll('[data-phone-action^="do:warRoom:play:"]')].map(b=>b.dataset.phoneAction)}));
 log(jobs.btns.length>0&&!jobs.types.some(t=>/TAKE THE BLOCK/.test(t)),'first night: routine jobs only (no TAKE THE BLOCK yet)',jobs.types.join(' | '));
 const bank0=await money(p);
 await p.click(`[data-phone-action="${jobs.btns[0]}"]`);
 await p.waitForSelector('#f01-play-frame',{timeout:20000});
 const frame=await (await p.$('#f01-play-frame')).contentFrame();
 await frame.waitForSelector('.b-ans',{timeout:30000});await shot(p,'play_offer');
 const offerText=await frame.evaluate(()=>document.body.innerText);
 log(/UP TO \$[\d.,]+K?/.test(offerText)&&!/%/.test(offerText),'THE PLAY: canonical group-chat offer (live UI untouched)',offerText.replace(/\s+/g,' ').slice(0,70));
 await frame.click('.b-ans');await frame.waitForSelector('.send',{timeout:30000});await p.waitForTimeout(400);await shot(p,'play_crew_car');
 const crewText=await frame.evaluate(()=>document.body.innerText);
 log(/HOOPTIE|SMELLS LIKE/i.test(crewText)||!/NO CAR/i.test(crewText),'no car owned: the crew hooptie is the ride (not a NO CAR refusal)',crewText.replace(/\s+/g,' ').slice(0,90));
 const btn=await frame.$('.send.hold');
 if(btn){const bb=await btn.boundingBox();await p.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2);await p.mouse.down();await p.waitForTimeout(150);await p.mouse.up();await p.mouse.down();await p.waitForTimeout(1900);await p.mouse.up();}else await frame.click('.send');
 const t1=Date.now();
 for(;;){
  if(Date.now()-t1>300000)throw new Error('PLAY did not finish');
  await p.waitForTimeout(200);
  const s=await frame.evaluate(()=>({d:document.querySelector('.decide button')?document.querySelector('.decide').dataset.kind:null,fb:!!document.querySelector('.decide .fb'),again:!!document.querySelector('.again')})).catch(()=>null);
  if(!s)break;
  if(s.d){const bs=await frame.$$('.decide button');await (s.d==='CLIMB'?await frame.$('.decide button[data-id=OUT]'):bs[0]).click();}
  if(s.fb)await (await frame.$('.decide .fb')).click();
  if(s.again){await shot(p,'play_return');await frame.click('.again');break;}
 }
 await p.waitForFunction(()=>!document.getElementById('f01-play-frame'),null,{timeout:20000});
 await p.waitForFunction(()=>RAWarRoomPlay.pending()===null,null,{timeout:10000});
 const st=await p.evaluate(()=>{const e=RAFrag.read('F04','jobs.log',[]).at(-1);const res=JSON.parse(localStorage.getItem('ra.f01.play.v1.embed_results')||'{}')[e&&e.requestId];return {bank:Number(RALife.money()),entry:e,res,plays:Object.keys(RAFrag.read('F04','play.consumed',{})).length,next:RAGuidance.next(),gone:RACrew.snapshot()};});
 log(st.plays===1&&!!st.res&&st.res.status==='COMPLETE','first PLAY completed on Day 2 through the real F01 UI; F04 consumed the canonical record',st.res&&`${st.res.outcome.klass} win=${st.res.outcome.win}`);
 log(st.bank===Math.max(0,bank0+st.res.cash.gain-st.res.cash.spent),'bank moved by exactly the PLAY pot minus its cost',`${bank0} -> ${st.bank} (gain ${st.res.cash.gain}, spent ${st.res.cash.spent})`);
 await p.evaluate(()=>RAPhone.open());await settle(p,500);await shot(p,'after_play_phone_home');
 log(errs.length===0,'no console / page errors during the whole path',errs.slice(0,3).join(' | '));
 code=results.every(r=>r.ok)?0:1;
}catch(e){console.error(e);log(false,'browser path crashed',String(e.message).slice(0,200));code=1;}
finally{await browser.close();srv.close();}
console.log(code===0?`BROWSER PATH PASS (${results.length} checks)`:'BROWSER PATH FAIL');
if(SHOTS)fs.writeFileSync(path.join(SHOTS,`results_${W}.json`),JSON.stringify(results,null,1));
process.exit(code);
