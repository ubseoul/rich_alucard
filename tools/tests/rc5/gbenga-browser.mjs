import {open} from '../../rc2/harness.mjs';import fs from 'node:fs';
const out='../gbenga-observation-all-moves';fs.mkdirSync(out,{recursive:true});
const h=await open({width:390,height:844,query:'?dev=1&mute=1&ff=F07.m8_and_finale'});const p=h.page;const evidence={kind:'seeded installed Chrome, legal UI combat turns',errors:h.errors,turns:[],frames:[]};
try{
 await p.locator('#startButton').click();await p.waitForFunction(()=>document.querySelector('#startOverlay')?.style.display==='none');
 await p.evaluate(async()=>{RAAdventures.abandon();RAState.patch('life.clock.started',true);RALife.setFlag('throneDone',true);await RAScenes.go('bedroom');document.querySelector('#devPanel')?.remove();RAState.patch('life.combat.equippedMoves',['blood','bite','revenge','ringer']);RAState.patch('life.ownership.items',{steak:20,jollof:1,boba:10});});
 evidence.entry=await p.evaluate(()=>({scene:RAScenes.current(),voice:RAAdventures.get('NEW_OGA_M2').nodes.voice.lines}));
 await p.evaluate(()=>{void RACombat2.run('gbenga',{env:'gbenga_rentals',noPenalty:true});});await p.waitForSelector('.c2-menu');
 // Observe accepted body sources/contact/HUD without changing rules or outcomes.
 await p.evaluate(()=>{window.__OFrames=[];const root=document.querySelector('.c2-scene');const poll=()=>{if(!document.querySelector('.c2-scene'))return;const s=RACombat2.active()?.state,fx=document.querySelector('.rc2-enemy-fx');if(s&&fx)window.__OFrames.push({at:performance.now(),move:root.dataset.lastEnemyFx,frame:fx.dataset.frame,phase:root.dataset.enemyPhase,src:root.querySelector('.c2-enemy')?.getAttribute('src'),hud:root.querySelector('.c2-hp-rich strong')?.textContent,hp:s.rich.hp,stun:s.rich.stun,pp:{...s.rich.pp}});requestAnimationFrame(poll);};poll();});
 for(let i=0;i<28;i++){
  await p.waitForFunction(()=>!!RACombat2.active()&&!RACombat2.active().busy(),null,{timeout:30000});
  const before=await p.evaluate(()=>({turn:RACombat2.active().state.turn,hp:RACombat2.active().state.rich.hp,enemy:RACombat2.active().state.enemy.hp,stun:RACombat2.active().state.rich.stun,pp:{...RACombat2.active().state.rich.pp},intent:RACombat2Rules.intent(RACombat2.active().state),over:RACombat2.active().state.over}));if(before.over)break;
  const action=before.hp<55&&before.intent!=='voice'?'steak':before.pp.bite>0?'bite':before.pp.blood>0?'blood':'boba';await p.locator(`[data-c2="${['steak','boba'].includes(action)?'item':'fight'}"]`).click();await p.locator(`[data-c2="${['steak','boba'].includes(action)?'item:'+action:'move:'+action}"]`).click();
  await p.waitForFunction(()=>!RACombat2.active()?.busy(),null,{timeout:30000});
  const after=await p.evaluate(()=>{const s=RACombat2.active().state;return{hp:s.rich.hp,enemy:s.enemy.hp,stun:s.rich.stun,pp:{...s.rich.pp},log:s.log,over:s.over,telegraph:s.telegraph};});evidence.turns.push({before,action,after});await p.screenshot({path:`${out}/turn-${i}.png`});
 }
 evidence.frames=await p.evaluate(()=>window.__OFrames);
 await p.evaluate(()=>RACombat2.active()?.abort());
 await p.evaluate(async()=>{RAAdventures.abandon();RANewOga.patch({status:'awaiting_interview',mission:1,lastMissionDay:1});await RAAdventureScene.begin('NEW_OGA_M2',{from:'qa'});});
 await p.waitForSelector('#adventureScene');await p.keyboard.press('Enter');await p.waitForTimeout(500);evidence.interview=await p.locator('#adventureScene').innerText();await p.screenshot({path:out+'/interview.png'});evidence.errors=[...h.errors];console.log(JSON.stringify({turns:evidence.turns.length,moves:[...new Set(evidence.frames.map(f=>f.move))],errors:evidence.errors}));
}catch(e){evidence.failure=e.stack;console.error(e.stack);process.exitCode=1;}finally{fs.writeFileSync(`${out}/evidence.json`,JSON.stringify(evidence,null,2));await h.close();}
