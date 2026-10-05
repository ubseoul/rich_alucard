// Real Chromium audit of production Director geometry using actual frozen pixels and measured DOM rectangles.
// Fixture labels identify the authored screen being measured; they add no game content.
import {inventory,SIZES} from '../grounding-test.mjs';
import {serve,launch,open,root} from '../tests/f15/_browser.mjs';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
const baseline=process.argv.includes('--baseline'),all=process.argv.includes('--all');
const phase=baseline?'before':'after',out=path.join(root,'docs/evidence/final_a/stage2',phase),{rows}=await inventory({baseline});
const notes=JSON.parse(await readFile(path.join(root,'tools/presentation/annotations.json'),'utf8')).assets;
const selected=all?rows:rows.filter(r=>/octopus_sensei|coffe@hype|vicky@doorway|roxy_apartment|rosalyn_apartment_dark/.test(r.key)||r.key==='jdm-imports-docks/payoff/supra/assets/jdm_imports/vehicles/supra_mk4_world.png');
await mkdir(out,{recursive:true});const server=await serve(),browser=await launch(),results=[];
try{
 for(const [width,height]of SIZES){
  const {page,ctx,errors,failed}=await open(browser,server.url,{width,height,dpr:3});
  await page.evaluate(()=>{document.querySelector('#startOverlay')?.remove();document.querySelector('#devPanel')?.remove();window.RAPresentationDirector.exit();document.querySelector('#battleUI').style.display='none';});
  if(baseline)for(const file of ['js/data/presentation_assets.js','js/engine/stage.js']){
   let content=execFileSync('git',['-c','gc.auto=0','show',`0c6ccc3d18:${file}`],{cwd:root,encoding:'utf8'});
   if(file==='js/engine/stage.js')content=content.replace('adventureStage,combat2Stage,enterMounted','adventureStage,combat2Stage,chooseShot,enterMounted');
   await page.addScriptTag({content});
  }
  for(let i=0;i<selected.length;i++){
   const r=selected[i];
   const metrics=await page.evaluate(async ({r,notes,baseline})=>{
    const D=RAPresentationDirector;D.exit();document.querySelector('#groundingFixture')?.remove();
    const screen=document.querySelector('#screen'),host=document.createElement('section');host.id='groundingFixture';host.className=r.mode==='combat'?'c2-scene':'adv-scene';host.style.cssText='position:absolute;inset:0;background:#080711';screen.append(host);
    const actors={},pending=[],env=document.createElement('img');env.alt='';env.style.zIndex='1';env.src=r.stage.environment||RAEnvironments.get(r.stage.id.replace(/^adv:|^c2:/,''))?.image||'';
    if(env.src&&!env.src.endsWith('/')){pending.push(env.decode().catch(()=>{}));host.append(env)}
    const assets={};
    for(const [slot,src]of Object.entries(r.assets))if(src){const [file,index]=src.split('#'),m=RAPresentationAssets[file];let el;
     if(index==null){el=document.createElement('img');el.src=file;el.alt='';pending.push(el.decode());}
     else{el=document.createElement('div');el.style.backgroundImage=`url('${file}')`;const image=new Image();image.src=file;pending.push(image.decode());}
     el.className='adv-actor';el.dataset.slot=slot;el.style.zIndex=String(r.stage.actors[slot]?.layer||r.stage.objects?.[slot]?.layer||5);if(r.stage.actors[slot]?.flip)el.style.transform='scaleX(-1)';host.append(el);actors[slot]=el;assets[slot]=()=>src;
    }
    await Promise.all(pending);
    D.enter({stage:r.stage,mode:r.mode,beat:r.beat||'default',shot:r.shot,host,env,actors,assetOf:assets,fx:false,autoShot:!r.shot});
    const frame=D.current().frame;
    for(const [slot,src]of Object.entries(r.assets)){const [file,index]=(src||'').split('#');if(index!=null&&actors[slot]){const m=RAPresentationAssets[file],a=frame.actors[slot];actors[slot].style.backgroundSize=`${m.width*a.k}px ${m.height*a.k}px`;actors[slot].style.backgroundPosition=`${-Number(index)*m.sheet.frameWidth*a.k}px 0`;}}
    const label=document.createElement('p');label.textContent=r.ref+' · '+r.key;label.style.cssText='position:absolute;left:8px;right:8px;bottom:12px;z-index:100;color:#f6efd9;font:10px/1.4 monospace';host.append(label);
    // Settle existing actor transitions before measuring the browser's actual rectangles.
    for(const el of Object.values(actors))el.style.transition='none';await new Promise(requestAnimationFrame);
    const sr=screen.getBoundingClientRect(),contacts=[];
    for(const [slot,el]of Object.entries(actors)){
     const a=frame.actors[slot],src=r.assets[slot],[file,index]=src.split('#'),img=new Image();img.src=file;await img.decode();
     const canvas=document.createElement('canvas'),fw=index==null?img.naturalWidth:RAPresentationAssets[file].sheet.frameWidth;canvas.width=fw;canvas.height=img.naturalHeight;const g=canvas.getContext('2d');g.drawImage(img,index==null?0:-Number(index)*fw,0);const data=g.getImageData(0,0,fw,canvas.height).data;
     const clip=notes[file]?.support?.box||[0,0,fw,canvas.height],threshold=notes[file]?.support?.threshold||16;let bottom=-1;
     for(let y=clip[1];y<clip[1]+clip[3];y++)for(let x=clip[0];x<clip[0]+clip[2];x++)if(data[(y*fw+x)*4+3]>=threshold)bottom=Math.max(bottom,y);
     const rect=el.getBoundingClientRect(),k=rect.height/canvas.height,line=r.stage.contactLines.find(l=>l.id===a.line),floor=frame.world.y+(line.y-frame.camera.y)*frame.S,lift=notes[file]?.grounding?.lift||0,feet=rect.top-sr.top+(bottom+1)*k,delta=feet-(floor-lift*k),shadow=document.querySelector(`.pd-ground-shadow[data-slot='${slot}']`),sh=shadow?.getBoundingClientRect();
     contacts.push({slot,asset:src,baseline:bottom+1,feet,floor,lift,delta,domVsDirector:{x:rect.left-sr.left-a.sprite.x,y:rect.top-sr.top-a.sprite.y},shadow:sh?{centerY:sh.top-sr.top+sh.height/2,delta:sh.top-sr.top+sh.height/2-floor}:null,pass:Math.abs(delta)<=.5&&Math.abs(rect.top-sr.top-a.sprite.y)<=.5&&(baseline||!a.meta.support||!!shadow)});
    }
    return {stage:r.key,ref:r.ref,width:innerWidth,contacts,pass:contacts.every(a=>a.pass)};
   },{r,notes,baseline});
   results.push(metrics);
   // Every measured frame is reproducible; screenshots are kept for the distinct changed casts and mounted props.
   if(!all||selected.some(x=>x.key===r.key&&/octopus_sensei|coffe@hype|vicky@doorway|roxy_apartment|rosalyn_apartment_dark|\/payoff\//.test(x.key)))await page.screenshot({path:path.join(out,`${width}_${String(i).padStart(3,'0')}.png`)});
  }
  if(errors.length||failed.length)throw new Error([...errors,...failed].join('\n'));
  console.log(`${phase.toUpperCase()} ${width}: ${selected.length} actual browser scene variants; ${results.filter(r=>r.width===width&&!r.pass).length} contact failures`);await ctx.close();
 }
}finally{await browser.close();await server.close();const summary={phase,sceneVariants:selected.length,frames:results.length,contacts:results.reduce((n,r)=>n+r.contacts.length,0),violations:results.flatMap(r=>r.contacts).filter(r=>!r.pass).length,maxDeltaPx:Math.max(...results.flatMap(r=>r.contacts.map(c=>Math.abs(c.delta)))),results};await writeFile(path.join(out,'browser.json'),JSON.stringify(summary,null,2)+'\n');if(!baseline&&summary.violations)throw new Error(`${summary.violations} real-browser foot-contact violations`);}
