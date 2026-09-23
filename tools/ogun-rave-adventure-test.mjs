import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import vm from 'node:vm';

export async function testOgunRaveAdventure(root){
  const read=file=>readFile(path.join(root,file),'utf8');
  const hash=bytes=>createHash('sha256').update(bytes).digest('hex');

  const bllad33Bytes=await readFile(path.join(root,'assets/bllad33/masters/bllad33_neutral_candidate_80x96.png'));
  assert.equal(hash(bllad33Bytes),'fcca67ce0a90a60f16854c3c5f8019a28d243aa2bf3bf86ecdf5631013198f5b','Frozen Bllad33 master changed');
  assert.deepEqual([bllad33Bytes.readUInt32BE(16),bllad33Bytes.readUInt32BE(20)],[80,96],'Bllad33 master dimensions changed');

  const exteriorBytes=await readFile(path.join(root,'assets/ogun_rave/masters/rave_exterior_270x480.png'));
  assert.equal(hash(exteriorBytes),'81badc10ea5e84d1e7bcd94f337ff8beab6a6c93f3112754bc19793131438dc8','Frozen Ogun rave exterior master changed');
  assert.deepEqual([exteriorBytes.readUInt32BE(16),exteriorBytes.readUInt32BE(20)],[270,480],'Ogun rave exterior master dimensions changed');

  const stageContext={structuredClone};stageContext.window=stageContext;vm.createContext(stageContext);
  for(const file of ['js/data/stages.js','js/engine/stage.js'])vm.runInContext(await read(file),stageContext,{filename:file});
  const {RAStages,RAStageLayout}=stageContext;
  assert(RAStageLayout.runSelfTest(),'stage geometry regression');
  const stage=RAStages.get('ogun-rave');
  assert(stage.actors.bllad33,'ogun-rave stage is missing the Bllad33 actor slot');
  assert.equal(stage.actors.bllad33.states.neutral,'assets/bllad33/masters/bllad33_neutral_candidate_80x96.png');
  const bllad33Rect=RAStageLayout.actorRect(stage,'bllad33');
  assert.equal(bllad33Rect.width,80);assert.equal(bllad33Rect.height,96);
  assert.deepEqual(Object.keys(stage.actors.rich.states),['neutral']);
  assert.deepEqual(Object.keys(stage.actors.ogun.states),['neutral']);

  const contentContext={structuredClone};contentContext.window=contentContext;vm.createContext(contentContext);
  for(const file of ['js/data/party_behaviors.js','js/systems/party.js','js/systems/rave.js','js/data/ogun_rave_content.js'])vm.runInContext(await read(file),contentContext,{filename:file});
  const {RAPartyBehaviors,RARave,RAOgunRaveContent}=contentContext;
  const behaviorIds=RAPartyBehaviors.map(b=>b.id);
  const allPhases=[...RAOgunRaveContent.interiorPhases,...RAOgunRaveContent.exteriorPhases];
  const idsSeen=new Set();
  for(const phase of allPhases){
    assert(!idsSeen.has(phase.id),`duplicate phase id ${phase.id}`);idsSeen.add(phase.id);
    assert(Array.isArray(phase.choices)&&phase.choices.length,`phase ${phase.id} has no way to move the adventure forward`);
    for(const choice of phase.choices)assert(choice.next||choice.commit,`choice ${choice.id} in ${phase.id} goes nowhere`);
    if(phase.party){
      assert.equal(phase.party.situations.length,1,`phase ${phase.id} must carry exactly one authored situation`);
      const situation=phase.party.situations[0];
      assert.equal(situation.classification,'PRODUCTION',`situation in ${phase.id} must be PRODUCTION classified`);
      for(const id of behaviorIds)assert(situation.results[id]&&situation.results[id].reaction,`situation in ${phase.id} is missing a ${id} result`);
    }
  }
  const bllad33Phase=RAOgunRaveContent.interiorPhases.find(p=>p.id==='bllad33Enter');
  assert(bllad33Phase&&bllad33Phase.dialogue.includes('NIGGA IS THAT Bllad33'),"Rich's exact Bllad33 reaction line is missing or altered");
  assert(bllad33Phase.actors&&bllad33Phase.actors.bllad33===true,'Bllad33 must become visible on his own entrance phase');

  function walk(phases,startId,endCommit){
    let committed=null;
    const session=RARave.createSession({phases,onChoice(id,snapshot){
      const phase=phases.find(p=>p.id===snapshot.phase),choice=phase.choices.find(c=>c.id===id);
      if(choice.next)session.setPhase(choice.next);else if(choice.commit)session.commit(choice.commit,{});
    },consequences:{[endCommit]:()=>{committed=endCommit;}}});
    assert(session.setPhase(startId),`could not enter starting phase ${startId}`);
    let steps=0;
    while(!committed&&steps<50){
      const view=session.view();
      if(view.party){
        assert(session.equip(behaviorIds[0]));assert(session.interact('resolve'));
        if(session.snapshot().party.outcome?.opening)assert(session.interact('takeOpening'));
      }
      const choiceId=view.choices[0]?.id;
      assert(choiceId,`phase ${view.phase} has no choices to progress the adventure`);
      assert(session.choose(choiceId));
      steps++;
    }
    assert(committed,'adventure did not reach its expected completion consequence');
    return steps;
  }
  const interiorSteps=walk(RAOgunRaveContent.interiorPhases,'arrival','leaveRave');
  const exteriorSteps=walk(RAOgunRaveContent.exteriorPhases,'outside','finishNight');
  assert(interiorSteps>=6,'interior adventure feels too short for a first full adventure');

  const eventsContext={structuredClone};eventsContext.window=eventsContext;vm.createContext(eventsContext);
  vm.runInContext(await read('js/data/world_events.js'),eventsContext,{filename:'js/data/world_events.js'});
  const invite=eventsContext.RAWorldEventDefinitions.find(event=>event.id==='ogun_rave_invite_001');
  assert(invite,"Ogun's Rave invite world event is missing");
  assert.equal(invite.deliveryChannel,'phone');assert(invite.once===true);assert(invite.safeBoundaries.includes('bedroom-entry'));
  assert(invite.actions.some(action=>action.resolution?.flag==='ogunsRaveInvited'),'invite does not unlock the ogunsRaveInvited flag');

  const oppContext={structuredClone};oppContext.window=oppContext;vm.createContext(oppContext);
  vm.runInContext(await read('js/data/opportunities.js'),oppContext,{filename:'js/data/opportunities.js'});
  const rule=oppContext.RAOpportunities.definitions.find(item=>item.id==='ogun_rave');
  assert(rule,'ogun_rave opportunity is missing');
  assert.equal(oppContext.RAOpportunities.evaluate(rule,{world:{flags:{}},resources:{},people:{}}).available,false,'ogun_rave must stay locked before the invite');
  assert.equal(oppContext.RAOpportunities.evaluate(rule,{world:{flags:{ogunsRaveInvited:true}},resources:{},people:{}}).available,true,'ogun_rave must unlock once invited');

  const memoryStorage=()=>{const data=new Map();return {getItem:key=>data.has(key)?data.get(key):null,setItem:(key,value)=>data.set(key,String(value)),removeItem:key=>data.delete(key)};};
  const stateContext={structuredClone,localStorage:memoryStorage()};stateContext.window=stateContext;vm.createContext(stateContext);
  vm.runInContext(await read('js/engine/state.js'),stateContext,{filename:'js/engine/state.js'});
  const {RAState}=stateContext;
  assert.equal(RAState.version,10,'save schema version did not advance for the night foundation');
  assert.equal(JSON.stringify(RAState.defaults.life.night),JSON.stringify({active:null,completed:[]}));
  const migratedV9=RAState.migrateWithReport({version:9,life:{}});
  assert(migratedV9.ok&&migratedV9.state.life.night&&migratedV9.state.life.night.active===null&&Array.isArray(migratedV9.state.life.night.completed),'v9 saves must gain a safe life.night structure');
  const activeNight={id:'ogun_rave_001',status:'in_progress',phase:'floor1',startedAt:'2026-09-23T00:00:00.000Z'};
  const withActive=RAState.migrateWithReport({version:10,life:{...RAState.defaults.life,night:{active:activeNight,completed:[]}}});
  assert(withActive.ok&&withActive.state.life.night.active.phase==='floor1','an in-progress night must survive migration/normalization unchanged');
  const withCompleted=RAState.migrateWithReport({version:10,life:{...RAState.defaults.life,night:{active:null,completed:[{id:'ogun_rave_001',completedAt:'2026-09-23T02:00:00.000Z'}]},world:{...RAState.defaults.life.world,flags:{ogunsRaveCompleted:true,castlePartyHostingUnlocked:true}}}});
  assert(withCompleted.ok&&withCompleted.state.life.world.flags.castlePartyHostingUnlocked===true,'completed-night flags must persist through migration');

  console.log(`PASS ogun's rave adventure (${allPhases.length} authored phases, ${interiorSteps} interior / ${exteriorSteps} exterior choice-graph steps, 3 party situations replayed across all behaviors, Bllad33 stage slot + frozen hash, world-event/opportunity gating, save v10 persistence)`);
}
