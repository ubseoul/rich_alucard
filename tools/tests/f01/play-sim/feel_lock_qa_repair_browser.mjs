// THE PLAY — F01 FROZEN ART · QA REPAIR 001 targeted regression (real Chromium). Not part of `npm test` (needs a browser):
//   node tools/tests/f01/play-sim/feel_lock_qa_repair_browser.mjs [--shots dir] [--port 8150]
// Drives the three scenes the adversarial QA flagged, at 360 / 390 / 430, and MEASURES them (screenshots are evidence, the numbers are the gate):
//   1. RETURN 5-item haul  — none of the five loot pieces overlap Rich or each other, all stay inside the stage, the label of each is inside the stage and clear of Rich
//   2. OBA flash           — the frozen FL-A04 sprite is fully inside the 270x480 stage at every sampled frame and sits inside the phone screen opening
//   3. ARRIVAL crew spawn  — the first frame of every crew member has its FEET below the parked vehicle's body (pavement / vehicle side), not on its roof
// Presentation geometry only: no timing, gameplay, copy or asset change is asserted or allowed here (feel_gate.mjs + feel_lock_art_browser.mjs stay the behaviour gates).
import {createRequire} from 'node:module';import fs from 'node:fs';import path from 'node:path';
const require=createRequire(process.env.RA_PLAYWRIGHT_PATH||'/opt/node22/lib/node_modules/');
const {chromium}=require('playwright');
import {serve} from './serve-play.mjs';
const arg=(k,d)=>{const i=process.argv.indexOf('--'+k);return i>=0?process.argv[i+1]:d;};
const SHOTS=arg('shots',''),PORT=+arg('port',8150),TAG=arg('tag','');
const CHROME=process.env.RA_CHROME||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
if(SHOTS)fs.mkdirSync(SHOTS,{recursive:true});
let failed=0;const log=(ok,name,detail='')=>{if(!ok)failed++;console.log(`${ok?'PASS':'FAIL'} ${name}${detail?' — '+detail:''}`);return ok;};
const srv=await serve(PORT);const base=`http://127.0.0.1:${PORT}/assets/f01/play/index.html`;
const browser=await chromium.launch({headless:true,executablePath:fs.existsSync(CHROME)?CHROME:undefined});
const VIEWS=[[360,640],[390,844],[430,932]];
const CREW=[{id:'g101',name:'BIG DON',short:'Don',cls:'MUSCLE',named:false,gun:'pistol'},{id:'g102',name:'LIL K',short:'K',cls:'SHOOTER',named:false,gun:'pistol'},{id:'g103',name:'MO',short:'Mo',cls:'DOC',named:false,gun:'pistol'},{id:'tunde',name:'TUNDE',short:'Tunde',cls:'MUSCLE',named:true,gun:'pistol'}];
const rects=(a,b,pad=0)=>!(a.r+pad<=b.l||b.r+pad<=a.l||a.b+pad<=b.t||b.b+pad<=a.t);   // do two {l,t,r,b} boxes intersect
const inside=(a,S={l:0,t:0,r:270,b:480})=>a.l>=S.l&&a.t>=S.t&&a.r<=S.r&&a.b<=S.b;
const page$=async(w,h,q='')=>{const ctx=await browser.newContext({viewport:{width:w,height:h},deviceScaleFactor:1});const page=await ctx.newPage();const errs=[];
 page.on('pageerror',e=>errs.push('pageerror: '+e.message));page.on('console',m=>{if(m.type()==='error'&&!/favicon/.test(m.text()))errs.push('console: '+m.text().slice(0,200));});
 page.on('response',r=>{if(r.status()>=400&&!/favicon/.test(r.url()))errs.push('http '+r.status()+' '+r.url());});
 await page.goto(`${base}?fresh=1&mute=1&${q}`);await page.waitForSelector('.title');return {page,ctx,errs};};
const shot=async(page,n)=>{if(SHOTS)await page.screenshot({path:path.join(SHOTS,(TAG?TAG+'_':'')+n+'.png')});};
// stage-space geometry helper injected into the page: every rect is reported in 270x480 stage px (screen scaling removed)
const GEO=`window.__g=(n)=>{const st=document.getElementById('stage').getBoundingClientRect(),k=st.width/270;const r=n.getBoundingClientRect();return {l:(r.left-st.left)/k,t:(r.top-st.top)/k,r:(r.right-st.left)/k,b:(r.bottom-st.top)/k};};`;
// the visible (non-transparent) pixel box of an <img>, in stage px — so "overlap" means the drawn art, not its transparent 48x48 / 80x96 canvas
const RICH=`window.__richInk=()=>{const e=document.querySelector('.rich'),g=window.__g(e),k=(g.r-g.l)/50;return {l:g.l+10*k,t:g.t+36*k,r:g.l+38*k,b:g.t+88*k};};`;   // Rich's drawn body inside his 50x96 sheet cell (ink x 10..38, y 36..88), at the scale(1.2) the scene applies
const INK=`window.__ink=(img)=>{if(!img||!img.naturalWidth)return null;const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;const x=c.getContext('2d');x.drawImage(img,0,0);const d=x.getImageData(0,0,c.width,c.height).data;let l=1e9,t=1e9,r=-1,b=-1;
 for(let j=0;j<c.height;j++)for(let i=0;i<c.width;i++)if(d[(j*c.width+i)*4+3]>16){if(i<l)l=i;if(i>r)r=i;if(j<t)t=j;if(j>b)b=j;}
 const g=window.__g(img),sx=(g.r-g.l)/c.width,sy=(g.b-g.t)/c.height;return r<0?null:{l:g.l+l*sx,t:g.t+t*sy,r:g.l+(r+1)*sx,b:g.t+(b+1)*sy};};`;

try{
 for(const [w,h] of VIEWS){
  // ================= 1. RETURN — five loot pieces
  {
   const {page,ctx,errs}=await page$(w,h,'speed=10');await page.evaluate(GEO+INK+RICH);
   // longest real label shape (26 chars + "→ CREW") on the piece that lands beside Rich, so the worst-case label width is what is measured
   const items=[{cat:'GUN',gun:'sapporo_shotgun',rar:'RARE',name:'a Sapporo Shotgun',to:'tunde'},{cat:'CASH',rar:'COMMON',name:'a cash crate'},{cat:'MOD',rar:'LEGENDARY',name:'a mod'},{cat:'BLOOD_X',rar:'RARE',name:'BLOOD X'},{cat:'WEIRD',rar:'COMMON',name:'Church Bake-Sale Float, Sealed'}];
   await page.evaluate(([crew,items])=>{window.__done=false;import('/assets/f01/play/feel-scenes.mjs').then(async V=>{await V.returnScene({rec:{shape:'COLLECT',car:'S2000',win:true,lost:{cars:[],guns:[]},gunGifts:[],crew:['g101','g102','g103','tunde'],finalStatus:{g101:'READY',g102:'WOUNDED',g103:'SHOT',tunde:'READY'},received:{cash:40,items}},crewObjs:crew,w:{},bankBefore:0});window.__done=true;});},[CREW,items]);
   // the instant each piece has landed: its own label (only the newest label is live), Rich's drawn body, the haul's drawn pixels
   const seen=[];
   for(let i=1;i<=5;i++){
    await page.waitForFunction(n=>document.querySelectorAll('.lootitem').length>=n&&document.querySelectorAll('.lootlab').length>=n,i,{timeout:60000});
    await page.waitForTimeout(80);
    seen.push(await page.evaluate(()=>{const it=[...document.querySelectorAll('.lootitem')].at(-1),lab=[...document.querySelectorAll('.lootlab')].at(-1);
     return {name:it.dataset.loot,ink:window.__ink(it.querySelector('img')),box:window.__g(it),lab:window.__g(lab),labText:lab.textContent,rich:window.__richInk(),bag:window.__ink(document.querySelector('.bag img'))};}));
    if(i===5)await shot(page,`return_5item_${w}`);
   }
   const A=await page.evaluate(()=>[...document.querySelectorAll('.lootitem')].map(n=>({name:n.dataset.loot,ink:window.__ink(n.querySelector('img')),box:window.__g(n)})));
   const rich=seen[0].rich,bag=seen[0].bag,PAD=3;
   const R=`Rich ${rich.l.toFixed(0)}-${rich.r.toFixed(0)}x${rich.t.toFixed(0)}-${rich.b.toFixed(0)}`;
   log(A.length===5,`${w}: five loot pieces on screen`,A.map(a=>a.name).join(' | '));
   log(A.every(a=>a.ink&&inside(a.box)&&inside(a.ink)),`${w}: every loot piece (box and drawn art) is fully inside the 270x480 stage`);
   log(A.every(a=>!rects(a.ink,rich,PAD)),`${w}: no loot piece overlaps Rich (drawn body, ≥${PAD}px clear)`,A.map(a=>`${Math.round(a.ink.l)}-${Math.round(a.ink.r)}x${Math.round(a.ink.t)}-${Math.round(a.ink.b)}`).join(' ')+` | ${R}`);
   let pair=0;for(let i=0;i<A.length;i++)for(let j=i+1;j<A.length;j++)if(rects(A[i].box,A[j].box,-0.5))pair++;   // -0.5: sub-pixel tolerance at fractional stage scales (touching boxes are not overlap)
   log(pair===0,`${w}: no two loot slots overlap each other`);
   log(A.every(a=>!rects(a.ink,bag,PAD)),`${w}: no loot piece touches the cash haul (haul stays the focal read)`,`haul ${Math.round(bag.l)}-${Math.round(bag.r)}x${Math.round(bag.t)}-${Math.round(bag.b)}`);
   log(seen.every(s=>inside(s.lab)),`${w}: every label is fully inside the stage (readable, not clipped)`,seen.map(s=>`${s.labText}@${Math.round(s.lab.l)}-${Math.round(s.lab.r)}x${Math.round(s.lab.t)}-${Math.round(s.lab.b)}`).join(' | '));
   log(seen.every(s=>!rects(s.lab,s.rich,PAD)&&!rects(s.lab,s.bag,PAD)),`${w}: no label runs over Rich or the cash haul`);
   // a label must not cover the art of any piece (its own or one already down)
   let cover=0;for(const [i,s] of seen.entries())for(const a of A.slice(0,i+1))if(rects(s.lab,a.ink))cover++;
   log(cover===0,`${w}: no label covers any loot piece`);
   const st=await page.evaluate(()=>({crew:[...document.querySelectorAll('.bust')].map(b=>b.dataset.oga),counted:document.querySelector('.count .amt').textContent}));
   log(/^TAKE: \$40,000$/.test(st.counted),`${w}: the TAKE line is unchanged and still readable`,st.counted);
   log(errs.length===0,`${w}: RETURN zero console errors / 404s`,errs.join(' | '));await ctx.close();
  }
  // ================= 2. OBA — the feed cuts, the frozen sprite flashes
  {
   const {page,ctx,errs}=await page$(w,h,'speed=1');await page.evaluate(GEO+INK);
   await page.evaluate(([crew])=>{window.__ctl=null;import('/assets/f01/play/feel-scenes.mjs').then(async V=>{window.__ctl=await V.roomScene({crewObjs:crew,defense:false});window.__ctl.cut({who:'g101',text:'THE FEED CUTS',oba:true,pause:1500});});},[CREW]);
   await page.waitForSelector('.obashade img',{timeout:20000});
   const samples=[];
   for(let i=0;i<12;i++){
    samples.push(await page.evaluate(()=>{const s=document.querySelector('.obashade img');if(!s)return null;const ph=document.querySelector('.phone');const op=+getComputedStyle(document.querySelector('.obashade')).opacity;
     return {ink:window.__ink(s),img:window.__g(s),phone:window.__g(ph),op};}));
    if(i===4)await shot(page,`oba_flash_${w}`);
    await page.waitForTimeout(110);
   }
   const live=samples.filter(Boolean);
   log(live.length>=6,`${w}: Oba sprite sampled across the flash`,`${live.length} frames`);
   log(live.every(s=>inside(s.img)),`${w}: Oba sprite is fully inside the 270x480 stage on every frame`,live.map(s=>`${s.img.l.toFixed(0)}..${s.img.r.toFixed(0)}`).slice(0,3).join(' / '));
   log(live.every(s=>s.ink&&s.ink.l>=s.phone.l-0.5&&s.ink.r<=s.phone.r+0.5&&s.ink.t>=s.phone.t&&s.ink.b<=s.phone.b),`${w}: the drawn Oba figure sits inside the phone screen (reads as the feed cutting to him)`,live[0]&&`figure ${live[0].ink.l.toFixed(0)}-${live[0].ink.r.toFixed(0)}x${live[0].ink.t.toFixed(0)}-${live[0].ink.b.toFixed(0)} in phone ${live[0].phone.l.toFixed(0)}-${live[0].phone.r.toFixed(0)}x${live[0].phone.t.toFixed(0)}-${live[0].phone.b.toFixed(0)}`);
   log(live.some(s=>s.op>=.8),`${w}: same opacity curve — peaks at .85`,`peak ${Math.max(...live.map(s=>s.op)).toFixed(2)}`);
   log(errs.length===0,`${w}: OBA zero console errors / 404s`,errs.join(' | '));await ctx.close();
  }
  // ================= 3. ARRIVAL — crew spawn on pavement / vehicle side, not on the roof
  {
   const {page,ctx,errs}=await page$(w,h,'speed=3');await page.evaluate(GEO+INK);
   await page.evaluate(([crew])=>{import('/assets/f01/play/feel-scenes.mjs').then(V=>V.arriveScene({slide:{seats:crew.slice(0,3).map(c=>({id:c.id}))},crewObjs:crew,carId:'URUS',defense:false,job:{id:'car_wash_stickup',name:'car wash stickup'}}));},[CREW]);
   const firsts=[];const seenIds=new Set();let shotDone=false;
   const t0=Date.now();
   while(Date.now()-t0<40000&&firsts.length<3){
    const f=await page.evaluate(()=>{const b=[...document.querySelectorAll('.bust')].find(x=>+getComputedStyle(x).opacity>.5);const c=document.querySelector('.car');if(!b||!c)return null;
     const im=b.querySelector('img.ogs');const ci=window.__ink(c.querySelector('.c-base')),bi=window.__ink(im);if(!ci||!bi)return null;return {id:b.dataset.oga,pose:b.dataset.pose,ink:bi,car:window.__g(c),carInk:ci,left:b.style.left,top:b.style.top};});
    if(f&&!seenIds.has(f.id)){seenIds.add(f.id);firsts.push(f);if(!shotDone){shotDone=true;await shot(page,`arrival_crew_${w}`);}}
    await page.waitForTimeout(30);
   }
   log(firsts.length===3,`${w}: three crew members spawned`,firsts.map(f=>f.id).join());
   // the car body's drawn box vs the figure's feet: feet must be BELOW the car's roof line and never inside the roof/top band of the drawn body
   log(firsts.every(f=>f.carInk&&f.ink&&f.ink.b>=f.carInk.b+6),`${w}: each crew member's feet land on the pavement at the vehicle's side (feet ≥ 6px below the car body's bottom edge), not on the roof`,firsts.map(f=>`feet ${f.ink.b.toFixed(0)} vs car ${f.carInk.t.toFixed(0)}..${f.carInk.b.toFixed(0)}`).join(' | '));
   log(firsts.every(f=>f.ink&&inside(f.ink)),`${w}: crew figures stay inside the stage at spawn`);
   log(firsts.every(f=>f.pose==='standing'||f.pose==='walking'),`${w}: arrival sequence unchanged (standing → walking)`,firsts.map(f=>f.pose).join());
   await page.waitForSelector('.bust',{state:'detached',timeout:40000}).catch(()=>{});
   log(errs.length===0,`${w}: ARRIVAL zero console errors / 404s`,errs.join(' | '));await ctx.close();
  }
 }
}catch(e){log(false,'scenario crashed',e.stack||String(e));}
await browser.close();srv.close();
console.log(failed?`\n${failed} FAILED`:'\nALL PASSED');process.exit(failed?1:0);
