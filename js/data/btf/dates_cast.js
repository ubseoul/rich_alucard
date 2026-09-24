(function(){
 // Per-woman date content for the rest of the cast (VOL 1 §9.4, VOL 2 cards). Loaded after dates.js.
 // Schema: see js/data/btf/dates.js header comment. Non-Rich lines are functional drafts pending HQ Story;
 // richLine[]/homeLine[] are [VP] (rendered through R() by the DATE adventure — write them as plain strings here).
 const D=(id,content)=>window.RADateContent.define(id,content);

 // ---------- FULL (10) ----------
 D('jdm_importer_daughter_001',{
  arrival:["she's under a car when you show up. she wipes her hands and doesn't apologize for it.","she brought a torque wrench to dinner. 'just in case.'","she's wearing your team's hoodie. she says it's for the oil stains."],
  asks:[
   {q:'ok be honest, what do you drive',a:{label:'WHATEVER IS FASTEST.',topic:'flex'},b:{label:"I DON'T. I FLY.",topic:'castle'},o:{label:'ASK HER TO TEACH YOU DOWNSHIFTING.',topic:'honest'}},
   {q:'you ever actually heel-toe or you just say that',a:{label:'I SAY THAT.',topic:'honest'},b:{label:"I'M A NATURAL.",topic:'flex'},o:{label:'DOWNSHIFT ON PURPOSE, WRONG, TO SEE HER FACE.',topic:'weird'}},
   {q:'what would you do with a car that nobody was watching you drive',a:{label:'SOMETHING STUPID.',topic:'honest'},b:{label:'THE SAME THING. LOUDER.',topic:'flex'},o:{label:'ASK WHAT SHE\'D DO.',topic:'listen'}}
  ],
  reads:{honest:true,listen:true,flex:false,castle:false,weird:true},
  likesIt:["she almost smiles. 'ok. that's not the worst answer.'","'finally. an honest one.'","she laughs, actual laugh, and hits your arm."],
  meh:["she checks the engine bay instead of answering.","'mmk, flex boy.'","she just starts talking about brake pads."],
  moments:['she critiques your downshift. then she says "again."','she lets you rev it once. once.','she teaches you the line through the last corner. you almost get it.'],
  richLine:['she said "again." i live for "again."','my downshift is getting good. she agrees, sort of.','one more lap and i think i love her.'],
  posts:['taught a client to heel-toe 🏎️','he almost got it','crest run, again'],
  giftRight:['a tradeya chain?? ok. you pay attention.'],giftWrong:["this doesn't go with anything i own. i'm keeping it anyway."],
  homeLine:['she said "again" and it sounded like a compliment.','cammile does not miss.','i need to buy a faster car. for her, obviously.']
 });
 D('mazda_human',{
  arrival:["she's already circling the parking lot before you get there. dragon energy, mazda body.","she brought her own straw. she still tries yours.","she's vibrating a little. good vibrating."],
  asks:[
   {q:'what do you actually want tonight',a:{label:'TO SPOIL YOU.',topic:'flex'},b:{label:"WHATEVER'S FUN.",topic:'present'},o:{label:'ASK HER TO PICK EVERYTHING.',topic:'listen'}},
   {q:'are you even listening to me or thinking about the sky again',a:{label:"I'M LISTENING.",topic:'honest'},b:{label:'BOTH. ALWAYS BOTH.',topic:'honest'},o:{label:'LOOK AT THE SKY WITH HER.',topic:'weird'}},
   {q:'if you could eat one thing forever what would it be',a:{label:'MAGGI CUBES. RAW.',topic:'weird'},b:{label:'JOLLOF.',topic:'present'},o:{label:'ASK HER THE SAME QUESTION.',topic:'listen'}}
  ],
  reads:{flex:false,present:true,honest:true,listen:true,weird:true},
  likesIt:['she does a little spin. actual spin.','she chews the straw. that means she\'s happy.','she beams. the whole table gets warmer.'],
  meh:['she stares at you like you said something in another language.','she looks past you at a bird.','"...ok."'],
  moments:['she tries to eat the straw.','she almost breathes fire when she laughs. almost.','she asks to see the sky from higher up. you both just look at it.'],
  richLine:['she tried to eat the straw again. i love that for her.','blueberry mazda got a little warm. good sign.','i think she likes me. i think i like that.'],
  posts:['🐉🧋','the sky was RIGHT there','she blushed and the table got hot, literally'],
  giftRight:['maggi bread?? she cries a single, warm tear.'],giftWrong:['she eats it anyway. she eats everything anyway.'],
  homeLine:['she almost breathed fire. i almost proposed.','mazda is a whole vibe.','i want to see the sky with her again.']
 });
 D('nneka',{
  arrival:['she\'s already got an opinion about the restaurant before you park.','she brought her own pepper. "just in case."','she\'s dressed like she\'s about to win an argument. she is.'],
  asks:[
   {q:'ADEOLUWA. why do you even go by "rich"',a:{label:'IT\'S CATCHIER.',topic:'flex'},b:{label:'MY MOM STILL CALLS ME ADEOLUWA.',topic:'honest'},o:{label:'ASK HER TO SAY THE FULL NAME AGAIN.',topic:'weird'}},
   {q:'be honest. whose jollof is better, mine or yours',a:{label:'MINE. OBVIOUSLY.',topic:'flex'},b:{label:'YOURS. I KNOW WHEN TO FOLD.',topic:'honest'},o:{label:'REFUSE TO ANSWER ON PRINCIPLE.',topic:'weird'}},
   {q:'am i right or am i right',a:{label:'YOU\'RE RIGHT.',topic:'honest'},b:{label:'I NEED MORE EVIDENCE.',topic:'flex'},o:{label:'ARGUE ANYWAY. FOR SPORT.',topic:'weird'}}
  ],
  reads:{honest:true,weird:true,flex:false,listen:false},
  likesIt:['"finally. a man who knows when he\'s wrong."','she laughs and calls you Adeoluwa again, softer this time.','"see? this is why i like you."'],
  meh:['she rolls her eyes so hard you hear it.','"mm. sure, oga."','she keeps eating and does not respond.'],
  moments:['she tells you the jollof here is wrong. she finishes the plate.','she wins an argument about seasoning. she gloats for ten straight minutes.','she calls you Adeoluwa in front of the waiter. the waiter respects it.'],
  richLine:['she called me Adeoluwa and my whole chest did something.','i lost the argument. i\'d lose it again.','nneka is always right. i checked.'],
  posts:['won another argument 💅','ADEOLUWA thinks he can cook','she right tho'],
  giftRight:['maggi cubes?? "ok. you might survive this."'],giftWrong:['"i\'m not mad. i\'m just disappointed." she keeps it.'],
  homeLine:['she\'s always right. it\'s annoying. it\'s perfect.','ADEOLUWA. she really said my whole government.','nneka would destroy me in an argument and i\'d thank her.']
 });
 D('pinky',{
  arrival:['she\'s already filming something. you\'re probably in it.','she\'s got a new fit and she knows the angle.','she\'s doing donuts in the parking lot on a scooter, somehow.'],
  asks:[
   {q:'you ever actually drift or is that all vibes',a:{label:'ALL VIBES, HONESTLY.',topic:'honest'},b:{label:'I INVENTED DRIFTING.',topic:'flex'},o:{label:'CHALLENGE HER TO A RACE. RIGHT NOW.',topic:'weird'}},
   {q:'what\'s your worst spin story',a:{label:'TELL HER THE REAL ONE.',topic:'honest'},b:{label:'DENY EVERYTHING.',topic:'flex'},o:{label:'RE-ENACT IT. BADLY.',topic:'weird'}},
   {q:'be real, do you even care what people think',a:{label:'NOT ANYMORE.',topic:'flex'},b:{label:'SOMETIMES. LATE AT NIGHT.',topic:'honest'},o:{label:'ASK IF SHE CARES.',topic:'listen'}}
  ],
  reads:{honest:true,weird:true,listen:true,flex:false},
  likesIt:['she cackles and gets it on camera.','"THAT\'S the content. thank you."','she posts it before you even finish the sentence.'],
  meh:['she keeps filming something else.','"mmk." she\'s already looking at her phone.','she doesn\'t even laugh. bad sign.'],
  moments:['she laughs at your worst spin and posts your best one.','she teaches you a donut. you both nearly hit a curb. worth it.','she films the whole date and somehow you look cool in all of it.'],
  richLine:['she posted my best spin. never my worst. she has taste.','pinky almost got us both arrested. i respect the commitment.','she made me look cool on camera. that\'s love, probably.'],
  posts:['he tried 😭 (posting the good one anyway)','date night, drift night','he\'s cute when he\'s scared'],
  giftRight:['tradeya-hoes?? she\'s already filming the unboxing.'],giftWrong:['she posts it as a joke. the joke gets 40k likes.'],
  homeLine:['pinky only posts my good angles. i\'m never leaving.','she almost hit a curb for me. that\'s romance.','she\'s a menace and i\'m into it.']
 });
 D('moonie',{
  arrival:['she\'s already eyeing the menu like it owes her money.','her hair is doing something wild tonight. she doesn\'t care.','she\'s starving. she says it like a warning.'],
  asks:[
   {q:'you scared of dogs?',a:{label:'A LITTLE.',topic:'honest'},b:{label:'NEVER.',topic:'flex'},o:{label:'ASK IF SHE\'S A DOG PERSON. SPECIFICALLY.',topic:'weird'}},
   {q:'you gonna finish that?',a:{label:'YEAH, ACTUALLY.',topic:'honest'},b:{label:'TAKE IT.',topic:'present'},o:{label:'RACE HER FOR IT.',topic:'weird'}},
   {q:'what do you turn into when nobody\'s watching',a:{label:'SOMETHING WORSE THAN A VAMPIRE.',topic:'flex'},b:{label:'JUST TIRED.',topic:'honest'},o:{label:'ASK HER TO SHOW YOU FIRST.',topic:'listen'}}
  ],
  reads:{honest:true,present:true,listen:true,flex:false},
  likesIt:['she grins with teeth. all of them.','"good answer. i respect a man who eats."','she nudges your plate closer. she\'s sharing. rare.'],
  meh:['she\'s already not listening. she\'s looking at your food.','"boring."','she just eats faster.'],
  moments:['she eats your steak too. she apologizes with her mouth full.','under a full moon she gets loud, happy-loud, and it\'s contagious.','she races you to the food court doors. she wins. she always wins.'],
  richLine:['she ate my steak and my heart, in that order.','moonie doesn\'t hold back. neither do i, apparently.','she\'s louder than the whole food court. i like it.'],
  posts:['he shared his food 🐺','date + dinner + his dinner too','full moon, full plate'],
  giftRight:['pet crypt gift?? she\'s already gnawing on it, affectionately.'],giftWrong:['she eats it. it wasn\'t food. she eats it anyway.'],
  homeLine:['she ate half my plate and somehow it was romantic.','moonie is a lot. i want more of it.','full moon nights hit different with her.']
 });
 D('kaede',{
  arrival:['she\'s already sitting still, watching the water, before you get there.','she nods once. that\'s the whole greeting.','she brought her own tea. she offers you none of it. that\'s affection.'],
  asks:[
   {q:'…',a:{label:'SAY NOTHING BACK.',topic:'listen'},b:{label:'FILL THE SILENCE.',topic:'flex'},o:{label:'SIT WITH HER IN IT.',topic:'weird'}},
   {q:'what are you actually afraid of',a:{label:'BEING FORGOTTEN.',topic:'honest'},b:{label:'NOTHING.',topic:'flex'},o:{label:'ASK HER THE SAME THING BACK, QUIETLY.',topic:'listen'}},
   {q:'do you ever get tired of being loud',a:{label:'ALL THE TIME.',topic:'honest'},b:{label:'NEVER.',topic:'flex'},o:{label:'GO QUIET FOR A WHOLE MINUTE, ON PURPOSE.',topic:'weird'}}
  ],
  reads:{listen:true,honest:true,weird:true,flex:false},
  likesIt:['she looks at you for a long second. that\'s a lot, from her.','the corner of her mouth moves. that\'s a smile.','she says nothing, but she stays closer.'],
  meh:['she looks back at the water.','she\'s quiet in a different way now. the bad quiet.','she checks her phone. first time all night.'],
  moments:['she says nothing for ten minutes. it is the best ten minutes.','the steam rises and neither of you says anything and it\'s enough.','she points at the sky once and you both just look.'],
  richLine:['she didn\'t say anything for ten minutes. i\'ve never been more at peace.','kaede makes silence feel like a whole conversation.','i think she said more with her eyebrows than i said all night.'],
  posts:['🌙 (no caption needed)','quiet night','.'],
  giftRight:['krada?? she holds it like it\'s fragile. it isn\'t. she is, a little.'],giftWrong:['she nods once, sets it down carefully, says nothing.'],
  homeLine:['kaede said nothing and it was the loudest date of my life.','i miss the quiet already.','she looked at the sky like it owed her something.']
 });
 D('wispa',{
  arrival:['the café lights are off. she\'s already floating by the closed sign, waiting.','she rearranged the chairs. she does that when she\'s excited.','she\'s translucent-bright tonight. good mood.'],
  asks:[
   {q:'what was it like. before.',a:{label:'TELL HER YOU DON\'T KNOW EITHER.',topic:'honest'},b:{label:'MAKE SOMETHING UP.',topic:'flex'},o:{label:'ASK HER TO TELL YOU INSTEAD.',topic:'listen'}},
   {q:'is the internet still full of cats',a:{label:'MORE THAN EVER.',topic:'honest'},b:{label:'IT\'S ALL CASTLES NOW.',topic:'flex'},o:{label:'SHOW HER A CAT VIDEO. RIGHT NOW.',topic:'weird'}},
   {q:'do you think i\'m still... here? really here?',a:{label:'YOU\'RE HERE. I SEE YOU.',topic:'honest'},b:{label:'DEFINITELY.',topic:'flex'},o:{label:'REACH OUT. SEE WHAT HAPPENS.',topic:'weird'}}
  ],
  reads:{honest:true,listen:true,weird:true,flex:false},
  likesIt:['she flickers, brighter. that\'s her laughing.','"...thank you for saying that."','she drifts a little closer. as close as she can get.'],
  meh:['she dims. just a little.','"oh. ok."','the lights flicker, once, sadly.'],
  moments:['she asks what the internet is like now. you show her. she is disappointed.','she moves a cup an inch to the left. she says it\'s "for the vibe."','she tells you what the café used to sound like, before. you both go quiet.'],
  richLine:['she flickered brighter when i talked. i\'m never leaving this café.','wispa asked about cats and i showed her forty minutes of cats.','she\'s been alone a long time. i don\'t want her to be, tonight.'],
  posts:["can't post this one (she doesn't show up on camera). trust me though 🖤",'the café, after close','she moved a cup. it meant everything'],
  giftRight:['a cassette?? she spins it like a record, delighted, useless, perfect.'],giftWrong:['she can\'t hold it. it clatters. she laughs anyway.'],
  homeLine:['wispa can\'t leave the café. i keep coming back anyway.','she\'s been alone in there a long time.','i showed her cat videos for forty minutes. worth it.']
 });
 D('tasha',{
  arrival:['she\'s already got a verse ready. she tests it on you.','she\'s filming the whole entrance. content is content.','she brought her own mic. she brings it everywhere.'],
  asks:[
   {q:'you write your own stuff or nah',a:{label:'ALL ME.',topic:'flex'},b:{label:'SOMETIMES A GHOST HELPS.',topic:'honest'},o:{label:'FREESTYLE RIGHT THERE.',topic:'weird'}},
   {q:'be honest, was my verse fire or was it FIRE fire',a:{label:'FIRE FIRE.',topic:'flex'},b:{label:'IT WAS GOOD, NOT PERFECT.',topic:'honest'},o:{label:'RAP IT BACK TO HER, WRONG ON PURPOSE.',topic:'weird'}},
   {q:'what do you actually want from all this. the fame, the castle, all of it',a:{label:'EVERYTHING.',topic:'flex'},b:{label:"I DON'T FULLY KNOW YET.",topic:'honest'},o:{label:'ASK HER WHAT SHE WANTS.',topic:'listen'}}
  ],
  reads:{flex:true,honest:true,weird:true,listen:false},
  likesIt:['"THAT\'S what I\'m talking about."','she claps, actual claps, genuinely impressed.','she\'s already filming you for the story.'],
  meh:['she keeps scrolling her own page.','"mmk."','she cuts you off to talk about her own single.'],
  moments:['she raps your verse back to you. she knows the ad-libs.','she coaches you through a whole eight bars. you\'re actually decent.','she plays an unreleased track just for you. just this once, she says.'],
  richLine:['tasha knows my ad-libs better than i do.','she played me something unreleased. i felt chosen.','she said "fire fire" and my week is made.'],
  posts:['he tried to freestyle 😭 (it was actually not bad)','studio date','future collab? maybe. 👀'],
  giftRight:['tradeya-hoes?? "ok this is actually fire, thank you."'],giftWrong:['she posts it as a joke, it does numbers, she keeps it anyway.'],
  homeLine:['tasha knew my whole verse. that\'s a love language.','she played me something nobody else has heard.','i want to be on a track with her. and also just, her.']
 });
 D('june',{
  arrival:['she\'s got a comb behind her ear before you even sit down.','she\'s already looking at your hairline. professionally.','she\'s off the clock and it still shows in how put-together she is.'],
  asks:[
   {q:'who does your hair. actually.',a:{label:'MYSELF. BADLY.',topic:'honest'},b:{label:'A PROFESSIONAL.',topic:'flex'},o:{label:'ASK HER TO FIX IT. RIGHT NOW.',topic:'weird'}},
   {q:'you ever sit still for anything',a:{label:'NEVER.',topic:'flex'},b:{label:'FOR YOU, MAYBE.',topic:'present'},o:{label:'SIT COMPLETELY STILL. TEST IT.',topic:'weird'}},
   {q:'what do you actually want. not the flex answer.',a:{label:'A QUIET LIFE, EVENTUALLY.',topic:'honest'},b:{label:'ALL OF IT, LOUDLY.',topic:'flex'},o:{label:'ASK WHAT SHE WANTS.',topic:'listen'}}
  ],
  reads:{honest:true,present:true,listen:true,flex:false},
  likesIt:['she smiles and keeps working on your hair anyway.','"there it is. the real one."','she laughs, low, and doesn\'t stop touching your loc.'],
  meh:['she keeps working. she doesn\'t look up.','"mm-hm."','she checks her phone for the first time all night.'],
  moments:['she fixes one loc while you talk. she does not ask.','she shows you a new twist style. you let her try it. it\'s clean.','she does your whole head, for free, "just because." you don\'t argue.'],
  richLine:['she fixed my loc without asking. that\'s intimacy, actually.','june did my whole head for free. i\'m in trouble.','she touches my hair like she\'s known me a while.'],
  posts:['fixed a client\'s loc on the clock (he wasn\'t a client tonight tho)','new twist, on him','after hours 🖤'],
  giftRight:['duoqlo?? "comfortable AND cute. ok, fine, i like it."'],giftWrong:["she wears it once, out of politeness, then it's a house shirt."],
  homeLine:['june fixed my loc without asking. that\'s the whole relationship, right there.','after hours at the salon might be my favorite place now.','she touches my hair and i forget what i was saying.']
 });
 D('ms_patrice',{
  arrival:["she's mid-shift, one hand on her hip, already clocking every rich kid in the room.","she's off tonight, dressed for it, and she still checks the room like she's working.","she's got a to-go plate for you before you even order."],
  asks:[
   {q:'you ever worked a real shift in your life',a:{label:'NEVER. NOT ONE.',topic:'honest'},b:{label:'I OWN THE CASTLE THAT HIRES PEOPLE.',topic:'flex'},o:{label:'ASK HER TO TEACH YOU THE TRAY CARRY.',topic:'weird'}},
   {q:'who\'s the worst rich person you ever served',a:{label:'PROBABLY ME, HONESTLY.',topic:'honest'},b:{label:'DEFINITELY NOT ME.',topic:'flex'},o:{label:'GUESS. WRONG, ON PURPOSE.',topic:'weird'}},
   {q:'what do you actually want, patrice, not the tip',a:{label:'ASK HER TO GO FIRST.',topic:'listen'},b:{label:'SAY THE MONEY QUESTION FIRST.',topic:'flex'},o:{label:'ANSWER FOR HER. WRONG.',topic:'weird'}}
  ],
  reads:{honest:true,listen:true,weird:true,flex:false},
  likesIt:['she cackles, a real one, and points a fork at you.','"ok. ok, you might be alright."','she leans back and actually relaxes for a second.'],
  meh:['she gives you the customer-service smile. the fake one.','"mm. sure, sugar."','she starts clearing plates that aren\'t even done.'],
  moments:['she roasts every rich person in the room. you fall for her a little.','she gives you the employee discount without being asked. she winks.','she tells you which regulars to avoid. it\'s half the guest list.'],
  spots:{waffle_haven:'she runs the whole floor without looking tired once. you watch her work. it\'s a whole show.',lennox:'she roasts a shopper\'s bag right in front of them. they laugh. she\'s right.'},
  richLine:['she roasted a whole family and i took notes.','patrice gave me the discount without asking. i tipped double anyway.','she called out my whole outfit and i wore it like a compliment.'],
  posts:['he tipped double, smart man','waffle haven regulars, be warned','she\'s not wrong, ever'],
  giftRight:['maggi cubes?? "you been paying attention. good."'],giftWrong:["she puts it behind the register 'for later' and never brings it home."],
  homeLine:['patrice roasted the whole room and somehow it was the nicest thing anyone did for me.','she runs that floor like a throne room.','i want the employee discount forever, honestly.']
 });

 // ---------- MEET+1 (11) ----------
 D('marisol',{
  arrival:["she's already rearranging the popcorn bowl by size when you walk in."],
  asks:[{q:'do you ever just let things be messy',a:{label:'NEVER. I ALPHABETIZE MY GUNS.',topic:'flex'},b:{label:'ALL THE TIME. IT\'S FINE. IT\'S FINE.',topic:'honest'},o:{label:'MESS UP THE POPCORN ON PURPOSE.',topic:'weird'}}],
  reads:{honest:true,flex:false,weird:true},
  likesIt:['she almost smiles, then fixes the popcorn again anyway.'],meh:['she quietly re-sorts everything you touched.'],
  moments:['she reorganizes the popcorn by size.'],
  richLine:['she fixed the popcorn three times. i counted. i loved it.'],
  posts:['movie night, everything in its place'],
  giftRight:['duoqlo?? she folds it before she even says thanks.'],giftWrong:['she refolds the wrapping paper before throwing it away.'],
  homeLine:['marisol alphabetized my snack drawer. i didn\'t ask. i\'m not mad.']
 });
 D('duchess',{
  arrival:['she arrives like the room was already hers. it was.'],
  asks:[{q:'child. what do you actually have to offer me',a:{label:'EVERYTHING. EVENTUALLY.',topic:'flex'},b:{label:'HONESTLY? I\'M STILL FIGURING THAT OUT.',topic:'honest'},o:{label:'ASK HER WHAT SHE\'S LOOKING FOR.',topic:'listen'}}],
  reads:{honest:true,listen:true,flex:false},
  likesIt:['"…hm. that was not the worst answer I\'ve heard."'],meh:['she looks at you the way you look at a bug.'],
  moments:['she calls you "child." then she asks your opinion. she actually listens to the answer.'],
  richLine:['she called me "child" and somehow it felt like an achievement.'],
  posts:[],
  giftRight:['krada?? she inspects it for a full minute before nodding, once.'],giftWrong:['she says nothing. that is worse than anything she could say.'],
  homeLine:['the duchess asked my opinion. i\'m still thinking about what to say.']
 });
 D('nightshade',{
  arrival:['she drifts in already mid-thought, violet light trailing behind her.'],
  asks:[{q:'do you believe in curses',a:{label:'I OWN A CASTLE. I BELIEVE IN EVERYTHING.',topic:'flex'},b:{label:'I THINK I MIGHT BE ONE.',topic:'honest'},o:{label:'ASK HER TO CURSE SOMETHING FOR FUN.',topic:'weird'}}],
  reads:{honest:true,weird:true,flex:false},
  likesIt:['the violet light around her flickers, warmer.'],meh:['the light dims. she says nothing.'],
  moments:['she looks at the flowers for a long time.'],
  richLine:['she looked at the flowers longer than she looked at me. fair.'],
  posts:['🔮'],
  giftRight:['flowers?? she goes completely still, moved.'],giftWrong:['she sets them down without a word. the room gets colder.'],
  homeLine:['nightshade looked at those flowers like they meant something. maybe they did.']
 });
 D('emberly',{
  arrival:['she\'s leaning on a warm hood, already glowing a little from the drive over.'],
  asks:[{q:'you ever just let loose. fully.',a:{label:'ALL THE TIME.',topic:'flex'},b:{label:'NOT ENOUGH, HONESTLY.',topic:'honest'},o:{label:'ASK HER TO SHOW YOU HOW.',topic:'listen'}}],
  reads:{honest:true,listen:true,flex:false},
  likesIt:['she warms up, literally, and grins.'],meh:['she cools off a little. quiet.'],
  moments:['the car seat is warm for an hour after she gets out.'],
  richLine:['she left my whole car warm. i didn\'t want to turn the engine on.'],
  posts:['🔥 date night'],
  giftRight:['dragon keef?? her eyes actually flicker, delighted.'],giftWrong:['she holds it politely, already cooling.'],
  homeLine:['emberly left the seat warm. i sat in it for ten extra minutes.']
 });
 D('jade',{
  arrival:['she\'s cataloguing the room before she even says hello.'],
  asks:[{q:'you a collector or a hoarder',a:{label:'COLLECTOR. THERE\'S A DIFFERENCE.',topic:'flex'},b:{label:'HONESTLY, PROBABLY BOTH.',topic:'honest'},o:{label:'ASK TO SEE HER HOARD.',topic:'weird'}}],
  reads:{honest:true,weird:true,flex:false},
  likesIt:['she actually laughs, a rare, treasured sound.'],meh:['she keeps counting something under her breath.'],
  moments:['she keeps the receipt. she keeps everything.'],
  richLine:['jade kept the receipt from our first date. i think that means something.'],
  posts:[],
  giftRight:['krada?? she adds it to a very specific pile, satisfied.'],giftWrong:['she keeps it anyway. she keeps everything.'],
  homeLine:['jade still has the receipt. i think i\'m part of the hoard now.']
 });
 D('lo',{
  arrival:['her arm is doing that thing again where it\'s slightly detached at the shoulder.'],
  asks:[{q:'does that hurt',a:{label:'A LITTLE. I\'M USED TO IT.',topic:'honest'},b:{label:'NOTHING HURTS ME.',topic:'flex'},o:{label:'OFFER TO HOLD IT BACK ON.',topic:'weird'}}],
  reads:{honest:true,weird:true,flex:false},
  likesIt:['she laughs, and her arm nearly falls off from the effort.'],meh:['she pulls her arm back and says nothing.'],
  moments:['her arm falls off. she apologizes. she keeps eating with the other one.'],
  richLine:['lo\'s arm fell off at brunch and she just kept eating. i respect the commitment.'],
  posts:['brunch got weird (affectionate)'],
  giftRight:['duoqlo?? she holds it with both hands, careful not to drop it, or her arm.'],giftWrong:['it slips out of her hand. neither of you mention it.'],
  homeLine:['lo\'s arm fell off twice and it was somehow one of the sweetest dates I\'ve had.']
 });
 D('brenda',{
  arrival:['she\'s got a folder with her. an actual folder. it has tabs.'],
  asks:[{q:'what\'s in the folder',a:{label:'DON\'T ASK. JUST ORDER FOOD.',topic:'flex'},b:{label:'ASK TO SEE IT. GENUINELY.',topic:'honest'},o:{label:'GUESS WHAT\'S IN IT. WRONG.',topic:'weird'}}],
  reads:{honest:true,weird:true,flex:false},
  likesIt:['she opens the folder like it\'s a love letter.'],meh:['she closes the folder. that\'s a bad sign.'],
  moments:['she has a spreadsheet about your castle. it is color-coded.'],
  richLine:['brenda has a whole spreadsheet on me. i\'ve never felt so understood.'],
  posts:[],
  giftRight:['krada?? she logs it. literally, in the spreadsheet.'],giftWrong:['she adds it to a "miscellaneous" tab.'],
  homeLine:['brenda\'s spreadsheet on my castle is color-coded. i asked for a copy.']
 });
 D('hina',{
  arrival:['she\'s already got a knife out. for the food. probably.'],
  asks:[{q:'you eat fast or slow',a:{label:'FASTEST IN THE CASTLE.',topic:'flex'},b:{label:'HONESTLY? PAINFULLY SLOW.',topic:'honest'},o:{label:'RACE HER TO FINISH.',topic:'weird'}}],
  reads:{honest:true,weird:true,flex:false},
  likesIt:['she starts a stopwatch anyway, delighted.'],meh:['she checks her watch and says nothing.'],
  moments:['she times how long you take to eat. you lose.'],
  richLine:['hina timed my whole dinner. i lost. i\'d lose again.'],
  posts:['he lost 😂'],
  giftRight:['krada?? she inspects it with the same precision as her knife work.'],giftWrong:['she sets it down and picks the knife back up.'],
  homeLine:['hina timed me eating dinner. i think about it more than i should.']
 });
 D('bunmi',{
  arrival:['she\'s already talking like you two go way back. maybe you do.'],
  asks:[{q:'do you remember me from before all this',a:{label:'HONESTLY, NOT REALLY.',topic:'honest'},b:{label:'OF COURSE. NEVER FORGOT.',topic:'flex'},o:{label:'ASK HER TO REMIND YOU.',topic:'listen'}}],
  reads:{honest:true,listen:true,flex:false},
  likesIt:['she laughs. "at least you\'re honest about it."'],meh:['"wow. ok. i remember EVERYTHING."'],
  moments:['she remembers what you ordered in 2019.'],
  richLine:['bunmi remembered my whole 2019 order. i don\'t remember 2019.'],
  posts:[],
  giftRight:['maggi cubes?? "ok, you actually know me. i see you."'],giftWrong:['she puts it in her bag, unbothered, unconvinced.'],
  homeLine:['bunmi remembers me from before i was anybody. that\'s worth something.']
 });
 D('velvet',{
  arrival:['she checks the ring light before she checks on you. every time.'],
  asks:[{q:'is this going on your page',a:{label:'EVERYTHING GOES ON MY PAGE.',topic:'flex'},b:{label:'ONLY IF IT\'S GOOD.',topic:'honest'},o:{label:'FILM IT YOURSELF FIRST.',topic:'weird'}}],
  reads:{honest:true,weird:true,flex:false},
  likesIt:['she finally puts the phone down. for a second.'],meh:['she keeps adjusting the ring light.'],
  moments:['she checks her ring light before she checks on you.'],
  richLine:['velvet checked the lighting before she checked on me. respect the hustle.'],
  posts:['date night, obviously filmed'],
  giftRight:['krada?? she films the unboxing immediately.'],giftWrong:['she films it anyway. the caption is savage.'],
  homeLine:['velvet filmed the whole date. i looked good in it, at least.']
 });
 D('anfeesa',{
  arrival:['she\'s behind the decks before you even find her in the crowd.'],
  asks:[{q:'you ever play a record just for one person',a:{label:'THAT SOUNDS EXHAUSTING.',topic:'flex'},b:{label:'I WOULD, HONESTLY.',topic:'honest'},o:{label:'ASK HER TO DO IT RIGHT NOW.',topic:'weird'}}],
  reads:{honest:true,weird:true,flex:false},
  likesIt:['she cues something up without a word.'],meh:['she keeps mixing, focused elsewhere.'],
  moments:['she plays one record just for you. she does not say which.'],
  richLine:['anfeesa played one record just for me. i never found out which one. i don\'t need to.'],
  posts:['🎧'],
  giftRight:['krada?? she nods to the beat, actually pleased.'],giftWrong:['she keeps mixing, unbothered.'],
  homeLine:['anfeesa played a whole record just for me. i still don\'t know which one it was.']
 });
})();
