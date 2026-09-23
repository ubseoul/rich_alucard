import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import vm from 'node:vm';

export async function testProperty(root){
  const read=file=>readFile(path.join(root,file),'utf8');
  const hash=bytes=>createHash('sha256').update(bytes).digest('hex');

  const frozen=[
    ['assets/property/characters/shannon/shannon_neutral_80x96.png','fb0e7e2eeee363388f58bf3ae97a9934c3615ffa5130a17addb1edd978377052',80,96],
    ['assets/property/characters/shannon/shannon_controlled_reaction_80x96.png','07afdadc921e0953459c2814d2f3ef786d9ee5bce85548d144348b89e4ef4239',80,96],
    ['assets/property/masters/property_exterior_270x480.png','84912bb6ed4d89dedfa10aef1869f6c0b09f766e730c97ee5e984a1580e3df2d',270,480],
    ['assets/property/masters/property_interior_base_270x480.png','e962dc55090f440e12e97c7ca60e5452413aefc66ee73f925a20f701f0c3576f',270,480],
    ['assets/property/layers/property_problem_overlay_270x480.png','c1e8b5b34240f583a77af7a0f59ed3826e331853551e231e50cb8084bdf4f358',270,480],
    ['assets/property/ui/property_ownership_thumbnail_96x96.png','6d433728e77a39c0f5ec7bbc267421bb0558964ddeb5049c9f8c91772be4742e',96,96],
    ['assets/property/creatures/giant_rat/giant_rat_alert_96x64.png','68c300f5bb34a092c4f2bf6161dde4e35ee62ba49ddec907799767cd5b960c5b',96,64],
    ['assets/property/creatures/giant_rat/giant_rat_scurry_96x64.png','7b79c5d390ff3612b507d035cd73ceae404a3b2db350186a64139dd0c0410bcb',96,64],
    ['assets/property/creatures/giant_rat/giant_rat_recoil_96x64.png','deecce7d238fc521d97edc4b242e09fadac99897f0cf2660e9ab703b817d12d4',96,64]
  ];
  for(const [file,expected,w,h] of frozen){
    const bytes=await readFile(path.join(root,file));
    assert.equal(hash(bytes),expected,`Frozen Property asset changed: ${file}`);
    assert.deepEqual([bytes.readUInt32BE(16),bytes.readUInt32BE(20)],[w,h],`Property asset dimensions changed: ${file}`);
  }

  const stageContext={structuredClone};stageContext.window=stageContext;vm.createContext(stageContext);
  for(const file of ['js/data/stages.js','js/engine/stage.js'])vm.runInContext(await read(file),stageContext,{filename:file});
  const {RAStages,RAStageLayout}=stageContext;
  assert(RAStageLayout.runSelfTest(),'stage geometry regression');
  const exterior=RAStages.get('property-la-4p-exterior'),interior=RAStages.get('property-la-4p-interior');
  assert(exterior&&interior,'Property stage contracts missing');
  assert(exterior.actors.rich&&exterior.actors.shannon,'exterior actor slots missing');
  assert(interior.actors.rich&&interior.actors.shannon&&interior.rat,'interior actor/rat slots missing');
  const richRect=RAStageLayout.actorRect(interior,'rich'),shannonRect=RAStageLayout.actorRect(interior,'shannon');
  assert.equal(richRect.contact.y,352);assert.equal(shannonRect.contact.y,352);

  const contentContext={structuredClone};contentContext.window=contentContext;vm.createContext(contentContext);
  for(const file of ['js/systems/property.js','js/data/property_content.js'])vm.runInContext(await read(file),contentContext,{filename:file});
  const {RAProperty,RAPropertyContent}=contentContext;
  const allPhases=[...RAPropertyContent.exteriorPhases,...RAPropertyContent.interiorPhases];
  const idsSeen=new Set();
  for(const phase of allPhases){
    assert(!idsSeen.has(phase.id),`duplicate property phase id ${phase.id}`);idsSeen.add(phase.id);
    if(phase.mode==='lines')for(const line of phase.lines)assert(line.kind==='narration'?line.speakerId===null:!!line.speakerId,`line in ${phase.id} missing correct speaker/kind pairing`);
    if(phase.mode==='hotspot')for(const [id,lines] of Object.entries(phase.hotspots))for(const line of lines)assert(line.text,`hotspot ${id} in ${phase.id} has an empty line`);
  }
  // Every Rich spoken line in the shipped content must be the HQ-supplied ownership line only.
  const richLines=allPhases.flatMap(p=>p.mode==='lines'?p.lines.filter(l=>l.speakerId==='rich'):[]);
  assert.equal(richLines.length,1,'unexpected number of voiced Rich lines shipped');
  assert.equal(richLines[0].text,"That's my fucking property now.",'shipped Rich line does not match the HQ-supplied ownership line');
  assert.equal(richLines[0].richVoiceStatus,'hq_supplied','shipped Rich line is not marked HQ-supplied');

  function findChoice(phaseId,choiceId,phases){const phase=phases.find(p=>p.id===phaseId);return phase?.choices?.find(c=>c.id===choiceId)||null;}
  function walkToOffer(firstSign,ratApproach,offerChoice){
    const phases=RAPropertyContent.interiorPhases;
    let committed=null,lastPayload=null;
    const consequences={
      firstSign(payload){lastPayload=payload;session.setPhase('rat_reveal');},
      ratApproach(payload){lastPayload=payload;session.setPhase('pressure_resolve');},
      acquire(payload){committed='acquire';lastPayload=payload;},
      goCurb(){committed='goCurb';}
    };
    const session=RAProperty.createSession({phases,onChoice(id,snapshot){
      const choice=findChoice(snapshot.phaseId,id,phases);
      if(choice.next)session.setPhase(choice.next);else if(choice.commit)session.commit(choice.commit,{choiceId:id});
    },consequences});
    assert(session.setPhase('int_entry'));
    session.advance();session.advance();
    assert(session.choose('begin'));
    for(const id of ['kitchen','patch','floor']){
      assert(session.inspect(id));
      while(session.view().hotspotActive)session.advance();
    }
    assert.equal(session.view().phaseId,'first_sign','auto-advance after three hotspots failed');
    session.advance();session.advance();session.advance();
    assert(session.choose(firstSign));
    session.advance();session.advance();
    assert(session.choose('continue'));
    session.advance();session.advance();
    assert(session.choose(ratApproach));
    session.advance();session.advance();
    assert(session.choose('continue'));
    session.advance();session.advance();
    assert(session.choose(offerChoice));
    return {committed,lastPayload};
  }
  const cutResult=walkToOffer('wait','stand_ground','cut'); // ids match content: firstSign choice ids are open/kitchen/wait; ratApproach ids are block/wider/stand_ground
  assert.equal(cutResult.committed,'acquire');assert.equal(cutResult.lastPayload.choiceId,'cut');
  const asisResult=walkToOffer('open','block','asis');
  assert.equal(asisResult.committed,'acquire');
  const curbResult=walkToOffer('kitchen','wider','curb');
  assert.equal(curbResult.committed,'goCurb');

  // Panel hotspot alone must trigger the first-sign phase without needing the count threshold.
  {
    const phases=RAPropertyContent.interiorPhases;
    const session=RAProperty.createSession({phases,onChoice(id,snapshot){
      const choice=findChoice(snapshot.phaseId,id,phases);
      if(choice?.next)session.setPhase(choice.next);
    },consequences:{}});
    session.setPhase('int_entry');session.advance();session.advance();session.choose('begin');
    assert(session.inspect('panel'));
    while(session.view().hotspotActive)session.advance();
    assert.equal(session.view().phaseId,'first_sign','panel hotspot did not trigger first sign directly');
  }

  // Regression: auto-advanced (hotspot-triggered) phase changes must be observable via onPhase,
  // not just explicit choice-driven ones, so persisted quest state stays in sync for reload/resume.
  {
    const phases=RAPropertyContent.interiorPhases;
    let lastPhaseSeen=null;
    const session=RAProperty.createSession({phases,onPhase(id){lastPhaseSeen=id;},onChoice(id,snapshot){
      const choice=findChoice(snapshot.phaseId,id,phases);
      if(choice?.next)session.setPhase(choice.next);
    },consequences:{}});
    session.setPhase('int_entry');session.advance();session.advance();session.choose('begin');
    assert.equal(lastPhaseSeen,'int_hotspot','onPhase did not fire for the initial hotspot phase');
    session.inspect('panel');
    while(session.view().hotspotActive)session.advance();
    assert.equal(lastPhaseSeen,'first_sign','onPhase did not fire for a hotspot auto-advance transition');
  }

  // Save schema / economy / people integration.
  const memoryStorage=()=>{const data=new Map();return {getItem:key=>data.has(key)?data.get(key):null,setItem:(key,value)=>data.set(key,String(value)),removeItem:key=>data.delete(key)};};
  const stateContext={structuredClone,localStorage:memoryStorage()};stateContext.window=stateContext;vm.createContext(stateContext);
  vm.runInContext(await read('js/engine/state.js'),stateContext,{filename:'js/engine/state.js'});
  const {RAState}=stateContext;
  assert.equal(RAState.version,11,'save schema version did not advance for the property foundation');
  assert.equal(RAState.defaults.life.property.active,null);assert(Array.isArray(RAState.defaults.life.property.completed)&&RAState.defaults.life.property.completed.length===0);
  const migratedV10=RAState.migrateWithReport({version:10,life:{}});
  assert(migratedV10.ok&&migratedV10.state.life.property.active===null&&Array.isArray(migratedV10.state.life.property.completed),'v10 saves must gain a safe life.property structure');
  const withOwnedProperty=RAState.migrateWithReport({version:11,life:{...RAState.defaults.life,ownership:{...RAState.defaults.life.ownership,properties:[{id:'property_la_4p_01',label:'PALOMA FOURPLEX',ownershipStatus:'owned'}]}}});
  assert(withOwnedProperty.ok&&withOwnedProperty.state.life.ownership.properties.length===1,'owned property must survive migration/normalization unchanged');

  const peopleContext={structuredClone,localStorage:memoryStorage()};peopleContext.window=peopleContext;vm.createContext(peopleContext);
  for(const file of ['js/engine/state.js','js/data/people.js','js/systems/people.js','js/data/opportunities.js'])vm.runInContext(await read(file),peopleContext,{filename:file});
  assert(peopleContext.RAPersonCatalog.shannon_001&&peopleContext.RAPersonCatalog.shannon_001.contactCapable===true,'Shannon is not registered as a contactable person');
  const shannonRecord=peopleContext.RAPeople.meetPerson('shannon_001','property_la_4p_01');
  assert(shannonRecord.met&&shannonRecord.contactable===true,'Shannon contact was not created correctly');
  const propertyOpportunity=peopleContext.RAOpportunities.definitions.find(x=>x.id==='property_fourplex');
  assert(propertyOpportunity&&propertyOpportunity.category==='real_estate','FOURPLEX / AS-IS opportunity is missing');

  const eventsContext={structuredClone};eventsContext.window=eventsContext;vm.createContext(eventsContext);
  vm.runInContext(await read('js/data/world_events.js'),eventsContext,{filename:'js/data/world_events.js'});
  const pb01=eventsContext.RAWorldEventDefinitions.find(e=>e.id==='property_pb01_001');
  assert(pb01&&pb01.deliveryChannel==='phone'&&pb01.once===true&&pb01.prerequisite.flags.propertyPb01Eligible===true,'PB-01 world event is missing or misconfigured');

  console.log(`PASS property foundation (9 frozen assets, exterior/interior stage geometry, ${allPhases.length} authored phases, hotspot auto-advance, cut/as-is/curb offer paths, Shannon contact, FOURPLEX opportunity, PB-01 event, save v11 persistence)`);
}
