#!/usr/bin/env node
// F14-A — INDUCED-FAILURE DEMO.
//
// Proves the harness detects failures and produces a reproduction bundle WITHOUT touching gameplay source: it copies a
// built dist/ to a work directory, (1) deletes a referenced frozen asset and (2) injects an uncaught page error, then
// runs the harness against the copy. The output is evidence that missing-asset reporting, console/page-error capture,
// screenshots and the failure bundle all fire.
//
//   node tools/f14/induce-failure.mjs [--dist dist] [--out work/f14-induced]
import {cp,readFile,writeFile,rm,access} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {runHarness,formatReport,root} from './harness.mjs';

const arg=n=>{const i=process.argv.indexOf(n);return i===-1?null:process.argv[i+1];};
const srcDist=path.resolve(arg('--dist')||path.join(root,'dist'));
const outDir=path.resolve(arg('--out')||path.join(root,'work','f14-induced'));
if(!existsSync(path.join(srcDist,'index.html'))){console.error(`dist/ not found at ${srcDist} — run npm run build first`);process.exit(2);}

const brokenAsset='assets/before_the_fame/art_ship_014/package_d/D-supra-listing.png';
const dist=path.join(outDir,'dist');
await rm(dist,{recursive:true,force:true});await cp(srcDist,dist,{recursive:true});
let removed=null;
try{await access(path.join(dist,brokenAsset));await rm(path.join(dist,brokenAsset),{force:true});removed=brokenAsset;}catch(e){}
const index=path.join(dist,'index.html');
const html=await readFile(index,'utf8');
const injected='<script>console.error("F14-INDUCED-CONSOLE-ERROR");throw new Error("F14-INDUCED-PAGE-ERROR");</script>';
await writeFile(index,html.includes('</body>')?html.replace('</body>',`${injected}</body>`):`${html}${injected}`);

console.log(`induced faults: ${removed?`removed ${removed}; `:''}injected page error into ${path.relative(root,index)}`);
const report=await runHarness({root,dist,out:path.join(outDir,'report'),only:['IF1.boot'],requireBrowser:true,leak:false,log:console.log});
console.log(`\n${formatReport(report)}\n`);
console.log(`bundles: ${report.bundles.join(', ')||'(none)'}`);
// The demo is a SUCCESS when the harness correctly FAILED and produced a bundle.
const ok=!report.checklistSummary.ok&&report.bundles.length>0&&report.assets.findings.some(f=>f.kind==='referenced-file-missing'||f.kind==='registry-art-missing');
if(!ok){console.error('INDUCED FAILURE WAS NOT DETECTED — harness self-check failed');process.exitCode=1;}
