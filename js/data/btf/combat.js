(function(){
 // COMBAT 2.0 data (VOL 3 §1–4, VOL 5 §10). v1 tuning — HQ owns numbers; playtest changes them.
 const MOVES={
  blood:{id:'blood',label:'BLOOD BATH',base:26,pp:8,kind:'power',aoe:.6,canon:true},
  octopus:{id:'octopus',label:'OCTOPUS BRAIN',base:18,pp:8,kind:'weird',canon:true},
  bite:{id:'bite',label:'VAMPIRE BITE',base:24,pp:8,kind:'speed',heal:18,canon:true},
  revenge:{id:'revenge',label:'REVENGE',base:0,pp:8,kind:'fear',canon:true},
  petty:{id:'petty',label:'ONE-INCH PETTY',base:34,pp:3,kind:'learned',pierce:true,source:'Bruce Loose'},
  hex:{id:'hex',label:'HEX',base:0,pp:3,kind:'magic',effect:{weaken:.75,turns:3}},
  veil:{id:'veil',label:'VIOLET VEIL',base:0,pp:2,kind:'magic',effect:{block:1}},
  seance:{id:'seance',label:'SÉANCE',base:0,pp:2,kind:'magic',effect:{dot:12,turns:3}},
  ringer:{id:'ringer',label:'DEAD RINGER',base:0,pp:2,kind:'magic',effect:{stun:1,bossChance:.5}}
 };
 const ITEMS={
  sapporo:{id:'sapporo',label:'SAPPORO',price:4,heal:25,accDown:.1},
  jollof:{id:'jollof',label:'JOLLOF (TAKEOUT)',price:18,healFull:true,oncePerFight:true},
  garlic:{id:'garlic',label:'GARLIC KNOTS',price:6,vsVampire:20},
  boba:{id:'boba',label:'BOBA',price:7,pp:2},
  salts:{id:'salts',label:'SMELLING SALTS',price:15,cleanse:true},
  dragon_keef:{id:'dragon_keef',label:'DRAGON KEEF',price:60,roostFire:30},
  maggi_dragon_crumble:{id:'maggi_dragon_crumble',label:'DRAGON MAGGI CRUMBLE',healFull:true,double:true,feedsEaters:true},
  steak:{id:'steak',label:'STEAK',price:30,heal:30}
 };
 const GUNS={
  lil_oga:{id:'lil_oga',label:'LIL OGA',price:25000,dmg:20,ammo:4,sure:true},
  sapporo_shotgun:{id:'sapporo_shotgun',label:'SAPPORO SHOTGUN',price:60000,dmg:15,hits:2,ammo:3},
  chopstick_sniper:{id:'chopstick_sniper',label:'CHOPSTICK SNIPER',price:90000,dmg:45,ammo:1,turn1Crit:2},
  holy_baby_drake:{id:'holy_baby_drake',label:'HOLY BABY DRAKE',price:180000,dmg:38,ammo:2,vsUndead:2,healPerShot:10},
  rpg:{id:'rpg',label:'THE RPG',price:400000,dmg:80,ammo:1,splash:10},
  triple_k_kratos:{id:'triple_k_kratos',label:'TRIPLE K-KRATOS',dev:true,dmg:999,ammo:99}
 };
 const FITS={
  boughi_blazer:{id:'boughi_blazer',label:'BOUGHI-V BLAZER',store:'boughi',slot:'top',price:3800,maxhp:10,def:.05},
  krada_shades:{id:'krada_shades',label:'KRADA SHADES',store:'krada',slot:'accessory',price:1200,crit:.08},
  tradeya_chain:{id:'tradeya_chain',label:'TRADEYA-HOES CHAIN',store:'tradeya',slot:'accessory',price:2500,charisma:true},
  leather_trench:{id:'leather_trench',label:'BLACK LEATHER TRENCH',store:'boughi',slot:'top',price:4000,def:.15,acc:-.05},
  grave_hoodie:{id:'grave_hoodie',label:'GRAVE GIFT-SHOP HOODIE',store:'kiosk',slot:'top',price:60},
  drift_sneakers:{id:'drift_sneakers',label:'DRIFT SNEAKERS',store:'tradeya',slot:'shoes',price:400,style:.05},
  church_shoes:{id:'church_shoes',label:'CHURCH SHOES',store:'armory',slot:'shoes',price:900,gun:.1},
  slides:{id:'slides',label:'SLIDES',store:'pet_crypt',slot:'shoes',price:12},
  duoqlo_airism:{id:'duoqlo_airism',label:'DUOQLO AIRISM TEE',store:'duoqlo',slot:'top',price:20,comfort:1}
 };
 // Enemy cards. pattern loops; telegraph text shows one round ahead; octopus = three canon-format solutions.
 const m=(id,label,dmg,o={})=>({id,label,dmg,...o});
 const ENEMIES={
  uncle_sunday:{name:'UNCLE SUNDAY',hp:80,person:'uncle_sunday',eats:true,
   moves:{wag:m('wag','FINGER WAG',10),father:m('father','"WHO IS YOUR FATHER"',24,{telegraph:'UNCLE SUNDAY IS INHALING DEEPLY…'}),marriage:m('marriage','ASK ABOUT MARRIAGE',0,{effect:{accDown:.1,turns:2}})},pattern:['wag','marriage','father','wag','father'],
   octopus:{charisma:{label:'CALL HIM UNCLE',result:'spared',text:'HE MELTS. HE TEARS THE LOAF IN HALF.'},recruit:{label:'ASK HIM TO TEACH YOU FISHING',result:'spared',text:'HE IS DELIGHTED. THE FIGHT IS OVER. FISHING IS ON.'},roast:{label:"ASK WHY HE'S UNEMPLOYED",result:'enrage',text:'HE GETS STRONGER.'}}},
  bruce_loose:{name:'BRUCE LOOSE',hp:110,person:'bruce_loose',eats:true,
   moves:{flurry:m('flurry','FLURRY',7,{hits:3}),kick:m('kick','KICK',22,{telegraph:'BRUCE LOOSE MAKES A NOISE BEFORE HIS KICK…'}),noise:m('noise','NOISE',0,{effect:{selfBuff:.15}})},pattern:['flurry','noise','kick'],drop:{money:500},
   octopus:{charisma:{label:'COMPLIMENT THE TRACKSUIT',result:'skip',turns:1,text:'HE STOPS TO SHOW YOU THE STRIPE.'},recruit:{label:'BECOME HIS STUDENT',result:'spared',learn:'petty',text:'LESSON ONE: ONE-INCH PETTY.'},roast:{label:'"THAT NOISE AIN\'T A MOVE"',result:'skip',turns:2,text:'HE IS DEEPLY HURT.'}}},
  kevins:{name:'40 KEVINS',hp:260,person:'kevin',minions:40,eats:true,
   moves:{poke:m('poke','KEVIN POKE ×5',2,{hits:5}),honor:m('honor','HONOR STRIKE',20,{telegraph:'THE REAL KEVIN IS BOWING…'})},pattern:['poke','poke','honor'],
   octopus:{charisma:{label:'FIND THE REAL ONE',result:'damage',amount:60,text:'THE REAL ONE BLINKED.'},recruit:{label:'FEED THEM ALL',result:'spared',text:'FORTY HAPPY KEVINS DISPERSE.'},roast:{label:'"ALL Y\'ALL NAMED KEVIN?"',result:'damage',amount:50,text:'TEN KEVINS LEAVE IN SHAME.'}}},
  phil:{name:'POWER LEVEL PHIL',hp:160,person:'phil',eats:true,
   moves:{beam:m('beam','BEAM',40,{charge:2,telegraph:'PHIL IS CHARGING A BEAM (2 TURNS)…'}),punch:m('punch','PUNCH',18)},pattern:['punch','beam','punch'],drop:{money:2000},
   octopus:{charisma:{label:'GET FOOD WHILE HE CHARGES',result:'spared',text:'HE CRIES. HE EATS. NO FIGHT.'},recruit:{label:'"YOU WANNA BE ON MY SQUAD?"',result:'skip',turns:1,text:'HE THINKS ABOUT IT FOR A WHOLE TURN.'},roast:{label:'"IT\'S BEEN THREE DAYS"',result:'skip',turns:1,text:'HE KNOWS.'}}},
  bonesworth:{name:'SIR BONESWORTH',hp:220,person:'bonesworth',boss:true,undead:true,eats:true,
   moves:{sway:m('sway','HUNGOVER SWAY',0,{telegraph:'SIR BONESWORTH IS RAISING HIS SWORD…'}),cleave:m('cleave','OVERHEAD CLEAVE',38,{telegraph:'HE IS STEADYING HIS SHIELD…'}),bash:m('bash','SHIELD BASH',18,{telegraph:'HIS BONES START TO RATTLE…'}),rattle:m('rattle','BONE RATTLE',0,{effect:{accDown:.2,turns:2},telegraph:'HE SWAYS…'}),second_wind:m('second_wind','SECOND WIND',0,{heal:30,telegraph:'HE IS LOWERING INTO A CHARGE. ALL OF HIM.'}),death_charge:m('death_charge','DEATH CHARGE',55)},
   pattern:['sway','cleave','bash','rattle'],below50:['second_wind','death_charge'],drop:{money:15000},
   octopus:{charisma:{label:'SHARE THE JOLLOF',requires:'jollof',result:'spared',text:'HANGOVER CURED. HE SURRENDERS.'},recruit:{label:'JOIN MY SQUAD',below:.4,result:'spared',recruit:true,text:'HE MOVES INTO THE CRYPT.'},roast:{label:'"YOU DIED IN MY HALLWAY."',result:'skip',turns:2,text:'HE LOSES TWO TURNS TO SHAME.'}}},
  hilt:{name:'HILT',hp:400,person:'hilt',boss:true,
   moves:{jab:m('jab','STAKE JAB',30),lunch:m('lunch','LUNCHBOX',45),pin:m('pin','PIN',0,{effect:{stunRich:1}})},pattern:['jab','lunch','pin','lunch'],noTelegraph:true,noRun:true,
   octopus:{charisma:{label:'"TELL BLLAD33 I SAID WHAT\'S UP"',result:'nothing',text:'HE DOES NOT RESPOND.'},recruit:{label:'OFFER HIM A SAPPORO',result:'nothing',text:'HE DOES NOT DRINK ON THE JOB.'},roast:{label:'ROAST THE WINDBREAKER',result:'nothing',text:'HE HAS HEARD WORSE.'}}},
  hilt_rematch:{name:'HILT',hp:260,person:'hilt',boss:true,
   moves:{jab:m('jab','STAKE JAB',26),lunch:m('lunch','LUNCHBOX',40,{telegraph:'HILT OPENS THE LUNCHBOX…'}),pin:m('pin','PIN',0,{effect:{stunRich:1},telegraph:'HILT STEPS IN CLOSE…'})},pattern:['jab','lunch','jab','pin'],drop:{money:40000},
   octopus:{charisma:{label:'"YOUR BROTHER TALKS ABOUT YOU"',result:'skip',turns:1,text:'HE PAUSES. JUST ONCE.'},recruit:{label:'OFFER HIM THE HOOKAH ROOF',result:'nothing',text:'HE DOES NOT SMOKE.'},roast:{label:'ROAST THE READING GLASSES',result:'enrage',text:'MISTAKE.'}}},
  paladin:{name:'PALADIN',hp:140,person:'paladin',moves:{swing:m('swing','HOLY SWING',28,{telegraph:'THE PALADIN RAISES HIS SWORD TO THE HEAVENS…'}),shield:m('shield','SHIELD UP',0,{effect:{guard:.5}})},pattern:['shield','swing'],
   octopus:{charisma:{label:'COMPLIMENT HIS ARMOR',result:'skip',turns:1,text:'HE POLISHES IT.'},recruit:{label:'OFFER HIM A REAL JOB',result:'nothing',text:'HE HAS A CALLING.'},roast:{label:'ASK ABOUT HIS DAD',result:'skip',turns:2,text:'HE STOPS TO TALK. FOR A WHILE.'}}},
  bard:{name:'BARD',hp:60,person:'bard',moves:{cover:m('cover','TERRIBLE COVER OF PLAYMAKERS',0,{effect:{richWeak:.85,turns:2}}),strum:m('strum','STRUM',8)},pattern:['cover','strum'],
   octopus:{charisma:{label:'CORRECT HIS LYRICS',result:'skip',turns:1,text:'HE WRITES THEM DOWN.'},recruit:{label:'OFFER A FEATURE',result:'spared',text:'HE PUTS THE LUTE DOWN.'},roast:{label:'"THAT\'S NOT HOW IT GOES"',result:'damage',amount:20,text:'HE KNOWS.'}}},
  cleric:{name:'CLERIC',hp:70,person:'cleric',moves:{heal:m('heal','HEAL ALLY',0,{healAlly:25,telegraph:'THE CLERIC IS PRAYING FOR SOMEONE…'}),judge:m('judge','JUDGE',14)},pattern:['judge','heal'],
   octopus:{charisma:{label:'ASK FOR A BLESSING',result:'skip',turns:1,text:'SHE IS CONFUSED ENOUGH TO GIVE ONE.'},recruit:{label:'CONFESS SOMETHING',result:'skip',turns:1,text:'SHE HAS TO LISTEN.'},roast:{label:'JUDGE HER BACK',result:'damage',amount:18,text:'IT LANDS.'}}},
  coffe:{name:'COFFE (ROGUE)',hp:90,person:'coffe',state:'rogue',eats:true,moves:{backstab:m('backstab','BACKSTAB',34,{telegraph:'COFFE IS CIRCLING BEHIND YOU…'}),dagger:m('dagger','DAGGER',14),sip:m('sip','SIP',0,{heal:10})},pattern:['dagger','sip','backstab'],
   octopus:{charisma:{label:'"YOU DON\'T EVEN LIKE THEM"',result:'skip',turns:2,text:'HE DOES NOT.'},recruit:{label:'SEND HIM BACK AS YOUR SPY',result:'spared',text:'HE NODS. SLOWLY.'},roast:{label:'"I DON\'T EVEN DRINK COFFEE"',result:'damage',amount:24,text:'HE DROPS THE ICED COFFEE.'}}},
  lil_smack:{name:'LIL SMACK',hp:70,person:'lil_smack',eats:true,moves:{chew:m('chew','CHEW ATTACK',14,{effect:{accDown:.1,turns:1}}),crumb:m('crumb','CRUMB SPRAY',8)},pattern:['chew','crumb'],
   octopus:{charisma:{label:'"CLOSE YOUR MOUTH"',result:'skip',turns:1,text:'HE IS SO SHOCKED HE LOSES HIS TURN.'},recruit:{label:'"JOIN MY SQUAD… WITH YOUR MOUTH CLOSED"',result:'nothing',text:'HE CANNOT.'},roast:{label:'"WE CAN SEE YOUR FOOD."',result:'damage',amount:22,text:'EVERYONE CAN.'}}},
  buckhead:{name:'BUCKHEAD VAMPIRE',hp:110,person:'buckhead',moves:{empire:m('empire','BRUNCH EMPIRE',22,{telegraph:'HE IS PITCHING A FRANCHISE…'}),mimosa:m('mimosa','MIMOSA TOSS',12)},pattern:['mimosa','empire'],
   octopus:{charisma:{label:'"SHE AIN\'T FOR SALE"',result:'spared',text:'MS. PATRICE HEARD THAT.'},recruit:{label:'OFFER HIM A FRANCHISE IN LA',result:'skip',turns:1,text:'HE CONSIDERS IT.'},roast:{label:'ROAST HIS BOAT SHOES',result:'damage',amount:20,text:'DEVASTATING.'}}},
  hunter:{name:'HUNTER',hp:70,person:'hilt',vampireHunter:true,moves:{bolt:m('bolt','CROSSBOW',18)},pattern:['bolt'],drop:{money:300},
   octopus:{charisma:{label:'"I\'M NOT EVEN THAT KIND OF VAMPIRE"',result:'skip',turns:1,text:'HE CHECKS HIS NOTES.'},recruit:{label:'OFFER HIM A SHIFT AT SLURP',result:'spared',text:'HE NEEDED A JOB.'},roast:{label:'ROAST THE CROSSBOW',result:'damage',amount:16,text:'IT IS FROM AMAZON.'}}},
  groupies:{name:'GROUPIE RUSH',hp:60,person:'tasha',moves:{hug:m('hug','HUG',6,{hits:3})},pattern:['hug'],drop:{followers:20},
   octopus:{charisma:{label:'SIGN EVERYTHING',result:'spared',text:'EVERYONE IS SATISFIED.'},recruit:{label:'START A CHANT',result:'spared',text:'THEY CHANT. YOU LEAVE.'},roast:{label:'"Y\'ALL NEED JOBS"',result:'damage',amount:20,text:'THEY LOVE IT.'}}},
  werewolf:{name:'MOONIE (FULL MOON)',hp:150,person:'moonie',state:'wolfed_out',moves:{swipe:m('swipe','SWIPE',20),howl:m('howl','HOWL',0,{effect:{accDown:.1,turns:2},telegraph:'SHE IS SNIFFING THE AIR FOR STEAK…'})},pattern:['howl','swipe','swipe'],
   octopus:{charisma:{label:'STAY CALM. LET HER HIT YOU.',result:'tame',text:'SHE STOPS. SHE REMEMBERS YOU.'},recruit:{label:'BUY HER A STEAK',result:'spared',text:'THE FOOD COURT IS CLOSED. RICH BREAKS IN.'},roast:{label:'"BAD DOG"',result:'enrage',text:'NO.'}}},
  training:{name:'TRAINING DUMMY',hp:60,moves:{bonk:m('bonk','BONK',8)},pattern:['bonk'],
   octopus:{charisma:{label:'BEFRIEND IT',result:'spared',text:'IT IS A DUMMY.'},recruit:{label:'RECRUIT IT',result:'spared',text:'IT JOINS. IT DOES NOTHING.'},roast:{label:'ROAST IT',result:'damage',amount:20,text:'IT HAS NO FEELINGS.'}}}
 };
 // Frozen enemy art (RAArtRegistry via RABtfPeople). `state` = the approved frozen state a fight is staged in (e.g. the
 // transformed or variant form) and replaces the identity anchor for the whole fight; event states (telegraph → strike
 // → hit → defeated) belong to the anchor identity, so they're used only when the fight has no named state.
 const COMBAT_STATES={telegraph:['telegraph'],strike:['strike','attack'],hit:['hit'],defeated:['defeated','poof']};
 function enemyArt(enemyId){
  const def=ENEMIES[enemyId],person=window.RABtfPeople?.get(def?.person);
  if(!person?.sprite)return {base:null,state:null,roles:{}};
  if(def.state){const src=person.states?.[def.state];if(!src)throw new Error(`combat: ${enemyId} names ${def.person}@${def.state}, which has no approved frozen state`);return {base:src,state:def.state,roles:{}};}
  const roles={};for(const [role,names] of Object.entries(COMBAT_STATES)){const name=names.find(n=>person.states?.[n]);if(name)roles[role]={state:name,src:person.states[name]};}
  return {base:person.sprite,state:null,roles};
 }
 window.RACombatData={MOVES,ITEMS,GUNS,FITS,ENEMIES,COMBAT_STATES,enemyArt};
})();
