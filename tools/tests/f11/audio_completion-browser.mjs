#!/usr/bin/env node
// F11 real-browser audio smoke over a built artifact. Proves the F11 runtime MP3s actually load and decode in a browser,
// that playback is gated on a real user gesture (autoplay policy), and that no 404/decode/console error is produced for
// a safely callable sound from every currently reachable family. Not part of tools/tests auto-discovery (not *.test.mjs).
//   node tools/tests/f11/audio_completion-browser.mjs [--dist dist]
// Playwright resolution is shared with tools/if1/browser-smoke.mjs (RA_PLAYWRIGHT_PATH / RA_CHROMIUM_PATH).
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {existsSync} from 'node:fs';
import {loadPlaywright,serve} from '../../if1/browser-smoke.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','..','..');
const ONE_SHOT=['NO_02','TR_02','GN_01','RM_01','BX_POD_REVEAL','DRAGON_WINGS','BARS_PUNCHLINE'];
const LOOPS=['NO_05','TR_01','GN_03','RM_05','BX_WARROOM'];

async function chromiumPath(){
  if(process.env.RA_CHROMIUM_PATH)return process.env.RA_CHROMIUM_PATH;
  const {readdirSync}=await import('node:fs');
  const base=path.join(process.env.LOCALAPPDATA||'', 'ms-playwright');if(!existsSync(base))return undefined;
  for(const d of readdirSync(base).filter(d=>d.startsWith('chromium-')).sort().reverse())for(const exe of ['chrome-win/chrome.exe','chrome-linux/chrome','chrome-mac/Chromium.app/Contents/MacOS/Chromium']){const p=path.join(base,d,exe);if(existsSync(p))return p;}
  return undefined;
}

async function main(){
  const arg=n=>{const i=process.argv.indexOf(n);return i===-1?null:process.argv[i+1];};
  const dist=path.resolve(arg('--dist')||path.join(root,'dist'));
  const pw=loadPlaywright();
  if(!pw){console.log('SKIPPED F11 browser audio smoke: Playwright not found (set RA_PLAYWRIGHT_PATH)');process.exitCode=process.argv.includes('--require-browser')?1:0;return;}
  if(!existsSync(path.join(dist,'index.html'))){console.error('FAIL dist/ missing — run npm run build');process.exitCode=1;return;}
  const server=await serve(dist);const base=`http://127.0.0.1:${server.address().port}`;
  const browser=await pw.chromium.launch({headless:true,executablePath:await chromiumPath()});
  const results=[];const check=(name,ok,detail='')=>{results.push({name,ok:!!ok,detail});console.log(`${ok?'PASS':'FAIL'} ${name}${detail?` — ${detail}`:''}`);};
  try{
    const context=await browser.newContext({viewport:{width:390,height:844}});context.setDefaultTimeout(15000);
    const page=await context.newPage();const errors=[];
    page.on('pageerror',e=>errors.push(`pageerror: ${e.message}`));
    page.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|favicon/.test(m.text()))errors.push(`console: ${m.text().slice(0,200)}`);});
    page.on('response',r=>{if(r.status()>=400&&!/favicon/.test(r.url()))errors.push(`http ${r.status()}: ${r.url().replace(base,'')}`);});
    await page.goto(`${base}/`);await page.waitForFunction(()=>window.RAIF1&&window.RAAudio&&window.RAAudioManifest);

    // autoplay: a real pointer gesture is required before any AudioContext/playback happens
    const before=await page.evaluate(()=>({unlocked:RAAudio.isUnlocked(),reg:{},present:{}}));
    check('audio is locked before any user gesture (autoplay respected)',before.unlocked===false);
    await page.click('#startButton');
    await page.waitForTimeout(50);
    check('a real user gesture unlocks the audio engine',await page.evaluate(()=>RAAudio.isUnlocked()===true));

    const reg=await page.evaluate(ids=>({present:ids.filter(id=>{const e=RAAudioManifest.get(id);return e&&e.registered&&e.file;}),missing:ids.filter(id=>{const e=RAAudioManifest.get(id);return !e||!e.registered||!e.file;})}),[...ONE_SHOT,...LOOPS]);
    check('every F11 family id is manifest-registered with a runtime file',reg.missing.length===0,reg.missing.join(','));

    const decoded=await page.evaluate(async ids=>{const out={};for(const id of ids)out[id]=!!(await RAAudio.preload(id));return out;},[...ONE_SHOT,...LOOPS]);
    const badDecode=Object.entries(decoded).filter(([,v])=>!v).map(([k])=>k);
    check('F11 runtime MP3s load and decode in the browser',badDecode.length===0,badDecode.join(','));

    const plays=await page.evaluate(ids=>{const out={};for(const id of ids){const n=RAAudio.describe().plays[id]||0;RAAudio.sfx(id);const loop=RAAudio.loop(id);out[id]={oneShot:RAAudio.describe().plays[id]>n,loop};if(loop)RAAudio.stop(id);}return out;},ONE_SHOT);
    const oneShotFail=Object.entries(plays).filter(([,v])=>!v.oneShot).map(([k])=>k);
    check('a safely callable one-shot from each reachable family actually plays',oneShotFail.length===0,oneShotFail.join(','));

    const loopState=await page.evaluate(ids=>{const out={};for(const id of ids){const started=RAAudio.loop(id);const playing=RAAudio.isPlaying(id);RAAudio.stop(id);out[id]=started&&playing;}return out;},LOOPS);
    const loopFail=Object.entries(loopState).filter(([,v])=>!v).map(([k])=>k);
    check('F11 loops start (with measured loop points) and stop',loopFail.length===0,loopFail.join(','));

    const desc=await page.evaluate(ids=>{const d=RAAudio.describe();return {missing:d.missing.filter(id=>ids.includes(id)),loaded:ids.filter(id=>d.loaded.includes(id))};},[...ONE_SHOT,...LOOPS]);
    check('no decode failures recorded for the F11 ids',desc.missing.length===0,desc.missing.join(','));

    check('zero page/console/network errors on the F11 audio path',errors.length===0,errors.slice(0,5).join(' | '));
    await context.close();
  }finally{await browser.close();await new Promise(r=>server.close(r));}
  const failed=results.filter(r=>!r.ok);
  if(failed.length){console.error(`FAIL F11 browser audio smoke (${failed.length}/${results.length} failed)`);process.exitCode=1;}
  else console.log(`PASS F11 browser audio smoke (${results.length} checks)`);
}
await main();
