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
 function completeM3(outcome){
  if(outcome==='backout')return patch({status:'intern',mission:3,m3Outcome:'chairs_only',trust:current().trust+T().trust.M3_BACKOUT,gangClout:current().gangClout+T().clout.M3_BACKOUT,lastMissionDay:RALife.today().day});
  if(current().m3Rewarded)return current();
  RALife.addMoney(3000);RALife.addItem('jollof_plate',1);
  return patch({status:'intern',mission:3,m3Outcome:'complete',m3Rewarded:true,trust:current().trust+T().trust.M3_COMPLETE,gangClout:current().gangClout+T().clout.M3_COMPLETE,lastMissionDay:RALife.today().day});
 }
 window.RANewOga={current,patch,tier,adjust,close,backOutM1,completeM1,answerM2,payM2,workOffM2,completeM3};
})();
