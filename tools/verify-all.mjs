#!/usr/bin/env node
// IF-1 (4R) ONE integration verification command:  npm run verify:all
//   1 loader           ordered manifest + generated index.html + dependency rules
//   2 build            release gate (automated regression, every fragment's tests via auto-discovery, migration fixtures,
//                      IF-1 contract tests, zero-behavior-change replay, leak check) THEN the artifact + artifact verification
//   3 artifact leak    the built OPEN artifact carries no sealed implementation content
//   4 private overlay  an EMPTY overlay applied to a copy of the artifact yields an artifact identical to OPEN
//   5 browser smoke    critical real-browser paths (skipped — loudly — when Playwright is unavailable; --require-browser makes that fatal)
//   --playtest         additionally play New Game to Day 3 through the real player path (tools/playtest-qa.mjs, slow)
//   --skip-build       reuse an existing dist/ (steps 3–5 only) — for CI jobs that already built
// Writes reports/verify-all.json. No Google/CI-specific infrastructure is required to run it locally.
import {spawnSync} from 'node:child_process';
import {mkdirSync,mkdtempSync,rmSync,writeFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const flag=n=>process.argv.includes(n);
const steps=[];
function run(name,cmd,args,{allowSkip=false,timeout=1800000}={}){
  const started=Date.now();console.log(`\n=== ${name} ===`);
  const r=spawnSync(cmd,args,{cwd:root,stdio:'inherit',shell:false,timeout,env:process.env});
  const ok=r.status===0;steps.push({name,status:ok?'PASS':'FAIL',seconds:Math.round((Date.now()-started)/1000)});return ok;
}
const node=process.execPath;
let ok=true;
ok=run('loader verification',node,['tools/loader.mjs','verify'])&&ok;
if(!flag('--skip-build'))ok=run('build (regression + fragment suites + contract + zero-change + leak + artifact verification)',node,['tools/release.mjs','build'])&&ok;
ok=run('artifact verification',node,['tools/release.mjs','verify-artifact'])&&ok;
ok=run('OPEN artifact leak check',node,['tools/leak-check.mjs','--dist','dist'])&&ok;
{const tmp=mkdtempSync(path.join(os.tmpdir(),'raov-'));
 try{spawnSync(node,['tools/overlay.mjs','init-empty','--dir',path.join(tmp,'overlay')],{cwd:root,stdio:'ignore'});
  ok=run('private overlay build with EMPTY pack (must equal OPEN)',node,['tools/overlay.mjs','build','--overlay',path.join(tmp,'overlay'),'--dist','dist','--out',path.join(tmp,'dist-private')])&&ok;
  ok=run('OPEN artifact still clean after overlay build',node,['tools/leak-check.mjs','--dist','dist'])&&ok;}
 finally{rmSync(tmp,{recursive:true,force:true});}}
{const smoke=spawnSync(node,['tools/if1/browser-smoke.mjs',...(flag('--require-browser')?['--require-browser']:[])],{cwd:root,encoding:'utf8',env:process.env});
 process.stdout.write(smoke.stdout||'');process.stderr.write(smoke.stderr||'');
 const skipped=/^SKIPPED browser smoke/m.test(smoke.stdout||'');steps.push({name:'browser smoke',status:skipped?'SKIPPED':smoke.status===0?'PASS':'FAIL'});if(smoke.status!==0)ok=false;}
if(flag('--playtest'))ok=run('New Game → Day 3 (real player path)',node,['tools/playtest-qa.mjs','--only','newgame,life','--days','3','--out',path.join(root,'reports','playtest')],{timeout:3600000})&&ok;
mkdirSync(path.join(root,'reports'),{recursive:true});
writeFileSync(path.join(root,'reports','verify-all.json'),`${JSON.stringify({ok,at:new Date().toISOString(),steps},null,1)}\n`);
console.log(`\n${ok?'PASS':'FAIL'} verify:all\n${steps.map(s=>`  ${s.status.padEnd(7)} ${s.name}${s.seconds!==undefined?` (${s.seconds}s)`:''}`).join('\n')}`);
process.exitCode=ok?0:1;
