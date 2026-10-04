// OL-067: the three frozen F15 stage cards are exact-byte runtime copies, registered, and used by the three-dancer lineup.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';

const sha=b=>createHash('sha256').update(b).digest('hex');
export async function test(root){
 const rd=f=>readFile(path.join(root,f)),json=async f=>JSON.parse(await rd(f));
 const PKG='art_department/production/f15-dancer-stage-cards';
 const freeze=await json(`${PKG}/FREEZE_RECORD.json`),man=await json('assets/f15/stagecards/manifest.json'),reg=(await json('art_department/ASSET_REGISTER.json')).assets;
 const presentation=await readFile(path.join(root,'js/data/presentation_assets.js'),'utf8'),part=await readFile(path.join(root,'js/data/art/parts/F15_stage_cards.js'),'utf8'),club=await readFile(path.join(root,'js/frag/F15/club.js'),'utf8');
 for(const dancer of ['roxy','rosalyn','emerald']){
  const f=`stagecard_${dancer}.png`,rt=`assets/f15/stagecards/${f}`,src=`${PKG}/${f}`,want=freeze.assets.find(a=>a.path===src);
  assert.ok(want,`${f} is in the freeze record`);
  const a=await rd(rt),b=await rd(src);
  assert.ok(a.equals(b),`${rt} is byte-identical to the frozen production file`);
  assert.equal(sha(a),want.sha256,`${f} sha256 equals the freeze record`);assert.equal(a.length,want.bytes,`${f} size`);
  assert.deepEqual([a.readUInt32BE(16),a.readUInt32BE(20)],[945,1680],`${f} dimensions`);
  assert.equal(man.files.find(x=>x.path===rt)?.sha256,want.sha256,`${rt} manifest hash`);
  const r=reg.find(x=>x.path===rt);assert.ok(r&&r.status==='FROZEN'&&r.sha256===want.sha256,`${rt} is FROZEN in ASSET_REGISTER.json`);
  assert.ok(presentation.includes(`"${rt}":{"width":945,"height":1680,"sha256":"${want.sha256}","authority":"FROZEN"`),`${rt} is in presentation_assets`);
  assert.ok(part.includes(`"${dancer}": {"asset": "${rt}"`),`${dancer} is in the art registry part`);
 }
 assert.ok(club.includes('ui?.f15?.stagecards'),'the F15 chips read the stage cards from the art registry');
 console.log('PASS F15 stage cards (3 exact-byte frozen copies re-hashed vs FREEZE_RECORD, registered FROZEN, in presentation_assets + art registry, shown on the dancer chips)');
}
