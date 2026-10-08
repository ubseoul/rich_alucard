(function(){
 // W2 "FIRST REAL LIFE" (Days 8-20, VOL 1 10.2) + VOL 5 W2 slice (A42/A45/A48, Tristan, Lil Smack #2).
 // Non-Rich lines are functional drafts pending HQ Story; every Rich line is [VP].
 const {R,S,N,E}=RAContent;const D=RAAdventures.define;
 const keptAssistant=()=>RARelations.met('ceo_assistant_001')&&!!(RARelations.get('ceo_assistant_001')?.conversionState==='converted'||RARelations.get('ceo_assistant_001')?.flags?.stolen);

 // ---------------------------------------------------------------- A07 — BOBA AT THE GRAVE
 D({id:'A07',title:'BOBA AT THE GRAVE',lane:'dating',memoryType:'dating',start:'wake',nodes:{
  wake:{env:'bedroom',actors:{left:'rich'},
   enter:A=>{const person=keptAssistant()?'ceo_assistant_001':'kiki';A.set('person',person);RALife.unlockApp('instahoe');},
   lines:A=>[N('the phone buzzes.'),S(A.vars.person,'u still owe me boba.')],next:'route'},
  route:{route:{dest:{walkLabel:'WALK TO THE GRAVE'},next:'arrive'}},
  arrive:{env:'grave',title:'THE GRAVE · NIGHT',actors:{left:'rich'},
   lines:[N('the fountain is on. couples everywhere. somebody is proposing by the trolley.')],next:'meet'},
  // FU-01: `person` is chosen in `wake`; entering `meet` directly (dev/QA jumps) derives it the same way instead of crashing.
  meet:{env:'boba_shop',actors:A=>({left:'rich',right:A.vars.person||(keptAssistant()?'ceo_assistant_001':'kiki')}),
   enter:A=>{if(!A.vars.person)A.set('person',keptAssistant()?'ceo_assistant_001':'kiki');},
   lines:A=>{const p=RABtfPeople.get(A.vars.person);return [E(A.vars.person,`${p.name} is outside the shop, already looking at you.`),N('a couple nearby laughs at nothing.'),S(A.vars.person,'so. what do you actually do?')];},
   choices:[{label:"I'M A MUSIC ARTIST.",fx:X=>X.set('answer','music'),next:'order'},{label:'I OWN A CASTLE.',fx:X=>X.set('answer','castle'),next:'order'},{label:'HONESTLY? I\'M TRYING DIFFERENT LANES.',octopus:true,fx:X=>X.set('answer','honest'),next:'order'}]},
  order:{lines:[N('she orders for you, wrong on purpose: something bright pink with boba.'),R('this taste like a candle. i love it.')],next:'reaction'},
  reaction:{lines:A=>{const landed=(A.vars.answer==='honest'&&A.vars.person==='kiki')||(A.vars.answer==='castle'&&A.vars.person==='ceo_assistant_001')||(A.vars.answer==='music'&&RAState.get().life.creativeLife.music.cooked.length>0);A.set('landed',landed);
    return [S(A.vars.person,landed?'…ok. i like that.':'huh. sure.')];},next:'walk'},
  walk:{lines:[N('she walks away. she looks back once.')],
   end:{outcome:A=>A.vars.landed?'landed':'ok',
    fx:A=>{RARelations.add(A.vars.person,A.vars.landed?18:8,{reason:'a07'});RARelations.memory(A.vars.person,'a07_boba');RALife.setFlag('firstDateAt','the grave');},
    memory:A=>({text:`boba with ${RABtfPeople.get(A.vars.person).name.toLowerCase()} at the grave`,lane:'dating'}),
    receipt:A=>({id:`a07:${A.vars.person}`,caption:'the grave, night one. boba. she looked back once.'}),
    home:['rich','…i still taste the candle thing.',{vp:true}]}}
 }});

 // ---------------------------------------------------------------- A08 — FIRST SHIFT AT SLURP DYNASTY
 D({id:'A08',title:'FIRST SHIFT AT SLURP DYNASTY',lane:'money',memoryType:'money',start:'arrive',nodes:{
  arrive:{env:'slurp',title:'SLURP DYNASTY · LITTLE TOKYO',actors:{left:'rich',right:'okada'},
   enter:A=>{RARelations.meet('okada','a08');},
   lines:[N('Rich moved to LA to build his music career. Tonight, the help-wanted sign offers money he can actually earn.'),N("help wanted over help wanted they down bad"),S('okada',"vampires dont scare me customers do"),N("apron first name later")],
   choices:[{label:'PUT ON THE APRON',next:'hina'}]},
  hina:{env:'slurp',actors:{left:{id:'rich',state:'ramen_apron'},right:'okada',farRight:'hina'},
   enter:A=>{RARelations.meet('hina','a08');},
   lines:[E('hina',"hina got a knife and a stopwatch you better move"),S('hina',"dont fuck up my broth new guy")],next:'shift'},
  shift:{lines:[N("tickets rolling in")],minigame:{id:'slurp',params:()=>({firstShift:true}),next:(A,r)=>{A.set('res',r);return 'special';}}},
  special:{lines:A=>[N("blank ticket says THE RICH SPECIAL bro just got here"),R("i dont even know what that is"),N('you put jollof in the broth anyway. it works.'),N('hina tries it. she does not say anything nice, which from her is everything.'),S('hina',"menu updated keep moving")],
   enter:A=>{RALife.setFlag('jollofRamenOnMenu',true);},next:'clockout'},
  clockout:{lines:[S('okada',"you survived"),N("okada pays out the coffee can payroll fancy")],
   // ENGINEERING 05 (HQ route): Hina's own first beat follows the first Slurp Dynasty experience (one time).
   end:{outcome:'done',fx:A=>{},chain:()=>RAAdventures.available('A_HINA1')?'A_HINA1':null,memory:{text:'first shift at slurp dynasty',lane:'money'},
    receipt:{id:'a08:first',caption:'jollof ramen. on the menu now. because of you.'},
    home:['rich',"all that work for beans?",{canon:true,ube:true}]}}
 }});
 D({id:'SLURP',title:'SLURP DYNASTY',lane:'money',repeatable:true,oncePerNight:true,memoryType:'money',available:L=>L.done('A08'),start:'shift',nodes:{
  shift:{env:'slurp',actors:{left:'rich',right:'okada'},lines:[N("okada nods fryers scream thats clock in")],
   minigame:{id:'slurp',params:()=>({hinaBest:RAMinigames.progress('slurp').hinaBest||0,kevinChance:RALife.done('A18')?0.06:0}),next:(A,r)=>{A.set('res',r);return 'done';}}},
  done:{end:{outcome:'done',chain:()=>RAAdventures.available('A_HINA1')?'A_HINA1':null,memory:{text:'a shift at slurp dynasty',lane:'money',quality:.6},home:['rich',"feet hurt funds barely worth it",{vp:true}]}}
 }});
 RAPlaces.define([{id:'slurp',label:'SLURP DYNASTY',sub:'LITTLE TOKYO',adventure:L=>L.done('A08')?'SLURP':'A08',order:21}]);

 // ---------------------------------------------------------------- A09 — REGGIE NOT KEEF
 D({id:'A09',title:'REGGIE NOT KEEF',lane:'dragons',memoryType:'dragons',available:L=>!L.dragon,start:'arrive',nodes:{
  arrive:{env:'kush_crypt',title:'KUSH & CRYPT · MELROSE',actors:{left:'rich',right:'reggie'},
   enter:A=>{RARelations.meet('reggie','a09');},
   lines:[S('reggie','this is that FIRE. that KEEF.'),R('this shit is crazy. i came in here for za.'),N('reggie stops. he looks at the jar. he looks at you.')],next:'lower'},
  lower:{lines:[S('reggie','…this is reggie. not keef.'),S('reggie','you want the special?')],
   choices:[{label:'YEAH.',next:'back'}]},
  back:{env:'kush_back',lines:[N('the back room. one blue egg, under a heat lamp, humming.'),S('reggie','$4,200. cash only. don\'t ask where it\'s from.')],
   choices:[{label:'BUY IT ($4,200)',when:()=>RALife.money()>=4200,fx:X=>{if(RALife.spend(4200)){RADragon.adoptEgg();X.set('bought',true);}},next:A=>A.vars.bought?'fork':'broke'},{label:'NOT TODAY',next:'broke'}]},
  broke:{lines:[S('reggie','it\'ll still be here. probably.')],
   end:{outcome:'passed',memory:{text:'walked out of kush & crypt with nothing',lane:'dragons',quality:.3}}},
  fork:{env:'kush_crypt',lines:[N('you\'re holding an egg. in a dispensary. at night.')],
   choices:A=>[{label:'SUPRA WITH THE HEAT ON',when:()=>RALife.ownedCars().length>0,next:'home1'},{label:'WALK IT HOME IN YOUR SHIRT',next:'home2'},{label:'HOLD IT LIKE A BABY AND DRIVE WITH YOUR KNEES',octopus:true,when:()=>RALife.ownedCars().length>0,next:'home3'}]},
  home1:{lines:[N('heat on full blast. you drive under the speed limit for the first time ever.')],next:'end'},
  home2:{lines:[N('you carry it home under your shirt. a stranger films it. 40,000 likes.')],
   enter:A=>{RALife.addFollowers(80);window.RAVampGram?.post?.({handle:'grave.anon',text:'saw a vampire carrying something under his shirt like a baby. LA is healing.',likes:40000});},next:'end'},
  home3:{lines:[N('you steer with your knees. a cop pulls alongside, looks in, nods, drives off.')],next:'end'},
  end:{end:{outcome:'egg',memory:{text:'brought the egg home',lane:'dragons'},
   receipt:{id:'a09:egg',caption:'$4,200. one blue egg. no regrets.'},
   home:['rich','this shit is crazy. i own a dragon now.',{vp:true}]}}
 }});
 D({id:'KUSH',title:'KUSH & CRYPT',lane:'dragons',repeatable:true,memoryType:'dragons',available:L=>L.done('A09'),start:'store',nodes:{
  store:{env:'kush_crypt',actors:{left:'rich',right:'reggie'},title:'KUSH & CRYPT · MELROSE',
   lines:A=>[N(A.vars.bought?`${RALife.fmt(RALife.money())} left.`:'reggie nods. "for the dragon?"')],
   choices:A=>[...(RAStores.STORES.kush.items||[]).map(it=>{const info=RAStores.itemInfo(it);return {icon:RAStores.itemIcon?.(it),label:`${info.label}${info.owned?' (OWNED)':''}`,sub:RALife.fmt(info.price),when:()=>!info.owned&&RALife.money()>=info.price,fx:X=>{if(RAStores.buy(it))X.set('bought',(X.vars.bought||0)+1);},next:'store'};}),...(RAAdventures.available('A_EMBERLY1',{ignoreActive:true})?[{label:'THE BACK ROOM',fx:X=>X.set('chain','A_EMBERLY1'),next:'out'}]:[]),{label:"I'M GOOD",next:'out'}]},
  // ENGINEERING 05 (HQ route): Emberly is met in the back room — a one-time chain into A_EMBERLY1.
  out:{end:{chain:A=>A.vars.chain||null,outcome:A=>A.vars.bought?'bought':'browsed',memory:A=>({text:A.vars.bought?'stocking up at kush & crypt':'checking in on reggie',lane:'dragons',quality:A.vars.bought?1:.4})}}
 }});
 RAPlaces.define([{id:'kush',label:'KUSH & CRYPT',sub:'MELROSE',adventure:L=>L.done('A09')?'KUSH':'A09',order:12}]);

 // ---------------------------------------------------------------- A10 — UNCLE SUNDAY & THE AGEGE BREAD
 D({id:'A10',title:'UNCLE SUNDAY & THE AGEGE BREAD',lane:'dragons',memoryType:'dragons',available:L=>!!L.dragon,testSetup:ctx=>{ctx.RADragon.adoptEgg();},start:'arrive',nodes:{
  arrive:{env:'pet_crypt',title:'PET CRYPT',actors:{left:'rich',farRight:'uncle_sunday'},
   lines:[E('uncle_sunday','a pot-bellied man in slides and a buba is buying goldfish food. under his arm: the last loaf of agege bread.'),N('why is it in a pet store? nobody knows.'),N('you both reach for it.')],
   choices:[{label:'FIGHT HIM',next:'fight'},{label:'PAY DOUBLE',next:'pay'},{label:'CALL HIM UNCLE',octopus:true,next:'melt'}]},
  fight:{fight:{enemy:'uncle_sunday',params:{env:'pet_crypt',intro:'UNCLE SUNDAY WANTS TO KNOW WHO YOUR FATHER IS.'},win:'winbread',lose:'losebread',spared:'sparedbread'}},
  winbread:{lines:[N('he goes down laughing. "AH! YOU HAVE STRENGTH."'),N('he hands over the whole loaf.')],next:'settle'},
  losebread:{lines:[N('you go down first. he stands over you, delighted.'),N('"YOU TRIED." he tears the loaf in half anyway.')],next:'settle'},
  sparedbread:{lines:[N('you call him uncle mid-fight. he stops swinging immediately.')],next:'settle'},
  pay:{actors:{left:'rich',farRight:{id:'uncle_sunday',state:'offended'}},lines:[S('uncle_sunday','…you would insult me like that? fine. FINE.'),N('he takes double, muttering, and hands it over like it costs him something bigger than money.')],
   enter:A=>{RALife.spend(24);},next:'settle'},
  melt:{actors:{left:'rich',farRight:{id:'uncle_sunday',state:'melted'}},lines:[R('call him uncle.'),S('uncle_sunday','…UNCLE?'),N('he melts. he tears the loaf in half. he adopts you on the spot.')],next:'settle'},
  settle:{actors:{left:'rich',farRight:'uncle_sunday'},enter:A=>{RALife.addItem('agege_bread',1);RALife.setFlag('uncleSundayMet',true);RARelations.meet('uncle_sunday','a10');},
   lines:[S('uncle_sunday','you eating well? text me. i worry.')],
   end:{outcome:'bread',memory:{text:'the most respectful fight of your life, over bread',lane:'dragons'},
    receipt:{id:'a10:bread',caption:'agege bread. legendary. from a pet store.'},
    home:['rich',"new uncle unlocked damn",{vp:true}]}}
 }});

 // ---------------------------------------------------------------- A11 — HATCH NIGHT
 D({id:'A11',title:'HATCH NIGHT',lane:'dragons',memoryType:'dragons',available:L=>L.dragon?.stage==='egg',testSetup:ctx=>{ctx.RADragon.adoptEgg();},start:'wake',nodes:{
  wake:{env:'bedroom',actors:{left:'rich'},props:()=>[{src:window.RAArtRegistry?.props?.mazda_egg_bed?.asset,x:150,y:330}],lines:[N('something on the red bed is moving.')],next:'crack'},
  crack:{props:()=>[{src:window.RAArtRegistry?.props?.mazda_egg_cracking?.asset,x:150,y:330}],lines:[N('the egg cracks. a small blue dragon flops onto the bed, soaked and furious about it.')],next:'name'},
  name:{lines:[N('a name suggests itself, like it was always true.')],
   choices:[{label:'BLUEBERRY MAZDA',octopus:true,next:'confirm'}]},
  confirm:{lines:[R('blueberry mazda. that\'s your name. don\'t ask me why.'),N('…MAZDA. BLUEBERRY MAZDA.')],next:'sneeze'},
  sneeze:{lines:[N('her first act as a living creature: she sneezes a tiny flame and singes your bonnet.'),R('…worth it.')],
   enter:A=>{RALife.patchDragon({stage:'hatchling',sleepsAtStage:0,hatched:true,fedDay:RALife.today().day});},next:'end'},
  end:{end:{outcome:'hatched',memory:{text:'blueberry mazda hatched',lane:'dragons'},
   receipt:{id:'a11:hatch',caption:'she hatched. she singed my bonnet immediately.'},
   home:['rich','i have a whole dragon now.',{vp:true}]}}
 }});

 // ---------------------------------------------------------------- A12 — FIRST CAST (Santa Monica Pier)
 D({id:'A12',title:'FIRST CAST',lane:'dragons',memoryType:'dragons',available:L=>!!L.dragon?.hatched,
  testSetup:ctx=>{ctx.RADragon.adoptEgg();ctx.RAState.patch('life.ownership.dragon',{...ctx.RALife.dragon(),stage:'hatchling',hatched:true});},
  start:'arrive',nodes:{
  arrive:{env:'pier',title:'SANTA MONICA PIER · NIGHT',actors:{left:'rich',right:{id:'uncle_sunday',state:'fishing'}},
   lines:[E('uncle_sunday','uncle sunday is already here. three lines out.'),N('a folding chair. a cooler.'),S('uncle_sunday','she won\'t eat treats. she wants fish.'),S('uncle_sunday','sit down. i teach you.')],next:'teach'},
  teach:{lines:[N('CAST. WAIT. REEL.'),N('he says it like a prayer.')],choices:[{label:'LEARN',next:'cast'}]},
  cast:{minigame:{id:'pier',params:()=>({tutorial:true,uncleSunday:true}),next:(A,r)=>{A.set('catch',r);return 'react';}}},
  react:{actors:{left:{id:'rich',state:'holding_fish_away'},right:{id:'uncle_sunday',state:'fishing'}},shot:{profile:'conversation',focal:['left'],speakers:['left']},lines:[N('you hold the fish at arm\'s length, visibly suffering.'),R('i\'m not looking at it. tell me when it\'s gone.')],next:'mazda'},
  mazda:{actors:{left:'rich',right:{id:'uncle_sunday',state:'fishing'}},lines:A=>RALife.dragon()?.hatched?[N('blueberry mazda swoops down and eats it off the line before you can react.'),S('uncle_sunday','…she has good form.')]:[N('you set it down carefully, like it might still hurt you.')],next:'end'},
  end:{end:{outcome:'caught',memory:{text:'first cast at santa monica pier',lane:'dragons'},
   receipt:{id:'a12:first',caption:'first catch. i did not look at it once.'},
   home:['rich','i fish now, apparently.',{vp:true}]}}
 }});
 // ENGINEERING 05 incidental fix: the repeatable PIER that the pier place, the VampGPT money lane and the pier_money want
 // already route to was never defined, so fishing vanished after A12. The existing PIER minigame, once a night.
 D({id:'PIER',title:'SANTA MONICA PIER',lane:'dragons',repeatable:true,oncePerNight:true,memoryType:'dragons',available:L=>L.done('A12'),start:'fish',nodes:{
  fish:{env:'pier',actors:{left:'rich'},minigame:{id:'pier',params:()=>({rain:RALife.today().rain}),next:(A,r)=>'done'}},
  done:{end:{outcome:'fished',memory:{text:'night fishing at the pier',lane:'dragons',quality:.5}}}
 }});
 RAPlaces.define([{id:'pier',label:'SANTA MONICA PIER',sub:'NIGHT FISHING',when:L=>!!L.dragon,adventure:L=>L.done('A12')?'PIER':'A12',order:22}]);

 // ---------------------------------------------------------------- A13 — ANGELES CREST AT MIDNIGHT
 D({id:'A13',title:'ANGELES CREST AT MIDNIGHT',lane:'cars',memoryType:'cars',available:L=>(L.life.ownership.cars||[]).length>0,
  testSetup:ctx=>{ctx.RALife.addCar({id:ctx.RACars.SUPRA,make:'Toyota',model:'Supra MK4',short:'SUPRA',price:0});},
  start:'meet',nodes:{
  // ART SHIP 014: "leaning on a pink s2000" — her car's frozen WORLD surface behind her.
  meet:{env:'crest',title:'ANGELES CREST · MIDNIGHT',actors:{left:'rich',right:'pinky'},props:[{src:window.RAArtRegistry?.vehicles?.world?.s2000?.asset,x:200,y:372}],
   enter:A=>{RARelations.meet('pinky','a13');},
   lines:[E('pinky','a woman is leaning on a pink s2000, fuzzy wheels and all.'),S('pinky','u drive that or just own it?'),N('she does not believe you can drive stick.')],
   choices:[{label:'PROVE IT',next:'lesson1'}]},
  lesson1:{lines:[N('INITIATE.')],minigame:{id:'touge',params:()=>({car:RACars.toTouge(RALife.ownedCars()[0]||{}),course:'angeles_crest',lesson:1}),next:()=>'lesson2'}},
  lesson2:{lines:[N('COUNTERSTEER.')],minigame:{id:'touge',params:()=>({car:RACars.toTouge(RALife.ownedCars()[0]||{}),course:'angeles_crest',lesson:2}),next:()=>'lesson3'}},
  lesson3:{lines:[N('THROTTLE.')],minigame:{id:'touge',params:()=>({car:RACars.toTouge(RALife.ownedCars()[0]||{}),course:'angeles_crest',lesson:3}),next:()=>'lesson4'}},
  lesson4:{lines:[N('CLIP. she pulls up behind you. tandem, for real this time.')],
   minigame:{id:'touge',params:()=>({car:RACars.toTouge(RALife.ownedCars()[0]||{}),course:'angeles_crest',lesson:4,tandem:{rival:'PINKY',role:'lead',threshold:3000}}),next:(A,r)=>{A.set('won',r.outcome==='win');return 'result';}}},
  result:{lines:A=>[S('pinky',A.vars.won?'…ok. you can drive.':'you\'ll get it. drive home slow.'),N('she laughs at your worst spin. she posts your best one.')],
   enter:A=>{RALife.unlockApp('touge');window.RAVampGram?.post?.({handle:'pinky',text:'taught a new guy to drift tonight. jury\'s out.',likes:900});},
   end:{outcome:A=>A.vars.won?'won':'learned',memory:{text:'the first drift lesson, angeles crest',lane:'cars'},
    receipt:{id:'a13:first',caption:'four runs up the crest. i can drive stick now. mostly.'},
    home:['rich','my hands are shaking. good shaking.',{vp:true}]}}
 }});

 // ---------------------------------------------------------------- A14 — OPEN MIC AT THE CATACOMB
 function setChoices(){return (RAState.get().life.creativeLife.music.cooked||[]).filter(s=>window.RAMusicLibrary?.trackFor(s.trackId||s.beat)).slice(-6).map(s=>({label:`PERFORM "${s.title}"`,sub:`EXISTING MASTER: ${s.masterTitle||s.beat}`,fx:A=>A.set('song',s.id),next:'performance'}));}
 function showParams(A){const song=(RAState.get().life.creativeLife.music.cooked||[]).find(s=>s.id===A.vars.song);return {performance:true,trackId:song?.trackId||song?.beat||'almond_freestyle',songTitle:song?.title||'FREESTYLE',durationMs:30000,target:1500,seedWords:RAMusic.seedWords(),memoryRef:song?.memory||null,day:RALife.today().day};}
 function performanceNext(A,r){A.set('showOutcome',r.quit?'quit':r.outcome==='win'?'success':'failure');A.set('crowd',Math.min(180,Math.round((r.score||0)/100)));return 'result';}
 function settleShow(A){return RAMusic.showResult(A.vars.crowd||0,{id:`${A.id}:${RALife.today().day}:${RAAdventures.record(A.id)?.count||0}`,songId:A.vars.song,outcome:A.vars.showOutcome||'quit'});}
 const showNodes={
  setlist:{env:'catacomb',actors:{left:'rich'},lines:[N('Your words, your room. Pick a saved draft or freestyle. Land rhymes to hold the crowd; the recording is an existing Rich master.')],choices:()=>[...setChoices(),{label:'FREESTYLE',next:'performance'},{label:'NOT TONIGHT',fx:A=>A.set('showOutcome','quit'),next:'result'}]},
  performance:{actors:{left:{id:'rich',state:'on_stage'}},minigame:{id:'bars',params:showParams,next:performanceNext}},
  result:{env:'catacomb',actors:{left:{id:'rich',state:'on_stage'},right:'tasha'},enter:A=>{RARelations.meet('tasha','catacomb');A.set('pay',settleShow(A));},
   lines:A=>{const song=(RAState.get().life.creativeLife.music.cooked||[]).find(s=>s.id===A.vars.song),ok=A.vars.showOutcome==='success';return [S('tasha',ok?`That ${song?.hook?`"${song.hook}" hook`:'last verse'} landed. ${song?.dropped?`I saw "${song.title}" on VampGram. Now I get it.`:'Put this one out when you are ready.'}`:A.vars.showOutcome==='quit'?'Another night. The mic will still be here.':'You lost the room on that run. Keep the words; try a different delivery.'),N(ok?`${RALife.fmt(A.vars.pay||0)} performance pay. A real set, a real receipt.`:'No performance pay tonight.')];},next:'end'},
  end:{end:{outcome:A=>A.vars.showOutcome||'quit',memory:A=>({text:`${A.vars.showOutcome==='success'?'performed':'attempted'} ${(RAState.get().life.creativeLife.music.cooked||[]).find(s=>s.id===A.vars.song)?.title||'a freestyle'} at the catacomb`,lane:'music'}),home:A=>['rich',A.vars.showOutcome==='success'?'.somebody heard me tonight.':'.keep writing.',{vp:true}]}}
 };
 D({id:'A14',title:'OPEN MIC AT THE CATACOMB',lane:'music',memoryType:'music',start:'arrive',nodes:{
  arrive:{env:'catacomb',title:'THE CATACOMB',actors:{left:'rich'},lines:[N('a venue in the basement of a koreatown laundromat. dryers thump through the ceiling.'),R('.came to LA for the music. tonight I get on the mic.')],next:'setlist'},...showNodes
 }});
 D({id:'SHOW',title:'A SHOW AT THE CATACOMB',lane:'music',repeatable:true,oncePerNight:true,memoryType:'music',available:L=>L.done('A14'),start:'setlist',nodes:showNodes});
 RAPlaces.define([{id:'catacomb',label:'THE CATACOMB',sub:L=>L.done('A14')?'PLAY A SHOW':'OPEN MIC NIGHT',adventure:L=>L.done('A14')?'SHOW':'A14',order:23}]);

 // ---------------------------------------------------------------- A15 — IRON JAW
 D({id:'A15',title:'IRON JAW',lane:'music',memoryType:'music',available:L=>L.done('A14'),
  testSetup:ctx=>{ctx.RAState.patch('life.adventures.records.A14',{status:'completed',count:1,completedDay:1});},
  start:'arrive',nodes:{
  arrive:{env:'catacomb',title:'THE CATACOMB',actors:{left:'rich',right:'iron_jaw'},
   enter:A=>{RARelations.meet('iron_jaw','a15');},
   lines:[E('iron_jaw','a masked man steps up, holding a capri sun.'),S('iron_jaw','who is rich alucard and why is he rapping in my laundromat.'),N('a crowd forms. a real one.')],
   choices:[{label:'BATTLE HIM',next:'battle'}]},
  battle:{minigame:{id:'bars',params:()=>({opponent:{name:'IRON JAW',rounds:3}}),next:(A,r)=>{A.set('res',r);return r.outcome==='win'?'win':'lose';}}},
  win:{actors:{left:'rich',right:{id:'iron_jaw',state:'defeated'}},lines:[S('iron_jaw','…his final verse. about a capri sun. it almost works.'),N('you beat him. barely.'),S('iron_jaw','respect. nobody raps about juice pouches like you.')],
   enter:A=>{RALife.setFlag('ironJawRespect',true);},
   end:{outcome:'win',memory:{text:'beat iron jaw in a bars battle',lane:'music'},
    receipt:{id:'a15:win',caption:'iron jaw. masked villain. beat him over a capri sun.'},
    home:['rich','the masked snack guy respects me now.',{vp:true}]}},
  lose:{lines:[S('iron_jaw','…that\'s that.'),N('he posts about your bonnet within the hour.')],
   enter:A=>{window.RAVampGram?.post?.({handle:'iron.jaw',text:'that bonnet is not doing what he thinks it\'s doing.',likes:2200});},
   end:{outcome:'lose',memory:{text:'lost a bars battle to iron jaw',lane:'music',quality:.5},
    home:['rich','the bonnet slander is uncalled for.',{vp:true}]}}
 }});

 // ---------------------------------------------------------------- A16 — CAFÉ LAPTOP NIGHT
 D({id:'A16',title:'CAFÉ LAPTOP NIGHT',lane:'music',memoryType:'music',start:'arrive',nodes:{
  arrive:{env:'cafe',title:'BEAN THERE DEAD THAT',actors:{left:'rich',right:'wispa'},
   enter:A=>{RARelations.meet('wispa','a16');},
   lines:[N('Rich moved to Los Angeles for music. Tonight there is a laptop, an outlet and time he can choose to use.'),N('The songs playing through his nights are his recordings. The new memories can become the next draft.'),E('wispa','a ghost by the outlet watches you without blinking.'),S('wispa','you said you make music. when\'s the last time you made music.')],next:'open'},
  open:{lines:[N('The job can wait for a moment. Making a song is an opportunity, not another debt.')],choices:[{label:'OPEN THE LAPTOP',fx:A=>A.set('wantCook',true),next:'wispa2'},{label:'JUST SIT TONIGHT',next:'quiet'}]},
  quiet:{lines:[S('wispa','The outlet will still be here. So will I.'),N('Rich closes the laptop. A quiet night does not cancel why he came.')],next:'end'},
  wispa2:{actors:{left:{id:'rich',state:'laptop_seated'},right:'wispa'},lines:[S('wispa','i\'ve haunted this outlet since 1987. you\'re the first interesting thing plugged in.')],next:'end'},
  end:{end:{outcome:'visited',chain:A=>A.vars.wantCook&&RAAdventures.available('COOK')?'COOK':null,
   fx:A=>{RALife.setFlag('firstCafeVisited',true);RALife.unlockApp('bars');RARelations.memory('wispa','a16_cafe');},
   memory:{text:'visited the café with Wispa',lane:'music'},
   receipt:{id:'a16:first',caption:'bean there dead that. a place to make music.'},
   home:A=>RALife.today().rain?['rich','wispa stayed the whole time. rain does that to her.',{vp:true}]:['rich','that ghost has better taste than most a&rs.',{vp:true}]}}
 }});
 D({id:'CAFE',title:'BEAN THERE DEAD THAT',lane:'music',repeatable:true,oncePerNight:true,memoryType:'music',available:L=>L.done('A16'),start:'sit',nodes:{
  sit:{env:'cafe',actors:{left:'rich',right:'wispa'},
   lines:A=>[N(RALife.today().rain?'rain on the window. wispa stays longer tonight.':'lofi. the outlet flickers. wispa is by the window, same as always.')],
   choices:A=>[{label:'COOK A TRACK',when:()=>RAAdventures.available('COOK',{ignoreActive:true}),fx:X=>X.set('wantCook',true),next:'done'},{label:'JUST SIT',next:'done'}]},
  done:{end:{outcome:'hangout',chain:A=>A.vars.wantCook&&RAAdventures.available('COOK')?'COOK':null,
   memory:{text:'a quiet night at the café',lane:'music',quality:.5},
   home:A=>A.vars.wantCook?null:['rich','the calmest place in LA. i needed that.',{vp:true}]}}
 }});
 RAPlaces.define([{id:'cafe',label:'BEAN THERE DEAD THAT',sub:'CAFÉ',adventure:L=>L.done('A16')?'CAFE':'A16',order:24}]);

 // ---------------------------------------------------------------- A17 — NNEKA'S BLOOD BANK
 D({id:'A17',title:"NNEKA'S BLOOD BANK",lane:'home',memoryType:'home',available:L=>!!L.flag('a17Pending'),
  testSetup:ctx=>{ctx.RAState.patch('life.world.flags.a17Pending',{bill:4200,enemy:'test'});},
  start:'wake',nodes:{
  wake:{env:'blood_bank',title:'LIFEBLOOD BLOOD BANK · CRENSHAW',actors:{left:'rich',right:'nneka'},
   enter:A=>{const p=RALife.flag('a17Pending')||{};A.set('bill',p.bill||2000);A.set('enemy',p.enemy||'someone');RARelations.meet('nneka','a17');},
   lines:[N('fluorescent lights. a cot. a very disappointed nurse.'),E('nneka','she doesn\'t look up from her clipboard.'),S('nneka','my patients are vampires. sit down.')],next:'bill'},
  bill:{actors:{left:'rich',right:{id:'nneka',state:'handing_bill'}},lines:A=>[N(`she hands you the bill. ${RALife.fmt(A.vars.bill)}. itemized.`),S('nneka','ADEOLUWA. sit. down.')],next:'donor'},
  donor:{actors:{left:'rich',right:'nneka'},lines:[R('i can donate. i mean, you know. i\'m a vampire, you\'re — never mind.')],choices:[{label:'…NEVER MIND.',next:'refuse'}]},
  refuse:{lines:[S('nneka','no. and don\'t ask again.'),N('she checks your pulse anyway. out of habit, not permission.')],next:'end'},
  end:{end:{outcome:'woke',
   fx:A=>{RARelations.add('nneka',10,{reason:'a17'});RARelations.memory('nneka','a17_woke_up_here');RALife.setFlag('a17Pending',null);},
   memory:{text:'woke up at nneka\'s blood bank',lane:'home'},
   receipt:{id:'a17:first',caption:'lifeblood blood bank. she called me adeoluwa.'},
   home:['rich','she said i\'m anemic. i\'m a vampire.',{vp:true}]}}
 }});

 // ---------------------------------------------------------------- VOL 5 W2: A48 RETWIST
 D({id:'A48',title:'RETWIST',lane:'home',memoryType:'home',start:'arrive',nodes:{
  arrive:{env:'salon',title:'TWIST & SHOUT · HYDE PARK',actors:{left:'rich',right:'june'},
   enter:A=>{RARelations.meet('june','a48');},
   lines:[E('june','a woman with rings on every finger waves you to the chair.'),S('june','sit. these locs have seen things.')],next:'question'},
  question:{lines:[S('june','so what\'s actually going on with you?')],
   choices:[{label:'TELL HER THE TRUTH.',fx:X=>X.set('answer','truth'),next:'mirror'},{label:'"NOTHING. VIBES."',fx:X=>X.set('answer','vibes'),next:'mirror'}]},
  mirror:{lines:A=>[N('she palm-rolls one loc while you talk. she doesn\'t ask twice.'),N('she holds up a mirror.'),N('there\'s nothing in it. rich has no reflection. they both look anyway.'),S('june','…you look good tho.')],
   enter:A=>{RALife.spend(85);RALife.setFlag('freshUntil',RALife.today().day+5);RALife.setFlag('lastRetwistDay',RALife.today().day);RARelations.add('june',A.vars.answer==='truth'?14:6,{reason:'a48'});},
   next:'end'},
  end:{end:{outcome:'fresh',memory:{text:'first retwist at twist & shout',lane:'home'},
   receipt:{id:'a48:mirror',caption:'the empty mirror. she shrugged. "you look good tho."'},
   home:['rich','fresh. i feel like a new vampire.',{vp:true}]}}
 }});
 D({id:'RETWIST',title:'TWIST & SHOUT',lane:'home',repeatable:true,memoryType:'home',available:L=>L.done('A48'),start:'chair',nodes:{
  chair:{env:'salon',actors:{left:'rich',right:'june'},
   lines:A=>[S('june',(RALife.flag('freshUntil')||0)>=RALife.today().day?'you\'re early. i like it.':'come here. these locs are crunchy.')],
   choices:[{label:`RETWIST (${RALife.fmt(85)})`,when:()=>RALife.money()>=85,fx:X=>{RALife.spend(85);RALife.setFlag('freshUntil',RALife.today().day+5);RALife.setFlag('lastRetwistDay',RALife.today().day);RARelations.add('june',6,{reason:'retwist'});X.set('did',true);},next:'done'},{label:'NOT TODAY',next:'done'}]},
  done:{end:{outcome:A=>A.vars.did?'fresh':'skipped',
   memory:{text:'a retwist at twist & shout',lane:'home',quality:.6},
   home:A=>A.vars.did?['rich','fresh again. every time.',{vp:true}]:null}}
 }});
 RAPlaces.define([{id:'salon',label:'TWIST & SHOUT',sub:'HYDE PARK',adventure:L=>L.done('A48')?'RETWIST':'A48',order:25}]);

 // ---------------------------------------------------------------- A42 — TABLE FOR ONE
 D({id:'A42',title:'TABLE FOR ONE',lane:'food',repeatable:true,memoryType:'food',start:'arrive',nodes:{
  arrive:{env:'brunch',title:'EGGS BENEDEAD · SILVER LAKE',actors:{left:'rich'},
   lines:[S(null,'"just one?"'),R('just one.'),N('a window seat. couples everywhere. a mom with a stroller.')],next:'sit'},
  sit:{lines:[N('chicken and waffles. a mimosa. nothing happens.')],
   choices:[{label:'LOOK OUT THE WINDOW',next:'sit'},{label:'EAT',next:'sit'},{label:'CHECK PHONE',next:'sit'},{label:"I'M GOOD",next:'end'}]},
  end:{end:{outcome:'sat',memory:{text:'brunch alone at eggs benedead',lane:'food',quality:.8},
   home:['rich','that was exactly what it needed to be.',{vp:true}]}}
 }});
 RAPlaces.define([{id:'brunch',label:'EGGS BENEDEAD',sub:'SUNDAYS · SILVER LAKE',when:L=>L.info.sunday,adventure:'A42',order:26}]);

 // ---------------------------------------------------------------- A45 — YU & ME ONSEN
 D({id:'A45',title:'YU & ME ONSEN',lane:'home',repeatable:true,memoryType:'home',start:'arrive',nodes:{
  arrive:{env:'onsen',title:'YU & ME ONSEN · TORRANCE',actors:{left:'rich'},
   lines:[N('towel, robe, slippers, steam. montana plays faintly, somehow.'),N('the other bathers are elderly men who nod at you like you belong here.')],next:'soak'},
  soak:{choices:[{label:'STAY LONGER',next:'soak'},{label:'GET OUT',next:'end'}]},
  end:{end:{outcome:'soaked',fx:A=>{RALife.setFlag('locsBloody',false);},
   memory:{text:'the onsen, quietest place in LA',lane:'home',quality:.7},
   home:['rich','my body forgot every bad thing that happened to it.',{vp:true}]}}
 }});
 RAPlaces.define([{id:'onsen',label:'YU & ME ONSEN',sub:'TORRANCE',order:27,adventure:'A45'}]);

 // ---------------------------------------------------------------- TRISTAN INTRO
 D({id:'A_TRISTAN',title:'TRISTAN',lane:'people',memoryType:'people',start:'arrive',nodes:{
  arrive:{env:'docks',title:'THE DOCKS',actors:{left:'rich',right:'tristan'},
   enter:A=>{RARelations.meet('tristan','w2');},
   lines:[E('tristan','a guy in a vintage band tee is holding out your lighter.'),S('tristan','you dropped this. also — you\'re the castle guy, right?')],next:'talk'},
  talk:{lines:[S('tristan','i\'m not gonna ask about the vampire thing. i just wanna know what you\'re eating.')],
   choices:[{label:'TELL HIM ABOUT THE JOLLOF.',fx:X=>X.set('topic','food'),next:'end'},{label:'ASK WHAT HE\'S DOING LATER.',fx:X=>X.set('topic','hang'),next:'end'}]},
  end:{end:{outcome:'met',fx:A=>{RARelations.add('tristan',15,{reason:'w2'});},
   memory:{text:'met tristan at the docks',lane:'people'},
   home:['rich','that dude is unbothered by everything. i like that.',{vp:true}]}}
 }});

 // ---------------------------------------------------------------- LIL SMACK #2 (food court)
 D({id:'A_SMACK2',title:'LIL SMACK AT THE FOOD COURT',lane:'combat',memoryType:'combat',available:L=>L.day>=12,start:'arrive',nodes:{
  arrive:{env:'food_court',title:'THE GRAVE · FOOD COURT',actors:{left:'rich',right:'lil_smack'},
   enter:A=>{RARelations.meet('lil_smack','w2');},
   lines:[E('lil_smack','a small loud man is eating orange chicken with his mouth wide open.'),N('crumbs are involved. crumbs are always involved.'),R('bro. close your mouth.')],
   choices:[{label:'MENU FIGHT HIM',next:'fight'},{label:'CLOSE YOUR MOUTH.',octopus:true,next:'octo'}]},
  fight:{fight:{enemy:'lil_smack',params:{env:'food_court',intro:'LIL SMACK IS STILL CHEWING.'},win:'won',lose:'lost',spared:'octo'}},
  won:{lines:[N('he drops the tray. he is, briefly, ashamed.')],next:'end'},
  lost:{lines:[N('he beats you with crumb spray alone. this is somehow worse than losing normally.')],next:'end'},
  octo:{lines:[N('he is so shocked he loses his turn entirely.')],next:'end'},
  end:{end:{outcome:'done',fx:A=>{RALife.counter('lilSmack');},
   memory:{text:'lil smack, round two, the food court',lane:'combat',quality:.5},
   home:['rich','that man is going to be a problem forever.',{vp:true}]}}
 }});

 // ---------------------------------------------------------------- Temptations (vampgpt/DM/craving triggers)
 RATemptations.define([
  {id:'w2_boba',source:'vampgpt',line:'someone\'s about to dm you about boba.',minDay:8,weight:3,priority:5,adventure:'A07'},
  {id:'w2_slurp',source:'vampgpt',line:'you ever had a job? (i know you haven\'t.)',minDay:8,weight:2,priority:3,adventure:'A08'},
  {id:'w2_za',source:'craving',line:'i want za so bad.',minDay:9,weight:2,priority:4,adventure:'A09'},
  {id:'w2_bread',source:'vampgpt',line:'the egg needs something special. pet crypt has it, weirdly.',weight:1.5,priority:2,when:L=>!!L.dragon,adventure:'A10'},
  {id:'w2_crest',source:'vampgpt',sender:'PINKY',line:'u drive that or just own it?',minDay:10,weight:2,priority:4,when:L=>(L.life.ownership.cars||[]).length>0,adventure:'A13'},
  {id:'w2_flyer',source:'vampgram',line:'flyer on your feed: OPEN MIC NIGHT · THE CATACOMB.',minDay:11,weight:1.5,priority:3,adventure:'A14'},
  {id:'w2_callout',source:'vampgram',line:'who is rich alucard and why is he rapping in my laundromat.',minDay:13,weight:1.5,priority:2,when:L=>L.done('A14'),adventure:'A15'},
  {id:'w2_cafe',source:'vampgpt',line:'you said you make music. when\'s the last time you made music.',minDay:10,weight:2,priority:4,adventure:'A16'},
  {id:'w2_tristan',source:'vampgpt',line:'somebody at the docks has your lighter.',minDay:9,weight:1.5,priority:2,adventure:'A_TRISTAN'},
  {id:'w2_smack',source:'craving',line:'i heard chewing. loud chewing.',minDay:12,weight:1,repeatable:true,cooldown:10,adventure:'A_SMACK2'},
  {id:'w2_brunch',source:'craving',line:'brunch. by myself.',weight:1.5,repeatable:true,cooldown:5,when:L=>L.info.sunday,adventure:'A42'},
  {id:'w2_onsen',source:'craving',line:'my body hurt.',weight:1.5,repeatable:true,cooldown:4,when:L=>(RAState.get().life.combat.defeats||0)>0,adventure:'A45'},
  {id:'w2_retwist',source:'vampgpt',line:'your locs are getting crunchy.',weight:1.5,repeatable:true,cooldown:10,when:L=>L.flag('locsBloody')||L.day-(L.flag('lastRetwistDay')||0)>=14,adventure:L=>L.done('A48')?'RETWIST':'A48'}
 ]);

 // ---------------------------------------------------------------- Wake triggers (interrupt the morning)
 RAWakeTriggers.define([
  {adventure:'A11',priority:9,when:L=>L.dragon?.stage==='egg'&&(L.dragon.sleepsAtStage||0)>=3},
  {adventure:'A17',priority:10,when:L=>!!L.flag('a17Pending')}
 ]);

 // ---------------------------------------------------------------- Recurring texts (Uncle Sunday, Iron Jaw)
 RAClock.onWake('w2-checkins',48,({info})=>{
  if(RALife.flag('uncleSundayMet')&&info.day-(RALife.flag('lastUncleCheckin')||0)>=6){RALife.setFlag('lastUncleCheckin',info.day);RALife.text('uncle_sunday','UNCLE SUNDAY','have you eaten?',{id:`uncle:${info.day}`});}
  if(RALife.flag('ironJawRespect')&&!RALife.flag('ironJawCrackerDm')){RALife.setFlag('ironJawCrackerDm',true);RALife.text('iron_jaw','IRON JAW','you eat crackers? real ones talk texture.',{id:`ironjaw:${info.day}`});}
 });
})();
