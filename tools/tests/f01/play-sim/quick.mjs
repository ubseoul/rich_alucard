// Quick T-check (primary 800-PLAY matrix only, ~20 s): T1 / T2 bands / T3 / T5 / T13 / calls. `node quick.mjs`
import {SEEDS,REP_SEEDS,pct,f2,matrix,metrics,decorate,JOBS} from './metrics.mjs';
const primary=decorate(matrix(SEEDS));const PM=metrics(primary);
const rep=decorate(matrix(REP_SEEDS));const RM=metrics(rep);
const P=k=>PM.byPolicy[k];
const big=new Set(JOBS.filter(j=>j.bigPlay).map(j=>j.id)),def=new Set(JOBS.filter(j=>j.defense).map(j=>j.id));
const cap=(fn)=>{const a=primary.filter(fn);return a.length?a.filter(r=>r.namedCaptured>0).length/a.length:0;};
console.log('T1',pct(PM.generics.anyDeath),'| T2 routine',pct(cap(r=>!big.has(r.job)&&!def.has(r.job))),'BIG',pct(cap(r=>big.has(r.job))),'HOLD',pct(cap(r=>def.has(r.job))),'| T3',pct(PM.car.split));
{const b=PM.losses.byCause,n=PM.losses.n,f=(b.SWAP||0)+(b.WEAPON||0)+(b.CAR||0)+(b.CHOICE||0)+(b.GREED||0);console.log('T5 FOUR-LEVER (SWAP+WEAPON+CAR+CALLS[choice+HIT ONE MORE])',pct(f/n),'| SWAP',b.SWAP||0,'WEAPON',b.WEAPON||0,'CAR',b.CAR||0,'CALLS',(b.CHOICE||0)+(b.GREED||0));}
console.log('T5 legacy',pct(PM.losses.blameStrict),JSON.stringify(PM.losses.byCause),'n',PM.losses.n);
console.log('T13 careful',pct(P('careful').win),'naive',pct(P('naive').win),'gap',f2((P('careful').win-P('naive').win)*100),'| random',pct(P('random').win),'greedy',pct(P('greedy').win),'| strict-call gap',f2(RM.variance.gapCarefulNaive),'calls/PLAY',f2(RM.calls.surfacedPerPlay));
console.log('wash careful/naive',pct(P('careful').wash),pct(P('naive').wash),'| nothing',pct(PM.nothing));
