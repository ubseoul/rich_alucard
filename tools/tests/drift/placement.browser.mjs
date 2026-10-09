/** Actual browser regression for initial placement versus authored movement.
 * NODE_PATH must resolve playwright-core. Usage: node placement.browser.mjs URL OUTPUT.
 * Chrome can be selected with RA_CHROME_PATH. Only disposable browser state is used.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium}=require('playwright-core');
const base=process.argv[2]||'http://127.0.0.1:8916/',out=path.resolve(process.argv[3]||'placement-evidence');
await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.RA_CHROME_PATH||(process.platform==='win32'?'C:/Program Files/Google/Chrome/Application/chrome.exe':undefined)});
const results={base,classification:'Native opening, reload and combat controls; separately labelled source-valid component fixtures and explicit Director movement API checks. No user saves, renderer/source overrides, forced HP, RNG or combat outcomes.',cases:[],errors:[]};
const check=(id,condition,detail)=>{results.cases.push({id,pass:!!condition,detail});assert.ok(condition,id+': '+JSON.stringify(detail));};
async function install(p){await p.addInitScript(()=>{
 window.__placement={traces:[],transitions:[]};
 document.addEventListener('transitionrun',e=>{if(e.target.matches('.adv-actor,.c2-actor'))window.__placement.transitions.push({property:e.propertyName,slot:e.target.dataset.slot,at:performance.now()});},true);
 document.addEventListener('ra:presentation-enter',e=>{
  const trace={stage:e.detail.stage,mode:e.detail.mode,node:window.RAAdventures?.active()?.node,at:performance.now(),samples:[]};window.__placement.traces.push(trace);
  const read=()=>{if(performance.now()-trace.at>1150)return;
   const actors=[...document.querySelectorAll('#pdWorld .adv-actor,#pdWorld .c2-actor')].map(el=>{const b=el.getBoundingClientRect(),parent=el.parentElement.getBoundingClientRect(),cs=getComputedStyle(el);return {id:el.dataset.actor,slot:el.dataset.slot,x:b.x,y:b.y,targetX:parent.x+parseFloat(el.style.left),targetY:parent.y+parseFloat(el.style.top),opacity:cs.opacity,animation:cs.animationName,transition:cs.transition,src:el.getAttribute('src'),loaded:el.tagName!=='IMG'||el.complete&&el.naturalWidth>0};});
   trace.samples.push({dt:performance.now()-trace.at,actors});setTimeout(read,32);
  };read();
 });
 });}
async function placement(p,id,{entrance=false}={}){
 await p.waitForTimeout(1200);const d=await p.evaluate(()=>window.__placement);
 const trace=d.traces.at(-1);check(id+'-actors',trace?.samples.some(s=>s.actors.length),{traceCount:d.traces.length,stage:trace?.stage,node:trace?.node});
 const all=trace.samples.flatMap(s=>s.actors),xError=Math.max(0,...all.map(a=>Math.abs(a.x-a.targetX))),yError=Math.max(0,...all.map(a=>Math.abs(a.y-a.targetY)));
 const final=trace.samples.at(-1).actors;
 check(id+'-instant-x',xError<=.75,{xError,first:trace.samples[0],final});
 if(!entrance)check(id+'-instant-y',yError<=.75,{yError});
 check(id+'-loaded',final.every(a=>a.loaded),{final});
 const leftRuns=d.transitions.filter(t=>t.property==='left');check(id+'-no-default-slide',leftRuns.length===0,{leftRuns});
 await fs.writeFile(path.join(out,id+'.json'),JSON.stringify(d,null,2));return d;
}
async function fixture(p,id,node,vars={}){
 await p.evaluate(({id,node,vars})=>{
  RAAdventures.abandon();RAState.patch('life.clock.started',true);RAState.patch('life.world.flags.throneDone',true);RAState.patch('life.world.flags.prologueDone',true);
  RAState.patch('life.adventures.active',{id,node,applied:[node],vars,startedDay:1,from:'phone',env:'bedroom',actors:{}});
  window.__placement={traces:[],transitions:[]};RAScenes.go('adventure',{node});
 },{id,node,vars});
 await p.waitForFunction(({id,node})=>RAAdventures.active()?.id===id&&RAAdventures.active()?.node===node&&window.__placement.traces.length>0,{id,node});
}
async function authored(p,width){
 const d=await p.evaluate(async()=>{
  const ctl=RAPresentationDirector.current(),els=[...document.querySelectorAll('#pdWorld .adv-actor')],el=els.find(e=>e.dataset.actor==='ceo')||els.at(-1),slot=el.dataset.slot,actor=ctl.frame.actors[slot],original={x:actor.world.x,line:actor.line};
  const read=()=>{const b=el.getBoundingClientRect(),r=el.parentElement.getBoundingClientRect();return {x:b.x,target:r.x+parseFloat(el.style.left),transition:getComputedStyle(el).transition};};
  const before=read(),samples=[];const walk=RAPresentationDirector.moveTo(slot,{...original,x:original.x+24},{kind:'walk',ms:400,steps:4});
  for(let i=0;i<6;i++){samples.push(read());await new Promise(r=>setTimeout(r,90));}await walk;const after=read();
  await RAPresentationDirector.moveTo(slot,original,{kind:'cut'});const cut=read();
  const enterSamples=[],enter=RAPresentationDirector.moveTo(slot,original,{kind:'enter',ms:400,steps:4});for(let i=0;i<7;i++){enterSamples.push(read());await new Promise(r=>setTimeout(r,80));}await enter;const enterFinal=read();
  return {slot,before,samples,after,cut,enterSamples,enterFinal};
 });
 const moved=Math.abs(d.after.x-d.before.x),intermediate=d.samples.some(s=>Math.abs(s.x-d.before.x)>.75&&Math.abs(s.x-d.after.x)>.75);
 check('authored-walk-'+width,moved>5&&intermediate&&Math.abs(d.after.x-d.after.target)<=.75,d);
 check('authored-cut-'+width,Math.abs(d.cut.x-d.cut.target)<=.75,d.cut);
 check('authored-enter-'+width,d.enterSamples.some(s=>Math.abs(s.x-d.enterFinal.x)>5)&&Math.abs(d.enterFinal.x-d.enterFinal.target)<=.75,{enterSamples:d.enterSamples,enterFinal:d.enterFinal});
 await fs.writeFile(path.join(out,'authored-'+width+'.json'),JSON.stringify(d,null,2));
}
try{
 for(const [w,h] of [[360,800],[390,844],[430,932],[1280,900]].filter(([w])=>!process.env.RA_PLACEMENT_WIDTHS||process.env.RA_PLACEMENT_WIDTHS.split(',').includes(String(w)))){
  const context=await browser.newContext({viewport:{width:w,height:h},hasTouch:w<500,isMobile:w<500}),p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await install(p);
  try{
   await p.goto(base,{waitUntil:'load',timeout:90000});await p.waitForFunction(()=>window.RAAstraCheckoutPlaceholder);await p.locator('#startButton').click();await p.waitForFunction(()=>RAAdventures.active()?.id==='LEGENDARY_CORPORATE_LIFE');
   await placement(p,'native-start-'+w);await authored(p,w);
   await p.reload({waitUntil:'load'});await p.waitForFunction(()=>window.RAAstraCheckoutPlaceholder);await p.locator('#startButton').click();await placement(p,'native-reload-'+w);
   for(let i=0;i<16&&!(await p.locator('.c2-scene').count());i++){await p.keyboard.press('Enter');await p.waitForTimeout(160);}
   await p.waitForSelector('.c2-scene');await placement(p,'native-fight-entry-'+w);
   await p.locator('[data-c2="fight"]').click();const hpBefore=await p.locator('.c2-hp-enemy strong').textContent(),ppBefore=await p.locator('[data-c2="move:blood"] small').textContent();await p.locator('[data-c2="move:blood"]').click();await p.waitForFunction(()=>document.querySelector('[data-c2="fight"]')||document.querySelector('.c2-result'));
   const hpAfter=await p.locator('.c2-hp-enemy strong').textContent();await p.locator('[data-c2="fight"]').click();const ppAfter=await p.locator('[data-c2="move:blood"] small').textContent();check('native-combat-turn-'+w,+ppBefore.match(/(\d+)\//)[1]-+ppAfter.match(/(\d+)\//)[1]===1,{hpBefore,hpAfter,ppBefore,ppAfter,classification:'Unforced combat turn; hit/miss randomness preserved.'});
   await p.locator('.ra-minigame-quit').click();await p.waitForSelector('.c2-scene',{state:'detached'});await p.waitForFunction(()=>RAScenes.current()==='bedroom'&&!RAMinigames.active());await p.waitForTimeout(100);
   for(const [id,node,vars,tag] of [['A47','in',{},'visitor-cat'],['NEW_OGA_M6','voice',{},'bedroom-dog'],['RB_DELIVERY','arrive',{car:'urus'},'car-delivery'],['A56','arrive',{},'authored-entrance']]){
    await fixture(p,id,node,vars);check(tag+'-visible-'+w,await p.locator('.adv-scene').isVisible()&&await p.locator('.c2-scene').count()===0,{classification:'Declared component fixture after actual native QUIT; no combat overlay.'});const d=await placement(p,tag+'-'+w,{entrance:tag==='authored-entrance'});
    if(tag==='authored-entrance')check('entrance-keyframe-'+w,d.traces.at(-1).samples.some(s=>s.actors.some(a=>a.id==='lil_smack'&&a.animation==='advEntrance')),d.traces.at(-1).samples.slice(0,3));
    if(w===390&&(tag==='visitor-cat'||tag==='car-delivery'||tag==='authored-entrance'))await p.screenshot({path:path.join(out,tag+'-'+w+'.png')});
   }
   check('page-errors-'+w,errors.length===0,{errors});
  }finally{results.errors.push(...errors);await context.close();}
 }
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true}),p=await context.newPage(),slowErrors=[];p.on('pageerror',e=>slowErrors.push(e.message));await install(p);let slowRequests=0;
 await p.route('**/*.png',async route=>{slowRequests++;await new Promise(r=>setTimeout(r,750));await route.continue();});
 await p.goto(base,{waitUntil:'load',timeout:90000});await p.waitForFunction(()=>window.RAAstraCheckoutPlaceholder);await p.locator('#startButton').click();await placement(p,'slow-cold-native-390');
 await fixture(p,'A47','in');await placement(p,'slow-cold-visitor-390');check('slow-assets-used',slowRequests>0,{slowRequests});check('slow-page-errors',slowErrors.length===0,{slowErrors});results.errors.push(...slowErrors);await context.close();
 results.pass=true;
}catch(e){results.pass=false;results.failure=e.stack;console.error(e.stack);process.exitCode=1;}
finally{await browser.close();await fs.writeFile(path.join(out,'results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify({pass:results.pass,cases:results.cases.length,failed:results.cases.filter(x=>!x.pass),errors:results.errors}));}