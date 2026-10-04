// OL-067 evidence: the F15 lineup with stage cards + the Gbenga dining room, night flight and cockroach boss in their real scenes, at 390.
import {serve,launch,open,enterClub} from '../tests/f15/_browser.mjs';import fs from 'node:fs';
const out=process.argv[2]||'docs/evidence/rc2/feel';fs.mkdirSync(out,{recursive:true});
const s=await serve(),browser=await launch();const {page,errors,failed}=await open(browser,s.url,{width:390,height:844,dpr:1});
const log=[];
// 1. lineup
await enterClub(page);await page.waitForTimeout(1500);await page.addStyleTag({content:'#devPanel,.dev-panel{display:none!important}'});await page.screenshot({path:`${out}/01_f15_lineup_stagecards_390.png`});
log.push(await page.evaluate(()=>{const sh=document.querySelector('[role="dialog"]').shadowRoot;return [...sh.querySelectorAll('.f15-card')].map(i=>i.src.split('/').slice(-1)[0]+':'+i.naturalWidth+'x'+i.naturalHeight);}));
await page.evaluate(async()=>{RACombat2?.active()?.abort?.();});
// helper to show an adventure node in a seeded life
async function scene(id,node,file,wait=2500){
 await page.reload();await page.waitForFunction(()=>window.RAF15&&window.RAPhone);
 await page.evaluate(async([id,node])=>{RAState.reset();RAState.patch('life.clock.started',true);RALife.setFlag('prologueDone',true);RALife.setFlag('throneDone',true);RALife.setFlag('firstWakeDone',true);document.querySelector('#startOverlay').style.display='none';await RAScenes.go('bedroom',{});
  try{RAAdventures.get(id)?.testSetup?.(window);const recs={...RAState.get().life.adventures.records};for(const k of Object.keys(recs))if(recs[k]?.completedDay===RALife.today().day)recs[k]={...recs[k],completedDay:0};RAState.patch('life.adventures.records',recs);}catch(e){}const r=RAAdventures.start(id,{from:'dev',...(node?{node}:{})});await RAScenes.go('adventure',node?{node}:{});return !!r;},[id,node]);
 await page.addStyleTag({content:'#devPanel,.dev-panel{display:none!important}'});await page.waitForTimeout(wait);await page.mouse.click(195,300);await page.waitForTimeout(900);await page.screenshot({path:`${out}/${file}`});
 return page.evaluate(()=>({env:document.querySelector('#adventureScene')?.dataset.env,active:RAAdventures.active()?.id,node:RAAdventures.active()?.node,actors:[...document.querySelectorAll('.adv-actor')].map(e=>e.dataset.actor+':'+(e.dataset.rc2Src||e.src||'canvas').split('/').slice(-1)[0])}));
}
console.log(JSON.stringify(await scene(process.argv[3]||'NEW_OGA_M7',null,'02_gbenga_dining_390.png')));
console.log(JSON.stringify(await scene(process.argv[4]||'-',process.argv[5]||null,'03_night_flight_390.png')));
console.log(JSON.stringify(await scene(process.argv[6]||'-',process.argv[7]||null,'04_cockroach_390.png')));
console.log(JSON.stringify(log));console.log('errors',errors.length,errors.slice(0,3),'failed',failed.length,failed.slice(0,3));
await browser.close();await s.close();
