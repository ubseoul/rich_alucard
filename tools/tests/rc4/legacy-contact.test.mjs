import assert from 'node:assert/strict';import fs from 'node:fs/promises';import path from 'node:path';import vm from 'node:vm';
export async function test(root){
 const timers=new Map();let sequence=0,live=true;const phases=[],sounds=[];
 const node=()=>{const classes=new Set();return {classes,classList:{add:(...names)=>names.forEach(n=>classes.add(n)),remove:(...names)=>names.forEach(n=>classes.delete(n))}};};
 const target=node(),attacker=node(),stage=node(),context={window:{RAAudio:{sfx:id=>sounds.push(id)}},document:{querySelector:selector=>selector==='#screen'?stage:null},setTimeout:fn=>{const id=++sequence;timers.set(id,fn);return id;}};
 const flush=async()=>{const pending=[...timers];timers.clear();for(const [,fn] of pending)fn();await Promise.resolve();await Promise.resolve();};
 vm.createContext(context);vm.runInContext(await fs.readFile(path.join(root,'js/systems/combat_presentation.js'),'utf8'),context);
 const play=context.window.RACombatPresentation.play,options={target,attacker,kind:'briefcase',isActive:()=>live,onPhase:phase=>phases.push(phase)};
 const reaction=play(options);assert.deepEqual(phases,['CONTACT']);assert.deepEqual(sounds,['EN_BRIEFCASE']);
 live=false;await flush();await reaction;assert.deepEqual(phases,['CONTACT']);assert.deepEqual(sounds,['EN_BRIEFCASE']);assert.equal(timers.size,0);
 await play(options);assert.deepEqual(phases,['CONTACT']);assert.deepEqual(sounds,['EN_BRIEFCASE']);
 for(const cancelledAt of ['HIT-STOP','WHITE/SILHOUETTE FLASH','RECOIL','RECOVERY']){
  live=true;phases.length=0;sounds.length=0;const pending=play({...options,authored:'ceo'});
  for(let i=0;i<10&&phases.at(-1)!==cancelledAt;i++)await flush();assert.equal(phases.at(-1),cancelledAt);
  if(cancelledAt==='HIT-STOP')assert(stage.classes.has('combat-hit-stop'));
  const before={phases:[...phases],sounds:[...sounds]};live=false;await flush();await pending;
  assert.deepEqual(phases,before.phases);assert.deepEqual(sounds,before.sounds);assert.equal(stage.classes.size,0,'scene-away must clear stage brightness/shake without reset');assert.equal(target.classes.size,0);assert.equal(attacker.classes.size,0);assert.equal(timers.size,0);
 }
 live=true;phases.length=0;const old=play(options);await flush();assert(stage.classes.has('combat-hit-stop'));
 const replacement=play(options);assert(!stage.classes.has('combat-hit-stop'),'old stage cleaned before replacement');await flush();await old;
 assert(stage.classes.has('combat-hit-stop'),'old finally must not remove replacement hit-stop');
 for(let i=0;i<10;i++)await flush();await replacement;assert.equal(stage.classes.size,0);assert.equal(target.classes.size,0);assert.equal(attacker.classes.size,0);assert.equal(timers.size,0);
 console.log('PASS legacy presentation cancellation: contact/hit-stop/flash/recoil/recovery cleanup, no late phase/audio, replacement ownership; timings unchanged');
}
