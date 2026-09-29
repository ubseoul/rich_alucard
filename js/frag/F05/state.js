(function(){
 'use strict';
 // F05 - THE TRAP - state.js
 // Typed accessors over save.frag.F05 (lazy: nothing is written until a mutator runs while the fragment is on).
 window.RAF05=window.RAF05||{};
 const R=window.RAF05,U=R.util;

 const read=(path,fallback=null)=>window.RAFrag.read('F05',path,fallback);
 const patch=(path,value)=>window.RAFrag.patch('F05',path,value);

 R.state=()=>window.RAFrag.get('F05');
 R.read=read;
 R.patch=patch;

 function route(){return R.read('route',{})||{};}
 function level(){return U.int(route().level)||1;}

 function house(id){return R.read(`houses.${id}`,null);}
 function ownedHouses(){const all=R.read('houses',{})||{};return Object.keys(all).filter(id=>all[id]&&all[id].owned);}
 function hasHouse(id){return ownedHouses().includes(id);}

 function addBatch(batch){const list=(R.read('batches',[])||[]).slice();list.push(batch);patch('batches',list.slice(-200));return batch;}
 function batches(){return (R.read('batches',[])||[]).slice();}
 function removeBatch(id){patch('batches',batches().filter(b=>b.id!==id));}
 function readyBatches(day=U.day()){return batches().filter(b=>U.int(b.readyDay)<=day);}

 function setAssigned(a){patch('assignment',a||null);}
 function assigned(){return R.read('assignment',null);}

 function addUnbanked(n){patch('unbanked',U.int(read('unbanked',0))+U.int(n));}

 function bankUnbanked(){
  const amount=U.int(read('unbanked',0));if(amount<=0)return {ok:false,reason:'nothing-to-count',amount:0};
  patch('unbanked',0);patch('banked',U.int(read('banked',0))+amount);
  return {ok:true,amount};
 }

 function roles(){return R.read('roles',{})||{};}
 function setRole(crewId,role,loyalty=null){
  const rec=(R.read(`roles.${crewId}`,null))||{};
  const next={role,loyalty:loyalty==null?U.int(rec.loyalty):U.int(loyalty)};
  patch(`roles.${crewId}`,next);return next;
 }
 function setLoyalty(crewId,loyalty){const rec=R.read(`roles.${crewId}`,null)||{role:null};rec.loyalty=U.int(loyalty);patch(`roles.${crewId}`,rec);return rec.loyalty;}
 function clearRole(crewId){const all={...(R.read('roles',{})||{})};delete all[crewId];patch('roles',all);}
 function roleOf(crewId){const rec=R.read(`roles.${crewId}`,null);return rec?rec.role:null;}
 function loyaltyOf(crewId){const rec=R.read(`roles.${crewId}`,null);return rec?U.int(rec.loyalty):0;}
 function crewByRole(role){const all=R.read('roles',{})||{};return Object.keys(all).filter(id=>all[id]&&all[id].role===role);}

 function addReport(report){const list=(R.read('reports',[])||[]).slice();list.push(report);patch('reports',list.slice(-10));return report;}
 function lastReport(){const list=R.read('reports',[])||[];return list.length?list[list.length-1]:null;}

 function reactionSeen(id){return !!R.read(`reactions.${id}`,null);}
 function markReaction(id,day=U.day()){patch(`reactions.${id}`,day);return day;}

 function clientLost(id){return !!R.read(`clients.${id}.lost`,false);}
 function loseClient(id,day=U.day()){patch(`clients.${id}`,{lost:true,lostDay:day});return true;}

 R.store={
  route,level,house,ownedHouses,hasHouse,
  addBatch,batches,removeBatch,readyBatches,
  setAssigned,assigned,addUnbanked,bankUnbanked,
  roles,setRole,setLoyalty,clearRole,roleOf,loyaltyOf,crewByRole,
  addReport,lastReport,reactionSeen,markReaction,clientLost,loseClient
 };
})();
