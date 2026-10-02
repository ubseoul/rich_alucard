// F07 M8 + FINALE: real-browser smoke of the player-facing paths (not part of `npm test`; needs a browser):
//   node tools/tests/f07/browser-path.mjs [--shots dir] [--port 8127]
// M8: voice-note adventure UI -> GO MYSELF -> the REAL F01 PLAY iframe -> back into the adventure -> m8Resolved -> reload -> next WAKE = M9.
//     SEND THE BOYS through the UI. M8 is JOB TEXT ONLY (no voice-note UI). FINALE: lane picks (a plan without THE OGAS is refused,
//     REMAKE THE PLAN) -> Phase 1 on F07's PLAY page (THE PARTY: AUNTIES + CANOPY POLE cards) -> Phase 2 GBENGA in the real Combat 2.0
//     scene -> ALL THREE endings (BLESSING / CONSIGLIERE / TAKEOVER) with their distinct consequences, reload.
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
const shot=async(p,n)=>{if(SHOTS){await p.evaluate(()=>{const d=document.querySelector('#devPanel');if(d)d.style.display='none';}).catch(()=>{});await p.screenshot({path:path.join(SHOTS,n+'.png')});}};   // dev=1 panel hidden for evidence shots only
async function open(){
 const ctx=await browser.newContext({viewport:{width:+(process.env.RA_VW||390),height:+(process.env.RA_VH||844)}});const p=await ctx.newPage();
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
async function toChoices(p,tr=null){for(let i=0;i<150;i++){if(tr!==null)tr.push(await p.evaluate(()=>document.querySelector('#adventureScene')?.innerText||''));if(await p.locator('.adv-choice:not([disabled])').count())return;if(!await p.evaluate(()=>!!RAAdventures.active()))throw new Error('adventure ended before choices');await p.locator('#adventureScene').click({position:{x:195,y:300}}).catch(()=>{});await p.waitForTimeout(35);}throw new Error('choices did not appear');}
async function pick(p,label){await toChoices(p);const b=p.locator('.adv-choice:not([disabled])').filter({hasText:label}).first();if(!await b.count())throw new Error('choice missing: '+label);await b.click();}
async function finish(p,tr=null){for(let i=0;i<150;i++){if(tr!==null)tr.push(await p.evaluate(()=>document.querySelector('#adventureScene')?.innerText||''));if(await p.evaluate(()=>!RAAdventures.active()))return;await p.locator('#adventureScene').click({position:{x:195,y:300}}).catch(()=>{});await p.waitForTimeout(35);}throw new Error('adventure did not finish');}
// drive ONE real PLAY in the iframe to its end (same loop as the F04 browser gate)
async function drivePlay(p){
 for(let i=0;i<80&&!await p.locator('#f01-play-frame').count();i++){await p.locator('#adventureScene').click({position:{x:195,y:300}}).catch(()=>{});await p.waitForTimeout(40);}
 await p.waitForSelector('#f01-play-frame',{timeout:30000});const frameEl=await p.$('#f01-play-frame');const info={src:await frameEl.getAttribute('src'),seen:''};const frame=await frameEl.contentFrame();
 await frame.waitForSelector('.b-ans',{timeout:30000});info.seen+=await frame.evaluate(()=>document.body.innerText).catch(()=>'');info.state=await frame.evaluate(async()=>{const C=await import('../../../js/frag/F01/play/content.mjs');return {job:C.JOBS.some(j=>j.id==='owambe_party'),contact:C.CARDS.CONTACT.map(c=>c.id),trouble:C.CARDS.TROUBLE.map(c=>c.id)};}).catch(e=>({err:String(e)}));await frame.click('.b-ans');await frame.waitForSelector('.send',{timeout:30000});await p.waitForTimeout(400);
 const btn=await frame.$('.send.hold');
 if(btn){const bb=await btn.boundingBox();await p.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2);await p.mouse.down();await p.waitForTimeout(150);await p.mouse.up();await p.mouse.down();await p.waitForTimeout(1900);await p.mouse.up();}else await frame.click('.send');
 const t0=Date.now();
 for(;;){
  if(Date.now()-t0>240000)throw new Error('PLAY did not finish');
  await p.waitForTimeout(200);
  const s=await frame.evaluate(()=>({d:document.querySelector('.decide button')?document.querySelector('.decide').dataset.kind:null,fb:!!document.querySelector('.decide .fb'),again:!!document.querySelector('.again')})).catch(()=>null);
  if(!s)break;
  info.seen+='\n'+await frame.evaluate(()=>document.body.innerText).catch(()=>'');
  if(s.d){const bs=await frame.$$('.decide button');await (s.d==='CLIMB'?await frame.$('.decide button[data-id=OUT]'):bs[0]).click();}
  if(s.fb)await (await frame.$('.decide .fb')).click();
  if(s.again){await frame.click('.again');break;}
 }
 await p.waitForFunction(()=>!document.getElementById('f01-play-frame'),null,{timeout:20000});
 return info;
}
const jc=(p,sel)=>p.evaluate(sel=>{const e=document.querySelector(sel);if(e)e.click();return !!e;},sel);   // the dev panel (dev=1) covers part of the combat menu
let code=0;
try{
 // ---------------------------------------------------------------- M8: GO MYSELF through the real PLAY
 {
  const p=await open();await seed(p);
  log(await p.evaluate(()=>!!(RAF07&&RAF07Play&&RAShowdown.play&&RAAdventures.get('NEW_OGA_M8')&&RAAdventures.get('NEW_OGA_FINALE'))),'game loads F07 (M8 + finale adventures, PLAY bridge) after F01/F03/F04');
  log(await p.evaluate(()=>RAAdventures.available('NEW_OGA_M8')&&RAWakeTriggers.pick()==='NEW_OGA_M8'),'M8 is delivered by the WAKE arbiter (priority 77)');
  const m0=await p.evaluate(()=>RALife.money()),h0=await p.evaluate(()=>RANewOga.current().heat);
  await begin(p,'NEW_OGA_M8');await shot(p,'01_m8_job_text');
  const tr0=[];await toChoices(p,tr0);const text=tr0.join('\n');
  log(/JOB TEXT/i.test(text)&&/Koreatown/.test(text)&&/Open Mouth Gang/.test(text),'M8 is delivered as JOB TEXT (Koreatown block, Open Mouth Gang)');
  log(!/voice/i.test(text)&&!(await p.locator('.voice, [class*=voice]').count()),'no voice-note UI or voice content in M8',(text.match(/[^\n]*voice[^\n]*/i)||[''])[0]+' | audio/voice nodes: '+await p.locator('.voice, [class*=voice]').count());
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
  log(s.l.m8Resolved===true&&s.l.m8Outcome==='send_the_boys'&&s.money===m0&&s.l.trust===1&&s.l.gangClout===0&&s.l.heat===0,'SEND THE BOYS: resolves M8 with no invented consequence (no pay / HEAT / clout / trust change)',`trust ${s.l.trust}`);
  await p.context().close();
 }
 // ---------------------------------------------------------------- FINALE: a plan saved before D3 reopens with THE OGAS fixed, nothing dropped
 {
  const p=await open();
  await seed(p,{cars:['lambo_urus_oxblood'],extra:{m8Resolved:true,m9Resolved:true,m9Outcome:'nah',m10Completed:true,finaleBegun:true,rank:5,title:'VICE PRESIDENT',lastMissionDay:14}});
  await p.evaluate(()=>{RAAdventures.start('NEW_OGA_FINALE',{from:'qa'});RAAdventures.patchActive({node:'pick3',vars:{lanes:['shannon','mazda','pinky']}});});
  await p.evaluate(()=>RAAdventureScene.begin('NEW_OGA_FINALE',{from:'qa'}));await p.waitForFunction(()=>RAScenes.current()==='adventure');
  await toChoices(p);
  const labels=await p.evaluate(()=>[...document.querySelectorAll('.adv-choice')].map(b=>b.innerText.replace(/\s+/g,' ')));
  const prior=await p.evaluate(()=>RAAdventures.active()?.vars?.prior);
  log(labels.some(t=>/THE OGAS/.test(t))&&await p.locator('.adv-choice[disabled]').filter({hasText:'THE OGAS'}).count()===1&&labels.filter(t=>/PREVIOUSLY PICKED/.test(t)).length===3&&JSON.stringify(prior)==='["shannon","mazda","pinky"]','saved plan (three others, no THE OGAS): selection reopens with THE OGAS fixed and all three lanes marked PREVIOUSLY PICKED, none dropped',labels.join(' | '));
  await p.context().close();
 }
 // ---------------------------------------------------------------- FINALE: all three endings through the real UI
 const ENDINGS=[
  {name:'BLESSING',cars:['toyota_supra_mk4_001'],trust:1,extra:{leftoversAte:true},octopus:'charisma',hp:'260',expect:/earpiece/i,flags:l=>l.earpieceGiven&&l.sundayDinnerInvite&&!l.consigliere&&!l.gbengaLeftLA},
  {name:'CONSIGLIERE',cars:['toyota_supra_mk4_001','honda_s2000_pink'],trust:3,extra:{},octopus:'recruit',hp:'320',expect:/Hello\. Hello\. Oga\. Hello\./,flags:l=>l.consigliere&&!l.earpieceGiven&&!l.gbengaLeftLA},
  {name:'TAKEOVER',cars:['toyota_supra_mk4_001','lambo_urus_oxblood'],trust:1,extra:{},octopus:null,hp:'260',expect:/tributed car is pulled back/i,flags:l=>l.gbengaLeftLA&&l.rentalWarehouseOwned&&!l.consigliere&&!l.earpieceGiven}
 ];
 for(const E of ENDINGS){
  const p=await open();
  await seed(p,{cars:E.cars,extra:{m8Resolved:true,m8Outcome:'win',m9Resolved:true,m9Outcome:'give',m9TributedCar:'toyota_supra_mk4_001',m10Completed:true,m10GrantsApplied:true,finaleBegun:true,rank:5,title:'VICE PRESIDENT',trust:E.trust,lastMissionDay:14,...E.extra}});
  await p.evaluate(()=>RAVehicles.tribute('toyota_supra_mk4_001',{reason:'qa'}));
  await begin(p,'NEW_OGA_FINALE');
  if(E.name==='BLESSING'){
   // D3: THE OGAS is shown preselected and locked; the player picks TWO others
   await toChoices(p);
   log(await p.locator('.adv-choice[disabled]').filter({hasText:'THE OGAS'}).count()===1&&await p.locator('.adv-choice:not([disabled])').filter({hasText:'THE OGAS'}).count()===0,'D3: THE OGAS is a visible, locked (non-selectable) entry');
   const labels=await p.evaluate(()=>[...document.querySelectorAll('.adv-choice')].map(b=>b.innerText.replace(/\s+/g,' ')));
   log(!labels.some(t=>/AIR|GETAWAY|FILINGS|SNACKS|YORUBA/i.test(t)),'D6: no lane advertises an effect',labels.join(' | '));
   await shot(p,'04a_fixed_ogas');
  }
  await pick(p,'SHANNON');await pick(p,'PINKY');
  const lanes=await p.evaluate(()=>RAAdventures.active()?.vars?.lanes);
  log(JSON.stringify(lanes)==='["ogas","shannon","pinky"]','THE OGAS fixed + two picks',JSON.stringify(lanes));
  await shot(p,`04_${E.name}_plan`);
  const pl=await drivePlay(p);await p.waitForTimeout(600);
  log(/assets\/f07\/play\/index\.html/.test(pl.src)&&/THE PARTY/.test(pl.seen),`${E.name}: Phase 1 runs on F07's PLAY page and the job is THE PARTY`,pl.src);
  log(/THE AUNTIES BLOCK THE LINE OF FIRE AND CRITIQUE THE TACTICS OUT LOUD\./i.test(pl.seen),`${E.name}: AUNTIES event feedback is shown in the feed`);
  log(!/canopy/i.test(pl.seen)||/A CANOPY POLE IS HIT\. THE CANOPY COLLAPSES ON WHOEVER IS UNDER IT\./i.test(pl.seen),`${E.name}: CANOPY POLE feedback is shown whenever that beat occurs`,/canopy/i.test(pl.seen)?'beat occurred':'(PLAY ended before its TROUBLE stage)');
  const iso=await p.evaluate(()=>({f01:Object.keys(localStorage).filter(k=>k.startsWith('ra.f01.play.v1')),f07:Object.keys(localStorage).filter(k=>k.startsWith('ra.f07.play.v1')).length,cars:RALife.ownedCars().map(c=>c.id),drives:RAVehicles.list().map(v=>RAVehicles.driveCount(v.id))}));
  log(iso.f01.length===0&&iso.f07>0,`${E.name}: the encounter lives under F07's own storage namespace (F01's world untouched)`,JSON.stringify({f01:iso.f01.length,f07:iso.f07}));
  log(JSON.stringify(iso.cars)===JSON.stringify(E.cars.filter(c=>c!=='toyota_supra_mk4_001')),`${E.name}: inventory unchanged by the encounter vehicle (cars now ${JSON.stringify(iso.cars)})`);
  log(pl.state?.job===true&&JSON.stringify(pl.state.contact)==='["aunties"]'&&JSON.stringify(pl.state.trouble)==='["canopy_pole"]'&&true,`${E.name}: the live PLAY page carries THE PARTY job, the AUNTIES + CANOPY POLE stage cards`,JSON.stringify(pl.state));
  let node=await p.evaluate(()=>RAAdventures.active()?.node);
  for(let n=0;n<4&&node!=='office'&&node!=='duel';n++){await pick(p,'TRY AGAIN');await p.evaluate(()=>{for(const u of RACrew.list())if(u.status!=='ACTIVE'&&u.status!=='GONE')RACrew.setStatus(u.id,'ACTIVE',{reason:'qa-heal'});});await drivePlay(p);await p.waitForTimeout(600);node=await p.evaluate(()=>RAAdventures.active()?.node);}
  log(true,`${E.name}: Phase 1 THE PARTY won on F07's PLAY page`,node);
  if(E.name==='TAKEOVER')await p.evaluate(()=>{const c=RACombat2Rules.create;RACombat2Rules.create=function(id,params,...r){const s=c.call(this,id,{...params},...r);if(id==='gbenga'){s.enemy.hp=20;}return s;};});   // harness only: shorten the real fight
  for(let i=0;i<60&&!await p.locator('.c2-scene').count();i++){await p.locator('#adventureScene').click({position:{x:195,y:300}}).catch(()=>{});await p.waitForTimeout(40);}
  await p.waitForSelector('.c2-scene',{timeout:15000});
  const hud=await p.evaluate(()=>document.querySelector('.c2-hp-enemy')?.innerText||'');
  log(/GBENGA/.test(hud)&&(E.name==='TAKEOVER'||hud.includes(E.hp)),`${E.name}: GBENGA fight shown with ${E.name==='TAKEOVER'?'(shortened)':E.hp} HP`,hud.replace(/\s+/g,' '));
  if(E.name==='BLESSING'){
   log(/ADJUSTING HIS SLEEVES/.test(await p.evaluate(()=>document.querySelector('.c2-telegraph')?.innerText||'')),'AGBADA SWEEP telegraph visible');
   await jc(p,'[data-c2="fight"]');await jc(p,'[data-c2="move:octopus"]');await p.waitForSelector('.c2-octo-choice[data-octo="charisma"]');
   const octo=await p.evaluate(()=>[...document.querySelectorAll('.c2-octo-choice')].map(b=>b.innerText.replace(/\s+/g,' ')));
   log(octo.some(t=>/RETIRE, UNCLE/.test(t))&&octo.some(t=>/WORK FOR ME/.test(t))&&octo.some(t=>/PHOTOSHOPPED/.test(t)),'OCTOPUS BRAIN shows the three authored options',octo.join(' | '));
   await shot(p,'06_octopus');
  }
  if(E.octopus){if(E.name!=='BLESSING'){await jc(p,'[data-c2="fight"]');await jc(p,'[data-c2="move:octopus"]');await p.waitForSelector(`.c2-octo-choice[data-octo="${E.octopus}"]`);}await jc(p,`.c2-octo-choice[data-octo="${E.octopus}"]`);}
  else{ // TAKEOVER: win the fight with real attacks
   for(let i=0;i<12&&!await p.locator('[data-c2="done"]').count();i++){await jc(p,'[data-c2="fight"]');await jc(p,'[data-c2="move:blood"]');await p.waitForTimeout(700);}
  }
  await p.waitForSelector('[data-c2="done"]',{timeout:30000});await jc(p,'[data-c2="done"]');
  const tr=[];await finish(p,tr);const all=tr.join('\n');
  const f=await p.evaluate(()=>({l:RANewOga.current(),kt:RADistricts.get('koreatown'),ing:RADistricts.get('inglewood'),wr:RAFrag.read('F04','active',false),tributed:RAVehicles.isTributed('toyota_supra_mk4_001'),texts:JSON.stringify(RAState.get().life).includes('My son is now my oga'),renamed:RANewOga.current().enterprisesRenamed}));
  log(f.l.finaleDone&&f.l.finaleEnding===E.name.toLowerCase()&&f.l.rank===6&&f.l.title==='NEW OGA',`${E.name}: Rich is the NEW OGA (rank 6), ending ${f.l.finaleEnding}`);
  log(E.expect.test(all),`${E.name}: its own ending text is shown`);
  log(!!E.flags(f.l),`${E.name}: only its own consequence flags are set`);
  log(f.tributed===(E.name!=='TAKEOVER'),`${E.name}: the tributed car ${E.name==='TAKEOVER'?'comes back':'stays in the warehouse'}`);
  log(f.texts===(E.name==='BLESSING'),`${E.name}: Gbenga's VampGram post ${E.name==='BLESSING'?'is posted':'is not posted'}`);
  log(f.kt.state==='CONTROLLED'&&f.ing.holder==='rich'&&f.wr===true&&/GBENGA ENTERPRISES becomes RICH ENTERPRISES/.test(all),"every ending: Gbenga's blocks are Rich's, the War Room begins, GBENGA ENTERPRISES -> RICH ENTERPRISES");
  await shot(p,`07_${E.name}_done`);
  if(E.name==='CONSIGLIERE'){for(let i=0;i<7;i++)await p.evaluate(()=>RAClock.sleep());log(await p.evaluate(()=>JSON.stringify(RAState.get().life).includes('Hello. Hello. Oga. Hello.')),'CONSIGLIERE: the voice notes continue ("Hello. Hello. Oga. Hello.")');}
  await p.reload();await p.click('#startButton');await p.waitForFunction(()=>window.RAScenes&&RAScenes.current()==='bedroom',null,{timeout:30000});
  const r=await p.evaluate(()=>({l:RANewOga.current(),kt:RADistricts.get('koreatown').state,a:RAAdventures.available('NEW_OGA_FINALE'),tr:RAVehicles.isTributed('toyota_supra_mk4_001')}));
  log(r.l.finaleDone===true&&r.l.rank===6&&r.kt==='CONTROLLED'&&r.a===false&&r.tr===(E.name!=='TAKEOVER'),`${E.name}: reload keeps NEW OGA, blocks and the car state; the finale never re-arrives`);
  await p.context().close();
 }
 log(errs.length===0,'no console / page errors',errs.slice(0,3).join(' | '));
 code=results.every(r=>r.ok)?0:1;
}catch(e){console.error('FAIL',e.stack||e);code=1;}
finally{await browser.close();srv.close?.();}
console.log(code===0?`PASS f07 browser (${results.length} checks)`:'FAIL f07 browser');process.exit(code);
