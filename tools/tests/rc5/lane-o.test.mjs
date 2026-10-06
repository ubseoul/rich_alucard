import assert from 'node:assert/strict';
import {readFile as readSource} from 'node:fs/promises';
import vm from 'node:vm';
import {loadBtf} from '../../btf-test.mjs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
export async function test(root=process.cwd()){
 const readFile=(file,...args)=>readSource(path.resolve(root,file),...args);

async function load(file,c){vm.runInContext(await readFile(`${root}/${file}`,'utf8'),c,{filename:file});}
for(let offer=0;offer<3;offer++)for(let exit=0;exit<3;exit++){
 const c=await loadBtf(root);await load('js/systems/newgame.js',c);
 const A=c.RAAdventures;A.start('A00',{from:'newgame'});let node='dream',falls=0,steps=0;
 while(node&&steps++<100){const {node:n}=A.enter(node);
  if(n.openingAction==='fall')falls++;
  if(node==='brain_offer'){assert.equal(c.RANewGame.brainAvailable(),false);assert.equal(A.choicesFor(node).length,3);node=A.choose(node,offer);continue;}
  if(node==='merge'){
   assert.equal(c.RANewGame.brainAvailable(),false);assert.equal(A.nextOf(node),'merge');
   // Synthetic completed presentation receipt; this is not natural browser proof.
   A.context().set('brainTransferSeen',true);
   const saved=JSON.parse(JSON.stringify(c.RAState.get()));
   const reloaded=await loadBtf(root,{seedState:saved});await load('js/systems/newgame.js',reloaded);
   assert.equal(reloaded.RAAdventures.active().vars.brainTransferSeen,true);
  }
  if(node==='brain_acquired'){assert.equal(c.RANewGame.brainAvailable(),true);const earned=c.RALife.flag('octopusBrain');A.enter(node);assert.equal(c.RALife.flag('octopusBrain'),earned);}
  if(node==='fork'){node=A.choose(node,exit);continue;}
  if(n.end){A.complete(node);break;}
  if(n.choices){node=A.choose(node,0);continue;}node=A.nextOf(node);
 }
 assert.equal(falls,3);assert(steps<100);assert(c.RALife.flag('octopusBrain'));
}
for(const flag of ['octopusBrain','prologueDone','throneDone']){const c=await loadBtf(root);await load('js/systems/newgame.js',c);c.RALife.setFlag(flag,true);assert(c.RANewGame.brainAvailable());}
const c=await loadBtf(root);await load('js/systems/newgame.js',c);await load('js/data/btf/combat.js',c);await load('js/engine/combat2.js',c);
if(process.env.RA_O_INTEGRATED==='1')assert(!c.RACombat2Rules.loadout().moves.includes('octopus'));c.RALife.setFlag('octopusBrain','polite');assert(c.RACombat2Rules.loadout().moves.includes('octopus'));
c.RARelations.meet('ceo_assistant_001','test-ceo-conversion');c.RARelations.setFlag('ceo_assistant_001','stolen',true);
for(const enemy of ['hunter','guard'])if(c.RACombatData.ENEMIES[enemy])assert(c.RACombat2Rules.create(enemy).companions.some(p=>p.id==='ceo_assistant_001'));
console.log('PASS: 9 offer × exit branches, 3 falls each, pre-acquisition hold, synthetic receipt reload/idempotence, legacy powers and seeded converted Assistant in later fight loadouts. Shared gate assertion requires RA_O_INTEGRATED=1.');

}
if(process.argv[1]===fileURLToPath(import.meta.url))await test();
