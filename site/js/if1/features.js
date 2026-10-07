(function(){
 'use strict';
 // RAFeatures — IF-1 (4A). The one feature-flag registry. Every fragment integrates DARK: it registers its flags
 // here (default OFF) and gates every player-visible entry point on RAFeatures.enabled(id).
 //
 // Determinism: value = session override (DEV only: ?dev=1&ff=a.b,-c.d) > persisted override (persist:true flags
 // only, own storage key — never the game save) > RAFlagDefaults[id] (owner-promoted, js/if1/flag_defaults.js) > false.
 // Unknown ids read as OFF. Flag ids are "<FRAGMENT>.<name>"; a fragment may only register its own namespace.
 const STORE_KEY='rich_alucard_features_v1';
 const specs=new Map(),session=new Map(),listeners=new Set();
 let persisted={};
 const ID=/^[A-Za-z][A-Za-z0-9_]*\.[A-Za-z0-9_.-]+$/;
 const owners=(window.RAFlagDefaults)||{};
 const storage=()=>{try{return window.localStorage||null;}catch(e){return null;}};
 function readPersisted(){try{const raw=storage()?.getItem(STORE_KEY);const value=raw?JSON.parse(raw):{};return value&&typeof value==='object'&&!Array.isArray(value)?value:{};}catch(e){return {};}}
 function writePersisted(){try{storage()?.setItem(STORE_KEY,JSON.stringify(persisted));return true;}catch(e){return false;}}
 persisted=readPersisted();
 function devSession(){
  try{
   const search=typeof location!=='undefined'?String(location.search||''):'';if(!/[?&]dev=1\b/.test(search))return;
   const match=/[?&]ff=([^&]*)/.exec(search);if(!match)return;
   for(const raw of decodeURIComponent(match[1]).split(',')){const token=raw.trim();if(!token)continue;const off=token.startsWith('-');session.set(off?token.slice(1):token,!off);}
  }catch(e){}
 }
 devSession();
 function register(spec){
  if(!spec||typeof spec.id!=='string'||!ID.test(spec.id))throw new Error(`RAFeatures.register: invalid flag id ${JSON.stringify(spec?.id)}`);
  const fragment=spec.fragment||spec.id.split('.')[0];
  if(spec.id.split('.')[0]!==fragment)throw new Error(`RAFeatures.register: ${spec.id} is outside fragment namespace ${fragment}`);
  const prior=specs.get(spec.id);
  if(prior){if(prior.fragment!==fragment)throw new Error(`RAFeatures.register: ${spec.id} already owned by ${prior.fragment}`);return prior.id;}
  if(spec.default===true&&owners[spec.id]!==true)throw new Error(`RAFeatures.register: ${spec.id} may not default ON; the integration owner promotes it in js/if1/flag_defaults.js`);
  specs.set(spec.id,Object.freeze({id:spec.id,fragment,description:String(spec.description||''),persist:!!spec.persist,requires:Object.freeze([...(spec.requires||[])]),default:false}));
  return spec.id;
 }
 function baseValue(id){return owners[id]===true;}
 function raw(id){
  if(session.has(id))return session.get(id);
  const spec=specs.get(id);
  if(spec?.persist&&typeof persisted[id]==='boolean')return persisted[id];
  return baseValue(id);
 }
 function resolve(id,stack){
  if(id==='F05.trap'&&window.RARC3)return false;
  if(typeof id!=='string'||!specs.has(id))return false;
  if(stack.includes(id))return false; // dependency cycle => OFF (a diamond of requires is fine: the stack is per path)
  if(!raw(id))return false;
  for(const dep of specs.get(id).requires)if(!resolve(dep,[...stack,id]))return false;
  return true;
 }
 const enabled=id=>resolve(id,[]);
 function emit(id,value){for(const fn of [...listeners]){try{fn({id,value,enabled:enabled(id)});}catch(e){console.error('feature listener',e);}}try{document.dispatchEvent(new CustomEvent('ra:feature',{detail:{id,value}}));}catch(e){}}
 // set(id,value,{persist}) — DEV/test control. persist only sticks for flags registered persist:true.
 function set(id,value,{persist=false}={}){
  const spec=specs.get(id);if(!spec)throw new Error(`RAFeatures.set: unknown flag ${id}`);
  const next=!!value;
  if(persist&&spec.persist){persisted={...persisted,[id]:next};writePersisted();session.delete(id);}
  else session.set(id,next);
  emit(id,next);return enabled(id);
 }
 function clear(id){const spec=specs.get(id);session.delete(id);if(spec?.persist&&id in persisted){const next={...persisted};delete next[id];persisted=next;writePersisted();}emit(id,null);}
 function onChange(fn){listeners.add(fn);return ()=>listeners.delete(fn);}
 const get=id=>specs.get(id)||null;
 const list=(fragment=null)=>[...specs.values()].filter(s=>!fragment||s.fragment===fragment).sort((a,b)=>a.id<b.id?-1:1).map(s=>({...s,requires:[...s.requires],enabled:enabled(s.id)}));
 const snapshot=()=>Object.fromEntries(list().map(s=>[s.id,s.enabled]));
 const anyEnabled=()=>list().some(s=>s.enabled);
 // Reserved DARK flags for the campaign fragments (registered here so phone/registry hooks can name them before the
 // fragment's own files exist). A fragment adds sub-flags in its own file.
 const RESERVED=[['F01','showdown','SHOWDOWN_CORE'],['F02','iron_and_grace','IRON_AND_GRACE (weapon slot, boss scripts)'],['F03','new_oga_ladder_close','NEW_OGA_LADDER_CLOSE'],['F04','war_room','PLAYMAKERS_WAR_ROOM phone app'],['F05','trap','THE_TRAP: Trap / Counting phone app'],['F06','rainmaker','RAINMAKER phone app'],['F07','m8_and_finale','M8_AND_FINALE'],['F02','armory','Armory phone app']];
 for(const [fragment,name,description] of RESERVED)register({id:`${fragment}.${name}`,fragment,description});
 window.RAFeatures={register,enabled,set,clear,onChange,get,list,snapshot,anyEnabled,storageKey:STORE_KEY,reserved:RESERVED.map(([f,n])=>`${f}.${n}`)};
})();
