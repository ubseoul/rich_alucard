(function(){
 'use strict';
 // RC2 BUILD 2 · PHONE NUDGES. Presentation only: the "NEXT UP" button and every app in the NOW section buzz and glow, so a
 // player who doesn't want to think can tap whatever is shaking. Which apps appear in NOW stays owned by the phone registry.
 const host=document.querySelector('#phoneContent');if(!host)return;
 function mark(){
  const next=host.querySelector('.phone-next-button');next?.classList.add('rc2-nudge','rc2-nudge-big');
  const label=host.querySelector('[data-phone-section="now"]');if(!label)return;
  for(let n=label.nextElementSibling;n&&!n.matches('.phone-section-label');n=n.nextElementSibling)if(n.matches('.app-button:not(.app-dormant)'))n.classList.add('rc2-nudge');
  host.querySelectorAll('.app-button .phone-badge,.app-button .unread,.app-button [data-unread]').forEach(b=>b.closest('.app-button')?.classList.add('rc2-nudge'));
 }
 let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;mark();});}).observe(host,{childList:true,subtree:true});mark();
 window.RAPhoneNudge={mark};
})();
