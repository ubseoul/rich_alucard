// F14-A harness self-test — authored audio availability (registered vs declared-pending).
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {checkAudio,entryFiles} from '../../f14/audio.mjs';
import {tmpDir,rm} from './_lib.mjs';

const MANIFEST=`(function(){window.RAAudioManifest={list:()=>[
 {id:'GOOD',registered:true,file:'assets/audio/GOOD.mp3',parts:[],variations:[]},
 {id:'MISSING',registered:true,file:'assets/audio/MISSING.mp3',parts:[],variations:[]},
 {id:'HOOK',registered:false,reason:'inert-drop-in-hook',expectedPath:'assets/audio/HOOK.mp3'},
 {id:'GAP',registered:false,reason:'missing-from-delivery',expectedPath:null}
],get:()=>null};})();`;

export async function test(root){
  // real manifest: every registered sound resolves and decodes; unregistered entries are pending, never failures
  const real=await checkAudio({root,dir:root});
  assert.equal(real.findings.length,0,`real audio findings: ${JSON.stringify(real.findings.slice(0,3))}`);
  assert(real.summary.registered>200);
  assert(!real.pending.some(p=>p.id==='MAGIC_SEANCE'),'OL-054 fills MAGIC_SEANCE with an accepted non-gun cue');
  const seance=real.manifest.get('MAGIC_SEANCE'),hex=real.manifest.get('MAGIC_HEX');
  assert.equal(seance.selectedFrom,'MAGIC_HEX');
  assert.equal(seance.registered,true);
  for(const key of ['file','sourceUrl','license'])assert.equal(seance[key],hex[key],`Seance must retain accepted Hex ${key}`);
  // entryFiles flattens loop-set parts and variations
  assert.deepEqual(entryFiles({file:'a.mp3',parts:[{file:'a__idle.mp3'}],variations:['a__alt.mp3']}),['a.mp3','a__idle.mp3','a__alt.mp3']);
  // synthetic: a registered file that does not exist is a FAIL-level finding
  const tmp=await tmpDir('raf14audio-');
  try{
    await mkdir(path.join(tmp,'js','data'),{recursive:true});
    await mkdir(path.join(tmp,'assets','audio'),{recursive:true});
    await writeFile(path.join(tmp,'js','data','audio_manifest.js'),MANIFEST);
    await writeFile(path.join(tmp,'assets','audio','GOOD.mp3'),Buffer.concat([Buffer.from('ID3'),Buffer.alloc(8)]));
    const found=await checkAudio({root:tmp,dir:tmp});
    assert(found.findings.some(f=>f.kind==='registered-audio-missing'&&f.id==='MISSING'),'missing registered audio must be reported');
    assert(!found.findings.some(f=>f.id==='GOOD'),'present registered audio must not be reported');
    assert.equal(found.pending.length,2,'unregistered entries are pending');
    assert.equal(found.summary.missing,1);
  }finally{await rm(tmp,{recursive:true,force:true});}
  console.log(`PASS f14 audio availability (${real.summary.registered} registered sounds clean; ${real.pending.length} declared pending; synthetic missing detected)`);
}
