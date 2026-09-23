import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';

export async function testParty(root){
  const context={structuredClone};context.window=context;vm.createContext(context);
  for(const file of ['js/data/party.js','js/systems/party.js'])vm.runInContext(await readFile(path.join(root,file),'utf8'),context,{filename:file});
  const {RAPartyData:data,RAParty:party}=context;
  const definitions=JSON.stringify(data);
  assert.equal(data.behaviors.map(b=>b.label).join('|'),'TWO STEP|HEAD NOD|TOO COOL TO DANCE');
  let combinations=0,openings=0;
  for(const behavior of data.behaviors){
    const session=party.createSession();
    assert.equal(session.resolve(),false,'cannot act before equipping');
    assert.equal(session.next(),false,'cannot skip unresolved situation');
    assert.equal(session.equip('not-a-move'),false);
    assert.equal(session.equip(behavior.id),true);
    for(const situation of data.situations){
      assert.equal(situation.classification,'DEV/PLACEHOLDER');
      assert.equal(session.snapshot().situation,situation.id);
      assert.equal(session.resolve(),true);
      assert.equal(session.resolve(),false,'resolution must not repeat');
      const outcome=session.snapshot().outcome;combinations++;
      assert.equal(outcome.reaction,situation.results[behavior.id].reaction);
      if(outcome.opening){openings++;assert.equal(session.takeOpening(),true);assert.equal(session.takeOpening(),false);assert.equal(session.snapshot().outcome.response,outcome.opening.response);}
      else assert.equal(session.takeOpening(),false);
      assert.equal(session.next(),true);
      assert.equal(session.snapshot().outcome,null,'opening cannot leak into next situation');
      assert.equal(session.snapshot().equipped,behavior.id);
    }
    assert.equal(session.snapshot().index,0,'repeat loops to first situation');
    session.resolve();session.equip(data.behaviors.find(b=>b.id!==behavior.id).id);
    assert.equal(session.snapshot().phase,'choose');assert.equal(session.snapshot().outcome,null);
    session.reset();assert.equal(session.snapshot().equipped,null);assert.equal(session.snapshot().index,0);
    session.leave();assert.equal(session.resolve(),false);assert.equal(session.next(),false);assert.equal(session.equip(behavior.id),false);
    session.reset();assert.equal(session.equip(behavior.id),true);
  }
  for(const situation of data.situations)assert.equal(new Set(Object.values(situation.results).map(r=>r.response)).size,3,'each situation must distinguish all behaviors');
  assert.equal(JSON.stringify(data),definitions,'runtime must not mutate authored data');
  assert.equal(combinations,9);assert.equal(openings,3);
  const html=await readFile(path.join(root,'party-dev.html'),'utf8');
  assert(!html.includes('js/engine/state.js'),'prototype must not load production persistence');
  console.log(`PASS party foundation (${combinations} resolutions, ${openings} openings, switching/reset/repeat/leave; no persistence globals available)`);
}
