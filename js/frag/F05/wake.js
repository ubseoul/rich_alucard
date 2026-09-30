(function(){
 'use strict';
 // F05 - THE TRAP - wake.js
 // THE TRAP sec.5 nightly loop on the frozen IF-1 WAKE/NIGHT bus.
 //   NIGHT: smoke HEAT decays, sales resolve, a raid can be scheduled.
 //   WAKE:  unlock, level-up, one-time world reactions, and the night report / COUNT THE MONEY notices.
 // Handlers are idempotent and no-op while the fragment is OFF, so flags OFF change no accepted behavior.
 window.RAF05=window.RAF05||{};
 const R=window.RAF05,U=R.util;

 function reportSection(){
  const r=R.store.lastReport();if(!r)return null;
  return {text:`${r.cases} cases of ${r.grade} via ${r.channelLabel}. ${U.fmt(r.revenue)}.`,data:r};
 }

 function wakeMain(){
  if(!R.on())return;
  R.unlock.tick();
  R.levels.tick();
  // People notice the trap once, each, the first WAKE after the route is active.
  if(R.store.route().active&&!R.read('flags.peopleNoticed',false)){
   R.reactions.tick({nneka:true,bllad33:true,tristan:true,mom:true,carlos:true});
   R.patch('flags.peopleNoticed',true);
  }
  const r=R.store.lastReport();
  if(r&&U.int(r.day)===U.day()-1&&!R.read(`flags.reported.${r.day}`,false)){
   R.patch(`flags.reported.${r.day}`,true);
   RALife.mail({id:`trap:report:${r.day}`,kind:'money',title:'TRAP NIGHT REPORT',
    body:`${r.cases} cases. ${RALife.fmt(r.revenue)}. heat ${r.heat>=0?'+':''}${r.heat}.`,app:'trap'});
  }
  const pend=R.sales.pending();
  if(pend>0&&!R.read(`flags.countNotice.${U.day()}`,false)){
   R.patch(`flags.countNotice.${U.day()}`,true);
   RALife.mail({id:`trap:count:${U.day()}`,kind:'money',title:'COUNT THE MONEY',body:`${RALife.fmt(pend)} at the trap.`,app:'trap'});
  }
  const rob=R.read('robbery',null);
  if(rob&&rob.notice&&!rob.resolved&&!R.read('flags.robberyNotified',false)){
   R.patch('flags.robberyNotified',true);
   RALife.mail({id:'trap:robbery',kind:'money',title:'TRAP',body:'numbers look light.',app:'trap'});
  }
  const raid=R.raids.pending();
  if(raid&&!R.read(`flags.raidNotified.${raid.id}`,false)){
   R.patch(`flags.raidNotified.${raid.id}`,true);
   RALife.mail({id:`trap:raid:${raid.id}`,kind:'world',title:'RAID',body:`${raid.attacker.label} at ${raid.houseId}.`,app:'trap'});
  }
}

 let registered=false;
 function register(){
  if(registered)return;registered=true;
  const bus=window.RAWakeBus;if(!bus)return;
  // NIGHT phase (priority < 0). Order: decay, resolve sales, schedule a raid.
  bus.subscribe({id:'f05.heat-decay',fragment:'F05',phase:'night',priority:-35,fn:()=>{if(R.on())R.heat.decay();}});
  bus.subscribe({id:'f05.sales-resolve',fragment:'F05',phase:'night',priority:-30,fn:()=>{if(R.on())R.sales.resolveNight();}});
  bus.subscribe({id:'f05.raid-schedule',fragment:'F05',phase:'night',priority:-20,fn:()=>{if(R.on())R.raids.schedule();}});
  // WAKE phase (priority >= 0).
  bus.subscribe({id:'f05.wake',fragment:'F05',phase:'wake',priority:31,fn:()=>{wakeMain();}});
  bus.nightReport.contribute({id:'f05.night-report',fragment:'F05',priority:40,fn:()=>R.on()?reportSection():null});
 }

 R.wake={register,wakeMain,reportSection};
})();
