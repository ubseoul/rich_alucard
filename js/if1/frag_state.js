(function(){
 'use strict';
 // RAFrag — IF-1 (4B). Per-fragment save namespaces: save.frag.<FRAGMENT>.
 // Lazy by design: the namespace does not exist in a save until a fragment writes, so with every flag OFF the saved
 // JSON is byte-identical to pre-IF-1. Reads always return a fresh deep copy merged over the declared defaults.
 const clone=v=>JSON.parse(JSON.stringify(v));
 const isObject=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
 const root=()=>window.RAState.get().frag;
 const defaults=fragment=>window.RAMigrations?.namespaceDefaults?.(fragment)||{};
 function fill(base,d){for(const k of Object.keys(d)){if(base[k]===undefined)base[k]=clone(d[k]);else if(isObject(base[k])&&isObject(d[k]))fill(base[k],d[k]);}return base;}
 const has=fragment=>isObject(root())&&isObject(root()[fragment]);
 function get(fragment){return fill(has(fragment)?clone(root()[fragment]):{},defaults(fragment));}
 function read(fragment,path,fallback=undefined){let cur=get(fragment);for(const part of String(path||'').split('.').filter(Boolean)){if(cur===null||typeof cur!=='object')return fallback;cur=cur[part];}return cur===undefined?fallback:cur;}
 // Creates the namespace (with its declared defaults) on first write.
 function ensure(fragment){if(has(fragment))return get(fragment);window.RAState.patch(`frag.${fragment}`,clone(defaults(fragment)));return get(fragment);}
 function patch(fragment,path,value){
  if(!fragment||/[.\s]/.test(fragment))throw new Error(`RAFrag.patch: invalid fragment ${fragment}`);
  if(!has(fragment))ensure(fragment);
  const parts=String(path||'').split('.').filter(Boolean);
  return parts.length?window.RAState.patch(`frag.${fragment}.${parts.join('.')}`,value):window.RAState.patch(`frag.${fragment}`,value);
 }
 const list=()=>isObject(root())?Object.keys(root()).sort():[];
 window.RAFrag={has,get,read,ensure,patch,list};
})();
