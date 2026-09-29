#!/usr/bin/env node
// Regenerates tools/tests/if1/fixtures/historical/vNN.json from the REAL state.js of each historical schema version
// (read from git history), so the fixtures are genuine old-format saves, not reconstructions.
//   node tools/tests/if1/make-historical-fixtures.mjs
// Each fixture = that version's own default record with a small, recognisable progress marker layered on top
// (money, day, a flag, a car) so "no accepted field disappears" can be asserted after migration. Commit the output.
import {execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','..','..');
// schema version -> commit whose js/engine/state.js declares it (first commit that did)
const COMMITS={7:'26a3bc0',8:'ac29e87',9:'8e4229e',10:'2fce1de',11:'f2ca7d4',12:'f9a696c',13:'17f10a0',14:'5b42ecb',15:'c449aa3',16:'54930b2'};
const out=path.join(fileURLToPath(new URL('.',import.meta.url)),'fixtures','historical');
mkdirSync(out,{recursive:true});
for(const [version,commit] of Object.entries(COMMITS)){
  const source=execFileSync('git',['show',`${commit}:js/engine/state.js`],{cwd:root,encoding:'utf8',maxBuffer:1<<26});
  const store=new Map();const ctx={console,setTimeout,clearTimeout,localStorage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)},document:{addEventListener(){}}};ctx.window=ctx;vm.createContext(ctx);
  vm.runInContext(source,ctx,{filename:`state.js@${commit}`});
  const save=JSON.parse(JSON.stringify(ctx.RAState.defaults||ctx.RAState.get()));
  if(save.version!==Number(version))throw new Error(`commit ${commit} produced v${save.version}, expected v${version}`);
  save.life.resources.money=12345+Number(version);save.life.world.day=9;save.life.world.flags={...(save.life.world.flags||{}),historicalMarker:`v${version}`};
  save.life.ownership.cars=[{id:`marker_car_v${version}`,make:'TEST',model:`V${version}`,ownershipStatus:'owned'}];
  writeFileSync(path.join(out,`v${String(version).padStart(2,'0')}.json`),`${JSON.stringify(save,null,1)}\n`);
  console.log(`wrote v${version} from ${commit}`);
}
