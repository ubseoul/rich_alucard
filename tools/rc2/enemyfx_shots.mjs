// RC2: captures mid-animation frames of every enemy move's attack FX in real Combat 2.0.
import {open} from './harness.mjs';import fs from 'node:fs';
const out=process.argv[2]||'C:/ra/shots/efx';fs.mkdirSync(out,{recursive:true});
const only=(process.argv[3]||'').split(',').filter(Boolean);
const h=await open({width:390});const {page}=h;await page.waitForTimeout(1000);
await page.evaluate(()=>{RAState.patch('life.clock.started',true);RALife.setFlag('prologueDone',true);RALife.setFlag('throneDone',true);RALife.setFlag('firstWakeDone',true);document.querySelector('#startOverlay').style.display='none';});
const ids=await page.evaluate(()=>Object.keys(RACombatData.ENEMIES));const results=[];
for(const id of ids){if(only.length&&!only.includes(id))continue;
 await page.evaluate(async id=>{await RAScenes.go('bedroom',{});RACombat2.run(id,{});},id);await page.waitForTimeout(600);
 const moves=await page.evaluate(id=>Object.entries(RACombatData.ENEMIES[id].moves).map(([k,v])=>[k,v.dmg||0]),id);
 for(const [mv] of moves){
  // drive the animation directly through RAEnemyFX so every move is shown regardless of the AI pattern
  for(const f of [1,4,6]){
   const p=page.evaluate(async([id,mv,f])=>RAEnemyFX.attack({root:document.querySelector('.c2-scene'),enemyId:id,moveId:mv,dmg:20,attacker:document.querySelector('.c2-enemy'),target:document.querySelector('.c2-rich'),freeze:f}),[id,mv,f]);
   await page.waitForTimeout(250);await page.screenshot({path:`${out}/${id}__${mv}__f${f}.png`,clip:{x:0,y:60,width:390,height:420}});await p;}
  results.push(`${id}:${mv}`);
 }
 await page.evaluate(()=>RACombat2.active()?.abort());await page.waitForTimeout(300);
}
console.log(results.length,'moves captured');console.log(h.errors.join('\n')||'no errors');await h.close();
