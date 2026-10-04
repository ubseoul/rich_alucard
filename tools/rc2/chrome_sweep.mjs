// RC2: finds scenes where combat chrome (HUD / battle panel / throne room backdrop) is exposed outside combat.
import {open} from './harness.mjs';import fs from 'node:fs';
const out=process.argv[2]||'C:/ra/shots/chrome';fs.mkdirSync(out,{recursive:true});
const widths=(process.argv[3]||'390').split(',').map(Number);
const SCENES=[['adventure',{}],['bedroom',{}],['character_reveal',{}],['property-la-4p-exterior',{}],['property-la-4p-interior',{}],['ogun-rave',{}],['ogun-rave-exterior',{}],['stargazing',{}],['battle',{}]];
for(const w of widths){
 const h=await open({width:w});const {page}=h;await page.waitForTimeout(1000);
 await page.evaluate(()=>{RAState.patch('life.clock.started',true);RALife.setFlag('prologueDone',true);RALife.setFlag('throneDone',true);RALife.setFlag('firstWakeDone',true);RAState.patch('life.phone.learned',true);document.querySelector('#startOverlay').style.display='none';});
 for(const [id,payload] of SCENES){
  const r=await page.evaluate(async([id,payload])=>{try{if(id==='adventure'){RAAdventures.start('A02',{from:'dev'})}await Promise.race([RAScenes.go(id,payload),new Promise(r=>setTimeout(r,2500))]);}catch(e){return {id,err:String(e)}}
   await new Promise(r=>setTimeout(r,700));
   const vis=sel=>{const e=document.querySelector(sel);if(!e)return null;const cs=getComputedStyle(e),b=e.getBoundingClientRect();if(cs.display==='none'||cs.visibility==='hidden'||+cs.opacity<.05||b.width<4)return false;
     // exposed if topmost element at centre is the element (or inside it)
     const pts=[[.5,.5],[.2,.5],[.8,.5],[.5,.2],[.5,.8]];let hit=0;for(const [px,py] of pts){const t=document.elementFromPoint(b.left+b.width*px,b.top+b.height*py);if(t&&(e===t||e.contains(t)))hit++;}return hit;};
   return {id,scene:RAScenes.current(),hud:vis('.combat-hud'),battleUI:vis('#battleUI'),room:vis('.room'),ceo:vis('#productionCEO'),body:document.body.className};},[id,payload]);
  await page.screenshot({path:`${out}/${w}_${id}.png`});console.log(w,JSON.stringify(r));
 }
 console.log(h.errors.join('\n')||'no errors');await h.close();
}
