#!/usr/bin/env node
// Presentation sweep — renders EVERY distinct adventure screen (from the adapter dry run) through the real
// adventure scene in DEV, live-lints it with the real UI at 360×740 / 390×844 / 430×932 and captures 390×844
// frames into REVIEWER-ONLY contact sheets. PLAYER-BLIND: never surfaced to the player; labels are screen keys only.
// Usage: RA_PLAYWRIGHT_PATH=… node tools/presentation-sweep.mjs [--out dir] [--only key-substring]
import {createRequire} from 'node:module';
import http from 'node:http';
import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {dryRun} from './presentation-adventure-dryrun.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=Object.fromEntries(process.argv.slice(2).reduce((acc,arg,i,all)=>{if(arg.startsWith('--')){const next=all[i+1];acc.push([arg.slice(2),next&&!next.startsWith('--')?next:true])}return acc},[]));
const out=path.resolve(args.out||path.join(root,'work','presentation_census','REVIEWER_ONLY','sweep-adventures'));
const SIZES=[[360,740],[390,844],[430,932]],DPR=3;
const require=createRequire(import.meta.url);
function loadPlaywright(){for(const id of [process.env.RA_PLAYWRIGHT_PATH,'playwright-core','playwright'].filter(Boolean)){try{return require(id)}catch{}}throw new Error('Playwright not found: set RA_PLAYWRIGHT_PATH')}
async function chromiumPath(){if(process.env.RA_CHROMIUM_PATH)return process.env.RA_CHROMIUM_PATH;const base=path.join(process.env.LOCALAPPDATA||path.join(process.env.HOME||'','.cache'),'ms-playwright');if(!existsSync(base))return undefined;for(const d of (await readdir(base)).filter(d=>d.startsWith('chromium-')).sort().reverse())for(const exe of ['chrome-win/chrome.exe','chrome-linux/chrome'])if(existsSync(path.join(base,d,exe)))return path.join(base,d,exe)}
const TYPES={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.json':'application/json','.ttf':'font/ttf','.mp3':'audio/mpeg'};
function serve(){return new Promise(resolve=>{const s=http.createServer(async(req,res)=>{try{let p=decodeURIComponent(new URL(req.url,'http://x').pathname);const base=p.startsWith('/__out/')?out:root;if(p.startsWith('/__out/'))p=p.slice(6);const f=path.join(base,p==='/'?'index.html':p);res.writeHead(200,{'content-type':TYPES[path.extname(f)]||'application/octet-stream'});res.end(await readFile(f))}catch{res.writeHead(404);res.end()}});s.listen(0,'127.0.0.1',()=>resolve(s))})}

// In-page: jump the real adventure scene to a node of this screen and return the live lint.
async function showScreen(page,row){
 return page.evaluate(async ({refs,env,cast})=>{
  const skip=n=>!n||n.end||n.minigame||n.fight||(!n.lines&&!n.choices&&!n.route);
  let ref=refs.find(r=>{const [a,id]=r.split(':');return !skip(RAAdventures.get(a)?.nodes?.[id])})||refs[0];
  const [adv,node]=ref.split(':');
  if(RAAdventures.active())RAAdventures.abandon();
  // Seed the environment/cast real play would have inherited from earlier nodes.
  RAAdventures.start(adv,{from:'dev'});RAAdventures.patchActive({node,titles:[node],env,actors:cast});
  await RAScenes.go('adventure',{node});await new Promise(r=>setTimeout(r,700));
  document.querySelectorAll('.adv-title:not([hidden])').forEach(t=>t.hidden=true);
  document.getAnimations().forEach(a=>{a.pause();a.currentTime=0});
  const lint=await RAPresentationDirector.lint();
  const a=RAAdventures.active();const key=a?RAPresentationData.screenKey(a.env,a.actors):null;
  return {ref,key,lint:lint&&{pass:lint.pass,failed:lint.checks.filter(c=>!c.pass).map(c=>`${c.id}=${c.value}`),metrics:lint.metrics,profile:lint.profile,exception:lint.exception?.ticket||null},director:!!RAPresentationDirector.current()};
 },{refs:row.refs,env:row.env,cast:row.castSpecs});
}

export async function sweep(){
 await mkdir(out,{recursive:true});
 const dr=await dryRun(),rows=dr.rows.filter(r=>!args.only||r.key.includes(args.only));
 const {chromium}=loadPlaywright(),browser=await chromium.launch({executablePath:await chromiumPath()}),server=await serve(),base=`http://127.0.0.1:${server.address().port}`;
 const results=Object.fromEntries(rows.map(r=>[r.key,{key:r.key,exception:r.exception,sizes:{}}]));const errors=[];
 try{
  for(const [W,H] of SIZES){
   const page=await browser.newPage({viewport:{width:W,height:H},deviceScaleFactor:DPR});page.on('pageerror',e=>errors.push(`${W}: ${e.message}`));
   await page.addInitScript(()=>{let s=20260925;Math.random=()=>((s=Math.imul(s^s>>>15,2246822519)+0x9e3779b9|0)>>>0)/4294967296;try{localStorage.clear()}catch{}});
   await page.goto(base+'/?dev=1');await page.waitForTimeout(600);
   await page.evaluate(()=>{document.querySelector('#startOverlay')?.remove();document.querySelector('#devPanel')?.classList.remove('show')});
   for(const [i,row] of rows.entries()){
    try{const r=await showScreen(page,row);results[row.key].sizes[`${W}x${H}`]=r;
     if(W===390){const file=`screen-${String(i).padStart(3,'0')}.png`;await page.screenshot({path:path.join(out,file)});results[row.key].file=file}}
    catch(e){errors.push(`${row.key} @${W}: ${e.message}`)}
   }
   await page.close();
  }
  // Contact sheets, 12 screens per sheet, labelled by index + pass/exception only.
  const list=Object.values(results).filter(r=>r.file),sp=await browser.newPage();
  for(let s=0;s*12<list.length;s++){const cells=list.slice(s*12,s*12+12);
   const html=`<body style="margin:0;background:#15121f;color:#f6efd9;font:12px monospace"><div style="padding:8px">WAVE 1 ADVENTURE SWEEP — sheet ${s+1} — REVIEWER ONLY / PLAYER-BLIND</div><div style="display:grid;grid-template-columns:repeat(6,220px);gap:10px;padding:0 8px 8px">${cells.map(c=>{const l=c.sizes['390x844']?.lint;return `<figure style="margin:0"><img src="${base}/__out/${c.file}" style="width:220px;display:block"><figcaption>${c.file.replace('.png','')} ${l?.pass?'PASS':'FAIL'}${c.exception?' '+c.exception:''} ${l?.profile||''} ${l?.metrics?.body??''}</figcaption></figure>`}).join('')}</div></body>`;
   await sp.setViewportSize({width:1400,height:1100});await sp.setContent(html);await sp.evaluate(()=>Promise.all([...document.images].map(i=>i.decode().catch(()=>{}))));await sp.screenshot({path:path.join(out,`sheet-${s+1}.png`),fullPage:true});}
  await sp.close();
 }finally{await browser.close();server.close()}
 const summary={screens:rows.length,errors,pass:0,fail:0,exceptions:0,failures:{},noDirector:[]};
 for(const r of Object.values(results)){const all=SIZES.map(([W,H])=>r.sizes[`${W}x${H}`]);if(all.some(x=>!x?.director))summary.noDirector.push(r.key);
  const ok=all.every(x=>x?.lint?.pass);if(r.exception)summary.exceptions++;if(ok)summary.pass++;else{summary.fail++;for(const x of all)for(const f of x?.lint?.failed||[])summary.failures[f.split('=')[0].split(':')[0]]=(summary.failures[f.split('=')[0].split(':')[0]]||0)+1}}
 await writeFile(path.join(out,'sweep.json'),JSON.stringify({summary,results},null,1));
 return summary;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){const s=await sweep();console.log(JSON.stringify(s,null,1));console.log(`REVIEWER-ONLY output: ${out}`)}
