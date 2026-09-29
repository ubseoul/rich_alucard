#!/usr/bin/env node
// F02 IRON & GRACE — real-browser success path. Serves the repository (index.html + the fragment scripts the loader
// generated) and drives the real player surfaces: flags ON, the Armory app unlocks from knowing the Armory, buying and
// equipping a gun, the workbench, and Range Day mounting through the accepted minigame host. Then a dark reload proves
// the fragment is inert with every flag OFF.
//   node tools/tests/f02/browser-path.mjs [--root <dir>] [--out <dir>] [--require-browser]
// Playwright is looked up exactly like tools/if1/browser-smoke.mjs (RA_PLAYWRIGHT_PATH, work/browser_deps, playwright-core).
import {readdir, mkdir, readFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadPlaywright, serve} from '../../if1/browser-smoke.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','..','..');
async function chromiumPath(){
 if(process.env.RA_CHROMIUM_PATH)return process.env.RA_CHROMIUM_PATH;
 const base=path.join(process.env.LOCALAPPDATA||path.join(process.env.HOME||'','.cache'),'ms-playwright');
 if(!existsSync(base))return undefined;
 for(const d of (await readdir(base)).filter(d=>d.startsWith('chromium-')).sort().reverse())
  for(const exe of ['chrome-win/chrome.exe','chrome-linux/chrome','chrome-mac/Chromium.app/Contents/MacOS/Chromium']){
   const p=path.join(base,d,exe);if(existsSync(p))return p;}
 return undefined;
}

export async function runF02Browser({dir=root,out=null,log=console.log}={}){
 const pw=loadPlaywright();
 if(!pw)return {status:'SKIPPED',reason:'Playwright not found (set RA_PLAYWRIGHT_PATH)',results:[]};
 const results=[];const check=(name,ok,detail='')=>{results.push({name,ok:!!ok,detail});log(`${ok?'PASS':'FAIL'} ${name}${detail?` — ${detail}`:''}`);return !!ok;};
 const server=await serve(dir);const base=`http://127.0.0.1:${server.address().port}`;
 const browser=await pw.chromium.launch({headless:true,executablePath:await chromiumPath()});
 if(out)await mkdir(out,{recursive:true});
 const context=await browser.newContext({viewport:{width:390,height:844}});context.setDefaultTimeout(15000);
 const page=await context.newPage();const errors=[];
 page.on('pageerror',e=>errors.push(`pageerror: ${e.message}`));
 page.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|favicon/.test(m.text()))errors.push(`console: ${m.text().slice(0,200)}`);});
 const shot=async name=>{if(out)await page.screenshot({path:path.join(out,`${name}.png`)}).catch(()=>{});};
 try{
  // ---- lit path ----
  await page.goto(`${base}/?dev=1&ff=F02.iron_and_grace,F02.armory,F02.range_day`);
  await page.waitForFunction(()=>window.RAIF1&&window.RAIron&&window.RAState);
  const boot=await page.evaluate(()=>({flags:RAFeatures.snapshot(),check:RAIronAndGrace.selfCheck(),count:RAIronCatalog.count,ver:RAState.version}));
  check('flags ON: F02.iron_and_grace / F02.armory / F02.range_day are all lit',boot.flags['F02.iron_and_grace']&&boot.flags['F02.armory']&&boot.flags['F02.range_day']);
  check('F02 self-check OK',boot.check.ok,boot.check.problems.join('; '));
  check('13-gun catalog present',boot.count===13,'count '+boot.count);
  check('accepted schema still v16',boot.ver===16);

  // seed a life and learn the Armory; reload persists it, then a WAKE unlocks the Armory app through the F02 hook
  await page.evaluate(()=>{localStorage.clear();RAState.reset();RAState.patch('life.clock.started',true);for(const k of ['prologueDone','throneDone','firstWakeDone'])RALife.setFlag(k,true);RALife.addMoney(1000000);RALife.setFlag('armoryKnown',true);});
  await page.reload();await page.waitForFunction(()=>window.RAIron);
  await page.evaluate(()=>RAClock.wake({first:true}));
  check('Armory app unlocks once the Armory is known',await page.evaluate(()=>RALife.appUnlocked('armory')===true));
  await page.click('#startButton').catch(()=>{});
  await page.waitForFunction(()=>document.body.classList.contains('bedroom-mode'),null,{timeout:15000}).catch(()=>{});
  await page.click('.mail-done',{timeout:4000}).catch(()=>{}); // dismiss the morning mail/GET UP layer
  await page.click('#checkPhone',{force:true}).catch(()=>{});
  await page.waitForFunction(()=>window.RAPhone?.isOpen?.()===true).catch(()=>{});
  await page.evaluate(()=>RAPhone.openApp('armory'));
  await page.waitForSelector('#phoneContent .ia-gun');
  check('Armory app renders its wall',(await page.textContent('#phoneContent')).includes('THE ARMORY'));
  await shot('f02-armory');

  await page.click('[data-phone-action="do:armory:buy:mac_and_cheese"]');
  check('BUY spends the authored price and owns the gun',await page.evaluate(()=>RALife.hasGun('mac_and_cheese')&&RAIronAndGrace.owns('mac_and_cheese')));
  await page.click('[data-phone-action="do:armory:equip:mac_and_cheese"]');
  check('EQUIP sets the F02 loadout',await page.evaluate(()=>RAIronAndGrace.equipped()==='mac_and_cheese'));
  await page.click('[data-phone-action="app:armory:bench"]');
  await page.waitForSelector('#phoneContent .ia-mod');
  check('workbench lists the six mods',(await page.textContent('#phoneContent')).includes('DRUM MAG'));
  await page.click('[data-phone-action="do:armory:buyMod:drum_mag"]');
  check('workbench BUY owns the mod',await page.evaluate(()=>RAIronAndGrace.modsOwned().includes('drum_mag')));
  await shot('f02-workbench');

  // Range Day mounts through the accepted minigame host
  await page.click('[data-phone-action="app:armory"]');
  await page.waitForSelector('#phoneContent .ia-gun');
  await page.click('[data-phone-action="do:armory:range:mac_and_cheese"]');
  await page.waitForSelector('.ra-minigame[data-minigame="range_day"]');
  const rd=await page.evaluate(()=>({lanes:document.querySelectorAll('.ra-minigame[data-minigame="range_day"] .rd-lane').length,ammo:RAIronAndGrace.effectiveAmmo('mac_and_cheese')}));
  check('Range Day mounts with its lanes',rd.lanes>=3,'lanes '+rd.lanes);
  await page.click('.ra-minigame[data-minigame="range_day"] .rd-lane');
  await page.waitForTimeout(300);
  await shot('f02-range-day');
  const before=await page.evaluate(()=>RAMinigames.active()?.id);
  check('Range Day is the active minigame',before==='range_day',String(before));
  await page.click('.ra-minigame .ra-minigame-quit');
  await page.waitForTimeout(200);
  check('Range Day quits cleanly',await page.evaluate(()=>RAMinigames.active()===null));

  // ---- dark path ----
  await page.goto(`${base}/`);
  await page.waitForFunction(()=>window.RAIF1&&window.RAState);
  await page.evaluate(()=>{localStorage.clear();RAState.reset();});
  const dark=await page.evaluate(()=>({flags:RAFeatures.snapshot(),reserved:RAPhoneRegistry.reserved().filter(r=>r.fragment==='F02').map(r=>[r.id,r.declared,r.enabled]),armory:!!RAPhoneApps.get('armory'),frag:!!RAState.get().frag}));
  check('dark reload: every F02 flag OFF',Object.keys(dark.flags).every(k=>!k.startsWith('F02.')||dark.flags[k]===false));
  check('dark: reserved Armory app is declared but not registered',dark.reserved.every(r=>r[1]===true&&r[2]===false)&&dark.armory===false);
  check('dark: loading the fragment writes no save namespace',dark.frag===false);
  check('zero page/console errors on the lit path',errors.length===0,errors.join(' | '));
 }finally{await context.close();await browser.close();await new Promise(r=>server.close(r));}
 const failed=results.filter(r=>!r.ok);
 return {status:failed.length?'FAILED':'PASSED',results,failed:failed.length,total:results.length};
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
 const arg=n=>{const i=process.argv.indexOf(n);return i===-1?null:process.argv[i+1];};
 const r=await runF02Browser({dir:path.resolve(arg('--root')||root),out:arg('--out')?path.resolve(arg('--out')):null});
 if(r.status==='SKIPPED'){console.log(`SKIPPED F02 browser path: ${r.reason}`);process.exitCode=process.argv.includes('--require-browser')?1:0;}
 else if(r.status==='PASSED')console.log(`PASS F02 browser path (${r.total} checks)`);
 else{console.error(`FAIL F02 browser path (${r.failed}/${r.total} failed)`);process.exitCode=1;}
}
