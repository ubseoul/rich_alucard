import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
import {game,ALL_F02} from '../f02/_lib.mjs';
import {run,same} from '../if1/_lib.mjs';
import {CORE,scenario,oga,must} from '../f01/_lib.mjs';
export async function test(root){
 const c=await game(root);await run(root,c,[...CORE,'js/frag/F01/play_contract.js','js/frag/F02/integration.js']);
 const R=c.RAIronAndGrace,P=c.RAShowdownPackets;
 const before=JSON.stringify(c.RAState.get());
 assert.equal(R.playSnapshot([{id:'dre'}]),null);
 assert.equal(P.bindF02().bound,false);
 assert.equal(JSON.stringify(c.RAState.get()),before,'OFF read-only snapshots cannot write a save');
 for(const id of ALL_F02)c.RAFeatures.set(id,true);
 R.grant('mac_and_cheese',{free:true});c.RAIronShowdown.assign('dre','mac_and_cheese');
 R.buyMod('scope',{free:true});R.attachMod('mac_and_cheese','scope');
 const snap=R.playSnapshot([{id:'dre'}]);assert.equal(snap.loadout.dre,'mac_and_cheese');
 assert.equal(snap.weapons.mac_and_cheese.stats.damage,'2x3');
 P.bindF02();const packet=P.entry('TRAP_RAID',{squad:[{id:'dre',class:'TALKER'}]});
 assert.equal(packet.config.squad[0].weapon,'mac_and_cheese');
 assert.equal(packet.config.weapons.mac_and_cheese.hits,3);
 assert.equal(packet.config.weapons.tommy_tony.hits,4);
 assert.equal(packet.config.weapons.legendary_draco.bursts,2);
 assert.equal(packet.config.weapons.blueberry_blaster.condition,'mazdaMajestic');
 assert.equal(packet.config.weapons.sapporo_shotgun.hits,2);
 const tactical=scenario(c,{squad:[oga('shot','SHOOTER',{x:2,y:5,weapon:'sapporo_shotgun'})],enemies:[{id:'one',type:'ENFORCER',x:2,y:4},{id:'two',type:'ENFORCER',x:3,y:4}],extra:{weapons:packet.config.weapons}});
 const target=c.RAShowdownEngine.liveEnemies(tactical)[0].id;
 const volley=must(c,tactical,{type:'SHOOT',unit:'shot',target}).events.filter(e=>e.t==='SHOT');
 assert.equal(volley.length,2);assert.equal(new Set(volley.map(e=>e.to)).size,2,'Sapporo targets two distinct eligible enemies');
 R.trap.assign('trap:dre','mac_and_cheese');assert.equal(R.playSnapshot([{id:'dre'}],{trap:true}).loadout.dre,'mac_and_cheese');
 globalThis.RAShowdownRng=c.RAShowdownRng;globalThis.RAShowdownData=c.RAShowdownData;globalThis.RAPlayContract=c.RAPlayContract;
 const imp=f=>import(pathToFileURL(path.join(root,f)).href);
 const AD=await imp('js/frag/F01/play/adapter.mjs');
 const E=await imp('js/frag/F01/play/engine.mjs');
 const {weapon}=await imp('js/frag/F01/play/guns.mjs');
 const {makeDriver}=await imp('tools/tests/f01/play-sim/driver.mjs');
 const req={schema:'F04.play_request',version:1,requestId:'build2:gun',seed:42,day:8,
  job:{f01JobId:'car_wash_stickup'},roster:[{id:'dre',name:'DRE',cls:'TALKER',status:'ACTIVE'},{id:'tunde',name:'TUNDE',cls:'MUSCLE',status:'ACTIVE'},{id:'sunday_best',name:'SUNDAY BEST',cls:'SHOOTER',status:'ACTIVE'}],
  garage:{owned:['SUPRA']},bank:50000,heat:0,iron:JSON.parse(JSON.stringify(snap))};
 const w=AD.prepareWorld(req);assert.equal(w.roster[0].gun,'mac_and_cheese');
 same(weapon({iron:snap},'mac_and_cheese').dmg,[2,2]);assert.equal(weapon({iron:snap},'mac_and_cheese').hits,3);
 const drv=makeDriver('careful');const driver=pr=>{const a=drv(pr);if(pr.type==='CAR')a.guns.dre='mac_and_cheese';return a;};
 const a=AD.runHeadless(req,driver),b=AD.runHeadless(req,driver);
 assert.deepEqual(a.result,b.result,'real PLAY repeat uses the identical F02 snapshot');
 assert(a.result.iron,'result returns the ownership seam');
 R.consumePlay({iron:{loadout:{dre:'mac_and_cheese'}},guns:{lost:[{from:'dre',gun:'mac_and_cheese'}],gifts:[]}});
 assert(!R.owns('mac_and_cheese'));assert.equal(R.trap.owner('oga:dre'),null);assert.equal(R.trap.owner('trap:dre'),null);
 for(const id of ALL_F02)c.RAFeatures.set(id,false);
 assert.equal(R.playSnapshot(req.roster),null);assert.equal(P.bindF02().bound,false);
 // Never modify the authored catalog/tunables while wiring it.
 const original=execFileSync('git',['-c','gc.auto=0','show','941af1d:js/frag/F02/catalog.js'],{cwd:root});
 assert.equal((await readFile(path.join(root,'js/frag/F02/catalog.js'))).toString().replace(/\r\n/g,'\n'),original.toString().replace(/\r\n/g,'\n'));
 console.log('PASS BUILD2 guns: dark snapshots, ownership/loss, F04 iframe PLAY, F05 loadout, authored multi-hit/two-taps/condition/mods, deterministic replay, catalog unchanged');
}
