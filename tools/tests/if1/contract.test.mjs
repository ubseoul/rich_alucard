// IF-1 v1.0 CONTRACT: the frozen public surface (tools/tests/if1/contract-v1.0.json) must exist. Removal fails; additions are
// fine (additive-only after freeze). Also: self-check, single-owner surface manifest, owner-surface classifier.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {full,load,same} from './_lib.mjs';

export async function test(root){
  const snapshot=JSON.parse(await readFile(path.join(root,'tools','tests','if1','contract-v1.0.json'),'utf8'));
  const ctx=await full(root);const live=ctx.RAIF1.describe();
  assert.equal(snapshot.contract,'IF-1');assert.equal(live.version,'1.0.0');
  let members=0;
  for(const [name,def] of Object.entries(snapshot.modules)){
    assert(live.modules[name]?.present,`IF-1 v1.0 module ${name} is missing`);
    for(const member of def.api){assert(live.modules[name].api.includes(member),`IF-1 v1.0 member ${name}.${member} was removed or renamed (frozen surface is additive-only)`);members++;}
  }
  for(const name of ctx.RAIF1.modules)assert(snapshot.modules[name],`module ${name} is not in the frozen snapshot — run tools/tests/if1/make-contract.mjs (owner only)`);
  assert.equal(live.freeze.status==='candidate'||live.freeze.status==='frozen',true);
  const check=ctx.RAIF1.selfCheck();assert(check.ok,`RAIF1.selfCheck: ${check.problems.join('; ')}`);
  // ---- single-owner surfaces
  const S=await load(root,'tools/check-owner-surfaces.mjs');const surfaces=await S.loadSurfaces();
  for(const pattern of surfaces.ownerOnly.filter(p=>!p.includes('*')))assert(existsSync(path.join(root,pattern)),`owner-only file ${pattern} does not exist`);
  same(S.classify(surfaces,['js/if1/features.js','index.html','js/frag/F01/a.js','tools/tests/f01/a.test.mjs']).map(v=>v.file),['js/if1/features.js','index.html'],'a fragment may not touch IF-1 or the loader');
  same(S.classify(surfaces,['js/frag/F01/a.js','js/data/art/parts/F01_x.js','js/data/audio/parts/F01_y.js','tools/tests/f01/a.test.mjs','docs/engineering/F01_NOTES.md','js/frag/F02/a.js','js/systems/life.js'],{fragment:'F01'}).map(v=>v.file),['js/frag/F02/a.js','js/systems/life.js'],'a fragment stays inside its own surface');
  same(S.classify(surfaces,['js/if1/features.js','index.html'],{asOwner:true}),[],'the integration owner may change owner surfaces');
  console.log(`PASS IF-1 v1.0 contract (${Object.keys(snapshot.modules).length} modules, ${members} frozen members present, self-check, single-owner surface rules)`);
}
