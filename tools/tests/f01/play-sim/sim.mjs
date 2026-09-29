// THE PLAY — deterministic paper-sim engine (no UI, no grid). Every random draw comes from a seeded stream; forks use common random numbers.
import {stream,D} from './load.mjs';
import * as C from './content.mjs';
import {POLICIES,adjSeats,crewRead,bestSeating} from './policy.mjs';

export const STAGES=['ENTRY','CONTACT','TROUBLE','PRIZE'];
export const zoneN=n=>n>=55?'STEADY':n>=30?'SHAKY':'LOSING IT';
export const zoneP=p=>p<34?'QUIET':p<67?'ALERT':'ALL HANDS';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const SMART={bouncer:'TALK',dog:'SNEAK',fire_escape:'SNEAK',dumpsters:'SNEAK',crowd:'TALK',wet_ramp:'SNEAK',shutters:'SNEAK',
 stoop:'TALK',lookouts:'SNEAK',door_wall:'TALK',roof_line:'SNEAK',crowd_fight:'TALK',camera_room:'SNEAK',
 reinforcements:'PULL_UP',alarm:'PUSH',power_cut:'PUSH',lieutenant_out:'TALK',nodd:'TALK',third_crew:'TALK',someone_down:'SAVE',
 safe:'TALK',office_cash:'PUSH',crate_stack:'PUSH',client_handover:'TALK',hidden_stash:'SNEAK',armory_rack:'PUSH',the_real_prize:'TALK'};
const VALUE={COMMON:3,RARE:9,LEGENDARY:30};
const markSaved=(r,d)=>{r.mvp++;r.saved=r.saved||[];r.saved.push(d.id);r.savedNow=r.savedNow||[];r.savedNow.push(d.id);};
const has=(P,o,t)=>P.opts.traits!==false&&o.traits.includes(t);
const laneOf=(P,o)=>P.opts.carOff?'MID':C.SEAT_LANE[Object.keys(P.seat).find(s=>P.seat[s]===o.id)]||'MID';
const seatOf=(P,o)=>Object.keys(P.seat).find(s=>P.seat[s]===o.id);
const able=(P)=>P.crew.filter(o=>o.hp>0&&!o.out&&!o.fled);
const dropping=(P)=>P.crew.filter(o=>o.hp<=0&&!o.out&&!o.fled&&!o.rescued);
const say=(P,sec,line)=>{if(!P.sim)P.script.push({sec,line});};
const CAUSE={TRAIT:'TRAIT',EARLIER:'EARLIER',CHOICE:'CHOICE',WEAPON:'WEAPON',CAR:'CAR',GREED:'GREED',REL:'RELATIONSHIP',SEAT:'SEAT',HAZARD:'HAZARD',ENEMY:'ENEMY',LUCK:'LUCK'};
const cz=(c,t)=>({c,t});

// -------------------------------------------------------------------------------------------------------------------------- roster
export function mkNamed(def){const c=D.CLASSES[def.cls];return {id:def.id,name:def.name,short:def.short,cls:def.cls,named:true,human:def.human,vampire:!def.human,traits:[...def.traits],quirk:null,gun:def.gun,maxhp:c.hp,hp:c.hp,aim:c.aim,nerve:60,base:60,scars:[],nick:null,perks:[],status:'READY',away:0,mvp:0,saved:[],hist:[],plays:0};}
export function startRoster(seed,extra={}){
 const R=stream(seed,'roster');const named=C.NAMED.map(mkNamed);
 for(const o of named){o.base=60+R.int(-6,6);o.nerve=o.base;if(R.chance(.2))o.scars.push(R.pick(['a limp','a chipped tooth','a burn on the hand']));if(R.chance(.22)){const k=R.pick(Object.keys(D.STORIES));o.perks.push(k);o.base+=4;o.nerve=o.base;}}
 const cls=['SHOOTER','MUSCLE','TALKER','GHOST','WHEELS','DOC'];const gens=[];const names=[...C.GENERIC_NAMES];
 for(let i=0;i<3;i++){const cl=cls.splice(R.int(0,cls.length-1),1)[0];const q=R.pick(C.QUIRKS);const nm=names.splice(R.int(0,names.length-1),1)[0];const c=D.CLASSES[cl];const vamp=R.chance(.5);
  gens.push({id:'g'+(i+1),name:nm.toUpperCase(),short:nm,cls:cl,named:false,human:!vamp,vampire:vamp,traits:[q],quirk:q,gun:R.pick(['pistol','pistol','pistol','lil_oga','mac_and_cheese']),maxhp:c.hp,hp:c.hp,aim:c.aim,nerve:50+R.int(-5,5),base:50,scars:[],nick:null,perks:[],status:'READY',away:0,mvp:0,saved:[],hist:[],plays:0});}
 const r=[...named,...gens];
 const bonds=[];if(R.chance(.5))bonds.push(['dre','tunde']);if(R.chance(.4))bonds.push(['half_pint','young_mazi']);if(R.chance(.25))bonds.push(['auntie_grit','sunday_best']);
 if(R.chance(.15)){const o=R.pick(r);o.status='WOUNDED';o.away=1;o.hp=Math.ceil(o.maxhp/2);}
 const known=Object.fromEntries(COMBO_IDS.map(id=>[id,R.chance(.3)]));
 return {roster:r,bonds,known,cars:{HOOPTIE:0,SUPRA:0,URUS:0,S2000:0},weirdSeen:[],dry:0,...extra};
}
const COMBO_IDS=['day_ones','doors_suggestion','sunday_service','the_slipper','the_leash','sit_down_baby','snack_break','hands_free','coin_flip'];
export {COMBO_IDS};
const COMBO_NAME={day_ones:'DAY ONES',doors_suggestion:"DOOR'S A SUGGESTION",sunday_service:'SUNDAY SERVICE',the_slipper:'THE SLIPPER',the_leash:'THE LEASH',sit_down_baby:'SIT DOWN, BABY',snack_break:'SNACK BREAK',hands_free:'HANDS FREE',coin_flip:'COIN FLIP'};
function activeCombos(P){
 const A=new Set();const S=P.seat;const O=id=>P.crew.find(o=>o.id===id);const at=s=>P.crew.find(o=>o.id===S[s]);
 for(const [a,b] of P.bonds){const oa=O(a),ob=O(b);if(oa&&ob&&adjSeats(seatOf(P,oa),seatOf(P,ob)))A.add('day_ones');}
 if(at('SHOTGUN')?.gun==='sapporo_shotgun')A.add('doors_suggestion');
 const sb=O('sunday_best');if(sb&&sb.gun==='chopstick_sniper'&&C.SEAT_LANE[seatOf(P,sb)]==='BACK')A.add('sunday_service');
 if(at('SHOTGUN')?.gun==='auntie_slipper')A.add('the_slipper');
 const t=O('tunde'),h=O('half_pint'),au=O('auntie_grit'),m=O('young_mazi');
 if(t&&h&&adjSeats(seatOf(P,t),seatOf(P,h)))A.add('the_leash');
 if(au&&m&&adjSeats(seatOf(P,au),seatOf(P,m)))A.add('sit_down_baby');
 if(t&&au&&adjSeats(seatOf(P,t),seatOf(P,au)))A.add('snack_break');
 if(at('DRIVER')&&P.crew.length&&O('dre')&&S.DRIVER==='dre')A.add('hands_free');
 if(at('SHOTGUN')?.traits.includes('HOTHEAD'))A.add('coin_flip');
 return A;
}
function fire(P,combo,ctx){ // first time a combo fires it is revealed
 if(P.opts.combos===false||!P.combos.has(combo)||P.fired.has(combo))return P.combos.has(combo)&&P.opts.combos!==false;
 P.fired.add(combo);
 if(!P.known[combo]){P.newCombos.push(combo);moment(P,ctx,'crewbook','NEW IN THE CREW BOOK: '+COMBO_NAME[combo],'combo:'+combo,'WARM',6);}
 return true;
}
const firing=(P,c)=>P.opts.combos!==false&&P.combos.has(c);

// -------------------------------------------------------------------------------------------------------------------------- moments & memory
function whoOf(P,text){let best=null,bi=1e9;for(const o of P.crew){const i=text.indexOf(o.short);if(i>=0&&i<bi){bi=i;best=o.id;}}return best;}
function moment(P,ctx,kind,text,memId,tag,w,cause){
 const m={kind,text,tag,w:w||3,cause:cause||null};
 if(ctx&&['trait','class','crewbook','weapon','octopus'].includes(kind)&&P.seenText.has(text)&&!P.sim){if(memId)P.mem.push({id:memId,tag,w:w||3,text,who:whoOf(P,text)});return;}
 if(!P.sim&&['trait','class','crewbook','weapon','octopus'].includes(kind))P.seenText.add(text);
 if(ctx)ctx.moments?.push(m);
 if(memId&&!P.sim){P.mem.push({id:memId,tag,w:w||3,text,who:whoOf(P,text)});}
}
function swing(P,kind,cause){if(P.sim)return;P.swings.push({kind,c:cause.c,t:cause.t,vis:cause.c!==CAUSE.LUCK});}
function nerveAdd(P,ctx,o,d,cause){
 if(P.opts.flat)return;const z0=zoneN(o.nerve);
 o.nerve=clamp(o.nerve+d,0,100);if(o.id==='auntie_grit'&&P.opts.traits!==false)o.nerve=Math.max(o.nerve,30);
 const z1=zoneN(o.nerve);
 if(z0!==z1&&cause){swing(P,'nerve:'+o.short+':'+z0+'>'+z1,cause);
  if(z1==='LOSING IT')moment(P,ctx,'nerve',`${o.short} lost his nerve${cause.t?' — '+cause.t:''}`,'nerve:'+o.id+':lost','SCARY',4,cause);}
}
function pressAdd(P,ctx,d,cause){
 if(P.opts.flat)return;const z0=zoneP(P.pressure);P.pressure=clamp(P.pressure+d,0,100);const z1=zoneP(P.pressure);
 if(z0!==z1&&cause)swing(P,'pressure:'+z0+'>'+z1,cause);
}
const potCash=P=>P.pot.cash;
export const valueOfCrate=c=>c.val;
export const potValue=P=>P.pot.cash+P.pot.crates.reduce((a,c)=>a+c.val,0);

// -------------------------------------------------------------------------------------------------------------------------- init
export function initPlay(cfg){
 const {seed,job,policy,opts={},night=1}=cfg;const src=cfg.state||startRoster(seed);
 const S=structuredClone(src);
 const idx=cfg.nameIdx!=null?cfg.nameIdx:(seed%job.names.length+job.names.length)%job.names.length;
 const P={seed,job,jobName:job.names[idx],polName:policy,opts,night,roster:S.roster,bonds:S.bonds,known:S.known,cars:S.cars,beefs:S.beefs||[],weirdSeen:S.weirdSeen,dry:S.dry||0,
  crew:[],seat:{},carId:null,car:null,approach:null,pressure:0,pot:{cash:0,crates:[],lost:false,floor:false},promise:[],mem:[],swings:[],script:[],losses:[],stat:{evaluated:0,potential:0,meaningful:0,surfaced:0,suppressedNoDiv:0,suppressedBudget:0,diff:[],bestWorst:[],realized:[]},
  callsLeft:job.bigPlay?3:2,richUsed:false,ambush:false,crewFirst:false,carry:[],step:0,fired:new Set(),newCombos:[],combos:new Set(),acceptedNamed:[],result:null,tags:[],pitcher:null,card:null,cards:{},sim:false,
  moments:[],seenText:new Set(),emptyBeats:0,noThingCount:0,pitcherFixed:cfg.pitcher||null,beatLog:[],usedPatch:false,trait:{},turn:null,climb:[],gods:[]};

 return P;
}
const POL=(P)=>POLICIES[P.polName];
const RS=(P,k)=>stream(P.seed,k);
const RSf=(P,id)=>RS(P,'fin|'+id);

// -------------------------------------------------------------------------------------------------------------------------- PITCH
function pitch(P){
 const R=RS(P,'pitch');const job=P.job;
 const avail=P.roster.filter(o=>o.status==='READY');
 const pool=job.pitchers.filter(id=>avail.some(o=>o.id===id));
 P.pitcher=P.pitcherFixed||(pool.length?R.pick(pool):(avail.find(o=>o.named)||avail[0]).id);
 const line=(C.PITCH_LINES[P.pitcher]||C.PITCH_LINES.dre);
 const spot=job.place;const txt=R.pick(line).replace('{spot}',spot);
 const [lo,hi]=job.band;
 const cats=job.silhouettes;const shown=cats[0];const hidden=cats[1]==='?'?weighted(R,job.tilt,[shown]):cats[1];
 P.promise=[shown,hidden];
 P.pitchCard={name:P.jobName,take:`$${lo}–${hi}K`,shown,ugly:job.ugly,who:job.faction,tell:job.tell,hidden};
 say(P,'PITCH',`${txt}`);
 say(P,'PITCH',`┌ ${P.jobName}\n│ THE TAKE  $${lo}–${hi}K  [${shown}]  [?]\n│ HOW UGLY  ${job.ugly}${job.bigPlay?'  (BIG PLAY)':''}\n└ WHO       ${job.faction} — ${job.tell}`);
}
function weighted(R,tilt,exclude=[]){const es=Object.entries(tilt).filter(([k,w])=>w>0&&!exclude.includes(k));const tot=es.reduce((a,[,w])=>a+w,0);let x=R.next()*tot;for(const [k,w] of es){x-=w;if(x<=0)return k;}return es[0][0];}

// -------------------------------------------------------------------------------------------------------------------------- CAR (crew + seats + guns + approach)
function carStage(P){
 const R=RS(P,'car');const pol=POL(P);const job=P.job;
 const avail=P.roster.filter(o=>o.status==='READY'&&o.hp>0);
 let [smin,smax]=job.size;const carsAvail=Object.keys(C.CARS);
 // car first (the car sets crew size), but the policy sees the job
 const want=Math.min(smax,avail.length);
 let carId=P.opts.forceCar||pol.car(P,want,job,R);let seats=C.CARS[carId].seats.length;
 if((P.cars[carId]||0)>0&&!P.opts.carOff&&!P.opts.forceCar){carId='HOOPTIE';seats=4;}
 if(P.opts.carOff){carId='HOOPTIE';seats=4;}
 const n=clamp(Math.min(smax,seats,avail.length),Math.min(smin,seats),Math.min(smax,seats));
 P.carId=carId;P.car=P.opts.carOff?{...C.CARS.HOOPTIE,stall:0,grip:0,crash:0,tough:0,neutral:true}:{...C.CARS[carId]};
 P.crew=pol.crew(P,avail,n,job,R).slice(0,n);
 for(const o of P.crew){o.out=null;o.fled=false;o.rescued=false;o.tookHit=false;o.left=false;o.savedNow=[];o.skip=false;o.marked=false;o.suit=false;o.kills=0;o.finalStatus=null;o.dropBeat=null;o.dropCause=null;o.lastHitCause=null;o.wasSaved=false;o.crashHurt=false;}
 let seat;const seatList=P.car.seats.slice(0,P.crew.length>=P.car.seats.length?P.car.seats.length:P.crew.length);
 const seatsFor=(carId2)=>{const all=C.CARS[carId2].seats;if(P.crew.length>=all.length)return all.slice();const pr=['DRIVER','SHOTGUN','BACK_L','BACK_R','BACK_M'];return pr.filter(s=>all.includes(s)).slice(0,P.crew.length);};
 if(P.opts.carOff||P.opts.formation===false){const s=seatsFor(P.opts.carOff?'HOOPTIE':carId);const c=[...P.crew];seat={};s.forEach(x=>seat[x]=P.opts.formation===false?c.splice(R.int(0,c.length-1),1)[0]:c.shift());}
 else if(P.opts.seatMode==='worst')seat=bestSeating(P,P.crew,seatsFor(carId),-1);
 else seat=pol.seats(P,P.crew,carId,R);
 P.seat=Object.fromEntries(Object.entries(seat).map(([s,o])=>[s,o.id]));
 // crew objects in P.crew are references into P.roster (same objects) — good
 P.combos=activeCombos(P);
 P.approach=pol.approach(P,R);
 if(P.approach==='OCTOPUS'&&!job.octopus)P.approach='QUIET';
 if(P.approach==='QUIET'&&P.crew.every(o=>['MUSCLE','SHOOTER'].includes(o.cls))&&false)P.approach='LOUD';
 P.pressure=P.opts.flat?30:({QUIET:10,LOUD:40,OCTOPUS:20}[P.approach])+job.heat;
 for(const o of P.crew){o.plays++;o.nerve=P.opts.flat?60:o.base;}
 if(job.bigPlay)for(const o of P.crew)if(o.named)P.acceptedNamed.push(o.id);
 // combos the crew already knows glow on the car screen
 const glow=[...P.combos].filter(c=>P.known[c]).map(c=>COMBO_NAME[c]);
 const chips=Object.entries(P.seat).map(([s,id])=>{const o=P.crew.find(x=>x.id===id);return `${s.padEnd(8)} ${o.short}${o.nick?` "${o.nick}"`:''} · ${C.TRAIT_WORD[o.traits[0]]||o.traits[0]} · NERVE ${zoneN(o.nerve)} · ${(C.GUNS[o.gun]||C.GUNS.pistol).name} [${(C.GUNS[o.gun]||C.GUNS.pistol).role}]${o.scars.length?' · '+o.scars[0]:''}`;});
 say(P,'CAR',`${carId} — ${P.car.neutral?'ANYBODY\'S CAR':C.CARS[carId].word} · ${P.crew.length} SEATS FILLED`);
 for(const c of chips)say(P,'CAR','  '+c);
 if(glow.length)say(P,'CAR','  ✦ '+glow.join(' · '));
 say(P,'CAR',`APPROACH: ${P.approach==='OCTOPUS'?'OCTOPUS BRAIN':P.approach}   →   GO`);
 if(job.bigPlay)say(P,'CAR','STAKES: '+P.acceptedNamed.map(id=>P.crew.find(o=>o.id===id).short).join(', ')+' — MAY NOT COME BACK (accepted)');
}

// -------------------------------------------------------------------------------------------------------------------------- SLIDE-IN
function slideIn(P){
 const R=RS(P,'slide');const nerviest=[...P.crew].sort((a,b)=>a.nerve-b.nerve)[0];
 const bark=C.SLIDE_BARKS[nerviest.id]||C.SLIDE_BARKS[nerviest.quirk]?.replace('{n}',nerviest.short)||`${nerviest.short}: ...`;
 say(P,'SLIDE-IN',`headlights cut the dark. ${P.jobName.toLowerCase()} — the block: ${P.job.tell}.`);
 say(P,'SLIDE-IN',Object.values(P.seat).map(id=>P.crew.find(o=>o.id===id).name).join(' / ').replace(/ \/ $/,''));
 say(P,'SLIDE-IN',bark);
}

// -------------------------------------------------------------------------------------------------------------------------- cards
function drawCard(P,i,rk='real'){
 const st=STAGES[i];const R=RS(P,'card|'+st+'|'+P.step);const pool=C.CARDS[st];
 const w=pool.map(c=>{let x=1;
  if(st==='ENTRY'){if(P.approach==='QUIET'&&(c.tags.includes('dirty')||c.tags.includes('roof')||c.tags.includes('tight')))x+=.5;if(P.approach==='LOUD'&&(c.tags.includes('door')||c.tags.includes('dock')))x+=.5;}
  if(st==='TROUBLE'){if(P.pressure>=67&&(c.id==='reinforcements'||c.id==='alarm'))x+=1.2;if(c.id==='nodd')x=P.job.heat>=6?1.6:.6;if(c.id==='third_crew'&&P.job.faction.includes('HUNTERS'))x=.4;}
  if(st==='PRIZE'&&P.job.silhouettes.includes('GUN')&&c.id==='armory_rack')x+=1;
  return x;});
 const tot=w.reduce((a,b)=>a+b,0);let x=R.next()*tot;let c=pool[0];for(let k=0;k<pool.length;k++){x-=w[k];if(x<=0){c=pool[k];break;}}
 return {...c,smartVerb:SMART[c.id]||null};
}
function windowOptions(P,i){
 const card=P.card;const list=[];
 if(dropping(P).length&&i>=1)list.push('SAVE');
 const ctxPull=i>=2&&!P.richUsed&&(P.pressure>=34||dropping(P).length||P.crew.some(o=>o.hp<o.maxhp*.5));
 if(ctxPull)list.push('PULL_UP');
 for(const v of card.calls){if(v==='SAVE'&&!dropping(P).length)continue;if(v==='PULL_UP'&&(P.richUsed||i<2))continue;if(v==='FOLD'&&i===0)continue;list.push(v);}
 return [...new Set(list)].slice(0,3);
}

// -------------------------------------------------------------------------------------------------------------------------- enemies
function mkEnemy(type){const e=D.ENEMIES[type];return {type,hp:e.hp,maxhp:e.hp,aim:e.aim,weapon:e.weapon,fled:false,dead:false,flinch:false};}
function podsFor(P,st,card){
 let list=[...(P.job.pods[st]||[])];
 if(P.carry.length)list=list.concat(P.carry);
 if(st==='TROUBLE'){
  if(!P.opts.flat){if(P.pressure>=67)list=list.concat(P.job.pods.REINF);else if(P.pressure>=34)list=list.concat(P.job.pods.REINF.slice(0,1));}
  if(card.id==='reinforcements')list=list.concat(P.job.pods.REINF.slice(0,2));
  if(card.id==='lieutenant_out'&&!list.includes('LIEUTENANT'))list.push('LIEUTENANT');
  if(card.id==='third_crew')list.push('CHEWER','CHEWER');
  if(card.id==='nodd')list=[];
 }
 if(P.step>1){list.push('CHEWER');}
 if(P.step>0&&list.length){list=list.slice(0,P.step>1?3:2);if(P.step>2)list[0]=({CHEWER:'ENFORCER',ENFORCER:'LIEUTENANT',HUNTER:'LIEUTENANT',LIEUTENANT:'LIEUTENANT',LIL_SMACK:'LIL_SMACK'}[list[0]]||list[0]);}
 return list.slice(0,6).map(mkEnemy);
}

// -------------------------------------------------------------------------------------------------------------------------- one beat
function resolveBeat(P,i,opt,rk){
 const R=stream(P.seed,`b${i}|${rk}|${P.step}`);const st=STAGES[i];
 const ctx={P,R,i,st,card:P.card,opt,moments:[],aimB:0,dmgB:0,eAimB:0,talk:false,pay:false,sneak:false,pull:null,noise:0,tier:2,downs0:P.crew.filter(o=>o.hp<=0||o.out).length,pot0:potValue(P),p0:P.pressure,dmg:0,traitFail:0,traitMoments:0,ambush:P.ambush,crewFirst:P.crewFirst,cleared:true,wipe:false,foldNow:false,hazardHit:false};
 P.ambush=false;P.crewFirst=false;
 optionPre(ctx);
 beatStartTraits(ctx);
 if(st==='ENTRY')entryBeat(ctx);
 else if(st==='PRIZE'){fightBeat(ctx);if(!ctx.wipe&&!ctx.foldNow)prizeBeat(ctx);}
 else fightBeat(ctx);
 postBeat(ctx);
 return summarize(ctx);
}
function summarize(ctx){const P=ctx.P;return {tier:ctx.tier,downs:P.crew.filter(o=>o.hp<=0||o.out).length-ctx.downs0,dP:P.pressure-ctx.p0,dPot:potValue(P)-ctx.pot0,wipe:ctx.wipe,fold:ctx.foldNow};}
export const outcomeScore=(s,band)=>2*s.tier-2*s.downs-s.dP/25+s.dPot/Math.max(8,band)+(s.wipe?-4:0);

function optionPre(ctx){
 const {P,opt,card}=ctx;const v=opt;
 const face=(cls)=>able(P).find(o=>o.cls===cls);
 if(v==='DEFAULT'||!v)return;
 const smart=card.smartVerb===v?1:0;ctx.smart=smart;
 if(v==='TALK'){ctx.talk=true;const t=face('TALKER')||able(P).find(o=>has(P,o,'MOUTHPIECE'));ctx.talkFace=t;}
 if(v==='SNEAK'){ctx.sneak=true;ctx.sneakFace=face('GHOST')||able(P).find(o=>has(P,o,'SMALL'));}
 if(v==='BUST'){ctx.aimB+=8;ctx.dmgB+=1;ctx.noise+=10;ctx.bust=true;ctx.bustFace=face('MUSCLE')||face('SHOOTER');}
 if(v==='PAY'){ctx.pay=true;}
 if(v==='PUSH'){ctx.aimB+=6;ctx.noise+=6;ctx.push=true;}
 if(v==='FOLD'){ctx.foldNow=true;}
 if(v==='SAVE'){ctx.saveTry=true;}
 if(v==='PULL_UP'){ctx.pull=pullMove(P);P.richUsed=true;P.heatSeen=true;}
}
function pullMove(P){
 const hasLt=P.carryTypes?.includes('LIEUTENANT');
 if(P.crew.some(o=>o.hp<=0||o.out))return 'REVENGE';
 if(P.card&&P.card.smartVerb==='PULL_UP')return 'OCTOPUS_BRAIN';
 return P.pressure>=67?'BLOOD_BATH':'BITE';
}
function beatStartTraits(ctx){
 const {P,R,st}=ctx;
  if(st==='CONTACT'&&P.step===0&&P.opts.traits!==false&&P.crew.some(o=>has(P,o,'STEADY')&&o.hp>0)&&!ctx.ambush&&RS(P,'steadyfail').chance(.12)){const o=P.crew.find(o=>has(P,o,'STEADY')&&o.hp>0);ctx.ambush=true;pressAdd(P,ctx,8,cz(CAUSE.TRAIT,'STEADY'));moment(P,ctx,'trait',`${o.short} did not mention the guy on the roof — STEADY`,'trait:steady:fail','FUNNY',4,cz(CAUSE.TRAIT,'STEADY'));}
 if(st==='CONTACT'&&P.step===0&&P.opts.beef&&P.opts.beef!=='off'&&!P.beefDone){P.beefDone=true;
  for(const b of P.beefs){const a=P.crew.find(o=>o.id===b.from),c=P.crew.find(o=>o.id===b.to);if(!a||!c||a.hp<=0||c.hp<=0)continue;
   if(!adjSeats(seatOf(P,a),seatOf(P,c)))continue;
   const Rb=RS(P,'beef|'+b.from+b.to);P.beefSeen=(P.beefSeen||0)+1;
   if(Rb.chance(.6)){if(Rb.chance(.7)){nerveAdd(P,ctx,a,-8,cz(CAUSE.REL,'BEEF'));nerveAdd(P,ctx,c,-8,cz(CAUSE.REL,'BEEF'));pressAdd(P,ctx,6,cz(CAUSE.REL,'BEEF'));moment(P,ctx,'beef',`${a.short} and ${c.short} are still not talking (${b.src==='SPLIT'?'the curb':b.src==='FRIENDLY'?'the friendly fire':'the last one'}) — BEEF`,'beef:argue','FUNNY',6,cz(CAUSE.REL,'BEEF'));P.beefFired='argue';}
    else{nerveAdd(P,ctx,a,8,null);nerveAdd(P,ctx,c,8,null);P.beefSettled=(P.beefSettled||[]);P.beefSettled.push(b);moment(P,ctx,'beef',`${a.short} and ${c.short} squashed it in the middle of the fight — BEEF`,'beef:settle','WARM',7);P.beefFired='settle';}}
  }
 }
 if(P.opts.traits===false)return;
 for(const o of able(P)){
  if(has(P,o,'ALWAYS_EATING')&&o.hp<o.maxhp&&!o.eaten){o.hp=Math.min(o.maxhp,o.hp+D.TRAIT_NUMBERS.eatHeal);moment(P,ctx,'trait',`${o.short} finished the sandwich and feels better — ALWAYS EATING`,'trait:eat:heal','WARM',2);}
  if(o.id==='tunde'&&o.hp<o.maxhp&&fire(P,'snack_break',ctx)){o.hp++;nerveAdd(P,ctx,o,3,null);}
 }
}

// ------------------------------------------------------------ ENTRY
function entryBeat(ctx){
 const {P,R,card}=ctx;const job=P.job;const hz=card.hazard;
 let mode=P.approach;if(ctx.opt==='BUST')mode='LOUD';else if(ctx.opt==='SNEAK')mode='QUIET';
 if(ctx.pay){const cost=3;ctx.paid=cost;P.pot.cash-=0;P.spent=(P.spent||0)+cost;P.pot.cash=Math.max(0,P.pot.cash-0);ctx.tier=2;moment(P,ctx,'call',`Rich's pocket pays $${cost}K — the door opens`,'call:pay','WARM',3);nerveAdd(P,ctx,P.crew[0],2,null);ctx.entryOK=true;P.crewFirst=true;return;}
 if(mode==='LOUD'){
  pressAdd(P,ctx,20,cz(CAUSE.CHOICE,'they chose LOUD'));ctx.entryOK=true;
  if(firing(P,'doors_suggestion')&&(card.tags.includes('door')||card.tags.includes('dock'))&&fire(P,'doors_suggestion',ctx)){moment(P,ctx,'combo',"the door was a suggestion — DOOR'S A SUGGESTION",'combo:door','CLUTCH',5);P.crewFirst=true;pressAdd(P,ctx,-8,null);}
  else if(P.crew.some(o=>o.cls==='MUSCLE'&&o.hp>0)){P.crewFirst=R.chance(.5);if(P.crewFirst)moment(P,ctx,'class','a door goes down first',null,'CLUTCH',2);}
  else P.crewFirst=false;
  ctx.tier=2;return;
 }
 if(mode==='OCTOPUS'){
  const good=able(P).filter(o=>o.cls==='TALKER'||o.cls==='GHOST').length;let p=.5+.14*good+(ctx.smart?.12:0);p=fixNerve(P,p);
  if(R.chance(p)){ctx.tier=2;P.skipContact=true;pressAdd(P,ctx,-10,null);moment(P,ctx,'octopus',`OCTOPUS BRAIN: the crew ${job.octopus}`,'octopus:win','CLUTCH',7);}
  else{ctx.tier=0;P.ambush=true;pressAdd(P,ctx,25,cz(CAUSE.CHOICE,'the plan was weird'));moment(P,ctx,'octopus',`OCTOPUS BRAIN went sideways: they tried to ${job.octopus}`,'octopus:fail','FUNNY',7,cz(CAUSE.CHOICE,'the plan was weird'));swing(P,'entry:octopus-fail',cz(CAUSE.CHOICE,'the plan was weird'));}
  return;
 }
 // QUIET entry check
 let p=.6+(hz?hz.mod:0);const why=[];
 const gh=able(P).filter(o=>o.cls==='GHOST').length;p+=gh?.14:0;
 if(ctx.talk){p=.55+(ctx.talkFace?.cls==='TALKER'?.18:.04)+(has(P,ctx.talkFace||{traits:[]},'MOUTHPIECE')?D.TRAIT_NUMBERS.mouthpieceTalk/100:0)+(ctx.smart?.14:0);}
 if(ctx.sneak)p+=.06+(ctx.smart?.14:0)+(ctx.sneakFace?.cls==='GHOST'?.08:0);
 const loud=able(P).filter(o=>['sapporo_shotgun','mac_and_cheese'].includes(o.gun)).length;p-=loud*.05;
 let forced=null;
 for(const o of able(P)){
  if(P.opts.traits===false)break;
  if(has(P,o,'PHONE_OUT')){p+=.05;if(R.chance(.14)){forced=[o,'phone',cz(CAUSE.TRAIT,`${o.short}'s phone went off`)];}}
  if(has(P,o,'IMPATIENT')&&R.chance(.2)){forced=forced||[o,'jump',cz(CAUSE.TRAIT,`${o.short} couldn't wait`)];if(fire(P,'the_leash',ctx)){forced=forced&&forced[1]==='jump'?null:forced;moment(P,ctx,'combo',`Tunde held ${o.short} by the hood — THE LEASH`,'combo:leash','WARM',5);}}
  if(has(P,o,'CHURCH_SHOES')&&(card.tags.includes('stairs')||card.tags.includes('roof'))){p+=.08;moment(P,ctx,'trait',`${o.short} climbed it like Sunday — CHURCH SHOES`,'trait:church:up','CLUTCH',3);}
  if(has(P,o,'CHURCH_SHOES')&&(card.tags.includes('wet')||card.tags.includes('dirty'))&&R.chance(.35)){p-=.14;moment(P,ctx,'trait',`${o.short} slipped — CHURCH SHOES on a wet floor`,'trait:church:fail','FUNNY',4,cz(CAUSE.TRAIT,'CHURCH SHOES'));ctx.traitFail++;}
  if(has(P,o,'SMALL')&&(card.tags.includes('tight')||card.tags.includes('dirty')||card.tags.includes('roof'))){p+=.1;moment(P,ctx,'trait',`${o.short} vanished into the gap — SMALL`,'trait:small:up','CLUTCH',3);}
  if(has(P,o,'SKITTISH')){p+=.06;moment(P,ctx,'trait',`${o.short}: did you hear that — SKITTISH`,'trait:skittish:up','WARM',2);}
  if(has(P,o,'STEADY')&&R.chance(.08)){p-=.1;moment(P,ctx,'trait',`${o.short} did not mention the guy in the window — STEADY`,'trait:steady:fail','FUNNY',3);}
  if(o.nerve<30&&!P.opts.flat)p-=.05;
 }
 p=fixNerve(P,p);
 if(forced){
  const [o,k,cause]=forced;ctx.tier=0;P.ambush=true;pressAdd(P,ctx,k==='phone'?22:25,cause);swing(P,'entry:'+k,cause);
  moment(P,ctx,'trait',k==='phone'?`${o.short}'s phone went off — PHONE OUT`:`${o.short} jumped early — IMPATIENT`,'trait:'+(k==='phone'?'phone':'impatient')+':fail',k==='phone'?'FUNNY':'STUPID',7,cause);ctx.traitFail++;return;
 }
 if(R.chance(clamp(p,.05,.95))){
  ctx.tier=2;P.crewFirst=true;nerveAdd(P,ctx,P.crew[0],0,null);
  if(P.crew.some(o=>has(P,o,'PHONE_OUT'))&&!P.opts.flat)moment(P,ctx,'trait','Dre already had their photos — PHONE OUT','trait:phone:up','CLUTCH',3);
  if(p>.85&&false)moment(P,ctx,'sure','SURE THING???','sure','FUNNY',1);
 }else{
  ctx.tier=0;P.ambush=true;pressAdd(P,ctx,25,hz?cz(CAUSE.HAZARD,hz.word):cz(CAUSE.LUCK,''));swing(P,'entry:alarm',hz?cz(CAUSE.HAZARD,hz.word):cz(CAUSE.LUCK,''));
  moment(P,ctx,'entry',hz?`the alarm went — ${hz.word}`:'somebody looked up at the wrong time',hz?'entry:hazard':'entry:luck','SCARY',3,hz?cz(CAUSE.HAZARD,hz.word):cz(CAUSE.LUCK,''));
 }
}
function fixNerve(P,p){if(P.opts.flat)return p;const avg=able(P).reduce((a,o)=>a+o.nerve,0)/(able(P).length||1);return p+(avg>=55?.03:avg>=30?-.03:-.1);}

// ------------------------------------------------------------ FIGHT (CONTACT / TROUBLE / PRIZE guards)
function fightBeat(ctx){
 const {P,R,st,card}=ctx;
 if(st==='CONTACT'&&P.skipContact){P.skipContact=false;ctx.tier=2;return;}
 let pods=podsFor(P,st,card);P.carryTypes=pods.map(e=>e.type);
 // hazard on the card
 if(card.hazard)ctx.hazard=card.hazard;
 if(st==='TROUBLE'&&card.id==='nodd'){P.nodd=true;pressAdd(P,ctx,10,cz(CAUSE.EARLIER,'Officer Nodd was on patrol'));
  if(ctx.talk&&R.chance(.6+(ctx.smart?.2:0))){moment(P,ctx,'call','Dre waved. Nodd waved back. Nobody moved.','call:nodd:wave','FUNNY',6);P.nodd=false;}
  else if(ctx.pay){moment(P,ctx,'call',"Rich's pocket pays $3K — Nodd finds a very interesting cloud",'call:nodd:pay','FUNNY',5);P.spent=(P.spent||0)+3;P.nodd=false;}
  ctx.tier=P.nodd?1:2;P.tags.push('NODD');return;}
 if(st==='TROUBLE'&&card.id==='someone_down'){
  const t=able(P).sort((a,b)=>laneW(P,b)-laneW(P,a))[0];if(t)hurt(ctx,t,3+R.int(0,1),{by:'THE ONE SECOND',cause:cz(CAUSE.HAZARD,'it went wrong fast')});
 }
 if(card.id==='alarm'){pressAdd(P,ctx,12,cz(CAUSE.EARLIER,'the alarm went off'));}
 if(card.id==='power_cut'){ctx.eAimB-=5;ctx.aimB-=5;}
 if(ctx.foldNow){ctx.tier=1;return;}
 // TALK / PAY / SNEAK verbs on the enemy pods
 if(ctx.talk&&pods.length){
  const t=ctx.talkFace;let p=.45+(t?.cls==='TALKER'?.18:0)+(t&&has(P,t,'MOUTHPIECE')?D.TRAIT_NUMBERS.mouthpieceTalk/100:0)+(ctx.smart?.16:0)-(nervePenalty(P,t));
  const talkable=pods.filter(e=>e.type!=='HUNTER'&&e.type!=='LIL_SMACK');
  let removed=0;for(const e of talkable){if(R.chance(clamp(p,.1,.9))){e.fled=true;removed++;}}
  if(removed){moment(P,ctx,'call',`${t?t.short:'somebody'} talked ${removed>1?removed+' of them':'one of them'} out of it${t&&has(P,t,'MOUTHPIECE')?' — MOUTHPIECE':''}`,t&&has(P,t,'MOUTHPIECE')?'trait:mouth:up':'call:talk:win','FUNNY',5);pressAdd(P,ctx,-6*removed,null);}
  else{moment(P,ctx,'call',`${t?t.short:'somebody'} tried to talk. It did not land.`,'call:talk:fail','FUNNY',4,cz(CAUSE.CHOICE,'they chose to talk'));pressAdd(P,ctx,10,cz(CAUSE.CHOICE,'the talk went badly'));ctx.crewFirst=false;P.ambush=false;ctx.ambush=true;
   if(t&&has(P,t,'MOUTHPIECE')&&R.chance(.35)){moment(P,ctx,'trait',`${t.short} sold the lie twice — MOUTHPIECE`,'trait:mouth:fail','FUNNY',5);pressAdd(P,ctx,6,cz(CAUSE.TRAIT,'MOUTHPIECE'));ctx.traitFail++;}}
 }
 if(ctx.pay&&pods.length){const paid=pods.filter(e=>e.type==='CHEWER'||e.type==='ENFORCER').slice(0,2);if(paid.length){paid.forEach(e=>e.fled=true);P.spent=(P.spent||0)+3*paid.length;moment(P,ctx,'call',`Rich's pocket pays $${3*paid.length}K — ${paid.length} of them remember an appointment`,'call:pay','WARM',3);}}
 if(ctx.sneak&&pods.length&&st!=='TROUBLE'){if(R.chance(.5+(ctx.sneakFace?.cls==='GHOST'?.2:0)+(ctx.smart?.15:0))){ctx.crewFirst=true;ctx.aimB+=8;moment(P,ctx,'call',`${ctx.sneakFace?ctx.sneakFace.short:'somebody'} slid past them — the smart way`,'call:sneak:win','CLUTCH',4);}else{ctx.ambush=true;ctx.crewFirst=false;moment(P,ctx,'call','the sneak got a cough at the wrong moment','call:sneak:fail','FUNNY',4);}}
 if(ctx.pull)pullUp(ctx,pods);
 if(ctx.saveTry)doSaves(ctx);
 pods=pods.filter(e=>!e.fled&&!e.dead);
 if(!pods.length){ctx.tier=2;afterFightDrops(ctx);return;}
 const rounds=pods.length>=3||pods.some(e=>e.type==='LIL_SMACK')?3:2;
 const enemies=pods;
 const crewFirst=ctx.crewFirst&&!ctx.ambush;
 for(let r=0;r<rounds;r++){
  if(!able(P).length){ctx.wipe=true;break;}
  if(!enemies.some(e=>!e.dead&&!e.fled))break;
  const crewPhase=()=>{for(const o of able(P))crewAttack(ctx,o,enemies,r);};
  const enemyPhase=()=>{for(const e of enemies.filter(x=>!x.dead&&!x.fled))enemyAttack(ctx,e,r);};
  if(ctx.ambush&&r===0){enemyPhase();crewPhase();}else if(crewFirst&&r===0){crewPhase();enemyPhase();}else{crewPhase();enemyPhase();}
 }
 const left=enemies.filter(e=>!e.dead&&!e.fled);
 ctx.left=left;
 const kills=enemies.length-left.length;
 if(kills)pressAdd(P,ctx,-5*kills,null);
 if(!able(P).length)ctx.wipe=true;
 P.carry=left.slice(0,2).map(e=>e.type);
 const dn=P.crew.filter(o=>o.hp<=0||o.out).length-ctx.downs0;
 if(left.length){ctx.tier=0;pressAdd(P,ctx,12,cz(CAUSE.EARLIER,'they could not clear the room'));swing(P,'beat:'+st+':BAD',dn?cz(CAUSE.EARLIER,'someone went down'):cz(CAUSE.LUCK,''));}
 else ctx.tier=dn>0||ctx.dmg>=P.crew.reduce((a,o)=>a+o.maxhp,0)*.35?1:2;
 afterFightDrops(ctx);
}
const nervePenalty=(P,o)=>o&&!P.opts.flat?(o.nerve<30?.15:o.nerve<55?.05:0):0;
const laneW=(P,o)=>({FRONT:3,MID:2,DRIVER:1.5,BACK:1}[laneOf(P,o)]||1);

function crewAttack(ctx,o,enemies,r){
 const {P,R,st,card}=ctx;const live=enemies.filter(e=>!e.dead&&!e.fled);if(!live.length)return;
 const lane=laneOf(P,o);const gun=C.GUNS[o.gun]||C.GUNS.pistol;const T=P.opts.traits!==false;
 // --- trait actions that replace the shot (every trait has an upside and a failure)
 if(T){
  if(has(P,o,'ALWAYS_EATING')&&r===0&&R.chance(.12)){moment(P,ctx,'trait',`${o.short} finished the sandwich first — ALWAYS EATING`,'trait:eat:fail','FUNNY',4,cz(CAUSE.TRAIT,'ALWAYS EATING'));ctx.traitFail++;pressAdd(P,ctx,4,null);return;}
  if(has(P,o,'SEEN_IT_ALL')&&st!=='PRIZE'&&r===0&&R.chance(.14)){const e=live[0];if(R.chance(.5)&&e.type!=='LIL_SMACK'){e.fled=true;moment(P,ctx,'trait',`${o.short} lectured him into leaving — SEEN IT ALL`,'trait:seen:up','FUNNY',5);}else moment(P,ctx,'trait',`${o.short} stopped mid-fight to give a lecture — SEEN IT ALL`,'trait:seen:fail','FUNNY',5,cz(CAUSE.TRAIT,'SEEN IT ALL'));ctx.traitFail++;return;}
  if(has(P,o,'SIT_DOWN')&&r===0&&R.chance(.1)){const m=able(P).find(x=>x!==o);if(m){m.skip=true;moment(P,ctx,'trait',`"SIT DOWN." ${o.short} sat ${m.short} down mid-fight — SIT DOWN`,'trait:sitdown:fail','FUNNY',5,cz(CAUSE.TRAIT,'SIT DOWN'));ctx.traitFail++;}}
  if(o.skip){o.skip=false;return;}
  if(has(P,o,'CALM')&&r===0&&ctx.ambush&&R.chance(.3)){moment(P,ctx,'trait',`${o.short} let it land first — CALM`,'trait:calm:fail','FUNNY',3,cz(CAUSE.TRAIT,'CALM'));ctx.traitFail++;return;}
  if(has(P,o,'ROOKIE')&&st==='TROUBLE'&&R.chance(.2)){moment(P,ctx,'trait',`${o.short} froze — ROOKIE`,'trait:rookie:fail','STUPID',4,cz(CAUSE.TRAIT,'ROOKIE'));nerveAdd(P,ctx,o,-8,cz(CAUSE.TRAIT,'ROOKIE'));ctx.traitFail++;return;}
  if(has(P,o,'SKITTISH')&&(o.tookHit||o.nerve<30)&&R.chance(.35)){o.fled=true;moment(P,ctx,'trait',`${o.short} left. Just left. — SKITTISH`,'trait:skittish:fail','FUNNY',6,cz(CAUSE.TRAIT,'SKITTISH'));ctx.traitFail++;nerveAdd(P,ctx,o,0,null);swing(P,'left:'+o.short,cz(CAUSE.TRAIT,'SKITTISH'));return;}
  if(has(P,o,'HOTHEAD')&&r>0&&R.chance(.15)){pressAdd(P,ctx,6,cz(CAUSE.TRAIT,'HOTHEAD'));moment(P,ctx,'trait',`${o.short} broke formation to go at somebody — HOTHEAD`,'trait:hothead:fail','STUPID',4,cz(CAUSE.TRAIT,'HOTHEAD'));ctx.traitFail++;}
  if(has(P,o,'PHONE_OUT')&&P.approach==='QUIET'&&r===0&&R.chance(.06)){pressAdd(P,ctx,4,cz(CAUSE.TRAIT,'PHONE OUT'));moment(P,ctx,'trait',`${o.short}'s phone lit up in the middle of it — PHONE OUT`,'trait:phone:fail2','FUNNY',4,cz(CAUSE.TRAIT,'PHONE OUT'));}
 }
 // --- aim
 const why={};
 let aim=o.aim;
 if(!P.opts.carOff){const f=C.FIT[o.cls][lane==='DRIVER'?'DRIVER':lane];aim+=(f-.6)*16;if(f<.4)why.seat=true;}
 if(!P.opts.flat){aim+=o.nerve>=55?3:o.nerve>=30?-4:-12;}
 const gl=gun.lane;
 if(gun.eff==='breach'&&lane==='FRONT')aim+=12;else if(gun.eff==='breach'){aim-=6;why.weapon=true;}
 if(gun.eff==='pick'&&lane==='BACK')aim+=12;else if(gun.eff==='pick'){aim-=10;why.weapon=true;}
 if(gun.eff==='spray')aim-=10;if(gun.eff==='flinch')aim-=5;
 if(T){
  if(has(P,o,'CALM')&&P.pressure>=34)aim+=D.TRAIT_NUMBERS.calmAim/2;
  if(has(P,o,'ROOKIE')&&!o.perks.length)aim+=D.TRAIT_NUMBERS.rookieAim;
  if(has(P,o,'STEADY'))aim+=3;
  if(has(P,o,'HOTHEAD')&&r===0)aim+=8;
  if(has(P,o,'IMPATIENT')&&r===0&&ctx.crewFirst)aim+=8;
  if(has(P,o,'CHURCH_SHOES')&&r===0&&(card.tags.includes('wet')||card.tags.includes('dirty'))&&R.chance(.3)){aim-=10;why.trait=true;}
  if(has(P,o,'DRESSED_TO_KILL')&&o.hp===o.maxhp)aim+=2;
  if(has(P,o,'CALM')&&false)aim+=0;
 }
 for(const b of P.bonds){if(b.includes(o.id)){const other=able(P).find(x=>b.includes(x.id)&&x!==o);if(other&&adjSeats(seatOf(P,o),seatOf(P,other))&&firing(P,'day_ones')&&fire(P,'day_ones',ctx))aim+=D.BOND.aim;}}
 if(o.perks.includes('saw_95_miss'))aim+=D.STORY_NUMBERS.saw95Aim;if(o.perks.includes('survived_car_wash'))aim+=D.STORY_NUMBERS.carWashAim;
 aim-=3*(P.tired||0);
 aim+=ctx.aimB+(ctx.hazard?ctx.hazard.mod*100:0)+(P.approach==='LOUD'?5:0)+(ctx.crewFirst&&r===0?10:0);
 if(firing(P,'sunday_service')&&o.id==='sunday_best'&&fire(P,'sunday_service',ctx))aim+=10;
 // --- pick a target
 let tgt=live.find(e=>e.type==='LIEUTENANT'||e.type==='LIL_SMACK')&&(o.cls==='SHOOTER'||gun.eff==='pick')?live.find(e=>e.type==='LIEUTENANT'||e.type==='LIL_SMACK'):live[R.int(0,live.length-1)];
 const shots=o.gun==='mac_and_cheese'?2:1;
 for(let s=0;s<shots;s++){
  if(!live.some(e=>!e.dead&&!e.fled))break;
  if(!tgt||tgt.dead||tgt.fled)tgt=live.find(e=>!e.dead&&!e.fled);
  let a=aim;
  if(gun.eff==='spray'&&!ctx.friendly&&R.chance(.16)){const m=able(P).filter(x=>x!==o);if(m.length){ctx.friendly=1;const v=m[R.int(0,m.length-1)];hurt(ctx,v,2,{by:'MAC & CHEESE',cause:cz(CAUSE.WEAPON,'MAC & CHEESE — aim is a state of mind')});moment(P,ctx,'weapon',`${o.short} sprayed a little too wide and hit ${v.short} — MAC & CHEESE`,'weapon:mac:friendly','FUNNY',6,cz(CAUSE.WEAPON,'MAC & CHEESE'));if(P.opts.beef==='wide'&&!P.sim)(P.beef=P.beef||[]).push({from:v.id,to:o.id,src:'FRIENDLY'});continue;}}
  if(T&&has(P,o,'SHOWBOAT')&&R.chance(.25)){a+=10;o.marked=true;if(R.chance(clamp(a,5,95)/100)){tgt.hp-=gun.dmg[1]+2;moment(P,ctx,'trait',`${o.short}: watch this — and it worked — SHOWBOAT`,'trait:showboat:up','CLUTCH',5);}else{moment(P,ctx,'trait',`${o.short}: watch this — and everyone watched it miss — SHOWBOAT`,'trait:showboat:fail','FUNNY',5,cz(CAUSE.TRAIT,'SHOWBOAT'));ctx.traitFail++;}
   if(tgt.hp<=0){tgt.dead=true;}continue;}
  a=clamp(a,5,95);const roll=R.next()*100;const sure=a>=90;
  // fumble at LOSING IT
  if(!P.opts.flat&&o.nerve<30&&R.chance(.18)){moment(P,ctx,'nerve',`${o.short} dropped the clip — nerve gone`,'nerve:fumble','STUPID',4,cz(CAUSE.EARLIER,'he lost his nerve'));continue;}
  if(roll<a){
   let dmg=R.int(gun.dmg[0],gun.dmg[1])+ctx.dmgB;
   if(T&&has(P,o,'DRESSED_TO_KILL')&&o.hp===o.maxhp)dmg+=D.TRAIT_NUMBERS.dressedDamage;
   if(T&&has(P,o,'HOTHEAD')&&r===0)dmg+=1;
   if(gun.eff==='pick'&&(tgt.type==='LIEUTENANT'||tgt.type==='LIL_SMACK'))dmg+=2;
   if(R.chance(D.HIT.critBase/100)){dmg=Math.ceil(dmg*D.HIT.critMult);}
   if(T&&has(P,o,'HOTHEAD')&&firing(P,'coin_flip')&&fire(P,'coin_flip',ctx)&&r===0){if(R.chance(.5)){dmg*=2;moment(P,ctx,'combo',`${o.short} in the shotgun seat went for it and it WORKED — COIN FLIP`,'combo:coin:up','CLUTCH',7);}else{hurt(ctx,o,3,{by:'HIS OWN CHARGE',cause:cz(CAUSE.TRAIT,'HOTHEAD in the shotgun seat')});moment(P,ctx,'combo',`${o.short} in the shotgun seat went for it and ate the door — COIN FLIP`,'combo:coin:fail','FUNNY',7,cz(CAUSE.TRAIT,'HOTHEAD'));}}
   tgt.hp-=dmg;if(gun.eff==='flinch')tgt.flinch=true;
   if(tgt.hp<=0){tgt.dead=true;o.kills=(o.kills||0)+1;
    if(T&&o.kills===1){if(has(P,o,'DRESSED_TO_KILL')&&o.hp===o.maxhp)moment(P,ctx,'trait',`${o.short} dropped him without a crease — DRESSED TO KILL`,'trait:dressed:up','CLUTCH',3);
     if(has(P,o,'IMPATIENT')&&r===0)moment(P,ctx,'trait',`${o.short} was through the door first — IMPATIENT`,'trait:impatient:up','CLUTCH',3);
     if(has(P,o,'ROOKIE')){nerveAdd(P,ctx,o,10,null);o.rookieFirst=true;moment(P,ctx,'trait',`${o.short} got his first real one — ROOKIE`,'trait:rookie:up','WARM',5);}
     if(has(P,o,'HOTHEAD')&&r===0)moment(P,ctx,'trait',`${o.short} went first and it worked — HOTHEAD`,'trait:hothead:up','CLUTCH',3);}
    if(tgt.type==='LIL_SMACK'){tgt.dead=false;tgt.fled=true;tgt.hp=4;moment(P,ctx,'boss',`LIL SMACK ran. He always comes back.`,'boss:smack:flee','SCARY',5);}
    else if(tgt.type==='LIEUTENANT'){moment(P,ctx,'class',`${o.short} dropped the green fur${o.cls==='SHOOTER'?' — one shot':''}`,'class:lt:drop','CLUTCH',o.cls==='SHOOTER'?5:3);pressAdd(P,ctx,-8,null);}}
   else if(tgt.type==='LIL_SMACK'&&tgt.hp<=D.ENEMY_NUMBERS.smackFleeHp){tgt.fled=true;moment(P,ctx,'boss','LIL SMACK ran. He always comes back.','boss:smack:flee','SCARY',5);}
  }else{
   if(sure&&R.chance(.6)){moment(P,ctx,'sure','SURE THING???','sure:fail','FUNNY',6,cz(CAUSE.LUCK,''));}
   if(gun.eff==='flinch'&&false){}
  }
 }
}
function enemyAttack(ctx,e,r){
 const {P,R,card}=ctx;if(e.flinch){e.flinch=false;moment(P,ctx,'weapon',"Auntie's Slipper connected. He forgot what he was doing.",'weapon:slipper','FUNNY',5);return;}
 const live=able(P);if(!live.length)return;
 if(!R.chance(.65))return; // not every gun in a pod is up every round
 const T=P.opts.traits!==false;
 const ws=live.map(o=>{let w=laneW(P,o);
  if(e.type==='CHEWER'&&(laneOf(P,o)==='BACK'||laneOf(P,o)==='MID'))w*=2;
  if(e.type==='ENFORCER'&&laneOf(P,o)==='FRONT')w*=3;if(e.type==='LIL_SMACK'&&laneOf(P,o)==='FRONT')w*=2;
  if(e.type==='HUNTER'&&o.vampire)w*=3;if(o.marked)w*=2;if(T&&has(P,o,'CALM'))w*=.9;return w;});
 const tot=ws.reduce((a,b)=>a+b,0);let x=R.next()*tot;let tgt=live[0];for(let k=0;k<live.length;k++){x-=ws[k];if(x<=0){tgt=live[k];break;}}
 const lt=P.carryTypes?.includes('LIEUTENANT')?D.ENEMY_NUMBERS.lieutenantAura:0;
 let hit=e.aim-4+2*(P.tired||0)+lt+(P.approach==='LOUD'?5:0)+(!P.opts.flat&&P.pressure>=67?5:0)+ctx.eAimB+(ctx.ambush&&r===0?6:0)-(T&&has(P,tgt,'SMALL')?-D.TRAIT_NUMBERS.smallDefense:0)+(e.type==='LIL_SMACK'?D.ENEMY_NUMBERS.chewAim:0);
 if(T&&has(P,tgt,'SMALL')){hit+=D.TRAIT_NUMBERS.smallDefense;if(R.chance(.15))moment(P,ctx,'trait',`${tgt.short} wasn't there — SMALL`,'trait:small:dodge','FUNNY',3);}
 hit=clamp(hit,5,95);
 if(R.next()*100<hit){
  const w=D.WEAPONS[e.weapon];let dmg=R.int(w.dmg[0],w.dmg[1]);if(w.silver&&tgt.vampire)dmg+=w.silver;
  const crit=R.chance(D.HIT.critBase/100);if(crit)dmg=Math.ceil(dmg*D.HIT.critMult);
  if(P.car&&P.car.tough>0&&!P.opts.carOff&&R.chance(P.car.tough))dmg=Math.max(1,dmg-1);
  // cause for the hit
  let cause=cz(CAUSE.LUCK,'');
  if(ctx.ambush&&r===0)cause=cz(CAUSE.EARLIER,'they were already waiting');
  else if(e.type==='HUNTER'&&tgt.vampire)cause=cz(CAUSE.ENEMY,'hunters go straight for vampires');
  else if(e.type==='CHEWER'&&laneOf(P,tgt)!=='FRONT')cause=cz(CAUSE.ENEMY,'the chewers flank');
  else if(e.type==='ENFORCER'&&laneOf(P,tgt)==='FRONT')cause=cz(CAUSE.ENEMY,'enforcers charge the front seat');
  else if(ctx.hazard&&ctx.hazard.mod<=-.05)cause=cz(CAUSE.HAZARD,ctx.hazard.word);
  else if(tgt.marked)cause=cz(CAUSE.TRAIT,'SHOWBOAT drew the fire');
  else if(!P.opts.flat&&tgt.nerve<30)cause=cz(CAUSE.EARLIER,'he lost his nerve');
  else if(tgt.hp<tgt.maxhp)cause=cz(CAUSE.EARLIER,`${tgt.short} was already hurt`);
  else if(!P.opts.carOff&&C.FIT[tgt.cls][laneOf(P,tgt)]<.4)cause=cz(CAUSE.SEAT,`${tgt.short} was in the wrong seat`);
  else if(ctx.push||ctx.bust)cause=cz(CAUSE.CHOICE,'they chose to push');
  else if(laneOf(P,tgt)==='FRONT'&&!P.opts.carOff)cause=cz(CAUSE.SEAT,'the front seat takes the first shots');
  hurt(ctx,tgt,dmg,{by:D.ENEMIES[e.type].label,cause});
 }
}
function hurt(ctx,o,dmg,src){
 const {P}=ctx;if(o.hp<=0)return;
 const was=o.hp;o.hp=Math.max(0,o.hp-dmg);o.tookHit=true;o.lastHitCause=src.cause;ctx.dmg+=Math.min(dmg,was);
 nerveAdd(P,ctx,o,-4,src.cause);
 if(has(P,o,'DRESSED_TO_KILL')&&was===o.maxhp&&!o.suit&&RS(P,'suit|'+P.step+'|'+ctx.i+'|'+o.id).chance(.4)){o.suit=true;nerveAdd(P,ctx,o,-15,cz(CAUSE.TRAIT,'DRESSED TO KILL'));moment(P,ctx,'trait',`${o.short}'s suit is ruined — DRESSED TO KILL`,'trait:dressed:fail','FUNNY',5,cz(CAUSE.TRAIT,'DRESSED TO KILL'));ctx.traitFail++;}
 if(o.hp<=0){
  o.dropBeat=ctx.i;o.dropCause=src.cause;o.dropBy=src.by;swing(P,'down:'+o.short,src.cause);
  for(const x of able(P)){if(x===o)continue;const partner=P.bonds.some(b=>b.includes(o.id)&&b.includes(x.id));nerveAdd(P,ctx,x,partner?-22:-10,cz(partner?CAUSE.REL:CAUSE.EARLIER,partner?`${x.short} watched ${o.short} go down`:`${o.short} went down`));if(partner)moment(P,ctx,'bond',`${x.short} saw ${o.short} go down — DAY ONES`,'bond:witness','SCARY',5,cz(CAUSE.REL,'DAY ONES'));}
  pressAdd(P,ctx,8,cz(CAUSE.EARLIER,`${o.short} went down`));
  moment(P,ctx,'down',`${o.short} went down${src.by?' — '+src.by:''}`,null,'SCARY',6,src.cause);
  ctx.newDrops=(ctx.newDrops||[]);ctx.newDrops.push(o);
 }
}
function pullUp(ctx,pods){
 const {P,R}=ctx;const m=ctx.pull;
 say(P,'CALLS',`  RICH PULLS UP — ${m.replace('_',' ')}`);
 P.tags.push('RICH');P.heat=(P.heat||0)+15;
 if(m==='BLOOD_BATH'){for(const e of pods.slice(0,3)){e.dead=true;}moment(P,ctx,'rich','Rich stepped out of the car. Three of them stopped being a problem.','rich:bloodbath','SCARY',8);pressAdd(P,ctx,-14,null);}
 else if(m==='BITE'){const t=pods.find(e=>e.type==='LIEUTENANT'||e.type==='LIL_SMACK')||pods[0];if(t){t.dead=true;if(t.type==='LIL_SMACK'){t.dead=false;t.fled=true;}}moment(P,ctx,'rich','Rich bit the one in the green fur.','rich:bite','SCARY',7);}
 else if(m==='OCTOPUS_BRAIN'){for(const e of pods.filter(x=>x.type!=='HUNTER'))e.fled=true;moment(P,ctx,'rich',`Rich's octopus brain: "${P.card.smart}."`,'rich:octopus','CLUTCH',8);pressAdd(P,ctx,-10,null);}
 else if(m==='REVENGE'){ctx.dmgB+=2;ctx.aimB+=8;for(const o of able(P))nerveAdd(P,ctx,o,10,null);moment(P,ctx,'rich','Rich saw who was down. Nobody asked what happened next.','rich:revenge','CLUTCH',8);}
}
function doSaves(ctx){
 const {P,R}=ctx;
 for(const d of dropping(P)){
  const rescuer=able(P).sort((a,b)=>(b.cls==='DOC'?2:0)+(has(P,b,'SIT_DOWN')?1:0)-(a.cls==='DOC'?2:0)-(has(P,a,'SIT_DOWN')?1:0))[0];if(!rescuer){continue;}
  const partner=P.bonds.some(b=>b.includes(d.id)&&b.includes(rescuer.id));
  const p=.62+(partner?.15:0)+(rescuer.cls==='DOC'?.15:0)+(has(P,rescuer,'LOYAL')?.1:0)-nervePenalty(P,rescuer);
  ctx.savedTry=true;
  if(R.chance(clamp(p,.2,.92))){d.hp=1;d.rescued=true;d.wasSaved=true;d.dropBeat=null;markSaved(rescuer,d);nerveAdd(P,ctx,rescuer,-4,null);nerveAdd(P,ctx,d,6,null);
   moment(P,ctx,'call',`${rescuer.short} went back for ${d.short}${partner?' — DAY ONES':''}${has(P,rescuer,'LOYAL')?' — LOYAL':''}`,has(P,rescuer,'LOYAL')?'trait:loyal:up':'call:save:win','CLUTCH',8);ctx.saveWin=(ctx.saveWin||0)+1;swing(P,'save:'+d.short,cz(CAUSE.CHOICE,'they went back for him'));}
  else{hurt(ctx,rescuer,3,{by:'GOING BACK',cause:cz(CAUSE.CHOICE,'they went back for him')});moment(P,ctx,'call',`${rescuer.short} went back for ${d.short}. It cost them both.`,'call:save:fail','SCARY',7,cz(CAUSE.CHOICE,'they went back for him'));}
  pressAdd(P,ctx,4,cz(CAUSE.CHOICE,'they went back'));
 }
}
function afterFightDrops(ctx){
 const {P,R}=ctx;
 // auto-rescues at end of beat (no call needed)
 for(const d of dropping(P)){
  const sd=able(P).find(x=>has(P,x,'SIT_DOWN')&&x!==d&&(adjSeats(seatOf(P,x),seatOf(P,d))||laneOf(P,x)===laneOf(P,d)));
  if(sd&&!ctx.sitUsed){ctx.sitUsed=1;d.hp=1;d.rescued=true;d.wasSaved=true;d.dropBeat=null;moment(P,ctx,'trait',`"SIT DOWN." ${d.short} sat down and stopped bleeding — SIT DOWN`,'trait:sitdown:up','WARM',6);continue;}
  const doc=able(P).find(x=>x.cls==='DOC'&&x!==d&&!P.usedPatch);
  if(doc&&P.opts.traits!==false){P.usedPatch=true;d.hp=D.ABILITY_NUMBERS.patchHeal;d.rescued=true;d.wasSaved=true;d.dropBeat=null;markSaved(doc,d);moment(P,ctx,'class',`${doc.short} patched ${d.short} up on the floor of the van`,'class:patch','WARM',5);continue;}
  const partner=able(P).find(x=>P.bonds.some(b=>b.includes(d.id)&&b.includes(x.id)));
  if(partner&&R.chance(.5)){d.hp=1;d.rescued=true;d.wasSaved=true;d.dropBeat=null;markSaved(partner,d);nerveAdd(P,ctx,partner,-6,null);pressAdd(P,ctx,5,cz(CAUSE.REL,'DAY ONES went back'));moment(P,ctx,'bond',`${partner.short} went back for ${d.short} without being asked — DAY ONES`,'bond:save','CLUTCH',9);swing(P,'bond-save',cz(CAUSE.REL,'DAY ONES'));continue;}
  if(!d.named&&R.chance(.4)){ // sudden generic death
   d.out='DEAD';d.dropBeat=null;moment(P,ctx,'death',`${d.short} caught one. He's gone.`,'death:generic','SCARY',9,d.dropCause);P.losses.push({who:d.id,kind:'DEAD',cause:d.dropCause||cz(CAUSE.LUCK,''),tag:causeTag(P,d.dropCause,'DEAD_SUDDEN'),beat:ctx.i,text:`${d.short} caught one. He's gone.`});
   for(const x of able(P))nerveAdd(P,ctx,x,-8,cz(CAUSE.EARLIER,`${d.short} caught one`));}
 }
}
function causeTag(P,cause,kind){ // FUNNY / DRAMATIC / PLAIN — an honest read of how the loss will land
 if(!cause)return 'PLAIN';
 if(kind==='DEAD_SUDDEN')return 'FUNNY'; // the authored dark-comic line ("caught one. He's gone.")
 if(cause.c===CAUSE.TRAIT||cause.c===CAUSE.CAR||cause.c===CAUSE.WEAPON)return 'FUNNY';
 if(cause.c===CAUSE.GREED||P.job.bigPlay||P.step>0||cause.c===CAUSE.CHOICE||cause.c===CAUSE.REL)return 'DRAMATIC';
 if(kind==='CAPTURED'||kind==='GONE')return 'DRAMATIC';
 return 'PLAIN';
}

// ------------------------------------------------------------ PRIZE
function prizeBeat(ctx){
 const {P,R,card,st}=ctx;const job=P.job;
 let p=.93+(card.hazard?card.hazard.mod:0);const why=[];
 if(card.hazard)why.push(cz(CAUSE.HAZARD,card.hazard.word));
 if(ctx.talk)p+=.04+(ctx.smart?.05:0);if(ctx.sneak)p+=.03+(ctx.smart?.05:0);if(ctx.push)p+=.03;
 if(card.tags.includes('talk')&&!able(P).some(o=>o.cls==='TALKER')){p-=.1;why.push(cz(CAUSE.SEAT,'nobody in the car could talk the client down'));}
 if(card.tags.includes('safe')&&!able(P).some(o=>o.cls==='MUSCLE'||o.gun==='sapporo_shotgun')){p-=.1;why.push(cz(CAUSE.SEAT,'nobody in the car could open it'));}
 if(!P.opts.flat){if(P.pressure>=67){p-=.12;why.push(cz(CAUSE.EARLIER,'the whole block was closing in'));}
  const avg=able(P).reduce((a,o)=>a+o.nerve,0)/(able(P).length||1);if(avg<30){p-=.1;why.push(cz(CAUSE.EARLIER,'the crew had lost its nerve'));}}
 if(P.crew.filter(o=>o.hp<=0||o.out).length){p-=.05;why.push(cz(CAUSE.EARLIER,'they were a body short'));}
 let q=0;let heavy=false;
 if(R.chance(clamp(p,.1,.97))){q=.85+R.next()*.15;ctx.tier=Math.max(ctx.tier,2);}
 else{q=.4;ctx.tier=Math.min(ctx.tier,1);const cz2=why.length?why[0]:cz(CAUSE.LUCK,'');moment(P,ctx,'prize',why.length?`the prize slipped — ${cz2.t}`:'the prize was not where it was supposed to be',why.length?'prize:'+cz2.c.toLowerCase():'prize:luck','SCARY',3,cz2);swing(P,'prize:thin',cz2);}
 if(ctx.left&&ctx.left.length){q=Math.min(q,.5);ctx.tier=Math.min(ctx.tier,1);}
 P.prizeQ=q;
 // carry weight / traits at the prize
 for(const o of able(P)){
  if(P.opts.traits===false)break;
  if(has(P,o,'MOUTHPIECE')&&R.chance(.35)){if(R.chance(.7)){P.haggle=(P.haggle||0)+0.08;moment(P,ctx,'trait',`${o.short} haggled the number up — MOUTHPIECE`,'trait:mouth:up','FUNNY',4);}else{P.haggle=(P.haggle||0)-0.06;moment(P,ctx,'trait',`${o.short} oversold it and the client wants a discount — MOUTHPIECE`,'trait:mouth:fail','FUNNY',5,cz(CAUSE.TRAIT,'MOUTHPIECE'));ctx.traitFail++;}}
  if(has(P,o,'STICKY_FINGERS')){if(R.chance(.3)){P.extraCrate=(P.extraCrate||0)+1;moment(P,ctx,'trait',`${o.short} found something extra and it went in his pocket — STICKY FINGERS`,'trait:sticky:up','WARM',4);if(R.chance(.35)){pressAdd(P,ctx,12,cz(CAUSE.TRAIT,'STICKY FINGERS'));moment(P,ctx,'trait',`${o.short} was seen — STICKY FINGERS`,'trait:sticky:fail','FUNNY',5,cz(CAUSE.TRAIT,'STICKY FINGERS'));ctx.traitFail++;swing(P,'sticky',cz(CAUSE.TRAIT,'STICKY FINGERS'));}}}
  if(has(P,o,'SMALL')&&(card.tags.includes('safe')||card.tags.includes('supply')||card.tags.includes('guns'))){heavy=true;moment(P,ctx,'trait',`${o.short} could not lift it alone — SMALL`,'trait:small:fail','FUNNY',4,cz(CAUSE.TRAIT,'SMALL'));P.lightLoad=true;ctx.traitFail++;}
  if(has(P,o,'LOYAL')&&P.crew.some(x=>x.hp<=0&&!x.out)){/* loyal won't leave anyone: handled in getaway */}
 }
}

// ------------------------------------------------------------ post-beat bookkeeping (nerve / pressure / moment staging)
const CAPTIONS={ENTRY:{2:['In. Nobody looked up.','The door was never a problem.','Someone holds it open without knowing why.'],1:['Through the door, a little louder than planned.','Not pretty. Inside.'],0:['That was not the plan.']},
 CONTACT:{2:['Over before anyone finishes chewing.','Two seconds. Nobody had a story.','They never got a shot off.'],1:['Messy, and over.','Everyone is breathing hard.'],0:['They are still standing. That is not good.']},
 TROUBLE:{2:['Whatever that was, it stops.','The block blinks first.','Short, loud, done.'],1:['They hold the line. Barely.','It costs something.'],0:['It keeps getting worse.']},
 PRIZE:{2:['The take is real.','It was exactly where the pitch said.','Nobody says anything. That is how they know.'],1:['Less than promised. Still something.','They take what they can carry.'],0:['Not what anybody came for.']}};
const R0=(P,ctx,o)=>RS(P,'steady|'+ctx.i+'|'+P.step+'|'+o.id).chance(.5);
function postBeat(ctx){
 const {P,i,st}=ctx;
 // pressure/nerve drift per tier
 const tier=ctx.tier;
 const base={0:14,1:5,2:-2}[tier]+ (ctx.noise||0)/2+(P.card.weight||3);
 pressAdd(P,ctx,base*.5,tier===0?cz(CAUSE.EARLIER,'the beat went bad'):null);
 for(const o of able(P)){
  const d={0:-9,1:-3,2:+5}[tier];
  if(has(P,o,'CALM')&&d<0&&!ctx.calmUsed){ctx.calmUsed=1;moment(P,ctx,'trait',`${o.short} did not blink — CALM`,'trait:calm:up','CLUTCH',3);continue;}
  if(has(P,o,'STEADY')&&d<0&&R0(P,ctx,o)){nerveAdd(P,ctx,o,Math.ceil(d/2),tier===0?cz(CAUSE.EARLIER,'the beat went bad'):null);moment(P,ctx,'trait',`${o.short}: mm. — STEADY`,'trait:steady:up','WARM',2);continue;}
  nerveAdd(P,ctx,o,d,tier===0?cz(CAUSE.EARLIER,'the beat went bad'):null);
  if(!P.opts.flat&&P.pressure>=67)nerveAdd(P,ctx,o,-4,cz(CAUSE.EARLIER,'the whole block was closing in'));
 }
 if(tier===0)swing(P,'tier:'+st+':BAD',cz(ctx.traitFail?CAUSE.TRAIT:P.ambush?CAUSE.EARLIER:CAUSE.LUCK,''));
 else if(tier===2)swing(P,'tier:'+st+':CLEAN',ctx.traitFail||ctx.opt!=='DEFAULT'?cz(ctx.opt!=='DEFAULT'?CAUSE.CHOICE:CAUSE.TRAIT,''):cz(CAUSE.EARLIER,'the crew was set up right'));
 // trait chain
 const traitMs=ctx.moments.filter(m=>(m.kind==='trait'||m.kind==='combo')&&m.text.includes(' — '));
 if(traitMs.length>=2&&traitMs.some(m=>m.tag==='FUNNY'||m.tag==='STUPID'||m.tag==='SCARY')&&traitMs.filter(m=>m.w>=4).length>=2&&new Set(traitMs.map(m=>whoOf(P,m.text))).size>=2)moment(P,ctx,'chain',`${traitMs.length} traits in one beat: ${traitMs.map(m=>m.text.split(' — ').pop()).join(' + ')}`,'chain:'+traitMs.map(m=>m.text.split(' — ').pop()).sort().join('+'),'FUNNY',6);
 // staging: at most 3 moment cards per beat
 if(!P.sim){
  const rank=[...ctx.moments].sort((a,b)=>b.w-a.w).slice(0,3);
  say(P,'BEATS',`▸ ${st} — ${P.card.text}`+(P.card.hazard?`  (${P.card.hazard.word})`:''));
  for(const m of rank)say(P,'BEATS',`    ${m.tag==='CLUTCH'?'★':m.tag==='FUNNY'?'☺':m.tag==='SCARY'?'▲':m.tag==='WARM'?'♥':'•'} ${m.text}`);
  if(!rank.length){P.emptyBeats++;const cp=CAPTIONS[st][tier];say(P,'BEATS','    '+cp[Math.abs(P.seed+i*7+P.step)%cp.length]);}
  P.beatLog.push({st,tier,card:P.card.id,moments:ctx.moments.length});
  ctx.moments.forEach(m=>P.moments.push(m));
 }
}

// -------------------------------------------------------------------------------------------------------------------------- call windows (divergence check with common random numbers)
const fork=(P)=>{const c=structuredClone(P);c.sim=true;c.script=[];return c;};
const sdv=a=>{if(a.length<2)return 0;const m=a.reduce((x,y)=>x+y,0)/a.length;return Math.sqrt(a.reduce((x,y)=>x+(y-m)**2,0)/(a.length-1));};
// A call is only offered when the buttons genuinely diverge: over 6 common-random-number futures the best and worst button differ
// by >= ~one beat tier on average AND the paired difference is not dice noise (t >= 2).
function diverge(P,i,opts,scorer,minGap){
 const all=['DEFAULT',...opts];const band=(P.job.band[0]+P.job.band[1])/2;const reps=6;const sc=all.map(()=>[]);
 for(let rep=0;rep<reps;rep++)all.forEach((v,k)=>{const c=fork(P);sc[k].push(scorer?scorer(c,v,rep):outcomeScore(resolveBeat(c,i,v,'f'+rep),band));});
 const means=sc.map(a=>a.reduce((x,y)=>x+y,0)/reps);let b=0,w=0;means.forEach((m,k)=>{if(m>means[b])b=k;if(m<means[w])w=k;});
 const d=sc[b].map((x,r)=>x-sc[w][r]);const gap=means[b]-means[w];const se=sdv(d)/Math.sqrt(reps);
 return {meaningful:b!==w&&gap>=(minGap||0.9)&&(se===0?gap>0:gap/se>=2),diff:gap,best:all[b],worst:all[w]};
}
function callWindow(P,i){
 const band=(P.job.band[0]+P.job.band[1])/2;P.stat.evaluated++;
 const opts=windowOptions(P,i);
 if(opts.length<1)return 'DEFAULT';
 P.stat.potential++;
 if(P.opts.calls===false){P.stat.suppressedNoDiv++;return 'DEFAULT';}
 const dv=diverge(P,i,opts,null,P.opts.callGap||2.4);
 P.stat.bestWorst.push(dv.diff);
 if(!dv.meaningful){P.stat.suppressedNoDiv++;return 'DEFAULT';}
 P.stat.meaningful++;
 if(P.callsLeft<=0){P.stat.suppressedBudget++;return 'DEFAULT';}
 // SURFACE: the world freezes, faces + verbs
 P.callsLeft--;P.stat.surfaced++;
 const pol=POL(P);const R=RS(P,'callpick|'+i);
 const choice=pol.call(P,i,opts,R);
 const face=v=>({TALK:'DRE',BUST:'TUNDE',SNEAK:'HALF-PINT',PAY:'RICH',PUSH:'GO',FOLD:'FOLD',SAVE:'GO BACK',PULL_UP:'RICH'})[v]||v;
 const btn=v=>{const a=able(P);const pick=(cl)=>a.find(o=>o.cls===cl);
  const f={TALK:pick('TALKER'),BUST:pick('MUSCLE')||pick('SHOOTER'),SNEAK:pick('GHOST'),SAVE:a.find(o=>o.cls==='DOC')||a[0]}[v];
  const verb={TALK:'TALK HIM DOWN',BUST:'BUST THROUGH',SNEAK:'SLIP PAST',PAY:'PAY HIM OFF',PUSH:'PUSH IT',FOLD:'FOLD',SAVE:'GO BACK FOR HIM',PULL_UP:'PULL UP'}[v]||v;
  return f?`${f.name} — ${verb}`:verb;};
 say(P,'CALLS',`  ⏸  THE WORLD FREEZES · ${P.card.text}`);
 say(P,'CALLS','     '+opts.map(btn).join('   |   ')+'   |   let them handle it');
 say(P,'CALLS',`     → you tap: ${choice==='DEFAULT'?'let them handle it':btn(choice)}`);
 // realized difference on the real stream
 const cA=fork(P),cB=fork(P);const sa=resolveBeat(cA,i,choice,'real'),sb=resolveBeat(cB,i,'DEFAULT','real');
 const rd=outcomeScore(sa,band)-outcomeScore(sb,band);P.stat.realized.push(rd);
 P.callLog=(P.callLog||[]);P.callLog.push({i,choice,opts,diff:dv.diff,realized:rd,smart:choice===P.card.smartVerb});
 if(choice!=='DEFAULT'&&!P.sim)P.mem.push({id:'call:'+choice,tag:'CALL',w:3,text:'a call was made'});
 return choice;
}

// -------------------------------------------------------------------------------------------------------------------------- GETAWAY (M5)
const GETAWAY_CARDS=[
 {id:'headlights',text:'headlights come up behind the car',tag:'ok'},
 {id:'siren',text:'a siren starts, follows them for six blocks, and turns out to be nothing',tag:'ok'},
 {id:'tire',text:'a tire squeals at the wrong corner',tag:'ok',hazard:'a tire squealed at the wrong corner'},
 {id:'light',text:'the red light is very red and very long',tag:'ok',hazard:'the red light was very long'}
];
function getawayCard(P,R){const c=P.nodd?{id:'nodd_tail',text:'Officer Nodd falls in behind them and does not blink',tag:'nodd',calls:['PUSH','FOLD'],smartVerb:'PUSH'}:R.pick(GETAWAY_CARDS);return {calls:['PUSH','FOLD'],smartVerb:'PUSH',...c};}
function getawayCore(P,R,opt,mini){
 const ctx={moments:[]};const car=P.car;
 const drv0=P.crew.find(o=>o.id===P.seat.DRIVER);let drv=drv0&&drv0.hp>0&&!drv0.out&&!drv0.fled?drv0:able(P)[0];
 if(!drv)return {kind:'ROBBED',G:0,drv:null,ctx};
 const wrongDriver=drv!==drv0;
 let G=50+(car.grip||0);const F=P.opts.carOff?.6:(C.FIT[drv.cls].DRIVER);
 G+=(F-.6)*30-(wrongDriver?8:0);
 if(!P.opts.flat){G+=drv.nerve>=55?4:drv.nerve>=30?-4:-14;G-=(P.pressure-30)*.25;}
 const crates=P.pot.crates.length;G-=crates*1.2+(potValue(P)>60?4:0)+P.step*3+dropping(P).length*3;
 let crash=.05+(car.crash||0),fail=[];
 if(opt==='PUSH'){G+=10;crash+=.08;}if(opt==='FOLD'){G+=8;crash-=.05;}
 let stall=false;
 if(!P.opts.carOff&&car.stall&&R.chance(car.stall)){stall=true;G-=18;}
 if(P.opts.traits!==false){
  if(has(P,drv,'BIG_POTENTIAL')&&R.chance(.15)){crash+=.14;moment(P,ctx,'trait',`${drv.short} decided to show off at the wheel — BIG POTENTIAL`,'trait:mazi:showoff','FUNNY',6,cz(CAUSE.TRAIT,'BIG POTENTIAL'));fail.push('trait');}
  else if(drv.cls==='WHEELS'&&R.chance(.12)){G+=10;moment(P,ctx,'class',`${drv.short} took the corner on two wheels`,'class:wheels:corner','CLUTCH',5);}
  if(firing(P,'hands_free')&&drv.id==='dre'&&fire(P,'hands_free',ctx)&&R.chance(.35)){G-=15;moment(P,ctx,'combo',"Dre took a call while driving — HANDS FREE",'combo:handsfree','FUNNY',7,cz(CAUSE.TRAIT,'PHONE OUT'));fail.push('trait');}
  if(has(P,drv,'SKITTISH')&&drv.nerve<55&&R.chance(.2)){G-=8;}
 }
 const nodd=!!P.nodd||(P.job.heat>=6&&R.chance(.25));
 if(nodd){G-=8;P.tags.push('NODD');}
 const panic=!P.opts.flat&&drv.nerve<30&&R.chance(.32);
 crash=clamp(crash+(55-G)/220,.02,.5);
 let kind='CLEAN';
 if(panic){kind='SPLIT';fail.push('nerve');}
 else if(R.chance(crash)){kind='CRASH';}
 else if(G<(mini?20:28)&&R.chance(.6)){kind='ROBBED';}
 else if(G<46||stall)kind='MESSY';
 if(stall&&kind==='CLEAN')kind='MESSY';
 if(stall&&P.pressure>=67&&kind==='MESSY'&&R.chance(.35)&&!P.opts.flat)kind='ROBBED';
 const cause=kind==='SPLIT'?cz(CAUSE.EARLIER,`${drv.short} lost his nerve`):stall?cz(CAUSE.CAR,`${P.carId}: ${car.word}`):fail.includes('trait')?cz(CAUSE.TRAIT,''):kind==='CRASH'&&(car.crash||0)>.1?cz(CAUSE.CAR,`${P.carId}: ${car.word}`):P.pressure>=67&&kind!=='CLEAN'?cz(CAUSE.EARLIER,'the whole block was after them'):(nodd&&kind!=='CLEAN')?cz(CAUSE.EARLIER,'Officer Nodd'):wrongDriver&&kind!=='CLEAN'?cz(CAUSE.SEAT,'the wrong hands were on the wheel'):(opt==='PUSH'&&kind!=='CLEAN')?cz(CAUSE.CHOICE,'they floored it'):kind!=='CLEAN'&&(crates>=5||P.step>0)?cz(CAUSE.CHOICE,'the trunk was full'):kind!=='CLEAN'&&dropping(P).length?cz(CAUSE.EARLIER,'they were carrying a body'):kind!=='CLEAN'&&(car.grip||0)<0&&!P.opts.carOff?cz(CAUSE.CAR,`${P.carId}: ${car.word}`):kind!=='CLEAN'&&F<.5&&!P.opts.carOff?cz(CAUSE.SEAT,`${drv.short} is not a driver`):kind!=='CLEAN'?cz(CAUSE.LUCK,''):null;
 return {kind,G,drv,stall,nodd,cause,ctx,panic,fail};
}
function aftermath(P){
 const R=RS(P,'aftermath');const pend=P.carry.length;
 const kind=(P.pressure>=67||pend>0||dropping(P).length>=2)?'BREACHED':'HELD';
 P.gaway={kind,G:0,drv:null};P.stashRaided=kind==='BREACHED';
 if(kind==='BREACHED'){swing(P,'aftermath:breached',pend?cz(CAUSE.EARLIER,'they could not clear the halls'):cz(CAUSE.EARLIER,'the whole house was closing in'));P.losses.push({who:'stash',kind:'STASH RAIDED',cause:cz(CAUSE.EARLIER,'they were pushed off the door'),tag:'DRAMATIC',beat:4,text:'STASH RAIDED — half the SUPPLY and a fifth of the cash gone'});P.mem.push({id:'defense:breached',tag:'LOSS',w:7,text:'STASH RAIDED'});}
 say(P,'GETAWAY',kind==='HELD'?'  No getaway. The door held. The headlights back out of the drive one by one.':'  No getaway — it is their house. The door gives; the halls fall; they get the stash and leave.');
 if(kind==='HELD')for(const o of able(P))nerveAdd(P,{moments:[]},o,6,null);
}
function getaway(P){
 if(P.job.defense){aftermath(P);return;}
 const R=RS(P,'getaway|'+P.step);
 const gc=getawayCard(P,R);P.card=gc;
 let opt='DEFAULT';
 if(!P.sim){
  P.stat.evaluated++;const band=(P.job.band[0]+P.job.band[1])/2;
  if(P.opts.calls!==false){P.stat.potential++;
   const opts=['PUSH','FOLD'];const K={CLEAN:4,MESSY:3,CRASH:0,SPLIT:-1,ROBBED:-4};
   const dv=diverge(P,4,opts,(c,v,rep)=>K[getawayCore(c,stream(P.seed,'gaf|'+rep),v).kind],3.0);const hits=dv.meaningful?2:0;const diffs=[dv.diff];
   P.stat.bestWorst.push(dv.diff);
   if(hits>=2){P.stat.meaningful++;
    if(P.callsLeft>0){P.callsLeft--;P.stat.surfaced++;opt=POL(P).call(P,4,opts,RS(P,'callpick|4'));
     say(P,'CALLS',`  ⏸  THE WORLD FREEZES · ${gc.text}`);say(P,'CALLS',`     FLOOR IT   |   DUMP THE LOAD   |   let them handle it   → you tap: ${opt==='PUSH'?'FLOOR IT':opt==='FOLD'?'DUMP THE LOAD':'let them handle it'}`);
     const a=getawayCore(fork(P),stream(P.seed,'gaf|real'),opt),b=getawayCore(fork(P),stream(P.seed,'gaf|real'),'DEFAULT');const sc=k=>({CLEAN:4,MESSY:3,CRASH:0,SPLIT:-1,ROBBED:-4}[k]);P.stat.realized.push(sc(a.kind)-sc(b.kind));
     P.callLog=(P.callLog||[]);P.callLog.push({i:4,choice:opt,opts,diff:diffs[0],realized:sc(a.kind)-sc(b.kind),smart:opt==='PUSH'});
    }else P.stat.suppressedBudget++;
   }else P.stat.suppressedNoDiv++;
  }else P.stat.suppressedNoDiv++;
 }
 const g=getawayCore(P,R,opt);
 const ctx=g.ctx;
 // apply
 if(opt==='FOLD'&&P.pot.crates.length){const lost=P.pot.crates.splice(Math.max(0,P.pot.crates.length-1),1)[0];if(lost&&!P.sim)say(P,'GETAWAY',`  (they dumped a crate to lighten the load)`);P.pot.dumped=true;}
 P.gaway=g;const kind=g.kind;
 const drv=g.drv;
 if(kind==='ROBBED'||!drv){finishRobbed(P,ctx,g);return;}
 say(P,'GETAWAY',`${gc.text}. ${drv.short} at the wheel of the ${P.carId}${g.stall?' — it died at the light: '+C.CARS[P.carId].word:''}.`);
 if(kind==='CLEAN'){for(const o of able(P))nerveAdd(P,ctx,o,6,null);say(P,'GETAWAY','  Clean. Nobody breathes until the freeway.');}
 else if(kind==='MESSY'){
  const v=able(P)[Math.floor(R.next()*able(P).length)];if(v&&v.hp>1){v.hp-=1;}P.heatBonus=(P.heatBonus||0)+4;
  say(P,'GETAWAY',`  It gets messy — ${g.stall?'the '+P.carId+': '+C.CARS[P.carId].word:g.nodd?'Officer Nodd on their bumper':'they take the long way'}. They make it.`);
  if(g.stall)moment(P,ctx,'car',`the ${P.carId} died at the light — ${C.CARS[P.carId].word}`,'car:stall','FUNNY',6,g.cause);
  if(g.nodd&&P.nodd)moment(P,ctx,'nodd','Officer Nodd chased them for eleven blocks, then got hungry','nodd:chase','FUNNY',5);
  swing(P,'getaway:messy',g.cause||cz(CAUSE.LUCK,''));
 }
 else if(kind==='CRASH'){
  const out=P.carId==='URUS'?1:2;P.crashOut=out;P.crashCost=4;P.heatBonus=(P.heatBonus||0)+6;
  for(const o of able(P))if(R.chance(.4)&&o.hp>1){o.hp=Math.max(1,o.hp-3);o.crashHurt=true;}
  swing(P,'getaway:crash',g.cause||cz(CAUSE.LUCK,''));
  moment(P,ctx,'car',`the ${P.carId} hit something in the dark — ${C.CARS[P.carId].word}`,'car:crash:'+P.carId,'FUNNY',8,g.cause||cz(CAUSE.LUCK,''));
  say(P,'GETAWAY',`  CRASH. The ${P.carId} is out ${out} night${out>1?'s':''} (or $4K to fix). The trunk stayed shut.`);
  P.losses.push({who:'car',kind:'CRASH',cause:g.cause||cz(CAUSE.LUCK,''),tag:causeTag(P,g.cause,'CRASH'),beat:4,text:`the ${P.carId} is out ${out} nights`});
  if(P.pressure>=67&&R.chance(.25)&&!P.opts.flat){finishRobbed(P,ctx,{...g,kind:'ROBBED',cause:cz(CAUSE.EARLIER,'the block was after them')});return;}
 }
 else if(kind==='SPLIT'){
  P.split=true;const rear=P.crew.filter(o=>o!==drv&&!o.out&&!o.fled&&seatOf(P,o)!=='SHOTGUN');const k=Math.max(1,Math.ceil((P.crew.length-1)/2));
  const left=[...rear].sort((a,b)=>(a.hp<=0?-1:0)-(b.hp<=0?-1:0)).slice(0,k);
  for(const o of P.crew)if(o.hp<=0&&!o.out&&!o.rescued&&!left.includes(o))left.push(o);
  P.heatBonus=(P.heatBonus||0)+3;
  say(P,'GETAWAY',`  ${drv.short} panics and floors it. ${left.map(o=>o.short).join(' and ')} ${left.length>1?'are':'is'} still on the curb.`);
  for(const o of left){o.left=true;const cap=R.chance(.35+(P.pressure/250))||o.hp<=0;
   if(cap){o.leftFate='CAPTURED';}else{o.leftFate='BUS';moment(P,ctx,'split',`${o.short} took the bus`,'split:bus','FUNNY',8,g.cause);}
   if(P.opts.beef==='split'||P.opts.beef==='wide'){P.beef=P.beef||[];P.beef.push({from:o.id,to:drv.id,src:'SPLIT'});}}
  swing(P,'getaway:split',g.cause);
  moment(P,ctx,'split',`${drv.short} panicked and drove off with half the crew`,'split:panic','FUNNY',9,g.cause);
  P.losses.push({who:'split',kind:'SPLIT',cause:g.cause,tag:'FUNNY',beat:4,text:`${drv.short} left ${left.map(o=>o.short).join(', ')} behind`});
  for(const o of able(P))nerveAdd(P,ctx,o,-6,g.cause);
 }
 if(P.opts.traits!==false&&kind!=='ROBBED'&&dropping(P).length&&able(P).some(o=>has(P,o,'LOYAL')&&o!==drv)&&R.chance(.3)){const lo=able(P).find(o=>has(P,o,'LOYAL')&&o!==drv);lo.hp=0;lo.left=true;lo.dropCause=cz(CAUSE.TRAIT,'LOYAL');lo.dropBeat=4;moment(P,ctx,'trait',`${lo.short} would not leave anybody behind and jumped out to go back — LOYAL`,'trait:loyal:fail','STUPID',6,cz(CAUSE.TRAIT,'LOYAL'));swing(P,'loyal',cz(CAUSE.TRAIT,'LOYAL'));}
 ctx.moments.forEach(m=>{if(!P.sim)P.moments.push(m);});
 if(!P.sim)for(const m of ctx.moments.slice(0,3))say(P,'GETAWAY',`    ${m.tag==='CLUTCH'?'★':m.tag==='FUNNY'?'☺':'▲'} ${m.text}`);
}
function finishRobbed(P,ctx,g){
 P.robbed=true;P.pot.lost=true;const share=Math.round(1+P.seed%3*.5);P.pocketLoss=share;P.heatBonus=(P.heatBonus||0)+5;
 const cause=g.cause||cz(CAUSE.LUCK,'');
 swing(P,'getaway:robbed',cause);
 say(P,'GETAWAY',`  JUGGED. They got hit on the way back — the unbanked pot is gone, plus $${share}K from Rich's pocket. (Banked money is safe.)`);
 P.losses.push({who:'pot',kind:'ROBBED',cause,tag:causeTag(P,cause,'ROBBED')==='PLAIN'?'DRAMATIC':causeTag(P,cause,'ROBBED'),beat:4,text:'the pot was jugged on the way back'});
 moment(P,ctx,'robbed','they were jugged on the way back — everything they were holding is gone','robbed','SCARY',8,cause);
 ctx.moments.forEach(m=>{if(!P.sim)P.moments.push(m);});
}

// -------------------------------------------------------------------------------------------------------------------------- finalize crew statuses (loss rules, mercy)
function finalizeCrew(P,wash){
 const away=[];const pk=(o,kind,cause,text)=>{o.finalStatus=kind;P.losses.push({who:o.id,kind,cause:cause||cz(CAUSE.LUCK,''),tag:causeTag(P,cause,kind),beat:o.dropBeat??4,text});};
 for(const o of P.crew){
  if(o.out==='DEAD'){o.finalStatus='DEAD';continue;}
  if(o.fled){o.finalStatus='READY';o.nerve=Math.max(0,o.nerve-8);continue;}
  if(o.hp<=0&&!o.rescued){
   const leftBehind=o.left||wash;const cause=o.dropCause||cz(CAUSE.LUCK,'');
   if(leftBehind){
    if(o.named)pk(o,'CAPTURED',cause,`${o.short} was left behind and taken`);
    else if(RSf(P,o.id).chance(.5))pk(o,'CAPTURED',cause,`${o.short} was left behind and taken`);
    else pk(o,'DEAD',cause,`${o.short} did not get up`);
   }else{
    if(o.named){
     if(P.job.bigPlay&&P.acceptedNamed.includes(o.id)&&RSf(P,o.id).chance(.55)){pk(o,'GONE',cause,`${o.short} is gone. The truth waits for after the fame.`);}
     else pk(o,'SHOT',cause,`${o.short} took one and was carried out`);
    }else{
     if(RSf(P,o.id).chance(.35))pk(o,'DEAD',cause,`${o.short} did not make it home`);else{o.finalStatus='WOUNDED';P.losses.push({who:o.id,kind:'WOUNDED',cause,tag:causeTag(P,cause,'WOUNDED'),beat:o.dropBeat??4,text:`${o.short} was carried out hurt`});}
    }
   }
  }else if(o.hp<o.maxhp*.5||o.crashHurt&&o.hp<o.maxhp){o.finalStatus='WOUNDED';const cause=o.dropCause||o.lastHitCause||(o.crashHurt?cz(CAUSE.CAR,`the ${P.carId} crashed`):cz(CAUSE.LUCK,''));P.losses.push({who:o.id,kind:'WOUNDED',cause,tag:causeTag(P,cause,'WOUNDED'),beat:4,text:`${o.short} limps away`});}
  else o.finalStatus='READY';
  if(o.wasSaved&&o.finalStatus==='READY'&&o.hp<=1)o.finalStatus='WOUNDED';
 }
 // mercy rule: a routine PLAY puts at most 2 Ogas away (SHOT / CAPTURED / bled-out DEAD); extras downgrade to WOUNDED
 if(!P.job.bigPlay){
  const cand=P.crew.filter(o=>['SHOT','CAPTURED','DEAD'].includes(o.finalStatus)&&o.out!=='DEAD');
  if(cand.length>2){for(const o of cand.slice(2)){P.losses=P.losses.filter(l=>!(l.who===o.id&&l.kind===o.finalStatus));o.finalStatus='WOUNDED';P.mercy=(P.mercy||0)+1;P.losses.push({who:o.id,kind:'WOUNDED',cause:cz(CAUSE.EARLIER,'the mercy rule'),tag:'PLAIN',beat:4,text:`${o.short} was hurt (mercy rule)`});}}
 }
}

const REACT={dre:{LEGENDARY:'no. NO. say it again',RARE:'ok ok ok. that is real',COMMON:'we good. we good.'},tunde:{LEGENDARY:'[stops chewing]',RARE:'[chewing, slower]',COMMON:'[chewing]'},half_pint:{LEGENDARY:'that is mine, right? that is mine',RARE:'...that looks heavy. i can carry it',COMMON:'can we go now'},sunday_best:{LEGENDARY:'The Lord provides. Openly.',RARE:'Thank you. Sincerely.',COMMON:'Adequate.'},young_mazi:{LEGENDARY:'told you. TOLD you.',RARE:'see? it was easy',COMMON:'literally nothing to it'},auntie_grit:{LEGENDARY:'Sit down. Everybody sit down.',RARE:'Hm.',COMMON:'Put it in the car.'}};
const trunkReact=(who,rar)=>{const r=REACT[who.id];return `${who.short}: ${r?r[rar]:({LEGENDARY:'...is that real',RARE:'that looks expensive',COMMON:'okay. okay.'})[rar]}`;};
// -------------------------------------------------------------------------------------------------------------------------- THE TRUNK (M6)
const RARITY=[['COMMON',.7],['RARE',.24],['LEGENDARY',.06]];
function rollRarity(R,shift=0,floor='COMMON'){const r=R.next();let x=r<.025+shift*.3?'LEGENDARY':r<.28+shift?'RARE':'COMMON';const rank={COMMON:0,RARE:1,LEGENDARY:2};if(rank[x]<rank[floor])x=floor;return x;}
function mkCrate(P,R,cat,rar,opts={}){
 const band=P.job.band;const mean=(band[0]+band[1])/2;let c={cat,rar,val:0,name:'',lore:''};
 if(cat==='CASH'){const f={COMMON:.12,RARE:.28,LEGENDARY:.7}[rar];c.val=Math.round(mean*f*(P.step?1.6:1));c.cash=c.val;c.name=`a wad of cash ($${c.val}K)`;c.lore='';}
 else if(cat==='BLOOD_X'){const n={COMMON:1,RARE:3,LEGENDARY:5}[rar];c.val=n*3.5;c.name=`${n} case${n>1?'s':''} of Blood X`;c.cases=n;c.lore='It only ever feeds the THIRST.';}
 else if(cat==='GUN'){const id=R.pick(C.GUN_LOOT[rar]||C.GUN_LOOT.COMMON);c.gun=id;c.val=Math.max(C.GUN_PRICE[id]*.35,2);c.name=C.GUNS[id].name;c.lore=C.LORE_GUN[id]||C.GUNS[id].flavor;}
 else if(cat==='MOD'){const m=R.pick(rar==='COMMON'?C.COMMON_MODS:C.RARE_MODS);c.val=VALUE[rar];c.name=m[0];c.lore=m[1];}
 else if(cat==='RECRUIT'){c.val=4;c.name='a WILLING recruit';c.lore='They mean it.';c.recruit=true;}
 else if(cat==='STORY'){c.val=2;c.name='a story seed';c.lore='Somebody will tell this one.';}
 else if(cat==='DISTRICT'){c.val=6;c.name='a corner of the block changes hands';c.lore='Rival pressure −5, demand up.';}
 else if(cat==='WEIRD'){
  const pool=rar==='LEGENDARY'?C.LEGENDARY:C.WEIRD;let k=R.int(0,pool.length-1),tries=0;while(P.weirdSeen.includes(pool[k][0])&&tries++<50)k=(k+1)%pool.length;
  c.name=pool[k][0];c.lore=pool[k][1];c.val=VALUE[rar];P.weirdSeen.push(c.name);if(P.weirdSeen.length>30)P.weirdSeen.shift();}
 return c;
}
function catWeights(P){const t={...P.job.tilt};
 if(P.approach==='LOUD'){t.CASH*=1.5;t.GUN*=1.5;}if(P.approach==='QUIET'||P.approach==='OCTOPUS'){t.WEIRD*=1.5;t.MOD*=1.5;t.RECRUIT*=1.4;}
 return t;
}
function trunk(P,stepIdx=0){
 const R=RS(P,'trunk|'+stepIdx);const job=P.job;const band=job.band;
 const floorTier=job.bigPlay?'RARE':job.ugly==='NASTY'?'RARE':job.ugly==='TOUGH'&&RS(P,'kfloor').chance(.35)?'RARE':'COMMON';
 if(stepIdx===0){
  const q=Math.min(1,(P.prizeQ??.6)+(P.haggle||0));const g=P.gaway?.kind;const gf=g==='CLEAN'?1:g==='MESSY'?.96:g==='CRASH'?.9:.92;
  P.pot.cash=Math.round((band[0]+(band[1]-band[0])*q*gf)*10)/10;P.pot.cash=Math.max(band[0],P.pot.cash);
  P.pot.crates=[];
  const n=clamp(3+(g==='CLEAN'?1:0)+(job.ugly==='NASTY'?1:0)+(job.bigPlay?2:0)+(P.extraCrate||0)-(P.lightLoad?1:0),3,5);
  const tilt=catWeights(P);const cats=[...P.promise];
  while(cats.length<n)cats.push(weighted(R,tilt));
  cats.length=Math.max(n,2);
  const shift=(P.approach!=='LOUD'?.03:0)+(g==='CLEAN'?.03:0)+((P.dry||0)>=5?.4:0);
  const crates=cats.map((c,k)=>mkCrate(P,R,c,rollRarity(R,shift,'COMMON')));
  // kicker: last and best, floored
  const kick=crates[crates.length-1];const rank={COMMON:0,RARE:1,LEGENDARY:2};
  let want=rollRarity(R,shift+.05,floorTier);if(job.bigPlay&&R.chance(.45))want='LEGENDARY';
  const okK=['GUN','MOD','WEIRD','BLOOD_X'];const kc=okK.includes(kick.cat)?kick.cat:weighted(R,Object.fromEntries(Object.entries(tilt).filter(([k])=>okK.includes(k))));
  if(rank[kick.rar]<rank[want]||!okK.includes(kick.cat)){const k2=mkCrate(P,R,kc,rank[kick.rar]<rank[want]?want:kick.rar);crates[crates.length-1]=k2;}
  crates.sort((a,b)=>rank[a.rar]-rank[b.rar]||a.val-b.val);
  P.pot.crates=crates;
  P.kicker=crates[crates.length-1];
  // truth rule: promised silhouettes must be in the trunk (folded PLAYs excluded)
  P.truth={shownIn:crates.some(c=>c.cat===P.promise[0]),hiddenIn:crates.some(c=>c.cat===P.promise[1])};
  if(P.folded){P.pot.cash=Math.round(band[0]*.4*10)/10;P.pot.crates=crates.filter(c=>c.rar==='COMMON').slice(0,1);P.kicker=P.pot.crates[0]||null;}
 }
 if(P.sim)return;
 say(P,'TRUNK',`The trunk opens. Bands snap like COUNT THE MONEY: $${P.pot.cash}K.`);
 for(const c of P.pot.crates){
  const tag=c.rar==='COMMON'?'· flip':c.rar==='RARE'?'✦ the lid glows teal — a gasp':'★ GOLD LID — the whole car goes quiet';
  say(P,'TRUNK',`  ${tag}   ${c.name}${c.lore?'  — “'+c.lore+'”':''}`);
 }
 if(P.kicker){const rx=P.kicker.rar==='LEGENDARY'?C.GREED_LINES?null:null:null;
  const who=P.crew.find(o=>o.hp>0&&!o.out)||P.crew[0];
  const line=trunkReact(who,P.kicker.rar);
  say(P,'TRUNK','  KICKER → '+P.kicker.name+'.  '+line);
  if(P.kicker.rar==='LEGENDARY'||P.kicker.cat==='WEIRD')P.mem.push({id:'loot:'+(P.kicker.rar==='LEGENDARY'?'legendary':'weird'),tag:'LOOT',w:P.kicker.rar==='LEGENDARY'?8:5,text:P.kicker.name});
 }
}

// -------------------------------------------------------------------------------------------------------------------------- HIT ONE MORE
const BLOCK_CLOSES=[.06,.22,.38];const STEP_CASH=[.9,1.4,2.0];const STEP_CRATES=[2,2,3];
function tease(P,k){const R=RS(P,'tease|'+k);const rar=R.next()<.12+.06*k?'LEGENDARY':R.next()<.4+.1*k?'RARE':'COMMON';const cat=weighted(R,P.job.tilt);return {rar,cat,cash:Math.round((P.job.band[0]+P.job.band[1])/2*STEP_CASH[k]*10)/10};}
function tooHot(P){return P.crew.some(o=>o.left)||able(P).length<=Math.max(1,Math.floor(P.crew.length/2)-0)&&false||(!P.opts.flat&&able(P).filter(o=>o.nerve<30).length>=Math.ceil(able(P).length/2)&&able(P).length>0)||P.crew.filter(o=>o.hp<=0&&!o.rescued).length>=2;}
function climbStep(P,k,rk){
 const R=stream(P.seed,'climb|'+k+'|'+rk);const T=tease(P,k);
 P.step=k+1;P.tired=k+1;pressAdd(P,{moments:[]},15,null);
 const ctx0={moments:[]};
 if(!P.opts.flat)for(const o of able(P)){nerveAdd(P,ctx0,o,-5,cz(CAUSE.GREED,'they went back in'));if(has(P,o,'BIG_POTENTIAL'))nerveAdd(P,ctx0,o,-6,cz(CAUSE.TRAIT,'BIG POTENTIAL'));}
 let ok=true,last=null,why=null;P.carry=[];
 for(const i of [2,3]){
  P.card=drawCard(P,i);P.card.weight=4;const s=resolveBeat(P,i,'DEFAULT',rk+'|s'+k);last=s;
  if(s.wipe||!able(P).length){ok=false;why='wipe';break;}
 }
 if(ok&&(last.tier<1||able(P).length<Math.ceil(P.crew.length/2))){ok=false;why='fight';}
 // THE BLOCK CLOSES: each extra step, the block's answer arrives faster than the reward grows (escalating, F13 tunes the curve)
 if(ok&&R.chance(BLOCK_CLOSES[k]||.4)){ok=false;why='block';P.blockClosed=true;}
 let g=null;
 if(ok){g=getawayCore(P,stream(P.seed,'cga|'+k+'|'+rk),'DEFAULT',true);if(g.kind==='ROBBED'){ok=false;why='getaway';}if(g.kind==='SPLIT'){P.split=true;const d=g.drv;const rear=P.crew.filter(o=>o!==d&&!o.out&&!o.fled&&seatOf(P,o)!=='SHOTGUN');const l=rear.slice(0,1);for(const o of l){o.left=true;o.leftFate=R.chance(.5)?'CAPTURED':'BUS';}}
  if(g.kind==='CRASH'){P.crashOut=Math.max(P.crashOut||0,2);}}
 return {ok,T,g,last,why};
}
function stepReward(P,k,Tk){
 P.pot.cash=Math.round((P.pot.cash+Tk.cash)*10)/10;
 const R2=RS(P,'stepcr|'+k);
 for(let c=0;c<STEP_CRATES[k]-1;c++)P.pot.crates.push(mkCrate(P,R2,weighted(R2,catWeights(P)),rollRarity(R2,.08*(k+1),'COMMON')));
 const jack=k>=1&&R2.chance(.18);
 const okK2=['GUN','MOD','WEIRD','BLOOD_X'];const kick=mkCrate(P,R2,jack?'WEIRD':okK2.includes(Tk.cat)?Tk.cat:weighted(R2,Object.fromEntries(Object.entries(P.job.tilt).filter(([k])=>okK2.includes(k)))),jack?'LEGENDARY':Tk.rar);P.pot.crates.push(kick);
 return {kick,jack};
}
function crewLine(P){const a=able(P);const o=a[Math.abs(P.seed)%a.length]||P.crew[0];return o;}
function climbDecide(P){
 const R=RS(P,'climbpick|'+P.step);const read=crewRead(P);const k=P.step;const T=tease(P,k);
 return {read,tease:T.rar,T};
}
function hitOneMore(P){
 P.climbs=[];P.tookWin=true;
 if(P.robbed||P.folded||P.wash||P.step>=3)return;
 if(tooHot(P)){say(P,'HIT ONE MORE',`TOO HOT — GET OUT. (no HIT ONE MORE tonight)`);P.hotStop=true;return;}
 // shadow climb for EV (never changes the real state)
 if(!P.sim){P.shadow=[];for(let rep=0;rep<4;rep++){const c=fork(P);c.sim=true;let before=potValue(c);
   for(let k=0;k<3;k++){if(tooHot(c)){break;}const read=crewRead(c);const r=climbStep(c,k,'sh'+rep);
     if(!r.ok){P.shadow.push({k:k+1,before,after:0,ok:false,read,rep,why:r.why});break;}
     stepReward(c,k,r.T);const after=potValue(c);P.shadow.push({k:k+1,before,after,ok:true,read,rep});before=after;}}}
 const pol=POL(P);
 while(P.step<3){
  const info=climbDecide(P);const {read,T}=info;const R=RS(P,'climbrand|'+P.step);
  const stake=`RISKING: $${Math.round(P.pot.cash)}K + ${P.pot.crates.length} crate${P.pot.crates.length===1?'':'s'}`;
  const lineO=crewLine(P);const gl=C.GREED_LINES[lineO.id]||`${lineO.short}: one more?`;
  say(P,'HIT ONE MORE',`${stake}   ·   crew: ${read}   ·   ${T.rar==='LEGENDARY'?'a GOLD crate is lit in the back room':T.rar==='RARE'?'a teal-lit crate':'nothing lit'}`);
  say(P,'HIT ONE MORE',`  ${gl}`);
  const go=pol.climb(P,{step:P.step,read,tease:T.rar,stake},R);
  P.climbs.push({step:P.step+1,offered:true,go,read,tease:T.rar,pot:potValue(P)});
  if(!go){say(P,'HIT ONE MORE','  → TAKE THE WIN.');break;}
  say(P,'HIT ONE MORE','  → HIT ONE MORE.');
  const k=P.step;const before=potValue(P);const snapshotTurn=P.moments.slice(-1)[0];
  const r=climbStep(P,k,'real');
  P.climbs[P.climbs.length-1].ok=r.ok;
  if(!r.ok){
   // GREED: pot of this PLAY lost. J.5: crew is jugged on the way back
   P.greedFail=true;P.pot.lost=true;P.robbed=true;P.pocketLoss=1+P.seed%2;
   const cause=cz(CAUSE.GREED,'they went back in');swing(P,'climb:fail',cause);
   const dn=dropping(P);
   P.losses.push({who:'pot',kind:'ROBBED',cause,tag:'DRAMATIC',beat:5+k,text:`HIT ONE MORE #${k+1} turned: ${before?('$'+Math.round(potValue(P)*0+before)+'K'):''} jugged`,greed:true});
   P.turnMoment=`It turned at HIT ONE MORE #${k+1}: ${r.last?'the '+(dn.length?dn[0].short+' went down and':'crew was ragged and')+' the room closed':'the room closed'}. The ${Math.round(before)}K-equivalent pot went with it.`;
   P.mem.push({id:'greed:fail:'+(k+1),tag:'GREED',w:9,text:'HIT ONE MORE went wrong'});
   say(P,'HIT ONE MORE',`  ✖ It goes wrong. ${dn.length?dn[0].short+' goes down. ':''}They are jugged on the way back — the whole PLAY's pot is gone. (Banked money is safe.)  [GREED]`);
   break;
  }
  // reward
  const Tk=r.T;const {kick,jack}=stepReward(P,k,Tk);
  P.teaseAudit=(P.teaseAudit||[]);P.teaseAudit.push({tease:Tk.rar,actual:jack?'LEGENDARY':kick.rar,jack});
  if(kick.rar==='LEGENDARY'||jack){P.mem.push({id:'loot:jackpot',tag:'LOOT',w:9,text:kick.name});}
  say(P,'HIT ONE MORE',`  ✔ back in the car. +$${Tk.cash}K +${STEP_CRATES[k]} crates — KICKER: ${kick.name}${jack?'  [JACKPOT]':''}`);
  P.step=k+1;
  if(tooHot(P)){
   say(P,'HIT ONE MORE','  TOO HOT — GET OUT.');
   const rr=RS(P,'retreat|'+k);
   if(rr.chance(.25+P.pressure/250)&&!P.opts.flat){P.greedFail=true;P.pot.lost=true;P.robbed=true;P.pocketLoss=1;const cause=cz(CAUSE.GREED,'they stayed one step too long');swing(P,'climb:retreat',cause);
    P.losses.push({who:'pot',kind:'ROBBED',cause,tag:'DRAMATIC',beat:5+k,text:'jugged on the retreat after HIT ONE MORE',greed:true});
    P.mem.push({id:'greed:retreat',tag:'GREED',w:8,text:'auto-cash retreat jugged'});
    P.turnMoment=`It turned at the last retreat after HIT ONE MORE #${k+1}: too hot, and the way back was watched.`;
    say(P,'HIT ONE MORE','  ✖ The way back was watched. Jugged. [GREED]');}
   break;
  }
 }
 if(P.climbs.some(c=>c.go&&c.ok))P.mem.push({id:'climb:win',tag:'GREED',w:5,text:'HIT ONE MORE paid'});
}

// -------------------------------------------------------------------------------------------------------------------------- TURNING (willing, never named humans, never Rich)
function turning(P){
 const cr=P.pot.crates.find(c=>c.recruit);if(!cr||P.pot.lost)return;
 const turner=P.crew.filter(o=>o.vampire&&o.hp>0&&!o.out&&!o.fled).sort((a,b)=>(b.named?1:0)-(a.named?1:0))[0];
 P.turn={offered:false,candidate:'a willing cousin',seatFree:P.roster.filter(o=>o.finalStatus!=='DEAD'&&o.finalStatus!=='GONE').length<9+(P.districts||0)};
 if(!turner){P.turn.reason='no vampire Oga aboard';return;}
 P.turn.offered=true;P.turn.turner=turner.id;
 const R=RS(P,'turn');const go=POL(P).turn(P,cr,R);
 if(!go){P.turn.result='LET GO';say(P,'TRUNK',`  ${turner.short} could turn the willing recruit. TURN or LET GO? → LET GO.`);return;}
 const r=R.next();const res=r<.6?'TAKES':r<.85?'TAKES WEIRD':'BAILS';P.turn.result=res;
 say(P,'TRUNK',`  ${turner.short} could turn the willing recruit. TURN or LET GO? → TURN. ${res==='TAKES'?'It takes: a new Oga, "TURNED BY '+turner.short+'".':res==='TAKES WEIRD'?'It takes — and the new Oga is a little wrong in a funny way.':'They bail. No harm done.'}`);
 if(res!=='BAILS')P.mem.push({id:'turn:'+res.toLowerCase().replace(' ','_'),tag:'TURN',w:8,text:'TURNED BY '+turner.short});
}

// -------------------------------------------------------------------------------------------------------------------------- REPORT + MORNING AFTER
const NICK={phone:'DO NOT DISTURB',eat:'MID-BITE',dressed:'PRE-WORN',showboat:'WATCH THIS',mac:'FRIENDLY FIRE',bus:'BUS PASS',sticky:'FIVE-FINGER',seen:'THE LECTURER',skittish:'RUNNER',shot:'LIMPER',cap:'RETURN TO SENDER',greed:'ONE MORE',save:'GUARDIAN',church:'SLIPPERY',impatient:'EARLY',hothead:'DOOR EATER',sit:'SIT DOWN'};
function report(P){
 const R=RS(P,'report');
 const g=P.gaway?.kind;
 let klass;
 if(P.wash)klass='WASH';else if(P.greedFail)klass='GREED';else if(P.job.defense&&g==='BREACHED')klass='COSTLY';else if(P.robbed)klass='ROBBED';else if(P.folded)klass='FOLDED';
 else if(g==='CLEAN'&&P.crew.every(o=>o.finalStatus==='READY'))klass='CLEAN';
 else if(P.losses.some(l=>['SHOT','CAPTURED','DEAD','GONE'].includes(l.kind))||g==='SPLIT'||g==='CRASH')klass='COSTLY';
 else klass='MESSY';
 P.klass=klass;P.win=!(klass==='WASH'||klass==='ROBBED'||klass==='GREED');
 const final=P.win?potValue(P):0;P.final=Math.round(final*10)/10;
 // memorable derivations
 if(P.win&&P.stress&&klass!=='CLEAN')P.mem.push({id:'reversal:won-from-all-hands',tag:'REV',w:8,text:'won from ALL HANDS'});
 if(!P.win&&!P.greedFail&&P.beatLog.length>=2&&P.beatLog[0].tier===2&&P.beatLog[1].tier===2)P.mem.push({id:'reversal:lost-clean',tag:'REV',w:7,text:'lost from a clean start'});
 if(P.crew.some(o=>o.wasSaved))P.mem.push({id:'neardeath:saved',tag:'CLUTCH',w:8,text:'somebody was pulled back'});
 for(const l of P.losses){if(l.kind==='SHOT')P.mem.push({id:'loss:shot',tag:'LOSS',w:6,text:l.text});if(l.kind==='CAPTURED')P.mem.push({id:'loss:captured',tag:'LOSS',w:6,text:l.text});if(l.kind==='GONE')P.mem.push({id:'loss:gone',tag:'LOSS',w:9,text:l.text});}
 if(g==='CRASH'&&!P.mem.some(m=>m.id.startsWith('car:crash')))P.mem.push({id:'car:crash',tag:'CAR',w:8,text:'crash'});
 if(P.robbed&&!P.greedFail)P.mem.push({id:P.wash?'wash':'robbed',tag:'LOSS',w:P.wash?7:8,text:P.wash?'everyone went down':'jugged'});
 if(P.callLog?.some(c=>c.choice!=='DEFAULT'&&c.realized>=2))P.mem.push({id:'call:turned-it',tag:'CLUTCH',w:7,text:'a call turned a beat'});
 if(P.callLog?.some(c=>c.choice!=='DEFAULT'&&c.realized<=-2))P.mem.push({id:'call:backfired',tag:'FUNNY',w:6,text:'a call backfired'});
 if(P.tags.includes('RICH'))P.mem.push({id:'rich:pullup',tag:'RICH',w:7,text:'Rich pulled up'});
 if(P.newCombos.length)for(const c of P.newCombos)P.mem.push({id:'combo:'+c,tag:'COMBO',w:6,text:COMBO_NAME[c]});
 // dedupe by id
 const seen=new Set();P.mem=P.mem.filter(m=>seen.has(m.id)?false:seen.add(m.id));
 // report card
 const lines=[];
 const cashS=`$${Math.round(P.pot.cash)}K cash + ${P.pot.crates.length} crate${P.pot.crates.length===1?'':'s'} (~$${P.final}K street value)`;lines.push(`${klass==='CLEAN'?'CLEAN WIN':klass==='MESSY'?'A WIN WITH A STORY':klass==='COSTLY'?'A WIN — AND IT COST':klass==='FOLDED'?'FOLDED — WALKED AWAY WITH SOMETHING':klass==='GREED'?'GREED — JUGGED':klass==='ROBBED'?'JUGGED ON THE WAY BACK':'WASH'}   ·   ${P.win?'BANKED '+cashS:'nothing banked'}${P.pocketLoss?`  (−$${P.pocketLoss}K from Rich's pocket)`:''}`);
 const mvp=[...P.crew].sort((a,b)=>b.mvp-a.mvp||(b.kills||0)-(a.kills||0))[0];
 if(mvp&&((mvp.savedNow||[]).length||mvp.kills))lines.push(`MVP: ${mvp.short}${(mvp.savedNow||[]).length?' (pulled '+mvp.savedNow.map(id=>P.roster.find(o=>o.id===id)?.short).join(', ')+' back)':''}`);
 if(P.turnMoment)lines.push(P.turnMoment);
 for(const l of P.losses.filter(l=>l.kind!=='WOUNDED'||P.losses.length<3))lines.push(`${l.kind}: ${l.text}${l.cause&&l.cause.t?' — because '+l.cause.t:''}${l.cause&&l.cause.c==='GREED'?'  [GREED]':''}`);
 for(const o of P.crew){const s=o.finalStatus;if(s==='WOUNDED'&&!P.losses.some(l=>l.who===o.id))lines.push(`WOUNDED: ${o.short}`);}
 P.reportLines=lines;for(const l of lines)say(P,'REPORT',l);
}
function nickFrom(P,o){
 const ms=P.mem.filter(m=>m.id.includes(':'));
 const map=[['trait:phone:fail','phone'],['trait:eat:fail','eat'],['trait:dressed:fail','dressed'],['trait:showboat:fail','showboat'],['weapon:mac:friendly','mac'],['split:bus','bus'],['trait:sticky:fail','sticky'],['trait:seen:fail','seen'],['trait:skittish:fail','skittish'],['trait:church:fail','church'],['trait:hothead:fail','hothead'],['trait:sitdown:fail','sit']];
 return null;
}
function morning(P){
 const R=RS(P,'morning');
 const kl=P.klass;const vg=kl==='CLEAN'?'clean':kl==='MESSY'?'messy':kl==='COSTLY'?'costly':kl==='GREED'?'greed':'fail';
 const pool=(P.tags.includes('RICH')?C.VAMPGRAM.rich:C.VAMPGRAM[vg]);const vgLine=R.pick(pool);
 const out={vg:vgLine,texts:[],nicks:[],seeds:[],district:null,temptation:null};
 // oga texts
 const anyDown=P.crew.find(o=>['SHOT','CAPTURED'].includes(o.finalStatus));
 const has2=id=>P.mem.some(m=>m.id===id);
 const TXT=[['trait:phone:fail',"Dre: my phone is on silent now. permanently."],['trait:eat:fail',"Tunde: [photo of half a sandwich]"],['split:bus',"Half-Pint: is there a bus stop near the castle"],['split:panic',"Young Mazi: the car is fine. the car is fine."],['car:stall',"Young Mazi: the hooptie says sorry"],['weapon:mac:friendly',"Young Mazi: it barely grazed me. barely."],['trait:dressed:fail',"Sunday Best: The suit was a gift."],['greed:fail:1',"Dre: i said we were good. i was wrong."],['greed:retreat',"Dre: i said we were good. i was wrong."],['death:generic',"Auntie Grit: somebody call his mother. i'll do it."],['loot:legendary',"Half-Pint: are we rich or are we in a movie"],['trait:seen:fail',"Auntie Grit: I stand by the lecture."],['call:talk:win',"Dre: i talked to a man for eleven minutes and he gave me his lunch"],['boss:smack:flee',"Tunde: he'll be back. he always comes back."],['trait:small:fail',"Half-Pint: it was NOT that heavy"]];
 const hit=TXT.find(([id])=>has2(id));
 if(anyDown&&anyDown.finalStatus==='CAPTURED')out.texts.push(`Dre: ${anyDown.short} is not picking up.`);
 else if(anyDown)out.texts.push(`Auntie Grit: ${anyDown.short}, sit down. I'm coming with soup.`);
 if(hit)out.texts.push(hit[1]);
 else if(!anyDown)out.texts.push(R.pick(['Tunde: [photo of a sandwich]','Half-Pint: can we do that again','Young Mazi: told you it was easy','Sunday Best: Please let the record show I dressed appropriately.','Dre: ok but who is buying','Auntie Grit: Eat. Then talk.']));
 {const sv=P.crew.find(o=>o.savedNow&&o.savedNow.length);if(sv){const sid=P.roster.find(x=>x.id===sv.savedNow[0]);if(sid)out.texts.push(`${sid.short}: thank you. i mean it.`);}}
 // injury nicknames earned by events (visible on the card)
 const NK=[['trait:phone:fail','dre','DO NOT DISTURB'],['trait:eat:fail','tunde','MID-BITE'],['trait:dressed:fail','sunday_best','PRE-WORN'],['weapon:mac:friendly',null,'FRIENDLY FIRE'],['split:bus',null,'BUS PASS'],['trait:sticky:fail',null,'FIVE-FINGER'],['trait:seen:fail','auntie_grit','THE LECTURER'],['trait:skittish:fail',null,'RUNNER'],['trait:showboat:fail',null,'WATCH THIS'],['trait:church:fail','sunday_best','SLIPPERY'],['trait:hothead:fail',null,'DOOR EATER'],['bond:save',null,'GUARDIAN'],['call:save:win',null,'GUARDIAN']];
 for(const [id,who,nick] of NK){const m=P.mem.find(x=>x.id===id);if(!m)continue;const oid=m.who||who;const o=oid?P.crew.find(x=>x.id===oid):null;if(o&&!o.nick&&!out.nicks.some(n=>n.id===o.id))out.nicks.push({id:o.id,nick});}
 if(P.greedFail){const o=P.crew[0];if(o&&!out.nicks.some(n=>n.id===o.id))out.nicks.push({id:o.id,nick:'ONE MORE'});}
 for(const l of P.losses)if(l.kind==='SHOT'){const o=P.crew.find(x=>x.id===l.who);if(o&&!out.nicks.some(n=>n.id===o.id))out.nicks.push({id:o.id,nick:'LIMPER'});}
 // STORY seeds
 if(P.mem.some(m=>m.id==='sure:fail'))out.seeds.push({perk:'saw_95_miss',who:P.crew[0].id,text:'SAW A SURE THING MISS'});
 if(P.mem.some(m=>m.id==='neardeath:saved')){const s=P.crew.find(o=>o.savedNow&&o.savedNow.length);if(s)out.seeds.push({perk:'saved:'+s.savedNow[0],who:s.id,text:`PULLED ${(P.roster.find(o=>o.id===s.savedNow[0])||{short:'HIM'}).short.toUpperCase()} BACK`});}
 if(P.mem.some(m=>m.id==='rich:pullup'))out.seeds.push({perk:'rich_seen',who:P.crew[0].id,text:'SAW RICH STEP OUT OF THE CAR'});
 if(P.job.id==='car_wash_stickup'&&P.win&&P.crew.some(o=>o.tookHit))out.seeds.push({perk:'survived_car_wash',who:P.crew.find(o=>o.tookHit).id,text:'SURVIVED THE CAR WASH'});
 if(!out.seeds.length&&P.turnMoment)out.seeds.push({perk:'turn',who:P.crew[0].id,text:'ONE MORE'});
 if(!out.seeds.length&&P.mem[0])out.seeds.push({perk:'mem',who:P.crew[0].id,text:P.mem.sort((a,b)=>b.w-a.w)[0].text.slice(0,40).toUpperCase()});
 // district
 out.district=P.job.shape==='TAKE THE BLOCK'&&P.win?`${P.job.faction.split(' +')[0]} lose a corner of ${C.DISTRICTS[P.seed%3]}. Rival pressure drops.`:P.win?`${C.DISTRICTS[P.seed%3]} hears about it. Demand ticks up.`:`${C.DISTRICTS[P.seed%3]} hears about it too.`;
 // next temptation (at least one)
 const cap=P.crew.find(o=>o.finalStatus==='CAPTURED');
 let t;
 const hot=P.job.heat>=6||P.greedFail||P.stashRaided||P.step>=2;
 if(cap)t={type:'RESCUE',text:C.TEMPTATIONS[0].text.replace('{n}',cap.short)};
 else if(hot&&R.chance(.7))t={type:'RETALIATION',text:C.TEMPTATIONS[1].text};
 else if(P.pot.crates.some(c=>c.recruit)&&R.chance(.6))t={type:'RECRUIT',text:C.TEMPTATIONS[2].text.replace('{n}',R.pick(C.GENERIC_NAMES))};
 else if(P.kicker&&(P.kicker.rar!=='COMMON'||P.kicker.cat==='WEIRD')&&R.chance(.6))t={type:'RARE_PITCH',text:C.TEMPTATIONS[3].text.replace('{p}',R.pick(['Dre','Half-Pint','Young Mazi']))};
 else if(P.win&&P.job.shape==='TAKE THE BLOCK')t={type:'DEMAND',text:C.TEMPTATIONS[4].text.replace('{d}',C.DISTRICTS[P.seed%3])};
 else{const k=R.pick(['RARE_PITCH','DEMAND','RECRUIT']);t=k==='RARE_PITCH'?{type:k,text:C.TEMPTATIONS[3].text.replace('{p}',R.pick(['Dre','Half-Pint','Young Mazi','Sunday Best']))}:k==='RECRUIT'?{type:k,text:C.TEMPTATIONS[2].text.replace('{n}',R.pick(C.GENERIC_NAMES))}:{type:k,text:C.TEMPTATIONS[4].text.replace('{d}',C.DISTRICTS[P.seed%3])};}
 out.temptation=t;P.morning=out;
 say(P,'MORNING AFTER',out.vg);
 for(const x of out.texts)say(P,'MORNING AFTER',x);
 for(const n of out.nicks)say(P,'MORNING AFTER',`${P.roster.find(o=>o.id===n.id).short} earns a nickname: "${n.nick}" (now on the card)`);
 for(const s of out.seeds)say(P,'MORNING AFTER',`STORY seed → ${P.roster.find(o=>o.id===s.who).short}: ${s.text}`);
 say(P,'MORNING AFTER',out.district);
 say(P,'NEXT TEMPTATION',t.text);
}

// -------------------------------------------------------------------------------------------------------------------------- main
export function runPlay(cfg){
 const P=initPlay(cfg);
 pitch(P);carStage(P);slideIn(P);
 P.startedClean=false;
 const rec=(x)=>x;
 for(let i=0;i<4;i++){
  P.card=drawCard(P,i);P.card.weight=3;
  if(P.pressure>=67)P.stress=true;
  const choice=callWindow(P,i);
  const res=resolveBeat(P,i,choice,'real');
  if(i===0)P.startedClean=res.tier===2;
  if(P.pressure>=67)P.stress=true;
  if(res.fold){P.folded=true;say(P,'BEATS','  → FOLD. They take what they can carry and go.');break;}
  if(res.wipe||!able(P).length){P.wash=true;say(P,'BEATS','  Everyone is down. The block wins tonight.');break;}
 }
 if(!P.wash){getaway(P);}
 else{P.gaway={kind:'WASH'};P.robbed=true;P.pot.lost=true;P.losses.push({who:'pot',kind:'ROBBED',cause:cz(CAUSE.EARLIER,'everybody went down'),tag:'DRAMATIC',beat:3,text:'nobody made it out with anything'});say(P,'GETAWAY','  There is no getaway. Somebody else drives the car home.');}
 finalizeCrew(P,P.wash);
 if(!P.robbed){for(const o of able(P))nerveAdd(P,{moments:[]},o,6,null); // the trunk is the release
  trunk(P,0);turning(P);}else{P.pot.cash=0;P.pot.crates=[];}
 if(!P.robbed&&!P.folded){hitOneMore(P);}
 // crew statuses may change after a climb; re-finalize newly dropped
 if(P.step>0)refinalize(P);
 report(P);morning(P);
 return summarizeRecord(P);
}
function refinalize(P){for(const o of P.crew){if(o.finalStatus==='READY'&&(o.hp<o.maxhp*.5))o.finalStatus='WOUNDED';if(o.hp<=0&&!o.rescued&&o.finalStatus!=='DEAD'&&!['SHOT','CAPTURED','GONE'].includes(o.finalStatus)){if(o.named)o.finalStatus=o.left?'CAPTURED':'SHOT';else o.finalStatus=RSf(P,o.id+'2').chance(.4)?'DEAD':'WOUNDED';P.losses.push({who:o.id,kind:o.finalStatus,cause:o.dropCause||cz(CAUSE.GREED,'they went back in'),tag:'DRAMATIC',beat:5,text:`${o.short} paid for the extra step`});}}
 if(!P.job.bigPlay){const cand=P.crew.filter(o=>['SHOT','CAPTURED'].includes(o.finalStatus));if(cand.length>2)for(const o of cand.slice(2)){o.finalStatus='WOUNDED';P.mercy=(P.mercy||0)+1;}}}
function summarizeRecord(P){
 const crew=P.crew;const gens=crew.filter(o=>!o.named);
 const counts=k=>P.losses.filter(l=>l.kind===k).length;
 const mem=P.mem.filter(m=>m.w>=4);
 const lossEvents=P.losses;
 const clear=lossEvents.filter(l=>l.cause&&l.cause.c!==CAUSE.LUCK).length;
 return {
  seed:P.seed,night:P.night,opts:P.opts,job:P.job.id,jobName:P.jobName,promise:P.promise,shape:P.job.shape,policy:P.polName,pitcher:P.pitcher,car:P.carId,approach:P.approach,crew:crew.map(o=>o.id),seats:P.seat,
  klass:P.klass,win:P.win,final:P.final,getaway:P.gaway?.kind,steps:P.step,tookWin:!P.greedFail,greedFail:!!P.greedFail,folded:!!P.folded,
  gens:gens.length,genDead:gens.filter(o=>o.finalStatus==='DEAD').length,namedShot:crew.filter(o=>o.named&&o.finalStatus==='SHOT').length,namedCaptured:crew.filter(o=>o.named&&o.finalStatus==='CAPTURED').length,namedGone:crew.filter(o=>o.named&&o.finalStatus==='GONE').length,namedDead:crew.filter(o=>o.named&&o.finalStatus==='DEAD').length,
  wounded:crew.filter(o=>o.finalStatus==='WOUNDED').length,crash:P.gaway?.kind==='CRASH',split:P.gaway?.kind==='SPLIT',robbed:!!P.robbed,mercy:P.mercy||0,
  losses:lossEvents.length,lossesClear:clear,lossFunny:lossEvents.filter(l=>l.tag==='FUNNY'||l.tag==='DRAMATIC').length,
  swings:P.swings.length,swingsVisible:P.swings.filter(s=>s.vis).length,
  mem:mem.map(m=>m.id),memAll:P.mem.map(m=>m.id),memW:mem.reduce((a,m)=>a+m.w,0),
  nothing:mem.length===0&&P.losses.length===0&&!(P.callLog&&P.callLog.length),
  reversal:P.mem.some(m=>m.id.startsWith('reversal')),
  turn:P.turn||null,calls:{...P.stat,diff:P.stat.diff,bestWorst:P.stat.bestWorst,realized:P.stat.realized},callLog:P.callLog||[],
  climbs:P.climbs||[],shadow:P.shadow||[],teaseAudit:P.teaseAudit||[],truth:P.truth||null,
  pressureEnd:P.pressure,nerveEnd:crew.map(o=>[o.id,o.nerve]),newCombos:P.newCombos,combosActive:[...P.combos],
  heat:(P.job.heat+(P.approach==='LOUD'?4:P.approach==='QUIET'?-2:0)+(P.heatBonus||0)+P.step*3),
  script:P.script,report:P.reportLines,morning:P.morning,moments:P.moments.map(m=>({t:m.text,tag:m.tag,w:m.w})),
  losses:lossEvents,
  swingList:P.swings,
  finalStatus:Object.fromEntries(crew.map(o=>[o.id,o.finalStatus])),
  temptation:P.morning?.temptation?.type,emptyBeats:P.emptyBeats,beatCount:P.beatLog.length,crewTraits:crew.flatMap(o=>o.traits),crewCls:crew.map(o=>o.cls),pot:{cash:P.pot.cash,crates:P.pot.crates.map(c=>({cat:c.cat,rar:c.rar,name:c.name,val:c.val}))},
  kicker:P.kicker?{cat:P.kicker.cat,rar:P.kicker.rar,name:P.kicker.name}:null,
  stateOut:{roster:P.roster,bonds:P.bonds,known:{...P.known,...Object.fromEntries(P.newCombos.map(c=>[c,true]))},cars:P.cars,weirdSeen:P.weirdSeen,beefs:P.beefs},acceptedNamed:P.acceptedNamed,pocketLoss:P.pocketLoss||0,memWt:Object.fromEntries(P.mem.map(m=>[m.id,m.w])),beef:P.beef||[],beefSettled:P.beefSettled||[],beefFired:P.beefFired||null,beefSeen:P.beefSeen||0,beefsLive:P.beefs||[],crashOut:P.crashOut||0,spent:P.spent||0,
  stateAfter:{roster:P.roster.map(o=>({id:o.id,nerve:o.nerve,hp:o.hp,status:o.finalStatus||o.status,mvp:o.mvp,scars:o.scars,nick:o.nick,perks:o.perks})),weirdSeen:P.weirdSeen,known:{...P.known,...Object.fromEntries(P.newCombos.map(c=>[c,true]))}}
 };
}
