import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile as readSource} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
export async function test(root=process.cwd()){
 const readFile=(file,...args)=>readSource(path.resolve(root,file),...args);

const events=[];let live=false,resolveGame,continued=0,cancelOptions;
const c={console,setTimeout,clearTimeout,setInterval,clearInterval,requestAnimationFrame:()=>0,cancelAnimationFrame(){},CustomEvent:class{constructor(type,{detail}){this.type=type;this.detail=detail;}},document:{dispatchEvent:e=>events.push(e.detail.id)},RAState:{patch(){}}};
c.window=c;vm.createContext(c);
await vm.runInContext(await readFile('js/engine/scenes.js','utf8'),c);
c.RAMinigames={active:()=>live?{id:'bars'}:null,quitActive:options=>{cancelOptions=options;live=false;resolveGame({quit:true});}};
c.RAScenes.register('adventure',{async enter({scope}){live=true;await new Promise(r=>resolveGame=r);if(scope.isActive()){continued++;await c.RAScenes.go('phone');}}});
c.RAScenes.register('bedroom',{});c.RAScenes.register('phone',{});
const entering=c.RAScenes.go('adventure');
await new Promise(r=>setTimeout(r,0));
assert(live);
await Promise.race([c.RAScenes.go('bedroom'),new Promise((_,reject)=>setTimeout(()=>reject(Error('queued scene remains blocked')),500))]);
await entering;
assert.equal(continued,0,'cancelled adventure cannot settle or dispatch over destination');
assert.equal(c.RAScenes.current(),'bedroom');
assert.equal(cancelOptions.sceneChange,true,'host must suppress its old returnScene');
assert.deepEqual(events,['bedroom'],'cancelled entering scene never emits completion');
console.log('PASS queued minigame cancellation unblocks destination and prevents stale adventure continuation');

}
if(process.argv[1]===fileURLToPath(import.meta.url))await test();
