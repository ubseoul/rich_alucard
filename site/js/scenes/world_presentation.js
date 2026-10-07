(function(){
 'use strict';
 // RC5 W presentation only. Shared adventure hooks are supplied separately to the coordinator.
 const CALLS={
  'NEW_OGA_M1:pitch':'VAMPGPT',
  'NEW_OGA_M2:voice':'GBENGA',
  'NEW_OGA_M4:voice':'GBENGA',
  'NEW_OGA_M5:voice':'GBENGA'
 };
 const activeBeat=()=>{const a=window.RAAdventures?.active?.();return `${a?.id}:${a?.node}`;};
 function call(actors,env){
  if(env?.id!=='bedroom'||!CALLS[activeBeat()])return null;
  const cast=Object.entries(actors||{}).filter(([,s])=>s);
  if(cast.length!==1||(typeof cast[0][1]==='string'?cast[0][1]:cast[0][1].id)!=='rich')return null;
  return {slot:cast[0][0],caller:CALLS[activeBeat()]};
 }
 function actors(env,cast){
  const c=call(cast,env);
  if(c)return {[c.slot]:{...(typeof cast[c.slot]==='object'?cast[c.slot]:{}),id:'rich',src:'assets/rich_bedroom_phone_scroll.png',state:'phone_scroll',x:78,y:338,lineScale:1}};
  if(env?.id==='gbenga_house_dining')return Object.fromEntries(Object.entries(cast||{}).map(([slot,spec])=>{
   const id=typeof spec==='string'?spec:spec?.id;
   return [slot,id==='mama_gbenga'?{...(typeof spec==='object'?spec:{}),id,lineScale:(env.base||1)*1.85*1.25}:spec];
  }));
  return cast;
 }
 function stage(env,cast){
  const c=call(cast,env);if(!c)return null;
  // Same frozen room, native bed contact and pose as the bedroom hub. Dialogue owns its lower UI band.
  return {id:'adv:bedroom-call',native:{width:270,height:480},environment:env.image,
   contactLines:[{id:'bed',y:338,x1:0,x2:270,scale:1}],
   actors:{[c.slot]:{source:{width:128,height:64,anchor:{x:64,y:56}},anchor:{x:78,y:338,line:'bed'}}},
   director:{states:{},shots:{default:{profile:'room',focal:[c.slot],speakers:[],reference:c.slot}}}};
 }
 function mount(root,scope,env,cast){
  const old=root.querySelector('.world-call-source');old?.remove();
  const c=call(cast,env);if(!c)return;
  const badge=document.createElement('div');badge.className='world-call-source';badge.textContent=`PHONE / ${c.caller}`;
  badge.setAttribute('aria-label',`Caller: ${c.caller}`);root.append(badge);scope?.cleanup(()=>badge.remove());
 }
 function speaker(speaker){
  // These exact baseline null-speaker lines are spoken phone dialogue, not world narration.
  return speaker==null&&['NEW_OGA_M1:pitch','NEW_OGA_M2:voice'].includes(activeBeat())?CALLS[activeBeat()].toLowerCase():speaker;
 }
 async function play(root,scope,node){
  if(node.presentation!=='carlos_debt_belt')return null;
  const art=window.RAArtRegistry?.cutscenes?.carlos_debt_belt;
  const g=root.querySelector('[data-actor="gbenga"]'),c=root.querySelector('[data-actor="carlos"]');
  const states=['anticipation','run1','run2','contact','follow_through','recover'];
  if(!g||!c||!window.RABeatTimeline||!states.every(k=>art?.gbenga?.[k]&&art?.carlos?.[k]))return {completed:false,cancelled:false,skipped:false,reason:'BELT_ART_REQUIRED'};
  // Decode the bounded frame family before the first swap; leaving the scene cancels readiness too.
  const readyScope=scope.child('belt-art-ready');
  const sources=[...new Set(states.flatMap(k=>[art.gbenga[k],art.carlos[k]]))];
  let ready;
  try{ready=await Promise.all(sources.map(src=>new Promise(resolve=>{
   const image=new Image();let done=false;
   const finish=ok=>{if(done)return;done=true;image.onload=image.onerror=null;resolve(ok);};
   readyScope.cleanup(()=>{finish(false);image.src='';});
   image.onload=()=>finish(true);image.onerror=()=>finish(false);image.src=src;
  })));}finally{readyScope.cancel();}
  if(!scope.isActive()||!root.isConnected)return {completed:false,cancelled:true,skipped:false};
  if(ready.some(ok=>!ok))return {completed:false,cancelled:false,skipped:false,reason:'BELT_ART_FAILED'};
  const times=[0,350,470,710,1060,1380];
  const frames=states.map((state,i)=>({at:times[i],actors:[
   {el:g,src:art.gbenga[state],dx:[0,-16,-32,-40,-40,0][i]},
   {el:c,src:art.carlos[state],dx:i===1?-12:i===2?-24:0}
  ]}));
  return window.RABeatTimeline.play({root,scope,frames,duration:2500});
 }
 window.RAWorldPresentation={actors,stage,mount,speaker,play};
})();
