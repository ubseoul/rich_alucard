(function(){
 'use strict';
 // Speech belongs to an explicit actor and event. Scripted move beats own their reading time.
 const COOLDOWN=2600,CHANCE={enter:1,telegraph:.9,attack:.45,hit_rich:.4,hurt:.5,lose:1,win:1,spared:1};
 let stages=new WeakMap();
 const stage=root=>{let s=stages.get(root);if(!s){s={last:-Infinity,until:0,bubble:null,timers:[]};stages.set(root,s);root.addEventListener('c2:close',()=>reset(root),{once:true});}return s;};
 const textOf=x=>typeof x==='string'?x:x?.text;
 function silent(enemyId,appearance){const def=window.RACombatData?.ENEMIES?.[enemyId];return !!def?.silent||['hilt','hilt_rematch','ogun_rave_hilt','training','training_dummy','dummy'].includes(enemyId)||(def?.person==='moonie'&&(appearance||def.state)!=='human');}
 function lineFor(enemyId,kind,appearance){
  if(silent(enemyId,appearance))return null;
  if(window.RAWriting?.bark)return window.RAWriting.bark(enemyId,kind);
  const pool=window.RABarkLines?.[enemyId]?.[kind]||[];
  return pool.length?textOf(pool[Math.floor(Math.random()*pool.length)]):null;
 }
 const moveText=key=>window.RAAstraEditorial?.moveText?.(key)||null;
 const readHold=text=>Math.max(1400,String(text).length*40);
 function reset(root){if(!root){stages=new WeakMap();return;}const s=stages.get(root);if(!s)return;for(const id of s.timers)clearTimeout(id);s.bubble?.remove();stages.delete(root);}
 function show({root,anchor,text,speaker='enemy',hold=1500,scripted=false}){
  if(!root?.isConnected||!text||!anchor)return null;const s=stage(root),now=performance.now();
  if(!scripted&&now<s.until)return null;
  for(const id of s.timers)clearTimeout(id);s.timers=[];root.querySelectorAll('.rc2-bark').forEach(n=>n.remove());
  const b=document.createElement('div');b.className=`rc2-bark rc2-bark-${speaker}`;b.textContent=text;b.setAttribute('aria-hidden','true');root.append(b);s.bubble=b;
  const rr=root.getBoundingClientRect(),w=window.RAPresentationDirector?.worldRect?.()||{x:0,y:0,w:rr.width,h:rr.height};
  const bw=b.offsetWidth,bh=b.offsetHeight;let x=anchor.x-bw*(speaker==='enemy'?.6:.35),y=anchor.y-bh-12;
  x=Math.max(w.x+4,Math.min(w.x+w.w-bw-4,x));y=Math.max(w.y+4,Math.min(w.y+w.h-bh-4,y));b.style.left=`${Math.round(x)}px`;b.style.top=`${Math.round(y)}px`;
  b.style.setProperty('--tail',`${Math.round(Math.max(10,Math.min(bw-18,anchor.x-x-4)))}px`);
  if(scripted)s.until=now+hold;else s.until=0;
  requestAnimationFrame(()=>{if(b.isConnected)b.classList.add('on');});s.timers.push(setTimeout(()=>{b.classList.remove('on');s.timers.push(setTimeout(()=>b.remove(),160));},hold));return b;
 }
 // Result kinds are relative to the enemy; only confirmed terminal outcomes may use win/lose.
 function valid({kind,speaker='enemy',attacker,target,outcome}){
  if(speaker!=='enemy')return false;
  if(kind==='hurt')return target==='enemy';
  if(kind==='hit_rich')return attacker==='enemy'&&target==='rich';
  if(kind==='attack'||kind==='telegraph')return attacker==='enemy';
  if(kind==='win')return outcome==='lose';
  if(kind==='lose')return outcome==='win';
  return kind==='enter'||kind==='spared';
 }
 function trigger(spec){
  const {root,enemyId,kind,enemyEl,force=false,speaker='enemy',appearance}=spec;
  if(!root?.isConnected||!enemyEl?.isConnected||silent(enemyId,appearance)||!valid(spec))return null;
  const s=stage(root),now=performance.now();if(now<s.until||(!force&&(now-s.last<COOLDOWN||Math.random()>(CHANCE[kind]??0))))return null;
  const text=lineFor(enemyId,kind,appearance);if(!text)return null;
  const rr=root.getBoundingClientRect(),a=window.RAPresentationDirector?.actorBox?.('enemy'),eb=enemyEl.getBoundingClientRect();
  const anchor=a?{x:a.visible.x+a.visible.w*.5-rr.left,y:a.visible.y-rr.top+a.visible.h*.12}:{x:eb.left-rr.left+eb.width*.5,y:eb.top-rr.top+eb.height*.2};
  s.last=now;return show({root,anchor,text,speaker});
 }
 window.RABarks={show,trigger,lineFor,moveText,readHold,silent,reset};
})();
