import path from 'node:path';
export async function run({open,install,report,evidence,assert}){
 const fixture=async(page,state='none',node='plan',lanes=['ogas'])=>{
  await page.evaluate(async({state,node,lanes})=>{
   RACombat2.active()?.abort();RAAdventures.abandon();await RAScenes.go('bedroom');
   RAState.patch('life.ownership.dragon',null);RALife.setFlag('mazdaHuman',false);
   RARelations.meet('mazda_human');RARelations.add('mazda_human',140);
   if(state!=='none')RADragon.adoptEgg();
   if(['hatch','human'].includes(state))RALife.patchDragon({stage:'hatchling',hatched:true,form:'dragon'});
   if(state==='human'){RALife.patchDragon({form:'both'});RALife.setFlag('mazdaHuman',true);}
   RANewOga.patch({finaleBegun:true,finaleDone:false});RAState.transaction(s=>{const p=s.life.world.flags.legendaryPass;delete p.receipts.finale;delete p.milestones.finale;});
   RAState.patch('life.adventures.active',{id:'NEW_OGA_FINALE',node,applied:[],titles:Object.keys(RAAdventures.get('NEW_OGA_FINALE').nodes),vars:{lanes},startedDay:RALife.today().day,from:'qa',env:null,actors:{}});
   await RAScenes.go('adventure');
  },{state,node,lanes});
 };
 const advance=async(page,predicate,limit=20)=>{
  for(let i=0;i<limit;i++){
   if(await predicate())return;
   await page.keyboard.press('Enter');await page.waitForTimeout(100);
  }
  throw Error('native dialogue did not reach expected control: '+await page.locator('body').innerText());
 };
 const choose=async(page,label,touch)=>{const b=page.locator('.adv-choice').filter({has:page.locator('span',{hasText:new RegExp('^'+label+'$')})});if(touch)await b.tap();else{await b.focus();await page.keyboard.press('Enter');}};
 const capture=async(page,name)=>page.screenshot({path:path.join(evidence,name+'.png')});
 if(!['combat','jdm'].includes(process.env.RA_QA_ONLY))for(const width of [360,390,430,1280]){
  const touch=width<1000,{context,page}=await open({width,hasTouch:touch});
  for(const state of ['none','egg','hatch','human']){
   await fixture(page,state);
   await advance(page,()=>page.locator('.adv-choice:visible').count());
   const labels=await page.locator('.adv-choice:visible span').allTextContents(),subtitle=await page.locator('.adv-choice:visible small').allTextContents();
   assert.equal(labels.includes('MAZDA'),state==='human',`${width} ${state} actual private menu`);
   if(state!=='human')assert.ok(!subtitle.join(' ').includes('Mazda'));
   for(const name of ['SHANNON','PINKY','TRISTAN'])assert.ok(labels.includes(name));
   await capture(page,`finale-${state}-${width}`);
   if(state==='human'){
    await choose(page,'MAZDA',touch);await advance(page,()=>page.locator('.adv-choice:visible').count());
    await choose(page,'PINKY',touch);
    assert.deepEqual(await page.evaluate(()=>RAAdventures.active().vars.lanes),['ogas','mazda','pinky']);
    // Repeat eligibility after save/reload in the same isolated browser profile.
    await page.evaluate(()=>RAState.save());await page.reload();await install(page);await page.click('#startButton');
    assert.equal(await page.evaluate(()=>RADragon.hasHumanForm()),true);
    report.checks.push({test:'private native earned pick + reload',width,input:touch?'touch':'keyboard'});
   }
  }
  await fixture(page,'none','huddle',['ogas','mazda','pinky']);
  const huddle=await page.evaluate(()=>({actors:RAAdventures.active().actors,lines:RAAdventures.linesFor('huddle')}));
  assert.ok(!Object.values(huddle.actors).some(p=>(typeof p==='string'?p:p?.id)==='mazda_human'));
  assert.ok(!huddle.lines.some(r=>r[0]==='mazda_human'));
  await capture(page,`huddle-ineligible-${width}`);
  report.checks.push({test:'private huddle omits unearned actor and local exchange',width});
  // Stale phase-one node reaches the bridge via the actual adventure scene; no iframe launches.
  await fixture(page,'none','party_play',['ogas','mazda','pinky']);
  await page.waitForTimeout(250);if(await page.locator('.ra-minigame-start').count()){if(touch)await page.locator('.ra-minigame-start').tap();else{await page.locator('.ra-minigame-start').focus();await page.keyboard.press('Enter');}}
  await page.waitForFunction(()=>RAAdventures.active()?.node==='plan',null,{timeout:5000});
  assert.equal(await page.locator('iframe').count(),0);
  assert.equal(await page.evaluate(()=>RAAdventures.active().node),'plan');
  await page.waitForFunction(()=>RAScenes.current()==='bedroom');await page.locator('.mail-card').filter({hasText:'RESUME NEW OGA'}).click();
  await advance(page,()=>page.locator('.adv-choice:visible').count());
  await choose(page,'SHANNON',touch);await advance(page,()=>page.locator('.adv-choice:visible').count());await choose(page,'PINKY',touch);
  assert.deepEqual(await page.evaluate(()=>RAAdventures.active().vars.lanes),['ogas','shannon','pinky']);
  report.checks.push({test:'stale live private PLAY refuses before transport; alternatives selected',width});
  // Same gate on pending/reloaded and direct execution, plus actual recorded adapters.
  const gates=await page.evaluate(async()=>{
   const built=RAF07Play.buildRequest('finale_p1',{lanes:['ogas','shannon','pinky']});
   RAFrag.patch('F07','play.pending',{...built,kind:'finale_p1',lanes:['ogas','mazda','pinky']});
   const a=await RAF07Play.run('finale_p1',{lanes:['ogas','mazda','pinky']});
   const b=await RAF07Play.run('finale_p1');
   RAFrag.patch('F07','play.pending',null);
   const direct=RAF07Play.buildRequest('finale_p1',{lanes:['ogas','mazda','pinky']});
   const before=RALife.money();RAF07.completeFinale('takeover',{lanes:['ogas','mazda','pinky']});
   return {a:a.code,b:b.code,direct:direct.code,crew:RANewOga.current().finaleCrew,moneyDelta:RALife.money()-before};
  });
  assert.equal(gates.a,'INELIGIBLE_LANES');assert.equal(gates.b,'INELIGIBLE_LANES');assert.equal(gates.direct,'INELIGIBLE_LANES');assert.deepEqual(gates.crew,['ogas','pinky']);
  report.checks.push({test:'private new, pending and recorded completion gates',width,...gates});
  await context.close();console.log('PASS private DOM gates '+width);
 }
 // One real finale PLAY iframe: earned lane travels through the canonical request/transport.
 if(!['combat','jdm'].includes(process.env.RA_QA_ONLY)){
  const {context,page}=await open({width:390,hasTouch:true});await fixture(page,'human','party_play',['ogas','mazda','pinky']);if(await page.locator('.ra-minigame-start').count())await page.locator('.ra-minigame-start').tap();
  await page.waitForSelector('iframe',{timeout:15000});
  const frame=page.frames().find(f=>f.url().includes('/assets/f07/play/'));
  if(await frame.locator('[data-done]').count())await frame.locator('[data-done]').click();await frame.waitForSelector('.b-dec',{timeout:15000});
  console.log('TRANSPORT',await frame.locator('body').innerText());
  await capture(page,'earned-finale-transport-390');
  const pending=await page.evaluate(()=>RAF07Play.pending()?.lanes);await frame.locator('.b-dec').tap();await page.waitForFunction(()=>!document.querySelector('iframe'));report.checks.push({test:'earned Mazda actual private finale request/transport/native decline',pending,status:await page.evaluate(()=>Object.values(RAFrag.read('F07','play.consumed',{})).at(-1)?.code)});
  await context.close();
 }
 // Combat tests use real native controls; only loadout/HP/RNG are deliberate disposable fixtures.
 if(process.env.RA_QA_ONLY!=='gates'&&process.env.RA_QA_ONLY!=='jdm')for(const reduced of [false,true]){
  const {context,page}=await open({width:reduced?1280:390,hasTouch:!reduced,reduced});
  await page.evaluate(async()=>{
   RAAdventures.abandon();await RAScenes.go('bedroom');
   RAState.patch('life.combat.equippedMoves',['blood','bite','octopus','revenge']);
   RAState.patch('life.ownership.castleRooms',[]);RAState.patch('life.ownership.fits',{owned:[],equipped:{}});
   window.__qa={bubbles:[],routes:[],fx:[],results:[],maxBubbles:0};
   const trigger=RABarks.trigger;RABarks.trigger=s=>{__qa.routes.push({kind:s.kind,enemy:s.enemyId,attacker:s.attacker,target:s.target,speaker:s.speaker||'enemy',outcome:s.outcome});return trigger(s);};
   const added=new Map();new MutationObserver(rs=>{for(const r of rs){for(const n of r.addedNodes){if(n.nodeType===1&&n.matches('.rc2-bark')){const item={text:n.textContent,speaker:n.className,at:performance.now(),root:n.parentElement?.className};__qa.bubbles.push(item);added.set(n,item);}}for(const n of r.removedNodes){if(added.has(n)){added.get(n).elapsed=performance.now()-added.get(n).at;}}}__qa.maxBubbles=Math.max(__qa.maxBubbles,document.querySelectorAll('.rc2-bark').length);}).observe(document.querySelector('#screen'),{subtree:true,childList:true});
   const attack=RAEnemyFX.attack;RAEnemyFX.attack=async o=>{const row={enemy:o.enemyId,move:o.moveId,contacts:0,started:performance.now()};__qa.fx.push(row);const contact=o.onContact;const r=await attack({...o,onContact:()=>{row.contacts++;row.frame=document.querySelector('.rc2-enemy-fx')?.dataset.frame;row.hpAtContact=document.querySelector('.c2-hp-rich strong')?.textContent;contact?.();}});row.animationElapsed=r;row.wall=performance.now()-row.started;return r;};
  });
  const start=async(enemy='gbenga',params={})=>page.evaluate(async({enemy,params})=>{if(RAPhone.isOpen())await RAPhone.close();window.__qaPromise=RACombat2.run(enemy,{env:'gbenga_rentals',noPenalty:true,...params}).then(r=>{__qa.results.push(r);return r;});RACombat2.active().state.rng=()=>.5;},{enemy,params});
  const move=async id=>{if(await page.locator('[data-c2="fight"]').count())await page.locator('[data-c2="fight"]').click();await page.locator(`[data-c2="move:${id}"]`).click();};
  await page.evaluate(()=>RAState.patch('life.ownership.dragon',null));await start();await page.locator('[data-c2="hoes"]').click();assert.equal(await page.locator('[data-c2^="hoe:mazda"]').count(),0);await capture(page,`hoes-unearned-${reduced?'1280':'390'}`);await page.evaluate(()=>RACombat2.active().abort());
  await page.evaluate(()=>{RADragon.adoptEgg();RALife.patchDragon({stage:'majestic',hatched:true,form:'both'});RALife.setFlag('mazdaHuman',true);RARelations.meet('mazda_human');RARelations.add('mazda_human',140);RALife.addRoom({id:'dragon_roost'});});
  await start();await page.locator('[data-c2="hoes"]').click();const stale=page.locator('[data-c2^="hoe:mazda_dragon:"]').first();assert.equal(await stale.count(),1);await page.evaluate(()=>RAState.patch('life.ownership.dragon',null));await stale.click();await page.waitForFunction(()=>RACombat2.active()?.busy()===false);
  const staleResult=await page.evaluate(()=>({hp:RACombat2.active().state.enemy.hp,turn:RACombat2.active().state.turn,used:RACombat2.active().state.hoesUsed}));assert.equal(staleResult.hp,260);assert.equal(staleResult.turn,1);assert.deepEqual(staleResult.used,{});report.checks.push({test:'loaded private HOES UI excludes unearned and rejects a real stale dragon click',reduced,staleResult});await page.evaluate(()=>RACombat2.active().abort());
  await start();await move('blood');
  await page.waitForFunction(()=>document.querySelector('.rc2-bark')?.textContent==='Ah. You want the full conversation.',null,{timeout:15000});await page.waitForFunction(()=>getComputedStyle(document.querySelector('.rc2-bark')).opacity==='1');await capture(page,`gbenga-first-hit-${reduced?'reduced-1280':'390'}`);
  await page.waitForFunction(()=>document.querySelector('.rc2-bark')?.textContent===RAAstraEditorial.moveText('gbenga.phone'),null,{timeout:15000});await page.waitForFunction(()=>Number(document.querySelector('.rc2-enemy-fx')?.dataset.frame)>=5&&getComputedStyle(document.querySelector('.rc2-bark')).opacity==='1');await capture(page,`gbenga-phone-${reduced?'reduced-1280':'390'}`);
  await page.waitForFunction(()=>RACombat2.active()?.busy()===false,null,{timeout:20000});
  const one=await page.evaluate(()=>({hp:RACombat2.active().state.rich.hp,enemyHp:RACombat2.active().state.enemy.hp,pp:RACombat2.active().state.rich.pp.blood,log:RACombat2.active().state.log}));
  console.log('ONE',JSON.stringify(one));assert.equal(one.hp,76);assert.equal(one.enemyHp,208);assert.equal(one.log.filter(e=>e.kind==='hit').length,2,'inherited earned G1 Royal Glitch doubles first Blood Bath');assert.equal(one.pp,7);assert.equal(one.log.filter(e=>e.kind==='combat_beat').length,1);
  await move('bite');await page.waitForFunction(()=>document.querySelector('.rc2-bark')?.textContent==='scatta dem',null,{timeout:15000});await page.waitForFunction(()=>Number(document.querySelector('.rc2-enemy-fx')?.dataset.frame)>=5&&getComputedStyle(document.querySelector('.rc2-bark')).opacity==='1');await capture(page,`gbenga-drako-${reduced?'reduced-1280':'390'}`);
  await page.waitForFunction(()=>RACombat2.active()?.busy()===false,null,{timeout:20000});
  const two=await page.evaluate(()=>({hp:RACombat2.active().state.rich.hp,hurts:RACombat2.active().state.log.filter(e=>e.kind==='hurt').map(e=>e.amount),draws:RACombat2.active().state.log.filter(e=>e.kind==='combat_beat').length,...__qa}));
  assert.equal(two.hp,54);assert.deepEqual(two.hurts,[20,20]);assert.equal(two.draws,0);assert.equal(two.maxBubbles,1);
  for(const row of two.fx){assert.equal(row.contacts,1);assert.equal(row.frame,reduced?(row.move==='phone'?'6':'5'):(row.move==='phone'?'6':'5'));assert.ok(row.wall>=1390);assert.equal(row.animationElapsed,reduced?220:row.move==='phone'?960:1088);}
  for(const text of ['Ah. You want the full conversation.','HELLO HELLO RICH CAN YOU HEAR ME','scatta dem'])assert.ok(two.bubbles.some(b=>b.text===text&&b.elapsed>=1390));
  report.checks.push({test:'native Gbenga first-hit/phone/Drako once contact and readable quote',reduced,one,two});
  await page.evaluate(()=>RACombat2.active().abort());
  // Real native win and loss, then once-only CONTINUE result and reward settlement.
  await start('gbenga',{hp:20});const cash=await page.evaluate(()=>RALife.money());await move('blood');await page.waitForSelector('[data-c2="done"]',{timeout:20000});await page.locator('[data-c2="done"]').dblclick();
  const won=await page.evaluate(()=>({result:__qa.results.at(-1),money:RALife.money()}));assert.equal(won.result.outcome,'win');assert.equal(won.money-cash,await page.evaluate(()=>RACombatData.ENEMIES.gbenga.drop?.money||0),'baseline Gbenga drop contract, no duplicate reward');
  await start();await page.evaluate(()=>RACombat2.active().state.rich.hp=10);await move('blood');await page.waitForSelector('[data-c2="done"]',{timeout:20000});await page.locator('[data-c2="done"]').click();assert.equal(await page.evaluate(()=>__qa.results.at(-1).outcome),'lose');
  await start('f15_roxy_spar',{spar:true});await page.locator('[data-c2="run"]').click();await page.waitForFunction(()=>!RACombat2.active());assert.deepEqual(await page.evaluate(()=>__qa.results.at(-1)),{quit:true,outcome:'quit'});
  const terminal=await page.evaluate(()=>__qa.routes.filter(x=>x.kind==='win'||x.kind==='lose'));assert.ok(terminal.some(x=>x.kind==='lose'&&x.outcome==='win'));assert.ok(terminal.some(x=>x.kind==='win'&&x.outcome==='lose'));
  report.checks.push({test:'native battle win/loss/quit and terminal attribution',reduced,won,terminal});
  // Interrupt the held draw beat, replace the stage, then reload midfight.
  await start();await move('blood');await page.waitForFunction(()=>document.querySelector('.rc2-bark')?.textContent==='Ah. You want the full conversation.');await page.evaluate(()=>RACombat2.active().abort());await start('training');await page.waitForTimeout(1700);
  assert.equal(await page.locator('.rc2-bark-enemy').count(),0);assert.equal(await page.locator('.rc2-enemy-fx').count(),0);assert.equal(await page.evaluate(()=>RACombat2.active().state.enemyId),'training');
  await page.reload();await install(page);assert.equal(await page.locator('.rc2-bark').count(),0);assert.equal(await page.locator('.rc2-enemy-fx').count(),0);
  report.checks.push({test:'held quote quit/replacement and reload cleanup',reduced});
  await context.close();console.log('PASS native combat '+(reduced?'reduced':'normal'));
 }
 if(process.env.RA_QA_ONLY!=='gates'&&process.env.RA_QA_ONLY!=='combat')for(const width of [390,1280]){
  const {context,page}=await open({width,hasTouch:width===390});
  await page.evaluate(async()=>{
   RAAdventures.abandon();if(RAPhone.isOpen())await RAPhone.close();
   window.__qaJdm={fx:[],routes:[]};
   const trigger=RABarks.trigger;RABarks.trigger=s=>{__qaJdm.routes.push({enemy:s.enemyId,kind:s.kind,attacker:s.attacker,target:s.target,outcome:s.outcome});return trigger(s);};
   const attack=RAEnemyFX.feedbackAttack;RAEnemyFX.feedbackAttack=async o=>{const row={enemy:o.enemyId,move:o.moveId,contacts:0};__qaJdm.fx.push(row);const before=performance.now(),contact=o.onContact;const result=await attack({...o,onContact:()=>{row.contacts++;row.frame=document.querySelector('.rc2-enemy-fx')?.dataset.frame;row.hpBefore=document.querySelector('#richHPText').textContent;contact?.();row.hpAfter=document.querySelector('#richHPText').textContent;}});row.animationElapsed=result;row.wall=performance.now()-before;return result;};
   RACombatFoundation.selectEnemyMove=()=>RACombatDefinitions.moves[window.__qaMove];
  });
  for(const [id,key]of [['importer_shove','jdm.wheel'],['importer_parts','jdm.part']]){
   await page.evaluate(async id=>{window.__qaMove=id;await RAScenes.go('jdmCombat');},id);
   const identity=await page.evaluate(()=>({combatant:RACombatFoundation.encounter('jdm').enemy,stage:RAPresentationDirector.current().stage,scene:RAScenes.current(),src:document.querySelector('#productionCEO').getAttribute('src')}));
   assert.equal(identity.combatant,'jdm_importer');assert.equal(identity.stage,'jdm-imports-docks');assert.equal(identity.scene,'jdmCombat');
   if(width===390){await page.locator('[data-main="fight"]').tap();await page.locator('[data-move="blood"]').tap();}else{await page.locator('[data-main="fight"]').click();await page.locator('[data-move="blood"]').click();}
   await page.waitForFunction(key=>document.querySelector('.rc2-bark')?.textContent===RAAstraEditorial.moveText(key),key,{timeout:15000});
   await page.waitForFunction(()=>Number(document.querySelector('.rc2-enemy-fx')?.dataset.frame)>=5);
   await capture(page,`${id}-${width}`);
   await page.waitForFunction(()=>!document.querySelector('.rc2-enemy-fx'),null,{timeout:10000});
   assert.equal(await page.locator('#richHPText').textContent(),'84/100');
   const row=await page.evaluate(()=>__qaJdm.fx.at(-1));assert.equal(row.enemy,'legacy_importer');assert.equal(row.move,id);assert.equal(row.contacts,1);assert.equal(row.frame,'6');assert.equal(row.hpBefore,'100/100');assert.equal(row.hpAfter,'84/100');assert.equal(row.animationElapsed,936);assert.ok(row.wall>=1390);
   const quote=await page.evaluate(key=>RAAstraEditorial.moveText(key),key);report.checks.push({test:'native JDM prop, accepted move quote, correct identity/contact/damage',width,id,quote,identity,row});
  }
  const routes=await page.evaluate(()=>__qaJdm.routes);assert.ok(routes.every(r=>r.enemy==='jdm_importer'));assert.ok(routes.some(r=>r.kind==='attack'&&r.attacker==='enemy'&&r.target==='rich'));assert.ok(routes.some(r=>r.kind==='hurt'&&r.attacker==='rich'&&r.target==='enemy'));
  await context.close();console.log('PASS native JDM '+width);
 }

}
