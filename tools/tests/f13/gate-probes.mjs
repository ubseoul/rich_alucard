// Isolated callback/entry proofs. Seeded prerequisites are explicit and never count as population observations.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import vm from 'node:vm';
import path from 'node:path';
import {careerBoot} from './_career.mjs';
import {walk} from '../../btf-test.mjs';
const repo=process.cwd(),proofs=[];
const fresh=async()=>{const {c}=await careerBoot(repo);c.RAClock.wake({first:true});return c;};
const record=(ids,route,seeds,evidence)=>proofs.push({ids,route,seeds,evidence,status:'PASS isolated callback/route probe; not career exposure/economy'});
{
 const c=await fresh();vm.runInContext(await readFile(path.join(repo,'js/scenes/combat2.js'),'utf8'),c,{filename:'js/scenes/combat2.js'});
 const before=c.RALife.money();c.RADefeat.apply({enemy:'training'});const pending=c.RALife.flag('a17Pending');assert(pending&&pending.bill);c.RAClock.sleep();
 assert(c.RAAdventures.available('A17'));assert.equal(c.RAWakeTriggers.pick(),'A17');walk(c,'A17');assert(c.RARelations.met('nneka'));
 record(['A17'],'real RADefeat.apply callback → real sleep → A17 wake → actual A17 graph',['synthetic combat-loss notification to real callback; fresh cash, no money/prerequisite injection'],{bill:pending.bill,actualCashDebited:before-c.RALife.money(),defeats:c.RALife.life().combat.defeats,nnekaMet:true});
}
{
 const c=await fresh();for(let n=0;n<3;n++)c.RANodd.maybeStop();assert(c.RALife.flag('noddPending'));c.RAClock.sleep();assert.equal(c.RAWakeTriggers.pick(),'A57');walk(c,'A57');
 record(['A57'],'real RANodd.maybeStop callback ×3 → real sleep → A57 wake',['three route-car notifications to real callback; no drive counter/pending flag patch'],{drives:c.RALife.counter('drives',0),pendingAfterScene:!!c.RALife.flag('noddPending')});
}
{
 const c=await fresh();vm.runInContext(await readFile(path.join(repo,'js/systems/cars.js'),'utf8'),c,{filename:'js/systems/cars.js'});c.RAState.patch('life.acquisitions.active',{id:'supra_mk4_first_collection',vehicleId:c.RAJDMImports.carId,status:'in_progress',stage:'aftermath',quotedPrice:c.RAJDMImports.priceForTesting,purchaseEventId:`vehicle-acquired:${c.RAJDMImports.carId}`});
 const before=c.RALife.money(),completion=c.RAJDMImports.computeCompletionState(c.RALife.life());assert(completion.ok);c.RAState.patch('life',completion.life);
 walk(c,'A13');assert(c.RAAdventures.isDone('A13'));let target;
 c.RAAdventureScene={begin:id=>{target=id;return true;}};await c.RAPhoneApps.get('touge').onAction('tandem','',{close:async()=>{}});assert.equal(target,'A36');assert(c.RAAdventures.available(target));
 record(['A13','A36'],'actual paid Supra computation → actual A13 graph → TOUGE app TANDEM callback chooses A36',['legacy Supra aftermath seeded; actual published Supra price paid; A13 uses declared synthetic minigame win result'],{target,supraPrice:before-c.RALife.money(),a13Completed:true,available:true});
}
{
 const c=await fresh(),scenes=[];c.RAScenes={go:async id=>{scenes.push(id);}};const before=c.RALife.money();
 await c.RAJDMImports.begin();assert.equal(c.RALife.life().acquisitions.active.stage,'arrival');await c.RAJDMImports.action('meet');await c.RAJDMImports.action('challenge');
 await c.RAJDMImports.ownerDefeated();assert(c.RARelations.met('jdm_importer_daughter_001'));await c.RAJDMImports.action('leaveDaughter');assert(c.RACars.owned('supra'));assert.equal(before-c.RALife.money(),c.RAJDMImports.priceForTesting);
 const place=c.RAPlaces.all().find(p=>typeof p.adventure==='function'&&String(p.adventure).includes('A_CAMMILE1'));assert(place);const target=place.adventure(c.RALife.L());assert.equal(target,'A_CAMMILE1');walk(c,target);assert(c.RAAdventures.isDone(target));
 record(['A_CAMMILE1'],'actual JDM begin/meet/challenge → ownerDefeated callback → leave daughter alone → actual paid purchase → actual docks A_CAMMILE1 graph',['synthetic won-encounter notification to real ownerDefeated callback; legacy scene presentation navigation is captured, no combat input/stability claim; no contact/car/cash prerequisite injection'],{scenes,supraPrice:before-c.RALife.money(),daughterMet:true,docksPlace:place.id,target,completed:true});
}
{
 const c=await fresh();c.RALife.setFlag('ogunsRaveCompleted',true);c.RALife.setFlag('castlePartyHostingUnlocked',true);c.RADragon.adoptEgg();const fixtureCash=c.RACastle.ROOMS.reduce((n,r)=>n+r.price,0);c.RAState.patch('life.resources.money',fixtureCash);
 const targets=[];for(const room of c.RACastle.ROOMS){assert(c.RACastle.buy(room.id));const begin=(id,opts)=>{targets.push({room:room.id,target:id,vars:opts?.vars||{},available:c.RAAdventures.available(id)});return true;};c.RAAdventureScene={begin};await c.RAPlaces.go(room.go,{begin,close:async()=>{},refresh(){},message(){}});}
 assert(targets.find(x=>x.room==='maid_quarters').target==='A39');assert(targets.find(x=>x.room==='armory_wall').target==='ARMORY_WALL');assert(targets.find(x=>x.room==='coffin_upgrade').target==='COFFIN');assert(targets.find(x=>x.room==='fish_tank').target==='FISHTANK');
 c.RAAdventureScene={begin:id=>{targets.push({room:'always-throne',target:id,available:c.RAAdventures.available(id)});return true;}};await c.RAPlaces.go('castle:throne',{begin:c.RAAdventureScene.begin,close:async()=>{}});
 record([...new Set(targets.map(x=>x.target))],'real RACastle.buy → actual hidden RAPlaces.go; always-owned throne route',['cash equal to exact sum of authored room prices, recorded rave prerequisites and adopted egg seeded solely to isolate route handlers; actual room prices paid; not affordability evidence'],{targets,fixtureCash,cashAfterPurchases:c.RALife.money()});
}
{
 const c=await fresh();vm.runInContext(await readFile(path.join(repo,'js/systems/realestate.js'),'utf8'),c,{filename:'js/systems/realestate.js'});c.RAState.patch('life.ownership.properties',[{id:c.RAPropertyQuest.propertyId,ownershipStatus:'owned',weeklyRent:1400,rentDue:0}]);let target,vars;
 c.RAAdventureScene={begin:(id,opts)=>{target=id;vars=opts.vars;return true;}};await c.RAPhoneApps.get('realestate').onAction('see','re_duplex_inglewood',{close:async()=>{}});assert.equal(target,'RE_VIEWING');assert.equal(vars.listing,'re_duplex_inglewood');assert(c.RARealEstate.markup().includes('SEE IT WITH SHANNON'));assert(c.RAAdventures.available(target));
 record(['RE_VIEWING'],'real REALMONEYREALESTATE SEE IT WITH SHANNON callback',['owned Paloma record seeded solely to isolate listing visibility; fresh cash already covers $54,000 down payment'],{target,vars,listingVisible:true,downPayment:c.RARealEstate.LISTINGS[0].price*.3});
}
{
 const c=await fresh();let target,vars;c.RAAdventureScene={begin:(id,opts)=>{target=id;vars=opts?.vars;return true;}};
 assert(c.RAPlaces.visible().some(p=>p.id==='florist'));await c.RAPlaces.go('florist',{close:async()=>{}});
 assert.equal(target,'SHOP');assert.equal(vars.store,'florist');assert(c.RAAdventures.available(target));
 record(['SHOP'],'actual visible florist custom-go callback → SHOP with florist store variables',['none; fresh state and ordinary visible player menu entry'],{target,vars,available:true});
}
{
 const c=await fresh();c.RAState.patch('life.resources.money',120000);const before=c.RALife.money();assert(c.RACastle.buy('hookah_roof'));walk(c,'HOOKAH',{pick:choices=>Math.max(0,choices.findIndex(x=>/LEAVE|GO HOME|THAT.S|BACK TO/.test(x.label)))});
 let notifications=0;while(c.RAEcology.level()<2&&notifications<100){c.RAEcology.converted('isolated-legacy-conversion-notification',{released:true});notifications++;}
 assert.equal(c.RAEcology.level(),2);c.RAClock.sleep();assert.equal(c.RAWakeTriggers.pick(),'A23');const beforeHilt=c.RALife.money();walk(c,'A23');
 const hiltDebit=beforeHilt-c.RALife.money();assert.equal(hiltDebit,Math.round(beforeHilt*.25));walk(c,'A19');assert(c.RALife.flag('armoryKnown'));walk(c,'A24');
 let bought=false;walk(c,'ARMORY',{pick:choices=>{if(!bought){const n=choices.findIndex(x=>/LIL OGA/.test(x.label));if(n>=0){bought=true;return n;}}return Math.max(0,choices.findIndex(x=>/ENOUGH GRACE/.test(x.label)));}});
 assert(c.RALife.life().ownership.guns.length);c.RATemptations.ensure('a23r_rematch');const t=c.RALife.life().temptations.live.find(x=>x.id==='a23r_rematch');assert(t);c.RATemptations.take(t.id);walk(c,'A23R');assert(c.RAAdventures.isDone('A23R'));
 record(['HOOKAH','A23','A19','A24','ARMORY','A23R'],'actual paid roof → HOOKAH → real ecology callback notifications → sleep/A23 → A19/A24 → paid LIL OGA → real rematch offer/graph',['synthetic released-conversion notifications to production ecology callback; no pressure threshold/value patch; fixture cash $120,000 solely to afford real $75,000 roof, Hilt cash cut and $25,000 gun; branch fights use declared synthetic win results; not affordability evidence'],{roofPrice:75000,conversionNotifications:notifications,pressure:c.RAEcology.pressure(),hiltDebit,gunOwned:true,rematchCompleted:true,cashBefore:before,cashAfter:c.RALife.money(),freshCashWouldNotCoverRoofThenGun:true});
}
{
 const c=await fresh(),ids=['ARC_NNEKA_1','ARC_NNEKA_2','ARC_NNEKA_3','ARC_CAMMILE_1','ARC_CAMMILE_2','ARC_CAMMILE_3','ARC_MAZDA_1','ARC_MAZDA_2','ARC_MAZDA_3','ARC_JUNE_1','ARC_JUNE_2','ARC_JUNE_3','ARC_PATRICE_2','ARC_PATRICE_3'];
 const people={NNEKA:'nneka',CAMMILE:'jdm_importer_daughter_001',MAZDA:'mazda_human',JUNE:'june',PATRICE:'ms_patrice'},results=[];
 c.RAState.patch('life.adventures.records.A44_N4',{status:'completed',count:1,completedDay:1});
 for(const [tag,person] of Object.entries(people)){
  c.RARelations.meet(person,'isolated-route-fixture');for(let i=0;i<9;i++){c.RARelations.date(person,c.RARelations.catalog(person).likes[0],{readRight:true});c.RAClock.sleep();}
  for(const id of ids.filter(x=>x.includes('_'+tag+'_'))){assert(c.RAAdventures.available(id),id+' gate');c.RATemptations.ensure(id+'_tempt');const t=c.RALife.life().temptations.live.find(x=>x.id===id+'_tempt');assert(t?.thread===person,id+' actual DM');c.RATemptations.take(t.id);walk(c,id);results.push({id,level:c.RARelations.level(person),thread:t.thread,completed:c.RAAdventures.isDone(id)});}
 }
 record(ids,'actual dated relationship callback → real sleeps → ordered availability → actual temptation DM/graph',['initial contact records for Nneka/Cammile/Mazda/June/Patrice and completed A44_N4 seeded; nine actual dated meetings per contact, no direct relationship points/level injection; no population coverage claim'],{results});
}
await writeFile('docs/evidence/final_a/stage5/isolated-gate-probes.json',JSON.stringify({method:'current OPEN runtime callback/entry checks; seeded prerequisites explicitly declared; never merged into 180+180 or post18 observations',proofs},null,1)+'\n');console.log(JSON.stringify({groups:proofs.length,ids:new Set(proofs.flatMap(x=>x.ids)).size,pass:true}));process.exit();
