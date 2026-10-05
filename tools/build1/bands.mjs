#!/usr/bin/env node
// BUILD-1 STEP 4: OL-022 PLAY failure bands over >= 1,000 simulated PLAYs PER CLASS, on the SHARED F01 engine (the same one the tuned sim
// and the sandbox use). "Failure" is the OL-022 / T2 metric: the share of PLAYs in which a NAMED crew member was captured.
//   routine <= 8% | BIG PLAY <= 20% | HOLD THE HOUSE <= 8%
// Usage: node tools/build1/bands.mjs [--seeds 250]     (10 job specs x 4 policies x seeds; 250 seeds = 1,000 PLAYs for each single-job class)
import {JOBS,SEEDS,matrix,decorate,pct} from '../tests/f01/play-sim/metrics.mjs';
const i=process.argv.indexOf('--seeds'),SEED_N=i>=0?Number(process.argv[i+1]):250;
const t0=Date.now();
const recs=decorate(matrix(SEED_N));
const bigIds=new Set(JOBS.filter(j=>j.bigPlay).map(j=>j.id)),defIds=new Set(JOBS.filter(j=>j.defense).map(j=>j.id));
const klass=r=>bigIds.has(r.job)?'BIG PLAY':defIds.has(r.job)?'HOLD THE HOUSE':'routine';
const TARGET={routine:.08,'BIG PLAY':.20,'HOLD THE HOUSE':.08};
let ok=true;const rows=[];
for(const k of ['routine','BIG PLAY','HOLD THE HOUSE']){
 const a=recs.filter(r=>klass(r)===k),f=a.filter(r=>r.namedCaptured>0).length,rate=f/a.length;
 const pass=rate<=TARGET[k]&&a.length>=1000;ok=ok&&pass;rows.push({class:k,plays:a.length,failures:f,rate:+(rate*100).toFixed(2),target:TARGET[k]*100,pass});
}
console.log(JSON.stringify({seedsPerJobPolicy:SEED_N,totalPlays:recs.length,seconds:Math.round((Date.now()-t0)/1000),bands:rows},null,1));
console.log(rows.map(r=>`${r.pass?'PASS':'FAIL'} OL-022 ${r.class}: ${r.rate}% named-captured over ${r.plays} PLAYs (target <= ${r.target}%)`).join('\n'));
process.exitCode=ok?0:1;
