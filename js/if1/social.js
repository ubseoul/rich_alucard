(function(){
 'use strict';
 // RASocial — IF-1 (4G). One stable Trust / Clout / Tendency service for every future fragment.
 //
 // It WRAPS the accepted state and delegates every write to the accepted functions (RANewOga.adjust for NEW OGA Trust and
 // gang Clout, RALife.tendency / RALife.addPoints for tendency and street Clout), so results are identical to calling
 // those directly. Authored values always win: deltas are applied as given; the optional modifiers below only ever touch
 // a delta the caller explicitly marks {authored:false} (a future derived/decay rule) — never an authored number.
 // Symbol mappings remain governed by the accepted source rules; this service defines none and invents none.
 const listeners={trust:new Set(),gangClout:new Set(),streetClout:new Set(),tendency:new Set()};
 const modifiers={trust:[],gangClout:[]};
 const T=()=>window.RANewOgaTunables,O=()=>window.RANewOga,L=()=>window.RALife;
 const life=()=>window.RAState.get().life;
 const num=v=>Number.isFinite(Number(v))?Number(v):0;
 function apply(kind,delta,{authored=true}={}){
  let d=Number(delta);if(!Number.isFinite(d)||d===0)return d===0?0:NaN;
  if(!authored)for(const fn of modifiers[kind]||[]){const next=fn(d,{kind});if(Number.isFinite(next))d=next;}
  return d;
 }
 const trust={
  get:()=>num(life().newOga?.trust),
  // HIGH TRUST / LOW TRUST per the accepted thresholds (RANewOgaTunables.trustThresholds); null in between.
  tier:(value=trust.get())=>O()?.tier?.(value)??null,
  thresholds:()=>({...(T()?.trustThresholds||{})}),
  add(delta,opts={}){const d=apply('trust',delta,opts);if(!Number.isFinite(d)||d===0)return trust.get();O().adjust('trust',d);return trust.get();},
  addModifier:fn=>{modifiers.trust.push(fn);return ()=>{modifiers.trust=modifiers.trust.filter(x=>x!==fn);};}
 };
 const gangClout={
  get:()=>num(life().newOga?.gangClout),
  add(delta,opts={}){const d=apply('gangClout',delta,opts);if(!Number.isFinite(d)||d===0)return gangClout.get();O().adjust('gangClout',d);return gangClout.get();},
  addModifier:fn=>{modifiers.gangClout.push(fn);return ()=>{modifiers.gangClout=modifiers.gangClout.filter(x=>x!==fn);};}
 };
 // The accepted street-clout ladder (LOW/MID/HIGH/CRAZY from points) that gates places and cars.
 const streetClout={
  points:()=>num(life().resources?.cloutPoints),
  tier:()=>life().resources?.clout||'LOW',
  index:()=>L().clout(),
  add:n=>L().addPoints('clout',n)
 };
 const tendency={
  get:()=>({solid:num(life().tendencies?.solid),messy:num(life().tendencies?.messy)}),
  leaning:()=>L().leaning(),
  add:(kind,n=1)=>L().tendency(kind,n)
 };
 function on(kind,fn){if(!listeners[kind])throw new Error(`RASocial.on: unknown kind ${kind}`);listeners[kind].add(fn);return ()=>listeners[kind].delete(fn);}
 function fire(kind,next,prev,via){for(const fn of [...listeners[kind]]){try{fn({kind,value:next,previous:prev,via});}catch(e){console.error('social listener',e);}}}
 const watch=window.RAStateWatch?.watch;
 watch?.('if1.social.trust',s=>num(s.life?.newOga?.trust),(n,p,m)=>fire('trust',n,p,m.via));
 watch?.('if1.social.gangClout',s=>num(s.life?.newOga?.gangClout),(n,p,m)=>fire('gangClout',n,p,m.via));
 watch?.('if1.social.streetClout',s=>num(s.life?.resources?.cloutPoints),(n,p,m)=>fire('streetClout',n,p,m.via));
 watch?.('if1.social.tendency',s=>`${num(s.life?.tendencies?.solid)}/${num(s.life?.tendencies?.messy)}`,(n,p,m)=>fire('tendency',n,p,m.via));
 window.RASocial={trust,gangClout,streetClout,tendency,on,snapshot:()=>({trust:trust.get(),trustTier:trust.tier(),gangClout:gangClout.get(),streetClout:{points:streetClout.points(),tier:streetClout.tier()},tendency:tendency.get(),leaning:tendency.leaning()})};
})();
