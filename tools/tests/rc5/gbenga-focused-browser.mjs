import {open} from '../../rc2/harness.mjs';import fs from 'node:fs';import assert from 'node:assert/strict';
const out='../gbenga-focused-browser';fs.mkdirSync(out,{recursive:true});const evidence=[];
for(const [width,height] of [[360,740],[390,844],[430,932],[1280,900]]){
 const h=await open({width,height,query:'?dev=1&mute=1&ff=F07.m8_and_finale'}),p=h.page;const row={width,height,kind:'seeded real Chrome legal UI turns; read-only instrumentation',errors:h.errors};
 try{
  await p.locator('#startButton').click();await p.waitForFunction(()=>document.querySelector('#startOverlay')?.style.display==='none');await p.evaluate(async()=>{RAAdventures.abandon();RAState.patch('life.clock.started',true);await RAScenes.go('bedroom');document.querySelector('#devPanel')?.remove();RAState.patch('life.combat.equippedMoves',['blood','bite','revenge','ringer']);});
  await p.evaluate(()=>{void RACombat2.run('gbenga',{env:'gbenga_rentals',noPenalty:true});});await p.waitForFunction(()=>!!RACombat2.active());
  const turn=async id=>{await p.locator('[data-c2="fight"]').tap();await p.locator(`[data-c2="move:${id}"]`).tap();await p.waitForFunction(()=>!RACombat2.active()?.busy(),null,{timeout:30000});return p.evaluate(()=>{const s=RACombat2.active().state;return{hp:s.rich.hp,enemy:s.enemy.hp,pp:{...s.rich.pp},stun:s.rich.stun,log:s.log};});};
  row.sweep=await turn('bite');row.revenge=await turn('revenge');assert(row.revenge.log.some(l=>l.text==='THE VOICE NOTE IS INTERRUPTED.'));assert.equal(row.revenge.stun,0);assert.equal(row.revenge.pp.revenge,7);
  await p.screenshot({path:`${out}/${width}-revenge-interrupt.png`});
  // Actual next fight; abort presentation before frame5, then verify a replacement has no old root/FX owner.
  await p.evaluate(()=>RACombat2.active().abort());await p.evaluate(()=>{void RACombat2.run('gbenga',{env:'gbenga_rentals',noPenalty:true});});
  await p.locator('[data-c2="fight"]').click();await p.locator('[data-c2="move:bite"]').click();await p.waitForFunction(()=>document.querySelector('.c2-scene')?.dataset.enemyPhase==='anticipation',null,{polling:5,timeout:10000});
  row.cancel=await p.evaluate(()=>{const root=document.querySelector('.c2-scene'),actor=root.querySelector('.c2-enemy');window.__oldGbengaRoot=root;RACombat2.active().abort();return{oldRootConnected:root.isConnected,fxCount:root.querySelectorAll('.rc2-enemy-fx').length,movePose:actor.dataset.movePose||null};});
  await p.evaluate(()=>{void RACombat2.run('gbenga',{env:'gbenga_rentals',noPenalty:true});});await p.waitForTimeout(850);row.replacement=await p.evaluate(()=>({count:document.querySelectorAll('.c2-scene').length,fx:document.querySelectorAll('.rc2-enemy-fx').length,oldConnected:window.__oldGbengaRoot.isConnected,hp:RACombat2.active().state.rich.hp}));assert.equal(row.replacement.count,1);assert.equal(row.replacement.fx,0);assert.equal(row.replacement.hp,100);
  await p.screenshot({path:`${out}/${width}-replacement-clean.png`});await p.evaluate(()=>RACombat2.active().abort());
  assert.equal(h.errors.length,0);row.passed=true;console.log('PASS Gbenga focused '+width);
 }catch(e){row.failure=e.stack;console.error(e.stack);process.exitCode=1;}finally{evidence.push(row);await h.close();fs.writeFileSync(`${out}/evidence.json`,JSON.stringify(evidence,null,2));}
}
