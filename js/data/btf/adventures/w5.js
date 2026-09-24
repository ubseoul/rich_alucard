(function(){
 // WAVE 5 — WEIRD, ENDING (VOL 1 §9.4/§11, VOL 5 §7-8). Non-Rich lines are functional drafts pending HQ
 // Story; every Rich line is [VP]. PLAYER-BLIND: HQ micro-moments and sealed slots are neutral hooks only.
 const {R,S,N,E}=RAContent;const D=RAAdventures.define;

 // A30 — BAD PORTOBELLOS. Rich lives a whole ordinary, good life, then wakes up screaming.
 const RICH_PORTO={id:'rich_portobello',look:{skin:'#6a4028',top:'#c8b89a',bottom:'#5a4a3a',hair:'#3a2418',hairShape:'short',shades:false,accent:'#20c66b'}};
 const PORTO_WIFE={id:'portobello_wife',look:{skin:'#e0b896',top:'#d8a0b0',bottom:'#2a2a38',hair:'#3a2010',hairShape:'long'}};
 const PORTO_KID1={id:'portobello_kid1',look:{skin:'#c99a78',top:'#7ad0a0',bottom:'#3a3a3a',hair:'#2a1810',hairShape:'bun',height:.6}};
 const PORTO_KID2={id:'portobello_kid2',look:{skin:'#c99a78',top:'#f0c060',bottom:'#3a3a3a',hair:'#2a1810',hairShape:'spiky',height:.55}};
 const PORTO_MGR={id:'portobello_manager',look:{skin:'#d8b090',top:'#3a3a4a',bottom:'#1f2a44',hair:'#5a4a3a',hairShape:'hat'}};
 const kpiRound=(n,next)=>({env:'portobello_office',actors:{left:RICH_PORTO,right:PORTO_MGR},
  lines:[N(`SLIDE ${n}.`),S('portobello_manager','walk us through it.')],
  choices:[{label:'THE BAR CHART — REGIONAL GROWTH',next},{label:'THE LINE — QUARTER OVER QUARTER',next},{label:'THE PIE — MARKET SHARE',next}]});
 D({id:'A30',title:'BAD PORTOBELLOS',lane:'life',scope:'MUST',start:'wake',legend:false,nodes:{
  wake:{env:'portobello_bedroom',actors:{mid:RICH_PORTO,left:PORTO_WIFE},title:'A TUESDAY',
   lines:[N('no locs. a clean cut. a sweater that costs more than it looks like it does.'),N('a woman sleeps next to him. she has loved him for a long time.'),R('…huh.')],next:'breakfast'},
  breakfast:{actors:{mid:RICH_PORTO,left:PORTO_WIFE,right:PORTO_KID1,farRight:PORTO_KID2},
   lines:[N('eggs. a mazda in the driveway — an actual, regular car. two kids arguing about cereal.'),S('portobello_wife',"you're gonna be late."),R("i'm never late.")],next:'commute'},
  commute:{lines:[N('the commute is fine. the radio plays something forgettable. it is a good song anyway.')],next:'kpi1'},
  kpi1:kpiRound(1,'kpi2'),kpi2:kpiRound(2,'kpi3'),kpi3:kpiRound(3,'approve'),
  approve:{env:'portobello_office',actors:{left:RICH_PORTO,right:PORTO_MGR},
   lines:[N('the room nods. actual nods.'),S('portobello_manager',"rich, that's... that's really good work."),R('i know my numbers.')],next:'bedtime'},
  bedtime:{env:'portobello_bedroom',actors:{mid:RICH_PORTO,left:PORTO_KID1,right:PORTO_KID2},
   lines:[N('bath. teeth. a book about a dragon that is not real.'),S('portobello_kid1','one more chapter?'),R('one more chapter.')],next:'porch'},
  porch:{env:'portobello_porch',actors:{left:RICH_PORTO,right:PORTO_WIFE},
   lines:[N('the sky goes orange, then grey. she leans on his shoulder.'),S('portobello_wife','good day?'),R('good day.'),N('it is a good life. nothing here is a joke on him.')],next:'bed'},
  bed:{env:'portobello_bedroom',actors:{mid:RICH_PORTO,left:PORTO_WIFE},
   lines:[R('what if.'),N('black.')],next:'wakeup'},
  wakeup:{env:'bedroom',actors:{mid:'rich'},
   lines:[N('rich wakes up screaming.'),N('he touches his head. locs. all of them. still there.'),R('…ok. ok. good.')],
   end:{outcome:'woke',nightEnder:true,memory:{text:'a whole other life: a data analyst, a wife who loved him, two kids, a mazda',lane:'home',quality:2},receipt:{caption:'bad portobellos. good life. wrong one.'},home:['rich','i had a mazda. i had a WIFE.',{vp:true}]}}
 }});
 D({id:'A31',title:'GOD ON THE CURB',lane:'home',scope:'MUST',start:'start',
  testSetup:ctx=>{ctx.RALife.setFlag('lastDefeatDay',ctx.RALife.today().day);},
  nodes:{
  start:{env:'street_night',actors:{mid:'rich'},lines:[N("sunday night. rich wants to go somewhere he can't explain.")],route:{dest:'POWDER SPRINGS',next:'arrive'}},
  arrive:{env:'curb',actors:{mid:'rich'},lines:[N('the curb. the same curb, always.'),N('someone sits down next to him.'),E('god','…'),N('she is old. she is beautiful. she is, undeniably, a baddie.')],next:'stars'},
  stars:{lines:[N('the stars get brighter. just a little. just there.'),S('god','you are more than enough.')],next:'silence'},
  silence:{lines:[N('rich does not have a joke. for the first time in his life, rich does not have a joke.')],next:'fade'},
  fade:{lines:[N("she fades. the way morning fades a dream — you don't see it happen, you just notice that it did."),N('the stars stay bright a little longer than they should.')],
   end:{outcome:'sat',memory:{text:'a woman on the curb at powder springs told him he was enough',lane:'home',quality:2},receipt:{caption:'the curb. somebody was there.'},home:['rich','…',{vp:true}]}}
 }});
 D({id:'A34',title:'TOKYO TEASER',lane:'world',scope:'SIDE',available:L=>L.day>=30,start:'dm',nodes:{
  dm:{env:'tokyo_tease',actors:{mid:'rich'},
   lines:[N('a dm. a drift clip: taillights in the rain, a shrine gate, a girl in the driver\'s seat looking dead into the camera.'),S(null,'"we saw this."')],next:'gpt'},
  gpt:{lines:[N('VampGPT chimes in, uninvited.'),S('vampgpt','almost. not yet.'),R('tokyo can wait. tokyo better wait.')],
   end:{outcome:'teased',memory:{text:'a tokyo vampire sent a drift clip: "we saw this"',lane:'world',quality:.5},receipt:{caption:'tokyo knows. tokyo is patient.'}}}
 }});
 // JOLLOF WARS — monthly cook-off (repeatable) and the FINAL (A54, one-time, after 1+ cook-off win).
 D({id:'JOLLOF_WARS',title:'JOLLOF WARS',lane:'food',repeatable:true,available:L=>L.done('A43'),start:'arrive',nodes:{
  arrive:{env:'kitchen',actors:{left:'rich'},lines:[N('first sunday. every kitchen in the diaspora smells like this today.')],next:'cook'},
  cook:{minigame:{id:'jollof',params:()=>({mode:'cookoff',lauraScore:34,inventory:{maggi_dragon_crumble:RALife.count('maggi_dragon_crumble')}}),
   next:(A,result)=>{A.set('cookResult',result);return result?.outcome==='win'?'win':'lose';}}},
  win:{enter:A=>{RALife.addProp('prop_jollof_trophy');RALife.counter('jollofWarsWins');},
   lines:[N('you beat the block. $500 and a trophy that is absolutely going on the mantel.')],
   end:{outcome:'win',memory:{text:'won the monthly jollof wars cook-off',lane:'food',quality:1},receipt:{caption:'jollof wars champion. this month, anyway.'}}},
  lose:{lines:[N('close. not this month.')],end:{outcome:'lose',memory:{text:'lost the monthly jollof wars cook-off',lane:'food',quality:.3}}}
 }});
 D({id:'A54',title:'JOLLOF WARS: THE FINAL',lane:'food',scope:'MUST',available:L=>(Number(L.flag('jollofWarsWins'))||0)>=1,
  testSetup:ctx=>{ctx.RALife.setFlag('jollofWarsWins',1);},start:'arrive',nodes:{
  arrive:{env:'kitchen',actors:{left:'rich',right:'lil_smack'},
   lines:[N('the final. mom is on video call, already judging your knife work through the phone camera.'),N("lil smack is here, mouth open, eating everyone's entries before the judges even get a bite.")],next:'cook'},
  cook:{minigame:{id:'jollof',params:()=>({mode:'final',lauraScore:34,inventory:{maggi_dragon_crumble:RALife.count('maggi_dragon_crumble')}}),
   next:(A,result)=>{A.set('cookResult',result);if(result?.outcome==='win'){if(result?.data?.beatLaura)RALife.counter('lauraLedger');return 'win';}return 'lose';}}},
  win:{enter:A=>{RALife.light('legend',1,'legend:A54:win');RALife.light('chaos',1,'chaos:A54:win');},
   lines:[N('$5,000. winning jollof wars is now, legally, legendary.')],
   end:{outcome:'win',memory:{text:'won the jollof wars final. legendary.',lane:'food',quality:2},receipt:{caption:'jollof wars champion. the real one.'},chain:()=>RAAdventures.available('A56')?'A56':null}},
  lose:{lines:[N('mom mutes herself. that is worse than anything she could have said.')],end:{outcome:'lose',memory:{text:'lost the jollof wars final',lane:'food',quality:.3}}}
 }});
 D({id:'A56',title:'LIL SMACK #5',lane:'food',scope:'MUST',start:'arrive',nodes:{
  arrive:{env:'kitchen',actors:{left:'rich',right:'lil_smack'},lines:[E('lil_smack','…'),N('lil smack takes one bite. mouth closed. actually closed.')],next:'react'},
  react:{lines:[N('it might be the most emotional moment of his entire life.'),S('lil_smack',"…it's good, man."),R('…thank you.')],next:'leave'},
  leave:{lines:[N('he leaves. not dramatically. just — gone. no more crumbs on the porch. not until the fame.')],
   end:{outcome:'closedMouth',memory:{text:'lil smack ate with his mouth closed, once, and then he left',lane:'food',quality:2},receipt:{caption:'lil smack, mouth closed. once.'},fx:()=>RALife.setFlag('lilSmackGone',true)}}
 }});
 D({id:'A53',title:'THE FAMILY HOLIDAY',lane:'home',scope:'MUST',available:L=>L.day>=57&&!L.life.momentum.fameFired,
  testSetup:ctx=>{ctx.RAState.patch('life.world.day',57);},start:'kitchen',nodes:{
  kitchen:{env:'family_house',actors:{left:'mom',mid:'rich',right:'dad'},title:'THANKSGIVING · ATLANTA',
   lines:[N('the kitchen is packed. jollof sits right next to the turkey, unbothered.'),S('brother1',"the falcons WOULD have won-"),S('brother2','stop it. stop talking.')],next:'dad'},
  dad:{actors:{left:'dad',mid:'rich'},lines:[S('dad',"so. the music thing. how's that going."),R("it's going. trust me, it's going.")],next:'sister'},
  sister:{actors:{left:'sister',mid:'rich'},
   lines:A=>{const partner=RABtfPeople.women.find(w=>A.rel.level(w.id)===4);const out=[S('sister','ok let me read the comments on your last post.'),N('she reads them out loud, badly, gleefully.')];if(partner)out.push(N(`${(partner.name||'she').toLowerCase()} is on the video call with mom in the background. mom already loves her.`));return out;},next:'nap'},
  nap:{lines:[N('nobody mentions vampires. nobody ever mentions vampires.'),N('rich falls asleep on the couch before dessert is even cut.')],
   end:{outcome:'holiday',memory:{text:'thanksgiving in atlanta. jollof next to the turkey.',lane:'home',quality:1.5},receipt:{caption:'thanksgiving. everybody made it.'},home:['rich','i needed that.',{vp:true}]}}
 }});
 D({id:'A58',title:'BRITNEY STAKES LIKED YOUR POST',lane:'world',scope:'SIDE',available:L=>L.day>=35&&L.followers>=300,
  testSetup:ctx=>{ctx.RAState.patch('life.world.day',35);ctx.RAState.patch('life.resources.followers',500);},start:'notif',nodes:{
  notif:{env:'bedroom',actors:{mid:'rich'},lines:[N('one notification. BRITNEY STAKES liked your post.'),R('…'),R('…no.')],next:'call'},
  call:{lines:[N('tristan calls immediately.'),S('tristan','BRO. BRO DID YOU SEE-'),R('i saw.')],next:'family'},
  family:{enter:()=>{RALife.text('family','SISTER','WAIT BRITNEY STAKES LIKED YOUR POST???? 😭😭😭',{id:`a58:${RALife.today().day}`});},
   lines:[N('the family thread explodes. the sister, it turns out, is a fan.')],
   end:{outcome:'liked',memory:{text:'britney stakes liked his post',lane:'world',quality:1},receipt:{caption:'britney stakes liked it. once.'}}}
 }});

 // Late-game wake triggers.
 RAWakeTriggers.define([
  {adventure:'A53',when:L=>L.day===57&&!L.life.momentum.fameFired,priority:90},
  {adventure:'A58',when:L=>L.day>=35&&L.followers>=300,priority:20}
 ]);

 // HQ micro-moments and sealed slots: neutral hook only, no content authored here (PLAYER-BLIND).
 RAClock.onWake('sealed-slots',75,({info})=>{
  for(const slot of ['S01','S02','S03','S04','S05','S06','S07','S08','ARC-X','HQ-M01','HQ-M02','HQ-M03'])RASealed.fire(slot,{info,life:RALife.life()});
 });

 // A place that starts a DATE with whoever Rich has been building something with — used by late-game
 // "somebody's active on instahoe" temptations so DATE always gets valid vars.
 RAPlaces.define([{id:'date_someone',hidden:true,go:api=>{
  const cand=RABtfPeople.women.find(w=>RARelations.level(w.id)>=2);if(!cand)return false;
  return RAAdventureScene.begin('DATE',{from:'temptation',vars:{person:cand.id}});
 }}]);

 // Late-game (Day 31+) temptation variety: people texting, invites, VampGPT nudges, possessions.
 // `adventure:` only for ids that exist (mine, or guarded with when() against ids other waves define).
 RATemptations.define([
  {id:'reggie_portobellos',source:'invite',sender:'REGGIE',line:"portobellos. they're bad. like good-bad.",minDay:31,priority:10,when:L=>!L.done('A30')&&(!RAAdventures.get('A09')||L.done('A09')),adventure:'A30'},
  {id:'curb_pull',source:'craving',line:"you don't know why. powder springs, again.",minDay:28,priority:8,when:L=>!L.done('A31')&&(L.done('A30')||L.flag('lastDefeatDay')),adventure:'A31'},
  {id:'tokyo_dm',source:'vampgpt',line:'somebody in tokyo is drifting sideways into your dms.',minDay:30,weight:1,when:L=>!L.done('A34'),adventure:'A34'},
  {id:'jollof_wars_sunday',source:'vampgpt',line:'first sunday. bring your pot.',minDay:31,weight:2,cooldown:20,repeatable:true,when:L=>L.done('A43')&&L.info.sunday&&((L.day-1)%28)<7,adventure:'JOLLOF_WARS'},
  {id:'jollof_wars_final_ready',source:'vampgpt',line:'you already beat the block once. the final is next.',minDay:31,weight:2,when:L=>(Number(L.flag('jollofWarsWins'))||0)>=1&&!L.done('A54'),adventure:'A54'},
  {id:'vg_grave_late',source:'vampgpt',line:'the grave never closes. neither do you, apparently.',minDay:31,weight:1.5,cooldown:6,repeatable:true,action:'grave'},
  {id:'crave_jollof_late',source:'craving',line:'jollof. always jollof.',minDay:31,weight:2,cooldown:4,repeatable:true,action:'peking'},
  {id:'crave_tacos_late',source:'craving',line:"don chuy's playing the good radio again.",minDay:31,weight:1.5,cooldown:3,repeatable:true,action:'tacos'},
  {id:'tristan_cook',source:'text',thread:'tristan',sender:'TRISTAN',line:"come cook something. i'm bored.",minDay:31,weight:1,cooldown:7,repeatable:true,when:L=>!!RAAdventures.get('COOK'),adventure:'COOK'},
  {id:'host_invite',source:'invite',line:"throw one. it's been a minute.",minDay:31,weight:1,cooldown:10,repeatable:true,when:L=>!!RAAdventures.get('HOST')&&L.hasRoom('party_hall'),adventure:'HOST'},
  {id:'pier_money',source:'vampgpt',line:'wallets be at the pier tonight.',minDay:31,weight:1.2,cooldown:5,repeatable:true,when:L=>!!RAAdventures.get('PIER'),adventure:'PIER'},
  {id:'tandem_challenge',source:'possession',line:"the supra: \"somebody's talking noise on the boards again.\"",minDay:31,weight:1,cooldown:6,repeatable:true,when:L=>!!RAAdventures.get('TANDEM_BATTLE')&&(L.life.ownership.cars||[]).length>0,adventure:'TANDEM_BATTLE'},
  {id:'slurp_shift',source:'vampgpt',line:'you ever miss the shift? (weird flex but ok)',minDay:31,weight:.8,cooldown:8,repeatable:true,when:L=>!!RAAdventures.get('SLURP'),adventure:'SLURP'},
  {id:'cafe_rain',source:'vampgpt',line:"bean there dead that. it's raining. you know what that means.",minDay:31,weight:1,cooldown:5,repeatable:true,when:L=>!!RAAdventures.get('CAFE')&&L.info.rain,adventure:'CAFE'},
  {id:'retwist_locs',source:'possession',line:"your locs: \"get retwisted. you look unserious.\"",minDay:31,weight:1,cooldown:12,repeatable:true,when:L=>!!RAAdventures.get('RETWIST'),adventure:'RETWIST'},
  {id:'hookah_roof',source:'text',thread:'tristan',sender:'TRISTAN',line:'roof. hookah. no reason.',minDay:31,weight:1,cooldown:9,repeatable:true,when:L=>!!RAAdventures.get('HOOKAH'),adventure:'HOOKAH'},
  {id:'date_someone_dm',source:'vampgpt',line:"somebody's been active on instahoe. you should say something.",minDay:31,weight:1.3,cooldown:6,repeatable:true,action:'date_someone'}
 ]);
})();
