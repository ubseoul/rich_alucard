(function(){
 'use strict';
 const {S,N,E}=RAContent,D=RAAdventures.define;
 const m5Ready=L=>L.life.newOga.rank===3&&L.life.newOga.mission===4&&!L.life.newOga.m5Completed&&L.day>L.life.newOga.lastMissionDay;
 const m6Ready=L=>L.life.newOga.m5Completed&&!L.life.newOga.m6Completed&&L.day>L.life.newOga.lastMissionDay;
 const finishM5=outcome=>A=>RANewOga.completeM5({outcome,amountCaught:A.get('m5AmountCaught')||0,attention:A.get('m5Attention')||0});

 D({id:'NEW_OGA_M5',title:'THE OWAMBE COLLECTION',lane:'money',memoryType:'money',start:'voice',available:m5Ready,
  testSetup:ctx=>{ctx.RAState.patch('life.world.day',12);ctx.RAState.patch('life.newOga',{...ctx.RAState.get().life.newOga,status:'associate',mission:4,rank:3,title:'ASSOCIATE',m4Outcome:'walk_in',m4Rewarded:true,lastMissionDay:11,debt:20000});},nodes:{
   voice:{env:'bedroom',actors:{left:'rich'},title:'VOICE NOTE · THE OWAMBE COLLECTION',lines:()=>[N('Associate now.'),N('Gbenga assigns a thirty-thousand-dollar collection at Uncle Bamidele’s 60th-birthday owambe.'),N(RANewOga.current().m4Outcome==='walk_in'?'Carlos is working canopies to repay his debt. Rich\'s next job is to collect somebody else\'s.':'Rich chose another way with Carlos. Gbenga still expects this collection.'),N('The money will be sprayed on the dance floor. Catch the debt without turning the celebration into a scene.')],next:'arrival'},
   arrival:{env:'carson_owambe',actors:{left:'rich',right:'uncle_bamidele'},title:'UNCLE BAMIDELE’S 60TH',lines:[E('uncle_bamidele','Cash fills the air around Uncle Bamidele while the aunties watch the dance floor.')],choices:[
    {label:'COLLECT THE DEBT',next:'collect'},
    {label:'DANCE WITH UNCLE BAMIDELE',next:'backout'}
   ]},
   collect:{minigame:{id:'owambe_collection',params:()=>({seed:`m5-${RALife.today().day}`}),next:(A,result)=>{if(result?.quit)return 'collect';const data=result?.data||{};A.set('m5AmountCaught',data.amountCaught||0);A.set('m5Attention',data.attention||0);const synthetic={WIN:'SUCCESS',LOSE:'GREEDY',DONE:'SHORT'},raw=String(data.result||result?.outcome||'').toUpperCase(),outcome=synthetic[raw]||raw;return {SUCCESS:'success',SHORT:'short',GREEDY:'greedy',BACK_OUT:'backout'}[outcome]||'collect';}}},
   success:{lines:[N('The full collection is secured without turning the party. Gbenga gets his debt; Rich keeps the agreed cut, not the whole thirty thousand.')],end:{outcome:'success',fx:finishM5('SUCCESS'),memory:{text:'collected Uncle Bamidele\'s full owambe debt',lane:'money'}}},
   short:{lines:[N('The song ends before the full collection is secured.')],end:{outcome:'short',fx:finishM5('SHORT'),memory:{text:'left the owambe with a partial collection',lane:'money'}}},
   greedy:{actors:{left:'rich',right:'auntie'},lines:[N('The aunties turn, reclaim every bill, and end the collection.')],end:{outcome:'greedy',fx:finishM5('GREEDY'),memory:{text:'lost the owambe collection when the aunties noticed',lane:'money'}}},
   backout:{actors:{left:'rich',right:'uncle_bamidele'},lines:[N('Rich dances with Uncle Bamidele and collects nothing.'),S('gbenga','…was the jollof good?')],end:{outcome:'back_out',fx:finishM5('BACK_OUT'),memory:{text:'danced with Uncle Bamidele instead of collecting the debt',lane:'people'}}}
  }});

 D({id:'NEW_OGA_M6',title:'SENATOR',lane:'people',memoryType:'people',start:'voice',available:m6Ready,
  testSetup:ctx=>{ctx.RAState.patch('life.world.day',13);ctx.RAState.patch('life.newOga',{...ctx.RAState.get().life.newOga,status:'senator_pending',mission:5,rank:3,title:'ASSOCIATE',m5Outcome:'SUCCESS',m5AmountCaught:30000,m5Completed:true,m5Rewarded:true,lastMissionDay:12,debt:20000});},nodes:{
   voice:{env:'bedroom',actors:{left:'rich',right:'senator'},title:'VOICE NOTE · SENATOR',lines:[N('Gbenga leaves town for one night. Senator stays at Rich’s castle.')],next:A=>RALife.life().ownership.cat?'egusi':RALife.dragon()?'mazda':'bread'},
   egusi:{actors:{left:'cat',right:'senator'},lines:[N('Senator challenges Egusi. Senator loses.')],next:A=>RALife.dragon()?'mazda':'bread'},
   mazda:{actors:{left:'mazda_human',right:'senator'},lines:[N('Senator and Mazda hold a perfect standoff.')],next:'bread'},
   bread:{actors:{left:'rich',right:'senator'},lines:[N('Senator eats the Agege bread. No inventory changes hands.')],next:'care'},
   care:{minigame:{id:'hatch',params:()=>({mode:'senator'}),next:(A,result)=>{if(result?.quit)return 'care';const data=result?.data||{},care=data.care||{};A.set('m6Care',care);return data.walked===true?'walked':'lost';}}},
   walked:{actors:{left:'rich',right:'senator'},lines:[N('Senator settles on the throne for the rest of the night.')],end:{outcome:'walked',fx:A=>RANewOga.completeM6({walked:true,care:A.get('m6Care')}),memory:{text:'kept Senator safe for the night',lane:'people'}}},
   lost:{actors:{left:'rich'},lines:[N('Senator follows a squirrel into the night. Gbenga handles the recovery off-screen.')],end:{outcome:'lost',fx:A=>RANewOga.completeM6({walked:false,care:A.get('m6Care')}),memory:{text:'lost Senator during the castle care night',lane:'people'}}}
  }});

 RAWakeTriggers.define([
  {adventure:'NEW_OGA_M5',priority:80,when:m5Ready},
  {adventure:'NEW_OGA_M6',priority:79,when:m6Ready}
 ]);
 window.RANewOgaM5M6={m5Ready,m6Ready};
})();
