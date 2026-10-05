// Persona simulation (VOL 1 §5.3): each persona lives whole days headlessly — acting on wants, repeatables,
// dates and purchases in their own style — until the protected ending fires. Evidence for pacing, not feel.
import path from 'node:path';import {fileURLToPath,pathToFileURL} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const {loadBtf,walk}=await import(pathToFileURL(path.join(root,'tools','btf-test.mjs')).href);
const PERSONAS={
 homebody:{lanes:['home','food','dragons','music','dating','money'],buys:['kitchen','music_room','movie_room','dragon_roost','coffin_upgrade'],outings:2,dates:1},
 party:{lanes:['people','dating','music','food','combat'],buys:['party_hall','hookah_roof','music_room'],outings:3,dates:2},
 landlord:{lanes:['property','cars','mall','money','home','food'],buys:['garage','armory_wall','fish_tank','party_hall','coffin_upgrade'],outings:2,dates:1,properties:true,cars:['s15','urus','aventador']},
 weirdo:{lanes:['combat','dragons','food','life','world','home','people'],buys:['hookah_roof','dragon_roost','armory_wall'],outings:3,dates:1}
};
export async function simulate(name,{maxDays=70,seed=1,log=false}={}){
 const P=PERSONAS[name];const ctx=await loadBtf(root);const {RAState,RAClock,RALife,RAAdventures,RATemptations,RAWakeTriggers,RAPlaces,RARelations,RACastle,RARealEstate,RACars,RAFame}=ctx;
 let rng=seed;const rand=()=>{rng=(rng*1103515245+12345)%2147483648;return rng/2147483648;};
 RAClock.wake({first:true});RALife.setFlag('prologueDone',true);RALife.setFlag('throneDone',true);
 const ran=[];let fameDay=null;
 // The released Property adventure (PLAYER-BLIND) can't be walked headlessly; simulate its completion for property-minded lives.
 const buyFirstProperty=()=>{if(RALife.flag('propertyOwned')||RALife.money()<40000)return;RALife.spend(34000);RAState.patch('life.ownership.properties',[...RALife.life().ownership.properties,{id:'property_la_4p_01',label:'PALOMA FOURPLEX',ownershipStatus:'owned',weeklyRent:1400,rentDue:0,purchasePrice:34000,value:34000}]);RALife.setFlag('propertyOwned',true);ctx.RALegacyBridge?.bridge({});};
 const run=id=>{if(!RAAdventures.available(id))return false;const def=RAAdventures.get(id);try{walk(ctx,id,{vars:def.testVars&&id==='DATE'?{}:{},pick:(list,step)=>{const oct=list.findIndex(c=>c.octopus);return name==='weirdo'&&oct>=0?oct:Math.floor(rand()*list.length);},minigame:()=>({outcome:rand()<.7?'win':'done',score:Math.round(5000+rand()*40000),rewards:{money:Math.round(rand()*300)}}),fight:()=>({outcome:rand()<.65?'win':rand()<.5?'spared':'lose'})});ran.push(`${RALife.today().day}:${id}`);return true;}catch(e){if(log)console.error(name,id,e.message);RAAdventures.abandon?.();return false;}};
 for(let d=0;d<maxDays;d++){
  const w=RAWakeTriggers.pick();if(w)run(w);
  // want-driven: act on live temptations (VampGPT WHAT WE ON)
  let outings=0;for(const t of [...(RALife.life().temptations.live||[])]){if(outings>=P.outings)break;const def=t.adventure?RAAdventures.get(t.adventure):null;const lane=def?.lane;const take=!def||P.lanes.includes(lane)||rand()<.35;if(!take)continue;RATemptations.take(t.id);if(t.adventure){if(run(t.adventure))outings++;}else if(t.action){const pl=RAPlaces.get(t.action);const adv=typeof pl?.adventure==='function'?pl.adventure(RALife.L()):pl?.adventure;if(adv&&run(adv))outings++;}}
  // repeatables & places in their style
  for(const p of RAPlaces.all()){if(outings>=P.outings+1)break;const adv=typeof p.adventure==='function'?p.adventure(RALife.L()):p.adventure;const def=adv&&RAAdventures.get(adv);if(!def||!P.lanes.includes(def.lane))continue;if(rand()<.35&&run(adv))outings++;}
  // dates
  for(const r of RARelations.known({dateable:true}).slice(0,P.dates)){if(RARelations.canDate(r.id)&&rand()<.6){const ok=RAAdventures.start('DATE',{vars:{person:r.id}});if(ok){RAAdventures.abandon();RAState.patch('life.adventures.active',null);try{walk(ctx,'DATE',{vars:{person:r.id},pick:()=>Math.floor(rand()*3)});ran.push(`${RALife.today().day}:DATE:${r.id}`);}catch(e){RAAdventures.abandon?.();}}}}
  // purchases
  for(const room of P.buys){if(!RALife.hasRoom(room)&&RALife.money()>(RACastle.ROOMS.find(r=>r.id===room)?.price||0)+60000)RACastle.buy(room);}
  if(P.properties||name==='homebody')buyFirstProperty();
  if(P.properties){RARealEstate.collectAll();for(const l of RARealEstate.LISTINGS)if(RALife.money()>l.price*.3+50000&&RARealEstate.shannonLane())RARealEstate.buy(l.id,{down:true});}
  if(P.cars)for(const k of P.cars)if(RALife.money()>(RACars.CATALOG[k].price+80000))RACars.buy(k);
  // sleep; the protected ending claims the next wake once eligible
  RAClock.sleep();
  if(RAFame.claimsWake()){fameDay=RALife.today().day;break;}
 }
 const L=RALife.life();
 return {persona:name,fameDay,days:RALife.today().day,adventures:new Set(ran.map(r=>r.split(':')[1])).size,runs:ran.length,momentum:Object.fromEntries(['expression','connection','ownership','legend','chaos'].map(k=>[k,L.momentum[k]])),spark:L.momentum.sparkId,followers:L.resources.followers,money:L.resources.money,netWorth:RALife.netWorth()};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){for(const name of process.argv.slice(2).length?process.argv.slice(2):Object.keys(PERSONAS))console.log(JSON.stringify(await simulate(name,{log:true})));}
