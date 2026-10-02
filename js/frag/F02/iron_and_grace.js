(function(){
 'use strict';
 // F02 IRON & GRACE — fragment entry. Loads last; exposes the root service, a cheap self-check used by tests/DEV, and
 // the acquisition contracts for guns whose route is owned by another fragment (never granted here). Nothing here
 // mutates accepted state: with every F02 flag OFF the fragment is inert, and the save stays byte-identical.
 const R=window.RAIronAndGrace,C=window.RAIronCatalog,Reg=window.RAPhoneRegistry;
 if(!R||!C)throw new Error('F02 entry must load after catalog + registry');

 // Guns that are defined but not obtainable in OPEN here, because their authored route belongs to another fragment or
 // the sealed authority. Documented so no system silently grants them.
 const PENDING_ACQUISITION=Object.freeze(
  ['blueberry_blaster','legendary_draco','golden_draco'].map(id=>({id,label:C.byId(id).label,kind:C.byId(id).acquisition.kind,fragment:C.byId(id).acquisition.fragment||null,note:C.byId(id).acquisition.note})));

 // Armory phone unlock: the app appears when F02.armory is ON and Rich knows the Armory. The hook is registered ONLY
 // when the flag is ON, so with the fragment dark no WAKE handler is added and the accepted roster is untouched.
 let wakeWired=false;
 function wireWakeUnlock(){
  if(wakeWired||!window.RAIronFlags.armory()||!window.RAWakeBus)return;
  try{
   window.RAWakeBus.subscribe({id:'F02.armory-unlock',fragment:'F02',phase:'wake',priority:71,flag:'F02.armory',
    fn:()=>{if(window.RALife.flag('armoryKnown')&&!window.RALife.appUnlocked('armory'))window.RAPhoneRegistry?.unlock?.('armory');}});
   wakeWired=true;
  }catch(e){/* a priority collision is an integration error; surfaced by selfCheck below */}
 }
 window.RAFeatures?.onChange?.(()=>wireWakeUnlock());
 wireWakeUnlock();

 function selfCheck(){
  const problems=[];
  if(C.count!==13)problems.push(`catalog size ${C.count} !== 13`);
  for(const p of C.validate())problems.push(p);
  for(const g of C.list())if(g.menu?.ammo==null&&!g.menu?.infinite&&!g.menu?.provisionalAmmo)problems.push(`${g.id}: no ammo model`);
  if(!window.RAIronShowdown||!window.RAIronShowdown.pending)problems.push('showdown seam missing');
  if(window.RAIronCombat&&window.RAIronCombat.registered){
   const native=C.list().filter(g=>g.native).map(g=>g.id);
   for(const id of window.RAIronCombat.managed())if(native.includes(id))problems.push(`${id}: native gun re-registered in the F02 combat action`);
  }
  if(window.RAIronFlags.armory()&&!wakeWired)problems.push('F02.armory ON but the Armory unlock wake hook is not wired');
  return {ok:problems.length===0,problems,version:R.version,flags:window.RAIronFlags.all()};
 }

 window.RAIronAndGrace.selfCheck=selfCheck;
 window.RAIronAndGrace.pendingAcquisition=()=>PENDING_ACQUISITION.map(x=>({...x}));
 window.RAIronAndGrace.acquisitionContract=()=>C.list().map(g=>({id:g.id,kind:g.acquisition.kind,note:g.acquisition.note,fragment:g.acquisition.fragment||null,sealed:!!g.acquisition.sealed}));
 // convenience aliases on the root service (the fragment's own objects; accepted globals are untouched)
 window.RAIronAndGrace.armory=window.RAIronArmory;
 window.RAIronAndGrace.combat=window.RAIronCombat;
 window.RAIronAndGrace.range=window.RARangeDayCore;
 window.RAIron={version:R.version,flags:window.RAIronFlags,registry:R,armory:window.RAIronArmory,combat:window.RAIronCombat,showdown:window.RAIronShowdown,range:window.RARangeDayCore,selfCheck};
})();
