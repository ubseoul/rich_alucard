(function(){
 'use strict';
 // Presentation only. Completion is a receipt for the caller; this module owns no story flags or rewards.
 const busy=new WeakMap();
 async function play({root,scope:parent,frames=[],duration,overlays=[]}={}){
  if(!root?.isConnected||!parent?.isActive())return {completed:false,cancelled:true,skipped:false};
  busy.get(root)?.cancel();
  const scope=parent.child('pixel-cutscene'),ordered=[...frames].sort((a,b)=>a.at-b.at),end=duration??ordered.at(-1)?.at??0;
  const world=window.RAPresentationDirector?.worldRect?.()||{x:0,y:0,w:root.clientWidth,h:root.clientHeight};
  const scale=world.w/270,original=new Map(),objects=new Map();let skipped=false,finished=false;
  for(const frame of ordered)for(const a of frame.actors||[])if(a.el&&!original.has(a.el))original.set(a.el,{style:a.el.getAttribute('style'),src:a.el.getAttribute('src'),hidden:a.el.hidden});
  const layer=document.createElement('div');layer.dataset.pixelCutscene='true';
  Object.assign(layer.style,{position:'absolute',left:`${world.x}px`,top:`${world.y}px`,width:`${world.w}px`,height:`${world.h}px`,pointerEvents:'none',zIndex:'4',overflow:'hidden',imageRendering:'pixelated'});root.append(layer);
  for(const o of overlays){const el=o.canvas||document.createElement('img');if(o.src)el.src=o.src;el.alt='';el.hidden=!!o.hidden;Object.assign(el.style,{position:'absolute',left:`${o.x*scale}px`,top:`${o.y*scale}px`,width:`${o.w*scale}px`,height:`${o.h*scale}px`,imageRendering:'pixelated'});layer.append(el);objects.set(o.id,el);}
  const skip=document.createElement('button');skip.type='button';skip.textContent='SKIP ANIMATION';skip.setAttribute('aria-label','Skip animation');
  Object.assign(skip.style,{position:'absolute',right:'8px',top:Math.max(world.y+8,world.y+world.h-36)+'px',zIndex:'12',font:'inherit',fontSize:'10px',padding:'8px',color:'#f6efd9',background:'#181326',border:'1px solid #9460c0'});root.append(skip);
  const draw=frame=>{for(const a of frame?.actors||[]){const el=a.el;if(!el?.isConnected)continue;const prior=original.get(el);if(a.src)el.src=a.src;el.hidden=false;
    const base=prior?.style?(()=>{const probe=document.createElement('div');probe.setAttribute('style',prior.style);return probe.style.transform;})():'';
    el.style.transform=`translate(${(a.dx||0)*scale}px,${(a.dy||0)*scale}px) rotate(${a.angle||0}deg) ${base||''}`;if(a.opacity!=null)el.style.opacity=String(a.opacity);}
   for(const o of frame?.overlays||[]){const el=objects.get(o.id);if(!el)continue;if(o.src)el.src=o.src;if(o.x!=null)el.style.left=`${o.x*scale}px`;if(o.y!=null)el.style.top=`${o.y*scale}px`;if(o.visible!=null)el.hidden=!o.visible;}
  };
  let wake=null;const finish=()=>{if(finished)return;finished=true;skipped=true;wake?.();};
  scope.listen(skip,'click',finish);scope.listen(document,'keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();finish();}},true);
  const owner={cancel:()=>scope.cancel()};busy.set(root,owner);
  scope.cleanup(()=>{wake?.();layer.remove();skip.remove();for(const [el,p] of original){if(p.style==null)el.removeAttribute('style');else el.setAttribute('style',p.style);if(p.src!=null)el.setAttribute('src',p.src);else el.removeAttribute('src');el.hidden=p.hidden;}if(busy.get(root)===owner)busy.delete(root);});
  const pause=ms=>new Promise(resolve=>{wake=resolve;const cancel=scope.timeout(()=>{wake=null;resolve();},ms);scope.cleanup(()=>{cancel();resolve();});});
  try{
   const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
   if(!reduced){let at=0;for(const frame of ordered){if(skipped||!scope.isActive()||!root.isConnected)break;await pause(Math.max(0,frame.at-at));at=frame.at;if(skipped||!scope.isActive()||!root.isConnected)break;draw(frame);}if(!skipped&&scope.isActive())await pause(Math.max(0,end-at));}
   if(!scope.isActive()||!root.isConnected)return {completed:false,cancelled:true,skipped};
   draw(ordered.at(-1));await pause(reduced||skipped?120:60);
   return {completed:scope.isActive()&&root.isConnected,cancelled:!scope.isActive()||!root.isConnected,skipped:skipped||!!reduced};
  }finally{scope.cancel();}
 }
 window.RABeatTimeline={play,cancel:root=>busy.get(root)?.cancel()};
})();
