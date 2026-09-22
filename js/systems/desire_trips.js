(function(){
 const statuses=['planned','traveling','arrived','completed'];
 function current(){return window.RAState.get().activeTrip||null}
 function createTrip({id,destination,purpose}){
  const previous=current();if(previous&&previous.status!=='completed')return previous.id===id?previous:false;
  if(!id||!destination?.name||!destination?.region||!purpose)return false;
  const trip={id,destination:{name:destination.name,region:destination.region},purpose,status:'planned',currentActivity:null,completedActivities:[],createdAt:new Date().toISOString()};
  window.RAState.patch('activeTrip',trip);return trip;
 }
 function update(fields){const trip=current();if(!trip)return false;const next={...trip,...fields};window.RAState.patch('activeTrip',next);return next}
 function setStatus(status){if(!statuses.includes(status))return false;return update({status})}
 function setCurrentActivity(currentActivity){return update({currentActivity})}
 function completeActivity(activity){const trip=current();if(!trip||!activity)return false;const completedActivities=[...new Set([...(trip.completedActivities||[]),activity])];return update({completedActivities,currentActivity:null})}
 function finish(){return update({status:'completed',currentActivity:null,completedAt:new Date().toISOString()})}
 function reset(){window.RAState.patch('activeTrip',null)}
 window.RADesireTrips={statuses,current,createTrip,setStatus,setCurrentActivity,completeActivity,finish,reset,beginTravel(){const trip=current();if(!trip||trip.status==='completed')return false;if(trip.status==='planned')return window.RAScenes.go('tripTravel');if(trip.status==='traveling'||trip.status==='arrived')return window.RAScenes.go('powderSpringsCurb');return false}};
})();
