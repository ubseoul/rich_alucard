#!/usr/bin/env node
// NIGHTLY SMOKE HOOK — a single, self-contained entry point for an external nightly runner (Google / Antigravity, GitHub
// Actions schedule, cron, …). It needs only Node >= 20 and, for the browser part, Playwright (RA_PLAYWRIGHT_PATH). No
// Google-specific infrastructure is required or assumed; a runner just executes this command and reads the JSON + exit code.
//
//   node tools/nightly-smoke.mjs [--url https://…] [--dist dist] [--out reports/nightly] [--require-browser] [--build]
//     --build   run `npm run build` first (otherwise dist/ must already exist, or --url must point at a deployment)
//   exit 0  = PASS (or browser SKIPPED without --require-browser — reported explicitly in the JSON)
//   exit 1  = FAIL, exit 2 = usage / environment error
//   writes  <out>/nightly.json  {status, checks:[{name,status}], browser:{status,total,failed,results}}
import {spawnSync} from 'node:child_process';
import {mkdirSync,writeFileSync,existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {runBrowserSmoke} from './if1/browser-smoke.mjs';
import {checkTree} from './leak-check.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const arg=n=>{const i=process.argv.indexOf(n);return i===-1?null:process.argv[i+1];};
const out=path.resolve(arg('--out')||path.join(root,'reports','nightly'));mkdirSync(out,{recursive:true});
const url=arg('--url'),dist=path.resolve(arg('--dist')||path.join(root,'dist'));
const checks=[];const add=(name,status,detail)=>{checks.push({name,status,...(detail?{detail}:{})});console.log(`${status.padEnd(7)} ${name}${detail?` — ${detail}`:''}`);};
try{
  if(process.argv.includes('--build')){const r=spawnSync(process.execPath,['tools/release.mjs','build'],{cwd:root,stdio:'inherit'});add('build',r.status===0?'PASS':'FAIL');}
  if(!url&&!existsSync(path.join(dist,'index.html'))){console.error('dist/ not found: pass --build, --dist or --url');process.exit(2);}
  const loader=spawnSync(process.execPath,['tools/loader.mjs','verify'],{cwd:root,encoding:'utf8'});add('loader order',loader.status===0?'PASS':'FAIL',loader.status===0?undefined:(loader.stderr||'').trim().split('\n')[0]);
  if(!url){const r=spawnSync(process.execPath,['tools/release.mjs','verify-artifact'],{cwd:root,encoding:'utf8'});add('artifact verification',r.status===0?'PASS':'FAIL');
    const leak=await checkTree({root,dist:path.relative(root,dist)});add('OPEN artifact leak check',leak.ok?'PASS':'FAIL',leak.ok?undefined:leak.violations.map(v=>v.rule).join(','));}
  const browser=await runBrowserSmoke({dist,url,out:path.join(out,'browser')});
  add('browser critical paths',browser.status==='PASSED'?'PASS':browser.status,browser.status==='PASSED'?`${browser.total} checks`:browser.reason||`${browser.failed} failed`);
  const failed=checks.some(c=>c.status==='FAIL')||(browser.status==='SKIPPED'&&process.argv.includes('--require-browser'));
  const status=failed?'FAIL':browser.status==='SKIPPED'?'PASS_BROWSER_SKIPPED':'PASS';
  writeFileSync(path.join(out,'nightly.json'),`${JSON.stringify({status,at:new Date().toISOString(),target:url||'dist',checks,browser},null,1)}\n`);
  console.log(`\nnightly smoke: ${status} → ${path.join(out,'nightly.json')}`);process.exitCode=failed?1:0;
}catch(error){console.error(`FAIL ${error.message}`);process.exitCode=1;}
