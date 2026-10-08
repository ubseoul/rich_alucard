(function(){
 'use strict';
 // F05 - THE TRAP - crew.js
 // THE TRAP sec.6/10: cooks, runners, a lookout. Occupants are Ogas where possible (F04 roster via RACrew); when no
 // accepted crew exist the fragment can fill a role with an unnamed placeholder worker via RACrew, so the management
 // loop is playable without inventing named characters or art (crewVisual: artSourceRequired, handled by Visual A).
 // Robbery by your own people (sec.7) lives here: runner loyalty and the skim check.
 window.RAF05=window.RAF05||{};
 const R=window.RAF05,U=R.util;
 const P=()=>R.PROVISIONAL;
 const ROLES=['cook','runner','lookout'];

 // Slots authored by THE TRAP sec.6: Level 2 -> one runner slot + a lookout; Level 3 -> two cooks (Factory).
 function slots(level=R.store.level()){
  return {cook:level>=3?2:1,runner:level>=5?2:(level>=2?1:0),lookout:level>=2?1:0};
 }
 function slotSummary(level=R.store.level()){
  const s=slots(level);const out={};
  for(const role of ROLES){const used=R.store.crewByRole(role).length;out[role]={total:s[role],used,open:Math.max(0,s[role]-used)};}
  return out;
 }

 function candidates(){return window.RACrew?window.RACrew.list({status:'ACTIVE'}):[];}
 function assign(crewId,role){
  if(!ROLES.includes(role))return {ok:false,reason:'unknown-role'};
  if(!window.RACrew||!window.RACrew.get(crewId))return {ok:false,reason:'unknown-crew'};
  const s=slots();if(R.store.crewByRole(role).length>=s[role])return {ok:false,reason:'no-slot'};
  R.store.clearRole(crewId);
  R.store.setRole(crewId,role,U.num(P().loyalty.start));
  return {ok:true,role,crewId,loyalty:R.store.loyaltyOf(crewId)};
 }
 function unassign(crewId){R.store.clearRole(crewId);return {ok:true};}
 function loyalty(crewId){return R.store.loyaltyOf(crewId);}
 function adjustLoyalty(crewId,delta){return R.store.setLoyalty(crewId,U.clamp(R.store.loyaltyOf(crewId)+U.int(delta),0,U.num(P().loyalty.max)));}
 function lowLoyalty(crewId){return R.store.loyaltyOf(crewId)<=U.num(P().loyalty.lowMax);}

 // Placeholder worker: unnamed, no invented identity, marked for Visual A. Deterministic id so saves are stable.
 function recruit(role){
  if(!ROLES.includes(role))return {ok:false,reason:'unknown-role'};
  if(!window.RACrew)return {ok:false,reason:'no-crew-service'};
  const existing=R.store.crewByRole(role).length;const id=`trap_${role}_${existing+1}`;
  if(!window.RACrew.get(id)){
   try{window.RACrew.define({id,fragment:'F05',name:`TRAP ${role.toUpperCase()}`,class:null,meta:{role,placeholder:true,crewVisual:'artSourceRequired',sourceRequired:true}});}
   catch(e){return {ok:false,reason:String(e.message||e)};}
  }
  return assign(id,role);
 }

 // THE TRAP sec.7 robbery-by-your-own-people. Called from the night resolution for a runnered channel.
 // Pure and deterministic given a roll [0,1): returns {skimming,amountPct} or null.
 function skimCheck({runnerId,roll}={}){
  if(!runnerId)return null;
  if(!lowLoyalty(runnerId))return null;
  if(U.num(roll)<U.num(P().robbery.chance))return {skimming:true,runnerId,amountPct:U.num(P().robbery.amountPct)};
  return null;
 }

 // Confront (TALK / FIRE / OCTOPUS BRAIN). The source names the three verbs but no numeric outcomes, so effects are
 // structural only and no dialogue is invented: TALK keeps the runner and restores loyalty; FIRE dismisses them;
 // OCTOPUS BRAIN is a weird lateral resolution that stops the skimming without removing the runner.
 function confront(crewId,method){
  if(!['talk','fire','octopus'].includes(method))return {ok:false,reason:'unknown-method'};
  if(!window.RACrew||!window.RACrew.get(crewId))return {ok:false,reason:'unknown-crew'};
  if(method==='talk'){const l=R.store.setLoyalty(crewId,U.num(P().loyalty.start));return {ok:true,method:'talk',loyalty:l};}
  if(method==='fire'){
   try{window.RACrew.setStatus(crewId,'DISMISSED',{reason:'trap:fire'});}catch(e){}
   R.store.clearRole(crewId);
   return {ok:true,method:'fire',status:'DISMISSED'};
  }
  R.store.setLoyalty(crewId,U.clamp(R.store.loyaltyOf(crewId)+1,0,U.num(P().loyalty.max)));
  return {ok:true,method:'octopus',note:'weird lateral resolution; authored text SOURCE_REQUIRED'};
 }

 let registered=false;
 function register(){
  if(registered)return;registered=true;
  try{window.RACrew?.registerStatus('DISMISSED');}catch(e){if(!/already/.test(String(e.message||e)))throw e;}
 }

 R.crew={ROLES,slots,slotSummary,candidates,assign,unassign,loyalty,adjustLoyalty,lowLoyalty,recruit,skimCheck,confront,register,visual:'artSourceRequired'};
})();
