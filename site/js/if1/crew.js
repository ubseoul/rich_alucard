(function(){
 'use strict';
 // RACrew — IF-1 (4H). Reusable crew registry: units, class, status, stories, bonds, day-timers.
 // INFRASTRUCTURE ONLY: it invents no crew member, class, story or outcome. Fragments (SHOWDOWN, War Room, TRAP roles,
 // finale, post-finale) DEFINE their own units; this service stores and evolves the state uniformly.
 //   status   ACTIVE · DOWNED · CAPTURED · GONE  (+ any status a fragment registers with registerStatus)
 //   GONE is terminal — a GONE unit never changes status again (post-finale state stays true).
 //   timers   day-based: {until:<day>,onExpire:<status|null>}; tick() expires them on the WAKE that reaches the day.
 // Persistence is lazy: save.frag.if1.crew.units.<id>, written only when a unit's state first changes.
 const STATUSES=['ACTIVE','DOWNED','CAPTURED','GONE'];const extra=new Set();
 const defs=new Map(),listeners=new Set();
 const clone=v=>JSON.parse(JSON.stringify(v));
 const today=()=>window.RALife.today().day;
 const units=()=>window.RAFrag.read('if1','crew.units',{});
 const valid=s=>STATUSES.includes(s)||extra.has(s);
 function define(def){
  if(!def||typeof def.id!=='string'||!/^[a-z][a-z0-9_]*$/i.test(def.id))throw new Error('RACrew.define: {id} required');
  if(!def.fragment)throw new Error(`RACrew.define(${def.id}): fragment required`);
  if(defs.has(def.id))throw new Error(`RACrew.define: ${def.id} already defined by ${defs.get(def.id).fragment}`);
  defs.set(def.id,Object.freeze({id:def.id,fragment:def.fragment,name:def.name||def.id,class:def.class||null,meta:Object.freeze({...(def.meta||{})})}));return def.id;
 }
 function registerStatus(name){if(!/^[A-Z][A-Z_]*$/.test(name))throw new Error('status names are UPPER_SNAKE');extra.add(name);return name;}
 const blank=()=>({status:'ACTIVE',stories:{},bonds:{},timers:{},history:[]});
 function get(id){const d=defs.get(id);if(!d)return null;const dyn=units()[id];return {...d,meta:{...d.meta},...(dyn?clone(dyn):blank())};}
 const list=({status=null,cls=null,fragment=null}={})=>[...defs.keys()].sort().map(get).filter(u=>(!status||u.status===status)&&(!cls||u.class===cls)&&(!fragment||u.fragment===fragment));
 function write(id,mutate){
  if(!defs.has(id))throw new Error(`RACrew: unknown unit ${id}`);
  const all=clone(units());const u=all[id]||blank();const before=clone(u);mutate(u);all[id]=u;window.RAFrag.patch('if1','crew.units',all);
  return {before,after:clone(u)};
 }
 function emit(event){for(const fn of [...listeners]){try{fn(event);}catch(e){console.error('crew listener',e);}}}
 function setStatus(id,status,{reason=null,timer=null}={}){
  if(!valid(status))throw new Error(`RACrew.setStatus: unknown status ${status}`);
  const current=get(id);if(!current)throw new Error(`RACrew: unknown unit ${id}`);
  if(current.status==='GONE')return {ok:false,reason:'gone',status:'GONE'};
  if(current.status===status&&!timer)return {ok:true,unchanged:true,status};
  const day=today();
  write(id,u=>{u.status=status;u.history.push({day,status,reason});if(u.history.length>40)u.history.shift();
   for(const k of Object.keys(u.timers))if(u.timers[k].statusBound)delete u.timers[k];
   if(timer)u.timers[timer.name||'status']={until:day+Math.max(0,Math.trunc(Number(timer.days)||0)),onExpire:timer.onExpire??null,statusBound:true};});
  emit({type:'status',id,from:current.status,to:status,reason,day});return {ok:true,status};
 }
 function story(id,key,value=true){write(id,u=>{u.stories[key]=value;});emit({type:'story',id,key,value});return value;}
 const stories=id=>get(id)?.stories||{};
 function bond(id,other,delta){if(!defs.has(other))throw new Error(`RACrew.bond: unknown unit ${other}`);let next=0;write(id,u=>{next=(Number(u.bonds[other])||0)+Number(delta||0);u.bonds[other]=next;});emit({type:'bond',id,other,value:next});return next;}
 function setBond(id,other,value){if(!defs.has(other))throw new Error(`RACrew.setBond: unknown unit ${other}`);write(id,u=>{u.bonds[other]=Number(value)||0;});emit({type:'bond',id,other,value:Number(value)||0});return Number(value)||0;}
 function setTimer(id,name,{days,onExpire=null}){const day=today();write(id,u=>{u.timers[name]={until:day+Math.max(0,Math.trunc(Number(days)||0)),onExpire};});return day+Math.max(0,Math.trunc(Number(days)||0));}
 // Expire timers whose day has come, in unit-id then timer-name order (deterministic).
 function tick(day=today()){
  const expired=[];
  for(const [id,u] of Object.entries(units()).sort((a,b)=>a[0]<b[0]?-1:1))for(const [name,t] of Object.entries(u.timers||{}).sort((a,b)=>a[0]<b[0]?-1:1))if(t.until<=day)expired.push({id,name,onExpire:t.onExpire});
  for(const e of expired){write(e.id,u=>{delete u.timers[e.name];});emit({type:'timer',id:e.id,name:e.name,day});if(e.onExpire)setStatus(e.id,e.onExpire,{reason:`timer:${e.name}`});}
  return expired;
 }
 const onChange=fn=>{listeners.add(fn);return ()=>listeners.delete(fn);};
 const snapshot=()=>Object.fromEntries(list().map(u=>[u.id,{status:u.status,class:u.class,stories:u.stories,bonds:u.bonds,timers:u.timers}]));
 window.RACrew={STATUSES:[...STATUSES],define,registerStatus,get,list,setStatus,story,stories,bond,setBond,setTimer,tick,onChange,snapshot,ids:()=>[...defs.keys()].sort(),statuses:()=>[...STATUSES,...extra]};
 window.RAWakeBus?.subscribe({id:'if1.crew-timers',fragment:'if1',phase:'wake',priority:26,fn:()=>{if(window.RAFrag.has('if1'))tick();}});
})();
