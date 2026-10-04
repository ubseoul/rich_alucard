(function(){
 'use strict';
 // STRIP CLUB — RC2 · BUILD 1 (OL-063). Owns the club's ACCESS RULES and the STRIP CLUB phone app; the throwing itself is F06 MAKE IT RAIN
 // (and F15's dancers) and is untouched. Numbers: RAEcon.stripClub (docs/rc2/ECONOMY_DELTA.md).
 //   ACCESS      open from Day 1, no story gate (was: unlocked after the first world event, see js/if1/first_event_unlock.js).
 //   FIRST VISIT a discount (the house covers a share of every throw) + protection (the visit can never spend more than a share of
 //               the cash Rich walked in with). Both end with the first visit; nothing else about money changes.
 const E=()=>window.RAEcon?.stripClub||{openDay:1,firstVisit:{discount:0,capShare:1},minRound:0};
 const FLAG_DONE='stripClubFirstVisitDone',FLAG_SEEN='stripClubSeen';
 const enabled=()=>!!window.RAFeatures?.enabled('F06.rainmaker');
 const day=()=>window.RALife?.today?.().day||1;
 const isOpen=()=>enabled()&&day()>=(E().openDay||1)&&!!window.RALife?.life?.().clock?.started;
 const firstVisitDone=()=>!!window.RALife?.flag?.(FLAG_DONE);
 // The terms of THIS visit, fixed when the club opens: {first, discount, cap, paid, minRound, line}.
 function terms(){
  const e=E(),cash=window.RALife.money();
  if(firstVisitDone())return {first:false,discount:0,cap:Infinity,paid:0,minRound:e.minRound||0,line:''};
  const cap=Math.max(0,Math.floor(cash*(e.firstVisit.capShare)));
  return {first:true,discount:e.firstVisit.discount,cap,paid:0,minRound:e.minRound||0,line:window.RAEconLines?.get('club.first_visit')||''};
 }
 // One throw's price after the first-visit discount, and the biggest round the cap still allows (in throw dollars, not paid dollars).
 const price=(t,delta)=>t&&t.first?Math.round(delta*(1-t.discount)):delta;
 function room(t){if(!t||!t.first)return Infinity;const left=Math.max(0,t.cap-t.paid);return Math.floor(left/Math.max(.01,1-t.discount)/100)*100;}
 function markFirstVisit(){if(!firstVisitDone())window.RALife.setFlag(FLAG_DONE,true);}
 function open(api){
  if(!isOpen())return false;
  const run=()=>{try{window.RALife.setFlag(FLAG_SEEN,true);window.RALife.setFlag('stripClubLastDay',day());return !!window.RAF06Rainmaker?.launch?.({terms:terms()});}catch(e){console.error('strip club',e);return false;}};
  const closing=api?.close?api.close():null;
  return Promise.resolve(closing).then(run);
 }
 window.RAStripClub={isOpen,enabled,firstVisitDone,terms,price,room,markFirstVisit,open,FLAG_DONE};
 window.RAPhoneApps?.register({id:'stripClub',label:'STRIP CLUB',section:'now',order:4,
  badge:()=>0,
  // direct: the tile goes STRAIGHT to the club (phone.js action 'app:'); render() is only the fallback page.
  direct:api=>window.RAStripClub.open(api),
  render(){return `<h1>STRIP CLUB</h1><button type="button" class="phone-button" data-phone-action="do:stripClub:go">GO</button>`;},
  onAction(act,arg,api){if(act==='go')return window.RAStripClub.open(api);}});
})();
