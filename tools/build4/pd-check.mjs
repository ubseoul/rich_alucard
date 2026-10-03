import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {decodePng} from '../presentation/png.mjs';
import {supplemental} from './registry.mjs';
export async function test(root){
 const read=p=>readFile(path.join(root,p)),json=async p=>JSON.parse(await read(p));
 const manifest=await json('assets/build4/p_d/manifest.json'),inventory=await json('art_department/production/build4-p-d/INVENTORY.json');
 const register=Object.fromEntries((await json('art_department/ASSET_REGISTER.json')).assets.map(a=>[a.path,a]));
 assert.equal(manifest.files.length,48);assert.equal(manifest.p_c_included,false);
 const sha=b=>createHash('sha256').update(b).digest('hex');
 let cuts=0;
 for(const f of manifest.files){
  const b=await read(f.path),row=inventory.assets.find(a=>a.role==='native'&&a.prompt_number===f.number);
  assert.equal(sha(b),row.sha256,f.path);assert.equal(register[f.path].status,'FROZEN');
  const source=await read(f.source),sr=inventory.assets.find(a=>a.role==='lossless_source'&&a.prompt_number===f.number);assert.equal(sha(source),sr.sha256);
  if(f.cells){const original=decodePng(b),width=f.number===25?160:80,height=f.number===25?160:96;
   for(const [i,p] of Object.values(f.cells).entries()){const cell=decodePng(await read(p));assert.equal(cell.width,width);assert.equal(cell.height,height);
    for(let y=0;y<height;y++)assert.deepEqual(cell.data.subarray(y*width*4,(y+1)*width*4),original.data.subarray((y*original.width+i*width)*4,(y*original.width+(i+1)*width)*4),`${p}: lossless cell pixels`);cuts++;
   }
   if(f.standing_reference)assert.deepEqual(decodePng(await read(f.standing_reference)).data,decodePng(await read(f.cells.standing)).data,'frozen standing identity');
  }
 }
 assert.equal(cuts,33);
 const art=await supplemental();assert.equal(Object.keys(art.items.guns).length,8);assert.equal(Object.keys(art.play.ogas).length,6);assert.equal(Object.keys(art.play.tokens).length,3);
 const reuse=art.environments.gbenga_rentals.asset;
 assert.equal(sha(await read(reuse)),sha(await read('art_department/production/f07-warehouse-backgrounds/interiors/warehouse_workday_270x480.png')));
 assert.equal(art.characters.senator.stageScale,.5);
 assert(!(await read('js/data/art/parts/F12_preserved.js')).toString().includes('wardrobe'));
 const core=(await read('assets/f01/play/feel-frozen.mjs')).toString();assert(!core.includes('build4/p_d'),'original FL freeze table unchanged');
 const jollof=(await read('js/minigames/jollof.js')).toString(),judge=jollof.slice(jollof.lastIndexOf("else if(stage==='judging')")).split("else if(stage==='result')")[0];
 assert(judge.includes('rp.personSprite(id)')&&!judge.includes("'jollof_cook'"),'unnamed cook must not replace a named judge identity');
 console.log('PASS P-D: 96 approved hashes, 48 native contracts, 33 lossless state cells, frozen standing identities, additive guns/tokens/actors and exact WORKDAY reuse');
}
