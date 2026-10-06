(function(){
 // New game routing (VOL 1 §10.1): START → A00 THE GOLDFISH YEARS (ocean) → A01 THRONE ROOM (existing CEO fight,
 // kept as built) → cut to black → bedroom → A02 FIRST WAKE (Day 1 = Oct 1, family thread pings first).
 // Existing saves (life clock already started) go straight to the bedroom exactly as before.
 const started=()=>!!RAState.get().life.clock.started;
 // Earned old saves keep their powers; fresh A00 runs must show the transfer before this becomes true.
 function brainAvailable(){const life=RAState.get().life,flags=life.world?.flags||{};return !!(flags.octopusBrain||flags.prologueDone||flags.throneDone||life.clock?.started);}
 let waking=false;
 function hasProgress(){
  const life=RAState.get().life||{},flags=life.world?.flags||{};
  return !!(life.clock?.started||life.adventures?.active||flags.prologueDone||flags.throneDone||flags.firstWakeDone||life.phone?.learned||(life.history||[]).length);
 }
 async function onStart(){
  if(started())return false; // caller keeps the historical START → bedroom behavior
  const f=RALife.flag;
  if(!f('prologueDone')){if(!RAAdventures.active())RAAdventures.start('A00',{from:'newgame'});await RAScenes.go('adventure',{});return true;}
  if(!f('throneDone')){await toThrone();return true;}
  await firstWake();return true;
 }
 async function toThrone(){document.body.classList.remove('adventure-mode');await RAScenes.go('battle',{prologue:true});}
 async function cutToBedroom(){
  if(waking||started()||RALife.flag('throneDone'))return;waking=true;
  const scope=RAScenes.currentScope(),screen=document.querySelector('#screen'),fade=document.createElement('div');fade.className='wake-overlay';screen.append(fade);scope?.cleanup(()=>fade.remove());
  try{if(scope&&!await scope.delay(40))return;fade.classList.add('on');if(scope&&!await scope.delay(1400))return;
   if(scope&&!scope.isActive())return;
   RALife.setFlag('throneDone',true);await RAScenes.go('bedroom',{firstWake:true});fade.remove();await firstWake();
  }finally{fade.remove();waking=false;}
 }
 async function firstWake(){
  if(RAScenes.current()!=='bedroom')await RAScenes.go('bedroom',{firstWake:true});
  window.RABedroom?.setRichState?.('drowsy_wake');
  const mail=RAClock.wake({first:true});RALife.setFlag('firstWakeDone',true);
  window.RABedroomLife?.build?.();window.RABedroomLife?.showMail?.(mail);
 }
 // A01 hook: after the CEO fight resolves (steal/no steal, bite/fly), a new life cuts to the bedroom.
 document.addEventListener('ra:ceo-resolved',()=>{if(!started()&&RALife.flag('prologueDone')&&!RALife.flag('throneDone'))RAScenes.currentScope()?.timeout(cutToBedroom,1800);});
 // A00 completion routes to the throne room instead of the bedroom.
 document.addEventListener('ra:adventure-complete',e=>{if(e.detail?.id==='A00'){RALife.setFlag('prologueDone',true);}});
 window.RANewGame={onStart,firstWake,cutToBedroom,started,hasProgress,brainAvailable};
})();
