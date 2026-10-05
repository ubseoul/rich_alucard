// F15 — EMERALD, scenes L1–L4. Source: approved romance script F15_ROMANCE_TWELVE_SCENE_DRAFT_v3.md (Ube: approved in full).
// Player-facing text only. Rich's lines are Ube's, verbatim. Rich never pays her family's bills; no line offers it.
// The recital song is referenced by TITLE ONLY: no lyrics, no recording. Emerald L1's cleaning is the accepted adventure
// choice-loop (pick the next task; finished tasks drop off the list) — no new chores system.
(function(global){
 'use strict';
 const {add,U,S,N,stage}=global.RAF15Dates;
 const R='emerald',her=()=>stage(R),rich=()=>({left:'rich'});
 const done=A=>A.get('done')||[];
 const task=(id,label,sub)=>A=>({label,sub,when:()=>!done(A).includes(id),hideLocked:true,fx:X=>X.set('done',[...done(X),id]),next:id});

 // ---- L1 · YOUR CASTLE, MY RULES ---------------------------------------------------------------------------------------------------
 add(R,1,{title:'YOUR CASTLE, MY RULES',start:'bing',nodes:{
  bing:{env:'f15_bing',actors:her,title:'THE BING — AFTER HER SET',lines:[
   N("emerald holds up your vampgram castle photo evidence"),
   S(R,"this your castle"),S(R,"ketchup on the throne? damn"),
   S(R,"saturday nine am im bringing gloves"),S(R,"you helping"),
   S(R,"im not your maid dont tip me either"),

   S(R,"school work never end floors do")],
   choices:[{label:'SATURDAY, NINE A.M.',next:'throne'}]},
  throne:{env:'throne_party_mess',actors:her,title:"RICH'S CASTLE — THRONE ROOM · THE MORNING AFTER",lines:[
   N("emerald got gloves mop three bags and concerns"),
   S(R,"seen worse"),S(R,"nah i lied this shit bad"),S(R,"gloves bag move")],next:'tasks'},
  // pick the next task; finished tasks drop off the list; when none are left the loop falls through to `finished`
  tasks:{lines:[],choices:A=>[task('chair','THE THRONE')(A),task('floor','THE FLOOR')(A),task('trash','THE TRASH')(A)],next:'finished'},
  chair:{lines:[
   N("cold wing strangers shoe forty dollars under the cushion"),
   S(R,"forty dollars in a chair damn"),S(R,"you got furniture money"),

   S(R,"take it im not here for that")],next:'tasks'},
  floor:{lines:[
   S(R,"figure eights bro like this"),
   N("she starts humming while mopping catches rich listening stops"),
   S(R,"mopping got tempo dont look at me")],next:'tasks'},
  trash:{lines:[
   S(R,"open the bag wider how you own a castle and no broom"),
   U(`I just realized now i dont have one lol.`),
   S(R,"just realized now? standing in this shit"),S(R,"wider bro")],next:'tasks'},
  finished:{lines:[
   N("clean room gloves off claws stretched"),
   S(R,"you better at this than you look"),S(R,"worse too both true"),
   S(R,"lift with your legs your back gonna bill you tomorrow")],next:'kitchen'},
  kitchen:{env:'kitchen',actors:her,title:"RICH'S CASTLE — KITCHEN",lines:[],choices:[{label:'MAKE HER RAMEN',next:'cook'}]},
  cook:{lines:[N("emerald gets up before the stove on"),S(R,"ill chop where you keep the knives")],choices:[{label:'MAKE HER SIT DOWN',next:'sit'}]},
  sit:{lines:[
   N("sits down fidgets watches rich cook like its an exam"),
   S(R,"you cook like you get paid for it"),
   N("red stew broth fried turkey thats richs ramen"),
   S(R,"this aint ramen"),
   N("first bite eyes closed"),
   S(R,"alright its ramen"),
   N("she grabs the bowl heads for the sink")],
   choices:[{label:'TAKE THE BOWL FROM HER',next:'bowl'}]},
  bowl:{lines:[
   N("rich takes it she finally lets go"),
   S(R,"fine damn"),S(R,"kitchen next week this shit a crime scene too")],next:'end'},
  end:{lines:[],end:{outcome:'done',receipt:{id:'receipt',caption:'RAMEN ×1 — cooked by: Rich. bowl washed by: Rich (she tried).',vp:false}}}
 }});

 // ---- L2 · FLASHCARDS ----------------------------------------------------------------------------------------------------------------
 add(R,2,{title:'FLASHCARDS',start:'texts',nodes:{
  texts:{env:'bedroom',actors:rich,title:'TEXTS',lines:[
   S(R,"exam thursday quiz me dont be nice"),S(R,"your kitchen got good light")],next:'table'},
  table:{env:'kitchen',actors:her,title:"RICH'S CASTLE — KITCHEN TABLE",lines:[
   N("flashcard brick biology chemistry anatomy"),
   S(R,"pre med read the front dont help"),
   N("card says BRACHIAL PLEXUS good luck"),
   S(R,"close like atlanta to tokyo"),
   N("three right one wrong forehead hits table"),
   S(R,"knew that run it back"),

   S(R,"you squinting when you last check your eyes"),
   N("alarm BABA 7:00"),

   S(R,"gotta take this every day"),
   N("at the window speaking farsi"),
   N("different voice laughing rolling her eyes exam thursday im fine"),
   N("call ends bank app opens"),
   N("transfer sent phone down family handled for the week")],
   choices:[{label:'ASK ABOUT THE CALL',next:'talk'},{label:'WAIT FOR HER TO BRING IT UP',next:'talk'}]},
  talk:{lines:[
   S(R,"my dad everybody back home"),S(R,"they counting on me"),S(R,"aint sad just true"),
   U(`Hey Emerald - you are enough okay, your family is lucky to have you but remember you are enough`),
   S(R,"thanks for saying that"),S(R,"next card dont get soft"),
   N("card says LARYNX"),N("she pauses on this one"),
   S(R,"larynx voice box"),

   S(R,"pass thursday im making you something"),
   U(`Good bye Emmie.`),
   S(R,"emmie huh"),S(R,"alright you can keep that one"),S(R,"go sleep you look like a vampire"),S(R,"free joke im allowed one")],next:'end'},
  end:{lines:[],end:{outcome:'done'}}
 }});

 // ---- L3 · THE MUSIC ------------------------------------------------------------------------------------------------------------------
 const visited=A=>A.get('searched')||[];
 const stop=(id,label)=>A=>({label,when:()=>!visited(A).includes(id),hideLocked:true,fx:X=>X.set('searched',[...visited(X),id]),next:id});
 add(R,3,{title:'THE MUSIC',start:'call',nodes:{
  call:{env:'bedroom',actors:rich,title:'INCOMING CALL — EMERALD',lines:[

   S(R,"rich i lost my sheet music for the recital"),

   S(R,"months of notes on it cant print that shit again"),
   S(R,"exam in ten minutes cant leave"),
   S(R,"im not saying never mind this time"),S(R,"i need help"),
   U(`Got it - on my way.`),
   S(R,"library waffle haven bing bingo night then my shift"),
   S(R,"text either way even if you find nothing")],next:'search'},
  // The first two stops (any order) come up empty; the music is under the bingo cage, so the Bing opens once both are checked.
  search:{lines:[],choices:A=>[stop('library','THE LIBRARY')(A),stop('waffle','WAFFLE HAVEN')(A),
   {label:'THE BING — BINGO NIGHT',when:()=>visited(A).length>=2,hideLocked:true,next:'bing'}],next:'bing'},
  library:{env:'f15_library',actors:rich,lines:[N("library table somebody elses highlighters no music"),S(R,"alright")],next:'search'},
  waffle:{env:'waffle_haven',actors:rich,lines:[N("waffle booth coffee ring no folder damn"),S(R,"okay thanks for checking"),
   N("replies getting shorter exam still going")],next:'search'},
  bing:{env:'f15_bing',actors:()=>({left:'rich',right:{id:'granny_bing'}}),title:'THE BING — BINGO NIGHT',lines:[
   N("granny bing calling numbers in the dj mic"),
   N("sheet music folder under the bingo cage dry safe found"),
   S('granny_bing',"all these pencil marks somebody been singing their ass off"),S('granny_bing',"those shoes though damn"),
   N("I Am What I Am from La Cage aux Folles her notes all over it farsi in the margins"),
   U(`hey emerald -got the folder thank god.`),
   N("read no reply exam still got her")],next:'steps'},
  steps:{env:'f15_exam_hall',actors:her,title:'OUTSIDE THE EXAM HALL — AFTER',lines:[
   N("she sees the folder in his hand"),
   N("sits on the steps laughs once like she can breathe again"),
   N("folder against her chest both arms"),
   S(R,"whole exam thinking about breath marks"),
   S(R,"think i passed ill worry tomorrow")],
   choices:[{label:'SIT DOWN NEXT TO HER',next:'sit'}]},
  sit:{lines:[S(R,"i dont ask for help usually"),S(R,"thank you for real")],choices:[{label:'ASK ABOUT THE MUSIC',next:'music'}]},
  music:{lines:[
   S(R,"just a hobby or whatever"),
   S(R,"nah it aint nothing"),S(R,"recital soon id like you there"),S(R,"not yet let me think")],next:'end'},
  end:{lines:[],end:{outcome:'done',memory:{text:'found under the bingo cage.',lane:'dating'}}}
 }});

 // ---- L4 · RECITAL ---------------------------------------------------------------------------------------------------------------------
 add(R,4,{title:'RECITAL',start:'texts',nodes:{
  texts:{env:'bedroom',actors:rich,title:'TEXTS',lines:[
   N("recital program her name right there"),
   S(R,"you dont have to come"),S(R,"nah i want you there")],next:'hall'},
  hall:{env:'f15_shrine',actors:her,title:'SHRINE AUDITORIUM',lines:[
   N("huge hall mostly empty her outfit her folder still closed"),
   N("she sings I Am What I Am fills the whole damn room"),

   N("medicine the plan singing the dream"),
   N("rich almost reaches for cash catches himself claps")],
   choices:[{label:'APPLAUD',next:'outside'}]},
  outside:{env:'street_night',actors:her,title:'OUTSIDE — AFTER',lines:[
   N("emerald comes out still buzzing"),
   S(R,"dont be nice was i good"),
   S(R,"nah i know i was good i felt it"),
   S(R,"medicine what everybody counting on"),S(R,"this ones mine"),
   U(`Emmie you deserve your dreams of your own okay - its a good plan but honestly - just be you, yo.`),

   S(R,"nobody said that to me before"),S(R,"dont know what to do with it"),S(R,"one thing just for me"),
   N("she kisses him"),
   U(`wow.`),
   N("phone buzzes BABA 7:00 every day"),
   N("farsi call then shrine i sang and richs name"),
   N("looks back at him flustered damn"),

   S(R,"dad asked who you were"),S(R,"i told him"),
   N("she doesnt say what")],next:'end'},
  end:{lines:[],end:{outcome:'done',memory:{text:'she sang. nobody threw anything.',lane:'dating'}}}
 }});
})(window);
