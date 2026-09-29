// F01 seams: F04 War Room packet in / result out, F02 weapon stats, F05/F07 profiles, flag gate.
import assert from 'node:assert/strict';
import {core,scenario,oga,must,tweak,J,playOut} from './_lib.mjs';

export async function test(root){
  const c=await core(root);const P=c.RAShowdownPackets,E=c.RAShowdownEngine,SD=c.RAShowdown,R=c.RAShowdownRules,D=c.RAShowdownData;
  // ---- F04: the exact packet shape F04's buildEntryPacket produces ----
  const f04=(over={})=>({jobId:'j-9',jobType:'TAKE_THE_BLOCK',isHandBack:false,district:'koreatown',districtLabel:'KOREATOWN',approach:'LOUD',
   grid:{cols:6,rows:9,location:'koreatown'},
   squad:[{id:'tunde',name:'TUNDE',class:'MUSCLE',stories:{survived_car_wash:true},bonds:{dre:3},actionsPerTurn:2,stats:{mobility:6,aim:60,hp:8,defense:10}},
          {id:'dre',name:'DRE',class:'TALKER',stories:{},bonds:{tunde:3},stats:{mobility:4,aim:70,hp:6,defense:0}},
          {id:'half_pint',name:'HALF-PINT',class:'GHOST',stories:{saw_95_miss:true},bonds:{},stats:{}}],
   car:{id:'supra',handling:60,stats:{}},rich:{hp:12,canBeGone:false,pullUpFromTurn:3,heatCostIfVisible:15,vgPostIfVisible:true},
   modifiers:['RAIN'],enemies:[{type:'CHEWER',faction:'open_mouth_gang',count:3},{type:'ENFORCER',faction:'open_mouth_gang',count:1}],
   resolutionContract:{required:['outcome','ogaResults','heatDelta','cashDelta','richUsedPullUp','richVisible']},f01Pending:'F01_INTEGRATION_PENDING',...over});
  {const b=P.fromWarRoomPacket(f04());assert.equal(b.ok,true,JSON.stringify(b.errors));
   const cfg=b.config;assert.equal(cfg.jobId,'j-9');assert.equal(cfg.jobType,'TAKE_THE_BLOCK');
   assert(b.notes.some(n=>n.startsWith('STATS_IGNORED:tunde')),"F04's provisional stat block is ignored: Vol 7 numbers rule");
   assert(b.notes.some(n=>n.startsWith('FALLBACK_MAP')),'no authored location map => neutral map, and it says so');
   const s=E.create(cfg);assert.equal(s.units.tunde.maxHp,9);assert.equal(s.units.tunde.aim,60);assert.equal(s.units.tunde.mobility,5,'MUSCLE 9/60/5, not the packet');
   assert.equal(s.units.tunde.race,'HUMAN');assert.equal(JSON.stringify(s.units.tunde.traits),'["CALM","ALWAYS_EATING"]','named Oga traits come from the roster');
   assert.equal(JSON.stringify(s.units.tunde.stories),'["survived_car_wash"]','story object -> story ids');
   assert.equal(JSON.stringify(s.units.tunde.bonds),'["dre"]','3 shared jobs => DAY ONES (F04 threshold)');assert.equal(s.units.half_pint.bonds.length,0);
   assert.equal(Object.values(s.units).filter(u=>u.kind==='ENEMY').length,4);assert.equal(s.modifiers[0],'RAIN');assert(s.rich.enabled); }
  // packet errors are structured, not thrown
  assert.equal(P.fromWarRoomPacket(f04({squad:[{id:'x',class:'WIZARD'}]})).ok,false);
  assert.equal(P.fromWarRoomPacket(f04({enemies:[{type:'DRAGON',count:1}]})).ok,false);
  assert.equal(P.fromWarRoomPacket(f04({squad:[]})).ok,false);assert.equal(P.fromWarRoomPacket(null).ok,false);
  // ---- profiles: TAKE THE BLOCK / EXTRACT / RETALIATION / HAND BACK / emergency ----
  assert.equal(P.fromWarRoomPacket(f04({jobType:'EXTRACT'})).config.objective.kind,'EXTRACT_TARGET');
  assert.equal(P.fromWarRoomPacket(f04({jobType:'RETALIATION',enemies:[{type:'HUNTER',count:3}]})).config.objective.kind,'ELIMINATE');
  const hb=P.fromWarRoomPacket(f04({isHandBack:true}));assert.equal(hb.profile,'HAND_BACK');assert.equal(hb.config.jobType,'HAND_BACK');
  const em=P.fromWarRoomPacket(f04(),{emergency:true});assert.equal(em.config.turnLimit,4,'emergency RUN escalation = short 4-turn fight');assert.equal(em.config.jobType,'EMERGENCY');
  // ---- result out: what F04.receiveResolution needs ----
  {const b=P.fromWarRoomPacket(f04());let s=E.create(b.config);
   s=must(c,s,{type:'RETREAT'}).state;const res=s.result;
   const out=P.toF04Resolution(res);
   for(const k of ['outcome','ogaResults','heatDelta','cashDelta','richUsedPullUp','richVisible'])assert(k in out&&out[k]!==undefined,'F04 requires '+k);
   assert.equal(out.outcome,'retreat');assert(out.ogaResults.every(o=>['ACTIVE','DOWNED','CAPTURED'].includes(o.finalStatus)&&typeof o.id==='string'));
   assert.equal(P.toF04Resolution({...res,outcome:'VICTORY'}).outcome,'victory');assert.equal(P.toF04Resolution({...res,outcome:'FAILURE'}).outcome,'defeat');
   assert.equal(res.schema,'F01.result/1');assert.equal(res.cash,0,'rewards are the strategic layer\'s job');
   const st=P.toStrategic(res);assert.equal(st.schema,'F01.strategic/1');assert.equal(st.gone.length,0);assert(/never finalizes GONE/.test(st.note)); }
  // ---- F05 / F07: reusable profiles, no Trap or finale logic here ----
  {const squad=[{id:'a',class:'MUSCLE'},{id:'b',class:'DOC'}];
   const raid=P.entry('TRAP_RAID',{squad,enemies:[{type:'CHEWER',count:2}]});assert.equal(raid.ok,true);assert.equal(raid.config.objective.kind,'ELIMINATE');
   const def=P.entry('TRAP_DEFENSE',{squad,enemies:[{type:'HUNTER',count:2}]});assert.equal(def.config.objective.kind,'SURVIVE');
   assert.equal(P.entry('NOPE',{squad}).ok,false);
   P.registerProfile('F07_TEST_HOOK',{objective:{kind:'ELIMINATE'},source:'F07'});assert.equal(P.entry('F07_TEST_HOOK',{squad,enemies:[{type:'LIEUTENANT',count:1}]}).ok,true);
   assert.throws(()=>P.registerProfile('F07_TEST_HOOK',{objective:{kind:'ELIMINATE'}}),/already registered/);assert.throws(()=>P.registerProfile('bad',{objective:{kind:'ELIMINATE'}}),/UPPER_SNAKE/);assert.throws(()=>P.registerProfile('X_Y',{objective:{kind:'DANCE'}}),/objective/);
   // headless entry through the facade
   return facade(c,P,SD,squad); }
}
async function facade(c,P,SD,squad){
  const R=c.RAShowdownRules,E=c.RAShowdownEngine;
  const e=await SD.enter('TRAP_DEFENSE',{squad,enemies:[{type:'CHEWER',count:2}],headless:true});assert.equal(e.ok,true);assert.equal(e.session.state.objective.kind,'SURVIVE');
  const f=await SD.f04.enter({jobId:'q',jobType:'TAKE_THE_BLOCK',squad:[{id:'tunde',class:'MUSCLE'},{id:'dre',class:'TALKER'}],enemies:[{type:'CHEWER',count:2}]},{headless:true});assert.equal(f.ok,true);
  const bad=await SD.f04.enter({squad:[]},{headless:true});assert.equal(bad.ok,false);assert.equal(bad.code,'BAD_PACKET');
  // ---- flag gate: inside the game (RAFeatures present) everything refuses while the flag is OFF ----
  let on=false;c.RAFeatures={enabled:id=>id==='F01.showdown_core'&&on};
  const off=SD.createSession({seed:1,map:c.RAShowdownMaps.get('alley'),squad:[{id:'a',cls:'DOC'}],enemies:['CHEWER']});assert.equal(off.ok,false);assert.equal(off.code,'FLAG_OFF');
  assert.equal((await SD.f04.enter({jobId:'q',squad:[{id:'tunde',class:'MUSCLE'}],enemies:[{type:'CHEWER',count:1}]},{headless:true})).code,'FLAG_OFF');
  assert.equal((await SD.enter('TRAP_RAID',{squad,enemies:[{type:'CHEWER',count:1}]})).code,'FLAG_OFF');
  on=true;assert.equal(SD.createSession({seed:1,map:c.RAShowdownMaps.get('alley'),squad:[{id:'a',cls:'DOC'}],enemies:['CHEWER']}).ok,true);delete c.RAFeatures;
  // ---- F02: per-gun Showdown stats bound through the documented seam ----
  const STATS={lil_oga:{damage:3,range:'close',note:'never misses on overwatch'},sapporo_shotgun:{damage:'4-6',range:'close',hits:2,note:'hits two enemies'},mac_and_cheese:{damage:'2x3',range:'mid',note:'suppresses'},
   chopstick_sniper:{damage:'4-6',range:'long'},holy_baby_drake:{damage:'4-5',range:'mid'},jollof_burner:{damage:3,range:'area',area:'cone3',burn:{dmg:8,turns:3}},blueberry_blaster:{damage:'5-7',range:'long'},
   legendary_draco:{damage:'4-6',range:'mid',hits:2},golden_draco:{damage:'4-6',range:'mid',hits:2},rpg:{damage:5,range:'area',area:'3x3'},auntie_slipper:{damage:2,range:'close',knockback:true},tommy_tony:{damage:'2x4',range:'mid'},triple_k_kratos:{damage:999,range:'area'}};
  const carried={a:'mac_and_cheese',b:'legendary_draco',c:'blueberry_blaster'};const mods={a:['silencer'],b:['scope','gold_plating']};
  const iron={stats:id=>{const s=STATS[id];return s?{...s,mods:Object.entries(carried).filter(([o,g])=>g===id).flatMap(([o])=>mods[o]||[])}:null;},roster:()=>Object.keys(STATS).map(id=>({id})),carried:o=>carried[o]||null};
  const rep=P.bindF02(iron);assert.equal(rep.bound,true);
  assert(rep.conflicts.some(x=>x.id==='lil_oga'&&x.field==='range'),'Vol 7 (medium) vs F02 (close) for LIL OGA is reported, not hidden');
  assert(rep.unsupported.some(x=>x.id==='jollof_burner'),'JOLLOF burn scale is SOURCE_REQUIRED');assert(rep.unsupported.some(x=>x.id==='tommy_tony'));
  const built=P.fromWarRoomPacket({jobId:'f2',squad:[{id:'a',class:'SHOOTER'},{id:'b',class:'WHEELS'},{id:'c',class:'GHOST'}],enemies:[{type:'ENFORCER',count:2}]},{conditions:{}});
  assert.equal(built.ok,true);const s=E.create(built.config);
  assert.equal(s.units.a.weapon.id,'mac_and_cheese','Oga carried weapon comes from F02');assert.equal(s.units.a.weapon.max,3);
  assert.equal(JSON.stringify(s.units.a.mods),'["silencer"]');assert.equal(JSON.stringify(s.units.b.mods),'["scope"]','only Showdown-relevant mods are taken; cosmetics are ignored');
  const w=s.weapons.mac_and_cheese;assert.equal(w.hits,3);assert.equal(JSON.stringify(w.dmg),'[2,2]','2x3: three hits of 2');
  // MAC & CHEESE: 3 hits per shot, suppress on hit
  {let t=tweak(c,scenario(c,{squad:[oga('a','SHOOTER',{x:2,y:6})],enemies:[{type:'ENFORCER',x:2,y:3}],extra:{weapons:{mac_and_cheese:s.weapons.mac_and_cheese}}}),x=>{x.units.a.weapon={id:'mac_and_cheese',clip:3,max:3,fired:0};x.units.a.aim=100;x.units.e1.hp=99;x.units.e1.maxHp=99;});
   const r=must(c,t,{type:'SHOOT',unit:'a',target:'e1'});assert.equal(r.events.filter(e=>e.t==='SHOT').length,3,'one action, three hits');assert.equal(r.state.units.e1.suppress,true,'suppressed: -20 aim on its next turn');
   const pv=R.preview(r.state,r.state.units.e1,r.state.units.a);assert.equal(pv.breakdown.some(l=>l.id==='suppress'),true); }
  // LEGENDARY DRACO: two taps, each at -10 aim
  {const d=s.weapons.legendary_draco;assert.equal(d.bursts,2);assert.equal(d.burstAim,-10);
   let t=tweak(c,scenario(c,{squad:[oga('a','SHOOTER',{x:2,y:6})],enemies:[{type:'ENFORCER',x:2,y:3}],extra:{weapons:{legendary_draco:d}}}),x=>{x.units.a.weapon={id:'legendary_draco',clip:4,max:4,fired:0};});
   assert.equal(R.preview(t,t.units.a,t.units.e1).breakdown.find(l=>l.id==='burst').value,-10);
   const r=must(c,tweak(c,t,x=>{x.units.e1.hp=99;x.units.e1.maxHp=99;}),{type:'SHOOT',unit:'a',target:'e1'});assert.equal(r.events.filter(e=>e.t==='SHOT').length,2);assert.equal(r.state.units.a.weapon.clip,3,'two taps = one action, one round of the clip'); }
  // BLUEBERRY BLASTER only works if Mazda is MAJESTIC (host-supplied condition)
  {const w2=s.weapons.blueberry_blaster;assert.equal(w2.condition,'mazdaMajestic');
   const mk=cond=>tweak(c,scenario(c,{squad:[oga('a','SHOOTER',{x:2,y:6})],enemies:[{type:'CHEWER',x:2,y:3}],extra:{weapons:{blueberry_blaster:w2},conditions:cond}}),x=>{x.units.a.weapon={id:'blueberry_blaster',clip:3,max:3,fired:0};});
   const no=E.apply(mk({}),{type:'SHOOT',unit:'a',target:'e1'});assert.equal(no.ok,false);assert.equal(no.code,'CONDITION');
   assert.equal(E.apply(mk({mazdaMajestic:true}),{type:'SHOOT',unit:'a',target:'e1'}).ok,true); }
  // SCOPE: +10 aim at range; SILENCER: concealment survives shots (see classes.test) and heat is reported
  {const t=tweak(c,scenario(c,{squad:[oga('a','SHOOTER',{x:2,y:8,mods:['scope']})],enemies:[{type:'CHEWER',x:2,y:3}]}),x=>{});const pv=R.preview(t,t.units.a,t.units.e1);assert.equal(pv.breakdown.find(l=>l.id==='scope').value,10);
   const near=scenario(c,{squad:[oga('a','SHOOTER',{x:2,y:5,mods:['scope']})],enemies:[{type:'CHEWER',x:2,y:3}]});assert.equal(R.preview(near,near.units.a,near.units.e1).breakdown.some(l=>l.id==='scope'),false,'no scope bonus up close');
   let q=tweak(c,scenario(c,{squad:[oga('a','SHOOTER',{x:2,y:6,mods:['silencer']}),oga('b','DOC',{x:0,y:8})],enemies:[{type:'ENFORCER',x:2,y:3}]}),x=>{x.units.e1.hp=99;x.units.e1.maxHp=99;});
   q=must(c,q,{type:'SHOOT',unit:'a',target:'e1'}).state;const res=must(c,q,{type:'RETREAT'}).state.result;assert.equal(res.heat.silencerRelief,-2,'SILENCER: -heat from gunfights (F02 heatRelief 2), reported not applied');assert.equal(res.heat.base,-2); }
  // RPG heat is reported
  {const t=scenario(c,{squad:[oga('a','WHEELS',{x:2,y:7,weapon:'rpg'})],enemies:[{type:'CHEWER',x:2,y:4},{type:'CHEWER',x:5,y:0}]});const r=must(c,t,{type:'SHOOT',unit:'a',at:{x:2,y:4}});const res=must(c,r.state,{type:'RETREAT'}).state.result;assert.equal(res.heat.rpg,10);assert.equal(res.heat.base,10); }
  // no F02 on the page: documented fallback
  P.bindF02({});assert.equal(P.f02Report().bound,false);
  console.log('PASS F01 seams (F04 packet in / resolution out with no HEAT double-count, profiles, F05/F07 entry, flag gate, F02 stats: multi-hit, two taps, condition, scope/silencer, conflicts reported)');
}
