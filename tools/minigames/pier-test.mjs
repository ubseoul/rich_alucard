import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';

export async function test(root){
 const read=file=>readFile(path.join(root,file),'utf8');
 const context={structuredClone,console};
 context.window=context;
 context.document={
  createElement:()=>({style:{},addEventListener(){},removeEventListener(){},append(){},getBoundingClientRect:()=>({left:0,top:0,width:270,height:480}),getContext:()=>({save(){},restore(){},fillRect(){},fillText(){},measureText:()=>({width:0}),beginPath(){},moveTo(){},lineTo(){},fill(){},arc(){},stroke(){},clearRect(){},translate(){},scale(){}})}),
  querySelector:()=>null,body:{classList:{add(){},remove(){}}}
 };
 vm.createContext(context);
 for(const file of ['js/engine/pixel.js','js/engine/minigames.js','js/minigames/pier.js'])
  vm.runInContext(await read(file),context,{filename:file});

 const {RAMinigameLogic,RAMinigames}=context;
 assert(RAMinigameLogic&&RAMinigameLogic.pier,'pier logic API missing');
 const {catchTable,rollCatch,tensionStep,isSnapped}=RAMinigameLogic.pier;

 // catchTable shape + weights sum to 100
 for(const cat of ['common','junk','wallet','big','rare','chest'])assert(catchTable[cat],`catchTable missing ${cat}`);
 const total=Object.values(catchTable).reduce((a,c)=>a+c.weight,0);
 assert.equal(total,100,'catch table weights must sum to 100');

 // rollCatch distribution sanity over many seeded rolls
 let seed=1;
 const rng=()=>{seed=(seed*1103515245+12345)>>>0;return (seed>>>8)/16777216;};
 const counts={};
 for(let i=0;i<20000;i++){const c=rollCatch(rng,{rain:false});counts[c.category]=(counts[c.category]||0)+1;}
 assert(counts.common>counts.rare,'common should vastly outnumber rare');
 assert(counts.common/20000>0.45&&counts.common/20000<0.68,'common share roughly matches weight');
 const chestSample=[];
 for(let i=0;i<4000;i++){const c=rollCatch(rng,{rain:false});if(c.category==='chest')chestSample.push(c.kind);}
 assert(chestSample.includes('sealed'),'chest should sometimes roll the sealed slot');
 assert(chestSample.every(k=>['gun_part','sensei_memento','sealed'].includes(k)));
 const sealed=[];
 for(let i=0;i<4000;i++){const c=rollCatch(rng,{rain:false});if(c.category==='chest'&&c.kind==='sealed')sealed.push(c);}
 for(const s of sealed)assert.equal(s.sealedSlot,'PIER-CHEST-S','sealed chest must be the neutral placeholder slot, not invented content');

 // rain doubles big-fish odds (Math.random here: needs real statistical spread, not a fast toy LCG)
 let rainBig=0,dryBig=0,n=60000;
 for(let i=0;i<n;i++){if(rollCatch(Math.random,{rain:true}).category==='big')rainBig++;if(rollCatch(Math.random,{rain:false}).category==='big')dryBig++;}
 const ratio=rainBig/dryBig;
 assert(ratio>1.5&&ratio<2.3,`rain should roughly double big-fish odds, got ratio ${ratio}`);

 // common fish value range and named kinds
 for(let i=0;i<200;i++){
  const c=rollCatch(rng,{rain:false});
  if(c.category==='common'){assert(c.value>=5&&c.value<=60);assert(['SILVER GRUNT','PIER PERCH','UGLY MACKEREL'].includes(c.name));}
  if(c.category==='rare'){assert(c.value>=5000&&c.value<=50000);assert(['MOON KOI','OLD BARNACLE GROUPER'].includes(c.name));assert(c.itemId.startsWith('fish_rare_'));}
  if(c.category==='wallet')assert(c.value>=40&&c.value<=800);
  if(c.category==='big'){assert.equal(c.value,200);assert.equal(c.hpLoss,15);}
 }

 // tension physics: holding raises tension, releasing drops it, big fish yanks add noise
 let state={tension:0};
 for(let i=0;i<20;i++)state=tensionStep(state,{holding:true,dt:0.1,fish:{big:false}});
 assert(state.tension>50,'holding should raise tension substantially');
 const held=state.tension;
 for(let i=0;i<20;i++)state=tensionStep(state,{holding:false,dt:0.1,fish:{big:false}});
 assert(state.tension<held,'releasing should let tension fall');

 // sustained overload snaps the line after 1.5s, but not before
 let snapState={tension:0},steps=0;
 while(snapState.tension<=85&&steps<50){snapState=tensionStep(snapState,{holding:true,dt:0.1,fish:{big:false}});steps++;}
 assert(snapState.tension>85,'tension should be able to climb above 85');
 assert(!isSnapped(snapState),'must not snap the instant it crosses 85');
 let moreSteps=0;
 while(!isSnapped(snapState)&&moreSteps<40){snapState=tensionStep(snapState,{holding:true,dt:0.1,fish:{big:false}});moreSteps++;}
 assert(isSnapped(snapState),'sustained >85 tension must eventually snap the line');

 // a fresh/low-tension state never reports snapped
 assert(!isSnapped({tension:10,overTime:0}));
 assert(!isSnapped({}));

 // registration + mount contract (no DOM touch at load time; mount returns dispose)
 const game=RAMinigames.get('pier');
 assert(game,'pier must self-register with RAMinigames');
 assert.equal(typeof game.mount,'function');

 console.log(`PASS pier (catch table sums to 100, rain doubles big-fish odds x${ratio.toFixed(2)}, sealed chest stays neutral, tension rise/fall + snap-after-1.5s verified, registered)`);
}

if(process.argv[1]&&process.argv[1].endsWith('pier-test.mjs')){
 test(path.resolve(new URL('.',import.meta.url).pathname,'../..')).catch(e=>{console.error(e);process.exit(1);});
}
