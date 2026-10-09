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
 // Every beat in the approved bedroom keeps Rich on the mattress and pillow.
 // Phone attribution remains separate; Royal Glitch prose/mechanics are untouched.
 const FROZEN=new Set(['G5','G3','G7','G7-SET','G6','G7-SERMON','LEGENDARY_RECOGNITION']);
 function frozen(env,cast){const a=window.RAAdventures?.active?.();return FROZEN.has(a?.id)||/^G[1-9](?:[-:_.]|$)/.test(a?.id||'')||String(env?.id||'').startsWith('G3-')||Object.values(cast||{}).some(v=>['G1','LEGENDARY-MASK'].includes(typeof v==='string'?v:v?.id));}
 function call(actors,env){
  if(env?.id!=='bedroom'||frozen(env,actors))return null;
  const active=window.RAAdventures?.active?.(),key=activeBeat(),node=window.RAAdventures?.get?.(active?.id)?.nodes?.[active?.node];
  const phone=CALLS[key]||['voice','texts','text','call','dm','notif','viral','unknown'].includes(active?.node)||Object.values(actors||{}).some(v=>v?.id==='rich'&&String(v.src||'').includes('rich_bedroom_phone'))||Array.isArray(node?.lines)&&node.lines.some(r=>['phone','dm','text'].includes(r?.[2]?.channel));
  if(!phone)return null;
  const entry=Object.entries(actors||{}).find(([,v])=>(typeof v==='string'?v:v?.id)==='rich');
  return entry?{slot:entry[0],caller:CALLS[key]||null}:null;
 }
 const BED_STATES=new Set(['lounge_idle','phone_scroll','small_idle','phone_reaction','sleeping','drowsy_wake']);
 function bedroomRich(spec,phone){
  const sourceState=String(spec?.src||'').match(/^assets\/rich_bedroom_(.+)\.png$/)?.[1];
  const state=BED_STATES.has(spec?.state)?spec.state:BED_STATES.has(sourceState)?sourceState:phone?'phone_scroll':'lounge_idle';
  return {...(typeof spec==='object'?spec:{}),id:'rich',src:`assets/rich_bedroom_${state}.png`,state,x:78,y:338,lineScale:1,flip:false};
 }
 function actors(env,cast){
  const c=call(cast,env);
  if(window.RAAdventures?.active?.()?.id==='RB_DELIVERY')return Object.fromEntries(Object.entries(cast||{}).map(([slot,v])=>[slot,(typeof v==='string'?v:v?.id)==='rich'?{...(typeof v==='object'?v:{}),id:'rich',x:48,y:372,lineScale:1}:v]));
  if(!frozen(env,cast)&&env?.id==='bedroom')cast=Object.fromEntries(Object.entries(cast||{}).map(([slot,v])=>{
   if((typeof v==='string'?v:v?.id)!=='senator')return [slot,v];
   const pose=['sitting','charging','asleep'].includes(v?.state)?v.state:(window.RAAdventures?.active?.()?.node==='walked'?'asleep':'sitting');
   return [slot,{...(typeof v==='object'?v:{}),id:'senator',state:pose,src:`assets/player_feedback/senator-pixel-v3/senator_${pose}_pixel_v3_160x160.png`,x:210,y:470,lineScale:.45}];
  }));
  if(env?.id==='bedroom')return Object.fromEntries(Object.entries(cast||{}).map(([slot,v])=>{
   const id=typeof v==='string'?v:v?.id;
   if(id==='rich')return [slot,bedroomRich(v,!!c)];
   // The native cat's paws sit on the duvet beside Rich, at its authored scale.
   if(id==='cat')return [slot,{...(typeof v==='object'?v:{}),id,x:202,y:338,lineScale:1,flip:false}];
   return [slot,v];
  }));
  if(env?.id==='gbenga_house_dining')return Object.fromEntries(Object.entries(cast||{}).map(([slot,spec])=>{
   const id=typeof spec==='string'?spec:spec?.id;
   return [slot,id==='mama_gbenga'?{...(typeof spec==='object'?spec:{}),id,lineScale:(env.base||1)*1.85*1.25}:spec];
  }));
  return cast;
 }
 function stage(env,cast){
  const c=call(cast,env),delivery=window.RAAdventures?.active?.()?.id==='RB_DELIVERY',bedroom=env?.id==='bedroom';if(!bedroom&&!delivery)return null;
  const reference=c?.slot||Object.keys(cast)[0];
  const stage=window.RAPresentationDirector.adventureStage(env,cast,{slots:{},node:{shot:{profile:'room',focal:Object.keys(cast),speakers:[],reference}}});
  stage.id=delivery?'adv:car-delivery':'adv:bedroom';return stage;
 }
 function mount(root,scope,env,cast){
  // Legacy renderActors first writes standing percentages; the Director then writes
  // the bed's pixels. Do not tween between those unrelated coordinate systems.
  // Bed poses change source frames in place, never enter or walk off the pillow.
  if(env?.id==='bedroom')for(const el of root.querySelectorAll('[data-actor="rich"]')){
   el.style.transition='none';el.style.animation='none';
  }
  const old=root.querySelector('.world-call-source');old?.remove();
  const c=call(cast,env);if(!c?.caller)return;
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
