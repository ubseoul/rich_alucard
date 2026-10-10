/* Title presentation; New Game and Continue are owned by the native entry handlers. */
(()=>{
 'use strict';
 const overlay=document.querySelector('#startOverlay.retro-start');if(!overlay)return;
 const stage=document.querySelector('#stage'),video=document.querySelector('#retroPlayPreview'),reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const visible=()=>!overlay.hidden&&getComputedStyle(overlay).display!=='none';
 const sync=()=>{const open=visible();if(stage)stage.inert=open||!!window.RAOpeningCinema?.isVisible?.()||!!window.RAEntryFlow?.blocksGameInput?.();if(video){if(!open||reduce.matches||document.hidden)video.pause();else video.play().catch(()=>{});}};
 document.querySelector('#startButton').disabled=false;const newGame=document.querySelector('#newGameButton');if(newGame)newGame.disabled=false;
 // Pointer focus must not move the button between pointer-down and pointer-up.
 overlay.addEventListener('focusin',e=>{if(e.target.matches('button:focus-visible')&&overlay.scrollHeight>overlay.clientHeight)e.target.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'});});
 // Native keyboard button activation, with the legacy game shortcut kept out of the title.
 overlay.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.closest('button'))e.stopPropagation();});
 document.addEventListener('ra:entry-complete',()=>{sync();if(stage){stage.inert=false;stage.setAttribute('tabindex','-1');stage.focus({preventScroll:true});}});
 new MutationObserver(sync).observe(overlay,{attributes:true,attributeFilter:['style','class','hidden']});
 document.addEventListener('ra:opening-cinema-complete',sync);reduce.addEventListener?.('change',sync);document.addEventListener('visibilitychange',sync);sync();
})();
