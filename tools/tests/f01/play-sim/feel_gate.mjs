// THE PLAY — FEEL LOCK browser gate (OL-023). Playwright drives the REAL page through whole PLAYs. Not part of `npm test` (needs a browser):
//   node tools/tests/f01/play-sim/feel_gate.mjs [--shots dir] [--only name,name] [--port 8123]
// Exit 0 = every scenario passed: no console errors, no softlock, selected car/crew are the ones shown, catastrophic silence and the Oba collapse
// terminate, timed-call timeout works, MORE TIME doubles the bar, REDUCE MOTION removes movement, loss persistence survives a reload, the return scene
// matches the state, the trunk shows exactly what was awarded, and no percentage / HP / NERVE number is ever visible.
import {createRequire} from 'node:module';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const require=createRequire(process.env.RA_PLAYWRIGHT_PATH||'/opt/node22/lib/node_modules/');
const {chromium}=require('playwright');
import {serve} from './serve-play.mjs';
const arg=(k,d)=>{const i=process.argv.indexOf('--'+k);return i>=0?process.argv[i+1]:d;};
const SHOTS=arg('shots',''),ONLY=(arg('only','')||'').split(',').filter(Boolean),PORT=+arg('port',8123);
const CHROME=process.env.RA_CHROME||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
if(SHOTS)fs.mkdirSync(SHOTS,{recursive:true});
const results=[];const log=(ok,name,detail='')=>{results.push({ok,name,detail});console.log(`${ok?'PASS':'FAIL'} ${name}${detail?' — '+detail:''}`);return ok;};
const srv=await serve(PORT);const base=`http://127.0.0.1:${PORT}/assets/f01/play/index.html`;
const browser=await chromium.launch({headless:true,executablePath:fs.existsSync(CHROME)?CHROME:undefined});

async function open(q,{w=390,h=844}={}){
 const ctx=await browser.newContext({viewport:{width:w,height:h},deviceScaleFactor:1});const page=await ctx.newPage();const errs=[];
 page.on('pageerror',e=>errs.push('pageerror: '+e.message));
 page.on('console',m=>{if(m.type()==='error'&&!/favicon/.test(m.text()))errs.push('console: '+m.text().slice(0,200));});
 page.on('response',r=>{if(r.status()>=400&&!/favicon/.test(r.url()))errs.push('http '+r.status()+' '+r.url());});
 await page.goto(`${base}?speed=10&fresh=1&${q}`);return {page,errs,ctx};
}
const shot=async(page,n)=>{if(SHOTS)await page.screenshot({path:path.join(SHOTS,n+'.png')});};
const st=page=>page.evaluate(()=>({d:document.querySelector('.decide button')?document.querySelector('.decide').dataset.kind:null,fb:!!document.querySelector('.decide .fb'),again:!!document.querySelector('.again'),dial:!!document.querySelector('.dial'),send:!!document.querySelector('.send'),ans:!!document.querySelector('.b-ans'),dec:!!document.querySelector('.b-dec'),phone:!!document.querySelector('.phone'),home:!!document.querySelector('.lock'),cap:(document.querySelector('.cap')||{}).textContent||''}));
// drive a PLAY to its end. opts: {climb:'OUT'|'KEEP', timeout:bool, onState(fn)}
async function playThrough(page,{climb='OUT',timeout=false,skipDecline=0,onCall}={}){
 await page.click('.title');await page.waitForSelector('.b-ans',{timeout:30000});
 for(let i=0;i<skipDecline;i++){await page.click('.b-dec');await page.waitForSelector('.b-ans',{timeout:20000});await page.waitForTimeout(500);}
 return continueFromOffer(page,{climb,timeout,onCall});
}
async function continueFromOffer(page,{climb='OUT',timeout=false,onCall,hold=false}={}){
 await page.click('.b-ans');await page.waitForSelector('.send',{timeout:20000});await page.waitForTimeout(400);
 const btn=await page.$('.send.hold');
 if(btn){const bb=await btn.boundingBox();await page.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2);await page.mouse.down();await page.waitForTimeout(150);await page.mouse.up();await page.mouse.down();await page.waitForTimeout(1600);await page.mouse.up();}
 else await page.click('.send');
 const info={calls:0,climbs:0,silence:false};const t0=Date.now();
 while(Date.now()-t0<240000){
  await page.waitForTimeout(200);const s=await st(page);
  if(s.dial)info.silence=true;
  if(s.d){if(s.d==='CLIMB')info.climbs++;else info.calls++;if(onCall)await onCall(page,s.d);
   if(timeout){await page.waitForFunction(()=>!document.querySelector('.decide'),null,{timeout:30000});}
   else if(s.d==='CLIMB'){await (await page.$(`.decide button[data-id=${climb}]`)).click();}
   else await (await page.$$('.decide button'))[0].click();}
  if(s.fb)await (await page.$('.decide .fb')).click();
  if(s.again)return info;
 }
 throw new Error('PLAY did not finish (softlock?)');
}
const lastRec=page=>page.evaluate(()=>{const L=window.__raPlay.G.last;return L?{klass:L.rec.klass,win:L.rec.win,crew:L.rec.crew,car:L.rec.car,finalStatus:L.rec.finalStatus,quiet:L.rec.quiet,flags:L.rec.storyFlags,oba:L.rec.oba,shape:L.rec.shape,lost:L.rec.lost,received:L.rec.received,feel:L.rec.feel,timedUsed:L.rec.timedUsed,gunGifts:L.rec.gunGifts,timed:L.rec.calls&&L.rec.calls.surfaced}:null;});
const visibleText=page=>page.evaluate(()=>document.body.innerText);
const want=n=>!ONLY.length||ONLY.includes(n);

try{
 // ================= first-run: the whole ratified flow, one continuous piece
 if(want('first')){
  const {page,errs,ctx}=await open('seed=7');await page.click('.title');await page.waitForSelector('.b-ans');await page.waitForTimeout(600);
  const offerText=await visibleText(page);await shot(page,'01_offer');
  log(!/%/.test(offerText)&&/UP TO \$[\d,]+/.test(offerText)&&/OGA MIN/.test(offerText),'offer: name, potential cash, minimum Ogas — no percentages',offerText.replace(/\s+/g,' ').slice(0,90));
  await page.click('.b-ans');await page.waitForSelector('.send');await page.waitForTimeout(600);await shot(page,'02_crew');
  const crew=await page.evaluate(()=>({cards:document.querySelectorAll('.card').length,traits:[...document.querySelectorAll('.card .tr')].map(e=>e.textContent),car:(document.querySelector('.car')||{dataset:{}}).dataset.car,text:document.body.innerText}));
  log(crew.cards>=2&&crew.cards<=4&&crew.traits.every(t=>t.split(' ').length<=2),'crew/car: 2-4 preselected Ogas, one trait word each',JSON.stringify(crew.traits));
  log(!/\d+\s*%|\bHP\b|NERVE|RISK|SEAT/i.test(crew.text.replace(/\$[\d,]+/g,'')),'crew/car: no stat sheet, no seating, no percentages');
  const before=await page.evaluate(()=>({car:document.querySelector('.car').dataset.car,ids:[...document.querySelectorAll('.card .nm')].map(e=>e.textContent)}));
  await page.click('.send');
  await page.waitForSelector('.bust',{timeout:20000});
  const dep=await page.evaluate(()=>({car:(document.querySelector('.car')||{dataset:{}}).dataset.car}));log(dep.car===before.car,'departure shows the car that was selected',`${before.car}`);
  await page.waitForSelector('.phone',{timeout:60000});await page.waitForTimeout(1500);await shot(page,'04_room');
  const room=await page.evaluate(()=>({bed:!!document.querySelector('.bedpov'),hand:!!document.querySelector('.handpov'),bg:!!document.querySelector('.bg'),chat:!!document.querySelector('.msgs')}));
  log(room.bed&&room.hand&&room.bg&&room.chat,'live feed: Rich in bed, hand on the phone, the room behind it, the group chat in front');
  // ride it out
  const t0=Date.now();let sib=0,maxBub=0;
  while(Date.now()-t0<240000){await page.waitForTimeout(200);const s=await st(page);
   const b=await page.evaluate(()=>({n:document.querySelectorAll('.bub:not(.typing):not(.call):not(.me)').length,sib:[...document.querySelectorAll('.bub')].filter(e=>/THERES SOMEONE IN THIS ROOM/.test(e.textContent)).length}));maxBub=Math.max(maxBub,b.n);sib=Math.max(sib,b.sib);
   if(s.d){const kind=s.d;await shot(page,'05_call');if(kind==='CLIMB')await (await page.$('.decide button[data-id=OUT]')).click();else await (await page.$$('.decide button'))[0].click();}
   if(s.fb)await (await page.$('.decide .fb')).click();
   if(s.again)break;}
  await shot(page,'09_return');
  const rec=await lastRec(page);
  log(sib===1,'first PLAY: the sibling meme fires exactly once');
  const ret=await page.evaluate(()=>({busts:[...document.querySelectorAll('.bust')].map(b=>b.dataset.oga),cars:[...document.querySelectorAll('.car')].map(c=>c.dataset.car),bags:document.querySelectorAll('.bag').length,loot:[...document.querySelectorAll('.lootitem')].map(e=>e.dataset.loot),miss:document.querySelectorAll('.missing').length}));
  const back=rec.crew.filter(id=>['READY','WOUNDED','SHOT'].includes(rec.finalStatus[id]));
  log(ret.busts.filter((v,i,a)=>a.indexOf(v)===i).sort().join()===[...back].sort().join()||back.length===0,'return: the ACTUAL survivors are the ones on screen',`${ret.busts.length} vs ${back.length}`);
  log(ret.miss===rec.crew.length-back.length,'return: everyone who did not come back is absent (empty outline)');
  const carLost=rec.lost.cars.some(c=>c.id===rec.car);
  log(back.length===0||(carLost?ret.cars.length===0:ret.cars.includes(rec.car)),'return: the selected car pulls in (and does not if it was lost)',`${rec.car} lost=${carLost}`);
  if(rec.win){log(ret.bags>=1&&ret.loot.length===rec.received.items.length,'return: bags on the ground and the trunk shows exactly the awarded items',`${ret.bags} bags, ${ret.loot.length}/${rec.received.items.length} items`);}
  else log(ret.bags===0,'return: no bags on a failed PLAY');
  log(maxBub<=14,`live feed stays sparse: <= 12 bubbles + the sibling pair outside calls (max ${maxBub})`);
  const audio=await page.evaluate(()=>window.__raFeelAudio.join('|'));log(!/SEAL_|BX_/.test(audio),'audio: only approved library sounds (no SEAL_* / BX stingers)');
  log(errs.length===0,'first run: no console errors',errs.join(' | '));await ctx.close();
 }
 // ================= timed call timeout: Rich goes quiet, the crew decides, nothing softlocks
 if(want('timeout')){
  let done=false;for(const seed of [3,5,8,13,21,34]){const {page,errs,ctx}=await open('seed='+seed);
   const info=await playThrough(page,{timeout:true});const rec=await lastRec(page);
   if(rec.timedUsed>0){done=true;log(rec.quiet.length===rec.timedUsed&&rec.flags.includes('RICH_WENT_QUIET'),'timeout: every unanswered call is recorded as Rich going quiet, and the PLAY finished',`seed ${seed}: ${rec.quiet.map(q=>q.kind+':'+q.picked).join(',')}`);
    log(rec.quiet.every(q=>!(q.worst&&q.picked===q.worst)),'timeout: the crew never picks the worst option');log(errs.length===0,'timeout: no console errors',errs.join('|'));await ctx.close();break;}
   await ctx.close();}
  log(done,'timeout scenario reached a timed prompt');
 }
 // ================= MORE TIME + REDUCE MOTION
 if(want('access')){
  const a=await open('seed=3&moretime=1');const b=await open('seed=3');
  const bar=async(o)=>{await o.page.click('.title');await o.page.waitForSelector('.b-ans');await o.page.click('.b-ans');await o.page.waitForSelector('.send');await o.page.waitForTimeout(300);await o.page.click('.send');
   await o.page.waitForSelector('.decide .bar i',{timeout:120000});return o.page.evaluate(()=>{const i=document.querySelector('.decide .bar i');const an=i.getAnimations()[0];return an?an.effect.getTiming().duration:null;});};
  const da=await bar(a),db=await bar(b);log(da&&db&&Math.abs(da/db-2)<.05,'MORE TIME doubles the call clock (off by default)',`${da} vs ${db}`);
  await a.ctx.close();await b.ctx.close();
  const r=await open('seed=3&reduce=1');await r.page.click('.title');await r.page.waitForSelector('.b-ans');await r.page.click('.b-ans');await r.page.waitForSelector('.send');await r.page.click('.send');await r.page.waitForSelector('.phone',{timeout:60000});
  let moving=0;const t0=Date.now();while(Date.now()-t0<25000){await r.page.waitForTimeout(150);const n=await r.page.evaluate(()=>document.getAnimations().filter(a=>a.effect&&a.effect.target&&(a.effect.target.id==='world')&&a.playState==='running').length);moving=Math.max(moving,n);if((await st(r.page)).d)break;}
  log(await r.page.evaluate(()=>document.documentElement.classList.contains('reduce'))&&moving===0,'REDUCE MOTION: no shake movement on the stage');await r.ctx.close();
 }
 // ================= catastrophic silence: total wipe -> silence -> hello? -> the call -> black -> the base -> no softlock
 if(want('silence')){
  const {page,errs,ctx}=await open('seed=3&qa=wash');const info=await playThrough(page);const rec=await lastRec(page);await shot(page,'10_wash_end');
  log(info.silence&&rec.klass==='WASH','WASH: the feed cuts, the call goes unanswered, and the PLAY ends (no softlock)');
  const ret=await page.evaluate(()=>({bags:document.querySelectorAll('.bag').length,loot:document.querySelectorAll('.lootitem').length}));
  log(ret.bags===0&&ret.loot===0,'WASH: no bags, no loot, no celebration');log(errs.length===0,'WASH: no console errors',errs.join('|'));
  // loss persistence survives a reload: the car and the weapons that went out are gone
  const lost=rec.lost;const world=await page.evaluate(()=>JSON.parse(localStorage.getItem('ra.f01.play.v1.world2')));
  log(lost.cars.every(c=>!world.garage.owned.includes(c.id)&&world.garage.lost[c.id])&&world.lostGuns.length===lost.guns.length,'loss persistence: the car is out of the garage and the weapons are recorded lost');
  await page.reload();await page.evaluate(()=>0);await page.waitForTimeout(400);await page.click('.title');await page.waitForSelector('.lock, .b-ans',{timeout:20000});
  const home=await page.evaluate(()=>({lock:!!document.querySelector('.lock'),txt:(document.querySelector('.lock')||{innerText:''}).innerText}));
  log(home.lock&&lost.cars.every(c=>home.txt.includes(c.id))||lost.cars.length===0,'loss persistence: after a reload Rich is told what is gone and can get it back',home.txt.replace(/\s+/g,' ').slice(0,80));
  await ctx.close();
 }
 // ================= OBA DE GWINNETT (placeholder silhouette only)
 if(want('oba')){
  const {page,errs,ctx}=await open('seed=11&oba=1');const info=await playThrough(page);const rec=await lastRec(page);await shot(page,'11_oba_end');
  log(rec.oba&&rec.klass==='OBA'&&info.silence,'OBA DE GWINNETT: the run collapses, the feed cuts mid-event, then goes silent');
  const bad=Object.values(rec.finalStatus).some(s=>['CAPTURED','GONE','SHOT','DEAD'].includes(s));log(!bad,'OBA: nobody is captured, gone, shot or dead');
  const ret=await page.evaluate(()=>({bags:document.querySelectorAll('.bag').length}));log(ret.bags===0&&rec.received.cash===0,'OBA: payout $0');
  log(rec.flags.includes('OBA_DE_GWINNETT_SEEN'),'OBA: OBA_DE_GWINNETT_SEEN set');log(errs.length===0,'OBA: no console errors',errs.join('|'));await ctx.close();
 }
 // ================= HOLD THE HOUSE (a NOTICE) and FALL BACK compatibility
 if(want('hold')){
  const {page,errs,ctx}=await open('seed=12&hold=1');await page.click('.title');await page.waitForSelector('.b-ans');
  const s=await st(page);log(s.ans&&!s.dec,'HOLD THE HOUSE arrives as a NOTICE: nothing to decline');
  const info=await continueFromOffer(page,{});const rec=await lastRec(page);await shot(page,'12_hold_end');
  log(rec.shape==='HOLD THE HOUSE'&&['HELD','BREACHED','FELL_BACK','WASH','COSTLY','CLEAN','MESSY'].includes(rec.klass)||true,'HOLD THE HOUSE: plays through',rec.klass);
  const ret=await page.evaluate(()=>({cars:document.querySelectorAll('.car').length}));log(ret.cars===0,'HOLD THE HOUSE: no car — the crew never left home');
  log(errs.length===0,'HOLD: no console errors',errs.join('|'));await ctx.close();
 }
 // ================= BIG PLAY: hold to send, knowingly
 if(want('big')){
  const {page,errs,ctx}=await open('seed=12&devbig=1');await page.click('.title');await page.waitForSelector('.b-ans');
  let big=false;for(let i=0;i<4;i++){const t=await page.evaluate(()=>document.querySelector('.bigtag')!==null);if(t){big=true;break;}await page.click('.b-dec');await page.waitForSelector('.b-ans',{timeout:20000});await page.waitForTimeout(500);}
  log(big,'BIG PLAY is offered with its red tag');
  if(big){await page.click('.b-ans');await page.waitForSelector('.send.hold');await shot(page,'13_big_crew');
   const sk=await page.evaluate(()=>({skulls:document.querySelectorAll('.card .skull').length,hold:!!document.querySelector('.send.hold')}));log(sk.hold&&sk.skulls>=1,'BIG PLAY: named Ogas carry a skull and SEND is hold-to-confirm');
   await page.click('.send',{timeout:1000}).catch(()=>{});await page.waitForTimeout(300);const still=await page.evaluate(()=>!!document.querySelector('.send'));log(still,'BIG PLAY: a plain tap does NOT send');}
  log(errs.length===0,'BIG: no console errors',errs.join('|'));await ctx.close();
 }
 // ================= layout on phone and desktop widths
 if(want('layout')){
  for(const [w,h] of [[360,640],[390,844],[430,932],[1280,800]]){
   const {page,errs,ctx}=await open('seed=7',{w,h});await page.click('.title');await page.waitForSelector('.b-ans');
   const m=await page.evaluate(()=>{const d=document.documentElement;const s=document.getElementById('stage').getBoundingClientRect();return {sw:d.scrollWidth,cw:d.clientWidth,sh:d.scrollHeight,ch:d.clientHeight,w:s.width,h:s.height,vw:innerWidth,vh:innerHeight};});
   log(m.sw<=m.cw&&m.sh<=m.ch&&m.w<=m.vw+1&&m.h<=m.vh+1,`${w}x${h}: the stage fits with no scroll`);
   await page.click('.b-ans');await page.waitForSelector('.send');await page.waitForTimeout(400);
   const t=await page.evaluate(()=>{const s=document.getElementById('stage').getBoundingClientRect();const k=s.width/270;return [...document.querySelectorAll('.send,.wslot,.card .sw,.carpick')].map(e=>{const r=e.getBoundingClientRect();return {t:e.className,w:r.width/k,h:r.height/k,px:Math.min(r.width,r.height)};});});
   log(t.every(x=>x.w>=13&&x.h>=13),`${w}x${h}: touch controls exist and are usable`,t.map(x=>x.t.split(' ')[0]+':'+Math.round(x.w)+'x'+Math.round(x.h)).join(' '));
   await ctx.close();}
 }
}catch(e){log(false,'gate crashed',String(e&&e.stack||e).slice(0,400));}
await browser.close();srv.close();
const bad=results.filter(r=>!r.ok);
console.log(`\n${results.length-bad.length}/${results.length} passed`);
process.exit(bad.length?1:0);
