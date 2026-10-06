// Real Chrome UI checks. Day/cash/story checkpoints are deliberately seeded;
// this is not a natural campaign or a packaged acceptance playthrough.
import {open} from '../rc2/harness.mjs';
import fs from 'node:fs';import assert from 'node:assert/strict';
const out='docs/rc4/evidence/Integration/B2';fs.mkdirSync(out,{recursive:true});
const h=await open({width:390,height:844,query:'?mute=1'}),p=h.page;
const log={kind:'seeded targeted Chrome fixtures',viewport:[390,844],checks:[],errors:h.errors};
const snap=async name=>{await p.waitForTimeout(650);await p.screenshot({path:`${out}/${name}.png`});};
const start=async()=>{await p.waitForFunction(()=>document.readyState==='complete'&&!!window.RARC3);await p.locator('#startButton').click();await p.waitForTimeout(700);};
const click=async action=>{await p.waitForTimeout(350);await p.locator(`[data-phone-action="${action}"]`).click();};
async function advanceUntil(predicate,{choice=null,limit=100}={}){
 for(let i=0;i<limit;i++){
  if(await p.evaluate(predicate))return;
  const choices=p.locator('.adv-choice:visible');
  if(await choices.count()){
   const preferred=choice?choices.filter({hasText:choice}):choices;
   await (await preferred.count()?preferred.first():choices.first()).click();
  }else if(await p.locator('.adv-title:visible').count())await p.locator('.adv-title:visible').click();
  else if(await p.locator('.adv-text:visible').count())await p.locator('.adv-text:visible').click();
  else if(await p.locator('.adv-bubble:visible').count())await p.locator('.adv-bubble:visible').click();
  else if(await p.getByRole('button',{name:'Quit minigame'}).count())throw new Error('unexpected activity before target');
  await p.waitForTimeout(180);
 }
 throw new Error('adventure UI did not reach target');
}
try{
 await start();await p.evaluate(async()=>{
  RAAdventures.abandon();RALife.setFlag('throneDone',true);RALife.setFlag('ogunsRaveCompleted',true);
  RAState.patch('life.clock.started',true);RAState.patch('life.world.day',3);await RAScenes.go('bedroom');
  RARC3.patch({story:true,action:true,paid:false,earnedIncome:0});RALife.addMoney(7000);RALife.spend(6000);RAPhone.openApp('bank');
 });
 await snap('01-earned-spent');await p.evaluate(()=>RARC3.claimCash());
 assert.equal(await p.evaluate(()=>RARC3.read().cash),21000);const cash=await p.evaluate(()=>RALife.money());
 await p.reload();await start();assert.equal(await p.evaluate(()=>RARC3.claimCash()),false);assert.equal(await p.evaluate(()=>RALife.money()),cash);
 log.checks.push('earn 7000/spend 6000/supplement 21000; reload does not repeat receipt');
 await p.evaluate(()=>{RAState.patch('life.resources.money',100000);RAPhone.openApp('bank');});
 await click('app:jdmImports');await snap('02-jdm-listings');await click('do:cars:buy:s15');
 assert.equal(await p.evaluate(()=>RALife.money()),62000);assert.equal(await p.evaluate(()=>RALife.flag('tougeCar')),'nissan_silvia_s15');
 await p.evaluate(()=>RAPhone.api.go('home'));await p.reload();await start();
 await p.evaluate(()=>RAPhone.openApp('jdmImports'));await p.locator('[data-phone-action="do:cars:drive"]').scrollIntoViewIfNeeded();await snap('03-owned-selected-garage');
 assert.equal(await p.evaluate(()=>RALife.ownedCars().length),1);
 await click('do:cars:drive');await p.locator('[data-minigame="touge"]').waitFor();await snap('04-s15-drive');
 await p.getByRole('button',{name:'Quit minigame'}).click();await p.waitForFunction(()=>RAScenes.current()==='bedroom');
 await p.evaluate(()=>{RAVehicles.tribute('nissan_silvia_s15');RAPhone.openApp('jdmImports');});await snap('05-tributed-garage');
 assert.equal(await p.locator('[data-phone-action="do:cars:drive"]').count(),0);
 log.checks.push('UI listing -> S15 buy/debit -> garage selected -> reload -> real Touge -> quit -> tribute blocks selection');
 await p.evaluate(()=>{RAState.patch('life.resources.money',100000);RAPhone.openApp('jdmImports');});
 await p.locator('[data-jdm-action="begin"]').click();await p.locator('[data-jdm-action="meet"]').waitFor();await snap('15-supra-dock');
 await p.locator('[data-jdm-action="leave"]').click();await p.waitForFunction(()=>RAScenes.current()==='bedroom');
 await p.reload();await start();await p.evaluate(()=>RAPhone.openApp('jdmImports'));await p.locator('[data-jdm-action="resume"]').click();
 await p.locator('[data-jdm-action="meet"]').waitFor();
 // Labelled defeated-importer boundary: combat is not replayed in this lane smoke.
 await p.evaluate(()=>RAJDMImports.ownerDefeated());await p.locator('[data-jdm-action="leaveDaughter"]').click();
 await p.locator('[data-jdm-action="finishPayoff"]').waitFor();assert.equal(await p.evaluate(()=>RALife.money()),22000);
 await p.evaluate(()=>RAJDMImports.completeAcquisition());assert.equal(await p.evaluate(()=>RALife.money()),22000);
 await snap('16-supra-owned-payoff');await p.locator('[data-jdm-action="finishPayoff"]').click();
 await p.reload();await start();assert.equal(await p.evaluate(()=>RALife.ownedCars().some(c=>c.id===RACars.SUPRA)),true);
 log.checks.push('Supra actual listing/dock/pause/reload/resume; seeded defeated-importer boundary; authored leave-alone/purchase/payoff; $78K debit once/reload');
 await p.evaluate(async()=>{await RAPhone.close();RAState.patch('life.world.day',4);RALife.setFlag('rc4Maps',{unlocked:{A43:2},lastDay:2});RARC3.releaseMap();RAPhone.openApp('maps');});
 assert.equal(await p.locator('[data-phone-action^="rc3:map:"]').count(),2);await snap('06-maps-day4');
 await p.evaluate(()=>{RAState.patch('life.world.day',5);RARC3.releaseMap();});assert.equal(await p.evaluate(()=>Object.keys(RALife.flag('rc4Maps').unlocked).length),2);
 assert.equal(await p.evaluate(()=>RAAdventures.available('A54')),false);
 // Seed released final, then use its actual completion boundary and delayed follow-up.
 const follow=await p.evaluate(()=>{
  RALife.setFlag('rc4Maps',{unlocked:{A54:2},lastDay:5});RALife.setFlag('jollofWarsWins',0);const before=RAAdventures.available('A54');
  RALife.setFlag('jollofWarsWins',1);const eligible=RAAdventures.start('A54',{from:'rc3-maps'});RAAdventures.enter('win');RAAdventures.complete('win');
  const early=RAAdventures.available('A56');RAState.patch('life.world.day',7);RALife.setFlag('rc4Maps',{unlocked:Object.fromEntries(RARC3.maps.filter(id=>id!=='A56').map(id=>[id,2])),lastDay:5});RARC3.releaseMap();return {before,eligible:!!eligible,early,later:RAAdventures.available('A56')};
 });assert.deepEqual(follow,{before:false,eligible:true,early:false,later:true});
 await p.evaluate(()=>RAPhone.openApp('maps'));await snap('07-followup-ready');log.checks.push('Maps two-day cadence, authored final prerequisite, completed-win follow-up released later (seeded final boundary)');
 // Late-state Hall fixture, then all authored planning/party return through UI.
 await p.evaluate(async()=>{await RAPhone.close();RAAdventures.abandon();RAState.patch('life.world.day',17);RAState.patch('life.resources.money',255000);await RAScenes.go('bedroom');RAPhone.openApp('bank');});
 await snap('08-hall-purchase');await click('do:bank:hall');assert.equal(await p.evaluate(()=>RALife.money()),5000);
 assert.equal(await p.evaluate(()=>RACastle.buy('party_hall')),false);await snap('09-hall-owned');
 await p.evaluate(()=>{const d=RAMinigames.get('dance'),mount=d.mount;d.mount=(root,ctx)=>{window.b2DanceFinish=ctx.finish;return mount(root,ctx);};});
 await click('do:bank:party');await advanceUntil(()=>RAAdventures.active()?.node==='song',{choice:/THAT'S THE LIST/});
 await advanceUntil(()=>RAAdventures.active()?.node==='drinks',{choice:/NO MUSIC/});
 await advanceUntil(()=>RAAdventures.active()?.node==='door',{choice:/BEER AND VIBES/});
 assert.equal(await p.evaluate(()=>RALife.money()),4500);
 await advanceUntil(()=>RAAdventures.active()?.node==='theme',{choice:/TUNDE/});
 await advanceUntil(()=>RAAdventures.active()?.node==='surface',{choice:/NORMAL/});await snap('10-castle-party-night');
 await advanceUntil(()=>RAAdventures.active()?.node==='behavior');
 await advanceUntil(()=>!!document.querySelector('[data-minigame="dance"]'));
 await snap('11-party-dance');
 // A labelled successful dance fixture isolates the story return from input-score skill.
 if(await p.locator('.ra-minigame-start').count())await p.locator('.ra-minigame-start').click();
 await p.waitForFunction(()=>!!window.b2DanceFinish);await p.evaluate(()=>b2DanceFinish({outcome:'win',score:2}));
 await advanceUntil(()=>RAScenes.current()==='bedroom',{choice:/LET IT GO/});await snap('12-party-return');
 assert.equal(await p.evaluate(()=>RALife.flag('partyNight')),17);assert.equal(await p.evaluate(()=>RAAdventures.isDone('A26')),true);
 await p.reload();await start();assert.equal(await p.evaluate(()=>RALife.hasRoom('party_hall')),true);
 assert.equal(await p.evaluate(()=>RARC3.partyGo()),false);log.checks.push('late seeded Hall $255K -> purchase $250K once -> owned access -> authored $500 bar/party art -> seeded dance success -> return/reload/day gate');
 await p.setViewportSize({width:1280,height:900});await p.evaluate(()=>RAPhone.openApp('bank'));await snap('13-desktop-bank');
 await click('app:jdmImports');await snap('14-desktop-garage');log.desktop=[1280,900];
 assert.deepEqual(h.errors,[]);log.ok=true;
}catch(e){log.ok=false;log.failure=String(e.stack||e);await snap('failure').catch(()=>{});throw e;}
finally{fs.writeFileSync(`${out}/browser.json`,JSON.stringify(log,null,2)+'\n');await h.close();}
