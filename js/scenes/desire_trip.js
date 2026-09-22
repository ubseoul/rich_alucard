(function(){
 const TRIP_001={id:'desire_trip_001',destination:{name:'Powder Springs',region:'Georgia'},purpose:'butter chicken'};
 const travel=document.querySelector('#tripTravel'),curb=document.querySelector('#powderSpringsCurb'),stars=document.querySelector('#stargazingScene'),activityAction=document.querySelector('#tripActivityAction');
 let travelTimer=0;
 function show(el,on){el?.classList.toggle('active',on);el?.setAttribute('aria-hidden',on?'false':'true')}
 function enterTravel(){
  document.body.classList.add('trip-mode');window.RADesireTrips.setStatus('traveling');show(travel,true);
  clearTimeout(travelTimer);travelTimer=setTimeout(()=>{
   const trip=window.RADesireTrips.current();if(!trip)return;
   window.RADesireTrips.setStatus('arrived');window.RAState.patch('rich.location',`${trip.destination.name}, ${trip.destination.region}`);
   window.RAScenes.go('powderSpringsCurb');
  },720);
 }
 function exitTravel(){clearTimeout(travelTimer);travelTimer=0;show(travel,false)}
 function renderArrival(){
  const trip=window.RADesireTrips.current(),completed=trip?.completedActivities||[];
  if(!activityAction||!trip)return;
  if(trip.status==='completed'){activityAction.replaceChildren();return}
  const action=document.createElement('button');action.type='button';action.className='trip-action';
  if(completed.includes('eat butter chicken')){action.textContent='LOOK AT THE STARS';action.addEventListener('click',()=>{window.RADesireTrips.setCurrentActivity('look at the stars');window.RAScenes.go('stargazing')})}
  else{action.textContent='EAT BUTTER CHICKEN';action.addEventListener('click',()=>{window.RADesireTrips.completeActivity('eat butter chicken');window.RADesireTrips.setCurrentActivity('look at the stars');renderArrival()})}
  activityAction.replaceChildren(action);
 }
 function enterCurb(){
  document.body.classList.add('trip-mode');show(curb,true);
  const trip=window.RADesireTrips.current();if(!trip)return;
  if(trip.status==='traveling')window.RADesireTrips.setStatus('arrived');
  window.RAState.patch('rich.location',`${trip.destination.name}, ${trip.destination.region}`);renderArrival();
 }
 function exitCurb(){show(curb,false)}
 function enterStars(){document.body.classList.add('trip-mode');show(stars,true);window.RADesireTrips.setCurrentActivity('look at the stars')}
 function exitStars(){show(stars,false)}
 async function endStargazing(){window.RADesireTrips.completeActivity('look at the stars');window.RADesireTrips.finish();await window.RAScenes.go('powderSpringsCurb')}
 document.addEventListener('DOMContentLoaded',()=>{
  document.querySelector('#stargazingDone')?.addEventListener('click',endStargazing);
  document.querySelector('#devResetTrip')?.addEventListener('click',async()=>{
   window.RADesireTrips.reset();window.RAState.patch('rich.location','LA');
   if(window.RAPhone?.isOpen?.())await window.RAPhone.close();
   if(window.RAScenes.current()!=='bedroom')await window.RAScenes.go('bedroom',{dev:true});
  });
 });
 document.addEventListener('ra:scene',e=>{if(!['tripTravel','powderSpringsCurb','stargazing'].includes(e.detail?.id))document.body.classList.remove('trip-mode')});
 window.RADesireTripPresentation={firstTrip:TRIP_001,enterTravel};
 RAScenes.register('tripTravel',{enter:enterTravel,exit:exitTravel});
 RAScenes.register('powderSpringsCurb',{enter:enterCurb,exit:exitCurb});
 RAScenes.register('stargazing',{enter:enterStars,exit:exitStars});
})();
