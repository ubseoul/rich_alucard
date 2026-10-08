// OL-050 private content-card facade; OPEN functions and presentation stay accepted.
export * from '../../frag/F01/play/adapter.mjs?build3-real';
import * as OPEN from '../../frag/F01/play/adapter.mjs?build3-real';
import * as C from '../../frag/F01/play/content.mjs';
import * as W from '../../frag/F01/play/world.mjs';
import {D} from '../../frag/F01/play/env.mjs';
import * as E from './engine.mjs';
const card=(id,text,fields={})=>({id,sealedScripted:true,tags:['cover'],hazard:null,calls:['TALK','SNEAK'],text,...fields});
export function prepareWorld(req,saved){
 const p=req.build3S11;
 if(p?.detroitGift){
  // Native seats and recovery behaviour; authored earned-car grip and WHEELS modifier.
  C.CARS.P5={...C.CARS.SUPRA,word:'THE DECEMBER',grip:4,build3WheelsBonus:.15};
  const gun=D.WEAPONS.legendary_draco;
  C.GUNS.legendary_draco={name:'DECEMBER’S GIFT',role:gun.label,dmg:[...gun.dmg],lane:'ANY',flavor:gun.note,eff:null,build3Bursts:gun.bursts,build3BurstAim:gun.burstAim};
 }
 const w=OPEN.prepareWorld(req,saved);
 if(!p)return w;
 // Unsupplied sulk magnitude: one aim point, the smallest native aim step. Permanent +20 never stacks.
 const m=w.roster.find(o=>o.id==='young_mazi');
 if(m){m.aim-=Number(m.build3Aim)||0;m.build3Aim=Number(p.maziAim)||0;m.aim+=m.build3Aim;}
 if(p.detroitGift&&!w.flags.build3P5Gun){
  if(!w.armory.includes('legendary_draco')&&!w.roster.some(o=>o.gun==='legendary_draco'))w.armory.push('legendary_draco');
  w.flags.build3P5Gun=true;
 }
 return w;
}
export function sealedCards(req){
 const p=req.build3S11||{},cards={};
 if(p.wrong)cards.CONTACT=card('P2-wrong',p.wrong==='RE_UP'?'The re-up is ambushed.':'The client already knew the squad was coming.',{tags:['dock','cover'],hazard:{word:p.wrong==='RE_UP'?'the re-up was ambushed':'the client already knew the squad was coming',mod:-.04},calls:['TALK','SNEAK','FOLD']});
 if(p.chewer)cards.TROUBLE=card('P2-chewer','TALK HIM DOWN on a captured Chewer spills the name.',{capturedIdentity:{id:'P2-chewer',type:'CHEWER',captured:true},calls:['TALK','FOLD']});
 if(p.bait){for(const stage of E.STAGES)cards[stage]=card(`P2-bait-${stage}`,'The rivals walk into a Showdown on Rich’s terms. All Ogas start concealed.',{forcedOutcome:'WIN',concealAll:stage==='ENTRY',calls:[]});}
 if(p.coffeExiled)cards.CONTACT=card('P4-coffe','Coffe runs crates for the Open Mouth Gang. A lieutenant with an iced coffee.',{capturedIdentity:{id:'P4-coffe',type:'LIEUTENANT',captured:false},forcedOutcome:{call:'TALK',identity:'P4-coffe'},calls:['TALK','FOLD']});
 if(p.coffeCover)cards.ENTRY=card('P4-cover','The raid starts with Rich’s squad in full cover.',{fullCover:true,calls:['TALK','SNEAK']});
 if(p.detroit){for(const stage of ['ENTRY','CONTACT','TROUBLE','PRIZE'])cards[stage]=card(`P5-${stage}`,'A frozen Detroit parking lot under sodium lights.',{tags:['wet','cover'],hazard:{word:'long moves slide farther on the frozen lot',mod:-.05},calls:stage==='ENTRY'?['SNEAK','BUST']:['TALK','SNEAK']});}
 if(req.build3No1)cards.TROUBLE=card('NO-S1','Smallie recognizes Kiki’s tapioca in a cooler and stops the music: “…IT WAS YOU?” He switches sides for one turn, then goes back to being scared.',{tags:['music','cover'],hazard:{word:'a song makes every enemy dance and skip their turn',mod:.06},calls:['PUSH','SNEAK']});
 return cards;
}
export function pitchFor(w,req){
 const picked=OPEN.pitchFor(w,req);if(!picked.pitch)return picked;
 const p=req.build3S11||{},cards=sealedCards(req),j=picked.pitch.job;let job={...j};
  if(p.audit)job.build3Audit=true;
 if(Object.keys(cards).length)Object.assign(job,{build3Sealed:true,build3Cards:cards});
 if(p.maziExtract)Object.assign(job,{ugly:'NASTY',pods:{CONTACT:['LIL_SMACK'],TROUBLE:['HUNTER'],PRIZE:['LIEUTENANT','ENFORCER'],REINF:['HUNTER']}});
 if(p.coffeExiled)job.pods={...job.pods,CONTACT:['LIEUTENANT',...job.pods.CONTACT.filter(x=>x!=='LIEUTENANT')]};
 if(p.detroitGift)job.build3P5Gift=true;
 if(p.detroit)Object.assign(job,{id:'P5',names:['THE DETROIT RUN'],place:'a Detroit parking lot under sodium lights',shape:'TAKE THE BLOCK'});
 picked.pitch={...picked.pitch,job,...(p.detroit?{nameIdx:0}:{})};return picked;
}
export function audit(rec){
 const mem=rec.memAll||[],seam=rec.build3Seam||{},identities=seam.identityTalks||[];
 return {approach:rec.approach,greed:(rec.answers||[]).some(a=>a.t==='CLIMB'&&a.a===true),pullSaved:(seam.pullSaved||[]).length>0,pullSavedIds:[...(seam.pullSaved||[])],phone:mem.some(x=>x.startsWith('trait:phone:')),chewerTalk:identities.some(x=>x.id==='P2-chewer'&&x.type==='CHEWER'&&x.captured===true),coffeTalk:identities.some(x=>x.id==='P4-coffe'&&x.type==='LIEUTENANT'),concealStarted:!!seam.concealStarted,coverStarted:!!seam.coverStarted,wrongEvent:(seam.cards||[]).includes('P2-wrong'),no1Event:(seam.cards||[]).includes('NO-S1'),detroit:(seam.cards||[]).some(x=>x.startsWith('P5-'))};
}
export function buildResult(req,context){const r=OPEN.buildResult(req,context);return req.build3S11?.audit||req.build3No1?{...r,build3Audit:audit(context.rec)}:r;}
export function runHeadless(req,driver,saved=null){
 const valid=globalThis.RAPlayContract.validateRequest(req);
 if(!valid.ok)return {result:OPEN.refusedResult(req,'BAD_REQUEST','the request does not match the contract',valid.errors),world:saved};
 const w=prepareWorld(req,saved),before=Object.fromEntries(req.roster.map(o=>[o.id,o.status])),cash0=w.cash;let picked=pitchFor(w,req);
 if(OPEN.needsRecovery(w,picked)){for(const c of OPEN.recoverableCars(w))W.recoverCar(w,c.id,{fee:0});picked=pitchFor(w,req);}
 if(picked.refuse)return {result:OPEN.refusedResult(req,picked.refuse.code,picked.refuse.reason),world:saved};
 const pitch=picked.pitch,rec=E.runPlay({seed:OPEN.seedFor(req,!!pitch.extract),job:pitch.job,policy:'driver',opts:{},night:w.night,pitcher:pitch.pitcher,nameIdx:pitch.nameIdx,pitchText:null,state:w,intel:false,oba:false},driver);
 W.applyResult(w,rec,pitch.job);return {result:buildResult(req,{rec,w,before,cash0}),world:w,rec};
}
