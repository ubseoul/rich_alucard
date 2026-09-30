import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {full,run} from '../if1/_lib.mjs';
export async function test(root) {
  const source='fd7b5f5ca9bb8baad93a3d0a6bee492d41a79397';
  for(const name of ['make_it_rain_core.js','make_it_rain_tunables.js']) {
    const approved=execFileSync('git',['show',`${source}:js/systems/rainmaker/${name}`],{cwd:root});
    assert.deepEqual(await readFile(path.join(root,'js/frag/F06',name)),approved,'approved mechanics preserved byte-for-byte');
  }
  const c=await full(root);
  await run(root,c,['js/data/audio/parts/F06_rainmaker.js']);
  const audio='9eb87323caa88252a98b931879d0712d4e235304';
  for(let n=1;n<=8;n++) {
    const id=`RM_0${n}`,entry=c.RAAudioManifest.get(id);
    assert(entry?.registered,'known RM code must resolve');
    const file=await readFile(path.join(root,entry.file));
    const approved=execFileSync('git',['show',`${audio}:assets/audio/sfx/rainmaker/${id}.mp3`],{cwd:root});
    assert.deepEqual(file,approved,'consume F11 bytes without regenerating audio');
  }
  console.log('PASS F06 source fidelity: core/tunables byte-identical; RM_01–RM_08 registered, path-resolved and F11 byte-identical');
}
