import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';

export async function test(root){
 const read=file=>readFile(path.join(root,file),'utf8'),context={structuredClone,console};context.window=context;
 context.document={createElement:()=>({style:{},dataset:{},classList:{add(){},remove(){}},addEventListener(){},removeEventListener(){},append(){},remove(){},getBoundingClientRect:()=>({left:0,top:0,width:270,height:480}),getContext:()=>({})}),querySelector:()=>null,body:{classList:{add(){},remove(){}}}};
 vm.createContext(context);
 for(const file of ['js/engine/pixel.js','js/engine/minigames.js','js/data/btf/new_oga_tunables.js','js/minigames/owambe_collection.js'])vm.runInContext(await read(file),context,{filename:file});
 const logic=context.RAMinigameLogic.owambeCollection,cfg=logic.config();assert(logic,'OWAMBE COLLECTION logic missing');
 const success=logic.simulateCatchSchedule(Array.from({length:30},(_,i)=>(i+1)*1100),cfg);
 const greedy=logic.simulateCatchSchedule(Array.from({length:20},(_,i)=>(i+1)*100),cfg);
 const short=logic.simulateCatchSchedule([5000,12000,22000,35000,50000],cfg);
 assert.equal(success.outcome,'SUCCESS');assert.equal(success.amountCaught,30000);assert.equal(success.payout,6000);
 assert.equal(greedy.outcome,'GREEDY');assert(greedy.amountCaught<30000);assert.equal(greedy.payout,0);
 assert.equal(short.outcome,'SHORT');assert.equal(short.amountCaught,5000);assert.equal(short.payout,1000);
 assert.equal(logic.payout(12345,cfg),2469,'20% payout must use deterministic integer math');
 assert.equal(logic.backOutHit(20,430),true);assert.equal(logic.backOutHit(250,460),true);
 assert.equal(logic.backOutHit(19,445),false);assert.equal(logic.backOutHit(251,445),false);assert.equal(logic.backOutHit(100,429),false);assert.equal(logic.backOutHit(100,461),false);
 assert(cfg.SONG_SECONDS>=45&&cfg.SONG_SECONDS<=75);assert.equal(context.RANewOgaTunables.heat.M5_GREEDY,8);assert.equal(context.RANewOgaTunables.heat.M5_SUCCESS,3);
 assert(context.RAMinigames.get('owambe_collection'),'OWAMBE COLLECTION minigame not registered');
 console.log('PASS owambe collection (configured SUCCESS/SHORT/GREEDY reachability, exact payout math, bounds, registration)');
}

if(process.argv[1]&&process.argv[1].endsWith('owambe-collection-test.mjs'))test(path.resolve(new URL('.',import.meta.url).pathname,'../..')).catch(e=>{console.error(e);process.exit(1);});
