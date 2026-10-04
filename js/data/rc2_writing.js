(function(){
 // RC2 · BUILD 3 — WRITING. Pure data + tiny accessors. Build 2 presents barks; Build 1 hooks the buy/club lines.
 // Rules: every line <= 3 sentences (almost all are one). Funny, simple, quick. No Rich lines here (voice pass owns Rich).
 // Ube's verbatim barks are a CREATOR OVERRIDE (OL-069); see CONTENT_AUTHORING.md.
 const L=(text,o={})=>({text,...o});
 // ---------------------------------------------------------------- ENEMY BARKS
 // kinds: enter (fight opens) · hurt (Rich lands a hit) · lowhp (enemy under 30%) · telegraph (enemy is about to do the big move)
 //        win (enemy beats Rich) · lose (enemy goes down) · spared (octopus brain talks the fight out)
 const generic={
  enter:['bro really came out here like this.','nobody told me he was this tall.','i did not clock in for this.','is that a vampire? at THIS hour?','tell my mom i said hi.','i got a coupon for this fight.','we doing this? we doing this.','my cousin said you were nice.'],
  hurt:[L('oh shi this oga not playing'),'ow. okay. okay okay okay.','that was not in the brochure.','who taught him that.','i felt that in my childhood.','my insurance does not cover this.','not the face. the face is how i get paid.','ok that one counted.'],
  lowhp:["i'm good. i'm good. i am not good.",'tell the group chat i went out fighting.','this is just a warm-up. a short one.','somebody call my cousin.','my legs are on a different schedule.','one more. i can take one more. i cannot.'],
  telegraph:['watch this.','you are not ready for this one.','this next one is a lot.','hold on, i am winding up.','i been saving this.'],
  win:['sit down, rich. sit down.',"i'm telling everybody. in detail.",'gg. no re.','that was easy. i am scared of how easy.','you almost had me. almost.'],
  lose:['worth it. barely.',"i'm posting this as a win.",'run it back. after lunch.','my lawyer will hear about this.','i fell on purpose. tactical.'],
  spared:["…you're lowkey cool.",'fine. but i was winning.','this never happened.','you want to get food? i want to get food.']
 };
 // The random ones: ANY enemy can say these, any time. The most random enemy says the wildest thing.
 const wild=[
  L('damn this nigga is crazy'),
  "i left the stove on.",'my horoscope said stay home.','sir, this is a food court.','is this on camera? good. angle me.','i have never been this tired and this inspired.','wait. is that a silk bonnet?',"i'm just here for the orange chicken.",'my lawyer is a raccoon.','i love my job. i love my job. i love my job.',
  'how do i turn this off.','my mom is watching this live.',"i'm not even supposed to be here. i'm covering for steve.",'somebody said there would be snacks.','i came for the vibes. the vibes are violent.','did anybody pay for parking?',"i don't get paid enough for this. i don't get paid.",'this is fake. this is so fake. ow.',
  'i just remembered i love you guys.','what is a vampire even for.','are we in a movie? are we the bad guys?','call it. somebody call it.','rich alucard? from vampgram? hold on, let me get a pic.'
 ];
 const enemy={
  uncle_sunday:{
   enter:['you are too thin. eat first. then fight.','in my time we fought uphill. both ways.','WHO IS YOUR FATHER?','i will tell your mother.'],
   hurt:['AH! you hit your uncle?!','is this how you greet elders?','the disrespect. i feel it in my knees.'],
   lowhp:['my back. my back is not what it was.','you will carry me to the car. i insist.'],
   telegraph:['stand straight when i am talking to you.'],
   win:['now apologise. go on. i am waiting.'],lose:['ha! you have strength. take the bread.'],spared:['you called me uncle. come, sit. eat.']},
  bruce_loose:{
   enter:['i trained for this. mostly in a mirror.','WAAAH! (that was the warm-up.)','the tracksuit is lucky. you are not.'],
   hurt:['that was a warm-up! i was warming up!','my tracksuit has a lifetime warranty. i do not.','okay. okay. nobody saw that.'],
   lowhp:['the stripe stays. the stripe always stays.','i have beaten hungrier men than you.'],
   telegraph:['wooo-AAAH... (that noise means kick.)','here comes the noise. the kick is next.'],
   win:['LESSON ONE: do not lose.'],lose:['the chicken was never the point.'],spared:['you are my student now. do not tell my other students.']},
  kevins:{
   enter:['kevin.','we are kevin.','kevin? kevin. kevin!'],hurt:['KEVIN!','that was the wrong kevin.','kevin kevin kevin.'],lowhp:['there are only nineteen kevins left.','which one of us is the real kevin? me. no. me.'],
   telegraph:['the real kevin is bowing...'],win:['kevin wins. all of us.'],lose:['we regret everything. all forty of us.'],spared:['thank you for the snacks. kevin.']},
  phil:{
   enter:['i can feel it BUILDING.','three more minutes. just three.','you picked the wrong day.'],hurt:['IT DOES NOT HURT. IT HURTS A LITTLE.','you hit me while i was CHARGING!','not yet! i am not done charging!'],lowhp:['my hair was gold yesterday.','i am STILL charging.'],
   telegraph:['STAND BACK. THIS IS THE BEAM.'],win:['WHO IS POWER LEVEL NOW.'],lose:['i needed one more day.'],spared:['you brought food? nobody ever brings food.']},
  bonesworth:{
   enter:['i require ibuprofen and honor.','who threw this. i need to know who threw this.','my bones are literally ringing.'],hurt:['i am already dead. this is rude.','mind the ribs. they are original.'],lowhp:['i will rest in the crypt. not die. rest.','second wind. maybe. possibly.'],
   telegraph:['i am steadying my shield. i am also steadying my stomach.'],win:['a victory. i would like a nap.'],lose:['tell the crypt i fought well.'],spared:['the jollof. the jollof is a mercy.']},
  hilt:{enter:['…','no.','round one.'],hurt:['hm.','…okay.','no.'],lowhp:['…','hm.'],win:['no.'],lose:['…okay.'],spared:['…']},
  hilt_rematch:{enter:['round two.','…again.'],hurt:['hm.','…good.'],lowhp:['…okay.'],win:['no.'],lose:['…that was good.'],spared:['…']},
  paladin:{
   enter:['the heavens see you.','i am a paladin. i have a calling. also a student loan.'],hurt:['the lord forgives you. i do not.','this armor was blessed. you chipped it.'],lowhp:['the light is a little dim right now.'],telegraph:['i raise my sword to the heavens. please hold still.'],win:['it is written. i wrote it.'],lose:['i yield. spiritually.'],spared:['i accept the job offer.']},
  bard:{enter:['i wrote a song about this. it is mean.','(strums threateningly)'],hurt:['you just ruined the key change!','not the lute!'],lowhp:['final verse. it is a sad one.'],win:['i will make this a ballad.'],lose:['i will make this a ballad anyway.'],spared:['can i open for you?']},
  cleric:{enter:["i'm praying for me. not you.",'bless this mess.'],hurt:['i healed that. i swear i healed that.','the prayer is on hold.'],lowhp:['ten percent faith. ninety percent fear.'],win:['amen. i guess.'],lose:['i blame the bard.'],spared:['i forgive you. loudly.']},
  coffe:{enter:["SORRY BRO. CONTRACT'S A CONTRACT.",'this coffee is SO good.',"i've had seven. i can see through time."],hurt:['OW. THAT WAS A GOOD HIT. SO GOOD.','i did not feel that. i felt that.'],lowhp:['i am vibrating at a frequency.','one more coffee and i win.'],win:['bro. i did not want to win like this.'],lose:['still homies?'],spared:['double agent coffe. i can work with that.']},
  lil_smack:{enter:['mouth open. always.','chew chew chew.','i brought crumbs. so many crumbs.'],hurt:['you made me drop the wing!','mmf. mmf!! (that means ow.)'],lowhp:["i'll be back. with snacks."],win:['mmmf. (that means i win.)'],lose:['i always come back. always.'],spared:['…can i have the rest of your fries?']},
  smallie:{enter:['i sell Blood X with LOVE.','my cousin is outside. the whole time.'],hurt:["that's coming out of your cut.",'my cousin saw that!'],lowhp:['cousin. COUSIN.'],win:['the bag is mine. the cousin is a witness.'],lose:['keep the bag. i keep the cousin.'],spared:['one boba. on the house.']},
  buckhead:{enter:['my brunch empire will end you.','do you know who my mimosa guy is.'],hurt:['this blazer is vintage!','you got blood on the linen.'],lowhp:['i will call my brunch lawyer.'],win:['bottomless. you are bottomless.'],lose:['i will see you at brunch.'],spared:['you have taste. unfortunately.']},
  hunter:{enter:['i have a pamphlet.','this is covered in section four.'],hurt:['that is not in the pamphlet.','page seven said this would not happen.'],lowhp:['i should have read the whole pamphlet.'],win:['section nine: victory.'],lose:["i'm filing a complaint with the pamphlet."],spared:['i did not see you. nobody did.']},
  groupies:{enter:['RICH! RICH! SIGN MY ARM!','we saw the VampGram!!'],hurt:["he touched me. i'm never washing.",'again! again!'],lowhp:['we love you so much. we are on the floor.'],win:['we are so sorry. but we are not sorry.'],lose:['best day of my life. best day.'],spared:['can we get a selfie. all sixty of us.']},
  werewolf:{enter:['…did i do that.','sorry!! sorry!! (still biting)'],hurt:['sorry!! sorry!!','ow! that was my good ear!'],lowhp:['the moon is a lot tonight.'],win:['sorry. so sorry.'],lose:['…thank you. i think.'],spared:['i am so sorry about the mall.']},
  training:{enter:['(dummy noises)'],hurt:['i have no feelings.','i also have no insurance.','(stands there. proudly.)'],lowhp:['(wobbles dramatically)'],win:['(it is a dummy. it did not win.)'],lose:['i have been defeated. by a vampire. at noon.'],spared:['(it is a dummy.)']},
  // F01 THE PLAY ogas (grid showdowns)
  CHEWER:{enter:['mouth open. always.','i am so loud. i am so loud on purpose.'],hurt:['mmf. mmf!!','not the sandwich!'],lowhp:['i am chewing slower. that is bad.'],win:['chew chew.'],lose:['i drop my snack. that is how you know.'],spared:['you want a bite? it is mostly crumbs.']},
  ENFORCER:{enter:['i have a shotgun and a calm face.','nothing personal. a lot personal.'],hurt:['cover is a suggestion.','that was my good vest.'],lowhp:['i am still calm. my knees are not.'],win:['calm. as promised.'],lose:['calm. also, ow.'],spared:['…we did not see each other.']},
  HUNTER:{enter:['silver bolts. read the pamphlet.','you are in section four.'],hurt:['not in the pamphlet!','silver was supposed to work!'],lowhp:['i should have gone into accounting.'],win:['section nine.'],lose:["tell bllad33 i said hi."],spared:['i have a nephew who is a vampire too.']},
  LIEUTENANT:{enter:['stay in formation!','i said FORMATION!'],hurt:['stay in formation while i get hit!','everyone look tough. i am hurt.'],lowhp:['somebody else lead. somebody. anybody.'],win:['formation holds.'],lose:['formation broke. my feelings broke.'],spared:['we are going to lunch now.']},
  LIL_SMACK:{enter:['mouth open. always.','i came back. i always come back.'],hurt:['you made me drop the wing!'],lowhp:["i'll be back. with snacks."],win:['mmmf. (that means i win.)'],lose:['i always come back.'],spared:['can i have your fries?']}
 };
 // ---------------------------------------------------------------- CHEAP-BUY ENCOUNTERS (Build 1 taco hook)
 // A $2–$20 buy opens a 2–3 box moment. Pools are keyed by what was bought; `meet` names an existing character where possible.
 // `tip` is a tiny helpful thing the stranger says (Build 1 decides whether it pays out).
 const cheapBuy={
  tacos:[
   {id:'tacos_regular',lines:['a guy in line is whispering to his taco. it seems to be going well.','guy: "the al pastor changed my life. do not tell my wife."'],tip:'al pastor is the move.'},
   {id:'tacos_nodd',meet:'officer_nodd',lines:['officer nodd is in line behind you. he nods at the menu.','he orders. he nods again. you are both somehow full.'],tip:'nodd likes you now.'},
   {id:'tacos_chuy',meet:'don_chuy',lines:['don chuy slides over a seventh taco. nobody ordered it.','"for the castle guy. do not tell the others."'],tip:'seventh taco. free.'},
   {id:'tacos_dm',lines:['a girl in line looks at your fangs. then your wallet. then your fangs.','she hands you a flyer for a party. there is no address. there is a taco on it.'],tip:'a party flyer, no address.'}
  ],
  malt:[
   {id:'malt_auntie',meet:'auntie',lines:['the auntie sees you buying one malt. she adds a second malt to the bag.','"one malt is a sad purchase. two is a plan."'],tip:'two malts. she is not charging.'},
   {id:'malt_uncle',lines:['an old man at the freezer nods at your malt like you passed a test.','"now you are a man." he does not explain.'],tip:'passed a test. no idea which.'}
  ],
  boba:[
   {id:'boba_cashier',lines:['the cashier writes your name on the cup. it says RICH ALUMCARD.','close enough. she gives you extra pearls for the trouble.'],tip:'extra pearls.'},
   {id:'boba_stranger',lines:['a stranger at the next table says: "tapioca is just a feeling."','you are not sure what that means. you feel it.'],tip:'a feeling, free.'}
  ],
  coffee:[
   {id:'coffee_coffe',meet:'coffe',lines:['coffe appears behind you. he did not walk there.','"THAT IS A SMALL. SIR. THAT IS A SMALL."'],tip:'coffe is judging your size.'}
  ],
  gas_station:[
   {id:'gas_hot_dog',lines:['the hot dog has been rolling since 2019. it salutes you.','the clerk says: "you want it? i want it gone."'],tip:'hot dog. free if you hurry.'},
   {id:'gas_scratch',lines:['you buy a scratch ticket. you win three dollars.','you spend it on another ticket. a very american feeling.'],tip:'+$3, then -$3.'}
  ],
  thrift:[
   {id:'thrift_jacket',lines:['you find a jacket with $20 in the pocket. it is not your jacket.','you put the $20 back. then you take it. then you put it back.'],tip:'a very honest jacket.'}
  ],
  generic:[
   {id:'any_cashier',lines:['the cashier says: "you look like you needed that."','you did.'],tip:'cashier believes in you.'},
   {id:'any_stranger',lines:['a stranger next to you says: "good choice."','nobody has ever said that to you about anything.'],tip:'a compliment.'}
  ]
 };
 // ---------------------------------------------------------------- STRIP CLUB · FIRST VISIT PROTECTION
 // The first night: half-off cover, and the house holds half the bankroll at the door. Build 1 wires the money; these are the words.
 const stripClub={
  firstVisit:{
   door:['first time? welcome. cover is half off tonight.','house rule for first timers: bring half your cash. the rest stays home.','it is called not going broke on your first night.'],
   rich:['half my bankroll?','…that is the most responsible thing anyone has said to me.'],
   deal:'FIRST NIGHT · HALF OFF COVER · BRING HALF YOUR CASH, NO MORE',
   leaving:['"spend the first half wisely."','"come back. the rope is not going anywhere. neither are we."'],
   mail:{title:'THE CLUB',body:'first night: half off cover. bring half your cash. the rest stays home.'}
  },
  returnVisit:['"welcome back. no more training wheels."','"we do not hold your money anymore. we hold your attention."']
 };
 // ---------------------------------------------------------------- accessors
 function rngOf(r){return typeof r==='function'?r:Math.random;}
 const textOf=x=>typeof x==='string'?x:x.text;
 function pickFrom(list,rng){return list.length?textOf(list[Math.floor(rngOf(rng)()*list.length)]):null;}
 // bark(enemyId, kind, rng) -> a line. ~12% of the time ANY enemy says something wild instead.
 function bark(enemyId,kind='hurt',rng,{wildChance=.12}={}){
  const r=rngOf(rng);
  if(r()<wildChance)return pickFrom(wild,r);
  const own=enemy[enemyId]?.[kind]||[];
  // own pool 70%, generic pool 30% (when both exist)
  const pool=own.length&&r()<.7?own:(generic[kind]||own);
  return pickFrom(pool.length?pool:(generic[kind]||[]),r);
 }
 function cheapBuyPick(kind='generic',rng){const list=cheapBuy[kind]||cheapBuy.generic;const e=list[Math.floor(rngOf(rng)()*list.length)];return {...e,lines:[...e.lines]};}
 function allBarks(){const out=[];for(const k of Object.keys(generic))for(const t of generic[k])out.push(textOf(t));for(const t of wild)out.push(textOf(t));for(const e of Object.values(enemy))for(const arr of Object.values(e))for(const t of arr)out.push(textOf(t));return out;}
 // OCTOPUS BRAIN: where the move comes from (the prologue scene) and how the game talks about it afterwards.
 const octopusBrain={
  origin:'the sensei handed rich a brain. it has eight parts. the seventh part is mostly snacks.',
  firstUse:['the second brain wakes up. it already has an idea.','eight thoughts, one move. rich picks the dumbest one.','the octopus part of his head says: do not hit it. ask it.'],
  reminder:['every part of the brain is thinking about food.','use your head. the other head.']
 };
 // ---------------------------------------------------------------- BUILD 1 UI LINES (OL-071)
 // Keyed by Build 1's ids (docs/rc2/LINES_FOR_BUILD3.md on rc2/economy-001). Step 4 maps these into rc2_lines.js. Funny, simple, <= 3 sentences.
 const ui={
  'club.first_visit':'FIRST NIGHT. HALF OFF AT THE DOOR. BRING HALF YOUR CASH, THE REST STAYS HOME.',
  'club.cap_reached':'THAT IS HALF YOUR CASH. THE DOORMAN IS PROUD OF YOU.',
  'club.need_cash':'NO CASH, NO SPRAY. THE DANCERS CAN TELL.',
  'cheap.meet':'YOU BOUGHT SOMETHING SMALL. SOMEBODY NOTICED YOU.',
  'cheap.unlock':'THAT SNACK PAID OFF. CHECK YOUR PHONE.',
  'rent.in':'RENT IS IN. YOUR BUILDINGS WORKED WHILE YOU SLEPT.',
  'guide.next_play':'MAKE A PLAY. SOMEONE ELSE HAS MONEY. YOU HAVE A PLAN.',
  'guide.next_offer':'THE BLACK CAR IS OUTSIDE. IT HAS AN OFFER. DO NOT ASK.'
 };
 window.RAWriting={ui,octopusBrain,barks:{generic,wild,enemy,kinds:['enter','hurt','lowhp','telegraph','win','lose','spared']},bark,allBarks,cheapBuy,cheapBuyPick,stripClub};
})();
