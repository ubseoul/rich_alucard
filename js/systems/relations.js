(function(){
 // Relationship ladder (VOL 1 §9.4, VOL 3 §6.1): MET → COOL → CLOSE → RIDE-OR-DIE. No meter is ever shown.
 // Built on the existing Persistent People records (life.people.records); fields are additive.
 const LEVELS=[{id:'none',min:-1},{id:'met',label:'MET',min:0},{id:'cool',label:'COOL',min:20},{id:'close',label:'CLOSE',min:50},{id:'ride',label:'RIDE-OR-DIE',min:90}];
 const clone=v=>JSON.parse(JSON.stringify(v));
 const catalog=id=>window.RABtfPeople?.get(id)||null;
 const raw=id=>RAState.get().life.people.records?.[id]||null;
 function save(id,rec){const all=clone(RAState.get().life.people.records||{});all[id]=rec;RAState.patch('life.people.records',all);return rec;}
 function base(id){const r=raw(id)||{met:false,conversionState:null,contactable:true,flags:{},memories:[]};return {points:0,datesCount:0,lastSeenDay:0,lastDateDay:0,gifts:[],ignored:0,...clone(r),flags:{...(r.flags||{})},memories:[...(r.memories||[])]};}
 function levelIndexFor(rec){if(!rec?.met)return 0;const p=Number(rec.points)||0;let i=1;for(let k=1;k<LEVELS.length;k++)if(p>=LEVELS[k].min)i=k;return i;}
 function get(id){const rec=raw(id);if(!rec)return null;return {...clone(rec),id,catalog:catalog(id),level:levelIndexFor(base(id)),levelId:LEVELS[levelIndexFor(base(id))].id};}
 const level=id=>raw(id)?levelIndexFor(base(id)):0;
 const met=id=>!!raw(id)?.met;
 function meet(id,source){
  const had=met(id);if(window.RAPeople?.meetPerson)window.RAPeople.meetPerson(id,source);
  const rec=base(id);rec.met=true;if(!had){rec.lastSeenDay=RALife.today().day;if(source)rec.firstMeetingSource=rec.firstMeetingSource||source;}
  save(id,rec);
  if(!had&&catalog(id)?.dateable&&RALife.appUnlocked('instahoe'))RALife.mail({id:`contact:${id}`,kind:'people',title:'NEW CONTACT',body:`${catalog(id).name} followed you on InstaHoe.`,app:'instahoe'});
  return get(id);
 }
 function add(id,points,{reason,quiet=false}={}){
  if(!met(id))meet(id,reason||'btf');
  const rec=base(id),before=levelIndexFor(rec);rec.points=Math.max(0,Math.min(140,(Number(rec.points)||0)+points));rec.lastSeenDay=RALife.today().day;save(id,rec);
  const after=levelIndexFor(rec);
  if(after>before){RAState.recordEvent({id:`level:${id}:${LEVELS[after].id}`,type:'relationship_level',personId:id,level:LEVELS[after].id});if(after>=3)RALife.light('connection',1,`close:${id}`);}
  return {before,after};
 }
 function memory(id,eventId){if(!met(id))meet(id);window.RAPeople?.rememberPersonEvent?.(id,eventId);const rec=base(id);if(!rec.memories.includes(eventId)){rec.memories.push(eventId);save(id,rec);}}
 const remembers=(id,eventId)=>!!raw(id)?.memories?.includes(eventId);
 function setFlag(id,flag,value=true){const rec=base(id);rec.flags[flag]=value;save(id,rec);}
 const flag=(id,f)=>raw(id)?.flags?.[f];
 // Dates: one per person per night; 1 sleep between meaningful meetings.
 function canDate(id){const rec=raw(id);if(!rec?.met)return false;const today=RALife.today().day;return !(rec.lastDateDay&&today-rec.lastDateDay<1);}
 function date(id,spot,{readRight=false,octopusFit=false}={}){
  const likes=catalog(id)?.likes||[];let pts=likes.includes(spot)?10:3;if(readRight)pts+=5;if(octopusFit)pts+=8;if(RALife.flag('freshUntil')>=RALife.today().day)pts+=3;
  const result=add(id,pts,{reason:'date'});const rec=base(id);rec.datesCount=(rec.datesCount||0)+1;rec.lastDateDay=RALife.today().day;rec.lastSpot=spot;save(id,rec);
  RALife.remember({id:`date:${id}:${rec.datesCount}`,text:`date with ${catalog(id)?.name.toLowerCase()||id}`,lane:'dating',type:'date'});
  return {...result,liked:likes.includes(spot),points:pts,datesCount:rec.datesCount};
 }
 function gift(id,giftId){const right=(catalog(id)?.gifts||[]).includes(giftId);const rec=base(id);rec.gifts=[...(rec.gifts||[]),giftId];save(id,rec);add(id,right?8:2,{reason:'gift'});return right;}
 function companions(){
  const out=[];for(const p of window.RABtfPeople?.women||[]){const rec=raw(p.id);if(!rec?.met||!p.hoes?.length)continue;const lvl=levelIndexFor(base(p.id));const convertedAssistant=p.id==='ceo_assistant_001'&&(rec.conversionState==='converted'||rec.flags?.stolen);if(lvl>=3||convertedAssistant)out.push({id:p.id,name:p.name,moves:p.hoes});}
  if(RALife.life().ownership.cat)out.push({id:'cat',name:'THE CAT',moves:[{id:'judge',label:'JUDGE',kind:'skip'}]});
  if(RALife.hasRoom('dragon_roost')&&RALife.dragon()?.stage==='majestic')out.push({id:'mazda_dragon',name:'MAZDA (ROOST)',moves:[{id:'fire_pass',label:'FIRE PASS',kind:'damage',amount:40}]});
  if(level('tristan')>=2)out.push({id:'tristan',name:'TRISTAN',moves:[{id:'one_more_turn',label:'ONE MORE TURN',kind:'extra_turn'},{id:'xcom',label:'XCOM (95%)',kind:'xcom',amount:40}]});
  return out;
 }
 function known({dateable}={}){return Object.entries(RAState.get().life.people.records||{}).filter(([id,r])=>r?.met&&catalog(id)&&(dateable===undefined||!!catalog(id).dateable===dateable)).map(([id])=>get(id));}
 // WAKE: gentle neglect (VOL 3 §6.1) — no contact for 10 sleeps at CLOSE+ drops one level, and she says so.
 RAClock.onWake('relations-neglect',40,({info})=>{
  for(const p of known({dateable:true})){const rec=base(p.id),lvl=levelIndexFor(rec);if(lvl<3||!rec.lastSeenDay)continue;if(info.day-rec.lastSeenDay<10||rec.neglectNotedDay===info.day)continue;
   rec.points=LEVELS[lvl-1].min+Math.floor((LEVELS[lvl].min-LEVELS[lvl-1].min)/2);rec.lastSeenDay=info.day-3;rec.neglectNotedDay=info.day;save(p.id,rec);
   RALife.text(p.id,p.catalog.name,'haven\'t heard from you. it\'s cool. it\'s whatever.',{id:`neglect:${p.id}:${info.day}`});
   RALife.mail({id:`neglect:${p.id}:${info.day}`,kind:'people',title:p.catalog.name,body:'drifted a little. she said so.',app:'instahoe'});}
 });
 window.RARelations={LEVELS,get,level,met,meet,add,memory,remembers,setFlag,flag,canDate,date,gift,companions,known,catalog};
})();
