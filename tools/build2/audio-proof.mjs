import fs from 'node:fs';
import {serve,loadPlaywright} from '../tests/f05/_browser-lib.mjs';
const server=await serve(),{chromium}=loadPlaywright(),browser=await chromium.launch({headless:true,executablePath:process.env.RA_CHROMIUM_PATH});
const page=await browser.newPage({viewport:{width:1040,height:1000}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto(`http://127.0.0.1:${server.address().port}/tools/build2/review.html`);await page.click('#seed');await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('Review save prepared'));await page.click('#armory');
 const f=page.frames().find(x=>x!==page.mainFrame());
 const contracts=await f.evaluate(()=>{const seance=RAAudioManifest.get('MAGIC_SEANCE'),hex=RAAudioManifest.get('MAGIC_HEX');return {badBeats:Object.keys(RAOpenAudio.beats).filter(k=>{const [id,node]=k.split(':');return !RAAdventures.get(id)?.nodes[node];}),badEnvironments:Object.keys(RAOpenAudio.environments).filter(id=>!RAEnvironments.get(id)),pick:seance.selectedFrom,seanceMatch:seance.registered&&seance.selectedFrom==='MAGIC_HEX'&&['file','sourceUrl','license'].every(key=>seance[key]===hex[key])};});
 const original=JSON.parse(fs.readFileSync('work/build2/audio-audit-before.json','utf8')).rows.filter(r=>r.status.includes('HOOK GAP'));
 const current=JSON.parse(fs.readFileSync('docs/evidence/build2/audio-audit.json','utf8'));
 const rows=[];
 for(const r of original){
  const playback=await f.evaluate(async id=>{RAAudio.unlock();RAAudio.setMuted(false);await RAAudio.preload(id);const e=RAAudioManifest.get(id),before=RAAudio.describe().plays[id]||0;const started=RAAudio.oneShot(id);RAAudio.stop(id,0);return {started,starts:(RAAudio.describe().plays[id]||0)-before,files:e.file?[e.file]:(e.parts||[]).map(p=>p.file),reserved:RAOpenAudio.reserved.includes(id),context:RAAudio.describe().context};},r.id);
  rows.push({id:r.id,consumers:current.rows.find(x=>x.id===r.id)?.consumers||[],...playback});
 }
 await page.click('#reserved');const tour=[];for(const id of await f.evaluate(()=>RAOpenAudio.reserved)){const before=await f.evaluate(id=>RAAudio.describe().plays[id]||0,id);await page.click(`[data-reserved="${id}"]`);await page.waitForTimeout(100);tour.push({id,started:await f.evaluate(({id,before})=>(RAAudio.describe().plays[id]||0)>before,{id,before})});}
 const result={originalUnproven:original.length,proven:rows.filter(r=>r.started&&r.starts>0&&r.consumers.length).length,unproven:rows.filter(r=>!r.started||!r.starts||!r.consumers.length),contracts,reservedTour:tour,rows,errors};
 fs.writeFileSync('docs/evidence/build2/audio-proof.json',JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({count:rows.length,proven:result.proven,unproven:result.unproven.map(x=>x.id),contracts,tour,errors}));
 process.exitCode=result.unproven.length||contracts.badBeats.length||contracts.badEnvironments.length||!contracts.seanceMatch||errors.length||tour.some(t=>!t.started)?1:0;
}finally{await browser.close();server.close();}
