(function(){
 'use strict';
 // RC3 · BUILD A · THE CUT (OL-074). One source for everything Ube cut after the RC2 playthrough ("streamline the game drastically",
 // "90% random adventures, 10% actual story"). Pillars: funny jokes · a clear story · cool sexy strippers · awesome fights · adventures only
 // if the player chooses. Cut = removed from play (unreachable and not shown); code and assets stay in the repo.
 // This file is DATA. js/systems/rc3_cut.js enforces it at runtime; docs/rc3/CUT_LIST.md is generated from it (tools/rc3/cut-list.mjs).

 // ---- the phone: EIGHT apps, exactly, in this order (OL-077: VampGram had no real job, so it is folded into Texts as its FEED row) ----
 //   VampGPT  the next story step + today's loop          Texts      every thread (family, homies, dancers) + the VampGram feed
 //   War Room the PLAY board (the daily fight/cash)        Strip Club the nightly cash sink and the dancers' dates
 //   Armory   guns                                         Bank       money + property (buildings, cars, castle rooms)
 //   Maps     the ten optional adventures + the day job    Rich Radio the songs
 const APPS=Object.freeze([
  Object.freeze({id:'vampgpt',label:'VampGPT'}),Object.freeze({id:'texts',label:'Texts'}),Object.freeze({id:'warRoom',label:'War Room'}),
  Object.freeze({id:'stripClub',label:'Strip Club'}),Object.freeze({id:'armory',label:'Armory'}),Object.freeze({id:'bank',label:'Bank'}),
  Object.freeze({id:'maps',label:'Maps'}),Object.freeze({id:'radio',label:'Rich Radio'})
 ]);

 // ---- adventures that are not "random adventures": they are the spine, a system the phone runs, or the dancers' dates ----------------
 const SPINE=Object.freeze(['A00']);                              // + every NEW_OGA_* id (the ladder, M8, the finale) by prefix
 const FUNCTIONAL=Object.freeze(['THRONE','RE_VIEWING','A08','SLURP']);   // training dummy fight · property viewing · the day job (cash floor)
 const isSpine=id=>SPINE.includes(id)||/^NEW_OGA_/.test(id);
 const isStripper=id=>/^F15_/.test(id);                           // the twelve dancer dates (reached inside the club)
 const isFunctional=id=>FUNCTIONAL.includes(id);

 // ---- the keepers: the best TEN random adventures by funny + story value (OL-077), reachable ONLY through the Maps app. -------------
 // Ranked best first. `tag` is the one word under the title in Maps. `when` (optional) REPLACES the adventure's own gate: it exists so a
 // keeper whose original window has closed (or whose prerequisite was cut) is still playable. Nothing pushes these: no notification,
 // no VampGPT line, no morning card, no temptation, no wake trigger. None uses a cut minigame.
 const OPTIONAL=Object.freeze([
  {id:'A30',tag:'STORY'},                                                       // BAD PORTOBELLOS: the regular life
  {id:'A29',tag:'FUNNY',when:L=>!L.done('A29')},                                // COFFE RUN (was Days 2-8 only)
  {id:'A29C',tag:'FIGHT',when:L=>L.done('A29')&&!L.done('A29C')},               // THE RAID: four fights in one night
  {id:'A18',tag:'FIGHT'},                                                       // FORTY KEVINS
  {id:'A19',tag:'FIGHT'},                                                       // BRUCE LOOSE AT THE FOOD COURT
  {id:'A23',tag:'FIGHT'},                                                       // HILT DOESN'T PLAY
  {id:'A43',tag:'FUNNY'},                                                       // NAIJA MART & THE MALT
  {id:'YAM',tag:'FUNNY'},                                                       // THE YAM
  {id:'A31',tag:'STORY'},                                                       // GOD ON THE CURB (Sundays)
  {id:'A20',tag:'FIGHT'}                                                        // POWER LEVEL PHIL (repeatable)
 ].map(o=>Object.freeze(o)));
 const OPTIONAL_IDS=Object.freeze(OPTIONAL.map(o=>o.id));
 const isOptional=id=>OPTIONAL_IDS.includes(id);

 // ---- story-line choices that would close the story: the ladder must always continue ---------------------------------------------------
 // (adventure id, node id, choice label) — hidden at runtime so a pitch / interview can never end the arc. Code and text stay in the repo.
 const DEAD_ENDS=Object.freeze([['NEW_OGA_M1','pitch','NAH'],['NEW_OGA_M1','table','BUY A BOBA AND LEAVE'],['NEW_OGA_M2','debt','PAY $20,000 · END']]);

 // ---- world events (phone "INCOMING"): only the one that carries the story is ever delivered ------------------------------------------
 const STORY_EVENTS=Object.freeze(['ogun_rave_invite_001']);

 // ---- what the cut turns off outright ------------------------------------------------------------------------------------------------
 const FLAGS_OFF=Object.freeze(['F05.trap']);                     // The Trap (F05): cut
 const APPS_OFF=Object.freeze(['trap','instahoe','onlyvamps','richboi','jdmImports','realEstate','contacts','receipts','vampgram','hatch','touge','bars','moves','rainmaker','castle','cars','realestate']);

 // ---- pace: a ~21-day game (OL-077). The earliest DAY each story beat can land; one beat per day at most, with breather days between. ----
 const PACE=Object.freeze({offer:1,rave:2,NEW_OGA_M1:3,NEW_OGA_M2:5,NEW_OGA_M3:7,NEW_OGA_M4:9,NEW_OGA_ALTERNATIVE:10,NEW_OGA_M5:11,NEW_OGA_M6:13,NEW_OGA_M7:15,
  NEW_OGA_M8:16,NEW_OGA_M9:17,NEW_OGA_M10:18,NEW_OGA_VAMPGPT:19,NEW_OGA_FINALE:21});
 // ---- minigames (OL-076B): the strip club, ramen, the rave dance and Range Day stay. The rest are not standalone any more. ----------------
 // touge (SET UP CARLOS / JUG THE PLUG) and owambe_collection (THE OWAMBE COLLECTION) stay ONLY as beats inside the story; everything else is hidden.
 const MINIGAMES_KEEP=Object.freeze(['slurp','dance','range_day','make_it_rain','touge','owambe_collection']);
 const MINIGAMES_STORY_ONLY=Object.freeze(['touge','owambe_collection']);
 // ---- guns (OL-076B): five stay, all mods are hidden --------------------------------------------------------------------------------
 const GUNS_KEEP=Object.freeze(['lil_oga','sapporo_shotgun','holy_baby_drake','golden_draco','auntie_slipper']);
 // ---- combat menu (OL-076B): at most six moves: the core four, the equipped gun, one learned move (swappable in the ARMORY) ------------
 const COMBAT_MENU_MAX=6;

 function classify(id){
  if(isSpine(id))return 'spine';
  if(isStripper(id))return 'stripper';
  if(isFunctional(id))return 'functional';
  if(isOptional(id))return 'optional';
  return 'cut';
 }
 window.RARC3Cut=Object.freeze({APPS,SPINE,FUNCTIONAL,OPTIONAL,OPTIONAL_IDS,DEAD_ENDS,STORY_EVENTS,PACE,MINIGAMES_KEEP,MINIGAMES_STORY_ONLY,GUNS_KEEP,COMBAT_MENU_MAX,FLAGS_OFF,APPS_OFF,classify,isSpine,isStripper,isFunctional,isOptional});
})();
