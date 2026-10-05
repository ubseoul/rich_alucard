// F13 BALANCE LOCK — focused regression guards for the whole-game economy. These assert RELATIONSHIPS and RULES (a cap holds, a
// displayed number is the applied number, a margin keeps its sign, a reload changes nothing), never the tuned values themselves, so
// a later retune stays free as long as the economy keeps its shape. The population evidence lives in tools/tests/f13/run.mjs.
import assert from 'node:assert/strict';
import {boot,campaign,mulberry,saveOf} from './_campaign.mjs';

const money=c=>Number(c.RAState.get().life.resources.money);
const api={refresh(){},message(){},launch:(id,p,done)=>done({quality:80})};
async function ops(root){
 const c=await boot(root,{rng:mulberry(7)});
 c.RAState.patch('life.world.day',16);c.RAState.patch('life.resources.money',500000);
 for(const id of ['toyota_supra_mk4_001','lambo_urus_oxblood'])c.RALife.addCar({id,make:'X',model:id,short:id,price:1,value:1,parts:{}});
 c.RAFrag.patch('F04','active',true);c.RAFrag.patch('F04','offer.status','accepted');
 c.RAState.patch('life.newOga',{...c.RAState.get().life.newOga,rank:3,status:'associate'});c.RAF05.unlock.tick();
 return c;
}

export async function test(root){
 // ---- 1. WAR ROOM: the board's SLOTS are the nightly cap (Vol 7 §3.1); EXTRACT stays off the cap (F01 R1 brake)
 {const c=await ops(root);
  const host=await (await import('../F04/_lib.mjs')).playHost(root,{policy:'careful'});c.RAShowdown.play.setTransport(host.transport);
  c.RAClock.sleep();const WR=c.RAPhoneApps.get('warRoom');const slots=c.RAWarRoomJobs.slotsTonight();
  assert.equal(slots,c.RAFrag.read('F04','jobs.slotsPerNight',1),'the cap is the SLOTS number the board shows');assert.equal(slots,2,'six active Ogas: two slots');
  const idx=()=>c.RAWarRoomJobs.buildNightMenu().findIndex(j=>j.routesToPlay&&j.type!=='EXTRACT');
  for(let i=0;i<slots+3;i++)await WR.onAction('play',String(idx()),api);
  assert.equal(host.calls,slots,`the board runs at most SLOTS (${slots}) PLAYs a night`);
  assert.equal(c.RAWarRoomPlay.pending(),null,'a refused launch leaves nothing pending');
  assert.equal(c.RAWarRoomPlay.lastRefusal().code,'NO_SLOT');
  const b=money(c);WR.onAction('runJob',String(c.RAWarRoomJobs.buildNightMenu().findIndex(j=>j.type==='LAY_LOW')),api);
  assert.equal(money(c),b,'LAY LOW is a job: it needs a free slot too');
  // the next night the slots are back
  c.RAClock.sleep();for(const u of c.RACrew.list({fragment:'F04'}))if(u.status==='DOWNED')c.RACrew.setStatus(u.id,'ACTIVE',{reason:'test'});
  await WR.onAction('play',String(idx()),api);assert.equal(host.calls,slots+1,'a new night opens the board again');
  // EXTRACT is never blocked by the cap
  const victim=c.RACrew.list({fragment:'F04',status:'ACTIVE'})[0].id;c.RAWarRoomCrew.setCaptured(victim,{reason:'test'});
  for(let i=0;i<slots;i++)await WR.onAction('play',String(idx()),api);
  const x=c.RAWarRoomJobs.buildNightMenu().findIndex(j=>j.type==='EXTRACT');assert.ok(x>=0,'EXTRACT is offered');
  const before=host.calls;await WR.onAction('play',String(x),api);assert.equal(host.calls,before+1,'EXTRACT runs even with every slot used');}

 // ---- 2. LAY LOW applies the HEAT its card shows (a districtless job's whole delta is global); district jobs keep their split
 {const c=await ops(root);c.RAHeat.add(60,{source:'test'});
  const job=c.RAWarRoomJobs.buildNightMenu().find(j=>j.type==='LAY_LOW');const res=c.RAWarRoomJobs.executeRun({jobCard:job});
  const h=c.RAHeat.global(),b=money(c);c.RAWarRoomJobs.applyRunResult(res);
  assert.equal(h-c.RAHeat.global(),-res.heatDelta,'global HEAT drops by exactly the authored LAY LOW amount');
  assert.equal(b-money(c),-res.cashDelta,'and costs exactly its authored price');
  const d0=c.RAHeat.district('inglewood'),g0=c.RAHeat.global();
  c.RAWarRoomJobs.applyRunResult({district:'inglewood',heatDelta:10,cashDelta:0,approach:'x',type:'run',success:true,day:16});
  assert.equal(c.RAHeat.district('inglewood')-d0,10);assert.equal(c.RAHeat.global()-g0,3,'district jobs: full to the district, 30% global (unchanged)');}

 // ---- 3. THE TRAP: a house cooks its cases/night once a night; BUY BASE is reachable from the phone and costs real money
 {const c=await ops(root);const R=c.RAF05;const app=R.phoneApp;
  assert.ok(R.unlock.buy('the_bando').ok);
  const page=app.house('the_bando');assert.ok(page.includes('do:trap:buyBase:the_bando|standard'),'the house page offers BUY BASE');
  const cap=R.AUTHORED.houses.the_bando.capacity;const b=money(c);
  app.onAction('buyBase','the_bando|standard',api);
  assert.equal(R.production.ingredients().standard,cap,'BUY BASE buys one night of the house');
  assert.equal(b-money(c),cap*R.PROVISIONAL.ingredientCost.standard,'at the provisional (F13) unit cost, through the ledger');
  assert.equal(c.RAMoneyLedger.entries().at(-1).source,'trap:ingredients:gbenga');
  app.onAction('cook','the_bando|C',api);app.onAction('buyBase','the_bando|standard',api);app.onAction('cook','the_bando|C',api);
  assert.equal(R.production.cookedTonight('the_bando'),cap,'a second COOK the same night adds nothing');
  assert.equal(R.production.ingredients().standard,cap,'and does not eat the base');
  c.RAClock.sleep();app.onAction('cook','the_bando|C',api);assert.equal(R.production.cookedTonight('the_bando'),cap,'the next night the house cooks again');
  // a broke Rich cannot buy base and nothing goes negative
  c.RAState.patch('life.resources.money',0);const i0=R.production.ingredients().standard;app.onAction('buyBase','the_bando|standard',api);
  assert.equal(money(c),0);assert.equal(R.production.ingredients().standard,i0);}

 // ---- 4. margins keep their shape (relationships, not values)
 {const c=await ops(root);const R=c.RAF05;const A=R.AUTHORED,P=R.PROVISIONAL;const base=R.production.BASE_OF;
  for(const g of ['D','C','B','A']){
   const cost=P.ingredientCost[base[g]];const whole=R.production.unitPrice(g,70,{channelId:'wholesale'});
   const retail=Math.max(...Object.values(A.channels).filter(ch=>ch.id!=='wholesale'&&ch.grades.includes(g)).map(ch=>R.production.unitPrice(g,70,{channelId:ch.id})));
   assert.ok(cost>0,`${g}: product has an input cost`);
   assert.ok(whole-cost>0,`${g}: a standard-quality wholesale sale is still profitable`);
   assert.ok((retail-cost)>=1.5*(whole-cost),`${g}: retail's exposure pays clearly more than the safe channel`);}
  // the one upgrade with a live effect costs money; an upgrade with no wired effect is never charged for
  assert.ok(P.upgradeCost.better_burner>0&&P.betterBurnerHeatMult<1,'BETTER BURNER is a purchase, not a free HEAT cut');
  for(const u of ['aging_racks','vault','cameras','money_counter','panic_room'])assert.equal(P.upgradeCost[u],0,`${u}: no wired economic effect -> no price`);
  assert.equal(A.cost.raidLossUnbankedPct,0.3,'F05 raid loss stays stash + 30% of unbanked');}

 // ---- 5. the population's shape: repeating a capped action buys nothing; reload changes nothing; no corrupted state
 {const days=10;
  // the same player twice: once tapping PLAY / COOK / LAY LOW far past the caps, once only as often as the board and the house allow
  const rep=await campaign(root,{persona:'repeater',seed:3,days});
  const ctl=await campaign(root,{persona:'repeater',seed:3,days,overrides:{plays:2,cooks:1}});
  assert.ok(rep.plays.attempted>rep.plays.run&&rep.trap.cookRefused>0,'the repeater really did try past the caps');
  assert.ok(Math.max(...rep.plays.byNight.map((n,i)=>n))<=3,'at most SLOTS (2) + an EXTRACT a night');
  assert.equal(rep.final.money,ctl.final.money,'extra taps past the caps change no money');
  assert.equal(rep.trap.casesCooked,ctl.trap.casesCooked,'nor a single cooked case');
  const normal=await campaign(root,{persona:'normal',seed:3,days});
  for(const m of [normal,rep]){assert.deepEqual(m.invariants,[],`${m.persona}: no NaN / negative state`);assert.deepEqual(m.softlock,[],`${m.persona}: no softlock`);assert.deepEqual(m.errors,[],`${m.persona}: no phone action throws`);}
  const again=await campaign(root,{persona:'normal',seed:3,days,reloadAt:5});
  assert.equal(again.digest,normal.digest,'a save/reload mid-campaign does not change a single economic outcome');
  assert.equal(again.final.money,normal.final.money);}
 // ---- 6. a recruit who joined is still in the War Room after a reload (their identity is in the save, their state intact)
 {const c=await ops(root);assert.ok(c.RAWarRoomCrew.recruit({id:'play_recruit_x',name:'NEW GUY',cls:'MUSCLE',source:'play'}).ok);
  c.RAWarRoomCrew.setRecovering('play_recruit_x',{days:2,reason:'test'});
  const d=await boot(root,{seedState:saveOf(c),rng:mulberry(7)});const u=d.RACrew.get('play_recruit_x');
  assert.ok(u&&u.fragment==='F04'&&u.class==='MUSCLE'&&u.status==='DOWNED','the recruit and their state survive the reload');
  assert.equal(d.RAWarRoomCrew.allOgas().length,7,'six named + the recruit');
  assert.equal(d.RAWarRoomCrew.recruit({id:'play_recruit_x',name:'NEW GUY',cls:'MUSCLE'}).ok,false,'never defined twice');}
 console.log('PASS F13 balance lock (War Room SLOTS cap + EXTRACT exempt, LAY LOW applied = shown, trap cases/night + BUY BASE, margin shape, repetition past a cap buys nothing, reload-invariant incl. recruits, no corrupted state)');
}
