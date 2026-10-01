// F07 — Phase 1 THE PARTY as F07-OWNED CONFIGURATION of F01's PLAY. F01 is frozen and is NOT edited: the PLAY page's modules export
// their content tables as mutable module state (JOBS array, CARDS stage pools), and F07's own page (assets/f07/play/index.html) loads
// them UNCHANGED, calls install(), then boots F01's controller. Only the F07 page ever installs this; F01's page and every other
// consumer see F01's stock content.
//
// Source (Patch 1 §4.2 Phase 1 / §8 / §7):
//   "clear Gbenga's boys through a warehouse full of canopies and stacked chairs without disrupting the owambe (hitting a canopy pole
//    collapses it on whoever's under it — including you). Aunties are non-combatants who block lines of fire and critique your tactics
//    out loud."  /  "Gbenga's boys (Showdown): Vol 7 ENFORCER/CHEWER stats; one LIEUTENANT."
// How each authored mechanic is expressed in the PLAY's own vocabulary (stage cards with a hazard {word, odds modifier}, which the engine
// applies to aim and success odds and names as the CAUSE of any crew it costs):
//   CANOPY POLE  TROUBLE card: a hazard that lands on whoever is under it — Rich's own crew included (the cause is named in the aftermath).
//   AUNTIES      CONTACT card: non-combatants in the line of fire (an aim/odds hazard). Their out-loud critique has NO authored text, so none
//                is written: the feed carries only a restatement of the authored mechanic (below). The critique lines are a D-queue item (D4).
//   one LIEUTENANT, ENFORCER/CHEWER pods; favors QUIET ("without disrupting the owambe").
// The two hazard magnitudes are MECHANICAL TUNING (the source authors the effect, not the number).
export const JOB_ID='owambe_party';
export const TUNING=Object.freeze({CANOPY_POLE_MOD:-.08,AUNTIES_MOD:-.06});
export const CARDS_F07=Object.freeze({
 aunties:{id:'aunties',tags:['crowd','cover'],hazard:{word:'the aunties were standing in the line of fire',mod:TUNING.AUNTIES_MOD},calls:['TALK','SNEAK','FOLD'],
  text:'The aunties are non-combatants: they block lines of fire and critique the tactics out loud.'},
 canopy_pole:{id:'canopy_pole',tags:['collapse','cover'],hazard:{word:'a canopy pole came down on whoever was under it',mod:TUNING.CANOPY_POLE_MOD},calls:['PUSH','SNEAK','FOLD'],
  text:'A canopy pole is hit and the canopy collapses on whoever is under it, Rich’s crew included.'}
});
// LIVE FEED: one line per card, restating the authored §4.2 sentence (not authored dialogue; wording awaits the creator, D-queue D4).
export const FEED_F07=Object.freeze({
 'feed:card:aunties':['the aunties are non-combatants. they block lines of fire and critique the tactics out loud'],
 'feed:card:canopy_pole':['a canopy pole is hit. the canopy collapses on whoever is under it']
});
export const JOB={id:JOB_ID,shape:'TAKE THE BLOCK',names:['THE PARTY'],pitchers:['tunde','dre'],band:[22,40],ugly:'NASTY',faction:'GBENGA’S BOYS',
 tell:'every canopy Rich ever delivered is up and every aunty is there',place:'Gbenga’s warehouse: a floor of canopies and stacked white chairs, the owambe in full swing',
 favors:'QUIET',size:[3,4],octopus:null,
 pods:{CONTACT:['CHEWER','CHEWER'],TROUBLE:['LIEUTENANT','CHEWER'],PRIZE:['CHEWER','ENFORCER'],REINF:['ENFORCER','CHEWER']},
 tilt:{CASH:4,BLOOD_X:2,GUN:3,MOD:2,RECRUIT:1,STORY:1,DISTRICT:3,WEIRD:2},heat:6,silhouettes:['GUN','DISTRICT']};
// install(C): idempotent; returns an undo() so a shared-process test run can restore F01's stock tables exactly.
export function install(C,L=null){
 if(C.JOBS.some(j=>j.id===JOB_ID))return ()=>{};
 const saved={contact:[...C.CARDS.CONTACT],trouble:[...C.CARDS.TROUBLE]};
 C.JOBS.push(JOB);
 if(L)for(const [k,v] of Object.entries(FEED_F07))L.LINES[k]=[...v];
 C.CARDS.CONTACT.splice(0,C.CARDS.CONTACT.length,CARDS_F07.aunties);
 C.CARDS.TROUBLE.splice(0,C.CARDS.TROUBLE.length,CARDS_F07.canopy_pole);
 return ()=>{
  const i=C.JOBS.findIndex(j=>j.id===JOB_ID);if(i>=0)C.JOBS.splice(i,1);
  if(L)for(const k of Object.keys(FEED_F07))delete L.LINES[k];
  C.CARDS.CONTACT.splice(0,C.CARDS.CONTACT.length,...saved.contact);
  C.CARDS.TROUBLE.splice(0,C.CARDS.TROUBLE.length,...saved.trouble);
 };
}
