(function(){
 // W3 "COLLISIONS" content (Days 20–35). Non-Rich lines are functional drafts pending HQ Story;
 // every Rich line is [VP]. Owned exclusively by this file: js/data/btf/adventures/w3.js.
 const {R,S,N,E}=RAContent;const D=RAAdventures.define;

 // ---- shared helper: manually teach a move outside the octopus.recruit auto-learn path (see combat2.js finish()). ----
 function learnMove(id,{magic=false}={}){
  const life=RAState.get().life;
  const learned=[...new Set([...(life.combat.learnedMoves||[]),id])];RAState.patch('life.combat.learnedMoves',learned);
  if(magic){const m=[...new Set([...(life.combat.magic||[]),id])];RAState.patch('life.combat.magic',m);}
  const eq=[...life.combat.equippedMoves];if(!eq.includes(id)&&eq.length<4){RAState.patch('life.combat.equippedMoves',[...eq,id]);}
 }
 const kevinCameo=()=>RALife.flag('kevinCameo')?[N('a kevin walks by in the background. nobody reacts to him. nobody ever will again.')]:[];

 // ============================================================================================
 // A18 — FORTY KEVINS. Reached via THE GRAVE hub (street) or a SLURP shift. Kaede drops from the
 // ceiling, embarrassed, and is met/dateable. RAParties.earn('clone'). Sets flag 'kevinCameo'.
 // ============================================================================================
 D({id:'A18',title:'FORTY KEVINS',lane:'combat',memoryType:'combat',start:'arrive',testVars:{where:'grave'},nodes:{
  arrive:{env:A=>A.vars.where==='slurp'?'slurp':'grave',actors:{left:'rich'},title:'WAIT, WHY ARE THERE FORTY OF THEM',
   lines:A=>[N(A.vars.where==='slurp'?'a ticket comes through: KEVIN x40. the whole line is one guy, forty times.':'the grave is full of the same guy. same hoodie. same haircut. all named kevin.'),N('they are all bowing to each other.')],
   next:'drop'},
  drop:{lines:[N('something drops from the ceiling vent above the food court sign.'),E('kaede','a woman in all black lands in a crouch, then immediately falls over sideways.'),S('kaede','…i meant to do that.'),N('the kevins do not notice. she notices you noticing.')],
   enter:A=>{RARelations.meet('kaede','A18');},next:'talk'},
  talk:{lines:[S('kaede','i was tailing one of them. they multiplied. this is not my first forty kevins.'),R('you just gonna lay there?')],
   choices:[{label:'HELP HER UP',fx:A=>RARelations.add('kaede',5,{reason:'helped her up'}),next:'fight'},{label:'"…WHY WERE YOU IN THE CEILING?"',fx:A=>RARelations.add('kaede',3,{reason:'asked'}),next:'fight'}]},
  fight:{lines:[N('the kevins turn, all forty heads at once.')],fight:{enemy:'kevins',params:{env:A=>A.vars.where==='slurp'?'slurp':'grave',intro:'FORTY KEVINS WANT TO FIGHT. ALL OF THEM.'},win:'after',lose:'after',spared:'after'}},
  after:{lines:A=>[N(A.vars.fight==='spared'?'the kevins disperse, satisfied in some way you will never understand.':A.vars.fight==='win'?'thirty-nine kevins scatter. one keeps bowing.':'the kevins pin you down and take turns apologizing while doing it.'),S('kaede','you handled that. weirdly well.'),R('i don\'t make the rules. i just live here.')],next:'behavior'},
  behavior:{lines:[N('kaede shows you a move she picked up from watching them regroup.')],
   enter:A=>{RAParties.earn('clone');RALife.setFlag('kevinCameo',true);RARelations.memory('kaede','a18_kevins');},
   next:'end'},
  end:{end:{outcome:A=>A.vars.fight||'spared',memory:{text:'forty kevins at the grave (or the slurp line). one wasn\'t.',lane:'combat',quality:1.2},
   receipt:{caption:'forty kevins. one real one. you never found out which.'},
   home:['rich','kevin. all of them. kevin.',{vp:true}]}}
 },legend:true});

 // GRAVE hub + street encounters. Composable — later waves may add more via the same pattern.
 (function(){const prev=window.RAGraveEncounters;window.RAGraveEncounters=L=>[...(prev?prev(L):[]),
  ...(RAAdventures.available('A18')?[{label:'THE FOOD COURT LINE IS ALL ONE GUY',fx:A=>A.set('chain','A18'),next:'out'}]:[]),
  ...(RAAdventures.available('A19')?[{label:'SOMEONE IS FIGHTING OVER ORANGE CHICKEN',fx:A=>A.set('chain','A19'),next:'out'}]:[])
 ];})();

 // ============================================================================================
 // A19 — BRUCE LOOSE AT THE FOOD COURT. Last orange chicken. Teaches ONE-INCH PETTY either way.
 // Points Rich to THE ARMORY. Also exposed as a Grave hub encounter (already wired above).
 // ============================================================================================
 D({id:'A19',title:'BRUCE LOOSE AT THE FOOD COURT',lane:'combat',memoryType:'combat',start:'arrive',nodes:{
  arrive:{env:'food_court',actors:{left:'rich',right:'bruce_loose'},title:'THE LAST ORANGE CHICKEN',
   enter:A=>{RARelations.meet('bruce_loose','A19');},
   lines:[N('one tray of orange chicken left under the heat lamp. a man in a tracksuit is staring at it like it owes him money.'),S('bruce_loose','THAT\'S MINE.'),R('i just wanted a bite.')],next:'fight'},
  fight:{fight:{enemy:'bruce_loose',params:{env:'food_court',intro:'BRUCE LOOSE WANTS THE CHICKEN. AND A FIGHT.'},win:'lesson',lose:'lesson',spared:'lesson'}},
  lesson:{lines:A=>[N(A.vars.fight==='win'?'he goes down, laughing, and gets right back up to teach you something.':A.vars.fight==='spared'?'he stops mid-swing and decides you deserve a lesson instead.':'he beats you to the chicken. and everything else. then he offers a hand up.'),S('bruce_loose','LESSON ONE. ONE-INCH PETTY. YOU DON\'T NEED SPACE. YOU NEED SPITE.')],
   enter:A=>{learnMove('petty');},next:'armory'},
  armory:{lines:[S('bruce_loose','also — you look like a man who needs guns. THE ARMORY. behind the church on 3rd. tell deacon brass bruce sent you.'),R('a church has guns?'),S('bruce_loose','A CHURCH HAS EVERYTHING.')],
   enter:A=>{RALife.setFlag('armoryKnown',true);},next:'end'},
  end:{end:{outcome:A=>A.vars.fight||'spared',memory:{text:'lost the last orange chicken, learned one-inch petty',lane:'combat',quality:1},
   receipt:{caption:'one-inch petty. the chicken was never the point.'},
   home:['rich','one inch. that\'s all it takes.',{vp:true}]}}
 },legend:true});

 // ============================================================================================
 // A20 — POWER LEVEL PHIL. A 3-day arc keyed to the Life Clock: each WAKE (day 18+) after this
 // becomes available advances the joke by one stage. Day 3: hair gold, real fight.
 // ============================================================================================
 D({id:'A20',title:'POWER LEVEL PHIL',lane:'combat',memoryType:'combat',repeatable:true,start:'arrive',testVars:{stage:1},presentationVariants:[{stage:3}],nodes:{
  arrive:{env:'street_night',actors:A=>({left:'rich',right:(A.vars.stage||Math.min(3,(Number(RALife.flag('philProgress'))||0)+1))>=3?{id:'phil',state:'charging_day3'}:'phil'}),
   title:A=>({1:'DAY ONE',2:'DAY TWO',3:'DAY THREE'}[A.vars.stage||Math.min(3,(Number(RALife.flag('philProgress'))||0)+1)]),
   enter:A=>{if(!A.vars.stage)A.set('stage',Math.min(3,(Number(RALife.flag('philProgress'))||0)+1));RARelations.meet('phil','A20');},
   lines:A=>{const st=A.vars.stage;if(st===1)return [N('a guy in a power stance is standing in the middle of the sidewalk, screaming.'),S('phil','I\'M SO CLOSE TO MY FULL POWER!'),N('nothing visibly happens.')];
    if(st===2)return [N('phil is still there. same spot. same scream.'),S('phil','DAY TWO. I CAN FEEL IT BUILDING.'),R('it has been the same amount of power both days.')];
    return [N('phil\'s hair is gold now. actually gold. the street lamp flickers.'),S('phil','IT\'S HAPPENING. IT\'S FINALLY—'),R('okay. okay okay okay.')];},
   next:'fork'},
  fork:{choices:A=>[{label:'ASK HOW LONG',next:'ask'},{label:'FIGHT NOW',next:'fightnow'},{label:'GET FOOD WHILE HE CHARGES',octopus:true,next:'food'}]},
  ask:{lines:A=>[S('phil','SOON. SO SOON.')],next:A=>A.vars.stage>=3?'fightnow':'wrap'},
  fightnow:{fight:{enemy:'phil',params:A=>({env:'street_night',invincible:A.vars.stage<3,intro:A.vars.stage<3?'PHIL IS INVINCIBLE WHILE HE CHARGES.':'PHIL IS AT FULL POWER. FINALLY.'}),win:'wrap',lose:'wrap',spared:'wrap'}},
  food:{actors:{left:'rich',right:{id:'phil',state:'sitting_plate'}},lines:[N('you leave and come back with garlic knots. phil is still screaming, but he stops to eat.'),S('phil','…thanks. nobody ever does that.')],
   enter:A=>{RARelations.add('phil',2,{reason:'fed him'});},next:'wrap'},
  // Day three: the wrap narrates Phil spent on the ground (ART SHIP 008 phil.spent_grounded); earlier days keep the cast.
  wrap:{actors:A=>A.vars.stage>=3?{left:'rich',right:{id:'phil',state:'spent_grounded'}}:undefined,
   lines:A=>A.vars.stage>=3?[N('phil is on the ground, gold hair fading back to brown, grinning.'),S('phil','WORTH IT.')]:[N('you leave phil to keep charging. he waves without breaking stance.')],
   enter:A=>{const st=A.vars.stage;if(st>=3){RALife.setFlag('phil3Done',true);RALife.remember({text:'power level phil finally powered up',lane:'combat'});}else{RALife.setFlag('philProgress',st);RALife.setFlag('philLastDay',RALife.today().day);}},
   next:'end'},
  end:{end:{outcome:A=>A.vars.stage>=3?'done':'charging',
   memory:A=>({text:A.vars.stage>=3?'power level phil went gold':'power level phil is still charging',lane:'combat',quality:A.vars.stage>=3?1.4:.6}),
   home:A=>A.vars.stage>=3?['rich','three days for one punch. respect the process.',{vp:true}]:null}}
 },legend:true});
 RAWakeTriggers.define([{adventure:'A20',priority:40,when:L=>L.day>18&&!L.flag('phil3Done')&&L.flag('philLastDay')!==L.day}]);

 // ============================================================================================
 // A21/'HOOKAH' — HOOKAH ON THE ROOF (Bllad33). Deadpan straight man; UMich freshman-year stories;
 // "my brother hilt doesn't play." He jumps off the roof; Rich: "he could've took the stairs."
 // ============================================================================================
 D({id:'HOOKAH',title:'HOOKAH ON THE ROOF',lane:'people',memoryType:'people',repeatable:true,cooldown:7,start:'arrive',
  available:L=>L.eco?.level?.()>=1||RAEcology.level()>=1||L.hasRoom('hookah_roof'),
  nodes:{
  arrive:{env:'roof',actors:{left:'rich',right:'bllad33'},title:'THE ROOF',
   enter:A=>{RARelations.meet('bllad33','A21');},
   lines:A=>{const first=(RARelations.get('bllad33')?.memories||[]).includes('a21_first');
    return [S('bllad33','you got a roof and a hookah. that\'s all a man needs.'),
     ...(first?[N('another night on the roof with bllad33.')]:[E('bllad33','he is already sitting there when you arrive. he does not say how he got up.'),S('bllad33','freshman year, university of michigan. i lived on a floor with eleven guys. ten of them are dead now.'),R('…what?'),S('bllad33','different story.')]),
     ...kevinCameo()];},
   next:'company'},
  company:{lines:[N('who else is coming through?')],
   choices:[{label:'JUST BLLAD33',fx:A=>A.set('co','bllad33'),next:'hang'},{label:'INVITE TRISTAN',fx:A=>{A.set('co','tristan');RARelations.meet('tristan','A21');},next:'hang'},{label:'INVITE THE HOMIES',fx:A=>A.set('co','homies'),next:'hang'}]},
  hang:{lines:A=>{const l=[S('bllad33','my brother hilt doesn\'t play.'),R('play what?'),S('bllad33','anything.')];
    if(A.vars.co==='tristan')l.push(N('tristan asks bllad33 if he\'s ever seen a ghost. bllad33 says yes, twice, and does not elaborate.'));
    if(A.vars.co==='homies')l.push(N('tunde asks bllad33 what he actually hunts. bllad33 looks at the moon and does not answer.'));
    return l;},next:'minigame'},
  minigame:{minigame:{id:'hookah',params:A=>({company:'BLLAD33',dateName:'bllad33',song:RARadio?.current?.()||'MONTANA'}),next:(A,r)=>{A.set('score',r?.score||0);return 'jump';}}},
  jump:{lines:[N('bllad33 stands up, walks to the edge, and steps off without a word.'),N('a moment later, from the street: a car alarm goes off, then stops.'),R('he could\'ve took the stairs.')],
   enter:A=>{RARelations.add('bllad33',6,{reason:'hookah roof'});RAParties.earn('nod_harder');RALife.addProp('prop_umich_pennant');RALife.setFlag('hiltWarned',true);RARelations.memory('bllad33','a21_first');},
   next:'end'},
  end:{end:{outcome:'done',memory:{text:'hookah on the roof with bllad33',lane:'people',quality:1},
   receipt:{caption:'a umich pennant, from a man who never says why he has it.'},
   home:['rich','he jumped off a roof like it was nothing. noted.',{vp:true}]}}
 }});
 RACastle.ROOMS;RAPlaces.define([{id:'castle:roof',hidden:true,adventure:'HOOKAH'}]);

 // ============================================================================================
 // A22 — THE CITY IS TALKING. VampGram posts escalate with RAEcology.level(). Thresholds are
 // provisional/sealed: always read the current level, never a raw pressure number.
 // ============================================================================================
 (function(){
  const POSTS=[
   {level:0,id:'city0',handle:'vampgram.local',text:'quiet week in LA. probably nothing.',likes:200},
   {level:1,id:'city1',handle:'vampgram.local',text:'anyone else seeing more bats than usual? lol',likes:1400},
   {level:2,id:'city2',handle:'vampgram.local',text:'ok the bat thing is not a joke anymore',likes:5200},
   {level:2,id:'city2b',handle:'hunter_watch_la',text:'sightings up on sunset. stay sharp out there.',likes:3100},
   {level:3,id:'city3',handle:'vampgram.local',text:'a girl from silver lake stopped posting three days ago. her friends are asking questions nobody wants to answer.',likes:9800}
  ];
  RAClock.onWake('a22-city-talking',65,({info})=>{
   const lvl=RAEcology.level();const seenKey=`a22:lvl${lvl}`;
   if(RALife.flag(seenKey))return;RALife.setFlag(seenKey,true);
   const pool=POSTS.filter(p=>p.level<=lvl);const post=pool[pool.length-1];if(post)window.RAVampGram?.post?.({id:`${post.id}:${info.day}`,handle:post.handle,text:post.text,likes:post.likes});
   if(lvl>=3&&!RALife.flag('a22ConvertedStoppedPosting')){RALife.setFlag('a22ConvertedStoppedPosting',true);window.RAVampGram?.post?.({id:`a22:stopped:${info.day}`,handle:'silverlake_sara',text:'…',likes:60});}
  });
 })();

 // ============================================================================================
 // A23 — HILT DOESN'T PLAY (GUIDED). Triggers after A21 (HOOKAH) once RAEcology.level()>=2.
 // Hilt arrives somewhere comfortable, Rich loses without a speech, cash taken, no penalty text.
 // ============================================================================================
 D({id:'A23',title:'HILT DOESN\'T PLAY',lane:'combat',memoryType:'combat',start:'arrive',nodes:{
  arrive:{env:A=>RALife.hasRoom('party_hall')&&RALife.flag('partyNight')?'throne':'bedroom',actors:{mid:'rich'},title:'HE DOESN\'T KNOCK',
   lines:[N('the door was locked. it does not matter.'),E('hilt','a very large man in a windbreaker is standing where a wall used to have room for one.'),S('hilt','you\'re rich alucard.'),R('…yeah?'),S('hilt','my brother told me about you.')],
   enter:A=>{RARelations.meet('hilt','A23');},next:'fight'},
  fight:{fight:{enemy:'hilt',params:{env:A=>A.vars.env||'bedroom',noPenalty:true,intro:'HILT DOESN\'T PLAY.'},win:'take',lose:'take',spared:'take'}},
  take:{lines:[N('however it went, hilt is still standing when it\'s over.'),N('he goes through your pockets, takes a stack, and does not count it.'),R('you gonna say something cool?'),S('hilt','no.')],
   enter:A=>{const cash=RALife.money();const cut=Math.round(cash*.25);RALife.addMoney(-cut);A.set('cut',cut);RALife.setFlag('hiltTook',{day:RALife.today().day,amount:cut});RALife.light('chaos',1,'a23:hilt');},
   next:'leave'},
  leave:{lines:[N('he leaves the way he came, which is unclear, since the door is still locked.')],next:'end'},
  end:{end:{outcome:'lost',memory:A=>({text:`hilt took ${RALife.fmt(A.vars.cut||0)} and left without a speech`,lane:'combat',quality:1.3}),
   receipt:A=>({id:'hilt',caption:`hilt took ${RALife.fmt(A.vars.cut||0)}. no speech.`}),nightEnder:true,
   home:['rich','he really didn\'t say anything cool.',{vp:true}]}}
 },legend:true});
 RAWakeTriggers.define([{adventure:'A23',priority:70,when:L=>L.done('HOOKAH')&&RAEcology.level()>=2&&!L.done('A23')}]);
 RAClock.onWake('a23-bllad33-text',72,({info})=>{
  const t=RALife.flag('hiltTook');if(!t||t.day!==info.day-1||RALife.flag('a23TextSent'))return;
  RALife.setFlag('a23TextSent',true);RALife.text('bllad33','BLLAD33','…sorry.',{id:`bllad33:hilt:${info.day}`});
 });
 // A23R — optional rematch, later.
 D({id:'A23R',title:'HILT, AGAIN',lane:'combat',memoryType:'combat',available:L=>L.done('A23'),start:'arrive',nodes:{
  arrive:{env:'throne',actors:{mid:'rich',right:'hilt'},title:'HE\'S BACK',
   lines:[N('hilt again. same windbreaker. this time he says one sentence before the fight.'),S('hilt','round two.')],next:'fight'},
  fight:{fight:{enemy:'hilt_rematch',params:{env:'throne',intro:'HILT, AGAIN.'},win:'win',lose:'lose',spared:'win'}},
  win:{lines:[N('hilt goes down. he lies there for a second, then starts laughing. it is the first time.'),S('hilt','…okay. okay. that was good.')],
   enter:A=>{RALife.addMoney(40000);RARelations.setFlag('bllad33','sawHiltLaugh',true);},next:'end'},
  lose:{lines:[N('same result, smaller number. he takes less this time. maybe out of respect.')],
   enter:A=>{const cash=RALife.money();RALife.addMoney(-Math.round(cash*.1));},next:'end'},
  end:{end:{outcome:A=>A.vars.fight==='lose'?'lost':'won',memory:{text:'the hilt rematch',lane:'combat'},
   home:A=>A.vars.fight==='win'?['rich','he laughed. i made hilt laugh.',{vp:true}]:null}}
 }});

 // ============================================================================================
 // A24/'ARMORY' — Deacon Brass behind a church, "guns and grace", Gun Weaving explained. Shop for
 // guns except TRIPLE K-KRATOS (dev only). HOLY BABY DRAKE in a glass case, $180K. Place: 'armory'.
 // ============================================================================================
 D({id:'A24',title:'GUNS AND GRACE',lane:'combat',memoryType:'combat',available:L=>L.flag('armoryKnown')&&!L.done('A24'),start:'arrive',nodes:{
  arrive:{env:'armory',actors:{left:'rich',right:'deacon_brass'},title:'BEHIND THE CHURCH',
   enter:A=>{RARelations.meet('deacon_brass','A24');},
   lines:[N('a door behind the church that should not exist. deacon brass is polishing a shotgun with a communion cloth.'),S('deacon_brass','guns and grace, son. one keeps you alive. the other keeps you honest.'),R('and this is which one?')],next:'explain'},
  explain:{lines:[S('deacon_brass','gun weaving. you fire and move in the same breath, same as the old ways. every gun on this wall does something the blood can\'t.'),N('in a glass case, lit like an altar: the HOLY BABY DRAKE. $180,000.')],next:'end'},
  end:{end:{outcome:'known',memory:{text:'found the armory behind the church',lane:'combat',quality:1},
   receipt:{caption:'guns and grace. deacon brass keeps both.'},
   home:['rich','a church with a gun shop in the back. of course.',{vp:true}]}}
 }});
 D({id:'ARMORY',title:'THE ARMORY',lane:'combat',memoryType:'combat',repeatable:true,available:L=>L.flag('armoryKnown'),start:'shop',nodes:{
  shop:{env:'armory',actors:{left:'rich',right:'deacon_brass'},title:'THE ARMORY',
   lines:A=>[N(A.vars.bought?`${RALife.fmt(RALife.money())} left. deacon brass nods.`:'the wall of guns. deacon brass watches, hands folded.'),...kevinCameo()],
   choices:A=>[...Object.values(RACombatData.GUNS).filter(g=>!g.dev).map(g=>({label:`${g.label}${RALife.hasGun(g.id)?' (OWNED)':''}`,sub:RALife.fmt(g.price),when:()=>!RALife.hasGun(g.id)&&RALife.money()>=g.price,fx:X=>{if(RALife.addGun(g.id)){RALife.spend(g.price);X.set('bought',(X.vars.bought||0)+1);}},next:'shop'})),{label:'THAT\'S ENOUGH GRACE FOR TODAY',next:'out'}]},
  out:{end:{outcome:A=>A.vars.bought?'bought':'browsed',memory:A=>({text:A.vars.bought?'bought a gun at the armory':'looked at guns at the armory',lane:'combat',quality:A.vars.bought?1:.4}),
   home:A=>A.vars.bought?['rich','guns and grace.',{vp:true}]:null}}
 }});
 RAPlaces.define([{id:'armory',label:'THE ARMORY',sub:'BEHIND THE CHURCH',adventure:L=>L.flag('armoryKnown')?(L.done('A24')?'ARMORY':'A24'):null,order:40}]);

 // ============================================================================================
 // A25 — NIGHTSHADE'S SÉANCE. Hotel ballroom. One spell per visit (hex/veil/seance/ringer), only
 // if Rich brings gift_flowers. Spell added to learnedMoves + magic.
 // ============================================================================================
 D({id:'A25',title:'NIGHTSHADE\'S SÉANCE',lane:'combat',memoryType:'combat',repeatable:true,start:'arrive',nodes:{
  arrive:{env:'ballroom',actors:{left:'rich'},title:'THE EMPTY BALLROOM',
   lines:A=>{const met=RARelations.met('nightshade');const has=RALife.count('gift_flowers')>0;
    return [N(met?'the ballroom is empty except for her, standing exactly where you left her.':'a hotel ballroom nobody has booked in a decade. dust sheets over everything. one chandelier, still lit.'),
     ...(met?[]:[E('nightshade','a translucent woman in violet turns to face you before you\'ve made a sound.'),S('nightshade','you brought nothing.'),R('i didn\'t know i needed to.')]),
     ...(has?[S('nightshade','…flowers. how quaint.')]:[S('nightshade','come back when you bring something.')])];},
   enter:A=>{RARelations.meet('nightshade','A25');},
   next:A=>RALife.count('gift_flowers')>0?'spell':'end'},
  spell:{lines:[N('she looks at the flowers for a long time before taking them.')],
   choices:[{label:'HEX',sub:'WEAKEN',fx:X=>X.set('spell','hex'),next:'cast'},{label:'VIOLET VEIL',sub:'BLOCK',fx:X=>X.set('spell','veil'),next:'cast'},
    {label:'SÉANCE',sub:'DOT',fx:X=>X.set('spell','seance'),next:'cast'},{label:'DEAD RINGER',sub:'STUN A BOSS',fx:X=>X.set('spell','ringer'),next:'cast'}]},
  cast:{lines:A=>[N(`she teaches you ${RACombatData.MOVES[A.vars.spell]?.label||'a spell'}.`),S('nightshade','one per visit. that is how it works.')],
   enter:A=>{RALife.consume('gift_flowers');learnMove(A.vars.spell,{magic:true});RARelations.add('nightshade',6,{reason:'brought flowers'});},next:'end'},
  end:{end:{outcome:A=>A.vars.spell||'empty-handed',memory:A=>({text:A.vars.spell?`learned ${RACombatData.MOVES[A.vars.spell].label.toLowerCase()} from nightshade`:'visited nightshade with nothing to give',lane:'combat',quality:A.vars.spell?1.2:.3}),
   home:A=>A.vars.spell?['rich','magic. actual magic.',{vp:true}]:null}}
 }});
 RAPlaces.define([{id:'ballroom',label:'THE HOTEL BALLROOM',sub:'NIGHTSHADE',adventure:'A25',order:45},
  {id:'florist',label:'THE FLORIST ON SUNSET',sub:'GIFTS',go:async api=>{await RAAdventureScene.begin('SHOP',{vars:{store:'florist'}});return true;}}]);

 // ============================================================================================
 // A26 — CASTLE PARTY #1 (nightEnder). PLAN via sequential choices → SURFACE narration → ESCALATE
 // beats → RESOLVE (VampGram decides reputation). Then repeatable 'HOST' for later parties.
 // ============================================================================================
 function partyPlan(nextNode){return {
  guests:{lines:[N('who\'s on the list?')],
   choices:A=>{const known=RARelations.known({dateable:true}).slice(0,4);const list=known.length?known:[{id:'kiki'},{id:'moonie'}];
    return list.map(p=>({label:`INVITE ${(RABtfPeople.get(p.id)?.name||p.id).toUpperCase()}`,fx:X=>X.set('guests',[...(X.vars.guests||[]),p.id]),next:'guests'})).concat([{label:'THAT\'S THE LIST',next:'song'}]);}},
  song:{lines:[N('castle song?')],choices:A=>[...(RARadio.owned().length?RARadio.owned().map(t=>({label:t.title,fx:X=>X.set('song',t.id),next:'drinks'})):[]),{label:'NO MUSIC. JUST VIBES.',fx:X=>X.set('song',null),next:'drinks'}]},
  drinks:{lines:[N('what\'s the bar looking like?')],
   choices:[{label:'$500 · BEER AND VIBES',when:()=>RALife.money()>=500,fx:X=>{RALife.spend(500);X.set('tier','cheap');},next:'door'},
    {label:'$5,000 · OPEN BAR',when:()=>RALife.money()>=5000,fx:X=>{RALife.spend(5000);X.set('tier','mid');},next:'door'},
    {label:'$25,000 · SOMETHING RIDICULOUS',when:()=>RALife.money()>=25000,fx:X=>{RALife.spend(25000);X.set('tier','extra');},next:'door'}]},
  door:{lines:[N('who\'s on the door?')],
   choices:[{label:'TUNDE',fx:X=>X.set('door','tunde'),next:'theme'},{label:'DRE',fx:X=>X.set('door','dre'),next:'theme'},
    ...(RALife.flag('coffeRogue')?[]:[{label:'COFFE',fx:X=>X.set('door','coffe'),next:'theme'}])]},
  theme:{lines:[N('a theme?')],
   choices:A=>[{label:'NORMAL',fx:X=>X.set('theme','normal'),next:nextNode},{label:'BLACK TIE',fx:X=>X.set('theme','black_tie'),next:nextNode},
    ...(RALife.hasRoom('dragon_roost')?[{label:'DRAGON NIGHT',fx:X=>X.set('theme','dragon'),next:nextNode}]:[])]}
 };}
 function partyRun(){return {
  surface:{env:A=>(A.vars.tier==='extra'||(A.vars.guests||[]).length>=3)?'party_hall_packed':'party_hall',actors:{left:'rich'},
   title:A=>A.vars.theme==='black_tie'?'BLACK TIE. PACKED.':A.vars.theme==='dragon'?'DRAGON NIGHT.':'THE PARTY HALL',
   lines:A=>{const big=(A.vars.tier==='extra'||(A.vars.guests||[]).length>=3);const out=[N(big?'the party hall is packed. the bass is doing structural damage.':'a solid turnout. music, drinks, not a disaster yet.')];
    if(A.vars.song)out.push(N(`${RARadio.TRACKS.find(t=>t.id===A.vars.song)?.title||'the song'} is on repeat and everyone knows the words.`));
    if(A.vars.door==='coffe')out.push(N('coffe is letting in people who very clearly were not invited.'));
    return out;},next:'behavior'},
  behavior:{lines:[N('the room needs you.')],choices:A=>RAParties.choices({fallback:{reaction:'the crowd is into it.',score:2}},'escalate1')},
  escalate1:{lines:A=>{const guests=A.vars.guests||[];const out=[N(A.vars.lastReaction||'the room reacts.')];
    if(guests.length>=2)out.push(N(`${(RABtfPeople.get(guests[0])?.name||'someone').toLowerCase()} and ${(RABtfPeople.get(guests[1])?.name||'someone else').toLowerCase()} are both acting like they\'re the main character tonight. this will not end quietly.`));
    else out.push(N('mazda is somewhere in the rafters. you can hear the wings.'));
    return out;},next:'escalate2'},
  escalate2:{lines:[N('a guy near the drinks table says something to a woman that makes her flinch.'),R('close your mouth.')],
   choices:[{label:'SAY IT AGAIN, LOUDER',fx:A=>{RALife.counter('lilSmack');RARelations.meet('lil_smack','A26');},next:'lilsmack'},{label:'LET IT GO',next:'resolve'}]},
  lilsmack:{lines:[N('the guy shrinks about a foot. this is the first time anyone has ever told him to close his mouth. it will not be the last.'),S('lil_smack','…noted.')],next:'resolve'},
  resolve:{lines:A=>[N('the sun is close. people start filtering out.')],
   enter:A=>{const big=A.vars.tier==='extra'||(A.vars.guests||[]).length>=3;const disaster=A.vars.door==='coffe'&&RALife.hash(RALife.today().day)%3===0;
    let outcome=disaster?'bad':big?'legendary':'good';A.set('partyOutcome',outcome);
    const gain=outcome==='legendary'?150:outcome==='good'?40:-30;RALife.addFollowers(gain);RALife.addPoints('clout',15);RALife.addPoints('rep',10);
    if(disaster)RALife.light('chaos',1,`party:${RALife.today().day}`);
    window.RAVampGram?.post?.({id:`party:${RALife.today().day}`,handle:'richalucard',text:outcome==='bad'?'…we are not talking about tonight.':outcome==='legendary'?'the castle. you had to be there.':'good one tonight.',likes:Math.max(50,gain*30)});
    RALife.setFlag('partyNight',RALife.today().day);RAClock.setHungover();
    for(const g of A.vars.guests||[])RARelations.add(g,4,{reason:'came to the party'});},
   next:'end'}
 };}
 D({id:'A26',title:'THE FIRST CASTLE PARTY',lane:'people',memoryType:'people',start:'guests',
  available:L=>L.hasRoom('party_hall'),
  nodes:{...partyPlan('surface'),...partyRun(),
  end:{end:{outcome:A=>A.vars.partyOutcome||'good',memory:A=>({text:`threw the first castle party — it went ${A.vars.partyOutcome||'fine'}`,lane:'people',quality:A.vars.partyOutcome==='legendary'?2:1}),
   receipt:A=>({id:'a26',caption:`the first castle party. ${A.vars.partyOutcome||'fine'}.`}),nightEnder:true,fx:A=>{RALife.setFlag('castlePartyHostingUnlocked',true);},
   home:['rich','the castle earned its name tonight.',{vp:true}]}}
 }});
 D({id:'HOST',title:'HOST A PARTY',lane:'people',memoryType:'people',repeatable:true,start:'guests',
  available:L=>L.done('A26'),
  nodes:{...partyPlan('surface'),...partyRun(),
  end:{end:{outcome:A=>A.vars.partyOutcome||'good',memory:A=>({text:`hosted a castle party — it went ${A.vars.partyOutcome||'fine'}`,lane:'people',quality:A.vars.partyOutcome==='legendary'?1.6:.8}),
   nightEnder:true,home:null}}
 }});
 RAPlaces.define([{id:'castle:party',hidden:true,adventure:L=>L.done('A26')?'HOST':'A26'}]);
 RAWakeTriggers.define([{adventure:'A27',priority:90,when:L=>{const pn=L.flag('partyNight');return pn===L.day-1&&!L.done('A27');}}]);

 // ============================================================================================
 // A27 — SIR BONESWORTH, THE HUNGOVER SKELETON. Morning after the first castle party.
 // ============================================================================================
 D({id:'A27',title:'SIR BONESWORTH',lane:'combat',memoryType:'combat',start:'arrive',nodes:{
  arrive:{env:'throne_party_mess',actors:{mid:'rich'},title:'THE MORNING AFTER',
   lines:[N('the throne room looks like a battlefield. cups everywhere. streamers in the chandelier.'),N('something is groaning under a pile of confetti near the throne.'),N('a full skeleton in rusted armor sits up, sword in hand, clearly hungover.'),S('bonesworth','…who threw this. i need to know who threw this.')],
   enter:A=>{RARelations.meet('bonesworth','A27');},next:'fight'},
  fight:{fight:{enemy:'bonesworth',params:{env:'throne_party_mess',intro:'SIR BONESWORTH, HUNGOVER. HE STILL SWINGS A SWORD.'},win:'outcome',lose:'outcome',spared:'outcome'}},
  outcome:{choices:A=>A.vars.fight==='win'?[{label:'HANG THE SWORD ON THE ARMORY WALL',next:'sword'},{label:'LET HIM STAY. HE\'S GOOD COMPANY, HUNGOVER.',next:'resident'}]:[{label:'LET HIM STAY. HE\'S GOOD COMPANY, HUNGOVER.',next:'resident'}]},
  sword:{lines:[N('bonesworth hands over the sword himself, almost relieved.'),S('bonesworth','put it somewhere people can see it. i earned that hangover.')],
   enter:A=>{RALife.setFlag('bonesworthSword',true);},next:'end'},
  resident:{lines:[N('bonesworth decides the crypt looks comfortable. he moves in without asking.'),S('bonesworth','i live here now. i think.')],
   enter:A=>{RALife.setFlag('bonesworthResident',true);},next:'end'},
  end:{end:{outcome:A=>A.vars.fight||'spared',memory:A=>({text:RALife.flag('bonesworthSword')?'sir bonesworth\'s sword is on the armory wall':'sir bonesworth moved into the crypt',lane:'combat',quality:1.2}),
   home:['rich','a hungover skeleton. of course there was a hungover skeleton.',{vp:true}]}}
 },legend:true});

 // ============================================================================================
 // A28 — MOONIE'S FULL MOON. A date with Moonie lands on a full-moon day. Chase through the
 // closed mall. Also: meet Moonie via the gym on Venice or the Grave.
 // ============================================================================================
 D({id:'MOONIE_MEET',title:'THE GYM AT VENICE',lane:'people',memoryType:'people',repeatable:true,start:'arrive',nodes:{
  arrive:{env:'venice',actors:{left:'rich'},title:'VENICE COURTS',
   lines:A=>{const met=RARelations.met('moonie');
    return met?[N('moonie is doing pull-ups on the rim.')]:[N('a woman is doing pull-ups on the basketball rim itself. the rim.'),E('moonie','she drops down, lands hard, grins with too many teeth.'),S('moonie','you gonna play or you gonna stare?'),R('bit of both.')];},
   enter:A=>{RARelations.meet('moonie','venice');},next:'end'},
  end:{end:{outcome:'met',memory:{text:'met moonie at the venice courts',lane:'people',quality:.6},
   home:['rich','she did a pull-up on the rim. the rim.',{vp:true}]}}
 }});
 D({id:'A28',title:'MOONIE\'S FULL MOON',lane:'combat',memoryType:'combat',start:'arrive',nodes:{
  arrive:{env:'food_court',actors:{left:'rich',right:'moonie'},title:'FULL MOON',
   lines:[N('the moon is enormous tonight. moonie keeps looking up at it between bites of your fries.'),S('moonie','…i feel weird.'),R('you good?'),S('moonie','no.')],next:'turn'},
  turn:{lines:[N('her eyes go yellow. she is on all fours before the table finishes tipping over. she runs.'),N('straight through the security gate, into the closed mall.')],next:'chase'},
  chase:{env:'grave_closed',actors:{left:'rich'},lines:[N('the grave, closed. dark storefronts. her breathing echoes off the tile.')],next:'fork'},
  fork:{choices:[{label:'RUN AFTER HER',next:'run'},{label:'TAME HER',sub:'STAY CALM. LET HER HIT YOU.',next:'fight'},{label:'BUY HER A STEAK',octopus:true,next:'steak'}]},
  run:{lines:[N('you chase her past a dark boughi-v and two turns you didn\'t know the mall had.')],next:'fight'},
  fight:{fight:{enemy:'werewolf',params:{env:'grave_closed',intro:'MOONIE, FULL MOON. SHE DOESN\'T MEAN IT.'},win:'after',lose:'after',spared:'after'}},
  steak:{lines:[N('the food court is closed. rich breaks in through the shutter for one (1) steak.'),N('she stops running to eat it.')],
   enter:A=>{A.set('fight','spared');},next:'after'},
  after:{lines:A=>[N(A.vars.fight==='tame'?'she stops mid-swing, breathing hard, and looks at you like she just woke up.':A.vars.fight==='spared'?'she sits down right there on the closed mall floor, embarrassed, chewing.':'she pins you, realizes what she\'s doing, and scrambles off, mortified.'),S('moonie','…did i do that. i did that.'),R('you did that.'),N('she is closer to you now than she was an hour ago. she keeps apologizing with her mouth full.')],
   enter:A=>{RAParties.earn('stomp');RARelations.add('moonie',10,{reason:'full moon'});RARelations.memory('moonie','a28_full_moon');},
   next:'end'},
  end:{end:{outcome:A=>A.vars.fight||'spared',memory:{text:'moonie\'s full moon chase through the closed grave',lane:'combat',quality:1.4},
   home:['rich','a werewolf ate my fries and then apologized about it.',{vp:true}]}}
 }});
 RAWakeTriggers.define([{adventure:'A28',priority:50,when:L=>L.info.fullMoon&&L.level('moonie')>=1&&!L.done('A28')}]);
 RAPlaces.define([{id:'venice',label:'VENICE COURTS',sub:'PULL-UPS ON THE RIM',adventure:'MOONIE_MEET',order:35}]);

 // ============================================================================================
 // VOL 5 W3 — A47 THE HAIRLESS VISITOR. First rain night after Day 12.
 // ============================================================================================
 D({id:'A47',title:'THE HAIRLESS VISITOR',lane:'home',memoryType:'home',start:'arrive',nodes:{
  arrive:{env:'bedroom',actors:{left:'rich'},title:'SOMETHING AT THE WINDOW',
   lines:[N('rain on the glass. something small taps the window from outside.'),N('rich sneezes. preemptively. he doesn\'t know why yet.'),N('a sphynx cat is sitting on the ledge, soaked, staring in.')],next:'let'},
  let:{choices:[{label:'LET HER IN',next:'in'},{label:'…LET HER IN, OBVIOUSLY',next:'in'}]},
  in:{lines:[N('no hair anywhere on her. she walks in like she owns the place, shakes off exactly once, and sits directly on the warmest spot in the room.'),R('a-a-a-CHOO. …worth it.')],
   enter:A=>{RAState.patch('life.ownership.cat',{name:'EGUSI'});RALife.addProp('prop_cat_bed');},next:'end'},
  end:{end:{outcome:'stayed',memory:{text:'a hairless cat let herself into the castle during a rainstorm',lane:'home',quality:1.2},
   receipt:{caption:'a cat. no hair. allergic anyway. worth it.'},
   home:['rich','i\'m allergic and i don\'t care. she stays.',{vp:true}]}}
 }});
 RAWakeTriggers.define([{adventure:'A47',priority:60,when:L=>L.day>12&&L.info.rain&&!L.life.ownership.cat&&!L.done('A47')}]);

 // ============================================================================================
 // A49 — ROOKOKO'S SHOW. The last painting is Rich on the Powder Springs curb.
 // ============================================================================================
 D({id:'A49',title:'ROOKOKO\'S SHOW',lane:'people',memoryType:'people',start:'arrive',nodes:{
  arrive:{env:'gallery',actors:{left:'rich',right:'rookoko'},title:'ROOKOKO\'S GALLERY · ARTS DISTRICT',
   enter:A=>{RARelations.meet('rookoko','A49');},
   lines:[N('a small opening. wine nobody is drinking. rookoko walks you down the row personally.')],next:'walk'},
  walk:{lines:[N('canvas after canvas of la at night — the grave, the castle, a rave you recognize.'),N('the last one stops you cold: a curb, a bag, a kid who looks exactly like you, powder springs, georgia painted small in the corner.'),S('rookoko','that one\'s not for sale. unless you want it to be.'),R('…how did you even know about that.'),S('rookoko','i paint what\'s true. i don\'t ask how i know.')],next:'buy'},
  buy:{choices:[{label:'BUY IT ($40,000)',when:()=>RALife.money()>=40000,fx:A=>{RALife.spend(40000);A.set('bought',true);RALife.addProp('prop_rookoko_painting');},next:'end'},{label:'LEAVE IT ON THE WALL',next:'end'}]},
  end:{end:{outcome:A=>A.vars.bought?'bought':'left',memory:A=>({text:A.vars.bought?'bought the powder springs painting':'saw the powder springs painting and left it',lane:'people',quality:A.vars.bought?1.6:.8}),
   receipt:A=>A.vars.bought?{id:'a49',caption:'the curb, painted. $40,000 to own your own beginning.'}:null,
   home:A=>A.vars.bought?['rich','he painted the curb. he painted where i started.',{vp:true}]:null}}
 },legend:true});
 D({id:'GALLERY',title:"ROOKOKO'S GALLERY",lane:'people',memoryType:'people',repeatable:true,available:L=>L.done('A49'),start:'look',nodes:{
  look:{env:'gallery',actors:{left:'rich',right:'rookoko'},lines:A=>[N(RALife.hasProp('prop_rookoko_painting')?'the curb painting hangs at the castle now. rookoko has new work up here every time.':'rookoko is always painting something new.'),...kevinCameo()],end:{outcome:'visited',memory:{text:'back at rookoko\'s gallery',lane:'people',quality:.3}}}}});
 RAPlaces.define([{id:'gallery',label:"ROOKOKO'S GALLERY",sub:'ARTS DISTRICT',adventure:L=>L.done('A49')?'GALLERY':'A49',order:50}]);

 // ============================================================================================
 // A50 — LAN NIGHT AT TRISTAN'S. Civ "one more turn", XCOM 95% miss, League argument. Leaves at
 // sunrise. Rich [VP] reply to "one more turn?"
 // ============================================================================================
 D({id:'A50',title:'LAN NIGHT',lane:'people',memoryType:'people',start:'arrive',nodes:{
  arrive:{env:'lan_night',actors:{left:'rich',right:'tristan'},title:"TRISTAN'S · 4 A.M.",
   enter:A=>{RARelations.meet('tristan','A50');},
   lines:[N('three monitors, one dead pizza box, tristan mid-rant.'),S('tristan','ONE MORE TURN. i just need one more turn.')],next:'civ'},
  civ:{lines:[N('he takes the turn. he does not stop taking turns.'),R('one more turn?'),S('tristan','ONE MORE TURN.')],next:'xcom'},
  xcom:{lines:[N('a 95% shot on xcom whiffs completely. tristan screams at the monitor like it owes him rent.'),S('tristan','NINETY-FIVE PERCENT. NINETY. FIVE.')],next:'league'},
  league:{lines:[N('someone in league says something in all caps. tristan mutes his mic and argues with the screen anyway.')],next:'sunrise'},
  sunrise:{lines:[N('the window goes grey, then pink. tristan doesn\'t notice until his character starts glowing from the sunrise filter.'),S('tristan','…oh. i should sleep.')],
   enter:A=>{RARelations.add('tristan',6,{reason:'lan night'});},next:'end'},
  end:{end:{outcome:'stayed',memory:{text:'lan night at tristan\'s until sunrise',lane:'people',quality:1},
   home:['rich','one more turn. every time. forever.',{vp:true}]}}
 },legend:true});

 // ============================================================================================
 // A51 — CANCIÓN NIGHT. Chained directly from TACOS on rain nights. Minigame 'bars' pool spanish.
 // ============================================================================================
 D({id:'A51',title:'CANCIÓN NIGHT',lane:'people',memoryType:'people',start:'sing',nodes:{
  sing:{env:'taco_truck',actors:{left:'rich',right:'don_chuy'},title:"DON CHUY'S · RAIN",
   lines:[N('the rain doesn\'t stop the radio. don chuy turns it up instead.'),S('don_chuy','¡vecino! you know this one?'),R('not even a little.')],next:'bars'},
  bars:{minigame:{id:'bars',params:A=>({pool:'spanish',partner:'DON CHUY'}),next:(A,r)=>{A.set('score',r?.score||0);return 'after';}}},
  after:{lines:[N('you get maybe two words right. don chuy does not care. he hands you a sixth taco you didn\'t order.'),S('don_chuy','six. for the effort.')],
   enter:A=>{RARelations.add('don_chuy',4,{reason:'cancion night'});},next:'end'},
  end:{end:{outcome:'sang',memory:{text:"sang along with don chuy in the rain, six tacos deep",lane:'people',quality:1},
   home:['rich','i don\'t speak spanish but i speak six tacos.',{vp:true}]}}
 },legend:true});

 // ============================================================================================
 // CASTLE ROOMS: KITCHEN + MOVIE ROOM + ROOF (Mazda visit).
 // ============================================================================================
 D({id:'KITCHEN',title:'THE CASTLE KITCHEN',lane:'home',memoryType:'home',repeatable:true,start:'pick',nodes:{
  pick:{env:'kitchen',actors:{left:'rich'},title:'THE CASTLE KITCHEN',lines:A=>[N('pots, cubes, a dragon somewhere upstairs who can smell all of it.'),...kevinCameo()],
   choices:A=>{const dr=RALife.dragon();const canCube=dr&&['young','majestic'].includes(dr.stage)&&RALife.count('maggi')>0&&(RALife.today().day-(dr.lastCubeDay||0))>=7;
    return [{label:'PRACTICE JOLLOF',next:'practice'},...(canCube?[{label:'MAKE A DRAGON MAGGI CUBE',sub:'CONSUMES 1 SEASONING CUBE · ONCE PER ~7 SLEEPS',fx:X=>{RALife.consume('maggi');RALife.addItem('maggi_dragon_crumble',3,{cap:9});const next={...dr,lastCubeDay:RALife.today().day};RAState.patch('life.ownership.dragon',next);X.set('cubed',true);},next:'cubed'}]:[]),{label:'LEAVE IT',next:'end'}];}},
  practice:{minigame:{id:'jollof',params:A=>({mode:'practice'}),next:(A,r)=>{A.set('score',r?.score||0);return 'end';}}},
  cubed:{lines:[N('mazda, upstairs, makes a sound that can only be described as delighted.'),N('you have three dragon maggi crumbles now. peking naija just got interesting.')],next:'end'},
  end:{end:{outcome:A=>A.vars.cubed?'cubed':A.vars.score!=null?'practiced':'left',memory:A=>({text:A.vars.cubed?'made dragon maggi cubes in the castle kitchen':'practiced jollof in the castle kitchen',lane:'home',quality:A.vars.cubed?1:.4})}}
 }});
 D({id:'MOVIE',title:'THE MOVIE ROOM',lane:'home',memoryType:'home',repeatable:true,start:'who',nodes:{
  who:{env:'movie_room',actors:{left:'rich'},title:'THE MOVIE ROOM',lines:[N('projector, real seats, a hoop nobody used tonight.')],
   choices:A=>{const dateable=RARelations.known({dateable:true});return [...dateable.slice(0,1).map(p=>({label:`MOVIE NIGHT WITH ${(RABtfPeople.get(p.id)?.name||p.id).toUpperCase()}`,fx:X=>X.set('who',p.id),next:'pick'})),{label:'CREW WATCH PARTY',fx:X=>X.set('who','crew'),next:'pick'}];}},
  pick:{lines:[N('what\'s playing?')],choices:[{label:'"BLOOD & BOUGHIES"',fx:X=>X.set('film','BLOOD & BOUGHIES'),next:'react'},{label:'"THE LAST CASTLE ON MELROSE"',fx:X=>X.set('film','THE LAST CASTLE ON MELROSE'),next:'react'},{label:'"TWO STEP FOREVER"',fx:X=>X.set('film','TWO STEP FOREVER'),next:'react'}]},
  react:{lines:A=>{if(A.vars.who==='crew')return [N(`the crew picks apart ${A.vars.film} scene by scene. it gets loud.`)];
    const name=(RABtfPeople.get(A.vars.who)?.name||'she').toLowerCase();return [N(`${name} reacts to every twist in ${A.vars.film} out loud, right on time.`),R('you\'ve seen this before, haven\'t you.'),S(A.vars.who,'…maybe.')];},
   enter:A=>{if(A.vars.who!=='crew')RARelations.add(A.vars.who,4,{reason:'movie night'});},next:'end'},
  end:{end:{outcome:'watched',memory:A=>({text:A.vars.who==='crew'?'movie night with the crew':`movie night with ${(RABtfPeople.get(A.vars.who)?.name||'her').toLowerCase()}`,lane:'home',quality:.8})}}
 }});
 D({id:'ROOST',title:'THE DRAGON ROOST',lane:'home',memoryType:'home',repeatable:true,start:'look',nodes:{
  look:{env:'roof',actors:null,lines:A=>{const dr=RALife.dragon();return [N(dr?.stage==='majestic'?'mazda is on the roost, wings half open, watching the city like she owns it.':dr?'mazda is curled up on the roost, still growing into herself.':'the roost is empty. nothing to watch it grow into yet.'),...(dr?.stage==='majestic'?[R('just fly away.'),N('she looks at you like that was always the plan.')]:[])];},
   end:{outcome:'visited',memory:{text:'visited mazda on the roost',lane:'home',quality:.4}}}}});
 RAPlaces.define([{id:'castle:kitchen',hidden:true,adventure:'KITCHEN'},{id:'castle:movie',hidden:true,adventure:'MOVIE'},{id:'castle:roost',hidden:true,adventure:'ROOST'}]);

 // ============================================================================================
 // A57 — OFFICER NODD SERIES. 10-second moment on a pending stop. 5th: one word. 10th: a picture.
 // ============================================================================================
 D({id:'A57',title:'OFFICER NODD',lane:'people',memoryType:'people',repeatable:true,start:'stop',nodes:{
  stop:{env:'street_night',actors:{left:'rich',right:'officer_nodd'},title:'PULLED OVER',
   enter:A=>{RARelations.meet('officer_nodd','A57');const n=RALife.counter('noddStops');A.set('n',n);},
   lines:A=>{const n=A.vars.n;const lines=[N('officer nodd walks up, looks at rich for a long second, and nods.')];
    if(n===5)lines.push(S('officer_nodd','…drive safe.'));else if(n>=10)lines.push(S('officer_nodd','can i get a picture?'));else lines.push(N('he says nothing. he never says anything.'));
    return lines;},next:'leave'},
  leave:{lines:A=>A.vars.n>=10?[N('he takes the picture, nods once more, and walks back to his cruiser like it never happened.')]:[N('ten seconds later he\'s back in the cruiser. the stop is over.')],
   enter:A=>{RALife.setFlag('noddPending',false);},next:'end'},
  end:{end:{outcome:'nodded',memory:A=>({text:A.vars.n>=10?'officer nodd asked for a picture':A.vars.n===5?'officer nodd said "drive safe"':'officer nodd. the nod. nothing else.',lane:'people',quality:A.vars.n>=10?1:.3})}}
 }});
 RAWakeTriggers.define([{adventure:'A57',priority:30,when:L=>!!L.flag('noddPending')}]);
})();
