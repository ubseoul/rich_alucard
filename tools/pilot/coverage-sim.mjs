#!/usr/bin/env node
// BTF TEST PILOT — LIFE SIMULATION (headless coverage). Engineering 06.
//
// Lives whole days through the REAL route surfaces a bedroom night offers (tools/pilot/headless.mjs `offers`): the
// morning's wake adventure, WHAT WE ON wants, GO SOMEWHERE places, VampGPT lanes, ⌂ CASTLE rooms, InstaHoe dates and
// the FIND A PARTY lane; follows chains and hub choices like the adventure scene; buys rooms/cars/buildings with the
// real store functions; cares for the dragon through the HATCH reward path. Its question is not "is it fun" but
// "does everything OPEN surface through ordinary play, and does anything get stuck":
//  - never-offered adventures (starvation) and never-completed ones, per persona × seed and in aggregate;
//  - dead buttons (a castle room / place that is visible but starts nothing);
//  - errors thrown by content, active records left behind, non-finite money;
//  - repeat counts (pathological repetition) and nights with nothing new on offer.
// Declared seeds: only the PLAYER-BLIND / released legacy flows (Ogun's Rave, The Property, I Want a Supra), applied on
// the day the life would naturally reach them and listed in the report. Nothing else is set by fiat.
//
// Usage: node tools/pilot/coverage-sim.mjs [--days 60] [--seeds 1,2,3] [--personas explorer,homebody,party,landlord]
//                                          [--json out.json] [--quiet]
import {writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {loadBtf,root,drive,driveChain,offers,seed,rng,labelOf} from './headless.mjs';

const PERSONAS={
 // Takes what the world offers, prefers anything it has not done yet (the widest coverage).
 explorer:{outings:3,dates:1,rooms:['party_hall','hookah_roof','maid_quarters','kitchen','dragon_roost','movie_room','music_room','garage','armory_wall','coffin_upgrade','fish_tank'],cars:['s15','urus'],properties:true,curious:1},
 homebody:{outings:2,dates:1,rooms:['kitchen','music_room','movie_room','dragon_roost','coffin_upgrade'],cars:[],properties:false,curious:.4,lanes:['home','food','dragons','music','dating','money']},
 party:{outings:3,dates:2,rooms:['party_hall','hookah_roof','music_room'],cars:[],properties:false,curious:.5,lanes:['people','dating','music','food','combat']},
 // Saves for the Party Hall first (VOL 1 A26 → A27 Bonesworth → hosting), to measure whether hosting fits a normal life.
 host:{outings:2,dates:1,rooms:['party_hall','dragon_roost','hookah_roof','kitchen'],cars:[],properties:false,curious:.6,saveFor:'party_hall'},
 landlord:{outings:2,dates:1,rooms:['garage','armory_wall','fish_tank','party_hall','coffin_upgrade'],cars:['s15','urus','aventador'],properties:true,curious:.4,lanes:['property','cars','mall','money','home','food']}
};

export async function live(persona='explorer',{days=60,seed:runSeed=1}={}){
 const P=PERSONAS[persona];const ctx=await loadBtf(root);const {RAState,RAClock,RALife,RAAdventures,RARelations,RACastle,RARealEstate,RACars,RAFame,RAPlaces,RATemptations,RAStores}=ctx;
 const R=rng(runSeed*7919+persona.length);
 const report={persona,seed:runSeed,days:0,seeds:[],offered:{},completed:{},errors:[],dead:[],leftovers:[],stale:[],nights:[],fameDay:null};
 const firstOffer=(id,day,kind)=>{if(!id)return;const o=report.offered[id]||(report.offered[id]={first:day,count:0,kinds:{}});o.count++;o.kinds[kind]=(o.kinds[kind]||0)+1;};
 const seenChoices=new Set();
 // Choice policy: curiosity first (a label never picked), then the persona's random taste; Octopus Brain sometimes.
 const choose=list=>{const fresh=list.filter(c=>!seenChoices.has(labelOf(c)));const pick=fresh.length&&R()<P.curious?fresh[Math.floor(R()*fresh.length)]:list[Math.floor(R()*list.length)];seenChoices.add(labelOf(pick));return pick;};
 const minigame=()=>({outcome:R()<.7?'win':'lose',score:Math.round(3000+R()*40000),rewards:{money:Math.round(R()*200)}});
 const fight=()=>({outcome:R()<.62?'win':R()<.5?'spared':'lose'});
 const run=(id,vars={},kind='route')=>{
  if(!id||!RAAdventures.available(id))return false;
  try{const res=drive(ctx,id,{vars,choose,minigame,fight,from:kind});const list=driveChain(ctx,res,{choose,minigame,fight});
   for(const r of list){if(r.abandoned){report.abandoned=(report.abandoned||0)+1;continue;}report.completed[r.id]=(report.completed[r.id]||0)+1;}
   if(RAAdventures.active()){report.leftovers.push({day:RALife.today().day,id:RAAdventures.active().id});RAAdventures.abandon();}
   if(list.some(r=>r.nightEnder))return 'night';return true;}
  catch(e){report.errors.push({day:RALife.today().day,id,error:String(e.message||e).slice(0,200)});try{RAAdventures.abandon()}catch{};return false;}
 };
 RAClock.wake({first:true});RALife.setFlag('prologueDone',true);RALife.setFlag('throneDone',true);RALife.setFlag('firstWakeDone',true);
 for(let d=1;d<=days;d++){
  if(d>1){RAClock.sleep();if(RAFame.claimsWake()){report.fameDay=RALife.today().day;break;}}
  const day=RALife.today().day;report.days=day;
  // Released / PLAYER-BLIND legacy flows, on the day an ordinary life reaches them.
  if(day===2)seed(ctx,'ogunsRave',report.seeds);
  if(day===3&&(P.cars.length||persona==='explorer'||persona==='party'))seed(ctx,'supra',report.seeds);
  if(day===6&&P.properties)seed(ctx,'property',report.seeds);
  if(day===9&&!P.cars.length&&!RALife.ownedCars().length)seed(ctx,'supra',report.seeds);
  const night={day,offered:0,newOffers:0,taken:[]};
  // WAKE: the morning's adventure starts from the Morning Mail.
  const wake=ctx.RAWakeTriggers.pick();if(wake){firstOffer(wake,day,'wake');const r=run(wake,{},'wake');night.taken.push(wake);if(r==='night'){report.nights.push(night);continue;}}
  // Dragon care through the HATCH reward path (feed daily; keep the egg warm; buy treats at Pet Crypt when out).
  const dr=RALife.dragon();if(dr){if(!RALife.count('treats')&&!RALife.count('fish_common')&&RALife.money()>200){for(let i=0;i<3;i++)RAStores.buy({id:'treats',kind:'item',label:'DRAGON TREATS',price:12});}
   ctx.RALifeRewards.apply({rewards:{dragonActions:dr.stage==='egg'?[{type:'keepWarm'}]:[{type:'feed',food:RALife.count('fish_common')?'fish_common':'treats'},{type:'play'}]}});}
  // The night's offers.
  let outings=0,nightOver=false;const tried=new Set();
  for(let pass=0;pass<4&&outings<P.outings&&!nightOver;pass++){
   const list=offers(ctx);night.offered=Math.max(night.offered,list.length);
   for(const o of list){if(o.adventure)firstOffer(o.adventure,day,o.kind);if(o.dead)report.dead.push({day,kind:o.kind,key:o.key});}
   // Rank: never-completed targets first (curiosity), then persona lanes, then anything.
   const cands=list.filter(o=>o.adventure&&!tried.has(o.key)&&RAAdventures.available(o.adventure)&&!(P.saveFor&&!RALife.hasRoom(P.saveFor)&&o.kind==='phone:realestate'));
   const score=o=>{const def=RAAdventures.get(o.adventure);const neverDone=!report.completed[o.adventure];return (neverDone?2*P.curious:0)+((P.lanes||[def?.lane]).includes(def?.lane)?1:0)+(o.kind==='want'?.5:0)+R()*.8;};
   cands.sort((a,b)=>score(b)-score(a));const o=cands[0];if(!o)break;tried.add(o.key);
   if(o.kind==='want')RATemptations.take(o.key);
   const r=run(o.adventure,o.vars||{},o.kind);if(r){outings++;night.taken.push(o.adventure);if(r==='night')nightOver=true;}
  }
  night.newOffers=Object.values(report.offered).filter(x=>x.first===day).length;report.nights.push(night);
  // Purchases in the persona's style, through the real store functions.
  for(const room of P.rooms){const def=RACastle.ROOMS.find(r=>r.id===room);if(def&&!RALife.hasRoom(room)&&RALife.money()>def.price+(P.saveFor===room?5000:60000))RACastle.buy(room);if(P.saveFor&&!RALife.hasRoom(P.saveFor))break;}
  // RICHBOIMPORTS delivers the car as a scene (the phone BUY starts RB_DELIVERY).
  for(const k of P.cars)if(!RACars.owned(k)&&RALife.money()>RACars.CATALOG[k].price+80000&&RACars.buy(k)&&RACars.CATALOG[k].store==='richboi'){firstOffer('RB_DELIVERY',day,'phone:richboi');run('RB_DELIVERY',{car:k},'phone');}
  if(P.properties&&RARealEstate.shannonLane()){RARealEstate.collectAll();for(const l of RARealEstate.LISTINGS)if(RALife.money()>l.price*.3+60000)RARealEstate.buy(l.id,{down:true});}
  // Gifts for flowers (Nightshade) and the florist are a real store; the explorer keeps one on hand.
  if(persona==='explorer'&&!RALife.count('gift_flowers')&&RALife.money()>2000)RAStores.buy({id:'gift_flowers',kind:'gift',label:'LIVE FLOWERS (GIFT)',price:65});
  if(!Number.isFinite(RALife.money()))report.errors.push({day,id:'money',error:'money not finite'});
 }
 const all=RAAdventures.all().map(d=>d.id);
 for(const id of Object.keys(report.completed))if(!report.offered[id])report.offered[id]={first:null,count:0,kinds:{'hub/chain':1}};
 report.neverOffered=all.filter(id=>!report.offered[id]);report.neverCompleted=all.filter(id=>!report.completed[id]);
 report.summary={days:report.days,fameDay:report.fameDay,adventures:all.length,offered:Object.keys(report.offered).length,completed:Object.keys(report.completed).length,errors:report.errors.length,dead:[...new Set(report.dead.map(d=>d.key))],leftovers:report.leftovers.length,money:RALife.money(),followers:RALife.life().resources.followers,met:RARelations.known().length};
 return report;
}

export async function simulate({personas=Object.keys(PERSONAS),seeds=[1,2,3],days=60}={}){
 const runs=[];for(const p of personas)for(const s of seeds)runs.push(await live(p,{days,seed:s}));
 const ids=new Set(runs.flatMap(r=>Object.keys(r.offered).concat(r.neverOffered)));
 const neverOfferedAnywhere=[...ids].filter(id=>runs.every(r=>!r.offered[id])).sort();
 const neverCompletedAnywhere=[...ids].filter(id=>runs.every(r=>!r.completed[id])).sort();
 return {runs,neverOfferedAnywhere,neverCompletedAnywhere,errors:runs.flatMap(r=>r.errors.map(e=>({...e,persona:r.persona,seed:r.seed}))),dead:[...new Set(runs.flatMap(r=>r.dead.map(d=>d.key)))]};
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
 const arg=(k,d)=>{const i=process.argv.indexOf(k);return i>0?process.argv[i+1]:d};
 const out=await simulate({personas:arg('--personas',Object.keys(PERSONAS).join(',')).split(','),seeds:arg('--seeds','1,2,3').split(',').map(Number),days:Number(arg('--days',60))});
 if(!process.argv.includes('--quiet'))for(const r of out.runs)console.log(JSON.stringify({persona:r.persona,seed:r.seed,...r.summary,seeds:r.seeds.map(s=>`${s.seed}@${s.day}`)}));
 console.log('NEVER OFFERED (all runs):',out.neverOfferedAnywhere.join(' ')||'none');
 console.log('NEVER COMPLETED (all runs):',out.neverCompletedAnywhere.join(' ')||'none');
 console.log('DEAD BUTTONS:',out.dead.join(' ')||'none');
 console.log('ERRORS:',out.errors.length);for(const e of out.errors.slice(0,20))console.log(' ',JSON.stringify(e));
 const j=arg('--json',null);if(j)await writeFile(j,JSON.stringify(out,null,1));
}
