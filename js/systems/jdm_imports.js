(function(){
 const SUPRA_MK4_PRICE_FOR_TESTING=78000;
 const CHARACTER_SCALE_OPTIONS=[1,1.25,1.5],DEFAULT_CHARACTER_SCALE=1.25,GROUND_Y=350,ANCHOR={x:40,y:88};
 const ACQUISITION_ID='supra_mk4_first_collection',CAR_ID='toyota_supra_mk4_001',DAUGHTER_ID='jdm_importer_daughter_001';
 const dock=document.querySelector('#jdmDockScene'),dockPanel=document.querySelector('#jdmDockPanel'),payoff=document.querySelector('#supraPayoffScene'),payoffPanel=document.querySelector('#supraPayoffPanel');
 const dockCanvas=document.querySelector('#jdmDockCanvas'),payoffCanvas=document.querySelector('#supraPayoffCanvas');
 const dockActors={rich:document.querySelector('#jdmDockRich'),importer:document.querySelector('#jdmDockImporter'),daughter:document.querySelector('#jdmDockDaughter')};
 const payoffRich=document.querySelector('#supraPayoffRich'),payoffCar=document.querySelector('#supraPayoffCar'),payoffKey=document.querySelector('#supraPayoffKey');
 const scaleControl=document.querySelector('#devJdmScale');let characterScale=DEFAULT_CHARACTER_SCALE;
 const ENVIRONMENT='assets/jdm_imports/environment/docks_night_270x480.png',dockEnvironment=new Image(),payoffEnvironment=new Image();
 dockEnvironment.src=ENVIRONMENT;payoffEnvironment.src=ENVIRONMENT;
 const active=()=>RAState.get().life.acquisitions.active;
 const car=()=>RAState.get().life.ownership.cars.find(x=>x.id===CAR_ID)||null;
 const button=(label,action,extra='')=>`<button type="button" class="phone-button jdm-action" data-jdm-action="${action}" ${extra}>${label}</button>`;
 function panelButton(label,action){return `<button type="button" class="jdm-panel-action" data-jdm-action="${action}">${label}</button>`}
 function paintEnvironment(canvas,image){const ctx=canvas?.getContext('2d');if(!ctx||!image.complete||!image.naturalWidth)return;ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,270,480);ctx.drawImage(image,0,0,270,480)}
 function placeCharacter(img,anchorX,scale=characterScale){if(!img)return;const canvas=img.closest('#jdmDockScene')?dockCanvas:payoffCanvas,sx=canvas?.getBoundingClientRect().width/(canvas?.width||270)||1,sy=canvas?.getBoundingClientRect().height/(canvas?.height||480)||1;img.style.width=`${80*scale*sx}px`;img.style.height=`${96*scale*sy}px`;img.style.left=`${Math.round((anchorX-ANCHOR.x*scale)*sx)}px`;img.style.top=`${Math.round((GROUND_Y-ANCHOR.y*scale)*sy)}px`;img.classList.add('visible')}
 function placePayoffObjects(){const sx=payoffCanvas?.getBoundingClientRect().width/(payoffCanvas?.width||270)||1,sy=payoffCanvas?.getBoundingClientRect().height/(payoffCanvas?.height||480)||1;for(const [el,x,y,w,h] of [[payoffCar,100,304,136,50],[payoffKey,67,319,24,16]])if(el){el.style.left=`${x*sx}px`;el.style.top=`${y*sy}px`;el.style.width=`${w*sx}px`;el.style.height=`${h*sy}px`;el.classList.add('visible')}}
 function setActorState(id,filename){const img=dockActors[id];if(img)img.src=`assets/jdm_imports/characters/${id==='importer'?'importer':'daughter'}/${filename}.png`}
 function setDockActors(stage){
  setActorState('importer',stage==='arrival'?'importer_neutral':stage==='meet'?'importer_irritated':stage==='aftermath'?'importer_defeated':'importer_combat_ready');
  setActorState('daughter',stage==='arrival'?'daughter_neutral':stage==='meet'?'daughter_reaction':'daughter_post_battle');
  placeCharacter(dockActors.rich,55);placeCharacter(dockActors.importer,180);placeCharacter(dockActors.daughter,230);
 }
 function layoutBattleActors(){const battleCanvas=document.querySelector('#jdmDockBattleCanvas'),sx=battleCanvas?.getBoundingClientRect().width/(battleCanvas?.width||270)||1,sy=battleCanvas?.getBoundingClientRect().height/(battleCanvas?.height||480)||1;for(const [img,anchorX] of [[document.querySelector('#geminiRich'),55],[document.querySelector('#productionCEO'),180]])if(img){img.style.left=`${Math.round((anchorX-ANCHOR.x*characterScale)*sx)}px`;img.style.top=`${Math.round((GROUND_Y-ANCHOR.y*characterScale)*sy)}px`;img.style.width=`${80*characterScale*sx}px`;img.style.height=`${96*characterScale*sy}px`;img.style.backgroundSize=`${80*characterScale*sx}px ${96*characterScale*sy}px`}}
 function clearBattleActorLayout(){for(const img of [document.querySelector('#geminiRich'),document.querySelector('#productionCEO')])if(img)for(const key of ['left','top','width','height','backgroundSize'])img.style.removeProperty(key.replace(/[A-Z]/g,m=>`-${m.toLowerCase()}`))}
 function setCharacterScale(value){const next=Number(value);if(!CHARACTER_SCALE_OPTIONS.includes(next))return characterScale;characterScale=next;if(scaleControl)scaleControl.value=String(next);if(dock?.classList.contains('active'))setDockActors(active()?.stage||'arrival');if(payoff?.classList.contains('active')){placeCharacter(payoffRich,55);placePayoffObjects()}if(RAScenes.current()==='jdmCombat')layoutBattleActors();return characterScale}
 function storeMarkup(){const owned=car(),current=active(),access=RAOpportunities.get('jdm_home_delivery');let label,action,disabled='';
  if(owned){label='VIEW YOUR SUPRA';action='payoff'}else if(current&&current.status!=='completed'){label='RETURN TO COLLECTION';action='resume'}else if(RABudget.balance()<SUPRA_MK4_PRICE_FOR_TESTING){label='NOT ENOUGH CASH';action='cannotAfford';disabled='disabled'}else{label='BUY';action='begin'}
  const note=owned?`<p>YOU OWN THE SUPRA.</p><p>${access?.available?'FUTURE DELIVERIES TO YOUR PLACE ARE AVAILABLE.':'FIRST COLLECTION COMPLETE.'}</p>`:`<p>TOYOTA SUPRA MK4</p><p class="jdm-price">$${new Intl.NumberFormat('en-US').format(SUPRA_MK4_PRICE_FOR_TESTING)}</p><p class="jdm-access-note">FIRST COLLECTION AT THE IMPORTER</p>${current?.status==='paused'?'<p>PICK UP WHERE YOU LEFT OFF.</p>':''}`;
  return `<h1>JDMIMPORTS</h1><img class="supra-product" src="assets/jdm_imports/ui/supra_mk4_listing.png" alt="" draggable="false" />${note}<div class="jdm-store-actions">${button(label,action,disabled)}${button('HOME','home')}</div>`;
 }
 function patchActive(fields){const prior=active();if(!prior)return false;return RAState.patch('life.acquisitions.active',{...prior,...fields})}
 function renderDock(){if(!dockPanel)return;const a=active();if(!a)return;const stage=a.stage;setDockActors(stage);
  if(stage==='arrival')dockPanel.innerHTML=`<p class="jdm-kicker">LOS ANGELES · IMPORT DOCK</p><p>The Supra is here. Pickup happens at the dock.</p><p class="jdm-small">Current ask: $${new Intl.NumberFormat('en-US').format(a.quotedPrice)}</p><div class="jdm-actions">${panelButton('GO TO THE IMPORT DESK','meet')}${panelButton('LEAVE FOR NOW','leave')}</div>`;
  else if(stage==='meet')dockPanel.innerHTML=`<p class="jdm-kicker">IMPORT DESK</p><p>“I came for the Supra.”</p><p class="jdm-speaker">THE IMPORTER</p><p>“The paperwork says it is yours when you collect it.”</p><p class="jdm-speaker">HIS DAUGHTER</p><p>“Then hand him the keys.”</p><div class="jdm-actions">${panelButton('I’M TAKING MY CAR','challenge')}${panelButton('LEAVE FOR NOW','leave')}</div>`;
  else dockPanel.innerHTML=`<p>THE IMPORT DOCK</p><div class="jdm-actions">${panelButton('CONTINUE','meet')}${panelButton('LEAVE FOR NOW','leave')}</div>`;
 }
 function renderAftermath(){if(!dockPanel)return;setDockActors('aftermath');const outcome=RAState.get().characters[DAUGHTER_ID]?.conversionOutcome;
  if(outcome){dockPanel.innerHTML=`<p class="jdm-kicker">THE DOCK IS QUIET</p><p>Your choice is settled. The Supra is ready once the asking price is covered.</p><div class="jdm-actions">${panelButton('COMPLETE THE PURCHASE','retryPayment')}${panelButton('LEAVE FOR NOW','leave')}</div>`;return}
  dockPanel.innerHTML=`<p class="jdm-kicker">THE DOCK IS QUIET</p><p>The importer’s adult daughter waits by the office door.</p><p>What do you want to do?</p><div class="jdm-actions">${panelButton('LEAVE HER ALONE','leaveDaughter')}${panelButton('OFFER TO TURN HER','convertDaughter')}</div>`;
 }
 function renderPayoff(){if(!payoffPanel)return;payoffPanel.innerHTML=`<p class="supra-title">TOYOTA SUPRA MK4 · YOURS</p><p>you actually got your Supra.</p><button class="phone-button jdm-action" data-jdm-action="finishPayoff">I’M READY</button>`}
 function show(el,on){el?.classList.toggle('active',on);el?.setAttribute('aria-hidden',on?'false':'true')}
 function goStory(scene){document.body.classList.add('jdm-mode');document.body.classList.remove('jdm-battle');show(dock,false);show(payoff,false);return RAScenes.go(scene)}
 async function begin(){if(car())return;const current=active();if(current&&current.status!=='completed')return resume();const price=SUPRA_MK4_PRICE_FOR_TESTING;if(RABudget.balance()<price){window.RAPhone?.refresh?.();return}
  RAState.patch('life.acquisitions.active',{id:ACQUISITION_ID,vehicleId:CAR_ID,status:'in_progress',stage:'arrival',quotedPrice:price,purchaseEventId:`vehicle-acquired:${CAR_ID}`,startedAt:new Date().toISOString()});
  if(RAPhone?.isOpen?.())await RAPhone.close();await goStory('jdmDock');
 }
 async function resume(){const a=active();if(car())return goStory('supraPayoff');if(!a)return;patchActive({status:'in_progress'});
  if(a.stage==='battle'){await RAScenes.go('jdmCombat');return}if(a.stage==='aftermath'){await RAScenes.go('jdmAftermath');return}
  if(a.stage==='converting'){await RAScenes.go('jdmAftermath');await convertDaughter();return}if(a.stage==='payoff'){await RAScenes.go('supraPayoff');return}await RAScenes.go('jdmDock');
 }
 async function action(name){
  if(name==='home'){window.RAPhone?.home?.();return}if(name==='begin')return begin();if(name==='cannotAfford')return;
  if(name==='payoff')return goStory('supraPayoff');if(name==='resume')return resume();
  if(name==='meet'){patchActive({stage:'meet'});renderDock();return}
  if(name==='challenge'){patchActive({stage:'battle',status:'in_progress'});await RAScenes.go('jdmCombat');return}
  if(name==='leave'){patchActive({status:'paused'});RAState.patch('life.world.location','LA');document.body.classList.remove('jdm-mode','jdm-battle');show(dock,false);await RAScenes.go('bedroom',{jdmImports:true});return}
  if(name==='leaveDaughter'){recordDaughter('left_alone');return completeAcquisition()}
  if(name==='convertDaughter')return convertDaughter();if(name==='retryPayment')return completeAcquisition();
  if(name==='finishPayoff'){RAState.patch('life.acquisitions.active',null);RAState.patch('life.world.location','LA');document.body.classList.remove('jdm-mode','jdm-battle');show(payoff,false);await RAScenes.go('bedroom',{supraPayoff:true});return}
 }
 function recordDaughter(outcome){RAState.patch(`characters.${DAUGHTER_ID}`,{id:DAUGHTER_ID,adult:true,met:true,vampire:outcome==='converted',conversionOutcome:outcome});RAState.recordEvent({id:`jdm-daughter:${outcome}`,type:'character_outcome',characterId:DAUGHTER_ID,outcome})}
 async function convertDaughter(){patchActive({stage:'converting'});await window.RACharacterReveal.convertEncounterCharacter(DAUGHTER_ID,{human:'assets/jdm_imports/characters/daughter/daughter_neutral.png',vampire:'assets/jdm_imports/characters/daughter/daughter_vampire_reveal.png'});recordDaughter('converted');await completeAcquisition()}
 function completeAcquisition(){const life=RAState.get().life,a=life.acquisitions.active;if(!a)return false;const existing=life.ownership.cars.find(x=>x.id===CAR_ID);
  if(!existing&&Number(life.resources.money)<Number(a.quotedPrice)){patchActive({status:'paused',stage:'aftermath',paymentPending:true});goStory('jdmAftermath');sayIfPossible('YOU NEED THE REST OF THE ASKING PRICE.');return false}
  const next=JSON.parse(JSON.stringify(life));if(!existing){next.resources.money-=Number(a.quotedPrice);next.ownership.cars.push({id:CAR_ID,make:'Toyota',model:'Supra Mk4',ownershipStatus:'owned',acquisitionSource:'jdm_imports_personal_collection',acquisitionEventId:a.purchaseEventId,acquiredAt:new Date().toISOString()})}
  next.world.flags.jdmImportsUnlocked=true;next.world.flags.jdmHomeDelivery=true;next.world.location='LA';const completedAt=new Date().toISOString();next.acquisitions.active={...a,status:'completed',stage:'payoff',paymentPending:false,completedAt};if(!next.acquisitions.completed.some(x=>x.id===ACQUISITION_ID))next.acquisitions.completed.push({id:ACQUISITION_ID,vehicleId:CAR_ID,completedAt});
  if(!next.history.some(x=>x.id===a.purchaseEventId))next.history.push({id:a.purchaseEventId,type:'vehicle_acquired',vehicleId:CAR_ID,source:'jdm_imports_personal_collection',at:completedAt});
  if(!next.history.some(x=>x.id==='jdm-imports-unlocked'))next.history.push({id:'jdm-imports-unlocked',type:'store_access_unlocked',storeId:'jdm_imports',delivery:'home',at:completedAt});RAState.patch('life',next);return goStory('supraPayoff');
 }
 function sayIfPossible(text){window.RACombat?.message?.(text)}
 function ownerDefeated(){patchActive({stage:'aftermath',status:'in_progress'});RAState.patch(`characters.${DAUGHTER_ID}.met`,true);RAState.patch(`characters.${DAUGHTER_ID}.adult`,true);RAState.patch('life.world.location','LA import facility');return RAScenes.go('jdmAftermath')}
 async function ownerLost(choice){if(choice==='retry')return window.RACombat?.startJdmEncounter?.();patchActive({status:'paused',stage:'meet',losses:(active()?.losses||0)+1});RAState.patch('life.world.location','LA');document.body.classList.remove('jdm-mode','jdm-battle');show(dock,false);return RAScenes.go('bedroom',{jdmImports:true})}
 function sceneEntry(id){document.body.classList.add('jdm-mode');document.body.classList.remove('jdm-battle');show(dock,id!=='supraPayoff');show(payoff,id==='supraPayoff');
  if(id==='jdmDock'){paintEnvironment(dockCanvas,dockEnvironment);setDockActors(active()?.stage||'arrival');renderDock()}
  if(id==='jdmAftermath'){paintEnvironment(dockCanvas,dockEnvironment);setDockActors('aftermath');renderAftermath()}
  if(id==='supraPayoff'){paintEnvironment(payoffCanvas,payoffEnvironment);placeCharacter(payoffRich,55);placePayoffObjects();renderPayoff()}
 }
 function sceneExit(id){if(id==='supraPayoff'){payoffRich?.classList.remove('visible');payoffCar?.classList.remove('visible');payoffKey?.classList.remove('visible')}if(!['jdmDock','jdmAftermath','supraPayoff'].includes(id))show(dock,false)}
 function sceneClick(e){const target=e.target.closest('[data-jdm-action]');if(target){e.preventDefault();action(target.dataset.jdmAction)}}
document.addEventListener('DOMContentLoaded',()=>{
  setCharacterScale(DEFAULT_CHARACTER_SCALE);
  scaleControl?.addEventListener('change',e=>setCharacterScale(e.target.value));dockEnvironment.onload=()=>{paintEnvironment(dockCanvas,dockEnvironment);paintEnvironment(document.querySelector('#jdmDockBattleCanvas'),dockEnvironment)};payoffEnvironment.onload=()=>paintEnvironment(payoffCanvas,payoffEnvironment);
  dockPanel?.addEventListener('click',sceneClick);payoffPanel?.addEventListener('click',sceneClick);
  RAScenes.register('jdmDock',{enter:()=>sceneEntry('jdmDock'),exit:()=>sceneExit('jdmDock')});
  RAScenes.register('jdmCombat',{enter:()=>{document.body.classList.add('jdm-mode','jdm-battle');show(dock,false);show(payoff,false);paintEnvironment(document.querySelector('#jdmDockBattleCanvas'),dockEnvironment);window.RACombat?.startJdmEncounter?.()},exit:()=>{document.body.classList.remove('jdm-battle');clearBattleActorLayout()}});
  RAScenes.register('jdmAftermath',{enter:()=>sceneEntry('jdmAftermath'),exit:()=>sceneExit('jdmAftermath')});
  RAScenes.register('supraPayoff',{enter:()=>sceneEntry('supraPayoff'),exit:()=>sceneExit('supraPayoff')});
 });
 window.RAJDMImports={priceForTesting:SUPRA_MK4_PRICE_FOR_TESTING,characterScaleOptions:CHARACTER_SCALE_OPTIONS,defaultCharacterScale:DEFAULT_CHARACTER_SCALE,setCharacterScale,layoutBattleActors,carId:CAR_ID,characterId:DAUGHTER_ID,storeMarkup,action,begin,resume,hasCheckpoint:()=>!!active()&&(active().status!=='completed'||active().stage==='payoff'),ownerDefeated,ownerLost,completeAcquisition,drawBattleBackground:()=>paintEnvironment(document.querySelector('#jdmDockBattleCanvas'),dockEnvironment)};
 window.addEventListener('resize',()=>{if(dock?.classList.contains('active'))setDockActors(active()?.stage||'arrival');if(payoff?.classList.contains('active')){placeCharacter(payoffRich,55);placePayoffObjects()}if(RAScenes.current()==='jdmCombat')layoutBattleActors()});
})();
