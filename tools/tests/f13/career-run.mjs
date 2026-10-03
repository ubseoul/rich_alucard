#!/usr/bin/env node
// 18 route-driven fresh careers x paired seeds, through the actual ending eligibility boundary.
import {fork} from 'node:child_process';
import {mkdir,writeFile,appendFile,readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {CAREER_PERSONAS,career} from './_career.mjs';
const file=fileURLToPath(import.meta.url),repo=path.resolve(path.dirname(file),'../../..');
const arg=(k,d)=>{const at=process.argv.indexOf('--'+k);return at<0?d:process.argv[at+1];};
if(process.argv.includes('--worker')){
 process.on('message',async task=>{const started=Date.now();try{const r=await career(task.root,task);process.send({...r,label:task.label,elapsedSeconds:(Date.now()-started)/1000,policyVersion:'FINAL-A.fresh.v2'});}catch(e){process.send({persona:task.persona,seed:task.seed,label:task.label,elapsedSeconds:(Date.now()-started)/1000,fatal:e.stack});}});
 process.send({ready:true});
}else{
 const root=path.resolve(arg('root',repo)),label=arg('label','after'),seeds=Number(arg('seeds',10)),maxDays=Number(arg('days',70)),personas=arg('personas',Object.keys(CAREER_PERSONAS).join(',')).split(',');
 const paired=arg('paired-root',null),out=path.resolve(arg('out',path.join(repo,'docs/evidence/final_a/stage5')));await mkdir(out,{recursive:true});
 const continueAfterEnding=process.argv.includes('--post-ending');
 let tasks=personas.flatMap(persona=>Array.from({length:seeds},(_,i)=>paired?[{root:path.resolve(paired),label:'before',persona,seed:i+1,maxDays,continueAfterEnding},{root,label:'after',persona,seed:i+1,maxDays,continueAfterEnding}]:[{root,label,persona,seed:i+1,maxDays,continueAfterEnding}]).flat());const rows=[];let next=0;
 const checkpoint=path.join(out,paired?'paired-checkpoint.ndjson':label+'-checkpoint.ndjson');
 if(process.argv.includes('--resume')){let prior='';try{prior=await readFile(checkpoint,'utf8');}catch{}for(const line of prior.split('\n').filter(Boolean)){const r=JSON.parse(line);if(!r.fatal&&(!process.argv.includes('--invalidate-after')||r.label!=='after'))rows.push(r);}await writeFile(checkpoint,rows.map(r=>JSON.stringify(r)+'\n').join(''));const keys=new Set(rows.map(r=>`${r.label}|${r.persona}|${r.seed}`));tasks=tasks.filter(t=>!keys.has(`${t.label}|${t.persona}|${t.seed}`));console.log(`resumed ${rows.length} valid careers; ${tasks.length} pending`);}else await writeFile(checkpoint,'');
 const total=rows.length+tasks.length;
 await writeFile(path.join(out,paired?'paired-run-manifest.json':label+'-run-manifest.json'),JSON.stringify({startedAt:new Date().toISOString(),root,pairedRoot:paired&&path.resolve(paired),jobs:Number(arg('jobs',4)),personas:CAREER_PERSONAS,seeds,maxDays,continueAfterEnding,total,resumed:rows.length,policyVersion:'FINAL-A.fresh.v2'},null,1)+'\n');
 await Promise.all(Array.from({length:Math.min(Number(arg('jobs',4)),tasks.length)},()=>new Promise((resolve,reject)=>{
  const w=fork(file,['--worker'],{stdio:['ignore','ignore','inherit','ipc']});let finished=false;
  const give=()=>{if(next>=tasks.length){finished=true;w.kill();resolve();}else w.send(tasks[next++]);};
  w.on('message',async r=>{if(!r.ready){rows.push(r);await appendFile(checkpoint,JSON.stringify(r)+'\n');console.log(`${r.label} ${r.persona}/${r.seed} ended ${r.endingDay??'FAIL'} (${rows.length}/${total})`);}give();});
  w.on('error',reject);w.on('exit',code=>{if(!finished)reject(new Error(`worker terminated ${code}`));});
 })));
 for(const outputLabel of [...new Set(rows.map(r=>r.label))]){
 const group=rows.filter(r=>r.label===outputLabel).sort((a,b)=>a.persona.localeCompare(b.persona)||a.seed-b.seed);
 const healthy=group.filter(r=>!r.fatal),ids=[...new Set(healthy.flatMap(r=>r.openIds))].sort();
 const exposure=ids.map(id=>({id,offeredLives:healthy.filter(r=>r.offered[id]).length,completedLives:healthy.filter(r=>r.completed[id]).length,firstOfferDay:Math.min(...healthy.filter(r=>r.offered[id]).map(r=>r.offered[id].day))}));
 const summary={lives:group.length,personas:personas.length,seeds,fullCareers:healthy.filter(r=>r.endingDay).length,fatal:group.filter(r=>r.fatal).length,errors:healthy.reduce((n,r)=>n+r.errors.length,0),softlocks:healthy.reduce((n,r)=>n+r.softlocks.length,0),openAdventures:ids.length,offered:exposure.filter(r=>r.offeredLives).length,completed:exposure.filter(r=>r.completedLives).length,endingDays:[...new Set(healthy.map(r=>r.endingDay))].sort((a,b)=>a-b),warRoomLives:healthy.filter(r=>r.warRoomFirstDay).length};
 await writeFile(path.join(out,outputLabel+'.json'),JSON.stringify({label:outputLabel,method:'fresh-save route-driven OPEN career; real ending eligibility, actual F01/F05 operations; declared synthetic minigame/fight skill results and paid legacy-rave/JDM/property completion seams',summary,exposure,rows:group},null,1)+'\n');
 console.log(JSON.stringify(summary));
 if(summary.fatal||summary.softlocks)process.exitCode=1;
 }
}
