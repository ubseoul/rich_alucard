(function(){
 'use strict';
 // F05 - THE TRAP - weapons.js
 // F02 WEAPON SEAM. THE TRAP sec.9 (Guns patch): "guns protect traphouses (lookouts carry them; raids use them)".
 // F02 IRON_AND_GRACE is NOT on the frozen base. Its documented TRAP-facing API is:
 //   RAIronAndGrace.trap.assign(ownerId, gunId) -> {ok,owner,gun}
 //   RAIronAndGrace.trap.owner(ownerId)         -> gunId|null
 //   RAIronAndGrace.trap.clear(ownerId)         -> {ok}
 //   RAIronAndGrace.trap.list()                 -> [{owner,gun,resolved}]
 //   RAIronAndGrace.trap.holdTurns()            -> [1,2]  (door-hold rule; not simulated)
 // When F02 is present this adapter DELEGATES and stores nothing itself: F02 owns weapon ownership
 // (save.frag.F02.trap.<owner>). When F02 is absent it keeps an isolated local fallback in save.frag.F05.weapons
 // and reports F02_INTEGRATION_PENDING, so no second ownership model exists once F02 lands.
 window.RAF05=window.RAF05||{};
 const R=window.RAF05,U=R.util;

 const OWNER_PREFIX='trap:';
 const ownerFor=id=>`${OWNER_PREFIX}${id}`;
 const f02=()=>{
  const G=window.RAIronAndGrace;
  if(G&&G.trap&&typeof G.trap.assign==='function')return G.trap;
  return null;
 };

 function status(){return {f02:!!f02(),pending:f02()?null:'F02_INTEGRATION_PENDING'};}

 function assign(ownerId,gunId){
  if(!ownerId)return {ok:false,reason:'owner'};
  const t=f02();
  if(t)return t.assign(ownerFor(ownerId),gunId);
  // isolated fallback - never written when F02 is present
  if(!R.on())return {ok:false,reason:'flag-off'};
  R.patch(`weapons.${ownerId}`,gunId||null);
  R.patch('weaponsPending','F02_INTEGRATION_PENDING');
  return {ok:true,owner:ownerId,gun:gunId||null,pending:'F02_INTEGRATION_PENDING'};
 }
 function owner(ownerId){
  const t=f02();if(t)return t.owner(ownerFor(ownerId));
  return R.read(`weapons.${ownerId}`,null);
 }
 function clear(ownerId){
  const t=f02();if(t)return t.clear(ownerFor(ownerId));
  const all={...(R.read('weapons',{})||{})};delete all[ownerId];R.patch('weapons',all);return {ok:true};
 }
 function list(){
  const t=f02();if(t)return t.list().filter(x=>String(x.owner).startsWith(OWNER_PREFIX)).map(x=>({owner:x.owner.slice(OWNER_PREFIX.length),gun:x.gun,resolved:x.resolved}));
  return Object.entries(R.read('weapons',{})||{}).map(([owner,gun])=>({owner,gun}));
 }
 function holdTurns(){
  const t=f02();if(t)return t.holdTurns();
  return {turns:[],pending:'F01_INTEGRATION_PENDING',note:'traphouse lookout door-hold is not simulated in OPEN'};
 }

 R.weapons={assign,owner,clear,list,holdTurns,status,OWNER_PREFIX};
})();
