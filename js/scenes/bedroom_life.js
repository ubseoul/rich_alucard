(function(){
 // Bedroom life layer (VOL 1 §3.1, §8.3): additive controls over the approved bedroom. The frozen room,
 // Rich states and window-masked clouds stay untouched; this adds the day bar, SLEEP, CASTLE, return beats
 // and the WAKE sequence (fade → day card → drowsy wake → Morning Mail).
 const scene=document.querySelector('#bedroomScene');
 let layer=null,scope=null;
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
 // RC3 (OL-078): bed is not a big decision. SLEEP goes straight to the night: no confirm box (the day summary on the black screen is the feedback).
 function confirmBed(){if(!layer||layer.dataset.sleeping)return;layer.dataset.sleeping='1';goToSleep();}
 async function goToSleep(){
  if(window.RAPhone?.isOpen?.())await RAPhone.close();
  window.RABedroom?.setRichState?.('sleeping');
  const over=el('div','wake-overlay','<div class="wake-day"></div>');document.querySelector('#screen').append(over);
  await new Promise(r=>setTimeout(r,30));over.classList.add('on');await new Promise(r=>setTimeout(r,300));
  try{await window.RAMoneyFeel?.daySummary?.(over);}catch(e){console.error(e);} // RC2: what Rich made today, on the black screen
  const mail=RAClock.sleep();
  // A protected ending may claim this sleep (VOL 1 A40). It never announces itself.
  if(window.RAFame?.claimsWake?.()){over.remove();return window.RAFame.play();}
  const i=RALife.today();over.querySelector('.wake-day').innerHTML=`${i.weekday}<br>${i.dateLabel}<br><small style="font-size:.6em;opacity:.7">DAY ${i.day}</small>`;
  await new Promise(r=>setTimeout(r,450));
  window.RABedroom?.setRichState?.('drowsy_wake');build();
  over.classList.remove('on');await new Promise(r=>setTimeout(r,200));over.remove();
  const wakeAdventure=window.RAWakeTriggers?.pick?.();
  showMail(mail,wakeAdventure);
 }
 // RC3 (OL-074): ONE notification at a time, and only the story. The morning is the day card and, when the story has a beat for today, one card
 // for it (the ladder mission waiting, or the invite that is on the phone). Everything else is a silent badge on the phone, never a stack here.
 function storyCard(wakeAdventure){
  if(wakeAdventure&&RAAdventures.available(wakeAdventure))return {kind:'adventure',title:'STORY',body:RAAdventures.get(wakeAdventure)?.title||'',adventure:wakeAdventure};
  const ev=(window.RAWorldEvents?.pending?.('phone')||[]).find(e=>e.state?.status==='pending');
  return ev?{kind:'event',title:ev.sender||'INCOMING',body:ev.subject||'',event:ev.id}:null;
 }
 function showMail(mail,wakeAdventure){
  if(!layer)build();
  const c=storyCard(wakeAdventure);if(!c){window.RABedroom?.releasePhone?.();return;}
  const wrap=el('div','morning-mail');wrap.style.pointerEvents='auto';
  const b=el('button','mail-card mail-story',`<b>${c.title}</b>${c.body}`);b.type='button';
  b.addEventListener('click',()=>{
   for(const m of (RALife.life().clock.mail||[]))if(m.day===RALife.today().day)RAClock.markMailRead(m.id);
   wrap.remove();window.RABedroom?.releasePhone?.();
   if(c.kind==='adventure'){RAAdventureScene.begin(c.adventure,{from:'wake'});return;}
   window.RAPhone?.open?.();setTimeout(()=>window.RAPhone?.api?.go?.(`worldEvent:${c.event}`),0);
  });
  wrap.append(b);layer.append(wrap);
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
  if(RAAdventures.active()){RAAdventureScene.resume();return;}
  if(!showReturnBeat()){const wake=pendingWake();if(wake||storyCard(null))showMail(null,wake);}
 }
 window.RABedroomLife={build,confirmBed,goToSleep,showMail,refresh:()=>{if(layer)build();}};
})();
