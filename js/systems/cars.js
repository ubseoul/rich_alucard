(function(){
 // LANE 8 — CARS & TOUGE (VOL 1 §9.8, VOL 3 §5.3/§7.1, VOL 5 §4.2/§5.1). The existing Supra first-collection
 // flow (RAJDMImports) is preserved exactly; this adds the rest of the garage around it.
 const SUPRA='toyota_supra_mk4_001';
 const CATALOG={
  s15:{id:'nissan_silvia_s15',key:'s15',make:'Nissan',model:'Silvia S15',short:'S15',price:38000,store:'jdm',manual:true},
  s2000:{id:'honda_s2000_pink',key:'s2000',make:'Honda',model:'S2000 (pink, fuzzy wheels)',short:'S2000',price:42000,store:'pinky',manual:true},
  r34:{id:'nissan_skyline_r34',key:'r34',make:'Nissan',model:'Skyline R34',short:'R34',price:185000,store:'jdm_auction',manual:true},
  urus:{id:'lambo_urus_oxblood',key:'urus',make:'Lamborghini',model:'Urus (oxblood)',short:'URUS',price:260000,store:'richboi',clout:15,rep:5},
  aventador:{id:'lambo_aventador',key:'aventador',make:'Lamborghini',model:'Aventador',short:'AVENTADOR',price:520000,store:'richboi',clout:25,rep:10},
  ferrari:{id:'ferrari_f40',key:'ferrari',make:'Ferrari',model:'F40',short:'FERRARI',price:2400000,store:'richboi',needsRep:2,clout:25,rep:10}
 };
 const keyOf=car=>car.id===SUPRA?'supra':Object.values(CATALOG).find(c=>c.id===car.id)?.key||'supra';
 const toTouge=car=>{const k=keyOf(car);if(k==='r34')return car.parts?.rwd?'r34_rwd':'r34_awd';return k;};
 function owned(key){const c=key==='supra'?{id:SUPRA}:CATALOG[key];return !!c&&RALife.hasCar(c.id);}
 function buy(key){const c=CATALOG[key];if(!c||owned(key)||RALife.money()<c.price)return false;
  // Purchase and ownership commit together. A double click/reload cannot debit twice.
  const life=JSON.parse(JSON.stringify(RALife.life()));life.resources.money-=c.price;
  life.ownership.cars.push({id:c.id,make:c.make,model:c.model,short:c.short,price:c.price,value:c.price,parts:{},acquisitionSource:c.store,ownershipStatus:'owned',acquiredDay:RALife.today().day});
  life.world.flags.tougeCar=c.id;RAState.patch('life',life);
  if(c.clout)RALife.addPoints('clout',c.clout);if(c.rep)RALife.addPoints('rep',c.rep);RALife.light('ownership',1,`car:${key}`);
  RALife.remember({text:`bought the ${c.short.toLowerCase()}`,lane:'cars'});RALife.receipt({id:`car:${key}`,caption:`the ${c.short.toLowerCase()}. mine.`,lane:'cars'});return true;}
 function installParts(carId,parts){const car=RALife.ownedCars().find(c=>c.id===carId||keyOf(c)===carId);if(!car)return;RALife.patchCar(car.id,{parts:{...(car.parts||{}),...parts}});}
 const supraCar=()=>RALife.ownedCars().find(c=>c.id===SUPRA);
 // ART SHIP 014 LISTING surfaces (68×50 frozen art, shown at native pixel scale) on every car card that has one.
 function carImg(key){const src=window.RAArtRegistry?.vehicles?.listing?.[key]?.asset;return src?`<img class="car-listing" src="${src}" alt="" width="68" height="50" draggable="false">`:'';}
 function listing(c,{label,sub,action,disabled}){return `<div class="phone-card">${carImg(c.key)}<b>${c.make.toUpperCase()} ${c.model.toUpperCase()}</b>${RALife.fmt(c.price)}${sub?`<br><span class="phone-small">${sub}</span>`:''}<button type="button" class="phone-button" data-phone-action="${action}" ${disabled?'disabled':''}>${label}</button></div>`;}
 function jdmMarkup(){
  if(window.RARC3)return boundedMarkup();
  const base=window.RAJDMImports?.storeMarkup?.()||'<h1>JDMIMPORTS</h1>';
  if(!supraCar())return base;
  const out=[];const L=RALife.L();
  out.push(owned('s15')?`<div class="phone-card">${carImg(RALife.ownedCars().find(c=>c.id===CATALOG.s15.id)?.parts?.bodykit?'s15_bodykit':'s15')}<b>SILVIA S15</b>OWNED${RALife.ownedCars().find(c=>c.id===CATALOG.s15.id)?.parts?.bodykit?' · BODY KIT':''}</div>`:listing(CATALOG.s15,{label:RALife.money()>=38000?'BUY':'NOT ENOUGH CASH',action:'do:cars:buy:s15',disabled:RALife.money()<38000,sub:'the drift queen. forgiving.'}));
  if(L.flag('r34Lead')&&!owned('r34'))out.push(listing(CATALOG.r34,{label:RALife.money()>=185000?'WIN THE AUCTION':'NOT ENOUGH CASH',action:'do:cars:buy:r34',disabled:RALife.money()<185000,sub:'auction lead from tokyo tony. AWD — it grips. conversion sold separately.'}));
  out.push(`<button type="button" class="phone-button" data-phone-action="do:cars:garage">SHOP BAY (PARTS)</button>`);
  const importLine=L.done('A13')?'"SO YOU CAN DRIVE STICK. STILL WON\'T TIP."':'"I BET YOU DON\'T EVEN KNOW HOW TO DRIVE STICK!"';
  return base.replace(/<div class="jdm-store-actions">[\s\S]*$/,'')+`<p class="phone-speaker">IMPORT GUY</p><p class="phone-small">${importLine}</p>${out.join('')}<div class="jdm-store-actions"><button type="button" class="phone-button jdm-action" data-jdm-action="home">HOME</button></div>`;
 }
 // RC4 bounded JDM surface: canon Supra collection + direct S15 purchase. Other
 // listings remain deferred in source. Existing owned vehicles remain usable.
 const usableCars=()=>window.RAVehicles?.available?.()||RALife.ownedCars().filter(c=>!['LOST','IMPOUNDED','SOLD'].includes(String(c.ownershipStatus).toUpperCase()));
 function boundedMarkup(){
  const cars=usableCars(),selected=cars.find(c=>c.id===RALife.flag('tougeCar'))||cars[0];
  const held=RALife.heldCars();
  const unavailable=c=>window.RAVehicles?.isTributed(c.id)?'TRIBUTED':String(c.ownershipStatus||'unavailable').toUpperCase();
  const supra=held.find(c=>c.id===SUPRA),s15=held.find(c=>c.id===CATALOG.s15.id);
  const base=supra&&!cars.some(c=>c.id===SUPRA)?`<h1>JDMIMPORTS</h1><div class="phone-card">${carImg('supra')}<b>TOYOTA SUPRA MK4</b>${unavailable(supra)}</div><button type="button" class="phone-button" data-phone-action="home">HOME</button>`:(window.RAJDMImports?.storeMarkup?.()||'<h1>JDM IMPORTS</h1>');
  return base+
   (owned('s15')?`<div class="phone-card">${carImg('s15')}<b>SILVIA S15</b>${cars.some(c=>c.id===CATALOG.s15.id)?'OWNED':unavailable(s15||{id:CATALOG.s15.id})}</div>`:listing(CATALOG.s15,{label:RALife.money()>=CATALOG.s15.price?'BUY':'NOT ENOUGH CASH',action:'do:cars:buy:s15',disabled:RALife.money()<CATALOG.s15.price,sub:'Optional personal car. Crew transport remains available.'}))+
   `<h2>GARAGE</h2>${held.map(c=>{const usable=cars.some(x=>x.id===c.id);return `<div class="phone-card">${carImg(keyOf(c))}<b>${c.short||c.model}</b>${usable?(selected?.id===c.id?'SELECTED':`<button type="button" class="phone-button" data-phone-action="do:cars:select:${c.id}">SELECT</button>`):window.RAVehicles?.isTributed(c.id)?'TRIBUTED':String(c.ownershipStatus).toUpperCase()}</div>`;}).join('')||'<p>No personal car owned.</p>'}
   ${selected?`<button type="button" class="phone-button" data-phone-action="do:cars:drive">DRIVE SELECTED CAR</button>`:''}`;
 }
 function richboiMarkup(){const out=['<h1>RICHBOIMPORTS</h1><p class="phone-small">browse. dream. or don\'t.</p>'];for(const k of ['urus','aventador','ferrari']){const c=CATALOG[k];const lock=c.needsRep&&RALife.rep()<c.needsRep;out.push(owned(k)?`<div class="phone-card">${carImg(k)}<b>${c.short}</b>OWNED</div>`:listing(c,{label:lock?'NOT ON YOUR LEVEL YET':RALife.money()>=c.price?'BUY IT':'NOT ENOUGH CASH',action:`do:richboi:buy:${k}`,disabled:lock||RALife.money()<c.price,sub:k==='urus'?'an SUV. drifting it is a comedy of physics.':k==='aventador'?'absurd speed. awful drifter. max clout.':'the only exotic that actually drifts.'}));}return out.join('');}
 async function richboiAction(act,arg,api){if(act==='buy'&&buy(arg)){await api.close();RAAdventureScene.begin('RB_DELIVERY',{vars:{car:arg}});}}
 async function garage(api,carKey){const cars=RALife.ownedCars();const car=cars.find(c=>keyOf(c)===carKey)||cars.find(c=>c.id===RALife.flag('tougeCar'))||cars.at(-1);if(!car)return;const k=keyOf(car);
  await api.launch('garage',{car:toTouge(car).replace('r34_awd','r34').replace('r34_rwd','r34'),owned:car.parts||{},parts:car.parts||{},money:RALife.money(),lessonsSeen:RALife.flag('garageLessons')||[]},result=>{if(result.rewards?.parts)installParts(car.id,result.rewards.parts);if(result.data?.testDrive)window.RACars.touge({course:'docks',car:car.id,short:true});});}
 // (FCPB convergence) the bare hidden 'cars' registration that stood here was replaced by the fuller one below: RAPhoneApps.register
 // is last-writer-wins, so it was dead code and left two registrations of one id. One registration remains, at the RACars export.
 A_register();
 function A_register(){
  window.RAPhoneApps?.register({id:'touge',label:'TOUGE',order:14,
   render(sub){const best=RAMinigames.progress('touge').best||{};const courses=[['angeles_crest','ANGELES CREST'],['docks','THE DOCKS'],['grave_garage','THE GRAVE GARAGE']];
    const cars=RALife.ownedCars();const pick=RALife.flag('tougeCar')||cars[0]?.id;
    const riders=passengers(),rider=RALife.flag('passenger')||null;
    return `<h1>TOUGE</h1><p class="phone-small">CAR: ${(cars.find(c=>c.id===pick)?.short||cars.find(c=>c.id===pick)?.model||'').toUpperCase()}</p><div class="phone-row">${cars.map(c=>`<button type="button" class="phone-button" data-phone-action="do:touge:car:${c.id}">${(c.short||c.model).toUpperCase()}${c.id===pick?' ✓':''}</button>`).join('')}</div>${riders.length?`<p class="phone-small">PASSENGER SEAT</p><div class="phone-row">${['',...riders].map(r=>`<button type="button" class="phone-button" data-phone-action="do:touge:passenger:${r}">${r||'NOBODY'}${(r||null)===rider?' ✓':''}</button>`).join('')}</div>`:''}${RALife.hasRoom('garage')?`<button type="button" class="phone-button" data-phone-action="do:touge:garage">PARTS BAY (YOUR GARAGE)</button>`:''}${courses.map(([id,label])=>`<div class="phone-card"><b>${label}</b>1. LAURA — ${id==='angeles_crest'?'184,220':id==='docks'?'121,400':'98,050'}<br>YOU: ${new Intl.NumberFormat('en-US').format(Math.max(0,...Object.entries(best).filter(([k])=>k.startsWith(id)).map(([,v])=>v)))}<button type="button" class="phone-button" data-phone-action="do:touge:run:${id}">RUN</button></div>`).join('')}${RALife.done('A13')?`<button type="button" class="phone-button" data-phone-action="do:touge:tandem">TANDEM · MIDNIGHT MAFIA</button>`:''}`;},
   async onAction(act,arg,api){if(act==='car'){RALife.setFlag('tougeCar',arg);api.refresh();return;}if(act==='passenger'){RALife.setFlag('passenger',passengers().includes(arg)?arg:null);api.refresh();return;}if(act==='garage'){await garage(api);return;}if(act==='run'){await touge({course:arg},api);return;}if(act==='tandem'){await api.close();const adv=RAAdventures.available('A36')?'A36':'TANDEM_BATTLE';RAAdventureScene.begin(adv,{from:'touge'});}}});
 }
 async function touge({course='angeles_crest',car=null,lesson=null,tandem=null,short=false}={},api=window.RAPhone?.api){
  const cars=usableCars();const c=cars.find(x=>x.id===(car||RALife.flag('tougeCar')))||cars[0];if(!c)return null;
  const board=[{name:'LAURA',score:{angeles_crest:184220,docks:121400,grave_garage:98050}[course]||150000},{name:'TOKYO TONY',score:141000},{name:'PINKY',score:118500}];
  const passenger=passengers().includes(RALife.flag('passenger'))?RALife.flag('passenger'):null;
  const passengerSprite=passenger==='TRISTAN'?window.RABtfPeople?.get('tristan')?.states?.passenger||null:null;
  const params={car:toTouge(c),parts:c.parts||{},course,lesson,tandem,rain:RALife.today().rain,leaderboard:board,passenger,passengerSprite};
  const result=api?.launch?await api.launch('touge',params):await RAMinigames.launch('touge',params);
  if(result&&!result.quit){RALife.light('chaos',c.id===CATALOG.urus.id&&course==='grave_garage'?3:0,'urus-garage');if(result.score>30000)RALife.light('expression',1,`touge:${course}`);
   if(c.id===CATALOG.urus.id&&course==='grave_garage'&&!RALife.flag('urusViral')){RALife.setFlag('urusViral',true);RALife.addFollowers(150);window.RAVampGram?.post?.({handle:'grave.garage.cam',text:'somebody drifted an URUS in the grave parking garage. the crowd lost it.',likes:40000});RALife.light('chaos',3,'viral:urus');window.RANodd?.after?.('urus');}
   if(result.score>board[0].score)RALife.counter('lauraLedger');}
  return result;
 }
 // Who can ride along (VOL 5 §5.1 PASSENGER SEAT; §2.2 Tristan "rides along ... as the passenger commentator";
 // the sphynx cat in a tiny helmet). A date's reaction changing the date's read is not built (needs design).
 function passengers(){const out=[];if(RARelations.met('tristan'))out.push('TRISTAN');if(RALife.life().ownership.cat)out.push('THE CAT');return out;}
 window.RACars={carImg,passengers,CATALOG,SUPRA,keyOf,toTouge,owned,buy,installParts,jdmMarkup,boundedMarkup,usableCars,richboiMarkup,richboiAction,garage,touge};
 // JDMIMPORTS page actions routed through the phone registry ("do:cars:...").
 window.RAPhoneApps?.register({id:'cars',label:'CARS',hidden:true,onAction:async(act,arg,api)=>{
  if(window.RARC3){
   if(act==='buy'&&arg==='s15'){buy(arg);api.refresh();return;}
   if(act==='select'&&usableCars().some(c=>c.id===arg)){RALife.setFlag('tougeCar',arg);api.refresh();return;}
   if(act==='drive')return touge({course:'docks'},api);
   return;
  }
  if(act==='buy'){if(buy(arg))api.refresh();else api.message('not enough cash.');}if(act==='garage')await garage(api);
 }});
 // RICHBOIMPORTS unlock: $500K net worth OR the Duchess tease.
 RAClock.onWake('richboi-unlock',70,()=>{if(!RALife.appUnlocked('richboi')&&(RALife.netWorth()>=500000||RALife.flag('duchessTease')))RALife.unlockApp('richboi');});
})();
