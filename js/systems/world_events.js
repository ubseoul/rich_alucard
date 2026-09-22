(function(){
 const STATUSES=['unavailable','eligible','pending','delivered','seen','resolved'];
 const clone=value=>JSON.parse(JSON.stringify(value));
 const definitions=()=>window.RAWorldEventDefinitions||[];
 const byId=id=>definitions().find(event=>event.id===id)||null;
 const now=()=>new Date().toISOString();
 function records(){return RAState.get().life.events.records||{}}
 function record(id){return records()[id]||null}
 function saveRecord(id,next){const all=clone(records());all[id]=next;RAState.patch('life.events.records',all);return next}
 function baseRecord(id){return record(id)||{status:'unavailable',deliveries:0}}
 function personPasses(req){
  if(!req)return {ok:true};
  const person=window.RAPeople?.record?.(req.id);
  const failures=[];
  if(!person)failures.push('person-record-missing');
  if(req.met===true&&!person?.met)failures.push('person-not-met');
  if(req.memory&&!person?.memories?.includes(req.memory))failures.push(`person-memory:${req.memory}`);
  if(req.conversionState&&person?.conversionState!==req.conversionState)failures.push(`person-conversion:${req.conversionState}`);
  if(req.contactable===true&&person?.contactable!==true)failures.push('person-not-contactable');
  for(const [flag,value] of Object.entries(req.flags||{}))if(person?.flags?.[flag]!==value)failures.push(`person-flag:${flag}`);
  return {ok:failures.length===0,failures};
 }
 function evaluate(definition){
  const event=typeof definition==='string'?byId(definition):definition;
  if(!event)return null;
  const current=baseRecord(event.id),failures=[];
  const person=personPasses(event.prerequisite?.person);
  if(!person.ok)failures.push(...person.failures);
  for(const [flag,value] of Object.entries(event.prerequisite?.flags||{}))if(RAState.get().life.world.flags?.[flag]!==value)failures.push(`flag:${flag}`);
  const eligible=failures.length===0;
  return {id:event.id,status:current.status,eligible,failures,deliveryChannel:event.deliveryChannel,safeBoundaries:event.safeBoundaries||[],once:!!event.once};
 }
 function evaluations(){return definitions().map(evaluate)}
 function markEligible(event){
  const current=baseRecord(event.id);
  if(['pending','delivered','seen','resolved'].includes(current.status))return current;
  return saveRecord(event.id,{...current,status:'eligible',eligibleAt:current.eligibleAt||now()});
 }
 function makePending(event,boundary){
  const current=baseRecord(event.id);
  if(['pending','delivered','seen','resolved'].includes(current.status))return current;
  return saveRecord(event.id,{...current,status:'pending',eligibleAt:current.eligibleAt||now(),pendingAt:now(),boundary});
 }
 function advanceBoundary(boundary){
  const changed=[];
  for(const event of definitions()){
   const current=baseRecord(event.id);
   if(event.once&&['delivered','seen','resolved'].includes(current.status))continue;
   const result=evaluate(event);
   if(!result?.eligible)continue;
   const safe=(event.safeBoundaries||[]).includes(boundary);
   changed.push(safe?makePending(event,boundary):markEligible(event));
  }
  return changed;
 }
 function deliver(channel){
  const delivered=[];
  for(const event of definitions().filter(item=>item.deliveryChannel===channel)){
   const current=baseRecord(event.id);
   if(current.status!=='pending')continue;
   const next=saveRecord(event.id,{...current,status:'delivered',deliveredAt:current.deliveredAt||now(),deliveries:(current.deliveries||0)+1});
   delivered.push({...event,state:next});
  }
  return delivered;
 }
 function pending(channel){return definitions().filter(event=>event.deliveryChannel===channel&&['pending','delivered','seen'].includes(baseRecord(event.id).status)).map(event=>({...event,state:baseRecord(event.id)}))}
 function see(id){const event=byId(id),current=baseRecord(id);if(!event||!['delivered','pending'].includes(current.status))return current;return saveRecord(id,{...current,status:'seen',seenAt:current.seenAt||now()})}
 function applyResolution(event,action){
  const resolution=action?.resolution||{};
  if(resolution.flag)RAState.patch(`life.world.flags.${resolution.flag}`,true);
  RAState.recordEvent({id:`world-event:${event.id}:${action.id}`,type:resolution.historyType||'world_event_resolved',eventId:event.id,actionId:action.id});
 }
 function resolve(id,actionId){
  const event=byId(id),current=baseRecord(id);if(!event)return null;
  const action=event.actions?.find(item=>item.id===actionId)||event.actions?.[0]||{id:'acknowledge'};
  applyResolution(event,action);
  return saveRecord(id,{...current,status:'resolved',seenAt:current.seenAt||now(),resolvedAt:now(),resolution:action.id});
 }
 function reset(id){
  const all=clone(records());
  if(id)delete all[id];else for(const event of definitions())delete all[event.id];
  RAState.patch('life.events.records',all);
  return records();
 }
 document.addEventListener('ra:scene',event=>{if(event.detail?.id==='bedroom')advanceBoundary('bedroom-entry')});
 window.RAWorldEvents={statuses:STATUSES,definitions:definitions(),byId,evaluate,evaluations,advanceBoundary,deliver,pending,see,resolve,reset,record};
})();
