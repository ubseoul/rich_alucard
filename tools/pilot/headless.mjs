// BTF TEST PILOT — shared headless control layer (Engineering 06).
// One game, one control layer: every headless mode (route proofs, coverage life simulation, surgical checks) drives
// adventures through the REAL engine calls the adventure scene makes (enter → choices → minigame/fight results →
// complete → chain). Nothing here reimplements game rules.
//
// Reachability levels (docs/engineering/BTF_TEST_PILOT_ARCHITECTURE_HANDOFF_001.md §4): anything produced by this
// module is at most DEV-REACHABLE unless the caller reached the target through the real route code (places, lanes,
// wants, wake triggers, castle rooms, chains, hub choices) from a life whose prerequisites were produced by walking.
// Every state seed must be declared through `seed()` so evidence can list it.
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';

export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','..');
const {loadBtf,walk}=await import(pathToFileURL(path.join(root,'tools','btf-test.mjs')).href);
export {loadBtf,walk};

export const labelOf=c=>String(c?.label||'').replace(/<[^>]+>/g,'');
// Small deterministic PRNG for harness policy decisions (never used by the game itself).
export function rng(seed){let s=(Number(seed)>>>0)||1;return ()=>{s=(Math.imul(s,1103515245)+12345)>>>0;return s/4294967296;};}

// Drive one adventure from its start (or a chained start) exactly as js/scenes/adventure.js does.
//  prefer: [RegExp] matched against choice labels (first match wins)
//  choose: (list,{node,id,step}) => choice — policy hook (overrides prefer when it returns a choice)
//  minigame(id,params) / fight(enemy,params) → synthetic results
export function drive(ctx,id,{vars={},prefer=[],choose=null,from='route',minigame=()=>({outcome:'win',score:1,rewards:{}}),fight=()=>({outcome:'win'}),log=[],seen=null}={}){
 const {RAAdventures}=ctx;const run=RAAdventures.start(id,{from,vars});assert(run,`${id}: could not start`);let node=run.node,steps=0;
 while(node&&steps++<400){
  const r=RAAdventures.enter(node);assert(r,`${id}: enter failed at ${node}`);const n=r.node;const C=RAAdventures.context();
  // Evaluate dynamic lines/titles exactly once per visit (content callbacks can have side effects in their reads).
  if(typeof n.lines==='function')n.lines(C);if(typeof n.title==='function')n.title(C);
  seen?.add?.(`${id}:${node}`);
  if(n.end)return RAAdventures.complete(node);
  if(n.route){C.set('route','walk');node=typeof n.route.next==='function'?n.route.next(C):n.route.next;continue}
  if(n.choices){const list=RAAdventures.choicesFor(node).filter(c=>!c.locked);if(!list.length){if(!n.next){log.push(`${id}:${node} NOT TONIGHT (every choice locked)`);RAAdventures.abandon();return {id,abandoned:true,node}}node=RAAdventures.nextOf(node);continue}
   let want=choose?.(list,{node,id,step:steps})||null;if(!want)want=prefer.map(p=>list.find(c=>p.test(labelOf(c)))).find(Boolean)||list[0];
   log.push(`${id}:${node} → ${labelOf(want)}`);node=RAAdventures.choose(node,want.index);continue}
  if(n.minigame){const params=typeof n.minigame.params==='function'?n.minigame.params(C):(n.minigame.params||{});log.push(`${id}:${node} minigame:${n.minigame.id}`);node=RAAdventures.afterMinigame(node,minigame(n.minigame.id,params));continue}
  if(n.fight){const params=typeof n.fight.params==='function'?n.fight.params(C):(n.fight.params||{});log.push(`${id}:${node} fight:${n.fight.enemy}`);node=RAAdventures.afterFight(node,fight(n.fight.enemy,params));continue}
  node=RAAdventures.nextOf(node);
 }
 throw new Error(`${id}: did not reach an end (stuck at ${node})`);
}
// Follow a completion's chain the way the adventure scene's returnHome does. A deterministic hard depth cap
// (default 10) means a cyclical or overlong authored chain terminates cleanly instead of looping forever; the last
// entry is an explicit failure sentinel carrying `chainError:'MAX_CHAIN_DEPTH'` (never a silent success).
export const DEFAULT_MAX_CHAINS=10;
export function driveChain(ctx,res,opts={}){
 const {maxChains:requested,...driveOpts}=opts;
 const maxChains=Number.isFinite(requested)?Math.max(0,Math.floor(requested)):DEFAULT_MAX_CHAINS;
 const out=[res];let depth=0;
 while(res?.chain&&ctx.RAAdventures.available(res.chain)){
  if(depth>=maxChains){const failure={id:res.chain,chainError:'MAX_CHAIN_DEPTH',message:`chain depth exceeded ${maxChains} at ${res.chain}`,maxChains,depth};out.push(failure);out.chainError=failure;return out;}
  res=drive(ctx,res.chain,{...driveOpts,vars:res.chainVars||{},from:'chain'});out.push(res);depth+=1;
 }
 return out;
}
export const chained=list=>list.slice(1).map(r=>r.id);
// Sleep through to a morning with the real clock (every wake handler runs); returns WHAT WE ON.
export function wakeTo(ctx,day){const {RAClock,RALife,RATemptations}=ctx;assert(day>=RALife.today().day,'cannot wake in the past');while(RALife.today().day<day)RAClock.sleep();return RATemptations.whatWeOn()}

// Declared seeds. PLAYER-BLIND and released legacy flows (Ogun's Rave, The Property, I Want a Supra) are exercised for
// function in the built game only; headless lives record their completion through exactly the fields those flows
// write (never their content). Every call returns an evidence row.
export const SEEDS={
 ogunsRave:{what:"Ogun's Rave completed",why:'PLAYER-BLIND flow; outcome flags only (as tools/reachability-audit.mjs)',playerBlind:true,
  apply(ctx){ctx.RAState.patch('life.world.flags.ogunsRaveCompleted',true);ctx.RAState.patch('life.world.flags.castlePartyHostingUnlocked',true);ctx.RALife.unlockApp('vampgram',{silent:true});ctx.RALegacyBridge?.bridge?.({});}},
 supra:{what:'I Want a Supra completed (Supra owned)',why:'released legacy flow; ownership fields only',
  apply(ctx){const {RALife,RACars}=ctx;if(RALife.hasCar(RACars.SUPRA))return;RALife.spend(78000);RALife.addCar({id:RACars.SUPRA,make:'Toyota',model:'Supra MK4',short:'SUPRA',price:78000,value:78000,parts:{}});ctx.RALegacyBridge?.bridge?.({});}},
 property:{what:'The Property acquired (Paloma fourplex)',why:'PLAYER-BLIND flow; ownership fields only (as tools/persona-sim.mjs)',playerBlind:true,
  apply(ctx){const {RALife,RAState}=ctx;if(RALife.flag('propertyOwned'))return;RALife.spend(34000);RAState.patch('life.ownership.properties',[...RALife.life().ownership.properties,{id:'property_la_4p_01',label:'PALOMA FOURPLEX',ownershipStatus:'owned',weeklyRent:1400,rentDue:0,purchasePrice:34000,value:34000}]);RALife.setFlag('propertyOwned',true);ctx.RALegacyBridge?.bridge?.({});}}
};
export function seed(ctx,name,ledger){const s=SEEDS[name];assert(s,`unknown seed ${name}`);s.apply(ctx);const row={seed:name,what:s.what,why:s.why,playerBlind:!!s.playerBlind,day:ctx.RALife.today().day};ledger?.push?.(row);return row;}

// Every player-facing route surface a bedroom night offers, resolved to what it would start. Read-only.
export function offers(ctx){
 const {RALife,RAPlaces,RAVampGPT,RATemptations,RAAdventures,RACastle,RARelations,RADating,RAParties}=ctx;const L=RALife.L();const out=[];
 const resolve=p=>typeof p?.adventure==='function'?p.adventure(L):p?.adventure||null;
 for(const t of RATemptations.whatWeOn())out.push({kind:'want',key:t.id,adventure:t.adventure||resolve(RAPlaces.get(t.action))||null,action:t.action||null,thread:t.thread||null});
 for(const p of RAPlaces.visible()){const def=RAPlaces.get(p.id);out.push({kind:'place',key:p.id,adventure:resolve(def),go:!!def.go});}
 for(const lane of ['money','people'])for(const o of RAVampGPT.lane(lane)){const def=RAPlaces.get(o.go);out.push({kind:`lane:${lane}`,key:o.go,adventure:null,go:true,label:o.label});}
 for(const r of RACastle.ROOMS.filter(r=>RALife.hasRoom(r.id))){const def=RAPlaces.get(r.go);const adv=resolve(def);out.push({kind:'castle',key:r.go,adventure:adv&&RAAdventures.available(adv)?adv:null,go:!!def?.go,dead:!def||(!def.go&&!(adv&&RAAdventures.available(adv)))});}
 for(const always of ['castle:throne','tacos']){const def=RAPlaces.get(always);const adv=resolve(def);out.push({kind:'castle',key:always,adventure:adv&&RAAdventures.available(adv)?adv:null,dead:!(adv&&RAAdventures.available(adv))&&!def?.go});}
 for(const p of RARelations.known({dateable:true}))if(RADating.canAsk(p.id))out.push({kind:'date',key:`date:${p.id}`,adventure:'DATE',vars:{person:p.id}});
 const party=RAParties?.next?.(L);if(party)out.push({kind:'party-lane',key:'lane:party',adventure:party});
 // Phone-app surfaces that start adventures (the button exists only when these hold).
 if(L.done('A13'))out.push({kind:'phone:touge',key:'touge:tandem',adventure:RAAdventures.available('A36')?'A36':'TANDEM_BATTLE'});
 if(ctx.RARealEstate?.shannonLane?.())for(const l of ctx.RARealEstate.LISTINGS)if(!L.life.ownership.properties.some(p=>p.id===l.id)&&RALife.money()>=l.price*.3)out.push({kind:'phone:realestate',key:`see:${l.id}`,adventure:'RE_VIEWING',vars:{listing:l.id}});
 for(const store of ['florist'])out.push({kind:'place',key:store,adventure:'SHOP',vars:{store}});
 return out;
}
