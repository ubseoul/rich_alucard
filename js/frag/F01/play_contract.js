(function(root){
 'use strict';
 // F01 THE PLAY — RAPlayContract: the ONE versioned request/result contract between the strategic layer (F04 WAR ROOM) and THE PLAY (OL-023).
 //   F04 -> F01   request   schema 'F04.play_request'  : what play the War Room wants to make (job, who is available, what is owned, banked cash, HEAT).
 //   F01 -> F04   result    schema 'F01.play_result'   : the canonical record of what happened (statuses, cash, HEAT, possessions, loot, recruits).
 // F01 owns this file and the version. F04 builds requests and consumes results; neither side re-implements the other's logic.
 // Pure data + validators: no DOM, no engine. Loaded before F04 (classic script, global RAPlayContract) and by the PLAY page (embed mode).
 // Units: cash is in DOLLARS on both sides of the wire (F01's internal $K is converted inside the F01 adapter, never leaked).
 // Ids: crew ids are F04/RACrew ids; F01 car ids are SUPRA | S2000 | URUS | HOOPTIE (F04 maps its owned cars onto them).
 const VERSION=1;
 const REQUEST_SCHEMA='F04.play_request',RESULT_SCHEMA='F01.play_result';
 // F01 status vocabulary as it crosses the wire (the strategic layer maps it onto RACrew statuses).
 const CREW_AFTER=Object.freeze(['READY','WOUNDED','SHOT','CAPTURED','GONE','DEAD']);
 const CREW_BEFORE=Object.freeze(['ACTIVE','DOWNED','CAPTURED']); // GONE crew are never sent
 const STATUS=Object.freeze({COMPLETE:'COMPLETE',DECLINED:'DECLINED',REFUSED:'REFUSED'});
 const isObj=v=>v&&typeof v==='object'&&!Array.isArray(v);
 const num=v=>typeof v==='number'&&Number.isFinite(v);

 function validateRequest(req){
  const errors=[];
  if(!isObj(req))return {ok:false,errors:['request must be an object']};
  if(req.schema!==REQUEST_SCHEMA)errors.push(`schema must be ${REQUEST_SCHEMA}`);
  if(req.version!==VERSION)errors.push(`version must be ${VERSION} (got ${req.version})`);
  if(typeof req.requestId!=='string'||!req.requestId)errors.push('requestId required (idempotency key)');
  if(!num(req.seed))errors.push('seed (number) required');
  if(!num(req.day))errors.push('day (number) required');
  if(!isObj(req.job)||typeof req.job.f01JobId!=='string')errors.push('job.f01JobId required');
  else if(req.job.f01JobId==='extract'&&!(isObj(req.job.captive)&&Array.isArray(req.job.captive.ids)&&req.job.captive.ids.length))errors.push('an EXTRACT request needs job.captive.ids');
  if(!Array.isArray(req.roster)||!req.roster.length)errors.push('roster required');
  else req.roster.forEach((o,i)=>{
   if(!isObj(o)||typeof o.id!=='string'||!o.id)errors.push(`roster[${i}].id required`);
   else{
    if(!CREW_BEFORE.includes(o.status))errors.push(`roster[${i}] ${o.id}: status must be one of ${CREW_BEFORE.join('|')}`);
    if(typeof o.name!=='string'||typeof o.cls!=='string')errors.push(`roster[${i}] ${o.id}: name and cls required`);
   }
  });
  if(!isObj(req.garage)||!Array.isArray(req.garage.owned))errors.push('garage.owned required');
  if(!num(req.bank)||req.bank<0)errors.push('bank (dollars >= 0) required');
  if(!num(req.heat)||req.heat<0)errors.push('heat (>= 0) required');
  if(req.rosterCap!==undefined&&!(num(req.rosterCap)&&req.rosterCap>=1))errors.push('rosterCap must be a positive number');
  return {ok:!errors.length,errors};
 }

 function validateResult(res){
  const errors=[];
  if(!isObj(res))return {ok:false,errors:['result must be an object']};
  if(res.schema!==RESULT_SCHEMA)errors.push(`schema must be ${RESULT_SCHEMA}`);
  if(res.version!==VERSION)errors.push(`version must be ${VERSION} (got ${res.version})`);
  if(typeof res.requestId!=='string'||!res.requestId)errors.push('requestId required');
  if(!Object.values(STATUS).includes(res.status))errors.push(`status must be one of ${Object.values(STATUS).join('|')}`);
  if(res.status==='COMPLETE'){
   if(!isObj(res.outcome)||typeof res.outcome.win!=='boolean')errors.push('outcome.win (boolean) required');
   if(!Array.isArray(res.crew))errors.push('crew[] required');
   else res.crew.forEach((o,i)=>{if(!o||typeof o.id!=='string'||!CREW_AFTER.includes(o.after))errors.push(`crew[${i}] needs id and after in ${CREW_AFTER.join('|')}`);});
   if(!isObj(res.cash)||!num(res.cash.gain)||!num(res.cash.spent))errors.push('cash.gain and cash.spent (dollars) required');
   if(!isObj(res.heat)||!num(res.heat.delta))errors.push('heat.delta required');
   if(!isObj(res.car))errors.push('car required');
   for(const k of ['recruits','rescued','captured','loot','storySeeds','newBonds'])if(!Array.isArray(res[k]))errors.push(`${k}[] required`);
  }
  return {ok:!errors.length,errors};
 }

 root.RAPlayContract={VERSION,REQUEST_SCHEMA,RESULT_SCHEMA,STATUS,CREW_AFTER,CREW_BEFORE,validateRequest,validateResult};
})(typeof window!=='undefined'?window:globalThis);
