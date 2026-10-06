import assert from 'node:assert/strict';
import vm from 'node:vm';
import{readFile as readSource}from'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
export async function test(root=process.cwd()){
 const readFile=(file,...args)=>readSource(path.resolve(root,file),...args);

class El{constructor(){this.attrs={};this.style={};this.dataset={};this.hidden=false;this.isConnected=true;this.clientWidth=270;this.clientHeight=480;this.listeners={};}getAttribute(k){return this.attrs[k]??null;}setAttribute(k,v){this.attrs[k]=v;}removeAttribute(k){delete this.attrs[k];}append(el){el.isConnected=true;}remove(){this.isConnected=false;}addEventListener(k,f){this.listeners[k]=f;}removeEventListener(k){delete this.listeners[k];}}
function scope(){let active=true;const clean=[];return{isActive:()=>active,child(){const s=scope();clean.push(()=>s.cancel());return s;},cleanup:f=>clean.push(f),listen(el,k,f){el.addEventListener(k,f);clean.push(()=>el.removeEventListener(k));},timeout(f,ms){const t=setTimeout(()=>{if(active)f();},ms);return()=>clearTimeout(t);},cancel(){if(!active)return;active=false;clean.splice(0).forEach(f=>f());}};}
for(const mode of ['complete','cancel','skip','reduced']){const doc=new El();doc.createElement=()=>new El();const c={document:doc,WeakMap,Map,Promise,window:null};c.window=c;c.matchMedia=()=>({matches:mode==='reduced'});vm.createContext(c);vm.runInContext(await readFile('js/systems/pixel_cutscene.js','utf8'),c);const parent=scope(),root=new El(),actor=new El();actor.setAttribute('style','original');actor.setAttribute('src','canonical.png');const p=c.RABeatTimeline.play({root,scope:parent,duration:30,frames:[{at:0,actors:[{el:actor,src:'motion.png',dy:-40}]},{at:20,actors:[{el:actor,src:'canonical.png'}]}]});if(mode==='cancel')parent.cancel();if(mode==='skip')doc.listeners.keydown({key:'Enter',preventDefault(){},stopPropagation(){}});const r=await p;assert.equal(r.completed,mode!=='cancel');assert.equal(r.cancelled,mode==='cancel');assert.equal(actor.getAttribute('src'),'canonical.png');assert.equal(actor.getAttribute('style'),'original');assert.equal(Object.keys(doc.listeners).length,0);}
console.log('PASS synthetic DOM: completed, parent cancellation, keyboard skip, reduced motion; actor restoration and listener cleanup.');

}
if(process.argv[1]===fileURLToPath(import.meta.url))await test();
