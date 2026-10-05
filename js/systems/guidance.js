(function(){
 'use strict';
 // GUIDANCE — RC3 · BUILD A (OL-074). One answer to "what do I do next?" for the whole phone: VampGPT's top line, the home screen's
 // NEXT UP card and the pulsing app tile all read the same item, so they can never disagree.
 //
 // THE SPINE (docs/rc3/STORY_SPINE.md). Four chapters, in order:
 //   1 PROLOGUE        the goldfish years + the throne fight (they play before Day 1), then Day 1: MISTER DECEMBER'S OFFER (the first PLAY)
 //   2 OGUN'S RAVE     the invite lands on Day 2, the rave is that night
 //   3 NEW OGA         JUG THE PLUG -> THE INTERVIEW -> CANOPY DUTY -> SET UP CARLOS -> THE OWAMBE COLLECTION -> SENATOR -> DINNER AT GBENGA'S
 //   4 FINALE          THE TURF WAR -> THE TRIBUTE -> VICE PRESIDENT -> THE CALL -> NEW OGA
 // Every day: ONE story beat -> a fight or PLAY -> cash -> a strip club night -> sleep. A story beat is the next unfinished step; the
 // ladder beats arrive one per morning (each mission waits for the day after the last one), so a "wait" step reads TOMORROW.
 // Built only from existing apps, places and adventures. No story text: labels are plain UI words (docs/rc2/LINES_FOR_BUILD3.md).
 const Lx=()=>window.RALife,flag=k=>window.RALife.flag(k);
 const safe=(fn,dflt)=>{try{const v=fn();return v===undefined?dflt:v;}catch(e){return dflt;}};
 const fmt=n=>window.RALife.fmt(n);
 const frag=(path,d)=>safe(()=>window.RAFrag.read('F04',path,d),d);
 const offer=()=>frag('offer',{})||{};
 const warActive=()=>frag('active',false)===true&&!!window.RAFeatures?.enabled('F04.war_room');
 const slotsLeft=()=>safe(()=>{const J=window.RAWarRoomJobs;return Math.max(0,J.slotsTonight()-J.slotsUsedTonight());},0);
 // a PLAY the player can actually make tonight: a slot left AND a job on the board that sends crew out and can run
 const playable=()=>safe(()=>{const J=window.RAWarRoomJobs;return slotsLeft()>0&&J.buildNightMenu().some(j=>j.routesToPlay&&J.canRunTonight(j).ok);},false);
 const advOk=id=>safe(()=>window.RAAdventures.available(id),false);
 const NO=()=>safe(()=>window.RAState.get().life.newOga,{})||{};
 const hasCar=L=>(L.life.ownership.cars||[]).some(c=>c.ownershipStatus!=='sold');
 const title=id=>safe(()=>window.RAAdventures.get(id).title,id);
 const G=()=>window.RAEcon?.guidance||{};
 // OL-077: a ~21-day game. RARC3Cut.PACE is the earliest day each beat can land (one beat a day at most, breather days between).
 const paceDay=id=>safe(()=>window.RARC3Cut.PACE[id],0)||0;
 const paced=(id,L)=>L.day>=paceDay(id);
 const RAVE_EVENT='ogun_rave_invite_001';

 // ---- the story spine -------------------------------------------------------------------------------------------------------
 // done(L): behind the player. ready(L): the player can do it right now (else it WAITS: wait(L) is the one-word reason, TOMORROW by default).
 // skip(L): the step does not apply to this player's story (it counts as done). cost: cash it takes.
 const mission=(id,chapter,extra={})=>({id,chapter,adv:id,done:L=>L.done(id),ready:L=>advOk(id)&&paced(id,L),wait:L=>L.day<paceDay(id)?`DAY ${paceDay(id)}`:'TOMORROW',
  item:()=>({label:title(id),sub:chapter,action:`story:${id}`}),...extra});
 const SPINE=[
  {id:'offer',chapter:'PROLOGUE',app:'warRoom',done:()=>warActive()||['accepted','declined_final'].includes(offer().status),ready:L=>offer().status==='available'&&paced('offer',L),
   item:()=>({label:"MISTER DECEMBER'S OFFER",sub:'PROLOGUE · YOUR FIRST JOB',action:'app:warRoom'})},
  {id:'rave',chapter:"OGUN'S RAVE",done:()=>!!flag('ogunsRaveCompleted'),
   ready:L=>paced('rave',L)&&(!!flag('ogunsRaveInvited')||safe(()=>['pending','delivered','seen'].includes(window.RAWorldEvents.record(RAVE_EVENT).status),false)),wait:L=>L.day<paceDay('rave')?`DAY ${paceDay('rave')}`:'TOMORROW',
   item:()=>flag('ogunsRaveInvited')?{label:"OGUN'S RAVE",sub:"OGUN'S RAVE · TONIGHT",action:'ogun_rave'}:{label:'OGUN SAID TONIGHT',sub:"OGUN'S RAVE · INVITE",action:`openWorldEvent:${RAVE_EVENT}`}},
  mission('NEW_OGA_M1','NEW OGA 1 OF 7'),mission('NEW_OGA_M2','NEW OGA 2 OF 7'),mission('NEW_OGA_M3','NEW OGA 3 OF 7'),
  // M4 needs a car and Rich may not own one: Gbenga's loaner lands with CANOPY DUTY (js/systems/rc3_cut.js); until then this step asks for one.
  {id:'car',chapter:'NEW OGA 4 OF 7',app:'bank',cost:()=>0,done:L=>hasCar(L)||NO().mission>=4||NO().status==='closed',
   skip:L=>hasCar(L)||NO().mission<3,ready:L=>NO().mission===3&&!hasCar(L),wait:()=>'AFTER CANOPY DUTY',
   item:()=>({label:'GET A CAR',sub:'NEW OGA 4 OF 7 · NEEDED FOR CARLOS',action:'app:bank'})},
  mission('NEW_OGA_M4','NEW OGA 4 OF 7'),
  // the alternative only exists for a player whose M4 did not end in the walk-in
  mission('NEW_OGA_ALTERNATIVE','NEW OGA 4 OF 7',{skip:()=>!NO().alternativePending&&!NO().alternativeCompleted}),
  mission('NEW_OGA_M5','NEW OGA 5 OF 7'),mission('NEW_OGA_M6','NEW OGA 6 OF 7'),mission('NEW_OGA_M7','NEW OGA 7 OF 7'),
  mission('NEW_OGA_M8','FINALE 1 OF 5',{done:()=>!!NO().m8Resolved}),
  mission('NEW_OGA_M9','FINALE 2 OF 5',{done:()=>!!NO().m9Resolved,wait:L=>hasCar(L)?'TOMORROW':'NEEDS A CAR'}),
  mission('NEW_OGA_M10','FINALE 3 OF 5',{done:()=>!!NO().m10Completed||!!NO().m9GrantsWithheld||!!NO().finaleBegun,skip:()=>!!NO().m9GrantsWithheld}),
  mission('NEW_OGA_VAMPGPT','FINALE 4 OF 5',{done:()=>!!NO().finaleBegun}),
  mission('NEW_OGA_FINALE','FINALE 5 OF 5',{done:()=>!!NO().finaleDone})
 ];
 const CHAPTERS=['PROLOGUE',"OGUN'S RAVE",'NEW OGA','FINALE'];
 const chapterOf=s=>s.chapter.startsWith('NEW OGA')?'NEW OGA':s.chapter.startsWith('FINALE')?'FINALE':s.chapter;
 const stepDone=(s,L)=>safe(()=>!!s.done(L),false)||safe(()=>!!(s.skip&&s.skip(L)),false);

 function asStory(s,L){
  const ready=safe(()=>!!s.ready(L),false),it=safe(()=>s.item(L),{label:s.id,sub:s.chapter,action:'close'});
  return {id:s.id,kind:'story',chapter:chapterOf(s),app:s.app||null,cost:safe(()=>s.cost?s.cost(L):0,0),key:`story:${s.id}`,ready,wait:ready?null:safe(()=>s.wait?s.wait(L):'TOMORROW','TOMORROW'),...it};
 }
 // The step the story is on, whether or not it can be played right now. null once the finale is behind the player.
 function spine(){const L=Lx().L(),s=SPINE.find(x=>!stepDone(x,L));return s?asStory(s,L):null;}
 // Story steps the player can do right now (the spine is linear, so at most one).
 function story(){const s=spine();return s&&s.ready?[s]:[];}
 const storyDoneToday=()=>{const L=Lx().L(),d=L.day;
  if(Number(flag('rc3StoryDay'))===d)return true;
  if(offer().acceptedOnDay===d)return true;
  return SPINE.some(s=>s.adv&&safe(()=>window.RAAdventures.record(s.adv)?.completedDay===d,false));};

 // ---- ways to make cash, then the night, best first -------------------------------------------------------------------------
 // THE PLAY is the daily fight (and the cash). With no War Room the day job is the floor under it: always there, always the lowest pay.
 const CASH=[
  {id:'play',app:'warRoom',ready:()=>warActive()&&playable(),item:()=>({label:'MAKE A PLAY',sub:`WAR ROOM · ${slotsLeft()} LEFT TONIGHT`,action:'playNext'})},
  {id:'shift',app:null,ready:L=>!warActive()&&(advOk('SLURP')||advOk('A08')),item:()=>({label:'WORK A SHIFT',sub:'MAPS · LOW PAY',action:'maps'})}
 ];
 // the strip club is the night: every night once there is cash for a round (RAEcon.guidance.clubMin), once a day
 const SPEND=[
  {id:'club',app:'stripClub',ready:L=>safe(()=>window.RAStripClub.isOpen(),false)&&L.money>=(G().clubMin??3000)&&Number(flag('stripClubLastDay'))!==L.day,
   item:()=>({label:'STRIP CLUB',sub:window.RAStripClub.firstVisitDone()?'THROW SOME CASH':'FIRST VISIT · DISCOUNT',action:'app:stripClub'})}
 ];
 const asItem=(def,kind,L)=>{const it=def.item(L);return {id:def.id,kind,app:def.app||null,cost:def.cost?def.cost():0,key:`${kind}:${def.id}:${L.day}${def.id==='play'?`:${slotsLeft()}`:''}`,...it};};
 function cash(){const L=Lx().L();return CASH.filter(c=>safe(()=>c.ready(L),false)).map(c=>asItem(c,'cash',L));}
 function spend(){const L=Lx().L();return SPEND.filter(c=>safe(()=>c.ready(L),false)).map(c=>asItem(c,'spend',L));}
 const sleepItem=()=>{const sp=spine();return {id:'sleep',kind:'rest',app:null,cost:0,key:`rest:${Lx().today().day}`,label:'GET SOME SLEEP',sub:sp&&!sp.ready?`${sp.label} · ${sp.wait}`:'NEW DAY, NEW MONEY',action:'sleep'};};

 // The next thing to do: the story beat, else the day's PLAY (the fight and the cash), else the club, else bed.
 function next(){
  const money=Lx().money(),st=story(),ca=cash();
  const doable=st.find(s=>!s.cost||money>=s.cost);
  if(doable)return doable;
  const sp=spend();
  if(st.length&&ca.length)return {...ca[0],sub:`${ca[0].sub} · ${fmt(Math.max(0,st[0].cost-money))} TO ${st[0].label}`};
  if(ca.length)return ca[0];
  if(sp.length)return sp[0];
  return sleepItem();
 }
 // VampGPT's list: the story step first, then the day's PLAY, the club and bed. No repeats.
 function recommended(limit=G().recommended||4){
  const sp=spine(),out=[],seen=new Set();
  const add=it=>{if(!it||out.length>=limit||seen.has(it.action+it.id))return;seen.add(it.action+it.id);out.push(it);};
  if(sp&&sp.ready)add(sp);
  for(const it of [...cash(),...spend()])add(it);
  add(sleepItem());
  return out;
 }
 // TODAY: the day as a short checklist. state: done | next | wait | later.
 function today(){
  const sp=spine(),L=Lx().L(),n=next();
  const row=(id,label,doneNow,item,waitNote)=>({id,label,state:doneNow?'done':(item&&n&&n.id===item.id?'next':(waitNote?'wait':'later')),action:item?.action||null,sub:doneNow?'DONE':(waitNote||item?.sub||'')});
  const storyRow=sp?row('story',sp.ready?sp.label:`NEXT: ${sp.label}`,false,sp.ready?sp:null,sp.ready?null:sp.wait):{id:'story',label:'THE STORY IS DONE',state:'done',action:null,sub:'NEW OGA OF LA'};
  if(sp&&!sp.ready&&storyDoneToday()){storyRow.state='done';storyRow.sub=`DONE TODAY · ${sp.wait}`;}
  const play=CASH[0],playReady=safe(()=>play.ready(L),false),playsToday=safe(()=>window.RAWarRoomJobs.slotsUsedTonight(),0);
  const playRow=warActive()?row('play','FIGHT · MAKE A PLAY',!playReady&&playsToday>0,playReady?asItem(play,'cash',L):null,null):row('play','FIGHT · MAKE A PLAY',false,null,'TAKE THE OFFER');
  const clubDone=Number(flag('stripClubLastDay'))===L.day,club=SPEND[0],clubReady=safe(()=>club.ready(L),false);
  const clubRow=row('club','STRIP CLUB NIGHT',clubDone,clubReady?asItem(club,'spend',L):null,clubDone||clubReady?null:`NEED ${fmt(G().clubMin??3000)}`);
  return [storyRow,playRow,clubRow,{id:'sleep',label:'SLEEP',state:'later',action:'sleep',sub:''}];
 }
 // ---- the pulse ---------------------------------------------------------------------------------------------------------------
 const ackKey=k=>`guideAck:${k}`;
 const acked=k=>!!flag(ackKey(k));
 // the first thing on a new phone is VampGPT itself; after that the app the next step lives in
 function target(){
  if(!flag('guideVampgptOpened'))return {app:'vampgpt',key:'story:vampgpt',item:{id:'vampgpt',label:'OGA WHAT DO I DO',sub:'VAMPGPT',action:'app:vampgpt'}};
  const n=next();if(!n.app||acked(n.key))return null;return {app:n.app,key:n.key,item:n};
 }
 function opened(appId){const t=target();if(t&&t.app===appId&&t.key!=='story:vampgpt')window.RALife.setFlag(ackKey(t.key),true);if(appId==='vampgpt')window.RALife.setFlag('guideVampgptOpened',true);}
 const pulsing=appId=>{const t=target();return !!t&&t.app===appId;};
 window.RAGuidance=Object.freeze({story,spine,cash,spend,next,recommended,today,target,pulsing,opened,chapters:()=>CHAPTERS.slice(),steps:()=>SPINE.map(s=>s.id),storyDoneToday});
})();
