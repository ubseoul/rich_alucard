(function(){
 // New game routing (VOL 1 §10.1): START → A00 THE GOLDFISH YEARS (ocean) → A01 THRONE ROOM (existing CEO fight,
 // kept as built) → cut to black → bedroom → A02 FIRST WAKE (Day 1 = Oct 1, family thread pings first).
 // Existing saves (life clock already started) go straight to the bedroom exactly as before.
 const started=()=>!!RAState.get().life.clock.started;
 async function onStart(){
  if(started())return false; // caller keeps the historical START → bedroom behavior
  const f=RALife.flag;
  if(!f('prologueDone')){if(!RAAdventures.active())RAAdventures.start('A00',{from:'newgame'});await RAScenes.go('adventure',{});return true;}
  if(!f('throneDone')){await toThrone();return true;}
  await firstWake();return true;
 }
 async function toThrone(){document.body.classList.remove('adventure-mode');await RAScenes.go('battle',{prologue:true});}
 async function cutToBedroom(){
  const screen=document.querySelector('#screen');const fade=document.createElement('div');fade.className='wake-overlay';screen.append(fade);
  await new Promise(r=>setTimeout(r,40));fade.classList.add('on');await new Promise(r=>setTimeout(r,1400));
  RALife.setFlag('throneDone',true);await RAScenes.go('bedroom',{firstWake:true});fade.classList.remove('on');await new Promise(r=>setTimeout(r,650));fade.remove();
  await firstWake();
 }
 async function firstWake(){
  if(RAScenes.current()!=='bedroom')await RAScenes.go('bedroom',{firstWake:true});
  window.RABedroom?.setRichState?.('drowsy_wake');
  const mail=RAClock.wake({first:true});RALife.setFlag('firstWakeDone',true);
  window.RABedroomLife?.build?.();window.RABedroomLife?.showMail?.(mail);
 }
 // A01 hook: after the CEO fight resolves (steal/no steal, bite/fly), a new life cuts to the bedroom.
 document.addEventListener('ra:ceo-resolved',()=>{if(!started()&&RALife.flag('prologueDone')&&!RALife.flag('throneDone'))setTimeout(cutToBedroom,1800);});
 // A00 completion routes to the throne room instead of the bedroom.
 document.addEventListener('ra:adventure-complete',e=>{if(e.detail?.id==='A00'){RALife.setFlag('prologueDone',true);}});
 window.RANewGame={onStart,firstWake,cutToBedroom,started};
})();
