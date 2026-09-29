(function(){
 'use strict';
 // F05 - THE TRAP - raids.js
 // THE TRAP sec.7 RAIDS: "at most one per 7 nights: hunters, the Open Mouth Gang, or a rival crew hits a traphouse
 // -> a SHOWDOWN (Vol 7 rules) on the traphouse map." F01 SHOWDOWN_CORE is NOT frozen, so this module ships
 // ELIGIBILITY, SETUP, STATE, PARTICIPANTS, GEAR/LOADOUT HANDOFF, an ENTRY PACKET and a RESOLUTION INTERFACE with
 // persistence around the event. It implements NO tactical combat, no grid, no substitute resolution and invents no
 // outcomes: F01 (or an authored source) calls resolve() with an outcome.
 window.RAF05=window.RAF05||{};
 const R=window.RAF05,U=R.util;
 const A=()=>R.AUTHORED,P=()=>R.PROVISIONAL;

 const ATTACKERS=[
  {id:'hunters',label:'HUNTERS',note:'human, silver bolts'},
  {id:'open_mouth_gang',label:'THE OPEN MOUTH GANG',note:"Lil Smack's crew"},
  {id:'rival_crew',label:'A RIVAL CREW',note:'someone wants the corner'}
 ];
 const F01_PENDING='F01_INTEGRATION_PENDING';

 function attackerFor(day=U.day()){return ATTACKERS[day%ATTACKERS.length];}
 function daysSinceLast(){const last=R.read('raids.lastDay',null);return last==null?Infinity:U.day()-U.int(last);}
 function heatTierOk(){
  const order=A().heat.tiers;
  return order.indexOf(R.heat.tier())>=order.indexOf(P().raidHeatTier);
 }
 function eligible(){
  if(!R.on())return {ok:false,reason:'flag-off'};
  if(!R.store.route().active)return {ok:false,reason:'route-inactive'};
  if(daysSinceLast()<U.int(A().cost.raidCadenceNights))return {ok:false,reason:'cadence'};
  if(!heatTierOk())return {ok:false,reason:'heat-below-'+P().raidHeatTier};
  if(R.store.ownedHouses().length===0)return {ok:false,reason:'no-house'};
  return {ok:true,attacker:attackerFor()};
 }

 function defenders(){
  const roles=R.store.roles();const ids=Object.keys(roles);
  return ids.map(id=>({id,role:roles[id].role,weapon:R.weapons.owner(id),f01Pending:F01_PENDING}));
 }

 // Build the entry packet F01 consumes once frozen. Contains only eligibility/setup/state/participants/gear.
 function buildEntryPacket({houseId=null}={}){
  const check=eligible();if(!check.ok)return {ok:false,errors:[check.reason]};
  const house=houseId||R.store.ownedHouses()[0];
  const attacker=check.attacker;
  const packet={
   kind:'trap_raid',f01Pending:F01_PENDING,houseId:house,map:'traphouse',
   attacker,defenders:defenders(),
   weapons:{holdTurns:R.weapons.holdTurns(),assignments:R.weapons.list()},
   supports:{cameras:R.levels.hasUpgrade('cameras'),panicRoom:R.levels.hasUpgrade('panic_room')},
   atNight:R.heat.tier(),bigRaid:R.store.level()>=U.int(A().cost.bigRaidLevel)
  };
  return {ok:true,packet};
 }

 function schedule(){
  const check=eligible();if(!check.ok)return check;
  const packet=buildEntryPacket().packet;
  packet.id=`raid:${U.day()}:${packet.houseId}`;
  packet.day=U.day();
  packet.state='pending';
  packet.f01Pending=F01_PENDING;
  R.patch('raids.pending',packet);
  R.patch('raids.lastDay',U.day());
  if(packet.supports.cameras)R.patch('flags.raidWarning',true);   // "see raids early"
  return {ok:true,packet};
 }

 function pending(){return R.read('raids.pending',null);}

 // Resolution interface. NOT called by this fragment: F01 or an authored source calls it with an outcome.
 function resolve({outcome='win',houseId=null}={}){
  const p=pending();if(!p)return {ok:false,reason:'no-pending-raid'};
  const house=houseId||p.houseId;const day=U.day();
  const result={outcome,houseId:house,day,attacker:p.attacker,stashCases:0,unbankedLost:0,hotUntilDay:null,propertyLost:false,crewLost:null};
  if(outcome==='lose'){
   // authored loss: stash (cases) + 30% of unbanked cash, and the house is hot for 5 nights
   const stock=R.store.batches().filter(b=>b.houseId===house);
   result.stashCases=stock.reduce((n,b)=>n+U.int(b.cases),0);
   R.patch('batches',R.store.batches().filter(b=>b.houseId!==house));
   const unbanked=U.int(R.read('unbanked',0));result.unbankedLost=Math.round(unbanked*U.num(A().cost.raidLossUnbankedPct));
   R.patch('unbanked',unbanked-result.unbankedLost);
   const hotUntil=day+U.int(A().cost.raidHotNights);
   R.patch(`houses.${house}.hotUntilDay`,hotUntil);result.hotUntilDay=hotUntil;
   // panic room protects crew during raids; without it the crew can be taken (state, not combat)
   if(!(p.supports&&p.supports.panicRoom)&&p.defenders&&p.defenders.length){
    const victim=p.defenders[0].id;
    try{window.RACrew?.setStatus(victim,'CAPTURED',{reason:'trap:raid',timer:{name:'extract_window',days:3,onExpire:'GONE'}});}catch(e){}
    result.crewLost=victim;
   }
  }
  if(outcome==='big_raid'){
   // "at EMPIRE level, one authored BIG RAID can take a property permanently"; Rich keeps castle, cars and banked cash
   result.propertyLost=true;result.keeps=A().cost.bigRaidKeeps.slice();
   R.patch(`houses.${house}.owned`,false);
   R.patch(`houses.${house}.lostDay`,day);
  }
  const history=(R.read('raids.history',[])||[]).slice();history.push(result);R.patch('raids.history',history.slice(-20));
  R.patch('raids.pending',null);
  R.patch('flags.raidWarning',false);
  return {ok:true,result};
 }

 function cancel(reason='cancelled'){
  const p=pending();if(!p)return {ok:false,reason:'no-pending-raid'};
  R.patch('raids.pending',null);R.patch('flags.raidWarning',false);
  return {ok:true,reason};
 }

 R.raids={ATTACKERS,F01_PENDING,attackerFor,daysSinceLast,eligible,defenders,buildEntryPacket,schedule,pending,resolve,cancel,
  history:()=>(R.read('raids.history',[])||[]).slice(),status:()=>({pending:pending(),lastDay:R.read('raids.lastDay',null)})};
})();
