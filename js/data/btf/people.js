(function(){
 // BTF cast (VOL 1 §11, VOL 2, VOL 3 §3, VOL 5 §2). All romance characters are adults.
 // `look` is a PLACEHOLDER silhouette spec for RAPixel.drawActor until Art ships real sprites.
 // `sprite` points at approved/frozen art where it already exists (never modified).
 const W=(id,o)=>({id,dateable:true,kind:'woman',adult:true,...o});
 const M=(id,o)=>({id,dateable:false,kind:'person',adult:true,...o});
 const people=[
  W('ceo_assistant_001',{name:'THE ASSISTANT',species:'human → vampire',scope:'FULL',likes:['boba','rain_walk'],gifts:['boughi_v','krada'],dislikes:['catacomb'],hoes:[{id:'light_heal',label:'LIGHT HEAL',kind:'heal',amount:30},{id:'gossip',label:'GOSSIP',kind:'debuff',mult:1.1}],sprite:'assets/assistant_idle.png',spriteVampire:'assets/assistant_vampire_idle.png',look:{skin:'#c99a78',top:'#2c2c3a',hair:'#3a2418',hairShape:'long',accent:'#d7193f'},moment:'she holds the umbrella over you even though you do not need it.'}),
  W('jdm_importer_daughter_001',{name:'CAMMILE',species:'human → vampire',scope:'FULL',likes:['crest','peking_naija'],gifts:['tradeya'],dislikes:['brunch'],hoes:[{id:'sidestep',label:'SIDESTEP',kind:'dodge'},{id:'parts',label:'PARTS KNOWLEDGE',kind:'armor_break',mult:0.85}],sprite:'assets/jdm_imports/characters/daughter/daughter_neutral.png',look:{skin:'#b98464',top:'#e8e0cc',hair:'#1a1210',hairShape:'long'},moment:'she critiques your downshift. then she says "again."'}),
  W('mazda_human',{name:'BLUEBERRY MAZDA',species:'dragon',scope:'FULL',likes:['grave_mall','dragon_ride','boba'],gifts:['agege_bread','maggi'],dislikes:['pier'],hoes:[{id:'tail_swipe',label:'TAIL SWIPE',kind:'damage',amount:28},{id:'jealous_flame',label:'JEALOUS FLAME',kind:'dot',amount:18,dot:6,turns:3}],look:{skin:'#3a6ff0',top:'#111018',bottom:'#3a6ff0',hair:'#1b3a9a',hairShape:'long',horns:true,tail:true,tailColor:'#3a6ff0',width:1.15},moment:'she tries to eat the straw.'}),
  W('kiki',{name:'KIKI',species:'human',scope:'FULL',likes:['boba','grave_mall'],gifts:['boba_card','pet_crypt'],dislikes:['duchess_dinner'],hoes:[{id:'sugar_rush',label:'SUGAR RUSH',kind:'buff',mult:1.2},{id:'tapioca',label:'TAPIOCA SHOT',kind:'stun',amount:12}],look:{skin:'#e3b48e',top:'#f2a0c0',bottom:'#2a2a38',hair:'#2b1b12',hairShape:'bun',height:.9,prop:'cup'},moment:'she orders for you. wrong on purpose. you drink it anyway.'}),
  W('nneka',{name:'NNEKA',species:'human',scope:'FULL',likes:['peking_naija','naija_mart'],gifts:['maggi','krada'],dislikes:['boba'],hoes:[{id:'iv_drip',label:'IV DRIP',kind:'regen',amount:12,turns:3},{id:'sit_down',label:'"SIT DOWN."',kind:'skip'}],look:{skin:'#6b4028',top:'#3fa7a0',bottom:'#3fa7a0',hair:'#140c08',hairShape:'bun',width:1.1},moment:'she tells you the jollof here is wrong. she finishes the plate.'}),
  W('pinky',{name:'PINKY',species:'human',scope:'FULL',likes:['crest','taco_truck'],gifts:['tradeya'],dislikes:['movie_room'],hoes:[{id:'slide_in',label:'SLIDE IN',kind:'damage',amount:24,first:true},{id:'tandem',label:'TANDEM',kind:'double'}],look:{skin:'#d6a07c',top:'#ff6fb5',bottom:'#4a4a3a',hair:'#1c1410',hairShape:'bun'},moment:'she laughs at your worst spin and posts your best one.'}),
  W('moonie',{name:'MOONIE DORSEY',species:'werewolf',scope:'FULL',likes:['food_court','venice'],gifts:['pet_crypt'],dislikes:['cafe'],hoes:[{id:'tank_up',label:'TANK UP',kind:'guard',hits:2},{id:'stomp',label:'STOMP',kind:'damage',amount:30}],look:{skin:'#8a5a3c',top:'#5a6a3a',bottom:'#2a2a2a',hair:'#3a2a1a',hairShape:'spiky',height:1.08,width:1.15},moment:'she eats your steak too. she apologizes with her mouth full.'}),
  W('kaede',{name:'KAEDE',species:'human',scope:'FULL',likes:['onsen','little_tokyo'],gifts:['krada'],dislikes:['catacomb'],hoes:[{id:'smoke_bomb',label:'SMOKE BOMB',kind:'blind'},{id:'ceiling_drop',label:'CEILING DROP',kind:'damage',amount:32,crit:true}],look:{skin:'#e0b896',top:'#15151c',bottom:'#15151c',hair:'#0d0d12',hairShape:'long',height:.92},moment:'she says nothing for ten minutes. it is the best ten minutes.'}),
  W('wispa',{name:'WISPA',species:'ghost',scope:'FULL',likes:['cafe'],gifts:['cassette'],dislikes:['pier'],hoes:[{id:'haunt',label:'HAUNT',kind:'weaken',mult:.8,turns:3},{id:'unplug',label:'UNPLUG',kind:'cleanse_enemy'}],look:{skin:'#cfe7ff',top:'#9fd2ff',bottom:'#9fd2ff',hair:'#e8f4ff',hairShape:'long',translucent:true},moment:'she asks what the internet is like now. you show her. she is disappointed.'}),
  W('tasha',{name:'TASHA TASTEMAKER',species:'human',scope:'FULL',likes:['catacomb','grave_mall'],gifts:['tradeya'],dislikes:['onsen'],hoes:[{id:'hype',label:'HYPE',kind:'buff',mult:1.25,turns:2},{id:'filming',label:'FILMING',kind:'followers',amount:40}],look:{skin:'#7a4a2e',top:'#f6efd9',bottom:'#1b1824',hair:'#140c08',hairShape:'long',width:1.1,prop:'cup'},moment:'she raps your verse back to you. she knows the ad-libs.'}),
  W('marisol',{name:'MARISOL',species:'human',scope:'MEET+1',likes:['movie_room'],gifts:['duoqlo'],hoes:[{id:'cleanse',label:'CLEANSE',kind:'cleanse'},{id:'duster',label:'FEATHER DUSTER',kind:'damage',amount:22}],look:{skin:'#c08a64',top:'#15151c',bottom:'#f6efd9',hair:'#1a1210',hairShape:'bun'},moment:'she reorganizes the popcorn by size.'}),
  W('duchess',{name:'DUCHESS BATHORY-BROWN',species:'ancient vampire',scope:'MEET+1',rare:true,likes:['gallery','duchess_dinner'],gifts:['krada','maggi'],hoes:[{id:'drain',label:'DRAIN',kind:'drain',amount:30}],look:{skin:'#5a3424',top:'#5a0f1f',bottom:'#1b0a10',hair:'#0c0808',hairShape:'long',height:1.15,accent:'#c18b3c'},moment:'she calls you "child." then she asks your opinion.'}),
  W('nightshade',{name:'NIGHTSHADE',species:'ghost sorceress',scope:'MEET+1',rare:true,likes:['ballroom'],gifts:['flowers'],hoes:[{id:'violet_bolt',label:'VIOLET BOLT',kind:'damage',amount:26},{id:'reverse_hex',label:'REVERSE HEX',kind:'reflect'}],look:{skin:'#d8c8ff',top:'#6a3fb0',bottom:'#6a3fb0',hair:'#1a1030',hairShape:'long',translucent:true},moment:'she looks at the flowers for a long time.'}),
  W('emberly',{name:'EMBERLY',species:'dragon woman',scope:'MEET+1',likes:['crest','onsen'],gifts:['dragon_keef'],hoes:[{id:'heat_wave',label:'HEAT WAVE',kind:'damage_all',amount:18},{id:'warm_up',label:'WARM UP',kind:'maxhp',amount:10}],look:{skin:'#d8663a',top:'#2f6a3a',bottom:'#2a2a2a',hair:'#8a1f10',hairShape:'long',horns:true,tail:true,tailColor:'#d8663a',height:1.1},moment:'the car seat is warm for an hour after she gets out.'}),
  W('jade',{name:'JADE WYRMWOOD',species:'dragon woman',scope:'MEET+1',rare:true,likes:['fish_tank','gallery'],gifts:['krada'],hoes:[{id:'hoard',label:'HOARD',kind:'shield',amount:40},{id:'treasure_slam',label:'TREASURE SLAM',kind:'damage',amount:36}],look:{skin:'#2f8a5a',top:'#c18b3c',bottom:'#2f8a5a',hair:'#1a4a30',hairShape:'bald',horns:true,tail:true,tailColor:'#2f8a5a',height:1.2,width:1.3},moment:'she keeps the receipt. she keeps everything.'}),
  W('lo',{name:'LO (DOLORES)',species:'zombie',scope:'MEET+1',likes:['brunch'],gifts:['duoqlo'],hoes:[{id:'detachable',label:'DETACHABLE',kind:'dot',amount:16,dot:6,turns:3},{id:'play_dead',label:'PLAY DEAD',kind:'evade'}],look:{skin:'#9fb08a',top:'#f2d27a',bottom:'#f2d27a',hair:'#3a2a1a',hairShape:'long'},moment:'her arm falls off. she apologizes. she keeps eating with the other one.'}),
  W('brenda',{name:'BRENDA FROM ACCOUNTING',species:'zombie',scope:'MEET+1',likes:['food_court'],gifts:['krada'],hoes:[{id:'intel',label:'INTEL',kind:'intel'},{id:'spreadsheet',label:'SPREADSHEET',kind:'weaken',mult:.8,turns:2}],look:{skin:'#a7b596',top:'#6a7a9a',bottom:'#2a2a38',hair:'#4a3020',hairShape:'bun',height:.96},moment:'she has a spreadsheet about your castle. it is color-coded.'}),
  W('hina',{name:'HINA',species:'human',scope:'MEET+1',likes:['little_tokyo'],gifts:['krada'],hoes:[{id:'knife_work',label:'KNIFE WORK',kind:'damage',amount:26},{id:'timed',label:'TIMED',kind:'sure_hit'}],look:{skin:'#e6c09a',top:'#f6efd9',bottom:'#2a2a38',hair:'#0d0d12',hairShape:'bun',height:.92},moment:'she times how long you take to eat. you lose.'}),
  W('bunmi',{name:'BUNMI',species:'human',scope:'MEET+1',likes:['atl_curb','peking_naija'],gifts:['maggi'],hoes:[{id:'home_cooking',label:'HOME COOKING',kind:'heal',amount:40},{id:'knew_you',label:'"I KNEW YOU WHEN"',kind:'revenge_double'}],look:{skin:'#6e4128',top:'#c24a7a',bottom:'#c24a7a',hair:'#140c08',hairShape:'long',width:1.1},moment:'she remembers what you ordered in 2019.'}),
  W('velvet',{name:'VELVET VANTABLACK',species:'vampire',scope:'MEET+1',likes:['grave_mall'],gifts:['krada','boughi_v'],hoes:[{id:'charm',label:'CHARM',kind:'skip_nonboss'},{id:'subscribe',label:'SUBSCRIBE',kind:'money',amount:500}],look:{skin:'#c99a78',top:'#0c0a10',bottom:'#0c0a10',hair:'#0c0a10',hairShape:'long',accent:'#b44cff'},moment:'she checks her ring light before she checks on you.'}),
  W('june',{name:'JUNE',species:'human',scope:'FULL',likes:['salon','cafe','peking_naija'],gifts:['maggi','duoqlo'],dislikes:['catacomb'],hoes:[{id:'palm_roll',label:'PALM ROLL',kind:'heal_cleanse',amount:25},{id:'sit_still',label:'"SIT STILL"',kind:'skip'}],look:{skin:'#5e3620',top:'#7a7a8a',bottom:'#1b1824',hair:'#1a0f08',hairShape:'locs',width:1.12},moment:'she fixes one loc while you talk. she does not ask.'}),
  W('ms_patrice',{name:'MS. PATRICE',species:'zombie',scope:'FULL',likes:['waffle_haven','lennox'],gifts:['maggi','krada'],hoes:[{id:'ssc',label:'SCATTERED SMOTHERED COVERED',kind:'multi',amount:12,hits:3},{id:'order_up',label:'"ORDER UP"',kind:'heal_full',once:true}],look:{skin:'#9aa88a',top:'#e8b43a',bottom:'#3a2a1a',hair:'#2a1a10',hairShape:'bun',width:1.12,accent:'#ff8a8a'},moment:'she roasts every rich person in the room. you fall for her a little.'}),
  W('anfeesa',{name:'DJ ANFEESA',species:'human',scope:'MEET+1',likes:['rave'],gifts:['krada'],hoes:[],look:{skin:'#e8d0c0',top:'#0c0a10',bottom:'#0c0a10',hair:'#f0f0f0',hairShape:'long'},moment:'she plays one record just for you. she does not say which.'}),
  // Men, friends, family, opps (not dateable).
  M('shannon_001',{name:'SHANNON',role:'real estate',sprite:'assets/property/characters/shannon/shannon_neutral_80x96.png',look:{skin:'#e0b896',top:'#3a4a6a',hair:'#c89a50',hairShape:'long'}}),
  M('importer',{name:'IMPORT GUY',role:'JDMIMPORTS',sprite:'assets/jdm_imports/characters/importer/importer_neutral.png',look:{skin:'#b98464',top:'#4a4a4a',hair:'#1a1a1a'}}),
  M('tristan',{name:'TRISTAN',role:'close friend',look:{skin:'#f0d0b8',top:'#3a3a4a',bottom:'#1f2a44',hair:'#0c0c10',height:1.04}}),
  M('rookoko',{name:'ROOKOKO',role:'painter',look:{skin:'#8a5a3c',top:'#d8d0b8',bottom:'#4a4a3a',hair:'#2a2a2a',hairShape:'hat'}}),
  M('coffe',{name:'COFFE',role:'homie',look:{skin:'#9a6a48',top:'#4a7a9a',bottom:'#2a2a38',hair:'#140c08',height:.95,prop:'cup'}}),
  M('tunde',{name:'TUNDE',role:'homie',look:{skin:'#5a3420',top:'#2f6a4a',bottom:'#2a2a38',hair:'#140c08',width:1.3,prop:'food'}}),
  M('dre',{name:'DRE',role:'homie',look:{skin:'#7a4a2e',top:'#9a2a2a',bottom:'#2a2a38',hair:'#140c08',hairShape:'hat',height:1.08,width:.9}}),
  M('uncle_sunday',{name:'UNCLE SUNDAY',role:'uncle',look:{skin:'#5a3420',top:'#e0b040',bottom:'#e0b040',hair:'#1a1a1a',hairShape:'bald',width:1.3,accent:'#e0b040'}}),
  M('reggie',{name:'REGGIE',role:'dispensary',look:{skin:'#c8a080',top:'#7ad0a0',bottom:'#4a4a6a',hair:'#3a2a1a',hairShape:'hat'}}),
  M('okada',{name:'MR. OKADA',role:'ramen',look:{skin:'#e0c0a0',top:'#f6efd9',bottom:'#2a2a38',hair:'#d0d0d0',height:.85}}),
  M('deacon_brass',{name:'DEACON BRASS',role:'the armory',look:{skin:'#4a2a18',top:'#2a2a3a',bottom:'#2a2a3a',hair:'#d0d0d0',hairShape:'hat'}}),
  M('bllad33',{name:'BLLAD33',role:'hunter',sprite:'assets/bllad33/masters/bllad33_neutral_candidate_80x96.png',look:{skin:'#6a4028',top:'#1a1a22',hair:'#0c0c10'}}),
  M('hilt',{name:'HILT',role:'hunter',look:{skin:'#6a4028',top:'#4a5a4a',bottom:'#3a3a3a',hair:'#3a3a3a',height:1.15,width:1.3,prop:'box'}}),
  M('ogun',{name:'OGUN',role:'vampire lord',sprite:'assets/ogun_rave/masters/ogun_neutral_80x96.png',look:{skin:'#3a2418',top:'#5a0f1f',hair:'#0c0c10'}}),
  M('lil_smack',{name:'LIL SMACK',role:'nemesis',look:{skin:'#c09070',top:'#3a8a3a',bottom:'#3a8a3a',hair:'#1a1a1a',height:.82,prop:'food',accent:'#e0b040'}}),
  M('officer_nodd',{name:'OFFICER NODD',role:'police',look:{skin:'#d8b090',top:'#1f2a44',bottom:'#1f2a44',hair:'#1f2a44',hairShape:'hat',shades:true}}),
  M('don_chuy',{name:'DON CHUY',role:'taco truck',look:{skin:'#b07850',top:'#f6efd9',bottom:'#2a2a38',hair:'#2a1a10',hairShape:'hat'}}),
  M('bruce_loose',{name:'BRUCE LOOSE',role:'kung fu legend',look:{skin:'#e0c0a0',top:'#6a2a9a',bottom:'#6a2a9a',hair:'#0c0c10'}}),
  M('kevin',{name:'KEVIN',role:'ninja',look:{skin:'#e0c0a0',top:'#7a7a80',bottom:'#7a7a80',hair:'#7a7a80',hairShape:'hood'}}),
  M('phil',{name:'POWER LEVEL PHIL',role:'shout-out',look:{skin:'#e8c8a8',top:'#4a4a5a',bottom:'#2a3a6a',hair:'#5a3a1a',hairShape:'spiky'}}),
  M('iron_jaw',{name:'IRON JAW',role:'villain MC',look:{skin:'#7a4a2e',top:'#2a2a2a',hair:'#1a1a1a',hairShape:'hood',accent:'#9b9b9b',prop:'mic'}}),
  M('tokyo_tony',{name:'TOKYO TONY',role:'midnight mafia',look:{skin:'#d8b090',top:'#c83a2a',bottom:'#2a2a38',hair:'#f0e0a0',hairShape:'spiky'}}),
  M('bonesworth',{name:'SIR BONESWORTH',role:'hungover skeleton',look:{skin:'#e8e2cf',top:'#7a6a50',bottom:'#e8e2cf',hair:'#7a6a50',hairShape:'hat',prop:'sword'}}),
  M('vicky',{name:'VICKY',role:'the ex adventurer',look:{skin:'#e8c8a8',top:'#3a6a4a',bottom:'#5a4a3a',hair:'#8a3a1a',hairShape:'long'}}),
  M('mom',{name:'MOM',role:'family',family:true,look:{skin:'#5a3420',top:'#d06a2a',hair:'#1a1a1a',hairShape:'hat'}}),
  M('dad',{name:'DAD',role:'family',family:true,look:{skin:'#4a2a18',top:'#3a5a8a',hair:'#3a3a3a'}}),
  M('sister',{name:'SISTER',role:'family',family:true,look:{skin:'#6a4028',top:'#b04a8a',hair:'#140c08',hairShape:'long'}}),
  M('brother1',{name:'BIG BRO',role:'family',family:true,look:{skin:'#5a3420',top:'#2a6a4a',hair:'#140c08'}}),
  M('brother2',{name:'LIL BRO',role:'family',family:true,look:{skin:'#6a4028',top:'#c8a03a',hair:'#140c08'}}),
  M('octopus_sensei',{name:'OCTOPUS SENSEI',role:'mentor',look:{skin:'#7a1f3a',top:'#7a1f3a',bottom:'#7a1f3a',hair:'#5a1030',hairShape:'bald',width:1.6,height:1.2}}),
  M('god',{name:'???',role:'the curb',look:{skin:'#5a3420',top:'#e8d8b0',bottom:'#e8d8b0',hair:'#d8d8d8',hairShape:'bun',accent:'#e0b040'}}),
  M('j_circle',{name:'J-CIRCLE',role:'Oba of LA',look:{skin:'#3a2418',top:'#8a6a4a',bottom:'#1a1a1a',hair:'#0c0c10',width:1.4,accent:'#e0b040'}}),
  M('trippin_red',{name:"TRIPPIN' RED",role:'rapper',look:{skin:'#7a4a2e',top:'#1a1a1a',hair:'#d7193f',hairShape:'spiky',prop:'mic'}}),
  M('paladin',{name:'PALADIN',role:"vicky's party",look:{skin:'#e8c8a8',top:'#c8c8d0',bottom:'#c8c8d0',hair:'#c8c8d0',hairShape:'hat',height:1.15,width:1.2}}),
  M('bard',{name:'BARD',role:"vicky's party",look:{skin:'#e8c8a8',top:'#3a8a5a',bottom:'#5a3a2a',hair:'#c8a040',hairShape:'hat'}}),
  M('cleric',{name:'CLERIC',role:"vicky's party",look:{skin:'#d8b090',top:'#f0ead0',bottom:'#f0ead0',hair:'#6a4a2a',hairShape:'hood'}}),
  M('buckhead',{name:'BUCKHEAD VAMPIRE',role:'rival',look:{skin:'#e8c8a8',top:'#f0e0c0',bottom:'#3a3a5a',hair:'#c8a060'}}),
  M('og_hooper',{name:'THE OG',role:'pickup regular',look:{skin:'#4a2a18',top:'#c8c8c8',hair:'#c8c8c8'}}),
  M('cat',{name:'THE CAT',role:'sphynx',look:{skin:'#e8c0b0',top:'#e8c0b0',bottom:'#e8c0b0',hair:'#e8c0b0',hairShape:'bald',height:.3,width:.9}})
 ];
 const rich={id:'rich',name:'RICH',sprite:'assets/rich_standing_right.png',look:{skin:'#6a4028',top:'#0c0c10',bottom:'#0c0c10',hair:'#0c0c10',hairShape:'locs',shades:true,accent:'#20c66b'}};
 // Frozen ART SHIP 004–007 identity anchors and approved states, resolved by id through the generated Art Registry
 // (never hard-coded paths). The anchor becomes the default sprite only where no earlier approved sprite exists;
 // `states` lists every approved alternate (placement uses the individual masters, never the handoff sheets).
 // Ids without frozen art keep their RAPixel placeholder `look`.
 const art=window.RAArtRegistry||{};
 for(const p of [rich,...people]){
  const c=art.characters?.[p.id]||(art.creatures?.[p.id]&&{anchor:art.creatures[p.id].anchor,anchorPose:'sitting',states:{sitting:art.creatures[p.id].anchor}});
  if(!c)continue;
  if(c.anchor&&!p.sprite){p.sprite=c.anchor;p.anchorPose=c.anchorPose;}
  p.states={...c.states};p.frozenArt=true;
 }
 const byId=Object.fromEntries([rich,...people].map(p=>[p.id,p]));
 window.RABtfPeople={list:people,byId,get:id=>byId[id]||null,women:people.filter(p=>p.dateable),rich};
 // Register every cast member with the existing Persistent People catalog (additive).
 window.RAPersonCatalog=window.RAPersonCatalog||{};
 for(const p of people)if(!window.RAPersonCatalog[p.id])window.RAPersonCatalog[p.id]={id:p.id,displayName:p.name,characterRef:p.id,tags:[p.kind,...(p.adult?['adult']:[])],contactCapable:true,availability:'btf'};
 // Existing records keep their frozen display names; Cammile is the Importer's Daughter (VOL 5 errata).
 if(window.RAPersonCatalog.jdm_importer_daughter_001)window.RAPersonCatalog.jdm_importer_daughter_001.displayName='Cammile';
})();
