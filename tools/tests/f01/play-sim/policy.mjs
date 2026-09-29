// Player policies for the PLAY paper-sim. Policies only see what a player sees (faces, words, reads) — never the hidden odds.
import * as C from './content.mjs';

export const POLICY_NAMES=['careful','greedy','naive','random'];
const perms=(a)=>a.length<=1?[a]:a.flatMap((x,i)=>perms([...a.slice(0,i),...a.slice(i+1)]).map(r=>[x,...r]));
const power=o=>o.hp*o.aim/100+((C.GUNS[o.gun]||C.GUNS.pistol).dmg[0]+(C.GUNS[o.gun]||C.GUNS.pistol).dmg[1])/2;
const ADJ=[['DRIVER','SHOTGUN'],['DRIVER','BACK_L'],['SHOTGUN','BACK_R'],['BACK_L','BACK_M'],['BACK_M','BACK_R'],['BACK_L','BACK_R'],['SHOTGUN','BACK_M']];
export const adjSeats=(a,b)=>ADJ.some(([x,y])=>(x===a&&y===b)||(x===b&&y===a));
const jobFit=(o,job)=>{const w=job.favors==='LOUD'?{MUSCLE:1,SHOOTER:.9,WHEELS:.5,TALKER:.3,GHOST:.3,DOC:.5}:job.favors==='QUIET'?{MUSCLE:.3,SHOOTER:.5,WHEELS:.6,TALKER:.9,GHOST:1,DOC:.5}:{MUSCLE:.7,SHOOTER:.7,WHEELS:.7,TALKER:.7,GHOST:.7,DOC:.7};return w[o.cls]||.5;};
export function seatScore(P,assign,cars=P.carId){ // assign: {seat:oga}
 let s=0;
 for(const [seat,o] of Object.entries(assign)){
  const lane=C.SEAT_LANE[seat];s+=C.FIT[o.cls][lane]*2;
  const g=C.GUNS[o.gun]||C.GUNS.pistol;
  if(g.lane==='FRONT'&&lane==='FRONT')s+=1.2;if(g.lane==='BACK'&&lane==='BACK')s+=1.2;if(g.lane==='FRONT'&&lane!=='FRONT')s-=.6;if(g.lane==='BACK'&&lane!=='BACK')s-=.6;
 }
 for(const [sa,a] of Object.entries(assign))for(const [sb,b] of Object.entries(assign)){
  if(a.id>=b.id)continue;
  if(P.bonds.some(([x,y])=>(x===a.id&&y===b.id)||(x===b.id&&y===a.id))&&adjSeats(sa,sb))s+=1.5;
 }
 if(P.opts&&P.opts.beef&&P.opts.beef!=='off')for(const b of (P.beefs||[])){const sa=Object.keys(assign).find(k=>assign[k].id===b.from),sb=Object.keys(assign).find(k=>assign[k].id===b.to);if(sa&&sb&&adjSeats(sa,sb))s-=3;}
 return s;
}
export function bestSeating(P,crew,seats,dir=1){
 let best=null,bs=-1e9;
 for(const p of perms(crew)){const as={};seats.forEach((s,i)=>as[s]=p[i]);const sc=dir*seatScore(P,as);if(sc>bs){bs=sc;best=as;}}
 return best;
}
const seatsOf=(car,n)=>{const all=C.CARS[car].seats;if(n>=all.length)return all.slice();const pr=['DRIVER','SHOTGUN','BACK_L','BACK_R','BACK_M'];return pr.filter(s=>all.includes(s)).slice(0,n);};

export const POLICIES={
 careful:{
  crew(P,avail,n,job){
   const bigPlay=!!job.bigPlay;
   const sc=o=>jobFit(o,job)*2+(o.id===P.pitcher?.8:0)+(bigPlay&&o.named?-2.2:0)+(o.nerve/100)-(o.hp<o.maxhp?.6:0)+power(o)*.15+(o.nick?.2:0);
   const pool=[...avail].sort((a,b)=>sc(b)-sc(a));
   const crew=pool.slice(0,n);
   if(!crew.some(o=>o.cls==='WHEELS')){const w=pool.find(o=>o.cls==='WHEELS'&&!crew.includes(o));if(w&&n>=3)crew[crew.length-1]=w;}
   return crew;
  },
  car(P,n,job){if(n<=2)return job.favors==='QUIET'?'S2000':'SUPRA';if(n===5)return 'URUS';return job.favors==='LOUD'?(n>=4?'URUS':'SUPRA'):'SUPRA';},
  seats(P,crew,car){return bestSeating(P,crew,seatsOf(car,crew.length));},
  approach(P){const cs=P.crew;const ghost=cs.some(o=>o.cls==='GHOST'),talker=cs.some(o=>o.cls==='TALKER'),good=cs.filter(o=>o.cls==='GHOST'||o.cls==='TALKER').length,f=P.job.favors;
   if(P.job.octopus&&good>=2)return 'OCTOPUS';
   if(f==='LOUD')return 'LOUD';
   if(f==='QUIET')return ghost||talker?'QUIET':'LOUD';
   return ghost&&talker?'QUIET':'LOUD';},
  call(P,i,opts){
   const dropping=P.crew.filter(o=>o.hp<=0&&!o.fled&&!o.out);const ragged=crewRead(P)==='RAGGED';const smart=P.card.smartVerb;
   const face=(v)=>{const cs=P.crew.filter(o=>o.hp>0&&!o.out);const has=cl=>cs.some(o=>o.cls===cl);
    if(v==='TALK')return has('TALKER')||cs.some(o=>o.traits.includes('MOUTHPIECE'))?4:0;if(v==='BUST')return (has('MUSCLE')||has('SHOOTER'))?4:1;
    if(v==='SNEAK')return has('GHOST')?4:0;if(v==='PAY')return 1;return 0;};
   const val=o=>{let s=0;
    if(o==='DEFAULT')return 2.2;
    if(o==='SAVE')s=dropping.some(d=>d.named)?7:3.5;
    else if(o==='FOLD')s=(ragged||P.pressure>=67&&P.crew.some(o=>o.nerve<30))?6:(P.crew.some(o=>o.hp<=0)?2:0);
    else if(o==='PULL_UP')s=(P.pressure>=67||dropping.length||ragged)?5.5:2;
    else if(o==='PUSH')s=ragged?0:2.5;
    else s=face(o);
    if(o===smart)s+=3.5;return s;};
   return opts.map(o=>[o,val(o)+(P.ext?.tieRng||0)]).sort((a,b)=>b[1]-a[1])[0][0];
  },
  climb(P,info){const{step,read,tease}=info;if(read!=='FRESH')return false;if(step>=1)return tease==='LEGENDARY'&&P.pot.cash<60;return tease!=='COMMON';},
  turn(P,cand){return true;},
  gun(P,gun,crew){return [...crew].sort((a,b)=>jobFit(b,P.job||{favors:'ANY'})-jobFit(a,P.job||{favors:'ANY'}))[0];}
 },
 greedy:{
  crew(P,avail,n,job){return [...avail].sort((a,b)=>power(b)-power(a)+(b.named?.5:0)-(a.named?.5:0)).slice(0,n);},
  car(P,n,job){return n<=2?'S2000':'URUS';},
  seats(P,crew,car){const seats=seatsOf(car,crew.length);const sorted=[...crew].sort((a,b)=>power(b)-power(a));const as={};
   const drv=sorted.find(o=>o.cls==='WHEELS')||sorted[sorted.length-1];as.DRIVER=drv;const rest=sorted.filter(o=>o!==drv);
   const order=seats.filter(s=>s!=='DRIVER');rest.forEach((o,i)=>as[order[i]]=o);return as;},
  approach(P){return 'LOUD';},
  call(P,i,opts,ctx){const pref=['PUSH','BUST','PULL_UP','PAY','TALK','SNEAK','SAVE','FOLD'];for(const p of pref)if(opts.includes(p))return p;return 'DEFAULT';},
  climb(P,info){return true;},
  turn(P){return true;},
  gun(P,gun,crew){return [...crew].sort((a,b)=>power(b)-power(a))[0];}
 },
 naive:{
  crew(P,avail,n,job){const first=avail.find(o=>o.id===P.pitcher);const rest=avail.filter(o=>o!==first&&o.named).concat(avail.filter(o=>!o.named));return (first?[first,...rest]:rest).slice(0,n);},
  car(P,n){return 'HOOPTIE';},
  seats(P,crew,car){const seats=seatsOf(car,crew.length);const as={};crew.forEach((o,i)=>as[seats[i]]=o);return as;},
  approach(P){return 'QUIET';},
  call(P){return 'DEFAULT';},
  climb(P,info){return false;},
  turn(P){return true;},
  gun(P,gun,crew){return crew[0];}
 },
 random:{
  crew(P,avail,n,job,R){const a=[...avail];const out=[];while(out.length<n&&a.length)out.push(a.splice(R.int(0,a.length-1),1)[0]);return out;},
  car(P,n,job,R){const opts=Object.keys(C.CARS).filter(c=>C.CARS[c].seats.length>=n);return R.pick(opts);},
  seats(P,crew,car,R){const seats=seatsOf(car,crew.length);const c=[...crew];const as={};seats.forEach(s=>as[s]=c.splice(R.int(0,c.length-1),1)[0]);return as;},
  approach(P,R){return R.pick(P.job.octopus?['QUIET','LOUD','OCTOPUS']:['QUIET','LOUD']);},
  call(P,i,opts,R){return R.pick(['DEFAULT',...opts]);},
  climb(P,info,R){return R.chance(.5);},
  turn(P,c,R){return R.chance(.5);},
  gun(P,gun,crew,R){return R.pick(crew);}
 }
};
export function crewRead(P){
 const cs=P.crew.filter(o=>!o.out);if(!cs.length)return 'RAGGED';
 const hurt=cs.filter(o=>o.hp<=0||o.hp<o.maxhp*.5).length+cs.filter(o=>o.nerve<30).length*.5+P.crew.filter(o=>o.out).length;
 const r=hurt/P.crew.length;return r>=.7?'RAGGED':r>=.25?'BANGED UP':'FRESH';
}
