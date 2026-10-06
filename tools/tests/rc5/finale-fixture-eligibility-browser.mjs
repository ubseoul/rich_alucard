import assert from 'node:assert/strict';
import {open} from '../../rc2/harness.mjs';
export async function test(){
 const h=await open({query:'?dev=1&mute=1'});
 try{const result=await h.page.evaluate(()=>{
  RAState.reset();RAState.patch('life.clock.started',true);RAState.patch('life.world.day',22);
  RANewOga.patch({mission:11,rank:6,title:'NEW OGA',m1Rewarded:true,m4Outcome:'win',m5Completed:true,m6Completed:true,m7Completed:true,m8Resolved:true,m9Resolved:true,m10Completed:true,finaleBegun:true,finaleDone:true});
  const flags={...RAState.get().life.world.flags};delete flags.ogunsRaveCompleted;RAState.patch('life.world.flags',flags);
  const incomplete={raw:RAAdventures.get('NEW_OGA_FINALE').available(),available:RAAdventures.available('NEW_OGA_FINALE')};
  for(const key of ['throneDone','ogunsRaveCompleted'])RALife.setFlag(key,true);
  const consistent={raw:RAAdventures.get('NEW_OGA_FINALE').available(),available:RAAdventures.available('NEW_OGA_FINALE'),pending:RARC3.pendingMission(),next:RARC3.next().kind};
  return {incomplete:{undefinedPredicate:incomplete.raw===undefined,available:incomplete.available},consistent};
 });
 assert.deepEqual(result.incomplete,{undefinedPredicate:true,available:true},'characterize known partial-fixture eligibility edge explicitly');
 assert.deepEqual(result.consistent,{raw:false,available:false,pending:null,next:'rest'},'completed prerequisite-consistent campaign blocks finale replay');
 assert.deepEqual(h.errors,[]);console.log('PASS independent eligibility characterization: unset prerequisite exposes known undefined/direct-API edge; consistent completed fixture blocks replay. Seeded proof, not earned campaign; source edge remains open.');
 }finally{await h.close();}
}
if(process.argv[1]?.endsWith('finale-fixture-eligibility-browser.mjs'))await test();
