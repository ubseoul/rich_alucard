import assert from 'node:assert/strict';
import path from 'node:path';
import {full,run,same} from '../if1/_lib.mjs';
import {F01_FILES,F04_FILES} from '../F04/_lib.mjs';
export async function test(root){
const files=['js/frag/F03/migrations.js','js/frag/F07/migrations.js',...F01_FILES,'js/frag/F03/new_oga_ladder_close.js',...F04_FILES,...['tunables','play_bridge','gbenga_combat','m8_and_finale'].map(n=>'js/frag/F07/'+n+'.js')];
const boot=async seed=>{const c=await full(root,seed?{seedState:seed}:{});await run(root,c,files);for(const flag of ['F07.m8_and_finale','F03.new_oga_ladder_close','F01.showdown_core'])c.RAFeatures.set(flag,true);return c;};
const plain=v=>JSON.parse(JSON.stringify(v));
const c=await boot();
const keys=()=>c.RAF07.lanesAvailable().map(x=>x.id);
assert.ok(!keys().includes('mazda'),'no dragon before story');
c.RARelations.meet('mazda_human');c.RARelations.add('mazda_human',140);c.RALife.setFlag('mazdaHuman',true);
assert.ok(!keys().includes('mazda'),'roster/flag without acquired dragon is not earning');
c.RALife.setFlag('mazdaHuman',false);
c.RADragon.adoptEgg();assert.ok(!keys().includes('mazda'),'egg acquired, hatch story incomplete');
c.RAAdventures.start('A11');c.RAAdventures.enter('crack');assert.ok(!keys().includes('mazda'),'mid hatch story');c.RAAdventures.enter('sneeze');
assert.equal(c.RADragon.hatched(),true);assert.ok(!keys().includes('mazda'),'hatch reward alone is not human reveal');
c.RAAdventures.complete('end');
c.RALife.patchDragon({stage:'majestic'});c.RALife.addRoom({id:'dragon_roost'});assert.equal(c.RADragon.canAssist(),true,'earned grown dragon can assist from roost');
c.RAAdventures.start('A32');c.RAAdventures.enter('night');assert.equal(c.RADragon.hasHumanForm(),true);c.RAAdventures.complete('land');assert.ok(keys().includes('mazda'),'source A32 reward earns human finale lane');
const save=plain(c.RAState.get()),reloaded=await boot(save);assert.equal(reloaded.RADragon.hasHumanForm(),true);assert.ok(reloaded.RAF07.lanesAvailable().some(x=>x.id==='mazda'),'save/reload retains earned lane');
assert.equal(reloaded.RAF07Play.buildRequest('finale_p1',{lanes:['ogas','mazda','pinky']}).ok,true,'earned new finale request');
const fake=await boot();assert.equal(fake.RAF07Play.buildRequest('finale_p1',{lanes:['ogas','mazda','pinky']}).code,'INELIGIBLE_LANES','direct new request blocked');
assert.equal(fake.RAF07Play.buildRequest('finale_p1',{lanes:['ogas','shannon','pinky']}).ok,true,'eligible alternatives survive');
let launches=0;fake.RAShowdown.play.launch=async()=>{launches++;return null;};
const pending=fake.RAF07Play.buildRequest('finale_p1',{lanes:['ogas','shannon','pinky']});fake.RAFrag.patch('F07','play.pending',{...pending,kind:'finale_p1',lanes:['ogas','mazda','pinky']});
assert.equal((await fake.RAF07Play.run('finale_p1',{lanes:['ogas','mazda','pinky']})).code,'INELIGIBLE_LANES');assert.equal(launches,0,'pending stale selection never launches');
await fake.RAF07Play.run('finale_p1',{lanes:['ogas','shannon','pinky']});assert.equal(launches,1,'replanned eligible choices can launch');
const LO={maxHp:100,moves:['blood','octopus','bite','revenge'],items:{},guns:[],fits:[],rooms:[],companions:[{id:'mazda_dragon',name:'MAZDA',moves:[{id:'fire',kind:'damage',amount:40}]}]};
const battle=fake.RACombat2Rules.create('gbenga',{},LO,()=>.5);assert.equal(battle.companions.length,0,'stale supplied loadout cannot grant dragon');
const earnedBattle=c.RACombat2Rules.create('gbenga',{},LO,()=>.5);assert.equal(earnedBattle.companions.length,1);c.RAState.patch('life.ownership.dragon',null);c.RACombat2Rules.act(earnedBattle,{type:'hoe',companion:'mazda_dragon',move:'fire'});assert.equal(earnedBattle.enemy.hp,260);assert.equal(earnedBattle.hoesUsed.mazda_dragon,undefined,'stale live dragon action causes no turn/damage/use');
const s=fake.RACombat2Rules.create('gbenga',{},undefined,()=>.5);fake.RACombat2Rules.act(s,{type:'move',id:'blood'});assert.equal(s.log.filter(e=>e.kind==='combat_beat').length,1);const hit=s.log.find(e=>e.kind==='hit'),hurt=s.log.find(e=>e.kind==='hurt');assert.equal(hit.attacker,'rich');assert.equal(hit.target,'enemy');assert.equal(hurt.attacker,'enemy');assert.equal(hurt.target,'rich');fake.RACombat2Rules.act(s,{type:'move',id:'bite'});assert.equal(s.log.filter(e=>e.kind==='combat_beat').length,0,'draw once per fight');
console.log('PASS source-earned acquisition, midstory, hatch-only, A32 reveal, reload, new/pending/direct/stale action gates, alternatives, one draw, damage attribution');

}
