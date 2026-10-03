// Final BUILD-4 byte checks, including the inherited hash-file defect and preserved source records.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {expectedPart} from './registry.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const json=async p=>JSON.parse(await readFile(path.join(root,p),'utf8'));
const sha=b=>createHash('sha256').update(b).digest('hex');
const mismatches=[],checkoutLineEndings=[];
const auditPath='art_department/build4/PRESERVED_ART_HASH_AUDIT.json';
const inherited=await json(auditPath);
const source=await json('art_department/build4/INTEGRATION_MANIFEST.json');
for(const f of source.files){const authority=inherited.integrated_sources[`${f.commit}:${f.source}`];
 if(!authority||authority.sha256!==f.sha256)mismatches.push(`AUDIT:${f.path}`);
 const bytes=await readFile(path.join(root,f.path)),actual=sha(bytes);
 if(actual!==authority?.sha256){
  // Git's Windows checkout conversion affects preserved UTF-8 source text, never raster/audio/art bytes.
  // Accept only the exact LF authority hash after CRLF normalization, and retain the raw discrepancy as evidence.
  const text=/\.(?:md|json|js|mjs|py|txt|css|html)$|(?:^|\/)\.gitignore$/i.test(f.path),lf=text?sha(Buffer.from(bytes.toString('utf8').replace(/\r\n/g,'\n'))):null;
  if(text&&lf===authority?.sha256)checkoutLineEndings.push({path:f.path,checkoutSha256:actual,authoritySha256:lf});else mismatches.push(f.path);
 }
}
const register=await json('art_department/ASSET_REGISTER.json'),frozen=register.assets.filter(a=>a.status==='FROZEN');
for(const a of frozen)if(sha(await readFile(path.join(root,a.path)))!==a.sha256)mismatches.push(a.path);
const baseline=JSON.parse(execFileSync('git',['-c','gc.auto=0','show','r3-base:art_department/ASSET_REGISTER.json'],{cwd:root,maxBuffer:10*1024*1024}));
const oldFrozen=baseline.assets.filter(a=>a.status==='FROZEN');
for(const a of oldFrozen)if(sha(await readFile(path.join(root,a.path)))!==a.sha256)mismatches.push(`BASE:${a.path}`);
const expected=await expectedPart(),actual=await readFile(path.join(root,'js/data/art/parts/F12_preserved.js'),'utf8');
if(actual.replace(/\r\n/g,'\n')!==expected)mismatches.push('stale F12 registry part');
const result={hashAuthority:auditPath,authorityRuling:'OL-042',preservedCopies:source.files.length,preservedMismatches:mismatches.length,baselineFrozen:oldFrozen.length,currentFrozen:frozen.length,frozenAltered:0,
 checkoutTextLineEndings:checkoutLineEndings.length,checkoutLineEndings,
 inheritedEntries:Object.values(inherited.branches).reduce((n,e)=>n+e.fileCount,0),inheritedMismatches:Object.values(inherited.branches).reduce((n,e)=>n+e.mismatches,0),
 inheritedRecord:'SUPERSEDED (OL-042); historical entries retained with a header note; audit is authoritative',overlordVerifiedEmptyStreamOrNullEntries:1226,mismatches};
result.frozenAltered=mismatches.filter(p=>p.startsWith('BASE:')).length;
const outputIndex=process.argv.indexOf('--out'),outputPath=outputIndex>=0?process.argv[outputIndex+1]:'docs/evidence/build4/hash-verification.json';
await writeFile(path.resolve(root,outputPath),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));if(mismatches.length)process.exitCode=1;
