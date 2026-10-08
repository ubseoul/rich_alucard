import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
export async function test(root){
 let now=0,timer=0;const requests=[],scheduled=new Map(),nodes=[];
 const rect={left:0,top:0,width:270,height:480};
 const stage={isConnected:true,getBoundingClientRect:()=>rect,addEventListener(){},append(n){n.isConnected=true;nodes.push(n);},querySelectorAll:()=>nodes.filter(n=>n.isConnected)};
 const actor={isConnected:true,getBoundingClientRect:()=>({left:180,top:200,width:50,height:90})};
 const context={console,performance:{now:()=>now},Math:Object.assign(Object.create(Math),{random:()=>0}),WeakMap,Set,
  setTimeout:f=>{scheduled.set(++timer,f);return timer;},clearTimeout:t=>scheduled.delete(t),requestAnimationFrame:f=>f(),
  document:{createElement:()=>({isConnected:false,offsetWidth:120,offsetHeight:40,style:{setProperty(){}},classList:{add(){},remove(){}},setAttribute(){},remove(){this.isConnected=false;}})},
  RACombatData:{ENEMIES:{werewolf:{person:'moonie',state:'wolfed_out'}}},RAWriting:{bark:(id,kind)=>{requests.push({id,kind});return id==='unknown'||kind==='unmapped'?null:id+':'+kind;}}};
 context.window=context;vm.createContext(context);vm.runInContext(await readFile(path.join(root,'js/systems/barks.js'),'utf8'),context);
 const B=context.RABarks;
 const emit=spec=>{B.reset(stage);return B.trigger({root:stage,enemyEl:actor,enemyId:'gbenga',force:true,...spec});};
 for(const spec of [{kind:'attack',attacker:'enemy',target:'rich'},{kind:'hit_rich',attacker:'enemy',target:'rich'},{kind:'hurt',attacker:'rich',target:'enemy'},{kind:'lose',outcome:'win'},{kind:'win',outcome:'lose'}]){
  const b=emit(spec);assert.equal(b?.textContent,'gbenga:'+spec.kind);assert.equal(requests.at(-1).kind,spec.kind,'no event alias');
 }
 for(const spec of [{kind:'hit_rich',attacker:'rich',target:'rich'},{kind:'hurt',target:'rich'},{kind:'attack',attacker:'rich'},{kind:'win'},{kind:'win',outcome:'win'},{kind:'lose',outcome:'lose'},{kind:'enter',speaker:'rich'}]){
  const count=requests.length;assert.equal(emit(spec),null);assert.equal(requests.length,count,'invalid attribution cannot reach pool');
 }
 for(const enemyId of ['training','training_dummy','hilt','hilt_rematch','ogun_rave_hilt','werewolf']){assert.equal(emit({enemyId,kind:'enter'}),null,'silent actor '+enemyId);}
 assert.equal(emit({enemyId:'unknown',kind:'enter'}),null);assert.equal(emit({kind:'unmapped'}),null);
 // Mandatory lines take priority over generic event chance/cooldown and own their reading interval.
 B.reset(stage);const held=B.show({root:stage,anchor:{x:200,y:200},text:'scatta dem',hold:1400,scripted:true});
 assert.equal(B.trigger({root:stage,enemyEl:actor,enemyId:'gbenga',kind:'enter',force:true}),null);
 now=1400;assert.ok(B.trigger({root:stage,enemyEl:actor,enemyId:'gbenga',kind:'enter',force:true}));assert.equal(held.isConnected,false);
 assert.equal(nodes.filter(n=>n.isConnected).length,1);B.reset(stage);assert.equal(nodes.filter(n=>n.isConnected).length,0);assert.equal(scheduled.size,0);
 console.log('PASS bark events have own pools and truthful attacker/target/speaker/outcome; silent actors, mandatory quote priority and cancellation');
}
