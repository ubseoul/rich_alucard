(function(){
 'use strict';
 // OL-074: production routing policy. Content and frozen art remain in the repository.
 const APPS=['vampgpt','texts','warRoom','stripClub','armory','bank','maps','radio','vampgram'];
 // Editorial order: funniest first, then scenes with a strong story/combat payoff.
 const MAPS=['YAM','AUNTIES','FUFU','PLATES','A30','A57','A18','A19','A39','A10','A43','A50','A31','A56','A20','A27','A23','A24','JOLLOF_WARS','A54'];
 const UTILITY=['ARMORY','ARMORY_WALL','A08','SLURP'];
 const MISSIONS=['NEW_OGA_M1','NEW_OGA_M2','NEW_OGA_M3','NEW_OGA_M4','NEW_OGA_ALTERNATIVE','NEW_OGA_M5','NEW_OGA_M6','NEW_OGA_M7','NEW_OGA_M8','NEW_OGA_M9','NEW_OGA_M10','NEW_OGA_VAMPGPT','NEW_OGA_FINALE'];
 const L=()=>RALife.life(),day=()=>RALife.today().day,flag=RALife.flag;
 const read=()=>flag('rc3Day')?.day===day()?flag('rc3Day'):{day:day(),story:!!flag('ogunsRaveCompleted')&&(L().newOga.lastMissionDay===day()||!!L().newOga.finaleDone),action:false,paid:false,moneyBefore:RALife.money()};
 const patch=v=>{const s={...read(),...v};RALife.setFlag('rc3Day',s);return s;};
 const dancer=id=>!!window.RAF15?.parse?.(id);
 function allowed(id){return id==='A00'||id==='RC3_FIGHT'||MISSIONS.includes(id)||MAPS.includes(id)||UTILITY.includes(id)||dancer(id);}
 function canStart(id,from){if(!allowed(id))return false;if(MAPS.includes(id))return from==='rc3-maps'||RAAdventures.active()?.id===id;
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
 function next(){const s=read(),m=pendingMission();let label,kind='story',app='vampgpt';
  if(!flag('throneDone'))label='FINISH THE PROLOGUE';
  else if(!s.story&&!flag('ogunsRaveCompleted'))label="OGUN'S RAVE";
  else if(!s.story&&m&&day()>Number(L().newOga.lastMissionDay||0))label=RAAdventures.get(m)?.title||m;
  else if(!s.story){label='FINISH TODAY’S STORY';kind='story';}
  else if(!s.action){label='FIGHT · PROTECT THE CREW';kind='action';}
  else if(!s.paid){label='COLLECT CASH';kind='cash';app='bank';}
  else if(flag('stripClubLastDay')!==day()){label='STRIP CLUB NIGHT';kind='club';app='stripClub';}
  else {label='SLEEP';kind='rest';app=null;}
  return {id:kind,key:`rc3:${day()}:${label}`,kind,app,label,sub:`${chapter()} · DAY ${day()}`,action:'rc3:next'};
 }
 async function advance(){const n=next();
  if(n.label==='FINISH THE PROLOGUE')return RANewGame.onStart();
  if(n.label==="OGUN'S RAVE"){patch({moneyBefore:RALife.money()});RALife.setFlag('ogunsRaveInvited',true);return RAOgunRave.begin();}
  if(n.kind==='story'){const id=pendingMission();patch({moneyBefore:RALife.money()});await RAPhone?.close?.();return RAAdventureScene.begin(id,{from:'rc3-story'});}
  if(n.kind==='action'){await RAPhone?.close?.();return RAAdventureScene.begin('RC3_FIGHT',{from:'rc3-story'});}
  if(n.kind==='cash'){claimCash();RAPhone?.refresh?.();return true;}
  if(n.kind==='club')return RAStripClub.open(RAPhone?.api);
  if(n.kind==='rest'){await RAPhone?.close?.();return RABedroomLife.goToSleep();}
 }
 // Cuts removed the day-job/Trap income paths. Ensure a story + action day earns the RC2 $15K club reserve.
 // Authored mission income counts toward this floor; one receipt per day prevents repeat/reload farming.
 function claimCash(){const s=read();if(!s.story||!s.action||s.paid)return false;
  const earned=Math.max(0,RALife.money()-(s.moneyBefore??RALife.money()));
  const amount=Math.max(0,15000-earned);if(amount)window.RAMoneyLedger?.credit?RAMoneyLedger.credit(amount,{source:'rc3:story'}):RALife.addMoney(amount);
  patch({paid:true,cash:amount});RAState.recordEvent({id:`rc3:cash:${day()}`,type:'rc3_story_cash',day:day(),amount});return true;
 }
 const canSleep=()=>read().paid&&flag('stripClubLastDay')===day();
 const storyEvent=id=>id==='ogun_rave_invite_001'&&!flag('ogunsRaveCompleted');
 function showMorning(layer,el){const n=next(),wrap=el('div','morning-mail');wrap.style.pointerEvents='auto';
  wrap.append(el('h2',null,`DAY ${day()}`));const b=el('button','mail-card',`<b>${n.label}</b>${chapter()}`);b.type='button';b.addEventListener('click',()=>{wrap.remove();RAPhone.openApp('vampgpt');});
  const up=el('button','mail-done','GET UP');up.type='button';up.addEventListener('click',()=>{wrap.remove();window.RABedroom?.releasePhone?.();});wrap.append(b,up);layer.append(wrap);
 }
 function mapsMarkup(api){return `<h1>MAPS</h1><p class="phone-small">OPTIONAL ADVENTURES · PICK ONE</p>${MAPS.filter(id=>RAAdventures.available(id)).map(id=>api.button(api.esc(RAAdventures.get(id).title),`rc3:map:${id}`)).join('')||'<p>All caught up.</p>'}${api.button('HOME','home','phone-home')}`;}
 async function mapGo(id){if(!MAPS.includes(id)||!RAAdventures.available(id))return false;await RAPhone.close();return RAAdventureScene.begin(id,{from:'rc3-maps'});}
 function phoneRoute(id){return APPS.includes(id);}
 function phoneAction(name){if(name.startsWith('app:'))return phoneRoute(name.split(':')[1]);if(name.startsWith('do:'))return phoneRoute(name.split(':')[1]);
  if(name.startsWith('go:')||name.startsWith('tempt:')||['money','people','jdmImports','realEstate','atlanta','tokyo','letsGo','butterChicken'].includes(name))return false;return true;}
 window.RARC3={apps:APPS,maps:MAPS,missions:MISSIONS,utility:UTILITY,allowed,canStart,pendingMission,chapter,next,advance,read,patch,claimCash,canSleep,storyEvent,showMorning,mapsMarkup,mapGo,phoneRoute,phoneAction};
 // Existing saves get the same nine functional entry points without waiting for another wake.
 for(const id of APPS)RALife.unlockApp(id,{silent:true});RALife.setFlag('armoryKnown',true);
 // The existing app registry stays available to its owners, while only these nine tiles render.
 window.RAPhoneRegistry?.sync?.();
 // The phone's closure consults life app unlocks. Unlock essentials at the first story wake.
 RAClock.onWake('rc3-apps',998,()=>{for(const id of APPS)RALife.unlockApp(id,{silent:true});RALife.setFlag('armoryKnown',true);patch({moneyBefore:RALife.money()});});
 const ack=new Set();window.RAGuidance={next,story:()=>[next()],cash:()=>[],spend:()=>[],recommended:()=>[next()],steps:()=>['prologue','rave',...MISSIONS,'fight','cash','club','sleep'],
  opened:id=>ack.add(`${day()}:${id}:${next().key}`),target:()=>{const n=next();return n.app&&!ack.has(`${day()}:${n.app}:${n.key}`)?{app:n.app,key:n.key,item:n}:null;},pulsing:id=>{const t=window.RAGuidance.target();return t?.app===id;}};
 // Optional scenes no longer need completion of a cut adventure to appear in Maps.
 for(const id of MAPS){const d=RAAdventures.get(id);if(d)d.available=()=>true;}
 for(const id of MISSIONS){const d=RAAdventures.get(id);if(d)d.available=()=>flag('ogunsRaveCompleted')&&!read().story&&pendingMission()===id&&day()>Number(L().newOga.lastMissionDay||0);}
 const prologue=RAAdventures.get('A00');if(prologue){prologue.nodes.fall1.next='sensei_point';prologue.nodes.sensei_point.next='brain_offer';prologue.nodes.brain_done.next='fork';}
 // Preserve the main ladder: remove early arc-ending choices.
 const m1=RAAdventures.get('NEW_OGA_M1'),m2=RAAdventures.get('NEW_OGA_M2');
 if(m1){m1.nodes.pitch.choices=m1.nodes.pitch.choices.filter(c=>c.next!=='nah');m1.nodes.table.choices=m1.nodes.table.choices.filter(c=>c.next!=='leave');}
 if(m2)m2.nodes.debt.choices=m2.nodes.debt.choices.filter(c=>c.next==='work');
 // A vehicle is no longer a shopping prerequisite. Gbenga supplies transport for this assignment.
 const m4=RAAdventures.get('NEW_OGA_M4');if(m4){m4.nodes.beat3.lines=[RAContent.N("Gbenga's rental van heads toward Koreatown.")];m4.nodes.run.lines=[RAContent.N("Carlos runs. Rich follows in Gbenga's rental van, making the escape look close.")];}
 const m9=RAAdventures.get('NEW_OGA_M9');if(m9){for(const c of m9.nodes.choice.choices)if(c.next==='give')c.when=()=>RALife.ownedCars().length>0;}
 // A short mandatory crew fight fills dialogue-only days. Existing fighter/art/rules; no optional outing is pushed.
 RAAdventures.define({id:'RC3_FIGHT',title:'PROTECT THE CREW',lane:'combat',repeatable:true,available:()=>!read().action,start:'brief',nodes:{
  brief:{env:'street_night',actors:{left:'rich',right:'smallie_cousin'},lines:[RAContent.N("Gbenga's delivery is blocked. Clear the street.")],next:'fight'},
  fight:{fight:{enemy:'smallie_cousin',params:{env:'street_night'},win:'done',lose:'retry',run:'retry'}},
  retry:{lines:[RAContent.N('The street is still blocked.')],choices:[{label:'TRY AGAIN',next:'fight'}]},
  done:{end:{outcome:'win',memory:{text:'cleared the street for the crew',lane:'combat'}}}
 }});
 // Count real successful fights/PLAYs, including those inside the authored mission.
 const afterFight=RAAdventures.afterFight,afterPlay=RAAdventures.afterMinigame;
 RAAdventures.afterFight=function(node,result){if(MISSIONS.includes(RAAdventures.active()?.id)||RAAdventures.active()?.id==='RC3_FIGHT')if(['win','spared'].includes(result?.outcome))patch({action:true});return afterFight(node,result);};
 RAAdventures.afterMinigame=function(node,result){if(MISSIONS.includes(RAAdventures.active()?.id)&&!result?.quit&&!result?.error&&!['lose','fail','cancel'].includes(result?.outcome))patch({action:true});return afterPlay(node,result);};
 document.addEventListener('ra:adventure-complete',e=>{if(MISSIONS.includes(e.detail?.id))patch({story:true});});
 document.addEventListener('ra:scene',e=>{if(e.detail?.id==='bedroom'){
  if(flag('ogunsRaveCompleted')&&!flag('rc3RaveRecorded')){RALife.setFlag('rc3RaveRecorded',true);patch({story:true});}
  if(day()===1&&flag('throneDone'))patch({action:true});
 }});
 // Cut runs in an old save cannot resume through the bedroom, and old automatic follow-ups are retired.
 const active=RAAdventures.active();if(active&&!allowed(active.id)){RAAdventures.abandon();RAState.patch('life.clock.returnBeat',null);}
 RALife.setFlag('wakeTrigger',null);RAState.patch('life.temptations.live',[]);
 RALife.setFlag('onlyvamps_subs',[]);if(window.RAFame)RAFame.claimsWake=()=>false;
 // Bank owns the existing property surface; Maps owns adventure discovery. No tenth app.
 const hall=()=>window.RACastle?.ROOMS.find(r=>r.id==='party_hall');
 // A26 is cut. The savings goal must not require hosting that retired adventure.
 if(hall())hall().needs=()=>true;
 function bankMarkup(sub,api){const rent=L().ownership.properties.filter(p=>p.ownershipStatus==='owned').reduce((sum,p)=>sum+(Number(window.RAEcon.rent.perDay[p.id])||Math.round((Number(p.weeklyRent)||0)/7)),0),h=hall(),owned=RALife.hasRoom('party_hall');
  return `<h1>BANK</h1><div class="phone-bank-total"><span>ON HAND</span><strong>${RALife.fmt(RALife.money())}</strong></div><div class="phone-card"><b>RENTAL INCOME</b>${RALife.fmt(rent)} / DAY${L().ownership.properties.some(p=>p.id===RAPropertyQuest.propertyId)?'':api.button('BUY RENTAL · $34,000','do:bank:rental','',RALife.money()<39000?'disabled':'')}</div><div class="phone-card"><b>BIG GOAL · PARTY HALL</b>${owned?'BUILT':`${RALife.fmt(h.price)}${api.button('BUILD PARTY HALL','do:bank:hall','',RALife.money()<h.price+5000?'disabled':'')}`}</div>`;
 }
 const bank=window.RAPhoneApps?.get?.('bank');if(bank){bank.render=bankMarkup;bank.onAction=(act,arg,api)=>{if(act==='rental'&&RALife.money()>=39000)RAPropertyQuest.completePurchase('cut');if(act==='hall'&&RALife.money()>=hall().price+5000)RACastle.buy('party_hall');api.refresh();};}
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
 // One notification, story only. Other messages survive as silent badges in Texts/Bank.
 const mail=RALife.mail;RALife.mail=function(card){return mail({...card,silent:true});};
 const worldPending=RAWorldEvents.pending,deliver=RAWorldEvents.deliver;
 RAWorldEvents.pending=channel=>worldPending(channel).filter(e=>storyEvent(e.id)).slice(0,1);
 RAWorldEvents.deliver=channel=>{const first=RAWorldEvents.pending(channel)[0];if(!first)return [];return deliver(channel).filter(e=>e.id===first.id);};
})();
