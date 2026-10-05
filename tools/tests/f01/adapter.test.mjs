// F01 THE PLAY x WAR ROOM adapter (OL-023): the versioned request/result contract, F04-authoritative world sync, the canonical result record.
// Deterministic and headless: the real engine through js/frag/F01/play/adapter.mjs. Presentation is proven in a real browser (browser-embed.mjs).
import assert from 'node:assert/strict';
import path from 'node:path';import {pathToFileURL} from 'node:url';import fs from 'node:fs';import vm from 'node:vm';

export async function test(root){
 const dir=path.join(root,'tools','tests','f01','play-sim');
 const url=f=>pathToFileURL(path.join(root,f)).href;
 await import(pathToFileURL(path.join(dir,'globals.mjs')).href);
 if(!globalThis.RAPlayContract)vm.runInThisContext(fs.readFileSync(path.join(root,'js/frag/F01/play_contract.js'),'utf8'));
 const {makeDriver}=await import(pathToFileURL(path.join(dir,'driver.mjs')).href);
 const AD=await import(url('js/frag/F01/play/adapter.mjs'));const C=await import(url('js/frag/F01/play/content.mjs'));const CT=globalThis.RAPlayContract;
 const IDS=['tunde','dre','half_pint','sunday_best','young_mazi','auntie_grit'],CLS={tunde:'MUSCLE',dre:'TALKER',half_pint:'GHOST',sunday_best:'SHOOTER',young_mazi:'WHEELS',auntie_grit:'DOC'};
 const J=v=>JSON.parse(JSON.stringify(v));
 const mk=(o={})=>({schema:'F04.play_request',version:1,requestId:'t#'+(o.n||1),seed:o.seed||4242,day:o.day||17,job:{f01JobId:'car_wash_stickup',f04Type:'TAKE_THE_BLOCK',district:'koreatown',...(o.job||{})},
  roster:IDS.map(id=>({id,name:id.toUpperCase().replace(/_/g,' '),cls:CLS[id],status:'ACTIVE',bonds:{},perks:[],...((o.crew||{})[id]||{})})),garage:{owned:['SUPRA','URUS']},bank:50000,heat:12,rosterCap:8,...(o.top||{})});
 let bad=0;const check=(c,m)=>{if(!c){bad++;console.error('ADAPTER VIOLATION: '+m);}assert(c,m);};

 // ---- 1 CONTRACT: versioned, strict on both sides
 {check(CT.VERSION===1&&CT.REQUEST_SCHEMA==='F04.play_request'&&CT.RESULT_SCHEMA==='F01.play_result','the contract names and version are fixed');
  check(CT.validateRequest(mk()).ok,'a well-formed request validates');
  for(const [why,mut] of [['wrong schema',r=>{r.schema='x';}],['wrong version',r=>{r.version=2;}],['no requestId',r=>{delete r.requestId;}],['no roster',r=>{r.roster=[];}],['bad status',r=>{r.roster[0].status='READY';}],['no garage',r=>{delete r.garage;}],['negative bank',r=>{r.bank=-1;}],['extract without a captive',r=>{r.job.f01JobId='extract';}]]){
   const r=mk();mut(r);check(!CT.validateRequest(r).ok,'rejects: '+why);}
  const ok=AD.runHeadless(mk(),makeDriver('careful'));check(CT.validateResult(ok.result).ok,'a real result validates');
  for(const [why,mut] of [['wrong schema',r=>{r.schema='x';}],['no outcome',r=>{delete r.outcome;}],['bad crew status',r=>{r.crew[0].after='ACTIVE';}],['no cash',r=>{delete r.cash;}],['no requestId',r=>{r.requestId='';}]]){
   const r=J(ok.result);mut(r);check(!CT.validateResult(r).ok,'result rejects: '+why);}
  const badReq=AD.runHeadless({schema:'F04.play_request'},makeDriver('careful'));check(badReq.result.status==='REFUSED'&&badReq.result.code==='BAD_REQUEST','a bad request is refused, never simulated');}

 // ---- 2 F04 IS AUTHORITATIVE for crew / bank / heat / cars / bonds; F01 keeps only its own
 {const w=AD.prepareWorld(mk({crew:{dre:{status:'DOWNED'},half_pint:{status:'CAPTURED'},tunde:{bonds:{dre:3},perks:['survived_car_wash']},},top:{garage:{owned:['SUPRA','URUS','AVENTADOR','HOOPTIE']},bank:37500,heat:44}}),null);
  check(w.roster.length===6&&w.roster.every(o=>IDS.includes(o.id)),'the roster is exactly the crew F04 sent (no free generics)');
  check(w.roster.find(o=>o.id==='dre').status==='WOUNDED'&&w.roster.find(o=>o.id==='half_pint').status==='CAPTURED','F04 DOWNED / CAPTURED override F01 state');
  check(w.cash===37.5&&w.heat===44,'bank ($ -> $K) and HEAT come from F04');
  check(w.garage.owned.join()==='SUPRA,URUS,HOOPTIE','cars F01 has no stats for are not offered; F04 ownership rules');
  check(JSON.stringify(w.bonds)==='[]'&&w.corun['dre+tunde']===undefined,'a one-sided bond count is not DAY ONES');
  const w2=AD.prepareWorld(mk({crew:{tunde:{bonds:{dre:3}},dre:{bonds:{tunde:4}}}}),null);check(w2.bonds.some(b=>b.includes('tunde')&&b.includes('dre'))&&w2.corun['dre+tunde']===3,'DAY ONES = both directions at the threshold');
  const w3=AD.prepareWorld(mk({top:{rosterCap:6}}),null);check(w3.cap===6,'the roster cap is the strategic layer\'s');
  const req=mk();req.roster.push({id:'cousin1',name:'Cousin One',cls:'GHOST',status:'ACTIVE',bonds:{},perks:[]});
  const w4=AD.prepareWorld(req,null);check(w4.roster.some(o=>o.id==='cousin1'&&!o.named&&o.cls==='GHOST'),'an F04 recruit becomes an F01 generic Oga of the same class');
  check(AD.prepareWorld(mk({job:{f01JobId:'extract',captive:{ids:['half_pint'],clock:2}},crew:{half_pint:{status:'CAPTURED'}}}),null).captives[0].ids[0]==='half_pint','an EXTRACT request carries its captive group');}

 // ---- 3 REFUSALS: nothing invented (no loaner car, no phantom job, nobody ready)
 {const noCar=AD.runHeadless(mk({top:{garage:{owned:[]}}}),makeDriver('careful'));check(noCar.result.status==='REFUSED'&&noCar.result.code==='NO_CAR','no car -> refused (no loaner)');
  const tiny=AD.runHeadless(mk({top:{garage:{owned:['S2000']}}}),makeDriver('careful'));check(tiny.result.status==='REFUSED'&&tiny.result.code==='NO_CAR_FITS','a car that cannot seat the job -> refused');
  const unk=AD.runHeadless(mk({job:{f01JobId:'nope'}}),makeDriver('careful'));check(unk.result.code==='UNKNOWN_JOB','unknown job refused');
  const nobody=AD.runHeadless(mk({crew:Object.fromEntries(IDS.map(i=>[i,{status:'DOWNED'}]))}),makeDriver('careful'));check(nobody.result.code==='NOBODY_READY','nobody ready -> refused');
  const hold=AD.runHeadless(mk({job:{f01JobId:'hold_the_house'},top:{garage:{owned:[]}}}),makeDriver('careful'));check(hold.result.status==='COMPLETE','HOLD THE HOUSE is played from the castle: no car needed');}

 // ---- 4 THE RESULT is the canonical record: invariants over 300 real PLAYs across every job and policy
 {const jobs=C.JOBS.map(j=>j.id);let n=0,complete=0;const seen={win:0,lose:0,wounded:0,captured:0,carLost:0,recruit:0};
  for(let s=1;s<=300;s++){
   const jid=jobs[s%jobs.length];const pol=['careful','naive','greedy','random'][s%4];
   const req=mk({n:s,seed:1000+s*7,day:1+s%30,job:{f01JobId:jid},top:{bank:(s%5)*9000,garage:{owned:s%3?['SUPRA','URUS']:['URUS','SUPRA','HOOPTIE']}}});
   let out;try{out=AD.runHeadless(req,makeDriver(pol));}catch(e){check(false,`PLAY ${jid}/${pol}/${s} threw ${e.message}`);continue;}
   n++;const r=out.result;check(CT.validateResult(r).ok,`result validates (${jid}/${pol}/${s}): ${CT.validateResult(r).errors}`);
   if(r.status!=='COMPLETE')continue;complete++;
   const sent=new Set(req.roster.map(o=>o.id));
   check(r.crew.every(c=>sent.has(c.id)),'only crew F04 sent can appear in the result');
   check(r.cash.gain>=0&&r.cash.spent>=0&&r.cash.spent<=req.bank+r.cash.gain,`spent never exceeds bank+gain (${r.cash.spent} <= ${req.bank}+${r.cash.gain})`);
   check(req.bank+r.cash.gain-r.cash.spent>=0,'banked money can never go negative');
   check(r.outcome.win||r.cash.gain===0,'a lost PLAY banks nothing');
   check(r.recruits.every(x=>!sent.has(x.id)&&x.cls),'recruits are new ids with a class');
   check(r.crew.every(c=>c.after!=='DEAD'||!IDS.includes(c.id)),'a named Oga is never DEAD');
   check(!r.crew.some(c=>['GONE'].includes(c.after)&&!C.JOBS.find(j=>j.id===jid).bigPlay),'GONE only on a BIG PLAY');
   check(r.car.id===null||req.garage.owned.includes(r.car.id),'the car that drove is one Rich owns');
   check(!JSON.stringify(r).includes('undefined'),'no undefined leaks');
   if(r.outcome.win)seen.win++;else seen.lose++;if(r.crew.some(c=>c.after==='WOUNDED'||c.after==='SHOT'))seen.wounded++;if(r.crew.some(c=>c.after==='CAPTURED'))seen.captured++;if(r.car.lost)seen.carLost++;if(r.recruits.length)seen.recruit++;
  }
  check(n===300&&complete>200,`most requests complete (${complete}/300)`);check(seen.win>30&&seen.lose>10&&seen.wounded>10,`the record covers wins, losses and injuries ${JSON.stringify(seen)}`);}

 // ---- 5 DETERMINISM: the same request replays to the same record
 {const a=AD.runHeadless(mk({n:9,seed:777}),makeDriver('careful')).result,b=AD.runHeadless(mk({n:9,seed:777}),makeDriver('careful')).result;
  check(JSON.stringify(a)===JSON.stringify(b),'same request + same answers = same result');
  const c=AD.runHeadless(mk({n:9,seed:778}),makeDriver('careful')).result;check(a.digest!==c.digest||JSON.stringify(a)!==JSON.stringify(c),'a different seed is a different PLAY');}

 // ---- 6 CONTINUITY: F01-only state survives requests; F04 status does not get overridden by F01's memory
 {let saved=null;const r1=AD.runHeadless(mk({n:1,seed:31,job:{f01JobId:'quiet_lift'}}),makeDriver('careful'),saved);saved=r1.world;
  const nerveBase=saved.roster.map(o=>[o.id,o.base]);const r2=AD.runHeadless(mk({n:2,seed:32,job:{f01JobId:'quiet_lift'},crew:{tunde:{status:'DOWNED'}}}),makeDriver('careful'),saved);
  const w2=AD.prepareWorld(mk({n:3,crew:{tunde:{status:'DOWNED'}}}),saved);
  check(w2.roster.find(o=>o.id==='tunde').status==='WOUNDED','F04 says DOWNED: F01 does not resurrect from memory');
  check(nerveBase.every(([id,b])=>w2.roster.find(o=>o.id===id).base===b),'F01-owned nerve baselines carry across requests');
  check(!(r2.result.crew||[]).some(c=>c.id==='tunde'),'a DOWNED Oga is not sent out');
  check(w2.cash===50&&w2.heat===12,'bank / heat are re-read from F04 every time (F01 keeps no shadow copy)');}

 // ---- 7 PAGE: embed mode exists and the standalone loop is untouched
 {const ui=fs.readFileSync(path.join(root,'assets/f01/play/feel-ui.mjs'),'utf8');
  check(/runEmbedded/.test(ui)&&/F04\.play_request/.test(ui)&&/F01\.play_result/.test(ui)&&/get\('embed'\)==='1'/.test(ui),'embed controller present');
  check(!/localStorage\.setItem\('rich_alucard/.test(ui),'the PLAY page never writes the game save');
  const idx=fs.readFileSync(path.join(root,'assets/f01/play/index.html'),'utf8');check(idx.includes('play_contract.js'),'the PLAY page loads the contract');}

 console.log(`PASS F01 x WAR ROOM adapter (versioned contract both ways, F04-authoritative world sync, refusals invent nothing, ${300} real PLAYs: cash/crew/car/recruit invariants, determinism, continuity, embed page wired)`);
 assert.equal(bad,0);
}
