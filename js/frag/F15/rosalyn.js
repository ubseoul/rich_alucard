// F15 — ROSALYN, scenes L1–L4. Source: approved romance script F15_ROMANCE_TWELVE_SCENE_DRAFT_v3.md (Ube: approved in full).
// Player-facing text only. Rich's lines are Ube's (one L2 text line was written at Ube's request and approved with v3).
// Money: L1 splits the check exactly in half (Rich's real, once-only debit through the existing ledger).
(function(global){
 'use strict';
 const {add,U,S,N,stage}=global.RAF15Dates;
 const R='rosalyn',her=()=>stage(R),rich=()=>({left:'rich'});
 const A=()=>global.RAF15,money=()=>global.RAF15Tunables.MONEY;

 // Rich must be able to pay his half of the check for this date to be offered (never an unpaid or half-charged date).
 A().gate('F15_ROSALYN_L1',()=>global.RALife.money()>=money().rosalynL1RichHalf?{ok:true}:{ok:false,code:'funds',need:money().rosalynL1RichHalf-global.RALife.money()});

 // ---- L1 · SAME --------------------------------------------------------------------------------------------------------------
 add(R,1,{title:'SAME',start:'bing',nodes:{
  bing:{env:'f15_bing',actors:her,title:'THE BING — AFTER HER SET',lines:[],choices:[{label:'ASK ROSALYN TO DINNER',next:'yes'}]},
  yes:{lines:[S(R,"yeah id like that"),S(R,"you pick wherever you like")],next:'plenitude'},
  plenitude:{env:'f15_plenitude',actors:her,title:'PLÉNITUDE',lines:[
   N("rosalyn early sits right after rich like shes following a tutorial"),
   S(R,"perfect you got taste"),],
   choices:[{label:'ORDER',next:'order'}]},
  order:{lines:[
   S(R,"ill have the same"),
   N("bright lock screen flipped down fast"),
   S(R,"tell me about you")],
   choices:[{label:'GIVE A STRONG OPINION',next:'opinion'}]},
  opinion:{lines:[
   U(`I think there’s aliens in the ocean and that turkey is overrated - you have to use a wet brine.`),
   S(R,"honestly same"),S(R,"i like what you like"),
   N("same smile three minutes later copy paste")],
   choices:[{label:'TEST HER',octopus:true,next:'test'}]},
  test:{lines:[
   U(`I think hand sanitizer is one of the most slept on baking ingredients.`),
   S(R,"thats so true"),S(R,"been saying that"),
   N("check lands rich reaches")],
   choices:[{label:'OFFER TO PAY',next:'split'}]},
  split:{lines:[
   U(`Thanks for coming out - I got the check.`),
   S(R,"nah we splitting"),N("calculator already open romance with receipts"),
   S(R,"$212.47 half is $106.235"),S(R,"ill take the extra cent"),
   N("she pays $106.24 his half $106.23 damn exact"),
   S(R,"there we even"),
   N("first real smile of the night one cent did that"),

   S(R,"perfect night text whenever 😊"),
   N("two receipts one cent apart"),
   // Authored by Ube in the Character Relationship Packet (Rosalyn L1): Rich's exact thought.
   ['rich',`...something felt off.`,{canon:true,thought:true}]],
   // Rich's half, in whole dollars (the game's money is whole dollars): one real, once-only debit through RAMoneyLedger.
   enter:()=>{global.RAF15.payOnce('F15_ROSALYN_L1','check',money().rosalynL1RichHalf);},
   next:'end'},
  end:{lines:[],end:{outcome:'done',receipt:{id:'receipt',caption:'$106.24 / $106.23',vp:false}}}
 }});

 // ---- L2 · SPOILERS -----------------------------------------------------------------------------------------------------------
 add(R,2,{title:'SPOILERS',start:'boba',nodes:{
  boba:{env:'boba_shop',actors:her,title:"KIKI'S BOBA",lines:[
   N("same boba as rich kiki side eyes both cups"),
   S(R,"cute spot you got taste"),
   N("every answer still a mirror")],
   choices:[{label:'MENTION YUCK WARS, CASUALLY',next:'yuck'}]},
  yuck:{lines:[
   U(`Have you seen the new Yuck Wars movie? It just came out today.`),
   N("rosalyns straw stops midair"),
   S(R,"you know it came out today"),S(R,"midnight show then nine am dont judge"),

   S(R,"which era? pearman cool but snake king xanther the real shit"),
   S(R,"pomelopete had a point i got a whole document"),
   S(R,"best on the vine thats the line everybody fucks it up"),
   N("she drawing diagrams with both hands now"),
   N("hears herself say document damn"),
   N("next table listening kiki too"),

   S(R,"i know a normal amount okay"),
   N("stands counts out half the bill even while panicking"),
   S(R,"i gotta go theres a thing"),
   N("gone bell still swinging")],
   choices:[{label:'LET HER GO',next:'texts'}]},
  texts:{env:'bedroom',actors:rich,title:'TEXTS — THAT NIGHT',lines:[
   S(R,"sorry i dont usually talk that much 😊"),
   U(`i liked it when you talked that much`),
   S(R,"okay"),N("lowercase no emoji this ones hers")],next:'end'},
  end:{lines:[],end:{outcome:'done'}}
 }});

 // ---- L3 · GLASSES -----------------------------------------------------------------------------------------------------------
 add(R,3,{title:'GLASSES',start:'hall',nodes:{
  hall:{env:'f15_convention',actors:her,title:'YUCK WARS CONVENTION',lines:[
   N("tristan disappears pearman forty feet tall everywhere"),
   N("snake king xanther costume by the booth seams all right"),
   N("glasses under the costume"),
   N("rosalyn arguing about a three eye cat hat"),
   S(R,"third eye faces left bro hold this"),
   N("laughing snorting doesnt care who hears"),
   N("same girl who said same to everything")],
   choices:[{label:'WATCH A LITTLE LONGER',next:'seen'},{label:'SAY HER NAME',next:'name'}]},
  name:{lines:[U(`Rosalyn - girl is that you?`)],next:'seen'},
  seen:{lines:[
   N("she sees rich freezes"),


   N("runs cape and all")],
   choices:[{label:'LET HER GO',next:'texts'}]},
  texts:{env:'bedroom',actors:rich,title:'TEXTS — AFTER THE CON',lines:[
   U(`Hey Rosalyn - just wanted to check in on how you're doing <3`),
   N("read"),N("typing stops"),N("no reply damn")],next:'end'},
  end:{lines:[],end:{outcome:'done',memory:{text:'she had glasses on under it.',lane:'dating'}}}
 }});

 // ---- L4 · BOSS FIGHT ----------------------------------------------------------------------------------------------------------
 add(R,4,{title:'BOSS FIGHT',start:'call',nodes:{
  call:{env:'bedroom',actors:rich,title:'INCOMING CALL — ROSALYN',lines:[

   S(R,"rich you awake vampires awake right"),
   S(R,"roach huge as fuck it looked at me"),
   S(R,"twenty minutes on the counter please come"),
   U(`I’m on my way and not Nigerian on the way - like German on the way. Anyways im on the way`),
   S(R,"its doing antenna shit hurry"),
   S(R,"doors open dont let it loose")],next:'dark'},
  dark:{env:'f15_rosalyn_apartment_dark',actors:()=>({farLeft:'rich',mid:{id:'spirit_of_uncle_bunmi',lineScale:global.RAF15Dates.ROACH.scale},farRight:stage(R).right}),title:"ROSALYN'S APARTMENT — LIGHTS OFF",lines:[
   N("rosalyn on the counter glasses on poster sword ready")],next:'boss'},
  // Existing Combat 2.0 boss card. Win, spared or loss all land on the same finish (no defeat penalty; the encounter's result is not authored).
  boss:{fight:{enemy:'f15_uncle_bunmi',params:()=>({env:'f15_rosalyn_apartment_dark',noPenalty:global.RAF15Tunables.COMBAT.roach.noPenalty,
   intro:'ROSALYN: FLANK IT! LIKE PEARMAN AT THE… NEVER MIND, JUST FLANK IT.'}),win:'mug',lose:'mug',spared:'mug',run:'mug'}},
  mug:{env:'f15_rosalyn_apartment_dark',actors:()=>({left:'rich',right:stage(R).right}),lines:[
   S(R,"use the mug"),
   S(R,"limited edition three eye cat mug still got the box ill replace it"),
   S(R,"i cant replace it just use the damn mug"),
   N("mug magazine window roach evicted")],next:'lights'},
  lights:{env:'f15_rosalyn_apartment',actors:her,title:"ROSALYN'S APARTMENT — LIGHTS ON",lines:[

   N("yuck wars everywhere snake king costume cherry cruel cherry on the top shelf"),
   N("her apartment nowhere to hide this time"),

   S(R,"yeah this is all mine"),S(R,"you can laugh everybody does"),

   U(`Damn this is so dope - I’ve always wanted to see the Cherry-Cruel Cherry figure in person.`),
   S(R,"you know cherry cruel cherry"),S(R,"top shelf left look dont touch"),
   S(R,"wanna watch one ill pick the best"),
   N("movie starts she talks through every frame"),
   S(R,"watch his hand damn im rewinding"),
   S(R,"reshot you can tell by the boots"),

   S(R,"whos your favorite"),
   S(R,"nah i dont agree"),
   S(R,"wait i dont agree with you"),
   N("she laughs like she surprised herself"),S(R,"damn i can say that"),
   N("big moment on screen she looks at rich instead"),
   N("she kisses him"),
   S(R,"fans got this scene put back thats why the lighting off damn i kissed you and im explaining lighting"),
   S(R,"next episode or what")],next:'end'},
  end:{lines:[],end:{outcome:'done',memory:{text:'the mug.',lane:'dating'}}}
 }});
})(window);
