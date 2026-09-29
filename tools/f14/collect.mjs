// F14-A — DETECTION HELPERS (pure functions).
//
// The browser layer collects observations; these functions decide. Keeping them pure makes them testable without a
// browser and deterministic, which is what a reproduction bundle needs.
import {duplicateIds} from './assets.mjs';

// ---- persistence / progression invariants -------------------------------------------------
// Mirrors tools/playtest-qa.mjs invariants() but as a pure function over an RAState shape.
export function stateInvariants(state,{version=null,isRepeatable=()=>false}={}){
  const out=[];const L=state?.life;
  if(!L)return ['state has no life'];
  if(version!=null&&state.version!==version)out.push(`version ${state.version} != ${version}`);
  if(!Number.isFinite(L.resources?.money))out.push('money not finite');
  if(!Number.isInteger(L.world?.day)||L.world.day<1)out.push(`bad day ${L.world?.day}`);
  const dup=(list,key='id')=>duplicateIds(list,key);
  for(const [name,list] of [['receipts',L.receipts],['memoryLog',L.memoryLog],['mail',L.clock?.mail],['history',L.history],['cars',L.ownership?.cars],['properties',L.ownership?.properties],['castleRooms',L.ownership?.castleRooms]]){
    const d=dup(list);if(d.length)out.push(`duplicate ${name}: ${d.slice(0,3).join(',')}`);
  }
  for(const [id,rec] of Object.entries(L.adventures?.records||{}))if(!isRepeatable(id)&&(rec.count||0)>1)out.push(`non-repeatable adventure ${id} completed ${rec.count}×`);
  for(const [id,rec] of Object.entries(L.events?.records||{}))if((rec.deliveries||0)>1)out.push(`world event ${id} delivered ${rec.deliveries}×`);
  for(const [thread,messages] of Object.entries(L.phone?.threads||{})){const d=duplicateIds(messages);if(d.length)out.push(`duplicate text ids in ${thread}: ${d.slice(0,3).join(',')}`);}
  return out;
}

// Duplicate-resolution detector: a one-time resolution must not be granted twice. `records` are {id:{count}} maps
// (adventures/events). `authoredFailures` are ids that are allowed to repeat (authored failure branches).
export function duplicateResolutions({adventures={},events={},authoredFailures=[]}={}){
  const out=[];const allowed=new Set(authoredFailures);
  for(const [id,rec] of Object.entries(adventures||{}))if(!allowed.has(id)&&(rec?.count||0)>1)out.push({kind:'duplicate-adventure-resolution',id,count:rec.count});
  for(const [id,rec] of Object.entries(events||{}))if((rec?.deliveries||0)>1)out.push({kind:'duplicate-event-delivery',id,count:rec.deliveries});
  return out;
}

// ---- softlock detection -------------------------------------------------------------------
// Given a stream of cheap UI/state signatures, a softlock is a run of identical signatures longer than `window`
// (the player can no longer change anything). Mirrors playtest-qa's 40-input rule as a reusable predicate.
export function detectSoftlock(signatures,{window=40}={}){
  if(signatures.length<window)return null;
  const tail=signatures.slice(-window);
  const first=tail[0];
  if(tail.every(s=>s===first))return {signature:first,repeats:window};
  return null;
}
// A budget exhaustion is a softlock the driver could not escape in `maxSteps` inputs.
export function detectBudgetExhaustion(steps,maxSteps){return steps>=maxSteps?{steps,maxSteps}:null;}

// ---- dead phone apps / dead links ---------------------------------------------------------
// Declared phone apps that never render an actionable button are dead entries. Reported only when the app is expected
// to be reachable (unlocked); a locked app is PENDING, not dead.
export function deadPhoneApps({declared=[],rendered=[],unlocked=()=>true}={}){
  const renderedSet=new Set(rendered);
  const out=[];
  for(const id of declared)if(unlocked(id)&&!renderedSet.has(id))out.push({kind:'dead-phone-app',id});
  return out;
}
export function duplicateIdsIn(values){return duplicateIds(values.map(v=>({id:v})));}

// An anchor whose target the server answered 404 (or that points at a local file that does not exist) is a dead link.
export function deadLinks({anchors=[],missing=[],statuses={}}={}){
  const missingSet=new Set(missing);
  const out=[];
  for(const href of new Set(anchors)){
    const clean=String(href).split('#')[0].split('?')[0];
    if(!clean||/^(?:https?:|mailto:|tel:|data:|#)/.test(clean))continue;
    if(missingSet.has(clean)||statuses[clean]===404)out.push({kind:'dead-link',href:clean,status:statuses[clean]||404});
  }
  return out;
}

// ---- backout / retry validation -----------------------------------------------------------
// After a backout the run must return to an idle, consistent state: no lingering scene, no active adventure, no
// half-applied consequence. `expected` names the scene the route should return to (default 'bedroom').
export function backoutFindings({before,after,expectedScene='bedroom',activeAdventure=null}={}){
  const out=[];
  if(after?.scene!==expectedScene)out.push({kind:'backout-scene',detail:`expected ${expectedScene}, got ${after?.scene}`});
  if(activeAdventure)out.push({kind:'backout-active-adventure',detail:activeAdventure});
  if(after&&before){
    for(const key of ['money','followers','clout']){
      const a=before.resources?.[key],b=after.resources?.[key];
      if(Number.isFinite(a)&&Number.isFinite(b)&&b<a)out.push({kind:'backout-lost-resource',detail:`${key} ${a} -> ${b}`});
    }
  }
  return out;
}

// A retry after a failed authored attempt must re-open the same mechanic and must not silently consume the attempt.
export function retryFindings({first,second}={}){
  const out=[];
  if(first?.available===false&&second?.available===false)out.push({kind:'retry-dead-end',detail:'mechanic unavailable before and after retry'});
  if(second&&!second.reopened)out.push({kind:'retry-not-reopened',detail:'the failed attempt did not re-open its mechanic'});
  return out;
}
