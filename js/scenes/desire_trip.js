(function(){
 const TRIP_001={id:'desire_trip_001',title:'Butter Chicken Under the Stars',destination:{name:'Powder Springs',region:'Georgia'},purpose:'butter chicken'};
 const travel=document.querySelector('#tripTravel'),curb=document.querySelector('#powderSpringsCurb'),stars=document.querySelector('#stargazingScene'),returnScene=document.querySelector('#tripReturn');
 const rich=document.querySelector('#tripRich'),activityAction=document.querySelector('#tripActivityAction'),scaleControl=document.querySelector('#devTripScale');
 const HOLDS={eating:1450,chilling:1250,stargazing:9000,returning:650};
 const SRC_SIZE={width:80,height:96},SRC_ANCHOR={x:40,y:88},WORLD_ANCHOR={x:135,y:406},SCALE_OPTIONS=[1,1.5,1.75,2],DEFAULT_SCALE=1.5;let timer=0,sceneScope=null;
 function show(el,on){el?.classList.toggle('active',on);el?.setAttribute('aria-hidden',on?'false':'true')}
 function clearTimer(){if(typeof timer==='function')timer();else clearTimeout(timer);timer=0}
 function setScale(value){
  const scale=SCALE_OPTIONS.includes(Number(value))?Number(value):DEFAULT_SCALE;
  document.querySelectorAll('.trip-rich').forEach(img=>{
   img.style.width=`${SRC_SIZE.width*scale/270*100}%`;img.style.height=`${SRC_SIZE.height*scale/480*100}%`;
   img.style.left=`${WORLD_ANCHOR.x/270*100}%`;img.style.top=`${WORLD_ANCHOR.y/480*100}%`;img.style.transform=`translate(-${SRC_ANCHOR.x/SRC_SIZE.width*100}%,-${SRC_ANCHOR.y/SRC_SIZE.height*100}%)`;
   img.dataset.scale=String(scale);
  });
  if(scaleControl)scaleControl.value=String(scale);
  return scale;
 }
 function stagePose(name){if(rich)rich.src=`assets/rich_curb_${name}.png`;curb.dataset.stage=name;window.RAPresentationDirector?.relayout()}
 // Presentation Director: the curb and stargazing scenes are framed by the Director (establishing shots on the
 // trip's approved depth); the legacy percentage placement (setScale) stays only for the census legacy hook.
 const directed=()=>!!window.RAPresentationDirector&&!window.__pdLegacy;
 function stageDirector(section,beat,scope){const img=section.querySelector('.trip-rich');img.style.transform='';RAPresentationDirector.enter({stage:'powder-springs-trip',mode:RAStages.get('powder-springs-trip').director.mode,beat,scope,host:section,env:section.querySelector('.trip-environment'),envAsset:'assets/powder_springs_night_270x480.png',actors:{rich:img}})}
 function button(label,handler){const b=document.createElement('button');b.type='button';b.className='trip-action';b.textContent=label;b.addEventListener('click',handler,{once:true});activityAction?.replaceChildren(b)}
 function delayAction(stage,label,handler,delay){clearTimer();if(activityAction)activityAction.replaceChildren();timer=sceneScope?.timeout(()=>{timer=0;if(RAScenes.current()==='powderSpringsCurb'&&curb.dataset.stage===stage)button(label,handler)},delay)||0}
 function enterTravel({scope}){
  sceneScope=scope;if(directed())RAPresentationDirector.enterUi({mode:'cinematic',scope});
  document.body.classList.add('trip-mode');show(travel,true);RADesireTrips.setStatus('traveling');clearTimer();
  timer=scope.timeout(()=>{timer=0;const trip=RADesireTrips.current();if(!trip)return;RADesireTrips.setStatus('arrived');RAState.patch('life.world.location',`${trip.destination.name}, ${trip.destination.region}`);RAScenes.go('powderSpringsCurb')},720);
 }
 function exitTravel(){clearTimer();show(travel,false)}
 function enterCurb({scope}){sceneScope=scope;
  document.body.classList.add('trip-mode');show(curb,true);if(directed())stageDirector(curb,'curb',scope);else setScale(scaleControl?.value||DEFAULT_SCALE);
  const trip=RADesireTrips.current();if(!trip)return;
  if(trip.status==='traveling')RADesireTrips.setStatus('arrived');
  RAState.patch('life.world.location',`${trip.destination.name}, ${trip.destination.region}`);
  const done=trip.completedActivities||[];
  if(done.includes('eat butter chicken'))enterChilling();else enterEating();
 }
 function enterEating(){stagePose('eating');RADesireTrips.setCurrentActivity('eat butter chicken');delayAction('eating','FINISHED EATING',()=>{RADesireTrips.completeActivity('eat butter chicken');enterChilling()},HOLDS.eating)}
 function enterChilling(){stagePose('chilling');RADesireTrips.setCurrentActivity('chilling');delayAction('chilling','LOOK AT THE STARS',()=>RAScenes.go('stargazing'),HOLDS.chilling)}
 function exitCurb(){clearTimer();window.RAPresentationDirector?.exit();show(curb,false);if(activityAction)activityAction.replaceChildren()}
 function enterStars({scope}){sceneScope=scope;document.body.classList.add('trip-mode');show(stars,true);if(directed())stageDirector(stars,'stargazing',scope);RADesireTrips.setCurrentActivity('look at the stars');clearTimer();const done=document.querySelector('#stargazingDone');done?.classList.remove('visible');timer=scope.timeout(()=>{timer=0;if(RAScenes.current()==='stargazing')done?.classList.add('visible')},HOLDS.stargazing)}
 function exitStars(){clearTimer();window.RAPresentationDirector?.exit();show(stars,false);document.querySelector('#stargazingDone')?.classList.remove('visible')}
 function enterReturn({scope}){sceneScope=scope;if(directed())RAPresentationDirector.enterUi({mode:'cinematic',scope});document.body.classList.add('trip-mode');show(returnScene,true);clearTimer();timer=scope.timeout(async()=>{timer=0;RAState.patch('life.world.location','LA');await RAScenes.go('bedroom',{tripReturn:true})},HOLDS.returning)}
 function exitReturn(){clearTimer();show(returnScene,false)}
 async function endStargazing(){clearTimer();RADesireTrips.completeActivity('look at the stars');RADesireTrips.finish();await RAScenes.go('tripReturn')}
 document.addEventListener('DOMContentLoaded',()=>{
  scaleControl?.addEventListener('change',e=>setScale(e.target.value));setScale(DEFAULT_SCALE);
  document.querySelector('#stargazingDone')?.addEventListener('click',endStargazing);
  document.querySelector('#devResetTrip')?.addEventListener('click',async()=>{
   clearTimer();RADesireTrips.reset();RAState.patch('life.world.location','LA');
   if(RAPhone?.isOpen?.())await RAPhone.close();
   if(RAScenes.current()!=='bedroom')await RAScenes.go('bedroom',{dev:true});
  });
 });
 document.addEventListener('ra:scene',e=>{if(!['tripTravel','powderSpringsCurb','stargazing','tripReturn'].includes(e.detail?.id))document.body.classList.remove('trip-mode')});
 window.RADesireTripPresentation={firstTrip:TRIP_001,enterTravel,setScale,scaleOptions:SCALE_OPTIONS,anchor:{source:SRC_ANCHOR,world:WORLD_ANCHOR},holds:HOLDS};
 RAScenes.register('tripTravel',{enter:enterTravel,exit:exitTravel});
 RAScenes.register('powderSpringsCurb',{enter:enterCurb,exit:exitCurb});
 RAScenes.register('stargazing',{enter:enterStars,exit:exitStars});
 RAScenes.register('tripReturn',{enter:enterReturn,exit:exitReturn});
})();
