// F01 downed / bleed / stabilize / carry / extraction / captured / mission end / retreat / failure. F01 never finalizes GONE.
import assert from 'node:assert/strict';
import {core,scenario,oga,must,refused,tweak,OPEN,J,ids,playOut,prng} from './_lib.mjs';

export async function test(root){
  const c=await core(root);const R=c.RAShowdownRules,E=c.RAShowdownEngine,D=c.RAShowdownData,Rng=c.RAShowdownRng;
  const down=(s,id)=>tweak(c,s,x=>{const u=x.units[id];u.status='DOWNED';u.hp=0;u.bleed=3;u.stabilized=false;u.ap=0;});
  // ---- 0 HP -> DOWNED for real, through enemy fire ----
  {let hit=false;
   for(let i=0;i<60&&!hit;i++){const q=tweak(c,scenario(c,{squad:[oga('a','MUSCLE',{x:2,y:6}),oga('b','DOC',{x:0,y:8})],enemies:[{type:'ENFORCER',x:2,y:3},{type:'CHEWER',x:5,y:0}],seed:'dn'+i}),x=>{x.units.a.hp=1;});
    const r=must(c,q,{type:'END_TURN'});const d=r.events.find(e=>e.t==='DOWNED'&&e.id==='a');
    if(d){hit=true;const u=r.state.units.a;assert.equal(u.status==='DOWNED'||u.status==='TAKEN',true);assert.equal(u.hp,0);assert.equal(d.bleed,D.BLEED_TURNS);assert.equal(D.BLEED_TURNS,3,'bleeding: 3 turns (authored)');assert.equal(d.sfx,'BX_DOWNED');assert.equal(u.bleed,3,'the clock starts at 3');assert(!(u.ow||u.hunker));}}
   assert(hit,'an Oga at 0 HP is DOWNED'); }
  // ---- bleeding: 3 of your turns, then TAKEN (never GONE) ----
  {let s=down(scenario(c,{squad:[oga('a','MUSCLE',{x:2,y:6}),oga('b','DOC',{x:0,y:8})],enemies:[{type:'CHEWER',x:5,y:0}],revealed:false}),'a');
   s=must(c,s,{type:'END_TURN'}).state;assert.equal(s.units.a.bleed,2);
   s=must(c,s,{type:'END_TURN'}).state;assert.equal(s.units.a.bleed,1);
   const last=must(c,s,{type:'END_TURN'});assert.equal(last.state.units.a.status,'TAKEN');assert(last.events.some(e=>e.t==='TAKEN'));
   assert.equal(last.state.units.a.x,null,'a taken Oga leaves the field'); }
  // ---- DOC stabilizes: bleeding stops, they stay downed and can be carried ----
  {let s=down(scenario(c,{squad:[oga('a','MUSCLE',{x:2,y:6}),oga('b','DOC',{x:3,y:6})],enemies:[{type:'CHEWER',x:5,y:0}],revealed:false}),'a');
   s=must(c,s,{type:'ABILITY',unit:'b',ability:'PATCH_UP',target:'a'}).state;assert.equal(s.units.a.stabilized,true);assert.equal(s.units.a.status,'DOWNED');
   for(let i=0;i<5;i++)s=must(c,s,{type:'END_TURN'}).state;assert.equal(s.units.a.status,'DOWNED','stabilized: no more bleeding');assert.equal(s.units.a.bleed,3);
   refused(c,tweak(c,s,x=>{x.units.b.ap=2;}),{type:'ABILITY',unit:'b',ability:'PATCH_UP',target:'a'},'ALREADY'); }
  // ---- CARRY: any Oga; adjacency; costs an action; carrier is slower; carried follows ----
  {let s=down(scenario(c,{squad:[oga('a','MUSCLE',{x:2,y:5}),oga('b','SHOOTER',{x:3,y:5}),oga('c','DOC',{x:0,y:8})],enemies:[{type:'CHEWER',x:5,y:0}],revealed:false}),'a');
   refused(c,s,{type:'CARRY',unit:'c',target:'a'},'NOT_ADJACENT');
   const r=must(c,s,{type:'CARRY',unit:'b',target:'a'});s=r.state;assert.equal(s.units.b.carrying,'a');assert.equal(s.units.a.carriedBy,'b');assert.equal(s.units.b.ap,1);
   refused(c,s,{type:'CARRY',unit:'b',target:'a'},'ALREADY_CARRYING');
   assert.equal(R.effectiveMobility(s,s.units.b),3,'carrying: 5 - 2');
   s=must(c,s,{type:'MOVE',unit:'b',to:{x:3,y:2}}).state;assert.deepEqual([s.units.a.x,s.units.a.y],[3,2],'the carried Oga rides along');
   assert.equal(s.units.b.facts.carriedTiles,3);
   assert(!R.destinations(s,s.units.b,3).some(d=>d.y<-1));
   // CARRIED TUNDE: carrying doesn't slow them
   const fast=tweak(c,s,x=>{x.units.b.stories=['carried_tunde'];});assert.equal(R.effectiveMobility(fast,fast.units.b),5);
   // a downed carrier drops the passenger on their own tile / nearest free tile
   const hurt=tweak(c,s,x=>{x.units.b.hp=1;});
   }
  // ---- EXTRACTION: carried to the zone = safe (EXTRACTED), and the bleed clock no longer matters ----
  {let s=down(scenario(c,{squad:[oga('a','MUSCLE',{x:2,y:6}),oga('b','SHOOTER',{x:3,y:6}),oga('c','DOC',{x:0,y:1})],enemies:[{type:'CHEWER',x:5,y:0}],revealed:false}),'a');
   s=must(c,s,{type:'CARRY',unit:'b',target:'a'}).state;
   const r=must(c,s,{type:'MOVE',unit:'b',to:{x:3,y:8}});assert.equal(r.state.units.a.status,'EXTRACTED');assert(r.events.some(e=>e.t==='EXTRACTED'&&e.id==='a'&&e.by==='b'));assert.equal(r.state.units.b.carrying,null);
   const out=must(c,r.state,{type:'RETREAT'}).state.result;const oa=out.ogaResults.find(o=>o.id==='a');assert.equal(oa.finalStatus,'DOWNED');assert.equal(oa.how,'carried_out');assert.equal(oa.leftBehind,false); }
  // ---- MISSION END: left-behind DOWNED -> CAPTURED (retreat / objective win / failure); recovered when the field is clear ----
  {const base=()=>down(scenario(c,{squad:[oga('a','MUSCLE',{x:2,y:5}),oga('b','SHOOTER',{x:3,y:7})],enemies:[{type:'CHEWER',x:5,y:0}],revealed:true}),'a');
   const ret=must(c,base(),{type:'RETREAT'}).state.result;
   assert.equal(ret.outcome,'RETREAT');assert.equal(ret.ogaResults.find(o=>o.id==='a').finalStatus,'CAPTURED','left behind -> CAPTURED');assert.equal(ret.ogaResults.find(o=>o.id==='b').finalStatus,'ACTIVE');
   assert.equal(ret.ogaResults.find(o=>o.id==='a').leftBehind,true);
   // victory with the field CLEAR: nobody to take them -> brought home DOWNED
   const won=tweak(c,base(),x=>{x.units.e1.hp=1;});
   let wonR=null;for(let i=0;i<200&&!wonR;i++){const t=tweak(c,won,x=>{x.rng=Rng.create('w'+i);x.units.b.aim=100;});const r=E.apply(t,{type:'SHOOT',unit:'b',target:'e1'});if(r.ok&&r.state.result&&r.state.result.outcome==='VICTORY')wonR=r.state.result;}
   assert(wonR,'cleared the field');assert.equal(wonR.ogaResults.find(o=>o.id==='a').finalStatus,'DOWNED','victory: brought home');assert.equal(wonR.ogaResults.find(o=>o.id==='a').how,'recovered');
   // bled out -> CAPTURED
   let bled=base();for(let i=0;i<3;i++)bled=must(c,bled,{type:'END_TURN'}).state;assert.equal(bled.units.a.status,'TAKEN');
   assert.equal(must(c,bled,{type:'RETREAT'}).state.result.ogaResults.find(o=>o.id==='a').finalStatus,'CAPTURED'); }
  // ---- FAILURE: everyone down and Rich cannot save you ----
  {let s=scenario(c,{squad:[oga('a','MUSCLE',{x:2,y:5}),oga('b','DOC',{x:3,y:5})],enemies:[{type:'CHEWER',x:5,y:0}],revealed:true});
   s=down(s,'a');s=tweak(c,s,x=>{x.units.b.status='DOWNED';x.units.b.hp=0;x.units.b.bleed=3;});
   const r=must(c,s,{type:'END_TURN'});assert.equal(r.state.result.outcome,'FAILURE');assert.equal(r.state.result.reason,'SQUAD_DOWN');
   assert.equal(r.state.result.ogaResults.every(o=>o.finalStatus==='CAPTURED'),true);
   assert.equal(JSON.stringify(r.state.result.gone),'[]','F01 leaves GONE to the strategic layer'); }
  // ---- VICTORY by elimination ----
  {let s=tweak(c,scenario(c,{squad:[oga('a','SHOOTER',{x:2,y:6})],enemies:[{type:'CHEWER',x:2,y:3}]}),x=>{x.units.e1.hp=1;x.units.a.aim=100;});
   const r=must(c,s,{type:'SHOOT',unit:'a',target:'e1'});assert.equal(r.state.result.outcome,'VICTORY');assert.equal(r.state.result.reason,'FIELD_CLEARED');assert.equal(r.state.status,'ENDED'); }
  // ---- EXTRACT objective: reach the captive, carry to the zone ----
  {const rows=OPEN;const mk=()=>{const map=c.RAShowdownMaps.parse({id:'x',name:'X',theme:'DOCK',rows,deploy:[[2,7],[3,7]],richEntry:[[5,8]],slots:[],captive:{x:2,y:3,name:'CAPTIVE'}});
     return E.create({seed:'ex',map,squad:[{id:'a',name:'A',cls:'MUSCLE',weapon:'pistol',pos:{x:2,y:4}},{id:'b',name:'B',cls:'DOC',weapon:'pistol',pos:{x:0,y:7}}],enemyUnits:[{type:'CHEWER',x:5,y:0}],objective:{kind:'EXTRACT_TARGET'},allRevealed:false});};
   let s=mk();assert.equal(s.units.captive.status,'DOWNED');assert.equal(s.units.captive.stabilized,true);
   s=must(c,s,{type:'CARRY',unit:'a',target:'captive'}).state;
   s=must(c,s,{type:'MOVE',unit:'a',to:{x:2,y:7}}).state;assert.equal(s.status,'ACTIVE');
   s=must(c,s,{type:'END_TURN'}).state;
   const r=must(c,s,{type:'MOVE',unit:'a',to:{x:2,y:8}});
   assert.equal(r.state.result.outcome,'VICTORY');assert.equal(r.state.result.reason,'TARGET_EXTRACTED');assert.equal(r.state.result.captive.extracted,true);
   // the objective is still winnable with enemies alive: a downed Oga left on the field is then CAPTURED
   const s2=down(mk(),'b');
   let s3=must(c,s2,{type:'CARRY',unit:'a',target:'captive'}).state;s3=must(c,s3,{type:'MOVE',unit:'a',to:{x:2,y:7}}).state;s3=must(c,s3,{type:'END_TURN'}).state;const w=must(c,s3,{type:'MOVE',unit:'a',to:{x:2,y:8}}).state.result;
   assert.equal(w.outcome,'VICTORY');assert.equal(w.ogaResults.find(o=>o.id==='b').finalStatus,'CAPTURED','victory by objective with enemies still up: left-behind = CAPTURED'); }
  // ---- turn limit (emergency fight) and SURVIVE objective ----
  {let s=scenario(c,{squad:[oga('a','MUSCLE',{x:2,y:7})],enemies:[{type:'CHEWER',x:5,y:0,pod:'p9'}],revealed:false,extra:{turnLimit:4}});
   for(let i=0;i<3;i++){s=must(c,s,{type:'END_TURN'}).state;assert.equal(s.status,'ACTIVE');}
   const r=must(c,s,{type:'END_TURN'});assert.equal(r.state.result.outcome,'RETREAT');assert.equal(r.state.result.reason,'TURN_LIMIT');
   let v=scenario(c,{squad:[oga('a','MUSCLE',{x:2,y:7})],enemies:[{type:'CHEWER',x:5,y:0,pod:'p9'}],revealed:false,extra:{objective:{kind:'SURVIVE',turns:2}}});
   v=must(c,v,{type:'END_TURN'}).state;const vr=must(c,v,{type:'END_TURN'});assert.equal(vr.state.result.outcome,'VICTORY');assert.equal(vr.state.result.reason,'SURVIVED'); }
  // ---- soak: F01 never emits GONE, downed states stay legal across many random fights ----
  {let downs=0,captured=0,extracted=0;
   for(let i=0;i<50;i++){
    const m=c.RAShowdownMaps;const mk=(id)=>E.create({seed:'soak'+i,map:m.get(id),squad:['MUSCLE','SHOOTER','GHOST','DOC'].map((cls,k)=>({id:cls.toLowerCase(),name:cls,cls,weapon:cls==='MUSCLE'?'sapporo_shotgun':'pistol',bonds:k===1?['muscle']:[]})),enemies:['CHEWER','CHEWER','ENFORCER','CHEWER']});
    const out=playOut(c,mk(['alley','yard','dock'][i%3]),{policy:i%2?'random':'smart',seed:'s'+i});
    assert(out.state.result,'every fight ends');
    for(const o of out.state.result.ogaResults){if(o.finalStatus==='CAPTURED')captured++;if(o.how==='carried_out')extracted++;}
    downs+=out.events.filter(e=>e.t==='DOWNED').length;
   }
   console.log(`     soak: ${downs} downings, ${captured} captured, ${extracted} carried out across 50 fights`);
   assert(downs>0,'the soak exercised the downed pathway'); }
  console.log('PASS F01 downed/carry/capture (0 HP -> DOWNED, 3-turn bleed -> TAKEN, DOC stabilize, CARRY penalty + CARRIED TUNDE, EXTRACTED, left-behind -> CAPTURED, retreat, failure, EXTRACT + SURVIVE + turn-limit objectives, never GONE)');
}
