(function(){
 const overlay=document.querySelector('#phoneOverlay'),content=document.querySelector('#phoneContent'),entry=document.querySelector('#checkPhone');
 const apps=[['VampGPT','vampgpt'],['VampGram','unavailable'],['InstaHoe','unavailable'],['RealMoneyRealEstate','unavailable'],['JDMIMPORTS','jdmImports'],['RICHBOIMPORTS','unavailable'],['ONLYVAMPS','unavailable']];
 let page='home',opened=false;
 const cash=()=>new Intl.NumberFormat('en-US').format(window.RABudget?.balance?.()??window.RAState.get().life.resources.money);
 const state=()=>window.RAState.get();
 function updateEntry(){if(!entry)return;const learned=!!state().life.phone.learned;entry.textContent=learned?'☎':'☎ CHECK PHONE';entry.classList.toggle('learned',learned);entry.setAttribute('aria-label',learned?'Open phone':'Check phone');}
 function button(label,action,cls=''){return `<button type="button" class="phone-button ${cls}" data-phone-action="${action}">${label}</button>`}
 function opportunities(){return window.RAOpportunities?.list('go_somewhere')||[]}
 function render(){
  if(!content)return;
  const s=state(),r=s.life.resources,w=s.life.world;
  if(page==='home'){
   content.innerHTML=`<h1>PHONE</h1><div class="phone-app-grid">${apps.map(([name,action])=>button(name,action,'app-button')).join('')}</div><div class="phone-message" aria-live="polite"></div>${button('CLOSE PHONE','close','phone-close-button')}`;
  }else if(page==='vampgpt'){
   content.innerHTML=`<h1>VAMPGPT</h1><div class="phone-chat"><p class="phone-speaker">VAMPGPT</p><p>yo rich<br>what we on</p>${button('OGA WHAT DO I DO','prompt','suggested-prompt')}</div>${button('HOME','home','phone-back')}`;
  }else if(page==='options'){
   content.innerHTML=`<h1>VAMPGPT</h1><div class="phone-chat"><p class="phone-speaker">RICH</p><p>oga what do i do</p><p class="phone-speaker">VAMPGPT</p><p>you got $${cash()}.<br>you in ${w.location}.<br>clout still ${String(r.clout).toLowerCase()}.<br>we got options though.</p><div class="phone-option-list">${button('MAKE MONEY','money')}${button('MEET PEOPLE','people')}${button('GO SOMEWHERE','somewhere')}</div><div class="phone-message" aria-live="polite"></div></div>${button('HOME','home','phone-back')}`;
  }else if(page==='somewhere'){
   content.innerHTML=`<h1>VAMPGPT</h1><div class="phone-chat"><p>where you tryna go</p><div class="phone-option-list">${opportunities().map(o=>button(`${o.label}<br><small>${o.available?'AVAILABLE':'LOCKED'}</small>`,o.id,o.available?'destination-available':'destination-locked')).join('')}</div><div class="phone-message" aria-live="polite"></div></div>${button('BACK','options','phone-back')}${button('HOME','home','phone-home')}`;
  }else if(page==='butterChicken'){
   content.innerHTML=`<h1>VAMPGPT</h1><div class="phone-chat"><p class="phone-speaker">VAMPGPT</p><p>you could go get butter chicken</p><p class="phone-speaker">RICH</p><p>where</p><p class="phone-speaker">VAMPGPT</p><p>powder springs<br>outside atlanta</p><p class="phone-speaker">RICH</p><p>bet</p></div><div class="phone-trip-choice">${button("LET'S GO",'letsGo')}${button('NAH','nah')}</div>${button('BACK','somewhere','phone-back')}`;
  }else if(page==='jdmImports'){
   content.innerHTML=window.RAJDMImports?.storeMarkup?.()||`<h1>JDMIMPORTS</h1><p>NOT SET UP YET.</p>`;
  }
 }
 function setMessage(text){const target=content.querySelector('.phone-message');if(target)target.textContent=text;}
 function showPhone(){
  if(opened||document.body.classList.contains('bedroom-mode')===false)return;
  opened=true;page='home';window.RABedroom?.holdForPhone?.();window.RAState.patch('life.phone.learned',true);updateEntry();
  overlay.setAttribute('aria-hidden','false');overlay.classList.remove('closing');overlay.classList.add('open');render();
  setTimeout(()=>document.querySelector('#phoneClose')?.focus({preventScroll:true}),240);
 }
 function closePhone(){if(!opened)return Promise.resolve();overlay.classList.remove('open');overlay.classList.add('closing');overlay.setAttribute('aria-hidden','true');return new Promise(resolve=>setTimeout(()=>{overlay.classList.remove('closing');opened=false;window.RABedroom?.releasePhone?.();entry?.focus({preventScroll:true});resolve()},230));}
 function action(name){
  if(name==='close'){closePhone();return}if(name==='home'){page='home';render();return}if(name==='vampgpt'){page='vampgpt';render();return}if(name==='prompt'){page='options';render();return}if(name==='somewhere'){page='somewhere';render();return}if(name==='options'){page='options';render();return}if(name==='jdmImports'){page='jdmImports';render();return}
  if(name==='money'||name==='people'){setMessage('NOT SET UP YET.');return}
  if(name==='atlanta'){const option=window.RAOpportunities?.get('atlanta');if(option?.available&&option.action?.type==='dialogue'&&option.action.id==='butter_chicken'){page='butterChicken';render()}return}
  if(name==='tokyo'){const option=window.RAOpportunities?.get('tokyo');if(!option?.available)setMessage(option?.lockedMessage||"tokyo vampires don't fw you yet. get your clout up.");return}
  if(name==='nah'){page='somewhere';render();return}
  if(name==='letsGo'){
   const trip=window.RADesireTrips?.createTrip(window.RADesireTripPresentation?.firstTrip||{});if(!trip)return;
   closePhone().then(()=>window.RADesireTrips.beginTravel());return;
  }
  if(name==='unavailable')setMessage('NOT SET UP YET.');
 }
 document.addEventListener('DOMContentLoaded',()=>{
  updateEntry();document.addEventListener('ra:scene',e=>{if(e.detail?.id==='bedroom')updateEntry()});
  entry?.addEventListener('click',showPhone);
  document.addEventListener('ra:scene',e=>{if(e.detail?.id!=='bedroom'&&opened)closePhone()});
  document.querySelector('#phoneClose')?.addEventListener('click',closePhone);
  overlay?.addEventListener('click',e=>{const jdm=e.target.closest('[data-jdm-action]');if(jdm){window.RAJDMImports?.action(jdm.dataset.jdmAction);return}const target=e.target.closest('[data-phone-action]');if(target)action(target.dataset.phoneAction)});
  document.querySelector('#devResetPhone')?.addEventListener('click',()=>{window.RAState.patch('life.resources.money',100000);window.RAState.patch('life.world.location','LA');window.RAState.patch('life.resources.clout','LOW');window.RAState.patch('life.phone.learned',false);page='home';if(opened)closePhone();updateEntry();entry?.focus({preventScroll:true});});
  document.addEventListener('keydown',e=>{if(opened&&e.key==='Escape')closePhone()});
 });
 window.RAPhone={open:showPhone,close:closePhone,home(){page='home';render()},refresh:render,reset(){window.RAState.patch('life.phone.learned',false);updateEntry()},isOpen:()=>opened,apps:apps.map(([name])=>name)};
})();
