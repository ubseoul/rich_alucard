(function(){
 // RC2 · BUILD 3 — NEW STORY (creator-authorized, OL-063). Every box <= 3 sentences. Existing characters + existing environments only.
 // Mirror of this content for the private step: docs/rc2/NEW_STORY.md. Rich lines are R() = voice pass required.
 const {R,S,N,E}=RAContent;const D=RAAdventures.define;
 const day=()=>RALife.today().day;
 const seeded=key=>RAPixel.rng(`rc2:${key}:${day()}`);
 // The doorman is a placeholder figure (no frozen art yet) — listed under "needs art" in docs/rc2/NEW_STORY.md.
 RABtfPeople.byId.doorman=RABtfPeople.byId.doorman||{id:'doorman',name:'THE DOORMAN',look:{skin:'#5a3420',top:'#15151c',bottom:'#15151c',hair:'#15151c',hairShape:'bald',height:1.15,width:1.3,shades:true}};

 // ============================================================================================
 // THE YAM — Naija Mart. You do not buy a yam. You are chosen.
 // ============================================================================================
 D({id:'YAM',title:'THE YAM',lane:'food',scope:'MUST',memory:'a yam',available:L=>L.done('A43')||L.day>=4,testSetup:ctx=>{ctx.RALife.addMoney(500);},start:'arrive',nodes:{
  arrive:{env:'naija_mart',actors:{left:'rich',right:'auntie'},title:'NAIJA MART · THE YAM',
   lines:[N('behind the register, on its own chair: a yam the size of a toddler.'),S('auntie',"that is not a vegetable. that is a commitment."),R('how much?'),S('auntie','a yam has no price. a yam has a home. YOU are the home.')],
   choices:[{label:'TAKE THE YAM ($6)',when:()=>RALife.money()>=6,fx:()=>RALife.spend(6),next:'carry'},{label:'"DOES IT HAVE A WARRANTY?"',octopus:true,sub:'she has an answer.',next:'warranty'},{label:'NO THANK YOU',next:'refuse'}]},
  warranty:{lines:[S('auntie','it has a mother. she is in a field. she is watching.'),N('rich takes the yam.')],enter:A=>{RALife.spend(Math.min(6,RALife.money()));},next:'carry'},
  refuse:{lines:[S('auntie','you will be back.'),N('she says it like weather. it is already true.')],end:{outcome:'refused',memory:{text:'said no to a yam. felt it later',lane:'food',quality:.4},receipt:{caption:'no yam. for now.'},home:['rich','the yam knows where i live.',{vp:true}]}},
  carry:{env:'naija_lot',actors:{left:'rich'},lines:[N('a yam does not go in the trunk. a yam rides shotgun.'),N('rich buckles it in. the seatbelt light stops beeping.')],next:'kitchen'},
  kitchen:{env:'kitchen',actors:{left:'rich'},lines:[N('the yam sits on the counter like it pays rent.'),N('mazda is staring at it from the rafters. mazda is hungry.')],next:'phone'},
  phone:{actors:{left:'rich',right:'uncle_sunday'},lines:[N('the phone rings. it is uncle sunday. nobody told him about the yam.'),S('uncle_sunday','you bought yam? good. now: boil, roast, or pound?')],
   choices:[{label:'BOIL IT',sub:'a man of peace.',next:'boil'},{label:'ROAST IT',sub:'smoky. street.',next:'roast'},{label:'POUND IT',sub:'by hand. for love.',next:'pound'},{label:'LET MAZDA DO IT',octopus:true,sub:'she has fire.',next:'dragon'}]},
  boil:{lines:[N('soft. plain. perfect.'),S('uncle_sunday','BOILED. a man of peace. i am proud.')],enter:A=>{RALife.setFlag('yamCooked','boiled');},next:'end'},
  roast:{lines:[N('crispy. smoky. it smells like a good decision.'),S('uncle_sunday','ROASTED. street yam. i am crying a little.')],enter:A=>{RALife.setFlag('yamCooked','roasted');},next:'end'},
  pound:{lines:[N('rich pounds for twenty minutes. the yam wins.'),S('uncle_sunday','AH. the arm has no yam in it. practice.')],enter:A=>{RALife.setFlag('yamCooked','pounded');},next:'end'},
  dragon:{lines:[N('mazda swoops down and breathes exactly once.'),N('the yam is perfect. the counter is not.'),S('uncle_sunday','a dragon-roasted yam. my grandfather would have died. happily.')],enter:A=>{RALife.setFlag('yamCooked','dragon');},next:'end'},
  end:{enter:A=>{RALife.setFlag('yamCooked',RALife.flag('yamCooked')||'boiled');RARelations.add('uncle_sunday',2,{reason:'the yam'});RARelations.add('auntie',2,{reason:'took the yam'});},
   lines:[N('rich eats the whole thing. he feels like he owes someone an apology.')],
   end:{outcome:'yam',memory:{text:'bought a yam, cooked a yam, became a yam person',lane:'food',quality:1.2},receipt:{id:'yam',caption:'a yam. it had a home. you.'},home:['rich','yam is a lifestyle now.',{vp:true}]}}
 }});

 // ============================================================================================
 // FUFU FRIDAY — Tunde, Mom on the call, and the one rule: you do not chew.
 // ============================================================================================
 D({id:'FUFU',title:'FUFU FRIDAY',lane:'food',scope:'MUST',memory:'fufu',available:L=>L.done('A43')||L.day>=5,start:'arrive',nodes:{
  arrive:{env:'kitchen',actors:{left:'rich',right:'tunde'},title:'FUFU FRIDAY',
   lines:[E('tunde','tunde shows up with a bag of flour and a face of deep concern.'),S('tunde','you have never eaten fufu? at all?'),S('tunde','sit. today you become a man. or a better man.')],next:'mom'},
  mom:{actors:{left:'mom',mid:'rich',right:'tunde'},lines:[N('mom joins the video call. nobody invited her. she was always going to join.'),S('mom','have you eaten? what are you eating? WHO IS COOKING?')],next:'rule'},
  rule:{actors:{left:'rich',right:'tunde'},lines:[S('tunde','rule one: you do not chew fufu.'),R('why not?'),S('tunde','it is not a steak. it is a friend. you tear. you dip. you swallow.')],
   choices:[{label:'SWALLOW IT',next:'swallow'},{label:'CHEW IT (RULES ARE RULES)',next:'chew'},{label:'ROLL IT WITH EIGHT TENTACLES',octopus:true,sub:'perfect little balls.',next:'octo'}]},
  swallow:{lines:[N('it goes down in one piece. rich stares at the ceiling.'),S('tunde','…you are nigerian. i always knew.')],enter:A=>{RALife.setFlag('fufuStyle','swallow');},next:'soup'},
  chew:{lines:[N('rich chews. the whole kitchen goes quiet.'),S('mom','who raised you?'),S('tunde','i cannot look at him.')],enter:A=>{RALife.setFlag('fufuStyle','chew');},next:'soup'},
  octo:{lines:[N('eight tentacles. eight perfect balls. one very concerned dragon.'),S('tunde','that is cheating. it is also beautiful.')],enter:A=>{RALife.setFlag('fufuStyle','octopus');},next:'soup'},
  soup:{lines:[N('the soup is egusi. it is red. it is hot. it is personal.'),S('mom','is the soup hot? it should hurt a little.'),R('…it hurts a little.')],next:'end'},
  end:{enter:A=>{RALife.setFlag('fufuLearned',true);RARelations.add('tunde',3,{reason:'fufu friday'});},lines:[S('mom','good. now eat again. i will watch.')],
   end:{outcome:'fufu',memory:{text:'learned fufu. one rule: do not chew',lane:'food',quality:1.4},receipt:{id:'fufu',caption:'fufu friday. mom watched. i swallowed.'},home:['rich','fufu is a whole personality.',{vp:true}]}}
 }});

 // ============================================================================================
 // THE AUNTIE COUNCIL — three aunties, three folding chairs, one file on you.
 // ============================================================================================
 D({id:'AUNTIES',title:'THE AUNTIE COUNCIL',lane:'food',scope:'MUST',memory:'the auntie council',available:L=>L.done('A43')||L.day>=6,start:'arrive',nodes:{
  arrive:{env:'naija_lot',actors:{left:'rich',right:'auntie',farRight:'auntie'},title:'NAIJA MART · THE PARKING LOT',
   lines:[N('three aunties on folding chairs. a table. a thermos. nobody invited them.'),E('auntie','the council has reviewed your file.'),S('auntie','you are too thin. you are too pale. you are too single.'),R('i am a vampire.'),S('auntie','and?')],next:'work'},
  work:{lines:[S('auntie','what work do you do?')],
   choices:[{label:'"MUSIC."',next:'work_music'},{label:'"I HAVE A CASTLE."',next:'work_castle'},{label:'"I AM A VAMPIRE."',next:'work_vamp'}]},
  work_music:{enter:A=>A.set('score',(A.vars.score||0)+1),lines:[S('auntie','music is a hobby. what is the WORK.')],next:'wed'},
  work_castle:{enter:A=>A.set('score',(A.vars.score||0)+2),lines:[S('auntie','a castle! with whose money?'),N('the other two aunties nod. that was the right question.')],next:'wed'},
  work_vamp:{enter:A=>A.set('score',(A.vars.score||0)+1),lines:[S('auntie','a vampire with a pension?'),R('no ma.'),S('auntie','we will pray.')],next:'wed'},
  wed:{lines:[S('auntie','are you married?')],
   choices:[{label:'"NO MA."',next:'wed_no'},{label:'"IT IS COMPLICATED."',next:'wed_comp'},{label:'"I AM VERY BUSY."',next:'wed_busy'}]},
  wed_no:{enter:A=>A.set('score',(A.vars.score||0)+1),lines:[S('auntie','sad.'),S('auntie','my niece is a doctor. she is also a lawyer. she is single.')],next:'eat'},
  wed_comp:{enter:A=>A.set('score',(A.vars.score||0)+2),lines:[S('auntie','who is she? what is her mother\'s name?'),N('the thermos is put down. this is now an investigation.')],next:'eat'},
  wed_busy:{enter:A=>A.set('score',(A.vars.score||0)+1),lines:[S('auntie','busy people still eat. EAT.')],next:'eat'},
  eat:{lines:[N('a foil plate appears in rich\'s hands. nobody saw it arrive.'),S('auntie','do not wash the foil. we want the foil back.')],next:'verdict'},
  verdict:{lines:A=>{const s=A.vars.score||0;return s>=4?[N('the council confers. it takes eleven seconds.'),S('auntie','you are acceptable. barely.')]:[N('the council confers. it takes forty minutes.'),S('auntie','you are a project. we like projects.')];},
   enter:A=>{RALife.setFlag('auntieApproval',(A.vars.score||0)>=4?'acceptable':'project');RARelations.add('auntie',3,{reason:'the council'});},
   end:{outcome:'council',memory:{text:'the aunties reviewed my life. verdict: a project',lane:'food',quality:1.3},receipt:{id:'council',caption:'a foil plate. return the foil.'},home:['rich','i have been seen.',{vp:true}]}}
 }});

 // ============================================================================================
 // ASO EBI — Uncle Sunday's owambe. Everybody in the same cloth. Dance, get sprayed. (DANCE minigame)
 // ============================================================================================
 D({id:'ASOEBI',title:'ASO EBI',lane:'food',scope:'MUST',memory:'the gold cloth',repeatable:false,available:L=>L.done('A10')&&L.day>=7,testSetup:ctx=>{ctx.RALife.setFlag('uncleSundayMet',true);},start:'arrive',nodes:{
  arrive:{env:'carson_owambe',actors:{left:'rich',right:'uncle_sunday'},title:'OWAMBE · ASO EBI',
   lines:[E('uncle_sunday','uncle sunday hands you a bag. inside: gold fabric. a lot of gold fabric.'),S('uncle_sunday','this is the aso ebi. same cloth, so everyone knows who is family.'),R('i wear black.'),S('uncle_sunday','today you wear GOLD.')],
   choices:[{label:'WEAR THE GOLD',next:'gold'},{label:'GOLD OVER BLACK',sub:'a compromise.',next:'mix'},{label:'WEAR BLACK ANYWAY',next:'black'}]},
  gold:{enter:A=>RALife.setFlag('asoEbi','gold'),lines:[N('rich looks like a very expensive curtain.'),S('uncle_sunday','PERFECT.')],next:'floor'},
  mix:{enter:A=>RALife.setFlag('asoEbi','mix'),lines:[N('a gold sash. everything else black.'),S('uncle_sunday','the compromise. i accept it. my sister will not.')],next:'floor'},
  black:{enter:A=>RALife.setFlag('asoEbi','black'),lines:[N('the aunties gasp. one of them clutches a bread roll.'),S('uncle_sunday','he will be forgiven. in time.')],next:'floor'},
  floor:{actors:{left:'rich',right:'uncle_sunday',farRight:'auntie'},lines:[N('the dj plays one song. the whole room turns to look at you.'),S('uncle_sunday','dance well and they SPRAY you. real money. on your forehead.'),S('uncle_sunday','dance badly and they pray for you.')],next:'dance'},
  dance:{minigame:{id:'dance',params:A=>({song:'owambe',spray:true,rival:'UNCLE SUNDAY'}),next:(A,r)=>{A.set('dance',r);return r?.quit?'after':'after';}}},
  after:{lines:A=>{const r=A.vars.dance||{};const sc=r.score||0;
    if(r.quit)return [N('rich walks off the floor. the aunties make a note.')];
    if(r.outcome==='win')return [N('the aunties start spraying. money sticks to rich\'s forehead.'),S('uncle_sunday','THAT IS MY NEPHEW! THAT IS MY NEPHEW!')];
    return [N('rich steps on an auntie\'s shoe. the room prays for him.'),S('uncle_sunday','it is okay. we all start somewhere. mostly at weddings.')];},
   end:{outcome:'owambe',memory:{text:'wore the gold, danced at an owambe',lane:'food',quality:1.5},receipt:{id:'asoebi',caption:'a piece of gold cloth. you will wear it again.'},home:['rich','i was sprayed. i was seen.',{vp:true}]}}
 }});

 // ============================================================================================
 // THE FOIL PLATES — Mom said everyone gets a plate. Everyone gets a plate.
 // ============================================================================================
 D({id:'PLATES',title:'THE FOIL PLATES',lane:'food',scope:'MUST',memory:'the foil plates',available:L=>L.day>=9,start:'knock',nodes:{
  knock:{env:'bedroom',actors:{left:'rich'},title:'MOM SENT PLATES',
   lines:[N('someone is knocking. a cousin rich has never met is holding a cooler.'),S('mom','I SENT PLATES. EVERYONE GETS A PLATE. NO ONE IS LEFT OUT.'),N('there are four plates. each has a name written in marker.')],next:'hub'},
  hub:{env:'castle_exterior',actors:{left:'rich'},lines:A=>[N(((A.vars.done||[]).length)?'plates left. mom is checking.':'where does the first plate go?')],
   choices:A=>['tunde','coffe','dre','lil_smack'].filter(p=>!(A.vars.done||[]).includes(p)).map(p=>({label:`PLATE FOR ${p.replace('_',' ').toUpperCase()}`,fx:X=>X.set('done',[...(X.vars.done||[]),p]),next:p}))},
  tunde:{actors:{left:'rich',right:'tunde'},lines:[N('tunde inspects the foil like a customs officer.'),S('tunde','who packed this? this is a master.')],next:A=>(A.vars.done||[]).length>=4?'end':'hub'},
  coffe:{actors:{left:'rich',right:'coffe'},lines:[N('coffe eats it in four seconds.'),S('coffe','I CAN TASTE SOUND NOW.')],next:A=>(A.vars.done||[]).length>=4?'end':'hub'},
  dre:{actors:{left:'rich',right:'dre'},lines:[S('dre','is it spicy?'),N('it is. dre cries politely.')],next:A=>(A.vars.done||[]).length>=4?'end':'hub'},
  lil_smack:{actors:{left:'rich',right:'lil_smack'},lines:[N('lil smack opens the foil with his mouth.'),N('the foil is gone. nobody asks where.')],next:A=>(A.vars.done||[]).length>=4?'end':'hub'},
  end:{env:'castle_exterior',actors:{left:'rich'},enter:A=>{RALife.setFlag('platesDelivered',true);},lines:[S('mom','did everyone eat? SEND THE PHOTOS.'),R('they ate, ma.')],
   end:{outcome:'plates',memory:{text:'mom sent plates. everybody ate',lane:'food',quality:1.4},receipt:{id:'plates',caption:'four foil plates. nobody left out.'},home:['rich','mom fed the whole block from atlanta.',{vp:true}]}}
 }});

 // ============================================================================================
 // THE CLUB · FIRST NIGHT — immediate, cheap, and a little safe. Sets the budget cap Build 1 reads.
 // ============================================================================================
 D({id:'CLUB_FIRST',title:'THE CLUB · FIRST NIGHT',lane:'people',scope:'MUST',memory:'the first night',start:'door',nodes:{
  door:{env:'street_night',actors:{left:'rich',right:'doorman'},title:'THE CLUB · FIRST NIGHT',
   lines:[N('a velvet rope. a very large man. a sign: FIRST NIGHT HALF OFF.'),S('doorman','first time? welcome. cover is half off tonight.'),S('doorman','house rule for first timers: bring half your cash. the rest stays home.'),R('half my bankroll?')],
   next:'rule'},
  rule:{lines:[S('doorman','yes. it is called not going broke on your first night.')],
   choices:[{label:'GO IN WITH HALF',sub:'THE SMART MOVE',next:'half'},{label:'GO IN WITH $20',sub:'THE VERY SMART MOVE',next:'small'},{label:'NOT TONIGHT',next:'leave'}]},
  half:{enter:A=>{RALife.setFlag('clubFirstNight',true);RALife.setFlag('clubBudgetCap',Math.max(1,Math.floor(RALife.money()/2)));RALife.setFlag('clubCoverDiscount',.5);},lines:[N('the bass hits your chest. your wallet feels light and safe.')],next:'in'},
  small:{enter:A=>{RALife.setFlag('clubFirstNight',true);RALife.setFlag('clubBudgetCap',Math.max(1,Math.min(20,RALife.money())));RALife.setFlag('clubCoverDiscount',.5);},lines:[N('the doorman nods. he respects a man with a plan.')],next:'in'},
  leave:{lines:[S('doorman','the rope is not going anywhere.')],end:{outcome:'left',memory:{text:'stood at the club door. left. wise or scared',lane:'people',quality:.3},receipt:{caption:'the club. not tonight.'}}},
  in:{lines:[S('doorman','spend the first half wisely. we will not hold your hand next time.')],
   end:{outcome:'inside',memory:{text:'first night at the club. went in with a plan',lane:'people',quality:1},receipt:{id:'club:first',caption:'the club. half off. half the cash.'},home:['rich','i am a responsible man in a club.',{vp:true}]}}
 }});

 // Routes: each story arrives as a VampGPT want / invite (never a menu dump). The club is immediate (day 1).
 RATemptations.define([
  {id:'vg_club',source:'vampgpt',line:'the club is open. first night is half off. i checked.',priority:90,minDay:1,maxDay:6,life:[3,4],adventure:'CLUB_FIRST'},
  {id:'vg_yam',source:'vampgpt',line:'the auntie at naija mart is holding a yam for you. do not ask.',minDay:4,weight:2,life:[3,5],adventure:'YAM'},
  {id:'vg_fufu',source:'vampgpt',line:'tunde says you have never had fufu. he is taking it personally.',minDay:5,weight:2,life:[3,5],adventure:'FUFU'},
  {id:'vg_aunties',source:'vampgpt',line:'three aunties are in the naija mart lot. they asked about you.',minDay:6,weight:1.5,life:[3,5],adventure:'AUNTIES'},
  {id:'invite_asoebi',source:'invite',sender:'UNCLE SUNDAY',line:'owambe saturday. the aso ebi is gold. do not argue.',minDay:8,weight:2,life:[3,5],adventure:'ASOEBI'},
  {id:'vg_plates',source:'vampgpt',line:'mom sent plates. ALL the plates. check your door.',minDay:9,weight:2,life:[3,5],adventure:'PLATES'}
 ]);
 RAPlaces.define([{id:'club_first',label:'THE CLUB',sub:'FIRST NIGHT · HALF OFF',adventure:'CLUB_FIRST',order:2}]);
})();
