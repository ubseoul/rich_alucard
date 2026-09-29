// Multi-night careers on the shared world (js/frag/F01/play/world.mjs): recovery, the EXTRACT clock, RANSOM, cash/HEAT, boards, line memory.
import './globals.mjs';
import {stream} from './load.mjs';
import * as C from './content.mjs';
import {runPlay,makeDriver} from './driver.mjs';
import * as W from '../../../../js/frag/F01/play/world.mjs';

const POOL=C.JOBS.filter(j=>!j.defense&&!j.bigPlay);
const ugliness={EASY:1,TOUGH:.8,NASTY:.55,'BIG PLAY':.4};
function pickPitch(pol,board,w,R){
 if(pol==='naive')return board[0];
 if(pol==='random')return board[R.int(0,board.length-1)];
 const ready=W.readyOnes(w).length;
 const score=p=>{const j=p.job;const mean=(j.band[0]+j.band[1])/2,hi=j.band[1];
  if(pol==='greedy')return hi;
  return mean*(ugliness[j.ugly]||.6)*(ready<5&&j.ugly!=='EASY'&&j.ugly!=='TOUGH'?.5:1)*(j.bigPlay?.5:1);};
 return [...board].sort((a,b)=>score(b)-score(a))[0];
}
export function runCareer({seed,nights,policy,opts={},big=true,brakes=true}){
 const w=W.newWorld(seed);const R=stream(seed,'career');const recs=[];const boards=[];
 const playOne=(job,pitcher,nameIdx,tag)=>{
  const rec=runPlay({seed:seed*1000+w.night*10+tag,job,policy,opts,night:w.night,pitcher,nameIdx,state:w,intel:w.intel.some(x=>x.job===job.id)});
  rec.night=w.night;rec.career=seed;W.applyResult(w,rec,job);recs.push(rec);return rec;
 };
 for(let night=1;night<=nights;night++){
  W.advanceNight(w);
  // captives: EXTRACT (free of the nightly cap) then, on the last night, RANSOM
  if(brakes)for(const g0 of [...w.captives]){
   const ready=W.readyOnes(w);
   const wantX=policy==='careful'||policy==='naive'||((policy==='random'||policy==='greedy')&&R.chance(.5));
   if(wantX&&ready.length>=2&&w.captives.some(x=>x.gid===g0.gid)){
    const job=W.extractJob(w,g0);const pit=['dre','tunde','half_pint','young_mazi'].find(id=>ready.some(o=>o.id===id))||ready[0].id;
    playOne(job,pit,R.int(0,2),1);
   }
   const g1=w.captives.find(x=>x.gid===g0.gid);
   if(g1&&g1.clock===1){const pay=(policy==='careful'||policy==='greedy')||(policy==='random'&&R.chance(.5));if(pay)W.payRansom(w,g1.gid);}
  }
  const ready=W.readyOnes(w);
  if(ready.length<2){boards.push({night,ready:ready.length,skipped:true});continue;}
  let pick;const hold=w.pending&&w.pending.night<=w.night&&ready.length>=3;
  if(hold){pick={job:C.JOBS.find(j=>j.defense),pitcher:'auntie_grit',nameIdx:R.int(0,2),notice:true};}
  else{const board=W.makeBoard(w,POOL,R,{big:big&&night>=4&&R.chance(.35)});if(!board.length){boards.push({night,ready:ready.length,skipped:true});continue;}pick=pickPitch(policy,board,w,R);}
  boards.push({night,ready:ready.length,picked:pick.job.id});
  playOne(pick.job,pick.pitcher,pick.nameIdx,2);
  w.lastBoardSpecs=[pick.job.id];
 }
 return {recs,boards,state:w};
}
