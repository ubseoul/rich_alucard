// RC3 Build B: production DOM, real pointer/keyboard inputs, 390px Chromium, persistent three-night club run.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {serve,launch} from '../tests/f15/_browser.mjs';
const output=path.resolve(process.argv[2]||'docs/rc3/evidence/build-b');fs.mkdirSync(output,{recursive:true});
const s=await serve(),browser=await launch(),results=[],errors=[];
const ctx=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1});
const p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));
p.on('response',r=>{if(r.status()>=400&&!/favicon/.test(r.url()))errors.push(`${r.status()} ${r.url()}`);});
const check=(ok,name,detail)=>{results.push({ok:!!ok,name,detail});assert(ok,name+': '+JSON.stringify(detail));console.log('PASS '+name);};
const shot=async name=>{await p.waitForTimeout(400);await p.screenshot({path:path.join(output,name+'.png')});};
const stage=p.locator('[aria-label="MAKE IT RAIN"] #stage-canvas');
async function toss(){
 if(await p.evaluate(()=>RAF15Club.current().game().core.ended))await p.getByRole('button',{name:'RUN IT BACK',exact:true}).click();
 const b=await stage.boundingBox(),x=b.x+b.width*.5,y0=b.y+b.height*.92,y1=b.y+b.height*.50,dy=b.height*.30;
 await p.mouse.move(x,y0);await p.mouse.down();await p.mouse.move(x,y1,{steps:10});await p.waitForTimeout(150);
 // Load first, then wait in the lit window: machine speed must not consume the player's release window.
 await p.waitForFunction(()=>{const g=RAF15Club.current().game(),phase=g.debug.clock()%g.tunables.target.spotlightPeriodMs;return phase>20&&phase<150;},null,{polling:10,timeout:10000});
 const aim=await p.evaluate(()=>{const g=RAF15Club.current().game();return (g.core.targetX(g.debug.clock()+30)-.5)/g.tunables.aim.aimSpread;});
 const dx=aim*dy*b.width/b.height;
 await p.mouse.move(x+dx*.5,y1-dy*.5);await p.waitForTimeout(10);await p.mouse.move(x+dx,y1-dy);await p.mouse.up();await p.waitForTimeout(140);
}
async function tapNative(x,y){const b=await p.locator('.ra-minigame canvas').boundingBox();await p.mouse.click(b.x+x*b.width/270,b.y+y*b.height/480);}
async function rhythm(){
 const keys=['ArrowLeft','ArrowDown','ArrowUp','ArrowRight'],start=Date.now();
 while(await p.locator('.ra-minigame-stage').count()){
  const st=await p.locator('.ra-minigame-stage').evaluate(e=>({phase:e.dataset.phase,due:e.dataset.due||''}));
  if(st.phase==='results')break;
  for(const lane of new Set(st.due.split(',').filter(Boolean)))await p.keyboard.press(keys[Number(lane)]);
  assert(Date.now()-start<50000,'rhythm did not complete');await p.waitForTimeout(35);
 }
}
try{
 await p.goto(s.url+'?mute=1');await p.waitForFunction(()=>window.RAF15Club&&window.RAMinigames);
 await p.evaluate(async()=>{RAState.reset();RAState.patch('life.clock.started',true);RALife.setFlag('prologueDone',true);RALife.setFlag('throneDone',true);RALife.setFlag('firstWakeDone',true);document.querySelector('#startOverlay')?.remove();await RAScenes.go('bedroom',{dev:true});RALife.addMoney(500000-RALife.money());});
 for(let day=1;day<=3;day++){
  await p.evaluate(async day=>{RAState.patch('life.world.day',day);await RAStripClub.open();},day);
  await p.waitForFunction(()=>RAF15Club.current()?.status().loaded);await p.waitForTimeout(250);
  await p.locator('[aria-label="MAKE IT RAIN"] [data-budget="25000"]').click();
  const expected=['roxy','rosalyn','emerald'][day-1];
  const before=await p.evaluate(()=>({cash:RALife.money(),spent:RAF15.progress(RAF15Club.current().selected()).spent,encores:RAMinigames.progress('club').encores||0}));
  const state=await p.evaluate(()=>{const c=RAF15Club.current();const sh=document.querySelector('[aria-label="MAKE IT RAIN"]').shadowRoot;return {dancer:c.selected(),onStage:Object.keys(c.geo().boxes),t0:c.game().core.targetX(0),t1:c.game().core.targetX(1200),chips:[...sh.querySelectorAll('.f15-chip')].map(e=>({id:e.dataset.dancer,disabled:e.disabled})),pixel:[...sh.querySelectorAll('.f15-card')].every(e=>e.src.startsWith('data:'))};});
  check(state.dancer===expected&&state.onStage.join()===expected,`club night ${day}: one scheduled dancer`,state);
  check(state.t0!==state.t1&&state.pixel,`club night ${day}: moving collision target and pixel portraits`,state);
  await shot(`club-night-${day}-start`);
  for(let i=0;i<12;i++){await toss();const e=await p.evaluate(()=>RAMinigames.progress('club').encores||0);if(e>before.encores)break;}
  const after=await p.evaluate(()=>({cash:RALife.money(),spent:RAF15.progress(RAF15Club.current().selected()).spent,encores:RAMinigames.progress('club').encores||0,last:RAF15Club.current().lastThrow(),hits:RAF15Club.current().game().core.hits}));
  check(after.cash<before.cash&&after.spent>before.spent&&after.hits>0,`club night ${day}: real paid throws hit and progress`,after);
  check(after.encores>before.encores,`club night ${day}: max hype encore and persistent VIP`,after);
  await shot(`club-night-${day}-encore`);await p.keyboard.press('Escape');
 }
 await p.reload();await p.waitForFunction(()=>window.RAMinigames);check(await p.evaluate(()=>RAMinigames.progress('club').encores>=3),'VIP survives reload');
 await p.evaluate(async()=>{document.querySelector('#startOverlay')?.remove();await RAOgunRave.begin();});
 await p.locator('[data-rave-choice="go-in"]').click();await p.locator('[data-rave-choice="floor"]').click();await p.locator('[data-rave-choice="dance"]').click();
 await p.locator('.ra-minigame-start').click();await p.waitForTimeout(500);await shot('rave-rhythm');
 // A quit must leave a retryable floor phase rather than stranding the night.
 await p.locator('.ra-minigame-quit').click();check(await p.evaluate(()=>RAOgunRave.active().phase==='floor1'),'rave quit preserves retryable progress');
 await p.locator('[data-rave-choice="dance"]').click();await p.locator('.ra-minigame-start').click();await rhythm();
 await p.waitForFunction(()=>RAOgunRave.active()?.phase==='bllad33Enter');await shot('rave-hunter-arrival');
 check(await p.locator('.rave-dialogue').innerText().then(t=>t.includes("oh shit, that's Blad33ee!")),'OL-075 exact reaction');
 await p.waitForSelector('.c2-scene');check(await p.evaluate(()=>RACombat2.active()?.state.enemy.name==='BLAD33EE'),'rave cuts straight into existing hunter fight');await shot('rave-fight');
 // Progress through combat using player actions, including either legitimate outcome.
 const ft=Date.now();
 while(await p.locator('.c2-scene').count()){
  const done=p.locator('[data-c2="done"]');if(await done.count()){await done.click();break;}
  const fight=p.locator('[data-c2="fight"]');if(await fight.count())await fight.click();
  const bite=p.locator('[data-c2="move:bite"]:not(.c2-off)');if(await bite.count())await bite.click();
  else{const blood=p.locator('[data-c2="move:blood"]:not(.c2-off)');if(await blood.count())await blood.click();}
  assert(Date.now()-ft<90000,'hunter fight stalled');await p.waitForTimeout(500);
 }
 await p.waitForSelector('[data-rave-choice="approach"]');await p.locator('[data-rave-choice="approach"]').click();await p.locator('[data-rave-choice="linger"]').click();await p.locator('[data-rave-choice="head-home"]').click();
 await p.waitForFunction(()=>RALife.flag('ogunsRaveCompleted'));check(await p.evaluate(()=>!RAOgunRave.active()&&RALife.flag('castlePartyHostingUnlocked')),'rave completes and unlocks party hosting');
 await p.evaluate(()=>{window.__ramenResult=null;RAMinigames.launch('slurp',{firstShift:true,seed:'rc3-ramen'}).then(r=>window.__ramenResult=r);});
 await p.locator('.ra-minigame-start').click();await p.waitForTimeout(500);await shot('ramen-order');
 const names=[['SHOYU','TONKOTSU','MISO'],['THIN','THICK'],['CHASHU','CHICKEN','SHRIMP'],['EGG','NORI','SCALLION','CORN','JOLLOF']];
 for(let n=0;n<32;n++){
  const st=await p.locator('.ra-minigame-stage').evaluate(e=>({step:Number(e.dataset.step),need:e.dataset.need}));const items=names[st.step],count=st.step===3?5:items.length,cols=count<=3?count:2,w=(254-6*(cols-1))/cols,h=Math.min(74,(216-6*(Math.ceil(count/cols)-1))/Math.ceil(count/cols)),i=Math.max(0,items.indexOf(st.need));
  await tapNative(8+(i%cols)*(w+6)+w/2,226+Math.floor(i/cols)*(h+6)+h/2);await p.waitForTimeout(260);
 }
 await p.getByRole('button',{name:'CLOCK OUT',exact:true}).click();await shot('ramen-shift');await p.locator('.slurp-shift-result button').click();
 check(await p.evaluate(()=>__ramenResult?.data.perfect>2&&__ramenResult.rewards.money>0),'ramen: orders served, receipt and rewards settle');
 check(await p.evaluate(()=>!RAMinigames.list().some(g=>g.id==='pickup'||g.id==='garage')),'retired pickup and garage utility absent from playable roster');
 await p.evaluate(async()=>{RAClock.sleep();await RAPhone.openApp('warRoom');});await p.waitForTimeout(400);
 const accept=p.locator('[data-phone-action="do:warRoom:accept"]');if(await accept.count())await accept.click();
 await p.evaluate(()=>RAPhone.openApp('warRoom','jobs'));await p.waitForSelector('[data-phone-action^="do:warRoom:play:"]');await p.locator('[data-phone-action^="do:warRoom:play:"]').first().click();
 await p.waitForSelector('#f01-play-frame');const f=await (await p.$('#f01-play-frame')).contentFrame();await f.waitForSelector('.b-ans');await shot('play-390-offer');
 check(await f.evaluate(()=>{const r=document.querySelector('.call').getBoundingClientRect(),s=document.querySelector('#stage').getBoundingClientRect();return r.top>=s.top&&r.bottom<=s.bottom;}),'PLAY offer and answer buttons fit the stage');
 await f.locator('.b-ans').click();await f.waitForSelector('.send');await shot('play-390-loadout');
 check(await f.evaluate(()=>{const box=s=>document.querySelector(s).getBoundingClientRect();return box('.pre-top').bottom<box('.hints').top&&[...document.querySelectorAll('.card')].every(c=>c.getBoundingClientRect().bottom<box('.send').top&&c.querySelector('.tr').getBoundingClientRect().bottom<=c.querySelector('.wslot').getBoundingClientRect().top); }),'PLAY loadout labels and controls do not overlap');
 const send=await f.locator('.send').boundingBox();await p.mouse.move(send.x+send.width/2,send.y+send.height/2);await p.mouse.down();await p.waitForTimeout(1600);await p.mouse.up();
 await f.waitForSelector('.phone',{timeout:30000});await f.waitForSelector('.bub',{timeout:30000});await shot('play-390-live');
 check(await f.evaluate(()=>!document.querySelector('.bedwrap .bg')&&document.querySelectorAll('.handpov').length===1),'PLAY single hand compositor');
 check(await f.evaluate(()=>{const h=document.querySelector('.ph-head');return h.scrollWidth<=h.clientWidth+1;}),'PLAY header fits phone');
 const pt=Date.now();
 for(;;){
  const decision=f.locator('.decide');if(await decision.count()){await shot('play-390-decision');const out=decision.locator('[data-id="OUT"]');const bs=decision.locator('button');if(await out.count())await out.click();else if(await bs.count())await bs.first().click();}
  if(await f.locator('.again').count()){await shot('play-390-return');await f.locator('.again').click();break;}
  assert(Date.now()-pt<300000,'PLAY did not settle');await p.waitForTimeout(150);
 }
 await p.waitForFunction(()=>!document.querySelector('#f01-play-frame'));check(await p.evaluate(()=>RAWarRoomPlay.pending()===null&&Object.keys(RAFrag.read('F04','play.consumed',{})).length===1),'390 PLAY canonical result consumed exactly once');
 check(errors.length===0,'no browser errors or missing assets',errors);
}catch(e){results.push({ok:false,name:e.message});console.error(e);await shot('failure').catch(()=>{});process.exitCode=1;}
finally{fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({results,errors},null,2));await browser.close();await s.close();}
