/* Title presentation; New Game and Continue are owned by the native entry handlers. */
(()=>{
 'use strict';
 const overlay=document.querySelector('#startOverlay.retro-start');if(!overlay)return;
 const stage=document.querySelector('#stage'),video=document.querySelector('#retroPlayPreview'),reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const visible=()=>!overlay.hidden&&getComputedStyle(overlay).display!=='none';
 const sync=()=>{const open=visible();if(stage)stage.inert=open||!!window.RAOpeningCinema?.isVisible?.()||!!window.RAEntryFlow?.blocksGameInput?.();if(video){if(!open||reduce.matches||document.hidden)video.pause();else video.play().catch(()=>{});}};
 document.querySelector('#startButton').disabled=false;const newGame=document.querySelector('#newGameButton');if(newGame)newGame.disabled=false;
 // Add the requested artist credit without replacing the existing contributors or notices.
 const credits=document.createElement('button');credits.type='button';credits.textContent='CREDITS';credits.className='retro-credits';credits.style.cssText='font:9px "Press Start 2P",monospace;background:transparent;color:inherit;border:1px solid currentColor;padding:12px;min-height:44px;cursor:pointer';
 overlay.querySelector('.retro-card')?.append(credits);
 credits.addEventListener('click',()=>{const box=document.createElement('dialog');box.className='game-credits';box.style.cssText='max-width:min(560px,85vw);background:#17101f;color:#fff1da;border:2px solid #e4ba6a;padding:26px;font:12px "Press Start 2P",monospace;line-height:2';const title=document.createElement('h2');title.textContent='RICH ALUCARD';const row=document.createElement('p');row.textContent='Lead Pixel Artist — WWinnerG33';const done=document.createElement('button');done.type='button';done.textContent='BACK';done.style.cssText='font:inherit;padding:12px;min-height:44px';box.append(title,row,done);document.body.append(box);done.addEventListener('click',()=>box.close());box.addEventListener('close',()=>{box.remove();credits.focus({preventScroll:true});},{once:true});box.addEventListener('keydown',e=>e.stopPropagation());box.showModal();done.focus();});
 // Pointer focus must not move the button between pointer-down and pointer-up.
 overlay.addEventListener('focusin',e=>{if(e.target.matches('button:focus-visible')&&overlay.scrollHeight>overlay.clientHeight)e.target.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'});});
 // Native keyboard button activation, with the legacy game shortcut kept out of the title.
 overlay.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.closest('button'))e.stopPropagation();});
 document.addEventListener('ra:entry-complete',()=>{sync();if(stage){stage.inert=false;stage.setAttribute('tabindex','-1');stage.focus({preventScroll:true});}});
 new MutationObserver(sync).observe(overlay,{attributes:true,attributeFilter:['style','class','hidden']});
 document.addEventListener('ra:opening-cinema-complete',sync);reduce.addEventListener?.('change',sync);document.addEventListener('visibilitychange',sync);sync();
})();
