// FCPB convergence — integration-owner repairs on the composed F01 + F04 + F05 + F06 tree: one HEAT owner, one F05 flag identity,
// F04 orphan migration gone, Rainmaker unlocked by the first completed event (once, persisted), phone registry, wake-bus collisions,
// F11 audio, sandbox-only F01 keys, F07 parked. (The HOLD host bridge has its own suite: hold_bridge.test.mjs.)
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import {full,run,read} from './_lib.mjs';
import {F01_FILES,F04_FILES,F03_PROVIDER} from '../F04/_lib.mjs';

const J=v=>JSON.parse(JSON.stringify(v));
const eq=(a,b,m)=>assert.deepEqual(J(a),J(b),m);   // vm objects are cross-realm: compare canonical JSON
const frag=async(root,id)=>JSON.parse(await read(root,`js/frag/${id}/manifest.json`)).files;

// The composed game: production load order for F01, F04, F05, F06 (+ IF-1 owner modules), every flag OFF until the caller sets them.
async function boot(root,{seedState=null,f03=true}={}){
 const ctx=await full(root,seedState?{seedState}:{});
 await run(root,ctx,[...F01_FILES]);
 if(f03)vm.runInContext(F03_PROVIDER,ctx,{filename:'F03-provider-fixture'});   // F03 is not composed in production; the fixture is its documented provider contract
 await run(root,ctx,[...F04_FILES]);
 await run(root,ctx,['js/frag/F05/migrations.js',...await frag(root,'F05')]);
 await run(root,ctx,['js/frag/F06/migrations.js',...await frag(root,'F06')]);
 await run(root,ctx,['js/if1/hold_bridge.js']);
 return ctx;
}
const on=(c,...ids)=>{for(const id of ids)c.RAFeatures.set(id,true);};
async function reload(root,ctx){
 const store=ctx.RASaveFixtures.memoryStorage();ctx.RAState.write(store,ctx.RAState.get());
 const raw=Object.values(store.dump())[0];
 return boot(root,{seedState:typeof raw==='string'?JSON.parse(raw):raw});
}
const mails=(c,id)=>(c.RALife.life().clock.mail||[]).filter(m=>m.id===id).length;

export async function test(root){
 // ============================================================================================ 1. everything dark: nothing changes
 {
  const c=await boot(root);
  assert.equal(c.RAIF1.selfCheck().ok,true,c.RAIF1.selfCheck().problems.join('; '));
  eq(c.RAMigrations.validate(),[],'migration ledger validates clean: no orphan submission');
  eq(c.RAMigrations.submissions(),[],'F04 / F05 / F06 submit no unassigned migration module');
  assert.equal(c.RAHeat.tiers().provisional,true,'flags OFF: HEAT keeps its shipped provisional floors');
  assert.equal(c.RAHeat.describe().floors.WARM,6);assert.equal(c.RAHeatFloors.applied(),false);
  for(const id of ['warRoom','trap','rainmaker'])assert.equal(c.RAPhoneApps.get(id),null,`${id} is dark while its flag is OFF`);
  assert.equal(c.RAFrag.has('F04')||c.RAFrag.has('F05')||c.RAFrag.has('F06')||c.RAFrag.has('if1'),false,'no namespace is created while everything is dark');
  assert.equal(c.RAState.version,16,'schema stays v16');
  console.log('PASS convergence dark: selfCheck + migrations clean, HEAT provisional, no apps, no namespaces, schema v16');
 }

 // ============================================================================================ 2. F04 orphan migration removed (no invented version)
 {
  const src=await read(root,'js/frag/F04/migrations.js');
  assert.equal(/RAMigrations\.submit\s*\(/.test(src),false,'F04 no longer submits F04.init-war-room');
  const ledger=await read(root,'js/if1/migration_ledger.js');assert.equal(/\n\s*\d+:\{/.test(ledger),false,'no schema version was assigned or invented');
  const c=await boot(root);c.RAFrag.patch('F04','active',true);
  assert.equal(c.RAFrag.read('F04','jobs.slotsPerNight'),1,'lazy defaults cover everything the removed body stamped');
  console.log('PASS convergence F04 migration: orphan submission removed, lazy namespace defaults intact, ledger untouched');
 }

 // ============================================================================================ 3. HEAT: one owner, one number set, no last-writer-wins
 {
  const floors={COOL:0,WARM:30,HOT:60,'ON FIRE':85};
  for(const [label,flags] of [['F04 only',['F04.war_room']],['F05 only',['F05.trap']],['both',['F04.war_room','F05.trap']]]){
   const c=await boot(root);on(c,...flags);
   eq(c.RAHeat.describe().floors,floors,`${label}: authored floors`);assert.equal(c.RAHeat.describe().provisional,false);assert.equal(c.RAHeatFloors.applied(),true);
  }
  for(const f of ['js/frag/F04/heat_config.js','js/frag/F05/heat.js']){const src=await read(root,f);assert.equal(/RAHeat\.configure|H\.configure/.test(src.replace(/\/\/.*$/gm,'')),false,`${f} no longer configures HEAT`);}
  const owner=await read(root,'js/if1/heat_floors.js');assert.ok(/COOL:0,WARM:30,HOT:60,'ON FIRE':85/.test(owner),'the single owner holds 0/30/60/85');
  // a stray caller cannot win: a later configure() by anyone is overwritten by the next ensure(), which is the same numbers
  const c=await boot(root);on(c,'F05.trap');c.RAHeat.configure({floors:{COOL:0,WARM:1,HOT:2,'ON FIRE':3}});c.RAHeatFloors.apply();eq(c.RAHeat.describe().floors,floors);
  console.log('PASS convergence HEAT: RAHeatFloors is the single owner (0/30/60/85); F04 and F05 delegate; identical for every flag combination');
 }

 // ============================================================================================ 4. flag identities
 {
  const c=await boot(root);
  assert.equal(c.RAFeatures.get('F05.the_trap'),null,'F05.the_trap is retired');assert.ok(c.RAFeatures.get('F05.trap'));
  on(c,'F05.trap');assert.equal(c.RAF05.on(),true);assert.equal(c.RATrap.reservedFlag,c.RATrap.flag,'one identity');
  assert.ok(c.RAFeatures.get('F01.showdown_core'),'the live F01 flag');assert.ok(c.RAFeatures.get('F01.showdown'),'the frozen IF-1 reserved F01 flag still exists (contract)');
  assert.equal(c.RAFeatures.enabled('F01.showdown'),false);
  // the reserved F01.showdown gates NOTHING: turning it ON does not enable F01, and the live flag alone does
  c.RAFeatures.set('F01.showdown',true);assert.equal(c.RAShowdown.enabled(),false,'F01.showdown does not drive F01');c.RAFeatures.set('F01.showdown',false);
  on(c,'F01.showdown_core');assert.equal(c.RAShowdown.enabled(),true,'F01.showdown_core is the live flag');
  // no code consumes the reserved names (only the frozen registry lists them)
  const hits=[];for(const dir of ['js/frag','js/if1','js/systems','js/scenes','assets/f01'])for(const f of await walk(path.join(root,dir))){const t=(await readFile(f,'utf8')).replace(/^\s*\/\/.*$/gm,'').replace(/\/\/ .*$/gm,'');if(/['"`]F01\.showdown['"`]/.test(t)||/F05\.the_trap/.test(t))hits.push(path.relative(root,f));}
  assert.deepEqual(hits.filter(h=>h!=='js/if1/features.js'),[],'no live code names F01.showdown or F05.the_trap');
  // the stale F14 tactical routes are gone
  const expected=JSON.parse(await read(root,'tools/f14/routes/_expected.json')).routes.map(r=>r.id);
  for(const id of ['F01.showdown.success','F01.showdown.failure','F01.showdown.retreat'])assert.equal(expected.includes(id),false,`${id} retired`);
  assert.ok(expected.includes('F01.play.hold'));
  console.log('PASS convergence flags: F05.trap is the one F05 identity; F01.showdown_core is live, F01.showdown inert/reserved; stale F14 tactical routes retired');
 }

 // ============================================================================================ 5. wake bus: only real collisions
 {
  const c=await boot(root);on(c,'F01.showdown_core','F04.war_room','F05.trap','F06.rainmaker');
  const info=c.RAClock.handlerInfo();const byP=new Map();for(const h of info)byP.set(h.priority,[...(byP.get(h.priority)||[]),h.id]);
  const ties=[...byP].filter(([,ids])=>ids.length>1).map(([p,ids])=>`${p}:${ids.sort().join('+')}`).sort();
  // 45 and 55 are pre-IF-1 accepted handlers (raw onWake; stable sort keeps their load order): historical, not fragment collisions
  assert.deepEqual(ties,['45:music-drops+onlyvamps-renew','55:a29-tells+family-thread'],'no fragment wake/night priority collides');
  eq(c.RAWakeBus.order('night').filter(id=>!['night-report'].includes(id)),['f05.heat-decay','f05.sales-resolve','f05.raid-schedule','fame-night'],'NIGHT order: no -20 collision exists on the composed branch');
  assert.equal(byP.get(-20).length,1);
  console.log('PASS convergence wake bus: NIGHT priorities unique (-35 heat-decay, -30 sales, -20 raid-schedule, -10 fame); only the two historical accepted ties remain');
 }

 // ============================================================================================ 6. phone registry
 {
  const cars=await read(root,'js/systems/cars.js');
  assert.equal((cars.match(/register\(\{id:'cars'/g)||[]).length,1,'the cars app is registered once (was twice)');
  const hier=await read(root,'js/data/phone_hierarchy.js');assert.ok(/onlyvamps:'social'/.test(hier)&&/onlyvamps:\{short:'INVITE ONLY'/.test(hier),'ONLYVAMPS placement + lock override preserved (intentional accepted UL-L2-001 hierarchy)');
  const phone=await read(root,'js/scenes/phone.js');assert.ok(/\['RealMoneyRealEstate','realEstate'\]/.test(phone),'realEstate is the canonical page id; the lowercase realestate is the separate hidden action-routing app');
  const c=await boot(root);on(c,'F04.war_room','F05.trap','F06.rainmaker');
  for(const id of ['warRoom','trap','rainmaker'])assert.ok(c.RAPhoneApps.get(id),`${id} registers once its flag is ON`);
  assert.equal(c.RAPhoneRegistry.reserved().find(r=>r.id==='armory').declared,false,'the ARMORY slot (F02, not in this composition) stays reserved and dark');
  eq(c.RAPhoneRegistry.declaredApps().map(a=>a.id).sort(),['rainmaker','trap','warRoom']);
  console.log('PASS convergence phone: cars single registration; onlyvamps + realEstate/realestate preserved; reserved slots dark; F04/F05/F06 apps register only with their flags');
 }

 // ============================================================================================ 7. RAINMAKER: unlocked by the first completed event, once, persisted
 {
  const done=id=>({...J(id)});
  // 7a. flag ON alone unlocks nothing, whatever else is true (no day / money / fame gate exists)
  let c=await boot(root);on(c,'F06.rainmaker');
  c.RAState.patch('life.resources.money',1e9);c.RAState.patch('life.world.day',400);c.RAState.patch('life.resources.followers',1e7);
  c.RAFirstEventUnlock.check();document(c);
  assert.equal(c.RALife.appUnlocked('rainmaker'),false,'the flag alone does not unlock');   // (the headless phone is a stub; the real phone's dark-until-unlocked rule is asserted in the browser suite)
  assert.equal(c.RAFirstEventUnlock.firstEventCompleted(),false);
  // a pending / delivered / seen event is not a COMPLETED event
  c.RAState.patch('life.events.records.ogun_rave_invite_001',{status:'delivered',deliveries:1});assert.equal(c.RAFirstEventUnlock.firstEventCompleted(),false);
  c.RAWorldEvents.see('ogun_rave_invite_001');c.RAFirstEventUnlock.check();assert.equal(c.RALife.appUnlocked('rainmaker'),false,'seen is not completed');
  // 7b. the first completed event (RAWorldEvents.resolve) unlocks it, immediately, exactly once
  c.RAWorldEvents.resolve('ogun_rave_invite_001','in');
  assert.equal(c.RALife.appUnlocked('rainmaker'),true,'the first completed event unlocks RAINMAKER')
  assert.equal(mails(c,'app:rainmaker'),1,'one NEW APP notice');
  const stamp=J(c.RALife.life().phone.apps.rainmaker);
  c.RAWorldEvents.resolve('property_pb01_001','ok');c.RAFirstEventUnlock.check();c.RAFirstEventUnlock.check();
  assert.equal(mails(c,'app:rainmaker'),1,'a second completed event does not fire it again');eq(c.RALife.life().phone.apps.rainmaker,stamp,'the unlock record is untouched');
  // 7c. persistent + reload-safe (and never re-fires); resetting the event does not relock
  c=await reload(root,c);on(c,'F06.rainmaker');c.RAFirstEventUnlock.check();
  assert.equal(c.RALife.appUnlocked('rainmaker'),true,'reload-safe');assert.equal(mails(c,'app:rainmaker'),1,'no second notice after reload');
  c.RAWorldEvents.reset('ogun_rave_invite_001');c.RAFirstEventUnlock.check();assert.equal(c.RALife.appUnlocked('rainmaker'),true,'a persisted unlock is not revoked');
  // 7d. event completed while the flag is dark: the unlock is granted when the flag turns ON (never before)
  c=await boot(root);c.RAWorldEvents.resolve('property_pb01_001','ok');
  assert.equal(c.RALife.appUnlocked('rainmaker'),false,'flag OFF: nothing unlocks');assert.equal(c.RAPhoneRegistry.unlock('rainmaker'),false,'the canonical service itself refuses while the flag is OFF');
  on(c,'F06.rainmaker');assert.equal(c.RALife.appUnlocked('rainmaker'),true,'flag turned ON after a completed event: unlocked once');assert.equal(mails(c,'app:rainmaker'),1);
  // 7e. a crash between the event save and the unlock is repaired by the next scene change / load
  c=await boot(root);on(c,'F06.rainmaker');
  c.RAState.patch('life.events.records.property_pb01_001',{status:'resolved',resolvedAt:'x'});             // saved, unlock never ran
  assert.equal(c.RALife.appUnlocked('rainmaker'),false);
  c.document.dispatchEvent(new c.CustomEvent('ra:scene',{detail:{id:'bedroom'}}));
  assert.equal(c.RALife.appUnlocked('rainmaker'),true,'the next scene change repairs it');assert.equal(mails(c,'app:rainmaker'),1);
  // 7f. tests may still unlock it as a fixture; Rainmaker gameplay is untouched (F06 suite covers it)
  c=await boot(root);on(c,'F06.rainmaker');assert.equal(c.RAPhoneRegistry.unlock('rainmaker'),true,'fixture unlock through the canonical service');
  console.log('PASS convergence RAINMAKER unlock: dark until the first RAWorldEvents-resolved event; once; persisted; reload-safe; flag alone/other conditions never unlock');
 }

 // ============================================================================================ 8. F11 audio / F05 + F06 audio wiring
 {
  const c=await full(root);
  for(const f of (await readdir(path.join(root,'js/data/audio/parts'))).filter(f=>f.endsWith('.js')).sort())await run(root,c,[`js/data/audio/parts/${f}`]);
  eq(c.RAAudioParts.fragments().sort(),['F05','F06'],'F01 registers no audio (its inert BX duplicates are gone); F05 + F06 register');
  const rm=c.RAAudioParts.idsFor('F06');eq(rm,['RM_01','RM_02','RM_03','RM_04','RM_05','RM_06','RM_07','RM_08'],'F06 audio wired exactly from the accepted e3c4d3b part');
  for(const id of rm)assert.ok(c.RAAudioManifest.get(id),`${id} resolves`);
  // forward composition with F11's canonical master: the six BX ids the F01 duplicate used to hold register cleanly
  const master=['BX_SLIDEIN_IDLE','BX_NAMECARD_SLAM','BX_POD_REVEAL','BX_OVERWATCH','BX_COVER_HIT','BX_DOWNED'].map(id=>({id,bus:'SFX',type:'one-shot',category:'showdown'}));
  assert.doesNotThrow(()=>c.RAAudioParts.register('F04',{entries:master}),'the F11 master family registers without a duplicate-id collision');
  assert.equal(c.RAAudioManifest.get('BX_STEP'),null,'BX_STEP stays unregistered: SOURCE_REQUIRED, inert, nothing fabricated');
  // F05 TR_01 / TR_05: preserved as accepted (both AMBIENCE loops on the_trap scene); remaining ownership question recorded, not decided here
  for(const id of ['TR_01','TR_05'])assert.equal(c.RAAudioManifest.get(id).bus,'AMBIENCE');
  console.log('PASS convergence audio: F01 duplicate BX hooks removed, F11 master registers clean, F06 RM_01-08 wired, BX_STEP inert, TR_01/TR_05 unchanged');
 }

 // ============================================================================================ 8b. F04 Koreatown shadow (OL-027 B)
 {
  // Koreatown is F03-owned. On the composed tree (F03 not composed) NOTHING may define it: no F04 shadow, no F05/F06/IF-1/bridge definition.
  const defs=[];for(const dir of ['js/frag','js/if1','js/systems','js/scenes','js/data'])for(const f of await walk(path.join(root,dir))){
   const src=(await readFile(f,'utf8')).replace(/^\s*\/\/.*$/gm,'');
   if(/RADistricts\??\.define\([^)]*koreatown/i.test(src)||/define\(\{[^}]*id:\s*['"]koreatown['"]/i.test(src))defs.push(path.relative(root,f));
  }
  eq(defs,[],'no shipped code defines koreatown');
  const c=await boot(root,{f03:false});on(c,'F04.war_room');
  assert.equal(c.RADistricts.get('koreatown'),null,'no Koreatown shadow exists without its F03 owner');
  eq(c.RAWarRoomDistricts.provider().missing.map(m=>m.id),['koreatown'],'reported PROVIDER_MISSING, not invented');
  eq(c.RAWarRoomDistricts.activeIds(),['arts_district','inglewood'],'the War Room skips what nobody owns');
  eq(c.RAWarRoomDistricts.provider().errors,[],'no district define error');
  console.log('PASS convergence Koreatown: F03-owned, never shadowed by F04 or anyone; absent owner reports PROVIDER_MISSING and is skipped');
 }

 // ============================================================================================ 9. F07 parked; sealed/private material not introduced
 {
  const frags=(await readdir(path.join(root,'js/frag'))).filter(f=>/^F\d\d$/.test(f)).sort();
  assert.deepEqual(frags,['F01','F04','F05','F06'],'F07 (and F02/F03) playable content is not in this convergence');
  console.log('PASS convergence F07 parked: no F07 playable content composed');
 }
}
// jsdom-free helper: give the vm context the ra:scene / DOMContentLoaded no-ops the modules listen for
function document(c){try{c.document.dispatchEvent(new c.CustomEvent('ra:scene',{detail:{id:'bedroom'}}));}catch(e){}}
async function walk(dir){
 const out=[];let entries;try{entries=await readdir(dir,{withFileTypes:true});}catch(e){return out;}
 for(const e of entries){const p=path.join(dir,e.name);if(e.isDirectory())out.push(...await walk(p));else if(/\.(js|mjs|html)$/.test(e.name))out.push(p);}
 return out;
}
