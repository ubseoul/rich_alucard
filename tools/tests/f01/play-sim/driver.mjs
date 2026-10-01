// Sim driver: answers the engine's prompts with the four player policies (they see only what a player sees).
import './globals.mjs';
import * as E from '../../../../js/frag/F01/play/engine.mjs';
import * as C from '../../../../js/frag/F01/play/content.mjs';
import {POLICIES} from './policy.mjs';
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
    return {car:'CASTLE',crew:crew.map(o=>o.id),guns:pol.guns(P,crew,job,R)};
   }
   const usable=options.filter(o=>!o.disabled).map(o=>o.id);
   const want=Math.min(maxCrew,avail.length);
   let carId=opts.forceCar||pol.car(P,want,job,R);
   if(!usable.includes(carId)&&!opts.forceCar)carId=usable.find(id=>C.CARS[id].seats.length>=Math.min(minCrew,avail.length))||usable[0]||carId;
   if(P.opts.carOff)carId=usable[0]||'HOOPTIE';
   const seatsN=C.CARS[carId].seats.length;
   const n=clamp(Math.min(maxCrew,seatsN,avail.length),Math.min(minCrew,seatsN),Math.min(maxCrew,seatsN));
   const crew=pol.crew(P,avail,n,job,R).slice(0,n);P.crew=crew;
   return {car:carId,crew:crew.map(o=>o.id),guns:pol.guns(P,crew,job,R)};
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
