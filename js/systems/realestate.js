(function(){
 // LANE 6 — PROPERTY & SHANNON, the repeatable form (VOL 1 §9.6, VOL 3 §5.2). The released Paloma fourplex
 // flow is untouched and still first; more listings open after it. Events are mostly absorbed by Shannon.
 const LISTINGS=[
  {id:'re_duplex_inglewood',label:'DUPLEX',hood:'INGLEWOOD',price:180000,rent:4200,eventEvery:14},
  {id:'re_bungalow_highland',label:'BUNGALOW',hood:'HIGHLAND PARK',price:260000,rent:5900,eventEvery:14},
  {id:'re_courtyard_ktown',label:'COURTYARD FOURPLEX',hood:'KOREATOWN',price:420000,rent:10500,eventEvery:10},
  {id:'re_laundromat_ktown',label:'LAUNDROMAT BUILDING',hood:'KOREATOWN',price:560000,rent:12800,eventEvery:7,perk:'the catacomb is in the basement. you book shows free.'}
 ];
 const TEASE={label:'SMALL CASTLE',hood:'DOWNTOWN',price:3800000};
 const props=()=>RALife.life().ownership.properties||[];
 const ownedIds=()=>props().filter(p=>p.ownershipStatus==='owned').map(p=>p.id);
 const shannonLane=()=>ownedIds().includes(window.RAPropertyQuest?.propertyId);
 function buy(id,{down=false}={}){
  const l=LISTINGS.find(x=>x.id===id);if(!l||ownedIds().includes(id))return false;
  const pay=down&&shannonLane()?Math.round(l.price*.3):l.price;if(!RALife.spend(pay))return false;
  const rec={id,label:`${l.label} · ${l.hood}`,ownershipStatus:'owned',acquisitionSource:'realmoneyrealestate',purchasePrice:l.price,value:l.price,weeklyRent:l.rent,rentDue:0,owed:l.price-pay,acquiredDay:RALife.today().day,lastEventDay:RALife.today().day};
  RAState.patch('life.ownership.properties',[...props(),rec]);
  RALife.light('ownership',1,`property:${id}`);RALife.remember({text:`bought the ${l.label.toLowerCase()} in ${l.hood.toLowerCase()}`,lane:'property'});RALife.receipt({id:`prop:${id}`,caption:`${l.label.toLowerCase()}, ${l.hood.toLowerCase()}. four walls, mine.`,lane:'property'});
  if(window.RARelations?.met?.('shannon_001'))RARelations.add('shannon_001',3,{reason:'deal'});
  return true;
 }
 function collectAll(){let total=0;const next=props().map(p=>{if(p.ownershipStatus!=='owned'||!(p.rentDue>0))return p;let due=p.rentDue;const fee=shannonLane()&&p.id!==window.RAPropertyQuest?.propertyId?Math.round(due*.05):0;due-=fee;let owed=p.owed||0;const toLoan=Math.min(owed,Math.round(due*.5));owed-=toLoan;due-=toLoan;total+=due;return {...p,rentDue:0,owed};});
  RAState.patch('life.ownership.properties',next);if(total)RALife.addMoney(total);RAState.recordEvent({id:`rent-collected:${RALife.today().day}:${Date.now()}`,type:'rent_collected',amount:total});return total;}
 // Weekly drift + occasional events (Fridays).
 RAClock.onWake('property-events',22,({info})=>{
  if(!info.friday)return;const list=props().map(p=>{if(p.ownershipStatus!=='owned'||!LISTINGS.some(l=>l.id===p.id))return p;const drift=((RALife.hash(info.day*31+p.purchasePrice)%400)-100)/10000;return {...p,value:Math.round((p.value||p.purchasePrice)*(1+drift))};});
  RAState.patch('life.ownership.properties',list);
  for(const p of list){const l=LISTINGS.find(x=>x.id===p.id);if(!l||info.day-(p.lastEventDay||0)<l.eventEvery)continue;
   const cost=500+RALife.hash(info.day+p.purchasePrice)%9500;const absorbed=RALife.hash(info.day*7+p.purchasePrice)%10<7;
   RAState.patch('life.ownership.properties',props().map(x=>x.id===p.id?{...x,lastEventDay:info.day}:x));
   const issues=['the water heater','a tenant\'s ceiling fan','the gate','a raccoon situation','the laundry room door','roof flashing'];const issue=issues[info.day%issues.length];
   if(absorbed){RALife.addMoney(-Math.round(cost*.3));RALife.text('shannon_001','SHANNON',`${l.label.toLowerCase()}: ${issue}. handled it. ${RALife.fmt(Math.round(cost*.3))} after I negotiated. you're welcome.`,{id:`reevt:${p.id}:${info.day}`});}
   else RALife.mail({id:`reevt:${p.id}:${info.day}`,kind:'money',title:'SHANNON',body:`${l.label.toLowerCase()}: ${issue}. ${RALife.fmt(cost)}. I paid it from rent.`,app:'realEstate'}),RALife.addMoney(-cost);
  }
  if(!RALife.flag('cryptratEligible')&&RALife.netWorth()>=1000000){RALife.setFlag('cryptratEligible',true);RASealed.fire('CRYPTRAT',{life:RALife.life()});}
 });
 function markup(){
  const base=(window.RAPropertyQuest?.storeMarkup?.()||'<h1>REALMONEYREALESTATE</h1>').replace(/<button type="button" class="phone-button" data-property-action="home">[^<]*<\/button>/g,'');
  const owned=props().filter(p=>p.ownershipStatus==='owned');const due=owned.reduce((s,p)=>s+(p.rentDue||0),0);
  let out=`${base}<div class="phone-card"><b>NET WORTH</b>${RALife.fmt(RALife.netWorth())}<br>RENT WAITING: ${RALife.fmt(due)}${due>0&&owned.length>1?'<button type="button" class="phone-button" data-phone-action="do:realestate:collect">COLLECT ALL</button>':''}</div>`;
  if(shannonLane()){
   out+=`<p class="phone-speaker">LISTINGS</p>`;
   for(const l of LISTINGS){const own=owned.find(p=>p.id===l.id);if(own){out+=`<div class="phone-card"><b>${l.label} · ${l.hood}</b>OWNED · VALUE ${RALife.fmt(own.value)} · ${RALife.fmt(l.rent)}/WK${own.owed>0?`<br>PAID OFF IN ~${Math.ceil(own.owed/(l.rent*.5))} WEEKS`:''}</div>`;continue;}
    out+=`<div class="phone-card"><b>${l.label} · ${l.hood}</b>${RALife.fmt(l.price)} · RENT ${RALife.fmt(l.rent)}/WK${l.perk?`<br>${l.perk}`:''}<div class="phone-row"><button type="button" class="phone-button" data-phone-action="do:realestate:see:${l.id}" ${RALife.money()<l.price*.3?'disabled':''}>SEE IT WITH SHANNON</button></div></div>`;}
   out+=`<div class="phone-card"><b>${TEASE.label} · ${TEASE.hood}</b>${RALife.fmt(TEASE.price)}<br><span class="phone-small">SHANNON: "not yet. but I'm watching it for you."</span></div>`;
  }else out+='<p class="phone-small">SHANNON: "one building at a time."</p>';
  out+=window.RACastle?.markup?.()||'';
  return out+'<button type="button" class="phone-button" data-phone-action="home">HOME</button>';
 }
 window.RAPhoneApps?.register({id:'realestate',label:'RE',hidden:true,async onAction(act,arg,api){if(act==='collect'){const t=collectAll();api.message(t?`collected ${RALife.fmt(t)}.`:'nothing due.');api.refresh();}if(act==='see'){await api.close();RAAdventureScene.begin('RE_VIEWING',{vars:{listing:arg}});}}});
 window.RARealEstate={LISTINGS,buy,collectAll,markup,shannonLane};
})();
