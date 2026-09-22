(function(){
 const overlay=document.querySelector('#phoneOverlay'),content=document.querySelector('#phoneContent'),entry=document.querySelector('#checkPhone');
 const apps=[['VampGPT','vampgpt'],['VampGram','unavailable'],['InstaHoe','unavailable'],['RealMoneyRealEstate','unavailable'],['JDMIMPORTS','unavailable'],['RICHBOIMPORTS','unavailable'],['ONLYVAMPS','unavailable']];
 let page='home',opened=false;
 const cash=()=>new Intl.NumberFormat('en-US').format(window.RABudget?.balance?.()??window.RAState.get().rich.budget);
 const state=()=>window.RAState.get();
 function updateEntry(){if(!entry)return;const learned=!!state().phone?.learned;entry.textContent=learned?'☎':'☎ CHECK PHONE';entry.classList.toggle('learned',learned);entry.setAttribute('aria-label',learned?'Open phone':'Check phone');}
 function button(label,action,cls=''){return `<button type="button" class="phone-button ${cls}" data-phone-action="${action}">${label}</button>`}
 function render(){
  if(!content)return;
  const s=state(),r=s.rich;
  if(page==='home'){
   content.innerHTML=`<h1>PHONE</h1><div class="phone-app-grid">${apps.map(([name,action])=>button(name,action,'app-button')).join('')}</div><div class="phone-message" aria-live="polite"></div>${button('CLOSE PHONE','close','phone-close-button')}`;
  }else if(page==='vampgpt'){
   content.innerHTML=`<h1>VAMPGPT</h1><div class="phone-chat"><p class="phone-speaker">VAMPGPT</p><p>yo rich<br>what we on</p>${button('OGA WHAT DO I DO','prompt','suggested-prompt')}</div>${button('HOME','home','phone-back')}`;
  }else if(page==='options'){
   content.innerHTML=`<h1>VAMPGPT</h1><div class="phone-chat"><p class="phone-speaker">RICH</p><p>oga what do i do</p><p class="phone-speaker">VAMPGPT</p><p>you got $${cash()}.<br>you in ${r.location}.<br>clout still ${String(r.clout).toLowerCase()}.<br>we got options though.</p><div class="phone-option-list">${button('MAKE MONEY','money')}${button('MEET PEOPLE','people')}${button('GO SOMEWHERE','somewhere')}</div><div class="phone-message" aria-live="polite"></div></div>${button('HOME','home','phone-back')}`;
  }else if(page==='somewhere'){
   content.innerHTML=`<h1>VAMPGPT</h1><div class="phone-chat"><p>where you tryna go</p><div class="phone-option-list">${button('ATLANTA<br><small>AVAILABLE</small>','atlanta','destination-available')}${button('TOKYO 🔒<br><small>LOCKED</small>','tokyo','destination-locked')}</div><div class="phone-message" aria-live="polite"></div></div>${button('BACK','options','phone-back')}${button('HOME','home','phone-home')}`;
  }
 }
 function setMessage(text){const target=content.querySelector('.phone-message');if(target)target.textContent=text;}
 function showPhone(){
  if(opened||document.body.classList.contains('bedroom-mode')===false)return;
  opened=true;page='home';window.RABedroom?.holdForPhone?.();window.RAState.patch('phone.learned',true);updateEntry();
  overlay.setAttribute('aria-hidden','false');overlay.classList.remove('closing');overlay.classList.add('open');render();
  setTimeout(()=>document.querySelector('#phoneClose')?.focus({preventScroll:true}),240);
 }
 function closePhone(){if(!opened)return;overlay.classList.remove('open');overlay.classList.add('closing');overlay.setAttribute('aria-hidden','true');setTimeout(()=>{overlay.classList.remove('closing');opened=false;window.RABedroom?.releasePhone?.();entry?.focus({preventScroll:true});},230);}
 function action(name){
  if(name==='close'){closePhone();return}if(name==='home'){page='home';render();return}if(name==='vampgpt'){page='vampgpt';render();return}if(name==='prompt'){page='options';render();return}if(name==='somewhere'){page='somewhere';render();return}if(name==='options'){page='options';render();return}
  if(name==='money'||name==='people'){setMessage('NOT SET UP YET.');return}
  if(name==='atlanta'){setMessage('ATLANTA — AVAILABLE.');return}
  if(name==='tokyo'){setMessage("tokyo vampires don't fw you yet. get your clout up.");return}
  if(name==='unavailable')setMessage('NOT SET UP YET.');
 }
 document.addEventListener('DOMContentLoaded',()=>{
  updateEntry();document.addEventListener('ra:scene',e=>{if(e.detail?.id==='bedroom')updateEntry()});
  entry?.addEventListener('click',showPhone);
  document.addEventListener('ra:scene',e=>{if(e.detail?.id!=='bedroom'&&opened)closePhone()});
  document.querySelector('#phoneClose')?.addEventListener('click',closePhone);
  overlay?.addEventListener('click',e=>{const target=e.target.closest('[data-phone-action]');if(target)action(target.dataset.phoneAction)});
  document.querySelector('#devResetPhone')?.addEventListener('click',()=>{window.RAState.patch('rich.budget',100000);window.RAState.patch('rich.location','LA');window.RAState.patch('rich.clout','LOW');window.RAState.patch('phone.learned',false);page='home';if(opened)closePhone();updateEntry();entry?.focus({preventScroll:true});});
  document.addEventListener('keydown',e=>{if(opened&&e.key==='Escape')closePhone()});
 });
 window.RAPhone={open:showPhone,close:closePhone,reset(){window.RAState.patch('phone.learned',false);updateEntry()},isOpen:()=>opened,apps:apps.map(([name])=>name)};
})();
