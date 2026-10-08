(function(){
 'use strict';
 // RC2 BUILD 2 · enemy BARK BUBBLE presentation. Text lives in js/data/rc2_barks.js (Build 3 owns it).
 // A bark is a hard-pixel speech bubble above the speaking actor in combat. It never blocks input and never
 // overlaps the menu band: it is clamped inside the world viewport and removed after a short hold.
 const COOLDOWN=2600,CHANCE={telegraph:.9,attack:.45,hit_rich:.4,hurt:.5,lose:1,win:1};
 let last=0,seed=0;
 const pick=(arr)=>arr[(seed++*7+Math.floor(Math.random()*arr.length))%arr.length];
 function lineFor(enemyId,kind){if(window.RAWriting)return window.RAWriting.bark(enemyId,{attack:'enter',hit_rich:'win'}[kind]||kind);const L=window.RABarkLines||{};const pool=[...(L[enemyId]?.[kind]||[]),...((L[enemyId]?.[kind]?.length?[]:L._any?.[kind])||[])];return pool.length?pick(pool):null;}
 function show({root,anchor,text,speaker='enemy',hold=1500}){
  if(!root||!text)return null;root.querySelectorAll('.rc2-bark').forEach(n=>n.remove());
  const b=document.createElement('div');b.className=`rc2-bark rc2-bark-${speaker}`;b.textContent=text;b.setAttribute('aria-hidden','true');root.append(b);
  const rr=root.getBoundingClientRect();const w=window.RAPresentationDirector?.worldRect?.()||{x:0,y:0,w:rr.width,h:rr.height};
  const bw=b.offsetWidth,bh=b.offsetHeight;let x=anchor.x-bw*(speaker==='enemy'?.6:.35),y=anchor.y-bh-12;
  x=Math.max(w.x+4,Math.min(w.x+w.w-bw-4,x));y=Math.max(w.y+4,y);b.style.left=`${Math.round(x)}px`;b.style.top=`${Math.round(y)}px`;
  b.style.setProperty('--tail',`${Math.round(Math.max(10,Math.min(bw-18,anchor.x-x-4)))}px`);
  requestAnimationFrame(()=>b.classList.add('on'));setTimeout(()=>{b.classList.remove('on');setTimeout(()=>b.remove(),160);},hold);return b;
 }
 // trigger({root,enemyId,kind,enemyEl}): rate-limited; picks a line and anchors above the enemy sprite.
 function trigger({root,enemyId,kind,enemyEl,force=false,speaker='enemy'}){
  const now=performance.now();if(!force&&(now-last<COOLDOWN||Math.random()>(CHANCE[kind]??.4)))return null;
  const text=speaker==='rich'?window.RAWriting.voiceSlots[31+Math.floor(Math.random()*2)]:lineFor(enemyId,kind);if(!text||!enemyEl?.isConnected)return null;
  const rr=root.getBoundingClientRect();const a=window.RAPresentationDirector?.actorBox?.(speaker==='rich'?'rich':'enemy');const eb=enemyEl.getBoundingClientRect();
  const anchor=a?{x:a.visible.x+a.visible.w*.5-rr.left,y:a.visible.y-rr.top+a.visible.h*.12}:{x:eb.left-rr.left+eb.width*.5,y:eb.top-rr.top+eb.height*.2};
  last=now;return show({root,anchor,text,speaker});
 }
 window.RABarks={show,trigger,lineFor,reset(){last=0;}};
})();
