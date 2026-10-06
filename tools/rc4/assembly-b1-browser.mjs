// Focused real Chromium smoke at 390px. EVERY campaign checkpoint is seeded.
// No natural campaign, natural PLAY outcome, or final packaged playthrough claimed.
import {open} from '../rc2/harness.mjs';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const out='docs/rc4/evidence/Integration/B1';fs.mkdirSync(out,{recursive:true});
const h=await open({width:390,height:844,dir:process.env.RA_B1_DIR?path.resolve(process.env.RA_B1_DIR):undefined,query:'?mute=1'}),p=h.page;
const log={kind:'seeded browser fixtures',viewport:[390,844],checks:[],errors:h.errors};
const snap=name=>p.screenshot({path:`${out}/${name}.png`});
const state=()=>p.evaluate(()=>({day:RALife.today().day,active:RAAdventures.active(),daily:RARC3.read(),next:RARC3.next(),cars:RALife.ownedCars().map(c=>c.id),fired:RALife.life().momentum.fameFired}));
try{
 await p.locator('#startButton').click();await p.waitForFunction(()=>!!window.RARC3);
 await p.evaluate(async()=>{
  RAAdventures.abandon();RALife.setFlag('throneDone',true);RALife.setFlag('ogunsRaveCompleted',true);RAState.patch('life.clock.started',true);
  RAState.patch('life.world.day',5);RAState.patch('life.ownership.cars',[]);RANewOga.patch({mission:3,m1Rewarded:true,m3Rewarded:true,lastMissionDay:4});RARC3.patch({story:false,action:false});
  RAAdventures.start('NEW_OGA_M4',{from:'rc3-story'});RAAdventures.patchActive({node:'run'});await RAAdventureScene.resume();
 });
 await p.locator('.adv-text').getByText(/carlos running/).click();await p.locator('[data-minigame="touge"]').waitFor();await snap('01-carless-carlos');
 assert.equal((await state()).cars.length,0);
 await p.getByRole('button',{name:'Quit minigame'}).click();await p.waitForFunction(()=>RAScenes.current()==='bedroom');
 let s=await state();assert.equal(s.active.vars.rc4Paused,true);assert.equal(s.active.node,'run');assert.equal(s.daily.action,false);await snap('02-cancel-checkpoint');
 await p.reload();await p.locator('#startButton').click();await p.waitForFunction(()=>!!window.RARC3&&RAScenes.current()==='bedroom');
 s=await state();assert.equal(s.active.node,'run');assert.equal(s.active.vars.rc4Paused,true);await snap('03-reload-checkpoint');log.checks.push('carless Carlos dispatch, cancel without completion, persisted pause/reload');
 await p.evaluate(async()=>{await RARC3.advance();});await p.locator('.adv-text').getByText(/carlos running/).click();await p.locator('[data-minigame="touge"]').waitFor();await p.getByRole('button',{name:'Quit minigame'}).click();
 await p.waitForFunction(()=>RAScenes.current()==='bedroom');
 await p.evaluate(()=>{RARC3.settleAttempt('NEW_OGA_M4','run',{outcome:'lose'});RARC3.settleAttempt('NEW_OGA_M4','run',{outcome:'lose'});});
 s=await state();assert.match(s.next.label,/TOMORROW/);assert.equal(await p.evaluate(()=>RARC3.canSleep()),true);await snap('04-retry-budget');
 await p.reload();await p.locator('#startButton').click();await p.waitForFunction(()=>!!window.RARC3);assert.equal(await p.evaluate(()=>RARC3.attemptAllowed('NEW_OGA_M4','run')),false);
 await p.evaluate(()=>RAState.patch('life.world.day',6));assert.equal(await p.evaluate(()=>RARC3.attemptAllowed('NEW_OGA_M4','run')),true);log.checks.push('seeded two failures exhaust one retry, reload retains budget, next day resets');
 await p.evaluate(async()=>{
  RAAdventures.abandon();RAState.patch('life.world.day',10);RANewOga.patch({mission:7,m4Outcome:'walk_in',m5Completed:true,m6Completed:true,m7Completed:true,m8Resolved:false,lastMissionDay:9});RARC3.patch({story:false,action:false});
  RAAdventures.start('NEW_OGA_M8',{from:'rc3-story'});RAAdventures.patchActive({node:'play'});await RAAdventureScene.resume();
 });
 await p.locator('.adv-text').getByText(/lets get paid/).click();await p.locator('#f01-play-frame').waitFor();const f=p.frameLocator('#f01-play-frame');
 await f.getByRole('button',{name:'ANSWER',exact:true}).waitFor({timeout:15000});
 const garage=await p.evaluate(()=>RAF07Play.pending().request.garage);assert.ok(garage.owned.includes('HOOPTIE'));assert.deepEqual(garage.encounter,['HOOPTIE']);await snap('05-carless-m8-play');
 await p.getByRole('button',{name:'Quit PLAY',exact:true}).click();await p.waitForFunction(()=>RAScenes.current()==='bedroom');
 assert.equal((await state()).active.vars.rc4Paused,true);assert.equal((await state()).daily.action,false);assert.equal(await p.evaluate(()=>RAF07Play.pending()),null);log.checks.push('actual carless M8 iframe loads, four-seat request, visible host quit, no settlement');
 // A seeded validated COMPLETE boundary, separately from actual browser PLAY controls above.
 const settlement=await p.evaluate(()=>{const result={status:'COMPLETE',requestId:'b1-browser-fixture'},summary={day:RALife.today().day,errors:[]};const first=RARC3.settlePlay(result,summary),again=RARC3.settlePlay(result,summary);return {first,again,action:RARC3.read().action};});
 assert.deepEqual(settlement,{first:true,again:false,action:true});log.checks.push('seeded settlement contract credits once; canonical real-engine settlement is covered by headless suite');
 await p.evaluate(async()=>{
  RAAdventures.abandon();RAState.patch('life.world.day',20);RAState.patch('life.momentum.fameFired',false);
  RANewOga.patch({mission:11,m1Rewarded:true,m3Rewarded:true,m4Outcome:'walk_in',alternativePending:false,m5Completed:true,m6Completed:true,m7Completed:true,m8Resolved:true,m9Resolved:true,m10Completed:true,finaleBegun:true,finaleDone:true});
  await RAScenes.go('bedroom');
 });
 assert.equal(await p.evaluate(()=>RARC3.claimsEnding()),false);
 const gates=await p.evaluate(()=>{const out=[];for(const d of [21,22,23,24,25,37]){RAState.patch('life.world.day',d);out.push([d,RARC3.claimsEnding()]);}RANewOga.patch({m8Resolved:false});out.push(['incomplete37',RARC3.claimsEnding()]);return out;});
 assert.ok(gates.slice(0,6).every(x=>x[1]===true));assert.equal(gates.at(-1)[1],false);log.endingGates=gates;
 await p.evaluate(async()=>{RANewOga.patch({m8Resolved:true});RAState.patch('life.world.day',21);await RAScenes.go('bedroom');});
 await p.locator('.fame-ending').waitFor();assert.equal((await state()).fired,true);await snap('06-protected-ending-day21');
 log.checks.push('actual protected ending begins Day21; seeded Day21–25/overdue eligibility; incomplete mandatory story blocks fallback');
 log.final=await state();assert.deepEqual(h.errors,[]);log.ok=true;
}catch(e){log.ok=false;log.failure=String(e.stack||e);await snap('failure').catch(()=>{});throw e;
}finally{fs.writeFileSync(`${out}/browser.json`,JSON.stringify(log,null,2)+'\n');await h.close();}
