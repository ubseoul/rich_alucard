// OL-016 tuned-sim run: 800-PLAY matrix on the shared engine + careers on the shared world. Prints T1-T5, T9, R1, the strict-call skill gap, win bands.
import fs from 'node:fs';import path from 'node:path';
import {OUT,QUICK,JOBS,SEEDS,REP_SEEDS,mean,pct,f2,matrix,metrics,decorate,by,cnt} from './metrics.mjs';
import {POLICY_NAMES} from './policy.mjs';
import {runCareer} from './campaign.mjs';
import {lineKey,LINES} from '../../../../js/frag/F01/play/lines.mjs';
const T0=Date.now();const log=(...a)=>console.log(...a,`(${Date.now()-T0} ms)`);
const CAREERS=QUICK?10:40,NIGHTS=24;
const OD=path.join(OUT,'tuned');fs.mkdirSync(OD,{recursive:true});
const primary=decorate(matrix(SEEDS));const PM=metrics(primary);log('primary',primary.length);
const rep=decorate(matrix(REP_SEEDS));const RM=metrics(rep);log('replicate baseline');
const repOff=decorate(matrix(REP_SEEDS,{calls:false}));const ROFF=metrics(repOff);log('calls off');
// careers
const careers={};
for(const pol of POLICY_NAMES){careers[pol]=[];for(let s=1;s<=CAREERS;s++)careers[pol].push(runCareer({seed:s+POLICY_NAMES.indexOf(pol)*1000,nights:NIGHTS,policy:pol}));log('careers',pol);}
const arm=(pol,o)=>{const a=[];for(let s=1;s<=CAREERS;s++)a.push(runCareer({seed:s+POLICY_NAMES.indexOf(pol)*1000,nights:NIGHTS,policy:pol,...o}));return a;};
const brakesOff={random:arm('random',{brakes:false})};
const armsRandom={'all OL-016 brakes':careers.random,'no EXTRACT/RANSOM brakes':brakesOff.random,'no last-stand bail-out':arm('random',{opts:{noBail:true}}),'neither (approved sim rules)':arm('random',{brakes:false,opts:{noBail:true}})};
log('retention arms');
const career=(cs)=>{const recs=cs.flatMap(c=>c.recs);return {careers:cs.length,plays:recs.length,rosterEnd:mean(cs.map(c=>c.state.roster.length)),rosterGE6:mean(cs.map(c=>c.state.roster.length>=6?1:0)),minRoster:Math.min(...cs.map(c=>c.state.roster.length)),lostPerCareer:mean(cs.map(c=>c.state.gone.length)),lostNamed:mean(cs.map(c=>c.state.gone.filter(id=>!id.startsWith('g')).length)),
 ransomPaid:mean(cs.map(c=>c.state.stats.ransomsPaid)),extractWins:mean(cs.map(c=>c.state.stats.extractWins)),extracts:mean(cs.map(c=>c.state.stats.extracts)),readyMean:mean(cs.flatMap(c=>c.boards.map(b=>b.ready))),readyLt4:mean(cs.flatMap(c=>c.boards.map(b=>b.ready<4?1:0))),skipped:mean(cs.map(c=>c.boards.filter(b=>b.skipped).length)),cash:mean(cs.map(c=>c.state.cash)),win:mean(recs.map(r=>r.win?1:0))};};
const CRarms=()=>Object.fromEntries(Object.entries(armsRandom).map(([k,cs])=>[k,career(cs)]));
const CR=Object.fromEntries(POLICY_NAMES.map(p=>[p,career(careers[p])]));const CRoff=career(brakesOff.random);
// T9: line repeats inside a career (no line may repeat within 3 PLAYs) + coverage + variety
function lineStats(){
 let uses=0,viol=0;const perKey={};
 for(const pol of POLICY_NAMES)for(const c of careers[pol]){const seq=c.recs.map(r=>r.lineLog||[]);
  seq.forEach((ids,i)=>{for(const id of ids){uses++;perKey[id]=(perKey[id]||0)+1;const key=id.split('#')[0];const n=(LINES[key]||[]).length;
   for(let d=1;d<=3&&i-d>=0;d++)if(seq[i-d].includes(id)){ // a repeat is only a violation when the trigger had a free variant
    const usedNow=ids.filter(x=>x.startsWith(key+'#')).length;if(n>=4&&usedNow<=1){viol++;}break;}}});}
 const keys=new Set(primary.flatMap(r=>r.moments.map(m=>m.k)).filter(Boolean));
 const uncovered=[...keys].filter(k=>!lineKey(k));
 const thin=Object.entries(LINES).filter(([k,v])=>v.length<4).map(([k])=>k);
 const shown=primary.flatMap(r=>r.moments.map(m=>m.t));const freq=cnt(shown.map(t=>({t})),o=>o.t);const top=Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,8);
 return {uses,violationsIn3:viol,triggersSeen:keys.size,uncoveredTriggers:uncovered,thinKeys:thin,distinctLinesShown:Object.keys(freq).length,shownTotal:shown.length,topLineShare:top.length?top[0][1]/shown.length:0,top};
}
const LS=lineStats();
// tuned-run numbers vs the approved baseline (fb3ff8a)
const gap=RM.variance.gapCarefulNaive,gapOff=ROFF.variance.gapCarefulNaive;
const P=(k)=>PM.byPolicy[k];
const T={
 T1_genericDeath:{now:PM.generics.anyDeath,was:.249,target:'10–12%'},
 T2_namedCaptured:{now:PM.named.anyCaptured,was:.180,target:'≤ 8%'},
 T3_split:{now:PM.car.split,was:.018,target:'4–6%',byCar:Object.fromEntries(Object.entries(PM.car.byCar).map(([k,v])=>[k,v.split]))},
 T4_hitOneMore:{steps:PM.climb.byStep,was:{1:{ev:11.2,rel:.218},2:{ev:-35.5,rel:-.293},3:{ev:-102.2,rel:-.644}},target:'step1 +EV; step2 −10%..0% of pot & ~15% jackpot; step3 clearly negative + LEGENDARY on success'},
 T5_playerAttributable:{now:PM.losses.blameStrict,was:.185,target:'≥ 35%'},
 T9_lines:LS,
 R1_retention:{careers:CR,randomArms:CRarms(),brakesOffRandom:CRoff,was:{randomRosterEnd:2.25},target:'random ≥ 6 of 9'},
 skillGap:{strict:gap,callsOff:gapOff,atLoose:.58,target:'≥ 0.4'},
 winBands:{careful:P('careful').win,naive:P('naive').win,gap:P('careful').win-P('naive').win,random:P('random').win,greedy:P('greedy').win,target:'careful 70–85, naive 55–70, gap ≥ 12 pts'}
};
fs.writeFileSync(path.join(OD,'tuned_summary.json'),JSON.stringify({T,metrics:PM,repMetrics:RM},null,1));
const jp=(k)=>{const a=PM.climb.byStep[k];return a;};
console.log('\n=== TUNED SIM ===');
console.log('T1 generic death (PLAYs w/ generics aboard):',pct(T.T1_genericDeath.now),'| was 24.9% | target 10–12%');
console.log('T2 named CAPTURED (share of PLAYs):',pct(T.T2_namedCaptured.now),'| was 18.0% | target ≤8%');
console.log('T3 SPLIT:',pct(T.T3_split.now),'by car',JSON.stringify(Object.fromEntries(Object.entries(T.T3_split.byCar).map(([k,v])=>[k,pct(v)]))),'| was 1.8% | target 4–6%');
for(const k of [1,2,3]){const s=PM.climb.byStep[k];console.log(`T4 step ${k}: n=${s.n} P(success)=${pct(s.p)} pot=${f2(s.before)} EV=${f2(s.ev)} (${pct(s.evRel)} of pot mean-rel)`);}
{const sh=primary.flatMap(r=>r.shadow).filter(s=>s.k===2);console.log('   step-2 visible jackpot share:',pct(mean(sh.map(s=>s.jp?1:0))),'| step-2 aggregate EV/pot:',pct(sh.reduce((a,s)=>a+(s.ok?s.after-s.before:-s.before),0)/sh.reduce((a,s)=>a+s.before,0)));
 const s3=primary.flatMap(r=>r.shadow).filter(s=>s.k===3);console.log('   step-3 aggregate EV/pot:',pct(s3.reduce((a,s)=>a+(s.ok?s.after-s.before:-s.before),0)/Math.max(1,s3.reduce((a,s)=>a+s.before,0))));
 const s1=primary.flatMap(r=>r.shadow).filter(s=>s.k===1);console.log('   step-1 aggregate EV/pot:',pct(s1.reduce((a,s)=>a+(s.ok?s.after-s.before:-s.before),0)/s1.reduce((a,s)=>a+s.before,0)));}
{const L=primary.flatMap(r=>r.losses);const by={};for(const l of L){const k=l.cause?l.cause.c+': '+(l.cause.t||'').slice(0,46):'NONE';by[k]=(by[k]||0)+1;}const top=Object.entries(by).sort((a,b)=>b[1]-a[1]).slice(0,10);console.log('   top loss causes:',top.map(([k,v])=>k+' '+v).join(' | '));}
console.log('T5 player-attributable losses:',pct(PM.losses.blameStrict),'| was 18.5% | target ≥35%; causes',JSON.stringify(PM.losses.byCause));
console.log('T9 lines: repeats-within-3:',LS.violationsIn3,'of',LS.uses,'uses | uncovered triggers',JSON.stringify(LS.uncoveredTriggers),'| thin keys',JSON.stringify(LS.thinKeys),'| distinct lines',LS.distinctLinesShown,'top share',pct(LS.topLineShare),JSON.stringify(LS.top.slice(0,3)));
for(const p of POLICY_NAMES)console.log('R1',p.padEnd(8),'roster end',f2(CR[p].rosterEnd),'of 9 | ≥6:',pct(CR[p].rosterGE6,0),'| min',CR[p].minRoster,'| lost/career',f2(CR[p].lostPerCareer),'(named',f2(CR[p].lostNamed)+')','| ransom paid',f2(CR[p].ransomPaid),'| extract wins',f2(CR[p].extractWins),'/',f2(CR[p].extracts),'| READY',f2(CR[p].readyMean),'| cash',Math.round(CR[p].cash));
for(const [k,v] of Object.entries(CRarms()))console.log('R1 random arm:',k.padEnd(30),'roster end',f2(v.rosterEnd),'| ≥6:',pct(v.rosterGE6,0),'| min',v.minRoster,'| lost/career',f2(v.lostPerCareer));
console.log('skill gap strict:',f2(gap),'| calls off:',f2(gapOff),'| calls/PLAY',f2(RM.calls.surfacedPerPlay));
console.log('win bands: careful',pct(P('careful').win),'naive',pct(P('naive').win),'gap',f2((P('careful').win-P('naive').win)*100),'pts | random',pct(P('random').win),'greedy',pct(P('greedy').win),'| wash careful/naive',pct(P('careful').wash),pct(P('naive').wash));
console.log('nothing-happened strict:',pct(PM.nothing),'| story-beat',pct(PM.storyGrade),'| blame broad',pct(PM.losses.blameBroad),'| funny/dramatic',pct(PM.losses.funnyOrDramatic),'| retaliation share',pct((PM.temptation.RETALIATION||0)/PM.n));
console.log('temptations',JSON.stringify(PM.temptation));

// ---- OL-020: BAILED rate by policy + invariants + T9 pool sizing (pool must exceed 3 x max uses of that trigger in one PLAY)
{
 const allCareerRecs=POLICY_NAMES.flatMap(pol=>careers[pol].flatMap(c=>c.recs));
 const rate=(recs)=>recs.length?recs.filter(r=>r.bailed).length/recs.length:0;
 console.log('BAILED rate (800-PLAY matrix) by policy:',POLICY_NAMES.map(pl=>pl+' '+pct(rate(primary.filter(r=>r.policy===pl)))).join(' | '),'| all',pct(rate(primary)),'('+primary.filter(r=>r.bailed).length+' of '+primary.length+')');
 console.log('BAILED rate (careers) by policy:',POLICY_NAMES.map(pl=>pl+' '+pct(rate(careers[pl].flatMap(c=>c.recs)))).join(' | '),'| all',pct(rate(allCareerRecs)));
 const bigIds=new Set(JOBS.filter(j=>j.bigPlay).map(j=>j.id)),defIds=new Set(JOBS.filter(j=>j.defense).map(j=>j.id));
 const bad=[];
 for(const r of [...primary,...allCareerRecs].filter(r=>r.bailed)){
  const fs=Object.values(r.finalStatus);
  if(bigIds.has(r.job))bad.push('BIG PLAY bailed');if(defIds.has(r.job))bad.push('HOLD THE HOUSE bailed');
  if(r.crew.length<2)bad.push('crew<2');
  if(r.robbed)bad.push('robbed set');if(r.getaway!=='BAILED')bad.push('getaway kind '+r.getaway);
  if(fs.some(x=>['CAPTURED','DEAD','GONE','SHOT'].includes(x)))bad.push('capture/death/shot on BAILED');
  if(r.win)bad.push('counted as win');if(r.pot.cash||r.pot.crates.length)bad.push('pot survived');
  if(r.losses.some(l=>l.kind==='ROBBED'))bad.push('ROBBED loss on BAILED');
  if(r.heatDelta!==(JOBS.find(j=>j.id===r.job)||{heat:r.heatDelta}).heat&&r.job!=='extract')bad.push('heat bonus applied');
  if(fs.filter(x=>x==='READY'||x==='WOUNDED').length!==fs.length)bad.push('odd status');
  if(r.morning&&r.morning.temptation&&r.morning.temptation.type==='RETALIATION')bad.push('retaliation after BAILED');
 }
 console.log('BAILED invariants (BIG PLAY/HOLD excluded, crew>=2, no capture/death/shot, not robbed, pot lost, base heat only, no retaliation):',bad.length?'VIOLATIONS '+JSON.stringify([...new Set(bad)]):'0 violations over '+[...primary,...allCareerRecs].filter(r=>r.bailed).length+' BAILED PLAYs');
 {
 const cap=(recs)=>recs.length?recs.filter(r=>r.namedCaptured>0).length/recs.length:0;
 const byJob=Object.fromEntries(JOBS.map(j=>[j.id+(j.bigPlay?'[BIG PLAY]':j.defense?'[HOLD]':''),pct(cap(primary.filter(r=>r.job===j.id)))]));
 const routine=primary.filter(r=>!bigIds.has(r.job)&&!defIds.has(r.job));
 console.log('T2 named CAPTURED by job:',JSON.stringify(byJob),'| routine offense only',pct(cap(routine)),'| BIG PLAY + HOLD only',pct(cap(primary.filter(r=>bigIds.has(r.job)||defIds.has(r.job)))));
 console.log('WASH rate by job class: routine',pct(routine.filter(r=>r.klass==='WASH').length/routine.length),'| BIG PLAY + HOLD',pct(primary.filter(r=>bigIds.has(r.job)||defIds.has(r.job)).filter(r=>r.klass==='WASH').length/primary.filter(r=>bigIds.has(r.job)||defIds.has(r.job)).length));
 }
 {
 const cap2=(recs)=>recs.length?recs.filter(r=>r.namedCaptured>0).length/recs.length:0;
 const routine=primary.filter(r=>!bigIds.has(r.job)&&!defIds.has(r.job)),big=primary.filter(r=>bigIds.has(r.job)),hold=primary.filter(r=>defIds.has(r.job));
 console.log('OL-022 T2 BANDS: routine offense',pct(cap2(routine)),'(target <=8%) | BIG PLAY',pct(cap2(big)),'(target <=20%) | HOLD THE HOUSE',pct(cap2(hold)),'(target <=8%)');
 const wr=(recs,pol)=>{const a=recs.filter(r=>r.policy===pol);return a.length?a.filter(r=>r.win).length/a.length:0;};
 console.log('HOLD THE HOUSE win rate: careful',pct(wr(hold,'careful')),'naive',pct(wr(hold,'naive')),'greedy',pct(wr(hold,'greedy')),'random',pct(wr(hold,'random')),'| n',hold.length,'| FELL BACK rate',pct(hold.filter(r=>r.fellBack).length/hold.length),'| WASH rate',pct(hold.filter(r=>r.klass==='WASH').length/hold.length));
 const fb=[...primary,...allCareerRecs].filter(r=>r.fellBack),fbBad=[];
 for(const r of fb){const fs=Object.values(r.finalStatus);
  if(!defIds.has(r.job))fbBad.push('FALL BACK outside defense');if(bigIds.has(r.job))fbBad.push('FALL BACK on BIG PLAY');
  if(r.bailed)fbBad.push('BAILED contamination');if(r.robbed)fbBad.push('robbed set');if(r.losses.some(l=>l.kind==='ROBBED'||l.kind==='BAILED'))fbBad.push('ROBBED/BAILED loss entry');
  if(r.crew.length<2)fbBad.push('crew<2');if(r.getaway!=='FALL_BACK')fbBad.push('getaway kind '+r.getaway);if(r.klass!=='FELL_BACK'||r.win)fbBad.push('klass/win');
  if(fs.some(x=>['CAPTURED','DEAD','GONE','SHOT'].includes(x)))fbBad.push('capture/death/shot');
  if(r.pot.cash||r.pot.crates.length)fbBad.push('product survived');if(r.heatDelta!==(JOBS.find(j=>j.id===r.job)||{}).heat)fbBad.push('heat');}
 const bailedOnDefense=[...primary,...allCareerRecs].filter(r=>r.bailed&&defIds.has(r.job)).length;
 console.log('FALL BACK by policy (HOLD matrix):',POLICY_NAMES.map(pl=>pl+' '+pct(hold.filter(r=>r.policy===pl&&r.fellBack).length/Math.max(1,hold.filter(r=>r.policy===pl).length))).join(' | '),'| careers all',fb.filter(r=>!primary.includes(r)).length,'FELL BACK PLAYs');
 console.log('FALL BACK invariants (defense only, never offense/BIG PLAY, not BAILED/ROBBED, 0 capture/death/shot, product lost, base heat, exact klass):',fbBad.length?'VIOLATIONS '+JSON.stringify([...new Set(fbBad)]):'0 violations over '+fb.length+' FELL BACK PLAYs','| BAILED on defense:',bailedOnDefense);
 }
 // T9 pool sizing
 const maxUse={};for(const r of [...primary,...allCareerRecs]){const c={};for(const id of (r.lineLog||[])){const k=id.split('#')[0];c[k]=(c[k]||0)+1;}for(const [k,v] of Object.entries(c))maxUse[k]=Math.max(maxUse[k]||0,v);}
 const short=Object.entries(maxUse).filter(([k,m])=>(LINES[k]||[]).length<=3*m).map(([k,m])=>k+' pool '+(LINES[k]||[]).length+' <= 3x'+m);
 console.log('T9 pool sizing (pool > 3 x max uses per PLAY):',short.length?short.length+' short: '+short.join('; '):'all '+Object.keys(maxUse).length+' triggers satisfy it');
}
log('done');
