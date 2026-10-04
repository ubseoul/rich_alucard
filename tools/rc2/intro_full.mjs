import {open} from './harness.mjs';import fs from 'node:fs';
const out=process.argv[2]||'C:/ra/shots/full';fs.mkdirSync(out,{recursive:true});
const h=await open({width:+(process.argv[3]||390)});const {page}=h;const log=[];
await page.waitForTimeout(1200);await page.click('#startButton');
let i=0;
for(;i<120;i++){
 await page.waitForTimeout(900);
 const st=await page.evaluate(()=>({scene:window.RAScenes?.current?.(),body:document.body.className,adv:!!document.querySelector('#adventureScene'),
  battleUiVisible:(()=>{const e=document.querySelector('#battleUI');if(!e)return null;const r=e.getBoundingClientRect(),cs=getComputedStyle(e);return cs.display!=='none'&&cs.visibility!=='hidden'&&r.height>0&&+cs.opacity>0.2;})(),
  text:(document.querySelector('.adv-text')||{}).textContent||'',choices:[...document.querySelectorAll('.adv-choices button')].map(b=>b.textContent)}));
 log.push(i+' '+JSON.stringify(st));
 if(i%3===0)await page.screenshot({path:`${out}/${String(i).padStart(3,'0')}.png`});
 if(st.choices.length){await page.click('.adv-choices button');continue;}
 const btn=await page.$('#choiceOverlay.show button, .wake-mail button, .bedroom-mail button');
 await page.mouse.click(190,430);
 if(st.scene==='bedroom'&&i>40)break;
}
fs.writeFileSync(`${out}/log.txt`,log.join('\n'));console.log(h.errors.join('\n')||'no errors');await h.close();
