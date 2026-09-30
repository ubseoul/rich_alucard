// F01 turn system: action economy, phases, overwatch, hunker, reload, ammo, RPG, items.
import assert from 'node:assert/strict';
import {core,scenario,oga,must,refused,tweak,OPEN,J,ids} from './_lib.mjs';

export async function test(root){
  const c=await core(root);const R=c.RAShowdownRules,E=c.RAShowdownEngine,D=c.RAShowdownData;
  // ---- action economy: 2 actions per Oga per turn ----
  let s=scenario(c,{squad:[oga('a','GHOST',{x:1,y:7}),oga('b','DOC',{x:3,y:7})],enemies:[{type:'CHEWER',x:5,y:0}],revealed:false});
  assert.equal(s.units.a.ap,2);assert.equal(D.ACTIONS_PER_TURN,2);
  refused(c,s,{type:'DASH',unit:'a',to:{x:1,y:5}},'NO_PRIOR_MOVE');
  s=must(c,s,{type:'MOVE',unit:'a',to:{x:1,y:4}}).state;assert.equal(s.units.a.ap,1);
  s=must(c,s,{type:'DASH',unit:'a',to:{x:1,y:1}}).state;assert.equal(s.units.a.ap,0);
  refused(c,s,{type:'MOVE',unit:'a',to:{x:2,y:1}},'NO_ACTIONS');refused(c,s,{type:'HUNKER',unit:'a'},'NO_ACTIONS');refused(c,s,{type:'OVERWATCH',unit:'a'},'NO_ACTIONS');
  assert.equal(s.units.b.ap,2,'other Ogas keep their own actions');
  // every authorised action costs exactly one
  for(const a of [{type:'HUNKER',unit:'b'},{type:'OVERWATCH',unit:'b'}]){const r=must(c,scenario(c,{squad:[oga('b','DOC',{x:3,y:7})],enemies:[{type:'CHEWER',x:5,y:0}],revealed:false}),a);assert.equal(r.state.units.b.ap,1,a.type+' costs 1');}
  // unknown / foreign / dead units and actions are refused
  refused(c,s,{type:'FLY',unit:'b'},'BAD_ACTION');refused(c,s,{type:'MOVE',unit:'nobody',to:{x:0,y:0}},'NO_UNIT');refused(c,s,{type:'MOVE',unit:'e1',to:{x:4,y:0}},'NOT_YOURS');
  // ---- end of turn: enemy phase, turn counter, refresh ----
  let t=scenario(c,{squad:[oga('a','SHOOTER',{x:2,y:7})],enemies:[{type:'CHEWER',x:2,y:1}],revealed:false});
  assert.equal(t.turn,1);const r1=must(c,t,{type:'END_TURN'});
  assert.equal(r1.state.turn,2);assert.equal(r1.state.phase,'PLAYER');assert.equal(r1.state.units.a.ap,2,'actions refresh');
  assert(ids(r1.events,'PHASE').map(e=>e.phase).join()==='ENEMY,PLAYER','enemy turn follows, then yours');
  assert.equal(r1.state.units.e1.x,2,'an unspotted pod stays put');
  // once spotted, the pod acts on the enemy turn
  let u=scenario(c,{squad:[oga('a','SHOOTER',{x:2,y:5})],enemies:[{type:'CHEWER',x:2,y:1}]});
  const r2=must(c,u,{type:'END_TURN'});assert(r2.events.some(e=>e.t==='SHOT'||e.t==='MOVE'),'revealed enemies act');
  // an ended showdown accepts nothing
  const end=must(c,scenario(c,{squad:[oga('a','SHOOTER',{x:2,y:7})],enemies:[{type:'CHEWER',x:2,y:1}]}),{type:'RETREAT'}).state;
  assert.equal(end.status,'ENDED');refused(c,end,{type:'END_TURN'},'ENDED');refused(c,end,{type:'MOVE',unit:'a',to:{x:2,y:6}},'ENDED');
  // ---- SHOOT costs an action and spends ammo; RELOAD refills; no ammo blocks the shot ----
  let g=scenario(c,{squad:[oga('a','SHOOTER',{x:2,y:6,weapon:'pistol'})],enemies:[{type:'ENFORCER',x:2,y:3}]});
  g=tweak(c,g,x=>{x.units.e1.hp=99;x.units.e1.maxHp=99;});
  assert.equal(g.units.a.weapon.clip,4);
  g=must(c,g,{type:'SHOOT',unit:'a',target:'e1'}).state;assert.equal(g.units.a.weapon.clip,3);assert.equal(g.units.a.ap,1);
  g=tweak(c,g,x=>{x.units.a.weapon.clip=0;x.units.a.ap=2;});
  refused(c,g,{type:'SHOOT',unit:'a',target:'e1'},'NO_AMMO');refused(c,g,{type:'OVERWATCH',unit:'a'},'NO_AMMO');
  g=must(c,g,{type:'RELOAD',unit:'a'}).state;assert.equal(g.units.a.weapon.clip,4);assert.equal(g.units.a.ap,1);
  refused(c,g,{type:'RELOAD',unit:'a'},'FULL');
  const drum=scenario(c,{squad:[oga('a','SHOOTER',{x:2,y:6,mods:['drum_mag']})],enemies:[{type:'CHEWER',x:2,y:0}],revealed:false});
  assert.equal(drum.units.a.weapon.max,5,'DRUM MAG: +1 ammo');
  // ---- CHOPSTICK SNIPER: cannot fire (or overwatch) after moving ----
  let sn=scenario(c,{squad:[oga('a','SHOOTER',{x:2,y:6,weapon:'chopstick_sniper'})],enemies:[{type:'CHEWER',x:2,y:1}]});
  assert(R.canShoot(sn,sn.units.a).ok);
  sn=must(c,sn,{type:'MOVE',unit:'a',to:{x:2,y:5}}).state;
  refused(c,sn,{type:'SHOOT',unit:'a',target:'e1'},'MOVED_THIS_TURN');refused(c,sn,{type:'OVERWATCH',unit:'a'},'MOVED_THIS_TURN');
  const nextTurn=must(c,sn,{type:'END_TURN'}).state;assert.equal(nextTurn.units.a.moved,false,'a new turn clears "moved"');
  // ---- HUNKER: -20 to be hit, blocks active SHOOT, still allows OVERWATCH, ends when the unit next acts ----
  let h=scenario(c,{squad:[oga('a','SHOOTER',{x:2,y:6})],enemies:[{type:'CHEWER',x:2,y:3}]});
  h=must(c,h,{type:'HUNKER',unit:'a'}).state;assert.equal(h.units.a.hunker,true);
  refused(c,h,{type:'SHOOT',unit:'a',target:'e1'},'HUNKERED');
  const hv=R.preview(h,h.units.e1,h.units.a);assert.equal(hv.breakdown.find(l=>l.id==='hunker').value,-20,'enemies shoot a hunkered Oga at -20');
  h=must(c,h,{type:'OVERWATCH',unit:'a'}).state;assert.equal(h.units.a.ow,true,'hunkered units may hold overwatch');
  const hn=must(c,h,{type:'END_TURN'}).state;assert.equal(hn.units.a.hunker,false,'hunker ends at the start of the next player turn');assert.equal(hn.units.a.ow,false,'so does overwatch');
  // CALM (+10 aim when HUNKERED) shows in the odds
  const calm=tweak(c,scenario(c,{squad:[oga('a','MUSCLE',{x:2,y:6,traits:['CALM']})],enemies:[{type:'CHEWER',x:2,y:3}]}),x=>{x.units.a.hunker=true;});
  assert.equal(R.preview(calm,calm.units.a,calm.units.e1,{reaction:true}).breakdown.find(l=>l.id==='calm').value,10);
  // ---- OVERWATCH: reaction shot at -15 when an enemy moves into view; once; then spent ----
  let o=scenario(c,{squad:[oga('a','SHOOTER',{x:2,y:7}),oga('b','DOC',{x:0,y:8})],enemies:[{type:'CHEWER',x:2,y:0}],revealed:true});
  o=must(c,o,{type:'OVERWATCH',unit:'a'}).state;
  assert.equal(o.units.a.ow,true);refused(c,o,{type:'OVERWATCH',unit:'a'},'ALREADY');
  const oe=must(c,o,{type:'END_TURN'});
  const shots=oe.events.filter(e=>e.t==='SHOT');
  assert(shots.some(e=>e.reaction&&e.from==='a'),'the watcher fired on the mover');
  {const rs=shots.find(e=>e.reaction);const pv=R.preview(o,o.units.a,{...o.units.e1,x:rs.tx,y:rs.ty},{reaction:true});assert.equal(rs.chance,pv.chance);assert.equal(pv.breakdown.find(l=>l.id==='overwatch').value,-15,'reaction shots carry the -15');}
  assert.equal(oe.events.filter(e=>e.t==='SHOT'&&e.reaction).length,1,'one reaction shot per overwatch');
  assert(oe.events.findIndex(e=>e.t==='SHOT'&&e.reaction)<oe.events.findIndex(e=>e.t==='SHOT'&&!e.reaction&&e.from==='e1')||!oe.events.some(e=>e.t==='SHOT'&&e.from==='e1'),'the reaction happens as the enemy moves, before it can shoot');
  // LIL OGA never misses on overwatch
  { let miss=0;for(let i=0;i<300;i++){let q=scenario(c,{squad:[oga('a','SHOOTER',{x:2,y:6,weapon:'lil_oga'})],enemies:[{type:'ENFORCER',x:2,y:1}],seed:'lo'+i});q=tweak(c,q,x=>{x.units.e1.hp=99;x.units.e1.maxHp=99;x.units.a.aim=5;});q=must(c,q,{type:'OVERWATCH',unit:'a'}).state;
    const ev=must(c,q,{type:'END_TURN'}).events.filter(e=>e.t==='SHOT'&&e.reaction);for(const sh of ev){assert.equal(sh.chance,100);if(!sh.hit)miss++;}}
    assert.equal(miss,0,'LIL OGA never misses on overwatch'); }
  // IMPATIENT cannot use overwatch
  refused(c,scenario(c,{squad:[oga('a','GHOST',{x:2,y:6,traits:['IMPATIENT']})],enemies:[{type:'CHEWER',x:2,y:0}]}),{type:'OVERWATCH',unit:'a'},'IMPATIENT');
  // ---- THE RPG: 1 per showdown, area 3x3, destroys destructible cover, +10 HEAT ----
  const rows=['......','......','......','..D...','......','......','......','......','xxxxxx'];
  let rp=scenario(c,{rows,squad:[oga('a','WHEELS',{x:2,y:7,weapon:'rpg'})],enemies:[{type:'CHEWER',x:2,y:4},{type:'CHEWER',x:3,y:4},{type:'ENFORCER',x:5,y:0}]});
  const av=E.available(rp,'a');assert.equal(av.SHOOT.ok,true);assert.equal(av.SHOOT.area,true);
  const bl=must(c,rp,{type:'SHOOT',unit:'a',at:{x:2,y:4}});
  assert(bl.events.some(e=>e.t==='COVER_DESTROYED'),'the dumpster is destroyed');
  assert.equal(bl.state.props.find(p=>p.kind==='DUMPSTER').destroyed,true);
  assert.equal(bl.state.units.e1.status,'REMOVED');assert.equal(bl.state.units.e2.status,'REMOVED');assert.equal(bl.state.units.e3.status,'ACTIVE','outside the 3x3 is safe');
  assert.equal(bl.state.heat.rpg,10);
  refused(c,tweak(c,bl.state,x=>{x.units.a.ap=2;}),{type:'SHOOT',unit:'a',at:{x:2,y:4}},'ONE_PER_SHOWDOWN');
  refused(c,tweak(c,bl.state,x=>{x.units.a.ap=2;}),{type:'RELOAD',unit:'a'},'ONE_PER_SHOWDOWN');
  // non-destructible cover survives explosives
  const rows2=['......','......','......','..L...','......','......','......','......','xxxxxx'];
  let rp2=scenario(c,{rows:rows2,squad:[oga('a','WHEELS',{x:2,y:7,weapon:'rpg'})],enemies:[{type:'CHEWER',x:2,y:4}]});
  assert.equal(must(c,rp2,{type:'SHOOT',unit:'a',at:{x:2,y:4}}).state.props[0].destroyed,false);
  // ---- ITEM: authorised action, nothing authored ----
  const it=refused(c,scenario(c,{squad:[oga('a','DOC',{x:2,y:6})],enemies:[{type:'CHEWER',x:2,y:0}]}),{type:'ITEM',unit:'a',item:'x'},'SOURCE_REQUIRED');assert.equal(it.sourceRequired,'ITEMS');
  // ---- refusals never mutate ----
  refused(c,s,{type:'MOVE',unit:'a',to:{x:9,y:9}});
  console.log('PASS F01 turn system (2 actions, dash rule, end-turn/enemy phase/refresh, ammo/reload/drum mag, sniper move rule, hunker, overwatch, LIL OGA, RPG once/area/cover, ITEM SOURCE_REQUIRED, refusals inert)');
}
