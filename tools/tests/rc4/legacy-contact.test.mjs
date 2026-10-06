import assert from 'node:assert/strict';import fs from 'node:fs/promises';import path from 'node:path';import vm from 'node:vm';
export async function test(root){
 const timers=new Map();let sequence=0,live=true;const phases=[],sounds=[];
 const target={classList:{add(){},remove(){}}},context={window:{RAAudio:{sfx:id=>sounds.push(id)}},document:{querySelector:()=>target},setTimeout:fn=>{const id=++sequence;timers.set(id,fn);return id;}};
 vm.createContext(context);vm.runInContext(await fs.readFile(path.join(root,'js/systems/combat_presentation.js'),'utf8'),context);
 const reaction=context.window.RACombatPresentation.play({target,attacker:target,kind:'briefcase',isActive:()=>live,onPhase:phase=>phases.push(phase)});
 assert.deepEqual(phases,['CONTACT']);assert.deepEqual(sounds,['EN_BRIEFCASE']);
 live=false;for(const [id,fn] of timers){timers.delete(id);fn();}await reaction;
 assert.deepEqual(phases,['CONTACT'],'cancelled contact must not advance hit-stop/recovery callbacks');assert.deepEqual(sounds,['EN_BRIEFCASE'],'cancelled contact must not emit delayed hit audio');assert.equal(timers.size,0);
 await context.window.RACombatPresentation.play({target,kind:'importer-shove',isActive:()=>false,onPhase:phase=>phases.push(phase)});
 assert.deepEqual(phases,['CONTACT']);assert.deepEqual(sounds,['EN_BRIEFCASE']);
 console.log('PASS legacy presentation cancellation: no late phase, hit audio or pending wait; inactive entry inert');
}
