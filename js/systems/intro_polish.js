(function(){
 'use strict';
 // RC2 BUILD 2 · INTRO POLISH (first impression). Presentation only; story text and rules are untouched.
 //  - TITLE: the throne-room battle behind START is dimmed and its HUD/command panel hidden, so it reads as a title.
 //  - DREAM: Rich actually sleeps in the bed (prop in A00), with rising Zs; every scene change fades through black.
 //  - OCEAN: bubbles rise; the ladder collapse shakes the screen.
 //  - THRONE FIGHT: a pulsing coach ("TAP FIGHT" -> "TAP BLOOD BATH") because the first fight is where players stalled.
 const body=document.body,reduced=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 const screen=()=>document.querySelector('#screen');
 const el=(t,c,h)=>{const n=document.createElement(t);if(c)n.className=c;if(h!=null)n.innerHTML=h;return n;};
 // ---- title ----
 const overlay=document.querySelector('#startOverlay');
 function titleSync(){const on=overlay&&getComputedStyle(overlay).display!=='none';body.classList.toggle('rc2-title',!!on);}
 if(overlay){new MutationObserver(titleSync).observe(overlay,{attributes:true,attributeFilter:['style','class']});titleSync();
  const card=overlay.querySelector('.start-card');
  // RC5 polish: the one-line title overflowed a 390px phone; stack it as a logo (same words, same order).
  const title=card?.querySelector('.title');if(title&&!title.querySelector('.rc5-t1')){const m=/^(.*?):\s*(.*?)(\s+Demo)?$/.exec(title.textContent.trim());if(m){title.setAttribute('aria-label',title.textContent.trim());title.innerHTML=`<span class="rc5-t1">${m[1]}</span><span class="rc5-t2">${m[2]}${m[3]?`<small> ·${m[3]}</small>`:''}</span>`;}}
  if(card&&!card.querySelector('.rc2-title-sub')){const sub=el('div','rc2-title-sub','a vampire lost gameboy game');card.insertBefore(sub,card.querySelector('#startButton'));}
  const tap=overlay.querySelector('small');if(tap)tap.textContent='tap start. music on.';}
 // ---- scene-change fade + shake ----
 let root=null,obs=null,lastEnv=null;
 function fade(ms=420){const r=document.querySelector('#adventureScene');if(!r||reduced())return;const f=el('div','rc2-fade');f.style.animationDuration=`${ms}ms`;r.append(f);setTimeout(()=>f.remove(),ms+60);}
 function shake(){const r=document.querySelector('#adventureScene');if(!r||reduced())return;r.classList.remove('rc2-shake');void r.offsetWidth;r.classList.add('rc2-shake');setTimeout(()=>r.classList.remove('rc2-shake'),520);}
 function watchAdventure(){
  const r=document.querySelector('#adventureScene');if(!r){obs?.disconnect();obs=null;root=null;lastEnv=null;return;}
  if(r===root)return;root=r;lastEnv=r.dataset.env;fade(700);
  obs?.disconnect();obs=new MutationObserver(()=>{const env=r.dataset.env;if(env!==lastEnv){const prev=lastEnv;lastEnv=env;fade(env==='ocean_floor_collapsed'||prev==='ocean_floor_collapsed'?220:420);if(env==='ocean_floor_collapsed')shake();}});
  obs.observe(r,{attributes:true,attributeFilter:['data-env']});
 }
 document.addEventListener('ra:scene',()=>setTimeout(watchAdventure,20));
 // ---- throne-fight coach ----
 let coach=null,coachTimer=0,coachStage=0;
 const prologueFight=()=>{try{return window.RAScenes?.current?.()==='battle'&&window.RALife?.flag?.('prologueDone')&&!window.RALife?.life?.()?.clock?.started&&overlay?.style.display==='none';}catch(e){return false;}};
 function placeCoach(){if(!coach)return;const ui=document.querySelector('#battleUI'),s=screen();if(!ui||!s)return;const u=ui.getBoundingClientRect(),r=s.getBoundingClientRect();coach.style.left=`${u.left-r.left+u.width/2}px`;coach.style.top=`${u.top-r.top-6}px`;}
 function hideCoach(){coach?.remove();coach=null;}
 function showCoach(text){if(window.RACombat?.snapshot?.().busy||window.RACombat?.snapshot?.().battleOver)return;if(window.RARC3&&RALife.flag('rc3Coach:combat'))return;hideCoach();if(!document.querySelector('#battleUI')||!screen())return;if(window.RARC3)RALife.setFlag('rc3Coach:combat',true);coach=el('div','rc2-coach',`<b>${window.RARC3?'TAP FIGHT → BLOOD BATH':text}</b><i aria-hidden="true">▼</i>`);screen().append(coach);placeCoach();}
 function armCoach(){clearTimeout(coachTimer);if(!prologueFight()){hideCoach();return;}coachTimer=setTimeout(()=>{if(prologueFight()&&!window.RACombat?.snapshot?.().busy&&!window.RACombat?.snapshot?.().battleOver)showCoach(coachStage===0?'TAP FIGHT':'TAP BLOOD BATH');},coachStage===0?1200:700);}
 document.querySelector('#battleUI')?.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||!prologueFight())return;hideCoach();
  const txt=(b.textContent||'').trim().toUpperCase();
  if(coachStage===0&&txt.includes('FIGHT')){coachStage=1;armCoach();}
  else if(coachStage===1&&b.closest('#moves')){coachStage=2;clearTimeout(coachTimer);}
  else armCoach();});
 document.addEventListener('ra:scene',()=>{coachStage=0;hideCoach();setTimeout(()=>{if(prologueFight())armCoach();},200);});
 setInterval(()=>{if(prologueFight()&&!window.RACombat?.snapshot?.().busy&&!window.RACombat?.snapshot?.().battleOver&&coachStage<2&&!coach)armCoach();else if(coach)placeCoach();else if(!prologueFight())hideCoach();},2500);
 window.RAIntroPolish={fade,shake,showCoach,hideCoach,coachState:()=>({stage:coachStage,visible:!!coach})};
})();
