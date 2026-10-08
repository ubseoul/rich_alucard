(function(){
 'use strict';
 const {S,N,E}=RAContent;const D=RAAdventures.define;const T=()=>RANewOgaTunables;
 const hasCar=L=>(L.life.ownership.cars||[]).some(c=>c.ownershipStatus!=='sold');
 const m4Ready=L=>L.life.newOga.status==='intern'&&L.life.newOga.mission===3&&L.life.newOga.carlosMutual&&hasCar(L)&&L.day>L.life.newOga.lastMissionDay;
 const alternativeReady=L=>L.life.newOga.alternativePending&&L.day>L.life.newOga.lastMissionDay;
 const escapeThreshold=()=>RAMinigameLogic.touge.noviceBotMedianScore(T().m4.ESCAPE_DURATION_SECONDS)*T().m4.LOW_SCORE_RATIO;
 const escapeBand=result=>result?.quit||result?.error||result?.outcome==='fail'||result?.outcome==='lose'||result?.data?.crashed?'LOW':Number(result?.score)<escapeThreshold()?'LOW':'HIGH';
 const backout=outcome=>()=>RANewOga.completeM4(outcome);

 D({id:'NEW_OGA_M4',title:'SET UP CARLOS',lane:'money',memoryType:'money',start:'voice',available:m4Ready,
  testSetup:ctx=>{ctx.RAState.patch('life.world.day',10);ctx.RAState.patch('life.newOga',{...ctx.RAState.get().life.newOga,status:'intern',mission:3,rank:1,title:'INTERN',businessCard:true,m3Outcome:'complete',carlosMutual:true,carlosMutualDay:9,lastMissionDay:9});ctx.RALife.addCar({id:'toyota_supra_mk4_001',short:'SUPRA'});},nodes:{
   voice:{env:'bedroom',actors:{left:'rich'},title:'VOICE NOTE · SET UP CARLOS',lines:[S('gbenga','Your friend Carlos. From the Instagram. Bring him to this address.'),S('gbenga','Tell him it is a party. It is not a party.'),S('gbenga','He owes me money. He has been dodging me.'),N('The man who helped Rich with the canopy is now the job. Gbenga wants a debt collected, not a guest.')],next:'beat1'},
   beat1:{env:'bedroom',actors:{left:'rich',right:'carlos'},title:'BEAT 1 · THE DM',lines:[N('Carlos answers the VampGram message. He thinks the warehouse is a party.')],choices:[
    {label:'SEND THE ADDRESS',next:'beat2'},
    {label:'NAH, NOT HIM.',next:'beat1_out'}
   ]},
   beat1_out:{lines:[N('Rich asks for a replacement job instead.')],end:{outcome:'beat_1',fx:backout('beat_1'),memory:{text:'backed out of SET UP CARLOS before the pickup',lane:'money'}}},
   beat2:{env:'street_night',actors:{left:'rich',right:'carlos'},title:'BEAT 2 · THE PICKUP',lines:[E('carlos','Carlos gets in expecting a party. He brought drinks for both of them.',{narration:true}),S('carlos','I still got your canopy clip. Tonight we get one where you are not working.'),N('Rich knows who is waiting at the address. Carlos does not.')],choices:[
    {label:'DRIVE TO THE WAREHOUSE',next:'beat3'},
    {label:'TEXT CARLOS A WARNING',next:'beat2_out'}
   ]},
   beat2_out:{lines:[N('Rich tells Carlos who is really waiting.'),N('Carlos never shows at the warehouse.'),S('carlos','You could have said nothing. You did not. I remember that.')],end:{outcome:'beat_2',fx:backout('beat_2'),memory:{text:'warned Carlos before the warehouse',lane:'money'}}},
   beat3:{env:'street_night',actors:{left:'rich',right:'carlos'},title:'BEAT 3 · THE CAR',lines:()=>{const car=RALife.ownedCars()[0];return [N(car?.id===RACars.SUPRA?'the Supra heads toward Koreatown.':'the car heads toward Koreatown.')]},choices:[
    {label:'KEEP DRIVING',next:'beat4'},
    {label:'FAKE CAR TROUBLE',octopus:true,next:'beat3_out'}
   ]},
   beat3_out:{lines:[N('The car-trouble act works. Carlos walks home thinking the car is haunted.')],end:{outcome:'beat_3',fx:backout('beat_3'),memory:{text:'sent Carlos home before the warehouse',lane:'money'}}},
   beat4:{env:'gbenga_rentals',actors:{left:'rich',right:'carlos'},title:'BEAT 4 · THE DOOR',lines:[N('At the warehouse door, Carlos realizes there is no party.')],choices:[
    {label:'WALK HIM IN',next:'walk_in'},
    {label:'TELL CARLOS TO RUN',next:'run'}
   ]},
   walk_in:{actors:{left:{id:'carlos',state:'betrayed'},right:'gbenga'},lines:[S('carlos','Bro. You said party.'),S('gbenga','you go try and try to chop my dollar'),S('gbenga','chop my money'),N('Gbenga pulls out a belt. Carlos looks at the belt, then at the open aisle.')],next:'belt'},
   belt:{env:'gbenga_rentals',actors:{left:{id:'carlos',state:'betrayed'},right:'gbenga'},presentation:'carlos_debt_belt',lines:[N('Carlos sees a gap between the canopies. Gbenga coils the belt. Both of them look at the aisle.')],next:'debt_after'},
   debt_after:{actors:{left:{id:'carlos',state:'canopy_apron'},right:'gbenga'},lines:[S('carlos','AAAAA—UNCLE! THE CHAIRS!'),N('The chase ends beside the stacked chairs. The debt has not gone anywhere.'),S('gbenga','Canopies. Chairs. Until the money is paid.'),N('Carlos puts on the rental apron. His phone buzzes once: Rich is unfollowed.'),N('Rich gets the promotion and pay. Carlos remembers the cold drink and who brought him here.')],end:{outcome:'walk_in',fx:()=>RANewOga.completeM4('walk_in'),memory:{text:'walked Carlos into Gbenga\'s belt chase and debt work',lane:'money'}}},
   run:{env:'street_night',actors:{left:'rich',right:'carlos'},lines:[N('Carlos runs on foot. Rich follows in the car, making the escape look close.')],minigame:{id:'touge',params:()=>({course:'warehouse_alleys',car:RACars.toTouge(RALife.ownedCars()[0]),durationSeconds:T().m4.ESCAPE_DURATION_SECONDS,escapeRunner:'Carlos'}),next:(A,result)=>{const band=escapeBand(result);A.set('m4TougeBand',band);return band==='LOW'?'run_low':'run_high';}}},
   run_low:{lines:[N('The excuse lands. Carlos is gone. Gbenga is left holding the belt.'),N('Carlos messages Rich from safety: the next drink is still on him.')],end:{outcome:'run_low',fx:A=>RANewOga.completeM4('run',{tougeBand:'LOW'}),memory:{text:'helped Carlos escape through the warehouse alleys',lane:'cars'}}},
   run_high:{lines:[S('gbenga','You nearly had him?!'),N('Carlos is still gone. Gbenga has the belt and nobody to chase.'),N('The escape was loud. Carlos still knows Rich let him go.')],end:{outcome:'run_high',fx:A=>RANewOga.completeM4('run',{tougeBand:'HIGH'}),memory:{text:'helped Carlos escape through the warehouse alleys',lane:'cars'}}}
  }});

 D({id:'NEW_OGA_ALTERNATIVE',title:'THE ALTERNATIVE',lane:'money',memoryType:'money',start:'voice',available:alternativeReady,
  testSetup:ctx=>{ctx.RAState.patch('life.world.day',11);ctx.RAState.patch('life.newOga',{...ctx.RAState.get().life.newOga,status:'alternative_pending',mission:4,rank:1,title:'INTERN',carlosMutual:true,m4Outcome:'beat_1',alternativePending:true,lastMissionDay:10});},nodes:{
   // PRE-FCPB restoration (F03, OL-011): with F03.new_oga_ladder_close ON the authored chair activity replaces the scene fallback,
   // through the SAME accepted SLURP canopyDuty harness and critique lines NEW_OGA_M3 uses (no second chair system, no new text).
   // With the flag OFF the frozen fallback is byte-identical to the accepted build.
   voice:{env:'gbenga_rentals',actors:{left:'rich',right:'gbenga'},title:'THE ALTERNATIVE · VOICE NOTE',lines:[N("Another GBENGA'S EVENT RENTALS delivery is waiting.")],next:()=>window.RAFeatures?.enabled?.('F03.new_oga_ladder_close')?'chairs':'delivery'},
   delivery:{lines:[N('The rental delivery is completed as a scene.')],end:{outcome:'complete',fx:()=>RANewOga.completeAlternative(),memory:{text:'completed The Alternative delivery',lane:'money'}}},
   chairs:{minigame:{id:'slurp',params:()=>({canopyDuty:true,totalChairs:T().chairs.AUTHORED_TOTAL,durationMs:T().chairs.DURATION_MS,bundleSize:T().chairs.BUNDLE_SIZE}),next:(A,r)=>{A.set('chairs',r?.data||{});return 'critique';}}},
   critique:{env:'carson_owambe',actors:{left:'rich',right:'auntie'},title:'THE ALTERNATIVE · DELIVERY',lines:A=>A.vars.chairs?.success?[N('all sixty chairs are stacked and carried in.')]:[N('the aunties critique the chair stacks. the rank is not blocked.')],next:'complete'},
   complete:{lines:[N('The rental delivery is completed.')],end:{outcome:'complete',fx:()=>RANewOga.completeAlternative(),memory:{text:'completed The Alternative delivery',lane:'money'}}}
  }});

 RAWakeTriggers.define([
  {adventure:'NEW_OGA_M4',priority:82,when:m4Ready},
  {adventure:'NEW_OGA_ALTERNATIVE',priority:81,when:alternativeReady}
 ]);
 window.RANewOgaM4={m4Ready,alternativeReady,escapeThreshold,escapeBand};
})();
