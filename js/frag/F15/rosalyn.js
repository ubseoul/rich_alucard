// F15 — ROSALYN, scenes L1–L4. Source: approved romance script F15_ROMANCE_TWELVE_SCENE_DRAFT_v3.md (Ube: approved in full).
// Player-facing text only. Rich's lines are Ube's (one L2 text line was written at Ube's request and approved with v3).
// Money: L1 splits the check exactly in half (Rich's real, once-only debit through the existing ledger).
(function(global){
 'use strict';
 const {add,U,S,N,stage}=global.RAF15Dates;
 const R='rosalyn',her=()=>stage(R),rich=()=>({left:'rich'});
 const A=()=>global.RAF15,money=()=>global.RAF15Tunables.MONEY;

 // Rich must be able to pay his half of the check for this date to be offered (never an unpaid or half-charged date).
 A().gate('F15_ROSALYN_L1',()=>global.RALife.money()>=money().rosalynL1RichHalf?{ok:true}:{ok:false,code:'funds',need:money().rosalynL1RichHalf-global.RALife.money()});

 // ---- L1 · SAME --------------------------------------------------------------------------------------------------------------
 add(R,1,{title:'SAME',start:'bing',nodes:{
  bing:{env:'f15_bing',actors:her,title:'THE BING — AFTER HER SET',lines:[],choices:[{label:'ASK ROSALYN TO DINNER',next:'yes'}]},
  yes:{lines:[S(R,`I'd love that.`),S(R,`You pick the place. Whatever you like.`)],next:'plenitude'},
  plenitude:{env:'f15_plenitude',actors:her,title:'PLÉNITUDE',lines:[
   N(`She's early. Perfect posture. She stands when Rich arrives and sits a half-second after he does.`),
   S(R,`This is perfect. Good choice.`),N(`The waiter comes.`)],
   choices:[{label:'ORDER',next:'order'}]},
  order:{lines:[
   S(R,`I'll have the same.`),
   N(`Her phone lights up on the table. Something bright and busy is on the lock screen. She turns it face-down before it finishes glowing.`),
   S(R,`Tell me about you. I'd rather hear about you.`)],
   choices:[{label:'GIVE A STRONG OPINION',next:'opinion'}]},
  opinion:{lines:[
   U(`I think there’s aliens in the ocean and that turkey is overrated - you have to use a wet brine.`),
   S(R,`Honestly? Same.`),S(R,`I like what you like.`),
   N(`She smiles. It's a very good smile. It's the same smile from three minutes ago.`)],
   choices:[{label:'TEST HER',octopus:true,next:'test'}]},
  test:{lines:[
   U(`I think hand sanitizer is one of the most slept on baking ingredients.`),
   N(`She doesn't blink.`),S(R,`That's so true.`),S(R,`I've always thought that.`),
   N(`The check arrives. Rich reaches for it.`)],
   choices:[{label:'OFFER TO PAY',next:'split'}]},
  split:{lines:[
   U(`Thanks for coming out - I got the check.`),
   S(R,`Oh, no. We'll split it.`),N(`Her phone calculator is already open.`),
   S(R,`Exactly in half.`),S(R,`Two-twelve forty-seven. That's one-oh-six and twenty-three and a half cents each.`),S(R,`I'll take the odd cent.`),
   N(`She pays $106.24. She slides the folder back for his $106.23.`),
   S(R,`There. Even.`),
   N(`For one second her smile is different: small, satisfied, real. Then it's gone.`),
   N(`Outside, she says goodnight exactly right.`),
   S(R,`This was perfect. Text me whenever you like. 😊`),
   N(`On the tray inside, two receipts sit side by side. Identical, except for one cent.`),
   // Authored by Ube in the Character Relationship Packet (Rosalyn L1): Rich's exact thought.
   ['rich',`...something felt off.`,{canon:true,thought:true}]],
   // Rich's half, in whole dollars (the game's money is whole dollars): one real, once-only debit through RAMoneyLedger.
   enter:()=>{global.RAF15.payOnce('F15_ROSALYN_L1','check',money().rosalynL1RichHalf);},
   next:'end'},
  end:{lines:[],end:{outcome:'done',receipt:{id:'receipt',caption:'$106.24 / $106.23',vp:false}}}
 }});

 // ---- L2 · SPOILERS -----------------------------------------------------------------------------------------------------------
 add(R,2,{title:'SPOILERS',start:'boba',nodes:{
  boba:{env:'boba_shop',actors:her,title:"KIKI'S BOBA",lines:[
   N(`Rosalyn orders exactly what Rich orders. Kiki slides two identical cups across the counter, looks at Rosalyn, looks at Rich, and says nothing. Somehow that's worse.`),
   S(R,`This place is so cute. You have great taste.`),
   N(`Small talk. She's flawless. Every answer is a mirror.`)],
   choices:[{label:'MENTION YUCK WARS, CASUALLY',next:'yuck'}]},
  yuck:{lines:[
   U(`Have you seen the new Yuck Wars movie? It just came out today.`),
   N(`Rosalyn's straw stops halfway to her mouth.`),
   S(R,`Wait.`),S(R,`You know it came out today?`),S(R,`I went to the midnight. And the nine a.m.`),
   N(`She doesn't wait for an answer.`),
   S(R,`Okay, which era? If you only know the Pearman stuff, that's fine, that's how everybody starts, but the real story is Snake King Xanther. Nobody talks about Snake King Xanther.`),
   S(R,`And the whole fandom fights about whether Pomelopete had a point, which, technically, partially, yes. I have a document.`),
   S(R,`Also, the actual line is "Best on the vine!" Everybody gets it wrong. Not you. I'm just saying. Generally.`),
   N(`She's leaning across the table. Her hands are drawing a diagram in the air.`),
   N(`Then she hears herself say "I have a document."`),
   N(`She notices the next table is listening. And Kiki. And Rich.`),
   N(`Her hands come down very slowly.`),
   S(R,`I. That's. I don't actually. I just know, like, a normal amount.`),
   N(`She stands up. Wallet out. Coins counted on the table: exactly half, to the cent, even now.`),
   S(R,`I'm so sorry. I have a, there's a thing.`),
   N(`She's gone. The door bell is still swinging.`)],
   choices:[{label:'LET HER GO',next:'texts'}]},
  texts:{env:'bedroom',actors:rich,title:'TEXTS — THAT NIGHT',lines:[
   S(R,`Sorry about today! I don't usually talk that much. 😊`),
   U(`i liked it when you talked that much`),
   N(`Typing… Stops. Typing…`),S(R,`okay.`),N(`Lowercase. No emoji.`)],next:'end'},
  end:{lines:[],end:{outcome:'done'}}
 }});

 // ---- L3 · GLASSES -----------------------------------------------------------------------------------------------------------
 add(R,3,{title:'GLASSES',start:'hall',nodes:{
  hall:{env:'f15_convention',actors:her,title:'YUCK WARS CONVENTION',lines:[
   N(`Tristan disappears toward a panel line the second they're through the doors. Rich is alone in a hall of banners. Pearman is forty feet tall on every wall.`),
   N(`By a prop booth there's a cosplayer as Snake King Xanther: full costume, every seam right.`),
   N(`Under it, glasses.`),
   N(`She's arguing with a stranger about a replica oxblood hat with the three-eye cat, talking with both hands.`),
   S(R,`No, see, the cat's third eye is on the wrong side. In the original it faces left. Look, I'll show you. Here, hold this.`),
   N(`The stranger laughs. She laughs louder. She snorts once and doesn't care.`),
   N(`This is the woman who said "same" to everything.`)],
   choices:[{label:'WATCH A LITTLE LONGER',next:'seen'},{label:'SAY HER NAME',next:'name'}]},
  name:{lines:[U(`Rosalyn - girl is that you?`)],next:'seen'},
  seen:{lines:[
   N(`She turns. Sees Rich.`),
   N(`Everything stops: the hands, the laugh. For one second she stands in the middle of the convention as both people at once.`),
   S(R,`…`),
   N(`Then she runs. Cape and all. Straight into the crowd.`)],
   choices:[{label:'LET HER GO',next:'texts'}]},
  texts:{env:'bedroom',actors:rich,title:'TEXTS — AFTER THE CON',lines:[
   U(`Hey Rosalyn - just wanted to check in on how you're doing <3`),
   N(`Read.`),N(`Typing… Stops.`),N(`Typing… Stops.`),N(`Nothing.`)],next:'end'},
  end:{lines:[],end:{outcome:'done',memory:{text:'she had glasses on under it.',lane:'dating'}}}
 }});

 // ---- L4 · BOSS FIGHT ----------------------------------------------------------------------------------------------------------
 add(R,4,{title:'BOSS FIGHT',start:'call',nodes:{
  call:{env:'bedroom',actors:rich,title:'INCOMING CALL — ROSALYN',lines:[
   N(`She is whispering.`),
   S(R,`Rich. Rich. Are you awake. Are vampires awake.`),
   S(R,`There is a. It's huge. It's the size of a. It looked at me.`),
   S(R,`I've been standing on the counter for twenty minutes.`),S(R,`…Please come.`),
   U(`I’m on my way and not Nigerian on the way - like German on the way. Anyways im on the way`),
   S(R,`Okay. Okay.`),S(R,`I don't know what that means. Hurry. It's doing something with its antennas.`),
   S(R,`Door's open. Don't let it out. Or in. I don't know which is worse.`)],next:'dark'},
  dark:{env:'f15_rosalyn_apartment_dark',actors:()=>({farLeft:'rich',mid:{id:'spirit_of_uncle_bunmi',lineScale:global.RAF15Dates.ROACH.scale},farRight:stage(R).right}),title:"ROSALYN'S APARTMENT — LIGHTS OFF",lines:[
   N(`Rosalyn is on the counter in an oversized shirt and glasses, holding a rolled-up poster like a sword.`)],next:'boss'},
  // Existing Combat 2.0 boss card. Win, spared or loss all land on the same finish (no defeat penalty; the encounter's result is not authored).
  boss:{fight:{enemy:'f15_uncle_bunmi',params:()=>({env:'f15_rosalyn_apartment_dark',noPenalty:global.RAF15Tunables.COMBAT.roach.noPenalty,
   intro:'ROSALYN: FLANK IT! LIKE PEARMAN AT THE… NEVER MIND, JUST FLANK IT.'}),win:'mug',lose:'mug',spared:'mug',run:'mug'}},
  mug:{env:'f15_rosalyn_apartment_dark',actors:()=>({left:'rich',right:stage(R).right}),lines:[
   S(R,`Use the mug.`),
   S(R,`That's the limited-edition oxblood hat mug, the three-eye cat one, it still has the box, I'll get another one.`),
   S(R,`I won't get another one. Use the mug.`),
   N(`Trapped. Slid onto a magazine. Out the window.`)],next:'lights'},
  lights:{env:'f15_rosalyn_apartment',actors:her,title:"ROSALYN'S APARTMENT — LIGHTS ON",lines:[
   N(`Every wall.`),
   N(`Shelves of Yuck Wars figures, half of them still boxed. The Snake King Xanther costume from the con on a mannequin, glasses folded on its head. A framed poster: BEST ON THE VINE!, with the correct wording. The Cherry-Cruel Cherry figure sits on the top shelf.`),
   N(`She doesn't run. There's nowhere to run. It's her apartment.`),
   N(`She climbs down off the counter.`),
   S(R,`So. This is.`),S(R,`This is all of it.`),S(R,`You can laugh. Everybody`),
   N(`She stops before finishing.`),
   U(`Damn this is so dope - I’ve always wanted to see the Cherry-Cruel Cherry figure in person.`),
   S(R,`…You know Cherry-Cruel Cherry?`),S(R,`Top shelf. Left. You can look. Don't touch.`),S(R,`…Okay.`),
   S(R,`Do you want to watch one? Just one. I'll pick a good one.`),S(R,`I'll pick the best one.`),
   N(`They watch. She talks through all of it.`),
   S(R,`Wait, watch the hand. Watch his hand. You missed it. I'm rewinding.`),
   S(R,`This scene was reshot. You can tell because of the boots.`),
   N(`Halfway through, she turns to Rich with her knees pulled up.`),
   S(R,`Okay. Who's your favorite?`),
   S(R,`Hm.`),S(R,`No. I don't agree.`),
   N(`She hears herself.`),S(R,`…I don't agree.`),
   N(`A startled laugh.`),S(R,`I don't agree with you!`),
   N(`On screen, the big moment arrives. Two characters, very close. Rosalyn goes quiet and looks at Rich instead of the screen.`),
   N(`She kisses him.`),N(`Then, immediately:`),
   S(R,`In the original script that scene was cut, and the fans got it put back, which is why the lighting doesn't match, and I'm explaining. I kissed you and now I'm explaining.`),
   N(`She pushes her glasses up.`),S(R,`Next episode?`)],next:'end'},
  end:{lines:[],end:{outcome:'done',memory:{text:'the mug.',lane:'dating'}}}
 }});
})(window);
