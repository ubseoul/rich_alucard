(function(){
 'use strict';
 // RAVehicles — IF-1 (4I). Vehicle state support: owned vehicles, TRIBUTED state, drive counts.
 // Ownership is NOT reimplemented: the accepted record (life.ownership.cars via RALife.addCar/ownedCars/hasCar) stays the
 // single source of truth and behaves exactly as before. This service adds only what the accepted record lacks, kept in
 // save.frag.if1.vehicles.<carId> (lazy): {tributed,tributedDay,drives}. M9 itself is NOT implemented here.
 const listeners=new Set();
 const clone=v=>JSON.parse(JSON.stringify(v));
 const L=()=>window.RALife;
 const stateAll=()=>window.RAFrag.read('if1','vehicles',{});
 const idOf=car=>typeof car==='string'?car:car?.id;
 const owned=()=>L().ownedCars().map(clone);
 const has=id=>L().hasCar(id);
 const own=id=>L().ownedCars().find(c=>c.id===id||c.model===id||c.kind===id)||null;
 function emit(event){for(const fn of [...listeners]){try{fn(event);}catch(e){console.error('vehicle listener',e);}}}
 function record(id){return {tributed:false,tributedDay:null,drives:0,...(stateAll()[id]||{})};}
 function write(id,mutate){const all=clone(stateAll()),rec=record(id);mutate(rec);all[id]=rec;window.RAFrag.patch('if1','vehicles',all);return rec;}
 function resolve(idOrCar){const car=own(idOf(idOrCar));return car?car.id:null;}
 // TRIBUTED: recorded once (idempotent); the accepted ownership record is untouched.
 function tribute(idOrCar,{reason=null}={}){
  const id=resolve(idOrCar);if(!id)return {ok:false,reason:'not-owned'};
  if(record(id).tributed)return {ok:true,unchanged:true};
  const day=L().today().day;write(id,r=>{r.tributed=true;r.tributedDay=day;});emit({type:'tribute',id,day,reason});return {ok:true};
 }
 const isTributed=idOrCar=>{const id=resolve(idOrCar);return !!id&&!!record(id).tributed;};
 // Per-car drive counts. The accepted global drive counter (life.world.flags.drives, used by Officer Nodd) is a separate,
 // untouched number — read it with globalDrives().
 function recordDrive(idOrCar,{by=1}={}){const id=resolve(idOrCar);if(!id)return {ok:false,reason:'not-owned'};const rec=write(id,r=>{r.drives=(Number(r.drives)||0)+Math.max(0,Math.trunc(Number(by)||0));});emit({type:'drive',id,drives:rec.drives});return {ok:true,drives:rec.drives};}
 const driveCount=idOrCar=>{const id=resolve(idOrCar);return id?Number(record(id).drives)||0:0;};
 const totalDrives=()=>owned().reduce((n,c)=>n+driveCount(c.id),0);
 const globalDrives=()=>Number(L().flag('drives'))||0;
 const list=()=>owned().map(c=>({...c,service:record(c.id)}));
 const onChange=fn=>{listeners.add(fn);return ()=>listeners.delete(fn);};
 window.RAVehicles={owned,has,list,tribute,isTributed,recordDrive,driveCount,totalDrives,globalDrives,onChange};
})();
