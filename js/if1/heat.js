(function(){
 'use strict';
 // RAHeat — IF-1 (4F). The shared HEAT service: Vol 7 scale COOL · WARM · HOT · ON FIRE, one GLOBAL value and one value
 // per DISTRICT, authored numeric deltas, tier-change events, and a private-overlay subscriber hook.
 //
 // Compatibility: accepted NEW OGA keeps writing life.newOga.heat exactly as before. The GLOBAL value here is that
 // legacy value PLUS the service-held component (save.frag.if1.heat.global) that TRAP / War Room write through add().
 // Nothing in NEW OGA changes; a watcher only turns its writes into tier-change events.
 //
 // SOURCE_REQUIRED (non-blocking): the Vol 7 numeric tier floors are not in the OPEN repository. TIER_FLOORS below are a
 // PROVISIONAL engineering placeholder so the plumbing runs; the integration owner replaces them via configure() the
 // moment the authored numbers are supplied. Deltas are always the authored numbers — the service never scales them.
 const TIERS=Object.freeze(['COOL','WARM','HOT','ON FIRE']);
 let floors={COOL:0,WARM:6,HOT:12,'ON FIRE':24};let provisional=true;
 const listeners=new Set();let privateSub=null;
 const num=v=>Number.isFinite(Number(v))?Number(v):0;
 const legacy=()=>num(window.RAState.get().life?.newOga?.heat);
 const held=()=>window.RAFrag?.read('if1','heat',null)||{global:0,districts:{}};
 const heldGlobal=()=>num(held().global);
 const heldDistrict=id=>num(held().districts?.[id]);
 function tierFor(value){let tier=TIERS[0];for(const t of TIERS)if(value>=floors[t])tier=t;return tier;}
 const global=()=>legacy()+heldGlobal();
 const district=id=>heldDistrict(id);
 function emit(event){
  for(const fn of [...listeners]){try{fn(event);}catch(e){console.error('heat listener',e);}}
  if(privateSub){try{privateSub(event);}catch(e){}}
  try{document.dispatchEvent(new CustomEvent('ra:heat-tier',{detail:event}));}catch(e){}
 }
 function change(scope,before,after,source){
  const from=tierFor(before),to=tierFor(after);
  if(from!==to)emit({scope,from,to,value:after,previous:before,source:source||null,direction:TIERS.indexOf(to)>TIERS.indexOf(from)?'up':'down'});
 }
 // add(delta,{district,source,authored}) — delta is an authored number; district omitted = GLOBAL.
 function add(delta,{district:id=null,source=null}={}){
  const d=Number(delta);if(!Number.isFinite(d)||d===0)return id?district(id):global();
  const h=JSON.parse(JSON.stringify(held()));h.districts=h.districts||{};
  if(id){const before=num(h.districts[id]);const after=Math.max(0,before+d);h.districts[id]=after;window.RAFrag.patch('if1','heat',h);change(id,before,after,source);return after;}
  const before=global(),next=Math.max(0,num(h.global)+d);h.global=next;window.RAFrag.patch('if1','heat',h);change('global',before,global(),source);return global();
 }
 // A district's contribution to global HEAT is not assumed; War Room decides. Both scopes are independent numbers.
 function configure({floors:next,provisional:flag}={}){
  if(next){for(const t of TIERS)if(!Number.isFinite(next[t]))throw new Error(`RAHeat.configure: floor for ${t} required`);
   for(let i=1;i<TIERS.length;i++)if(next[TIERS[i]]<=next[TIERS[i-1]])throw new Error('RAHeat.configure: floors must strictly increase');floors={...next};}
  if(typeof flag==='boolean')provisional=flag;
 }
 const onTierChange=fn=>{listeners.add(fn);return ()=>listeners.delete(fn);};
 // Private sealed subscriber hook: a private overlay may attach ONE subscriber, and only once a pack is installed.
 // OPEN builds never attach anything; the hook names and exposes nothing about any sealed content.
 function subscribePrivate(fn){if(typeof fn!=='function'||!window.RASealed?.installed?.())return false;privateSub=fn;return true;}
 function snapshot(){const h=held(),districts={};for(const [id,v] of Object.entries(h.districts||{}))districts[id]={value:num(v),tier:tierFor(num(v))};
  return {global:{value:global(),tier:tierFor(global()),legacy:legacy(),service:heldGlobal()},districts,provisional};}
 // Compatibility adapter: turn accepted NEW OGA heat writes into tier-change events (values untouched).
 window.RAStateWatch?.watch('if1.heat.legacy',s=>num(s.life?.newOga?.heat),(next,prev)=>change('global',prev+heldGlobal(),next+heldGlobal(),'new_oga'));
 window.RAHeat={TIERS,tierFor,global,district,add,onTierChange,subscribePrivate,snapshot,configure,tiers:()=>({floors:{...floors},provisional}),describe:()=>({scale:[...TIERS],floors:{...floors},provisional})};
})();
