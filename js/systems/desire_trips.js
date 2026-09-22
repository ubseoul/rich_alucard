(function(){
 const statuses=['planned','traveling','arrived','completed'];
 function current(){return window.RAState.get().life.desires.activeTrip||null}
 function createTrip({id,title,destination,purpose}){
  const previous=current();if(previous&&previous.status!=='completed')return previous.id===id?previous:false;
  if(!id||!destination?.name||!destination?.region||!purpose)return false;
  const trip={id,title:title||null,destination:{name:destination.name,region:destination.region},purpose,status:'planned',currentActivity:null,completedActivities:[],createdAt:new Date().toISOString()};
  window.RAState.patch('life.desires.activeTrip',trip);return trip;
 }
 function update(fields){const trip=current();if(!trip)return false;const next={...trip,...fields};window.RAState.patch('life.desires.activeTrip',next);return next}
 function setStatus(status){if(!statuses.includes(status))return false;const trip=current();if(!trip)return false;const was=trip.status,result=update({status});if(status==='arrived'&&was!=='arrived')window.RAState.recordEvent({id:`trip-traveled:${trip.id}`,type:'trip_traveled',tripId:trip.id,title:trip.title,destination:trip.destination,purpose:trip.purpose});return result}
 function setCurrentActivity(currentActivity){return update({currentActivity})}
 function completeActivity(activity){const trip=current();if(!trip||!activity)return false;const completedActivities=[...new Set([...(trip.completedActivities||[]),activity])];return update({completedActivities,currentActivity:null})}
 function finish(){const trip=current();if(!trip)return false;const completedAt=new Date().toISOString(),result=update({status:'completed',currentActivity:null,completedAt});const life=window.RAState.get().life.desires;const completed=[...(life.completed||[])];if(!completed.some(x=>x.id===trip.id))completed.push({id:trip.id,title:trip.title,destination:trip.destination,purpose:trip.purpose,completedAt});window.RAState.patch('life.desires.completed',completed);window.RAState.recordEvent({id:`desire-completed:${trip.id}`,type:'desire_completed',tripId:trip.id,title:trip.title,destination:trip.destination,purpose:trip.purpose});return result}
 function reset(){window.RAState.patch('life.desires.activeTrip',null)}
 window.RADesireTrips={statuses,current,createTrip,setStatus,setCurrentActivity,completeActivity,finish,reset,beginTravel(){const trip=current();if(!trip||trip.status==='completed')return false;if(trip.status==='planned')return window.RAScenes.go('tripTravel');if(trip.status==='traveling'||trip.status==='arrived')return window.RAScenes.go('powderSpringsCurb');return false}};
})();
