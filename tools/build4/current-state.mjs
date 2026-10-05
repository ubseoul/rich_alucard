// Native runtime fallback pixels for the SR-7 review board; not scene-pass evidence.
import {serve,launch,open,root} from '../tests/f15/_browser.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
const out=path.join(root,'docs/evidence/build4/current-state');await mkdir(out,{recursive:true});
const s=await serve(),b=await launch();
try{
 const {page,ctx,errors}=await open(b,s.url,{});
 const inventory=await page.evaluate(()=>({envs:RAEnvironments.all().filter(e=>e.placeholder).map(e=>e.id),actors:Object.values(RABtfPeople.byId).filter(p=>!p.sprite).map(p=>p.id)}));
 for(const [kind,ids] of Object.entries(inventory))for(const id of ids){
  const data=await page.evaluate(({kind,id})=>{
   const canvas=document.createElement('canvas');canvas.width=270;canvas.height=480;const g=canvas.getContext('2d');g.imageSmoothingEnabled=false;
   if(kind==='envs')RAPixel.paintEnvironment(g,RAEnvironments.get(id).paint);
   else{g.fillStyle='#181522';g.fillRect(0,0,270,480);RAPixel.drawActor(g,RABtfPeople.byId[id].look||{},135,360,3);}
   return canvas.toDataURL('image/png').split(',')[1];
  },{kind,id});
  await writeFile(path.join(out,`${kind}_${id}.png`),Buffer.from(data,'base64'));
 }
 await writeFile(path.join(out,'CAPTURE.json'),JSON.stringify({role:'runtime fallback samples, not real-route validation',inventory,errors},null,2)+'\n');
 console.log(`Captured ${inventory.envs.length} environments and ${inventory.actors.length} actors; ${errors.length} page errors`);
 await ctx.close();
}finally{await b.close();await s.close();}
