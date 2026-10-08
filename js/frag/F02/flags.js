(function(){
 'use strict';
 // F02 flags. The two top-level flags are RESERVED and already registered dark by js/if1/features.js; calling register
 // again with the same fragment is idempotent (it returns the existing spec). The fragment adds its own sub-flag. Every
 // flag ships OFF and can never default ON (RAFeatures enforces it; only js/if1/flag_defaults.js ships a flag ON).
 const F=window.RAFeatures;
 if(!F)return;
 F.register({id:'F02.iron_and_grace',fragment:'F02',description:'IRON & GRACE: gun weaving, mods, firearm feedback, Showdown/Trap data'});
 F.register({id:'F02.armory',fragment:'F02',description:'Armory phone app (guns, workbench mods, Range Day)'});
 F.register({id:'F02.range_day',fragment:'F02',requires:['F02.armory'],description:'Range Day minigame (Armory basement range)'});
 window.RAIronFlags={
  core:()=>F.enabled('F02.iron_and_grace'),
  armory:()=>F.enabled('F02.armory'),
  range:()=>F.enabled('F02.range_day'),
  all:()=>F.snapshot(),
  onChange:fn=>F.onChange(fn)
 };
})();
