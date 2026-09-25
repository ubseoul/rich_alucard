(function(){
 // Combat 2.0 presentation. Existing throne CEO/Importer fights stay in game.js as built; every new enemy uses this.
 const D=()=>window.RACombatData;
 const wait=ms=>new Promise(r=>setTimeout(r,ms));
 let active=null;
 const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 function actorEl(personId,x,floor,scale,flip,src=null){
  const person=personId==='rich'?RABtfPeople.rich:RABtfPeople.get(personId);let el;
  if(src||person?.sprite){el=document.createElement('img');el.src=src||person.sprite;el.alt='';}
  else{el=document.createElement('canvas');el.width=80;el.height=96;const c=el.getContext('2d');c.imageSmoothingEnabled=false;RAPixel.drawActor(c,person?.look||{},40,88,1);}
  el.className='c2-actor';Object.assign(el.style,{left:`${(x-40*scale)/270*100}%`,top:`${(floor-88*scale)/480*100}%`,width:`${80*scale/270*100}%`,height:`${96*scale/480*100}%`,transform:flip?'scaleX(-1)':''});return el;
 }
 function run(enemyId,params={}){
  if(active)active.abort?.();
  const def=D().ENEMIES[enemyId];const state=RACombat2Rules.create(enemyId,params);
  const screen=document.querySelector('#screen');const root=document.createElement('section');root.className='c2-scene';root.setAttribute('aria-label','Battle');
  const env=RAPixel.createCanvas(root,{className:'c2-env'});const envId=typeof params.env==='function'?params.env(RAAdventures.context()):params.env;const envDef=RAEnvironments.get(envId||'throne')||RAEnvironments.get('throne');
  // Base + exact-origin frozen layers (always-on, and conditions scoped to this fight's screen) with the base's framing.
  if(envDef?.image){const img=new Image();img.src=envDef.image;const layers=[...(envDef.layers||[]),...RAEnvironments.surfaceLayers(envDef,{key:`combat:${enemyId}@${envDef.id}`}).under].map(src=>Object.assign(new Image(),{src}));
   const draw=()=>{if(!img.complete||!img.naturalWidth||layers.some(L=>!L.complete))return;const c=env.ctx;RAEnvironments.drawImage(c,img,envDef);for(const L of layers)if(L.naturalWidth)RAEnvironments.drawImage(c,L,envDef);c.fillStyle='rgba(8,7,15,.35)';c.fillRect(0,0,270,480);};
   for(const el of [img,...layers])el.addEventListener('load',draw,{once:true});}
  else if(envDef?.paint){RAPixel.paintEnvironment(env.ctx,envDef.paint);env.ctx.fillStyle='rgba(8,7,15,.3)';env.ctx.fillRect(0,0,270,480);}
  // Presentation Director path (pilot: DEV fixture only via params.director). The Director owns size and position,
  // so the legacy 0.9 × global multiplier and the fixed floor at y=318 are not used on this path.
  // Wave 2: every Combat 2.0 fight is Director-staged (params.director:false or the census legacy hook opt out).
  const directed=params.director!==false&&!window.__pdLegacy&&!!window.RAPresentationDirector;
  const scale=RADisplay.scaled(1)*.9,floor=318;
  const richEl=actorEl('rich',70,floor,scale,false);const art=D().enemyArt(enemyId);const enemyEl=actorEl(def.person||enemyId,200,floor,scale,!!art.base,art.base);
  richEl.classList.add('c2-rich');enemyEl.classList.add('c2-enemy');root.append(richEl,enemyEl);
  // Approved frozen combat states (RAArtRegistry, ART SHIP 006) follow the fight's own events: the enemy telegraphs,
  // strikes when Rich is hurt, reacts when hit and stays defeated on a win; otherwise it returns to its base sprite.
  // Only states that exist are used; a fight staged in a named state (RACombatData.enemyArt) holds that state.
  const combatState=role=>art.roles[role]?.src||null;
  const enemyStates=[art.base,...Object.values(art.roles).map(r=>r.src)].filter((src,i,all)=>src&&all.indexOf(src)===i);
  function setEnemyState(role){if(enemyEl.tagName!=='IMG'||!art.base)return;const src=(role&&combatState(role))||art.base;if(enemyEl.getAttribute('src')===src)return;enemyEl.src=src;if(directed)RAPresentationDirector.relayout();}
  const minionEls=[];if(def.minions){for(let i=0;i<5;i++){const k=actorEl(def.person,150+i*22,floor-30+i*6,scale*.55,false);k.classList.add('c2-minion');root.append(k);minionEls.push(k);}}
  root.insertAdjacentHTML('beforeend',`<div class="c2-hud"><div class="c2-hp c2-hp-rich"><b>RICH ALUCARD</b><span>HP <i><em></em></i> <strong></strong></span></div><div class="c2-hp c2-hp-enemy"><b>${esc(state.enemy.name)}</b><span>HP <i><em></em></i> <strong></strong></span></div></div><div class="c2-telegraph" hidden></div><div class="c2-float" aria-hidden="true"></div><div class="c2-panel"><div class="c2-log" aria-live="polite"></div><div class="c2-menu"></div></div><div class="c2-octo" hidden></div>`);
  screen.append(root);document.body.classList.add('combat2-mode');
  if(directed)stageDirector();
  function stageDirector(){
   // Same adapter contract as adventures: environment floor + depth scale, slot anchors; minions stand on a
   // farther depth band (0.55 of the floor scale — the legacy crowd depth made explicit).
   const stage=RAPresentationDirector.combat2Stage(envDef,def.person||enemyId,{flip:!!art.base,minions:minionEls.length,states:enemyStates});
   const actors={rich:richEl,enemy:enemyEl};minionEls.forEach((el,i)=>actors[`minion${i}`]=el);
   RAPresentationDirector.enter({stage,mode:'combat',beat:'default',host:root,env:env.canvas,actors,roles:stage.director.roles,fx:false,ui:{selectors:['.c2-hud .c2-hp','.c2-panel'],dialogue:['.c2-log'],bubbles:[]}});
  }
  const $=sel=>root.querySelector(sel);let resolveRun;let menu='main';
  function hud(){const r=state.rich,e=state.enemy;$('.c2-hp-rich em').style.width=`${r.hp/r.max*100}%`;$('.c2-hp-rich strong').textContent=`${r.hp}/${r.max}`;$('.c2-hp-enemy em').style.width=`${e.hp/e.max*100}%`;$('.c2-hp-enemy strong').textContent=`${e.hp}/${e.max}`;const t=$('.c2-telegraph');t.hidden=!state.telegraph||state.over;t.textContent=state.telegraph||'';if(def.minions){const n=Math.max(1,Math.ceil(state.enemy.minions*e.hp/e.max));root.querySelectorAll('.c2-minion').forEach((m,i)=>m.style.opacity=i<Math.min(5,Math.ceil(n/8))?'1':'0');}}
  function btn(label,act,cls=''){return `<button type="button" class="c2-btn ${cls}" data-c2="${esc(act)}">${label}</button>`;}
  function renderMenu(){
   const m=$('.c2-menu');if(state.over){m.innerHTML='';return;}
   if(state.awaitingOctopus){showOcto();m.innerHTML='';return;}
   if(menu==='main')m.innerHTML=btn('▶ FIGHT','fight')+btn('ITEM','item')+btn('HOES','hoes')+btn('RUN','run');
   else if(menu==='fight'){m.innerHTML=state.moves.map(id=>{const mv=D().MOVES[id];return btn(`${mv.label}<small>PP ${state.rich.pp[id]}/${mv.pp}${id==='revenge'?` · ${state.rich.revenge}`:''}</small>`,`move:${id}`,state.rich.pp[id]>0?'':'c2-off');}).join('')+state.guns.map(g=>btn(`GUN: ${D().GUNS[g.id].label}<small>AMMO ${g.ammo}</small>`,`gun:${g.id}`,g.ammo>0?'c2-gun':'c2-off')).join('')+btn('BACK','back','c2-back');}
   else if(menu==='item'){const list=Object.entries(state.items).filter(([id,n])=>n>0&&D().ITEMS[id]);m.innerHTML=(list.map(([id,n])=>btn(`${D().ITEMS[id].label}<small>×${n}</small>`,`item:${id}`)).join('')||'<p class="c2-empty">BAG IS EMPTY.</p>')+btn('BACK','back','c2-back');}
   else if(menu==='hoes'){const list=state.companions;m.innerHTML=(list.flatMap(c=>c.moves.map(mv=>btn(`${c.name}: ${mv.label}<small>${2-(state.hoesUsed[c.id]||0)} LEFT</small>`,`hoe:${c.id}:${mv.id}`,(state.hoesUsed[c.id]||0)>=2?'c2-off':''))).join('')||'<p class="c2-empty">NOBODY CLOSE ENOUGH YET.</p>')+btn('BACK','back','c2-back');}
  }
  function showOcto(){const o=$('.c2-octo');o.hidden=false;const opts=def.octopus||{};o.innerHTML=`<img src="assets/octopus_brain_a.png" alt="" class="c2-tentacles"><div class="c2-octo-title">OCTOPUS BRAIN</div>${['charisma','recruit','roast'].filter(k=>opts[k]).map(k=>`<button type="button" class="c2-octo-choice" data-octo="${k}"><b>${k.toUpperCase()}</b><span>${esc(opts[k].label)}</span></button>`).join('')}`;}
  async function play(events){
   busy=true;$('.c2-menu').innerHTML='';
   for(const ev of events){
    $('.c2-log').textContent=ev.text;
    setEnemyState(ev.kind==='telegraph'?'telegraph':ev.kind==='hurt'?'strike':ev.kind==='hit'&&ev.target!=='rich'?'hit':ev.kind==='win'?'defeated':state.over&&state.outcome==='win'?'defeated':null);
    if(ev.kind==='hit'){enemyEl.classList.remove('c2-flash');void enemyEl.offsetWidth;enemyEl.classList.add('c2-flash');floatNum(ev.amount,'enemy');if(ev.fx==='revenge')flashScreen('c2-revenge');if(ev.heavy)shake();}
    if(ev.kind==='hurt'){richEl.classList.remove('c2-flash');void richEl.offsetWidth;richEl.classList.add('c2-flash');floatNum(ev.amount,'rich');if(ev.heavy)shake();}
    if(ev.kind==='heal')floatNum(ev.amount?`+${ev.amount}`:'+','heal',ev.target);
    if(ev.kind==='weird')flashScreen('c2-weird');if(ev.fx==='gun')flashScreen('c2-gunfx');
    hud();await wait(ev.kind==='telegraph'?900:720);
   }
   busy=false;
  }
  function floatNum(n,kind,target){if(n==null)return;const f=document.createElement('b');f.className=`c2-num c2-num-${kind}`;f.textContent=typeof n==='number'?`-${n}`:n;const onRich=kind==='rich'||target==='rich';const at=directed?RAPresentationDirector.fxPoint(onRich?'rich':'enemy',-12,-84,[24,16]):null;f.style.left=at?`${at.x}px`:onRich?'18%':'66%';f.style.top=at?`${at.y}px`:'44%';$('.c2-float').append(f);setTimeout(()=>f.remove(),900);}
  function flashScreen(cls){root.classList.remove(cls);void root.offsetWidth;root.classList.add(cls);setTimeout(()=>root.classList.remove(cls),500);}
  function shake(){root.classList.remove('c2-shake');void root.offsetWidth;root.classList.add('c2-shake');}
  let busy=false;
  async function doAction(action){
   if(busy||state.over)return;RACombat2Rules.act(state,action);const events=[...state.log];menu='main';
   if(action.type==='move'&&action.id==='blood')await bloodFx();
   await play(events);
   if(state.over)return finish();
   renderMenu();
  }
  async function bloodFx(){const layer=$('.c2-float');for(let i=0;i<5;i++){const o=document.createElement('i');o.className='c2-orb';const from=directed?RAPresentationDirector.fxPoint('rich',14,-30+i*6):null,to=directed?RAPresentationDirector.fxPoint('enemy',-20,-30+i*6):null;if(from){o.style.left=`${from.x}px`;o.style.top=`${from.y}px`;o.style.setProperty('--pd-orb-to',`${to.x}px`);}else o.style.top=`${40+i*2.2}%`;o.style.animationDelay=`${i*60}ms`;layer.append(o);setTimeout(()=>o.remove(),800);}await wait(420);}
  root.addEventListener('click',e=>{
   const o=e.target.closest('[data-octo]');if(o){$('.c2-octo').hidden=true;doAction({type:'octopus',option:o.dataset.octo});return;}
   const b=e.target.closest('[data-c2]');if(!b||busy)return;const [kind,a,c]=b.dataset.c2.split(':');
   if(kind==='fight'||kind==='item'||kind==='hoes'){menu=kind;renderMenu();return;}if(kind==='back'){menu='main';renderMenu();return;}
   if(kind==='run'){doAction({type:'run'});return;}
   if(kind==='move'){doAction({type:'move',id:a});return;}if(kind==='gun'){doAction({type:'gun',id:a});return;}
   if(kind==='item'){doAction({type:'item',id:a});return;}if(kind==='hoe'){doAction({type:'hoe',companion:a,move:c});return;}
  });
  async function finish(){
   const outcome=state.outcome;
   // Persist what the fight used/earned (items spent, moves learned, drops, people who saw it).
   const life=RAState.get().life;const items={...life.ownership.items};for(const [id,n] of Object.entries(state.items))if(D().ITEMS[id]){if(n>0)items[id]=n;else delete items[id];}RAState.patch('life.ownership.items',items);
   if(state.learned){const learned=[...new Set([...(life.combat.learnedMoves||[]),state.learned])];RAState.patch('life.combat.learnedMoves',learned);const eq=[...life.combat.equippedMoves];if(!eq.includes(state.learned)){if(eq.length<4)eq.push(state.learned);RAState.patch('life.combat.equippedMoves',eq);}}
   if(outcome==='win'||outcome==='spared'){const drop=def.drop||{};if(drop.money&&outcome==='win')RALife.addMoney(drop.money);if(drop.followers)RALife.addFollowers(drop.followers);if(state.filming)RALife.addFollowers(state.filming);if(state.subscribe)RALife.addMoney(state.subscribe);for(const c of Object.keys(state.hoesUsed))if(RABtfPeople.get(c)?.dateable)RARelations.add(c,5,{reason:'fought together'});}
   for(const id of state.companionHurt)RALife.text(id,RABtfPeople.get(id)?.name||id,'my shoulder still hurts from last night. worth it tho.',{id:`hurt:${id}:${RALife.today().day}`});
   if(outcome==='lose'&&!params.noPenalty)window.RADefeat?.apply?.({enemy:state.enemy.name,witnesses:params.witnesses||Object.keys(state.hoesUsed)});
   RAState.recordEvent({id:`fight:${enemyId}:${RALife.today().day}:${Date.now()}`,type:'fight',enemy:enemyId,outcome,day:RALife.today().day});
   $('.c2-log').textContent=outcome==='win'?`${state.enemy.name} IS DOWN.`:outcome==='spared'?'THE FIGHT IS OVER.':outcome==='run'?'RICH LEFT.':'RICH IS DOWN.';
   $('.c2-menu').innerHTML=btn('CONTINUE','done');
   await new Promise(r=>{root.addEventListener('click',e=>{if(e.target.closest('[data-c2="done"]'))r();});});
   close({outcome,octopus:state.octopusUsed,recruited:!!state.recruited,learned:state.learned||null,turns:state.turn});
  }
  function close(result){if(directed)RAPresentationDirector.exit();root.remove();document.body.classList.remove('combat2-mode');active=null;resolveRun(result);}
  hud();$('.c2-log').textContent=params.intro||`${state.enemy.name} WANTS TO FIGHT.`;renderMenu();
  if(state.telegraph){$('.c2-telegraph').hidden=false;}
  return new Promise(resolve=>{resolveRun=resolve;active={abort:()=>close({outcome:'run'}),state,debugResolve:o=>{RACombat2Rules.forceEnd(state,o);finish();}};});
 }
 // DEFEAT (VOL 1 §4.3, A17, VOL 3 §4.4): BLOOD BANK BILL + one social consequence. Failure writes story, not reload.
 const RADefeat={apply({enemy,witnesses=[]}={}){
  const cash=RALife.money();const bill=Math.min(10000,2000+Math.round(cash*.1));RALife.addMoney(-Math.min(bill,cash));
  RAState.patch('life.combat.defeats',(RAState.get().life.combat.defeats||0)+1);RALife.setFlag('lastDefeatDay',RALife.today().day);
  const first=!RALife.done('A17');
  RALife.remember({text:`got beat by ${String(enemy).toLowerCase()}`,lane:'combat',type:'defeat'});RALife.light('chaos',1,`defeat:${RALife.today().day}`);
  const w=witnesses.find(id=>RABtfPeople.get(id)?.dateable);
  if(w){RARelations.add(w,-3,{reason:'saw a loss'});}
  const lost=5+Math.floor(RALife.hash(RALife.today().day)%20);RALife.addFollowers(-lost);
  RALife.setFlag('pendingBloodBank',{day:RALife.today().day,bill,enemy,first,unfollow:lost});if(first)RALife.setFlag('a17Pending',{bill,enemy});
 }};
 window.RADefeat=RADefeat;
 RAClock.onWake('blood-bank-bill',25,({info})=>{const p=RALife.flag('pendingBloodBank');if(!p)return;RALife.setFlag('pendingBloodBank',null);
  if(p.first)return; // A17 plays the first time instead
  RALife.mail({id:`bill:${info.day}`,kind:'money',title:'BLOOD BANK BILL',body:`LIFEBLOOD BLOOD BANK: ${RALife.fmt(p.bill)}. itemized. "GLOW STICK REMOVAL — $40."`});
  const names=['chelsea','marcus','a guy named brent','your old roommate','kiki\'s coworker'];RALife.mail({id:`unfollow:${info.day}`,kind:'world',title:'VAMPGRAM',body:`${names[info.day%names.length]} saw you get your ass beat and unfollowed. (-${p.unfollow})`,app:'vampgram'});
 });
 window.RACombat2={run,debugResolve:o=>active?.debugResolve?.(o),active:()=>active};
})();
