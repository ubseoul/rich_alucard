// IF-1 4B / §7 — migration registry + save invariants: historical saves load, migrations are additive and idempotent,
// the owner (not fragments) assigns version numbers, per-fragment namespaces are lazy and survive normalization.
import assert from 'node:assert/strict';
import {readdir} from 'node:fs/promises';
import path from 'node:path';
import {sandbox,run,read,throwsCode,same} from './_lib.mjs';

const PRE=['js/if1/migration_ledger.js','js/if1/migrations.js'];
const STATE=[...PRE,'js/engine/state.js','js/data/save_fixtures.js'];
// Every key path of `a` (objects only; arrays compared by presence) must still exist in `b`. `version` may change.
function missingPaths(a,b,prefix=''){
  const out=[];
  if(a===null||typeof a!=='object'||Array.isArray(a))return out;
  for(const key of Object.keys(a)){
    const here=prefix?`${prefix}.${key}`:key;if(here==='version')continue;
    if(b===null||typeof b!=='object'||!(key in b)){out.push(here);continue;}
    out.push(...missingPaths(a[key],b[key],here));
  }
  return out;
}
async function historical(root){
  const dir=path.join(root,'tools','tests','if1','fixtures','historical');
  const files=(await readdir(dir)).filter(f=>f.endsWith('.json')).sort();
  return Promise.all(files.map(async f=>({file:f,save:JSON.parse(await read(root,`tools/tests/if1/fixtures/historical/${f}`))})));
}
export async function test(root){
  const saves=await historical(root);
  assert(saves.length>=10,'historical fixtures v07–v16 must exist (run tools/tests/if1/make-historical-fixtures.mjs)');
  // ---- A. production ledger (F00 assigns none): every historical schema loads, additive, idempotent
  {const c=await run(root,sandbox(),STATE);const S=c.RAState;
   assert.equal(S.version,16,'F00 assigns no schema version — production stays at the accepted v16');
   same(c.RAMigrations.ledger().assigned,{},'F00 ledger is empty');same(c.RAMigrations.validate(),[]);
   for(const {file,save} of saves){
    const m=S.migrateWithReport(save);assert(m.ok,`${file}: did not load (${m.error})`);
    assert.equal(m.state.version,S.version,`${file}: not brought to current`);
    same(missingPaths(save,m.state),[],`${file}: accepted fields disappeared`);
    assert.equal(m.state.life.resources.money,save.life.resources.money,`${file}: money changed by migration`);
    assert.equal(m.state.life.world.flags.historicalMarker,save.life.world.flags.historicalMarker,`${file}: flag lost`);
    assert(m.state.life.ownership.cars.some(car=>car.id===save.life.ownership.cars[0].id),`${file}: car lost`);
    assert.equal(JSON.stringify(S.migrateWithReport(m.state).state),JSON.stringify(m.state),`${file}: migration is not idempotent`);
    assert(!('frag' in m.state),`${file}: IF-1 must not add a frag namespace to a save (lazy)`);
   }
   for(const [name,fx] of Object.entries(c.RASaveFixtures.fixtures)){if(typeof fx==='string')continue;const r=S.migrateWithReport(fx);assert(r.ok&&r.state.version===S.version,`legacy fixture ${name} must load`);}
   // unknown/foreign namespaces survive normalization + storage round trip byte-for-byte
   const withFrag=S.migrateRecord({...S.defaults,frag:{F91:{alpha:{beta:[1,2,3]},n:7}}});
   same(withFrag.frag,{F91:{alpha:{beta:[1,2,3]},n:7}},'frag namespace must survive normalization');
   const store=c.RASaveFixtures.memoryStorage();assert(S.write(store,withFrag));same(S.read(store).state.frag,withFrag.frag,'frag round trip');}
  // ---- B. synthetic owner-assigned ledger: fragments submit, the owner numbers them
  {const ctx=sandbox();
   ctx.RAMigrationLedger=Object.freeze({base:16,assigned:Object.freeze({17:{id:'F91.first',fragment:'F91'},18:{id:'F92.second',fragment:'F92'}})});
   await run(root,ctx,['js/if1/migrations.js']);const M=ctx.RAMigrations;
   // submitted in REVERSE load order — the ledger, not load order, decides the schema order
   M.submit({id:'F92.second',fragment:'F92',migrate:s=>{s.life.f92=Object.assign({},s.life.f92,{sawF91:!!s.life.f91});return s;}});
   M.submit({id:'F91.first',fragment:'F91',migrate:s=>{s.life.f91={ok:true};return s;}});
   M.namespace('F91',{alpha:{deep:1},keep:'default'});
   assert.equal(M.target(),18);same(M.validate(),[]);
   await run(root,ctx,['js/engine/state.js','js/data/save_fixtures.js']);const S=ctx.RAState;
   assert.equal(S.version,18,'state.js takes its target from the registry');
   for(const {file,save} of saves){
    const m=S.migrateWithReport(save);assert(m.ok&&m.state.version===18,`${file}: v${save.version}→v18 failed`);
    assert.equal(m.state.life.f91.ok,true);assert.equal(m.state.life.f92.sawF91,true,`${file}: ledger order violated (F92 must run after F91)`);
    same(missingPaths(save,m.state),[],`${file}: additive violation`);
    assert.equal(JSON.stringify(S.migrateWithReport(m.state).state),JSON.stringify(m.state),`${file}: not idempotent at v18`);}
   const v17=S.migrateWithReport({...saves.at(-1).save,version:17,life:{...saves.at(-1).save.life,f91:{ok:true}}});assert(v17.ok&&v17.state.version===18&&v17.state.life.f92,'a v17 save takes only the v17→v18 step');
   const future=S.migrateWithReport({...saves.at(-1).save,version:19});assert(!future.ok&&future.error==='future-version');
   // namespace defaults fill ADDITIVELY where the namespace exists, and never create one
   const has=S.migrateRecord({...S.defaults,frag:{F91:{alpha:{extra:2},keep:'mine'}}});
   same(has.frag.F91,{alpha:{extra:2,deep:1},keep:'mine'},'defaults fill missing keys only');
   assert(!('frag' in S.migrateRecord(S.defaults))||!('F91' in S.migrateRecord(S.defaults).frag),'a namespace is never auto-created by normalization');}
  // ---- C. ownership rules
  {const ctx=sandbox();ctx.RAMigrationLedger=Object.freeze({base:16,assigned:Object.freeze({})});await run(root,ctx,['js/if1/migrations.js']);const M=ctx.RAMigrations;
   assert(throwsCode(()=>M.submit({id:'F93.x',fragment:'F93',version:17,migrate:s=>s}),/may not claim a version/),'a fragment cannot claim a version');
   assert(throwsCode(()=>M.submit({id:'F93.y',fragment:'F93',to:17,migrate:s=>s}),/may not claim a version/));
   assert(throwsCode(()=>M.submit({id:'OTHER.x',fragment:'F93',migrate:s=>s}),/must start with F93\./));
   M.submit({id:'F93.ok',fragment:'F93',migrate:s=>s});assert(throwsCode(()=>M.submit({id:'F93.ok',fragment:'F93',migrate:s=>s}),/duplicate module/));
   assert(M.validate().some(p=>/F93\.ok has no version assigned/.test(p)),'a submission with no ledger number is reported (orphan)');
   assert.equal(M.target(),16,'orphans never change the schema');}
  {const ctx=sandbox();ctx.RAMigrationLedger=Object.freeze({base:16,assigned:Object.freeze({18:{id:'F94.a',fragment:'F94'}})});await run(root,ctx,['js/if1/migrations.js']);
   ctx.RAMigrations.submit({id:'F94.a',fragment:'F94',migrate:s=>s});assert(throwsCode(()=>ctx.RAMigrations.target(),/not contiguous/),'ledger gaps fail loudly');}
  {const ctx=sandbox();ctx.RAMigrationLedger=Object.freeze({base:16,assigned:Object.freeze({17:{id:'F95.missing',fragment:'F95'}})});await run(root,ctx,['js/if1/migrations.js']);assert(throwsCode(()=>ctx.RAMigrations.target(),/never submitted/),'a ledger entry without its module fails loudly');}
  console.log(`PASS IF-1 migrations (${saves.length} historical schemas v07–v16 load additively+idempotently, lazy frag namespaces, owner-assigned ordering, orphan/gap/claim rejection)`);
}
