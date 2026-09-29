// THE PLAY paper-sim runner: 10 job specs × 20 seeds × 4 policies = 800 PLAYs + ablations + BEEF campaigns + 10-night pitch audit.
// Usage: node tools/tests/f01/play-sim/run.mjs [--quick]
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {stream} from './load.mjs';
import {runPlay} from './sim.mjs';
import * as C from './content.mjs';
import {POLICY_NAMES} from './policy.mjs';
import {runCareer,EMO,boardsOnly} from './campaign.mjs';
import {transcript,prose,interest,family} from './story.mjs';

const OUT=path.join(path.dirname(fileURLToPath(import.meta.url)),'out');
fs.mkdirSync(OUT,{recursive:true});
const QUICK=process.argv.includes('--quick');
const JOBS=C.JOBS;
const SEEDS=20,REP_SEEDS=QUICK?20:40,CAREERS=QUICK?8:40,NIGHTS=24,SMOKE=QUICK?300:3000;
const mean=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
const sd=a=>{if(a.length<2)return 0;const m=mean(a);return Math.sqrt(mean(a.map(x=>(x-m)**2)));};
const pct=(x,d=1)=>(100*x).toFixed(d)+'%';
const f2=x=>(+x).toFixed(2);
const SCORE={CLEAN:4,MESSY:3,COSTLY:2,FOLDED:2,GREED:1,ROBBED:1,WASH:0};
const STRICT=new Set(['TRAIT','CHOICE','GREED','CAR','WEAPON','SEAT','RELATIONSHIP']);
const seedOf=(ji,k)=>ji*1000+k;

export function matrix(seeds,opts={}){
 const recs=[];let idx=0;
 for(let ji=0;ji<JOBS.length;ji++)for(const pol of POLICY_NAMES)for(let k=1;k<=seeds;k++){
  const r=runPlay({seed:seedOf(ji,k),job:JOBS[ji],policy:pol,opts});r.idx=idx++;r.k=k;recs.push(r);
 }
 return recs;
}
const by=(a,f)=>{const m={};for(const r of a){const k=f(r);(m[k]=m[k]||[]).push(r);}return m;};
const cnt=(a,f)=>{const m={};for(const r of a){const k=f(r);m[k]=(m[k]||0)+1;}return m;};

const TUP={CALM:['trait:calm:up'],ALWAYS_EATING:['trait:eat:heal'],MOUTHPIECE:['trait:mouth:up'],PHONE_OUT:['trait:phone:up'],SMALL:['trait:small:up','trait:small:dodge'],IMPATIENT:['trait:impatient:up'],DRESSED_TO_KILL:['trait:dressed:up'],CHURCH_SHOES:['trait:church:up'],ROOKIE:['trait:rookie:up'],BIG_POTENTIAL:[],SEEN_IT_ALL:['trait:seen:up'],SIT_DOWN:['trait:sitdown:up'],SKITTISH:['trait:skittish:up'],SHOWBOAT:['trait:showboat:up'],LOYAL:['trait:loyal:up'],STICKY_FINGERS:['trait:sticky:up'],HOTHEAD:['trait:hothead:up'],STEADY:['trait:steady:up']};
const TFAIL={CALM:['trait:calm:fail'],ALWAYS_EATING:['trait:eat:fail'],MOUTHPIECE:['trait:mouth:fail'],PHONE_OUT:['trait:phone:fail','trait:phone:fail2'],SMALL:['trait:small:fail'],IMPATIENT:['trait:impatient:fail'],DRESSED_TO_KILL:['trait:dressed:fail'],CHURCH_SHOES:['trait:church:fail'],ROOKIE:['trait:rookie:fail'],BIG_POTENTIAL:['trait:mazi:showoff'],SEEN_IT_ALL:['trait:seen:fail'],SIT_DOWN:['trait:sitdown:fail'],SKITTISH:['trait:skittish:fail'],SHOWBOAT:['trait:showboat:fail'],LOYAL:['trait:loyal:fail'],STICKY_FINGERS:['trait:sticky:fail'],HOTHEAD:['trait:hothead:fail'],STEADY:['trait:steady:fail']};
function traitTable(recs){const out={};for(const t of Object.keys(TUP)){const ab=recs.filter(r=>r.crewTraits&&r.crewTraits.includes(t));out[t]={aboard:ab.length,up:ab.length?ab.filter(r=>TUP[t].some(id=>r.memAll.includes(id))).length/ab.length:0,fail:ab.length?ab.filter(r=>TFAIL[t].some(id=>r.memAll.includes(id))).length/ab.length:0,silentUp:TUP[t].length===0};}return out;}
export function metrics(recs){
 const n=recs.length;const M={n};
 M.win=mean(recs.map(r=>r.win?1:0));
 M.byPolicy=Object.fromEntries(Object.entries(by(recs,r=>r.policy)).map(([k,a])=>[k,{n:a.length,win:mean(a.map(r=>r.win?1:0)),clean:mean(a.map(r=>r.klass==='CLEAN'?1:0)),costly:mean(a.map(r=>r.klass==='COSTLY'?1:0)),wash:mean(a.map(r=>r.klass==='WASH'?1:0)),greed:mean(a.map(r=>r.klass==='GREED'?1:0)),robbed:mean(a.map(r=>r.klass==='ROBBED'?1:0)),score:mean(a.map(r=>SCORE[r.klass])),final:mean(a.map(r=>r.final))}]));
 M.byJob=Object.fromEntries(Object.entries(by(recs,r=>r.job)).map(([k,a])=>[k,{win:mean(a.map(r=>r.win?1:0)),wash:mean(a.map(r=>r.klass==='WASH'?1:0)),careful:mean(a.filter(r=>r.policy==='careful').map(r=>r.win?1:0)),naive:mean(a.filter(r=>r.policy==='naive').map(r=>r.win?1:0))}]));
 M.klass=cnt(recs,r=>r.klass);
 M.memRate=mean(recs.map(r=>r.mem.length>=1?1:0));M.mem2=mean(recs.map(r=>r.mem.length>=2?1:0));M.memCount=mean(recs.map(r=>r.mem.length));
 M.storyGrade=mean(recs.map(r=>r.storyGrade?1:0));
 M.nothing=mean(recs.map(r=>r.nothingStrict?1:0));M.nothingLenient=mean(recs.map(r=>r.nothingLenient?1:0));M.strictNothing=M.nothing;
 M.signature={distinct:new Set(recs.map(r=>r.signature)).size,seenBefore:mean(recs.map(r=>r.sigCount>=5&&r.signature!=='(none)'?1:0)),top:Object.entries(cnt(recs,r=>r.signature)).sort((a,b)=>b[1]-a[1]).slice(0,8)};
 M.wow=mean(recs.map(r=>r.wow?1:0));M.novelty=mean(recs.map(r=>r.novelty));M.hiFamPerPlay=mean(recs.map(r=>r.hiFams.length));
 // blame clarity
 const L=recs.flatMap(r=>r.losses.map(l=>({...l,policy:r.policy,job:r.job})));
 const Lm=L.filter(l=>l.kind!=='WOUNDED');
 const vis=l=>l.cause&&l.cause.c!=='LUCK',strict=l=>l.cause&&STRICT.has(l.cause.c);
 M.losses={n:L.length,nonWounded:Lm.length,perPlay:L.length/n,blameBroad:L.length?mean(L.map(l=>vis(l)?1:0)):1,blameStrict:L.length?mean(L.map(l=>strict(l)?1:0)):1,blameBroadNonWounded:Lm.length?mean(Lm.map(l=>vis(l)?1:0)):1,
  funnyOrDramatic:L.length?mean(L.map(l=>l.tag!=='PLAIN'?1:0)):0,funny:L.length?mean(L.map(l=>l.tag==='FUNNY'?1:0)):0,dramatic:L.length?mean(L.map(l=>l.tag==='DRAMATIC'?1:0)):0,
  byKind:cnt(L,l=>l.kind),byCause:cnt(L,l=>l.cause?l.cause.c:'NONE')};
 const withLoss=recs.filter(r=>r.losses.length);
 M.losses.playLevelClear=withLoss.length?mean(withLoss.map(r=>r.losses.every(l=>l.cause&&l.cause.c!=='LUCK')?1:0)):1;
 // swings / visible cause
 const S=recs.flatMap(r=>r.swingList);
 M.swings={n:S.length,perPlay:S.length/n,visible:S.length?mean(S.map(s=>s.vis?1:0)):1,strict:S.length?mean(S.map(s=>STRICT.has(s.c)?1:0)):1,byCause:cnt(S,s=>s.c),
  byKind:Object.fromEntries(Object.entries(by(S,s=>s.kind.split(':')[0])).map(([k,a])=>[k,{n:a.length,visible:mean(a.map(s=>s.vis?1:0))}]))};
 // memorable-event diversity
 const cells=Object.values(by(recs,r=>r.job+'|'+r.policy));
 const famOf=r=>new Set(r.mem.map(family));
 M.diversity={perCell:mean(cells.map(a=>{const s=new Set();a.slice(0,20).forEach(r=>famOf(r).forEach(x=>s.add(x)));return s.size;})),minCell:Math.min(...cells.map(a=>{const s=new Set();a.slice(0,20).forEach(r=>famOf(r).forEach(x=>s.add(x)));return s.size;})),maxCell:Math.max(...cells.map(a=>{const s=new Set();a.slice(0,20).forEach(r=>famOf(r).forEach(x=>s.add(x)));return s.size;})),
  totalFamilies:new Set(recs.flatMap(r=>[...famOf(r)])).size,totalRawIds:new Set(recs.flatMap(r=>r.mem)).size,
  perPlay:mean(recs.map(r=>famOf(r).size))};
 const ev={};for(const r of recs)for(const f of famOf(r))ev[f]=(ev[f]||0)+1;
 M.diversity.top=Object.entries(ev).sort((a,b)=>b[1]-a[1]).slice(0,12);
 const totalEv=Object.values(ev).reduce((a,b)=>a+b,0);
 M.diversity.maxShare=Object.values(ev).length?Math.max(...Object.values(ev))/n:0;M.diversity.totalEv=totalEv;
 M.diversity.families=ev;
 // generics / named
 const wg=recs.filter(r=>r.gens>0);
 M.generics={playsWith:wg.length,deathPerPlay:mean(wg.map(r=>r.genDead)),anyDeath:mean(wg.map(r=>r.genDead>0?1:0)),perGenericAboard:wg.reduce((a,r)=>a+r.genDead,0)/wg.reduce((a,r)=>a+r.gens,0),byPolicy:Object.fromEntries(Object.entries(by(wg,r=>r.policy)).map(([k,a])=>[k,mean(a.map(r=>r.genDead>0?1:0))]))};
 const nm=recs.map(r=>r.crew.filter(id=>!id.startsWith('g')).length);
 M.named={shotPerPlay:mean(recs.map(r=>r.namedShot)),anyShot:mean(recs.map(r=>r.namedShot>0?1:0)),shotPerNamedAboard:recs.reduce((a,r)=>a+r.namedShot,0)/nm.reduce((a,b)=>a+b,0),captured:mean(recs.map(r=>r.namedCaptured)),anyCaptured:mean(recs.map(r=>r.namedCaptured>0?1:0)),gone:recs.reduce((a,r)=>a+r.namedGone,0),namedDead:recs.reduce((a,r)=>a+r.namedDead,0),
  goneOutsideBigPlay:recs.filter(r=>r.job!=='counting_house').reduce((a,r)=>a+r.namedGone+r.namedDead,0),wounded:mean(recs.map(r=>r.wounded))};
 // crash / split
 M.car={crash:mean(recs.map(r=>r.crash?1:0)),split:mean(recs.map(r=>r.split?1:0)),robbedGetaway:mean(recs.map(r=>r.getaway==='ROBBED'?1:0)),byCar:Object.fromEntries(Object.entries(by(recs,r=>r.car)).map(([k,a])=>[k,{n:a.length,crash:mean(a.map(r=>r.crash?1:0)),split:mean(a.map(r=>r.split?1:0)),robbed:mean(a.map(r=>r.getaway==='ROBBED'?1:0)),clean:mean(a.map(r=>r.getaway==='CLEAN'?1:0)),win:mean(a.map(r=>r.win?1:0))}])),
  stall:recs.filter(r=>r.mem.includes('car:stall')).length};
 // turning
 const T=recs.filter(r=>r.turn);
 M.turn={recruitCrate:T.length/n,offered:recs.filter(r=>r.turn&&r.turn.offered).length/n,offeredOfRecruit:T.length?T.filter(r=>r.turn.offered).length/T.length:0,accepted:recs.filter(r=>r.turn&&r.turn.result&&r.turn.result!=='LET GO').length/n,results:cnt(T.filter(r=>r.turn.offered),r=>r.turn.result),noVampire:T.filter(r=>!r.turn.offered).length,seatFree:T.length?mean(T.map(r=>r.turn.seatFree?1:0)):0,per20:20*recs.filter(r=>r.turn&&r.turn.offered).length/n};
 // call divergence
 const cs=recs.map(r=>r.calls);
 const sum=k=>cs.reduce((a,c)=>a+c[k],0);
 const bw=cs.flatMap(c=>c.bestWorst);const real=cs.flatMap(c=>c.realized);
 M.calls={evaluated:sum('evaluated'),potential:sum('potential'),meaningful:sum('meaningful'),surfaced:sum('surfaced'),suppressedNoDiv:sum('suppressedNoDiv'),suppressedBudget:sum('suppressedBudget'),
  surfacedPerPlay:sum('surfaced')/n,meaningfulShare:sum('meaningful')/Math.max(1,sum('potential')),meanBestWorst:mean(bw),meanRealized:mean(real),meanAbsRealized:mean(real.map(Math.abs)),shareRealizedMeaningful:real.length?mean(real.map(x=>Math.abs(x)>=2?1:0)):0,
  byPolicy:Object.fromEntries(Object.entries(by(recs,r=>r.policy)).map(([k,a])=>{const rr=a.flatMap(r=>r.calls.realized);return [k,{surfaced:a.reduce((x,r)=>x+r.calls.surfaced,0),realized:mean(rr),abs:mean(rr.map(Math.abs))}];})),
  byBeat:cnt(recs.flatMap(r=>r.callLog),c=>String(c.i)),playsWithCall:mean(recs.map(r=>r.calls.surfaced>0?1:0)),playsWith2:mean(recs.map(r=>r.calls.surfaced>=2?1:0)),
  choices:cnt(recs.flatMap(r=>r.callLog),c=>c.choice),smartPick:mean(recs.flatMap(r=>r.callLog).map(c=>c.smart?1:0))};
 // HIT ONE MORE
 const sh=recs.flatMap(r=>r.shadow);
 const step=(a)=>({n:a.length,p:mean(a.map(s=>s.ok?1:0)),before:mean(a.map(s=>s.before)),gainOnWin:mean(a.filter(s=>s.ok).map(s=>s.after-s.before)),ev:mean(a.map(s=>s.ok?s.after-s.before:-s.before)),evRel:mean(a.map(s=>s.before?(s.ok?(s.after-s.before):-s.before)/s.before:0))});
 M.climb={byStep:{1:step(sh.filter(s=>s.k===1)),2:step(sh.filter(s=>s.k===2)),3:step(sh.filter(s=>s.k===3))},byRead:Object.fromEntries(['FRESH','BANGED UP','RAGGED'].map(rd=>[rd,{1:step(sh.filter(s=>s.k===1&&s.read===rd)),2:step(sh.filter(s=>s.k===2&&s.read===rd))}])),
  offered:recs.filter(r=>r.climbs.length).length/n,
  actual:Object.fromEntries(POLICY_NAMES.map(p=>{const a=recs.filter(r=>r.policy===p);const c=a.flatMap(r=>r.climbs);return [p,{offers:c.length,go:c.filter(x=>x.go).length,win:c.filter(x=>x.go&&x.ok).length,lose:c.filter(x=>x.go&&x.ok===false).length,greedFail:mean(a.map(r=>r.greedFail?1:0))}];})),
  teaseMismatch:recs.flatMap(r=>r.teaseAudit).filter(t=>!t.jack&&t.tease!==t.actual).length,teaseChecks:recs.flatMap(r=>r.teaseAudit).length,
  jackpotShare:(()=>{const t=recs.flatMap(r=>r.teaseAudit);return t.length?mean(t.map(x=>x.actual==='LEGENDARY'?1:0)):0;})(),
  tooHot:recs.filter(r=>r.klass!=='WASH'&&r.script.some(s=>s.line.startsWith('TOO HOT'))).length/n};
 // promise truth
 const tr=recs.filter(r=>!r.folded&&!r.robbed&&r.truth);
 M.truth={checked:tr.length,shownIn:tr.filter(r=>r.truth.shownIn).length,hiddenIn:tr.filter(r=>r.truth.hiddenIn).length,fake:tr.filter(r=>!(r.truth.shownIn&&r.truth.hiddenIn)).length};
 // outcome variance
 const cellsSD=Object.values(by(recs,r=>r.job+'|'+r.policy)).map(a=>sd(a.map(r=>SCORE[r.klass])));
 M.variance={outcomeSD:mean(cellsSD),finalSD:mean(Object.values(by(recs,r=>r.job+'|'+r.policy)).map(a=>sd(a.map(r=>r.final)))),
  gapCarefulNaive:(M.byPolicy.careful?.score||0)-(M.byPolicy.naive?.score||0),gapCarefulRandom:(M.byPolicy.careful?.score||0)-(M.byPolicy.random?.score||0),
  reversal:mean(recs.map(r=>r.reversal?1:0)),reversalWon:mean(recs.map(r=>r.mem.includes('reversal:won-from-all-hands')?1:0))};
 // trait/moment stats
 M.moments={perPlay:mean(recs.map(r=>r.moments.length)),traitMoments:mean(recs.map(r=>r.moments.filter(m=>/ — [A-Z' &.]+$/.test(m.t)).length)),
  tags:cnt(recs.flatMap(r=>r.moments),m=>m.tag)};
 M.turnings=M.turn;
 M.beats={empty:recs.reduce((a,x)=>a+x.emptyBeats,0)/Math.max(1,recs.reduce((a,x)=>a+x.beatCount,0)),beats:recs.reduce((a,x)=>a+x.beatCount,0)};
 M.temptation=cnt(recs,x=>x.temptation);
 M.spread={splitPer100:100*mean(recs.map(x=>x.split?1:0)),crashPer100:100*mean(recs.map(x=>x.crash?1:0))};
 M.traits=traitTable(recs);
 return M;
}
// Retellability. A family counts as a "story beat" when its best event weight is >= 6; routine stingers (a family that shows up in > 25% of all
// PLAYs) are discounted so that repetition cannot pass for variety. novelty = Σ weight × (1 − frequency).
function decorate(recs){
 const n=recs.length;const freq={};
 for(const r of recs)for(const f of new Set(r.mem.map(family)))freq[f]=(freq[f]||0)+1;
 for(const r of recs){
  const fw={};for(const id of r.mem){const f=family(id);fw[f]=Math.max(fw[f]||0,r.memWt[id]||0);}
  r.family=Object.keys(fw);r.famW=fw;
  r.hiFams=r.family.filter(f=>fw[f]>=6&&freq[f]/n<=.25);
  r.storyGrade=r.hiFams.length>=1;
  r.wow=r.family.some(f=>fw[f]>=7&&freq[f]/n<=.08);
  r.novelty=r.family.filter(f=>fw[f]>=4).map(f=>fw[f]*(1-freq[f]/n)).sort((a,b)=>b-a).slice(0,5).reduce((a,b)=>a+b,0);
  r.signature=r.hiFams.length?[...r.hiFams].sort((a,b)=>fw[b]-fw[a]||a.localeCompare(b)).slice(0,2).join(' + '):'(none)';
  r.hardLoss=r.losses.some(l=>['SHOT','CAPTURED','DEAD','GONE','ROBBED','CRASH','SPLIT'].includes(l.kind));
  r.nothingLenient=r.nothing;
  r.nothingStrict=!r.storyGrade&&!r.hardLoss&&!(r.callLog&&r.callLog.some(c=>c.choice!=='DEFAULT'&&Math.abs(c.realized)>=2));
  r.interest=r.novelty+(r.callLog&&r.callLog.some(c=>c.choice!=='DEFAULT'&&Math.abs(c.realized)>=2)?2:0);
 }
 const sig={};for(const r of recs)sig[r.signature]=(sig[r.signature]||0)+1;
 for(const r of recs)r.sigCount=sig[r.signature];
 return recs;
}

// ------------------------------------------------------------------------------------------------------------------------------ run
const T0=Date.now();
const log=(...a)=>console.log(...a,`(${Date.now()-T0} ms)`);
const primary=decorate(matrix(SEEDS));
const PM=metrics(primary);
log('primary matrix',primary.length,'PLAYs');

// ------------------------------------------------------------------------------------------------------------------------------ invariants / determinism / smoke
function invariants(recs){
 const V=[];const add=(r,m)=>V.push(`${r.job}/${r.policy}/${r.seed}: ${m}`);
 for(const r of recs){
  if(r.namedDead>0)add(r,'named Oga DEAD (only generics may die)');
  if(r.namedGone>0&&!(r.job==='counting_house'||JOBS.find(j=>j.id===r.job)?.bigPlay))add(r,'named GONE outside a BIG PLAY');
  if(r.namedGone>0){const bad=Object.entries(r.finalStatus).filter(([id,st])=>st==='GONE'&&!r.acceptedNamed.includes(id));if(bad.length)add(r,'GONE for a named Oga who did not accept the stakes');}
  const jobObj=JOBS.find(j=>j.id===r.job);
  if(!jobObj.bigPlay){const away=Object.values(r.finalStatus).filter(s=>s==='SHOT'||s==='CAPTURED').length;if(away>2)add(r,'mercy rule broken: '+away+' Ogas away');}
  if((r.klass==='ROBBED'||r.klass==='WASH'||r.klass==='GREED')&&r.final!==0)add(r,'a jugged PLAY banked something');
  if(r.robbed&&r.pocketLoss>3)add(r,'pocket loss larger than a small share');
  const text=r.script.filter(s=>['PITCH','CAR','SLIDE-IN','BEATS','CALLS','HIT ONE MORE','REPORT','MORNING AFTER','NEXT TEMPTATION'].includes(s.sec)).map(s=>s.line).join('\n');
  if(/\d\s*%/.test(text))add(r,'a percentage leaked into player-facing text');
  if(/95\s*%/.test(text))add(r,'95%??? still present (must be SURE THING???)');
  if(/\bITEM\b/.test(text))add(r,'ITEM appeared in a PLAY');
  if(/held by the law|arrest/i.test(text))add(r,'JUGGED read as arrest instead of robbery');
  if(/\bHARD\b|difficulty/.test(text))add(r,'difficulty language leaked');
  if(r.opts&&r.opts.traits!==false&&!r.opts.flat&&r.nerveEnd.some(([id,n])=>id==='auntie_grit'&&n<30))add(r,'Auntie Grit fell below SHAKY');
  const car=C.CARS[r.car];if(r.crew.length>car.seats.length&&r.car!=='HOOPTIE')add(r,'more Ogas than seats');
  if(r.truth&&!r.folded&&!r.robbed&&!(r.truth.shownIn&&r.truth.hiddenIn))add(r,'pitch-card silhouette/"?" not found in the trunk (fake tease)');
  for(const t of r.teaseAudit)if(!t.jack&&t.tease!==t.actual)add(r,'HIT ONE MORE tease did not match the reveal');
  if(!r.win&&!r.report.length)add(r,'a failed PLAY left no report line');
  if(!r.win&&!(r.morning&&r.morning.seeds.length||r.morning&&r.morning.nicks.length||r.report.length>1))add(r,'Hades principle: failed PLAY left no story');
  if(!r.morning||!r.morning.temptation)add(r,'no next temptation');
 }
 return V;
}
const INV=invariants(primary);
// determinism: re-run every 20th PLAY and compare the whole record
let detBad=0,detN=0;
for(let i=0;i<primary.length;i+=20){const r=primary[i];const again=runPlay({seed:r.seed,job:JOBS.find(j=>j.id===r.job),policy:r.policy});detN++;if(JSON.stringify(again.script)!==JSON.stringify(r.script)||again.klass!==r.klass||again.final!==r.final)detBad++;}
// smoke: many extra random PLAYs, invariants only
const SR=stream('smoke','v1');const smoke=[];
for(let i=0;i<SMOKE;i++){const j=JOBS[SR.int(0,JOBS.length-1)];const pol=POLICY_NAMES[SR.int(0,3)];const r=runPlay({seed:50000+i,job:j,policy:pol});smoke.push(r);}
const SMK=invariants(smoke);
log('invariants',INV.length,'determinism mismatches',detBad,'/',detN,'smoke violations',SMK.length,'/',SMOKE);

// ------------------------------------------------------------------------------------------------------------------------------ ablations
const ABL=[['baseline',{}],['traits OFF',{traits:false}],['NERVE/PRESSURE flattened',{flat:true}],['formation randomized',{formation:false}],['CALLS OFF',{calls:false}],['CALLS rarer (gap 3.6)',{callGap:3.6}],['CAR OFF (default seats)',{carOff:true}],['combos (M9) OFF',{combos:false}]];
const ablRes={};
for(const [name,opts] of ABL){const rs=decorate(matrix(REP_SEEDS,opts));ablRes[name]={opts,m:metrics(rs)};log('ablation',name);}
const base=ablRes.baseline.m;const nRep=base.n;const se=(p,n)=>Math.sqrt(p*(1-p)/n);
const ABLR=Object.entries(ablRes).map(([name,{m}])=>({name,storyGrade:m.storyGrade,wow:m.wow,nothing:m.nothing,novelty:m.novelty,hiFam:m.hiFamPerPlay,famPer20:m.diversity.perCell,famPerPlay:m.diversity.perPlay,outcomeSD:m.variance.outcomeSD,finalSD:m.variance.finalSD,gap:m.variance.gapCarefulNaive,gapRandom:m.variance.gapCarefulRandom,win:m.win,wash:m.klass.WASH/m.n,reversal:m.variance.reversal,calls:m.calls.surfacedPerPlay,blame:m.losses.blameBroad,
 dWow:m.wow-base.wow,dStory:m.storyGrade-base.storyGrade,dNov:m.novelty/base.novelty-1,dFam:m.diversity.perCell/base.diversity.perCell-1,dSD:m.variance.outcomeSD/base.variance.outcomeSD-1,dGap:m.variance.gapCarefulNaive-base.variance.gapCarefulNaive,dRev:m.variance.reversal-base.variance.reversal,se:se(base.storyGrade,nRep)*Math.SQRT2}));
// ------------------------------------------------------------------------------------------------------------------------------ controlled experiments: which part of the CAR screen matters?
function carPolicyRun(opts,seeds=REP_SEEDS,policy='careful'){const recs=[];for(let ji=0;ji<JOBS.length;ji++)for(let k=1;k<=seeds;k++)recs.push(runPlay({seed:seedOf(ji,k),job:JOBS[ji],policy,opts}));return decorate(recs);}
const sumr=(recs)=>({n:recs.length,win:mean(recs.map(r=>r.win?1:0)),clean:mean(recs.map(r=>r.klass==='CLEAN'?1:0)),wash:mean(recs.map(r=>r.klass==='WASH'?1:0)),crash:mean(recs.map(r=>r.crash?1:0)),robbed:mean(recs.map(r=>r.getaway==='ROBBED'?1:0)),split:mean(recs.map(r=>r.split?1:0)),score:mean(recs.map(r=>SCORE[r.klass])),novelty:mean(recs.map(r=>r.novelty)),storyBeat:mean(recs.map(r=>r.storyGrade?1:0)),shot:mean(recs.map(r=>r.namedShot)),final:mean(recs.map(r=>r.final)),funnyCar:mean(recs.map(r=>r.mem.some(id=>id.startsWith('car:')||id.startsWith('split:')||id==='combo:hands_free')?1:0))});
const CAREXP={};
for(const car of ['HOOPTIE','SUPRA','URUS','S2000'])CAREXP['car='+car]=sumr(carPolicyRun({forceCar:car}));
for(const mode of ['best','worst','random'])CAREXP['seats='+mode]=sumr(carPolicyRun(mode==='best'?{}:mode==='worst'?{seatMode:'worst'}:{formation:false}));
log('car/seat experiments');
for(const a of ABLR){
 if(a.name==='baseline'){a.verdict='—';continue;}
 const why=[];
 if(a.dStory<=-0.04)why.push('story-beat share −'+pct(-a.dStory));
 if(a.dWow<=-0.05)why.push('rare-wow PLAYs −'+pct(-a.dWow,0));
 if(a.dNov<=-0.05)why.push('novelty '+pct(a.dNov,0));
 if(a.dFam<=-0.08)why.push('families/20 '+pct(a.dFam,0));
 if(Math.abs(a.dSD)>=0.08)why.push('outcome variance '+(a.dSD>0?'+':'')+pct(a.dSD,0));
 if(a.dGap<=-0.15)why.push('skill gap (careful−naive) '+f2(a.dGap));
 if(a.name==='NERVE/PRESSURE flattened'&&a.dRev<=-0.05)why.push('reversals '+pct(a.dRev,0));
 if(a.name==='formation randomized'){const d=CAREXP['seats=best'].score-CAREXP['seats=random'].score;if(d>=0.2)why.push('controlled seat test: best seating beats random by '+f2(d)+' score ('+pct(CAREXP['seats=best'].win-CAREXP['seats=random'].win,0)+' win)');}
 if(a.name==='CAR OFF (default seats)'){const d=CAREXP['seats=best'].score-CAREXP['seats=worst'].score;if(d>=0.2)why.push('seat choice is worth '+f2(d)+' score best-vs-worst');}
 a.why=why;a.hurts=why.length>0;a.verdict=a.hurts?'KEEP — removal hurts: '+why.join('; '):'CUT CANDIDATE — removal did not materially hurt';
}




// ------------------------------------------------------------------------------------------------------------------------------ campaigns (BEEF)
const ARMS=[['off','BEEF OFF'],['split','BEEF ON (as proposed: SPLIT only)'],['wide','BEEF ON+ (SPLIT + FRIENDLY FIRE)']];
const camp={};
for(const [beef,label] of ARMS){
 const careers=[];
 for(const pol of ['careful','random'])for(let s=1;s<=CAREERS;s++){const c=runCareer({seed:s+(pol==='random'?500:0),nights:NIGHTS,policy:pol,opts:{beef}});careers.push({pol,seed:s,...c});}
 camp[beef]={label,careers};log('campaign',beef);
}
function campMetrics(arm){
 const recs=arm.careers.flatMap(c=>c.recs);decorate(recs);const n=recs.length;
 const trig=recs.filter(r=>r.beefFired);const created=recs.reduce((a,r)=>a+r.beef.length,0);
 const open=recs.map(r=>(r.beefsLive||[]).length);
 const nights=arm.careers.flatMap(c=>c.boards);const ready=nights.map(b=>b.ready);
 const offers=recs.filter(r=>r.turn&&r.turn.offered&&r.turn.result&&r.turn.result.startsWith('TAKES'));
 return {plays:n,created,createdPer100:100*created/n,triggers:trig.length,triggersPer100:100*trig.length/n,argue:trig.filter(r=>r.beefFired==='argue').length,settle:trig.filter(r=>r.beefFired==='settle').length,
  openMean:mean(open),openMax:Math.max(0,...open),storyGradeShare:mean(recs.map(r=>r.storyGrade?1:0)),novelty:mean(recs.map(r=>r.novelty)),win:mean(recs.map(r=>r.win?1:0)),fam:mean(recs.map(r=>r.family.length)),
  beefStoryShare:trig.length?mean(trig.map(r=>r.mem.some(id=>id.startsWith('beef:'))?1:0)):0,
  beefNovelty:trig.length?mean(trig.map(r=>r.novelty)):0,
  genDeath:mean(recs.filter(r=>r.gens>0).map(r=>r.genDead>0?1:0)),namedShot:mean(recs.map(r=>r.namedShot)),
  gone:arm.careers.reduce((a,c)=>a+c.state.gone.length,0),dayOnes:recs.filter(r=>r.newBond).length,turned:recs.filter(r=>r.turned).length,turnOffersTaken:offers.length,turnBlocked:recs.filter(r=>r.turnBlocked).length,recruited:recs.filter(r=>r.recruited).length,rescued:recs.filter(r=>r.rescued).length,
  readyMean:mean(ready.filter(x=>x!==undefined)),readyLt4:mean(nights.map(b=>(b.ready<4)?1:0)),skipped:nights.filter(b=>b.skipped).length,nightsN:nights.length,
  finalRosterMean:mean(arm.careers.map(c=>c.state.roster.length)),
  byPolicy:Object.fromEntries(['careful','random'].map(pol=>{const cs=arm.careers.filter(c=>c.pol===pol);const rs=cs.flatMap(c=>c.recs);const bs=cs.flatMap(c=>c.boards);const goneIds=cs.flatMap(c=>c.state.gone);return [pol,{careers:cs.length,plays:rs.length,goneNamed:goneIds.filter(id=>!id.startsWith('g')).length,goneGeneric:goneIds.filter(id=>id.startsWith('g')).length,gonePerCareer:goneIds.length/cs.length,rescued:rs.filter(x=>x.rescued).length,extractNights:rs.filter(x=>x.job==='extract').length,rosterEnd:mean(cs.map(c=>c.state.roster.length)),readyMean:mean(bs.map(b=>b.ready)),readyLt4:mean(bs.map(b=>b.ready<4?1:0)),skippedNights:bs.filter(b=>b.skipped).length,win:mean(rs.map(x=>x.win?1:0)),wash:mean(rs.map(x=>x.klass==='WASH'?1:0)),dayOnes:rs.filter(x=>x.newBond).length,genDead:rs.reduce((a,x)=>a+x.genDead,0)}];})),
  bySrc:cnt(recs.flatMap(r=>r.beef),b=>b.src||'?')};
}
const CM=Object.fromEntries(Object.entries(camp).map(([k,a])=>[k,campMetrics(a)]));

// ------------------------------------------------------------------------------------------------------------------------------ 10-night pitch-board audit
function boardStats(seqs){
 const A={careers:0,nights:0,pitchesPerNight:{},sameShapeInBoard:0,backToBackPlayedShape:0,dupPitcherInBoard:0,leadPitcherRepeat:0,leadPairs:0,silRepeat:0,silPairs:0,
  boardsWith2Props:0,boards:0,factionShare:{},specShare:{},shapeShare:{},pitcherShare:{},careersSpecGE4:0,careersSpecGE3:0,overlapShape:[],overlapSpec:[],identicalSpecSet:0,distinctSpecs:[],distinctPitchers:[],distinctNames:[],namesRepeat:0,noticeNights:0};
 for(const seq of seqs){
  const bs=seq.filter(b=>b.board&&b.board.length).slice(0,10);if(!bs.length)continue;A.careers++;
  const specs={},pitchers=new Set(),names=new Set();let prev=null,prevPlayed=null,prevLead=null,prevSil=null;
  for(const b of bs){
   A.nights++;if(b.notice){A.noticeNights++;}
   const std=!b.notice;const n=b.board.length;if(std)A.pitchesPerNight[n]=(A.pitchesPerNight[n]||0)+1;
   const shapes=b.board.map(p=>p.shape);if(new Set(shapes).size<shapes.length)A.sameShapeInBoard++;
   const ps=b.board.map(p=>p.pitcher);if(new Set(ps).size<ps.length)A.dupPitcherInBoard++;
   const played=b.board.find(p=>p.job===b.picked);
   if(std&&played&&prevPlayed&&played.shape===prevPlayed.shape&&played.shape!=='EXTRACT')A.backToBackPlayedShape++;
   if(std&&prev&&!prev.notice){const s0=new Set(prev.board.map(p=>p.shape)),j0=new Set(prev.board.map(p=>p.job));A.overlapShape.push(shapes.filter(s=>s0.has(s)).length/shapes.length);const jj=b.board.map(p=>p.job);A.overlapSpec.push(jj.filter(s=>j0.has(s)).length/jj.length);if(jj.length===j0.size&&jj.every(s=>j0.has(s)))A.identicalSpecSet++;}
   if(std){A.boards++;if(new Set(b.board.map(p=>p.prop)).size>=2)A.boardsWith2Props++;}
   for(const p of b.board){specs[p.job]=(specs[p.job]||0)+1;pitchers.add(p.pitcher);A.pitcherShare[p.pitcher]=(A.pitcherShare[p.pitcher]||0)+1;A.factionShare[p.faction]=(A.factionShare[p.faction]||0)+1;A.specShare[p.job]=(A.specShare[p.job]||0)+1;A.shapeShare[p.shape]=(A.shapeShare[p.shape]||0)+1;if(names.has(p.name))A.namesRepeat++;names.add(p.name);}
   if(prevLead!==null&&std){A.leadPairs++;if(b.board[0].pitcher===prevLead)A.leadPitcherRepeat++;}
   prevLead=b.board[0].pitcher;
   if(played){if(prevSil!==null){A.silPairs++;if(played.silhouettes[0]===prevSil)A.silRepeat++;}prevSil=played.silhouettes[0];prevPlayed=played;}
   prev=b;
  }
  const mx=Math.max(...Object.values(specs));if(mx>=4)A.careersSpecGE4++;if(mx>=3)A.careersSpecGE3++;
  A.distinctSpecs.push(Object.keys(specs).length);A.distinctPitchers.push(pitchers.size);A.distinctNames.push(names.size);
 }
 A.overlapShapeMean=mean(A.overlapShape);A.overlapSpecMean=mean(A.overlapSpec);A.distinctSpecsMean=mean(A.distinctSpecs);A.distinctPitchersMean=mean(A.distinctPitchers);A.distinctNamesMean=mean(A.distinctNames);
 A.pctBoards2Props=A.boards?A.boardsWith2Props/A.boards:0;A.leadRepeatShare=A.leadPairs?A.leadPitcherRepeat/A.leadPairs:0;
 A.omgShare=(A.factionShare['OPEN MOUTH GANG']||0)/Math.max(1,Object.values(A.factionShare).reduce((a,b)=>a+b,0));
 return A;
}
const AUD_PLAYED=boardStats(camp.split.careers.map(c=>c.boards));
const AUD_A=boardStats(Array.from({length:60},(_,i)=>boardsOnly({seed:i+1,nights:10,anti:false})));
const AUD_B=boardStats(Array.from({length:60},(_,i)=>boardsOnly({seed:i+1,nights:10,anti:true})));
const playedRecs=camp.split.careers.flatMap(c=>c.recs.filter(r=>r.night<=10));
const trChecked=playedRecs.filter(r=>!r.folded&&!r.robbed&&r.truth);
const AUD_TRUTH={playsChecked:trChecked.length,fakeTeases:trChecked.filter(r=>!(r.truth.shownIn&&r.truth.hiddenIn)).length,
 shownSilhouetteInPool:JOBS.every(j=>j.tilt[j.silhouettes[0]]>0),hiddenInPool:JOBS.every(j=>j.silhouettes[1]==='?'||j.tilt[j.silhouettes[1]]>0),
 topOfBandReachedOnClean:(()=>{const c=primary.filter(r=>r.klass==='CLEAN');const hit=c.filter(r=>{const j=JOBS.find(x=>x.id===r.job);return r.pot.cash>=j.band[0]+(j.band[1]-j.band[0])*.85;});return c.length?hit.length/c.length:0;})(),
 floorHeld:primary.filter(r=>r.win&&!r.folded).every(r=>r.pot.cash>=JOBS.find(x=>x.id===r.job).band[0]-0.05)};
log('audit');

// ------------------------------------------------------------------------------------------------------------------------------ digest selection
const sorted=[...primary].sort((a,b)=>b.interest-a.interest||a.idx-b.idx);
const best=sorted.slice(0,10);
const worst=[...primary].sort((a,b)=>a.interest-b.interest||a.idx-b.idx).slice(0,10);
const Rr=stream('digest-random-v1','pick');
const idxs=primary.map((_,i)=>i);for(let i=idxs.length-1;i>0;i--){const j=Rr.int(0,i);[idxs[i],idxs[j]]=[idxs[j],idxs[i]];}
const rand=idxs.slice(0,10).map(i=>primary[i]);
const pickBy=(f,score=r=>r.interest)=>[...primary].filter(f).sort((a,b)=>score(b)-score(a)||a.idx-b.idx)[0];
const funnyW=r=>r.moments.filter(m=>m.tag==='FUNNY').reduce((a,m)=>a+m.w,0)+(r.mem.filter(id=>/split|car|trait|weapon|chain|beef/.test(id)).length)*2;
const TR=[
 ['1. SATISFYING CLEAN RUN',pickBy(r=>r.klass==='CLEAN'&&r.losses.length===0&&r.policy==='careful'&&r.storyGrade)||pickBy(r=>r.klass==='CLEAN')],
 ['2. FUNNY DISASTER',pickBy(r=>r.klass!=='CLEAN'&&r.klass!=='GREED',funnyW)],
 ['3. CLUTCH REVERSAL',pickBy(r=>r.win&&r.mem.includes('reversal:won-from-all-hands')&&r.mem.includes('neardeath:saved'))||pickBy(r=>r.win&&r.mem.includes('reversal:won-from-all-hands'))||pickBy(r=>r.win&&r.mem.includes('neardeath:saved'))],
 ['4. HIT ONE MORE GREED FAILURE',pickBy(r=>r.greedFail&&r.steps>=1&&r.script.some(s=>s.sec==='HIT ONE MORE'&&s.line.includes('GREED'))&&r.policy!=='greedy')||pickBy(r=>r.greedFail&&r.steps>=1&&r.script.some(s=>s.sec==='HIT ONE MORE'&&s.line.includes('GREED')))],
 ['5. WEIRD / TURNING / RARE LOOT',pickBy(r=>r.mem.some(id=>id.startsWith('turn:'))&&r.mem.some(id=>id.startsWith('loot:')))||pickBy(r=>r.mem.some(id=>id.startsWith('turn:')))]
];

// ------------------------------------------------------------------------------------------------------------------------------ boring-run analysis
const boring=primary.filter(r=>!r.storyGrade);
const lowN=[...primary].sort((a,b)=>a.novelty-b.novelty||a.idx-b.idx).slice(0,Math.round(primary.length*.15));
const overrep=(f,set=lowN)=>{const all=cnt(primary,f),b=cnt(set,f);return Object.entries(all).map(([k,v])=>[k,(b[k]||0)/v,v]).sort((a,b)=>b[1]-a[1]);};
const B={n:boring.length,share:boring.length/primary.length,lowestQuintileSize:lowN.length,hardLossShareInLow:mean(lowN.map(r=>r.hardLoss?1:0)),winShareInLow:mean(lowN.map(r=>r.win?1:0)),
 byKlass:cnt(lowN,r=>r.klass),byPolicy:cnt(lowN,r=>r.policy),
 rate:{job:overrep(r=>r.job),policy:overrep(r=>r.policy),approach:overrep(r=>r.approach),car:overrep(r=>r.car),klass:overrep(r=>r.klass),size:overrep(r=>r.crew.length),getaway:overrep(r=>r.getaway)},
 cleanFast:mean(lowN.map(r=>r.calls.surfaced===0?1:0)),noTraitMoment:mean(lowN.map(r=>r.moments.some(m=>/ — [A-Z' &.]+$/.test(m.t))?0:1))};

// ------------------------------------------------------------------------------------------------------------------------------ write outputs
const summary={
 spec:'THE PLAY paper-sim — OL-014/OL-015',
 matrix:{jobs:JOBS.map(j=>j.id),seedsPerJob:SEEDS,policies:POLICY_NAMES,total:primary.length,seedFormula:'seed = jobIndex*1000 + k (k = 1..20); the same seed is used across the four policies (paired)',replicateSeedsPerJob:REP_SEEDS,careersPerArm:CAREERS*2,nightsPerCareer:NIGHTS,smoke:SMOKE},
 invariants:{primaryViolations:INV,smokeViolations:SMK.slice(0,20),smokeCount:SMOKE,determinismMismatches:detBad,determinismChecked:detN},
 metrics:PM,ablations:ABLR,ablationRaw:Object.fromEntries(Object.entries(ablRes).map(([k,v])=>[k,{opts:v.opts,win:v.m.win,byPolicy:v.m.byPolicy,klass:v.m.klass,calls:v.m.calls,diversity:{perCell:v.m.diversity.perCell,perPlay:v.m.diversity.perPlay,totalFamilies:v.m.diversity.totalFamilies}}])),
 carExperiment:CAREXP,beef:{arms:CM},pitchAudit:{played:AUD_PLAYED,boardsOnlyRulesA:AUD_A,boardsOnlyRulesB:AUD_B,truth:AUD_TRUTH},boring:B,
 digestIndexes:{best:best.map(r=>r.idx),worst:worst.map(r=>r.idx),random:rand.map(r=>r.idx),randomSeed:'digest-random-v1',transcripts:TR.map(([t,r])=>[t,r&&r.idx])}
};
fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify(summary,null,1));
const cols=['idx','job','policy','seed','klass','win','banked_K_eq','approach','car','crewSize','gens','genDead','namedShot','namedCaptured','namedGone','wounded','getaway','steps','greedFail','memCount','storyGrade','novelty','nothingStrict','nothingLenient','losses','lossesVisibleCause','swings','swingsVisibleCause','callsPotential','callsMeaningful','callsSurfaced','turnOffered','signature','mem'];
const rows=[cols.join(',')];
for(const r of primary)rows.push([r.idx,r.job,r.policy,r.seed,r.klass,r.win?1:0,r.final,r.approach,r.car,r.crew.length,r.gens,r.genDead,r.namedShot,r.namedCaptured,r.namedGone,r.wounded,r.getaway,r.steps,r.greedFail?1:0,r.mem.length,r.storyGrade?1:0,r.novelty.toFixed(2),r.nothingStrict?1:0,r.nothingLenient?1:0,r.losses.length,r.lossesClear,r.swings,r.swingsVisible,r.calls.potential,r.calls.meaningful,r.calls.surfaced,r.turn&&r.turn.offered?1:0,'"'+r.signature+'"','"'+r.mem.join('|')+'"'].join(','));
fs.writeFileSync(path.join(OUT,'plays.csv'),rows.join('\n')+'\n');

// digest.txt
const D=[];const P=(s='')=>D.push(s);
P('THE PLAY — 800-PLAY SIM DIGEST (OL-014 / OL-015)');
P('Matrix: 10 job specs × 20 seeds × 4 policies (careful / greedy / naive / random) = '+primary.length+' PLAYs. Roster 6 named + 3 generics; cars HOOPTIE / SUPRA / URUS / S2000; M2 seating, M5 getaways, J.5 JUGGED (=ROBBED).');
P('Seeds: seed = jobIndex*1000 + k (k=1..20); identical across the four policies (paired). Ablations and BEEF use larger replicates ('+REP_SEEDS+' seeds/job; '+CAREERS*2+' careers × '+NIGHTS+' nights per BEEF arm). Every number is structural / PROVISIONAL (owner F13). The model has no grid, LOS, pathing, cover, hit-% UI, overwatch/hunker, or difficulty selector.');
P('Definitions. Story beat = a memorable-event family with weight ≥ 6 that shows up in ≤ 25% of all PLAYs (routine stingers cannot pass as variety). Nothing-happened (strict) = no story beat, no hard loss (SHOT/CAPTURED/DEAD/GONE/JUGGED/CRASH/SPLIT) and no call that moved a beat; lenient = no event of weight ≥ 4 at all. Visible cause: broad = any cause the player can see on screen (trait, choice, greed, car, weapon, seat, relationship, an earlier visible event, a card hazard word, an enemy tell); luck-only swings are counted as unexplained.');
P('');
P('═══ OL-014 METRICS ═══');
P(`Nothing-happened PLAYs: strict ${pct(PM.nothing)} · lenient ${pct(PM.nothingLenient)}   (target ≤ 10%)`);
P(`Rare-wow PLAYs (an event of weight ≥ 7 whose family shows up in ≤ 8% of PLAYs — the "I can't believe that happened" proxy): ${pct(PM.wow)}`);
P(`Story-beat PLAYs (something to retell): ${pct(PM.storyGrade)} · mean novelty ${f2(PM.novelty)} · story-beat families per PLAY ${f2(PM.hiFamPerPlay)}`);
P(`Blame clarity: ${pct(PM.losses.blameBroad)} of ${PM.losses.n} losses have a visible cause (${pct(PM.losses.blameBroadNonWounded)} excluding plain WOUNDED); ${pct(PM.losses.playLevelClear)} of PLAYs with losses have every loss traceable; player-attributable (trait/choice/greed/car/weapon/seat/relationship) ${pct(PM.losses.blameStrict)}   (target ≥ 90%)`);
P(`Loss causes: ${JSON.stringify(PM.losses.byCause)}`);
P(`Funny-or-dramatic share of losses: ${pct(PM.losses.funnyOrDramatic)} (funny ${pct(PM.losses.funny)} / dramatic ${pct(PM.losses.dramatic)} / plain ${pct(1-PM.losses.funnyOrDramatic)})   (target ≥ 40%)`);
P(`Unique memorable-event families per 20 PLAYs: mean ${f2(PM.diversity.perCell)} (min ${PM.diversity.minCell}, max ${PM.diversity.maxCell}); ${PM.diversity.totalFamilies} families overall; biggest single family appears in ${pct(PM.diversity.maxShare)} of PLAYs; distinct story signatures ${PM.signature.distinct}/${PM.n}; ${pct(PM.signature.seenBefore)} of PLAYs share their signature with ≥ 4 others. Top: ${PM.diversity.top.slice(0,8).map(([k,v])=>k+' '+v).join(', ')}`);
P(`Generic death: ${pct(PM.generics.anyDeath)} of PLAYs with generics aboard lose ≥ 1 generic (${f2(PM.generics.deathPerPlay)} per PLAY; ${pct(PM.generics.perGenericAboard)} per generic aboard; by policy ${Object.entries(PM.generics.byPolicy).map(([k,v])=>k+' '+pct(v,0)).join(', ')})`);
P(`Named SHOT: ${f2(PM.named.shotPerPlay)} per PLAY, ${pct(PM.named.anyShot)} of PLAYs have ≥ 1; ${pct(PM.named.shotPerNamedAboard)} per named Oga aboard · named CAPTURED ${pct(PM.named.anyCaptured)} of PLAYs · named GONE ${PM.named.gone} (BIG PLAY only; outside BIG PLAY ${PM.named.goneOutsideBigPlay}) · named DEAD ${PM.named.namedDead}`);
P(`Getaway: crash ${pct(PM.car.crash)} · SPLIT ${pct(PM.car.split)} · robbed on the way back ${pct(PM.car.robbedGetaway)}; by car ${Object.entries(PM.car.byCar).map(([k,v])=>`${k} crash ${pct(v.crash,0)}/split ${pct(v.split,0)}/robbed ${pct(v.robbed,0)}`).join(' · ')}`);
P(`Turning: recruit crate in ${pct(PM.turn.recruitCrate)} of PLAYs; a conscious vampire Oga could offer in ${pct(PM.turn.offered)} (${f2(PM.turn.per20)} per 20 PLAYs); ${PM.turn.noVampire} recruit crates had no vampire aboard; results ${JSON.stringify(PM.turn.results)}`);
P(`Visible-cause coverage of important swings: ${pct(PM.swings.visible)} (${PM.swings.n} swings, ${f2(PM.swings.perPlay)}/PLAY); player-attributable ${pct(PM.swings.strict)}; unexplained (luck) ${pct(1-PM.swings.visible)}; by cause ${JSON.stringify(PM.swings.byCause)}`);
P(`Calls: ${PM.calls.evaluated} beats evaluated · ${PM.calls.potential} with a possible call · ${PM.calls.meaningful} with meaningful divergence (${pct(PM.calls.meaningfulShare)}) · ${PM.calls.surfaced} surfaced (${f2(PM.calls.surfacedPerPlay)}/PLAY; ${pct(PM.calls.playsWithCall)} of PLAYs have ≥ 1, ${pct(PM.calls.playsWith2)} have 2+) · suppressed: ${PM.calls.suppressedNoDiv} no divergence + ${PM.calls.suppressedBudget} over budget`);
P(`Call outcome difference (chosen button vs "let them handle it" on identical dice): mean ${f2(PM.calls.meanRealized)}, mean |Δ| ${f2(PM.calls.meanAbsRealized)}; ${pct(PM.calls.shareRealizedMeaningful)} of surfaced calls moved the beat by ≥ a tier; by policy ${Object.entries(PM.calls.byPolicy).map(([k,v])=>`${k} ${f2(v.realized)}`).join(', ')}; the authored smart way out was picked in ${pct(PM.calls.smartPick)} of calls; by beat ${JSON.stringify(PM.calls.byBeat)}`);
P('');
P('═══ OUTCOMES BY POLICY ═══');
for(const [k,v] of Object.entries(PM.byPolicy))P(`${k.padEnd(8)} win ${pct(v.win)}  clean ${pct(v.clean)}  costly ${pct(v.costly)}  wash ${pct(v.wash)}  greed-lost ${pct(v.greed)}  robbed ${pct(v.robbed)}  score ${f2(v.score)}  avg banked ${f2(v.final)}K-eq`);
P('By job (careful / naive win): '+Object.entries(PM.byJob).map(([k,v])=>`${k} ${pct(v.careful,0)}/${pct(v.naive,0)}`).join(' · '));
P(`Beats with nothing staged (a caption had to carry them): ${pct(PM.beats.empty)} of ${PM.beats.beats}; next-temptation mix ${JSON.stringify(PM.temptation)}`);
P('');
P('═══ HIT ONE MORE — EV BY STEP (shadow climb: 4 replicate futures per offered PLAY, value in $K-equivalent) ═══');
for(const k of [1,2,3]){const s=PM.climb.byStep[k];P(`step ${k}: reached n=${s.n} · P(success) ${pct(s.p)} · pot at stake ${f2(s.before)} · gain on success ${f2(s.gainOnWin)} · EV of going ${f2(s.ev)} (${pct(s.evRel)} of the pot)`);}
for(const rd of ['FRESH','BANGED UP','RAGGED']){const a=PM.climb.byRead[rd];P(`  crew read ${rd.padEnd(9)} step 1: n=${a[1].n} P ${pct(a[1].p)} EV ${f2(a[1].ev)} | step 2: n=${a[2].n} P ${pct(a[2].p)} EV ${f2(a[2].ev)}`);}
for(const [p,v] of Object.entries(PM.climb.actual))P(`  policy ${p.padEnd(8)} offers ${v.offers} · went ${v.go} · won ${v.win} · lost the pot ${v.lose}`);
P(`  tease truth: ${PM.climb.teaseMismatch} mismatches in ${PM.climb.teaseChecks} teased steps · LEGENDARY/jackpot kicker in ${pct(PM.climb.jackpotShare)} of won steps · pitch-card promise: ${PM.truth.checked} PLAYs checked, ${PM.truth.fake} fake teases`);
P('');
P('═══ INVARIANTS ═══');
P(`800-PLAY matrix violations: ${INV.length} · ${SMOKE}-PLAY smoke violations: ${SMK.length} · determinism: ${detBad} mismatches in ${detN} re-runs (identical script + outcome required)`);
for(const v of [...INV,...SMK].slice(0,10))P('  ! '+v);
P('');
P('═══ ABLATIONS (replicate sample '+nRep+' PLAYs each; SE of a story-grade delta ≈ '+pct(ABLR[0].se)+') ═══');
P('variant'.padEnd(27)+'story-beat  wow     novelty  nothing  fam/20  outcomeSD  careful−naive  reversal  calls/PLAY  blame  verdict');
for(const a of ABLR)P(a.name.padEnd(27)+`${pct(a.storyGrade).padEnd(12)}${pct(a.wow).padEnd(8)}${f2(a.novelty).padEnd(9)}${pct(a.nothing).padEnd(9)}${f2(a.famPer20).padEnd(8)}${f2(a.outcomeSD).padEnd(11)}${f2(a.gap).padEnd(15)}${pct(a.reversal).padEnd(10)}${f2(a.calls).padEnd(12)}${pct(a.blame,0).padEnd(7)}${a.verdict}`);
P('');
P('');
P('═══ CAR / SEAT EXPERIMENTS (careful policy, same jobs and seeds; only the named factor changes) ═══');
for(const [k,v] of Object.entries(CAREXP))P(`${k.padEnd(14)} n ${v.n} · win ${pct(v.win)} · clean ${pct(v.clean)} · wash ${pct(v.wash)} · crash ${pct(v.crash)} · robbed ${pct(v.robbed)} · split ${pct(v.split)} · score ${f2(v.score)} · novelty ${f2(v.novelty)} · car/split stories ${pct(v.funnyCar)} · named SHOT ${f2(v.shot)}`);
P('');
P('═══ TRAIT COVERAGE (share of PLAYs with the trait aboard in which its upside / failure mode surfaced as a staged moment) ═══');
for(const [t,v] of Object.entries(PM.traits))P(`${(C.TRAIT_WORD[t]||t).padEnd(16)} aboard ${String(v.aboard).padStart(4)}  upside ${v.silentUp?'  (silent in a PLAY)':pct(v.up).padStart(6)}  failure ${pct(v.fail).padStart(6)}${(!v.silentUp&&v.up<.03)||v.fail<.03?'   ← thin':''}`);
P('');
P('═══ BEEF (campaign layer) ═══');
for(const [k,m] of Object.entries(CM))P(`${camp[k].label.padEnd(38)} PLAYs ${m.plays} · created ${f2(m.createdPer100)}/100 · triggered ${f2(m.triggersPer100)}/100 (argue ${m.argue}, settle ${m.settle}) · open BEEFs mean ${f2(m.openMean)} max ${m.openMax} · PLAYs where a BEEF fired: novelty ${f2(m.beefNovelty)} vs ${f2(m.novelty)} overall · story-beat ${pct(m.storyGradeShare)} · novelty ${f2(m.novelty)} · families/PLAY ${f2(m.fam)} · win ${pct(m.win)} · READY at night start ${f2(m.readyMean)}`);
for(const [k,m] of Object.entries(CM))for(const [pol,v] of Object.entries(m.byPolicy))if(k==='off')P(`  campaign [${pol}] ${v.careers} careers × ${NIGHTS} nights: roster at end ${f2(v.rosterEnd)} of 9 · READY at night start ${f2(v.readyMean)} (< 4 on ${pct(v.readyLt4,0)} of nights; ${v.skippedNights} nights with < 2 available) · Ogas lost to an expired EXTRACT clock: ${v.goneNamed} named + ${v.goneGeneric} generic (${f2(v.gonePerCareer)} per career) · rescued ${v.rescued} in ${v.extractNights} EXTRACT nights · DAY ONES formed ${v.dayOnes} · WASH ${pct(v.wash)} · win ${pct(v.win)}`);
P('');
P('═══ 10-NIGHT PITCH-BOARD AUDIT ═══');
const fa=(a)=>`nights ${a.nights}; pitches/night ${JSON.stringify(a.pitchesPerNight)}; same shape in a board ${a.sameShapeInBoard}; back-to-back played shape ${a.backToBackPlayedShape}; duplicate pitcher within a board ${a.dupPitcherInBoard}; consecutive-board overlap: shape ${pct(a.overlapShapeMean,0)} / spec ${pct(a.overlapSpecMean,0)}; lead-pitcher repeat ${pct(a.leadRepeatShare,0)}; distinct specs/10 nights ${f2(a.distinctSpecsMean)}, pitchers ${f2(a.distinctPitchersMean)}/6, names ${f2(a.distinctNamesMean)}; boards with ≥ 2 emotional propositions ${pct(a.pctBoards2Props,0)}; careers with one spec ≥ 3× in 10 nights ${a.careersSpecGE3}/${a.careers}; OPEN MOUTH GANG share of pitches ${pct(a.omgShare,0)}`;
P('Played careers (BEEF-ON arm, generator B): '+fa(AUD_PLAYED));
P('Boards only, rules A (OL-015 minimum: distinct shapes, no repeat of the played shape): '+fa(AUD_A));
P('Boards only, rules B (A + no spec from last night, unique pitchers): '+fa(AUD_B));
P(`Truth: ${AUD_TRUTH.playsChecked} played PLAYs checked, fake teases ${AUD_TRUTH.fakeTeases}; every shown silhouette is in its job's pool: ${AUD_TRUTH.shownSilhouetteInPool}; floor held on every non-folded win: ${AUD_TRUTH.floorHeld}; top of the advertised band reached on ${pct(AUD_TRUTH.topOfBandReachedOnClean,0)} of clean wins`);
P('');
const section=(title,arr)=>{P('═══ '+title+' ═══');arr.forEach((r,i)=>P(`${String(i+1).padStart(2)}. [#${r.idx} ${r.job}/${r.policy}/seed ${r.seed}] ${prose(r)}`));P('');};
section('10 BEST STORIES (highest novelty-weighted interest; no other selection)',best);
section('10 WORST STORIES (lowest novelty-weighted interest)',worst);
section('10 RANDOM STORIES (Fisher–Yates over all 800 with stream "digest-random-v1"; indices '+rand.map(r=>r.idx).join(',')+')',rand);
P('═══ 5 COMPLETE PLAYER-FACING TRANSCRIPTS ═══');
for(const [title,r] of TR){P('');P('──────── '+title+(r?`   [#${r.idx} ${r.job}/${r.policy}/seed ${r.seed}]`:'   [no matching PLAY in the 800]')+' ────────');if(r)P(transcript(r));}
P('');
P('═══ BORING-RUN ANALYSIS ═══');
P(`${B.n} of ${primary.length} PLAYs (${pct(B.share)}) have no story beat. Lowest-novelty 15% (${B.lowestQuintileSize} PLAYs): win share ${pct(B.winShareInLow,0)}, hard-loss share ${pct(B.hardLossShareInLow,0)}, no call surfaced ${pct(B.cleanFast,0)}, no trait moment ${pct(B.noTraitMoment,0)}; by class ${JSON.stringify(B.byKlass)}; by policy ${JSON.stringify(B.byPolicy)}.`);
P('Share of each group that lands in the boring set — job: '+B.rate.job.slice(0,5).map(([k,v])=>`${k} ${pct(v,0)}`).join(', ')+' | approach: '+B.rate.approach.map(([k,v])=>`${k} ${pct(v,0)}`).join(', ')+' | car: '+B.rate.car.map(([k,v])=>`${k} ${pct(v,0)}`).join(', ')+' | crew size: '+B.rate.size.map(([k,v])=>`${k} ${pct(v,0)}`).join(', ')+' | getaway: '+B.rate.getaway.map(([k,v])=>`${k} ${pct(v,0)}`).join(', '));
fs.writeFileSync(path.join(OUT,'digest.txt'),D.join('\n')+'\n');
fs.writeFileSync(path.join(OUT,'transcripts.txt'),TR.map(([t,r])=>'──── '+t+(r?` [#${r.idx} ${r.job}/${r.policy}/seed ${r.seed}] ────\n`+transcript(r):' ────\n(no match)')).join('\n\n')+'\n');
log('done');
