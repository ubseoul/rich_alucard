(function(){
 'use strict';
 // RC2 BUILD 2 · PHONE NUDGES. Presentation only: the "NEXT UP" button and every app in the NOW section buzz and glow, so a
 // player who doesn't want to think can tap whatever is shaking. Which apps appear in NOW stays owned by the phone registry.
 const host=document.querySelector('#phoneContent');if(!host)return;
 function mark(){
  const next=host.querySelector('.phone-next-button');next?.classList.add('rc2-nudge','rc2-nudge-big');
  // RC3: ONE thing buzzes (NEXT UP; the guided app tile pulses on its own). Badges stay silent.
 }
 let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;mark();});}).observe(host,{childList:true,subtree:true});mark();
 window.RAPhoneNudge={mark};
})();
