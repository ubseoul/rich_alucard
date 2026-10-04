import {open} from './harness.mjs';
const out=process.argv[2]||'C:/ra/shots';import fs from 'node:fs';fs.mkdirSync(out,{recursive:true});
const h=await open({width:+(process.argv[3]||390)});const {page}=h;
await page.waitForTimeout(1500);await page.screenshot({path:`${out}/00_title.png`});
await page.click('#startButton');
for(let i=1;i<=14;i++){await page.waitForTimeout(1200);await page.screenshot({path:`${out}/${String(i).padStart(2,'0')}_intro.png`});
 const tap=await page.$('#adventureScene');if(tap)await page.mouse.click(190,420);}
console.log(h.errors.join('\n')||'no errors');await h.close();
