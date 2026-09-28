(function(){
 'use strict';
 const {RC,S,N,E}=RAContent;const D=RAAdventures.define;const T=()=>RANewOgaTunables;
 const m1Success=route=>A=>{A.set('m1Route',route);RANewOga.completeM1(route);};

 D({id:'NEW_OGA_M1',title:'JUG THE PLUG',lane:'money',memoryType:'money',start:'pitch',
  available:L=>L.day>=8&&L.day<=12&&L.life.newOga.status==='unstarted'&&(L.done('A08')||L.money<40000),
  testSetup:ctx=>{ctx.RAState.patch('life.world.day',8);ctx.RAState.patch('life.newOga.status','unstarted');ctx.RAState.patch('life.adventures.records.A08',{status:'completed',count:1,completedDay:7});},
  nodes:{
   pitch:{env:'bedroom',actors:{left:'rich'},title:'VAMPGPT · WAKE',lines:[S(null,"oga. you're cooking noodles for tips. i have an idea. you won't like it."),RC('what.'),S(null,'jug the plug.'),RC('…brother. why would I jug the plug.'),S(null,"it's just an idea. you're tired of the ramen. the ramen is tired of you.")],
    choices:[{label:"WHO'S THE PLUG?",next:'brief'},{label:'NAH',next:'nah'},{label:'SAY LESS.',next:'table'}]},
   brief:{lines:[N('Smallie sells Blood X out of a boba shop. back table. always eating. cousin in the parking lot.')],next:'table'},
   nah:{end:{outcome:'backout',fx:()=>RANewOga.backOutM1(),memory:{text:'left the NEW OGA idea alone',lane:'money'}}},
   table:{env:'boba_shop',actors:{left:'rich',right:'smallie'},title:'BOBA SHOP · BACK TABLE',lines:[E('smallie','Smallie is at the back table. the Blood X is beside him.')],choices:[
    {label:'STICK-UP',next:'fight_smallie'},
    {label:'SWITCH THE BAG',sub:'KIKI · COOL',when:L=>L.level('kiki')>=2,hideLocked:false,next:'switch'},
    {label:'GRAB AND GO',when:L=>(L.life.ownership.cars||[]).length>0,hideLocked:false,next:'touge'},
    {label:'BUY A BOBA AND LEAVE',next:'leave'}
   ]},
   fight_smallie:{fight:{enemy:'smallie',params:{env:'boba_shop',intro:'SMALLIE · 50 HP'},win:'fight_cousin',lose:'table',run:'table'}},
   fight_cousin:{fight:{enemy:'smallie_cousin',params:{env:'boba_shop',intro:"SMALLIE'S COUSIN · 40 HP"},win:'stick_done',lose:'table',run:'table'}},
   stick_done:{lines:[N('the route is loud. the Blood X cases, cash, and chain leave with Rich.')],end:{outcome:'stick_up',fx:m1Success('STICK_UP'),memory:{text:'JUG THE PLUG — stick-up route',lane:'money'}}},
   switch:{lines:[N('Kiki keeps Smallie talking while Rich switches the bag. quiet and clean.')],end:{outcome:'switch_the_bag',fx:m1Success('SWITCH_THE_BAG'),memory:{text:'JUG THE PLUG — switched the bag',lane:'money'}}},
   touge:{lines:[N('the bag is in the car. Smallie and his cousin are behind him.')],minigame:{id:'touge',params:()=>({course:'angeles_crest',car:RACars.toTouge(RALife.ownedCars()[0]),tandem:{rival:'SMALLIE',role:'chase',threshold:T().touge.SUCCESS_THRESHOLD},durationSeconds:T().touge.AUTHORED_DURATION_SECONDS}),next:(A,r)=>r.outcome==='win'?'touge_done':'table'}},
   touge_done:{lines:()=>[N(`${T().touge.AUTHORED_DURATION_SECONDS} seconds. the pursuit falls away.`)],end:{outcome:'touge_escape',fx:m1Success('TOUGE_ESCAPE'),memory:{text:'JUG THE PLUG — escaped by TOUGE',lane:'cars'}}},
   leave:{lines:[N('Rich buys a boba and leaves. the arc closes here.')],end:{outcome:'backout',fx:()=>{RALife.spend(RACombatData.ITEMS.boba.price);RALife.addItem('boba',1);RANewOga.backOutM1();},memory:{text:'bought a boba and left JUG THE PLUG',lane:'money'}}}
  }});

 D({id:'NEW_OGA_M2',title:'THE INTERVIEW',lane:'money',memoryType:'money',start:'voice',available:L=>L.life.newOga.status==='awaiting_interview'&&L.day>L.life.newOga.lastMissionDay,
  testSetup:ctx=>ctx.RAState.patch('life.newOga',{...ctx.RAState.get().life.newOga,status:'awaiting_interview',mission:1,lastMissionDay:1}),nodes:{
   voice:{env:'bedroom',actors:{left:'rich'},title:'UNKNOWN VOICE NOTE',lines:[S(null,'Hello. Hello. Rich. Hello. Can you hear me. Hello.')],next:'arrive'},
   arrive:{env:'gbenga_rentals',actors:{left:'rich',right:'gbenga'},title:'GBENGA EVENT RENTALS · INGLEWOOD',lines:[E('gbenga','plastic chairs, coolers, canopies. Gbenga waits inside the warehouse.')],next:'questions'},
   questions:{lines:[S('gbenga','Where do you see yourself in five years?'),S('gbenga','What is your greatest weakness?'),S('gbenga','Why did you rob my boy?')],choices:[
    {label:'HONEST',fx:()=>RANewOga.answerM2('honest'),next:'debt'},
    {label:'FLEX',fx:()=>RANewOga.answerM2('flex'),next:'debt'},
    {label:'MY GREATEST WEAKNESS IS FISH',octopus:true,fx:()=>RANewOga.answerM2('fish'),next:'debt'}
   ]},
   debt:{lines:[N('Gbenga puts the choice on the desk: repay twenty thousand dollars, or work off the debt.')],choices:[
    {label:'PAY $20,000 · END',when:L=>L.money>=20000,hideLocked:false,next:'pay'},
    {label:'WORK OFF THE DEBT · CONTINUE',next:'work'}
   ]},
   pay:{end:{outcome:'paid_and_ended',fx:()=>RANewOga.payM2(),memory:{text:'paid Gbenga and ended the NEW OGA arc',lane:'money'}}},
   work:{lines:[N('Rank 1: INTERN. Gbenga hands Rich a business card. jobs arrive by voice note.')],end:{outcome:'intern',fx:()=>RANewOga.workOffM2(),memory:{text:'became a Rank 1 NEW OGA intern',lane:'money'}}}
  }});

 D({id:'NEW_OGA_M3',title:'CANOPY DUTY',lane:'money',memoryType:'money',start:'voice',available:L=>L.life.newOga.status==='intern'&&L.life.newOga.mission===2&&L.day>L.life.newOga.lastMissionDay,
  testSetup:ctx=>ctx.RAState.patch('life.newOga',{...ctx.RAState.get().life.newOga,status:'intern',mission:2,rank:1,title:'INTERN',businessCard:true,lastMissionDay:1}),nodes:{
   voice:{env:'gbenga_rentals',actors:{left:'rich',right:'gbenga'},title:'VOICE NOTE · CANOPY DUTY',lines:[N('sixty chairs, one canopy, and six Blood X coolers are assigned to a Carson owambe.')],next:'chairs'},
   chairs:{minigame:{id:'slurp',params:()=>({canopyDuty:true,totalChairs:T().chairs.AUTHORED_TOTAL,durationMs:T().chairs.DURATION_MS,bundleSize:T().chairs.BUNDLE_SIZE}),next:(A,r)=>{A.set('chairs',r.data||{});return 'critique';}}},
   critique:{env:'carson_owambe',actors:{left:'rich',right:'auntie'},title:'CARSON OWAMBE',lines:A=>A.vars.chairs?.success?[N('all sixty chairs are stacked and carried in.')]:[N('the aunties critique the chair stacks. the rank is not blocked.')],next:'delivery'},
   delivery:{lines:[N('the chairs are inside. the six Blood X coolers are still in the car.')],choices:[
    {label:'COMPLETE THE DELIVERY',next:'complete'},
    {label:'LEAVE THE COOLERS · CHAIRS ONLY',next:'backout'}
   ]},
   complete:{lines:[N('the full delivery is complete. Gbenga pays three thousand dollars. an auntie forces a plate of jollof into Rich’s hands.')],end:{outcome:'complete',fx:()=>RANewOga.completeM3('complete'),memory:{text:'completed CANOPY DUTY in full',lane:'money'}}},
   backout:{lines:[N('the coolers stay in the car. only the chairs are delivered.')],end:{outcome:'chairs_only',fx:()=>RANewOga.completeM3('backout'),memory:{text:'delivered only the chairs on CANOPY DUTY',lane:'money'}}}
  }});

 RAWakeTriggers.define([
  {adventure:'NEW_OGA_M1',priority:85,when:L=>L.day>=8&&L.day<=12&&L.life.newOga.status==='unstarted'&&(L.done('A08')||L.money<40000)},
  {adventure:'NEW_OGA_M2',priority:84,when:L=>L.life.newOga.status==='awaiting_interview'&&L.day>L.life.newOga.lastMissionDay},
  {adventure:'NEW_OGA_M3',priority:83,when:L=>L.life.newOga.status==='intern'&&L.life.newOga.mission===2&&L.day>L.life.newOga.lastMissionDay}
 ]);
})();
