import assert from 'node:assert/strict';
import {sandbox,run} from '../if1/_lib.mjs';
export async function test(root){
 const c=sandbox({extra:{RAF05:{util:{clamp:(v,a,b)=>Math.max(a,Math.min(b,v))}}}});await run(root,c,['js/frag/F05/minigame_cook.js']);
 const L=c.RAF05.cookLogic;
 const sample=pulses=>{let heat=.4,samples=[];for(let i=0;i<80;i++){heat=L.heatStep(heat,.1,pulses?(i==0?2:i%12===0?1:0):0);samples.push(heat);}return L.heatScore(samples);};
 assert.equal(sample(false),0,'untended heat must not claim time in green');assert.ok(sample(true)>50,'ordinary spaced burner pulses must make useful quality attainable');
 assert.equal(L.heatStep(.99,0,1),1,'heat cannot exceed the gauge');assert.equal(L.heatStep(.01,1),0,'cooling cannot leave the gauge');
 const good=L.quality({blend:.7,heat:Array(20).fill(.7),clean:10,misses:0}),untended=L.quality({blend:.7,heat:Array(20).fill(.4),clean:10,misses:0});assert.ok(good>untended,'burner performance must affect actual batch quality');
 console.log('PASS next-review cook heat: untended versus controlled burner changes attainable batch quality');
}
