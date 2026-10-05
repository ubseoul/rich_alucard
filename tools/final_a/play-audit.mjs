import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {matrix,JOBS} from '../tests/f01/play-sim/metrics.mjs';
import {runCareer} from '../tests/f01/play-sim/campaign.mjs';
import {POLICY_NAMES} from '../tests/f01/play-sim/policy.mjs';
import {LINES,lineKey} from '../../js/frag/F01/play/lines.mjs';
const base='0c6ccc3d18674c713a0a6e5896fe6ecbf7f7bc0f',out='docs/evidence/final_a/stage6';fs.mkdirSync(out,{recursive:true});
const files=execFileSync('git',['-c','gc.auto=0','ls-tree','-r','--name-only',base,'js/frag/F01','js/frag/F06','assets/f01/play'],{encoding:'utf8'}).trim().split('\n').filter(p=>/\.(js|mjs)$/.test(p));
const hash=b=>createHash('sha256').update(b.toString('utf8').replace(/\r\n/g,'\n')).digest('hex');
const changed=files.filter(p=>hash(fs.readFileSync(p))!==hash(execFileSync('git',['-c','gc.auto=0','show',`${base}:${p}`],{maxBuffer:5e6})));
console.log('locked executable byte comparison',files.length,changed.length);
const recs=matrix(100),big=new Set(JOBS.filter(j=>j.bigPlay).map(j=>j.id)),hold=new Set(JOBS.filter(j=>j.defense).map(j=>j.id));
const band=(name,pred,target)=>{const a=recs.filter(pred),n=a.filter(r=>r.namedCaptured>0).length;return {name,plays:a.length,captured:n,rate:n/a.length,target,pass:n/a.length<=target};};
const bands=[band('routine',r=>!big.has(r.job)&&!hold.has(r.job),.08),band('BIG PLAY',r=>big.has(r.job),.20),band('HOLD THE HOUSE',r=>hold.has(r.job),.08)];
const random=[],careers={};for(const pol of POLICY_NAMES){careers[pol]=[];for(let seed=1;seed<=(pol==='random'?100:40);seed++){const c=runCareer({seed:seed+(pol==='random'?0:POLICY_NAMES.indexOf(pol)*1000),nights:24,policy:pol});careers[pol].push(c);if(pol==='random')random.push({seed,roster:c.state.roster.length,plays:c.recs.length});}console.log('career policy',pol,careers[pol].length);}
const t9={uses:0,violationsIn3:0,maxUse:{},uncoveredTriggers:[],shortPools:[]};for(const c of Object.values(careers).flat()){const seq=c.recs.map(r=>r.lineLog||[]);seq.forEach((ids,i)=>{const counts={};for(const id of ids){t9.uses++;const k=id.split('#')[0];counts[k]=(counts[k]||0)+1;if((LINES[k]||[]).length>=4&&ids.filter(x=>x.startsWith(k+'#')).length<=1&&[1,2,3].some(d=>i>=d&&seq[i-d].includes(id)))t9.violationsIn3++;}for(const [k,n]of Object.entries(counts))t9.maxUse[k]=Math.max(n,t9.maxUse[k]||0);});}
t9.uncoveredTriggers=[...new Set(recs.flatMap(r=>r.moments.map(m=>m.k)).filter(Boolean))].filter(k=>!lineKey(k));t9.shortPools=Object.entries(t9.maxUse).filter(([k,n])=>(LINES[k]||[]).length<=3*n).map(([k,n])=>({key:k,pool:(LINES[k]||[]).length,maxUse:n}));
const bailed=recs.filter(r=>r.bailed),bad=bailed.filter(r=>big.has(r.job)||hold.has(r.job)||r.crew.length<2||r.robbed||r.getaway!=='BAILED'||r.win||r.pot.cash||r.pot.crates.length||Object.values(r.finalStatus).some(x=>['CAPTURED','DEAD','GONE','SHOT'].includes(x)));
const r1={seeds:100,nights:24,mean:random.reduce((n,r)=>n+r.roster,0)/100,worst:Math.min(...random.map(r=>r.roster)),seed54:random.find(r=>r.seed===54),below4:random.filter(r=>r.roster<4),rows:random};
const result={base,method:'Actual locked F01 engine. 100 seeds per job/policy for bands; 100 random 24-night careers for R1, plus 40 careers for each other policy for T9. Canonical LF source hashes establish base/final executable parity; Windows checkout line endings are normalized.',lockedExecutable:{files:files.length,changed,hashMode:'lf'},bands,r1,t9,bailed:{plays:bailed.length,boundViolations:bad.length},pass:changed.length===0&&bands.every(b=>b.pass)&&r1.worst>=4&&t9.violationsIn3===0&&t9.uncoveredTriggers.length===0&&t9.shortPools.length===0&&bad.length===0};
fs.writeFileSync(path.join(out,'play-audit.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({...result,r1:{...r1,rows:undefined},t9:{...t9,maxUse:undefined}},null,2));
// Failed acceptance targets are recorded as escalations; this audit does not alter feel-locked rules.
