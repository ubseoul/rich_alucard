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
   score:0,shots:0,hits:0,hostages:0,ammo:ammoMax,reloading:0,spawnClock:.6,hiltSpawned:false,over:false,events:[]};
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
   if(best){best.hit=true;const def=KIND[best.kind];
    if(def.hostage){s.hostages++;s.score=Math.max(0,s.score-T.hostagePenalty);result={ok:true,hit:true,kind:'hostage',penalty:T.hostagePenalty,lane:s.aim};}
    else{s.hits++;s.score+=Math.round(def.score*(best.kind==='hilt'?1:1));result={ok:true,hit:true,kind:best.kind,points:def.score,lane:s.aim};}
    s.events.push({type:'shot',...result});
   }else{s.events.push({type:'shot',kind:'miss',lane:s.aim});}
   if(ammoMax!==Infinity&&s.ammo<=0)s.reloading=cfg.reloadSeconds;
   return result;
  }
  const status=()=>({gunId,time:+s.time.toFixed(3),remaining:Math.max(0,+(s.duration-s.time).toFixed(3)),ammo:s.ammo,
   reloading:+s.reloading.toFixed(3),reloadingNow:s.reloading>0,score:s.score,shots:s.shots,hits:s.hits,hostages:s.hostages,
   accuracy:s.shots?+(s.hits/s.shots).toFixed(3):0,targets:s.targets.map(t=>({id:t.id,lane:t.lane,kind:t.kind,progress:+t.progress.toFixed(3)})),over:s.over});
  return {update,aim,fire,status,state:()=>s,kind:KIND,thresholds:()=>({...T.thresholds})};
 }
 const medalFor=score=>score>=T.thresholds.gold?'gold':score>=T.thresholds.silver?'silver':score>=T.thresholds.bronze?'bronze':null;
 // Deterministic score trace (headless tests): [lane, dt] pairs.
 function simulate({gunId,seed=1,steps=[[0,0.5]]}={}){const c=create({gunId,seed});for(const [l,dt] of steps){c.aim(l);c.fire();c.update(dt);}return c.status();}

 // ---- host adapter (disposable; the CORE is the reusable part) ----
 function mount(root,ctx){
  const gunId=ctx.params?.gunId||R.equipped()||(R.ownedGuns()[0]&&R.ownedGuns()[0].id);
  if(!gunId){ctx.quit();return {};}
  const core=create({gunId,seed:ctx.params?.seed||(Date.now()%100000)}),targetEls=new Map();
  root.dataset.phase='run';
  root.innerHTML=`<div class="rd-hud"><b>RANGE DAY</b><small>${R.displayName(gunId).toUpperCase()}</small><span class="rd-time"></span><span class="rd-ammo"></span><strong class="rd-score"></strong><span class="rd-medal"></span></div><div class="rd-lanes" style="grid-template-columns:repeat(${core.state().lanes},1fr)"></div><div class="rd-help">AIM / RELEASE TO FIRE · KEYS 1–3<br>STOP = HOSTAGE · KEEP YOUR FIRE CLEAN</div>`;
  const lanesEl=root.querySelector('.rd-lanes');
  for(let i=0;i<core.state().lanes;i++){const b=document.createElement('button');b.type='button';b.className='rd-lane';b.dataset.lane=i;b.setAttribute('aria-label',`Aim and fire lane ${i+1}`);b.innerHTML=`<span class="rd-lane-number">${i+1}</span><span class="rd-reticle" aria-hidden="true">+</span>`;lanesEl.append(b);}
  const timeEl=root.querySelector('.rd-time'),ammoEl=root.querySelector('.rd-ammo'),scoreEl=root.querySelector('.rd-score'),medalEl=root.querySelector('.rd-medal');
  const feedback=document.createElement('p');feedback.className='rd-feedback';feedback.setAttribute('role','status');feedback.textContent='WHITE / BLUE / GOLD: SCORE · STOP: HOLD FIRE';root.append(feedback);
  let raf=0,last=0,done=false,held=null,feedbackUntil=0;
  function aim(lane){core.aim(lane);for(const b of lanesEl.children)b.classList.toggle('rd-aimed',Number(b.dataset.lane)===lane);}
  function shoot(){if(done)return;const r=core.fire(),b=lanesEl.children[core.state().aim||0];feedbackUntil=performance.now()+1100;feedback.textContent=!r.ok?'MAGAZINE REFILLING — HOLD FIRE':r.kind==='hostage'?`HOSTAGE HIT −${r.penalty} · WAIT FOR A CLEAR LANE`:r.hit?`${r.kind==='hilt'?'BONUS TARGET':'CLEAN HIT'} +${r.points}`:'EMPTY LANE · SHOT MISSED';if(r.ok){if(r.hit&&r.kind!=='hostage')window.RAAudio?.oneShot?.('GN_06');const code=R.feedback(gunId)?.audio;if(code)window.RAAudio?.oneShot?.(code);b.classList.remove('rd-hit','rd-miss');void b.offsetWidth;b.classList.add(r.hit&&r.kind!=='hostage'?'rd-hit':'rd-miss');}}
  function laneAt(e){const r=lanesEl.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)return null;return Math.min(core.state().lanes-1,Math.floor((e.clientX-r.left)/r.width*core.state().lanes));}
  function down(e){if(done||held!==null)return;const l=laneAt(e);if(l===null)return;e.preventDefault();held=e.pointerId;aim(l);try{lanesEl.setPointerCapture(e.pointerId);}catch(_){}}
  function move(e){if(e.pointerId!==held)return;const l=laneAt(e);if(l!==null)aim(l);}
  function up(e){if(e.pointerId!==held)return;const l=laneAt(e);try{lanesEl.releasePointerCapture(held);}catch(_){}held=null;if(e.type==='pointerup'&&l!==null){aim(l);shoot();}}
  function key(e){if(done||e.repeat)return;if(/^[1-3]$/.test(e.key)){e.preventDefault();aim(Number(e.key)-1);shoot();}}
  function click(e){if(e.detail!==0)return;const b=e.target.closest('.rd-lane');if(b){aim(Number(b.dataset.lane));shoot();}}
  lanesEl.addEventListener('pointerdown',down);lanesEl.addEventListener('pointermove',move);lanesEl.addEventListener('pointerup',up);lanesEl.addEventListener('pointercancel',up);lanesEl.addEventListener('click',click);window.addEventListener('keydown',key);aim(0);
  function frame(t){if(done)return;if(!last)last=t;core.update((t-last)/1000);last=t;
   const st=core.status();timeEl.textContent=`TIME ${Math.ceil(st.remaining)}s`;ammoEl.textContent=st.reloadingNow?`REFILL ${st.reloading.toFixed(1)}s`:`AMMO ${st.ammo===Infinity?'∞':st.ammo}`;scoreEl.textContent=`SCORE ${st.score}`;
   const medal=medalFor(st.score),next=medal==='gold'?null:medal==='silver'?T.thresholds.gold:medal==='bronze'?T.thresholds.silver:T.thresholds.bronze;medalEl.textContent=next?`${next-st.score} TO ${medal==='silver'?'GOLD':medal==='bronze'?'SILVER':'BRONZE'}`:'GOLD SECURED';
   if(t>feedbackUntil)feedback.textContent=st.reloadingNow?'AUTOMATIC REFILL · NEXT SHOT READY SOON':'AIM AT THE CLOSEST TARGET · STOP = HOLD FIRE';
   const live=new Set(st.targets.map(t=>t.id));for(const [id,el] of targetEls)if(!live.has(id)){el.remove();targetEls.delete(id);}
   for(const tg of st.targets){let el=targetEls.get(tg.id);if(!el){el=document.createElement('i');el.className=`rd-target rd-${tg.kind}`;el.innerHTML=`<span>${tg.kind==='hostage'?'STOP':tg.kind==='hilt'?'★':tg.kind==='gold'?'200':tg.kind==='moving'?'150':'100'}</span>`;targetEls.set(tg.id,el);}if(el.parentNode!==lanesEl.children[tg.lane])lanesEl.children[tg.lane].append(el);el.style.top=`${10+tg.progress*68}%`;}
   if(st.over){done=true;root.dataset.phase='results';root.dataset.outcome=medal?'win':'lose';
    const card=document.createElement('section');card.className='rd-result';card.setAttribute('role','status');card.innerHTML=`<h2>${medal?'DEACON’S APPROVAL':'RANGE COMPLETE'}</h2><p class="rd-result-score">${st.score} POINTS</p><p>${medal?medal.toUpperCase()+' MEDAL':'NO MEDAL THIS RUN'}</p><p>CLEAN HITS ${st.hits} / SHOTS ${st.shots}<br>HOSTAGES HIT ${st.hostages}<br>ACCURACY ${Math.round(st.accuracy*100)}%</p><p>${medal?'Gun story / medal awards follow the Armory record.':`BRONZE STARTS AT ${T.thresholds.bronze}. Watch the closest target and let hostages pass.`}</p>`;
    let settled=false;const finish=retry=>{if(settled)return;settled=true;const award=R.awardRange(gunId,st.score);ctx.finish({outcome:medal?'win':'lose',score:st.score,data:{...st,medal,award}});if(retry&&(!window.RARC3||window.RARC3.attemptAllowed('range_day','range')))queueMicrotask(()=>window.RAMinigames.launch('range_day',ctx.params));else window.RAPhone?.openApp?.('armory');};
    const leave=document.createElement('button');leave.type='button';leave.textContent='RETURN TO ARMORY';leave.addEventListener('click',()=>finish(false));card.append(leave);
    if(!medal){const retry=document.createElement('button');retry.type='button';const attempts=window.RALife?.flag?.('rc4Attempts');retry.disabled=attempts?.day===window.RALife?.today?.().day&&Number(attempts.failures?.['range_day:range']||0)>=1;retry.textContent=retry.disabled?'RETRY TOMORROW':'RETRY · ONCE PER DAY';retry.addEventListener('click',()=>finish(true));card.append(retry);}root.append(card);return;
   }raf=requestAnimationFrame(frame);
  }raf=requestAnimationFrame(frame);
  return {dispose(){done=true;if(held!==null){try{lanesEl.releasePointerCapture(held);}catch(_){}}held=null;cancelAnimationFrame(raf);window.removeEventListener('keydown',key);lanesEl.removeEventListener('pointerdown',down);lanesEl.removeEventListener('pointermove',move);lanesEl.removeEventListener('pointerup',up);lanesEl.removeEventListener('pointercancel',up);lanesEl.removeEventListener('click',click);}};
 }

 if(window.RAMinigames)window.RAMinigames.register('range_day',{title:'RANGE DAY',rule:'Tap to aim and let go to fire at the targets, but never hit the hostages.',mount});

 window.RARangeDayCore={create,simulate,medalFor,mount,KIND,thresholds:()=>({...T.thresholds})};
})();
