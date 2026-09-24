// BARS word pools. Loaded lazily by js/minigames/bars.js (injected <script> tag; not in js/minigames/index.js).
// Shape: {families:{key:[WORD,...]}, slant:{familyKey:[WORD,...]}, falseFriends:[[WORD,...],...], punchlines:[WORD,...], pools:{name:{families:{...}}}}
// families = perfect-rhyme groups. slant = near-rhymes for a family (CURVEBALL: correct only at combo>=10).
// falseFriends = clusters that LOOK like they rhyme (same spelling pattern) but don't — always wrong.
// punchlines = rare gold words, worth +1000 whenever tapped. Rich-flavored words are {vp:true} in spirit (placeholder slang, no canon voice lines here — just single words).
(function(){
 window.RABarsWords = {
  families:{
   uck:['DUCK','TRUCK','LUCK','STUCK','BUCK','PLUCK','TUCK','CLUCK','MUCK','CHUCK','SUCK','STRUCK'],
   ame:['GAME','FAME','NAME','FLAME','BLAME','SAME','TAME','DAME','FRAME','SHAME','CLAIM','AIM'],
   ight:['NIGHT','LIGHT','FIGHT','SIGHT','FLIGHT','MIGHT','TIGHT','RIGHT','BRIGHT','SLIGHT','FRIGHT','KITE'],
   ow:['FLOW','GLOW','SHOW','GROW','SLOW','BLOW','THROW','SNOW','CROW','ROW','KNOW','LOW'],
   un:['SUN','RUN','FUN','GUN','STUN','SPUN','BUN','SHUN','NUN','DONE','WON','TON'],
   ay:['DAY','WAY','SAY','PLAY','STAY','PAY','GRAY','TRAY','SWAY','CLAY','SLAY','STRAY'],
   eet:['STREET','SWEET','MEET','FEET','BEAT','HEAT','SEAT','TREAT','GREET','SHEET','FLEET','NEAT'],
   ine:['LINE','MINE','FINE','SHINE','WINE','NINE','SPINE','VINE','TWINE','DESIGN','DEFINE','SIGN'],
   ock:['ROCK','LOCK','CLOCK','BLOCK','SOCK','KNOCK','STOCK','DOCK','MOCK','SHOCK','FLOCK','FROCK'],
   ent:['RENT','CENT','WENT','SENT','SPENT','BENT','DENT','LENT','TENT','VENT','SCENT','CONTENT'],
   ing:['KING','RING','SING','BRING','THING','SWING','SPRING','WING','STING','FLING','CLING','STRING'],
   own:['TOWN','DOWN','CROWN','FROWN','CLOWN','GOWN','BROWN','DROWN','NOUN','RENOWN'],
   ire:['FIRE','WIRE','TIRE','HIRE','DESIRE','INSPIRE','ENTIRE','ATTIRE','CHOIR','ADMIRE'],
   all:['BALL','CALL','TALL','WALL','FALL','HALL','SMALL','STALL','MALL','CRAWL','BRAWL','SPRAWL'],
   and:['HAND','LAND','BAND','STAND','GRAND','SAND','BRAND','DEMAND','COMMAND','ISLAND'],
   art:['HEART','ART','START','PART','SMART','CHART','CART','DART','APART','DEPART'],
   ars:['CARS','STARS','BARS','JARS','MARS','SCARS','WARS','GUITARS','CIGARS','AVATARS'],
   obe:['ROBE','GLOBE','PROBE','WARDROBE','STROBE'],
   orn:['BORN','CORN','MORN','TORN','HORN','WORN','SWORN','THORN','SCORN'],
   oney:['MONEY','HONEY'],
   eal:['REAL','DEAL','FEEL','STEAL','HEAL','MEAL','SEAL','ZEAL','APPEAL','CONCEAL','REVEAL','KNEEL'],
   ive:['FIVE','DIVE','DRIVE','ALIVE','ARRIVE','SURVIVE','THRIVE','JIVE','HIVE','REVIVE'],
   ip:['TRIP','FLIP','GRIP','SKIP','CHIP','CLIP','SLIP','SHIP','TIP','ZIP','RIP','DRIP'],
   ack:['BACK','TRACK','PACK','STACK','ATTACK','BLACK','CRACK','SNACK','RACK','JACK','WACK','STACKS'],
   ash:['CASH','FLASH','TRASH','CRASH','DASH','SPLASH','CLASH','BASH','STASH','GASH','MASH','SMASH'],
   eak:['SPEAK','WEAK','PEAK','LEAK','STREAK','FREAK','SNEAK','TWEAK','CREAK','BLEAK'],
   ope:['HOPE','ROPE','SLOPE','SCOPE','DOPE','NOPE','ELOPE','MOPE'],
   ile:['SMILE','STYLE','FILE','MILE','PILE','WHILE','AISLE','PROFILE'],
   oat:['BOAT','COAT','FLOAT','GOAT','NOTE','QUOTE','WROTE','THROAT','MOAT'],
   ense:['SENSE','DENSE','FENCE','TENSE','HENCE','PENCE','DEFENSE','INTENSE'],
   eam:['DREAM','STREAM','TEAM','BEAM','GLEAM','SCREAM','CREAM','SEAM','THEME','SUPREME'],
   ide:['RIDE','SIDE','PRIDE','GUIDE','WIDE','TIDE','GLIDE','SLIDE','HIDE','BRIDE','STRIDE','DECIDE'],
   ocs:['LOCS','ROCKS','BLOCKS','SOCKS','DOCKS','KNOCKS','SHOCKS','CLOCKS','STOCKS','FLOCKS'],
   angs:['FANGS','GANGS','BANGS','HANGS','CLANGS','TWANGS','SLANGS'],
   astle:['CASTLE','HASSLE','TASSEL','WRESTLE','VESSEL'],
   oga:['OGA','TOGA','YOGA'],
   ats:['RATS','CATS','HATS','BATS','MATS','STATS','CHATS','FLATS','SPATS','PATS','COMBATS']
  },
  slant:{
   uck:['CUP','UP','LOVE','ENOUGH'],
   ame:['RAIN','MAIN','PLAIN'],
   ight:['LIFE','KIND','TIME'],
   ow:['OUT','ABOUT','SOUTH'],
   un:['SONG','LONG','WRONG'],
   ay:['GAME','SAME','LANE'],
   ock:['DOG','LOG','FOG'],
   ent:['FRIEND','BEND','TREND'],
   ing:['THINK','LINK','PINK'],
   ars:['HARD','CARD','YARD'],
   ats:['MATCH','BATCH','CATCH'],
   ocs:['LOX','FOX','BOX']
  },
  falseFriends:[
   ['COUGH','DOUGH','ROUGH','THROUGH','THOUGH','BOUGH'],
   ['BOMB','TOMB','COMB'],
   ['HEARD','BEARD'],
   ['GOOD','FOOD','BLOOD','MOOD'],
   ['LOVE','MOVE','GROVE','PROVE'],
   ['FIVE','GIVE','LIVE'],
   ['NOW','KNOW','SNOW','PLOW']
  ],
  punchlines:['JOLLOF','MAZDA','SUPRA','SAPPORO','OGA','LOCS','FANGS','ALUCARD','RICHER','MIDNIGHT'],
  pools:{
   spanish:{families:{
    ada:['NADA','JADA','HELADA','PARADA','MADRUGADA'],
    ion:['CANCION','CORAZON','PASION','RAZON','PERDON'],
    ia:['ALEGRIA','FANTASIA','MELODIA','VALENTIA'],
    or:['AMOR','CALOR','DOLOR','SABOR','VALOR']
   }},
   slang:{families:{
    gg:['GG','FR FR','OK OK','GO GO'],
    ff:['FF','SPAM','CLAMP'],
    turn:['ONE MORE TURN','RETURN','NO RETURN'],
    w:['W','SPEEDRUN','RUN IT BACK']
   }},
   food:{families:{
    off:['JOLLOF','TROUGH','SCOFF'],
    uce:['SAUCE','JUICE','DEUCE','SPRUCE'],
    ice:['RICE','SPICE','NICE','TWICE','PRICE','DICE'],
    ame:['FLAME','TAME','GAME','NAME']
   }}
  }
 };
})();
