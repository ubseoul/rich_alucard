#!/usr/bin/env node
// Reproduce the authored raid through ordinary START, sleep/wake, combat and choice controls.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {serve,launch,root} from '../tests/f15/_browser.mjs';
const out=path.join(root,'docs/evidence/final_a/stage4/a29c-renderer-fix');await mkdir(out,{recursive:true});
const server=await serve(),browser=await launch(),errors=[],failed=[],trace=[],roastLines=new Set(),fights=new Set();
let result;
try{
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:3});
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failed.push(`${r.status()} ${r.url()}`);});
 await page.goto(server.url);await page.waitForFunction(()=>window.RANewGame&&window.RAAdventures&&window.RABedroomLife);
 // Declared progressed-save fixture only: Coffe PT1 and PT2 complete, on PT2's night. No adventure is active,
 // no trigger is forced, and no combat/line/choice implementation is replaced. The next sleep must select A29C.
 await page.evaluate(()=>{
  RAState.reset();RAState.patch('life.clock.started',true);RAState.patch('life.world.day',22);
  for(const f of ['prologueDone','throneDone','firstWakeDone'])RALife.setFlag(f,true);
  RAState.patch('life.adventures.records.A29',{status:'completed',count:1,completedDay:2});
  RAState.patch('life.adventures.records.A29B',{status:'completed',count:1,completedDay:22,outcome:'ignored'});
  RARelations.meet('coffe','castle_gate');
 });
 await page.reload();await page.locator('#startButton').click();await page.waitForFunction(()=>RAScenes.current()==='bedroom');
 assert.equal(await page.locator('#devPanel').count(),0);assert.equal(await page.evaluate(()=>!!window.RATestPilot),false);
 await page.locator('.bedroom-sleep').click();await page.locator('[data-bed="yes"]').click();await page.locator('.mail-done').waitFor();
 const wake=await page.evaluate(()=>({day:RALife.today().day,trigger:RALife.flag('wakeTrigger')}));assert.equal(wake.day,23);assert.equal(wake.trigger.id,'A29C');
 await page.screenshot({path:path.join(out,'390-wake.png')});await page.locator('.mail-done').click();
 for(let step=0;step<160;step++){
  const s=await page.evaluate(()=>({scene:RAScenes.current(),id:RAAdventures.active()?.id,node:RAAdventures.active()?.node,combat:!!document.querySelector('.c2-scene'),text:document.querySelector('.adv-bubble:not([hidden]) span')?.textContent||document.querySelector('.adv-box:not([hidden]) .adv-text')?.textContent||'',record:RAAdventures.record('A29C')}));
  if(!trace.length||trace.at(-1).node!==s.node||trace.at(-1).combat!==s.combat)trace.push({step,...s});
  if(errors.length)throw new Error(errors.join('\n'));
  if(s.record?.status==='completed')break;
  assert.equal(s.id,'A29C','the actual wake must enter the authored raid');
  if(s.combat){
   fights.add(s.node);const done=page.locator('[data-c2="done"]');if(await done.count())await done.click();
   else{const run=page.locator('[data-c2="run"]');if(await run.count())await run.click();}
   // Every authored raid fight permits RUN/LOSE continuation. RUN is a normal player action; no outcome spoofing.
   await page.waitForTimeout(900);continue;
  }
  const roast=page.getByRole('button',{name:'ROAST HIM OUT THE DOOR',exact:true});
  if(await roast.count()){await roast.click();await page.waitForTimeout(130);continue;}
  if(s.node==='roast'){
   const texts=await page.evaluate(()=>[...document.querySelectorAll('.adv-bubble:not([hidden]) span,.adv-box:not([hidden]) .adv-text')].map(e=>e.textContent).filter(Boolean));
   for(const text of texts)if(!roastLines.has(text)){roastLines.add(text);await page.screenshot({path:path.join(out,`390-roast-${roastLines.size}.png`)});}
  }
  await page.locator('#adventureScene').click({position:{x:195,y:330}});await page.waitForTimeout(150);
 }
 await page.waitForFunction(()=>RAScenes.current()==='bedroom'&&!RAAdventures.active());
 result=await page.evaluate(()=>({scene:RAScenes.current(),active:RAAdventures.active(),record:RAAdventures.record('A29C'),fate:RALife.flag('coffeFate'),adventureDOM:!!document.querySelector('#adventureScene'),adventureClass:document.body.classList.contains('adventure-mode'),returnText:document.querySelector('.bedroom-return')?.textContent}));
 assert.equal(result.record.status,'completed');assert.equal(result.record.outcome,'roasted');assert.equal(result.fate,'exiled');assert.equal(result.adventureDOM,false);assert.equal(result.adventureClass,false);assert.match(result.returnText,/that was necessary\./);
 assert.equal(fights.size,4,'all four actual fight nodes must be traversed');
 assert.deepEqual([...roastLines],['get out. take the empty cup with you.','he posts sad content for weeks. bad lighting. captions nobody asked for.']);
 assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);await page.screenshot({path:path.join(out,'390-bedroom-return.png')});
 console.log('PASS normal 390px sleep/wake → A29C → four real fights → ROAST → completed/bedroom; 2 authored lines, 0 errors');
}finally{
 await writeFile(path.join(out,'metrics.json'),JSON.stringify({width:390,url:'/',fixture:'Progressed Day22 save: A29 PT1 completed Day2; A29B PT2 completed Day22. Ordinary UI selects next wake, four RUN combat continuations and roast choice. Not a fresh-career claim.',trace,fights:[...fights],roastLines:[...roastLines],result,errors,failed},null,2)+'\n');
 await browser.close();await server.close();
}
