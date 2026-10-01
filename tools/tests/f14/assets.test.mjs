// F14-A harness self-test — asset validation: missing reference, decode failure, placeholder marker, duplicate ids.
import assert from 'node:assert/strict';
import {writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {decodeCheck,sniff,findMarkers,duplicateIds,scanAssets,extractRefs} from '../../f14/assets.mjs';
import {tmpDir,rm} from './_lib.mjs';

const PNG=Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a,0,0,0,0]);
const MP3=Buffer.concat([Buffer.from('ID3'),Buffer.alloc(10)]);
const OGG=Buffer.concat([Buffer.from('OggS'),Buffer.alloc(10)]);

export async function test(root){
  // ---- magic-byte decode
  assert.equal(sniff(PNG),'png');assert.equal(sniff(MP3),'mp3');assert.equal(sniff(OGG),'ogg');
  assert.equal(decodeCheck(PNG,'.png').ok,true);
  assert.equal(decodeCheck(MP3,'.mp3').ok,true);
  assert.equal(decodeCheck(Buffer.from('not an image'),'.png').ok,false,'text bytes declared as png must fail');
  assert.equal(decodeCheck(Buffer.alloc(0),'.png').reason,'empty-file');
  assert.equal(decodeCheck(MP3,'.png').ok,false,'audio bytes declared as an image must fail');
  // ---- placeholder sentinels
  const hits=findMarkers('const a=1;\n// __PLACEHOLDER__ here\n');
  assert.equal(hits.length,1);assert.equal(hits[0].marker,'__PLACEHOLDER__');assert.equal(hits[0].line,2);
  assert.equal(findMarkers('RAPixel placeholders are fine prose',[]).length,0);
  // ---- duplicate ids
  assert.deepEqual(duplicateIds([{id:'a'},{id:'b'},{id:'a'},{id:'a'}]),['a']);
  // ---- reference extraction ignores dynamic template fragments
  const refs=extractRefs('x="assets/a.png"; const p=`assets/revenge_${i+1}.png`;');
  assert(refs.includes('assets/a.png'));assert(!refs.some(r=>r.includes('${')),'template fragments are not file references');
  // ---- scanAssets on a synthetic artifact
  const tmp=await tmpDir('raf14assets-');
  try{
    await mkdir(path.join(tmp,'assets'),{recursive:true});
    await mkdir(path.join(tmp,'js'),{recursive:true});
    await writeFile(path.join(tmp,'assets','good.png'),PNG);
    await writeFile(path.join(tmp,'assets','broken.png'),'this is not a png');
    await writeFile(path.join(tmp,'js','a.js'),"// TODO: __PLACEHOLDER__ still here\n");
    await writeFile(path.join(tmp,'index.html'),'<img src="assets/good.png"><img src="assets/missing.png">');
    const scan=await scanAssets({dir:tmp});
    const kinds=scan.findings.map(f=>f.kind);
    assert(kinds.includes('referenced-file-missing'),'missing referenced file must be reported');
    assert(kinds.includes('image-decode-failure'),'undecodable image must be reported');
    assert(kinds.includes('placeholder-marker'),'placeholder marker must be reported');
    assert(!scan.findings.some(f=>f.file==='assets/good.png'&&f.kind!=='decode'),'good asset must not be flagged');
    assert(scan.decoded>=1);
    // scope limits the walk (tooling is never scanned in a repo-root scan)
    const scoped=await scanAssets({dir:tmp,scope:['index.html']});
    assert.equal(scoped.files,1,'scope restricts the scanned file set');
    assert(!scoped.findings.some(f=>f.kind==='placeholder-marker'),'js/ marker excluded by scope');
  }finally{await rm(tmp,{recursive:true,force:true});}
  // ---- the real repo's runtime surface is clean at IF-1
  const real=await scanAssets({dir:root,scope:['index.html','js','assets','game.js']});
  const hard=real.findings.filter(f=>f.kind!=='placeholder-marker');
  assert.equal(hard.length,0,`real runtime surface has asset findings: ${hard.slice(0,3).map(f=>`${f.kind}:${f.file}`).join(', ')}`);
  console.log(`PASS f14 asset validation (decode/markers/duplicates/missing-reference; ${real.refs} real references clean)`);
}
