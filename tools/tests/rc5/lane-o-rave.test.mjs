import assert from 'node:assert/strict';
import vm from 'node:vm';
import{readFile as readSource}from'node:fs/promises';
import{loadBtf}from'../../btf-test.mjs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
export async function test(root=process.cwd()){
 const readFile=(file,...args)=>readSource(path.resolve(root,file),...args);

for(const outcome of ['win','lose','quit','failure','stale']){const c=await loadBtf(process.cwd());for(const f of ['js/data/btf/combat.js','js/data/ogun_rave_content.js'])vm.runInContext(await readFile(f,'utf8'),c);const original=JSON.stringify(c.RACombatData.ENEMIES.hunter);let scene='ogun-rave';const session={root:{isConnected:true,hidden:false},setPhase(){}};c.RARaveScene={current:()=>session};c.RAScenes={current:()=>scene,go:async id=>{scene=id;}};c.RACombat2={run:async id=>{assert.equal(id,'ogun_rave_hilt');if(outcome==='failure')throw Error('fixture failure');if(outcome==='stale'){scene='bedroom';return{outcome:'win'};}return outcome==='quit'?{quit:true}:{outcome};}};vm.runInContext(await readFile('js/systems/ogun_rave.js','utf8'),c);c.RAState.patch('life.night.active',{id:'ogun_rave_001',phase:'hilt_exit',startedAt:'seed'});try{await c.RAOgunRave.fight();}catch(e){assert.equal(outcome,'failure');}assert.equal(JSON.stringify(c.RACombatData.ENEMIES.hunter),original);assert(c.RARelations.met('hilt'));assert.equal(c.RACombatData.ENEMIES.ogun_rave_hilt.person,'hilt');if(outcome==='win'||outcome==='lose')assert.equal(scene,'ogun-rave-exterior');if(outcome==='quit'||outcome==='failure')assert.equal(session.root.hidden,false);if(outcome==='stale')assert.equal(scene,'bedroom');}
console.log('PASS seeded rave: actual local Hilt card, generic hunter preserved, win/lose/quit/failure/stale-session consequences.');

}
if(process.argv[1]===fileURLToPath(import.meta.url))await test();
