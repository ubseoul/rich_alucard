(function(){
 'use strict';
 // RAStateWatch — IF-1 support. ONE interception of the RAState mutation API (patch/save/reset/load) that lets the IF-1
 // services (money ledger, HEAT, trust) observe accepted systems' writes without editing those systems.
 // Watchers select a primitive from the save; they fire when it changes after any RAState mutation.
 // Interception is behavior-preserving: the original function runs first, unchanged, and its return value is returned.
 const watchers=new Map();let installed=false;
 const read=w=>{try{return w.select(window.RAState.get());}catch(e){return undefined;}};
 function check(via){for(const w of watchers.values()){const next=read(w);if(next!==w.last){const prev=w.last;w.last=next;if(prev!==undefined&&!w.silentVia?.has(via.split(':')[0])){try{w.fn(next,prev,{via});}catch(e){console.error('state watcher',w.id,e);}}}}}
 function install(){
  if(installed)return;installed=true;const S=window.RAState;
  for(const name of ['patch','save','reset','load','transaction']){
   const original=S[name];if(typeof original!=='function')continue;
   S[name]=function(...args){const result=original.apply(this,args);check(name==='patch'?`patch:${args[0]}`:name);return result;};
  }
 }
 // watch(id,selector,fn,{silentVia}): fn(next,prev,{via}) after any mutation that changes selector(save).
 // silentVia: mutation kinds ('load','reset') that re-baseline without firing. Re-registering an id replaces it.
 function watch(id,select,fn,{silentVia=['load','reset']}={}){install();const w={id,select,fn,last:undefined,silentVia:new Set(silentVia)};w.last=read(w);watchers.set(id,w);return ()=>watchers.delete(id);}
 function rebaseline(){for(const w of watchers.values())w.last=read(w);}
 window.RAStateWatch={watch,rebaseline,check:()=>check('manual'),ids:()=>[...watchers.keys()]};
})();
