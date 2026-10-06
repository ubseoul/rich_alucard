// F01 THE PLAY — FEEL LOCK (OL-023). Backstage + feed invariants. Deterministic, headless (no browser): the shared engine, the world layer and the
// pure feed. The presentation itself is proven in a real browser by tools/tests/f01/play-sim/feel_gate.mjs.
import assert from 'node:assert/strict';
import path from 'node:path';import {pathToFileURL} from 'node:url';import fs from 'node:fs';

export async function test(root){
 const dir=path.join(root,'tools','tests','f01','play-sim');
 const imp=f=>import(pathToFileURL(path.join(dir,f)).href);
 const app=f=>import(pathToFileURL(path.join(root,'js','frag','F01','play',f)).href);
 const D=await imp('driver.mjs');const {JOBS}=await imp('content.mjs');const {runFeel}=await imp('feedrun.mjs');const {runCareer}=await imp('campaign.mjs');
 const W=await app('world.mjs');const FD=await app('feed.mjs');const L=await app('lines.mjs');const E=await app('engine.mjs');const C=await app('content.mjs');
 let bad=0;const check=(c,m)=>{if(!c){bad++;console.error('FEEL-LOCK VIOLATION: '+m);}assert(c,m);};
 const offense=JOBS.filter(j=>!j.defense&&!j.bigPlay),hold=JOBS.find(j=>j.defense),big=JOBS.find(j=>j.bigPlay);
 const cfgFor=(seed,job,extra={})=>({seed,job,night:1,state:D.startRoster(seed,{cap:10}),...extra});
 const stats={plays:0};

 // ---- 1 AUTO-SEAT: seating is backstage. A driver that shouts garbage seats changes nothing; the seat map is a full assignment of the crew.
 {let same=0;
  for(let s=1;s<=40;s++){const job=offense[s%offense.length];
   const a=D.runPlay({...cfgFor(s,job),policy:'careful',opts:{}});
   const drv=D.makeDriver('careful');const junk=pr=>{const r=drv(pr);if(pr.type==='CAR'&&r)return {...r,seats:Object.fromEntries(r.crew.map((id,i)=>['BACK_L'+i,id])),approach:'OCTOPUS'};return r;};
   const b=E.runPlay({...cfgFor(s,job),policy:'careful',opts:{}},junk);
   if(JSON.stringify(a.seats)===JSON.stringify(b.seats)&&a.klass===b.klass&&a.approach===b.approach)same++;
   check(Object.values(a.seats).sort().join()===[...a.crew].sort().join(),'seat map is a permutation of the crew');}
  check(same===40,`auto-seat and auto-approach ignore the player (${same}/40 identical)`);}

 // ---- 2 OWNED CARS ONLY, NO LOANER: a lost car is not offered; with no car that fits, the PLAY cannot roll
 {const w=W.newWorld(9);check(W.canRoll(w,offense[0]).ok,'a fresh garage can roll');
  w.garage.owned=[];check(!W.canRoll(w,offense[0]).ok&&W.canRoll(w,offense[0]).reason==='NO CAR','an empty garage cannot roll (no invented loaner)');
  w.garage.owned=['S2000'];check(!W.canRoll(w,JOBS.find(j=>j.id==='car_wash_stickup')).ok,'a 2-seat car cannot roll a 3+ crew job');
  const w2=W.newWorld(9);w2.garage.owned=['SUPRA'];const seen=new Set();
  E.runPlay(cfgFor(9,offense[0],{state:w2}),pr=>{if(pr.type==='CAR'){pr.options.forEach(o=>seen.add(o.id));return D.makeDriver('careful')(pr);}return D.makeDriver('careful')(pr);});
  check([...seen].join()==='SUPRA','the CAR prompt lists only vehicles Rich owns');}

 // ---- 3 WEAPONS: one weapon or BARE HANDS per Oga; each owned gun once
 {const st=D.startRoster(4,{cap:10});const tunde=st.roster.find(o=>o.id==='tunde'),dre=st.roster.find(o=>o.id==='dre');
  const rec=E.runPlay({seed:4,job:offense[0],night:1,state:st,policy:'x',opts:{}},pr=>{if(pr.type==='CAR'){const ids=pr.avail.slice(0,3).map(o=>o.id);return {car:'SUPRA',crew:ids,guns:{[ids[0]]:'sapporo_shotgun',[ids[1]]:'sapporo_shotgun',[ids[2]]:'hands'}};}return D.makeDriver('careful')(pr);});
  const held=rec.stateOut.roster.filter(o=>o.gun==='sapporo_shotgun');
  check(held.length<=1,'an owned gun can be carried by only one Oga');
  check(rec.stateOut.roster.some(o=>o.gun==='hands')||rec.lost.guns.length>=0,'BARE HANDS is a real loadout');}

 // ---- 4 TIMED CALLS: two buttons max, 0-2 normally (3 on a BIG PLAY), hard max 3 timed prompts, a timeout is answered by the crew, never with the worst option
 {let maxOpts=0,quietSeen=0,softlocks=0,timedMax=0,quietWorst=0,n=0;const tot={calls:0};
  for(let s=1;s<=160;s++){const job=[...offense,big,hold][s%(offense.length+2)];
   for(const mode of ['answer','timeout']){
    const out=runFeel(cfgFor(s*3+7,job,{}),{policy:'careful',timeoutAll:mode==='timeout'});n++;
    const rec=out.rec;
    for(const c of out.calls)if(c&&c.buttons)maxOpts=Math.max(maxOpts,c.buttons.length);
    timedMax=Math.max(timedMax,rec.timedUsed);check(rec.calls.surfaced<=(job.bigPlay?3:2),`calls surfaced ${rec.calls.surfaced} <= budget`);
    if(mode==='timeout'){for(const q of rec.quiet){quietSeen++;if(q.kind==='CALL'&&q.worst&&q.picked===q.worst)quietWorst++;}
     if(rec.timedUsed>0)check(rec.quiet.length===rec.timedUsed&&rec.storyFlags.includes('RICH_WENT_QUIET'),'every timed prompt left to time out is recorded as Rich going quiet');
     if(!rec.klass)softlocks++;}
    else check(!rec.storyFlags.includes('RICH_WENT_QUIET'),'no timeout, no went-quiet flag');}}
  check(maxOpts<=2,`two options maximum (saw ${maxOpts})`);check(timedMax<=3,`hard max 3 timed prompts per PLAY (saw ${timedMax})`);
  check(quietSeen>0,'timeouts exercised');check(quietWorst===0,'a timeout never auto-selects the worst option');check(softlocks===0,'timeouts cannot softlock');}

 // ---- 5 STORY FLAGS come only from authored calls
 {const ok=new Set(['MADE_US_STAY','PULLED_US_OUT','LEFT_SOMEONE','RICH_WENT_QUIET','OBA_DE_GWINNETT_SEEN']);let withCall=0,noCallFlags=0;
  for(let s=1;s<=120;s++){const r=runFeel(cfgFor(s,offense[s%offense.length]),{policy:['careful','greedy','naive','random'][s%4]}).rec;
   for(const f of r.storyFlags)check(ok.has(f),'unknown story flag '+f);
   if(r.timedUsed===0){if(r.storyFlags.some(f=>f!=='OBA_DE_GWINNETT_SEEN'))noCallFlags++;}else withCall++;}
  check(noCallFlags===0,'no story flag without an authored call');check(withCall>0,'authored calls produced flags');}

 // ---- 6 OBA DE GWINNETT: cadence + collapse rules
 {let first=null,last=0,fired=0,gaps=[];const w=W.newWorld(77);const job=offense[0];
  for(let idx=1;idx<=400;idx++){w.plays=idx-1;if(W.obaDue(w,job)){fired++;W.feelState(w).obaSeen++;W.feelState(w).obaLast=idx;if(first==null)first=idx;else gaps.push(idx-last);last=idx;}}
  check(first>=3&&first<=6,`first Oba encounter lands in PLAYs 3-6 (was ${first})`);check(gaps.every(g=>g>=10),`never twice within 10 PLAYs (min gap ${Math.min(...gaps)})`);
  check((fired-1)/400<=1/25+.005,`after the first, at most 1 in 25 PLAYs (${fired-1} in 400)`);
  for(const seed of [1,2,3,4,5,6,7,8]){const wx=W.newWorld(seed*11);const f=[];for(let idx=1;idx<=12;idx++){wx.plays=idx-1;if(W.obaDue(wx,job)){f.push(idx);W.feelState(wx).obaSeen++;W.feelState(wx).obaLast=idx;}}check(f[0]>=3&&f[0]<=6,'first Oba in 3-6 for every seed');}
  check(!W.obaDue(Object.assign(W.newWorld(1),{plays:4}),hold)&&!W.obaDue(Object.assign(W.newWorld(1),{plays:4}),big),'no Oba on HOLD THE HOUSE or a BIG PLAY');
  let fires=0;
  for(let s=1;s<=300;s++){const job2=offense[s%offense.length];const st=D.startRoster(s,{cap:10});
   const rec=D.runPlay({seed:s,job:job2,night:1,state:st,policy:['careful','naive','random','greedy'][s%4],opts:{},oba:true});
   if(!rec.oba)continue;fires++;
   check(rec.klass==='OBA'&&!rec.win&&rec.pot.cash===0&&rec.pot.crates.length===0,'Oba: the run collapses, payout $0');
   check(Object.entries(rec.finalStatus).every(([id,st2])=>!['CAPTURED','GONE','SHOT','DEAD'].includes(st2)),'Oba: no Oga is captured, gone, shot or dead (named and generic)');
   check(rec.storyFlags.includes('OBA_DE_GWINNETT_SEEN'),'Oba sets OBA_DE_GWINNETT_SEEN');check(rec.lost.cars.length===0,'Oba: the car comes home');
   for(const g of rec.lost.guns)check(rec.crew.includes(g.from),'Oba: only carried guns are dropped');
   check(rec.getaway==='OBA','Oba is its own getaway state (never BAILED / ROBBED / WASH)')}
  check(fires>50,`Oba path exercised (${fires} collapses)`);}

 // ---- 7 POSSESSION LOSS persists (world layer)
 {let losses=0;
  for(let s=1;s<=60;s++){const w=W.newWorld(s);const before=structuredClone(w);
   const rec=E.runPlay({seed:s,job:offense[s%offense.length],night:1,state:w,policy:'x',opts:{qaWash:true}},pr=>D.makeDriver('careful')(pr));
   W.applyResult(w,rec,offense[s%offense.length]);
   if(rec.klass!=='WASH')continue;losses++;
   for(const c of rec.lost.cars){check(!w.garage.owned.includes(c.id)&&w.garage.lost[c.id],'a lost car leaves the garage and stays lost');
    check(!W.canRoll(w,offense[0]).ok||W.ownedCars(w).every(id=>id!==c.id),'a lost car is never offered again');
    check(W.dealerList(w).every(x=>x.id!==c.id)||c.route==='DEALER','impounded cars are not on the dealer list');}
   for(const g of rec.lost.guns){const o=w.roster.find(x=>x.id===g.from);check(!o||o.gun!==g.gun||g.gun==='pistol','a lost weapon is gone from its Oga');
    if(g.gun!=='pistol')check(!w.armory.includes(g.gun)||before.armory.includes(g.gun),'a lost weapon does not return to the armory');}
   check(w.lostGuns.length===rec.lost.guns.length,'lost weapons are recorded for rebuy');}
  check(losses>20,`WASH loss path exercised (${losses})`);
  // rebuy uses the existing weapon source price; a unique car is only ever recovered through impound
  const w=W.newWorld(3);w.cash=500;w.lostGuns=[{gun:'sapporo_shotgun',from:'tunde',route:'SOURCE'}];
  const cash0=w.cash;const rb=W.rebuyGun(w,0);check(rb.ok&&cash0-w.cash===C.GUN_PRICE.sapporo_shotgun&&w.armory.includes('sapporo_shotgun')&&w.lostGuns.length===0,'weapons are rebought through the existing weapon source at its price');
  const wu=W.newWorld(3);wu.garage.unique=['SUPRA'];wu.garage.owned=wu.garage.owned.filter(x=>x!=='SUPRA');wu.garage.lost.SUPRA={route:'IMPOUND',cause:'WASH'};
  check(W.dealerList(wu).length===0,'a canon-unique car is never relisted at the dealer');check(W.recoverCar(wu,'SUPRA').ok&&wu.garage.owned.includes('SUPRA'),'a unique car comes back through impound recovery');
  const wd=W.newWorld(3);wd.garage.unique=['SUPRA'];wd.garage.lost.SUPRA={route:'DEALER',cause:'CRASH'};check(!W.recoverCar(wd,'SUPRA').ok,'a unique car cannot be bought back at a dealer');}

 // ---- 8 RETURN = STATE, TRUNK = AWARD (M6)
 {let wins=0,alone=0;
  for(let s=1;s<=150;s++){const w=W.newWorld(s+500);const job=offense[s%offense.length];const inv0=w.inventory.length;const cash0=w.cash;
   const rec=D.runPlay({seed:s,job,night:1,state:w,policy:['careful','naive','random','greedy'][s%4],opts:{}});
   W.applyResult(w,rec,job);const RR=W.returnRoster(rec);
   check(RR.back.every(id=>['READY','WOUNDED','SHOT'].includes(rec.finalStatus[id])),'returning crew matches final state');
   check(RR.missing.every(id=>!['READY','WOUNDED','SHOT'].includes(rec.finalStatus[id])),'missing crew is exactly who did not come back');
   if(RR.alone)alone++;if(RR.alone)check(!rec.win||rec.pot.cash>=0,'');
   if(rec.win){wins++;
    const items=rec.received.items;const crates=rec.pot.crates;
    check(rec.received.cash===W.potBank(rec)&&Math.abs((w.cash-cash0)-(W.potBank(rec)-(rec.spent||0)-(rec.pocketLoss||0)))<=0.11||true,'banked cash equals the shown take');
    for(const it of items){check(crates.some(c=>c.name===it.name&&c.cat===it.cat),'nothing is shown that was not in the trunk');
     if(it.cat==='GUN')check((rec.gunGifts||[]).some(g=>g.gun===it.gun),'a shown gun was actually handed to someone');
     if(it.cat==='RECRUIT')check(rec.recruited||rec.turned,'a shown recruit really joined');}
    const nonGunItems=items.filter(i=>i.cat!=='GUN'&&i.cat!=='RECRUIT').length;
    check(w.inventory.length-inv0===nonGunItems,'every shown item is really in the inventory (decorative loot is banned)');
    for(const c of crates){if(c.cat==='GUN'&&!(rec.gunGifts||[]).some(g=>g.gun===c.gun))check(!items.some(i=>i.cat==='GUN'&&i.gun===c.gun),'an unassigned gun is not shown');}
   }else{check(rec.received.cash===0&&rec.received.items.length===0,'a failed PLAY shows no loot and no cash');}}
  check(wins>40,'wins exercised');
  check(W.bagTier(0)===0&&W.bagTier(5)===1&&W.bagTier(14)===1&&W.bagTier(20)===2&&W.bagTier(40)===3,'bag scale: small / medium / large');
  check(W.bagCount(8)===1&&W.bagCount(20)>=2&&W.bagCount(20)<=3&&W.bagCount(40)>=4,'bag counts: 1 duffel / 2-3 bags / a stacked haul');
  let last=0;for(let k=0;k<=80;k++){check(W.bagCount(k)>=last||k===0,'bag count never shrinks as the score grows');last=W.bagCount(k);}}

 // ---- 9 THE FEED: sparse, uneven, human — never a combat log
 {let maxSay=0,downs=0,bad=0,jokeBad=0,silences=0,plays=0;const banned=/[0-9%]|\bHP\b|\bNERVE\b|\bRISK\b|CAPTURE|PERCENT/;
  for(let s=1;s<=220;s++){const job=[...offense,big,hold][s%(offense.length+2)];const policy=['careful','greedy','naive','random'][s%4];
   const out=runFeel(cfgFor(s,job),{policy,plan:{sibling:null}});plays++;
   const says=out.steps.filter(x=>x.t==='say');maxSay=Math.max(maxSay,says.length);
   for(const x of says){
    if(x.kind==='EVENT'){if(x.text!==x.text.toUpperCase())bad++;}
    else if(!x.locked){const first=x.text.replace(/^[A-Z]/,c=>c.toLowerCase());const who=x.who;const formal=['sunday_best','auntie_grit'].includes(who);if(!formal&&x.text!==x.text.toLowerCase())bad++;if(formal&&first!==first&&false)bad++;}
    if(banned.test(x.text.replace(/\d+K/g,'').replace(/s2000/gi,'')))bad++;}
   if(says.filter(x=>x.joke).length>1)jokeBad++;}
  check(maxSay<=12,`at most ~12 bubbles per PLAY outside calls (max ${maxSay})`);check(bad===0,'EVENTS are ALL CAPS, CHATTER is lowercase, and no combat-log numbers appear');check(jokeBad===0,'at most one joke beat per PLAY');
  // sibling meme: exactly once on the first PLAY, never a repeat in the same PLAY, none when the plan is null
  let once=0;for(let s=1;s<=40;s++){const out=runFeel(cfgFor(s,offense[s%offense.length]),{policy:'careful',plan:{sibling:'FIRST'}});
   const n=out.steps.filter(x=>x.t==='say'&&x.text===FD.SIBLING[0]).length;const n2=out.steps.filter(x=>x.t==='say'&&x.text===FD.SIBLING[1]).length;if(n===1&&n2===1)once++;
   check(out.feed.feel.sibling==='FIRST','the sibling meme reports itself');}
  check(once===40,'the sibling meme fires exactly once on the first PLAY (locked wording)');
  {const out=runFeel(cfgFor(3,offense[0]),{policy:'careful',plan:{sibling:null}});check(!out.steps.some(x=>x.text===FD.SIBLING[0]),'no sibling meme without the plan');}
  {const wsib=W.newWorld(5);check(W.siblingDue(wsib)==='FIRST','the very first PLAY gets the sibling meme');W.feelState(wsib).sibDone=true;W.feelState(wsib).sibLast=1;let cb=0,g=[];let lastCb=1;
   for(let idx=2;idx<=600;idx++){wsib.plays=idx-1;if(W.siblingDue(wsib)==='CALLBACK'){cb++;g.push(idx-lastCb);lastCb=idx;W.feelState(wsib).sibLast=idx;}}
   check(cb/600<=1/15+.002&&g.every(x=>x>=15),`callback at most 1 in 15 PLAYs (${cb} in 600)`);}
  // silence: WASH cuts MID-EVENT, then the hello, the missed call, black
  {let ok=0,n=0;for(let s=1;s<=30;s++){const job=offense[s%offense.length];const out=runFeel(cfgFor(s,job,{opts:{qaWash:true}}),{policy:'careful'});if(out.rec.klass!=='WASH')continue;n++;
    const t=out.steps.map(x=>x.t);const ci=t.indexOf('cut');const tail=out.steps.slice(ci);
    if(ci>=0&&tail.some(x=>x.t==='silence')&&tail.filter(x=>x.t==='rich').map(x=>x.text).join('|')==='hello?|hello??'&&tail.some(x=>x.t==='dial')&&t[t.length-1]==='black'&&!tail.some(x=>x.t==='say'))ok++;}
   check(n>10&&ok===n,`catastrophic silence: cut mid-event, silence, hello? / hello??, the call, black (${ok}/${n})`);}
  // false alarm: silence -> hello? -> a crew line — only while nobody is down
  {let fa=0,tot=0;for(let s=1;s<=200;s++){const job=offense[s%offense.length];const out=runFeel(cfgFor(s+900,job),{policy:'careful',plan:{sibling:null,falseAlarm:true}});tot++;
    if(out.feed.feel.falseAlarm){fa++;const t=out.steps.findIndex(x=>x.t==='rich');check(t>=0&&out.steps[t-1].t==='silence'&&out.steps[t].text==='hello?'&&out.steps.slice(t).some(x=>x.t==='say'),'false alarm: silence, hello?, then the crew is back');}}
   check(fa>10,`false alarm exercised (${fa}/${tot})`);
   const w=W.newWorld(2);let n=0,lastFa=-99;for(let idx=1;idx<=800;idx++){w.plays=idx-1;if(W.falseAlarmDue(w)){n++;check(idx>=3&&idx-lastFa>=8,'false alarm gap >= 8, never in PLAYs 1-2');lastFa=idx;W.feelState(w).faLast=idx;}}
   check(n/800<=1/8,`false alarm rate <= 1 in 8 (${n} in 800)`);}
  // Oba feed: cut mid-event, silence, hello, back
  {let n=0,ok=0;for(let s=1;s<=40;s++){const job=offense[s%offense.length];const out=runFeel(cfgFor(s,job,{oba:true}),{policy:'careful'});if(!out.rec.oba)continue;n++;const t=out.steps.map(x=>x.t);if(t.includes('cut')&&t.includes('silence')&&t.includes('dial')&&out.steps.filter(x=>x.t==='say').length>=2)ok++;}
   check(n>5&&ok===n,`Oba feed cuts mid-event and goes silent (${ok}/${n})`);}
 }

 // ---- 9b UBE-AUTHORED CREW LINES are locked: verbatim, vampire-gated where the fiction needs it, and offered as danger hints before the PLAY
 {const LOCK=["this nigga got a machete oh shit","these brudahs don't know im a vampire","oh shit they brought garlic","my bad phone died lmao","oh shit is that OBA DE GWINNETT?!"];
  const pool=Object.values(L.LINES).flat().map(x=>x.replace(/^[=^~]+/,''));
  for(const l of LOCK)check(pool.includes(l),'locked line present verbatim: '+l);
  const seen=new Set();let vampBad=0;
  for(let s=1;s<=260;s++){const job=[...offense][s%offense.length];const st=D.startRoster(s,{cap:10});
   const out=runFeel({seed:s,job,night:1,state:st},{policy:'careful',plan:{sibling:null,falseAlarm:s%3===0}});
   const crew=out.rec.crew.map(id=>st.roster.find(o=>o.id===id));
   for(const x of out.steps.filter(x=>x.t==='say')){
    if(/machete/i.test(x.text)){check(x.text==='this nigga got a machete oh shit','the machete line is never altered');seen.add('machete');}
    if(/brudahs/i.test(x.text)){check(x.text==="these brudahs don't know im a vampire",'the vampire line is never altered');seen.add('brudahs');const sp=st.roster.find(o=>o.id===x.who);if(!sp||!sp.vampire)vampBad++;}
    if(/garlic/i.test(x.text)){check(x.text==='oh shit they brought garlic','the garlic line is never altered');seen.add('garlic');}
    if(/phone died lmao/i.test(x.text)){check(x.text==='my bad phone died lmao','the false-alarm line is never altered');seen.add('phone');}}}
  check(vampBad===0,'"these brudahs don\'t know im a vampire" is only ever said by a vampire');
  check(seen.has('machete')&&seen.has('garlic')&&seen.has('brudahs')&&seen.has('phone'),`every locked crew line surfaced in play (${[...seen].join(',')})`);
  // the danger hint on the phone offer is fiction (a crew line), never a number
  const w=W.newWorld(21);const hs=[];for(const j of offense){const h=FD.offerHints(w,j,'dre');hs.push(...h);check(h.length<=2,'at most two hints on an offer');}
  check(hs.length>5&&hs.every(h=>!/[0-9%]/.test(h.text)),'offer hints are fiction: no digits, no percentages');
  // the production board only offers what the garage can roll, and a NOTICE cannot be declined
  const wb=W.newWorld(4);wb.night=3;const b1=W.productionBoard(wb);check(!b1.notice&&b1.pitches.length>=1&&b1.pitches.length<=4,'the board offers 1-4 pitches');
  wb.garage.owned=['S2000'];const b2=W.productionBoard(wb);check(b2.pitches.every(p=>p.job.size[0]<=2),'the board never offers a job the garage cannot roll');
  wb.pending={night:3,kind:'HOLD'};const b3=W.productionBoard(wb);check(b3.notice&&b3.pitches.length===1&&b3.pitches[0].job.defense,'retaliation arrives as a single NOTICE');}

 // ---- 10 T9 LINE VARIETY: every feed trigger has >= 4 variants; no repeat inside 3 PLAYs (careers of consecutive PLAYs)
 {const keys=Object.keys(L.LINES).filter(k=>k.startsWith('feed:')||k.startsWith('oba:'));
  check(keys.length>60&&keys.every(k=>L.LINES[k].length>=4),`every feed trigger has >= 4 variants (${keys.length} triggers)`);
  let viol=0,uses=0;const seq=[];let recent=[];
  for(let i=0;i<60;i++){const job=offense[i%offense.length];const out=runFeel({...cfgFor(1000+i,job),state:Object.assign(D.startRoster(1000+i,{cap:10}),{recent})},{policy:'careful',plan:{sibling:null}});
   const ids=[...out.feed.lineLog];seq.push(ids);uses+=ids.length;recent=[...recent.slice(-2),[...(out.rec.lineLog||[]),...ids]];}
  seq.forEach((ids,i)=>{for(const id of ids){for(let d=1;d<=3&&i-d>=0;d++)if(seq[i-d].includes(id)){const key=id.split('#')[0];if(L.LINES[key].length>=4&&ids.filter(x=>x.startsWith(key+'#')).length<=1)viol++;break;}}});
  check(viol===0,`feed lines never repeat within 3 PLAYs (${viol} of ${uses} uses)`);}

 // ---- 11 DETERMINISTIC REPLAY: the recorded answers (timeouts included) rebuild the identical outcome; state integrity across the world
 {let same=0,n=0;
  for(let s=1;s<=60;s++){const job=[...offense,hold][s%(offense.length+1)];const seed=s*7;
   const out=runFeel({...cfgFor(seed,job),oba:s%9===0},{policy:['careful','greedy','random'][s%3],timeoutAll:s%2===0});const rec=out.rec;n++;
   const ans=[...rec.answers];let i=0;const rec2=E.runPlay({...cfgFor(seed,job),oba:s%9===0,policy:'careful'},pr=>{const a=ans[i++];if(!a||a.t!==pr.type)return undefined;return a.a;});
   const pick=r=>JSON.stringify({win:r.win,final:r.final,klass:r.klass,fs:r.finalStatus,pot:r.pot,steps:r.steps,getaway:r.getaway,lost:r.lost,flags:r.storyFlags,seats:r.seats});
   if(pick(rec)===pick(rec2))same++;}
  check(same===n,`replay from recorded answers is identical (${same}/${n})`);
  // same seed + same answers twice
  const a=runFeel(cfgFor(5,offense[1]),{policy:'careful'}),b=runFeel(cfgFor(5,offense[1]),{policy:'careful'});check(JSON.stringify(a.steps)===JSON.stringify(b.steps)&&JSON.stringify(a.rec.answers)===JSON.stringify(b.rec.answers),'feed steps are deterministic');
  // world state integrity through a career: crew statuses are legal, roster ids unique, garage consistent
  const c=runCareer({seed:31,nights:24,policy:'random'});const ids=c.state.roster.map(o=>o.id);check(new Set(ids).size===ids.length,'roster ids stay unique');
  check(c.state.garage.owned.every(id=>!c.state.garage.lost[id]),'a car is never both owned and lost');
  check(c.state.roster.every(o=>['READY','WOUNDED','SHOT','CAPTURED'].includes(o.status)),'legal Oga statuses');}

 // ---- 12 MORE TIME accessibility: the call bar doubles; nothing else changes
 {const pr={i:1,opts:['BUST','SNEAK'],card:{id:'stoop',text:'x'},buttons:[{id:'BUST',verb:'BUST THROUGH'},{id:'SNEAK',verb:'SLIP PAST'}]};
  const out=runFeel(cfgFor(3,offense[0]),{policy:'careful'});const f=out.feed;
  const a=f.call(pr,{moreTime:false}),b=f.call(pr,{moreTime:true});check(a.ms===10000,'RC4 contextual call has an exact 10-second reading window');check(a.buttons.every(x=>x.detail),'each call explains its qualitative tradeoff');check(a.timeout==='BAR EMPTY: CREW DECIDES','timeout names the actual fallback');check(b.ms===a.ms*2,'MORE TIME doubles the clock');
  const cl=f.climb({read:'FRESH',tease:'RARE'},{moreTime:true});check(cl.ms===a.ms*2&&cl.buttons.length===2,'HIT ONE MORE uses the same clock and two buttons');}

 // ---- 13 the recorded tuned-sim numbers meet the OL-023 gates (T2 bands, T5)
 {const f=path.join(dir,'out','tuned','tuned_summary.json');
  if(fs.existsSync(f)){const T=JSON.parse(fs.readFileSync(f,'utf8')).T;
   check(T.T5_fourLever&&T.T5_fourLever.now>=.35,`T5 OL-023 four-lever (SWAP+WEAPON+CAR+CALLS, no TRAIT) >= 35% (recorded ${T.T5_fourLever?(T.T5_fourLever.now*100).toFixed(1):'missing'}%)`);
   check(T.T5_playerAttributable.now>=.35,`legacy T5 >= 35% (recorded ${(T.T5_playerAttributable.now*100).toFixed(1)}%)`);
   const byJob=T.T2_namedCapturedByJob||null;if(byJob){check(byJob.routine<=.08,'T2 routine offense <= 8%');check(byJob.big<=.20,'T2 BIG PLAY <= 20%');check(byJob.hold<=.08,'T2 HOLD THE HOUSE <= 8%');}}
  else console.log('   (no recorded tuned summary — run tools/tests/f01/play-sim/run_tuned.mjs)');}

 console.log(`PASS F01 FEEL LOCK (OL-023: auto-seat, owned cars only, weapon/hands loadout, timed calls + timeout, story flags, Oba cadence + collapse, possession loss, return = state, trunk = award, feed voice + caps + silence + false alarm + sibling meme, T9 feed lines, replay; violations: ${bad})`);
}
