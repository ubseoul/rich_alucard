import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';

export async function test(root){
 const context={};context.window=context;context.document={createElement:()=>({style:{},append(){},addEventListener(){},removeEventListener(){},getContext:()=>({}),getBoundingClientRect:()=>({left:0,top:0,width:270,height:480})}),querySelector:()=>null};
 context.performance=typeof performance!=='undefined'?performance:{now:()=>Date.now()};
 context.requestAnimationFrame=()=>0;context.cancelAnimationFrame=()=>{};
 vm.createContext(context);
 for(const file of ['js/engine/pixel.js','js/engine/minigames.js','js/minigames/hookah.js']){
  vm.runInContext(await readFile(path.join(root,file),'utf8'),context,{filename:file});
 }
 const logic=context.window.RAMinigameLogic.hookah;
 assert.ok(logic,'logic API registered');
 assert.ok(context.window.RAMinigames.get('hookah'),'hookah minigame registered');
 assert.ok(logic.TARGETS.moon&&logic.TARGETS.antenna,'targets exported for tests');

 // makeRing scales with input
 const small=logic.makeRing(0.1,1);
 const big=logic.makeRing(0.9,1);
 assert.ok(big.size>small.size,'faster release makes a bigger ring');
 const wobbly=logic.makeRing(0.5,0.1);
 assert.equal(wobbly.wobble,true,'low smoothness produces a wobbly ring');
 const smooth=logic.makeRing(0.5,0.9);
 assert.equal(smooth.wobble,false);

 // ringPassesThrough
 const first=logic.makeRing(0.9,0.9);first.x=135;
 const second=logic.makeRing(0.4,0.9);second.x=135;
 assert.equal(logic.ringPassesThrough(second,first),true,'smaller smooth ring passes through a bigger prior one');
 const w1=logic.makeRing(0.9,0.9);w1.x=135;
 const w2=logic.makeRing(0.2,0.1); // wobbly
 w2.x=135;
 assert.equal(logic.ringPassesThrough(w2,w1),false,'wobbly rings never stack');
 assert.equal(logic.ringPassesThrough(null,first),false);

 // stepRing advances state
 const r0=logic.makeRing(0.6,0.9);const before=JSON.stringify(r0);
 const r1=logic.stepRing(r0,500);
 assert.equal(JSON.stringify(r0),before,'stepRing must not mutate input');
 assert.ok(r1.age>r0.age);
 assert.notEqual(r1.y,r0.y);

 // hitsMoon / hitsAntenna using exported target coordinates
 const moonRing={x:logic.TARGETS.moon.x,y:logic.TARGETS.moon.y,size:10,wobble:false};
 assert.equal(logic.hitsMoon(moonRing),true);
 const farRing={x:0,y:480,size:5,wobble:false};
 assert.equal(logic.hitsMoon(farRing),false);
 const antennaRing={x:logic.TARGETS.antenna.x,y:logic.TARGETS.antenna.y,size:8,wobble:false};
 assert.equal(logic.hitsAntenna(antennaRing),true);
 assert.equal(logic.hitsMoon({...moonRing,wobble:true}),false,'wobbly ring cannot hit moon');

 console.log('PASS hookah (makeRing scaling/wobble, stack-through, stepRing immutability, moon/antenna hit tests)');
}
