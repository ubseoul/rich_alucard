// RC2 · BUILD 1 — economy short sim. 9 personas x seeds x days on FRESH lives (Day 1, $100,000, intro done), plus the scripted "follows VampGPT"
// persona, which only ever taps what RAGuidance.next() says. Boots the REAL production runtime (tools/tests/f13/_campaign.mjs boot) with the
// shipped flag defaults, drives the REAL F01 PLAY engine through the War Room phone app's own actions, and the REAL MAKE IT RAIN production
// adapter (the approved pure core generates the bills). Nothing in the game is changed here.
//   node tools/rc2/econ-sim.mjs [--days 36] [--seeds 3] [--only follower,normal] [--json out.json] [--econ-override '{"rent":...}']
import path from 'node:path';
import vm from 'node:vm';
import fs from 'node:fs';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','..');
const url=f=>pathToFileURL(path.join(root,f)).href;
const {mulberry}=await import(url('tools/tests/f13/_campaign.mjs'));
const {careerBoot}=await import(url('tools/tests/f13/_career.mjs'));   // the FULL production load: F01-F07 + F15, every flag ON (OL-068)
const {read}=await import(url('tools/tests/if1/_lib.mjs'));
const {drive,SEEDS}=await import(url('tools/pilot/headless.mjs'));
const arg=(n,d)=>{const i=process.argv.indexOf(n);return i<0?d:process.argv[i+1];};
const START=arg('--start',null),NIGHT=arg('--night','a'),RENT=arg('--rent','daily'),PAYSCALE=Number(arg('--payscale',1)),HALL=arg('--hall',null),CLUB=arg('--club','a'),DAYS=Number(arg('--days',36)),SEEDS_N=Number(arg('--seeds',3)),ONLY=(arg('--only','')||'').split(',').filter(Boolean),OUT=arg('--json',null);
const DAYJOB={typical:150,ceiling:280};      // one full SLURP shift: ~10-14 perfect bowls at $6 + $2-10 tip (js/minigames/slurp.js); ceiling = every order served at once

const hash=s=>{let h=2166136261;for(const ch of String(s)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)>>>0;}return h;};
// the F01 PLAY engine as a headless host, seeded per campaign seed (as tools/tests/f13/_campaign.mjs playHostFor)
async function playHostFor(seed,policy){
 await import(url('tools/tests/f01/play-sim/globals.mjs'));
 if(!globalThis.RAPlayContract)vm.runInThisContext(await read(root,'js/frag/F01/play_contract.js'));
 const {makeDriver}=await import(url('tools/tests/f01/play-sim/driver.mjs'));
 const AD=await import(url('js/frag/F01/play/adapter.mjs'));
 if(PAYSCALE!==1){const CT=await import(url('js/frag/F01/play/content.mjs'));if(!CT.JOBS.__scaled){for(const j of CT.JOBS){j.band=[j.band[0]*PAYSCALE,j.band[1]*PAYSCALE];}CT.JOBS.__scaled=true;}}
 const host={saved:null,cache:new Map(),calls:0,crashes:[],results:[],
  transport(req){
   const plain=JSON.parse(JSON.stringify(req));
   if(host.cache.has(plain.requestId))return JSON.parse(JSON.stringify(host.cache.get(plain.requestId)));
   plain.seed=(hash(`${seed}|${plain.requestId}`)%90000)+1000;host.calls++;
   let r;try{r=AD.runHeadless(plain,makeDriver(policy),host.saved);}catch(e){host.crashes.push(String(e.message||e).slice(0,100));return {schema:globalThis.RAPlayContract.RESULT_SCHEMA,version:globalThis.RAPlayContract.VERSION,requestId:plain.requestId,status:'REFUSED',code:'CRASH',reason:'crash',errors:[],cash:{gain:0,spent:0}};}
   if(r.result.status==='COMPLETE'||r.result.status==='DECLINED'){host.cache.set(plain.requestId,r.result);if(r.result.status==='COMPLETE')host.saved=r.world;}
   host.results.push({job:plain.job.f01JobId,type:plain.job.f04Type,day:plain.day,status:r.result.status,win:r.result.outcome?.win,gain:r.result.cash?.gain||0,spent:r.result.cash?.spent||0,crew:(r.result.crew||[]).map(c=>c.after),big:/counting_house/.test(plain.job.f01JobId)});
   return JSON.parse(JSON.stringify(r.result));
  }};
 return host;
}

// ---- personas: BEHAVIOUR only (what a person taps), never a game value -----------------------------------------------------------
//  f01 PLAY policy · plays/night · jobPref · shifts SLURP shifts/day · club {every N days, budget} · buy [properties, rooms] when cash allows (reserve kept)
export const PERSONAS={
 follower:   {script:true,f01:'naive'},
 followerStrong:{script:true,f01:'careful'},
 normal:     {trap:{houses:['the_bando','the_cul_de_sac'],reserve:60000},f01:'careful',plays:1,jobPref:'first',shifts:0,club:{every:4,budget:10000},buy:['property','room'],reserve:60000},
 aggressive: {trap:{houses:['the_bando','the_cul_de_sac','laundromat_back_room'],reserve:10000},f01:'greedy',plays:2,jobPref:'best',shifts:0,club:{every:7,budget:10000},buy:['room'],reserve:20000},
 conservative:{f01:'careful',plays:1,jobPref:'safe',shifts:0,club:null,buy:['property'],reserve:120000},
 loser:      {trap:{houses:['the_bando'],reserve:20000},f01:'random',plays:1,jobPref:'first',shifts:1,club:{every:2,budget:5000},buy:[],reserve:10000},
 winner:     {trap:{houses:['the_bando','the_cul_de_sac','laundromat_back_room'],reserve:30000},f01:'careful',plays:2,jobPref:'best',shifts:0,club:{every:3,budget:10000},buy:['property','room'],reserve:50000},
 spender:    {f01:'careful',plays:1,jobPref:'first',shifts:0,club:{every:1,budget:25000},buy:['room'],reserve:0},
 hoarder:    {f01:'careful',plays:1,jobPref:'safe',shifts:0,club:null,buy:[],reserve:1e12},
 landlord:   {f01:'careful',plays:1,jobPref:'first',shifts:0,club:{every:2,budget:10000},buy:['property'],reserve:50000},
 jobber:     {f01:'careful',plays:0,jobPref:'safe',shifts:1,club:{every:5,budget:5000},buy:[],reserve:20000,noWar:true}
};

export async function simulate(name,seed,{days=DAYS,econ=null}={}){
 const P=PERSONAS[name];const rng=mulberry(hash(`${name}|${seed}`));
 const realMath=Math.random;Math.random=rng;
 try{
 const {c}=await careerBoot(root,{seed,persona:'explorer'});   // all first-release features ON
 if(HALL)c.RACastle.ROOMS.find(r=>r.id==='party_hall').price=Number(HALL);
 if(RENT==='weekly'){const e=JSON.parse(JSON.stringify(c.RAEcon));e.rent.daily=false;c.RAEcon=e;}   // the pre-RC2 rule: weekly rent accrues on Fridays (collected here every morning: the kindest baseline)
 const host=await playHostFor(seed,P.f01);c.RAShowdown.play.setTransport(host.transport);
 // fresh life: the intro (A00 prologue -> throne -> first wake) is the newgame flow, already resolved when the phone first opens
 c.RAClock.wake({first:true});for(const f of ['prologueDone','throneDone','firstWakeDone'])c.RALife.setFlag(f,true);
 if(START)c.RAState.patch('life.resources.money',Number(START));
 const money=()=>c.RALife.money();
 const api={refresh(){},message(){},close:async()=>true,begin:async()=>false,launch:async()=>({})};
 const m={persona:name,seed,days,daily:[],firstPlayDay:null,offerAcceptDay:null,plays:0,playWins:0,playGain:0,playSpent:0,captured:0,gone:0,clubNights:0,clubSpent:0,shifts:0,
  rentGross:0,rentNet:0,propsBought:[],roomsBought:[],partyHallDay:null,introDay:null,minMoney:1e12,money7:null,errors:[],seeded:[],steps:[],cheap:[]};
 const drv=(id,minigame)=>{try{return drive(c,id,{minigame:minigame||((mid,params)=>({outcome:'done',score:1,rewards:mid==='slurp'?{money:DAYJOB.typical}:{}}))});}catch(e){m.errors.push(`${id}: ${String(e.message||e).slice(0,90)}`);try{c.RAAdventures.abandon();}catch(x){}return null;}};
 const WR=()=>c.RAPhoneApps.get('warRoom');
 const playOne=async pref=>{
  const J=c.RAWarRoomJobs,menu=J.buildNightMenu(),ids=menu.map((j,k)=>[j,k]).filter(([j])=>j.routesToPlay);if(!ids.length)return false;
  const find=t=>ids.find(([j])=>j.type===t);
  const pick=find('EXTRACT')||find('RETALIATION')||(pref==='best'?(find('TAKE_THE_BLOCK')||ids[0]):pref==='safe'?[...ids].sort((a,b)=>(a[0].authoredHeat||0)-(b[0].authoredHeat||0))[0]:ids[0]);
  const n0=host.results.length;
  try{await WR().onAction('play',String(pick[1]),api);}catch(e){m.errors.push(`play: ${String(e.message||e).slice(0,90)}`);}
  if(c.RAWarRoomPlay.pending())await c.RAWarRoomPlay.resume();
  const r=host.results[host.results.length-1];if(host.results.length===n0||!r||r.status!=='COMPLETE')return false;
  m.plays++;if(r.win)m.playWins++;m.playGain+=r.gain;m.playSpent+=r.spent;if(m.firstPlayDay==null)m.firstPlayDay=c.RALife.today().day;
  for(const a of r.crew){if(a==='CAPTURED')m.captured++;if(a==='GONE'||a==='DEAD')m.gone++;}
  return true;
 };
 const acceptOffer=()=>{const o=c.RAFrag.read('F04','offer',{});if(o.status==='available'&&!c.RAFrag.read('F04','active',false)){WR().onAction('accept','',api);if(m.offerAcceptDay==null)m.offerAcceptDay=c.RALife.today().day;return true;}return false;};
 const club=async (budget,rounds=1)=>{
  if(!c.RAStripClub?.isOpen())return false;const terms=c.RAStripClub.terms();const b0=money();
  const s=c.RAF06Rainmaker.mount({},{terms});let ok=false;
  try{for(let r=0;r<rounds;r++){const okr=s.start(budget);if(!okr)break;ok=true;let t=1000;for(let i=0;i<60;i++){if(c.RAF06Rainmaker.state().active==null)break;const st=s.game.getState();if(st.remaining<=0)break;s.game.flick(t+=700);}s.game.end();}}finally{s.dispose();}
  c.RALife.setFlag('stripClubLastDay',c.RALife.today().day);
  const spent=b0-money();if(spent>0){m.clubNights++;m.clubSpent+=spent;if(m.firstClub==null)m.firstClub={day:c.RALife.today().day,cashBefore:b0,spent,first:terms.first,capHeld:!terms.first||spent<=Math.floor(b0*c.RAEcon.stripClub.firstVisit.capShare)+1};}
  return spent>0;
 };
 // RealMoneyRealEstate: the Paloma fourplex first (it opens Shannon's financing), then listings with the 30% down payment, cheapest first
 const buyProperty=()=>{const R=c.RARealEstate,own=id=>c.RALife.life().ownership.properties.some(p=>p.id===id);
  if(!own('property_la_4p_01')){if(money()>=34000+(P.reserve||0)){SEEDS.property.apply(c);c.RAPropertyQuest=c.RAPropertyQuest||{propertyId:'property_la_4p_01'};m.seeded.push({what:'property',day:c.RALife.today().day});m.propsBought.push({id:'property_la_4p_01',day:c.RALife.today().day});return true;}return false;}
  for(const l of R.LISTINGS){if(own(l.id))continue;if(money()>=l.price*.3+(P.reserve||0)&&R.buy(l.id,{down:true})){m.propsBought.push({id:l.id,day:c.RALife.today().day});return true;}break;}return false;};
 const buyRoom=()=>{for(const r of [...c.RACastle.ROOMS].sort((a,b)=>a.price-b.price)){if(c.RALife.hasRoom(r.id))continue;if(r.needs&&!r.needs(c.RALife.L()))continue;if(money()>=r.price+(P.reserve||0)&&c.RACastle.buy(r.id)){m.roomsBought.push({id:r.id,day:c.RALife.today().day});if(r.id==='party_hall'&&m.partyHallDay==null)m.partyHallDay=c.RALife.today().day;return true;}break;}return false;};
 // THE TRAP, through the same calls the phone app makes (as tools/tests/f13/_campaign.mjs): bank, hold a raid, buy a house, buy base, cook, assign sales
 const trapDay=async()=>{const R=c.RAF05;if(!R||!P.trap)return;
  try{
   if(R.raids.pending())await c.RAHoldBridge.start({origin:{app:'trap'}});
   if(R.sales.pending()>0){const a=R.sales.pending();const r=R.sales.bank();if(r&&r.ok)m.trapBanked=(m.trapBanked||0)+a;}
   for(const h of P.trap.houses){if(R.store.hasHouse(h))continue;const def=R.AUTHORED.houses[h];if(money()-def.price>=P.trap.reserve){const r=R.unlock.buy(h);if(r&&r.ok){(m.trapHouses=m.trapHouses||[]).push({h,day:c.RALife.today().day});}}break;}
   if(R.crew.slotSummary().runner.open>0&&!R.store.crewByRole('runner').length)R.crew.recruit('runner');
   if(R.levels.status().eligible)R.levels.levelUp();
   for(const h of R.store.ownedHouses()){if(R.production.hot(h))continue;const cap=R.AUTHORED.houses[h].capacity;const grades=R.production.unlockedGrades().filter(g=>g!=='S');const grade=grades.includes('B')?'B':'C';const base=R.production.BASE_OF[grade];
    const need=cap-(Number(R.production.ingredients()[base])||0);if(need>0){const cost=(Number(R.PROVISIONAL.ingredientCost[base])||0)*need;if(money()-cost<20000)continue;R.production.purchaseIngredients(base,need);}
    R.phoneApp.onAction('cook',h+'|'+grade,{refresh(){},message(){},launch:(id,params,done)=>done({quality:80})});}
   let best=null;for(const h of R.store.ownedHouses())for(const g of Object.keys(R.AUTHORED.grades)){const n=R.production.readyCases({houseId:h,grade:g});if(!n)continue;const chans=R.sales.channels().filter(ch=>ch.available&&ch.grades.includes(g));const ch=chans.find(x=>x.id!=='wholesale')||chans.find(x=>x.id==='wholesale');if(!ch)continue;const val=n*R.production.unitPrice(g,80,{channelId:ch.id});if(!best||val>best.val)best={h,g,n,ch:ch.id,val};}
   if(best)R.sales.assign({houseId:best.h,grade:best.g,cases:best.n,channel:best.ch});
  }catch(e){m.errors.push('trap: '+String(e.message||e).slice(0,80));}
 };
 const seedRave=()=>{if(!c.RALife.flag('ogunsRaveCompleted')){SEEDS.ogunsRave.apply(c);m.seeded.push({what:'ogunsRave',day:c.RALife.today().day});}};

 for(let d=0;d<days;d++){
  const day=c.RALife.today().day;
  // story interruptions at WAKE (a VampGPT wake scene, a new Oga mission, ...)
  try{const w=c.RAWakeTriggers.pick();if(w)drv(w);}catch(e){m.errors.push(`wake: ${String(e.message||e).slice(0,90)}`);}
  if(P.script){
   const done=new Set();
   // opening the phone delivers INCOMING events; the follower answers each with its first button (the phone's own priority-one card)
   c.RAWorldEvents.deliver('phone');for(const e of c.RAWorldEvents.pending('phone'))c.RAWorldEvents.resolve(e.id,e.actions[0].id);
   // the follower works down VampGPT's RECOMMENDED list, top to bottom, one tap per line per day (a line that reappears with a new key counts again)
   for(let i=0;i<16;i++){
    const g=c.RAGuidance.recommended(6).find(it=>!done.has(it.key));if(!g)break;done.add(g.key);m.steps.push(`${day}:${g.id}`);
    if(i===0&&c.RAGuidance.recommended(1)[0].kind!=='story'&&c.RAGuidance.recommended(1)[0].kind!=='cash')m.errors.push(`day ${day}: first RECOMMENDED was ${c.RAGuidance.recommended(1)[0].kind}`);
    const a=g.action;
    if(g.kind==='rest'||a==='close')break;
    if(a==='app:vampgpt'){c.RAGuidance.opened('vampgpt');}
    else if(a==='go:tacos'){const b=money();drv('TACOS');}
    else if(a==='app:warRoom'){acceptOffer();}
    else if(a==='app:warRoom:jobs'){await playOne('first');}
    else if(a==='go:lane:slurp'){m.shifts++;drv(c.RAAdventures.available('SLURP')?'SLURP':'A08');}
    else if(a==='ogun_rave'){seedRave();}
    else if(a==='app:realEstate'&&g.id==='room'){const r=c.RACastle.ROOMS.filter(r=>r.id!=='party_hall'&&!c.RALife.hasRoom(r.id)).sort((x,y)=>x.price-y.price).find(r=>g.sub===c.RALife.fmt(r.price));if(r&&c.RACastle.buy(r.id))m.roomsBought.push({id:r.id,day:c.RALife.today().day});}
    else if(a==='app:realEstate'){if(c.RACastle.buy('party_hall')&&m.partyHallDay==null){m.partyHallDay=c.RALife.today().day;m.roomsBought.push({id:'party_hall',day:m.partyHallDay});}}
    else if(a==='app:stripClub'){const cash=money();if(NIGHT==='q'){const first=!c.RAStripClub.firstVisitDone();const pick=cash=>cash>=150000?25000:cash>=50000?10000:5000;if(first){await club(25000,4);}else await club(pick(cash));}else{await club(CLUB==='lit'?10000:CLUB==='b'?(cash>=200000?25000:cash>=100000?25000:cash>=30000?10000:5000):(cash>=100000?25000:cash>=30000?10000:5000));if(CLUB==='b'&&money()>=200000)await club(25000);}}
    else m.errors.push(`unmapped action ${a}`);
    c.RAGuidance.opened(g.app||'');
    if(m.introDay==null&&!c.RAGuidance.story().some(s=>['vampgpt','meal'].includes(s.id)))m.introDay=c.RALife.today().day;
   }
  }else{
   acceptOffer.call(null);
   if(P.noWar){/* jobber never takes the offer */}
   for(let i=0;i<(P.plays||0);i++){if(!c.RAFrag.read('F04','active',false))break;if(!await playOne(P.jobPref))break;}
   await trapDay();
   for(let i=0;i<(P.shifts||0);i++){m.shifts++;drv(c.RAAdventures.available('SLURP')?'SLURP':'A08');}
   if(P.club&&d%P.club.every===0&&money()>=P.club.budget+10000)await club(P.club.budget);
   for(const k of P.buy||[]){if(k==='property')buyProperty();if(k==='room'){if(c.RALife.flag('ogunsRaveCompleted')===undefined&&day>=12)seedRave();buyRoom();}}
  }
  // the follower eats at the tacos on Day 1: record a cheap-buy payoff when one fires
  m.minMoney=Math.min(m.minMoney,money());
  const pre=money();c.RAClock.sleep();if(RENT==='weekly')m.rentNet+=c.RARealEstate.collectAll();
  const rent=c.RALife.life().world.flags.lastRentIn;if(rent&&rent.day===c.RALife.today().day){m.rentGross+=rent.gross;m.rentNet+=rent.net;}
  if(P.script){if(c.RALife.life().ownership.properties.length===0&&false){}}
  {const lr=c.RALife.life().world.flags.lastRentIn;if(lr&&lr.day===c.RALife.today().day)m.rentPerDay=lr.net;}
  if(c.RALife.today().day===8&&m.money7==null)m.money7=pre;
  if(day===7)m.money7=money();
  m.daily.push({day:c.RALife.today().day,money:money()});
 }
 if(P.script){const ev=c.RAState.get().life.events?.records||{};m.cheap=Object.keys(c.RAState.get().life.world.flags).filter(k=>/^cheapBuy/.test(k));}
 m.final={money:money(),netWorth:c.RALife.netWorth(),props:c.RALife.life().ownership.properties.length,rooms:(c.RALife.life().ownership.castleRooms||[]).length,ogas:c.RACrew.list({fragment:'F04'}).filter(u=>u.status==='ACTIVE').length};
 m.playBands={};
 for(const r of host.results){const k=r.big?'BIG':r.job==='hold_the_house'?'HOLD':'ROUTINE';const b=m.playBands[k]=m.playBands[k]||{n:0,captured:0,wins:0,gain:0};b.n++;if(r.crew.includes('CAPTURED'))b.captured++;if(r.win)b.wins++;b.gain+=r.gain;}
 m.playGains=host.results.filter(r=>r.status==='COMPLETE'&&r.win).map(r=>({gain:r.gain,big:r.big}));
 m.crashes=host.crashes.length;
 return m;
 }finally{Math.random=realMath;}
}

const pct=(n,d)=>d?`${(100*n/d).toFixed(1)}%`:'-';
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const names=ONLY.length?ONLY:Object.keys(PERSONAS);const rows=[];
 for(const name of names)for(let s=1;s<=SEEDS_N;s++){const t0=Date.now();const m=await simulate(name,s);rows.push(m);
  console.log(`${name.padEnd(12)} s${s} firstPlay D${m.firstPlayDay} accept D${m.offerAcceptDay} plays ${m.plays} (win ${m.playWins}) cap ${m.captured} gone ${m.gone} | money D7 ${m.money7} min ${m.minMoney} final ${m.final.money} NW ${m.final.netWorth} | club ${m.clubNights} nights $${m.clubSpent} | rent net ${m.rentNet} | props ${m.final.props} rooms ${m.final.rooms} partyHall D${m.partyHallDay} intro D${m.introDay} err ${m.errors.length} (${((Date.now()-t0)/1000).toFixed(0)}s)`);
 }
 if(OUT)fs.writeFileSync(OUT,JSON.stringify(rows,null,1));
}
