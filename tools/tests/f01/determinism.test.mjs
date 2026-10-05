// F01 determinism + persistence: same state + same actions + same seed => the same fight, byte for byte.
import assert from 'node:assert/strict';
import {core,scenario,oga,must,tweak,J,decide,prng,playOut} from './_lib.mjs';

export async function test(root){
  const c=await core(root);const E=c.RAShowdownEngine,Rng=c.RAShowdownRng,M=c.RAShowdownMaps,SD=c.RAShowdown;
  const cfg=(seed,map='alley')=>({seed,map:M.get(map),squad:['MUSCLE','SHOOTER','GHOST','DOC'].map((cls,k)=>({id:cls.toLowerCase(),name:cls,cls,weapon:cls==='MUSCLE'?'sapporo_shotgun':cls==='SHOOTER'?'chopstick_sniper':'pistol',bonds:k===1?['muscle']:[]})),enemies:['CHEWER','CHEWER','ENFORCER','CHEWER']});
  // ---- RNG: seedable, serialisable, counted ----
  {const a=Rng.create('x'),b=Rng.create('x'),d=Rng.create('y');const sa=[...Array(20)].map(()=>Rng.next(a)),sb=[...Array(20)].map(()=>Rng.next(b)),sd=[...Array(20)].map(()=>Rng.next(d));
   assert.equal(JSON.stringify(sa),JSON.stringify(sb));assert.notEqual(JSON.stringify(sa),JSON.stringify(sd));assert.equal(a.calls,20);
   const copy=JSON.parse(JSON.stringify(a));assert.equal(Rng.next(copy),Rng.next(a),'a serialised RNG continues the same stream');
   for(const v of sa)assert(v>=0&&v<1);for(let i=0;i<500;i++){const n=Rng.int(a,2,4);assert(n>=2&&n<=4);} }
  // ---- same seed + same actions => identical fight ----
  const rec=(seed,map)=>{let s=E.create(cfg(seed,map));const out=playOut(c,s,{policy:'smart',seed:'d',check:false});return out;};
  const a=rec('det-1'),b=rec('det-1');
  assert.equal(E.hash(a.state),E.hash(b.state),'same seed, same policy => the same final state');
  assert.equal(JSON.stringify(a.events),JSON.stringify(b.events),'...and the same event stream');
  assert.equal(JSON.stringify(a.state.result),JSON.stringify(b.state.result));
  // replay from the action log alone reproduces it
  const rep=E.replay(cfg('det-1'),a.state.actions);assert.equal(rep.ok,true);assert.equal(E.hash(rep.state),E.hash(a.state),'replay(config, actions) == the live fight');
  assert.equal(JSON.stringify(rep.events),JSON.stringify(a.events));
  // different seeds diverge
  const hashes=new Set();for(let i=0;i<12;i++)hashes.add(E.hash(rec('seed-'+i).state));assert(hashes.size>=8,'different seeds give different fights ('+hashes.size+'/12)');
  // ---- the input state is never mutated ----
  {const s=E.create(cfg('imm'));const before=JSON.stringify(s);E.apply(s,{type:'MOVE',unit:'muscle',to:{x:1,y:5}});E.apply(s,{type:'END_TURN'});E.apply(s,{type:'NOPE'});assert.equal(JSON.stringify(s),before); }
  // ---- save / reload mid-fight ----
  {let s=E.create(cfg('sv'));const rnd=prng('sv');
   for(let i=0;i<14&&s.status==='ACTIVE';i++){const r=E.apply(s,decide(c,s,'smart',rnd));if(r.ok)s=r.state;}
   const frozen=E.serialize(s);assert.equal(typeof frozen,'string');
   const back=E.deserialize(frozen);assert.equal(E.hash(back),E.hash(s),'a round trip loses nothing');
   const cont=(st,seed)=>{const rr=prng(seed);let n=0;while(st.status==='ACTIVE'&&n++<300){let r=E.apply(st,decide(c,st,'smart',rr));if(!r.ok)r=E.apply(st,{type:'END_TURN'});st=r.state;}return st;};
   const x=cont(s,'after'),y=cont(back,'after');assert.equal(E.hash(x),E.hash(y),'continuing a reloaded fight == continuing the original');
   assert.throws(()=>E.deserialize('{"nope":1}'),/not an F01/); }
  // ---- session persistence through a store ----
  {const mem=new Map();c.localStorage={getItem:k=>mem.has(k)?mem.get(k):null,setItem:(k,v)=>mem.set(k,String(v)),removeItem:k=>mem.delete(k)};
   const made=SD.createSession(cfg('ss'),{store:'local'});assert.equal(made.ok,true);const ses=made.session;
   ses.dispatch({type:'MOVE',unit:'muscle',to:{x:1,y:5}});ses.dispatch({type:'END_TURN'});
   const loaded=SD.stores.local.load();assert(loaded&&loaded.status==='ACTIVE');assert.equal(E.hash(loaded),E.hash(ses.state),'autosave == live state');
   const resumed=SD.createSession(null,{state:loaded,store:'local'});assert.equal(resumed.ok,true);
   const r1=resumed.session.dispatch({type:'HUNKER',unit:'shooter'}),r2=ses.dispatch({type:'HUNKER',unit:'shooter'});assert.equal(E.hash(resumed.session.state),E.hash(ses.state));
   ses.dispatch({type:'RETREAT'});assert.equal(SD.stores.local.load(),null,'a finished fight clears the autosave');c.localStorage=null; }
  // ---- the result carries its own determinism receipt ----
  {const r=a.state.result;assert.equal(r.determinism.seed,'det-1');assert.equal(r.determinism.actions,a.state.actions.length);assert.equal(r.determinism.rngCalls,a.state.rng.calls);assert.match(r.determinism.stateHash,/^[0-9a-f]{8}$/); }
  // ---- 200 fights x 2 runs: no hidden nondeterminism (Math.random / Date) anywhere in the core ----
  {let bad=0;for(let i=0;i<30;i++){const p=rec('multi-'+i,['alley','dock','yard'][i%3]),q=rec('multi-'+i,['alley','dock','yard'][i%3]);if(E.hash(p.state)!==E.hash(q.state))bad++;}assert.equal(bad,0); }
  console.log('PASS F01 determinism (seedable RNG, identical replay, divergent seeds, immutable apply, save/reload mid-fight, store autosave, result receipt)');
}
