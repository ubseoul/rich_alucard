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
 for(const file of ['js/engine/pixel.js','js/engine/minigames.js','js/minigames/hatch.js'])
  vm.runInContext(await read(file),context,{filename:file});

 const {RAMinigameLogic,RAMinigames}=context;
 assert(RAMinigameLogic&&RAMinigameLogic.hatch,'hatch logic API missing');
 const {stages,poseFor,availableActions,chirp}=RAMinigameLogic.hatch;

 assert.equal(Array.from(stages).join(','),'egg,hatchling,young,majestic');

 // poseFor: sulking wins, then hunger, then happy/bond, else neutral
 assert.equal(poseFor({sulking:true,fedToday:false}),'sulk');
 assert.equal(poseFor({sulking:false,fedToday:false}),'hungry');
 assert.equal(poseFor({fedToday:true,playedToday:true}),'happy');
 assert.equal(poseFor({fedToday:true,bond:80}),'happy');
 assert.equal(poseFor({fedToday:true,playedToday:false,bond:10}),'neutral');
 assert.equal(poseFor({}),'hungry','missing fields default to a safe hungry pose, never a crash');
 assert.equal(poseFor(undefined),'hungry');

 // availableActions: egg is keepWarm-only; later stages add feed/play/talk and cat when owned
 const joined=(...a)=>Array.from(availableActions(...a)).join(',');
 assert.equal(joined({stage:'egg'},{},false),'keepWarm');
 assert.equal(joined({stage:'hatchling'},{},false),'feed,play,talk');
 assert.equal(joined({stage:'young'},{},true),'feed,play,talk,feedCat');
 assert.equal(joined({stage:'majestic'},{},true),'feed,play,talk,feedCat');

 // chirp: early stages stay wordless; majestic can produce actual words too
 let seed=7;
 const rng=()=>{seed=(seed*1103515245+12345)>>>0;return (seed>>>8)/16777216;};
 const wordy=/[a-z]+\.\s*[a-z]*\.?/i;
 for(let i=0;i<100;i++)assert(!/rich|fish|warm now|crumble|play again/i.test(chirp('hatchling',rng)),'hatchling must not speak in words yet');
 let sawWords=false;
 for(let i=0;i<200;i++){const line=chirp('majestic',rng);if(/rich\. fish\./.test(line))sawWords=true;}
 assert(sawWords,'majestic dragon should eventually grow chirps into words');

 // registration + mount contract
 const game=RAMinigames.get('hatch');
 assert(game,'hatch must self-register with RAMinigames');
 assert.equal(typeof game.mount,'function');

 console.log('PASS hatch (stage list, pose-from-state precedence, per-stage action gating incl. cat, chirp-vs-words by stage, registered)');
}

if(process.argv[1]&&process.argv[1].endsWith('hatch-test.mjs')){
 test(path.resolve(new URL('.',import.meta.url).pathname,'../..')).catch(e=>{console.error(e);process.exit(1);});
}
