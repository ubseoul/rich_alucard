#!/usr/bin/env node
// F13 balance population runner. Plays every persona over the same deterministic seeds (paired), in parallel worker processes,
// and writes a compact JSON (one row per campaign + per-persona distributions) plus a text digest.
//   node tools/tests/f13/run.mjs --label baseline [--seeds 10] [--days 42] [--jobs 4] [--personas a,b] [--mode api|ui]
// Output: tools/tests/f13/out/<label>.json and <label>.txt. Same code + same arguments -> byte-identical output.
import {fork} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));const root=path.resolve(here,'..','..','..');
const arg=(k,d)=>{const i=process.argv.indexOf('--'+k);return i<0?d:process.argv[i+1];};

// ---- worker: run the campaigns it is handed and send back compact rows
if(process.argv.includes('--worker')){
 const {campaign}=await import('./_campaign.mjs');
 process.on('message',async ({persona,seed,days,mode})=>{
  const m=await campaign(root,{persona,seed,days,mode});
  process.send(row(m));
 });
 process.send({ready:true});
}
function row(m){
 const ww=m.final.ledger.war_room||{in:0,out:0,net:0},tr=m.final.ledger.trap||{in:0,out:0,net:0};
 const d=m.daily;const at=day=>(d.find(x=>x.day===day)||d.at(-1)).money;
 return {persona:m.persona,seed:m.seed,days:m.days,final:m.final.money,minMoney:m.minMoney,net:m.final.money-100000,
  money:{d23:at(23),d30:at(30),d37:at(37),d44:at(44),d58:at(58)},
  warRoom:{in:ww.in,out:ww.out,plays:m.plays.run,noCarDay:m.plays.firstRefusal.NO_CAR||m.plays.firstRefusal.NO_CAR_FITS||null,playErrorDay:m.plays.firstRefusal.PLAY_ERROR||null,f01Crashes:(m.f01Crashes||[]).length,carsLost:(m.cars||{}).lost||0,carsRecovered:(m.cars||{}).recovered||0,firstCarLossDay:(m.cars||{}).firstLossDay||null,gainAfterCarLoss:(m.cars||{}).gainAfterLoss||0,gainAllPlays:(m.cars||{}).gainAll||0,lastPlayNight:m.plays.byNight.reduce((a,n,i)=>n?i+1:a,0),attempted:m.plays.attempted,refused:m.plays.refused,won:m.plays.won,maxPerNight:Math.max(0,...m.plays.byNight)},
  layLow:{n:m.layLow.n,avgDrop:m.layLow.n?Math.round((m.layLow.heatBefore-m.layLow.heatAfter)/m.layLow.n*10)/10:0},
  trap:{in:tr.in,out:tr.out,houses:m.trap.housesBought.length,cooks:m.trap.cooks,cookRefused:m.trap.cookRefused,casesCooked:m.trap.casesCooked,casesSold:m.trap.casesSold,
   revenue:m.trap.revenue,ingredients:m.trap.ingredientsSpent,upgrades:m.trap.upgradesSpent,level:m.final.level,levelDays:m.trap.levelDays,
   raids:m.trap.raids,firstRaidDay:m.firstRaidDay},
  heat:{peak:m.peakHeat,final:m.final.heat},rain:m.rain,crew:{...m.crew,activeEnd:m.final.ogasActive},
  flows:m.flows,invariants:m.invariants.length,errors:m.errors.length,errorKinds:[...new Set(m.errors.map(e=>e.what+': '+e.error))],softlock:m.softlock.length,digest:m.digest};
}

// ---- parent
if(!process.argv.includes('--worker')){
 const label=arg('label','run');const mode=arg('mode','api');const seeds=Number(arg('seeds',10));const days=Number(arg('days',42));
 const {PERSONAS}=await import('./_campaign.mjs');
 const personas=(arg('personas',null)||Object.keys(PERSONAS).join(',')).split(',');
 const jobs=[];for(const persona of personas)for(let s=1;s<=seeds;s++)jobs.push({persona,seed:s,days,mode});
 const n=Math.min(Number(arg('jobs',os.cpus().length)),jobs.length);const rows=[];let next=0;const t0=Date.now();
 await Promise.all(Array.from({length:n},()=>new Promise((resolve,reject)=>{
  const w=fork(fileURLToPath(import.meta.url),['--worker'],{stdio:['ignore','ignore','inherit','ipc']});
  const give=()=>{if(next>=jobs.length){w.kill();resolve();return;}w.send(jobs[next++]);};
  w.on('message',msg=>{if(!msg.ready){rows.push(msg);process.stderr.write(`\r${rows.length}/${jobs.length}`);}give();});
  w.on('error',reject);w.on('exit',code=>{if(code&&next<jobs.length)reject(new Error('worker exit '+code));});
 })));
 process.stderr.write(`\n${((Date.now()-t0)/1000).toFixed(0)}s\n`);
 rows.sort((a,b)=>a.persona<b.persona?-1:a.persona>b.persona?1:a.seed-b.seed);
 const summary=summarize(rows,personas);
 await mkdir(path.join(here,'out'),{recursive:true});
 await writeFile(path.join(here,'out',label+'.json'),JSON.stringify({label,mode,seeds,days,start:(await import('./_campaign.mjs')).START,summary,rows},null,1)+'\n');
 await writeFile(path.join(here,'out',label+'.txt'),digest(label,summary,seeds,days));
 console.log(digest(label,summary,seeds,days));
}

// ---- distributions
function pct(xs,p){const a=[...xs].sort((x,y)=>x-y);if(!a.length)return 0;return a[Math.min(a.length-1,Math.floor(p*(a.length-1)+.5))];}
function mean(xs){return xs.length?Math.round(xs.reduce((a,b)=>a+b,0)/xs.length):0;}
function dist(xs){return {p10:pct(xs,.1),p50:pct(xs,.5),p90:pct(xs,.9),mean:mean(xs)};}
export function summarize(rows,personas){
 const out={};
 for(const p of personas){const r=rows.filter(x=>x.persona===p);if(!r.length)continue;
  out[p]={n:r.length,final:dist(r.map(x=>x.final)),net:dist(r.map(x=>x.net)),minMoney:dist(r.map(x=>x.minMoney)),
   money:{d23:dist(r.map(x=>x.money.d23)),d30:dist(r.map(x=>x.money.d30)),d44:dist(r.map(x=>x.money.d44))},
   warIn:dist(r.map(x=>x.warRoom.in)),plays:dist(r.map(x=>x.warRoom.plays)),winRate:Math.round(100*r.reduce((a,x)=>a+x.warRoom.won,0)/Math.max(1,r.reduce((a,x)=>a+x.warRoom.plays,0))),
   maxPlaysPerNight:Math.max(...r.map(x=>x.warRoom.maxPerNight)),noCar:{lives:r.filter(x=>x.warRoom.noCarDay).length,day:dist(r.map(x=>x.warRoom.noCarDay||0).filter(Boolean))},cars:{lost:mean(r.map(x=>x.warRoom.carsLost*10))/10,recovered:mean(r.map(x=>x.warRoom.carsRecovered*10))/10,livesWithLoss:r.filter(x=>x.warRoom.firstCarLossDay).length,firstLossDay:dist(r.map(x=>x.warRoom.firstCarLossDay||0).filter(Boolean)),gainAfterLoss:dist(r.map(x=>x.warRoom.gainAfterCarLoss)),shareAfterLoss:Math.round(100*r.reduce((a,x)=>a+x.warRoom.gainAfterCarLoss,0)/Math.max(1,r.reduce((a,x)=>a+(x.warRoom.gainAllPlays||0),0)))},extractCrash:{lives:r.filter(x=>x.warRoom.f01Crashes).length,count:r.reduce((a,x)=>a+x.warRoom.f01Crashes,0)},lastPlayNight:dist(r.map(x=>x.warRoom.lastPlayNight)),refused:mean(r.map(x=>x.warRoom.refused)),
   layLow:{n:mean(r.map(x=>x.layLow.n)),avgDrop:mean(r.filter(x=>x.layLow.n).map(x=>x.layLow.avgDrop))},
   trapIn:dist(r.map(x=>x.trap.in)),trapOut:dist(r.map(x=>x.trap.out)),trapNet:dist(r.map(x=>x.trap.in-x.trap.out)),
   casesSold:dist(r.map(x=>x.trap.casesSold)),cooksPerHouseNight:Math.round(100*mean(r.map(x=>x.trap.cooks))/Math.max(1,mean(r.map(x=>x.trap.houses))*(r[0].days||42)))/100,
   ingredients:dist(r.map(x=>x.trap.ingredients)),upgrades:dist(r.map(x=>x.trap.upgrades)),level:dist(r.map(x=>x.trap.level)),
   l2Day:dist(r.map(x=>Number(x.trap.levelDays[2]||0)).filter(Boolean)),l3Day:dist(r.map(x=>Number(x.trap.levelDays[3]||0)).filter(Boolean)),
   raids:{scheduled:mean(r.map(x=>x.trap.raids.scheduled)),answered:mean(r.map(x=>x.trap.raids.answered)),pendingDays:mean(r.map(x=>x.trap.raids.pendingDays)),
    stashLost:mean(r.map(x=>x.trap.raids.stashLost)),unbankedLost:mean(r.map(x=>x.trap.raids.unbankedLost)),holdNet:mean(r.map(x=>x.trap.raids.holdNet)),
    firstRaidDay:dist(r.map(x=>x.trap.firstRaidDay||0).filter(Boolean)),withRaid:r.filter(x=>x.trap.firstRaidDay).length,
    outcomes:r.reduce((a,x)=>{for(const [k,v] of Object.entries(x.trap.raids.outcomes))a[k]=(a[k]||0)+v;return a;},{})},
   heatPeak:dist(r.map(x=>x.heat.peak)),heatEnd:dist(r.map(x=>x.heat.final)),rainSpent:mean(r.map(x=>x.rain.spent)),
   crew:{gone:mean(r.map(x=>x.crew.gone*100))/100,captured:mean(r.map(x=>x.crew.capturedEvents*100))/100,activeEnd:mean(r.map(x=>x.crew.activeEnd*100))/100},
   invariants:r.reduce((a,x)=>a+x.invariants,0),errors:r.reduce((a,x)=>a+x.errors,0),errorKinds:[...new Set(r.flatMap(x=>x.errorKinds))],softlock:r.reduce((a,x)=>a+x.softlock,0)};}
 return out;
}
function k(n){return Math.abs(n)>=1e6?(n/1e6).toFixed(2)+'M':Math.abs(n)>=1e3?Math.round(n/1e3)+'K':String(n);}
function D(d){return `${k(d.p10)}/${k(d.p50)}/${k(d.p90)}`;}
export function digest(label,S,seeds,days){
 const L=[`F13 balance population — ${label} — ${seeds} seeds x ${days} days per persona (distributions p10/p50/p90)`,''];
 for(const [p,s] of Object.entries(S)){
  L.push(`${p.toUpperCase()}  final ${D(s.final)}  min cash ${D(s.minMoney)}  d23 ${D(s.money.d23)}  d30 ${D(s.money.d30)}`);
  L.push(`  WAR ROOM in ${D(s.warIn)}  PLAYs ${D(s.plays)} win ${s.winRate}%  max/night ${s.maxPlaysPerNight}  refused ${s.refused}  LAY LOW ${s.layLow.n}x avg drop ${s.layLow.avgDrop}`);
  L.push(`  WAR ROOM DEATH  NO_CAR in ${s.noCar.lives}/${s.n} lives (first day ${D(s.noCar.day)})  EXTRACT crashes in ${s.extractCrash.lives}/${s.n} lives (${s.extractCrash.count})  last night with a PLAY ${D(s.lastPlayNight)}`);
  L.push(`  CARS lost ${s.cars.lost} recovered ${s.cars.recovered} (fee 0)  lives with a loss ${s.cars.livesWithLoss}/${s.n} first ${D(s.cars.firstLossDay)}  War Room net after first loss ${D(s.cars.gainAfterLoss)} = ${s.cars.shareAfterLoss}% of War Room income`);
  L.push(`  TRAP in ${D(s.trapIn)} out ${D(s.trapOut)} net ${D(s.trapNet)}  sold ${D(s.casesSold)}  cooks/house-night ${s.cooksPerHouseNight}  ingredients ${D(s.ingredients)}  upgrades ${D(s.upgrades)}  level ${D(s.level)}  L2 day ${D(s.l2Day)} L3 day ${D(s.l3Day)}`);
  L.push(`  RAIDS ${s.raids.withRaid}/${s.n} lives  scheduled ${s.raids.scheduled} answered ${s.raids.answered} pendingDays ${s.raids.pendingDays}  first ${D(s.raids.firstRaidDay)}  stash ${s.raids.stashLost} unbanked ${k(s.raids.unbankedLost)} holdNet ${k(s.raids.holdNet)}  ${JSON.stringify(s.raids.outcomes)}`);
  L.push(`  HEAT peak ${D(s.heatPeak)} end ${D(s.heatEnd)}  CREW gone ${s.crew.gone} captured ${s.crew.captured} activeEnd ${s.crew.activeEnd}  RAIN ${k(s.rainSpent)}  invariants ${s.invariants} softlock ${s.softlock} errors ${s.errors}${s.errorKinds.length?' '+JSON.stringify(s.errorKinds):''}`);
  L.push('');
 }
 return L.join('\n')+'\n';
}
