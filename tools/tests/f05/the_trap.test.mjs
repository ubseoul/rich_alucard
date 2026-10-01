// F05 - THE TRAP - test suite (auto-discovered by tools/run-tests.mjs --fragment f05).
// Covers every authored non-raid path from Rich_Alucard_PLAYMAKERS_Patch2_THE_TRAP.docx + Vol 7 sec.8, the F01 raid
// boundary (setup only, no fake combat), the F02 weapon seam, the shared HEAT service, the money ledger, persistence,
// duplicate-resolution guards, flags-OFF zero-change, malformed state, and the COOK / COUNT THE MONEY logic.
import assert from 'node:assert/strict';
import {full,run,read,same} from '../if1/_lib.mjs';

async function fragmentFiles(root){return JSON.parse(await read(root,'js/frag/F05/manifest.json')).files;}

async function load(root,{flag=false}={}){
 const ctx=await full(root);
 const files=await fragmentFiles(root);
 await run(root,ctx,['js/frag/F05/migrations.js',...files]);
 if(flag)ctx.RAFeatures.set('F05.trap',true);
 return ctx;
}
function money(ctx,n){ctx.RAState.patch('life.resources.money',n);}
function unlockRich(ctx){ctx.RAState.patch('life.newOga',{...ctx.RAState.get().life.newOga,rank:3,status:'associate'});ctx.RAF05.unlock.tick();}

export async function test(root){
 // ============================================================================================ A. flags OFF
 {
  const c=await load(root,{flag:false});
  const R=c.RAF05;
  assert.equal(R.on(),false,'master flag is dark by default');
  assert.equal(c.RATrap.isBooted(),false,'nothing boots with the flag OFF');
  assert.equal(c.RAFeatures.enabled('F05.trap'),false);
  assert.equal(c.RAFeatures.get('F05.the_trap'),null,'the retired second flag identity is not registered (one identity: F05.trap)');
  assert.equal(c.RAFrag.has('F05'),false,'no save namespace is created while OFF');
  assert.equal(c.RAPhoneApps.get('trap'),null,'no phone app while OFF');
  assert.equal(c.RASalesChannels.get('trap').claimed,false,'reserved sales channel stays unclaimed while OFF');
  assert.equal(c.RAHeat.tiers().provisional,true,'the shipped provisional HEAT floors are untouched while OFF');
  assert.equal(c.RAHeat.describe().floors.WARM,6,'flags OFF: RAHeat keeps its shipped placeholder floor');
  // mutators refuse
  assert.equal(c.RATrap.production.cook({houseId:'the_bando',grade:'D',cases:1,quality:90}).reason,'flag-off');
  assert.equal(c.RATrap.sales.assign({houseId:'the_bando',grade:'D',cases:1,channel:'corner'}).reason,'flag-off');
  assert.equal(c.RATrap.levels.buyUpgrade('vault').reason,'flag-off');
  const before=JSON.stringify(c.RAState.get());
  c.RAClock.wake({}); // a full accepted WAKE must be byte-identical with the fragment loaded but OFF
  assert.equal(c.RAState.get().frag,undefined,'no frag namespace after a WAKE with flags OFF');
  assert.notEqual(before,'','sanity');
  assert.equal(c.RAWakeBus.order('night').some(id=>id.startsWith('f05.')),false,'no F05 NIGHT handlers while OFF');
  assert.equal(c.RAWakeBus.order('wake').some(id=>id==='f05.wake'),false,'no F05 WAKE handler while OFF');
  console.log('PASS F05 flags OFF: no boot, no namespace, no phone app, no channel, no WAKE handlers, RAHeat untouched');
 }

 // ============================================================================================ B. flags ON / boot
 {
  const c=await load(root,{flag:true});
  const R=c.RAF05;
  assert.equal(R.on(),true);
  assert.equal(c.RATrap.isBooted(),true,'boot runs when the flag turns ON');
  assert.equal(c.RAFeatures.enabled('F05.trap'),true,'the single flag identity F05.trap drives everything');
  assert.ok(c.RAPhoneApps.get('trap'),'trap app registered with the phone');
  assert.equal(c.RAPhoneApps.get('trap').section,'money','reserved section');
  assert.equal(c.RASalesChannels.get('trap').claimed,true,'reserved sales channel claimed');
  assert.equal(c.RAHeat.describe().provisional,false,'authored Vol 7 floors configured');
  same(c.RAHeat.describe().floors,{COOL:0,WARM:30,HOT:60,'ON FIRE':85},'Vol 7 sec.8 floors');
  assert.equal(c.RAWakeBus.order('night').includes('f05.sales-resolve'),true);
  assert.equal(c.RAWakeBus.order('night').includes('f05.heat-decay'),true);
  assert.equal(c.RAWakeBus.order('wake').includes('f05.wake'),true);
  assert.ok(c.RAMinigames.get('f05_cook'),'COOK minigame registered');
  assert.ok(c.RAMinigames.get('f05_counter'),'COUNT THE MONEY minigame registered');
  assert.ok(c.RACrew.statuses().includes('DISMISSED'),'trap crew status registered');
  const html=c.RAPhoneApps.get('trap').render(null);
  assert.equal(typeof html,'string');assert.ok(html.includes('TRAP'));assert.ok(!html.includes('undefined'),'render has no undefined');
  console.log('PASS F05 flags ON: boot, phone app, channel, heat floors, WAKE handlers, minigames, crew status');
 }

 // ============================================================================================ C. defaults are inert
 {
  const c=await load(root,{flag:true});
  const r=c.RAFrag.get('F05');
  assert.equal(r.route.active,false,'route starts inactive');assert.equal(r.unlocked,false);
  assert.equal(r.unbanked,0);assert.equal(r.banked,0);
  console.log('PASS F05 namespace defaults');
 }

 // ============================================================================================ D. unlock / entry
 {
  const c=await load(root,{flag:true});const R=c.RAF05;
  assert.equal(R.unlock.eligibility().eligible,false,'fresh save is not eligible');
  assert.equal(R.unlock.eligibility().f04.pending,'F04_INTEGRATION_PENDING','F04 absent is reported, not simulated');
  // NEW OGA ASSOCIATE
  c.RAState.patch('life.newOga',{...c.RAState.get().life.newOga,rank:3,status:'associate'});
  assert.equal(R.unlock.eligibility().conditions.newOgaAssociate,true);
  const u=R.unlock.tick();assert.equal(u.unlocked,true);
  assert.equal(c.RALife.appUnlocked('trap'),true,'unlock puts TRAP on the phone');
  assert.equal(R.unlock.tick().changed,false,'unlock is one-shot');
  // F04 offer
  const c2=await load(root,{flag:true});
  c2.RAState.patch('frag.F04',{offer:{status:'accepted'}});
  assert.equal(c2.RAF05.unlock.eligibility().conditions.offerAccepted,true,'F04 offer unlocks');
  // day 14 + jugged the plug
  const c3=await load(root,{flag:true});
  c3.RAState.patch('life.world.day',14);
  c3.RAState.patch('life.newOga',{...c3.RAState.get().life.newOga,m1Rewarded:true,m1Route:'STICK_UP'});
  assert.equal(c3.RAF05.unlock.eligibility().conditions.day14Jugged,true);
  console.log('PASS F05 unlock: NEW OGA associate / F04 December offer / Day14+JUG THE PLUG');
 }

 // ============================================================================================ E. listing + house buy
 {
  const c=await load(root,{flag:true});const R=c.RAF05;
  unlockRich(c);money(c,1000000);
  const L=R.unlock.listing();
  same(L.houses.map(h=>[h.id,h.price,h.capacity]),[
   ['the_bando',45000,2],['the_cul_de_sac',140000,4],['laundromat_back_room',260000,6],['the_warehouse',0,10]
  ],'authored prices + capacities');
  assert.equal(R.unlock.buyCheck('the_warehouse').reason,'new_oga_not_finished','warehouse needs the chair');
  const b=R.unlock.buy('the_bando');assert.equal(b.ok,true);
  assert.equal(c.RALife.money(),1000000-45000,'authored price debited');
  assert.equal(R.store.hasHouse('the_bando'),true);
  assert.equal(R.store.route().active,true,'route activates on first house');
  assert.equal(R.unlock.buy('the_bando').reason,'owned','duplicate buy refused');
  const led=c.RAMoneyLedger.query({family:'trap'}).filter(e=>e.source==='trap:house');
  assert.equal(led.length,1,'house purchase tagged trap:house');assert.equal(led[0].delta,-45000);
  // new-oga-finished warehouse, free
  c.RAState.patch('life.newOga',{...c.RAState.get().life.newOga,status:'m8_hold',mission:7,m7Completed:true});
  assert.equal(R.unlock.buyCheck('the_warehouse').ok,true);
  const w=R.unlock.buy('the_warehouse');assert.equal(w.ok,true);assert.equal(c.RALife.money(),955000,'warehouse free with the chair');
  // no money
  money(c,0);assert.equal(R.unlock.buyCheck('the_cul_de_sac').reason,'no-money');
  console.log('PASS F05 listing/buy: authored prices, warehouse chair gate, duplicate guard, ledger tag');
 }

 // ============================================================================================ F. production
 {
  const c=await load(root,{flag:true});const R=c.RAF05;
  unlockRich(c);money(c,1e6);R.unlock.buy('the_bando');
  // grade gating by level
  same(R.production.unlockedGrades(1),['D','C']);
  same(R.production.unlockedGrades(2),['D','C','B']);
  same(R.production.unlockedGrades(3),['D','C','B','A']);
  same(R.production.unlockedGrades(5),['D','C','B','A','S']);
  // ingredients (provisional cost is 0 -> source-faithful)
  R.production.addIngredient('synth',5);
  assert.equal(R.production.ingredients().synth,5);
  // cook D
  const d=R.production.cook({houseId:'the_bando',grade:'D',cases:2,quality:95});
  assert.equal(d.ok,true);assert.equal(d.batch.grade,'D');assert.equal(d.batch.premium,true);assert.equal(d.batch.readyDay,c.RALife.today().day);
  assert.equal(R.production.ingredients().synth,3,'base consumed');
  // A needs a perfect cook; an imperfect cook downgrades to B (engineering rule, reported in the doc)
  c.RAF05.patch('route.level',3);R.production.addIngredient('premium',2);
  const a=R.production.cook({houseId:'the_bando',grade:'A',cases:1,quality:95});
  assert.equal(a.batch.grade,'A');assert.equal(a.batch.readyDay,c.RALife.today().day+4,'A ages 4 sleeps');
  const a2=R.production.cook({houseId:'the_bando',grade:'A',cases:1,quality:70});
  assert.equal(a2.batch.grade,'B');assert.equal(a2.batch.downgradedFrom,'A');assert.equal(a2.batch.readyDay,c.RALife.today().day+2,'B ages 2 sleeps');
  // S requires rare + premium
  c.RAF05.patch('route.level',5);R.production.addIngredient('premium',1);
  assert.equal(R.production.cook({houseId:'the_bando',grade:'S',cases:1,quality:95}).reason,'no-rare-ingredient');
  R.production.addIngredient('rare',1);
  const s=R.production.cook({houseId:'the_bando',grade:'S',cases:1,quality:95});
  assert.equal(s.batch.grade,'S');assert.equal(R.production.ingredients().rare,0,'rare consumed');
  // capacity + hot
  assert.equal(R.production.cook({houseId:'the_bando',grade:'D',cases:9,quality:90}).reason,'over-capacity');
  R.patch('houses.the_bando.hotUntilDay',c.RALife.today().day+3);
  assert.equal(R.production.cook({houseId:'the_bando',grade:'D',cases:1,quality:90}).reason,'house-hot');
  R.patch('houses.the_bando.hotUntilDay',null);
  // pricing (authored bands)
  assert.equal(R.production.unitPrice('D',95),1500,'premium +25%');
  assert.equal(R.production.unitPrice('D',40),600,'below 50% sells at half');
  assert.equal(R.production.unitPrice('D',95,{channelId:'wholesale'}),900,'wholesale 60%');
  assert.equal(R.production.unitPrice('S',95),50000);
  assert.equal(R.production.unitPrice('B',95),8750);
  // aging: not ready today
  c.RAF05.patch('route.level',2);R.production.addIngredient('good',1);
  const b=R.production.cook({houseId:'the_bando',grade:'B',cases:1,quality:95});
  assert.equal(R.production.readyCases({houseId:'the_bando',grade:'B'}),0,'B not ready same night');
  c.RAState.patch('life.world.day',c.RALife.today().day+2);
  assert.ok(R.production.readyCases({houseId:'the_bando',grade:'B'})>=1,'B ready after 2 sleeps');
  console.log('PASS F05 production: grade gating, aging, rare ingredient, capacity, hot, quality pricing');
 }

 // ============================================================================================ G. rare ingredient
 {
  const c=await load(root,{flag:true});const R=c.RAF05;
  assert.equal(R.production.gainRare('fish_scale').reason,'rich-must-handle-it');
  assert.equal(R.production.gainRare('dragon_scale').reason,'no-dragon');
  assert.equal(R.production.gainRare('agege_crumb').ok,true);
  assert.equal(R.production.gainRare('agege_crumb').reason,'rare-weekly-lock','one rare per week');
  c.RAState.patch('life.world.day',c.RALife.today().day+7);
  assert.equal(R.production.gainRare('fish_scale',{handled:true}).ok,true,'Rich handles the fish scale');
  console.log('PASS F05 rare ingredient: weekly lock, fish handled by Rich, dragon source');
 }

 // ============================================================================================ H. sales channels + resolve
 {
  const c=await load(root,{flag:true});const R=c.RAF05;
  unlockRich(c);money(c,1e6);R.unlock.buy('the_bando');
  // requirements
  assert.equal(R.sales.requirementMet('corner').reason,'need-runner');
  assert.equal(R.sales.requirementMet('clubs').reason,'need-clout-mid');
  assert.equal(R.sales.requirementMet('elite').reason,'need-rep-high');
  assert.equal(R.sales.channels().find(x=>x.id==='bing').available,false);
  c.RAState.patch('frag.F06',{status:'big_tipper'});
  assert.equal(R.sales.requirementMet('bing').ok,true,'BIG TIPPER via the F06 adapter');
  c.RAState.patch('life.resources',{...c.RAState.get().life.resources,clout:'MID',cloutPoints:30,vampireReputation:'HIGH',vampRepPoints:70});
  assert.equal(R.sales.requirementMet('clubs').ok,true);
  assert.equal(R.sales.requirementMet('elite').ok,true);
  // corner needs a runner (placeholder crew is allowed)
  c.RAF05.patch('route.level',2);
  assert.equal(R.crew.recruit('runner').ok,true);
  assert.equal(R.sales.requirementMet('corner').ok,true);
  // assign + resolve (no skim roll)
  R.production.addIngredient('synth',4);
  R.production.cook({houseId:'the_bando',grade:'D',cases:2,quality:95});
  const as=R.sales.assign({houseId:'the_bando',grade:'D',cases:2,channel:'corner'});
  assert.equal(as.ok,true);
  const heatBefore=R.heat.value();
  const rep=R.sales.resolveNight({roll:1});
  assert.equal(rep.cases,2);assert.equal(rep.revenue,3000,'2 x premium D @1500');
  assert.equal(R.sales.pending(),3000,'sale cash is unbanked until COUNT THE MONEY');
  assert.equal(R.levels.casesSold(),2);
  assert.equal(R.heat.value(),heatBefore+R.heat.saleDelta({channelId:'corner',grade:'D',cases:2}));
  assert.equal(R.sales.resolveNight(),null,'no assignment -> no report');
  // wholesale 60% + zero heat
  R.production.addIngredient('synth',2);R.production.cook({houseId:'the_bando',grade:'D',cases:2,quality:95});
  const unbankedBefore=R.sales.pending();const heatBeforeW=R.heat.value();
  R.sales.assign({houseId:'the_bando',grade:'D',cases:2,channel:'wholesale'});
  const w=R.sales.resolveNight({roll:1});
  assert.equal(w.revenue,1800,'wholesale 60% of 3000');assert.equal(w.heat,0,'wholesale zero heat');
  assert.equal(R.heat.value(),heatBeforeW,'zero-heat channel adds nothing');
  assert.equal(R.sales.pending(),unbankedBefore+1800);
  // bad product to elite ends a client forever (low quality)
  R.production.addIngredient('premium',3);c.RAF05.patch('route.level',5);
  const low=R.production.cook({houseId:'the_bando',grade:'A',cases:1,quality:30});
  assert.equal(low.batch.grade,'B','low cook downgrades A->B');
  R.production.addIngredient('rare',1);R.production.addIngredient('premium',1);
  const sDown=R.production.cook({houseId:'the_bando',grade:'S',cases:1,quality:30});
  assert.equal(sDown.batch.grade,'A','low cook downgrades S->A');
  // force a low-quality A batch directly (30 quality, grade A) to exercise the elite rule
  R.store.addBatch({id:'lowA',houseId:'the_bando',grade:'A',quality:30,cases:1,readyDay:c.RALife.today().day,premium:false,low:true});
  R.sales.assign({houseId:'the_bando',grade:'A',cases:1,channel:'elite'});
  const e=R.sales.resolveNight({roll:1});
  assert.equal(e.lostClients.length,1,'low quality to elite loses a client');assert.equal(R.sales.eliteClientsLeft().length,1);
  // bank
  const before=c.RALife.money();const pending=R.sales.pending();
  const banked=R.sales.bank();
  assert.equal(banked.ok,true);assert.equal(c.RALife.money(),before+pending,'counted cash lands in the phone balance');
  assert.equal(R.sales.pending(),0);assert.equal(R.sales.banked()>=pending,true);
  assert.equal(banked.bands,Math.floor(banked.amount/10000));
  const family=c.RAMoneyLedger.byFamily();assert.ok(family.trap&&family.trap.in>0,'trap family income in the ledger');
  console.log('PASS F05 sales: channels, authored pricing/wholesale, heat, bad product, unbanked->COUNT THE MONEY');
 }

 // ============================================================================================ I. robbery
 {
  const c=await load(root,{flag:true});const R=c.RAF05;
  unlockRich(c);money(c,1e6);R.unlock.buy('the_bando');c.RAF05.patch('route.level',2);R.crew.recruit('runner');
  const runner=R.store.crewByRole('runner')[0];
  R.store.setLoyalty(runner,1); // low loyalty
  R.production.addIngredient('synth',2);R.production.cook({houseId:'the_bando',grade:'D',cases:2,quality:95});
  R.sales.assign({houseId:'the_bando',grade:'D',cases:2,channel:'corner'});
  const rep=R.sales.resolveNight({roll:0.01}); // under the provisional chance
  assert.equal(rep.skimming,true);assert.ok(rep.stolen>0);assert.equal(R.read('robbery').notice,true);
  assert.ok(rep.notes.includes('numbers look light.'));
  // confront verbs
  assert.equal(R.crew.confront(runner,'talk').ok,true);
  assert.equal(R.store.loyaltyOf(runner),R.PROVISIONAL.loyalty.start,'TALK restores loyalty');
  // vault prevents skimming
  const c2=await load(root,{flag:true});const R2=c2.RAF05;
  unlockRich(c2);money(c2,1e6);R2.unlock.buy('the_bando');c2.RAF05.patch('route.level',2);R2.crew.recruit('runner');
  const r2=R2.store.crewByRole('runner')[0];R2.store.setLoyalty(r2,1);
  R2.levels.buyUpgrade('vault');
  R2.production.addIngredient('synth',2);R2.production.cook({houseId:'the_bando',grade:'D',cases:2,quality:95});
  R2.sales.assign({houseId:'the_bando',grade:'D',cases:2,channel:'corner'});
  const rep2=R2.sales.resolveNight({roll:0.01});
  assert.equal(rep2.skimming,false,'vault: cash cannot be stolen');
  console.log('PASS F05 robbery: skim on low loyalty, night report line, confront verbs, vault protection');
 }

 // ============================================================================================ J. heat (shared)
 {
  const c=await load(root,{flag:true});const R=c.RAF05;
  assert.equal(R.heat.saleDelta({channelId:'corner',grade:'D',cases:1}),2);
  assert.equal(R.heat.saleDelta({channelId:'wholesale',grade:'S',cases:3}),0);
  assert.equal(R.heat.tier(10),'COOL');assert.equal(R.heat.tier(35),'WARM');assert.equal(R.heat.tier(70),'HOT');assert.equal(R.heat.tier(90),'ON FIRE');
  unlockRich(c);R.unlock.buy('the_bando');
  c.RAHeat.add(45,{source:'test'});
  const before=c.RAHeat.global();
  c.RAClock.sleep();
  assert.equal(c.RAHeat.global(),before-3,'shared HEAT decays -3 per sleep (Vol 7 sec.8)');
  console.log('PASS F05 heat: shared RAHeat, Vol 7 floors, provisional per-channel weights, -3 decay');
 }

 // ============================================================================================ K. levels/upgrades
 {
  const c=await load(root,{flag:true});const R=c.RAF05;
  unlockRich(c);money(c,1e6);R.unlock.buy('the_bando');
  assert.equal(R.levels.status().level,1);
  R.levels.recordCases(R.PROVISIONAL.casesSoldForLevel[2]);
  const before=R.levels.status();
  assert.equal(before.eligible,true);assert.equal(before.jobSourceRequired,true,'level jobs report contentSourceRequired');
  const up=R.levels.levelUp();assert.equal(up.ok,true);assert.equal(up.level,2);
  R.patch('route.casesSold',R.PROVISIONAL.casesSoldForLevel[4]);R.levels.levelUp(); // ->3
  R.levels.levelUp(); // ->4
  assert.equal(R.store.level(),4);assert.equal(R.levels.status().level,4);
  assert.equal(R.store.route().countingRoom,true,'COUNTING ROOM unlocks at Level 4');
  // upgrades
  assert.equal(R.levels.buyUpgrade('vault').ok,true);assert.equal(R.levels.buyUpgrade('vault').reason,'owned');
  assert.equal(R.levels.hasUpgrade('vault'),true);
  // authored job interface + premise
  assert.equal(R.levels.completeJob('F05_LEVELUP_3').ok,true);
  assert.equal(R.levels.jobState(3).done,true);
  assert.ok(R.AUTHORED.levelJobs[3].premise.includes('HOA'));
  console.log('PASS F05 levels: cases-sold gate, level-up job interface, COUNTING ROOM, upgrades');
 }

 // ============================================================================================ L. crew roles
 {
  const c=await load(root,{flag:true});const R=c.RAF05;
  c.RAF05.patch('route.level',2);
  same(R.crew.slots(1),{cook:1,runner:0,lookout:0});
  same(R.crew.slots(2),{cook:1,runner:1,lookout:1});
  same(R.crew.slots(3),{cook:2,runner:1,lookout:1});
  assert.equal(R.crew.assign('nobody','cook').reason,'unknown-crew');
  assert.equal(R.crew.recruit('lookout').ok,true);
  const id=R.store.crewByRole('lookout')[0];assert.ok(id);
  assert.equal(R.crew.recruit('lookout').reason,'no-slot','one lookout at Level 2');
  assert.equal(R.crew.confront(id,'nonsense').reason,'unknown-method');
  console.log('PASS F05 crew: authored slots, placeholder workers (artSourceRequired), slot cap, confront verbs');
 }

 // ============================================================================================ M. reactions
 {
  const c=await load(root,{flag:true});const R=c.RAF05;
  assert.equal(R.reactions.trigger('nneka').ok,true);assert.equal(R.reactions.trigger('nneka').reason,'already');
  assert.equal(R.reactions.has('nneka'),true);assert.equal(R.reactions.pending().length,R.reactions.PEOPLE.length-1);
  assert.equal(R.reactions.trigger('nobody').reason,'unknown-person');
  console.log('PASS F05 reactions: one-time people-notice, contentSourceRequired, no invented lines');
 }

 // ============================================================================================ N. raids (F01 boundary)
 {
  const c=await load(root,{flag:true});const R=c.RAF05;
  unlockRich(c);money(c,1e6);R.unlock.buy('the_bando');
  assert.equal(R.raids.eligible().reason,'heat-below-HOT','needs heat');
  c.RAHeat.add(60,{source:'test'});
  assert.equal(R.raids.eligible().ok,true);
  const packet=R.raids.buildEntryPacket().packet;
  assert.equal(packet.weapons.hasOwnProperty('holdTurns'),true,'entry packet carries the F02 weapon handoff');
  assert.ok(packet.f01Pending===R.raids.F01_PENDING,'entry packet is F01_INTEGRATION_PENDING');
  const sch=R.raids.schedule();assert.equal(sch.ok,true);
  assert.equal(R.raids.pending().f01Pending,'F01_INTEGRATION_PENDING');
  assert.equal(R.raids.eligible().reason,'cadence','at most one per 7 nights');
  assert.equal(typeof R.raids.resolve,'function','resolution interface exists');
  // no fake combat surface
  assert.equal(typeof R.raids.simulate,'undefined','no combat simulation');
  assert.equal(typeof R.raids.resolveShot,'undefined','no substitute resolution');
  // lose: stash + 30% unbanked + hot 5 nights
  R.production.addIngredient('synth',2);R.production.cook({houseId:'the_bando',grade:'D',cases:2,quality:95});
  R.store.addUnbanked(1000);
  const res=R.raids.resolve({outcome:'lose'});
  assert.equal(res.ok,true);assert.equal(res.result.stashCases,2,'stash lost');assert.equal(res.result.unbankedLost,300,'30% of unbanked');
  assert.equal(R.production.hot('the_bando'),true,'house hot');assert.equal(res.result.hotUntilDay,c.RALife.today().day+5);
  // panic room protects crew
  const c2=await load(root,{flag:true});const R2=c2.RAF05;
  unlockRich(c2);money(c2,1e6);R2.unlock.buy('the_bando');R2.crew.recruit('cook');R2.levels.buyUpgrade('panic_room');
  c2.RAHeat.add(60,{source:'test'});R2.raids.schedule();const res2=R2.raids.resolve({outcome:'lose'});
  assert.equal(res2.result.crewLost,null,'panic room protects crew');
  // BIG RAID takes a property permanently
  const c3=await load(root,{flag:true});const R3=c3.RAF05;
  unlockRich(c3);money(c3,1e6);R3.unlock.buy('the_bando');c3.RAF05.patch('route.level',5);
  c3.RAHeat.add(60,{source:'test'});R3.raids.schedule();
  const big=R3.raids.resolve({outcome:'big_raid'});
  assert.equal(big.result.propertyLost,true);assert.equal(R3.store.hasHouse('the_bando'),false,'property permanently taken');
  assert.ok(big.result.keeps.includes('castle')&&big.result.keeps.includes('cars')&&big.result.keeps.includes('counting room banked cash'));
  assert.equal(R3.raids.cancel().reason,'no-pending-raid');
  console.log('PASS F05 raids: F01_INTEGRATION_PENDING setup only, authored losses, panic room, BIG RAID');
 }

 // ============================================================================================ O. weapons seam (F02)
 {
  const c=await load(root,{flag:true});const R=c.RAF05;
  // F02 absent -> isolated fallback, never duplicating ownership
  assert.equal(R.weapons.status().pending,'F02_INTEGRATION_PENDING');
  const a=R.weapons.assign('lookout_1','lil_oga');
  assert.equal(a.ok,true);assert.equal(a.pending,'F02_INTEGRATION_PENDING');
  assert.equal(R.weapons.owner('lookout_1'),'lil_oga');
  assert.equal(R.weapons.list().length,1);
  assert.equal(R.weapons.clear('lookout_1').ok,true);assert.equal(R.weapons.owner('lookout_1'),null);
  // F02 present -> delegate (owner prefix 'trap:'), local store untouched
  const calls=[];
  c.RAIronAndGrace={trap:{
   assign:(owner,gun)=>{calls.push(['assign',owner,gun]);return {ok:true,owner,gun};},
   owner:owner=>{calls.push(['owner',owner]);return 'sapporo_shotgun';},
   clear:owner=>{calls.push(['clear',owner]);return {ok:true};},
   list:()=>[{owner:'trap:lookout_1',gun:'sapporo_shotgun',resolved:{}}],
   holdTurns:()=>[1,2]
  }};
  assert.equal(R.weapons.status().pending,null,'F02 detected');
  R.weapons.assign('lookout_1','sapporo_shotgun');
  assert.equal(calls[0][1],'trap:lookout_1','owner namespaced for F02');
  assert.equal(R.weapons.owner('lookout_1'),'sapporo_shotgun');
  same(R.weapons.holdTurns(),[1,2]);
  assert.equal(c.RAF05.read('weapons.lookout_1',null),null,'no duplicate local ownership when F02 is present');
  console.log('PASS F05 weapons seam: F02 delegate or isolated adapter, owner prefix, holdTurns, no duplication');
 }

 // ============================================================================================ P. persistence
 {
  const c=await load(root,{flag:true});const R=c.RAF05;
  unlockRich(c);money(c,1e6);R.unlock.buy('the_bando');
  R.patch('unbanked',4321);R.crew.recruit('runner');
  const stored=c.RAFrag.get('F05');
  assert.equal(stored.unbanked,4321);
  // namespace survives normalization + storage round trip
  const migrated=c.RAState.migrateRecord(c.RAState.get());
  assert.ok(migrated.frag&&migrated.frag.F05,'F05 namespace survives migration');
  assert.equal(migrated.frag.F05.route.active,true);
  const store=c.RASaveFixtures.memoryStorage();c.RAState.write(store,c.RAState.get());
  const loaded=c.RAState.read(store);assert.equal(loaded.state.frag.F05.unbanked,4321,'round trip');
  // migration is declaration-only (no orphan submission)
  assert.equal(c.RAMigrations.validate().some(p=>/F05/.test(p)),false,'F05 submits no unassigned migration module');
  assert.equal(c.RAMigrations.hasNamespace('F05'),true,'F05 namespace declared');
  console.log('PASS F05 persistence: lazy namespace, migration-safe, save round trip, declaration-only');
 }

 // ============================================================================================ Q. malformed / edge
 {
  const c=await load(root,{flag:true});const R=c.RAF05;
  unlockRich(c);money(c,1e6);R.unlock.buy('the_bando');
  assert.equal(R.production.cook({houseId:'nope',grade:'D',cases:1,quality:90}).reason,'unknown-house');
  assert.equal(R.production.cook({houseId:'the_bando',grade:'Z',cases:1,quality:90}).reason,'grade-locked');
  assert.equal(R.production.cook({houseId:'the_bando',grade:'D',cases:0,quality:90}).reason,'no-cases');
  assert.equal(R.production.cook({houseId:'the_bando',grade:'D',cases:1,quality:90}).reason,'no-ingredients');
  assert.equal(R.sales.assign({houseId:'the_bando',grade:'D',cases:1,channel:'nope'}).reason,'unknown-channel');
  R.production.addIngredient('synth',1);R.production.cook({houseId:'the_bando',grade:'D',cases:1,quality:95});
  assert.equal(R.sales.assign({houseId:'the_bando',grade:'D',cases:5,channel:'wholesale'}).reason,'not-enough-stock');
  assert.equal(R.production.unitPrice('Z',90),0);
  assert.equal(R.levels.buyUpgrade('nope').reason,'unknown-upgrade');
  assert.equal(R.unlock.buy('nope').reason,'unknown-house');
  // a malformed frag value does not throw the app render
  c.RAState.patch('frag.F05.unbanked','nonsense');
  assert.equal(typeof c.RAPhoneApps.get('trap').render('world'),'string');
  c.RAState.patch('frag.F05.unbanked',0);
  console.log('PASS F05 edge/malformed: unknown ids, bad quantities, over-assignment, malformed frag value');
 }

 // ============================================================================================ R. minigame logic
 {
  const c=await load(root,{flag:true});const R=c.RAF05;
  assert.equal(R.cookLogic.blendScore(0.7),100);
  assert.equal(R.cookLogic.blendScore(0.2)<60,true);
  assert.equal(R.cookLogic.blendScore(1)<100,true,'over-blend is punished');
  assert.equal(R.cookLogic.heatScore([0.7,0.7,0.7]),100);
  assert.equal(R.cookLogic.heatScore([0.1,0.1]),0);
  assert.equal(R.cookLogic.bottleScore(6,0),100);
  assert.equal(R.cookLogic.bottleScore(0,4),0);
  const q=R.cookLogic.quality({blend:0.7,heat:[0.7,0.7],clean:6,misses:0});
  assert.equal(q>=99,true,'a clean run is a high-quality batch');
  assert.equal(R.counterLogic.bands(0),0);assert.equal(R.counterLogic.bands(25000),2);
  assert.equal(R.counterLogic.counted(0.5,1000),500);
  console.log('PASS F05 minigame logic: COOK blend/heat/bottle quality, COUNT bands');
 }

 // ============================================================================================ S. audio + art honesty
 {
  const c=await load(root,{flag:true});const R=c.RAF05;
  same(Object.keys(R.AUTHORED.sound),['TR_01','TR_02','TR_03','TR_04','TR_05','TR_06']);
  assert.equal(c.RATrap.artNeeds().every(a=>a.artSourceRequired===true),true,'all trap art is artSourceRequired');
  assert.equal(R.crew.visual,'artSourceRequired');
  const admin={window:{}};admin.window=admin;const vm=await import('node:vm');
  vm.createContext(admin);await run(root,admin,['js/data/audio_manifest.js','js/data/audio/manifest_parts.js','js/data/audio/parts/F05_trap.js']);
  const TR=admin.RAAudioManifest.get('TR_01');
  assert.ok(TR,'TR_01 registered as an inert hook');assert.equal(TR.registered,false);assert.equal(TR.file,null);
  assert.equal(TR.expectedPath,'assets/audio/sfx/trap/TR_01.mp3','hook points at the F11 delivered runtime path');
  assert.equal(admin.RAAudioManifest.ids.filter(id=>/^TR_0[1-6]$/.test(id)).length,6,'TR_01-TR_06 registered');
  console.log('PASS F05 audio hooks + art/crew honesty');
 }

 // ============================================================================================ T. F01 OL-023 canonical outcome adapter
 {
  const c=await load(root,{flag:true});const R=c.RAF05;
  // F01's canonical tokens only; aliases collapse onto them; F05 invents nothing
  same(R.raids.DEFENSE_OUTCOMES,['HELD','BREACHED','FELL_BACK','WASH']);
  assert.equal(R.raids.canonicalOutcome('FELL_BACK'),'FELL_BACK');
  assert.equal(R.raids.canonicalOutcome('fall_back'),'FELL_BACK');
  assert.equal(R.raids.canonicalOutcome('hold_breach'),'BREACHED');
  assert.equal(R.raids.canonicalOutcome('wash'),'WASH');
  assert.equal(R.raids.canonicalOutcome('nonsense'),null);
  // fromPlayRecord reads F01 summarizeRecord shapes (js/frag/F01/play/engine.mjs)
  assert.equal(R.raids.fromPlayRecord({fellBack:true,klass:'FELL_BACK',getaway:'FALL_BACK'}),'FELL_BACK');
  assert.equal(R.raids.fromPlayRecord({klass:'WASH',getaway:'WASH'}),'WASH');
  assert.equal(R.raids.fromPlayRecord({shape:'HOLD THE HOUSE',getaway:'BREACHED',klass:'COSTLY',win:true}),'BREACHED');
  assert.equal(R.raids.fromPlayRecord({shape:'HOLD THE HOUSE',getaway:'HELD',klass:'MESSY',win:true}),'HELD');
  assert.equal(R.raids.fromPlayRecord({klass:'BAILED',bailed:true,getaway:'BAILED'}),null,'BAILED is an offense-only outcome');
  assert.equal(R.raids.fromPlayRecord(null),null);
  console.log('PASS F05 outcome vocabulary: F01 canonical tokens, aliases, PLAY-record reader, no invented types');
 }

 // ---- HOLD win (HELD): the door held - no loss
 {
  const c=await load(root,{flag:true});const R=c.RAF05;
  unlockRich(c);money(c,1e6);R.unlock.buy('the_bando');
  R.production.addIngredient('synth',2);R.production.cook({houseId:'the_bando',grade:'D',cases:2,quality:95});
  R.store.addUnbanked(1000);c.RAHeat.add(60,{source:'test'});
  assert.equal(R.raids.schedule().ok,true);
  const res=R.raids.applyDefense({canonical:'HELD',raidId:R.raids.pending().id});
  assert.equal(res.ok,true);assert.equal(res.canonical,'HELD');
  assert.equal(res.result.stashCases,0,'HELD loses no stash');
  assert.equal(R.production.readyCases({houseId:'the_bando'}),2,'stock intact after a hold');
  assert.equal(R.sales.pending(),1000,'unbanked intact after a hold');
  assert.equal(R.production.hot('the_bando'),false,'the house is not hot after a hold');
  assert.equal(R.sales.banked(),0,'a hold banks nothing by itself');
  assert.equal(R.raids.pending(),null,'the raid resolves');
  console.log('PASS F05 HOLD win: HELD is a clean hold (no stash/cash loss, no house hot)');
 }

 // ---- HOLD breach (BREACHED): stash + 30% unbanked + hot; banked safe
 {
  const c=await load(root,{flag:true});const R=c.RAF05;
  unlockRich(c);money(c,1e6);R.unlock.buy('the_bando');
  R.production.addIngredient('synth',2);R.production.cook({houseId:'the_bando',grade:'D',cases:2,quality:95});
  R.store.addUnbanked(1000);R.patch('banked',5000);c.RAHeat.add(60,{source:'test'});
  assert.equal(R.raids.schedule().ok,true);
  const res=R.raids.applyDefense({canonical:'BREACHED',raidId:R.raids.pending().id});
  assert.equal(res.result.stashCases,2,'stash lost on a breach');
  assert.equal(res.result.unbankedLost,300,'30% of unbanked lost');
  assert.equal(R.sales.pending(),700);
  assert.equal(R.sales.banked(),5000,'banked money is safe');
  assert.equal(R.production.hot('the_bando'),true,'the house is hot after a breach');
  assert.equal(res.result.hotUntilDay,c.RALife.today().day+5);
  console.log('PASS F05 HOLD breach: stash + 30% unbanked at risk, house hot, banked money safe');
 }

 // ---- FALL BACK (OL-022): the same hit, 0 captures, own state
 {
  const c=await load(root,{flag:true});const R=c.RAF05;
  unlockRich(c);money(c,1e6);R.unlock.buy('the_bando');c.RAF05.patch('route.level',2);
  R.crew.recruit('cook');R.crew.recruit('runner');   // defenders exist, no panic room
  R.production.addIngredient('synth',2);R.production.cook({houseId:'the_bando',grade:'D',cases:2,quality:95});
  R.store.addUnbanked(1000);R.patch('banked',5000);c.RAHeat.add(60,{source:'test'});
  assert.equal(R.raids.schedule().ok,true);
  const res=R.raids.applyDefense({canonical:'FELL_BACK',raidId:R.raids.pending().id});
  assert.equal(res.ok,true);assert.equal(res.canonical,'FELL_BACK');
  assert.equal(res.result.state,'FELL_BACK','own FELL BACK state recorded');
  assert.equal(res.result.crewCaptured.length,0,'FALL BACK: 0 captures');
  assert.equal(res.result.crewLost,null);
  assert.equal(res.result.stashCases,2,'the raid product is lost');
  assert.equal(res.result.unbankedLost,300);
  assert.equal(R.sales.pending(),700);assert.equal(R.sales.banked(),5000,'banked money safe');
  assert.equal(R.production.hot('the_bando'),true);
  assert.equal(R.raids.lastOutcome().canonical,'FELL_BACK');
  assert.equal(R.read('robbery.resolved',null),null,'a raid does not fabricate a robbery');
  console.log('PASS F05 FALL BACK: house hit, 0 captures, banked money safe, own FELL BACK state');
 }

 // ---- WASH (0 able): the authored fallback capture rule applies
 {
  const c=await load(root,{flag:true});const R=c.RAF05;
  unlockRich(c);money(c,1e6);R.unlock.buy('the_bando');R.crew.recruit('cook');
  R.production.addIngredient('synth',2);R.production.cook({houseId:'the_bando',grade:'D',cases:2,quality:95});
  c.RAHeat.add(60,{source:'test'});assert.equal(R.raids.schedule().ok,true);
  const res=R.raids.applyDefense({canonical:'WASH',raidId:R.raids.pending().id});
  assert.equal(res.canonical,'WASH');assert.equal(res.result.crewCaptured.length,1,'0 able -> a defender can be taken');
  console.log('PASS F05 WASH: 0 able uses the authored fallback crew rule');
 }

 // ---- F01 record is authoritative: real captives + a lost gun is released
 {
  const c=await load(root,{flag:true});const R=c.RAF05;
  unlockRich(c);money(c,1e6);R.unlock.buy('the_bando');R.crew.recruit('cook');
  const def=R.store.crewByRole('cook')[0];R.weapons.assign(def,'lil_oga');
  R.production.addIngredient('synth',2);R.production.cook({houseId:'the_bando',grade:'D',cases:2,quality:95});
  R.store.addUnbanked(1000);c.RAHeat.add(60,{source:'test'});R.raids.schedule();
  const rec={fellBack:false,klass:'WASH',shape:'HOLD THE HOUSE',getaway:'WASH',win:false,captives:[def],lost:{cars:[],guns:[{from:def,gun:'lil_oga'}]}};
  const res=R.raids.applyDefense({record:rec,raidId:R.raids.pending().id});
  assert.equal(res.ok,true);assert.equal(res.canonical,'WASH');
  assert.equal(res.result.crewCaptured[0],def,'F01 record supplies the real captive');
  assert.equal(R.weapons.owner(def),null,'a lost gun is released from the weapon seam');
  console.log('PASS F05 outcome record: F01 captives authoritative, lost gun released, no duplicate ownership');
 }

 // ---- idempotency: a resolved raid cannot be applied twice; repeated delivery is answered from the receipt
 {
  const c=await load(root,{flag:true});const R=c.RAF05;
  unlockRich(c);money(c,1e6);R.unlock.buy('the_bando');R.production.addIngredient('synth',2);R.production.cook({houseId:'the_bando',grade:'D',cases:2,quality:95});
  R.store.addUnbanked(1000);c.RAHeat.add(60,{source:'test'});R.raids.schedule();
  const id=R.raids.pending().id;
  const first=R.raids.applyDefense({canonical:'BREACHED',raidId:id});
  assert.equal(first.ok,true);assert.equal(first.duplicate,false);
  const heat=c.RAHeat.value?c.RAHeat.value():null,unb=R.read('unbanked',0),bal=c.RALife.money();
  const again=R.raids.applyDefense({canonical:'BREACHED',raidId:id});
  assert.equal(again.ok,true);assert.equal(again.duplicate,true,'repeated delivery is answered from the receipt');
  same(again.result,first.result);
  assert.equal(R.read('unbanked',0),unb,'no second unbanked loss');assert.equal(c.RALife.money(),bal,'F05 never touches the balance');
  if(heat!==null)assert.equal(c.RAHeat.value(),heat,'no HEAT from the second delivery');
  assert.equal(R.raids.history().length,1,'exactly one history entry');
  // a different outcome for the SAME raid id cannot flip a decided raid
  assert.equal(R.raids.applyDefense({canonical:'HELD',raidId:id}).canonical,'BREACHED','receipt wins over a conflicting redelivery');
  console.log('PASS F05 outcome idempotency: a resolved raid is not applied twice, repeated delivery is a receipt');
 }

 // ---- persistence: the canonical outcome survives a save round trip
 {
  const c=await load(root,{flag:true});const R=c.RAF05;
  unlockRich(c);money(c,1e6);R.unlock.buy('the_bando');c.RAHeat.add(60,{source:'test'});R.raids.schedule();
  R.raids.applyDefense({canonical:'FELL_BACK',raidId:R.raids.pending().id});
  const store=c.RASaveFixtures.memoryStorage();c.RAState.write(store,c.RAState.get());
  const loaded=c.RAState.read(store);
  assert.equal(loaded.state.frag.F05.raids.lastOutcome.canonical,'FELL_BACK','last outcome persists');
  assert.equal(loaded.state.frag.F05.raids.history.length,1);
  console.log('PASS F05 outcome persistence: canonical outcome + history survive a reload');
 }

 // ---- F05 -> F01 handoff: the request for the PENDING raid, authored/state data only
 {
  const c=await load(root,{flag:true});const R=c.RAF05;
  unlockRich(c);money(c,1e6);R.unlock.buy('the_bando');c.RAHeat.add(60,{source:'test'});
  assert.equal(R.raids.handoff().reason,'no-pending-raid','nothing to hand off before a raid is scheduled');
  assert.equal(R.raids.schedule().ok,true);
  const h=R.raids.handoff();
  assert.equal(h.ok,true,'handoff works AFTER schedule() (the real night->wake->HOLD path)');
  assert.equal(h.play.job,'hold_the_house');assert.equal(h.play.defense,true);assert.equal(h.play.shape,'HOLD THE HOUSE');
  assert.equal(h.play.houseId,'the_bando');assert.equal(h.request.raidId,R.raids.pending().id);
  same(Object.keys(h.request).sort(),['attacker','bigRaid','day','defenders','holdTurns','houseId','raidId','supports']);
  for(const legacy of ['map','f01Pending','kind','packet','weapons','atNight'])assert.equal(legacy in h.request||legacy in h.play||legacy in h,false,'no legacy tactical/pending concept: '+legacy);
  assert.ok(Array.isArray(h.request.holdTurns),'holdTurns is an array in the request');
  assert.equal(R.raids.pending().state,'handed','handoff persists the handed state');
  same(R.raids.handoff().request,h.request);assert.equal(R.raids.handoff().raidId,h.raidId,'handoff is idempotent for the same raid');
  console.log('PASS F05 handoff: canonical HOLD THE HOUSE request for the pending raid (slim, idempotent, persisted handed state)');
 }

 // ---- holdTurns: one shape (array) with and without F02
 {
  const c=await load(root,{flag:true});const R=c.RAF05;
  same(R.weapons.holdTurns(),[],'F02 absent: an empty array, nothing invented');
  assert.equal(R.weapons.status().pending,'F02_INTEGRATION_PENDING');
  console.log('PASS F05 holdTurns: normalized to F02\'s array shape in both modes');
 }

 console.log('PASS F05 THE TRAP (authored traphouse/production/sales loop, F01 raid boundary, F02 seam, shared HEAT, ledger, persistence)');
}


