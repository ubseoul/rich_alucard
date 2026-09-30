#!/usr/bin/env node
// F13 paired counterfactual: the same persona and seeds with ONE behavior knob changed (persona overrides), to price a single choice.
//   node tools/tests/f13/counterfactual.mjs --persona raid_dodger --overrides '{"answerRaids":true}' [--seeds 10] [--days 42]
// Prints per-seed final cash for both arms and the paired difference. Measurement only; no game value is touched.
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {campaign} from './_campaign.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','..','..');
const arg=(k,d)=>{const i=process.argv.indexOf('--'+k);return i<0?d:process.argv[i+1];};
const persona=arg('persona','raid_dodger'),overrides=JSON.parse(arg('overrides','{}')),seeds=Number(arg('seeds',10)),days=Number(arg('days',42));
const rows=[];
for(let s=1;s<=seeds;s++){
 const a=await campaign(root,{persona,seed:s,days});const b=await campaign(root,{persona,seed:s,days,overrides});
 rows.push({seed:s,base:a.final.money,alt:b.final.money,diff:a.final.money-b.final.money,raidsBase:a.trap.raids.answered,raidsAlt:b.trap.raids.answered,pendingBase:a.trap.raids.pendingDays,stashAlt:b.trap.raids.stashLost,holdNetAlt:b.trap.raids.holdNet,capturedBase:a.crew.capturedEvents,capturedAlt:b.crew.capturedEvents});
 process.stderr.write(`\r${s}/${seeds}`);
}
const med=xs=>[...xs].sort((x,y)=>x-y)[Math.floor(xs.length/2)];
console.log(JSON.stringify({persona,overrides,seeds,days,medianBase:med(rows.map(r=>r.base)),medianAlt:med(rows.map(r=>r.alt)),medianDiff:med(rows.map(r=>r.diff)),baseAhead:rows.filter(r=>r.diff>0).length,rows},null,1));
