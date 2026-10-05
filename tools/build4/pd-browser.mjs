// Review fixtures use existing authored screen casts and production minigames; no production story is introduced.
import {serve,launch,open,root} from '../tests/f15/_browser.mjs';
import {dryRun} from '../presentation-adventure-dryrun.mjs';
import {measure,evaluate} from '../tests/f15/_art.mjs';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import path from 'node:path';
const arg=n=>{const i=process.argv.indexOf('--'+n);return i<0?null:process.argv[i+1];};
const out=path.resolve(arg('out')||path.join(root,'docs/evidence/build4/p-d'));await mkdir(out,{recursive:true});
const manifest=JSON.parse(await readFile(path.join(root,'assets/build4/p_d/manifest.json'),'utf8'));
const ids=Object.keys(manifest.runtime.characters),envs=Object.keys(manifest.runtime.environments).concat('gbenga_rentals');
const rows=(await dryRun()).rows.filter(r=>envs.includes(r.env)||Object.values(r.castSpecs).some(a=>ids.includes(typeof a==='string'?a:a?.id)));
for(const env of ['f15_exam_hall','f15_library'])rows.push({env,key:env,refs:['F15 existing environment review'],castSpecs:{left:'rich',right:'emerald'}});
for(const env of ['catacomb_dead','halloween'])rows.push({env,key:env,refs:['Existing registered environment; visual fixture only'],castSpecs:{left:'rich'}});
for(const [id,env] of [['kiosk_guy','grave'],['smallie_cousin','boba_shop']])rows.push({env,key:id,refs:['Existing dynamic/registered actor; visual fixture only'],castSpecs:{left:'rich',right:id}});
const games=[['pickup_court','pickup',{}],['jollof_kitchen','jollof',{mode:'practice'}],['jollof_cookoff','jollof',{mode:'cookoff'}],['jollof_final','jollof',{mode:'final'}],['pier_game','pier',{}],['hookah_roof','hookah',{company:'DATE'}],['owambe_birthday','owambe_collection',{}],['hatch_castle','hatch',{lab:true,stage:'majestic'}],['hatch_room','hatch',{lab:true,stage:'egg'}],['senator_care_ground','hatch',{mode:'senator'}]];
const results=[],s=await serve(),browser=await launch();
try{
 for(const [width,height] of [[360,740],[390,844],[430,932]]){
  const {page,ctx,errors,failed}=await open(browser,s.url,{width,height});
  await page.evaluate(()=>{document.querySelector('#startOverlay')?.remove();document.querySelector('#devPanel')?.remove();RAF15Dates?.ensureContent?.();});
  // Resolve F15's flag-owned environment registration through its existing entry point.
  await page.evaluate(()=>RAF15?.ensureContent?.());
  for(let i=0;i<rows.length;i++){
   const r=rows[i];await page.evaluate(async ({r,i,width})=>{RAAdventures.abandon();const id=`PD_REVIEW_${width}_${i}`;RAAdventures.define({id,title:'P-D VISUAL REVIEW',lane:'review',start:'frame',available:()=>true,nodes:{frame:{env:r.env,actors:r.castSpecs,lines:[RAContent.N(r.env)],end:{outcome:'review'}}}});await RAAdventureScene.begin(id,{from:'qa'});},{r,i,width});
   await page.waitForSelector('#adventureScene');
   for(let j=0;j<10&&await page.locator('.adv-title:not([hidden])').count();j++){await page.mouse.click(width/2,70);await page.waitForTimeout(70);}
   await page.waitForTimeout(700); // Let the existing 500 ms left-position transition settle before measuring.
   const m=await page.evaluate(measure);if(!m)throw new Error(`missing ${r.key}`);
   await writeFile(path.join(out,`${width}_cast_${String(i).padStart(2,'0')}_measurement.json`),JSON.stringify(m,null,2)+'\n');
   const checks=evaluate(m,`${width} ${r.key}`);
   for(const a of m.actors.filter(a=>a.tag==='IMG'&&!a.hidden))checks.push({ok:Math.abs(a.css.x-a.sprite.x)<1.6&&Math.abs(a.css.y-a.sprite.y)<1.6,msg:`${a.id} CSS agrees with settled camera placement`});
   const bad=checks.filter(c=>!c.ok);results.push({width,key:r.key,refs:r.refs,checks});
   if(bad.length)throw new Error(bad.map(c=>c.msg).join('; '));
   await page.screenshot({path:path.join(out,`${width}_cast_${String(i).padStart(2,'0')}_${r.env}.png`)});
  }
  await page.evaluate(()=>{RAAdventures.abandon();const board=RAPixel.drawBoard;RAPixel.drawBoard=(ctx,id)=>{const ok=board(ctx,id);if(ok)ctx.canvas.dataset.pdBoard=id;return ok;};});
  await page.evaluate(()=>{const draw=RAPixel.drawRegistered;RAPixel.drawRegistered=(ctx,id,...args)=>{const ok=draw(ctx,id,...args);if(ok)ctx.canvas.dataset.pdActor=id;return ok;};});
  for(const [name,id,params] of games){
   await page.evaluate(({id,params})=>{RAMinigames.quitActive();void RAMinigames.launch(id,params);},{id,params});
   const canvas=page.locator('.ra-minigame canvas').first();await canvas.waitFor();
   await page.waitForFunction(name=>document.querySelector('.ra-minigame canvas')?.dataset.pdBoard===name,name);
   const box=await canvas.boundingBox();if(box.x<-.5||box.x+box.width>width+.5)throw new Error(`${width} ${name}: canvas outside viewport`);
   await page.screenshot({path:path.join(out,`${width}_game_${name}.png`)});results.push({width,key:name,boardLoaded:true,canvasInsideViewport:true});
   if(name==='jollof_kitchen'){
    await page.waitForFunction(()=>document.querySelector('.ra-minigame canvas')?.dataset.pdActor==='jollof_cook');
    await page.evaluate(()=>{window.__PDJudgeSprite=null;const draw=RAPixel.drawSprite;RAPixel.drawSprite=(ctx,img,...args)=>{const ok=draw(ctx,img,...args);if(ok)window.__PDJudgeSprite=img?.getAttribute('src');return ok;};});
    const tap=async(x,y)=>{const b=await canvas.boundingBox();await page.mouse.click(b.x+x*b.width/270,b.y+y*b.height/480);};
    const b=await canvas.boundingBox();await page.mouse.move(b.x+b.width/2,b.y+b.height*.45);await page.mouse.down();await page.waitForTimeout(300);await page.mouse.up();
    await page.waitForTimeout(1350);await tap(135,400);await page.waitForTimeout(750);
    for(const x of [30,78,126])await tap(x,210);await tap(135,420);await page.waitForTimeout(120);await tap(135,415);
    await page.waitForFunction(()=>window.__PDJudgeSprite===RABtfPeople.get('nneka').sprite);
    await page.screenshot({path:path.join(out,`${width}_game_jollof_judging.png`)});results.push({width,key:'jollof_cook',incidentalCookingSpriteLoaded:true,namedJudgeUsesOwnFrozenIdentity:true});
   }
  }
  await page.evaluate(()=>RAMinigames.quitActive());
  if(errors.length||failed.length)throw new Error([...errors,...failed].join('\n'));await ctx.close();
  console.log(`PASS P-D ${width}: ${rows.length} authored casts + ${games.length} production minigame backgrounds`);
 }
}catch(e){console.error('FAIL P-D',e.message);process.exitCode=1;results.push({failure:e.message});}
finally{await browser.close();await s.close();await writeFile(path.join(out,'results.json'),JSON.stringify(results,null,2)+'\n');}
