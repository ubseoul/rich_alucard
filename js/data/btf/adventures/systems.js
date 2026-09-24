(function(){
 // Repeatable system adventures shared by many lanes: SHOP (any store), COOK (music), RE_VIEWING (Shannon),
 // RB_DELIVERY (RICHBOIMPORTS purchase scene), TANDEM_BATTLE (Midnight Mafia).
 const {R,S,N,E}=RAContent;const D=RAAdventures.define;const F=()=>RACombatData.FITS;
 const STORES={
  boba:{label:"KIKI'S BOBA",env:'boba_shop',clerk:'kiki',items:[{id:'boba',kind:'item',label:'BOBA (BAG)',price:7},{id:'gift_boba_card',kind:'gift',label:'BOBA GIFT CARD (GIFT)',price:25}]},
  boughi:{label:'BOUGHI-V',env:'grave',items:[{id:'boughi_blazer',kind:'fit'},{id:'leather_trench',kind:'fit'},{id:'gift_boughi_v',kind:'gift',label:'BOUGHI-V SCARF (GIFT)',price:420}]},
  krada:{label:'KRADA',env:'grave',items:[{id:'krada_shades',kind:'fit'},{id:'gift_krada',kind:'gift',label:'KRADA BAG (GIFT)',price:1800}]},
  tradeya:{label:'TRADEYA-HOES',env:'grave',items:[{id:'tradeya_chain',kind:'fit'},{id:'drift_sneakers',kind:'fit'},{id:'gift_tradeya',kind:'gift',label:'TRADEYA-HOES BRACELET (GIFT)',price:900}]},
  pet_crypt:{label:'PET CRYPT',env:'pet_crypt',items:[{id:'treats',kind:'item',label:'DRAGON TREATS',price:12},{id:'slides',kind:'fit'},{id:'goldfish_food',kind:'item',label:'GOLDFISH FOOD',price:5},{id:'gift_pet_crypt',kind:'gift',label:'A VERY SMALL CACTUS (GIFT)',price:30}]},
  duoqlo:{label:'DUOQLO',env:'grave',items:[{id:'duoqlo_airism',kind:'fit'},{id:'gift_duoqlo',kind:'gift',label:'DUOQLO HEATTECH SET (GIFT)',price:40},{id:'prop_duoqlo_bag',kind:'prop',label:'A DUOQLO BAG (NEVER UNPACKED)',price:35}]},
  food_court:{label:'THE FOOD COURT',env:'food_court',items:[{id:'garlic',kind:'item',label:'GARLIC KNOTS',price:6},{id:'steak',kind:'item',label:'STEAK (TO GO)',price:30},{id:'sapporo',kind:'item',label:'SAPPORO',price:4}]},
  kiosk:{label:'THE KIOSK',env:'grave',items:[{id:'grave_hoodie',kind:'fit'},{id:'prop_plant',kind:'prop',label:'A PLANT (YOU WILL FORGET TO WATER IT)',price:28}]},
  peking:{label:'PEKING NAIJA (TAKEOUT)',env:'peking_naija',items:[{id:'jollof',kind:'item',label:'JOLLOF (TAKEOUT)',price:18},{id:'sapporo',kind:'item',label:'SAPPORO',price:4}]},
  kush:{label:'KUSH & CRYPT',env:'kush_crypt',clerk:'reggie',items:[{id:'dragon_keef',kind:'item',label:'DRAGON KEEF (MAZDA TREAT)',price:60},{id:'treats',kind:'item',label:'DRAGON TREATS',price:12},{id:'gift_dragon_keef',kind:'gift',label:'DRAGON KEEF, GIFT-WRAPPED',price:60}]},
  blood_bank:{label:'LIFEBLOOD VENDING',env:'blood_bank',items:[{id:'salts',kind:'item',label:'SMELLING SALTS',price:15}]},
  naija_mart:{label:'NAIJA MART',env:'naija_mart',items:[{id:'maggi',kind:'item',label:'SEASONING CUBES',price:1},{id:'malt',kind:'item',label:'MALT',price:2},{id:'gift_maggi',kind:'gift',label:'A PACK OF CUBES, WITH A BOW (GIFT)',price:3}]},
  florist:{label:'THE FLORIST ON SUNSET',env:'street_night',items:[{id:'gift_flowers',kind:'gift',label:'LIVE FLOWERS (GIFT)',price:65}]}
 };
 function itemInfo(it){if(it.kind==='fit'){const f=F()[it.id];return {label:f.label,price:f.price,owned:RALife.hasFit(it.id)};}if(it.kind==='prop')return {label:it.label,price:it.price,owned:RALife.hasProp(it.id)};return {label:it.label,price:it.price,owned:false};}
 function buy(it){const info=itemInfo(it);if(info.owned||!RALife.spend(info.price))return false;
  if(it.kind==='fit'){RALife.addFit(it.id);const f=F()[it.id];RALife.equipFit(f.slot,it.id);RALife.remember({text:`bought the ${f.label.toLowerCase()}`,lane:'mall',type:'mall'});if(it.id==='duoqlo_airism')RALife.setFlag('duoqloFit',true);}
  else if(it.kind==='prop'){RALife.addProp(it.id);}else RALife.addItem(it.id,1,{cap:it.kind==='item'?9:undefined});
  RALife.counter('mallSpend',info.price);return true;}
 window.RAStores={STORES,buy,itemInfo};
 D({id:'SHOP',title:'SHOPPING',lane:'mall',repeatable:true,memoryType:'mall',testVars:{store:'krada'},start:'store',nodes:{
  store:{env:A=>STORES[A.vars.store]?.env||'grave',actors:A=>({left:'rich',...(STORES[A.vars.store]?.clerk?{right:STORES[A.vars.store].clerk}:{})}),title:A=>STORES[A.vars.store]?.label||'THE STORE',
   lines:A=>[N(A.vars.bought?`${RALife.fmt(RALife.money())} left.`:`${STORES[A.vars.store]?.label.toLowerCase()}. what you want?`)],
   choices:A=>[...(STORES[A.vars.store]?.items||[]).map(it=>{const info=itemInfo(it);return {label:`${info.label}${info.owned?' (OWNED)':''}`,sub:it.kind==='fit'?`${RALife.fmt(info.price)} · ${fitNote(it.id)}`:RALife.fmt(info.price),when:()=>!info.owned&&RALife.money()>=info.price,fx:X=>{if(buy(it))X.set('bought',(X.vars.bought||0)+1);},next:'store'};}),{label:"I'M GOOD",next:'out'}]},
  out:{end:{outcome:A=>A.vars.bought?'bought':'browsed',memory:A=>({text:A.vars.bought?`shopping at ${STORES[A.vars.store]?.label.toLowerCase()}`:`window shopping at ${STORES[A.vars.store]?.label.toLowerCase()}`,lane:'mall',quality:A.vars.bought?1:.5}),home:A=>A.vars.bought?['rich','…i ain\'t even need that. i wanted it.',{vp:true}]:null,location:'bedroom'}}
 }});
 function fitNote(id){const f=F()[id];if(f.maxhp)return `+${f.maxhp} MAX HP`;if(f.def)return `+${Math.round(f.def*100)}% DEFENSE`;if(f.crit)return `+${Math.round(f.crit*100)}% CRIT`;if(f.charisma)return 'CHARISMA ALWAYS LANDS ONCE';if(f.style)return '+5% TOUGE STYLE';if(f.gun)return '+10% GUN DAMAGE';if(id==='grave_hoodie')return 'NOTHING. IT\'S COMFY.';if(id==='slides')return 'UNCLE SUNDAY RESPECTS YOU';return 'NO STATS. JUST RIGHT.';}
 // COOK A TRACK — the 60-second choice ritual (café laptop or Music Room).
 D({id:'COOK',title:'COOK A TRACK',lane:'music',repeatable:true,oncePerNight:true,memoryType:'music',start:'memory',
  available:L=>RALife.recentMemories(10).length>0,
  nodes:{
  memory:{env:A=>A.vars.where==='music_room'?'music_room':'cafe',actors:{left:'rich'},lines:[N('laptop open. what is this one about?')],
   choices:A=>RAMusic.memories().slice(0,4).map(m=>({label:m.text.toUpperCase(),fx:X=>X.set('mem',m.id),next:'beat'}))},
  beat:{lines:[N('pick the beat.')],choices:A=>RAMusic.beats().slice(0,4).map(b=>({label:b.label,fx:X=>X.set('beat',b.id),next:'hook'}))},
  hook:{lines:[N('a hook?')],choices:A=>[...RAMusic.hooks().slice(0,3).map((h,i)=>({label:`"${h.word}"`,sub:h.fromMemory?`HOOK FROM: ${h.fromMemory.toUpperCase()}`:'FROM BARS',fx:X=>X.set('hook',i),next:'title'})),{label:'NO HOOK. RAW.',fx:X=>X.set('hook',null),next:'title'}]},
  title:{lines:[N('what is it called?')],choices:A=>{const mem=RAState.get().life.memoryLog.find(m=>m.id===A.vars.mem)||RAMusic.memories()[0];return RAMusic.titles(mem).map(t=>({label:t.title,sub:'TITLE · VOICE PASS',fx:X=>X.set('title',t.title),next:'cooked'}));}},
  cooked:{enter:A=>{const r=RAMusic.cook({memoryId:A.vars.mem,beat:A.vars.beat,hookIndex:A.vars.hook,title:A.vars.title});A.set('song',r?.song?.id||null);A.set('unlocked',r?.unlocked||null);},
   lines:A=>{const tr=RARadio.TRACKS.find(t=>t.id===A.vars.unlocked);return [N(`"${A.vars.title}" is cooked.`),...(tr?[N(`this is the song that came out of that night: ${tr.title}.`)]:[])];},
   choices:[{label:'DROP IT ON VAMPGRAM',fx:A=>RAMusic.drop(A.vars.song,'vampgram'),next:'done'},{label:'SIT ON IT',next:'done'}]},
  done:{end:{outcome:'cooked',memory:A=>({text:`cooked a song about ${(RAState.get().life.memoryLog.find(m=>m.id===A.vars.mem)?.text||'that night')}`,lane:'music'}),home:['rich','…that one might be something.',{vp:true}]}}
 }});
 // Shannon walkthrough for the repeatable property listings.
 D({id:'RE_VIEWING',title:'A VIEWING WITH SHANNON',lane:'property',repeatable:true,testVars:{listing:'re_duplex_inglewood'},testSetup:ctx=>{ctx.RAState.patch('life.ownership.properties',[{id:'property_la_4p_01',ownershipStatus:'owned',weeklyRent:1400,rentDue:0}]);},start:'arrive',nodes:{
  arrive:{env:'street_night',actors:{left:'rich',right:'shannon_001'},title:A=>{const l=RARealEstate.LISTINGS.find(x=>x.id===A.vars.listing);return `${l?.label} · ${l?.hood}`;},
   lines:A=>{const l=RARealEstate.LISTINGS.find(x=>x.id===A.vars.listing);return [S('shannon_001',`${l?.label.toLowerCase()}. ${RALife.fmt(l?.rent||0)} a week in rent when it's full. it's full.`),S('shannon_001',RARelations.remembers('shannon_001','property_shannon_closed_deal')?'after the fourplex, I stopped being surprised by you. mostly.':'walk it with me.'),...(l?.perk?[S('shannon_001',l.perk)]:[])];},
   choices:A=>{const l=RARealEstate.LISTINGS.find(x=>x.id===A.vars.listing);return [{label:`BUY IT CASH (${RALife.fmt(l.price)})`,when:()=>RALife.money()>=l.price,fx:X=>X.set('bought',RARealEstate.buy(l.id)),next:'done'},{label:`30% DOWN (${RALife.fmt(l.price*.3)})`,sub:'SHANNON PAYS THE REST FROM RENT. NO INTEREST.',when:()=>RALife.money()>=l.price*.3,fx:X=>X.set('bought',RARealEstate.buy(l.id,{down:true})),next:'done'},{label:'NOT TODAY',next:'done'}];}},
  done:{lines:A=>[S('shannon_001',A.vars.bought?'congratulations. I will text you on friday.':'it will still be here. probably.')],end:{outcome:A=>A.vars.bought?'bought':'passed',memory:A=>({text:A.vars.bought?'bought another building':'walked a building with shannon',lane:'property'}),home:A=>A.vars.bought?['rich','landlord shit.',{vp:true}]:null}}
 }});
 D({id:'RB_DELIVERY',title:'RICHBOIMPORTS DELIVERY',lane:'cars',repeatable:true,testVars:{car:'urus'},start:'arrive',nodes:{
  arrive:{env:'castle_exterior',actors:{left:'rich'},title:'OUTSIDE THE CASTLE',lines:A=>{const c=RACars.CATALOG[A.vars.car];return [N(`a truck pulls up. the whole block comes outside.`),N(`the ${c?.short.toLowerCase()} rolls off the ramp.`),S('don_chuy','¡ÁNDALE!'),R(A.vars.car==='urus'?'it\'s an suv. it\'s fine. it\'s fine.':'…yeah.')];},
   end:{outcome:'delivered',memory:A=>({text:`the ${RACars.CATALOG[A.vars.car]?.short.toLowerCase()} got delivered`,lane:'cars'}),receipt:A=>({id:`rb:${A.vars.car}`,caption:`the whole block came outside for the ${RACars.CATALOG[A.vars.car]?.short.toLowerCase()}.`})}}
 }});
 D({id:'TANDEM_BATTLE',title:'MIDNIGHT MAFIA · TANDEM',lane:'cars',repeatable:true,oncePerNight:true,available:L=>L.done('A13'),start:'meet',nodes:{
  meet:{env:'crest',actors:{left:'rich',right:'tokyo_tony'},title:'ANGELES CREST · MIDNIGHT MAFIA',lines:A=>[S('tokyo_tony',RALife.done('A36')?'rematch. same rules. you lead, then I lead.':'you the one pinky posted? lead run. try not to cry.')],next:'run'},
  run:{minigame:{id:'touge',params:A=>({course:'angeles_crest',car:RACars.toTouge(RALife.ownedCars()[0]||{}),tandem:{rival:'TOKYO TONY',role:'lead',threshold:20000},rain:RALife.today().rain}),next:(A,r)=>{A.set('won',r.outcome==='win');return 'result';}}},
  result:{lines:A=>[S('tokyo_tony',A.vars.won?'…ok. OK. you can drive.':'go home. practice. come back.')],end:{outcome:A=>A.vars.won?'win':'lose',fx:A=>{if(A.vars.won){const pay=1000+RALife.hash(RALife.today().day)%9000;RALife.addMoney(pay);RALife.addPoints('clout',12);}},memory:A=>({text:A.vars.won?'won a tandem battle':'lost a tandem battle',lane:'cars'})}}
 }});
})();
