import {writeFile,mkdir} from 'node:fs/promises';
import {career} from './_guard_repro.mjs';
const results=[];
for(const t of [{root:'work/final_a/base',label:'before',persona:'trap_committed',seed:9,maxDays:11},{root:process.cwd(),label:'after',persona:'trap_committed',seed:5,maxDays:15}]){
 const r=await career(t.root,t);results.push({label:t.label,persona:t.persona,seed:t.seed,errors:r.errors,guardDiagnostics:r.guardDiagnostics||[]});console.log(JSON.stringify(results.at(-1)));
}
await writeFile('docs/evidence/final_a/stage5/bounded-walker-repro.json',JSON.stringify({method:'same original v2 policies/seeds and production source, original error behavior retained; diagnostic capture only. This shorter replay is supplementary and does not replace any 360 population row.',results},null,1)+'\n');process.exit();
