(function(){
 'use strict';
 // F02 IRON & GRACE — the authored arsenal + mods (OPEN patch: Rich_Alucard_Patch_IRON_AND_GRACE_Guns.docx).
 // Pure data, no engine dependency. Authored numbers are never scaled here. Anything the patch does not state is a
 // provisional value in TUNABLES (owner F13) and is tagged, never buried in a gun definition.
 //
 // `native:true` marks the five guns the accepted Combat 2.0 data (js/data/btf/combat.js RACombatData.GUNS) already
 // owns. F02 keeps those numbers byte-identical and does not take them over; the accepted menu-combat path stays in
 // charge of them. The remaining guns are F02-managed and reach menu combat only through RACombat2Ext (IF-1 4M).

 // ---- provisional values (NOT canonical; F13 owns the final tuning) -------------------------------------------------
 const TUNABLES=Object.freeze({
  provisional:true, owner:'F13',
  // Guns whose per-fight ammo the patch does not state. Marked, never presented as authored.
  provisionalAmmo:Object.freeze({jollof_burner:2,legendary_draco:2,golden_draco:2}),
  maxModsPerGun:2,
  // Range Day feel + rewards. The only authored reward statement is "a range medal per gun unlocks one mod discount"
  // and the example story "+10% crit"; the numeric thresholds are engineering scaffolding.
  range:Object.freeze({
   durationSeconds:50, lanes:3, reloadSeconds:2.2,
   thresholds:Object.freeze({bronze:400,silver:900,gold:1600}),
   medalDiscount:0.15, storyCritBonus:0.10, hostagePenalty:120, hiltBonus:250
  }),
  cloutGoldPlating:5, goldNoticeCooldownDays:7
 });

 // ---- the 13-gun catalog --------------------------------------------------------------------------------------------
 const GUNS=Object.freeze({
  lil_oga:{
   id:'lil_oga',label:'LIL OGA',type:'POCKET PISTOL',rarity:'common',native:true,price:25000,
   acquisition:{kind:'armory',note:'bought at THE ARMORY'},
   menu:{dmg:20,ammo:4,sure:true},
   showdown:{damage:3,range:'close',note:'never misses on overwatch'},
   special:'Never misses on overwatch.',
   audio:'GUN_LILOGA',art:'lil_oga'
  },
  sapporo_shotgun:{
   id:'sapporo_shotgun',label:'SAPPORO SHOTGUN',type:'DOUBLE BARREL',rarity:'common',native:true,price:60000,
   acquisition:{kind:'armory',note:'bought at THE ARMORY'},
   menu:{dmg:15,hits:2,ammo:3},
   showdown:{damage:'4-6',range:'close',hits:2,note:'hits two enemies'},
   special:'Hits two enemies.',
   audio:'GUN_SHOTGUN',art:'sapporo_shotgun'
  },
  mac_and_cheese:{
   id:'mac_and_cheese',label:'MAC & CHEESE',type:'SMG',rarity:'common',price:75000,
   acquisition:{kind:'armory',note:'bought at THE ARMORY'},
   menu:{dmg:6,hits:5,ammo:2,suppress:{accDown:.2,turns:1}},
   showdown:{damage:'2x3',range:'mid',note:'suppresses'},
   special:'Suppresses (enemy −20 aim next turn).',
   audio:'GN_01',art:null,artSourceRequired:true
  },
  chopstick_sniper:{
   id:'chopstick_sniper',label:'CHOPSTICK SNIPER',type:'RIFLE',rarity:'rare',native:true,price:90000,
   acquisition:{kind:'armory',note:"consignment from Hina's cousin"},
   menu:{dmg:45,ammo:1,turn1Crit:2},
   showdown:{damage:'4-6',range:'long',note:'x2 crit on turn 1'},
   special:'x2 crit on turn 1.',
   audio:'GUN_SNIPER',art:'chopstick_sniper'
  },
  tommy_tony:{
   id:'tommy_tony',label:'THE TOMMY TONY',type:'DRUM-MAG VINTAGE SMG',rarity:'rare',price:120000,
   acquisition:{kind:'tandem_then_armory',note:'win a tandem vs Tokyo Tony, then buy'},
   menu:{dmg:6,hits:6,ammo:2,consecutive:.10},
   showdown:{damage:'2x4',range:'mid',note:'+10% per consecutive turn fired'},
   special:'+10% per consecutive turn fired.',
   audio:'GN_02',art:null,artSourceRequired:true
  },
  holy_baby_drake:{
   id:'holy_baby_drake',label:'HOLY BABY DRAKE',type:'HAND CANNON',rarity:'rare',native:true,price:180000,
   acquisition:{kind:'armory_glass_case',note:'THE ARMORY glass case'},
   menu:{dmg:38,ammo:2,vsUndead:2,healPerShot:10},
   showdown:{damage:'4-5',range:'mid',note:'x2 vs undead'},
   special:'x2 vs undead · heals 10 per shot.',
   audio:'GUN_HOLYDRAKE',art:'holy_baby_drake'
  },
  jollof_burner:{
   id:'jollof_burner',label:'JOLLOF BURNER',type:'FLAMETHROWER',rarity:'rare',price:220000,
   acquisition:{kind:'jollof_wars_then_armory',note:'Jollof Wars champion + THE ARMORY'},
   menu:{dmg:12,aoe:true,burn:{dmg:8,turns:3,drainsRich:false},destroysCover:true,provisionalAmmo:true},
   showdown:{damage:3,range:'area',area:'cone3',burn:{dmg:8,turns:3},note:'cone 3 tiles; burns cover'},
   special:'Burns cover (car hoods, canopies).',
   audio:'GN_03',art:null,artSourceRequired:true
  },
  blueberry_blaster:{
   id:'blueberry_blaster',label:'BLUEBERRY BLASTER',type:'DRAGON-FIRE RIFLE',rarity:'rare',price:null,
   acquisition:{kind:'mazda_roost',note:"Mazda's roost, once (a gift)",fragment:'F03'},
   menu:{dmg:50,ammo:2,condition:{flag:'mazdaMajestic',note:'only works if Mazda is MAJESTIC'}},
   showdown:{damage:'5-7',range:'long',note:'only works if Mazda is MAJESTIC'},
   special:'Only works if Mazda is MAJESTIC.',
   audio:'GN_04',art:null,artSourceRequired:true
  },
  legendary_draco:{
   id:'legendary_draco',label:"LEGENDARY DRACO — DECEMBER'S GIFT",type:'LEGENDARY',rarity:'legendary',price:null,
   acquisition:{kind:'sealed_playmakers',note:'sealed Playmakers reward (HQ)',sealed:true,fragment:'F05'},
   menu:{dmg:22,hits:2,ammo:null,provisionalAmmo:true},
   showdown:{damage:'4-6',range:'mid',hits:2,note:'"two taps"'},
   special:'"Two taps."',
   audio:null,audioSourceRequired:true,art:null,artSourceRequired:true
  },
  golden_draco:{
   id:'golden_draco',label:'THE GOLDEN DRACO',type:'LEGENDARY',rarity:'legendary',price:null,
   acquisition:{kind:'new_oga_finale',note:"NEW OGA finale (Gbenga's cooler)",fragment:'F03'},
   menu:{dmg:20,hits:2,ammo:null,provisionalAmmo:true,blind:{accDown:.15,turns:2}},
   showdown:{damage:'4-6',range:'mid',hits:2,note:'blinding gold (enemy −15 aim)'},
   special:'Blinding gold (enemy −15 aim).',
   audio:null,audioSourceRequired:true,art:null,artSourceRequired:true
  },
  rpg:{
   id:'rpg',label:'THE RPG',type:'LAUNCHER',rarity:'rare',native:true,price:400000,
   acquisition:{kind:'armory',note:'bought at THE ARMORY'},
   menu:{dmg:80,ammo:1,splash:10,destroysCover:true,heat:10},
   showdown:{damage:5,range:'area',area:'3x3',note:'area 3x3; destroys cover; +10 heat'},
   special:'Destroys cover; +10 heat.',
   audio:'GUN_RPG',art:'rpg'
  },
  auntie_slipper:{
   id:'auntie_slipper',label:"AUNTIE'S SLIPPER",type:'THROWN',rarity:'common',price:12,
   acquisition:{kind:'naija_mart',note:'$12 at Naija Mart'},
   menu:{dmg:8,ammo:null,infinite:true,knockback:1,fear:{tag:'naija',note:'enemies who grew up with it lose a turn to fear'}},
   showdown:{damage:2,range:'close',knockback:true,note:'enemies who grew up with it lose a turn to fear'},
   special:'Enemies who grew up with it lose a turn to fear.',
   audio:'GN_05',art:null,artSourceRequired:true
  },
  triple_k_kratos:{
   id:'triple_k_kratos',label:'TRIPLE K-KRATOS',type:'DEV',rarity:'dev',dev:true,price:null,native:true,
   acquisition:{kind:'dev',note:'Ube only · dev code'},
   menu:{dmg:999,ammo:99},
   showdown:{damage:999,range:'area',note:'Ube only'},
   special:'Ube only.',
   audio:'GUN_KRATOS',art:null
  }
 });

 // ---- mods (max 2 per gun) ------------------------------------------------------------------------------------------
 const MODS=Object.freeze({
  blessed_rounds:{
   id:'blessed_rounds',label:'BLESSED ROUNDS',price:15000,kind:'combat',
   effect:'+25% damage vs vampires and undead',vsVampireUndead:.25
  },
  drum_mag:{
   id:'drum_mag',label:'DRUM MAG',price:20000,kind:'combat',
   effect:'+1 ammo per fight',ammoBonus:1
  },
  silencer:{
   id:'silencer',label:'SILENCER',price:18000,kind:'showdown',
   effect:"Showdown shots don't break concealment; −heat from gunfights",conceal:true,heatRelief:2,showdownOnly:true
  },
  scope:{
   id:'scope',label:'SCOPE',price:12000,kind:'showdown',
   effect:'+10 aim at range',rangeAim:.10,showdownOnly:true
  },
  gold_plating:{
   id:'gold_plating',label:'GOLD PLATING',price:50000,kind:'cosmetic',
   effect:'No stat change; clout +5 when equipped; VampGram notices',clout:5,cosmetic:true
  },
  custom_engraving:{
   id:'custom_engraving',label:'CUSTOM ENGRAVING',price:2500,kind:'cosmetic',
   effect:'Rich names the gun (text input); the name shows in combat',engraving:true,cosmetic:true
  }
 });

 // ---- enemy gun data (interface for F01 SHOWDOWN; no behaviour here) -------------------------------------------------
 const ENEMY_GUNS=Object.freeze([
  {enemy:'open_mouth_gang_enforcer',gun:'sapporo_shotgun',note:'Open Mouth Gang Enforcers carry shotguns'},
  {enemy:'hunter',gun:'silver_crossbow',note:'hunters carry silver crossbows',sourceRequired:true,notInArsenal:true},
  {enemy:'gbenga',gun:'golden_draco',note:'Gbenga carries the Golden Draco'}
 ]);

 // ---- validation (used by the registry and tests) -------------------------------------------------------------------
 const MENU_KEYS=['dmg','ammo','hits','sure','vsUndead','healPerShot','splash','turn1Crit','suppress','aoe','burn','consecutive','knockback','fear','blind','destroysCover','heat','condition','infinite','provisionalAmmo'];
 const SHOWDOWN_KEYS=['damage','range','hits','area','burn','knockback','note','special'];
 function problems(){
  const out=[],ids=Object.keys(GUNS);
  for(const [id,g] of Object.entries(GUNS)){
   if(g.id!==id)out.push(`${id}: id mismatch`);
   for(const field of ['label','type','rarity'])if(!g[field])out.push(`${id}: missing ${field}`);
   if(!g.acquisition?.kind)out.push(`${id}: missing acquisition.kind`);
   if(!g.special)out.push(`${id}: missing authored special`);
   if(!g.native){
    if(g.menu?.infinite){if(g.menu.ammo!=null)out.push(`${id}: infinite gun may not also declare ammo`);}
    else if(g.menu?.ammo==null&&!g.menu?.provisionalAmmo)out.push(`${id}: missing menu.ammo (or mark provisionalAmmo)`);
    if(typeof g.menu?.dmg!=='number')out.push(`${id}: missing menu.dmg`);
   }
   if(!g.showdown?.range)out.push(`${id}: missing showdown.range`);
   if(g.audio==null&&!g.audioSourceRequired)out.push(`${id}: no audio id and not marked audioSourceRequired`);
   if(g.art==null&&!g.artSourceRequired&&!g.dev)out.push(`${id}: no art key and not marked artSourceRequired`);
   for(const k of Object.keys(g.menu||{}))if(!MENU_KEYS.includes(k))out.push(`${id}: unknown menu key ${k}`);
   for(const k of Object.keys(g.showdown||{}))if(!SHOWDOWN_KEYS.includes(k))out.push(`${id}: unknown showdown key ${k}`);
  }
  for(const [id,m] of Object.entries(MODS)){
   if(m.id!==id)out.push(`mod ${id}: id mismatch`);
   for(const field of ['label','effect','price','kind'])if(m[field]===undefined)out.push(`mod ${id}: missing ${field}`);
  }
  return out;
 }
 const list=()=>Object.values(GUNS);
 const byId=id=>GUNS[id]||null;
 const mods=()=>Object.values(MODS);

 window.RAIronCatalog=Object.freeze({
  version:'1.0.0',
  GUNS,MODS,ENEMY_GUNS,TUNABLES,
  list,byId,mods,
  count:list().length,
  shippable:()=>list().filter(g=>!g.dev),
  armoryGuns:()=>list().filter(g=>!g.dev&&g.price!=null&&g.acquisition.kind==='armory'),
  audioMap:()=>Object.fromEntries(list().filter(g=>g.audio).map(g=>[g.id,g.audio])),
  validate:problems
 });
})();
