// Sim driver: answers the engine's prompts with the four player policies (they see only what a player sees).
import './globals.mjs';
import * as E from '../../../../js/frag/F01/play/engine.mjs';
import * as C from '../../../../js/frag/F01/play/content.mjs';
import {POLICIES,bestSeating} from './policy.mjs';
export * from '../../../../js/frag/F01/play/engine.mjs';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function makeDriver(name,opts={}){
 const pol=POLICIES[name];
 return (pr)=>{
  const P=pr.P;
  if(pr.type==='CAR'){
   const {R,avail,options,minCrew,maxCrew}=pr;const job=P.job;
   if(job.defense&&C.CARS.CASTLE){ // the castle: the only "car" is the house
    const seatsN=E.seatsForCar('CASTLE',99).length;const n=clamp(Math.min(maxCrew,seatsN,avail.length),Math.min(minCrew,seatsN),Math.min(maxCrew,seatsN));
    const crew=pol.crew(P,avail,n,job,R).slice(0,n);P.crew=crew;
    const sl=E.seatsForCar('CASTLE',n);let seats;
    if(opts.formation===false){const c=[...crew];seats={};sl.forEach(s=>seats[s]=c.splice(R.int(0,c.length-1),1)[0].id);}
    else if(name==='naive'){seats={};crew.forEach((o,i)=>seats[sl[i]]=o.id);}
    else {const sc=pol.seats(P,crew,'CASTLE',R);seats=Object.fromEntries(Object.entries(sc).map(([s,o])=>[s,o.id]));}
    return {car:'CASTLE',crew:crew.map(o=>o.id),seats,approach:pol.approach(P,R)};
   }
   const want=Math.min(maxCrew,avail.length);
   let carId=opts.forceCar||pol.car(P,want,job,R);
   if((P.cars[carId]||0)>0&&!P.opts.carOff&&!opts.forceCar)carId='HOOPTIE';
   if(P.opts.carOff)carId='HOOPTIE';
   const seatsN=C.CARS[carId].seats.length;
   const n=clamp(Math.min(maxCrew,seatsN,avail.length),Math.min(minCrew,seatsN),Math.min(maxCrew,seatsN));
   const crew=pol.crew(P,avail,n,job,R).slice(0,n);P.crew=crew;
   let seats;
   if(P.opts.carOff){seats=null;}
   else if(opts.formation===false){const sl=E.seatsForCar(carId,crew.length);const c=[...crew];seats={};sl.forEach(s=>seats[s]=c.splice(R.int(0,c.length-1),1)[0].id);}
   else if(opts.seatMode==='worst'){const sc=bestSeating(P,crew,E.seatsForCar(carId,crew.length),-1);seats=Object.fromEntries(Object.entries(sc).map(([s,o])=>[s,o.id]));}
   else{const sc=pol.seats(P,crew,carId,R);seats=Object.fromEntries(Object.entries(sc).map(([s,o])=>[s,o.id]));}
   P.seat=seats||{};P.combos=new Set();
   return {car:carId,crew:crew.map(o=>o.id),seats:seats||undefined,approach:pol.approach(P,R)};
  }
  if(pr.type==='CALL')return pol.call(P,pr.i,pr.opts,pr.R);
  if(pr.type==='CLIMB')return pol.climb(P,pr.info,pr.R);
  if(pr.type==='TURN')return pol.turn(P,pr.crate,pr.R);
  if(pr.type==='GUN'){const crew=pr.cands.map(id=>P.roster.find(o=>o.id===id));const g=pol.gun(P,pr.crate,crew,pr.R);return g&&g.id;}
  return undefined;
 };
}
export const startRoster=E.startRoster;
export function runPlay(cfg){const opts=cfg.opts||{};return E.runPlay({...cfg,policy:cfg.policy,state:cfg.state||E.startRoster(cfg.seed,{cap:10})},makeDriver(cfg.policy,opts));}
