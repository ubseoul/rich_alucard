import fs from 'node:fs';import {execFileSync} from 'node:child_process';import {digest} from '../sources.mjs';
const base='0c6ccc3d18674c713a0a6e5896fe6ecbf7f7bc0f',file='source_vault/manifest.json',m=JSON.parse(fs.readFileSync(file,'utf8')),rows=[];
// These stale registry hashes predate the accepted BUILD4 source updates. Prove that each file is still exactly
// the accepted base (canonical LF checkout), then reconcile metadata; never change any source or art byte.
for(const s of m.sources){if(!s.present||!s.sha256)continue;const mode=s.hash_mode||'bytes',actual=digest(fs.readFileSync(s.path),mode);if(actual===s.sha256)continue;
 const accepted=digest(execFileSync('git',['-c','gc.auto=0','show',`${base}:${s.path}`],{maxBuffer:20e6}),mode);if(actual!==accepted)throw Error(`Refusing to reconcile a changed source: ${s.path}`);
 rows.push({path:s.path,oldSha256:s.sha256,acceptedBaseSha256:accepted,hashMode:mode});s.sha256=accepted;s.source_commit=base;s.source_branch='build/visual-completion-002';s.notes+=' FINAL-A reconciled the stale metadata hash against the unchanged accepted OL-053 base; source bytes were not edited.';
}
fs.writeFileSync(file,JSON.stringify(m,null,2)+'\n');fs.writeFileSync('docs/evidence/final_a/source-manifest-reconciliation.json',JSON.stringify({base,rows,sourceBytesChanged:0},null,2)+'\n');console.log(`Reconciled ${rows.length} inherited source hashes; zero source bytes changed.`);
