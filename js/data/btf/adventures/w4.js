(function(){
 // W4 — WAVE 4 "PEOPLE & ARCS" (VOL 1 §9/10.3, VOL 5 §2/7/8). Non-Rich lines are functional drafts pending
 // HQ Story; every Rich line is [VP]. Owned exclusively by this file — see docs/btf/CONTENT_AUTHORING.md.
 const {R,S,N,E}=RAContent;const D=RAAdventures.define;

 // ===================================================================================================
 // A29 — COFFE, in three parts (PT1 run, PT2 rogue status, PT3 the raid). Rich [VP] lines per VOL 1 A29.
 // ===================================================================================================
 RABtfPeople.byId.coffe.dateable=false;
 D({id:'A29',title:'COFFE RUN',lane:'people',scope:'MUST',memoryType:'people',start:'arrive',
  available:L=>L.day>=2&&L.day<=8,
  nodes:{
  arrive:{env:'street_night',actors:{left:'rich',right:'coffe'},title:'THE FRONT GATE',
   lines:[N('somebody is banging on the gate. it is not a vampire hunter. it is a guy with two iced coffees.'),
    E('coffe','he holds them up like trophies.'),S('coffe',"YO. RICH ALUCARD. I GOT YOU. TWO ICED COFFEES, ONE FOR EACH OF US."),
    R("i can't drink coffee. i'm a vampire."),S('coffe','…oh. OH. say less.')],next:'drink'},
  drink:{actors:{left:'rich',right:{id:'coffe',state:'hype'}},lines:[N('he drinks both. back to back. no hands shaking. eyes wide the whole castle block.'),
    S('coffe','I\'M COFFE. I JUST MOVED ON THE BLOCK. I KNEW WE WAS GONNA BE HOMIES.'),
    R('…you good, bro?'),S('coffe','NEVER BETTER. NEVER BETTER. WANNA SEE SOMETHING?')],
   choices:[{label:'"…SURE."',next:'hype'},{label:'WATCH HIM VIBRATE IN SILENCE',octopus:true,next:'hype'}]},
  hype:{lines:[N('he does a lap around the block at a speed that should not be possible on foot. he comes back. he is fine.'),
    S('coffe','ANYWAY. WELCOME TO THE HOOD. HERE.'),N('he gives you his number before you ask for it.')],
   enter:A=>{RARelations.meet('coffe','castle_gate');RALife.unlockApp('texts',{silent:true});RALife.remember({text:'coffe showed up with two iced coffees and drank both',lane:'people'});},
   end:{outcome:'met',memory:{text:'met coffe. he drank both iced coffees.',lane:'people'},
    home:['rich','that dude might be the funniest addition to this block.',{vp:true}]}}
 }});

 // ENGINEERING 06 route: PT1 had no player entry. VOL 1 A29 "PT 1 — COFFE RUN (Days 2–8): Coffe shows up" — his
 // knock is world-initiated, so it arrives as the morning's wake beat in that window (lowest priority).
 RAWakeTriggers.define([{adventure:'A29',priority:5,when:L=>L.day>=2&&L.day<=8}]);
 // PT2 — ROGUE STATUS. Tells accumulate as mail/texts/VampGram over days 20-30, then the fork adventure.
 const TELLS=[
  {id:'tell1',day:20,line:'the back entrance is roped off now. "for fire safety," coffe says.'},
  {id:'tell2',day:23,line:'a VampGram story: a blurred fourth member of vicky\'s party, holding an iced coffee.'},
  {id:'tell3',day:26,line:'tokyo tony, texting: "coffe been moving different lately. you notice?"'}
 ];
 RAClock.onWake('a29-tells',55,({info})=>{
  if(!RARelations.met('coffe')||RALife.done('A29B')||RALife.done('A29C'))return;
  if(info.day<20||info.day>30)return;
  const t=TELLS.find(x=>x.day===info.day);if(!t)return;
  RALife.counter('coffeTells');RALife.setFlag('coffeRogue','watching');
  if(t.id==='tell2')window.RAVampGram?.post?.({handle:'grave.cam',text:t.line,likes:900});
  else RALife.mail({id:`a29:${t.id}`,kind:'people',title:'THE BLOCK',body:t.line});
 });
 D({id:'A29B',title:'ROGUE STATUS',lane:'people',scope:'MUST',memoryType:'people',start:'weigh',
  available:L=>L.done('A29')&&(Number(L.flag('coffeTells'))||0)>=2&&!L.done('A29C'),
  nodes:{
  weigh:{env:'street_night',actors:{left:'rich'},title:'SOMETHING IS OFF ABOUT COFFE',
   lines:[N('three tells in a week. the fire-safety door. the blurred story. tokyo tony\'s text.'),
    R("he's my homie. but he's also acting like he's got a second job.")],
   choices:[{label:'CONFRONT HIM EARLY',next:'confront'},{label:'IGNORE IT',fx:A=>RALife.setFlag('coffeRogue','ignored'),next:'ignore'}]},
  confront:{env:'street_night',actors:{left:'rich',right:'coffe'},lines:[S('coffe','confront me? about what? i live here. i love it here.'),
    N('he lies well. smooth. barely a beat missed.')],
   choices:[{label:'LET IT GO',fx:A=>RALife.setFlag('coffeRogue','confronted'),next:'letgo'},
    {label:'EXPOSE HIM',octopus:true,when:()=>RALife.L().known3cool,sub:'3+ PEOPLE AT COOL+ HAVE TO VOUCH',next:'expose'}]},
  expose:{actors:{left:'rich',right:{id:'coffe',state:'caught'}},lines:[N('you pull three people who know coffe — real ones, cool with you — into the group chat at once.'),
    S('coffe','…y\'all really did that. ok. ok, real talk—'),N('he cracks. not all the way. but enough.'),
    S('coffe','vicky\'s party been paying me to keep tabs on the castle. i drink the coffee for real though. that part\'s true.'),
    R("that's the least surprising part of this whole story.")],
   enter:A=>{RALife.setFlag('coffeRogue','exposed');RARelations.setFlag('coffe','exposedEarly',true);},next:'letgo'},
  letgo:{lines:[N('nothing changes tonight. the block keeps moving.')],end:{outcome:'confronted',memory:{text:'called out coffe about vicky\'s party',lane:'people'},home:['rich','i\'m watching that man now.',{vp:true}]}},
  ignore:{lines:[N('you let it ride. whatever it is, it\'ll show itself.')],end:{outcome:'ignored',memory:{text:'ignored the tells about coffe',lane:'people'}}}
 }});

 // PT3 — THE RAID. A wake after PT2. Vicky's party breaks in; wave fight; Vicky doesn't fight; fork Coffe's fate.
 RAWakeTriggers.define([{adventure:'A29C',priority:70,when:L=>L.done('A29')&&(L.done('A29B')?L.day>(RALife.adventureRecord('A29B')?.completedDay||0):(Number(L.flag('coffeTells'))||0)>=2&&L.day>=31)}]);
 // PT2's FORK reaches the player as a WHAT WE ON line (the adventure's own words) once two tells have landed; it stays
 // on offer until taken or the raid comes.
 RATemptations.define([{id:'coffe_tells',source:'vampgpt',line:'something is off about coffe.',adventure:'A29B',priority:6,repeatable:false}]);
 RAClock.onWake('a29b-fork',62,()=>RATemptations.ensure('coffe_tells'));
 D({id:'A29C',title:"THE RAID",lane:'combat',scope:'MUST',memoryType:'people',start:'hungover',
  nodes:{
  hungover:{env:'throne',actors:{left:'rich',right:'bard'},title:'THE THRONE ROOM · MORNING',
   lines:[N('you are hungover in the throne room. the door does not knock. it just opens.'),
    E('bard','a bard walks in first, already strumming something threatening.')],next:'breakin'},
  breakin:{lines:[N("vicky's party. armored, loud, uninvited."),S('bard','THIS IS THE PART WHERE YOU FIGHT US.'),
    R("i haven't even had blood yet."),N('nobody cares.')],
   fight:{enemy:'bard',params:{env:'throne_party_mess',intro:"THE BARD. TERRIBLE COVER OF PLAYMAKERS."},win:'cleric',lose:'cleric',spared:'cleric'}},
  cleric:{actors:{left:'rich',right:'cleric'},lines:[E('cleric','the cleric steps over the bard, already praying for backup.')],
   fight:{enemy:'cleric',params:{env:'throne_party_mess',intro:'THE CLERIC. PRAYING FOR SOMEONE.'},win:'paladin',lose:'paladin',spared:'paladin'}},
  paladin:{actors:{left:'rich',right:'paladin'},lines:[E('paladin','the paladin raises a sword like the ceiling owes him something.')],
   fight:{enemy:'paladin',params:{env:'throne_party_mess',intro:'THE PALADIN. HOLY SWING.'},win:'coffefight',lose:'coffefight',spared:'coffefight'}},
  coffefight:{actors:{left:'rich',right:{id:'coffe',state:'rogue'}},lines:[E('coffe','coffe steps in last. dagger out. still holding a fourth iced coffee, somehow.'),
    S('coffe','sorry, bro. contract\'s a contract. also this coffee is SO good.'),R('bro.')],
   fight:{enemy:'coffe',params:{env:'throne_party_mess',intro:'COFFE (ROGUE). BACKSTAB INCOMING.'},win:'vicky',lose:'vicky',spared:'vicky'}},
  vicky:{env:'throne_party_mess',actors:{left:'rich',right:'vicky'},
   lines:[E('vicky','vicky walks in over all four of them. she does not draw a weapon.'),
    S('vicky','you\'re not ready for the ladder yet.'),S('vicky','not yet.'),N('she leaves. she takes the bard, the cleric, and the paladin with her.'),
    N('she does not take coffe.'),N('he stands in your throne room, alone, holding an empty cup.')],next:'fork'},
  fork:{lines:[S('coffe','so… we good?')],
   choices:[{label:'ROAST HIM OUT THE DOOR',fx:A=>{RALife.setFlag('coffeFate','exiled');RARelations.memory('coffe','exiled after the raid');},next:'roast'},
    {label:'FORGIVE HIM',fx:A=>{RALife.setFlag('coffeFate','forgiven');RARelations.memory('coffe','forgiven, but rich knows');},next:'forgive'},
    {label:'SEND HIM BACK AS YOUR SPY',octopus:true,fx:A=>{RALife.setFlag('coffeFate','doubleAgent');RARelations.memory('coffe','turned into a double agent');},next:'spy'}]},
  roast:{lines:[R("get out. take the empty cup with you."),N('he posts sad content for weeks. bad lighting. captions nobody asked for.'),
    enterFx=>{}],end:{outcome:'roasted',memory:{text:'exiled coffe after the raid',lane:'people'},home:['rich','that was necessary.',{vp:true}]}},
  forgive:{lines:[R("stay. but i see you now."),S('coffe','word. word. i needed that, honestly.')],
   end:{outcome:'forgiven',memory:{text:'forgave coffe after the raid — but knows now',lane:'people'},home:['rich','back on the block. different vibe though.',{vp:true}]}},
  spy:{lines:[R("you're still my homie. you're just also my guy on the inside now."),S('coffe','double agent coffe. i can work with that.')],
   end:{outcome:'spy',memory:{text:'sent coffe back as a spy inside vicky\'s party',lane:'people'},home:['rich','let\'s see what he brings back.',{vp:true}]}}
 }});

 // ===================================================================================================
 // A32 — BLUEBERRY MAZDA'S NIGHT
 // ===================================================================================================
 RAWakeTriggers.define([{adventure:'A32',priority:40,when:L=>L.dragon?.stage==='majestic'&&(L.dragon.streak||0)>=5}]);
 D({id:'A32',title:"BLUEBERRY MAZDA'S NIGHT",lane:'dragons',scope:'MUST',memoryType:'dragons',start:'bed',
  nodes:{
  bed:{env:'bedroom',actors:{left:'rich',right:{id:'mazda_human',state:'eating'}},title:'THE BEDROOM · MORNING',
   lines:[N('a thick blue woman with horns and a tail is sitting on your bed, finishing the last of the agege bread.'),
    N('there is no dragon anywhere in the room.'),R('…mazda?'),S('mazda_human','who else eats your bread like this?')],next:'discover'},
  discover:{env:'grave',actors:{left:'rich',right:'mazda_human'},title:'THE GRAVE',
   lines:[N('you take her to the grave to figure this out like normal people. she orders boba immediately.'),
    S('mazda_human','i\'ve been able to do this for a while. i just liked being a dragon more.')],next:'night'},
  // "she changes back mid-air with Rich on her back over LA" (VOL 5 A32): ART SHIP 014 B-riding-composite (Rich riding
  // majestic Mazda), drawn as world art in the sky at native 1:1 — a 96×80 composite, not a standing actor.
  night:{env:'la_sky',actors:null,props:()=>[{src:window.RAArtRegistry?.dragon?.riding_composite?.asset,x:135,y:250}],title:'OVER LOS ANGELES',
   lines:[N('at night she flies. mid-air, she changes back — you\'re still on her back, over the whole city.'),
    R("this is either the best or worst decision i've made this year."),S('mazda_human','it\'s both. that\'s the fun part.')],
   enter:A=>{RARelations.meet('mazda_human','la_sky');RALife.setFlag('mazdaHuman',true);RALife.patchDragon({form:'both'});RALife.remember({text:'mazda changes into a human — flew over LA with her',lane:'dragons'});},
   next:'land'},
  land:{lines:[N('she lands on the roof. she is a dragon again before her feet touch down.')],
   end:{outcome:'discovered',memory:{text:"mazda's human form — a night over LA",lane:'dragons'},receipt:{caption:'blueberry mazda, mid-air, mid-transformation.'},
    home:['rich','my dragon is also a whole person. cool. cool cool cool.',{vp:true}]}}
 }});

 // ===================================================================================================
 // A33 — THE DUCHESS'S SOIRÉE
 // ===================================================================================================
 RAWakeTriggers.define([{adventure:'A33',priority:35,when:L=>L.rep>=2&&!L.done('A33')}]);
 D({id:'A33',title:"THE DUCHESS'S SOIRÉE",lane:'people',scope:'MUST',memoryType:'people',start:'invite',presentationVariants:[{answer:'nothing'}],
  nodes:{
  invite:{env:'street_night',actors:{left:'rich'},title:'VAMPGRAM',
   lines:[N('an invite on VampGram: gold text, no handle. "THE DUCHESS REQUESTS YOUR PRESENCE."')],next:'arrive'},
  // J-Circle's entrance stays unstaged: the frozen reception crowd layer (ART SHIP 009) is keyed to this exact screen
  // (duchess_castle|left:rich) and its foreground couple stands where a second actor would. Art/HQ item, not a code gap.
  arrive:{env:'duchess_castle',actors:{left:'rich'},title:'THE DUCHESS\'S SOIRÉE',
   lines:[N('staged status. a receiving line. the room is very good at pretending not to be watching the door.'),
    E('j_circle','j-circle arrives. the room stops. actually stops.'),N('nobody moves until he does.')],next:'duchess'},
  duchess:{env:'duchess_castle',actors:{left:'rich',right:'duchess'},
   lines:[E('duchess','the duchess crosses the room directly to you.'),S('duchess','child.'),
    N('through a window behind her: dragoon, watching the party from the garden, saying nothing.'),
    S('duchess','tell me about your music. what have you actually done?')],next:'ask'},
  ask:{choices:A=>{const cooked=RAState.get().life.creativeLife.music.cooked.length>0;
    const shows=RALife.done('SHOW')||RALife.done('A14');const drops=RAState.get().life.creativeLife.music.dropped?.length>0;
    const opts=[];
    if(cooked)opts.push({label:'TELL HER ABOUT THE SONG YOU COOKED',fx:X=>X.set('answer','cooked'),next:'react'});
    if(shows)opts.push({label:'TELL HER ABOUT THE SHOW YOU PLAYED',fx:X=>X.set('answer','show'),next:'react'});
    if(drops)opts.push({label:'TELL HER WHAT YOU DROPPED',fx:X=>X.set('answer','drop'),next:'react'});
    if(!opts.length)opts.push({label:'BE HONEST — NOTHING YET',fx:X=>X.set('answer','nothing'),next:'react'});
    opts.push({label:'DEFLECT WITH CHARM',octopus:true,fx:X=>X.set('answer','charm'),next:'react'});
    return opts;}},
  react:{actors:A=>({left:'rich',right:{id:'duchess',state:A.vars.answer==='nothing'?'unimpressed':'impressed'}}),lines:A=>{const a=A.vars.answer;const lines={cooked:"i cooked something real, about a real night.",show:'i played a show. people showed up.',drop:'i actually dropped something.',nothing:"…nothing yet. honestly.",charm:"does it matter what i've done, or that i\'m interesting?"};
    return [R(lines[a]),S('duchess',a==='nothing'?'honesty. how refreshingly poor of you.':a==='charm'?'…she likes that answer the most.':'good. do more of that.'),
     S('duchess','RICHBOIMPORTS should know your name. i\'ll see to it.')];},
   enter:A=>{RARelations.meet('duchess','duchess_castle');RALife.setFlag('duchessTease',true);RALife.addPoints('rep',30);RALife.addPoints('clout',10);},next:'done'},
  done:{end:{outcome:'attended',memory:{text:"the duchess's soirée — she called him child",lane:'people'},receipt:{caption:'the duchess, mid-question, through candlelight.'},
   home:['rich','she called me child. i think that\'s a compliment where she\'s from.',{vp:true}]}}
 }});

 // ===================================================================================================
 // A36 — TANDEM WITH TOKYO TONY (Grave garage)
 // ===================================================================================================
 D({id:'A36',title:'TANDEM WITH TOKYO TONY',lane:'cars',scope:'MUST',memoryType:'cars',start:'meet',
  available:L=>L.done('A13')&&L.hasCar,
  nodes:{
  meet:{env:'grave_closed',actors:{left:'rich',right:'tokyo_tony'},title:'THE GRAVE GARAGE · AFTER HOURS',
   lines:[S('tokyo_tony','the garage is empty this late. tight walls, low ceiling. you lead first, i chase.')],next:'lead'},
  lead:{minigame:{id:'touge',params:A=>({course:'grave_garage',car:RACars.toTouge(RALife.ownedCars()[0]||{}),tandem:{rival:'TOKYO TONY',role:'lead',threshold:15000},rain:false}),
   next:(A,r)=>{A.set('leadWin',r.outcome==='win');return 'chase';}}},
  chase:{lines:[S('tokyo_tony',A=>A.vars.leadWin?'not bad. my turn — you chase now.':'you\'re dropping the gap. watch me lead.')],
   minigame:{id:'touge',params:A=>({course:'grave_garage',car:RACars.toTouge(RALife.ownedCars()[0]||{}),tandem:{rival:'TOKYO TONY',role:'chase',threshold:15000},rain:false}),
    next:(A,r)=>{A.set('chaseWin',r.outcome==='win');return 'result';}}},
  result:{lines:A=>{const won=A.vars.leadWin&&A.vars.chaseWin;return [S('tokyo_tony',won?'…yeah. you can run r34 lines now.':'close. not there yet.')];},
   choices:A=>(A.vars.leadWin&&A.vars.chaseWin)?[{label:'CONTINUE',next:'pinky'}]:[{label:'CONTINUE',next:'done'}]},
  pinky:{env:'grave_closed',actors:{left:'rich',right:{id:'pinky',state:'impressed'}},
   lines:A=>{const close=RARelations.level('pinky')>=3;return [N('pinky was watching from the top of the ramp.'),
    S('pinky',close?"you drive it better than me. take the s2000. i\'ll get another one.":'clean run. i saw the whole thing.')];},
   choices:A=>RARelations.level('pinky')>=3?[{icon:window.RAArtRegistry?.vehicles?.listing?.s2000?.asset||null,label:'TAKE THE S2000',fx:X=>{if(RACars.buy('s2000'))X.set('gotCar',true);},next:'done'}]:[{label:'CONTINUE',next:'done'}]},
  done:{end:{outcome:A=>(A.vars.leadWin&&A.vars.chaseWin)?'win':'lose',
   fx:A=>{if(A.vars.leadWin&&A.vars.chaseWin)RALife.setFlag('r34Lead',true);},
   memory:A=>({text:(A.vars.leadWin&&A.vars.chaseWin)?'ran a tandem with tokyo tony in the grave garage — and won':'lost the tandem with tokyo tony',lane:'cars'}),
   home:A=>(A.vars.leadWin&&A.vars.chaseWin)?['rich','r34 lines. locked in.',{vp:true}]:null}}
 }});

 // ===================================================================================================
 // A37 — ATL HOMECOMING
 // ===================================================================================================
 D({id:'A37',title:'ATL HOMECOMING',lane:'people',scope:'MUST',memoryType:'people',start:'route',
  available:L=>L.info.friday&&L.day>15,
  nodes:{
  route:{env:'street_night',actors:{left:'rich'},title:'ATLANTA',lines:[N('it\'s a friday. atlanta is calling.')],
   route:{dest:'atl',next:'arrive'}},
  arrive:{env:'suya_spot',actors:{left:'rich',right:'bunmi'},title:'THE SUYA SPOT · ATL',
   lines:[N('smoke, pepper, the radio turned up too loud for the size of the stand.'),
    E('bunmi','a woman at the counter turns around before you order.'),S('bunmi','…rich? RICH ALUCARD?'),
    R("do i know you?"),S('bunmi','you used to walk to school with a backpack held together by duct tape.')],
   enter:A=>{RARelations.meet('bunmi','suya_spot');},next:'bunmi'},
  bunmi:{lines:[S('bunmi','i knew you before all this. the castle. the vampire thing. all of it.'),
    N('you get suya. she pays for hers before you can.')],next:'party'},
  party:{env:'atl_house_party',actors:{left:'rich',right:'bunmi'},title:'SOUTHWEST ATL · HOUSE PARTY',
   lines:[N("bunmi's cousin is throwing a house party. the whole block is out front.")],
   choices:A=>RAParties.choices({fallback:{reaction:'the party doesn\'t know who you are and doesn\'t care.',score:1}},'curb')},
  curb:{env:'curb',actors:{left:'rich',right:'bunmi'},title:'POWDER SPRINGS, GA',
   lines:[N('later, on the curb outside the old neighborhood. quiet street. porch lights.'),
    S('bunmi','you good, rich? for real?'),R("i think so. some nights more than others.")],
   enter:A=>{RAParties.attended('human');},next:'done'},
  done:{end:{outcome:'visited',memory:{text:'ATL homecoming — bunmi, suya, the old block',lane:'people'},
   receipt:{caption:'the curb in powder springs. same as it always was.'},
   home:['rich','home is a weird word for a place with a castle in it now.',{vp:true}]}}
 }});

 // ===================================================================================================
 // A38 — BRENDA FROM ACCOUNTING
 // ===================================================================================================
 (function(){const prev=window.RAGraveEncounters;window.RAGraveEncounters=L=>[...(prev?prev(L):[]),
  ...(!L.done('A38')?[{label:'THE FOOD COURT (SOMEONE IS STARING)',fx:X=>X.set('chain','A38'),next:'out'}]:[])];})();
 D({id:'A38',title:'BRENDA FROM ACCOUNTING',lane:'people',scope:'MUST',memoryType:'people',start:'arrive',
  nodes:{
  arrive:{env:'food_court',actors:{left:'rich',right:'brenda'},title:'THE FOOD COURT · LUNCH',
   lines:[N('a zombie on her lunch break, spreadsheet open on her phone, eating alone.'),
    E('brenda','she looks up.'),S('brenda','you\'re the castle guy. i do the numbers on half the businesses in this mall. i know your numbers too.'),
    R('…that\'s either impressive or deeply concerning.'),S('brenda','both.')],
   enter:A=>{RARelations.meet('brenda','food_court');},next:'gossip'},
  gossip:{actors:{left:'rich',right:{id:'brenda',state:'gossiping'}},lines:[S('brenda','you want real gossip? the CEO — Zombie Prince — his numbers are worse than yours. way worse.'),
    R('the CEO of what?'),S('brenda','everything. he owns everything and somehow still can\'t make payroll.'),
    N('she goes back to her spreadsheet. she does not stop talking while she eats.')],next:'done'},
  done:{end:{outcome:'met',memory:{text:'met brenda from accounting — gossip about the CEO Zombie Prince',lane:'people'},
   home:['rich','she knows my numbers better than my accountant does. concerning.',{vp:true}]}}
 }});

 // ===================================================================================================
 // A39 — HIRING MARISOL
 // ===================================================================================================
 // ENGINEERING 06: the owned MAID QUARTERS answered "not tonight." forever once A39 had run (and KEEP INTERVIEWING
 // lost Marisol for good). VOL 1 §9.1: "Marisol lives in; hungover mornings get handled; she judges everything."
 // Interviews repeat until she is hired; then the room opens her repeatable scene (flavor only — no new mechanic).
 RAPlaces.define([{id:'castle:maid',hidden:true,adventure:L=>L.flag('marisolHired')?'MAID':'A39'}]);
 D({id:'MAID',title:'THE MAID QUARTERS',lane:'home',repeatable:true,memoryType:'home',available:L=>!!L.flag('marisolHired'),start:'look',nodes:{
  look:{env:'throne',actors:{mid:'rich',right:{id:'marisol',state:'disapproving'}},title:'THE MAID QUARTERS',
   lines:A=>RALife.life().clock.hungover?[N('you are hungover. marisol already handled it: water on the armrest, the curtains shut, the throne pillow fluffed.'),S('marisol','drink that. then fix your face.')]:[N('marisol is judging the throne room. then she judges you.'),S('marisol','this castle was a disaster before me.')],
   end:{outcome:'looked',memory:{text:'marisol, judging everything',lane:'home',quality:.3}}}}});
 D({id:'A39',title:'HIRING MARISOL',lane:'home',scope:'MUST',memoryType:'home',start:'ghost',repeatable:true,
  available:L=>L.hasRoom('maid_quarters')&&!L.flag('marisolHired'),
  nodes:{
  ghost:{env:'throne',actors:{mid:'rich'},title:'THE THRONE ROOM · INTERVIEWS',
   lines:[N('applicant one: a ghost. she picks up the mop. the mop passes through her hands.'),
    S(null,'"…i used to be so good at this."'),R('it\'s ok. thank you for coming.')],next:'bones'},
  bones:{lines:A=>RALife.flag('bonesworthResident')?[N('applicant two: sir bonesworth, in an apron over his armor.'),S('bonesworth','I SHALL CLEAN AS I ONCE CONQUERED.'),N('he breaks a vase immediately.')]:[N('no second applicant today. the list is short.')],next:'marisol'},
  marisol:{env:'throne',actors:{mid:'rich',right:{id:'marisol',state:'disapproving'}},
   lines:[E('marisol','the third applicant walks in and starts reorganizing the throne room before she even sits down.'),
    S('marisol','this room is a disaster. the throne should face the door, not the window. who arranged this?'),
    R("…nobody, technically."),S('marisol','that explains everything.')],
   enter:A=>{RARelations.meet('marisol','throne');},next:'hire'},
  hire:{choices:[{label:'HIRE MARISOL',fx:A=>{RALife.addRoom;RALife.remember({text:'hired marisol as the maid',lane:'home'});RALife.setFlag('marisolHired',true);},next:'done'},
   {label:'KEEP INTERVIEWING',next:'done'}]},
  done:{end:{outcome:A=>RALife.flag('marisolHired')?'hired':'undecided',memory:A=>({text:RALife.flag('marisolHired')?'hired marisol — the throne room is already better':'interviewed maids. still deciding',lane:'home'}),
   home:A=>RALife.flag('marisolHired')?['rich','the castle has never looked this good.',{vp:true}]:null}}
 }});

 // ===================================================================================================
 // MEET ADVENTURES — the remaining women, so all 22 exist in play.
 // ===================================================================================================
 // ENGINEERING 06 route: A_CAMMILE1 had no player entry. Its own words place it back at the docks, where A04 met her.
 RAPlaces.define([{id:'docks',label:'THE DOCKS',sub:'CAMMILE',adventure:L=>RAAdventures.available('A_CAMMILE1')?'A_CAMMILE1':null,order:55}]);
 D({id:'A_CAMMILE1',title:'CAMMILE, AGAIN',lane:'people',repeatable:false,memoryType:'people',start:'shop',
  available:L=>RARelations.met('jdm_importer_daughter_001')&&!L.done('A_CAMMILE1'),
  nodes:{
  shop:{env:'docks',actors:{left:'rich',right:'jdm_importer_daughter_001'},title:'THE DOCKS',
   lines:[S('jdm_importer_daughter_001','you came back. most people don\'t come back to the docks.'),
    R("i liked the parts talk."),S('jdm_importer_daughter_001','then let\'s talk parts.')],next:'done'},
  done:{end:{outcome:'visited',memory:{text:'back at the docks with cammile',lane:'people'},home:['rich','she knows more about my car than i do.',{vp:true}]}}
 }});
 D({id:'A_EMBERLY1',title:'THE BACK ROOM AT KUSH & CRYPT',lane:'people',scope:'MEET',memoryType:'people',start:'arrive',
  nodes:{
  arrive:{env:'kush_back',actors:{left:'rich',right:'emberly'},title:'KUSH & CRYPT · BACK ROOM',
   lines:[N('past the counter, through a curtain that smells like dragon keef, a woman is warming her hands over nothing.'),
    E('emberly','the seat next to her is already warm before you sit.'),S('emberly','you\'re the first one tonight who didn\'t flinch.')],
   enter:A=>{RARelations.meet('emberly','kush_back');},next:'done'},
  done:{end:{outcome:'met',memory:{text:'met emberly in the back room at kush & crypt',lane:'people'},home:['rich','that seat is gonna smell like her for a week.',{vp:true}]}}
 }});
 D({id:'A_JADE1',title:'DRAGON NIGHT',lane:'people',scope:'MEET',memoryType:'people',start:'arrive',
  nodes:{
  arrive:{env:'party_hall_packed',actors:{left:'rich',right:'jade'},title:'DRAGON NIGHT',
   lines:[N('the theme is dragons. half the room is in costume. one woman is not — because she doesn\'t need to be.'),
    E('jade','she keeps the receipt from her drink in her hand like it matters.'),S('jade','jade wyrmwood. i keep everything. you\'ll learn that.')],
   enter:A=>{RARelations.meet('jade','party_hall_packed');},next:'done'},
  done:{end:{outcome:'met',memory:{text:'met jade wyrmwood at dragon night',lane:'people'},home:['rich','she kept my cup. i don\'t know why that\'s unsettling.',{vp:true}]}}
 }});
 D({id:'A_LO1',title:'A PARTY, A ARM',lane:'people',scope:'MEET',memoryType:'people',start:'arrive',
  nodes:{
  arrive:{env:'rave_interior',actors:{left:'rich',right:{id:'lo',state:'arm_fall'}},title:'A PARTY',
   lines:[N('a woman\'s arm falls off on the dance floor. she picks it up without stopping the song.'),
    E('lo','she apologizes to you specifically, mid-song.'),S('lo','sorry. it does that. i\'m lo.')],
   enter:A=>{RARelations.meet('lo','rave_interior');},next:'done'},
  done:{end:{outcome:'met',memory:{text:'met lo at a party — her arm fell off',lane:'people'},home:['rich','she kept dancing with one arm. respect.',{vp:true}]}}
 }});
 D({id:'A_HINA1',title:'TIMED',lane:'people',scope:'MEET',memoryType:'people',start:'arrive',
  nodes:{
  arrive:{env:'little_tokyo',actors:{left:'rich',right:{id:'hina',state:'smug'}},title:'SLURP · LITTLE TOKYO',
   lines:[N('a woman behind the counter is timing something on her phone. it\'s you. she\'s timing you eat.'),
    E('hina','she flips the phone around.'),S('hina','forty-one seconds. that\'s slow. i\'m hina.')],
   enter:A=>{RARelations.meet('hina','little_tokyo');},next:'done'},
  done:{end:{outcome:'met',memory:{text:'met hina at slurp — she timed him eating',lane:'people'},home:['rich','i lost a race i didn\'t know i was in.',{vp:true}]}}
 }});
 D({id:'A_ANFEESA1',title:'ONE RECORD',lane:'people',scope:'MEET',memoryType:'people',start:'arrive',
  available:L=>L.flag('ogunsRaveCompleted')||L.done('A55'),
  nodes:{
  arrive:{env:'rave_interior',actors:{left:'rich',right:{id:'anfeesa',state:'dj'}},title:'BOOTH SIDE',
   lines:[N('the DJ waves you up to the booth between sets.'),E('anfeesa','she doesn\'t say much. she just plays one record, low, just for you.'),S('anfeesa','that one\'s not for the crowd. i\'m anfeesa.')],
   enter:A=>{RARelations.meet('anfeesa','rave_interior');},next:'done'},
  done:{end:{outcome:'met',memory:{text:'met dj anfeesa — one record just for him',lane:'people'},home:['rich','i still don\'t know what song that was.',{vp:true}]}}
 }});

 // VELVET VANTABLACK — DM unlocks ONLYVAMPS.
 D({id:'A_VELVET1',title:'THE DM',lane:'people',scope:'MEET',memoryType:'people',start:'dm',
  nodes:{
  dm:{env:'grave',actors:{left:'rich'},title:'A DM',
   lines:[N('a DM from a locked account: velvet vantablack. she checks her ring light before she checks on you — even here, in text.'),
    S('velvet','you look like someone who\'d pay for the good content. i just launched something. it\'s called ONLYVAMPS.')],
   enter:A=>{RARelations.meet('velvet','grave');RALife.unlockApp('onlyvamps');},next:'done'},
  done:{end:{outcome:'met',memory:{text:'velvet vantablack DMed him — ONLYVAMPS is on his phone now',lane:'people'},home:['rich','i have an app now that i am definitely not telling my mother about.',{vp:true}]}}
 }});
 // ONLYVAMPS — creator tiles, $4,999/mo subscriptions, monthly renewal at wake day-of-month 1, its own
 // tiny cancel scene, locked (non-graphic) tiles, and a collision when a known woman has a page.
 (function(){
  const PRICE=4999;
  // Stable anonymous ids keep subscriptions deterministic; Velvet is the sole person-linked collision.
  const CREATORS=()=>[
   {id:'anonymous_01',label:'ANONYMOUS CREATOR'},
   {id:'anonymous_02',label:'ANONYMOUS CREATOR'},
   {id:'velvet',person:'velvet',locked:true},
   {id:'anonymous_03',label:'ANONYMOUS CREATOR'}];
  function subbed(id){return (RALife.flag('onlyvamps_subs')||[]).includes(id);}
  function subscribe(id){const subs=new Set(RALife.flag('onlyvamps_subs')||[]);if(subs.has(id))return false;if(!RALife.spend(PRICE))return false;
   subs.add(id);RALife.setFlag('onlyvamps_subs',[...subs]);RALife.setFlag('onlyvamps_renew',{...(RALife.flag('onlyvamps_renew')||{}),[id]:RALife.today().day});
   RALife.remember({text:`subscribed to a page on ONLYVAMPS`,lane:'people',quality:.3});return true;}
  function cancel(id){const subs=new Set(RALife.flag('onlyvamps_subs')||[]);if(!subs.has(id))return false;subs.delete(id);RALife.setFlag('onlyvamps_subs',[...subs]);return true;}
  RAClock.onWake('onlyvamps-renew',45,({info})=>{if(info.dayOfMonth!==1)return;
   for(const id of RALife.flag('onlyvamps_subs')||[]){if(RALife.money()>=PRICE)RALife.spend(PRICE);else{cancel(id);RALife.mail({id:`ov-cancel:${id}:${info.day}`,kind:'app',title:'ONLYVAMPS',body:'a subscription lapsed. not enough funds.',app:'onlyvamps'});}}});
  window.RAOnlyVamps={PRICE,creators:CREATORS,subbed,subscribe,cancel,
   markup(){const tiles=CREATORS().map(c=>{const p=c.person?RABtfPeople.get(c.person):null;const collision=!!c.person&&RARelations.met(c.person)&&c.locked;
    return `<div class="phone-card"><b>${(p?.name||c.label||'CREATOR').toUpperCase()}</b>${collision?'you know her. this is weird now.':'creator on ONLYVAMPS.'}<br>${RALife.fmt(PRICE)}/MONTH<button type="button" class="phone-button" data-phone-action="do:onlyvamps:${subbed(c.id)?'cancel':'sub'}:${c.id}">${subbed(c.id)?'CANCEL':'SUBSCRIBE'}</button></div>`;}).join('');
    return `<h1>ONLYVAMPS</h1><p class="phone-small">non-graphic. tiles only. you know how this goes.</p>${tiles}`;},
   action(a,arg,api){if(a==='sub')subscribe(arg);else if(a==='cancel')cancel(arg);api?.refresh?.();return true;}};
  // E1 (BREAK I): this is the canon ONLYVAMPS app (phone.js CANON row + apps_core's canon placeholder). Registering it
  // with `canon:true` keeps the real renderer in the canon row and OUT of the `extras` grid — without it the phone home
  // rendered a second, duplicate ONLYVAMPS launcher once the app was unlocked.
  window.RAPhoneApps?.register?.({id:'onlyvamps',label:'ONLYVAMPS',canon:true,order:20,render:()=>window.RAOnlyVamps.markup(),onAction:(a,arg,api)=>window.RAOnlyVamps.action(a,arg,api)});
 })();

 // ===================================================================================================
 // VOL 5 — A41 THE PERFECT NIGHT
 // ===================================================================================================
 RATemptations.define([{id:'trippin_red',source:'friend',sender:'TRISTAN',thread:'tristan',
  line:"trippin red at the hollow bowl saturday. i got 2 extra.",minDay:12,adventure:'A41',priority:5}]);
 const trippinOnStage=()=>({src:RABtfPeople.get('trippin_red')?.states?.stage_ready,x:135,y:292});
 D({id:'A41',title:'THE PERFECT NIGHT',lane:'people',scope:'MUST',memoryType:'people',start:'pick',presentationVariants:RABtfPeople.women.map(p=>({person:p.id,nodes:['drive','roof','stay']})),
  available:L=>RABtfPeople.women.some(w=>RARelations.level(w.id)>=2),
  nodes:{
  pick:{env:'street_night',actors:{left:'rich'},title:'A PLUS-ONE',
   lines:[N('tristan hit you with two extra tickets. trippin\' red. the hollow bowl. saturday.'),R('who am i bringing?')],
   choices:A=>{const ids=RABtfPeople.women.map(w=>w.id).filter(id=>RARelations.level(id)>=2);
    return ids.map(id=>({label:(RABtfPeople.get(id)?.name||id).toUpperCase(),fx:X=>{X.set('person',id);RALife.setFlag('futureEx',id);},next:'route'}));}},
  route:{route:{dest:'hollow_bowl',next:'arrive'}},
  arrive:{env:'hollow_bowl',actors:A=>({left:'rich',right:A.vars.person}),props:()=>[trippinOnStage()],title:'THE HOLLOW BOWL',
   lines:A=>[N('the amphitheater is packed. every seat, every aisle. the bass starts before the lights even change.'),
    E('trippin_red','trippin\' red walks out to a wall of sound.')],next:'mosh'},
  mosh:{props:()=>[trippinOnStage()],lines:[N('the crowd surges. you both get pulled into it, laughing, shoved, alive.')],
   minigame:{id:'bars',params:A=>({mode:'mosh',env:'hollow_bowl'}),next:(A,r)=>'slow'}},
  slow:{props:()=>[trippinOnStage()],lines:[N('the set slows down. a quiet song. everyone in the bowl sways the same direction.')],next:'finale'},
  finale:{props:()=>[trippinOnStage()],lines:[N('the finale hits like weather. lights, noise, everyone screaming the hook back at the stage.')],next:'drive'},
  drive:{env:'street_night',actors:A=>({left:'rich',right:A.vars.person}),title:'THE DRIVE HOME',
   lines:[N('windows down, montana playing loud enough to feel it in the seats.'),
    S(null,'"that was… actually the best night i\'ve had in a while."')],next:'roof'},
  // "the crew is already up here" (VOL 5 A41: Tunde, Dre, Tristan): Tunde, seated at the hookah, between Rich and her —
  // the most people the roof frames at phone size with every possible plus-one.
  roof:{env:'roof',actors:A=>({left:'rich',mid:{id:'tunde',state:'hookah_seated'},right:A.vars.person}),title:'THE HOOKAH ROOF',
   lines:[N('the crew is already up here. hookah, low talk, the poster from tonight taped to the wall.')],
   choices:[{label:'HOOKAH WITH THE CREW',next:'roofgame'},{label:'SKIP TO THE END OF THE NIGHT',next:'crewleaves'}]},
  // HQ-AS8-01: the crew is on the roof, so the HOMIES company (its line set matches the beat).
  roofgame:{minigame:{id:'hookah',params:A=>({company:'HOMIES'}),next:(A,r)=>'crewleaves'}},
  crewleaves:{lines:[N('one by one, the crew heads out. it gets quiet.')],next:'stay'},
  stay:{env:'bedroom',actors:A=>({left:'rich',right:A.vars.person}),
   lines:[N('she stays.'),N('non-graphic fade.')],
   enter:A=>{RALife.setFlag('stayedOver',{person:A.vars.person,day:RALife.today().day});RALife.addProp('prop_trippin_poster');},
   end:{outcome:'perfect',memory:{text:'the perfect night — trippin\' red at the hollow bowl',lane:'people'},
    receipt:{caption:'the trippin\' red poster, taped up crooked.'},nightEnder:true,
    home:['rich','best morning i\'ve had in a long time.',{vp:true}]}}
 }});
 // 10-20 sleeps later: a quiet callback wake moment.
 RAWakeTriggers.define([{adventure:'A41B',priority:10,when:L=>{const rec=RALife.adventureRecord('A41');if(!rec)return false;const gap=L.day-rec.completedDay;return gap>=10&&gap<=20;}}]);
 D({id:'A41B',title:'A TRIPPIN\' RED SONG',lane:'people',repeatable:false,memoryType:'people',start:'hear',
  nodes:{
  hear:{env:'bedroom',actors:{left:'rich'},title:'THE RADIO',
   lines:A=>{const p=RALife.flag('futureEx');const still=p&&RARelations.level(p)>=2;
    return [N('a trippin\' red song comes on the radio, unannounced.'),
     R(still?'…yeah. that was a good night.':'…that was a good night. different life, kind of.')];},next:'done'},
  done:{end:{outcome:'heard',memory:A=>({text:'heard a trippin\' red song on the radio — thought about that night',lane:'people',quality:.3})}}
 }});

 // ===================================================================================================
 // A44 — THE WAFFLE SAGA (VOL 5 A44: four ATL nights; the prize is waffle mix).
 // ENGINEERING 06: rebuilt to the source beats — NIGHT 1 lands at HEARTSFELT-JACKSUN and meets Ms. Patrice at WAFFLE
 // HAVEN (she laughs in his face); NIGHT 2 the perfume at the Maul of Georgia (Lil Smack in the food court); NIGHT 3 she
 // wants somewhere nice — Lennox Scare, and a Buckhead vampire who wants the recipe; NIGHT 4 Centennial Park, her
 // mother's recipe, the box on the pillow. Each night is its own trip (a night-ender) through GO SOMEWHERE →
 // HEARTSFELT-JACKSUN ("airport arrival hub for every ATL trip", VOL 5 §6); a sleep separates the nights.
 // Fights keep their prior cards/params. Non-Rich lines are functional drafts restating the source; Rich lines [VP].
 // ===================================================================================================
 const waffleNext=L=>(Number(L.flag('waffleNight'))||0)+1;
 const waffleReady=n=>L=>waffleNext(L)===n&&(n===1||L.day>(Number(L.flag('waffleDay'))||0));
 const waffleStep=n=>A=>{RALife.setFlag('waffleNight',n);RALife.setFlag('waffleDay',RALife.today().day);};
 const flyIn=(title,next)=>({env:'street_night',actors:{left:'rich'},title,route:{dest:'atl',next}});
 D({id:'A44',title:'THE WAFFLE SAGA',lane:'food',scope:'MUST',memoryType:'food',start:'route',available:waffleReady(1),
  nodes:{
  route:flyIn('NIGHT ONE','land'),
  land:{env:'atl_airport',actors:{left:'rich'},title:'HEARTSFELT-JACKSUN · 1 A.M.',
   lines:[N('you land at 1 a.m. the airport is huge, and somehow still packed.'),N('you are hungry.'),N('a group chat of atl vampires: the only thing open is waffle haven.')],next:'haven'},
  haven:{env:'waffle_haven',actors:{left:'rich',right:'ms_patrice'},title:'WAFFLE HAVEN · 1 A.M.',
   enter:A=>{RARelations.meet('ms_patrice','waffle_haven');},
   lines:[E('ms_patrice','the night-shift manager looks up from the register. her name tag says MS. PATRICE.'),N('the waffle changes your life.'),R('…can i get the recipe?')],next:'laugh'},
  laugh:{actors:{left:'rich',right:{id:'ms_patrice',state:'laugh'}},lines:[N('she laughs in your face.'),S('ms_patrice','no.')],
   enter:waffleStep(1),
   end:{outcome:'night1',nightEnder:true,memory:{text:'waffle saga, night one — waffle haven. ms. patrice laughed in my face',lane:'food'},
    home:['rich','she laughed. i\'m going back.',{vp:true}]}}
 }});
 D({id:'A44_N2',title:'THE WAFFLE SAGA · MAUL OF GEORGIA',lane:'food',scope:'MUST',memoryType:'food',start:'route',available:waffleReady(2),
  testSetup:ctx=>{ctx.RALife.setFlag('waffleNight',1);ctx.RALife.setFlag('waffleDay',1);},
  nodes:{
  route:flyIn('NIGHT TWO','ask'),
  ask:{env:'waffle_haven',actors:{left:'rich',right:'ms_patrice'},title:'WAFFLE HAVEN',
   lines:[S('ms_patrice','i\'ll consider it. bring me a perfume.'),N('a very specific one, from a store at the maul of georgia that closed in 2009.'),N('it didn\'t close. it moved to the basement level only vampires can see.')],next:'maul'},
  maul:{env:'maul',actors:{left:'rich'},title:'THE MAUL OF GEORGIA',
   lines:[N('the biggest mall you have ever been in. you crawl it floor by floor.')],next:'smack'},
  smack:{env:'maul',actors:{left:'rich',right:'lil_smack'},
   enter:A=>{RARelations.meet('lil_smack','maul');},
   lines:[E('lil_smack','the food court. lil smack is here, mouth open, between you and the escalator down.'),S('lil_smack','basement? that\'ll cost you.')],
   choices:[{label:'FIGHT HIM FOR IT',next:'fight'},{label:'TALK YOUR WAY PAST HIM',octopus:true,next:'octo'}]},
  // Lil Smack's own enemy card (frozen art); `hp:60` keeps the encounter's authored difficulty (it was a training stub).
  fight:{fight:{enemy:'lil_smack',params:{env:'maul',hp:60,intro:'LIL SMACK. FOOD COURT TABLE. HIGH STAKES.'},win:'won',lose:'won',spared:'won'}},
  octo:{lines:[S('lil_smack','…ok that was smooth. go.')],next:'won'},
  won:{actors:{left:'rich'},lines:[N('the basement level. one store, lit like it\'s still 2009. the perfume is on the shelf.')],enter:waffleStep(2),
   end:{outcome:'night2',nightEnder:true,memory:{text:'waffle saga, night two — the perfume from the maul\'s basement, lil smack in the way',lane:'food'}}}
 }});
 D({id:'A44_N3',title:'THE WAFFLE SAGA · LENNOX SCARE',lane:'food',scope:'MUST',memoryType:'food',start:'route',available:waffleReady(3),
  testSetup:ctx=>{ctx.RALife.setFlag('waffleNight',2);ctx.RALife.setFlag('waffleDay',1);},
  nodes:{
  route:flyIn('NIGHT THREE','haven'),
  haven:{env:'waffle_haven',actors:{left:'rich',right:'ms_patrice'},title:'WAFFLE HAVEN',
   lines:[N('she takes the perfume. she smells it. it isn\'t enough.'),S('ms_patrice','take me somewhere nice.')],next:'date'},
  date:{env:'lennox',actors:{left:'rich',right:{id:'ms_patrice',state:'date'}},title:'LENNOX SCARE · BUCKHEAD',
   lines:[N('she roasts every rich person in the mall. every single one.'),N('you fall for her a little.')],next:'rival'},
  rival:{actors:{left:'rich',mid:{id:'ms_patrice',state:'date'},right:'buckhead'},
   lines:[E('buckhead','a buckhead vampire steps in front of her.'),S('buckhead','the recipe. name your price. my brunch empire needs it.')],
   choices:[{label:'FIGHT HIM',next:'fight'},{label:'OCTOPUS: "SHE AIN\'T FOR SALE"',octopus:true,next:'octo'}]},
  fight:{fight:{enemy:'buckhead',params:{env:'lennox',intro:'THE BUCKHEAD VAMPIRE. BRUNCH EMPIRE.'},win:'won',lose:'won',spared:'won'}},
  octo:{lines:[R('"she ain\'t for sale."'),N('he blinks. steps aside. that landed harder than expected.')],next:'won'},
  won:{actors:{left:'rich',right:{id:'ms_patrice',state:'date'}},lines:[N('the brunch empire walks away with nothing. she takes your arm on the way out.')],
   enter:A=>{waffleStep(3)(A);RARelations.add('ms_patrice',12,{reason:'lennox scare'});},
   end:{outcome:'night3',nightEnder:true,memory:{text:'waffle saga, night three — lennox scare with ms. patrice, the buckhead vampire',lane:'food'}}}
 }});
 D({id:'A44_N4',title:'THE WAFFLE SAGA · CENTENNIAL',lane:'food',scope:'MUST',memoryType:'food',start:'route',available:waffleReady(4),
  testSetup:ctx=>{ctx.RALife.setFlag('waffleNight',3);ctx.RALife.setFlag('waffleDay',1);},
  nodes:{
  route:flyIn('NIGHT FOUR','park'),
  park:{env:'centennial',actors:{left:'rich',right:'ms_patrice'},title:'CENTENNIAL VAMPIRIC PARK · 3 A.M.',
   lines:[N('3 a.m. by the fountain rings.'),E('ms_patrice','she tells you the story of the recipe.'),N('it was her mother\'s. it survived her becoming a zombie.'),S('ms_patrice','don\'t tell nobody.')],
   choices:A=>RARelations.level('ms_patrice')>=3?[{label:'CRACK 🔒',sub:'LOCKED',when:()=>false,hideLocked:false,next:'box'},{label:'STAY WITH HER',next:'stays'}]:[{label:'SIT WITH HER A WHILE',next:'sweet'}]},
  // CRACK stays canon-locked (visible as locked); the beat uses the established fade: "she stays." (CONTENT_AUTHORING).
  stays:{lines:[N('she stays.'),N('non-graphic fade.')],enter:A=>RALife.setFlag('stayedOver',{person:'ms_patrice',day:RALife.today().day}),next:'box'},
  sweet:{lines:[N('the fountain rings go quiet. neither of you says anything for a long time. it\'s sweet.')],next:'box'},
  box:{env:'bedroom',actors:{left:'rich'},lines:[N('wake. an atl hotel. there\'s a box on the pillow.'),N('a bag of homemade waffle mix, and a note in her handwriting: "don\'t tell nobody."')],
   enter:A=>{waffleStep(4)(A);RALife.addProp('prop_waffle_mix');RARelations.memory('ms_patrice','a44_recipe');},
   end:{outcome:'prize',memory:{text:'the waffle saga — ms. patrice\'s recipe, don\'t tell nobody',lane:'food'},
    receipt:{caption:'a bag of waffle mix. a note: "don\'t tell nobody."'},nightEnder:true,
    home:['rich','four nights for a bag of mix. worth every second.',{vp:true}]}}
 }});
 RAPlaces.define([{id:'heartsfelt',label:'HEARTSFELT-JACKSUN',sub:L=>['ATL · A LATE FLIGHT','ATL · WAFFLE HAVEN, AGAIN','ATL · SOMEWHERE NICE','ATL · 3 A.M.'][waffleNext(L)-1]||'ATL',
  adventure:L=>['A44','A44_N2','A44_N3','A44_N4'][waffleNext(L)-1]||null,order:60}]);
 RABtfPeople.byId.lil_smack=RABtfPeople.byId.lil_smack||{id:'lil_smack',name:'LIL SMACK',look:{skin:'#7a5030',top:'#e0c020',hair:'#0c0c10',hairShape:'spiky'}};

 // ===================================================================================================
 // A46 — LITTLE TOKYO SPECIAL NIGHT
 // ===================================================================================================
 // ART SHIP 014: she is staged in her approved frozen `date` state where one exists (a planned night out is a date).
 const a46Her=A=>RABtfPeople.get(A.vars.person)?.states?.date?{id:A.vars.person,state:'date'}:A.vars.person;
 D({id:'A46',title:'LITTLE TOKYO SPECIAL NIGHT',lane:'people',repeatable:true,memoryType:'people',start:'ask',
  presentationVariants:RABtfPeople.women.filter(p=>p.states?.date).map(p=>({person:p.id})),
  available:L=>RABtfPeople.women.some(w=>RARelations.level(w.id)>=3),
  nodes:{
  ask:{env:'street_night',actors:{left:'rich'},title:'"TAKE ME SOMEWHERE SPECIAL"',
   lines:[N('a text: "take me somewhere special."')],
   choices:A=>RABtfPeople.women.map(w=>w.id).filter(id=>RARelations.level(id)>=3).sort((a,b)=>(b===a46Asker(RALife.L()))-(a===a46Asker(RALife.L())))
    .map(id=>({label:(RABtfPeople.get(id)?.name||id).toUpperCase(),fx:X=>X.set('person',id),next:'plan'}))},
  plan:{env:'little_tokyo',actors:A=>({left:'rich',right:a46Her(A)}),title:'LITTLE TOKYO AT NIGHT',
   lines:[N('little tokyo at night. you plan three stops out of five.')],
   choices:[
    {label:'RAMEN COUNTER',fx:X=>X.set('stops',[...(X.vars.stops||[]),'ramen']),next:'stop2'},
    {label:'ARCADE',fx:X=>X.set('stops',[...(X.vars.stops||[]),'arcade']),next:'stop2'},
    {label:'PHOTO BOOTH',fx:X=>X.set('stops',[...(X.vars.stops||[]),'photo']),next:'stop2'},
    {label:'ROOFTOP VIEW',fx:X=>X.set('stops',[...(X.vars.stops||[]),'roof']),next:'stop2'},
    {label:'THE QUIET ALLEY BAR',fx:X=>X.set('stops',[...(X.vars.stops||[]),'bar']),next:'stop2'}]},
  stop2:{lines:[N('second stop.')],choices:A=>['ramen','arcade','photo','roof','bar'].filter(s=>!(A.vars.stops||[]).includes(s))
   .map(s=>({label:s.toUpperCase(),fx:X=>X.set('stops',[...(X.vars.stops||[]),s]),next:'stop3'}))},
  stop3:{lines:[N('third stop.')],choices:A=>['ramen','arcade','photo','roof','bar'].filter(s=>!(A.vars.stops||[]).includes(s))
   .map(s=>({label:s.toUpperCase(),fx:X=>X.set('stops',[...(X.vars.stops||[]),s]),next:'photo'}))},
  photo:{lines:[N('a photo booth strip, unplanned — you both duck in on the way to the last stop.')],next:'bench'},
  bench:{env:'little_tokyo',actors:A=>({left:'rich',right:a46Her(A)}),
   lines:A=>[N('you end up on a bench, the strip of photos between you.'),
    S(A.vars.person,'nobody\'s ever planned a night like this for me. three whole stops.'),
    R("you deserve more than three."),N('she says something real — quiet, not for anyone else.')],next:'done'},
  done:{end:{outcome:'special',memory:A=>({text:`a special night in little tokyo with ${(RABtfPeople.get(A.vars.person)?.name||'her').toLowerCase()}`,lane:'people'}),
   receipt:{caption:'a photo booth strip. little tokyo, at night.'},
   home:['rich','three stops. worth planning again.',{vp:true}]}}
 }});

 // ENGINEERING 05 (HQ routes) through the existing wake-time want system (WHAT WE ON / Morning Mail / DMs):
 // - A37: a one-time opportunity on any eligible Friday after Day 15 (its own availability decides the day).
 // - A46: an eligible woman (CLOSE or better) asks Rich, in her InstaHoe DMs, to take her somewhere special.
 // - A_VELVET1: after Ogun's Rave and VampGram, Velvet reaches out; her DM scene opens ONLYVAMPS.
 // - A23R: once Rich is prepared (A23 done, the Armory known and visited, at least one gun) the rematch is on offer.
 // Lines reuse each adventure's own authored words.
 const a46Asker=L=>RABtfPeople.women.map(p=>p.id).filter(id=>RARelations.level(id)>=3).sort((a,b)=>RARelations.level(b)-RARelations.level(a)||a.localeCompare(b))[0]||null;
 RATemptations.define([
  {id:'a37_friday',source:'invite',sender:'ATLANTA',line:"it's a friday. atlanta is calling.",adventure:'A37',priority:4,life:[1,1],repeatable:false},
  {id:'a46_special',source:'invite',sender:L=>RABtfPeople.get(a46Asker(L))?.name||'SOMEONE',thread:a46Asker,line:'take me somewhere special.',adventure:'A46',weight:1.5,repeatable:true,cooldown:7,when:L=>!!a46Asker(L)},
  {id:'velvet_dm',source:'vampgram',sender:'VELVET VANTABLACK',line:'a DM from a locked account: velvet vantablack.',adventure:'A_VELVET1',priority:3,repeatable:false,when:L=>!!(L.flag('ogunsRaveCompleted')&&L.app('vampgram'))},
  {id:'a23r_rematch',source:'vampgpt',line:'hilt again. same windbreaker.',adventure:'A23R',priority:1,repeatable:false,cooldown:4,when:L=>!!(L.done('A23')&&L.flag('armoryKnown')&&L.done('A24')&&(L.life.ownership.guns||[]).length>0)}
 ]);
 // The one-time routes are guaranteed a slot on the wake they become eligible (after the day's wants are generated).
 // ENGINEERING 06 route: A52 had no player entry. Day 31 is Halloween (VOL 5 §9.2); the invite uses the adventure's title.
 RATemptations.define([{id:'halloween_invite',source:'invite',sender:'VAMPIRE LA',line:'halloween in vampire la.',adventure:'A52',priority:9,life:[0,0],repeatable:false}]);
 RAClock.onWake('e05-routed-wants',61,()=>{for(const id of ['a37_friday','velvet_dm','a23r_rematch','halloween_invite'])RATemptations.ensure(id);});

 // ===================================================================================================
 // A52 — HALLOWEEN IN VAMPIRE LA (Day 31 only)
 // ===================================================================================================
 D({id:'A52',title:'HALLOWEEN IN VAMPIRE LA',lane:'people',scope:'MUST',memoryType:'people',start:'costume',
  available:L=>L.day===31,
  nodes:{
  costume:{env:'street_night',actors:{left:'rich'},title:'HALLOWEEN · VAMPIRE LA',
   lines:[N('vampires don\'t dress as monsters tonight — they dress as human jobs. it\'s the one night everyone commits.')],
   choices:[{label:'DUOQLO REGULAR GUY',fx:A=>A.set('costume','duoqlo'),next:'party'},
    {label:'DOOM-ESQUE MASKED VILLAIN',fx:A=>A.set('costume','doom'),next:'party'},
    {label:'OCTOPUS SENSEI',octopus:true,fx:A=>A.set('costume','sensei'),next:'party'}]},
  party:{env:'castle_exterior_party',actors:{left:'rich'},title:'THE BLOCK PARTY',
   lines:A=>[N(`you go as ${A.vars.costume==='duoqlo'?'a regular guy in duoqlo':A.vars.costume==='doom'?'a doom-esque masked villain':'octopus sensei'}. the block loves it.`)],
   choices:A=>RAParties.choices({fallback:{reaction:'the costumes win the night, not the moves.',score:1}},'trick')},
  trick:{env:'street_night',actors:{left:'rich'},title:'TRICK-OR-TREAT ON THE BLOCK',
   lines:[N('kids in costume run the block, full-size candy bars in every bag. one house — yours — accidentally hands out a few maggi cubes.'),
    S(null,'"mom, they gave me a SEASONING CUBE."'),R('it happens. it\'s a good cube though.')],
   enter:A=>{RAParties.attended('vampire');window.RAVampGram?.post?.({handle:'rich.alucard',text:`halloween in vampire la. ${A.vars.costume} for the night.`,likes:1200});RALife.addFollowers(60);},
   next:'done'},
  done:{end:{outcome:'halloween',memory:A=>({text:`halloween in vampire LA as ${A.vars.costume}`,lane:'people'}),
   home:['rich','best costume night this city has ever had.',{vp:true}]}}
 }});

 // ===================================================================================================
 // A55 — OGUN'S SECOND RAVE with DJ ANFEESA. Plus attendable parties: rooftop_dtla, neighbor_castle.
 // ===================================================================================================
 // ENGINEERING 05 (HQ route): after Ogun's Rave, the first large vampire party FIND A PARTY offers is the one where Lo
 // is met (A_LO1, one time); Ogun's second rave (A55) follows on a later party night.
 RAParties.register(L=>L.flag('ogunsRaveCompleted')&&RAAdventures.available('A_LO1')?'A_LO1':null);
 RAParties.register(L=>L.flag('ogunsRaveCompleted')&&!L.done('A55')?'A55':null);
 D({id:'A55',title:"OGUN'S SECOND RAVE",lane:'people',repeatable:false,memoryType:'people',start:'arrive',
  available:L=>L.flag('ogunsRaveCompleted'),
  nodes:{
  arrive:{env:'rave_interior',actors:{left:'rich',right:{id:'anfeesa',state:'dj'}},title:"OGUN'S SECOND RAVE",
   lines:[N('techno this time. a different crowd — one that has never heard of any rapper, ever, on purpose.'),
    E('anfeesa','dj anfeesa is behind the booth.')],
   enter:A=>{if(!RARelations.met('anfeesa'))RARelations.meet('anfeesa','rave_interior');},next:'dance'},
  dance:{choices:A=>RAParties.choices({fallback:{reaction:'the crowd doesn\'t care who you are. it\'s kind of freeing.',score:1}},'remix')},
  remix:{lines:A=>{const dropped=(RAState.get().life.creativeLife.music.dropped||[]).length>0;const viral=RALife.life().resources.followers>=100;
    if(dropped&&viral)return [N('mid-set, anfeesa drops a techno remix of your song. the crowd doesn\'t know it\'s yours. you do.')];
    return [N('the set rolls on. no remix tonight — maybe next time.')];},
   enter:A=>RAParties.attended('human'),next:'done'},
  // ENGINEERING 05 (HQ route): the DJ waves Rich up to the booth afterwards (A_ANFEESA1, one time).
  done:{end:{outcome:'attended',chain:()=>RAAdventures.available('A_ANFEESA1')?'A_ANFEESA1':null,memory:{text:"ogun's second rave — techno, dj anfeesa",lane:'people'},
   home:['rich','a crowd that didn\'t care who i was. weirdly relaxing.',{vp:true}]}}
 }});
 D({id:'ROOFTOP_DTLA',title:'A ROOFTOP IN DTLA',lane:'people',repeatable:true,memoryType:'people',start:'arrive',
  nodes:{arrive:{env:'rooftop_dtla',actors:{left:'rich'},title:'A ROOFTOP IN DTLA',lines:[N('string lights, a skyline, a party with no host anyone can name.')],
   choices:A=>RAParties.choices({fallback:{reaction:'the view does most of the work tonight.',score:1}},'done')},
  done:{enter:A=>RAParties.attended('human'),end:{outcome:'attended',memory:{text:'a rooftop party in DTLA',lane:'people'}}}}});
 D({id:'NEIGHBOR_CASTLE',title:'THE CASTLE DOWN THE BLOCK',lane:'people',repeatable:true,memoryType:'people',start:'arrive',
  nodes:{arrive:{env:'neighbor_castle',actors:{left:'rich'},title:'THE CASTLE DOWN THE BLOCK',lines:[N('your neighbor throws parties too. smaller castle. louder music.')],
   choices:A=>RAParties.choices({fallback:{reaction:'a neighbor party. low stakes, good time.',score:1}},'done')},
  done:{enter:A=>RAParties.attended('vampire'),end:{outcome:'attended',memory:{text:'a party at the castle down the block',lane:'people'}}}}});
 RAParties.register(L=>RAAdventures.available('ROOFTOP_DTLA')?'ROOFTOP_DTLA':null);
 RAParties.register(L=>RAAdventures.available('NEIGHBOR_CASTLE')?'NEIGHBOR_CASTLE':null);

 // ===================================================================================================
 // TOP-5 WOMEN ARCS (VOL 5 §8): MAZDA, NNEKA, CAMMILE, JUNE, MS. PATRICE — 3 beats each, unlocking at
 // COOL(2)/CLOSE(3)/RIDE-OR-DIE(4), reached via temptation (she texts) when the level is met.
 // ===================================================================================================
 // ENGINEERING 06: the 15 beats now follow VOL 5 §8's table (the previous beats were placeholders that did not match
 // the source). Same mechanism: each beat is a normal night she texts Rich about, unlocking at COOL / CLOSE /
 // RIDE-OR-DIE in order. Non-Rich lines are functional drafts restating the source beat; Rich lines are [VP].
 // Options: from (first beat number, default 1), after (an adventure the first defined beat also needs).
 function arc(person,tag,beats,{from=1,after=null}={}){
  for(let k=0;k<beats.length;k++){
   const n=from+k,b=beats[k],id=`ARC_${tag}_${n}`,needLevel=n+1; // beat1@cool(2) beat2@close(3) beat3@ride(4)
   const prior=L=>k===0?(!after||L.done(after)):L.done(`ARC_${tag}_${n-1}`);
   RATemptations.define([{id:`${id}_tempt`,source:'invite',sender:(RABtfPeople.get(person)?.name||person),thread:person,
    line:b.text,adventure:id,repeatable:false,when:L=>RARelations.level(person)>=needLevel&&L.done(id)===false&&prior(L)}]);
   const scene={env:b.env,actors:b.actors||{left:'rich',right:b.state?{id:person,state:b.state}:person},title:b.title,
    lines:[...b.lines,...(b.rich?[R(b.rich)]:[])],enter:A=>{RARelations.memory(person,b.memory);},next:b.minigame?'run':b.choices?undefined:'done'};
   if(b.choices)scene.choices=b.choices.map(label=>({label,next:'done'}));
   const nodes={scene,done:{...(b.after?{lines:b.after}:{}),end:{outcome:'done',memory:{text:b.memory,lane:'people'},home:b.home?['rich',b.home,{vp:true}]:null}}};
   if(b.minigame)nodes.run={minigame:{id:b.minigame.id,params:b.minigame.params,next:()=>'done'}};
   // Gate walks: reach her level and the prior beat the way a life would have (records only).
   const testSetup=ctx=>{ctx.RARelations.meet(person,'test');ctx.RARelations.add(person,[0,0,25,55,95][needLevel]);const recs={...ctx.RAState.get().life.adventures.records};for(const need of [after,...Array.from({length:k},(_,j)=>`ARC_${tag}_${from+j}`)].filter(Boolean))recs[need]={status:'completed',count:1,completedDay:1};ctx.RAState.patch('life.adventures.records',recs);if(!ctx.RALife.ownedCars().length)ctx.RALife.addCar({id:ctx.RACars.SUPRA,make:'Toyota',model:'Supra MK4',short:'SUPRA',price:0});};
   D({id,title:b.title,lane:'people',repeatable:false,memoryType:'people',start:'scene',testSetup,
    available:L=>RARelations.level(person)>=needLevel&&prior(L),nodes});
  }
 }
 arc('mazda_human','MAZDA',[
  {title:'HER FIRST JOLLOF',text:'what is that smell in the kitchen. i want it.',env:'kitchen',
   lines:[N('her first time eating jollof, straight from the castle kitchen.'),N('she eats the whole pot. she does not understand why you cook near fish.')],
   rich:'…that was supposed to last a week.',memory:'mazda\'s first jollof, from the castle kitchen',home:'she ate the whole pot. respect.'},
  {title:'WHERE YOU WERE BANISHED',text:'show me where they put you. the ocean.',env:'ocean_night_flight',
   lines:[N('she wants to see where you were banished. a night flight over the ocean.'),N('she won\'t go near the water either. she flies high the whole way.')],
   rich:'yeah. down there. it was a lot of years.',memory:'flew mazda over the ocean where he was banished',home:'she stayed high above the water the whole time. same.'},
  {title:'VERY BLUE',text:'i want to meet your family.',env:'bedroom',
   lines:[N('she asks to meet your family. you call mom on video.'),S('mom','…she is very blue.'),N('mom asks if she has eaten.')],
   rich:'mom, this is mazda.',memory:'mom met mazda on video. "very blue."',home:'mom said she\'s very blue. that\'s approval, i think.'}
 ]);
 arc('nneka','NNEKA',[
  {title:'FOR RESEARCH',text:'ok. one date. for research.',env:'blood_bank',
   lines:[N('you offer to donate again. she refuses again.'),S('nneka','fine. one date. for research, adeoluwa.')],
   rich:'i\'ll take research.',memory:'nneka agreed to a date "for research"',home:'research. i\'ll take it.'},
  {title:'THE POTLUCK',text:'my mother\'s church potluck. sunday. wear something nice.',env:'naija_lot',
   lines:[N('she takes you to her mother\'s church potluck. foil trays everywhere.'),N('you eat everything. nobody asks.')],
   rich:'…i\'m going back for thirds.',memory:'nneka took him to her mother\'s church potluck',home:'i ate everything. nobody asked a single question.'},
  {title:'YOUR BLOOD TYPE',text:'come by the blood bank. i need to tell you something.',env:'blood_bank',
   lines:[N('she tells you she has known since the first visit.'),S('nneka','your blood type says VAMPIRE, Adeoluwa. I just didn\'t want to make it weird.')],
   rich:'…you could\'ve said something.',memory:'nneka always knew he was a vampire',home:'she knew the whole time. she just didn\'t make it weird.'}
 ]);
 arc('jdm_importer_daughter_001','CAMMILE',[
  {title:'THE SUPRA',text:'give me a ride in the supra. i want to see how you drive it.',env:'street_night',
   lines:[N('she rides in the supra and critiques your driving the whole way.'),S('jdm_importer_daughter_001','you\'re lifting too early. again.')],
   rich:'…it\'s my car.',memory:'cammile critiqued his driving from the passenger seat',home:'she corrected every shift. she was right every time.'},
  {title:'SHE CHASES',text:'crest. tonight. you lead, i chase.',env:'crest',
   lines:[N('a touge tandem up the crest. you lead; she chases.'),N('she\'s better than pinky. she knows it.')],
   minigame:{id:'touge',params:()=>({course:'angeles_crest',car:RACars.toTouge(RALife.ownedCars().find(c=>c.id===RALife.flag('tougeCar'))||RALife.ownedCars()[0]||{}),tandem:{rival:'CAMMILE',role:'lead',threshold:20000},rain:RALife.today().rain})},
   memory:'cammile chased him up the crest. better than pinky.',home:'she was on my bumper the whole way up.'},
  {title:'DINNER WITH THE IMPORT GUY',text:'my dad wants you at dinner. don\'t be weird.',env:'docks',actors:{left:'rich',mid:'jdm_importer_daughter_001',right:'importer'},
   lines:[N('her father, the import guy, invites you to dinner.'),N('he doesn\'t insult you once. it is terrifying.')],
   rich:'…is he ok?',memory:'dinner with cammile\'s father. no insults. terrifying.',home:'the import guy was nice to me. i\'m scared.'}
 ]);
 arc('june','JUNE',[
  {title:'SOMETHING NEW',text:'come to the salon. i want to try something on you.',env:'salon',
   lines:[N('she restyles your locs into something new, just for one night.'),S('june','tomorrow they go back. tonight, this.')],
   rich:'i look expensive.',memory:'june restyled his locs for one night',home:'one night with new locs. she\'s an artist.'},
  // VOL 5 names this "a small, careful minigame"; no such minigame exists, so the beat plays as a choice (deferred).
  {title:'HER LOCS',text:'your turn. retwist mine. carefully.',env:'salon',
   lines:[N('she lets you retwist HER locs. you are bad at it.'),N('she loves it anyway.')],choices:['PALM ROLL. SLOW.','ASK HER HOW.','DO YOUR BEST.'],
   after:[S('june','…that\'s the worst retwist i\'ve ever had. do the next one.')],
   memory:'retwisted june\'s locs. badly. she loved it.',home:'i was terrible at it. she let me keep going.'},
  {title:'UNTIL 4 A.M.',text:'i\'m closing early tonight. come by.',env:'salon',
   lines:[N('she closes the salon early for you.'),N('you sit in the empty salon chairs and talk until 4 a.m.')],
   rich:'…it\'s four already?',memory:'talked with june in the empty salon until 4 a.m.',home:'the salon was empty and we talked till four.'}
 ]);
 // Ms. Patrice's beat 1 is the Waffle Saga itself (VOL 5 §8: "Beat 1 (COOL): The Waffle Saga (A44)"); her arc
 // continues from its last night.
 arc('ms_patrice','PATRICE',[
  {title:'WHERE\'S THE WAFFLE HAVEN',text:'i\'m in LA. come get me. i already hate it.',env:'street_night',
   lines:[N('she visits LA. she hates it.'),S('ms_patrice','where\'s the waffle haven.')],
   rich:'there is no waffle haven.',memory:'ms. patrice visited LA and hated it',home:'she hates LA. she still stayed the whole night.'},
  {title:'THE RECIPE',text:'your castle has a kitchen, right? i\'m coming over.',env:'kitchen',
   lines:[N('she teaches you the recipe in person, in your castle kitchen.'),S('ms_patrice','don\'t tell nobody.')],
   rich:'i won\'t. ever.',memory:'ms. patrice taught him the waffle recipe in his kitchen',home:'i know the recipe now. i can never tell anyone.'}
 ],{from:2,after:'A44_N4'});
})();
