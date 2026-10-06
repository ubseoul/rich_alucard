(function(){
 // RC2 · BUILD 3 — NEW STORY (creator-authorized, OL-063). Every box <= 3 sentences. Existing characters + existing environments only.
 // Mirror of this content for the private step: docs/rc2/NEW_STORY.md. Rich lines are R() = voice pass required.
 const {R,RC,S,N,E}=RAContent;const D=RAAdventures.define;
 const day=()=>RALife.today().day;
 const seeded=key=>RAPixel.rng(`rc2:${key}:${day()}`);
 // CHEAP-BUY ENCOUNTERS (Build 1 taco hook): a small buy sometimes opens a 2-box moment with a person. Deterministic per day.
 RAWriting.cheapBuyEnter=(kind,A)=>{const rng=seeded('cheap:'+kind);if(rng()>.55)return;const e=RAWriting.cheapBuyPick(kind,rng);A.set('cheap',e);if(e.meet){try{RARelations.meet(e.meet,'cheap-buy:'+kind);}catch(x){}}RALife.setFlag('cheapBuyTip:'+kind,e.tip);};
 RAWriting.cheapBuyLines=A=>{const e=A?.vars?.cheap;return e?e.lines.map(t=>N(t)):[];};
 // The doorman is narrated (no actor): a placeholder figure would fail the frozen-art grounding gate.

 // ============================================================================================
 // THE YAM — Naija Mart. You do not buy a yam. You are chosen.
 // ============================================================================================
 D({id:'YAM',title:'THE YAM',lane:'food',scope:'MUST',memory:'a yam',available:L=>L.done('A43')||L.day>=4,testSetup:ctx=>{ctx.RALife.addMoney(500);},start:'arrive',nodes:{
  arrive:{env:'naija_mart',actors:{left:'rich',right:'auntie'},title:'NAIJA MART · THE YAM',
   lines:[N("a yam got its own chair before you did"),S('auntie',"this a dependent"),R("how much for big bro"),S('auntie',"yam needs a home and you got a castle")],
   choices:[{label:'TAKE THE YAM ($6)',when:()=>RALife.money()>=6,fx:()=>RALife.spend(6),next:'carry'},{label:'"DOES IT HAVE A WARRANTY?"',octopus:true,sub:'$6 · she has an answer.',when:()=>RALife.money()>=6,next:'warranty'},{label:'NO THANK YOU',next:'refuse'}]},
  warranty:{lines:[null,N("rich adopts the yam")],enter:A=>{RALife.spend(6);},next:'carry'},
  refuse:{lines:[S('auntie',"dont make me come find you"),null],end:{outcome:'refused',memory:{text:'said no to a yam. felt it later',lane:'food',quality:.4},receipt:{caption:'no yam. for now.'},home:['rich',"yam got my address im cooked",{vp:true}]}},
  carry:{env:'naija_lot',actors:{left:'rich'},lines:[N("yam riding shotgun like it paid for gas"),N("rich buckles big bro in")],next:'kitchen'},
  kitchen:{env:'kitchen',actors:{left:'rich'},lines:[N("yam on the counter acting like the landlord"),N("mazda looking at lunch")],next:'phone'},
  phone:{actors:{left:'rich',right:'uncle_sunday'},lines:[N("uncle sunday calls like he got yam notifications on"),S('uncle_sunday',"boil roast or pound it nephew")],
   choices:[{label:'BOIL IT',sub:'a man of peace.',next:'boil'},{label:'ROAST IT',sub:'smoky. street.',next:'roast'},{label:'POUND IT',sub:'by hand. for love.',next:'pound'},{label:'LET MAZDA DO IT',octopus:true,sub:'she has fire.',next:'dragon'}]},
  boil:{lines:[N("boiled and minding its business"),S('uncle_sunday',"boiled? peace in this house")],enter:A=>{RALife.setFlag('yamCooked','boiled');},next:'end'},
  roast:{lines:[N("roasted and smelling expensive"),S('uncle_sunday',"street yam in a castle look at god")],enter:A=>{RALife.setFlag('yamCooked','roasted');},next:'end'},
  pound:{lines:[N("twenty minutes pounding and the yam still winning"),S('uncle_sunday',"all that muscle for what")],enter:A=>{RALife.setFlag('yamCooked','pounded');},next:'end'},
  dragon:{lines:[N("mazda handles the roasting"),N("yam cooked counter cooked too"),S('uncle_sunday',"dragon roasted? nephew you got money money")],enter:A=>{RALife.setFlag('yamCooked','dragon');},next:'end'},
  end:{enter:A=>{RALife.setFlag('yamCooked',RALife.flag('yamCooked')||'boiled');RARelations.add('uncle_sunday',2,{reason:'the yam'});RARelations.add('auntie',2,{reason:'took the yam'});},
   lines:[N("rich eats the whole yam like nobody helped")],
   end:{outcome:'yam',memory:{text:'bought a yam, cooked a yam, became a yam person',lane:'food',quality:1.2},receipt:{id:'yam',caption:'a yam. it had a home. you.'},home:['rich',"damn im a yam dad now",{vp:true}]}}
 }});

 // ============================================================================================
 // FUFU FRIDAY — Tunde, Mom on the call, and the one rule: you do not chew.
 // ============================================================================================
 D({id:'FUFU',title:'FUFU FRIDAY',lane:'food',scope:'MUST',memory:'fufu',available:L=>L.done('A43')||L.day>=5,start:'arrive',nodes:{
  arrive:{env:'kitchen',actors:{left:'rich',right:'tunde'},title:'FUFU FRIDAY',
   lines:[E('tunde',"tunde pulls up with flour and concerns"),S('tunde',"you never had fufu? who raised you"),S('tunde',"sit down we fixing that")],next:'mom'},
  mom:{actors:{left:'mom',mid:'rich',right:'tunde'},lines:[N("mom joins like she got a warrant"),S('mom',"who cooking and why wasnt i called")],next:'rule'},
  rule:{actors:{left:'rich',right:'tunde'},lines:[S('tunde',"dont chew it"),R("why this shit got rules"),S('tunde',"tear dip swallow this aint steak")],
   choices:[{label:'SWALLOW IT',next:'swallow'},{label:'CHEW IT (RULES ARE RULES)',next:'chew'},{label:'ROLL IT WITH EIGHT TENTACLES',octopus:true,sub:'perfect little balls.',next:'octo'}]},
  swallow:{lines:[N("rich swallows and checks if hes still alive"),S('tunde',"see you nigerian after all")],enter:A=>{RALife.setFlag('fufuStyle','swallow');},next:'soup'},
  chew:{lines:[N("rich chews and the whole kitchen takes offense"),S('mom',"who raised you bro"),S('tunde',"dont put me on camera with him")],enter:A=>{RALife.setFlag('fufuStyle','chew');},next:'soup'},
  octo:{lines:[N("eight tentacles eight balls mazda wants none of this"),S('tunde',"cheating but damn thats clean")],enter:A=>{RALife.setFlag('fufuStyle','octopus');},next:'soup'},
  soup:{lines:[N("egusi hot enough to settle an argument"),S('mom',"it hurt? good"),R("damn a little warning next time")],next:'end'},
  end:{enter:A=>{RALife.setFlag('fufuLearned',true);RARelations.add('tunde',3,{reason:'fufu friday'});},lines:[S('mom',"eat again im watching")],
   end:{outcome:'fufu',memory:{text:'learned fufu. one rule: do not chew',lane:'food',quality:1.4},receipt:()=>({id:'fufu',caption:`fufu friday. mom watched. ${RALife.flag('fufuStyle')==='chew'?'i chewed.':RALife.flag('fufuStyle')==='octopus'?'eight tentacles.':'i swallowed.'}`}),home:['rich',"fufu got more rules than probation",{vp:true}]}}
 }});

 // ============================================================================================
 // THE AUNTIE COUNCIL — three aunties, three folding chairs, one file on you.
 // ============================================================================================
 D({id:'AUNTIES',title:'THE AUNTIE COUNCIL',lane:'food',scope:'MUST',memory:'the auntie council',available:L=>L.done('A43')||L.day>=6,start:'arrive',nodes:{
  arrive:{env:'naija_lot',actors:{left:'rich',right:'auntie',farRight:'auntie'},title:'NAIJA MART · THE PARKING LOT',
   lines:[N("three aunties set up a whole court outside"),E('auntie',"we been discussing you"),S('auntie',"too pale too thin still single"),R("ma im literally a vampire"),S('auntie',"and what that got to do with marriage")],next:'work'},
  work:{lines:[S('auntie',"what you do for money")],
   choices:[{label:'"MUSIC."',next:'work_music'},{label:'"I HAVE A CASTLE."',next:'work_castle'},{label:'"I AM A VAMPIRE."',next:'work_vamp'}]},
  work_music:{enter:A=>A.set('score',(A.vars.score||0)+1),lines:[S('auntie',"music cute whats the job")],next:'wed'},
  work_castle:{enter:A=>A.set('score',(A.vars.score||0)+2),lines:[S('auntie',"castle? who paid"),null],next:'wed'},
  work_vamp:{enter:A=>A.set('score',(A.vars.score||0)+1),lines:[S('auntie',"vampire pension good or no"),R("no ma im cooked"),S('auntie',"we praying extra")],next:'wed'},
  wed:{lines:[S('auntie',"you married yet")],
   choices:[{label:'"NO MA."',next:'wed_no'},{label:'"IT IS COMPLICATED."',next:'wed_comp'},{label:'"I AM VERY BUSY."',next:'wed_busy'}]},
  wed_no:{enter:A=>A.set('score',(A.vars.score||0)+1),lines:[S('auntie',"damn"),S('auntie',"my niece a doctor and a lawyer dont embarrass me")],next:'eat'},
  wed_comp:{enter:A=>A.set('score',(A.vars.score||0)+2),lines:[S('auntie',"whats her mother name"),N("thermos down investigation started")],next:'eat'},
  wed_busy:{enter:A=>A.set('score',(A.vars.score||0)+1),lines:[S('auntie',"busy men still eat sit down")],next:'eat'},
  eat:{lines:[N("foil plate appears like mom got bluetooth"),S('auntie',"bring my foil back dont play")],next:'verdict'},
  verdict:{lines:A=>{const s=A.vars.score||0;return s>=4?[N("eleven seconds to judge a whole man"),S('auntie',"you passed barely")]:[N("forty minutes later they still on your case"),S('auntie',"you need work we got time")];},
   enter:A=>{RALife.setFlag('auntieApproval',(A.vars.score||0)>=4?'acceptable':'project');RARelations.add('auntie',3,{reason:'the council'});},
   end:{outcome:'council',memory:()=>({text:`the aunties reviewed my life. verdict: ${RALife.flag('auntieApproval')}`,lane:'food',quality:1.3}),receipt:{id:'council',caption:'a foil plate. return the foil.'},home:['rich',"aunties got my whole file",{vp:true}]}}
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
   lines:[N("a cousin you never met pulls up with moms cooler"),S('mom',"everybody gets a plate dont start"),N("four plates four names no excuses")],next:'hub'},
  hub:{env:'castle_exterior',actors:{left:'rich'},lines:A=>[N(((A.vars.done||[]).length)?'plates left. mom is checking.':'where does the first plate go?')],
   choices:A=>['tunde','coffe','dre','lil_smack'].filter(p=>!(A.vars.done||[]).includes(p)).map(p=>({label:`PLATE FOR ${p.replace('_',' ').toUpperCase()}`,fx:X=>X.set('done',[...(X.vars.done||[]),p]),next:p}))},
  tunde:{actors:{left:'rich',right:'tunde'},lines:[N("tunde checks the foil like tsa"),S('tunde',"who packed this they got credentials")],next:A=>(A.vars.done||[]).length>=4?'end':'hub'},
  coffe:{actors:{left:'rich',right:'coffe'},lines:[N("coffe eats like the plate got a timer"),S('coffe',"damn i can hear colors")],next:A=>(A.vars.done||[]).length>=4?'end':'hub'},
  dre:{actors:{left:'rich',right:'dre'},lines:[S('dre',"this shit spicy"),N("dre crying but saying thank you")],next:A=>(A.vars.done||[]).length>=4?'end':'hub'},
  lil_smack:{actors:{left:'rich',right:'lil_smack'},lines:[N("lil smack eats the foil too"),null],next:A=>(A.vars.done||[]).length>=4?'end':'hub'},
  end:{env:'castle_exterior',actors:{left:'rich'},enter:A=>{RALife.setFlag('platesDelivered',true);},lines:[S('mom',"send pictures i know yall lie"),R("everybody ate ma even the foil")],
   end:{outcome:'plates',memory:{text:'mom sent plates. everybody ate',lane:'food',quality:1.4},receipt:{id:'plates',caption:'four foil plates. nobody left out.'},home:['rich',"mom doing catering from another state damn",{vp:true}]}}
 }});

 // ============================================================================================
 // THE CLUB · FIRST NIGHT — immediate, cheap, and a little safe. Sets the budget cap Build 1 reads.
 // ============================================================================================
 D({id:'CLUB_FIRST',title:'THE CLUB · FIRST NIGHT',lane:'people',scope:'MUST',memory:'the first night',start:'door',nodes:{
  door:{env:'street_night',actors:{left:'rich'},title:'THE CLUB · FIRST NIGHT',
   lines:[N('a velvet rope. a very large man. a sign: FIRST NIGHT HALF OFF.'),S(null,'DOORMAN: first time? welcome. cover is half off tonight.'),S(null,'DOORMAN: house rule for first timers: bring half your cash. the rest stays home.'),RC("gonna make it rain like hell")],
   next:'rule'},
  rule:{lines:[S(null,'DOORMAN: yes. it is called not going broke on your first night.')],
   choices:[{label:'GO IN WITH HALF',sub:'THE SMART MOVE',next:'half'},{label:'GO IN WITH $20',sub:'THE VERY SMART MOVE',next:'small'},{label:'NOT TONIGHT',next:'leave'}]},
  half:{enter:A=>{RALife.setFlag('clubFirstNight',true);RALife.setFlag('clubBudgetCap',Math.max(1,Math.floor(RALife.money()/2)));RALife.setFlag('clubCoverDiscount',.5);},lines:[N('the bass hits your chest. your wallet feels light and safe.')],next:'in'},
  small:{enter:A=>{RALife.setFlag('clubFirstNight',true);RALife.setFlag('clubBudgetCap',Math.max(1,Math.min(20,RALife.money())));RALife.setFlag('clubCoverDiscount',.5);},lines:[N('the doorman nods. he respects a man with a plan.')],next:'in'},
  leave:{lines:[S(null,'DOORMAN: the rope is not going anywhere.')],end:{outcome:'left',memory:{text:'stood at the club door. left. wise or scared',lane:'people',quality:.3},receipt:{caption:'the club. not tonight.'}}},
  in:{lines:[S(null,'DOORMAN: spend the first half wisely. we will not hold your hand next time.')],
   end:{outcome:'inside',memory:{text:'first night at the club. went in with a plan',lane:'people',quality:1},receipt:{id:'club:first',caption:'the club. half off. half the cash.'},home:['rich','i am a responsible man in a club.',{vp:true}]}}
 }});

 // Routes: each story arrives as a VampGPT want / invite (never a menu dump). The club is immediate (day 1).
 RATemptations.define([
  {id:'vg_club',when:L=>RALife.flag('rc2Offer')==='vg_club',source:'vampgpt',line:'the club is open. first night is half off. i checked.',priority:90,minDay:1,maxDay:6,life:[1,2],adventure:'CLUB_FIRST'},
  {id:'vg_yam',when:L=>RALife.flag('rc2Offer')==='vg_yam',source:'vampgpt',line:'the auntie at naija mart is holding a yam for you. do not ask.',minDay:4,weight:.5,life:[1,2],adventure:'YAM'},
  {id:'vg_fufu',when:L=>RALife.flag('rc2Offer')==='vg_fufu',source:'vampgpt',line:'tunde says you have never had fufu. he is taking it personally.',minDay:5,weight:.5,life:[1,2],adventure:'FUFU'},
  {id:'vg_aunties',when:L=>RALife.flag('rc2Offer')==='vg_aunties',source:'vampgpt',line:'three aunties are in the naija mart lot. they asked about you.',minDay:6,weight:.5,life:[1,2],adventure:'AUNTIES'},
  {id:'invite_asoebi',when:L=>RALife.flag('rc2Offer')==='invite_asoebi',source:'invite',sender:'UNCLE SUNDAY',line:'owambe saturday. the aso ebi is gold. do not argue.',minDay:8,weight:.5,life:[1,2],adventure:'ASOEBI'},
  {id:'vg_plates',when:L=>RALife.flag('rc2Offer')==='vg_plates',source:'vampgpt',line:'mom sent plates. ALL the plates. check your door.',minDay:9,weight:.5,life:[1,2],adventure:'PLATES'}
 ]);
 // OFFERS: one story want every other morning (club first, from day 1), pushed directly so the random want cadence is untouched.
 const OFFERS=[['vg_club','CLUB_FIRST',1],['vg_yam','YAM',4],['vg_fufu','FUFU',5],['vg_aunties','AUNTIES',6],['invite_asoebi','ASOEBI',8],['vg_plates','PLATES',9]];
 RAClock.onWake('rc2-story-offers',58,({info})=>{
  if(info.day>1&&info.day%2)return;
  const live=RAState.get().life.temptations.live||[];if(live.length>1||live.some(t=>OFFERS.some(o=>o[0]===t.id)))return;
  for(const [id,adv,minDay] of OFFERS){if(info.day<minDay||!RAAdventures.available(adv))continue;
   RALife.setFlag('rc2Offer',id);let ok=false;try{ok=RATemptations.ensure(id);}finally{RALife.setFlag('rc2Offer',null);}
   if(ok)return;}
 });
 RAPlaces.define([{id:'club_first',label:'THE CLUB',sub:'FIRST NIGHT · HALF OFF',adventure:'CLUB_FIRST',order:2}]);
})();
