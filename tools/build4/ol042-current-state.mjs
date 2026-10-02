// Local review fixtures only: source-grounded minigame canvases for Ube's image prompts.
import {serve,launch,open,root} from '../tests/f15/_browser.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
const out=path.join(root,'docs/evidence/build4/ol042/references');await mkdir(out,{recursive:true});
const cases=[['pickup_court','pickup',{}],['jollof_kitchen','jollof',{mode:'practice'}],['jollof_cookoff','jollof',{mode:'cookoff'}],['jollof_final','jollof',{mode:'final'}],['pier_game','pier',{}],['hookah_roof','hookah',{company:'DATE'}],['owambe_birthday','owambe_collection',{}],['hatch_castle','hatch',{lab:true,stage:'majestic'}],['hatch_room','hatch',{lab:true,stage:'egg'}],['senator_care_ground','hatch',{mode:'senator'}],['touge','touge',{}]];
const s=await serve(),b=await launch();
try{
 const {page,ctx,errors}=await open(b,s.url,{});
 await page.evaluate(()=>{document.querySelector('#startOverlay')?.remove();});
 for(const [name,id,params] of cases){
  await page.evaluate(({id,params})=>{RAMinigames.quitActive();void RAMinigames.launch(id,params);},{id,params});
  await page.waitForTimeout(300);
  const canvas=page.locator('.ra-minigame canvas').first();await canvas.waitFor();
  const data=await canvas.evaluate(c=>c.toDataURL('image/png').split(',')[1]);
  await writeFile(path.join(out,`${name}_current.png`),Buffer.from(data,'base64'));
 }
 await page.evaluate(()=>RAMinigames.quitActive());
 if(errors.length)throw new Error(errors.join('\n'));
 await ctx.close();console.log(`PASS ${cases.length} native current-state canvas references; no page errors`);
}finally{await b.close();await s.close();}
