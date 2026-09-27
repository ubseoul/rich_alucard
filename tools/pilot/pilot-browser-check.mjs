#!/usr/bin/env node
// BTF TEST PILOT — browser self-check of the in-page control layer (js/systems/test_pilot.js). Engineering 06.
// Proves: the layer is absent on a player page; with ?dev=1 every named scenario loads with 0 page errors and returns
// its declared seeds; a replayed launch reaches the named node with the cast a player would have (not an isolated
// jump). Results are DEV-REACHABLE evidence only.
// Usage: RA_PLAYWRIGHT_PATH=… RA_CHROMIUM_PATH=… node tools/pilot/pilot-browser-check.mjs [--out dir]
import {createRequire} from 'node:module';import http from 'node:http';import path from 'node:path';
import {readFile,writeFile,mkdir} from 'node:fs/promises';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','..');const require=createRequire(import.meta.url);
const outDir=(()=>{const i=process.argv.indexOf('--out');return i>0?process.argv[i+1]:path.join(root,'work','pilot')})();
const T={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.json':'application/json','.ttf':'font/ttf','.wav':'audio/wav'};
const server=await new Promise(r=>{const s=http.createServer(async(q,res)=>{try{const p=decodeURIComponent(new URL(q.url,'http://x').pathname);const f=path.join(root,p==='/'?'index.html':p);res.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'});res.end(await readFile(f));}catch{res.writeHead(404);res.end();}}).listen(0,'127.0.0.1',()=>r(s))});
const base=`http://127.0.0.1:${server.address().port}`;const {chromium}=require(process.env.RA_PLAYWRIGHT_PATH||'playwright-core');
const browser=await chromium.launch({executablePath:process.env.RA_CHROMIUM_PATH});const results=[];const errors=[];
try{
 const player=await browser.newPage({viewport:{width:390,height:844}});player.on('pageerror',e=>errors.push(`player: ${e.message}`));
 await player.goto(base+'/');await player.waitForTimeout(800);results.push({check:'absent on a player page',pass:!(await player.evaluate(()=>!!window.RATestPilot))});await player.close();
 const scenarios=await (async()=>{const p=await browser.newPage();await p.goto(base+'/?dev=1');await p.waitForTimeout(800);const s=await p.evaluate(()=>Object.keys(RATestPilot.scenarios()));await p.close();return s})();
 for(const name of scenarios){const page=await browser.newPage({viewport:{width:390,height:844}});const errs=[];page.on('pageerror',e=>errs.push(e.message));
  await page.goto(base+'/?dev=1');await page.waitForTimeout(700);await page.evaluate(()=>document.querySelector('#startOverlay')?.remove());
  const r=await page.evaluate(n=>{try{const x=RATestPilot.scenario(n);return {ok:true,day:x.state.day,seeds:x.seeds.map(s=>s.why),level:x.level}}catch(e){return {ok:false,error:String(e.message||e)}}},name);
  results.push({check:`scenario ${name}`,pass:r.ok&&!errs.length,...r,errors:errs});errors.push(...errs.map(e=>`${name}: ${e}`));await page.close();}
 // Replayed launch: A44_N3's rival beat must show Ms. Patrice (date) + the Buckhead vampire, reached through nights 1–2.
 {const page=await browser.newPage({viewport:{width:390,height:844}});const errs=[];page.on('pageerror',e=>errs.push(e.message));
  await page.goto(base+'/?dev=1');await page.waitForTimeout(700);await page.evaluate(()=>document.querySelector('#startOverlay')?.remove());
  const r=await page.evaluate(async()=>{RATestPilot.scenario('waffle-night-3');const l=await RATestPilot.launch('A44_N3',{node:'rival'});await new Promise(r=>setTimeout(r,900));const a=RAAdventures.active();return {trail:l.trail,key:RAPresentationData.screenKey(a.env,a.actors),node:a.node};});
  await mkdir(outDir,{recursive:true});await page.screenshot({path:path.join(outDir,'launch-A44_N3-rival-390.png')});
  results.push({check:'replayed launch A44_N3:rival',pass:r.key==='lennox|left:rich,mid:ms_patrice@date,right:buckhead'&&!errs.length,...r,errors:errs});await page.close();}
}finally{await browser.close();server.close();}
await mkdir(outDir,{recursive:true});await writeFile(path.join(outDir,'pilot-check.json'),JSON.stringify({results,errors},null,1));
for(const r of results)console.log(r.pass?'PASS':'FAIL',r.check,r.error||r.key||'');console.log(results.every(r=>r.pass)&&!errors.length?'PASS test pilot browser check':'FAIL test pilot browser check');
