(function(){
 'use strict';
 // GUIDANCE — RC2 · BUILD 1 (OL-063). One answer to "what do I do next?" for the whole phone:
 //   VampGPT's RECOMMENDED list (first item = the next STORY step, or a way to MAKE CASH when no step is ready or affordable),
 //   the home screen's "do this next" card, and the pulsing app tile / phone icon all read the same item, so they can never disagree.
 // Built only from existing apps, places and adventures. No story text: labels are plain UI words (docs/rc2/LINES_FOR_BUILD3.md).
 const Lx=()=>window.RALife,flag=k=>window.RALife.flag(k);
 const safe=(fn,dflt)=>{try{const v=fn();return v===undefined?dflt:v;}catch(e){return dflt;}};
 const fmt=n=>window.RALife.fmt(n);
 const frag=(path,d)=>safe(()=>window.RAFrag.read('F04',path,d),d);
 const offer=()=>frag('offer',{})||{};
 const warActive=()=>frag('active',false)===true&&!!window.RAFeatures?.enabled('F04.war_room');
 const playsMade=()=>Object.keys(frag('play.consumed',{})||{}).length;
 const slotsLeft=()=>safe(()=>{const J=window.RAWarRoomJobs;return Math.max(0,J.slotsTonight()-J.slotsUsedTonight());},0);
 const placeOpen=id=>safe(()=>window.RAPlaces.visible().some(p=>p.id===id),false);
 const advOk=id=>safe(()=>window.RAAdventures.available(id),false);
 const partyHall=()=>safe(()=>window.RACastle.ROOMS.find(r=>r.id==='party_hall'),null);

 // ---- the story spine -------------------------------------------------------------------------------------------------------
 // ready(L): the player can do it right now. done(L): it is behind them. cost: cash it takes (a step the player cannot afford yet is
 // replaced, as the FIRST item, by a way to make that cash). homeOnly steps steer the home screen but are not listed inside VampGPT.
 const STEPS=[
  {id:'vampgpt',app:'vampgpt',homeOnly:true,ready:()=>true,done:()=>!!flag('guideVampgptOpened'),
   item:()=>({label:'OGA WHAT DO I DO',sub:'VAMPGPT',action:'app:vampgpt'})},
  {id:'meal',app:null,ready:L=>L.day<=1&&advOk('TACOS'),done:L=>L.done('TACOS')||L.done('PEKING')||L.day>1,
   item:()=>({label:"DON CHUY'S",sub:'EAT · A FEW DOLLARS',action:'go:tacos'})},
  {id:'offer',app:'warRoom',ready:()=>offer().status==='available'&&!warActive(),done:()=>warActive()||['accepted','declined_final'].includes(offer().status),
   item:()=>({label:'WAR ROOM',sub:window.RAEconLines?.get('guide.next_offer')||'MISTER DECEMBER',action:'app:warRoom'})},
  {id:'first_play',app:'warRoom',ready:()=>warActive()&&slotsLeft()>0,done:()=>playsMade()>0,
   item:()=>({label:'MAKE A PLAY',sub:'WAR ROOM · CASH',action:'app:warRoom:jobs'})},
  {id:'shift',app:null,ready:L=>advOk('A08'),done:L=>L.done('A08'),
   item:()=>({label:'WORK A SHIFT',sub:'SLURP DYNASTY',action:'go:lane:slurp'})},
  {id:'rave',app:'maps',ready:()=>safe(()=>!!window.RAOpportunities.get('ogun_rave').available,false)&&!flag('ogunsRaveCompleted'),done:()=>!!flag('ogunsRaveCompleted'),
   item:()=>({label:"OGUN'S RAVE",sub:'YOU ARE INVITED',action:'ogun_rave'})},
  {id:'party_hall',app:'realEstate',cost:()=>partyHall()?.price||0,ready:L=>!!flag('castlePartyHostingUnlocked')&&!!partyHall(),done:L=>L.hasRoom('party_hall'),
   item:()=>({label:'BUILD THE PARTY HALL',sub:fmt(partyHall()?.price||0),action:'app:realEstate'})}
 ];

 // ---- ways to make cash, best first -----------------------------------------------------------------------------------------
 const CASH=[
  {id:'play',app:'warRoom',ready:()=>warActive()&&slotsLeft()>0,item:()=>({label:'MAKE A PLAY',sub:`WAR ROOM · ${slotsLeft()} LEFT TONIGHT`,action:'app:warRoom:jobs'})},
  // the day job is the floor under every other way: always there (A08 the first time, SLURP after), always the lowest pay
  {id:'shift',app:null,ready:L=>advOk('SLURP')||advOk('A08'),item:()=>({label:'WORK A SHIFT',sub:'SLURP DYNASTY · LOW PAY',action:'go:lane:slurp'})},
 ];
 // ---- things worth spending on once there is cash ----------------------------------------------------------------------------
 // the next castle room worth wanting: the cheapest unowned room (the Party Hall is a story step of its own). Until the Party Hall is built only the cheap
 // early rooms (RAEcon.guidance.earlyRoomMax) are recommended, so the cash the player is saving for the hall is not eaten by every room on the way.
 function nextRoom(){const G=window.RAEcon?.guidance||{},L=Lx().L(),hall=L.hasRoom('party_hall');
  return safe(()=>window.RACastle.ROOMS.filter(r=>r.id!=='party_hall'&&!L.hasRoom(r.id)&&(!r.needs||r.needs(L))&&(hall||r.price<=(G.earlyRoomMax||0))).sort((a,b)=>a.price-b.price)[0],null);}
 const SPEND=[
  // week one the club is every night, then every 2 days
  {id:'club',app:'stripClub',ready:L=>safe(()=>window.RAStripClub.isOpen(),false)&&L.money>=15000&&(!window.RAStripClub.firstVisitDone()||L.day-(Number(flag('stripClubLastDay'))||0)>=(L.day<=7?1:2)),item:L=>({label:'STRIP CLUB',sub:window.RAStripClub.firstVisitDone()?'THROW SOME CASH':'FIRST VISIT · DISCOUNT',action:'app:stripClub'})},
  {id:'room',app:null,cost:()=>nextRoom()?.price||0,ready:L=>{const r=nextRoom(),G=window.RAEcon?.guidance||{};return !!r&&L.money>=r.price+(G.keepCash||0);},item:()=>({label:'BUILD '+nextRoom().label,sub:fmt(nextRoom().price),action:'app:realEstate'})},
 ];
 const asItem=(def,kind,L)=>{const it=def.item(L);return {id:def.id,kind,app:def.app||null,cost:def.cost?def.cost():0,key:kind==='story'?`story:${def.id}`:`${kind}:${def.id}:${L.day}${def.id==='play'?`:${slotsLeft()}`:''}`,...it};};

 function story(){const L=Lx().L();return STEPS.filter(s=>safe(()=>s.ready(L)&&!s.done(L),false)).map(s=>asItem(s,'story',L));}
 function cash(){const L=Lx().L();return CASH.filter(c=>safe(()=>c.ready(L),false)).map(c=>asItem(c,'cash',L));}
 function spend(){const L=Lx().L();return SPEND.filter(c=>safe(()=>c.ready(L),false)).map(c=>asItem(c,'spend',L));}
 // The next story step the player can AFFORD, else the best way to make cash, else the first story step, else a spend/sleep item.
 function next(){
  const money=Lx().money(),st=story(),ca=cash();
  const doable=st.find(s=>!s.cost||money>=s.cost);
  if(doable)return doable;
  const sp=spend();
  // a step the player cannot afford yet: the best way to make that cash, labelled with how far off it is; with no cash move left, spend or rest
  if(st.length&&ca.length)return {...ca[0],sub:`${ca[0].sub} · ${fmt(Math.max(0,st[0].cost-money))} TO ${st[0].label}`};
  if(!st.length&&ca.length)return ca[0];
  if(sp.length)return sp[0];
  return {id:'sleep',kind:'rest',app:null,cost:0,key:`rest:${Lx().today().day}`,label:'GET SOME SLEEP',sub:st.length?`${fmt(Math.max(0,st[0].cost-money))} TO ${st[0].label}`:'NEW DAY, NEW MONEY',action:'close'};
 }
 // VampGPT's RECOMMENDED list: next() first, then the rest (story, cash, spend), no repeats, no home-only steps.
 function recommended(limit=window.RAEcon?.guidance?.recommended||4){
  const first=next(),seen=new Set([first.action]),out=first.homeOnly?[]:[first];
  for(const it of [...story().filter(s=>!STEPS.find(x=>x.id===s.id)?.homeOnly),...cash(),...spend()]){if(out.length>=limit)break;if(seen.has(it.action))continue;seen.add(it.action);out.push(it);}
  return out.slice(0,limit);
 }
 // ---- the pulse ---------------------------------------------------------------------------------------------------------------
 const ackKey=k=>`guideAck:${k}`;
 const acked=k=>!!flag(ackKey(k));
 function target(){const n=next();if(!n.app||acked(n.key))return null;return {app:n.app,key:n.key,item:n};}
 // opening an app clears ITS pulse (the one the player was steered to), nothing else
 function opened(appId){const t=target();if(t&&t.app===appId)window.RALife.setFlag(ackKey(t.key),true);if(appId==='vampgpt')window.RALife.setFlag('guideVampgptOpened',true);}
 const pulsing=appId=>{const t=target();return !!t&&t.app===appId;};
 window.RAGuidance=Object.freeze({story,cash,spend,next,recommended,target,pulsing,opened,steps:()=>STEPS.map(s=>s.id)});
})();
