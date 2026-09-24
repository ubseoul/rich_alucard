(function(){
 // W1 LIFE FOUNDATION content: the first seven days. Non-Rich lines are functional drafts pending HQ Story;
 // every Rich line is [VP].
 const {R,S,N,E}=RAContent;const D=RAAdventures.define;
 const store=(back)=>({env:A=>RAStores.STORES[A.vars.store]?.env||'grave',actors:A=>({left:'rich',...(RAStores.STORES[A.vars.store]?.clerk?{right:RAStores.STORES[A.vars.store].clerk}:{})}),
  lines:A=>[N(`${RAStores.STORES[A.vars.store]?.label.toLowerCase()}. ${RALife.fmt(RALife.money())} on you.`)],
  choices:A=>[...(RAStores.STORES[A.vars.store]?.items||[]).map(it=>{const info=RAStores.itemInfo(it);return {label:`${info.label}${info.owned?' (OWNED)':''}`,sub:RALife.fmt(info.price),when:()=>!info.owned&&RALife.money()>=info.price,fx:X=>{if(RAStores.buy(it))X.set('bought',(X.vars.bought||0)+1);},next:'store'};}),{label:'BACK',next:back}]});
 // THE GRAVE — hub with storefront thresholds (VOL 1 §9.12). Couples everywhere: the crowd is in the pixels.
 D({id:'GRAVE',title:'THE GRAVE',lane:'mall',repeatable:true,memoryType:'mall',start:'arrive',nodes:{
  arrive:{env:A=>RALife.today().rain?'grave':'grave',actors:{left:'rich'},title:'THE GRAVE · NIGHT',
   enter:A=>{RALife.counter('graveVisits');},
   lines:A=>{const v=Number(RALife.flag('graveVisits'))||1;const out=[N(v<=1?'the fountain is on. couples everywhere. somebody is proposing by the trolley.':'the grave. same fountain. new couples.')];
    if(!RALife.hasFit('grave_hoodie'))out.push(S('kiosk_guy','YO. YO. SIR. YOU HAVE BEAUTIFUL SKIN. ONE SECOND.'));
    if(v%4===2)out.push(N('mall security is watching you. he is a vampire hunter trainee. he looks at his pamphlet, then at you.'));
    return out;},next:'hub'},
  hub:{env:'grave',actors:{left:'rich'},lines:[N('where to?')],
   choices:A=>{const L=RALife.L();const special=window.RAGraveEncounters?.(L)||[];
    return [...special,
     {label:"KIKI'S BOBA",fx:X=>X.set('store','boba'),next:'store'},{label:'DUOQLO',sub:'your store.',fx:X=>X.set('store','duoqlo'),next:'store'},{label:'BOUGHI-V',fx:X=>X.set('store','boughi'),next:'store'},{label:'KRADA',fx:X=>X.set('store','krada'),next:'store'},
     {label:'TRADEYA-HOES',fx:X=>X.set('store','tradeya'),next:'store'},{label:'PET CRYPT',fx:X=>X.set('store','pet_crypt'),next:'store'},{label:'THE FOOD COURT',fx:X=>X.set('store','food_court'),next:'store'},
     {label:'THE KIOSK',sub:RALife.hasFit('grave_hoodie')?'he leaves you alone now.':'he will not let you pass.',fx:X=>X.set('store','kiosk'),next:'store'},
     {label:"I'M GOOD",next:'out'}];}},
  store:store('hub'),
  out:{end:{outcome:'visited',memory:A=>({text:A.vars.bought?'shopping at the grave':'walking around the grave',lane:'mall',type:'mall',quality:A.vars.bought?1:.5}),chain:A=>A.vars.chain||null,home:A=>A.vars.chain?null:A.vars.bought?['rich','…i ain\'t even need that. i wanted it.',{vp:true}]:null}}
 }});
 RABtfPeople.byId.kiosk_guy={id:'kiosk_guy',name:'KIOSK GUY',look:{skin:'#c8a080',top:'#3a3a6a',hair:'#1a1a1a'}};
 // PEKING NAIJA — Rich's order: jollof + Peking duck + Sapporos. Pure fulfillment ($38).
 D({id:'PEKING',title:'PEKING NAIJA',lane:'food',repeatable:true,oncePerNight:true,start:'arrive',nodes:{
  arrive:{env:'peking_naija',actors:{left:'rich'},title:'PEKING NAIJA',lines:A=>[N('warm. loud. family-run. the auntie at the register already knows.'),S(null,'"the usual?"'),R('the usual.')],
   choices:[{label:'JOLLOF + PEKING DUCK + SAPPOROS ($38)',when:()=>RALife.money()>=38,fx:A=>{RALife.spend(38);RALife.light('connection',0,'x');},next:'eat'},{label:'TAKEOUT FOR THE BAG',sub:'JOLLOF $18 · FULL HEAL, ONCE PER FIGHT',when:()=>RALife.money()>=18,fx:A=>{RALife.spend(18);RALife.addItem('jollof',1,{cap:3});},next:'leave'}]},
  eat:{lines:A=>{const out=[N('the duck skin crackles. the jollof has the bottom-pot smoke. the sapporo is cold.')];if(RALife.count('maggi_dragon_crumble')>0)out.push(N('you have a dragon maggi crumble in your pocket.'));return out;},
   choices:A=>[{label:'JUST EAT',next:'done'},...(RALife.count('maggi_dragon_crumble')>0?[{label:'SEASON IT WITH THE DRAGON CUBE',octopus:true,fx:X=>{RALife.consume('maggi_dragon_crumble');RALife.setFlag('seasonedMeal',RALife.today().day);},next:'seasoned'}]:[])]},
  seasoned:{lines:[N('it tastes like every grandmother\'s kitchen at once.'),R('…mama.')],next:'done'},
  leave:{lines:[N('the bag is warm.')],end:{outcome:'takeout',memory:{text:'takeout from peking naija',lane:'food',quality:.5}}},
  done:{end:{outcome:'ate',memory:{text:'jollof and duck at peking naija',lane:'food'},receipt:{id:'first',caption:'the usual. jollof, duck, sapporo.'},home:['rich','full. happy. done.',{vp:true}]}}
 }});
 // DON CHUY'S — the taco truck outside the castle. Canciones until 3 a.m.
 D({id:'TACOS',title:"DON CHUY'S",lane:'food',repeatable:true,oncePerNight:true,start:'arrive',nodes:{
  arrive:{env:'taco_truck',actors:{left:'rich',right:'don_chuy'},lines:A=>[N('the radio is playing a canción. don chuy is singing along, badly, beautifully.'),S('don_chuy',RALife.counter('tacoVisits')<=1?'¡vecino! the castle guy! finally.':'¿lo de siempre, vecino?')],
   choices:[{label:'THREE TACOS ($9)',when:()=>RALife.money()>=9,fx:()=>RALife.spend(9),next:'eat'},{label:'SIX TACOS ($18)',when:()=>RALife.money()>=18,fx:A=>{RALife.spend(18);A.set('six',true);},next:'eat'}]},
  eat:{lines:A=>[N(A.vars.six?'six tacos. the song ends. another one starts.':'the tacos are $3 each and better than anything in the grave.'),...(RALife.today().rain?[N('rain on the awning. his cousins are here with a guitar.')]:[])],end:{outcome:'ate',memory:{text:'tacos at don chuy\'s truck',lane:'food',quality:.6},chain:A=>RALife.today().rain&&RAAdventures.available('A51')?'A51':null}}
 }});
 // A43 — NAIJA MART & THE MALT.
 D({id:'A43',title:'NAIJA MART & THE MALT',lane:'food',scope:'MUST',start:'arrive',nodes:{
  arrive:{env:'naija_mart',actors:{left:'rich',right:'auntie'},title:'NAIJA MART · HAWTHORNE',lines:[N('aisles of garri. plantain chips. a freezer of malt. stockfish.'),N('rich covers his nose. (fish.)'),E('auntie','the auntie at the register looks up.'),S('auntie','WHO IS YOUR FATHER?')],
   choices:[{label:'TELL HER',next:'q2'},{label:'"…ma?"',next:'q2'},{label:'ANSWER IN YORUBA',octopus:true,sub:'you only know three words.',next:'q2o'}]},
  q2:{lines:[S('auntie','ARE YOU MARRIED? WHY ARE YOUR NAILS BLACK?'),R('ma. i just want a malt.')],next:'buy'},
  q2o:{lines:[S('auntie','…eh? your accent is terrible. but your mother raised you.'),N('she gives you a discount on nothing.')],next:'buy'},
  buy:{lines:[N('malt, $2.'),S('auntie','and cubes. you need cubes. every kitchen needs cubes.'),N('she puts seasoning cubes in the bag. you did not ask. you pay $1.')],
   enter:A=>{RALife.spend(3);RALife.addItem('malt',1);RALife.addItem('maggi',6);RALife.setFlag('jollofWarsFlyer',true);},next:'curb'},
  curb:{env:'naija_lot',actors:{left:'rich'},lines:[N('outside, on the curb of the lot. the malt is cold.'),N('a flyer on the door: JOLLOF WARS. FIRST SUNDAY. BRING YOUR POT.')],
   end:{outcome:'malt',memory:{text:'drinking malt on the naija mart curb',lane:'food',quality:1.5},receipt:{caption:'malt on the curb. hawthorne.'},home:['rich','that malt was religious.',{vp:true}]}}
 }});
 RABtfPeople.byId.auntie={id:'auntie',name:'THE AUNTIE',look:{skin:'#5a3420',top:'#2a8a5a',hair:'#1a1a1a',hairShape:'hat',width:1.2}};
 D({id:'NAIJA',title:'NAIJA MART',lane:'food',repeatable:true,oncePerNight:true,available:L=>L.done('A43'),start:'store',nodes:{
  store:{...store('out'),env:'naija_mart',actors:{left:'rich',right:'auntie'}},
  out:{end:{outcome:'shop',memory:{text:'stocking up at naija mart',lane:'food',quality:.5}}}
 }});
 // Castle rooms as places (⌂ CASTLE, one tap from the bedroom).
 D({id:'THRONE',title:'THE THRONE ROOM',lane:'home',repeatable:true,start:'sit',nodes:{
  sit:{env:'throne',actors:{mid:'rich'},lines:A=>[N(RALife.life().clock.hungover?'you are hungover. the throne is the only place that makes sense.':'you sit on the throne. nobody is invading. it is kind of nice.')],
   choices:[{label:'SPAR WITH A TRAINING DUMMY',sub:'no stakes. test your loadout.',next:'spar'},{label:'JUST SIT',next:'done'}]},
  spar:{fight:{enemy:'training',params:{env:'throne',noPenalty:true,intro:'A TRAINING DUMMY. IT HAS NO FEELINGS.'},win:'done',lose:'done',spared:'done'}},
  done:{end:{outcome:'sat',memory:{text:'sitting on the throne',lane:'home',quality:.3}}}
 }});
 RAPlaces.define([
  {id:'castle:throne',hidden:true,adventure:'THRONE'},
  {id:'tacos',label:"DON CHUY'S (OUTSIDE)",sub:'TACOS · $3 EACH',adventure:'TACOS',order:5},
  {id:'grave',label:'THE GRAVE',sub:'THE MALL',adventure:'GRAVE',order:10},
  {id:'peking',label:'PEKING NAIJA',sub:'THE USUAL',adventure:'PEKING',order:11},
  {id:'naija_mart',label:'NAIJA MART',sub:'HAWTHORNE',adventure:L=>L.done('A43')?'NAIJA':null,order:30},
  {id:'castle:music',hidden:true,go:api=>RAAdventureScene.begin('COOK',{vars:{where:'music_room'}})},
  {id:'castle:garage',hidden:true,go:async api=>{window.RAPhone?.openApp?.('touge');return true;}},
  {id:'castle:armory',hidden:true,go:api=>RAAdventureScene.begin('ARMORY_WALL')},
  {id:'castle:coffin',hidden:true,go:api=>RAAdventureScene.begin('COFFIN')},
  {id:'castle:fishtank',hidden:true,go:api=>RAAdventureScene.begin('FISHTANK')}
 ]);
 D({id:'ARMORY_WALL',title:'THE ARMORY WALL',lane:'combat',repeatable:true,start:'look',nodes:{look:{env:'armory',actors:{left:'rich'},lines:A=>{const g=RALife.life().ownership.guns||[];return [N(g.length?`on the wall: ${g.map(x=>RACombatData.GUNS[x.id]?.label).filter(Boolean).join(', ').toLowerCase()}.`:'an empty wall. it wants guns.'),...(RALife.flag('bonesworthSword')?[N("sir bonesworth's sword hangs in the middle. it is rusted. it is perfect.")]:[])];},end:{outcome:'looked',memory:{text:'looking at the armory wall',lane:'combat',quality:.3}}}}});
 D({id:'COFFIN',title:'THE COFFIN',lane:'home',repeatable:true,start:'look',nodes:{look:{env:'bedroom',actors:{left:'rich'},lines:A=>[N(RALife.life().clock.hungover?'you are hungover. you get in the coffin. perfect darkness.':'a very nice coffin. you only sleep in it when hungover.')],end:{outcome:'looked',memory:{text:'the coffin upgrade',lane:'home',quality:.2}}}}});
 D({id:'FISHTANK',title:'THE FISH TANK ROOM',lane:'home',repeatable:true,start:'look',nodes:{look:{env:'fish_tank',actors:null,lines:A=>{const n=RALife.count('fish_rare_moon_koi')+RALife.count('fish_rare_grouper');return [N('you stand in the doorway. you do not go in.'),N(n?`${n} rare fish. guests love it.`:'it is empty. it is still a flex.'),R('i\'m good right here.')];},end:{outcome:'looked',memory:{text:'the fish tank room (from the doorway)',lane:'home',quality:.3}}}}});
 // VampGPT lanes: 2–3 real ways to pursue each want (Octopus Brain as UI).
 RAVampGPT.defineLane('money',[
  {id:'lane:rent',label:'COLLECT RENT',sub:'SHANNON FRIDAY MONEY',when:L=>(L.life.ownership.properties||[]).some(p=>p.rentDue>0),go:api=>{api.go('realEstate');return true;}},
  {id:'lane:property',label:'BUY A BUILDING',sub:'REALMONEYREALESTATE',go:api=>{api.go('realEstate');return true;}},
  {id:'lane:slurp',label:'WORK A SHIFT',sub:L=>L.done('A08')?'SLURP DYNASTY':'you ever had a job? (i know you haven\'t.)',adventure:L=>L.done('A08')?'SLURP':'A08'},
  {id:'lane:pier',label:'FISH. WALLETS BE IN THERE.',when:L=>L.done('A12'),adventure:'PIER'},
  {id:'lane:show',label:'PLAY A SHOW',when:L=>L.done('A14'),adventure:'SHOW'},
  {id:'lane:tandem',label:'DRIFT FOR MONEY',when:L=>L.done('A13'),adventure:'TANDEM_BATTLE'},
  {id:'lane:octo_money',label:'SELL SOMETHING WEIRD ON VAMPGRAM',octopus:true,when:L=>L.count('sensei_memento')>0||L.count('flip_phone')>0,go:api=>{RALife.addMoney(200);api.message('someone paid $200 for it. you do not ask.');return true;}}
 ]);
 RAVampGPT.defineLane('people',[
  {id:'lane:dms',label:'CHECK YOUR DMS',sub:'INSTAHOE',when:L=>L.app('instahoe'),go:api=>{api.go('app:instahoe');return true;}},
  {id:'lane:grave',label:'GO WHERE PEOPLE ARE',sub:'THE GRAVE',adventure:'GRAVE'},
  {id:'lane:party',label:'FIND A PARTY',sub:L=>L.flag('ogunsRaveCompleted')?'PARTIES THIS WEEK':'somebody is always throwing something',adventure:L=>window.RAParties?.next?.(L)||null},
  {id:'lane:host',label:'THROW ONE',sub:'PARTY HALL',when:L=>L.hasRoom('party_hall'),adventure:L=>L.done('A26')?'HOST':'A26'},
  {id:'lane:homies',label:'TEXT THE HOMIES',when:L=>L.app('texts'),go:api=>{api.go('app:texts');return true;}}
 ]);
 // Early wants. Priority = story spine; weight = variety.
 RATemptations.define([
  {id:'crave_jollof',source:'craving',line:'i want jollof and duck.',minDay:2,weight:2,cooldown:4,repeatable:true,action:'peking'},
  {id:'crave_tacos',source:'craving',line:'don chuy is playing the good radio tonight.',weight:1.5,cooldown:3,repeatable:true,action:'tacos'},
  {id:'crave_malt',source:'craving',line:'i want a malt so bad.',minDay:3,weight:2,adventure:'A43'},
  {id:'vg_outside',source:'vampgpt',line:"you ain't been outside in 3 days oga.",weight:1,cooldown:5,repeatable:true,when:L=>(L.life.clock.nightOutings||[]).length===0&&L.day>3,action:'grave'},
  {id:'vg_grave',source:'vampgpt',line:'the grave is lit on fridays.',weight:1,repeatable:true,cooldown:6,when:L=>L.info.friday,action:'grave'},
  {id:'supra_crest',source:'possession',line:'the supra: "angeles crest is empty on tuesdays."',weight:2,when:L=>L.hasCar('toyota_supra_mk4_001')&&!L.done('A13'),action:'crest_hint'}
 ]);
 RAPlaces.define([{id:'crest_hint',hidden:true,go:api=>{api.message('somebody named pinky is gonna dm you about that.');RALife.setFlag('pinkyDmSoon',true);return true;}}]);
})();
