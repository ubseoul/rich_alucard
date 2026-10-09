import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {serve} from './rc2/harness.mjs';

const require=createRequire(import.meta.url);
const {chromium}=require(process.env.RA_PLAYWRIGHT_PATH||'playwright-core');
const {server,url}=await serve(path.resolve('.'));
const browser=await chromium.launch(process.env.RA_CHROMIUM_PATH?{executablePath:process.env.RA_CHROMIUM_PATH,headless:true}:{channel:'chrome',headless:true});
const report={scope:'disposable contexts; default browser autoplay policy; approved recordings only',checks:[],errors:[]};
const output=process.argv[2]||'reports/audio-startup-browser.json';
function check(id,pass,evidence){report.checks.push({id,pass:!!pass,evidence});assert.ok(pass,id);}
async function snapshot(p){return p.evaluate(()=>({paused:soundtrack.paused,time:soundtrack.currentTime,src:soundtrack.getAttribute('src'),muted:soundtrack.muted,volume:soundtrack.volume,pin:soundtrack.dataset.pin,needsGesture:RAMusicLibrary.needsGesture(),engine:RAAudio.describe(),attempts:__audioAttempts}));}
try{
 for(const mobile of [false,true])for(const mode of ['fresh-retry','existing-retry','saved-mute','music-zero','saved-radio']){
  const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1280,height:900},hasTouch:mobile,isMobile:mobile});
  await context.addInitScript(deny=>{window.__audioAttempts=[];let first=true;const play=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){if(this.tagName!=='AUDIO')return play.call(this);const row={src:this.getAttribute('src'),gesture:navigator.userActivation.isActive};__audioAttempts.push(row);if(deny&&first){first=false;row.result='NotAllowedError';return Promise.reject(new DOMException('Controlled first-play rejection','NotAllowedError'));}return play.call(this).then(x=>{row.result='resolved';return x;},e=>{row.result=e.name;throw e;});};},mode.endsWith('retry'));
  const p=await context.newPage();p.on('pageerror',e=>report.errors.push(e.message));await p.goto(url);await p.waitForFunction(()=>window.RAOpeningCinema?.ready&&window.RANewGame);
  if(mode!=='fresh-retry'){
   const fixture=await p.evaluate(mode=>{const s=RAState.migrateRecord(RASaveFixtures.fixtures.supraOwned);s.life.settings.audio={music:mode==='music-zero'?0:.65,sfx:.8,ambience:.7,muted:mode==='saved-mute',haptics:false};if(mode==='saved-radio')s.life.phone.radio={track:'montana',pinned:true,time:23};return s;},mode);
   await context.addInitScript(data=>{if(window===window.top&&/^https?:$/.test(location.protocol)&&!sessionStorage.getItem('audioSeeded')){localStorage.setItem('rich_alucard_save_v1',JSON.stringify(data));sessionStorage.setItem('audioSeeded','1');}},fixture);
   await p.reload();await p.waitForFunction(()=>window.RAOpeningCinema?.ready&&window.RANewGame);
  }
  check(`${mobile}/${mode}/silent-title`,await p.evaluate(()=>soundtrack.paused&&!RAOpeningCinema.isVisible()));
  if(mobile)await p.locator('#startButton').tap();else await p.locator('#startButton').click();
  if(mode==='fresh-retry'){if(mobile)await p.locator('#cinemaSkipHint').tap();else await p.locator('#cinemaSkipHint').click();}
  await p.waitForTimeout(600);const before=await snapshot(p);
  if(mode.endsWith('retry')){
   check(`${mobile}/${mode}/rejection-recorded`,before.paused&&before.needsGesture&&before.attempts.some(x=>x.result==='NotAllowedError'),before);
   // Retry must be attached to a real input, and effects must remain independently unlocked.
   if(mode==='fresh-retry'){await p.locator('#adventureScene').click({position:{x:100,y:160}});}else{await p.locator('#checkPhone').click();}
   await p.waitForTimeout(700);const after=await snapshot(p);
   check(`${mobile}/${mode}/next-input-recovers`,!after.paused&&after.time>before.time&&!after.needsGesture&&after.engine.context==='running'&&after.attempts.at(-1).gesture,after);
  }else{
   check(`${mobile}/${mode}/settings-preserved`,before.muted===(mode==='saved-mute')&&before.volume===(mode==='music-zero'?0:.65),before);
   if(mode==='saved-radio')check(`${mobile}/${mode}/radio-preserved`,before.src.endsWith('in_montana.mp3')&&before.pin==='1'&&before.time>=23&&before.time<27,before);
  }
  await context.close();
 }
 // The full cinematic handoff happens after transient activation expires.
 const c=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true}),p=await c.newPage();
 await p.goto(url);await p.waitForFunction(()=>RAOpeningCinema.ready);await p.locator('#startButton').tap();await p.waitForFunction(()=>!RAOpeningCinema.isVisible(),{},{timeout:50000});await p.waitForTimeout(1000);
 check('full-cinematic/music-playing',await p.evaluate(()=>!soundtrack.paused&&soundtrack.currentTime>15&&RAAudio.describe().context==='running'));
 await c.close();check('no-page-errors',report.errors.length===0,report.errors);
}finally{await fs.mkdir(path.dirname(output),{recursive:true});await fs.writeFile(output,JSON.stringify(report,null,2)+'\n');await browser.close();server.close();}
console.log(`PASS audio startup browser (${report.checks.length} checks)`);
