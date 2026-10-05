(function(){
 // RC2 · BUILD 3 — WRITING. Pure data + tiny accessors. Build 2 presents barks; Build 1 hooks the buy/club lines.
 // Rules: every line <= 3 sentences (almost all are one). Funny, simple, quick. No Rich lines here (voice pass owns Rich).
 // Ube's verbatim barks are a CREATOR OVERRIDE (OL-069); see CONTENT_AUTHORING.md.
 const L=(text,o={})=>({text,...o});
 // OL-074: creator sheet. Numbered references keep each authored sentence exact.
 const voiceSheet=Object.freeze(["damn im tired as fuck", "im broke as fuck i need funds", "this shit couldnt cover fly shoes", "all that work for beans?", "damn i move like tony now", "yall listen to carti?", "whats haddenning", "never met vampire ogas who listen to country", "oh shit, that's Blad33ee!", "here we go again", "say big bro, gonna need to leave that here", "please man you cant do this i need this for my student loans", "O ma ṣe o", "i own land uncle castle even", "the only reason i dont open the blinds to show you the sun is because my rags are in the wash", "damn this shit is like magic city", "dance for me dance!", "why are they leaving?", "wait one more round", "gonna make it rain like hell"]);
 const voice=n=>voiceSheet[n-1];
 // ---------------------------------------------------------------- ENEMY BARKS
 // kinds: enter (fight opens) · hurt (Rich lands a hit) · lowhp (enemy under 30%) · telegraph (enemy is about to do the big move)
 //        win (enemy beats Rich) · lose (enemy goes down) · spared (octopus brain talks the fight out)
 const generic={
  "enter": [
    "bro really wore that to a fight",
    "nobody said he was tall as fuck",
    "i aint clocked in yet",
    "vampire at this hour? damn",
    "tell mama i tried",
    "this fight better validate parking",
    "alright run it then",
    "my cousin said you soft"
  ],
  "hurt": [
    "oh shi this oga not playing",
    "damn okay that counted",
    "who taught your ass that",
    "felt that in primary school",
    "insurance said hell no",
    "not the face bro thats rent",
    "you got eight hands? unfair as fuck",
    "why my knee making that noise"
  ],
  "lowhp": [
    "im good bro i lied",
    "group chat better say i fought",
    "warm up over im going home",
    "somebody call my cousin now",
    "legs done clocked out",
    "one more hit and im a fundraiser"
  ],
  "telegraph": [
    "watch this shit",
    "you not ready big bro",
    "hold on let me cook",
    "been saving this one",
    "dont blink you paid for this"
  ],
  "win": [
    "sit your ass down rich",
    "everybody hearing about this",
    "gg go sleep",
    "damn that was easy",
    "almost had me keep almost"
  ],
  "lose": [
    "posting this as a win",
    "run it back after food",
    "lawyer getting a voice note",
    "fell on purpose dont clip it",
    "damn the floor hard"
  ],
  "spared": [
    "you lowkey cool bro",
    "fine but i was winning",
    "delete the footage first",
    "we getting food or what"
  ]
};
 const wild=[
  "damn this nigga is crazy",
  "left the stove on damn",
  "horoscope said stay home",
  "bro this a food court",
  "camera on? get my good side",
  "is that a silk bonnet",
  "i came for orange chicken",
  "lawyer a raccoon dont ask",
  "i love my job but damn",
  "who turns this shit off",
  "mama watching the live",
  "covering steves shift fuck steve",
  "they said snacks would be here",
  "vibes violent as fuck",
  "who paid for parking",
  "my fee better clear",
  "fake fight real pain",
  "i love yall suddenly",
  "what a vampire even do all day",
  "we the bad guys or what",
  "rich from vampgram? lemme get a pic"
];
 const enemy={
  "uncle_sunday": {
    "enter": [
      "eat first fight after"
    ],
    "hurt": [
      "you hit your uncle? ah",
      "is this how you greet elders",
      "disrespect got my knees hurting",
      "ah my back nephew",
      "your mother hearing about this",
      "carry me to the car after",
      "dont hit the agege bread"
    ],
    "lose": [
      "strong boy take the bread"
    ],
    "spared": [
      "called me uncle now sit and eat"
    ]
  },
  "bruce_loose": {
    "enter": [
      "tracksuit lucky you not"
    ],
    "hurt": [
      "dont crease my shit"
    ],
    "lose": [
      "orange chicken wasnt worth this"
    ],
    "spared": [
      "you my student dont tell nobody"
    ]
  },
  "kevins": {
    "enter": [
      "we all kevin who asking"
    ],
    "hurt": [
      "wrong kevin bro"
    ],
    "lose": [
      "forty kevins zero wins"
    ],
    "spared": [
      "snacks for forty please"
    ]
  },
  "phil": {
    "enter": [
      "full power loading hold on"
    ],
    "hurt": [
      "you hit me while charging"
    ],
    "lose": [
      "needed one more day damn"
    ],
    "spared": [
      "food? for me? bro"
    ]
  },
  "bonesworth": {
    "enter": [
      "need ibuprofen and honor"
    ],
    "hurt": [
      "ribs original watch it"
    ],
    "lose": [
      "tell the crypt i stood on business"
    ],
    "spared": [
      "jollof saved your ass"
    ]
  },
  "hilt": {
    "enter": [
      "round one move"
    ],
    "hurt": [
      "hm that counted"
    ],
    "lose": [
      "fine you got it"
    ],
    "spared": [
      "we done here"
    ]
  },
  "hilt_rematch": {
    "enter": [
      "back again huh"
    ],
    "hurt": [
      "better than last time"
    ],
    "lose": [
      "damn thats new"
    ],
    "spared": [
      "alright go home"
    ]
  },
  "paladin": {
    "enter": [
      "calling from god loan from sallie mae"
    ],
    "hurt": [
      "lord forgives i dont"
    ],
    "lose": [
      "yielding spiritually"
    ],
    "spared": [
      "job offer? bless you"
    ]
  },
  "bard": {
    "enter": [
      "wrote a diss track for this"
    ],
    "hurt": [
      "bro my key change"
    ],
    "lose": [
      "you still getting a ballad"
    ],
    "spared": [
      "can i open for you though"
    ]
  },
  "cleric": {
    "enter": [
      "praying for me fuck you"
    ],
    "hurt": [
      "prayer on hold damn"
    ],
    "lose": [
      "this the bards fault"
    ],
    "spared": [
      "forgiving loud as hell"
    ]
  },
  "coffe": {
    "enter": [
      "contract bro still homies"
    ],
    "hurt": [
      "great hit terrible feeling"
    ],
    "lose": [
      "coffee didnt save me"
    ],
    "spared": [
      "double agent coffe lets go"
    ]
  },
  "lil_smack": {
    "enter": [
      "brought crumbs for everybody"
    ],
    "hurt": [
      "you made me drop my wing"
    ],
    "lose": [
      "coming back with snacks"
    ],
    "spared": [
      "rest of your fries please"
    ]
  },
  "smallie": {
    "enter": [
      "blood x with love bro"
    ],
    "hurt": [
      "my cousin saw that shit"
    ],
    "lose": [
      "keep the bag cousin stay"
    ],
    "spared": [
      "one boba on me"
    ]
  },
  "buckhead": {
    "enter": [
      "brunch empire stand up"
    ],
    "hurt": [
      "linen bro thats linen"
    ],
    "lose": [
      "catch you at brunch"
    ],
    "spared": [
      "you got taste unfortunately"
    ]
  },
  "hunter": {
    "enter": [
      "section four vampire ass"
    ],
    "hurt": [
      "pamphlet aint cover that"
    ],
    "lose": [
      "filing a pamphlet complaint"
    ],
    "spared": [
      "never saw you bro"
    ]
  },
  "blad33ee": {
    "enter": [
      "party over vampire ass"
    ],
    "hurt": [
      "silver supposed to work damn"
    ],
    "lose": [
      "tell ogun dont post this"
    ],
    "spared": [
      "you get one pass"
    ]
  },
  "smallie_cousin": {
    "enter": [
      "cousin called so here i am"
    ],
    "hurt": [
      "family business hurts damn"
    ],
    "lose": [
      "cousin better cover my bill"
    ],
    "spared": [
      "we cousins now or what"
    ]
  },
  "groupies": {
    "enter": [
      "rich sign my arm big bro"
    ],
    "hurt": [
      "he touched me dont wash this"
    ],
    "lose": [
      "best day of my life damn"
    ],
    "spared": [
      "sixty selfies real quick"
    ]
  },
  "werewolf": {
    "enter": [
      "sorry bro still biting"
    ],
    "hurt": [
      "not my good ear damn"
    ],
    "lose": [
      "thanks i think"
    ],
    "spared": [
      "sorry about the whole mall"
    ]
  },
  "training": {
    "enter": [
      "dummy on duty"
    ],
    "hurt": [
      "still got no insurance"
    ],
    "lose": [
      "vampire beat a dummy congrats"
    ],
    "spared": [
      "bro im stuffed fabric"
    ]
  },
  "CHEWER": {
    "enter": [
      "mouth open sandwich ready"
    ],
    "hurt": [
      "not the sandwich big bro"
    ],
    "lose": [
      "snack dropped shit serious"
    ],
    "spared": [
      "want a bite crumbs included"
    ]
  },
  "ENFORCER": {
    "enter": [
      "shotgun calm face rough day"
    ],
    "hurt": [
      "bro my good vest"
    ],
    "lose": [
      "still calm still hurt"
    ],
    "spared": [
      "we never met"
    ]
  },
  "HUNTER": {
    "enter": [
      "silver bolts read the pamphlet"
    ],
    "hurt": [
      "silver doing fuck all"
    ],
    "lose": [
      "shoulda gone accounting"
    ],
    "spared": [
      "nephew a vampire too dont tell"
    ]
  },
  "LIEUTENANT": {
    "enter": [
      "formation damn formation"
    ],
    "hurt": [
      "look tough im hurt"
    ],
    "lose": [
      "somebody else lead this shit"
    ],
    "spared": [
      "lunch break everybody"
    ]
  },
  "LIL_SMACK": {
    "enter": [
      "came back like i told you"
    ],
    "hurt": [
      "wing down repeat wing down"
    ],
    "lose": [
      "ill be back dont get comfy"
    ],
    "spared": [
      "can i get those fries"
    ]
  }
};
 // ---------------------------------------------------------------- CHEAP-BUY ENCOUNTERS (Build 1 taco hook)
 // A $2–$20 buy opens a 2–3 box moment. Pools are keyed by what was bought; `meet` names an existing character where possible.
 // `tip` is a tiny helpful thing the stranger says (Build 1 decides whether it pays out).
 const cheapBuy={
  tacos:[
   {id:'tacos_regular',lines:["bro whispering sweet shit to a taco","guy: al pastor changed my life dont tell my wife"],tip:'al pastor is the move.'},
   {id:'tacos_nodd',meet:'officer_nodd',lines:["nodd behind you even his order a nod","nod received tacos secured"],tip:'nodd likes you now.'},
   {id:'tacos_chuy',meet:'don_chuy',lines:["chuy slides a seventh taco damn sponsorship","for castle guy dont tell nobody"],tip:'seventh taco. free.'},
   {id:'tacos_dm',lines:["girl checks fangs wallet fangs again priorities","party flyer no address just a taco good luck"],tip:'a party flyer, no address.'}
  ],
  malt:[
   {id:'malt_auntie',meet:'auntie',lines:["auntie adds a second malt like your life depends on it","one malt sad two malts a plan"],tip:'two malts. she is not charging.'},
   {id:'malt_uncle',lines:["uncle approves the malt you passed something","manhood unlocked at the freezer damn"],tip:'passed a test. no idea which.'}
  ],
  boba:[
   {id:'boba_cashier',lines:["cup says rich alumcard close enough","extra pearls for emotional damages"],tip:'extra pearls.'},
   {id:'boba_stranger',lines:["bro says tapioca just a feeling","dont know what that means but damn"],tip:'a feeling, free.'}
  ],
  coffee:[
   {id:'coffee_coffe',meet:'coffe',lines:["coffe appears like caffeine got teleport","a small? bro thats a sample"],tip:'coffe is judging your size.'}
  ],
  gas_station:[
   {id:'gas_hot_dog',lines:["hot dog been rolling since 2019 veteran status","you want it? i want it gone"],tip:'hot dog. free if you hurry.'},
   {id:'gas_scratch',lines:["scratch ticket wins three dollars generational wealth","three dollars gone again american dream"],tip:'+$3, then -$3.'}
  ],
  thrift:[
   {id:'thrift_jacket',lines:["twenty dollars in a strangers jacket damn","take it leave it take it conscience lagging"],tip:'a very honest jacket.'}
  ],
  generic:[
   {id:'any_cashier',lines:["cashier says damn you needed that","yeah you did"],tip:'cashier believes in you.'},
   {id:'any_stranger',lines:["stranger approves your snack","finally somebody believes in your ass"],tip:'a compliment.'}
  ]
 };
 // ---------------------------------------------------------------- STRIP CLUB · FIRST VISIT PROTECTION
 // The first night: half-off cover, and the house holds half the bankroll at the door. Build 1 wires the money; these are the words.
 const stripClub={
  firstVisit:{
   door:["first night cover half off dont act brand new","bring half your cash other half stays home","we trying to keep you off gofundme"],
   rich:[voice(20)],
   deal:'FIRST NIGHT · HALF OFF COVER · BRING HALF YOUR CASH, NO MORE',
   leaving:["spend that half like rent exists","come back rope aint retiring"],
   mail:{title:'THE CLUB',body:'first night: half off cover. bring half your cash. the rest stays home.'}
  },
  returnVisit:["back again training wheels off","wallet your problem now eyes up"]
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
  origin:"sensei gave rich eight brain parts seventh one all snacks",
  firstUse:["second brain awake first one still buffering","eight thoughts rich picks the dumbest damn","octopus brain says talk first save your knuckles"],
  reminder:["eight brains all hungry as fuck","use your other head bro"]
 };
 // ---------------------------------------------------------------- BUILD 1 UI LINES (OL-071)
 // Keyed by Build 1's ids (docs/rc2/LINES_FOR_BUILD3.md on rc2/economy-001). Step 4 maps these into rc2_lines.js. Funny, simple, <= 3 sentences.
 const ui={
  'club.first_visit':"first night half off bring half your cash leave the other half home",
  'club.cap_reached':"half your cash gone doorman saving your ass",
  'club.need_cash':"no funds no dance bro",
  'cheap.meet':"small purchase big introduction",
  'cheap.unlock':"snack did networking check your phone",
  'rent.in':"rent landed building got a job now",
  'guide.next_play':"somebody got funds go make a play",
  'guide.next_offer':"black car outside rich ass offer waiting"
 };

 const voiceSlots=Object.freeze({
  "21": "ROXY: you got rhythm or just funds",
  "22": "ROSALYN: hey rich same booth right",
  "23": "EMERALD: rich dont throw your whole life at me",
  "24": "ROXY: damn you finally hit the beat",
  "25": "ROSALYN: okay big tipper i see you",
  "26": "EMERALD: rent money flying act normal",
  "27": "ROXY: that bill paying for one breath",
  "28": "ROSALYN: a dollar? cute",
  "29": "EMERALD: keep some for the bus rich",
  "30": "here we go again",
  "31": "bro picked the wrong vampire",
  "32": "damn my rent got hands",
  "33": "you hit your uncle? ah",
  "34": "my cousin saw that shit",
  "35": "silver doing fuck all",
  "36": "story first bro the club still gonna be there",
  "37": "crew blocked clear the street then collect",
  "38": "money waiting go collect it",
  "39": "get paid then go be irresponsible",
  "40": "club done go sleep before you buy more shit",
  "41": "damn what a night",
  "42": "im done for tonight",
  "43": "left the stove on damn",
  "44": "they said snacks would be here",
  "45": "horoscope said stay home",
  "46": "lawyer a raccoon dont ask",
  "47": "camera on? get my good side",
  "48": "mama watching the live"
});
 const dancerGreeting=d=>voiceSlots[{roxy:21,rosalyn:22,emerald:23}[d]];
 const throwReaction=(d,amount)=>voiceSlots[(amount>=1000?{roxy:24,rosalyn:25,emerald:26}:{roxy:27,rosalyn:28,emerald:29})[d]];
 window.RAWriting={voiceSheet,voice,voiceSlots,dancerGreeting,throwReaction,ui,octopusBrain,barks:{generic,wild,enemy,kinds:['enter','hurt','lowhp','telegraph','win','lose','spared']},bark,allBarks,cheapBuy,cheapBuyPick,stripClub};
})();
