(function(){
 'use strict';
 const {S,N}=RAContent,D=RAAdventures.define;
 const m7Ready=L=>L.life.newOga.rank4Granted&&L.life.newOga.rank===4&&L.life.newOga.m7Eligible&&!L.life.newOga.m7Completed&&L.day>L.life.newOga.lastMissionDay;
 const finish=outcome=>()=>RANewOga.completeM7(outcome);

 D({id:'NEW_OGA_M7',title:"DINNER AT GBENGA'S",lane:'people',memoryType:'people',start:'arrival',available:m7Ready,
  testSetup:ctx=>{ctx.RAState.patch('life.world.day',14);ctx.RAState.patch('life.newOga',{...ctx.RAState.get().life.newOga,status:'senior_associate',mission:6,rank:4,title:'SENIOR ASSOCIATE',m5Completed:true,m6Completed:true,rank4Granted:true,m7Eligible:true,lastMissionDay:13});},nodes:{
   arrival:{env:'gbenga_house_dining',actors:{left:'rich',mid:'mama_gbenga',right:'gbenga'},title:"GBENGA'S HOME · LADERA HEIGHTS",lines:[N("Gbenga's home is big, warm, and full of family detail: his university diploma, his grandchildren's drawings on the fridge, and Nollywood on the television.")],next:'dinner'},
   dinner:{env:'gbenga_house_dining',actors:{left:'rich',mid:'mama_gbenga',right:'gbenga'},title:'DINNER',lines:[N("Mama Gbenga, kind and sharp, runs the house and secretly keeps the business's books. She serves Rich until he cannot move.")],next:'patio'},
   patio:{env:'gbenga_house_patio',actors:{left:'rich',right:'gbenga'},title:'THE PATIO',lines:[N('After dinner, Gbenga tells Rich about coming to Los Angeles with nothing and about Mister December, the man above him he fears.'),N('Rich learns where the vault is, how the business actually works, and where Mister December stands above Gbenga.')],next:'door'},
   door:{env:'gbenga_house_dining',actors:{left:'rich',right:'mama_gbenga'},title:'AT THE DOOR',lines:[N('Mama Gbenga holds out a container of leftovers.'),S('mama_gbenga','Come back Sunday.')],choices:[
    {label:'TAKE IT',next:'take'},
    {label:"I CAN'T",next:'refuse'}
   ]},
   take:{lines:[N('Rich takes the leftovers.')],end:{outcome:'take',fx:finish('take'),memory:{text:"ate Mama Gbenga's leftovers after dinner",lane:'people'}}},
   refuse:{lines:[N('Rich refuses the leftovers. Mama Gbenga remembers.')],end:{outcome:'refuse',fx:finish('refuse'),memory:{text:"refused Mama Gbenga's leftovers",lane:'people'}}}
  }});

 RAWakeTriggers.define([{adventure:'NEW_OGA_M7',priority:78,when:m7Ready}]);
 window.RANewOgaM7={m7Ready};
})();
