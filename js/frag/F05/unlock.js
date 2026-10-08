(function(){
 'use strict';
 // F05 - THE TRAP - unlock.js
 // THE TRAP sec.1 HOW IT ENTERS THE GAME.
 //   Unlock (any one): NEW OGA rank ASSOCIATE or higher; OR Mister December's Offer accepted (Vol 7 / F04);
 //                     OR Day >= 14 and Rich has jugged the plug (NEW OGA M1 "JUG THE PLUG").
 //   The listing: RealMoneyRealEstate shows a property Shannon would never show a normal client.
 // F04 (War Room) is not on the frozen base, so the December check reads F04's save namespace through a safe
 // adapter and reports F04_INTEGRATION_PENDING when the fragment is absent. No F04 state is created here.
 window.RAF05=window.RAF05||{};
 const R=window.RAF05,U=R.util;
 const A=()=>R.AUTHORED;

 const SHANNON_LINE="I am legally unable to know what you're buying this for.";
 const LISTING_TITLE='CHARMING 3BR. MOTIVATED SELLER. DO NOT ASK.';

 function newOgaState(){try{return window.RANewOga.current();}catch(e){return null;}}
 function associateOrHigher(){const s=newOgaState();return !!s&&U.int(s.rank)>=3;}
 function newOgaFinished(){
  const s=newOgaState();if(!s)return false;
  return s.status==='m8_hold'||U.int(s.mission)>=7||s.m7Completed===true;
 }
 function juggedThePlug(){const s=newOgaState();return !!s&&(s.m1Rewarded===true||!!s.m1Route);}
 function day14(){return U.day()>=14;}

 // F04 / Vol 7 adapter. Reads only; never defines or writes F04.
 function f04Status(){
  if(!window.RAFrag||!window.RAFrag.has('F04'))return {present:false,offerAccepted:false,pending:'F04_INTEGRATION_PENDING'};
  const status=window.RAFrag.read('F04','offer.status',null);
  return {present:true,offerAccepted:status==='accepted'||!!window.RAFrag.read('F04','active',false),pending:null};
 }
 function offerAccepted(){return f04Status().offerAccepted;}

 function eligibility(){
  const conditions={newOgaAssociate:associateOrHigher(),offerAccepted:offerAccepted(),day14Jugged:day14()&&juggedThePlug()};
  const reasons=[];
  if(conditions.newOgaAssociate)reasons.push('new_oga_associate');
  if(conditions.offerAccepted)reasons.push('december_offer');
  if(conditions.day14Jugged)reasons.push('day14_jugged_the_plug');
  return {eligible:reasons.length>0,reasons,conditions,f04:f04Status()};
 }

 function listing(){
  const unlocked=!!R.read('unlocked',false);
  return {
   title:LISTING_TITLE,
   shannon:SHANNON_LINE,
   unlocked,
   houses:Object.values(A().houses).map(h=>({
    id:h.id,label:h.label,where:h.where,price:h.price,capacity:h.capacity,flavor:h.flavor,
    requires:h.requires||null,freeWithChair:!!h.freeWithChair,
    owned:R.store.hasHouse(h.id),
    canBuy:buyCheck(h.id).ok,
    blocked:buyCheck(h.id).reason||null
   }))
  };
 }

 function buyCheck(id){
  const h=A().houses[id];if(!h)return {ok:false,reason:'unknown-house'};
  if(!R.read('unlocked',false))return {ok:false,reason:'not-unlocked'};
  if(R.store.hasHouse(id))return {ok:false,reason:'owned'};
  if(h.requires==='new_oga_finished'&&!newOgaFinished())return {ok:false,reason:'new_oga_not_finished'};
  if(U.num(window.RALife.money())<U.num(h.price))return {ok:false,reason:'no-money'};
  return {ok:true};
 }

 function buy(id){
  const h=A().houses[id];const check=buyCheck(id);
  if(!check.ok)return check;
  const price=U.num(h.price);
  const paid=window.RAMoneyLedger?.withSource
   ? window.RAMoneyLedger.withSource('trap:house',()=>price===0?true:window.RALife.spend(price),{memo:h.label})
   : (price===0?true:window.RALife.spend(price));
  if(!paid)return {ok:false,reason:'no-money'};
  R.patch(`houses.${id}`,{owned:true,boughtDay:U.day(),hotUntilDay:null});
  R.patch('route.active',true);
  return {ok:true,house:id,price};
 }

 // Called at WAKE (flag on). Unlocks the app once and delivers the authored listing notification exactly once.
 function tick(){
  if(!R.on())return {unlocked:false,changed:false};
  if(R.read('unlocked',false))return {unlocked:true,changed:false};
  const e=eligibility();
  if(!e.eligible)return {unlocked:false,changed:false,reasons:[]};
  R.patch('unlocked',true);R.patch('unlockedDay',U.day());
  try{window.RAPhoneRegistry?.unlock?.('trap',{silent:false});}catch(err){}
  try{window.RALife.text('shannon','SHANNON',`${SHANNON_LINE} ${LISTING_TITLE}`,{id:'the-trap:listing'});}catch(err){}
  return {unlocked:true,changed:true,reasons:e.reasons};
 }

 R.unlock={SHANNON_LINE,LISTING_TITLE,newOgaFinished,associateOrHigher,juggedThePlug,f04Status,offerAccepted,eligibility,listing,buyCheck,buy,tick};
})();
