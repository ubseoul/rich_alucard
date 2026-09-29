(function(){
 'use strict';
 // RADistricts — IF-1 (4J). The shared district-control interface for War Room, M10 grants and finale state.
 // INFRASTRUCTURE ONLY: it invents no district and no rule. Fragments DEFINE their districts (id, label); this service
 // stores control state uniformly in save.frag.if1.districts.<id> (lazy) and mirrors the district's HEAT through RAHeat.
 //   control states  UNCONTROLLED · CONTROLLED  (+ any a fragment registers with registerState — additive)
 //   record          {state, holder, since, history[]}   holder: a fragment-defined string (e.g. a crew/faction id) or null
 const STATES=['UNCONTROLLED','CONTROLLED'];const extra=new Set();
 const defs=new Map(),listeners=new Set();
 const clone=v=>JSON.parse(JSON.stringify(v));
 const all=()=>window.RAFrag.read('if1','districts',{});
 const valid=s=>STATES.includes(s)||extra.has(s);
 function define(def){
  if(!def||typeof def.id!=='string'||!/^[a-z][a-z0-9_]*$/i.test(def.id))throw new Error('RADistricts.define: {id} required');
  if(!def.fragment)throw new Error(`RADistricts.define(${def.id}): fragment required`);
  if(defs.has(def.id))throw new Error(`RADistricts.define: ${def.id} already defined by ${defs.get(def.id).fragment}`);
  defs.set(def.id,Object.freeze({id:def.id,fragment:def.fragment,label:def.label||def.id,meta:Object.freeze({...(def.meta||{})})}));return def.id;
 }
 function registerState(name){if(!/^[A-Z][A-Z_]*$/.test(name))throw new Error('control states are UPPER_SNAKE');extra.add(name);return name;}
 const blank=()=>({state:'UNCONTROLLED',holder:null,since:null,history:[]});
 function get(id){const d=defs.get(id);if(!d)return null;const rec=all()[id];return {...d,meta:{...d.meta},...(rec?clone(rec):blank()),heat:window.RAHeat?{value:window.RAHeat.district(id),tier:window.RAHeat.tierFor(window.RAHeat.district(id))}:null};}
 const list=({state=null,holder=null}={})=>[...defs.keys()].sort().map(get).filter(d=>(!state||d.state===state)&&(!holder||d.holder===holder));
 function setControl(id,state,{holder=null,reason=null}={}){
  if(!defs.has(id))throw new Error(`RADistricts: unknown district ${id}`);
  if(!valid(state))throw new Error(`RADistricts.setControl: unknown state ${state}`);
  const before=get(id);if(before.state===state&&before.holder===holder)return {ok:true,unchanged:true};
  const day=window.RALife.today().day,next=clone(all());const rec=next[id]||blank();
  rec.state=state;rec.holder=holder;rec.since=day;rec.history.push({day,state,holder,reason});if(rec.history.length>40)rec.history.shift();next[id]=rec;
  window.RAFrag.patch('if1','districts',next);
  const event={type:'control',id,from:before.state,to:state,holder,previousHolder:before.holder,reason,day};
  for(const fn of [...listeners]){try{fn(event);}catch(e){console.error('district listener',e);}}
  return {ok:true};
 }
 const held=holder=>list({holder}).map(d=>d.id);
 const onChange=fn=>{listeners.add(fn);return ()=>listeners.delete(fn);};
 window.RADistricts={STATES:[...STATES],define,registerState,get,list,setControl,held,onChange,ids:()=>[...defs.keys()].sort(),states:()=>[...STATES,...extra],snapshot:()=>Object.fromEntries(list().map(d=>[d.id,{state:d.state,holder:d.holder,since:d.since,heat:d.heat}]))};
})();
