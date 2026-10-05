// F01 Rich PULL UP (Vol 7 5.6): turn gate, once, entry, four moves, HEAT hook, knocked down -> retreat, never GONE.
import assert from 'node:assert/strict';
import {core,scenario,oga,must,refused,tweak,OPEN,J,ids} from './_lib.mjs';

export async function test(root){
  const c=await core(root);const R=c.RAShowdownRules,E=c.RAShowdownEngine,D=c.RAShowdownData,SD=c.RAShowdown;
  const mk=(turn=3,foes=[{type:'CHEWER',x:2,y:3},{type:'CHEWER',x:3,y:3}])=>tweak(c,scenario(c,{squad:[oga('a','MUSCLE',{x:2,y:6}),oga('b','DOC',{x:0,y:8})],enemies:foes}),x=>{x.turn=turn;});
  // ---- gate: from turn 3 onward, once ----
  refused(c,mk(1),{type:'PULL_UP'},'TOO_EARLY');refused(c,mk(2),{type:'PULL_UP'},'TOO_EARLY');assert.equal(D.RICH.pullUpFromTurn,3);
  assert.equal(E.canPullUp(mk(2)),false);assert.equal(E.canPullUp(mk(3)),true);assert.equal(E.canPullUp(mk(7)),true);
  let s=mk(3);const r=must(c,s,{type:'PULL_UP'});s=r.state;
  const rich=s.units.rich;assert.equal(rich.status,'ACTIVE');assert.deepEqual([rich.maxHp,rich.hp],[12,12]);assert.equal(rich.ap,2,'he arrives ready to act');
  assert(s.map.richEntry.some(([x,y])=>x===rich.x&&y===rich.y),'enters from the edge');
  assert(r.events.some(e=>e.t==='PULL_UP'));const seen=r.events.find(e=>e.t==='RICH_SEEN');assert.equal(seen.heat,15,'Rich being seen = +15 HEAT');assert.equal(seen.vampgramPost,true);
  refused(c,s,{type:'PULL_UP'},'RICH_USED');
  // no Rich when the host disables him
  refused(c,tweak(c,scenario(c,{squad:[oga('a','MUSCLE',{x:2,y:6})],enemies:[{type:'CHEWER',x:2,y:3}],rich:false}),x=>{x.turn=3;}),{type:'PULL_UP'},'NO_RICH');
  // entry tile can be chosen among the authored entries, and must be free
  refused(c,mk(3),{type:'PULL_UP',to:{x:1,y:1}},'NO_ENTRY');
  // ---- BLOOD BATH: area, 4 damage, allies safe ----
  {let t=mk(3,[{type:'ENFORCER',x:2,y:3},{type:'CHEWER',x:3,y:3},{type:'CHEWER',x:5,y:0}]);t=tweak(c,t,x=>{x.units.a.x=3;x.units.a.y=4;});
   t=must(c,t,{type:'PULL_UP'}).state;
   const b=must(c,t,{type:'RICH_MOVE',unit:'rich',move:'BLOOD_BATH',at:{x:3,y:3}});
   assert.equal(b.state.units.e1.hp,5,'ENFORCER 9 -> 5');assert.equal(b.state.units.e2.hp,1,'CHEWER 5 -> 1');assert.equal(b.state.units.e3.hp,5,'outside the area');assert.equal(b.state.units.a.hp,9,'allies are safe (3x3 next to MUSCLE)');
   assert.equal(b.state.units.rich.ap,1); }
  // ---- VAMPIRE BITE: adjacent, 4 + heal 2 ----
  {let t=mk(3,[{type:'ENFORCER',x:4,y:6}]);t=must(c,t,{type:'PULL_UP',to:{x:5,y:8}}).state;t=tweak(c,t,x=>{x.units.rich.x=5;x.units.rich.y=6;x.units.rich.hp=5;});
   const r=must(c,t,{type:'RICH_MOVE',unit:'rich',move:'VAMPIRE_BITE',target:'e1'});assert.equal(r.state.units.e1.hp,5);assert.equal(r.state.units.rich.hp,7);
   refused(c,tweak(c,t,x=>{x.units.rich.x=0;x.units.rich.y=8;}),{type:'RICH_MOVE',unit:'rich',move:'VAMPIRE_BITE',target:'e1'},'NOT_ADJACENT'); }
  // ---- REVENGE: returns exactly the damage taken, once ----
  {let t=mk(3,[{type:'ENFORCER',x:2,y:3},{type:'CHEWER',x:5,y:0}]);t=must(c,t,{type:'PULL_UP'}).state;
   refused(c,t,{type:'RICH_MOVE',unit:'rich',move:'REVENGE',target:'e1'},'NOTHING_STORED');
   t=tweak(c,t,x=>{x.units.rich.hp=12-6;x.rich.stored=6;x.units.e1.hp=9;x.units.rich.x=2;x.units.rich.y=7;});
   const r=must(c,t,{type:'RICH_MOVE',unit:'rich',move:'REVENGE',target:'e1'});assert.equal(r.state.units.e1.hp,3,'6 taken -> 6 returned');assert.equal(r.state.rich.stored,0,'stored damage is spent');
   refused(c,tweak(c,r.state,x=>{x.units.rich.ap=2;}),{type:'RICH_MOVE',unit:'rich',move:'REVENGE',target:'e1'},'NOTHING_STORED');
   // damage actually taken is what is stored: enemy fire on Rich feeds REVENGE
   let hit=false;for(let i=0;i<60&&!hit;i++){let q=must(c,tweak(c,mk(3,[{type:'ENFORCER',x:2,y:3}]),x=>{x.rng=c.RAShowdownRng.create('rv'+i);}),{type:'PULL_UP'}).state;q=tweak(c,q,x=>{x.units.a.x=0;x.units.a.y=5;x.units.b.x=0;x.units.b.y=8;x.units.rich.x=2;x.units.rich.y=6;x.units.rich.ap=0;});
     const e=must(c,q,{type:'END_TURN'});const lost=e.events.filter(v=>v.t==='HP'&&v.id==='rich').reduce((n,v)=>n+v.lost,0);if(lost>0){hit=true;assert.equal(e.state.rich.stored,lost,'REVENGE stores the actual damage taken');}}
   assert(hit,'Rich got shot at least once'); }
  // ---- OCTOPUS BRAIN: not OPEN-authorised => SOURCE_REQUIRED (never invented) ----
  {let t=must(c,mk(3),{type:'PULL_UP'}).state;const x=refused(c,t,{type:'RICH_MOVE',unit:'rich',move:'OCTOPUS_BRAIN'},'SOURCE_REQUIRED');assert.equal(x.sourceRequired,'OCTOPUS_BRAIN_TRICKS');
   const av=E.available(t,'rich');assert.equal(av.RICH_MOVES.OCTOPUS_BRAIN.ok,false);assert.equal(av.RICH_MOVES.OCTOPUS_BRAIN.why,'SOURCE_REQUIRED'); }
  // ---- Rich moves on the grid like anyone else and has no gun ----
  {let t=must(c,mk(3),{type:'PULL_UP'}).state;const r=must(c,t,{type:'MOVE',unit:'rich',to:{x:4,y:5}});assert.equal(r.state.units.rich.ap,1);
   refused(c,t,{type:'SHOOT',unit:'rich',target:'e1'},'RICH_NO_GUN');refused(c,t,{type:'HUNKER',unit:'rich'}); }
  // ---- knocked down: everyone retreats, Rich is never GONE ----
  {let t=must(c,mk(3,[{type:'ENFORCER',x:2,y:4},{type:'CHEWER',x:5,y:0}]),{type:'PULL_UP'}).state;
   t=tweak(c,t,x=>{x.units.rich.hp=1;x.units.rich.x=2;x.units.rich.y=6;x.units.rich.ap=0;x.units.a.x=0;x.units.a.y=8;x.units.b.x=5;x.units.b.y=7;});
   let end=null;for(let i=0;i<60&&!end;i++){const q=tweak(c,t,x=>{x.rng=c.RAShowdownRng.create('rd'+i);});const r=must(c,q,{type:'END_TURN'});if(r.state.result&&r.state.result.reason==='RICH_DOWN')end=r;}
   assert(end,'Rich was knocked down');const res=end.state.result;assert.equal(res.outcome,'RETREAT');assert.equal(res.rich.knockedDown,true);assert.equal(res.rich.gone,false);
   assert.equal(res.ogaResults.some(o=>o.id==='rich'),false,'Rich is not a crew result: he cannot be GONE');
   assert(end.events.some(e=>e.t==='RICH_DOWN')); }
  // ---- result + hooks: HEAT hook exposed for F04 ----
  {const made=SD.createSession({seed:'hk',map:c.RAShowdownMaps.get('alley'),squad:[{id:'a',name:'A',cls:'MUSCLE',weapon:'pistol'},{id:'b',name:'B',cls:'DOC',weapon:'pistol'}],enemies:['CHEWER','CHEWER']},{});
   assert.equal(made.ok,true);const ses=made.session;let heard=null;SD.hooks.on('richSeen',e=>{heard=e;});
   ses.dispatch({type:'END_TURN'});ses.dispatch({type:'END_TURN'});assert.equal(ses.state.turn,3);
   const pr=ses.dispatch({type:'PULL_UP'});assert.equal(pr.ok,true);assert(heard&&heard.heat===15&&heard.vampgramPost===true,'hooks.on("richSeen") fires with the authored +15');
   const fin=ses.dispatch({type:'RETREAT'});const res=ses.result;assert.equal(res.rich.used,true);assert.equal(res.rich.visible,true);assert.equal(res.heat.richSeen,15);assert.equal(res.heat.base+15,res.heat.total);
   const f04=c.RAShowdownPackets.toF04Resolution(res);assert.equal(f04.richUsedPullUp,true);assert.equal(f04.richVisible,true);assert.equal(f04.heatDelta,res.heat.base,'F04 adds the +15 itself: F01 must not double count it'); }
  console.log('PASS F01 Rich pull-up (turn>=3 once, edge entry, +15 HEAT hook, BLOOD BATH/VAMPIRE BITE/REVENGE exact, OCTOPUS BRAIN => SOURCE_REQUIRED, knocked down => RETREAT never GONE, F04 no-double-count)');
}
