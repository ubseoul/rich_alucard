// F01 grid / movement / cover geometry / line of sight / POD reveal.
import assert from 'node:assert/strict';
import {core,scenario,oga,must,refused,OPEN,mapOf,J} from './_lib.mjs';

export async function test(root){
  const c=await core(root);const R=c.RAShowdownRules,E=c.RAShowdownEngine,D=c.RAShowdownData,M=c.RAShowdownMaps;
  // ---- the authored field is exactly 6x9 and every sandbox map parses to it ----
  assert.equal(D.GRID.cols,6);assert.equal(D.GRID.rows,9);
  for(const m of M.list()){assert.equal(m.cols,6);assert.equal(m.rows,9);assert(m.extraction.length>=1,`${m.id} has an extraction zone`);assert(m.deploy.length>=4);assert(m.richEntry.length>=1);}
  assert.throws(()=>E.create({map:{id:'x',cols:5,rows:9}}),/6x9/);
  // ---- distance + bounds ----
  const s0=scenario(c,{squad:[oga('a','MUSCLE',{x:2,y:6})]});
  assert.equal(R.dist({x:0,y:0},{x:5,y:8}),8);assert(R.inb(s0,5,8));assert(!R.inb(s0,6,0));assert(!R.inb(s0,0,9));assert(!R.inb(s0,-1,0));
  // ---- movement: mobility is the budget; open ground is Chebyshev ----
  const a=s0.units.a;
  let dests=R.destinations(s0,a,5);
  assert(dests.some(d=>d.x===2&&d.y===1),'5 tiles straight ahead');assert(!dests.some(d=>d.x===2&&d.y===0),'6 tiles is out of reach');
  assert(dests.some(d=>d.x===5&&d.y===2),'diagonal steps cost 1 (Chebyshev)');
  assert(!dests.some(d=>d.x===a.x&&d.y===a.y),'own tile is not a destination');
  // a MOVE beyond mobility is refused without touching state
  refused(c,s0,{type:'MOVE',unit:'a',to:{x:2,y:0}},'UNREACHABLE');
  const r=must(c,s0,{type:'MOVE',unit:'a',to:{x:2,y:2}});assert.equal(r.state.units.a.y,2);assert.equal(r.state.units.a.ap,1);assert.equal(r.state.units.a.moved,true);
  // ---- props block movement; no squeezing diagonally between two props ----
  const rows=['......','......','..L...','.L.L..','......','......','......','......','xxxxxx'];
  const sp=scenario(c,{rows,squad:[oga('a','MUSCLE',{x:2,y:4})]});
  assert(!R.destinations(sp,sp.units.a,5).some(d=>d.x===2&&d.y===2),'cannot stand on a low wall');
  assert.equal(R.path(sp,sp.units.a,{x:2,y:3},2).length,1);
  const squeeze=['......','......','......','.L....','..L...','......','......','......','xxxxxx'];
  const sq=scenario(c,{rows:squeeze,squad:[oga('a','MUSCLE',{x:1,y:4})]});
  // (1,4) -> (2,3) would slip between (1,3) and (2,4), both props
  assert.equal(R.path(sq,sq.units.a,{x:2,y:3},1),null,'no diagonal squeeze between two props');
  // ---- height: changing height costs +1 (CHURCH_SHOES removes it) ----
  const elev=['h.....','......','......','......','......','......','......','......','xxxxxx'];
  const se=scenario(c,{rows:elev,squad:[oga('a','MUSCLE',{x:1,y:1}),oga('b','SHOOTER',{x:3,y:1,traits:['CHURCH_SHOES']})]});
  assert.equal(R.reach(se,se.units.a,5).get('0,0').cost,2,'stepping up costs 2');
  const se2=scenario(c,{rows:['......','h.....','......','......','......','......','......','......','xxxxxx'],squad:[oga('b','SHOOTER',{x:1,y:1,traits:['CHURCH_SHOES']})]});
  assert.equal(R.reach(se2,se2.units.b,5).get('0,1').cost,1,'CHURCH SHOES: no penalty on stairs/ladders');
  // ---- enemies block movement, allies do not ----
  const sb=scenario(c,{squad:[oga('a','MUSCLE',{x:2,y:5}),oga('b','DOC',{x:2,y:4})],enemies:[{type:'CHEWER',x:3,y:5}]});
  assert(!R.destinations(sb,sb.units.a,5).some(d=>d.x===3&&d.y===5),'cannot enter an enemy');
  assert(!R.destinations(sb,sb.units.a,5).some(d=>d.x===2&&d.y===4),'cannot end on an ally');
  assert(R.destinations(sb,sb.units.a,5).some(d=>d.x===2&&d.y===3),'can walk through an ally');
  // ---- line of sight ----
  const los=['......','......','......','..P...','......','......','......','......','xxxxxx'];
  const sl=scenario(c,{rows:los,squad:[oga('a','SHOOTER',{x:2,y:5}),oga('b','DOC',{x:0,y:5})],enemies:[{type:'CHEWER',x:2,y:1},{type:'CHEWER',x:2,y:2},{type:'CHEWER',x:0,y:1}]});
  assert(!R.los(sl,sl.units.a,sl.units.e1),'a FULL-cover pillar between blocks the line');
  assert(R.los(sl,sl.units.a,sl.units.e2),'a pillar touching the target is the cover case, not a wall');
  assert(R.los(sl,sl.units.b,sl.units.e3),'open lanes are visible');
  assert.equal(R.los(sl,sl.units.a,sl.units.e1),R.los(sl,sl.units.e1,sl.units.a),'LOS is symmetric');
  const half=['......','......','......','..L...','......','......','......','......','xxxxxx'];
  const sh=scenario(c,{rows:half,squad:[oga('a','SHOOTER',{x:2,y:5})],enemies:[{type:'CHEWER',x:2,y:1}]});
  assert(R.los(sh,sh.units.a,sh.units.e1),'HALF cover never blocks sight');
  // ---- directional cover ----
  const cv=['......','......','......','..L...','......','......','......','......','xxxxxx'];
  const sc=scenario(c,{rows:cv,squad:[oga('a','SHOOTER',{x:2,y:6}),oga('b','SHOOTER',{x:5,y:4}),oga('d','SHOOTER',{x:0,y:2}),oga('f','SHOOTER',{x:2,y:2})],enemies:[{type:'CHEWER',x:2,y:4}]});
  // target (2,4) has a low wall to its NORTH at (2,3)
  const t=sc.units.e1;
  assert.equal(R.coverVs(sc,{x:2,y:2},{x:2,y:6}).level,'HALF','the wall at (2,3) shields a unit at (2,2) from the south');
  const north=R.coverVs(sc,t,{x:2,y:0});assert.equal(north.level,'HALF','shooter from the far side of the wall: covered');
  const east=R.coverVs(sc,t,{x:5,y:4});assert.equal(east.level,'NONE');assert.equal(east.flanked,true,'shooter at 90 degrees: flanked');
  const south=R.coverVs(sc,t,{x:2,y:8});assert.equal(south.flanked,true,'shooter behind: flanked');
  const diag=R.coverVs(sc,t,{x:4,y:2});assert.equal(diag.level,'HALF','exactly 45 degrees still counts as covered');
  const open=R.coverVs(sc,{x:0,y:8},{x:0,y:0});assert.equal(open.any,false);assert.equal(open.flanked,false,'no cover at all is the open, not a flank');
  // FULL beats HALF when both face the shooter
  const both=['......','......','.PL...','......','......','......','......','......','xxxxxx'];
  const sf=scenario(c,{rows:both,squad:[oga('a','SHOOTER',{x:2,y:6})],enemies:[{type:'CHEWER',x:2,y:3}]});
  assert.equal(R.coverVs(sf,sf.units.e1,{x:2,y:0}).level,'HALF');
  const both2=['......','......','..P...','..L...','......','......','......','......','xxxxxx'];
  // ---- POD reveal ----
  const far=scenario(c,{squad:[oga('a','SHOOTER',{x:2,y:8})],enemies:[{type:'CHEWER',x:2,y:0,pod:'p1'}],revealed:false});
  assert.equal(far.pods[0].revealed,false,'8 tiles away: unspotted');
  assert(!R.preview(far,far.units.a,far.units.e1).ok&&R.preview(far,far.units.a,far.units.e1).code==='NOT_SPOTTED','cannot shoot an enemy that has not been spotted');
  let m1=must(c,far,{type:'MOVE',unit:'a',to:{x:2,y:5}});
  assert.equal(m1.state.pods[0].revealed,true,'closing to sight range reveals the pod');
  const rev=m1.events.find(e=>e.t==='POD_REVEAL');assert(rev&&rev.sfx==='BX_POD_REVEAL'&&rev.members.length===1);
  // walls of cover block the reveal
  const blocked=scenario(c,{rows:['......','......','..P...','......','......','......','......','......','xxxxxx'],squad:[oga('a','SHOOTER',{x:2,y:4})],enemies:[{type:'CHEWER',x:2,y:0,pod:'p1'}],revealed:false});
  assert.equal(blocked.pods[0].revealed,false,'a pillar in between hides the pod');
  // a whole pod reveals together
  const pod=scenario(c,{squad:[oga('a','SHOOTER',{x:2,y:7})],enemies:[{type:'CHEWER',x:2,y:0,pod:'p1'},{type:'CHEWER',x:5,y:0,pod:'p1'}],revealed:false});
  const m2=must(c,pod,{type:'MOVE',unit:'a',to:{x:2,y:3}});assert.equal(m2.events.find(e=>e.t==='POD_REVEAL').members.length,2,'the whole POD is revealed at once');
  // hidden enemies do not appear in player targeting
  assert.equal(R.targets(pod,pod.units.a).length,0);
  console.log('PASS F01 grid (6x9 field, movement/climb costs, props, squeeze rule, LOS, directional cover, flank vs open, POD reveal)');
}
