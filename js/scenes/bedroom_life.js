(function(){
 // Bedroom life layer (VOL 1 §3.1, §8.3): additive controls over the approved bedroom. The frozen room,
 // Rich states and window-masked clouds stay untouched; this adds the day bar, SLEEP, CASTLE, return beats
 // and the WAKE sequence (fade → day card → drowsy wake → Morning Mail).
 const scene=document.querySelector('#bedroomScene');
 let layer=null,scope=null,sleeping=false;
 const el=(tag,cls,html)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(html!=null)n.innerHTML=html;return n;};
 function dayLabel(){const i=RALife.today();return `DAY ${i.day} · ${i.weekday.slice(0,3)} ${i.dateLabel}${i.rain?' · RAIN':''}`;}
 function clear(){layer?.remove();layer=null;window.RABedroomCompany?.clear?.();}
 function build(){
  clear();layer=el('div','bedroom-life-layer');Object.assign(layer.style,{position:'absolute',inset:'0',zIndex:'6',pointerEvents:'none'});
  const bar=el('div','bedroom-daybar',dayLabel());bar.dataset.pdUi='location';layer.append(bar);
  const row=el('div','bedroom-life');row.dataset.pdUi='actions';
  const sleep=el('button','bedroom-sleep','☾ SLEEP');sleep.type='button';sleep.addEventListener('click',()=>confirmBed());
  const castle=el('button','bedroom-castle','⌂ CASTLE');castle.type='button';castle.addEventListener('click',()=>window.RACastle?.open?.());
  row.append(castle,sleep);layer.append(row);
  scene.append(layer);
  window.RABedroomCompany?.render?.(layer);
 }
 function showReturnBeat(){
  const beat=RALife.life().clock.returnBeat;if(!beat)return false;
  RAState.patch('life.clock.returnBeat',null);
  if(!beat.text){if(beat.nightEnder)confirmBed({nightEnder:true});return true;}
  const card=el('div','bedroom-return',`<b>${beat.speaker==='rich'||!beat.speaker?'RICH':(window.RABtfPeople?.get(beat.speaker)?.name||beat.speaker)}${beat.vp&&document.body.classList.contains('dev-enabled')?' <span class="adv-vp">VP</span>':''}</b>${beat.text}`);card.dataset.pdUi='dialogue';
  card.style.pointerEvents='auto';layer.append(card);window.RABedroom?.setRichState?.('small_idle');
  card.addEventListener('click',()=>{card.remove();window.RABedroom?.releasePhone?.();if(beat.nightEnder)confirmBed({nightEnder:true});},{once:true});
  return true;
 }
 function confirmBed({nightEnder=false}={}){
  if(window.RARC3&&!window.RARC3.canSleep()){window.RAPhone?.openApp?.('vampgpt');return;}
  if(!layer||layer.querySelector('.bed-confirm'))return;
  const life=RAState.get().life,flags=life.world.flags;
  // A prior wake after day one is evidence an old save already used sleep.
  const explained=flags.sleepExplanationSeen===true||(flags.sleepExplanationSeen===undefined&&life.clock.lastWakeDay>1);
  const explanation=explained?'':`<span>${window.RARC3?window.RARC3.restCopy():(nightEnder?'damn im done for tonight':'sleep before you buy more shit?')}</span>`;
  const box=el('div','bed-confirm',`${explanation}<div><button type="button" data-bed="yes">Sleep</button>${nightEnder?'':'<button type="button" data-bed="no">Not yet</button>'}</div>`);
  // Seen means shown, including when the player chooses Not yet. New Game resets flags.
  if(flags.sleepExplanationSeen!==true)RAState.transaction(s=>{s.life.world.flags.sleepExplanationSeen=true;});
  box.style.pointerEvents='auto';layer.append(box);
  box.addEventListener('click',e=>{const b=e.target.closest('[data-bed]');if(!b)return;box.remove();if(b.dataset.bed==='yes')goToSleep();});
 }
 async function goToSleep(){
  if(sleeping||window.RARC3&&!window.RARC3.canSleep())return false;
  sleeping=true;
  window.RARC3?.prepareSleep?.();
  let over=null;
  try{
  if(window.RAPhone?.isOpen?.())await RAPhone.close();
  if(window.RABalconyNight&&!await RABalconyNight.beforeSleep())return false;
  window.RABedroom?.setRichState?.('sleeping');
  over=el('div','wake-overlay','<div class="wake-day"></div>');document.querySelector('#screen').append(over);
  await new Promise(r=>setTimeout(r,50));over.classList.add('on');await new Promise(r=>setTimeout(r,900));
  try{await window.RAMoneyFeel?.daySummary?.(over);}catch(e){console.error(e);} // RC2: what Rich made today, on the black screen
  const mail=RAClock.sleep();
  // A protected ending may claim this sleep (VOL 1 A40). It never announces itself.
  if(window.RAFame?.claimsWake?.()){over.remove();return window.RAFame.play();}
  const i=RALife.today();over.querySelector('.wake-day').innerHTML=`${i.weekday}<br>${i.dateLabel}<br><small style="font-size:.6em;opacity:.7">DAY ${i.day}</small>`;
  await new Promise(r=>setTimeout(r,1300));
  window.RABedroom?.setRichState?.('drowsy_wake');build();
  over.classList.remove('on');await new Promise(r=>setTimeout(r,650));over.remove();
  const wakeAdventure=window.RAWakeTriggers?.pick?.();
  showMail(mail,wakeAdventure);
  }catch(e){
   if(!window.RABalconyNight||(!e.balconySave&&!String(e.message).includes('balcony')))throw e;
   over?.remove();window.RABedroom?.setRichState?.('small_idle');build();RABalconyNight.showError(e.message);return false;
  }finally{sleeping=false;}
 }
 function showMail(mail,wakeAdventure){
  if(!layer)build();const today=RALife.today().day;
  const cards=(mail||RALife.life().clock.mail||[]).filter(m=>m.day===today&&!m.read);
  if(window.RARC3){window.RARC3.showMorning(layer,el);return;}
  const wrap=el('div','morning-mail');wrap.style.pointerEvents='auto';wrap.append(el('h2',null,'MORNING'));
  const ordered=[...cards.filter(c=>c.kind==='weekday'),...cards.filter(c=>c.kind!=='weekday')];
  for(const c of ordered){const b=el('button',`mail-card mail-${c.kind||'note'}`,`<b>${c.title||''}</b>${c.body||''}`);b.type='button';
   b.addEventListener('click',()=>{RAClock.markMailRead(c.id);if(c.adventure&&RAAdventures.available(c.adventure)){wrap.remove();RAAdventureScene.begin(c.adventure,{from:'wake'});return;}if(c.app){wrap.remove();window.RAPhone?.openApp?.(c.app);return;}b.remove();});wrap.append(b);}
  const done=el('button','mail-done',wakeAdventure?'…':'GET UP');done.type='button';
  done.addEventListener('click',()=>{for(const c of cards)RAClock.markMailRead(c.id);wrap.remove();window.RABedroom?.releasePhone?.();if(wakeAdventure)RAAdventureScene.begin(wakeAdventure,{from:'wake'});});
  wrap.append(done);layer.append(wrap);
 }
 document.addEventListener('ra:scene',e=>{
  if(e.detail?.id!=='bedroom'){clear();return;}
  setTimeout(()=>{if(RAScenes.current()==='bedroom')onBedroom(e);},0);
 });
 // The wake adventure this morning already chose (goToSleep → RAWakeTriggers.pick), if it has not started yet today.
 // A refresh during the Morning Mail re-shows the mail; without this the day's wake adventure was silently dropped.
 function pendingWake(){
  const w=RALife.flag('wakeTrigger'),day=RALife.today().day;if(!w?.id||w.day!==day||!RAAdventures.available(w.id))return null;
  const rec=RAAdventures.record(w.id);return rec&&(rec.startedDay===day||rec.lastDay===day)?null:w.id;
 }
 function onBedroom(e){
  if(!RALife.life().clock.started)return; // prologue/first wake owns the room until the life clock starts
  build();
  if(RAAdventures.active()&&!RAAdventures.active().vars?.rc4Paused){RAAdventureScene.resume();return;}
  if(!showReturnBeat()){const unread=(RALife.life().clock.mail||[]).filter(m=>m.day===RALife.today().day&&!m.read&&m.kind!=='weekday');const wake=pendingWake();if(unread.length||wake)showMail(null,wake);}
 }
 window.RABedroomLife={build,confirmBed,goToSleep,showMail,refresh:()=>{if(layer)build();}};
})();
