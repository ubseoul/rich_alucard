#!/usr/bin/env node
// F14-A — FCPB WHOLE-GAME QA HARNESS CLI (infrastructure only).
//
//   node tools/f14/run.mjs [--dist dist | --url https://…] [--out reports/f14]
//                          [--only IF1.phone,F01] [--exclude IF1.minigame.owambe_collection] [--seed N] [--days N] [--final]
//                          [--leak-range base..head] [--denylist file.json] [--no-leak]
//                          [--require-browser] [--json]
//
// exit 0  PASS (or browser SKIPPED without --require-browser — always reported, never a silent pass)
// exit 1  FAIL, exit 2 usage error
// Writes <out>/report.json. Reproduction bundles are written to <out>/bundles.
import {writeFile,mkdir,readFile} from 'node:fs/promises';
import path from 'node:path';
import {runHarness,formatReport,root} from './harness.mjs';

const args=Object.fromEntries(process.argv.slice(2).reduce((acc,a,i,all)=>{if(a.startsWith('--')){const n=all[i+1];acc.push([a.slice(2),n&&!n.startsWith('--')?n:true]);}return acc;},[]));
const arg=n=>args[n]||null;
const out=path.resolve(arg('out')||path.join(root,'reports','f14'));
try{
  const denylist=arg('denylist')?JSON.parse(await readFile(path.resolve(arg('denylist')),'utf8')):null;
  const report=await runHarness({
    root:arg('root')?path.resolve(arg('root')):root,
    dist:arg('dist')||null,
    url:arg('url')||null,
    out,
    only:arg('only')?String(arg('only')).split(','):null,
    exclude:arg('exclude')?String(arg('exclude')).split(','):null,
    seed:arg('seed')?Number(arg('seed')):7,
    days:arg('days')?Number(arg('days')):28,
    requireBrowser:!!args['require-browser'],
    finalMode:!!args.final,
    leak:!args['no-leak'],
    leakRange:arg('leak-range')||null,
    hqPrivate:process.env.RA_HQ_PRIVATE==='1'
  });
  await mkdir(out,{recursive:true});
  await writeFile(path.join(out,'report.json'),`${JSON.stringify(report,null,1)}\n`);
  if(args.json)console.log(JSON.stringify(report));
  else console.log(`\n${formatReport(report)}\n`);
  const skippedRequiresBrowser=report.browser.status==='SKIPPED'&&report.requireBrowser;
  const ok=report.checklistSummary.ok&&!skippedRequiresBrowser;
  process.exitCode=ok?0:1;
}catch(error){console.error(`FAIL ${error.message}`);process.exitCode=1;}
