(function(){
 'use strict';
 // OL-074: production routing policy. Content and frozen art remain in the repository.
 const APPS=['vampgpt','texts','warRoom','stripClub','armory','bank','maps','radio','vampgram'];
 // Ten retained outings, prerequisite introductions before their authored follow-ups.
 const MAPS=['A43','YAM','FUFU','AUNTIES','PLATES','A19','JOLLOF_WARS','A54','A56','A20'];
 const HALL=['A26','HOST'];
 const CASH_FLOOR=28000;
 const UTILITY=['ARMORY','ARMORY_WALL','A08','SLURP'];
 // Next-review: voluntary music restores Rich's career without changing the story ladder.
 const MUSIC=['COOK','A14','SHOW','A15','A16'];
 const SOCIAL=['IMANI_BOBA'];
 const MISSIONS=['NEW_OGA_M1','NEW_OGA_M2','NEW_OGA_M3','NEW_OGA_M4','NEW_OGA_ALTERNATIVE','NEW_OGA_M5','NEW_OGA_M6','NEW_OGA_M7','NEW_OGA_M8','NEW_OGA_M9','NEW_OGA_M10','NEW_OGA_VAMPGPT','NEW_OGA_FINALE'];
 const L=()=>RALife.life(),day=()=>RALife.today().day,flag=RALife.flag;
 const read=()=>flag('rc3Day')?.day===day()?flag('rc3Day'):{day:day(),story:!!flag('ogunsRaveCompleted')&&L().newOga.lastMissionDay===day(),action:false,paid:false,moneyBefore:RALife.money(),earnedIncome:0};
 const patch=v=>{const s={...read(),...v};RALife.setFlag('rc3Day',s);return s;};
 const dancer=id=>!!window.RAF15?.parse?.(id);
 function allowed(id){if(window.RAStoryPolicy?.allowed)return RAStoryPolicy.allowed(id);return id==='A00'||id==='RC3_FIGHT'||MISSIONS.includes(id)||MAPS.includes(id)||HALL.includes(id)||UTILITY.includes(id)||MUSIC.includes(id)||SOCIAL.includes(id)||dancer(id);}
 function canStart(id,from){if(window.RAStoryPolicy?.canStart)return RAStoryPolicy.canStart(id,from);if(!allowed(id))return false;if(RAAdventures.active()?.id===id)return true;
  if(MUSIC.includes(id)||SOCIAL.includes(id))return ['phone','chain','castle:music','rc5-music',...(SOCIAL.includes(id)?['rc3-maps']:[])].includes(from)&&RAAdventures.available(id);
  if(MAPS.includes(id))return (from==='rc3-maps'||(from==='chain'&&id==='A56'&&RAAdventures.isDone('A54')))&&RAAdventures.available(id);
  if(HALL.includes(id))return from==='rc4-hall'&&RALife.hasRoom('party_hall')&&RAAdventures.available(id);
  if(MISSIONS.includes(id))return RAAdventures.available(id);
  if(id==='DATE')return false;return true;}
 function pendingMission(){if(window.RAStoryPolicy?.pendingMission)return RAStoryPolicy.pendingMission();const s=L().newOga;
  if(!s.m1Rewarded)return 'NEW_OGA_M1';
  if(s.mission<2)return 'NEW_OGA_M2';
  if(s.mission<3)return 'NEW_OGA_M3';
  if(!s.m4Outcome)return 'NEW_OGA_M4';
  if(s.alternativePending)return 'NEW_OGA_ALTERNATIVE';
  if(!s.m5Completed)return 'NEW_OGA_M5';
  if(!s.m6Completed)return 'NEW_OGA_M6';
  if(!s.m7Completed)return 'NEW_OGA_M7';
  if(!s.m8Resolved)return 'NEW_OGA_M8';
  if(!s.m9Resolved)return 'NEW_OGA_M9';
  if(!s.m10Completed&&!s.m9GrantsWithheld)return 'NEW_OGA_M10';
  if(!s.finaleBegun)return 'NEW_OGA_VAMPGPT';
  if(!s.finaleDone)return 'NEW_OGA_FINALE';
  return null;
 }
 function chapter(){if(window.RAStoryPolicy?.chapter)return RAStoryPolicy.chapter();return !flag('throneDone')?'Prologue':!flag('ogunsRaveCompleted')?"Ogun's Rave":L().newOga.finaleBegun?'Finale':'New Oga ladder';}
 function next(){if(window.RAStoryPolicy?.next)return RAStoryPolicy.next();const s=read(),m=pendingMission(),active=RAAdventures.active();let label,kind='story',app='vampgpt';
  if(active?.vars?.rc4Paused)return {id:'recovery',key:`rc4:${day()}:resume`,kind:'recovery',app:'vampgpt',label:attemptAllowed(active.id,active.node)?'RESUME STORY':'SLEEP — RETRY TOMORROW',sub:'Your checkpoint is saved.',action:'rc3:next'};
  if(campaignComplete())return {id:'rest',key:`rc4:${day()}:rest`,kind:'rest',app:null,label:L().momentum.fameFired?'SLEEP':'END THE DAY',sub:L().momentum.fameFired?'Explore or rest; tomorrow advances time.':restCopy(),action:'rc3:next'};
  if(!flag('throneDone'))label='FINISH THE PROLOGUE';
  else if(!s.story&&!flag('ogunsRaveCompleted'))label="OGUN'S RAVE";
  else if(!s.story&&m&&missionReady(m))label=RAAdventures.get(m)?.title||m;
  else if(!s.story&&m&&!missionReady(m)){label='SLEEP — STORY RETURNS TOMORROW';kind='rest';app=null;}
  else if(!s.story){label='FINISH TODAY’S STORY';kind='story';}
  else {label='END THE DAY';kind='rest';app=null;}
  const sub=kind==='rest'?(s.story?'Story done. A game progression bonus may settle when you sleep. Stay out if you want.':'No story ready tonight. Explore or rest; tomorrow advances time.'):
   !flag('throneDone')?'Get out of the ocean. Then deal with the throne.':!flag('ogunsRaveCompleted')?'Your invite is ready. Meet the city before taking work.':'One assignment. Its choices and consequences carry forward.';
  return {id:kind,key:`rc3:${day()}:${label}`,kind,app,label,sub,action:'rc3:next'};
 }
 async function advance(){if(window.RAStoryPolicy?.advance)return RAStoryPolicy.advance();const n=next();
  if(n.kind==='recovery'){const a=RAAdventures.active();if(!attemptAllowed(a.id,a.node))return RABedroomLife.goToSleep();RAAdventures.context().set('rc4Paused',false);return RAAdventureScene.resume();}
  if(n.label==='FINISH THE PROLOGUE')return RANewGame.onStart();
  if(n.label==="OGUN'S RAVE"){patch({moneyBefore:RALife.money()});RALife.setFlag('ogunsRaveInvited',true);return RAOgunRave.begin();}
  if(n.kind==='story'){const id=pendingMission();patch({moneyBefore:RALife.money()});await RAPhone?.close?.();return RAAdventureScene.begin(id,{from:'rc3-story'});}
  if(n.kind==='action'){await RAPhone?.close?.();return RAAdventureScene.begin('RC3_FIGHT',{from:'rc3-story'});}
  if(n.kind==='cash'){claimCash();RAPhone?.refresh?.();return true;}
  if(n.kind==='club')return RAStripClub.open(RAPhone?.api);
  if(n.kind==='rest'){await RAPhone?.close?.();return RABedroomLife.confirmBed();}
 }
 // Persist gross income independently of spending. Legacy current-day saves cannot
 // prove prior earnings: conservatively cover today's floor, track normally tomorrow.
 if(flag('rc3Day')?.day===day()&&!Number.isFinite(flag('rc3Day').earnedIncome))patch({earnedIncome:CASH_FLOOR,earningsMigration:'legacy-floor-covered'});
 window.RAStateWatch?.watch('rc4.income',s=>s.life?.resources?.money,(next,prev)=>{
  if(next>prev&&!read().paid)patch({earnedIncome:(Number(read().earnedIncome)||0)+(next-prev)});
 });
 function claimCash(){const s=read();if(!s.story||!s.action||s.paid)return false;
  const receipt=L().history.find(e=>e.id==='rc3:cash:'+day());
  if(receipt){patch({paid:true,cash:Number(receipt.amount)||0,earningsMigration:'receipt-recovered'});return false;}
  const amount=Math.max(0,CASH_FLOOR-(Number(s.earnedIncome)||0)),life=JSON.parse(JSON.stringify(L()));
  life.resources.money+=amount;life.world.flags.rc3Day={...s,paid:true,cash:amount};
  const event={id:'rc3:cash:'+day(),type:'rc3_story_cash',day:day(),amount};
  if(!life.history.some(e=>e.id===event.id))life.history.push(event);
  const settle=()=>RAState.patch('life',life);
  if(window.RAMoneyLedger)RAMoneyLedger.withSource('rc3:story',settle);else settle();return true;
 }
 // Rest advances time, never completes an assignment or pays a skipped day.
 // Return a live activity through its normal quit/checkpoint path before sleeping.
 const canSleep=()=>!!flag('throneDone')&&(!RAAdventures.active()||!!RAAdventures.active()?.vars?.rc4Paused);
 function prepareSleep(){if(window.RAStoryPolicy?.prepareSleep)return RAStoryPolicy.prepareSleep();if(!canSleep())return false;if(read().story){if(!read().action)patch({action:true,activity:'story'});claimCash();}return true;}
 function restCopy(){if(window.RAStoryPolicy?.restCopy)return RAStoryPolicy.restCopy();const s=read();return s.story?`Story done. ${s.paid?"Today's progression bonus is already settled.":RALife.fmt(Math.max(0,CASH_FLOOR-(Number(s.earnedIncome)||0)))+' game progression bonus settles tonight.'} Sleep advances one day.`:
  'Rest advances one day. No progression bonus tonight; unfinished work stays available. Saved checkpoints and purchases stay yours.';}
 function creditActivity(id,result){
  if(!result||result.quit||result.error||result.data?.refused||['lose','fail','cancel','quit','refused'].includes(String(result.outcome).toLowerCase()))return false;
  patch({action:true,activity:id});return true;
 }
 // Current-day old dialogue saves recover without repeating rewards or missions.
 if(read().story&&!read().action)patch({action:true,activity:'story',flowMigration:'story-is-work'});

 // B1 settlement contract: only a returned, validated COMPLETE PLAY earns credit.
 // Receipts are keyed by request, not UI entry; cancel/refusal/reload cannot farm it.
 function settlePlay(result,summary){
  if(result?.status!=='COMPLETE'||!result.requestId||summary?.errors?.length||summary?.day!==day())return false;
  const seen={...(flag('rc4PlayCredit')||{})};if(seen[result.requestId])return false;
  seen[result.requestId]=day();RALife.setFlag('rc4PlayCredit',seen);patch({action:true});return true;
 }
 const attemptKey=(id,node)=>`${id}:${node}`;
 const attempts=()=>flag('rc4Attempts')?.day===day()?flag('rc4Attempts'):{day:day(),failures:{}};
 function attemptAllowed(id,node){return MUSIC.includes(id)||Number(attempts().failures[attemptKey(id,node)]||0)<2;}
 function settleAttempt(id,node,result){
  if(MUSIC.includes(id))return 'settled'; // Voluntary quit/failure returns to its authored no-pay receipt.
  if(result?.quit||result?.error||['quit','cancel','refused'].includes(result?.outcome)||result?.data?.refused)return 'paused';
  if(['lose','fail'].includes(result?.outcome)){const a=attempts(),k=attemptKey(id,node);RALife.setFlag('rc4Attempts',{day:day(),failures:{...a.failures,[k]:Number(a.failures[k]||0)+1}});}
  return 'settled';
 }
 function suspend(){if(RAAdventures.active())RAAdventures.context().set('rc4Paused',true);}
 function sceneActivityExit(){
  const a=RAAdventures.active();if(!a)return;
  // Voluntary music cancellation cannot become a compulsory resume gate.
  // Authored campaign activities retain their actual checkpoint for later retry.
  if(MUSIC.includes(a.id))RAAdventures.abandon();else suspend();
 }
 function missionReady(id){if(window.RAStoryPolicy?.missionReady)return RAStoryPolicy.missionReady(id);const s=L().newOga;if(day()<=Number(s.lastMissionDay||0))return false;
  if(id==='NEW_OGA_VAMPGPT'&&s.m10VampgptReaskDay!=null&&day()<s.m10VampgptReaskDay)return false;return true;
 }
 const storyEvent=id=>id==='ogun_rave_invite_001'&&!flag('ogunsRaveCompleted');
 function showMorning(layer,el){if(window.RAStoryPolicy?.showMorning)return RAStoryPolicy.showMorning(layer,el);const n=next(),wrap=el('div','morning-mail');wrap.style.pointerEvents='auto';
  wrap.append(el('h2',null,`DAY ${day()}`));if(day()===1)wrap.append(el('p','phone-chat',`<b>RICH</b> ${window.RAWriting.voice(1)}`));const b=el('button','mail-card',`<b>${n.label}</b>${chapter()}`);b.type='button';b.addEventListener('click',()=>{wrap.remove();advance();});
  const up=el('button','mail-done','GET UP');up.type='button';up.addEventListener('click',()=>{wrap.remove();window.RABedroom?.releasePhone?.();});wrap.append(b,up);layer.append(wrap);
 }
 // Purpose-led opportunities, never a daily attendance checklist. Only actual
 // available activities are suggested; ownership and authored predicates decide.
 function activityMarkup(api){
  if(!flag('throneDone'))return '';
  releaseMap();const ready=MAPS.filter(id=>RAAdventures.available(id));
  const picks=[];
  if(ready.length){const id=ready[(day()-1)%ready.length],purpose={A43:'FOOD · meet the auntie; bring home a malt',YAM:'HOME · buy a yam and cook it',FUFU:'FAMILY · learn the rule, choose your way',AUNTIES:'SOCIAL · face the council',PLATES:'CREW · share the plates',A19:'CREW · trouble at the food court',JOLLOF_WARS:'COOK · put your jollof to the test',A54:'COOK · the final awaits',A56:'FOOD · follow the win',A20:'TRAIN · check in with Phil'};
   picks.push({label:RAAdventures.get(id).title,sub:purpose[id],action:'rc3:map:'+id});}
  if(day()%3===1&&RAAdventures.available(RAAdventures.isDone('A08')?'SLURP':'A08'))picks.push({label:'RAMEN SHIFT',sub:'EARN · work a shift; keep its actual pay',action:'rc3:activity:ramen'});
  if(day()%3===2)picks.push({label:'JDM / YOUR GARAGE',sub:RALife.ownedCars().length?'OWNED · select your car and drive':'GOAL · save for a car you can keep and drive',action:'app:jdmImports'});
  if(day()%3===0&&window.RAIronAndGrace?.ownedGuns?.().length)picks.push({label:'RANGE DAY',sub:'SKILL · practice with your owned gun',action:'app:armory'});
  if(!picks.length&&RAAdventures.available(RAAdventures.isDone('A08')?'SLURP':'A08'))picks.push({label:'RAMEN SHIFT',sub:'EARN · optional work, no nightly quota',action:'rc3:activity:ramen'});
  return '<section class="rc4-day-options"><p class="phone-speaker">YOUR TIME · OPTIONAL</p>'+picks.slice(0,2).map(x=>api.button('<strong>'+api.esc(x.label)+'</strong><small>'+api.esc(x.sub)+'</small>',x.action,'rc4-opportunity')).join('')+
   (window.RAStripClub?.isOpen?.()?api.button('STRIP CLUB <small>SOCIAL · your budget, your choice</small>','app:stripClub','rc4-opportunity'):'')+
   (canSleep()&&next().kind!=='rest'?api.button('REST INSTEAD <small>Advance one day. No story pay for skipped work.</small>','rc3:rest','rc4-opportunity'):'')+'</section>';
 }
 async function activityGo(id){if(id==='rest'){await RAPhone.close();return RABedroomLife.confirmBed();}
  if(id!=='ramen')return false;const adventure=RAAdventures.isDone('A08')?'SLURP':'A08';
  if(!RAAdventures.available(adventure))return false;await RAPhone.close();return RAAdventureScene.begin(adventure,{from:'rc3-activity'});
 }
 function mapsMarkup(api,nav=true){if(window.RAStoryPolicy?.mapsMarkup)return RAStoryPolicy.mapsMarkup(api,nav);releaseMap();return `<h1>MAPS</h1><p class="phone-small">Food, familiar faces and trouble worth leaving home for. Pick an outing or keep the night to yourself.</p>${[...MAPS,...SOCIAL].filter(id=>RAAdventures.available(id)).map(id=>api.button(api.esc(RAAdventures.get(id).title),`rc3:map:${id}`)).join('')}${tripReady()?api.button('ATLANTA · BUTTER CHICKEN','rc3:map:atlanta'):''}${[...MAPS,...SOCIAL].some(id=>RAAdventures.available(id))||tripReady()?'':'<p>No outing ready tonight.</p>'}${nav?api.button('HOME','home','phone-home'):''}`;}
 // Powder Springs butter chicken (desire trip 001): repeatable, after Ogun's rave, never mid-adventure.
 function tripReady(){return !!flag('ogunsRaveCompleted')&&!RAAdventures.active()&&!!window.RADesireTrips&&window.RAOpportunities?.get?.('atlanta')?.available!==false;}
 async function tripGo(){if(!tripReady())return false;const trip=RADesireTrips.createTrip(window.RADesireTripPresentation?.firstTrip||{});if(!trip)return false;window.RAClock?.logOuting?.({type:'desire',id:'butter_chicken'});const ok=await RAPhone.close();if(ok===false)return false;return RADesireTrips.beginTravel();}
 async function mapGo(id){if(id==='atlanta')return tripGo();if(![...MAPS,...SOCIAL].includes(id)||!RAAdventures.available(id))return false;await RAPhone.close();return RAAdventureScene.begin(id,{from:'rc3-maps'});}
 function phoneRoute(id){return APPS.includes(id)||id==='jdmImports'||id==='cars';}
 function phoneAction(name){if(name.startsWith('app:'))return phoneRoute(name.split(':')[1]);if(name.startsWith('do:'))return phoneRoute(name.split(':')[1]);
  if(name.startsWith('go:')||name.startsWith('tempt:')||['money','people','realEstate','atlanta','tokyo','letsGo','butterChicken'].includes(name))return false;return true;}
 window.RARC3={prepareSleep,restCopy,creditActivity,activityMarkup,activityGo,apps:APPS,maps:MAPS,missions:MISSIONS,utility:UTILITY,allowed,canStart,pendingMission,chapter,next,advance,read,patch,claimCash,canSleep,storyEvent,showMorning,mapsMarkup,mapGo,phoneRoute,phoneAction,settlePlay,attemptAllowed,settleAttempt,suspend,sceneActivityExit,missionReady};
 // Existing saves get the same nine functional entry points without waiting for another wake.
 for(const id of APPS)RALife.unlockApp(id,{silent:true});RALife.setFlag('armoryKnown',true);
 // The existing app registry stays available to its owners, while only these nine tiles render.
 window.RAPhoneRegistry?.sync?.();
 // The phone's closure consults life app unlocks. Unlock essentials at the first story wake.
 RAClock.onWake('rc3-apps',998,()=>{for(const id of APPS)RALife.unlockApp(id,{silent:true});RALife.setFlag('armoryKnown',true);patch({moneyBefore:RALife.money()});});
 const ack=new Set();window.RAGuidance={next,story:()=>[next()],cash:()=>[],spend:()=>[],recommended:()=>[next()],steps:()=>['prologue','rave',...MISSIONS,'sleep'],
  opened:id=>ack.add(`${day()}:${id}:${next().key}`),target:()=>{const n=next();return n.app&&!ack.has(`${day()}:${n.app}:${n.key}`)?{app:n.app,key:n.key,item:n}:null;},pulsing:id=>{const t=window.RAGuidance.target();return t?.app===id;}};
 // Preserve authored predicates. Exactly one newly released outing per >=2 days;
 // no catch-up burst or fabricated completion on old saves. Already released arcs
 // keep their own per-day prerequisites and can continue on subsequent days.
 const mapPredicates=new Map(MAPS.map(id=>[id,RAAdventures.get(id)?.available]));
 mapPredicates.set('A20',L=>L.day>18&&!L.flag('phil3Done')&&L.flag('philLastDay')!==L.day);
 mapPredicates.set('A56',()=>RAAdventures.record('A54')?.outcome==='win');
 // Older saves already visited some of these outings before release metadata
 // existed. Keep those continuations/repeatable rewards known, never completed anew.
 if(!flag('rc4Maps')){
  const known=MAPS.filter(id=>{const r=RAAdventures.record(id);return r&&(r.count>0||r.status==='active');});
  if(known.length)RALife.setFlag('rc4Maps',{unlocked:Object.fromEntries(known.map(id=>[id,Number(RAAdventures.record(id).startedDay)||day()])),lastDay:day(),migration:'legacy-known-outings'});
 }
 const mapState=()=>flag('rc4Maps')||{unlocked:{},lastDay:0};let releasingMap=false;
 function releaseMap(){if(releasingMap)return;releasingMap=true;try{
  const s=mapState();if(day()<2||day()<Number(s.lastDay||0)+2)return;
  const id=MAPS.find(id=>!s.unlocked[id]&&!RAAdventures.isDone(id)&&(!mapPredicates.get(id)||mapPredicates.get(id)(RALife.L())));
  if(id)RALife.setFlag('rc4Maps',{unlocked:{...s.unlocked,[id]:day()},lastDay:day()});
 }finally{releasingMap=false;}}
 for(const id of MAPS){const d=RAAdventures.get(id);if(d)d.available=L=>{releaseMap();return !!mapState().unlocked[id]&&(!mapPredicates.get(id)||mapPredicates.get(id)(L));};}
 releaseMap();RAClock.onWake('rc4-maps',999,releaseMap);
 for(const id of MISSIONS){const d=RAAdventures.get(id);if(d)d.available=()=>flag('ogunsRaveCompleted')&&!read().story&&pendingMission()===id&&missionReady(id);}
 const prologue=RAAdventures.get('A00');if(prologue){
  // The revised opening owns its visible attempts, advice, acquisition and merge.
  // Old compression overrides must not skip these authored transitions.
  // Preserve authored lines, remove empty tap beats; introduce the giver before
  // the brain choice so the compressed opening still has cause and effect.
  for(const node of Object.values(prologue.nodes))if(Array.isArray(node.lines))node.lines=node.lines.filter(Boolean);
 }
 // Preserve the main ladder: remove early arc-ending choices.
 const m1=RAAdventures.get('NEW_OGA_M1'),m2=RAAdventures.get('NEW_OGA_M2');
 if(m1){m1.nodes.pitch.choices=m1.nodes.pitch.choices.filter(c=>c.next!=='nah');m1.nodes.table.choices=m1.nodes.table.choices.filter(c=>c.next!=='leave');
  const pitch=m1.nodes.pitch.lines;
  // The ramen prerequisite was retired. Do not pretend the player worked there;
  // keep every protected Rich line and the actual offer, adjust only connective UI voice.
  m1.nodes.pitch.lines=()=>{
   const lines=typeof pitch==='function'?pitch(RAAdventures.context()):pitch;
   if(RAAdventures.isDone('A08'))return lines;
   return lines.map(line=>{
    if(!Array.isArray(line)||!['vampgpt',null].includes(line[0]))return line;
    const replacement=line[1]==="oga. you're cooking noodles for tips."?'oga. you came here for music.':
     line[1]==="it's just an idea. you're tired of the ramen. the ramen is tired of you."?'cash first. what you do with it is your business.':null;
    return replacement?[line[0]||'vampgpt',replacement,...line.slice(2)]:line;
   });
  };
 }
 if(m2)m2.nodes.debt.choices=m2.nodes.debt.choices.filter(c=>c.next==='work');
 // A vehicle is no longer a shopping prerequisite. Gbenga supplies transport for this assignment.
 const m4=RAAdventures.get('NEW_OGA_M4');if(m4){m4.nodes.beat3.lines=[RAContent.N("uncles rental van headed to koreatown free ride finally")];m4.nodes.run.lines=[RAContent.N("carlos running rich in uncles van making it look close")];
  // Use the existing neutral Touge handling profile for the authored rental van.
  // It is encounter data, never an owned Supra or acquisition reward.
  m4.nodes.run.minigame.params=()=>({course:'warehouse_alleys',car:'supra',durationSeconds:RANewOgaTunables.m4.ESCAPE_DURATION_SECONDS,escapeRunner:'Carlos'});
 }
 const m9=RAAdventures.get('NEW_OGA_M9');if(m9){for(const c of m9.nodes.choice.choices)if(c.next==='give')c.when=()=>!!RANewOgaLadder.favoriteCar();}
 // Legacy in-progress crew fights remain resumable. New days never require one.
 RAAdventures.define({id:'RC3_FIGHT',title:'PROTECT THE CREW',lane:'combat',repeatable:true,available:()=>RAAdventures.active()?.id==='RC3_FIGHT',start:'brief',nodes:{
  brief:{env:'street_night',actors:{left:'rich',right:'smallie_cousin'},lines:[RAContent.N("crew blocked clear the street then collect")],next:'fight'},
  fight:{fight:{enemy:'smallie_cousin',params:{env:'street_night'},win:'done',lose:'retry',run:'retry'}},
  retry:{lines:[RAContent.N("street still blocked bro run it back")],choices:[{label:'TRY AGAIN',next:'fight'}]},
  done:{end:{outcome:'win',memory:{text:'cleared the street for the crew',lane:'combat'}}}
 }});
 // Count real successful fights/PLAYs, including those inside the authored mission.
 const afterFight=RAAdventures.afterFight,afterPlay=RAAdventures.afterMinigame;
 RAAdventures.afterFight=function(node,result){if(MISSIONS.includes(RAAdventures.active()?.id)||RAAdventures.active()?.id==='RC3_FIGHT')if(['win','spared'].includes(result?.outcome))patch({action:true});return afterFight(node,result);};
 RAAdventures.afterMinigame=function(node,result){if(MISSIONS.includes(RAAdventures.active()?.id)&&!result?.quit&&!result?.error&&!result?.data?.refused&&!['lose','fail','cancel','quit','refused'].includes(result?.outcome))patch({action:true});return afterPlay(node,result);};
 document.addEventListener('ra:adventure-complete',e=>{
  const id=e.detail?.id;if(MISSIONS.includes(id))patch({story:true,action:true,activity:'story'});
  else if(MAPS.includes(id)||HALL.includes(id)||['A08','SLURP'].includes(id))creditActivity(id,e.detail);
 });
 document.addEventListener('ra:scene',e=>{if(e.detail?.id==='bedroom'){
  if(flag('ogunsRaveCompleted')&&!flag('rc3RaveRecorded')){RALife.setFlag('rc3RaveRecorded',true);patch({story:true,action:true,activity:'story'});}
  if(day()===1&&flag('throneDone'))patch({action:true});
 }});
 // Cut runs in an old save cannot resume through the bedroom, and old automatic follow-ups are retired.
 // Optional policy providers finish installing on DOMContentLoaded. Validate saved
 // checkpoints against the final policy before removing an unavailable activity.
 function validateStartupActivity(){const active=RAAdventures.active();if(active&&!window.RARC3.allowed(active.id)){RAAdventures.abandon();RAState.patch('life.clock.returnBeat',null);}}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',validateStartupActivity,{once:true});else validateStartupActivity();
 RALife.setFlag('wakeTrigger',null);RAState.patch('life.temptations.live',[]);
 RALife.setFlag('onlyvamps_subs',[]);
 // OL-079: the protected ending owns its wake; retiring optional fame routes
 // must not retire the ending. Read eligibility late because the private pack
 // installs its authored momentum rules after this production policy.
 function claimsEnding(){
  const m=L().momentum;if(m.fameFired)return false;
  if(!campaignComplete()||day()<=Number(L().newOga.lastMissionDay||0)||RAAdventures.active())return false;
  // Delegated pacing decision: the next normal wake after real completion owns
  // the ending. Optional postgame days never delay it or manufacture mission work.
  if(!m.fameEligible)RAState.patch('life.momentum.fameEligible',true);
  return true;
 }
 function campaignComplete(){const s=L().newOga;return !!flag('throneDone')&&!!flag('ogunsRaveCompleted')&&!!s.m1Rewarded&&s.mission>=3&&!!s.m4Outcome&&!s.alternativePending&&!!s.m5Completed&&!!s.m6Completed&&!!s.m7Completed&&!!s.m8Resolved&&!!s.m9Resolved&&(!!s.m10Completed||!!s.m9GrantsWithheld)&&!!s.finaleBegun&&!!s.finaleDone;}
 RARC3.campaignComplete=campaignComplete;RARC3.claimsEnding=claimsEnding;
 if(window.RAFame)RAFame.claimsWake=claimsEnding;
 // Old saves already beyond the intended wake recover in the bedroom, even
 // with an unfinished daily job. Never interrupt or abandon an active scene.
 function recoverEnding(){
  if(!L().clock.started||!flag('throneDone')||
   window.RAScenes?.current?.()!=='bedroom'||RAAdventures.active())return false;
  if(!claimsEnding())return false;
  window.RAFame.play();return true;
 }
 document.addEventListener('ra:scene',e=>{if(e.detail?.id==='bedroom')setTimeout(recoverEnding,60);});
 // Bank owns the existing property surface; Maps owns adventure discovery. No tenth app.
 const hall=()=>window.RACastle?.ROOMS.find(r=>r.id==='party_hall');
 // Ownership comes before the first authored party: no circular hosting prerequisite.
 if(hall())hall().needs=()=>true;
 function bankMarkup(sub,api){const rent=L().ownership.properties.filter(p=>p.ownershipStatus==='owned').reduce((sum,p)=>sum+(Number(window.RAEcon.rent.perDay[p.id])||Math.round((Number(p.weeklyRent)||0)/7)),0),h=hall(),owned=RALife.hasRoom('party_hall');
  return `<h1>BANK</h1><div class="phone-bank-total"><span>ON HAND</span><strong>${RALife.fmt(RALife.money())}</strong></div><div class="phone-card"><b>RENTAL INCOME</b>${RALife.fmt(rent)} / DAY${L().ownership.properties.some(p=>p.id===RAPropertyQuest.propertyId)?'':api.button('BUY RENTAL · $34,000','do:bank:rental','',RALife.money()<39000?'disabled':'')}</div><div class="phone-card"><b>BIG GOAL · PARTY HALL</b>${owned?`OWNED${api.button('CASTLE PARTY NIGHT','do:bank:party','',RALife.money()<500||flag('partyNight')===day()?'disabled':'')}`:`${RALife.fmt(h.price)}${api.button('BUILD PARTY HALL','do:bank:hall','',RALife.money()<h.price+5000?'disabled':'')}`}</div>`;
 }
 async function partyGo(){if(!RALife.hasRoom('party_hall')||flag('partyNight')===day()||RALife.money()<500)return false;await RAPhone?.close?.();return RAAdventureScene.begin(RAAdventures.isDone('A26')?'HOST':'A26',{from:'rc4-hall'});}
 RARC3.partyGo=partyGo;RARC3.releaseMap=releaseMap;
 for(const id of HALL){const d=RAAdventures.get(id),original=d?.available;if(!d)continue;
  d.available=L=>L.hasRoom('party_hall')&&L.flag('partyNight')!==L.day&&L.money>=500&&(!original||original(L));
  // Keep authored choices/copy. A saved bar receipt makes reload/double dispatch
  // idempotent; cash, tier and next checkpoint persist in one state mutation.
  d.nodes.drinks.choices=d.nodes.drinks.choices.map((c,i)=>({...c,fx:A=>{
   if(A.vars.rc4BarPaid)return;const price=[500,5000,25000][i];if(RALife.money()<price)return;
   const life=JSON.parse(JSON.stringify(L()));life.resources.money-=price;
   life.adventures.active={...life.adventures.active,node:'door',vars:{...life.adventures.active.vars,tier:['cheap','mid','extra'][i],rc4BarPaid:price}};
   RAState.patch('life',life);
  }}));
 }
 const bank=window.RAPhoneApps?.get?.('bank');if(bank){bank.render=(sub,api)=>bankMarkup(sub,api)+api.button('JDM IMPORTS / GARAGE','app:jdmImports');bank.onAction=(act,arg,api)=>{if(act==='rental'&&RALife.money()>=39000)RAPropertyQuest.completePurchase('cut');if(act==='hall'&&RALife.money()>=hall().price+5000)RACastle.buy('party_hall');if(act==='party')return partyGo();api.refresh();};}
 if(window.RACastle){const buy=RACastle.buy;RACastle.buy=id=>id==='party_hall'&&buy(id);RACastle.open=()=>RAPhone.openApp('bank');RACastle.markup=()=>'';}
 const maps=window.RAPhoneApps?.get?.('maps');if(maps)maps.render=(sub,api)=>mapsMarkup(api,false);
 // The retired MOVES tile is an essential loadout function, folded into Armory.
 const armory=window.RAPhoneApps?.get?.('armory');if(armory){const render=armory.render,action=armory.onAction;
  armory.render=(sub,api)=>{if(sub?.startsWith('move:')){const slot=Number(sub.slice(5));return `<h1>ARMORY · MOVE ${slot+1}</h1>${(window.RAIronMoves?.known?.()||[]).map(id=>api.button(api.esc(RACombatData.MOVES[id].label),`do:armory:moveEquip:${slot}|${id}`)).join('')}${api.button('BACK','app:armory')}`;}
   return render(sub,api)+(window.RAIronMoves?.atHome?.()?`<h2>MOVES</h2>${L().combat.equippedMoves.map((id,i)=>api.button(api.esc(RACombatData.MOVES[id]?.label||id),`app:armory:move:${i}`)).join('')}`:'');};
  armory.onAction=(act,arg,api)=>{if(act==='moveEquip'){const [slot,id]=arg.split('|');window.RAIronMoves?.equip?.(Number(slot),id);api.refresh();return;}return action?.(act,arg,api);};
 }
 const hunter=window.RABtfPeople?.get?.('bllad33');if(hunter)hunter.name='BLAD33EE';
 RACombatData.ENEMIES.blad33ee={name:'BLAD33EE',hp:90,person:'bllad33',boss:true,noRun:true,moves:{slash:{id:'slash',label:'HUNTER SLASH',dmg:12,telegraph:'BLAD33EE REACHES FOR HIS BLADE'}},pattern:['slash'],octopus:{roast:{label:'YOU CAME TO A RAVE IN WORK CLOTHES',result:'skip',turns:1,text:'BLAD33EE CHECKS HIS COAT.'}}};
 // OL-076: cash persists on every host scene. Other meters keep their gameplay state silently.
 if(document.body?.append){document.body.classList.add('rc3');const hud=document.createElement('div');hud.className='rc3-cash';hud.setAttribute('aria-label','Cash');document.body.append(hud);
  const update=()=>{hud.textContent=RALife.fmt(RALife.money());document.body.classList.toggle('rc4-prelife',!L().clock.started);document.body.classList.toggle('rc4-title',document.querySelector('#startOverlay')?.style.display!=='none');};update();document.addEventListener('ra:state',update);setInterval(update,500);
 }
 // Clear old silent unread badges without deleting messages.
 function silenceThreads(){const threads=L().phone.threads||{};if(Object.values(threads).some(t=>t.some(m=>!m.read)))RAState.patch('life.phone.threads',Object.fromEntries(Object.entries(threads).map(([id,t])=>[id,t.map(m=>({...m,read:true}))])));}
 silenceThreads();const text=RALife.text;RALife.text=function(...args){const result=text(...args);silenceThreads();return result;};
 // One notification, story only. Other messages survive as silent badges in Texts/Bank.
 const mail=RALife.mail;RALife.mail=function(card){return mail({...card,silent:true});};
 const worldPending=RAWorldEvents.pending,deliver=RAWorldEvents.deliver;
 RAWorldEvents.pending=channel=>worldPending(channel).filter(e=>storyEvent(e.id)).slice(0,1);
 RAWorldEvents.deliver=channel=>{const first=RAWorldEvents.pending(channel)[0];if(!first)return [];return deliver(channel).filter(e=>e.id===first.id);};
})();
