import assert from 'node:assert/strict';
import {full} from '../if1/_lib.mjs';
const plain=x=>JSON.parse(JSON.stringify(x));
export async function test(root){
 for(const keyName of ['primary','recovery']){
  const c=await full(root);c.setInterval=()=>0;const S=c.RAState,A=c.RAAdventures;let delivered=0;c.document.addEventListener('ra:adventure-complete',()=>delivered++);
  A.define({id:'atomic_completion_fixture',title:'Fixture',start:'end',nodes:{end:{end:{outcome:'win',memory:{text:'test memory',lane:'life'},receipt:{caption:'test receipt'},home:['rich','test return'],fx:()=>S.transaction(s=>{s.life.resources.money+=6000;s.life.ownership.items.atomic_test=1;s.life.world.flags.atomic_reward=true;})}}}});
  S.patch('life.adventures.active',{id:'atomic_completion_fixture',node:'end',applied:['end'],vars:{},startedDay:1,env:'bedroom'});const before=plain(S.get()),write=c.localStorage.setItem;
  c.localStorage.setItem=(k,v)=>{if(k===S.keys[keyName])throw Error('injected completion '+keyName);return write(k,v);};
  assert.equal(A.complete('end'),null);assert.deepEqual(plain(S.get()),before);assert.equal(delivered,0);assert.equal(JSON.parse(c.localStorage.getItem(S.keys.primary)).life.resources.money,before.life.resources.money);
  c.localStorage.setItem=write;S.load();assert.equal(A.active().node,'end');const completed=A.complete('end');assert.equal(completed.outcome,'win');assert.equal(delivered,1);assert.equal(c.RALife.money(),before.life.resources.money+6000);assert.equal(A.record('atomic_completion_fixture').count,1);assert.equal(A.active(),null);S.load();assert.equal(A.complete('end'),null);assert.equal(c.RALife.money(),before.life.resources.money+6000);assert.equal(A.record('atomic_completion_fixture').count,1);
 }
 console.log('PASS atomic adventure completion/reward/memory/receipt failure and reload retry');
}
