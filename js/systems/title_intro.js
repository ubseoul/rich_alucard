/* Presentation lifecycle; save routing remains the existing native startButton handler. */
(()=>{
 'use strict';
 const overlay=document.querySelector('#startOverlay.retro-start');
 if(!overlay)return;
 const stage=document.querySelector('#stage'),start=document.querySelector('#startButton'),video=document.querySelector('#retroPlayPreview');
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const visible=()=>getComputedStyle(overlay).display!=='none';
 const sync=()=>{
  const open=visible();
  if(stage)stage.inert=open||!!window.RAOpeningCinema?.isVisible?.();
  if(video){if(!open||reduce.matches||document.hidden)video.pause();else video.play().catch(()=>{});}
 };
 start.disabled=false;
 const newGame=document.querySelector('#newGameButton');if(newGame)newGame.disabled=false;
 overlay.addEventListener('focusin',e=>{if(e.target.matches('button')&&overlay.scrollHeight>overlay.clientHeight)e.target.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'});});
 const focusGame=()=>{if(stage){stage.inert=false;stage.setAttribute('tabindex','-1');stage.focus({preventScroll:true});}};
 start.addEventListener('click',()=>{if(stage)stage.inert=false;setTimeout(focusGame,0);},{capture:true});
 document.querySelector('#newGameButton')?.addEventListener('click',()=>{setTimeout(()=>{if(!visible())focusGame();},0);});
 // Native button keyboard activation; block the game's legacy global shortcut from double-launching.
 overlay.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.closest('button'))e.stopPropagation();});
 new MutationObserver(sync).observe(overlay,{attributes:true,attributeFilter:['style','class','hidden']});
 reduce.addEventListener?.('change',sync);document.addEventListener('visibilitychange',sync);
 sync();
})();
