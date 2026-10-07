(function(){
 'use strict';
 // F05 - THE TRAP - raids.js
 // THE TRAP sec.7 RAIDS: "at most one per 7 nights: hunters, the Open Mouth Gang, or a rival crew hits a traphouse
 // -> a SHOWDOWN (Vol 7 rules) on the traphouse map." This module ships ELIGIBILITY, SETUP, STATE, PARTICIPANTS,
 // GEAR/LOADOUT HANDOFF, an ENTRY PACKET and a RESOLUTION INTERFACE with persistence around the event. It implements
 // NO tactical combat, no grid, no substitute resolution and invents no outcomes: F01 (or an authored source) calls
 // resolve() with an outcome.
 //
 // F01 OL-023 THE PLAY is authoritative for the PLAY itself; F05 is the consumer. handoff() exposes the F05->F01
 // defense request (the cinematic HOLD THE HOUSE PLAY) and applyDefense() consumes F01's canonical result. The
 // canonical outcome vocabulary is F01's (klass FELL_BACK / WASH, defense aftermath HELD / BREACHED); F05 adds no
 // new outcome types and changes no OL-022 FALL BACK rule.
 window.RAF05=window.RAF05||{};
 const R=window.RAF05,U=R.util;
 const A=()=>R.AUTHORED,P=()=>R.PROVISIONAL;

 const ATTACKERS=[
  {id:'hunters',label:'HUNTERS',note:'human, silver bolts'},
  {id:'open_mouth_gang',label:'THE OPEN MOUTH GANG',note:"Lil Smack's crew"},
  {id:'rival_crew',label:'A RIVAL CREW',note:'someone wants the corner'}
 ];
 const F01_PENDING='F01_INTEGRATION_PENDING';

 function attackerFor(day=U.day()){return ATTACKERS[day%ATTACKERS.length];}
 function daysSinceLast(){const last=R.read('raids.lastDay',null);return last==null?Infinity:U.day()-U.int(last);}
 function heatTierOk(){
  const order=A().heat.tiers;
  return order.indexOf(R.heat.tier())>=order.indexOf(P().raidHeatTier);
 }
 function eligible(){
  if(!R.on())return {ok:false,reason:'flag-off'};
  if(!R.store.route().active)return {ok:false,reason:'route-inactive'};
  if(daysSinceLast()<U.int(A().cost.raidCadenceNights))return {ok:false,reason:'cadence'};
  if(pending())return {ok:false,reason:'raid-pending'};   // an unanswered raid is never silently replaced by the next one
  if(!heatTierOk())return {ok:false,reason:'heat-below-'+P().raidHeatTier};
  if(R.store.ownedHouses().length===0)return {ok:false,reason:'no-house'};
  return {ok:true,attacker:attackerFor()};
 }

 function defenders(){
  const roles=R.store.roles();const ids=Object.keys(roles);
  return ids.map(id=>({id,role:roles[id].role,weapon:R.weapons.owner(id),f01Pending:F01_PENDING}));
 }

 // Build the entry packet F01 consumes once frozen. Contains only eligibility/setup/state/participants/gear.
 function buildEntryPacket({houseId=null}={}){
  const check=eligible();if(!check.ok)return {ok:false,errors:[check.reason]};
  const house=houseId||R.store.ownedHouses()[0];
  const attacker=check.attacker;
  const packet={
   kind:'trap_raid',f01Pending:F01_PENDING,houseId:house,map:'traphouse',
   attacker,defenders:defenders(),
   weapons:{holdTurns:R.weapons.holdTurns(),assignments:R.weapons.list()},
   supports:{cameras:R.levels.hasUpgrade('cameras'),panicRoom:R.levels.hasUpgrade('panic_room')},
   atNight:R.heat.tier(),bigRaid:R.store.level()>=U.int(A().cost.bigRaidLevel)
  };
  return {ok:true,packet};
 }

 function schedule(){
  const check=eligible();if(!check.ok)return check;
  const packet=buildEntryPacket().packet;
  packet.id=`raid:${U.day()}:${packet.houseId}`;
  packet.day=U.day();
  packet.state='pending';
  packet.f01Pending=F01_PENDING;
  R.patch('raids.pending',packet);
  R.patch('raids.lastDay',U.day());
  if(packet.supports.cameras)R.patch('flags.raidWarning',true);   // "see raids early"
  return {ok:true,packet};
 }

 function pending(){return R.read('raids.pending',null);}

 // ---- canonical F01 OL-023 outcome adapter (F05-owned) ----
 // F01 THE PLAY emits, for a HOLD THE HOUSE / defense PLAY, klass FELL_BACK or WASH, or a defense aftermath of
 // HELD / BREACHED (js/frag/F01/play/engine.mjs). These are F01's tokens; F05 invents none. The adapter maps them
 // onto THE TRAP's already-authored raid consequences only. OL-022 FALL BACK semantics are untouched: FELL BACK is
 // a defense-only last stand with 0 captures / 0 deaths, and F05 simply does not add crew captures for it.
 const DEFENSE_OUTCOMES=['HELD','BREACHED','FELL_BACK','WASH'];
 const OUTCOME_ALIASES={
  held:'HELD',hold_win:'HELD',hold:'HELD',
  breach:'BREACHED',breached:'BREACHED',hold_breach:'BREACHED',
  fall_back:'FELL_BACK',fallback:'FELL_BACK',fell_back:'FELL_BACK',
  wash:'WASH',wash_equivalent:'WASH'
 };
 function canonicalOutcome(outcome){
  const s=String(outcome==null?'':outcome);
  if(DEFENSE_OUTCOMES.includes(s))return s;
  return OUTCOME_ALIASES[s.toLowerCase()]||null;
 }
 // Read the canonical outcome out of an F01 THE PLAY result record (F01 play/engine.mjs -> summarizeRecord).
 function fromPlayRecord(rec){
  if(!rec||typeof rec!=='object')return null;
  if(rec.fellBack||rec.klass==='FELL_BACK')return 'FELL_BACK';
  const g=rec.getaway&&typeof rec.getaway==='object'?rec.getaway.kind:rec.getaway;
  if(rec.klass==='WASH'||g==='WASH')return 'WASH';
  const defense=rec.defense===true||rec.shape==='HOLD THE HOUSE'||rec.job==='hold_the_house';
  if(defense){
   // F01's aftermath() sets getaway to HELD | BREACHED. klass COSTLY is NOT a breach signal: it also covers a HELD door with a
   // shot Oga (real records: COSTLY|HELD), so the getaway kind alone decides HELD vs BREACHED.
   if(g==='BREACHED')return 'BREACHED';
   if(g==='HELD')return 'HELD';
   return null;
  }
  if(rec.klass==='CLEAN'||rec.klass==='MESSY')return 'HELD';
  return null;
 }
 // F05 -> F01 handoff: the canonical request to run the PLAY's HOLD THE HOUSE for the PENDING raid. It carries authored/state
 // data only (raid id, house, attacker id/label, the defenders' roles + weapons, the F02 door-hold turns, F05 supports) and no
 // presentation: no map, no board, no tactical packet, no pending marker. Idempotent: the same pending raid always yields the
 // same raidId; the first call marks it 'handed' (persisted, so a reload mid-HOLD keeps it pending and re-launchable).
 const DEFENSE_JOB='hold_the_house';
 function handoff(){
  if(!R.on())return {ok:false,reason:'flag-off'};
  const p=pending();if(!p)return {ok:false,reason:'no-pending-raid'};
  if(p.state!=='handed')R.patch('raids.pending',{...p,state:'handed',handedDay:U.day()});
  const request={raidId:p.id,day:p.day,houseId:p.houseId,attacker:{id:p.attacker.id,label:p.attacker.label},
   defenders:defenders().map(d=>({id:d.id,role:d.role,weapon:d.weapon})),holdTurns:R.weapons.holdTurns(),
   supports:{cameras:!!(p.supports&&p.supports.cameras),panicRoom:!!(p.supports&&p.supports.panicRoom)},bigRaid:!!p.bigRaid};
  return {ok:true,raidId:p.id,play:{job:DEFENSE_JOB,shape:'HOLD THE HOUSE',defense:true,houseId:p.houseId,raidId:p.id},request};
 }

 // Capture is a shared RACrew status. Never re-stamp someone already CAPTURED/GONE: that would reset their extract timer.
 function capture(id){
  try{
   const cur=window.RACrew?.get(id);
   if(cur&&(cur.status==='CAPTURED'||cur.status==='GONE'))return false;
   window.RACrew?.setStatus(id,'CAPTURED',{reason:'trap:raid',timer:{name:'extract_window',days:3,onExpire:'GONE'}});return true;
  }catch(e){return false;}
 }

 // Resolution interface. F01 or an authored source calls resolve() with an outcome; F05 applies only its AUTHORED
 // consequences. Canonical F01 defense tokens are accepted directly:
 //   HELD       the door held - no F05 loss.
 //   BREACHED   the house is hit - stash + 30% unbanked + hot 5 nights; the authored fallback crew rule applies
 //              (panic room protects) unless an F01 record supplies the real captive list.
 //   FELL_BACK  OL-022 last stand - the same hit, but 0 captures (the downed come home WOUNDED on F01's side).
 //   WASH       0 able - the same hit; without an F01 record the authored fallback crew rule applies.
 function resolve({outcome='win',houseId=null,noCapture=false,state=null,captives=null}={}){
  const p=pending();if(!p)return {ok:false,reason:'no-pending-raid'};
  const house=houseId||p.houseId;const day=U.day();
  const canonical=canonicalOutcome(outcome);
  // canonical defense tokens collapse onto the authored loss basket; HELD is a clean hold.
  const eff=canonical==='HELD'?'win':(canonical?'lose':outcome);
  const zeroCapture=!!noCapture||canonical==='FELL_BACK';
  const result={outcome,canonical:canonical||null,houseId:house,day,attacker:p.attacker,stashCases:0,unbankedLost:0,hotUntilDay:null,
   propertyLost:false,crewLost:null,crewCaptured:[],state:state||canonical||null,keeps:null};
  if(eff==='lose'){
   // authored loss: stash (cases) + 30% of unbanked cash, and the house is hot for 5 nights
   const stock=R.store.batches().filter(b=>b.houseId===house);
   result.stashCases=stock.reduce((n,b)=>n+U.int(b.cases),0);
   R.patch('batches',R.store.batches().filter(b=>b.houseId!==house));
   const unbanked=U.int(R.read('unbanked',0));result.unbankedLost=Math.round(unbanked*U.num(A().cost.raidLossUnbankedPct));
   R.patch('unbanked',unbanked-result.unbankedLost);   // banked money is never touched
   const hotUntil=day+U.int(A().cost.raidHotNights);
   R.patch(`houses.${house}.hotUntilDay`,hotUntil);result.hotUntilDay=hotUntil;
   // crew: an F01 record is authoritative when supplied; otherwise the AUTHORED fallback rule (panic room protects),
   // unless the outcome forbids capture (FALL BACK: 0 captures/deaths, downed WOUNDED on F01's side)
   if(Array.isArray(captives)){
    result.crewCaptured=captives.map(c=>typeof c==='string'?c:(c&&(c.id||c.who))).filter(Boolean);
    for(const id of result.crewCaptured)capture(id);
    result.crewLost=result.crewCaptured[0]||null;
   }else if(!zeroCapture&&!(p.supports&&p.supports.panicRoom)&&p.defenders&&p.defenders.length){
    const victim=p.defenders[0].id;
    capture(victim);
    result.crewLost=victim;result.crewCaptured=[victim];
   }
  }
  if(eff==='big_raid'){
   // "at EMPIRE level, one authored BIG RAID can take a property permanently"; Rich keeps castle, cars and banked cash
   result.propertyLost=true;result.keeps=A().cost.bigRaidKeeps.slice();
   R.patch(`houses.${house}.owned`,false);
   R.patch(`houses.${house}.lostDay`,day);
  }
  const history=(R.read('raids.history',[])||[]).slice();history.push(result);R.patch('raids.history',history.slice(-20));
  // exactly-once receipt keyed by raid id (last 20), written before the pending raid is cleared: a repeated or late delivery of
  // the same F01 record is answered from the receipt and never re-applies a loss, a capture or a state change
  const applied={...(R.read('raids.applied',{})||{})};applied[p.id]={canonical:canonical||null,day,result};
  for(const k of Object.keys(applied).slice(0,-20))delete applied[k];
  R.patch('raids.applied',applied);
  R.patch('raids.pending',null);
  R.patch('flags.raidWarning',false);
  if(canonical)R.patch('raids.lastOutcome',{canonical,day,houseId:house});   // F05 records its own view of the last outcome
  return {ok:true,result};
 }

 // F01 -> F05: consume the canonical result of the HOLD F05 handed off (a token or an F01 THE PLAY record) and apply THE TRAP's
 // authored consequences, exactly once per raid. The result must name its raid (raidId, from handoff()):
 //   * raidId already applied            -> {ok:true,duplicate:true,...} from the receipt, nothing re-applied
 //   * no pending raid / other raid id   -> refused ('no-pending-raid' / 'stale-raid'); a stale record can never hit the next raid
 // F05 applies ONLY what it owns: the traphouse stash + unbanked cash, the house heat window, the raid history, and crew capture
 // state. It applies NO money to the balance, NO HEAT, NO XP and no loot: the record's pot/heatDelta/spent/pocketLoss are F01's.
 function applyDefense({canonical=null,record=null,raidId=null,houseId=null,state=null}={}){
  if(!R.on())return {ok:false,reason:'flag-off'};
  const id=raidId||(record&&record.raidId)||null;
  if(!id)return {ok:false,reason:'raid-id-required'};
  const done=(R.read('raids.applied',{})||{})[id];
  if(done)return {ok:true,duplicate:true,canonical:done.canonical,result:done.result};
  const p=pending();
  if(!p)return {ok:false,reason:'no-pending-raid'};
  if(p.id!==id)return {ok:false,reason:'stale-raid'};
  const c=canonical?canonicalOutcome(canonical):fromPlayRecord(record);
  if(!c)return {ok:false,reason:'unknown-outcome'};
  const captives=record&&Array.isArray(record.captives)?record.captives:null;
  const res=resolve({outcome:c,houseId,captives,state:state||c});
  if(!res.ok)return res;
  // a gun F01 says was lost is released from the F02/F05 weapon seam (no duplicate ownership)
  if(record&&record.lost&&Array.isArray(record.lost.guns))for(const g of record.lost.guns){if(g&&g.from)try{R.weapons.clear(g.from);}catch(e){}}
  return {ok:true,duplicate:false,canonical:c,result:res.result};
 }

 function cancel(reason='cancelled'){
  const p=pending();if(!p)return {ok:false,reason:'no-pending-raid'};
  R.patch('raids.pending',null);R.patch('flags.raidWarning',false);
  return {ok:true,reason};
 }

 R.raids={ATTACKERS,F01_PENDING,DEFENSE_OUTCOMES,DEFENSE_JOB,attackerFor,daysSinceLast,eligible,defenders,buildEntryPacket,
  handoff,schedule,pending,resolve,applyDefense,canonicalOutcome,fromPlayRecord,cancel,
  lastOutcome:()=>R.read('raids.lastOutcome',null),
  history:()=>(R.read('raids.history',[])||[]).slice(),status:()=>({pending:pending(),lastDay:R.read('raids.lastDay',null)})};
})();
