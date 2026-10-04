#!/usr/bin/env node
// RC2 B3 browser run: every minigame at 390x844 in a real Chromium. Rule card -> START -> play -> screenshot -> QUIT.
// env: RA_PLAYWRIGHT_PATH, RA_CHROMIUM_PATH.   usage: node tools/rc2/minigame-browser.mjs [--only dance,slurp] [--shots dir]
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath,pathToFileURL} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const arg=n=>{const i=process.argv.indexOf(n);return i<0?null:process.argv[i+1]};
const only=(arg('--only')||'').split(',').filter(Boolean);
const shots=arg('--shots')||path.join(root,'docs/rc2/evidence/minigames');fs.mkdirSync(shots,{recursive:true});
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.json':'application/json','.mp3':'audio/mpeg','.svg':'image/svg+xml','.woff2':'font/woff2','.ttf':'font/ttf'};
const server=http.createServer((req,res)=>{let u=decodeURIComponent(req.url.split('?')[0]);if(u==='/')u='/index.html';const f=path.join(root,u);if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(res);});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const port=server.address().port;
const pwPath=process.env.RA_PLAYWRIGHT_PATH||'C:/Users/Ube/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core';
const {chromium}=await import(pathToFileURL(path.join(pwPath,'index.js')).href).then(m=>m.default||m).catch(async()=>await import(pathToFileURL(path.join(pwPath,'index.mjs')).href));
const browser=await chromium.launch({executablePath:process.env.RA_CHROMIUM_PATH||`${process.env.LOCALAPPDATA}/ms-playwright/chromium-1134/chrome-win/chrome.exe`,headless:true});
const GAMES=[['dance',{}],['slurp',{firstShift:'1'}],['slurp',{}],['touge',{}],['owambe_collection',{}],['hatch',{stage:'young'}],['pier',{}],['bars',{}],['jollof',{mode:'practice'}],['garage',{}],['hookah',{}],['pickup',{}]];
const results=[];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function run(id,extra){
 const tag=id+(Object.keys(extra).length?'_'+Object.keys(extra)[0]:'');
 if(only.length&&!only.includes(id)&&!only.includes(tag))return;
 const ctx=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,hasTouch:true});const page=await ctx.newPage();
 const errors=[];if(process.env.DEBUG)page.on('console',m=>console.log('  console:',m.type(),m.text()));page.on('pageerror',e=>errors.push(String(e.message||e)));page.on('console',m=>{if(m.type()==='error'&&!/favicon|Failed to load resource/.test(m.text()))errors.push(m.text());});
 const q=new URLSearchParams({dev:'1',game:id,...extra});
 await page.goto(`http://127.0.0.1:${port}/minigame-lab.html?${q}`,{waitUntil:'load'});
 const out={game:tag,ok:true,notes:[]};await page.addInitScript(()=>{window.__DBG=1});
 try{
  await page.waitForSelector('.ra-minigame-rule',{timeout:8000});await page.evaluate(()=>{window.__DBG=1});
  const rule=await page.$eval('.ra-minigame-rule-text',e=>e.textContent);out.rule=rule;
  if(!rule||rule.split(/[.!?]/).filter(Boolean).length>1)out.notes.push('rule is not one sentence: '+rule);
  await page.screenshot({path:path.join(shots,`${tag}_1_rule.png`)});
  await page.click('.ra-minigame-start');
  await page.waitForSelector('.ra-minigame canvas',{timeout:8000});
  const box=async()=>page.$eval('.ra-minigame canvas',c=>{const r=c.getBoundingClientRect();return {l:r.left,t:r.top,w:r.width,h:r.height};});
  const tap=async(nx,ny)=>{const b=await box();await page.mouse.click(b.l+nx*b.w/270,b.t+ny*b.h/480);};
  await sleep(900);await page.screenshot({path:path.join(shots,`${tag}_2_play.png`)});
  const t0=Date.now();
  if(id==='dance'){
   // autoplay: tap the lane that is due
   const lanes=[7+32,7+64+32,7+128+32,7+192+32];let hits=0;
   while(Date.now()-t0<34000){const due=await page.$eval('.ra-minigame-stage',e=>e.dataset.due||'');if(due)for(const l of due.split(',')){await tap(lanes[Number(l)],410);hits++;}
    const ph=await page.$eval('.ra-minigame-stage',e=>e.dataset.phase);if(ph==='results')break;await sleep(35);}
   await page.screenshot({path:path.join(shots,`${tag}_3_late.png`)});
   const st=await page.$eval('.ra-minigame-stage',e=>({phase:e.dataset.phase,outcome:e.dataset.outcome,perfect:e.dataset.perfect,good:e.dataset.good,miss:e.dataset.miss}));out.state=st;
   if(st.phase!=='results')out.notes.push('dance did not reach results');else if(st.outcome!=='win')out.notes.push('autoplay did not win: '+JSON.stringify(st));
   const done=await page.$('.dance-done');if(done){await page.screenshot({path:path.join(shots,`${tag}_4_results.png`)});await done.click();}
  }else if(id==='slurp'&&!extra.canopyDuty){
   // autoplay: tap the bin the order card asks for (first-shift tutorial accepts the glowing one)
   const bins=n=>{const items=n===0?3:n===1?2:n===2?3:4,cols=items<=3?items:2,rows=Math.ceil(items/cols),W=254,gap=6,bw=(W-gap*(cols-1))/cols,bh=Math.min(74,(216-gap*(rows-1))/rows);return Array.from({length:items},(_,i)=>({x:8+(i%cols)*(bw+gap)+bw/2,y:226+Math.floor(i/cols)*(bh+gap)+bh/2}));};
   const names=[['SHOYU','TONKOTSU','MISO'],['THIN','THICK'],['CHASHU','CHICKEN','SHRIMP'],['EGG','NORI','SCALLION','CORN']];
   let served=0;
   while(Date.now()-t0<(extra.firstShift?24000:28000)){
    const s=await page.$eval('.ra-minigame-stage',e=>({step:Number(e.dataset.step||0),need:e.dataset.need||'',phase:e.dataset.phase}));if(s.phase==='results')break;
    const list=names[s.step];const k=s.need?list.indexOf(s.need):0;const b=bins(s.step)[Math.max(0,k)];await tap(b.x,b.y);if(s.step===3)served++;await sleep(260);}
   await page.screenshot({path:path.join(shots,`${tag}_3_late.png`)});
   const clk=await page.$('button:has-text("CLOCK OUT")');if(clk)await clk.click();await sleep(300);
   await page.screenshot({path:path.join(shots,`${tag}_4_results.png`)});
   const money=await page.evaluate(()=>document.querySelector('.ra-minigame')?.innerText||'');out.state={served,end:money.replace(/\s+/g,' ').slice(0,80)};
   if(!served)out.notes.push('served nothing');
   const done=await page.$('.ra-minigame button:has-text("DONE")');if(done)await done.click();
  }else if(id==='hatch'){
   await tap(135,260);await sleep(500);await page.screenshot({path:path.join(shots,`${tag}_3_late.png`)});
  }else{
   // generic: poke around the screen for a few seconds (taps + one drag), then quit
   const pts=[[135,240],[60,380],[210,380],[135,330],[40,200],[230,300]];
   while(Date.now()-t0<5000){for(const [x,y] of pts){await tap(x,y);await sleep(120);}
    const b=await box();await page.mouse.move(b.l+60*b.w/270,b.t+400*b.h/480);await page.mouse.down();await page.mouse.move(b.l+200*b.w/270,b.t+300*b.h/480,{steps:6});await page.mouse.up();}
   await page.screenshot({path:path.join(shots,`${tag}_3_late.png`)});
  }
  const stillOpen=await page.$('.ra-minigame-quit');if(stillOpen){await page.click('.ra-minigame-quit');await sleep(200);}
 }catch(e){out.ok=false;out.notes.push('ERROR '+String(e.message||e).split('\n')[0]);try{await page.screenshot({path:path.join(shots,`${tag}_error.png`)});}catch(_){}}
 if(errors.length){out.ok=false;out.notes.push('page errors: '+errors.slice(0,3).join(' | '));}
 if(out.notes.length&&out.ok&&!out.notes.every(n=>n.startsWith('autoplay')))out.ok=false;
 results.push(out);console.log(`${out.ok?'PASS':'FAIL'} ${tag}${out.rule?'  rule: "'+out.rule+'"':''}${out.state?'  '+JSON.stringify(out.state):''}${out.notes.length?'  !! '+out.notes.join(' ; '):''}`);
 await ctx.close();
}
for(const [id,extra] of GAMES)await run(id,extra);
await browser.close();server.close();
const bad=results.filter(r=>!r.ok);console.log(`\n${results.length-bad.length}/${results.length} minigame browser runs passed at 390x844`);
process.exit(bad.length?1:0);
