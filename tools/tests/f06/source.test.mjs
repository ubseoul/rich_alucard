import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const hash=value=>createHash('sha256').update(value).digest('hex');
// Golden hashes verified against approved rewritten Rainmaker and F11 Git blobs.
const coreHashes=['72efb7796fd22c912a557b81b2b7977946507bf1f6ecc64f92825549f90244fa','2ec44b1b93bf98875ce447f2a2c33040f25f37427bd8c462bf8c405190fae30f'];
const audioHashes=['663132b86d515003854e4948ea243ca269c623164d0df1053c035d8784b8258e','3b94467ee997f9e6edc75e680eba25b8872e2a318c1d1f81cfbd03a2f3e6ff23','49700ef36e6ee9f88ccfe792d70fba2c0328da597cd1a5dffdbec79d2df96530','e605718ef6c0ec2f18bc6143174b399abcb79f54071e2b19f80576308fc75af0','5c79057633a4a9d7fc85af6a006ad2fce7b9b0b0ca39bebea5ba02b4a17f12ee','ccf5eefbfc3bedb8e388b519c378b841cedc9e9c40bcbb51a3399346da118a3c','f4ef564fdd3dadfdc17b193ec2289e17a8b8d55ab467381f53959f8484ac39fa','a775e652dfaf1275019f5960b11e07088143eb3db747364d4e3a90c9745b0fab'];
import {full,run} from '../if1/_lib.mjs';
export async function test(root) {
  let coreIndex=0;
  for(const name of ['make_it_rain_core.js','make_it_rain_tunables.js']) {
    const checkout=await readFile(path.join(root,'js/frag/F06',name),'utf8');
    assert.equal(hash(checkout.replace(/\r\n/g,'\n')),coreHashes[coreIndex++],'approved mechanics preserved (allow Git checkout CRLF conversion)');
  }
  const c=await full(root);
  await run(root,c,['js/data/audio/parts/F06_rainmaker.js']);
  for(let n=1;n<=8;n++) {
    const id=`RM_0${n}`,entry=c.RAAudioManifest.get(id);
    assert(entry?.registered,'known RM code must resolve');
    const file=await readFile(path.join(root,entry.file));
    assert.equal(hash(file),audioHashes[n-1],'consume F11 bytes without regenerating audio');
  }
  console.log('PASS F06 source fidelity: core/tunables byte-identical; RM_01–RM_08 registered, path-resolved and F11 byte-identical');
}
