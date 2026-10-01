// F14-A harness self-test — SEALED leak-scan integration (reuses tools/leak-check.mjs).
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {checkTree,checkRange} from '../../leak-check.mjs';
import {tmpDir,rm} from './_lib.mjs';

export async function test(root){
  // the real OPEN tree is clean
  const clean=await checkTree({root});
  assert(clean.ok,`OPEN tree leak check failed: ${clean.violations.map(v=>`${v.rule}:${v.file}`).join(', ')}`);
  assert(clean.filesScanned>0);
  // a planted forbidden path in a scanned artifact is detected (and reported by path, not by content)
  const tmp=await tmpDir('raf14leak-');
  try{
    await mkdir(path.join(tmp,'private_overlay'),{recursive:true});
    await writeFile(path.join(tmp,'private_overlay','x.js'),'// planted\n');
    const bad=await checkTree({root,dist:tmp});
    assert.equal(bad.ok,false,'a forbidden private_overlay path must be caught');
    assert(bad.violations.some(v=>v.rule==='forbidden-path'),'the violation kind is reported');
  }finally{await rm(tmp,{recursive:true,force:true});}
  // commit-range gate runs and stays clean on the frozen base
  const range=await checkRange({root,range:'HEAD~1..HEAD'});
  assert(range.ok,`range leak check failed: ${JSON.stringify(range.violations)}`);
  console.log(`PASS f14 leak-scan integration (OPEN tree clean over ${clean.filesScanned} files; planted forbidden path caught; range gate)`);
}
