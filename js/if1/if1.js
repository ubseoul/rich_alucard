(function(){
 'use strict';
 // RAIF1 — IF-1 "Integration Spine" v1.0 root. Loads AFTER every IF-1 module and every accepted system, BEFORE any
 // fragment slot. It (a) names the frozen module surface, (b) installs the compatibility adapters that let IF-1 services
 // observe accepted systems without editing them, and (c) exposes a self-check used by the contract tests and DEV.
 //
 // FREEZE: v1.0 is FROZEN (F00 accepted). Changes are ADDITIVE ONLY and are made
 // only by the integration owner (see docs/engineering/IF1_INTEGRATION_SPINE.md). tools/tests/if1/contract-v1.0.json is
 // the machine-readable frozen surface; a missing member fails the contract test, a new member is fine.
 const VERSION='1.0.0';
 const FREEZE=Object.freeze({status:'frozen',note:'IF-1 v1.0 FROZEN at F00 acceptance (tag if1-v1.0); changes are additive-only and owner-only'});
 const MODULES=Object.freeze({
  RAFeatures:'4A feature-flag registry',RAFlagDefaults:'4A owner-promoted flag defaults',
  RAMigrations:'4B migration registry',RAMigrationLedger:'4B owner-assigned version ledger',RAFrag:'4B per-fragment save namespaces',RAStateWatch:'IF-1 state observation seam',
  RAWakeBus:'4C WAKE/NIGHT event bus',RAPhoneRegistry:'4D phone app registry',
  RAMoneyLedger:'4E money ledger',RAHeat:'4F HEAT service',RASocial:'4G trust/clout/tendency',RACrew:'4H crew registry',
  RAVehicles:'4I vehicle service',RADistricts:'4J district control',RAVampGramAPI:'4K VampGram API',RASalesChannels:'4L sales channels',
  RACombat2Ext:'4M combat2 extension points',RAArtParts:'4O art registry parts',RAAudioParts:'4P audio manifest parts'
 });
 const adapters={
  done:new Set(),
  // NEW OGA money: tag every money movement inside an accepted NEW OGA outcome function 'new_oga:<fn>'. Same arguments, same
  // return value, same behavior — the tag is only ambient context for the ledger.
  newOgaMoney(){
   const O=window.RANewOga,L=window.RAMoneyLedger;if(!O||!L||adapters.done.has('newOgaMoney'))return false;
   for(const name of ['backOutM1','completeM1','payM2','workOffM2','completeM3','completeM4','completeAlternative','completeM5','completeM6','completeM7']){
    const original=O[name];if(typeof original!=='function')continue;
    O[name]=function(...args){return L.withSource(`new_oga:${name.replace(/^complete/,'').toLowerCase()||name}`,()=>original.apply(this,args));};
   }
   adapters.done.add('newOgaMoney');return true;
  },
  install(){const out={};for(const name of ['newOgaMoney'])out[name]=adapters[name]();return out;},
  installed:()=>[...adapters.done]
 };
 function describe(){
  const modules={};
  for(const name of Object.keys(MODULES)){const m=window[name];modules[name]={present:!!m,api:m&&typeof m==='object'?Object.keys(m).sort():[]};}
  return {version:VERSION,freeze:{...FREEZE},modules};
 }
 // Cheap invariants the owner can run anywhere (DEV console, contract test, nightly smoke).
 function selfCheck(){
  const problems=[];
  for(const name of Object.keys(MODULES))if(!window[name])problems.push(`missing module ${name}`);
  try{problems.push(...(window.RAMigrations?.validate?.()||[]));}catch(e){problems.push(String(e.message||e));}
  const on=window.RAFeatures?.list?.().filter(f=>f.enabled&&f.fragment!=='if1')||[];
  return {ok:problems.length===0,problems,fragmentFlagsOn:on.map(f=>f.id),version:VERSION};
 }
 window.RAIF1={version:VERSION,freeze:FREEZE,modules:Object.keys(MODULES),adapters,describe,selfCheck};
 adapters.install();
 document.addEventListener?.('DOMContentLoaded',()=>adapters.install());
})();
