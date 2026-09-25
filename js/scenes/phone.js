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
 function homeMarkup(){
  const extras=[...registry.values()].filter(a=>!a.canon&&isUnlocked(a.id)).sort((a,b)=>a.order-b.order);
  const canon=CANON.map(([name,id])=>button(`${icon(id)}${name}${badge(id)}`,`app:${id}`,`app-button${isUnlocked(id)?'':' app-dormant'}`)).join('');
  const more=extras.map(a=>button(`${icon(a.id)}${a.label}${badge(a.id)}`,`app:${a.id}`,'app-button app-extra')).join('');
  return `${header()}<h1>PHONE</h1>${incomingCard()}<div class="phone-app-grid">${canon}${more}</div><div class="phone-message" aria-live="polite"></div>${button('CLOSE PHONE','close','phone-close-button')}`;
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
   content.innerHTML=`<h1>VAMPGPT</h1><div class="phone-chat"><p>where you tryna go</p><div class="phone-option-list">${opportunities().map(o=>button(`${o.label}<br><small>${o.available?'AVAILABLE':'LOCKED'}</small>`,o.id,o.available?'destination-available':'destination-locked')).join('')}${places.map(p=>button(`${esc(p.label)}<br><small>${esc(p.sub||'AVAILABLE')}</small>`,`go:${p.id}`,'destination-available')).join('')}</div><div class="phone-message" aria-live="polite"></div></div>${button('BACK','options','phone-back')}${button('HOME','home','phone-home')}`;
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
    window.RABedroom?.releasePhone?.();entry?.focus({preventScroll:true});updateEntry();
    scope?.cancel?.();
    resolve(ok);
   };
   if(!scope?.isActive?.()){finish(false);return}
   scope.timeout(()=>finish(true),230);
   closeSceneExitCleanup=scope.cleanup(()=>finish(false));
  });
  return closePromise;
 }
 const api={go(p){page=p;render();},refresh:render,close:closePhone,message:setMessage,button,esc,
  async begin(adventureId,opts={}){if(!window.RAAdventures?.available(adventureId)){setMessage('not tonight.');return false;}await closePhone();return RAAdventureScene.begin(adventureId,{from:'phone',...opts});},
  async launch(minigameId,params={},after){await closePhone();const result=await RAMinigames.launch(minigameId,params);window.RALifeRewards?.apply?.(result);if(after)after(result);return result;}};
 async function action(name){
  if(name==='close'){closePhone();return}if(name==='home'){page='home';render();return}if(name==='vampgpt'){page='vampgpt';render();return}if(name==='prompt'){page='options';render();return}if(name==='somewhere'){page='somewhere';render();return}if(name==='options'){page='options';render();return}if(name==='jdmImports'){page='jdmImports';render();return}if(name==='realEstate'){page='realEstate';render();return}
  if(name.startsWith('openWorldEvent:')){page=`worldEvent:${name.slice('openWorldEvent:'.length)}`;render();return}
  if(name.startsWith('resolveWorldEvent:')){const [,id,actionId]=name.split(':');window.RAWorldEvents?.resolve?.(id,actionId);page='home';render();return}
  if(name.startsWith('tempt:')){const id=name.slice(6);const t=(window.RATemptations?.whatWeOn?.()||[]).find(x=>x.id===id);if(!t)return;
   if(t.adventure){if(!window.RAAdventures?.available(t.adventure)){window.RATemptations.take(id);render();return}await closePhone();await window.RATemptations.act(id);return}
   window.RATemptations.take(id);const ok=await window.RAPlaces?.go?.(t.action,api);if(ok===false)setMessage('not tonight.');return}
  if(name.startsWith('go:')){const id=name.slice(3);const ok=await window.RAPlaces?.go?.(id,api);if(ok===false){setMessage('not tonight.');}return}
  if(name.startsWith('app:')){const [,id,...rest]=name.split(':');
   if(id==='vampgpt'||id==='realEstate'||id==='jdmImports'){page=id;render();return}
   if(!isUnlocked(id)){setMessage(registry.get(id)?.lockedLine||CANON_LOCKED[id]||'not yet.');return}
   page=`app:${id}${rest.length?':'+rest.join(':'):''}`;render();return}
  if(name.startsWith('do:')){const [,id,act,...args]=name.split(':');const app=registry.get(id);if(app?.onAction){await app.onAction(act,args.join(':'),api);}return}
  if(name==='money'||name==='people'){page=name;render();return}
  if(name==='atlanta'){const option=window.RAOpportunities?.get('atlanta');if(option?.available&&option.action?.type==='dialogue'&&option.action.id==='butter_chicken'){page='butterChicken';render()}return}
  if(name==='tokyo'){const option=window.RAOpportunities?.get('tokyo');if(!option?.available)setMessage(window.RALife&&RALife.rep()>=2?'almost. not yet.':(option?.lockedMessage||"tokyo vampires don't fw you yet. get your clout up."));return}
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
  document.querySelector('#phoneClose')?.addEventListener('click',closePhone);
  overlay?.addEventListener('click',e=>{const jdm=e.target.closest('[data-jdm-action]');if(jdm){window.RAJDMImports?.action(jdm.dataset.jdmAction);return}const property=e.target.closest('[data-property-action]');if(property){window.RAPropertyQuest?.action(property.dataset.propertyAction);return}const target=e.target.closest('[data-phone-action]');if(target&&!target.disabled)action(target.dataset.phoneAction)});
  document.querySelector('#devResetPhone')?.addEventListener('click',()=>{window.RAState.patch('life.resources.money',100000);window.RAState.patch('life.world.location','LA');window.RAState.patch('life.resources.clout','LOW');window.RAState.patch('life.phone.learned',false);page='home';if(opened)closePhone();updateEntry();entry?.focus({preventScroll:true});});
  document.addEventListener('keydown',e=>{if(opened&&e.key==='Escape')closePhone()});
 });
 window.RAPhoneApps={register,get:id=>registry.get(id)||null,label:appLabel,isUnlocked,list:()=>[...registry.values()]};
 window.RAPhone={open:showPhone,close:closePhone,openApp,home(){page='home';render()},refresh:render,reset(){window.RAState.patch('life.phone.learned',false);updateEntry()},isOpen:()=>opened,apps:CANON.map(([name])=>name),api,page:()=>page,updateEntry};
})();
