(function(){
 'use strict';
 // RAVampGramAPI — IF-1 (4K). Stable account/post interface over the accepted RAVampGram feed for future fragments.
 // It authors NO posts. Accepted content keeps calling RAVampGram.post directly and is untouched; new fragments register
 // an ACCOUNT (handle, display name, avatar art key) and post through post(), which is flag-gated, id-deduplicated and
 // delegated to the accepted feed (so NEW OGA's comment decoration and the phone rendering apply unchanged).
 const accounts=new Map(),listeners=new Set();
 const HANDLE=/^[a-z0-9_.]+$/;
 function registerAccount({handle,fragment,displayName=null,avatar=null,flag=null,meta={}}){
  if(!HANDLE.test(handle||''))throw new Error('RAVampGramAPI.registerAccount: handle must be lowercase [a-z0-9_.]');
  if(!fragment)throw new Error(`RAVampGramAPI.registerAccount(${handle}): fragment required`);
  if(accounts.has(handle))throw new Error(`RAVampGramAPI.registerAccount: @${handle} already registered by ${accounts.get(handle).fragment}`);
  if(flag&&!window.RAFeatures?.get(flag))throw new Error(`RAVampGramAPI.registerAccount(@${handle}): flag ${flag} is not registered`);
  accounts.set(handle,Object.freeze({handle,fragment,displayName:displayName||handle,avatar,flag,meta:Object.freeze({...meta})}));return handle;
 }
 const account=handle=>accounts.get(handle)||null;
 const accountList=()=>[...accounts.values()].map(a=>({...a,meta:{...a.meta}}));
 // avatar art key -> frozen asset path in the Art Registry (ui.avatars); null when the account has no approved avatar.
 const avatarKey=handle=>accounts.get(handle)?.avatar||null;
 const avatarFor=handle=>{const key=avatarKey(handle);return key?window.RAArtRegistry?.ui?.avatars?.[key]?.asset||null:null;};
 // post(handle,{id,text,likes,comments,action,elder}) — returns true when a NEW post was added.
 function post(handle,fields){
  const a=accounts.get(handle);if(!a)throw new Error(`RAVampGramAPI.post: @${handle} is not a registered account`);
  if(a.flag&&!window.RAFeatures.enabled(a.flag))return false;
  if(!fields?.id)throw new Error('RAVampGramAPI.post: a stable id is required (dedupe key)');
  const added=window.RAVampGram.post({...fields,handle});
  if(added)for(const fn of [...listeners]){try{fn({handle,id:fields.id,fragment:a.fragment});}catch(e){console.error('vampgram listener',e);}}
  return added;
 }
 const feed=({handle=null}={})=>window.RAVampGram.feed().filter(p=>!handle||p.handle===handle);
 const onPost=fn=>{listeners.add(fn);return ()=>listeners.delete(fn);};
 window.RAVampGramAPI={registerAccount,account,accounts:accountList,avatarKey,avatarFor,post,feed,unseen:()=>window.RAVampGram.unseen(),markSeen:()=>window.RAVampGram.markSeen(),onPost};
})();
