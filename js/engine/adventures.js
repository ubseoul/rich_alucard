(function(){
 // ADVENTURE GRAMMAR KIT (VOL 1 §8): one reusable beat runner so 60+ nights from three departments
 // feel like one game. REACHED FOR → ROUTE → ARRIVAL → STAGED STATUS → ESCALATION → FORK → EXIT → RETURN → MEMORY.
 // Content lives in js/data/btf/adventures/*.js as data + tiny predicates. Runtime state: life.adventures.
 //
 // Node fields (all optional):
 //  env           environment id (js/data/btf/environments.js) — inherited from the previous node
 //  actors        {left,right,mid,farLeft,farRight: personId | {id,state,flip}} — inherited unless replaced
 //  title         establishing card shown once, held for one tap (ARRIVAL)
 //  lines         [[speakerId|null, text, {vp,entrance,beat}]...] — speakerId 'rich' for Rich; null narration
 //  enter(A)      effects applied ONCE per run (tracked in the saved record, reload-safe)
 //  choices       [{label, sub, octopus, when(L), fx(A), next}]
 //  next          node id or (A)=>id
 //  route         {dest, next} — shows the 1–3 legible ways to get there (car / walk / fly / dragon / ride)
 //  minigame      {id, params(A), next(A,result)}
 //  fight         {enemy, params(A), win, lose, spared}
 //  end           {outcome, home:[speaker,text,opts], nightEnder, memory:{text,lane}, receipt:{caption}, fx(A)}
 const defs=new Map();
 const clone=v=>JSON.parse(JSON.stringify(v??null));
 const life=()=>RAState.get().life;
 function define(def){
  if(!def?.id||!def.nodes||!def.start)throw new Error(`Adventure ${def?.id} missing id/start/nodes`);
  if(!def.nodes[def.start])throw new Error(`Adventure ${def.id} start node missing`);
  defs.set(def.id,{repeatable:false,lane:'life',scope:'MUST',...def});return def;
 }
 const get=id=>defs.get(id)||null;
 const all=()=>[...defs.values()];
 const record=id=>life().adventures.records[id]||null;
 const active=()=>life().adventures.active;
 function saveRecord(id,rec){const recs={...life().adventures.records,[id]:rec};RAState.patch('life.adventures.records',recs);}
 function patchActive(fields){const a=active();if(!a)return null;const next={...a,...fields};RAState.patch('life.adventures.active',next);return next;}
 function isDone(id){const r=record(id);return !!r&&(r.status==='completed'||(r.count||0)>0);}
 function available(id){
  const def=get(id);if(!def)return false;const a=active();if(a&&a.id!==id)return false;
  if(!def.repeatable&&isDone(id))return false;
  if(def.cooldown&&record(id)?.completedDay&&RALife.today().day-record(id).completedDay<def.cooldown)return false;
  if(def.oncePerNight&&record(id)?.lastDay===RALife.today().day)return false;
  try{return def.available?def.available(RALife.L())!==false:true}catch(e){console.error(e);return false}
 }
 // Adventure context handed to content callbacks.
 function context(){
  const a=active();const vars=a?.vars||{};
  return {L:RALife.L(),life:RALife,rel:window.RARelations,vars,
   set(key,value){const cur=active();if(!cur)return;patchActive({vars:{...(cur.vars||{}),[key]:value}});vars[key]=value;},
   get:key=>active()?.vars?.[key],
   flag:RALife.flag,setFlag:RALife.setFlag,
   id:a?.id||null};
 }
 function resolveNext(next,A,extra){return typeof next==='function'?next(A,extra):next;}
 function start(id,{from='phone',vars={}}={}){
  const def=get(id);if(!def)return false;const cur=active();if(cur){if(cur.id===id)return cur;return false;}
  const rec=record(id)||{status:'available',count:0};
  saveRecord(id,{...rec,status:'active',startedDay:RALife.today().day});
  const run={id,node:def.start,applied:[],vars:{...vars},startedDay:RALife.today().day,from,env:null,actors:{}};
  RAState.patch('life.adventures.active',run);
  RAClock.logOuting({type:'adventure',id,title:def.title});
  return run;
 }
 // Enter a node: inherit env/actors, apply once-only effects, persist position.
 function enter(nodeId){
  const a=active();if(!a)return null;const def=get(a.id);const node=def.nodes[nodeId];if(!node){console.error('missing node',a.id,nodeId);return null;}
  const C=context();const envSrc=typeof node.env==='function'?node.env(C):node.env;const actSrc=typeof node.actors==='function'?node.actors(C):node.actors;
  const env=envSrc||a.env;let actors=actSrc===null?{}:actSrc?{...(node.keepActors?a.actors:{}),...actSrc}:a.actors;
  patchActive({node:nodeId,env,actors});
  if(node.enter&&!(active().applied||[]).includes(nodeId)){patchActive({applied:[...(active().applied||[]),nodeId]});try{node.enter(context())}catch(e){console.error('enter fx',a.id,nodeId,e)}}
  return {node,env,actors:active().actors,def};
 }
 function choicesFor(nodeId){
  const a=active();if(!a)return [];const node=get(a.id)?.nodes[nodeId];const L=RALife.L();
  const list=typeof node?.choices==='function'?node.choices(context()):(node?.choices||[]);
  return list.map((c,index)=>{let ok=true;try{ok=c.when?c.when(L)!==false:true}catch(e){ok=false}return {...c,index,locked:!ok};}).filter(c=>!(c.locked&&c.hideLocked!==false));
 }
 function choose(nodeId,index){
  const a=active();if(!a)return null;const node=get(a.id).nodes[nodeId];const all=typeof node?.choices==='function'?node.choices(context()):(node?.choices||[]);const c=all[index];if(!c)return null;
  let ok=true;try{ok=c.when?c.when(RALife.L())!==false:true}catch(e){ok=false}if(!ok)return null;
  const A=context();if(c.fx)try{c.fx(A)}catch(e){console.error('choice fx',e)}
  if(c.tendency)RALife.tendency(c.tendency);
  const picks={...(active().vars?.picks||{}),[nodeId]:c.id||index};A.set('picks',picks);
  return resolveNext(c.next,context());
 }
 function nextOf(nodeId){const a=active();const node=get(a.id).nodes[nodeId];return resolveNext(node.next,context());}
 function afterMinigame(nodeId,result){const a=active();const node=get(a.id).nodes[nodeId];window.RALifeRewards?.apply?.(result,{adventure:a.id});return resolveNext(node.minigame.next,context(),result);}
 function afterFight(nodeId,result){const a=active();const node=get(a.id).nodes[nodeId];const f=node.fight;const A=context();A.set('fight',result.outcome);if(f.after)try{f.after(A,result)}catch(e){console.error(e)}
  return resolveNext(result.outcome==='win'?f.win:result.outcome==='spared'?(f.spared||f.win):result.outcome==='run'?(f.run||f.lose):f.lose,context(),result);}
 // EXIT + RETURN + MEMORY. Every authored adventure writes at least one later-readable memory.
 function complete(nodeId){
  const a=active();if(!a)return null;const def=get(a.id);const end=def.nodes[nodeId]?.end||{};const A=context();
  if(end.fx)try{end.fx(A)}catch(e){console.error('end fx',e)}
  const outcome=typeof end.outcome==='function'?end.outcome(A):(end.outcome||'done');
  const mem=typeof end.memory==='function'?end.memory(A):(end.memory||{text:def.memory||def.title.toLowerCase(),lane:def.lane});
  RALife.remember({id:`adv:${def.id}:${outcome}:${(record(def.id)?.count||0)+1}`,text:mem.text,lane:mem.lane||def.lane,type:def.memoryType||'adventure',quality:mem.quality||def.quality||1});
  const rc=typeof end.receipt==='function'?end.receipt(A):end.receipt;
  if(rc)RALife.receipt({id:`${def.id}:${rc.id||outcome}`,caption:rc.caption,vp:rc.vp!==false,env:a.env,lane:def.lane});
  if(def.legend)RALife.light('legend',1,`legend:${def.id}`);
  const rec=record(def.id)||{count:0};
  saveRecord(def.id,{...rec,status:'completed',count:(rec.count||0)+1,completedDay:RALife.today().day,lastDay:RALife.today().day,outcome,picks:a.vars?.picks||{}});
  RAState.recordEvent({id:`adventure:${def.id}:${(rec.count||0)+1}`,type:'adventure_completed',adventureId:def.id,outcome,day:RALife.today().day});
  const home=typeof end.home==='function'?end.home(A):end.home;
  RAState.patch('life.clock.returnBeat',home?{speaker:home[0],text:home[1],vp:!!home[2]?.vp,adventure:def.id,nightEnder:!!(end.nightEnder||def.nightEnder)}:{adventure:def.id,nightEnder:!!(end.nightEnder||def.nightEnder)});
  RAState.patch('life.adventures.active',null);
  document.dispatchEvent(new CustomEvent('ra:adventure-complete',{detail:{id:def.id,outcome}}));
  const chain=typeof end.chain==='function'?end.chain(A):end.chain;
  if(chain)RAState.patch('life.clock.returnBeat',null);
  return {id:def.id,outcome,nightEnder:!!(end.nightEnder||def.nightEnder),location:end.location,chain:chain||null,chainVars:end.chainVars?end.chainVars(A):{}};
 }
 function abandon(){const a=active();if(!a)return;const rec=record(a.id)||{};saveRecord(a.id,{...rec,status:rec.count?'completed':'available'});RAState.patch('life.adventures.active',null);}
 // Static validation used by tests: every node reachable target exists, every adventure has an end + memory.
 function validate(def){
  const errors=[];const ids=Object.keys(def.nodes);let hasEnd=false;
  for(const [id,n] of Object.entries(def.nodes)){
   if(n.end)hasEnd=true;
   const targets=[];if(typeof n.next==='string')targets.push(n.next);if(Array.isArray(n.choices))for(const c of n.choices)if(typeof c.next==='string')targets.push(c.next);
   if(n.route&&typeof n.route.next==='string')targets.push(n.route.next);
   if(n.fight)for(const k of ['win','lose','spared','run'])if(typeof n.fight[k]==='string')targets.push(n.fight[k]);
   for(const t of targets)if(!ids.includes(t))errors.push(`${def.id}.${id} → missing node ${t}`);
   if(!n.end&&!n.next&&!n.choices&&!n.route&&!n.minigame&&!n.fight)errors.push(`${def.id}.${id} dead end`);
   for(const line of Array.isArray(n.lines)?n.lines:[])if(line&&line[0]==='rich'&&!(line[2]&&(line[2].vp||line[2].canon)))errors.push(`${def.id}.${id} Rich line not marked [VP]: ${line[1]}`);
  }
  if(!hasEnd)errors.push(`${def.id} has no end node`);
  return errors;
 }
 window.RAAdventures={define,get,all,record,active,available,start,enter,choicesFor,choose,nextOf,afterMinigame,afterFight,complete,abandon,validate,isDone,context,patchActive};
})();
