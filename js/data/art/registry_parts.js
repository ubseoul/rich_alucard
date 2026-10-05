(function(){
 'use strict';
 // RAArtParts — IF-1 (4O). Fragment-scoped art-registry parts. The generated RAArtRegistry (js/data/art_registry.js) is a
 // shared hot surface; instead of many agents editing it, each fragment adds ITS OWN part file
 //   js/data/art/parts/<FRAGMENT>_<name>.js   ->   RAArtParts.register('<FRAGMENT>', { ...subtree of RAArtRegistry... })
 // which is deep-merged ADDITIVELY into window.RAArtRegistry right after it loads (the loader globs the folder in sorted
 // order). Existing art resolution is unchanged: a part can only ADD keys. Any attempt to overwrite an existing entry —
 // above all a FROZEN asset — throws FROZEN_ASSET_COLLISION and the part is rejected whole (nothing is half-merged).
 const registry=window.RAArtRegistry;
 if(!registry)throw new Error('RAArtParts must load after js/data/art_registry.js');
 const isObject=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
 const provenance=[];
 function collisions(target,tree,prefix,out){
  for(const [key,value] of Object.entries(tree)){
   const here=prefix?`${prefix}.${key}`:key;
   if(!(key in target))continue;
   if(isObject(target[key])&&isObject(value))collisions(target[key],value,here,out);
   else out.push(here);
  }
  return out;
 }
 function merge(target,tree,prefix,added){
  for(const [key,value] of Object.entries(tree)){
   const here=prefix?`${prefix}.${key}`:key;
   if(!(key in target)){target[key]=JSON.parse(JSON.stringify(value));added.push(here);}
   else merge(target[key],value,here,added);
  }
 }
 function register(fragment,tree){
  if(!fragment||!isObject(tree))throw new Error('RAArtParts.register(fragment,tree) required');
  const bad=collisions(registry,tree,'',[]);
  if(bad.length){const error=new Error(`FROZEN_ASSET_COLLISION: fragment ${fragment} would overwrite existing registry entries: ${bad.slice(0,8).join(', ')}${bad.length>8?` (+${bad.length-8})`:''}`);error.code='FROZEN_ASSET_COLLISION';error.paths=bad;throw error;}
  const added=[];merge(registry,tree,'',added);provenance.push({fragment,added});return added.length;
 }
 window.RAArtParts={register,provenance:()=>provenance.map(p=>({fragment:p.fragment,added:[...p.added]})),fragments:()=>[...new Set(provenance.map(p=>p.fragment))]};
})();
