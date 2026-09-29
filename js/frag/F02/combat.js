(function(){
 'use strict';
 // F02 combat binding (IF-1 4M RACombat2Ext). Registers ONE flag-gated main-menu weapon action — the authored GUN
 // button — for the guns F02 manages in menu combat. With F02.iron_and_grace OFF it is inert (RACombat2Ext gates every
 // dispatch on the flag, and the button does not appear). The five `native:true` guns stay on the accepted Combat 2.0
 // path and are deliberately NOT re-registered here (no duplicate ammo pool, no accepted-data edit).
 const R=window.RAIronAndGrace;
 if(!R)throw new Error('F02 combat must load after js/frag/F02/registry.js');
 const EXT=window.RACombat2Ext;
 if(!EXT){window.RAIronCombat={registered:false,reason:'RACombat2Ext missing'};return;}

 // The gun F02's GUN button fires: the equipped F02-managed gun, else the most recently acquired one.
 function managed(){return R.ownedGuns().filter(g=>!g.native);}
 function currentGun(){
  const owned=managed();if(!owned.length)return null;
  const eq=R.equipped();if(eq&&owned.some(g=>g.id===eq))return eq;
  return owned[owned.length-1].id;
 }
 const label=s=>{const id=currentGun();if(!id)return 'GUN';const ammo=R.ammoFor(s,id);return `GUN: ${R.displayName(id)} (${ammo===Infinity?'∞':ammo})`;};

 EXT.registerWeapon({
  id:'iron_and_grace_gun',fragment:'F02',flag:'F02.iron_and_grace',cls:'c2-gun',label,
  available:s=>{const id=currentGun();return !!id&&R.canFire(s,id);},
  use:(s,action,helpers)=>{const id=(action&&action.gun)||currentGun();if(!id)return s;R.fire(s,id,helpers);return s;}
 });

 window.RAIronCombat={registered:true,currentGun,managed:()=>managed().map(g=>g.id),extension:()=>EXT.registered()};
})();
