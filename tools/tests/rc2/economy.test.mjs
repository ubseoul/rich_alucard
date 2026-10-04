// RC2 · BUILD 1 (OL-063) — the economy changes, on the REAL production runtime (headless). These guard RULES and RELATIONSHIPS (the offer lands
// on Day 2, rent pays every morning, the first club visit is protected, a PLAY out-earns a day job by the brief's multiples), not the tuned values
// themselves, so a later retune stays free as long as the economy keeps its shape. The population numbers live in tools/rc2/econ-sim.mjs.
import assert from 'node:assert/strict';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {boot,mulberry} from '../f13/_campaign.mjs';
import {playHost} from '../f04/_lib.mjs';
import {run} from '../if1/_lib.mjs';

const money=c=>Number(c.RAState.get().life.resources.money);
const fresh=async root=>{const c=await boot(root,{rng:mulberry(11)});c.RAClock.wake({first:true});for(const f of ['prologueDone','throneDone','firstWakeDone'])c.RALife.setFlag(f,true);return c;};
// One full SLURP shift at its ceiling: 90 s, an order every 3 s at the very best, $6 + a $10 tip per perfect bowl (js/minigames/slurp.js).
const DAY_JOB_CEILING=Math.ceil(90/3)*(6+10);

export async function test(root){
 // ---- 1. the four flags the loop runs on ship ON; TRAP stays dark
 {const c=await fresh(root);
  for(const id of ['F01.showdown_core','F04.war_room','F06.rainmaker','F15.velvet_rotation'])assert.equal(c.RAFlagDefaults[id],true,`${id} ships ON`);
  assert.notEqual(c.RAFlagDefaults['F05.trap'],true,'TRAP stays dark');}

 // ---- 2. PLAYS ARE THE MAIN PATH: no offer on Day 1; the offer lands on Day 2 and puts WAR ROOM on the phone; accept = six Ogas, two slots, no car needed
 {const c=await fresh(root);const WR=()=>c.RAPhoneApps.get('warRoom');const api={refresh(){},message(){}};
  assert.equal(c.RAFrag.read('F04','offer.status','unavailable'),'unavailable','Day 1: no offer yet');
  c.RAClock.sleep();assert.equal(c.RALife.today().day,2);
  assert.equal(c.RAFrag.read('F04','offer.status'),'available','Day 2: Mister December\'s offer is available (no rave, rep, car or homies needed)');
  assert.equal(c.RALife.appUnlocked('warRoom'),true,'the offer puts WAR ROOM on the phone (it used to unlock only on accept, which a locked app could not offer)');
  assert.equal(c.RACrew.list({fragment:'F04'}).length,6,'the six named Ogas exist');
  WR().onAction('accept','',api);
  assert.equal(c.RAFrag.read('F04','active',false),true);assert.equal(c.RAWarRoomCrew.activeOgas().length,6);assert.equal(c.RAFrag.read('F04','jobs.slotsPerNight',0),2,'a Day-2 accept gets its real board tonight, not at the next WAKE');
  // a brand-new crew's first two nights are routine runs only
  for(const night of [0,1]){c.RAFrag.patch('F04','jobs.nightsSinceStart',night);for(let day=2;day<30;day++){c.RAState.patch('life.world.day',day);assert.ok(!c.RAWarRoomJobs.buildNightMenu().some(j=>j.type==='TAKE_THE_BLOCK'),`night ${night}, day ${day}: no TAKE THE BLOCK`);}}
  c.RAState.patch('life.world.day',2);c.RAFrag.patch('F04','jobs.nightsSinceStart',0);
  // the first PLAY runs with no car owned (the crew hooptie), on the REAL F01 engine, and pays through the ledger once
  const host=await playHost(root,{policy:'careful'});c.RAShowdown.play.setTransport(host.transport);
  const req=c.RAWarRoomPlay.buildRequest(c.RAWarRoomJobs.buildNightMenu().find(j=>j.routesToPlay));assert.ok(req.ok,JSON.stringify(req.errors));
  assert.deepEqual(JSON.parse(JSON.stringify(req.request.garage.owned)),['HOOPTIE'],'no car: the hooptie');assert.equal(c.RALife.ownedCars().length,0,'and nothing is added to Rich\'s garage');
  const idx=c.RAWarRoomJobs.buildNightMenu().findIndex(j=>j.routesToPlay);const b0=money(c);
  await WR().onAction('play',String(idx),api);
  assert.equal(host.calls,1,'F01 ran the PLAY');const res=host.trace[0].res;assert.equal(res.status,'COMPLETE');
  assert.equal(money(c),Math.max(0,b0+res.cash.gain-res.cash.spent),'the bank moved by the PLAY pot minus its cost, once');}

 // ---- 3. a PLAY out-earns a day job by the brief's multiples (routine >= 5x, BIG >= 15x), measured on the shipped job table
 {const {JOBS}=await import(pathToFileURL(path.join(root,'js/frag/F01/play/content.mjs')).href);
  const routine=JOBS.filter(j=>!j.bigPlay),big=JOBS.filter(j=>j.bigPlay);
  for(const j of routine)assert.ok(j.band[0]*1000>=5*DAY_JOB_CEILING,`${j.id}: floor $${j.band[0]}K is at least 5x a full day-job day ($${DAY_JOB_CEILING} at the ceiling)`);
  for(const j of big)assert.ok(j.band[0]*1000>=15*DAY_JOB_CEILING,`${j.id}: BIG floor $${j.band[0]}K is at least 15x a day-job day`);
  assert.ok(routine.length>=8&&big.length===1);}

 // ---- 4. RENTALS PAY DAILY: every wake pays each owned building its daily rent (after the loan / Shannon split), and the weekly accrual is gone
 {const c=await fresh(root);c.RAClock.sleep();
  c.RAPropertyQuest=c.RAPropertyQuest||{propertyId:'property_la_4p_01'};
  const {SEEDS}=await import(pathToFileURL(path.join(root,'tools/pilot/headless.mjs')).href);SEEDS.property.apply(c);
  c.RAState.patch('life.resources.money',1000000);assert.equal(c.RARealEstate.buy('re_duplex_inglewood',{down:true}),true);
  const E=c.RAEcon.rent.perDay;const owned=()=>c.RALife.life().ownership.properties.filter(p=>p.ownershipStatus==='owned');
  for(let i=0;i<3;i++){const before=money(c);const owedBefore=owned().reduce((n,p)=>n+(p.owed||0),0);c.RAClock.sleep();
   const gross=E.property_la_4p_01+E.re_duplex_inglewood;const paid=money(c)-before;
   assert.ok(paid>0&&paid<=gross,`day ${i+1}: rent paid into cash at WAKE (${paid} of ${gross} gross)`);
   assert.ok(owned().reduce((n,p)=>n+(p.owed||0),0)<owedBefore,'the loan share is repaid from it, as the manual COLLECT did');
   assert.ok(owned().every(p=>!(p.rentDue>0)),'nothing is left waiting to collect');
   assert.ok(c.RALife.life().world.flags.lastRentIn.net===paid,'the morning report matches the cash');}
  // day-by-day, not Fridays only
  const wk=[];for(let i=0;i<7;i++){const b=money(c);c.RAClock.sleep();wk.push(money(c)-b);}assert.ok(wk.every(x=>x>0),'every one of 7 mornings paid rent: '+wk.join(','));}

 // ---- 5. STRIP CLUB: open from Day 1; first visit = discount + cap (half the cash on hand); both end with the first visit
 {const c=await fresh(root);const S=c.RAStripClub;
  assert.equal(c.RALife.today().day,1);assert.equal(S.isOpen(),true,'open on Day 1 with no story gate');
  const t=S.terms();assert.equal(t.first,true);assert.equal(t.cap,Math.floor(money(c)*c.RAEcon.stripClub.firstVisit.capShare),'cap = the share of the cash on hand');
  assert.ok(S.price(t,1000)<1000&&S.price(t,1000)===Math.round(1000*(1-c.RAEcon.stripClub.firstVisit.discount)),'the house comps part of every throw');
  const b0=money(c);const s=c.RAF06Rainmaker.mount({},{terms:t});assert.equal(s.start(25000),true);
  let tt=1000;for(let i=0;i<80;i++){if(c.RAF06Rainmaker.state().active==null)break;const st=s.game.getState();if(st.remaining<=0)break;s.game.flick(tt+=700);}s.game.end();s.dispose();
  const paid=b0-money(c);assert.ok(paid>0&&paid<=t.cap,`first visit paid ${paid} <= cap ${t.cap}`);assert.ok(paid<25000,'and less than the throw total (discount)');
  assert.equal(S.firstVisitDone(),true,'the first spend uses up the first visit');
  const t2=S.terms();assert.equal(t2.first,false);assert.equal(S.price(t2,1000),1000,'later visits pay full price');assert.equal(t2.cap,Infinity);
  // a poor first visit is protected too: the round is trimmed to half the cash, never refused outright while half the cash covers a round
  const p=await fresh(root);p.RAState.patch('life.resources.money',3000);const pt=p.RAStripClub.terms();assert.equal(pt.cap,1500);
  const ps=p.RAF06Rainmaker.mount({},{terms:pt});assert.equal(ps.start(10000),true,'trimmed, not refused');
  assert.ok(ps.game.core.budget<=Math.floor(1500/(1-pt.discount)),'the trimmed round never risks more than the cap');ps.dispose();
  const broke=await fresh(root);broke.RAState.patch('life.resources.money',400);const bt=broke.RAStripClub.terms();const bs=broke.RAF06Rainmaker.mount({},{terms:bt});assert.equal(bs.start(5000),false,'under the minimum round: NEED CASH');bs.dispose();
  // the phone app is the one door and it goes STRAIGHT there
  // (the headless phone registry is a stub that appears after the content files load, so re-run the module against it)
  await run(root,c,['js/systems/strip_club.js']);const app=c.RAPhoneApps.get('stripClub');assert.ok(app&&app.label==='STRIP CLUB'&&typeof app.direct==='function','STRIP CLUB phone app registers a direct launch');}

 // ---- 6. CHEAP BUYS PAY OFF: a small purchase can put an EXISTING want in front of the player early; once a day; nothing for big purchases
 {const c=await fresh(root);const CB=c.RACheapBuys;const flags=()=>c.RALife.life().world.flags;
  assert.equal(CB.afterPurchase(5000),null,'a big purchase never rolls');
  let hit=null;for(let salt=1;salt<400&&!hit;salt++){const k=await fresh(root);k.RALife.setFlag('cheapBuySalt',salt);const r=k.RACheapBuys.afterPurchase(9);if(r){hit={k,r,salt};}}
  assert.ok(hit,'some lives roll a payoff');const live=hit.k.RALife.life().temptations.live.map(t=>t.id);assert.ok(live.includes(hit.r.id),'the payoff is the authored want, pushed to WHAT WE ON');
  assert.ok(CB.POOL.includes(hit.r.id));assert.equal(hit.k.RACheapBuys.afterPurchase(9),null,'once a day');
  const ev=hit.k.RAState.get().life.history.filter(e=>e.type==='cheap_buy_payoff');assert.equal(ev.length,1,'recorded once');
  // the seam: a real RALife.spend of a few dollars goes through the wrapped spend
  const w=await fresh(root);w.RALife.setFlag('cheapBuySalt',hit.salt);const m0=money(w);assert.equal(w.RALife.spend(9),true);assert.equal(m0-money(w),9,'the purchase itself is unchanged');
  assert.equal(w.RALife.life().temptations.live.some(t=>CB.POOL.includes(t.id)),true,'and it paid off');}

 // ---- 7. NEW OGA M1 is open earlier (Day 3, was Day 8) and stays open
 {const c=await fresh(root);c.RAState.patch('life.adventures.records.A08',{status:'completed',count:1,completedDay:1});
  for(const [d,want] of [[2,false],[3,true],[12,true],[24,true],[25,false]]){c.RAState.patch('life.world.day',d);assert.equal(c.RAAdventures.available('NEW_OGA_M1'),want,`NEW_OGA_M1 on day ${d}`);}}

 console.log('PASS RC2 economy (flags ON, Day-2 offer + hooptie PLAY, routine >= 5x / BIG >= 15x a day job, rent pays daily, strip club open Day 1 with a protected first visit, cheap buys pay off, M1 earlier)');
}
