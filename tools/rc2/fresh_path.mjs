// RC2: fresh save -> START -> A00 -> throne fight -> first wake in the bedroom. Fails if it never reaches the bedroom.
import {open} from './harness.mjs';import fs from 'node:fs';
const out='C:/ra/shots/fresh';fs.mkdirSync(out,{recursive:true});
const h=await open({width:390});const {page}=h;await page.waitForTimeout(1200);await page.click('#startButton');
const clickText=async t=>{for(const e of await page.$$('button')){if(!await e.isVisible())continue;const x=(await e.innerText()).toUpperCase();if(x.includes(t)){await e.click({force:true,timeout:2000}).catch(()=>{});return true}}return false};
let reached=false;
for(let i=0;i<400&&!reached;i++){
 await page.waitForTimeout(700);
 const st=await page.evaluate(()=>({scene:RAScenes.current(),choices:document.querySelectorAll('.adv-choices button').length,started:RALife.life().clock.started,over:!!document.querySelector('.c2-menu [data-c2="done"]')}));
 if(st.scene==='bedroom'&&st.started){reached=true;break;}
 if(st.choices){await page.click('.adv-choices button').catch(()=>{});continue;}
 if(st.scene==='battle'){await clickText('FIGHT');await page.waitForTimeout(250);await clickText('BLOOD');await clickText('STEAL');await clickText('BITE HER');await clickText('YES');await clickText('LET HER FLY');continue;}
 if(st.scene==='character_reveal'){await clickText('YES');await clickText('LET HER FLY');continue;}
 await page.mouse.click(190,430);
 if(i%25===0)await page.screenshot({path:`${out}/s${i}.png`});
}
await page.waitForTimeout(1500);await page.screenshot({path:`${out}/bedroom.png`});
console.log(reached?'REACHED BEDROOM':'DID NOT REACH BEDROOM',h.errors.join('\n')||'no errors');await h.close();
