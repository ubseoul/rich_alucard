(function(){
 // THE PHONE — RICH'S LIFE OS (VOL 1 §7). Preserves the approved Phone + VampGPT v0.1 flow, the canon seven
 // home icons, world-event INCOMING delivery, and JDMIMPORTS / RealMoneyRealEstate delegation. New apps register
 // through RAPhoneApps and appear only when life unlocks them. Canon icons that are not unlocked yet answer with
 // an in-world line instead of a dead "NOT SET UP YET."
 const overlay=document.querySelector('#phoneOverlay'),content=document.querySelector('#phoneContent'),entry=document.querySelector('#checkPhone');
 const CANON=[['VampGPT','vampgpt'],['VampGram','vampgram'],['InstaHoe','instahoe'],['RealMoneyRealEstate','realEstate'],['JDMIMPORTS','jdmImports'],['RICHBOIMPORTS','richboi'],['ONLYVAMPS','onlyvamps']];
 const registry=new Map();
 let page='home',opened=false,phoneScope=null,closePromise=null,closeSceneExitCleanup=null,history=[];
 const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const cash=()=>new Intl.NumberFormat('en-US').format(window.RABudget?.balance?.()??window.RAState.get().life.resources.money);
 const state=()=>window.RAState.get();
 function updateEntry(){if(!entry)return;const learned=!!state().life.phone.learned;entry.textContent=learned?'☎':'☎ CHECK PHONE';entry.classList.toggle('learned',learned);entry.setAttribute('aria-label',learned?'Open phone':'Check phone');const unread=unreadCount();entry.classList.toggle('has-unread',unread>0);entry.dataset.unread=unread||'';}
 function button(label,action,cls='',extra=''){return `<button type="button" class="phone-button ${cls}" data-phone-action="${esc(action)}" ${extra}>${label}</button>`}
 function opportunities(){return window.RAOpportunities?.list('go_somewhere')||[]}
 function incoming(){return window.RAWorldEvents?.pending?.('phone')||[]}
 function incomingCard(){const events=incoming();if(!events.length)return '';return `<section class="phone-incoming"><p class="phone-incoming-kicker">INCOMING</p>${events.map(event=>button(`${event.sender||'UNKNOWN'}<br><small>${event.subject||'MESSAGE'}</small>`,`openWorldEvent:${event.id}`,'incoming-button')).join('')}</section>`}
 // ---- app registry ----
 function register(app){registry.set(app.id,{canon:false,order:50,...app});}
 const appLabel=id=>registry.get(id)?.label||CANON.find(c=>c[1]===id)?.[0]||id;
 function isUnlocked(id){if(id==='vampgpt'||id==='realEstate'||id==='jdmImports')return true;return !!window.RALife?.appUnlocked?.(id);}
 function unreadCount(){try{const threads=state().life.phone.threads||{};let n=0;for(const t of Object.values(threads))n+=t.filter(m=>!m.read&&m.from!=='RICH').length;return n;}catch(e){return 0}}
 function badge(id){const app=registry.get(id);const n=app?.badge?.()||0;return n?` <i class="phone-badge">${n}</i>`:''}
 function header(){
  if(!window.RALife)return '';const i=RALife.today();const radio=window.RARadio?.miniPlayer?.()||'';
  return `<div class="phone-status"><span>$${cash()}</span><span>${i.weekday.slice(0,3)} ${i.dateLabel}</span></div>${radio}`;
 }
 // Frozen ART SHIP 006 app icons (24×24, no baked text: the label stays UI text) by runtime app id → Art Registry id.
 // PICKUP has no phone app at runtime and RICHBOIMPORTS has no approved icon; both stay text-only.
 const APP_ICON={texts:'texts',hatch:'hatch',touge:'touge',bars:'bars',radio:'rich_radio',receipts:'receipts',vampgpt:'vampgpt',jdmImports:'jdmimports'};
 function icon(id){const src=window.RAArtRegistry?.ui?.apps?.[APP_ICON[id]];return src?`<img class="phone-app-icon" src="${esc(src)}" alt="" width="24" height="24" draggable="false">`:''}
 function lockMeta(id){return window.RAPhoneHierarchy?.lockFor?.(id,registry.get(id))||{short:'LOCKED',line:registry.get(id)?.lockedLine||CANON_LOCKED[id]||'not yet.'};}
  function appButton(id,label,isCanon){
   const unlocked=isUnlocked(id),lock=unlocked?null:lockMeta(id);
   const cls=`app-button${isCanon?'':' app-extra'}${unlocked?'':' app-dormant'}`;
   const sub=unlocked?badge(id):`<small class="phone-lock-short">LOCKED · ${esc(lock.short)}</small>`;
   const extra=unlocked?'':`data-locked="1" aria-label="${esc(label)} — locked: ${esc(lock.short)}"`;
   return button(`${icon(id)}${label}${sub}`,`app:${id}`,cls,extra);
  }
  function homeMarkup(){
   const entries=CANON.map(([name,id])=>({id,label:name,canon:true}));
   for(const a of [...registry.values()].filter(x=>!x.canon&&isUnlocked(x.id)).sort((a,b)=>a.order-b.order))entries.push({id:a.id,label:a.label,canon:false});
   const hierarchy=window.RAPhoneHierarchy;
   const sections=hierarchy?.sections?.()||[{id:'life',label:'APPS'}];
   const groups=new Map(sections.map(s=>[s.id,[]]));
   for(const entry of entries){const key=hierarchy?.sectionFor?.(entry.id,registry.get(entry.id))||'life';(groups.get(key)||groups.get('life')).push(entry);}
   const grid=sections.map(section=>{const items=groups.get(section.id)||[];if(!items.length)return '';return `<p class="phone-section-label" data-phone-section="${esc(section.id)}">${esc(section.label)}</p>`+items.map(e=>appButton(e.id,e.label,e.canon)).join('');}).join('');
   return `${header()}<h1>PHONE</h1>${incomingCard()}<div class="phone-app-grid">${grid}</div><div class="phone-message" aria-live="polite"></div>${button('CLOSE PHONE','close','phone-close-button')}`;
  }
 // ---- VampGPT (canon flow + WHAT WE ON + the three lanes) ----
 function whatWeOn(){
  const lines=window.RATemptations?.whatWeOn?.()||[];if(!lines.length)return '';
  return `<div class="phone-wwo"><p class="phone-speaker">WHAT WE ON</p>${lines.map(t=>button(esc(t.line),`tempt:${t.id}`,'wwo-line')).join('')}</div>`;
 }
 function laneOptions(lane){return window.RAVampGPT?.lane?.(lane)||[];}
 function render(){
  if(!content)return;
  const s=state(),r=s.life.resources,w=s.life.world;
  if(page==='home'){content.innerHTML=homeMarkup();}
  else if(page==='vampgpt'){
   content.innerHTML=`<h1>VAMPGPT</h1><div class="phone-chat"><p class="phone-speaker">VAMPGPT</p><p>yo rich<br>what we on</p>${whatWeOn()}${button('OGA WHAT DO I DO','prompt','suggested-prompt')}</div>${button('HOME','home','phone-back')}`;
  }else if(page==='options'){
   content.innerHTML=`<h1>VAMPGPT</h1><div class="phone-chat"><p class="phone-speaker">RICH</p><p>oga what do i do</p><p class="phone-speaker">VAMPGPT</p><p>you got $${cash()}.<br>you in ${esc(w.location)}.<br>clout still ${String(r.clout).toLowerCase()}.<br>we got options though.</p><div class="phone-option-list">${button('MAKE MONEY','money')}${button('MEET PEOPLE','people')}${button('GO SOMEWHERE','somewhere')}</div><div class="phone-message" aria-live="polite"></div></div>${button('HOME','home','phone-back')}`;
  }else if(page==='money'||page==='people'){
   const opts=laneOptions(page);
   content.innerHTML=`<h1>VAMPGPT</h1><div class="phone-chat"><p class="phone-speaker">RICH</p><p>${page==='money'?'how i make money':'i wanna meet people'}</p><p class="phone-speaker">VAMPGPT</p><p>${esc(window.RAVampGPT?.laneIntro?.(page)||'ok. options.')}</p><div class="phone-option-list">${opts.map(o=>button(`${esc(o.label)}${o.sub?`<br><small>${esc(o.sub)}</small>`:''}`,`go:${o.go}`,o.octopus?'octo-option':'')).join('')||'<p>nothing yet. give it a day.</p>'}</div></div>${button('BACK','options','phone-back')}${button('HOME','home','phone-home')}`;
  }else if(page==='somewhere'){
   const places=window.RAPlaces?.visible?.()||[];
   const options=opportunities();
   const available=options.filter(o=>o.available),locked=options.filter(o=>!o.available);
   const destLockShort=o=>{const f=(o.failures||[]).join(' '),m=String(o.lockedMessage||'').toLowerCase();if(/money/.test(f))return 'NEED CASH';if(/clout/.test(f)||/clout/.test(m))return 'NEED CLOUT';if(/location/.test(f))return 'NOT HERE';if(/contact/.test(f))return 'NO CONTACT';if(/relationship/.test(f))return 'NOT CLOSE';return 'LOCKED';};
   const destination=(o,unlocked)=>button(`${o.label}<br><small>${unlocked?'AVAILABLE':`LOCKED · ${esc(destLockShort(o))}`}</small>`,o.id,unlocked?'destination-available':'destination-locked',unlocked?'':'data-locked="1"');
   const groups=[];
   if(available.length)groups.push(`<p class="phone-section-label" data-phone-section="go-available">AVAILABLE</p>${available.map(o=>destination(o,true)).join('')}`);
   if(places.length)groups.push(`<p class="phone-section-label" data-phone-section="go-open">OPEN NOW</p>${places.map(p=>button(`${esc(p.label)}<br><small>${esc(p.sub||'AVAILABLE')}</small>`,`go:${p.id}`,'destination-available')).join('')}`);
   if(locked.length)groups.push(`<p class="phone-section-label" data-phone-section="go-locked">LOCKED</p>${locked.map(o=>destination(o,false)).join('')}`);
   content.innerHTML=`<h1>VAMPGPT</h1><div class="phone-chat"><p>where you tryna go</p><div class="phone-option-list">${groups.join('')||'<p>nothing yet.</p>'}</div><div class="phone-message" aria-live="polite"></div></div>${button('BACK','options','phone-back')}${button('HOME','home','phone-home')}`;
  }else if(page==='settings'){
   const a=window.RAAudio?.settings?.()||{music:1,sfx:1,ambience:1,muted:false,haptics:true};
   const slider=(bus,label,value)=>`<label class="phone-setting"><span>${label}</span><input type="range" min="0" max="100" step="5" value="${Math.round(value*100)}" data-audio-bus="${bus}" aria-label="${label} volume"></label>`;
   content.innerHTML=`<h1>AUDIO</h1><div class="phone-card phone-settings">${slider('MUSIC','MUSIC',a.music)}${slider('SFX','SFX',a.sfx)}${slider('AMBIENCE','AMBIENCE',a.ambience)}${button(a.muted?'UNMUTE':'MUTE','toggleMute','phone-toggle-mute')}<label class="phone-setting phone-toggle"><span>HAPTICS</span><input type="checkbox" data-audio-toggle="haptics" ${a.haptics?'checked':''}></label></div><div class="phone-message" aria-live="polite"></div>`;
  }else if(page==='ogunRaveIntro'){
   content.innerHTML=`<h1>VAMPGPT</h1><div class="phone-chat"><p class="phone-speaker">VAMPGPT</p><p>ogun's rave.<br>meatpacking district.<br>you already got the invite.</p><p class="phone-speaker">RICH</p><p>say less</p></div><div class="phone-trip-choice">${button("LET'S GO",'ogunRaveGo')}${button('NAH','nah')}</div>${button('BACK','somewhere','phone-back')}`;
  }else if(page==='butterChicken'){
   content.innerHTML=`<h1>VAMPGPT</h1><div class="phone-chat"><p class="phone-speaker">VAMPGPT</p><p>you could go get butter chicken</p><p class="phone-speaker">RICH</p><p>where</p><p class="phone-speaker">VAMPGPT</p><p>powder springs<br>outside atlanta</p><p class="phone-speaker">RICH</p><p>bet</p></div><div class="phone-trip-choice">${button("LET'S GO",'letsGo')}${button('NAH','nah')}</div>${button('BACK','somewhere','phone-back')}`;
  }else if(page==='jdmImports'){
   content.innerHTML=(window.RACars?.jdmMarkup?.()||window.RAJDMImports?.storeMarkup?.()||`<h1>JDMIMPORTS</h1><p>NOT SET UP YET.</p>`);
  }else if(page==='realEstate'){
   content.innerHTML=(window.RARealEstate?.markup?.()||window.RAPropertyQuest?.storeMarkup?.()||`<h1>REALMONEYREALESTATE</h1><p>NOT SET UP YET.</p>`);
  }else if(page.startsWith('worldEvent:')){
   const id=page.slice('worldEvent:'.length),event=window.RAWorldEvents?.byId?.(id);
   if(!event){page='home';render();return}
   window.RAWorldEvents?.see?.(id);
   content.innerHTML=`<h1>${event.sender||'INCOMING'}</h1><div class="phone-chat phone-incoming-message"><p class="phone-speaker">${event.sender||'UNKNOWN'}</p><p>${event.body}</p></div><div class="phone-option-list">${(event.actions||[]).map(action=>button(action.label,`resolveWorldEvent:${event.id}:${action.id}`)).join('')}</div>${button('HOME','home','phone-back')}`;
  }else if(page.startsWith('app:')){
   const [,id,...rest]=page.split(':');const app=registry.get(id);
   if(!app||!isUnlocked(id)){page='home';render();return;}
   content.innerHTML=`${app.render?.(rest.join(':'),api)||`<h1>${esc(app.label)}</h1>`}${app.noNav?'':`<div class="phone-nav">${rest.length?button('BACK',`app:${id}`,'phone-back'):''}${button('HOME','home','phone-home')}</div>`}`;
  }
  content.scrollTop=0;
  window.RAPhoneStyles?.();
 }
 function setMessage(text){const target=content.querySelector('.phone-message');if(target)target.textContent=text;}
 function showPhone(){
  if(opened||document.body.classList.contains('bedroom-mode')===false)return;
  window.RAWorldEvents?.deliver?.('phone');
  opened=true;phoneScope=window.RAScenes?.currentScope?.()?.child('phone-overlay')||window.RAScenes?.createScope?.('phone-overlay');closeSceneExitCleanup=null;page='home';window.RABedroom?.holdForPhone?.();window.RAState.patch('life.phone.learned',true);updateEntry();
  overlay.setAttribute('aria-hidden','false');overlay.classList.remove('closing');overlay.classList.add('open');render();
  window.RAAudio?.sfx?.('PHONE_OPEN');if(incoming().length)window.RAAudio?.sfx?.('NOTIF_GENERIC');
  phoneScope?.timeout(()=>document.querySelector('#phoneClose')?.focus({preventScroll:true}),240);
 }
 function openApp(id,sub=''){if(!opened)showPhone();if(!opened)return false;if(id==='vampgpt'||id==='realEstate'||id==='jdmImports'){page=id;}else page=`app:${id}${sub?`:${sub}`:''}`;render();return true;}
 function closePhone(){
  if(!opened)return Promise.resolve(false);if(closePromise)return closePromise;
  overlay.classList.remove('open');overlay.classList.add('closing');overlay.setAttribute('aria-hidden','true');
  const scope=phoneScope;
  closePromise=new Promise(resolve=>{
   let settled=false;
   const finish=ok=>{
    if(settled)return;settled=true;
    closeSceneExitCleanup?.();closeSceneExitCleanup=null;
    overlay.classList.remove('closing');
    opened=false;phoneScope=null;closePromise=null;
    window.RAAudio?.sfx?.('PHONE_CLOSE');
    window.RABedroom?.releasePhone?.();entry?.focus({preventScroll:true});updateEntry();
    scope?.cancel?.();
    resolve(ok);
   };
   if(!scope?.isActive?.()){finish(false);return}
   scope.timeout(()=>finish(true),230);
   closeSceneExitCleanup=scope.cleanup(()=>finish(false));
  });
  // An already-cancelled scene scope can settle synchronously inside the Promise constructor.
  // Clear that settled handle after assignment so a later phone visit can close normally.
  const pending=closePromise;pending.then(()=>{if(closePromise===pending)closePromise=null;});return pending;
 }
 const api={go(p){page=p;render();},refresh:render,close:closePhone,message:setMessage,button,esc,
  async begin(adventureId,opts={}){if(!window.RAAdventures?.available(adventureId)){setMessage('not tonight.');return false;}await closePhone();return RAAdventureScene.begin(adventureId,{from:'phone',...opts});},
  async launch(minigameId,params={},after){await closePhone();const result=await RAMinigames.launch(minigameId,params);window.RALifeRewards?.apply?.(result);if(after)after(result);return result;}};
 async function action(name){
  if(name==='close'){closePhone();return}if(name==='home'){page='home';render();return}if(name==='vampgpt'){page='vampgpt';render();return}if(name==='prompt'){page='options';render();return}if(name==='somewhere'){page='somewhere';render();return}if(name==='options'){page='options';render();return}if(name==='jdmImports'){page='jdmImports';render();return}if(name==='realEstate'){page='realEstate';render();return}
  if(name==='settings'){window.RAAudio?.sfx?.('UI_CONFIRM');page='settings';render();return}
  if(name==='toggleMute'){window.RAAudio?.toggleMuted?.();window.RAAudio?.sfx?.('UI_CONFIRM');render();return}
  if(name.startsWith('openWorldEvent:')){page=`worldEvent:${name.slice('openWorldEvent:'.length)}`;render();return}
  if(name.startsWith('resolveWorldEvent:')){const [,id,actionId]=name.split(':');window.RAWorldEvents?.resolve?.(id,actionId);page='home';render();return}
  if(name.startsWith('tempt:')){const id=name.slice(6);const t=(window.RATemptations?.whatWeOn?.()||[]).find(x=>x.id===id);if(!t)return;
   if(t.adventure){if(!window.RAAdventures?.available(t.adventure)){window.RATemptations.take(id);render();return}await closePhone();await window.RATemptations.act(id);return}
   window.RATemptations.take(id);const ok=await window.RAPlaces?.go?.(t.action,api);if(ok===false)setMessage('not tonight.');return}
  if(name.startsWith('go:')){const id=name.slice(3);const ok=await window.RAPlaces?.go?.(id,api);if(ok===false){setMessage('not tonight.');}return}
  if(name.startsWith('app:')){const [,id,...rest]=name.split(':');
   if(!isUnlocked(id)){const lock=lockMeta(id);window.RAAudio?.sfx?.('UI_ERROR');setMessage(lock.line);return}
   window.RAAudio?.sfx?.('PHONE_APP_OPEN');
   if(id==='vampgpt'||id==='realEstate'||id==='jdmImports'){page=id;render();return}
   page=`app:${id}${rest.length?':'+rest.join(':'):''}`;render();return}
  if(name.startsWith('do:')){const [,id,act,...args]=name.split(':');const app=registry.get(id);if(app?.onAction){await app.onAction(act,args.join(':'),api);}return}
  if(name==='money'||name==='people'){page=name;render();return}
  if(name==='atlanta'){const option=window.RAOpportunities?.get('atlanta');if(option?.available&&option.action?.type==='dialogue'&&option.action.id==='butter_chicken'){page='butterChicken';render()}return}
  if(name==='tokyo'){const option=window.RAOpportunities?.get('tokyo');if(!option?.available){window.RAAudio?.sfx?.('UI_ERROR');setMessage(window.RALife&&RALife.rep()>=2?'almost. not yet.':(option?.lockedMessage||"tokyo vampires don't fw you yet. get your clout up."));}else window.RAAudio?.sfx?.('UI_CONFIRM');return}
  if(name==='ogun_rave'){const option=window.RAOpportunities?.get('ogun_rave');if(option?.available&&option.action?.type==='dialogue'&&option.action.id==='ogun_rave_intro'){page='ogunRaveIntro';render()}return}
  if(name==='nah'){page='somewhere';render();return}
  if(name==='letsGo'){
   const trip=window.RADesireTrips?.createTrip(window.RADesireTripPresentation?.firstTrip||{});if(!trip)return;
   window.RAClock?.logOuting?.({type:'desire',id:'butter_chicken'});
   closePhone().then(ok=>{if(ok)window.RADesireTrips.beginTravel()});return;
  }
  if(name==='ogunRaveGo'){window.RAClock?.logOuting?.({type:'night',id:'ogun_rave_001'});closePhone().then(ok=>{if(ok)window.RAOgunRave?.begin?.()});return}
  if(name==='unavailable')setMessage('NOT SET UP YET.');
 }
 const CANON_LOCKED={vampgram:'nobody tagged you yet.',instahoe:'you not on there yet. somebody gotta dm you first.',richboi:"you not on the list. yet.",onlyvamps:'invite only.'};
 document.addEventListener('DOMContentLoaded',()=>{
  updateEntry();document.addEventListener('ra:scene',e=>{if(e.detail?.id==='bedroom')updateEntry()});
  entry?.addEventListener('click',showPhone);
  document.addEventListener('ra:scene',e=>{if(e.detail?.id!=='bedroom'&&opened)closePhone()});
  document.querySelector('#phoneClose')?.addEventListener('click',e=>{if(e)e.__raSfxHandled=true;closePhone();});
  overlay?.addEventListener('click',e=>{const jdm=e.target.closest('[data-jdm-action]');if(jdm){window.RAJDMImports?.action(jdm.dataset.jdmAction);return}const property=e.target.closest('[data-property-action]');if(property){window.RAPropertyQuest?.action(property.dataset.propertyAction);return}const target=e.target.closest('[data-phone-action]');if(!target||target.disabled)return;const act=target.dataset.phoneAction;if(/^(app:|settings$|toggleMute$|tokyo$|close$)/.test(act))e.__raSfxHandled=true;action(act)});
  overlay?.addEventListener('input',e=>{const bus=e.target?.dataset?.audioBus;if(bus)window.RAAudio?.setVolume?.(bus,Number(e.target.value)/100);if(e.target?.dataset?.audioToggle==='haptics')window.RAAudio?.setHaptics?.(e.target.checked);});
  document.querySelector('#devResetPhone')?.addEventListener('click',()=>{window.RAState.patch('life.resources.money',100000);window.RAState.patch('life.world.location','LA');window.RAState.patch('life.resources.clout','LOW');window.RAState.patch('life.phone.learned',false);page='home';if(opened)closePhone();updateEntry();entry?.focus({preventScroll:true});});
  document.addEventListener('keydown',e=>{if(opened&&e.key==='Escape')closePhone()});
 });
 // unregister (IF-1, additive): lets RAPhoneRegistry retract a flag-gated app when its feature flag goes OFF.
 window.RAPhoneApps={register,unregister:id=>registry.delete(id),get:id=>registry.get(id)||null,label:appLabel,isUnlocked,list:()=>[...registry.values()]};
 window.RAPhone={open:showPhone,close:closePhone,openApp,home(){page='home';render()},refresh:render,reset(){window.RAState.patch('life.phone.learned',false);updateEntry()},isOpen:()=>opened,apps:CANON.map(([name])=>name),api,page:()=>page,updateEntry};
})();
