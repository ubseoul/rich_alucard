import fs from 'node:fs';
import '../tests/f01/play-sim/globals.mjs';
import {JOBS} from '../../js/frag/F01/play/content.mjs';
import {runPlay} from '../tests/f01/play-sim/driver.mjs';
import {runCareer} from '../tests/f01/play-sim/campaign.mjs';
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
 const sizes=[];
 for(let seed=1;seed<=100;seed++){
  const career=runCareer({seed:seed+(policy==='careful'?1000:0),nights:24,policy});sizes.push(career.state.roster.length);
  const recent=[];
  for(const r of career.recs){
   const ids=new Set(r.lineLog||[]);const prior=new Set(recent.flat());
   for(const id of ids){results.T9.uses++;if(prior.has(id))results.T9.violations++;}
   recent.push([...ids]);if(recent.length>3)recent.shift();
  }
 }
 const atLeast6=sizes.filter(n=>n>=6).length;
 results.careers[policy]={n:100,atLeast6,percent:atLeast6,min:Math.min(...sizes)};
 results.ok&&=atLeast6>=(policy==='random'?95:100)&&Math.min(...sizes)>=(policy==='random'?4:6);
 console.log('R1',policy,JSON.stringify(results.careers[policy]));
}
results.ok&&=results.T9.violations===0&&results.calls.max<=2;
fs.mkdirSync('docs/evidence/build2',{recursive:true});fs.writeFileSync('docs/evidence/build2/play-validation.json',JSON.stringify(results,null,2)+'\n');
console.log(results.ok?'PASS':'FAIL','BUILD2 PLAY acceptance',JSON.stringify(results.T9),JSON.stringify(results.calls));process.exitCode=results.ok?0:1;
