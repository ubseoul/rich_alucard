# NEW STORY — RC2 · BUILD 3 · OL-063

All of this is NEW content written under Ube's creator authorization ("I only want you to cook those story lines more"). It sits inside existing canon: existing characters, existing environments, no authored line contradicted. Rich lines are marked **[VP]** (voice pass required). Every box is <= 3 sentences. Generated from the game data by `node tools/rc2/new-story-doc.mjs` — this is exactly what ships.

## Contents (titles)

1. THE BRAIN (octopus brain scene, inside A00 · THE GOLDFISH YEARS)
2. THE YAM
3. FUFU FRIDAY
4. THE AUNTIE COUNCIL
5. ASO EBI
6. THE FOIL PLATES
7. THE CLUB · FIRST NIGHT
8. CHEAP-BUY ENCOUNTERS (tacos, malt, boba, coffee, gas station, thrift)
9. STRIP CLUB · FIRST-VISIT PROTECTION LINE (the door scene is "THE CLUB · FIRST NIGHT")
10. ENEMY BARKS (see BARKS.md)

## Needs art / not final

- **THE DOORMAN** (CLUB_FIRST) has no art: he speaks as a narrated "DOORMAN:" line with no figure on screen. A frozen doorman sprite is needed before he can appear.
- ASO EBI, THE AUNTIE COUNCIL, FUFU FRIDAY, THE FOIL PLATES reuse existing environments (`carson_owambe`, `naija_lot`, `kitchen`, `castle_exterior`, `naija_mart`) and existing characters (Uncle Sunday, the Auntie, Tunde, Mom, Coffe, Dre, Lil Smack). The cousin with the cooler in THE FOIL PLATES is narration only.
- Uncle Sunday's `melted`/`offended` states are not used here; he stays on his neutral state.

## 1. THE BRAIN (octopus brain scene)

Tied to the OCTOPUS BRAIN move. Plays inside the prologue, between "use my head." and the existing "rich does it literally." beat. Flag set: `octopusBrain` = whole / polite / asked.

**`brain`**
- **OCTOPUS_SENSEI**: …TAKE IT.
- **RICH [VP]**: take what?
- **(narration)**: the octopus taps its own head. twice.

**`brain_offer`**
- **OCTOPUS_SENSEI**: MY BRAIN. IT HAS EIGHT PARTS. ONE PER ARM.
- **OCTOPUS_SENSEI**: THE SEVENTH PART IS MOSTLY SNACKS.
- _choices:_ [TAKE THE WHOLE BRAIN] · [TAKE ONE PART. BE POLITE.] · [ASK IF IT HURTS · OCTOPUS]

**`brain_all`**
- **(narration)**: a small wet pop. rich now has a second brain.
- **RICH [VP]**: it is warm.

**`brain_one`**
- **(narration)**: the octopus hands over one part, like a slice of cake.
- **OCTOPUS_SENSEI**: …GOOD MANNERS. RARE.

**`brain_ask`**
- **OCTOPUS_SENSEI**: YES. A LOT.
- **(narration)**: it hands it over anyway.

**`brain_done`**
- **(narration)**: eight ideas arrive at once. all eight are snacks.
- **OCTOPUS_SENSEI**: THAT IS THE BRAIN. USE IT. OR EAT.

After-the-scene lines for presentation (Build 2): "the second brain wakes up. it already has an idea." · "eight thoughts, one move. rich picks the dumbest one." · "the octopus part of his head says: do not hit it. ask it."

## 2. THE YAM

_a yam, an auntie, a seatbelt._ Id `YAM`. Route: VampGPT/vampgpt want, day 4+: "the auntie at naija mart is holding a yam for you. do not ask."

**`arrive`** · env `naija_mart` · card "NAIJA MART · THE YAM"
- **(narration)**: behind the register, on its own chair: a yam the size of a toddler.
- **AUNTIE**: that is not a vegetable. that is a commitment.
- **RICH [VP]**: how much?
- **AUNTIE**: a yam has no price. a yam has a home. YOU are the home.
- _choices:_ [TAKE THE YAM ($6)] · ["DOES IT HAVE A WARRANTY?" · OCTOPUS] · [NO THANK YOU]

**`warranty`**
- **AUNTIE**: it has a mother. she is in a field. she is watching.
- **(narration)**: rich takes the yam.

**`refuse`**
- **AUNTIE**: you will be back.
- **(narration)**: she says it like weather. it is already true.

**`carry`** · env `naija_lot`
- **(narration)**: a yam does not go in the trunk. a yam rides shotgun.
- **(narration)**: rich buckles it in. the seatbelt light stops beeping.

**`kitchen`** · env `kitchen`
- **(narration)**: the yam sits on the counter like it pays rent.
- **(narration)**: mazda is staring at it from the rafters. mazda is hungry.

**`phone`**
- **(narration)**: the phone rings. it is uncle sunday. nobody told him about the yam.
- **UNCLE_SUNDAY**: you bought yam? good. now: boil, roast, or pound?
- _choices:_ [BOIL IT] · [ROAST IT] · [POUND IT] · [LET MAZDA DO IT · OCTOPUS]

**`boil`**
- **(narration)**: soft. plain. perfect.
- **UNCLE_SUNDAY**: BOILED. a man of peace. i am proud.

**`roast`**
- **(narration)**: crispy. smoky. it smells like a good decision.
- **UNCLE_SUNDAY**: ROASTED. street yam. i am crying a little.

**`pound`**
- **(narration)**: rich pounds for twenty minutes. the yam wins.
- **UNCLE_SUNDAY**: AH. the arm has no yam in it. practice.

**`dragon`**
- **(narration)**: mazda swoops down and breathes exactly once.
- **(narration)**: the yam is perfect. the counter is not.
- **UNCLE_SUNDAY**: a dragon-roasted yam. my grandfather would have died. happily.

**`end`**
- **(narration)**: rich eats the whole thing. he feels like he owes someone an apology.

## 3. FUFU FRIDAY

_one rule: you do not chew._ Id `FUFU`. Route: VampGPT/vampgpt want, day 5+: "tunde says you have never had fufu. he is taking it personally."

**`arrive`** · env `kitchen` · card "FUFU FRIDAY"
- **TUNDE**: tunde shows up with a bag of flour and a face of deep concern.
- **TUNDE**: you have never eaten fufu? at all?
- **TUNDE**: sit. today you become a man. or a better man.

**`mom`**
- **(narration)**: mom joins the video call. nobody invited her. she was always going to join.
- **MOM**: have you eaten? what are you eating? WHO IS COOKING?

**`rule`**
- **TUNDE**: rule one: you do not chew fufu.
- **RICH [VP]**: why not?
- **TUNDE**: it is not a steak. it is a friend. you tear, you dip, you swallow.
- _choices:_ [SWALLOW IT] · [CHEW IT (RULES ARE RULES)] · [ROLL IT WITH EIGHT TENTACLES · OCTOPUS]

**`swallow`**
- **(narration)**: it goes down in one piece. rich stares at the ceiling.
- **TUNDE**: …you are nigerian. i always knew.

**`chew`**
- **(narration)**: rich chews. the whole kitchen goes quiet.
- **MOM**: who raised you?
- **TUNDE**: i cannot look at him.

**`octo`**
- **(narration)**: eight tentacles. eight perfect balls. one very concerned dragon.
- **TUNDE**: that is cheating. it is also beautiful.

**`soup`**
- **(narration)**: the soup is egusi. it is red, hot, and personal.
- **MOM**: is the soup hot? it should hurt a little.
- **RICH [VP]**: …it hurts a little.

**`end`**
- **MOM**: good. now eat again. i will watch.

## 4. THE AUNTIE COUNCIL

_three folding chairs and a file on you._ Id `AUNTIES`. Route: VampGPT/vampgpt want, day 6+: "three aunties are in the naija mart lot. they asked about you."

**`arrive`** · env `naija_lot` · card "NAIJA MART · THE PARKING LOT"
- **(narration)**: three aunties on folding chairs, with a table and a thermos. nobody invited them.
- **AUNTIE**: the council has reviewed your file.
- **AUNTIE**: you are too thin. you are too pale. you are too single.
- **RICH [VP]**: i am a vampire.
- **AUNTIE**: and?

**`work`**
- **AUNTIE**: what work do you do?
- _choices:_ ["MUSIC."] · ["I HAVE A CASTLE."] · ["I AM A VAMPIRE."]

**`work_music`**
- **AUNTIE**: music is a hobby. what is the WORK.

**`work_castle`**
- **AUNTIE**: a castle! with whose money?
- **(narration)**: the other two aunties nod. that was the right question.

**`work_vamp`**
- **AUNTIE**: a vampire with a pension?
- **RICH [VP]**: no ma.
- **AUNTIE**: we will pray.

**`wed`**
- **AUNTIE**: are you married?
- _choices:_ ["NO MA."] · ["IT IS COMPLICATED."] · ["I AM VERY BUSY."]

**`wed_no`**
- **AUNTIE**: sad.
- **AUNTIE**: my niece is a doctor. she is also a lawyer. she is single.

**`wed_comp`**
- **AUNTIE**: who is she? what is her mother's name?
- **(narration)**: the thermos is put down. this is now an investigation.

**`wed_busy`**
- **AUNTIE**: busy people still eat. EAT.

**`eat`**
- **(narration)**: a foil plate appears in rich's hands. nobody saw it arrive.
- **AUNTIE**: do not wash the foil. we want the foil back.

**`verdict`**
  _variant 1_
- **(narration)**: the council confers. it takes eleven seconds.
- **AUNTIE**: you are acceptable. barely.
  _variant 2_
- **(narration)**: the council confers. it takes forty minutes.
- **AUNTIE**: you are a project. we like projects.

## 5. ASO EBI

_gold cloth + the DANCE FLOOR minigame, sprayed with money._ Id `ASOEBI`. Route: VampGPT/invite want, day 8+: "owambe saturday. the aso ebi is gold. do not argue."

**`arrive`** · env `carson_owambe` · card "OWAMBE · ASO EBI"
- **UNCLE_SUNDAY**: uncle sunday hands you a bag. inside: gold fabric. a lot of gold fabric.
- **UNCLE_SUNDAY**: this is the aso ebi. same cloth, so everyone knows who is family.
- **RICH [VP]**: i wear black.
- **UNCLE_SUNDAY**: today you wear GOLD.
- _choices:_ [WEAR THE GOLD] · [GOLD OVER BLACK] · [WEAR BLACK ANYWAY]

**`gold`**
- **(narration)**: rich looks like a very expensive curtain.
- **UNCLE_SUNDAY**: PERFECT.

**`mix`**
- **(narration)**: a gold sash. everything else black.
- **UNCLE_SUNDAY**: the compromise. i accept it. my sister will not.

**`black`**
- **(narration)**: the aunties gasp. one of them clutches a bread roll.
- **UNCLE_SUNDAY**: he will be forgiven. in time.

**`floor`**
- **(narration)**: the dj plays one song. the whole room turns to look at you.
- **UNCLE_SUNDAY**: dance well and they SPRAY you. real money. on your forehead.
- **UNCLE_SUNDAY**: dance badly and they pray for you.

**`dance`**
- _minigame:_ `dance`

**`after`**
  _variant 1_
- **(narration)**: the aunties start spraying. money sticks to rich's forehead.
- **UNCLE_SUNDAY**: THAT IS MY NEPHEW! THAT IS MY NEPHEW!
  _variant 2_
- **(narration)**: rich steps on an auntie's shoe. the room prays for him.
- **UNCLE_SUNDAY**: it is okay. we all start somewhere. mostly at weddings.
  _variant 3_
- **(narration)**: rich walks off the floor. the aunties make a note.

## 6. THE FOIL PLATES

_mom sent plates; everyone gets a plate._ Id `PLATES`. Route: VampGPT/vampgpt want, day 9+: "mom sent plates. ALL the plates. check your door."

**`knock`** · env `bedroom` · card "MOM SENT PLATES"
- **(narration)**: someone is knocking. a cousin rich has never met is holding a cooler.
- **MOM**: I SENT PLATES. EVERYONE GETS A PLATE. NO ONE IS LEFT OUT.
- **(narration)**: there are four plates. each has a name written in marker.

**`hub`** · env `castle_exterior`
  _variant 1_
- **(narration)**: where does the first plate go?
  _variant 2_
- **(narration)**: plates left. mom is checking.
- _choices:_ [PLATE FOR TUNDE] · [PLATE FOR COFFE] · [PLATE FOR DRE] · [PLATE FOR LIL SMACK]

**`tunde`**
- **(narration)**: tunde inspects the foil like a customs officer.
- **TUNDE**: who packed this? this is a master.

**`coffe`**
- **(narration)**: coffe eats it in four seconds.
- **COFFE**: I CAN TASTE SOUND NOW.

**`dre`**
- **DRE**: is it spicy?
- **(narration)**: it is. dre cries politely.

**`lil_smack`**
- **(narration)**: lil smack opens the foil with his mouth.
- **(narration)**: the foil is gone. nobody asks where.

**`end`** · env `castle_exterior`
- **MOM**: did everyone eat? SEND THE PHOTOS.
- **RICH [VP]**: they ate, ma.

## 7. THE CLUB · FIRST NIGHT

_first night: half off, half your cash, the rest stays home._ Id `CLUB_FIRST`. Route: VampGPT/vampgpt want, day 1+: "the club is open. first night is half off. i checked."

**`door`** · env `street_night` · card "THE CLUB · FIRST NIGHT"
- **(narration)**: a velvet rope. a very large man. a sign: FIRST NIGHT HALF OFF.
- **(narration)**: DOORMAN: first time? welcome. cover is half off tonight.
- **(narration)**: DOORMAN: house rule for first timers: bring half your cash. the rest stays home.
- **RICH [VP]**: half my bankroll?

**`rule`**
- **(narration)**: DOORMAN: yes. it is called not going broke on your first night.
- _choices:_ [GO IN WITH HALF] · [GO IN WITH $20] · [NOT TONIGHT]

**`half`**
- **(narration)**: the bass hits your chest. your wallet feels light and safe.

**`small`**
- **(narration)**: the doorman nods. he respects a man with a plan.

**`leave`**
- **(narration)**: DOORMAN: the rope is not going anywhere.

**`in`**
- **(narration)**: DOORMAN: spend the first half wisely. we will not hold your hand next time.

## 8. CHEAP-BUY ENCOUNTERS

A small buy ($2–$20) sometimes opens a 2-box moment with a person. TACOS is wired (about half of visits, deterministic per day); the rest are ready for Build 1's hook via `RAWriting.cheapBuyPick(kind)`.

**tacos**
- "a guy in line is whispering to his taco. it seems to be going well." / "guy: "the al pastor changed my life. do not tell my wife."" — tip: al pastor is the move.
- (meets officer_nodd) "officer nodd is in line behind you. he nods at the menu." / "he orders. he nods again. you are both somehow full." — tip: nodd likes you now.
- (meets don_chuy) "don chuy slides over a seventh taco. nobody ordered it." / ""for the castle guy. do not tell the others."" — tip: seventh taco. free.
- "a girl in line looks at your fangs. then your wallet. then your fangs." / "she hands you a flyer for a party. there is no address. there is a taco on it." — tip: a party flyer, no address.

**malt**
- (meets auntie) "the auntie sees you buying one malt. she adds a second malt to the bag." / ""one malt is a sad purchase. two is a plan."" — tip: two malts. she is not charging.
- "an old man at the freezer nods at your malt like you passed a test." / ""now you are a man." he does not explain." — tip: passed a test. no idea which.

**boba**
- "the cashier writes your name on the cup. it says RICH ALUMCARD." / "close enough. she gives you extra pearls for the trouble." — tip: extra pearls.
- "a stranger at the next table says: "tapioca is just a feeling."" / "you are not sure what that means. you feel it." — tip: a feeling, free.

**coffee**
- (meets coffe) "coffe appears behind you. he did not walk there." / ""THAT IS A SMALL. SIR. THAT IS A SMALL."" — tip: coffe is judging your size.

**gas_station**
- "the hot dog has been rolling since 2019. it salutes you." / "the clerk says: "you want it? i want it gone."" — tip: hot dog. free if you hurry.
- "you buy a scratch ticket. you win three dollars." / "you spend it on another ticket. a very american feeling." — tip: +$3, then -$3.

**thrift**
- "you find a jacket with $20 in the pocket. it is not your jacket." / "you put the $20 back. then you take it. then you put it back." — tip: a very honest jacket.

**generic**
- "the cashier says: "you look like you needed that."" / "you did." — tip: cashier believes in you.
- "a stranger next to you says: "good choice."" / "nobody has ever said that to you about anything." — tip: a compliment.

## 9. STRIP CLUB · FIRST VISIT

Build 2/1 wire the money. Words: 

- DOORMAN: first time? welcome. cover is half off tonight.
- DOORMAN: house rule for first timers: bring half your cash. the rest stays home.
- DOORMAN: it is called not going broke on your first night.
- RICH [VP]: half my bankroll?
- RICH [VP]: …that is the most responsible thing anyone has said to me.
- Deal tag: FIRST NIGHT · HALF OFF COVER · BRING HALF YOUR CASH, NO MORE
- LEAVING: "spend the first half wisely."
- LEAVING: "come back. the rope is not going anywhere. neither are we."
- Return visits: "welcome back. no more training wheels." / "we do not hold your money anymore. we hold your attention."

The door scene itself (CLUB_FIRST) sets the flags Build 1 reads: `clubFirstNight`, `clubBudgetCap` (half the bankroll, or $20 on the cautious option), `clubCoverDiscount` (0.5).
