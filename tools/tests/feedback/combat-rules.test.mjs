import assert from 'node:assert/strict';import {full,run} from '../if1/_lib.mjs';import path from 'node:path';import {fileURLToPath} from 'node:url';
export async function test(root=process.cwd()){
 const c=await full(root);await run(root,c,['js/frag/F07/tunables.js','js/frag/F07/gbenga_combat.js']);c.RAFeatures.set('F07.m8_and_finale',true);
 const LO={maxHp:100,moves:['blood','octopus','bite','revenge'],items:{},guns:[],fits:[],rooms:[],companions:[]},R=c.RACombat2Rules;
 const s=R.create('gbenga',{hp:260},LO,()=>.5);assert.equal(s.enemy.max,260);assert.equal(s.f07.dracoEquipped,false);R.act(s,{type:'move',id:'blood'});
 assert.equal(s.rich.pp.blood,7);assert.equal(s.enemy.hp,234);assert.equal(s.rich.hp,76);assert.equal(s.f07.dracoEquipped,true);assert.equal(s.f07.phoneUsed,true);assert.equal(s.log.find(l=>l.kind==='enemy').move,'phone');assert.equal(R.intent(s),'draco');
 R.act(s,{type:'move',id:'bite'});assert.equal(s.rich.pp.bite,7);assert.equal(s.rich.hp,54);assert.equal(s.log.filter(l=>l.kind==='hurt').length,2);assert.ok(s.log.filter(l=>l.kind==='hurt').every(l=>l.amount===20));assert.equal(R.intent(s),'voice');
 const missed=R.create('gbenga',{hp:320},LO,()=>.999);R.act(missed,{type:'move',id:'blood'});assert.equal(missed.enemy.hp,320);assert.equal(missed.f07.dracoEquipped,false);assert.equal(R.intent(missed),'voice');missed.rng=()=>.5;R.act(missed,{type:'move',id:'blood'});assert.equal(missed.f07.dracoEquipped,true);assert.equal(missed.log.find(l=>l.kind==='enemy').move,'draco');assert.equal(missed.enemy.max,320);
 c.RAFeatures.set('F07.m8_and_finale',false);const dark=R.create('gbenga',{},LO,()=>.5);assert.equal(dark.f07,undefined);c.RAFeatures.set('F07.m8_and_finale',true);
 // The established interruption, shame and healing/buff paths stay active after the opener.
 const voice=R.create('gbenga',{},LO,()=>.999);voice.enemy.step=1;R.act(voice,{type:'move',id:'revenge'});assert.ok(voice.log.some(l=>l.text==='THE VOICE NOTE IS INTERRUPTED.'));assert.equal(voice.rich.stun,0);
 const shame=R.create('gbenga',{},LO,()=>.999);shame.enemy.hp=129;R.act(shame,{type:'move',id:'blood'});assert.equal(shame.f07.shamed,true);assert.ok(shame.log.some(l=>/fighting at your own party/.test(l.text)));R.act(shame,{type:'move',id:'blood'});assert.ok(!shame.log.some(l=>/fighting at your own party/.test(l.text)));
 const myson=R.create('gbenga',{},LO,()=>.999);myson.f07.shamed=true;myson.enemy.hp=200;myson.enemy.step=2;myson.rich.buffNext=2;myson.rich.shield=10;R.act(myson,{type:'move',id:'blood'});assert.equal(myson.enemy.hp,230);assert.equal(myson.rich.buffNext,1);assert.equal(myson.rich.shield,0);
 console.log('PASS combat feedback rules: received player hit, missed hit, giant phone opener, 260/320 HP, unchanged 24 / 2x20 damage, PP once, alternating Draco, dark flag, voice interruption, shame once, MY SON preservation');
}
if(process.argv[1]===fileURLToPath(import.meta.url))await test(path.resolve(process.cwd()));
