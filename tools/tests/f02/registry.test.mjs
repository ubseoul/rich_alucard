// F02 — ownership / equip / mods / use contracts, persistence, invalid combinations, duplicate registration, flags OFF.
import assert from 'node:assert/strict';
import {game,ALL_F02,clearFlags,same} from './_lib.mjs';

export async function test(root){
 const c=await game(root);const R=c.RAIronAndGrace;

 // flags OFF: loading the fragment writes nothing to the save (lazy RAFrag namespace)
 assert.equal(Object.entries(c.RAFeatures.snapshot()).some(([k,v])=>v&&!(k in (c.RAFlagDefaults||{}))),false);
 assert(!c.RAState.get().frag,'F02 activates nothing and writes no save namespace while dark');
 assert.equal(R.describe().core,false);

 // ownership rides the ACCEPTED life.ownership.guns record
 assert.equal(R.grant('mac_and_cheese',{free:true}).ok,true);
 assert.equal(c.RALife.hasGun('mac_and_cheese'),true,'accepted ownership record is the source of truth');
 assert.equal(R.owns('mac_and_cheese'),true);
 assert.equal(R.acquisitionOf('mac_and_cheese').source,'grant');
 assert.equal(R.grant('mac_and_cheese',{free:true}).reason,'owned','no duplicate ownership');

 // purchase gating: dev, acquisition-gated, and funds
 assert.equal(R.buy('triple_k_kratos').reason,'dev','dev gun is not purchasable');
 assert.equal(R.buy('blueberry_blaster').reason,'acquisition-gated',"Mazda's gift is not sold");
 assert.equal(R.buy('blueberry_blaster').fragment,'F03');
 assert.equal(R.buy('rpg').reason,'funds','cannot buy without money');
 const startMoney=c.RALife.money();
 c.RALife.addMoney(1e6);
 assert.equal(R.buy('rpg').ok,true);assert.equal(c.RALife.money(),startMoney+1e6-400000,'authored price paid exactly once');
 assert.equal(R.acquisitionOf('rpg').source,'armory');
 assert.equal(R.grant('tommy_tony',{free:true}).ok,true);

 // equip + loadout slots (1, or 2 with the accepted ARMORY WALL castle room)
 assert.equal(R.equip('sapporo_shotgun').reason,'not-owned');
 assert.equal(R.equip('mac_and_cheese').ok,true);assert.equal(R.equipped(),'mac_and_cheese');
 assert.equal(R.slots(),1);same(R.loadout(),['mac_and_cheese']);
 c.RAState.patch('life.ownership.castleRooms',[{id:'armory_wall'}]);
 assert.equal(R.slots(),2);R.equip('tommy_tony');same(R.loadout(),['tommy_tony','mac_and_cheese']);

 // mods: purchased then attached; max 2 per gun; invalid combinations refused
 c.RALife.addMoney(500000);
 assert.equal(R.buyMod('blessed_rounds').ok,true);
 assert.equal(R.buyMod('drum_mag').ok,true);
 assert.equal(R.buyMod('scope').ok,true);assert.equal(R.buyMod('scope').reason,'owned');
 assert.equal(R.attachMod('mac_and_cheese','scope').ok,true,'scope is not showdown-exclusive at attach time');
 assert.equal(R.attachMod('mac_and_cheese','blessed_rounds').ok,true);
 assert.equal(R.attachMod('mac_and_cheese','drum_mag').reason,'max-mods','third mod refused');
 assert.equal(R.attachMod('mac_and_cheese','blessed_rounds').reason,'already-equipped');
 assert.equal(R.attachMod('rpg','custom_engraving').reason,'not-owned',"cannot attach a mod that was never bought");
 assert.equal(R.attachMod('golden_draco','blessed_rounds').reason,'not-owned','cannot mod a gun you do not own');
 assert.equal(R.attachMod('mac_and_cheese','nope').reason,'unknown');
 same(R.modsFor('mac_and_cheese'),['scope','blessed_rounds']);
 assert.equal(R.bonuses('mac_and_cheese').rangeAim,.10);assert.equal(R.effectiveAmmo('mac_and_cheese'),2,'scope has no ammo effect');
 assert.equal(R.detachMod('mac_and_cheese','scope').ok,true);assert.equal(R.hasMod('mac_and_cheese','scope'),false);
 assert.equal(R.attachMod('mac_and_cheese','drum_mag').ok,true);assert.equal(R.effectiveAmmo('mac_and_cheese'),3,'DRUM MAG +1 ammo per fight');

 // engraving only with CUSTOM ENGRAVING; the name shows in combat display
 assert.equal(R.engrave('mac_and_cheese','MAC DADDY').reason,'no-engraving-mod');
 assert.equal(R.buyMod('custom_engraving').ok,true);
 R.detachMod('mac_and_cheese','drum_mag');
 assert.equal(R.attachMod('mac_and_cheese','custom_engraving').ok,true);
 assert.equal(R.engrave('mac_and_cheese','  MAC DADDY  ').ok,true);
 assert.equal(R.displayName('mac_and_cheese'),'MAC DADDY');
 // BLESSED ROUNDS was attached above, so the gun now resolves the +25% vs vampires/undead
 assert.equal(R.bonuses('mac_and_cheese').vsVampireUndead,.25);
 assert.equal(R.buyMod('blessed_rounds').reason,'owned');

 // persistence: save.frag.F02 survives normalization; the accepted record is untouched
 const save=c.RAState.get();assert(save.frag&&save.frag.F02,'F02 state is persisted in save.frag.F02');
 const migrated=c.RAState.migrateRecord(save);
 assert.equal(migrated.frag.F02.equipped,'tommy_tony');
 assert.equal(migrated.frag.F02.mods.mac_and_cheese.includes('custom_engraving'),true);
 assert.equal(migrated.frag.F02.engravings.mac_and_cheese,'MAC DADDY');
 assert.equal(c.RALife.life().ownership.guns.length,3,'ownership record holds the three bought/granted guns');

 // duplicate registration on the IF-1 combat seam; native guns are never taken over
 assert.throws(()=>c.RACombat2Ext.registerWeapon({id:'iron_and_grace_gun',fragment:'F02',flag:'F02.iron_and_grace',use(){}}),/already registered/);
 assert.equal(c.RAIronCombat.managed().join(','),'mac_and_cheese,tommy_tony');

 clearFlags(c,ALL_F02);
 console.log('PASS F02 registry (ownership, equip/loadout, mods, engraving, purchase gating, persistence, duplicate refusal)');
}
