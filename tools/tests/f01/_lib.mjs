// Shared helpers for the F01 SHOWDOWN_CORE suites (not a test file: leading underscore).
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';

export const CORE=['rng','data','rules','engine','ai','maps','packets','showdown'].map(f=>`js/frag/F01/${f}.js`);
export const ALL_UI=['sprites','sfx','ui','sandbox'].map(f=>`js/frag/F01/${f}.js`);
// Isolated "browser" with only the F01 core loaded (no DOM, no IF-1): proves the tactical core stands alone.
export async function core(root,{extra=[]}={}){
  const ctx={console,setTimeout,clearTimeout,localStorage:null,structuredClone};ctx.window=ctx;vm.createContext(ctx);
  for(const f of [...CORE,...extra])vm.runInContext(await readFile(path.join(root,f),'utf8'),ctx,{filename:f});
  return ctx;
}
export const J=v=>JSON.parse(JSON.stringify(v));
// Build a tiny test map from ASCII rows (9x6) with explicit deploy/extraction lists.
export function mapOf(ctx,rows,{deploy,richEntry,extraction,slots,captive}={}){
  const spec={id:'t',name:'TEST',theme:'ALLEY',rows,deploy:deploy||[[1,7],[2,7],[3,7],[4,7],[0,7],[5,7]],richEntry:richEntry||[[5,8],[0,8]],slots:slots||[],captive:captive||null};
  return ctx.RAShowdownMaps.parse(spec);
}
export const OPEN=['......','......','......','......','......','......','......','......','xxxxxx'];
// squad member helper
export const oga=(id,cls,extra={})=>({id,name:id.toUpperCase(),cls,weapon:'pistol',...extra});
// create a state with hand-placed units. units: [{id,cls,x,y,...}] enemies: [{type,x,y,pod}]
export function scenario(ctx,{rows=OPEN,squad,enemies=[],seed='t',extra={},revealed=true,rich=true}={}){
  const map=mapOf(ctx,rows);
  const cfg={seed,map,squad:squad.map(s=>({...s,pos:{x:s.x,y:s.y}})),enemyUnits:enemies,rich,allRevealed:revealed,...extra};
  return ctx.RAShowdownEngine.create(cfg);
}
export function must(ctx,state,action){
  const r=ctx.RAShowdownEngine.apply(state,action);
  assert.equal(r.ok,true,`${JSON.stringify(action)} should succeed but got ${r.code}: ${r.message}`);
  return r;
}
export function refused(ctx,state,action,code){
  const r=ctx.RAShowdownEngine.apply(state,action);
  assert.equal(r.ok,false,`${JSON.stringify(action)} should be refused`);
  if(code)assert.equal(r.code,code);
  assert.equal(JSON.stringify(r.state),JSON.stringify(state),'a refused action must not change the state');
  return r;
}
// mutate a cloned state (states are plain JSON): edit(s)
export function tweak(ctx,state,edit){const s=J(state);edit(s);return s;}
export const ids=(events,t)=>events.filter(e=>e.t===t);

// ---- deterministic bots (test-only) ----
export function prng(seed){let a=0;for(const ch of String(seed))a=(Math.imul(a,31)+ch.charCodeAt(0))|0;return ()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
// One decision for the player side. policy 'smart' (shoot best odds, advance, cover, carry, patch, pull up late) or 'random' (any legal action).
export function decide(ctx,s,policy,rnd){
  const R=ctx.RAShowdownRules,E=ctx.RAShowdownEngine;
  const mine=s.order.map(id=>s.units[id]).filter(u=>u.side==='PLAYER'&&u.kind!=='CAPTIVE'&&u.status==='ACTIVE'&&u.ap>0);
  const legal=[];
  for(const u of mine){
    const av=E.available(s,u.id);
    if(u.kind==='RICH'){
      for(const [m,x] of Object.entries(av.RICH_MOVES||{})){if(!x.ok)continue;
        if(m==='BLOOD_BATH'){for(const e of E.liveEnemies(s)){if(!R.onGrid(e)||!R.spotted(s,e))continue;const a={type:'RICH_MOVE',unit:'rich',move:m,at:{x:e.x,y:e.y}};if(E.validate(s,a).ok)legal.push({a,w:9});}}
        else for(const e of E.liveEnemies(s)){const a={type:'RICH_MOVE',unit:'rich',move:m,target:e.id};if(E.validate(s,a).ok)legal.push({a,w:9});}}
    }else{
      for(const t of R.targets(s,u)){legal.push({a:{type:'SHOOT',unit:u.id,target:t.id},w:5+t.preview.chance/10+(t.preview.dmgMax>=s.units[t.id].hp?6:0)});}
      if(av.SHOOT&&av.SHOOT.area){for(const e of E.liveEnemies(s))if(R.onGrid(e)&&R.spotted(s,e)){const a={type:'SHOOT',unit:u.id,at:{x:e.x,y:e.y}};if(E.validate(s,a).ok)legal.push({a,w:6});}}
      for(const ab of av.ABILITIES||[]){if(!ab.ok)continue;
        if(['SHOULDER_CHECK','TALK_HIM_DOWN','DEAD_EYE'].includes(ab.id)){for(const e of E.liveEnemies(s)){const a={type:'ABILITY',unit:u.id,ability:ab.id,target:e.id};if(E.validate(s,a).ok)legal.push({a,w:4});}}
        else if(ab.id==='PATCH_UP'){for(const o of Object.values(s.units)){const a={type:'ABILITY',unit:u.id,ability:'PATCH_UP',target:o.id};if((o.kind==='OGA'||o.kind==='RICH')&&E.validate(s,a).ok)legal.push({a,w:o.status==='DOWNED'?12:3});}}
        else if(ab.id==='THE_CAR'){for(const e of E.liveEnemies(s)){const a={type:'ABILITY',unit:u.id,ability:'THE_CAR',mode:'RAM',target:e.id};if(E.validate(s,a).ok)legal.push({a,w:3});}}
        else if(ab.id==='VANISH'||ab.id==='PHONE_OUT'){legal.push({a:{type:'ABILITY',unit:u.id,ability:ab.id},w:2});}}
      if(av.CARRY&&av.CARRY.ok)for(const id of av.CARRY.targets)legal.push({a:{type:'CARRY',unit:u.id,target:id},w:10});
      if(av.RELOAD&&av.RELOAD.ok&&u.weapon.clip===0)legal.push({a:{type:'RELOAD',unit:u.id},w:8});
      if(av.OVERWATCH&&av.OVERWATCH.ok)legal.push({a:{type:'OVERWATCH',unit:u.id},w:1.5});
      if(av.HUNKER&&av.HUNKER.ok)legal.push({a:{type:'HUNKER',unit:u.id},w:.5});
    }
    if(av.MOVE&&av.MOVE.ok){
      const m=R.effectiveMobility(s,u);const ds=R.destinations(s,u,m);
      const carrier=u.carrying?true:false;
      let goals=carrier?s.map.extraction.map(([x,y])=>({x,y})):E.liveEnemies(s).filter(e=>R.onGrid(e)).map(e=>({x:e.x,y:e.y}));
      const cap=s.units.captive;if(!carrier&&cap&&cap.status==='DOWNED'&&s.objective.kind==='EXTRACT_TARGET')goals=[{x:cap.x,y:cap.y}];
      const down=Object.values(s.units).filter(o=>o.kind==='OGA'&&o.status==='DOWNED'&&!o.carriedBy);if(!carrier&&down.length&&u.cls!=='DOC')goals=down.map(o=>({x:o.x,y:o.y}));
      if(goals.length){const d0=Math.min(...goals.map(g=>R.dist(u,g)));
        for(const d of ds){const d1=Math.min(...goals.map(g=>R.dist(d,g)));if(d1<d0)legal.push({a:{type:'MOVE',unit:u.id,to:{x:d.x,y:d.y}},w:2+(d0-d1)*.6+(carrier?8:0)});}}
      if(policy==='random')for(const d of ds.slice(0,40))legal.push({a:{type:'MOVE',unit:u.id,to:{x:d.x,y:d.y}},w:1});
    }
  }
  if(E.canPullUp(s)&&(policy==='random'||E.liveEnemies(s).length>0&&s.turn>=3))legal.push({a:{type:'PULL_UP'},w:policy==='random'?2:7});
  for(let i=legal.length-1;i>=0;i--)if(legal[i].a.type!=='MOVE'&&!E.validate(s,legal[i].a).ok)legal.splice(i,1);
  if(!legal.length)return {type:'END_TURN'};
  if(policy==='random'){const p=rnd();if(p<.08)return {type:'END_TURN'};if(p<.10)return {type:'RETREAT'};return legal[Math.floor(rnd()*legal.length)].a;}
  legal.sort((x,y)=>y.w-x.w);
  if(rnd()<.03)return {type:'END_TURN'};
  return legal[0].a;
}
export function invariants(ctx,s,label=''){
  const R=ctx.RAShowdownRules,D=ctx.RAShowdownData;const seen=new Map();
  for(const u of Object.values(s.units)){
    assert(u.hp>=0&&u.hp<=u.maxHp,`${label} hp bounds ${u.id} ${u.hp}/${u.maxHp}`);
    assert(u.ap>=0&&u.ap<=2,`${label} ap bounds ${u.id} ${u.ap}`);
    assert(['ACTIVE','DOWNED','REMOVED','OFFSTAGE','TAKEN','EXTRACTED'].includes(u.status),`${label} status ${u.status}`);
    if(u.status==='ACTIVE')assert(u.hp>0||u.kind==='CAPTIVE',`${label} an ACTIVE unit has hp ${u.id}`);
    if(u.status==='DOWNED'&&u.kind==='OGA'){assert.equal(u.hp,0,`${label} downed hp`);assert(u.bleed>=0&&u.bleed<=D.BLEED_TURNS,`${label} bleed ${u.bleed}`);}
    if(R.onGrid(u)){
      assert(R.inb(s,u.x,u.y),`${label} ${u.id} off the field`);assert(!R.propAt(s,u.x,u.y),`${label} ${u.id} inside a prop at ${u.x},${u.y}`);
      const k=u.x+','+u.y;assert(!seen.has(k),`${label} ${u.id} and ${seen.get(k)} share ${k}`);seen.set(k,u.id);
    }
    if(u.carriedBy){const c=s.units[u.carriedBy];assert(c&&c.carrying===u.id,`${label} carry link ${u.id}`);assert.equal(u.x,c.x);assert.equal(u.y,c.y);}
    if(u.carrying){assert.equal(s.units[u.carrying].carriedBy,u.id);}
    if(u.side==='PLAYER'&&u.kind==='OGA')assert.notEqual(u.status,'GONE');
  }
  if(s.result){for(const o of s.result.ogaResults)assert(['ACTIVE','DOWNED','CAPTURED'].includes(o.finalStatus),`${label} F01 never finalizes GONE: ${o.finalStatus}`);assert.equal(s.result.gone.length,0);}
}
export function playOut(ctx,s,{policy='smart',seed='p',maxActions=400,check=true}={}){
  const E=ctx.RAShowdownEngine;const rnd=prng(seed);let n=0;const events=[];
  while(s.status==='ACTIVE'&&n++<maxActions){
    const a=decide(ctx,s,policy,rnd);let r=E.apply(s,a);
    if(!r.ok){r=E.apply(s,{type:'END_TURN'});assert(r.ok,'END_TURN must always be legal: '+r.code);}
    s=r.state;events.push(...r.events);if(check)invariants(ctx,s,`#${n}`);
  }
  return {state:s,events,actions:n};
}
