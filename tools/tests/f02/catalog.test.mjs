// F02 — every authored gun definition + mods (catalog integrity, native-number parity, acquisition/audio/art honesty).
import assert from 'node:assert/strict';
import {game,ALL_F02,same} from './_lib.mjs';

const AUTHORED=['lil_oga','sapporo_shotgun','mac_and_cheese','chopstick_sniper','tommy_tony','holy_baby_drake',
 'jollof_burner','blueberry_blaster','legendary_draco','golden_draco','rpg','auntie_slipper','triple_k_kratos'];

export async function test(root){
 const c=await game(root);
 const C=c.RAIronCatalog,R=c.RAIronAndGrace;
 assert.equal(C.count,13,'the patch authors exactly 13 guns');
 same(C.list().map(g=>g.id),AUTHORED,'the catalog is exactly the authored arsenal — no invented weapons');
 same(C.validate(),[],'catalog validation is clean');
 for(const id of ALL_F02)assert.equal(c.RAFeatures.enabled(id),false,`${id} is dark`);
 assert.equal(R.selfCheck().ok,true,`selfCheck: ${R.selfCheck().problems.join('; ')}`);

 // Native guns keep the accepted Combat 2.0 numbers byte-for-byte (F02 does not own them).
 const D=c.RACombatData.GUNS;
 for(const g of C.list().filter(g=>g.native)){
  const a=D[g.id];assert(a,`${g.id} is marked native but absent from RACombatData.GUNS`);
  if(g.menu.infinite)continue;
  for(const k of ['dmg','ammo','hits','sure','vsUndead','healPerShot','turn1Crit','splash'])if(a[k]!==undefined)
   assert.equal(g.menu[k],a[k],`${g.id}.menu.${k} drifted from the accepted value`);
 }
 // The F02-managed guns are exactly the ones the accepted data does NOT already own.
 same(C.list().filter(g=>!g.native).map(g=>g.id),
  ['mac_and_cheese','tommy_tony','jollof_burner','blueberry_blaster','legendary_draco','golden_draco','auntie_slipper'],
  'seven F02-managed guns (the accepted five + dev Kratos stay native)');

 // Authored stats spot-checks straight from the patch table.
 const byId=C.byId;
 assert.equal(byId('mac_and_cheese').price,75000);same(byId('mac_and_cheese').menu.suppress,{accDown:.2,turns:1});
 assert.equal(byId('tommy_tony').menu.consecutive,.10);assert.equal(byId('tommy_tony').menu.hits,6);
 assert.equal(byId('jollof_burner').menu.burn.dmg,8);assert.equal(byId('jollof_burner').menu.burn.turns,3);
 assert.equal(byId('blueberry_blaster').menu.condition.flag,'mazdaMajestic');assert.equal(byId('blueberry_blaster').price,null);
 assert.equal(byId('legendary_draco').showdown.hits,2);assert.equal(byId('golden_draco').menu.blind.accDown,.15);
 assert.equal(byId('auntie_slipper').menu.infinite,true);assert.equal(byId('auntie_slipper').price,12);
 assert.equal(byId('rpg').menu.splash,10);assert.equal(byId('rpg').menu.heat,10);
 assert.equal(byId('triple_k_kratos').dev,true);

 // Mods: six, authored prices/effects, max 2 per gun (a provisional F13 ceiling).
 assert.equal(C.mods().length,6);same(C.mods().map(m=>m.id),
  ['blessed_rounds','drum_mag','silencer','scope','gold_plating','custom_engraving']);
 assert.equal(C.MODS.blessed_rounds.price,15000);assert.equal(C.MODS.drum_mag.price,20000);
 assert.equal(C.MODS.silencer.conceal,true);assert.equal(C.MODS.scope.rangeAim,.10);
 assert.equal(C.MODS.gold_plating.clout,5);assert.equal(C.MODS.custom_engraving.engraving,true);
 assert.equal(C.TUNABLES.maxModsPerGun,2);assert.equal(C.TUNABLES.provisional,true);assert.equal(C.TUNABLES.owner,'F13');

 // Sound: existing ids cover the five base + dev; GN_01–GN_06 cover the new guns; the Dracos are honest gaps.
 const audio=C.audioMap();
 same(audio.lil_oga,'GUN_LILOGA');same(audio.sapporo_shotgun,'GUN_SHOTGUN');
 same(audio.chopstick_sniper,'GUN_SNIPER');same(audio.holy_baby_drake,'GUN_HOLYDRAKE');
 same(audio.rpg,'GUN_RPG');same(audio.triple_k_kratos,'GUN_KRATOS');
 same(audio.mac_and_cheese,'GN_01');same(audio.tommy_tony,'GN_02');
 same(audio.jollof_burner,'GN_03');same(audio.blueberry_blaster,'GN_04');
 same(audio.auntie_slipper,'GN_05');
 assert.equal(byId('legendary_draco').audio,null);assert.equal(byId('legendary_draco').audioSourceRequired,true);
 assert.equal(byId('golden_draco').audio,null);assert.equal(byId('golden_draco').audioSourceRequired,true,'no sound was invented for the Golden Draco');

 // No art is invented for the new guns; the five frozen pairs are referenced by their registry key.
 for(const g of C.list().filter(g=>!g.native&&!g.dev))assert.equal(g.art,null,`${g.id}: art must not be invented`);
 assert.equal(c.RAArtRegistry.items.guns[byId('lil_oga').art].case.asset,'assets/before_the_fame/art_ship_014/package_e/E-gun-lil_oga-case.png');

 console.log('PASS F02 catalog (13 authored guns, 6 mods, native parity, audio/art honesty)');
}
