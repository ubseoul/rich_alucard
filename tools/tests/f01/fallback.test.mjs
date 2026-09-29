// F01 THE PLAY — FALL BACK v1 (OL-022): the defense-only last-stand exit. Predicate, exclusions, outcome isolation, headline, lines, 0-repeat.
import assert from 'node:assert/strict';
import path from 'node:path';import {pathToFileURL} from 'node:url';

export async function test(root){
  const dir=path.join(root,'tools','tests','f01','play-sim');
  const imp=f=>import(pathToFileURL(path.join(dir,f)).href);
  const {runPlay,bailEligible,fallBackEligible,startRoster}=await imp('driver.mjs');
  const {JOBS}=await imp('content.mjs');
  const W=await import(pathToFileURL(path.join(root,'js','frag','F01','play','world.mjs')).href);
  const L=await import(pathToFileURL(path.join(root,'js','frag','F01','play','lines.mjs')).href);
  let violations=0;const check=(cond,msg)=>{if(!cond){violations++;console.error('INVARIANT VIOLATION: '+msg);}assert(cond,msg);};
  const o=(id,hp,extra={})=>({id,hp,maxhp:6,out:null,fled:false,rescued:false,...extra});
  const P=(job={},crew=[o('a',3),o('b',0)],over={})=>({opts:{},job:{bigPlay:false,defense:true,...job},crew,getawayStarted:false,...over});
  // 1 eligible HOLD scenario
  check(fallBackEligible(P())===true,'1 eligible HOLD scenario -> FALL BACK can fire');
  // 2 0 able -> never FALL BACK (WASH-equivalent)
  check(fallBackEligible(P({}, [o('a',0),o('b',0)]))===false,'2 HOLD with 0 able is never FALL BACK');
  // 3 BAILED on HOLD impossible
  check(bailEligible(P())===false,'3 BAILED on HOLD is impossible');
  // 4 routine offense / 5 BIG PLAY
  check(fallBackEligible(P({defense:false}))===false,'4 FALL BACK on routine offense is impossible');
  check(fallBackEligible(P({defense:false,bigPlay:true}))===false,'5a FALL BACK on BIG PLAY is impossible');
  check(fallBackEligible(P({defense:true,bigPlay:true}))===false,'5b nor on a job flagged BIG PLAY');
  // parity guards
  check(fallBackEligible(P({}, [o('a',3)]))===false,'crew at start >= 2');
  check(fallBackEligible(P({}, [o('a',3),o('b',3),o('c',0)]))===false,'exactly 1 able (2 able is not FALL BACK)');
  check(fallBackEligible(P({}, [o('a',3),o('b',3)]))===false,'needs >= 1 downed');
  check(fallBackEligible(P({}, [o('a',3),o('b',0),o('c',0,{out:'DEAD'})]))===false,'0 deaths: nobody already dead');
  check(fallBackEligible(P({}, undefined,{getawayStarted:true}))===false,'never once the resolution phase begins');
  // ---- outcomes over a full matrix (every job x every policy) ----
  let plays=0,fb=0,holdN=0,holdWash=0;
  const hold=JOBS.find(j=>j.defense);
  for(const job of JOBS)for(const pol of ['careful','greedy','naive','random'])for(let s=1;s<=25;s++){
    const rec=runPlay({seed:job.id.length*1000+s*7,job,policy:pol});plays++;
    if(job.defense){holdN++;if(rec.klass==='WASH'){holdWash++;check(!rec.fellBack,'2b a WASH is never FALL BACK');}}
    if(!rec.fellBack){check(rec.klass!=='FELL_BACK','klass without flag');if(rec.bailed)check(!job.defense,'3b BAILED never on HOLD');continue;}
    fb++;
    check(job.defense&&!job.bigPlay,'4/5 FALL BACK only on defense, never offense/BIG PLAY');
    check(rec.crew.length>=2,'crew>=2');
    check(!rec.bailed&&!rec.robbed&&!rec.losses.some(l=>l.kind==='ROBBED'||l.kind==='BAILED')&&rec.klass==='FELL_BACK'&&rec.win===false&&rec.getaway==='FALL_BACK','12 no ROBBED/JUGGED/BAILED contamination; own state');
    check(rec.pot.cash===0&&rec.pot.crates.length===0,'7 raid product lost');
    check(rec.losses.some(l=>l.kind==='STASH RAIDED'),'7b STASH RAIDED entry');
    for(const [id,st] of Object.entries(rec.finalStatus))check(['READY','WOUNDED'].includes(st),`8/9 0 capture, 0 death (${id} ${st})`);
    check(rec.crew.some(id=>rec.finalStatus[id]==='WOUNDED'),'10 downed -> WOUNDED');
    check(rec.heatDelta===job.heat,'11 base HEAT only');
    check(rec.report.some(l=>l.startsWith("FELL BACK — THE HOUSE IS HIT, THE CREW ISN'T")),'13 exact headline');
    check(!rec.report.some(l=>/BAILED/.test(l)),'13b no BAILED text on a FALL BACK card');
    check(rec.morning.seeds.every(x=>x.perk!=='got_everybody_out'),'BAILED memory never attached to FALL BACK');
  }
  check(fb>0,'1b the matrix exercised FALL BACK');
  // 6 banked money preserved (through the world layer)
  let bankedChecked=0;
  for(let seed=1;seed<=200&&bankedChecked<3;seed++){
    const w=W.newWorld(seed);W.advanceNight(w);w.cash=77;
    const rec=runPlay({seed:seed*31,job:hold,policy:'random',state:w});
    if(!rec.fellBack)continue;
    const before=w.cash;W.applyResult(w,rec,hold);
    check(w.cash===before-(rec.spent||0)-(rec.pocketLoss||0)&&(rec.pocketLoss||0)===0,'6 banked money untouched by FALL BACK');
    check(!w.captives.length&&w.roster.every(x=>x.status!=='DEAD'&&x.status!=='CAPTURED'&&x.status!=='GONE'),'8b/9b no captive, no death in the world');
    bankedChecked++;
  }
  check(bankedChecked>0,'6b banked-money scenario reached');
  // 14 >= 4 line variants, genuinely different
  const V=L.LINES['fallback:line'];check(V&&V.length>=4&&new Set(V).size===V.length,'14 >= 4 distinct FALL BACK variants');
  check(V.every(v=>!L.LINES['bail:line'].includes(v)),'14b FALL BACK lines are not BAILED lines');
  // 15 0-repeat inside 3 PLAYs (world memory), 400 sequential PLAYs
  {const recent=[];let rep=0;
   for(let n=0;n<400;n++){const set=new Set(recent.flat());const Q={seed:n*13+5,recentSet:set,recentAge:{},usedLines:new Set(),lineLog:[],lineN:0,sim:false};
    L.pickLine(Q,'fallback:line',{a:'Dre'});for(const id of Q.lineLog)if(set.has(id))rep++;recent.push(Q.lineLog);if(recent.length>3)recent.shift();}
   check(rep===0,'15 0 repeats within 3 PLAYs');}
  console.log(`PASS F01 FALL BACK v1 (15 requirement groups; ${plays} PLAYs, ${fb} FELL BACK on HOLD [HOLD n=${holdN}, WASH ${holdWash}]; ${V.length} line variants; invariant violations: ${violations})`);
  assert.equal(violations,0);
}
