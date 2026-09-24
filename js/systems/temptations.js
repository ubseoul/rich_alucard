(function(){
 // THE TEMPTATION ENGINE (VOL 1 §6, VOL 3 §8). New wants are generated at WAKE only; they expire quietly
 // (1–5 sleeps); nothing punishes ignoring them; some come back changed. WHAT WE ON (VampGPT) shows ≤6 live lines.
 const defs=new Map();
 function define(list){for(const d of list)defs.set(d.id,{life:[2,4],weight:1,source:'vampgpt',...d});}
 const T=()=>RAState.get().life.temptations;
 function cadence(day){return day<=10?{min:1,max:3,cap:4}:day<=30?{min:3,max:5,cap:8}:{min:5,max:8,cap:12};}
 function eligible(def,L,live){
  if(live.some(t=>t.id===def.id))return false;
  if(def.adventure&&!RAAdventures.available(def.adventure))return false;
  const hist=T().history.filter(h=>h.id===def.id);
  if(!def.repeatable&&hist.some(h=>h.taken))return false;
  if(def.cooldown&&hist.length&&L.day-hist.at(-1).day<def.cooldown)return false;
  if(def.minDay&&L.day<def.minDay)return false;if(def.maxDay&&L.day>def.maxDay)return false;
  try{return def.when?def.when(L)!==false:true}catch(e){return false}
 }
 function pickWeighted(list,rand){const total=list.reduce((s,d)=>s+(typeof d.weight==='function'?d.weight(RALife.L()):d.weight),0);let r=rand()*total;for(const d of list){r-=typeof d.weight==='function'?d.weight(RALife.L()):d.weight;if(r<=0)return d;}return list.at(-1);}
 function materialize(def,day,rand){
  const [a,b]=def.life;const span=a+Math.floor(rand()*(b-a+1));const L=RALife.L();
  const line=typeof def.line==='function'?def.line(L):def.line;
  return {id:def.id,line,sender:typeof def.sender==='function'?def.sender(L):(def.sender||null),source:def.source,adventure:def.adventure||null,action:def.action||null,thread:def.thread||null,createdDay:day,expiresDay:day+span};
 }
 function deliver(t){
  if(t.thread){RALife.text(t.thread,t.sender||t.thread.toUpperCase(),t.line,{id:`tempt:${t.id}:${t.createdDay}`,choices:[{label:'SAY LESS',temptation:t.id}]});}
  if(t.source!=='craving'&&t.source!=='vampgpt')RALife.mail({id:`tempt:${t.id}:${t.createdDay}`,kind:t.source,title:t.sender||(t.source==='invite'?'INVITE':'WHAT WE ON'),body:t.line,temptation:t.id,app:t.thread?(RABtfPeople.get(t.thread)?.dateable?'instahoe':'texts'):'vampgpt'});
 }
 // Forced (story-authored) temptations bypass cadence but still respect "max live".
 function push(id,{quiet=false}={}){const def=defs.get(id);if(!def)return false;const live=[...T().live];if(live.some(t=>t.id===id))return false;const t=materialize(def,RALife.today().day,RAPixel.rng(`${id}:${RALife.today().day}`));live.push(t);RAState.patch('life.temptations.live',live);if(!quiet)deliver(t);return t;}
 function generate(day){
  const L=RALife.L(),rand=RAPixel.rng(day*7919+13);
  let live=T().live.filter(t=>t.expiresDay>=day&&(!t.adventure||RAAdventures.available(t.adventure)));
  // Expired ones may come back changed.
  for(const old of T().live.filter(t=>t.expiresDay<day)){const def=defs.get(old.id);if(def?.expired){RALife.mail({id:`expired:${old.id}:${day}`,kind:'world',title:def.expiredSender||'VAMPGRAM',body:typeof def.expired==='function'?def.expired(L):def.expired});}
   RAState.patch('life.temptations.history',[...T().history,{id:old.id,day,taken:false}].slice(-200));}
  const c=cadence(day);let want=c.min+Math.floor(rand()*(c.max-c.min+1));want=Math.min(want,c.cap-live.length);
  // Priority temptations (story spine) go first, then weighted variety.
  const pool=[...defs.values()].filter(d=>eligible(d,L,live));
  const spine=pool.filter(d=>d.priority).sort((a,b)=>b.priority-a.priority);
  const added=[];
  for(const d of spine){if(want<=0)break;added.push(materialize(d,day,rand));want--;}
  let rest=pool.filter(d=>!d.priority&&!added.some(a=>a.id===d.id));
  while(want>0&&rest.length){const d=pickWeighted(rest,rand);rest=rest.filter(x=>x!==d);added.push(materialize(d,day,rand));want--;}
  live=[...live,...added];RAState.patch('life.temptations.live',live);RAState.patch('life.temptations.lastGeneratedDay',day);
  for(const t of added)deliver(t);
  return added;
 }
 function take(id){const live=T().live;const t=live.find(x=>x.id===id);if(!t)return null;RAState.patch('life.temptations.live',live.filter(x=>x.id!==id));RAState.patch('life.temptations.history',[...T().history,{id,day:RALife.today().day,taken:true}].slice(-200));return t;}
 async function act(id){
  const t=T().live.find(x=>x.id===id);if(!t)return false;
  if(t.adventure){if(!RAAdventures.available(t.adventure)){take(id);return false;}take(id);return RAAdventureScene.begin(t.adventure,{from:'temptation'});}
  if(t.action){take(id);return window.RAPlaces?.go?.(t.action);}
  return false;
 }
 function whatWeOn(){const live=T().live.filter(t=>!t.adventure||RAAdventures.available(t.adventure));return live.slice(-6).reverse();}
 RAClock.onWake('temptations',60,({info})=>{if(T().lastGeneratedDay!==info.day)generate(info.day);});
 // WAKE-triggered adventures: at most one world-initiated interruption per morning.
 const wakeDefs=[];
 function defineWake(list){wakeDefs.push(...list);wakeDefs.sort((a,b)=>(b.priority||0)-(a.priority||0));}
 function pick(){
  const L=RALife.L();const prior=RALife.flag('wakeTrigger');if(prior?.day===L.day){if(prior.id&&RAAdventures.available(prior.id))return prior.id;return null;}
  for(const w of wakeDefs){try{if(RAAdventures.available(w.adventure)&&w.when(L)){RALife.setFlag('wakeTrigger',{day:L.day,id:w.adventure});return w.adventure;}}catch(e){console.error(e)}}
  RALife.setFlag('wakeTrigger',{day:L.day,id:null});return null;
 }
 window.RATemptations={define,push,generate,take,act,whatWeOn,defs:()=>[...defs.values()],cadence};
 window.RAWakeTriggers={define:defineWake,pick,list:()=>wakeDefs};
})();
