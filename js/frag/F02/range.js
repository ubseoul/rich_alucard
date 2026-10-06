(function(){
 'use strict';
 // F02 RANGE DAY — the Armory's basement range (authored minigame). A deterministic, DOM-free CORE plus a thin host
 // adapter registered with the accepted minigame host (RAMinigames). Portrait lanes; tap to aim, release to fire;
 // moving + hostage targets; a one-second cardboard Hilt; ammo/reload per gun. Rewards are named things, not XP:
 // a gun STORY (+10% crit) and a Deacon's-approval medal that unlocks one mod discount (see registry.awardRange).
 const C=window.RAIronCatalog,R=window.RAIronAndGrace;
 if(!C||!R)throw new Error('F02 range must load after catalog + registry');
 const T=C.TUNABLES.range;

 function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

 const KIND={target:{score:100,ttl:2.2,color:'#e8e2d0'},moving:{score:150,ttl:2.4,color:'#7fd0ff'},
  gold:{score:200,ttl:1.6,color:'#ffd75e'},hostage:{score:0,ttl:2.0,color:'#ff6b6b',hostage:true},
  hilt:{score:T.hiltBonus,ttl:1.0,color:'#c9b8ff',hilt:true}};

 function create({gunId,seed=1,params={}}={}){
  const cfg={...T,...params};
  const rng=mulberry32((Number(seed)||1)>>>0);
  const ammoMax=R.effectiveAmmo(gunId);
  const s={gunId,time:0,duration:cfg.durationSeconds,lanes:cfg.lanes||3,targets:[],nextId:1,
   score:0,shots:0,hits:0,ammo:ammoMax,reloading:0,spawnClock:.6,hiltSpawned:false,over:false,events:[]};
  function lane(){return Math.floor(rng()*(cfg.lanes||3));}
  function kindFor(t){
   if(cfg.durationSeconds-t<1.6&&!s.hiltSpawned){s.hiltSpawned=true;return 'hilt';}
   const r=rng();
   if(r<.12)return 'hostage';if(r<.30)return 'gold';if(r<.62)return 'moving';return 'target';
  }
  function spawn(){
   const k=kindFor(s.time),def=KIND[k];
   s.targets.push({id:s.nextId++,lane:lane(),kind:k,color:def.color,progress:0,hit:false,
    speed:(k==='moving'?cfg.laneSpeed||.42:cfg.targetSpeed||.30),shift:(k==='moving'?1.3:0),shiftClock:(k==='moving'?1.3:0)});
  }
  function update(dt){
   if(s.over)return s;dt=Math.max(0,Math.min(.1,dt));s.time+=dt;
   if(s.reloading>0){s.reloading=Math.max(0,s.reloading-dt);if(s.reloading===0){s.ammo=ammoMax;s.events.push({type:'reloaded',ammo:ammoMax});}}
   s.spawnClock-=(cfg.spawnRate||1.05)*(1+s.time/s.duration*.6)*dt;
   while(s.spawnClock<=0&&!s.over){spawn();s.spawnClock+=(cfg.spawnRate||1.05)/Math.max(.6,1+s.time/s.duration);}
   for(const t of s.targets){
    if(t.kind==='moving'){t.shiftClock-=dt;if(t.shiftClock<=0){t.shiftClock=t.shift;t.lane=(t.lane+(rng()<.5?-1:1)+(cfg.lanes||3))%(cfg.lanes||3);}}
    t.progress+=t.speed*dt;
   }
   s.targets=s.targets.filter(t=>{if(t.hit)return false;if(t.progress>=1){s.events.push({type:'expired',kind:t.kind,lane:t.lane});return false;}return true;});
   if(s.time>=s.duration){s.over=true;s.events.push({type:'done'});}
   return s;
  }
  function aim(l){s.aim=(Number(l)||0)%(cfg.lanes||3);}
  function fire(){
   if(s.over)return {ok:false,reason:'over'};
   if(s.reloading>0)return {ok:false,reason:'reloading'};
   if(s.ammo<=0&&ammoMax!==Infinity){s.reloading=cfg.reloadSeconds;return {ok:false,reason:'empty'};}
   if(ammoMax!==Infinity)s.ammo--;s.shots++;
   let best=null;for(const t of s.targets){if(t.lane!==s.aim||t.hit)continue;if(!best||t.progress>best.progress)best=t;}
   let result={ok:true,hit:false,lane:s.aim};
   if(best){best.hit=true;const def=KIND[best.kind];s.hits++;
    if(def.hostage){s.score=Math.max(0,s.score-T.hostagePenalty);result={ok:true,hit:true,kind:'hostage',penalty:T.hostagePenalty,lane:s.aim};}
    else{s.score+=Math.round(def.score*(best.kind==='hilt'?1:1));result={ok:true,hit:true,kind:best.kind,points:def.score,lane:s.aim};}
    s.events.push({type:'shot',...result});
   }else{s.events.push({type:'shot',kind:'miss',lane:s.aim});}
   if(ammoMax!==Infinity&&s.ammo<=0)s.reloading=cfg.reloadSeconds;
   return result;
  }
  const status=()=>({gunId,time:+s.time.toFixed(3),remaining:Math.max(0,+(s.duration-s.time).toFixed(3)),ammo:s.ammo,
   reloading:+s.reloading.toFixed(3),reloadingNow:s.reloading>0,score:s.score,shots:s.shots,hits:s.hits,
   accuracy:s.shots?+(s.hits/s.shots).toFixed(3):0,targets:s.targets.map(t=>({id:t.id,lane:t.lane,kind:t.kind,progress:+t.progress.toFixed(3)})),over:s.over});
  return {update,aim,fire,status,state:()=>s,kind:KIND,thresholds:()=>({...T.thresholds})};
 }
 const medalFor=score=>score>=T.thresholds.gold?'gold':score>=T.thresholds.silver?'silver':score>=T.thresholds.bronze?'bronze':null;
 // Deterministic score trace (headless tests): [lane, dt] pairs.
 function simulate({gunId,seed=1,steps=[[0,0.5]]}={}){const c=create({gunId,seed});for(const [l,dt] of steps){c.aim(l);c.fire();c.update(dt);}return c.status();}

 // ---- host adapter (disposable; the CORE is the reusable part) ----
 function mount(root,ctx){
  const gunId=ctx.params?.gunId||R.equipped()||(R.ownedGuns()[0]&&R.ownedGuns()[0].id);
  if(!gunId){root.innerHTML='<p class="rd-empty">NO GUN ON THE RACK.</p>';ctx.quit();return {};}
  const core=create({gunId,seed:ctx.params?.seed||(Date.now()%100000)});
  root.innerHTML=`<div class="rd-hud"><b>RANGE DAY · ${R.displayName(gunId).toUpperCase()}</b><span class="rd-time"></span><span class="rd-ammo"></span></div>
   <div class="rd-lanes" style="grid-template-columns:repeat(${core.state().lanes},1fr)"></div>
   <div class="rd-help">TAP A LANE TO AIM · RELEASE TO FIRE · DON'T SHOOT THE HOSTAGES</div>`;
  const lanesEl=root.querySelector('.rd-lanes');
  for(let i=0;i<core.state().lanes;i++){const b=document.createElement('button');b.type='button';b.className='rd-lane';b.dataset.lane=i;b.textContent='⦿';lanesEl.append(b);}
  const timeEl=root.querySelector('.rd-time'),ammoEl=root.querySelector('.rd-ammo');
  const feedback=document.createElement('p');feedback.className='rd-feedback';feedback.setAttribute('role','status');feedback.textContent='RED = HOSTAGE · WHITE / BLUE / GOLD = TARGET';root.append(feedback);
  lanesEl.addEventListener('pointerdown',e=>{const b=e.target.closest('.rd-lane');if(!b)return;core.aim(Number(b.dataset.lane));});
  function shoot(b){const r=core.fire();feedback.textContent=!r.ok?'RELOADING — WAIT':r.kind==='hostage'?`HOSTAGE −${r.penalty}`:r.hit?`HIT +${r.points}`:'MISS';if(r.ok){if(r.hit)window.RAAudio?.oneShot?.('GN_06');const code=R.feedback(gunId)?.audio;if(code)window.RAAudio?.oneShot?.(code);}b.classList.remove('rd-hit','rd-miss');void b.offsetWidth;if(r.ok)b.classList.add(r.hit&&r.kind!=='hostage'?'rd-hit':'rd-miss');}
  lanesEl.addEventListener('pointerup',e=>{const b=e.target.closest('.rd-lane');if(!b)return;core.aim(Number(b.dataset.lane));shoot(b);});
  lanesEl.addEventListener('keydown',e=>{const b=e.target.closest('.rd-lane');if(b&&(e.key==='Enter'||e.key===' ')){e.preventDefault();core.aim(Number(b.dataset.lane));shoot(b);}});
  let raf=0,last=0,done=false;
  function frame(t){if(done)return;if(!last)last=t;core.update((t-last)/1000);last=t;
   const st=core.status();timeEl.textContent=`${st.remaining.toFixed(1)}s`;ammoEl.textContent=st.reloadingNow?'RELOADING':`AMMO ${st.ammo===Infinity?'∞':st.ammo}`;
   for(const el of lanesEl.children){el.querySelectorAll('.rd-target').forEach(n=>n.remove());}
   for(const tg of st.targets){const el=lanesEl.children[tg.lane];if(!el)continue;const dot=document.createElement('i');dot.className=`rd-target rd-${tg.kind}`;dot.style.opacity=String(Math.min(1,.25+tg.progress));dot.style.transform=`translateY(${(1-tg.progress)*70}%)`;el.append(dot);}
   if(st.over){done=true;const medal=medalFor(st.score);root.dataset.phase='results';
    const card=document.createElement('section');card.className='rd-result';card.innerHTML=`<h2>RANGE COMPLETE</h2><p>SCORE ${st.score} · ${medal?medal.toUpperCase():'NO MEDAL'}</p><p>HITS ${st.hits}/${st.shots}</p><p>Reload refills automatically. Red targets are hostages.</p>`;
    const leave=document.createElement('button');leave.type='button';leave.textContent='RETURN TO ARMORY';
    const finish=retry=>{const award=R.awardRange(gunId,st.score);ctx.finish({outcome:medal?'win':'lose',score:st.score,data:{...st,medal,award}});if(retry&&(!window.RARC3||window.RARC3.attemptAllowed('range_day','range')))queueMicrotask(()=>window.RAMinigames.launch('range_day',ctx.params));else window.RAPhone?.openApp?.('armory');};
    leave.addEventListener('click',()=>finish(false));card.append(leave);
    if(!medal){const retry=document.createElement('button');retry.type='button';const attempts=window.RALife?.flag?.('rc4Attempts');retry.disabled=attempts?.day===window.RALife?.today?.().day&&Number(attempts.failures?.['range_day:range']||0)>=1;retry.textContent=retry.disabled?'RETRY TOMORROW':'RETRY · ONCE PER DAY';retry.addEventListener('click',()=>finish(true));card.append(retry);}
    root.append(card);return;}
   raf=requestAnimationFrame(frame);
  }
  raf=requestAnimationFrame(frame);
  return {dispose(){done=true;cancelAnimationFrame(raf);}};
 }

 if(window.RAMinigames)window.RAMinigames.register('range_day',{title:'RANGE DAY',rule:'Tap to aim and let go to fire at the targets, but never hit the hostages.',mount});

 window.RARangeDayCore={create,simulate,medalFor,mount,KIND,thresholds:()=>({...T.thresholds})};
})();
