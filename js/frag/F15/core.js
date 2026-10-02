// F15 VELVET ROTATION (launch trio) — core rules. DARK behind F15.velvet_rotation (requires F06.rainmaker).
//
// What lives here (no DOM, no art):
//   * per-dancer CUMULATIVE spend (every dollar actually thrown at her, floor/missed bills included) in save.frag.F15
//   * threshold eligibility (a NUMBER derived from spend) kept separate from scene completion (read from the accepted
//     adventure records, which persist once-only completion across save/reload)
//   * four sequential scenes per dancer (L1..L4) and the single global date-per-WAKE cap
//   * one-time scene money effects (idempotent; routed through the accepted money ledger)
// It adds NO income, refund, favor currency, relationship-ladder mapping or regression, and it never touches F06's core.
(function(global){
 'use strict';
 const T=()=>global.RAF15Tunables;
 const FLAG=T().FLAG;
 global.RAFeatures.register({id:FLAG,fragment:'F15',requires:['F06.rainmaker'],description:'F15 launch trio: club dancers, per-dancer support, 12 romance scenes (DARK)'});
 const enabled=()=>!!global.RAFeatures.enabled(FLAG);
 const FR=()=>global.RAFrag;
 const state=()=>FR().get('F15');
 const dancers=()=>T().DANCERS.slice();
 const isDancer=id=>T().DANCERS.includes(id);
 const sceneId=(dancer,level)=>`F15_${String(dancer).toUpperCase()}_L${level}`;
 const SCENE_RE=/^F15_(ROXY|ROSALYN|EMERALD)_L([1-4])$/;
 function parse(id){const m=SCENE_RE.exec(String(id||''));return m?{dancer:m[1].toLowerCase(),level:Number(m[2])}:null;}
 const allSceneIds=()=>dancers().flatMap(d=>[1,2,3,4].map(l=>sceneId(d,l)));
 const today=()=>global.RALife.today().day;
 const thresholds=()=>T().THRESHOLDS.levels.slice();

 // ---- selection ----------------------------------------------------------------------------------------------------
 const selected=()=>{const s=state().selected;return isDancer(s)?s:dancers()[0];};
 function select(dancer){if(!enabled()||!isDancer(dancer))return false;if(state().selected!==dancer)FR().patch('F15','selected',dancer);return true;}

 // ---- spend ledger ---------------------------------------------------------------------------------------------------
 const spent=dancer=>isDancer(dancer)?Math.max(0,Number(state().dancers[dancer]?.spent)||0):0;
 // Called by the club the instant a bill throw has been PAID (F06 production already debited the real money). `dancer` is the
 // recipient snapshotted at the throw, so a later selection change can never redirect it.
 function recordSpend(dancer,amount){
  if(!enabled()||!isDancer(dancer))return null;
  const n=Math.round(Number(amount));if(!Number.isFinite(n)||n<=0)return null;
  const prev=state().dancers[dancer]||{spent:0,throws:0};
  FR().patch('F15',`dancers.${dancer}`,{spent:(Number(prev.spent)||0)+n,throws:(Number(prev.throws)||0)+1});
  return progress(dancer);
 }
 const thresholdLevel=amount=>thresholds().filter(t=>amount>=t).length;

 // ---- progression ----------------------------------------------------------------------------------------------------
 const completedBy=(dancer,level)=>global.RAAdventures.isDone(sceneId(dancer,level));
 function completedLevel(dancer){let n=0;while(n<4&&completedBy(dancer,n+1))n++;return n;}
 // Eligibility (spend) is separate from completion (played): availableLevel is the NEXT unplayed scene IF its threshold is met.
 function progress(dancer){
  const amount=spent(dancer),reached=thresholdLevel(amount),done=completedLevel(dancer),th=thresholds();
  const next=done<4?done+1:null;
  return {dancer,spent:amount,throws:Number(state().dancers[dancer]?.throws)||0,thresholdLevel:reached,completed:done,
   next,nextThreshold:next?th[next-1]:null,toNext:next?Math.max(0,th[next-1]-amount):0,
   availableLevel:next&&next<=reached?next:null,maxed:done>=4};
 }

 // ---- one date per WAKE, globally -------------------------------------------------------------------------------------------
 // Derived from the accepted adventure records (completedDay), so save/reload can neither reset the cap nor duplicate a
 // completion. A date that is declined or abandoned has no completedDay and never uses the cap.
 function datesToday(day=today()){
  return allSceneIds().filter(id=>{const r=global.RAAdventures.record(id);return !!r&&r.status==='completed'&&r.completedDay===day;});
 }
 const capReached=(day=today())=>datesToday(day).length>=1;

 // ---- availability -----------------------------------------------------------------------------------------------------
 // Extra gate a scene may need (data): Rosalyn L1 needs Rich able to pay his half of the check.
 const GATES={};
 const gate=(id,fn)=>{GATES[id]=fn;};
 function status(id){
  const p=parse(id);if(!p)return {ok:false,code:'unknown'};
  if(!enabled())return {ok:false,code:'off'};
  if(global.RAAdventures.isDone(id))return {ok:false,code:'done'};
  const pr=progress(p.dancer);
  if(p.level!==pr.completed+1)return {ok:false,code:'sequence'};
  if(p.level>pr.thresholdLevel)return {ok:false,code:'threshold',need:thresholds()[p.level-1]-pr.spent};
  if(capReached())return {ok:false,code:'capped'};
  try{const g=GATES[id]&&GATES[id]();if(g&&g.ok===false)return {ok:false,code:g.code||'gate',need:g.need};}catch(e){return {ok:false,code:'gate'};}
  return {ok:true,code:'ready'};
 }
 const available=id=>status(id).ok;
 const nextScene=dancer=>{const p=progress(dancer);return p.next?sceneId(dancer,p.next):null;};

 // ---- one-time scene money effects (never a second debit) ---------------------------------------------------------------------
 // The accepted engine already runs `enter` once per run; this keys the debit by scene as well so even an abandoned-then-replayed
 // run cannot charge twice. Spending goes through RAMoneyLedger (tag f15:date:<scene>) — an existing deduction, never an income.
 function payOnce(id,key,amount){
  const k=`${id}:${key}`;if(state().paid?.[k])return {ok:true,already:true};
  const n=Math.max(0,Math.round(Number(amount)||0));
  if(n>0){const ok=global.RAMoneyLedger.debit(n,{source:`f15:date:${id}`,memo:key});if(!ok)return {ok:false,reason:'insufficient-funds'};}
  FR().patch('F15',`paid.${k}`,true);return {ok:true,amount:n};
 }

 // ---- identity mapping (one explicit config; confirmed by Ube 2026-10-01) ----------------------------------------------------------------
 function mapping(){
  const base={...T().IDENTITY.binding},o=state().mapping;
  if(o&&typeof o==='object'&&T().DANCERS.every(d=>T().HANDLES.includes(o[d]))&&new Set(T().DANCERS.map(d=>o[d])).size===3)return {...o};
  return base;
 }
 function setMapping(next){
  if(!T().DANCERS.every(d=>T().HANDLES.includes(next?.[d]))||new Set(T().DANCERS.map(d=>next[d])).size!==3)return false;
  FR().patch('F15','mapping',{...next});return true;
 }
 const handleOf=dancer=>mapping()[dancer];
 const dancerOf=handle=>T().DANCERS.find(d=>mapping()[d]===handle)||null;

 // ---- Rainmaker §5 THE ROTATION — DORMANT (OL-031) -------------------------------------------------------------------------------------
 // roster: [{id,tier}] (tier COMMON|RARE|LEGENDARY). With the roster at or below ROTATION.ACTIVE_ABOVE (the launch trio) EVERYONE is on stage
 // every WAKE and the roster comes back unchanged — tiers are never read. Above it, the nightly lineup shows LINEUP_SIZE dancers: weekdays draw
 // from COMMON and RARE; LEGENDARY only on Friday/Saturday and only after WHALE status. ctx={day,friday (Friday or Saturday),whale}. Nothing in
 // the club, the dates or the WAKE path calls this: the launch stage reads T().DANCERS.
 function stageLineup(roster=dancers().map(id=>({id})),ctx={}){
  const R=T().ROTATION,list=roster.map(r=>typeof r==='string'?{id:r}:r);
  if(list.length<=R.ACTIVE_ABOVE)return list.map(r=>r.id);
  const tiers=ctx.friday&&ctx.whale?R.WEEKEND_TIERS:R.WEEKDAY_TIERS;
  const eligible=list.filter(r=>tiers.includes(r.tier));
  if(eligible.length<=R.LINEUP_SIZE)return eligible.map(r=>r.id);
  const start=((Number(ctx.day)||0)%eligible.length+eligible.length)%eligible.length;
  return Array.from({length:R.LINEUP_SIZE},(_,i)=>eligible[(start+i)%eligible.length].id);
 }

 global.RAF15={FLAG,enabled,dancers,isDancer,sceneId,parse,allSceneIds,thresholds,select,selected,spent,recordSpend,thresholdLevel,completedLevel,progress,
  datesToday,capReached,status,available,nextScene,gate,payOnce,mapping,setMapping,handleOf,dancerOf,state,stageLineup};
})(window);
