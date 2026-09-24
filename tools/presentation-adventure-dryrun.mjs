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

export async function dryRun(){
 const ctx=await loadBtf(root);
 for(const file of ['js/data/stages.js','js/data/presentation.js','js/data/presentation_assets.js','js/data/presentation_locks.js','js/engine/stage.js'])vm.runInContext(await readFile(path.join(root,file),'utf8'),ctx,{filename:file});
 const D=ctx.RAPresentationDirector,people=ctx.RABtfPeople,meta=ctx.RAPresentationAssets,dummy=new Proxy({},{get:(t,k)=>k==='vars'?{}:()=>false});
 const screens=new Map();
 for(const def of ctx.RAAdventures.all()){
  let env=null,actors={};
  for(const [id,node] of Object.entries(def.nodes)){
   let e=node.env,a=node.actors;
   try{if(typeof e==='function')e=e(dummy)}catch{e=null}
   try{if(typeof a==='function')a=a(dummy)}catch{a=undefined}
   if(typeof e==='string')env=e;if(a===null)actors={};else if(a&&typeof a==='object')actors={...(node.keepActors?actors:{}),...a};
   if(!env||node.end)continue;
   const cast={};for(const [slot,spec] of Object.entries(actors)){if(!spec)continue;const pid=typeof spec==='string'?spec:spec.id;cast[slot]={...(typeof spec==='object'?spec:{}),id:pid}}
   const key=`${env}|${Object.entries(cast).map(([s,c])=>`${s}:${c.id}`).sort().join(',')}`;
   const s=screens.get(key)||{env,cast,shot:node.shot||null,nodes:0,adventures:new Set()};s.nodes++;s.adventures.add(def.id);screens.set(key,s);
  }
 }
 const result={screens:0,nodes:0,pass:0,fail:0,profiles:{},failures:{},placeholderActors:0,byEnvironment:{}};
 for(const [key,s] of screens){
  const envDef=ctx.RAEnvironments.get(s.env);if(!envDef)continue;
  const cast={};for(const [slot,c] of Object.entries(s.cast)){const x=c.x??SLOTS[slot]??135;cast[slot]={...c,x,flip:c.flip||(c.id==='rich'&&x>150)}}
  const assets={};for(const [slot,c] of Object.entries(cast)){const sprite=c.src||(c.id==='rich'?'assets/rich_standing_right.png':people?.get?.(c.id)?.sprite);assets[slot]=sprite&&meta[sprite]?sprite:PROXY;if(!(sprite&&meta[sprite]))result.placeholderActors++}
  const stage=D.adventureStage(envDef,cast,{slots:SLOTS,node:s.shot?{shot:s.shot}:null,states:{}});
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
 }
 return result;
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
 const r=await dryRun(),out=path.resolve(process.argv[2]||path.join(root,'work','presentation_census','REVIEWER_ONLY','adventure-dryrun.json'));
 await mkdir(path.dirname(out),{recursive:true});await writeFile(out,JSON.stringify(r,null,1));
 console.log(`adapter dry run: ${r.screens} distinct screens (${r.nodes} nodes) — PASS ${r.pass} / FAIL ${r.fail}; profiles ${JSON.stringify(r.profiles)}; failing checks ${JSON.stringify(r.failures)}; placeholder actor slots ${r.placeholderActors}`);
}
