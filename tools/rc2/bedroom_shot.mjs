import {open} from './harness.mjs';import fs from 'node:fs';
const out=process.argv[2]||'C:/ra/shots/bed';fs.mkdirSync(out,{recursive:true});
const w=+(process.argv[3]||390);
const h=await open({width:w});const {page}=h;await page.waitForTimeout(1200);
await page.evaluate(async()=>{RAState.patch('life.clock.started',true);RALife.setFlag('prologueDone',true);RALife.setFlag('throneDone',true);RALife.setFlag('firstWakeDone',true);RAState.patch('life.phone.learned',true);document.querySelector('#startOverlay').style.display='none';await RAScenes.go('bedroom',{});});
await page.waitForTimeout(1500);await page.screenshot({path:`${out}/bed_${w}.png`});
console.log(h.errors.join('\n')||'no errors');await h.close();
