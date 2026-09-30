// F04 WAR ROOM -> F01 THE PLAY -> F04: real-browser smoke of the WHOLE round trip in the real game page. Not part of `npm test` (needs a browser):
//   node tools/tests/F04/browser-war-room.mjs [--shots dir] [--port 8124]
// Drives: START -> phone -> WAR ROOM JOBS (no tactical RUN UI) -> MAKE THIS PLAY -> the canonical F01 phone offer -> CREW/CAR -> live feed ->
// return -> BACK TO THE WAR ROOM, then checks the strategic state, a reload, and that the same result is never applied twice.
import {createRequire} from 'node:module';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const require=createRequire(process.env.RA_PLAYWRIGHT_PATH||'/opt/node22/lib/node_modules/');
const {chromium}=require('playwright');
import {serve} from '../f01/play-sim/serve-play.mjs';
const arg=(k,d)=>{const i=process.argv.indexOf('--'+k);return i>=0?process.argv[i+1]:d;};
const SHOTS=arg('shots',''),PORT=+arg('port',8124);
const CHROME=process.env.RA_CHROME||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
if(SHOTS)fs.mkdirSync(SHOTS,{recursive:true});
const results=[];const log=(ok,name,detail='')=>{results.push({ok,name,detail});console.log(`${ok?'PASS':'FAIL'} ${name}${detail?' — '+detail:''}`);return ok;};
const srv=await serve(PORT);const base=`http://127.0.0.1:${PORT}/index.html`;
const browser=await chromium.launch({headless:true,executablePath:fs.existsSync(CHROME)?CHROME:undefined});
const errs=[];
const watch=page=>{page.on('pageerror',e=>errs.push('pageerror: '+e.message));page.on('console',m=>{if(m.type()==='error'&&!/favicon|net::ERR/.test(m.text()))errs.push('console: '+m.text().slice(0,200));});page.on('response',r=>{if(r.status()>=400&&!/favicon/.test(r.url()))errs.push('http '+r.status()+' '+r.url());});};
const shot=async(page,n)=>{if(SHOTS)await page.screenshot({path:path.join(SHOTS,n+'.png')});};
let code=0;
try{
 const ctx=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1});
 const page=await ctx.newPage();watch(page);
 await page.goto(`${base}?dev=1&ff=F04.war_room,F01.showdown_core&speed=10&mute=1`);
 // an existing save (Supra owned) goes through the normal START path, as in the other browser gates
 await page.evaluate(()=>{const saved=RAState.migrateRecord(RASaveFixtures.fixtures.supraOwned);RAState.write(localStorage,saved,false);});
 await page.reload();await page.click('#startButton');await page.waitForFunction(()=>window.RAScenes&&RAScenes.current()==='bedroom',null,{timeout:30000});
 log(await page.evaluate(()=>!!(window.RAWarRoomPlay&&window.RAShowdown&&window.RAShowdown.play&&window.RAPlayContract)),'game loads F04 play adapter + F01 play facade + contract');
 // F03 is not in this lineage: the F03 provider is exercised by the node suites; here Koreatown reports PROVIDER_MISSING and the other two register
 const prov=await page.evaluate(()=>({ids:RAWarRoomDistricts.activeIds(),missing:RAWarRoomDistricts.provider().missing.map(m=>m.id),arts:RADistricts.get('arts_district')?.fragment,ing:RADistricts.get('inglewood')?.fragment,kt:RADistricts.get('koreatown')}));
 log(prov.arts==='F04'&&prov.ing==='F04'&&prov.kt===null&&prov.missing.join()==='koreatown','district registration in the real game: arts_district + inglewood register; Koreatown is F03\'s (not defined by F04)',JSON.stringify(prov));
 // state: route accepted, cars, money, a crew of six
 await page.evaluate(()=>{RAState.patch('life.resources.money',150000);for(const id of ['toyota_supra_mk4_001','lambo_urus_oxblood'])RALife.addCar({id,make:'X',model:id,short:id,price:1,value:1,parts:{}});
  RAFrag.patch('F04','active',true);RAFrag.patch('F04','offer.status','accepted');RAPhoneRegistry.unlock('warRoom');});
 const bank0=await page.evaluate(()=>Number(RAState.get().life.resources.money));
 await page.evaluate(()=>RAPhone.open());await page.evaluate(()=>RAPhone.openApp('warRoom','jobs'));
 await page.waitForFunction(()=>document.body.innerText.includes("TONIGHT'S JOBS"),null,{timeout:15000});
 const jobsText=await page.evaluate(()=>document.body.innerText);await shot(page,'01_war_room_jobs');
 log(/MAKE THIS PLAY/.test(jobsText),'WAR ROOM answers "what play?": MAKE THIS PLAY');
 log(!/SELECT SQUAD|APPROACH|OCTOPUS|F01_INTEGRATION|SHOWDOWN|REWARD: \$|%/.test(jobsText),'no squad / car / approach UI, no pending marker, no percentages, no authored cash card');
 // launch the first PLAY-routed job through the real phone button
 const idx=await page.evaluate(()=>{const b=[...document.querySelectorAll('[data-phone-action^="do:warRoom:play:"]')];return b.length?b[0].dataset.phoneAction:null;});
 log(!!idx,'a PLAY-routed job button exists',String(idx));
 await page.click(`[data-phone-action="${idx}"]`);
 await page.waitForSelector('#f01-play-frame',{timeout:15000});
 const frame=await (await page.$('#f01-play-frame')).contentFrame();
 // the frame is watched too
 frame.page().on('pageerror',()=>{});
 await frame.waitForSelector('.b-ans',{timeout:30000});await shot(page,'02_f01_phone_offer');
 const offerText=await frame.evaluate(()=>document.body.innerText);
 log(!/%/.test(offerText)&&/UP TO \$[\d,]+/.test(offerText)&&/OGA MIN/.test(offerText),'canonical F01 PHONE OFFER shown (no percentages)',offerText.replace(/\s+/g,' ').slice(0,80));
 log(!(await frame.evaluate(()=>!!document.querySelector('.title'))),'no title screen in embed: WAR ROOM goes straight to the offer');
 await frame.click('.b-ans');await frame.waitForSelector('.send',{timeout:30000});await page.waitForTimeout(400);await shot(page,'03_f01_crew_car');
 const crewText=await frame.evaluate(()=>document.body.innerText);
 log(!/%|SEAT/.test(crewText),'canonical F01 CREW / CAR shown (no seating, no percentages)');
 const btn=await frame.$('.send.hold');
 if(btn){const bb=await btn.boundingBox();await page.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2);await page.mouse.down();await page.waitForTimeout(150);await page.mouse.up();await page.mouse.down();await page.waitForTimeout(1900);await page.mouse.up();}
 else await frame.click('.send');
 const t0=Date.now();let sawDecide=false;
 for(;;){
  if(Date.now()-t0>240000)throw new Error('PLAY did not finish (softlock?)');
  await page.waitForTimeout(200);
  const s=await frame.evaluate(()=>({d:document.querySelector('.decide button')?document.querySelector('.decide').dataset.kind:null,fb:!!document.querySelector('.decide .fb'),again:!!document.querySelector('.again')})).catch(()=>null);
  if(!s)break;
  if(s.d){sawDecide=true;const bs=await frame.$$('.decide button');await (s.d==='CLIMB'?await frame.$('.decide button[data-id=OUT]'):bs[0]).click();}
  if(s.fb)await (await frame.$('.decide .fb')).click();
  if(s.again){const label=await frame.evaluate(()=>document.querySelector('.again').textContent);log(/WAR ROOM/.test(label),'return scene ends with BACK TO THE WAR ROOM (no "run another play" loop)',label);await shot(page,'04_f01_return');await frame.click('.again');break;}
 }
 await page.waitForFunction(()=>!document.getElementById('f01-play-frame'),null,{timeout:20000});
 log(true,'PLAY finished and the iframe closed',sawDecide?'with timed calls answered':'no calls this PLAY');
 await page.waitForFunction(()=>RAWarRoomPlay.pending()===null,null,{timeout:10000});
 const st=await page.evaluate(()=>{const log=RAFrag.read('F04','jobs.log',[]);const e=log.at(-1);const c=e&&RAWarRoomPlay.consumed(e.requestId);
  const res=JSON.parse(localStorage.getItem('ra.f01.play.v1.embed_results')||'{}')[e&&e.requestId];
  return {bank:Number(RAState.get().life.resources.money),entry:e,consumed:c,res,crew:RACrew.snapshot(),heat:RAHeat.global(),pending:RAWarRoomPlay.pending(),cards:RAWarRoomReportCard.recent(5).length};});
 log(!!st.res&&st.res.status==='COMPLETE'&&!!st.consumed&&st.consumed.errors.length===0,'F04 consumed F01\'s canonical result record with no errors',st.res&&`${st.res.outcome.klass} win=${st.res.outcome.win}`);
 log(st.bank===Math.max(0,bank0+st.res.cash.gain-st.res.cash.spent),'bank moved by exactly the PLAY\'s pot minus its cost (no duplicate reward)',`${bank0} -> ${st.bank} (gain ${st.res.cash.gain}, spent ${st.res.cash.spent})`);
 const map={READY:'ACTIVE',WOUNDED:'DOWNED',SHOT:'DOWNED',CAPTURED:'CAPTURED',GONE:'GONE',DEAD:'GONE'};
 log(st.res.crew.every(c=>st.crew[c.id].status===map[c.after]),'crew statuses match the record',st.res.crew.map(c=>c.id+':'+c.after).join(' '));
 log(st.cards===1&&st.entry.via==='play','one job-log entry + one report card');
 // the WAR ROOM screen is back and shows no PLAY outcome of its own
 await page.evaluate(()=>RAPhone.openApp('warRoom','jobs'));await page.waitForTimeout(300);
 const back=await page.evaluate(()=>document.body.innerText);await shot(page,'05_back_in_war_room');
 log(/WAR ROOM|JOBS/i.test(back)&&!/%/.test(back),'back in the WAR ROOM');
 // reload: persistence, no pending, and the same record is a no-op
 await page.reload();await page.click('#startButton');await page.waitForFunction(()=>window.RAScenes&&RAScenes.current()==='bedroom',null,{timeout:30000});
 const st2=await page.evaluate(()=>{const e=RAFrag.read('F04','jobs.log',[]).at(-1);return {bank:Number(RAState.get().life.resources.money),pending:RAWarRoomPlay.pending(),consumed:!!RAWarRoomPlay.consumed(e.requestId),crew:RACrew.snapshot(),id:e.requestId};});
 log(st2.bank===st.bank&&st2.pending===null&&st2.consumed&&Object.keys(st.crew).every(k=>st2.crew[k].status===st.crew[k].status),'reload: money, crew and consumed record persisted; nothing pending');
 const dup=await page.evaluate(id=>{const res=JSON.parse(localStorage.getItem('ra.f01.play.v1.embed_results'))[id];RAFrag.patch('F04','play.pending',{request:{requestId:id},carMap:{},jobMeta:{},seq:99});const before=Number(RAState.get().life.resources.money);const out=RAWarRoomPlay.consume(res);return {dup:out.duplicate,same:before===Number(RAState.get().life.resources.money)};},st2.id);
 log(dup.dup&&dup.same,'re-delivering the same result after a reload pays nothing');
 log(errs.length===0,'no console / page errors during the whole round trip',errs.slice(0,3).join(' | '));
 code=results.every(r=>r.ok)?0:1;
}catch(e){console.error(e);log(false,'browser smoke crashed',String(e.message).slice(0,200));code=1;}
finally{await browser.close();srv.close();}
console.log(code===0?`BROWSER SMOKE PASS (${results.length} checks)`:'BROWSER SMOKE FAIL');process.exit(code);
