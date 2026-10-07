// F01 THE PLAY — FEEL LOCK (OL-023) live-feed line bank. Data only; lines.mjs merges it into LINES so the T9 rules apply unchanged
// (>= 4 variants per trigger, no repeat within 3 PLAYs, pool > 3x its max uses in one PLAY).
//
// VOICE:  EVENTS are ALL CAPS.  CHATTER is lowercase / natural.  Card and tell pools are authored in chatter voice; the feed uppercases a
//         pool line when it needs the EVENT form ("we found the safe" -> "WE FOUND THE SAFE.").
// MARKS:  '=' prefix  locked, Ube-authored crew line — never altered, never transformed.
//         '^' prefix  a vampire Oga must be the speaker.
//         '~' prefix  a joke beat — the feed allows at most ONE per PLAY.
// TOKENS: {a} {b} names as written, {A} {B} uppercased.
// Crew voice only. RICH'S lines are governed by H1 and are NOT authored here (the only Rich text in the feed is "hello?" / "hello??").
export const FEED={
 // ---- outcome events per beat (EVENT voice): stage x tier
 'feed:ENTRY:2':['WE IN.','BACK DOOR OPEN.','CAMERAS DOWN.','IN. NOBODY LOOKED UP.'],
 'feed:ENTRY:1':['WE IN. IT\'S TIGHT.','IN. BUT SOMEBODY HEARD.','DOOR\'S OPEN. SOMETHING\'S OFF.','WE IN. WATCH YOUR STEP.'],
 'feed:ENTRY:0':['THEY SAW US.','WE\'RE BURNT. MOVING.','THE DOOR WAS A TRAP.','SOMEBODY TIPPED THEM.'],
 'feed:CONTACT:2':['HALL\'S CLEAR.','WE\'RE PAST THEM.','THEY NEVER LOOKED.','CLEAN THROUGH.'],
 'feed:CONTACT:1':['TWO IN THE HALL.','CONTACT. KEEP MOVING.','THEY\'RE ON US.','THAT GOT HEAVY FAST.'],
 'feed:CONTACT:0':['THEY\'RE EVERYWHERE.','WE\'RE PINNED.','THAT WENT WRONG FAST.','CONTACT. MORE THAN ONE.'],
 'feed:TROUBLE:2':['HANDLED IT.','THEY\'RE DOWN.','THAT WAS THE WORST OF IT.','STILL STANDING.',"WE'RE PAST THE WORST OF IT.","IT'S QUIET AGAIN.","THEY BROKE. THEY RAN."],
 'feed:TROUBLE:1':['GETTING LOUD.','IT\'S A MESS IN HERE.','HOLDING. BARELY.','NOT PRETTY. STILL MOVING.',"STILL FIGHTING.","WE'RE HANGING ON.","IT'S UGLY BUT WE'RE HERE."],
 'feed:TROUBLE:0':['THEY\'RE ALL OVER US.','THIS IS BAD.','WE\'RE LOSING THE ROOM.','NOBODY\'S MOVING.',"WE'RE GETTING KILLED IN HERE.","EVERYTHING WENT WRONG AT ONCE.","IT'S GOING BAD. IT'S GOING REAL BAD."],
 'feed:PRIZE:2':['WE GOT IT.','IT\'S ALL HERE.','BAGGED. ALL OF IT.','THAT\'S THE WHOLE THING.',"THAT'S EVERYTHING.","WE'VE GOT IT. WE'VE GOT IT ALL.","IT'S IN THE BAGS."],
 'feed:PRIZE:1':['GOT WHAT WE CAN CARRY.','PARTIAL. THEY\'RE COMING.','GRABBED IT. GO.','GOT IT. BARELY.',"WE GOT SOME OF IT.","GRABBING WHAT WE CAN.","HALF OF IT. GO."],
 'feed:PRIZE:0':['EMPTY-HANDED.','THEY GOT HERE FIRST.','WE LOST IT.','IT\'S GONE. LEAVE IT.',"THERE'S NOTHING HERE.","WE WERE TOO LATE.","IT'S ALL GONE."],
 // ---- bodies (EVENT voice)
 'feed:hit':['{A} GOT HIT.','{A} TOOK ONE.','{A} IS HIT.','HIT. {A} IS HIT.','{A} GOT CLIPPED.','THEY HIT {A}.','{A} — HE\'S HIT.',"{A} CAUGHT ONE.","{A} IS BLEEDING.","{A} JUST GOT TAGGED."],
 'feed:down:named':['{A} GOT SHOT.','{A} IS DOWN.','{A} DOWN. {A} DOWN.','SOMEBODY GET {A}.','{A} WENT DOWN HARD.','{A} ISN\'T MOVING.','THEY SHOT {A}.',"{A} IS ON THE FLOOR.","{A} WENT DOWN. WE'RE NOT LEAVING HIM.","THEY GOT {A}."],
 'feed:down:generic':['{A} IS DOWN.','WE LOST {A}.','{A} WENT DOWN.','{A} ISN\'T GETTING UP.','{A} GOT TAKEN OUT.','{A} IS GONE. KEEP MOVING.','{A} DIDN\'T MAKE IT.',"{A} IS OUT.","WE JUST LOST {A}.","{A} TOOK ONE TO THE CHEST."],
 'feed:saved':['GOT {A} UP.','{A} IS UP. MOVING.','DRAGGING {A}. KEEP GOING.','{A} IS WITH US.','WENT BACK FOR {A}. GOT HIM.','{A} IS ALIVE. HE\'S ALIVE.','CARRYING {A}.'],
 'feed:nerve':['{a} not ok','{a} froze up','{a}\'s hands are shaking','{a} is not here right now'],
 'feed:step:ok':['WENT BACK IN. GOT MORE.','MORE IN THE BACK. WE GOT IT.','SECOND ROOM. IT WAS WORTH IT.','BACK IN THE CAR. WITH MORE.'],
 'feed:step:fail':['THE ROOM CLOSED ON US.','THEY WERE WAITING FOR US TO COME BACK.','IT WAS A TRAP. WE WENT BACK IN.','THE WAY BACK IS WATCHED.'],
 'feed:out':['COMING OUT.','WE OUT.','MOVING. MOVING.','GOING TO THE CAR.'],
 // ---- the getaway (EVENT voice)
 'feed:getaway:CLEAN':['CAR OUT FRONT.','IN THE CAR. GO.','WHEELS ROLLING.','DRIVING. DRIVING.'],
 'feed:getaway:MESSY':['FEDS CLOSE.','SOMETHING\'S BEHIND US.','LIGHTS IN THE MIRROR.','WE\'RE BEING FOLLOWED.'],
 'feed:getaway:CRASH':['WE HIT SOMETHING.','THE CAR\'S DONE.','GET OUT. GET OUT.','WE CRASHED.'],
 'feed:getaway:SPLIT':['WE\'RE NOT ALL IN THE CAR.','HE LEFT US.','THE DRIVER TOOK OFF.','THEY DROVE OFF WITHOUT US.'],
 'feed:getaway:ROBBED':['THEY GOT US ON THE WAY BACK.','THEY TOOK IT ALL.','WE GOT JUMPED.','THE CAR STOPPED. THEY TOOK EVERYTHING.'],
 'feed:getaway:nodd':['NODD IS BEHIND US.','COP ON THE CORNER.','FEDS CLOSE.','NODD. NODD. NODD.'],
 'feed:bail':['GETTING EVERYBODY OUT.','WE\'RE OUT. ALL OF US.','NOBODY STAYS. GO.','LEAVE IT. WE\'RE GONE.'],
 'feed:fallback':['FALLING BACK. FALLING BACK.','PULLING OUT OF THE HALLS.','WE\'RE OUT OF THE HOUSE.','LET THEM HAVE THE ROOMS. GO.'],
 'feed:fold':['CALLING IT.','WALKING AWAY.','WE\'RE DONE HERE.','LEAVING WITH WHAT WE HAVE.'],
 // ---- tells (chatter voice): surfaced BEFORE the consequence, in the crew's mouth. '=' and '^' lines are Ube-authored / voice-gated.
 'feed:tell:charge':['enforcers up front. big ones.','=this nigga got a machete oh shit','they got shotguns at the door','the big guys are heading right for the front'],
 'feed:tell:flank':['they got somebody watching the back','car been sitting outside too long','they\'re going around both sides','somebody\'s posted in the back'],
 'feed:tell:silver':['^=these brudahs don\'t know im a vampire','=oh shit they brought garlic','they got silver on them. i can smell it','those are hunters. they\'re looking right at us'],
 'feed:tell:aura':['their boss is walking around like he\'s got a plan','the one in the green fur is out. everybody stood up','that one\'s giving orders. somebody get eyes on him','the lieutenant is lifting them'],
 // ---- the moment the crew sees the card (chatter voice; the feed uppercases these for EVENT/CALL form)
 'feed:card:bouncer':['a bouncer at the door with a clipboard','there\'s a guy on the door. he has a list','bouncer. no smile. clipboard','door\'s got a guy on it'],
 'feed:card:dog':['~dog\'s clocked all of us','there\'s a dog in the alley looking at me','dog. big one. awake','the dog knows'],
 'feed:card:fire_escape':['fire escape is the only way in','nobody\'s watching the fire escape','going up the fire escape','fire escape. it\'s rusty'],
 'feed:card:dumpsters':['way in is behind the dumpsters','crawlspace behind three dumpsters','it\'s tight back here','dead end. dumpsters. one way in'],
 'feed:card:crowd':['big crowd out front. everybody\'s dressed','there\'s a line out front','crowd on the door. too many eyes','half the block is out here'],
 'feed:card:wet_ramp':['ramp is wet. watch your feet','delivery ramp. it\'s slick','going down the ramp. slowly','the ramp is a slide right now'],
 'feed:card:shutters':['shutters are loud as hell','the loading shutters are screaming','shutter\'s stuck. loud','every shutter on this dock is loud'],
 'feed:card:stoop':['two on the stoop. chewing. looking right at us','they\'re on the stoop and they see us','stoop\'s got people on it','two guys on the stoop, not blinking'],
 'feed:card:lookouts':['lookouts saw us early','somebody up top spotted us','they\'ve got eyes on the street','lookout on the corner. he saw us'],
 'feed:card:door_wall':['door opened and the room behind it is full','the room is full. the room is FULL','there\'s a lot of them behind that door','door\'s open. bad idea'],
 'feed:card:roof_line':['somebody on the roof has a good angle','they got the high ground','shooter up top','somebody\'s above the line. keep low'],
 'feed:card:crowd_fight':['fight just broke out. it\'s dragging everybody in','can\'t tell who\'s who in here','it\'s a brawl. everyone\'s in it','fight in the middle of the room'],
 'feed:card:camera_room':['camera room saw us first','there\'s a camera on us right now','they\'ve got eyes on the cameras','camera room is lit up'],
 'feed:card:reinforcements':['headlights. a lot of headlights','second van just pulled up','there\'s more of them than there should be','more of them coming. lots more'],
 'feed:card:alarm':['alarm just went off','somebody hit the alarm','alarm. it\'s the loud kind','the alarm. everybody turned around'],
 'feed:card:power_cut':['lights just died','power\'s out. can\'t see','it\'s dark. somebody\'s laughing. not us','all the lights went off'],
 'feed:card:lieutenant_out':['the one in the green fur just walked out','their boss just stepped out','the lieutenant is here. everybody stood up','big guy in the green fur. he\'s looking at us'],
 'feed:card:nodd':['nodd is rolling past the lot','officer nodd. slowly. staring','cop car. it\'s nodd. it\'s him','nodd stopped nodding'],
 'feed:card:third_crew':['a third crew just pulled up','who are these guys. nobody said a third crew','third crew. they want it too','somebody else is here for it'],
 'feed:card:someone_down':['it went wrong in one second','it just went wrong. all at once','somebody\'s down','it all went bad at once'],
 'feed:card:safe':['we found the safe','safe\'s right here. it\'s huge','got eyes on the safe','the safe is bigger than the room'],
 'feed:card:office_cash':['found the back office. cash everywhere','back office. so much cash','the office has too much cash in it','cash. a lot of it'],
 'feed:card:crate_stack':['found the crates. all stamped','crates stacked to the ceiling','it\'s the supply room. heavy stuff','stack of crates. we can take some'],
 'feed:card:client_handover':['the client\'s here. wants to talk numbers','client wants to negotiate. right now','the buyer showed up early','client is at the table. we have to deal'],
 'feed:card:hidden_stash':['somebody hid something back here','found a false wall','this room smells like fresh paint. that\'s the stash','a hidden stash. told you'],
 'feed:card:armory_rack':['there\'s a rack of guns behind the curtain','found the guns','armory. real nice ones','rack of guns. not touching the alarm'],
 'feed:card:the_real_prize':['it\'s too quiet in here','room\'s quiet in a bad way. something\'s in it','something is in this room. it\'s quiet','why is it this quiet'],
 // ---- silence (catastrophe) — feed cuts MID-EVENT. {A}/{B} name a crew member. Fragments are EVENT voice and are never completed.
 'feed:cut':['THEY\'RE ALL O','{A} GET DO','WE\'RE PINNED. WE\'RE PIN','{A}— {A}—','GET BACK TO THE CA'],
 'feed:hush':['MAZI—','ANYBODY—','THEY\'RE COMING FROM—','DON\'T MOVE—'],
 // ---- HIT ONE MORE, in fiction (no EV, no percentages). What is lit is what is really in the next step; the read is the crew's own condition.
 'feed:climb:lit:LEGENDARY':['there\'s something gold in the back room','the back room is glowing. gold. actual gold','i can see gold from here. in the back','the back room has something in it. something real',"there's gold back there. real gold","the back room is lit up. it's the real thing","i can smell the good stuff from here"],
 'feed:climb:lit:RARE':['there\'s a teal crate in the back room','something in the back room is worth a look','there\'s another crate back there. a good one','back room. one crate. it\'s the good kind',"there's something worth grabbing back there","one more crate. a nice one","there's a crate in the back with a nice lid"],
 'feed:climb:lit:COMMON':['nothing worth it back there','there\'s just junk in the back room','we could go back in but for what','back room is basically empty',"just boxes back there","nothing in the back room worth the walk","it's picked clean back there"],
 'feed:climb:read:FRESH':['we\'re good. we\'re actually good','nobody\'s even bleeding','everybody\'s breathing normal','we could do this all night',"everybody's still fresh","honestly this is going fine","no complaints from anybody"],
 'feed:climb:read:BANGED UP':['we\'re banged up but moving','couple of us are hurting','we got some bleeding','we\'ve been better. we\'re ok',"we're limping but we're moving","somebody's bleeding on the seats","we can do one more. maybe"],
 'feed:climb:read:RAGGED':['we\'re hanging on by nothing','everybody\'s hurt. everybody','nobody can take another hit','we are done. we are so done',"we can barely stand","this is the end of the road for us","nobody's ok. nobody"],
 'feed:turn':['there\'s a kid back here. says he wants in','somebody in the back is asking to be turned. says he\'s sure','a guy in the storeroom wants what we have. willing. begging, kind of','he wants in. he keeps saying it. willing'],
 // ---- false alarm (a rare silence that turns out to be nothing)
 'feed:false':['=my bad phone died lmao','phone died. im good. all good','battery. sorry sorry sorry','dropped it in a sink. we good'],
 // ---- OBA DE GWINNETT (crew voice only; his look is F12 Visual A / Ube)
 'feed:oba:in':['=oh shit is that OBA DE GWINNETT?!','THAT\'S OBA. THAT\'S OBA DE GWINNETT.','OBA DE GWINNETT IS HERE.','NOBODY SAID OBA DE GWINNETT WAS HERE.'],
 'feed:oba:cut':['OBA DE GWIN—','THAT\'S OBA—','OBA DE—','IS THAT OBA DE GWINNETT—'],
 'feed:oba:back':['we out. dont ask.','we\'re out. everybody\'s breathing. dont ask.','car\'s moving. nobody talk.','we got out. i dont wanna talk about it.'],
 // ---- narrator forms used by the report record (engine)
 'oba:appear':['{a} looked up and saw OBA DE GWINNETT','OBA DE GWINNETT stepped into the light and the room agreed with him','{a} recognised the coat first, then OBA DE GWINNETT','OBA DE GWINNETT was already there, as if the night had been booked around him'],
 'oba:collapse':['The run collapsed. Nobody argued. {a} counted heads and ran.','Nobody was hurt badly enough to stop; everybody left at once. {a} drove the crew home with nothing.','It was over before it started. {a} got them out and the guns stayed behind.','{a} pulled the crew out through the back. The take stayed on the floor.']
};
