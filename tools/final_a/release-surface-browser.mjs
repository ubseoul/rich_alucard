#!/usr/bin/env node
// Release surface gate: real START input and F2 must not install or expose developer controls.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {serve,launch,root} from '../tests/f15/_browser.mjs';
const out=path.join(root,'docs/evidence/final_a/stage6/release-surface');
await mkdir(out,{recursive:true});
const server=await serve(),browser=await launch(),rows=[],errors=[],failed=[];
const states=async page=>page.evaluate(()=>{
 const visible=el=>!!el&&el.getBoundingClientRect().width>0&&el.getBoundingClientRect().height>0&&getComputedStyle(el).display!=='none'&&getComputedStyle(el).visibility!=='hidden';
 const panel=document.querySelector('#devPanel'),overlay=document.querySelector('#stageContractOverlay');
 return {url:location.pathname+location.search,scene:window.RAScenes?.current?.(),startVisible:visible(document.querySelector('#startOverlay')),panelExists:!!panel,panelVisible:visible(panel),overlayExists:!!overlay,overlayVisible:visible(overlay),devClass:document.body.classList.contains('dev-enabled'),overlayClass:document.body.classList.contains('stage-overlay-active'),controls:document.querySelectorAll('#devPanel button,#devPanel input,#devPanel select,[data-btf],[data-tp]').length,apis:['RADev','RATestPilot','RATestPilotInstall','RAPresentationFixtures'].filter(k=>window[k]),fixtureRegistered:!!window.RAAdventures?.get?.('PD_FIXTURE_CURB'),placeholderMounted:!!document.querySelector('[data-person="pd_fixture_extra"],[data-person="pd_fixture_dummy"]'),btf:!!document.querySelector('#btfAdv'),pilot:!!document.querySelector('#tpScenario'),lab:!!window.RALab};
});
function release(state,label){assert.equal(state.panelExists,false,`${label}: developer panel must be absent`);assert.equal(state.overlayExists,false,`${label}: geometry overlay must be absent`);assert.equal(state.controls,0,`${label}: developer controls must be absent`);assert.equal(state.devClass,false);assert.equal(state.overlayClass,false);assert.deepEqual(state.apis,[]);assert.equal(state.fixtureRegistered,false);assert.equal(state.placeholderMounted,false);assert.equal(state.lab,false);}
async function pageFor(width){const ctx=await browser.newContext({viewport:{width,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true}),page=await ctx.newPage();page.on('pageerror',e=>errors.push(`${width}: ${e.message}`));page.on('requestfailed',r=>{if(r.failure()?.errorText!=='net::ERR_ABORTED')failed.push(r.url());});page.on('response',r=>{if(r.status()>=400)failed.push(`${r.status()} ${r.url()}`);});return {ctx,page};}
async function record(page,width,name){const state=await states(page);rows.push({width,name,...state});await page.screenshot({path:path.join(out,`${width}-${name}.png`)});return state;}
try{
 for(const width of [360,390,430])for(const dev of [false,true]){
  const {ctx,page}=await pageFor(width),name=dev?'dev':'normal';
  await page.goto(server.url+(dev?'?dev=1':''));await page.waitForFunction(()=>window.RANewGame&&window.RAPhone);
  if(dev)await page.waitForFunction(()=>window.RATestPilot&&document.querySelector('#btfAdv'));
  const initial=await record(page,width,`${name}-start`);
  if(dev){assert.equal(initial.panelVisible,true);assert.equal(initial.btf,true);assert.equal(initial.pilot,true);assert.deepEqual(initial.apis,['RADev','RATestPilot','RATestPilotInstall','RAPresentationFixtures']);}
  else release(initial,`${width} normal START surface`);
  // The fresh save follows the real player START → authored prologue route, with no state seeding.
  await page.locator('#startButton').click();await page.waitForFunction(()=>document.querySelector('#startOverlay').style.display==='none'&&RAScenes.current()==='adventure');
  const started=await record(page,width,`${name}-started`);assert.equal(started.startVisible,false);if(!dev)release(started,`${width} normal after START`);
  await page.keyboard.press('F2');const first=await record(page,width,`${name}-f2`);
  if(dev){assert.equal(first.panelVisible,false);assert.equal(first.devClass,false);}else release(first,`${width} normal after F2`);
  await page.keyboard.press('F2');const second=await record(page,width,`${name}-f2-again`);
  if(dev){assert.equal(second.panelVisible,true);assert.equal(second.devClass,true);assert.equal(second.btf,true);assert.equal(second.pilot,true);}else release(second,`${width} normal after repeated F2`);
  await ctx.close();console.log(`PASS ${width} ${name}: real START and repeated F2`);
 }
 for(const query of ['?dev=0','?dev=01']){
  const {ctx,page}=await pageFor(390);await page.goto(server.url+query);await page.waitForFunction(()=>window.RANewGame);await page.keyboard.press('F2');release(await record(page,390,query==='?dev=0'?'dev-zero':'dev-zero-one'),query);await ctx.close();
 }
 for(const dev of [false,true]){
  const {ctx,page}=await pageFor(390);await page.goto(server.url+'minigame-lab.html'+(dev?'?dev=1':''));
  if(dev){await page.waitForFunction(()=>window.RALab&&document.querySelectorAll('#labList button').length>0);rows.push({width:390,name:'lab-dev',url:new URL(page.url()).pathname,lab:true,games:await page.locator('#labList button').count()});await page.screenshot({path:path.join(out,'390-lab-dev.png')});}
  else{await page.waitForURL(server.url);await page.waitForFunction(()=>window.RANewGame);release(await record(page,390,'lab-normal-returns-to-game'),'normal lab route');}
  await ctx.close();
 }
 for(const [file,id]of [['party-dev.html','enter'],['rave-review.html','enterRave']]){
  const {ctx,page}=await pageFor(390);await page.goto(server.url+file);await page.locator('#'+id).waitFor();assert.equal(await page.locator('#'+id).isDisabled(),true);rows.push({width:390,name:file,url:new URL(page.url()).pathname,entryDisabled:true});await page.screenshot({path:path.join(out,`390-${file}.png`)});await ctx.close();
 }
 assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
}finally{
 await writeFile(path.join(out,'metrics.json'),JSON.stringify({widths:[360,390,430],frames:rows.length,checks:rows,errors,failed},null,2)+'\n');
 await browser.close();await server.close();
}
console.log(`PASS release surface: ${rows.length} frames, ${errors.length} errors, ${failed.length} failed requests`);
