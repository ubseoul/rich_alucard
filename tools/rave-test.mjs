import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import vm from 'node:vm';

export async function testRave(root){
  const read=file=>readFile(path.join(root,file),'utf8');
  const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
  const manifest=JSON.parse(await read('assets/ogun_rave/ART_PACKAGE_MANIFEST.json'));
  let assetCount=0;
  for(const [file,record] of Object.entries(manifest.files)){
    if(!/^(masters|layers|masks)\//.test(file))continue;
    const bytes=await readFile(path.join(root,'assets/ogun_rave',file));
    assert.equal(hash(bytes),record.sha256,`Frozen art changed: ${file}`);
    assert.equal(bytes.length,record.bytes);
    const size=[bytes.readUInt32BE(16),bytes.readUInt32BE(20)];
    assert.deepEqual(size,file.includes('ogun')?[80,96]:[270,480]);assetCount++;
  }
  assert.equal(hash(await readFile(path.join(root,'assets/rich_standing_right.png'))),manifest.files['references/rich_standing_right.png'].sha256);
  const context={structuredClone};context.window=context;vm.createContext(context);
  for(const file of ['js/data/stages.js','js/engine/stage.js','js/data/party_behaviors.js','js/systems/party.js','js/systems/rave.js'])vm.runInContext(await read(file),context,{filename:file});
  const {RAStages,RAStageLayout,RARave,RAPartyBehaviors}=context;
  assert(RAStageLayout.runSelfTest(),'existing stage geometry must remain unchanged');
  const stage=RAStages.get('ogun-rave');
  assert.equal(stage.referenceScale,1);assert.equal(stage.native.width,270);assert.equal(stage.native.height,480);
  for(const [id,x,y] of [['rich',35,256],['ogun',152,185]]){
    const r=RAStageLayout.actorRect(stage,id);assert.equal(r.x,x);assert.equal(r.y,y);assert.equal(r.width,80);assert.equal(r.height,96);
    assert.deepEqual(Object.keys(stage.actors[id].states),['neutral']);
  }
  assert(stage.foreground.layer>stage.actors.rich.layer&&stage.foreground.layer>stage.actors.ogun.layer);
  const empty=RARave.createSession({review:true});assert.equal(empty.snapshot().phase,null);assert.equal(empty.interact(),false);
  for(const behavior of RAPartyBehaviors)assert.equal(empty.equip(behavior.id),true);
  assert.equal(empty.setPhase('unknown'),false);assert.equal(empty.commit('unknown',{}),false);
  // Mechanical fixtures only: no adventure text, named people or production content.
  const results=Object.fromEntries(RAPartyBehaviors.map((b,i)=>[b.id,{reaction:String(i),response:String(i)}]));
  const situation={id:'__test_situation__',classification:'PRODUCTION',results};
  const phases=[{id:'__test_a__',dialogue:'__test_text__',choices:[{id:'__test_choice__',label:'__test_label__'}],party:{situations:[situation]}},{id:'__test_b__'}];
  let commits=0,reactions=0,choices=0,exits=0;
  const session=RARave.createSession({phases,onResult:()=>reactions++,onChoice:()=>choices++,onExit:()=>exits++,consequences:{__test_commit__:()=>commits++}});
  assert(session.setPhase('__test_a__'));
  for(const behavior of RAPartyBehaviors){assert(session.equip(behavior.id));assert(session.interact());assert(!session.interact());}
  assert.equal(reactions,3);assert(!session.choose('invalid'));assert(session.choose('__test_choice__'));assert.equal(choices,1);
  assert(session.patch({test:1}));const snapshot=session.snapshot();snapshot.state.test=8;assert.equal(session.snapshot().state.test,1);
  assert(!session.commit('unregistered',{}));assert(session.commit('__test_commit__',{}));assert.equal(commits,1);
  const review=RARave.createSession({review:true,consequences:{__test_commit__:()=>commits++}});assert(!review.commit('__test_commit__',{}));assert.equal(commits,1);
  assert(session.setPhase('__test_b__'));assert.equal(session.snapshot().party,null);assert(!session.interact());
  session.leave();session.leave();assert.equal(exits,1);assert(!session.equip('two-step'));assert(!session.setPhase('__test_a__'));assert(!session.patch({test:2}));assert(!session.commit('__test_commit__',{}));
  const dev=RARave.createSession({phases:[{id:'reject',party:{situations:[{...situation,classification:'DEV/PLACEHOLDER'}]}}]});
  assert.throws(()=>dev.setPhase('reject'),/DEV situations/);
  assert.equal(dev.snapshot().phase,null,'invalid phase must not partially enter');
  for(const file of ['index.html','rave-review.html']){
    const html=await read(file);assert(!html.includes('src="js/data/party.js?'));assert(!html.includes('src="js/scenes/party.js?'));
  }
  assert(!(await read('rave-review.html')).includes('js/engine/state.js'));
  console.log(`PASS rave foundation (${assetCount} frozen files + Rich hashes/dimensions, stage geometry, 3 adapter resolutions, phases/choices, explicit consequence boundary, review isolation)`);
}
