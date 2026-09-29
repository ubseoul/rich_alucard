// F02 — audio hooks (GN_01–GN_06 inert drop-ins), migration submission architecture (namespace only, no orphaned
// version claim), the F01_SHOWDOWN integration seam (data/contracts, no combat), the TRAP-facing weapon API and the
// authored firearm feedback hooks.
import assert from 'node:assert/strict';
import {game,ALL_F02,clearFlags,same} from './_lib.mjs';
import {sandbox,run,throwsCode} from '../if1/_lib.mjs';

export async function test(root){
 const c=await game(root);const R=c.RAIronAndGrace;
 await run(root,c,['js/data/audio/parts/F02_guns.js']);
 const M=c.RAAudioManifest,P=c.RAAudioParts;

 // ---- audio: GN_01–GN_06 are NEW, inert and drop-in ready (SOURCE_REQUIRED — not in RA_SFX_DELIVERY_v1) ----
 same(P.idsFor('F02'),['GN_01','GN_02','GN_03','GN_04','GN_05','GN_06']);
 for(const id of P.idsFor('F02')){const e=M.get(id);
  assert.equal(e.registered,false,`${id} is inert until Audio supplies the file`);
  assert.equal(e.file,null);assert.equal(e.expectedPath,`assets/audio/sfx/iron_and_grace/${id}.mp3`);
  assert.equal(e.licenseClass,'PENDING');assert.equal(e.reason,'inert-drop-in-hook');}
 assert.equal(M.get('GN_03').type,'loop','the flamethrower whoosh is a loop');
 assert.equal(JSON.stringify(M.get('GUN_LILOGA')),JSON.stringify(c.RAAudioManifest.get('GUN_LILOGA')),'existing F1 gun entries are unchanged');
 assert(throwsCode(()=>P.register('F02',{entries:[{id:'GUN_LILOGA',bus:'SFX',type:'one-shot',category:'x'}]}),/already exists/),'a part cannot redefine an accepted id');
 // every catalog gun with audio points at a real manifest id
 for(const [gunId,audioId] of Object.entries(c.RAIronCatalog.audioMap()))assert(M.has(audioId),`${gunId} → ${audioId} is missing from the manifest`);

 // ---- persistence + migration architecture ----
 // F02 declares its namespace (loaded before state.js) but claims NO schema version — the owner assigns one only if ever needed.
 assert.equal(c.RAMigrations.hasNamespace('F02'),true);
 assert(!c.RAMigrations.submissions().some(m=>m.fragment==='F02'),'F02 ships no orphaned migration submission');
 same(c.RAMigrations.validate(),[],'the production ledger stays consistent with F02 present');
 assert(!c.RAState.get().frag,'still lazy: merely loading F02 writes nothing');
 R.grant('mac_and_cheese',{free:true});assert(c.RAState.get().frag.F02,'first F02 write creates save.frag.F02');
 // the submission ARCHITECTURE works for F02's module shape (sandboxed; the owner assigns the number):
 {const s=sandbox();s.RAMigrationLedger=Object.freeze({base:16,assigned:Object.freeze({17:{id:'F02.example',fragment:'F02'}})});
  await run(root,s,['js/if1/migrations.js']);s.RAMigrations.namespace('F02',{equipped:null});
  s.RAMigrations.submit({id:'F02.example',fragment:'F02',note:'F02 shape',migrate:sv=>{sv.frag=sv.frag||{};sv.frag.F02={...sv.frag.F02,equipped:null};return sv;}});
  assert.equal(s.RAMigrations.target(),17);same(s.RAMigrations.validate(),[]);
  assert(throwsCode(()=>s.RAMigrations.submit({id:'F02.x',fragment:'F02',version:17,migrate:x=>x}),/may not claim a version/));
 }

 // ---- F01 SHOWDOWN seam: data and contracts only; NO substitute tactical combat ----
 const S=c.RAIronShowdown;
 assert.equal(S.pending,'F01_INTEGRATION_PENDING');assert.equal(S.frozen,false);
 assert.equal(S.stats('sapporo_shotgun').range,'close');assert.equal(S.stats('chopstick_sniper').range,'long');
 assert.equal(S.stats('rpg').area,'3x3');assert.equal(S.stats('auntie_slipper').knockback,true);
 assert.equal(S.classNote('mac_and_cheese'),'suppresses');
 assert(throwsCode(()=>S.resolveShot(),/F01_INTEGRATION_PENDING/),'no Showdown shot is simulated');
 assert(throwsCode(()=>S.simulate(),/F01_INTEGRATION_PENDING/),'no Showdown is simulated');
 // enemy guns are data for F01, not behaviour
 const enemies=S.enemies();same(enemies.map(e=>[e.enemy,e.gun]),
  [['open_mouth_gang_enforcer','sapporo_shotgun'],['hunter','silver_crossbow'],['gbenga','golden_draco']]);
 assert.equal(enemies.find(e=>e.gun==='silver_crossbow').sourceRequired,true,'the silver crossbow is a SOURCE_REQUIRED name, not an invented arsenal gun');

 // ---- TRAP-facing weapon API (F04/F05 bind later) ----
 const T=R.trap;
 assert.equal(T.assign('lookout_door','sapporo_shotgun').ok,true);
 assert.equal(T.owner('lookout_door'),'sapporo_shotgun');
 assert.equal(T.assign('lookout_bogus','no_such_gun').reason,'unknown-gun');
 same(T.holdTurns(),[1,2]);assert.match(T.pending,/F04\/F05/);
 assert.equal(T.list().find(x=>x.owner==='lookout_door').resolved.label,'SAPPORO SHOTGUN');
 T.clear('lookout_door');assert.equal(T.owner('lookout_door'),null);
 assert.equal(S.assign('hilt','chopstick_sniper').ok,true);assert.equal(S.carried('hilt'),'chopstick_sniper');

 // ---- authored firearm feedback / FX hooks (caller binding is an integration seam) ----
 const fb=R.feedback('sapporo_shotgun','fire');
 assert.equal(fb.audio,'GUN_SHOTGUN');assert.equal(fb.family,'heavy');assert.equal(fb.shake,true);assert.equal(fb.requiresCaller,true);
 assert.equal(R.feedback('auntie_slipper','fire').family,'soft');
 assert.equal(R.feedback('jollof_burner','fire').family,'fire');
 assert.equal(R.feedback('nope','fire'),null);

 clearFlags(c,ALL_F02);
 console.log('PASS F02 contracts (GN audio hooks inert, migration namespace clean, F01 seam data-only, TRAP API, FX hooks)');
}
