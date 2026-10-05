#!/usr/bin/env node
// Derive tables from persisted observations; absent observations never become zero-day access.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {CAREER_PERSONAS} from './_career.mjs';
const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const arg=(k,d)=>{const i=process.argv.indexOf('--'+k);return i<0?d:process.argv[i+1];};
const out=path.resolve(arg('out',path.join(repo,'docs/evidence/final_a/stage5')));
const checkpoint=path.resolve(arg('checkpoint',path.join(out,'paired-checkpoint.ndjson')));
const raw=await readFile(checkpoint,'utf8'),lines=raw.split('\n');
// A live worker may still be appending its final line. Only newline-terminated observations enter a snapshot.
if(!raw.endsWith('\n'))lines.pop();
const rows=lines.filter(Boolean).map(JSON.parse);
const expected=Number(arg('expected',360)),healthy=rows.filter(r=>!r.fatal);
const values=xs=>xs.filter(x=>Number.isFinite(x)).sort((a,b)=>a-b);
const stats=xs=>{const a=values(xs),n=a.length;return {n,median:n?(n%2?a[(n-1)/2]:(a[n/2-1]+a[n/2])/2):null,min:n?a[0]:null,max:n?a.at(-1):null};};
const csv=(header,table)=>[header,...table].map(row=>row.map(v=>{const s=v==null?'':String(v);return /[",\r\n]/.test(s)?'"'+s.replaceAll('"','""')+'"':s;}).join(',')).join('\n')+'\n';
const col=s=>[s.n,s.median,s.min,s.max];
const order=label=>label==='before'?0:label==='after'?1:2;
const labels=[...new Set(rows.map(r=>r.label))].sort((a,b)=>order(a)-order(b)||a.localeCompare(b));
const postEnding=labels.length===1&&labels[0].startsWith('post-ending');
const ids=[...new Set(healthy.flatMap(r=>r.openIds||[]))].sort();
const exposure=ids.map(id=>Object.assign({id},...labels.map(label=>{const group=healthy.filter(r=>r.label===label),offered=group.filter(r=>r.offered[id]);return {[label]:{lives:group.length,offered:offered.length,completed:group.filter(r=>r.completed[id]).length,firstOfferDay:offered.length?Math.min(...offered.map(r=>r.offered[id].day)):null}};})));
const metrics=[];
for(const label of labels)for(const persona of Object.keys(CAREER_PERSONAS)){
 const group=healthy.filter(r=>r.label===label&&r.persona===persona);if(!group.length)continue;
 const maxRel=r=>Math.max(0,...Object.values(r.relationships||{}).map(x=>x.level));
 const hall=group.filter(r=>Number.isFinite(r.ownership?.['room:party_hall']));
 metrics.push({label,persona,lives:group.length,ending:stats(group.map(r=>r.endingDay)),finalDay:stats(group.map(r=>r.final.day)),cash:stats(group.map(r=>r.final.money)),netWorth:stats(group.map(r=>r.final.netWorth)),elapsed:stats(group.map(r=>r.elapsedSeconds)),rooms:stats(group.map(r=>r.daily.at(-1)?.rooms)),cars:stats(group.map(r=>r.daily.at(-1)?.cars)),partyHallRecordedEligibility:stats(group.map(r=>r.firstEligible?.['room:party_hall'])),partyHallEndOfDayCash250k:stats(group.map(r=>r.daily.find(d=>d.money>=250000)?.day)),partyHallPurchase:stats(hall.map(r=>r.ownership['room:party_hall'])),partyHallBy30:hall.filter(r=>r.ownership['room:party_hall']<=30).length,partyHallPreEnding:hall.filter(r=>r.ownership['room:party_hall']<r.endingDay).length,level3Lives:group.filter(r=>maxRel(r)>=3).length,level4Lives:group.filter(r=>maxRel(r)>=4).length,relationMax:stats(group.map(maxRel)),warRoomAccepted:group.filter(r=>r.warRoomFirstDay).length,warRoomFirstDay:stats(group.map(r=>r.warRoomFirstDay)),playCalls:stats(group.map(r=>r.final.playCalls))});
}
const ownership=[];
for(const label of labels)for(const persona of Object.keys(CAREER_PERSONAS)){
 const group=healthy.filter(r=>r.label===label&&r.persona===persona);if(!group.length)continue;
 const items=[...new Set(group.flatMap(r=>Object.keys(r.ownership||{})))].sort();
 for(const item of items){const purchased=group.filter(r=>Number.isFinite(r.ownership[item]));ownership.push({label,persona,item,lives:group.length,purchased:purchased.length,beforeEnding:purchased.filter(r=>r.ownership[item]<r.endingDay).length,day:stats(purchased.map(r=>r.ownership[item])),recordedEligibility:stats(group.map(r=>r.firstEligible?.[item]))});}
}
const errors=rows.flatMap(r=>[...(r.fatal?[{label:r.label,persona:r.persona,seed:r.seed,fatal:r.fatal}]:[]),...(r.errors||[]).map(e=>({label:r.label,persona:r.persona,seed:r.seed,...e})),...(r.softlocks||[]).map(e=>({label:r.label,persona:r.persona,seed:r.seed,softlock:true,...e}))]);
const status={generatedAt:new Date().toISOString(),scope:postEnding?'separate post-ending route census':'paired first-ending population',expected,completed:rows.length,complete:rows.length===expected,healthy:healthy.length,fatal:rows.filter(r=>r.fatal).length,errors:healthy.reduce((n,r)=>n+(r.errors||[]).length,0),softlocks:healthy.reduce((n,r)=>n+(r.softlocks||[]).length,0),endingDays:[...new Set(healthy.map(r=>r.endingDay))].sort((a,b)=>a-b),finalDays:[...new Set(healthy.map(r=>r.final.day))].sort((a,b)=>a-b),openAdventures:ids.length,labels:labels.map(label=>({label,lives:healthy.filter(r=>r.label===label).length,offered:exposure.filter(x=>x[label].offered>0).length,completed:exposure.filter(x=>x[label].completed>0).length,neverOffered:exposure.filter(x=>!x[label].offered).map(x=>x.id)}))};
await mkdir(out,{recursive:true});
await writeFile(path.join(out,'population-status.json'),JSON.stringify(status,null,1)+'\n');
await writeFile(path.join(out,'population-tables.json'),JSON.stringify({status,metrics,ownership,exposure,errors},null,1)+'\n');
await writeFile(path.join(out,'exposure.csv'),csv(['adventure',...labels.flatMap(l=>[l+'_lives',l+'_offered_lives',l+'_completed_lives',l+'_first_offer_day'])],exposure.map(x=>[x.id,...labels.flatMap(l=>[x[l].lives,x[l].offered,x[l].completed,x[l].firstOfferDay])])));
const names=['ending','finalDay','cash','netWorth','elapsed','rooms','cars','partyHallRecordedEligibility','partyHallEndOfDayCash250k','partyHallPurchase','relationMax','warRoomFirstDay','playCalls'];
await writeFile(path.join(out,'personas.csv'),csv(['label','persona','lives',...names.flatMap(n=>[n+'_n',n+'_median',n+'_min',n+'_max']),'partyHallBy30','partyHallPreEnding','level3Lives','level4Lives','warRoomAccepted'],metrics.map(x=>[x.label,x.persona,x.lives,...names.flatMap(n=>col(x[n])),x.partyHallBy30,x.partyHallPreEnding,x.level3Lives,x.level4Lives,x.warRoomAccepted])));
await writeFile(path.join(out,'ownership.csv'),csv(['label','persona','item','lives','purchased','beforeEnding','purchase_n','purchase_median','purchase_min','purchase_max','recordedEligibility_n','recordedEligibility_median','recordedEligibility_min','recordedEligibility_max'],ownership.map(x=>[x.label,x.persona,x.item,x.lives,x.purchased,x.beforeEnding,...col(x.day),...col(x.recordedEligibility)])));
await writeFile(path.join(out,'money-by-day.csv'),csv(['label','persona','seed','day','money','netWorth','rooms','cars','trapHouses','newOgaRank','warRoom'],healthy.flatMap(r=>r.daily.map(d=>[r.label,r.persona,r.seed,d.day,d.money,d.netWorth,d.rooms,d.cars,d.trapHouses,d.newOgaRank,d.warRoom]))));
const daily=[];for(const label of labels)for(const persona of Object.keys(CAREER_PERSONAS)){
 const group=healthy.filter(r=>r.label===label&&r.persona===persona),days=[...new Set(group.flatMap(r=>r.daily.map(d=>d.day)))].sort((a,b)=>a-b);
 for(const day of days){const observations=group.map(r=>r.daily.find(d=>d.day===day)).filter(Boolean);daily.push([label,persona,day,observations.length,...col(stats(observations.map(d=>d.money))),...col(stats(observations.map(d=>d.netWorth)))]);}
}
await writeFile(path.join(out,'money-by-day-summary.csv'),csv(['label','persona','day','lives','money_n','money_median','money_min','money_max','netWorth_n','netWorth_median','netWorth_min','netWorth_max'],daily));
await writeFile(path.join(out,'relationships.csv'),csv(['label','persona','seed','person','highestLevel','dates','firstCloseDay','firstRideDay'],healthy.flatMap(r=>Object.entries(r.relationships||{}).map(([id,x])=>[r.label,r.persona,r.seed,id,x.level,x.dates,x.firstClose,x.firstRide]))));
const money=s=>s.n?`$${Math.round(s.median).toLocaleString('en-US')} ($${s.min.toLocaleString('en-US')}–$${s.max.toLocaleString('en-US')})`:'—';
const days=s=>s.n?`${s.median} (${s.min}–${s.max}); n=${s.n}`:'not observed';
const table=metrics.map(x=>`| ${x.label} | ${x.persona} | ${x.lives} | ${days(x.ending)} | ${money(x.cash)} | ${money(x.netWorth)} | ${days(x.partyHallPurchase)} | ${x.partyHallBy30}/${x.lives} | ${x.level3Lives}/${x.lives}; ${x.level4Lives}/${x.lives} |`).join('\n');
const report=`# Population observations\n\nStatus: **${status.complete?'COMPLETE':'IN PROGRESS'}**, ${rows.length}/${expected} persisted careers. Generated ${status.generatedAt}. ${status.fatal} fatal errors, ${status.errors} recorded branch errors, ${status.softlocks} pending-play observations.\n\nThis table reports actual first ending boundaries, final liquid cash and net worth, recorded paid PARTY HALL purchases, and the highest relationship level actually observed. Purchase days include only lives that bought the item; absence is not an unreachable verdict. Median and range appear in parentheses.\n\n| Build | Policy | Lives | Ending day | Cash median (range) | Net worth median (range) | PARTY HALL purchase day | Hall by Day30 | Relationship≥3; ≥4 |\n|---|---|---:|---|---|---|---|---|---|\n${table}\n\nExposure census: ${ids.length} OPEN runtime definitions.\n\n${status.labels.map(x=>`- ${x.label}: ${x.lives} lives; ${x.offered}/${ids.length} offered, ${x.completed}/${ids.length} completed. Unobserved: ${x.neverOffered.join(', ')||'none'}.`).join('\n')}\n\nThe CSV files include each adventure's offered/completed life counts, each policy's ownership timing, upper room/car counts, real PLAY usage and War Room acceptance, relationship levels, and elapsed time. Exact first-eligibility tracking applies to intended policy purchases. The separate end-of-day cash≥$250,000 observation is a liquidity observation and does not assert that every room prerequisite was satisfied. The ownership table records confirmed policy purchases, not a complete inventory snapshot of every incidental adventure award.\n\nThis headless population uses declared branch-result substitutions and does not establish browser or minigame input stability. Post-ending continuation belongs in a separate census and does not change the main first-ending metric.\n`;
const scopedReport=postEnding?report.replace('# Population observations','# Continuation observations').replace('This table reports','This is the **separate post-ending route census through Day70**. First ending days are retained, while final cash, net worth, rooms/cars and highest relationship levels include the continuation. Final state cursor days: '+status.finalDays.join(', ')+'. These results are excluded from the main before/after population.\n\nThis table reports').replace('Post-ending continuation belongs in a separate census and does not change the main first-ending metric.','These continuation observations do not change the main first-ending metrics.'):report;
await writeFile(path.join(out,'population-report.md'),scopedReport);
console.log(JSON.stringify(status));
