(function(){
 // BTF TEST PILOT — in-page control layer (Engineering 06). DEV ONLY: installed with ?dev=1 (or the F2 DEV panel's
 // dev-enabled body class); never on a normal player's page. One game, one control layer: everything here calls the
 // real engine (RAAdventures, RAClock, RARelations, stores, scenes). Anything reached through it is DEV-REACHABLE at
 // most — never player reachability (docs/engineering/BTF_TEST_PILOT_ARCHITECTURE_HANDOFF_001.md §4).
 const dev=()=>(typeof location!=='undefined'&&/[?&]dev=1\b/.test(location.search||''))||!!document.body?.classList?.contains?.('dev-enabled');
 const log=[];const note=(what,why,extra={})=>{const row={t:Date.now(),day:RALife.today().day,what,why,...extra};log.push(row);return row;};
 // ---- deterministic RNG (harness-level: replaces Math.random for this page only; game-seeded content such as the
 // daily wants already uses its own seeded RNG and is unaffected) ----
 let seeded=null;const nativeRandom=Math.random;
 function seed(n){if(n==null){Math.random=nativeRandom;seeded=null;return null;}let s=(Number(n)>>>0)||1;Math.random=()=>{s=(Math.imul(s^s>>>15,2246822519)+0x9e3779b9)>>>0;return s/4294967296;};seeded=n;note('rng seeded','deterministic weighted/random content',{seed:n});return n;}
 // ---- drive an adventure through the real engine (same contract as tools/pilot/headless.mjs drive) ----
 const labelOf=c=>String(c?.label||'').replace(/<[^>]+>/g,'');
 function drive(id,{vars={},prefer=[],path=null,minigame=()=>({outcome:'win',score:1,rewards:{}}),fight=()=>({outcome:'win'}),until=null}={}){
  const A=RAAdventures;if(A.active())A.abandon();const run=A.start(id,{from:'pilot',vars});if(!run)throw new Error(`${id}: not available`);
  let node=run.node,steps=0;const trail=[];
  while(node&&steps++<400){
   if(until&&node===until)return {stoppedAt:node,trail};
   const r=A.enter(node);const n=r.node,C=A.context();trail.push(node);if(path&&path[0]===node)path.shift();
   if(n.end)return {res:A.complete(node),trail};
   if(n.route){C.set('route','walk');node=n.route.next;continue;}
   if(n.choices){const list=A.choicesFor(node).filter(c=>!c.locked);if(!list.length){if(n.next){node=A.nextOf(node);continue;}A.abandon();return {abandoned:node,trail};}
    const want=(path&&list.find(c=>resolveNext(node,c.index)===path[0]))||prefer.map(p=>list.find(c=>p.test(labelOf(c)))).find(Boolean)||list[0];
    node=A.choose(node,want.index);continue;}
   if(n.minigame){if(typeof n.minigame.params==='function')n.minigame.params(C);node=A.afterMinigame(node,minigame(n.minigame.id));continue;}
   if(n.fight){if(typeof n.fight.params==='function')n.fight.params(C);node=A.afterFight(node,fight(n.fight.enemy));continue;}
   node=A.nextOf(node);
  }
  throw new Error(`${id}: no end`);
 }
 function resolveNext(nodeId,index){const a=RAAdventures.active();const n=RAAdventures.get(a.id).nodes[nodeId];const list=typeof n.choices==='function'?n.choices(RAAdventures.context()):n.choices;const nx=list?.[index]?.next;try{return typeof nx==='function'?nx(RAAdventures.context()):nx}catch{return null}}
 // Shortest static path start → target (string edges; function edges evaluated in the live context).
 function pathTo(id,target){const def=RAAdventures.get(id);const prev={[def.start]:null},q=[def.start];
  while(q.length){const cur=q.shift();if(cur===target)break;const n=def.nodes[cur];const out=[];
   const add=x=>{if(typeof x==='string')out.push(x)};add(n.next);if(n.route)add(n.route.next);if(n.fight)['win','lose','spared'].forEach(k=>add(n.fight[k]));
   if(Array.isArray(n.choices))n.choices.forEach(c=>add(c.next));
   for(const t of out)if(!(t in prev)){prev[t]=cur;q.push(t);}}
  if(!(target in prev))return null;const p=[];for(let c=target;c!=null;c=prev[c])p.unshift(c);return p.slice(1);}
 // Launch an adventure AT a node with its inherited context: replay the real path from the start (so env, cast, vars
 // and every `enter` effect are the ones a player would have), then open the adventure scene there.
 async function launch(id,{node=null,vars={}}={}){
  let trail=[];if(node&&node!==RAAdventures.get(id)?.start){const p=pathTo(id,node);if(!p)throw new Error(`${id}: no static path to ${node}`);const r=drive(id,{vars,path:[...p],until:node});trail=r.trail;if(r.stoppedAt!==node)throw new Error(`${id}: replay ended at ${r.res?.id||r.abandoned}`);}
  else{if(RAAdventures.active())RAAdventures.abandon();RAAdventures.start(id,{from:'pilot',vars});}
  note('launch',`${id}${node?':'+node:''} (DEV-REACHABLE, replayed ${trail.length} nodes)`,{trail});
  const at=node||RAAdventures.active().node;await RAScenes.go('adventure',{node:at});return {id,node:at,trail};
 }
 // ---- clock ----
 function advance(days=1){for(let i=0;i<days;i++)RAClock.sleep();window.RABedroomLife?.refresh?.();note('advance',`${days} real sleep(s)`);return RALife.today().day;}
 function toWeekday(name){for(let i=0;i<8&&RALife.today().weekday!==String(name).toUpperCase();i++)RAClock.sleep();return RALife.today();}
 // ---- state ----
 function dump(){const L=RALife.life();return JSON.parse(JSON.stringify({version:RAState.get().version,day:L.world.day,money:L.resources.money,followers:L.resources.followers,clout:L.resources.clout,rep:L.resources.vampireReputation,flags:L.world.flags,people:Object.fromEntries(Object.entries(L.people.records||{}).map(([id,r])=>[id,{met:!!r.met,points:r.points||0}])),adventures:Object.fromEntries(Object.entries(L.adventures.records).map(([id,r])=>[id,r.count||0])),active:L.adventures.active?.id||null,rooms:(L.ownership.castleRooms||[]).map(r=>r.id),cars:(L.ownership.cars||[]).map(c=>c.id),props:L.ownership.props,items:L.ownership.items,dragon:L.ownership.dragon?.stage||null,apps:Object.keys(L.phone.apps||{}).filter(k=>L.phone.apps[k]?.unlocked),wants:(L.temptations.live||[]).map(t=>t.id)}));}
 function diff(a,b,p=''){const out=[];const keys=new Set([...Object.keys(a||{}),...Object.keys(b||{})]);for(const k of keys){const x=a?.[k],y=b?.[k],q=p?`${p}.${k}`:k;if(x&&y&&typeof x==='object'&&typeof y==='object'&&!Array.isArray(x))out.push(...diff(x,y,q));else if(JSON.stringify(x)!==JSON.stringify(y))out.push({path:q,before:x,after:y});}return out;}
 // ---- named scenarios: prerequisites WALKED through their real adventures; only PLAYER-BLIND / released legacy flows
 // are recorded as outcome fields (the same declared seeds tools/pilot/headless.mjs uses). ----
 const SEED={
  ogunsRave(){RAState.patch('life.world.flags.ogunsRaveCompleted',true);RAState.patch('life.world.flags.castlePartyHostingUnlocked',true);RALife.unlockApp('vampgram',{silent:true});window.RALegacyBridge?.bridge?.({});return note('seed',"Ogun's Rave outcome flags (PLAYER-BLIND flow)");},
  supra(){if(!RALife.hasCar(RACars.SUPRA)){RALife.spend(78000);RALife.addCar({id:RACars.SUPRA,make:'Toyota',model:'Supra MK4',short:'SUPRA',price:78000,value:78000,parts:{}});window.RALegacyBridge?.bridge?.({});}return note('seed','I Want a Supra outcome (Supra owned; legacy flow)');}
 };
 const started=()=>{if(!RALife.life().clock.started){RAClock.wake({first:true});RALife.setFlag('prologueDone',true);RALife.setFlag('throneDone',true);RALife.setFlag('firstWakeDone',true);note('seed','life clock started (prologue/throne covered by new-game QA)');}};
 const SCENARIOS={
  'day-1':{about:'a fresh life on Day 1, after the prologue',run(){started();}},
  'after-ogun':{about:"Day 3 with Ogun's Rave done and the Supra owned",run(){started();advance(2);SEED.ogunsRave();SEED.supra();}},
  'kiki-close':{about:'Kiki met through A07 and taken on dates until CLOSE (InstaHoe unlocked by A07)',run(){started();advance(8);drive('A07');for(let i=0;i<8&&RARelations.level('kiki')<3;i++){advance(1);drive('DATE',{vars:{person:'kiki'},prefer:[/HONESTLY|TRUTH|ASK/]});}}},
  'prepared-a23r':{about:'A23 lost, the Armory found (A19), visited (A24) and a gun bought',run(){started();advance(2);drive('A23');drive('A19');drive('A24');RALife.addMoney(30000);drive('ARMORY',{prefer:[/LIL OGA/,/ENOUGH GRACE/]});}},
  'party-host':{about:"Ogun's Rave done and a Party Hall bought with saved money (+$300K DEV money, declared)",run(){started();advance(2);SEED.ogunsRave();RALife.addMoney(300000);note('seed','+$300,000 DEV money (economy: see HQ decision on pacing)');RACastle.buy('party_hall');}},
  'coffe-tells':{about:'Coffe met on his wake beat, then real sleeps to the PT2 fork (day 23)',run(){started();advance(1);drive('A29');advance(22-RALife.today().day+1);}},
  'waffle-night-3':{about:'Waffle Saga nights 1–2 played, one sleep apart',run(){started();advance(2);for(const id of ['A44','A44_N2']){drive(id);advance(1);}}}
 };
 function scenario(name){const s=SCENARIOS[name];if(!s)throw new Error(`unknown scenario ${name}`);const before=log.length;s.run();window.RABedroomLife?.refresh?.();return {name,about:s.about,level:'DEV-REACHABLE',seeds:log.slice(before).filter(r=>r.what==='seed'),state:dump()};}
 const api={seed,drive,pathTo,launch,advance,toWeekday,dump,diff,scenario,scenarios:()=>Object.fromEntries(Object.entries(SCENARIOS).map(([k,v])=>[k,v.about])),log:()=>log.slice(),get seeded(){return seeded;}};
 function install(){if(!dev()||window.RATestPilot)return;window.RATestPilot=api;
  // DEV panel: scenario loader + launch-at-node (replayed).
  const panel=document.querySelector('#devPanel');if(!panel)return;const box=document.createElement('section');box.className='btf-dev test-pilot';
  box.innerHTML=`<div class="dev-title">TEST PILOT (DEV-REACHABLE ONLY)</div><label>SCENARIO <select id="tpScenario">${Object.keys(SCENARIOS).map(k=>`<option>${k}</option>`).join('')}</select></label><button type="button" data-tp="scenario">LOAD</button><label>SEED <input id="tpSeed" value="1" size="6"></label><button type="button" data-tp="seed">SEED RNG</button><label>LAUNCH <input id="tpLaunch" placeholder="A44_N3:rival" size="14"></label><button type="button" data-tp="launch">GO</button><pre id="tpOut" class="dev-readout"></pre>`;
  panel.append(box);const out=t=>{box.querySelector('#tpOut').textContent=typeof t==='string'?t:JSON.stringify(t,null,1).slice(0,1200);};
  box.addEventListener('click',async e=>{const b=e.target.closest('[data-tp]');if(!b)return;try{
   if(b.dataset.tp==='scenario')out(scenario(box.querySelector('#tpScenario').value));
   if(b.dataset.tp==='seed')out(`seeded ${seed(Number(box.querySelector('#tpSeed').value))}`);
   if(b.dataset.tp==='launch'){const [id,node]=box.querySelector('#tpLaunch').value.trim().split(':');out(await launch(id,{node:node||null}));}
  }catch(err){out(String(err.message||err));}});
 }
 document.addEventListener('DOMContentLoaded',()=>setTimeout(install,0));if(document.readyState!=='loading')setTimeout(install,0);
 window.RATestPilotInstall=install;
})();
