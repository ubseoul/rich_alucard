// Focused seeded Chrome fixtures; real pointer/keyboard interaction, no natural campaign claim.
import {open} from '../rc2/harness.mjs';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const out='docs/rc4/evidence/Integration/B4';fs.mkdirSync(out,{recursive:true});
const h=await open({width:390,height:844,query:'?mute=1'}),p=h.page;
const log={platform:'installed Chrome / Playwright',viewport:[390,844],kind:'seeded focused smoke',checks:[],errors:h.errors};
const snap=name=>p.screenshot({path:`${out}/${name}.png`});
async function toss(){
 const b=await p.locator('[aria-label="MAKE IT RAIN"] #stage-canvas').boundingBox(),x=b.x+b.width*.5,y0=b.y+b.height*.92,y1=b.y+b.height*.5,dy=b.height*.3;
 await p.mouse.move(x,y0);await p.mouse.down();await p.mouse.move(x,y1,{steps:10});await p.waitForTimeout(150);
 await p.waitForFunction(()=>{const g=RAF15Club.current().game(),phase=g.debug.clock()%g.tunables.target.spotlightPeriodMs;return phase>20&&phase<150;},null,{polling:10,timeout:10000});
 const aim=await p.evaluate(()=>{const g=RAF15Club.current().game();return (g.core.targetX(g.debug.clock()+30)-.5)/g.tunables.aim.aimSpread;});
 const dx=aim*dy*b.width/b.height;await p.mouse.move(x+dx*.5,y1-dy*.5);await p.waitForTimeout(10);await p.mouse.move(x+dx,y1-dy);await p.mouse.up();await p.waitForTimeout(140);
}
async function load(){await p.reload();await p.locator('#startButton').click();await p.waitForFunction(()=>!!window.RARC3);}
try{
 await p.locator('#startButton').click();await p.waitForFunction(()=>!!window.RARC3);
 await p.evaluate(async()=>{RAAdventures.abandon();RAState.patch('life.clock.started',true);RALife.setFlag('throneDone',true);RALife.setFlag('firstWakeDone',true);RALife.setFlag('ogunsRaveCompleted',true);RAState.patch('life.world.day',1);RAState.patch('life.resources.money',100000);await RAScenes.go('bedroom');await RAStripClub.open();});
 await p.waitForFunction(()=>RAF15Club.current()?.status().loaded);
 await p.keyboard.press('Escape');assert.equal(await p.evaluate(()=>RALife.flag('stripClubFirstVisitDone')),undefined);assert.notEqual(await p.evaluate(()=>RALife.flag('stripClubLastDay')),1);
 await p.evaluate(()=>RAStripClub.open());await p.waitForFunction(()=>RAF15Club.current()?.status().loaded);
 await snap('01-club-mobile-start');
 const before=await p.evaluate(()=>({cash:RALife.money(),support:RAF15.progress('roxy').spent}));
 for(let i=0;i<4;i++){await p.locator('[data-budget="25000"]').click();await toss();if(await p.evaluate(()=>!!RAF06Rainmaker.state().lastReceipt))break;}
 const after=await p.evaluate(()=>({cash:RALife.money(),support:RAF15.progress('roxy').spent,receipt:RAF06Rainmaker.state().lastReceipt,feedback:RAF15Club.current().lastThrow(),geo:RAF15Club.current().geo(),dancer:RAF15Club.current().selected()}));
 const frames=new Set();for(let i=0;i<12;i++){const g=await p.evaluate(()=>RAF15Club.current().geo()),b=g.boxes.roxy;assert.ok(b.x>=0&&b.x+b.w<=g.W&&b.y>=g.hudBottom-1&&b.feet<g.H);frames.add(b.frame);await p.waitForTimeout(250);}assert.ok(frames.size>1);
 assert.ok(after.receipt.thrown>0);assert.equal(after.receipt.paid,after.receipt.thrown/2);assert.equal(before.cash-after.cash,after.receipt.paid);assert.equal(after.support-before.support,after.receipt.paid);assert.equal(after.dancer,'roxy');
 assert.equal(Object.keys(after.geo.boxes).join(),'roxy');assert.equal(await p.evaluate(()=>RAF15Club.current().select('emerald')),false);log.club={before,after};await snap('02-club-mobile-receipt');
 await p.setViewportSize({width:1280,height:900});await p.waitForTimeout(250);await snap('03-club-desktop');
 log.desktop=await p.evaluate(()=>{const c=RAF15Club.current(),sh=document.querySelector('[aria-label="MAKE IT RAIN"]').shadowRoot;return {geo:c.geo(),portrait:sh.querySelector('.f15-card').getBoundingClientRect().toJSON(),controls:sh.querySelector('.player-bar').getBoundingClientRect().toJSON()};});
 await p.keyboard.press('Escape');await p.setViewportSize({width:390,height:844});await load();assert.equal(await p.evaluate(()=>RAStripClub.terms().discount),0);log.checks.push('half-off real throw / exact receipt / actual-paid support / one nightly dancer / no-action quit / reload consumes discount');
 // Date checkpoint at its actual debit: reload must preserve node and single debit.
 await p.evaluate(async()=>{RAAdventures.abandon();RAFrag.patch('F15','dancers.rosalyn',{spent:10000,throws:1});RAState.patch('life.world.day',2);RAAdventures.start('F15_ROSALYN_L1',{from:'phone'});RAAdventures.enter('split');await RAAdventureScene.resume();});
 const date=await p.evaluate(()=>({cash:RALife.money(),active:RAAdventures.active(),paid:RAFrag.get('F15')}));await snap('04-date-before-reload');await load();assert.equal(await p.evaluate(()=>RAAdventures.active().id),'F15_ROSALYN_L1');await p.evaluate(()=>RAAdventureScene.resume());assert.equal(await p.evaluate(()=>RALife.money()),date.cash);await snap('05-date-reload');
 assert.equal(await p.evaluate(()=>!!RAAdventures.start('F15_ROXY_L1',{from:'phone'})),false);log.checks.push('Rosalyn actual split debit / reload checkpoint / no second debit / no concurrent date');
 await p.evaluate(async()=>{RAAdventures.abandon();await RAScenes.go('bedroom');RACombat2.run('f15_roxy_spar',{spar:true,noPenalty:true,env:'f15_gym'});});
 assert.equal(await p.locator('[data-c2="gun"]').count(),0);await snap('06-spar-controls');
 for(let i=0;i<15&&await p.locator('[data-c2="spar:jab"]').count();i++){await p.locator('[data-c2="spar:jab"]').click();await p.waitForFunction(()=>!RACombat2.active()?.busy());if(await p.locator('[data-c2="done"]').count())break;}
 await p.locator('[data-c2="done"]').waitFor();const spar=await p.evaluate(()=>RACombat2.active().state);assert.ok(spar.rich.hp>=1&&spar.enemy.hp>=1);assert.ok(spar.rich.hp===1||spar.enemy.hp===1);log.spar=spar.sparScore;await snap('07-spar-result');await p.locator('[data-c2="done"]').click();
 await p.evaluate(()=>{RAMinigames.launch('range_day',{gunId:'lil_oga'});});await p.locator('.ra-minigame-start').click();await p.waitForTimeout(400);
 for(let i=0;i<4;i++)await p.locator('.rd-lane').nth(0).click();await p.waitForTimeout(2400);assert.match(await p.locator('.rd-ammo').innerText(),/AMMO 4/);await p.locator('.rd-lane').nth(1).click();assert.match(await p.locator('.rd-ammo').innerText(),/AMMO 3/);await snap('08-range-reloaded');
 await p.locator('.rd-result').waitFor({timeout:60000});await snap('09-range-result');await p.getByRole('button',{name:'RETURN TO ARMORY',exact:true}).click();assert.equal(await p.evaluate(()=>RAPhone.page()),'app:armory');await p.evaluate(()=>{RAPhone.close();RAMinigames.launch('range_day',{gunId:'lil_oga'});});await p.locator('.rd-lanes').waitFor();await p.getByRole('button',{name:'Quit minigame'}).click();assert.equal(await p.evaluate(()=>RALife.flag('rc4Attempts').failures['range_day:range']),1);log.checks.push('nonlethal spar boxing-only controls / first-to-five 1HP result / Range reload and firing / real timed result / return to Armory / second attempt / quit preserves remaining retry');
 await p.evaluate(()=>{RAMinigames.launch('slurp',{firstShift:true});});await p.locator('.ra-minigame-start').click();await p.waitForTimeout(400);
 for(let i=0;i<4;i++)await p.keyboard.press('1');await snap('10-ramen-interaction');await p.getByRole('button',{name:'CLOCK OUT',exact:true}).click();await p.locator('.slurp-shift-result').waitFor();assert.match(await p.locator('.slurp-shift-result').innerText(),/SERVED 1/);await snap('11-ramen-receipt');await p.getByRole('button',{name:'DONE',exact:true}).click();
 await p.evaluate(()=>{RAMinigames.launch('dance',{rave:true,notes:8,bpm:126,moodStart:70});});await p.locator('.ra-minigame-start').click();
 const keys=['a','s','d','f'],start=Date.now();while(await p.locator('.ra-minigame-stage').count()){
 const st=await p.locator('.ra-minigame-stage').evaluate(e=>({phase:e.dataset.phase,due:e.dataset.due||''}));if(st.phase==='results')break;for(const n of new Set(st.due.split(',').filter(Boolean)))await p.keyboard.press(keys[Number(n)]);assert.ok(Date.now()-start<20000);await p.waitForTimeout(35);
 }await snap('12-rave-result');await p.getByRole('button',{name:'CONTINUE RAVE',exact:true}).click();log.checks.push('ramen keyboard builds and serves bowl / clear receipt / rave timed matching inputs and acknowledged result');
 assert.deepEqual(h.errors,[]);log.ok=true;
}catch(e){log.ok=false;log.failure=String(e.stack||e);await snap('failure').catch(()=>{});throw e;}finally{fs.writeFileSync(`${out}/browser.json`,JSON.stringify(log,null,2)+'\n');await h.close();}
