// F02 — Combat 2.0 extension compatibility: the GUN action is inert while dark, dispatches through RACombat2Ext when
// lit, applies only F02-managed guns, and never re-registers or mutates the accepted native gun set.
import assert from 'node:assert/strict';
import {game,ALL_F02,clearFlags,spyHelpers,same} from './_lib.mjs';

const state=()=>({turn:1,rich:{hp:100,max:100},enemy:{hp:100,max:100,dot:[],skip:0},__iagAmmo:{}});

export async function test(root){
 const c=await game(root);const R=c.RAIronAndGrace,X=c.RACombat2Ext;
 const nativeKeys=Object.keys(c.RACombatData.GUNS).sort();

 // --- authored shot resolution (public fire()) ---
 const s=state(),h=spyHelpers(s);
 const shot=R.fire(s,'mac_and_cheese',h); // not owned yet
 assert.equal(shot.ok,false,'cannot fire an unowned gun');assert.equal(shot.reason,'out-of-ammo');

 R.grant('mac_and_cheese',{free:true});
 const s2=state(),h2=spyHelpers(s2);
 const mac=R.fire(s2,'mac_and_cheese',h2);
 assert.equal(mac.ok,true);
 assert.equal(h2.calls.damage[0].base,6,'authored 5x6 = 6 base damage, 5 hits');assert.equal(h2.calls.damage[0].opts.hits,5);
 same(s2.enemy.blind,{amt:.2,turns:1},'MAC & CHEESE suppresses (enemy −20 aim next turn)');
 assert.equal(s2.__iagAmmo.mac_and_cheese,1);assert.equal(R.canFire(s2,'mac_and_cheese'),true);
 R.fire(s2,'mac_and_cheese',spyHelpers(s2));assert.equal(R.canFire(s2,'mac_and_cheese'),false,'ammo spent per fight');
 assert.equal(R.fire(s2,'mac_and_cheese',spyHelpers(s2)).reason,'out-of-ammo');

 // BLESSED ROUNDS: +25% vs undead, applied inside the shot
 R.buyMod('blessed_rounds').ok;R.attachMod('mac_and_cheese','blessed_rounds');
 const su=state(),hu=spyHelpers(su,{undead:true});R.fire(su,'mac_and_cheese',hu);
 assert.equal(hu.calls.damage[0].base,6*1.25,'blessed rounds multiply the authored base vs undead');

 // THE TOMMY TONY: +10% per consecutive turn fired
 R.grant('tommy_tony',{free:true});const st=state(),ht1=spyHelpers(st);R.fire(st,'tommy_tony',ht1);
 const ht2=spyHelpers(st);R.fire(st,'tommy_tony',ht2);
 assert(Math.abs(ht2.calls.damage[0].base-6*1.1)<1e-9,'second consecutive turn is +10%');

 // AUNTIE'S SLIPPER: infinite ammo; knockback only in Showdown context (F01)
 R.grant('auntie_slipper',{free:true});assert.equal(R.effectiveAmmo('auntie_slipper'),Infinity);
 const ss=state(),hs=spyHelpers(ss);R.fire(ss,'auntie_slipper',hs);R.fire(ss,'auntie_slipper',hs);
 assert.equal(hs.calls.damage.length,2,'infinite: can fire every turn');
 assert.equal(ss.enemy.skip,0,'knockback is Showdown-only and inert in menu combat');

 // sure-hit (LIL OGA) never rolls; heal + splash are authored effects
 const sl=state(),hl=spyHelpers(sl,{rollHit:false});R.grant('lil_oga',{free:true});
 R.fire(sl,'lil_oga',hl);assert.equal(hl.calls.damage.length,1,'LIL OGA never misses on overwatch');
 const sh=state(),hh=spyHelpers(sh);R.grant('holy_baby_drake',{free:true});sh.rich.hp=50;R.fire(sh,'holy_baby_drake',hh);
 assert.equal(sh.rich.hp,60,'HOLY BABY DRAKE heals 10 per shot');
 const sr=state(),hr=spyHelpers(sr);R.grant('rpg',{free:true});sr.rich.hp=100;R.fire(sr,'rpg',hr);
 assert.equal(sr.rich.hp,90,'THE RPG deals 10 self-splash');
 assert.equal(hr.calls.damage[0].base,80,'authored 80');
 assert.equal(sr.enemy.dot.filter(d=>d.label==='BURNING').length,0);

 // --- Combat 2.0 integration (RACombat2Ext) ---
 const seeded=()=>{let x=7;return()=>{x=(Math.imul(x,1103515245)+12345)>>>0;return x/4294967296;};};
 // flag OFF: the registered action is inert and the menu exposes nothing
 let rules=c.RACombat2Rules.create('bruce_loose',{},undefined,seeded());
 same(X.menuButtons(rules),[],'flag OFF: no GUN button');
 c.RACombat2Rules.act(rules,{type:'weapon',id:'iron_and_grace_gun'});
 assert.equal(rules.enemy.hp,rules.enemy.max,'flag OFF: the weapon action does nothing');

 // flag ON: the GUN button appears and damages the enemy for exactly one F02-managed shot
 c.RAFeatures.set('F02.iron_and_grace',true);
 rules=c.RACombat2Rules.create('bruce_loose',{},undefined,seeded());
 const buttons=X.menuButtons(rules);
 assert.equal(buttons.length,1);assert.match(buttons[0].label,/^GUN: /);assert.equal(buttons[0].act,'weapon:iron_and_grace_gun');
 const hp=rules.enemy.hp;c.RACombat2Rules.act(rules,{type:'weapon',id:'iron_and_grace_gun'});
 assert(rules.enemy.hp<hp,'the GUN action damaged the enemy through the rules helpers');

 // ammo refills every fight: a fresh create() starts at the authored per-fight ammo
 const fresh=c.RACombat2Rules.create('bruce_loose',{},undefined,seeded());
 assert.equal(R.ammoFor(fresh,'mac_and_cheese'),2,'per-fight ammo refills on create()');

 // OL-045: an equipped native gun consumes its mods through the same extension and has no duplicate legacy button.
 R.equip('lil_oga');R.buyMod('blessed_rounds');R.attachMod('lil_oga','blessed_rounds');
 const sn=state(),hn=spyHelpers(sn,{undead:true});R.fire(sn,'lil_oga',hn);
 assert.equal(hn.calls.damage[0].base,20*1.25);
 rules=c.RACombat2Rules.create('bruce_loose',{},undefined,seeded());
 assert.equal(rules.guns.length,0,'ON: no second native ammo pool');
 assert.equal(X.menuButtons(rules)[0].gun,'lil_oga');
 c.RAState.patch('life.ownership.castleRooms',['armory_wall']);R.equip('mac_and_cheese');
 rules=c.RACombat2Rules.create('bruce_loose',{},undefined,seeded());
 same(X.menuButtons(rules).map(b=>b.gun),['mac_and_cheese','lil_oga'],'both equipped guns reach the main menu');
 c.RACombat2Rules.act(rules,{type:'weapon',id:'iron_and_grace_secondary'});
 assert.equal(rules.__iagAmmo.lil_oga,3,'secondary fires its own gun');
 assert.equal(rules.__iagAmmo.mac_and_cheese,2,'secondary does not consume primary ammo');

 // A persisted dev gun cannot leak into the second slot after its DEV unlock is removed.
 c.RALife.setFlag('devKratos',true);R.grant('triple_k_kratos',{free:true});R.equip('triple_k_kratos');R.equip('mac_and_cheese');c.RALife.setFlag('devKratos',false);
 rules=c.RACombat2Rules.create('bruce_loose',{},undefined,seeded());
 assert(!X.menuButtons(rules).some(b=>b.gun==='triple_k_kratos'),'both slots enforce the dev gun gate');

 // The accepted native gun definitions are unchanged.
 same(Object.keys(c.RACombatData.GUNS).sort(),nativeKeys,'RACombatData.GUNS is unchanged');
 assert(!nativeKeys.includes('mac_and_cheese'),'F02 does not inject its guns into the accepted data');

 clearFlags(c,ALL_F02);
 console.log('PASS F02 combat (inert while dark, RACombat2Ext GUN action, authored effects, per-fight ammo, native data untouched)');
}
