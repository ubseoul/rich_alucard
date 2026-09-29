// F01 hit model: every Vol 7 5.3 modifier, crit, honesty of displayed odds.
import assert from 'node:assert/strict';
import {core,scenario,oga,must,tweak,OPEN} from './_lib.mjs';

export async function test(root){
  const c=await core(root);const R=c.RAShowdownRules,E=c.RAShowdownEngine,D=c.RAShowdownData,Rng=c.RAShowdownRng;
  const line=(pv,id)=>{const l=pv.breakdown.find(x=>x.id===id);return l?l.value:0;};
  // a shooter (AIM 78) facing a chewer at 3 tiles, open ground
  const base=(rows=OPEN,shooter={},foe={})=>scenario(c,{rows,squad:[oga('a','SHOOTER',{x:2,y:6,...shooter})],enemies:[{type:'CHEWER',x:2,y:3,...foe}]});
  let s=base();let pv=R.preview(s,s.units.a,s.units.e1);
  assert.equal(pv.chance,78,'base aim is the Oga AIM stat');assert.equal(pv.crit,10,'crit base 10%');assert.equal(pv.cover,'NONE');
  // HALF -20, FULL -40 (wall north of the target, shooter to the north... put the shooter on the covered side)
  const half=['......','......','......','..L...','......','......','......','......','xxxxxx'];
  s=scenario(c,{rows:half,squad:[oga('a','SHOOTER',{x:2,y:0})],enemies:[{type:'CHEWER',x:2,y:4}]});
  pv=R.preview(s,s.units.a,s.units.e1);assert.equal(pv.chance,58);assert.equal(line(pv,'cover'),-20);assert.equal(pv.cover,'HALF');
  const full=['......','......','......','..P...','......','......','......','......','xxxxxx'];
  s=scenario(c,{rows:full,squad:[oga('a','SHOOTER',{x:2,y:5})],enemies:[{type:'CHEWER',x:2,y:2}]}); // pillar at (2,3), target (2,2): shooter south of the pillar is on the covered side? cover for target from south
  pv=R.preview(s,s.units.a,s.units.e1);assert.equal(pv.cover,'FULL');assert.equal(pv.chance,38);assert.equal(line(pv,'cover'),-40);
  // FLANKED: cover ignored, +30 crit
  s=scenario(c,{rows:half,squad:[oga('a','SHOOTER',{x:5,y:4})],enemies:[{type:'CHEWER',x:2,y:4}]});
  pv=R.preview(s,s.units.a,s.units.e1);assert.equal(pv.flanked,true);assert.equal(pv.chance,78,'flanked ignores cover');assert.equal(pv.crit,40,'flanked: +30 crit');
  // height +15 and it ignores HALF cover
  const hi=['......','......','......','..L...','......','h.....','......','......','xxxxxx'];
  s=scenario(c,{rows:hi,squad:[oga('a','SHOOTER',{x:0,y:5})],enemies:[{type:'CHEWER',x:2,y:4}]});
  pv=R.preview(s,s.units.a,s.units.e1);assert.equal(pv.heightAdvantage,true);assert.equal(line(pv,'height'),15);
  // a high shooter looking over a HALF-covered target: cover ignored (shooter NW of the wall side)
  const hi2=['h.....','......','......','..L...','......','......','......','......','xxxxxx'];
  s=scenario(c,{rows:hi2,squad:[oga('a','SHOOTER',{x:0,y:0})],enemies:[{type:'CHEWER',x:2,y:4}]});
  // shooter (0,0), target (2,4): wall at (2,3) north of target; dx=-2,dy=-4 -> along 4>=perp 2 => covered by geometry, but height ignores HALF
  pv=R.preview(s,s.units.a,s.units.e1);assert.equal(pv.cover,'HALF');assert.equal(line(pv,'cover'),0,'height ignores half cover');assert.equal(pv.chance,78+15);
  // FULL cover is not ignored by height
  const hi3=['h.....','......','......','..P...','......','......','......','......','xxxxxx'];
  s=scenario(c,{rows:hi3,squad:[oga('a','SHOOTER',{x:0,y:0})],enemies:[{type:'CHEWER',x:2,y:4}]});
  // LOS: pillar at (2,3) touching target -> allowed
  pv=R.preview(s,s.units.a,s.units.e1);assert.equal(pv.ok,true);assert.equal(line(pv,'cover'),-40);assert.equal(pv.chance,78+15-40);
  // overwatch -15
  s=base();pv=R.preview(s,s.units.a,s.units.e1,{reaction:true});assert.equal(line(pv,'overwatch'),-15);assert.equal(pv.chance,63);
  // shotgun close bonus +15 within 2 tiles, none at 3
  s=scenario(c,{squad:[oga('a','MUSCLE',{x:2,y:5,weapon:'sapporo_shotgun'})],enemies:[{type:'CHEWER',x:2,y:3}]});
  pv=R.preview(s,s.units.a,s.units.e1);assert.equal(line(pv,'close'),15);assert.equal(pv.chance,75);
  s=scenario(c,{squad:[oga('a','MUSCLE',{x:2,y:6,weapon:'sapporo_shotgun'})],enemies:[{type:'CHEWER',x:2,y:3}]});
  pv=R.preview(s,s.units.a,s.units.e1);assert.equal(line(pv,'close'),0);assert.equal(pv.chance,60);
  // pistol long range: -10 per tile past 5
  s=scenario(c,{squad:[oga('a','SHOOTER',{x:2,y:8})],enemies:[{type:'CHEWER',x:2,y:2}]});
  pv=R.preview(s,s.units.a,s.units.e1);assert.equal(pv.distance,6);assert.equal(line(pv,'long'),-10);assert.equal(pv.chance,68);
  s=scenario(c,{squad:[oga('a','SHOOTER',{x:2,y:8})],enemies:[{type:'CHEWER',x:2,y:1}]});
  pv=R.preview(s,s.units.a,s.units.e1);assert.equal(line(pv,'long'),-20);assert.equal(pv.chance,58);
  s=scenario(c,{squad:[oga('a','SHOOTER',{x:2,y:8})],enemies:[{type:'CHEWER',x:2,y:3}]});pv=R.preview(s,s.units.a,s.units.e1);assert.equal(line(pv,'long'),0,'exactly 5 tiles: no penalty');
  // hunkered target -20 (additional to cover)
  s=base();s=tweak(c,s,x=>{x.units.e1.hunker=true;});pv=R.preview(s,s.units.a,s.units.e1);assert.equal(line(pv,'hunker'),-20);assert.equal(pv.chance,58);
  s=scenario(c,{rows:half,squad:[oga('a','SHOOTER',{x:2,y:0})],enemies:[{type:'CHEWER',x:2,y:4}]});s=tweak(c,s,x=>{x.units.e1.hunker=true;});
  pv=R.preview(s,s.units.a,s.units.e1);assert.equal(pv.chance,78-20-20,'hunker stacks with cover');
  // chance is clamped to 0..100 and a 0% shot is refused
  s=scenario(c,{squad:[oga('a','SHOOTER',{x:2,y:6})],enemies:[{type:'CHEWER',x:2,y:3}]});s=tweak(c,s,x=>{x.units.a.aim=140;});assert.equal(R.preview(s,s.units.a,s.units.e1).chance,100);
  s=tweak(c,s,x=>{x.units.a.aim=-50;});assert.equal(R.preview(s,s.units.a,s.units.e1).chance,0);
  const r0=E.apply(s,{type:'SHOOT',unit:'a',target:'e1'});assert.equal(r0.ok,false);assert.equal(r0.code,'NO_CHANCE');
  // crit multiplier is x1.5 (rounded)
  assert.equal(D.HIT.critMult,1.5);assert.equal(D.HIT.critBase,10);
  // ---- HONESTY: a displayed 95% must really miss ~5% over many deterministic seeds ----
  const N=20000;let miss=0;
  for(let i=0;i<N;i++){const r=Rng.create('honest-'+i);if(!(Rng.percent(r)<95))miss++;}
  const rate=miss/N;assert(rate>.04&&rate<.06,`a 95% roll must miss ~5% of the time (saw ${(rate*100).toFixed(2)}%)`);
  // and through the real engine: build a 95% shot and count genuine misses
  const mk=seed=>{let t=scenario(c,{squad:[oga('a','SHOOTER',{x:2,y:6})],enemies:[{type:'ENFORCER',x:2,y:4}],seed});t=tweak(c,t,x=>{x.units.a.aim=95;x.units.e1.hp=99;x.units.e1.maxHp=99;});return t;};
  let engineMiss=0,jokes=0;const M=4000;
  for(let i=0;i<M;i++){const t=mk('e'+i);assert.equal(R.preview(t,t.units.a,t.units.e1).chance,95);const r=E.apply(t,{type:'SHOOT',unit:'a',target:'e1'});const sh=r.events.find(e=>e.t==='SHOT');if(!sh.hit){engineMiss++;if(sh.joke&&sh.caption==='95%???')jokes++;}}
  assert(engineMiss/M>.035&&engineMiss/M<.065,`engine 95% shots miss ~5% (saw ${(engineMiss/M*100).toFixed(2)}%)`);
  assert.equal(jokes,engineMiss,'every 95% miss earns the "95%???" caption');
  // a miss at 60% does not earn the joke
  {let t=base();t=tweak(c,t,x=>{x.units.a.aim=60;});let saw=0;for(let i=0;i<200;i++){const tt=tweak(c,t,x=>{x.rng=Rng.create('m'+i);});const r=E.apply(tt,{type:'SHOOT',unit:'a',target:'e1'});const sh=r.events.find(e=>e.t==='SHOT');if(!sh.hit&&sh.joke)saw++;}assert.equal(saw,0,'the joke is earned only at >=95%');}
  // 100% never misses, 0 never hits (via low-level sample)
  { let t=base();t=tweak(c,t,x=>{x.units.a.aim=100;x.units.e1.hp=999;x.units.e1.maxHp=999;});for(let i=0;i<500;i++){const tt=tweak(c,t,x=>{x.rng=Rng.create('c'+i);});assert(E.apply(tt,{type:'SHOOT',unit:'a',target:'e1'}).events.find(e=>e.t==='SHOT').hit);} }
  // crit frequency follows the displayed crit chance (10%)
  { let crit=0,hits=0;for(let i=0;i<6000;i++){let t=base();t=tweak(c,t,x=>{x.units.a.aim=100;x.units.e1.hp=999;x.units.e1.maxHp=999;x.rng=Rng.create('k'+i);});const sh=E.apply(t,{type:'SHOOT',unit:'a',target:'e1'}).events.find(e=>e.t==='SHOT');hits++;if(sh.crit)crit++;}
    assert(crit/hits>.08&&crit/hits<.12,`crit ~10% (saw ${(crit/hits*100).toFixed(2)}%)`); }
  // crit damage is 1.5x of the rolled damage
  { let seen=false;for(let i=0;i<400&&!seen;i++){let t=base();t=tweak(c,t,x=>{x.units.a.aim=100;x.units.e1.hp=999;x.units.e1.maxHp=999;x.rng=Rng.create('cd'+i);});const sh=E.apply(t,{type:'SHOOT',unit:'a',target:'e1'}).events.find(e=>e.t==='SHOT');if(sh.crit){seen=true;assert([3,5].includes(sh.dmg),`crit of 2-3 pistol dmg -> ${sh.dmg}`);}}assert(seen,'saw a crit'); }
  // damage stays inside the weapon range
  { const seenDmg=new Set();for(let i=0;i<500;i++){let t=base();t=tweak(c,t,x=>{x.units.a.aim=100;x.units.a.critBonus=-100;x.units.e1.hp=999;x.units.e1.maxHp=999;x.rng=Rng.create('d'+i);});seenDmg.add(E.apply(t,{type:'SHOOT',unit:'a',target:'e1'}).events.find(e=>e.t==='SHOT').dmg);}
    assert.deepEqual([...seenDmg].sort(),[2,3],'PISTOL deals 2-3'); }
  console.log('PASS F01 hit model (base aim, HALF/FULL, FLANKED +30 crit, height +15 ignoring HALF, overwatch -15, shotgun close +15, pistol long -10/tile past 5, hunker -20, clamp, crit x1.5, honest 95% => 5% real misses + earned caption)');
}
