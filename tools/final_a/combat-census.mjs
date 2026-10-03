import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {loadPlaywright,root} from '../tests/f05/_browser-lib.mjs';
const arg=n=>process.argv.includes(n)?process.argv[process.argv.indexOf(n)+1]:null;
const phase=arg('--phase')||'after',base=arg('--base'),out=path.join(root,'docs/evidence/final_a/stage3',phase);
fs.mkdirSync(out,{recursive:true});
const cache=new Map(),mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.mp3':'audio/mpeg','.svg':'image/svg+xml','.webp':'image/webp'};
if(base){
 const files=execFileSync('git',['-c','gc.auto=0','ls-tree','-r','--name-only',base],{cwd:root,encoding:'utf8'}).trim().split('\n').filter(p=>['index.html','style.css','game.js'].includes(p)||p.startsWith('js/'));
 const raw=execFileSync('git',['-c','gc.auto=0','cat-file','--batch'],{cwd:root,input:files.map(p=>`${base}:${p}\n`).join(''),maxBuffer:40*1024*1024});let offset=0;
 for(const p of files){const end=raw.indexOf(10,offset),size=Number(raw.subarray(offset,end).toString().split(' ').at(-1));cache.set(p,raw.subarray(end+1,end+1+size));offset=end+size+2;}
}
const server=http.createServer((req,res)=>{try{let rel=decodeURIComponent(new URL(req.url,'http://x').pathname).replace(/^\//,'')||'index.html';if(rel.includes('..'))throw Error('path');let bytes;if(base&&!rel.startsWith('assets/')){if(!cache.has(rel))cache.set(rel,execFileSync('git',['-c','gc.auto=0','show',`${base}:${rel}`],{cwd:root,maxBuffer:20*1024*1024,stdio:['ignore','pipe','ignore']}));bytes=cache.get(rel);}else bytes=fs.readFileSync(path.join(root,rel));res.writeHead(200,{'content-type':mime[path.extname(rel)]||'application/octet-stream','cache-control':'no-store'});res.end(bytes);}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const widths=(arg('--widths')||'360,390,430').split(',').map(Number),kinds=arg('--kinds')?.split(','),existing=kinds&&fs.existsSync(path.join(out,'census.json'))?JSON.parse(fs.readFileSync(path.join(out,'census.json'))):null;
const {chromium}=loadPlaywright(),browser=await chromium.launch({headless:true,executablePath:process.env.RA_CHROMIUM_PATH}),errors=existing?.errors||[],rows=existing?.rows.filter(r=>!widths.includes(r.width)||!kinds.includes(r.kind))||[];
try{
 for(const width of widths){
  const page=await browser.newPage({viewport:{width,height:844}}),cdp=await page.context().newCDPSession(page);page.on('pageerror',e=>errors.push(`${width}: ${e.message}`));
  await page.goto(`http://127.0.0.1:${server.address().port}/?dev=1&ff=F02.iron_and_grace,F02.armory`,{timeout:120000});
  await page.waitForFunction(()=>!!window.RAIronAndGrace);
  await page.evaluate(()=>{const s=RAState.migrateRecord(RASaveFixtures.fixtures.supraOwned);s.life.clock.started=true;for(const k of ['prologueDone','throneDone','firstWakeDone','armoryKnown'])s.life.world.flags[k]=true;s.life.combat.learnedMoves=Object.keys(RACombatData.MOVES);s.life.combat.magic=['hex','veil','seance','ringer'];RAState.write(localStorage,s,false);});
  await page.reload();await page.waitForFunction(()=>!!window.RAIronAndGrace);await page.evaluate(()=>{RAClock.wake({first:true});document.querySelector('#startButton')?.click();});
  await page.waitForFunction(()=>document.body.classList.contains('bedroom-mode'));await page.evaluate(()=>{document.querySelector('.mail-done')?.click();document.querySelector('#devPanel')?.remove();RAAudio.unlock();});
  const defs=await page.evaluate(()=>({moves:Object.values(RACombatData.MOVES),guns:RAIronCatalog.list(),mods:RAIronCatalog.mods()}));
  const cases=[...defs.moves.map(d=>({kind:'move',id:d.id,label:d.label})),...defs.guns.map(d=>({kind:'gun',id:d.id,label:d.label})),...defs.mods.map(d=>({kind:'mod',id:d.id,label:d.label}))].filter(s=>!kinds||kinds.includes(s.kind));
  for(const spec of cases){
   await page.evaluate(s=>{
    RAState.patch('life.combat.equippedMoves',s.kind==='move'?[s.id,'blood','bite','revenge'].filter((v,i,a)=>a.indexOf(v)===i).slice(0,4):['blood','octopus','bite','revenge']);RAState.patch('life.combat.learnedMoves',Object.keys(RACombatData.MOVES));RAState.patch('life.combat.magic',['hex','veil','seance','ringer']);RALife.setFlag('devKratos',true);RALife.setFlag('mazdaMajestic',true);
    const gun=s.kind==='gun'?s.id:'lil_oga';if(!RAIronAndGrace.owns(gun))RAIronAndGrace.grant(gun,{free:true});RAFrag.patch('F02','mods',{});RAIronAndGrace.equip(gun);
    if(s.kind==='mod'){RAFrag.patch('F02',`modsOwned.${s.id}`,true);RAIronAndGrace.attachMod(gun,s.id);if(s.id==='custom_engraving')RAIronAndGrace.engrave(gun,'CENSUS');}
    window.__fxTrace=[];window.__originalCensusSound=window.__originalCensusSound||RAAudio.oneShot;RAAudio.oneShot=(id,...a)=>{__fxTrace.push(id);return __originalCensusSound(id,...a);};window.__censusFight=RACombat2.run('bonesworth',{noPenalty:true});RACombat2.active().state.rng=()=>.4;
   },spec);
   await page.waitForSelector('.c2-scene');await page.waitForTimeout(160);
   if(spec.kind==='move')await page.click('[data-c2="fight"]');
   const selector=spec.kind==='move'?`[data-c2="move:${spec.id}"]`:'[data-c2="weapon:iron_and_grace_gun"]',offered=await page.locator(selector).count()>0;
   const before=await page.evaluate(()=>({rules:JSON.stringify(RACombat2.active().state),ammo:{...RACombat2.active().state.__iagAmmo},mods:RAIronAndGrace.modsFor(RAIronAndGrace.equipped()),seance:RAAudioManifest.get('MAGIC_SEANCE')}));
   if(spec.id==='revenge')await page.evaluate(()=>RACombat2.active().state.rich.revenge=21);
   const started=Date.now();if(offered)await page.click(selector);
   await page.waitForTimeout(spec.id==='blood'?420:spec.id==='bite'?330:spec.id==='revenge'?460:spec.id==='octopus'?350:240);
   const presentation=await page.evaluate(()=>{const scene=document.querySelector('.c2-scene'),canvas=scene.querySelector('.c2-pixel-fx'),ctx=canvas?.getContext('2d'),pixels=ctx?.getImageData(0,0,canvas.width,canvas.height)?.data||[];let opaque=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i])opaque++;const r=document.querySelector('#screen').getBoundingClientRect();return {clip:{x:r.left,y:r.top,width:r.width,height:r.height,scale:1},frameData:canvas?.toDataURL(),id:scene.dataset.lastPresentation,pixelId:canvas?.dataset.presentation||null,opaquePixels:opaque,mods:scene.querySelector('.c2-gun-mods')?.textContent||'',trace:window.__fxTrace,layer:canvas&&{width:canvas.width,height:canvas.height,smoothing:ctx.imageSmoothingEnabled},world:RAPresentationDirector.worldRect(),active:RACombat2.active().state,assets:[...scene.querySelectorAll('.c2-approved-fx img,.c2-tentacles')].map(i=>i.getAttribute('src'))};});
   const shot=await cdp.send('Page.captureScreenshot',{format:'png',clip:presentation.clip,captureBeyondViewport:false});fs.writeFileSync(path.join(out,`${width}-${spec.kind}-${spec.id}.png`),Buffer.from(shot.data,'base64'));
   if(presentation.frameData)fs.writeFileSync(path.join(out,`${width}-${spec.kind}-${spec.id}-fx.png`),Buffer.from(presentation.frameData.split(',')[1],'base64'));delete presentation.frameData;
   if(spec.id==='octopus'){await page.waitForSelector('.c2-octo [data-octo]');await page.click('.c2-octo [data-octo="roast"]');}
   await page.waitForFunction(()=>!RACombat2.active()?.busy(),{timeout:30000});const turnMs=Date.now()-started;
   const after=await page.evaluate(()=>({ammo:{...RACombat2.active().state.__iagAmmo},log:RACombat2.active().state.log,state:RACombat2.active().state}));
   rows.push({...spec,width,offered,before,presentation,after,turnMs});fs.writeFileSync(path.join(out,'census.json'),JSON.stringify({phase,base,widths:[360,390,430],rows,errors},null,2)+'\n');
   await page.evaluate(()=>RACombat2.debugResolve('win'));await page.click('[data-c2="done"]');console.log(`${phase} ${width} ${spec.kind}:${spec.id} ${turnMs}ms`);
  }
  await page.close();
 }
 const failed=rows.filter(r=>!r.offered||(phase==='after'&&!['blood','bite','revenge','octopus'].includes(r.id)&&!(r.presentation.opaquePixels>0)));
 fs.writeFileSync(path.join(out,'census.json'),JSON.stringify({phase,base,widths:[360,390,430],rows,errors,failed:failed.map(r=>`${r.width}:${r.id}`)},null,2)+'\n');
 console.log(JSON.stringify({phase,rows:rows.length,errors,failed:failed.map(r=>`${r.width}:${r.id}`)}));if(errors.length||failed.length)process.exitCode=1;
}finally{await browser.close();server.close();}
