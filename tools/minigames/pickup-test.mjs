import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';

export async function test(root){
 const context={};context.window=context;context.document={createElement:()=>({style:{},append(){},addEventListener(){},removeEventListener(){},getContext:()=>({}),getBoundingClientRect:()=>({left:0,top:0,width:270,height:480})}),querySelector:()=>null};
 context.performance=typeof performance!=='undefined'?performance:{now:()=>Date.now()};
 context.requestAnimationFrame=()=>0;context.cancelAnimationFrame=()=>{};
 vm.createContext(context);
 for(const file of ['js/engine/pixel.js','js/engine/minigames.js','js/minigames/pickup.js']){
  vm.runInContext(await readFile(path.join(root,file),'utf8'),context,{filename:file});
 }
 const logic=context.window.RAMinigameLogic.pickup;
 assert.ok(logic,'logic API registered');
 assert.ok(context.window.RAMinigames.get('pickup'),'pickup minigame registered');

 // shotChance: best at meter=1 (top of jump meter), worse contested, worse far
 const perfect=logic.shotChance(1,0.1,false);
 const early=logic.shotChance(0.3,0.1,false);
 const far=logic.shotChance(1,0.9,false);
 const contested=logic.shotChance(1,0.1,true);
 assert.ok(perfect>early,'releasing at the top beats an early release');
 assert.ok(perfect>far,'closer shots beat farther shots');
 assert.ok(perfect>contested,'contested shots are worse');
 assert.ok(perfect>=0&&perfect<=1&&far>=0.03,'chance stays in bounds');

 // aiStep is deterministic given a seeded rng and advances time
 let calls=0;const seq=[0.5,0.01,0.9,0.02,0.5];
 const rng=()=>seq[calls++%seq.length];
 let state={t:0,action:'hold'};
 state=logic.aiStep(state,500,rng);
 assert.ok(state.t>=500);
 assert.ok(['drive','pass','hold'].includes(state.action));

 // scoreAfterShot: makes worth 1 close, 2 far; misses add nothing; immutable
 const s0={rich:0};
 const madeClose=logic.scoreAfterShot(s0,true,0.2);
 assert.equal(madeClose.rich,1,'close make is worth 1');
 const madeFar=logic.scoreAfterShot(s0,true,0.7);
 assert.equal(madeFar.rich,2,'far make is worth 2');
 const missed=logic.scoreAfterShot(s0,false,0.7);
 assert.equal(missed.rich,0,'a miss adds nothing');
 assert.equal(s0.rich,0,'scoreAfterShot must not mutate input state');
 const chained=logic.scoreAfterShot(madeClose,true,0.2);
 assert.equal(chained.rich,2,'scores accumulate across calls');

 console.log('PASS pickup (shotChance monotonicity, aiStep progression, scoreAfterShot 1s/2s + immutability)');
}
