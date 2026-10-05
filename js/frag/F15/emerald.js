// F15 — EMERALD, scenes L1–L4. Source: approved romance script F15_ROMANCE_TWELVE_SCENE_DRAFT_v3.md (Ube: approved in full).
// Player-facing text only. Rich's lines are Ube's, verbatim. Rich never pays her family's bills; no line offers it.
// The recital song is referenced by TITLE ONLY: no lyrics, no recording. Emerald L1's cleaning is the accepted adventure
// choice-loop (pick the next task; finished tasks drop off the list) — no new chores system.
(function(global){
 'use strict';
 const {add,U,S,N,stage}=global.RAF15Dates;
 const R='emerald',her=()=>stage(R),rich=()=>({left:'rich'});
 const done=A=>A.get('done')||[];
 const task=(id,label,sub)=>A=>({label,sub,when:()=>!done(A).includes(id),hideLocked:true,fx:X=>X.set('done',[...done(X),id]),next:id});

 // ---- L1 · YOUR CASTLE, MY RULES ---------------------------------------------------------------------------------------------------
 add(R,1,{title:'YOUR CASTLE, MY RULES',start:'bing',nodes:{
  bing:{env:'f15_bing',actors:her,title:'THE BING — AFTER HER SET',lines:[
   N(`She stops at Rich's booth, still pulling a sweatshirt on, and holds up her phone. It shows a VampGram photo of a throne room after a party.`),
   S(R,`This is your castle?`),S(R,`Is that ketchup on the throne?`),
   S(R,`Okay. Saturday, nine a.m. I'm bringing gloves.`),S(R,`You're helping.`),
   S(R,`It's your castle. I'm not your maid. And this isn't a club thing, so don't tip me.`),
   N(`Before Rich can ask why:`),
   S(R,`I like a mess that ends. School and work never do. A floor ends.`)],
   choices:[{label:'SATURDAY, NINE A.M.',next:'throne'}]},
  throne:{env:'throne_party_mess',actors:her,title:"RICH'S CASTLE — THRONE ROOM · THE MORNING AFTER",lines:[
   N(`She stands in the doorway with gloves, a mop and three kinds of bags. She looks at the room for a long time.`),
   S(R,`Okay. I've seen worse.`),S(R,`…I have not seen worse.`),S(R,`Gloves. Bag. Go.`)],next:'tasks'},
  // pick the next task; finished tasks drop off the list; when none are left the loop falls through to `finished`
  tasks:{lines:[],choices:A=>[task('chair','THE THRONE')(A),task('floor','THE FLOOR')(A),task('trash','THE TRASH')(A)],next:'finished'},
  chair:{lines:[
   N(`Under the cushion: a cold wing, one shoe that isn't Rich's, and forty dollars.`),
   S(R,`Forty dollars. In the furniture.`),S(R,`You just leave money in chairs.`),
   N(`She holds it out to him without looking twice.`),
   S(R,`Take it. It's yours. I'm not doing this for that.`)],next:'tasks'},
  floor:{lines:[
   N(`She watches him mop for exactly four seconds.`),S(R,`No. Figure eights. Like this.`),
   N(`She takes the mop and shows him. Halfway through, she's humming, under her breath and on pitch. She notices Rich listening and stops.`),
   S(R,`What. Mopping has a tempo.`)],next:'tasks'},
  trash:{lines:[
   S(R,`Hold the bag open. Wider. Why does a man who owns a castle not own a broom?`),
   U(`I just realized now i dont have one lol.`),
   S(R,`You just realized. Now. Standing in this.`),S(R,`Wider.`)],next:'tasks'},
  finished:{lines:[
   N(`Finished. They sit on the throne-room steps. She peels her gloves off and stretches her claws.`),
   S(R,`You're better at this than you look.`),S(R,`…You're also worse at this than you look. Both are true.`),
   S(R,`Your posture's terrible, by the way. You lift with your back. You'll feel it tomorrow.`)],next:'kitchen'},
  kitchen:{env:'kitchen',actors:her,title:"RICH'S CASTLE — KITCHEN",lines:[],choices:[{label:'MAKE HER RAMEN',next:'cook'}]},
  cook:{lines:[N(`She's up before Rich reaches the stove.`),S(R,`I'll chop. Where are your…`)],choices:[{label:'MAKE HER SIT DOWN',next:'sit'}]},
  sit:{lines:[
   N(`She sits. She doesn't know what to do with her hands. She folds them, then unfolds them, then watches him cook like it's a procedure she's observing.`),
   S(R,`You cook like somebody who does it for money.`),
   N(`Ramen, Rich's way: Nigerian red stew for the broth, fried turkey on top.`),
   S(R,`This is not ramen.`),
   N(`She eats the first bite with her eyes closed.`),
   S(R,`…Okay. Okay.`),S(R,`It's ramen.`),
   N(`When she's done, she stands up with the bowl and heads for the sink.`)],
   choices:[{label:'TAKE THE BOWL FROM HER',next:'bowl'}]},
  bowl:{lines:[
   N(`Her hand stays on it a second, and then she lets go.`),
   S(R,`…Fine.`),S(R,`Kitchen's next week. Your kitchen is a crime scene too.`)],next:'end'},
  end:{lines:[],end:{outcome:'done',receipt:{id:'receipt',caption:'RAMEN ×1 — cooked by: Rich. bowl washed by: Rich (she tried).',vp:false}}}
 }});

 // ---- L2 · FLASHCARDS ----------------------------------------------------------------------------------------------------------------
 add(R,2,{title:'FLASHCARDS',start:'texts',nodes:{
  texts:{env:'bedroom',actors:rich,title:'TEXTS',lines:[
   S(R,`exam thursday. i need someone to quiz me who won't be nice about it.`),S(R,`your kitchen has good light.`)],next:'table'},
  table:{env:'kitchen',actors:her,title:"RICH'S CASTLE — KITCHEN TABLE",lines:[
   N(`A brick of flashcards, rubber-banded and color-coded. Biology, chemistry, anatomy.`),
   S(R,`Pre-med. Read the front. Don't help me.`),
   N(`Card: BRACHIAL PLEXUS`),
   S(R,`So close. So, so far from close.`),
   N(`She answers fast. Right, right, right. Then she misses one and puts her forehead on the table.`),
   S(R,`I knew that. Again.`),
   N(`She looks up at Rich, then squints.`),
   S(R,`You're squinting at the cards. When did you last get your eyes checked?`),
   N(`Her phone alarm goes off. The label reads: BABA — 7:00`),
   N(`She's standing before it finishes ringing.`),
   S(R,`Sorry. I have to. Every day.`),
   N(`She goes to the window and speaks Farsi. Rich doesn't know the words.`),
   N(`He can hear the voice, though. It's younger and louder. She laughs, rolls her eyes, and a few English words slip through: "exam," "Thursday," "fine, I'm fine."`),
   N(`She hangs up. Before she sits down, she opens her banking app.`),
   N(`TRANSFER SENT. She doesn't hide the screen. She just puts the phone face-down like it's done for the week.`)],
   choices:[{label:'ASK ABOUT THE CALL',next:'talk'},{label:'WAIT FOR HER TO BRING IT UP',next:'talk'}]},
  talk:{lines:[
   S(R,`My dad. Everybody back home.`),S(R,`They're counting on me.`),S(R,`It's not a sad thing. It's just a true thing.`),
   U(`Hey Emerald - you are enough okay, your family is lucky to have you but remember you are enough`),
   S(R,`…Thanks.`),S(R,`Okay. Next card. Don't go easy.`),
   N(`Card: LARYNX`),N(`She stops on it one beat too long.`),
   S(R,`Larynx. Voice box.`),N(`She sets it in the "done" pile.`),
   N(`At the door, she's tired in a good way.`),
   S(R,`If I pass Thursday, I'm making you something. Not buying. Making.`),
   U(`Good bye Emmie.`),
   S(R,`Emmie.`),S(R,`…Okay. That one you can keep.`),S(R,`Go to bed. You look like a vampire.`),S(R,`…That joke was free. I'm allowed one.`)],next:'end'},
  end:{lines:[],end:{outcome:'done'}}
 }});

 // ---- L3 · THE MUSIC ------------------------------------------------------------------------------------------------------------------
 const visited=A=>A.get('searched')||[];
 const stop=(id,label)=>A=>({label,when:()=>!visited(A).includes(id),hideLocked:true,fx:X=>X.set('searched',[...visited(X),id]),next:id});
 add(R,3,{title:'THE MUSIC',start:'call',nodes:{
  call:{env:'bedroom',actors:rich,title:'INCOMING CALL — EMERALD',lines:[
   N(`She is out of breath.`),
   S(R,`Rich. I lost my music.`),
   S(R,`My sheet music. For the recital. It's a small thing, it's just a—`),
   S(R,`It's not small. My notes are on it, months of them. I can't print notes.`),
   S(R,`I'm outside an exam. It starts in ten minutes. I can't leave.`),
   S(R,`Can you…`),S(R,`I'm about to say "never mind."`),S(R,`I'm not going to say never mind.`),S(R,`Rich. I need help.`),
   U(`Got it - on my way.`),
   S(R,`Okay. Okay. Today I was at the library, then Waffle Haven, then the Bing for bingo night before my shift.`),
   S(R,`Text me either way. Even if it's nothing.`)],next:'search'},
  // The first two stops (any order) come up empty; the music is under the bingo cage, so the Bing opens once both are checked.
  search:{lines:[],choices:A=>[stop('library','THE LIBRARY')(A),stop('waffle','WAFFLE HAVEN')(A),
   {label:'THE BING — BINGO NIGHT',when:()=>visited(A).length>=2,hideLocked:true,next:'bing'}],next:'bing'},
  library:{env:'f15_library',actors:rich,lines:[N(`Her usual table. Somebody else's highlighters. No music.`),S(R,`ok`)],next:'search'},
  waffle:{env:'waffle_haven',actors:rich,lines:[N(`Her booth. A cold coffee ring. No music.`),S(R,`ok.`),S(R,`ok thank you`),
   N(`Each reply is shorter than the last. She's typing between exam questions.`)],next:'search'},
  bing:{env:'f15_bing',actors:()=>({left:'rich',right:{id:'granny_bing'}}),title:'THE BING — BINGO NIGHT',lines:[
   N(`Lights up. Folding tables on the runway. Granny Bing is calling numbers into the DJ mic.`),
   N(`On the caller's table, tucked under the ball cage where nothing can spill on it: a folder of sheet music.`),
   S('granny_bing',`Somebody's been breathing on this for months. Pencil marks. That's a singer's copy.`),S('granny_bing',`Those shoes, though.`),
   N(`Rich opens the folder. "I Am What I Am," from La Cage aux Folles. The margins are full of her handwriting: breath marks, crossed-out notes, a word circled three times in Farsi.`),
   U(`hey emerald -got the folder thank god.`),
   N(`Read. No reply. She's still in the exam.`)],next:'steps'},
  steps:{env:'f15_exam_hall',actors:her,title:'OUTSIDE THE EXAM HALL — AFTER',lines:[
   N(`She comes out of the doors already looking for him. She sees the folder in his hand.`),
   N(`She doesn't cry. She sits down on the steps all at once, like her strings were cut, and laughs one short laugh at the ground.`),
   N(`Rich hands it over. She holds it flat against her chest with both arms.`),
   S(R,`I spent the whole exam thinking about breath marks.`),
   S(R,`I think I passed. I don't know, and I don't care right now. I'll care tomorrow.`)],
   choices:[{label:'SIT DOWN NEXT TO HER',next:'sit'}]},
  sit:{lines:[S(R,`I don't do that. Ask.`),S(R,`…Thank you.`)],choices:[{label:'ASK ABOUT THE MUSIC',next:'music'}]},
  music:{lines:[
   S(R,`It's nothing. It's a hobby. It's…`),N(`She looks at the folder.`),
   S(R,`…It's not nothing.`),S(R,`The recital is soon. I'd…`),N(`She stops herself.`),S(R,`Never mind. Not yet.`)],next:'end'},
  end:{lines:[],end:{outcome:'done',memory:{text:'found under the bingo cage.',lane:'dating'}}}
 }});

 // ---- L4 · RECITAL ---------------------------------------------------------------------------------------------------------------------
 add(R,4,{title:'RECITAL',start:'texts',nodes:{
  texts:{env:'bedroom',actors:rich,title:'TEXTS',lines:[
   N(`A photo of a printed recital program. Her name is on it, small, between two other names.`),
   S(R,`you don't have to come.`),N(`Typing…`),S(R,`…i want you to come.`)],next:'hall'},
  hall:{env:'f15_shrine',actors:her,title:'SHRINE AUDITORIUM',lines:[
   N(`A student recital in a hall built for thousands, mostly empty. She comes out in something she clearly picked herself, not a club outfit. She carries the folder Rich found and never opens it.`),
   N(`She sings "I Am What I Am." One small figure on a stage that big, and she fills it.`),
   N(`Her eyes close for the first line and open for the second. She doesn't look tired, or like she's working. She looks exactly where she meant to be.`),
   N(`Pre-med is her plan. This is the thing she loves.`),
   N(`Rich's hand drifts toward his pocket, the club reflex, and comes back empty. He claps instead.`)],
   choices:[{label:'APPLAUD',next:'outside'}]},
  outside:{env:'street_night',actors:her,title:'OUTSIDE — AFTER',lines:[
   N(`She comes out still buzzing, holding the folder with both hands.`),
   S(R,`Don't be nice. Was it okay?`),
   S(R,`Actually, don't answer that. I know it was okay. I felt it was okay.`),
   S(R,`Medicine is the plan. Medicine is the plan everybody can count on.`),S(R,`This one's just mine.`),
   U(`Emmie you deserve your dreams of your own okay - its a good plan but honestly - just be you, yo.`),
   N(`She's quiet for a long moment.`),
   S(R,`…Nobody's ever said that to me.`),S(R,`I don't know what to do with it.`),S(R,`Okay. I know one thing.`),S(R,`One thing for me.`),
   N(`She kisses him.`),
   U(`wow.`),
   N(`Her phone buzzes. BABA — 7:00. Every day.`),
   N(`She answers in Farsi, walking a few steps away. A few English words slip through: "Shrine," "I sang." Then, halfway through, he hears his own name.`),
   N(`She glances back at him, flustered, and turns away again.`),
   N(`She hangs up.`),
   S(R,`He asked who you were.`),S(R,`I told him.`),
   N(`She doesn't say what.`)],next:'end'},
  end:{lines:[],end:{outcome:'done',memory:{text:'she sang. nobody threw anything.',lane:'dating'}}}
 }});
})(window);
