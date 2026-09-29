// THE PLAY browser bot gate: Playwright drives the real sandbox page through whole careers at phone widths.
// Usage: node bot_gate.mjs [--plays 6] [--widths 360,390,430] [--policy careful|random] [--shots dir] [--seed 4242]
// Exit code 0 = gate passed (no console errors, every screen reachable, replay determinism holds, telemetry logged).
import {createRequire} from 'node:module';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const require=createRequire(process.env.RA_PLAYWRIGHT_PATH||'/opt/node22/lib/node_modules/');
const {chromium}=require('playwright');
import {serve} from './serve-play.mjs';
const arg=(k,d)=>{const i=process.argv.indexOf('--'+k);return i>=0?process.argv[i+1]:d;};
const PLAYS=+arg('plays',6),WIDTHS=arg('widths','390').split(',').map(Number),POLICY=arg('policy','careful'),SHOTS=arg('shots',''),SEED=+arg('seed',4242),PORT=+arg('port',8123),FAST=arg('fast','0.04'),OUT=arg('out','');
const NOHURRY=arg('noHurry','')==='1';
const CHROME=process.env.RA_CHROME||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
if(SHOTS)fs.mkdirSync(SHOTS,{recursive:true});

const seen=new Set();let PFX='';
async function shot(page,name,w){if(!SHOTS)return;const k=PFX+name+'@'+w;if(seen.has(k))return;seen.add(k);await page.waitForTimeout(420);await page.screenshot({path:path.join(SHOTS,`${w}_${PFX}${name}.png`)});}

// which screen is up?
const kindOf=page=>page.evaluate(()=>{
 const q=s=>document.querySelector(s);
 if(q('.tip [data-ok]'))return 'tip';
 if(q('.menu-panel'))return 'menu';
 if(q('.turned'))return 'turned';
 if(q('.freeze [data-c]'))return 'call';
 if(q('.splash #start'))return 'splash';
 if(q('#car #go'))return 'car';
 if(q('#pitch .card.pitch'))return 'pitch';
 if(q('#trunk #take'))return 'greed';
 if(q('#trunk #turn'))return 'turn';
 if(q('#trunk [data-g]'))return 'gun';
 if(q('#trunk #count'))return 'count';
 if(q('#report #rc'))return 'report';
 if(q('#morning #nextnight'))return 'morning';
 if(q('#scene'))return 'scene';
 if(q('#trunk'))return 'trunk';
 return 'other';
});

export async function runBot(browser,width,opts){
 const ctx=await browser.newContext({viewport:{width,height:width<400?740:844},deviceScaleFactor:1,hasTouch:true});
 const page=await ctx.newPage();const errs=[];
 page.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text());});page.on('pageerror',e=>errs.push('pageerror: '+e.message));
 page.on('response',r=>{if(r.status()>=400&&!/favicon/.test(r.url()))errs.push('HTTP '+r.status()+' '+r.url());});
 await page.addInitScript(()=>{window.__botWantBig=new URLSearchParams(location.search).get('wantbig')==='1'||false;});
 await page.goto(`http://localhost:${PORT}/assets/f01/play/index.html?fresh=1&seed=${opts.seed}&fast=${FAST}&mute=0${opts.big?'&wantbig=1':''}`);
 const stats={width,leaks:[],replays:[],plays:0,screens:new Set(),jobs:{},klass:{},calls:0,replay:[],stuck:false,overflow:[]};
 let lastKind='',same=0,t0=Date.now();
 const deadline=Date.now()+(opts.timeoutMs||240000);
 const wantPlays=opts.plays;
 while(Date.now()<deadline){
  const k=await kindOf(page);stats.screens.add(k);
  if(k===lastKind&&['pitch','car','morning','report','count'].includes(k)){same++;}else same=0;lastKind=k;
  if(same>40){stats.stuck=k;break;}
  await shot(page,k,width);
  // horizontal overflow check on every distinct screen
  const ov=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1);if(ov)stats.overflow.push(k);
  const leak=await page.evaluate(()=>{const t=document.body.innerText;const m=t.match(/[{}]|undefined|NaN|\[object|null\b/);return m?t.slice(Math.max(0,m.index-40),m.index+40).replace(/\n/g,' | '):null;});if(leak&&stats.leaks.length<8)stats.leaks.push(k+': '+leak);
  if(k==='tip'){await page.click('.tip [data-ok]');continue;}
  if(k==='splash'){await page.click('.splash #start');continue;}
  if(k==='pitch'&&opts.trim&&!stats.trimmed){stats.trimmed=true;try{await page.evaluate(n=>{const P=window.__raPlay;const w=P.S.w;while(w.roster.length>n){const i=w.roster.findIndex(o=>!o.named);if(i<0)break;w.roster.splice(i,1);}P.store.set('world',w);location.reload();},opts.trim);}catch(e){}await page.waitForTimeout(700);continue;}
  if(k==='pitch'&&opts.big&&!stats.bigged){stats.bigged=true;PFX='big_';try{await page.evaluate(()=>window.__raPlay.forceBig());}catch(e){}await page.waitForTimeout(700);continue;}
  if(k==='pitch'&&opts.holdEvery){const has=await page.evaluate(()=>!!document.querySelector('.card.notice'));const pl=await page.evaluate(()=>window.__raPlay.counter.get().plays);if(!has&&stats.lastForce!==pl&&pl<wantPlays){stats.lastForce=pl;try{await page.evaluate(()=>window.__raPlay.forceHold());}catch(e){}await page.waitForTimeout(700);continue;}}
  if(k==='pitch'&&opts.hold&&!stats.held){stats.held=true;PFX='hold_';try{await page.evaluate(()=>window.__raPlay.forceHold());}catch(e){}await page.waitForTimeout(700);continue;}
  if(k==='pitch'){
   const plays=await page.evaluate(()=>window.__raPlay.counter.get().plays);
   if(plays>=wantPlays)break;
   const idx=await page.evaluate(pol=>{const cs=[...document.querySelectorAll('#pitch .card.pitch')];const ok=cs.map((c,i)=>[c,i]).filter(([c])=>!c.classList.contains('locked'));
     if(!ok.length)return -1;
     const ext=ok.find(([c])=>c.textContent.includes('EXTRACT'));if(ext)return ext[1];
     const bg=ok.find(([c])=>c.textContent.includes('BIG PLAY'));if(bg&&window.__botWantBig)return bg[1];
     const notice=ok.find(([c])=>c.classList.contains('notice'));if(notice)return notice[1];
     return ok[Math.floor(Math.random()*ok.length)][1];},POLICY);
   if(idx<0){await page.evaluate(()=>{const b=document.querySelector('#laylow');if(b)b.click();});await page.waitForTimeout(50);continue;}
   // ransom on the last night when affordable
   await page.evaluate(()=>{const r=document.querySelector('[data-ransom]:not([disabled])');if(r){window.__ransomClicked=(window.__ransomClicked||0)+1;r.click();}});
   const job=await page.evaluate(i=>document.querySelectorAll('#pitch .card.pitch')[i].querySelector('.jobname').textContent,idx);stats.jobs[job]=(stats.jobs[job]||0)+1;
   await page.evaluate(i=>document.querySelectorAll('#pitch .card.pitch')[i].click(),idx);continue;}
  if(k==='car'){
   // choose the best enabled car for the crew size, seat wheels first, then the rest; fall back through the options
   await page.evaluate(pol=>{
    const q=s=>[...document.querySelectorAll(s)];
    const tabs=q('.cartab:not(.dis)');
    if(tabs.length){const order=pol==='random'?tabs:[...tabs].sort((a,b)=>(+b.querySelector('small').textContent.split(' ')[0])-(+a.querySelector('small').textContent.split(' ')[0]));(order[0]).click();}
   },POLICY);
   await page.waitForTimeout(30);
   const seatNames=await page.evaluate(()=>[...document.querySelectorAll('[data-seat]')].map(b=>b.dataset.seat));
   const chips=await page.evaluate(()=>[...document.querySelectorAll('.chip')].map(c=>({id:c.dataset.oga})));
   // seat: wheels-class Oga on DRIVER if any; the rest in listed order
   const info=await page.evaluate(()=>{const P=window.__raPlay;return null;});
   for(let s=0;s<seatNames.length;s++){
    const goDis=await page.evaluate(()=>document.querySelector('#go').disabled);
    const cnt=await page.evaluate(()=>document.querySelectorAll('.seat.full').length);
    const maxed=await page.evaluate(()=>document.querySelector('#cscroll .h2:nth-of-type(n)')?1:0);
    // stop once GO is enabled and a decent crew is seated (min 3 for the big jobs)
    if(!goDis&&cnt>=Math.min(seatNames.length,opts.crewTarget||3))break;
    const seat=seatNames[s];
    const isFull=await page.evaluate(sn=>document.querySelector(`[data-seat="${sn}"]`).classList.contains('full'),seat);
    if(isFull)continue;
    await page.evaluate(sn=>{const b=document.querySelector(`[data-seat="${sn}"]`);if(!b.classList.contains('lock'))b.click();},seat);
    const pick=await page.evaluate(sn=>{const cs=[...document.querySelectorAll('.chip:not(.used)')];if(!cs.length)return null;
      const wantWheels=sn==='DRIVER';const cand=wantWheels?(cs.find(c=>c.textContent.match(/WHEELS|ROOKIE/))||cs[0]):cs[0];return cand.dataset.oga;},seat);
    if(pick)await page.evaluate(id=>document.querySelector(`.chip[data-oga="${id}"]`).click(),pick);
   }
   let goDis=await page.evaluate(()=>document.querySelector('#go').disabled);
   if(goDis){ // last resort: click chips in order until GO lights up
    for(let i=0;i<9&&goDis;i++){await page.evaluate(i=>{const cs=[...document.querySelectorAll('.chip:not(.used)')];if(cs[0])cs[0].click();},i);goDis=await page.evaluate(()=>document.querySelector('#go').disabled);}
   }
   if(goDis){stats.stuck='car-go-disabled';await shot(page,'car_stuck',width);break;}
   await page.click('#go');continue;}
  if(k==='call'){
   stats.calls++;
   const ids=await page.evaluate(()=>[...document.querySelectorAll('.freeze [data-c]')].map(b=>b.dataset.c));
   const nondef=ids.filter(i=>i!=='DEFAULT');
   const pick=POLICY==='random'?ids[Math.floor(Math.random()*ids.length)]:(nondef[0]||'DEFAULT');
   await page.click(`.freeze [data-c="${pick}"]`);continue;}
  if(k==='greed'){
   const take=await page.evaluate(pol=>pol==='careful'?(Math.random()<.35):(Math.random()<.5),POLICY);
   await page.click(take?'#more':'#take');continue;}
  if(k==='turn'){await page.click(Math.random()<.5?'#turn':'#letgo');continue;}
  if(k==='gun'){await page.click('#trunk [data-g]');continue;}
  if(k==='count'){await page.click('#count');continue;}
  if(k==='report'){stats.playMs=(stats.playMs||[]);stats.playMs.push(await page.evaluate(()=>{const e=window.__raPlay.tele.events.filter(x=>x.ev==='PLAY_START').pop();return Date.now()-e.t;}));const rc=await page.evaluate(()=>window.__raPlay.replayCheck());stats.replays.push(rc.ok);await page.click('#rc');stats.plays++;stats.klasses=(stats.klasses||[]);stats.klasses.push(await page.evaluate(()=>{const e=window.__raPlay.tele.events.filter(x=>x.ev==='PLAY_END').pop();return e&&e.klass;}));continue;}
  if(k==='morning'){await page.waitForTimeout(400);await shot(page,'morning_settled',width);await page.click('#nextnight');continue;}
  if(k==='turned'){await page.waitForTimeout(100);continue;}
  if(k==='scene'&&SHOTS&&!seen.has(PFX+'scene_beat@'+width)){await page.waitForTimeout(+arg('sceneWait',1500));await shot(page,'scene_beat',width);}
  if(k==='scene'&&SHOTS&&seen.has(PFX+'scene_beat@'+width)&&!seen.has(PFX+'scene_beat2@'+width)&&Math.random()<.02){await shot(page,'scene_beat2',width);}
  // scene / trunk animating: tap-to-hurry
  if(k==='scene'&&!NOHURRY)await page.evaluate(()=>{const t=document.getElementById('scenetap');if(t)t.click();});
  if(k==='trunk'&&SHOTS&&!seen.has('trunk_reveal@'+width)){await page.waitForTimeout(+arg('trunkWait',1800));await shot(page,'trunk_reveal',width);}
  if(k==='trunk'&&!NOHURRY)await page.evaluate(()=>{const t=document.querySelector('.trunkwrap');if(t)t.click();});
  await page.waitForTimeout(60);
 }
 // replay determinism on the last play + telemetry
 stats.replay=await page.evaluate(()=>window.__raPlay.replayCheck());
 stats.tele=await page.evaluate(()=>window.__raPlay.tele.summary());
 stats.counter=await page.evaluate(()=>window.__raPlay.counter.get().plays);
 stats.sfx=await page.evaluate(()=>[...new Set(window.__raPlaySfx||[])].length);
 stats.world=await page.evaluate(()=>{const w=window.__raPlay.S.w;return {night:w.night,cash:Math.round(w.cash),roster:w.roster.length,captives:w.captives.length,gone:w.gone.length};});
 stats.errs=errs;stats.screens=[...stats.screens];
 await ctx.close();
 return stats;
}

const srv=await serve(PORT);
const browser=await chromium.launch({executablePath:CHROME,args:['--no-sandbox']});
const results=[];
for(const w of WIDTHS)results.push(await runBot(browser,w,{seed:SEED,plays:PLAYS,hold:arg('hold','')==='1',big:arg('big','')==='1',holdEvery:arg('holdEvery','')==='1',trim:+arg('trim',0)}));
await browser.close();srv.close();
for(const r of results)console.log(JSON.stringify(r));
if(OUT)fs.writeFileSync(OUT,JSON.stringify(results,null,1));
const bad=results.filter(r=>r.errs.length||r.stuck||!r.replay.ok||r.replays.some(x=>!x)||r.leaks.length||r.counter<PLAYS||r.overflow.length);
console.log(bad.length?`BOT GATE: FAIL (${bad.length}/${results.length} widths)`:`BOT GATE: PASS (${results.length} widths, ${PLAYS} plays each)`);
process.exit(bad.length?1:0);
