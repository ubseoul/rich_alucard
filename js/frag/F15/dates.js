// F15 VELVET ROTATION — date infrastructure: the 12 romance scenes as ordinary adventures (existing RAAdventures grammar), their
// DARK-only supporting content (placeholder environments, scene-actor people, two narrowly configured Combat 2.0 encounters),
// delivery (accepted temptation/phone-text convention + a WAKE subscriber) and the decline rule.
//
// Scene text lives in roxy.js / rosalyn.js / emerald.js (approved romance script v3). This file adds NO dialogue.
(function(global){
 'use strict';
 const {RC,S,N}=global.RAContent;
 const C=()=>global.RAF15,T=()=>global.RAF15Tunables;
 // Ube-authored Rich line (approved verbatim in the creator's v3 script). Marked canon so no new [VP] voice-pass line is created.
 const U=text=>RC(text,{ube:true});
 const TITLES={},ORDER=[];
 const title=id=>TITLES[id]||id;

 // ---- scene actors: the approved FOUNDATION CARDS (assets/f15/portraits/<name>.png), named by character, so scenes never depend on the
 // unproven wolf/pink/dragon mapping (that mapping only decides which dance plays in the club) ----
 const cast=dancer=>({id:dancer,src:`assets/f15/portraits/${dancer}.png`});
 const stage=(...right)=>({left:'rich',right:right[0]?cast(right[0]):undefined});

 // ---- placeholder environments (RAPixel.paintEnvironment, the repo's existing convention for art that has not shipped) ----
 // Registered ONLY while F15 is enabled so a flag-OFF game and its art censuses are byte-unchanged. Each is named for what it is
 // (nothing silently stands in for another place) and is listed in docs/engineering/F15_VISUAL_GAPS.md.
 const night={sky:'#141026',stars:0};
 const ENVS=[
  ['f15_bing','THE BING · AFTER HOURS',{sky:'#120a22',wall:'#2a1238',floor:'#1c1226',horizon:330,wallTop:40,props:[{type:'rect',x:70,y:200,w:130,h:130,color:'#33154a'},{type:'rect',x:100,y:210,w:70,h:8,color:'#ff4fa3'},{type:'sign',x:60,y:60,w:150,h:20,text:'THE BING',glow:'#ff4fa3',size:8},{type:'rect',x:0,y:300,w:270,h:3,color:'#5a2a6a'},{type:'table',x:20,y:360,w:60,color:'#4a2a3a'},{type:'table',x:190,y:360,w:60,color:'#4a2a3a'}],lights:[{x:60,y:40,spread:46,color:'rgba(255,79,163,.12)'},{x:210,y:40,spread:46,color:'rgba(95,227,255,.10)'}]}],
  ['f15_gym','THE BOXING GYM',{sky:'#1c1a20',wall:'#33303a',floor:'#3a3532',horizon:330,wallTop:30,props:[{type:'rect',x:60,y:230,w:150,h:90,color:'#2a2a44'},{type:'rect',x:60,y:230,w:150,h:4,color:'#e8e2cf'},{type:'rect',x:60,y:262,w:150,h:4,color:'#c83a3a'},{type:'rect',x:58,y:226,w:4,h:98,color:'#8a8a99'},{type:'rect',x:208,y:226,w:4,h:98,color:'#8a8a99'},{type:'rect',x:14,y:150,w:10,h:90,color:'#6a4030'},{type:'sign',x:80,y:50,w:110,h:16,text:'GYM',glow:'#ffb040',size:7}]}],
  ['f15_roxy_apartment',"ROXY'S APARTMENT",{sky:'#17141c',wall:'#2d2832',floor:'#3c3434',horizon:330,wallTop:20,props:[{type:'rect',x:18,y:90,w:90,h:70,color:'#e8e2cf'},{type:'rect',x:24,y:96,w:78,h:2,color:'#20c66b'},{type:'rect',x:150,y:150,w:100,h:90,color:'#403a54'},{type:'rect',x:150,y:240,w:100,h:20,color:'#2a2638'},{type:'rect',x:176,y:300,w:80,h:30,color:'#4a3a40'}]}],
  ['f15_plenitude','PLÉNITUDE',{sky:'#1a1420',wall:'#3a2230',floor:'#2a1c1c',horizon:330,wallTop:20,props:[{type:'sign',x:80,y:50,w:110,h:18,text:'PLENITUDE',glow:'#f6efd9',size:6},{type:'table',x:40,y:280,w:80,color:'#e8e2cf'},{type:'table',x:150,y:280,w:80,color:'#e8e2cf'},{type:'lamp',x:60,y:140,h:90,r:22},{type:'lamp',x:200,y:140,h:90,r:22}]}],
  ['f15_convention','THE YUCK WARS CONVENTION',{sky:'#10142a',wall:'#232a4a',floor:'#2c2c3c',horizon:340,wallTop:10,props:[{type:'rect',x:10,y:30,w:60,h:160,color:'#3c7a3a'},{type:'rect',x:200,y:30,w:60,h:160,color:'#7a3a3a'},{type:'sign',x:75,y:40,w:120,h:18,text:'YUCK WARS',glow:'#7aff7a',size:7},{type:'counter',x:70,y:260,w:130,h:40,color:'#3a3a52',top:'#8a8aa8'}],crowd:18}],
  ['f15_rosalyn_apartment',"ROSALYN'S APARTMENT",{sky:'#1c1626',wall:'#34284a',floor:'#3a2e3a',horizon:330,wallTop:10,props:[{type:'rect',x:10,y:60,w:250,h:6,color:'#6a5a8a'},{type:'rect',x:10,y:130,w:250,h:6,color:'#6a5a8a'},{type:'rect',x:10,y:200,w:250,h:6,color:'#6a5a8a'},...Array.from({length:12},(_,i)=>({type:'rect',x:18+i*20,y:40+(i%3)*70,w:12,h:20,color:['#7aff7a','#ff7ab0','#7ac8ff','#ffd870'][i%4]})),{type:'rect',x:100,y:300,w:80,h:40,color:'#4a3a60'}]}],
  ['f15_rosalyn_apartment_dark',"ROSALYN'S APARTMENT · LIGHTS OFF",{sky:'#07060d',wall:'#0e0c18',floor:'#0c0a10',horizon:330,wallTop:10,props:[{type:'rect',x:10,y:250,w:250,h:50,color:'#17141f'},{type:'rect',x:10,y:246,w:250,h:4,color:'#2a2638'},{type:'circle',x:200,y:150,r:3,color:'#ffd870'}]}],
  ['f15_exam_hall','OUTSIDE THE EXAM HALL',{sky:'#1c2030',wall:'#3a3a4a',floor:'#4a4650',horizon:330,wallTop:30,props:[{type:'rect',x:90,y:80,w:90,h:160,color:'#22222e'},{type:'rect',x:100,y:90,w:32,h:140,color:'#14141c'},{type:'rect',x:138,y:90,w:32,h:140,color:'#14141c'},{type:'rect',x:40,y:300,w:190,h:6,color:'#6a6670'},{type:'rect',x:40,y:312,w:190,h:6,color:'#5a5660'},{type:'rect',x:40,y:324,w:190,h:6,color:'#4a4650'}]}],
  ['f15_library','THE LIBRARY',{sky:'#1a1a22',wall:'#3a3226',floor:'#4a4036',horizon:330,wallTop:10,props:[...Array.from({length:8},(_,i)=>({type:'rect',x:12+i*32,y:60,w:26,h:110,color:['#6a3a2a','#2a4a6a','#4a6a3a','#6a5a2a'][i%4]})),{type:'table',x:60,y:290,w:150,color:'#6a5030'},{type:'lamp',x:135,y:200,h:80,r:20}]}],
  ['f15_shrine','SHRINE AUDITORIUM',{sky:'#0c0a14',wall:'#1c1626',floor:'#2a1a22',horizon:310,wallTop:30,props:[{type:'rect',x:40,y:90,w:190,h:150,color:'#2a2036'},{type:'rect',x:40,y:236,w:190,h:6,color:'#6a5a2a'},{type:'circle',x:135,y:170,r:70,color:'rgba(255,230,160,.10)'},{type:'sign',x:80,y:50,w:110,h:16,text:'SHRINE',glow:'#ffd870',size:7}],lights:[{x:135,y:30,spread:90,color:'rgba(255,230,160,.10)'}],crowd:6}]
 ];
 const PEOPLE=[
  {id:'roxy',name:'ROXY'},{id:'rosalyn',name:'ROSALYN'},{id:'emerald',name:'EMERALD'},
  // speaker name only: Granny Bing's frozen art exists on another branch (art/f01-feel-lock-freeze), not on this base
  {id:'granny_bing',name:'GRANNY BING',noArt:true},{id:'spirit_of_uncle_bunmi',name:'THE SPIRIT OF UNCLE BUNMI',noArt:true}
 ];
 let ensured=false;
 function ensureContent(){
  if(ensured||!C().enabled())return;ensured=true;
  for(const [id,name,spec] of ENVS)global.RAEnvironments?.register?.({id,name,paint:{seed:id,...night,...spec},floorY:372,base:1,placeholder:true,f15:true});
  for(const p of PEOPLE){
   if(global.RABtfPeople?.byId[p.id])continue;
   const person={id:p.id,name:p.name,kind:p.id==='spirit_of_uncle_bunmi'?'creature':'woman',adult:true,dateable:false,f15:true};
   if(!p.noArt)person.sprite=`assets/f15/portraits/${p.id}.png`;
   global.RABtfPeople.byId[p.id]=person;
  }
  const E=global.RACombatData.ENEMIES,K=T().COMBAT,m=(id,label,dmg,o={})=>({id,label,dmg,...o});
  // ROXY SPARRING (Roxy L2): a light-contact spar, no defeat penalty. Existing engine; the numbers are TUNING (tunables.js).
  E.f15_roxy_spar={name:'ROXY (SPARRING)',hp:K.spar.hp,person:'roxy',moves:{jab:m('jab','JAB',K.spar.jab),cross:m('cross','CROSS',K.spar.cross,{telegraph:'ROXY IS SETTING HER FEET…'})},pattern:['jab','jab','cross'],f15:true};
  // THE SPIRIT OF UNCLE BUNMI (Rosalyn L4): the giant cockroach boss; Rosalyn's telegraphs and reactions are her approved lines.
  E.f15_uncle_bunmi={name:'THE SPIRIT OF UNCLE BUNMI',hp:K.roach.hp,person:'spirit_of_uncle_bunmi',boss:true,noRun:true,
   moves:{antenna:m('antenna','ANTENNA THING',K.roach.antenna,{effect:{accDown:.1,turns:1},telegraph:"ROSALYN: IT'S DOING THE ANTENNA THING."}),
    scuttle:m('scuttle','SCUTTLE',K.roach.scuttle),
    stare:m('stare','THE STARE',K.roach.stare,{telegraph:'ROSALYN: WHY IS IT LOOKING AT YOU. WHY IS IT LOOKING AT YOU LIKE THAT.'}),
    flies:m('flies','FLIES',K.roach.flies,{telegraph:'ROSALYN: PHASE TWO. IT FLIES. NOBODY TOLD ME IT FLIES.'})},
   pattern:['antenna','scuttle','stare','scuttle','flies'],
   octopus:{charisma:{label:'TRY TO TALK IT DOWN',result:'skip',turns:1,text:'ROSALYN: ARE YOU NEGOTIATING WITH IT?'},
    recruit:{label:'OFFER IT A JOB',result:'nothing',text:'ROSALYN: DO NOT GIVE IT A JOB.'},
    roast:{label:'I BET YOU HAVE DADDY ISSUES.',result:'enrage',text:'ROSALYN: OH, IT HEARD THAT.'}},f15:true};
 }
 global.RAFeatures.onChange(()=>{ensureContent();});

 // ---- scene definition ----------------------------------------------------------------------------------------------------------
 // add(dancer, level, {title, start, nodes, memory?}) — nodes use the accepted adventure node grammar.
 function add(dancer,level,spec){
  const id=C().sceneId(dancer,level);TITLES[id]=spec.title;ORDER.push(id);
  const prev=level>1?C().sceneId(dancer,level-1):null;
  global.RAAdventures.define({id,title:spec.title,lane:'dating',memoryType:'date',repeatable:false,scope:'MUST',start:spec.start,nodes:spec.nodes,
   available:()=>C().available(id),
   // Harness seeding only (tools/btf-test.mjs walker): turn the fragment ON, give the dancer the spend, play the earlier scenes.
   testSetup:ctx=>{
    ctx.RAFeatures.set('F06.rainmaker',true);ctx.RAFeatures.set(ctx.RAF15.FLAG,true);
    ctx.RAFrag.patch('F15',`dancers.${dancer}`,{spent:ctx.RAF15.thresholds()[3],throws:1});
    for(let l=1;l<level;l++)ctx.RAState.patch(`life.adventures.records.${ctx.RAF15.sceneId(dancer,l)}`,{status:'completed',count:1,completedDay:1});
   }});
  // delivery: the accepted temptation convention (a phone text + WHAT WE ON line). System notice only — it carries no dialogue.
  global.RATemptations?.define?.([{id:`f15:${id}`,adventure:id,sender:T().NAMES[dancer],thread:dancer,source:'invite',priority:55,life:[3,5],repeatable:true,
   line:`${T().NAMES[dancer]} · ${spec.title}`}]);
 }
 // The decline rule: "NOT TONIGHT" ends the run with outcome `declined`; the scene is then put back exactly as if never started
 // (record available, no completion day => the one-date-per-WAKE cap is untouched, no memory, route stays open).
 document.addEventListener('ra:adventure-complete',e=>{
  const id=e.detail?.id;if(e.detail?.outcome!=='declined'||!C().parse(id))return;
  const recs={...global.RAState.get().life.adventures.records};delete recs[id];global.RAState.patch('life.adventures.records',recs);
  global.RAState.patch('life.memoryLog',global.RAState.get().life.memoryLog.filter(m=>!String(m.id).startsWith(`adv:${id}:declined`)));
  global.RAState.patch('life.clock.returnBeat',null);
 });

 // ---- the one-date-per-WAKE guard at the shared entry seam ----------------------------------------------------------------------------
 // Every route into a scene (phone begin, temptation SAY LESS, club GO, WAKE triggers, chained/queued starts, tests) ends in RAAdventures.start(id).
 // This F15-owned guard wraps ONLY that call, ONLY for F15 scene ids: a NEW date is refused unless it is available right now (flag ON, threshold met,
 // sequence, global cap, gates). It never blocks (a) resuming the run that is already active (reload restores life.adventures.active and resumes through
 // RAAdventureScene.resume, which does not call start; a same-id start returns that run), and it consumes nothing for declining or browsing.
 const engineStart=global.RAAdventures.start;
 global.RAAdventures.start=function(id,opts){
  if(C().parse(id)&&global.RAAdventures.active()?.id!==id&&!C().available(id))return false;
  return engineStart.call(this,id,opts);
 };
 const guardedRefusal=id=>({id,status:C().status(id)});

 // ---- delivery -------------------------------------------------------------------------------------------------------------------
 // Put the dancer's next scene on the phone/WHAT WE ON as soon as it is available and the day's date is unspent.
 function offer(dancer){
  if(!C().enabled())return false;
  const next=C().nextScene(dancer);if(!next||!C().status(next).ok)return false;
  return !!global.RATemptations?.ensure?.(`f15:${next}`);
 }
 global.RAWakeBus?.subscribe?.({id:'F15.invites',fragment:'F15',phase:'wake',priority:67,flag:C().FLAG,fn:()=>{for(const d of C().dancers())offer(d);}});
 ensureContent();

 global.RAF15Dates={guardedRefusal,add,U,S,N,cast,stage,title,offer,ensureContent,ids:()=>ORDER.slice(),ENV_IDS:ENVS.map(e=>e[0])};
})(window);
