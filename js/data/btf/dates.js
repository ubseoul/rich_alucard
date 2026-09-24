(function(){
 // Per-woman date content (VOL 1 §9.4: 10 FULL date loops with a unique MOMENT each; 12 MEET+1).
 // Schema per woman (all optional; the DATE adventure falls back gracefully):
 //  arrival[]     how she looks tonight, one per date number
 //  asks[]        {q, a:{label,topic,right?,reply?}, b:{...}, o:{...octopus}} one per date number (date 1 ≠ date 2)
 //  reads{}       topic → true if it lands with her (music, castle, honest, fight, food, weird, flex, present, listen, cars…)
 //  likesIt[] / meh[]  her reaction when the read lands / doesn't
 //  moments[]     the small authored beat specific to her, per date number
 //  spots{}       spot-specific moment overrides
 //  richLine[]    Rich's closing line per date [VP]
 //  posts[]       what she posts (if she posts)
 //  giftRight[] / giftWrong[]  homeLine[] [VP]
 // Non-Rich lines are functional drafts pending HQ Story; Rich lines are [VP].
 const C={};
 C.kiki={
  arrival:['she\'s outside the boba shop in platform sneakers, apron off, same clips.','she changed her clips. she wants you to notice.','she\'s already holding two cups. one of them is yours. probably.'],
  asks:[
   {q:'so what do you actually do?',a:{label:"I'M A MUSIC ARTIST.",topic:'music'},b:{label:'I OWN A CASTLE.',topic:'castle'},o:{label:"HONESTLY? I'M TRYING DIFFERENT LANES.",topic:'honest'}},
   {q:'ok be honest. was the boba last time bad',a:{label:'IT TASTED LIKE A CANDLE.',topic:'honest'},b:{label:'IT WAS PERFECT.',topic:'flex'},o:{label:'ORDER FOR ME AGAIN. WRONG ON PURPOSE.',topic:'weird'}},
   {q:'what would you do if you weren\'t… whatever you are',a:{label:'SAME THING. LOUDER.',topic:'flex'},b:{label:'OPEN A BOBA SHOP.',topic:'present'},o:{label:'ASK WHAT SHE\'D DO.',topic:'listen'}}
  ],
  reads:{honest:true,weird:true,listen:true,music:false,castle:false,flex:false,present:true},
  likesIt:['she laughs. like, actually.','"ok. OK. that\'s the first honest thing a guy said to me this month."','she shoves your shoulder. that means yes.'],
  meh:['"mm. ok."','she checks her phone.','"that\'s a line. i can hear it."'],
  moments:['she orders for you. she gets it wrong on purpose. you drink it anyway.','she makes you try her flavor. it is worse. she knows.','she walks away. she looks back once.'],
  richLine:['this taste like a candle. i love it.','…ok this one is worse.','she looked back.'],
  posts:['🧋 (he drank it)','boba w/ the castle guy','👀'],
  giftRight:['a boba gift card?? you get me.'],giftWrong:["this is so random. i'm posting it."],
  homeLine:['she ordered wrong on purpose. i know it.','kiki is funny.','…i like her.']
 };
 C.ceo_assistant_001={
  arrival:['she\'s holding an umbrella. it isn\'t raining.','she wore the curvier look. the vampire one. she knows you notice.','she has two boba cups and a plan.'],
  asks:[{q:'what are you building? like, for real.',a:{label:'A LIFE. ONE ROOM AT A TIME.',topic:'castle'},b:{label:'MUSIC.',topic:'music'},o:{label:"I DON'T KNOW YET. THAT'S THE FUN.",topic:'honest'}},
   {q:'do you think about marriage',a:{label:'EVERY DAY.',topic:'flex'},b:{label:'I THINK ABOUT A HOUSE.',topic:'castle'},o:{label:'ASK HER WHAT SHE PICTURES.',topic:'listen'}}],
  reads:{castle:true,listen:true,honest:true,music:false,flex:false},
  likesIt:['she smiles like she was right about you.','"that\'s the answer."'],meh:['she nods. she\'s filing it.'],
  moments:['the umbrella stays over you the whole walk. you do not need it. she does not care.','it rains for real. she laughs and closes the umbrella.'],
  spots:{rain_walk:'finally, a walk in the rain. she takes your arm like she planned it months ago.'},
  richLine:['she really just held the umbrella.','rain look good on her.'],posts:['walks in the rain 🖤','date to marry. just saying.'],
  homeLine:['the assistant is serious. i like serious.','she wants a house. i got a castle. that\'s bigger.']
 };
 window.RADateContent={get:id=>C[id]||null,all:C,define(id,content){C[id]={...(C[id]||{}),...content};}};
})();
