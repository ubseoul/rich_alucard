// Shared helpers for the IF-1 contract tests (not a test file: leading underscore).
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert';
import {pathToFileURL} from 'node:url';

export const load=async(root,rel)=>import(pathToFileURL(path.join(root,rel)).href);
export const read=(root,file)=>readFile(path.join(root,file),'utf8');
export function memoryStorage(){const data=new Map();return {getItem:k=>data.has(k)?data.get(k):null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k),_data:data};}

// A tiny isolated vm "browser" for module-level tests: window, storage, document events, CustomEvent, optional location.
export function sandbox({search='',extra={}}={}){
  const listeners={};const storage=memoryStorage();
  const ctx={console,structuredClone,setTimeout,clearTimeout,Intl,URLSearchParams,localStorage:storage,
    location:{search},
    document:{addEventListener(t,f){(listeners[t]=listeners[t]||[]).push(f);},removeEventListener(){},dispatchEvent(e){for(const f of listeners[e.type]||[])f(e);return true;}},
    CustomEvent:function(type,init){this.type=type;this.detail=init?.detail;},...extra};
  ctx.window=ctx;vm.createContext(ctx);return ctx;
}
export async function run(root,ctx,files){for(const f of files)vm.runInContext(await read(root,f),ctx,{filename:f});return ctx;}

// The full headless game (production load order, IF-1 in, every fragment flag OFF).
export async function game(root,opts={}){const {loadBtf}=await load(root,'tools/btf-test.mjs');return loadBtf(root,opts);}

// Strip volatile fields so two runs of the same life compare byte-equal.
export function normalize(value){
  const s=JSON.stringify(value,(k,v)=>k==='at'||k==='savedAt'?undefined:v);
  return s.replace(/\b1[5-9]\d{11}\b/g,'<ms>');
}
export const throwsCode=(fn,pattern)=>{try{fn();}catch(e){return pattern.test(String(e.code||'')+' '+String(e.message||e));}return false;};
// Cross-realm safe deep equality (vm objects have a different Object.prototype): compare canonical JSON.
export const same=(a,b,message)=>{const {strict}=assert;strict.equal(JSON.stringify(a),JSON.stringify(b),message);};

// The headless game PLUS the browser-only IF-1 modules (phone registry on a stub RAPhoneApps, audio manifest + parts), i.e.
// every module RAIF1 names is present. Used by the contract snapshot and the zero-change checks.
export async function full(root,opts={}){
  const ctx=await game(root,opts);
  if(!ctx.RAPhoneApps){const apps=new Map();ctx.RAPhoneApps={register:a=>apps.set(a.id,{canon:false,order:50,...a}),unregister:id=>apps.delete(id),get:id=>apps.get(id)||null,list:()=>[...apps.values()],label:id=>id,isUnlocked:()=>true};}
  await run(root,ctx,['js/if1/phone_registry.js','js/data/audio_manifest.js','js/data/audio/manifest_parts.js']);
  return ctx;
}
