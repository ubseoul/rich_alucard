#!/usr/bin/env node
// IF-1 real-browser critical-path smoke over a BUILT artifact (dist/ or a deployed URL). Practical, fast (~1 min), no
// authored-content assertions: it proves IF-1 changed nothing a player can see, and that the critical paths still run.
//   1 boot            no page/console/network errors; IF-1 present, self-check OK, every fragment flag OFF, schema v16
//   2 phone           seeded life → START → bedroom → CHECK PHONE opens; reserved apps (War Room/Trap/Armory/RAINMAKER) absent
//   3 F1 audio        AUDIO settings persist across reload; mute toggles; engine present
//   4 NEW OGA M1      wake trigger offers M1 → real adventure scene mounts → choices reachable → clean abort
//   5 saves           no frag namespace written with flags OFF; reload keeps the save byte-identical; widths 360/390/430 have no overflow
//   node tools/if1/browser-smoke.mjs [--dist dist | --url https://…] [--out dir] [--require-browser]
// Playwright: RA_PLAYWRIGHT_PATH (playwright-core) and optionally RA_CHROMIUM_PATH. If Playwright is unavailable the run is
// reported SKIPPED (exit 0) unless --require-browser (exit 1) — a skip is never reported as a pass.
import {createRequire} from 'node:module';
import http from 'node:http';
import {readFile,mkdir,writeFile,readdir} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','..');
const require=createRequire(import.meta.url);
const TYPES={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.json':'application/json','.ttf':'font/ttf','.mp3':'audio/mpeg','.woff2':'font/woff2','.wav':'audio/wav'};
export function loadPlaywright(){for(const id of [process.env.RA_PLAYWRIGHT_PATH,path.join(root,'work','browser_deps','node_modules','playwright-core'),'playwright-core','playwright'].filter(Boolean)){try{return require(id);}catch(e){}}return null;}
async function chromiumPath(){
  if(process.env.RA_CHROMIUM_PATH)return process.env.RA_CHROMIUM_PATH;
  const base=path.join(process.env.LOCALAPPDATA||path.join(process.env.HOME||'','.cache'),'ms-playwright');if(!existsSync(base))return undefined;
  for(const d of (await readdir(base)).filter(d=>d.startsWith('chromium-')).sort().reverse())for(const exe of ['chrome-win/chrome.exe','chrome-linux/chrome','chrome-mac/Chromium.app/Contents/MacOS/Chromium']){const p=path.join(base,d,exe);if(existsSync(p))return p;}
  return undefined;
}
export function serve(dist){return new Promise(resolve=>{const s=http.createServer(async(req,res)=>{const p=decodeURIComponent(new URL(req.url,'http://x').pathname);try{const f=path.join(dist,p==='/'?'index.html':p);res.writeHead(200,{'content-type':TYPES[path.extname(f)]||'application/octet-stream','cache-control':'no-store'});res.end(await readFile(f));}catch(e){res.writeHead(404);res.end();}});s.listen(0,'127.0.0.1',()=>resolve(s));});}

const RESERVED_APPS=['warRoom','trap','armory','rainmaker'];
export async function runBrowserSmoke({dist=path.join(root,'dist'),url=null,out=null,log=console.log}={}){
  const pw=loadPlaywright();
  if(!pw)return {status:'SKIPPED',reason:'Playwright not found (set RA_PLAYWRIGHT_PATH)',results:[]};
  const results=[];const check=(name,ok,detail='')=>{results.push({name,ok:!!ok,detail});log(`${ok?'PASS':'FAIL'} ${name}${detail?` — ${detail}`:''}`);return !!ok;};
  let server=null,base=url;if(!base){if(!existsSync(path.join(dist,'index.html')))return {status:'FAILED',reason:'dist/ missing — run npm run build',results};server=await serve(dist);base=`http://127.0.0.1:${server.address().port}`;}
  const browser=await pw.chromium.launch({headless:true,executablePath:await chromiumPath()});
  if(out)await mkdir(out,{recursive:true});
  async function page(width=390,height=844){
    const context=await browser.newContext({viewport:{width,height}});context.setDefaultTimeout(12000);const p=await context.newPage();const errors=[];
    p.on('pageerror',e=>errors.push(`pageerror: ${e.message}`));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|favicon/.test(m.text()))errors.push(`console: ${m.text().slice(0,200)}`);});
    p.on('response',r=>{if(r.status()>=400&&!/favicon/.test(r.url()))errors.push(`http ${r.status()}: ${r.url().replace(base,'')}`);});
    await p.goto(`${base}/`);await p.waitForFunction(()=>window.RAIF1&&window.RAState);return {p,errors,context};
  }
  const seed=(p,fields={})=>p.evaluate(f=>{localStorage.clear();RAState.reset();RAState.patch('life.clock.started',true);for(const k of ['prologueDone','throneDone','firstWakeDone'])RALife.setFlag(k,true);if(f.day)RAState.patch('life.world.day',f.day);if(f.money!==undefined)RAState.patch('life.resources.money',f.money);},fields);
  try{
    // 1 boot
    {const {p,errors,context}=await page();
     const boot=await p.evaluate(()=>({v:RAIF1.version,self:RAIF1.selfCheck(),flags:RAFeatures.snapshot(),ver:RAState.version,build:!!window.RABuild,modules:RAIF1.modules.filter(m=>!window[m])}));
     check('boot: IF-1 v1.0 loaded, every module present',boot.v==='1.0.0'&&boot.modules.length===0,boot.modules.join(','));
     check('boot: IF-1 self-check OK',boot.self.ok,boot.self.problems.join('; '));
     check('boot: every fragment flag OFF (dark)',Object.values(boot.flags).every(v=>v===false)&&boot.self.fragmentFlagsOn.length===0);
     check('boot: accepted schema v16',boot.ver===16);
     check('boot: zero page/console/network errors',errors.length===0,errors.join(' | '));await context.close();}
    // 2 phone + 3 audio + 5 saves
    {const {p,errors,context}=await page();await seed(p,{day:9,money:100000});await p.reload();await p.waitForFunction(()=>window.RAIF1);
     await p.click('#startButton');await p.waitForFunction(()=>document.body.classList.contains('bedroom-mode'),null,{timeout:15000}).catch(()=>{});
     check('START reaches the bedroom (existing life)',await p.evaluate(()=>document.body.classList.contains('bedroom-mode')));
     await p.click('#checkPhone');await p.waitForFunction(()=>window.RAPhone?.isOpen?.()===true).catch(()=>{});
     check('CHECK PHONE opens the phone',await p.evaluate(()=>window.RAPhone?.isOpen?.()===true));
     const phone=await p.evaluate(reserved=>({apps:RAPhoneApps.list().map(a=>a.id),buttons:[...document.querySelectorAll('#phoneContent .app-button')].map(b=>b.dataset.phoneAction),sections:[...document.querySelectorAll('#phoneContent [data-phone-section]')].map(n=>n.dataset.phoneSection),reservedPresent:reserved.filter(id=>!!RAPhoneApps.get(id)||!!document.querySelector(`[data-phone-action="app:${id}"]`)),reservedDeclared:RAPhoneRegistry.reserved().map(r=>[r.id,r.declared,r.enabled])}),RESERVED_APPS);
     check('phone: reserved War Room / Trap / Armory / RAINMAKER absent with flags OFF',phone.reservedPresent.length===0,phone.reservedPresent.join(','));
     check('phone: canon home grid renders (VampGPT, VampGram, InstaHoe, RealMoneyRealEstate, JDMIMPORTS, RICHBOIMPORTS, ONLYVAMPS)',['vampgpt','vampgram','instahoe','realEstate','jdmImports','richboi','onlyvamps'].every(id=>phone.buttons.includes(`app:${id}`)),phone.buttons.join(' '));
     check('phone: sections render in hierarchy order',phone.sections.join()===['now','social','money','life','system'].filter(s=>phone.sections.includes(s)).join(),phone.sections.join());
     // F1 audio settings
     const gear=await p.evaluate(()=>!!document.querySelector('#phoneContent [data-phone-action="settings"], #phoneOverlay [data-phone-action="settings"]'));
     if(gear)await p.click('[data-phone-action="settings"]');else await p.evaluate(()=>RAPhone.api.go('settings'));
     await p.waitForSelector('#phoneContent [data-audio-bus="MUSIC"]');
     await p.evaluate(()=>{const el=document.querySelector('[data-audio-bus="MUSIC"]');el.value='35';el.dispatchEvent(new Event('input',{bubbles:true}));});
     check('F1 audio: MUSIC slider writes the persisted setting',await p.evaluate(()=>Math.abs(RAAudio.settings().music-.35)<.011&&Math.abs(RAState.get().life.settings.audio.music-.35)<.011));
     await p.click('.phone-toggle-mute');check('F1 audio: MUTE toggles',await p.evaluate(()=>RAAudio.settings().muted===true));await p.click('.phone-toggle-mute');
     const before=await p.evaluate(()=>JSON.stringify(RAState.get()));
     check('saves: no frag namespace with every flag OFF',!(JSON.parse(before).frag));
     await p.reload();await p.waitForFunction(()=>window.RAIF1);
     const after=await p.evaluate(()=>({save:JSON.stringify(RAState.get()),music:RAAudio.settings().music}));
     check('F1 audio: setting survives reload',Math.abs(after.music-.35)<.011);check('saves: reload keeps the save byte-identical',after.save===before);
     check('phone/audio path: zero page/console/network errors',errors.length===0,errors.join(' | '));await context.close();}
    // 4 NEW OGA M1
    {const {p,errors,context}=await page();await seed(p,{day:9,money:30000});
     const pick=await p.evaluate(()=>{RAState.patch('life.world.flags.wakeTrigger',null);return {pick:RAWakeTriggers.pick(),avail:RAAdventures.available('NEW_OGA_M1')};});
     check('NEW OGA M1: the accepted WAKE voice note offers M1',pick.pick==='NEW_OGA_M1'&&pick.avail,JSON.stringify(pick));
     await p.evaluate(()=>RAAdventureScene.begin('NEW_OGA_M1',{from:'if1-smoke'}));await p.waitForFunction(()=>RAScenes.current()==='adventure').catch(()=>{});
     let reached=false;for(let i=0;i<80&&!reached;i++){reached=await p.locator('.adv-choice:not([disabled])').count()>0;if(!reached){await p.locator('#adventureScene').click({position:{x:195,y:300}}).catch(()=>{});await p.waitForTimeout(40);}}
     check('NEW OGA M1: adventure scene mounts and its choices are reachable on the integrated trunk',reached);
     await p.evaluate(()=>RAAdventures.abandon?.());
     check('NEW OGA M1 path: zero page/console/network errors',errors.length===0,errors.join(' | '));if(out)await p.screenshot({path:path.join(out,'new-oga-m1.png')}).catch(()=>{});await context.close();}
    // widths
    for(const [w,h] of [[360,740],[390,844],[430,932]]){const {p,context}=await page(w,h);await seed(p,{day:9});await p.reload();await p.waitForFunction(()=>window.RAIF1);await p.click('#startButton');await p.waitForFunction(()=>document.body.classList.contains('bedroom-mode'),null,{timeout:15000}).catch(()=>{});await p.click('#checkPhone').catch(()=>{});
      const m=await p.evaluate(()=>({sw:document.documentElement.scrollWidth,iw:innerWidth,open:RAPhone?.isOpen?.()}));check(`phone @${w}px: opens, no horizontal overflow`,m.open===true&&m.sw<=m.iw,`scrollWidth ${m.sw} / ${m.iw}`);if(out)await p.screenshot({path:path.join(out,`phone-${w}.png`)}).catch(()=>{});await context.close();}
  }finally{await browser.close();if(server)await new Promise(r=>server.close(r));}
  const failed=results.filter(r=>!r.ok);
  return {status:failed.length?'FAILED':'PASSED',results,failed:failed.length,total:results.length};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  const arg=n=>{const i=process.argv.indexOf(n);return i===-1?null:process.argv[i+1];};
  const r=await runBrowserSmoke({dist:path.resolve(arg('--dist')||path.join(root,'dist')),url:arg('--url'),out:arg('--out')?path.resolve(arg('--out')):null});
  if(r.status==='SKIPPED'){console.log(`SKIPPED browser smoke: ${r.reason}`);process.exitCode=process.argv.includes('--require-browser')?1:0;}
  else if(r.status==='PASSED')console.log(`PASS IF-1 browser smoke (${r.total} checks)`);
  else{console.error(`FAIL IF-1 browser smoke (${r.failed}/${r.total} failed${r.reason?`: ${r.reason}`:''})`);process.exitCode=1;}
}
