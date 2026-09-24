(function(){
 // RALife: one small façade over the v12 life record for every BTF system and adventure.
 // Calendar rule (VOL 5 §9.2): Day 1 = Thursday, October 1 (2026 calendar, so Halloween = Day 31
 // and Thanksgiving = Day 57 both land correctly). Budget months are 28 days; full moon = day 14 of each.
 const clone=v=>JSON.parse(JSON.stringify(v));
 const S=()=>RAState.get();const life=()=>S().life;
 const WEEKDAYS=['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];
 const MONTHS=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
 const EPOCH=Date.UTC(2026,9,1);
 const HOLIDAYS={1:'independence',31:'halloween',57:'thanksgiving'};
 function hash(n){let x=(n*2654435761)>>>0;x^=x>>>15;x=Math.imul(x,2246822519)>>>0;x^=x>>>13;return x>>>0;}
 function dayInfo(day=life().world.day){
  const d=Math.max(1,Math.floor(day)),date=new Date(EPOCH+(d-1)*864e5),weekdayIndex=date.getUTCDay();
  const dayOfMonth=((d-1)%28)+1,month=Math.floor((d-1)/28)+1;
  const rain=d>1&&(hash(d*97+13)%7===0);
  return {day:d,weekdayIndex,weekday:WEEKDAYS[weekdayIndex],dateLabel:`${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}`,month,dayOfMonth,fullMoon:dayOfMonth===14,rain,holiday:HOLIDAYS[d]||null,friday:weekdayIndex===5,weekend:weekdayIndex===5||weekdayIndex===6,sunday:weekdayIndex===0,monday:weekdayIndex===1};
 }
 const today=()=>dayInfo();
 // ---- tiers ----
 const TIERS=['LOW','MID','HIGH','CRAZY'];
 const CLOUT_MIN={LOW:0,MID:30,HIGH:80,CRAZY:150},REP_MIN={LOW:0,MID:25,HIGH:70,CRAZY:130};
 const tierFor=(points,table)=>TIERS.filter(t=>points>=table[t]).at(-1)||'LOW';
 const tierIndex=t=>Math.max(0,TIERS.indexOf(String(t||'LOW').toUpperCase()));
 function addPoints(kind,amount){
  const r=life().resources,table=kind==='clout'?CLOUT_MIN:REP_MIN,field=kind==='clout'?'cloutPoints':'vampRepPoints',tierField=kind==='clout'?'clout':'vampireReputation';
  const floor=table[TIERS[tierIndex(r[tierField])]]||0;let points=Math.max(Number(r[field])||0,floor)+amount;points=Math.max(0,points);
  RAState.patch(`life.resources.${field}`,points);RAState.patch(`life.resources.${tierField}`,tierFor(points,table));return points;
 }
 const clout=()=>tierIndex(life().resources.clout),rep=()=>tierIndex(life().resources.vampireReputation);
 // Vampire elders address Rich by rep tier (VOL 5 §1.1).
 const elderName=()=>['baby','young man','Rich','Mr. Alucard'][rep()];
 // ---- money ----
 const money=()=>Number(life().resources.money)||0;
 function addMoney(n){RAState.patch('life.resources.money',Math.round(money()+n));return money();}
 function spend(n){if(n>money())return false;addMoney(-n);return true;}
 const fmt=n=>'$'+new Intl.NumberFormat('en-US').format(Math.round(n));
 function netWorth(){const o=life().ownership;let w=money();for(const p of o.properties||[])if(p.ownershipStatus==='owned')w+=Number(p.value||p.purchasePrice)||0;for(const c of o.cars||[])w+=Number(c.value||c.price)||0;for(const r of o.castleRooms||[])w+=(Number(r.price)||0)*.5;return Math.round(w);}
 // ---- followers ----
 function addFollowers(n,reason){const next=Math.max(0,(Number(life().resources.followers)||0)+Math.round(n));RAState.patch('life.resources.followers',next);if(reason)remember({text:reason,type:'followers',quiet:true});return next;}
 // ---- flags ----
 const flag=name=>life().world.flags?.[name];
 function setFlag(name,value=true){RAState.patch(`life.world.flags.${name}`,value);return value;}
 function counter(name,delta=1){const v=(Number(flag(name))||0)+delta;setFlag(name,v);return v;}
 // ---- items / inventory ----
 const count=id=>Number(life().ownership.items?.[id])||0;
 function addItem(id,n=1,{cap}={}){const items={...life().ownership.items};let v=(Number(items[id])||0)+n;if(cap!=null)v=Math.min(cap,v);items[id]=Math.max(0,v);if(!items[id])delete items[id];RAState.patch('life.ownership.items',items);return items[id]||0;}
 function consume(id,n=1){if(count(id)<n)return false;addItem(id,-n);return true;}
 // ---- ownership ----
 const hasCar=id=>(life().ownership.cars||[]).some(c=>c.id===id||c.model===id||c.kind===id);
 function addCar(car){const cars=[...(life().ownership.cars||[])];if(cars.some(c=>c.id===car.id))return false;cars.push({ownershipStatus:'owned',acquiredDay:today().day,...car});RAState.patch('life.ownership.cars',cars);return true;}
 function patchCar(id,fields){const cars=(life().ownership.cars||[]).map(c=>c.id===id?{...c,...fields}:c);RAState.patch('life.ownership.cars',cars);}
 const ownedCars=()=>(life().ownership.cars||[]).filter(c=>c.ownershipStatus!=='sold');
 const hasRoom=id=>(life().ownership.castleRooms||[]).some(r=>r.id===id);
 function addRoom(room){if(hasRoom(room.id))return false;RAState.patch('life.ownership.castleRooms',[...life().ownership.castleRooms,{...room,boughtDay:today().day}]);return true;}
 const hasGun=id=>(life().ownership.guns||[]).some(g=>g.id===id);
 function addGun(id){if(hasGun(id))return false;RAState.patch('life.ownership.guns',[...life().ownership.guns,{id,boughtDay:today().day}]);return true;}
 const hasProp=id=>(life().ownership.props||[]).includes(id);
 function addProp(id){if(hasProp(id))return false;RAState.patch('life.ownership.props',[...life().ownership.props,id]);return true;}
 const hasFit=id=>(life().ownership.fits.owned||[]).includes(id);
 function addFit(id){if(hasFit(id))return false;const fits=clone(life().ownership.fits);fits.owned.push(id);RAState.patch('life.ownership.fits',fits);return true;}
 function equipFit(slot,id){const fits=clone(life().ownership.fits);if(id)fits.equipped[slot]=id;else delete fits.equipped[slot];RAState.patch('life.ownership.fits',fits);}
 const dragon=()=>life().ownership.dragon;
 function patchDragon(fields){const d=dragon();if(!d)return null;const next={...d,...fields};RAState.patch('life.ownership.dragon',next);return next;}
 // ---- apps ----
 const appUnlocked=id=>!!life().phone.apps?.[id]?.unlocked;
 function unlockApp(id,{silent=false}={}){if(appUnlocked(id))return false;const apps={...life().phone.apps,[id]:{unlocked:true,unlockedDay:today().day}};RAState.patch('life.phone.apps',apps);if(!silent)mail({id:`app:${id}`,kind:'app',title:'NEW APP',body:`${(window.RAPhoneApps?.label?.(id)||id).toUpperCase()} is on your phone now.`});return true;}
 // ---- memory / receipts / history ----
 function remember({id,text,lane=null,type='moment',quality=1,quiet=false}={}){
  if(!text)return null;const log=[...life().memoryLog];const key=id||`mem:${today().day}:${text}`;if(log.some(m=>m.id===key))return null;
  const entry={id:key,text,lane,type,quality,day:today().day};log.push(entry);while(log.length>40)log.shift();RAState.patch('life.memoryLog',log);
  if(!quiet)RAState.recordEvent({id:`memory:${key}`,type:'memory',text,lane,day:today().day});return entry;
 }
 const recentMemories=(n=10)=>life().memoryLog.filter(m=>m.type!=='followers').slice(-n).reverse();
 function receipt({id,caption,vp=true,env=null,lane=null}={}){
  if(!id||!caption)return null;const list=[...life().receipts];if(list.some(r=>r.id===id))return null;
  const entry={id,caption,vp,env,lane,day:today().day,dateLabel:today().dateLabel};list.push(entry);RAState.patch('life.receipts',list);
  return entry;
 }
 // ---- morning mail (delivered at WAKE, readable in bedroom card + phone) ----
 function mail(card){const clock=life().clock,list=[...(clock.mail||[])];const id=card.id||`mail:${today().day}:${list.length}`;if(list.some(m=>m.id===id))return false;list.push({read:false,day:today().day,...card,id});RAState.patch('life.clock.mail',list.slice(-30));return true;}
 // ---- phone threads (texts) ----
 function text(threadId,from,body,{day=today().day,choices=null,id=null}={}){
  const threads={...life().phone.threads},thread=[...(threads[threadId]||[])];const mid=id||`${threadId}:${day}:${thread.length}`;if(thread.some(m=>m.id===mid))return false;
  thread.push({id:mid,from,text:body,day,read:false,choices});threads[threadId]=thread.slice(-60);RAState.patch('life.phone.threads',threads);return true;
 }
 // ---- momentum (hidden; VOL 1 §5.3 anti-grind: each key contributes once, dimensions cap) ----
 const DIM_CAP=10;
 function light(dim,amount=1,key){const m=clone(life().momentum);if(!(dim in m))return false;const k=key||`${dim}:${today().day}`;m.counts=m.counts||{};if(m.counts[k])return false;m.counts[k]=true;m[dim]=Math.min(DIM_CAP,(Number(m[dim])||0)+amount);RAState.patch('life.momentum',m);return true;}
 const litDimensions=()=>['expression','connection','ownership','legend','chaos'].filter(d=>(Number(life().momentum[d])||0)>=3);
 function tendency(kind,n=1){if(!['solid','messy'].includes(kind))return;RAState.patch(`life.tendencies.${kind}`,(Number(life().tendencies[kind])||0)+n);}
 const leaning=()=>{const t=life().tendencies;return (t.solid||0)>=(t.messy||0)+2?'solid':(t.messy||0)>=(t.solid||0)+2?'messy':'even';};
 // ---- adventures ----
 const adventureRecord=id=>life().adventures.records[id]||null;
 const done=id=>adventureRecord(id)?.status==='completed'||(adventureRecord(id)?.count||0)>0;
 const doneCount=ids=>ids.filter(done).length;
 // Query helper handed to content predicates: keeps authored conditions short and readable.
 function L(){return {life:life(),day:today().day,info:today(),money:money(),clout:clout(),rep:rep(),flag,done,count,hasCar,hasRoom,hasGun,hasProp,hasFit,dragon:dragon(),app:appUnlocked,person:id=>window.RARelations?.get?.(id)||null,level:id=>window.RARelations?.level?.(id)||0,followers:Number(life().resources.followers)||0,netWorth:netWorth(),lit:litDimensions(),leaning:leaning()};}
 window.RALife={life,dayInfo,today,TIERS,addPoints,clout,rep,elderName,money,addMoney,spend,fmt,netWorth,addFollowers,flag,setFlag,counter,count,addItem,consume,hasCar,addCar,patchCar,ownedCars,hasRoom,addRoom,hasGun,addGun,hasProp,addProp,hasFit,addFit,equipFit,dragon,patchDragon,appUnlocked,unlockApp,remember,recentMemories,receipt,mail,text,light,litDimensions,tendency,leaning,adventureRecord,done,doneCount,L,hash};
})();
