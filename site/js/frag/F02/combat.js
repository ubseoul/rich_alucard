(function(){
 'use strict';
 // F02 combat binding (IF-1 4M RACombat2Ext). Each equipped slot gets a flag-gated GUN action.
 // While ON, native guns use this same loadout/mod/ammo path; accepted gun data remains unchanged.
 // While OFF, extension dispatch is inert and Combat 2.0 retains its accepted native path.
 const R=window.RAIronAndGrace;
 if(!R)throw new Error('F02 combat must load after js/frag/F02/registry.js');
 const EXT=window.RACombat2Ext;
 if(!EXT){window.RAIronCombat={registered:false,reason:'RACombat2Ext missing'};return;}

 // The primary GUN action follows the equipped loadout; the secondary requires the authored Armory Wall slot.
 function managed(){return R.ownedGuns().filter(g=>!g.native);}
 function currentGun(){
  const owned=R.ownedGuns().filter(g=>!g.dev||window.RALife.flag('devKratos'));if(!owned.length)return null;
  const eq=R.equipped();if(eq&&owned.some(g=>g.id===eq))return eq;
  const first=R.loadout()[0];if(first&&owned.some(g=>g.id===first))return first;
  return owned[owned.length-1].id;
 }
 const secondaryGun=()=>R.loadout().filter(id=>!R.gun(id)?.dev||window.RALife.flag('devKratos'))[1];
 const label=(s,id=currentGun())=>{if(!id)return 'GUN';const ammo=R.ammoFor(s,id);return `GUN: ${R.displayName(id)} (${ammo===Infinity?'∞':ammo})`;};

 EXT.registerWeapon({
  id:'iron_and_grace_gun',fragment:'F02',flag:'F02.iron_and_grace',cls:'c2-gun',label:s=>label(s),gun:()=>currentGun(),
  available:s=>{const id=currentGun();return !!id&&R.canFire(s,id);},
  use:(s,action,helpers)=>{const id=(action&&action.gun)||currentGun();if(!id)return s;R.fire(s,id,helpers);return s;}
 });
 EXT.registerWeapon({id:'iron_and_grace_secondary',fragment:'F02',flag:'F02.iron_and_grace',cls:'c2-gun',
  label:s=>label(s,secondaryGun()),gun:()=>secondaryGun(),
  available:s=>!!secondaryGun()&&R.canFire(s,secondaryGun()),
  use:(s,action,helpers)=>{const id=secondaryGun();if(id)R.fire(s,id,helpers);return s;}
 });

 window.RAIronCombat={registered:true,currentGun,managed:()=>managed().map(g=>g.id),extension:()=>EXT.registered()};
})();
