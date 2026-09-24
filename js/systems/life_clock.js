(function(){
 // THE LIFE CLOCK (VOL 1 §3): the only clock is sleep. Phone, home and any number of outings are free;
 // the night ends when Rich goes to bed. Systems register WAKE handlers; they run once per new day, in order.
 const handlers=[];
 function onWake(id,priority,fn){const i=handlers.findIndex(h=>h.id===id);if(i>=0)handlers.splice(i,1);handlers.push({id,priority,fn});handlers.sort((a,b)=>a.priority-b.priority);}
 const L=()=>RALife.life();
 function logOuting(entry){const list=[...(L().clock.nightOutings||[])];list.push({day:RALife.today().day,...entry});RAState.patch('life.clock.nightOutings',list.slice(-12));}
 // Advance exactly one day and run the WAKE pipeline. Returns the list of mail cards for the morning.
 function sleep({reason='bed'}={}){
  const before=RALife.today().day;
  const night={day:before,outings:[...(L().clock.nightOutings||[])],reason};
  for(const h of handlers.filter(h=>h.priority<0)){try{h.fn({phase:'night',night})}catch(e){console.error('night handler',h.id,e)}}
  const day=before+1;
  RAState.patch('life.world.day',day);RAState.patch('life.world.month',Math.floor((day-1)/28)+1);
  RAState.patch('life.clock.nightOutings',[]);RAState.patch('life.clock.interruptionsTonight',0);
  RAState.patch('life.clock.mail',(L().clock.mail||[]).filter(m=>!m.read&&m.sticky));
  return wake({night});
 }
 function wake({night=null,first=false}={}){
  const info=RALife.today();
  if(L().clock.lastWakeDay===info.day&&!first)return L().clock.mail;
  const ctx={phase:'wake',info,night,first};
  for(const h of handlers.filter(h=>h.priority>=0)){try{h.fn(ctx)}catch(e){console.error('wake handler',h.id,e)}}
  RAState.patch('life.clock.lastWakeDay',info.day);RAState.patch('life.clock.started',true);
  RAState.recordEvent({id:`wake:${info.day}`,type:'wake',day:info.day});
  return L().clock.mail;
 }
 // ---- core wake handlers owned by the clock ----
 onWake('budget',10,({info})=>{
  if(info.day>1&&info.dayOfMonth===1){RALife.addMoney(100000);RALife.mail({id:`budget:${info.day}`,kind:'money',title:'BUDGET',body:'$100,000 landed. new month.'});}
 });
 onWake('rent',20,({info})=>{
  if(!info.friday)return;const props=L().ownership.properties||[];let total=0;
  const next=props.map(p=>{if(p.ownershipStatus!=='owned')return p;const rent=Number(p.weeklyRent)||0;if(!rent)return p;total+=rent;return {...p,rentDue:(Number(p.rentDue)||0)+rent};});
  if(total){RAState.patch('life.ownership.properties',next);RALife.mail({id:`rent:${info.day}`,kind:'money',title:'SHANNON FRIDAY',body:`rent's in. ${RALife.fmt(total)} waiting in RealMoneyRealEstate.`,app:'realEstate'});}
 });
 onWake('weather',30,({info})=>{
  if(info.rain)RALife.mail({id:`rain:${info.day}`,kind:'world',title:'RAIN TONIGHT',body:'the city gets quiet when it rains.'});
  if(info.fullMoon)RALife.mail({id:`moon:${info.day}`,kind:'world',title:'FULL MOON',body:'the moon is big tonight.'});
 });
 onWake('hangover',5,()=>{RAState.patch('life.clock.hungover',!!L().clock.hungoverPending);RAState.patch('life.clock.hungoverPending',false);});
 onWake('world-events',80,({info})=>{window.RAWorldEvents?.advanceBoundary?.('wake');window.RAWorldEvents?.advanceBoundary?.('bedroom-entry');for(const e of window.RAWorldEvents?.pending?.('phone')||[])if(e.state?.status==='pending')RALife.mail({id:`incoming:${e.id}`,kind:'invite',title:e.sender||'INCOMING',body:e.subject||'new message',app:'home'});});
 // The weekday line is the last word of every morning ("TUESDAY. NOTHING GOING ON." is a valid morning).
 onWake('weekday',999,({info})=>{
  const mail=(L().clock.mail||[]).filter(m=>m.day===info.day);
  const quiet=mail.filter(m=>m.kind!=='weekday').length===0;
  const line=quiet?(info.monday?`${info.weekday}. DEAD.`:`${info.weekday}. NOTHING GOING ON.`):`${info.weekday} · ${info.dateLabel}`;
  RALife.mail({id:`weekday:${info.day}`,kind:'weekday',title:line,body:''});
 });
 function markMailRead(id){RAState.patch('life.clock.mail',(L().clock.mail||[]).map(m=>!id||m.id===id?{...m,read:true}:m));}
 function setHungover(){RAState.patch('life.clock.hungoverPending',true);}
 window.RAClock={onWake,sleep,wake,logOuting,markMailRead,setHungover,handlers:()=>handlers.map(h=>h.id)};
})();
