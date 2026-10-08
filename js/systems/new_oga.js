(function(){
 'use strict';
 const T=()=>window.RANewOgaTunables;
 const current=()=>RAState.get().life.newOga;
 function patch(fields){RAState.patch('life.newOga',{...current(),...fields});return current();}
 function tier(value=current().trust){return value>=T().trustThresholds.HIGH_MIN?'HIGH TRUST':value<=T().trustThresholds.LOW_MAX?'LOW TRUST':null;}
 function adjust(field,amount){return patch({[field]:(Number(current()[field])||0)+(Number(amount)||0)});}
 function close(reason){return patch({status:'closed',m2Outcome:reason||current().m2Outcome,lastMissionDay:RALife.today().day});}
 function backOutM1(){patch({status:'closed',mission:1,m1Route:'backout',lastMissionDay:RALife.today().day});return current();}
 function completeM1(route){
  if(current().m1Rewarded)return current();
  const heat=T().heat[route]||0;
  RALife.addMoney(6000);RALife.addItem('blood_x_case',5);RALife.addItem('smallies_chain',1);
  return patch({status:'awaiting_interview',mission:1,m1Route:route,m1Rewarded:true,gangClout:current().gangClout+T().clout.M1_SUCCESS,heat:current().heat+heat,lastMissionDay:RALife.today().day});
 }
 function answerM2(answer){const key={honest:'M2_HONEST',flex:'M2_FLEX',fish:'M2_FISH'}[answer];return patch({m2Answer:answer,trust:current().trust+(key?T().trust[key]:0)});}
 function payM2(){if(!RALife.spend(20000))return false;patch({status:'closed',mission:2,m2Outcome:'paid',debt:0,trust:current().trust+T().trust.M2_PAY_END,lastMissionDay:RALife.today().day});return true;}
 function workOffM2(){return patch({status:'intern',mission:2,rank:1,title:'INTERN',businessCard:true,debt:20000,m2Outcome:'work_off',trust:current().trust+T().trust.M2_WORK_OFF,lastMissionDay:RALife.today().day});}
 function ensureCarlosMutual(source='m3_fallback'){
  if(current().carlosMutual||current().carlosUnfollowed)return current();
  const day=RALife.today().day;
  patch({carlosMutual:true,carlosMutualDay:day,carlosMutualSource:source});
  window.RAVampGram?.post?.({id:`new-oga:carlos-mutual:${day}`,handle:'carlos',text:source==='grave_garage'?'clips from the garage. 🔥🔥🔥':'saw you at the garage. 🔥',likes:42});
  return current();
 }
 function observeTouge({course,result}={}){if(course==='grave_garage'&&result&&!result.quit)ensureCarlosMutual('grave_garage');return current();}
 function decorateVampGramPost(post){
  const handle=String(post?.handle||'').replace(/[^a-z0-9]/gi,'').toLowerCase();
  if(handle!=='richalucard'||!current().carlosMutual||current().carlosUnfollowed)return post;
  const comments=Array.isArray(post.comments)?post.comments:[];
  return {...post,comments:[...comments,{handle:'carlos',text:'🔥🔥🔥'}]};
 }
 function completeM3(outcome){
  if(outcome==='backout'){patch({status:'intern',mission:3,m3Outcome:'chairs_only',trust:current().trust+T().trust.M3_BACKOUT,gangClout:current().gangClout+T().clout.M3_BACKOUT,lastMissionDay:RALife.today().day});return ensureCarlosMutual('m3_fallback');}
  if(current().m3Rewarded)return current();
  RALife.addMoney(3000);RALife.addItem('jollof_plate',1);
  patch({status:'intern',mission:3,m3Outcome:'complete',m3Rewarded:true,trust:current().trust+T().trust.M3_COMPLETE,gangClout:current().gangClout+T().clout.M3_COMPLETE,lastMissionDay:RALife.today().day});
  return ensureCarlosMutual('m3_fallback');
 }
 function completeM4(outcome,{tougeBand=null}={}){
  if(current().m4Outcome)return current();
  const day=RALife.today().day;
  if(outcome==='walk_in'){
   if(!current().m4Rewarded)RALife.addMoney(T().m4.AUTHORED_WALK_IN_PAY);
   RALife.tendency('messy',T().tendency.M4_WALK_IN_MESSY);
   patch({status:'associate',mission:4,rank:3,title:'ASSOCIATE',m4Outcome:'walk_in',m4Rewarded:true,gangClout:current().gangClout+T().clout.M4_WALK_IN,trust:current().trust+T().trust.M4_WALK_IN,carlosUnfollowed:true,carlosCanopyApron:true,carlosLaterParty:true,carlosLaterStage:'canopy_apron',alternativePending:false,lastMissionDay:day});
   window.RAVampGram?.post?.({id:`new-oga:carlos-unfollow:${day}`,handle:'vampgram.system',text:'carlos unfollowed @richalucard.',likes:0});
   return current();
  }
  const trustKey={beat_1:'M4_BEAT_1',beat_2:'M4_BEAT_2',beat_3:'M4_BEAT_3',run:'M4_RUN'}[outcome];
  if(outcome==='run')RALife.tendency('solid',T().tendency.M4_RUN_SOLID);
  return patch({status:'alternative_pending',mission:4,m4Outcome:outcome,m4TougeBand:tougeBand,carlosEscaped:outcome==='run',alternativePending:true,carlosLaterParty:true,carlosLaterStage:outcome==='run'?'escaped':'mutual',trust:current().trust+(trustKey?T().trust[trustKey]:0),lastMissionDay:day});
 }
 function completeAlternative(){
  if(!current().alternativePending||current().alternativeCompleted)return current();
  if(!current().alternativeRewarded)RALife.addMoney(T().m4.AUTHORED_ALTERNATIVE_PAY);
  return patch({status:'associate',rank:3,title:'ASSOCIATE',alternativePending:false,alternativeCompleted:true,alternativeRewarded:true,gangClout:current().gangClout+T().clout.ALTERNATIVE,lastMissionDay:RALife.today().day});
 }
 function m5Payout(amount){
  const value=Math.max(0,Math.min(T().m5.AUTHORED_DEBT_TARGET,Math.trunc(Number(amount)||0)));
  return Math.floor(value*T().m5.AUTHORED_KEEP_NUMERATOR/T().m5.AUTHORED_KEEP_DENOMINATOR);
 }
 function grantRank4IfReady(){
  const s=current();if(s.rank4Granted||!s.m5Completed||!s.m6Completed)return s;
  return patch({status:'senior_associate',mission:6,rank:4,title:'SENIOR ASSOCIATE',rank4Granted:true,m7Eligible:true});
 }
 function completeM5(result={}){
  if(current().m5Completed)return current();
  const outcome=String(result.outcome||'SHORT').toUpperCase();
  if(!['SUCCESS','SHORT','GREEDY','BACK_OUT'].includes(outcome))throw new Error(`Unknown M5 outcome ${outcome}`);
  const target=T().m5.AUTHORED_DEBT_TARGET;
  const caught=outcome==='SUCCESS'?target:outcome==='GREEDY'||outcome==='BACK_OUT'?0:Math.max(0,Math.min(target,Math.trunc(Number(result.amountCaught)||0)));
  const payout=outcome==='SUCCESS'||outcome==='SHORT'?m5Payout(caught):0;
  const keys={SUCCESS:['M5_SUCCESS','M5_SUCCESS','M5_SUCCESS','M5_SUCCESS_MESSY'],SHORT:['M5_SHORT','M5_SHORT','M5_SHORT','M5_SHORT_MESSY'],GREEDY:['M5_GREEDY','M5_GREEDY','M5_GREEDY','M5_GREEDY_MESSY'],BACK_OUT:['M5_BACKOUT','M5_BACKOUT','M5_BACKOUT','M5_BACKOUT_SOLID']}[outcome];
  if(payout)RALife.addMoney(payout);
  if(outcome==='BACK_OUT')RALife.tendency('solid',T().tendency[keys[3]]);else RALife.tendency('messy',T().tendency[keys[3]]);
  return patch({status:'senator_pending',mission:5,m5Progress:'resolved',m5Outcome:outcome,m5AmountCaught:caught,m5Attention:Math.max(0,Math.min(T().m5.ATTENTION_MAX,Number(result.attention)||0)),m5Completed:true,m5Rewarded:true,gangClout:current().gangClout+T().clout[keys[0]],trust:current().trust+T().trust[keys[1]],heat:current().heat+T().heat[keys[2]],lastMissionDay:RALife.today().day});
 }
 function completeM6(result={}){
  if(current().m6Completed)return current();
  const care=result.care&&typeof result.care==='object'?result.care:{};
  const walked=care.walk===true||result.walked===true;
  const trust=current().trust+T().trust[walked?'M6_WALKED':'M6_LOST'];
  patch({status:'rank4_pending',mission:6,m6Progress:'resolved',m6Outcome:walked?'walked':'lost',m6CareResult:{feed:care.feed===true,walk:walked,joko:care.joko===true},senatorLost:!walked,m6Completed:true,m6ConsequencesApplied:true,trust,gangClout:current().gangClout+T().clout.M6_ALL,heat:current().heat+T().heat.M6_ALL,trustAtM6:trust,senatorCommands:trust>=T().trustThresholds.HIGH_MIN,lastMissionDay:RALife.today().day});
  return grantRank4IfReady();
 }
 function completeM7(outcome){
  if(current().m7ConsequencesApplied)return current();
  if(!['take','refuse'].includes(outcome))throw new Error(`Unknown M7 outcome ${outcome}`);
  return patch({status:'m8_hold',mission:7,m7Eligible:false,m7Progress:'resolved',m7Outcome:outcome,m7Completed:true,m7ConsequencesApplied:true,vaultKnown:true,businessStructureKnown:true,misterDecemberHierarchyKnown:true,leftoversAte:outcome==='take',refusedMama:outcome==='refuse',m8Held:true,trust:current().trust+T().trust[outcome==='take'?'M7_TAKE':'M7_REFUSE'],lastMissionDay:RALife.today().day});
 }
 window.RANewOga={current,patch,tier,adjust,close,backOutM1,completeM1,answerM2,payM2,workOffM2,ensureCarlosMutual,observeTouge,decorateVampGramPost,completeM3,completeM4,completeAlternative,m5Payout,completeM5,completeM6,grantRank4IfReady,completeM7};
})();
