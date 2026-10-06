import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import path from 'node:path';
export async function test(rootPath){
 const timers=new Map();let next=0;
 const schedule=(fn,ms)=>{const id=++next;timers.set(id,{fn,ms});return id;};
 const flush=async()=>{const rows=[...timers];timers.clear();for(const [,t] of rows)t.fn();await Promise.resolve();await Promise.resolve();};
 const layers=[];
 const context={setTimeout:schedule,clearTimeout:id=>timers.delete(id),window:{matchMedia:()=>({matches:false})}};
 context.window.RACombatPixelFX={helpers:{view:()=>({enemy:{x:200,y:120},rich:{x:70,y:120},H:480}),layer:()=>{const canvas={dataset:{},classList:{add(){}},removed:false,remove(){this.removed=true;}};layers.push(canvas);return {canvas,ctx:{clearRect(){}}};}}};
 vm.createContext(context);vm.runInContext(await fs.readFile(path.join(rootPath,'js/systems/enemy_fx.js'),'utf8'),context);
 const fx=context.window.RAEnemyFX;fx.PAINT.stab=()=>{};
 class Stage extends EventTarget {isConnected=true;dataset={};}
 const actor=()=>({isConnected:true,tagName:'IMG',dataset:{},src:'neutral.png',getAttribute(){return this.src;}});
 const stage=new Stage(),attacker=actor(),target=actor();let contacts=0;
 const args={root:stage,enemyId:'smallie_cousin',moveId:'dagger',attacker,target,onContact:()=>contacts++};
 const first=fx.attack(args);assert.match(attacker.src,/-f1\.png$/);
 stage.dispatchEvent(new Event('c2:close'));await first;
 assert.equal(contacts,0);assert.equal(timers.size,0);assert(layers.every(l=>l.removed));assert.equal(attacker.src,'neutral.png');assert.equal(stage.dataset.enemyPhase,undefined);
 const old=fx.attack(args);await flush();const replacement=fx.attack(args);await old;
 assert.match(attacker.src,/-f1\.png$/,'old finally must not restore over replacement');
 for(let i=0;i<12;i++)await flush();await replacement;
 assert.equal(contacts,1);assert.equal(attacker.src,'neutral.png');assert.equal(attacker.dataset.movePose,undefined);assert(layers.every(l=>l.removed));
 const detached=fx.attack(args);stage.isConnected=false;await flush();await detached;
 assert.equal(contacts,1,'detached stage cannot deliver contact');assert.equal(timers.size,0);
 assert.match(fx.poseFor('smallie','chew',5),/-f2\.png$/,'contact must use action pose, not recovery');
 assert.match(fx.poseFor('smallie','chew',7),/-f3\.png$/);
 assert.equal(fx.poseFor('phil','punch',0,'unreviewed_stage'),null,'missing stage variant must preserve authored appearance, never use day-one poses');
 fx.register('phil@charging_day3','punch',{prepare:'gold-prepare.png',action:'gold-action.png',contact:'gold-contact.png',recover:'gold-recover.png'});
 assert.equal(fx.poseFor('phil','punch',5,'charging_day3'),'gold-contact.png');
 assert.match(fx.poseFor('phil','punch',5),/phil-punch-contact\.png$/,'day-one timeline remains independent');
 const adventures={},story={RAContent:Object.fromEntries(['R','S','N','E'].map(k=>[k,(...v)=>v])),RAAdventures:{define:d=>adventures[d.id]=d},RAWakeTriggers:{define(){}},RATemptations:{define(){}},RAParties:{dance:()=>({})},RALife:{flag:()=>false},RAClock:{onWake(){}},RACastle:{ROOMS:{}},RAPlaces:{define(){}},window:{}};
 vm.createContext(story);vm.runInContext(await fs.readFile(path.join(rootPath,'js/data/btf/adventures/w3.js'),'utf8'),story);
 for(const stage of [1,2,3]){const A={vars:{stage}},arrival=adventures.A20.nodes.arrive.actors(A).right,params=adventures.A20.nodes.fightnow.fight.params(A);assert.equal(params.artState,stage>=3?arrival.state:null);assert.equal(params.invincible,stage<3);}
 console.log('PASS enemy lifecycle: precontact close, replacement ownership, contact once, detached stage, pose/contact synchronization');
}
