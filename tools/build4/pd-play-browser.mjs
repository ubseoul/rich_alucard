import {serve,launch,root} from '../tests/f15/_browser.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
const out=path.join(root,'docs/evidence/build4/p-d/play');await mkdir(out,{recursive:true});
const server=await serve(),browser=await launch(),results=[];
try{
 for(const [width,height] of [[360,740],[390,844],[430,932]]){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:2}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
  // Review fixtures call the shipped renderer; suppress automatic story boot on the isolated preview page only.
  await page.route('**/feel-ui.mjs',route=>route.fulfill({contentType:'text/javascript',body:'export const boot=()=>{};'}));
  await page.goto(server.url+'assets/f01/play/index.html');
  await page.evaluate(async()=>{window.__PDScenes=await import('./feel-scenes.mjs');window.__PDArt=await import('./feel-art.mjs');document.querySelector('#fade').style.display='none';});
  for(const pose of ['walking','boarding','standing','wounded','carried']){
   const rows=await page.evaluate(async pose=>{
    const ids=['tunde','dre','half_pint','sunday_best','young_mazi','auntie_grit'],world=document.querySelector('#world');world.innerHTML='';world.style.background='#211b2a';
    for(const [i,id] of ids.entries()){
     const b=__PDScenes.bust({id,named:true},50,{pose:'standing'});b.style.left=(20+i%3*90)+'px';b.style.top=(150+Math.floor(i/3)*180)+'px';__PDScenes.setPose(b,pose);
     const label=document.createElement('div');label.textContent=id.replaceAll('_',' ');label.style.cssText=`position:absolute;left:${i%3*90}px;top:${205+Math.floor(i/3)*180}px;font:7px monospace;color:white;width:90px;text-align:center`;world.append(label);
    }
    const title=document.createElement('div');title.textContent=pose.toUpperCase();title.style.cssText='position:absolute;top:35px;left:0;width:270px;text-align:center;color:white;font:12px monospace';world.append(title);
    await Promise.all([...world.querySelectorAll('img')].map(i=>i.decode()));
    return [...world.querySelectorAll('.ogs')].map(i=>({src:i.getAttribute('src'),loaded:i.complete&&i.naturalWidth===80&&i.naturalHeight===96,top:i.style.top,left:i.style.left}));
   },pose);
   if(rows.length!==6||rows.some(r=>!r.loaded||r.top!=='-38px'||r.left!=='-15px'))throw new Error(`${width} ${pose}: wrong state selection or contact`);
   results.push({width,pose,rows});await page.screenshot({path:path.join(out,`${width}_${pose}.png`)});
  }
  for(const kind of ['tokens','guns']){
   const paths=await page.evaluate(async kind=>{
    const world=document.querySelector('#world');world.innerHTML='';
    const items=kind==='tokens'?['RECRUIT','STORY','DISTRICT'].map(id=>[id,__PDArt.loot(id)]):['mac_and_cheese','tommy_tony','jollof_burner','blueberry_blaster','legendary_draco','golden_draco','auntie_slipper','triple_k_kratos'].map(id=>[id,'../../build4/p_d/E-gun-'+id+'-held.png']);
    for(const [i,[id,src]] of items.entries()){const img=document.createElement('img');img.src=src;img.style.cssText=`position:absolute;left:100px;top:${45+i*50}px;image-rendering:pixelated`;world.append(img);const l=document.createElement('div');l.textContent=id;l.style.cssText=`position:absolute;left:10px;top:${76+i*50}px;font:8px monospace;color:white`;world.append(l);}
    await Promise.all([...world.querySelectorAll('img')].map(i=>i.decode()));return [...world.querySelectorAll('img')].map(i=>({src:i.getAttribute('src'),width:i.naturalWidth,height:i.naturalHeight}));
   },kind);
   if(paths.some(p=>p.width!==(kind==='tokens'?48:64)||p.height!==(kind==='tokens'?48:32)))throw new Error(`bad ${kind}`);
   results.push({width,kind,paths,reviewFixture:true});await page.screenshot({path:path.join(out,`${width}_${kind}.png`)});
  }
  if(errors.length)throw new Error(errors.join('\n'));await context.close();console.log(`PASS P-D THE PLAY ${width}: all 30 named states, three token selections, eight held sprites`);
 }
}catch(e){console.error('FAIL',e.message);process.exitCode=1;results.push({failure:e.message});}
finally{await browser.close();await server.close();await writeFile(path.join(out,'results.json'),JSON.stringify(results,null,2)+'\n');}
