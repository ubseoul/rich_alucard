#!/usr/bin/env node
// PACKET UL-L2-001 browser evidence — real build (dist/), real player path, three phone widths.
// START → bedroom → CHECK PHONE → hierarchy, lock communication, VampGPT destination hierarchy, audio settings.
// Also runs the in-page smoke suite and asserts the new audio/phone checks pass.
// Usage: RA_PLAYWRIGHT_PATH=… [RA_CHROMIUM_PATH=…] node tools/ul-l2-001-browser.mjs [--out dir]
import {createRequire} from 'node:module';
import http from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=Object.fromEntries(process.argv.slice(2).reduce((acc,arg,i,all)=>{if(arg.startsWith('--')){const next=all[i+1];acc.push([arg.slice(2),next&&!next.startsWith('--')?next:true])}return acc},[]));
const dist=path.join(root,'dist');
const out=path.resolve(args.out||path.join(root,'work','ul_l2_001'));
const require=createRequire(import.meta.url);
function loadPlaywright(){for(const id of [process.env.RA_PLAYWRIGHT_PATH,'playwright-core','playwright'].filter(Boolean)){try{return require(id)}catch{}}throw new Error('Playwright not found: set RA_PLAYWRIGHT_PATH')}
async function chromiumPath(){if(process.env.RA_CHROMIUM_PATH)return process.env.RA_CHROMIUM_PATH;const base=path.join(process.env.LOCALAPPDATA||'', 'ms-playwright');if(!existsSync(base))return undefined;const dirs=require('node:fs').readdirSync(base).filter(d=>d.startsWith('chromium-')).sort().reverse();for(const d of dirs)for(const exe of ['chrome-win/chrome.exe','chrome-linux/chrome'])if(existsSync(path.join(base,d,exe)))return path.join(base,d,exe)}
const TYPES={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.json':'application/json','.ttf':'font/ttf','.mp3':'audio/mpeg','.woff2':'font/woff2'};
function serve(){return new Promise(resolve=>{const s=http.createServer(async(req,res)=>{const p=decodeURIComponent(new URL(req.url,'http://x').pathname);try{const f=path.join(dist,p==='/'?'index.html':p);res.writeHead(200,{'content-type':TYPES[path.extname(f)]||'application/octet-stream','cache-control':'no-store'});res.end(await readFile(f))}catch{res.writeHead(404);res.end()}});s.listen(0,'127.0.0.1',()=>resolve(s))})}
const SIZES={360:[360,740],390:[390,844],430:[430,932]};
const results=[];const problems=[];let shot=0;
function check(where,name,ok,detail=''){results.push(`${ok?'PASS':'FAIL'} [${where}] ${name}${detail?` — ${detail}`:''}`);if(!ok)problems.push(`${where}: ${name} ${detail}`);}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

let browser,server,base;
async function newPage(size){
 const [w,h]=SIZES[size];const context=await browser.newContext({viewport:{width:w,height:h},deviceScaleFactor:2,hasTouch:false});
 context.setDefaultTimeout(9000);const page=await context.newPage();const errors=[];
 page.on('pageerror',e=>errors.push(`pageerror: ${e.message}`));
 page.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|favicon/.test(m.text()))errors.push(`console: ${m.text().slice(0,240)}`)});
 page.on('requestfailed',r=>{if(!/ERR_ABORTED/.test(r.failure()?.errorText||''))errors.push(`requestfailed: ${r.url().replace(base,'')}`)});
 page.on('response',r=>{if(r.status()>=400)errors.push(`http ${r.status()}: ${r.url().replace(base,'')}`)});
 await page.goto(base+'/');
 return {page,errors};
}
async function snap(page,name){try{await page.screenshot({path:path.join(out,`${String(++shot).padStart(3,'0')}-${page.viewportSize().width}-${name.replace(/[^a-z0-9_-]+/gi,'_').slice(0,50)}.png`)});}catch{}}

async function runWidth(size){
 const where=`${size}px`;const {page,errors}=await newPage(size);
 try{
 // Seeded existing-life save so START uses the real player path into the bedroom (not the A00 prologue).
 await page.evaluate(()=>{localStorage.clear();RAState.reset();RAState.patch('life.clock.started',true);RAState.patch('life.world.flags.prologueDone',true);RAState.patch('life.world.flags.throneDone',true);RAState.patch('life.world.flags.firstWakeDone',true);});
 await page.reload();
 await page.click('#startButton');await sleep(900);
 const bedroom=await page.evaluate(()=>document.body.classList.contains('bedroom-mode'));
 check(where,'START reaches the bedroom through the real path',bedroom);
 const entry=await page.evaluate(()=>{const b=document.querySelector('#checkPhone');return b?b.textContent.trim():null});
 check(where,'CHECK PHONE bedroom entry present',!!entry,entry||'missing');
 await page.click('#checkPhone');
 try{await page.waitForSelector('#phoneOverlay.open',{timeout:5000});}catch(e){}
 const opened=await page.evaluate(()=>window.RAPhone?.isOpen?.()===true);
 check(where,'CHECK PHONE opens the phone',opened);
 if(!opened){const diag=await page.evaluate(()=>({body:document.body.className,scene:window.RAScenes?.current?.(),entry:!!document.querySelector('#checkPhone')}));check(where,'phone open diagnostics',false,JSON.stringify(diag));return;}

 // ---- Part B: hierarchy + concise lock communication ----
 const home=await page.evaluate(()=>({
   sections:[...document.querySelectorAll('.phone-app-grid .phone-section-label')].map(n=>({id:n.dataset.phoneSection,label:n.textContent.trim()})),
   locks:[...document.querySelectorAll('.phone-app-grid [data-locked="1"] .phone-lock-short')].map(n=>n.textContent.trim()),
   appsOn:window.RAPhone.apps.length
 }));
 check(where,'phone renders grouped hierarchy sections',home.sections.length>=3&&home.sections.some(s=>s.id==='now')&&home.sections.some(s=>s.id==='money'),home.sections.map(s=>s.id).join(','));
 check(where,'locked canon apps state a concise reason',home.locks.length>=1&&home.locks.every(t=>/^LOCKED · \S/.test(t)),home.locks.join(' | '));
 check(where,'canon app roster unchanged',home.appsOn===7,String(home.appsOn));
 await snap(page,'phone-home');
 const lockedSelector=await page.evaluate(()=>{const b=document.querySelector('.phone-app-grid [data-locked="1"]');return b?b.dataset.phoneAction:null});
 if(lockedSelector){await page.click(`[data-phone-action="${lockedSelector}"]`);await sleep(40);
  const msg=await page.evaluate(()=>document.querySelector('#phoneContent .phone-message')?.textContent||'');
  check(where,'tapping a locked app gives one concise line',msg.length>0&&msg.length<70&&msg===msg.trim(),JSON.stringify(msg));
 } else check(where,'tapping a locked app gives one concise line',false,'no locked app');

 // ---- Part B: destination hierarchy ----
 await page.waitForSelector('[data-phone-action="app:vampgpt"]',{timeout:4000}).catch(()=>{});
 await page.click('[data-phone-action="app:vampgpt"]').catch(()=>{});await sleep(40);
 await page.click('[data-phone-action="prompt"]').catch(()=>{});await sleep(40);
 await page.click('[data-phone-action="somewhere"]').catch(()=>{});await sleep(50);
 const dest=await page.evaluate(()=>({labels:[...document.querySelectorAll('[data-phone-section^="go-"]')].map(n=>n.dataset.phoneSection),tokyo:(document.querySelector('[data-phone-action="tokyo"] small')?.textContent||'').trim(),atlanta:(document.querySelector('[data-phone-action="atlanta"] small')?.textContent||'').trim()}));
 check(where,'destinations grouped available vs locked',dest.labels.includes('go-available')&&dest.labels.includes('go-locked'),dest.labels.join(','));
 check(where,'locked Tokyo communicates why',/NEED CLOUT/.test(dest.tokyo)&&/AVAILABLE/.test(dest.atlanta),`tokyo=${dest.tokyo} atlanta=${dest.atlanta}`);
 await snap(page,'phone-somewhere');

 // ---- Part A: audio engine settings surface + persistence ----
 await page.click('[data-phone-action="settings"]').catch(()=>{});await sleep(50);
 const settingsUi=await page.evaluate(()=>({sliders:document.querySelectorAll('.phone-settings input[type=range]').length,mute:!!document.querySelector('[data-phone-action="toggleMute"]')}));
 check(where,'phone audio settings surface renders',settingsUi.sliders===3&&settingsUi.mute,JSON.stringify(settingsUi));
 await snap(page,'phone-settings');
 await page.evaluate(()=>{const s=document.querySelector('[data-audio-bus="SFX"]');s.value='40';s.dispatchEvent(new Event('input',{bubbles:true}));const m=document.querySelector('[data-audio-bus="MUSIC"]');m.value='50';m.dispatchEvent(new Event('input',{bubbles:true}));});
 await sleep(30);
 const soundtrack=await page.evaluate(()=>({volume:document.querySelector('#soundtrack').volume,music:RAState.get().life.settings.audio.music}));
 check(where,'MUSIC setting drives #soundtrack.volume',Math.abs(soundtrack.volume-.5)<.01&&soundtrack.music===.5,JSON.stringify(soundtrack));
 await page.click('[data-phone-action="toggleMute"]');await sleep(30);
 const persisted=await page.evaluate(()=>({sfx:RAState.get().life.settings.audio.sfx,muted:RAState.get().life.settings.audio.muted,elMuted:document.querySelector('#soundtrack').muted}));
 check(where,'audio settings persist into the save block',persisted.sfx===.4&&persisted.muted===true,JSON.stringify(persisted));
 check(where,'MUTE drives #soundtrack.muted',persisted.elMuted===true,String(persisted.elMuted));
 await page.reload();await page.evaluate(()=>{});
 const afterReload=await page.evaluate(()=>({sfx:RAState.get().life.settings.audio.sfx,muted:RAState.get().life.settings.audio.muted,music:RAState.get().life.settings.audio.music,elVolume:document.querySelector('#soundtrack').volume,elMuted:document.querySelector('#soundtrack').muted}));
 check(where,'audio settings survive a reload',afterReload.sfx===.4&&afterReload.muted===true&&afterReload.music===.5&&Math.abs(afterReload.elVolume-.5)<.01&&afterReload.elMuted===true,JSON.stringify(afterReload));

 // ---- Part A: engine routing / duck state in the browser ----
 await page.evaluate(()=>{RAState.patch('life.settings.audio',{music:1,sfx:1,ambience:1,muted:false,haptics:true});window.RAAudio?.applyMix?.();});
 const engine=await page.evaluate(()=>{const A=window.RAAudio;A.unlock();A.installTestTone('UI_TAP',{freq:660,duration:.03});const played=A.sfx('UI_TAP');const d=A.describe();A.duckMusic(12,60);const ducked=A.describe().ducked;A.restoreMusic(60);return {played,ui:d.busGains.UI,loaded:d.loaded.includes('UI_TAP'),ducked,unlocked:A.isUnlocked(),manifest:A.describe().schema};});
 check(where,'engine plays a routed voice through the UI bus',engine.played===true&&Math.abs(engine.ui-.6)<.001&&engine.loaded&&engine.unlocked&&engine.manifest==='2.1',JSON.stringify(engine));
 check(where,'engine duck/restore seam works',engine.ducked===true);

 // ---- in-page smoke suite ----
 const smoke=await page.evaluate(async()=>await window.RASmoke.run());
 const failLines=smoke.filter(l=>l.startsWith('FAIL'));
 const newChecks=smoke.filter(l=>/audio engine|ambience|specific phone sounds|phone hierarchy|phone audio settings/.test(l));
 check(where,'in-page smoke suite has no failures',failLines.length===0,failLines.join(' ; ')||'0 fails');
 check(where,'new audio/phone smoke checks pass',newChecks.length>=4&&newChecks.every(l=>l.startsWith('PASS')),newChecks.map(l=>l.split(' — ')[0]).join(' | '));

 // reset save so each width starts clean
 await page.evaluate(()=>localStorage.clear());
 check(where,'no page/console/network errors during the run',errors.length===0,errors.slice(0,3).join(' ; '));
 }catch(error){check(where,'harness completed without throwing',false,error.message);}
 finally{await page.context().close().catch(()=>{});}
}

const pw=loadPlaywright();
const exe=await chromiumPath();
server=await serve();base=`http://127.0.0.1:${server.address().port}`;
await mkdir(out,{recursive:true});
browser=await pw.chromium.launch(exe?{executablePath:exe}:{});
try{for(const size of [360,390,430])await runWidth(size);}
finally{if(server)server.close();if(browser)await browser.close();}
console.log(results.join('\n'));
console.log(`\n${problems.length?'FAIL':'PASS'} UL-L2-001 browser evidence — ${results.filter(r=>r.startsWith('PASS')).length}/${results.length} checks (${out})`);
if(problems.length){console.log(problems.join('\n'));process.exitCode=1;}
