// F01 THE PLAY — FEEL LOCK live feed (OL-023). PURE and DETERMINISTIC: engine events in, phone-chat steps out. No DOM, no timers, no audio.
// The group chat is the ONLY live combat UI. Sparse, uneven, human: at most ~12 bubbles per PLAY outside CALLS, EVENTS in ALL CAPS, CHATTER in
// lowercase, never a number (no HP, no NERVE, no percentages, no combat log). The UI turns these steps into pacing, shake, typing bubbles and sound.
//
//   step = {t:'say', who, text, kind:'EVENT'|'CHAT', shake:0|1|2, red:0|1|2, typing:ms, interrupted:bool, pause:ms, joke?:true}
//        | {t:'cut', who, text, shake, pause}          a bubble that stops mid-word: the feed goes quiet after it
//        | {t:'silence', ms} | {t:'rich', text} | {t:'dial'} | {t:'black'} | {t:'typing', who, ms, vanish:true}
import {stream} from './env.mjs';
import {pickLine,LINES} from './lines.mjs';
import * as C from './content.mjs';

export const BUDGET={ENTRY:2,CONTACT:2,TROUBLE:3,PRIZE:2,GETAWAY:2,END:1};
export const CAP=12;                       // the sibling meme pair (Ube's authored material) is outside the cap
export const SIBLING=['i think… I THINK THERES SOMEONE IN THIS ROOM!','shut up']; // LOCKED — Ube-authored, never altered
export const RICH_HELLO=['hello?','hello??'];                                     // the only Rich text in the feed (packet)
export const VERB_BUTTON={TALK:'TALK HIM DOWN',BUST:'BUST THROUGH',SNEAK:'SLIP PAST',PAY:'PAY HIM OFF',PUSH:'KEEP GOING',FOLD:'GET OUT',SAVE:'GO BACK FOR HIM',PULL_UP:'PULL UP'};
const VOICE_FORMAL={sunday_best:1,auntie_grit:1};

const parse=t=>{const m=/^[=^~]*/.exec(t)[0];return {text:t.slice(m.length),locked:m.includes('='),vamp:m.includes('^'),joke:m.includes('~')};};
const uc=t=>{const u=t.toUpperCase().trim();return /[.!?—-]$/.test(u)?u:u+'.';};
const cap1=t=>t.charAt(0).toUpperCase()+t.slice(1);
export const isEvent=t=>t===t.toUpperCase()&&/[A-Z]/.test(t);

export function lineCtx(seed,recent=[],extraSeen=[]){
 const rec=(recent||[]).map(x=>Array.isArray(x)?x:[]);
 const recentSet=new Set([...rec.flat(),...extraSeen]);
 const recentAge=Object.fromEntries(rec.flatMap((ids,n,a)=>ids.map(id=>[id,a.length-n])));
 return {seed,recentSet,recentAge,usedLines:new Set(),lineLog:[],lineN:0,sim:false};
}

// -------------------------------------------------------------------------------------------------------------- before the PLAY: danger as fiction
// Up to two crew-voice hints about what waits at the target (NEVER a percentage). They are the tells: SWAP / WEAPON / CAR can counter them before the car leaves.
export function offerHints(w,job,pitcher,seedSalt=0){
 const ctx=lineCtx(w.seed*13+w.night*7+seedSalt+job.id.length,w.recent,w.boardSeen||[]);
 const types=new Set(Object.values(job.pods).flat());const out=[];
 const pv=(w.roster.find(o=>o.id===pitcher)||{});
 for(const [k,t] of Object.entries(C.TELLS)){
  if(!types.has(t.enemy)||out.length>=2)continue;
  const raw=pickLine(ctx,'feed:tell:'+k,{},l=>!parse(l).vamp||pv.vampire);
  if(raw)out.push({k,text:parse(raw).text,locked:parse(raw).locked});
 }
 (w.boardSeen=w.boardSeen||[]).push(...ctx.lineLog);
 return out;
}

// -------------------------------------------------------------------------------------------------------------- the feed of one PLAY
export function createFeed(cfg){
 const {seed,job,roster,plan={}}=cfg;
 const crew=cfg.crew.map(o=>({id:o.id,short:o.short,name:o.name,cls:o.cls,named:!!o.named,vampire:!!o.vampire}));
 const ctx=lineCtx(seed*31+7,cfg.recent||[],cfg.seen||[]);
 const RS=k=>stream(seed,'feed|'+k);
 const F={
  ctx,steps:0,jokes:0,nerveSaid:0,shownCards:new Set(),used:{tells:new Set(),cards:new Map()},spent:{},prev:null,snap:null,last:null,rot:0,
  faUsed:false,sibShown:false,obaShown:false,quiet:false,stageLog:[],
  get lineLog(){return ctx.lineLog;},
  get feel(){return {sibling:F.sibShown?(plan.sibling||null):null,falseAlarm:F.faUsed,oba:F.obaShown,bubbles:F.steps};}
 };
 const cById=id=>crew.find(o=>o.id===id);
 const upIds=()=>F.snap?F.snap.crew.filter(c=>c.state==='UP').map(c=>c.id):crew.map(o=>o.id);
 const nm=o=>o?o.short:'somebody';
 // speaker: rotates through whoever is still on their feet, never the same voice twice in a row, never the subject of the line
 function speaker(o={}){
  const ex=new Set([...(o.exclude||[]),F.last]);let pool=(upIds().length?upIds():crew.map(x=>x.id)).map(cById).filter(Boolean);
  if(o.vampire){const v=pool.filter(x=>x.vampire);if(v.length)pool=v;}
  const alt=pool.filter(x=>!ex.has(x.id));const use=alt.length?alt:pool;
  const who=use[(F.rot++)%use.length]||crew[0];F.last=who.id;return who;
 }
 const say=(who,text,kind,x={})=>{const jr=RS('j|'+F.steps+'|'+text.length);
  F.steps++;
  const typing=kind==='EVENT'?(jr.chance(.6)?Math.round(700+jr.next()*900):0):(jr.chance(.35)?Math.round(500+jr.next()*700):0);
  return {t:'say',who:who?who.id:null,text,kind,shake:x.shake||0,red:x.red||0,typing,interrupted:jr.chance(.12)&&typing>0,pause:Math.round((kind==='EVENT'?1700:1100)+jr.next()*(kind==='EVENT'?1700:1500)),...(x.joke?{joke:true}:{})};};
 const chatText=(who,text,locked)=>{if(locked)return text;const t=text.replace(/\.$/,'').toLowerCase();return VOICE_FORMAL[who.id]?cap1(t).replace(/(\. )([a-z])/g,(m,a,b)=>a+b.toUpperCase())+'.':t;};
 const draw=(key,tok={},ok=null)=>{const raw=pickLine(ctx,key,tok,ok);return raw?parse(raw):null;};
 const tokFor=(a,b)=>({a:nm(a),b:nm(b),A:nm(a).toUpperCase(),B:nm(b).toUpperCase()});
 // one line per card per PLAY, used both as the setup chatter and (uppercased) as the CALL line
 function cardLine(id){
  if(F.used.cards.has(id))return F.used.cards.get(id);
  const key='feed:card:'+id;if(!LINES[key]){F.used.cards.set(id,null);return null;}
  let p=null;for(let n=0;n<4;n++){p=draw(key);if(!p)break;if(!p.joke||F.jokes<1)break;}
  F.used.cards.set(id,p);return p;
 }
 const room=stage=>{const b=(BUDGET[stage]||1);const carry=Math.max(0,Math.min(2,F.carry||0));return Math.max(0,Math.min(b+carry,CAP-F.steps));};

 // ---- beat: setup (tell, card) -> results (hits, downs, saves, nerve, humor) -> outcome event
 F.beat=function(evt,fx={}){
  const stage=evt.stage,tier=evt.tier;const cand=[];const snap=evt.snap;const prev=F.snap||snap;F.prev=prev;F.snap=snap;
  const pc=id=>prev.crew.find(c=>c.id===id);
  // setup: an enemy tell the crew clocked, surfaced BEFORE the consequence
  const types=new Set((evt.pods0&&evt.pods0.length?evt.pods0:(job.pods[stage]||[])));
  for(const [k,t] of Object.entries(C.TELLS)){
   if(F.used.tells.has(k)||!types.has(t.enemy))continue;
   const needV=false;const p=draw('feed:tell:'+k,{},l=>{const m=parse(l);return !m.vamp||crew.some(x=>x.vampire&&upIds().includes(x.id));});
   if(!p)continue;F.used.tells.add(k);const who=speaker({vampire:p.vamp});cand.push({pri:80,ord:0,mk:()=>say(who,chatText(who,p.text,p.locked),'CHAT',{shake:0,red:1})});break;
  }
  // setup: what the crew is looking at (chatter). PRIZE cards are the find itself: EVENT form ("WE FOUND THE SAFE.")
  const cl=F.shownCards.has(evt.card.id)?null:cardLine(evt.card.id);
  if(cl){const isPrize=stage==='PRIZE';const who=speaker();
   cand.push({pri:isPrize?85:60,ord:isPrize?0:1,mk:()=>isPrize?say(who,uc(cl.text),'EVENT',{red:1}):say(who,chatText(who,cl.text,cl.locked),'CHAT',{red:stage==='TROUBLE'?1:0,joke:cl.joke}),joke:cl.joke});}
  // results: hits, downs, saves, nerve
  const downs=[],hits=[],saves=[],lost=[];
  for(const c of snap.crew){const p=pc(c.id)||c;
   if(c.state!=='UP'&&p.state==='UP')downs.push({c,p});
   else if(c.hp<p.hp&&c.state==='UP')hits.push({c,drop:p.hp-c.hp});
   else if(c.state==='UP'&&p.state!=='UP')saves.push(c);
   if(c.zone==='LOSING IT'&&p.zone!=='LOSING IT')lost.push(c);}
  for(const d of downs.slice(0,2)){const o=cById(d.c.id);const key=o&&o.named?'feed:down:named':'feed:down:generic';const p=draw(key,tokFor(o));
   if(p){const who=speaker({exclude:[o&&o.id]});if(who.id===(o&&o.id))continue;cand.push({pri:100,ord:2,mk:()=>say(who,uc(p.text),'EVENT',{shake:2,red:2})});}}
  if(hits.length){const h=[...hits].sort((a,b)=>b.drop-a.drop)[0];const o=cById(h.c.id);const p=draw('feed:hit',tokFor(o));
   if(p){const who=speaker({exclude:[o&&o.id]});if(who.id!==(o&&o.id))cand.push({pri:90,ord:2,mk:()=>say(who,uc(p.text),'EVENT',{shake:1,red:1})});}}
  if(saves.length){const o=cById(saves[0].id);const p=draw('feed:saved',tokFor(o));if(p){const who=speaker({exclude:[o&&o.id]});if(who.id!==(o&&o.id))cand.push({pri:70,ord:3,mk:()=>say(who,uc(p.text),'EVENT',{red:0})});}}
  if(lost.length&&F.nerveSaid<1){const o=cById(lost[0].id);const p=draw('feed:nerve',tokFor(o));
   if(p&&crew.length>1){const who=speaker({exclude:[o&&o.id]});if(who.id!==(o&&o.id)){F.nerveSaid++;cand.push({pri:50,ord:3,mk:()=>say(who,chatText(who,p.text),'CHAT',{shake:1})});}}}
  // a joke beat (at most ONE per PLAY): the funniest authored moment of this beat, in the crew's mouth
  if(F.jokes<1&&!(plan.sibling&&stage==='ENTRY')){
   const m=(evt.moments||[]).filter(x=>x.tag==='FUNNY'&&x.w>=5&&!/^chain/.test(x.key||'')&&!/ \+ /.test(x.text))[0];
   if(m){const who=speaker({exclude:m.who?[m.who]:[]});const t=m.text.replace(/ — [A-Z][A-Z'’ &.?]*$/,'').replace(/[.]+$/,'');
    cand.push({pri:45,ord:3,joke:true,mk:()=>say(who,chatText(who,t.charAt(0).toLowerCase()+t.slice(1)),'CHAT',{joke:true})});}}
  // the outcome event of the beat
  const oe=draw(`feed:${stage}:${Math.max(0,Math.min(2,tier))}`);
  if(oe){const who=speaker();cand.push({pri:75,ord:4,mk:()=>say(who,uc(oe.text),'EVENT',{shake:tier===0?1:0,red:tier===0?2:0})});}
  // choose within the budget: highest priority wins, displayed in narrative order
  let n=room(stage);
  if(stage==='ENTRY'&&plan.sibling&&!F.sibShown)n=Math.max(1,n-0);
  const chosen=[];
  for(const c of [...cand].sort((a,b)=>b.pri-a.pri)){if(chosen.length>=n)break;if(c.joke&&F.jokes>=1)continue;chosen.push(c);if(c.joke)F.jokes++;}
  F.carry=Math.max(0,(BUDGET[stage]||1)-chosen.length); // unused budget rolls forward (capped in room())
  chosen.sort((a,b)=>a.ord-b.ord);
  const steps=chosen.map(c=>c.mk());
  // Ube's sibling meme: guaranteed once on the very first PLAY (rare callback later). Locked wording.
  if(stage==='ENTRY'&&plan.sibling&&!F.sibShown){
   F.sibShown=true;F.jokes++;const a=speaker({exclude:[F.last]}),b=speaker({exclude:[a.id]});
   steps.push({t:'say',who:a.id,text:SIBLING[0],kind:'CHAT',shake:0,red:1,typing:0,interrupted:false,pause:2300,joke:true,locked:true});
   steps.push({t:'typing',who:b.id,ms:900,vanish:false});
   steps.push({t:'say',who:b.id,text:SIBLING[1],kind:'CHAT',shake:0,red:1,typing:0,interrupted:false,pause:2800,joke:true,locked:true});
  }
  // a beat that ends the PLAY in catastrophe stops MID-EVENT
  if(fx.endKind==='WASH'){
   const victim=cById((snap.crew.find(c=>c.state!=='UP')||snap.crew[0]).id);const p=draw('feed:cut',tokFor(victim));const who=speaker({exclude:[victim&&victim.id]});
   steps.push({t:'cut',who:who.id,text:p?uc(p.text).replace(/\.$/,''):'THEY\'RE ALL O',shake:2,red:2,pause:600});
   F.quiet=true;
  }
  // FALSE ALARM: a rare silence on a run that is actually going fine. The player must never know that silence == catastrophe.
  else if(plan.falseAlarm&&!F.faUsed&&!F.quiet&&F.steps<CAP&&(stage==='CONTACT'||stage==='TROUBLE')&&tier>=1&&snap.crew.every(c=>c.state==='UP')&&snap.pressure<67&&!fx.endKind){
   F.faUsed=true;const who=speaker();const p=draw('feed:false');
   steps.push({t:'silence',ms:5200},{t:'rich',text:RICH_HELLO[0]},{t:'silence',ms:2600});
   if(p)steps.push(say(who,chatText(who,p.text,p.locked),'CHAT',{red:0}));
  }
  F.stageLog.push({stage,tier,n:steps.length});
  return steps;
 };

 // ---- the crew's call: fiction first, two buttons at most. Returns null when there is nothing to say.
 F.call=function(pr,{moreTime=false}={}){
  const isGetaway=pr.i===4;const opts=(pr.opts||[]).slice(0,2);
  let line;
  if(isGetaway){const p=draw('feed:getaway:MESSY');line=p?uc(p.text):'SOMETHING\'S BEHIND US.';}
  else{const cl=cardLine(pr.card&&pr.card.id);line=cl?uc(cl.text):uc((pr.card&&pr.card.text)||'DECISION.');if(pr.card)F.shownCards.add(pr.card.id);}
  const who=speaker();
  const buttons=opts.map(v=>{const b=(pr.buttons||[]).find(x=>x.id===v);return {id:v,label:isGetaway&&b?b.verb:VERB_BUTTON[v]||v};});
  return {who:who.id,line,buttons,ms:moreTime?14000:7000,shake:1,red:2};
 };
 // HIT ONE MORE, in the same language: a crew line about their condition, a fiction line about what is really in the next room, then KEEP GOING / GET OUT
 F.climb=function(info,{moreTime=false}={}){
  const rd=draw('feed:climb:read:'+info.read),lit=draw('feed:climb:lit:'+(info.tease||'COMMON'));
  const w1=speaker(),w2=speaker();
  return {who:w1.id,who2:w2.id,read:rd?chatText(w1,rd.text):'',lit:lit?chatText(w2,lit.text):'',buttons:[{id:'KEEP',label:'KEEP GOING'},{id:'OUT',label:'GET OUT'}],ms:moreTime?14000:7000,shake:1,red:2};
 };
 F.turn=function(turnerId){const p=draw('feed:turn');const who=cById(turnerId)||speaker({vampire:true});return {who:who.id,text:p?chatText(who,p.text):'he wants in. willing.',buttons:[{id:'TURN',label:'TURN'},{id:'LET',label:'LET GO'}]};};

 // ---- getaway: at most two bubbles
 F.getaway=function(evt){
  const kind=evt.kind;const steps=[];let n=room('GETAWAY');
  const key=(kind==='MESSY'&&evt.nodd)?'feed:getaway:nodd':'feed:getaway:'+kind;
  if(LINES[key]&&n>0){const p=draw(key,tokFor(cById(evt.driver&&evt.driver.id)));const who=speaker();
   steps.push(say(who,uc(p.text),'EVENT',{shake:kind==='CRASH'||kind==='ROBBED'?2:kind==='CLEAN'?0:1,red:kind==='CLEAN'?0:2}));n--;}
  if(n>0&&kind==='CRASH'&&evt.moments&&evt.moments[0]&&F.jokes<1){F.jokes++;const m=evt.moments[0];const who=speaker();steps.push(say(who,chatText(who,m.text.replace(/ — [A-Z][A-Z'’ &.?]*$/,'').replace(/[.]+$/,'').toLowerCase()),'CHAT',{joke:true}));}
  return steps;
 };

 // ---- HIT ONE MORE outcomes: the room closes (EVENT + the way back is watched) / they come back richer
 F.stepFail=function(d){
  const steps=[];if(F.steps>=CAP)return steps;const who=speaker();const p=draw('feed:step:fail');
  if(p)steps.push(say(who,uc(p.text),'EVENT',{shake:2,red:2}));
  const q=draw('feed:getaway:ROBBED');const w2=speaker();if(q&&F.steps<CAP)steps.push(say(w2,uc(q.text),'EVENT',{shake:2,red:2}));
  return steps;
 };
 F.stepOk=function(d){
  if(F.steps>=CAP)return [];const who=speaker();const p=draw('feed:step:ok');return p?[say(who,uc(p.text),'EVENT',{red:1})]:[];
 };
 // ---- ends of the PLAY
 F.oba=function(evt){
  F.obaShown=true;F.quiet=true;const steps=[];const a=speaker(),b=speaker({exclude:[a.id]});
  const p=draw('feed:oba:in');steps.push({...say(a,(p?p.text:'oh shit is that OBA DE GWINNETT?!').toUpperCase(),'EVENT',{shake:2,red:2}),locked:!!(p&&p.locked)});
  const cut=draw('feed:oba:cut');steps.push({t:'cut',who:b.id,text:(cut?cut.text:'OBA DE GWIN—').replace(/\.$/,''),shake:2,red:2,pause:500,oba:true});
  steps.push({t:'silence',ms:4200},{t:'rich',text:RICH_HELLO[0]},{t:'silence',ms:2800},{t:'rich',text:RICH_HELLO[1]},{t:'typing',who:a.id,ms:2000,vanish:true},{t:'silence',ms:2400},{t:'dial'},{t:'silence',ms:3200});
  const back=draw('feed:oba:back');const s=speaker({exclude:[b.id]});
  steps.push(say(s,chatText(s,back?back.text:'we out. dont ask.'),'CHAT',{red:0}));
  return steps;
 };
 F.end=function(evt){
  const k=evt.kind;const steps=[];
  if(k==='WASH'){ // TOTAL CAPTURE: the feed already cut mid-event. Silence, the hello, the missed call, black.
   const last=speaker();
   steps.push({t:'silence',ms:4200},{t:'rich',text:RICH_HELLO[0]},{t:'silence',ms:2600},{t:'rich',text:RICH_HELLO[1]},{t:'typing',who:last.id,ms:2200,vanish:true},{t:'silence',ms:2600},{t:'dial'},{t:'silence',ms:3000},{t:'black'});
   return steps;
  }
  const map={BAIL:'feed:bail',FALLBACK:'feed:fallback',FOLD:'feed:fold'};
  if(map[k]&&F.steps<CAP){const p=draw(map[k]);const who=speaker();steps.push(say(who,uc(p.text),'EVENT',{shake:k==='FOLD'?0:1,red:k==='FOLD'?0:2}));}
  return steps;
 };
 // the last bubble before the crew is out of the building; a clean win may add ONE crew flex line ("NO SCRATCH"), never a panel
 F.out=function(rep={}){
  const steps=[];const m=rep.noScratch&&rep.flexLine?/^([^:]+): (.*)$/.exec(rep.flexLine):null;
  if(F.steps<CAP&&(CAP-F.steps>=2||!m)){const p=draw('feed:out');const who=speaker();steps.push(say(who,uc(p.text),'EVENT',{red:0}));}
  if(m&&F.steps<CAP){const o=crew.find(x=>x.short===m[1])||speaker();steps.push(say(o,chatText(o,m[2].replace(/\.$/,'')),'CHAT',{red:0}));}
  return steps;
 };
 return F;
}
