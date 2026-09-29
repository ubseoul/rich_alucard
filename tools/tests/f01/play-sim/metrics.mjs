// THE PLAY paper-sim runner: 10 job specs × 20 seeds × 4 policies = 800 PLAYs + ablations + BEEF campaigns + 10-night pitch audit.
// Usage: node tools/tests/f01/play-sim/run.mjs [--quick]
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {stream} from './load.mjs';
import {runPlay} from './driver.mjs';
import * as C from './content.mjs';
import {POLICY_NAMES} from './policy.mjs';
import {transcript,prose,interest,family} from './story.mjs';

export const OUT=path.join(path.dirname(fileURLToPath(import.meta.url)),'out');
fs.mkdirSync(OUT,{recursive:true});
export const QUICK=process.argv.includes('--quick');
export const JOBS=C.JOBS;
export const SEEDS=20,REP_SEEDS=QUICK?20:40,CAREERS=QUICK?8:40,NIGHTS=24,SMOKE=QUICK?300:3000;
export const mean=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
export const sd=a=>{if(a.length<2)return 0;const m=mean(a);return Math.sqrt(mean(a.map(x=>(x-m)**2)));};
export const pct=(x,d=1)=>(100*x).toFixed(d)+'%';
export const f2=x=>(+x).toFixed(2);
export const SCORE={BAILED:1,CLEAN:4,MESSY:3,COSTLY:2,FOLDED:2,GREED:1,ROBBED:1,WASH:0};
export const STRICT=new Set(['TRAIT','CHOICE','GREED','CAR','WEAPON','SEAT','RELATIONSHIP']);
export const seedOf=(ji,k)=>ji*1000+k;

export function matrix(seeds,opts={}){
 const recs=[];let idx=0;
 for(let ji=0;ji<JOBS.length;ji++)for(const pol of POLICY_NAMES)for(let k=1;k<=seeds;k++){
  const r=runPlay({seed:seedOf(ji,k),job:JOBS[ji],policy:pol,opts});r.idx=idx++;r.k=k;recs.push(r);
 }
 return recs;
}
export const by=(a,f)=>{const m={};for(const r of a){const k=f(r);(m[k]=m[k]||[]).push(r);}return m;};
export const cnt=(a,f)=>{const m={};for(const r of a){const k=f(r);m[k]=(m[k]||0)+1;}return m;};

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
export function decorate(recs){
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
