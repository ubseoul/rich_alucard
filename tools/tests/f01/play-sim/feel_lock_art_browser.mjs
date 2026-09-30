// THE PLAY — FROZEN FEEL-LOCK ART, real-browser proof (FL-A01..A10). Not part of `npm test` (needs a browser):
//   node tools/tests/f01/play-sim/feel_lock_art_browser.mjs [--shots dir] [--port 8130]
// Drives whole PLAYs in Chromium and samples the live DOM for: the arrival exterior of the job that was rolled, the live phone inside the FL-A01 cutout,
// JOLT (rig shake), the thumb typing overlay, the FL-A02 return base (+ empty variant), haul / loot art, the Oba sprite, the lost-car card after a reload,
// 360 / 390 / 430 fit, and ZERO broken images / 4xx / console errors. Also asserts every feel_lock request is a frozen path and returns 200.
import {createRequire} from 'node:module';import fs from 'node:fs';import path from 'node:path';
const require=createRequire(process.env.RA_PLAYWRIGHT_PATH||'/opt/node22/lib/node_modules/');
const {chromium}=require('playwright');
import {serve} from './serve-play.mjs';
const arg=(k,d)=>{const i=process.argv.indexOf('--'+k);return i>=0?process.argv[i+1]:d;};
const SHOTS=arg('shots',''),PORT=+arg('port',8130);
const CHROME=process.env.RA_CHROME||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
if(SHOTS)fs.mkdirSync(SHOTS,{recursive:true});
const root=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..','..','..','..');
const rec=JSON.parse(fs.readFileSync(path.join(root,'assets/f01/feel_lock/FREEZE_RECORD.json'),'utf8'));
const FROZEN=new Set(rec.items.map(i=>i.production_path));
let failed=0;const log=(ok,name,detail='')=>{if(!ok)failed++;console.log(`${ok?'PASS':'FAIL'} ${name}${detail?' — '+detail:''}`);return ok;};
const srv=await serve(PORT);const base=`http://127.0.0.1:${PORT}/assets/f01/play/index.html`;
const browser=await chromium.launch({headless:true,executablePath:fs.existsSync(CHROME)?CHROME:undefined});
const requested=new Set();

async function open(q,{w=390,h=844}={}){
 const ctx=await browser.newContext({viewport:{width:w,height:h},deviceScaleFactor:1});const page=await ctx.newPage();const errs=[];
 page.on('pageerror',e=>errs.push('pageerror: '+e.message));
 page.on('console',m=>{if(m.type()==='error'&&!/favicon/.test(m.text()))errs.push('console: '+m.text().slice(0,200));});
 page.on('response',r=>{const u=new URL(r.url());if(/\/assets\/f01\/feel_lock\//.test(u.pathname))requested.add(u.pathname.slice(1));if(r.status()>=400&&!/favicon/.test(r.url()))errs.push('http '+r.status()+' '+r.url());});
 page.on('requestfailed',r=>{if(!/favicon/.test(r.url()))errs.push('requestfailed '+r.url());});
 await page.goto(`${base}?speed=10&fresh=1&mute=1&${q}`);
 await sampler(page);
 return {page,errs,ctx};
}
async function sampler(page){
 await page.evaluate(()=>{ // one sampler for every scene: what is on screen, every 40 ms
  const S=window.__seen={bg:new Set(),jobs:new Set(),thumb:false,vib:false,lights:false,haul:new Set(),loot:new Set(),poses:new Set(),oba:false,lost:new Set(),broken:new Set(),phone:null,handpov:null,bedOnly:true,ext:new Set(),cars:new Set(),carStates:new Set(),bubbleSkin:false,crewIcons:new Set()};
  const fn=s=>(s||'').split('/').pop();
  setInterval(()=>{
   for(const i of document.images)if(i.complete&&i.naturalWidth===0&&i.src)S.broken.add(i.src);
   for(const i of document.querySelectorAll('#world img.bg'))S.bg.add(fn(i.src));
   const hp=document.querySelector('.rig .handpov');if(hp){S.handpov=fn(hp.src);const ph=document.querySelector('.phone');const st=document.getElementById('stage').getBoundingClientRect(),k=st.width/270,r=ph.getBoundingClientRect();S.phone=[(r.left-st.left)/k,(r.top-st.top)/k,r.width/k,r.height/k].map(v=>Math.round(v*100)/100);}
   if(document.querySelector('.thumbpov.on'))S.thumb=true;
   if(document.querySelector('.rig.vib'))S.vib=true;
   for(const c of document.querySelectorAll('.car.on')){const o=c.querySelector('.c-on');if(o&&getComputedStyle(o).opacity==='1'){S.lights=true;S.cars.add(c.dataset.car);}}
   for(const i of document.querySelectorAll('.bag img'))S.haul.add(fn(i.src));
   for(const e of document.querySelectorAll('.lootitem'))S.loot.add((e.querySelector('img')?fn(e.querySelector('img').src):'crate:'+e.dataset.loot));
   for(const b of document.querySelectorAll('.bust[data-pose]'))S.poses.add(b.dataset.pose);
   if(document.querySelector('.obashade img'))S.oba=fn(document.querySelector('.obashade img').src);
   for(const l of document.querySelectorAll('.lostcar'))S.lost.add(l.dataset.car+':'+l.dataset.state+':'+[...l.querySelectorAll('img')].map(i=>fn(i.src)).join('+'));
   for(const i of document.querySelectorAll('.wslot img'))S.crewIcons.add(fn(i.src));
   const pl=window.__raPlay&&window.__raPlay.G&&window.__raPlay.G.ctx&&window.__raPlay.G.ctx.job;if(pl)S.jobs.add(pl.id);
   const b=document.querySelector('.bub:not(.me)');if(b&&/chat_bubble/.test(getComputedStyle(b).borderImageSource))S.bubbleSkin=true;
  },40);});
}
const shot=async(page,n)=>{if(SHOTS)await page.screenshot({path:path.join(SHOTS,n+'.png')});};
const seen=page=>page.evaluate(()=>({...window.__seen,bg:[...window.__seen.bg],jobs:[...window.__seen.jobs],haul:[...window.__seen.haul],loot:[...window.__seen.loot],poses:[...window.__seen.poses],lost:[...window.__seen.lost],broken:[...window.__seen.broken],cars:[...window.__seen.cars],crewIcons:[...window.__seen.crewIcons]}));
async function ride(page,{climb='OUT'}={}){
 await page.click('.title');await page.waitForSelector('.b-ans',{timeout:30000});await page.click('.b-ans');await page.waitForSelector('.send',{timeout:20000});await page.waitForTimeout(300);
 const hold=await page.$('.send.hold');if(hold){const bb=await hold.boundingBox();await page.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2);await page.mouse.down();await page.waitForTimeout(1600);await page.mouse.up();}else await page.click('.send');
 const t0=Date.now();
 while(Date.now()-t0<240000){await page.waitForTimeout(200);
  const s=await page.evaluate(()=>({d:document.querySelector('.decide button')?document.querySelector('.decide').dataset.kind:null,fb:!!document.querySelector('.decide .fb'),again:!!document.querySelector('.again')}));
  if(s.d){if(s.d==='CLIMB')await (await page.$(`.decide button[data-id=${climb}]`)).click();else await (await page.$$('.decide button'))[0].click();}
  if(s.fb)await (await page.$('.decide .fb')).click();
  if(s.again){await page.waitForTimeout(400);return;}}
 throw new Error('PLAY did not finish');
}
const lastRec=page=>page.evaluate(()=>{const L=window.__raPlay.G.last;return L?{klass:L.rec.klass,win:L.rec.win,crew:L.rec.crew,car:L.rec.car,finalStatus:L.rec.finalStatus,received:L.rec.received,lost:L.rec.lost,shape:L.rec.shape}:null;});
const ALL_PNG_OK=(list,pred)=>list.length>0&&list.every(pred);
const EXT={boba_backroom:1,tupperware:1,vampire_dentist:1,dock_restock:1,car_wash_stickup:1,quiet_lift:1,vampire_gala:1,smack_crib:1,counting_house:1};

try{
 // ================= a whole PLAY at 360 / 390 / 430: arrival exterior, live phone, JOLT, return base, haul, loot, sprites, zero 404s
 for(const [w,h] of [[390,844],[360,640],[430,932]]){
  const {page,errs,ctx}=await open('seed=7',{w,h});await ride(page);await shot(page,`return_${w}`);
  const s=await seen(page),r=await lastRec(page);const job=s.jobs.find(j=>EXT[j]);
  log(!!job&&s.bg.includes(job+'_exterior_270x480.png'),`${w}: ARRIVAL shows the frozen FL-A05 exterior of the rolled job`,`${job} -> ${s.bg.filter(b=>/exterior/.test(b)).join()}`);
  log(s.handpov==='hand_phone_idle_270x480.png'&&s.bg.includes('bedroom_pov_base_270x480.png'),`${w}: LIVE FEED = FL-A01 red bed base + idle hand/phone layer`);
  log(JSON.stringify(s.phone)==='[57,39,159,352]',`${w}: live phone DOM sits exactly in the transparent screen opening`,JSON.stringify(s.phone));
  log(s.vib,`${w}: JOLT — the rig (phone + hand) shook in code during the feed`);
  log(s.bubbleSkin,`${w}: live chat uses the frozen FL-A09 bubble skin`);
  log(s.lights&&ALL_PNG_OK([...s.cars],c=>true),`${w}: headlights-on car art showed on departure/arrival`,s.cars.join());
  log(s.crewIcons.length>0,`${w}: crew weapon slots draw frozen icons`,s.crewIcons.join());
  const backs=r.crew.filter(id=>['READY','WOUNDED','SHOT'].includes(r.finalStatus[id]));
  log(s.bg.includes(backs.length?'base_return_270x480.png':'base_return_empty_270x480.png'),`${w}: RETURN uses the FL-A02 base (${backs.length?'with':'empty variant, Rich alone'})`);
  if(r.win&&r.received.cash>0)log(s.haul.length>=1&&s.haul.every(n=>/^cash_(small|medium|large)_(closed|open)_128x96\.png$/.test(n))&&s.haul.some(n=>/_open_/.test(n)),`${w}: bags = frozen FL-A03 haul, opened to count`,s.haul.join());
  const frozenLoot=s.loot.filter(n=>!n.startsWith('crate:'));
  log(s.loot.length===(r.received&&r.received.items.length||0)||!r.win,`${w}: trunk shows exactly the awarded items`,`${s.loot.length}`);
  log(frozenLoot.every(n=>/^(blood_x|cash|gun|mod|weird)_48x48\.png$/.test(n)),`${w}: loot pieces are frozen FL-A10 art (RECRUIT/STORY/DISTRICT stay placeholder crates)`,s.loot.join());
  log(s.broken.length===0,`${w}: zero broken images`,s.broken.join());
  const fit=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,iw:innerWidth,sh:document.documentElement.scrollHeight,ih:innerHeight}));
  log(fit.sw<=fit.iw&&fit.sh<=fit.ih,`${w}x${h}: no scroll`,JSON.stringify(fit));
  log(errs.length===0,`${w}: zero 404s / console errors`,errs.join(' | '));await ctx.close();
 }
 // ================= WASH: Rich types "hello?" (thumb overlay), survivors, the car is lost -> reload -> the lost-car card uses the wrecked/impounded art
 {
  const {page,errs,ctx}=await open('seed=3&qa=wash');await ride(page);const s=await seen(page),r=await lastRec(page);await shot(page,'wash_return');
  log(s.thumb,'TYPING: the frozen thumb overlay shows while Rich texts (WASH silence beat)');
  log(r.klass==='WASH'&&s.haul.length===0&&s.loot.length===0,'WASH: no bags, no loot');
  const carId=r.lost.cars[0]&&r.lost.cars[0].id;
  await page.reload();await sampler(page);await page.waitForTimeout(500);await page.click('.title');await page.waitForSelector('.lock, .b-ans',{timeout:20000});await page.waitForTimeout(700);await shot(page,'wash_home_after_reload');
  const s2=await seen(page);
  const state=r.lost.cars[0]&&(r.lost.cars[0].route==='IMPOUND'?'impounded':'wrecked');
  log(!!carId&&s2.lost.some(l=>l.startsWith(`${carId}:${state}:`)&&new RegExp(`_${state}(_overlay)?_136x50\\.png`).test(l)),'RELOAD: the lost-car recovery card draws the frozen '+state+' car art',`${carId} ${state} :: ${s2.lost.join(' | ')}`);
  log(s2.broken.length===0,'RELOAD: zero broken images');log(errs.length===0,'WASH + reload: zero 404s / console errors',errs.join(' | '));await ctx.close();
 }
 // ================= OBA: the feed cuts and the frozen native sprite flashes (no silhouette)
 {
  const {page,errs,ctx}=await open('seed=11&oba=1');await ride(page);const s=await seen(page);await shot(page,'oba_return');
  log(s.oba==='oba_de_gwinnett_visual_a_native_80x96.png','OBA: the frozen FL-A04 native sprite flashes when the feed cuts',String(s.oba));
  log(s.broken.length===0&&errs.length===0,'OBA: zero broken images / 404s / console errors',errs.join(' | '));await ctx.close();
 }
 // ================= HOLD THE HOUSE keeps the castle (no frozen exterior was authorized for the defense) and no car
 {
  const {page,errs,ctx}=await open('seed=12&hold=1');await ride(page);const s=await seen(page);
  log(!s.bg.some(b=>/exterior_270x480/.test(b)&&!/castle/.test(b)),'HOLD THE HOUSE: castle arrival kept (no job exterior applies)',s.bg.join());
  log(s.bg.includes('base_return_270x480.png')||s.bg.includes('base_return_empty_270x480.png'),'HOLD THE HOUSE: return uses the FL-A02 base');
  log(errs.length===0&&s.broken.length===0,'HOLD: zero 404s / console errors',errs.join(' | '));await ctx.close();
 }
 // ================= scene matrix: every frozen STATE is drawn at least once (not just the ones a seeded PLAY happens to roll)
 {
  const {page,errs,ctx}=await open('seed=1',{w:270,h:480});await page.waitForSelector('.title');
  const crew=[{id:'g101',name:'BIG DON',short:'Don',cls:'MUSCLE',named:false,gun:'pistol'},{id:'g102',name:'LIL K',short:'K',cls:'SHOOTER',named:false,gun:'pistol'},{id:'g103',name:'MO',short:'Mo',cls:'DOC',named:false,gun:'pistol'},{id:'tunde',name:'TUNDE',short:'Tunde',cls:'MUSCLE',named:true,gun:'sapporo_shotgun'}];
  const drive=(fn,arg)=>page.evaluate(async([src,arg])=>{const V=await import('/assets/f01/play/feel-scenes.mjs');const K=await import('/assets/f01/play/feel-core.mjs');return await (new Function('V','K','arg','return ('+src+')(V,K,arg)'))(V,K,arg);},[fn.toString(),arg]);
  // arrival: all nine exteriors + the castle for HOLD; crew ends at that job's door; generic Ogas wear the walking sprite, named keep the face bust
  for(const id of ['boba_backroom','tupperware','vampire_dentist','dock_restock','car_wash_stickup','quiet_lift','vampire_gala','smack_crib','counting_house','hold_the_house']){
   await page.evaluate(([crew,id])=>{import('/assets/f01/play/feel-scenes.mjs').then(V=>V.arriveScene({slide:{seats:crew.map(c=>({id:c.id}))},crewObjs:crew,carId:'URUS',defense:id==='hold_the_house',job:{id,name:id}}));},[crew.slice(0,3),id]);
   await page.waitForSelector('.bust[data-pose=walking]',{timeout:30000});
   const a=await page.evaluate(()=>({bg:document.querySelector('#world img.bg').src.split('/').pop(),poses:[...document.querySelectorAll('.bust')].map(b=>b.dataset.oga+':'+(b.dataset.pose||'face'))}));
   log(id==='hold_the_house'?/castle_exterior_night/.test(a.bg):a.bg===id+'_exterior_270x480.png',`ARRIVAL ${id}: ${a.bg}`,a.poses.join());
   await page.waitForSelector('.bust',{state:'detached',timeout:30000}).catch(()=>{});
  }
  // generic Oga poses + named Ogas stay face busts (FL-A07 named states are SOURCE_REQUIRED)
  const poses=await page.evaluate(async crew=>{const V=await import('/assets/f01/play/feel-scenes.mjs');const out={};for(const p of ['walking','boarding','standing','wounded','carried']){const b=V.bust(crew[0],32,{pose:p});out[p]=b.querySelector('img.ogs').src.split('/').pop();}
   const n=V.bust(crew[3],32,{pose:'standing'});out.named=n.querySelector('img.ogs')?'SPRITE':'face';return out;},crew);
  log(Object.entries(poses).every(([k,v])=>k==='named'?v==='face':v===`generic_oga_${k}_80x96.png`),'FL-A07: generic Ogas -> frozen template poses; NAMED Ogas keep the face bust (SOURCE_REQUIRED)',JSON.stringify(poses));
  // every car: base, headlights, wrecked, impounded
  const carStates=await page.evaluate(async()=>{const A=await import('/assets/f01/play/feel-art.mjs');const out=[];for(const id of ['SUPRA','HOOPTIE','S2000','URUS'])for(const st of [undefined,'wrecked','impounded']){const d=document.createElement('div');d.innerHTML=A.carHTML(id,st);out.push(id+':'+(st||'drive')+':'+[...d.querySelectorAll('img')].map(i=>i.className+'='+i.src.split('/').pop()).join('+'));}return out;});
  log(carStates.length===12&&carStates.every(l=>/136x50\.png|supra_mk4_world\.png/.test(l))&&carStates.filter(l=>/:wrecked:|:impounded:/.test(l)).every(l=>/_(wrecked|impounded)(_overlay)?_136x50/.test(l)),'FL-A06: base + headlight + wrecked + impounded for HOOPTIE / S2000 / URUS / SUPRA',carStates.length+' states');
  // return: cash hauls (all three tiers) + every loot category + the empty variant
  const base={shape:'COLLECT',car:'S2000',win:true,lost:{cars:[],guns:[]},gunGifts:[]};
  for(const [name,cash] of [['small',10],['medium',20],['large',40]]){
   await page.evaluate(([crew,cash])=>{window.__done=false;import('/assets/f01/play/feel-scenes.mjs').then(async V=>{await V.returnScene({rec:{shape:'COLLECT',car:'S2000',win:true,lost:{cars:[],guns:[]},gunGifts:[],crew:['g101','g102','g103','tunde'],finalStatus:{g101:'READY',g102:'WOUNDED',g103:'SHOT',tunde:'READY'},received:{cash,items:[{cat:'GUN',gun:'sapporo_shotgun',rar:'RARE',name:'a Sapporo Shotgun',to:'tunde'},{cat:'CASH',rar:'COMMON',name:'a cash crate'},{cat:'MOD',rar:'LEGENDARY',name:'a mod'},{cat:'BLOOD_X',rar:'RARE',name:'BLOOD X'},{cat:'WEIRD',rar:'COMMON',name:'a weird thing'}]}},crewObjs:crew,w:{},bankBefore:0});window.__done=true;});},[crew,cash]);
   await page.waitForFunction(()=>window.__done,null,{timeout:120000});
   const s=await seen(page);
   log(s.haul.some(n=>n===`cash_${name}_closed_128x96.png`)&&s.haul.some(n=>n===`cash_${name}_open_128x96.png`),`FL-A03 ${name} haul: closed then opened to count`,s.haul.join());
   if(name==='large'){log(['gun_48x48.png','cash_48x48.png','mod_48x48.png','blood_x_48x48.png','weird_48x48.png'].every(n=>s.loot.includes(n)),'FL-A10: GUN / CASH / MOD / BLOOD_X / WEIRD drawn as the frozen pieces',s.loot.join());
    log(['standing','wounded','carried'].every(p=>s.poses.includes(p)),'FL-A07: READY / WOUNDED / SHOT generic Ogas return as standing / wounded / carried',s.poses.join());}
  }
  await page.evaluate(()=>{window.__done=false;import('/assets/f01/play/feel-scenes.mjs').then(async V=>{await V.returnScene({rec:{shape:'COLLECT',car:'S2000',win:false,lost:{cars:[],guns:[]},gunGifts:[],crew:[],finalStatus:{},received:{cash:0,items:[]}},crewObjs:[],w:{},bankBefore:0});window.__done=true;});});
  await page.waitForFunction(()=>window.__done,null,{timeout:60000});
  log((await seen(page)).bg.includes('base_return_empty_270x480.png'),'FL-A02 empty variant: Rich alone');
  // lost-car cards: every car x impounded / wrecked
  const cards=[];
  for(const [id,st] of [['SUPRA','impounded'],['SUPRA','wrecked'],['HOOPTIE','impounded'],['HOOPTIE','wrecked'],['S2000','impounded'],['S2000','wrecked'],['URUS','impounded'],['URUS','wrecked']]){
   await page.evaluate(([id,st])=>{import('/assets/f01/play/feel-scenes.mjs').then(V=>V.homeScene({w:{},texts:[],recover:[{title:id,car:{id,state:st},line:'x',button:'GET IT BACK',act(){}}],ransom:[],bank:0}));},[id,st]);
   await page.waitForSelector(`.lostcar[data-car=${id}][data-state=${st}]`,{timeout:15000});
   cards.push(await page.evaluate(()=>{const l=document.querySelector('.lostcar');return l.dataset.car+':'+l.dataset.state+':'+[...l.querySelectorAll('img')].map(i=>i.src.split('/').pop()).join('+');}));
  }
  const s=await seen(page);
  log(cards.length===8&&cards.every(l=>{const [c,st]=l.split(':');return new RegExp(`_${st}(_overlay)?_136x50\\.png`).test(l)&&(c!=='SUPRA'||/supra_mk4_world\.png/.test(l));}),'FL-A06: impounded + wrecked art for every car on the recovery card (SUPRA = existing sprite + overlay)',cards.length+' cards');
  log(s.broken.length===0&&errs.length===0,'scene matrix: zero broken images / 404s / console errors',[...errs,...s.broken].join(' | '));await ctx.close();
 }
 // ================= the WHOLE frozen batch resolves: all 54 files load with the recorded pixel size (zero 404s for anything the plays above did not hit)
 {
  const {page,errs,ctx}=await open('seed=1',{w:270,h:480});await page.waitForSelector('.title');
  const res=await page.evaluate(async items=>{const out=[];for(const it of items){const r=await fetch('/'+it.production_path);const i=new Image();i.src='/'+it.production_path;try{await i.decode();}catch(e){}out.push({p:it.production_path,st:r.status,w:i.naturalWidth,h:i.naturalHeight,ok:r.status===200&&i.naturalWidth===it.size[0]&&i.naturalHeight===it.size[1]});}return out;},rec.items);
  log(res.length===54&&res.every(r=>r.ok),'all 54 frozen PNGs load (200) at their recorded size',res.filter(r=>!r.ok).map(r=>r.p+':'+r.st).join());await ctx.close();
 }
 const stray=[...requested].filter(p=>!FROZEN.has(p));
 log(stray.length===0,'every feel_lock request made by the game is one of the 54 frozen paths',`${requested.size} distinct frozen files requested${stray.length?' — STRAY: '+stray.join():''}`);
}catch(e){log(false,'scenario crashed',e.stack||String(e));}
await browser.close();srv.close();
console.log(failed?`\n${failed} FAILED`:'\nALL PASSED');process.exit(failed?1:0);
