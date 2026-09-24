#!/usr/bin/env node
// Presentation census — deterministic captures + objective metrics + Director lint at representative phone sizes.
// REVIEWER-ONLY output (screenshots, contact sheets, lint JSON). Never surfaced automatically to the player.
//
// Usage:
//   node tools/presentation-census.mjs [--root <repo checkout>] [--out <dir>] [--scenes docks-combat,...]
//                                      [--candidates] [--fx] [--label before|after]
// Needs Playwright (RA_PLAYWRIGHT_PATH → module dir; falls back to 'playwright-core'/'playwright')
// and Chromium (RA_CHROMIUM_PATH, else the Playwright-managed browser).
import {createRequire} from 'node:module';
import http from 'node:http';
import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';

const here=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=Object.fromEntries(process.argv.slice(2).reduce((acc,arg,i,all)=>{if(arg.startsWith('--')){const next=all[i+1];acc.push([arg.slice(2),next&&!next.startsWith('--')?next:true])}return acc},[]));
const root=path.resolve(args.root||here);
const label=args.label||'after';
const out=path.resolve(args.out||path.join(here,'work','presentation_census','REVIEWER_ONLY',label));
export const SIZES=[[360,740],[390,844],[430,932]];
const DPR=3;

const require=createRequire(import.meta.url);
function loadPlaywright(){for(const id of [process.env.RA_PLAYWRIGHT_PATH,'playwright-core','playwright'].filter(Boolean)){try{return require(id)}catch{}}throw new Error('Playwright not found: set RA_PLAYWRIGHT_PATH')}
async function chromiumPath(){if(process.env.RA_CHROMIUM_PATH)return process.env.RA_CHROMIUM_PATH;const base=path.join(process.env.LOCALAPPDATA||path.join(process.env.HOME||'','.cache'),'ms-playwright');if(!existsSync(base))return undefined;const dirs=(await readdir(base)).filter(d=>d.startsWith('chromium-')).sort().reverse();for(const d of dirs)for(const exe of ['chrome-win/chrome.exe','chrome-linux/chrome','chrome-mac/Chromium.app/Contents/MacOS/Chromium'])if(existsSync(path.join(base,d,exe)))return path.join(base,d,exe);return undefined}

// Asset metadata from THIS checkout (so legacy baselines are measured with the same yardstick).
async function assetMeta(){const ctx={window:{}};vm.createContext(ctx);vm.runInContext(await readFile(path.join(here,'js/data/presentation_assets.js'),'utf8'),ctx);return ctx.window.RAPresentationAssets}

const TYPES={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.json':'application/json','.ttf':'font/ttf','.mp3':'audio/mpeg','.ogg':'audio/ogg','.wav':'audio/wav'};
function serve(){return new Promise(resolve=>{const server=http.createServer(async(req,res)=>{try{let p=decodeURIComponent(new URL(req.url,'http://x').pathname);const base=p.startsWith('/__census/')?out:root;if(p.startsWith('/__census/'))p=p.slice(9);const file=path.join(base,p==='/'?'index.html':p);if(!file.startsWith(base))throw 0;res.writeHead(200,{'content-type':TYPES[path.extname(file)]||'application/octet-stream'});res.end(await readFile(file))}catch{res.writeHead(404);res.end()}});server.listen(0,'127.0.0.1',()=>resolve(server))})}

// ---- Scenes ----
const SCENES={
 'docks-combat':{
  title:'Docks combat (JDM importer)',
  enter:async page=>{await page.evaluate(async()=>{document.querySelector('#startOverlay')?.remove();await RAScenes.go('jdmCombat')});await page.waitForTimeout(700)},
  env:{selector:'#jdmDockBattleCanvas',asset:'assets/jdm_imports/environment/docks_night_270x480.png'},
  actors:{rich:'#geminiRich',importer:'#productionCEO',daughter:'#jdmBattleDaughter'},
  focal:['rich','importer'],
  ui:['.combat-hud .hpbox','#battleUI'],
  // Runtime variant matrix: every approved state that can appear on this screen.
  variants:[
   {id:'importer-hit',run:()=>{document.querySelector('#productionCEO').className='production-ceo state-hit'}},
   {id:'importer-defeated',run:()=>{document.querySelector('#productionCEO').className='production-ceo state-defeated'}},
   {id:'daughter-reaction',run:()=>{document.querySelector('#jdmBattleDaughter').src='assets/jdm_imports/characters/daughter/daughter_reaction.png'}},
   {id:'longest-bubble',run:()=>{RACombat.message('THE IMPORTER SHOVES RICH BACK.',60000,'importer')}},
   {id:'longest-dialogue',run:()=>{document.querySelector('#dialogue').innerHTML='THE KEYS ARE STILL WITH HIM.<br><strong>RICH ALUCARD</strong> TOOK 16 DAMAGE.'}}
  ],
  moves:['blood','bite','revenge']
 },
 'throne-combat':{
  title:'Throne-room combat (CEO)',
  enter:async page=>{await page.evaluate(async()=>{document.querySelector('#startOverlay')?.remove();await RAScenes.go('battle')});await page.waitForTimeout(700)},
  env:{selector:'.room',asset:'assets/throne_room_scene_portrait.png'},
  actors:{rich:'#geminiRich',ceo:'#productionCEO',assistant:'#productionAssistant'},
  focal:['rich','ceo'],
  ui:['.combat-hud .hpbox','#battleUI'],
  variants:[
   {id:'rich-cast',run:()=>{document.querySelector('#geminiRich').className='gemini-rich state-cast'}},
   {id:'ceo-throw',run:()=>{document.querySelector('#productionCEO').className='production-ceo state-throw'}},
   {id:'ceo-hit',run:()=>{document.querySelector('#productionCEO').className='production-ceo state-hit'}},
   {id:'ceo-authored-heavy',run:()=>{document.querySelector('#productionCEO').className='production-ceo state-hit combat-authored-ceo-heavy'}},
   {id:'ceo-defeated',run:()=>{document.querySelector('#productionCEO').className='production-ceo state-defeated'}},
   {id:'assistant-joins',run:()=>RAPresentationDirector.mark('assistantJoin',{kind:'cut'})},
   {id:'tableau-beat',run:()=>RAPresentationDirector.setBeat('tableau')},
   {id:'back-to-combat',run:()=>RAPresentationDirector.setBeat('combat')},
   {id:'longest-dialogue',run:()=>{document.querySelector('#dialogue').innerHTML='RESPAWN HUNGOVER?<br><strong>RICH ALUCARD</strong> TOOK 16 DAMAGE.'}}
  ],
  moves:['blood','bite','revenge']
 }
};

// ---- In-page measurement (identical yardstick for legacy and Director screens) ----
function measureInPage({spec,meta}){
 const screen=document.querySelector('#screen'),sr=screen.getBoundingClientRect();
 const rel=r=>({x:r.left-sr.left,y:r.top-sr.top,w:r.width,h:r.height});
 const box=(x,y,w,h)=>({x,y,w,h}),area=b=>Math.max(0,b.w)*Math.max(0,b.h);
 const inter=(a,b)=>{const x=Math.max(a.x,b.x),y=Math.max(a.y,b.y);return box(x,y,Math.min(a.x+a.w,b.x+b.w)-x,Math.min(a.y+a.h,b.y+b.h)-y)};
 const shown=el=>{if(!el)return false;const cs=getComputedStyle(el);return cs.display!=='none'&&cs.visibility!=='hidden'&&+cs.opacity>0};
 const assetOf=el=>{if(el.tagName==='IMG')return (el.getAttribute('src')||'').match(/assets\/[^?"')]+/)?.[0];const cs=getComputedStyle(el),file=(cs.backgroundImage.match(/assets\/[^"')?]+/)||[])[0],sheet=meta[file]?.sheet;if(!sheet)return file;const w=el.getBoundingClientRect().width/sheet.frameWidth;return `${file}#${Math.max(0,Math.min(sheet.frames-1,Math.round(-parseFloat(cs.backgroundPositionX||'0')/(sheet.frameWidth*w))))}`};
 const world=window.RAPresentationDirector?.worldRect?.()||box(0,0,sr.width,sr.height);
 const ui=spec.ui.flatMap(s=>[...document.querySelectorAll(s)]).filter(shown).map(el=>rel(el.getBoundingClientRect()));
 const actors={};
 for(const [slot,sel] of Object.entries(spec.actors)){const el=document.querySelector(sel);if(!shown(el))continue;const asset=assetOf(el),m=meta[asset];if(!m||m.environment)continue;const r=rel(el.getBoundingClientRect()),kx=r.w/m.width,ky=r.h/m.height;
  const sub=([x,y,w,h])=>box(r.x+x*kx,r.y+y*ky,w*kx,h*ky);actors[slot]={asset,k:kx,sprite:r,visible:sub(m.visible),face:sub(m.face),faceSource:m.faceSource}}
 const viewport={w:innerWidth,h:innerHeight};
 return {viewport,screen:{w:sr.width,h:sr.height},screenUse:(sr.width*sr.height)/(innerWidth*innerHeight),world,ui,actors,director:window.RAPresentationDirector?.current?.()?{stage:RAPresentationDirector.current().stage,mode:RAPresentationDirector.current().mode}:null};
}
async function pixelMetrics(page,spec,m){
 return page.evaluate(async({spec,m})=>{
  const load=src=>new Promise((res,rej)=>{const [file,frame]=src.split('#');const i=new Image();i.onload=()=>{const w=frame!=null?80:i.naturalWidth,c=document.createElement('canvas');c.width=w;c.height=i.naturalHeight;const g=c.getContext('2d');g.drawImage(i,frame!=null?-80*+frame:0,0);res(g.getImageData(0,0,c.width,c.height))};i.onerror=rej;i.src=file});
  const box=(x,y,w,h)=>({x,y,w,h}),area=b=>Math.max(0,b.w)*Math.max(0,b.h),inter=(a,b)=>{const x=Math.max(a.x,b.x),y=Math.max(a.y,b.y);return box(x,y,Math.min(a.x+a.w,b.x+b.w)-x,Math.min(a.y+a.h,b.y+b.h)-y)};
  const out={overlap:{},deadSpace:null};
  for(const [slot,a] of Object.entries(m.actors)){if(!spec.focal.includes(slot))continue;const img=await load(a.asset);let n=0;
   for(const r of m.ui){const clip=inter(inter(r,a.visible),m.world);if(area(clip)<=0)continue;for(let y=0;y<img.height;y++)for(let x=0;x<img.width;x++){if(img.data[(y*img.width+x)*4+3]<16)continue;n+=area(inter(box(a.sprite.x+x*a.k,a.sprite.y+y*a.k,a.k,a.k),clip))}}
   out.overlap[slot]=Math.round(n)}
  // Dead space over the visible environment region not covered by UI (legacy) / the world viewport (Director).
  const envEl=document.querySelector(spec.env.selector);if(envEl){const sr=document.querySelector('#screen').getBoundingClientRect(),er=envEl.getBoundingClientRect(),img=await load(spec.env.asset);
   const env=box(er.left-sr.left,er.top-sr.top,er.width,er.height),kx=env.w/img.width,ky=env.h/img.height,T=8;const focal=spec.focal.map(s=>m.actors[s]?.visible).filter(Boolean);let dead=0,total=0;
   const view=inter(m.world,box(0,0,sr.width,sr.height));
   for(let ty=0;ty<img.height;ty+=T*Math.max(1,Math.round(img.height/480)))for(let tx=0;tx<img.width;tx+=T*Math.max(1,Math.round(img.width/270))){const step=T*Math.max(1,Math.round(img.width/270));const tile=box(env.x+tx*kx,env.y+ty*ky,step*kx,step*ky);let w=area(inter(tile,view))/area(tile);if(w<=0)continue;for(const r of m.ui)w-=area(inter(tile,r))/area(tile);if(w<=0)continue;total+=w;if(focal.some(b=>area(inter(tile,b))>0))continue;
    const lum=[];for(let y=ty;y<Math.min(img.height,ty+step);y++)for(let x=tx;x<Math.min(img.width,tx+step);x++){const o=(y*img.width+x)*4;lum.push(.3*img.data[o]+.59*img.data[o+1]+.11*img.data[o+2])}
    const s=[...lum].sort((p,q)=>p-q),med=s[s.length>>1];if(lum.filter(v=>Math.abs(v-med)>12).length/lum.length<.15)dead+=w}
   out.deadSpace=total?Math.round(dead/total*1000)/1000:null}
  return out;
 },{spec:{focal:spec.focal,env:spec.env},m});
}
const plain=spec=>({actors:spec.actors,ui:spec.ui,focal:spec.focal,env:spec.env});
function summarize(m,px,spec){
 const ref=m.actors.rich,refMeta=ref?ref.visible.h:0,rows={};
 rows.screenUse=+m.screenUse.toFixed(3);
 rows.worldH=Math.round(m.world.h);
 for(const slot of spec.focal){const a=m.actors[slot];if(!a)continue;rows[`${slot}.bodyPx`]=Math.round(a.visible.h);rows[`${slot}.bodyOfScreen`]=+(a.visible.h/m.screen.h).toFixed(3);rows[`${slot}.bodyOfWorld`]=+(a.visible.h/m.world.h).toFixed(3);rows[`${slot}.facePx`]=Math.round(a.face.h);rows[`${slot}.uiOverlapPx`]=px.overlap[slot]??null}
 rows.deadSpace=px.deadSpace;return rows;
}
async function freeze(page){await page.addStyleTag({content:'*,*:before,*:after{animation-play-state:paused!important;transition:none!important;caret-color:transparent!important}'});await page.evaluate(()=>document.getAnimations().forEach(a=>a.pause()))}

async function sheet(page,base,title,cells,file){
 // Contact sheet rendered in-browser from the captured PNGs (labels only; no scene prose).
 const html=`<html><body style="margin:0;background:#15121f;color:#f6efd9;font:14px monospace"><div style="padding:10px 14px;font-weight:bold">${title}</div><div style="display:flex;gap:14px;padding:0 14px 14px;flex-wrap:wrap">${cells.map(c=>`<figure style="margin:0;width:${c.w}px"><img src="${base}/__census/${c.file}" style="width:${c.w}px;display:block;image-rendering:pixelated"><figcaption style="padding-top:6px;white-space:pre-wrap">${c.caption}</figcaption></figure>`).join('')}</div></body></html>`;
 await page.setViewportSize({width:Math.min(3000,cells.reduce((s,c)=>s+c.w+14,14)),height:1200});await page.setContent(html);await page.waitForTimeout(300);await page.evaluate(()=>Promise.all([...document.images].map(i=>i.decode().catch(()=>{}))));await page.screenshot({path:path.join(out,file),fullPage:true});
}
function seeded(order,seed){const a=[...order];let s=seed>>>0;for(let i=a.length-1;i>0;i--){s=(Math.imul(s,1664525)+1013904223)>>>0;const j=s%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}

export async function census(){
 await mkdir(out,{recursive:true});
 const meta=await assetMeta(),{chromium}=loadPlaywright(),browser=await chromium.launch({executablePath:await chromiumPath()}),server=await serve(),base=`http://127.0.0.1:${server.address().port}`;
 const scenes=(args.scenes?String(args.scenes).split(','):['docks-combat']);const report={label,root,generated:new Date().toISOString(),dpr:DPR,scenes:{}};const errors=[];
 async function open(W,H){const page=await browser.newPage({viewport:{width:W,height:H},deviceScaleFactor:DPR});page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{let s=20260924;Math.random=()=>((s=Math.imul(s^s>>>15,2246822519)+0x9e3779b9|0)>>>0)/4294967296;try{localStorage.clear()}catch{}});
  await page.goto(base+'/');await page.waitForTimeout(500);return page}
 try{
  for(const id of scenes){const spec=SCENES[id];if(!spec)throw new Error(`unknown scene ${id}`);const entry=report.scenes[id]={title:spec.title,sizes:{}};
   for(const [W,H] of SIZES){const page=await open(W,H);await spec.enter(page);await freeze(page);
    const file=`${id}-${label}-${W}x${H}.png`;await page.screenshot({path:path.join(out,file)});
    const m=await page.evaluate(measureInPage,{spec:plain(spec),meta}),px=await pixelMetrics(page,spec,m);
    const row={file,metrics:summarize(m,px,spec),measured:m};
    row.lint=await page.evaluate(()=>window.RAPresentationDirector?.lint?.()??null);
    if(row.lint){row.variants=[];for(const v of spec.variants){await page.evaluate(`(${v.run})()`);await page.waitForTimeout(60);const vl=await page.evaluate(()=>RAPresentationDirector.lint());const vm2=await page.evaluate(measureInPage,{spec:plain(spec),meta}),vpx=await pixelMetrics(page,spec,vm2);row.variants.push({id:v.id,pass:vl.pass,failed:vl.checks.filter(c=>!c.pass),metrics:summarize(vm2,vpx,spec)});if(W===390){const vf=`${id}-${label}-${W}x${H}-variant-${v.id}.png`;await page.screenshot({path:path.join(out,vf)});}}
     await page.close();const fresh=await open(W,H);await spec.enter(fresh);await freeze(fresh);
     if(args.candidates&&W===390)row.candidates=await candidates(fresh,id);
     if(args.fx)row.fx=await fxRun(fresh,id,spec,W,H);
     await fresh.close();
    }else await page.close();
    entry.sizes[`${W}x${H}`]=row;
   }
  }
  // Contact sheet across sizes.
  const sp=await browser.newPage();
  for(const id of scenes){const cells=Object.entries(report.scenes[id].sizes).map(([k,r])=>({file:r.file,w:260,caption:`${k}\nbody ${r.metrics['rich.bodyPx']}px (${r.metrics['rich.bodyOfScreen']} scr / ${r.metrics['rich.bodyOfWorld']} world)\nface ${r.metrics['rich.facePx']}px  overlap ${r.metrics['rich.uiOverlapPx']}/${Object.entries(r.metrics).filter(([k])=>k.endsWith('uiOverlapPx')&&!k.startsWith('rich')).map(([,v])=>v).join('/')}\ndead ${r.metrics.deadSpace}  lint ${r.lint?(r.lint.pass?'PASS':'FAIL'):'n/a'}`}));
   await sheet(sp,base,`${SCENES[id].title} — ${label} — REVIEWER ONLY`,cells,`${id}-${label}-sheet.png`);
   for(const r of Object.values(report.scenes[id].sizes))if(r.candidates){const {order1,order2,cells:cand}=r.candidates;
    await sheet(sp,base,`${SCENES[id].title} — candidates pass 1 — REVIEWER ONLY`,order1.map((c,i)=>({file:cand[c].file,w:260,caption:`${'ABCDEF'[i]}`})),`${id}-candidates-pass1.png`);
    await sheet(sp,base,`${SCENES[id].title} — candidates pass 2 (shuffled) — REVIEWER ONLY`,order2.map((c,i)=>({file:cand[c].file,w:260,caption:`${'ABCDEF'[i]}`})),`${id}-candidates-pass2.png`);}}
  await sp.close();
 }finally{report.errors=errors;await writeFile(path.join(out,`census-${label}.json`),JSON.stringify(report,null,1));await browser.close();server.close()}
 return report;
}

// SEARCH candidates rendered with the real UI, linted, and laid out for the two-pass shuffled judge.
async function candidates(page,id){
 const list=await page.evaluate(()=>{const c=RAPresentationDirector.current();const f=c.frame;return RAPresentationDirector.search({...f.spec}).map(x=>({id:x.id,contact:x.contact,zoom:x.zoom}))});
 const cells={};
 for(const c of list){await page.evaluate(({contact,zoom})=>{window.__pdPreview?.restore();window.__pdPreview=RAPresentationDirector.preview({contact,zoom})},c);await page.waitForTimeout(50);
  const lint=await page.evaluate(()=>RAPresentationDirector.lint());const file=`${id}-candidate-${c.id}.png`;await page.screenshot({path:path.join(out,file)});
  cells[c.id]={...c,file,pass:lint.pass,failed:lint.checks.filter(x=>!x.pass).map(x=>`${x.id}=${x.value}`),metrics:lint.metrics}}
 await page.evaluate(()=>window.__pdPreview?.restore());
 const legal=Object.keys(cells).filter(k=>cells[k].pass);
 return {cells,legal,order1:legal,order2:seeded(legal,7)};
}

// FX run: plays each move for real and samples every visible world-attached effect against the world viewport.
async function fxRun(page,id,spec,W,H){
 const results={};
 for(const move of spec.moves){
  await page.evaluate(()=>{document.querySelectorAll('style').forEach(s=>{if(s.textContent.includes('animation-play-state:paused!important'))s.remove()});document.getAnimations().forEach(a=>a.play())});
  await page.evaluate(move=>{
   const fxSel=(RAPresentationData.fx||[]).map(f=>f.el).concat(['.detailed-blood-missile','.detailed-impact','.blood-bath-contact-layer','.vampire-bite-contact','.contact-fragment','.revenge-wound','.revenge-crack','#toast.jdm-speaker-bubble']);
   const world=RAPresentationDirector.worldRect(),sr=document.querySelector('#screen').getBoundingClientRect(),out=window.__fxSamples=[];window.__fxStop=false;
   const sample=()=>{for(const sel of fxSel)for(const el of document.querySelectorAll(sel)){const cs=getComputedStyle(el);if(cs.display==='none'||+cs.opacity<.05||cs.visibility==='hidden')continue;const r=el.getBoundingClientRect();if(!r.width||!r.height)continue;const x=r.left-sr.left+r.width/2,y=r.top-sr.top+r.height/2;out.push({sel,x:Math.round(x),y:Math.round(y),inside:x>=world.x&&x<=world.x+world.w&&y>=world.y&&y<=world.y+world.h})}if(!window.__fxStop)requestAnimationFrame(sample)};
   requestAnimationFrame(sample);
   document.querySelector('[data-main="fight"]').click();setTimeout(()=>document.querySelector(`[data-move="${move}"]`).click(),50);
  },move);
  if(W===390)for(const t of [450,900,1500]){await page.waitForTimeout(t-(t===450?0:t===900?450:900));await page.screenshot({path:path.join(out,`${id}-${label}-${W}x${H}-fx-${move}-${t}ms.png`)})}
  const samples=await page.evaluate(async()=>{const t0=performance.now();while(performance.now()-t0<9000){await new Promise(r=>setTimeout(r,100));if(!RACombat.snapshot().busy&&performance.now()-t0>800)break;if(document.querySelector('#octopusOverlay.on'))document.querySelector('[data-octo]')?.click()}window.__fxStop=true;return window.__fxSamples});
  const bySel={};for(const s of samples){const b=bySel[s.sel]||(bySel[s.sel]={frames:0,outside:0});b.frames++;if(!s.inside){b.outside++;(b.examples||(b.examples=[])).length<3&&b.examples.push([s.x,s.y])}}
  results[move]={samples:samples.length,effects:bySel,pass:Object.values(bySel).every(b=>b.outside===0)};
 }
 return results;
}

if(process.argv[1]===fileURLToPath(import.meta.url)){const r=await census();for(const [id,s] of Object.entries(r.scenes))for(const [k,row] of Object.entries(s.sizes))console.log(`${id} ${k} ${JSON.stringify(row.metrics)} lint=${row.lint?row.lint.pass:'n/a'}`);if(r.errors.length)console.log('PAGE ERRORS',r.errors);console.log(`REVIEWER-ONLY output: ${out}`)}
