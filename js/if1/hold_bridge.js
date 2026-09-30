(function(){
 'use strict';
 // RAHoldBridge — FCPB CONVERGENCE (integration-owned). The smallest durable host bridge between
 //   F05 raid -> F01 HOLD THE HOUSE -> canonical F01 result -> shared consequences -> F05 applyDefense.
 // F01 stays F05-unaware (it receives an ordinary 'F04.play_request' for job hold_the_house and answers an ordinary
 // 'F01.play_result'); F05 stays launch-unaware (it only exposes handoff()/applyDefense()). This host owns the lifecycle.
 //
 // UBE DECISIONS (authoritative): (1) a traphouse raid uses the EXISTING castle HOLD, unchanged: houseId/defenders/supports/attacker
 // ride along as inert context, nothing about the play varies with houseId; (2) the trap-side loss is F05's rule (affected stash +
 // 30% of unbanked cash) — the bridge applies NEITHER the castle's "half SUPPLY / a fifth of cash" narrative loss NOR anything of the
 // stash: those numbers are not in the wire result and F05 owns the ledger; (3) ignoring/backing out costs nothing and the raid stays
 // launchable.
 //
 // TRANSACTION (one, persisted in save.frag.if1.hold BEFORE F01 is launched; there is no second applied ledger):
 //   {raidId, launchId, phase, origin, request, record, plan}
 //   LAUNCHED     F01 asked; nothing applied. A reload here relaunches with the SAME launchId (F01 answers a completed request from its own record).
 //   RESULT_HELD  the canonical F01 result is durably held (record); nothing applied yet.
 //   DELIVERING   the shared plan (absolute targets) is fixed; shared steps + F05 applyDefense are being applied.
 // EXACTLY ONCE: every shared step converges to an ABSOLUTE target fixed when DELIVERING starts (money = pre + net, HEAT = pre + delta,
 // bonds = pre + 1, statuses set-if-different), so re-running delivery after a crash anywhere is a no-op for whatever already landed.
 // F05's per-raid receipt remains the final authority: a second applyDefense answers from the receipt and applies nothing.
 //
 // SHARED CONSEQUENCES (the accepted F04 play-consume semantics, minus the War Room strategy layer): banked pot + call spend
 // (net, clamped so cash never goes negative), HEAT delta, crew statuses/bonds/stories on the shared RACrew. Not applied by anyone:
 // XP, loot, recruits, cars (no invented conversions). Crew ids are RACrew ids end to end; unknown ids reject the whole result.
 // HEAT: the raid's whole delta goes to GLOBAL HEAT (a traphouse is not an F04 district; F04's district split does not apply).
 // CAPTURE CLOCK: one timer — RAWarRoomCrew.setCaptured (extract_window, 3 nights), the same window F05.capture uses; F01's inclusive
 // counter is derived (clock = until - today + 1) by the existing F04 conversion and never stored twice.
 const K='hold',JOB='hold_the_house',PHASES=Object.freeze(['LAUNCHED','RESULT_HELD','DELIVERING']);
 const clone=v=>JSON.parse(JSON.stringify(v==null?null:v));
 const isObj=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
 const day=()=>{try{return window.RALife.today().day;}catch(e){return 0;}};
 const money=()=>Number(window.RAState.get().life?.resources?.money)||0;
 const rd=(path,dflt)=>window.RAFrag.read('if1',`${K}${path?'.'+path:''}`,dflt);
 const wr=(path,value)=>window.RAFrag.patch('if1',`${K}${path?'.'+path:''}`,value);
 const hashSeed=s=>{let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))>>>0;return (h%90000)+1000;};
 const fire=(name,detail)=>{try{document.dispatchEvent(new CustomEvent(name,{detail}));}catch(e){}};
 let inflight=null;                       // one launch at a time in this page

 const F05=()=>window.RATrap&&window.RATrap.raids?window.RATrap:null;
 const tx=()=>rd('tx',null);
 const saveTx=t=>{wr('tx',t);return t;};
 const clearTx=()=>wr('tx',null);
 const refuse=(code,reason,extra)=>({ok:false,code,reason,...(extra||{})});
 // a refused/garbage result is recorded for diagnostics only (replaced each time, never a ledger)
 const noteRefusal=(code,reason,raidId)=>{try{wr('lastRefusal',{day:day(),code,reason,raidId:raidId||null});}catch(e){}};

 function unavailable(){
  if(!F05()||!window.RATrap.on())return refuse('F05_OFF','THE TRAP is not active');
  if(!window.RAShowdown||!window.RAShowdown.play)return refuse('F01_ABSENT','THE PLAY (F01) is not loaded');
  if(!window.RAShowdown.enabled())return refuse('F01_OFF','F01.showdown_core is OFF');
  if(!window.RAPlayContract)return refuse('NO_CONTRACT','RAPlayContract is not loaded');
  if(!window.RAWarRoomCrew||!window.RACrew)return refuse('NO_CREW','the shared crew (WAR ROOM) is not loaded');
  return null;
 }
 const available=()=>!unavailable();

 // ---- F01 request, from shared state, with canonical RACrew ids -------------------------------------------------------------------
 function rosterSnapshot(){
  const before=window.RAPlayContract.CREW_BEFORE;
  return window.RACrew.list({fragment:'F04'}).filter(u=>before.includes(u.status)).map(u=>({
   id:u.id,name:u.name,cls:u.class,status:u.status,bonds:{...(u.bonds||{})},
   perks:Object.keys(u.stories||{}).filter(k=>k.startsWith('play_')).map(k=>k.slice(5)),
   human:u.meta&&u.meta.human===true?true:undefined
  }));
 }
 // the pending raid's handoff context (F05-owned data) rides as inert job.context: F01 ignores it, nothing varies with houseId
 function buildRequest(handoff,launchId){
  const roster=rosterSnapshot();
  const request={
   schema:window.RAPlayContract.REQUEST_SCHEMA,version:window.RAPlayContract.VERSION,requestId:launchId,seed:hashSeed(launchId),day:day(),
   job:{f01JobId:JOB,f04Type:null,district:null,districtLabel:null,handBack:false,context:{source:'F05.raid',...clone(handoff.request)}},
   roster,garage:{owned:[]},bank:money(),heat:window.RAHeat.global(),rosterCap:8,dayOneThreshold:window.RAWarRoomCrew.DAY_ONE_THRESHOLD
  };
  const v=window.RAPlayContract.validateRequest(request);
  if(!v.ok)return {ok:false,errors:v.errors};
  for(const o of roster)if(!window.RACrew.get(o.id))return {ok:false,errors:[`unknown crew id ${o.id}`]};   // never guess an id
  return {ok:true,request};
 }

 // ---- launch --------------------------------------------------------------------------------------------------------------------
 // start({origin,transport}): the player launched HOLD from the raid surface. Also the relaunch after a reload / a back-out.
 async function start({origin=null,transport=null}={}){
  const off=unavailable();if(off)return off;
  if(inflight)return refuse('IN_PROGRESS','a HOLD is already open');
  let t=tx();
  if(t&&(t.phase==='RESULT_HELD'||t.phase==='DELIVERING'))return deliver();          // a result already exists: never replay it
  const p=window.RATrap.raids.pending();
  if(!p){if(t)clearTx();return refuse('NO_RAID','no pending raid');}
  if(t&&t.raidId!==p.id)t=null;                                                          // a transaction for another raid is not this raid's
  const h=window.RATrap.raids.handoff();                                                // marks the raid 'handed' (persisted, idempotent)
  if(!h.ok)return refuse('HANDOFF_'+String(h.reason||'refused').toUpperCase(),h.reason);
  const seq=t?Number(t.seq)||1:Number(rd('seq',0))+1;
  const launchId=t?t.launchId:`hold:${h.raidId}#${seq}`;                                // relaunch of an interrupted HOLD keeps its id
  const built=buildRequest(h,launchId);
  if(!built.ok){noteRefusal('BAD_REQUEST',built.errors.join('; '),h.raidId);return refuse('BAD_REQUEST','the shared state cannot make a HOLD request',{errors:built.errors});}
  if(!t)wr('seq',seq);
  const sent=[...new Set([...(t?.sent||[]),...built.request.roster.map(o=>o.id)])];
  t=saveTx({raidId:h.raidId,launchId,seq,phase:'LAUNCHED',origin:origin||(t&&t.origin)||null,sent,request:built.request,record:null,plan:null});   // durable BEFORE F01 is asked
  inflight=launchId;
  let result;
  try{result=await window.RAShowdown.play.launch(built.request,transport?{transport}:{});}
  catch(e){result={status:'REFUSED',code:'PLAY_ERROR',reason:String(e&&e.message||e),requestId:launchId};}
  finally{inflight=null;}
  return receive(result);
 }

 // ---- hold the result durably, then deliver --------------------------------------------------------------------------------------
 function malformed(t,code,reason){clearTx();noteRefusal(code,reason,t&&t.raidId);return refuse(code,reason,{raidId:t&&t.raidId,relaunchable:true});}
 function toF05Record(t,res){
  return {raidId:t.raidId,job:JOB,shape:'HOLD THE HOUSE',defense:true,win:!!(res.outcome&&res.outcome.win),klass:res.outcome.klass,
   fellBack:!!res.outcome.fellBack,getaway:res.outcome.getaway,captives:[...(res.captured||[])],lost:{guns:clone((res.guns&&res.guns.lost)||[])}};
 }
 function receive(res){
  const t=tx();
  if(!t)return refuse('NO_TRANSACTION','no HOLD is open: a late or repeated result is inert');
  if(!isObj(res)||res.requestId!==t.launchId)return refuse('STALE_RESULT','the result answers a different launch: ignored',{raidId:t.raidId});
  if(t.phase!=='LAUNCHED')return refuse('ALREADY_HELD','this launch already has its result');
  const valid=window.RAPlayContract.validateResult(res);
  if(!valid.ok)return malformed(t,'BAD_RESULT',valid.errors.join('; '));
  if(res.status==='REFUSED'||res.status==='DECLINED'){                                   // refused / backed out: apply NOTHING, the raid stays launchable
   clearTx();noteRefusal(res.status,res.reason||res.code||res.status,t.raidId);
   fire('ra:hold-bridge',{raidId:t.raidId,status:res.status});
   return {ok:true,applied:false,status:res.status,code:res.code||null,raidId:t.raidId,relaunchable:true};
  }
  if(!res.job||res.job.f01JobId!==JOB)return malformed(t,'BAD_RESULT','result is not a HOLD THE HOUSE record');
  const ids=[...(res.crew||[]).map(c=>c.id),...(res.captured||[]),...(res.rescued||[]),...((res.storySeeds||[]).map(s=>s.who))];
  for(const id of ids)if(typeof id!=='string'||!t.sent.includes(id)||!window.RACrew.get(id))return malformed(t,'UNKNOWN_CREW',`crew id ${JSON.stringify(id)} was not sent or is not in the shared roster (rejected, never matched by name)`);
  const rec=toF05Record(t,res);
  if(!F05().raids.fromPlayRecord(rec))return malformed(t,'UNKNOWN_OUTCOME','the result carries no canonical HELD / BREACHED / FELL_BACK / WASH outcome');
  saveTx({...t,phase:'RESULT_HELD',record:res});                                          // the canonical result survives a reload from here on
  return deliver();
 }

 // ---- the shared plan: absolute targets, fixed once ------------------------------------------------------------------------------
 function makePlan(res){
  const pre=money(),gain=Math.max(0,Math.round(res.cash.gain||0)),spent=Math.max(0,Math.round(res.cash.spent||0));
  const net=gain-Math.min(spent,pre+gain);                                                // gain first, spend clamped: cash never goes negative
  const heatNow=window.RAHeat.snapshot().global.service;
  const squad=(res.crew||[]).map(c=>c.id);const bonds=[];
  for(let i=0;i<squad.length;i++)for(let j=i+1;j<squad.length;j++){
   const a=squad[i],b=squad[j];bonds.push({a,b,ab:(window.RACrew.get(a).bonds||{})[b]||0,ba:(window.RACrew.get(b).bonds||{})[a]||0});
  }
  return {money:pre+net,net,heat:Math.max(0,heatNow+(Number(res.heat&&res.heat.delta)||0)),delta:Number(res.heat&&res.heat.delta)||0,bonds,
   crew:(res.crew||[]).map(c=>({id:c.id,after:c.after,away:c.away||1})),captured:[...(res.captured||[])],
   stories:(res.storySeeds||[]).map(s=>({who:s.who,perk:String(s.perk)})),
   unapplied:{recruits:(res.recruits||[]).length,loot:(res.loot||[]).length,rescued:(res.rescued||[]).length}};
 }
 function applyPlan(plan){
  const errors=[];const step=(tag,fn)=>{try{fn();}catch(e){errors.push(`${tag}: ${e.message}`);console.error('hold bridge',tag,e);}};
  const W=window.RAWarRoomCrew,C=window.RACrew;
  // bonds: every HOLD is a co-run for its squad (absolute: pre + 1), DAY ONE stories as recordJobTogether does
  step('bonds',()=>{for(const p of plan.bonds){
   C.setBond(p.a,p.b,p.ab+1);C.setBond(p.b,p.a,p.ba+1);
   if(p.ab+1>=W.DAY_ONE_THRESHOLD&&p.ab<W.DAY_ONE_THRESHOLD){C.story(p.a,`day_one_with_${p.b}`,true);C.story(p.b,`day_one_with_${p.a}`,true);}
  }});
  // crew statuses (F01 vocabulary -> shared RACrew), set only when different so a re-run never restarts a timer
  for(const c of plan.crew)step(`crew:${c.id}`,()=>{
   const u=C.get(c.id);if(!u||u.status==='GONE')return;
   if(c.after==='READY'){if(u.status!=='ACTIVE')C.setStatus(c.id,'ACTIVE',{reason:'hold'});}
   else if(c.after==='WOUNDED'||c.after==='SHOT'){if(u.status!=='DOWNED')W.setRecovering(c.id,{days:c.away,reason:'hold'});}
   else if(c.after==='CAPTURED'){if(u.status!=='CAPTURED')W.setCaptured(c.id,{reason:'hold'});}
   else if(c.after==='GONE'||c.after==='DEAD'){W.setGone(c.id,{reason:'hold'});}
  });
  for(const id of plan.captured)step(`captured:${id}`,()=>{const u=C.get(id);if(u&&u.status!=='CAPTURED'&&u.status!=='GONE')W.setCaptured(id,{reason:'hold'});});
  for(const s of plan.stories)step(`story:${s.who}`,()=>{W.addStory(s.who,`play_${s.perk}`,s.perk.replace(/_/g,' '));});
  // money: converge to the absolute target (one ledger entry, tagged)
  step('money',()=>{const d=plan.money-money();if(d>0)window.RAMoneyLedger.credit(d,{source:'hold_bridge:play'});else if(d<0)window.RAMoneyLedger.debit(-d,{source:'hold_bridge:play:spent'});});
  // HEAT: converge the service-held global value to its absolute target
  step('heat',()=>{const d=plan.heat-window.RAHeat.snapshot().global.service;if(d)window.RAHeat.add(d,{source:'hold_bridge:play'});});
  return errors;
 }

 // ---- deliver: shared consequences once, then F05 (whose receipt is the final exactly-once authority) ----------------------------
 function deliver(){
  let t=tx();
  if(!t||!t.record||(t.phase!=='RESULT_HELD'&&t.phase!=='DELIVERING'))return refuse('NOTHING_TO_DELIVER','no held result');
  const off=F05()&&window.RATrap.on()?null:refuse('F05_OFF','THE TRAP is not active: the held result waits');
  if(off)return off;                                                                     // the result stays held; nothing is lost
  const raids=window.RATrap.raids;
  const receipt=(window.RAFrag.read('F05','raids.applied',{})||{})[t.raidId];
  const p=raids.pending();
  if(!receipt&&(!p||p.id!==t.raidId)){                                                   // the raid is gone and never answered: apply nothing at all
   clearTx();noteRefusal('STALE_RAID','the raid this result answers is no longer pending',t.raidId);
   return refuse('STALE_RAID','the raid this result answers is no longer pending',{raidId:t.raidId});
  }
  if(t.phase==='RESULT_HELD')t=saveTx({...t,phase:'DELIVERING',plan:makePlan(t.record)});   // targets fixed BEFORE anything shared changes
  const errors=receipt?[]:applyPlan(t.plan);                                              // an answered raid's shared side is not re-driven
  // a step that threw leaves the transaction in DELIVERING: every step is idempotent, so the next recover()/start() simply retries it
  if(errors.length){noteRefusal('SHARED_STEP_FAILED',errors.join('; '),t.raidId);return refuse('SHARED_STEP_FAILED','a shared consequence failed; delivery will be retried',{raidId:t.raidId,errors});}
  const out=raids.applyDefense({record:toF05Record(t,t.record),raidId:t.raidId});
  if(!out.ok){
   if(out.reason==='flag-off')return refuse('F05_OFF','THE TRAP is not active: the held result waits');
   clearTx();noteRefusal('F05_'+String(out.reason||'refused').toUpperCase(),out.reason,t.raidId);
   return refuse('F05_'+String(out.reason||'refused').toUpperCase(),out.reason,{raidId:t.raidId,errors});
  }
  const done={ok:true,applied:true,duplicate:!!out.duplicate,canonical:out.canonical,raidId:t.raidId,errors,plan:{net:t.plan.net,heatDelta:t.plan.delta,unapplied:t.plan.unapplied},result:out.result};
  clearTx();
  fire('ra:hold-bridge',{raidId:t.raidId,status:'DELIVERED',canonical:out.canonical});
  return done;
 }

 // crash / reload recovery. A held result is delivered with no UI; an interrupted launch waits for the player to relaunch it.
 function recover(){
  try{
   const t=tx();if(!t||inflight)return {ok:true,idle:true};
   if(t.phase==='RESULT_HELD'||t.phase==='DELIVERING')return deliver();
   return {ok:true,waiting:true,phase:t.phase,raidId:t.raidId};
  }catch(e){console.error('hold bridge recover',e);return refuse('RECOVER_ERROR',String(e&&e.message||e));}
 }
 const status=()=>{const t=tx();return {active:!!t,phase:t?t.phase:null,raidId:t?t.raidId:null,launchId:t?t.launchId:null,inflight:!!inflight,available:available(),lastRefusal:rd('lastRefusal',null)};};

 try{
  document.addEventListener('ra:scene',()=>{if(window.RAFrag&&window.RAState)recover();});
  document.addEventListener('DOMContentLoaded',()=>{if(window.RAFrag&&window.RAState)recover();});
  window.RAFeatures?.onChange(()=>{if(window.RAFrag&&window.RAState)recover();});
 }catch(e){}
 window.RAHoldBridge={JOB,PHASES,available,start,receive,deliver,recover,status,transaction:tx,buildRequest,rosterSnapshot,makePlan};
})();
