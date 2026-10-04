// F01 inside the integrated game (IF-1): DARK by default, zero behaviour change with the flag OFF, clean when ON.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import {pathToFileURL} from 'node:url';
import {full,normalize as baseNormalize} from '../if1/_lib.mjs';
const normalize=v=>baseNormalize(v).replace(/\d{4}-\d\d-\d\dT[\d:.]+Z/g,'<iso>');

async function loadF01(root,ctx){
  const manifest=JSON.parse(await readFile(path.join(root,'js/frag/F01/manifest.json'),'utf8'));
  // migrations.js is loaded before state.js in production; the namespace registry accepts it late too (declaration only)
  vm.runInContext(await readFile(path.join(root,'js/frag/F01/migrations.js'),'utf8'),ctx,{filename:'js/frag/F01/migrations.js'});
  for(const f of manifest.files)vm.runInContext(await readFile(path.join(root,f),'utf8'),ctx,{filename:f});
  return manifest;
}
export async function test(root){
  const A=await full(root),B=await full(root);
  const before=normalize(B.RAState.get());const flagsBefore=JSON.stringify(B.RAFeatures.snapshot());
  const handlersBefore=JSON.stringify(B.RAClock.handlers());const phoneBefore=JSON.stringify(B.RAPhoneRegistry.declaredApps?B.RAPhoneRegistry.declaredApps():[]);
  const manifest=await loadF01(root,B);
  // RC2 (OL-063): the economy flags now ship ON (js/if1/flag_defaults.js). This suite proves the OFF contract, so it switches them off first.
  for(const id of Object.keys(B.RAFlagDefaults||{}))if(B.RAFeatures.get(id))B.RAFeatures.set(id,false);
  // ---- DARK: registered, default OFF, nobody can reach it ----
  assert(B.RAFeatures.get('F01.showdown_core'),'flag F01.showdown_core is registered');assert.equal(B.RAFeatures.get('F01.showdown_core').fragment,'F01');
  assert.equal(B.RAFeatures.enabled('F01.showdown_core'),false);assert.equal(Object.entries(B.RAFeatures.snapshot()).some(([k,v])=>v&&!(k in (B.RAFlagDefaults||{}))),false);
  assert.throws(()=>B.RAFeatures.register({id:'F01.other',fragment:'F01',default:true}),/may not default ON/,'F01 cannot ship a flag ON');
  assert(!('F01.showdown_core' in (B.RAFlagDefaults||{})),'the dark build promotes nothing (the shipped build promotes it: tools/tests/rc2)');
  assert.equal(B.RAShowdown.createSession({seed:1}).code,'FLAG_OFF');
  assert.equal((await B.RAShowdown.f04.enter({squad:[{id:'tunde',class:'MUSCLE'}],enemies:[{type:'CHEWER',count:1}]},{headless:true})).code,'FLAG_OFF');
  assert.equal(B.RAShowdownSandbox.open().code,'FLAG_OFF');
  // ---- ZERO CHANGE: F01 loaded, flag OFF => nothing touched ----
  assert.equal(normalize(B.RAState.get()),before,'the save is untouched by loading F01');assert.equal(B.RAFrag.has('F01'),false,'no save.frag.F01 while OFF');
  assert.equal(JSON.stringify(B.RAClock.handlers()),handlersBefore,'no WAKE/NIGHT handler added');
  assert.equal(JSON.stringify(B.RAPhoneRegistry.declaredApps?B.RAPhoneRegistry.declaredApps():[]),phoneBefore,'no phone app added');
  assert.equal(JSON.stringify(B.RACombat2Ext.registered()),JSON.stringify(A.RACombat2Ext.registered()),'Combat 2.0 seams untouched');
  const snap=B.RAFeatures.snapshot();const diff=Object.keys(snap).filter(k=>!(k in JSON.parse(flagsBefore)));assert.equal(JSON.stringify(diff),'["F01.showdown_core"]','the only registry change is the one dark flag');
  assert.equal(B.RAMigrations.validate().length,0,'no migration claimed, ledger clean');assert.equal(B.RAMigrations.submissions().filter(s=>s.fragment==='F01').length,0,'F01 declares a namespace only: no version number, no migration module');
  assert.equal(B.RAMigrations.hasNamespace('F01'),true);assert.equal(B.RAState.version,16,'schema is still the accepted v16');
  // identical life with and without F01 loaded (flag OFF): byte-identical saves
  const run=async ctx=>{for(let i=0;i<6;i++){ctx.RAClock.sleep();ctx.RAWakeTriggers.pick();}return normalize(ctx.RAState.get());};
  const a=await run(A),b=await run(B);assert.equal(b,a,'six nights with F01 present + OFF are byte-identical to six nights without it');
  // ---- ON (DEV override): usable, persists ONLY under save.frag.F01, then off again ----
  B.RAFeatures.set('F01.showdown_core',true);assert.equal(B.RAFeatures.enabled('F01.showdown_core'),true);
  const made=B.RAShowdown.createSession({seed:'in-game',map:B.RAShowdownMaps.get('alley'),squad:[{id:'a',name:'A',cls:'MUSCLE',weapon:'pistol'},{id:'b',name:'B',cls:'DOC',weapon:'pistol'}],enemies:['CHEWER','CHEWER']},{store:'frag'});
  assert.equal(made.ok,true);assert.equal(made.session.dispatch({type:'MOVE',unit:'a',to:{x:1,y:6}}).ok,true);
  assert.equal(B.RAFrag.has('F01'),true);const saved=B.RAShowdown.stores.frag.load();assert.equal(B.RAShowdown.engine.hash(saved),B.RAShowdown.engine.hash(made.session.state),'the fight survives in save.frag.F01.active');
  const keys=Object.keys(JSON.parse(JSON.stringify(B.RAState.get())).frag);assert.equal(JSON.stringify(keys),'["F01"]','no other namespace was created');
  assert.equal(normalize(B.RAState.get().life),normalize(A.RAState.get().life),'life.* is never touched by a fight');
  made.session.dispatch({type:'RETREAT'});assert.equal(B.RAShowdown.stores.frag.load(),null,'ended fights clear the autosave');
  // F04 delivery: a real result flows into F04's receiveResolution unchanged
  let got=null;B.RAWarRoomShowdown={receiveResolution:r=>{got=r;return {ok:true};}};
  const ent=await B.RAShowdown.f04.enter({jobId:'ig',jobType:'TAKE_THE_BLOCK',squad:[{id:'tunde',class:'MUSCLE'},{id:'dre',class:'TALKER'}],enemies:[{type:'CHEWER',count:2}]},{headless:true});
  ent.session.dispatch({type:'RETREAT'});assert.equal(ent.session.result.outcome,'RETREAT');
  const res=B.RAShowdown.f04.toResolution(ent.session.result);B.RAWarRoomShowdown.receiveResolution(res);assert(got&&got.outcome==='retreat'&&Array.isArray(got.ogaResults));
  B.RAFeatures.set('F01.showdown_core',false);assert.equal(B.RAShowdown.createSession({seed:1}).code,'FLAG_OFF','back to dark');
  // every file the manifest names exists, is under js/frag/F01, and parses
  for(const f of [...manifest.files,...manifest.css]){assert(f.startsWith('js/frag/F01/'),f);const text=await readFile(path.join(root,f),'utf8');if(f.endsWith('.js'))new vm.Script(text,{filename:f});}
  console.log('PASS F01 integration (flag registered DARK, refuses while OFF, save/WAKE/phone/Combat2 untouched, 6 nights byte-identical, ON persists only in save.frag.F01, F04 delivery, back to dark)');
}
