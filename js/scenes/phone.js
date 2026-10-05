(function(){
 // THE PHONE — RICH'S LIFE OS (VOL 1 §7). Preserves the approved Phone + VampGPT v0.1 flow, the canon seven
 // home icons, world-event INCOMING delivery, and JDMIMPORTS / RealMoneyRealEstate delegation. New apps register
 // through RAPhoneApps and appear only when life unlocks them. Canon icons that are not unlocked yet answer with
 // an in-world line instead of a dead "NOT SET UP YET."
 const overlay=document.querySelector('#phoneOverlay'),content=document.querySelector('#phoneContent'),entry=document.querySelector('#checkPhone');
 const CANON=[['VampGPT','vampgpt'],['VampGram','vampgram'],['InstaHoe','instahoe'],['RealMoneyRealEstate','realEstate'],['JDMIMPORTS','jdmImports'],['RICHBOIMPORTS','richboi'],['ONLYVAMPS','onlyvamps']];
 const registry=new Map();
 let page='home',opened=false,phoneScope=null,closePromise=null,closeSceneExitCleanup=null,history=[],deviceLocked=false,swipeStart=null;
 const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const cash=()=>new Intl.NumberFormat('en-US').format(window.RABudget?.balance?.()??window.RAState.get().life.resources.money);
 const state=()=>window.RAState.get();
 function updateEntry(){if(!entry)return;const learned=!!state().life.phone.learned;entry.textContent=learned?'☎':'☎ CHECK PHONE';entry.classList.toggle('learned',learned);entry.setAttribute('aria-label',learned?'Open phone':'Check phone');const unread=unreadCount();entry.classList.toggle('has-unread',unread>0);entry.classList.toggle('guide-pulse',!!window.RAGuidance?.target?.());entry.dataset.unread=unread||'';}
 function button(label,action,cls='',extra=''){return `<button type="button" class="phone-button ${cls}" data-phone-action="${esc(action)}" ${extra}>${label}</button>`}
 function opportunities(){return window.RAOpportunities?.list('go_somewhere')||[]}
 function incoming(){return window.RAWorldEvents?.pending?.('phone')||[]}
 function incomingCard(){const events=incoming();if(!events.length)return '';return `<section class="phone-incoming"><p class="phone-incoming-kicker">INCOMING · AVAILABLE NOW</p>${events.map(event=>button(`${event.sender||'UNKNOWN'}<br><small>${event.subject||'MESSAGE'}</small>`,`openWorldEvent:${event.id}`,'incoming-button')).join('')}</section>`}
 // ---- app registry ----
 function register(app){registry.set(app.id,{canon:false,order:50,...app});}
 const appLabel=id=>registry.get(id)?.label||CANON.find(c=>c[1]===id)?.[0]||id;
 function isUnlocked(id){if(['vampgpt','realEstate','jdmImports','bank','maps','contacts','texts','radio','armory'].includes(id))return true;if(id==='stripClub')return !!window.RAStripClub?.isOpen?.();return !!window.RALife?.appUnlocked?.(id);}
 function unreadCount(){try{const threads=state().life.phone.threads||{};let n=0;for(const t of Object.values(threads))n+=t.filter(m=>!m.read&&m.from!=='RICH').length;return n;}catch(e){return 0}}
 function badge(id){const app=registry.get(id);const n=app?.badge?.()||0;return n?` <i class="phone-badge">${n}</i>`:''}
 function header(){
  if(!window.RALife)return '';const i=RALife.today();const radio=window.RARadio?.miniPlayer?.()||'';
  return `<div class="phone-status phone-system-status"><span>DAY ${i.day} · ${i.weekday.slice(0,3)} ${i.dateLabel}</span><span class="phone-signal" aria-label="Connected">▂▄▆</span></div><div class="phone-balance"><span>ON HAND</span><strong>$${cash()}</strong></div>${radio}`;
 }
 // Frozen ART SHIP 006 app icons (24×24, no baked text: the label stays UI text) by runtime app id → Art Registry id.
 // PICKUP has no phone app at runtime and RICHBOIMPORTS has no approved icon; both stay text-only.
 const APP_ICON={texts:'texts',hatch:'hatch',touge:'touge',bars:'bars',radio:'rich_radio',receipts:'receipts',vampgpt:'vampgpt',jdmImports:'jdmimports'};
 // Code-drawn 16px icon family for surfaces without frozen app art. No asset is edited.
 const GLYPHS={vampgram:'M2 2H14V14H2ZM5 5V8L8 11L11 8V5',instahoe:'M5 2H11V8H5ZM2 14V11H14V14',onlyvamps:'M2 3H14V13H2ZM5 6L8 10L11 6',realEstate:'M1 7L8 1L15 7M3 7V14H13V7M7 14V10H10V14',richboi:'M1 5H15V12H1ZM3 5L5 2H11L13 5M4 12V14M12 12V14',armory:'M1 5H14V8H8V14H5V8H1ZM10 3V5',warRoom:'M2 2H14V14H2ZM2 6H14M6 6V14M10 6V14',trap:'M1 7L8 1L15 7M3 7V14H13V7M7 9H10V12H7Z',rainmaker:'M1 4H15V12H1ZM6 6H10V10H6ZM3 6V10M13 6V10',moves:'M2 2H5V6H8V2H11V6H14V10L8 14L2 10Z',stripClub:'M3 3H13V5H5V7H13V13H3V11H11V9H3Z',bank:'M1 5L8 1L15 5ZM3 7V12M8 7V12M13 7V12M1 14H15',maps:'M1 3L5 1L11 3L15 1V13L11 15L5 13L1 15ZM5 1V13M11 3V15',contacts:'M2 1H14V15H2ZM6 4H10V8H6ZM5 12V10H11V12'};
 function icon(id){const src=window.RAArtRegistry?.ui?.apps?.[APP_ICON[id]];const art=src?`<img class="phone-app-icon" src="${esc(src)}" alt="" width="24" height="24" draggable="false">`:`<svg class="phone-pixel-icon" viewBox="0 0 16 16" aria-hidden="true" shape-rendering="crispEdges"><path d="${GLYPHS[id]||'M2 2H14V14H2ZM5 5H11V11H5Z'}"/></svg>`;return `<span class="phone-icon-tile" data-icon="${esc(id)}">${art}</span>`;}
 function lockMeta(id){return window.RAPhoneHierarchy?.lockFor?.(id,registry.get(id))||{short:'LOCKED',line:registry.get(id)?.lockedLine||CANON_LOCKED[id]||'not yet.'};}
  function appButton(id,label,isCanon){
   const unlocked=isUnlocked(id),lock=unlocked?null:lockMeta(id);
   const cls=`app-button${isCanon?'':' app-extra'}${unlocked?'':' app-dormant'}`;
   const sub=unlocked?badge(id):`<small class="phone-lock-short">LOCKED · ${esc(lock.short)}</small>`;
   const extra=unlocked?'':`data-locked="1" aria-label="${esc(label)} — locked: ${esc(lock.short)}"`;
   const display={realEstate:'RealMoney<br>RealEstate',richboi:'RICHBO<br>IMPORTS'}[id]||esc(label);
   // RC2 guidance: the app the player should open next pulses (pixel shake + "!") until it is opened.
   const pulse=unlocked&&window.RAGuidance?.pulsing?.(id);
   return button(`${icon(id)}<span class="phone-app-label">${display}</span>${sub}${pulse?'<i class="phone-pulse-dot" aria-hidden="true">!</i>':''}`,`app:${id}`,cls+(pulse?' phone-pulse':''),extra+(pulse?' data-guide="next"':''));
  }
  // "Do this next": time-limited interrupts (an incoming event, a raid, a PLAY mid-flight) first, then the one step RAGuidance picks.
  function nextAction(){
   const event=incoming()[0];if(event)return {label:event.subject||event.sender,sub:event.sender,action:`openWorldEvent:${event.id}`};
   const pending=window.RAWarRoomPlay?.pending?.();if(isUnlocked('warRoom')&&pending)return {label:'RESUME THE PLAY',sub:pending.jobMeta?.label||'WAR ROOM',action:'app:warRoom:jobs'};
   const g=window.RAGuidance?.next?.();if(g)return {label:g.label,sub:g.sub,action:g.action};
   return {label:'OGA WHAT DO I DO',sub:'VAMPGPT',action:'app:vampgpt'};
  }
  function nextMarkup(){const n=nextAction();return `<section class="phone-next"><p class="phone-incoming-kicker">NEXT UP <span>AVAILABLE NOW</span></p>${button(`<small>${esc(n.sub||'')}</small><strong>${esc(n.label)}</strong><span class="phone-next-arrow" aria-hidden="true">↗</span>`,n.action,'phone-next-button')}</section>`;}
  // RC3: eight apps, one flat 3-wide grid, one NEXT UP card. No sections, no stacked INCOMING list (NEXT UP is the one notification).
  function homeMarkup(){
   const apps=(window.RARC3Cut?.APPS||CANON.map(([label,id])=>({id,label})));
   const grid=apps.map(a=>appButton(a.id,a.label,true)).join('');
   return `${header()}${nextMarkup()}<div class="phone-app-grid">${grid}</div><div class="phone-message" aria-live="polite"></div>${button('CLOSE PHONE','close','phone-close-button')}`;
  }
 // ---- VampGPT (canon flow + WHAT WE ON + the three lanes) ----
 function whatWeOn(){
  const lines=window.RATemptations?.whatWeOn?.()||[];if(!lines.length)return '';
  return `<div class="phone-wwo"><p class="phone-speaker">WHAT WE ON</p>${lines.map(t=>button(esc(t.line),`tempt:${t.id}`,'wwo-line')).join('')}</div>`;
 }
 // RECOMMENDED (RC2): the first line is always the next story step or a way to make cash (RAGuidance.next).
 function recommendedBlock(){
  const items=window.RAGuidance?.recommended?.()||[];if(!items.length)return '';
  return `<div class="phone-rec"><p class="phone-speaker">RECOMMENDED</p>${items.map((it,i)=>button(`<small>${esc(it.sub||'')}</small><strong>${esc(it.label)}</strong>`,it.action,i===0?'rec-line rec-first':'rec-line')).join('')}</div>`;
 }
 function laneOptions(lane){return window.RAVampGPT?.lane?.(lane)||[];}
 function deviceChrome(){const now=new Date(),time=document.querySelector('#phoneDeviceTime'),date=document.querySelector('#phoneDeviceDate');if(time)time.textContent=`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;if(date&&window.RALife)date.textContent=`${RALife.today().weekday.slice(0,3)} · ${RALife.today().dateLabel}`;overlay.classList.toggle('device-locked',deviceLocked);}
 function pixelKeyboard(){return `<div class="phone-keyboard" aria-label="Contact search keyboard">${['QWERTYUIOP','ASDFGHJKL','ZXCVBNM'].map(row=>`<div>${[...row].map(k=>`<button type="button" data-phone-key="${k.toLowerCase()}" aria-label="Type ${k}">${k}</button>`).join('')}</div>`).join('')}<div><button type="button" data-phone-key="clear">CLEAR</button><button type="button" data-phone-key=" " class="phone-space">SPACE</button><button type="button" data-phone-key="backspace" aria-label="Backspace">⌫</button></div></div>`;}
 function filterContacts(){const input=content.querySelector('[data-contact-search]'),query=(input?.value||'').toLowerCase();content.querySelectorAll('[data-contact-name]').forEach(card=>{card.hidden=!card.dataset.contactName.includes(query);});}
  // VampGPT (RC3): the next story step, then today's loop. Nothing else.
 function vampgptMarkup(){
  const sp=window.RAGuidance?.spine?.(),rows=window.RAGuidance?.today?.()||[];
  const story=sp?`<div class="phone-card vgpt-story"><small>${esc(sp.sub||sp.chapter)}</small><b>${esc(sp.label)}</b>${sp.ready?button('GO',sp.action,'rec-line rec-first'):`<span class="phone-small">${esc(sp.wait||'TOMORROW')}</span>${button('SLEEP','sleep','rec-line')}`}</div>`:`<div class="phone-card vgpt-story"><b>THE STORY IS DONE</b><span class="phone-small">NEW OGA OF LA</span></div>`;
  const mark={done:'✔',next:'▶',wait:'…',later:'○'};
  const list=rows.map(r=>r.action&&r.state!=='done'?button(`${mark[r.state]||'○'} ${esc(r.label)}<small>${esc(r.sub||'')}</small>`,r.action,r.state==='next'?'rec-line':'rec-line vgpt-later'):`<p class="phone-small vgpt-row">${mark[r.state]||'○'} ${esc(r.label)} · ${esc(r.sub||'')}</p>`).join('');
  return `<h1>VAMPGPT</h1><div class="phone-chat"><p class="phone-speaker">NEXT STORY</p>${story}<p class="phone-speaker">TODAY</p>${list}<div class="phone-message" aria-live="polite"></div></div>${button('HOME','home','phone-back')}`;
 }
 // MAPS (RC3): the ten optional adventures (only the ones playable today) and the day job. Nothing here is ever pushed at the player.
 function mapsMarkup(){
  const opts=(window.RACut?.optional?.()||[]).filter(o=>o.available);
  const L=window.RALife,shift=!window.RAAdventures?.active?.()&&(window.RAAdventures?.available?.('SLURP')?'SLURP':window.RAAdventures?.available?.('A08')?'A08':null);
  const rows=[...(shift?[button(`WORK A SHIFT<br><small>RAMEN · LOW PAY</small>`,`maps:go:${shift}`,'destination-available')]:[]),...opts.map(o=>button(`${esc(o.title)}<br><small>${esc(o.tag)}</small>`,`maps:go:${o.id}`,'destination-available'))];
  return `<h1>MAPS</h1><p class="phone-small">${esc(state().life.world.location)} · ${esc(L.today().dateLabel)}</p><div class="phone-option-list">${rows.join('')||'<p class="phone-small">nothing on the map today.</p>'}</div><div class="phone-message" aria-live="polite"></div>${button('HOME','home','phone-home')}`;
 }
 function render(){
  if(!content)return;
  const s=state(),r=s.life.resources,w=s.life.world;
  deviceChrome();
  if(deviceLocked){content.dataset.phoneApp='lock';content.innerHTML=`<div class="phone-lock-screen"><span class="phone-lock-glyph" aria-hidden="true">▣</span><p>RICH ALUCARD</p><h1>${esc(RALife.today().dateLabel)}</h1><p class="phone-small">${unreadCount()} UNREAD</p>${button('SWIPE UP / UNLOCK','deviceUnlock','phone-unlock')}</div>`;return;}
  content.dataset.phoneApp=page;
  {const cur=['vampgpt','options','money','people'].includes(page)?'vampgpt':page==='somewhere'?'maps':page.startsWith('app:')?page.split(':')[1]:(page==='realEstate'||page==='jdmImports')?page:null;if(cur){window.RAGuidance?.opened?.(cur);if(page==='somewhere')window.RAGuidance?.opened?.('vampgpt');}}
  if(page==='home'){content.innerHTML=homeMarkup();}
  else if(page==='vampgpt'||page==='options'||page==='money'||page==='people'){
   content.innerHTML=vampgptMarkup();
  }else if(page==='somewhere'||page==='maps'){
   content.innerHTML=mapsMarkup();
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
  // A short discrete page arrival, independent of the locked PLAY iframe.
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches)content.animate?.([{opacity:.65,transform:'translateY(3px)'},{opacity:1,transform:'translateY(0)'}],{duration:120,easing:'steps(3,end)'});
  window.RAPhoneStyles?.();
 }
 function setMessage(text){const target=content.querySelector('.phone-message');if(target)target.textContent=text;}
 function showPhone(){
  if(opened||document.body.classList.contains('bedroom-mode')===false)return;
  window.RAWorldEvents?.deliver?.('phone');
  opened=true;deviceLocked=false;phoneScope=window.RAScenes?.currentScope?.()?.child('phone-overlay')||window.RAScenes?.createScope?.('phone-overlay');closeSceneExitCleanup=null;page='home';window.RABedroom?.holdForPhone?.();window.RAState.patch('life.phone.learned',true);updateEntry();
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
 const safeMenu=()=>{try{return window.RAWarRoomJobs?.buildNightMenu?.()||[]}catch(e){return []}};
 async function action(name){
  if(name==='deviceLock'){deviceLocked=true;window.RAAudio?.sfx?.('UI_CONFIRM');render();return}if(name==='deviceUnlock'){deviceLocked=false;window.RAAudio?.sfx?.('UI_CONFIRM');render();return}if(deviceLocked){if(name==='close')closePhone();return;}
  if(name==='sleep'){await closePhone();window.RABedroomLife?.confirmBed?.();return}
  if(name==='playNext'){const app=registry.get('warRoom'),menu=safeMenu(),i=menu.findIndex(j=>j.routesToPlay);if(app&&i>=0){await app.onAction('play',String(i),api);}else{page='app:warRoom:jobs';render();}return}
  if(name.startsWith('story:')){const id=name.slice(6);if(!window.RAAdventures?.available(id)){setMessage('not yet.');return}await closePhone();await window.RAAdventureScene.begin(id,{from:'spine'});return}
  if(name.startsWith('maps:go:')){const id=name.slice(8);if(!window.RAAdventures?.available(id)){setMessage('not today.');return}await closePhone();await window.RAAdventureScene.begin(id,{from:'maps'});return}
  if(name==='close'){closePhone();return}if(name==='home'){page='home';render();return}if(name==='vampgpt'){page='vampgpt';render();return}if(name==='prompt'){page='vampgpt';render();return}if(name==='somewhere'||name==='maps'){page='maps';render();return}if(name==='options'){page='vampgpt';render();return}if(name==='jdmImports'){page='jdmImports';render();return}if(name==='realEstate'){page='realEstate';render();return}
  if(name==='settings'){window.RAAudio?.sfx?.('UI_CONFIRM');page='settings';render();return}
  if(name==='toggleMute'){window.RAAudio?.toggleMuted?.();window.RAAudio?.sfx?.('UI_CONFIRM');render();return}
  if(name.startsWith('openWorldEvent:')){page=`worldEvent:${name.slice('openWorldEvent:'.length)}`;render();return}
  if(name.startsWith('resolveWorldEvent:')){const [,id,actionId]=name.split(':');window.RAWorldEvents?.resolve?.(id,actionId);page='home';render();return}
  if(name.startsWith('tempt:')){const id=name.slice(6);const t=(window.RATemptations?.whatWeOn?.()||[]).find(x=>x.id===id);if(!t)return;
   if(t.adventure){if(!window.RAAdventures?.available(t.adventure)){window.RATemptations.take(id);render();return}await closePhone();await window.RATemptations.act(id);return}
   window.RATemptations.take(id);const ok=await window.RAPlaces?.go?.(t.action,api);if(ok===false)setMessage('not tonight.');return}
  if(name.startsWith('go:')){const id=name.slice(3);const ok=await window.RAPlaces?.go?.(id,api);if(ok===false){setMessage('not tonight.');}return}
  if(name.startsWith('app:')){const [,id,...rest]=name.split(':');
   if(!isUnlocked(id)){const lock=lockMeta(id);window.RAAudio?.sfx?.('UI_ERROR');setMessage(`${lock.line}${lock.unlock?` UNLOCK: ${lock.unlock}`:''}`);content.querySelector('.phone-message')?.scrollIntoView({block:'nearest'});return}
   window.RAAudio?.sfx?.('PHONE_APP_OPEN');
   const direct=registry.get(id)?.direct;if(direct){window.RAGuidance?.opened?.(id);const ok=await direct(api);if(ok===false)setMessage('not tonight.');return}
   if(id==='vampgpt'||id==='realEstate'||id==='jdmImports'){page=id;render();return}
   page=`app:${id}${rest.length?':'+rest.join(':'):''}`;render();return}
  if(name.startsWith('do:')){const [,id,act,...args]=name.split(':');const app=registry.get(id);if(app?.onAction){await app.onAction(act,args.join(':'),api);}return}
  if(name==='money'||name==='people'){page=name;render();return}
  if(name==='atlanta'){const option=window.RAOpportunities?.get('atlanta');if(option?.available&&option.action?.type==='dialogue'&&option.action.id==='butter_chicken'){page='butterChicken';render()}return}
  if(name==='tokyo'){const option=window.RAOpportunities?.get('tokyo');if(!option?.available){window.RAAudio?.sfx?.('UI_ERROR');setMessage(window.RALife&&RALife.rep()>=2?'almost. not yet.':(option?.lockedMessage||"tokyo vampires don't fw you yet. get your clout up."));}else window.RAAudio?.sfx?.('UI_CONFIRM');return}
  if(name==='ogun_rave'){const option=window.RAOpportunities?.get('ogun_rave');if(option?.available&&option.action?.type==='dialogue'&&option.action.id==='ogun_rave_intro'){page='ogunRaveIntro';render()}return}
  if(name==='nah'){page='vampgpt';render();return}
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
  overlay?.addEventListener('click',e=>{const key=e.target.closest('[data-phone-key]');if(key){const input=content.querySelector('[data-contact-search]');if(!input)return;const k=key.dataset.phoneKey;input.value=k==='clear'?'':k==='backspace'?input.value.slice(0,-1):(input.value+k).slice(0,40);filterContacts();window.RAAudio?.sfx?.('UI_TAP');e.__raSfxHandled=true;return;}const jdm=e.target.closest('[data-jdm-action]');if(jdm){window.RAJDMImports?.action(jdm.dataset.jdmAction);return}const property=e.target.closest('[data-property-action]');if(property){window.RAPropertyQuest?.action(property.dataset.propertyAction);return}const target=e.target.closest('[data-phone-action]');if(!target||target.disabled)return;const act=target.dataset.phoneAction;if(/^(app:|settings$|toggleMute$|tokyo$|close$|device)/.test(act))e.__raSfxHandled=true;action(act)});
  overlay?.addEventListener('pointerdown',e=>{const shell=overlay.querySelector('.phone-shell').getBoundingClientRect();swipeStart={x:e.clientX,y:e.clientY,edge:e.clientX-shell.left<24};});
  overlay?.addEventListener('pointerup',e=>{const s=swipeStart;swipeStart=null;if(!s)return;if(deviceLocked&&s.y-e.clientY>70){action('deviceUnlock');return;}if(s.edge&&e.clientX-s.x>70&&Math.abs(e.clientY-s.y)<40){action('home');window.RAAudio?.sfx?.('UI_CONFIRM');}});
  content?.addEventListener('input',e=>{if(e.target.matches('[data-contact-search]'))filterContacts();});
  overlay?.addEventListener('input',e=>{const bus=e.target?.dataset?.audioBus;if(bus)window.RAAudio?.setVolume?.(bus,Number(e.target.value)/100);if(e.target?.dataset?.audioToggle==='haptics')window.RAAudio?.setHaptics?.(e.target.checked);});
  document.querySelector('#devResetPhone')?.addEventListener('click',()=>{window.RAState.patch('life.resources.money',100000);window.RAState.patch('life.world.location','LA');window.RAState.patch('life.resources.clout','LOW');window.RAState.patch('life.phone.learned',false);page='home';if(opened)closePhone();updateEntry();entry?.focus({preventScroll:true});});
  document.addEventListener('keydown',e=>{if(opened&&e.key==='Escape')closePhone()});
 });
 // unregister (IF-1, additive): lets RAPhoneRegistry retract a flag-gated app when its feature flag goes OFF.
 window.RAPhoneApps={register,unregister:id=>registry.delete(id),get:id=>registry.get(id)||null,label:appLabel,isUnlocked,list:()=>[...registry.values()]};
 window.RAPhone={open:showPhone,close:closePhone,openApp,home(){page='home';render()},refresh:render,reset(){window.RAState.patch('life.phone.learned',false);updateEntry()},isOpen:()=>opened,apps:CANON.map(([name])=>name),api,page:()=>page,updateEntry};
 // Command views expose the existing economy, travel and contacts; no new game rules.
 function nextRoomMarkup(){const L=RALife.L(),room=(window.RACastle?.ROOMS||[]).filter(r=>!RALife.hasRoom(r.id)&&(!r.needs||r.needs(L))).sort((a,b)=>a.price-b.price)[0];if(!room)return "";return `<div class="phone-card"><b>TOMORROW'S RICH</b>${esc(room.label)}<br><span class="phone-small">${esc(room.verb)}</span><br>${RALife.fmt(room.price)} · ${RALife.money()>=room.price?"READY NOW":`${RALife.fmt(room.price-RALife.money())} TO GO`}${button("SEE YOUR CASTLE","app:realEstate")}</div>`;}
 register({id:'bank',label:'BANK',section:'money',order:1,render(){const l=state().life,o=l.ownership,props=(o.properties||[]).filter(p=>p.ownershipStatus==='owned'),due=props.reduce((n,p)=>n+(p.rentDue||0),0);return `<h1>BANK</h1><div class="phone-bank-total"><span>ON HAND</span><strong>$${cash()}</strong></div><div class="phone-card"><b>NET WORTH</b>${RALife.fmt(RALife.netWorth())}<br>RENT WAITING · ${RALife.fmt(due)}${due?button('PROPERTY · COLLECT RENT','app:realEstate'):''}</div><p class="phone-speaker">OWNED</p><div class="phone-stat-grid">${[['PROPERTIES',props.length],['CARS',(o.cars||[]).filter(c=>c.ownershipStatus!=='sold').length],['GUNS',(o.guns||[]).length]].map(([label,n])=>`<div class="phone-card"><strong>${n}</strong><small>${label}</small></div>`).join('')}</div>${button('PROPERTY','app:realEstate')}${button('CARS','app:jdmImports')}`;}});
 register({id:'maps',label:'MAPS',section:'now',order:6,direct:()=>{page='maps';render();return true;},render(){return mapsMarkup();}});
 register({id:'contacts',label:'CONTACTS',section:'social',order:6,render(){const known=window.RARelations?.known?.()||[];return `<h1>CONTACTS</h1><label class="phone-search"><span>FIND SOMEBODY</span><input data-contact-search type="search" inputmode="none" autocomplete="off" placeholder="name…" aria-label="Search contacts"></label>${isUnlocked('texts')?button('TEXTS','app:texts'):''}<div class="phone-contact-list">${known.map(p=>`<div class="phone-card" data-contact-name="${esc((p.catalog?.name||p.id).toLowerCase())}"><b>${esc(p.catalog?.name||p.id)}</b>${p.catalog?.dateable&&isUnlocked('instahoe')?button('PROFILE',`app:instahoe:p:${p.id}`):''}${(state().life.phone.threads[p.id]||[]).length&&isUnlocked('texts')?button('TEXTS',`app:texts:${p.id}`):''}</div>`).join('')||'<p class="phone-small">nobody yet. phone still got space.</p>'}</div>${pixelKeyboard()}`;}});
})();
