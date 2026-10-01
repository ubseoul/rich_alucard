// F01 Oga classes, signature abilities, named-Oga traits, stories, bonds (Vol 7 5.4 / 6).
import assert from 'node:assert/strict';
import {core,scenario,oga,must,refused,tweak,OPEN,J,ids} from './_lib.mjs';

export async function test(root){
  const c=await core(root);const R=c.RAShowdownRules,E=c.RAShowdownEngine,D=c.RAShowdownData,Rng=c.RAShowdownRng;
  // ---- the authored table, transcribed literally ----
  const TABLE={MUSCLE:[9,60,5],SHOOTER:[6,78,5],WHEELS:[6,62,7],TALKER:[6,58,5],GHOST:[5,70,6],DOC:[6,60,5]};
  assert.deepEqual(Object.keys(D.CLASSES).sort(),Object.keys(TABLE).sort(),'exactly the six authored classes');
  for(const [k,[hp,aim,mob]] of Object.entries(TABLE)){const s=scenario(c,{squad:[oga('a',k,{x:2,y:7})],enemies:[{type:'CHEWER',x:2,y:0}],revealed:false});const u=s.units.a;assert.deepEqual([u.maxHp,u.aim,u.mobility],[hp,aim,mob],k);}
  assert.deepEqual(Object.values(D.CLASSES).map(x=>x.ability).sort(),['DEAD_EYE','PATCH_UP','SHOULDER_CHECK','TALK_HIM_DOWN','THE_CAR','VANISH']);
  refused(c,scenario(c,{squad:[oga('a','MUSCLE',{x:2,y:7})],enemies:[{type:'CHEWER',x:2,y:0}],revealed:false}),{type:'ABILITY',unit:'a',ability:'DEAD_EYE',target:'e1'},'NO_ABILITY');
  const fresh=(cls,extra={},foes=[{type:'CHEWER',x:2,y:3}],rows=OPEN)=>scenario(c,{rows,squad:[oga('a',cls,{x:2,y:7,...extra})],enemies:foes});
  // ---- MUSCLE: SHOULDER CHECK ----
  {let s=fresh('MUSCLE');const r=must(c,s,{type:'ABILITY',unit:'a',ability:'SHOULDER_CHECK',target:'e1'});
   assert.equal(r.state.units.a.y,4,'charged to the tile next to the target');assert(R.adjacent(r.state.units.a,r.state.units.e1));
   assert.equal(r.state.units.e1.hp,2,'3 damage (5 -> 2)');assert.equal(r.state.units.a.ap,1,'one action');assert.equal(r.state.units.e1.exposed,true,'knocked out of cover');
   const half=['......','......','..L...','......','......','......','......','......','xxxxxx'];
   let w=fresh('SHOOTER',{},[{type:'ENFORCER',x:2,y:3}],half);w=tweak(c,w,x=>{x.units.a.x=2;x.units.a.y=0;});
   assert.equal(R.preview(w,w.units.a,w.units.e1).cover,'HALF');
   const ex=tweak(c,w,x=>{x.units.e1.exposed=true;});const pv=R.preview(ex,ex.units.a,ex.units.e1);assert.equal(pv.cover,'NONE');assert.equal(pv.chance,78,'exposed: cover is gone');assert.equal(pv.flanked,false);
   // must be reachable, and not while carrying
   refused(c,fresh('MUSCLE',{},[{type:'CHEWER',x:2,y:0}]),{type:'ABILITY',unit:'a',ability:'SHOULDER_CHECK',target:'e1'},'NO_PATH');
   // already adjacent: no movement needed
   let adj=fresh('MUSCLE',{},[{type:'CHEWER',x:2,y:6}]);const ra=must(c,adj,{type:'ABILITY',unit:'a',ability:'SHOULDER_CHECK',target:'e1'});assert.equal(ra.state.units.a.y,7);assert(!ra.events.some(e=>e.t==='MOVE'));}
  // ---- SHOOTER: DEAD EYE = -10 aim, +3 damage ----
  {const s=fresh('SHOOTER');const plain=R.preview(s,s.units.a,s.units.e1),eye=R.preview(s,s.units.a,s.units.e1,{ability:'DEAD_EYE'});
   assert.equal(plain.chance-eye.chance,10);assert.equal(eye.dmgMin,plain.dmgMin+3);assert.equal(eye.dmgMax,plain.dmgMax+3);
   const r=must(c,s,{type:'ABILITY',unit:'a',ability:'DEAD_EYE',target:'e1'});const sh=r.events.find(e=>e.t==='SHOT');assert.equal(sh.ability,'DEAD_EYE');assert.equal(r.state.units.a.weapon.clip,3,'it is a real shot');}
  // ---- WHEELS: THE CAR, once per showdown ----
  {let s=fresh('WHEELS');
   const cover=must(c,s,{type:'ABILITY',unit:'a',ability:'THE_CAR',mode:'COVER',to:{x:2,y:5}});
   const car=cover.state.props.find(p=>p.kind==='CAR');assert(car&&car.level==='FULL'&&car.destructible&&car.x===2&&car.y===5);
   assert.equal(R.coverVs(cover.state,{x:2,y:6},{x:2,y:0}).level,'FULL','the car is FULL cover for whoever stands behind it');
   refused(c,tweak(c,cover.state,x=>{x.units.a.ap=2;}),{type:'ABILITY',unit:'a',ability:'THE_CAR',mode:'RAM',target:'e1'},'ONE_PER_SHOWDOWN');
   refused(c,s,{type:'ABILITY',unit:'a',ability:'THE_CAR',mode:'COVER',to:{x:2,y:0}},'OUT_OF_RANGE');
   const ram=must(c,fresh('WHEELS',{},[{type:'CHEWER',x:2,y:4},{type:'CHEWER',x:5,y:0}]),{type:'ABILITY',unit:'a',ability:'THE_CAR',mode:'RAM',target:'e1'});
   assert.equal(ram.state.units.e1.hp,0,'ram = 5 damage (chewer 5 HP)');assert.equal(ram.state.flags.carRammed,true);
   const fin=must(c,ram.state,{type:'RETREAT'}).state.result;assert.equal(fin.car.rammed,true,'the result tells F04 the car rammed (CAR WRECKED check)'); }
  // ---- TALKER: TALK HIM DOWN ----
  {const hurt=(cls,extra,foe='CHEWER')=>tweak(c,fresh(cls,extra,[{type:foe,x:2,y:4}]),x=>{x.units.e1.hp=Math.floor(x.units.e1.maxHp/2)-((x.units.e1.maxHp%2)?0:1);});
   let s=hurt('TALKER');assert(s.units.e1.hp*2<s.units.e1.maxHp);
   refused(c,fresh('TALKER'),{type:'ABILITY',unit:'a',ability:'TALK_HIM_DOWN',target:'e1'},'TOO_HEALTHY');
   assert.equal(E.talkChance(s.units.a),60);assert.equal(E.talkChance({...s.units.a,traits:['MOUTHPIECE']}),75,'MOUTHPIECE +15%');
   let won=0;const N=3000;for(let i=0;i<N;i++){const q=tweak(c,s,x=>{x.rng=Rng.create('tk'+i);});const r=must(c,q,{type:'ABILITY',unit:'a',ability:'TALK_HIM_DOWN',target:'e1'});const t=r.events.find(e=>e.t==='TALK');assert.equal(t.chance,60);if(t.success){won++;assert.equal(r.state.units.e1.status,'REMOVED');assert.equal(r.state.units.e1.removedReason,'SURRENDERED');}else assert.equal(r.state.units.e1.status,'ACTIVE');}
   assert(won/N>.56&&won/N<.64,`TALK HIM DOWN is honestly 60% (saw ${(won/N*100).toFixed(1)}%)`);
   const hunter=hurt('TALKER',{},'HUNTER');refused(c,hunter,{type:'ABILITY',unit:'a',ability:'TALK_HIM_DOWN',target:'e1'},'HUNTERS_DONT_LISTEN');
   const storied=hurt('TALKER',{stories:['talked_down_a_hunter']},'HUNTER');must(c,storied,{type:'ABILITY',unit:'a',ability:'TALK_HIM_DOWN',target:'e1'});
   const far=tweak(c,s,x=>{x.units.e1.x=2;x.units.e1.y=0;x.units.a.y=7;});refused(c,far,{type:'ABILITY',unit:'a',ability:'TALK_HIM_DOWN',target:'e1'},'OUT_OF_RANGE'); }
  // ---- GHOST: VANISH ----
  {let s=fresh('GHOST',{},[{type:'CHEWER',x:2,y:3}]);
   s=must(c,s,{type:'ABILITY',unit:'a',ability:'VANISH'}).state;assert.equal(s.units.a.conceal,true);
   assert.equal(R.preview(s,s.units.e1,s.units.a).code,'CONCEALED','enemies cannot target a concealed Oga');
   const ai=must(c,s,{type:'END_TURN'});assert(!ai.events.some(e=>e.t==='SHOT'&&e.to==='a'),'the AI leaves the concealed Oga alone');
   const nxt=ai.state;assert.equal(nxt.units.a.conceal,false,'concealed for 1 turn');
   // first shot from concealment +20, then it breaks
   let g=fresh('GHOST',{},[{type:'CHEWER',x:2,y:3}]);g=must(c,g,{type:'ABILITY',unit:'a',ability:'VANISH'}).state;
   const pv=R.preview(g,g.units.a,g.units.e1);assert.equal(pv.breakdown.find(l=>l.id==='vanish').value,20);assert.equal(pv.chance,90);
   const sh=must(c,g,{type:'SHOOT',unit:'a',target:'e1'});assert.equal(sh.state.units.a.conceal,false,'shooting breaks concealment');
   // SILENCER: shots do not break concealment; only the FIRST shot gets +20
   let q=fresh('GHOST',{mods:['silencer']},[{type:'ENFORCER',x:2,y:3}]);q=tweak(c,q,x=>{x.units.e1.hp=99;x.units.e1.maxHp=99;});q=must(c,q,{type:'ABILITY',unit:'a',ability:'VANISH'}).state;
   q=must(c,q,{type:'SHOOT',unit:'a',target:'e1'}).state;assert.equal(q.units.a.conceal,true,'SILENCER keeps concealment');
   assert.equal(R.preview(q,q.units.a,q.units.e1).breakdown.some(l=>l.id==='vanish'),false,'+20 is for the first shot only');
   // HUNTERS ignore VANISH
   let hh=fresh('GHOST',{},[{type:'HUNTER',x:2,y:3}]);hh=must(c,hh,{type:'ABILITY',unit:'a',ability:'VANISH'}).state;assert.equal(R.preview(hh,hh.units.e1,hh.units.a).ok,true,'a HUNTER ignores VANISH'); }
  // ---- DOC: PATCH UP ----
  {let s=scenario(c,{squad:[oga('a','DOC',{x:2,y:6}),oga('b','MUSCLE',{x:3,y:6})],enemies:[{type:'CHEWER',x:2,y:0}],revealed:false});
   refused(c,s,{type:'ABILITY',unit:'a',ability:'PATCH_UP',target:'b'},'NOTHING_TO_DO');
   s=tweak(c,s,x=>{x.units.b.hp=3;});let r=must(c,s,{type:'ABILITY',unit:'a',ability:'PATCH_UP',target:'b'});assert.equal(r.state.units.b.hp,7,'heal 4');
   s=tweak(c,s,x=>{x.units.b.hp=7;});r=must(c,s,{type:'ABILITY',unit:'a',ability:'PATCH_UP',target:'b'});assert.equal(r.state.units.b.hp,9,'never above max');
   refused(c,tweak(c,s,x=>{x.units.b.x=5;x.units.b.hp=2;}),{type:'ABILITY',unit:'a',ability:'PATCH_UP',target:'b'},'NOT_ADJACENT'); }
  // ---- named-Oga traits ----
  {// ALWAYS EATING: +1 at end of turn only if he has not moved
   let s=tweak(c,scenario(c,{squad:[oga('a','MUSCLE',{x:2,y:7,traits:['ALWAYS_EATING']})],enemies:[{type:'CHEWER',x:2,y:0}],revealed:false}),x=>{x.units.a.hp=5;});
   assert.equal(must(c,s,{type:'END_TURN'}).state.units.a.hp,6);
   assert.equal(must(c,must(c,s,{type:'MOVE',unit:'a',to:{x:2,y:6}}).state,{type:'END_TURN'}).state.units.a.hp,5,'moving forfeits the meal');
   // DRESSED TO KILL: +1 damage while undamaged
   const dk=fresh('SHOOTER',{traits:['DRESSED_TO_KILL']});assert.equal(R.preview(dk,dk.units.a,dk.units.e1).dmgMin,3);
   {const hd=tweak(c,dk,x=>{x.units.a.hp=4;});assert.equal(R.preview(hd,hd.units.a,hd.units.e1).dmgMin,2,'gone once hurt');}
   // ROOKIE -10 aim until first STORY; BIG POTENTIAL doubles story perks
   const rk=fresh('WHEELS',{traits:['ROOKIE']});assert.equal(R.preview(rk,rk.units.a,rk.units.e1).chance,62-10);
   const rk2=fresh('WHEELS',{traits:['ROOKIE'],stories:['saw_95_miss']});assert.equal(R.preview(rk2,rk2.units.a,rk2.units.e1).chance,62+5);
   const bp=fresh('WHEELS',{traits:['BIG_POTENTIAL'],stories:['saw_95_miss']});assert.equal(R.preview(bp,bp.units.a,bp.units.e1).chance,62+10,'SAW 95% MISS doubled: +10');
   // SMALL: -10 to be hit
   let sm=scenario(c,{squad:[oga('a','GHOST',{x:2,y:7,traits:['SMALL']})],enemies:[{type:'CHEWER',x:2,y:4}]});assert.equal(R.preview(sm,sm.units.e1,sm.units.a).breakdown.find(l=>l.id==='small').value,-10);
   // stories: SAW 95% MISS +5 aim; SURVIVED THE CAR WASH +5 aim only while in cover
   const s95=fresh('SHOOTER',{stories:['saw_95_miss']});assert.equal(R.preview(s95,s95.units.a,s95.units.e1).chance,83);
  }
  {const wash=scenario(c,{rows:['......','......','......','......','......','......','..L...','......','xxxxxx'],squad:[oga('a','SHOOTER',{x:2,y:7,stories:['survived_the_car_wash']})],enemies:[{type:'CHEWER',x:2,y:3}]});
   const pv=R.preview(wash,wash.units.a,wash.units.e1);assert.equal(pv.breakdown.some(l=>l.id==='story_wash'),true,'+5 while in cover');
   const open=scenario(c,{squad:[oga('a','SHOOTER',{x:2,y:7,stories:['survived_the_car_wash']})],enemies:[{type:'CHEWER',x:2,y:3}]});assert.equal(R.preview(open,open.units.a,open.units.e1).breakdown.some(l=>l.id==='story_wash'),false,'nothing in the open');}
  // stories are capped at 4 and unknown ones are dropped
  {const s=fresh('DOC',{stories:['saw_95_miss','survived_car_wash','talked_down_hunter','carried_tunde','saw_95_miss','nonsense']});assert.equal(s.units.a.stories.length,4);assert(!s.units.a.stories.includes('nonsense'));}
  // CARRIED TUNDE removes the carry slowdown (checked in downed.test)
  // PHONE OUT: reveals a hidden pod once
  {let s=scenario(c,{squad:[oga('a','TALKER',{x:2,y:7,traits:['PHONE_OUT']})],enemies:[{type:'CHEWER',x:2,y:0,pod:'p1'}],revealed:false});
   const av=E.available(s,'a');assert(av.ABILITIES.some(a=>a.id==='PHONE_OUT'&&a.ok));
   const r=must(c,s,{type:'ABILITY',unit:'a',ability:'PHONE_OUT'});assert.equal(r.state.pods[0].revealed,true);
   refused(c,tweak(c,r.state,x=>{x.units.a.ap=2;}),{type:'ABILITY',unit:'a',ability:'PHONE_OUT'},'ONE_PER_SHOWDOWN'); }
  // SIT DOWN: a downed ally she reaches is stabilized for free
  {let s=scenario(c,{squad:[oga('a','DOC',{x:2,y:7,traits:['SIT_DOWN']}),oga('b','MUSCLE',{x:2,y:4})],enemies:[{type:'CHEWER',x:2,y:0}],revealed:false});
   s=tweak(c,s,x=>{x.units.b.status='DOWNED';x.units.b.hp=0;x.units.b.bleed=3;});
   const r=must(c,s,{type:'MOVE',unit:'a',to:{x:2,y:5}});assert.equal(r.state.units.b.stabilized,true);assert(r.events.some(e=>e.t==='STABILIZED'&&e.free)); }
  // ---- DAY ONES: +10 aim adjacent; a free move toward a downed partner ----
  {let s=scenario(c,{squad:[oga('a','SHOOTER',{x:2,y:6,bonds:['b']}),oga('b','MUSCLE',{x:3,y:6}),oga('d','DOC',{x:0,y:8})],enemies:[{type:'CHEWER',x:2,y:3}]});
   assert.equal(JSON.stringify(s.units.b.bonds),'["a"]','bonds are symmetric');
   assert.equal(R.preview(s,s.units.a,s.units.e1).breakdown.find(l=>l.id==='bond').value,10);
   const apart=tweak(c,s,x=>{x.units.b.x=5;x.units.b.y=8;});assert.equal(R.preview(apart,apart.units.a,apart.units.e1).breakdown.some(l=>l.id==='bond'),false,'only when adjacent');
   // partner downed -> the other moves toward them for free
   let done=false;
   for(let i=0;i<80&&!done;i++){
    const t=scenario(c,{squad:[oga('a','SHOOTER',{x:0,y:6,bonds:['b']}),oga('b','MUSCLE',{x:3,y:6})],enemies:[{type:'ENFORCER',x:3,y:4}],seed:'bond'+i});
    const q=tweak(c,t,x=>{x.units.b.hp=1;});
    const r=must(c,q,{type:'END_TURN'});
    if(r.events.some(e=>e.t==='DOWNED'&&e.id==='b')){
     const mv=r.events.find(e=>e.t==='MOVE'&&e.id==='a'&&e.free);
     assert(mv,'the Day One gets a free move toward the downed partner');
     const last=mv.path[mv.path.length-1];assert(R.dist(last,q.units.b)<R.dist({x:0,y:6},q.units.b),'and it is a move TOWARD them');done=true;
    }
   }
   assert(done,'saw a downing in 80 seeds'); }
  console.log('PASS F01 classes (authored stats, six signature abilities incl. once-per-showdown CAR, honest 60% talk, VANISH/SILENCER/HUNTER, PATCH UP, traits, stories, DAY ONES)');
}
