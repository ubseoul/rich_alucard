// F13 WHOLE-GAME BALANCE HARNESS — the integrated operations economy, played for many seeded days by player personas.
// Not a model: it boots the REAL production runtime headlessly (the BTF game + IF-1, then F01 / F03 provider / F04 / F05 / F06 /
// the HOLD bridge in production load order, flags ON) and drives it only through the calls the phone apps make:
//   WAR ROOM   RAWarRoomJobs.buildNightMenu -> RAWarRoomPlay.launch (the REAL F01 PLAY engine, headless transport) / LAY LOW
//   THE TRAP   buy house, BUY BASE (production.purchaseIngredients), COOK (production.cook), ASSIGN SALES, COUNT THE MONEY,
//              ROLES (hire a runner), UPGRADES, LEVEL UP, HOLD THE HOUSE (RAHoldBridge.start -> F01 HOLD -> F05 applyDefense)
//   RAINMAKER  RAF06Rainmaker session (the approved pure core generates the bills; every flick is a real ledger expense)
//   the clock  RAClock.sleep() (NIGHT: HEAT decay, sales, raid scheduling; WAKE: crew timers, budget, F04/F05 wake handlers)
// Production behavior is never changed. Determinism: one seeded Math.random shared by every realm, and F01 PLAY seeds derived
// from (campaign seed, requestId). Same code + same arguments -> byte-identical metrics.
import path from 'node:path';
import vm from 'node:vm';
import {pathToFileURL} from 'node:url';
import {full,run,read} from '../if1/_lib.mjs';
import {F01_FILES,F04_FILES,F03_PROVIDER} from '../F04/_lib.mjs';

// ---------------------------------------------------------------------------------------------------------------- seeded rng
export function mulberry(seed){let a=seed>>>0;return ()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}
const hash=s=>{let h=2166136261;for(const ch of String(s)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)>>>0;}return h;};

// ---------------------------------------------------------------------------------------------------------------- personas
// Every knob is player BEHAVIOR (what a person chooses on the phone), never a game value.
//  f01        the F01 sim policy that answers the PLAY (careful/greedy/naive/random = strong/aggressive/weak/erratic player)
//  plays      War Room PLAYs attempted per night (the exploit personas try more than the board's SLOTS)
//  jobPref    which card to take from the night menu: 'best' (highest band), 'safe' (lowest heat), 'first'
//  layLowAt   LAY LOW when global HEAT >= this (null = never); layLowSpam = LAY LOW repeatedly until COOL
//  channel    trap sales channel preference: 'retail' (corner when available) | 'wholesale'
//  countEvery COUNT THE MONEY every N days (1 = every morning)
//  answerRaids  HOLD THE HOUSE when a raid is pending (false = ignore it)
//  houses     traphouses bought, in order, when cash allows (reserve kept after purchase)
//  cooks      COOK attempts per house per night (the exploit personas try more than the house's cases/night)
//  quality    [lo,hi] cook-minigame quality
//  rain       RAINMAKER: {every:N days, budget, minCash}
//  upgrades   upgrades bought when cash allows
export const PERSONAS={
 normal:     {f01:'careful',plays:1,jobPref:'first',layLowAt:70,channel:'retail',countEvery:1,answerRaids:true,houses:['the_bando','the_cul_de_sac'],reserve:40000,cooks:1,quality:[65,92],rain:{every:7,budget:5000,minCash:60000},upgrades:['better_burner']},
 aggressive: {f01:'greedy',plays:2,jobPref:'best',layLowAt:null,channel:'retail',countEvery:1,answerRaids:true,houses:['the_bando','the_cul_de_sac','laundromat_back_room'],reserve:10000,cooks:1,quality:[70,95],rain:null,upgrades:[]},
 conservative:{f01:'careful',plays:1,jobPref:'safe',layLowAt:40,channel:'wholesale',countEvery:1,answerRaids:true,houses:['the_bando'],reserve:80000,cooks:1,quality:[70,90],rain:null,upgrades:['vault','panic_room','cameras']},
 loser:      {f01:'random',plays:1,jobPref:'first',layLowAt:null,channel:'retail',countEvery:3,answerRaids:true,houses:['the_bando'],reserve:20000,cooks:1,quality:[35,70],rain:{every:5,budget:5000,minCash:20000},upgrades:[]},
 winner:     {f01:'careful',plays:2,jobPref:'best',layLowAt:65,channel:'retail',countEvery:1,answerRaids:true,houses:['the_bando','the_cul_de_sac','laundromat_back_room'],reserve:30000,cooks:1,quality:[90,99],rain:null,upgrades:['better_burner']},
 spender:    {f01:'careful',plays:1,jobPref:'first',layLowAt:70,channel:'retail',countEvery:1,answerRaids:true,houses:['the_bando','the_cul_de_sac','laundromat_back_room'],reserve:0,cooks:1,quality:[60,90],rain:{every:1,budget:25000,minCash:25000},upgrades:['better_burner','aging_racks','vault','cameras','money_counter','panic_room']},
 hoarder:    {f01:'careful',plays:1,jobPref:'safe',layLowAt:null,channel:'wholesale',countEvery:1,answerRaids:true,houses:[],reserve:1e12,cooks:0,quality:[70,90],rain:null,upgrades:[]},
 repeater:   {f01:'careful',plays:6,jobPref:'best',layLowAt:60,layLowSpam:true,channel:'retail',countEvery:1,answerRaids:true,houses:['the_bando','the_cul_de_sac'],reserve:20000,cooks:6,quality:[70,95],rain:null,upgrades:['better_burner']},
 raid_dodger:{f01:'careful',plays:1,jobPref:'best',layLowAt:null,channel:'retail',countEvery:1,answerRaids:false,houses:['the_bando','the_cul_de_sac'],reserve:20000,cooks:1,quality:[70,95],rain:null,upgrades:['better_burner']}
};

// ---------------------------------------------------------------------------------------------------------------- boot
const F06_FILES=['js/frag/F06/migrations.js','js/frag/F06/make_it_rain_tunables.js','js/frag/F06/make_it_rain_core.js'];
async function playHostFor(root,seed,policy){
 const url=f=>pathToFileURL(path.join(root,f)).href;
 await import(url('tools/tests/f01/play-sim/globals.mjs'));
 if(!globalThis.RAPlayContract)vm.runInThisContext(await read(root,'js/frag/F01/play_contract.js'));
 const {makeDriver}=await import(url('tools/tests/f01/play-sim/driver.mjs'));
 const AD=await import(url('js/frag/F01/play/adapter.mjs'));
 const host={saved:null,cache:new Map(),calls:0,crashes:[],
  transport(req){
   const plain=JSON.parse(JSON.stringify(req));
   if(host.cache.has(plain.requestId))return JSON.parse(JSON.stringify(host.cache.get(plain.requestId)));
   // campaign-seed variation: the F01 PLAY seed is derived from (campaign seed, requestId) — a different life, same rules
   plain.seed=(hash(`${seed}|${plain.requestId}`)%90000)+1000;
   host.calls++;
   let r;try{r=AD.runHeadless(plain,makeDriver(policy),host.saved);}catch(e){host.crashes.push({job:plain.job&&plain.job.f01JobId,day:plain.day,error:String(e.message||e).slice(0,120),at:String(e.stack||'').split('\n').slice(1,4).map(x=>x.trim()).join(' < ')});throw e;}
   if(r.result.status==='COMPLETE'||r.result.status==='DECLINED'){host.cache.set(plain.requestId,r.result);if(r.result.status==='COMPLETE')host.saved=r.world;}
   return JSON.parse(JSON.stringify(r.result));
  }};
 return host;
}
export async function boot(root,{seedState=null,rng}={}){
 const ctx=await full(root,seedState?{seedState}:{});
 ctx.__f13rng=rng;vm.runInContext('Math.random=()=>__f13rng()',ctx);
 await run(root,ctx,F01_FILES);
 vm.runInContext(F03_PROVIDER,ctx,{filename:'F03-provider-fixture'});
 await run(root,ctx,F04_FILES);
 const f05=JSON.parse(await read(root,'js/frag/F05/manifest.json')).files;
 await run(root,ctx,['js/frag/F05/migrations.js',...f05,'js/if1/hold_bridge.js']);
 await run(root,ctx,F06_FILES);
 // RAINMAKER's renderer is canvas-only: the approved pure core generates the round (as tools/tests/f06/production.test.mjs does)
 ctx.RAMakeItRainSandbox={mount(canvas,options){
  const core=ctx.RAMakeItRainCore.create({seed:1});
  return {core,startRound:b=>core.reset({budget:b}),getState:()=>core.state(),stop(){},destroy(){},
   flick(t){core.beginDrag({x:.5,y:.9,t:t-250});core.dragTo({x:.5,y:.4,t:t-40});const r=core.release({x:.5,y:.2,t,vx:0,vy:-2});options.audio.onFlick(r);return r;},
   end(){core.advance(30000);options.onRoundEnd(core.summary());}};
 }};
 await run(root,ctx,['js/frag/F06/production.js']);
 for(const f of ['F04.war_room','F01.showdown_core','F05.trap','F06.rainmaker'])ctx.RAFeatures.set(f,true);
 return ctx;
}
export const saveOf=ctx=>{const s=ctx.RASaveFixtures.memoryStorage();ctx.RAState.write(s,ctx.RAState.get());const raw=Object.values(s.dump())[0];return typeof raw==='string'?JSON.parse(raw):raw;};

// ---------------------------------------------------------------------------------------------------------------- the start
// The moment both operations systems are open: Day 16 (Mister December's window opens Day 16; THE TRAP opens at NEW OGA ASSOCIATE),
// $100,000 cash (one canonical monthly budget), clout MID (the War Room offer requires it), two cars, the six Vol 7 Ogas.
export const START={day:16,money:100000,clout:'MID',cars:['toyota_supra_mk4_001','lambo_urus_oxblood']};
function setup(c){
 c.RAState.patch('life.world.day',START.day);c.RAState.patch('life.world.month',Math.floor((START.day-1)/28)+1);
 c.RAState.patch('life.clock.lastWakeDay',START.day);
 c.RAState.patch('life.resources.money',START.money);c.RAState.patch('life.resources.clout',START.clout);c.RAState.patch('life.resources.cloutPoints',30);
 for(const id of START.cars)c.RALife.addCar({id,make:'X',model:id,short:id,price:1,value:1,parts:{}});
 c.RAFrag.patch('F04','active',true);c.RAFrag.patch('F04','offer.status','accepted');c.RAFrag.patch('F04','jobs.nightsSinceStart',0);
 c.RAState.patch('life.newOga',{...c.RAState.get().life.newOga,rank:3,status:'associate'});
 c.RAF05.unlock.tick();
}

// ---------------------------------------------------------------------------------------------------------------- one campaign
const money=c=>Number(c.RAState.get().life.resources.money);
const J=v=>JSON.parse(JSON.stringify(v));
// mode 'api': the harness buys base through production.purchaseIngredients (the economy underneath the phone);
// mode 'ui' : only what the TRAP phone app actually offers (BUY BASE only if the house page renders that action).
export async function campaign(root,{persona='normal',seed=1,days=42,reloadAt=null,trace=false,mode='api',overrides=null}={}){
 const P={...PERSONAS[persona],...(overrides||{})};if(!PERSONAS[persona])throw new Error(`unknown persona ${persona}`);
 const rng=mulberry(hash(`${persona}|${seed}`));const prng=mulberry(hash(`policy|${persona}|${seed}`));
 const realMath=Math.random;Math.random=rng;   // the F01 host realm too
 try{
 let c=await boot(root,{rng});setup(c);
 const host=await playHostFor(root,seed,P.f01);c.RAShowdown.play.setTransport(host.transport);
 const m={persona,seed,days,mode,flows:{},plays:{attempted:0,run:0,refused:0,won:0,gain:0,spent:0,byNight:[],firstRefusal:{}},layLow:{n:0,cost:0,heatBefore:0,heatAfter:0},
  trap:{housesBought:[],ingredientsSpent:0,cooks:0,cookRefused:0,casesCooked:0,casesSold:0,revenue:0,banked:0,upgradesSpent:0,levelDays:{},
   raids:{scheduled:0,held:0,answered:0,outcomes:{},stashLost:0,unbankedLost:0,holdNet:0,pendingDays:0}},
  rain:{rounds:0,spent:0},crew:{gone:0,capturedEvents:0,downedEvents:0},daily:[],invariants:[],softlock:[],errors:[]};
 const flow=(tag,d)=>{if(!d)return;m.flows[tag]=(m.flows[tag]||0)+d;};
 const act=(tag,fn)=>{const b=money(c);const out=fn();flow(tag,money(c)-b);return out;};
 const actA=async(tag,fn)=>{const b=money(c);const out=await fn();flow(tag,money(c)-b);return out;};
 const R=()=>c.RAF05;
 const q=()=>Math.round(P.quality[0]+(P.quality[1]-P.quality[0])*prng());
 let prevStatus={};

 for(let d=0;d<days;d++){
  const day=c.RALife.today().day;
  // ---- reload mid-campaign (persistence: the same life must continue identically)
  if(reloadAt!=null&&d===reloadAt){const s=saveOf(c);c=await boot(root,{seedState:s,rng});c.RAShowdown.play.setTransport(host.transport);}
  // ---- morning: COUNT THE MONEY
  if(P.countEvery&&d%P.countEvery===0&&R().sales.pending()>0){const amt=R().sales.pending();const r=act('trap:count',()=>R().sales.bank());if(r.ok)m.trap.banked+=amt;}
  // ---- a pending raid: HOLD THE HOUSE (or ignore it)
  const raid=R().raids.pending();
  if(raid){m.trap.raids.pendingDays++;
   if(P.answerRaids){const b=money(c);const out=await c.RAHoldBridge.start({origin:{app:'trap'}});const net=money(c)-b;flow('hold',net);
    if(out&&out.ok&&out.applied){m.trap.raids.answered++;m.trap.raids.holdNet+=net;const res=out.result||{};m.trap.raids.outcomes[out.canonical]=(m.trap.raids.outcomes[out.canonical]||0)+1;
     m.trap.raids.stashLost+=res.stashCases||0;m.trap.raids.unbankedLost+=res.unbankedLost||0;}
    else m.softlock.push({day,what:'hold',out:J(out)});}
  }
  // ---- WAR ROOM — through the phone app's own actions (the player's only path): 'runJob' (LAY LOW) and 'play'
  const WR=c.RAPhoneApps.get('warRoom');const api={refresh(){},message(){}};
  // a phone action that throws is recorded (the player saw the app die half-way) and the life goes on, as it would in the browser
  const tap=(what,fn)=>{try{return fn();}catch(e){m.errors.push({day,what,error:String(e.message||e).slice(0,120)});return undefined;}};
  const playLog=()=>c.RAFrag.read('F04','jobs.log',[]).filter(e=>e.via==='play');
  if(P.layLowAt!=null&&c.RAHeat.global()>=P.layLowAt){
   const reps=P.layLowSpam?8:1;
   for(let i=0;i<reps&&c.RAHeat.global()>=(P.layLowSpam?30:P.layLowAt)&&money(c)>=10000;i++){
    const idx=c.RAWarRoomJobs.buildNightMenu().findIndex(j=>j.type==='LAY_LOW');
    const h0=c.RAHeat.global(),b=money(c);act('war_room:lay_low',()=>tap('lay_low',()=>WR.onAction('runJob',String(idx),api)));
    if(money(c)===b)break;                                                     // the board refused (no slot left tonight)
    m.layLow.n++;m.layLow.cost+=b-money(c);m.layLow.heatBefore+=h0;m.layLow.heatAfter+=c.RAHeat.global();
   }
  }
  let ranTonight=0;
  for(let i=0;i<P.plays;i++){
   const menu=c.RAWarRoomJobs.buildNightMenu();const ids=menu.map((j,k)=>[j,k]).filter(([j])=>j.routesToPlay);if(!ids.length)break;
   const find=t=>ids.find(([j])=>j.type===t);
   const pick=find('EXTRACT')||find('RETALIATION')||(P.jobPref==='best'?(find('TAKE_THE_BLOCK')||ids[0]):P.jobPref==='safe'?[...ids].sort((a,b)=>(a[0].authoredHeat||0)-(b[0].authoredHeat||0))[0]:ids[0]);
   m.plays.attempted++;
   const last0=(playLog().at(-1)||{}).requestId,calls0=host.calls;   // jobs.log keeps the last 50: compare the newest entry, not the length
   await actA('war_room:play',async()=>{try{return await WR.onAction('play',String(pick[1]),api);}catch(e){m.errors.push({day,what:'play',error:String(e.message||e).slice(0,120)});}});
   if(c.RAWarRoomPlay.pending()){m.softlock.push({day,what:'play-pending'});await c.RAWarRoomPlay.resume();}
   const log=playLog();
   const ref=c.RAWarRoomPlay.lastRefusal();if(ref&&ref.day===day&&m.plays.firstRefusal[ref.code]==null)m.plays.firstRefusal[ref.code]=day;
   if(!log.length||log.at(-1).requestId===last0){m.plays.refused++;if(host.calls===calls0)m.plays.boardRefused=(m.plays.boardRefused||0)+1;break;}
   const e=log.at(-1);m.plays.run++;ranTonight++;if(e.result==='success')m.plays.won++;if(e.type==='EXTRACT')m.plays.extracts=(m.plays.extracts||0)+1;
   m.plays.gain+=Math.max(0,e.cashDelta);m.plays.spent+=Math.max(0,-e.cashDelta);
  }
  m.plays.byNight.push(ranTonight);
  // ---- THE TRAP: buy houses
  for(const h of P.houses){if(R().store.hasHouse(h))continue;const def=R().AUTHORED.houses[h];if(money(c)-def.price>=P.reserve){const r=act('trap:house',()=>R().unlock.buy(h));if(r.ok)m.trap.housesBought.push({house:h,day});}break;}
  // upgrades
  for(const u of P.upgrades){if(R().levels.hasUpgrade(u)||!R().store.ownedHouses().length)continue;const cost=Number(R().PROVISIONAL.upgradeCost[u])||0;if(money(c)-cost>=P.reserve){const r=act('trap:upgrade',()=>R().levels.buyUpgrade(u));if(r.ok)m.trap.upgradesSpent+=r.cost||0;}}
  // runner: the corner needs one (ROLES -> HIRE RUNNER, available from Level 2)
  if(R().crew.slotSummary().runner.open>0&&!R().store.crewByRole('runner').length)R().crew.recruit('runner');
  // level up (the WAKE tick also does this; the phone offers LEVEL UP)
  if(R().levels.status().eligible)R().levels.levelUp();
  // BUY BASE + COOK at every owned, cool house
  for(const h of R().store.ownedHouses()){
   if(R().production.hot(h))continue;
   const cap=R().AUTHORED.houses[h].capacity;
   const grades=R().production.unlockedGrades().filter(g=>g!=='S');
   const grade=grades.includes('A')&&P.quality[1]>=90?'A':grades.includes('B')?'B':'C';
   const base=R().production.BASE_OF[grade];
   for(let k=0;k<P.cooks;k++){
    if(R().production.capacityLeft&&R().production.capacityLeft(h)<1){m.trap.cookRefused++;break;}   // the house is done tonight: no point buying base
    const need=cap-(Number(R().production.ingredients()[base])||0);
    if(need>0&&mode==='ui'&&!R().phoneApp.house(h).includes(':buyBase:'))break;
    if(need>0){const cost=(Number(R().PROVISIONAL.ingredientCost[base])||0)*need;if(money(c)-cost<Math.min(P.reserve,20000)&&cost>0)break;
     const b=money(c);const r=act('trap:ingredients',()=>R().production.purchaseIngredients(base,need));if(r.ok)m.trap.ingredientsSpent+=b-money(c);else break;}
    const stock=()=>R().store.batches().filter(x=>x.houseId===h).reduce((n,x)=>n+x.cases,0);const s0=stock();
    tap('cook',()=>R().phoneApp.onAction('cook',`${h}|${grade}`,{refresh(){},message(){},launch:(id,params,done)=>done({quality:q()})}));
    const got=stock()-s0;if(got>0){m.trap.cooks++;m.trap.casesCooked+=got;}else{m.trap.cookRefused++;break;}
   }
  }
  // ASSIGN SALES: the most valuable ready stock, through the persona's channel (retail = the best available non-wholesale)
  {let best=null;
   for(const h of R().store.ownedHouses())for(const g of Object.keys(R().AUTHORED.grades)){const n=R().production.readyCases({houseId:h,grade:g});if(!n)continue;
    const chans=R().sales.channels().filter(ch=>ch.available&&ch.grades.includes(g));
    const ch=P.channel==='wholesale'?chans.find(x=>x.id==='wholesale'):(chans.find(x=>x.id!=='wholesale')||chans.find(x=>x.id==='wholesale'));if(!ch)continue;
    const val=n*R().production.unitPrice(g,80,{channelId:ch.id});if(!best||val>best.val)best={h,g,n,ch:ch.id,val};}
   if(best)R().sales.assign({houseId:best.h,grade:best.g,cases:best.n,channel:best.ch});}
  // ---- RAINMAKER
  if(P.rain&&d%P.rain.every===0&&money(c)>=Math.max(P.rain.minCash,P.rain.budget)){
   const b=money(c);const s=c.RAF06Rainmaker.mount({});if(s.start(P.rain.budget)){let t=1000;for(let i=0;i<40;i++){if(c.RAF06Rainmaker.state().active==null)break;const st=s.game.getState();if(st.spent>=P.rain.budget||st.remaining<=0)break;s.game.flick(t+=700);}s.game.end();m.rain.rounds++;}s.dispose();
   const spent=b-money(c);flow('rainmaker',-spent);m.rain.spent+=spent;
  }
  // ---- sleep: NIGHT (decay, sales, raid) + WAKE (timers, budget, handlers)
  const pre=money(c);const unb0=R().sales.pending();const sold0=R().levels.casesSold();const raidBefore=R().raids.pending();
  c.RAClock.sleep();
  flow('wake',money(c)-pre);
  const soldNow=R().levels.casesSold()-sold0;m.trap.casesSold+=soldNow;
  const rep=R().store.lastReport();if(soldNow&&rep)m.trap.revenue+=rep.revenue||0;
  if(!raidBefore&&R().raids.pending())m.trap.raids.scheduled++;
  // ---- daily snapshot + invariants
  const crew=c.RACrew.list({fragment:'F04'});const st={};for(const u of crew){st[u.status]=(st[u.status]||0)+1;
   if(prevStatus[u.id]&&prevStatus[u.id]!==u.status){if(u.status==='GONE')m.crew.gone++;if(u.status==='CAPTURED')m.crew.capturedEvents++;if(u.status==='DOWNED')m.crew.downedEvents++;}prevStatus[u.id]=u.status;}
  const snap={day:c.RALife.today().day,money:money(c),unbanked:R().sales.pending(),heat:c.RAHeat.global(),level:R().store.level(),houses:R().store.ownedHouses().length,crew:st,raidPending:!!R().raids.pending()};
  m.daily.push(snap);
  const bad=(k,v)=>m.invariants.push({day:snap.day,k,v});
  for(const k of ['money','unbanked','heat'])if(!Number.isFinite(snap[k])||snap[k]<0)bad(k,snap[k]);
  for(const b of R().store.batches())if(!(b.cases>0)||!Number.isFinite(b.quality))bad('batch',b);
  if(!Number.isFinite(R().levels.casesSold()))bad('casesSold',R().levels.casesSold());
  if(trace)console.log(JSON.stringify({...snap,menu:c.RAWarRoomJobs.buildNightMenu().map(j=>j.type+':'+(j.district||'')),refusal:c.RAWarRoomPlay.lastRefusal(),districts:Object.fromEntries(Object.entries(c.RAWarRoomDistricts.snapshot()).map(([k,v])=>[k,`${v.state}/${v.holder}/${v.rivalPressure}`])),f04:c.RAFrag.read('F04','offer.status',null)}));
 }
 const L=m.daily.at(-1);
 m.final={money:L.money,unbanked:L.unbanked,heat:L.heat,level:L.level,houses:L.houses,crew:L.crew,
  ogasActive:(L.crew.ACTIVE||0),ledger:J(c.RAMoneyLedger.byFamily())};
 for(const x of m.daily)if(x.level>1&&m.trap.levelDays[x.level]==null)m.trap.levelDays[x.level]=x.day;
 m.minMoney=Math.min(...m.daily.map(x=>x.money));
 m.peakHeat=Math.max(...m.daily.map(x=>x.heat));
 m.firstRaidDay=(m.daily.find(x=>x.raidPending)||{}).day||null;
 m.f01Crashes=host.crashes;
 m.digest=hash(JSON.stringify({daily:m.daily,flows:m.flows,plays:m.plays,trap:m.trap}));
 return m;
 }finally{Math.random=realMath;}
}
