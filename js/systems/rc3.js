(function(){
 'use strict';
 // OL-074: production routing policy. Content and frozen art remain in the repository.
 const APPS=['vampgpt','texts','warRoom','stripClub','armory','bank','maps','radio','vampgram'];
 // Ten retained outings, prerequisite introductions before their authored follow-ups.
 const MAPS=['A43','YAM','FUFU','AUNTIES','PLATES','A19','JOLLOF_WARS','A54','A56','A20'];
 const HALL=['A26','HOST'];
 const CASH_FLOOR=28000;
 const UTILITY=['ARMORY','ARMORY_WALL','A08','SLURP'];
 const MISSIONS=['NEW_OGA_M1','NEW_OGA_M2','NEW_OGA_M3','NEW_OGA_M4','NEW_OGA_ALTERNATIVE','NEW_OGA_M5','NEW_OGA_M6','NEW_OGA_M7','NEW_OGA_M8','NEW_OGA_M9','NEW_OGA_M10','NEW_OGA_VAMPGPT','NEW_OGA_FINALE'];
 const L=()=>RALife.life(),day=()=>RALife.today().day,flag=RALife.flag;
 const read=()=>flag('rc3Day')?.day===day()?flag('rc3Day'):{day:day(),story:!!flag('ogunsRaveCompleted')&&(L().newOga.lastMissionDay===day()||!!L().newOga.finaleDone),action:false,paid:false,moneyBefore:RALife.money(),earnedIncome:0};
 const patch=v=>{const s={...read(),...v};RALife.setFlag('rc3Day',s);return s;};
 const dancer=id=>!!window.RAF15?.parse?.(id);
 function allowed(id){return id==='A00'||id==='RC3_FIGHT'||MISSIONS.includes(id)||MAPS.includes(id)||HALL.includes(id)||UTILITY.includes(id)||dancer(id);}
 function canStart(id,from){if(!allowed(id))return false;if(RAAdventures.active()?.id===id)return true;
  if(MAPS.includes(id))return (from==='rc3-maps'||(from==='chain'&&id==='A56'&&RAAdventures.isDone('A54')))&&RAAdventures.available(id);
  if(HALL.includes(id))return from==='rc4-hall'&&RALife.hasRoom('party_hall')&&RAAdventures.available(id);
  if(MISSIONS.includes(id))return RAAdventures.available(id);
  if(id==='DATE')return false;return true;}
 function pendingMission(){const s=L().newOga;
  if(!s.m1Rewarded)return 'NEW_OGA_M1';
  if(s.mission<2)return 'NEW_OGA_M2';
  if(s.mission<3)return 'NEW_OGA_M3';
  if(!s.m4Outcome)return 'NEW_OGA_M4';
  if(s.alternativePending)return 'NEW_OGA_ALTERNATIVE';
  if(!s.m5Completed)return 'NEW_OGA_M5';
  if(!s.m6Completed)return 'NEW_OGA_M6';
  if(!s.m7Completed)return 'NEW_OGA_M7';
  if(!s.m8Resolved)return 'NEW_OGA_M8';
  if(!s.m9Resolved)return 'NEW_OGA_M9';
  if(!s.m10Completed&&!s.m9GrantsWithheld)return 'NEW_OGA_M10';
  if(!s.finaleBegun)return 'NEW_OGA_VAMPGPT';
  if(!s.finaleDone)return 'NEW_OGA_FINALE';
  return null;
 }
 function chapter(){return !flag('throneDone')?'Prologue':!flag('ogunsRaveCompleted')?"Ogun's Rave":L().newOga.finaleBegun?'Finale':'New Oga ladder';}
 function next(){const s=read(),m=pendingMission(),active=RAAdventures.active();let label,kind='story',app='vampgpt';
  if(active?.vars?.rc4Paused)return {id:'recovery',key:`rc4:${day()}:resume`,kind:'recovery',app:'vampgpt',label:attemptAllowed(active.id,active.node)?'RESUME STORY':'SLEEP — RETRY TOMORROW',sub:'Your checkpoint is saved.',action:'rc3:next'};
  if(campaignComplete())return {id:'rest',key:`rc4:${day()}:rest`,kind:'rest',app:null,label:'SLEEP',sub:window.RAWriting.voiceSlots[40],action:'rc3:next'};
  if(!flag('throneDone'))label='FINISH THE PROLOGUE';
  else if(!s.story&&!flag('ogunsRaveCompleted'))label="OGUN'S RAVE";
  else if(!s.story&&m&&missionReady(m))label=RAAdventures.get(m)?.title||m;
  else if(!s.story&&m&&!missionReady(m)){label='SLEEP — STORY RETURNS TOMORROW';kind='rest';app=null;}
  else if(!s.story){label='FINISH TODAY’S STORY';kind='story';}
  else if(!s.action){label='FIGHT · PROTECT THE CREW';kind='action';}
  else if(!s.paid){label='COLLECT CASH';kind='cash';app='bank';}
  else if(flag('stripClubLastDay')!==day()){label='STRIP CLUB NIGHT';kind='club';app='stripClub';}
  else {label='SLEEP';kind='rest';app=null;}
  return {id:kind,key:`rc3:${day()}:${label}`,kind,app,label,sub:window.RAWriting.voiceSlots[{story:36,action:37,cash:38,club:39,rest:40}[kind]],action:'rc3:next'};
 }
 async function advance(){const n=next();
  if(n.kind==='recovery'){const a=RAAdventures.active();if(!attemptAllowed(a.id,a.node))return RABedroomLife.goToSleep();RAAdventures.context().set('rc4Paused',false);return RAAdventureScene.resume();}
  if(n.label==='FINISH THE PROLOGUE')return RANewGame.onStart();
  if(n.label==="OGUN'S RAVE"){patch({moneyBefore:RALife.money()});RALife.setFlag('ogunsRaveInvited',true);return RAOgunRave.begin();}
  if(n.kind==='story'){const id=pendingMission();patch({moneyBefore:RALife.money()});await RAPhone?.close?.();return RAAdventureScene.begin(id,{from:'rc3-story'});}
  if(n.kind==='action'){await RAPhone?.close?.();return RAAdventureScene.begin('RC3_FIGHT',{from:'rc3-story'});}
  if(n.kind==='cash'){claimCash();RAPhone?.refresh?.();return true;}
  if(n.kind==='club')return RAStripClub.open(RAPhone?.api);
  if(n.kind==='rest'){await RAPhone?.close?.();return RABedroomLife.goToSleep();}
 }
 // Persist gross income independently of spending. Legacy current-day saves cannot
 // prove prior earnings: conservatively cover today's floor, track normally tomorrow.
 if(flag('rc3Day')?.day===day()&&!Number.isFinite(flag('rc3Day').earnedIncome))patch({earnedIncome:CASH_FLOOR,earningsMigration:'legacy-floor-covered'});
 window.RAStateWatch?.watch('rc4.income',s=>s.life?.resources?.money,(next,prev)=>{
  if(next>prev&&!read().paid)patch({earnedIncome:(Number(read().earnedIncome)||0)+(next-prev)});
 });
 function claimCash(){const s=read();if(!s.story||!s.action||s.paid)return false;
  const amount=Math.max(0,CASH_FLOOR-(Number(s.earnedIncome)||0)),life=JSON.parse(JSON.stringify(L()));
  life.resources.money+=amount;life.world.flags.rc3Day={...s,paid:true,cash:amount};
  const event={id:'rc3:cash:'+day(),type:'rc3_story_cash',day:day(),amount};
  if(!life.history.some(e=>e.id===event.id))life.history.push(event);
  const settle=()=>RAState.patch('life',life);
  if(window.RAMoneyLedger)RAMoneyLedger.withSource('rc3:story',settle);else settle();return true;
 }
 const canSleep=()=>campaignComplete()||!!RAAdventures.active()?.vars?.rc4Paused||(!read().story&&!!pendingMission()&&!missionReady(pendingMission()))||(read().paid&&flag('stripClubLastDay')===day());
 // B1 settlement contract: only a returned, validated COMPLETE PLAY earns credit.
 // Receipts are keyed by request, not UI entry; cancel/refusal/reload cannot farm it.
 function settlePlay(result,summary){
  if(result?.status!=='COMPLETE'||!result.requestId||summary?.errors?.length||summary?.day!==day())return false;
  const seen={...(flag('rc4PlayCredit')||{})};if(seen[result.requestId])return false;
  seen[result.requestId]=day();RALife.setFlag('rc4PlayCredit',seen);patch({action:true});return true;
 }
 const attemptKey=(id,node)=>`${id}:${node}`;
 const attempts=()=>flag('rc4Attempts')?.day===day()?flag('rc4Attempts'):{day:day(),failures:{}};
 function attemptAllowed(id,node){return Number(attempts().failures[attemptKey(id,node)]||0)<2;}
 function settleAttempt(id,node,result){
  if(result?.quit||result?.error||['quit','cancel','refused'].includes(result?.outcome)||result?.data?.refused)return 'paused';
  if(['lose','fail'].includes(result?.outcome)){const a=attempts(),k=attemptKey(id,node);RALife.setFlag('rc4Attempts',{day:day(),failures:{...a.failures,[k]:Number(a.failures[k]||0)+1}});}
  return 'settled';
 }
 function suspend(){if(RAAdventures.active())RAAdventures.context().set('rc4Paused',true);}
 function missionReady(id){const s=L().newOga;if(day()<=Number(s.lastMissionDay||0))return false;
  if(id==='NEW_OGA_VAMPGPT'&&s.m10VampgptReaskDay!=null&&day()<s.m10VampgptReaskDay)return false;return true;
 }
 const storyEvent=id=>id==='ogun_rave_invite_001'&&!flag('ogunsRaveCompleted');
 function showMorning(layer,el){const n=next(),wrap=el('div','morning-mail');wrap.style.pointerEvents='auto';
  wrap.append(el('h2',null,`DAY ${day()}`));if(day()===1)wrap.append(el('p','phone-chat',`<b>RICH</b> ${window.RAWriting.voice(1)}`));const b=el('button','mail-card',`<b>${n.label}</b>${chapter()}`);b.type='button';b.addEventListener('click',()=>{wrap.remove();RAPhone.openApp('vampgpt');});
  const up=el('button','mail-done','GET UP');up.type='button';up.addEventListener('click',()=>{wrap.remove();window.RABedroom?.releasePhone?.();});wrap.append(b,up);layer.append(wrap);
 }
 function mapsMarkup(api){releaseMap();return `<h1>MAPS</h1><p class="phone-small">New outings appear at least two days apart. Story prerequisites still apply.</p>${MAPS.filter(id=>RAAdventures.available(id)).map(id=>api.button(api.esc(RAAdventures.get(id).title),`rc3:map:${id}`)).join('')||'<p>No outing ready tonight.</p>'}${api.button('HOME','home','phone-home')}`;}
 async function mapGo(id){if(!MAPS.includes(id)||!RAAdventures.available(id))return false;await RAPhone.close();return RAAdventureScene.begin(id,{from:'rc3-maps'});}
 function phoneRoute(id){return APPS.includes(id)||id==='jdmImports'||id==='cars';}
 function phoneAction(name){if(name.startsWith('app:'))return phoneRoute(name.split(':')[1]);if(name.startsWith('do:'))return phoneRoute(name.split(':')[1]);
  if(name.startsWith('go:')||name.startsWith('tempt:')||['money','people','realEstate','atlanta','tokyo','letsGo','butterChicken'].includes(name))return false;return true;}
 window.RARC3={apps:APPS,maps:MAPS,missions:MISSIONS,utility:UTILITY,allowed,canStart,pendingMission,chapter,next,advance,read,patch,claimCash,canSleep,storyEvent,showMorning,mapsMarkup,mapGo,phoneRoute,phoneAction,settlePlay,attemptAllowed,settleAttempt,suspend,missionReady};
 // Existing saves get the same nine functional entry points without waiting for another wake.
 for(const id of APPS)RALife.unlockApp(id,{silent:true});RALife.setFlag('armoryKnown',true);
 // The existing app registry stays available to its owners, while only these nine tiles render.
 window.RAPhoneRegistry?.sync?.();
 // The phone's closure consults life app unlocks. Unlock essentials at the first story wake.
 RAClock.onWake('rc3-apps',998,()=>{for(const id of APPS)RALife.unlockApp(id,{silent:true});RALife.setFlag('armoryKnown',true);patch({moneyBefore:RALife.money()});});
 const ack=new Set();window.RAGuidance={next,story:()=>[next()],cash:()=>[],spend:()=>[],recommended:()=>[next()],steps:()=>['prologue','rave',...MISSIONS,'fight','cash','club','sleep'],
  opened:id=>ack.add(`${day()}:${id}:${next().key}`),target:()=>{const n=next();return n.app&&!ack.has(`${day()}:${n.app}:${n.key}`)?{app:n.app,key:n.key,item:n}:null;},pulsing:id=>{const t=window.RAGuidance.target();return t?.app===id;}};
 // Preserve authored predicates. Exactly one newly released outing per >=2 days;
 // no catch-up burst or fabricated completion on old saves. Already released arcs
 // keep their own per-day prerequisites and can continue on subsequent days.
 const mapPredicates=new Map(MAPS.map(id=>[id,RAAdventures.get(id)?.available]));
 mapPredicates.set('A20',L=>L.day>18&&!L.flag('phil3Done')&&L.flag('philLastDay')!==L.day);
 mapPredicates.set('A56',()=>RAAdventures.record('A54')?.outcome==='win');
 // Older saves already visited some of these outings before release metadata
 // existed. Keep those continuations/repeatable rewards known, never completed anew.
 if(!flag('rc4Maps')){
  const known=MAPS.filter(id=>{const r=RAAdventures.record(id);return r&&(r.count>0||r.status==='active');});
  if(known.length)RALife.setFlag('rc4Maps',{unlocked:Object.fromEntries(known.map(id=>[id,Number(RAAdventures.record(id).startedDay)||day()])),lastDay:day(),migration:'legacy-known-outings'});
 }
 const mapState=()=>flag('rc4Maps')||{unlocked:{},lastDay:0};let releasingMap=false;
 function releaseMap(){if(releasingMap)return;releasingMap=true;try{
  const s=mapState();if(day()<2||day()<Number(s.lastDay||0)+2)return;
  const id=MAPS.find(id=>!s.unlocked[id]&&!RAAdventures.isDone(id)&&(!mapPredicates.get(id)||mapPredicates.get(id)(RALife.L())));
  if(id)RALife.setFlag('rc4Maps',{unlocked:{...s.unlocked,[id]:day()},lastDay:day()});
 }finally{releasingMap=false;}}
 for(const id of MAPS){const d=RAAdventures.get(id);if(d)d.available=L=>{releaseMap();return !!mapState().unlocked[id]&&(!mapPredicates.get(id)||mapPredicates.get(id)(L));};}
 releaseMap();RAClock.onWake('rc4-maps',999,releaseMap);
 for(const id of MISSIONS){const d=RAAdventures.get(id);if(d)d.available=()=>flag('ogunsRaveCompleted')&&!read().story&&pendingMission()===id&&missionReady(id);}
 const prologue=RAAdventures.get('A00');if(prologue){prologue.nodes.fall1.next='sensei_point';prologue.nodes.sensei_point.next='brain_offer';prologue.nodes.brain_done.next='fork';}
 // Preserve the main ladder: remove early arc-ending choices.
 const m1=RAAdventures.get('NEW_OGA_M1'),m2=RAAdventures.get('NEW_OGA_M2');
 if(m1){m1.nodes.pitch.choices=m1.nodes.pitch.choices.filter(c=>c.next!=='nah');m1.nodes.table.choices=m1.nodes.table.choices.filter(c=>c.next!=='leave');}
 if(m2)m2.nodes.debt.choices=m2.nodes.debt.choices.filter(c=>c.next==='work');
 // A vehicle is no longer a shopping prerequisite. Gbenga supplies transport for this assignment.
 const m4=RAAdventures.get('NEW_OGA_M4');if(m4){m4.nodes.beat3.lines=[RAContent.N("uncles rental van headed to koreatown free ride finally")];m4.nodes.run.lines=[RAContent.N("carlos running rich in uncles van making it look close")];
  // Use the existing neutral Touge handling profile for the authored rental van.
  // It is encounter data, never an owned Supra or acquisition reward.
  m4.nodes.run.minigame.params=()=>({course:'warehouse_alleys',car:'supra',durationSeconds:RANewOgaTunables.m4.ESCAPE_DURATION_SECONDS,escapeRunner:'Carlos'});
 }
 const m9=RAAdventures.get('NEW_OGA_M9');if(m9){for(const c of m9.nodes.choice.choices)if(c.next==='give')c.when=()=>!!RANewOgaLadder.favoriteCar();}
 // A short mandatory crew fight fills dialogue-only days. Existing fighter/art/rules; no optional outing is pushed.
 RAAdventures.define({id:'RC3_FIGHT',title:'PROTECT THE CREW',lane:'combat',repeatable:true,available:()=>!read().action,start:'brief',nodes:{
  brief:{env:'street_night',actors:{left:'rich',right:'smallie_cousin'},lines:[RAContent.N("crew blocked clear the street then collect")],next:'fight'},
  fight:{fight:{enemy:'smallie_cousin',params:{env:'street_night'},win:'done',lose:'retry',run:'retry'}},
  retry:{lines:[RAContent.N("street still blocked bro run it back")],choices:[{label:'TRY AGAIN',next:'fight'}]},
  done:{end:{outcome:'win',memory:{text:'cleared the street for the crew',lane:'combat'}}}
 }});
 // Count real successful fights/PLAYs, including those inside the authored mission.
 const afterFight=RAAdventures.afterFight,afterPlay=RAAdventures.afterMinigame;
 RAAdventures.afterFight=function(node,result){if(MISSIONS.includes(RAAdventures.active()?.id)||RAAdventures.active()?.id==='RC3_FIGHT')if(['win','spared'].includes(result?.outcome))patch({action:true});return afterFight(node,result);};
 RAAdventures.afterMinigame=function(node,result){if(MISSIONS.includes(RAAdventures.active()?.id)&&!result?.quit&&!result?.error&&!result?.data?.refused&&!['lose','fail','cancel','quit','refused'].includes(result?.outcome))patch({action:true});return afterPlay(node,result);};
 document.addEventListener('ra:adventure-complete',e=>{if(MISSIONS.includes(e.detail?.id))patch({story:true});});
 document.addEventListener('ra:scene',e=>{if(e.detail?.id==='bedroom'){
  if(flag('ogunsRaveCompleted')&&!flag('rc3RaveRecorded')){RALife.setFlag('rc3RaveRecorded',true);patch({story:true});}
  if(day()===1&&flag('throneDone'))patch({action:true});
 }});
 // Cut runs in an old save cannot resume through the bedroom, and old automatic follow-ups are retired.
 const active=RAAdventures.active();if(active&&!allowed(active.id)){RAAdventures.abandon();RAState.patch('life.clock.returnBeat',null);}
 RALife.setFlag('wakeTrigger',null);RAState.patch('life.temptations.live',[]);
 RALife.setFlag('onlyvamps_subs',[]);
 // OL-079: the protected ending owns its wake; retiring optional fame routes
 // must not retire the ending. Read eligibility late because the private pack
 // installs its authored momentum rules after this production policy.
 function claimsEnding(){
  const m=L().momentum;if(m.fameFired)return false;
  if(!campaignComplete()||day()<21||RAAdventures.active())return false;
  // User-authorized RC4 window replaces the retired optional momentum gates.
  // Day 25 is the safety boundary; mandatory work is never manufactured or skipped.
  if(!m.fameEligible)RAState.patch('life.momentum.fameEligible',true);
  return true;
 }
 function campaignComplete(){const s=L().newOga;return !!flag('throneDone')&&!!flag('ogunsRaveCompleted')&&!!s.m1Rewarded&&s.mission>=3&&!!s.m4Outcome&&!s.alternativePending&&!!s.m5Completed&&!!s.m6Completed&&!!s.m7Completed&&!!s.m8Resolved&&!!s.m9Resolved&&(!!s.m10Completed||!!s.m9GrantsWithheld)&&!!s.finaleBegun&&!!s.finaleDone;}
 RARC3.campaignComplete=campaignComplete;RARC3.claimsEnding=claimsEnding;
 if(window.RAFame)RAFame.claimsWake=claimsEnding;
 // Old saves already beyond the intended wake recover in the bedroom, even
 // with an unfinished daily job. Never interrupt or abandon an active scene.
 function recoverEnding(){
  if(day()<21||!L().clock.started||!flag('throneDone')||
   window.RAScenes?.current?.()!=='bedroom'||RAAdventures.active())return false;
  if(!claimsEnding())return false;
  window.RAFame.play();return true;
 }
 document.addEventListener('ra:scene',e=>{if(e.detail?.id==='bedroom')setTimeout(recoverEnding,60);});
 // Bank owns the existing property surface; Maps owns adventure discovery. No tenth app.
 const hall=()=>window.RACastle?.ROOMS.find(r=>r.id==='party_hall');
 // Ownership comes before the first authored party: no circular hosting prerequisite.
 if(hall())hall().needs=()=>true;
 function bankMarkup(sub,api){const rent=L().ownership.properties.filter(p=>p.ownershipStatus==='owned').reduce((sum,p)=>sum+(Number(window.RAEcon.rent.perDay[p.id])||Math.round((Number(p.weeklyRent)||0)/7)),0),h=hall(),owned=RALife.hasRoom('party_hall');
  return `<h1>BANK</h1><div class="phone-bank-total"><span>ON HAND</span><strong>${RALife.fmt(RALife.money())}</strong></div><div class="phone-card"><b>RENTAL INCOME</b>${RALife.fmt(rent)} / DAY${L().ownership.properties.some(p=>p.id===RAPropertyQuest.propertyId)?'':api.button('BUY RENTAL · $34,000','do:bank:rental','',RALife.money()<39000?'disabled':'')}</div><div class="phone-card"><b>BIG GOAL · PARTY HALL</b>${owned?`OWNED${api.button('CASTLE PARTY NIGHT','do:bank:party','',RALife.money()<500||flag('partyNight')===day()?'disabled':'')}`:`${RALife.fmt(h.price)}${api.button('BUILD PARTY HALL','do:bank:hall','',RALife.money()<h.price+5000?'disabled':'')}`}</div>`;
 }
 async function partyGo(){if(!RALife.hasRoom('party_hall')||flag('partyNight')===day()||RALife.money()<500)return false;await RAPhone?.close?.();return RAAdventureScene.begin(RAAdventures.isDone('A26')?'HOST':'A26',{from:'rc4-hall'});}
 RARC3.partyGo=partyGo;RARC3.releaseMap=releaseMap;
 for(const id of HALL){const d=RAAdventures.get(id),original=d?.available;if(!d)continue;
  d.available=L=>L.hasRoom('party_hall')&&L.flag('partyNight')!==L.day&&L.money>=500&&(!original||original(L));
  // Keep authored choices/copy. A saved bar receipt makes reload/double dispatch
  // idempotent; cash, tier and next checkpoint persist in one state mutation.
  d.nodes.drinks.choices=d.nodes.drinks.choices.map((c,i)=>({...c,fx:A=>{
   if(A.vars.rc4BarPaid)return;const price=[500,5000,25000][i];if(RALife.money()<price)return;
   const life=JSON.parse(JSON.stringify(L()));life.resources.money-=price;
   life.adventures.active={...life.adventures.active,node:'door',vars:{...life.adventures.active.vars,tier:['cheap','mid','extra'][i],rc4BarPaid:price}};
   RAState.patch('life',life);
  }}));
 }
 const bank=window.RAPhoneApps?.get?.('bank');if(bank){bank.render=(sub,api)=>bankMarkup(sub,api)+api.button('JDM IMPORTS / GARAGE','app:jdmImports');bank.onAction=(act,arg,api)=>{if(act==='rental'&&RALife.money()>=39000)RAPropertyQuest.completePurchase('cut');if(act==='hall'&&RALife.money()>=hall().price+5000)RACastle.buy('party_hall');if(act==='party')return partyGo();api.refresh();};}
 if(window.RACastle){const buy=RACastle.buy;RACastle.buy=id=>id==='party_hall'&&buy(id);RACastle.open=()=>RAPhone.openApp('bank');RACastle.markup=()=>'';}
 const maps=window.RAPhoneApps?.get?.('maps');if(maps)maps.render=(sub,api)=>mapsMarkup(api);
 // The retired MOVES tile is an essential loadout function, folded into Armory.
 const armory=window.RAPhoneApps?.get?.('armory');if(armory){const render=armory.render,action=armory.onAction;
  armory.render=(sub,api)=>{if(sub?.startsWith('move:')){const slot=Number(sub.slice(5));return `<h1>ARMORY · MOVE ${slot+1}</h1>${(window.RAIronMoves?.known?.()||[]).map(id=>api.button(api.esc(RACombatData.MOVES[id].label),`do:armory:moveEquip:${slot}|${id}`)).join('')}${api.button('BACK','app:armory')}`;}
   return render(sub,api)+(window.RAIronMoves?.atHome?.()?`<h2>MOVES</h2>${L().combat.equippedMoves.map((id,i)=>api.button(api.esc(RACombatData.MOVES[id]?.label||id),`app:armory:move:${i}`)).join('')}`:'');};
  armory.onAction=(act,arg,api)=>{if(act==='moveEquip'){const [slot,id]=arg.split('|');window.RAIronMoves?.equip?.(Number(slot),id);api.refresh();return;}return action?.(act,arg,api);};
 }
 const hunter=window.RABtfPeople?.get?.('bllad33');if(hunter)hunter.name='BLAD33EE';
 RACombatData.ENEMIES.blad33ee={name:'BLAD33EE',hp:90,person:'bllad33',boss:true,noRun:true,moves:{slash:{id:'slash',label:'HUNTER SLASH',dmg:12,telegraph:'BLAD33EE REACHES FOR HIS BLADE'}},pattern:['slash'],octopus:{roast:{label:'YOU CAME TO A RAVE IN WORK CLOTHES',result:'skip',turns:1,text:'BLAD33EE CHECKS HIS COAT.'}}};
 // OL-076: cash persists on every host scene. Other meters keep their gameplay state silently.
 if(document.body?.append){document.body.classList.add('rc3');const hud=document.createElement('div');hud.className='rc3-cash';hud.setAttribute('aria-label','Cash');document.body.append(hud);
  const update=()=>{hud.textContent=RALife.fmt(RALife.money());};update();document.addEventListener('ra:state',update);setInterval(update,500);
 }
 // Clear old silent unread badges without deleting messages.
 function silenceThreads(){const threads=L().phone.threads||{};if(Object.values(threads).some(t=>t.some(m=>!m.read)))RAState.patch('life.phone.threads',Object.fromEntries(Object.entries(threads).map(([id,t])=>[id,t.map(m=>({...m,read:true}))])));}
 silenceThreads();const text=RALife.text;RALife.text=function(...args){const result=text(...args);silenceThreads();return result;};
 // One notification, story only. Other messages survive as silent badges in Texts/Bank.
 const mail=RALife.mail;RALife.mail=function(card){return mail({...card,silent:true});};
 const worldPending=RAWorldEvents.pending,deliver=RAWorldEvents.deliver;
 RAWorldEvents.pending=channel=>worldPending(channel).filter(e=>storyEvent(e.id)).slice(0,1);
 RAWorldEvents.deliver=channel=>{const first=RAWorldEvents.pending(channel)[0];if(!first)return [];return deliver(channel).filter(e=>e.id===first.id);};
})();
