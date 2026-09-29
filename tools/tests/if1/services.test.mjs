// IF-1 4E–4M contract: money ledger, HEAT, trust/clout/tendency, crew, vehicles, districts, VampGram API, sales channels,
// Combat 2.0 extension points. Every service is exercised through the headless game (production load order) with all
// fragment flags OFF, and against the accepted systems it wraps (results must be identical to calling them directly).
import assert from 'node:assert/strict';
import {game,throwsCode,same} from './_lib.mjs';

export async function test(root){
  await money(root);await heat(root);await social(root);await crew(root);await vehicles(root);await districts(root);await vampgram(root);await sales(root);await combat2(root);
  console.log('PASS IF-1 services (money ledger, HEAT, trust/clout/tendency, crew, vehicles, districts, VampGram API, sales channels, Combat2 extension points)');
}

async function money(root){
  const c=await game(root);const {RALife,RAMoneyLedger:L,RABudget,RAState,RAFeatures}=c;
  L.reset();const start=RALife.money();
  RALife.addMoney(100);RALife.spend(30);RABudget.add(5);RABudget.spend(2);
  L.withSource('trap:sale',()=>RALife.addMoney(50));L.withSource('war_room:upkeep',()=>RALife.spend(20));
  assert.equal(RALife.money(),start+100-30+5-2+50-20,'ledger observes; amounts are exactly the accepted arithmetic');
  const e=L.entries();same(e.map(x=>[x.delta,x.source,x.family]),[[100,'untagged','untagged'],[-30,'untagged','untagged'],[5,'untagged','untagged'],[-2,'untagged','untagged'],[50,'trap:sale','trap'],[-20,'war_room:upkeep','war_room']],'every path (RALife, RABudget) recorded with a source tag');
  assert.equal(e.at(-1).balance,RALife.money());
  same(L.byFamily().trap,{in:50,out:0,net:50,count:1});assert.equal(L.query({family:'war_room'}).length,1);assert.equal(L.query({source:'trap'}).length,1);
  // explicit tagged API + async source scope
  L.credit(10,{source:'rainmaker:bing'});assert.equal(L.entries().at(-1).source,'rainmaker:bing');assert.equal(L.debit(1e9,{source:'trap:x'}),false,'overspend refused exactly as RALife.spend');
  await L.withSource('trap:async',async()=>{RALife.addMoney(1);});assert.equal(L.entries().at(-1).source,'trap:async');RALife.addMoney(1);assert.equal(L.entries().at(-1).source,'untagged','source scope pops after async work');
  // adventure fallback + NEW OGA compatibility adapter (accepted function, identical result, tagged)
  const a=await game(root),b=await game(root,{if1:false});
  const run=async ctx=>{ctx.RAState.patch('life.world.day',9);const r=ctx.RANewOga.completeM1('STICK_UP');return {r:JSON.stringify(r),money:ctx.RALife.money(),items:JSON.stringify(ctx.RALife.life().ownership.items),heat:ctx.RANewOga.current().heat};};
  a.RAMoneyLedger.reset();const ra=await run(a),rb=await run(b);
  same(ra,rb,'NEW OGA M1 outcome identical with and without IF-1');
  assert.equal(a.RAMoneyLedger.entries().at(-1).source,'new_oga:m1');assert.equal(a.RAMoneyLedger.entries().at(-1).family,'new_oga');assert.equal(a.RAMoneyLedger.entries().at(-1).delta,6000);
  // reset/load re-baselines without inventing an entry; persistence is OFF by default and mirrors totals when ON
  const n=L.entries().length;RAState.reset();assert.equal(L.entries().length,n,'new game does not book a phantom entry');
  assert(!RAState.get().frag,'ledger persistence OFF by default: the save is untouched');
  RAFeatures.set('if1.ledger_persist',true);RALife.addMoney(7);const saved=RAState.get().frag.if1.ledger;assert.equal(saved.totals.untagged.in>=7,true);assert(saved.recent.length>=1);
  RAFeatures.set('if1.ledger_persist',false);
}

async function heat(root){
  const c=await game(root);const {RAHeat:H,RANewOga,RAState,RASealed}=c;
  same(H.TIERS,['COOL','WARM','HOT','ON FIRE']);assert.equal(H.describe().provisional,true,'Vol 7 numeric floors are PROVISIONAL (SOURCE_REQUIRED)');
  assert.equal(H.global(),0);assert.equal(H.tierFor(0),'COOL');
  const events=[];H.onTierChange(e=>events.push(e));
  H.add(3,{source:'trap'});assert.equal(events.length,0,'no tier change yet');
  const floors=H.describe().floors;H.add(floors.WARM-3,{source:'trap'});
  assert.equal(events.length,1);same([events[0].scope,events[0].from,events[0].to,events[0].direction,events[0].source],['global','COOL','WARM','up','trap']);
  H.add(-100,{source:'cooldown'});assert.equal(H.global(),0,'cooling floors at zero');assert.equal(events.at(-1).to,'COOL');
  // per-district
  H.add(floors.HOT,{district:'d_a',source:'war_room'});assert.equal(H.district('d_a'),floors.HOT);assert.equal(events.at(-1).scope,'d_a');assert.equal(events.at(-1).to,'HOT');assert.equal(H.global(),0,'district heat is independent of global');
  same(H.snapshot().districts.d_a,{value:floors.HOT,tier:'HOT'});
  // compatibility: accepted NEW OGA heat writes flow into the global value and raise tier events; values untouched
  events.length=0;RAState.patch('life.world.day',9);RANewOga.completeM1('STICK_UP');
  assert.equal(RANewOga.current().heat,12,'accepted NEW OGA heat delta unchanged (+12)');assert.equal(H.global(),12);
  assert(events.some(e=>e.scope==='global'&&e.source==='new_oga'&&e.to==='HOT'),'NEW OGA heat writes become tier-change events');
  H.add(1);assert.equal(H.global(),13,'global = legacy NEW OGA heat + service component');
  // configure validation
  assert(throwsCode(()=>H.configure({floors:{COOL:0,WARM:5,HOT:5,'ON FIRE':9}}),/strictly increase/));
  H.configure({floors:{COOL:0,WARM:1,HOT:2,'ON FIRE':3},provisional:false});assert.equal(H.tierFor(3),'ON FIRE');assert.equal(H.describe().provisional,false);
  // private sealed subscriber hook: inert in OPEN, exposes nothing
  assert.equal(H.subscribePrivate(()=>{}),false,'OPEN build: private hook refuses (no pack installed)');
  H.configure({floors:{COOL:0,WARM:50,HOT:100,'ON FIRE':200}});
  const seen=[];RASealed.install({});assert.equal(H.subscribePrivate(e=>seen.push(e)),true);H.add(100);assert(seen.length>=1,'private subscriber receives the same tier events');
}

async function social(root){
  const a=await game(root),b=await game(root,{if1:false});
  const both=(fnA,fnB)=>[fnA(a),fnB(b)];
  const T=a.RASocial;
  T.trust.add(2);b.RANewOga.adjust('trust',2);T.gangClout.add(3);b.RANewOga.adjust('gangClout',3);T.tendency.add('solid',2);b.RALife.tendency('solid',2);T.streetClout.add(35);b.RALife.addPoints('clout',35);
  same(a.RAState.get().life.newOga,b.RAState.get().life.newOga,'trust/gangClout writes equal the accepted RANewOga.adjust results');
  same(a.RAState.get().life.tendencies,b.RAState.get().life.tendencies);same(a.RAState.get().life.resources,b.RAState.get().life.resources);
  assert.equal(T.trust.get(),2);assert.equal(T.trust.tier(),null,'2 has no named threshold (accepted)');T.trust.add(1);assert.equal(T.trust.tier(),'HIGH TRUST');T.trust.add(-3);assert.equal(T.trust.tier(),'LOW TRUST');
  same(T.trust.thresholds(),{LOW_MAX:0,HIGH_MIN:3});assert.equal(T.streetClout.tier(),'MID');assert.equal(T.tendency.leaning(),a.RALife.leaning());
  // authored values always win: a modifier never touches an authored delta; only an explicit {authored:false} delta
  T.trust.addModifier(d=>d*10);const t0=T.trust.get();T.trust.add(1);assert.equal(T.trust.get(),t0+1,'authored delta untouched by modifiers');T.trust.add(1,{authored:false});assert.equal(T.trust.get(),t0+11,'derived delta passes through modifiers');
  const events=[];T.on('trust',e=>events.push(e));T.trust.add(1);assert.equal(events.length,1);assert.equal(events[0].value,T.trust.get());
  assert(throwsCode(()=>T.on('bogus',()=>{}),/unknown kind/));
}

async function crew(root){
  const c=await game(root);const {RACrew:C,RALife,RAState,RAClock}=c;
  C.define({id:'u_a',fragment:'F91',name:'A',class:'k1'});C.define({id:'u_b',fragment:'F91',class:'k2'});
  assert(throwsCode(()=>C.define({id:'u_a',fragment:'F92'}),/already defined/));assert(!RAState.get().frag,'defining units writes nothing to the save');
  same(C.get('u_a').status,'ACTIVE');same(C.STATUSES,['ACTIVE','DOWNED','CAPTURED','GONE']);
  const day=RALife.today().day;C.setStatus('u_a','DOWNED',{reason:'test',timer:{days:2,onExpire:'ACTIVE'}});assert.equal(C.get('u_a').status,'DOWNED');
  C.story('u_a','met_b',true);C.bond('u_a','u_b',2);C.bond('u_a','u_b',1);assert.equal(C.get('u_a').bonds.u_b,3);assert.equal(C.stories('u_a').met_b,true);
  assert.equal(C.tick(day+1).length,0,'timer not yet due');assert.equal(C.tick(day+2).length,1);assert.equal(C.get('u_a').status,'ACTIVE','timer expiry restores the authored status');
  C.setStatus('u_b','CAPTURED');C.setStatus('u_b','GONE');assert.equal(C.setStatus('u_b','ACTIVE').ok,false,'GONE is terminal');assert.equal(C.get('u_b').status,'GONE');
  assert(throwsCode(()=>C.setStatus('u_a','BOGUS'),/unknown status/));C.registerStatus('IN_TRAINING');C.setStatus('u_a','IN_TRAINING');assert.equal(C.get('u_a').status,'IN_TRAINING');
  same(C.list({status:'GONE'}).map(u=>u.id),['u_b']);
  const persisted=RAState.migrateRecord(RAState.get());assert.equal(persisted.frag.if1.crew.units.u_b.status,'GONE','crew state survives save normalization');
  // wake bus drives timers
  C.setStatus('u_a','DOWNED',{timer:{days:1,onExpire:'ACTIVE'}});RAClock.sleep();assert.equal(C.get('u_a').status,'ACTIVE','WAKE tick expires timers');
  const seen=[];C.onChange(e=>seen.push(e.type));C.story('u_a','x');assert.deepEqual(seen,['story']);
}

async function vehicles(root){
  const a=await game(root),b=await game(root,{if1:false});
  for(const c of [a,b]){c.RALife.addCar({id:'car_t1',make:'T',model:'One'});c.RALife.addCar({id:'car_t2',make:'T',model:'Two'});}
  const V=a.RAVehicles;same(V.owned().map(x=>x.id),a.RALife.ownedCars().map(x=>x.id));assert.equal(V.has('car_t1'),true);
  assert.equal(V.tribute('car_t1').ok,true);assert.equal(V.tribute('car_t1').unchanged,true);assert.equal(V.isTributed('car_t1'),true);assert.equal(V.isTributed('car_t2'),false);assert.equal(V.tribute('nope').ok,false);
  V.recordDrive('car_t1');V.recordDrive('car_t1',{by:2});V.recordDrive('car_t2');assert.equal(V.driveCount('car_t1'),3);assert.equal(V.totalDrives(),4);assert.equal(V.recordDrive('nope').ok,false);
  a.RALife.counter('drives');assert.equal(V.globalDrives(),1,'accepted global drive counter is separate');assert.equal(V.driveCount('car_t1'),3);
  same(a.RAState.get().life.ownership.cars,b.RAState.get().life.ownership.cars,'ownership record unchanged by TRIBUTED/drive state');
  assert.equal(V.list().find(x=>x.id==='car_t1').service.tributed,true);
}

async function districts(root){
  const c=await game(root);const {RADistricts:D,RAHeat,RAState}=c;
  D.define({id:'dist_a',fragment:'F91',label:'A'});D.define({id:'dist_b',fragment:'F91'});assert(throwsCode(()=>D.define({id:'dist_a',fragment:'F92'}),/already defined/));
  assert.equal(D.get('dist_a').state,'UNCONTROLLED');assert(!RAState.get().frag);
  const events=[];D.onChange(e=>events.push(e));
  assert.equal(D.setControl('dist_a','CONTROLLED',{holder:'rich',reason:'test'}).ok,true);assert.equal(D.setControl('dist_a','CONTROLLED',{holder:'rich'}).unchanged,true);
  same([events.length,events[0].from,events[0].to,events[0].holder],[1,'UNCONTROLLED','CONTROLLED','rich']);same(D.held('rich'),['dist_a']);
  assert(throwsCode(()=>D.setControl('dist_a','BOGUS'),/unknown state/));assert(throwsCode(()=>D.setControl('zzz','CONTROLLED'),/unknown district/));
  D.registerState('CONTESTED');D.setControl('dist_b','CONTESTED');assert.equal(D.get('dist_b').state,'CONTESTED');
  RAHeat.add(RAHeat.describe().floors.HOT,{district:'dist_a'});assert.equal(D.get('dist_a').heat.tier,'HOT','district HEAT is mirrored through RAHeat');
  assert.equal(RAState.migrateRecord(RAState.get()).frag.if1.districts.dist_a.holder,'rich','district state survives normalization');
}

async function vampgram(root){
  const c=await game(root);const {RAVampGramAPI:V,RAVampGram,RAFeatures}=c;
  assert(throwsCode(()=>V.post('ghost',{id:'x',text:'x'}),/not a registered account/));
  RAFeatures.register({id:'F91.vg',fragment:'F91'});
  V.registerAccount({handle:'f91.test',fragment:'F91',displayName:'F91',avatar:'no_such_avatar'});assert(throwsCode(()=>V.registerAccount({handle:'f91.test',fragment:'F92'}),/already registered/));
  assert(throwsCode(()=>V.registerAccount({handle:'Bad Handle',fragment:'F91'}),/lowercase/));
  V.registerAccount({handle:'f91.dark',fragment:'F91',flag:'F91.vg'});
  const seen=[];V.onPost(e=>seen.push(e.id));
  assert.equal(V.post('f91.test',{id:'p1',text:'hello',likes:3}),true);assert.equal(V.post('f91.test',{id:'p1',text:'dup'}),false,'stable id dedupes');assert(throwsCode(()=>V.post('f91.test',{text:'no id'}),/stable id/));
  assert.equal(V.post('f91.dark',{id:'d1',text:'dark'}),false,'flag OFF: nothing posts');RAFeatures.set('F91.vg',true);assert.equal(V.post('f91.dark',{id:'d1',text:'lit'}),true);
  same(seen,['p1','d1']);assert.equal(V.feed({handle:'f91.test'}).length,1);assert.equal(V.feed({handle:'f91.test'})[0].text,'hello');
  assert.equal(V.avatarFor('f91.test'),null,'unknown avatar key resolves to null (no invented art)');assert.equal(V.avatarKey('f91.test'),'no_such_avatar');
  assert.equal(RAVampGram.post({id:'legacy1',handle:'richalucard',text:'accepted path still works'}),true);
  const unseen=V.unseen();assert(unseen>=3);V.markSeen();assert.equal(V.unseen(),0);
}

async function sales(root){
  const c=await game(root);const {RASalesChannels:S,RAFeatures,RALife,RAMoneyLedger}=c;
  same(S.list().map(x=>[x.id,x.fragment,x.reserved,x.claimed]),[['trap','F05',true,false],['rainmaker','F06',true,false]]);assert.equal(S.resolve('bing'),'rainmaker');assert.equal(S.get('BING').id,'rainmaker');
  assert.equal(S.record('trap',{amount:100}).ok,false,'reserved but unclaimed: no economy exists');
  assert(throwsCode(()=>S.claim('trap',{fragment:'F06'}),/reserved for F05/));
  S.claim('trap',{fragment:'F05',meta:{k:1}});assert(throwsCode(()=>S.claim('trap',{fragment:'F05'}),/already claimed/));
  assert.equal(S.record('trap',{amount:100}).ok,false,'claimed but DARK: flag OFF');
  RAFeatures.set('F05.trap',true);const before=RALife.money();RAMoneyLedger.reset();
  assert.equal(S.record('trap',{amount:100,kind:'sale'}).ok,true);assert.equal(S.record('trap',{amount:-40,kind:'cost'}).ok,true);assert.equal(RALife.money(),before+60);
  same(RAMoneyLedger.entries().map(e=>[e.source,e.delta]),[['trap:sale',100],['trap:cost',-40]]);assert.equal(S.record('trap',{amount:0}).ok,false);
  S.register({id:'f91_shop',fragment:'F91'});assert(throwsCode(()=>S.register({id:'f91_shop',fragment:'F91'}),/already exists/));
}

async function combat2(root){
  const a=await game(root),b=await game(root,{if1:false});
  const enemy='bruce_loose';const seeded=()=>{let s=12345;return()=>{s=(Math.imul(s,1103515245)+12345)>>>0;return s/4294967296;};};
  const script=(ctx)=>{const s=ctx.RACombat2Rules.create(enemy,{},undefined,seeded());const log=[];for(const act of [{type:'move',id:'bite'},{type:'move',id:'blood'},{type:'weapon',id:'ghost'},{type:'move',id:'bite'},{type:'move',id:'revenge'}]){if(s.over)break;ctx.RACombat2Rules.act(s,act);log.push(...s.log.map(l=>l.text));}return {log,hp:[s.rich.hp,s.enemy.hp],turn:s.turn,over:s.over};};
  same(script(a),script(b),'Combat 2.0 with the extension seams present but EMPTY plays byte-identically to baseline');
  const X=a.RACombat2Ext,F=a.RAFeatures;same(X.registered(),{weapons:[],bosses:[],items:[],actions:[]});
  assert(throwsCode(()=>X.registerWeapon({id:'w1',fragment:'F02',use(){}}),/flag required/),'combat extensions must integrate DARK');
  assert(throwsCode(()=>X.registerWeapon({id:'w1',fragment:'F02',flag:'F02.nope',use(){}}),/not registered/));
  const used=[],hooks=[];
  X.registerWeapon({id:'test_weapon',fragment:'F02',flag:'F02.iron_and_grace',label:'TEST WEAPON',use:(s,action,h)=>{used.push(action.id);h.say(s,'TEST WEAPON.','weird');h.damageToEnemy(s,20,{label:'TW',crit:false});return h.endPlayer(s);}});
  X.registerBossScript(enemy,{fragment:'F02',flag:'F02.iron_and_grace',onCreate:s=>hooks.push('create'),beforeEnemyTurn:s=>hooks.push('before'),afterEnemyTurn:s=>hooks.push('after'),onEnd:s=>hooks.push('end')});
  X.registerItemHook('garlic',{fragment:'F02',flag:'F02.iron_and_grace',before:(s,it)=>hooks.push('item-before')&&undefined,after:()=>hooks.push('item-after')});
  assert(throwsCode(()=>X.registerBossScript(enemy,{fragment:'F03',flag:'F03.new_oga_ladder_close'}),/already scripted/));assert(throwsCode(()=>X.registerAction('move',{fragment:'F02',flag:'F02.iron_and_grace',handle(){}}),/is taken/));
  // flag OFF: seams inert
  let s=a.RACombat2Rules.create(enemy,{},undefined,seeded());assert.equal(X.menuButtons(s).length,0);a.RACombat2Rules.act(s,{type:'weapon',id:'test_weapon'});assert.equal(used.length,0,'flag OFF: weapon does nothing');assert.equal(hooks.length,0,'flag OFF: boss/item hooks silent');
  // flag ON: weapon button appears, action dispatches through the rules helpers; boss + item hooks fire
  F.set('F02.iron_and_grace',true);s=a.RACombat2Rules.create(enemy,{},undefined,seeded());
  same(X.menuButtons(s),[{label:'TEST WEAPON',act:'weapon:test_weapon',cls:''}]);same(X.actionFromButton('weapon:test_weapon',s),{type:'weapon',id:'test_weapon'});assert.equal(X.actionFromButton('weapon:zzz',s),null);
  const hp=s.enemy.hp;a.RACombat2Rules.act(s,{type:'weapon',id:'test_weapon'});assert.deepEqual(used,['test_weapon']);assert(s.enemy.hp<hp,'weapon damaged the enemy through damageToEnemy');assert(hooks.includes('create')&&hooks.includes('before')&&hooks.includes('after'));
  s.items.garlic=1;a.RACombat2Rules.act(s,{type:'item',id:'garlic'});assert(hooks.includes('item-before')&&hooks.includes('item-after'));a.RACombat2Rules.finish(s);assert(hooks.includes('end'));
  F.set('F02.iron_and_grace',false);
}
