(function(){
 'use strict';
 const {RC,S,N,E}=RAContent;const D=RAAdventures.define;const T=()=>RANewOgaTunables;
 const m1Success=route=>A=>{A.set('m1Route',route);RANewOga.completeM1(route);};

 // RC2 (OL-063, ECONOMY_DELTA): the JUG THE PLUG window opens on Day 3 and stays open through Day 24 (was Days 8-12).
 const m1Window=L=>L.day>=(window.RAEcon?.newOgaM1?.fromDay??8)&&L.day<=(window.RAEcon?.newOgaM1?.toDay??12);
 D({id:'NEW_OGA_M1',title:'JUG THE PLUG',lane:'money',memoryType:'money',start:'pitch',
  available:L=>m1Window(L)&&L.life.newOga.status==='unstarted'&&(L.done('A08')||L.money<40000),
  testSetup:ctx=>{ctx.RAState.patch('life.world.day',8);ctx.RAState.patch('life.newOga.status','unstarted');ctx.RAState.patch('life.adventures.records.A08',{status:'completed',count:1,completedDay:7});},
  nodes:{
   pitch:{env:'bedroom',actors:{left:'rich'},title:'VAMPGPT · WAKE',lines:[N('Rich came to Los Angeles for music. He wants his music to pay his way. VampGPT has another idea.'),S('vampgpt',"oga. you're cooking noodles for tips."),S('vampgpt',"i have an idea. you won't like it."),RC('what.'),S('vampgpt','jug the plug.'),RC('…brother. why would I jug the plug.'),S('vampgpt',"it's just an idea. you're tired of the ramen. the ramen is tired of you.")],
    choices:[{label:"WHO'S THE PLUG?",next:'brief'},{label:'NAH',next:'nah'},{label:'SAY LESS.',next:'table'}]},
   brief:{lines:[S('vampgpt','Smallie sells Blood X out of a boba shop. back table. always eating.'),S('vampgpt','cousin in the parking lot.'),N('Blood X is synthetic blood. Vampires buy it instead of hunting people. The cases are valuable because the city is hungry.'),S('vampgpt','cousin in the parking lot. easy money.'),N('Easy money is VampGPT\'s opinion. The cases belong to somebody.')],next:'table'},
   nah:{end:{outcome:'backout',fx:()=>RANewOga.backOutM1(),memory:{text:'left the NEW OGA idea alone',lane:'money'}}},
   table:{env:'boba_shop',actors:{left:'rich',right:'smallie'},title:'BOBA SHOP · BACK TABLE',lines:[E('smallie','Smallie is at the back table. the Blood X is beside him.',{narration:true}),RC("say big bro, gonna need to leave that here"),S('smallie',"please man you cant do this i need this for my student loans")],choices:[
    {label:'STICK-UP',next:'fight_smallie'},
    {label:'SWITCH THE BAG',sub:'Requires Kiki friendship: COOL or closer. She keeps Smallie talking.',when:L=>L.level('kiki')>=2,hideLocked:false,next:'switch'},
    {label:'GRAB AND GO',sub:'Requires a car for the getaway.',when:L=>(L.life.ownership.cars||[]).length>0,hideLocked:false,next:'touge'},
    {label:'BUY A BOBA AND LEAVE',next:'leave'}
   ]},
   fight_smallie:{fight:{enemy:'smallie',params:{env:'boba_shop',intro:'SMALLIE · 50 HP'},win:'cousin_arrives',lose:'table',run:'table'}},
   cousin_arrives:{actors:{left:'rich',right:'smallie_cousin',farRight:'smallie_cousin_girlfriend'},lines:[N('Smallie\'s cousin comes in with his girlfriend, Imani. She is twenty-five, off work, and very much not here for this.'),S('smallie_cousin_girlfriend','You said boba. Not a fight.'),S('smallie_cousin','That\'s my cousin.'),S('smallie_cousin_girlfriend','Then help him. I decide where I go.')],enter:A=>{RARelations.meet('smallie_cousin_girlfriend','new_oga_m1');},next:'fight_cousin'},
   fight_cousin:{fight:{enemy:'smallie_cousin',params:{env:'boba_shop',intro:"SMALLIE'S COUSIN · 40 HP"},win:'stick_done',lose:'table',run:'table'}},
   stick_done:{actors:{left:'rich',right:'smallie_cousin_girlfriend'},enter:A=>RARelations.meet('smallie_cousin_girlfriend','new_oga_m1'),lines:[N('The cousin is down. Imani checks on him before looking at Rich.'),S('smallie_cousin_girlfriend','You took the cases. You do not get to take me.')],next:'imani_choice'},
   imani_choice:{choices:[{label:'ASK IF SHE WANTS TO TALK',next:'imani_ask'},{label:'YOU COMING WITH ME TOO?',next:'imani_messy'},{label:'LEAVE HER ALONE',next:'imani_leave'}]},
   imani_ask:{lines:[S('smallie_cousin_girlfriend','Not tonight. I have a boyfriend and he needs help. If that changes, I decide what happens next.'),N('Rich leaves her a way to reach him. She does not promise to use it.')],enter:A=>{RARelations.setFlag('smallie_cousin_girlfriend','m1Approach','asked');RARelations.memory('smallie_cousin_girlfriend','m1_asked_and_listened');},next:'stick_receipt'},
   imani_messy:{lines:[S('smallie_cousin_girlfriend','With the man who just robbed my boyfriend\'s cousin? Are you hearing yourself?'),N('She turns away. Rich got the bag and absolutely did not get the girl.')],enter:A=>{RARelations.setFlag('smallie_cousin_girlfriend','m1Approach','claimed');RARelations.memory('smallie_cousin_girlfriend','m1_refused_claim');},next:'stick_receipt'},
   imani_leave:{lines:[N('Rich steps aside. Imani stays to help the cousin.')],enter:A=>RARelations.setFlag('smallie_cousin_girlfriend','m1Approach','left'),next:'stick_receipt'},
   stick_receipt:{lines:[N('the route is loud. the Blood X cases, cash, and chain leave with Rich.'),N('That money has an owner who will notice.')],end:{outcome:'stick_up',fx:m1Success('STICK_UP'),memory:{text:'JUG THE PLUG - stick-up route',lane:'money'}}},
   switch:{lines:[N('Kiki keeps Smallie talking while Rich switches the bag. quiet and clean.')],end:{outcome:'switch_the_bag',fx:m1Success('SWITCH_THE_BAG'),memory:{text:'JUG THE PLUG — switched the bag',lane:'money'}}},
   touge:{lines:[N('the bag is in the car. Smallie and his cousin are behind him.')],minigame:{id:'touge',params:()=>({course:'angeles_crest',car:RACars.toTouge(RALife.ownedCars()[0]),tandem:{rival:'SMALLIE',role:'chase',threshold:T().touge.SUCCESS_THRESHOLD},durationSeconds:T().touge.AUTHORED_DURATION_SECONDS}),next:(A,r)=>r.outcome==='win'?'touge_done':'table'}},
   touge_done:{lines:()=>[N(`${T().touge.AUTHORED_DURATION_SECONDS} seconds and bro still cant catch me`)],end:{outcome:'touge_escape',fx:m1Success('TOUGE_ESCAPE'),memory:{text:'JUG THE PLUG — escaped by TOUGE',lane:'cars'}}},
   leave:{lines:[N('Rich buys a boba and leaves. the arc closes here.')],end:{outcome:'backout',fx:()=>{RALife.spend(RACombatData.ITEMS.boba.price);RALife.addItem('boba',1);RANewOga.backOutM1();},memory:{text:'bought a boba and left JUG THE PLUG',lane:'money'}}}
  }});

 D({id:'NEW_OGA_M2',title:'THE INTERVIEW',lane:'money',memoryType:'money',start:'voice',available:L=>L.life.newOga.status==='awaiting_interview'&&L.day>L.life.newOga.lastMissionDay,
  testSetup:ctx=>ctx.RAState.patch('life.newOga',{...ctx.RAState.get().life.newOga,status:'awaiting_interview',mission:1,lastMissionDay:1}),nodes:{
   voice:{env:'bedroom',actors:{left:'rich'},title:'UNKNOWN VOICE NOTE',lines:[S('gbenga',"O ma ṣe o"),S(null,'Hello. Hello. Rich.'),S(null,'Hello. Can you hear me. Hello.')],next:'arrive'},
   arrive:{env:'gbenga_rentals',actors:{left:'rich',right:'gbenga'},title:'GBENGA EVENT RENTALS · INGLEWOOD',lines:[E('gbenga','plastic chairs, coolers, canopies. Gbenga waits inside the warehouse.',{narration:true})],next:'questions'},
   questions:{lines:[S('gbenga','Where do you see yourself in five years?'),S('gbenga','What is your greatest weakness?'),S('gbenga','Why did you rob my boy?')],choices:[
    {label:'HONEST',fx:()=>RANewOga.answerM2('honest'),next:'debt'},
    {label:'FLEX',fx:()=>RANewOga.answerM2('flex'),next:'flex_voice'},
    {label:'MY GREATEST WEAKNESS IS FISH',octopus:true,fx:()=>RANewOga.answerM2('fish'),next:'debt'}
   ]},
   flex_voice:{lines:[RC("i own land uncle castle even"),S('gbenga',"the only reason i dont open the blinds to show you the sun is because my rags are in the wash")],next:'debt'},
   debt:{lines:[S('gbenga','Smallie sells for me. Those cases were mine.'),N('The theft made six thousand in cash. Gbenga counts the missing stock too: twenty thousand dollars owed.'),N('Gbenga puts the choice on the desk: repay twenty thousand dollars, or work off the debt.'),N('The party-rental business moves his Blood X too.')],choices:[
    {label:'PAY $20,000 · END',when:L=>L.money>=20000,hideLocked:false,next:'pay'},
    {label:'WORK OFF THE DEBT · CONTINUE',next:'work'}
   ]},
   pay:{end:{outcome:'paid_and_ended',fx:()=>RANewOga.payM2(),memory:{text:'paid Gbenga and ended the NEW OGA arc',lane:'money'}}},
   work:{lines:[N('Rank 1: INTERN. Gbenga hands Rich a business card. jobs arrive by voice note.'),N('Rich came to LA to make music. Now his studio time has a supervisor with a Bluetooth earpiece.')],end:{outcome:'intern',fx:()=>RANewOga.workOffM2(),memory:{text:'became a Rank 1 NEW OGA intern',lane:'money'}}}
  }});

 D({id:'NEW_OGA_M3',title:'CANOPY DUTY',lane:'money',memoryType:'money',start:'voice',available:L=>L.life.newOga.status==='intern'&&L.life.newOga.mission===2&&L.day>L.life.newOga.lastMissionDay,
  testSetup:ctx=>ctx.RAState.patch('life.newOga',{...ctx.RAState.get().life.newOga,status:'intern',mission:2,rank:1,title:'INTERN',businessCard:true,lastMissionDay:1}),nodes:{
   voice:{env:'gbenga_rentals',actors:{left:'rich',right:'gbenga'},title:'VOICE NOTE · CANOPY DUTY',lines:[N('sixty chairs, one canopy, and six Blood X coolers are assigned to a Carson owambe.'),S('gbenga','Rental business first. Chairs straight. Coolers cold.'),N('The party equipment is real work. The synthetic blood travels with it.')],next:'chairs'},
   chairs:{minigame:{id:'slurp',params:()=>({canopyDuty:true,totalChairs:T().chairs.AUTHORED_TOTAL,durationMs:T().chairs.DURATION_MS,bundleSize:T().chairs.BUNDLE_SIZE}),next:(A,r)=>{A.set('chairs',r.data||{});return 'critique';}}},
   critique:{env:'carson_owambe',actors:{left:'rich',right:'auntie'},title:'CARSON OWAMBE',lines:A=>A.vars.chairs?.success?[N('all sixty chairs are stacked and carried in.')]:[N('the aunties critique the chair stacks. the rank is not blocked.')],next:'delivery'},
   delivery:{lines:[N('the chairs are inside. the six Blood X coolers are still in the car.')],choices:[
    {label:'COMPLETE THE DELIVERY',next:'complete'},
    {label:'LEAVE THE COOLERS · CHAIRS ONLY',next:'backout'}
   ]},
   complete:{lines:[N('the full delivery is complete. Gbenga pays three thousand dollars. an auntie forces a plate of jollof into Rich’s hands.')],next:'carlos_full'},
   carlos_full:{env:'carson_owambe',actors:{left:'rich',right:'carlos'},lines:[N('Carlos recognizes Rich from the Grave garage clips. He brings over a cold drink and films Rich trying to carry the jollof without losing a grain.'),S('carlos','I got the angle, bro. You look expensive. Even with the chairs.'),N('They trade handles. Carlos sends the clip, then stays to help fold the last canopy.')],end:{outcome:'complete',fx:()=>RANewOga.completeM3('complete'),memory:{text:'completed CANOPY DUTY; Carlos helped and filmed the night',lane:'money'}}},
   backout:{lines:[N('the coolers stay in the car. only the chairs are delivered.'),N('Gbenga will hear about the missing stock.')],next:'carlos_partial'},
   carlos_partial:{env:'carson_owambe',actors:{left:'rich',right:'carlos'},lines:[N('Carlos recognizes Rich from the garage clips and brings him a cold drink.'),S('carlos','You carry sixty chairs? I would have left at chair seven.'),N('He helps fold the canopy and sends Rich the clip. They trade handles before leaving.')],end:{outcome:'chairs_only',fx:()=>RANewOga.completeM3('backout'),memory:{text:'delivered only chairs; Carlos helped at the owambe',lane:'money'}}}
  }});

 // Assistant candidate: an adult can decline Rich, and the later scene remembers it.
 D({id:'IMANI_BOBA',title:'IMANI, ON HER TERMS',lane:'people',memoryType:'people',start:'arrive',
  available:L=>L.life.newOga.m1Rewarded&&L.day>L.life.newOga.lastMissionDay&&RARelations.met('smallie_cousin_girlfriend')&&!RARelations.flag('smallie_cousin_girlfriend','followupResolved'),nodes:{
   arrive:{env:'boba_shop',actors:{left:'rich',right:'smallie_cousin_girlfriend'},title:'BOBA SHOP - ANOTHER NIGHT',lines:()=>{
    const approach=RARelations.flag('smallie_cousin_girlfriend','m1Approach');
    return approach==='claimed'?[S('smallie_cousin_girlfriend','You tried to collect me with the cases. No.'),N('She remembers exactly what Rich said. This is not a second attempt.')]:approach==='asked'?[S('smallie_cousin_girlfriend','I said I would decide. I ended that relationship on my own. That is not a prize you won.'),S('smallie_cousin_girlfriend','We can talk here. One conversation. See how it goes.')]:[S('smallie_cousin_girlfriend','You left me alone when I asked. Keep doing that.'),N('She gets her drink. Rich gives her room.')];},
    next:()=>RARelations.flag('smallie_cousin_girlfriend','m1Approach')==='asked'?'choice':'leave'},
   choice:{choices:[{label:'TALK. NO EXPECTATIONS.',next:'talk'},{label:'SO I WON THEN?',next:'refused'},{label:'LET HER HAVE HER NIGHT',next:'leave'}]},
   talk:{lines:[S('smallie_cousin_girlfriend','What brought you to LA?'),N('Rich talks about his music. Imani listens, then tells him what she wants: somebody who can hear no without turning it into a challenge.'),S('smallie_cousin_girlfriend','You can send me a song. A song, Rich. Not a plan for my life.')],end:{outcome:'conversation',fx:()=>{RARelations.setFlag('smallie_cousin_girlfriend','followupResolved',true);RARelations.setFlag('smallie_cousin_girlfriend','musicInvitation',true);RARelations.memory('smallie_cousin_girlfriend','boba_on_her_terms');},memory:{text:'talked with Imani at boba, on her terms',lane:'people'}}},
   refused:{lines:[S('smallie_cousin_girlfriend','No. And now the conversation is over.'),N('She leaves. Rich has no new girlfriend, companion or claim on her time.')],end:{outcome:'refused',fx:()=>{RARelations.setFlag('smallie_cousin_girlfriend','followupResolved',true);RARelations.memory('smallie_cousin_girlfriend','boba_refused_claim');},memory:{text:'Imani ended the conversation after Rich claimed a win',lane:'people'}}},
   leave:{end:{outcome:'left',fx:()=>RARelations.setFlag('smallie_cousin_girlfriend','followupResolved',true),memory:{text:'gave Imani space at the boba shop',lane:'people'}}}
  }});

 RAWakeTriggers.define([
  {adventure:'NEW_OGA_M1',priority:85,when:L=>m1Window(L)&&L.life.newOga.status==='unstarted'&&(L.done('A08')||L.money<40000)},
  {adventure:'NEW_OGA_M2',priority:84,when:L=>L.life.newOga.status==='awaiting_interview'&&L.day>L.life.newOga.lastMissionDay},
  {adventure:'NEW_OGA_M3',priority:83,when:L=>L.life.newOga.status==='intern'&&L.life.newOga.mission===2&&L.day>L.life.newOga.lastMissionDay}
 ]);
})();
