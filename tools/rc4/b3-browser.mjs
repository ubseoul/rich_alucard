import {open} from '../rc2/harness.mjs';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const phase=process.env.RA_B3_PHASE||'before',out=`docs/rc4/evidence/B3/${phase}`;fs.mkdirSync(out,{recursive:true});
const h=await open({width:390,height:844,dir:process.env.RA_B3_DIR?path.resolve(process.env.RA_B3_DIR):undefined,query:'?mute=1'}),p=h.page;
const report={kind:'seeded art/staging fixtures; no natural playthrough claimed',phase,errors:h.errors,scenes:[],combat:[]};
try{
 await p.locator('#startButton').click();await p.waitForFunction(()=>!!window.RABtfPeople);
 report.cast=await p.evaluate(()=>Object.fromEntries([...RABtfPeople.list,...RABtfPeople.extras].map(x=>[x.id,{sprite:x.sprite||null,states:x.states||{},registry:!!RAArtRegistry.characters?.[x.id]}])));
 report.staticCastAudit=await p.evaluate(()=>{const unknown=[];for(const d of RAAdventures.all())for(const [node,n] of Object.entries(d.nodes))if(n.actors&&typeof n.actors==='object')for(const s of Object.values(n.actors)){const id=typeof s==='string'?s:s?.id;if(id&&id!=='rich'&&!RABtfPeople.get(id))unknown.push({adventure:d.id,node,id});}return unknown;});
 for(const [id,node] of [['NEW_OGA_M2','arrive'],['NEW_OGA_M4','beat4'],['NEW_OGA_M4','walk_in'],['NEW_OGA_M6','voice'],['NEW_OGA_M6','walked'],['NEW_OGA_M7','arrival']]){
  const available=await p.evaluate(id=>!!RAAdventures.get(id),id);if(!available){report.scenes.push({id,missing:true});continue;}
  await p.evaluate(async({id,node})=>{RAAdventures.abandon();RAAdventures.get(id).testSetup?.({RAState,RALife});RAAdventures.start(id,{from:'dev'});const env=id==='NEW_OGA_M4'&&node==='walk_in'?'gbenga_rentals':id==='NEW_OGA_M6'?'bedroom':null;RAAdventures.patchActive({node,...(env?{env}:{})});await RAAdventureScene.resume();},{id,node});
  await p.waitForTimeout(700);
  if(await p.locator('.adv-title').isVisible())await p.locator('.adv-title').click();
  const actors=await p.locator('.adv-actor').evaluateAll(els=>els.map(e=>({actor:e.dataset.actor,src:e.dataset.artPath||e.dataset.rc2Src?.match(/assets\/[^?]+/)?.[0]||e.getAttribute('src'),transformed:e.getAttribute('src')?.startsWith('data:')||false,state:e.dataset.artState,fallback:e.dataset.artFallback||null,loaded:e.tagName==='IMG'&&e.complete&&e.naturalWidth>0,natural:[e.naturalWidth,e.naturalHeight],director:window.RAPresentationDirector?.actorBox(e.dataset.slot),box:(()=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}})()})));
  await p.screenshot({path:`${out}/${id}-${node}-390.png`});
  await p.setViewportSize({width:1280,height:900});await p.waitForTimeout(100);await p.screenshot({path:`${out}/${id}-${node}-desktop.png`});await p.setViewportSize({width:390,height:844});
  if(phase!=='before')for(const a of actors){assert(a.loaded,`${id}:${node} ${a.actor} image loaded`);assert(!a.transformed,`${a.actor} frozen pixels unchanged`);assert(!a.fallback,`${a.actor} no silent fallback`);}
  report.scenes.push({id,node,actors});
 }
 await p.evaluate(async()=>{RAAdventures.abandon();await RAScenes.go('bedroom');});
 const blade=await p.evaluate(()=>Object.entries(RACombatData.ENEMIES).find(([,d])=>d.person==='bllad33')?.[0]);
 for(const enemy of ['gbenga','smallie','smallie_cousin','bonesworth','hilt',blade].filter(Boolean)){
  if(!await p.evaluate(id=>!!RACombatData.ENEMIES[id],enemy))continue;
  await p.evaluate(id=>{void RACombat2.run(id,{env:'gbenga_rentals'});},enemy);await p.waitForTimeout(450);
  const actor=await p.locator('.c2-enemy').evaluate(e=>({src:e.dataset.rc2Src?.match(/assets\/[^?]+/)?.[0]||e.getAttribute('src'),transformed:e.getAttribute('src')?.startsWith('data:')||false,loaded:e.complete&&e.naturalWidth>0,director:RAPresentationDirector.actorBox('enemy')}));
  const selected=await p.evaluate(id=>RACombatData.enemyArt(id),enemy);report.combat.push({enemy,actor,selected});
  if(phase!=='before'){assert.equal(actor.src,selected.base);assert(actor.loaded);assert(!actor.transformed);}
  await p.screenshot({path:`${out}/combat-${enemy}-390.png`});await p.evaluate(()=>RACombat2.active()?.abort());
 }
 await p.evaluate(()=>{window.__b3Draws=[];window.__b3DrawImage=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(img,...args){if(img?.getAttribute?.('src')?.includes('senator'))window.__b3Draws.push(img.getAttribute('src'));return window.__b3DrawImage.call(this,img,...args)};void RAMinigames.launch('hatch',{mode:'senator',skipRule:true});});
 await p.waitForTimeout(700);report.canvas=await p.evaluate(()=>[...new Set(window.__b3Draws)]);assert(report.canvas.some(s=>s.includes('senator_sitting')),'canvas care actually draws Senator');
 await p.screenshot({path:`${out}/canvas-senator-390.png`});await p.evaluate(()=>{RAMinigames.quitActive();CanvasRenderingContext2D.prototype.drawImage=window.__b3DrawImage;});
 const paths=new Set([...report.scenes.flatMap(s=>s.actors||[]).map(a=>a.src),...report.combat.map(c=>c.actor.src),...report.canvas]);
 report.assets=[];for(const src of paths){if(!src?.startsWith('assets/'))continue;const approval=await p.evaluate(src=>RAArtRegistry.assets[src]||null,src);const bytes=fs.readFileSync(path.join(process.env.RA_B3_DIR||'.',src));const sha256=createHash('sha256').update(bytes).digest('hex');if(approval?.status==='FROZEN')assert.equal(sha256,approval.sha256,src);report.assets.push({path:src,sha256,approval});}
 report.ok=h.errors.length===0;
}catch(e){report.failure=String(e.stack||e);throw e;}finally{fs.writeFileSync(`${out}/browser.json`,JSON.stringify(report,null,2)+'\n');await h.close();}
