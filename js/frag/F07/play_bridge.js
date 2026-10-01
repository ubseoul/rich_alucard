// F07 M8_AND_FINALE — THE PLAY bridge. M8 THE TURF WAR and the finale's Phase 1 THE PARTY are Showdowns: they run on F01's
// canonical PLAY seam (RAShowdown.play.launch, versioned contract RAPlayContract) exactly like a War Room job. NO second combat
// engine: F07 builds the strategic request, asks F01, and applies the canonical result.
//
// What F07 applies from a result (idempotent on requestId, each effect isolated so one failure cannot abort the rest):
//   crew statuses, bonds, story seeds, recruits   — same translation as F04's play adapter (RACrew vocabulary)
//   cash.spent                                    — debited, clamped to the bank
//   the car                                       — RAVehicles.recordDrive when it survived
// What F07 does NOT apply: the PLAY's pot (cash.gain) and heat.delta. M8's money and HEAT are the AUTHORED numbers
// (Patch 1 §8: $18K, +12 HEAT) and are written by m8_and_finale.js on resolution — never on top of the PLAY pot (no duplicate rewards).
// A PLAY that is lost (or refused) resolves nothing: the mission stays open, so a loss allows retry.
(function(){
 'use strict';
 if(window.RAF07Play)return;
 const FLAG='F07.m8_and_finale',K='play';
 const FR=()=>window.RAFrag;
 const rd=(path,dflt)=>FR().read('F07',path,dflt);
 const wr=(path,value)=>FR().patch('F07',path,value);
 const T=()=>window.RAF07Tunables;
 const day=()=>window.RALife.today().day;
 const money=()=>Number(window.RAState.get().life?.resources?.money)||0;
 const enabled=()=>!!window.RAFeatures?.enabled?.(FLAG);
 // Owned RALife car id -> F01 car id (the same table F04 uses; F01 has stats for these only). Never mutates ownership.
 const CAR_FALLBACK=Object.freeze({toyota_supra_mk4_001:'SUPRA',honda_s2000_pink:'S2000',lambo_urus_oxblood:'URUS'});
 const carMap=()=>window.RAWarRoomPlay?.CAR_MAP||CAR_FALLBACK;
 const hashSeed=s=>{let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))>>>0;return (h%90000)+1000;};
 const perkOf=key=>key.startsWith('play_')?key.slice(5):null;

 // ----------------------------------------------------------------- the loan squad
 // M8: "Rich leads a squad of Gbenga's boys + any Ogas." The boys are ON LOAN: RACrew units owned by F07 (never F04's roster, so
 // they take no War Room slot and never appear in a War Room job). Names/classes are PLACEHOLDERS: the source authors neither.
 const loanSpec=i=>({id:`f07_loan_${i}`,name:`GBENGA’S BOY ${i}`,class:T().m8.LOAN_CLASSES[(i-1)%T().m8.LOAN_CLASSES.length]});
 const loanIds=()=>Array.from({length:T().m8.LOAN_SQUAD},(_,i)=>`f07_loan_${i+1}`);
 function defineLoan(){
  for(const i of loanIds().map((_,n)=>n+1)){
   const s=loanSpec(i);
   if(window.RACrew.get(s.id))continue;
   window.RACrew.define({id:s.id,name:s.name,class:s.class,fragment:'F07',meta:{onLoan:true,source:'new_oga_m8',placeholder:true}});
  }
 }
 function ensureLoan(){defineLoan();if(!rd('loan.defined',false))wr('loan.defined',true);}
 // RACrew keeps definitions in memory only: a reload re-defines the loan squad from the persisted marker (inert while never used).
 try{if(window.RACrew&&FR()?.has('F07')&&rd('loan.defined',false))defineLoan();}catch(e){console.error('F07 loan re-define',e);}

 // ------------------------------------------------------------------ the request
 const rosterOf=u=>({id:u.id,name:u.name,cls:u.class,status:u.status,bonds:{...(u.bonds||{})},
  perks:Object.keys(u.stories||{}).map(perkOf).filter(Boolean),human:u.meta?.human===true?true:undefined});
 function roster(kind){
  const live=u=>u.status!=='GONE'&&['ACTIVE','DOWNED','CAPTURED'].includes(u.status);
  const ogas=window.RACrew.list({fragment:'F04'}).filter(live).map(rosterOf);
  // M8 = the boys on loan + any Ogas. The finale's Phase 1 is Rich's own squad (the Ogas): Gbenga's boys are the OTHER side.
  const boys=kind==='m8'?window.RACrew.list({fragment:'F07'}).filter(live).map(rosterOf):[];
  return [...boys,...ogas];
 }
 function garage(){
  const map={},owned=[],cm=carMap();
  for(const c of window.RAVehicles.list()){
   if(c.service?.tributed)continue;
   const f01=cm[c.id];if(!f01||map[f01])continue;
   map[f01]=c.id;owned.push(f01);
  }
  return {owned,map};
 }
 // The F01 job. M8: Lil Smack is there (smack_crib) — unless he has left (flag lilSmackGone, A56), in which case the LIEUTENANT leads.
 function jobFor(kind){
  if(kind==='finale_p1')return T().finale.FINALE_JOB;     // 'owambe_party': F07-owned PLAY job (assets/f07/play), see js/frag/F07/play/owambe.mjs
  return window.RALife.flag('lilSmackGone')?T().m8.JOB_LIEUTENANT:T().m8.JOB_SMACK;
 }
 function buildRequest(kind,{lanes=null}={}){
  if(!window.RAPlayContract)return {ok:false,code:'NO_CONTRACT',errors:['RAPlayContract not loaded']};
  // Phase 1's squad is THE OGAS lane (Patch 1 §4.1 "THE OGAS (squad)"). The source does not say who fights Phase 1 when it is not picked,
  // and no default is invented: the PLAY is refused (NO_SQUAD) and the plan can be remade. Creator decision recorded (F07 D-queue).
  if(kind==='finale_p1'&&!(Array.isArray(lanes)&&lanes.includes('ogas')))return {ok:false,code:'NO_SQUAD',reason:'THE OGAS ARE NOT IN THE PLAN',errors:['THE OGAS lane was not picked']};
  if(kind==='m8')ensureLoan();
  const seq=Number(rd(`${K}.seq`,0))+1,requestId=`f07:${kind}:${day()}#${seq}`,g=garage();
  const req={schema:window.RAPlayContract.REQUEST_SCHEMA,version:window.RAPlayContract.VERSION,requestId,seed:hashSeed(requestId),day:day(),
   job:{f01JobId:jobFor(kind),f04Type:'TAKE_THE_BLOCK',district:kind==='m8'?'koreatown':null,districtLabel:kind==='m8'?'KOREATOWN':null,handBack:false},
   roster:roster(kind),garage:{owned:g.owned},bank:money(),heat:window.RAHeat?window.RAHeat.global():0,rosterCap:8,
   dayOneThreshold:window.RAWarRoomCrew?.DAY_ONE_THRESHOLD||3};
  return {ok:true,request:req,carMap:g.map,seq,kind};
 }

 // ------------------------------------------------------------------ the result
 const safe=(errors,tag,fn)=>{try{return fn();}catch(e){errors.push(`${tag}: ${e.message}`);console.error('F07 play consume',tag,e);return undefined;}};
 const isLoan=u=>u?.fragment==='F07';
 function applyStatus(c,errors){
  const u=window.RACrew.get(c.id);if(!u)throw new Error('unknown crew id (reported, not applied)');if(u.status==='GONE')return;
  const W=window.RAWarRoomCrew,viaWar=!isLoan(u)&&W;
  if(c.after==='READY'){if(u.status!=='ACTIVE')window.RACrew.setStatus(c.id,'ACTIVE',{reason:'f07:play'});}
  else if(c.after==='WOUNDED'||c.after==='SHOT'){
   if(viaWar)W.setRecovering(c.id,{days:c.away||1,reason:'f07:play'});
   else window.RACrew.setStatus(c.id,'DOWNED',{reason:'f07:play',timer:{days:c.away||1,onExpire:'ACTIVE'}});
  }else if(c.after==='CAPTURED'){viaWar?W.setCaptured(c.id,{reason:'f07:play'}):window.RACrew.setStatus(c.id,'CAPTURED',{reason:'f07:play'});}
  else if(c.after==='GONE'||c.after==='DEAD'){viaWar?W.setGone(c.id,{reason:'f07:play'}):window.RACrew.setStatus(c.id,'GONE',{reason:'f07:play'});}
 }
 function consume(result){
  const pending=rd(`${K}.pending`,null),consumed=rd(`${K}.consumed`,{});
  if(result&&consumed[result.requestId]){if(pending?.request.requestId===result.requestId)wr(`${K}.pending`,null);return {ok:true,duplicate:true,...consumed[result.requestId]};}
  if(!pending||!result||result.requestId!==pending.request.requestId)return {ok:false,code:'NOT_PENDING'};
  const valid=window.RAPlayContract.validateResult(result);
  if(!valid.ok){wr(`${K}.pending`,null);wr(`${K}.lastRefusal`,{day:day(),code:'BAD_RESULT',reason:valid.errors.join('; ')});return {ok:false,code:'BAD_RESULT',errors:valid.errors};}
  const errors=[],{request,carMap:cm,kind}=pending,summary={day:day(),kind,status:result.status,win:false,refused:false,code:null,reason:null,cashSpent:0};
  if(result.status==='REFUSED'){
   wr(`${K}.pending`,null);wr(`${K}.lastRefusal`,{day:day(),code:result.code,reason:result.reason});
   return {ok:true,refused:true,win:false,code:result.code,reason:result.reason,kind};
  }
  if(result.status==='COMPLETE'){
   const ids=result.crew.map(c=>c.id);
   safe(errors,'bonds',()=>{for(let a=0;a<ids.length;a++)for(let b=a+1;b<ids.length;b++)if(window.RACrew.get(ids[a])?.fragment==='F04'&&window.RACrew.get(ids[b])?.fragment==='F04')window.RAWarRoomCrew?.recordJobTogether?.(ids[a],ids[b]);});
   for(const c of result.crew)safe(errors,`crew:${c.id}`,()=>applyStatus(c,errors));
   for(const s of result.storySeeds)safe(errors,`story:${s.who}`,()=>{if(window.RACrew.get(s.who)?.fragment==='F04')window.RAWarRoomCrew?.addStory?.(s.who,`play_${s.perk}`,String(s.perk).replace(/_/g,' '));});
   for(const r of result.recruits)safe(errors,`recruit:${r.id}`,()=>window.RAWarRoomCrew?.recruit?.({id:r.id,name:r.name,cls:r.cls,source:'play'}));
   summary.cashSpent=safe(errors,'spent',()=>{const n=Math.min(Math.max(0,Math.round(result.cash.spent||0)),money());if(n>0)window.RAMoneyLedger?window.RAMoneyLedger.debit(n,{source:'new_oga:f07:play:spent'}):window.RALife.addMoney(-n);return n;})||0;
   safe(errors,'car',()=>{if(result.car.id&&!result.car.lost&&cm?.[result.car.id])window.RAVehicles.recordDrive(cm[result.car.id],{by:1});});
   Object.assign(summary,{win:!!result.outcome.win,klass:result.outcome.klass||null,crew:ids});
  }
  if(result.status==='DECLINED')summary.cashSpent=safe(errors,'spent',()=>{const n=Math.min(Math.max(0,Math.round(result.cash?.spent||0)),money());if(n>0)window.RAMoneyLedger?window.RAMoneyLedger.debit(n,{source:'new_oga:f07:play:spent'}):window.RALife.addMoney(-n);return n;})||0;
  if(result.status==='DECLINED')Object.assign(summary,{refused:true,code:'DECLINED',reason:'the offer was declined'});  // declining the PLAY resolves nothing
  const c2=rd(`${K}.consumed`,{});c2[result.requestId]={...summary,errors};
  const keys=Object.keys(c2);for(const k of keys.slice(0,Math.max(0,keys.length-20)))delete c2[k];
  wr(`${K}.consumed`,c2);wr(`${K}.seq`,pending.seq);wr(`${K}.pending`,null);
  return {ok:true,...summary,errors};
 }

 // ------------------------------------------------------------ launch / resume
 function unavailable(){
  if(!enabled())return {ok:false,code:'FLAG_OFF',reason:`${FLAG} is OFF`};
  if(!window.RAShowdown?.play)return {ok:false,code:'F01_ABSENT',reason:'THE PLAY (F01) is not loaded'};
  if(!window.RAShowdown.enabled())return {ok:false,code:'FLAG_OFF',reason:'F01.showdown_core is OFF'};
  return null;
 }
 const refusal=(r,kind)=>({ok:true,refused:true,win:false,code:r.code,reason:r.reason||(r.errors||[]).join('; ')||r.code,kind});
 // run(kind): the pending request of THIS kind is re-issued after a reload (F01 answers a completed one from its record); otherwise a
 // new one is built and persisted BEFORE F01 is asked.
 // Phase 1 runs on F07's own PLAY page (F01's controller unchanged; F07's job + stage cards installed first). Same protocol as F01's
 // iframe transport: F01.play_ready -> F04.play_request -> F01.play_result, same-origin postMessage, only the LOAD is time-boxed.
 const F07_PLAY_URL='assets/f07/play/index.html?embed=1';
 function f07Transport(request){
  return new Promise(resolve=>{
   const doc=window.document;if(!doc||!window.addEventListener)return resolve({schema:window.RAPlayContract.RESULT_SCHEMA,version:window.RAPlayContract.VERSION,requestId:request.requestId,status:'REFUSED',code:'NO_HOST',reason:'no browser to show THE PLAY',errors:[],cash:{gain:0,spent:0}});
   let src=F07_PLAY_URL;try{const q=new URLSearchParams(window.location.search);for(const k of ['speed','mute','reduce','moretime'])if(q.has(k))src+='&'+k+'='+encodeURIComponent(q.get(k));}catch(e){}
   const frame=doc.createElement('iframe');frame.src=src;frame.setAttribute('title','THE PLAY');frame.id='f01-play-frame';
   frame.style.cssText='position:fixed;inset:0;width:100%;height:100%;border:0;z-index:2147483000;background:#000';
   let done=false;const origin=window.location.origin;
   const finish=res=>{if(done)return;done=true;clearTimeout(timer);window.removeEventListener('message',on);frame.remove();resolve(res);};
   const on=ev=>{
    if(ev.origin!==origin||ev.source!==frame.contentWindow||!ev.data)return;
    if(ev.data.type==='F01.play_ready'){clearTimeout(timer);frame.contentWindow.postMessage({type:'F04.play_request',request},origin);}
    else if(ev.data.type==='F01.play_result')finish(ev.data.result);
   };
   const timer=setTimeout(()=>finish({schema:window.RAPlayContract.RESULT_SCHEMA,version:window.RAPlayContract.VERSION,requestId:request.requestId,status:'REFUSED',code:'PLAY_UNAVAILABLE',reason:'THE PLAY page did not answer',errors:[],cash:{gain:0,spent:0}}),20000);
   window.addEventListener('message',on);doc.body.appendChild(frame);
  });
 }
 // run(kind,{lanes,transport}): the pending request of THIS kind is re-issued after a reload (F01 answers a completed one from its record);
 // otherwise a new one is built and persisted BEFORE F01 is asked.
 let injected=null;   // headless hosts / tests only: a transport that replaces the iframe for every F07 PLAY
 async function run(kind,opts={}){
  const off=unavailable();if(off)return refusal(off,kind);
  let pending=rd(`${K}.pending`,null);
  if(pending&&pending.kind!==kind){wr(`${K}.pending`,null);pending=null;} // a request of another mission is stale: never mixed
  if(!pending){
   const built=buildRequest(kind,{lanes:opts.lanes});if(!built.ok)return refusal(built,kind);
   pending={request:built.request,carMap:built.carMap,seq:built.seq,kind,startedDay:day()};
   wr(`${K}.pending`,pending);
  }
  // a real browser page gets F07's page for Phase 1; a headless host (no DOM) uses whatever transport F01 was given (tests)
  const launchOpts=injected?{transport:injected}:kind==='finale_p1'&&typeof window.document?.createElement==='function'?{transport:f07Transport}:{};
  const result=await window.RAShowdown.play.launch(pending.request,{...launchOpts,...(opts.transport?{transport:opts.transport}:{})});
  const out=consume(result);
  return out.ok?out:refusal(out,kind);
 }

 // The adventure host: a minigame whose only job is to run the PLAY and report {win|lose|refused}. The PLAY page covers the host.
 window.RAMinigames?.register?.('f07_play',{title:'THE PLAY',mount(root,ctx){
  let alive=true;
  run(ctx.params?.kind,{lanes:ctx.params?.lanes}).then(r=>{if(alive)ctx.finish({outcome:r.refused?'refused':(r.win?'win':'lose'),data:{refused:!!r.refused,code:r.code||null,reason:r.reason||null,win:!!r.win}});},
   e=>{console.error('F07 play',e);if(alive)ctx.finish({outcome:'refused',data:{refused:true,code:'PLAY_ERROR',reason:String(e?.message||e)}});});
  return {dispose(){alive=false;}};
 }});

 window.RAF07Play={FLAG,useTransport:fn=>{injected=typeof fn==='function'?fn:null;},buildRequest,consume,run,pending:()=>rd(`${K}.pending`,null),lastRefusal:()=>rd(`${K}.lastRefusal`,null),
  consumed:id=>rd(`${K}.consumed`,{})[id]||null,jobFor,roster,ensureLoan,loanIds,defineLoan,CAR_FALLBACK};
})();
