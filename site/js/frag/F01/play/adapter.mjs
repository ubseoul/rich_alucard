// F01 THE PLAY — the F04 WAR ROOM adapter (OL-023 lineage). One seam, one versioned contract (js/frag/F01/play_contract.js).
//   prepareWorld(req, saved)  F04 request  -> the PLAY's world (F04 is authoritative for crew status / bonds / bank / HEAT / owned cars;
//                             F01 keeps only what is F01's own: nerve baselines, scars, nicknames, line memory, lost guns, feel state)
//   pitchFor(w, req)          the ONE job the War Room chose -> the same pitch object the phone offer already renders
//   buildResult(...)          the finished PLAY -> the canonical 'F01.play_result' record
// No simulation lives here: the engine (engine.mjs) runs the PLAY, world.mjs applies it. This file only translates at the boundary.
// Cash crosses the wire in DOLLARS; F01 keeps $K internally.
import {D} from './env.mjs';
import * as C from './content.mjs';
import * as W from './world.mjs';
import * as E from './engine.mjs';

export const EMBED_VERSION=3;
const K=1000;
const CT=()=>globalThis.RAPlayContract;
const clone=v=>JSON.parse(JSON.stringify(v));
const title=s=>String(s).toLowerCase().replace(/(^|[\s-])([a-z])/g,(m,a,b)=>a+b.toUpperCase());

function mkGeneric(r){
 const cls=String(r.cls).toUpperCase();const c=D.CLASSES[cls];
 const human=r.human===true;const q=C.QUIRKS[0];
 return {id:r.id,name:String(r.name).toUpperCase(),short:title(r.name),cls,named:false,human,vampire:!human,traits:[q],quirk:q,gun:'pistol',maxhp:c.hp,hp:c.hp,aim:c.aim,nerve:50,base:50,scars:[],nick:null,perks:[],status:'READY',away:0,mvp:0,saved:[],hist:[],plays:0};
}
function applyStatus(o,st){
 if(st==='ACTIVE'){o.status='READY';o.away=0;o.hp=o.maxhp;}
 else if(st==='DOWNED'){o.status='WOUNDED';o.away=1;o.hp=Math.ceil(o.maxhp/2);}
 else if(st==='CAPTURED'){o.status='CAPTURED';}
}

// ---- F04 request -> world. `saved` is the F01-owned embed world from the last completed request (or null).
export function prepareWorld(req,saved){
 let w=saved&&saved.v===EMBED_VERSION?clone(saved):null;
 if(!w){w=W.newWorld(req.seed,{cap:req.rosterCap||8});w.v=EMBED_VERSION;}
 // roster: exactly the crew F04 sent, in F04's order. F01-only state (nerve base, scars, nick, perks, gun) survives by id.
 const have=new Map(w.roster.map(o=>[o.id,o]));const next=[];
 for(const r of req.roster){
  let o=have.get(r.id);
  if(!o){const def=C.NAMED.find(n=>n.id===r.id);o=def?E.mkNamed(def):mkGeneric(r);}
  applyStatus(o,r.status);
  const perks=(r.perks||[]).filter(p=>D.STORIES[p]);
  o.perks=[...new Set([...o.perks.filter(p=>perks.includes(p)||!(p in D.STORIES)),...perks])].slice(0,D.STORY_NUMBERS.maxStories);
  next.push(o);
 }
 w.roster=next;
 // F02 owns the guns; only a lit request supplies this ephemeral snapshot.
 delete w.iron;
 if(req.iron?.schema==='F02.play_weapons/1'){
  w.iron=clone(req.iron);
  const held=new Set(w.roster.map(o=>w.iron.loadout[o.id]||o.gun));
  w.armory=[...new Set([...w.armory,...(w.iron.owned||[]).filter(g=>!held.has(g))])];
  for(const o of w.roster){const gun=w.iron.loadout[o.id];if(gun&&w.iron.weapons[gun])o.gun=gun;}
 }
 // bonds: F04 counts jobs-together per direction; DAY ONES = both directions >= the threshold
 const th=req.dayOneThreshold||3;w.corun={};w.bonds=[];
 for(const a of req.roster)for(const b of req.roster){
  if(a.id>=b.id)continue;
  const c=Math.min((a.bonds&&a.bonds[b.id])||0,(b.bonds&&b.bonds[a.id])||0);
  if(c>0)w.corun[[a.id,b.id].sort().join('+')]=c;
  if(c>=th)w.bonds.push([a.id,b.id]);
 }
 w.cash=req.bank/K;w.heat=req.heat;w.night=req.day;w.cap=req.rosterCap||8;
 // garage: the cars F04 says Rich owns, minus what F01 already lost and Rich has not recovered
 w.garage=w.garage||{owned:[],lost:{},unique:[...C.UNIQUE_CARS]};w.garage.lost=w.garage.lost||{};
 // B1 encounter vehicles are replenished by the encounter provider. They never
 // map to personal ownership or block the next required job after a lost loaner.
 for(const id of req.garage.encounter||[])if(id==='HOOPTIE')delete w.garage.lost[id];
 w.garage.owned=req.garage.owned.filter(id=>C.CARS[id]&&!C.CARS[id].castle&&!w.garage.lost[id]);
 w.cars={};for(const id of w.garage.owned)w.cars[id]=0;
 // captives: only the EXTRACT group the War Room asked for
 const cap=req.job.captive;
 w.captives=cap?[{gid:'x'+req.requestId,ids:[...cap.ids],clock:cap.clock||2,from:'F04'}]:[];
 w.intel=[];w.pending=null;w.lastShape=null;w.lastBoardSpecs=[];w.boardSeen=[];
 W.feelState(w);w.lostGuns=w.lostGuns||[];w.flags=w.flags||{};w.inventory=w.inventory||[];w.morningTexts=w.morningTexts||[];
 return w;
}

// ---- NO CAR REFUSES THE JOB, NEVER THE WAY BACK. The refusal below is correct for the job; but a lost car is got back at home (GET IT BACK = W.recoverCar, the
// authored recovery, unchanged, fee 0), so before a car refusal is final the controller offers that surface first. Same gate for the browser and the headless runner.
const carRefusal=can=>({refuse:{code:can.reason==='NO CAR'?'NO_CAR':'NO_CAR_FITS',reason:can.reason}});
export const isCarRefusal=r=>!!r&&(r.code==='NO_CAR'||r.code==='NO_CAR_FITS');
export const recoverableCars=w=>W.lostCars(w).filter(c=>!(c.route==='DEALER'&&c.unique));
export const needsRecovery=(w,picked)=>!!(picked&&picked.refuse&&isCarRefusal(picked.refuse)&&recoverableCars(w).length);

// ---- the ONE job F04 chose, as the pitch the phone offer renders. {pitch} or {refuse:{code,reason}}
export function pitchFor(w,req){
 const ready=W.readyOnes(w);
 if(!ready.length)return {refuse:{code:'NOBODY_READY',reason:'NOBODY IS READY'}};
 const id=req.job.f01JobId;
 if(id==='extract'){
  const g=w.captives[0];if(!g)return {refuse:{code:'NO_CAPTIVE',reason:'NOBODY TO GET BACK'}};
  const pitch=extractPitch(w,g);const can=W.canRoll(w,pitch.job); // EXTRACT goes through CREW / CAR like every other job: no car -> a refusal, never a crash in carStage
  if(!can.ok)return carRefusal(can);
  return {pitch};
 }
 const job=C.JOBS.find(j=>j.id===id);
 if(!job)return {refuse:{code:'UNKNOWN_JOB',reason:`no such play: ${id}`}};
 const can=W.canRoll(w,job);
 if(!can.ok)return carRefusal(can);
 const pid=job.pitchers.find(p=>ready.some(o=>o.id===p))||(ready.find(o=>o.named&&C.PITCH_LINES[o.id])||ready[0]).id;
 const nameIdx=((req.seed%job.names.length)+job.names.length)%job.names.length;
 return {pitch:{job,pitcher:pid,nameIdx,notice:!!job.defense,big:!!job.bigPlay}};
}
// shared with the standalone loop (feel-ui buildOffers): an EXTRACT card for a captured group
export function extractPitch(w,g){
 const ready=W.readyOnes(w);const job=W.extractJob(w,g);
 const pid=['dre','tunde','half_pint','young_mazi'].find(id=>ready.some(o=>o.id===id))||(ready[0]&&ready[0].id)||'dre';
 const nm=id=>(w.roster.find(o=>o.id===id)||{short:id}).short;
 const names=g.ids.map(nm).join(' and ');
 return {job,pitcher:pid,nameIdx:0,extract:true,g,quote:`${g.clock===1?'This is the last night.':'The clock is running.'} They’re holding ${names}.`,full:`${names}`};
}

// ---- the finished PLAY -> canonical result
const AWAY={WOUNDED:1,SHOT:2};
function digest(o){const s=JSON.stringify(o);let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))>>>0;return h.toString(16);}

export function refusedResult(req,code,reason,errors){
 return {schema:CT().RESULT_SCHEMA,version:CT().VERSION,requestId:req&&req.requestId||'',status:'REFUSED',code,reason:reason||code,errors:errors||[],cash:{gain:0,spent:0}};
}
export function declinedResult(req,{cash0,w}){
 return {schema:CT().RESULT_SCHEMA,version:CT().VERSION,requestId:req.requestId,status:'DECLINED',cash:{gain:0,spent:Math.max(0,Math.round((cash0-w.cash)*K))}};
}
// `before`: {id:status} as F04 sent it. `cash0`: bank ($K) when the session began (before any home-screen purchase).
export function buildResult(req,{rec,w,before,cash0}){
 const gainK=rec.win?W.potBank(rec):0;
 const spent=Math.max(0,Math.round((cash0+gainK-w.cash)*K));// what left Rich's pocket (calls, ROBBED share, anything bought at home); applyResult clamps at 0, so never more than he had
 const sent=new Set(req.roster.map(o=>o.id));
 const crew=rec.crew.map(id=>{const st=rec.finalStatus[id]||'READY';return {id,before:before[id]||'ACTIVE',after:st,away:AWAY[st]||0};});
 const lostCar=rec.lost.cars.find(c=>c.id===rec.car);
 const recruits=w.roster.filter(o=>!sent.has(o.id)).map(o=>({id:o.id,name:o.name,cls:o.cls,human:!!o.human,vampire:!!o.vampire,traits:[...o.traits]}));
 const got=(rec.received&&rec.received.items)||[];
 const res={
  schema:CT().RESULT_SCHEMA,version:CT().VERSION,requestId:req.requestId,status:'COMPLETE',
  job:{f01JobId:req.job.f01JobId,name:rec.jobName,shape:rec.shape,district:req.job.district||null},
  outcome:{win:!!rec.win,klass:rec.klass,final:rec.final,folded:!!rec.folded,bailed:!!rec.bailed,fellBack:!!rec.fellBack,oba:!!rec.oba,getaway:rec.getaway||null,steps:rec.steps},
  crew,
  cash:{gain:Math.round(gainK*K),spent},
  heat:{delta:rec.heatDelta||0},
  car:{id:rec.car&&rec.car!=='CASTLE'?rec.car:null,lost:!!lostCar,route:lostCar?lostCar.route:null,cause:lostCar?lostCar.cause:null,crashed:!!rec.crash},
  guns:{lost:clone(rec.lost.guns),gifts:clone(rec.gunGifts||[])},
  loot:got.map(g=>({cat:g.cat,rar:g.rar,name:g.name,lore:g.lore||null})),
  recruits,
  rescued:[...(rec.rescued||[])],
  captured:[...(rec.captives||[])],
  newBonds:rec.newBond?[[...rec.newBond]]:[],
  storySeeds:((rec.morning&&rec.morning.seeds)||[]).map(s=>({who:s.who,perk:s.perk})),
  nicks:((rec.morning&&rec.morning.nicks)||[]).map(n=>({id:n.id,nick:n.nick})),
  flags:[...(rec.storyFlags||[])],
  seed:rec.seed,
  digest:digest({win:rec.win,final:rec.final,klass:rec.klass,fs:rec.finalStatus,pot:rec.pot,steps:rec.steps})
 };
 if(w.iron)res.iron={loadout:Object.fromEntries(w.roster.map(o=>[o.id,o.gun]))};
 return res;
}
// ---- the PLAY's seed for a request (one formula, shared by the browser controller and the headless runner)
export const seedFor=(req,isExtract)=>req.seed*10+(isExtract?1:2);

// ---- headless runner: the SAME steps the browser controller performs (prepare -> pitch -> engine -> applyResult -> result), driven by a
// synchronous driver(prompt)->answer instead of the presentation. Used by the round-trip tests and any non-browser consumer.
// `saved` is the F01-owned embed world; the returned `world` is what the browser would commit.
export function runHeadless(req,driver,saved=null){
 const v=CT().validateRequest(req);if(!v.ok)return {result:refusedResult(req,'BAD_REQUEST','the request does not match the contract',v.errors),world:saved};
 const w=prepareWorld(req,saved);const before=Object.fromEntries(req.roster.map(o=>[o.id,o.status]));const cash0=w.cash;
 let picked=pitchFor(w,req);
 if(needsRecovery(w,picked)){for(const c of recoverableCars(w))W.recoverCar(w,c.id,{fee:0});picked=pitchFor(w,req);} // the player takes GET IT BACK at home (same call as the home scene), then the job is judged again
 if(picked.refuse)return {result:refusedResult(req,picked.refuse.code,picked.refuse.reason),world:saved};
 const pitch=picked.pitch,isX=!!pitch.extract;
 const cfg={seed:seedFor(req,isX),job:pitch.job,policy:'driver',opts:{},night:w.night,pitcher:pitch.pitcher,nameIdx:pitch.nameIdx,pitchText:null,state:w,intel:false,oba:false};
 const rec=E.runPlay(cfg,driver);
 W.applyResult(w,rec,pitch.job);
 return {result:buildResult(req,{rec,w,before,cash0}),world:w,rec};
}

// F01-owned persistence of the embed world (committed only when a request completes; never mid-PLAY)
export const RESULT_KEEP=8;
