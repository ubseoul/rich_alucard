// Multi-night layer: the nightly pitch board, morning-after carry-over, BEEF, careers. Used for the BEEF ablation and the 10-night pitch audit.
import {stream,D} from './load.mjs';
import * as C from './content.mjs';
import {runPlay,startRoster} from './sim.mjs';

export const PROP={boba_backroom:'COMEDY',tupperware:'COMEDY',vampire_dentist:'DREAD',dock_restock:'TENSION',car_wash_stickup:'VIOLENCE',quiet_lift:'TENSION',vampire_gala:'DREAD',smack_crib:'VIOLENCE',counting_house:'VIOLENCE',hold_the_house:'DEFENSE',extract:'RESCUE'};
export const EMO={boba_backroom:'silly',tupperware:'small & sweet',vampire_dentist:'spooky',dock_restock:'stockpile',car_wash_stickup:'violent thrill',quiet_lift:'tension',vampire_gala:'prestige & dread',smack_crib:'boss fight',counting_house:'everything',hold_the_house:'defense',extract:'rescue'};
const PLAYABLE=C.JOBS.filter(j=>!j.defense&&!j.bigPlay);
const BIG=C.JOBS.find(j=>j.bigPlay),HOLD=C.JOBS.find(j=>j.defense),QLIFT=C.JOBS.find(j=>j.id==='quiet_lift');
export const EXTRACT={...QLIFT,id:'extract',shape:'EXTRACT',names:['GET HIM BACK','NOBODY LEAVES THE ROOM','RETURN TO SENDER'],pitchers:['dre','tunde'],band:[4,8],ugly:'TOUGH',tell:'a locked room and two very bored guards',place:'the room where they are keeping him',favors:'ANY',size:[2,3],octopus:null,tilt:{CASH:2,BLOOD_X:0,GUN:1,MOD:1,RECRUIT:0,STORY:4,DISTRICT:0,WEIRD:2},heat:3,silhouettes:['STORY','CASH']};
const shuffle=(R,a)=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=R.int(0,i);[a[i],a[j]]=[a[j],a[i]];}return a;};
const jobBy=id=>C.JOBS.find(j=>j.id===id)||EXTRACT;

export function makeBoard(state,night,lastShape,R,ctx={}){
 const avail=state.roster.filter(o=>o.status==='READY');
 const n=R.chance(.45)?3:2;const pitches=[];const shapes=new Set();const pitchers=new Set();
 const okPitcher=(j,strict)=>j.pitchers.find(id=>avail.some(o=>o.id===id)&&(!strict||!pitchers.has(id)))||(strict?avail.find(o=>o.named&&!pitchers.has(o.id)&&C.PITCH_LINES[o.id])?.id:undefined);
 const prev=new Set(ctx.prevSpecs||[]);
 const passes=ctx.anti?[[true,true],[true,false],[false,true],[false,false]]:[[false,false]];
 for(const [avoidPrev,strictP] of passes){
  for(const j of shuffle(R,PLAYABLE)){
   if(pitches.length>=n)break;
   if(j.shape===lastShape||shapes.has(j.shape)||pitches.some(p=>p.job.id===j.id))continue;
   if(avoidPrev&&prev.has(j.id))continue;
   const pid=okPitcher(j,strictP);if(!pid)continue;
   pitches.push({job:j,pitcher:pid,nameIdx:R.int(0,j.names.length-1)});shapes.add(j.shape);pitchers.add(pid);
  }
  if(pitches.length>=n)break;
 }
 if(!pitches.length){const j=shuffle(R,PLAYABLE)[0];const a=avail.find(o=>o.named)||avail[0];if(a)pitches.push({job:j,pitcher:j.pitchers.includes(a.id)?a.id:a.id,nameIdx:R.int(0,j.names.length-1)});}
 if(ctx.big&&avail.length>=4&&R.chance(.5)&&BIG.shape!==lastShape){
  const pid=okPitcher(BIG,false);
  if(pid){const clash=pitches.findIndex(p=>p.job.shape===BIG.shape);if(clash>=0)pitches.splice(clash,1);pitches.push({job:BIG,pitcher:pid,nameIdx:R.int(0,BIG.names.length-1),big:true});}
 }
 return pitches;
}
// board-only generator for the A/B repetition audit (no PLAY is run; every Oga assumed READY)
export function boardsOnly({seed,nights,anti}){
 const R=stream(seed,'boards-only');const state={roster:C.NAMED.map(n=>({id:n.id,status:'READY'}))};const out=[];let lastShape=null,prevSpecs=[];
 for(let night=1;night<=nights;night++){
  const board=makeBoard(state,night,lastShape,R,{anti,prevSpecs,big:night>=4&&R.chance(.35)});
  const pick=board[R.int(0,board.length-1)];
  out.push({night,board:board.map(p=>({job:p.job.id,shape:p.job.shape,pitcher:p.pitcher,prop:PROP[p.job.id],emo:EMO[p.job.id],faction:p.job.faction,name:p.job.names[p.nameIdx],silhouettes:p.job.silhouettes})),picked:pick.job.id});
  lastShape=pick.job.shape;prevSpecs=board.map(p=>p.job.id);
 }
 return out;
}
const ugliness={EASY:1,TOUGH:.8,NASTY:.55,'BIG PLAY':.4};
export function pickPitch(pol,board,state,R){
 if(pol==='careful'){const ex=board.find(p=>p.extract);if(ex)return ex;}
 if(pol==='naive')return board[0];
 if(pol==='random')return board[R.int(0,board.length-1)];
 const ready=state.roster.filter(o=>o.status==='READY').length;
 const score=p=>{const j=p.job;const mean=(j.band[0]+j.band[1])/2,hi=j.band[1];
  if(pol==='greedy')return hi;
  return mean*(ugliness[j.ugly]||.6)*(ready<5&&j.ugly!=='EASY'&&j.ugly!=='TOUGH'?.5:1)*(j.bigPlay?.5:1);};
 return [...board].sort((a,b)=>score(b)-score(a))[0];
}

export function newCareer(seed){const s=startRoster(seed);s.beefs=[];s.corun={};s.captured={};s.pending=null;s.gone=[];s.dead=[];s.recruited=0;return s;}
function addGeneric(state,R,turnedBy){
 const used=new Set(state.roster.map(o=>o.name.toLowerCase()));const nm=C.GENERIC_NAMES.find(n=>!used.has(n.toUpperCase()))||('Cousin '+R.int(10,99));
 const cl=R.pick(['SHOOTER','MUSCLE','TALKER','GHOST','WHEELS','DOC']);const c=D.CLASSES[cl];const q=R.pick(C.QUIRKS);
 state.roster.push({id:'g'+(100+state.recruited++),name:nm.toUpperCase(),short:nm,cls:cl,named:false,human:!turnedBy,vampire:!!turnedBy,traits:[q],quirk:q,gun:'pistol',maxhp:c.hp,hp:c.hp,aim:c.aim,nerve:50,base:50,scars:[],nick:null,perks:[],status:'READY',away:0,mvp:0,saved:[],hist:[],plays:0,turnedBy:turnedBy||null});
}
export function advanceNight(state){
 for(const o of state.roster){
  if(['WOUNDED','SHOT'].includes(o.status)){o.away--;if(o.away<=0){o.status='READY';o.hp=o.maxhp;}}
  else if(o.status==='CAPTURED'){o.away--;if(o.away<=0){o.status='GONE';state.gone.push(o.id);}}
 }
 state.roster=state.roster.filter(o=>o.status!=='GONE');
 for(const k of Object.keys(state.cars))if(state.cars[k]>0)state.cars[k]--;
 state.beefs=(state.beefs||[]).map(b=>({...b,age:(b.age||0)+1})).filter(b=>b.age<=12);
}
export function applyResult(state,rec,job,night,R){
 const so=rec.stateOut;const byId=Object.fromEntries(so.roster.map(o=>[o.id,o]));
 const bad=[];
 for(const o of so.roster){
  const st=rec.finalStatus[o.id];
  o.hist=o.hist||[];
  if(!rec.crew.includes(o.id)){/* stayed home: keeps whatever status advanceNight gave them */}
  else if(st==='DEAD'){o.status='DEAD';}
  else if(st==='GONE'){o.status='GONE';state.gone.push(o.id);}
  else if(st==='CAPTURED'){o.status='CAPTURED';o.away=3;}
  else if(st==='SHOT'){o.status='SHOT';o.away=2;if(!o.scars.length)o.scars.push('a limp');}
  else if(st==='WOUNDED'){o.status='WOUNDED';o.away=1;}
  else{o.status='READY';o.hp=o.maxhp;}
  // nerve baseline drifts
  if(rec.crew.includes(o.id)){
   const nEnd=(rec.nerveEnd.find(([id])=>id===o.id)||[0,o.nerve])[1];
   if(o.status==='SHOT'||nEnd<30)o.base=Math.max(40,o.base-2);
   if(rec.win&&nEnd>=55)o.base=Math.min(85,o.base+(o.named?1:0));
   o.plays=(o.plays||0);
  }
 }
 // morning-after: nicknames, STORY seeds (nerve baseline nudge), scars
 if(rec.morning){
  for(const n of rec.morning.nicks){const o=byId[n.id];if(o&&!o.nick)o.nick=n.nick;}
  for(const sd of rec.morning.seeds){const o=byId[sd.who];if(o&&o.perks.length<D.STORY_NUMBERS.maxStories){o.perks.push(sd.perk);o.base=Math.min(85,o.base+(o.traits.includes('BIG_POTENTIAL')?4:2));}}
 }
 state.roster=so.roster.filter(o=>o.status!=='DEAD'&&o.status!=='GONE');
 // reset per-PLAY residue
 for(const o of state.roster){o.nerve=o.base;o.fled=false;o.out=null;}
 state.bonds=so.bonds;state.known=so.known;state.cars=so.cars;state.weirdSeen=so.weirdSeen;
 // DAY ONES: two Ogas who run 3 jobs together
 state.corun=state.corun||{};
 for(let i=0;i<rec.crew.length;i++)for(let j=i+1;j<rec.crew.length;j++){const k=[rec.crew[i],rec.crew[j]].sort().join('+');state.corun[k]=(state.corun[k]||0)+1;
  if(state.corun[k]>=3&&!state.bonds.some(b=>b.includes(rec.crew[i])&&b.includes(rec.crew[j]))&&state.roster.some(o=>o.id===rec.crew[i])&&state.roster.some(o=>o.id===rec.crew[j])){state.bonds.push([rec.crew[i],rec.crew[j]]);rec.newBond=[rec.crew[i],rec.crew[j]];}}
 // crash
 if(rec.crashOut)state.cars[rec.car]=rec.crashOut;
 // beefs
 state.beefs=so.beefs||[];
 for(const b of rec.beef||[])if(!state.beefs.some(x=>x.from===b.from&&x.to===b.to))state.beefs.push({...b,age:0});
 for(const b of rec.beefSettled||[])state.beefs=state.beefs.filter(x=>!(x.from===b.from&&x.to===b.to));
 // recruits (turning or a willing candidate) fill a free seat up to the cap
 const cap=9;
 const live=state.roster.filter(o=>o.status!=='GONE'&&o.status!=='DEAD');
 if(rec.turn&&rec.turn.offered&&rec.turn.result&&rec.turn.result.startsWith('TAKES')&&live.length>=cap)rec.turnBlocked=true;
 if(rec.turn&&rec.turn.offered&&rec.turn.result&&rec.turn.result.startsWith('TAKES')&&live.length<cap){addGeneric(state,R,rec.turn.turner);rec.turned=true;}
 else if(rec.pot.crates.some(c=>c.cat==='RECRUIT')&&rec.win&&live.length<cap&&R.chance(.6)){addGeneric(state,R,null);rec.recruited=true;}
 // EXTRACT frees the captive
 if(job.id==='extract'&&rec.win){const cap2=state.roster.find(o=>o.status==='CAPTURED');if(cap2){cap2.status='READY';cap2.hp=cap2.maxhp;cap2.away=0;cap2.perks.push('rescued');rec.rescued=cap2.id;}}
 // retaliation pending?
 if(rec.morning?.temptation?.type==='RETALIATION'&&R.chance(.6))state.pending={night:night+1,kind:'HOLD'};
}

export function runCareer({seed,nights,policy,opts={},big=true}){
 const R=stream(seed,'career');const state=newCareer(seed);const recs=[];const boards=[];let lastShape=null;let lastBoardSpecs=[];
 for(let night=1;night<=nights;night++){
  advanceNight(state);
  const ready=state.roster.filter(o=>o.status==='READY');
  if(ready.length<2){boards.push({night,ready:ready.length,board:[],picked:null,skipped:true});continue;}
  let pick,board;
  const hold=state.pending&&state.pending.night<=night;
  if(hold&&ready.length>=3){pick={job:HOLD,pitcher:'auntie_grit',nameIdx:R.int(0,HOLD.names.length-1),notice:true};board=[pick];state.pending=null;}
  else{
   board=makeBoard(state,night,lastShape,R,{big:big&&night>=4&&R.chance(.35),anti:true,prevSpecs:lastBoardSpecs});
   const cap=state.roster.find(o=>o.status==='CAPTURED');
   if(cap&&ready.length>=2){const used=new Set(board.map(p=>p.pitcher));const pid=['dre','tunde','half_pint','young_mazi'].find(id=>!used.has(id)&&ready.some(o=>o.id===id))||'dre';board.push({job:EXTRACT,pitcher:pid,nameIdx:R.int(0,2),extract:true});}
   pick=pickPitch(policy,board,state,R);
  }
  const seedN=seed*1000+night;
  const rec=runPlay({seed:seedN,job:pick.job,policy,opts,night,pitcher:pick.pitcher,nameIdx:pick.nameIdx,state});
  rec.night=night;rec.career=seed;
  boards.push({night,ready:ready.length,board:board.map(p=>({job:p.job.id,prop:PROP[p.job.id],shape:p.job.shape,pitcher:p.pitcher,ugly:p.job.ugly,silhouettes:p.job.silhouettes,take:p.job.band,emo:EMO[p.job.id],faction:p.job.faction,name:p.job.names[p.nameIdx]})),picked:pick.job.id,notice:!!pick.notice});
  applyResult(state,rec,pick.job,night,R);
  lastShape=pick.job.shape;lastBoardSpecs=board.map(p=>p.job.id);
  recs.push(rec);
 }
 return {recs,boards,state};
}
