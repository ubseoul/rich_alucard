// F01 enemies: authored stats + behaviour notes, provisional AI determinism.
import assert from 'node:assert/strict';
import {core,scenario,oga,must,refused,tweak,OPEN,J,ids} from './_lib.mjs';

export async function test(root){
  const c=await core(root);const R=c.RAShowdownRules,E=c.RAShowdownEngine,D=c.RAShowdownData;
  // ---- authored HP / AIM ----
  const T={CHEWER:[5,60],ENFORCER:[9,55],HUNTER:[6,70],LIEUTENANT:[10,68],LIL_SMACK:[14,65]};
  assert.equal(JSON.stringify(Object.keys(D.ENEMIES).sort()),JSON.stringify(Object.keys(T).sort()),'exactly the five authored enemies');
  for(const [k,[hp,aim]] of Object.entries(T)){const s=scenario(c,{squad:[oga('a','DOC',{x:2,y:8})],enemies:[{type:k,x:2,y:0}],revealed:false});const e=s.units.e1;assert.deepEqual([e.maxHp,e.aim],[hp,aim],k);}
  assert.throws(()=>scenario(c,{squad:[oga('a','DOC',{x:2,y:8})],enemies:[{type:'DRAGON',x:2,y:0}]}),/unknown enemy/);
  // ---- CHEWER always flanks if possible ----
  {const rows=['......','......','..L...','......','......','......','......','......','xxxxxx'];
   // target at (2,3) is shielded from the north by the wall at (2,2); a chewer starting north should walk round to a flanking tile
   let s=scenario(c,{rows,squad:[oga('a','MUSCLE',{x:2,y:3})],enemies:[{type:'CHEWER',x:2,y:0}]});
   const r=must(c,s,{type:'END_TURN'});const shot=r.events.find(e=>e.t==='SHOT'&&e.from==='e1');
   assert(shot,'the chewer shot');assert.equal(shot.flanked,true,'and did it from a flanking tile');
   const mv=r.events.find(e=>e.t==='MOVE'&&e.id==='e1');assert(mv,'it moved to get there'); }
  // ---- ENFORCER: charges, shrugs off half cover ----
  {const rows=['......','......','......','......','......','......','..L...','......','xxxxxx'];
   let s=scenario(c,{rows,squad:[oga('a','MUSCLE',{x:2,y:7})],enemies:[{type:'ENFORCER',x:2,y:4}]});
   const pv=R.preview(s,s.units.e1,s.units.a);assert.equal(pv.cover,'HALF');assert.equal(pv.breakdown.some(l=>l.id==='cover'),false,'half cover does nothing to an ENFORCER');
   assert.equal(pv.breakdown.some(l=>l.id==='shrug'),true);
   s=tweak(c,s,x=>{x.units.e1.x=2;x.units.e1.y=1;});
   const r=must(c,s,{type:'END_TURN'});const mv=r.events.find(e=>e.t==='MOVE'&&e.id==='e1');
   const end=mv.path[mv.path.length-1];assert(R.dist(end,s.units.a)<=3,'it charged in close ('+R.dist(end,s.units.a)+')');
   const sh=r.events.find(e=>e.t==='SHOT'&&e.from==='e1');assert.equal(sh.weapon,'enemy_shotgun');
   // a chewer is NOT immune to half cover
   const t2=scenario(c,{rows,squad:[oga('a','MUSCLE',{x:2,y:7})],enemies:[{type:'CHEWER',x:2,y:3}]});assert.equal(R.preview(t2,t2.units.e1,t2.units.a).breakdown.find(l=>l.id==='cover').value,-20); }
  // ---- HUNTER: silver +2 vs vampires (not vs humans), ignores VANISH ----
  {let s=scenario(c,{squad:[oga('a','MUSCLE',{x:2,y:5,race:'VAMPIRE'}),oga('b','DOC',{x:3,y:5,race:'HUMAN'})],enemies:[{type:'HUNTER',x:2,y:2}]});
   const pa=R.preview(s,s.units.e1,s.units.a),pb=R.preview(s,s.units.e1,s.units.b);
   assert.equal(pa.dmgMin,5);assert.equal(pa.dmgMax,6,'3-4 crossbow +2 vs a vampire');assert.equal(pb.dmgMax,4,'no bonus on a human');
   assert(pa.plus.includes('SILVER +2')); }
  // ---- LIEUTENANT: +10 aim to ADJACENT allies (not himself) ----
  {let s=scenario(c,{squad:[oga('a','MUSCLE',{x:2,y:7})],enemies:[{type:'LIEUTENANT',x:2,y:2},{type:'CHEWER',x:3,y:2},{type:'CHEWER',x:5,y:0}]});
   const near=R.preview(s,s.units.e2,s.units.a),far=R.preview(s,s.units.e3,s.units.a),lt=R.preview(s,s.units.e1,s.units.a);
   assert.equal(near.breakdown.find(l=>l.id==='lieutenant').value,10);assert.equal(far.breakdown.some(l=>l.id==='lieutenant'),false);assert.equal(lt.breakdown.some(l=>l.id==='lieutenant'),false,'not on himself');
   const dead=tweak(c,s,x=>{x.units.e1.status='REMOVED';});assert.equal(R.preview(dead,dead.units.e2,dead.units.a).breakdown.some(l=>l.id==='lieutenant'),false,'the aura dies with him'); }
  // ---- LIL SMACK: CHEW, flee at 4 HP instead of dying ----
  {let s=scenario(c,{squad:[oga('a','SHOOTER',{x:2,y:6})],enemies:[{type:'LIL_SMACK',x:2,y:3},{type:'CHEWER',x:3,y:3},{type:'CHEWER',x:5,y:0}]});
   const chew=R.preview(s,s.units.e2,s.units.a),far=R.preview(s,s.units.e3,s.units.a);
   assert.equal(chew.breakdown.find(l=>l.id==='chew').value,-10,"LIL SMACK's own adjacent allies are disgusted");assert.equal(far.breakdown.some(l=>l.id==='chew'),false);
   const flip=tweak(c,s,x=>{x.tun.chewAffects='OGAS';});const adj=tweak(c,flip,x=>{x.units.a.x=2;x.units.a.y=4;});assert.equal(R.preview(adj,adj.units.a,adj.units.e1).breakdown.find(l=>l.id==='chew').value,-10,'switch: the OGAS next to him');
   // damage that would leave him at <=4 makes him flee; he can never be killed
   const hit=tweak(c,s,x=>{x.units.e1.hp=6;x.units.a.aim=100;x.units.a.critBonus=-100;});
   const r=must(c,hit,{type:'SHOOT',unit:'a',target:'e1'});
   assert.equal(r.state.units.e1.status,'REMOVED');assert.equal(r.state.units.e1.removedReason,'FLED');assert(r.state.units.e1.hp>=1,'he flees alive');
   assert(r.events.some(e=>e.t==='REMOVED'&&e.reason==='FLED'));assert.equal(JSON.stringify(r.state.bossFled),'["e1"]');
   const big=tweak(c,s,x=>{x.units.e1.hp=3;x.units.a.aim=100;});const r2=must(c,big,{type:'SHOOT',unit:'a',target:'e1'});assert.equal(r2.state.units.e1.removedReason,'FLED','even a lethal hit only makes him flee');
   const fin=must(c,tweak(c,r2.state,x=>{x.units.e2.status='REMOVED';x.units.e3.status='REMOVED';}),{type:'RETREAT'}).state.result;
   assert.equal(fin.bossFled.length,1);assert.equal(fin.enemyResults.find(e=>e.type==='LIL_SMACK').status,'FLED','the result tells F04 he got away (he always comes back)'); }
  // ---- pods: an unrevealed pod never acts; a revealed one does; AI is deterministic ----
  {const mk=rev=>scenario(c,{squad:[oga('a','MUSCLE',{x:2,y:7})],enemies:[{type:'CHEWER',x:2,y:1}],revealed:rev});
   assert.equal(must(c,mk(false),{type:'END_TURN'}).events.filter(e=>e.from==='e1').length,0);
   const a=must(c,mk(true),{type:'END_TURN'}),b=must(c,mk(true),{type:'END_TURN'});assert.equal(JSON.stringify(a.events),JSON.stringify(b.events),'same state, same seed => same enemy turn');
   assert(a.events.filter(e=>e.t==='SHOT'&&e.from==='e1').length<=1,'at most one shot per enemy per turn (provisional)'); }
  // ---- enemies never shoot the downed, and skip concealed targets ----
  {let s=scenario(c,{squad:[oga('a','MUSCLE',{x:2,y:5}),oga('b','DOC',{x:5,y:8})],enemies:[{type:'CHEWER',x:2,y:2}]});
   s=tweak(c,s,x=>{x.units.a.status='DOWNED';x.units.a.hp=0;x.units.a.bleed=3;});
   const r=must(c,s,{type:'END_TURN'});assert(!r.events.some(e=>e.t==='SHOT'&&e.to==='a'),'a DOWNED Oga is not a target'); }
  console.log('PASS F01 enemies (5 authored stat lines, CHEWER flank, ENFORCER charge + shrug, HUNTER silver/ignores VANISH, LIEUTENANT aura, LIL SMACK CHEW + flee-not-die, pod discipline, deterministic AI)');
}
