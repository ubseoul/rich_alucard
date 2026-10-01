// Shared helpers for the F04 suites (not a test file: leading underscore).
import path from 'node:path';
import vm from 'node:vm';
import {pathToFileURL} from 'node:url';
import {full, run} from '../if1/_lib.mjs';

export const F01_FILES=['rng','data','rules','engine','ai','maps','packets','showdown','play_contract','integration'].map(f=>`js/frag/F01/${f}.js`);
export const F04_FILES=['migrations','districts','crew','jobs','heat_config','vampgram','report_card','wake','play_adapter','phone_app'].map(f=>`js/frag/F04/${f}.js`);

// What F03 (NEW_OGA_LADDER_CLOSE, frag/new-oga-ladder-close/001 js/frag/F03/new_oga_ladder_close.js) does at load: it DEFINES Koreatown,
// tolerating an "already defined" error. Reproduced verbatim as the provider contract F04 must consume.
export const F03_PROVIDER=`try{window.RADistricts?.define?.({id:'koreatown',fragment:'F03',label:'Koreatown'});}catch(e){if(!/already defined/.test(String(e.message)))console.error(e);}`;

// Production fragment load order is F01, F02, F03, F04 (loader manifest): F03 before F04.
export async function loadWar(root,{flagOn=true,f03=true,f01=true,seedState=null,f04Flag=true}={}){
  const ctx=await full(root,seedState?{seedState}:{});
  if(f01)await run(root,ctx,F01_FILES);
  if(f03)vm.runInContext(F03_PROVIDER,ctx,{filename:'F03-provider-fixture'});
  await run(root,ctx,F04_FILES);
  if(flagOn){if(f04Flag)ctx.RAFeatures.set('F04.war_room',true);if(f01)ctx.RAFeatures.set('F01.showdown_core',true);}
  return ctx;
}
export const saveOf=ctx=>JSON.parse(ctx.localStorage.getItem('rich_alucard_save_v1'));

// The REAL F01 engine as a headless PLAY host: request in, canonical result out (js/frag/F01/play/adapter.mjs runHeadless).
export async function playHost(root,{policy='careful',log=null}={}){
  const url=f=>pathToFileURL(path.join(root,f)).href;
  await import(url('tools/tests/f01/play-sim/globals.mjs'));
  if(!globalThis.RAPlayContract)vm.runInThisContext(await (await import('node:fs/promises')).readFile(path.join(root,'js/frag/F01/play_contract.js'),'utf8'));
  const {makeDriver}=await import(url('tools/tests/f01/play-sim/driver.mjs'));
  const AD=await import(url('js/frag/F01/play/adapter.mjs'));
  let saved=null;const cache=new Map();
  const host={AD,calls:0,trace:[],worlds:()=>saved,
    async transport(req){
      const plain=JSON.parse(JSON.stringify(req));
      if(cache.has(plain.requestId)){host.answeredFromRecord=(host.answeredFromRecord||0)+1;return JSON.parse(JSON.stringify(cache.get(plain.requestId)));} // F01 answers a completed request from its record
      host.calls++;if(log)log.push(plain);
      const r=AD.runHeadless(plain,makeDriver(typeof policy==='function'?policy(plain):policy),saved);
      if(r.result.status==='COMPLETE'||r.result.status==='DECLINED'){cache.set(plain.requestId,r.result);if(r.result.status==='COMPLETE')saved=r.world;}
      host.trace.push({req:plain,res:JSON.parse(JSON.stringify(r.result))});
      return JSON.parse(JSON.stringify(r.result));
    }};
  return host;
}

// A game where WAR ROOM is active, Rich owns real cars, has money, and the six Ogas are ACTIVE.
export function activate(ctx,{money=200000,cars=['toyota_supra_mk4_001','lambo_urus_oxblood']}={}){
  ctx.RAFrag.patch('F04','active',true);ctx.RAFrag.patch('F04','offer.status','accepted');
  ctx.RAState.patch('life.resources.money',money);
  for(const id of cars)ctx.RALife.addCar({id,make:'X',model:id,short:id,price:1,value:1,parts:{}});
}
export const card=(ctx,type,district='inglewood',extra={})=>ctx.RAWarRoomJobs.buildJobCard({type,district,...extra});
export const money=ctx=>Number(ctx.RAState.get().life.resources.money);
