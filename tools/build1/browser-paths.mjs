#!/usr/bin/env node
// BUILD-1 STEP 4 real-browser paths (Chromium via Playwright) at the three supported phone widths, with screenshots.
//   RA_PLAYWRIGHT_PATH=<playwright-core dir> RA_CHROME=<chrome.exe> node tools/build1/browser-paths.mjs --width 390 --shots docs/evidence/build1/390 [--only f03,flagsoff]
// Scenarios here (the F07 / F15 / new-game paths reuse the existing real-browser suites, see docs/progress/BUILD1.md):
//   f03       flags ON: M9 THE TRIBUTE -> M10 VICE PRESIDENT -> VampGPT on the NEXT WAKE, one mission per WAKE, M10 pays the authored $15,000/week
//   flagsoff  default URL (every fragment flag DARK): the new content is unreachable and writes nothing; START -> bedroom still works
import {createRequire} from 'node:module';import fs from 'node:fs';import path from 'node:path';
const require=createRequire(process.env.RA_PLAYWRIGHT_PATH?process.env.RA_PLAYWRIGHT_PATH.replace(/[\\/]?$/,'/'):'/opt/node22/lib/node_modules/');
const {chromium}=require(process.env.RA_PLAYWRIGHT_PATH?'playwright-core':'playwright');
import {serve} from '../tests/f01/play-sim/serve-play.mjs';
const arg=(k,d)=>{const i=process.argv.indexOf('--'+k);return i>=0?process.argv[i+1]:d;};
const W=+arg('width',390),H={360:740,390:844,430:932}[W]||844,SHOTS=arg('shots',''),PORT=+arg('port',8130+W%100),ONLY=(arg('only','f03,flagsoff')).split(',');
const CHROME=process.env.RA_CHROME||process.env.RA_CHROMIUM_PATH;
if(SHOTS)fs.mkdirSync(SHOTS,{recursive:true});
const results=[];const log=(ok,name,detail='')=>{results.push({ok,name,detail});console.log(`${ok?'PASS':'FAIL'} [${W}] ${name}${detail?' - '+detail:''}`);return ok;};
const srv=await serve(PORT);
const BASE=`http://127.0.0.1:${PORT}/index.html`;
const FF='F03.new_oga_ladder_close,F07.m8_and_finale,F01.showdown_core,F04.war_room';
const browser=await chromium.launch({headless:true,executablePath:CHROME&&fs.existsSync(CHROME)?CHROME:undefined});
const errs=[];
// the dev=1 panel (needed for the ff= flags) is hidden for evidence shots only: it would cover the phone-width scene
const shot=async(p,n)=>{if(SHOTS){await p.evaluate(()=>{const d=document.querySelector('#devPanel');if(d)d.style.display='none';});await p.screenshot({path:path.join(SHOTS,`${W}_${n}.png`)});}};
async function open(query){
 const ctx=await browser.newContext({viewport:{width:W,height:H}});const p=await ctx.newPage();
 p.on('pageerror',e=>errs.push('pageerror: '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/favicon|net::ERR|404/.test(m.text()))errs.push('console: '+m.text().slice(0,200));});
 await p.goto(`${BASE}?${query}`);
 await p.evaluate(()=>{const saved=RAState.migrateRecord(RASaveFixtures.fixtures.supraOwned);RAState.write(localStorage,saved,false);});
 await p.reload();await p.click('#startButton');await p.waitForFunction(()=>window.RAScenes&&RAScenes.current()==='bedroom',null,{timeout:30000});
 return p;
}
const begin=async(p,id)=>{await p.evaluate(id=>RAAdventureScene.begin(id,{from:'qa'}),id);await p.waitForFunction(()=>RAScenes.current()==='adventure');};
const tap=p=>p.locator('#adventureScene').click({position:{x:Math.round(W/2),y:300}}).catch(()=>{});
async function toChoices(p,tr=null){for(let i=0;i<200;i++){if(tr)tr.push(await p.evaluate(()=>document.querySelector('#adventureScene')?.innerText||''));if(await p.locator('.adv-choice:not([disabled])').count())return;if(!await p.evaluate(()=>!!RAAdventures.active()))throw new Error('adventure ended before choices');await tap(p);await p.waitForTimeout(35);}throw new Error('choices did not appear');}
async function pick(p,label){await toChoices(p);const b=p.locator('.adv-choice:not([disabled])').filter({hasText:label}).first();if(!await b.count())throw new Error('choice missing: '+label);await b.click();}
async function finish(p,tr=null){for(let i=0;i<250;i++){if(tr)tr.push(await p.evaluate(()=>document.querySelector('#adventureScene')?.innerText||''));if(await p.evaluate(()=>!RAAdventures.active()))return;await tap(p);await p.waitForTimeout(35);}throw new Error('adventure did not finish');}
const wake=p=>p.evaluate(()=>{RAClock.sleep();const id=RAWakeTriggers.pick();return /^NEW_OGA_/.test(id||'')?id:null;});
const money=p=>p.evaluate(()=>Number(RALife.money()));
let code=0;
try{
 if(ONLY.includes('f03')){
  // ---------- F03 flags ON: M8 resolved by fixture (F07's own path is covered by its browser suite) -> M9 -> M10 -> VampGPT
  const p=await open(`dev=1&ff=${FF}&speed=10&mute=1`);
  await p.evaluate(()=>{RAState.patch('life.world.day',15);RAState.patch('life.resources.money',500000);
   for(const id of ['toyota_supra_mk4_001','lambo_urus_oxblood'])if(!RALife.ownedCars().some(c=>c.id===id))RALife.addCar({id,make:'X',model:id,short:id,price:1,value:1,parts:{}});
   RANewOga.patch({status:'m8_hold',mission:7,rank:4,title:'SENIOR ASSOCIATE',rank4Granted:true,m5Completed:true,m6Completed:true,m7Completed:true,m8Resolved:true,m8Outcome:'send_the_boys',trust:1,lastMissionDay:14});});
  log(await p.evaluate(()=>RAFeatures.enabled('F03.new_oga_ladder_close')===true),'flags ON: F03 live');
  log(await p.evaluate(()=>RAWakeTriggers.pick()==='NEW_OGA_M9'),'M9 is the WAKE delivery once m8Resolved is written (gates on m8Resolved)');
  await begin(p,'NEW_OGA_M9');await shot(p,'f03_01_m9_voice_note');
  const t9=[];await toChoices(p,t9);await shot(p,'f03_02_m9_choice');
  log(await p.locator('.adv-choice:not([disabled])').filter({hasText:'GIVE IT'}).count()>0,'M9 THE TRIBUTE offers GIVE IT');
  await pick(p,'GIVE IT');await finish(p);
  const s9=await p.evaluate(()=>({l:RANewOga.current(),tributed:RAVehicles.tributedCar?.()||null,m10:RAAdventures.available('NEW_OGA_M10'),vg:RAAdventures.available('NEW_OGA_VAMPGPT')}));
  log(s9.l.m9Resolved===true&&!!s9.tributed,'GIVE IT: the most-driven available car is TRIBUTED (hidden, not deleted)',String(s9.tributed?.id||s9.tributed));
  log(s9.m10===false&&s9.vg===false,'one mission per WAKE: M10 and VampGPT do not chain into the same day');
  await shot(p,'f03_03_after_m9');
  const w10=await wake(p);log(w10==='NEW_OGA_M10','M10 VICE PRESIDENT arrives on the NEXT WAKE',String(w10));
  const m0=await money(p);await begin(p,'NEW_OGA_M10');const t10=[];await finish(p,t10);await shot(p,'f03_04_m10');
  const s10=await p.evaluate(()=>({l:RANewOga.current(),vg:RAAdventures.available('NEW_OGA_VAMPGPT'),title:RANewOga.current().title}));
  log(s10.l.m10Completed===true,'M10 completes (rank 5 VICE PRESIDENT)',s10.title);
  log(s10.vg===false,'VampGPT does not arrive on the same WAKE as M10');
  const wv=await wake(p);log(wv==='NEW_OGA_VAMPGPT','VampGPT arrives on the WAKE after M10',String(wv));
  await begin(p,'NEW_OGA_VAMPGPT');await shot(p,'f03_05_vampgpt');
  const tv=[];await toChoices(p,tv);
  log(await p.locator('.adv-choice:not([disabled])').filter({hasText:'SAY LESS'}).count()>0,'VampGPT offers the authored SAY LESS choice');
  await shot(p,'f03_06_vampgpt_choice');
  await pick(p,'SAY LESS');await finish(p);
  log(await p.evaluate(()=>RANewOga.current().finaleBegun===true),'SAY LESS records finaleBegun (F07 finale unlocked)');
  // M10 weekly income: the authored $15,000 every 7th day after the grant (headless F03 test covers the exact arithmetic; here the real page)
  const inc=await p.evaluate(()=>{const g=Number(RANewOga.current().m10GrantDay)||0,b=Number(RALife.money());const days=[];for(let i=0;i<8;i++){const before=Number(RALife.money());RAClock.sleep();days.push(Number(RALife.money())-before);}return {g,days};});
  log(inc.days.filter(x=>x>=15000).length>=1,'M10 pays the authored $15,000 on the 7th day after the grant (a WAKE delta of at least $15,000 appears within 8 nights)',JSON.stringify(inc));
  await p.reload();await p.click('#startButton');await p.waitForFunction(()=>window.RAScenes&&RAScenes.current()==='bedroom',null,{timeout:30000});
  log(await p.evaluate(()=>RANewOga.current().m10Completed===true&&RANewOga.current().finaleBegun===true),'reload keeps the ladder state (CONTINUE)');
  await p.context().close();
 }
 if(ONLY.includes('flagsoff')){
  const p=await open('dev=1&speed=10&mute=1');   // NO ff= : every fragment flag is DARK (RAFlagDefaults = {})
  const off=await p.evaluate(()=>({f03:RAFeatures.enabled('F03.new_oga_ladder_close'),f07:RAFeatures.enabled('F07.m8_and_finale'),f15:RAFeatures.enabled('F15.velvet_rotation'),
   m8:RAAdventures.available('NEW_OGA_M8'),fin:RAAdventures.available('NEW_OGA_FINALE'),m9:RAAdventures.available('NEW_OGA_M9'),
   frag:Object.keys(RAState.get().frag||{}),scene:RAScenes.current()}));
  log(!off.f03&&!off.f07&&!off.f15,'flags OFF: F03, F07 and F15 are dark by default',JSON.stringify({f03:off.f03,f07:off.f07,f15:off.f15}));
  log(!off.m8&&!off.fin&&!off.m9,'flags OFF: M8, M9 and the finale are unavailable');
  log(!off.frag.some(k=>/^(F03|F07|F15)$/.test(k)),'flags OFF: no F03/F07/F15 namespace is written to the save',JSON.stringify(off.frag));
  log(off.scene==='bedroom','flags OFF: START still reaches the bedroom');
  await shot(p,'flagsoff_bedroom');
  await p.context().close();
 }
 log(errs.length===0,'no console / page errors',errs.slice(0,3).join(' | '));
 code=results.every(r=>r.ok)?0:1;
}catch(e){console.error('FAIL',e.stack||e);code=1;}
finally{await browser.close();srv.close?.();}
console.log(code===0?`PASS build1 browser paths @${W} (${results.length} checks)`:`FAIL build1 browser paths @${W}`);process.exit(code);
