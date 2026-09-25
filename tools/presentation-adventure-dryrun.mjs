#!/usr/bin/env node
// Presentation Director adapter dry run over EVERY authored adventure screen (numbers only — no images, no text).
// For each distinct (environment, cast) screen it builds the adapter contract, lets the Director choose the default
// shot, solves the camera at 360×740 / 390×844 / 430×932 and runs geometry lint against the dialogue-mode UI band.
// Actors without registered sprite metadata (RAPixel placeholders) use Rich's standing metrics as a proxy.
// Usage: node tools/presentation-adventure-dryrun.mjs [outFile]
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {loadBtf} from './btf-test.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SIZES=[[360,740],[390,844],[430,932]];
const SLOTS={farLeft:34,left:72,mid:135,right:198,farRight:238};
const PROXY='assets/rich_standing_right.png';
export const LOCK='docs/presentation/locks/wave1-adventures.json';

export async function dryRun(){
 const ctx=await loadBtf(root);
 for(const file of ['js/data/stages.js','js/data/presentation.js','js/data/presentation_assets.js','js/data/presentation_locks.js','js/engine/stage.js'])vm.runInContext(await readFile(path.join(root,file),'utf8'),ctx,{filename:file});
 const D=ctx.RAPresentationDirector,people=ctx.RABtfPeople,meta=ctx.RAPresentationAssets,dummyWith=vars=>new Proxy({},{get:(t,k)=>k==='vars'?vars:()=>false});
 const screens=new Map();
 // Casts computed at runtime from adventure vars are also walked under each declared `presentationVariants` entry.
 for(const [def,vars] of ctx.RAAdventures.all().flatMap(def=>[[def,{}],...(def.presentationVariants||[]).map(v=>[def,v])])){
  const dummy=dummyWith(vars);let env=null,actors={};
  for(const [id,node] of Object.entries(def.nodes)){
   let e=node.env,a=node.actors;
   try{if(typeof e==='function')e=e(dummy)}catch{e=null}
   try{if(typeof a==='function')a=a(dummy)}catch{a=undefined}
   if(typeof e==='string')env=e;if(a===null)actors={};else if(a&&typeof a==='object')actors={...(node.keepActors?actors:{}),...a};
   if(!env||node.end)continue;
   const cast={};for(const [slot,spec] of Object.entries(actors)){if(!spec)continue;const pid=typeof spec==='string'?spec:spec.id;cast[slot]={...(typeof spec==='object'?spec:{}),id:pid}}
   const key=ctx.RAPresentationData.screenKey(env,cast);
   const s=screens.get(key)||{key,env,cast,castSpecs:JSON.parse(JSON.stringify(actors)),shot:node.shot||null,nodes:0,adventures:new Set(),first:`${def.id}:${id}`,refs:[]};s.nodes++;s.adventures.add(def.id);s.refs.push(`${def.id}:${id}`);screens.set(key,s);
  }
 }
 const result={screens:0,nodes:0,pass:0,fail:0,profiles:{},failures:{},placeholderActors:0,byEnvironment:{},rows:[]};
 for(const [key,s] of screens){
  const envDef=ctx.RAEnvironments.get(s.env);if(!envDef)continue;
  const registered=ctx.RAEnvironments.surfaceLayers(envDef,{key}).slots;
  const cast={};for(const [slot,c] of Object.entries(s.cast)){const x=c.x??registered[slot]?.x??SLOTS[slot]??135;cast[slot]={...c,x,flip:c.flip||(c.id==='rich'&&x>150)}}
  const assets={};for(const [slot,c] of Object.entries(cast)){const person=c.id==='rich'?people?.rich:people?.get?.(c.id),sprite=c.src||(c.state&&person?.states?.[c.state])||(c.id==='rich'?'assets/rich_standing_right.png':person?.sprite);assets[slot]=sprite&&meta[sprite]?sprite:PROXY;if(!(sprite&&meta[sprite]))result.placeholderActors++}
  const stage=D.adventureStage(envDef,cast,{slots:SLOTS,node:s.shot?{shot:s.shot}:null,states:{},assets});
  let ok=true,profile=null;const fails=new Set();
  for(const [W,H] of SIZES){
   const L=D.screenLayout('dialogue',W,H),view={w:L.world.w,h:L.world.h};
   const shots=stage.director.shotCandidates;let shot=shots.at(-1);
   for(const candidate of shots){if(!candidate.focal.length){shot=candidate;break}const cam=D.solve({stage,profile:candidate.profile,focal:candidate.focal,include:candidate.include,reference:candidate.reference,assets,view});const f=D.project(stage,L,cam,Object.keys(cast).map(slot=>D.worldActor(stage,slot,assets[slot])),3);f.layout=L;if(D.lintFrame(stage,f,{profile:candidate.profile,focal:candidate.focal,reference:candidate.reference}).checks.find(c=>c.id==='shot-size')?.pass){shot=candidate;break}}
   profile=shot.profile;
   const cam=D.solve({stage,profile:shot.profile,focal:shot.focal,include:shot.include,reference:shot.reference,assets,view});
   const frame=D.project(stage,L,cam,Object.keys(cast).map(slot=>D.worldActor(stage,slot,assets[slot])),3);frame.layout=L;
   const lint=D.lintFrame(stage,frame,{profile:shot.profile,focal:shot.focal,speakers:shot.speakers,reference:shot.reference,uiRects:[L.ui]});
   for(const c of lint.checks)if(!c.pass&&!c.id.startsWith('authority'))fails.add(c.id.split(':')[0]);
   if([...fails].length)ok=false;
  }
  result.screens++;result.nodes+=s.nodes;result.profiles[profile]=(result.profiles[profile]||0)+1;
  const envRow=result.byEnvironment[s.env]||(result.byEnvironment[s.env]={screens:0,pass:0});envRow.screens++;
  if(ok){result.pass++;envRow.pass++}else{result.fail++;for(const f of fails)result.failures[f]=(result.failures[f]||0)+1}
  const exception=ctx.RAPresentationData.adventure.exceptions?.[s.key]||null;
  result.rows.push({key:s.key,env:s.env,castSpecs:s.castSpecs,cast:Object.keys(s.cast).length,first:s.first,refs:s.refs,profile,pass:ok,fails:[...fails],exception:exception?.ticket||null});
 }
 result.unexpected=result.rows.filter(r=>!r.pass&&!r.exception).map(r=>r.key);
 result.staleExceptions=Object.keys(ctx.RAPresentationData.adventure.exceptions||{}).filter(k=>!result.rows.some(r=>r.key===k&&!r.pass));
 result.lock=Object.fromEntries(result.rows.map(r=>[r.key,r.exception?`${r.profile}!${r.exception}`:r.profile]).sort(([a],[b])=>a.localeCompare(b)));
 return result;
}

if(process.argv[1]===fileURLToPath(import.meta.url)&&!process.argv.includes('--combat')){
 const r=await dryRun(),out=path.resolve(process.argv[2]&&process.argv[2]!=='--write-lock'?process.argv[2]:path.join(root,'work','presentation_census','REVIEWER_ONLY','adventure-dryrun.json'));
 if(process.argv.includes('--write-lock')){await mkdir(path.join(root,'docs','presentation','locks'),{recursive:true});await writeFile(path.join(root,LOCK),JSON.stringify({about:'Wave 1 regression lock: adapter default shot per adventure screen (environment|slot:person). profile!ticket = accepted exception. Regenerate with node tools/presentation-adventure-dryrun.mjs --write-lock after a reviewed change.',screens:r.lock},null,1)+'\n');console.log(`wrote ${LOCK}`)}
 await mkdir(path.dirname(out),{recursive:true});await writeFile(out,JSON.stringify(r,null,1));
 console.log(`adapter dry run: ${r.screens} distinct screens (${r.nodes} nodes) — PASS ${r.pass} / FAIL ${r.fail}; profiles ${JSON.stringify(r.profiles)}; failing checks ${JSON.stringify(r.failures)}; placeholder actor slots ${r.placeholderActors}`);
}

// ---- Wave 2: Combat 2.0 dry run — every authored fight × every environment it can resolve to ----
export const COMBAT_LOCK='docs/presentation/locks/wave2-combat.json';
export async function combatDryRun(){
 const ctx=await loadBtf(root);
 for(const file of ['js/data/stages.js','js/data/presentation.js','js/data/presentation_assets.js','js/data/presentation_locks.js','js/engine/stage.js'])vm.runInContext(await readFile(path.join(root,file),'utf8'),ctx,{filename:file});
 const D=ctx.RAPresentationDirector,meta=ctx.RAPresentationAssets,E=ctx.RACombatData.ENEMIES,people=ctx.RABtfPeople;
 const varSets=[{},{where:'slurp'},{where:'grave'}];
 const fights=new Map();
 for(const def of ctx.RAAdventures.all())for(const [id,node] of Object.entries(def.nodes)){if(!node.fight)continue;
  for(const vars of varSets){const A={vars,L:{},get:k=>vars[k],flag:()=>false};let params={};try{params=typeof node.fight.params==='function'?node.fight.params(A):(node.fight.params||{})}catch{}
   let env=params.env;try{if(typeof env==='function')env=env(A)}catch{env=null}env=env||'throne';
   const key=`${node.fight.enemy}@${env}`;if(!fights.has(key))fights.set(key,{enemy:node.fight.enemy,env,refs:new Set()});fights.get(key).refs.add(`${def.id}:${id}`)}}
 const rows=[];
 for(const [key,f] of fights){
  const def=E[f.enemy],envDef=ctx.RAEnvironments.get(f.env)||ctx.RAEnvironments.get('throne'),art=ctx.RACombatData.enemyArt(f.enemy),sprite=art.base;
  // Runtime variant matrix: the enemy's base sprite plus every approved frozen combat state (RACombatData.enemyArt, as js/scenes/combat2.js).
  const states=[sprite,...Object.values(art.roles).map(r=>r.src)].filter((s,i,a)=>s&&meta[s]&&a.indexOf(s)===i);
  const stage=D.combat2Stage(envDef,def?.person||f.enemy,{flip:!!sprite,minions:def?.minions?5:0,states});
  const fails=new Set();let body=null;
  for(const enemyAsset of states.length?states:['assets/rich_standing_right.png'])for(const [W,H] of SIZES){const assets={rich:'assets/rich_standing_right.png',enemy:enemyAsset};const L=D.screenLayout('combat',W,H),shot=stage.director.shots.default;
   const cam=D.solve({stage,profile:'combat',focal:shot.focal,reference:'rich',assets,states:stage.director.states,view:{w:L.world.w,h:L.world.h}});
   const frame=D.project(stage,L,cam,['rich','enemy'].map(slot=>D.worldActor(stage,slot,assets[slot])),3);frame.layout=L;
   const lint=D.lintFrame(stage,frame,{profile:'combat',focal:shot.focal,reference:'rich',uiRects:[L.hud,L.ui]});body=lint.metrics.body;
   for(const c of lint.checks)if(!c.pass&&!c.id.startsWith('authority'))fails.add(c.id.split(':')[0])}
  rows.push({key,enemy:f.enemy,env:f.env,refs:[...f.refs],pass:!fails.size,fails:[...fails],body,states:states.length,placeholderEnemy:!(sprite&&meta[sprite])});
 }
 rows.sort((a,b)=>a.key.localeCompare(b.key));
 return {fights:rows.length,pass:rows.filter(r=>r.pass).length,rows,lock:Object.fromEntries(rows.map(r=>[r.key,r.pass?'combat':`FAIL:${r.fails.join('+')}`]))};
}
if(process.argv[1]===fileURLToPath(import.meta.url)&&process.argv.includes('--combat')){
 const r=await combatDryRun();console.log(`combat dry run: ${r.fights} fight×environment screens — PASS ${r.pass}`);for(const row of r.rows)if(!row.pass)console.log('FAIL',row.key,row.fails.join(','),row.body);
 if(process.argv.includes('--write-lock')){await writeFile(path.join(root,COMBAT_LOCK),JSON.stringify({about:'Wave 2 regression lock: Combat 2.0 Director framing per enemy@environment (combat profile). Regenerate with node tools/presentation-adventure-dryrun.mjs --combat --write-lock after a reviewed change.',fights:r.lock},null,1)+'\n');console.log(`wrote ${COMBAT_LOCK}`)}
}
