import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import '../tests/f01/play-sim/globals.mjs';
import {JOBS} from '../../js/frag/F01/play/content.mjs';
import {runPlay} from '../tests/f01/play-sim/driver.mjs';
import {runCareer} from '../tests/f01/play-sim/campaign.mjs';
// Materialize only the unchanged base simulation dependencies, never the authority checkout.
const baseline='work/build2/r3-base-validation';
const names=execFileSync('git',['-c','gc.auto=0','ls-tree','-r','--name-only','r3-base','--','tools/tests/f01/play-sim','js/frag/F01/play','js/frag/F01/rng.js','js/frag/F01/data.js'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
for(const name of names){const target=path.join(baseline,name);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,execFileSync('git',['-c','gc.auto=0','show',`r3-base:${name}`]));}
const {runCareer:runBaseCareer}=await import(pathToFileURL(path.resolve(baseline,'tools/tests/f01/play-sim/campaign.mjs')).href);
const policies=['careful','naive','random','greedy'];
const groups={routine:JOBS.filter(j=>!j.bigPlay&&!j.defense),big:JOBS.filter(j=>j.bigPlay),hold:JOBS.filter(j=>j.defense)};
const results={seedFormula:'bandIndex*100000 + policyIndex*10000 + k; k=1..1000; jobs round-robin',bands:{},careers:{},T9:{violations:0,uses:0},calls:{max:0},ok:true};
let gi=0;
for(const [band,jobs] of Object.entries(groups)){
 const rows=[];
 for(const [pi,policy] of policies.entries()){
  let captured=0;
  for(let k=1;k<=1000;k++){
   const rec=runPlay({seed:gi*100000+pi*10000+k,job:jobs[(k-1)%jobs.length],policy});
   if(rec.namedCaptured>0)captured++;
   results.calls.max=Math.max(results.calls.max,rec.calls.surfaced);
  }
  rows.push({policy,n:1000,captured,percent:captured/10});
 }
 const n=rows.reduce((a,b)=>a+b.n,0),captured=rows.reduce((a,b)=>a+b.captured,0),percent=captured/n*100;
 results.bands[band]={n,captured,percent,limit:band==='big'?20:8,policies:rows};
 results.ok&&=percent<=(band==='big'?20:8);
 console.log('BAND',band,JSON.stringify(results.bands[band]));gi++;
}
for(const policy of ['random','careful']){
 const sizes=[],sameSeed=[];
 for(let seed=1;seed<=100;seed++){
  const career=runCareer({seed:seed+(policy==='careful'?1000:0),nights:24,policy});sizes.push(career.state.roster.length);
  if(policy==='random'){
   const base=runBaseCareer({seed,nights:24,policy});
   sameSeed.push({seed,base:base.state.roster.length,branch:career.state.roster.length,delta:career.state.roster.length-base.state.roster.length});
  }
  const recent=[];
  for(const r of career.recs){
   const ids=new Set(r.lineLog||[]);const prior=new Set(recent.flat());
   for(const id of ids){results.T9.uses++;if(prior.has(id))results.T9.violations++;}
   recent.push([...ids]);if(recent.length>3)recent.shift();
  }
 }
 const atLeast6=sizes.filter(n=>n>=6).length;
 results.careers[policy]={n:100,atLeast6,percent:atLeast6,min:Math.min(...sizes)};
 if(policy==='random'){
  const regressed=sameSeed.filter(r=>r.delta<0);
  const baseSizes=sameSeed.map(r=>r.base);
  results.sameSeed={base:'r3-base / 779a56363a2b5ed01e188025279138d1443293a7',n:100,rows:sameSeed,regressed,ok:regressed.length===0,baseMin:Math.min(...baseSizes),branchMin:Math.min(...sizes),baseAtLeast6:baseSizes.filter(n=>n>=6).length,branchAtLeast6:atLeast6};
  results.careers.random.absoluteOL020MinPass=Math.min(...sizes)>=4;
  results.careers.random.disposition='OL-043: minimum 3 at seed 54 transferred to BUILD-5; unchanged OL-020 target 4; BUILD-2 requires no same-seed regression';
  results.ok&&=atLeast6>=95&&results.sameSeed.ok;
 }else results.ok&&=atLeast6>=100&&Math.min(...sizes)>=6;
 console.log('R1',policy,JSON.stringify(results.careers[policy]));
}
results.ok&&=results.T9.violations===0&&results.calls.max<=2;
fs.mkdirSync('docs/evidence/build2',{recursive:true});fs.writeFileSync('docs/evidence/build2/play-validation.json',JSON.stringify(results,null,2)+'\n');
fs.writeFileSync('docs/evidence/build2/r1-base-comparison.json',JSON.stringify(results.sameSeed,null,2)+'\n');
console.log(results.ok?'PASS':'FAIL','BUILD2 PLAY acceptance',JSON.stringify(results.T9),JSON.stringify(results.calls));process.exitCode=results.ok?0:1;
