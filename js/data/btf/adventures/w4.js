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
  arrive:{env:'street_night',actors:{left:'rich'},title:'THE FRONT GATE',
   lines:[N('somebody is banging on the gate. it is not a vampire hunter. it is a guy with two iced coffees.'),
    E('coffe','he holds them up like trophies.'),S('coffe',"YO. RICH ALUCARD. I GOT YOU. TWO ICED COFFEES, ONE FOR EACH OF US."),
    R("i can't drink coffee. i'm a vampire."),S('coffe','…oh. OH. say less.')],next:'drink'},
  drink:{lines:[N('he drinks both. back to back. no hands shaking. eyes wide the whole castle block.'),
    S('coffe','I\'M COFFE. I JUST MOVED ON THE BLOCK. I KNEW WE WAS GONNA BE HOMIES.'),
    R('…you good, bro?'),S('coffe','NEVER BETTER. NEVER BETTER. WANNA SEE SOMETHING?')],
   choices:[{label:'"…SURE."',next:'hype'},{label:'WATCH HIM VIBRATE IN SILENCE',octopus:true,next:'hype'}]},
  hype:{lines:[N('he does a lap around the block at a speed that should not be possible on foot. he comes back. he is fine.'),
    S('coffe','ANYWAY. WELCOME TO THE HOOD. HERE.'),N('he gives you his number before you ask for it.')],
   enter:A=>{RARelations.meet('coffe','castle_gate');RALife.unlockApp('texts',{silent:true});RALife.remember({text:'coffe showed up with two iced coffees and drank both',lane:'people'});},
   end:{outcome:'met',memory:{text:'met coffe. he drank both iced coffees.',lane:'people'},
    home:['rich','that dude might be the funniest addition to this block.',{vp:true}]}}
 }});

 // PT2 — ROGUE STATUS. Tells accumulate as mail/texts/VampGram over days 20-30, then the fork adventure.
 const TELLS=[
  {id:'tell1',day:20,line:'the back entrance is roped off now. "for fire safety," coffe says.'},
  {id:'tell2',day:23,line:'a VampGram story: a blurred fourth member of vicky\'s party, holding an iced coffee.'},
  {id:'tell3',day:26,line:'tokyo tony, texting: "coffe been moving different lately. you notice?"'}
 ];
 RAClock.onWake('a29-tells',55,({info})=>{
  if(!RARelations.met('coffe')||RALife.flag('coffeRogue')||RALife.done('A29C'))return;
  if(info.day<20||info.day>30)return;
  const t=TELLS.find(x=>x.day===info.day);if(!t)return;
  RALife.counter('coffeTells');RALife.setFlag('coffeRogue','watching');
  if(t.id==='tell2')window.RAVampGram?.post?.({handle:'grave.cam',text:t.line,likes:900});
  else RALife.mail({id:`a29:${t.id}`,kind:'people',title:'THE BLOCK',body:t.line});
 });
 D({id:'A29B',title:'ROGUE STATUS',lane:'people',scope:'MUST',memoryType:'people',start:'weigh',
  available:L=>L.done('A29')&&(L.count('coffeTells')||0)>=2&&L.day<=32,
  nodes:{
  weigh:{env:'street_night',actors:{left:'rich'},title:'SOMETHING IS OFF ABOUT COFFE',
   lines:[N('three tells in a week. the fire-safety door. the blurred story. tokyo tony\'s text.'),
    R("he's my homie. but he's also acting like he's got a second job.")],
   choices:[{label:'CONFRONT HIM EARLY',next:'confront'},{label:'IGNORE IT',fx:A=>RALife.setFlag('coffeRogue','ignored'),next:'ignore'}]},
  confront:{env:'street_night',actors:{left:'rich',right:'coffe'},lines:[S('coffe','confront me? about what? i live here. i love it here.'),
    N('he lies well. smooth. barely a beat missed.')],
   choices:[{label:'LET IT GO',fx:A=>RALife.setFlag('coffeRogue','confronted'),next:'letgo'},
    {label:'EXPOSE HIM',octopus:true,when:()=>RALife.L().known3cool,sub:'3+ PEOPLE AT COOL+ HAVE TO VOUCH',next:'expose'}]},
  expose:{lines:[N('you pull three people who know coffe — real ones, cool with you — into the group chat at once.'),
    S('coffe','…y\'all really did that. ok. ok, real talk—'),N('he cracks. not all the way. but enough.'),
    S('coffe','vicky\'s party been paying me to keep tabs on the castle. i drink the coffee for real though. that part\'s true.'),
    R("that's the least surprising part of this whole story.")],
   enter:A=>{RALife.setFlag('coffeRogue','exposed');RARelations.setFlag('coffe','exposedEarly',true);},next:'letgo'},
  letgo:{lines:[N('nothing changes tonight. the block keeps moving.')],end:{outcome:'confronted',memory:{text:'called out coffe about vicky\'s party',lane:'people'},home:['rich','i\'m watching that man now.',{vp:true}]}},
  ignore:{lines:[N('you let it ride. whatever it is, it\'ll show itself.')],end:{outcome:'ignored',memory:{text:'ignored the tells about coffe',lane:'people'}}}
 }});

 // PT3 — THE RAID. A wake after PT2. Vicky's party breaks in; wave fight; Vicky doesn't fight; fork Coffe's fate.
 RAWakeTriggers.define([{adventure:'A29C',priority:70,when:L=>L.done('A29B')&&L.day>(RALife.adventureRecord('A29B')?.completedDay||0)}]);
 D({id:'A29C',title:"THE RAID",lane:'combat',scope:'MUST',memoryType:'people',start:'hungover',
  nodes:{
  hungover:{env:'throne',actors:{mid:'rich'},title:'THE THRONE ROOM · MORNING',
   lines:[N('you are hungover in the throne room. the door does not knock. it just opens.'),
    E('bard','a bard walks in first, already strumming something threatening.')],next:'breakin'},
  breakin:{lines:[N("vicky's party. armored, loud, uninvited."),S('bard','THIS IS THE PART WHERE YOU FIGHT US.'),
    R("i haven't even had blood yet."),N('nobody cares.')],
   fight:{enemy:'bard',params:{env:'throne_party_mess',intro:"THE BARD. TERRIBLE COVER OF PLAYMAKERS."},win:'cleric',lose:'cleric',spared:'cleric'}},
  cleric:{lines:[E('cleric','the cleric steps over the bard, already praying for backup.')],
   fight:{enemy:'cleric',params:{env:'throne_party_mess',intro:'THE CLERIC. PRAYING FOR SOMEONE.'},win:'paladin',lose:'paladin',spared:'paladin'}},
  paladin:{lines:[E('paladin','the paladin raises a sword like the ceiling owes him something.')],
   fight:{enemy:'paladin',params:{env:'throne_party_mess',intro:'THE PALADIN. HOLY SWING.'},win:'coffefight',lose:'coffefight',spared:'coffefight'}},
  coffefight:{lines:[E('coffe','coffe steps in last. dagger out. still holding a fourth iced coffee, somehow.'),
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
  bed:{env:'bedroom',actors:{left:'rich'},title:'THE BEDROOM · MORNING',
   lines:[N('a thick blue woman with horns and a tail is sitting on your bed, finishing the last of the agege bread.'),
    N('there is no dragon anywhere in the room.'),R('…mazda?'),S('mazda_human','who else eats your bread like this?')],next:'discover'},
  discover:{env:'grave',actors:{left:'rich',right:'mazda_human'},title:'THE GRAVE',
   lines:[N('you take her to the grave to figure this out like normal people. she orders boba immediately.'),
    S('mazda_human','i\'ve been able to do this for a while. i just liked being a dragon more.')],next:'night'},
  night:{env:'la_sky',actors:{left:'rich',right:'mazda_human'},title:'OVER LOS ANGELES',
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
 D({id:'A33',title:"THE DUCHESS'S SOIRÉE",lane:'people',scope:'MUST',memoryType:'people',start:'invite',
  nodes:{
  invite:{env:'street_night',actors:{left:'rich'},title:'VAMPGRAM',
   lines:[N('an invite on VampGram: gold text, no handle. "THE DUCHESS REQUESTS YOUR PRESENCE."')],next:'arrive'},
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
  react:{lines:A=>{const a=A.vars.answer;const lines={cooked:"i cooked something real, about a real night.",show:'i played a show. people showed up.',drop:'i actually dropped something.',nothing:"…nothing yet. honestly.",charm:"does it matter what i've done, or that i\'m interesting?"};
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
  pinky:{env:'grave_closed',actors:{left:'rich',right:'pinky'},
   lines:A=>{const close=RARelations.level('pinky')>=3;return [N('pinky was watching from the top of the ramp.'),
    S('pinky',close?"you drive it better than me. take the s2000. i\'ll get another one.":'clean run. i saw the whole thing.')];},
   choices:A=>RARelations.level('pinky')>=3?[{label:'TAKE THE S2000',fx:X=>{if(RACars.buy('s2000'))X.set('gotCar',true);},next:'done'}]:[{label:'CONTINUE',next:'done'}]},
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
  arrive:{env:'suya_spot',actors:{left:'rich'},title:'THE SUYA SPOT · ATL',
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
  arrive:{env:'food_court',actors:{left:'rich'},title:'THE FOOD COURT · LUNCH',
   lines:[N('a zombie on her lunch break, spreadsheet open on her phone, eating alone.'),
    E('brenda','she looks up.'),S('brenda','you\'re the castle guy. i do the numbers on half the businesses in this mall. i know your numbers too.'),
    R('…that\'s either impressive or deeply concerning.'),S('brenda','both.')],
   enter:A=>{RARelations.meet('brenda','food_court');},next:'gossip'},
  gossip:{lines:[S('brenda','you want real gossip? the CEO — Zombie Prince — his numbers are worse than yours. way worse.'),
    R('the CEO of what?'),S('brenda','everything. he owns everything and somehow still can\'t make payroll.'),
    N('she goes back to her spreadsheet. she does not stop talking while she eats.')],next:'done'},
  done:{end:{outcome:'met',memory:{text:'met brenda from accounting — gossip about the CEO Zombie Prince',lane:'people'},
   home:['rich','she knows my numbers better than my accountant does. concerning.',{vp:true}]}}
 }});

 // ===================================================================================================
 // A39 — HIRING MARISOL
 // ===================================================================================================
 RAPlaces.define([{id:'castle:maid',hidden:true,adventure:'A39'}]);
 D({id:'A39',title:'HIRING MARISOL',lane:'home',scope:'MUST',memoryType:'home',start:'ghost',
  available:L=>L.hasRoom('maid_quarters'),
  nodes:{
  ghost:{env:'throne',actors:{mid:'rich'},title:'THE THRONE ROOM · INTERVIEWS',
   lines:[N('applicant one: a ghost. she picks up the mop. the mop passes through her hands.'),
    S(null,'"…i used to be so good at this."'),R('it\'s ok. thank you for coming.')],next:'bones'},
  bones:{lines:A=>RALife.flag('bonesworthResident')?[N('applicant two: sir bonesworth, in an apron over his armor.'),S('bonesworth','I SHALL CLEAN AS I ONCE CONQUERED.'),N('he breaks a vase immediately.')]:[N('no second applicant today. the list is short.')],next:'marisol'},
  marisol:{env:'throne',actors:{mid:'rich',right:'marisol'},
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
  arrive:{env:'kush_back',actors:{left:'rich'},title:'KUSH & CRYPT · BACK ROOM',
   lines:[N('past the counter, through a curtain that smells like dragon keef, a woman is warming her hands over nothing.'),
    E('emberly','the seat next to her is already warm before you sit.'),S('emberly','you\'re the first one tonight who didn\'t flinch.')],
   enter:A=>{RARelations.meet('emberly','kush_back');},next:'done'},
  done:{end:{outcome:'met',memory:{text:'met emberly in the back room at kush & crypt',lane:'people'},home:['rich','that seat is gonna smell like her for a week.',{vp:true}]}}
 }});
 D({id:'A_JADE1',title:'DRAGON NIGHT',lane:'people',scope:'MEET',memoryType:'people',start:'arrive',
  nodes:{
  arrive:{env:'party_hall_packed',actors:{left:'rich'},title:'DRAGON NIGHT',
   lines:[N('the theme is dragons. half the room is in costume. one woman is not — because she doesn\'t need to be.'),
    E('jade','she keeps the receipt from her drink in her hand like it matters.'),S('jade','jade wyrmwood. i keep everything. you\'ll learn that.')],
   enter:A=>{RARelations.meet('jade','party_hall_packed');},next:'done'},
  done:{end:{outcome:'met',memory:{text:'met jade wyrmwood at dragon night',lane:'people'},home:['rich','she kept my cup. i don\'t know why that\'s unsettling.',{vp:true}]}}
 }});
 D({id:'A_LO1',title:'A PARTY, A ARM',lane:'people',scope:'MEET',memoryType:'people',start:'arrive',
  nodes:{
  arrive:{env:'rave_interior',actors:{left:'rich'},title:'A PARTY',
   lines:[N('a woman\'s arm falls off on the dance floor. she picks it up without stopping the song.'),
    E('lo','she apologizes to you specifically, mid-song.'),S('lo','sorry. it does that. i\'m lo.')],
   enter:A=>{RARelations.meet('lo','rave_interior');},next:'done'},
  done:{end:{outcome:'met',memory:{text:'met lo at a party — her arm fell off',lane:'people'},home:['rich','she kept dancing with one arm. respect.',{vp:true}]}}
 }});
 D({id:'A_HINA1',title:'TIMED',lane:'people',scope:'MEET',memoryType:'people',start:'arrive',
  nodes:{
  arrive:{env:'little_tokyo',actors:{left:'rich'},title:'SLURP · LITTLE TOKYO',
   lines:[N('a woman behind the counter is timing something on her phone. it\'s you. she\'s timing you eat.'),
    E('hina','she flips the phone around.'),S('hina','forty-one seconds. that\'s slow. i\'m hina.')],
   enter:A=>{RARelations.meet('hina','little_tokyo');},next:'done'},
  done:{end:{outcome:'met',memory:{text:'met hina at slurp — she timed him eating',lane:'people'},home:['rich','i lost a race i didn\'t know i was in.',{vp:true}]}}
 }});
 D({id:'A_ANFEESA1',title:'ONE RECORD',lane:'people',scope:'MEET',memoryType:'people',start:'arrive',
  available:L=>L.flag('ogunsRaveCompleted')||L.done('A55'),
  nodes:{
  arrive:{env:'rave_interior',actors:{left:'rich'},title:'BOOTH SIDE',
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
  const CREATORS=()=>{const list=[{id:'velvet',person:'velvet',locked:false}];
   for(const id of ['mazda_human','nneka','june','ms_patrice','duchess','jade','emberly'])
    if(RARelations.met(id)&&(RALife.flag('onlyvamps_pages')||[]).includes(id))list.push({id,person:id,locked:true});
   return list;};
  function subbed(id){return (RALife.flag('onlyvamps_subs')||[]).includes(id);}
  function subscribe(id){const subs=new Set(RALife.flag('onlyvamps_subs')||[]);if(subs.has(id))return false;if(!RALife.spend(PRICE))return false;
   subs.add(id);RALife.setFlag('onlyvamps_subs',[...subs]);RALife.setFlag('onlyvamps_renew',{...(RALife.flag('onlyvamps_renew')||{}),[id]:RALife.today().day});
   RALife.remember({text:`subscribed to a page on ONLYVAMPS`,lane:'people',quality:.3});return true;}
  function cancel(id){const subs=new Set(RALife.flag('onlyvamps_subs')||[]);if(!subs.has(id))return false;subs.delete(id);RALife.setFlag('onlyvamps_subs',[...subs]);return true;}
  RAClock.onWake('onlyvamps-renew',45,({info})=>{if(info.dayOfMonth!==1)return;
   for(const id of RALife.flag('onlyvamps_subs')||[]){if(RALife.money()>=PRICE)RALife.spend(PRICE);else{cancel(id);RALife.mail({id:`ov-cancel:${id}:${info.day}`,kind:'app',title:'ONLYVAMPS',body:'a subscription lapsed. not enough funds.',app:'onlyvamps'});}}});
  window.RAOnlyVamps={PRICE,creators:CREATORS,subbed,subscribe,cancel,
   markup(){const tiles=CREATORS().map(c=>{const p=RABtfPeople.get(c.person);const collision=RARelations.met(c.person)&&c.locked;
    return `<div class="phone-card"><b>${(p?.name||'CREATOR').toUpperCase()}</b>${collision?'you know her. this is weird now.':'creator on ONLYVAMPS.'}<br>${RALife.fmt(PRICE)}/MONTH<button type="button" class="phone-button" data-phone-action="do:onlyvamps:${subbed(c.id)?'cancel':'sub'}:${c.id}">${subbed(c.id)?'CANCEL':'SUBSCRIBE'}</button></div>`;}).join('');
    return `<h1>ONLYVAMPS</h1><p class="phone-small">non-graphic. tiles only. you know how this goes.</p>${tiles}`;},
   action(a,arg,api){if(a==='sub')subscribe(arg);else if(a==='cancel')cancel(arg);api?.refresh?.();return true;}};
  window.RAPhoneApps?.register?.({id:'onlyvamps',label:'ONLYVAMPS',order:20,render:()=>window.RAOnlyVamps.markup(),onAction:(a,arg,api)=>window.RAOnlyVamps.action(a,arg,api)});
 })();

 // ===================================================================================================
 // VOL 5 — A41 THE PERFECT NIGHT
 // ===================================================================================================
 RATemptations.define([{id:'trippin_red',source:'friend',sender:'TRISTAN',thread:'tristan',
  line:"trippin red at the hollow bowl saturday. i got 2 extra.",minDay:12,adventure:'A41',priority:5}]);
 D({id:'A41',title:'THE PERFECT NIGHT',lane:'people',scope:'MUST',memoryType:'people',start:'pick',
  available:L=>Object.keys(RALife.life().people.records||{}).some(id=>RARelations.level(id)>=2),
  nodes:{
  pick:{env:'street_night',actors:{left:'rich'},title:'A PLUS-ONE',
   lines:[N('tristan hit you with two extra tickets. trippin\' red. the hollow bowl. saturday.'),R('who am i bringing?')],
   choices:A=>{const ids=Object.keys(RALife.life().people.records||{}).filter(id=>RARelations.level(id)>=2);
    return ids.map(id=>({label:(RABtfPeople.get(id)?.name||id).toUpperCase(),fx:X=>{X.set('person',id);RALife.setFlag('futureEx',id);},next:'route'}));}},
  route:{route:{dest:'hollow_bowl',next:'arrive'}},
  arrive:{env:'hollow_bowl',actors:A=>({left:'rich',right:A.vars.person}),title:'THE HOLLOW BOWL',
   lines:A=>[N('the amphitheater is packed. every seat, every aisle. the bass starts before the lights even change.'),
    E('trippin_red','trippin\' red walks out to a wall of sound.')],next:'mosh'},
  mosh:{lines:[N('the crowd surges. you both get pulled into it, laughing, shoved, alive.')],
   minigame:{id:'bars',params:A=>({mode:'mosh',env:'hollow_bowl'}),next:(A,r)=>'slow'}},
  slow:{lines:[N('the set slows down. a quiet song. everyone in the bowl sways the same direction.')],next:'finale'},
  finale:{lines:[N('the finale hits like weather. lights, noise, everyone screaming the hook back at the stage.')],next:'drive'},
  drive:{env:'street_night',actors:A=>({left:'rich',right:A.vars.person}),title:'THE DRIVE HOME',
   lines:[N('windows down, montana playing loud enough to feel it in the seats.'),
    S(null,'"that was… actually the best night i\'ve had in a while."')],next:'roof'},
  roof:{env:'roof',actors:A=>({left:'rich',right:A.vars.person}),title:'THE HOOKAH ROOF',
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
 // A44 — THE WAFFLE SAGA (4 ATL nights, night-progress flag, each night a nightEnder)
 // ===================================================================================================
 D({id:'A44',title:'THE WAFFLE SAGA',lane:'food',scope:'MUST',memoryType:'food',start:'route',
  nodes:{
  route:{env:'street_night',actors:{left:'rich'},title:'NIGHT ONE',route:{dest:'atl',next:'heartsfelt'}},
  heartsfelt:{env:'lennox',actors:{left:'rich'},title:'HEARTSFELT-JACKSUN',
   lines:[N('night one: heartsfelt-jacksun, a soul food spot with a line out the door for waffles nobody talks about in the daylight.')],
   enter:A=>RALife.setFlag('waffleNight',1),
   end:{outcome:'night1',nightEnder:true,memory:{text:'waffle saga, night one — heartsfelt-jacksun',lane:'food'},chain:'A44_N2'}}
 }});
 D({id:'A44_N2',title:'THE WAFFLE SAGA · MAUL OF GEORGIA',lane:'food',scope:'MUST',memoryType:'food',start:'maul',
  available:L=>L.flag('waffleNight')===1,
  nodes:{
  maul:{env:'maul',actors:{left:'rich'},title:'THE MAUL OF GEORGIA',
   lines:[N('night two: the food court at the maul. lil smack is running a table like it\'s his personal toll booth.'),
    S('lil_smack','you want the waffle intel? that\'ll cost you.')],
   choices:[{label:'FIGHT HIM FOR IT',next:'fight'},{label:'TALK YOUR WAY PAST HIM',octopus:true,next:'octo'}]},
  // Lil Smack's own enemy card (frozen art); `hp:60` keeps the encounter's authored difficulty (it was a training stub).
  fight:{fight:{enemy:'lil_smack',params:{env:'maul',hp:60,intro:'LIL SMACK. FOOD COURT TABLE. HIGH STAKES.'},win:'won',lose:'won',spared:'won'}},
  octo:{lines:[S('lil_smack','…ok that was smooth. here.'),N('he hands over a napkin with a name on it.')],next:'won'},
  won:{lines:[N('you leave with a name: ms. patrice.')],enter:A=>RALife.setFlag('waffleNight',2),
   end:{outcome:'night2',nightEnder:true,memory:{text:'waffle saga, night two — the maul of georgia, lil smack',lane:'food'},chain:'A44_N3'}}
 }});
 D({id:'A44_N3',title:'THE WAFFLE SAGA · LENNOX SCARE',lane:'food',scope:'MUST',memoryType:'food',start:'date',
  available:L=>L.flag('waffleNight')===2,
  nodes:{
  date:{env:'lennox',actors:{left:'rich'},title:'LENNOX SCARE',
   lines:[N('night three: lennox scare. the vampire retail crowd, buckhead money.'),
    E('buckhead','a buckhead vampire steps between you and the storefront.'),S('buckhead','you\'re not on the list for this shop.')],
   choices:[{label:'FIGHT HIM',next:'fight'},{label:'OCTOPUS: "SHE AIN\'T FOR SALE"',octopus:true,next:'octo'}]},
  fight:{fight:{enemy:'buckhead',params:{env:'lennox',intro:'THE BUCKHEAD VAMPIRE. BRUNCH EMPIRE.'},win:'won',lose:'won',spared:'won'}},
  octo:{lines:[R('"she ain\'t for sale."'),N('he blinks. steps aside. that landed harder than expected.')],next:'won'},
  won:{lines:[N('you get past him. inside: ms. patrice, waiting.')],enter:A=>RALife.setFlag('waffleNight',3),
   end:{outcome:'night3',nightEnder:true,memory:{text:'waffle saga, night three — lennox scare, the buckhead vampire',lane:'food'},chain:'A44_N4'}}
 }});
 D({id:'A44_N4',title:'THE WAFFLE SAGA · CENTENNIAL',lane:'food',scope:'MUST',memoryType:'food',start:'park',
  available:L=>L.flag('waffleNight')===3,
  nodes:{
  park:{env:'centennial',actors:{left:'rich',right:'ms_patrice'},title:'CENTENNIAL VAMPIRIC PARK · 3 A.M.',
   lines:[E('ms_patrice','ms. patrice is sitting on a bench, waiting like she knew you\'d make it.'),
    S('ms_patrice','three nights for a recipe. you earned the story, at least.'),
    N('she tells you where the waffle mix recipe came from — her grandmother, a diner that isn\'t there anymore, a fight over a name on a sign.'),
    S('ms_patrice','don\'t tell nobody.')],
   enter:A=>{RARelations.meet('ms_patrice','centennial');RALife.addItem('prop_waffle_mix',1);RALife.setFlag('waffleNight',0);},
   next:'done'},
  done:{end:{outcome:'prize',memory:{text:'the waffle saga — ms. patrice\'s recipe, don\'t tell nobody',lane:'food'},
   receipt:{caption:'a bag of waffle mix. a note: "don\'t tell nobody."'},nightEnder:true,
   home:['rich','three nights for a bag of mix. worth every second.',{vp:true}]}}
 }});
 RABtfPeople.byId.lil_smack=RABtfPeople.byId.lil_smack||{id:'lil_smack',name:'LIL SMACK',look:{skin:'#7a5030',top:'#e0c020',hair:'#0c0c10',hairShape:'spiky'}};

 // ===================================================================================================
 // A46 — LITTLE TOKYO SPECIAL NIGHT
 // ===================================================================================================
 D({id:'A46',title:'LITTLE TOKYO SPECIAL NIGHT',lane:'people',repeatable:true,memoryType:'people',start:'ask',
  available:L=>Object.keys(RALife.life().people.records||{}).some(id=>RARelations.level(id)>=3),
  nodes:{
  ask:{env:'street_night',actors:{left:'rich'},title:'"TAKE ME SOMEWHERE SPECIAL"',
   lines:[N('a text: "take me somewhere special."')],
   choices:A=>Object.keys(RALife.life().people.records||{}).filter(id=>RARelations.level(id)>=3)
    .map(id=>({label:(RABtfPeople.get(id)?.name||id).toUpperCase(),fx:X=>X.set('person',id),next:'plan'}))},
  plan:{env:'little_tokyo',actors:A=>({left:'rich',right:A.vars.person}),title:'LITTLE TOKYO AT NIGHT',
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
  bench:{env:'little_tokyo',actors:A=>({left:'rich',right:A.vars.person}),
   lines:A=>[N('you end up on a bench, the strip of photos between you.'),
    S(A.vars.person,'nobody\'s ever planned a night like this for me. three whole stops.'),
    R("you deserve more than three."),N('she says something real — quiet, not for anyone else.')],next:'done'},
  done:{end:{outcome:'special',memory:A=>({text:`a special night in little tokyo with ${(RABtfPeople.get(A.vars.person)?.name||'her').toLowerCase()}`,lane:'people'}),
   receipt:{caption:'a photo booth strip. little tokyo, at night.'},
   home:['rich','three stops. worth planning again.',{vp:true}]}}
 }});

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
 RAParties.register(L=>L.flag('ogunsRaveCompleted')&&!L.done('A55')?'A55':null);
 D({id:'A55',title:"OGUN'S SECOND RAVE",lane:'people',repeatable:false,memoryType:'people',start:'arrive',
  available:L=>L.flag('ogunsRaveCompleted'),
  nodes:{
  arrive:{env:'rave_interior',actors:{left:'rich'},title:"OGUN'S SECOND RAVE",
   lines:[N('techno this time. a different crowd — one that has never heard of any rapper, ever, on purpose.'),
    E('anfeesa','dj anfeesa is behind the booth.')],
   enter:A=>{if(!RARelations.met('anfeesa'))RARelations.meet('anfeesa','rave_interior');},next:'dance'},
  dance:{choices:A=>RAParties.choices({fallback:{reaction:'the crowd doesn\'t care who you are. it\'s kind of freeing.',score:1}},'remix')},
  remix:{lines:A=>{const dropped=(RAState.get().life.creativeLife.music.dropped||[]).length>0;const viral=RALife.life().resources.followers>=100;
    if(dropped&&viral)return [N('mid-set, anfeesa drops a techno remix of your song. the crowd doesn\'t know it\'s yours. you do.')];
    return [N('the set rolls on. no remix tonight — maybe next time.')];},
   enter:A=>RAParties.attended('human'),next:'done'},
  done:{end:{outcome:'attended',memory:{text:"ogun's second rave — techno, dj anfeesa",lane:'people'},
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
 function arc(person,tag,beats){
  for(let i=0;i<beats.length;i++){
   const b=beats[i];const id=`ARC_${tag}_${i+1}`;const needLevel=i+2; // beat1@cool(2) beat2@close(3) beat3@ride(4)
   RATemptations.define([{id:`${id}_tempt`,source:'invite',sender:(RABtfPeople.get(person)?.name||person),thread:person,
    line:b.text,adventure:id,repeatable:false,when:L=>RARelations.level(person)>=needLevel&&L.done(id)===false&&(i===0||L.done(`ARC_${tag}_${i}`))}]);
   D({id,title:b.title,lane:'people',repeatable:false,memoryType:'people',start:'scene',
    available:L=>RARelations.level(person)>=needLevel&&(i===0||L.done(`ARC_${tag}_${i}`)),
    nodes:{scene:{env:b.env,actors:{left:'rich',right:person},title:b.title,
     lines:[N(b.beat),...(b.rich?[R(b.rich)]:[])],
     enter:A=>{RARelations.memory(person,b.memory);},next:'done'},
     done:{end:{outcome:'done',memory:{text:b.memory,lane:'people'},home:b.home?['rich',b.home,{vp:true}]:null}}}});
  }
 }
 arc('mazda_human','MAZDA',[
  {title:'THE FIRST FLIGHT SHE PLANNED',text:'meet me on the roof. bring nothing.',env:'la_sky',
   beat:'she planned the whole route this time — over the coast, past the pier, back before sunrise.',
   rich:"you're a better pilot than most humans i've met.",memory:'mazda planned a whole flight route herself',home:'she had the whole night mapped out. i just held on.'},
  {title:'THE HOARD',text:'i want to show you something. it\'s embarrassing.',env:'fish_tank',
   beat:'she shows you where she keeps things — small, stolen-back trinkets from every night you\'ve had together.',
   rich:"that's not embarrassing. that's just you.",memory:'mazda showed him her hoard',home:'dragons keep receipts too, apparently.'},
  {title:'BOTH FORMS, ONE NIGHT',text:'i want you to see both of me tonight. all the way.',env:'la_sky',
   beat:'she shifts back and forth over the city, testing whether it changes anything between you. it doesn\'t.',
   rich:'you\'re still you. both ways.',memory:'mazda tested both forms with him — it changed nothing',home:'ride or die with a literal dragon. sure, why not.'}
 ]);
 arc('nneka','NNEKA',[
  {title:'THE WRONG JOLLOF, CORRECTED',text:'come over. i\'m cooking it right this time.',env:'naija_lot',
   beat:'she cooks jollof her way, in her kitchen, and dares you to say it\'s not better.',
   rich:"it is better. don't tell peking naija.",memory:'nneka cooked jollof her way',home:'she was right. it was better.'},
  {title:'SIT DOWN',text:'you look like you need someone to tell you to sit down.',env:'naija_mart',
   beat:'she makes you sit still for an hour, no phone, just talking, until you actually relax.',
   rich:'…i needed that.',memory:'nneka made him sit down and actually rest',home:'first real break i\'ve had in weeks.'},
  {title:'HER FAMILY\'S TABLE',text:'come meet everybody. no pressure. (pressure.)',env:'naija_lot',
   beat:'her whole family is at the table. they grill you the way the auntie at naija mart did, times ten.',
   rich:'i think i passed.',memory:'nneka brought him to meet her whole family',home:'i think that went well. i think.'}
 ]);
 arc('jdm_importer_daughter_001','CAMMILE',[
  {title:'THE FASTER LINE',text:'crest. tonight. bring the car.',env:'crest',
   beat:'she rides shotgun and calls your lines before you take them. she\'s right every time.',
   rich:'you should be driving.',memory:'cammile called his lines up the crest, correctly, every time',home:'she\'s a better driver than me and we both know it.'},
  {title:'THE PARTS BOX',text:'i found something. it\'s yours if you want it.',env:'docks',
   beat:'she hands you a box of parts she\'s been saving off the docks — nothing for sale, all for you.',
   rich:'you kept these? for me?',memory:'cammile gave him a box of saved parts',home:'she\'s been thinking about my car longer than i have.'},
  {title:'HER NAME ON THE INVOICE',text:'i\'m putting my name on the next shipment. come see.',env:'docks',
   beat:'she\'s taking over more of the import business. she wants you there when her name goes on the paperwork.',
   rich:"that's your name. that's real.",memory:"stood with cammile as her name went on the docks paperwork",home:'she\'s building something. i got to watch.'}
 ]);
 arc('june','JUNE',[
  {title:'ONE LOC AT A TIME',text:'salon\'s closed tonight. come anyway.',env:'salon',
   beat:'she fixes one loc while you talk, the way she always does. tonight she doesn\'t stop at one.',
   rich:"you don't have to do that.",memory:'june fixed his locs after hours at the salon',home:'i look better and i talked through something i needed to.'},
  {title:'THE CAFÉ AFTER CLOSE',text:'meet me at bean there dead that. i\'m locking up after.',env:'cafe',
   beat:'the café empties out around you. she talks about the shop she wants to open one day.',
   rich:'you should open it. i\'ll be your first regular.',memory:'june told him about the salon she wants to open',home:'she\'s got a plan. i want to be part of it.'},
  {title:'STILL WATER',text:'sit still. actually still, this time.',env:'salon',
   beat:'no small talk. just her working, quiet, and you letting yourself be still for once.',
   rich:'…this is the calmest i\'ve felt in months.',memory:'sat still with june — the calmest he\'s felt in months',home:'ride or die means someone who lets you be quiet too.'}
 ]);
 arc('ms_patrice','PATRICE',[
  {title:'ORDER UP',text:'come by after close. i\'ll make you the real one.',env:'waffle_haven',
   beat:'she makes you the waffle off the books — the one that isn\'t on the menu, ever.',
   rich:"this doesn't taste like anything else in this city.",memory:'ms. patrice made him the off-menu waffle',home:'i think i just had the best thing i\'ve eaten all year.'},
  {title:'ROASTING THE ROOM',text:'come watch me embarrass some rich people tonight.',env:'lennox',
   beat:'she roasts every rich person in the diner with total precision. you fall for her a little more each line.',
   rich:'remind me to never make you mad.',memory:'watched ms. patrice roast a room full of rich people',home:'terrifying. incredible. both.'},
  {title:'THE RECIPE BOX',text:'i want to show you where it all started. all of it.',env:'centennial',
   beat:'she opens the real recipe box — the one behind the one she showed you before. grandmother\'s handwriting, edges worn soft.',
   rich:'you don\'t have to show me this.',memory:'ms. patrice showed him the real recipe box',home:'ride or die, and she just handed me her grandmother\'s handwriting.'}
 ]);
})();
