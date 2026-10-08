(function(){
 'use strict';
 // RAFirstEventUnlock — FCPB CONVERGENCE (integration-owned). Ube decision: RAINMAKER becomes available AFTER THE FIRST EVENT THE
 // PLAYER COMPLETES. No day / money / fame / story gate is added and no progression framework is built.
 //
 // CANONICAL EVENT-COMPLETION SIGNAL (narrowest existing authoritative mechanism): RAWorldEvents (js/systems/world_events.js).
 // An event is COMPLETED when its persisted record reaches status 'resolved' (RAWorldEvents.resolve(): flag + history entry,
 // record kept under save.life.events.records). The predicate is derived from that persisted record, so it is reload-safe and
 // needs no second ledger. Other "completions" in the game (adventure_completed history rows, OGUN'S RAVE night_completed) are
 // different mechanisms and are deliberately NOT blended in; change firstEventCompleted() here if Ube names another one.
 //
 // The unlock itself is RAPhoneRegistry.unlock('rainmaker') -> RALife.unlockApp, which is persisted (save.life.phone.apps) and
 // idempotent (a second call returns false, so the NEW APP notice fires exactly once). It refuses while F06.rainmaker is OFF, so
 // the flag alone never unlocks anything; when the flag is turned ON later the unlock is granted then, if an event was completed.
 // Triggers (all idempotent): a resolve() adapter, flag changes, scene changes (every return to the bedroom) and page load — so a
 // missed call (flag OFF at the time, a crash between the save and the unlock) is repaired by the next trigger. No WAKE handler is
 // added: the frozen IF-1 wake/night roster is unchanged.
 const APP='rainmaker',FLAG='F06.rainmaker';
 function resolvedEvents(){
  const records=window.RAState?.get?.().life?.events?.records||{};
  return Object.keys(records).filter(id=>records[id]&&records[id].status==='resolved').sort();
 }
 const firstEventCompleted=()=>resolvedEvents().length>0;
 function check(){
  try{
   if(!window.RAFeatures?.enabled(FLAG)||!window.RAPhoneRegistry||!window.RALife)return false;
   if(window.RALife.appUnlocked(APP))return false;
   if(!firstEventCompleted())return false;
   return !!window.RAPhoneRegistry.unlock(APP);
  }catch(e){console.error('first-event unlock',e);return false;}
 }
 // adapter: check right after an event resolves (same call, same arguments, same return value)
 function install(){
  const W=window.RAWorldEvents;if(!W||W.__firstEventUnlock||typeof W.resolve!=='function')return false;
  const original=W.resolve;
  W.resolve=function(...args){const out=original.apply(this,args);check();return out;};
  W.__firstEventUnlock=true;return true;
 }
 install();
 window.RAFeatures?.onChange(()=>check());
 try{document.addEventListener('ra:scene',()=>check());document.addEventListener('DOMContentLoaded',()=>check());}catch(e){}
 window.RAFirstEventUnlock={APP,FLAG,firstEventCompleted,resolvedEvents,check,install};
})();
