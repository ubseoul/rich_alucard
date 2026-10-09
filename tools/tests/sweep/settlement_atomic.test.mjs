import assert from 'node:assert/strict';
import {loadWar,activate,card,playHost,F01_FILES,F04_FILES} from '../F04/_lib.mjs';
import {full,run} from '../if1/_lib.mjs';
const plain=v=>JSON.parse(JSON.stringify(v));
export async function test(root){
 const c=await loadWar(root);c.setInterval=()=>0;activate(c);const host=await playHost(root),before=c.RALife.money();let result,id,beforePending,ledgerBefore;const original=c.localStorage.setItem;
 const failed=await c.RAWarRoomPlay.launch(card(c,'DROP','inglewood'),{transport:async req=>{
  result=await host.transport(req);id=req.requestId;beforePending=plain(c.RAState.get());ledgerBefore=plain(c.RAMoneyLedger.entries());
  c.localStorage.setItem=(key,value)=>{if(key===c.RAState.keys.primary&&JSON.parse(value).frag?.F04?.play?.consumed?.[id])throw Error('injected receipt quota');return original(key,value);};return result;
 }});
 assert.equal(failed.ok,false);assert.equal(failed.code,'SAVE_FAILED');assert.deepEqual(plain(c.RAState.get()),beforePending,'entire live settlement rolls back');assert.deepEqual(plain(c.RAMoneyLedger.entries()),ledgerBefore,'no phantom money journal');
 let durable=JSON.parse(c.localStorage.getItem(c.RAState.keys.primary));assert.equal(durable.life.resources.money,before);assert.equal(!!durable.frag.F04.play.consumed?.[id],false);assert.ok(durable.frag.F04.play.pending);
 c.localStorage.setItem=original;c.RAState.load();const resumed=await c.RAWarRoomPlay.resume({transport:host.transport});assert.equal(resumed.ok,true);const once=c.RALife.money();assert.equal(once,before+result.cash.gain-result.cash.spent);assert.equal(c.RAWarRoomPlay.pending(),null);assert.ok(c.RAWarRoomPlay.consumed(id));
 c.RAState.load();assert.equal(c.RAWarRoomPlay.consume(plain(result)).duplicate,true);assert.equal(c.RALife.money(),once);assert.equal(host.calls,1,'cached retry does not re-simulate');assert.equal(c.RAWarRoomPlay.pending(),null);
 const live=plain(c.RAState.get()),entries=plain(c.RAMoneyLedger.entries());let delivered=0;c.RACrew.onChange(()=>delivered++);
 c.localStorage.setItem=(k,v)=>{if(k===c.RAState.keys.primary)throw Error('storage unavailable');return original(k,v);};
 const blocked=c.RAState.atomic(()=>{c.RACrew.define({id:'atomic_uncommitted',fragment:'test'});c.RACrew.story('atomic_uncommitted','test',true);c.RAMoneyLedger.credit(123,{source:'test:atomic'});c.RAState.transaction(s=>{s.life.resources.followers+=7;});});
 assert.equal(blocked.ok,false);assert.equal(c.RACrew.get('atomic_uncommitted'),null);assert.equal(delivered,0);assert.deepEqual(plain(c.RAState.get()),live);assert.deepEqual(plain(c.RAMoneyLedger.entries()),entries);
 let launched=0;const unsaved=await c.RAWarRoomPlay.launch(card(c,'DROP','inglewood'),{transport:()=>{launched++;}});assert.equal(unsaved.code,'SAVE_FAILED');assert.equal(launched,0);c.localStorage.setItem=original;
 // The F07 bridge commits its effects and marker together, without adding the F01 pot.
 const q=await full(root);q.setInterval=()=>0;await run(root,q,['js/frag/F03/migrations.js','js/frag/F07/migrations.js',...F01_FILES,'js/frag/F03/new_oga_ladder_close.js',...F04_FILES,...['tunables','play_bridge','gbenga_combat','m8_and_finale'].map(x=>'js/frag/F07/'+x+'.js')]);q.RAFeatures.set('F07.m8_and_finale',true);q.RAFeatures.set('F01.showdown_core',true);q.RAState.patch('life.resources.money',200000);
 const h=await playHost(root),set=q.localStorage.setItem;let r7,id7,snapshot;
 const f7=await q.RAF07Play.run('m8',{transport:async req=>{r7=await h.transport(req);id7=req.requestId;snapshot=plain(q.RAState.get());q.localStorage.setItem=(key,value)=>{if(key===q.RAState.keys.primary&&JSON.parse(value).frag?.F07?.play?.consumed?.[id7])throw Error('receipt quota');return set(key,value);};return r7;}});
 assert.equal(f7.ok,false);assert.equal(f7.code,'SAVE_FAILED');assert.deepEqual(plain(q.RAState.get()),snapshot);assert.equal(q.RAF07Play.consumed(id7),null);assert.ok(q.RAF07Play.pending());q.localStorage.setItem=set;q.RAState.load();const done=await q.RAF07Play.run('m8',{transport:h.transport});assert.equal(done.ok,true);assert.equal(q.RALife.money(),200000-r7.cash.spent);q.RAState.load();assert.equal(q.RAF07Play.consume(plain(r7)).duplicate,true);assert.equal(q.RALife.money(),200000-r7.cash.spent);assert.equal(h.calls,1);
 // Fail each durable write: recovery envelope or primary record, at request or settlement.
 for(const phase of ['pending','settlement'])for(const keyName of ['recovery','primary']){
  const x=await loadWar(root);x.setInterval=()=>0;activate(x);const transport=await playHost(root),write=x.localStorage.setItem,start=plain(x.RAState.get());let pre,canonical,calls=0;
  const fail=()=>{x.localStorage.setItem=(key,value)=>{if(key===x.RAState.keys[keyName])throw Error('injected '+phase+' '+keyName);return write(key,value);};};
  if(phase==='pending')fail();
  const rejected=await x.RAWarRoomPlay.launch(card(x,'DROP','inglewood'),{transport:async req=>{calls++;canonical=await transport.transport(req);pre=plain(x.RAState.get());if(phase==='settlement')fail();return canonical;}});
  assert.equal(rejected.ok,false);assert.equal(rejected.code,'SAVE_FAILED');assert.deepEqual(plain(x.RAState.get()),phase==='pending'?start:pre);assert.equal(calls,phase==='pending'?0:1);
  x.localStorage.setItem=write;x.RAState.load();const recovered=phase==='pending'?await x.RAWarRoomPlay.launch(card(x,'DROP','inglewood'),{transport:transport.transport}):await x.RAWarRoomPlay.resume({transport:transport.transport});
  assert.equal(recovered.ok,true);assert.equal(x.RAWarRoomPlay.pending(),null);const finished=x.RALife.money();x.RAState.load();assert.equal(x.RALife.money(),finished);
  if(canonical){assert.equal(x.RAWarRoomPlay.consume(plain(canonical)).duplicate,true);assert.equal(x.RALife.money(),finished);}
 }
 // The same four durable-write exception positions in the F07 mission bridge.
 for(const phase of ['pending','settlement'])for(const keyName of ['recovery','primary']){
  const start=plain(q.RAState.get()),host=await playHost(root),write=q.localStorage.setItem;let pre,canonical,calls=0;
  const fail=()=>{q.localStorage.setItem=(key,value)=>{if(key===q.RAState.keys[keyName])throw Error('injected F07 '+phase+' '+keyName);return write(key,value);};};
  if(phase==='pending')fail();
  const rejected=await q.RAF07Play.run('m8',{transport:async req=>{calls++;canonical=await host.transport(req);pre=plain(q.RAState.get());if(phase==='settlement')fail();return canonical;}});
  assert.equal(rejected.ok,false);assert.equal(rejected.code,'SAVE_FAILED');assert.deepEqual(plain(q.RAState.get()),phase==='pending'?start:pre);assert.equal(calls,phase==='pending'?0:1);
  q.localStorage.setItem=write;q.RAState.load();const done=await q.RAF07Play.run('m8',{transport:host.transport});assert.equal(done.ok,true);const once=q.RALife.money();assert.equal(q.RAF07Play.pending(),null);q.RAState.load();assert.equal(q.RALife.money(),once);
  if(canonical){assert.equal(q.RAF07Play.consume(plain(canonical)).duplicate,true);assert.equal(q.RALife.money(),once);}
 }
 console.log('PASS atomic PLAY receipt/failure/reload/cache/observer/launch tests (F04 + F07, eight storage exception positions)');
}
