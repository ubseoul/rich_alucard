(function(){
 'use strict';
 // F05 - THE TRAP - levels.js
 // THE TRAP sec.6 LEVELS + UPGRADES. Level up by: total cases sold + an authored LEVEL-UP JOB at each tier.
 // The full level-up scenes are NOT authored in OPEN (only THE HOA MEETING premise is). Until content lands the job
 // gate degrades to cases-sold and reports jobSourceRequired=true - no dialogue is invented.
 window.RAF05=window.RAF05||{};
 const R=window.RAF05,U=R.util;
 const A=()=>R.AUTHORED,P=()=>R.PROVISIONAL;

 function recordCases(n){const cur=U.int(R.read('route.casesSold',0));R.patch('route.casesSold',cur+U.int(n));return cur+U.int(n);}
 function casesSold(){return U.int(R.read('route.casesSold',0));}

 function jobState(level){const job=A().levelJobs[level];if(!job)return null;const rec=R.read(`route.levelJobs.${job.id}`,null);return {...job,done:!!(rec&&rec.done),day:rec?rec.day:null};}
 function completeJob(jobId,{source='interface'}={}){
  if(!R.on())return {ok:false,reason:'flag-off'};
  const match=Object.values(A().levelJobs).find(j=>j.id===jobId);if(!match)return {ok:false,reason:'unknown-job'};
  R.patch(`route.levelJobs.${jobId}`,{done:true,day:U.day(),source});
  return {ok:true,jobId};
 }

 // Upgrade effects used elsewhere.
 function hasUpgrade(id){const up=R.read(`route.upgrades.${id}`,null);return !!(up&&up.owned);}
 function buyUpgrade(id){
  if(!R.on())return {ok:false,reason:'flag-off'};
  const def=A().upgrades[id];if(!def)return {ok:false,reason:'unknown-upgrade'};
  if(hasUpgrade(id))return {ok:false,reason:'owned'};
  const cost=U.num(P().upgradeCost[id]);   // provisional; source gives no upgrade price
  const paid=window.RAMoneyLedger?.withSource
   ? window.RAMoneyLedger.withSource('trap:upgrade',()=>cost===0?true:window.RALife.spend(cost),{memo:id})
   : (cost===0?true:window.RALife.spend(cost));
  if(!paid)return {ok:false,reason:'no-money'};
  R.patch(`route.upgrades.${id}`,{owned:true,boughtDay:U.day()});
  return {ok:true,id,cost};
 }

 function nextLevel(){const l=R.store.level();return l>=5?null:l+1;}
 function status(){
  const l=R.store.level();const next=nextLevel();
  if(!next)return {level:l,max:true,casesSold:casesSold(),job:null,eligible:false,jobSourceRequired:false};
  const job=jobState(next);const threshold=U.int(P().casesSoldForLevel[next]);
  const jobSourceRequired=!!(job&&job.contentSourceRequired&&!job.done);
  const jobSatisfied=!job||job.done||jobSourceRequired;   // degrade only when the authored scene is absent
  return {level:l,next,name:A().levels[next].name,casesSold:casesSold(),threshold,
   job, jobSatisfied, jobSourceRequired, eligible:casesSold()>=threshold&&jobSatisfied};
 }
 function levelUp(){
  const s=status();if(!s.eligible||s.next==null)return {ok:false,reason:'not-eligible'};
  const level=s.next;R.patch('route.level',level);
  if(level>=4)R.patch('route.countingRoom',true);   // "the COUNTING ROOM at the castle" (Level 4)
  return {ok:true,level,name:A().levels[level].name,visual:A().levels[level].visual};
 }
 // Try to level up after a night (called at WAKE). Idempotent: a single WAKE advances at most one level.
 function tick(){if(!R.on())return {ok:false,reason:'flag-off'};return levelUp();}

 function upgrading(){const all=R.read('route.upgrades',{})||{};return A().upgrades?Object.keys(A().upgrades).map(id=>({id,...A().upgrades[id],owned:!!(all[id]&&all[id].owned)})):[];}

 R.levels={recordCases,casesSold,jobState,completeJob,hasUpgrade,buyUpgrade,nextLevel,status,levelUp,tick,list:upgrading,
  ages:()=>A().levels};
})();
