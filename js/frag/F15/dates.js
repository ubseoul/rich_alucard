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

 // ---- environments ----------------------------------------------------------------------------------------------------------------
 // The seven Ube-approved scene backgrounds (art package f15-date-scene-assets @ 75459f40; byte copies in assets/f15/environments/,
 // hashes in assets/f15/scene_art_manifest.json) are ordinary image environments (the repo's `img()` convention): native 270x480, drawn
 // 1:1 with nearest-neighbour. floorY/base are the only per-scene tuning (actor feet line and depth scale). Each id is used only by the
 // scene location it depicts. THE LIBRARY and OUTSIDE THE EXAM HALL have no approved art and stay named code-drawn placeholders
 // (docs/engineering/F15_VISUAL_GAPS.md). Registered ONLY while F15 is enabled so a flag-OFF game and its art censuses are unchanged.
 const ENV_DIR='assets/f15/environments/';
 const LIGHTS_OFF='assets/f15/layers/lights_off_270x480.png';
 // [id, name, file, floorY, base, layers?]
 const IMAGE_ENVS=[
  ['f15_bing','THE BING','the_bing',372,1],
  ['f15_gym','THE BOXING GYM','boxing_gym',372,1],
  ['f15_roxy_apartment',"ROXY'S APARTMENT",'roxy_apartment',372,1],
  ['f15_plenitude','PLÉNITUDE','plenitude',372,1],
  ['f15_convention','THE YUCK WARS CONVENTION','convention_hall',372,1],
  ['f15_rosalyn_apartment',"ROSALYN'S APARTMENT",'rosalyn_apartment',372,1],
  // same apartment with the lights off: the approved background under a flat overlay layer (not new art; the PNG is untouched)
  ['f15_rosalyn_apartment_dark',"ROSALYN'S APARTMENT · LIGHTS OFF",'rosalyn_apartment',372,1,[LIGHTS_OFF]],
  ['f15_shrine','SHRINE AUDITORIUM','shrine_auditorium',372,1]
 ];
 const night={sky:'#141026',stars:0};
 const ENVS=[
  ['f15_exam_hall','OUTSIDE THE EXAM HALL',{sky:'#1c2030',wall:'#3a3a4a',floor:'#4a4650',horizon:330,wallTop:30,props:[{type:'rect',x:90,y:80,w:90,h:160,color:'#22222e'},{type:'rect',x:100,y:90,w:32,h:140,color:'#14141c'},{type:'rect',x:138,y:90,w:32,h:140,color:'#14141c'},{type:'rect',x:40,y:300,w:190,h:6,color:'#6a6670'},{type:'rect',x:40,y:312,w:190,h:6,color:'#5a5660'},{type:'rect',x:40,y:324,w:190,h:6,color:'#4a4650'}]}],
  ['f15_library','THE LIBRARY',{sky:'#1a1a22',wall:'#3a3226',floor:'#4a4036',horizon:330,wallTop:10,props:[...Array.from({length:8},(_,i)=>({type:'rect',x:12+i*32,y:60,w:26,h:110,color:['#6a3a2a','#2a4a6a','#4a6a3a','#6a5a2a'][i%4]})),{type:'table',x:60,y:290,w:150,color:'#6a5030'},{type:'lamp',x:135,y:200,h:80,r:20}]}]
 ];
 // The giant cockroach (frozen master 1774x887 RGBA, partial alpha accepted). Runtime shows the documented 444x222 area-resize derivative
 // (tools/f15/build_scene_art.py) at ONE fixed world scale: 0.30 world px per derivative px = 133 x 67 world px, facing left toward Rich.
 // The contact anchor is the bottom-centre of its visible pixels (tools/presentation/annotations.json: groundedAnchor).
 const ROACH={src:'assets/f15/characters/spirit_of_uncle_bunmi_444x222.png',scale:0.30};
 const PEOPLE=[
  {id:'roxy',name:'ROXY'},{id:'rosalyn',name:'ROSALYN'},{id:'emerald',name:'EMERALD'},
  // frozen CGA-F2-032 anchor (single neutral / calling-numbers pose, Ube-accepted for Emerald L3), 80x96, contact (40,88)
  {id:'granny_bing',name:'GRANNY BING',sprite:'assets/before_the_fame/characters/granny_bing/cga_f2_032/granny_bing_neutral_calling_numbers_anchor_80x96_v1.png'},
  {id:'spirit_of_uncle_bunmi',name:'THE SPIRIT OF UNCLE BUNMI',sprite:ROACH.src}
 ];
 let ensured=false;
 function ensureContent(){
  if(ensured||!C().enabled())return;ensured=true;
  for(const [id,name,file,floorY,base,layers] of IMAGE_ENVS)global.RAEnvironments?.register?.({id,name,image:`${ENV_DIR}${file}_270x480.png`,floorY,base,...(layers?{layers}:{}),approved:true,f15:true});
  for(const [id,name,spec] of ENVS)global.RAEnvironments?.register?.({id,name,paint:{seed:id,...night,...spec},floorY:372,base:1,placeholder:true,f15:true});
  for(const p of PEOPLE){
   if(global.RABtfPeople?.byId[p.id])continue;
   const person={id:p.id,name:p.name,kind:p.id==='spirit_of_uncle_bunmi'?'creature':'woman',adult:true,dateable:false,f15:true};
   person.sprite=p.sprite||`assets/f15/portraits/${p.id}.png`;
   global.RABtfPeople.byId[p.id]=person;
  }
  const E=global.RACombatData.ENEMIES,K=T().COMBAT,m=(id,label,dmg,o={})=>({id,label,dmg,...o});
  // ROXY SPARRING (Roxy L2): a light-contact spar, no defeat penalty. Existing engine; the numbers are TUNING (tunables.js).
  E.f15_roxy_spar={name:'ROXY (SPARRING)',hp:K.spar.hp,person:'roxy',moves:{jab:m('jab','JAB',K.spar.jab),cross:m('cross','CROSS',K.spar.cross,{telegraph:'ROXY IS SETTING HER FEET…'})},pattern:['jab','jab','cross'],f15:true};
  // THE SPIRIT OF UNCLE BUNMI (Rosalyn L4): the giant cockroach boss; Rosalyn's telegraphs and reactions are her approved lines.
  E.f15_uncle_bunmi={name:'THE SPIRIT OF UNCLE BUNMI',hp:K.roach.hp,person:'spirit_of_uncle_bunmi',boss:true,noRun:true,stageScale:ROACH.scale,
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

 global.RAF15Dates={guardedRefusal,add,U,S,N,cast,stage,title,offer,ensureContent,ids:()=>ORDER.slice(),ENV_IDS:[...IMAGE_ENVS,...ENVS].map(e=>e[0]),IMAGE_ENV_IDS:IMAGE_ENVS.map(e=>e[0]),ROACH};
})(window);
