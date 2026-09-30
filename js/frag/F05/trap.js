(function(){
 'use strict';
 // F05 - THE TRAP - trap.js (facade + boot)
 // Loaded LAST. Everything the fragment does to the shared game is registered here, once, and only while the
 // fragment is ON. With flags OFF the modules still exist (data/logic only) but register nothing and change nothing.
 window.RAF05=window.RAF05||{};
 const R=window.RAF05,U=R.util;
 R.version='1.0.0';
 R.flag=R.MASTER;

 let booted=false;
 function bootOnce(){
  if(booted)return false;booted=true;
  // 1. shared HEAT: configure the authored Vol 7 floors from the ONE HEAT system
  R.heat.register();
  // 2. trap crew statuses on the shared RACrew service
  R.crew.register();
  // 3. minigames (registered only while ON, so flags OFF leave the registry unchanged)
  try{window.RAMinigames?.register?.('f05_cook',R.cookMinigame);}catch(e){}
  try{window.RAMinigames?.register?.('f05_counter',R.counterMinigame);}catch(e){}
  // 4. claim the reserved IF-1 sales channel (metadata + banked income tagging)
  try{
   const S=window.RASalesChannels;
   if(S&&!S.get('trap')?.claimed)S.claim('trap',{fragment:'F05'});
  }catch(e){}
  // 5. declare the phone app. The reserved app slot carries the frozen F05.trap flag; mirror() keeps that flag in
  //    step with the master flag, so either flag drives the app.
  try{
   window.RAPhoneRegistry?.declare?.('F05',{id:'trap',flag:R.RESERVED,render:R.phoneApp.render,onAction:R.phoneApp.onAction});
  }catch(e){}
  // 6. WAKE/NIGHT loop
  R.wake.register();
  return true;
 }
 function boot(){if(!R.on())return false;return bootOnce();}

 // Load-time wiring. Only mirror master -> reserved when the master is ON; never clear an auditor-set reserved flag.
 if(window.RAFeatures&&typeof window.RAFeatures.enabled==='function'){
  if(window.RAFeatures.enabled(R.MASTER))R.mirror(true);
  window.RAFeatures.onChange(ev=>{
   if(ev&&ev.id===R.MASTER)R.mirror(!!ev.enabled);
   if(R.on())boot();
  });
  boot();
 }

 // Public facade. Every mutator is guarded by R.on(); read-only helpers work for tests/UI either way.
 window.RATrap={
  version:R.version,flag:R.MASTER,reservedFlag:R.RESERVED,
  on:R.on,boot,isBooted:()=>booted,
  tunables:R.tunables,
  data:()=>({houses:R.AUTHORED.houses,grades:R.AUTHORED.grades,channels:R.AUTHORED.channels,levels:R.AUTHORED.levels,upgrades:R.AUTHORED.upgrades}),
  eligibility:R.unlock.eligibility,listing:R.unlock.listing,buyHouse:R.unlock.buy,buyCheck:R.unlock.buyCheck,
  houses:R.store.ownedHouses,hasHouse:R.store.hasHouse,
  production:R.production,sales:R.sales,levels:R.levels,crew:R.crew,reactions:R.reactions,raids:R.raids,
  heat:R.heat,weapons:R.weapons,
  state:R.state,
  artNeeds:()=>R.AUTHORED.artNeeds.slice(),sound:()=>({...R.AUTHORED.sound}),
  snapshot(){
   return {on:R.on(),level:R.store.level(),unlocked:!!R.read('unlocked',false),houses:R.store.ownedHouses(),
    unbanked:R.sales.pending(),banked:R.sales.banked(),heat:R.heat.effects(),casesSold:R.levels.casesSold(),
    pendingRaid:!!R.raids.pending(),f01:R.raids.F01_PENDING};
  }
 };
})();
