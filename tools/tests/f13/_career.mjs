// FINAL-A: fresh, route-driven OPEN careers. Player policy may vary; production values never do.
// Synthetic minigame/fight results are declared below. THE PLAY uses its real headless adapter.
import path from 'node:path';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {full} from '../if1/_lib.mjs';
import {mulberry} from './_campaign.mjs';
import {playHost} from '../F04/_lib.mjs';

const allLanes=['home','food','dragons','music','dating','money','people','combat','cars','mall','property','weird','nightlife','hosting','fishing','vampire','world','life'];
const profile=(lanes,extra={})=>({lanes,outings:3,dates:1,skill:.75,choice:'variety',reserve:20000,rooms:[],...extra});
export const CAREER_PERSONAS={
 homebody:profile(['home','food','dragons','music'],{outings:2,rooms:['kitchen','movie_room','music_room','coffin_upgrade']}),
 party:profile(['people','dating','nightlife','hosting'],{dates:2,rooms:['party_hall','hookah_roof','music_room']}),
 landlord:profile(['property','money','home','cars'],{properties:true,rooms:['garage','fish_tank'],cars:['urus','aventador']}),
 weirdo:profile(['weird','combat','dragons','world'],{choice:'octopus',outings:4,rooms:['hookah_roof','dragon_roost']}),
 trap_committed:profile(['money','people','cars'],{trap:true,plays:2,skill:.97,choice:'commit',reserve:20000,rooms:['party_hall','fish_tank'],cars:['urus','aventador']}),
 trap_careful:profile(['money','food','people','dating'],{trap:true,plays:1,skill:.9,choice:'commit',reserve:60000,rooms:['party_hall'],club:'roxy'}),
 trap_aggressive:profile(['money','combat','cars','dating'],{trap:true,plays:2,skill:.8,choice:'commit',reserve:10000,rooms:['party_hall'],f01:'greedy',club:'emerald'}),
 trap_wholesale:profile(['money','home','people','dating'],{trap:true,plays:1,channel:'wholesale',choice:'commit',reserve:40000,rooms:['party_hall'],club:'rosalyn'}),
 collector:profile(['mall','property','cars','home'],{outings:4,rooms:['fish_tank','garage','armory_wall'],cars:['urus','aventador','ferrari']}),
 musician:profile(['music','nightlife','people'],{outings:3,rooms:['music_room','party_hall']}),
 drifter:profile(['cars','money','people'],{outings:4,cars:['s15','r34','urus'],rooms:['garage']}),
 socialite:profile(['people','dating','hosting','nightlife'],{outings:4,dates:3,rooms:['party_hall','movie_room']}),
 foodie:profile(['food','people','home'],{outings:2,rooms:['kitchen']}),
 dragon_keeper:profile(['dragons','fishing','food','weird'],{choice:'octopus',rooms:['dragon_roost','kitchen']}),
 combatant:profile(['combat','weird','vampire','money'],{choice:'commit',skill:.92,rooms:['armory_wall','hookah_roof']}),
 romantic:profile(['dating','people','food'],{dates:3,rooms:['movie_room','kitchen']}),
 explorer:profile(allLanes,{outings:5,dates:2,choice:'octopus',rooms:['maid_quarters','hookah_roof','dragon_roost','party_hall']}),
 hoarder:profile(['money','home'],{outings:1,dates:0,choice:'first',reserve:1000000})
};
const hash=s=>{let h=2166136261;for(const c of s){h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;}return h;};
const J=v=>JSON.parse(JSON.stringify(v));
// Immutable-source audit workers reuse script compilation, never game state or save data.
const scriptCache=new Map();
async function run(root,context,files){for(const file of files){const absolute=path.join(root,file);let script=scriptCache.get(absolute);if(!script){script=new vm.Script(await readFile(absolute,'utf8'),{filename:file});scriptCache.set(absolute,script);}script.runInContext(context);}return context;}

export async function careerBoot(root,{seed=1,persona='explorer'}={}){
 const c=await full(root),rng=mulberry(hash(`${persona}|${seed}`));c.__careerRng=rng;vm.runInContext('Math.random=()=>__careerRng()',c);
 c.addEventListener=()=>{};c.removeEventListener=()=>{};c.RAPhone={isOpen:()=>false,refresh(){},close:async()=>{}};
 await run(root,c,['js/systems/jdm_imports.js','js/systems/property_quest.js','js/minigames/owambe_collection.js','js/minigames/hatch.js']);
 for(const id of ['F01','F02','F03','F04','F05','F06','F07','F15'])if(existsSync(path.join(root,`js/frag/${id}/migrations.js`)))await run(root,c,[`js/frag/${id}/migrations.js`]);
 // Manifest order, including the real F03 ladder and F07/F15. Migrations are already in the IF-1 harness.
 for(const id of ['F01','F02','F03','F04','F05','F06','F07','F15']){
  const m=JSON.parse(await readFile(path.join(root,`js/frag/${id}/manifest.json`),'utf8'));
  if(id==='F06'){
   c.RAMakeItRainSandbox={mount(canvas,options){const core=c.RAMakeItRainCore.create({seed});return {core,startRound:b=>core.reset({budget:b}),getState:()=>core.state(),stop(){},destroy(){},flick(t){core.beginDrag({x:.5,y:.9,t:t-250});core.dragTo({x:.5,y:.4,t:t-40});const r=core.release({x:.5,y:.2,t,vx:0,vy:-2});options.audio.onFlick(r);return r;},end(){core.advance(30000);options.onRoundEnd(core.summary());}};}};
  }
  // F06 core must precede the sandbox's first use; its renderer is unnecessary in a headless economic test.
  await run(root,c,m.files.filter(f=>!f.endsWith('/migrations.js')&&!f.endsWith('/make_it_rain.js')));
 }
 for(const f of c.RAFeatures.list())c.RAFeatures.set(f.id,true);
 await run(root,c,['js/if1/hold_bridge.js']);
 const P=CAREER_PERSONAS[persona],host=await playHost(root,{policy:P.f01||'careful'});
 const transport=req=>host.transport({...J(req),seed:hash(`${persona}|${seed}|${req.requestId}`)%90000+1000});
 c.RAShowdown.play.setTransport(transport);
 c.RAF07Play?.useTransport(transport);
 if(process.env.CAREER_PROFILE==='1'){const patch=c.RAState.patch,profile={patchCalls:0,patchMs:0};c.__saveProfile=profile;c.RAState.patch=function(...args){const t=Date.now();try{return patch.apply(this,args);}finally{profile.patchCalls++;profile.patchMs+=Date.now()-t;}};}
 return {c,rng,host};
}

// No invented economic awards. A successful minigame supplies its authored reward bundle where it exists;
// elsewhere only the success/skill result is substituted, exactly like the existing branch-walk harness.
function minigameResult(c,id,params,P,rng){
 const win=rng()<P.skill;
 const score=win?99999:1;
 if(id==='owambe_collection'){
  const logic=c.RAMinigameLogic.owambeCollection,cfg=logic.config();
  const catches=Array.from({length:Math.ceil(cfg.AUTHORED_DEBT_TARGET/cfg.BILL_VALUE)},(_,i)=>i*(win?550:80));
  const result=logic.simulateCatchSchedule(catches,cfg);
  return {outcome:result.outcome.toLowerCase(),score:result.amountCaught,data:{...result,result:result.outcome}};
 }
 if(id==='hatch'&&params?.mode==='senator'){
  const result=c.RAMinigameLogic.hatch.careOutcome(['FEED','WALK','JOKO'].map(prompt=>({prompt,success:win})));
  return {outcome:result.walked?'walked':'lost',data:result};
 }
 return {outcome:win?'win':'lose',quality:win?95:40,score,rewards:{},data:{quality:win?95:40,score},success:win};
}

export async function career(root,{persona='explorer',seed=1,maxDays=70,continueAfterEnding=false}={}){
 const P=CAREER_PERSONAS[persona];if(!P)throw new Error(`unknown persona ${persona}`);
 const {c,rng,host}=await careerBoot(root,{persona,seed});const policy=mulberry(hash(`policy|${persona}|${seed}`));
 const m={persona,seed,endingDay:null,daily:[],offered:{},completed:{},ownership:{},firstEligible:{},relationships:{},substitutions:[],errors:[],softlocks:[],warRoomFirstDay:null};
 const mark=(id,kind)=>{if(id&&c.RAAdventures.get(id)&&!m.offered[id])m.offered[id]={day:c.RALife.today().day,kind};};
 const owned=(id)=>{if(!m.ownership[id])m.ownership[id]=c.RALife.today().day;};
 let nightEnded=false;
 function pickChoice(list,node,counts,id){
  const labels=list.map(x=>String(x.label).replace(/<[^>]*>/g,''));
  const patterns=P.choice==='commit'?[/^STICK-UP$/,/^HONEST$/,/^WORK IT OFF/,/^SEND THE ADDRESS$/,/^DRIVE TO THE WAREHOUSE$/,/^KEEP DRIVING$/,/^WALK HIM IN$/,/^CALL THE BOYS/,/^COLLECT THE DEBT/,/^WALK/,/^SEND THE BOYS/,/^GIVE THE FAVORITE/,/^ACCEPT/,/^SAY LESS/,/^…SAY LESS/,/^BUY IT$/, /^HELP/,/^TAKE IT/]:[];
  for(const re of patterns){const at=labels.findIndex(x=>re.test(x));if(at>=0)return at;}
  if((counts[node]||0)>2){const exit=labels.findIndex(x=>/BACK|I.M GOOD|ENOUGH|LEAVE|GO HOME|DONE|THAT.S THE LIST|NOT TONIGHT|HEAD OUT/.test(x));if(exit>=0)return exit;}
  if(P.choice==='octopus'){const at=list.findIndex(x=>x.octopus);if(at>=0)return at;}
  if(P.choice==='first')return 0;
  return Math.floor(policy()*list.length);
 }
 async function drive(id,vars={},from='route'){
  if(!c.RAAdventures.available(id))return false;mark(id,from);const A=c.RAAdventures;
  const begin=A.start(id,{vars,from});if(!begin)return false;let node=begin.node;const counts={};
  try{
   for(let steps=0;node&&steps<180;steps++){
    counts[node]=(counts[node]||0)+1;const e=A.enter(node);if(!e)throw new Error(`missing ${node}`);const n=e.node;
    if(n.end){const out=A.complete(node);m.completed[id]=(m.completed[id]||0)+1;nightEnded||=out.nightEnder;
     if(out.chain){mark(out.chain,'chain');await drive(out.chain,out.chainVars||{},'chain');}return true;}
    if(n.route){A.context().set('route','walk');node=n.route.next;continue;}
    if(n.choices){const list=A.choicesFor(node).filter(x=>!x.locked);if(!list.length){node=A.nextOf(node);continue;}const ix=pickChoice(list,node,counts,id);node=A.choose(node,list[ix].index);continue;}
    if(n.minigame){const params=typeof n.minigame.params==='function'?n.minigame.params(A.context()):n.minigame.params;
     let result;if(n.minigame.id==='f07_play'&&c.RAF07Play){const r=await c.RAF07Play.run(params?.kind,{lanes:params?.lanes});result={outcome:r.refused?'refused':r.win?'win':'lose',data:{refused:!!r.refused,code:r.code,reason:r.reason,win:!!r.win}};}
     else result=minigameResult(c,n.minigame.id,params,P,rng);
     node=A.afterMinigame(node,result);continue;}
    if(n.fight){if(typeof n.fight.params==='function')n.fight.params(A.context());node=A.afterFight(node,{outcome:rng()<P.skill?'win':'lose'});continue;}
    node=A.nextOf(node);
   }
   throw new Error(`bounded walker at ${node}`);
  }catch(e){m.errors.push({day:c.RALife.today().day,id,error:String(e.message).slice(0,140)});A.abandon();return false;}
 }
 const api={refresh(){},message(){},close:async()=>{},go(){},begin:(id,opts)=>drive(id,opts?.vars||{},'place'),launch:(id,params,done)=>done?.(minigameResult(c,id,params,P,rng))};
 c.RAAdventureScene={begin:(id,opts={})=>drive(id,opts.vars||{},'place')};
 c.RAClock.wake({first:true});await drive('A00',{},'newgame');c.RALife.setFlag('prologueDone',true);c.RALife.setFlag('throneDone',true);
 // Recorded outcomes for released legacy surfaces are the same seam used by accepted reachability proofs.
 // They are applied only after the organic invite/prerequisite, never at the start of the save.
 async function legacy(){
  if(!c.RALife.flag('ogunsRaveCompleted')&&c.RALife.today().day>=2&&c.RALife.flag('ogunInviteWindow')&&P.outings>=2){
   c.RAWorldEvents.advanceBoundary('bedroom-entry');c.RAWorldEvents.deliver('phone');c.RAWorldEvents.see('ogun_rave_invite_001');c.RAWorldEvents.resolve('ogun_rave_invite_001','in');
   c.RALife.setFlag('ogunsRaveCompleted',true);c.RALife.setFlag('castlePartyHostingUnlocked',true);c.RALegacyBridge.bridge({ogunRave:true});m.substitutions.push({day:c.RALife.today().day,kind:'legacy-rave-recorded-outcome'});
  }
  if((P.lanes.includes('cars')||P.trap)&&!c.RACars.owned('supra')&&c.RALife.money()>=c.RAJDMImports.priceForTesting){
   c.RAState.patch('life.acquisitions.active',{id:'supra_mk4_first_collection',vehicleId:c.RAJDMImports.carId,status:'in_progress',stage:'aftermath',quotedPrice:c.RAJDMImports.priceForTesting,purchaseEventId:`vehicle-acquired:${c.RAJDMImports.carId}`});
   const result=c.RAJDMImports.computeCompletionState(c.RALife.life());
   if(result.ok){c.RAState.patch('life',result.life);c.RALegacyBridge.bridge({supraPayoff:true});owned('car:supra');m.substitutions.push({day:c.RALife.today().day,kind:'legacy-jdm-recorded-outcome',price:c.RAJDMImports.priceForTesting});}
  }
  if(P.properties&&!c.RAPropertyQuest.ownedRecord()&&c.RALife.money()>=c.RAPropertyQuest.priceCut+P.reserve){
   c.RAState.patch('life.property.active',{id:c.RAPropertyQuest.questId,propertyId:c.RAPropertyQuest.propertyId,status:'in_progress',phase:'curb_offer',firstSignChoice:'wait',ratApproach:'stand_ground'});
   if(c.RAPropertyQuest.completePurchase('cut').ok){c.RALegacyBridge.bridge({propertyAcquired:true});owned('property:paloma');m.substitutions.push({day:c.RALife.today().day,kind:'legacy-property-recorded-outcome',price:c.RAPropertyQuest.priceCut});}
  }
 }
 const places=async()=>{const out=[];for(const p of c.RAPlaces.visible()){const d=c.RAPlaces.get(p.id),id=typeof d.adventure==='function'?d.adventure(c.RALife.L()):d.adventure;if(id){mark(id,'place');out.push({id,place:p.id});}}return out;};
 async function operations(){
  if(c.RAFrag.read('F04','offer.status')==='available'&&P.plays){c.RAPhoneApps.get('warRoom').onAction('accept','',api);m.warRoomFirstDay||=c.RALife.today().day;}
  const R=c.RAF05;if(!P.trap||!R.unlock.listing().unlocked)return;
  if(R.sales.pending()>0)R.sales.bank();
  if(R.raids.pending())await c.RAHoldBridge.start({origin:{app:'trap'}});
  for(const h of ['the_bando','the_cul_de_sac','laundromat_back_room']){if(R.store.hasHouse(h))continue;if(c.RALife.money()>=R.AUTHORED.houses[h].price+P.reserve){if(R.unlock.buy(h).ok)owned(`trap:${h}`);}break;}
  if(R.levels.status().eligible)R.levels.levelUp();
  if(R.crew.slotSummary().runner.open>0&&!R.store.crewByRole('runner').length)R.crew.recruit('runner');
  for(const h of R.store.ownedHouses()){
   if(R.production.hot(h)||R.production.capacityLeft(h)<1)continue;
   const grade=R.production.unlockedGrades().includes('A')?'A':R.production.unlockedGrades().includes('B')?'B':'C',base=R.production.BASE_OF[grade],cap=R.AUTHORED.houses[h].capacity;
   const need=cap-(Number(R.production.ingredients()[base])||0),cost=(Number(R.PROVISIONAL.ingredientCost[base])||0)*need;
   if(need>0){if(c.RALife.money()<cost+Math.min(P.reserve,20000))continue;if(!R.production.purchaseIngredients(base,need).ok)continue;}
   R.phoneApp.onAction('cook',`${h}|${grade}`,{...api,launch:(id,params,done)=>done({quality:Math.round(60+P.skill*35)})});
   for(const g of Object.keys(R.AUTHORED.grades)){const n=R.production.readyCases({houseId:h,grade:g});if(!n)continue;const channels=R.sales.channels().filter(x=>x.available&&x.grades.includes(g)),ch=P.channel==='wholesale'?channels.find(x=>x.id==='wholesale'):channels.find(x=>x.id!=='wholesale')||channels[0];if(ch)R.sales.assign({houseId:h,grade:g,cases:n,channel:ch.id});}
  }
  if(c.RAFrag.read('F04','active',false))for(let i=0;i<(P.plays||0);i++){
   const menu=c.RAWarRoomJobs.buildNightMenu(),ix=menu.findIndex(x=>x.type==='EXTRACT');const pick=ix>=0?ix:menu.findIndex(x=>x.routesToPlay);if(pick<0)break;
   await c.RAPhoneApps.get('warRoom').onAction('play',String(pick),api);
   if(c.RAWarRoomPlay.pending()){m.softlocks.push({day:c.RALife.today().day,kind:'pending-play'});await c.RAWarRoomPlay.resume();}
  }
  if(P.club&&c.RALife.appUnlocked('rainmaker')&&c.RAF15.spent(P.club)<c.RAF15.thresholds().at(-1)&&c.RALife.money()>=25000+P.reserve){
   c.RAF15.select(P.club);
   const session=c.RAF06Rainmaker.mount({}, {onSpend:({delta})=>{c.RAF15.recordSpend(P.club,delta);c.RAF15Dates.offer(P.club);}});
   if(session.start(25000)){let t=1000;for(let i=0;i<250;i++){const st=session.game.getState();if(st.remaining<=0||st.spent>=25000)break;session.game.flick(t+=700);}session.game.end();}session.dispose();
  }
 }
 for(let d=0;d<maxDays;d++){
  const day=c.RALife.today().day;nightEnded=false;await legacy();
  if(process.env.CAREER_TRACE==='1')console.log(`${persona}/${seed} day ${day}`);
  const wake=c.RAWakeTriggers.pick();if(wake){mark(wake,'wake');await drive(wake,{},'wake');}
  const wants=c.RATemptations.whatWeOn();for(const t of wants){if(t.adventure)mark(t.adventure,'want');}
  const visits=await places();
  let outings=0;
  for(const t of wants){if(nightEnded||outings>=P.outings)break;const def=c.RAAdventures.get(t.adventure);if(def&&!P.lanes.includes(def.lane)&&policy()>.3)continue;c.RATemptations.take(t.id);if(t.adventure){if(await drive(t.adventure,{},'want'))outings++;}else if(t.action){await c.RAPlaces.go(t.action,api);outings++;}}
  // Browse actual lane pages as well as GO SOMEWHERE. Captures the currently capped list only.
  for(const lane of ['money','people']){for(const option of c.RAVampGPT.lane(lane)){
   if(nightEnded||outings>=P.outings)break;let target=null;const prev=c.RAAdventureScene;c.RAAdventureScene={begin:async(id,opts={})=>{target=id;mark(id,'lane');return drive(id,opts.vars||{},'lane');}};
   if(P.lanes.includes(lane)&&policy()<.45){await c.RAPlaces.go(option.go,api);if(target)outings++;}c.RAAdventureScene=prev;
  }}
  const ordered=visits.map(v=>({...v,score:(P.lanes.includes(c.RAAdventures.get(v.id)?.lane)?2:0)+(!m.completed[v.id]?1:0)+policy()})).sort((a,b)=>b.score-a.score);
  for(const v of ordered){if(nightEnded||outings>=P.outings)break;if(!P.lanes.includes(c.RAAdventures.get(v.id)?.lane)&&policy()>.2)continue;if(await drive(v.id,{},'place'))outings++;}
  if(!nightEnded)for(const r of c.RARelations.known({dateable:true}).sort((a,b)=>(m.relationships[a.id]?.dates||0)-(m.relationships[b.id]?.dates||0)).slice(0,P.dates))if(c.RARelations.canDate(r.id)){mark('DATE','date');await drive('DATE',{person:r.id},'date');}
  await operations();
  if(P.properties){c.RAPropertyQuest.collectRent();c.RARealEstate.collectAll();}
  for(const room of P.rooms){const def=c.RACastle.ROOMS.find(x=>x.id===room);if(!def||c.RALife.hasRoom(room))continue;if(!def.needs||def.needs(c.RALife.L())){if(c.RALife.money()>=def.price)m.firstEligible[`room:${room}`]||=day;if(c.RALife.money()>=def.price+P.reserve&&c.RACastle.buy(room))owned(`room:${room}`);}break;}
  for(const key of P.cars||[]){const def=c.RACars.CATALOG[key];if(c.RACars.owned(key))continue;const unlocked=def.store==='richboi'?c.RALife.appUnlocked('richboi'):def.store==='jdm_auction'?c.RALife.flag('r34Lead'):def.store==='pinky'?c.RALife.flag('pinkyMet'):c.RACars.owned('supra');if(!unlocked||def.needsRep&&c.RALife.rep()<def.needsRep)break;if(c.RALife.money()>=def.price)m.firstEligible[`car:${key}`]||=day;if(c.RALife.money()>=def.price+P.reserve&&c.RACars.buy(key)){owned(`car:${key}`);if(def.store==='richboi')await drive('RB_DELIVERY',{car:key},'delivery');}break;}
  if(!nightEnded&&outings<P.outings)for(const room of c.RACastle.ROOMS.filter(x=>c.RALife.hasRoom(x.id))){const p=c.RAPlaces.get(room.go),id=p&&(typeof p.adventure==='function'?p.adventure(c.RALife.L()):p.adventure);if(id)mark(id,'owned-room');if(id&&!m.completed[id]&&await drive(id,{},'owned-room')){outings++;break;}}
  // Separate continuation route census: exercise the actual hidden room verbs, including custom go handlers.
  // It never changes a main first-ending career or grants a room/adventure/dragon stage.
  if(continueAfterEnding&&m.endingDay){
   if(P.lanes.includes('dragons')&&c.RADragon.get()){
    const dr=c.RADragon.get();
    if(dr.stage==='egg')c.RADragon.applyActions([{type:'keepWarm'}]);
    else{let food=c.RALife.count('fish_common')?'fish_common':c.RALife.count('treats')?'treats':null;
     if(!food&&c.RALife.money()>P.reserve){const item=c.RAStores.STORES.pet_crypt.items.find(x=>x.id==='treats');if(c.RAStores.buy(item))food='treats';}
     c.RADragon.applyActions([...(food?[{type:'feed',food}]:[]),{type:'play'},{type:'talk'}]);
    }
   }
   if(!nightEnded)for(const room of c.RACastle.ROOMS.filter(x=>c.RALife.hasRoom(x.id))){
    const prev=c.RAAdventureScene,begin=(id,opts={})=>m.completed[id]?false:drive(id,opts.vars||{},'post-ending-owned-room');c.RAAdventureScene={begin};
    await c.RAPlaces.go(room.go,{...api,begin});c.RAAdventureScene=prev;
    if(nightEnded)break;
   }
  }
  for(const r of c.RARelations.known()){const prev=m.relationships[r.id]||{};m.relationships[r.id]={level:Math.max(prev.level||0,r.level),dates:r.datesCount||0,firstClose:prev.firstClose||(r.level>=3?day:null),firstRide:prev.firstRide||(r.level>=4?day:null)};}
  m.daily.push({day,money:c.RALife.money(),netWorth:c.RALife.netWorth(),rooms:c.RACastle.ROOMS.filter(x=>c.RALife.hasRoom(x.id)).length,cars:c.RALife.ownedCars().length,offered:Object.keys(m.offered).length,completed:Object.keys(m.completed).length,warRoom:c.RAFrag.read('F04','offer.status'),trapHouses:c.RAF05.store.ownedHouses().length,newOgaRank:c.RANewOga.current().rank});
  c.RAClock.sleep();if(c.RAFame.claimsWake()){m.endingDay||=c.RALife.today().day;if(!continueAfterEnding)break;
   // Run the actual ending state and actual next-morning callback. Only the DOM and presentation waits are substituted.
   const savedQuery=c.document.querySelector,savedCreate=c.document.createElement,savedTimeout=c.setTimeout;let nextMorning;
   const ending={className:'',classList:{add(){},remove(){}},remove(){},set innerHTML(v){},querySelector:()=>({addEventListener:(type,fn)=>{if(type==='click')nextMorning=fn;}})};
   c.document.querySelector=s=>s==='#screen'?{append(){}}:savedQuery(s);c.document.createElement=()=>ending;c.setTimeout=(fn)=>{fn();return 0;};
   await c.RAFame.play();c.document.querySelector=savedQuery;c.document.createElement=savedCreate;c.setTimeout=savedTimeout;nextMorning?.();m.substitutions.push({day:m.endingDay,kind:'ending-presentation-only-dom-and-timer-stub'});
  }
 }
 m.final={day:c.RALife.today().day,money:c.RALife.money(),netWorth:c.RALife.netWorth(),fameEligible:c.RAFame.claimsWake(),warRoom:c.RAFrag.read('F04','offer.status'),newOga:J(c.RANewOga.current()),crew:c.RACrew.list({fragment:'F04'}).filter(x=>x.status!=='GONE').length,playCalls:host.calls};
 m.openIds=c.RAAdventures.all().map(x=>x.id).sort();
 if(c.__saveProfile)m.profile=c.__saveProfile;
 return m;
}
