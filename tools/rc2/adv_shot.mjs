// RC2: start any adventure by id/node in a seeded save and screenshot it. usage: adv_shot.mjs ID [node] [out] [width]
import {open} from './harness.mjs';import fs from 'node:fs';
const [id,node,out='C:/ra/shots/adv',width='390']=process.argv.slice(2);fs.mkdirSync(out,{recursive:true});
const h=await open({width:+width});const {page}=h;await page.waitForTimeout(1000);
await page.evaluate(async([id,node])=>{RAState.patch('life.clock.started',true);RALife.setFlag('prologueDone',true);RALife.setFlag('throneDone',true);RALife.setFlag('firstWakeDone',true);document.querySelector('#startOverlay').style.display='none';
 await RAScenes.go('bedroom',{});const r=RAAdventures.start(id,{from:'dev',...(node&&node!=='-'?{node}:{})});await RAScenes.go('adventure',node&&node!=='-'?{node}:{});},[id,node]);
await page.waitForTimeout(2200);await page.screenshot({path:`${out}/${id}_${node||'start'}_${width}.png`});
console.log(await page.evaluate(()=>JSON.stringify({hp:[...document.querySelectorAll('.adv-actor')].map(e=>e.dataset.rc2Hp||0),env:document.querySelector('#adventureScene')?.dataset.env})));console.log(h.errors.join('\n')||'ok');await h.close();
