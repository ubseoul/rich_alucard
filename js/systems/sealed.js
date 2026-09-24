(function(){
 // PLAYER-BLIND integration points (VOL 1 §10.4, §13; HQ Addendum §6). Neutral codes only.
 // This OPEN build ships NO sealed content. A separate HQ-authorized session installs a pack via
 // RASealed.install(pack) from js/sealed/pack.js. Every hook below is a safe no-op until then.
 const SLOTS={
  S01:'core phone/world events',S02:'owns a car',S03:'a person at CLOSE',S04:'owns meaningful assets',
  S05:'midgame',S06:'owns the dragon',S07:'multiple contacts',S08:'high life momentum',
  'ARC-X':'sealed arc','HQ-M01':'hq micro-moment','HQ-M02':'hq micro-moment','HQ-M03':'hq micro-moment',
  SPARK:'fame spark pool',PRESSURE:'vampire pressure thresholds/consequences',TENDENCY:'solid/messy single use',
  LEDGER:'laura ledger endpoint',CUBE:'maggi cube extra use',CHEST:'pier chest sealed result',DRAGON2:'second dragon',
  CRYPTRAT:'cryptrat disposition',PROPERTY:'existing property sealed consequences'
 };
 let pack=null;
 // PROVISIONAL engineering defaults so OPEN lanes that depend on a sealed number still run end to end.
 // They are tuning, not content; a sealed pack overrides them wholesale.
 const PROVISIONAL={pressure:{visible:2,warning:4},spark:{threshold:5},fameMinDay:35,fameSafetyDay:65};
 function install(p){pack=p||null;if(pack?.adventures)for(const def of pack.adventures)window.RAAdventures?.define?.(def);if(pack?.temptations)window.RATemptations?.define?.(pack.temptations);if(pack?.wake)window.RAWakeTriggers?.define?.(pack.wake);return !!pack;}
 const installed=()=>!!pack;
 function tuning(key){return pack?.tuning?.[key]??PROVISIONAL[key];}
 function fire(slot,ctx){if(!SLOTS[slot])return null;const handler=pack?.hooks?.[slot];if(typeof handler!=='function')return null;try{return handler(ctx)}catch(e){console.error('sealed hook',e);return null}}
 function mark(slot,data=true){const slots={...(RAState.get().life.sealed.slots||{})};slots[slot]={...(typeof slots[slot]==='object'?slots[slot]:{}),touched:true,day:window.RALife?.today?.().day,data};RAState.patch('life.sealed.slots',slots);}
 window.RASealed={SLOTS,install,installed,tuning,fire,mark,provisional:PROVISIONAL};
})();
