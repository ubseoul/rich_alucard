import fs from 'node:fs';
import {serve,loadPlaywright} from '../tests/f05/_browser-lib.mjs';
const phase=process.argv.includes('--before')?'before':'after';
const out=process.argv.includes('--out')?process.argv[process.argv.indexOf('--out')+1]:'docs/evidence/build2',server=await serve(),{chromium}=loadPlaywright();fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.RA_CHROMIUM_PATH});
const page=await browser.newPage({viewport:{width:1040,height:1000}}),errors=[],rows=[];
page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto(`http://127.0.0.1:${server.address().port}/tools/build2/review.html`);
 await page.click('#seed');await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('Review save prepared'));
 await page.click('#armory');const f=page.frames().find(f=>f!==page.mainFrame());await f.waitForSelector('.ia-gun');
 await f.click('[data-phone-action="do:armory:buy:mac_and_cheese"]');await f.click('[data-phone-action="do:armory:equip:mac_and_cheese"]');
 await page.click('#fight');await f.waitForSelector('.c2-scene');
 const exactPath=await f.evaluate(()=>({equipped:RAIronAndGrace.loadout(),menu:[...document.querySelectorAll('[data-c2]')].map(b=>b.dataset.c2),moves:RACombat2.active().state.moves}));
 await f.click('[data-c2="weapon:iron_and_grace_gun"]');await page.waitForTimeout(120);
 exactPath.fired=await f.evaluate(()=>RACombat2.active().state.__iagAmmo?.mac_and_cheese===1);
 if(phase==='after')await f.waitForFunction(()=>!RACombat2.active()?.busy());else await page.waitForTimeout(6500);
 await f.evaluate(()=>RACombat2.debugResolve('win'));await f.click('[data-c2="done"]');
 const defs=await f.evaluate(()=>({moves:Object.values(RACombatData.MOVES),guns:RAIronCatalog.list(),mods:RAIronCatalog.mods(),registry:RAArtRegistry.items.guns}));
 const phoneMoves={},playCensus={};
 if(phase==='after'){
  await f.evaluate(()=>{RAIronMoves.unlock();RAPhone.openApp('moves');});
  await f.click('[data-phone-action="app:moves:0"]');await f.click('[data-phone-action="do:moves:equip:0|ringer"]');
  phoneMoves.swapped=await f.evaluate(()=>RAState.get().life.combat.equippedMoves[0]==='ringer'&&RAState.get().life.combat.equippedMoves.length===4);
  await f.evaluate(()=>RAPhone.close());
  // Real THE PLAY loadout controls: every owned gun is cycled onto a crew member, including dev-gated Kratos.
  await f.evaluate(()=>{RALife.setFlag('devKratos',true);for(const g of RAIronCatalog.list())RAIronAndGrace.grant(g.id,{free:true});RAFrag.patch('F04','active',true);RAFrag.patch('F04','offer.status','accepted');window.__censusPlay=RAWarRoomPlay.launch(RAWarRoomJobs.buildJobCard({type:'TAKE_THE_BLOCK',district:'arts_district'}));});
  console.log('PLAY launch');await f.waitForSelector('#f01-play-frame');const pf=f.childFrames().find(x=>x.url().includes('f01/play'));
  const ready=Date.now()+30000;while(Date.now()<ready){if(await pf.locator('.b-ans').count())break;if(await pf.locator('[data-done]').count())await pf.click('[data-done]');await page.waitForTimeout(100);}
  await pf.waitForSelector('.b-ans');await pf.click('.b-ans');await pf.waitForSelector('.card .wslot');
  for(let slot=0;slot<await pf.locator('.card .wslot').count();slot++){for(let i=0;i<16;i++){const w=pf.locator('.card .wslot').nth(slot);if(/BARE HANDS/.test(await w.innerText()))break;await w.click();}}
  const seen=[];for(let i=0;i<30;i++){seen.push(await pf.locator('.card .wslot').first().innerText());await pf.locator('.card .wslot').first().click();}
  playCensus.labels=[...new Set(seen)];playCensus.guns=defs.guns.map(g=>({id:g.id,offered:seen.some(t=>t.toLowerCase().includes(g.label.toLowerCase().replace(/^the /,'')))}));console.log('PLAY cycle',JSON.stringify(playCensus));
  if(await pf.locator('.send.hold').count()){const box=await pf.locator('.send').boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.waitForTimeout(1900);await page.mouse.up();}else await pf.click('.send');
  const deadline=Date.now()+120000;while(Date.now()<deadline){if(await pf.locator('.again').count())break;const choice=pf.locator('.decide button').first();if(await choice.count())await choice.click();await page.waitForTimeout(100);}
  await pf.click('.again');await f.waitForSelector('#f01-play-frame',{state:'detached'});
 }
 // Each isolated fight has the required authored unlock and at most four equipped moves. No production save is modified.
 const cases=[...defs.moves.map(d=>({kind:'move',id:d.id,label:d.label,unlock:d.canon?'Canon':d.id==='petty'?'Bruce Loose A19':'Nightshade A25 + gift_flowers'})),...defs.guns.map(d=>({kind:'gun',id:d.id,label:d.label,unlock:d.acquisition.note})),...defs.mods.map(d=>({kind:'mod',id:d.id,label:d.label,unlock:`Owned, attached to LIL OGA; ${d.effect}`}))];
 for(const spec of cases){
  await f.evaluate(s=>{
   RAState.patch('life.combat.equippedMoves',s.kind==='move'?[s.id,'blood','bite','revenge'].filter((v,i,a)=>a.indexOf(v)===i).slice(0,4):['blood','octopus','bite','revenge']);
   RAState.patch('life.combat.learnedMoves',Object.keys(RACombatData.MOVES));
   RAState.patch('life.combat.magic',['hex','veil','seance','ringer']);RALife.setFlag('devKratos',true);RALife.setFlag('mazdaMajestic',true);
   const gun=s.kind==='gun'?s.id:'lil_oga';if(!RAIronAndGrace.owns(gun))RAIronAndGrace.grant(gun,{free:true});
   RAFrag.patch('F02','mods',{});RAIronAndGrace.equip(gun);
   if(s.kind==='mod'){RAFrag.patch('F02',`modsOwned.${s.id}`,true);RAIronAndGrace.attachMod(gun,s.id);if(s.id==='custom_engraving')RAIronAndGrace.engrave(gun,'CENSUS');}
   window.__moveAssets=[];const scan=n=>{for(const el of [n,...n.querySelectorAll?.('*')||[]]){if(el.src&&el.tagName==='IMG')__moveAssets.push(el.getAttribute('src'));const m=[...String(el.style?.backgroundImage||'').matchAll(/url\(["']?([^"')]+)/g)].map(x=>x[1]);__moveAssets.push(...m);}};
   new MutationObserver(ms=>ms.forEach(m=>{if(m.type==='attributes')scan(m.target);else m.addedNodes.forEach(n=>{if(n.nodeType===1)scan(n);});})).observe(document.querySelector('#screen'),{subtree:true,childList:true,attributes:true,attributeFilter:['src','style']});
   window.__censusFight=RACombat2.run('bonesworth',{noPenalty:true});
  },spec);
  await f.waitForSelector('.c2-scene');
  let selector;
  if(spec.kind==='move'){await f.click('[data-c2="fight"]');selector=`[data-c2="move:${spec.id}"]`;}
  else{selector=await f.locator('[data-c2="weapon:iron_and_grace_gun"]').count()?'[data-c2="weapon:iron_and_grace_gun"]':null;
   if(!selector){await f.click('[data-c2="fight"]');selector=`[data-c2="gun:${spec.kind==='gun'?spec.id:'lil_oga'}"]`;}}
  const offered=await f.locator(selector).count()>0;
  if(offered){
   if(spec.id==='revenge')await f.evaluate(()=>{RACombat2.active().state.rich.revenge=21;}); // actual prior hit amount, isolated presentation fixture
   await f.click(selector);await page.waitForTimeout(spec.id==='blood'?330:spec.id==='bite'?200:100);
   if(phase==='after'&&spec.id==='octopus'){await f.waitForSelector('.c2-octo:not([hidden]) .c2-tentacles');await page.waitForTimeout(350);}
   if(phase==='after')await f.locator('#screen').screenshot({path:`${out}/move-390-${spec.kind}-${spec.id}.png`});
   await page.waitForTimeout(1500);
   if(phase==='after')await f.waitForFunction(()=>!RACombat2.active()?.busy());
  }
  const result=await f.evaluate(()=>({assets:[...new Set(__moveAssets)],logs:RACombat2.active()?.state.log||[],ammo:RACombat2.active()?.state.__iagAmmo||{},presentation:document.querySelector('.c2-scene')?.dataset.lastPresentation||null}));
  rows.push({...spec,offered,...result,latest:spec.kind==='gun'?defs.registry[spec.id]?.held?.asset||null:spec.kind==='mod'?defs.registry.lil_oga.held.asset:null});
  fs.writeFileSync(`${out}/move-census-${phase}.json`,JSON.stringify({phase,viewport:390,exactPath,rows,errors},null,2)+'\n');
  console.log('CASE',phase,spec.id,offered);
  if(await f.locator('.c2-octo:not([hidden]) [data-octo="roast"]').count()){await f.click('.c2-octo:not([hidden]) [data-octo="roast"]');await page.waitForTimeout(1800);}
  await f.evaluate(()=>RACombat2.debugResolve('win'));await f.click('[data-c2="done"]');
 }
 fs.writeFileSync(`${out}/move-census-${phase}.json`,JSON.stringify({phase,viewport:390,exactPath,phoneMoves,playCensus,rows,errors},null,2)+'\n');
 console.log('MOVE CENSUS',phase,JSON.stringify({rows:rows.length,exactPath,errors}));const failed=rows.some(r=>!r.offered)||!exactPath.fired||(phase==='after'&&(!phoneMoves.swapped||playCensus.guns.some(g=>g.id!=='triple_k_kratos'&&!g.offered)));process.exitCode=errors.length||failed?1:0;
}finally{await browser.close();server.close();}
