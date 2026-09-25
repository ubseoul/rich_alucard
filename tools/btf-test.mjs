// BTF Rough Complete deterministic gate: schema v12 migration, life clock/calendar, temptation cadence,
// adventure graph validation, and a headless walker that drives every adventure branch to completion.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import {pathToFileURL} from 'node:url';

export async function loadBtf(root,{seedState=null}={}){
 const read=file=>readFile(path.join(root,file),'utf8');
 const store=new Map();const storage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
 const listeners={};
 const stubEl=()=>({style:{},dataset:{},classList:{add(){},remove(){},toggle(){},contains:()=>false},addEventListener(){},removeEventListener(){},append(){},remove(){},querySelector:()=>null,querySelectorAll:()=>[],setAttribute(){},getContext:()=>new Proxy({},{get:()=>()=>({width:0})}),getBoundingClientRect:()=>({left:0,top:0,width:270,height:480})});
 const context={console,structuredClone,setTimeout,clearTimeout,setInterval,clearInterval,Intl,URLSearchParams,
  localStorage:storage,sessionStorage:storage,requestAnimationFrame:fn=>setTimeout(()=>fn(0),0),cancelAnimationFrame:clearTimeout,
  document:{addEventListener(t,f){(listeners[t]=listeners[t]||[]).push(f)},removeEventListener(){},dispatchEvent(e){for(const f of listeners[e.type]||[])f(e);return true},querySelector:()=>null,querySelectorAll:()=>[],createElement:stubEl,body:stubEl()},
  CustomEvent:function(type,init){this.type=type;this.detail=init?.detail;},Image:function(){return stubEl()},CSS:{escape:s=>s}};
 context.window=context;vm.createContext(context);
 if(seedState)storage.setItem('rich_alucard_save_v1',JSON.stringify(seedState));
 const engine=['js/engine/state.js','js/data/save_fixtures.js','js/engine/scenes.js','js/engine/display.js','js/engine/pixel.js','js/engine/minigames.js','js/data/opportunities.js','js/data/people.js','js/systems/people.js','js/data/world_events.js','js/systems/world_events.js','js/systems/budget.js',
  'js/systems/life.js','js/systems/life_clock.js','js/data/art_registry.js','js/data/art_integration.js','js/data/art_surfaces.js','js/data/btf/people.js','js/systems/relations.js','js/systems/rewards.js','js/engine/adventures.js','js/data/btf/environments.js','js/systems/temptations.js','js/systems/places.js','js/systems/sealed.js','js/systems/fame.js','js/systems/vampgram.js','js/systems/radio.js','js/data/btf/dsl.js'];
 for(const f of engine)vm.runInContext(await read(f),context,{filename:f});
 const {contentFiles}=await import(pathToFileURL(path.join(root,'tools','sync-index.mjs')).href);
 for(const f of await contentFiles()){if(f.startsWith('js/minigames/')||f==='js/data/bars_words.js')continue;vm.runInContext(await read(f),context,{filename:f});}
 return context;
}

// Drive one adventure from start to end with a choice policy. Minigames/fights get synthetic results.
export function walk(ctx,id,{vars={},pick=(choices,step)=>0,minigame=()=>({outcome:'win',score:1,rewards:{}}),fight=()=>({outcome:'win'}),maxSteps=400}={}){
 const {RAAdventures}=ctx;const run=RAAdventures.start(id,{from:'test',vars});assert(run,`could not start ${id}`);
 let node=run.node,steps=0;const visited=[];
 while(node&&steps++<maxSteps){
  const r=RAAdventures.enter(node);assert(r,`${id}: enter failed at ${node}`);visited.push(node);const n=r.node;
  if(typeof n.lines==='function'){for(const line of n.lines(RAAdventures.context())||[])if(line&&line[0]==='rich')assert(line[2]&&(line[2].vp||line[2].canon),`${id}.${node}: Rich line not marked [VP]: ${line[1]}`);}
  if(typeof n.title==='function')n.title(RAAdventures.context());
  if(n.end){const res=RAAdventures.complete(node);return {res,visited};}
  if(n.route){const next=n.route.next;RAAdventures.context().set('route','walk');node=next;continue;}
  if(n.choices){const list=RAAdventures.choicesFor(node).filter(c=>!c.locked);if(!list.length){assert(n.next,`${id}.${node}: every choice locked and no fallback next`);node=RAAdventures.nextOf(node);continue;}const c=list[Math.min(list.length-1,pick(list,steps))];node=RAAdventures.choose(node,c.index);continue;}
  if(n.minigame){if(typeof n.minigame.params==='function')n.minigame.params(RAAdventures.context());node=RAAdventures.afterMinigame(node,minigame(n.minigame.id));continue;}
  if(n.fight){if(typeof n.fight.params==='function')n.fight.params(RAAdventures.context());node=RAAdventures.afterFight(node,fight(n.fight.enemy));continue;}
  node=RAAdventures.nextOf(node);
 }
 throw new Error(`${id}: walk did not reach an end (stuck at ${node} after ${steps} steps)`);
}

export async function test(root){
 {const {expectedIndex}=await import(pathToFileURL(path.join(root,'tools','sync-index.mjs')).href);const lf=text=>text.replace(/\r\n/g,'\n');assert.equal(lf(await readFile(path.join(root,'index.html'),'utf8')),lf(await expectedIndex()),'index.html BTF script block is stale — run node tools/sync-index.mjs');}
 // --- migration ---
 {const ctx=await loadBtf(root);const {RAState,RASaveFixtures}=ctx;
  assert.equal(RAState.version,12);
  const fresh=RAState.migrateRecord(RASaveFixtures.fixtures.fresh);assert.equal(fresh.life.clock.started,false,'fresh saves start before the prologue');
  const v11={...RASaveFixtures.fixtures.supraOwned,version:11};v11.life={...v11.life,property:{active:null,completed:[]},ownership:{...v11.life.ownership,properties:[{id:'property_la_4p_01',label:'PALOMA FOURPLEX',ownershipStatus:'owned',monthlyIncome:1400,purchasePrice:34000,nextCollectionAt:'2000-01-01T00:00:00.000Z'}]},world:{...v11.life.world,flags:{...v11.life.world.flags,propertyOwned:true,ogunsRaveCompleted:true}},night:{active:null,completed:[{id:'ogun_rave_001'}]}};
  const m=RAState.migrateWithReport(v11);assert(m.ok,'v11 migration failed');const L=m.state.life;
  assert.equal(L.clock.started,true,'progressed players skip the new prologue');
  assert(L.ownership.cars.length===1&&L.ownership.properties[0].weeklyRent===1400&&L.ownership.properties[0].rentDue===1400,'property rent must convert to the life clock without loss');
  assert(L.phone.apps.vampgram?.unlocked&&L.phone.apps.jdmImports?.unlocked,'apps must derive from existing progress');
  assert(L.adventures.records.ogun_rave_001?.status==='completed'&&L.adventures.records.property_la_4p_01_acquisition,'existing Rave/Property history must enter adventure records');
  assert.equal(m.state.characters.jdm_importer_daughter_001.conversionOutcome,'converted','legacy consequences preserved');
  const again=RAState.migrateWithReport(m.state);assert.equal(JSON.stringify(again.state),JSON.stringify(m.state),'v12 normalization must be idempotent');
  for(const [name,fx] of Object.entries(RASaveFixtures.fixtures)){if(typeof fx==='string')continue;const r=RAState.migrateWithReport(fx);assert(r.ok&&r.state.version===12&&Array.isArray(r.state.life.memoryLog),`fixture ${name} failed v12`);}
 }
 // --- calendar + clock ---
 {const ctx=await loadBtf(root);const {RALife,RAClock,RAState}=ctx;
  const d1=RALife.dayInfo(1),d31=RALife.dayInfo(31),d57=RALife.dayInfo(57),d14=RALife.dayInfo(14),d42=RALife.dayInfo(42);
  assert(d1.weekday==='THURSDAY'&&d1.dateLabel==='OCT 1','Day 1 = Thursday Oct 1');assert(d31.dateLabel==='OCT 31'&&d31.holiday==='halloween');assert(d57.dateLabel==='NOV 26'&&d57.weekday==='THURSDAY'&&d57.holiday==='thanksgiving');
  assert(d14.fullMoon&&d42.fullMoon&&d42.dateLabel==='NOV 11','full moons on day 14 of each 28-day month');
  const rains=Array.from({length:70},(_,i)=>RALife.dayInfo(i+1).rain).filter(Boolean).length;assert(rains>=5&&rains<=16,`~1 in 7 rain nights (${rains}/70)`);
  RAState.patch('life.ownership.properties',[{id:'p',ownershipStatus:'owned',weeklyRent:1000,rentDue:0}]);
  RAClock.wake({first:true});assert(RAState.get().life.clock.started);assert(RAState.get().life.phone.threads.family?.[0]?.text.includes('independence'),'Day 1 family ping');
  const money0=RALife.money();for(let i=0;i<28;i++)RAClock.sleep();
  assert.equal(RALife.today().day,29);assert.equal(RALife.money()-money0,100000,'budget lands on day 1 of the second month');
  assert.equal(RAState.get().life.ownership.properties[0].rentDue,4000,'four Shannon Fridays in 28 days');
  assert((RAState.get().life.temptations.live||[]).length<=8,'temptation cap');
 }
 // --- adventures: validate + walk every branch ---
 {const ctx=await loadBtf(root);const {RAAdventures}=ctx;const all=RAAdventures.all();assert(all.length>=1);
  const errors=all.flatMap(def=>RAAdventures.validate(def));assert.equal(errors.length,0,'adventure graph errors:\n'+errors.join('\n'));
  let walks=0;
  for(const def of all){
   const choiceNodes=Object.entries(def.nodes).filter(([,n])=>n.choices);const width=Math.max(1,...choiceNodes.map(([,n])=>typeof n.choices==='function'?3:n.choices.length));
   for(let k=0;k<width;k++){for(const outcome of ['win','lose']){const fresh=await loadBtf(root);const {RAState,RAClock,RALife}=fresh;RAClock.wake({first:true});
    RAState.patch('life.world.day',40);RAState.patch('life.resources.money',5e6);(def.testSetup||(()=>{}))(fresh);
    const available=fresh.RAAdventures.available(def.id);if(!available&&!def.testSetup)continue;
    const {res}=walk(fresh,def.id,{vars:def.testVars||{},pick:(list,step)=>(k+step)%list.length,fight:()=>({outcome}),minigame:()=>({outcome,score:outcome==='win'?9999:1,rewards:{}})});
    assert(res&&res.id===def.id,`${def.id} did not complete`);assert(!fresh.RAAdventures.active(),`${def.id} left an active record`);
    assert(RAState.get().life.memoryLog.length>0,`${def.id} wrote no memory`);walks++;}}
  }
  // Every node can be entered cold (dev/QA jumps, presentation sweeps) without throwing — FU-01 regression.
  {const cold=await loadBtf(root);const A=cold.RAAdventures,bad=[];
   for(const def of A.all())for(const id of Object.keys(def.nodes)){try{if(A.active())A.abandon();A.start(def.id,{from:'dev'});A.patchActive({node:id});const r=A.enter(id),C=A.context();
    for(const f of [r.node.lines,r.node.title])if(typeof f==='function')f(C);}catch(e){bad.push(`${def.id}:${id} ${e.message}`)}}
   assert.deepEqual(bad,[],'adventure nodes that crash when entered out of order');}
  console.log(`PASS btf (v12 migration + idempotency, calendar Oct 1/Oct 31/Nov 26/full moons/rain, clock budget+rent+family, ${all.length} adventures validated, ${walks} branch walks)`);
 }
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){await test(path.resolve(path.dirname(new URL(import.meta.url).pathname),'..'));}
