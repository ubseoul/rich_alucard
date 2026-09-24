(function(){
 // Bedroom life layer (VOL 1 §3.1, §8.3): additive controls over the approved bedroom. The frozen room,
 // Rich states and window-masked clouds stay untouched; this adds the day bar, SLEEP, CASTLE, return beats
 // and the WAKE sequence (fade → day card → drowsy wake → Morning Mail).
 const scene=document.querySelector('#bedroomScene');
 let layer=null,scope=null;
 const el=(tag,cls,html)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(html!=null)n.innerHTML=html;return n;};
 function dayLabel(){const i=RALife.today();return `DAY ${i.day} · ${i.weekday.slice(0,3)} ${i.dateLabel}${i.rain?' · RAIN':''}`;}
 function clear(){layer?.remove();layer=null;}
 function build(){
  clear();layer=el('div','bedroom-life-layer');Object.assign(layer.style,{position:'absolute',inset:'0',zIndex:'6',pointerEvents:'none'});
  const bar=el('div','bedroom-daybar',dayLabel());layer.append(bar);
  const row=el('div','bedroom-life');
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
  const card=el('div','bedroom-return',`<b>${beat.speaker==='rich'||!beat.speaker?'RICH':(window.RABtfPeople?.get(beat.speaker)?.name||beat.speaker)}${beat.vp&&document.body.classList.contains('dev-enabled')?' <span class="adv-vp">VP</span>':''}</b>${beat.text}`);
  card.style.pointerEvents='auto';layer.append(card);window.RABedroom?.setRichState?.('small_idle');
  card.addEventListener('click',()=>{card.remove();window.RABedroom?.releasePhone?.();if(beat.nightEnder)confirmBed({nightEnder:true});},{once:true});
  return true;
 }
 function confirmBed({nightEnder=false}={}){
  if(!layer||layer.querySelector('.bed-confirm'))return;
  const box=el('div','bed-confirm',`<span>${nightEnder?'THAT WAS A NIGHT.':'GO TO BED?'}</span><div><button type="button" data-bed="yes">SLEEP</button>${nightEnder?'':'<button type="button" data-bed="no">NOT YET</button>'}</div>`);
  box.style.pointerEvents='auto';layer.append(box);
  box.addEventListener('click',e=>{const b=e.target.closest('[data-bed]');if(!b)return;box.remove();if(b.dataset.bed==='yes')goToSleep();});
 }
 async function goToSleep(){
  if(window.RAPhone?.isOpen?.())await RAPhone.close();
  window.RABedroom?.setRichState?.('sleeping');
  const over=el('div','wake-overlay','<div class="wake-day"></div>');document.querySelector('#screen').append(over);
  await new Promise(r=>setTimeout(r,50));over.classList.add('on');await new Promise(r=>setTimeout(r,900));
  const mail=RAClock.sleep();
  // A protected ending may claim this sleep (VOL 1 A40). It never announces itself.
  if(window.RAFame?.claimsWake?.()){over.remove();return window.RAFame.play();}
  const i=RALife.today();over.querySelector('.wake-day').innerHTML=`${i.weekday}<br>${i.dateLabel}<br><small style="font-size:.6em;opacity:.7">DAY ${i.day}</small>`;
  await new Promise(r=>setTimeout(r,1300));
  window.RABedroom?.setRichState?.('drowsy_wake');build();
  over.classList.remove('on');await new Promise(r=>setTimeout(r,650));over.remove();
  const wakeAdventure=window.RAWakeTriggers?.pick?.();
  showMail(mail,wakeAdventure);
 }
 function showMail(mail,wakeAdventure){
  if(!layer)build();const today=RALife.today().day;
  const cards=(mail||RALife.life().clock.mail||[]).filter(m=>m.day===today&&!m.read);
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
 function onBedroom(e){
  if(!RALife.life().clock.started)return; // prologue/first wake owns the room until the life clock starts
  build();
  if(RAAdventures.active()){RAAdventureScene.resume();return;}
  if(!showReturnBeat()){const unread=(RALife.life().clock.mail||[]).filter(m=>m.day===RALife.today().day&&!m.read&&m.kind!=='weekday');if(unread.length)showMail();}
 }
 window.RABedroomLife={build,confirmBed,goToSleep,showMail,refresh:()=>{if(layer)build();}};
})();
