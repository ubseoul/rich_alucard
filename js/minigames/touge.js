(function(){
 'use strict';
 // TOUGE — top-down vertical-scrolling drift game. See docs/btf/MINIGAME_CONTRACT.md.
 const clamp=(v,a,b)=>v<a?a:v>b?b:v;
 const sign=v=>v>0?1:v<0?-1:0;
 const clamp01=v=>clamp(v,0,1);

 // ---- Cars ----------------------------------------------------------------
 const CARS={
  supra:{power:8,grip:6,weight:6,driftEase:6,style:1.0,manual:true,color:'#d9d9d9'},
  s15:{power:6,grip:6,weight:4,driftEase:9,style:1.1,manual:true,color:'#f2f2f2'},
  s2000:{power:6,grip:7,weight:3,driftEase:7,style:1.2,manual:true,color:'#ff6fb5',twitchy:true},
  r34_awd:{power:8,grip:9,weight:7,driftEase:1,style:1.0,manual:true,color:'#3a5fbf'},
  r34_rwd:{power:8,grip:6,weight:7,driftEase:8,style:1.3,manual:true,color:'#3a5fbf'},
  urus:{power:9,grip:7,weight:10,driftEase:3,style:1.5,manual:false,color:'#5a1420'},
  aventador:{power:10,grip:8,weight:7,driftEase:2,style:1.4,manual:false,color:'#3b1a5c'},
  ferrari:{power:9,grip:6,weight:5,driftEase:7,style:1.6,manual:false,color:'#c81d25'}
 };

 function computeHandling(carId,parts){
  parts=parts||{};
  const base=CARS[carId]||CARS.s15;
  let driftEase=base.driftEase;
  let grip=base.grip;
  let power=base.power;
  let weight=base.weight;
  let style=base.style;
  let maxAngle=60;
  let control=1;
  let counterWindow=1;
  let stability=1;
  let ebrakePower=1;
  if(parts.tires){driftEase+=2;grip-=2;control+=1;}
  if(parts.lsd)driftEase+=3;
  if(parts.anglekit)maxAngle+=15;
  if(parts.hydro)ebrakePower+=0.6;
  if(parts.coilovers){stability+=0.6;}
  if(parts.weight)weight-=1;
  if(parts.bucket)counterWindow+=0.5;
  if(parts.turbo)power+=parts.turbo*2;
  if(parts.bodykit&&carId==='s15')style*=1.3;
  if(parts.rwd&&carId==='r34_awd')driftEase+=7;
  if(parts.livery)style+=0.1;
  driftEase=clamp(driftEase,0.2,12);
  grip=clamp(grip,1,12);
  weight=clamp(weight,1,12);
  return {carId,power,grip,weight,driftEase,style,maxAngle,control,counterWindow,stability,ebrakePower,
   manual:!!base.manual,twitchy:!!base.twitchy,color:base.color};
 }

 // ---- Pure physics step -----------------------------------------------------
 function step(state,input,dt,handling){
  const s=Object.assign({heading:0,slideAngle:0,speed:0,x:0,distance:0,sliding:false,spinning:false},state);
  const steer=clamp(input.steer||0,-1,1),throttle=clamp01(input.throttle||0),ebrake=!!input.ebrake;
  const power=handling.power||5,control=handling.control||1;
  const ease=(handling.driftEase||1)/6,gripK=(handling.grip||5)/6;
  const speedFactor=0.35+0.65*Math.min(1,s.speed/50);
  const twitch=handling.twitchy?1.35:1;
  s.heading+=steer*150*speedFactor*control*twitch*dt;

  const wasSliding=s.sliding;
  // clutch kick: throttle re-pressed while e-braking on a manual car.
  if(input.clutchKick&&handling.manual&&ebrake&&!s._kicked){
   const dir=steer!==0?sign(steer):(s.slideAngle>=0?1:-1);
   s.slideAngle+=dir*10;s.sliding=true;
  }
  s._kicked=!!input.clutchKick;
  // feint: quick opposite-then-into steer flip at speed.
  const steerSign=steer>0.3?1:steer<-0.3?-1:0;
  if(steerSign!==0&&s._lastSteerSign&&steerSign===-s._lastSteerSign&&s.speed>40&&(s._feintGap==null||s._feintGap<0.35)){
   s.slideAngle+=steerSign*10*Math.min(1.4,ease);s.sliding=true;
  }
  s._feintGap=steerSign!==0&&steerSign===s._lastSteerSign?(s._feintGap||0)+dt:0;
  if(steerSign!==0)s._lastSteerSign=steerSign;
  // e-brake initiation (edge-triggered).
  if(ebrake&&!wasSliding&&s.speed>25&&Math.abs(s.slideAngle)<3){
   const dir=steer!==0?sign(steer):1;
   s.slideAngle+=dir*6*Math.min(1.6,ease+0.4)*(handling.ebrakePower||1);
  }
  if(Math.abs(s.slideAngle)>2.5)s.sliding=true;

  if(s.sliding){
   const dir=sign(s.slideAngle)||1;
   const oppose=-dir*steer; // positive = steering opposite the slide (correct countersteer)
   const window=handling.counterWindow||1;
   if(oppose>0.85/window&&Math.abs(s.slideAngle)<14*window){
    s.slideAngle*=0.25; // over-countersteer snaps back to grip
   } else {
    const growth=throttle*power*ease*22;
    const decayBase=gripK*3*(handling.stability||1);
    const recover=Math.max(0,oppose)*gripK*10;
    const dm=dir*growth-s.slideAngle*decayBase-dir*recover;
    s.slideAngle+=dm*dt;
   }
   if(ebrake)s.slideAngle+=dir*ease*8*dt;
   if(Math.abs(s.slideAngle)<1&&!ebrake&&throttle<0.12)s.sliding=false;
  } else {
   s.slideAngle*=Math.max(0,1-gripK*6*dt);
  }

  s.spinning=false;
  const maxAngle=handling.maxAngle||60;
  if(Math.abs(s.slideAngle)>maxAngle){s.spinning=true;s.sliding=false;s.slideAngle=0;}

  const drag=0.04*s.speed+(ebrake?55:0)+Math.abs(s.slideAngle)*0.15;
  const accel=throttle*power*10-drag;
  s.speed=clamp(s.speed+accel*dt,0,220);

  const velRad=(s.heading-s.slideAngle)*Math.PI/180;
  s.distance+=Math.max(0,s.speed*Math.cos(velRad))*dt*0.6;
  s.x+=s.speed*Math.sin(velRad)*dt*0.6;
  return s;
 }

 // ---- Scoring ----------------------------------------------------------
 function scoreSlideFrame(angleDeg,speedKmh,dt,maxAngle){
  maxAngle=maxAngle||60;
  const capped=clamp(angleDeg,0,maxAngle);
  const eff=Math.max(0,capped-15);
  return eff*(Math.max(0,speedKmh)/10)*0.1*dt;
 }
 function clipBonus(mult){return 500*(mult||1);}
 function nextChain(mult){return Math.min(4,(mult||1)+0.5);}
 function scoreDrift(state,angleDeg,speedKmh,dt,maxAngle=60){return {...state,score:(Number(state.score)||0)+scoreSlideFrame(Math.abs(angleDeg),speedKmh,dt,maxAngle)*(Number(state.chain)||1)};}
 function scoreClip(state){const chain=Number(state.chain)||1;return {score:(Number(state.score)||0)+clipBonus(chain),chain:nextChain(chain),clips:(Number(state.clips)||0)+1};}
 function scoreTrace(trace,durationSeconds=30){
  const duration=Math.max(1,Number(durationSeconds)||30);let state={score:0,chain:1,clips:0};
  for(const [angle,speed,share,clips=0] of trace||[]){state=scoreDrift(state,angle,speed,duration*Math.max(0,Number(share)||0),60);for(let i=0;i<clips;i++)state=scoreClip(state);}
  return {...state,score:Math.round(state.score)};
 }
 function noviceBotScores(durationSeconds=30,runs=window.RANewOgaTunables?.m4?.NOVICE_BOT_RUNS||[]){return runs.map(run=>scoreTrace(run,durationSeconds).score).sort((a,b)=>a-b);}
 function noviceBotMedianScore(durationSeconds=30,runs){const scores=noviceBotScores(durationSeconds,runs);return scores.length?scores[Math.floor(scores.length/2)]:0;}

 // ---- Courses ------------------------------------------------------------
 const COURSE_THEME={
  angeles_crest:{sky:'#233a6b',floor:'#3a4a3a',road:'#332f3f',stars:1,label:'ANGELES CREST'},
  docks:{sky:'#1c2433',floor:'#26302e',road:'#2c2d38',stars:0,label:'THE DOCKS'},
  grave_garage:{sky:'#17142c',floor:'#241f2e',road:'#2e2838',stars:0,label:'GRAVE GARAGE'},
  warehouse_alleys:{sky:'#15131c',floor:'#29262d',road:'#302d35',stars:0,label:'KOREATOWN · WAREHOUSE ALLEYS'}
 };
 function buildCourse(id,seed){
  const rng=(window.RAPixel&&RAPixel.rng)?RAPixel.rng(`${id}:${seed}`):(()=>{let s=(seed>>>0)||1;return()=>{s^=s<<13;s>>>=0;s^=s>>17;s^=s<<5;s>>>=0;return s/4294967296;};})();
  const tight=id==='grave_garage';
  const roadWidth=tight?148:190; // RC2: wider road (was 128/172)
  const n=8+Math.floor(rng()*5);
  const corners=[];
  for(let i=0;i<n;i++){
   if(i===0||rng()<0.25){corners.push({type:'straight',length:120+rng()*180});}
   else{
    const dir=rng()<0.5?-1:1;
    const curve=(tight?50+rng()*70:30+rng()*70)*dir;
    const length=(tight?180+rng()*180:220+rng()*260);
    corners.push({type:'corner',dir,curve,length,clipT:0.35+rng()*0.3});
   }
  }
  const points=[{distance:0,x:0}];
  let distance=0,x=0,heading=0;
  const step=16,clips=[];
  for(const seg of corners){
   if(seg.type==='straight'){
    for(let d=0;d<seg.length;d+=step){distance+=step;points.push({distance,x});}
   } else {
    const steps=Math.max(4,Math.round(seg.length/step));
    const dHeading=seg.curve/steps;
    let marked=false;
    for(let i=0;i<steps;i++){
     heading+=dHeading;
     x+=Math.sin(heading*Math.PI/180)*(step*0.9);
     distance+=step;
     points.push({distance,x});
     if(!marked&&i/steps>=seg.clipT){
      clips.push({distance,x:x-seg.dir*(roadWidth/2-20),range:tight?30:40,dir:seg.dir,hit:false});
      marked=true;
     }
    }
   }
  }
  const length=distance;
  function xAt(d){
   if(d<=0)return points[0].x;
   if(d>=length)return points[points.length-1].x;
   let i=Math.min(points.length-2,Math.max(0,Math.floor(d/step)-1));
   while(points[i+1]&&points[i+1].distance<d)i++;
   const a=points[i],b=points[i+1]||a;
   const t=b.distance>a.distance?(d-a.distance)/(b.distance-a.distance):0;
   return a.x+(b.x-a.x)*t;
  }
  return {id,seed,roadWidth,length,corners,clips,xAt,theme:COURSE_THEME[id]||COURSE_THEME.angeles_crest};
 }

 window.RAMinigameLogic=window.RAMinigameLogic||{};
 window.RAMinigameLogic.touge={cars:CARS,computeHandling,scoreSlideFrame,clipBonus,nextChain,scoreDrift,scoreClip,scoreTrace,noviceBotScores,noviceBotMedianScore,buildCourse,step};

 // ---- Rendering / mount ----------------------------------------------------
 if(typeof window.RAMinigames==='undefined'||typeof document==='undefined')return;

 const LESSON_WORD={1:'INITIATE.',2:'COUNTERSTEER.',3:'THROTTLE.',4:'CLIP.'};

 // Frozen ART SHIP 006 TOUGE vehicles (top-down, nose up, 16×28 native) resolved by runtime car id through the Art
 // Registry. Both R34 drivetrains share the one approved R34; the S15 uses its body-kit master when the kit is on.
 // Rival cars have no approved art yet and stay placeholder shapes.
 const FROZEN_CAR={supra:'supra',s15:'s15_stock',s2000:'s2000_pink',r34_awd:'r34_blue',r34_rwd:'r34_blue',urus:'urus_oxblood',aventador:'aventador_purple',ferrari:'ferrari_f40_red'};
 function frozenCar(carId,parts){const key=carId==='s15'&&parts?.bodykit?'s15_bodykit':FROZEN_CAR[carId];const src=window.RAArtRegistry?.vehicles?.touge?.[key]?.asset;if(!src)return null;const img=new Image();img.src=src;return img;}

 function mount(root,ctx){
  const P=ctx.params||{};
  const carId=CARS[P.car]?P.car:'s15';const motor=carId==='aventador'?'CAR_V12':carId==='ferrari'?'CAR_V8_EXOTIC':carId==='urus'?'CAR_V8_SUV':carId==='s2000'?'CAR_4CYL_HIGHREV':'CAR_I6_TURBO';ctx.audio?.sound(motor,'idle');ctx.audio?.sound('COUNTDOWN');ctx.audio?.sound(P.course==='garage'?'AMB_GARAGE_ECHO':'AMB_MOUNTAIN');
  const parts=P.parts||{};
  const carSprite=frozenCar(carId,parts);
  const handling=computeHandling(carId,parts);
  const rain=!!P.rain;
  const tandem=P.tandem||null;
  // ART SHIP 014: tandem rivals drive frozen TOUGE cars — Pinky her pink S2000 (ART SHIP 006), Tokyo Tony the Midnight
  // Mafia rival car (rival A; content has only one Midnight Mafia driver, so rival B stays unassigned).
  const RIVAL_CAR={'PINKY':'s2000_pink','TOKYO TONY':'rival_a'};
  const rivalSrc=tandem&&window.RAArtRegistry?.vehicles?.touge?.[RIVAL_CAR[tandem.rival]]?.asset,rivalSprite=rivalSrc?Object.assign(new Image(),{src:rivalSrc}):null;
  // HUD face (ART SHIP 014 Rich states): locked in while a drift holds, spun out for a beat after a spin. Drawn at
  // native 1:1 as a head-and-shoulders crop, under the score and clear of the quit zone.
  const hudFaces=Object.fromEntries(['touge_locked','touge_spun'].map(k=>{const src=window.RABtfPeople?.rich?.states?.[k]||window.RAArtRegistry?.characters?.rich?.states?.[k];return [k,src?Object.assign(new Image(),{src}):null];}));
  let spunAt=-9;
  const passengerName=P.passenger||null;
  // ART SHIP 014 passenger portrait (e.g. Tristan), passed in by the app; drawn at native 1:1 while they react.
  const passengerSprite=P.passengerSprite?Object.assign(new Image(),{src:P.passengerSprite}):null;
  const leaderboard=Array.isArray(P.leaderboard)?P.leaderboard:[];
  const lesson=P.lesson;
  const {canvas,ctx:c}=RAPixel.createCanvas(root);
  const J=window.RAJuice?window.RAJuice.create(c):{burst(){},float(){},ring(){},shake(){},flash(){},update(){},begin(){c.save();},end(){c.restore();}};
  const prog=ctx.progress();
  let course=buildCourse(P.course&&COURSE_THEME[P.course]?P.course:'angeles_crest',P.seed||Math.floor(Math.random()*1e9));

  let state={heading:0,slideAngle:0,speed:0,x:0,distance:0,sliding:false,spinning:false};
  let score=0,chain=1,spins=0,maxAngleSeen=0,clipHits=0,wallCooldown=0,tandemScore=0;
  // Read-only marker for test harnesses (Engineering 06): headless frame rates stretch the 90 game-second run past any
  // fixed real-time budget, so drivers wait for `results` instead of guessing. No gameplay effect.
  let phase='run',runElapsed=0,resultShown=null;root.dataset.phase=phase;
  let cleanTimer=0,rewardedClean=false,cueUsed=false;
  let lessonFlash={text:LESSON_WORD[lesson]||null,t:LESSON_WORD[lesson]?1.6:0};
  let lessonCounts={1:0,2:0,3:0,4:0};
  let episodeCounterOk=false,episodeThrottleOk=false,lastAbsAngle=0;
  let passengerBubble=null,passengerTimer=1.5+Math.random()*2;
  const PASSENGER_LINES=['nice line','whoa','my stomach','again again','DO A SPIN'];

  // ---- input -------------------------------------------------------------
  const input={steer:0,throttle:0,ebrake:false};
  const pointers=new Map(),keys=new Set();
  const storyRun=!!(tandem||P.escapeRunner||window.RAAdventures?.active?.());
  let ebrakeHeld=false,prevThrottleHeld=false,clutchKick=false;
  // Native-sized hold controls: no drag gesture is required. Legacy analog dragging remains available above them.
  const DRIVE_BUTTONS=[
   {kind:'steerButton',value:-1,label:'LEFT',x:8,y:428,w:58,h:46},
   {kind:'steerButton',value:1,label:'RIGHT',x:72,y:428,w:58,h:46},
   {kind:'throttleButton',label:'GAS',x:136,y:428,w:58,h:46},
   {kind:'ebrake',label:'E-BRAKE',x:200,y:428,w:62,h:46}
  ];
  function clearInput(){
   keys.clear();const ids=[...pointers.keys()];pointers.clear();
   for(const id of ids){try{canvas.releasePointerCapture(id);}catch(_){}}
   ebrakeHeld=false;prevThrottleHeld=false;clutchKick=false;input.steer=0;input.throttle=0;input.ebrake=false;
  }
  function blur(){clearInput();}
  window.addEventListener('blur',blur);
  function toNative(clientX,clientY){const r=canvas.getBoundingClientRect();return{x:(clientX-r.left)*270/(r.width||270),y:(clientY-r.top)*480/(r.height||480)};}
  function inRect(p,rct){return p.x>=rct.x&&p.x<=rct.x+rct.w&&p.y>=rct.y&&p.y<=rct.y+rct.h;}
  function safeCapture(id){try{canvas.setPointerCapture&&canvas.setPointerCapture(id);}catch(e){}}
  function onDown(e){
   e.preventDefault();const p=toNative(e.clientX,e.clientY);
   if(phase==='results'){handleResultsTap(p);return;}
   const button=DRIVE_BUTTONS.find(b=>inRect(p,b));
   if(button)pointers.set(e.pointerId,{kind:button.kind,value:button.value});
   else if(p.x<135)pointers.set(e.pointerId,{kind:'steer',startX:p.x,x:p.x});
   else pointers.set(e.pointerId,{kind:'throttle',startY:p.y,y:p.y});
   safeCapture(e.pointerId);
  }
  function onMove(e){
   const rec=pointers.get(e.pointerId);if(!rec)return;
   const p=toNative(e.clientX,e.clientY);
   if(rec.kind==='steer')rec.x=p.x;
   else if(rec.kind==='throttle')rec.y=p.y;
  }
  function onUp(e){pointers.delete(e.pointerId);try{canvas.releasePointerCapture(e.pointerId);}catch(_){}}
  function onLostCapture(e){pointers.delete(e.pointerId);}
  canvas.addEventListener('pointerdown',onDown);
  canvas.addEventListener('pointermove',onMove);
  canvas.addEventListener('pointerup',onUp);
  canvas.addEventListener('pointercancel',onUp);
  canvas.addEventListener('lostpointercapture',onLostCapture);
  function onKeyDown(e){
   if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(e.key))e.preventDefault();
   keys.add(e.key);
   if(phase==='results'&&!e.repeat){if(e.key==='Enter'){e.preventDefault();handleResultsTap({x:200,y:420});}else if(e.key==='r'&&!storyRun)runItBack();}
  }
  function onKeyUp(e){keys.delete(e.key);}
  window.addEventListener('keydown',onKeyDown);
  window.addEventListener('keyup',onKeyUp);

  function readInput(){
   let steer=0,throttle=0,buttonSteer=0,hasSteerButton=false;
   ebrakeHeld=keys.has(' ');
   for(const rec of pointers.values()){
    if(rec.kind==='steer')steer=clamp((rec.x-rec.startX)/40,-1,1);
    if(rec.kind==='throttle')throttle=Math.max(throttle,clamp01((rec.startY-rec.y)/60));
    if(rec.kind==='steerButton'){hasSteerButton=true;buttonSteer+=rec.value;}
    if(rec.kind==='throttleButton')throttle=1;
    if(rec.kind==='ebrake')ebrakeHeld=true;
   }
   if(hasSteerButton)steer=clamp(buttonSteer,-1,1);
   if(keys.has('ArrowLeft'))steer=-1;
   if(keys.has('ArrowRight'))steer=1;
   if(keys.has('ArrowUp'))throttle=1;
   if(throttle>0.01||steer!==0||ebrakeHeld)cueUsed=true;
   // Existing half-throttle cruise assist is unchanged; GAS adds speed. noAssist still requires gas.
   input.steer=steer;input.throttle=P.noAssist?throttle:Math.max(throttle,.5);input.ebrake=ebrakeHeld;
   clutchKick=handling.manual&&ebrakeHeld&&throttle>0.5&&!prevThrottleHeld;if(clutchKick)ctx.audio?.sound('CLUTCH_KICK');if(prevThrottleHeld&&throttle<=0.5&&['supra','s15','r34_awd','r34_rwd'].includes(carId))ctx.audio?.sound('BLOWOFF');ctx.audio?.edge('motorhigh',throttle>0.5,motor,'high');
   prevThrottleHeld=throttle>0.5;
  }

  // ---- run lifecycle -------------------------------------------------------
  function bestKey(){return `${course.id}:${carId}`;}
  function runItBack(){if(storyRun)return;clearInput();ctx.audio?.sound('COUNTDOWN');ctx.audio?.sound(motor,'idle');
   course=buildCourse(P.course&&COURSE_THEME[P.course]?P.course:'angeles_crest',Math.floor(Math.random()*1e9));
   state={heading:0,slideAngle:0,speed:0,x:0,distance:0,sliding:false,spinning:false};
   score=0;chain=1;spins=0;maxAngleSeen=0;clipHits=0;wallCooldown=0;tandemScore=0;
   runElapsed=0;phase='run';root.dataset.phase=phase;resultShown=null;cleanTimer=0;rewardedClean=false;cueUsed=false;spunAt=-9;
   lessonCounts={1:0,2:0,3:0,4:0};
   lessonFlash={text:LESSON_WORD[lesson]||null,t:LESSON_WORD[lesson]?1.6:0};
  }
  function endRun(){ctx.audio?.stop(motor);ctx.audio?.stop('TIRE_SQUEAL');
   phase='results';clearInput();root.dataset.phase=phase;
   const prev=ctx.progress();
   const best=Math.max(score,(prev.best&&prev.best[bestKey()])||0);
   const nextBest={...(prev.best||{}),[bestKey()]:best};
   ctx.saveProgress({best:nextBest,runs:(prev.runs||0)+1});
   resultShown={score,best,isNew:score>=best&&score>0};
  }
  const RESULT_BTN_BACK={x:20,y:400,w:110,h:36};
  const RESULT_BTN_DONE={x:150,y:400,w:100,h:36};
  function handleResultsTap(p){
   if(inRect(p,RESULT_BTN_BACK)&&!storyRun){runItBack();return;}
   if(inRect(p,RESULT_BTN_DONE)){
    const result={outcome:tandem?(tandemScore>=(tandem.threshold||3000)?'win':'lose'):'done',score,
     summary:`${Math.round(score)} pts on ${course.theme.label}`,
     data:{course:course.id,car:carId,lessonPassed:lesson?lessonCounts[lesson]>=2:undefined,spins,maxAngle:Math.round(maxAngleSeen),tandemWin:tandem?tandemScore>=(tandem.threshold||3000):undefined}};
    window.RANewOga?.observeTouge?.({course:course.id,result});ctx.finish(result);
   }
  }

  // ---- update ---------------------------------------------------------------
  function update(dt){
   if(phase!=='run')return;
   readInput();
   const wasSliding=state.sliding,wasSpinning=state.spinning;
   state=step(state,{steer:input.steer,throttle:input.throttle,ebrake:input.ebrake,clutchKick},dt,handling);
   ctx.audio?.edge('slide',state.sliding&&!state.spinning,'TIRE_SQUEAL');if(wasSliding&&!state.sliding)ctx.audio?.sound('TIRE_GRIP');if(!wasSpinning&&state.spinning)ctx.audio?.sound('SPINOUT');const absAngle=Math.abs(state.slideAngle);
   maxAngleSeen=Math.max(maxAngleSeen,absAngle);
   if(state.sliding&&!state.spinning){
    ({score,chain}=scoreDrift({score,chain},absAngle,state.speed,dt,handling.maxAngle));
    if(absAngle>30){cleanTimer+=dt;if(cleanTimer>1.5&&!rewardedClean){ctx.reward({memories:['first clean drift']});rewardedClean=true;ctx.audio?.sound('CROWD_CHEER_SMALL');}}
    else cleanTimer=0;
   } else cleanTimer=0;
   if(!wasSliding&&state.sliding)lessonCounts[1]++;
   if(state.sliding){
    const dir=sign(state.slideAngle)||1;
    const oppose=-dir*input.steer;
    if(oppose>0.3&&absAngle>15){if(!episodeCounterOk){lessonCounts[2]++;episodeCounterOk=true;}}
    if(input.throttle>0.6&&absAngle>lastAbsAngle){if(!episodeThrottleOk){lessonCounts[3]++;episodeThrottleOk=true;}}
   } else {episodeCounterOk=false;episodeThrottleOk=false;}
   lastAbsAngle=absAngle;
   if(state.spinning){spins++;chain=1;episodeCounterOk=false;episodeThrottleOk=false;spunAt=runElapsed;}
   if(lesson&&LESSON_WORD[lesson]&&lessonCounts[lesson]===1&&lessonFlash.t<=0){lessonFlash={text:LESSON_WORD[lesson],t:1.1};}
   if(lessonFlash.t>0)lessonFlash.t-=dt;

   const centerX=course.xAt(state.distance);
   const dev=state.x-centerX;
   const half=course.roadWidth/2-8;
   if(Math.abs(dev)>half){
    if(wallCooldown<=0){ctx.audio?.sound('WALL_SCRAPE');chain*=0.85;wallCooldown=0.6;J.burst(135,300,['#ffd36a','#f6efd9','#d7193f'],10,80);J.shake(2);J.float('SCRAPE',135,270,{color:'#d7193f',size:7,life:.6});}
    state.x=centerX+clamp(dev,-half,half);
    state.speed*=0.93;
   }
   wallCooldown=Math.max(0,wallCooldown-dt);

   for(const clip of course.clips){
    if(clip.hit)continue;
    if(Math.abs(clip.distance-state.distance)<14&&state.sliding&&Math.abs(state.x-clip.x)<clip.range*1.35){
     ctx.audio?.sound('CLIP_DING');J.burst(135,310,['#20c66b','#ffd36a','#f6efd9'],16,90);J.float('CLIP!',135,270,{color:'#20c66b',size:9,life:.8});J.flash('#20c66b',90);clip.hit=true;clipHits++;lessonCounts[4]++;
     ({score,chain}=scoreClip({score,chain}));
    }
   }

   if(tandem){
    const idealGap=90;
    const rivalDistance=tandem.role==='lead'?state.distance+idealGap:state.distance-idealGap;
    const gapErr=Math.abs((state.distance-rivalDistance)-(tandem.role==='lead'?-idealGap:idealGap));
    if(state.sliding)tandemScore+=Math.max(0,40-gapErr*0.4)*dt*10;
   }

   passengerTimer-=dt;
   if(passengerTimer<=0&&passengerName){
    passengerBubble={text:PASSENGER_LINES[Math.floor(Math.random()*PASSENGER_LINES.length)],t:1.6,vp:false};
    passengerTimer=4+Math.random()*4;
   }
   if(passengerBubble){passengerBubble.t-=dt;if(passengerBubble.t<=0)passengerBubble=null;}

   runElapsed+=dt;
   if(state.distance>=course.length||runElapsed>(Number(P.durationSeconds)||90))endRun();
  }

  // ---- draw -------------------------------------------------------------
  function screenXforWorld(wx){return 135+wx-course.xAt(state.distance);}
  function draw(){
   const theme=course.theme;
   c.fillStyle=theme.sky;c.fillRect(0,0,270,480);
   const carY=400,band=6;
   for(let y=480;y>=0;y-=band){
    const d=state.distance+(carY-y);
    const cx=screenXforWorld(course.xAt(d));
    const left=cx-course.roadWidth/2,right=cx+course.roadWidth/2;
    RAPixel.rect(c,0,y-band,270,band,theme.floor);
    RAPixel.rect(c,left,y-band,right-left,band,theme.road);
    RAPixel.rect(c,left-3,y-band,3,band,'#d7193f');
    RAPixel.rect(c,right,y-band,3,band,'#d7193f');
   }
   if(rain){for(let i=0;i<50;i++){const rx=(i*53+state.distance*2)%270,ry=(i*97+state.distance*3)%480;RAPixel.rect(c,rx,ry,1,6,'rgba(170,200,255,.3)');}}
   for(const clip of course.clips){
    const d=clip.distance;
    if(d<state.distance-20||d>state.distance+500)continue;
    const sy=carY-(d-state.distance);
    const sx=screenXforWorld(clip.x);
    const glow=rain?'#fff59a':'#ffd23a';
    RAPixel.rect(c,sx-2,sy-2,4,4,clip.hit?'#3a3a30':glow);
   }
   if(tandem){
    const rd=tandem.role==='lead'?state.distance+90:state.distance-90;
    const sy=carY-(rd-state.distance);
    const sx=screenXforWorld(course.xAt(clamp(rd,0,course.length)));
    if(sy>-20&&sy<500)drawCar(sx,sy,0,0,'#20c66b',0.85,rivalSprite);
   }
   if(P.escapeRunner){
    const runnerY=170+Math.sin(runElapsed*9)*2,runnerX=screenXforWorld(course.xAt(Math.min(course.length,state.distance+230)));
    RAPixel.rect(c,runnerX-3,runnerY-7,6,7,'#777');RAPixel.rect(c,runnerX-4,runnerY,3,7,'#555');RAPixel.rect(c,runnerX+1,runnerY,3,7,'#555');
    RAPixel.text(c,String(P.escapeRunner).toUpperCase(),runnerX,runnerY-14,{size:5,align:'center',color:'#f6efd9'});
   }
   drawCar(screenXforWorld(state.x),carY,state.heading,state.slideAngle,handling.color,1,carSprite);

   // HUD (avoid top-right 60x24 quit zone)
   RAPixel.text(c,`${Math.round(score)}`,6,4,{size:10,color:'#f6efd9'});
   RAPixel.text(c,`x${chain.toFixed(1)}`,6,18,{size:7,color:'#c18b3c'});
   {const face=runElapsed-spunAt<1.2?hudFaces.touge_spun:state.sliding?hudFaces.touge_locked:null;if(face?.complete&&face.naturalWidth){c.imageSmoothingEnabled=false;c.drawImage(face,18,4,44,46,4,30,44,46);}}
   RAPixel.text(c,`${Math.round(state.slideAngle)}°`,6,84,{size:7,color:Math.abs(state.slideAngle)>15?'#20c66b':'#6b6780',baseline:'bottom'});
   RAPixel.text(c,`${Math.max(0,Math.ceil((Number(P.durationSeconds)||90)-runElapsed))}s LEFT`,264,84,{size:7,align:'right',baseline:'bottom',color:'#f6efd9'});
   RAPixel.text(c,`${Math.round(state.speed)} KM/H`,135,84,{size:6,align:'center',baseline:'bottom',color:'#ffd36a'});
   if(tandem){RAPixel.rect(c,64,42,142,20,'#17142c');RAPixel.text(c,`CHASE ${Math.round(tandemScore)}/${tandem.threshold||3000}`,135,48,{size:6,align:'center',color:'#ffd36a'});}
   if(P.escapeRunner){RAPixel.rect(c,64,42,142,20,'#17142c');RAPixel.text(c,'KEEP THE ESCAPE CLOSE',135,48,{size:6,align:'center',color:'#ffd36a'});}
   root.dataset.speed=String(Math.round(state.speed));root.dataset.score=String(Math.round(score));root.dataset.tandemScore=String(Math.round(tandemScore));
   if(passengerBubble&&passengerName){if(passengerSprite?.complete&&passengerSprite.naturalWidth){c.imageSmoothingEnabled=false;c.drawImage(passengerSprite,16,10,46,46,220,30,46,46);}RAPixel.text(c,`${passengerName}: ${passengerBubble.text}`,135,40,{size:6,align:'center',color:'#ff6fb5'});}
   if(lessonFlash.t>0&&lessonFlash.text){RAPixel.text(c,lessonFlash.text,135,220,{size:12,align:'center',color:'#20c66b'});}
   if(phase==='run'){
    if(!cueUsed&&runElapsed<8){
     RAPixel.text(c,'HOLD BUTTONS BELOW TO DRIVE',135,256,{size:6,align:'center',color:'#f6efd9'});
     RAPixel.text(c,P.noAssist?'HOLD GAS TO MOVE':'AUTO-CRUISE ON / GAS ADDS SPEED',135,268,{size:6,align:'center',color:'#ffd36a'});
     RAPixel.text(c,'ARROWS = DRIVE / SPACE = E-BRAKE',135,280,{size:5,align:'center',color:'#c9c0a8'});
    }
    if(state.sliding&&!state.spinning&&Math.abs(state.slideAngle)>15)RAPixel.text(c,'DRIFT',135,352,{size:6,align:'center',color:'#20c66b'});
    for(const b of DRIVE_BUTTONS){
     const held=b.kind==='steerButton'?(b.value<0?input.steer<0:input.steer>0):b.kind==='throttleButton'?prevThrottleHeld:ebrakeHeld;
     RAPixel.frame(c,b.x,b.y,b.w,b.h,{fill:held?'#f6efd9':'#17142c',border:held?'#ffd36a':'#f6efd9',accent:held?'#ffd36a':'#7d194b'});
     RAPixel.text(c,b.label,b.x+b.w/2,b.y+11,{size:6,align:'center',color:held?'#10101b':'#f6efd9',shadow:null});
     RAPixel.text(c,held?'HELD':'HOLD',b.x+b.w/2,b.y+29,{size:5,align:'center',color:held?'#7d194b':'#c9c0a8',shadow:null});
    }
   }
   // Read-only live input markers; they do not participate in physics or settlement.
   root.dataset.steer=String(input.steer);root.dataset.throttle=String(input.throttle);root.dataset.ebrake=String(input.ebrake);root.dataset.pointers=String(pointers.size);

   if(phase==='results')drawResults();
  }
  function drawCar(x,y,heading,slide,color,alpha,sprite=null){
   c.save();c.globalAlpha=alpha;c.translate(Math.round(x),Math.round(y));c.rotate((heading-slide*0.4)*Math.PI/180);
   // Frozen sprite at native 1:1 pixels, centred on the car's physics centre (never stretched or smoothed).
   if(sprite?.complete&&sprite.naturalWidth){c.imageSmoothingEnabled=false;c.drawImage(sprite,-sprite.naturalWidth/2,-sprite.naturalHeight/2);c.restore();return;}
   RAPixel.rect(c,-6,-11,12,22,color);
   RAPixel.rect(c,-6,-11,12,5,'rgba(0,0,0,.35)');
   RAPixel.rect(c,-6,4,12,4,'#151018');
   c.restore();
  }
  function drawResults(){
   RAPixel.frame(c,15,60,240,320,{fill:'#17142c',border:'#f6efd9',accent:'#7d194b'});
   RAPixel.text(c,'RUN COMPLETE',135,80,{size:9,align:'center',color:'#f6efd9'});
   RAPixel.text(c,`SCORE ${Math.round(resultShown.score)}`,135,110,{size:9,align:'center',color:'#20c66b'});
   RAPixel.text(c,`BEST ${Math.round(resultShown.best)}`,135,128,{size:7,align:'center',color:'#c18b3c'});
   if(lesson)RAPixel.text(c,`LESSON ${lessonCounts[lesson]>=2?'PASSED':'TRY AGAIN'}`,135,146,{size:6,align:'center',color:lessonCounts[lesson]>=2?'#20c66b':'#d7193f'});
   let ly=170;
   const board=[...leaderboard,{name:'YOU',score:resultShown.score,you:true}].sort((a,b)=>b.score-a.score).slice(0,5);
   for(const row of board){RAPixel.text(c,`${row.you?'>':' '}${row.name} ${Math.round(row.score)}`,30,ly,{size:6,color:row.you?'#20c66b':'#f6efd9'});ly+=12;}
   if(!storyRun){RAPixel.rect(c,RESULT_BTN_BACK.x,RESULT_BTN_BACK.y,RESULT_BTN_BACK.w,RESULT_BTN_BACK.h,'#f6efd9');RAPixel.text(c,'RUN IT BACK',RESULT_BTN_BACK.x+RESULT_BTN_BACK.w/2,RESULT_BTN_BACK.y+RESULT_BTN_BACK.h/2-4,{size:6,align:'center',color:'#10101b',shadow:null});}
   if(tandem){const won=tandemScore>=(tandem.threshold||3000);RAPixel.text(c,won?'CHASE WON':'CHASE LOST',135,254,{size:8,align:'center',color:won?'#20c66b':'#ff6fb5'});RAPixel.text(c,`CHASE ${Math.round(tandemScore)} / ${tandem.threshold||3000}`,135,275,{size:6,align:'center'});}
   RAPixel.text(c,`CLEAN CLIPS ${clipHits} · SPINS ${spins}`,135,310,{size:6,align:'center'});RAPixel.text(c,storyRun?'DONE RETURNS THIS RESULT TO THE STORY':'R = RETRY · ENTER = DONE',135,340,{size:5,align:'center',color:'#ffd36a'});
   RAPixel.rect(c,RESULT_BTN_DONE.x,RESULT_BTN_DONE.y,RESULT_BTN_DONE.w,RESULT_BTN_DONE.h,'#f6efd9');
   RAPixel.text(c,'DONE',RESULT_BTN_DONE.x+RESULT_BTN_DONE.w/2,RESULT_BTN_DONE.y+RESULT_BTN_DONE.h/2-4,{size:6,align:'center',color:'#10101b',shadow:null});
  }

  let raf=null,last=null;
  function loop(t){
   if(last==null)last=t;
   const dt=Math.min(0.05,(t-last)/1000);last=t;
   J.update(dt);update(dt);J.begin();draw();J.end();
   raf=requestAnimationFrame(loop);
  }
  raf=requestAnimationFrame(loop);

  return {dispose(){
   if(raf)cancelAnimationFrame(raf);
   canvas.removeEventListener('pointerdown',onDown);
   canvas.removeEventListener('pointermove',onMove);
   canvas.removeEventListener('pointerup',onUp);
   canvas.removeEventListener('pointercancel',onUp);
   canvas.removeEventListener('lostpointercapture',onLostCapture);
   window.removeEventListener('keydown',onKeyDown);
   window.removeEventListener('keyup',onKeyUp);window.removeEventListener('blur',blur);clearInput();
  }};
 }

 window.RAMinigames.register('touge',{title:'TOUGE',rule:'Hold LEFT or RIGHT to steer, GAS for speed, and E-BRAKE to slide; use two fingers together or arrows + Space.',mount});
})();
