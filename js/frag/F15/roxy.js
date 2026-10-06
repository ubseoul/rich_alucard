// F15 — ROXY, scenes L1–L4. Source: approved romance script F15_ROMANCE_TWELVE_SCENE_DRAFT_v3.md (Ube: approved in full).
// Player-facing text only: no source annotations, proposal lists or production notes. Rich's lines are Ube's, verbatim.
// Roxy's money behavior is preserved (she will not let Rich pay). Her protected L3 quote appears once, here, and nowhere else.
(function(global){
 'use strict';
 const {add,U,S,N,stage}=global.RAF15Dates;
 const R='roxy',her=()=>stage(R),rich=()=>({left:'rich'});
 const spar=()=>global.RAF15Tunables.COMBAT.spar;

 // ---- L1 · HER TREAT --------------------------------------------------------------------------------------------------------
 add(R,1,{title:'HER TREAT',start:'bing',nodes:{
  bing:{env:'f15_bing',actors:her,title:'THE BING — AFTER CLOSE',lines:[
   N("lights up roxy pulls up in a hoodie like the date already booked"),
   S(R,"you throw on beat"),S(R,"most dudes just spray you got aim"),S(R,"best ratio in the room respect"),
   U(`damn girl i didn’t know i was being graded`),
   S(R,"yeah you getting graded now"),S(R,"im hungry you coming"),S(R,"off the clock i pick")],
   choices:[{label:'GO WITH HER',next:'waffle'},{label:'NOT TONIGHT',next:'declined'}]},
  declined:{lines:[],end:{outcome:'declined'}},
  waffle:{env:'waffle_haven',actors:her,title:'WAFFLE HAVEN — 3 A.M.',lines:[
   N("roxy orders rich still reading the menu"),
   S(R,"forty seconds for waffles? pick bro"),U(`good taste, waffles too`),
   N("stats textbook in her bag this date got homework")],
   choices:[{label:'ASK ABOUT THE CLUB',next:'club'},{label:'ASK ABOUT THE TEXTBOOK',next:'textbook'}]},
  club:{lines:[S(R,"my hours my money my call")],next:'both'},
  textbook:{lines:[S(R,"data science is patterns people aint random"),S(R,"same booth left hand first every time you predictable")],next:'both'},
  both:{lines:[
   S(R,"every shift pays for my future"),S(R,"no loans no cosigner nobody gets a cut"),
   N("roxy steals a fry like interest due"),
   N("check lands rich reaches")],
   choices:[{label:'REACH FOR THE CHECK',next:'check'}]},
  check:{lines:[
   N("her card already paid damn"),S(R,"handled"),
   U(`wait, what no i’ve got it dont worry`),
   S(R,"you throw all night let somebody else pay"),S(R,"nobody owes anybody thats the point"),
   N("number on the receipt she slides it over"),
   S(R,"text better than wyd and ill answer"),
   ],next:'texts'},
  texts:{env:'bedroom',actors:rich,title:'TEXTS — LATER',lines:[
   U(`i cant say wyd so instead ill say hmm. I really enjoyed spending time with you<3`),
   S(R,"alright thats decent"),S(R,"heart doing a lot though"),S(R,"gym thursday 6 dont be late"),N("roxy saved in your phone now act normal")],next:'end'},
  end:{lines:[],end:{outcome:'done',receipt:{id:'receipt',caption:'PAID IN FULL. (not by you)',vp:false}}}
 }});

 // ---- L2 · REMATCH -----------------------------------------------------------------------------------------------------------
 add(R,2,{title:'REMATCH',start:'gym',nodes:{
  gym:{env:'f15_gym',actors:her,title:'BOXING GYM — 6 P.M.',lines:[
   N("roxy wrapping her hands you late already"),
   S(R,"day pass paid dont start"),S(R,"no biting i know your ass"),S(R,"light contact first to five clean shots"),
   N("roxy smiling until rich lands one"),

   S(R,"alright now we boxing"),

   S(R,"two one me obviously"),S(R,"three one keep up"),
   N("rich lands clean she about to dispute it"),S(R,"that didnt count"),
   U(`damn you can’t take losing at all`),
   S(R,"losing fine i just dont do it"),S(R,"run that back"),
   ],next:'bout'},
  // Existing Combat 2.0, no defeat penalty. Either result continues the same scene (the spar's result is not authored).
  bout:{fight:{enemy:'f15_roxy_spar',params:()=>({env:'f15_gym',spar:true,noPenalty:spar().noPenalty,intro:'FIRST TO FIVE CLEAN SHOTS. LIGHT CONTACT.'}),win:'after',lose:'after',spared:'after',run:'after'}},
  after:{env:'f15_gym',actors:her,lines:[
   S(R,"five game go think about it"),

   S(R,"you drop your left after every jab fourteen times bro"),S(R,"im fixing that dont take it personal"),
   U(`why are you pocket watching me like that lol`),
   S(R,"cant pocket watch if i tell you")],next:'ramen'},
  ramen:{env:'little_tokyo',actors:her,title:'LITTLE TOKYO — RAMEN',lines:[
   N("roxy orders ramen rich tries his wallet again")],
   choices:[{label:'REACH FOR YOUR WALLET',next:'wallet'}]},
  wallet:{lines:[
   S(R,"put that away before i put it away for you"),
   N("dog at the window roxy changes her whole voice"),
   S(R,"hey baby look at your little face"),
   S(R,"animals better than people i got data"),
   S(R,"pigs smarter than half my study group goats underrated"),
   S(R,"yard and three dogs thats the plan"),

   S(R,"love animals"),S(R,"hate cats"),S(R,"dont ask me shit")],
   choices:[{label:'MENTION YOUR CAT',when:()=>!!global.RALife.life().ownership.cat,hideLocked:true,next:'cat'},{label:'KEEP THE CAT TO YOURSELF',next:'pays'}]},
  cat:{lines:[
   U(`well…all cats aren’t bad.`),

   S(R,"you got a cat dont you"),S(R,"damn your score just changed"),],next:'pays'},
  pays:{lines:[N("roxy pays again rich getting sponsored"),S(R,"thursday bring your left hand")],next:'end'},
  end:{lines:[],end:{outcome:'done',receipt:{id:'receipt',caption:'RAMEN ×2 — PAID BY: ROXY (again)',vp:false}}}
 }});

 // ---- L3 · DIFFERENT ---------------------------------------------------------------------------------------------------------
 // The hard hit comes from ANOTHER fighter (unnamed, undescribed, never speaking). Rich is at ringside; he never touches her.
 add(R,3,{title:'DIFFERENT',start:'ring',nodes:{
  ring:{env:'f15_gym',actors:her,title:'BOXING GYM — SAME GYM',lines:[
   N("text just says gym no trash talk this time"),
   N("roxy in the ring with somebody else"),
   N("no score calls phone still in her bag"),

   N("other fighter lands hard"),

   N("roxy resets her feet doesnt make a sound"),
   N("bell rings she climbs out slow"),
   U(`Hey Roxy, are you okay?`),

   S(R,`...I've gotten used to it.`),

   S(R,"show me your left"),S(R,"you fix it or what"),
   U(`It’s feeling better..thanks.`),
   S(R,"better aint fixed"),S(R,"thursday")],
   choices:[{label:'TOSS HER A TOWEL',next:'after'}]},
  after:{lines:[
   N("takes the towel keeps it doesnt look up"),
   N("buys two waters hands rich one"),
   S(R,"dont start"),

   S(R,"thursday same time you coming right"),
   ],next:'end'},
  end:{lines:[],end:{outcome:'done',receipt:{id:'receipt',caption:'WATER ×2',vp:false}}}
 }});

 // ---- L4 · SICK DAY ----------------------------------------------------------------------------------------------------------
 add(R,4,{title:'SICK DAY',start:'texts',nodes:{
  texts:{env:'bedroom',actors:rich,title:'TEXTS',lines:[
   S(R,"cant do thursday"),U(`What happened - you good?`),S(R,"sick im fine stop"),
   N("address sent guess you going"),S(R,"dont make it weird")],next:'door'},
  door:{env:'f15_roxy_apartment',actors:her,title:"ROXY'S APARTMENT",lines:[
   N("rich brings beef curry cubes big as fists"),
   N("roxy answers wrapped in a blanket"),
   S(R,"food? damn you made it weird"),

   S(R,"why the beef built like that"),S(R,"dont change it though"),

   N("semester countdown dog calendar gloves by the door thats roxy"),
   N("she eats then reaches for her phone"),
   S(R,"how much"),
   U(`Roxy i got this please - my ego needs this`),
   S(R,"your ego gonna live"),S(R,"im paying dont argue with a sick woman"),
   N("amount typed thumb over send"),
   S(R,"pick a terrible vampire movie"),

   N("movie vampire hisses at a cross"),
   S(R,"yall really do that"),S(R,"writing that down"),
   N("second movie her head on richs shoulder payment still unsent"),
   N("roxy asleep finally off the clock")],
   // Rich's food. The script authors no amount, so none is invented (tunable MONEY.roxyL4Curry, default 0).
   enter:()=>{global.RAF15.payOnce('F15_ROXY_L4','curry',global.RAF15Tunables.MONEY.roxyL4Curry);},
   choices:[{label:'SET HER PHONE ON THE TABLE, UNTOUCHED',next:'wake'}]},
  wake:{lines:[
   N("credits roxy sees the payment never sent"),
   N("leaves the phone alone"),
   S(R,"you stayed huh"),S(R,"stay for the next one if you want"),
   S(R,"dont read into it"),S(R,"okay a little"),
   N("looks at his mouth hides hers in the blanket"),
   S(R,"id kiss you but im contagious"),S(R,"rain check my treat"),
   U(`I love being sick, it was actually my major in college.`),
   N("laugh turns into a cough"),
   S(R,"dont make me laugh im sick as hell"),
   N("next movie starts")],next:'end'},
  end:{lines:[],end:{outcome:'done',receipt:{id:'receipt',caption:'PAID BY: RICH. (she fell asleep before she could fix that)',vp:false}}}
 }});
})(window);
