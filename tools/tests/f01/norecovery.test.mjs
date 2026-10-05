// F01 NO-CAR RECOVERY REPAIR: "no car" refuses the JOB, never the way back (GET IT BACK), and EXTRACT with zero cars refuses instead of crashing.
// Headless, the real engine through js/frag/F01/play/adapter.mjs. The browser scene path is proven in play-sim/norecovery_browser.mjs.
// Nothing here prices, grants or invents a car: recovery is W.recoverCar(w,id,{fee:0}) exactly as the home scene calls it.
import assert from 'node:assert/strict';
import path from 'node:path';import {pathToFileURL} from 'node:url';import fs from 'node:fs';import vm from 'node:vm';

export async function test(root){
 const dir=path.join(root,'tools','tests','f01','play-sim');
 const url=f=>pathToFileURL(path.join(root,f)).href;
 await import(pathToFileURL(path.join(dir,'globals.mjs')).href);
 if(!globalThis.RAPlayContract)vm.runInThisContext(fs.readFileSync(path.join(root,'js/frag/F01/play_contract.js'),'utf8'));
 const {makeDriver}=await import(pathToFileURL(path.join(dir,'driver.mjs')).href);
 const AD=await import(url('js/frag/F01/play/adapter.mjs'));const W=await import(url('js/frag/F01/play/world.mjs'));
 const IDS=['tunde','dre','half_pint','sunday_best','young_mazi','auntie_grit'],CLS={tunde:'MUSCLE',dre:'TALKER',half_pint:'GHOST',sunday_best:'SHOOTER',young_mazi:'WHEELS',auntie_grit:'DOC'};
 const J=v=>JSON.parse(JSON.stringify(v));
 const mk=(o={})=>({schema:'F04.play_request',version:1,requestId:'nr#'+(o.n||1),seed:o.seed||4242,day:o.day||17,job:{f01JobId:'car_wash_stickup',f04Type:'TAKE_THE_BLOCK',district:'koreatown',...(o.job||{})},
  roster:IDS.map(id=>({id,name:id.toUpperCase().replace(/_/g,' '),cls:CLS[id],status:'ACTIVE',bonds:{},perks:[],...((o.crew||{})[id]||{})})),garage:{owned:['SUPRA','URUS']},bank:50000,heat:12,rosterCap:8,...(o.top||{})});
 const check=(c,m)=>assert(c,'NO-CAR RECOVERY VIOLATION: '+m);
 const OWNED=['SUPRA','URUS']; // F04's garage: F04 never mutates vehicle ownership, it keeps sending these; F01 owns what is lost

 // ---- 1 LOSE ALL USABLE CARS: the real engine path (a PLAY ends with the car gone), both cars, through two committed results
 let saved=null;let lostBoth=false;
 for(let s=1;s<=400&&!lostBoth;s++){
  const out=AD.runHeadless(mk({n:s,seed:700+s*13,day:1+s%30,job:{f01JobId:'car_wash_stickup'}}),makeDriver(['careful','naive','greedy','random'][s%4]),saved);
  if(out.result.status==='COMPLETE')saved=out.world;
  lostBoth=!!saved&&OWNED.every(id=>saved.garage.lost[id]);
 }
 if(!lostBoth){ // the engine path did not lose both in the bounded search: reproduce the same committed shape by hand (route/cause as the engine writes them)
  saved=AD.prepareWorld(mk(),null);saved.garage.lost={SUPRA:{route:'DEALER',cause:'CRASH'},URUS:{route:'IMPOUND',cause:'WASH'}};saved.garage.owned=[];saved.cars={};
 }
 check(OWNED.every(id=>saved.garage.lost[id]),'both cars are lost in the committed F01 world');
 const req=(n,job)=>mk({n,seed:9000+n,day:40,job:job||{}});
 const before=J(saved);

 // ---- 2 the carless job is REFUSED (a job that needs a car still refuses), and the refusal itself is the gate the controller reads
 {const w=AD.prepareWorld(req(1),J(saved));const p=AD.pitchFor(w,req(1));
  check(p.refuse&&p.refuse.code==='NO_CAR','a carless world refuses the job with NO_CAR');
  check(AD.needsRecovery(w,p)===true,'...and the way back is reachable (a recoverable lost car exists)');
  check(w.garage.owned.length===0&&Object.keys(w.garage.lost).length===2,'prepareWorld itself grants nothing');
  const inert=AD.prepareWorld(req(1),null);check(AD.needsRecovery(inert,AD.pitchFor(inert,req(1)))===false,'a carless world with NOTHING lost (never owned a car) has no recovery to offer: plain refusal, unchanged');}

 // ---- 3 the existing recovery is reachable and unchanged: same call as the home scene, fee 0, routes preserved
 {const w=AD.prepareWorld(req(2),J(saved));const cash0=w.cash;
  const list=AD.recoverableCars(w);check(list.map(c=>c.id).sort().join()==='SUPRA,URUS','both lost cars are recoverable');
  const r1=W.recoverCar(w,'SUPRA',{fee:0});check(r1.ok&&r1.fee===0,'SUPRA recovered through the authored call, fee 0');
  check(w.cash===cash0,'recovery moves no money (no invented price)');
  // ---- 6 repeated interaction cannot duplicate cars / money / state
  const r2=W.recoverCar(w,'SUPRA',{fee:0});check(!r2.ok&&r2.reason==='not lost','a second GET IT BACK on the same car is refused');
  check(w.garage.owned.filter(x=>x==='SUPRA').length===1&&w.cash===cash0&&!w.garage.lost.SUPRA&&w.garage.lost.URUS,'one SUPRA, same cash, URUS still lost');
  // ---- 4 a recovered car restores valid job access
  const p=AD.pitchFor(w,req(2));check(!p.refuse&&p.pitch&&p.pitch.job,'with one car back the job pitches again');}

 // ---- 4/5 the full loop through runHeadless: carless -> recovery -> PLAY; then persisted world; then a carless RELOAD keeps the same recovery state
 {const a=AD.runHeadless(req(3),makeDriver('careful'),J(saved));
  check(a.result.status==='COMPLETE','a carless War Room job completes once the lost cars are got back ('+a.result.status+' '+(a.result.code||'')+')');
  const w=a.world;const carsNow=[...w.garage.owned,...Object.keys(w.garage.lost)];
  check(new Set(carsNow).size===carsNow.length,'no car is both owned and lost, none duplicated');
  check(carsNow.filter(x=>OWNED.includes(x)).sort().join()==='SUPRA,URUS','still exactly the two cars Rich had (none created)');
  check(a.result.cash.gain>=0&&a.result.cash.spent>=0&&a.result.cash.spent<=req(3).bank+a.result.cash.gain,'money stays sane');
  // reload: the same saved world, prepared twice, answers identically (deterministic, no hidden consumed state)
  const r1=AD.runHeadless(req(4),makeDriver('careful'),J(saved)),r2=AD.runHeadless(req(4),makeDriver('careful'),J(saved));
  check(JSON.stringify(r1.result)===JSON.stringify(r2.result)&&JSON.stringify(r1.world)===JSON.stringify(r2.world),'reload while carless: same saved world -> identical recovery and result');
  check(JSON.stringify(saved)===JSON.stringify(before),'the committed world passed in is never mutated by a recovery');
  // a replayed recovery pass over an already-recovered world duplicates nothing
  const again=AD.prepareWorld(req(5),J(a.world));check(again.garage.owned.length===new Set(again.garage.owned).size,'prepareWorld after recovery holds no duplicate cars');}

 // ---- 7/8 EXTRACT with ZERO cars: no crash; captive state is preserved
 {const extractReq=n=>mk({n,seed:5000+n,day:30,job:{f01JobId:'extract',captive:{ids:['half_pint'],clock:2}},crew:{half_pint:{status:'CAPTURED'}},top:{garage:{owned:[]}}});
  const reqX=extractReq(1);
  // (a) nothing was ever lost and no car is owned: refuse, never throw
  let out;try{out=AD.runHeadless(reqX,makeDriver('careful'),null);}catch(e){check(false,'EXTRACT with zero cars threw: '+e.message);}
  check(out.result.status==='REFUSED'&&out.result.code==='NO_CAR','EXTRACT with zero cars and nothing to recover REFUSES (NO_CAR), it does not crash');
  check(out.world===null,'a refusal commits no F01 world');
  const w=AD.prepareWorld(reqX,null);check(w.captives.length===1&&w.captives[0].ids[0]==='half_pint'&&w.captives[0].clock===2,'the captive group and its clock are exactly as F04 sent them');
  // (b) cars lost: the same gate recovers first, then the EXTRACT runs ONCE and rescues
  const ex2=AD.runHeadless(extractReq(2),makeDriver('careful'),J(saved));
  check(ex2.result.status==='COMPLETE','EXTRACT after the lost cars are got back completes ('+ex2.result.status+' '+(ex2.result.code||'')+')');
  check(ex2.result.rescued.every(id=>id==='half_pint')&&ex2.result.captured.every(id=>id!=='half_pint'),'the captive is rescued only by a real EXTRACT, or left with F04 (who owns the clock); F01 never consumes it');
  check(ex2.result.rescued.every(id=>id==='half_pint')&&!ex2.result.crew.some(c=>c.id==='half_pint'&&c.after==='GONE'),'nobody becomes GONE from the extraction');
  const ex3=AD.runHeadless(extractReq(2),makeDriver('careful'),J(saved));
  check(JSON.stringify(ex3.result)===JSON.stringify(ex2.result),'the same EXTRACT request replays to the identical single result (exactly-once inputs)');
  // the authored captive rules still hold for a world whose only car cannot seat the crew
  const tiny=AD.runHeadless(mk({n:9,seed:5009,day:30,job:{f01JobId:'extract',captive:{ids:['half_pint'],clock:1}},crew:{half_pint:{status:'CAPTURED'}},top:{garage:{owned:['S2000']}}}),makeDriver('careful'),null);
  check(tiny.result.status==='COMPLETE'||tiny.result.code==='NO_CAR_FITS','EXTRACT with a car that seats the crew runs; one that cannot refuses NO_CAR_FITS — no crash ('+tiny.result.status+')');}

 // ---- the guard is an EXTRACT refusal only when F01 genuinely has no car: with a car, EXTRACT is byte-for-byte what it was
 {const r=AD.runHeadless(mk({n:11,seed:5011,day:30,job:{f01JobId:'extract',captive:{ids:['half_pint'],clock:2}},crew:{half_pint:{status:'CAPTURED'}}}),makeDriver('careful'),null);
  check(r.result.status==='COMPLETE','EXTRACT with cars is unchanged');}
 console.log('PASS F01 no-car recovery (carless job refuses but GET IT BACK stays reachable; recovery is the authored fee-0 call, unchanged; recovered car restores the job; reload / repeat interaction duplicate nothing; EXTRACT with zero cars refuses without a crash and keeps the captive)');
}
