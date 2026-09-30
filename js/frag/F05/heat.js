(function(){
 'use strict';
 // F05 - THE TRAP - heat.js
 // ONE shared HEAT system (IF-1 RAHeat). No Trap-specific HEAT store.
 //
 // THE TRAP sec.7: "HEAT (shared with Vol 7): every sale adds heat by channel and grade." Vol 7 sec.8 supplies the
 // authored scale/floors/decay. The IF-1 service ships PROVISIONAL placeholder floors because Vol 7 was not in the
 // OPEN repo; now that it is, boot() configures the AUTHORED Vol 7 floors. Configuration happens only while the
 // fragment is ON, so with flags OFF the service keeps its shipped defaults unchanged (zero-change).
 window.RAF05=window.RAF05||{};
 const R=window.RAF05,U=R.util;
 const A=()=>R.AUTHORED,P=()=>R.PROVISIONAL;

 function configure(){
  // FCPB convergence: the floors have ONE owner (RAHeatFloors, js/if1/heat_floors.js); F05 no longer configures HEAT itself.
  return !!(window.RAHeatFloors&&window.RAHeatFloors.ensure());
 }

 function tier(value){try{return window.RAHeat.tierFor(value==null?window.RAHeat.global():value);}catch(e){return 'COOL';}}
 function value(){try{return window.RAHeat.global();}catch(e){return 0;} }

 // Heat delta for a sale of `cases` cases of `grade` through `channel`. Channel heatOverride (wholesale = 0) wins.
 // The per-channel/per-grade weights are PROVISIONAL (owner F13) - the source states the mechanic but no numbers.
 function saleDelta({channelId,grade,cases}){
  const ch=A().channels[channelId];if(!ch)return 0;
  if(ch.heatOverride!=null)return U.int(ch.heatOverride)*U.int(cases);
  const base=U.num(P().heatPerCase[channelId])+U.num(P().heatGradeAdd[grade]);
  const mult=R.store.route().upgrades&&R.store.route().upgrades.better_burner?U.num(P().betterBurnerHeatMult):1;
  return Math.round(base*U.int(cases)*mult);
 }

 function addSale(args){
  const delta=saleDelta(args);if(delta===0)return 0;
  try{window.RAHeat.add(delta,{source:'trap:sale'});}catch(e){}
  return delta;
 }
 function decay(){
  if(!R.on()||!R.store.route().active)return 0;
  try{window.RAHeat.add(A().heat.decayPerSleep,{source:'trap:decay'});}catch(e){}
  return A().heat.decayPerSleep;
 }

 // Tier consequences (THE TRAP sec.7). No new meters and no Hilt gate is touched.
 function effects(){
  const t=tier();const HOT=['HOT','ON FIRE'];
  return {
   tier:t,
   value:value(),
   officerNoddOutside:HOT.includes(t),   // "Officer Nodd sitting outside (sales -)"
   huntersSniffing:HOT.includes(t),      // "hunters sniffing (raids possible)"
   onFire:t==='ON FIRE',                 // Hilt pressure is sealed-owned; this patch never lowers its gates
   raidEligible:HOT.includes(t)
  };
 }

 let registered=false;
 function register(){
  if(registered)return;registered=true;
  configure();
  window.RAHeat.onTierChange(ev=>{
   if(!R.on())return;
   if(ev.scope==='global'&&ev.to==='ON FIRE'){R.patch('flags.onFire',true);}
   if(ev.scope==='global'&&ev.to==='COOL'&&ev.direction==='down'){R.patch('flags.onFire',false);}
  });
 }

 R.heat={configure,tier,value,saleDelta,addSale,decay,effects,register,pending:'F01_INTEGRATION_PENDING'};
})();
