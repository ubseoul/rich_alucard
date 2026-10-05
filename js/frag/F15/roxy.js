// F15 — ROXY, scenes L1–L4. Source: approved romance script F15_ROMANCE_TWELVE_SCENE_DRAFT_v3.md (Ube: approved in full).
// Player-facing text only: no source annotations, proposal lists or production notes. Rich's lines are Ube's, verbatim.
// Roxy's money behavior is preserved (she will not let Rich pay). Her protected L3 quote appears once, here, and nowhere else.
(function(global){
 'use strict';
 const {add,U,S,N,stage}=global.RAF15Dates;
 const R='roxy',her=()=>stage(R),rich=()=>({left:'rich'});
 const spar=()=>global.RAF15Tunables.COMBAT.spar;

 // ---- L1 · HER TREAT --------------------------------------------------------------------------------------------------------
 add(R,1,{title:'HER TREAT',start:'bing',nodes:{
  bing:{env:'f15_bing',actors:her,title:'THE BING — AFTER CLOSE',lines:[
   N(`House lights up. The stage looks smaller with the lights on. Roxy comes out of the back in a hoodie, bag on one shoulder, and stops at Rich's booth like she decided this a while ago.`),
   S(R,`You throw on the beat.`),S(R,`Most guys spray. You were efficient.`),S(R,`Not the most money in the room. The best ratio. I respect a ratio.`),
   U(`damn girl i didn’t know i was being graded`),
   S(R,`You are now.`),S(R,`I'm hungry. You're coming.`),S(R,`Off the clock, I pick.`)],
   choices:[{label:'GO WITH HER',next:'waffle'},{label:'NOT TONIGHT',next:'declined'}]},
  declined:{lines:[],end:{outcome:'declined'}},
  waffle:{env:'waffle_haven',actors:her,title:'WAFFLE HAVEN — 3 A.M.',lines:[
   N(`She orders without opening the menu, then watches Rich read his like she's timing it.`),
   S(R,`Forty seconds. It's waffles. Pick.`),U(`good taste, waffles too`),S(R,`Obviously.`),
   N(`A stats textbook sticks out of her bag, spine cracked, tabs everywhere.`)],
   choices:[{label:'ASK ABOUT THE CLUB',next:'club'},{label:'ASK ABOUT THE TEXTBOOK',next:'textbook'}]},
  club:{lines:[S(R,`Because it's mine. My hours, my money, my call.`)],next:'both'},
  textbook:{lines:[S(R,`Data science is patterns. People think they're random. They're not.`),S(R,`You, for example. Same booth, left hand first, every time.`)],next:'both'},
  both:{lines:[
   S(R,`Every night up there pays for a piece of my future.`),S(R,`No loans. No co-signer. Nobody gets a piece of it.`),
   N(`She says it like a fact about weather. Then she steals one of Rich's fries.`),
   N(`The check lands. Rich reaches for it.`)],
   choices:[{label:'REACH FOR THE CHECK',next:'check'}]},
  check:{lines:[
   N(`Her card is already under it. The server is already gone.`),S(R,`Already done.`),
   U(`wait, what no i’ve got it dont worry`),
   S(R,`You throw money all night. Take one off.`),S(R,`And nobody owes anybody. That's the point.`),
   N(`She pulls the receipt back, writes on the back of it, and slides it across.`),
   S(R,`Receipt. For your records.`),S(R,`Text me something better than "wyd" and I'll answer.`),
   N(`She's out the door before the bell above it stops ringing.`)],next:'texts'},
  texts:{env:'bedroom',actors:rich,title:'TEXTS — LATER',lines:[
   U(`i cant say wyd so instead ill say hmm. I really enjoyed spending time with you<3`),
   S(R,`acceptable.`),S(R,`the heart was a lot.`),S(R,`gym. thursday. 6.`),N(`CONTACT ADDED: ROXY`)],next:'end'},
  end:{lines:[],end:{outcome:'done',receipt:{id:'receipt',caption:'PAID IN FULL. (not by you)',vp:false}}}
 }});

 // ---- L2 · REMATCH -----------------------------------------------------------------------------------------------------------
 add(R,2,{title:'REMATCH',start:'gym',nodes:{
  gym:{env:'f15_gym',actors:her,title:'BOXING GYM — 6 P.M.',lines:[
   N(`She's already wrapping her hands when Rich walks in, fast, without looking down.`),
   S(R,`Day pass is paid. Don't.`),S(R,`Rules. No biting. I'll know.`),S(R,`Light contact. First to five clean shots.`),
   N(`Round one, she's loose and grinning, feeling him out. Then Rich lands one.`),
   N(`She stops grinning. Her stance drops an inch.`),
   S(R,`Oh. Okay.`),S(R,`Okay. Now we're boxing.`),
   N(`Her pattern speeds up. She starts calling the score out loud.`),
   S(R,`Two–one. Me.`),S(R,`Three–one.`),
   N(`Rich lands a clean shot.`),S(R,`That didn't count.`),
   U(`damn you can’t take losing at all`),
   S(R,`I take losing fine. I just don't do it.`),S(R,`Run it back.`),
   N(`She takes a light hit, shakes her head, laughs, and comes right back harder. Normal, easy, fun.`)],next:'bout'},
  // Existing Combat 2.0, no defeat penalty. Either result continues the same scene (the spar's result is not authored).
  bout:{fight:{enemy:'f15_roxy_spar',params:()=>({env:'f15_gym',noPenalty:spar().noPenalty,intro:'FIRST TO FIVE CLEAN SHOTS. LIGHT CONTACT.'}),win:'after',lose:'after',spared:'after',run:'after'}},
  after:{env:'f15_gym',actors:her,lines:[
   S(R,`Five. Game.`),S(R,`Rematch. Not now. I want you to think about it.`),
   N(`She checks her phone while unwrapping. She's been tracking.`),
   S(R,`You drop your left after every jab. Fourteen times.`),S(R,`I'm going to fix that. Don't take it personal.`),
   U(`why are you pocket watching me like that lol`),
   S(R,`It's not pocket watching if I tell you.`)],next:'ramen'},
  ramen:{env:'little_tokyo',actors:her,title:'LITTLE TOKYO — RAMEN',lines:[
   N(`She picks the spot. She orders. Rich reaches for his wallet.`)],
   choices:[{label:'REACH FOR YOUR WALLET',next:'wallet'}]},
  wallet:{lines:[
   S(R,`Put that away before I put it away for you.`),
   N(`A dog tied up outside presses its nose to the window. Roxy's whole voice changes.`),
   S(R,`Hi. Hi. Look at you. Look at that face.`),
   S(R,`…Don't look at me like that. Animals are better than people. That's just data.`),
   S(R,`Dogs. Horses. Goats are underrated, and pigs are smarter than half my study group.`),
   S(R,`When I own a place with a yard, I'm getting three dogs. Minimum.`),
   N(`She goes back to her noodles, then pauses.`),
   S(R,`I love all animals.`),S(R,`I hate cats.`),S(R,`Don't ask.`)],
   choices:[{label:'MENTION YOUR CAT',next:'cat'},{label:'KEEP THE CAT TO YOURSELF',next:'pays'}]},
  cat:{lines:[
   U(`well…all cats aren’t bad.`),
   N(`She stares at him for a long moment.`),
   S(R,`…You have a cat.`),S(R,`That changes my numbers on you.`),S(R,`Slightly.`)],next:'pays'},
  pays:{lines:[N(`She pays. Obviously.`),S(R,`Thursday. Bring your left hand.`)],next:'end'},
  end:{lines:[],end:{outcome:'done',receipt:{id:'receipt',caption:'RAMEN ×2 — PAID BY: ROXY (again)',vp:false}}}
 }});

 // ---- L3 · DIFFERENT ---------------------------------------------------------------------------------------------------------
 // The hard hit comes from ANOTHER fighter (unnamed, undescribed, never speaking). Rich is at ringside; he never touches her.
 add(R,3,{title:'DIFFERENT',start:'ring',nodes:{
  ring:{env:'f15_gym',actors:her,title:'BOXING GYM — SAME GYM',lines:[
   N(`Her text only said "gym." No time. No trash talk.`),
   N(`She's already wrapped and already in the ring, working rounds with another fighter. She lifts a glove at Rich. Normal enough.`),
   N(`But she isn't calling the score. Her phone is in her bag. No stats tonight.`),
   S(R,`Later.`),
   N(`The other fighter steps in. A hard shot lands clean.`),
   N(`Last time, Roxy would have grinned, shaken it off and come back harder.`),
   N(`This time, she doesn't make a sound. She just resets her feet, like it was a step she already knew was coming.`),
   N(`The bell. She climbs out through the ropes, slower than she climbed in.`),
   U(`Hey Roxy, are you okay?`),
   N(`She answers quietly.`),
   S(R,`...I've gotten used to it.`),
   N(`Then, immediately:`),
   S(R,`Your left. Show me.`),S(R,`Did you fix it or not?`),
   U(`It’s feeling better..thanks.`),
   S(R,`Feeling better isn't fixed.`),S(R,`Thursday.`)],
   choices:[{label:'HAND HER THE ICE PACK',next:'after'},{label:'TOSS HER A TOWEL',next:'after'}]},
  after:{lines:[
   N(`She takes it without looking at Rich. She doesn't say thank you. She doesn't give it back either.`),
   N(`At the vending machine she buys two waters and hands him one.`),
   S(R,`Don't.`),
   N(`She stands there a second longer than she needs to.`),
   S(R,`Thursday. Same time.`),S(R,`You're still coming.`),S(R,`…Right?`),
   N(`She nods once, like a number got entered.`)],next:'end'},
  end:{lines:[],end:{outcome:'done',receipt:{id:'receipt',caption:'WATER ×2',vp:false}}}
 }});

 // ---- L4 · SICK DAY ----------------------------------------------------------------------------------------------------------
 add(R,4,{title:'SICK DAY',start:'texts',nodes:{
  texts:{env:'bedroom',actors:rich,title:'TEXTS',lines:[
   S(R,`not coming thursday.`),U(`What happened - you good?`),S(R,`sick. it's fine. i'm fine.`),
   N(`Typing… Stops. Typing…`),N(`She sends an address.`),S(R,`don't make it weird.`)],next:'door'},
  door:{env:'f15_roxy_apartment',actors:her,title:"ROXY'S APARTMENT",lines:[
   N(`Rich shows up with Japanese beef curry and rice. The beef is cut in huge cubes.`),
   N(`She opens the door in a blanket with the hood up, then squints at the bag.`),
   S(R,`I said don't make it weird.`),S(R,`…You brought food. That's weird.`),
   N(`She looks into the container.`),
   S(R,`Why is the beef this big.`),S(R,`…Don't change it.`),
   N(`She lets him in anyway.`),
   N(`The apartment: a whiteboard by the desk where semesters are crossed off in neat, even Xs. A calendar of dogs, one per month. Gloves hanging by the door.`),
   N(`She eats like she forgot she was hungry. Then she reaches for her phone.`),
   S(R,`How much was it.`),
   U(`Roxy i got this please - my ego needs this`),
   S(R,`Your ego will survive.`),S(R,`I'm sending it. Don't argue with a sick person.`),
   N(`She opens her payment app and types the amount, then sets the phone on her knee.`),
   S(R,`Pick a movie. They're all terrible. That's the point.`),
   N(`A stack of cheap vampire movies. Rubber fangs on every cover.`),
   N(`Ten minutes in, the on-screen vampire hisses at a cross.`),
   S(R,`Is that accurate?`),S(R,`Hm. Writing that down.`),
   N(`Second movie. Her head ends up on Rich's shoulder. Her phone is still in her hand: payment screen open, amount typed, thumb over SEND.`),
   N(`She's asleep.`)],
   // Rich's food. The script authors no amount, so none is invented (tunable MONEY.roxyL4Curry, default 0).
   enter:()=>{global.RAF15.payOnce('F15_ROXY_L4','curry',global.RAF15Tunables.MONEY.roxyL4Curry);},
   choices:[{label:'SET HER PHONE ON THE TABLE, UNTOUCHED',next:'wake'}]},
  wake:{lines:[
   N(`Credits. She wakes up slowly. She sees the phone on the table and the screen that never sent.`),
   N(`She looks at it for a long second.`),N(`She doesn't pick it up.`),
   S(R,`…You stayed.`),S(R,`You can stay for the next one.`),S(R,`If you want.`),
   S(R,`Don't read into it.`),S(R,`…Read into it a little.`),
   N(`She looks at his mouth, then pulls the blanket up over hers.`),
   S(R,`I'd kiss you, but I'm contagious.`),S(R,`Rain check.`),S(R,`My treat.`),
   U(`I love being sick, it was actually my major in college.`),
   N(`She laughs, then coughs.`),
   S(R,`Don't make me laugh. I'm contagious.`),
   N(`She presses play on the next one.`)],next:'end'},
  end:{lines:[],end:{outcome:'done',receipt:{id:'receipt',caption:'PAID BY: RICH. (she fell asleep before she could fix that)',vp:false}}}
 }});
})(window);
