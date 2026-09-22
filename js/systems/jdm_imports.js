(function(){
 const SUPRA_MK4_PRICE_FOR_TESTING=78000;
 const ACQUISITION_ID='supra_mk4_first_collection',CAR_ID='toyota_supra_mk4_001',DAUGHTER_ID='jdm_importer_daughter_001';
 const dock=document.querySelector('#jdmDockScene'),dockPanel=document.querySelector('#jdmDockPanel'),payoff=document.querySelector('#supraPayoffScene'),payoffPanel=document.querySelector('#supraPayoffPanel');
 const active=()=>RAState.get().life.acquisitions.active;
 const car=()=>RAState.get().life.ownership.cars.find(x=>x.id===CAR_ID)||null;
 const button=(label,action,extra='')=>`<button type="button" class="jdm-action" data-jdm-action="${action}" ${extra}>${label}</button>`;
 function panelButton(label,action){return `<button type="button" class="jdm-panel-action" data-jdm-action="${action}">${label}</button>`}
 function drawCar(ctx,x,y,scale){ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);const p=(a,b,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(a,b,w,h)};
  p(4,27,96,13,'#090a13');p(12,23,78,12,'#20111e');p(20,17,52,9,'#11131c');p(30,12,30,8,'#151722');p(38,8,16,6,'#151722');
  p(14,24,70,7,'#7d194b');p(5,28,17,8,'#9f244c');p(22,21,58,7,'#9f244c');p(33,15,38,5,'#9f244c');p(43,11,18,4,'#9f244c');
  p(35,16,16,5,'#91b1bf');p(54,16,12,5,'#91b1bf');p(70,22,11,4,'#b3c5c3');p(8,28,8,3,'#e9c979');p(89,28,7,3,'#df593d');
  p(20,32,11,8,'#0a0b12');p(72,32,11,8,'#0a0b12');p(21,33,8,6,'#92939a');p(73,33,8,6,'#92939a');p(23,34,4,4,'#252637');p(75,34,4,4,'#252637');
  p(81,14,4,5,'#151722');p(79,12,12,3,'#151722');p(7,36,20,2,'#10111a');p(68,36,26,2,'#10111a');ctx.restore();}
 function paint(canvas,mode='dock',large=false){if(!canvas)return;const ctx=canvas.getContext('2d');if(!ctx)return;const w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);
  ctx.fillStyle='#091427';ctx.fillRect(0,0,w,h);ctx.fillStyle='#101e35';ctx.fillRect(0,0,w,212);for(let i=0;i<13;i++){const x=(i*47+19)%w,y=24+(i*31)%154;ctx.fillStyle=i%3?'#91a3b5':'#d5bd7e';ctx.fillRect(x,y,1,1)}
  ctx.fillStyle='#111321';ctx.fillRect(0,180,270,150);ctx.fillStyle='#242837';ctx.fillRect(0,187,42,118);ctx.fillRect(210,196,60,112);
  // Container stacks and a spare, static crane silhouette establish the import dock.
  const containers=[[0,225,88,54,'#34212f'],[92,209,87,70,'#263c4b'],[182,229,88,49,'#472638'],[37,279,90,50,'#4b2835'],[132,278,100,51,'#263946']];
  for(const [x,y,cw,ch,color] of containers){ctx.fillStyle=color;ctx.fillRect(x,y,cw,ch);ctx.fillStyle='#111622';ctx.fillRect(x,y,cw,3);ctx.fillStyle='#c18b3c';ctx.fillRect(x+5,y+5,2,ch-10);ctx.fillRect(x+cw-7,y+5,2,ch-10);ctx.fillStyle='#68717b';ctx.fillRect(x+12,y+10,1,ch-20);ctx.fillRect(x+cw-15,y+10,1,ch-20)}
  ctx.fillStyle='#161925';ctx.fillRect(207,75,8,128);ctx.fillRect(185,71,58,7);ctx.fillRect(224,76,5,63);ctx.fillRect(203,83,3,6);ctx.fillStyle='#c18b3c';ctx.fillRect(224,136,6,3);
  ctx.fillStyle='#202330';ctx.fillRect(0,331,270,24);ctx.fillStyle='#65707a';ctx.fillRect(0,332,270,3);ctx.fillStyle='#202b39';ctx.fillRect(0,355,270,40);ctx.fillStyle='#09111f';ctx.fillRect(0,395,270,85);
  for(let i=0;i<7;i++){const x=i*43;ctx.fillStyle='#b7a678';ctx.fillRect(x,340,22,2);ctx.fillStyle='#141721';ctx.fillRect(x+23,345,2,2);ctx.fillStyle='#21334a';ctx.fillRect((i*61+13)%270,413+(i%3)*17,9,2)}
  ctx.fillStyle='#161925';ctx.fillRect(10,196,39,4);ctx.fillRect(12,200,3,25);ctx.fillRect(44,200,3,25);ctx.fillStyle='#c18b3c';ctx.fillRect(13,193,34,2);
  if(mode==='payoff'){ctx.fillStyle='rgba(5,7,14,.16)';ctx.fillRect(0,0,w,h);drawCar(ctx,34,318,2.1);}
  else if(large)drawCar(ctx,32,362,1.9);
 }
 function drawStoreProduct(){const c=document.querySelector('#supraProductCanvas');if(!c)return;const ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);ctx.fillStyle='#111b2d';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle='#c18b3c';ctx.fillRect(3,c.height-12,c.width-6,2);drawCar(ctx,43,6,1.06)}
 function storeMarkup(){const owned=car(),current=active(),access=RAOpportunities.get('jdm_home_delivery');let actionLabel,action,disabled='';
  if(owned){actionLabel='SPEND TIME WITH YOUR SUPRA';action='payoff'}
  else if(current&&current.status!=='completed'){actionLabel='RETURN TO COLLECTION';action='resume'}
  else if(RABudget.balance()<SUPRA_MK4_PRICE_FOR_TESTING){actionLabel='NOT ENOUGH CASH';action='cannotAfford';disabled='disabled'}
  else{actionLabel='TRY TO GET THE SUPRA';action='begin'}
  const note=owned?`<p>you got your keys. ${access?.available?'next time, we can send it to your place.':'the first one takes a personal pickup.'}</p>`:`<p>TOYOTA SUPRA MK4<br>FIRST COLLECTION · LOS ANGELES</p><p class="jdm-price">CURRENT ASK&nbsp; $${new Intl.NumberFormat('en-US').format(SUPRA_MK4_PRICE_FOR_TESTING)}</p>${current?.status==='paused'?'<p>you can pick up where you left off.</p>':''}`;
  return `<h1>JDMIMPORTS</h1><canvas id="supraProductCanvas" class="supra-product" width="190" height="68" aria-label="Pixel illustration of a Toyota Supra Mk4"></canvas>${note}<div class="jdm-store-actions">${button(actionLabel,action,disabled)}${button('HOME','home')}</div>`;
 }
 function patchActive(fields){const prior=active();if(!prior)return false;return RAState.patch('life.acquisitions.active',{...prior,...fields})}
 function renderDock(){if(!dockPanel)return;const a=active();if(!a)return;const stage=a.stage;
  if(stage==='arrival')dockPanel.innerHTML=`<p class="jdm-kicker">LOS ANGELES · IMPORT DOCK</p><p>The Supra is here. Pickup happens at the dock.</p><p class="jdm-small">Current ask: $${new Intl.NumberFormat('en-US').format(a.quotedPrice)}</p><div class="jdm-actions">${panelButton('GO TO THE IMPORT DESK','meet')}${panelButton('LEAVE FOR NOW','leave')}</div>`;
  else if(stage==='meet')dockPanel.innerHTML=`<p class="jdm-kicker">IMPORT DESK</p><p>“I came for the Supra.”</p><p class="jdm-speaker">THE IMPORTER</p><p>“The paperwork says it is yours when you collect it.”</p><p class="jdm-speaker">HIS DAUGHTER</p><p>“Then hand him the keys.”</p><div class="jdm-actions">${panelButton('I’M TAKING MY CAR','challenge')}${panelButton('LEAVE FOR NOW','leave')}</div>`;
  else dockPanel.innerHTML=`<p>THE IMPORT DOCK</p><div class="jdm-actions">${panelButton('CONTINUE','meet')}${panelButton('LEAVE FOR NOW','leave')}</div>`;
 }
 function renderAftermath(){if(!dockPanel)return;const outcome=RAState.get().characters[DAUGHTER_ID]?.conversionOutcome;if(outcome){dockPanel.innerHTML=`<p class="jdm-kicker">THE DOCK IS QUIET</p><p>Your choice is settled. The Supra is ready once the asking price is covered.</p><div class="jdm-actions">${panelButton('COMPLETE THE PURCHASE','retryPayment')}${panelButton('LEAVE FOR NOW','leave')}</div>`;return}dockPanel.innerHTML=`<p class="jdm-kicker">THE DOCK IS QUIET</p><p>The importer’s adult daughter waits by the office door.</p><p>What do you want to do?</p><div class="jdm-actions">${panelButton('LEAVE HER ALONE','leaveDaughter')}${panelButton('OFFER TO TURN HER','convertDaughter')}</div>`}
 function renderPayoff(){if(!payoffPanel)return;payoffPanel.innerHTML=`<p class="supra-title">TOYOTA SUPRA MK4</p><p>you actually got your Supra.</p><button class="jdm-action" data-jdm-action="finishPayoff">I’M READY</button>`}
 function show(el,on){el?.classList.toggle('active',on);el?.setAttribute('aria-hidden',on?'false':'true')}
 function goStory(scene){document.body.classList.add('jdm-mode');document.body.classList.remove('jdm-battle');show(dock,false);show(payoff,false);return RAScenes.go(scene)}
 async function begin(){if(car())return;const current=active();if(current&&current.status!=='completed')return resume();const price=SUPRA_MK4_PRICE_FOR_TESTING;if(RABudget.balance()<price){window.RAPhone?.refresh?.();return}
  RAState.patch('life.acquisitions.active',{id:ACQUISITION_ID,vehicleId:CAR_ID,status:'in_progress',stage:'arrival',quotedPrice:price,purchaseEventId:`vehicle-acquired:${CAR_ID}`,startedAt:new Date().toISOString()});
  if(RAPhone?.isOpen?.())await RAPhone.close();await goStory('jdmDock');
 }
 async function resume(){const a=active();if(car())return goStory('supraPayoff');if(!a)return;patchActive({status:'in_progress'});
  if(a.stage==='battle'){await RAScenes.go('jdmCombat');return}
  if(a.stage==='aftermath'){await RAScenes.go('jdmAftermath');return}
  if(a.stage==='converting'){await RAScenes.go('jdmAftermath');await convertDaughter();return}
  if(a.stage==='payoff'){await RAScenes.go('supraPayoff');return}
  await RAScenes.go('jdmDock');
 }
 async function action(name){
  if(name==='home'){window.RAPhone?.home?.();return}
  if(name==='begin'){return begin()}
  if(name==='cannotAfford'){return}
  if(name==='payoff'){return goStory('supraPayoff')}
  if(name==='resume'){return resume()}
  if(name==='meet'){patchActive({stage:'meet'});renderDock();return}
  if(name==='challenge'){patchActive({stage:'battle',status:'in_progress'});await RAScenes.go('jdmCombat');return}
  if(name==='leave'){patchActive({status:'paused'});RAState.patch('life.world.location','LA');document.body.classList.remove('jdm-mode','jdm-battle');show(dock,false);await RAScenes.go('bedroom',{jdmImports:true});return}
  if(name==='leaveDaughter'){recordDaughter('left_alone');await completeAcquisition();return}
  if(name==='convertDaughter')return convertDaughter();
  if(name==='retryPayment')return completeAcquisition();
  if(name==='finishPayoff'){RAState.patch('life.acquisitions.active',null);RAState.patch('life.world.location','LA');document.body.classList.remove('jdm-mode','jdm-battle');show(payoff,false);await RAScenes.go('bedroom',{supraPayoff:true});return}
 }
 function recordDaughter(outcome){RAState.patch(`characters.${DAUGHTER_ID}`,{id:DAUGHTER_ID,adult:true,met:true,vampire:outcome==='converted',conversionOutcome:outcome});RAState.recordEvent({id:`jdm-daughter:${outcome}`,type:'character_outcome',characterId:DAUGHTER_ID,outcome});}
 async function convertDaughter(){patchActive({stage:'converting'});await window.RACharacterReveal.convertEncounterCharacter(DAUGHTER_ID,{human:'assets/jdm_daughter_human.svg',vampire:'assets/jdm_daughter_vampire.svg'});recordDaughter('converted');await completeAcquisition()}
 function completeAcquisition(){const life=RAState.get().life,a=life.acquisitions.active;if(!a)return false;const existing=life.ownership.cars.find(x=>x.id===CAR_ID);
  if(!existing&&Number(life.resources.money)<Number(a.quotedPrice)){patchActive({status:'paused',stage:'aftermath',paymentPending:true});goStory('jdmAftermath');sayIfPossible('YOU NEED THE REST OF THE ASKING PRICE.');return false}
  const next=JSON.parse(JSON.stringify(life));if(!existing){next.resources.money-=Number(a.quotedPrice);next.ownership.cars.push({id:CAR_ID,make:'Toyota',model:'Supra Mk4',ownershipStatus:'owned',acquisitionSource:'jdm_imports_personal_collection',acquisitionEventId:a.purchaseEventId,acquiredAt:new Date().toISOString()})}
  next.world.flags.jdmImportsUnlocked=true;next.world.flags.jdmHomeDelivery=true;next.world.location='LA';const completedAt=new Date().toISOString();next.acquisitions.active={...a,status:'completed',stage:'payoff',paymentPending:false,completedAt};if(!next.acquisitions.completed.some(x=>x.id===ACQUISITION_ID))next.acquisitions.completed.push({id:ACQUISITION_ID,vehicleId:CAR_ID,completedAt});
  if(!next.history.some(x=>x.id===a.purchaseEventId))next.history.push({id:a.purchaseEventId,type:'vehicle_acquired',vehicleId:CAR_ID,source:'jdm_imports_personal_collection',at:completedAt});
  if(!next.history.some(x=>x.id==='jdm-imports-unlocked'))next.history.push({id:'jdm-imports-unlocked',type:'store_access_unlocked',storeId:'jdm_imports',delivery:'home',at:completedAt});
  RAState.patch('life',next);return goStory('supraPayoff');
 }
 function sayIfPossible(text){window.RACombat?.message?.(text)}
 function ownerDefeated(){patchActive({stage:'aftermath',status:'in_progress'});RAState.patch(`characters.${DAUGHTER_ID}.met`,true);RAState.patch(`characters.${DAUGHTER_ID}.adult`,true);RAState.patch('life.world.location','LA import facility');return RAScenes.go('jdmAftermath')}
 async function ownerLost(choice){if(choice==='retry'){return window.RACombat?.startJdmEncounter?.()}patchActive({status:'paused',stage:'meet',losses:(active()?.losses||0)+1});RAState.patch('life.world.location','LA');document.body.classList.remove('jdm-mode','jdm-battle');show(dock,false);return RAScenes.go('bedroom',{jdmImports:true})}
 function draw(canvas,mode='dock'){paint(canvas,mode)}
 function sceneEntry(id){document.body.classList.add('jdm-mode');document.body.classList.remove('jdm-battle');show(dock,id!=='supraPayoff');show(payoff,id==='supraPayoff');document.querySelector('#jdmDockDaughter')?.classList.toggle('visible',id==='jdmDock'||id==='jdmAftermath');if(id==='jdmDock'){paint(document.querySelector('#jdmDockCanvas'));renderDock()}if(id==='jdmAftermath'){paint(document.querySelector('#jdmDockCanvas'));renderAftermath()}if(id==='supraPayoff'){paint(document.querySelector('#supraPayoffCanvas'),'payoff');renderPayoff();document.querySelector('#supraPayoffRich')?.classList.add('visible')}}
 function sceneExit(id){if(id==='supraPayoff')document.querySelector('#supraPayoffRich')?.classList.remove('visible');if(!['jdmDock','jdmAftermath','supraPayoff'].includes(id))show(dock,false)}
 document.addEventListener('DOMContentLoaded',()=>{
  drawStoreProduct();const a=active();if(a&&a.status!=='completed'||a?.stage==='payoff'){const startButton=document.querySelector('#startButton');if(startButton)startButton.textContent='CONTINUE'}
  const sceneAction=e=>{const target=e.target.closest('[data-jdm-action]');if(target){e.preventDefault();action(target.dataset.jdmAction)}};
  dockPanel?.addEventListener('click',sceneAction);payoffPanel?.addEventListener('click',sceneAction);
  RAScenes.register('jdmDock',{enter:()=>sceneEntry('jdmDock'),exit:()=>sceneExit('jdmDock')});
  RAScenes.register('jdmCombat',{enter:()=>{document.body.classList.add('jdm-mode','jdm-battle');show(dock,false);show(payoff,false);window.RACombat?.startJdmEncounter?.()},exit:()=>document.body.classList.remove('jdm-battle')});
  RAScenes.register('jdmAftermath',{enter:()=>sceneEntry('jdmAftermath'),exit:()=>sceneExit('jdmAftermath')});
  RAScenes.register('supraPayoff',{enter:()=>sceneEntry('supraPayoff'),exit:()=>sceneExit('supraPayoff')});
 });
 window.RAJDMImports={priceForTesting:SUPRA_MK4_PRICE_FOR_TESTING,carId:CAR_ID,characterId:DAUGHTER_ID,storeMarkup,drawStoreProduct,refreshStore:drawStoreProduct,action,begin,resume,hasCheckpoint:()=>!!active()&&(active().status!=='completed'||active().stage==='payoff'),ownerDefeated,ownerLost,completeAcquisition,draw};
})();
