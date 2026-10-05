// Verify real minigame sprite draws: intercept the actual canvas draw transform, then independently read
// frozen alpha feet and compare them with each game's authored drawSprite contact point.
import {serve,launch,open,root} from '../tests/f15/_browser.mjs';
import {SIZES} from '../grounding-test.mjs';
import {execFileSync} from 'node:child_process';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
const baseline=process.argv.includes('--baseline'),phase=baseline?'before':'after',out=path.join(root,'docs/evidence/final_a/stage2',phase,'minigames'),notes=JSON.parse(await readFile(path.join(root,'tools/presentation/annotations.json'),'utf8')).assets;
const games=[['pickup','pickup',{}],['jollof','jollof',{mode:'practice'}],['pier','pier',{}],['hookah_rookoko','hookah',{company:'ROOKOKO'}],['hookah_crew','hookah',{company:'CREW'}],['hookah_date','hookah',{company:'DATE'}],['senator','hatch',{mode:'senator'}],['bars','bars',{}],['slurp','slurp',{}]];
await mkdir(out,{recursive:true});const server=await serve(),browser=await launch(),rows=[];
try{for(const [width,height]of SIZES){const {page,ctx,errors,failed}=await open(browser,server.url,{width,height,dpr:3});
 if(baseline){for(const f of ['js/data/presentation_assets.js','js/engine/pixel.js']){const body=execFileSync('git',['-c','gc.auto=0','show',`0c6ccc3d18:${f}`],{cwd:root,encoding:'utf8'});await page.route('**/'+f+'*',route=>route.fulfill({status:200,contentType:'text/javascript',body}));}await page.reload();await page.waitForFunction(()=>window.RAMinigames&&window.RAF15);}
 await page.evaluate(async()=>{document.querySelector('#startOverlay')?.remove();document.querySelector('#devPanel')?.remove();await RAScenes.go('bedroom',{dev:true});});
 await page.evaluate(()=>{
  window.__groundingDraws=new Map();
  for(const name of ['drawSprite','drawRegistered']){const draw=RAPixel[name];
   RAPixel[name]=function(g,img,x,y,opts){const before=g.getTransform(),original=g.drawImage;let actual=null;
    g.drawImage=function(image,...args){if(image?.getAttribute?.('src')){const t=g.getTransform();actual={src:image.getAttribute('src'),x,y,args,matrix:{a:t.a,b:t.b,c:t.c,d:t.d,e:t.e,f:t.f},before:{a:before.a,b:before.b,c:before.c,d:before.d,e:before.e,f:before.f},canvas:g.canvas};}return original.call(g,image,...args)};
    try{const ok=draw.call(this,g,img,x,y,opts);if(ok&&actual)window.__groundingDraws.set(actual.src+'|'+x+'|'+y,actual);return ok}finally{g.drawImage=original}
   };
  }
 });
 for(const [name,id,params]of games){await page.evaluate(({id,params})=>{RAMinigames.quitActive();window.__groundingDraws.clear();void RAMinigames.launch(id,params);},{id,params});await page.locator('.ra-minigame canvas').first().waitFor();await page.waitForTimeout(650);
  const contacts=await page.evaluate(async notes=>{const out=[];for(const a of window.__groundingDraws.values()){
   const img=new Image();img.src=a.src;await img.decode();const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;const g=c.getContext('2d');g.drawImage(img,0,0);const pixels=g.getImageData(0,0,c.width,c.height).data,clip=notes[a.src]?.support?.box||[0,0,c.width,c.height];let row=-1;
   for(let y=clip[1];y<clip[1]+clip[3];y++)for(let x=clip[0];x<clip[0]+clip[2];x++)if(pixels[(y*c.width+x)*4+3]>=(notes[a.src]?.support?.threshold||16))row=Math.max(row,y);
   const rect=a.canvas.getBoundingClientRect(),sy=rect.height/a.canvas.height,lift=notes[a.src]?.grounding?.lift||0,floor=a.before.f+Math.round(a.y)*a.before.d,feet=a.matrix.f+(a.args[1]+row+1)*a.matrix.d,delta=(feet+lift*a.matrix.d-floor)*sy;
   out.push({asset:a.src,sourceBaseline:row+1,authoredFloorY:a.y,actualDrawY:a.args[1],floorPx:rect.top+floor*sy,feetPx:rect.top+feet*sy,deltaPx:delta,pass:Math.abs(delta)<.01});
  }return out},notes);
  rows.push({width,game:name,contacts,screenshot:`${width}_${name}.png`});await page.screenshot({path:path.join(out,`${width}_${name}.png`)});
 }
 await page.evaluate(()=>RAMinigames.quitActive());if(errors.length||failed.length)throw new Error([...errors,...failed].join('\n'));await ctx.close();console.log(`${phase.toUpperCase()} ${width}: minigame sprite baselines measured`);
}}finally{const result={phase,frames:rows.length,contacts:rows.reduce((n,r)=>n+r.contacts.length,0),violations:rows.flatMap(r=>r.contacts).filter(c=>!c.pass).length,rows};await writeFile(path.join(out,'metrics.json'),JSON.stringify(result,null,2)+'\n');console.log(`${phase.toUpperCase()}: ${result.contacts} minigame contacts; ${result.violations} violations`);await browser.close();await server.close();if(!baseline&&result.violations)throw new Error(`${result.violations} minigame grounding errors`);}
