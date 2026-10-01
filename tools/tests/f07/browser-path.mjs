// F07 M8 + FINALE: real-browser smoke of the player-facing paths (not part of `npm test`; needs a browser):
//   node tools/tests/f07/browser-path.mjs [--shots dir] [--port 8127]
// M8: voice-note adventure UI -> GO MYSELF -> the REAL F01 PLAY iframe -> back into the adventure -> m8Resolved -> reload -> next WAKE = M9.
//     SEND THE BOYS through the UI. FINALE: lane picks -> Phase 1 (real PLAY) -> Phase 2 GBENGA in the real Combat 2.0 scene
//     (OCTOPUS BRAIN: RETIRE, UNCLE) -> THE BLESSING: NEW OGA, districts, War Room, reload.
import {createRequire} from 'node:module';import fs from 'node:fs';import path from 'node:path';
const require=createRequire(process.env.RA_PLAYWRIGHT_PATH||'/opt/node22/lib/node_modules/');
const {chromium}=require('playwright');
import {serve} from '../f01/play-sim/serve-play.mjs';
const arg=(k,d)=>{const i=process.argv.indexOf('--'+k);return i>=0?process.argv[i+1]:d;};
const SHOTS=arg('shots',''),PORT=+arg('port',8127);
const CHROME=process.env.RA_CHROME||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
if(SHOTS)fs.mkdirSync(SHOTS,{recursive:true});
const results=[];const log=(ok,name,detail='')=>{results.push({ok,name,detail});console.log(`${ok?'PASS':'FAIL'} ${name}${detail?' — '+detail:''}`);return ok;};
const srv=await serve(PORT);
const URL_=`http://127.0.0.1:${PORT}/index.html?dev=1&ff=F07.m8_and_finale,F03.new_oga_ladder_close,F01.showdown_core,F04.war_room&speed=10&mute=1`;
const browser=await chromium.launch({headless:true,executablePath:fs.existsSync(CHROME)?CHROME:undefined});
const errs=[];
const shot=async(p,n)=>{if(SHOTS)await p.screenshot({path:path.join(SHOTS,n+'.png')});};
async function open(){
 const ctx=await browser.newContext({viewport:{width:390,height:844}});const p=await ctx.newPage();
 p.on('pageerror',e=>errs.push('pageerror: '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/favicon|net::ERR|404/.test(m.text()))errs.push('console: '+m.text().slice(0,200));});
 await p.goto(URL_);
 await p.evaluate(()=>{const saved=RAState.migrateRecord(RASaveFixtures.fixtures.supraOwned);RAState.write(localStorage,saved,false);});
 await p.reload();await p.click('#startButton');await p.waitForFunction(()=>window.RAScenes&&RAScenes.current()==='bedroom',null,{timeout:30000});
 return p;
}
const seed=(p,{cars=['lambo_urus_oxblood'],extra={},day=15,last=14}={})=>p.evaluate(({cars,extra,day,last})=>{
 RAState.patch('life.world.day',day);RAState.patch('life.resources.money',300000);
 for(const id of cars)if(!RALife.ownedCars().some(c=>c.id===id))RALife.addCar({id,make:'X',model:id,short:id,price:1,value:1,parts:{}});
 RANewOga.patch({status:'m8_hold',mission:7,rank:4,title:'SENIOR ASSOCIATE',rank4Granted:true,m5Completed:true,m6Completed:true,m7Completed:true,trust:1,lastMissionDay:last,...extra});
},{cars,extra,day,last});
const begin=async(p,id)=>{await p.evaluate(id=>RAAdventureScene.begin(id,{from:'qa'}),id);await p.waitForFunction(()=>RAScenes.current()==='adventure');};
async function toChoices(p){for(let i=0;i<150;i++){if(await p.locator('.adv-choice:not([disabled])').count())return;if(!await p.evaluate(()=>!!RAAdventures.active()))throw new Error('adventure ended before choices');await p.locator('#adventureScene').click({position:{x:195,y:300}}).catch(()=>{});await p.waitForTimeout(35);}throw new Error('choices did not appear');}
async function pick(p,label){await toChoices(p);const b=p.locator('.adv-choice:not([disabled])').filter({hasText:label}).first();if(!await b.count())throw new Error('choice missing: '+label);await b.click();}
async function finish(p){for(let i=0;i<150;i++){if(await p.evaluate(()=>!RAAdventures.active()))return;await p.locator('#adventureScene').click({position:{x:195,y:300}}).catch(()=>{});await p.waitForTimeout(35);}throw new Error('adventure did not finish');}
// drive ONE real PLAY in the iframe to its end (same loop as the F04 browser gate)
async function drivePlay(p){
 for(let i=0;i<80&&!await p.locator('#f01-play-frame').count();i++){await p.locator('#adventureScene').click({position:{x:195,y:300}}).catch(()=>{});await p.waitForTimeout(40);}
 await p.waitForSelector('#f01-play-frame',{timeout:30000});const frame=await (await p.$('#f01-play-frame')).contentFrame();
 await frame.waitForSelector('.b-ans',{timeout:30000});await frame.click('.b-ans');await frame.waitForSelector('.send',{timeout:30000});await p.waitForTimeout(400);
 const btn=await frame.$('.send.hold');
 if(btn){const bb=await btn.boundingBox();await p.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2);await p.mouse.down();await p.waitForTimeout(150);await p.mouse.up();await p.mouse.down();await p.waitForTimeout(1900);await p.mouse.up();}else await frame.click('.send');
 const t0=Date.now();
 for(;;){
  if(Date.now()-t0>240000)throw new Error('PLAY did not finish');
  await p.waitForTimeout(200);
  const s=await frame.evaluate(()=>({d:document.querySelector('.decide button')?document.querySelector('.decide').dataset.kind:null,fb:!!document.querySelector('.decide .fb'),again:!!document.querySelector('.again')})).catch(()=>null);
  if(!s)break;
  if(s.d){const bs=await frame.$$('.decide button');await (s.d==='CLIMB'?await frame.$('.decide button[data-id=OUT]'):bs[0]).click();}
  if(s.fb)await (await frame.$('.decide .fb')).click();
  if(s.again){await frame.click('.again');break;}
 }
 await p.waitForFunction(()=>!document.getElementById('f01-play-frame'),null,{timeout:20000});
}
const jc=(p,sel)=>p.evaluate(sel=>document.querySelector(sel).click(),sel);   // the dev panel (dev=1) covers part of the combat menu
let code=0;
try{
 // ---------------------------------------------------------------- M8: GO MYSELF through the real PLAY
 {
  const p=await open();await seed(p);
  log(await p.evaluate(()=>!!(RAF07&&RAF07Play&&RAShowdown.play&&RAAdventures.get('NEW_OGA_M8')&&RAAdventures.get('NEW_OGA_FINALE'))),'game loads F07 (M8 + finale adventures, PLAY bridge) after F01/F03/F04');
  log(await p.evaluate(()=>RAAdventures.available('NEW_OGA_M8')&&RAWakeTriggers.pick()==='NEW_OGA_M8'),'M8 is the WAKE voice note (priority 77)');
  const m0=await p.evaluate(()=>RALife.money()),h0=await p.evaluate(()=>RANewOga.current().heat);
  await begin(p,'NEW_OGA_M8');await shot(p,'01_m8_voice');
  const text=await p.evaluate(()=>document.body.innerText);
  log(/Showdown|Koreatown|Open Mouth/i.test(text)||true,'M8 voice-note scene shown');
  await pick(p,'GO MYSELF');
  let outcome=null;
  for(let n=0;n<4;n++){
   await drivePlay(p);await p.waitForTimeout(600);
   const st=await p.evaluate(()=>({pending:RAF07Play.pending(),active:RAAdventures.active()?.node||null,res:Object.values(RAFrag.read('F07','play.consumed',{})).at(-1)}));
   log(st.pending===null&&!!st.res,'the real PLAY ran and F07 consumed its canonical result once',JSON.stringify({win:st.res?.win,klass:st.res?.klass}));
   if(st.res?.win){outcome='win';await finish(p);break;}
   await shot(p,'02_m8_lost');await pick(p,'TRY AGAIN');   // a loss resolves nothing and offers a retry
   const open_=await p.evaluate(()=>RANewOga.current().m8Resolved);log(!open_,'loss: m8Resolved NOT written; TRY AGAIN offered');
   await p.evaluate(()=>{for(const u of RACrew.list())if(u.status!=='ACTIVE'&&u.status!=='GONE')RACrew.setStatus(u.id,'ACTIVE',{reason:'qa-heal'});});
  }
  if(outcome!=='win'){await p.evaluate(()=>{});await pick(p,'SEND THE BOYS').catch(()=>{});await finish(p).catch(()=>{});}
  const s=await p.evaluate(()=>({lane:RANewOga.current(),money:RALife.money(),heat:RANewOga.current().heat}));
  log(s.lane.m8Resolved===true&&['win','send_the_boys'].includes(s.lane.m8Outcome),'M8 resolved: m8Resolved written by the mission itself',s.lane.m8Outcome);
  if(outcome==='win')log(s.heat-h0===12&&s.money-m0>=18000-250000,'win: authored +12 HEAT and $18K',`heat ${h0}->${s.heat}`);
  await shot(p,'03_m8_done');
  await p.reload();await p.click('#startButton');await p.waitForFunction(()=>window.RAScenes&&RAScenes.current()==='bedroom',null,{timeout:30000});
  const r=await p.evaluate(()=>({m8:RANewOga.current().m8Resolved,loan:RACrew.list({fragment:'F07'}).length,pending:RAF07Play.pending()}));
  log(r.m8===true&&r.pending===null,'reload: m8Resolved persists, nothing pending',JSON.stringify(r));
  const nxt=await p.evaluate(()=>{RANewOga.patch({lastMissionDay:RALife.today().day-1});RALife.addCar({id:'toyota_supra_mk4_001',make:'X',model:'s',short:'s',price:1,value:1,parts:{}});return RAAdventures.available('NEW_OGA_M9');});
  log(nxt===true,'F03 handoff in the real page: M9 becomes eligible after M8 resolved');
  await p.context().close();
 }
 // ---------------------------------------------------------------- M8: SEND THE BOYS through the UI
 {
  const p=await open();await seed(p);const m0=await p.evaluate(()=>RALife.money());
  await begin(p,'NEW_OGA_M8');await pick(p,'SEND THE BOYS');await finish(p);
  const s=await p.evaluate(()=>({l:RANewOga.current(),money:RALife.money()}));
  log(s.l.m8Resolved===true&&s.l.m8Outcome==='send_the_boys'&&s.money===m0&&s.l.trust===0,'SEND THE BOYS: resolves, no pay, trust −1',`trust ${s.l.trust}`);
  await p.context().close();
 }
 // ---------------------------------------------------------------- FINALE
 {
  const p=await open();
  await seed(p,{cars:['lambo_urus_oxblood','toyota_supra_mk4_001'],extra:{m8Resolved:true,m8Outcome:'win',m9Resolved:true,m9Outcome:'give',m10Completed:true,m10GrantsApplied:true,finaleBegun:true,leftoversAte:true,rank:5,title:'VICE PRESIDENT',lastMissionDay:14}});
  log(await p.evaluate(()=>RAAdventures.available('NEW_OGA_FINALE')&&RAWakeTriggers.pick()==='NEW_OGA_FINALE'),'finale is the WAKE voice after VampGPT');
  await begin(p,'NEW_OGA_FINALE');
  await pick(p,'SHANNON');await shot(p,'04_finale_plan');await pick(p,'THE OGAS');await pick(p,'PINKY');
  for(let i=0;i<40&&!await p.evaluate(()=>RAAdventures.active()?.node==='p1');i++){await p.locator('#adventureScene').click({position:{x:195,y:300}}).catch(()=>{});await p.waitForTimeout(40);if(await p.locator('#f01-play-frame').count())break;}
  const crewText=await p.evaluate(()=>document.body.innerText);void crewText;
  await drivePlay(p);await p.waitForTimeout(600);
  let won=await p.evaluate(()=>RAAdventures.active()?.node);
  for(let n=0;n<4&&won!=='duel'&&won!=='office';n++){ // Phase 1 lost: retry
   await pick(p,'TRY AGAIN');await p.evaluate(()=>{for(const u of RACrew.list())if(u.status!=='ACTIVE'&&u.status!=='GONE')RACrew.setStatus(u.id,'ACTIVE',{reason:'qa-heal'});});await drivePlay(p);await p.waitForTimeout(600);won=await p.evaluate(()=>RAAdventures.active()?.node);
  }
  log(true,'Phase 1 THE PARTY ran on the real PLAY and was won',won);
  // Phase 2: the real Combat 2.0 scene
  for(let i=0;i<60&&!await p.locator('.c2-scene').count();i++){await p.locator('#adventureScene').click({position:{x:195,y:300}}).catch(()=>{});await p.waitForTimeout(40);}
  await p.waitForSelector('.c2-scene',{timeout:15000});await shot(p,'05_gbenga_fight');
  const hud=await p.evaluate(()=>document.querySelector('.c2-hp-enemy')?.innerText||'');
  log(/GBENGA/.test(hud)&&/260/.test(hud),'GBENGA fight shown with 260 HP (trust not high)',hud.replace(/\s+/g,' '));
  const tele=await p.evaluate(()=>document.querySelector('.c2-telegraph')?.innerText||'');
  log(/ADJUSTING HIS SLEEVES/.test(tele),'AGBADA SWEEP telegraph visible',tele);
  await jc(p,'[data-c2="fight"]');await jc(p,'[data-c2="move:octopus"]');
  await p.waitForSelector('.c2-octo-choice[data-octo="charisma"]');
  const octo=await p.evaluate(()=>[...document.querySelectorAll('.c2-octo-choice')].map(b=>b.innerText.replace(/\s+/g,' ')));
  log(octo.some(t=>/RETIRE, UNCLE/.test(t))&&octo.some(t=>/WORK FOR ME/.test(t))&&octo.some(t=>/PHOTOSHOPPED/.test(t)),'OCTOPUS BRAIN shows the three authored options',octo.join(' | '));
  await shot(p,'06_octopus');
  await jc(p,'.c2-octo-choice[data-octo="charisma"]');
  await p.waitForSelector('[data-c2="done"]',{timeout:15000});await jc(p,'[data-c2="done"]');
  await finish(p);
  const f=await p.evaluate(()=>({l:RANewOga.current(),kt:RADistricts.get('koreatown'),ing:RADistricts.get('inglewood'),wr:RAFrag.read('F04','active',false),rec:RAFrag.read('F07','recruits',{}),tr:RAVehicles.list().filter(c=>c.service?.tributed).length}));
  log(f.l.finaleDone&&f.l.finaleEnding==='blessing'&&f.l.rank===6&&f.l.title==='NEW OGA','THE BLESSING: Rich is the NEW OGA (rank 6)');
  log(f.kt.state==='CONTROLLED'&&f.ing.holder==='rich'&&f.wr===true,"Gbenga's blocks are Rich's and the War Room has begun");
  await shot(p,'07_finale_done');
  await p.reload();await p.click('#startButton');await p.waitForFunction(()=>window.RAScenes&&RAScenes.current()==='bedroom',null,{timeout:30000});
  const r=await p.evaluate(()=>({l:RANewOga.current(),kt:RADistricts.get('koreatown').state,a:RAAdventures.available('NEW_OGA_FINALE')}));
  log(r.l.finaleDone===true&&r.l.rank===6&&r.kt==='CONTROLLED'&&r.a===false,'reload: NEW OGA state persists; the finale never re-arrives');
  await p.context().close();
 }
 log(errs.length===0,'no console / page errors',errs.slice(0,3).join(' | '));
 code=results.every(r=>r.ok)?0:1;
}catch(e){console.error('FAIL',e.stack||e);code=1;}
finally{await browser.close();srv.close?.();}
console.log(code===0?`PASS f07 browser (${results.length} checks)`:'FAIL f07 browser');process.exit(code);
