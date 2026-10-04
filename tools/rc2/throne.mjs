import {open} from './harness.mjs';import fs from 'node:fs';
const out='C:/ra/shots/throne';fs.mkdirSync(out,{recursive:true});
const h=await open({width:390});const {page}=h;await page.waitForTimeout(1000);
await page.evaluate(async()=>{document.querySelector('#startOverlay').style.display='none';RALife.setFlag('prologueDone',true);await RAScenes.go('battle',{prologue:true});});
await page.waitForTimeout(800);
const names=['FIGHT','BLOOD'];
let n=0;const snap=async t=>{await page.screenshot({path:`${out}/${String(n++).padStart(2,'0')}_${t}.png`});};
await snap('start');
const clickText=async t=>{const els=await page.$$('button');for(const e of els){const x=(await e.innerText()).toUpperCase();if(x.includes(t)&&await e.isVisible()){await e.click({force:true});return true}}return false};
console.log(await clickText('FIGHT'));await page.waitForTimeout(500);await snap('fight');
console.log(await clickText('BLOOD'));
for(let i=0;i<12;i++){await page.waitForTimeout(450);await snap('b'+i);}
console.log(await page.evaluate(()=>JSON.stringify(RACombat.snapshot())));
console.log(h.errors.join('\n')||'no errors');await h.close();
