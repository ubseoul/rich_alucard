#!/usr/bin/env node
import {execFileSync} from 'node:child_process';
import {cp, mkdir, readFile, rm, writeFile, readdir} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {testParty} from './party-test.mjs';
import {testRave} from './rave-test.mjs';
import {testOgunRaveAdventure} from './ogun-rave-adventure-test.mjs';
import {testProperty} from './property-test.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'dist');
const action=process.argv[2];
const arg=name=>{const index=process.argv.indexOf(name);return index===-1?null:process.argv[index+1]||null;};
const sha=()=>arg('--commit')||process.env.GITHUB_SHA||execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
const compactTimestamp=value=>value.replace(/[-:.TZ]/g,'').slice(0,14);
const read=relative=>readFile(path.join(root,relative),'utf8');
const runtimeFiles=['index.html','party-dev.html','rave-review.html','minigame-lab.html','style.css','game.js'];
const staticDirectories=['assets','js'];

function assert(condition,message){if(!condition)throw new Error(message);}
function memoryStorage(){const data=new Map();return {getItem:key=>data.has(key)?data.get(key):null,setItem:(key,value)=>data.set(key,String(value)),removeItem:key=>data.delete(key)};}
async function javascriptFiles(directory){const entries=await readdir(directory,{withFileTypes:true});const nested=await Promise.all(entries.map(async entry=>entry.isDirectory()?javascriptFiles(path.join(directory,entry.name)):entry.name.endsWith('.js')?[path.join(directory,entry.name)]:[]));return nested.flat();}

async function test(){
  await testParty(root);
  await testRave(root);
  await testOgunRaveAdventure(root);
  await testProperty(root);
  const minigameTests=(await readdir(path.join(root,'tools','minigames'))).filter(name=>name.endsWith('-test.mjs')).sort();
  for(const name of minigameTests){const mod=await import(pathToFileURL(path.join(root,'tools','minigames',name)).href);await mod.test(root);}
  const btf=await import(pathToFileURL(path.join(root,'tools','btf-test.mjs')).href);await btf.test(root);
  const sources=await javascriptFiles(path.join(root,'js'));
  for(const file of [...sources,path.join(root,'game.js')])new vm.Script(await readFile(file,'utf8'),{filename:path.relative(root,file)});
  const listeners={};
  const context={window:{},console,localStorage:memoryStorage(),setTimeout,clearTimeout,setInterval,clearInterval,requestAnimationFrame:fn=>setTimeout(()=>fn(0),0),cancelAnimationFrame:clearTimeout,document:{addEventListener(type,fn){listeners[type]=listeners[type]||[];listeners[type].push(fn)},removeEventListener(type,fn){listeners[type]=(listeners[type]||[]).filter(item=>item!==fn)},dispatchEvent(event){for(const fn of listeners[event.type]||[])fn(event)}},CustomEvent:function(type,init){this.type=type;this.detail=init?.detail;}};context.window=context;vm.createContext(context);
  for(const file of ['js/engine/state.js','js/data/save_fixtures.js','js/data/opportunities.js','js/engine/scenes.js','js/data/stages.js','js/engine/stage.js','js/data/combat.js','js/engine/combat_foundation.js','js/data/people.js','js/systems/people.js','js/data/world_events.js','js/systems/world_events.js'])vm.runInContext(await read(file,'utf8'),context,{filename:file});
  const {RAState,RASaveFixtures,RAOpportunities}=context;
  const fixtures=RASaveFixtures.fixtures,ids=RASaveFixtures.ids;
  const v6=RAState.migrateWithReport(fixtures.lifeV6),owned=RAState.migrateWithReport(fixtures.supraOwned),partial=RAState.migrateWithReport(fixtures.partialCorrupt);
  assert(v6.ok&&v6.state.version===RAState.version&&v6.state.life.resources.money===86000,'v6 migration did not preserve life progress');
  assert(owned.ok&&owned.state.life.ownership.cars.filter(item=>item.id===ids.supraId).length===1,'owned Supra fixture was not preserved');
  assert(owned.state.life.world.flags.jdmHomeDelivery===true&&owned.state.characters.jdm_importer_daughter_001.conversionOutcome==='converted','one-time acquisition consequences were not preserved');
  assert(partial.ok&&partial.state.life.ownership.cars.length===1&&partial.state.life.desires.completed.length===1,'partial save normalization failed');
  const storage=RASaveFixtures.memoryStorage();const known=RAState.migrateRecord(fixtures.supraOwned);
  storage.setItem(RAState.keys.primary,fixtures.malformedJson);storage.setItem(RAState.keys.recovery,JSON.stringify({format:1,state:known}));
  const recovered=RAState.read(storage);assert(recovered.status.recovered&&recovered.state.life.ownership.cars[0].id===ids.supraId,'malformed save did not recover from backup');
  const fresh=RAState.migrateRecord(fixtures.fresh).life;
  assert(RAOpportunities.evaluate(RAOpportunities.definitions.find(item=>item.id==='atlanta'),fresh).available,'Atlanta opportunity regression');
  assert(!RAOpportunities.evaluate(RAOpportunities.definitions.find(item=>item.id==='tokyo'),fresh).available,'Tokyo lock regression');
  assert(await context.RAScenes.runSelfTest(),'scene lifecycle cancellation regression');
  assert(context.RAStageLayout.runSelfTest(),'stage contract geometry regression');
  assert(context.RACombatFoundation.runSelfTest(),'combat foundation regression');
  const assistant=context.RAPeople.meetPerson('ceo_assistant_001','legacy');context.RAPeople.rememberPersonEvent('ceo_assistant_001','ceo_assistant_stolen');context.RAPeople.rememberPersonEvent('ceo_assistant_001','ceo_assistant_stolen');context.RAPeople.setConversionState('ceo_assistant_001','converted');const daughter=context.RAPeople.meetPerson('jdm_importer_daughter_001','jdm_imports_docks');assert(assistant.met&&context.RAPeople.record('ceo_assistant_001').memories.length===1&&context.RAPeople.record('ceo_assistant_001').conversionState==='converted'&&daughter.met&&context.RAPeople.known().length===2,'persistent people idempotency regression');
  context.RAWorldEvents.reset('player_blind_proof_event_001');
  assert(!context.RAWorldEvents.evaluate('player_blind_proof_event_001').eligible,'world event should be ineligible before person prerequisite');
  context.RAPeople.rememberPersonEvent('jdm_importer_daughter_001','jdm_daughter_encountered');
  assert(context.RAWorldEvents.evaluate('player_blind_proof_event_001').eligible,'world event person prerequisite did not become eligible');
  context.RAWorldEvents.advanceBoundary('bedroom-entry');
  assert(context.RAWorldEvents.record('player_blind_proof_event_001').status==='pending','world event did not become pending at safe boundary');
  const persisted=context.RAState.migrateRecord(context.RAState.get());
  assert(persisted.life.events.records.player_blind_proof_event_001.status==='pending','pending event did not persist');
  context.RAWorldEvents.deliver('phone');
  assert(context.RAWorldEvents.record('player_blind_proof_event_001').status==='delivered'&&context.RAWorldEvents.record('player_blind_proof_event_001').deliveries===1,'phone delivery failed');
  context.RAWorldEvents.deliver('phone');
  assert(context.RAWorldEvents.record('player_blind_proof_event_001').deliveries===1,'event redelivered repeatedly');
  context.RAWorldEvents.see('player_blind_proof_event_001');context.RAWorldEvents.resolve('player_blind_proof_event_001','acknowledge');
  assert(context.RAWorldEvents.record('player_blind_proof_event_001').status==='resolved'&&context.RAState.get().life.world.flags.proofEvent001Handled===true,'event resolution did not persist');
  const beforeReset=JSON.stringify(context.RAState.get().life.people.records);context.RAWorldEvents.reset('player_blind_proof_event_001');
  assert(!context.RAWorldEvents.record('player_blind_proof_event_001')&&JSON.stringify(context.RAState.get().life.people.records)===beforeReset,'event reset damaged unrelated people state');
  const index=await read('index.html');assert(index.includes('__BUILD_ASSET_VERSION__'),'index is missing the build asset placeholder');
  console.log(`PASS deterministic release gate (${sources.length+1} JavaScript syntax checks, save fixtures, recovery, opportunity access)`);
}

function identity(){const commit=sha(),builtAt=new Date().toISOString(),shortCommit=commit.slice(0,12);const releaseId=`ra-${shortCommit}-${compactTimestamp(builtAt)}`;return {schemaVersion:1,releaseId,commit,shortCommit,builtAt,assetVersion:releaseId};}
async function build(){
  await test();
  const build=identity();
  await rm(output,{recursive:true,force:true});await mkdir(output,{recursive:true});
  for(const file of runtimeFiles)await cp(path.join(root,file),path.join(output,file));
  for(const directory of staticDirectories)await cp(path.join(root,directory),path.join(output,directory),{recursive:true});
  for(const page of ['index.html','party-dev.html','rave-review.html','minigame-lab.html']){
    const indexPath=path.join(output,page);const index=await readFile(indexPath,'utf8');assert(index.includes('__BUILD_ASSET_VERSION__'),'asset placeholder missing from artifact source');
    await writeFile(indexPath,index.replaceAll('__BUILD_ASSET_VERSION__',build.assetVersion));
  }
  await writeFile(path.join(output,'build.json'),`${JSON.stringify(build,null,2)}\n`);
  await writeFile(path.join(output,'js','build-info.js'),`/* Generated by tools/release.mjs. Do not edit. */\nwindow.RABuild=${JSON.stringify(build)};\n`);
  await verifyArtifact(build);console.log(`PASS built ${build.releaseId} for ${build.commit}`);
}
async function verifyArtifact(expected=null){
  const build=expected||JSON.parse(await readFile(path.join(output,'build.json'),'utf8'));
  assert(build.schemaVersion===1&&typeof build.releaseId==='string'&&typeof build.commit==='string'&&typeof build.builtAt==='string','invalid build.json identity');
  const index=await readFile(path.join(output,'index.html'),'utf8'),info=await readFile(path.join(output,'js','build-info.js'),'utf8');
  assert(!index.includes('__BUILD_ASSET_VERSION__')&&index.includes(build.assetVersion),'artifact has inconsistent cache identity');
  assert(info.includes(build.commit)&&info.includes(build.releaseId),'DEV build metadata disagrees with build.json');
  const party=await readFile(path.join(output,'party-dev.html'),'utf8');
  assert(!party.includes('__BUILD_ASSET_VERSION__')&&party.includes(build.assetVersion),'party artifact has inconsistent cache identity');
  const rave=await readFile(path.join(output,'rave-review.html'),'utf8');
  assert(!rave.includes('__BUILD_ASSET_VERSION__')&&rave.includes(build.assetVersion),'rave review has inconsistent cache identity');
  for(const file of runtimeFiles)assert(existsSync(path.join(output,file)),`artifact missing ${file}`);
  for(const directory of staticDirectories)assert(existsSync(path.join(output,directory)),`artifact missing ${directory}`);
  if(!expected)console.log(`PASS artifact verification ${build.releaseId} (${build.commit})`);
}
async function verifyDeployment(){
  const base=(arg('--url')||'').replace(/\/$/,'');const expectedCommit=arg('--commit');const retries=Number(arg('--retries')||1);assert(base&&expectedCommit,'verify-deployment requires --url and --commit');
  let lastError;
  for(let attempt=1;attempt<=retries;attempt++)try{
    const response=await fetch(`${base}/build.json?commit=${expectedCommit}&attempt=${attempt}`,{cache:'no-store'});assert(response.ok,`public build.json unavailable: ${response.status}`);const build=await response.json();
    assert(build.commit===expectedCommit,`public commit ${build.commit} does not match expected ${expectedCommit}`);
    const info=await fetch(`${base}/js/build-info.js?v=${encodeURIComponent(build.assetVersion)}&attempt=${attempt}`,{cache:'no-store'});const body=await info.text();assert(info.ok&&body.includes(build.commit)&&body.includes(build.releaseId),'public DEV identity disagrees with build.json');
    console.log(`PASS public deployment ${build.releaseId} (${build.commit})`);return;
  }catch(error){lastError=error;if(attempt<retries)await new Promise(resolve=>setTimeout(resolve,10000));}
  throw lastError;
}

try{
  if(action==='test')await test();
  else if(action==='build')await build();
  else if(action==='verify-artifact')await verifyArtifact();
  else if(action==='verify-deployment')await verifyDeployment();
  else throw new Error('Usage: node tools/release.mjs <test|build|verify-artifact|verify-deployment>');
}catch(error){console.error(`FAIL ${error.message}`);process.exitCode=1;}
