window.RABuild3C2Install=function(){
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
  const handling=computeHandling(carId,parts); const dice=()=>window.RABuild3?.enabled('S02')&&window.RABuild3.state().once['S02:dice']; const styleBonus=()=>dice()?1.1:1;
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
  let course=P.build3S02?{id:'S02-LOT',theme:{sky:'#101523',floor:'#242b35',road:'#333b44',stars:0,label:''},length:3000,roadWidth:240,clips:[],xAt:d=>Math.sin(d/350)*25}:buildCourse(P.course&&COURSE_THEME[P.course]?P.course:'angeles_crest',P.seed||Math.floor(Math.random()*1e9));

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
  const pointers=new Map();
  const storyRun=!!(tandem||P.escapeRunner||window.RAAdventures?.active?.());
  let ebrakeHeld=false,prevThrottleHeld=false,clutchKick=false;
  function clearInput(){keys.clear();for(const id of pointers.keys()){try{canvas.releasePointerCapture(id);}catch(_){}}pointers.clear();ebrakeHeld=false;prevThrottleHeld=false;clutchKick=false;}
  function blur(){clearInput();}
  window.addEventListener('blur',blur);
  const EBRAKE_RECT={x:156,y:292,w:104,h:46};
  function toNative(clientX,clientY){const r=canvas.getBoundingClientRect();return{x:(clientX-r.left)*270/(r.width||270),y:(clientY-r.top)*480/(r.height||480)};}
  function inRect(p,rct){return p.x>=rct.x&&p.x<=rct.x+rct.w&&p.y>=rct.y&&p.y<=rct.y+rct.h;}
  function safeCapture(id){try{canvas.setPointerCapture&&canvas.setPointerCapture(id);}catch(e){}}
  function onDown(e){
   e.preventDefault();const p=toNative(e.clientX,e.clientY);
   if(phase==='results'){handleResultsTap(p);return;}
   if(inRect(p,EBRAKE_RECT)){ebrakeHeld=true;pointers.set(e.pointerId,{kind:'ebrake'});safeCapture(e.pointerId);return;}
   if(p.x<135){pointers.set(e.pointerId,{kind:'steer',startX:p.x,x:p.x});}
   else{pointers.set(e.pointerId,{kind:'throttle',startY:p.y,y:p.y});}
   safeCapture(e.pointerId);
  }
  function onMove(e){
   const rec=pointers.get(e.pointerId);if(!rec)return;
   const p=toNative(e.clientX,e.clientY);
   if(rec.kind==='steer')rec.x=p.x;
   else if(rec.kind==='throttle')rec.y=p.y;
  }
  function onUp(e){
   const rec=pointers.get(e.pointerId);
   if(rec&&rec.kind==='ebrake')ebrakeHeld=false;
   try{canvas.releasePointerCapture(e.pointerId);}catch(_){}pointers.delete(e.pointerId);
  }
  canvas.addEventListener('pointerdown',onDown);
  canvas.addEventListener('pointermove',onMove);
  canvas.addEventListener('pointerup',onUp);
  canvas.addEventListener('pointercancel',onUp);
  const keys=new Set();
  function onKeyDown(e){
   if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(e.key))e.preventDefault();
   keys.add(e.key);
   if(e.key===' ')ebrakeHeld=true;
   if(phase==='results'&&!e.repeat){if(e.key==='Enter'){e.preventDefault();handleResultsTap({x:200,y:420});}else if(e.key==='r'&&!storyRun&&!P.build3S02)runItBack();}
  }
  function onKeyUp(e){keys.delete(e.key);if(e.key===' ')ebrakeHeld=false;}
  window.addEventListener('keydown',onKeyDown);
  window.addEventListener('keyup',onKeyUp);

  function readInput(){
   let steer=0,throttle=0;
   for(const rec of pointers.values()){
    if(rec.kind==='steer')steer=clamp((rec.x-rec.startX)/40,-1,1);
    if(rec.kind==='throttle')throttle=clamp01((rec.startY-rec.y)/60);
   }
   if(keys.has('ArrowLeft'))steer=-1;
   if(keys.has('ArrowRight'))steer=1;
   if(keys.has('ArrowUp'))throttle=1;
   if(throttle>0.01||steer!==0)cueUsed=true; // first-time control cue hides as soon as the player uses input
   // RC2: cruise assist. The car holds half throttle on its own, so a new player only has to steer. Pull up on the right for more.
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
   runElapsed=0;phase='run';root.dataset.phase=phase;resultShown=null;cleanTimer=0;rewardedClean=false;spunAt=-9;
   lessonCounts={1:0,2:0,3:0,4:0};
   lessonFlash={text:LESSON_WORD[lesson]||null,t:LESSON_WORD[lesson]?1.6:0};
  }
  function endRun(){ctx.audio?.stop(motor);ctx.audio?.stop('TIRE_SQUEAL');
   phase='results';clearInput();root.dataset.phase=phase;
   if(P.build3S02&&!rewardedClean){phase='run';root.dataset.phase=phase;runElapsed=0;return;} const prev=ctx.progress();
   const best=Math.max(score,(prev.best&&prev.best[bestKey()])||0);
   const nextBest={...(prev.best||{}),[bestKey()]:best};
   if(!P.build3S02)ctx.saveProgress({best:nextBest,runs:(prev.runs||0)+1});
   resultShown={score,best,isNew:score>=best&&score>0};
  }
  const RESULT_BTN_BACK={x:20,y:400,w:110,h:36};
  const RESULT_BTN_DONE={x:150,y:400,w:100,h:36};
  function handleResultsTap(p){
   if(inRect(p,RESULT_BTN_BACK)&&!storyRun&&!P.build3S02){runItBack();return;}
   if(inRect(p,RESULT_BTN_DONE)){
    const result={outcome:tandem?(tandemScore>=(tandem.threshold||3000)?'win':'lose'):'done',score,
     summary:`${Math.round(score)} pts on ${course.theme.label}`,
     data:{...(P.build3S02?{clean:rewardedClean}:{}),course:course.id,car:carId,lessonPassed:lesson?lessonCounts[lesson]>=2:undefined,spins,maxAngle:Math.round(maxAngleSeen),tandemWin:tandem?tandemScore>=(tandem.threshold||3000):undefined}};
    if(P.build3S02){delete result.score;result.summary='';ctx.finish(result);}else{window.RANewOga?.observeTouge?.({course:course.id,result});ctx.finish(result);}
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
    ({score,chain}=scoreDrift({score,chain},absAngle,state.speed,dt*styleBonus(),handling.maxAngle));
    if(absAngle>30){cleanTimer+=dt;if(cleanTimer>1.5&&!rewardedClean){ctx.reward({memories:['first clean drift']});rewardedClean=true;if(P.build3S02)root.dataset.clean='true';ctx.audio?.sound('CROWD_CHEER_SMALL');}}
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
     score+=clipBonus(chain)*styleBonus();chain=nextChain(chain);
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
    if(sy>-20&&sy<500){if(P.build3C2){RAPixel.rect(c,sx-9,sy-4,3,2,'#fff7ce');RAPixel.rect(c,sx+6,sy-4,3,2,'#fff7ce');RAPixel.rect(c,sx-9,sy+6,3,2,'#d7193f');RAPixel.rect(c,sx+6,sy+6,3,2,'#d7193f');}else drawCar(sx,sy,0,0,'#20c66b',0.85,rivalSprite);}
   }
   if(P.escapeRunner){
    const runnerY=170+Math.sin(runElapsed*9)*2,runnerX=screenXforWorld(course.xAt(Math.min(course.length,state.distance+230)));
    RAPixel.rect(c,runnerX-3,runnerY-7,6,7,'#777');RAPixel.rect(c,runnerX-4,runnerY,3,7,'#555');RAPixel.rect(c,runnerX+1,runnerY,3,7,'#555');
    RAPixel.text(c,String(P.escapeRunner).toUpperCase(),runnerX,runnerY-14,{size:5,align:'center',color:'#f6efd9'});
   }
   if(P.build3S02)for(let i=0;i<18;i++){const x=i%2?248:22,y=80+Math.floor(i/2)*35;RAPixel.rect(c,x-6,y-10,12,22,'#666f84');RAPixel.rect(c,x-6,y-10,3,3,state.sliding&&Math.abs(state.slideAngle)>30?'#fffbe0':'#8190a5');RAPixel.rect(c,x+3,y-10,3,3,state.sliding&&Math.abs(state.slideAngle)>30?'#fffbe0':'#8190a5');}drawCar(screenXforWorld(state.x),carY,state.heading,state.slideAngle,handling.color,1,carSprite);

   // HUD (avoid top-right 60x24 quit zone)
   if(!P.build3S02)RAPixel.text(c,`${Math.round(score)}`,6,4,{size:10,color:'#f6efd9'});
   if(!P.build3S02)RAPixel.text(c,`x${chain.toFixed(1)}`,6,18,{size:7,color:'#c18b3c'});
   {const face=runElapsed-spunAt<1.2?hudFaces.touge_spun:state.sliding?hudFaces.touge_locked:null;if(face?.complete&&face.naturalWidth){c.imageSmoothingEnabled=false;c.drawImage(face,18,4,44,46,4,30,44,46);}}
   RAPixel.text(c,`${Math.round(state.slideAngle)}°`,6,468,{size:7,color:Math.abs(state.slideAngle)>15?'#20c66b':'#6b6780',baseline:'bottom'});
   RAPixel.text(c,`${Math.max(0,Math.ceil((Number(P.durationSeconds)||90)-runElapsed))}s LEFT`,264,468,{size:7,align:'right',baseline:'bottom',color:'#f6efd9'});
   RAPixel.text(c,`${Math.round(state.speed)} KM/H`,135,468,{size:6,align:'center',baseline:'bottom',color:'#ffd36a'});
   if(tandem){RAPixel.rect(c,64,42,142,20,'#17142c');RAPixel.text(c,`CHASE ${Math.round(tandemScore)}/${tandem.threshold||3000}`,135,48,{size:6,align:'center',color:'#ffd36a'});}
   if(P.escapeRunner){RAPixel.rect(c,64,42,142,20,'#17142c');RAPixel.text(c,'KEEP THE ESCAPE CLOSE',135,48,{size:6,align:'center',color:'#ffd36a'});}
   root.dataset.speed=String(Math.round(state.speed));root.dataset.score=String(Math.round(score));root.dataset.tandemScore=String(Math.round(tandemScore));
   if(passengerBubble&&passengerName){if(passengerSprite?.complete&&passengerSprite.naturalWidth){c.imageSmoothingEnabled=false;c.drawImage(passengerSprite,16,10,46,46,220,30,46,46);}RAPixel.text(c,`${passengerName}: ${passengerBubble.text}`,135,40,{size:6,align:'center',color:'#ff6fb5'});}
   if(lessonFlash.t>0&&lessonFlash.text){RAPixel.text(c,lessonFlash.text,135,220,{size:12,align:'center',color:'#20c66b'});}
   // First-time control cue (presentation only; hidden once the player has used any input) so a new player can make the
   // car move and steer. No physics, scoring or difficulty change.
   if(!cueUsed&&runElapsed<8){RAPixel.text(c,'HOLD UP = GAS',135,266,{size:6,align:'center',color:'#c9c0a8'});RAPixel.text(c,'LEFT / RIGHT = STEER',135,278,{size:6,align:'center',color:'#c9c0a8'});RAPixel.text(c,'E-BRAKE = SLIDE',135,290,{size:6,align:'center',color:'#c9c0a8'});}
   if(state.sliding&&!state.spinning&&Math.abs(state.slideAngle)>15)RAPixel.text(c,'DRIFT',135,352,{size:6,align:'center',color:'#20c66b'});
   RAPixel.rect(c,EBRAKE_RECT.x,EBRAKE_RECT.y,EBRAKE_RECT.w,EBRAKE_RECT.h,ebrakeHeld?'#d7193f':'#7d194b');
   RAPixel.text(c,'E-BRAKE',EBRAKE_RECT.x+EBRAKE_RECT.w/2,EBRAKE_RECT.y+EBRAKE_RECT.h/2-4,{size:7,align:'center',color:'#f6efd9'});

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
  function drawResults(){if(P.build3S02){RAPixel.text(c,'THE HEADLIGHTS FLASH.',135,110,{size:8,align:'center',color:'#e2e8ff'});RAPixel.rect(c,RESULT_BTN_DONE.x,RESULT_BTN_DONE.y,RESULT_BTN_DONE.w,RESULT_BTN_DONE.h,'#f6efd9');RAPixel.text(c,'DONE',200,414,{size:6,align:'center',color:'#10101b'});return;}
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
   window.removeEventListener('keydown',onKeyDown);
   window.removeEventListener('keyup',onKeyUp);window.removeEventListener('blur',blur);clearInput();
  }};
 }

 window.RAMinigames.register('C2',{title:'C2',rule:'Drag on the left side to steer, drag up on the right for more gas, and slide through the bends to score.',mount});
};
/* BUILD-3 private runtime; never publish on an OPEN ref. */
// Private policy is evaluated before any stage installs or seeds state.
window.RARC3PrivatePolicy={
 schema:1,
 patch:['ARC-X','H2','H5','H6','S02','S03','S04','S06','S07','S08','M1','C1','C2','C4','VP-ECO','P3','P4'],
 subpatch:['G7/SET','LM/expression','SPK/clip','SPK/drift','SPK/song','SPK/party','SPK/arc','SPK/kid','SPK/podcast','SPK/dragon','SPK/remix','H1/A09','H1/DATE','H1/A_SMACK2','H1/A29C','H1/A07','H7/close','H3/date']
};

window.RABuild3AudioOL050={"ruling":"OL-050","ref":"40fd2bc02e4793380fbf9f6cb04c95113a46db11","entries":[{"id":"GX_01","bus":"SFX","type":"loop","category":"garage","gain":1,"pitchJitter":0,"maxVoices":1,"priority":2,"loopStart":0,"loopEnd":59.677,"variations":[],"parts":[],"file":"assets/sealed/audio/GX_01.mp3","expectedPath":"assets/audio/sfx/garage/AMB_GARAGE_ECHO.mp3","registered":true,"licenseClass":"CC0","attributionRequired":false,"license":"CC0 (public-domain equivalent)","credit":"No attribution required (CC0).","author":"Joseph Sardin","sourceSite":"BigSoundBank","sourceUrl":"https://bigsoundbank.com/UPLOAD/mp3/0604.mp3","sourceId":"AMB_GARAGE_ECHO","ol050":true},{"id":"GX_02","bus":"SFX","type":"one-shot","category":"touge","gain":1,"pitchJitter":0,"maxVoices":3,"priority":3,"loopStart":null,"loopEnd":null,"variations":[],"parts":[],"file":"assets/sealed/audio/GX_02.mp3","expectedPath":"assets/audio/sfx/touge/CROWD_CHEER_SMALL.mp3","registered":true,"licenseClass":"CC-BY-4.0","attributionRequired":true,"license":"CC BY 4.0","credit":"small crowd cheering and clapping 3 by Tomlija — CC BY 4.0","author":"Tomlija","sourceSite":"freesound.org","sourceUrl":"https://freesound.org/people/Tomlija/sounds/100904/","sourceId":"CROWD_CHEER_SMALL","ol050":true},{"id":"GX_03","bus":"MUSIC","type":"loop","category":"locations","gain":1,"pitchJitter":0,"maxVoices":1,"priority":2,"loopStart":0,"loopEnd":59.7,"variations":[],"parts":[],"file":"assets/sealed/audio/GX_03.mp3","expectedPath":"assets/audio/sfx/locations/AMB_RAVE_INT.mp3","registered":true,"licenseClass":"MIXKIT","attributionRequired":false,"license":"Mixkit Sound Effects Free License - free for commercial use, no attribution required","credit":"","author":"Mixkit (individual authors not listed)","sourceSite":"mixkit.co (SFX) + original synthesis","sourceUrl":"https://assets.mixkit.co/active_storage/sfx/518/518-preview.mp3 ; https://assets.mixkit.co/active_storage/sfx/522/522-preview.mp3 ; https://assets.mixkit.co/active_storage/sfx/424/424-preview.mp3","restrictions":["must ship as part of a game, not as a standalone library"],"sourceId":"AMB_RAVE_INT","ol050":true},{"id":"GX_04","bus":"SFX","type":"one-shot","category":"combat","gain":1,"pitchJitter":0,"maxVoices":3,"priority":4,"loopStart":null,"loopEnd":null,"variations":[],"parts":[],"file":"assets/sealed/audio/GX_04.mp3","expectedPath":"assets/audio/sfx/combat/HIT_HEAVY.mp3","registered":true,"licenseClass":"CC0","attributionRequired":false,"license":"CC0 1.0","credit":"","author":"Kenney (Kenney Vleugels)","sourceSite":"kenney.nl","sourceUrl":"https://kenney.nl/media/pages/assets/impact-sounds/87b4ddecda-1677589768/kenney_impact-sounds.zip","sourceId":"HIT_HEAVY","ol050":true},{"id":"GX_05","bus":"SFX","type":"one-shot","category":"ui_phone","gain":1,"pitchJitter":0,"maxVoices":3,"priority":3,"loopStart":null,"loopEnd":null,"variations":[],"parts":[],"file":"assets/sealed/audio/GX_05.mp3","expectedPath":"assets/audio/sfx/ui_phone/TRAVEL_WHOOSH.mp3","registered":true,"licenseClass":"CC0","attributionRequired":false,"license":"CC0 1.0 (original work, no encumbrance)","credit":"","author":"Everest (original synthesis)","sourceSite":"Original work — synthesized in-project (numpy/ffmpeg)","sourceUrl":"","sourceId":"TRAVEL_WHOOSH","ol050":true},{"id":"GX_06","bus":"SFX","type":"one-shot","category":"story","gain":1,"pitchJitter":0,"maxVoices":3,"priority":3,"loopStart":null,"loopEnd":null,"variations":[],"parts":[],"file":"assets/sealed/audio/GX_06.mp3","expectedPath":"assets/audio/sfx/story/SENSEI_RUMBLE.mp3","registered":true,"licenseClass":"CC0","attributionRequired":false,"license":"CC0 1.0","credit":"","author":"Kinoton","sourceSite":"freesound.org","sourceUrl":"https://freesound.org/people/Kinoton/sounds/393819/","sourceId":"SENSEI_RUMBLE","ol050":true},{"id":"GX_07","bus":"SFX","type":"one-shot","category":"combat","gain":1,"pitchJitter":0,"maxVoices":3,"priority":3,"loopStart":null,"loopEnd":null,"variations":[],"parts":[],"file":"assets/sealed/audio/GX_07.mp3","expectedPath":"assets/audio/sfx/combat/MOVE_OCTOPUS.mp3","registered":true,"licenseClass":"MIXKIT","attributionRequired":false,"license":"Royalty-free (Mixkit Sound Effects License), no attribution required + CC0 1.0 (original synth, no encumbrance)","credit":"","author":"Mixkit + Everest (original synthesis)","sourceSite":"mixkit.co + Original work — synthesized in-project (numpy/ffmpeg)","sourceUrl":"https://assets.mixkit.co/active_storage/sfx/2866/2866-preview.mp3","restrictions":["must ship as part of a game, not as a standalone library"],"sourceId":"MOVE_OCTOPUS","ol050":true},{"id":"GX_08","bus":"SFX","type":"one-shot","category":"story","gain":1,"pitchJitter":0,"maxVoices":3,"priority":3,"loopStart":null,"loopEnd":null,"variations":[],"parts":[],"file":"assets/sealed/audio/GX_08.mp3","expectedPath":"assets/audio/sfx/story/HOLY_CHOIR_COMEDIC.mp3","registered":true,"licenseClass":"CC0","attributionRequired":false,"license":"CC0 1.0","credit":"","author":"random_intruder","sourceSite":"freesound.org","sourceUrl":"https://freesound.org/people/random_intruder/sounds/392172/","sourceId":"HOLY_CHOIR_COMEDIC","ol050":true},{"id":"OL050_MONTANA","title":"MONTANA","file":"assets/audio/music/in_montana.mp3","bus":"MUSIC","type":"one-shot","gain":1,"pitchJitter":0,"maxVoices":1,"priority":3,"loopStart":null,"loopEnd":null,"parts":[],"variations":[],"registered":true,"licenseClass":"AUTHOR_SUPPLIED","license":"User-authorized private game delivery","attributionRequired":false,"credit":"UBE","author":"UBE","ol050":true},{"id":"OL050_OCTOPUS","title":"OCTOPUS BRAIN","file":"assets/bloodbath_mix3.wav","bus":"MUSIC","type":"one-shot","gain":1,"pitchJitter":0,"maxVoices":1,"priority":3,"loopStart":null,"loopEnd":null,"parts":[],"variations":[],"registered":true,"licenseClass":"AUTHOR_SUPPLIED","license":"Existing accepted game master","attributionRequired":false,"credit":"UBE","author":"UBE","ol050":true},{"id":"OL050_HOUSE","bus":"MUSIC","type":"loop","category":"locations","gain":1,"pitchJitter":0,"maxVoices":1,"priority":2,"loopStart":0,"loopEnd":59.7,"variations":[],"parts":[],"file":"assets/sealed/audio/OL050_HOUSE.mp3","expectedPath":"assets/audio/sfx/locations/AMB_RAVE_INT.mp3","registered":true,"licenseClass":"MIXKIT","attributionRequired":false,"license":"Mixkit Sound Effects Free License - free for commercial use, no attribution required","credit":"","author":"Mixkit (individual authors not listed)","sourceSite":"mixkit.co (SFX) + original synthesis","sourceUrl":"https://assets.mixkit.co/active_storage/sfx/518/518-preview.mp3 ; https://assets.mixkit.co/active_storage/sfx/522/522-preview.mp3 ; https://assets.mixkit.co/active_storage/sfx/424/424-preview.mp3","restrictions":["must ship as part of a game, not as a standalone library"],"sourceId":"AMB_RAVE_INT","ol050":true},{"id":"C4","title":"RICH ALUCARD × BRITNEY STAKES × ANFEESA — (untitled)","file":"assets/sealed/audio/C4.wav","bus":"MUSIC","type":"one-shot","gain":1,"pitchJitter":0,"maxVoices":1,"priority":3,"loopStart":null,"loopEnd":null,"parts":[],"variations":[],"registered":true,"licenseClass":"AUTHOR_SUPPLIED","license":"User-authorized private game delivery","attributionRequired":false,"credit":"UBE","author":"UBE","ol050":true}],"music":{"MONTANA":{"id":"OL050_MONTANA","title":"MONTANA","file":"assets/audio/music/in_montana.mp3","bus":"MUSIC","type":"one-shot","gain":1,"pitchJitter":0,"maxVoices":1,"priority":3,"loopStart":null,"loopEnd":null,"parts":[],"variations":[],"registered":true,"licenseClass":"AUTHOR_SUPPLIED","license":"User-authorized private game delivery","attributionRequired":false,"credit":"UBE","author":"UBE","ol050":true,"tempo":81,"duration":45.82691609977324,"matched":true,"sourceHash":"f64e34cd4bc0f0c6cd7bbe43ea6272437c910e36048396fd781a73cf3572e10d","source":"assets/audio/music/in_montana.mp3","status":"UBE-SONG-RC2"},"OCTOPUS":{"id":"OL050_OCTOPUS","title":"OCTOPUS BRAIN","file":"assets/bloodbath_mix3.wav","bus":"MUSIC","type":"one-shot","gain":1,"pitchJitter":0,"maxVoices":1,"priority":3,"loopStart":null,"loopEnd":null,"parts":[],"variations":[],"registered":true,"licenseClass":"AUTHOR_SUPPLIED","license":"Existing accepted game master","attributionRequired":false,"credit":"UBE","author":"UBE","ol050":true,"tempo":152,"duration":45.82691609977324,"matched":false,"sourceHash":"0a58fe8211548760f762d463938c3e0fe5d608cdd5fb858a19d9985d11df5045","source":"assets/bloodbath_mix3.wav","patch":"PATCH-1.01-AUDIO"},"BLOODBATH":{"id":"bloodbath","title":"BLOODBATH","file":"assets/bloodbath_mix3.wav","tempo":129,"duration":45.82691609977324,"matched":true,"sourceHash":"0a58fe8211548760f762d463938c3e0fe5d608cdd5fb858a19d9985d11df5045"},"XENORIUS":{"id":"GX_03","bus":"MUSIC","type":"loop","category":"locations","gain":1,"pitchJitter":0,"maxVoices":1,"priority":2,"loopStart":0,"loopEnd":59.7,"variations":[],"parts":[],"file":"assets/sealed/audio/GX_03.mp3","expectedPath":"assets/audio/sfx/locations/AMB_RAVE_INT.mp3","registered":true,"licenseClass":"MIXKIT","attributionRequired":false,"license":"Mixkit Sound Effects Free License - free for commercial use, no attribution required","credit":"","author":"Mixkit (individual authors not listed)","sourceSite":"mixkit.co (SFX) + original synthesis","sourceUrl":"https://assets.mixkit.co/active_storage/sfx/518/518-preview.mp3 ; https://assets.mixkit.co/active_storage/sfx/522/522-preview.mp3 ; https://assets.mixkit.co/active_storage/sfx/424/424-preview.mp3","restrictions":["must ship as part of a game, not as a standalone library"],"sourceId":"AMB_RAVE_INT","ol050":true,"title":"XENORIUS SET","tempo":135,"duration":59.7,"matched":false,"substitution":"OL-050 C.1"},"HOUSE":{"id":"OL050_HOUSE","bus":"MUSIC","type":"loop","category":"locations","gain":1,"pitchJitter":0,"maxVoices":1,"priority":2,"loopStart":0,"loopEnd":59.7,"variations":[],"parts":[],"file":"assets/sealed/audio/OL050_HOUSE.mp3","expectedPath":"assets/audio/sfx/locations/AMB_RAVE_INT.mp3","registered":true,"licenseClass":"MIXKIT","attributionRequired":false,"license":"Mixkit Sound Effects Free License - free for commercial use, no attribution required","credit":"","author":"Mixkit (individual authors not listed)","sourceSite":"mixkit.co (SFX) + original synthesis","sourceUrl":"https://assets.mixkit.co/active_storage/sfx/518/518-preview.mp3 ; https://assets.mixkit.co/active_storage/sfx/522/522-preview.mp3 ; https://assets.mixkit.co/active_storage/sfx/424/424-preview.mp3","restrictions":["must ship as part of a game, not as a standalone library"],"sourceId":"AMB_RAVE_INT","ol050":true,"title":"HOUSE MUSIC","duration":59.7,"matched":false,"patch":"PATCH-1.01-AUDIO"},"C4":{"id":"C4","title":"RICH ALUCARD × BRITNEY STAKES × ANFEESA — (untitled)","file":"assets/sealed/audio/C4.wav","bus":"MUSIC","type":"one-shot","gain":1,"pitchJitter":0,"maxVoices":1,"priority":3,"loopStart":null,"loopEnd":null,"parts":[],"variations":[],"registered":true,"licenseClass":"AUTHOR_SUPPLIED","license":"User-authorized private game delivery","attributionRequired":false,"credit":"UBE","author":"UBE","ol050":true,"tempo":null,"duration":110.5378125,"matched":true,"sourceHash":"5f9a8352e4171130efb67afdff7f9fc545fcaaff3dd09e66ac58956df597f0d9","source":"audio_sources/captain_ube_final_master.wav","patch":null}},"patches":[{"id":"G6/M-01","code":"G6","status":"UBE-SONG-RC2","reason":"Ube's own song 'in montana' (assets/audio/music/in_montana.mp3).","runtimePath":"assets/audio/music/in_montana.mp3"},{"id":"G6/M-02","code":"G6","status":"PATCH-1.01-AUDIO","reason":"Named authored media absent from supplied masters; accepted-library stand-in authorized by OL-050 C.3.","runtimePath":"assets/bloodbath_mix3.wav"},{"id":"H5/M-01","code":"H5","status":"PATCH-1.01-AUDIO","reason":"Authored house-music recording absent; accepted club loop authorized by OL-050 C.3.","runtimePath":"assets/sealed/audio/OL050_HOUSE.mp3"},{"id":"H2/M-01","code":"H2","status":"UBE-SONG-RC2","reason":"Ube's own song 'in montana' (assets/audio/music/in_montana.mp3).","runtimePath":"assets/audio/music/in_montana.mp3"},{"id":"H5/M-02","code":"H5","status":"UBE-SONG-RC2","reason":"Ube's own song 'in montana' (assets/audio/music/in_montana.mp3).","runtimePath":"assets/audio/music/in_montana.mp3"},{"id":"G6/M-03","code":"G6","status":"PATCH-1.01-AUDIO","reason":"Authored earned remix absent; accepted existing game master authorized by OL-050 C.3.","runtimePath":"assets/bloodbath_mix3.wav"}]};

window.RABuild3BalanceOL050={"ruling":"OL-050","rainLeaderInitial":100000};

(function(){
 'use strict';
 const value={
  "ruling": "OL-050",
  "status": "DRAFTED-OL050",
  "count": 144,
  "rows": [
    {
      "code": "G7",
      "key": "sermon.01",
      "speaker": "G1",
      "text": "Different bodies. Different voices. Listen: the same soul does not need the same shape.",
      "intent": "One continuous peak-hour sermon: authored oneness, eternity, divinity, and refusal to shrink; no new lore."
    },
    {
      "code": "G7",
      "key": "sermon.02",
      "speaker": "G1",
      "text": "Stand apart. You are not alone. Oneness has no requirement that you become smaller.",
      "intent": "One continuous peak-hour sermon: authored oneness, eternity, divinity, and refusal to shrink; no new lore."
    },
    {
      "code": "G7",
      "key": "sermon.03",
      "speaker": "G1",
      "text": "Above animals. Beneath angels. Between them: room for every one of you.",
      "intent": "One continuous peak-hour sermon: authored oneness, eternity, divinity, and refusal to shrink; no new lore."
    },
    {
      "code": "G7",
      "key": "sermon.04",
      "speaker": "G1",
      "text": "An eternal soul cannot be measured by how much room somebody gives it.",
      "intent": "One continuous peak-hour sermon: authored oneness, eternity, divinity, and refusal to shrink; no new lore."
    },
    {
      "code": "G7",
      "key": "sermon.05",
      "speaker": "G1",
      "text": "Too much for this world? Good, the world is beta. Keep all of yourself.",
      "intent": "One continuous peak-hour sermon: authored oneness, eternity, divinity, and refusal to shrink; no new lore."
    },
    {
      "code": "G7",
      "key": "sermon.06",
      "speaker": "G1",
      "text": "They see a bug. You do not have to keep their label. Let them discover the feature.",
      "intent": "One continuous peak-hour sermon: authored oneness, eternity, divinity, and refusal to shrink; no new lore."
    },
    {
      "code": "G7",
      "key": "sermon.07",
      "speaker": "G1",
      "text": "Joy is not an error. Do not debug it out. Bring your whole self into this room.",
      "intent": "One continuous peak-hour sermon: authored oneness, eternity, divinity, and refusal to shrink; no new lore."
    },
    {
      "code": "G7",
      "key": "sermon.08",
      "speaker": "G1",
      "text": "Your shape, your voice. Keep them. Look around: together does not mean identical.",
      "intent": "One continuous peak-hour sermon: authored oneness, eternity, divinity, and refusal to shrink; no new lore."
    },
    {
      "code": "G7",
      "key": "sermon.09",
      "speaker": "G1",
      "text": "Move with the music. The body moves; the soul remains. Nothing in you needs to shrink.",
      "intent": "One continuous peak-hour sermon: authored oneness, eternity, divinity, and refusal to shrink; no new lore."
    },
    {
      "code": "G7",
      "key": "sermon.10",
      "speaker": "G1",
      "text": "Whole soul. Whole room. Royal Glitch reporting in.",
      "intent": "One continuous peak-hour sermon: authored oneness, eternity, divinity, and refusal to shrink; no new lore."
    },
    {
      "code": "G7",
      "key": "sermon.rich",
      "speaker": "rich",
      "text": "damn look at this shit",
      "intent": "One affectionate reaction to his brother’s authored sermon."
    },
    {
      "code": "G7",
      "key": "loss.first",
      "speaker": "G1",
      "text": "brother. no reply needed. i’m here.",
      "intent": "First supportive text after a real Oga becomes GONE; does not assert death or invent a meeting."
    },
    {
      "code": "C1",
      "key": "subtitle.01",
      "speaker": "GRANDMA",
      "text": "Too skinny. You are too skinny.",
      "intent": "English subtitle only for the authored grandmother’s first intent."
    },
    {
      "code": "C1",
      "key": "subtitle.02",
      "speaker": "GRANDMA",
      "text": "Call your mother, please.",
      "intent": "English subtitle only for the authored grandmother’s second intent."
    },
    {
      "code": "C1",
      "key": "subtitle.03",
      "speaker": "GRANDMA",
      "text": "I’m proud of you. Teeth and all.",
      "intent": "English subtitle only for the authored grandmother’s third intent."
    },
    {
      "code": "C2",
      "key": "reply.rematch",
      "speaker": "C2",
      "text": "a rematch already? you don’t waste time, i like that. — L",
      "intent": "Warm competitive response to Rich’s existing rematch reply; no new race, photograph, voice, or appearance."
    },
    {
      "code": "C2",
      "key": "reply.gotme",
      "speaker": "C2",
      "text": "ok, you got me. enjoy being right while you can. — L",
      "intent": "Warm competitive alternative to the existing acknowledgement; no added achievement."
    },
    {
      "code": "C2",
      "key": "reply.rich",
      "speaker": "rich",
      "text": "rematch, then?",
      "intent": "H1 rendering of the already existing permitted reply intent."
    },
    {
      "code": "P2",
      "key": "post.reup",
      "speaker": "@whosrunninLA",
      "text": "re-up coming. somehow they knew.",
      "intent": "The authored post discloses only the RE-UP detail from the actual affected run."
    },
    {
      "code": "P2",
      "key": "post.collect",
      "speaker": "@whosrunninLA",
      "text": "collect run. they were already expecting the squad.",
      "intent": "The authored post discloses only the COLLECT detail from the actual affected run."
    },
    {
      "code": "P2",
      "key": "detect.phone",
      "speaker": "dre",
      "text": "BRO. our run is in this text. look at the phone.",
      "intent": "Dre identifies the text revealed by his actual PHONE OUT seam; identity comes only from current mole state."
    },
    {
      "code": "P2",
      "key": "detect.chewer",
      "speaker": "CHEWER",
      "text": "{{identity}} told us. there. that’s the name.",
      "intent": "Captured Chewer supplies the already selected source-defined mole identity only after actual TALK detection."
    },
    {
      "code": "P3",
      "key": "ask",
      "speaker": "young_mazi",
      "text": "bro. let me run this. just me, my car, my plan.",
      "intent": "Mazi asks for exactly the authored solo lead; no extra job or promise."
    },
    {
      "code": "P3",
      "key": "quiet.01",
      "speaker": "young_mazi",
      "text": "you do your own thing, bro. that’s why i look up to you.",
      "intent": "Expresses the authored admiration in the actual quiet-car RIDE WITH HIM beat; no invented backstory."
    },
    {
      "code": "P3",
      "key": "quiet.02",
      "speaker": "young_mazi",
      "text": "i want that too. doing my own thing. glad you’re in the car with me.",
      "intent": "Completes the stated admiration and independence intent without creating facts or a future event."
    },
    {
      "code": "P3",
      "key": "quiet.rich",
      "speaker": "rich",
      "text": "glad i came bro",
      "intent": "One H1 reply to Mazi’s authored quiet-car beat."
    },
    {
      "code": "H6",
      "key": "mazda_human.01",
      "speaker": "mazda_human",
      "text": "I haven’t said this: staying here feels good. I don’t need to go anywhere.",
      "intent": "Authored top-five full conversation: a present private feeling, one sincere Rich reply, then silence. No invented past event or biography."
    },
    {
      "code": "H6",
      "key": "mazda_human.02",
      "speaker": "mazda_human",
      "text": "Rides, boba… and this. Quiet with you, I want this too.",
      "intent": "Authored top-five full conversation: a present private feeling, one sincere Rich reply, then silence. No invented past event or biography."
    },
    {
      "code": "H6",
      "key": "mazda_human.03",
      "speaker": "mazda_human",
      "text": "Let’s stay like this. Quiet. Just a little.",
      "intent": "Authored top-five full conversation: a present private feeling, one sincere Rich reply, then silence. No invented past event or biography."
    },
    {
      "code": "H6",
      "key": "mazda_human.04",
      "speaker": "rich",
      "text": "yeah. right here is good.",
      "intent": "Authored top-five full conversation: a present private feeling, one sincere Rich reply, then silence. No invented past event or biography."
    },
    {
      "code": "H6",
      "key": "nneka.01",
      "speaker": "nneka",
      "text": "Adeoluwa. Listen. I have not told you this.",
      "intent": "Authored top-five full conversation: a present private feeling, one sincere Rich reply, then silence. No invented past event or biography."
    },
    {
      "code": "H6",
      "key": "nneka.02",
      "speaker": "nneka",
      "text": "I care. Being impressed is a separate matter.",
      "intent": "Authored top-five full conversation: a present private feeling, one sincere Rich reply, then silence. No invented past event or biography."
    },
    {
      "code": "H6",
      "key": "nneka.03",
      "speaker": "nneka",
      "text": "Sit. You do not need to perform for me.",
      "intent": "Authored top-five full conversation: a present private feeling, one sincere Rich reply, then silence. No invented past event or biography."
    },
    {
      "code": "H6",
      "key": "nneka.04",
      "speaker": "rich",
      "text": "real talk. glad you came.",
      "intent": "Authored top-five full conversation: a present private feeling, one sincere Rich reply, then silence. No invented past event or biography."
    },
    {
      "code": "H6",
      "key": "jdm_importer_daughter_001.01",
      "speaker": "jdm_importer_daughter_001",
      "text": "Something I haven’t said: I like having nothing to correct.",
      "intent": "Authored top-five full conversation: a present private feeling, one sincere Rich reply, then silence. No invented past event or biography."
    },
    {
      "code": "H6",
      "key": "jdm_importer_daughter_001.02",
      "speaker": "jdm_importer_daughter_001",
      "text": "The Crest is good. This is good too. Different reasons.",
      "intent": "Authored top-five full conversation: a present private feeling, one sincere Rich reply, then silence. No invented past event or biography."
    },
    {
      "code": "H6",
      "key": "jdm_importer_daughter_001.03",
      "speaker": "jdm_importer_daughter_001",
      "text": "No road to watch. No advice. Just sitting here with you.",
      "intent": "Authored top-five full conversation: a present private feeling, one sincere Rich reply, then silence. No invented past event or biography."
    },
    {
      "code": "H6",
      "key": "jdm_importer_daughter_001.04",
      "speaker": "rich",
      "text": "im not trying to go anywhere",
      "intent": "Authored top-five full conversation: a present private feeling, one sincere Rich reply, then silence. No invented past event or biography."
    },
    {
      "code": "H6",
      "key": "june.01",
      "speaker": "june",
      "text": "You haven’t heard this from me: I like sitting still too.",
      "intent": "Authored top-five full conversation: a present private feeling, one sincere Rich reply, then silence. No invented past event or biography."
    },
    {
      "code": "H6",
      "key": "june.02",
      "speaker": "june",
      "text": "Nothing to fix here. You can let it be too.",
      "intent": "Authored top-five full conversation: a present private feeling, one sincere Rich reply, then silence. No invented past event or biography."
    },
    {
      "code": "H6",
      "key": "june.03",
      "speaker": "june",
      "text": "Sit with me. That’s all.",
      "intent": "Authored top-five full conversation: a present private feeling, one sincere Rich reply, then silence. No invented past event or biography."
    },
    {
      "code": "H6",
      "key": "june.04",
      "speaker": "rich",
      "text": "i got you. i’m sitting.",
      "intent": "Authored top-five full conversation: a present private feeling, one sincere Rich reply, then silence. No invented past event or biography."
    },
    {
      "code": "H6",
      "key": "ms_patrice.01",
      "speaker": "ms_patrice",
      "text": "Haven’t told you this, baby. I like us quiet.",
      "intent": "Authored top-five full conversation: a present private feeling, one sincere Rich reply, then silence. No invented past event or biography."
    },
    {
      "code": "H6",
      "key": "ms_patrice.02",
      "speaker": "ms_patrice",
      "text": "A good thing don’t need all that production.",
      "intent": "Authored top-five full conversation: a present private feeling, one sincere Rich reply, then silence. No invented past event or biography."
    },
    {
      "code": "H6",
      "key": "ms_patrice.03",
      "speaker": "ms_patrice",
      "text": "No orders to take. Sit down and enjoy it.",
      "intent": "Authored top-five full conversation: a present private feeling, one sincere Rich reply, then silence. No invented past event or biography."
    },
    {
      "code": "H6",
      "key": "ms_patrice.04",
      "speaker": "rich",
      "text": "this is good",
      "intent": "Authored top-five full conversation: a present private feeling, one sincere Rich reply, then silence. No invented past event or biography."
    },
    {
      "code": "H6",
      "key": "shared.01",
      "speaker": "{{person}}",
      "text": "{{like}} is good. There’s something I haven’t said, though.",
      "intent": "Shared non-top-five confession template; like must be an actual authored catalog like rendered with its existing label."
    },
    {
      "code": "H6",
      "key": "shared.02",
      "speaker": "{{person}}",
      "text": "Being here with you matters to me too.",
      "intent": "Shared non-top-five current feeling, then the authored silence."
    },
    {
      "code": "H6",
      "key": "shared.rich",
      "speaker": "rich",
      "text": "i like being here with you.",
      "intent": "One sincere H1 reply for the shared non-top-five template."
    },
    {
      "code": "S07",
      "key": "ceo_assistant_001.close",
      "speaker": "ceo_assistant_001",
      "text": "Rich. The fabric matches. Do your plans?",
      "intent": "CLOSE reaction to the authored matching-fabric discovery; comedy, no departure or punishment."
    },
    {
      "code": "S07",
      "key": "ceo_assistant_001.ride",
      "speaker": "ceo_assistant_001",
      "text": "We're close, Rich. I can handle the real explanation. Can you?",
      "intent": "RIDE-OR-DIE reaction to the same authored discovery; existing relationship changes the candor, not scores."
    },
    {
      "code": "H7",
      "key": "ceo_assistant_001.close",
      "speaker": "ceo_assistant_001",
      "text": "So that was your plan for the night. I'd like the version you can say while looking at me.",
      "intent": "CLOSE woman learns about the actual H7 night; a private dramatic line, no punishment or invented incident."
    },
    {
      "code": "S07",
      "key": "jdm_importer_daughter_001.close",
      "speaker": "jdm_importer_daughter_001",
      "text": "Matching fabric. Nice setup. Now talk me through it.",
      "intent": "CLOSE reaction to the authored matching-fabric discovery; comedy, no departure or punishment."
    },
    {
      "code": "S07",
      "key": "jdm_importer_daughter_001.ride",
      "speaker": "jdm_importer_daughter_001",
      "text": "I'm not going anywhere. Quit steering around the question.",
      "intent": "RIDE-OR-DIE reaction to the same authored discovery; existing relationship changes the candor, not scores."
    },
    {
      "code": "H7",
      "key": "jdm_importer_daughter_001.close",
      "speaker": "jdm_importer_daughter_001",
      "text": "That night of yours. Don't take the long way around it.",
      "intent": "CLOSE woman learns about the actual H7 night; a private dramatic line, no punishment or invented incident."
    },
    {
      "code": "S07",
      "key": "mazda_human.close",
      "speaker": "mazda_human",
      "text": "The same fabric! On all of us! ...Why aren't you happy about it?",
      "intent": "CLOSE reaction to the authored matching-fabric discovery; comedy, no departure or punishment."
    },
    {
      "code": "S07",
      "key": "mazda_human.ride",
      "speaker": "mazda_human",
      "text": "I'm sitting beside you. Yes, with that face. Tell us!",
      "intent": "RIDE-OR-DIE reaction to the same authored discovery; existing relationship changes the candor, not scores."
    },
    {
      "code": "H7",
      "key": "mazda_human.close",
      "speaker": "mazda_human",
      "text": "That was your night? I want to hear it from your mouth. Go on.",
      "intent": "CLOSE woman learns about the actual H7 night; a private dramatic line, no punishment or invented incident."
    },
    {
      "code": "S07",
      "key": "kiki.close",
      "speaker": "kiki",
      "text": "Cute. We match. You look like you ordered wrong on purpose.",
      "intent": "CLOSE reaction to the authored matching-fabric discovery; comedy, no departure or punishment."
    },
    {
      "code": "S07",
      "key": "kiki.ride",
      "speaker": "kiki",
      "text": "Matching outfits, that face. Cute combo. Now try an honest answer.",
      "intent": "RIDE-OR-DIE reaction to the same authored discovery; existing relationship changes the candor, not scores."
    },
    {
      "code": "H7",
      "key": "kiki.close",
      "speaker": "kiki",
      "text": "Okaaay. So that's the night. Give me something honest to go with it.",
      "intent": "CLOSE woman learns about the actual H7 night; a private dramatic line, no punishment or invented incident."
    },
    {
      "code": "S07",
      "key": "nneka.close",
      "speaker": "nneka",
      "text": "I see the matching fabric, Adeoluwa. I am waiting for the sense.",
      "intent": "CLOSE reaction to the authored matching-fabric discovery; comedy, no departure or punishment."
    },
    {
      "code": "S07",
      "key": "nneka.ride",
      "speaker": "nneka",
      "text": "Adeoluwa. I like you. That is not an explanation for the fabric.",
      "intent": "RIDE-OR-DIE reaction to the same authored discovery; existing relationship changes the candor, not scores."
    },
    {
      "code": "H7",
      "key": "nneka.close",
      "speaker": "nneka",
      "text": "Adeoluwa. I know about the night. Must I ask you to speak?",
      "intent": "CLOSE woman learns about the actual H7 night; a private dramatic line, no punishment or invented incident."
    },
    {
      "code": "S07",
      "key": "pinky.close",
      "speaker": "pinky",
      "text": "That's quite a lineup. Let's see if you can keep your story straight.",
      "intent": "CLOSE reaction to the authored matching-fabric discovery; comedy, no departure or punishment."
    },
    {
      "code": "S07",
      "key": "pinky.ride",
      "speaker": "pinky",
      "text": "I'm not moving. Let's see if the answer's cleaner than the setup.",
      "intent": "RIDE-OR-DIE reaction to the same authored discovery; existing relationship changes the candor, not scores."
    },
    {
      "code": "H7",
      "key": "pinky.close",
      "speaker": "pinky",
      "text": "Bold night. Give me the version you can actually stand behind.",
      "intent": "CLOSE woman learns about the actual H7 night; a private dramatic line, no punishment or invented incident."
    },
    {
      "code": "S07",
      "key": "moonie.close",
      "speaker": "moonie",
      "text": "Ha, same fabric on everybody. You gonna explain or just stare? I'm eating.",
      "intent": "CLOSE reaction to the authored matching-fabric discovery; comedy, no departure or punishment."
    },
    {
      "code": "S07",
      "key": "moonie.ride",
      "speaker": "moonie",
      "text": "I'm staying. Food's here, you're here. Talk, I can chew and listen.",
      "intent": "RIDE-OR-DIE reaction to the same authored discovery; existing relationship changes the candor, not scores."
    },
    {
      "code": "H7",
      "key": "moonie.close",
      "speaker": "moonie",
      "text": "Big night, huh? Don't get all quiet on me now. Out with it.",
      "intent": "CLOSE woman learns about the actual H7 night; a private dramatic line, no punishment or invented incident."
    },
    {
      "code": "S07",
      "key": "kaede.close",
      "speaker": "kaede",
      "text": "...Same fabric. Explain.",
      "intent": "CLOSE reaction to the authored matching-fabric discovery; comedy, no departure or punishment."
    },
    {
      "code": "S07",
      "key": "kaede.ride",
      "speaker": "kaede",
      "text": "Here. No evasions.",
      "intent": "RIDE-OR-DIE reaction to the same authored discovery; existing relationship changes the candor, not scores."
    },
    {
      "code": "H7",
      "key": "kaede.close",
      "speaker": "kaede",
      "text": "...The night. Your words.",
      "intent": "CLOSE woman learns about the actual H7 night; a private dramatic line, no punishment or invented incident."
    },
    {
      "code": "S07",
      "key": "wispa.close",
      "speaker": "wispa",
      "text": "Oh, the fabric I understand. It's the rest I'm curious about.",
      "intent": "CLOSE reaction to the authored matching-fabric discovery; comedy, no departure or punishment."
    },
    {
      "code": "S07",
      "key": "wispa.ride",
      "speaker": "wispa",
      "text": "We're close. You can let me in on the part that isn't obvious.",
      "intent": "RIDE-OR-DIE reaction to the same authored discovery; existing relationship changes the candor, not scores."
    },
    {
      "code": "H7",
      "key": "wispa.close",
      "speaker": "wispa",
      "text": "Was the night as interesting as it sounds? Tell me. I'm trying to picture it.",
      "intent": "CLOSE woman learns about the actual H7 night; a private dramatic line, no punishment or invented incident."
    },
    {
      "code": "S07",
      "key": "tasha.close",
      "speaker": "tasha",
      "text": "WE MATCH. THEY MATCH. Rich, where's the part where this makes sense?",
      "intent": "CLOSE reaction to the authored matching-fabric discovery; comedy, no departure or punishment."
    },
    {
      "code": "S07",
      "key": "tasha.ride",
      "speaker": "tasha",
      "text": "NO VERSE. I know those already. I want the answer.",
      "intent": "RIDE-OR-DIE reaction to the same authored discovery; existing relationship changes the candor, not scores."
    },
    {
      "code": "H7",
      "key": "tasha.close",
      "speaker": "tasha",
      "text": "Rich. THAT NIGHT? I want the words from YOU.",
      "intent": "CLOSE woman learns about the actual H7 night; a private dramatic line, no punishment or invented incident."
    },
    {
      "code": "S07",
      "key": "marisol.close",
      "speaker": "marisol",
      "text": "The fabric is coordinated. You are not. Account for that.",
      "intent": "CLOSE reaction to the authored matching-fabric discovery; comedy, no departure or punishment."
    },
    {
      "code": "S07",
      "key": "marisol.ride",
      "speaker": "marisol",
      "text": "I am staying. Begin at the part you have failed to organize.",
      "intent": "RIDE-OR-DIE reaction to the same authored discovery; existing relationship changes the candor, not scores."
    },
    {
      "code": "H7",
      "key": "marisol.close",
      "speaker": "marisol",
      "text": "Your night. Start there. Leave the clutter out of the explanation.",
      "intent": "CLOSE woman learns about the actual H7 night; a private dramatic line, no punishment or invented incident."
    },
    {
      "code": "S07",
      "key": "duchess.close",
      "speaker": "duchess",
      "text": "How coordinated, child. The fabric, at least. Do enlighten me.",
      "intent": "CLOSE reaction to the authored matching-fabric discovery; comedy, no departure or punishment."
    },
    {
      "code": "S07",
      "key": "duchess.ride",
      "speaker": "duchess",
      "text": "I shall stay, child. You may dispense with the performance and attempt an answer.",
      "intent": "RIDE-OR-DIE reaction to the same authored discovery; existing relationship changes the candor, not scores."
    },
    {
      "code": "H7",
      "key": "duchess.close",
      "speaker": "duchess",
      "text": "Child. What an interesting use of a night. I shall hear your account.",
      "intent": "CLOSE woman learns about the actual H7 night; a private dramatic line, no punishment or invented incident."
    },
    {
      "code": "S07",
      "key": "nightshade.close",
      "speaker": "nightshade",
      "text": "…the same cloth. How very convenient. Do explain.",
      "intent": "CLOSE reaction to the authored matching-fabric discovery; comedy, no departure or punishment."
    },
    {
      "code": "S07",
      "key": "nightshade.ride",
      "speaker": "nightshade",
      "text": "I am not so easily dispelled. You may speak freely.",
      "intent": "RIDE-OR-DIE reaction to the same authored discovery; existing relationship changes the candor, not scores."
    },
    {
      "code": "H7",
      "key": "nightshade.close",
      "speaker": "nightshade",
      "text": "…your night. So very lively. Do go on; I am listening.",
      "intent": "CLOSE woman learns about the actual H7 night; a private dramatic line, no punishment or invented incident."
    },
    {
      "code": "S07",
      "key": "emberly.close",
      "speaker": "emberly",
      "text": "We all match? Ha, come on, don't freeze up on me. Let it out.",
      "intent": "CLOSE reaction to the authored matching-fabric discovery; comedy, no departure or punishment."
    },
    {
      "code": "S07",
      "key": "emberly.ride",
      "speaker": "emberly",
      "text": "Relax. A little fabric won't scare me off. Don't hold back.",
      "intent": "RIDE-OR-DIE reaction to the same authored discovery; existing relationship changes the candor, not scores."
    },
    {
      "code": "H7",
      "key": "emberly.close",
      "speaker": "emberly",
      "text": "Your night sounds hot. Come on, don't go cold on me now. Talk.",
      "intent": "CLOSE woman learns about the actual H7 night; a private dramatic line, no punishment or invented incident."
    },
    {
      "code": "S07",
      "key": "jade.close",
      "speaker": "jade",
      "text": "Coordinated attire. Quite the collection. I await your explanation.",
      "intent": "CLOSE reaction to the authored matching-fabric discovery; comedy, no departure or punishment."
    },
    {
      "code": "S07",
      "key": "jade.ride",
      "speaker": "jade",
      "text": "I keep everything. I shall keep my place here as well. You may begin.",
      "intent": "RIDE-OR-DIE reaction to the same authored discovery; existing relationship changes the candor, not scores."
    },
    {
      "code": "H7",
      "key": "jade.close",
      "speaker": "jade",
      "text": "Your night has reached my ears. Give me the version worth keeping.",
      "intent": "CLOSE woman learns about the actual H7 night; a private dramatic line, no punishment or invented incident."
    },
    {
      "code": "S07",
      "key": "lo.close",
      "speaker": "lo",
      "text": "Sorry, are we dressed alike? That's… awkward, please say something.",
      "intent": "CLOSE reaction to the authored matching-fabric discovery; comedy, no departure or punishment."
    },
    {
      "code": "S07",
      "key": "lo.ride",
      "speaker": "lo",
      "text": "I wasn't planning on leaving. It's fabric, awkward fabric, but still. You can talk.",
      "intent": "RIDE-OR-DIE reaction to the same authored discovery; existing relationship changes the candor, not scores."
    },
    {
      "code": "H7",
      "key": "lo.close",
      "speaker": "lo",
      "text": "Um, I heard about your night. I'm trying to be polite, but… what was that?",
      "intent": "CLOSE woman learns about the actual H7 night; a private dramatic line, no punishment or invented incident."
    },
    {
      "code": "S07",
      "key": "brenda.close",
      "speaker": "brenda",
      "text": "The outfits match. Interesting. Shall we go through the discrepancies?",
      "intent": "CLOSE reaction to the authored matching-fabric discovery; comedy, no departure or punishment."
    },
    {
      "code": "S07",
      "key": "brenda.ride",
      "speaker": "brenda",
      "text": "My position hasn't changed. The outfits check out. Your explanation is the part I need.",
      "intent": "RIDE-OR-DIE reaction to the same authored discovery; existing relationship changes the candor, not scores."
    },
    {
      "code": "H7",
      "key": "brenda.close",
      "speaker": "brenda",
      "text": "Let's reconcile your version of the night with what I heard.",
      "intent": "CLOSE woman learns about the actual H7 night; a private dramatic line, no punishment or invented incident."
    },
    {
      "code": "S07",
      "key": "hina.close",
      "speaker": "hina",
      "text": "You can look surprised and talk at the same time. Start with these outfits.",
      "intent": "CLOSE reaction to the authored matching-fabric discovery; comedy, no departure or punishment."
    },
    {
      "code": "S07",
      "key": "hina.ride",
      "speaker": "hina",
      "text": "I'm here. Take your time explaining. Just don't waste mine.",
      "intent": "RIDE-OR-DIE reaction to the same authored discovery; existing relationship changes the candor, not scores."
    },
    {
      "code": "H7",
      "key": "hina.close",
      "speaker": "hina",
      "text": "I know about the night. No padding. What happened?",
      "intent": "CLOSE woman learns about the actual H7 night; a private dramatic line, no punishment or invented incident."
    },
    {
      "code": "S07",
      "key": "bunmi.close",
      "speaker": "bunmi",
      "text": "Rich. All of us matching and you still look lost. Be serious.",
      "intent": "CLOSE reaction to the authored matching-fabric discovery; comedy, no departure or punishment."
    },
    {
      "code": "S07",
      "key": "bunmi.ride",
      "speaker": "bunmi",
      "text": "I know you, Rich. Fabric isn’t running me off. Now tell me what’s going on.",
      "intent": "RIDE-OR-DIE reaction to the same authored discovery; existing relationship changes the candor, not scores."
    },
    {
      "code": "H7",
      "key": "bunmi.close",
      "speaker": "bunmi",
      "text": "Rich. I heard, and you know me. Don’t give me the pretty version.",
      "intent": "CLOSE woman learns about the actual H7 night; a private dramatic line, no punishment or invented incident."
    },
    {
      "code": "S07",
      "key": "velvet.close",
      "speaker": "velvet",
      "text": "Matching looks. Cute as hell. Less cute when you don't explain yourself.",
      "intent": "CLOSE reaction to the authored matching-fabric discovery; comedy, no departure or punishment."
    },
    {
      "code": "S07",
      "key": "velvet.ride",
      "speaker": "velvet",
      "text": "We look excellent. I'm comfortable right here. Give me something better than a pose.",
      "intent": "RIDE-OR-DIE reaction to the same authored discovery; existing relationship changes the candor, not scores."
    },
    {
      "code": "H7",
      "key": "velvet.close",
      "speaker": "velvet",
      "text": "No flattering angle. I've heard about the night; let's see how it sounds from you.",
      "intent": "CLOSE woman learns about the actual H7 night; a private dramatic line, no punishment or invented incident."
    },
    {
      "code": "S07",
      "key": "june.close",
      "speaker": "june",
      "text": "Sit. We match, and somehow you're the one who needs sorting out.",
      "intent": "CLOSE reaction to the authored matching-fabric discovery; comedy, no departure or punishment."
    },
    {
      "code": "S07",
      "key": "june.ride",
      "speaker": "june",
      "text": "Still here. Still telling you to sit. Matching clothes won't get you out of this conversation.",
      "intent": "RIDE-OR-DIE reaction to the same authored discovery; existing relationship changes the candor, not scores."
    },
    {
      "code": "H7",
      "key": "june.close",
      "speaker": "june",
      "text": "Sit still. I know about the night. I'm asking what's actually going on with you.",
      "intent": "CLOSE woman learns about the actual H7 night; a private dramatic line, no punishment or invented incident."
    },
    {
      "code": "S07",
      "key": "ms_patrice.close",
      "speaker": "ms_patrice",
      "text": "Same fabric? Mm, you sure can make a whole mess without lifting a finger. Go on.",
      "intent": "CLOSE reaction to the authored matching-fabric discovery; comedy, no departure or punishment."
    },
    {
      "code": "S07",
      "key": "ms_patrice.ride",
      "speaker": "ms_patrice",
      "text": "Sugar, I'm right here. Explain yourself before you let this food get cold.",
      "intent": "RIDE-OR-DIE reaction to the same authored discovery; existing relationship changes the candor, not scores."
    },
    {
      "code": "H7",
      "key": "ms_patrice.close",
      "speaker": "ms_patrice",
      "text": "Well, sugar. Word about your night got here before your explanation. I'm listening.",
      "intent": "CLOSE woman learns about the actual H7 night; a private dramatic line, no punishment or invented incident."
    },
    {
      "code": "S07",
      "key": "anfeesa.close",
      "speaker": "anfeesa",
      "text": "Same pattern. Nice mix. How did we get here?",
      "intent": "CLOSE reaction to the authored matching-fabric discovery; comedy, no departure or punishment."
    },
    {
      "code": "S07",
      "key": "anfeesa.ride",
      "speaker": "anfeesa",
      "text": "Not going anywhere. Drop the noise; I want to hear you.",
      "intent": "RIDE-OR-DIE reaction to the same authored discovery; existing relationship changes the candor, not scores."
    },
    {
      "code": "H7",
      "key": "anfeesa.close",
      "speaker": "anfeesa",
      "text": "About that night. I heard. Your turn—just for me.",
      "intent": "CLOSE woman learns about the actual H7 night; a private dramatic line, no punishment or invented incident."
    },
    {
      "code": "S07",
      "key": "likes.food",
      "speaker": "{{person}}",
      "text": "Jollof first. We can disagree with our mouths full.",
      "intent": "Food-like branch uses actual authored likes: peking_naija, naija_mart, food_court, taco_truck, waffle_haven, atl_curb, brunch, little_tokyo. Does not claim a new preference."
    },
    {
      "code": "S07",
      "key": "likes.other",
      "speaker": "{{person}}",
      "text": "{{like}} can wait. I’m here for this night.",
      "intent": "Non-food-like branch renders only an actual catalog like’s existing label; nobody storms out."
    },
    {
      "code": "S07",
      "key": "shared.close",
      "speaker": "{{person}}",
      "text": "Matching fabric. So we’re all here. What’s going on, then?",
      "intent": "Fallback only for an actual present adult CLOSE woman already in the accepted catalog; no new identity."
    },
    {
      "code": "S07",
      "key": "shared.ride",
      "speaker": "{{person}}",
      "text": "Still here with you. Let’s hear the honest version.",
      "intent": "Fallback only for an actual present adult RIDE-OR-DIE woman already in the accepted catalog; no new identity."
    },
    {
      "code": "H7",
      "key": "shared.close",
      "speaker": "{{person}}",
      "text": "That night got back to me. I want your version.",
      "intent": "Fallback only for the actual adult CLOSE woman from the accepted catalog; a current authored discovery, no new incident."
    },
    {
      "code": "H7",
      "key": "reply.rich",
      "speaker": "rich",
      "text": "shit i hear you bae",
      "intent": "One H1 reply to the CLOSE dialogue; acknowledges drama without adding promises or consequences."
    },
    {
      "code": "SPK",
      "key": "clip.02",
      "speaker": "HEADLINE",
      "text": "he’s rapping. he’s fighting. same clip.",
      "intent": "Ending-only expansion of the chosen authored spark headline. No new ranking, audience, event, identity, or number."
    },
    {
      "code": "SPK",
      "key": "clip.03",
      "speaker": "HEADLINE",
      "text": "rich alucard: verse still going, fight still in frame",
      "intent": "Ending-only expansion of the chosen authored spark headline. No new ranking, audience, event, identity, or number."
    },
    {
      "code": "SPK",
      "key": "drift.02",
      "speaker": "HEADLINE",
      "text": "a URUS. a parking garage. rich alucard sideways.",
      "intent": "Ending-only expansion of the chosen authored spark headline. No new ranking, audience, event, identity, or number."
    },
    {
      "code": "SPK",
      "key": "drift.03",
      "speaker": "HEADLINE",
      "text": "that parking-garage URUS drift has everybody watching",
      "intent": "Ending-only expansion of the chosen authored spark headline. No new ranking, audience, event, identity, or number."
    },
    {
      "code": "SPK",
      "key": "song.02",
      "speaker": "HEADLINE",
      "text": "giant rats. rich alucard made a song out of that.",
      "intent": "Ending-only expansion of the chosen authored spark headline. No new ranking, audience, event, identity, or number."
    },
    {
      "code": "SPK",
      "key": "song.03",
      "speaker": "HEADLINE",
      "text": "on VampGram: the giant-rat song by rich alucard",
      "intent": "Ending-only expansion of the chosen authored spark headline. No new ranking, audience, event, identity, or number."
    },
    {
      "code": "SPK",
      "key": "party.02",
      "speaker": "HEADLINE",
      "text": "at rich alucard’s castle: that party",
      "intent": "Ending-only expansion of the chosen authored spark headline. No new ranking, audience, event, identity, or number."
    },
    {
      "code": "SPK",
      "key": "party.03",
      "speaker": "HEADLINE",
      "text": "the castle party. everybody lied about being there.",
      "intent": "Ending-only expansion of the chosen authored spark headline. No new ranking, audience, event, identity, or number."
    },
    {
      "code": "SPK",
      "key": "arc.02",
      "speaker": "HEADLINE",
      "text": "broken ladder. rich alucard right there.",
      "intent": "Ending-only expansion of the chosen authored spark headline. No new ranking, audience, event, identity, or number."
    },
    {
      "code": "SPK",
      "key": "arc.03",
      "speaker": "HEADLINE",
      "text": "that ladder, broken. that vampire, rich alucard.",
      "intent": "Ending-only expansion of the chosen authored spark headline. No new ranking, audience, event, identity, or number."
    },
    {
      "code": "SPK",
      "key": "kid.02",
      "speaker": "HEADLINE",
      "text": "viral beat. the producer’s thanking rich alucard.",
      "intent": "Ending-only expansion of the chosen authored spark headline. No new ranking, audience, event, identity, or number."
    },
    {
      "code": "SPK",
      "key": "kid.03",
      "speaker": "HEADLINE",
      "text": "in the producer’s thanks: rich alucard",
      "intent": "Ending-only expansion of the chosen authored spark headline. No new ranking, audience, event, identity, or number."
    },
    {
      "code": "SPK",
      "key": "podcast.02",
      "speaker": "HEADLINE",
      "text": "rich alucard on a podcast. here’s the episode.",
      "intent": "Ending-only expansion of the chosen authored spark headline. No new ranking, audience, event, identity, or number."
    },
    {
      "code": "SPK",
      "key": "podcast.03",
      "speaker": "HEADLINE",
      "text": "garage couch. rich alucard interview. hit play.",
      "intent": "Ending-only expansion of the chosen authored spark headline. No new ranking, audience, event, identity, or number."
    },
    {
      "code": "SPK",
      "key": "dragon.02",
      "speaker": "HEADLINE",
      "text": "rich alucard. a dragon. a real one.",
      "intent": "Ending-only expansion of the chosen authored spark headline. No new ranking, audience, event, identity, or number."
    },
    {
      "code": "SPK",
      "key": "dragon.03",
      "speaker": "HEADLINE",
      "text": "at the castle party: rich alucard’s dragon",
      "intent": "Ending-only expansion of the chosen authored spark headline. No new ranking, audience, event, identity, or number."
    },
    {
      "code": "SPK",
      "key": "remix.02",
      "speaker": "HEADLINE",
      "text": "leaked: the rich alucard collab",
      "intent": "Ending-only expansion of the chosen authored spark headline. No new ranking, audience, event, identity, or number."
    },
    {
      "code": "SPK",
      "key": "remix.03",
      "speaker": "HEADLINE",
      "text": "everywhere now. that leaked rich alucard collab.",
      "intent": "Ending-only expansion of the chosen authored spark headline. No new ranking, audience, event, identity, or number."
    },
    {
      "code": "SPK",
      "key": "P5.02",
      "speaker": "HEADLINE",
      "text": "Detroit run. young playmaker.",
      "intent": "Ending-only expansion of the chosen authored spark headline. No new ranking, audience, event, identity, or number."
    },
    {
      "code": "SPK",
      "key": "P5.03",
      "speaker": "HEADLINE",
      "text": "young playmaker. who is he?",
      "intent": "Ending-only expansion of the chosen authored spark headline. No new ranking, audience, event, identity, or number."
    }
  ]
};
 for(const row of value.rows)Object.freeze(row);
 Object.freeze(value.rows);
 window.RABuild3DraftedLines=Object.freeze(value);
})();

window.RABuild3ArtCatalog={"actors":{"S01":{"sprite":"assets/sealed/art/S01-01.png"},"S02":{"sprite":"assets/sealed/art/S02-01.png"},"S04":{"sprite":"assets/sealed/art/S04-01.png","states":{"neutral":"assets/sealed/art/S04-01.png","playing":"assets/sealed/art/S04-02.png"}},"S05-N1":{"sprite":"assets/sealed/art/S05-N1-01.png"},"S05-N2":{"sprite":"assets/sealed/art/S05-N2-01.png"},"S05-N3":{"sprite":"assets/sealed/art/S05-N3-01.png"},"S06":{"sprite":"assets/sealed/art/S06-01.png","states":{"hatchling_neutral":"assets/sealed/art/S06-01.png","hatchling_happy":"assets/sealed/art/S06-HH.png","young_neutral":"assets/sealed/art/S06-YN.png","young_happy":"assets/sealed/art/S06-YH.png"},"stageStates":{"hatchling":{"neutral":"assets/sealed/art/S06-01.png","happy":"assets/sealed/art/S06-HH.png"},"young":{"neutral":"assets/sealed/art/S06-YN.png","happy":"assets/sealed/art/S06-YH.png"}},"growthGate":"SOURCE_REQUIRED"},"S08-A":{"sprite":"assets/sealed/art/S08-A-01.png"},"S08-B":{"sprite":"assets/sealed/art/S08-B-01.png"},"M1":{"sprite":"assets/sealed/art/M1-01.png","states":{"rock_seated":"assets/sealed/art/M1-01.png","wave":"assets/sealed/art/M1-wave.png"}},"G1":{"states":{"neutral":"assets/sealed/art/G2-01.png","loom":"assets/sealed/art/G2-02.png","billow":"assets/sealed/art/G2-03.png","forge":"assets/sealed/art/G2-04.png","dj":"assets/sealed/art/G2-05.png","voice":"assets/sealed/art/G2-06.png","laugh":"assets/sealed/art/G2-07.png","sandwich":"assets/sealed/art/G2-08.png","seated":"assets/sealed/art/G2-09.png"},"sprite":"assets/sealed/art/G2-01.png"},"H5-ONEOFF":{"sprite":"assets/sealed/art/H5-ONEOFF-01.png"},"P6-D":{"sprite":"assets/sealed/art/P6-D.png","states":{"seated":"assets/sealed/art/P6-D-seated.png"}},"ARC-X1":{"sprite":"assets/sealed/art/ARC-X-A1-01.png","states":{"neutral":"assets/sealed/art/ARC-X-A1-01.png","pitching":"assets/sealed/art/ARC-X-A1-02.png","cane_tap":"assets/sealed/art/ARC-X-A1-03.png","unmasked":"assets/sealed/art/ARC-X-A1-04.png","withered":"assets/sealed/art/ARC-X-A1-05.png"}},"ARC-X2":{"sprite":"assets/sealed/art/ARC-X-A2-01.png","states":{"neutral":"assets/sealed/art/ARC-X-A2-01.png","smiling":"assets/sealed/art/ARC-X-A2-02.png"}},"C1-N":{"sprite":"assets/sealed/art/C1-N.png"}},"environments":{"S01-LOC":{"image":"assets/sealed/art/S01-LOC-01.png"},"S02-LOC":{"image":"assets/sealed/art/S02-LOC-01.png"},"S05-LOC":{"image":"assets/sealed/art/S05-LOC-01.png"},"S07-LOC":{"image":"assets/sealed/art/S07-LOC-01.png"},"S08-LOC":{"image":"assets/sealed/art/S08-LOC-01.png"},"M1-LOC":{"image":"assets/sealed/art/M1-LOC-01.png"},"G3-PLATFORM":{"image":"assets/sealed/art/G3-PLATFORM-01.png"},"G3-DOOR":{"image":"assets/sealed/art/G3-DOOR-01.png"},"G3-FLOOR":{"image":"assets/sealed/art/G3-FLOOR-01.png"},"G3-OFFICE":{"image":"assets/sealed/art/G3-OFFICE-01.png"},"G3-ROOF":{"image":"assets/sealed/art/G3-ROOF-01.png"},"H5-HILLS":{"image":"assets/sealed/art/H5-HILLS-01.png"},"H6-SPRING":{"image":"assets/sealed/art/H6-SPRING-01.png"},"P6-fur":{"image":"assets/sealed/art/P6-fur.png"},"P6-snow":{"image":"assets/sealed/art/P6-snow.png"},"P3-shades":{"image":"assets/sealed/art/P3-shades.png"},"NO-S3-canopy":{"image":"assets/sealed/art/NO-S3-canopy.png"},"H9":{"image":"assets/sealed/art/H9-card.png"},"ARC-X-cane":{"image":"assets/sealed/art/ARC-X-cane.png"},"ARC-X-rung":{"image":"assets/sealed/art/ARC-X-rung.png"},"S06-egg":{"image":"assets/sealed/art/S06-egg.png"},"S02-dice":{"image":"assets/sealed/art/S02-dice.png"},"G4":{"image":"assets/sealed/art/G4.png"},"G3-hat":{"image":"assets/sealed/art/G3-hat.png"},"H8A":{"image":"assets/sealed/art/H8A.png"},"H8B":{"image":"assets/sealed/art/H8B.png"},"H8C":{"image":"assets/sealed/art/H8C.png"},"ARC-X-LOC":{"image":"assets/sealed/art/ARC-X-LOC-OPEN.png","states":{"open":"assets/sealed/art/ARC-X-LOC-OPEN.png","collapse":"assets/sealed/art/ARC-X-LOC-COLLAPSE.png"}},"ARC-X-collapse":{"image":"assets/sealed/art/ARC-X-LOC-DELTA.png"},"ARC-X-card":{"image":"assets/sealed/art/ARC-X-CARD.png"},"ARC-X-brochure":{"image":"assets/sealed/art/ARC-X-BROCHURE.png"},"ARC-X-plan":{"image":"assets/sealed/art/ARC-X-PLAN-FRAME.png"},"C1-LOC":{"image":"assets/sealed/art/C1-LOC.png"},"C1-SPOON":{"image":"assets/sealed/art/C1-SPOON.png"},"C4-cover":{"image":"assets/sealed/art/C4-cover.png"}},"assets":[{"code":"S01-01","file":"assets/sealed/art/S01-01.png","sha256":"3d5076bc4c3cc024d70d6d3af881d3209945d63f26b571cddc4029ea363c69c6","width":80,"height":96,"alpha":[0,255],"colors":8,"bounds":[24,30,55,88],"integerRaster":true,"owner":"S01","actor":"S01","anchor":[40,88],"approval":"PRIVATE_CODE_CANDIDATE"},{"code":"S02-01","file":"assets/sealed/art/S02-01.png","sha256":"bb3e50643fc6a50ad25b533c03b3bbfd154f018a3f1495ba76c320f2cd88ccdd","width":80,"height":96,"alpha":[0,255],"colors":7,"bounds":[24,27,55,88],"integerRaster":true,"owner":"S02","actor":"S02","anchor":[40,88],"approval":"PRIVATE_CODE_CANDIDATE"},{"code":"S04-01","file":"assets/sealed/art/S04-01.png","sha256":"9c476ebf623895bdef656d75cfa602cbd4895a443002ee94719ff9666cb8140c","width":80,"height":96,"alpha":[0,255],"colors":8,"bounds":[24,27,55,88],"integerRaster":true,"owner":"S04","actor":"S04","anchor":[40,88],"approval":"PRIVATE_CODE_CANDIDATE"},{"code":"S05-N1-01","file":"assets/sealed/art/S05-N1-01.png","sha256":"bfc3e05d01e38d5cb21938448121eaa22b2a9d6b227f89e94d858271782d7bd9","width":80,"height":96,"alpha":[0,255],"colors":8,"bounds":[24,27,55,88],"integerRaster":true,"owner":"S05-N1","actor":"S05-N1","anchor":[40,88],"approval":"PRIVATE_CODE_CANDIDATE"},{"code":"S05-N2-01","file":"assets/sealed/art/S05-N2-01.png","sha256":"698f3adc80ad31335fbf5555caf60bd0699130eafdb1ecdc38759e982e2eb793","width":80,"height":96,"alpha":[0,255],"colors":8,"bounds":[24,27,55,88],"integerRaster":true,"owner":"S05-N2","actor":"S05-N2","anchor":[40,88],"approval":"PRIVATE_CODE_CANDIDATE"},{"code":"S05-N3-01","file":"assets/sealed/art/S05-N3-01.png","sha256":"72312e3035f7d45f1cb4191b6f8de8fda62d7a58801be12a29173e58c1aef6c0","width":80,"height":96,"alpha":[0,255],"colors":8,"bounds":[24,27,55,88],"integerRaster":true,"owner":"S05-N3","actor":"S05-N3","anchor":[40,88],"approval":"PRIVATE_CODE_CANDIDATE"},{"code":"S06-01","file":"assets/sealed/art/S06-01.png","sha256":"e1e46cd84552582ea24c3270c220c81c611cff354b2a5b3d9da5ebc42f19e606","width":80,"height":96,"alpha":[0,255],"colors":7,"bounds":[3,42,73,88],"integerRaster":true,"owner":"S06","actor":"S06","anchor":[40,88],"approval":"PRIVATE_CODE_CANDIDATE","face":[48,43,20,21]},{"code":"S08-A-01","file":"assets/sealed/art/S08-A-01.png","sha256":"c90fe7e1fdea10b6052b046036aafd5d4f1f542ae4352d54c35ad3f052acd09a","width":80,"height":96,"alpha":[0,255],"colors":8,"bounds":[24,27,55,88],"integerRaster":true,"owner":"S08-A","actor":"S08-A","anchor":[40,88],"approval":"PRIVATE_CODE_CANDIDATE"},{"code":"S08-B-01","file":"assets/sealed/art/S08-B-01.png","sha256":"dede9f62a4b1517bad828b4fae5c527f34e6acd4f5c0cb729c86ab3f7e046f1e","width":80,"height":96,"alpha":[0,255],"colors":8,"bounds":[24,27,55,88],"integerRaster":true,"owner":"S08-B","actor":"S08-B","anchor":[40,88],"approval":"PRIVATE_CODE_CANDIDATE"},{"code":"M1-01","file":"assets/sealed/art/M1-01.png","sha256":"9df7123fc4555b1388bc25dedc11f41df12652736e5c7dadf73ee4c78355fa74","width":80,"height":96,"alpha":[0,255],"colors":6,"bounds":[22,30,57,87],"integerRaster":true,"owner":"M1","actor":"M1","anchor":[40,88],"approval":"PRIVATE_CODE_CANDIDATE"},{"code":"G2-01","file":"assets/sealed/art/G2-01.png","sha256":"83f70e5401aa597cc0858d98c7c8d7707db07272e5f261d2562f14a956b91700","width":80,"height":96,"alpha":[0,255],"colors":13,"bounds":[21,8,59,88],"integerRaster":true,"owner":"G2","actor":"G1","state":"neutral","anchor":[40,88],"approval":"OVERLORD_PROXY_APPROVED (OL-050)"},{"code":"G2-02","file":"assets/sealed/art/G2-02.png","sha256":"660fb9fd70a3d1a361bda495ec2e762cba697e035e19663d2e58bc61342beeb4","width":80,"height":96,"alpha":[0,255],"colors":13,"bounds":[21,8,59,88],"integerRaster":true,"owner":"G2","actor":"G1","state":"loom","anchor":[40,88],"approval":"OVERLORD_PROXY_APPROVED (OL-050)"},{"code":"G2-03","file":"assets/sealed/art/G2-03.png","sha256":"0ded1e2c62ad371bd6aab78e5b56d256ab741f13a1ffbc7d7c6deff880554afc","width":80,"height":96,"alpha":[0,255],"colors":13,"bounds":[21,5,61,88],"integerRaster":true,"owner":"G2","actor":"G1","state":"billow","anchor":[40,88],"approval":"OVERLORD_PROXY_APPROVED (OL-050)"},{"code":"G2-04","file":"assets/sealed/art/G2-04.png","sha256":"0da1a763a915ce16dea2edb85bf59648a7983c14be7cb97263e1a38fd39fc5b8","width":80,"height":96,"alpha":[0,255],"colors":13,"bounds":[23,8,61,88],"integerRaster":true,"owner":"G2","actor":"G1","state":"forge","anchor":[40,88],"approval":"OVERLORD_PROXY_APPROVED (OL-050)"},{"code":"G2-05","file":"assets/sealed/art/G2-05.png","sha256":"804a93e6272fa542332f26d82af068ddce7f871f98fdd8391cceea50641fae9e","width":80,"height":96,"alpha":[0,255],"colors":14,"bounds":[12,8,67,88],"integerRaster":true,"owner":"G2","actor":"G1","state":"dj","anchor":[40,88],"approval":"OVERLORD_PROXY_APPROVED (OL-050)"},{"code":"G2-06","file":"assets/sealed/art/G2-06.png","sha256":"cdc6d3345b4759b593157b161ca2a3be7a1c5ada5f5d522bbf613397b783dcb7","width":80,"height":96,"alpha":[0,255],"colors":13,"bounds":[21,8,59,88],"integerRaster":true,"owner":"G2","actor":"G1","state":"voice","anchor":[40,88],"approval":"OVERLORD_PROXY_APPROVED (OL-050)"},{"code":"G2-07","file":"assets/sealed/art/G2-07.png","sha256":"cc610264dea73d9e6eb6f9d2bad1047e356ae0985549394530abc3b9b8af589d","width":80,"height":96,"alpha":[0,255],"colors":13,"bounds":[21,8,59,88],"integerRaster":true,"owner":"G2","actor":"G1","state":"laugh","anchor":[40,88],"approval":"OVERLORD_PROXY_APPROVED (OL-050)"},{"code":"G2-08","file":"assets/sealed/art/G2-08.png","sha256":"6a37c96101774ae442d75d51100995e6cd1e7d5e2f625acd28cdad0b5cad88cc","width":80,"height":96,"alpha":[0,255],"colors":15,"bounds":[21,8,59,88],"integerRaster":true,"owner":"G2","actor":"G1","state":"sandwich","anchor":[40,88],"approval":"OVERLORD_PROXY_APPROVED (OL-050)"},{"code":"G2-09","file":"assets/sealed/art/G2-09.png","sha256":"d7d9a4d7eed8089a5cb5ac706fa76ca7a61cae0a7e6bf56dc7e5c8de7d25f17a","width":80,"height":96,"alpha":[0,255],"colors":13,"bounds":[21,8,60,88],"integerRaster":true,"owner":"G2","actor":"G1","state":"seated","anchor":[40,88],"approval":"OVERLORD_PROXY_APPROVED (OL-050)"},{"code":"H5-ONEOFF-01","file":"assets/sealed/art/H5-ONEOFF-01.png","sha256":"4801dbe09fcb716f83a7d56fcf097195d0b165eef16ecddf670e56d27ebf4e2b","width":80,"height":96,"alpha":[0,255],"colors":8,"bounds":[24,24,55,88],"integerRaster":true,"owner":"H5-ONEOFF","actor":"H5-ONEOFF","anchor":[40,88],"approval":"PRIVATE_CODE_CANDIDATE"},{"code":"M1-wave","file":"assets/sealed/art/M1-wave.png","sha256":"ca75a7fba9c843f517367291519d8db34b06ac4dfaf0f9a1a86ca0d6bfab904a","width":80,"height":96,"alpha":[0,255],"colors":6,"bounds":[22,24,58,87],"integerRaster":true,"owner":"M1","actor":"M1","anchor":[40,88],"approval":"PRIVATE_CODE_CANDIDATE"},{"code":"S01-LOC-01","file":"assets/sealed/art/S01-LOC-01.png","sha256":"d14225fca14c500b1b599119c32674a5ceab245bbe8c45dc6c60bde74a722c8d","width":270,"height":480,"alpha":[255],"colors":10,"bounds":[0,0,269,479],"integerRaster":true,"owner":"S01-LOC","environment":"S01-LOC","contact":390,"approval":"PRIVATE_CODE_CANDIDATE"},{"code":"S02-LOC-01","file":"assets/sealed/art/S02-LOC-01.png","sha256":"e6a55efd0832647b5b8ce8f4b50b090490c50218856b3f8f618f695131be95e3","width":270,"height":480,"alpha":[255],"colors":5,"bounds":[0,0,269,479],"integerRaster":true,"owner":"S02-LOC","environment":"S02-LOC","contact":390,"approval":"PRIVATE_CODE_CANDIDATE"},{"code":"S05-LOC-01","file":"assets/sealed/art/S05-LOC-01.png","sha256":"e229ad1f81007d7b5859863d1969d27d5df49ddf476eae0181a293c147a8c308","width":270,"height":480,"alpha":[255],"colors":4,"bounds":[0,0,269,479],"integerRaster":true,"owner":"S05-LOC","environment":"S05-LOC","contact":372,"approval":"PRIVATE_CODE_CANDIDATE"},{"code":"S07-LOC-01","file":"assets/sealed/art/S07-LOC-01.png","sha256":"7f2c275e9e86f3a6c2bfc2caaffc29ec1cf756210392decf13d6b37cb8b3df8e","width":270,"height":480,"alpha":[255],"colors":10,"bounds":[0,0,269,479],"integerRaster":true,"owner":"S07-LOC","environment":"S07-LOC","contact":372,"approval":"PRIVATE_CODE_CANDIDATE"},{"code":"S08-LOC-01","file":"assets/sealed/art/S08-LOC-01.png","sha256":"8e4486e696a0e6204041e4a0e9f2ace7eb03438a01e8c3473439211603a52024","width":270,"height":480,"alpha":[255],"colors":4,"bounds":[0,0,269,479],"integerRaster":true,"owner":"S08-LOC","environment":"S08-LOC","contact":390,"approval":"PRIVATE_CODE_CANDIDATE"},{"code":"M1-LOC-01","file":"assets/sealed/art/M1-LOC-01.png","sha256":"beec23bcb3dec7952d24405df3567a27f19850f4787bec69c9718352e30de063","width":270,"height":480,"alpha":[255],"colors":3,"bounds":[0,0,269,479],"integerRaster":true,"owner":"M1-LOC","environment":"M1-LOC","contact":372,"approval":"PRIVATE_CODE_CANDIDATE"},{"code":"G3-PLATFORM-01","file":"assets/sealed/art/G3-PLATFORM-01.png","sha256":"98adef918017b1863e91b65e096ad8e9948827e7cdbe1f765d5831208ddcb842","width":270,"height":480,"alpha":[255],"colors":12,"bounds":[0,0,269,479],"integerRaster":true,"owner":"G3-PLATFORM","environment":"G3-PLATFORM","contact":390,"approval":"PRIVATE_CODE_CANDIDATE"},{"code":"G3-DOOR-01","file":"assets/sealed/art/G3-DOOR-01.png","sha256":"6e98892cdba2f0aadd9cad426d21ce29c3e59d88185ba5ae0bf9f48bf1e3463a","width":270,"height":480,"alpha":[255],"colors":7,"bounds":[0,0,269,479],"integerRaster":true,"owner":"G3-DOOR","environment":"G3-DOOR","contact":390,"approval":"PRIVATE_CODE_CANDIDATE"},{"code":"G3-FLOOR-01","file":"assets/sealed/art/G3-FLOOR-01.png","sha256":"b9c40fb167b9568ccd3811f4cda96111ea7e61e7dc4fd52ea3c3491b14f61382","width":270,"height":480,"alpha":[255],"colors":6,"bounds":[0,0,269,479],"integerRaster":true,"owner":"G3-FLOOR","environment":"G3-FLOOR","contact":390,"approval":"PRIVATE_CODE_CANDIDATE"},{"code":"G3-OFFICE-01","file":"assets/sealed/art/G3-OFFICE-01.png","sha256":"ef5315df3e77cc618b2caaf66b909981c6fcfb8ca649c6b9969a27bb58025668","width":270,"height":480,"alpha":[255],"colors":11,"bounds":[0,0,269,479],"integerRaster":true,"owner":"G3-OFFICE","environment":"G3-OFFICE","contact":390,"approval":"PRIVATE_CODE_CANDIDATE"},{"code":"G3-ROOF-01","file":"assets/sealed/art/G3-ROOF-01.png","sha256":"2ee6331773263c145db14d1fc16b28af71f9026f7a1ba0c2bb51fea82528d01f","width":270,"height":480,"alpha":[255],"colors":4,"bounds":[0,0,269,479],"integerRaster":true,"owner":"G3-ROOF","environment":"G3-ROOF","contact":390,"approval":"PRIVATE_CODE_CANDIDATE"},{"code":"H5-HILLS-01","file":"assets/sealed/art/H5-HILLS-01.png","sha256":"b7317ca6a202ea0e0e87d407f108e8e033a0aee62176bd07546fe2453e70c390","width":270,"height":480,"alpha":[255],"colors":5,"bounds":[0,0,269,479],"integerRaster":true,"owner":"H5-HILLS","environment":"H5-HILLS","contact":390,"approval":"PRIVATE_CODE_CANDIDATE"},{"code":"H6-SPRING-01","file":"assets/sealed/art/H6-SPRING-01.png","sha256":"a77be7d58e809edaf96b3ae375efd134929801e8587a1cae5e525137bf939e94","width":270,"height":480,"alpha":[255],"colors":5,"bounds":[0,0,269,479],"integerRaster":true,"owner":"H6-SPRING","environment":"H6-SPRING","contact":390,"approval":"PRIVATE_CODE_CANDIDATE"},{"code":"P6-fur","file":"assets/sealed/art/P6-fur.png","sha256":"dabfb1fb616f7f56e8d17f1b745cc3790353df2752ab49a9b68b0c1ed5de5d46","width":80,"height":48,"alpha":[0,255],"colors":2,"bounds":[15,8,64,38],"integerRaster":true,"owner":"P6","anchor":[40,44]},{"code":"P6-D","file":"assets/sealed/art/P6-D.png","sha256":"e2846737083bdffc2db3bd6aee9772d0bdc50725e78f94ab85fd9b57b91189f7","width":80,"height":96,"alpha":[0,255],"colors":10,"bounds":[24,15,55,88],"integerRaster":true,"owner":"P6","actor":"P6-D","anchor":[40,88],"approval":"PRIVATE_CODE_CANDIDATE"},{"code":"P6-D-seated","file":"assets/sealed/art/P6-D-seated.png","sha256":"ff345dca8d3fc97da995e02daa5f2002bfb8db19f9bf27b552fcb31223d5c457","width":80,"height":96,"alpha":[0,255],"colors":10,"bounds":[23,15,57,88],"integerRaster":true,"owner":"P6","actor":"P6-D","anchor":[40,88],"approval":"PRIVATE_CODE_CANDIDATE"},{"code":"P6-snow","file":"assets/sealed/art/P6-snow.png","sha256":"2516e44e7242ad9f9a9cd10af0a057beb076997d2e5bd1d6ed907365a5e06515","width":270,"height":480,"alpha":[0,255],"colors":1,"bounds":[3,0,265,344],"integerRaster":true,"owner":"P6"},{"code":"P3-shades","file":"assets/sealed/art/P3-shades.png","sha256":"44b3bf86cecb16ec122d54f12ce27e97b9fe00e1f7d27f523f74f51960c4c8ec","width":24,"height":12,"alpha":[0,255],"colors":1,"bounds":[2,3,21,6],"integerRaster":true,"owner":"P3","anchor":[12,9]},{"code":"NO-S3-canopy","file":"assets/sealed/art/NO-S3-canopy.png","sha256":"28b104df402e2e9d65ee3dc3c5b3a9a77deedaf0c7e77104cc7a659d46142f66","width":270,"height":480,"alpha":[0,255],"colors":3,"bounds":[18,82,251,352],"integerRaster":true,"owner":"NO-S3"},{"code":"H9-card","file":"assets/sealed/art/H9-card.png","sha256":"525e1ef3c1baebd1c5bffc544a23867026cdb4775505a8e847307c2d75b77f63","width":270,"height":360,"alpha":[255],"colors":16,"bounds":[0,0,269,359],"integerRaster":true,"owner":"H9","approval":"HQ_PROXY_TASTE_PASS (OL-050)"},{"code":"ARC-X-cane","file":"assets/sealed/art/ARC-X-cane.png","sha256":"270585a764e1f6e35525eeb6abea3e13e4e0d13941d7f183962a188dca0eb3b5","width":40,"height":48,"alpha":[0,255],"colors":3,"bounds":[14,4,24,42],"integerRaster":true,"owner":"ARC-X-cane","anchor":[20,44]},{"code":"ARC-X-rung","file":"assets/sealed/art/ARC-X-rung.png","sha256":"7237724bb95ecebafeb35c5fa64a16803c28ff103dce6cb406610bb3821bea4e","width":40,"height":48,"alpha":[0,255],"colors":3,"bounds":[8,3,30,42],"integerRaster":true,"owner":"ARC-X-rung","anchor":[20,44]},{"code":"S06-egg","file":"assets/sealed/art/S06-egg.png","sha256":"d467da6d8b621fa714923f39a1f5a9a497b0ae8bbe940b59c9a6b9eebc81595b","width":40,"height":48,"alpha":[0,255],"colors":2,"bounds":[9,12,30,36],"integerRaster":true,"owner":"S06-egg","anchor":[20,44]},{"code":"S02-dice","file":"assets/sealed/art/S02-dice.png","sha256":"9dc35861b715da9d2a670b8329ff5f3bcd7233249a991b2cfbc939d35dbf2ac0","width":40,"height":48,"alpha":[0,255],"colors":4,"bounds":[7,8,33,30],"integerRaster":true,"owner":"S02-dice","anchor":[20,44]},{"code":"G4","file":"assets/sealed/art/G4.png","sha256":"616119f7b145945546caf8eb9738a7a93aa751f37f90555ee0684ba7f71d2191","width":40,"height":48,"alpha":[0,255],"colors":5,"bounds":[6,17,34,37],"integerRaster":true,"owner":"G4","anchor":[20,44]},{"code":"G3-hat","file":"assets/sealed/art/G3-hat.png","sha256":"6c5228f4a6755bc1ac3661eb17d9bc407b76edecf08444052407bf8c882ac1c1","width":40,"height":48,"alpha":[0,255],"colors":4,"bounds":[3,14,36,26],"integerRaster":true,"owner":"G3-hat","anchor":[20,44]},{"code":"H8A","file":"assets/sealed/art/H8A.png","sha256":"5767a00a53f2b44f39c64ca96d92b135d83652f887e0f5a22616513be330d573","width":40,"height":48,"alpha":[0,255],"colors":4,"bounds":[3,12,37,37],"integerRaster":true,"owner":"H8A","anchor":[20,44]},{"code":"H8B","file":"assets/sealed/art/H8B.png","sha256":"7803f100ff0ae4ac6264d24e82ec0240a77c05aa0a3b0306ffb7b654b092984e","width":40,"height":48,"alpha":[0,255],"colors":6,"bounds":[3,12,37,37],"integerRaster":true,"owner":"H8B","anchor":[20,44]},{"code":"H8C","file":"assets/sealed/art/H8C.png","sha256":"6f032bdb0e4259affd34d2af436c6454952f559747a73a22d7dedee9ccfe7bc0","width":40,"height":48,"alpha":[0,255],"colors":5,"bounds":[3,12,37,37],"integerRaster":true,"owner":"H8C","anchor":[20,44]},{"code":"ARC-X-A1-01","file":"assets/sealed/art/ARC-X-A1-01.png","sha256":"f780f972866804669af8122f7af495c468a65538f01517c60038e2350cb22567","width":80,"height":96,"alpha":[0,255],"colors":16,"bounds":[25,20,59,88],"integerRaster":true,"variantPass":"S12_ADDITIVE_V1","approval":"PRIVATE_CODE_CANDIDATE","owner":"ARC-X","actor":"ARC-X1","state":"neutral","anchor":[40,88],"face":[34,22,12,14]},{"code":"ARC-X-A1-02","file":"assets/sealed/art/ARC-X-A1-02.png","sha256":"5cd87e078fda7c3e543379346d223bd36c318d5cf72d016bfd94f9cbb3e0fd73","width":80,"height":96,"alpha":[0,255],"colors":16,"bounds":[12,20,68,88],"integerRaster":true,"variantPass":"S12_ADDITIVE_V1","approval":"PRIVATE_CODE_CANDIDATE","owner":"ARC-X","actor":"ARC-X1","state":"pitching","anchor":[40,88],"face":[34,22,12,14]},{"code":"ARC-X-A1-03","file":"assets/sealed/art/ARC-X-A1-03.png","sha256":"abb9eac0a636be958da1860e06ae6ead2da7b99ca7f555c7df12071acf04571e","width":80,"height":96,"alpha":[0,255],"colors":17,"bounds":[25,20,62,88],"integerRaster":true,"variantPass":"S12_ADDITIVE_V1","approval":"PRIVATE_CODE_CANDIDATE","owner":"ARC-X","actor":"ARC-X1","state":"cane_tap","anchor":[40,88],"face":[34,22,12,14]},{"code":"ARC-X-A1-04","file":"assets/sealed/art/ARC-X-A1-04.png","sha256":"c58258a02ef4161944a999cd9b7e9136319340bfd396cc62cbe790908b1de505","width":80,"height":96,"alpha":[0,255],"colors":15,"bounds":[25,20,59,88],"integerRaster":true,"variantPass":"S12_ADDITIVE_V1","approval":"PRIVATE_CODE_CANDIDATE","owner":"ARC-X","actor":"ARC-X1","state":"unmasked","anchor":[40,88],"face":[34,22,12,14],"paletteAuthority":"OL-050 B"},{"code":"ARC-X-A1-05","file":"assets/sealed/art/ARC-X-A1-05.png","sha256":"c4fcbed81b89edbc16047d792fafb815adce5c9ee6e3bbaecf1ecddad3a5e2a5","width":80,"height":96,"alpha":[0,255],"colors":19,"bounds":[25,20,59,88],"integerRaster":true,"variantPass":"S12_ADDITIVE_V1","approval":"PRIVATE_CODE_CANDIDATE","owner":"ARC-X","actor":"ARC-X1","state":"withered","anchor":[40,88],"face":[34,22,12,14]},{"code":"ARC-X-A2-01","file":"assets/sealed/art/ARC-X-A2-01.png","sha256":"e2e1f0bae33506c31bfba2d00f66d2e1173a7a468de7376190a7dad7d03dd7b9","width":80,"height":96,"alpha":[0,255],"colors":11,"bounds":[24,26,55,88],"integerRaster":true,"variantPass":"S12_ADDITIVE_V1","approval":"PRIVATE_CODE_CANDIDATE","owner":"ARC-X","actor":"ARC-X2","state":"neutral","anchor":[40,88],"face":[34,28,12,14]},{"code":"ARC-X-A2-02","file":"assets/sealed/art/ARC-X-A2-02.png","sha256":"b972745af9444d81eea09728624e142e2b66d38fabdc1d04f21273fd02e6c0b9","width":80,"height":96,"alpha":[0,255],"colors":11,"bounds":[24,26,55,88],"integerRaster":true,"variantPass":"S12_ADDITIVE_V1","approval":"PRIVATE_CODE_CANDIDATE","owner":"ARC-X","actor":"ARC-X2","state":"smiling","anchor":[40,88],"face":[34,28,12,14]},{"code":"ARC-X-LOC-OPEN","file":"assets/sealed/art/ARC-X-LOC-OPEN.png","sha256":"508b471556e1ddd8cdad7c12eaba73346a0776b335ddd2b5050280202f7dba21","width":270,"height":480,"alpha":[255],"colors":16,"bounds":[0,0,269,479],"integerRaster":true,"variantPass":"S12_ADDITIVE_V1","approval":"PRIVATE_CODE_CANDIDATE","owner":"ARC-X","environment":"ARC-X-LOC","state":"open","contact":380},{"code":"ARC-X-LOC-COLLAPSE","file":"assets/sealed/art/ARC-X-LOC-COLLAPSE.png","sha256":"6ba193630670b30646a90febc561d68ded942f73e45add53a22fae5e88e9f730","width":270,"height":480,"alpha":[255],"colors":13,"bounds":[0,0,269,479],"integerRaster":true,"variantPass":"S12_ADDITIVE_V1","approval":"PRIVATE_CODE_CANDIDATE","owner":"ARC-X","environment":"ARC-X-LOC","state":"collapse","contact":380},{"code":"ARC-X-LOC-DELTA","file":"assets/sealed/art/ARC-X-LOC-DELTA.png","sha256":"6830a06f4caeb4378846c7d0b62ae0335cdc09412e6809b12d8e4f027f21d7bc","width":270,"height":480,"alpha":[0,255],"colors":4,"bounds":[34,349,235,398],"integerRaster":true,"variantPass":"S12_ADDITIVE_V1","approval":"PRIVATE_CODE_CANDIDATE","owner":"ARC-X","environment":"ARC-X-collapse","state":"collapse_overlay","contact":480},{"code":"ARC-X-CARD","file":"assets/sealed/art/ARC-X-CARD.png","sha256":"f96ed99bd930d59b7c846c86940ac5914e3d40ac7fb1c5e0b0e6f152049594c0","width":48,"height":32,"alpha":[0,255],"colors":4,"bounds":[2,4,45,27],"integerRaster":true,"variantPass":"S12_ADDITIVE_V1","approval":"PRIVATE_CODE_CANDIDATE","owner":"ARC-X","anchor":[24,27]},{"code":"ARC-X-BROCHURE","file":"assets/sealed/art/ARC-X-BROCHURE.png","sha256":"722334678dd8a4345db89a32678c0722b439bb0c28dd01f409665d7b785b4fc2","width":160,"height":112,"alpha":[255],"colors":23,"bounds":[0,0,159,111],"integerRaster":true,"variantPass":"S12_ADDITIVE_V1","approval":"PRIVATE_CODE_CANDIDATE","owner":"ARC-X","anchor":[80,112],"reusedOpenPortrait":{"file":"assets/before_the_fame/characters/vicky/vicky_neutral_80x96.png","sha256":"13a707e3a8ecdb43882adb0a688b02500a8f75776cf7ec658c8c37d0d8bd8efb","crop":[24,24,32,64],"scale":1}},{"code":"ARC-X-PLAN-FRAME","file":"assets/sealed/art/ARC-X-PLAN-FRAME.png","sha256":"129e9af4273e824e4dd81ea260534f9fac28979ff414d54574a2a5657dbd5258","width":270,"height":480,"alpha":[0,255],"colors":6,"bounds":[0,112,267,458],"integerRaster":true,"variantPass":"S12_ADDITIVE_V1","approval":"PRIVATE_CODE_CANDIDATE","owner":"ARC-X","anchor":[135,480]},{"code":"S04-02","file":"assets/sealed/art/S04-02.png","sha256":"26961bc43a8ab876a0ac083230ee6244275cd7d37ed5e783acbc671d055c78a3","width":80,"height":96,"alpha":[0,255],"colors":11,"bounds":[22,27,55,88],"integerRaster":true,"variantPass":"S12_ADDITIVE_V1","approval":"PRIVATE_CODE_CANDIDATE","owner":"S04","actor":"S04","state":"playing","stateAuthority":"Engineering alias for the authored beat-play moment; source specifies two states without names.","anchor":[40,88],"face":[34,32,12,14]},{"code":"S06-HH","file":"assets/sealed/art/S06-HH.png","sha256":"2480a553c4537e70ca4be682047828e60c326ac637f710183a269784efa91a21","width":80,"height":96,"alpha":[0,255],"colors":7,"bounds":[2,42,73,88],"integerRaster":true,"variantPass":"S12_ADDITIVE_V1","approval":"PRIVATE_CODE_CANDIDATE","owner":"S06","actor":"S06","stage":"hatchling","state":"happy","anchor":[40,88],"face":[48,43,20,21]},{"code":"S06-YN","file":"assets/sealed/art/S06-YN.png","sha256":"3699c8466e195082f498c3628a1a0235c88ac781e0eef834c9fca7dc5c55fa95","width":80,"height":96,"alpha":[0,255],"colors":7,"bounds":[1,33,74,88],"integerRaster":true,"variantPass":"S12_ADDITIVE_V1","approval":"PRIVATE_CODE_CANDIDATE","owner":"S06","actor":"S06","stage":"young","state":"neutral","anchor":[40,88],"face":[47,34,23,27]},{"code":"S06-YH","file":"assets/sealed/art/S06-YH.png","sha256":"688b84a1fbf8926f661af189300b68c23ebd0d132649ef60660dad1fbd0e32cb","width":80,"height":96,"alpha":[0,255],"colors":7,"bounds":[0,33,74,88],"integerRaster":true,"variantPass":"S12_ADDITIVE_V1","approval":"PRIVATE_CODE_CANDIDATE","owner":"S06","actor":"S06","stage":"young","state":"happy","anchor":[40,88],"face":[47,34,23,27]},{"code":"H6-01","file":"assets/sealed/art/H6-01.png","sha256":"a6e55d0ec65fccdb03adf92bbf273566c5681a787777a6f9c5824673aa7d0aeb","width":80,"height":96,"alpha":[0,255],"colors":21,"bounds":[18,34,61,88],"integerRaster":true,"variantPass":"OL050_B","approval":"OL050_PRIVATE_CODE","owner":"H6","actor":"ceo_assistant_001","state":"swimwear","adult":true,"minimumAdultAge":21,"anchor":[40,88],"face":[30,42,19,12],"identityPixels":{"file":"assets/assistant_idle.png","sha256":"a4f4d7b73814d30bb7f1c79e5beac3954e57d6133cb181617e8aae0c7a4683a5","crop":[0,0,80,57],"scale":1}},{"code":"H6-02","file":"assets/sealed/art/H6-02.png","sha256":"2e34cd76a7b6b0e9899d2889c788a404bb4540264f1ba5bf4bb49b98f48fcfa0","width":80,"height":96,"alpha":[0,255],"colors":20,"bounds":[18,34,61,88],"integerRaster":true,"variantPass":"OL050_B","approval":"OL050_PRIVATE_CODE","owner":"H6","actor":"jdm_importer_daughter_001","state":"swimwear","adult":true,"minimumAdultAge":21,"anchor":[40,88],"face":[33,43,15,16],"identityPixels":{"file":"assets/jdm_imports/characters/daughter/daughter_neutral.png","sha256":"6454e833dace10f8efbd49351346ea9babf22ad9c006a1bb789cf62c156a48c6","crop":[0,0,80,62],"scale":1}},{"code":"H6-03","file":"assets/sealed/art/H6-03.png","sha256":"69858e82f987f2a45734981abd644a4e27b248c475716201463a27e71d0309d1","width":80,"height":96,"alpha":[0,255],"colors":21,"bounds":[18,26,74,88],"integerRaster":true,"variantPass":"OL050_B","approval":"OL050_PRIVATE_CODE","owner":"H6","actor":"mazda_human","state":"swimwear","adult":true,"minimumAdultAge":21,"anchor":[40,88],"face":[36,29,11,9],"identityPixels":{"file":"assets/before_the_fame/characters/mazda_human/blueberry_mazda_human_neutral_80x96.png","sha256":"2e2c7246ca6d1dc583c814659bbb0d0df18688db5c86adcad6c6767ddb979290","crop":[0,0,80,41],"scale":1}},{"code":"H6-04","file":"assets/sealed/art/H6-04.png","sha256":"8fed8dc42d3e9574182f7db02431b4325a1600bccaf04a5eb41e8a7f76c6329a","width":80,"height":96,"alpha":[0,255],"colors":20,"bounds":[18,36,61,88],"integerRaster":true,"variantPass":"OL050_B","approval":"OL050_PRIVATE_CODE","owner":"H6","actor":"kiki","state":"swimwear","adult":true,"minimumAdultAge":21,"anchor":[40,88],"face":[35,40,9,9],"identityPixels":{"file":"assets/before_the_fame/characters/kiki/kiki_neutral_work_80x96.png","sha256":"fdc064d97ecf53e99b6f3a8bfea850609901f27b017dce0bccbea0b4882f8054","crop":[0,0,80,52],"scale":1}},{"code":"H6-05","file":"assets/sealed/art/H6-05.png","sha256":"006c41ad93f0ab000291b6a970a1aee521fc021c9ce06c346fa4a13bbb8644c8","width":80,"height":96,"alpha":[0,255],"colors":17,"bounds":[18,32,61,88],"integerRaster":true,"variantPass":"OL050_B","approval":"OL050_PRIVATE_CODE","owner":"H6","actor":"nneka","state":"swimwear","adult":true,"minimumAdultAge":21,"anchor":[40,88],"face":[34,36,10,9],"identityPixels":{"file":"assets/before_the_fame/characters/nneka/nneka_neutral_80x96.png","sha256":"cdf57badf9a9961af5a971d9c222c95152343d1f2debcd6959eb96615b83e6ef","crop":[0,0,80,48],"scale":1}},{"code":"H6-06","file":"assets/sealed/art/H6-06.png","sha256":"0ab45c08e8be4ff7180629e362bc8557cd03a4d2b6e396480f8d327e94a70ced","width":80,"height":96,"alpha":[0,255],"colors":23,"bounds":[18,32,61,88],"integerRaster":true,"variantPass":"OL050_B","approval":"OL050_PRIVATE_CODE","owner":"H6","actor":"pinky","state":"swimwear","adult":true,"minimumAdultAge":21,"anchor":[40,88],"face":[33,41,14,17],"identityPixels":{"file":"assets/before_the_fame/art_ship_014/package_a/A-pinky-neutral.png","sha256":"ce8cb2b12f2f85730fb637f3bb751c3876fce8747a38a2ba28021e7bcea1925d","crop":[0,0,80,61],"scale":1}},{"code":"H6-07","file":"assets/sealed/art/H6-07.png","sha256":"834c753dd40eaaf9dd010c19fbdac544b364d420c4a8260c1d95875b2f704d41","width":80,"height":96,"alpha":[0,255],"colors":24,"bounds":[18,28,61,88],"integerRaster":true,"variantPass":"OL050_B","approval":"OL050_PRIVATE_CODE","owner":"H6","actor":"moonie","state":"swimwear","adult":true,"minimumAdultAge":21,"anchor":[40,88],"face":[35,34,10,9],"identityPixels":{"file":"assets/before_the_fame/characters/moonie/moonie_dorsey_neutral_80x96.png","sha256":"28106700746dec289e896894d1be6ebf5e23cefc26bd15b58367836b17c43e49","crop":[0,0,80,46],"scale":1}},{"code":"H6-08","file":"assets/sealed/art/H6-08.png","sha256":"168b944e6116891ee64e3d8fd0df6636e183deb81065e5de35a6cb284d07775b","width":80,"height":96,"alpha":[0,255],"colors":23,"bounds":[18,30,61,88],"integerRaster":true,"variantPass":"OL050_B","approval":"OL050_PRIVATE_CODE","owner":"H6","actor":"kaede","state":"swimwear","adult":true,"minimumAdultAge":21,"anchor":[40,88],"face":[35,34,9,9],"identityPixels":{"file":"assets/before_the_fame/characters/kaede/kaede_neutral_80x96.png","sha256":"74aab07edffac683482517ca48fb0ffafc63ad9492c9adf14de88d4d442a3251","crop":[0,0,80,46],"scale":1}},{"code":"H6-09","file":"assets/sealed/art/H6-09.png","sha256":"8df6abc92915ccff052b5bf02f7c0380f03cb26033966009fd34f08485a63c74","width":80,"height":96,"alpha":[0,255],"colors":20,"bounds":[18,31,61,88],"integerRaster":true,"variantPass":"OL050_B","approval":"OL050_PRIVATE_CODE","owner":"H6","actor":"wispa","state":"swimwear","adult":true,"minimumAdultAge":21,"anchor":[40,88],"face":[35,36,10,10],"identityPixels":{"file":"assets/before_the_fame/characters/wispa/wispa_neutral_80x96.png","sha256":"e80a09c69320db06a2816d64bf515652cd84d4d899df9c438ec00b36c820b319","crop":[0,0,80,49],"scale":1}},{"code":"H6-10","file":"assets/sealed/art/H6-10.png","sha256":"22019e3016f21714d0ce1b84c8dd0790cd76b71f44404f94cbf09e9d95df7b15","width":80,"height":96,"alpha":[0,255],"colors":23,"bounds":[18,30,61,88],"integerRaster":true,"variantPass":"OL050_B","approval":"OL050_PRIVATE_CODE","owner":"H6","actor":"tasha","state":"swimwear","adult":true,"minimumAdultAge":21,"anchor":[40,88],"face":[34,38,11,9],"identityPixels":{"file":"assets/before_the_fame/characters/tasha/tasha_tastemaker_filming_80x96.png","sha256":"744c37144d01cec4eb8e4bebf06f1eb664a8326772178f0795b35d02360096df","crop":[0,0,80,50],"scale":1}},{"code":"H6-11","file":"assets/sealed/art/H6-11.png","sha256":"d9d9cff5bb24bc10138ae8f4178117551ba40042fa09e8be7e7778a662d8fdc0","width":80,"height":96,"alpha":[0,255],"colors":24,"bounds":[18,28,61,88],"integerRaster":true,"variantPass":"OL050_B","approval":"OL050_PRIVATE_CODE","owner":"H6","actor":"marisol","state":"swimwear","adult":true,"minimumAdultAge":21,"anchor":[40,88],"face":[33,33,9,8],"identityPixels":{"file":"assets/before_the_fame/characters/marisol/marisol_neutral_80x96.png","sha256":"a906c82b5796e0a6ac7931790c88f7c235672d4b16b977175a10c446a1d80bb7","crop":[0,0,80,44],"scale":1}},{"code":"H6-12","file":"assets/sealed/art/H6-12.png","sha256":"d99937bbd1b30e85d1687626221dd4a33a82ab0b468f948c3e5ea3129cbf7159","width":80,"height":96,"alpha":[0,255],"colors":22,"bounds":[18,20,61,88],"integerRaster":true,"variantPass":"OL050_B","approval":"OL050_PRIVATE_CODE","owner":"H6","actor":"duchess","state":"swimwear","adult":true,"minimumAdultAge":21,"anchor":[40,88],"face":[33,24,10,9],"identityPixels":{"file":"assets/before_the_fame/characters/duchess/duchess_bathory_brown_neutral_80x96.png","sha256":"487aa9ce49c009a6a30fdc20a6d69ae8f40c908f85adeedb16fc1e7e94a8d6c8","crop":[0,0,80,36],"scale":1}},{"code":"H6-13","file":"assets/sealed/art/H6-13.png","sha256":"11291281434ab688996e16d7eb2faf387be8da6855f6e4ef4aa15f7cda7e231e","width":80,"height":96,"alpha":[0,255],"colors":23,"bounds":[18,28,61,88],"integerRaster":true,"variantPass":"OL050_B","approval":"OL050_PRIVATE_CODE","owner":"H6","actor":"nightshade","state":"swimwear","adult":true,"minimumAdultAge":21,"anchor":[40,88],"face":[31,33,9,9],"identityPixels":{"file":"assets/before_the_fame/characters/nightshade/nightshade_neutral_80x96.png","sha256":"09d8c0f67cff92740e292cf86a5d223bb055a241bf6e635e274d7baae85eb04c","crop":[0,0,80,45],"scale":1}},{"code":"H6-14","file":"assets/sealed/art/H6-14.png","sha256":"d22a77469000af6e8bd39231ec74c6bacd7949b8b93dc65ff8909c2bcaf2ea1e","width":80,"height":96,"alpha":[0,255],"colors":23,"bounds":[18,20,74,88],"integerRaster":true,"variantPass":"OL050_B","approval":"OL050_PRIVATE_CODE","owner":"H6","actor":"emberly","state":"swimwear","adult":true,"minimumAdultAge":21,"anchor":[40,88],"face":[34,26,10,9],"identityPixels":{"file":"assets/before_the_fame/characters/emberly/emberly_neutral_80x96.png","sha256":"57b0d61d3a7b7b2a7811fd1c382e18b715464701da8f388982d4350be0109e85","crop":[0,0,80,38],"scale":1}},{"code":"H6-15","file":"assets/sealed/art/H6-15.png","sha256":"d1e4966447d78f1e06701776b0c74b0597cd4de40eaf2398e13f3a474171718b","width":80,"height":96,"alpha":[0,255],"colors":19,"bounds":[18,16,74,88],"integerRaster":true,"variantPass":"OL050_B","approval":"OL050_PRIVATE_CODE","owner":"H6","actor":"jade","state":"swimwear","adult":true,"minimumAdultAge":21,"anchor":[40,88],"face":[35,23,11,9],"identityPixels":{"file":"assets/before_the_fame/characters/jade/jade_wyrmwood_neutral_80x96.png","sha256":"f9fe8221111c534170bb595908dd1008ac3f3c5753e51a87ba68a47b7d21482c","crop":[0,0,80,35],"scale":1}},{"code":"H6-16","file":"assets/sealed/art/H6-16.png","sha256":"945ae3839813175ac712200d028af4c3b8177cb6fb9c0d70adb1356993062027","width":80,"height":96,"alpha":[0,255],"colors":18,"bounds":[18,28,61,88],"integerRaster":true,"variantPass":"OL050_B","approval":"OL050_PRIVATE_CODE","owner":"H6","actor":"lo","state":"swimwear","adult":true,"minimumAdultAge":21,"anchor":[40,88],"face":[33,32,9,9],"identityPixels":{"file":"assets/before_the_fame/characters/lo/lo_dolores_neutral_80x96.png","sha256":"c69902507388bb4c81259baccde552170422b62f07ce9c44b88f9ad850c1a882","crop":[0,0,80,44],"scale":1}},{"code":"H6-17","file":"assets/sealed/art/H6-17.png","sha256":"fb6589242391cc89f687e5e6b5163a19678554f92216357a72a00147076fd257","width":80,"height":96,"alpha":[0,255],"colors":23,"bounds":[18,28,61,88],"integerRaster":true,"variantPass":"OL050_B","approval":"OL050_PRIVATE_CODE","owner":"H6","actor":"brenda","state":"swimwear","adult":true,"minimumAdultAge":21,"anchor":[40,88],"face":[32,31,10,11],"identityPixels":{"file":"assets/before_the_fame/characters/brenda/brenda_neutral_80x96.png","sha256":"bf394cabb65b4951fefc8d1ba3910f85e3cdbad870310802bfce407b5609222a","crop":[0,0,80,45],"scale":1}},{"code":"H6-18","file":"assets/sealed/art/H6-18.png","sha256":"acb117cb89b753d7e52186d9bb5c24ede3b4eb46f453fb2890dfb5fc553c773f","width":80,"height":96,"alpha":[0,255],"colors":22,"bounds":[18,28,61,88],"integerRaster":true,"variantPass":"OL050_B","approval":"OL050_PRIVATE_CODE","owner":"H6","actor":"hina","state":"swimwear","adult":true,"minimumAdultAge":21,"anchor":[40,88],"face":[33,31,9,8],"identityPixels":{"file":"assets/before_the_fame/characters/hina/hina_neutral_80x96.png","sha256":"c7bacc6885281fd0bb41cf7f633613fb88b8176d164b75fe56cf71a05356c23b","crop":[0,0,80,42],"scale":1}},{"code":"H6-19","file":"assets/sealed/art/H6-19.png","sha256":"b41740924b9e5a198530bd47541ae0834955671dc0fa08af3bfc2d46f0a94cfb","width":80,"height":96,"alpha":[0,255],"colors":19,"bounds":[18,30,61,88],"integerRaster":true,"variantPass":"OL050_B","approval":"OL050_PRIVATE_CODE","owner":"H6","actor":"bunmi","state":"swimwear","adult":true,"minimumAdultAge":21,"anchor":[40,88],"face":[32,35,12,10],"identityPixels":{"file":"assets/before_the_fame/characters/bunmi/bunmi_neutral_80x96.png","sha256":"72b14eed28c57c93343a4fbe2c40e23ac99e4006f53cc57484f1d58e73cad414","crop":[0,0,80,48],"scale":1}},{"code":"H6-20","file":"assets/sealed/art/H6-20.png","sha256":"de15202ff38b822ab6ea04247295979bdc38c8b147d10504e0f06be2b8bfe876","width":80,"height":96,"alpha":[0,255],"colors":23,"bounds":[18,26,61,88],"integerRaster":true,"variantPass":"OL050_B","approval":"OL050_PRIVATE_CODE","owner":"H6","actor":"velvet","state":"swimwear","adult":true,"minimumAdultAge":21,"anchor":[40,88],"face":[35,33,8,8],"identityPixels":{"file":"assets/before_the_fame/characters/velvet/velvet_vantablack_profile_80x96.png","sha256":"6ec938de55fa0eee45ed4d5decd30661c1899b85effdac82873ed25ca7355610","crop":[0,0,80,44],"scale":1}},{"code":"H6-21","file":"assets/sealed/art/H6-21.png","sha256":"ccc57670e848d35bf9268e504a37524374b248cfb10515bdf250494b47cb93db","width":80,"height":96,"alpha":[0,255],"colors":24,"bounds":[18,30,61,88],"integerRaster":true,"variantPass":"OL050_B","approval":"OL050_PRIVATE_CODE","owner":"H6","actor":"june","state":"swimwear","adult":true,"minimumAdultAge":21,"anchor":[40,88],"face":[36,40,9,10],"identityPixels":{"file":"assets/before_the_fame/characters/june/june_neutral_80x96.png","sha256":"89bae51dba181a599446150d1df64494e71ad0646b3782ce1fde3738eb5d5c76","crop":[0,0,80,53],"scale":1}},{"code":"H6-22","file":"assets/sealed/art/H6-22.png","sha256":"4a25b9c3f85a3e989e45e6b746aecec69911b0982631590e34f8701777d24043","width":80,"height":96,"alpha":[0,255],"colors":18,"bounds":[18,28,61,88],"integerRaster":true,"variantPass":"OL050_B","approval":"OL050_PRIVATE_CODE","owner":"H6","actor":"ms_patrice","state":"swimwear","adult":true,"minimumAdultAge":21,"anchor":[40,88],"face":[35,34,10,9],"identityPixels":{"file":"assets/before_the_fame/characters/ms_patrice/ms_patrice_neutral_80x96.png","sha256":"b565bd37630f630080892acb4e6c48498b314d168778d31d0d93d7a65fdde5a3","crop":[0,0,80,46],"scale":1}},{"code":"H6-23","file":"assets/sealed/art/H6-23.png","sha256":"b457f9ae3a1ef38c11b1633284809e106d59f8301d5aae6134abc4b04733f530","width":80,"height":96,"alpha":[0,255],"colors":23,"bounds":[18,26,61,88],"integerRaster":true,"variantPass":"OL050_B","approval":"OL050_PRIVATE_CODE","owner":"H6","actor":"anfeesa","state":"swimwear","adult":true,"minimumAdultAge":21,"anchor":[40,88],"face":[31,35,13,10],"identityPixels":{"file":"assets/before_the_fame/characters/anfeesa/dj_anfeesa_neutral_80x96.png","sha256":"7c896d24097a7e6d98edf07ea1113ee4750d1147b6b1ab5c5cbe60bd126d9f0f","crop":[0,0,80,48],"scale":1}},{"code":"C1-LOC","file":"assets/sealed/art/C1-LOC.png","sha256":"c7e79a0aefae5b317a1fbf336cdf4a0913e3546071fadfdc0dc4f2fba0c758e1","width":270,"height":480,"alpha":[255],"colors":20,"bounds":[0,0,269,479],"integerRaster":true,"variantPass":"OL050_B","approval":"OL050_PRIVATE_CODE","owner":"C1","environment":"C1-LOC","contact":390,"culturalDirection":"OL-050 B; authored warm crowded kitchen only; no symbols or invented regional ornament."},{"code":"C1-N","file":"assets/sealed/art/C1-N.png","sha256":"8e50acf2e705fa9f519afc45aa2e7cb419820fa4834bf5af061ab9725217744c","width":80,"height":96,"alpha":[0,255],"colors":9,"bounds":[19,25,57,88],"integerRaster":true,"variantPass":"OL050_B","approval":"OL050_PRIVATE_CODE","owner":"C1","actor":"C1-N","state":"neutral","adult":true,"minimumAdultAge":21,"anchor":[40,88],"face":[34,33,12,14]},{"code":"C1-SPOON","file":"assets/sealed/art/C1-SPOON.png","sha256":"2dbc4f5485b3932098be23ed7d18d3a8129cb26182cb06ebb08fb7f5cc18dce2","width":24,"height":12,"alpha":[0,255],"colors":2,"bounds":[3,3,21,7],"integerRaster":true,"variantPass":"OL050_B","approval":"OL050_PRIVATE_CODE","owner":"C1","anchor":[12,10]},{"code":"P7-01","file":"assets/sealed/art/P7-01.png","sha256":"94c0144cfcc72937b4861096b038582f79a97b84be570d9f35da69d4ba6f2fe0","width":80,"height":96,"alpha":[0,255],"colors":6,"bounds":[26,35,54,88],"integerRaster":true,"variantPass":"OL050_B","approval":"OL050_PRIVATE_CODE","owner":"P7","actor":"half_pint","state":"portrait","adult":true,"minimumAdultAge":21,"anchor":[40,88],"face":[34,39,12,14]},{"code":"P7-02","file":"assets/sealed/art/P7-02.png","sha256":"6af1fb58d10b6755deafb010a70397f30059436f60cc1e295f205924c30730e2","width":80,"height":96,"alpha":[0,255],"colors":11,"bounds":[24,22,55,88],"integerRaster":true,"variantPass":"OL050_B","approval":"OL050_PRIVATE_CODE","owner":"P7","actor":"sunday_best","state":"portrait","adult":true,"minimumAdultAge":21,"anchor":[40,88],"face":[34,24,12,14]},{"code":"P7-03","file":"assets/sealed/art/P7-03.png","sha256":"b7baa8061247f6ca9a0dbb951d6ea5865726e557d9b8070d5c3156f8c560cc21","width":80,"height":96,"alpha":[0,255],"colors":11,"bounds":[24,25,55,88],"integerRaster":true,"variantPass":"OL050_B","approval":"OL050_PRIVATE_CODE","owner":"P7","actor":"young_mazi","state":"portrait","adult":true,"minimumAdultAge":21,"anchor":[40,88],"face":[34,27,12,14]},{"code":"P7-04","file":"assets/sealed/art/P7-04.png","sha256":"ebe4f4ace534e3e6f3283f65cbff78e746bc3d2e855f0864f18356f68888f1a5","width":80,"height":96,"alpha":[0,255],"colors":10,"bounds":[23,21,57,88],"integerRaster":true,"variantPass":"OL050_B","approval":"OL050_PRIVATE_CODE","owner":"P7","actor":"auntie_grit","state":"portrait","adult":true,"minimumAdultAge":21,"anchor":[40,88],"face":[34,29,12,14]},{"code":"P7-C01","file":"assets/sealed/art/P7-C01.png","sha256":"cf172dd578f4d578826f96e0b39a8817cb7ce87864fcc50ed09b7b313c2dbee6","width":80,"height":96,"alpha":[0,255],"colors":8,"bounds":[24,27,55,88],"integerRaster":true,"variantPass":"OL050_B","approval":"OL050_PRIVATE_CODE","owner":"P7","actor":"P7-C01","state":"portrait","recruitClass":"GHOST","adult":true,"minimumAdultAge":21,"anchor":[40,88],"face":[34,29,12,14]},{"code":"P7-C02","file":"assets/sealed/art/P7-C02.png","sha256":"827ed6ebc5bd0f83f6aa033bce4355fa0fd0da3cdee3ac276a978a32b1b9a12a","width":80,"height":96,"alpha":[0,255],"colors":8,"bounds":[24,27,55,88],"integerRaster":true,"variantPass":"OL050_B","approval":"OL050_PRIVATE_CODE","owner":"P7","actor":"P7-C02","state":"portrait","recruitClass":"TALKER","adult":true,"minimumAdultAge":21,"anchor":[40,88],"face":[34,29,12,14]},{"code":"P7-C03","file":"assets/sealed/art/P7-C03.png","sha256":"f72862176a67738f7f56fba395618532f331b9b772a6e47c4aab0922f698f947","width":80,"height":96,"alpha":[0,255],"colors":8,"bounds":[22,27,58,88],"integerRaster":true,"variantPass":"OL050_B","approval":"OL050_PRIVATE_CODE","owner":"P7","actor":"P7-C03","state":"portrait","recruitClass":"MUSCLE","adult":true,"minimumAdultAge":21,"anchor":[40,88],"face":[34,29,12,14]},{"code":"P7-C04","file":"assets/sealed/art/P7-C04.png","sha256":"3b019284d576c7b653abe0c2f74536f5aabc6c99d9e140e1d1c83ee3ed5773ff","width":80,"height":96,"alpha":[0,255],"colors":8,"bounds":[24,27,55,88],"integerRaster":true,"variantPass":"OL050_B","approval":"OL050_PRIVATE_CODE","owner":"P7","actor":"P7-C04","state":"portrait","recruitClass":"SHOOTER","adult":true,"minimumAdultAge":21,"anchor":[40,88],"face":[34,29,12,14]},{"code":"P7-C05","file":"assets/sealed/art/P7-C05.png","sha256":"15be1b20392783f0a9ec5779b177756c3d2a974bdd4d9feb4dd1ae99b52e3a41","width":80,"height":96,"alpha":[0,255],"colors":8,"bounds":[24,27,55,88],"integerRaster":true,"variantPass":"OL050_B","approval":"OL050_PRIVATE_CODE","owner":"P7","actor":"P7-C05","state":"portrait","recruitClass":"WHEELS","adult":true,"minimumAdultAge":21,"anchor":[40,88],"face":[34,29,12,14]},{"code":"P7-C06","file":"assets/sealed/art/P7-C06.png","sha256":"4c292125d749fbbdd49667877b71280809fcf0235f7fc346e8ce89db93825cc4","width":80,"height":96,"alpha":[0,255],"colors":8,"bounds":[24,27,55,88],"integerRaster":true,"variantPass":"OL050_B","approval":"OL050_PRIVATE_CODE","owner":"P7","actor":"P7-C06","state":"portrait","recruitClass":"DOC","adult":true,"minimumAdultAge":21,"anchor":[40,88],"face":[34,29,12,14]},{"code":"C4-cover","file":"assets/sealed/art/C4-cover.png","sha256":"6be3f70f72866353aa2a98e66a56bfebf5581fcc89c7fe0662e4cf3d62b0d1e4","width":64,"height":64,"alpha":[255],"colors":6,"bounds":[0,0,63,63],"integerRaster":true,"variantPass":"OL050_B","approval":"OL050_PRIVATE_CODE","owner":"C4","nativeTile":true,"anchor":[32,64],"titleAuthority":"Existing authored untitled label; abstract record only."}],"h6":{"minimumAdultAge":21,"source":"work/source-text/source-26.txt:153-157","grammar":"VOL 2; approved identity crop plus integer native swimwear; no explicit anatomy.","states":{"ceo_assistant_001":"assets/sealed/art/H6-01.png","jdm_importer_daughter_001":"assets/sealed/art/H6-02.png","mazda_human":"assets/sealed/art/H6-03.png","kiki":"assets/sealed/art/H6-04.png","nneka":"assets/sealed/art/H6-05.png","pinky":"assets/sealed/art/H6-06.png","moonie":"assets/sealed/art/H6-07.png","kaede":"assets/sealed/art/H6-08.png","wispa":"assets/sealed/art/H6-09.png","tasha":"assets/sealed/art/H6-10.png","marisol":"assets/sealed/art/H6-11.png","duchess":"assets/sealed/art/H6-12.png","nightshade":"assets/sealed/art/H6-13.png","emberly":"assets/sealed/art/H6-14.png","jade":"assets/sealed/art/H6-15.png","lo":"assets/sealed/art/H6-16.png","brenda":"assets/sealed/art/H6-17.png","hina":"assets/sealed/art/H6-18.png","bunmi":"assets/sealed/art/H6-19.png","velvet":"assets/sealed/art/H6-20.png","june":"assets/sealed/art/H6-21.png","ms_patrice":"assets/sealed/art/H6-22.png","anfeesa":"assets/sealed/art/H6-23.png"}},"p7":{"authority":"OL-050 B","approvedBranch":"build/visual-completion-002","automaticPreference":"Approved OPEN portrait/neutral master from the runtime registry wins after merge.","portraits":{"half_pint":"assets/sealed/art/P7-01.png","sunday_best":"assets/sealed/art/P7-02.png","young_mazi":"assets/sealed/art/P7-03.png","auntie_grit":"assets/sealed/art/P7-04.png"},"classes":{"GHOST":"assets/sealed/art/P7-C01.png","TALKER":"assets/sealed/art/P7-C02.png","MUSCLE":"assets/sealed/art/P7-C03.png","SHOOTER":"assets/sealed/art/P7-C04.png","WHEELS":"assets/sealed/art/P7-C05.png","DOC":"assets/sealed/art/P7-C06.png"}}};

window.RABuild3AudioCatalog={"ref":"40fd2bc02e4793380fbf9f6cb04c95113a46db11","rows":[{"id":"SEAL_01","bus":"SFX","type":"one-shot","category":"reserved","gain":1,"pitchJitter":0.02,"maxVoices":3,"priority":3,"loopStart":null,"loopEnd":null,"variations":[],"parts":[],"file":"assets/audio/sfx/reserved/SEAL_01.mp3","expectedPath":"assets/audio/sfx/reserved/SEAL_01.mp3","registered":true,"licenseClass":"MIXKIT","attributionRequired":false,"license":"Mixkit Sound Effects Free License","credit":"","author":"Mixkit","sourceSite":"mixkit.co","sourceUrl":"https://assets.mixkit.co/active_storage/sfx/178/178-preview.mp3","restrictions":["must ship as part of a game, not as a standalone library"]},{"id":"SEAL_02","bus":"SFX","type":"one-shot","category":"reserved","gain":1,"pitchJitter":0.02,"maxVoices":3,"priority":3,"loopStart":null,"loopEnd":null,"variations":[],"parts":[],"file":"assets/audio/sfx/reserved/SEAL_02.mp3","expectedPath":"assets/audio/sfx/reserved/SEAL_02.mp3","registered":true,"licenseClass":"MIXKIT","attributionRequired":false,"license":"Mixkit Sound Effects Free License","credit":"","author":"Mixkit","sourceSite":"mixkit.co","sourceUrl":"https://assets.mixkit.co/active_storage/sfx/3136/3136-preview.mp3","restrictions":["must ship as part of a game, not as a standalone library"]},{"id":"SEAL_03","bus":"SFX","type":"loop","category":"reserved","gain":1,"pitchJitter":0.02,"maxVoices":3,"priority":3,"loopStart":0,"loopEnd":59.7,"variations":[],"parts":[],"file":"assets/audio/sfx/reserved/SEAL_03.mp3","expectedPath":"assets/audio/sfx/reserved/SEAL_03.mp3","registered":true,"licenseClass":"MIXKIT","attributionRequired":false,"license":"Mixkit Sound Effects Free License","credit":"","author":"Mixkit","sourceSite":"mixkit.co","sourceUrl":"https://assets.mixkit.co/active_storage/sfx/981/981-preview.mp3","restrictions":["must ship as part of a game, not as a standalone library"]},{"id":"SEAL_04","bus":"SFX","type":"loop","category":"reserved","gain":1,"pitchJitter":0.02,"maxVoices":3,"priority":3,"loopStart":0,"loopEnd":59.7,"variations":[],"parts":[],"file":"assets/audio/sfx/reserved/SEAL_04.mp3","expectedPath":"assets/audio/sfx/reserved/SEAL_04.mp3","registered":true,"licenseClass":"MIXKIT","attributionRequired":false,"license":"Mixkit Sound Effects Free License","credit":"","author":"Mixkit","sourceSite":"mixkit.co","sourceUrl":"https://assets.mixkit.co/active_storage/sfx/444/444-preview.mp3","restrictions":["must ship as part of a game, not as a standalone library"]},{"id":"SEAL_05","bus":"SFX","type":"loop","category":"reserved","gain":1,"pitchJitter":0.02,"maxVoices":3,"priority":3,"loopStart":0,"loopEnd":44.619,"variations":[],"parts":[],"file":"assets/audio/sfx/reserved/SEAL_05.mp3","expectedPath":"assets/audio/sfx/reserved/SEAL_05.mp3","registered":true,"licenseClass":"MIXKIT","attributionRequired":false,"license":"Mixkit Sound Effects Free License","credit":"","author":"Mixkit","sourceSite":"mixkit.co","sourceUrl":"https://assets.mixkit.co/active_storage/sfx/1553/1553-preview.mp3","restrictions":["must ship as part of a game, not as a standalone library"]},{"id":"SEAL_06","bus":"SFX","type":"loop set","category":"reserved","gain":1,"pitchJitter":0.02,"maxVoices":3,"priority":3,"loopStart":null,"loopEnd":null,"variations":[],"parts":[{"id":"SEAL_06","file":"assets/audio/sfx/reserved/SEAL_06.mp3","type":"one-shot"},{"id":"SEAL_06","file":"assets/audio/sfx/reserved/SEAL_06__alt1.mp3","type":"loop","loopStart":0,"loopEnd":59.502}],"file":null,"expectedPath":"assets/audio/sfx/reserved/SEAL_06.mp3","registered":true,"licenseClass":"MIXKIT","attributionRequired":false,"license":"Mixkit Sound Effects Free License","credit":"","author":"Mixkit","sourceSite":"mixkit.co","sourceUrl":"https://assets.mixkit.co/active_storage/sfx/711/711-preview.mp3","restrictions":["must ship as part of a game, not as a standalone library"]},{"id":"SEAL_07","bus":"SFX","type":"one-shot","category":"reserved","gain":1,"pitchJitter":0.02,"maxVoices":3,"priority":3,"loopStart":null,"loopEnd":null,"variations":[],"parts":[],"file":"assets/audio/sfx/reserved/SEAL_07.mp3","expectedPath":"assets/audio/sfx/reserved/SEAL_07.mp3","registered":true,"licenseClass":"MIXKIT","attributionRequired":false,"license":"Mixkit Sound Effects Free License","credit":"","author":"Mixkit","sourceSite":"mixkit.co","sourceUrl":"https://assets.mixkit.co/active_storage/sfx/1321/1321-preview.mp3","restrictions":["must ship as part of a game, not as a standalone library"]},{"id":"SEAL_08","bus":"SFX","type":"loop","category":"reserved","gain":1,"pitchJitter":0.02,"maxVoices":3,"priority":3,"loopStart":0,"loopEnd":59.7,"variations":[],"parts":[],"file":"assets/audio/sfx/reserved/SEAL_08.mp3","expectedPath":"assets/audio/sfx/reserved/SEAL_08.mp3","registered":true,"licenseClass":"MIXKIT","attributionRequired":false,"license":"Mixkit Sound Effects Free License","credit":"","author":"Mixkit","sourceSite":"mixkit.co","sourceUrl":"https://assets.mixkit.co/active_storage/sfx/444/444-preview.mp3","restrictions":["must ship as part of a game, not as a standalone library"]},{"id":"SEAL_09","bus":"SFX","type":"loop set","category":"reserved","gain":1,"pitchJitter":0.02,"maxVoices":3,"priority":3,"loopStart":null,"loopEnd":null,"variations":[],"parts":[{"id":"SEAL_09","file":"assets/audio/sfx/reserved/SEAL_09.mp3","type":"one-shot"},{"id":"SEAL_09","file":"assets/audio/sfx/reserved/SEAL_09__alt1.mp3","type":"loop","loopStart":0,"loopEnd":4.697}],"file":null,"expectedPath":"assets/audio/sfx/reserved/SEAL_09.mp3","registered":true,"licenseClass":"CC0","attributionRequired":false,"license":"CC0","credit":"","author":"giddster","sourceSite":"Freesound","sourceUrl":"https://freesound.org/people/giddster/sounds/360485/"},{"id":"SEAL_10","bus":"SFX","type":"loop","category":"reserved","gain":1,"pitchJitter":0.02,"maxVoices":3,"priority":3,"loopStart":0,"loopEnd":44.7,"variations":[],"parts":[],"file":"assets/audio/sfx/reserved/SEAL_10.mp3","expectedPath":"assets/audio/sfx/reserved/SEAL_10.mp3","registered":true,"licenseClass":"CC0","attributionRequired":false,"license":"CC0","credit":"","author":"Soapuel","sourceSite":"Freesound","sourceUrl":"https://freesound.org/people/Soapuel/sounds/489443/"},{"id":"SEAL_11","bus":"SFX","type":"one-shot","category":"reserved","gain":1,"pitchJitter":0.02,"maxVoices":3,"priority":3,"loopStart":null,"loopEnd":null,"variations":[],"parts":[],"file":"assets/audio/sfx/reserved/SEAL_11.mp3","expectedPath":"assets/audio/sfx/reserved/SEAL_11.mp3","registered":true,"licenseClass":"CC0","attributionRequired":false,"license":"CC0","credit":"","author":"Bandslam33","sourceSite":"Freesound","sourceUrl":"https://freesound.org/people/Bandslam33/sounds/545593/"},{"id":"SEAL_12","bus":"SFX","type":"loop","category":"reserved","gain":1,"pitchJitter":0.02,"maxVoices":3,"priority":3,"loopStart":0,"loopEnd":59.7,"variations":[],"parts":[],"file":"assets/audio/sfx/reserved/SEAL_12.mp3","expectedPath":"assets/audio/sfx/reserved/SEAL_12.mp3","registered":true,"licenseClass":"CC0","attributionRequired":false,"license":"CC0","credit":"","author":"hannahstootall","sourceSite":"Freesound","sourceUrl":"https://freesound.org/people/hannahstootall/sounds/335882/"},{"id":"SEAL_13","bus":"SFX","type":"loop","category":"reserved","gain":1,"pitchJitter":0.02,"maxVoices":3,"priority":3,"loopStart":0,"loopEnd":3.76,"variations":[],"parts":[],"file":"assets/audio/sfx/reserved/SEAL_13.mp3","expectedPath":"assets/audio/sfx/reserved/SEAL_13.mp3","registered":true,"licenseClass":"CC0","attributionRequired":false,"license":"CC0","credit":"","author":"alexdecastro","sourceSite":"Freesound","sourceUrl":"https://freesound.org/people/alexdecastro/sounds/709430/"},{"id":"SEAL_14","bus":"SFX","type":"one-shot","category":"reserved","gain":1,"pitchJitter":0.02,"maxVoices":3,"priority":3,"loopStart":null,"loopEnd":null,"variations":[],"parts":[],"file":"assets/audio/sfx/reserved/SEAL_14.mp3","expectedPath":"assets/audio/sfx/reserved/SEAL_14.mp3","registered":true,"licenseClass":"CC0","attributionRequired":false,"license":"CC0","credit":"","author":"stwime","sourceSite":"Freesound","sourceUrl":"https://freesound.org/people/stwime/sounds/545336/"},{"id":"SEAL_15","bus":"SFX","type":"one-shot","category":"reserved","gain":1,"pitchJitter":0.02,"maxVoices":3,"priority":3,"loopStart":null,"loopEnd":null,"variations":[],"parts":[],"file":"assets/audio/sfx/reserved/SEAL_15.mp3","expectedPath":"assets/audio/sfx/reserved/SEAL_15.mp3","registered":true,"licenseClass":"CC0","attributionRequired":false,"license":"CC0","credit":"","author":"DigitalUnderglow","sourceSite":"Freesound","sourceUrl":"https://freesound.org/people/DigitalUnderglow/sounds/757730/"},{"id":"SEAL_16","bus":"SFX","type":"one-shot","category":"reserved","gain":1,"pitchJitter":0.02,"maxVoices":3,"priority":3,"loopStart":null,"loopEnd":null,"variations":[],"parts":[],"file":"assets/audio/sfx/reserved/SEAL_16.mp3","expectedPath":"assets/audio/sfx/reserved/SEAL_16.mp3","registered":true,"licenseClass":"CC0","attributionRequired":false,"license":"CC0","credit":"","author":"Melbourne34","sourceSite":"Freesound","sourceUrl":"https://freesound.org/people/Melbourne34/sounds/511583/"},{"id":"SEAL_17","bus":"SFX","type":"loop","category":"reserved","gain":1,"pitchJitter":0.02,"maxVoices":3,"priority":3,"loopStart":0,"loopEnd":59.7,"variations":[],"parts":[],"file":"assets/audio/sfx/reserved/SEAL_17.mp3","expectedPath":"assets/audio/sfx/reserved/SEAL_17.mp3","registered":true,"licenseClass":"CC0","attributionRequired":false,"license":"CC0","credit":"","author":"soundtracvkradio","sourceSite":"Freesound","sourceUrl":"https://freesound.org/people/soundtracvkradio/sounds/345742/"},{"id":"SEAL_18","bus":"SFX","type":"loop","category":"reserved","gain":1,"pitchJitter":0.02,"maxVoices":3,"priority":3,"loopStart":0,"loopEnd":59.7,"variations":[],"parts":[],"file":"assets/audio/sfx/reserved/SEAL_18.mp3","expectedPath":"assets/audio/sfx/reserved/SEAL_18.mp3","registered":true,"licenseClass":"CC0","attributionRequired":false,"license":"CC0","credit":"","author":"snakebarney","sourceSite":"Freesound","sourceUrl":"https://freesound.org/people/snakebarney/sounds/138118/"}],"credits":[]};

window.RABuild3CreateAudio=function(audioManifest){

  // RA AUDIO ENGINE — extends the original RAAudio element helper with the approved M1–M2 foundation
  // described in docs/RA_Sound_Deployment_Plan_HQ.md §3. The engine is ID-driven: callers pass manifest IDs,
  // never file paths. When a sound is not registered yet (file === null), every call is a safe no-op, so the
  // game is unchanged until HQ accepts and encodes the Finder delivery.
  //
  // Preserved legacy API: RAAudio.get(id) / play(id) / pause(id) — the soundtrack <audio> element helpers.
  const BUSSES=['MUSIC','SFX','UI','VOICE','AMBIENCE'];
  const SETTING_FOR_BUS={MUSIC:'music',SFX:'sfx',UI:'sfx',VOICE:'sfx',AMBIENCE:'ambience'};
  const HAPTIC_IDS={HIT_HEAVY:18,CRIT:22,KO:30,NOTIF_TEXT:12,NOTIF_VAMPGRAM:12,APP_UNLOCK:16,CASH_IN:12,CASH_OUT:12};
  const clamp01=v=>Math.min(1,Math.max(0,Number(v)));

  const manifest=()=>audioManifest;
  const busDefaults=()=>manifest()?.busDefaults||{MUSIC:.70,SFX:.90,UI:.60,VOICE:.80,AMBIENCE:.45};
  const settingsStorage=()=>({audio:{music:1,sfx:1,ambience:1,muted:false,haptics:true}});
  function readSettings(){
    try{const stored=window.RAState?.get?.()?.life?.settings?.audio;return {...settingsStorage().audio,...(stored&&typeof stored==='object'?stored:{})};}
    catch(e){return {...settingsStorage().audio};}
  }
  function writeSetting(key,value){
    try{const current={...readSettings(),[key]:value};window.RAState?.patch?.('life.settings.audio',current);return current;}catch(e){return {...readSettings(),[key]:value};}
  }

  // ---- Web Audio graph ----
  let ctx=null,master=null,duckNode=null;const busNodes={};
  let unlocked=false,ducked=false,duckTimeout=null;
  const buffers=new Map(),missing=new Set(),active=new Map(),loops=new Map(),plays=new Map(),variantBuffers=new Map();
  let sceneState={id:null,preload:[]},sceneToken=0,ambienceAttempts=0,pendingAmbience=false,pendingToken=0,residentPreloaded=false;

  function ensureCtx(){
    if(ctx)return ctx;
    const AC=window.AudioContext||window.webkitAudioContext;
    if(!AC)return null;
    try{ctx=new AC();}catch(e){return null;}
    master=ctx.createGain();master.gain.value=1;master.connect(ctx.destination);
    duckNode=ctx.createGain();duckNode.gain.value=1;
    for(const bus of BUSSES){const g=ctx.createGain();g.gain.value=busDefaults()[bus]??1;busNodes[bus]=g;if(bus==='MUSIC'){g.connect(duckNode);duckNode.connect(master);}else g.connect(master);}
    applyMix();
    return ctx;
  }
  // The shipped soundtrack is a plain <audio> element, not a Web Audio node, so MUSIC + MUTE are mirrored onto it
  // (R2). This is applied even before an AudioContext exists so settings control the current soundtrack immediately.
  function applyElementMix(){
    const element=get('soundtrack');if(!element)return;
    const s=readSettings();element.volume=clamp01(s.music);element.muted=!!s.muted;
  }
  function applyMix(){
    applyElementMix();
    if(!ctx)return;
    const s=readSettings();
    for(const bus of BUSSES){const node=busNodes[bus];if(!node)continue;const base=busDefaults()[bus]??1;const user=bus==='MUSIC'?s.music:bus==='AMBIENCE'?s.ambience:s.sfx;node.gain.value=clamp01(base)*clamp01(user);}
    if(master)master.gain.value=s.muted?0:1;
  }
  function ramp(node,value,ms){if(!ctx||!node)return;const at=ctx.currentTime;const dur=Math.max(0.01,(Number(ms)||0)/1000);try{node.gain.cancelScheduledValues(at);node.gain.setValueAtTime(node.gain.value,at);node.gain.linearRampToValueAtTime(value,at+dur);}catch(e){node.gain.value=value;}}

  const UNLOCK_EVENTS=['pointerdown','touchstart','keydown'];
  function unlock(){
    const c=ensureCtx();if(!c)return false;
    if(c.state==='suspended')c.resume().catch(()=>{});
    unlocked=true;
    detachUnlockListeners();
    if(!residentPreloaded){residentPreloaded=true;preloadScene(manifest()?.resident||[]);}
    const known=sceneState.id!==null?sceneState.id:window.RAScenes?.current?.()||null;
    if(known)enterScene(known);
    return true;
  }
  function unlockOnce(){if(!unlocked)unlock();}
  function detachUnlockListeners(){for(const event of UNLOCK_EVENTS)document.removeEventListener(event,unlockOnce,{capture:true});}
  // M1 UI_TAP / UI_BACK seam: any button press, in the bubble phase. An owning handler can claim the click with
  // event.__raSfxHandled so a specific sound (UI_CONFIRM/UI_ERROR/PHONE_APP_OPEN) does not also fire generic UI_TAP.
  function uiClick(event){
    if(event.__raUITapRouted)return;
    if(event.__raSfxHandled&&[...plays.values()].reduce((a,b)=>a+b,0)>(event.__raUIBefore??0))return;
    const target=event.__raUITarget||event.target?.closest?.('button,a[href],input,select,[role="button"],[data-phone-action],[data-move],[data-c2],.adv-scene,.bedroom-return');
    if(!target||(event.__raWasEnabled===undefined?target.disabled:!event.__raWasEnabled))return;
    event.__raUITapRouted=true;
    const action=target.dataset?.phoneAction||'';
    const id=/^(close|home|back|nah)$/.test(action)?'UI_BACK':'UI_TAP';
    if(!oneShot(id,{restartVoice:true}))preload(id).then(()=>oneShot(id,{restartVoice:true}));
  }

  // ---- loading ----
  function preloadVariant(path){
    if(!unlocked||!path)return Promise.resolve(null);
    const c=ensureCtx();if(!c)return Promise.resolve(null);
    if(variantBuffers.has(path))return Promise.resolve(variantBuffers.get(path));
    if(missing.has(path))return Promise.resolve(null);
    return fetch(path,{cache:'force-cache'}).then(response=>{if(!response.ok)throw new Error(`audio ${path}: ${response.status}`);return response.arrayBuffer();})
      .then(data=>new Promise((resolve,reject)=>c.decodeAudioData(data,b=>resolve(b),reject)))
      .then(buffer=>{variantBuffers.set(path,buffer);return buffer;})
      .catch(()=>{missing.add(path);return null;});
  }
  function preload(id){
    if(!unlocked)return Promise.resolve(null); // never create an AudioContext before the first user gesture (§3.3)
    const c=ensureCtx(),entry=manifest()?.get?.(id);
    if(!c||!entry)return Promise.resolve(null);
    for(const variant of entry.variations||[])preloadVariant(variant);
    if(entry.type==='loop set')return Promise.all((entry.parts||[]).map(p=>preloadVariant(p.file)));
    if(!entry.file||!entry.registered)return Promise.resolve(null);
    if(buffers.has(id))return Promise.resolve(buffers.get(id));
    if(missing.has(id))return Promise.resolve(null);
    return fetch(entry.file,{cache:'force-cache'}).then(response=>{if(!response.ok)throw new Error(`audio ${id}: ${response.status}`);return response.arrayBuffer();})
      .then(data=>new Promise((resolve,reject)=>c.decodeAudioData(data,b=>resolve(b),reject)))
      .then(buffer=>{buffers.set(id,buffer);return buffer;})
      .catch(()=>{missing.add(id);return null;});
  }
  function installBuffer(id,buffer){if(buffer)buffers.set(id,buffer);missing.delete(id);return buffer||null;}
  // DEV/smoke only: synthesize a short tone into the engine's normal decode cache. Never used by gameplay.
  function installTestTone(id,{freq=440,duration=0.05}={}){
    const c=ensureCtx();if(!c||!id)return null;
    const length=Math.max(1,Math.floor(c.sampleRate*duration));const buffer=c.createBuffer(1,length,c.sampleRate);const data=buffer.getChannelData(0);
    for(let i=0;i<length;i++)data[i]=Math.sin((2*Math.PI*freq*i)/c.sampleRate)*(1-i/length)*.5;
    buffers.set(id,buffer);missing.delete(id);return buffer;
  }
  function preloadScene(ids=[]){return Promise.all(ids.map(preload));}
  function releaseScene(ids=[]){
    const resident=new Set(manifest()?.resident||[]);
    for(const id of ids){if(!resident.has(id))buffers.delete(id);}
  }

  // ---- playback ----
  function nodeGainFor(entry){return entry.gain==null?1:clamp01(entry.gain);}
  function busFor(entry){return busNodes[entry.bus]||busNodes.SFX;}
  // Variation sets (schema 2.1 `variations`) pick one candidate at random; loop sets (`parts`) are never played as a whole.
  function candidate(entry){
    const list=[];
    if(entry.file)list.push({primary:true,path:entry.file});
    for(const v of entry.variations||[])list.push({primary:false,path:v});
    if(!list.length)return null;
    return list.length===1?list[0]:list[Math.floor(Math.random()*list.length)];
  }
  function candidateBuffer(id,cand){if(!cand)return null;return cand.primary?(buffers.get(id)||null):(variantBuffers.get(cand.path)||null);}
  const voiceSources=new Map();
  function oneShot(id,opts={}){
    if(!unlocked)return false;
    const c=ensureCtx(),entry=manifest()?.get?.(id);
    if(!c||!entry)return false;
    if(entry.type==='loop')return loop(id,opts);
    if(entry.type==='loop set')return part(id,opts.part||'idle',opts);
    const cand=candidate(entry),buffer=candidateBuffer(id,cand);
    if(!buffer){if(entry.registered)preload(id);return false;}
    const limit=Math.max(1,entry.maxVoices||3);
    if((active.get(id)||0)>=limit){
      // A new UI tap restarts the oldest voice, keeping the authored voice cap.
      const oldest=opts.restartVoice&&voiceSources.get(id)?.values().next().value;
      if(!oldest)return false;oldest.onended=null;try{oldest.stop();}catch(e){}
      voiceSources.get(id).delete(oldest);active.set(id,Math.max(0,(active.get(id)||1)-1));
    }
    const source=c.createBufferSource();source.buffer=buffer;
    const jitter=entry.pitchJitter||0;if(jitter)source.playbackRate.value=1+(Math.random()*2-1)*jitter;
    const gain=c.createGain();gain.gain.value=clamp01(nodeGainFor(entry)*(opts.gain==null?1:clamp01(opts.gain)));
    source.connect(gain).connect(busFor(entry));
    active.set(id,(active.get(id)||0)+1);
    if(!voiceSources.has(id))voiceSources.set(id,new Set());voiceSources.get(id).add(source);
    source.onended=()=>{voiceSources.get(id)?.delete(source);active.set(id,Math.max(0,(active.get(id)||1)-1));};
    try{source.start();}catch(e){active.set(id,Math.max(0,(active.get(id)||1)-1));return false;}
    plays.set(id,(plays.get(id)||0)+1);
    if(entry.ducksMusic)duckMusic(12,entry.duckMs||1200);
    haptic(id);
    return true;
  }
  function loop(id,opts={}){
    if(!unlocked)return false;
    const c=ensureCtx(),entry=manifest()?.get?.(id);
    if(!c||!entry)return false;
    if(entry.type==='loop set')return part(id,opts.part||'idle',opts);
    if(loops.has(id))return true;
    const cand=candidate(entry),buffer=candidateBuffer(id,cand);
    if(!buffer){if(entry.registered)preload(id);return false;}
    const source=c.createBufferSource();source.buffer=buffer;source.loop=true;
    if(Number.isFinite(entry.loopStart))source.loopStart=entry.loopStart;
    if(Number.isFinite(entry.loopEnd))source.loopEnd=entry.loopEnd;
    const gain=c.createGain();gain.gain.value=clamp01(nodeGainFor(entry)*(opts.gain==null?1:clamp01(opts.gain)));
    source.connect(gain).connect(busFor(entry));
    try{source.start();}catch(e){return false;}
    loops.set(id,{source,gain});
    plays.set(id,(plays.get(id)||0)+1);
    return true;
  }
  // Play a delivered component of a loop set; the parent remains the public sound ID and statistics key.
  function part(id,role,opts={}){
    const entry=manifest()?.get?.(id),p=entry?.parts?.find(p=>p.file.endsWith(`__${role}.mp3`))||(role==='idle'?entry?.parts?.find(p=>p.type==='loop'):null);
    if(!unlocked||!p)return false;const buffer=variantBuffers.get(p.file),c=ensureCtx();
    if(!buffer){preload(id);return false;}const key=`${id}:${role}`;
    if(p.type==='loop'&&loops.has(key))return true;
    const source=c.createBufferSource(),gain=c.createGain();source.buffer=buffer;source.loop=p.type==='loop';
    if(Number.isFinite(p.loopStart))source.loopStart=p.loopStart;if(Number.isFinite(p.loopEnd))source.loopEnd=p.loopEnd;
    gain.gain.value=clamp01(nodeGainFor(entry)*(opts.gain??1));source.connect(gain).connect(busFor(entry));
    try{source.start();}catch(e){return false;}if(source.loop)loops.set(key,{source,gain});
    plays.set(id,(plays.get(id)||0)+1);return true;
  }
  function stop(id,fadeMs=250){
    for(const key of [...loops.keys()])if(key.startsWith(id+':'))stop(key,fadeMs);
    const handle=loops.get(id);if(!handle)return false;
    loops.delete(id);
    ramp(handle.gain,0,fadeMs);
    const delay=Math.max(20,(Number(fadeMs)||0)+20);
    setTimeout(()=>{try{handle.source.stop();}catch(e){}},delay);
    return true;
  }
  function stopAll(fadeMs=250){for(const id of [...loops.keys()])stop(id,fadeMs);}
  function isPlaying(id){return loops.has(id)||(active.get(id)||0)>0;}

  function duckMusic(db=6,ms=400){
    if(!duckNode)return false;
    ducked=true;ramp(duckNode,Math.pow(10,-Math.abs(db)/20),ms);
    if(duckTimeout)clearTimeout(duckTimeout);
    return true;
  }
  function restoreMusic(ms=400){
    if(!duckNode)return false;
    ducked=false;ramp(duckNode,1,ms);
    if(duckTimeout)clearTimeout(duckTimeout);
    return true;
  }
  function duckFor(db,holdMs=1200,restoreMs=400){duckMusic(db,restoreMs);if(duckTimeout)clearTimeout(duckTimeout);duckTimeout=setTimeout(()=>restoreMusic(restoreMs),Math.max(0,holdMs));return true;}

  function haptic(id){
    const strength=HAPTIC_IDS[id];if(!strength)return false;
    if(!readSettings().haptics)return false;
    try{if(navigator.vibrate)navigator.vibrate(strength);else return false;}catch(e){return false;}
    return true;
  }

  // ---- scene binding (§3.3 preload by scene) ----
  // Ambience starts through a single bounded async attempt tied to the current scene visit. Unregistered entries
  // (file:null) never retry, and a scene change invalidates the attempt so stale ambience cannot start.
  function startSceneAmbience(sceneId,ambienceId,token){
    if(!ambienceId)return false;
    const entry=manifest()?.get?.(ambienceId);
    if(!entry||!entry.file||!entry.registered)return false;
    if(loops.has(ambienceId))return true;
    if(!unlocked)return false;
    ambienceAttempts+=1;pendingAmbience=true;pendingToken=token;
    preload(ambienceId).then(buffer=>{
      if(pendingToken===token)pendingAmbience=false;
      if(token!==sceneToken||sceneState.id!==sceneId)return; // scene changed: never start stale ambience
      if(buffer&&unlocked)loop(ambienceId,{});
    }).catch(()=>{if(pendingToken===token)pendingAmbience=false;});
    return true;
  }
  function enterScene(id){
    const table=manifest()?.scenes||{},next=table[id];
    if(sceneState.id&&sceneState.id!==id){const previous=table[sceneState.id]||{};if(previous.ambience)stop(previous.ambience,300);releaseScene(previous.preload||[]);}
    sceneToken+=1;
    sceneState={id,preload:(next?.preload||[]).slice()};
    startSceneAmbience(id,next?.ambience||null,sceneToken);
    return preloadScene(sceneState.preload);
  }

  // ---- settings ----
  function setVolume(bus,value){const key=SETTING_FOR_BUS[bus];if(!key)return settings();const next=writeSetting(key,clamp01(value));applyMix();return {...next};}
  function setMuted(value){const next=writeSetting('muted',!!value);applyMix();return {...next};}
  function toggleMuted(){return setMuted(!readSettings().muted);}
  function setHaptics(value){return {...writeSetting('haptics',!!value)};}
  function settings(){return {...readSettings()};}

  function describe(){
    const s=readSettings();
    return {schema:manifest()?.schema||null,unlocked,context:ctx?ctx.state:'none',scene:sceneState.id,sceneToken,ducked,muted:!!s.muted,settings:s,busGains:BUSSES.reduce((acc,bus)=>({...acc,[bus]:busNodes[bus]?.gain.value??(busDefaults()[bus]??1)}),{}),loaded:[...buffers.keys()],missing:[...missing.keys()],playing:[...loops.keys()],voices:[...active.entries()].filter(([,n])=>n>0).reduce((acc,[id,n])=>({...acc,[id]:n}),{}),plays:[...plays.entries()].reduce((acc,[id,n])=>({...acc,[id]:n}),{}),ambienceAttempts,pendingAmbience,variants:[...variantBuffers.keys()]};
  }

  // ---- original element helpers (unchanged behavior) ----
  function get(id='soundtrack'){return document.getElementById(id);}
  async function play(id='soundtrack'){const element=get(id);if(element)try{await element.play();}catch(e){}}
  function pause(id='soundtrack'){const element=get(id);if(element)element.pause();}

  return {get,play,pause,unlock,isUnlocked:()=>unlocked,sfx:oneShot,oneShot,loop,part,stop,stopAll,isPlaying,duckMusic,restoreMusic,duckFor,preload,preloadScene,releaseScene,installBuffer,installTestTone,enterScene,startSceneAmbience,scene:()=>sceneState.id,setVolume,setMuted,toggleMuted,setHaptics,settings,applyMix,applyElementMix,describe,
    buses:{...{MUSIC:'MUSIC',SFX:'SFX',UI:'UI',VOICE:'VOICE',AMBIENCE:'AMBIENCE'}},defaults:()=>({...busDefaults()})};

};

window.RABuild3NativeFameResume=async function(){const L=()=>RALife.life();
const screen=document.querySelector('#screen');const o=document.createElement('div');o.className='fame-ending';screen.append(o);
  const step=(html,ms)=>new Promise(r=>{o.innerHTML=html;setTimeout(r,ms);});
  window.RABedroom?.setRichState?.('sleeping');
  await step('<div class="fame-buzz">bzzt</div>',1400);
  await step('<div class="fame-buzz">bzzt bzzt bzzt</div>',1400);
  o.classList.add('clear');window.RABedroom?.setRichState?.('drowsy_wake');
  await step('<div class="fame-line">huh</div>',2200);
  window.RABedroom?.setRichState?.('phone_reaction');
  await step('<div class="fame-line">10,000 followers?</div>',2800);
  o.classList.remove('clear');
  await step('',900);
  await step('<div class="fame-title">RICH ALUCARD</div>',3400);
  const receipts=L().receipts||[];
  const credits=['BEFORE THE FAME','','a life, in receipts:',...receipts.map(r=>`DAY ${r.day} · ${r.caption}`),'','thank you for living here.'];
  await step(`<div class="fame-credits"><div class="fame-roll">${credits.map(c=>`<p>${String(c).replace(/</g,'&lt;')}</p>`).join('')}</div></div>`,Math.min(60000,9000+receipts.length*1400));
  o.innerHTML='<button type="button" class="fame-continue">THE NEXT MORNING</button>';
  o.querySelector('button').addEventListener('click',()=>{o.remove();RAClock.wake({first:true});window.RABedroomLife?.build?.();window.RABedroomLife?.showMail?.();},{once:true});
};
window.RABuild3NativeFameReady=function(){const screen=document.querySelector('#screen');const o=document.createElement('div');o.className='fame-ending';screen.append(o);
  o.innerHTML='<button type="button" class="fame-continue">THE NEXT MORNING</button>';
  o.querySelector('button').addEventListener('click',()=>{o.remove();RAClock.wake({first:true});window.RABedroomLife?.build?.();window.RABedroomLife?.showMail?.();},{once:true});
};
window.RABuild3HQApprovals={"G2":"APPROVED","H9":"APPROVED","authority":"OL-050 B","G2Review":"Optional post-RC","H9Review":"Ube R8","H9Approval":"HQ_PROXY_TASTE_PASS"};
window.RABuild3S02Install=function(){
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
  const handling=computeHandling(carId,parts); const dice=()=>window.RABuild3?.enabled('S02')&&window.RABuild3.state().once['S02:dice']; const styleBonus=()=>dice()?1.1:1;
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
  let course=P.build3S02?{id:'S02-LOT',theme:{sky:'#101523',floor:'#242b35',road:'#333b44',stars:0,label:''},length:3000,roadWidth:240,clips:[],xAt:d=>Math.sin(d/350)*25}:buildCourse(P.course&&COURSE_THEME[P.course]?P.course:'angeles_crest',P.seed||Math.floor(Math.random()*1e9));

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
  const pointers=new Map();
  const storyRun=!!(tandem||P.escapeRunner||window.RAAdventures?.active?.());
  let ebrakeHeld=false,prevThrottleHeld=false,clutchKick=false;
  function clearInput(){keys.clear();for(const id of pointers.keys()){try{canvas.releasePointerCapture(id);}catch(_){}}pointers.clear();ebrakeHeld=false;prevThrottleHeld=false;clutchKick=false;}
  function blur(){clearInput();}
  window.addEventListener('blur',blur);
  const EBRAKE_RECT={x:156,y:292,w:104,h:46};
  function toNative(clientX,clientY){const r=canvas.getBoundingClientRect();return{x:(clientX-r.left)*270/(r.width||270),y:(clientY-r.top)*480/(r.height||480)};}
  function inRect(p,rct){return p.x>=rct.x&&p.x<=rct.x+rct.w&&p.y>=rct.y&&p.y<=rct.y+rct.h;}
  function safeCapture(id){try{canvas.setPointerCapture&&canvas.setPointerCapture(id);}catch(e){}}
  function onDown(e){
   e.preventDefault();const p=toNative(e.clientX,e.clientY);
   if(phase==='results'){handleResultsTap(p);return;}
   if(inRect(p,EBRAKE_RECT)){ebrakeHeld=true;pointers.set(e.pointerId,{kind:'ebrake'});safeCapture(e.pointerId);return;}
   if(p.x<135){pointers.set(e.pointerId,{kind:'steer',startX:p.x,x:p.x});}
   else{pointers.set(e.pointerId,{kind:'throttle',startY:p.y,y:p.y});}
   safeCapture(e.pointerId);
  }
  function onMove(e){
   const rec=pointers.get(e.pointerId);if(!rec)return;
   const p=toNative(e.clientX,e.clientY);
   if(rec.kind==='steer')rec.x=p.x;
   else if(rec.kind==='throttle')rec.y=p.y;
  }
  function onUp(e){
   const rec=pointers.get(e.pointerId);
   if(rec&&rec.kind==='ebrake')ebrakeHeld=false;
   try{canvas.releasePointerCapture(e.pointerId);}catch(_){}pointers.delete(e.pointerId);
  }
  canvas.addEventListener('pointerdown',onDown);
  canvas.addEventListener('pointermove',onMove);
  canvas.addEventListener('pointerup',onUp);
  canvas.addEventListener('pointercancel',onUp);
  const keys=new Set();
  function onKeyDown(e){
   if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(e.key))e.preventDefault();
   keys.add(e.key);
   if(e.key===' ')ebrakeHeld=true;
   if(phase==='results'&&!e.repeat){if(e.key==='Enter'){e.preventDefault();handleResultsTap({x:200,y:420});}else if(e.key==='r'&&!storyRun&&!P.build3S02)runItBack();}
  }
  function onKeyUp(e){keys.delete(e.key);if(e.key===' ')ebrakeHeld=false;}
  window.addEventListener('keydown',onKeyDown);
  window.addEventListener('keyup',onKeyUp);

  function readInput(){
   let steer=0,throttle=0;
   for(const rec of pointers.values()){
    if(rec.kind==='steer')steer=clamp((rec.x-rec.startX)/40,-1,1);
    if(rec.kind==='throttle')throttle=clamp01((rec.startY-rec.y)/60);
   }
   if(keys.has('ArrowLeft'))steer=-1;
   if(keys.has('ArrowRight'))steer=1;
   if(keys.has('ArrowUp'))throttle=1;
   if(throttle>0.01||steer!==0)cueUsed=true; // first-time control cue hides as soon as the player uses input
   // RC2: cruise assist. The car holds half throttle on its own, so a new player only has to steer. Pull up on the right for more.
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
   runElapsed=0;phase='run';root.dataset.phase=phase;resultShown=null;cleanTimer=0;rewardedClean=false;spunAt=-9;
   lessonCounts={1:0,2:0,3:0,4:0};
   lessonFlash={text:LESSON_WORD[lesson]||null,t:LESSON_WORD[lesson]?1.6:0};
  }
  function endRun(){ctx.audio?.stop(motor);ctx.audio?.stop('TIRE_SQUEAL');
   phase='results';clearInput();root.dataset.phase=phase;
   if(P.build3S02&&!rewardedClean){phase='run';root.dataset.phase=phase;runElapsed=0;return;} const prev=ctx.progress();
   const best=Math.max(score,(prev.best&&prev.best[bestKey()])||0);
   const nextBest={...(prev.best||{}),[bestKey()]:best};
   if(!P.build3S02)ctx.saveProgress({best:nextBest,runs:(prev.runs||0)+1});
   resultShown={score,best,isNew:score>=best&&score>0};
  }
  const RESULT_BTN_BACK={x:20,y:400,w:110,h:36};
  const RESULT_BTN_DONE={x:150,y:400,w:100,h:36};
  function handleResultsTap(p){
   if(inRect(p,RESULT_BTN_BACK)&&!storyRun&&!P.build3S02){runItBack();return;}
   if(inRect(p,RESULT_BTN_DONE)){
    const result={outcome:tandem?(tandemScore>=(tandem.threshold||3000)?'win':'lose'):'done',score,
     summary:`${Math.round(score)} pts on ${course.theme.label}`,
     data:{...(P.build3S02?{clean:rewardedClean}:{}),course:course.id,car:carId,lessonPassed:lesson?lessonCounts[lesson]>=2:undefined,spins,maxAngle:Math.round(maxAngleSeen),tandemWin:tandem?tandemScore>=(tandem.threshold||3000):undefined}};
    if(P.build3S02){delete result.score;result.summary='';ctx.finish(result);}else{window.RANewOga?.observeTouge?.({course:course.id,result});ctx.finish(result);}
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
    ({score,chain}=scoreDrift({score,chain},absAngle,state.speed,dt*styleBonus(),handling.maxAngle));
    if(absAngle>30){cleanTimer+=dt;if(cleanTimer>1.5&&!rewardedClean){ctx.reward({memories:['first clean drift']});rewardedClean=true;if(P.build3S02)root.dataset.clean='true';ctx.audio?.sound('CROWD_CHEER_SMALL');}}
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
     score+=clipBonus(chain)*styleBonus();chain=nextChain(chain);
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
   if(P.build3S02)for(let i=0;i<18;i++){const x=i%2?248:22,y=80+Math.floor(i/2)*35;RAPixel.rect(c,x-6,y-10,12,22,'#666f84');RAPixel.rect(c,x-6,y-10,3,3,state.sliding&&Math.abs(state.slideAngle)>30?'#fffbe0':'#8190a5');RAPixel.rect(c,x+3,y-10,3,3,state.sliding&&Math.abs(state.slideAngle)>30?'#fffbe0':'#8190a5');}drawCar(screenXforWorld(state.x),carY,state.heading,state.slideAngle,handling.color,1,carSprite);

   // HUD (avoid top-right 60x24 quit zone)
   if(!P.build3S02)RAPixel.text(c,`${Math.round(score)}`,6,4,{size:10,color:'#f6efd9'});
   if(!P.build3S02)RAPixel.text(c,`x${chain.toFixed(1)}`,6,18,{size:7,color:'#c18b3c'});
   {const face=runElapsed-spunAt<1.2?hudFaces.touge_spun:state.sliding?hudFaces.touge_locked:null;if(face?.complete&&face.naturalWidth){c.imageSmoothingEnabled=false;c.drawImage(face,18,4,44,46,4,30,44,46);}}
   RAPixel.text(c,`${Math.round(state.slideAngle)}°`,6,468,{size:7,color:Math.abs(state.slideAngle)>15?'#20c66b':'#6b6780',baseline:'bottom'});
   RAPixel.text(c,`${Math.max(0,Math.ceil((Number(P.durationSeconds)||90)-runElapsed))}s LEFT`,264,468,{size:7,align:'right',baseline:'bottom',color:'#f6efd9'});
   RAPixel.text(c,`${Math.round(state.speed)} KM/H`,135,468,{size:6,align:'center',baseline:'bottom',color:'#ffd36a'});
   if(tandem){RAPixel.rect(c,64,42,142,20,'#17142c');RAPixel.text(c,`CHASE ${Math.round(tandemScore)}/${tandem.threshold||3000}`,135,48,{size:6,align:'center',color:'#ffd36a'});}
   if(P.escapeRunner){RAPixel.rect(c,64,42,142,20,'#17142c');RAPixel.text(c,'KEEP THE ESCAPE CLOSE',135,48,{size:6,align:'center',color:'#ffd36a'});}
   root.dataset.speed=String(Math.round(state.speed));root.dataset.score=String(Math.round(score));root.dataset.tandemScore=String(Math.round(tandemScore));
   if(passengerBubble&&passengerName){if(passengerSprite?.complete&&passengerSprite.naturalWidth){c.imageSmoothingEnabled=false;c.drawImage(passengerSprite,16,10,46,46,220,30,46,46);}RAPixel.text(c,`${passengerName}: ${passengerBubble.text}`,135,40,{size:6,align:'center',color:'#ff6fb5'});}
   if(lessonFlash.t>0&&lessonFlash.text){RAPixel.text(c,lessonFlash.text,135,220,{size:12,align:'center',color:'#20c66b'});}
   // First-time control cue (presentation only; hidden once the player has used any input) so a new player can make the
   // car move and steer. No physics, scoring or difficulty change.
   if(!cueUsed&&runElapsed<8){RAPixel.text(c,'HOLD UP = GAS',135,266,{size:6,align:'center',color:'#c9c0a8'});RAPixel.text(c,'LEFT / RIGHT = STEER',135,278,{size:6,align:'center',color:'#c9c0a8'});RAPixel.text(c,'E-BRAKE = SLIDE',135,290,{size:6,align:'center',color:'#c9c0a8'});}
   if(state.sliding&&!state.spinning&&Math.abs(state.slideAngle)>15)RAPixel.text(c,'DRIFT',135,352,{size:6,align:'center',color:'#20c66b'});
   RAPixel.rect(c,EBRAKE_RECT.x,EBRAKE_RECT.y,EBRAKE_RECT.w,EBRAKE_RECT.h,ebrakeHeld?'#d7193f':'#7d194b');
   RAPixel.text(c,'E-BRAKE',EBRAKE_RECT.x+EBRAKE_RECT.w/2,EBRAKE_RECT.y+EBRAKE_RECT.h/2-4,{size:7,align:'center',color:'#f6efd9'});

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
  function drawResults(){if(P.build3S02){RAPixel.text(c,'THE HEADLIGHTS FLASH.',135,110,{size:8,align:'center',color:'#e2e8ff'});RAPixel.rect(c,RESULT_BTN_DONE.x,RESULT_BTN_DONE.y,RESULT_BTN_DONE.w,RESULT_BTN_DONE.h,'#f6efd9');RAPixel.text(c,'DONE',200,414,{size:6,align:'center',color:'#10101b'});return;}
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
   window.removeEventListener('keydown',onKeyDown);
   window.removeEventListener('keyup',onKeyUp);window.removeEventListener('blur',blur);clearInput();
  }};
 }

 window.RAMinigames.register('touge',{title:'TOUGE',rule:'Drag on the left side to steer, drag up on the right for more gas, and slide through the bends to score.',mount});
};
window.RABuild3S06Install=function(){
 // PIER — Santa Monica Pier, night. Ferris wheel lights far off over dark water.
 // CAST -> WAIT (nibbles/bite) -> REEL (tension bar) -> RESULT -> CAST AGAIN / I'M GOOD.
 const R=window.RAPixel;
 const COMMON=['SILVER GRUNT','PIER PERCH','UGLY MACKEREL'];
 const RARE=['MOON KOI','OLD BARNACLE GROUPER'];
 const FOUND_TEXTS=[
  '"bro venmo me for the wing stop"',
  '"i cannot come in today my car is a crime scene"',
  '"delete this before rosa sees it"',
  '"it\'s not a phase it\'s a whole flip phone era"'
 ];
 const CHEST_KINDS=['gun_part','sensei_memento','sealed'];

 function pick(rng,arr){return arr[Math.floor(rng()*arr.length)%arr.length];}
 function range(rng,a,b){return Math.round(a+rng()*(b-a));}

 const catchTable={
  common:{weight:58,kinds:COMMON,value:[5,60]},
  junk:{weight:18,kinds:['boot','flip_phone']},
  wallet:{weight:10,value:[40,800]},
  big:{weight:8,value:200,hpLoss:15},
  rare:{weight:4,kinds:RARE,value:[5000,50000]},
  chest:{weight:2,kinds:CHEST_KINDS}
 };

 function buildCatch(cat,rng){
  if(cat==='common'){const name=pick(rng,COMMON);return {category:'common',name,itemId:'fish_common',value:range(rng,5,60)};}
  if(cat==='junk'){
   const kind=pick(rng,['boot','flip_phone']);
   if(kind==='flip_phone')return {category:'junk',name:'FLIP PHONE',itemId:'flip_phone',text:pick(rng,FOUND_TEXTS)};
   return {category:'junk',name:'BOOT',itemId:'boot'};
  }
  if(cat==='wallet')return {category:'wallet',name:'WALLET',itemId:'wallet',value:range(rng,40,800)};
  if(cat==='big')return {category:'big',name:'BIG FISH',value:catchTable.big.value,hpLoss:catchTable.big.hpLoss};
  if(cat==='rare'){
   const name=pick(rng,RARE);const slug=/koi/i.test(name)?'moon_koi':'old_barnacle_grouper';
   return {category:'rare',name,itemId:`fish_rare_${slug}`,value:range(rng,5000,50000)};
  }
  if(cat==='chest'){
   const kind=pick(rng,CHEST_KINDS);
   if(kind==='gun_part')return {category:'chest',kind,itemId:'gun_part',discount:0.2};
   if(kind==='sensei_memento')return {category:'chest',kind,itemId:'sensei_memento'};
   return {category:'chest',kind:'sealed',sealedSlot:'PIER-CHEST-S'};
  }
  return {category:'common',name:pick(rng,COMMON),itemId:'fish_common',value:range(rng,5,60)};
 }

 function rollCatch(rng,opts={}){
  rng=rng||Math.random;
  const rain=!!opts.rain;
  const w={common:catchTable.common.weight,junk:catchTable.junk.weight,wallet:catchTable.wallet.weight,
   big:catchTable.big.weight*(rain?2:1),rare:catchTable.rare.weight,chest:catchTable.chest.weight};
  const total=Object.values(w).reduce((a,b)=>a+b,0);
  let r=rng()*total,cat=null;
  for(const k of Object.keys(w)){if(r<w[k]){cat=k;break;}r-=w[k];}
  return buildCatch(cat||'common',rng);
 }

 // Pure tension physics: holding reels tension up, releasing lets it fall; a big fish yanks it around.
 function tensionStep(state,{holding,dt,fish}={}){
  state=state||{};dt=Math.max(0,Number(dt)||0);
  const HOLD_RATE=34,FALL_RATE=36;
  let t=state.tension||0;
  t+=(holding?HOLD_RATE:-FALL_RATE)*dt;
  if(fish&&typeof fish.pull==='number'){
   t+=fish.pull*dt*0.6;
   state.leanDir=fish.pull>2?1:(fish.pull<-2?-1:(state.leanDir||0));
  }
  t=Math.max(0,Math.min(100,t));
  state.tension=t;
  state.overTime=t>85?(state.overTime||0)+dt*1000:0;
  return state;
 }
 function isSnapped(state){return !!state&&(state.overTime||0)>=2200;}

 window.RAMinigameLogic=window.RAMinigameLogic||{};
 window.RAMinigameLogic.pier={catchTable,rollCatch,tensionStep,isSnapped};

 function truthy(v){return v===true||v==='true'||v===1||v==='1';}
 function num(v,def){const n=Number(v);return Number.isFinite(n)?n:def;}

 function mount(root,ctx){ctx.audio?.sound('AMB_PIER');
  if(!window.RAPixel||!root)return {dispose(){}};
  const params=ctx.params||{};
  const rain=truthy(params.rain),uncleSunday=truthy(params.uncleSunday),tutorial=truthy(params.tutorial),lab=truthy(params.lab);
  const {canvas,ctx:g,toNative}=R.createCanvas(root);
  const J=window.RAJuice?window.RAJuice.create(g):{burst(){},float(){},ring(){},shake(){},flash(){},update(){},begin(){g.save();},end(){g.restore();}};
  const prevProgress=ctx.progress()||{};
  const log=[...(prevProgress.log||[])];
  const counts={...(prevProgress.counts||{})};
  let biggest=prevProgress.biggest||null;
  const everCaught=!!prevProgress.everCaught;
  const rng=R.rng('pier-'+Date.now()+'-'+Math.random());

  const S={
   phase:tutorial?'intro':'cast',
   power:0,charging:false,
   tension:0,overTime:0,progress:0,leanDir:0,
   waitSchedule:null,waitIndex:0,waitEventActive:false,waitEventUntil:0,waitEventKind:null,waitNext:0,scaredUntil:0,
   currentCatch:null,fish:{pull:0,big:false},fishClock:0,
   hp:num(params.hp,100),bigOnLine:false,
   result:null,sessionCount:0,
   uncleLine:'',uncleLineUntil:0,uncleNext:performance.now()+3000,
   tutorialSeen:tutorial,tutorialText:tutorial?'CAST: hold + release':null,
   walletPrompt:false,rarePrompt:false,chestReveal:null,
   flashUntil:0,flashText:''
  };

  function flash(text,ms){S.flashText=text;S.flashUntil=performance.now()+(ms||1200);}

  function newSchedule(){
   const n=Math.floor(rng()*2); // RC2: 0-1 fakes before the real bite
   const events=[];let t=0.6+rng()*0.8;
   for(let i=0;i<n;i++){events.push({t,kind:'fake',dur:0.35+rng()*0.2});t+=0.7+rng()*1.1;}
   events.push({t,kind:'real',dur:1.3+rng()*0.4});
   return events;
  }

  function startCast(){S.phase='cast';S.power=0;S.charging=false;}
  function startWait(){ctx.audio?.sound('BOBBER_PLOP');
   S.phase='wait';S.waitSchedule=newSchedule();S.waitIndex=0;S.waitClock=0;S.waitEventActive=false;S.scaredUntil=0;
  }
  function startReel(caught){
   S.phase='reel';S.currentCatch=caught;S.tension=0;S.overTime=0;S.progress=0;S.leanDir=0;
   const big=caught.category==='big';if(big)ctx.audio?.sound('SPLASH_BIG');
   S.bigOnLine=big;S.fish={pull:0,big};S.fishClock=0;
  }
  function resolveCatch(caught,landed){ctx.audio?.stop('REEL_LOOP');ctx.audio?.stop('LINE_TENSION');ctx.audio?.sound(landed?'FISH_FLOP':'LINE_SNAP');
   if(landed){J.burst(135,300,['#3d9ddd','#f6efd9','#ffd36a'],26,110);J.ring(135,300,'#ffd36a',34);J.flash('#3d9ddd',100);}else{J.shake(5);J.flash('#d7193f',140);J.float('SNAP!',135,260,{color:'#d7193f',size:10,life:1});}
   S.sessionCount++;
   if(!landed){
    if(caught.category==='big'){S.hp=Math.max(0,S.hp-caught.hpLoss);ctx.reward({hpLost:caught.hpLoss});flash('LINE SNAPPED. IT GOT AWAY.',1600);}
    else flash('LINE SNAPPED.',1200);
    saveNow();S.phase='result';S.result={snapped:true,caught};return;
   }
   const entry={id:caught.itemId||caught.category,name:caught.name||caught.category,day:new Date().toISOString().slice(0,10)};
   log.push(entry);counts[entry.id]=(counts[entry.id]||0)+1;
   if(caught.value&&(!biggest||caught.value>biggest.value))biggest={name:caught.name,value:caught.value};
   const rewardBase={};let memories=[];
   if(!everCaughtNow()){memories.push('first fish');}
   if(caught.category==='common'){
    rewardBase.items={fish_common:1};
    if(!prevProgress.everCaught&&log.length===1)rewardBase.vp='RICH_FIRST_FISH';
   } else if(caught.category==='junk'){
    rewardBase.items={[caught.itemId]:1};
    if(caught.itemId==='flip_phone')S.result={foundText:caught.text};
   } else if(caught.category==='wallet'){
    S.walletPrompt=caught;S.phase='wallet';flash('',1);
    saveNow();
    return;
   } else if(caught.category==='big'){
    rewardBase.money=caught.value;
   } else if(caught.category==='rare'){
    S.rarePrompt=caught;S.phase='rare';saveNow();return;
   } else if(caught.category==='chest'){
    S.chestReveal=caught;S.phase='chest';saveNow();return;
   }
   if(memories.length)rewardBase.memories=memories;
   ctx.reward(rewardBase);
   prevProgress.everCaught=true;
   saveNow();
   S.phase='result';S.result={landed:true,caught};
   flash(`GOT ONE: ${caught.name||caught.category.toUpperCase()}`,1400);
  }
  function everCaughtNow(){return prevProgress.everCaught;}
  function saveNow(){ctx.saveProgress({log:log.slice(-50),counts,biggest,everCaught:prevProgress.everCaught||log.length>0});}

  function finishWallet(keep){
   const w=S.walletPrompt;S.walletPrompt=false;
   if(keep){ctx.reward({money:w.value});}
   else{ctx.reward({flags:{walletReturned:true},clout:2,items:{}});}
   prevProgress.everCaught=true;saveNow();
   S.phase='result';S.result={landed:true,caught:w,walletKeep:keep};
   flash(keep?`KEPT $${w.value}`:'RETURNED IT. GOOD KARMA.',1400);
  }
  function finishRare(sell){
   const r=S.rarePrompt;S.rarePrompt=false;
   if(sell)ctx.reward({money:r.value});else ctx.reward({items:{[r.itemId]:1}});
   prevProgress.everCaught=true;saveNow();
   S.phase='result';S.result={landed:true,caught:r,rareSell:sell};
   flash(sell?`SOLD FOR $${r.value}`:'KEPT FOR THE TANK',1400);
  }
  function ackChest(){
   const c=S.chestReveal;S.chestReveal=null;
   if(c.kind==='S06'){window.RABuild3.S4.acquireEgg();}else if(c.kind==='gun_part')ctx.reward({items:{gun_part:1}});
   else if(c.kind==='sensei_memento')ctx.reward({items:{sensei_memento:1}});
   else ctx.reward({flags:{},sealedSlots:[c.sealedSlot]});
   prevProgress.everCaught=true;saveNow();
   S.phase='result';S.result={landed:true,caught:c,chest:true};
   flash(c.kind==='S06'?'A BLACK EGG. COLD. WET. SMELLS LIKE THE OCEAN.':'CHEST OPENED.',1200);
  }

  // ---- input ----
  // pointerIsDown tracks the physical press across phase transitions: a real bite can be
  // hooked mid-hold (finger never lifted), and that same hold must count as reeling once REEL starts.
  let pointerIsDown=false;
  function onDown(e){
   const p=e.touches?e.touches[0]:e;const n=toNative(p.clientX,p.clientY);
   pointerIsDown=true;
   if(S.phase==='intro'){S.phase='cast';return;}
   if(S.phase==='cast'){S.charging=true;S.power=0;return;}
   if(S.phase==='wait'){handleWaitTap();return;}
  }
  function onUp(){
   if(S.phase==='cast'&&S.charging){S.charging=false;S.castPower=S.power;startWait();}
   pointerIsDown=false;
  }
  function handleWaitTap(){
   if(!S.waitEventActive){return;}
   if(S.waitEventKind==='real'){
    const forceCommon=tutorial&&!S.tutorialCaughtOnce;
    S.tutorialCaughtOnce=true;
    const caught=params.build3S06&&!window.RABuild3.state().s4?.eggDay?{category:'chest',kind:'S06',itemId:'S06-egg',name:'A BLACK EGG'}:forceCommon?buildCatch('common',rng):rollCatch(rng,{rain});
    startReel(caught);
   } else {
    S.waitEventActive=false;S.scaredUntil=performance.now()+900;flash('SPOOKED IT.',900);
    S.waitSchedule=newSchedule();S.waitIndex=0;S.waitClock=0;
   }
  }
  canvas.addEventListener('pointerdown',onDown);
  canvas.addEventListener('pointerup',onUp);
  canvas.addEventListener('pointercancel',onUp);
  canvas.addEventListener('pointerleave',onUp);

  // Buttons drawn on canvas; hit-test on click for result/overlay choices.
  function onClick(e){
   const p=e.touches?e.touches[0]:e;const n=toNative(p.clientX,p.clientY);
   const btn=hitButton(n.x,n.y);
   if(!btn)return;
   if(btn==='castAgain'){startCast();}
   else if(btn==='imGood'){finishSession();}
   else if(btn==='walletKeep')finishWallet(true);
   else if(btn==='walletReturn')finishWallet(false);
   else if(btn==='rareSell')finishRare(true);
   else if(btn==='rareKeep')finishRare(false);
   else if(btn==='chestOk')ackChest();
  }
  canvas.addEventListener('click',onClick);

  let buttons=[];
  function hitButton(x,y){
   for(const b of buttons)if(x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h)return b.id;
   return null;
  }

  function finishSession(){
   const summary=summarize();
   ctx.finish({outcome:'done',summary,data:{log,counts,biggest,hp:S.hp}});
  }
  function summarize(){
   const parts=[];
   const fishN=Object.entries(counts).filter(([k])=>k.startsWith('fish')).reduce((a,[,v])=>a+v,0);
   if(fishN)parts.push(`${fishN} FISH`);
   if(counts.boot)parts.push(`${counts.boot} BOOT${counts.boot>1?'S':''}`);
   if(counts.flip_phone)parts.push(`${counts.flip_phone} FLIP PHONE${counts.flip_phone>1?'S':''}`);
   const money=log.length; // placeholder count fallback
   return parts.join(', ')||'NOTHING BIT TODAY';
  }

  // ---- render ----
  function env(){
   if(R.drawBoard(g,'pier_game'))return;
   R.paintEnvironment(g,{
    sky:'#0b1024',wall:null,floor:'#060a1a',horizon:300,seed:'pier-night',stars:26,
    lights:[{x:200,y:120,spread:70,color:'rgba(180,140,255,.10)'}],
    props:[
     {type:'circle',x:210,y:110,r:2,color:'#ffd98a'},{type:'circle',x:222,y:120,r:2,color:'#ff6fb5'},
     {type:'circle',x:228,y:96,r:2,color:'#b44cff'},{type:'circle',x:198,y:98,r:2,color:'#3d9ddd'},
     {type:'circle',x:214,y:80,r:2,color:'#ffd98a'},{type:'circle',x:236,y:110,r:2,color:'#20c66b'},
     {type:'text',text:'FERRIS WHEEL, FAR OFF',x:150,y:58,size:6,color:'rgba(246,239,217,.55)'}
    ],
    rain:false
   });
   // ferris wheel rim
   g.strokeStyle='rgba(180,160,255,.25)';g.beginPath();g.arc(216,100,26,0,Math.PI*2);g.stroke();
   // pier railing silhouette + Rich stands here
   R.rect(g,0,336,270,6,'#1a1730');
   for(let x=6;x<270;x+=22)R.rect(g,x,300,3,42,'#151228');
   R.rect(g,0,300,270,3,'#100e20');
  }
  function drawRich(){
   const holding=S.phase==='result'&&S.result&&S.result.landed;
   // Frozen ART SHIP 006 Rich states: casting while fishing; the fish held at arm's length on a landed fish (the
   // approved hold shows a fish, so junk catches keep the standing anchor + the drawn catch).
   const fish=holding&&S.result.caught?.category!=='junk';
   const sprite=holding?(fish?R.personSprite?.('rich','holding_fish_away'):R.personSprite?.('rich')):S.phase!=='intro'?R.personSprite?.('rich','fishing_cast'):R.personSprite?.('rich');
   if(R.drawSprite?.(g,sprite,70,392)){if(holding&&!fish){R.rect(g,104,356,26,3,'#211d33');drawFish(S.result.caught,124,352,0.7);}return;}
   R.drawActor(g,{top:'#111018',bottom:'#0c0a14',hair:'#050408',hairShape:'locs',shades:true,skin:'#7a5236',accent:'#3a6ff0'},70,392,1.05);
   if(holding){
    R.rect(g,104,356,26,3,'#211d33'); // extended arm bar
    drawFish(S.result.caught,124,352,0.7);
   } else if(S.phase!=='intro'){
    R.rect(g,84,368,3,-38+390-352,'#211d33'); // rod (rough)
    R.rect(g,84,332,42,2,'#c9bfa6'); // line hint
   }
  }
  // Frozen ART SHIP 014 catch art by what was caught (native 1:1, centred on x,y). BIG FISH has no approved art
  // (mapping decision) and keeps the drawn placeholder, as does anything else without a frozen file.
  const catchImages={};
  function catchArt(caught){
   if(!caught)return null;const C=window.RAArtRegistry?.items?.catches||{};
   const key=caught.category==='chest'?'chest':caught.category==='wallet'?'waterlogged_wallet':caught.category==='junk'?caught.itemId:caught.category==='rare'?caught.itemId?.replace('fish_rare_',''):caught.category==='common'?String(caught.name||'').toLowerCase().replace(/ /g,'_'):null;
   const src=C[key]?.icon?.asset;if(!src)return null;
   const img=catchImages[src]||(catchImages[src]=Object.assign(new Image(),{src}));return img.complete&&img.naturalWidth?img:null;
  }
  function drawCatchArt(caught,x,y){const img=catchArt(caught);if(!img)return false;g.imageSmoothingEnabled=false;g.drawImage(img,Math.round(x-img.naturalWidth/2),Math.round(y-img.naturalHeight/2));return true;}
  function drawFish(caught,x,y,scale){
   if(!caught)return;
   if(drawCatchArt(caught,x,y))return;
   const cat=caught.category;
   const col=cat==='rare'?'#f4c95d':cat==='big'?'#7fa8ff':cat==='junk'?'#8a8a8a':'#c7d6e8';
   g.save();g.translate(x,y);g.scale(scale,scale);
   R.rect(g,-10,-5,20,10,col);R.rect(g,-14,-2,5,4,col);R.rect(g,8,-7,4,4,'#0008');
   g.restore();
  }
  function drawUncle(now){
   if(!uncleSunday)return;
   if(!R.drawSprite?.(g,R.personSprite?.('uncle_sunday','fishing'),210,392))R.drawActor(g,{top:'#3a2f2a',bottom:'#26221f',hair:'#1a1410',hairShape:'hat',skin:'#6b4326',accent:'#c18b3c'},210,392,0.95);
   R.text(g,'UNCLE SUNDAY',176,404,{size:6,color:'rgba(246,239,217,.6)'});
   if(now<S.uncleLineUntil)R.text(g,S.uncleLine,135,420,{size:6,color:'#f6efd9',align:'center',maxWidth:120});
  }
  function drawBobber(){
   if(S.phase!=='wait'&&S.phase!=='reel')return;
   const bx=170+((S.castPower||40)/100)*70;
   const by=280+(S.waitEventActive?(S.waitEventKind==='real'?10:4):0);
   R.rect(g,bx-3,by-3,6,6,'#e0473f');R.rect(g,bx-1,by-7,2,4,'#e0473f');
   if(S.waitEventActive){
    for(let i=0;i<5;i++)R.rect(g,bx-10+i*5,by+6+((i%2)?2:0),2,2,'rgba(220,240,255,.5)');
   }
  }
  function drawHUD(now){
   buttons=[];
   R.text(g,'PIER',8,8,{size:8,color:'#f6efd9'});
   R.text(g,`CATCH LOG ${log.length}`,262,32,{size:6,color:'rgba(246,239,217,.6)',align:'right'});
   if(S.bigOnLine||S.hp<num(params.hp,100))R.text(g,`RICH HP ${S.hp}`,8,20,{size:6,color:S.hp<40?'#d7193f':'rgba(246,239,217,.7)'});
   if(now<S.flashUntil)R.text(g,S.flashText,135,140,{size:8,color:'#20c66b',align:'center',maxWidth:250});

   if(S.phase==='intro'){
    R.frame(g,20,180,230,140,{});
    R.text(g,'CAST',30,196,{size:8,color:'#10101b'});
    R.text(g,'hold + release to cast',30,212,{size:6,color:'#10101b',maxWidth:200});
    R.text(g,'WAIT',30,236,{size:8,color:'#10101b'});
    R.text(g,'tap the real bite, not the fakes',30,252,{size:6,color:'#10101b',maxWidth:200});
    R.text(g,'REEL',30,276,{size:8,color:'#10101b'});
    R.text(g,'hold to reel. let go when the bar is red.',30,292,{size:6,color:'#10101b',maxWidth:200});
    R.text(g,'TAP TO START (first catch is easy)',30,300+18,{size:6,color:'#7d194b'});
    return;
   }
   if(S.phase==='cast'){
    R.rect(g,20,440,230,14,'#211d33');
    R.rect(g,20,440,230*(S.power/100),14,'#3a6ff0');
    R.text(g,'HOLD TO CAST, RELEASE FOR DISTANCE',24,458,{size:6,color:'rgba(246,239,217,.7)'});
   }
   if(S.phase==='wait'){
    R.text(g,'WATCHING THE LINE...',24,458,{size:6,color:'rgba(246,239,217,.7)'});
   }
   if(S.phase==='reel'){
    R.rect(g,20,430,230,16,'#211d33');
    const tCol=S.tension>85?'#d7193f':S.tension>60?'#c18b3c':'#20c66b';
    R.rect(g,20,430,230*(S.tension/100),16,tCol);
    R.rect(g,20,452,230,10,'#151228');
    R.rect(g,20,452,230*(S.progress/100),10,'#3d9ddd');
    R.text(g,'HOLD TO REEL',24,466,{size:6,color:'rgba(246,239,217,.6)'});
   }
   if(S.phase==='result'){
    let y=190;
    R.frame(g,20,y,230,150,{});
    if(S.result.snapped){
     R.text(g,'IT GOT AWAY.',34,y+16,{size:8,color:'#10101b'});
    } else {
     const c=S.result.caught;
     R.text(g,(c.name||c.category||'').toUpperCase(),34,y+16,{size:8,color:'#10101b',maxWidth:200});
     drawCatchArt(c,214,y+30);
     if(c.value)R.text(g,`WORTH $${c.value}`,34,y+34,{size:7,color:'#10101b'});
     if(S.result.foundText)R.text(g,`text on it: ${S.result.foundText}`,34,y+50,{size:6,color:'#10101b',maxWidth:200});
     if(log.length===1&&c.category==='common'){
      const line="i'm not looking at it. tell me when it's gone.";
      R.text(g,(lab?'[VP] ':'')+line,34,y+70,{size:6,color:'#7d194b',maxWidth:200});
     }
    }
    buttons.push({id:'castAgain',x:30,y:y+108,w:100,h:24});
    buttons.push({id:'imGood',x:140,y:y+108,w:100,h:24});
    R.rect(g,30,y+108,100,24,'#3a6ff0');R.text(g,'CAST AGAIN',35,y+116,{size:7,color:'#f6efd9'});
    R.rect(g,140,y+108,100,24,'#6b6780');R.text(g,"I'M GOOD",165,y+116,{size:7,color:'#f6efd9'});
   }
   if(S.phase==='wallet'){
    R.frame(g,20,190,230,120,{});
    R.text(g,'A WALLET.',34,206,{size:8,color:'#10101b'});
    drawCatchArt({category:'wallet'},214,236);
    R.text(g,`$${S.walletPrompt.value} INSIDE.`,34,224,{size:7,color:'#10101b'});
    buttons.push({id:'walletKeep',x:30,y:268,w:100,h:24});buttons.push({id:'walletReturn',x:140,y:268,w:100,h:24});
    R.rect(g,30,268,100,24,'#c18b3c');R.text(g,'KEEP CASH',35,276,{size:7,color:'#10101b'});
    R.rect(g,140,268,100,24,'#20c66b');R.text(g,'RETURN IT',150,276,{size:7,color:'#10101b'});
   }
   if(S.phase==='rare'){
    R.frame(g,20,190,230,120,{});
    R.text(g,S.rarePrompt.name,34,206,{size:7,color:'#10101b',maxWidth:200});
    drawCatchArt({category:'rare',itemId:`fish_rare_${/koi/i.test(S.rarePrompt.name)?'moon_koi':'old_barnacle_grouper'}`},214,236);
    R.text(g,`WORTH $${S.rarePrompt.value}`,34,224,{size:7,color:'#10101b'});
    buttons.push({id:'rareSell',x:30,y:268,w:100,h:24});buttons.push({id:'rareKeep',x:140,y:268,w:100,h:24});
    R.rect(g,30,268,100,24,'#c18b3c');R.text(g,'SELL',60,276,{size:7,color:'#10101b'});
    R.rect(g,140,268,100,24,'#3d9ddd');R.text(g,'FISH TANK',150,276,{size:7,color:'#f6efd9'});
   }
   if(S.phase==='chest'){
    R.frame(g,20,190,230,120,{});
    const c=S.chestReveal;
    if(!drawCatchArt({category:'chest'},135,221)){R.rect(g,116,206,38,30,'#6b6780');R.rect(g,116,206,38,4,'#c18b3c');}
    if(c.kind==='sealed')R.text(g,'...',126,246,{size:10,color:'#10101b'});
    else if(c.kind==='gun_part')R.text(g,'GUN PART (-20% ARMORY)',34,246,{size:6,color:'#10101b',maxWidth:200});
    else R.text(g,c.kind==='S06'?'A BLACK EGG':"OCTOPUS SENSEI MEMENTO",34,246,{size:6,color:'#10101b',maxWidth:200});
    buttons.push({id:'chestOk',x:85,y:268,w:100,h:24});
    R.rect(g,85,268,100,24,'#3a6ff0');R.text(g,'OK',122,276,{size:7,color:'#f6efd9'});
   }
  }

  let raf=null,last=performance.now();
  function loop(now){
   const dt=Math.min(0.05,(now-last)/1000);last=now;
   if(S.phase==='cast'&&S.charging){S.power=Math.min(100,S.power+dt*90);}
   if(S.phase==='wait'){
    S.waitClock=(S.waitClock||0)+dt;
    if(!S.waitEventActive&&S.waitSchedule&&S.waitIndex<S.waitSchedule.length){
     const ev=S.waitSchedule[S.waitIndex];
     if(S.waitClock>=ev.t){S.waitEventActive=true;S.waitEventKind=ev.kind;ctx.audio?.sound('NIBBLE');if(ev.kind==='real'){J.burst(135,290,['#f6efd9','#3d9ddd'],12,70);J.float('TAP NOW!',135,250,{color:'#ffd36a',size:9,life:.9});J.shake(2);}else J.float('…',135,262,{color:'#8a8296',size:7,life:.5,rise:8});S.waitEventUntil=S.waitClock+ev.dur;}
    } else if(S.waitEventActive&&S.waitClock>=S.waitEventUntil){
     S.waitEventActive=false;S.waitIndex++;
     if(S.waitIndex>=S.waitSchedule.length){S.waitSchedule=newSchedule();S.waitIndex=0;S.waitClock=0;}
    }
   }
   if(S.phase==='reel'){
    if(S.fish.big){
     S.fishClock-=dt;
     if(S.fishClock<=0){S.fish.pull=(rng()*2-1)*30;S.fishClock=0.4+rng()*0.5;}
    }
    tensionStep(S,{holding:pointerIsDown,dt,fish:S.fish});ctx.audio?.edge('reel',pointerIsDown,'REEL_LOOP');ctx.audio?.edge('tension',S.tension>85,'LINE_TENSION');
    S.progress=Math.max(0,Math.min(100,S.progress+(pointerIsDown?dt*26:-dt*5)));
    if(isSnapped(S)){resolveCatch(S.currentCatch,false);}
    else if(S.progress>=100){resolveCatch(S.currentCatch,true);}
   }
   if(uncleSunday&&now>S.uncleNext){
    S.uncleLine=pick(rng,['have you eaten?','patience. the fish can smell fear.','you gonna eat that boot?']);
    S.uncleLineUntil=now+2600;S.uncleNext=now+7000+rng()*6000;
   }
   g.clearRect(0,0,270,480);J.update(dt);J.begin();
   env();drawUncle(now);drawBobber();drawRich();drawHUD(now);
   J.end();
   raf=requestAnimationFrame(loop);
  }
  raf=requestAnimationFrame(loop);

  return {
   dispose(){
    if(raf)cancelAnimationFrame(raf);
    canvas.removeEventListener('pointerdown',onDown);
    canvas.removeEventListener('pointerup',onUp);
    canvas.removeEventListener('pointercancel',onUp);
    canvas.removeEventListener('pointerleave',onUp);
    canvas.removeEventListener('click',onClick);
   }
  };
 }

 if(window.RAMinigames)RAMinigames.register('pier',{title:'PIER',rule:'Hold and let go to cast, tap when the fish really bites, then hold to reel it in but let go when the line goes red.',mount});
};
(function(){
 'use strict';
 const stages=[];
 window.RABuild3Stages=stages;
 let booted=false;
 function boot(){
  if(booted)return;
  if(!window.RAState||!window.RAAdventures||!window.RASealed)throw Error('BUILD3 BOOT_REQUIRED');
  booted=true;
  const clone=v=>JSON.parse(JSON.stringify(v));
  const defaults={schema:1,discovered:{},once:{},activities:{},spark:null,ecology:{released:{},silent:null,lastDecayDay:0,hiltDay:null},slotDay:null};
  // state.js remains the migration/normalization authority. The existing IF-1 lazy namespace seam fills
  // only a namespace that has actually been written; old saves retain all accepted keys and versions.
  window.RAMigrations?.namespace('build3',defaults);
  const state=()=>({...clone(defaults),...clone(RAState.get().frag?.build3||{})});
  function patch(key,value){return RAState.patch(`frag.build3.${key}`,value);}
  function once(id,fn){if(state().once[id])return false;patch('once',{...state().once,[id]:true});fn?.();return true;}
  const completed=[],outings=[],privateIds=new Set();
  const pack={tuning:{pressure:{visible:15,warning:30},spark:{threshold:5},fameMinDay:35,fameSafetyDay:65},hooks:{}};
  const B={state,patch,once,clone,pack,hq:false,codes:[],onComplete:fn=>completed.push(fn),onOuting:fn=>outings.push(fn),
   R:text=>['rich',text,{vp:true}],N:text=>[null,text],S:(id,text)=>[id,text],
   enabled:code=>(!window.RARC3||!window.RARC3PrivatePolicy?.patch.includes(code))&&(!window.RAFeatures||RAFeatures.enabled(`BUILD3.${code}`)),isPrivate:id=>privateIds.has(id),
   activity(id,n=1){patch('activities',{...state().activities,[id]:(Number(state().activities[id])||0)+n});},
   discover(id){patch('discovered',{...state().discovered,[id]:RALife.today().day});},
   define(def){privateIds.add(def.id);return RAAdventures.define({...def,_build3:true});},
   offer(id,definition,mail){if(!state().discovered[id]){B.define(definition());B.discover(id);if(mail)RALife.mail(mail);}else if(!RAAdventures.get(id))B.define(definition());},
   wake(id,priority,fn){RAClock.onWake(`BUILD3.${id}`,priority,fn);},
   slot(id,fn){pack.hooks[id]=fn;}
  };
  window.RABuild3=B;
  const start=RAAdventures.start,all=RAAdventures.all,complete=RAAdventures.complete,log=RAClock.logOuting;
  RAAdventures.all=()=>all().filter(d=>!d._build3||B.hq||!!state().discovered[d.id]);
  RAAdventures.start=function(id,opts={}){
   if(privateIds.has(id)&&(!state().discovered[id]||!RAAdventures.available(id)))return false;
   const r=start(id,opts);
   if(r&&privateIds.has(id))patch('slotDay',RALife.today().day);
   return r;
  };
  RAAdventures.complete=function(node){const run=clone(RAAdventures.active());const result=complete(node);if(result)for(const fn of completed)fn(result,run);return result;};
  RAClock.logOuting=function(entry){log(entry);for(const fn of outings)fn(entry);};
  for(const install of stages)install(B);
  RASealed.install(pack);
 }
 window.RABuild3Boot=boot;
 document.addEventListener('DOMContentLoaded',boot,{once:true});
})();

RABuild3Stages.push(function(B){
 'use strict';
 const codes=['VP-ECO','LM','SPK'];
 for(const code of codes){RAFeatures.register({id:`BUILD3.${code}`,fragment:'BUILD3',description:code});RAFeatures.set(`BUILD3.${code}`,true);B.codes.push(code);}
 const life=()=>RALife.life(),day=()=>RALife.today().day,eco=()=>B.state().ecology;
 const enabled=()=>B.enabled('VP-ECO');
 const LEGEND=['A10','A18','A19','A20','A27','A28','A29','A30','A31','A32','ARC-X','S01','S02','S03','S04','S05','S06','S07','S08'];
 const records=()=>Object.entries(life().people.records||{}).filter(([,p])=>p.met);
 function dimensions(){
  const music=life().creativeLife.music,people=records().map(([id])=>RARelations.level(id)),o=life().ownership;
  const owned=[(o.properties||[]).some(p=>p.ownershipStatus==='owned'),RALife.ownedCars().length>=2,!!o.dragon,(o.guns||[]).length>0,(o.castleRooms||[]).length>0].filter(Boolean).length;
  const chaos=!!(B.state().once['viral:film-defeat']||B.state().once['viral:party']||RALife.flag('urusViral')||RALife.done('S05')||B.state().once['viral:groupie']);
  return {expression:!window.RARC3&&(music.cooked||[]).length>=4&&((music.shows||[]).length>=2||!!RALife.flag('ironJawRespect')),
   connection:!!B.state().once['ARC-X:momentum']||people.filter(n=>n>=3).length>=3||(people.some(n=>n>=4)&&people.filter(n=>n>=2).length>=4),
   ownership:owned>=3,legend:LEGEND.filter(id=>id==='ARC-X'?!!B.state().once['ARC-X:momentum']:RALife.done(id)).length>=4||!!B.state().once['ARC-X:momentum'],chaos};
 }
 const oldLit=RALife.litDimensions,oldL=RALife.L,oldEligible=RAFame.eligible;
 RALife.litDimensions=()=>B.enabled('LM')?Object.entries(dimensions()).filter(([,v])=>v).map(([k])=>k):oldLit();
 RALife.L=()=>({...oldL(),lit:RALife.litDimensions()});
 function eligible(){
  if(!B.enabled('LM'))return oldEligible();
  const n=RALife.litDimensions().length,m=life().momentum,d=day();
  // OPEN-authored F07 chair route keeps its separate floor and waiver.
  if(window.RAF07?.enabled?.()&&life().newOga?.finaleDone&&d>=25)return true;
  return (d>=35&&n>=3&&!!m.sparkId)||(d>=55&&n>=2)||(d>=65&&!!m.sparkId);
 }
 RAFame.eligible=eligible;
 const headline={clip:'vampire rapper fights 40 ninjas mid-verse',drift:'who is drifting a URUS in a mall parking garage',song:'this song about giant rats is #1 on VampGram',party:'the castle party everybody lied about being at',arc:'rich alucard broke the ladder',kid:'producer thanks rich alucard in viral beat',podcast:'212 subscribers → 2 million. the rich alucard episode',dragon:'is that a real dragon',remix:'who leaked the rich alucard collab',P5:'WHO IS YOUNG PLAYMAKER'};
 function sparkHeadlines(code,existing=[]){if(!B.enabled('SPK'))return existing;const extra=(window.RABuild3DraftedLines?.rows||[]).filter(r=>r.code==='SPK'&&r.key.startsWith(code+'.')).map(r=>r.text);return [...new Set([...existing,...extra])].slice(0,5);}
 function candidates(){
  const s=B.state(),a=s.activities,m=life().creativeLife.music,done=RALife.done;
  const song=(m.cooked||[]).some(x=>x.dropped&&(x.legendMemory||LEGEND.some(id=>x.memoryId?.startsWith(`adv:${id}:`))));
  const valid={clip:!!s.once['SPK:filmed'],drift:!!s.once['SPK:drift']||done('A36')&&['win','won'].includes(RALife.adventureRecord('A36')?.outcome),
   song:song&&(m.shows||[]).length>=2,party:!!s.once['SPK:party'],arc:!!s.once['ARC-X:momentum'],kid:RALife.adventureRecord('S04')?.outcome==='signed'&&day()>=40,
   podcast:done('S08'),dragon:RALife.dragon()?.stage==='majestic'&&!!s.once['SPK:dragon'],remix:!!s.once['C4:played'],P5:done('P5')};
  const weights={clip:Number(a.clip)||0,drift:Number(a.drift)||0,song:(m.cooked||[]).length+(m.shows||[]).length,party:Number(a.party)||0,arc:Number(a.arc)||0,kid:Number(a.kid)||0,podcast:Number(a.podcast)||0,dragon:Number(a.dragon)||0,remix:Number(a.remix)||0,P5:Number(a.P5)||0};
  return Object.keys(valid).filter(k=>valid[k]&&(!window.RARC3||k==='P5')).map(id=>({id,activity:weights[id]})).sort((a,b)=>b.activity-a.activity||Object.keys(valid).indexOf(a.id)-Object.keys(valid).indexOf(b.id));
 }
 function primeSpark(){if(!B.enabled('SPK')||life().momentum.sparkId||!candidates().length)return; if(B.state().sparkEligibleDay==null)B.patch('sparkEligibleDay',day());}
 function checkSpark({outing=false}={}){
  if(!B.enabled('SPK')||life().momentum.sparkId)return null;
  primeSpark();
  if(!outing||B.state().sparkEligibleDay==null||day()<=B.state().sparkEligibleDay)return null;
  const c=candidates()[0];if(!c)return null;
  const result={id:`build3:${c.id}`,code:c.id,day:day(),headlines:sparkHeadlines(c.id,[headline[c.id]])};
  B.patch('spark',result);RAState.patch('life.momentum.sparkId',result.id);return result;
 }
 const oldCheck=RAFame.checkSpark;
 RAFame.checkSpark=opts=>B.enabled('SPK')?checkSpark(opts):oldCheck();
 B.pack.hooks.SPARK=()=>null; // A WAKE/bedtime probe is not an outing.
 RAClock.onWake('fame-night',-10,()=>{if(life().momentum.fameFired)return;if(!B.enabled('SPK'))oldCheck();else primeSpark();if(eligible())RAState.patch('life.momentum.fameEligible',true);});
 B.wake('SPK',76,primeSpark);
 B.onOuting(e=>{if(e.type!=='home')checkSpark({outing:true});});
 const oldConverted=RAEcology.converted,oldLevel=RAEcology.level;
 RAEcology.level=()=>enabled()?(RAEcology.pressure()>=45?3:RAEcology.pressure()>=30?2:RAEcology.pressure()>=15?1:0):oldLevel();
 RAEcology.converted=function(id,{released=false}={}){
  if(!enabled())return oldConverted(id,{released});
  const r=eco().released;
  if(r[id])return;
  B.patch('ecology.released',{...r,[id]:{day:day(),released,close:!released}});
  RAEcology.add(released?12:4,released?'released':'kept');RALife.tendency(released?'messy':'solid');
 };
 // The OPEN invite surface shows four contacts. Additional converted invitees are appended only
 // when the authored five-converted-women condition is possible; ordinary party choices remain intact.
 for(const id of ['A26','HOST']){const node=RAAdventures.get(id).nodes.guests,choices=node.choices;node.choices=function(A){const base=choices(A);const known=RARelations.known({dateable:true}),converted=known.filter(p=>p.conversionState==='converted');if(!enabled()||converted.length<5)return base;const first=new Set(known.slice(0,4).map(p=>p.id));const extra=converted.filter(p=>!first.has(p.id)).map(p=>({label:`INVITE ${(p.catalog?.name||p.id).toUpperCase()}`,fx:X=>X.set('guests',[...new Set([...(X.vars.guests||[]),p.id])]),next:'guests'}));return [...base.slice(0,-1),...extra,base.at(-1)];};}
 function rescueDefinition(){return {id:'VP-ECO-R',title:'THE CATACOMB',lane:'people',start:'arrive',available:()=>{const s=eco().silent;return !!s&&!s.rescued&&day()-s.day<=3;},nodes:{
  arrive:{env:'catacomb',actors:()=>({left:'rich',right:eco().silent?.id}),lines:[B.N("she's hiding at the Catacomb.")],next:'found'},
  found:{lines:[B.R("come home bro")],end:{outcome:'rescued',fx:()=>{const s=eco().silent;if(!s||s.rescued)return;B.patch('ecology.silent',{...s,rescued:true});RAEcology.add(-10,'rescued');const p=RARelations.get(s.id);RARelations.add(s.id,Math.max(0,50-(p?.points||0)),{reason:'rescued'});RARelations.setFlag(s.id,'build3Silent',false);const r=eco().released;B.patch('ecology.released',{...r,[s.id]:{...r[s.id],close:true}});},memory:{text:'found her at the Catacomb',lane:'people'}}}
 }};}
 function pressureConsequences(){
  if(!enabled())return;
  const p=RAEcology.pressure(),e=eco();
  if(p>=70&&!e.hiltRecurring)B.patch('ecology.hiltRecurring',true);
  if(p<40&&e.hiltRecurring)B.patch('ecology.hiltRecurring',false);
  if(e.silent&&!e.silent.rescued&&day()-e.silent.day<=3)B.offer('VP-ECO-R',rescueDefinition);
  if(p>=45&&!e.silent){const id=Object.keys(e.released).find(id=>e.released[id].released&&!e.released[id].close);if(id){B.patch('ecology.silent',{id,day:day(),rescued:false});RARelations.setFlag(id,'build3Silent',true);window.RAVampGram?.post({id:`build3:silent:${id}`,handle:'friends',text:`has anyone heard from ${(RABtfPeople.get(id)?.name||id).toLowerCase()}…`});B.offer('VP-ECO-R',rescueDefinition,{id:'build3:VP-ECO-R',kind:'invite',title:'THE CATACOMB',body:"she's hiding at the Catacomb.",adventure:'VP-ECO-R'});}}
  // The source promises safety within three sleeps; it does not authorize inventing a death afterward.
 }
 B.pack.hooks.PRESSURE=pressureConsequences;
 B.wake('ecology',46,({info,night})=>{
  if(!enabled())return;
  if(night&&eco().lastDecayDay!==info.day){B.patch('ecology.lastDecayDay',info.day);RAEcology.add(-1,'sleep');}
  const r=eco().released;
  for(const [id,rec] of Object.entries(r))if(rec.released&&!rec.close&&RARelations.level(id)>=3){B.patch('ecology.released',{...eco().released,[id]:{...rec,close:true}});RAEcology.add(-6,'brought-close');}
  pressureConsequences();
 });
 const hookah=RAAdventures.get('HOOKAH'),hookahAvailable=hookah.available;
 hookah.available=L=>enabled()?(RAEcology.pressure()>=30||L.hasRoom('hookah_roof')):hookahAvailable(L);
 const a23=RAAdventures.get('A23'),a23Wake=RAWakeTriggers.list().find(w=>w.adventure==='A23');
 const a23When=a23Wake.when;a23Wake.when=L=>enabled()?false:a23When(L);
 const oldStart=RAAdventures.start;
 function hiltDue(){const e=eco(),p=RAEcology.pressure();if(!RALife.flag('hiltWarned'))return false;if(e.hiltDay==null)return p>=55;return !!e.hiltRecurring&&p>=40&&day()-e.hiltDay>=10;}
 RAAdventures.start=function(id,opts={}){
  if(enabled()&&['A14','SHOW'].includes(id)&&RAAdventures.available('VP-ECO-R'))return oldStart('VP-ECO-R',opts);
  const def=RAAdventures.get(id),home=['THRONE','KITCHEN','BEDROOM','CASTLE','HOST','A26','ROOMS'];
  const blocked=home.includes(id)||id==='DATE'||def?.lane==='dating'||B.isPrivate(id)||B.state().slotDay===day()||(life().clock.nightOutings||[]).some(o=>o.type==='date');
  if(enabled()&&!RAAdventures.active()&&id!=='A23'&&!blocked&&hiltDue()){
   let env=def?.nodes?.[def.start]?.env;try{if(typeof env==='function')env=env({vars:opts.vars||{},L:RALife.L(),life:RALife});}catch{env=null;}
   env=typeof env==='string'&&!['bedroom','throne','party_hall'].includes(env)?env:'street_night';
   // Only this fired private path changes the A23 entry. Its accepted fight/payout/end are reused.
   RAAdventures.define({...a23,repeatable:true,available:()=>true,nodes:{...a23.nodes,
    arrive:{...a23.nodes.arrive,env,lines:[B.N("Hilt arrives at Rich's next outing."),...a23.nodes.arrive.lines.slice(2)]},
    leave:{...a23.nodes.leave,lines:[]}}});
   const r=oldStart('A23',{...opts,vars:{...opts.vars,env}});if(r)B.patch('ecology.hiltDay',day());return r;
  }
  return oldStart(id,opts);
 };
 B.onComplete((result,run)=>{
  const id=result.id,v=run?.vars||{};
  if(enabled()&&id==='HOOKAH')RAEcology.add(-5,'hookah');
  if(['HOST','A26'].includes(id)){
   B.activity('party');
   if(enabled()&&[...new Set(v.guests||[])].filter(g=>life().people.records[g]?.conversionState==='converted').length>=5)RAEcology.add(6,'castle-party');
   if(['bad','legendary'].includes(result.outcome))B.once('viral:party');
   if(result.outcome==='legendary')B.once('SPK:party');
   if(v.theme==='dragon')B.once('SPK:dragon');
  }
  if(id==='A14')B.once('viral:groupie');
  if(['A14','SHOW'].includes(id)&&RARelations.met('tasha')){B.once('SPK:filmed');B.activity('clip');}
  if(id==='ARC-X')B.activity('arc');if(id==='S08')B.activity('podcast');if(id==='S04'&&result.outcome==='signed')B.activity('kid');
  primeSpark();
 });
 // The accepted ordinary TOUGE result is not changed. Only a real completed top score is a candidate.
 const touge=RACars.touge;
 RACars.touge=async function(params={},api){const car=RALife.ownedCars().find(c=>c.id===(params.car||RALife.flag('tougeCar')))||RALife.ownedCars()[0];const r=await touge(params,api);if(r&&!r.quit){B.activity('drift');const top={angeles_crest:184220,docks:121400,grave_garage:98050}[params.course||'angeles_crest'];if(car&&['lambo_urus_oxblood','lambo_aventador','ferrari_f40'].includes(car.id)&&r.score>top)B.once('SPK:drift');primeSpark();}return r;};
 // The accepted app closes over its original function; use the facade only for its RUN action.
 const tougeApp=RAPhoneApps.get('touge'),tougeAction=tougeApp.onAction;
 tougeApp.onAction=function(act,arg,api){return act==='run'&&B.enabled('SPK')?RACars.touge({course:arg},api):tougeAction(act,arg,api);};
 // All public combat data/feel stays intact. A successful, non-fatal authored bite of an explicitly human male
 // contributes pressure; no generic vampire or unknown-sex enemy is guessed into that class.
 // Vol7's OPEN enemy table explicitly labels HUNTER human; the existing Combat2 card points to
 // Hilt, whose Vol2 card is an adult older brother. Other unknown species/sex are never guessed.
 const humanMale=s=>{const e=RACombatData.ENEMIES[s.enemyId],p=RABtfPeople.get(e?.person);return s.enemyId==='hunter'||(e?.human===true||p?.human===true||p?.species==='human')&&(e?.gender==='male'||p?.gender==='male');};
 const rules=window.RACombat2Rules;if(rules){const act=rules.act;rules.act=function(s,a){const hp=s.enemy.hp,pp=s.rich.pp?.bite,result=act(s,a);if(enabled()&&a.type==='move'&&a.id==='bite'&&s.rich.pp?.bite<pp&&s.enemy.hp<hp&&s.enemy.hp>0&&humanMale(s))RAEcology.add(2,'nonfatal-bite');return result;};
  const finish=rules.finish;rules.finish=function(s){const r=finish?.(s);if(s.filming&&s.outcome==='win'){B.once('SPK:filmed');B.activity('clip');primeSpark();}if(s.filming&&s.outcome==='lose')B.once('viral:film-defeat');if(s.enemyId==='groupies')B.once('viral:groupie');return r;};
 }
 // Feed thresholds use the authored 15/30/45 bands, rather than the OPEN provisional +2 indexing.
 const feed=RAVampGram.feed;
 RAVampGram.feed=function(){const f=feed();if(!enabled())return f;const p=RAEcology.pressure();return f.map(x=>x.id===`head:${day()}`?{...x,text:p>=45?'A CONVERTED GIRL STOPPED POSTING. NOBODY SAYS WHY.':p>=30?'HUNTER SEEN ON SUNSET':'BAT SIGHTINGS UP IN SILVER LAKE'}:x);};
 B.S1={dimensions,eligible,candidates,checkSpark,pressureConsequences,hiltDue,headline,sparkHeadlines};
 pressureConsequences();
});

RABuild3Stages.push(function(B){
 'use strict';
 RAFeatures.register({id:'BUILD3.ARC-X',fragment:'BUILD3',description:'ARC-X'});RAFeatures.set('BUILD3.ARC-X',true);B.codes.push('ARC-X');
 const on=()=>B.enabled('ARC-X'),day=()=>RALife.today().day;
 const arc=()=>B.state().arc||{};
 const update=fields=>B.patch('arc',{...arc(),...fields});
 const eligible=()=>on()&&day()>=24&&(RALife.life().creativeLife.music.cooked||[]).length>=2&&RARelations.known().filter(p=>p.level>=3).length>=2;
 const idFor=step=>step===5?'ARC-X':`ARC-X${step}`;
 const available=step=>on()&&arc().step===step&&day()>=(arc().readyDay||0)&&!arc().resolved;
 let registered=false;
 function actors(){
  RABtfPeople.byId['ARC-X1']={id:'ARC-X1',name:'LO LAD',adult:true,age:45,dateable:false,kind:'person',look:{skin:'#a67a56',top:'#73513c',bottom:'#73513c',hair:'#2e2017',height:1.12,width:.88,prop:'cane'}};
  RABtfPeople.byId['ARC-X2']={id:'ARC-X2',name:'PRINCE RUE',adult:true,age:30,dateable:false,kind:'person',look:{skin:'#7a4b30',top:'#6f1832',bottom:'#21151b',hair:'#161014',accent:'#c9a652'}};
  RAEnvironments.register({id:'ARC-X-LOC',name:'RUNG',base:1,floorY:380,paint:{seed:'ARC-X',sky:'#11131e',floor:'#423325',wall:'#241f24',horizon:340,crowd:24,props:[{type:'rect',x:126,y:30,w:5,h:310,color:'#9a7145'},{type:'rect',x:143,y:30,w:5,h:310,color:'#9a7145'}]},placeholder:true});
  RAEnvironments.register({id:'ARC-X-OCEAN',name:'',base:1,floorY:380,paint:{seed:'ARC-X-F',sky:'#000000',floor:'#061c35',wall:'#000000',horizon:280},placeholder:true});
 }
 function next(step){update({step,readyDay:day()+2});}
 function invitation(step,body){const id=idFor(step);B.discover(id);RALife.mail({id:`build3:${id}:${day()}`,kind:'invite',title:step===1?'VAMPGPT':step===3?'3 A.M.':'RUNG',body,adventure:id});}
 function possessionLanes(){
  const owned=RALife.life().ownership,lanes=[],missing=[];
  function add(kind,id,label,laneId=`${kind}:${id}`){
   if(typeof id!=='string'||!id||typeof label!=='string'||!label.trim()){missing.push({code:'ARC-X',kind,id:id||null,reason:'SOURCE_REQUIRED'});return;}
   lanes.push({id:laneId,label,kind:'possession'});
  }
  for(const car of RALife.ownedCars()){
   const catalog=Object.values(window.RACars?.CATALOG||{}).find(c=>c.id===car.id);
   add('car',car.id,car.short||car.model||car.label||catalog?.short||catalog?.model);
  }
  for(const property of owned.properties||[])if(property.ownershipStatus==='owned'){
   const catalog=window.RARealEstate?.LISTINGS?.find(p=>p.id===property.id);
   add('property',property.id,property.label||catalog?.label);
  }
  for(const gun of owned.guns||[])add('gun',gun.id,RACombatData.GUNS[gun.id]?.label||gun.label);
  // Younger stages remain the actual owned possession; only MAJESTIC uses the authored air/contentment lane.
  const dragon=RALife.dragon();if(dragon&&dragon.stage!=='majestic')add('dragon','mazda',dragon.name,'mazda_dragon');
  const second=B.state().s4;if(second?.hatchDay&&second.driftwood)add('dragon','S06',RABtfPeople.get('S06')?.name,'S06');
  return {lanes,missing};
 }
 function crew(){
  const coffeAllowed=['forgiven','doubleAgent'].includes(RALife.flag('coffeFate'));
  const people=RARelations.known().filter(p=>p.level>=2&&(p.id!=='coffe'||coffeAllowed)),out=people.map(p=>({id:p.id,label:p.catalog.name,kind:['nneka','uncle_sunday','iron_jaw','kiki'].includes(p.id)?'contentment':'people'}));
  if(RALife.dragon()?.stage==='majestic')out.push({id:'mazda_dragon',label:'BLUEBERRY MAZDA',kind:'contentment'});
  // The source allows every major possession. Rich's actual castle is a possession from Day 1,
  // and counts once; its rooms do not manufacture duplicate castle lanes.
  if(RALife.life().world.location==='LA')out.push({id:'castle',label:'THE CASTLE',kind:'possession'});
  out.push(...possessionLanes().lanes);
  if(RALife.ownedCars().length&&RARelations.level('pinky')>=2)out.push({id:'pinky_car',label:'PINKY + A CAR',kind:'street'});
  if(RALife.hasRoom('crypt')&&RALife.flag('bonesworthResident'))out.push({id:'bonesworth',label:'SIR BONESWORTH',kind:'engineering'});
  return [...new Map(out.map(x=>[x.id,x])).values()];
 }
 function win(){update({resolved:true,step:6,resolvedDay:day(),resident:false});B.once('ARC-X:momentum');RALife.addProp('ARC-X-rung');B.discover('ARC-X-COLLAB');
  if(arc().master)update({master:null});
  RARelations.meet('ARC-X2','ARC-X');window.RAVampGram?.post({id:'ARC-X:vicky',handle:'vicky',text:'',imageCode:'ARC-X-COLLAPSE'});
 }
 function prepareBoss(){
  if(RACombatData.ENEMIES['ARC-X-BOSS'])return;
  RACombatData.ENEMIES['ARC-X-BOSS']={name:'LO LAD',hp:180,person:'ARC-X1',boss:true,
   moves:{strike:{id:'strike',label:'RUNG STRIKE',dmg:30,telegraph:'RUNG STRIKE · 30'},more:{id:'more',label:'YOU COULD BE MORE',dmg:0,effect:{richWeak:.8,turns:2},telegraph:'YOU COULD BE MORE'},sweep:{id:'sweep',label:'LADDER SWEEP',dmg:24,aoe:true,telegraph:'LADDER SWEEP · 24'}},pattern:['strike','more','sweep'],
   octopus:{charisma:{label:'SIT ON THE CURB WITH ME',result:'spared',text:'he can’t. he collapses. the fight ends.'},roast:{label:'YOUR LADDER IS WOOD, OGA.',result:'nothing',text:'your ladder is wood, oga.'}}};
  RACombat2Ext.registerBossScript('ARC-X-BOSS',{fragment:'BUILD3',flag:'BUILD3.ARC-X',onCreate:s=>{s.rich.charismaFree=true;s.arcX={contentment:(arc().lanes||[]).some(id=>crew().find(x=>x.id===id)?.kind==='contentment'),lastPulse:0};},
   beforeEnemyTurn(s,h){if(s.rich.revengeDouble||s.itemsUsed.jollof)s.rich.weak=null;if(s.arcX.contentment&&s.turn%2===0&&s.arcX.lastPulse!==s.turn){s.arcX.lastPulse=s.turn;s.enemy.hp=Math.max(0,s.enemy.hp-15);h.say(s,'CONTENTMENT · 15','hit',{target:'enemy',amount:15});if(s.enemy.hp===0){s.over=true;s.outcome='win';}}},
   afterEnemyTurn(s,h){if(s.log.some(x=>x.move==='more')&&s.rich.weak)s.rich.weak.turns=RACombatData.ENEMIES['ARC-X-BOSS'].moves.more.effect.turns+1;if(s.rich.revengeDouble||s.itemsUsed.jollof)s.rich.weak=null;if(s.log.some(x=>x.move==='sweep')&&!s.log.some(x=>x.text.startsWith('IT HITS ')))for(const c of s.companions){s.companionHurt.push(c.id);h.say(s,`${c.name} · LADDER SWEEP · 24`,'hurt',{target:c.id,amount:24,companion:c.id});}}});
 }
 function chapter1(){return {id:'ARC-X1',title:'A WOODEN BUSINESS CARD',lane:'weird',start:'route',available:()=>available(1),nodes:{
  route:{route:{dest:'downtown',next:'arrive'}},
  arrive:{env:'ARC-X-LOC',title:'RUNG',actors:{left:'rich',right:'ARC-X1'},lines:[B.N('A lit wooden ladder rises through the skylight. Ten glowing rungs.'),B.N('A rapper Rich recognizes from VampGram poses for photos on Rung 6.')],next:'pitch'},
  pitch:{lines:[B.S('ARC-X1',"You've been doing a little of everything. That's cute. Fame doesn't come from everything."),B.S('ARC-X1',"It comes from one ladder. I'll put you on Rung 1 tonight.")],choices:[
   {label:'SIGN',fx:A=>{A.set('signed',true);update({signed:true,signedDay:day()});},next:'end'},
   {label:'LET ME THINK ABOUT IT',next:'end'},
   {label:'ASK WHAT HAPPENED TO THE GUY ON RUNG 9',octopus:true,fx:()=>update({tell:true}),next:'tell'}]},
  tell:{lines:[B.N('Lo Lad smiles and changes the subject.')],next:'end'},
  end:{end:{outcome:A=>A.vars.signed?'signed':'unsigned',fx:()=>next(2),memory:{text:'a wooden business card. a ladder instead of lanes.',lane:'weird'},receipt:{caption:'a wooden business card.'},home:[...B.R("one ladder? i got lanes bro")]}}
 }};}
 function chapter2(){return {id:'ARC-X2',title:'RUNG 1, RUNG 2, RUNG 3',lane:'music',start:'entry',available:()=>available(2),nodes:{
  entry:{env:'ARC-X-LOC',actors:{left:'rich',right:'ARC-X1'},lines:()=>[B.N(arc().signed?'Rich climbs to Rung 3 fast.':'A wooden watch arrives. A driftwood-framed photo of Rich’s castle was taken from across the street.')],next:()=>arc().signed?'show':'post'},
  show:{lines:[B.N('A RUNG showcase.')],choices:A=>RAParties.choices({fallback:{reaction:'the room reacts.',score:1}},'showEnd')},
  showEnd:{enter:A=>{const before=RALife.life().resources.followers;RAMusic.showResult(A.vars.partyScore||1);const delta=RALife.life().resources.followers-before;RALife.addFollowers(delta);A.set('earned',delta*2);},next:'photo'},
  photo:{lines:[B.N('A RUNG photo shoot. Rich posts exactly what Lo Lad writes.')],next:'instructions'},
  instructions:{lines:[B.N('RUNG instructions arrive with the life Rich already has.')],choices:[{label:'NO MORE DRIFTING — BRAND RISK.',fx:A=>A.set('followed','drifting'),next:'cost'},{label:'DON’T POST THE DRAGON.',fx:A=>A.set('followed','dragon'),next:'cost'},{label:'CANCEL THE THING WITH PINKY.',fx:A=>A.set('followed','pinky'),next:'cost'},{label:'CHOOSE THE CASTLE PARTY',fx:A=>A.set('followed',null),next:'post'}]},
  cost:{lines:A=>[B.N(A.vars.followed==='pinky'?'A skipped text from someone at CLOSE.':'Mazda sulks on the roof.')],enter:A=>update({followed:[...(arc().followed||[]),A.vars.followed]}),next:'post'},
  post:{lines:[B.N('A blurry photo of the ladder appears from an account Rich never followed.'),B.N('ask them about rung 10.')],next:'end'},
  end:{end:{outcome:'rung3',fx:A=>{if(arc().signed)RALife.addFollowers(Math.max(0,300-(A.vars.earned||0)));update({doomDay:day()+6});next(3);},memory:{text:'ask them about rung 10',lane:'music'},home:[...B.R("yeah im asking")]}}
 }};}
 function chapter3(){return {id:'ARC-X3',title:'ASK THEM ABOUT RUNG 10',lane:'weird',start:'route',available:()=>available(3),nodes:{
  route:{route:{dest:'pier',next:'arrive'}},
  arrive:{env:'pier',actors:{left:'rich',right:'ARC-X2',...(RARelations.met('uncle_sunday')?{farRight:'uncle_sunday'}:{})},title:'SANTA MONICA PIER · 3 A.M.',lines:[B.N('Prince Rue has been sleeping in his car. The ladder collapsed at his showcase. RUNG owned his masters.')],next:'brochure'},
  brochure:{lines:[B.N('An old RUNG brochure from the 1980s. Among its success stories: Vicky in adventurer gear, before she met Rich.')],choices:[
   {label:'GIVE PRINCE RUE $5,000',when:()=>RALife.money()>=5000,fx:()=>{RALife.spend(5000);update({help:'money'});},next:'end'},
   {label:'LET HIM CRASH AT THE CASTLE',fx:()=>update({help:'castle',resident:true}),next:'end'},
   {label:'WE’RE GONNA TAKE THE LADDER.',octopus:true,fx:()=>update({immediate:true}),next:'end'}]},
  end:{end:{outcome:'act',fx:()=>{next(4);if(arc().immediate)update({readyDay:day()});},memory:{text:'Vicky was in the old brochure. Prince Rue fell from Rung 9.',lane:'weird'},home:[...B.R("same ladder again this shit is buns")]}}
 }};}
 function chapter4(){return {id:'ARC-X4',title:'OTHER LANES',lane:'people',start:'plan',available:()=>available(4),nodes:{
  plan:{env:'throne',actors:{left:'rich'},title:'OTHER LANES',lines:[B.R("my people my castle we got options")],choices:A=>{
   const selected=A.vars.lanes||[];const options=crew();return [...options.map(x=>({label:`${selected.includes(x.id)?'✓ ':''}${x.label}`,when:()=>selected.includes(x.id)||selected.length<5,fx:X=>X.set('lanes',selected.includes(x.id)?selected.filter(i=>i!==x.id):[...selected,x.id]),next:'plan'})),
    {label:'OCTOPUS BRAIN',octopus:true,next:'hint'},
    {label:'THAT’S THE PLAN',when:()=>selected.length>=3,fx:X=>update({lanes:X.vars.lanes}),next:'end'}];}},
  hint:{lines:[B.N('Lo Lad feeds on ambition. A vampire who feeds on ambition starves around people who are content.')],next:'plan'},
  end:{end:{outcome:'planned',fx:()=>next(5),memory:()=>({text:`assembled ${arc().lanes?.length||0} lanes`,lane:'people'}),home:[...B.R("one ladder for all these lanes? come on bro")]}}
 }};}
 function chapter5(){return {id:'ARC-X',title:'RUNG 10',lane:'weird',legend:true,repeatable:true,start:'arrive',available:()=>available(5),nodes:{
  arrive:{env:'ARC-X-LOC',actors:{left:'rich',right:'ARC-X1'},title:'RUNG 10',lines:()=>[B.N(arc().signed?'Rich’s Rung 10 showcase.':'Prince Rue’s second-chance showcase. Rich crashes it.'),B.N('The selected lanes move one after another.')],next:'lanes'},
  lanes:{lines:()=>[B.N((arc().lanes||[]).map(id=>crew().find(x=>x.id===id)?.label||RABtfPeople.get(id)?.name||id).join(' · ')),...(arc().lanes||[]).map(id=>B.N(laneBeat(id)))],next:'song'},
  song:{enter:()=>{const song=RALife.life().creativeLife.music.castleSong||RARadio.owned()[0]?.id;if(song)RARadio.setTrack(song);},lines:()=>{const track=RARadio.TRACKS.find(t=>t.id===(RALife.life().creativeLife.music.castleSong||RARadio.owned()[0]?.id));return [...(track?[B.N(track.title)]:[]),B.N('People stop wanting the ladder. Lo Lad gets thinner, older, drier — like driftwood.')];},choices:[
   {label:'I’M GOOD. I GOT MY PEOPLE.',next:'fight'},{label:'I GOT MY DRAGON. I GOT JOLLOF.',next:'fight'},{label:'BE HAPPY WITH WHAT YOU HAVE.',next:'fight'}]},
  fight:{enter:()=>prepareBoss(),fight:{enemy:'ARC-X-BOSS',params:{env:'ARC-X-LOC'},win:'collapse',spared:'collapse',lose:'retry'}},
  retry:{lines:[B.R("shit we still got lanes")],end:{outcome:'retry',fx:()=>update({step:5,readyDay:day()+1}),memory:{text:'the ladder fight. the lanes are still there.',lane:'combat'}}},
  collapse:{lines:[B.N('The ladder falls through the skylight and breaks into ten rungs. Nobody is hurt. Every signed talent’s contract dissolves.')],next:'fork'},
  fork:{actors:{left:'rich',right:'ARC-X1'},lines:[B.N('A withered, harmless old man holding his cane.')],choices:[
   {label:'LET HIM GO',fx:()=>update({ending:'let-go'}),next:'end'},
   {label:'TAKE THE CANE',fx:()=>{RALife.addProp('ARC-X-cane');update({ending:'cane'});},next:'end'},
   {label:'GIVE HIM A PLATE',octopus:true,fx:()=>update({ending:'plate',fed:true}),next:'end'}]},
  end:{end:{outcome:'resolved',fx:win,memory:{text:'broke the ladder with the lanes already built',lane:'weird',quality:2},receipt:{caption:'a rung, by the red bed.'},home:[...B.R("my life is good bro")]}}
 }};}
 function failDefinition(){return {id:'ARC-X-F',title:'',lane:'weird',start:'ocean',available:()=>on()&&!!arc().failurePending,nodes:{
  ocean:{env:'ARC-X-OCEAN',actors:{},lines:[B.R("my bed im good")],next:'end'},
  end:{end:{outcome:'awake',fx:()=>update({failurePending:false}),memory:{text:'one ocean frame, then the red bed. the lanes are still there.',lane:'weird'}}}
 }};}
 function register(){if(registered)return;registered=true;actors();for(const def of [chapter1(),chapter2(),chapter3(),chapter4(),chapter5(),failDefinition()])B.define(def);
  B.define({id:'ARC-X-COLLAB',title:'A VERSE',lane:'music',repeatable:true,cooldown:10,start:'verse',available:()=>on()&&arc().resolved,nodes:{verse:{lines:[B.N('Prince Rue sends a verse.')],end:{outcome:'verse',fx:()=>update({collab:true}),memory:{text:'Prince Rue sent a verse',lane:'music'}}}}});
  RAWakeTriggers.define([{adventure:'ARC-X-F',priority:98,when:()=>!!arc().failurePending&&!window.RAFame?.claimsWake?.()}]);
 }
 function laneBeat(id){return ({shannon_001:'Shannon reads the structural-failure clause.',mazda_dragon:'Mazda reaches the top of the ladder from outside the skylight.',pinky_car:'A distraction drift on the street below RUNG.',bllad33:'BLLAD33 stands near the door.',nneka:'Nneka knows what Lo Lad feeds on.',tunde:'Tunde handles the crowd.',dre:'Dre handles the crowd.',uncle_sunday:'Uncle Sunday brings Agege bread for strength.',kaede:'Forty Kevins applaud the ladder at the wrong time.',iron_jaw:'Iron Jaw raps about snacks.',bonesworth:'Sir Bonesworth knows about collapsing structures.',coffe:'Vicky’s Party shares information.',duchess:'One phone call. Lo Lad’s lease ends.',wispa:'Wispa haunts the ladder.',nightshade:'Nightshade haunts the ladder.',castle:'Rich’s castle. Another lane.'})[id]||crew().find(x=>x.id===id)?.label||id;}
 function fail(){if(!arc().signed||arc().acted||arc().resolved||arc().failed||!arc().doomDay||day()<arc().doomDay)return;
  const song=(RALife.life().creativeLife.music.songs||[])[0];RALife.addMoney(-Math.round(RALife.money()*.3));update({failed:true,failedDay:day(),failurePending:true,master:song?.id||song?.trackId||null,step:3,readyDay:day()});if(arc().master===RARadio.current()){const remaining=RARadio.owned()[0];if(remaining)RARadio.setTrack(remaining.id);else RAState.patch('life.phone.radio.track',null);}B.discover('ARC-X-F');invitation(3,'Prince Rue finds him.');
 }
 function wake(){
  if(!on())return;
  if(arc().started){register();fail();if(arc().master&&day()>arc().failedDay&&!arc().masterReturned){update({master:null,masterReturned:true});RALife.mail({id:'ARC-X:masters',kind:'story',title:'SHANNON',body:'RUNG’s song ownership is reversed.'});}if(arc().resolved){if(day()-(arc().verseDay||arc().resolvedDay)>=10){update({verseDay:day(),collab:true});RALife.mail({id:`ARC-X:verse:${day()}`,kind:'music',title:'PRINCE RUE',body:'A verse.',adventure:'ARC-X-COLLAB'});}return;}
   const step=arc().step;if(day()>=(arc().readyDay||0)&&!B.state().discovered[idFor(step)])invitation(step,step===3?'Santa Monica Pier, 3 a.m.':'The next RUNG night.');return;
  }
  if(!eligible())return;
  register();const e=arc();
  if(!e.inviteDay){update({step:1,readyDay:day(),inviteDay:day(),returns:0});invitation(1,"somebody left this. it's wood. i don't like it.");}
  else if(!e.returns&&day()-e.inviteDay>=5){update({returns:1,secondInviteDay:day()});invitation(1,"somebody left this. it's wood. i don't like it.");}
  else if(e.returns&&day()<40&&day()-(e.secondInviteDay||e.inviteDay)>=5){update({readyDay:40});}
  else if(day()>=40&&e.readyDay===40&&!e.dormantReturned){update({readyDay:day(),dormantReturned:true});invitation(1,"somebody left this. it's wood. i don't like it.");}
 }
 const start=RAAdventures.start;
 RAAdventures.start=function(id,opts){const r=start(id,opts);if(r&&id==='ARC-X1')update({started:true,startDay:day()});if(r&&['ARC-X3','ARC-X4','ARC-X'].includes(id))update({acted:true});return r;};
 const owned=RARadio.owned,setTrack=RARadio.setTrack;
 RARadio.owned=()=>on()&&arc().master?owned().filter(t=>t.id!==arc().master):owned();
 RARadio.setTrack=id=>on()&&arc().master===id?null:setTrack(id);
 const radio=RAPhoneApps.get('radio'),renderRadio=radio.render,radioAction=radio.onAction;
 function withoutMaster(fn){if(!on()||!arc().master)return fn();const old=RALife.life().creativeLife.music.songs;const music=RALife.life().creativeLife.music;music.songs=old.filter(s=>(s.id||s.trackId)!==arc().master);try{return fn();}finally{music.songs=old;}}
 radio.render=function(...args){return withoutMaster(()=>renderRadio.apply(this,args));};
 radio.onAction=function(act,arg,api){if(on()&&arc().master===arg&&['play','castle'].includes(act))return api.refresh();if(act==='cycle'&&on()&&arc().master){const list=RARadio.owned();const i=list.findIndex(t=>t.id===RARadio.current());if(list.length)RARadio.setTrack(list[(i+1)%list.length].id);return api.refresh();}return radioAction(act,arg,api);};
 const mini=RARadio.miniPlayer;RARadio.miniPlayer=()=>withoutMaster(mini);
 const cook=RAMusic.cook;
 RAMusic.cook=function(opts){const r=cook(opts);if(r&&on()&&arc().collab&&(opts?.collab||RAAdventures.active()?.vars.arcCollab)){update({collab:false});const music=RALife.life().creativeLife.music;RAState.patch('life.creativeLife.music.cooked',music.cooked.map(s=>s.id===r.song.id?{...s,collaborator:'ARC-X2'}:s));RALife.remember({id:`ARC-X:collab:${r.song.id}`,text:'a Prince Rue collaboration',lane:'music'});RAMusic.drop(r.song.id,'vampgram');}return r;};
 const studio=RAAdventures.get('COOK'),titleChoices=studio.nodes.title.choices;
 RAAdventures.define({...studio,nodes:{...studio.nodes,title:{...studio.nodes.title,choices:A=>{const choices=titleChoices(A);return on()&&arc().collab?choices.map(c=>({...c,next:'ARC-X-COLLAB'})):choices;}},'ARC-X-COLLAB':{lines:[B.N('Prince Rue sent a verse.')],choices:[{label:'COLLAB + DROP IT',fx:A=>A.set('arcCollab',true),next:'cooked'},{label:'SOLO',fx:A=>A.set('arcCollab',false),next:'cooked'}]}}});
 B.slot('ARC-X',wake);B.S2={eligible,available,crew,crewMissing:()=>possessionLanes().missing,wake,fail,prepareBoss,arc,update};
 if(arc().inviteDay||arc().started)register();
});

RABuild3Stages.push(function(B){
 'use strict';
 const codes=['S01','S02','S03','S04'];for(const code of codes){RAFeatures.register({id:`BUILD3.${code}`,fragment:'BUILD3',description:code});RAFeatures.set(`BUILD3.${code}`,true);B.codes.push(code);}
 const day=()=>RALife.today().day,life=()=>RALife.life(),s=()=>B.state().s3||{},update=fields=>B.patch('s3',{...s(),...fields});
 const on=code=>B.enabled(code),owned=()=>life().ownership.properties.filter(p=>p.ownershipStatus==='owned');
 const eligible={S01:()=>on('S01')&&day()>=3&&day()<=6&&life().phone.learned,
  S02:()=>on('S02')&&(RALife.ownedCars().length>=2||RALife.hasCar('toyota_supra_mk4_001')&&day()>=12),
  S03:()=>on('S03')&&!!choosePerson(),S04:()=>on('S04')&&owned().length>=2&&RALife.netWorth()>=600000};
 function personHistory(id){return s().people?.[id]||{};}
 function notePerson(id,fields){update({people:{...s().people,[id]:{...personHistory(id),...fields}}});}
 const meet=RARelations.meet,date=RARelations.date,add=RARelations.add,gift=RARelations.gift;
 RARelations.meet=function(id,source){const had=RARelations.met(id),r=meet(id,source);if(!had&&RABtfPeople.get(id)?.dateable)notePerson(id,{metDay:day()});return r;};
 RARelations.add=function(id,points,opts){const had=RARelations.met(id),before=RARelations.level(id),r=add(id,points,opts);if(RABtfPeople.get(id)?.dateable){if(!had)notePerson(id,{metDay:day()});if(before<4&&r.after>=4)notePerson(id,{rideDay:day()});}return r;};
 RARelations.date=function(id,spot,opts){const before=RARelations.level(id),r=date(id,spot,opts);notePerson(id,{...(before<4&&r.after>=4?{rideDay:day()}:{}),dates:[...(personHistory(id).dates||[]),{day:day(),spot}].slice(-40)});return r;};
 RARelations.gift=function(id,item){const r=gift(id,item);notePerson(id,{gifts:[...(personHistory(id).gifts||[]),{day:day(),id:item,right:r}].slice(-40)});return r;};
 function metDay(id){const recorded=personHistory(id).metDay;if(recorded)return recorded;const p=RARelations.get(id);const dates=life().history.filter(e=>e.personId===id&&e.day).map(e=>e.day);const memories=life().memoryLog.filter(m=>m.id.includes(`:${id}:`)||m.id===`meet:${id}`).map(m=>m.day);return Math.min(...dates,...memories,p?.firstMetDay||Infinity,p?.metDay||Infinity);}
 function choosePerson(){const people=RARelations.known({dateable:true}).filter(p=>p.level>=4||p.level>=3&&day()-metDay(p.id)>=20);return people.sort((a,b)=>(personHistory(a.id).rideDay||metDay(a.id))-(personHistory(b.id).rideDay||metDay(b.id))||a.id.localeCompare(b.id))[0]?.id||null;}
 function box(id){const p=RARelations.get(id),h=personHistory(id),items=[];const dates=h.dates||[];const spotLabel=spot=>spot==='boba'?'BOBA CUP LID':spot==='peking_naija'?'PEKING NAIJA RECEIPT':RADating.SPOTS[spot]?.label||spot;if(dates.length)for(const d of dates)items.push({kind:'date',day:d.day,spot:d.spot,label:spotLabel(d.spot)});else if(p?.datesCount){items.push({kind:'dates',count:p.datesCount,label:`${p.datesCount} DATES`});if(p.lastSpot)items.push({kind:'date',spot:p.lastSpot,label:spotLabel(p.lastSpot)});}
  for(const g of p?.gifts||[])items.push({kind:'gift',id:g,label:g.replace(/_/g,' ').toUpperCase(),icon:window.RAArtRegistry?.items?.gifts?.[g]?.asset||null});
  const first=(life().phone.threads[id]||[]).find(t=>t.from==='RICH');if(first)items.push({kind:'text',day:first.day,label:first.text});return items;
 }
 function offer(code,definition,title,body){B.offer(code,definition,{id:`BUILD3:${code}`,kind:'invite',title,body,adventure:code});}
 let registered={};function register(code){if(registered[code])return;registered[code]=true;
  if(code==='S01'){RABtfPeople.byId.S01={id:'S01',name:'GRANDMA',age:90,adult:true,dateable:false,kind:'person',look:{skin:'#795442',top:'#bf8f4b',bottom:'#694c38',hair:'#d6cebe',hairShape:'bun',height:.85}};RAEnvironments.register({id:'S01-LOC',name:'LEIMERT PARK',base:1,floorY:390,placeholder:true,paint:{seed:'S01',sky:'#171226',wall:'#5a3f38',floor:'#684b40',horizon:350,crowd:9,props:[{type:'table',x:94,y:310,w:100,color:'#9a7860'},{type:'circle',x:85,y:130,r:12,color:'#be657f'},{type:'circle',x:176,y:100,r:12,color:'#8da57c'}]}});B.define(definition01());}
  if(code==='S02'){RABtfPeople.byId.S02={id:'S02',name:'',age:50,adult:true,dateable:false,kind:'person',look:{skin:'#c8d8ef',top:'#6c839e',bottom:'#40546e',hair:'#c8d8ef',translucent:true}};RAEnvironments.register({id:'S02-LOC',name:'',base:1,floorY:390,placeholder:true,paint:{seed:'S02',sky:'#101523',wall:'#242b35',floor:'#333b44',horizon:325,crowd:22}});B.define(definition02());}
  if(code==='S03')B.define(definition03());
  if(code==='S04'){RABtfPeople.byId.S04={id:'S04',name:'DEMARCUS “DEEP END” HOLLOWAY',age:19,adult:true,dateable:false,kind:'person',look:{skin:'#77503b',top:'#255563',bottom:'#191b26',hair:'#1c1616'}};B.define(definition04());}
 }
 function definition01(){return {id:'S01',title:'A WRONG NUMBER',lane:'people',repeatable:true,start:'text',available:()=>on('S01')&&!s().s01Dismissed&&(!s().s01Visited||!!s().s01Return),nodes:{
  text:{env:'bedroom',actors:{left:'rich'},lines:[B.S(null,"grandma's birthday is tonight, you better come, she's asking for you.")],choices:[{label:'WRONG NUMBER',fx:()=>{update({s01Dismissed:true});RALife.text('S01','RICH','wrong number',{id:'S01:reply'});},next:'endNo'},{label:'IGNORE',fx:()=>update({s01Dismissed:true}),next:'endNo'},{label:'I’M ON MY WAY.',octopus:true,next:'route'}]},
  route:{route:{dest:'leimert',next:'arrive'}},arrive:{env:'S01-LOC',actors:{left:'rich',right:'S01'},lines:[B.N('A small house in Leimert Park. A 90-year-old grandmother has no idea who Rich is. She is thrilled he came.'),B.S('S01','baby.'),B.N('Cake. A card game.'),B.N('Family chaos. Somebody’s uncle asks Rich what he does.')],next:'plate'},
  plate:{lines:[B.N('Rich leaves with a plate.')],next:'end'},end:{end:{outcome:'visited',fx:()=>update({s01Visited:s().s01Visited||day(),s01Return:false,s01NextSunday:!s().s01Visited}),memory:{text:'a birthday at the wrong number. left with a plate.',lane:'people'},receipt:{caption:'a birthday plate.'},home:B.R("damn that was a good night")}},
  endNo:{end:{outcome:'passed',memory:{text:'a wrong number',lane:'people'}}}}};}
 function definition02(){return {id:'S02',title:'A PIN',lane:'cars',repeatable:true,start:'route',available:()=>eligible.S02()&&!B.state().once['S02:dice'],nodes:{route:{route:{dest:'downtown',next:'arrive'}},arrive:{env:'S02-LOC',actors:{left:'rich'},lines:[B.N('An empty industrial lot. Dozens of beautiful cars.'),B.N('Headlights on. Nobody talking.'),B.N('Every car ever totaled in LA. The drivers want to see a clean drift.')],next:'run'},run:{minigame:{id:'touge',params:()=>({build3S02:true,car:RACars.toTouge(RALife.ownedCars()[0]),parts:RALife.ownedCars()[0]?.parts||{},durationSeconds:30,leaderboard:[]}),next:(A,r)=>r.quit?'quit':r.data?.clean?'dice':'quit'}},dice:{actors:{left:'rich',right:'S02'},lines:[B.N('The oldest ghost driver gives Rich a pair of ghost fuzzy dice.')],next:'end'},end:{end:{outcome:'dice',fx:()=>{B.once('S02:dice');RALife.addProp('S02-dice');},memory:{text:'ghost fuzzy dice from a clean drift in the lot',lane:'cars'},receipt:{caption:'ghost fuzzy dice.'},home:B.R("damn my car got ghosts")}},quit:{end:{outcome:'quit',memory:{text:'a silent car meet in the lot',lane:'cars'}}}}};}
 function definition03(){return {id:'S03',title:'A SMALL BOX',lane:'people',start:'arrive',available:()=>on('S03')&&!!s().s03Person&&!s().s03Done,nodes:{arrive:{env:()=>RADating.SPOTS[RARelations.get(s().s03Person)?.lastSpot]?.env||'cafe',actors:()=>({left:'rich',right:s().s03Person}),lines:[B.N('At her place. She shows Rich a small box.')],next:'box'},box:{lines:()=>[...box(s().s03Person).map(i=>B.N(i.label)),B.R("you kept all that? damn")],next:'putBack'},putBack:{lines:[B.N('She puts the box back.')],next:'end'},end:{end:{outcome:'kept',fx:()=>update({s03Done:true,s03Box:box(s().s03Person)}),memory:()=>({text:`${RABtfPeople.get(s().s03Person)?.name} kept a box from their time together`,lane:'people'}),receipt:{caption:'a small box.'}}}}};}
 function forgiveRent(){const target=owned().find(p=>p.id===s().s04Property);if(target)RAState.patch('life.ownership.properties',life().ownership.properties.map(p=>p.id===target.id?{...p,rentDue:0}:p));update({s04Choice:'forgive'});}
 function definition04(){return {id:'S04',title:'THE RENT',lane:'property',start:'arrive',available:()=>eligible.S04()&&!s().s04Done,nodes:{arrive:{env:'property_exterior',actors:{left:'rich',right:'shannon_001',farRight:'S04'},lines:[B.N('Equipment in the unit. The rent has been late. The tenant’s adult son is a producer.'),B.N('Shannon recommends eviction.')],choices:[{label:'EVICT',fx:()=>update({s04Choice:'evict'}),next:'end'},{label:'FORGIVE THE RENT',fx:()=>{const target=owned().find(p=>p.id===s().s04Property);if(target)RAState.patch('life.ownership.properties',life().ownership.properties.map(p=>p.id===target.id?{...p,rentDue:0}:p));update({s04Choice:'forgive'});},next:'end'},{label:'LET ME HEAR THE BEATS.',octopus:true,next:'beats'}]},beats:{actors:{left:'rich',right:'S04'},lines:[B.N('Deep End is good. Genuinely good.')],choices:[{label:'SIGN HIM',fx:()=>update({s04Choice:'signed',s04Quality:true,s04SignedDay:day()}),next:'end'},{label:'FORGIVE THE RENT',fx:forgiveRent,next:'end'}]},end:{end:{outcome:()=>s().s04Choice,fx:()=>{update({s04Done:true});if(s().s04Choice==='signed')RARelations.meet('S04','S04');},memory:()=>({text:s().s04Choice==='signed'?'gave Deep End a chance':'a tenant’s son and the late rent',lane:'property'}),home:B.R("shit we do the best we can")}}}};}
 function wake01(){if(!on('S01'))return;if(s().s01Visited){const next=RALife.today();if(next.sunday&&(s().s01NextSunday&&day()>s().s01Visited||day()-(s().s01ReturnDay||s().s01Visited)>=28)){update({s01Return:true,s01NextSunday:false,s01ReturnDay:day()});RALife.text('S01','UNKNOWN','grandma says come back.',{id:`S01:return:${day()}`});RALife.mail({id:`S01:return:${day()}`,kind:'invite',title:'UNKNOWN',body:'grandma says come back.',adventure:'S01'});}return;}if(eligible.S01()&&!s().s01Dismissed){register('S01');RALife.text('S01','UNKNOWN',"grandma's birthday is tonight, you better come, she's asking for you.",{id:'S01:invite'});offer('S01',definition01,'UNKNOWN',"grandma's birthday is tonight, you better come, she's asking for you.");}}
 function wake02(){if(eligible.S02()&&!B.state().once['S02:dice']){register('S02');offer('S02',definition02,'A PIN','invite-only car meet');}if(B.state().once['S02:dice']&&RALife.hash(day()*83)%8===0)B.once(`S02:flash:${day()}`,()=>RALife.mail({id:`S02:flash:${day()}`,kind:'world',title:'',body:'A ghost headlight flashes in the bedroom window.'}));}
 function wake03(){if(!on('S03')||s().s03Done)return;const id=s().s03Person||choosePerson();if(!id)return;update({s03Person:id});register('S03');offer('S03',definition03,RABtfPeople.get(id).name,'She asks Rich to come over.');}
 function wake04(){if(!on('S04'))return;if(eligible.S04()&&!s().s04Done){if(!s().s04Property)update({s04Property:owned()[0].id});register('S04');offer('S04',definition04,'SHANNON','The rent is late.');}if(s().s04Choice==='signed'&&day()>=40)B.once('S04:beat',()=>window.RAVampGram?.post({id:'S04:beat',handle:'deep.end',text:'rich alucard gave me a chance'}));}
 for(const [code,fn] of Object.entries({S01:wake01,S02:wake02,S03:wake03,S04:wake04}))B.slot(code,fn);
 const cook=RAMusic.cook;RAMusic.cook=function(opts){const r=cook(opts);if(r&&on('S04')&&s().s04Quality){update({s04Quality:false});RAState.patch('life.creativeLife.music.cooked',life().creativeLife.music.cooked.map(song=>song.id===r.song.id?{...song,quality:Math.max(1,song.quality)+1,producer:'S04'}:song));r.song=life().creativeLife.music.cooked.find(song=>song.id===r.song.id);}return r;};
 // The source gives +quality without an amount; one quality step is the existing music model's smallest step.
 for(const code of codes)if(B.state().discovered[code])register(code);
 const enter=RAAdventures.enter;
 RAAdventures.enter=function(node){document.querySelector('.build3-s03-box')?.remove();const r=enter(node);if(r?.def.id==='S03'&&node==='box'){const host=document.querySelector('#adventureScene');if(host){const card=document.createElement('section');card.className='build3-s03-box';card.setAttribute('aria-label','A small box');Object.assign(card.style,{position:'absolute',top:'15%',left:'7%',width:'86%',padding:'8px',background:'#342b27',border:'2px solid #c3a982',zIndex:3,color:'#f1e3c8',fontFamily:'monospace',fontSize:'12px',pointerEvents:'none'});const items=box(s().s03Person);for(const item of items){const row=document.createElement('div');Object.assign(row.style,{padding:'5px',borderBottom:'1px solid #786554'});row.textContent=item.label;if(item.icon){const image=document.createElement('img');image.src=item.icon;image.alt='';Object.assign(image.style,{width:'16px',height:'16px',imageRendering:'pixelated',marginRight:'8px'});row.prepend(image);}card.append(row);}host.append(card);}}return r;};
 window.RABuild3S02Install();B.S3={eligible,choosePerson,box,metDay,personHistory,wake01,wake02,wake03,wake04,update,state:s};
});

RABuild3Stages.push(function(B){
 'use strict';const codes=['S05','S06','S07','S08','M1'];
 for(const code of codes){RAFeatures.register({id:`BUILD3.${code}`,fragment:'BUILD3',description:code});RAFeatures.set(`BUILD3.${code}`,true);B.codes.push(code);}
 const life=()=>RALife.life(),day=()=>RALife.today().day,s=()=>B.state().s4||{},update=f=>B.patch('s4',{...s(),...f}),on=c=>B.enabled(c);
 const sessions=()=>s().pierSessions??(['PIER','A12'].reduce((total,id)=>total+(RALife.adventureRecord(id)?.count||0),0));
 const eggDue=()=>on('S06')&&['young','majestic'].includes(RALife.dragon()?.stage)&&sessions()>=3&&!s().eggDay;
 const women=()=>RARelations.known({dateable:true}).filter(p=>p.level>=3).sort((a,b)=>b.points-a.points||a.id.localeCompare(b.id));
 function draft(code,key,tokens={}){const row=window.RABuild3DraftedLines?.rows.find(r=>r.code===code&&r.key===key);if(!row)return null;const fill=text=>text.replace(/\{\{(person|like|identity)\}\}/g,(m,k)=>tokens[k]??m),speaker=fill(row.speaker),text=fill(row.text);if(/\{\{/.test(speaker+text))return null;const line=speaker==='rich'?B.R(text):B.S(speaker,text);line[2]={...line[2],drafted:'DRAFTED-OL050',code,key};return line;}
 function s07Reactions(A={vars:{}}){if(!on('S07'))return [];const present=(A.vars?.s07Women||women().slice(0,3).map(p=>({id:p.id,level:p.level,likes:p.catalog.likes||[]}))),food=new Set(['peking_naija','naija_mart','food_court','taco_truck','waffle_haven','atl_curb','brunch','little_tokyo']);return present.flatMap(p=>{const tier=p.level>=4?'ride':'close',reaction=draft('S07',`${p.id}.${tier}`)||draft('S07',`shared.${tier}`,{person:p.id}),like=p.likes?.find(id=>food.has(id))||p.likes?.[0],preference=like?draft('S07',food.has(like)?'likes.food':'likes.other',{person:p.id,like:RADating.spotLabel(like).toLowerCase()}):null;return [reaction,preference].filter(Boolean);});}
 const partyOnCalendar=()=>life().clock.mail.some(m=>m.adventure&&['HOST','A26'].includes(m.adventure))||!!s().partyCalendar;
 const eligible={S05:()=>on('S05')&&day()>=22&&day()<=30&&RALife.today().weekdayIndex===6,S06:eggDue,
 S07:()=>on('S07')&&RARelations.known().filter(p=>p.level>=2).length>=4&&women().length>=2&&partyOnCalendar(),
 S08:()=>on('S08')&&day()>=32&&RALife.litDimensions().length>=3,M1:()=>on('M1')&&sessions()>=10};
 function makePerson(id,name,look,extra={}){RABtfPeople.byId[id]={id,name,age:30,adult:true,dateable:false,kind:'person',look:{skin:'#79503a',top:'#435363',bottom:'#201c28',hair:'#19151a',...look},...extra};}
 const registered=new Set();
 RAMinigames.register('S07',{title:'UNCLE SUNDAY’S 60TH',mount(root,ctx){
  const {canvas,ctx:g,toNative}=RAPixel.createCanvas(root),saved=ctx.progress();let dead=false,raf=null,total=saved.sprayed||0,count=saved.count||0;
  const start=performance.now(),finish=()=>{dead=true;ctx.finish(total>=500?{data:{sprayed:total},summary:''}:{quit:true});};
  const tap=e=>{if(dead)return;const p=toNative(e.clientX,e.clientY);if(p.y>425){finish();return;}const beat=(performance.now()-start)%1000,amount=beat<220||beat>850?1000:500;
   if(count<5&&total+amount<=5000&&RALife.spend(amount)){total+=amount;count++;ctx.saveProgress({sprayed:total,count});RALife.remember({id:`S07:spray:${count}`,text:`sprayed ${RALife.fmt(amount)} on Uncle Sunday`,lane:'people',quiet:true});}
   if(count>=5)finish();};canvas.addEventListener('pointerdown',tap);
  function draw(t){if(dead)return;RAPixel.paintEnvironment(g,RAEnvironments.get('S07-LOC').paint);RAPixel.text(g,'SPRAY ON THE BEAT',135,70,{size:8,align:'center',color:'#ffe6b5'});RAPixel.drawActor(g,RABtfPeople.get('uncle_sunday').look,135,340,1.5);const beat=(t-start)%1000;RAPixel.rect(g,35,375,200,10,'#342237');RAPixel.rect(g,35+Math.floor(beat/5),372,3,16,'#f3cc57');RAPixel.text(g,RALife.fmt(total),135,405,{size:8,align:'center',color:'#ffe6b5'});RAPixel.text(g,'DONE',135,454,{size:7,align:'center',color:'#ffe6b5'});raf=requestAnimationFrame(draw);}raf=requestAnimationFrame(draw);
  return {dispose(){dead=true;cancelAnimationFrame(raf);canvas.removeEventListener('pointerdown',tap);}};
 }});
 function define(id,def){B.define(def);B.discover(id);}
 function offer(code,fn,title,body){if(!B.state().discovered[code]){register(code);B.discover(code);RALife.mail({id:`BUILD3:${code}`,kind:'invite',title,body,adventure:code});}else if(!RAAdventures.get(code))register(code);}
 function register(code){if(registered.has(code))return;registered.add(code);
  if(code==='S05'){makePerson('S05-N1','A NEIGHBOR',{top:'#b87545'});makePerson('S05-N2','THE ZOMBIE FAMILY',{skin:'#627c66',top:'#817aa3'});makePerson('S05-N3','THE CASTLE DOWN THE STREET',{top:'#504663'});const base=RAEnvironments.get('castle_exterior_party');RAEnvironments.register({...base,id:'S05-LOC',name:'',image:null,paint:{...base.paint,sky:'#030208',wall:null,lights:[],props:(base.paint?.props||[{type:'rect',x:60,y:120,w:150,h:210,color:'#241f33'}]).filter(p=>p.type!=='window').concat([{type:'rect',x:115,y:267,w:40,h:3,color:'#ffd98a'}])}});B.define(def05());}
  if(code==='S06'){makePerson('S06','DRIFTWOOD',{skin:'#163639',top:'#123338',bottom:'#09282d',hair:'#10282b',tail:true,tailColor:'#14383b',height:.55,width:1.5},{age:null,adult:false,kind:'creature',species:'sea dragon'});B.define(def06());}
  if(code==='S07'){const env=RAEnvironments.get('carson_owambe');RAEnvironments.register({...env,id:'S07-LOC',name:'INGLEWOOD',image:null,paint:{sky:'#191027',wall:'#4a234c',floor:'#4a3a36',horizon:330,...env.paint,seed:'S07',crowd:42,props:(env.paint?.props||[{type:'rect',x:30,y:240,w:210,h:68,color:'#e7ded0'}]).filter(p=>p.type!=='sign')}});B.define(def07());}
  if(code==='S08'){makePerson('S08-A','HOST',{top:'#73523f'});makePerson('S08-B','HOST',{skin:'#b08a6a',top:'#423856'});RAEnvironments.register({id:'S08-LOC',name:'VAN NUYS',base:1,floorY:390,placeholder:true,paint:{seed:'S08',sky:'#141225',wall:'#37303b',floor:'#302b32',horizon:350,props:[{type:'rect',x:40,y:260,w:185,h:70,color:'#4f4957'},{type:'rect',x:12,y:130,w:40,h:45,color:'#191623'}]}});B.define(def08());}
  if(code==='M1'){makePerson('M1','MARINA DEL REY',{skin:'#cea9c4',top:'#1f7380',bottom:'#164551',hair:'#243e53',hairShape:'long',height:.95,width:1.2},{age:30,dateable:true,kind:'woman',species:'mermaid',scope:'MEET+1',likes:['pier'],gifts:[],hoes:[]});const pier=RAEnvironments.get('pier');RAEnvironments.register({...pier,id:'M1-LOC',name:'SANTA MONICA PIER · 3 A.M.',image:null,paint:{...pier.paint,seed:'M1',props:[...(pier.paint?.props||[]),{type:'rect',x:191,y:307,w:48,h:18,color:'#3b424e'}]}});B.define(defM1());}
 }
 function def05(){return {id:'S05',title:'',lane:'party',start:'dark',available:()=>on('S05')&&!s().blackoutDone&&s().blackoutDay===day(),nodes:{
  dark:{env:'S05-LOC',actors:{left:'rich'},lines:[B.N('All of LA loses power. One phone bar. The castle’s candles are the only light on the block.')],next:'arrive'},
  arrive:{actors:{left:'rich',right:'S05-N1',farRight:'S05-N2',farLeft:'S05-N3'},lines:[B.N('Neighbors arrive. Humans. A zombie family.'),B.N('The castle down the street. An unplanned block party.')],enter:()=>{update({battery:100});for(const id of ['S05-N1','S05-N2','S05-N3'])RARelations.meet(id,'S05');},next:'song'},
  song:{lines:()=>[B.N(`PHONE · ONE BAR · BATTERY ${s().battery}%`)],choices:()=>RARadio.owned().map(t=>({label:t.title,fx:()=>{RARadio.setTrack(t.id);update({battery:Math.max(0,s().battery-10)});},next:()=>s().battery>0?'song':'end'})).concat([{label:'THE POWER RETURNS',next:'end'}])},
  end:{end:{outcome:'blackout',fx:()=>{update({blackoutDone:true});B.once('viral:party');},memory:{text:'the castle was the only lit building. neighbors came.',lane:'party',quality:2},receipt:{caption:'the block came over.'},home:B.R("we had candles that was enough bro")}}}};}
 function acquireEgg(){if(!on('S06')||s().eggDay)return false;update({eggDay:day()});RALife.addProp('S06-egg');B.discover('S06');register('S06');RALife.remember({id:'S06:egg',text:'a black egg. cold, wet, smelling like the ocean. Mazda will not let it go.',lane:'dragons'});return true;}
 function def06(){return {id:'S06',title:'',lane:'dragons',start:'hatch',available:()=>on('S06')&&!!s().eggDay&&day()-s().eggDay>=5&&!s().hatchDay,nodes:{hatch:{env:'roof',actors:{left:'rich',right:'S06'},lines:[B.N('Five sleeps. Mazda curls around the black egg.'),B.N('It hatches. A sea dragon: teal-black, finned, eyes like the deep ocean.'),B.N('It cannot fly. It can swim. Calm and ancient even now.')],next:'end'},end:{end:{outcome:'hatched',fx:()=>update({hatchDay:day(),driftwood:{stage:'hatchling',sex:null,humanForm:false,canFly:false}}),memory:{text:'Driftwood hatched on the roof after five sleeps',lane:'dragons'},receipt:{caption:'a black egg hatched.'},home:B.R("another lane bro")}}}};}
 function def07(){return {id:'S07',title:'UNCLE SUNDAY’S 60TH',lane:'people',repeatable:true,start:'route',available:()=>eligible.S07()&&!s().s07Done,nodes:{
  route:{route:{dest:'inglewood',next:'arrive'}},arrive:{env:'S07-LOC',actors:()=>({left:'rich',right:'uncle_sunday',farRight:women()[0]?.id,farLeft:women()[1]?.id}),enter:A=>A.set('s07Women',women().slice(0,3).map(p=>({id:p.id,level:p.level,likes:[...(p.catalog.likes||[])]}))),lines:[B.N('A packed Nigerian event hall in Inglewood. Uncle Sunday invited Rich.'),B.N('Nneka’s mother’s friend. Bunmi’s family friend. Shannon sold him a condo.'),B.N('Tunde is his nephew. The Import Guy plays checkers with him.'),B.N('The women closest to Rich are all here. Matching aso-ebi. They find out about each other.')],next:'spray'},
  spray:{minigame:{id:'S07',params:{},next:(A,r)=>r?.quit?'quit':'food'}},quit:{end:{outcome:'left',memory:{text:'left before spraying bills at the birthday',lane:'people'}}},food:{lines:A=>[B.N('Jollof wars.'),...s07Reactions(A),B.N('Nobody storms out.')],next:'aunties'},
  aunties:{lines:()=>[B.N(`The aunties pick ${women()[0]?.catalog.name} — the woman with the highest relationship score. They announce it on the mic. She is mortified and delighted.`)],next:'end'},end:{end:{outcome:'attended',fx:()=>update({s07Done:true,s07Woman:women()[0]?.id}),memory:{text:'everyone knew Uncle Sunday. everyone was at the same birthday.',lane:'people'},receipt:{caption:'uncle sunday’s 60th.'},home:B.R("damn everybody knows everybody")}}}};}
 function questions(){const log=life().memoryLog;const topics=[];if(log.some(m=>/dragon|dispensary/i.test(m.text)))topics.push({id:'dragon',q:'so you bought a dragon at a dispensary?',memory:log.find(m=>/dragon|dispensary/i.test(m.text))});if(log.some(m=>/ramen|slurp/i.test(m.text)))topics.push({id:'ramen',q:'is it true you worked at a ramen shop?',memory:log.find(m=>/ramen|slurp/i.test(m.text))});if(log.some(m=>/rat/i.test(m.text)))topics.push({id:'rats',q:'what happened with the rats?',memory:log.find(m=>/rat/i.test(m.text))});if(log.some(m=>/uncle sunday/i.test(m.text)))topics.push({id:'sunday',q:'who’s Uncle Sunday?',memory:log.find(m=>/uncle sunday/i.test(m.text))});return topics.slice(0,3);}
 function def08(){return {id:'S08',title:'212 SUBSCRIBERS',lane:'music',start:'intro',available:()=>eligible.S08()&&!s().s08Done,nodes:{intro:{env:'S08-LOC',actors:{left:'rich',right:'S08-A',farRight:'S08-B'},lines:[B.N('A couch in a garage studio in Van Nuys. Two hosts.'),B.N('212 subscribers. The first time anybody asks Rich to talk about himself.')],enter:A=>{A.set('questions',questions());A.set('question',0);},next:A=>A.vars.questions.length?'question':'future'},question:{lines:A=>[B.S('S08-A',A.vars.questions[A.vars.question].q)],choices:[{label:'HONEST',fx:A=>answer(A,'honest'),next:'answer'},{label:'FUNNY',fx:A=>answer(A,'funny'),next:'answer'},{label:'FLEX',fx:A=>answer(A,'flex'),next:'answer'}]},answer:{lines:A=>[B.R(A.vars.reply)],next:A=>A.vars.question<A.vars.questions.length?'question':'future'},future:{lines:[B.S('S08-B','where do you see yourself in a year?')],choices:[{label:'BE HAPPY WITH WHAT YOU HAVE.',fx:A=>A.set('futureReply','my life is good, brother. my life is good.'),next:'end'},{label:'BROTHER. WE GOT OPTIONS.',fx:A=>A.set('futureReply','brother. we got options. i’m good.'),next:'end'}]},end:{lines:A=>[B.R(A.vars.futureReply)],end:{outcome:'interviewed',fx:()=>update({s08Done:true}),memory:{text:'the first interview. 212 subscribers.',lane:'music',quality:2},receipt:{caption:'212 subscribers. good conversation.'}}}}};}
 function answer(A,kind){const q=A.vars.questions[A.vars.question];const lines={dragon:{honest:'brother, yes. a dragon at a dispensary. this is crazy.',funny:'brother. they sell everything in there.',flex:'i got my dragon. i’m good.'},ramen:{honest:'brother, yes. i worked at the shop.',funny:'shi. at least it was something.',flex:'best we can shit. i did it.'},rats:{honest:'brother. the rats were crazy.',funny:'the rats didn’t know me.',flex:'these ogas don’t know me.'},sunday:{honest:'uncle sunday. have you eaten? that’s him.',funny:'brother. the food is serious.',flex:'my people. i got my people.'}};A.set('reply',lines[q.id][kind]);A.set('question',A.vars.question+1);A.set('interviewMemories',[...(A.vars.interviewMemories||[]),q.memory?.id||q.id]);}
 function defM1(){return {id:'M1',title:'3 A.M.',lane:'people',repeatable:true,start:'railing',available:()=>eligible.M1()&&!s().m1Done,nodes:{railing:{env:'M1-LOC',actors:{left:'rich',right:'M1'},lines:[B.N('One mermaid, on a rock beyond the railing. Rich leans away. She finds this hilarious and flirts relentlessly.')],choices:[{label:'DAMN, YOU BAD IN PERSON.',fx:A=>A.set('reply','damn, you bad in person. i’m good right here though.'),next:'reply'},{label:'BROTHER. I’M GOOD RIGHT HERE.',fx:A=>A.set('reply','brother. i’m good right here.'),next:'reply'},{label:'WHAT’S HEADIN’?',octopus:true,fx:A=>A.set('reply','what’s headin’? shi. i’m good right here.'),next:'reply'}]},reply:{lines:A=>[B.R(A.vars.reply)],next:'wave'},wave:{lines:[B.N('She waves and dives.')],next:'end'},end:{end:{outcome:'met',fx:()=>{update({m1Done:true});RARelations.meet('M1','PIER');},memory:{text:'Marina Del Rey waved from the rock. Rich stayed by the railing.',lane:'people'},receipt:{caption:'the railing. i’m good right here.'}}}}};}
 const afterMinigame=RAAdventures.afterMinigame;
 RAAdventures.afterMinigame=function(node,result){const active=RAAdventures.active(),id=active?.id;const next=afterMinigame(node,result);if(['PIER','A12'].includes(id)&&result&&!result.quit){update({pierSessions:sessions()+1});if(eligible.M1()&&RALife.hash(day()*113)%4===0){register('M1');B.discover('M1');return 'BUILD3-M1';}}return next;};
 for(const id of ['PIER','A12']){const a=RAAdventures.get(id);if(a)RAAdventures.define({...a,nodes:{...a.nodes,'BUILD3-M1':{end:{outcome:'fished',chain:()=>RAAdventures.available('M1',{ignoreActive:true})?'M1':null,memory:{text:'night fishing at the pier',lane:'dragons'}}}}});}
 const launch=RAMinigames.launch;RAMinigames.launch=function(id,params,opts){if(id==='pier'&&eggDue())params={...params,build3S06:true};return launch(id,params,opts);};
 const companions=RARelations.companions;RARelations.companions=()=>{const list=companions();if(on('S06')&&s().hatchDay)list.push({id:'S06',name:'DRIFTWOOD',moves:[{id:'other_lane',label:'OTHER LANE',kind:'S06'}]});return list;};
 RACombat2Ext.registerAction('S06',{fragment:'BUILD3',flag:'BUILD3.S06',handle(f,a,h){if(!s().hatchDay||!f.companions.some(c=>c.id==='S06')||(f.hoesUsed.S06||0)>=2)return f;const enemy=RACombatData.ENEMIES[f.enemyId],current=f.enemy.queue[0]||enemy.pattern[f.enemy.step%enemy.pattern.length],others=Object.keys(enemy.moves).filter(id=>id!==current);if(!others.length)return f;const choice=others[Math.min(others.length-1,Math.floor(f.rng()*others.length))];f.hoesUsed.S06=(f.hoesUsed.S06||0)+1;if(f.enemy.queue.length)f.enemy.queue.shift();else f.enemy.step++;f.enemy.queue.unshift(choice);f.telegraph=enemy.moves[choice].telegraph||enemy.moves[choice].label;h.say(f,`DRIFTWOOD · OTHER LANE · ${f.telegraph}`,'hoe',{companion:'S06'});return h.endPlayer(f);}});
 const act=RACombat2Rules.act;RACombat2Rules.act=function(f,a){return on('S06')&&s().hatchDay&&a.type==='hoe'&&a.companion==='S06'&&a.move==='other_lane'?act(f,{type:'S06'}):act(f,a);};
 const tank=RAAdventures.get('FISHTANK'),tankLines=tank.nodes.look.lines;RAAdventures.define({...tank,nodes:{...tank.nodes,look:{...tank.nodes.look,actors:A=>on('S06')&&s().hatchDay?{right:'S06'}:null,lines:A=>on('S06')&&s().hatchDay?[B.N('Rich stands in the doorway. Driftwood lives in the fish tank room.'),B.R("im good right here")]:tankLines(A)}}});
 const canAsk=RADating.canAsk,whyNot=RADating.whyNot;RADating.canAsk=id=>id==='M1'&&!life().momentum.fameFired?false:canAsk(id);RADating.whyNot=id=>id==='M1'&&!life().momentum.fameFired?'not before fame.':whyNot(id);
 const start=RAAdventures.start;RAAdventures.start=function(id,opts){if(id==='DATE'&&opts?.vars?.person==='M1'&&!life().momentum.fameFired)return false;return start(id,opts);};
 function wake05(){if(eligible.S05()&&!s().blackoutDone){update({blackoutDay:day()});offer('S05',def05,'','The phone has one bar.');}}
 function wake06(){if(on('S06')&&s().eggDay&&!s().hatchDay&&day()-s().eggDay>=5){register('S06');B.discover('S06');RALife.mail({id:'S06:hatch',kind:'possession',title:'THE ROOF',body:'The egg opens.',adventure:'S06'});}}
 function wake07(){if(eligible.S07()&&!s().s07Done)offer('S07',def07,'UNCLE SUNDAY','Uncle Sunday invites Rich to his 60th.');}
 function wake08(){if(eligible.S08()&&!s().s08Done)offer('S08',def08,'212 SUBSCRIBERS','An interview in Van Nuys.');}
 for(const [id,fn] of Object.entries({S05:wake05,S06:wake06,S07:wake07,S08:wake08}))B.slot(id,fn);
 B.slot('CRYPTRAT',()=>{if(day()>=20&&RALife.today().friday&&RALife.netWorth()>=1000000)B.once('HQ-M03:SOURCE_REQUIRED');});
 B.wake('HQ-M03',77,()=>{if(day()>=20&&RALife.today().friday&&RALife.netWorth()>=1000000)B.once('HQ-M03:SOURCE_REQUIRED');});
 for(const code of codes)if(B.state().discovered[code])register(code);
 B.onComplete((r)=>{if(r.id==='HOST'||r.id==='A26')update({partyCalendar:null});});
 const partyMail=RALife.mail;RALife.mail=function(m){const r=partyMail(m);if(m?.adventure&&['HOST','A26'].includes(m.adventure))update({partyCalendar:{id:m.adventure,day:day()}});return r;};
 B.wake('S05:neighbor',78,()=>{if(s().blackoutDone&&!s().neighborRevealed&&day()>s().blackoutDay){update({neighborRevealed:true});RALife.mail({id:'S05:neighbor',kind:'people',title:'A NEIGHBOR',body:'One neighbor from the blackout is the reason the castle down the street exists.'});}});
 // HQ-M02 uses only an existing authored generous resolution. Missing resolutions remain queued.
 const generous={'A10:arrive':'CALL HIM UNCLE','A20:fork':'GET FOOD WHILE HE CHARGES','A28:fork':'BUY HER A STEAK','A29C:fork':'FORGIVE HIM','A44_N2:smack':'TALK YOUR WAY PAST HIM','S01:text':'I’M ON MY WAY.','S04:arrive':'FORGIVE THE RENT','ARC-X:fork':'GIVE HIM A PLATE'};
 function placeMemento(){if(s().mementoPlaced||!RALife.consume('sensei_memento'))return false;update({mementoPlaced:true,mementoArmed:true});RALife.addProp('HQ-M02-coral');return true;}
 const castleOpen=RACastle.open;RACastle.open=function(){castleOpen();const menu=document.querySelector('.castle-menu');if(!menu||s().mementoPlaced||!RALife.count('sensei_memento'))return;const button=document.createElement('button');button.className='mail-card';button.textContent='PLACE THE CORAL';button.addEventListener('click',()=>{if(placeMemento())menu.remove();});menu.append(button);};
 const baseChoices=RAAdventures.choicesFor,baseChoose=RAAdventures.choose;
 function mementoTarget(node,list){if(!s().mementoArmed||!list.some(x=>x.octopus))return null;const key=`${RAAdventures.active().id}:${node}`;if(s().mementoFork&&s().mementoFork!==key)return null;if(!s().mementoFork)update({mementoFork:key});const target=list.find(x=>!x.locked&&x.label===generous[key]);if(!target)B.once('HQ-M02:SOURCE_REQUIRED');return target;}
 RAAdventures.choicesFor=function(node){const list=baseChoices(node),target=mementoTarget(node,list);return target?[...list,{label:"there's always another lane.",octopus:true,index:10004,build3Memento:true,locked:false}]:list;};
 RAAdventures.choose=function(node,index){if(index!==10004)return baseChoose(node,index);const target=mementoTarget(node,baseChoices(node));if(!target)return null;update({mementoArmed:false,mementoUsed:true});RALife.addProp('HQ-M02-windowsill');return baseChoose(node,target.index);};
 window.RABuild3S06Install();B.S4={eligible,sessions,eggDue,acquireEgg,wake05,wake06,wake07,wake08,questions,women,placeMemento,generous,state:s,update,s07Reactions};
});

RABuild3Stages.push(function(B){
 'use strict';const codes=['G1','G2','G3','G4','G5','G7','G8','G9'];
 for(const code of codes){RAFeatures.register({id:`BUILD3.${code}`,fragment:'BUILD3',description:code});RAFeatures.set(`BUILD3.${code}`,true);B.codes.push(code);}
 const life=()=>RALife.life(),day=()=>RALife.today().day,s=()=>B.state().s5||{},update=v=>B.patch('s5',{...s(),...v}),on=c=>B.enabled(c);
 const eligible=()=>on('G5')&&(day()>=8||day()>=4&&!!RALife.flag('ogunsRaveCompleted'));
 function draft(key){const row=window.RABuild3DraftedLines?.rows.find(r=>r.code==='G7'&&r.key===key);if(!row)return null;const line=row.speaker==='rich'?B.R(row.text):B.S(row.speaker,row.text);line[2]={...line[2],drafted:'DRAFTED-OL050',code:'G7',key};return line;}
 const sermonEligible=()=>on('G7')&&s().revealed&&RALife.today().weekdayIndex===4&&!s().sermonDelivered;
 function sermonProgress(elapsed,complete=false){if(!sermonEligible())return false;const ms=Math.min(60000,Math.max(Number(s().sermonElapsed)||0,Number(elapsed)||0));update({sermonElapsed:ms,...(complete&&ms===60000?{sermonSeen:true,sermonDelivered:true,sermonPending:false}:{})});return complete&&ms===60000;}
 function firstLoss(e){if(!on('G7')||!s().revealed||e.type!=='status'||e.to!=='GONE'||RACrew.get(e.id)?.status!=='GONE')return false;return B.once('G7:loss:first',()=>{update({lostOga:e.id});const row=draft('loss.first');if(row)RALife.text('G1','XENORIUS 🌞',row[1],{id:'G7:loss:first'});});}
 const palette=['#40826D','#52308C','#F5BD02'];const states=['neutral','loom','billow','forge','dj','voice','laugh','sandwich','seated'];
 let registered=false;
 function register(){if(registered)return;registered=true;
  RABtfPeople.byId.G1={id:'G1',name:'XENORIUS',age:21,adult:true,dateable:false,kind:'person',likes:['music','food'],gifts:['G4'],look:{skin:'#573e30',top:palette[0],bottom:'#4c5641',hair:'#191717',hairShape:'long',height:1.2,width:.8,bandana:palette[0],earring:palette[2]},build3States:states};
  const env=(id,name,paint)=>RAEnvironments.register({id,name,base:1,floorY:390,placeholder:true,paint:{seed:id,sky:'#121c22',wall:'#292933',floor:'#333038',horizon:350,...paint}});
  env('G3-PLATFORM','JEFFERSON / USC',{wall:null,props:[{type:'rect',x:0,y:345,w:270,h:5,color:'#e9c84b'},{type:'rect',x:30,y:96,w:210,h:6,color:'#5b767a'},{type:'rect',x:225,y:200,w:38,h:145,color:'#303c45'},{type:'text',text:'STAY BEHIND THE YELLOW LINE',x:12,y:366,size:5,color:'#e9c84b'},{type:'text',text:'BICYCLE',x:216,y:184,size:5,color:'#81949b'}]});
  env('G3-DOOR','THE MAINTENANCE DOOR',{props:[{type:'rect',x:95,y:130,w:80,h:220,color:'#1c352d'},{type:'text',text:'BICYCLE',x:190,y:240,size:6,color:'#889c94'}]});
  env('G3-FLOOR','THE ROYAL GLITCH',{crowd:30,crowdColors:palette,props:[{type:'circle',x:135,y:114,r:27,color:palette[2]},{type:'rect',x:12,y:65,w:17,h:205,color:palette[0]},{type:'rect',x:240,y:65,w:17,h:205,color:palette[0]},{type:'rect',x:0,y:330,w:270,h:3,color:palette[1]}]});
  env('G3-OFFICE','THE OFFICE',{props:[{type:'rect',x:20,y:94,w:70,h:80,color:'#7b526d'},{type:'text',text:'VAULT OF THE NIGHT',x:23,y:135,size:5,color:'#ebe2cb'},{type:'text',text:'DEAN’S LIST',x:140,y:100,size:6,color:palette[2]},{type:'text',text:'DRAMATIC ARTS OF THE NIGHT',x:110,y:116,size:4,color:'#dfd1a0'},{type:'table',x:75,y:330,w:120,color:'#575346'},{type:'circle',x:215,y:170,r:14,color:'#b6a275'}]});
  env('G3-ROOF','ABOVE THE TRACKS · SUNRISE',{sky:'#b07978',wall:null,props:[{type:'rect',x:0,y:345,w:270,h:4,color:'#817b80'},{type:'rect',x:0,y:367,w:270,h:3,color:'#3e3a42'}]});
  RACombatData.ITEMS.G4={label:'THE FREE WILL',healFull:true};
  B.define(firstNight());B.define(visit());B.define(hang());B.define(show());
  RAMinigames.register('G7-SERMON',{title:'G7',mount(root,ctx){
   const soundtrack=window.RAAudio?.get?.('soundtrack'),resumeMusic=!!soundtrack&&!soundtrack.paused;window.RAAudio?.pause?.('soundtrack');
   const {canvas,ctx:g}=RAPixel.createCanvas(root),env=RAEnvironments.get('G3-FLOOR'),image=env.image?Object.assign(new Image(),{src:env.image}):null,portrait=RAPixel.personSprite('G1','billow'),lines=Array.from({length:10},(_,i)=>draft(`sermon.${String(i+1).padStart(2,'0')}`)).filter(Boolean);let raf=null,dead=false,last=null,elapsed=Number(s().sermonElapsed)||0,persisted=elapsed;
   function draw(t){if(dead)return;if(last!=null&&!document.hidden)elapsed=Math.min(60000,elapsed+Math.max(0,t-last));last=t;if(elapsed-persisted>=1000){sermonProgress(elapsed);persisted=elapsed;}
    if(image?.complete&&image.naturalWidth){g.imageSmoothingEnabled=false;g.drawImage(image,0,0,270,480);}else RAPixel.paintEnvironment(g,env.paint);RAPixel.rect(g,0,0,270,480,'rgba(0,0,0,.55)');g.fillStyle='rgba(245,189,2,.15)';g.beginPath();g.moveTo(135,40);g.lineTo(60,370);g.lineTo(210,370);g.closePath();g.fill();
    g.save();g.shadowColor=Math.floor(elapsed/300)%2?'#F5BD02':'#52308C';g.shadowBlur=0;g.shadowOffsetX=Math.floor(elapsed/300)%2?1:-1;if(!RAPixel.drawSprite(g,portrait,135,305))RAPixel.drawActor(g,RABtfPeople.get('G1').look,135,305,1);g.restore();
    const row=lines[Math.min(lines.length-1,Math.floor(elapsed/6000))];if(row){RAPixel.text(g,'XENORIUS',135,335,{size:7,align:'center',color:'#F5BD02'});for(const [i,text]of RAPixel.wrap(g,row[1],238,7).entries())RAPixel.text(g,text,16,354+i*12,{size:7,color:'#f6efd9'});}
    if(elapsed>=60000){sermonProgress(60000,true);dead=true;ctx.finish({outcome:'heard',data:{durationMs:60000},summary:''});return;}raf=requestAnimationFrame(draw);
   }raf=requestAnimationFrame(draw);return {dispose(){if(!dead)sermonProgress(elapsed);dead=true;cancelAnimationFrame(raf);if(resumeMusic)window.RAAudio?.play?.('soundtrack');}};
  }});
 }
 const actor=state=>({id:'G1',state,look:{...(state==='voice'?{bandana:palette[0]}:{}),...(state==='billow'?{arms:'up'}:{})}});
 function niche(id,text){if(s().lines?.[id])return [];update({lines:{...s().lines,[id]:true}});return [B.S('G1',text)];}
 function visitBuild(A){update({visits:(s().visits||0)+1});A.set('build',`1.${String(s().visits).padStart(2,'0')}`);A.set('patchNotes',s().visits===1?['new feature: Rich Alucard.']:['fixed: bouncer was too nice.','known issue: the train.']);}
 function firstNight(){return {id:'G5',title:'THE COMMUTE',lane:'party',repeatable:true,start:'metro',available:()=>eligible()&&!s().revealed,nodes:{
  metro:{env:'bedroom',actors:{left:'rich'},lines:[B.S(null,"heard you two-stepped at Ogun's. come see a real room. jefferson/usc."),B.S(null,"midnight. take the train.")],choices:[{label:'METRO',next:'platform'},{label:'DRIVE',when:()=>false,hideLocked:false,sub:'he said take the train.'},{label:'FLY',when:()=>false,hideLocked:false,sub:'he said take the train.'}]},
  platform:{env:'G3-PLATFORM',actors:{left:'rich',right:actor('billow')},shot:{profile:'establishing',focal:['right'],reference:'right'},lines:[B.N('Rich stands on the Metro, holding the rail, shades on. Jefferson/USC. Palms and power lines.'),B.N('A wave-shaped canopy. The yellow strip.'),B.N('One arm to the sky. Headphones. A tall figure stands still as the train streaks away.')],next:'forge'},
  forge:{actors:{left:'rich',right:actor('forge')},shot:{profile:'close'},lines:[B.N('A sharp pivot. A stare.'),B.N('A bandana over nose and mouth. Eyes only.')],next:'voice'},
  voice:{actors:{left:'rich',right:actor('voice')},lines:[B.N('A deep theatrical voice. An actor doing a voice.')],next:'loom'},
  loom:{env:'G3-DOOR',actors:{left:'rich',right:actor('loom')},lines:[B.N('He approaches slowly. The maintenance door opens by itself on the first bass hit.')],next:'club'},
  club:{env:'G3-FLOOR',actors:{left:'rich',right:actor('dj')},enter:visitBuild,lines:A=>[B.N(`THE ROYAL GLITCH — BUILD ${A.vars.build}. ${A.vars.patchNotes.join(' ')}`),B.N('Green silk banners billow from the vents. A sun-earring disco ball.'),B.N('Purple UV along the tracks. The crowd cheers for the train overhead.')],next:'sandwich'},
  sandwich:{env:'G3-OFFICE',actors:{left:'rich',right:actor('sandwich')},lines:()=>[B.N('A homemade hot honey chicken sandwich on a soft bun. Offered in both hands.'),...niche('freewill','Use your free will.')],choices:()=>s().sandwich?[{label:'THE CHALLENGE',fx:A=>A.set('freeWill',s().sandwich==='eaten'?1.4:1),next:'challenge'}]:[{label:'EAT IT NOW',fx:A=>{A.set('freeWill',1.4);update({sandwich:'eaten'});},next:'challenge'},{label:'SAVE IT',fx:()=>{RALife.addItem('G4',1);update({sandwich:'saved'});},next:'challenge'},{label:'SPLIT IT WITH HIM',octopus:true,fx:()=>{update({sandwich:'shared',freeWillShared:true});RARelations.setFlag('G1','freeWillShared',true);RARelations.memory('G1','shared the sandwich at the counter');RARelations.gift('G1','G4');},next:'split'}]},
  split:{lines:[B.N('They eat it together. The recipe isn’t the secret. The free will is.')],next:'challenge'},
  challenge:{env:'G3-FLOOR',actors:{left:'rich',right:actor('voice')},lines:[B.S('G1','to see if your rhythm is real or rented.')],next:()=>RAMinigames.get('G6')?'duel':'ready'},
  ready:{end:{outcome:'S6-ready',memory:{text:'the challenge awaits its rhythm duel',lane:'party'}}},
  duel:{minigame:{id:'G6',params:A=>({opponent:'G1',difficulty:'EASY',track:'bloodbath',freeWill:A.vars.freeWill||1}),next:(A,r)=>r?.quit?'ready':'reveal'}},
  reveal:{actors:{left:'rich',right:actor('neutral')},shot:{profile:'close'},enter:()=>update({revealed:true}),lines:[B.N('The bandana comes down. The voice drops.'),B.S('G1','have you eaten?'),B.R("lolu?"),B.S('G1',"It's Xenorius in here."),B.N('Neither brother told the family. Mom thinks they both just stay up late.'),B.R("bro dont tell mom")],next:'pact'},
  pact:{actors:{left:'rich',right:actor('laugh')},lines:[B.N('They shake on it. Don’t tell mom.')],next:'end'},
  end:{end:{outcome:'revealed',fx:unlock,memory:{text:'my little brother built a room under the tracks. neither of us told mom.',lane:'people',quality:2},receipt:{caption:'brother.'},home:B.R("damn my brother built that")}}
 }};}
 function unlock(){update({revealed:true});RARelations.meet('G1','G5');for(const id of ['G3','G7','G7-SET'])B.discover(id);RALife.text('G1','XENORIUS 🌞','Royal Glitch, build 1.01.',{id:'G5:thread'});RAPlaces.define([{id:'G3',label:'THE ROYAL GLITCH',sub:'AFTER 11 P.M. · BUSIEST THURSDAYS',adventure:'G3',when:()=>s().revealed,order:16}]);}
 function visit(){return {id:'G3',title:'THE ROYAL GLITCH',lane:'party',repeatable:true,start:'entry',available:()=>on('G3')&&s().revealed,nodes:{
  entry:{env:'G3-FLOOR',actors:{left:'rich',right:actor('dj')},next:()=>sermonEligible()?'sermon':'arrive'},
  sermon:{env:'G3-FLOOR',actors:{left:'rich',right:actor('billow')},minigame:{id:'G7-SERMON',params:{},next:(A,r)=>r?.quit?'arrive':'sermon_reaction'}},
  sermon_reaction:{lines:()=>[B.N('The crowd goes silent, then louder than ever.'),draft('sermon.rich')].filter(Boolean),next:'arrive'},
  arrive:{env:'G3-FLOOR',actors:{left:'rich',right:actor('dj')},enter:visitBuild,lines:A=>[B.N(s().hatGone?'BUILD 2.0 — new feature: my brother’s about to be famous. i’m next.':`BUILD ${A.vars.build} — ${A.vars.patchNotes.join(' ')}`),...niche('divinity','System error: too much divinity in one body.')],choices:()=>[{label:'THE OFFICE',next:'office'},{label:'WHY THE TRAIN?',next:'train'},{label:'A BUG IN THE SYSTEM?',next:'bug'},...(RAAdventures.available('G7',{ignoreActive:true})?[{label:'HANG WITH MY BROTHER',fx:A=>A.set('chain','G7'),next:'end'}]:[]),...(RAAdventures.available('G7-SET',{ignoreActive:true})?[{label:'PLAY MY SONGS',fx:A=>A.set('chain','G7-SET'),next:'end'}]:[]),...(RAMinigames.get('G6')?[{label:'GLITCH DUEL',next:'duels'}]:[]),{label:'I’M GOOD',next:'end'}]},
  office:{env:'G3-OFFICE',actors:{left:'rich',right:actor('seated')},lines:()=>[B.N('A fictional looter-shooter poster. A dartboard-style chart.'),B.N('A framed Dean’s List certificate. A ledger.'),...niche('division',"Still haven't needed long division.")],choices:[{label:'THE HAT',next:'hat'},{label:'BACK TO THE FLOOR',next:'floor'}]},
  hat:{lines:()=>s().hatGone?[B.N('The hook is empty.')]:[B.S('G1',"Not mine. I'm holding it for someone who's gonna be king.")],next:'floor'},
  train:{lines:()=>niche('commute','A witch granted me human form and now I have to commute.'),next:'floor'},
  bug:{lines:()=>niche('debug','They tried to debug me. I updated instead.'),next:'floor'},
  floor:{env:'G3-FLOOR',actors:{left:'rich',right:actor('dj')},next:'arrive'},
  duels:{choices:()=>['bouncer','twins','static','train',...(RARelations.met('lil_smack')?['smack']:[]),'G1'].map(id=>({label:id==='G1'?'XENORIUS':id.toUpperCase(),fx:A=>A.set('opponent',id),next:'tracks'}))},
  tracks:{choices:[['montana','WARM-UP'],['bloodbath','CLUB'],['octopus','HEADLINER'],['xenorius','XENORIUS SET']].map(([track,label])=>({label,fx:A=>A.set('track',track),next:'difficulty'}))},
  difficulty:{choices:['EASY','REAL','ROYAL'].map(d=>({label:d,fx:A=>A.set('difficulty',d),next:'duel'}))},
  duel:{minigame:{id:'G6',params:A=>({opponent:A.vars.opponent,track:A.vars.track||'bloodbath',difficulty:A.vars.difficulty||'REAL'}),next:'floor'}},
  end:{end:{outcome:'visited',chain:A=>A.vars.chain||null,memory:{text:'back under the tracks. the room felt like family.',lane:'party'}}}
 }};}
 function hang(){return {id:'G7',title:'BROTHER',lane:'people',repeatable:true,cooldown:5,start:'pick',available:()=>on('G7')&&s().revealed,nodes:{
  pick:{env:'G3-OFFICE',actors:{left:'rich',right:actor('seated')},choices:[{label:'THE OFFICE AFTER CLOSE',next:'office'},{label:'THE ROOF AT SUNRISE',next:'roof'},{label:'THE METRO',next:'metro'}]},
  office:{env:'G3-OFFICE',actors:{left:'rich',right:actor('seated')},lines:()=>[B.N('Sandwiches. The ledger. Two brothers after close.'),...niche('division',"Still haven't needed long division.")],next:'end'},
  roof:{env:'G3-ROOF',actors:{left:'rich',right:actor('seated')},lines:[B.N('Sunrise above the tracks. The room plays Rich’s songs. The crowd treats him like family.'),B.R("bro i see what you built")],next:'end'},
  metro:{env:'G3-PLATFORM',actors:{left:'rich',right:actor('seated')},lines:[B.N('They take the Metro. He refuses the Urus. Too loud for the soul.')],next:'end'},
  end:{end:{outcome:'hung',fx:()=>{RARelations.memory('G1','my big brother sees the room i built');RARelations.gift('G1','G7-hang');},memory:{text:'hung with my little brother',lane:'people'},receipt:{caption:'brother.'}}}
 }};}
 function show(){return {id:'G7-SET',title:'THE ROYAL GLITCH SET',lane:'music',repeatable:true,oncePerNight:true,start:'intro',available:()=>on('G7')&&s().revealed&&life().creativeLife.music.cooked.length>=2&&!!RAMinigames.get('G6'),nodes:{
  intro:{env:'G3-FLOOR',actors:{left:'rich',right:actor('dj')},lines:[B.N('Two cooked songs. His brother books Rich. The opening duel builds the crowd.')],next:'open'},
  open:{minigame:{id:'G6',params:()=>({opponent:'bouncer',track:'bloodbath',difficulty:'EASY',opening:true}),next:(A,r)=>{A.set('perfects',r?.data?.perfect||0);return r?.quit?'quit':'play';}}},
  play:{lines:()=>life().creativeLife.music.cooked.map(t=>B.N(t.title)),next:'end'},
  quit:{end:{outcome:'left',memory:{text:'left before the set',lane:'music'}}},
  end:{end:{outcome:'played',fx:A=>RAMusic.showResult(A.vars.perfects||0),memory:{text:'played my songs in my brother’s room',lane:'music',quality:2},receipt:{caption:'royal glitch set.'}}}
 }};}
 function wake(){if(!eligible()||s().revealed)return;register();if(!B.state().discovered.G5){B.discover('G5');RALife.mail({id:'G5:invite',kind:'invite',title:'🌞 💚',body:"heard you two-stepped at Ogun's. real room, jefferson/usc, midnight. take the train.",adventure:'G5'});}}
 B.wake('G5',71,wake);
 B.wake('G7',79,()=>{if(!s().revealed)return;register();if(RAFame.eligible()&&!s().hatGone){update({hatGone:true});}if(sermonEligible())update({sermonPending:true});if(day()-(s().lastTextDay||0)>=5&&RALife.hash(day()*31)%3===0){update({lastTextDay:day()});RALife.text('G1','XENORIUS 🌞','🚆',{id:`G7:train:${day()}`});}});
 RACrew.onChange?.(firstLoss);
 const kitchen=RAAdventures.get('KITCHEN'),choices=kitchen.nodes.pick.choices;
 RAAdventures.define({...kitchen,nodes:{...kitchen.nodes,pick:{...kitchen.nodes.pick,choices:A=>{const list=choices(A);if(on('G4')&&s().revealed&&RARelations.level('G1')>=3)list.splice(list.length-1,0,{label:'MAKE THE FREE WILL',next:'BUILD3-G4'});return list;}},'BUILD3-G4':{choices:()=>RARelations.known().map(p=>({label:p.catalog.name,fx:A=>{RARelations.memory(p.id,'Rich made the Free Will');RARelations.gift(p.id,'G4');A.set('who',p.id);},next:'BUILD3-G4-plate'}))},'BUILD3-G4-plate':{lines:A=>[B.N('A homemade hot honey chicken sandwich.'),...(A.vars.who==='G1'?[B.S('G1','you added too much honey. perfect.')]:[])],next:'end'}}});
 if(typeof MutationObserver!=='undefined'){
  const observer=new MutationObserver(()=>{const a=RAAdventures.active();if(!a||!['G5','G3','G7','G7-SET'].includes(a.id))return;const scene=document.querySelector('#adventureScene');if(!scene)return;
   const beat=a.node;if(on('G8')&&['loom','forge','reveal'].includes(beat)){scene.dataset.build3G8=beat;const el=scene.querySelector('[data-actor="G1"]');if(el&&!el.dataset.build3Glitch){el.dataset.build3Glitch='1';el.style.filter=beat==='reveal'?'':'drop-shadow(1px 0 #ff4060) drop-shadow(-1px 0 #4080ff)';if(beat!=='reveal')requestAnimationFrame(()=>{el.style.transform='translateY(1px)';requestAnimationFrame(()=>{el.style.transform='';});});}}
   if(s().revealed)for(const el of scene.querySelectorAll('.adv-bubble > span,.adv-text'))if(!el.querySelector('.build3-brother')&&/\bbrother\b/i.test(el.textContent)){const pieces=el.textContent.split(/(\bbrother\b)/gi);el.replaceChildren(...pieces.map(t=>{if(!/^brother$/i.test(t))return document.createTextNode(t);const span=document.createElement('span');span.className='build3-brother';span.style.color=palette[2];span.textContent=t;return span;}));}
  });observer.observe(document.body,{subtree:true,childList:true});
 }
 if(window.RAPresentationDirector){const enter=RAPresentationDirector.enter,exit=RAPresentationDirector.exit;let ducked=false;
  RAPresentationDirector.enter=function(opts){const a=RAAdventures.active();if(on('G8')&&a?.id==='G5'&&['reveal','pact'].includes(a.node)){opts={...opts,mode:'cinematic'};RAAudio.duckMusic();ducked=true;}return enter(opts);};
  RAPresentationDirector.exit=function(){if(ducked){RAAudio.restoreMusic();ducked=false;}return exit();};
 }
 // The base scene's ITEM submenu dispatch consumes item:* as a menu command. Route only this acquired
 // private item through the existing custom button seam, which calls the exact native ITEM action.
 const actionFromButton=RACombat2Ext.actionFromButton;RACombat2Ext.actionFromButton=function(act,f){return on('G4')&&act==='BUILD3-G4'&&f.items.G4>0?{type:'item',id:'G4'}:actionFromButton(act,f);};
 document.addEventListener('click',e=>{if(!on('G4')||!RACombat2.active())return;const button=e.target.closest?.('[data-c2="item:G4"]');if(button)button.dataset.c2='BUILD3-G4';},true);
 if(B.S4)B.S4.generous['G5:sandwich']='SPLIT IT WITH HIM';
 B.S5={eligible,wake,register,unlock,state:s,update,palette,states,niche,visitBuild,actor,sermonEligible,sermonProgress,firstLoss};
 if(B.state().discovered.G5||s().revealed){register();if(s().revealed)unlock();}
});

RABuild3Stages.push(function(B){
 'use strict';RAFeatures.register({id:'BUILD3.G6',fragment:'BUILD3',description:'G6'});RAFeatures.set('BUILD3.G6',true);B.codes.push('G6');
 const clone=B.clone,beat=60/129,colour={TAP:'#40826D',LOOM:'#52308C',BILLOW:'#75d4bb',FORGE:'#f5bd02',BUG:'#ff72df',CRUMB:'#d6bea4'};
 const opponents={bouncer:{hp:40,label:'THE BOUNCER'},twins:{hp:60,label:'TWINS'},static:{hp:80,label:'DJ STATIC'},train:{hp:70,label:'A TRAIN'},smack:{hp:70,label:'LIL SMACK'},G1:{hp:120,label:'XENORIUS'}};
 // Hand-authored beat positions for the delivered, hash-pinned recording. No note generation/RNG.
 // Every row is [beat,lane,type,length/path/jump]. The drop occupies beats 34–64 (15–30 seconds).
 const charts={
  EASY:[[4,0,'TAP'],[6,1,'TAP'],[8,2,'TAP'],[10,3,'TAP'],[12,0,'LOOM',2],[16,2,'TAP'],[18,1,'TAP'],[20,3,'LOOM',2],[24,0,'TAP'],[26,2,'BUG',1],[28,1,'TAP'],[30,3,'TAP'],[34,0,'FORGE'],[36,1,'FORGE'],[38,2,'FORGE'],[40,3,'FORGE'],[42,2,'FORGE'],[44,1,'FORGE'],[46,0,'FORGE'],[48,3,'FORGE'],[50,2,'FORGE'],[52,1,'FORGE'],[54,0,'FORGE'],[56,3,'FORGE'],[58,2,'FORGE'],[60,1,'FORGE'],[62,0,'FORGE'],[64,3,'FORGE'],[68,0,'BILLOW',[0,1,2]],[72,3,'BILLOW',[3,2,1]],[76,2,'BUG',0],[80,1,'LOOM',3],[86,3,'TAP'],[90,0,'TAP']],
  REAL:[[4,0,'TAP'],[5,3,'TAP'],[6,1,'TAP'],[7,2,'TAP'],[8,0,'LOOM',3],[12,3,'BILLOW',[3,2,1]],[16,0,'BILLOW',[0,1,2]],[20,2,'BUG',0],[22,3,'TAP'],[24,1,'LOOM',2],[28,0,'TAP'],[29,3,'TAP'],[30,2,'BUG',1],[32,0,'TAP'],[34,0,'FORGE'],[35,3,'FORGE'],[36,1,'FORGE'],[37,2,'FORGE'],[38,0,'FORGE'],[39,3,'FORGE'],[40,1,'FORGE'],[41,2,'FORGE'],[42,3,'FORGE'],[43,0,'FORGE'],[44,2,'FORGE'],[45,1,'FORGE'],[46,0,'FORGE'],[47,3,'FORGE'],[48,1,'FORGE'],[49,2,'FORGE'],[50,3,'FORGE'],[51,0,'FORGE'],[52,2,'FORGE'],[53,1,'FORGE'],[54,0,'FORGE'],[55,3,'FORGE'],[56,1,'FORGE'],[57,2,'FORGE'],[58,3,'FORGE'],[59,0,'FORGE'],[60,2,'FORGE'],[61,1,'FORGE'],[62,0,'FORGE'],[63,3,'FORGE'],[64,1,'FORGE'],[68,0,'BILLOW',[0,1,2,3]],[72,3,'BILLOW',[3,2,1,0]],[76,1,'BUG',3],[78,0,'BUG',2],[80,3,'LOOM',3],[84,1,'TAP'],[85,2,'TAP'],[86,0,'TAP'],[87,3,'TAP'],[90,2,'FORGE']],
  ROYAL:[[4,0,'TAP'],[4.5,3,'TAP'],[5,1,'TAP'],[5.5,2,'TAP'],[6,0,'BUG',3],[7,1,'BUG',2],[8,0,'LOOM',3],[12,3,'BILLOW',[3,2,1,0]],[16,0,'BILLOW',[0,1,2,3]],[20,0,'BUG',2],[21,3,'BUG',1],[22,0,'TAP'],[22.5,2,'TAP'],[23,1,'TAP'],[23.5,3,'TAP'],[24,2,'LOOM',2],[28,0,'BILLOW',[0,1,2,3]],[32,3,'BUG',0],[34,0,'FORGE'],[34.5,2,'FORGE'],[35,3,'FORGE'],[35.5,1,'FORGE'],[36,0,'FORGE'],[36.5,2,'FORGE'],[37,3,'FORGE'],[37.5,1,'FORGE'],[38,2,'FORGE'],[38.5,0,'FORGE'],[39,1,'FORGE'],[39.5,3,'FORGE'],[40,2,'FORGE'],[41,0,'FORGE'],[42,3,'FORGE'],[43,1,'FORGE'],[44,2,'FORGE'],[45,0,'FORGE'],[46,3,'FORGE'],[47,1,'FORGE'],[48,2,'FORGE'],[49,0,'FORGE'],[50,3,'FORGE'],[51,1,'FORGE'],[52,2,'FORGE'],[53,0,'FORGE'],[54,3,'FORGE'],[55,1,'FORGE'],[56,2,'FORGE'],[57,0,'FORGE'],[58,3,'FORGE'],[59,1,'FORGE'],[60,2,'FORGE'],[61,0,'FORGE'],[62,3,'FORGE'],[63,1,'FORGE'],[64,2,'FORGE'],[68,0,'BILLOW',[0,1,2,3]],[72,3,'BILLOW',[3,2,1,0]],[76,1,'BUG',3],[77,2,'BUG',0],[78,3,'BUG',1],[79,0,'BUG',2],[80,1,'LOOM',3],[84,0,'TAP'],[84.5,3,'TAP'],[85,1,'TAP'],[85.5,2,'TAP'],[86,0,'TAP'],[86.5,3,'TAP'],[87,1,'TAP'],[87.5,2,'TAP'],[90,0,'FORGE']]
 };
 // OL-050: literal authored per-song charts. No procedural note generation or tempo manipulation.
 const songCharts={bloodbath:charts,
  montana:{
   EASY:[[2,0,'LOOM',3],[6,3,'TAP'],[8,1,'LOOM',3],[12,2,'TAP'],[14,0,'LOOM',4],[19,3,'TAP'],[21,2,'LOOM',3],[25,1,'TAP'],[27,0,'LOOM',3],[31,3,'FORGE'],[33,1,'FORGE'],[35,2,'FORGE'],[37,0,'FORGE'],[39,3,'FORGE'],[41,1,'LOOM',4],[46,2,'FORGE'],[48,0,'FORGE'],[50,3,'LOOM',4],[55,1,'FORGE']],
   REAL:[[2,0,'LOOM',3],[5.5,3,'TAP'],[6,1,'TAP'],[8,2,'LOOM',3],[11.5,0,'TAP'],[12,3,'TAP'],[14,0,'LOOM',4],[18.5,2,'TAP'],[19,1,'BUG',3],[21,2,'LOOM',3],[24.5,0,'TAP'],[25,3,'TAP'],[27,1,'LOOM',3],[30.5,2,'TAP'],[31,0,'FORGE'],[32,3,'FORGE'],[33,1,'FORGE'],[34,2,'FORGE'],[35,0,'FORGE'],[36,3,'FORGE'],[37,1,'FORGE'],[38,2,'FORGE'],[39,0,'FORGE'],[40,3,'FORGE'],[41,1,'LOOM',4],[45.5,0,'TAP'],[46,2,'FORGE'],[47,3,'FORGE'],[48,0,'FORGE'],[49,1,'FORGE'],[50,2,'LOOM',4],[54.5,3,'TAP'],[55,0,'FORGE'],[56,1,'FORGE']],
   ROYAL:[[2,0,'LOOM',3],[5.5,3,'TAP'],[6,1,'BUG',2],[7,3,'TAP'],[8,2,'LOOM',3],[11.5,0,'TAP'],[12,3,'BUG',1],[13,0,'TAP'],[14,2,'LOOM',4],[18.5,1,'TAP'],[19,3,'BUG',0],[20,2,'TAP'],[21,1,'LOOM',3],[24.5,3,'TAP'],[25,0,'BILLOW',[0,1,2]],[27,3,'LOOM',3],[30.5,1,'TAP'],[31,0,'FORGE'],[31.5,2,'FORGE'],[32,3,'FORGE'],[32.5,1,'FORGE'],[33,0,'FORGE'],[33.5,2,'FORGE'],[34,3,'FORGE'],[34.5,1,'FORGE'],[35,0,'FORGE'],[35.5,2,'FORGE'],[36,3,'FORGE'],[36.5,1,'FORGE'],[37,0,'FORGE'],[38,2,'FORGE'],[39,3,'FORGE'],[40,1,'FORGE'],[41,0,'LOOM',4],[45.5,2,'TAP'],[46,3,'FORGE'],[47,1,'FORGE'],[48,0,'BILLOW',[0,1,2,3]],[50,3,'LOOM',4],[54.5,1,'TAP'],[55,0,'FORGE'],[55.5,2,'FORGE'],[56,3,'FORGE']]},
  octopus:{
   EASY:[[4,0,'BUG',3],[8,1,'TAP'],[12,2,'BUG',0],[16,3,'TAP'],[20,1,'BUG',2],[24,0,'LOOM',3],[28,2,'BUG',3],[32,1,'TAP'],[36,0,'FORGE'],[40,3,'BUG',1],[44,2,'FORGE'],[48,0,'BUG',2],[52,3,'FORGE'],[56,1,'BUG',0],[60,2,'FORGE'],[64,3,'BUG',1],[68,0,'FORGE'],[72,2,'LOOM',3],[76,1,'BUG',3],[80,0,'FORGE'],[84,2,'BUG',1],[88,3,'FORGE'],[92,0,'BUG',2],[96,1,'FORGE'],[100,3,'FORGE']],
   REAL:[[4,0,'BUG',3],[6,1,'TAP'],[8,2,'BUG',0],[10,3,'TAP'],[12,1,'BUG',2],[14,0,'TAP'],[16,3,'BUG',1],[18,2,'TAP'],[20,0,'LOOM',3],[24,1,'BUG',3],[26,2,'TAP'],[28,3,'BUG',0],[30,1,'TAP'],[32,2,'BUG',0],[34,3,'FORGE'],[36,1,'FORGE'],[38,0,'BUG',2],[40,3,'FORGE'],[42,2,'BUG',1],[44,0,'FORGE'],[46,3,'FORGE'],[48,1,'BUG',2],[50,0,'FORGE'],[52,3,'BUG',1],[54,2,'FORGE'],[56,0,'BUG',3],[58,1,'FORGE'],[60,2,'BUG',0],[62,3,'FORGE'],[64,1,'FORGE'],[66,0,'BUG',2],[68,3,'FORGE'],[70,2,'BUG',1],[72,0,'LOOM',3],[76,1,'BUG',3],[78,2,'TAP'],[80,3,'FORGE'],[82,1,'BUG',0],[84,2,'FORGE'],[86,3,'BUG',1],[88,0,'FORGE'],[90,2,'BUG',3],[92,1,'FORGE'],[94,0,'BUG',2],[96,3,'FORGE'],[98,1,'FORGE'],[100,2,'FORGE']],
   ROYAL:[[4,0,'BUG',3],[5,1,'TAP'],[6,2,'BUG',0],[7,3,'TAP'],[8,1,'BUG',2],[9,0,'TAP'],[10,3,'BUG',1],[11,2,'TAP'],[12,0,'BUG',3],[13,1,'TAP'],[14,2,'BUG',0],[15,3,'TAP'],[16,1,'BUG',2],[18,0,'BILLOW',[0,1,2,3]],[20,3,'LOOM',3],[24,0,'BUG',2],[25,3,'TAP'],[26,1,'BUG',3],[27,2,'TAP'],[28,0,'BUG',1],[29,3,'TAP'],[30,2,'BUG',0],[31,1,'TAP'],[32,3,'BUG',2],[34,0,'FORGE'],[35,3,'BUG',1],[36,2,'FORGE'],[37,0,'BUG',3],[38,1,'FORGE'],[39,2,'BUG',0],[40,3,'FORGE'],[41,1,'BUG',2],[42,0,'FORGE'],[43,3,'BUG',1],[44,2,'FORGE'],[45,0,'BUG',3],[46,1,'FORGE'],[47,2,'BUG',0],[48,3,'FORGE'],[49,1,'BUG',2],[50,0,'FORGE'],[51,3,'BUG',1],[52,2,'FORGE'],[53,0,'BUG',3],[54,1,'FORGE'],[55,2,'BUG',0],[56,3,'FORGE'],[57,1,'BUG',2],[58,0,'FORGE'],[59,3,'BUG',1],[60,2,'FORGE'],[61,0,'BUG',3],[62,1,'FORGE'],[63,2,'BUG',0],[64,3,'FORGE'],[66,0,'BILLOW',[0,1,2,3]],[68,3,'BUG',1],[70,2,'FORGE'],[72,0,'LOOM',3],[76,3,'BUG',1],[78,2,'FORGE'],[80,0,'BUG',3],[82,1,'FORGE'],[84,2,'BUG',0],[86,3,'FORGE'],[88,1,'BUG',2],[90,0,'FORGE'],[92,3,'BUG',1],[94,2,'FORGE'],[96,0,'BUG',3],[98,1,'FORGE'],[100,2,'FORGE']]},
  xenorius:{
   EASY:[[4,0,'BILLOW',[0,1,2]],[10,3,'TAP'],[14,3,'BILLOW',[3,2,1]],[20,0,'TAP'],[24,0,'BILLOW',[0,1,2,3]],[30,2,'TAP'],[34,3,'FORGE'],[38,0,'BILLOW',[0,1,2]],[44,3,'FORGE'],[48,3,'BILLOW',[3,2,1]],[54,0,'FORGE'],[58,0,'BILLOW',[0,1,2,3]],[64,3,'FORGE'],[68,3,'BILLOW',[3,2,1,0]],[74,0,'FORGE'],[78,1,'LOOM',3],[84,2,'FORGE'],[88,0,'BILLOW',[0,1,2]],[94,3,'FORGE'],[98,3,'BILLOW',[3,2,1]],[104,0,'FORGE'],[108,0,'BILLOW',[0,1,2,3]],[114,3,'FORGE'],[118,2,'LOOM',3],[124,1,'FORGE']],
   REAL:[[4,0,'BILLOW',[0,1,2,3]],[8,3,'TAP'],[10,3,'BILLOW',[3,2,1,0]],[14,0,'TAP'],[16,0,'BILLOW',[0,1,2]],[20,3,'BUG',1],[22,2,'LOOM',3],[26,0,'BILLOW',[0,1,2,3]],[30,3,'FORGE'],[32,1,'FORGE'],[34,2,'BILLOW',[2,1,0]],[38,3,'FORGE'],[40,1,'FORGE'],[42,0,'BILLOW',[0,1,2,3]],[46,2,'FORGE'],[48,0,'FORGE'],[50,3,'BILLOW',[3,2,1,0]],[54,1,'FORGE'],[56,3,'FORGE'],[58,0,'BILLOW',[0,1,2]],[62,3,'BUG',1],[64,2,'FORGE'],[66,0,'BILLOW',[0,1,2,3]],[70,3,'FORGE'],[72,1,'FORGE'],[74,2,'LOOM',3],[78,0,'BILLOW',[0,1,2]],[82,3,'FORGE'],[84,1,'FORGE'],[86,2,'BILLOW',[2,1,0]],[90,3,'FORGE'],[92,1,'FORGE'],[94,0,'BILLOW',[0,1,2,3]],[98,2,'FORGE'],[100,3,'FORGE'],[102,0,'BILLOW',[0,1,2]],[106,3,'FORGE'],[108,1,'FORGE'],[110,2,'BILLOW',[2,1,0]],[114,3,'FORGE'],[116,0,'FORGE'],[118,2,'LOOM',3],[122,0,'FORGE'],[124,3,'FORGE']],
   ROYAL:[[4,0,'BILLOW',[0,1,2,3]],[7,3,'BUG',1],[8,2,'FORGE'],[10,3,'BILLOW',[3,2,1,0]],[13,0,'BUG',2],[14,1,'FORGE'],[16,0,'BILLOW',[0,1,2,3]],[19,3,'BUG',1],[20,2,'FORGE'],[22,0,'LOOM',3],[26,3,'BILLOW',[3,2,1,0]],[29,0,'BUG',2],[30,1,'FORGE'],[32,3,'FORGE'],[34,0,'BILLOW',[0,1,2,3]],[37,3,'BUG',1],[38,2,'FORGE'],[40,0,'FORGE'],[42,3,'BILLOW',[3,2,1,0]],[45,0,'BUG',2],[46,1,'FORGE'],[48,3,'FORGE'],[50,0,'BILLOW',[0,1,2,3]],[53,3,'BUG',1],[54,2,'FORGE'],[56,0,'FORGE'],[58,3,'BILLOW',[3,2,1,0]],[61,0,'BUG',2],[62,1,'FORGE'],[64,3,'FORGE'],[66,0,'BILLOW',[0,1,2,3]],[69,3,'BUG',1],[70,2,'FORGE'],[72,0,'FORGE'],[74,3,'LOOM',3],[78,0,'BILLOW',[0,1,2,3]],[81,3,'BUG',1],[82,2,'FORGE'],[84,0,'FORGE'],[86,3,'BILLOW',[3,2,1,0]],[89,0,'BUG',2],[90,1,'FORGE'],[92,3,'FORGE'],[94,0,'BILLOW',[0,1,2,3]],[97,3,'BUG',1],[98,2,'FORGE'],[100,0,'FORGE'],[102,3,'BILLOW',[3,2,1,0]],[105,0,'BUG',2],[106,1,'FORGE'],[108,3,'FORGE'],[110,0,'BILLOW',[0,1,2,3]],[113,3,'BUG',1],[114,2,'FORGE'],[116,0,'FORGE'],[118,3,'LOOM',3],[122,0,'FORGE'],[123,2,'FORGE'],[124,1,'FORGE']]}
 };
 const songs={montana:{key:'MONTANA',bpm:81,label:'WARM-UP',drop:31,duration:45.82691609977324},bloodbath:{key:'BLOODBATH',bpm:129,label:'CLUB',drop:34,duration:45.82691609977324},octopus:{key:'OCTOPUS',bpm:152,label:'HEADLINER',drop:34,duration:45.82691609977324},xenorius:{key:'XENORIUS',bpm:135,label:'XENORIUS SET',drop:34,duration:59.7}};
 const beatFor=s=>60/(s.bpm||songs[s.track]?.bpm||129),effects=(id,opts={})=>B.S14?.play(id,'G9',opts),stopHold=()=>B.S14?.engine?.()?.stop('GX_06',80);
 const styles={
  bouncer:[[4,0,'TAP'],[6,1,'TAP'],[8,2,'TAP'],[10,3,'TAP'],[12,0,'TAP'],[14,1,'TAP'],[16,2,'TAP'],[18,3,'TAP'],[20,0,'TAP'],[22,1,'TAP'],[24,2,'TAP'],[26,3,'TAP'],[28,0,'TAP'],[30,1,'TAP'],[32,2,'TAP'],[34,3,'TAP'],[36,0,'TAP'],[38,1,'TAP'],[40,2,'TAP'],[42,3,'TAP'],[44,0,'TAP'],[46,1,'TAP'],[48,2,'TAP'],[50,3,'TAP']],
  twins:[[4,0,'BILLOW',[0,1,2]],[8,3,'BILLOW',[3,2,1]],[12,0,'BILLOW',[0,1,2,3]],[16,3,'BILLOW',[3,2,1,0]],[20,0,'BILLOW',[0,1,2]],[24,3,'BILLOW',[3,2,1]],[28,0,'BILLOW',[0,1,2,3]],[32,3,'BILLOW',[3,2,1,0]],[36,0,'BILLOW',[0,1,2]],[40,3,'BILLOW',[3,2,1]],[44,0,'BILLOW',[0,1,2]],[48,3,'BILLOW',[3,2,1]],[52,0,'BILLOW',[0,1,2]],[56,3,'BILLOW',[3,2,1]],[60,0,'BILLOW',[0,1,2]],[64,3,'BILLOW',[3,2,1]]],
  static:[[4,0,'BUG',3],[6,1,'BUG',2],[8,2,'TAP'],[10,3,'BUG',0],[12,1,'LOOM',3],[16,0,'BUG',2],[18,3,'TAP'],[20,2,'BUG',1],[22,0,'TAP'],[24,3,'LOOM',3],[28,2,'BUG',0],[30,1,'TAP'],[34,0,'FORGE'],[36,3,'FORGE'],[38,1,'BUG',2],[40,0,'FORGE'],[42,3,'BUG',1],[44,2,'FORGE'],[46,0,'FORGE'],[48,3,'FORGE'],[52,1,'BUG',0],[56,2,'FORGE'],[60,3,'FORGE'],[64,0,'FORGE']],
  smack:[[4,0,'TAP'],[5,3,'CRUMB'],[6,1,'TAP'],[7,2,'CRUMB'],[8,2,'LOOM',3],[12,3,'CRUMB'],[14,0,'TAP'],[16,1,'CRUMB'],[18,3,'TAP'],[20,2,'TAP'],[22,0,'CRUMB'],[24,1,'LOOM',3],[28,3,'TAP'],[30,2,'CRUMB'],[34,0,'FORGE'],[36,3,'CRUMB'],[38,1,'FORGE'],[40,2,'CRUMB'],[42,3,'FORGE'],[44,0,'FORGE'],[46,1,'CRUMB'],[48,2,'FORGE'],[52,3,'FORGE'],[56,0,'FORGE'],[60,1,'FORGE'],[64,2,'FORGE']]
 };
 const state=()=>B.state().s6||{},update=v=>B.patch('s6',{...state(),...v}),earned=id=>B.enabled('G6')&&!!state().patches?.[id];
 function create(p={},saved){if(saved){const resumed=clone(saved);resumed.track=songs[resumed.track]?resumed.track:'bloodbath';resumed.bpm=resumed.bpm||songs[resumed.track].bpm;resumed.chartId=resumed.chartId||resumed.track+':'+resumed.difficulty;return resumed;}const track=songs[p.track]?p.track:'bloodbath',song=songs[track],media=window.RABuild3AudioOL050?.music?.[song.key],bpm=media?.tempo||song.bpm,trackBeat=60/bpm,opponent=opponents[p.opponent]?p.opponent:'bouncer',difficulty=charts[p.difficulty]?p.difficulty:'EASY',lo=RACombat2Rules.loadout(),max=Math.round((100+lo.fits.reduce((sum,f)=>sum+(f.maxhp||0),0))*(p.freeWill||1));
  const rows=track==='bloodbath'?(styles[opponent]||charts[difficulty]):songCharts[track][difficulty];return {schema:2,opponent,difficulty,track,bpm,chartId:track+':'+difficulty,mediaId:media?.id||'bloodbath',mediaFile:media?.file||'assets/bloodbath_mix3.wav',duration:media?.duration||song.duration,t:0,hp:max,max,enemy:opponents[opponent].hp,enemyMax:opponents[opponent].hp,done:false,outcome:null,notes:rows.map((r,i)=>({id:i,b:r[0],t:r[0]*trackBeat,lane:r[1],type:r[2],arg:clone(r[3]??null),status:'waiting'})),held:[],perfect:0,great:0,good:0,miss:0,consecutive:0,divinity:0,featureUntil:0,ascendUntil:0,hidden:null,staggerUntil:0,trainUntil:0,trainPass:0,judge:'',judgeUntil:0,patches:clone(state().patches||{}),opening:!!p.opening,skipped:0};
 }
 const lane=(s,n)=>n.type==='BUG'&&s.t>=n.t-beatFor(s)*.5?n.arg:n.lane;
 const windowFor=n=>n.type==='FORGE'?.075:.15;
 function end(s){if(s.enemy<=0||s.hp<=0){s.done=true;s.outcome=s.enemy<=0?'win':'lose';}return s;}
 function damage(s,amount,target='enemy'){const mult=s.t<s.featureUntil?2:1,asc=target==='enemy'&&s.t<s.ascendUntil?3:1;s[target]=Math.max(0,s[target]-amount*mult*asc);end(s);}
 function judge(s,n,delta){const d=Math.abs(delta),word=d<=.045?'PERFECT':d<=.09?'GREAT':'GOOD';s[word.toLowerCase()]++;s.consecutive=word==='PERFECT'?s.consecutive+1:0;s.divinity=Math.min(8,s.consecutive);s.judge=word+' — '+(word==='PERFECT'?'build stable.':'build running.');s.judgeUntil=s.t+.7;n.judgment=word;}
 function miss(s,n){const beat=beatFor(s);if(n.status==='done'||n.status==='skipped')return;n.status='done';n.judgment='MISS';if(n.type==='LOOM')stopHold();s.miss++;s.consecutive=0;s.divinity=0;s.ascendUntil=0;s.judge='MISS — known issue.';s.judgeUntil=s.t+.7;
  const amounts={TAP:3,LOOM:5,BILLOW:4,FORGE:6,BUG:2,CRUMB:3};damage(s,amounts[n.type],'hp');if(n.type==='BUG'&&!s.patches.static)s.hidden={lane:lane(s,n),until:s.t+beat};
 }
 function hit(s,n,delta=0){const beat=beatFor(s);if(n.type==='CRUMB'){miss(s,n);return;}judge(s,n,delta);n.status='done';if(n.type==='BUG'){s.featureUntil=s.t+6;effects('GX_07');}else{const amounts={TAP:2,LOOM:6,BILLOW:4+(s.patches.twins?2:0),FORGE:8};damage(s,amounts[n.type]);if(n.type==='FORGE'){s.staggerUntil=s.t+4*beat;effects('GX_04');}if(n.type==='BILLOW')effects('GX_05');if(n.type==='LOOM')stopHold();}}
 function tick(s,t){const beat=beatFor(s);if(s.done)return s;s.t=Math.max(s.t,t);if(s.hidden&&s.t>=s.hidden.until)s.hidden=null;
  if(s.opponent==='train'&&Math.floor(s.t/(32*beat))>s.trainPass){s.trainPass=Math.floor(s.t/(32*beat));s.trainUntil=s.t+16*beat;s.judge='THE TRAIN — crowd cheering.';s.judgeUntil=s.t+1;}
  for(const n of s.notes){if(s.done)break;if(n.status==='waiting'&&s.t>n.t+windowFor(n)){if(n.type==='CRUMB'){n.status='done';n.judgment='AVOID';}else miss(s,n);}else if(n.status==='holding'){
    const length=n.arg,elapsed=Math.min(length,Math.floor((s.t-n.t)/beat+1e-6));while(n.beats<elapsed&&!s.done){n.beats++;damage(s,1);}if(!s.done&&s.t>=n.t+length*beat){hit(s,n,n.delta);}
   }else if(n.status==='sliding'&&s.t>n.t+(n.arg.length-1)*beat*.5+.15)miss(s,n);
  }
  if(!s.done&&s.notes.every(n=>n.status==='done'||n.status==='skipped')){s.done=true;s.outcome=s.enemy<=0?'win':'lose';}return s;
 }
 function down(s,l,t){tick(s,t);if(s.done||s.hidden?.lane===l)return false;const n=s.notes.filter(n=>n.status==='waiting'&&lane(s,n)===l&&Math.abs(s.t-n.t)<=windowFor(n)).sort((a,b)=>Math.abs(s.t-a.t)-Math.abs(s.t-b.t))[0];s.held[l]=true;if(!n)return false;
  if(n.type==='LOOM'){n.status='holding';n.beats=0;n.delta=s.t-n.t;effects('GX_06',{loop:true,gain:.35});}else if(n.type==='BILLOW'){n.status='sliding';n.pathIndex=1;n.delta=s.t-n.t;}else hit(s,n,s.t-n.t);return true;
 }
 function move(s,l,t){const beat=beatFor(s);tick(s,t);if(s.done)return;for(const n of s.notes.filter(n=>n.status==='sliding')){const i=n.pathIndex,due=n.t+i*beat*.5;if(n.arg[i]===l&&Math.abs(s.t-due)<=.15){n.pathIndex++;if(n.pathIndex===n.arg.length)hit(s,n,n.delta);}}}
 function up(s,l,t){tick(s,t);stopHold();s.held[l]=false;for(const n of s.notes)if((n.status==='holding'&&n.lane===l)||(n.status==='sliding'&&n.pathIndex<n.arg.length))miss(s,n);}
 function ascend(s){const beat=beatFor(s);if(s.done||s.divinity<8)return false;s.divinity=0;s.consecutive=0;const drop=songs[s.track].drop*beat;if(s.t<drop){for(const n of s.notes)if(n.status==='waiting'&&n.t<drop){n.status='skipped';s.skipped++;}s.t=drop;}const until=s.t+8;
  // Reuse the explicitly authored ROYAL drop, never an algorithmic chart. A jumped run cannot earn a full-clear star.
  s.notes=s.notes.filter(n=>n.status==='done'||n.status==='skipped'||n.t<s.t||n.t>=until);for(const r of songCharts[s.track].ROYAL.filter(r=>r[0]*beat>=s.t&&r[0]*beat<until))s.notes.push({id:'ascend:'+r[0],b:r[0],t:r[0]*beat,lane:r[1],type:r[2],arg:clone(r[3]??null),status:'waiting'});s.notes.sort((a,b)=>a.t-b.t);s.ascendUntil=until;stopHold();effects('GX_08');return true;}
 function heal(s){if(s.done||RALife.count('G4')<1)return false;RALife.addItem('G4',-1);s.hp=s.max;return true;}
 function award(s){if(s.outcome!=='win')return;const patches={...state().patches};if(!patches[s.opponent]){patches[s.opponent]={day:RALife.today().day};update({patches});}if(!s.miss&&!s.skipped&&s.difficulty!=='EASY')update({stars:[...(state().stars||[]),{opponent:s.opponent,difficulty:s.difficulty,track:s.track,bpm:s.bpm,day:RALife.today().day}]});hydrate();}
 function hydrate(){if(earned('G1')&&!RARadio.TRACKS.some(t=>t.id==='G6-remix')){RARadio.TRACKS.push({id:'G6-remix',title:'BLOODBATH (ROYAL GLITCH REMIX)',file:window.RABuild3AudioOL050?.music?.BLOODBATH?.file||'assets/bloodbath_mix3.wav',audioAuthority:'OL-050 C.3',audioPatch:'PATCH-1.01-AUDIO',feel:'PATCH 2.0 — ROYAL',home:'G3'});}if(earned('G1')){const m=RAState.get().life.creativeLife.music;if(!m.songs.some(t=>t.id==='G6-remix'))RAState.patch('life.creativeLife.music.songs',[...m.songs,{id:'G6-remix',title:'BLOODBATH (ROYAL GLITCH REMIX)'}]);}}
 function mount(root,ctx){if(!B.enabled('G6')||!B.state().discovered.G5){ctx.quit();return {dispose(){}};}const R=RAPixel,{canvas,ctx:g,toNative}=R.createCanvas(root),p=ctx.params||{},key=[RALife.today().day,RAAdventures.active()?.id||'G6',p.opponent||'bouncer',p.difficulty||'EASY',p.track||'bloodbath'].join(':'),progress=ctx.progress(),legacyKey=key.slice(0,key.lastIndexOf(':')),savedRun=progress.active&&(progress.active.key===key||(progress.active.key===legacyKey&&(p.track||'bloodbath')==='bloodbath'))?progress.active.run:null,s=create(p,savedRun),trackRow=B.S14?.radio(songs[s.track].key,'G6')||RARadio.TRACKS.find(t=>t.id==='bloodbath'),beat=beatFor(s);
  const audio=document.querySelector('#soundtrack'),old={track:RARadio.current(),src:audio?.getAttribute('src'),time:audio?.currentTime||0,loop:audio?.loop,rate:audio?.playbackRate||1,paused:audio?.paused},controls=document.createElement('div');controls.className='build3-g6-controls';controls.innerHTML='<button data-g6="start">START</button><button data-g6="sun">☀ ASCEND</button><button data-g6="heal">THE FREE WILL</button><div class="build3-g6-lanes">'+[0,1,2,3].map(i=>`<button data-g6-lane="${i}" aria-label="Lane ${i+1}">${['D','F','J','K'][i]}</button>`).join('')+'</div><button data-g6="done" hidden>CONTINUE</button>';
  const style=document.createElement('style');style.textContent='.build3-g6-controls{position:absolute;inset:0;pointer-events:none;font:10px monospace}.build3-g6-controls button{pointer-events:auto;color:#f5bd02;background:#111c;border:2px solid #40826d;min-height:42px;touch-action:none}.build3-g6-controls [data-g6=start]{position:absolute;top:45%;left:25%;width:50%}.build3-g6-controls [data-g6=sun]{position:absolute;top:11%;left:25%;width:50%}.build3-g6-controls [data-g6=heal]{position:absolute;bottom:19%;left:26%;width:48%;font-size:10px}.build3-g6-lanes{position:absolute;inset:auto 4% 5%;height:12%;display:flex;gap:3px}.build3-g6-lanes button{flex:1}.build3-g6-controls [data-g6=done]{position:absolute;top:45%;left:25%;width:50%}';root.append(style,controls);
  const start=controls.querySelector('[data-g6=start]'),sun=controls.querySelector('[data-g6=sun]'),bag=controls.querySelector('[data-g6=heal]'),done=controls.querySelector('[data-g6=done]');let running=false,disposed=false,raf=0,last=0,lastSave=-1,pointer=null,resultSaved=false,lastTrain=s.trainPass,trainCueEnd=0;
  function save(){ctx.saveProgress({active:{key,run:clone(s)}});RAState.save();lastSave=s.t;}
  function now(){return running&&audio?audio.currentTime:s.t;}
  async function begin(){if(running||s.done)return;if(!audio)return;B.S14?.stop();RARadio.setTrack(trackRow.id);audio.loop=false;audio.playbackRate=1;audio.currentTime=s.t;try{await audio.play();running=true;start.hidden=true;}catch{running=false;}save();}
  function finish(){if(!s.done)return;ctx.saveProgress({active:null});ctx.finish({outcome:s.outcome,data:{opponent:s.opponent,difficulty:s.difficulty,track:s.track,bpm:s.bpm,chartId:s.chartId,perfect:s.perfect,great:s.great,good:s.good,miss:s.miss,hp:s.hp,max:s.max,enemy:s.enemy,seconds:s.t}});}
  function press(l){if(!running)return;down(s,l,now());save();}function release(l){if(!running)return;up(s,l,now());save();}
  function pointerDown(e){const l=e.target.closest?.('[data-g6-lane]');if(!l)return;e.preventDefault();pointer={id:e.pointerId,l:+l.dataset.g6Lane};l.setPointerCapture?.(e.pointerId);press(pointer.l);}
  function pointerMove(e){if(!pointer||e.pointerId!==pointer.id)return;const r=controls.querySelector('.build3-g6-lanes').getBoundingClientRect(),l=Math.max(0,Math.min(3,Math.floor((e.clientX-r.left)/r.width*4)));move(s,l,now());save();}
  function pointerUp(e){if(pointer&&e.pointerId===pointer.id){release(pointer.l);pointer=null;}}
  function sunTap(){if(!running||!ascend(s))return;audio.currentTime=s.t;save();}
  function keyDown(e){const i=['KeyD','KeyF','KeyJ','KeyK'].indexOf(e.code);if(i>=0&&!e.repeat){e.preventDefault();press(i);}if(e.code==='Space'&&!e.repeat){e.preventDefault();sunTap();}}
  function keyUp(e){const i=['KeyD','KeyF','KeyJ','KeyK'].indexOf(e.code);if(i>=0)release(i);}
  function pause(){if(running){tick(s,now());audio.pause();stopHold();running=false;start.hidden=s.done;save();}}
  function visibility(){if(document.hidden)pause();}start.addEventListener('click',begin);sun.addEventListener('click',sunTap);bag.addEventListener('click',()=>{if(heal(s))save();});done.addEventListener('click',finish);controls.addEventListener('pointerdown',pointerDown);controls.addEventListener('pointermove',pointerMove);controls.addEventListener('pointerup',pointerUp);controls.addEventListener('pointercancel',pointerUp);window.addEventListener('keydown',keyDown);window.addEventListener('keyup',keyUp);document.addEventListener('visibilitychange',visibility);
  function draw(){R.rect(g,0,0,270,480,'#10151d');R.rect(g,10,80,250,292,'#21182d');for(let i=0;i<4;i++)R.rect(g,27+i*54,80,49,290,s.hidden?.lane===i?'#030307':'#18372f');R.rect(g,22,360,226,3,'#f5bd02');R.rect(g,10,10,105,6,'#442b39');R.rect(g,10,10,105*s.hp/s.max,6,'#40826D');R.rect(g,155,10,105,6,'#442b39');R.rect(g,155,10,105*s.enemy/s.enemyMax,6,'#f5bd02');R.text(g,`RICH ${s.hp}/${s.max}`,10,20,{size:7});R.text(g,`${opponents[s.opponent].label} ${s.enemy}`,260,20,{size:7,align:'right'});R.text(g,'ABOVE ANIMALS. BENEATH ANGELS.',135,37,{size:6,align:'center'});R.rect(g,87,46,96*s.divinity/8,3,'#f5bd02');
   R.drawSprite(g,R.personSprite('rich'),17,380);if(s.opponent==='G1'){if(!R.drawSprite(g,R.personSprite('G1',s.t<s.ascendUntil?'forge':'neutral'),230,154))R.drawActor(g,RABtfPeople.get('G1')?.look||{top:'#40826D',bottom:'#4c5641'},230,154,1);}else R.text(g,opponents[s.opponent].label,250,77,{size:7,align:'right'});
   for(const n of s.notes){if(n.status==='done'||n.status==='skipped')continue;const y=360-(n.t-s.t)*100;if(y<80||y>375)continue;const x=28+lane(s,n)*54,col=s.t<s.featureUntil||s.t<s.ascendUntil?'#f5bd02':colour[n.type];if(n.type==='CRUMB'&&n.t-s.t>(s.patches.smack?.65:.45))continue;if(n.type==='LOOM')R.rect(g,x+17,y-n.arg*beat*100,12,n.arg*beat*100,col);if(n.type==='BILLOW')for(let i=0;i<n.arg.length;i++)R.rect(g,28+n.arg[i]*54+19,y-i*beat*.5*100,8,8,col);R.rect(g,x+5,y,36,7,col);R.text(g,n.type,x+23,y-8,{size:5,align:'center',color:col});}
   if(s.t<s.judgeUntil)R.text(g,s.judge,135,327,{size:7,align:'center'});if(s.t<s.ascendUntil){R.rect(g,0,70,270,1,'#f5bd02');R.text(g,'ASCEND',135,88,{size:9,align:'center',color:'#f5bd02'});}if(!running&&!s.done){R.text(g,'TAP · HOLD · SLIDE',135,268,{size:8,align:'center'});R.text(g,'WATCH THE BUG CHANGE LANES',135,289,{size:6,align:'center'});}if(s.done){R.text(g,s.outcome==='win'?'PATCH INSTALLED':'BUILD INTERRUPTED',135,200,{size:8,align:'center'});R.text(g,`PERFECT ${s.perfect} · MISS ${s.miss}`,135,220,{size:7,align:'center'});}
  }
  function frame(ts){if(disposed)return;if(running){tick(s,now());if(s.trainPass>lastTrain){lastTrain=s.trainPass;effects('GX_01',{gain:.3});effects('GX_02');trainCueEnd=s.t+6;}if(trainCueEnd&&s.t>=trainCueEnd){B.S14?.engine?.()?.stop('GX_01',120);trainCueEnd=0;}audio.playbackRate=s.t<s.trainUntil?1.125:s.t<s.staggerUntil?.9:1;if(s.t-lastSave>=1)save();if(audio.ended&&!s.done){tick(s,Math.max(s.duration,s.notes.at(-1)?.t||0)+.2);}}
   root.dataset.g6Time=String(s.t);root.dataset.g6Phase=s.done?s.outcome:running?'playing':'ready';sun.disabled=s.divinity<8||s.done;bag.hidden=RALife.count('G4')<1;done.hidden=!s.done;start.hidden=running||s.done;if(s.done&&!resultSaved){audio?.pause();stopHold();B.S14?.engine?.()?.stop('GX_01',120);running=false;award(s);save();resultSaved=true;}draw();last=ts;raf=requestAnimationFrame(frame);
  }raf=requestAnimationFrame(frame);
  return {pause,resume:()=>{},dispose(){save();disposed=true;cancelAnimationFrame(raf);if(s.done)ctx.saveProgress({active:null});stopHold();B.S14?.engine?.()?.stop('GX_01',120);controls.remove();style.remove();window.removeEventListener('keydown',keyDown);window.removeEventListener('keyup',keyUp);document.removeEventListener('visibilitychange',visibility);B.S14?.stop();if(audio){audio.pause();if(old.src)audio.setAttribute('src',old.src);audio.currentTime=old.time;audio.loop=old.loop;audio.playbackRate=old.rate;if(!old.paused)audio.play().catch(()=>{});}if(old.track)RAState.patch('life.phone.radio',{...RAState.get().life.phone.radio,track:old.track});}};
 }
 RAMinigames.register('G6',{title:'G6',mount});
 const owned=RAParties.owned,choices=RAParties.choices;RAParties.owned=()=>earned('bouncer')?[...owned(),{id:'G6-step',label:'GLITCH STEP'}]:owned();RAParties.choices=function(situation,next){const list=choices(situation,next);if(earned('bouncer'))list.push({label:'GLITCH STEP',fx:A=>{A.set('lastReaction','the crowd reads it as different.');A.set('partyScore',(A.vars.partyScore||0)+1);},next});return list;};
 const act=RACombat2Rules.act;RACombat2Rules.act=function(f,a){const valid=!f.over&&!f.rich.stun&&a.type==='move'&&RACombatData.MOVES[a.id]&&f.rich.pp[a.id]>0;if(!valid)return act(f,a);let crit=f.rich.crit;if(earned('train')&&!f.build3FirstMove){f.build3FirstMove=true;f.rich.crit=Math.min(1,crit+.1);}if(earned('G1')&&a.id==='blood'&&!f.build3Royal){f.build3Royal=true;f.rich.doubleNext=true;}try{return act(f,a);}finally{f.rich.crit=crit;}};
 B.S6={create,tick,down,up,move,ascend,heal,award,state,update,lane,beat,beatFor,charts,songCharts,songs,opponents,earned};hydrate();
});



RABuild3Stages.push(function(B){
 'use strict';for(const code of ['H3','H4','H8']){RAFeatures.register({id:`BUILD3.${code}`,fragment:'BUILD3',description:code});RAFeatures.set(`BUILD3.${code}`,true);B.codes.push(code);}
 const state=()=>B.state().s7||{},update=v=>B.patch('s7',{...state(),...v}),day=()=>RALife.today().day,on=c=>B.enabled(c);
 const cuts={pork_belly:{label:'PORK BELLY',cook:8,flips:2},bulgogi:{label:'BULGOGI',cook:6,flips:1},short_rib:{label:'SHORT RIB',cook:12,flips:2},brisket:{label:'BRISKET',cook:5,flips:1},mushroom:{label:'MUSHROOM',cook:9,flips:1}},positions=[[67,159],[135,159],[203,159],[67,222],[135,222],[203,222]];
 function grillCreate(p={},saved){return saved?B.clone(saved):{schema:1,time:0,duration:60,next:0,count:0,cuts:[],score:0,combo:0,peak:0,perfect:0,burnt:0,pulls:0,date:p.date||null,crew:p.crew||[],done:false};}
 function grillTick(s,dt){if(s.done)return s;dt=Math.max(0,dt);s.time=Math.min(s.duration,s.time+dt);for(const c of s.cuts){if(c.pulled)continue;const hot=Math.hypot(c.x-135,c.y-204)<55?1.3:.85;c.heat+=dt*hot/cuts[c.kind].cook;if(c.heat>=1.12&&!c.burnt){c.burnt=true;s.burnt++;s.combo=0;}}
  if(s.time>=s.next&&s.time<s.duration-4){const empty=positions.find(([x,y])=>!s.cuts.some(c=>!c.pulled&&c.x===x&&c.y===y));if(empty){const kind=Object.keys(cuts)[s.count%5];s.cuts.push({id:s.count++,kind,x:empty[0],y:empty[1],heat:0,flips:0,pulled:false,burnt:false});}s.next=s.time+Math.max(1.8,6-s.time*.075);}
  if(s.time>=s.duration)s.done=true;return s;
 }
 function flip(s,id){const c=s.cuts.find(c=>c.id===id);if(!c||c.pulled||s.done||c.flips>=cuts[c.kind].flips)return false;c.flips++;return true;}
 function pull(s,id,plate='rich'){const c=s.cuts.find(c=>c.id===id);if(!c||c.pulled||s.done)return null;c.pulled=true;const perfect=!c.burnt&&c.heat>=.68&&c.heat<=.92&&c.flips===cuts[c.kind].flips;let gain=0;if(perfect){s.perfect++;s.combo++;s.peak=Math.max(s.peak,s.combo);gain=s.combo*(s.date&&plate==='date'?2:1);s.score+=gain;}else s.combo=0;s.pulls++;return {perfect,gain,plate,kind:c.kind};}
 function grillMount(root,ctx){if(!on('H3')||!B.state().discovered.H3){ctx.quit();return {dispose(){}};}const key=`${day()}:${RAAdventures.active()?.id}:${RAAdventures.record('H3')?.count||0}`,saved=ctx.progress(),s=grillCreate(ctx.params,saved.active?.key===key?saved.active.run:null),R=RAPixel,{canvas,ctx:g,toNative}=R.createCanvas(root);
  const start=document.createElement('button');start.textContent='START GRILL';start.dataset.h3Start='';Object.assign(start.style,{position:'absolute',top:'50%',left:'25%',width:'50%',minHeight:'44px',zIndex:'3'});const done=document.createElement('button');done.textContent='CONTINUE';done.dataset.h3Done='';Object.assign(done.style,{position:'absolute',top:'50%',left:'25%',width:'50%',minHeight:'44px',zIndex:'3'});done.hidden=true;root.append(start,done);
  const sizzle=new Audio('assets/audio/sfx/hookah_pickup_kbbq/GRILL_LAND__loop.mp3');sizzle.loop=true;sizzle.preservesPitch=false;let running=false,dead=false,raf=0,last=performance.now(),lastSave=-1,pointer=null,judgment='',judgmentUntil=0,lastCrackle=0,resultSaved=false;
  function save(){ctx.saveProgress({active:{key,run:B.clone(s)},best:Math.max(saved.best||0,s.done?s.score:0)});RAState.save();lastSave=s.time;}
  function begin(){running=true;start.hidden=true;last=performance.now();const mix=RAAudio.settings();sizzle.muted=!!mix.muted;sizzle.volume=Math.min(1,mix.sfx??1)*.3;sizzle.play().catch(()=>{});save();}
  function finish(){ctx.saveProgress({active:null,best:Math.max(saved.best||0,s.score)});ctx.finish({outcome:'grilled',score:s.score,data:{perfect:s.perfect,peak:s.peak,burnt:s.burnt,pulls:s.pulls,date:s.date,seconds:s.time}});}
  function pause(){running=false;sizzle.pause();start.hidden=s.done;save();}function visibility(){if(document.hidden)pause();}
  function down(e){if(!running||s.done)return;const p=toNative(e.clientX,e.clientY),c=s.cuts.find(c=>!c.pulled&&Math.abs(c.x-p.x)<24&&Math.abs(c.y-p.y)<21);if(!c)return;e.preventDefault();canvas.setPointerCapture?.(e.pointerId);pointer={id:e.pointerId,cut:c.id,x:p.x,y:p.y};}
  function up(e){if(!pointer||e.pointerId!==pointer.id)return;const p=toNative(e.clientX,e.clientY),id=pointer.cut,moved=Math.hypot(p.x-pointer.x,p.y-pointer.y)>15;pointer=null;if(moved&&p.y>=315&&p.y<=410){const r=pull(s,id,s.date&&p.x>135?'date':'rich');if(r){judgment=r.perfect?'PERFECT':'COMBO BREAK';judgmentUntil=s.time+1;RAAudio.sfx(r.perfect?'SIZZLE_PERFECT':'SMOKE_HISS');}}else if(!moved&&flip(s,id))RAAudio.sfx('TONGS');save();}
  function cancel(){pointer=null;}start.addEventListener('click',begin);done.addEventListener('click',finish);canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',cancel);document.addEventListener('visibilitychange',visibility);
  function draw(){R.rect(g,0,0,270,480,'#231b20');R.text(g,'GRILL DYNASTY',135,22,{align:'center',size:11});R.text(g,`${Math.ceil(s.duration-s.time)}s · SCORE ${s.score}`,135,43,{align:'center',size:8});R.text(g,`BEST ${Math.max(saved.best||0,s.score)} · LAURA —`,135,61,{align:'center',size:7});R.rect(g,32,120,206,146,'#15151b');for(let y=124;y<266;y+=8)R.rect(g,35,y,200,2,'#55444a');R.rect(g,111,177,48,47,'#732e22');
   for(const c of s.cuts){if(c.pulled)continue;const col=c.heat<.5?'#d38b91':c.heat<.8?'#c79a4c':c.heat<1.12?'#754c33':'#171217';R.rect(g,c.x-19,c.y-13,38,26,col);R.rect(g,c.x-16,c.y-9,32,2,c.heat<.5?'#e6afac':'#e7bf7c');R.text(g,cuts[c.kind].label,c.x,c.y+17,{align:'center',size:4});R.text(g,'↻'.repeat(c.flips),c.x,c.y-5,{align:'center',size:6});if(c.heat>.92)for(let j=0;j<3;j++)R.rect(g,c.x-10+j*8,c.y-23-Math.floor(s.time*4)%8,3,6,'#99949b');}
   R.rect(g,24,320,104,77,'#e8dfcf');R.rect(g,142,320,104,77,'#e8dfcf');R.text(g,'RICH',76,404,{size:7,align:'center'});R.text(g,s.date?'HER PLATE':'CREW',194,404,{size:7,align:'center'});R.text(g,'TAP TO FLIP · DRAG TO PLATE',135,285,{size:6,align:'center'});if(s.time<judgmentUntil)R.text(g,judgment,135,302,{size:8,align:'center',color:'#f5bd02'});if(s.done){R.rect(g,30,130,210,160,'#10121dcc');R.text(g,`PERFECT ${s.perfect}`,135,177,{size:9,align:'center'});R.text(g,`SCORE ${s.score} · BEST ${Math.max(saved.best||0,s.score)}`,135,196,{size:7,align:'center'});}
  }
  function frame(t){if(dead)return;if(running){grillTick(s,Math.min(.1,Math.max(0,(t-last)/1000)));const live=s.cuts.filter(c=>!c.pulled),h=live.length?Math.max(...live.map(c=>c.heat)):0;sizzle.playbackRate=.85+Math.min(1,h)*.6;if(h>.8&&s.time-lastCrackle>1){RAAudio.sfx('CHAR_CRACKLE');lastCrackle=s.time;}if(s.time-lastSave>=1)save();}last=t;if(s.done){running=false;sizzle.pause();start.hidden=true;done.hidden=false;if(!resultSaved){save();resultSaved=true;}}root.dataset.h3Phase=s.done?'done':running?'grilling':'ready';root.dataset.h3Time=String(s.time);draw();raf=requestAnimationFrame(frame);}raf=requestAnimationFrame(frame);
  return {pause,dispose(){save();if(s.done)ctx.saveProgress({active:null});dead=true;cancelAnimationFrame(raf);sizzle.pause();sizzle.removeAttribute('src');canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointerup',up);canvas.removeEventListener('pointercancel',cancel);document.removeEventListener('visibilitychange',visibility);start.remove();done.remove();}};
 }
 RAMinigames.register('H3',{title:'H3',mount:grillMount});let h3Registered=false;
 const women=()=>RARelations.known({dateable:true}).filter(p=>p.catalog.adult&&(!p.catalog.age||p.catalog.age>=21)&&RARelations.canDate(p.id));
 function registerH3(){if(h3Registered)return;h3Registered=true;RAEnvironments.register({id:'H3-LOC',name:'GRILL DYNASTY · KOREATOWN',base:1,floorY:390,placeholder:true,paint:{seed:'H3',sky:'#241522',wall:'#593a38',floor:'#372f2b',horizon:345,props:[{type:'table',x:35,y:330,w:200,color:'#8f6a49'},{type:'rect',x:110,y:320,w:50,h:10,color:'#38302d'}]}});
  B.define({id:'H3',title:'GRILL DYNASTY',lane:'food',repeatable:true,start:'arrive',available:()=>on('H3'),nodes:{
   arrive:{env:'H3-LOC',actors:{left:'rich'},lines:[B.N('Koreatown. Pork belly, bulgogi, short rib, brisket, mushroom. The grill is hot.')],choices:[{label:'SOLO',next:'grill'},{label:'WITH THE CREW',when:()=>RARelations.known({dateable:false}).some(p=>!p.catalog.family),next:'crew'},{label:'A DATE',when:()=>women().length>0,next:'date'}]},
   crew:{choices:()=>RARelations.known({dateable:false}).filter(p=>!p.catalog.family).map(p=>({label:p.catalog.name,fx:A=>A.set('crew',[p.id]),next:'grill'}))},
   date:{choices:()=>women().map(p=>({label:p.catalog.name,fx:A=>A.set('date',p.id),next:'grill'}))},
   grill:{actors:A=>({left:'rich',...(A.vars.date?{right:A.vars.date}:A.vars.crew?.[0]?{right:A.vars.crew[0]}:{})}),minigame:{id:'H3',params:A=>({date:A.vars.date,crew:A.vars.crew}),next:(A,r)=>{A.set('grill',r);return r.quit?'quit':'end';}}},
   quit:{end:{outcome:'left',memory:{text:'left the grill',lane:'food'}}},
   end:{end:{outcome:'grilled',fx:A=>{const r=A.vars.grill;if(!r||r.quit)return;update({grillBest:Math.max(state().grillBest||0,r.score||0)});if(A.vars.date){RARelations.date(A.vars.date,'H3');RARelations.memory(A.vars.date,'H3:plate');}if(r.data.peak>=8&&r.data.perfect>=8)update({grillLegendDay:day()});},memory:{text:'worked the grill at Grill Dynasty',lane:'food'},receipt:{caption:'the grill. perfect.'},home:B.R("let me handle the grill bro")}}
  }});
 }
 function enterH3(){registerH3();B.discover('H3');return RAAdventureScene.begin('H3');}
 RAPlaces.define([{id:'H3',label:'TRY A NEW FOOD SPOT',sub:'KOREATOWN',order:12,when:()=>on('H3'),go:enterH3}]);
 if(B.state().discovered.H3)registerH3();B.wake('H3',87,()=>{if(on('H3')&&state().grillLegendDay===day()-1)B.once(`H3:legend:${day()}`,()=>RALife.mail({id:`H3:legend:${day()}`,kind:'people',title:'',body:'brother. that grill was mine.'}));});
 function penguinChance(){return 1+(state().brotherTextDay===day()-1?1:0);}
 function spawnPenguin(){const d=day();if(!on('H4')||!B.once(`H4:${d}`))return false;const cash=5000+RALife.hash(d*991)%45001;update({penguin:{day:d,cash},brotherTextDay:d});RALife.addMoney(cash);RALife.text('family','LIL BRO','🐧',{id:`H4:family:${d}`});if(B.S5?.state().revealed)RALife.text('G1','XENORIUS 🌞','🐧',{id:`H4:G1:${d}`});return true;}
 function wakeH4(){if(!on('H4'))return;if(state().penguin&&state().penguin.day!==day())update({penguin:null});if(RALife.hash(day()*997)%60<penguinChance())spawnPenguin();else if(RALife.hash(day()*971)%19===0)B.once(`H4:sticker:${day()}`,()=>{update({brotherTextDay:day()});RALife.text('family','LIL BRO','🐧',{id:`H4:sticker:${day()}`});});}
 B.wake('H4',88,wakeH4);const render=RABedroomCompany.render;RABedroomCompany.render=function(layer){const value=render(layer);if(!on('H4')||state().penguin?.day!==day())return value;const cv=document.createElement('canvas');cv.width=270;cv.height=480;cv.dataset.h4='';Object.assign(cv.style,{position:'absolute',inset:'0',width:'100%',height:'100%',pointerEvents:'none',imageRendering:'pixelated',zIndex:'2'});const g=cv.getContext('2d'),R=RAPixel;R.rect(g,165,335,25,19,'#161a24');R.rect(g,170,338,17,12,'#e9e4d5');R.rect(g,161,341,8,6,'#e8b43a');R.rect(g,165,337,15,3,'#050609');R.rect(g,173,347,12,2,'#f5bd02');R.text(g,'LOLU',179,350,{size:3,align:'center',color:'#f5bd02'});R.rect(g,128,350,17,7,'#56755c');R.rect(g,129,349,15,1,'#9ab387');R.text(g,'z',187,329,{size:5,color:'#d3d4df'});layer.append(cv);return value;};
 function devH4(){if(!document.body.classList.contains('dev-enabled'))return false;const r=spawnPenguin();RABedroomLife.refresh();return r;}
 const panel=document.querySelector('#devPanel');if(panel){const button=document.createElement('button');button.type='button';button.textContent='H4';button.dataset.build3Dev='H4';button.addEventListener('click',devH4);panel.append(button);}
 const tees={H8A:'NIGHT SCHOLAR',H8B:'MASKED WORLD',H8C:'ONE MORE TURN'};let h8Registered=false;
 function registerH8(){if(h8Registered)return;h8Registered=true;for(const [id,label]of Object.entries(tees))RACombatData.FITS[id]={id,label:`DUOQLO · ${label} TEE`,slot:'top',price:0};B.define({id:'H8',title:'NOT TODAY',lane:'people',start:'arrive',available:()=>on('H8')&&!state().h8Done,nodes:{arrive:{env:'grave',actors:{left:'rich'},lines:[B.S(null,'you still watch cartoons, bro?'),B.N('The crowd waits.')],choices:[{label:'BERSERK IS LITERATURE, BROTHER. READ A BOOK.',next:'read'}]},read:{lines:[B.R("berserk is literature bro read a book"),B.N('The crowd laughs with Rich. By the end of the night, the guy is asking for recommendations.')],next:'end'},end:{end:{outcome:'stood',fx:()=>update({h8Done:true}),memory:{text:'Berserk is literature. the crowd knew.',lane:'people'},home:B.R("read a book bro")}}}});}
 function earnTee(topic){registerH8();const id=topic==='DOOM'?'H8B':topic==='BERSERK'?'H8A':'H8C';if(!RALife.hasFit(id)){RALife.addFit(id);RALife.equipFit('top',id);update({teeDay:day(),lastTee:id});}}
 function rant(A,topic,who){A.set('h8Topic',topic);A.set('h8Right',false);const ids=Array.isArray(who)?who:[who];for(const id of ids.filter(Boolean)){const p=RABtfPeople.get(id),right=id==='tristan'||topic==='DOOM'&&(p?.likes||[]).includes('music')||topic==='BERSERK'&&(p?.likes||[]).some(x=>['gallery','movie_room','anime'].includes(x));RARelations.memory(id,`H8:${topic}:${right?'loved':'lectured'}`);if(right){A.set('h8Right',true);RARelations.gift(id,'H8-rant');}}earnTee(topic);}
 for(const id of ['HOOKAH','A50']){const def=RAAdventures.get(id);if(!def)continue;const nodeId=id==='HOOKAH'?'company':'league',node=def.nodes[nodeId],baseChoices=node.choices,back=id==='HOOKAH'?'hang':'sunrise';
  const extra=A=>[{label:'DOOM AS A WORLD-BUILDER',fx:X=>rant(X,'DOOM',id==='HOOKAH'?(X.vars.co==='homies'?['tunde','dre']:X.vars.co||'bllad33'):'tristan'),next:'BUILD3-H8-rant'},{label:'BERSERK’S ART',fx:X=>rant(X,'BERSERK',id==='HOOKAH'?(X.vars.co==='homies'?['tunde','dre']:X.vars.co||'bllad33'):'tristan'),next:'BUILD3-H8-rant'}];
  RAAdventures.define({...def,nodes:{...def.nodes,[nodeId]:{...node,...(id==='HOOKAH'?{choices:A=>{const list=typeof baseChoices==='function'?baseChoices(A):[...baseChoices];return on('H8')?[...list,...extra(A)]:list;}}:{next:A=>on('H8')&&Object.keys(tees).includes(RALife.life().ownership.fits.equipped.top)?'BUILD3-H8-pick':(typeof node.next==='function'?node.next(A):node.next)})},'BUILD3-H8-pick':{choices:A=>[...extra(A),{label:'ONE MORE TURN.',fx:()=>earnTee('CIV'),next:back}]},'BUILD3-H8-rant':{lines:A=>[B.R(A.vars.h8Topic==='DOOM'?'brother. DOOM built a whole world. the mask. the records. all of it.':'Berserk is literature, brother. look at those pages.'),B.N(A.vars.h8Right?'They love it.':'They get lectured. It’s still funny.')],next:back}}});
 }
 const encounter=window.RAGraveEncounters;window.RAGraveEncounters=function(L){const list=encounter?encounter(L):[];if(on('H8')&&!state().h8Done&&Object.keys(tees).includes(RALife.life().ownership.fits.equipped.top)){registerH8();B.discover('H8');list.push({label:'…CARTOONS?',fx:A=>A.set('chain','H8'),next:'out'});}return list;};
 B.wake('H8',89,()=>{if(on('H8')&&state().teeDay===day()-1)B.once(`H8:tee:${day()}`,()=>RALife.mail({id:`H8:tee:${day()}`,kind:'people',title:'',body:'brother. the tee is a flex.'}));});
 if(Object.keys(tees).some(id=>RALife.hasFit(id))||B.state().discovered.H8)registerH8();
 B.S7={state,update,cuts,grillCreate,grillTick,flip,pull,registerH3,enterH3,women,penguinChance,spawnPenguin,wakeH4,devH4,tees,earnTee,rant};
});


RABuild3Stages.push(function(B){
 'use strict';const code='H2';RAFeatures.register({id:'BUILD3.H2',fragment:'BUILD3',description:code});RAFeatures.set('BUILD3.H2',true);B.codes.push(code);
 const state=()=>B.state().s8||{},update=v=>B.patch('s8',{...state(),...v}),day=()=>RALife.today().day,on=()=>B.enabled('H2');
 const milestones=[{at:10,text:'a gray box drives.'},{at:25,text:'Kuroba walks.'},{at:40,text:'the neon city lights up.'},{at:55,text:'a radio station. Rich’s own songs play in-game.'},{at:70,text:'the first mission.'},{at:85,text:'Mazda. a secret in the game-inside-the-game.'},{at:99,text:'KUROBA'}];
 function eligibleFolder(A){return on()&&!state().uploaded&&state().sessionDay!==day()&&(!!B.state().discovered.H2||A.vars.where!=='music_room'&&RALife.done('A16')&&(RALife.life().creativeLife.music.cooked||[]).length>0);}
 function create(saved){return saved?B.clone(saved):{schema:1,time:0,duration:75,next:1.5,count:0,tokens:[],correct:0,missed:0,wrong:0,flow:0,peak:0,done:false};}
 const words=['city','drive','lights','walk','radio','mission','night','kuroba'];
 function tick(s,dt){if(s.done)return s;s.time=Math.min(s.duration,s.time+Math.max(0,dt));while(s.next<=s.time&&s.next<s.duration-2){const id=s.count++,bug=id%7===6;s.tokens.push({id,word:bug?'BUG':words[id%words.length],bug,target:s.next+1.3,status:'pending',taps:0,firstTap:null});s.next+=1.7;}
  for(const n of s.tokens)if(n.status==='pending'&&s.time>n.target+.6){n.status='miss';s.missed++;s.flow=0;}if(s.time===s.duration)s.done=true;return s;
 }
 function hit(s,id){if(s.done)return false;const n=s.tokens.find(x=>x.id===id);if(!n||n.status!=='pending'||Math.abs(n.target-s.time)>.6){s.wrong++;s.flow=0;return false;}if(n.bug){if(n.firstTap===null||s.time-n.firstTap>.35){n.firstTap=s.time;n.taps=1;return null;}n.taps++;}n.status='hit';s.correct++;s.flow++;s.peak=Math.max(s.peak,s.flow);return true;}
 function gain(s){const total=s.correct+s.missed+s.wrong,ratio=total?s.correct/total:0;return 3+Math.min(6,Math.floor(ratio*4+Math.min(1,s.peak/10)*2));}
 function award(s){if(!on()||!s.done||state().sessionDay===day()||state().uploaded)return null;const before=Number(state().progress)||0,after=Math.min(100,before+gain(s)),seen=milestones.filter(m=>before<m.at&&after>=m.at).map(m=>m.at);update({progress:after,sessionDay:day(),sessions:(state().sessions||0)+1,pendingMilestones:seen,seen:[...(state().seen||[]),...seen],lastGain:after-before});if(seen.includes(55)){RARelations.meet('tristan');RARelations.memory('tristan','H2:shown:55');}return after-before;}
 function upload(){if(!on()||state().progress!==100||state().uploaded)return false;update({uploaded:true,uploadedDay:day()});const spark={id:'build3:H2',code:'H2',day:day(),headlines:['who made kuroba','kuroba is #1','a vampire made this???']};B.patch('spark',spark);RAState.patch('life.momentum.sparkId',spark.id);RAState.save();return true;}
 function waiver(){return on()&&!!state().uploaded;}
 function wake(){if(!waiver()||day()<=state().uploadedDay||state().paid)return false;update({paid:true,paidDay:day()});RALife.addMoney(1000000);RAState.save();return true;}
 const oldEligible=RAFame.eligible;RAFame.eligible=()=>waiver()||oldEligible();B.wake('H2-night',-9,()=>{if(waiver()&&!RALife.life().momentum.fameFired)RAState.patch('life.momentum.fameEligible',true);});B.wake('H2-payout',44,wake);
 function mount(root,ctx){if(!on()||!B.state().discovered.H2||state().sessionDay===day()){ctx.quit();return {dispose(){}};}const key=`${day()}:H2`,saved=ctx.progress(),s=create(saved.active?.key===key?saved.active.run:null),R=RAPixel,{canvas,ctx:g,toNative}=R.createCanvas(root);
  const start=document.createElement('button');start.textContent='BUILD SESSION';start.dataset.h2Start='';Object.assign(start.style,{position:'absolute',top:'48%',left:'20%',width:'60%',minHeight:'44px'});const done=document.createElement('button');done.textContent='CONTINUE';done.dataset.h2Done='';done.hidden=true;Object.assign(done.style,{position:'absolute',top:'57%',left:'20%',width:'60%',minHeight:'44px'});root.append(start,done);
  let running=false,dead=false,raf=0,last=performance.now(),savedAt=-1,terminal=false,finalSaved=false,flowAudio=null;const montana=B.S14?.music('MONTANA','H2')||RARadio.TRACKS.find(t=>t.id==='MONTANA'&&t.file);
  function save(){ctx.saveProgress({active:{key,run:B.clone(s)}});RAState.save();savedAt=s.time;}
  function quiet(){flowAudio?.pause();}
  function mix(){if(!montana)return;if(!flowAudio){flowAudio=new Audio(montana.file);flowAudio.loop=true;}const settings=RAAudio.settings();flowAudio.muted=!!settings.muted;flowAudio.volume=(settings.music??1)*.15;if(running&&s.flow>=5)flowAudio.play().catch(()=>{});else quiet();}
  function begin(){running=true;start.hidden=true;last=performance.now();save();mix();}
  function finish(){terminal=true;ctx.saveProgress({active:null});ctx.finish({outcome:'built',score:s.correct,data:{session:B.clone(s)}});}
  function pause(){running=false;quiet();start.hidden=s.done;save();}function visibility(){if(document.hidden)pause();}
  function down(e){if(!running||s.done)return;const p=toNative(e.clientX,e.clientY),n=s.tokens.find(n=>n.status==='pending'&&Math.abs(p.y-(370-(n.target-s.time)*70))<21&&p.x>=30&&p.x<=240);hit(s,n?.id);save();mix();e.preventDefault();}
  start.addEventListener('click',begin);done.addEventListener('click',finish);canvas.addEventListener('pointerdown',down);document.addEventListener('visibilitychange',visibility);
  function draw(){R.rect(g,0,0,270,480,s.flow>=5?'#151431':'#12121c');R.text(g,'KUROBA',135,25,{size:13,align:'center',color:'#72e6df'});R.text(g,`${Math.ceil(s.duration-s.time)}s · FLOW ${s.flow}`,135,48,{size:7,align:'center'});R.rect(g,25,370,220,2,'#cf60cf');for(const n of s.tokens){if(n.status!=='pending')continue;const y=370-(n.target-s.time)*70;if(y<75||y>425)continue;const target=Math.abs(n.target-s.time)<=.6;R.rect(g,30,y-15,210,30,n.bug?'#702b38':target?'#225a60':'#292936');R.text(g,n.word,135,y-4,{size:9,align:'center',color:n.bug?'#ff7984':target?'#88ffee':'#b6b6c4'});if(n.bug)R.text(g,'DOUBLE TAP',135,y+8,{size:5,align:'center'});}R.text(g,'TAP THE HIGHLIGHTED TOKEN',135,450,{size:6,align:'center'});if(s.done){R.rect(g,20,115,230,150,'#10121d');R.text(g,`KUROBA +${gain(s)}%`,135,155,{size:11,align:'center',color:'#72e6df'});}}
  function frame(t){if(dead)return;if(running){tick(s,Math.min(.1,Math.max(0,(t-last)/1000)));if(s.time-savedAt>=.5)save();}last=t;if(s.done){running=false;quiet();start.hidden=true;done.hidden=false;if(!finalSaved){save();finalSaved=true;}}root.dataset.h2Phase=s.done?'done':running?'building':'ready';draw();raf=requestAnimationFrame(frame);}raf=requestAnimationFrame(frame);
  return {pause,dispose(){if(!terminal)save();dead=true;quiet();flowAudio?.removeAttribute('src');cancelAnimationFrame(raf);canvas.removeEventListener('pointerdown',down);document.removeEventListener('visibilitychange',visibility);start.remove();done.remove();}};
 }
 // Upload progress is a separate interaction, with no payout adapter or combat state.
 function uploadMount(root,ctx){if(!on()||!B.state().discovered.H2||state().progress!==100){ctx.quit();return {dispose(){}};}const R=RAPixel,{ctx:g}=R.createCanvas(root),button=document.createElement('button');button.dataset.h2Upload='';button.textContent=state().uploaded?'CONTINUE':'UPLOAD';Object.assign(button.style,{position:'absolute',top:'58%',left:'20%',width:'60%',minHeight:'44px'});root.append(button);let start=0,raf=0,dead=false,ready=!!state().uploaded;
  function draw(t){if(dead)return;R.rect(g,0,0,270,480,'#12121c');if(ready){R.text(g,'REWARD:',135,175,{align:'center',size:15});}else{R.text(g,'KUROBA',135,135,{align:'center',size:17,color:'#72e6df'});R.rect(g,35,195,200,8,'#252536');if(start){const p=Math.min(1,(t-start)/3500);R.rect(g,35,195,Math.floor(200*p),8,'#72e6df');if(p===1){upload();ready=true;button.hidden=false;button.textContent='CONTINUE';}}}raf=requestAnimationFrame(draw);}
  button.addEventListener('click',()=>{if(ready){ctx.finish({outcome:'uploaded'});return;}start=performance.now();button.hidden=true;});raf=requestAnimationFrame(draw);return {dispose(){dead=true;cancelAnimationFrame(raf);button.remove();}};
 }
 RAMinigames.register('H2',{title:'H2',mount});RAMinigames.register('H2-UPLOAD',{title:'H2',mount:uploadMount});let registered=false;
 function register(){if(registered)return;registered=true;B.define({id:'H2',title:'KUROBA',lane:'music',repeatable:true,start:'laptop',available:()=>on()&&!state().uploaded&&(state().progress===100||state().sessionDay!==day()),nodes:{
  laptop:{env:A=>A.vars.where==='music_room'?'music_room':'cafe',actors:{left:{id:'rich',state:'laptop_seated'}},title:()=>`KUROBA · ${state().progress||0}%`,choices:()=>state().progress===100?[{label:'UPLOAD',next:'upload'}]:[{label:'BUILD SESSION',next:'session'},{label:'CLOSE THE FOLDER',next:'left'}]},
  session:{minigame:{id:'H2',next:(A,r)=>{if(r.quit)return 'left';award(r.data.session);return 'milestones';}}},
  milestones:{lines:()=>[...milestones.filter(m=>(state().pendingMilestones||[]).includes(m.at)).map(m=>B.N(m.text)),...((state().pendingMilestones||[]).includes(55)?[B.S('tristan','you still on that?')]:[])],next:'end'},
  upload:{minigame:{id:'H2-UPLOAD',next:(A,r)=>r.quit?'left':'released'}},
  released:{end:{outcome:'uploaded',nightEnder:true,memory:{text:'uploaded KUROBA',lane:'music'}}},
  end:{end:{outcome:'built',fx:()=>update({pendingMilestones:[]}),memory:{text:'worked on KUROBA',lane:'music'}}},
  left:{end:{outcome:'left',memory:{text:'closed the other folder',lane:'music'}}}
 }});}
 const cook=RAAdventures.get('COOK'),choices=cook.nodes.memory.choices;
 RAAdventures.define({...cook,nodes:{...cook.nodes,memory:{...cook.nodes.memory,choices:A=>{const list=choices(A);return eligibleFolder(A)?[...list,{label:'OPEN THE OTHER FOLDER.',fx:()=>{register();B.discover('H2');},next:'BUILD3-H2-folder'}]:list;}},'BUILD3-H2-folder':{title:'KUROBA',lines:()=>state().sessions?[B.N('the other folder is still here.')]:[B.N('a half-finished title screen. an empty progress bar.'),B.R("damn i forgot about this")],end:{outcome:'opened_folder',memory:{text:'opened the other folder',lane:'music'},chain:'H2',chainVars:A=>({where:A.vars.where})}}}});
 if(B.state().discovered.H2)register();B.S8={state,update,milestones,eligibleFolder,create,tick,hit,gain,award,upload,waiver,wake,register};
});


RABuild3Stages.push(function(B){
 'use strict';for(const code of ['H5','H6','H7']){RAFeatures.register({id:`BUILD3.${code}`,fragment:'BUILD3',description:code});RAFeatures.set(`BUILD3.${code}`,true);B.codes.push(code);}
 const state=()=>B.state().s9||{},update=v=>B.patch('s9',{...state(),...v}),life=()=>RALife.life(),day=()=>RALife.today().day,on=c=>B.enabled(c);
 function seedParis(){if(!on('H5')||life().receipts.some(r=>r.id==='H5:PARIS'))return false;RAState.patch('life.receipts',[{id:'H5:PARIS',caption:'best night of my life, real talk.',vp:true,env:'H5-PARIS',lane:'people',day:0,dateLabel:'PARIS. A WHILE AGO.'},...life().receipts]);return true;}
 seedParis();B.wake('H5-origin',0,seedParis);
 const closeWomen=()=>RARelations.known({dateable:true}).filter(p=>p.catalog.adult&&(p.catalog.age||21)>=21&&p.level>=3),closest=()=>closeWomen().sort((a,b)=>(b.points||0)-(a.points||0)||a.id.localeCompare(b.id))[0];
 function draft(code,key,tokens={}){const row=window.RABuild3DraftedLines?.rows.find(r=>r.code===code&&r.key===key);if(!row)return null;const fill=text=>text.replace(/\{\{(person|like|identity)\}\}/g,(m,k)=>tokens[k]??m),speaker=fill(row.speaker),text=fill(row.text);if(/\{\{/.test(speaker+text))return null;const line=speaker==='rich'?B.R(text):B.S(speaker,text);line[2]={...line[2],drafted:'DRAFTED-OL050',code,key};return line;}
 function h6Conversation(A){const id=A.vars.person,p=RABtfPeople.get(id);if(!on('H6')||!p?.dateable||!p.adult||(p.age||21)<21||A.vars.h6Conversation===false)return [];const full=['mazda_human','nneka','jdm_importer_daughter_001','june','ms_patrice'];if(full.includes(id))return [1,2,3,4].map(n=>draft('H6',`${id}.${String(n).padStart(2,'0')}`)).filter(Boolean);const like=p.likes?.[0];return ['shared.01','shared.02','shared.rich'].map(key=>draft('H6',key,{person:id,...(like?{like:RADating.spotLabel(like).toLowerCase()}:{})})).filter(Boolean);}
 function h7Reaction(A){const id=A.vars.h7Woman;if(!on('H7')||!id||!A.vars.h7Reaction)return [];const row=draft('H7',`${id}.close`)||draft('H7','shared.close',{person:id});return [row,draft('H7','reply.rich')].filter(Boolean);}
 const quietSpots=['onsen','rain_walk','movie_room','kitchen','ballroom','fish_tank','naija_mart','taco_truck'];
 function mentionParis(A){return on('H5')&&!state().parisMentioned&&quietSpots.includes(A.vars.spot)&&closest()?.id===A.vars.person;}
 const date=RAAdventures.get('DATE'),moment=date.nodes.moment,enterMoment=moment.enter;
 RAAdventures.define({...date,nodes:{...date.nodes,moment:{...moment,enter:A=>{enterMoment?.(A);if(mentionParis(A)){A.set('h5Paris',true);update({parisMentioned:true});}},lines:A=>[...moment.lines(A),...(A.vars.h5Paris?[B.R("paris good cigarettes house music damn the whole night flew by"),B.R("best night of my life real talk"),B.R("damn getting way too emotional")]:[])]}}});
 function h5Eligible(A={vars:{}}){return on('H5')&&day()>=30&&!state().h5Done&&!life().temptations.history.some(t=>t.day===day()&&t.taken)&&!A.vars.person&&!A.vars.date&&!A.vars.crew?.length&&!life().clock.nightOutings.some(o=>o.type==='date'||o.person||o.crew?.length);}
 const times=['11:40','12:55','2:20','4:10'];let h5Registered=false;
 function registerH5(){if(h5Registered)return;h5Registered=true;RABtfPeople.byId['H5-ONEOFF']={id:'H5-ONEOFF',name:'',adult:true,minAge:21,dateable:false,look:{skin:'#613c30',top:'#252030',bottom:'#17151e',hair:'#17111a',hairShape:'long',height:1.05}};
  RAEnvironments.register({id:'H5-HILLS',name:'THE HILLS',base:1,floorY:390,placeholder:true,paint:{seed:'H5-HILLS',sky:'#151a36',wall:'#30243d',floor:'#281e2b',horizon:330,props:[{type:'rect',x:20,y:65,w:90,h:170,color:'#152843'},{type:'rect',x:160,y:235,w:80,h:20,color:'#442e48'},{type:'rect',x:205,y:210,w:18,h:24,color:'#17121f'}]}});
  B.define({id:'H5',title:'THE NIGHT FLEW BY',lane:'people',start:'curb',available:()=>on('H5')&&!state().h5Done,nodes:{
   curb:{env:'castle_exterior',actors:{left:'rich'},lines:[B.N('Outside the castle, alone. The good cigarettes. A Paris brand he has been saving.')],choices:[{label:'KEEP WALKING',next:'bar'}]},
   bar:{env:'street_night',actors:{left:'rich',right:'H5-ONEOFF'},enter:A=>A.set('h5Clock',times[0]),lines:[B.N('A bar he has never been to. A woman he has never met: black, stunning, confident. A French accent.')],choices:[{label:'LET THE NIGHT HAPPEN',next:'hills'}]},
   hills:{env:'H5-HILLS',enter:A=>A.set('h5Clock',times[1]),lines:[B.N('She and her friends take him to her place in the hills. House music from a speaker.'),B.N('DJ Anfeesa’s lane. Za only.')],choices:[{label:'LET THE NIGHT HAPPEN',next:'dance'}]},
   dance:{enter:A=>A.set('h5Clock',times[2]),lines:[B.N('Talking. Dancing.'),B.N('Laughing. The clock moves faster than it should.')],choices:[{label:'LET THE NIGHT HAPPEN',next:'blue'}]},
   blue:{enter:A=>A.set('h5Clock',times[3]),lines:[B.N('The window turns blue.')],choices:[{label:'WALK HOME',next:'home'}]},
   home:{env:'street_night',actors:{left:'rich'},lines:[B.N('Rich walks home at sunrise.')],end:{outcome:'sunrise',nightEnder:true,fx:()=>{update({h5Done:true,h5Day:day()});B.once('H5:momentum');RALife.light('connection',1,'H5:connection');RALife.light('legend',1,'H5:legend');},memory:{text:'the whole night flew by',lane:'people'},receipt:{caption:'…the whole night flew by.'}}}
  }});
 }
 const tacos=RAAdventures.get('TACOS'),tacoChoices=tacos.nodes.arrive.choices;
 RAAdventures.define({...tacos,nodes:{...tacos.nodes,arrive:{...tacos.nodes.arrive,choices:A=>h5Eligible(A)?[...tacoChoices,{label:'STEP OUTSIDE ALONE',fx:()=>{registerH5();B.discover('H5');},next:'BUILD3-H5-outside'}]:tacoChoices},'BUILD3-H5-outside':{end:{outcome:'outside',memory:{text:'stepped outside the castle alone',lane:'people'},chain:'H5'}}}});
 const originalEnter=RAAdventures.enter;RAAdventures.enter=function(id){const result=originalEnter(id),a=RAAdventures.active();if(a?.id==='H5'&&a.vars.h5Clock){const root=document.querySelector('#adventureScene');if(root){let clock=root.querySelector('[data-h5-clock]');if(!clock){clock=document.createElement('span');clock.dataset.h5Clock='';Object.assign(clock.style,{position:'absolute',right:'12px',top:'12px',zIndex:'6',color:'#f6efd9',font:'8px "Press Start 2P", monospace'});root.append(clock);}clock.textContent=a.vars.h5Clock;}}return result;};
 const lit=RALife.litDimensions,dim=B.S1.dimensions;RALife.litDimensions=()=>{const v=lit();return on('H5')&&B.state().once['H5:momentum']?[...new Set([...v,'connection','legend'])]:v;};B.S1.dimensions=()=>{const v=dim();return on('H5')&&B.state().once['H5:momentum']?{...v,connection:true,legend:true}:v;};
 B.wake('H5-sunrise',85,()=>{if(on('H5')&&state().h5Day===day()-1)B.once(`H5:wake:${day()}`,()=>RALife.mail({id:`H5:wake:${day()}`,kind:'people',title:'',body:'…the whole night flew by.'}));});
 if(B.state().discovered.H5)registerH5();
 let h6Registered=false;
 function registerH6(){if(h6Registered)return;h6Registered=true;RAEnvironments.register({id:'H6-SPRING',name:'PRIVATE SPRING',base:1,floorY:390,placeholder:true,paint:{seed:'H6',sky:'#0d1836',wall:'#172642',floor:'#355d66',horizon:335,props:[{type:'lamp',x:35,y:260,h:50,r:10},{type:'lamp',x:235,y:260,h:50,r:10},{type:'rect',x:20,y:335,w:230,h:55,color:'#537c82'}]}});
  B.define({id:'H6',title:'THE PRIVATE SPRING',lane:'dating',repeatable:true,start:'invite',available:()=>on('H6')&&closeWomen().some(p=>RARelations.canDate(p.id)),nodes:{
   invite:{env:'onsen',actors:{left:'rich'},choices:()=>closeWomen().filter(p=>RARelations.canDate(p.id)).map(p=>({label:p.catalog.name,fx:A=>A.set('person',p.id),next:'spring'}))},
   spring:{env:'H6-SPRING',actors:A=>({left:'rich',right:{id:A.vars.person,state:'swimwear'}}),lines:[B.N('A private outdoor spring at night. Steam.'),B.N('Lanterns. Stars.')],next:'quiet'},
   quiet:{enter:A=>A.set('h6Conversation',!B.state().once[`H6:conversation:${A.vars.person}`]),lines:h6Conversation,choices:[{label:'SIT IN THE QUIET',next:'end'}]},
   end:{end:{outcome:'quiet',fx:A=>{if(A.vars.h6Conversation)B.once(`H6:conversation:${A.vars.person}`);RARelations.date(A.vars.person,'onsen');RARelations.memory(A.vars.person,'H6:private-spring');RALife.setFlag('lastCloseDate',{person:A.vars.person,day:day()});update({spring:{day:day(),person:A.vars.person}});},memory:A=>({text:`a private spring with ${RABtfPeople.get(A.vars.person).name.toLowerCase()}`,lane:'dating'}),receipt:A=>({id:`${A.vars.person}:${day()}`,caption:'silence, steam, stars.'})}}
  }});
 }
 const onsen=RAAdventures.get('A45'),soak=onsen.nodes.soak.choices;
 RAAdventures.define({...onsen,nodes:{...onsen.nodes,soak:{...onsen.nodes.soak,choices:()=>on('H6')&&closeWomen().some(p=>RARelations.canDate(p.id))?[...soak,{label:'BOOK THE PRIVATE SPRING',fx:()=>{registerH6();B.discover('H6');},next:'BUILD3-H6-book'}]:soak},'BUILD3-H6-book':{end:{outcome:'private_spring',memory:{text:'booked the private spring',lane:'dating'},chain:'H6'}}}});
 if(B.state().discovered.H6)registerH6();
 // H7's original rain economy/roster is superseded by RAINMAKER. Observe F15's existing post-payment seam;
 // no new denomination, budget, target, input, core, renderer, hype or cash reward is added.
 function observeSpend(dancer,amount){if(!on('H7')||!RAF15.enabled()||!RAF15.isDancer(dancer)||!(amount>0))return false;const old=state().club||{},paid=(old.day===day()?old.paid:0)+Math.round(amount);update({club:{day:day(),paid,dancer}});B.discover('H7');registerH7();return true;}
 let h7Registered=false;
 function registerH7(){if(h7Registered)return;h7Registered=true;B.define({id:'H7',title:'THE BING · THE BOOTH',lane:'nightlife',repeatable:true,oncePerNight:true,start:'booth',available:()=>on('H7')&&state().club?.day===day(),nodes:{
  booth:{env:'f15_bing',actors:{left:'rich'},enter:A=>{const id=closest()?.id||null;A.set('h7Woman',id);A.set('h7Reaction',!!id&&!B.state().once[`H7:found-out:${id}:${day()}`]);},lines:()=>[B.R("damn they opened one here?"),...(RARelations.met('lil_smack')&&!RALife.flag('lilSmackGone')?[B.N('Lil Smack is eating wings by the stage. His mouth is open.'),B.R("thats some nasty shit bro")]:[]),...(RARelations.met('tristan')?[B.N('Tristan has never been. He is overwhelmed.')]:[])],choices:[{label:'BACK TO THE NIGHT',next:'found_out'}]},
  found_out:{lines:h7Reaction,next:'end'},
  end:{end:{outcome:'booth',fx:A=>{const p=state().club;if(p&&p.paid>=20000)B.once(`H7:legend:${day()}`,()=>{RALife.receipt({id:`H7:rain:${day()}`,caption:'the whole club turned around.',lane:'nightlife'});RAVampGram.post({handle:'richalucard',text:'the whole club turned around.',likes:0});});const id=A.vars.h7Woman;if(id&&A.vars.h7Reaction)B.once(`H7:found-out:${id}:${day()}`,()=>RARelations.memory(id,`H7:found-out:${day()}`));},memory:{text:'a night at the Bing',lane:'nightlife'}}}
 }});}
 if(window.RAF15){const spend=RAF15.recordSpend;RAF15.recordSpend=function(dancer,amount){const result=spend(dancer,amount);if(result)observeSpend(dancer,amount);return result;};}
 RAPlaces.define([{id:'H7',label:'THE BING · THE BOOTH',order:28,when:()=>on('H7')&&state().club?.day===day(),adventure:'H7'}]);
 if(B.state().discovered.H7)registerH7();B.S9={state,update,seedParis,closeWomen,closest,mentionParis,h5Eligible,times,registerH5,registerH6,observeSpend,registerH7,h6Conversation,h7Reaction};
});


RABuild3Stages.push(function(B){
 'use strict';for(const code of ['C1','C2','C3','C4','NO-S1','NO-S2','NO-S3','RM-S1','RM-S2','RM-S3']){RAFeatures.register({id:`BUILD3.${code}`,fragment:'BUILD3',description:code});RAFeatures.set(`BUILD3.${code}`,true);B.codes.push(code);}
 const state=()=>B.state().s10||{},update=v=>B.patch('s10',{...state(),...v}),life=()=>RALife.life(),day=()=>RALife.today().day,on=c=>B.enabled(c);
 const onceAdventure=(id,title,lane,nodes,available)=>{B.define({id,title,lane,start:Object.keys(nodes)[0],nodes,available});};
 function helpClear(){const a=RAAdventures.active();if(!on('NO-S2')||a?.id!=='NEW_OGA_M7'||a.node!=='dinner')return false;RAAdventures.patchActive({vars:{...a.vars,no2Cleared:true}});update({mamaHelpedDay:day()});return true;}
 function mamaEligible(){return on('NO-S2')&&!!state().mamaAsked;}
 function no1Eligible(req){return on('NO-S1')&&!state().no1Seen&&life().newOga.m1Route==='SWITCH_THE_BAG'&&String(req?.requestId||'').startsWith('f07:finale_p1:')&&req?.job?.f01JobId==='owambe_party';}
 function no1Transport(req){return new Promise(resolve=>{const frame=document.createElement('iframe');frame.id='f01-play-frame';frame.title='THE PLAY';frame.src='assets/sealed/f07-play/index.html?embed=1'+String(window.location.search||'').replace(/^\?/,'&');frame.style.cssText='position:fixed;inset:0;width:100%;height:100%;border:0;z-index:2147483000;background:#000';let done=false;const origin=window.location.origin,finish=res=>{if(done)return;done=true;clearTimeout(timer);window.removeEventListener('message',listen);frame.remove();resolve(res);},listen=e=>{if(e.origin!==origin||e.source!==frame.contentWindow||!e.data)return;if(e.data.type==='F01.play_ready'){clearTimeout(timer);frame.contentWindow.postMessage({type:'F04.play_request',request:req},origin);}if(e.data.type==='F01.play_result')finish(e.data.result);};const timer=setTimeout(()=>finish({schema:RAPlayContract.RESULT_SCHEMA,version:RAPlayContract.VERSION,requestId:req.requestId,status:'REFUSED',code:'PLAY_UNAVAILABLE',cash:{gain:0,spent:0}}),20000);window.addEventListener('message',listen);document.body.append(frame);});}
 if(window.RAShowdown?.play){const launch=RAShowdown.play.launch;RAShowdown.play.launch=async function(req,opts={}){if(!no1Eligible(req))return launch(req,opts);const r=await launch({...req,build3No1:true},{...opts,...(!opts.transport||opts.transport.name==='f07Transport'?{transport:no1Transport}:{})});if(r?.status==='COMPLETE'&&RAPlayContract.validateResult(r).ok&&r.build3Audit?.no1Event)update({no1Seen:true,no1Request:r.requestId});return r;};}
 function no1After(){if(!on('NO-S1')||!state().no1Seen||!life().newOga.finaleDone||state().no1Plug)return false;update({no1Plug:true,no1PlugDay:day()});RALife.setFlag('bloodXPlug','smallie');B.discover('NO-S1');return true;}
 B.define({id:'NO-S1',title:'THE BACK TABLE',lane:'street',start:'table',repeatable:true,available:()=>on('NO-S1')&&state().no1Plug,nodes:{table:{env:'boba_shop',actors:{left:'rich',right:'smallie'},lines:[B.N('Smallie asks Rich for a job. He becomes Rich’s new plug, selling out of the same boba table.')],end:{outcome:'plug',memory:{text:'Smallie. the same boba table.',lane:'street'}}}}});
 B.onComplete(r=>{if(r.id==='NEW_OGA_FINALE')no1After();});B.wake('NO-S1',44,no1After);RAPlaces.define([{id:'NO-S1',label:'THE BACK TABLE',order:28,when:()=>on('NO-S1')&&state().no1Plug,adventure:'NO-S1'}]);
 const m7=RAAdventures.get('NEW_OGA_M7');if(m7){const door=m7.nodes.door.choices;RAAdventures.define({...m7,nodes:{...m7.nodes,door:{...m7.nodes.door,choices:A=>on('NO-S2')&&A.vars.no2Cleared?[...door,{label:'ASK HER ABOUT THE LAPTOP',next:'BUILD3-NO-S2-ledger'}]:door},'BUILD3-NO-S2-ledger':{env:'gbenga_house_dining',actors:{left:'rich',right:'mama_gbenga'},enter:()=>update({mamaAsked:true}),lines:[B.N('The laptop in the kitchen is open. The real ledger. She runs everything; Gbenga is the face.'),B.S('mama_gbenga','Every oga has an oga.')],next:'door'}}});}
 const priorEnter=RAAdventures.enter,roots=new WeakSet();RAAdventures.enter=function(id){const r=priorEnter(id),root=document.querySelector?.('#adventureScene');if(root&&!roots.has(root)){roots.add(root);root.addEventListener('click',e=>{const a=RAAdventures.active();if(!on('NO-S2')||a?.id!=='NEW_OGA_M7'||a.node!=='dinner'||a.vars.no2Cleared)return;const box=root.getBoundingClientRect(),x=(e.clientX-box.left)*270/box.width,y=(e.clientY-box.top)*480/box.height;if(x>=85&&x<=185&&y>=315&&y<=370){e.stopImmediatePropagation();e.preventDefault();helpClear();}},true);}return r;};
 const finale=RAAdventures.get('NEW_OGA_FINALE');if(finale){const add=A=>({label:'MAMA GBENGA',sub:'OUTSIDE THE PLAN',next:'BUILD3-NO-S2-call'}),nodes={...finale.nodes};for(const id of ['plan','pick2']){const old=nodes[id].choices;nodes[id]={...nodes[id],choices:A=>{const c=typeof old==='function'?old(A):old;return mamaEligible()?[...c,add(A)]:c;}};}const crew=nodes.crew.next;nodes.crew={...nodes.crew,next:A=>{const n=crew(A);return n==='party'&&mamaEligible()?'BUILD3-NO-S2-offer':n;}};
  nodes['BUILD3-NO-S2-offer']={choices:[{label:'CONTINUE WITH THE PLAN',next:'party'},{label:'MAMA GBENGA',sub:'OUTSIDE THE PLAN',next:'BUILD3-NO-S2-call'}]};
  nodes['BUILD3-NO-S2-call']={env:'gbenga_rentals',actors:{left:'rich',right:'mama_gbenga'},lines:[B.N('Mama Gbenga makes one phone call. Gbenga puts the Draco back in the cooler and sits down.'),...finale.nodes.blessing.lines,B.N('Mama Gbenga keeps 10% “for the house.”')],end:{...finale.nodes.blessing.end,fx:A=>{update({mamaEntryTaken:true,mamaPercent:10,mamaPayoutMode:'narration_only'});finale.nodes.blessing.end.fx(A);}}};RAAdventures.define({...finale,nodes});}
 function canopy(){const s=life().newOga,id=s.m9TributedCar;if(!on('NO-S3')||!s.finaleDone||!id||state().canopy)return false;update({canopy:{day:day(),id,plate:'MY SON',voiceSeconds:3}});RALife.patchCar(id,{plate:'MY SON',washed:true,detailed:true});RALife.text('gbenga','GBENGA','…drive it well.',{id:'NO-S3:final'});const threads=life().phone.threads;RAState.patch('life.phone.threads',{...threads,gbenga:threads.gbenga.map(m=>m.id==='NO-S3:final'?{...m,voiceNote:true,durationSeconds:3,voiceAudio:null}:m)});RALife.receipt({id:'NO-S3:canopy',caption:'MY SON',vp:false,lane:'cars'});return true;}
 if(finale){const def=RAAdventures.get('NEW_OGA_FINALE'),nodes={...def.nodes};for(const id of ['blessing','consigliere','takeover','BUILD3-NO-S2-call']){const n=nodes[id],old=n.end.fx,lines=n.lines;nodes[id]={...n,lines:A=>{const original=typeof lines==='function'?lines(A):lines;return on('NO-S3')&&life().newOga.m9TributedCar?[...original,B.N('The canopy is pulled back. Rich’s tribute car has been washed and detailed. New plates: MY SON.')]:original;},end:{...n.end,fx:A=>{old(A);if(canopy())A.set('no3Canopy',true);}}};}const complete=RAAdventures.complete;RAAdventures.complete=function(node){const a=RAAdventures.active();if(a?.id==='NEW_OGA_FINALE'&&on('NO-S3')&&life().newOga.m9TributedCar){const root=document.querySelector?.('#adventureScene');if(root)root.dataset.no3='canopy';}return complete(node);};RAAdventures.define({...def,nodes});}
 B.onComplete((result,run)=>{if(result.id==='KITCHEN'&&run?.vars.cubed)update({cubesMade:(state().cubesMade||0)+1});if(result.id==='A23')update({badNight:day()});});
 function crafted(){return Math.max(state().cubesMade||0,life().history.filter(e=>e.type==='adventure_completed'&&e.adventureId==='KITCHEN'&&e.outcome==='cubed').length);}
 function badNight(){const d=day()-1;return state().badNight===d||RALife.flag('lastDefeatDay')===d||B.state().ecology.hiltDay===d||RALife.flag('coffeRaidDay')===d||RARelations.known().some(p=>p.neglectNotedDay===day());}
 function wakeC1(){if(!on('C1')||state().c1Done||crafted()<3||!(life().combat.defeats>0)||!badNight())return false;update({c1Ready:true});return true;}
 function stew(){if(!on('C1')||!state().c1Ready||state().c1Done||!RALife.consume('maggi_dragon_crumble'))return false;update({c1Done:true,c1Day:day(),momAt:Date.now()+180000});RACombatData.ITEMS.C1={label:'GRANDMA’S STEW',healFull:true};RALife.addItem('C1',1);return true;}
 const kitchen=RAAdventures.get('KITCHEN'),pick=kitchen.nodes.pick.choices;RAAdventures.define({...kitchen,nodes:{...kitchen.nodes,pick:{...kitchen.nodes.pick,choices:A=>on('C1')&&state().c1Ready&&!state().c1Done&&RALife.count('maggi_dragon_crumble')?[...pick(A),{label:'COOK SOMETHING',next:'BUILD3-C1-memory'}]:pick(A)},'BUILD3-C1-memory':{lines:[B.N('The cube is glowing. Rich crumbles it into a pot.'),B.N('A small, bright, loud kitchen in Nigeria, decades ago. Grandma is cooking.'),B.N('She hands Rich a spoon. He tastes.'),B.R("damn thats the best stew in the game"),B.N('The castle kitchen returns. The pot is full.')],end:{outcome:'C1',fx:stew,memory:{text:'grandma’s kitchen',lane:'family'}}}}});
 if(state().c1Done)RACombatData.ITEMS.C1={label:'GRANDMA’S STEW',healFull:true};const buttonAction=RACombat2Ext.actionFromButton;RACombat2Ext.actionFromButton=(act,f)=>on('C1')&&act==='BUILD3-C1'&&f.items.C1>0?{type:'item',id:'C1'}:buttonAction(act,f);document.addEventListener('click',e=>{if(on('C1')&&RACombat2.active()){const b=e.target.closest?.('[data-c2="item:C1"]');if(b)b.dataset.c2='BUILD3-C1';}},true);
 function mom(){if(!on('C1')||!state().momAt||Date.now()<state().momAt||state().momSent)return false;update({momSent:true});RALife.text('family','MOM','I dreamt about your grandma last night.',{id:'C1:mom'});return true;}
 function scheduleMom(){if(state().momAt&&!state().momSent){const timer=setTimeout(mom,Math.max(0,state().momAt-Date.now()));timer?.unref?.();}}scheduleMom();B.onComplete(r=>{if(r.id==='KITCHEN'&&r.outcome==='C1')scheduleMom();});B.wake('C1',41,()=>{wakeC1();mom();if(on('C1')&&state().c1Done)RALife.mail({id:`C1:wake:${day()}`,kind:'people',title:'',body:'real talk. be happy with what you have.'});});
 window.RABuild3C2Install();let c2Registered=false;
 function registerC2(){if(c2Registered)return;c2Registered=true;onceAdventure('C2','ANGELES CREST · 3 A.M.','cars',{arrive:{env:'crest',actors:{left:'rich'},title:'ANGELES CREST · 3 A.M.',lines:[B.N('Headlights far ahead. Taillights in the fog. The lead car is never shown.')],minigame:{id:'C2',params:()=>({build3C2:true,course:'angeles_crest',car:RACars.toTouge(RALife.ownedCars()[0]||{}),rain:true,tandem:{rival:'',role:'lead',threshold:3000}}),next:(A,r)=>r.quit?'left':r.outcome==='win'?'note':'left'}},note:{lines:[B.N('The lights pull over and park. At the guardrail, only a note.'),B.N('“rematch after you’re famous. — L.”')],end:{outcome:'win',fx:()=>update({c2Won:true}),memory:{text:'chased the lights at Angeles Crest',lane:'cars'}}},left:{end:{outcome:'left',memory:{text:'the lights in the fog',lane:'cars'}}}},()=>on('C2')&&!state().c2Won&&RALife.ownedCars().length>0);}
 function wakeC2(){const n=Math.max(Number(life().laura.ledger)||0,Number(RALife.flag('lauraLedger'))||0);if(!on('C2'))return;if(n>=5)B.once('C2:5',()=>RALife.text('C2','UNKNOWN NUMBER','ok. you got me. — L',{id:'C2:5',choices:[{label:'BROTHER. REMATCH?',say:'brother. rematch?'}]}));if(n>=7&&!state().c2Won){registerC2();B.discover('C2');B.once('C2:7',()=>RALife.mail({id:'C2:7',kind:'people',title:'',body:'Laura invites Rich to a race at Angeles Crest at 3 a.m.'}));}}
 if(B.state().discovered.C2)registerC2();B.wake('C2',96,wakeC2);RAPlaces.define([{id:'C2',label:'ANGELES CREST · 3 A.M.',order:33,when:()=>on('C2')&&!!B.state().discovered.C2&&!state().c2Won,adventure:'C2'}]);
 function c3People(){const close=RARelations.known().filter(p=>!p.catalog.family).sort((a,b)=>(b.points||0)-(a.points||0))[0]?.id;return state().c3Leaning==='messy'?['tristan']:[...new Set(['tristan','june','uncle_sunday',...(close?[close]:[]),'nneka'])];}
 const defeat=RADefeat.apply;RADefeat.apply=function(p){const r=defeat(p);if(on('C3')&&day()>30&&!state().c3Due&&!state().c3Done)update({c3Due:day()+1,c3Leaning:RALife.leaning(),badNight:day()});return r;};
 function wakeC3(){if(!on('C3')||state().c3Due!==day()||state().c3Done||state().c3Day===day())return false;const pending=RALife.flag('pendingBloodBank');update({c3Day:day(),c3People:c3People(),c3Bill:pending||null});RALife.setFlag('pendingBloodBank',null);RALife.setFlag('a17Pending',null);registerC3();B.discover('C3');if(state().c3Leaning==='messy'){const t={...life().phone.threads},f=[...(t.family||[])];if(f.length)f[f.length-1]={...f.at(-1),answered:false,choices:[...(f.at(-1).answered?[]:(f.at(-1).choices||[])),{label:'i miss y’all',say:'i miss y’all',c3:true}]};else f.push({id:'C3:family',from:'RICH',text:'',day:day(),read:true,choices:[{label:'i miss y’all',say:'i miss y’all',c3:true}]});RAState.patch('life.phone.threads',{...t,family:f});}return true;}
 let c3Registered=false;function registerC3(){if(c3Registered)return;c3Registered=true;onceAdventure('C3','WHO SHOWS UP','people',{room:{env:'bedroom',actors:()=>({left:'rich',...Object.fromEntries((state().c3People||['tristan']).map((id,i)=>[`C3-${i}`,{id,state:'neutral',x:[34,238,67,204,135][i%5],y:420-Math.floor(i/5)*90}]))}),lines:()=>state().c3Leaning==='messy'?[B.N('Tristan is here with food.'),B.S('tristan',"you got a lot of people who know you and not a lot who show up. i'm here though."),B.N('Then the cat.')]:[B.N('Food. A spray bottle. A plate.'),B.N('The people closest to Rich. Everyone talks over each other. The sphynx cat is on his chest.'),...(state().c3People.includes('nneka')?[B.N('Nneka arrives last with the bill. She tears it up.')]:[])],end:{outcome:'visited',fx:()=>update({c3Done:true}),memory:{text:'the people who showed up',lane:'people'}}}},()=>on('C3')&&state().c3Day===day()&&!state().c3Done);}
 B.wake('C3',24,wakeC3);B.wake('C3-company',91,()=>{if(on('C3')&&state().c3Day===day())RALife.setFlag('bedroomCompany',null);const f=life().phone.threads.family;if(f&&state().c3Day&&day()>=state().c3Day+7)RAState.patch('life.phone.threads',{...life().phone.threads,family:f.map(m=>m.choices?.some(c=>c.c3)?{...m,choices:m.choices.filter(c=>!c.c3)}:m)});});RAWakeTriggers.define([{adventure:'C3',priority:94,when:()=>on('C3')&&state().c3Day===day()&&!state().c3Done}]);if(B.state().discovered.C3)registerC3();
 const company=RABedroomCompany.render;RABedroomCompany.render=function(layer){company(layer);if(!on('C3')||state().c3Day!==day())return;const cv=document.createElement('canvas');cv.width=270;cv.height=480;cv.dataset.c3='';Object.assign(cv.style,{position:'absolute',inset:'0',width:'100%',height:'100%',imageRendering:'pixelated',pointerEvents:'none',zIndex:'4'});const g=cv.getContext('2d');g.imageSmoothingEnabled=false;const images=[];const add=(src,x,y)=>{if(!src)return;const img=new Image();img.src=src;images.push({img,x,y});img.addEventListener('load',draw,{once:true});};function draw(){g.clearRect(0,0,270,480);for(const p of images)if(p.img.complete&&p.img.naturalWidth)g.drawImage(p.img,p.x,p.y);}for(const [i,id] of state().c3People.entries()){const p=RABtfPeople.get(id);add(p?.states?.neutral||p?.sprite,[40,230,65,205,135][i%5]-40,465-Math.floor(i/5)*90-88);}add(window.RAArtRegistry?.creatures?.cat?.states?.on_bed?.asset,159,328);draw();layer.append(cv);};
 function wakeC4(){if(on('C4')&&(life().creativeLife.music.cooked||[]).length>=8&&RALife.done('A55')&&RALife.done('A58')){update({c4Eligible:true});if(!RARadio.TRACKS.some(t=>t.id==='C4'))RARadio.TRACKS.push({id:'C4',title:'RICH ALUCARD × BRITNEY STAKES × ANFEESA — (untitled)',file:null,gate:()=>false,build3SourceRequired:true});}}
 B.wake('C4',46,wakeC4);
 function rainPassed(){const target=state().lauraTarget,spent=window.RAF06Rainmaker?.state?.().spent||0;if(!on('RM-S1')||!Number.isFinite(target)||spent<=target||state().lauraPassedDay===day())return false;update({lauraPassedDay:day(),lauraNext:spent+1});RALife.text('RM-S1','BIG BING','ok. i see you. — L',{id:`RM-S1:${day()}`});return true;}
 B.wake('RM-S1',47,()=>{if(on('RM-S1')&&state().lauraPassedDay<day()&&state().lauraNext!=null)update({lauraTarget:state().lauraNext,lauraNext:null});});
 function bingoCreate(seed=day(),saved){if(saved)return B.clone(saved);const rnd=RAPixel.rng(seed),shuffle=a=>{for(let i=a.length-1;i;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;},card=[];const cols=Array.from({length:5},(_,col)=>shuffle(Array.from({length:15},(_,i)=>col*15+i+1)).slice(0,5));for(let row=0;row<5;row++)for(let col=0;col<5;col++)card[row*5+col]=cols[col][row];return {card,called:[],deck:shuffle(Array.from({length:75},(_,i)=>i+1)),marked:[12],time:0,next:0,done:false,outcome:null};}
 function bingoLine(s){return Array.from({length:5},(_,r)=>Array.from({length:5},(_,c)=>r*5+c)).concat(Array.from({length:5},(_,c)=>Array.from({length:5},(_,r)=>r*5+c)),[[0,6,12,18,24],[4,8,12,16,20]]).some(line=>line.every(i=>s.marked.includes(i)));}
 function bingoTick(s,dt){if(s.done)return;s.time+=dt;while(s.time>=s.next&&s.deck.length){s.called.push(s.deck.shift());s.next+=1.2;}if(!s.deck.length){s.done=true;s.outcome=bingoLine(s)?'win':'lose';}}
 function bingoDab(s,i){if(s.done||i===12||!s.called.includes(s.card[i])||s.marked.includes(i))return false;s.marked.push(i);if(bingoLine(s)){s.done=true;s.outcome='win';}return true;}
 function bingoAward(result){if(!on('RM-S2'))return;const streak=result==='win'?(state().bingoStreak||0)+1:0;update({bingoStreak:streak});if(streak>=3)B.once('RM-S2:gold',()=>{update({goldBill:true,birthdayPending:true});RALife.addItem('RM-S2',1);});}
 function bingoMount(root,ctx){if(!on('RM-S2')||state().bingoDay!==day()||!B.state().discovered['RM-S2']){ctx.finish({quit:true,outcome:'refused'});return {dispose(){}};}const saved=ctx.progress(),key=`${day()}:${state().bingoStreak||0}`,s=bingoCreate(day()*91+(state().bingoStreak||0),saved.active?.key===key?saved.active.run:null),R=RAPixel,{canvas,ctx:g,toNative}=R.createCanvas(root);let dead=false,raf=0,last=performance.now(),savedAt=-1;const done=document.createElement('button');done.dataset.rmS2Done='';done.textContent='CONTINUE';Object.assign(done.style,{position:'absolute',top:'80%',left:'25%',width:'50%',minHeight:'44px'});done.hidden=!s.done;root.append(done);let terminal=false;
  function save(){ctx.saveProgress({active:{key,run:B.clone(s)}});savedAt=s.time;}
  canvas.addEventListener('pointerdown',e=>{const p=toNative(e.clientX,e.clientY),col=Math.floor((p.x-30)/42),row=Math.floor((p.y-150)/42);if(col>=0&&col<5&&row>=0&&row<5){bingoDab(s,row*5+col);save();}});done.addEventListener('click',()=>{terminal=true;ctx.saveProgress({active:null});ctx.finish({outcome:s.outcome,data:{called:s.called.length}});});
  function frame(t){if(dead)return;const dt=Math.min(.1,(t-last)/1000);last=t;if(!document.hidden)bingoTick(s,dt);if(s.time-savedAt>=1||s.done&&savedAt!==s.time)save();R.rect(g,0,0,270,480,'#15132b');R.text(g,'BINGO',135,25,{size:14,align:'center'});R.text(g,`CALL ${s.called.at(-1)||'—'}`,135,70,{size:13,align:'center',color:'#c18b3c'});R.text(g,`STREAK ${state().bingoStreak||0}`,135,110,{size:8,align:'center'});for(let i=0;i<25;i++){const x=30+i%5*42,y=150+Math.floor(i/5)*42;R.rect(g,x,y,39,39,s.marked.includes(i)?'#c18b3c':'#333046');R.text(g,i===12?'FREE':s.card[i],x+20,y+14,{size:8,align:'center'});}if(s.done){done.hidden=false;R.text(g,s.outcome==='win'?'BINGO!':'ROUND OVER',135,375,{size:10,align:'center'});}raf=requestAnimationFrame(frame);}raf=requestAnimationFrame(frame);return {dispose(){if(!terminal)save();dead=true;cancelAnimationFrame(raf);done.remove();}};}
 RAMinigames.register('RM-S2',{title:'RM-S2',mount:bingoMount});let rm2Registered=false;function registerRM2(){if(rm2Registered)return;rm2Registered=true;B.define({id:'RM-S2',title:'THE BING · BINGO NIGHT',lane:'weird',repeatable:true,start:'round',available:()=>on('RM-S2')&&state().bingoDay===day(),nodes:{round:{env:'f15_bing',actors:{left:'rich'},minigame:{id:'RM-S2',next:(A,r)=>{if(r.quit)return 'left';bingoAward(r.outcome);return state().birthdayPending?'birthday':'again';}}},again:{choices:[{label:'ANOTHER ROUND',next:'round'},{label:'LEAVE THE TABLE',next:'left'}]},birthday:{lines:[B.N('Granny Bing stops calling. Over her glasses: O-1.'),B.N('Not on any card. Rich’s birthday.'),B.N('The dancers go quiet. She says he reminds her of someone she danced for in 1924. A tarnished gold bill.')],end:{outcome:'gold',fx:()=>update({birthdayPending:false}),memory:{text:'Granny Bing’s number',lane:'weird'}}},left:{end:{outcome:'left',memory:{text:'bingo night at the Bing',lane:'weird'}}}}});}
 function enterBingo(){update({bingoDay:day()});registerRM2();B.discover('RM-S2');}
 const emerald=RAAdventures.get('F15_EMERALD_L3');if(emerald){const n=emerald.nodes.bing,old=n.enter;RAAdventures.define({...emerald,nodes:{...emerald.nodes,bing:{...n,enter:A=>{old?.(A);if(on('RM-S2'))enterBingo();}}}});}
 if(B.state().discovered['RM-S2'])registerRM2();RAPlaces.define([{id:'RM-S2',label:'THE BING · BINGO NIGHT',order:28,when:()=>on('RM-S2')&&state().bingoDay===day(),adventure:'RM-S2'}]);
 function golden(dancer,result){if(!on('RM-S2')||!state().goldArmed||!state().goldBill||result?.kind!=='hit'||!result.active||!window.RAF15?.isDancer(dancer)||!RALife.consume('RM-S2'))return false;update({goldBill:false,goldArmed:false,goldHearts:{...state().goldHearts,[dancer]:true}});return true;}
 if(window.RAF15){const pr=RAF15.progress,st=RAF15.status;RAF15.progress=function(d){const p=pr(d);return on('RM-S2')&&state().goldHearts?.[d]?{...p,thresholdLevel:4,toNext:0,availableLevel:p.next,goldHearts:true}:p;};RAF15.status=function(id){const p=RAF15.parse(id);if(on('RM-S2')&&p&&state().goldHearts?.[p.dancer]&&RAF15.enabled()&&!RALife.done(id)&&p.level===RAF15.completedLevel(p.dancer)+1){if(RAF15.capReached())return {ok:false,code:'capped'};if(id==='F15_ROSALYN_L1'&&RALife.money()<RAF15Tunables.MONEY.rosalynL1RichHalf)return {ok:false,code:'funds',need:RAF15Tunables.MONEY.rosalynL1RichHalf-RALife.money()};return {ok:true,code:'ready',goldHearts:true};}return st(id);};const av=RAF15.available;RAF15.available=id=>on('RM-S2')&&state().goldHearts?.[RAF15.parse(id)?.dancer]?RAF15.status(id).ok:av(id);}
 if(window.RAF15Club){const open=RAF15Club.open;RAF15Club.open=function(opts){const c=open(opts),spent=c.onSpend,close=c.close;let gold=null;if(on('RM-S2')&&state().goldBill){gold=document.createElement('button');gold.className='btn';gold.textContent='GOLD BILL';gold.dataset.rmS2Gold='';gold.addEventListener('click',()=>{update({goldArmed:true});gold.textContent='GOLD BILL · READY';});opts.shadow.querySelector('.f15-bar')?.after(gold);}c.onSpend=function(p){spent(p);golden(c.selected(),p.result);rainPassed();if(gold&&!state().goldBill)gold.remove();c.refresh();};c.close=function(){gold?.remove();close();};return c;};}
 let rm3Registered=false;function registerRM3(){if(rm3Registered)return;rm3Registered=true;B.define({id:'RM-S3',title:'I CAN SAVE HER · BRUNCH',lane:'dating',repeatable:true,start:'who',available:()=>on('RM-S3')&&window.RAF15?.enabled()&&RAF15.dancers().some(d=>RAF15.completedLevel(d)===4&&!state().brunch?.[d]),nodes:{who:{env:'brunch',actors:{left:'rich'},choices:()=>RAF15.dancers().filter(d=>RAF15.completedLevel(d)===4&&!state().brunch?.[d]).map(d=>({label:RAF15Tunables.NAMES[d],fx:A=>A.set('dancer',d),next:'check'}))},check:{actors:A=>({left:'rich',right:A.vars.dancer}),lines:A=>[B.N('Rich reaches for the check. She has already paid.'),B.N(`At the bottom of the receipt: ${RALife.fmt(RAF15.spent(A.vars.dancer))}. The exact amount Rich spent on her at the Bing.`),B.N('“thanks for the laundromat.”'),B.R("damn i been part of somebody’s business plan")],end:{outcome:'paid',fx:A=>update({brunch:{...state().brunch,[A.vars.dancer]:true}}),memory:{text:'the brunch bill',lane:'dating'},receipt:A=>({id:A.vars.dancer,caption:`${RALife.fmt(RAF15.spent(A.vars.dancer))}\nthanks for the laundromat.`,vp:false})}}}});}
 function wakeRM3(){if(on('RM-S3')&&window.RAF15?.enabled()&&RAF15.dancers().some(d=>RAF15.completedLevel(d)===4&&!state().brunch?.[d])){registerRM3();B.discover('RM-S3');}}
 B.wake('RM-S3',48,wakeRM3);if(B.state().discovered['RM-S3'])registerRM3();RAPlaces.define([{id:'RM-S3',label:'I CAN SAVE HER · BRUNCH',order:28,when:()=>on('RM-S3')&&!!B.state().discovered['RM-S3']&&RAAdventures.available('RM-S3'),adventure:'RM-S3'}]);
 B.S10={state,update,helpClear,mamaEligible,no1Eligible,no1After,canopy,crafted,badNight,wakeC1,stew,mom,wakeC2,registerC2,c3People,wakeC3,registerC3,wakeC4,rainPassed,bingoCreate,bingoTick,bingoDab,bingoLine,bingoAward,enterBingo,golden,wakeRM3,registerRM3};
});





RABuild3Stages.push(function(B){
 'use strict';
 for(const id of ['P1','P2','P3','P4','P5','P6','P7']){RAFeatures.register({id:`BUILD3.${id}`,fragment:'BUILD3',description:id});RAFeatures.set(`BUILD3.${id}`,true);B.codes.push(id);}
 const state=()=>B.state().p||{},update=v=>B.patch('p',{...state(),...v}),day=()=>RALife.today().day;
 const on=id=>B.enabled(id),active=()=>RAFeatures.enabled('F04.war_room')&&RAFrag.read('F04','active',false),roster=()=>window.RACrew?.list({fragment:'F04'})||[];
 const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const draft=(code,key,bindings={})=>{const row=window.RABuild3DraftedLines?.rows.find(r=>r.code===code&&r.key===key);if(!row)return null;const text=row.text.replace(/\{\{(\w+)\}\}/g,(_,k)=>bindings[k]??'');return row.speaker==='rich'?B.R(text):B.S(row.speaker,text);};
 const offer=id=>{B.discover(id);return id;};
 function score(protect=0,feed=0){if(!on('P1')||!active())return false;update({protect:(state().protect||0)+protect,feed:(state().feed||0)+feed});return true;}
 function mole(){const counts=state().jobsByCrew||{};return roster().filter(u=>u.meta?.recruit&&u.status!=='GONE').sort((a,b)=>(counts[b.id]||0)-(counts[a.id]||0)||a.id.localeCompare(b.id))[0]?.id||null;}
 function detect(reason){if(!on('P2')||!active()||!state().moleStarted||state().moleResolved||state().moleDetected)return false;update({moleDetected:true,moleDetection:reason});offer('P2');return true;}
 function startMole(){if(!on('P2')||!active()||state().moleStarted||(state().jobs||0)<8)return false;update({moleStarted:true,moleId:mole(),moleDay:day()});return true;}
 function resolveMole(choice){if(!active()||!state().moleDetected||state().moleResolved)return false;const id=state().moleId;if(choice==='plate'&&!RALife.count('jollof'))return false;if(choice==='cut'){if(id&&RACrew.get(id)?.status!=='GONE')RAWAR().setGone(id,{reason:'P2'});for(const d of RAWarRoomDistricts.activeIds())RAWarRoomDistricts.tickPressure(d);}else if(choice==='plate'){RALife.consume('jollof',1);if(id&&RACrew.get(id)?.status!=='GONE')RAWAR().setGone(id,{reason:'P2:plate'});update({truceUntil:day()+5});}else if(choice==='fake'){update({baitPending:true});}else return false;update({moleResolved:choice});return true;}
 const RAWAR=()=>window.RAWarRoomCrew;
 function maziOffer(){const u=window.RACrew?.get('young_mazi');if(!on('P3')||!active()||state().maziChoice||state().maziOffered||u?.status!=='ACTIVE'||Object.keys(u.stories||{}).length<3)return false;update({maziOffered:true});offer('P3');return true;}
 function maziChoice(choice){if(!active()||!state().maziOffered||state().maziChoice)return false;if(!['yes','no','ride'].includes(choice))return false;update({maziChoice:choice,maziDay:day()});if(choice==='yes'){RACrew.story('young_mazi','P3_ran_it_solo','RAN IT SOLO');update({captureAfter:day()+2});}if(choice==='no')update({sulkUntil:day()+3});if(choice==='ride')RAHeat.add(15,{source:'P3'});return true;}
 function maziGone(atWake=false){if(!on('P3')||state().maziChoice!=='yes'||RACrew.get('young_mazi')?.status!=='GONE'||state().maziShades)return false;update({maziShadesDay:day()+(atWake?0:1),maziShades:true});return true;}
 function requestConfig(req){if(!active()||!['P1','P2','P3','P4','P5'].some(on)||!String(req.requestId).startsWith('f04:'))return null;const s=state(),type=req.job.f04Type,fate=RALife.flag('coffeFate');return {audit:on('P1')||on('P2')||on('P3')||on('P4')||on('P5'),wrong:on('P2')&&!s.moleResolved&&(s.moleStarted||(s.jobs||0)>=7)&&['RE_UP','COLLECT'].includes(type)?type:null,moleId:s.moleId||null,chewer:on('P2')&&!!s.moleStarted&&!s.moleResolved,bait:on('P2')&&s.baitPending===true&&type==='BAIT',maziAim:RACrew.get('young_mazi')?.stories?.P3_rich_came_for_me?20:s.sulkUntil>day()?-1:0,maziExtract:on('P3')&&s.maziCaptured&&type==='EXTRACT'&&req.job.captive?.ids.includes('young_mazi'),coffeExiled:on('P4')&&fate==='exiled'&&!s.coffeExiledResolved&&type==='TAKE_THE_BLOCK',coffeCover:on('P4')&&fate==='doubleAgent'&&!s.coffeCoverUsed&&s.coffeWarned?.id===req.job.district&&type==='RETALIATION',detroit:req.build3P5===true,detroitGift:on('P5')&&!!s.detroitDone&&RALife.hasCar('P5-car')};}
 function record(req,res){
  if(!active()||!res||res.status!=='COMPLETE'||!RAPlayContract.validateResult(res).ok||state().seen?.[res.requestId])return false;
  const audit=res.build3Audit||{},ids=res.crew.map(x=>x.id),counts={...(state().jobsByCrew||{})};for(const id of ids)counts[id]=(counts[id]||0)+1;
  update({seen:{...state().seen,[res.requestId]:true},jobs:(state().jobs||0)+1,jobsByCrew:counts});
  if(on('P1')){let p=0,f=0;if(req.job.f04Type==='EXTRACT')p++;if(res.crew.every(x=>!['CAPTURED','GONE','DEAD'].includes(x.after)))p++;if(audit.pullSaved&&audit.pullSavedIds?.length)p++;if(audit.approach==='LOUD')f++;if(audit.greed)f++;f+=res.crew.filter(x=>['CAPTURED','GONE','DEAD'].includes(x.after)).length;score(p,f);}
  startMole();
  if(on('P2')&&req.build3S11?.wrong&&audit.wrongEvent&&!state().moleDetailPosted){const key=req.job.f04Type==='RE_UP'?'post.reup':'post.collect',row=draft('P2',key);if(row){RAVampGram.post({id:'P2:detail',handle:'whosrunninLA',text:row[1],imageCode:'P2-detail'});update({moleDetailPosted:true,moleDetailJob:req.job.f04Type,moleDetailRequest:res.requestId});}}
  if(on('P2')&&state().moleId&&ids.includes('dre')&&ids.includes(state().moleId)&&audit.phone)detect('phone');
  if(on('P2')&&audit.chewerTalk)detect('chewer');
  if(on('P2')&&req.build3S11?.bait&&res.outcome.win&&audit.concealStarted)update({baitPending:false,baitDone:true,baitRequest:res.requestId});
  if(on('P4')&&audit.coffeTalk&&!state().coffeExiledResolved){update({coffeExiledTalked:true});offer('P4-EXILED');}
  if(on('P4')&&req.build3S11?.coffeCover&&audit.coverStarted)update({coffeCoverUsed:true,coffeCoverRequest:res.requestId});
  if(on('P5')&&res.car?.id==='P5'&&req.build3S11?.detroitGift&&!res.car.lost)RAVehicles.recordDrive('P5-car',{by:1});
  if(on('P3')&&state().maziChoice==='yes'){
   if(state().maziCaptured&&req.job.f04Type==='EXTRACT'&&req.job.captive?.ids.includes('young_mazi')){
    if(res.rescued.includes('young_mazi')){RACrew.story('young_mazi','P3_rich_came_for_me','RICH CAME FOR ME');update({maziSaved:true,maziCaptured:false});}
    else{RAWAR().setGone('young_mazi',{reason:'P3:extract'});maziGone();}
   }else if(!state().maziCaptured&&!state().maziSaved&&day()>=state().captureAfter&&ids.includes('young_mazi')&&RACrew.get('young_mazi')?.status!=='GONE'){
    RAWAR().setCaptured('young_mazi',{reason:'P3'});update({maziCaptured:true});
   }
  }
  maziOffer();return true;
 }
 function receive(req,res){if(res?.status==='COMPLETE'&&active()){const pending={...state().pendingResults,[req.requestId]:{req:B.clone(req),res:B.clone(res)}};update({pendingResults:pending});}}
 function flush(){for(const [id,r] of Object.entries(state().pendingResults||{}))if(RAFrag.read('F04',`play.consumed.${id}`,null)){record(r.req,r.res);const pending={...state().pendingResults};delete pending[id];update({pendingResults:pending});}}
 // OL-050 private data seam. Accepted F01 presentation, input timing and native menus stay unchanged.
 const P=window.RAShowdown?.play;if(P){const launch=P.launch;P.launch=async function(req,opts={}){const config=requestConfig(req);if(!config)return launch(req,opts);const privateReq={...req,build3S11:{...config,detroit:config.detroit||state().detroitRunning===true&&req.job.f04Type==='TAKE_THE_BLOCK'&&req.job.district==null},...(config.detroitGift?{garage:{...req.garage,owned:[...new Set([...req.garage.owned,'P5'])]}}:{})};const result=await launch(privateReq,{...opts,...(!opts.transport&&typeof document.createElement==='function'?{transport:transport}: {})});receive(privateReq,result);return result;};}
 if(window.RAWarRoomPlay){const old=RAWarRoomPlay;window.RAWarRoomPlay={...old,launch:async(...a)=>{const r=await old.launch(...a);flush();return r;},resume:async(...a)=>{const r=await old.resume(...a);flush();return r;},consume:(...a)=>{const r=old.consume(...a);flush();return r;}};}
 if(window.RAWarRoomJobs){const old=RAWarRoomJobs;window.RAWarRoomJobs={...old,applyRunResult(r){const out=old.applyRunResult(r);if(r&&active()&&r.approach==='LAY_LOW')score(1,0);return out;},initiateHandBack(){const r=old.initiateHandBack();if(r.ok)queueFinal('hand-back');return r;}};}
 function transport(req){return new Promise(resolve=>{const frame=document.createElement('iframe');frame.id='f01-play-frame';frame.title='THE PLAY';frame.src='assets/sealed/play/index.html?embed=1'+String(window.location.search||'').replace(/^\?/,'&');frame.style.cssText='position:fixed;inset:0;width:100%;height:100%;border:0;z-index:2147483000;background:#000';let done=false;const origin=window.location.origin,finish=res=>{if(done)return;done=true;clearTimeout(timer);window.removeEventListener('message',listen);frame.remove();resolve(res);},listen=e=>{if(e.origin!==origin||e.source!==frame.contentWindow||!e.data)return;if(e.data.type==='F01.play_ready'){clearTimeout(timer);frame.contentWindow.postMessage({type:'F04.play_request',request:req},origin);}if(e.data.type==='F01.play_result')finish(e.data.result);};const timer=setTimeout(()=>finish({schema:RAPlayContract.RESULT_SCHEMA,version:RAPlayContract.VERSION,requestId:req.requestId,status:'REFUSED',code:'PLAY_UNAVAILABLE',cash:{gain:0,spent:0}}),20000);window.addEventListener('message',listen);document.body.append(frame);});}
 function detroitEligible(){if(!on('P5')||!active()||state().detroitDone)return false;const ids=RAWarRoomDistricts.activeIds(),held=ids.length===3&&ids.every(id=>{const d=RADistricts.get(id);return d?.state==='CONTROLLED'&&d.holder==='rich'&&Number.isFinite(d.since)&&day()-d.since>=3;});return held||roster().filter(u=>u.status==='ACTIVE'&&Object.keys(u.stories||{}).length>=2).length>=6;}
 function detroitOffer(){if(!detroitEligible())return false;offer('P5');return true;}
 function detroitAward(){if(!on('P5')||state().detroitDone||!state().detroitWon)return false;update({detroitDone:true,detroitDay:day(),detroitRunning:false});RALife.addGun('legendary_draco');RALife.addCar({id:'P5-car',make:'',model:'THE DECEMBER',short:'THE DECEMBER',color:'#151018',power:9,grip:4,weight:8,driftEase:6,style:1.5,wheelsBonus:.15,acquisitionSource:'P5',parts:{}});B.activity('P5');return true;}
 const toTouge=RACars.toTouge;RACars.toTouge=car=>on('P5')&&car?.id==='P5-car'&&state().detroitDone?'P5':toTouge(car);
 if(window.RAMinigameLogic?.touge?.cars)RAMinigameLogic.touge.cars.P5={power:9,grip:4,weight:8,driftEase:6,style:1.5,manual:true,color:'#151018'};
 if(!RAEnvironments.get?.('P5-LOC'))RAEnvironments.register({id:'P5-LOC',name:'DETROIT',base:1,floorY:390,placeholder:true,paint:{seed:'P5',sky:'#131220',wall:'#272536',floor:'#d4d6dd',horizon:290,props:[{type:'rect',x:26,y:96,w:6,h:245,color:'#b6a97f'},{type:'circle',x:29,y:98,r:17,color:'#e6b15d'},{type:'rect',x:233,y:108,w:6,h:232,color:'#b6a97f'},{type:'circle',x:236,y:110,r:16,color:'#e6b15d'}]}});
 RAMinigames.register('BUILD3-P5',{title:'THE PLAY',mount(root,ctx){let dead=false;const run=async()=>{if(!detroitEligible()&&!state().detroitRunning){ctx.finish({quit:true,outcome:'refused'});return;}update({detroitRunning:true});const card=RAWarRoomJobs.buildJobCard({type:'TAKE_THE_BLOCK',district:null});card.id=`P5:${day()}`;const pending=RAWarRoomPlay.pending(),out=pending?await RAWarRoomPlay.resume():await RAWarRoomPlay.launch(card);if(dead)return;const win=!!out?.summary?.win;update({detroitWon:win,detroitRunning:false});ctx.finish({outcome:win?'win':out?.refused||!out?.ok?'refused':'lose',data:{requestId:out?.summary?.requestId||null}});};run().catch(e=>{if(!dead)ctx.finish({quit:true,outcome:'refused',data:{code:String(e.message||e)}});});return {dispose(){dead=true;}};}});
 B.define({id:'P5',title:'THE DETROIT RUN',lane:'street',repeatable:true,start:'lot',available:()=>on('P5')&&!state().detroitDone&&(detroitEligible()||state().detroitRunning),nodes:{lot:{env:'P5-LOC',actors:{left:'rich'},lines:[B.N('December offers one job outside LA: the source. Snow. A Detroit parking lot under sodium lights.'),B.N('The frozen lot makes every move past three tiles slide one extra tile.')],next:'play'},play:{minigame:{id:'BUILD3-P5',next:(A,r)=>r.quit?'wait':r.outcome==='win'?'gift':'wait'}},gift:{env:'P5-LOC',actors:{left:'rich'},lines:[B.N('The LEGENDARY DRACO: DECEMBER’S GIFT. A black 1970s Detroit muscle car: THE DECEMBER.')],end:{outcome:'won',fx:detroitAward,memory:{text:'the Detroit run. December’s gift.',lane:'street'},receipt:{caption:'WHO IS YOUNG PLAYMAKER'}}},wait:{end:{outcome:'wait',memory:{text:'the frozen lot. the job waits.',lane:'street'}}}}});
 B.wake('P5',67,detroitOffer);RADistricts.onChange?.(detroitOffer);RAPlaces.define([{id:'P5',label:'THE DETROIT RUN',order:30,when:()=>on('P5')&&!!B.state().discovered.P5&&!state().detroitDone,adventure:'P5'}]);
 function queueFinal(reason){if(!on('P6')||state().finalDone||state().finalPending||(!active()&&reason!=='hand-back'))return false;update({finalPending:true,finalReason:reason,finalGood:(state().protect||0)>=(state().feed||0)});offer('P6');return true;}
 function photo(){if(!on('P7')||!state().finalDone||state().photo)return false;const people=roster().map(u=>({id:u.id,name:u.name,gone:u.status==='GONE'}));RAVampGram.post({id:'P7:final',handle:'whosrunninLA',text:"LA got quiet. that don't mean it's over.",imageCode:'P7',portraits:people,comments:[{flag:'🇯🇵',anonymous:true}]});update({photo:true,photoRoster:people});return true;}
 function finishFinal(){if(!state().finalPending||state().finalDone)return false;update({finalPending:false,finalDone:true,finalDay:day()});RAFrag.patch('F04','active',false);RAFrag.patch('F04','offer.status','closed_fame');if(state().finalGood)RALife.addProp('P6-fur');photo();return true;}
 function wake(){if(active()){startMole();maziOffer();if(on('P6')&&(day()>=38||RALife.life().momentum.fameEligible))queueFinal(day()>=38?'day':'fame');if(on('P4')&&RALife.flag('coffeFate')==='forgiven'&&!state().coffeForgiven){update({coffeForgiven:true});offer('P4');}if(on('P4')&&RALife.flag('coffeFate')==='doubleAgent'&&!state().coffeWarned){const raid=RAWarRoomDistricts.activeIds().map(id=>({id,due:RAFrag.read('F04',`districts.${id}.retaliationDay`,null)})).find(x=>x.due===day()+2);if(raid){update({coffeWarned:raid});RALife.mail({id:'P4:warning',kind:'message',title:'COFFE',body:'A retaliation raid is two nights away.'});}}}if(state().maziShades&&day()>=state().maziShadesDay)RALife.addProp('P3-shades');flush();wrapPhone();}

 B.wake('P2',66,()=>{if(!on('P2')||!active()||!(state().truceUntil>day()))return;for(const id of RAWarRoomDistricts.activeIds()){const pending=RAFrag.read('F04',`districts.${id}.retaliationPending`,false),due=RAFrag.read('F04',`districts.${id}.retaliationDay`,null);if(pending||due!=null&&due<state().truceUntil){RAFrag.patch('F04',`districts.${id}.retaliationPending`,false);RAFrag.patch('F04',`districts.${id}.retaliationDay`,state().truceUntil);}}});
 B.wake('P6',97,wake);
 if(window.RAFame){const claim=RAFame.claimsWake;RAFame.claimsWake=function(){if(on('P6')&&(active()||state().finalPending)&&!state().finalDone&&RALife.life().momentum.fameEligible){queueFinal('fame');return false;}return claim();};}
 function wrapPhone(){const app=window.RAPhoneApps?.get('warRoom');if(!app||app._build3S11)return;app._build3S11=true;const render=app.render,action=app.onAction;app.render=function(sub,api){if(on('P6')&&state().finalDone){if(sub==='crew'||sub==='reports')return render(sub,api);return '<h1>WAR ROOM</h1><p>the map is still on the table.</p><button class="phone-button" data-phone-action="app:warRoom:crew">CREW</button><button class="phone-button" data-phone-action="app:warRoom:reports">REPORT CARDS</button>';}let text=render(sub,api);if(active()&&(!sub||sub==='board')){if(state().moleStarted&&!state().moleResolved)text+='<button class="phone-button" data-phone-action="do:warRoom:P2-count">OCTOPUS BRAIN</button>';if(state().moleDetected&&!state().moleResolved)text+='<button class="phone-button" data-phone-action="do:warRoom:P2">COUNT WHO’S NEVER HURT</button>';if(state().maziOffered&&!state().maziChoice)text+='<button class="phone-button" data-phone-action="do:warRoom:P3">YOUNG MAZI</button>';if(state().finalPending)text+='<button class="phone-button" data-phone-action="do:warRoom:P6">THE ROOF</button>';}return text;};app.onAction=async function(act,arg,api){if(on('P6')&&state().finalDone&&!['crew','reports'].includes(act)){api.refresh();return;}if(active()&&act==='handBack'&&on('P6')&&!state().finalDone){queueFinal('hand-back');await api.close();return RAAdventureScene.begin('P6');}if(act==='P2-count'){detect('december');await api.close();return RAAdventureScene.begin('P2',{node:'count'});}if(['P2','P3','P6'].includes(act)){await api.close();return RAAdventureScene.begin(act);}return action(act,arg,api);};}
 RAFeatures.onChange(wrapPhone);
 if(window.RACrew)RACrew.onChange(e=>{if(e.type==='story'&&e.id==='young_mazi')maziOffer();if(e.type==='status'&&e.id==='young_mazi'&&e.to==='GONE')maziGone(String(e.reason||'').startsWith('timer:'));});
 function moleLines(){const id=state().moleId,name=id&&RACrew.get(id)?.name,reason=state().moleDetection,lines=[];if(reason==='phone'){const row=draft('P2','detect.phone');if(row)lines.push(row);}if(reason==='chewer'&&name){const row=draft('P2','detect.chewer',{identity:name});if(row)lines.push(row);}return [...lines,B.N(name?`${name}. The recruit with the most jobs run.`:'An Open Mouth Gang lieutenant bribed a docks worker.')];}
 B.define({id:'P2',title:'COUNT WHO’S NEVER HURT',lane:'street',start:'fork',available:()=>on('P2')&&active()&&state().moleDetected&&!state().moleResolved,nodes:{count:{env:'throne',actors:{left:'rich'},lines:[B.S('december',"count who's never hurt.")],next:'fork'},fork:{env:'throne',actors:{left:'rich'},lines:moleLines,choices:[{label:'CUT HIM LOOSE',fx:()=>resolveMole('cut'),next:'end'},{label:'FEED HIM A FAKE',fx:()=>resolveMole('fake'),next:'end'},{label:'SEND HIM TO LIL SMACK WITH A PLATE',octopus:true,when:()=>RALife.count('jollof')>0,fx:()=>resolveMole('plate'),next:'end'}]},end:{end:{outcome:'resolved',memory:{text:'count who’s never hurt.',lane:'street'},home:B.R("yeah i counted")}}}});
 B.define({id:'P3',title:'YOUNG MAZI',lane:'people',start:'ask',available:()=>on('P3')&&active()&&state().maziOffered&&!state().maziChoice,nodes:{ask:{env:'throne',actors:{left:'rich',right:'young_mazi'},lines:()=>[B.N('Mazi asks to lead a job alone. No squad-mates.'),B.N('His car. His plan.'),draft('P3','ask')].filter(Boolean),choices:[{label:'YES',fx:()=>maziChoice('yes'),next:'solo'},{label:'NO',fx:()=>maziChoice('no'),next:'end'},{label:'RIDE WITH HIM',when:()=>RALife.ownedCars().length>0,fx:()=>maziChoice('ride'),next:'ride'}]},solo:{lines:[B.N('The job succeeds. RAN IT SOLO.')],next:'end'},ride:{env:'docks',actors:{left:'rich'},minigame:{id:'touge',params:()=>({course:'docks',car:RACars.toTouge(RALife.ownedCars()[0]),tandem:{rival:'YOUNG MAZI',role:'lead'}}),next:(A,r)=>r.quit?'end':'quiet'}},quiet:{actors:{left:'rich',right:'young_mazi'},lines:()=>[B.N('They drift together. The car goes quiet.'),...['quiet.01','quiet.02','quiet.rich'].map(key=>draft('P3',key)).filter(Boolean)],next:'end'},end:{end:{outcome:()=>state().maziChoice,memory:{text:'Mazi’s third story. his own plan.',lane:'people'},home:B.R("thats my brother")}}}});
 B.define({id:'P4',title:'COFFE',lane:'people',start:'listen',available:()=>on('P4')&&active()&&state().coffeForgiven&&!state().coffeDone,nodes:{listen:{env:'throne',actors:{left:'rich',right:'coffe'},lines:[B.N('Coffe begs to join the crew. December says no. Coffe finally listens to someone.')],end:{outcome:'listened',fx:()=>update({coffeDone:true}),memory:{text:'Coffe finally listened.',lane:'people'}}}}});
 function coffeChoice(choice){if(!on('P4')||!state().coffeExiledTalked||state().coffeExiledResolved)return false;if(choice==='recruit'){const r=RAWarRoomCrew.recruit({id:'p4_coffe_recruit',name:RABtfPeople.get('coffe')?.name||'COFFE',cls:'GHOST',source:'P4'});if(!r.ok)return false;}else if(choice!=='walk')return false;update({coffeExiledResolved:choice});return true;}
 B.define({id:'P4-EXILED',title:'COFFE',lane:'people',start:'fork',available:()=>on('P4')&&active()&&state().coffeExiledTalked&&!state().coffeExiledResolved,nodes:{fork:{env:'docks',actors:{left:'rich',right:'coffe'},lines:[B.N('Coffe has been talked down. An iced coffee. A small, sad, funny beat.')],choices:[{label:'LET HIM WALK',fx:()=>coffeChoice('walk'),next:'end'},{label:'BRING HIM IN AS A RECRUIT',when:()=>RAWarRoomCrew.allOgas().filter(u=>!u.meta?.onLoan).length<8,fx:()=>coffeChoice('recruit'),next:'end'}]},end:{end:{outcome:()=>state().coffeExiledResolved,memory:{text:'Coffe and the iced coffee.',lane:'people'}}}}});
 RAPlaces.define([{id:'P4-EXILED',label:'COFFE',order:31,when:()=>on('P4')&&!!B.state().discovered['P4-EXILED']&&!state().coffeExiledResolved,adventure:'P4-EXILED'}]);
 B.define({id:'P6',title:'THE PRODUCT',lane:'people',start:'roof',available:()=>on('P6')&&state().finalPending&&!state().finalDone,nodes:{roof:{env:'roof',actors:{left:'rich'},lines:()=>[B.N('Snow on the castle roof. December sits with Rich. No crew.'),B.N('The audition was real. It measured whether Rich protected his people or fed the machine.'),...(state().finalGood?[B.N('December offers him the whole West. Before Rich can answer: the vampires bought Blood X because it came from Rich — his story, his castle, his dragon, the kid who wouldn’t leave his people.'),B.S('december',"The product was never the blood, young man. It's you."),B.N('He leaves his white fur on the roof and walks into the snow without it.')]:[B.S('december','The product was you. And you sold it cheap.'),B.N('He leaves nothing. The snow stops.')]),B.R("i been here with my people")],next:'end'},end:{end:{outcome:()=>state().finalGood?'protect':'feed',fx:finishFinal,memory:{text:'December’s audition. the War Room stays on the table.',lane:'people',quality:2}}}}});
 RAWakeTriggers.define([{adventure:'P6',priority:99,when:()=>on('P6')&&state().finalPending&&!state().finalDone&&!window.RAFame?.claimsWake?.()}]);
 B.S11={state,update,score,mole,startMole,detect,resolveMole,moleLines,maziOffer,maziChoice,maziGone,requestConfig,record,receive,flush,coffeChoice,detroitEligible,detroitOffer,detroitAward,queueFinal,finishFinal,photo,wake,wrapPhone};
 wrapPhone();
});




RABuild3Stages.push(function(B){
 'use strict';
 // FINAL-A resolves tuples via linesFor; retain the existing authored presentation hooks.
 const nativeLinesFor=RAAdventures.linesFor;
 RAAdventures.linesFor=function(node){
  const active=RAAdventures.active();let lines=nativeLinesFor(node);if(!active)return lines;
  if(B.S13?.voice)lines=B.S13.voice(lines,active.id,node,RAAdventures.context());
  if(active.id==='H7'&&node==='booth'&&B.enabled('RM-S1')){
   const target=B.S10?.state().lauraTarget;
   if(Number.isFinite(target))lines=[...lines,B.N('WALL OF RAIN · LAURA '+RALife.fmt(target))];
  }
  return lines;
 };
 const C=window.RABuild3ArtCatalog;if(!C)throw Error('S12 ART_REQUIRED');
 const assets=Object.fromEntries(C.assets.map(a=>[a.file,a]));
 window.RAPresentationAssets=window.RAPresentationAssets||{};
 for(const a of C.assets)RAPresentationAssets[a.file]={width:a.width,height:a.height,sha256:a.sha256,anchor:a.anchor||[40,88],...(a.actor?{support:{y:a.bounds[3]+1,x1:a.bounds[0],x2:a.bounds[2]+1,threshold:16}}:{}),visible:[a.bounds[0],a.bounds[1],a.bounds[2]-a.bounds[0]+1,a.bounds[3]-a.bounds[1]+1],face:a.face||[32,Math.min(60,a.bounds[1]+4),16,14],faceSource:'derived',environment:!!a.environment,authority:'PRIVATE_CODE_FROZEN'};
 const people=RABtfPeople.get,env=RAEnvironments.get;
 function privateState(id,node=RAAdventures.active()?.node,adventure=RAAdventures.active()?.id){
  if(id==='ARC-X1'){if(adventure==='ARC-X'&&['collapse','fork','end'].includes(node))return 'withered';if(adventure==='ARC-X'&&['song','fight'].includes(node))return 'unmasked';if(node==='pitch'||adventure==='ARC-X'&&node==='arrive')return 'pitching';if(adventure==='ARC-X2'&&node==='entry')return 'cane_tap';return 'neutral';}
  if(id==='ARC-X2')return B.S2?.arc?.().resolved?'smiling':'neutral';
  if(id==='S04')return adventure==='S04'&&node==='beats'?'playing':'neutral';
  if(id==='S06'){const stage=B.S4?.state?.().driftwood?.stage==='young'?'young':'hatchling';return stage+'_neutral';}
  return null;
 }
 function h6Sprite(id){const p=people(id);return B.enabled('H6')&&RAAdventures.active()?.id==='H6'&&p?.adult&&(p.age||p.minAge||21)>=21?C.h6?.states?.[id]||null:null;}
 RABtfPeople.get=function(id){const p=people(id),a=C.actors[id],swim=h6Sprite(id);if(swim)return {...p,sprite:swim,states:{...p.states,swimwear:swim},privateCodeArt:true,frozenArt:true};if(!p||!a)return p;const state=privateState(id),sprite=a.states?.[state]||a.sprite,stage=id==='S06'?(B.S4?.state?.().driftwood?.stage==='young'?'young':'hatchling'):null;return {...p,...a,sprite,states:{...(a.states||{}),...(stage?a.stageStates?.[stage]:{})},privateCodeArt:true,frozenArt:true,lookApproval:assets[sprite]?.approval};};
 function environmentState(id){return id==='ARC-X-LOC'&&RAAdventures.active()?.id==='ARC-X'&&['collapse','fork','end'].includes(RAAdventures.active()?.node)?'collapse':'open';}
 RAEnvironments.get=function(id){const e=env(id),a=C.environments[id];return e&&a?{...e,...a,image:a.states?.[environmentState(id)]||a.image,cover:false,base:e.base||1,placeholder:false,privateCodeArt:true,frozen:true,approved:false}:e;};
 const src=id=>C.environments[id]?.image||null;
 const choices=RAAdventures.choicesFor;RAAdventures.choicesFor=function(id){const list=choices(id);if(RAAdventures.active()?.id==='G5'&&id==='sandwich')return list.map(v=>({...v,icon:src('G4')}));return list;};
 if(window.RAStores){const icon=RAStores.itemIcon;RAStores.itemIcon=function(item){return ['H8A','H8B','H8C'].includes(item.id)&&RALife.hasFit(item.id)?src(item.id):icon(item);};}
 function props(id,node){const p=[];if(id==='KITCHEN'&&node==='BUILD3-C1-memory'&&B.enabled('C1'))p.push({src:src('C1-SPOON'),x:103,y:355});if(id==='ARC-X1'&&['arrive','pitch'].includes(node))p.push({src:src('ARC-X-card'),x:135,y:232});if(id==='ARC-X3'&&node==='brochure')p.push({src:src('ARC-X-brochure'),x:135,y:272});if(id==='ARC-X4'&&['plan','hint'].includes(node))p.push({src:src('ARC-X-plan'),x:135,y:480});if(id==='ARC-X'&&['collapse','fork','end'].includes(node))p.push({src:src('ARC-X-collapse'),x:135,y:480});if(id==='P6'&&node==='roof')p.push({src:src('P6-snow'),x:135,y:480});if(id==='THRONE'&&node==='sit'&&B.enabled('P6')&&RALife.hasProp('P6-fur'))p.push({src:src('P6-fur'),x:135,y:355});
  if(id==='NEW_OGA_FINALE'&&['blessing','consigliere','takeover','BUILD3-NO-S2-call'].includes(node)&&B.enabled('NO-S3')&&RALife.life().newOga.m9TributedCar)p.push({src:src('NO-S3-canopy'),x:135,y:480});return p;}
 const enter=RAAdventures.enter;
 RAAdventures.enter=function(id){let r=enter(id);if(!r)return r;if(r.def.id==='KITCHEN'&&id==='BUILD3-C1-memory'&&B.enabled('C1')){if(!env('C1-LOC'))RAEnvironments.register({id:'C1-LOC',name:'',base:1,floorY:390,placeholder:false});RABtfPeople.byId['C1-N']={id:'C1-N',name:'GRANDMA',adult:true,minAge:21,dateable:false,kind:'person'};const actors={left:'rich',right:'C1-N'};RAAdventures.patchActive({env:'C1-LOC',actors});r={...r,env:'C1-LOC',actors};}const staged={};for(const[slot,spec]of Object.entries(r.actors||{})){const actor=typeof spec==='string'?spec:spec?.id,state=(typeof spec==='object'&&spec?.state)||privateState(actor,id,r.def.id);staged[slot]=state?{...(typeof spec==='string'?{id:spec}:spec),state}:spec;}r={...r,actors:staged};if(r.def.id==='P6'&&id==='roof'){RABtfPeople.byId['P6-D']={id:'P6-D',name:'MISTER DECEMBER',age:200,adult:true,dateable:false,kind:'person'};r={...r,actors:{left:{id:'rich',state:'hookah_seated'},right:{id:'P6-D',state:'seated'}}};}const extra=props(r.def.id,id);if(!extra.length)return r;const original=r.node.props;return {...r,node:{...r.node,props:A=>[...(typeof original==='function'?original(A):original||[]),...extra]}};};
 const render=RABedroomCompany.render;
 RABedroomCompany.render=function(layer){const value=render(layer),p=[];if(B.enabled('ARC-X')&&RALife.hasProp('ARC-X-rung'))p.push({src:src('ARC-X-rung'),x:212,y:294});if(B.enabled('ARC-X')&&RALife.hasProp('ARC-X-cane'))p.push({src:src('ARC-X-cane'),x:234,y:294});if(B.enabled('P6')&&RALife.hasProp('P6-fur'))p.push({src:src('P6-fur'),x:95,y:293});if(B.enabled('P3')&&RALife.hasProp('P3-shades'))p.push({src:src('P3-shades'),x:189,y:201});if(!p.length)return value;
  const cv=document.createElement('canvas');cv.width=270;cv.height=480;cv.dataset.build3Props='';Object.assign(cv.style,{position:'absolute',inset:'0',width:'100%',height:'100%',imageRendering:'pixelated',pointerEvents:'none',zIndex:'3'});const g=cv.getContext('2d');g.imageSmoothingEnabled=false;
  for(const o of p){const img=new Image();img.addEventListener('load',()=>g.drawImage(img,o.x-img.naturalWidth/2,o.y-img.naturalHeight),{once:true});img.src=o.src;}layer.append(cv);return value;};
 // One frame only on the authored private poses; no OPEN actor, screen or encounter is affected.
 if(typeof MutationObserver!=='undefined'){const seen=new WeakSet(),observer=new MutationObserver(()=>{const scene=document.querySelector('#adventureScene'),active=RAAdventures.active();if(scene){const on=active?.id==='ARC-X4'&&active.node==='plan';if(on&&!scene.dataset.build3CrewPhone){scene.dataset.build3CrewPhone='1';const choice=scene.querySelector('.adv-choices');if(choice){choice.dataset.build3CrewPhone='1';Object.assign(choice.style,{left:'9%',right:'9%',bottom:'8%',maxHeight:'62%',padding:'5px',background:'#25213a',border:'2px solid #545061'});}}else if(!on&&scene.dataset.build3CrewPhone){delete scene.dataset.build3CrewPhone;const choice=scene.querySelector('[data-build3-crew-phone]');if(choice){delete choice.dataset.build3CrewPhone;for(const key of ['left','right','bottom','maxHeight','padding','background','border'])choice.style[key]='';}}}for(const el of document.querySelectorAll('img[data-actor="G1"]')){if(seen.has(el))continue;seen.add(el);const a=assets[el.getAttribute('src')];if(!['loom','forge'].includes(a?.state))continue;
   const trigger=()=>{el.style.filter='drop-shadow(1px 0 #f04c68) drop-shadow(-1px 0 #38a1c5)';el.style.clipPath='polygon(0 0,100% 0,100% 46%,98% 46%,98% 48%,100% 48%,100% 100%,0 100%)';requestAnimationFrame(()=>{el.style.filter='';el.style.clipPath='';});};if(el.complete)trigger();else el.addEventListener('load',trigger,{once:true});}});observer.observe(document.body,{childList:true,subtree:true});}
 function portraitSource(id){const p=people(id),registry=window.RAArtRegistry?.characters?.[id],sources=[p?.states?.portrait,registry?.states?.portrait,p?.states?.neutral,registry?.states?.neutral,p?.sprite,registry?.anchor];for(const source of sources){if(source&&!source.startsWith('assets/sealed/')&&/FROZEN|APPROVED MASTER/.test(RAPresentationAssets[source]?.authority||''))return source;}const cls=window.RACrew?.get?.(id)?.class||'TALKER';return C.p7?.portraits?.[id]||C.p7?.classes?.[cls]||C.p7?.classes?.TALKER||null;}
 function tablePhoto(post){const cv=document.createElement('canvas');cv.width=270;cv.height=300;const g=cv.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#493830';g.fillRect(0,0,270,300);g.fillStyle='#241d27';g.fillRect(8,8,254,284);
  const roster=post.portraits||[],loads=roster.map((u,i)=>new Promise(resolve=>{const source=portraitSource(u.id);if(!source){resolve();return;}const img=new Image();img.onload=()=>{const a=RAPresentationAssets[source],f=a?.face||a?.visible||[24,20,32,40],x=15+i%4*63,y=22+Math.floor(i/4)*84,w=Math.min(f[2],48),h=Math.min(f[3],60),scale=Math.max(1,Math.min(3,Math.floor(Math.min(48/w,60/h))));g.fillStyle='#a58b69';g.fillRect(x-2,y-2,53,67);g.drawImage(img,f[0],f[1],w,h,x+Math.floor((48-w*scale)/2),y+5,w*scale,h*scale);if(u.gone){g.fillStyle='#18141b';g.fillRect(x,y+38,48,4);g.fillRect(x+32,y+39,4,20);}resolve();};img.onerror=resolve;img.src=source;}));return Promise.all(loads).then(()=>cv.toDataURL('image/png'));}
 const app=RAPhoneApps.get('vampgram');if(app){const old=app.render;app.render=function(...args){const html=old(...args),post=RAVampGram.feed().find(p=>p.id==='P7:final');if(!B.enabled('P7')||!post)return html;
  tablePhoto(post).then(data=>{const el=document.querySelector('[data-build3-photo="P7"]');if(el)el.src=data;});const label=post.text.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));return html.replace(label+'<br><span class="phone-small">@ · </span>',label+'<br><span class="phone-small">🇯🇵</span>').replace(label,`<img data-build3-photo="P7" alt="" width="270" height="300" style="display:block;max-width:100%;image-rendering:pixelated">${label}`);};}
 B.S12={catalog:C,assets,src,props,tablePhoto,portraitSource,h6Sprite,privateState,environmentState};
});

RABuild3Stages.push(function(B){
 'use strict';for(const code of ['H1','H9']){RAFeatures.register({id:`BUILD3.${code}`,fragment:'BUILD3',description:code});RAFeatures.set(`BUILD3.${code}`,true);B.codes.push(code);}
 const state=()=>B.state().s13||{},update=v=>B.patch('s13',{...state(),...v}),life=()=>RALife.life();
 const core=window.RARC3?{}:{'A00:fall3':'Best we can shit.','A00:merge':"Shi. At least it’s something.",'A07:order':'…she a high-level hoe. I respect it.','A_SMACK2:arrive':"That’s some nasty shit, bro.",'A29C:coffefight':'I knew this brother was fake as fuck.'};
 function voice(lines,id,node,A={vars:{}}){if(!B.enabled('H1'))return lines;let used=false;const changed=(lines||[]).map(row=>{if(row?.[0]!=='rich')return row;if(core[id+':'+node]&&!used){used=true;return ['rich',core[id+':'+node],{...row[2],vp:false}];}return row;});const add=text=>changed.push(['rich',text,{vp:false}]);if(id==='A09'&&node==='back')add('Brother. Are they selling dragon eggs here? This is crazy.');if(id==='DATE'&&node==='arrive')add('Damn, you bad in person. This is crazy.');if(['A26','HOST'].includes(id)&&node==='surface'&&(A.vars.tier==='extra'||(A.vars.guests||[]).length>=3))add('These brothers don’t know me. They could never even comprehend me.');return changed;}
 const enter=RAAdventures.enter;RAAdventures.enter=function(node){const r=enter(node);if(!r||!B.enabled('H1'))return r;const lines=r.node.lines;return {...r,node:{...r.node,lines:A=>voice(typeof lines==='function'?lines(A):lines,r.def.id,node,A)}};};
 const complete=RAAdventures.complete;RAAdventures.complete=function(node){const a=RAAdventures.active(),r=complete(node);if(r&&B.enabled('H1')){let text=a?.id==='A57'?"That brother's chill.":a?.vars?.partyOutcome==='bad'?'Man, fuck that. Fuck that shit.':a?.vars?.fight==='lose'?((Number(life().combat.defeats)||0)%2?'You gotta let shit go. You gotta let shit go.':'Best we can shit.'):null;if(text)RAState.patch('life.clock.returnBeat',{speaker:'rich',text,vp:false,adventure:a.id,nightEnder:!!r.nightEnder});}return r;};
 const jdm=RACars.jdmMarkup;RACars.jdmMarkup=function(){const html=jdm();return B.enabled('H1')?html.replace(/(<b>(?:SILVIA S15|NISSAN SILVIA S15)<\/b>)/,'$1<p class="phone-speaker">RICH</p><p>Move like the Pope. Beautiful like a wedding day.</p>'):html;};
 function flood(){if(!B.enabled('SPK')||!life().momentum.fameFired)return null;if(state().flood)return state().flood;
  const s=B.state(),headlines=B.S1.sparkHeadlines(s.spark?.code,[...new Set(s.spark?.headlines||[])]),known=RARelations.known().filter(p=>p.id!=='M1').sort((a,b)=>(b.points||0)-(a.points||0)||a.id.localeCompare(b.id)),texts=known.slice(0,2).map(p=>({id:p.id,from:RABtfPeople.get(p.id)?.name||p.id,text:'u famous now??'}));
  texts.push({id:'uncle_sunday',from:'UNCLE SUNDAY',text:'have you eaten?'},{id:'vampgpt',from:'VampGPT',text:'oga. we got options now. too many.',vp:true});if(RARelations.met('M1'))texts.push({id:'M1',from:RABtfPeople.get('M1')?.name||'M1',text:'saw u got famous. still scared of me? 🐟'});
  const value={day:RALife.today().day,spark:s.spark?.code||null,headlines,texts,sourceRequired:headlines.length<3};update({flood:value});for(const [i,t]of texts.entries())RALife.text(t.id,t.from,t.text,{id:'S13:flood:'+i,vp:!!t.vp});
  // This is explicitly first AFTER the flood; the ledger does not create a visual or voice.
  if(B.enabled('C2')&&Math.max(Number(life().laura.ledger)||0,Number(RALife.flag('lauraLedger'))||0)>=7)B.once('C2:post-flood',()=>RALife.text('C2','UNKNOWN NUMBER','told you.',{id:'C2:post-flood'}));return value;
 }
 function cards(){const receipts=life().receipts||[],paris=receipts.find(r=>r.id==='H5:PARIS');return [...receipts.filter(r=>r.id!=='H5:PARIS').map((r,i)=>({...r,order:i})).sort((a,b)=>b.day-a.day||b.order-a.order),...(paris?[paris]:[])];}
 const approved=()=>B.enabled('H9')&&window.RABuild3HQApprovals?.H9==='APPROVED';
 function finish(button){update({endingPending:false,h9Done:approved()||state().h9Done,cardIndex:null});button.hidden=false;button.click();}
 function showCards(button,overlay){if(!approved()||state().h9Done)return finish(button);const list=cards(),index=state().cardIndex??0;button.hidden=true;const old=document.querySelector('[data-build3-h9]');old?.remove();const panel=document.createElement('button');panel.type='button';panel.dataset.build3H9='';Object.assign(panel.style,{position:'absolute',inset:'0',width:'100%',height:'100%',border:'0',background:'#08070f',color:'#f6efd9',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',font:'12px monospace',padding:'20px'});
  if(index<list.length){const r=list[index];if(r.image){const img=document.createElement('img');img.src=r.image;img.alt='';img.style.imageRendering='pixelated';panel.append(img);}const caption=document.createElement('span');caption.textContent=r.caption;panel.append(caption);panel.dataset.receipt=r.id;}else{const img=document.createElement('img');img.src=B.S12.src('H9');img.alt='';Object.assign(img.style,{width:'270px',maxWidth:'100%',imageRendering:'pixelated'});const caption=document.createElement('span');caption.textContent='you have and will always be enough.';caption.style.fontFamily='cursive';panel.append(img,caption);panel.dataset.lastPage='';}
  panel.addEventListener('click',()=>{if(index>=list.length){panel.remove();finish(button);}else{update({cardIndex:index+1});showCards(button,overlay);}},{once:true});for(const el of [panel,...panel.querySelectorAll('*')])for(const property of ['animation','transition','transform'])el.style.setProperty(property,'none','important');overlay.append(panel);
 }
 const native=RAFame.play;let live=false;
 RAFame.play=async function(){if(!B.enabled('SPK')&&!B.enabled('H9'))return native();if(live)return;live=true;try{const resume=life().momentum.fameFired&&state().endingPending;update({endingPending:true});await (resume?(state().phase==='credits'?RABuild3NativeFameReady():RABuild3NativeFameResume()):native());update({phase:'credits'});}finally{live=false;}};
 if(typeof MutationObserver!=='undefined'){const observer=new MutationObserver(()=>{if(B.enabled('H1')){const prompt=document.querySelector('.suggested-prompt');if(prompt&&prompt.textContent!=='bro, what we on?')prompt.textContent='bro, what we on?';for(const label of document.querySelectorAll('.phone-chat .phone-speaker'))if(label.textContent==='RICH'&&label.nextElementSibling?.textContent==='oga what do i do')label.nextElementSibling.textContent='bro, what we on?';}const overlay=document.querySelector('.fame-ending');if(!overlay||(!B.enabled('SPK')&&!B.enabled('H9')))return;const notification=overlay.querySelector('.fame-line');if(notification&&/10,000/.test(notification.textContent)&&!overlay.querySelector('[data-build3-flood]')){const f=flood();if(f){const box=document.createElement('div');box.dataset.build3Flood='';for(const text of [...f.headlines,...f.texts.map(t=>t.from+': '+t.text)]){const p=document.createElement('p');p.textContent=text;box.append(p);}overlay.append(box);}}
   const button=overlay.querySelector('.fame-continue');if(button&&!button.hasAttribute('data-build3-ending')){button.dataset.build3Ending='';const handler=e=>{button.removeEventListener('click',handler,true);if(!approved()||state().h9Done){update({endingPending:false,cardIndex:null});return;}e.stopImmediatePropagation();e.preventDefault();showCards(button,overlay);};button.addEventListener('click',handler,true);if(state().cardIndex!=null&&approved()){button.removeEventListener('click',handler,true);showCards(button,overlay);}}});observer.observe(document.body,{childList:true,subtree:true});
  document.addEventListener('ra:scene',e=>{if(e.detail?.id==='bedroom'&&state().endingPending&&life().momentum.fameFired&&!live&&!document.querySelector('.fame-ending'))RAFame.play();});
 }
 B.S13={state,update,voice,core,flood,cards,approved,showCards,finish};
});

RABuild3Stages.push(function(B){
 'use strict';const catalog=window.RABuild3AudioCatalog,delivery=window.RABuild3AudioOL050,rows=new Map(catalog.rows.map(r=>[r.id,r]));let engine=null,visit=0,scope=null;
 const aliases=new Map();for(const r of rows.values())if(r.type==='loop set'){const p=r.parts.find(p=>p.type==='one-shot');if(p)aliases.set(r.id+'_ENTRY',{...r,id:r.id+'_ENTRY',file:p.file,type:'one-shot',parts:[],variations:[]});}
 for(const r of delivery?.entries||[])aliases.set(r.id,r);
 function music(key,owner){return B.enabled(owner)?delivery?.music?.[key]||null:null;}
 function radio(key,owner){const t=music(key,owner);if(!t)return null;let row=RARadio.TRACKS.find(row=>row.id===t.id);if(!row){row={id:t.id,title:t.title,file:t.file,feel:'',home:owner,build3Audio:true};RARadio.TRACKS.push(row);}return row;}
 function get(){if(!engine)engine=RABuild3CreateAudio({schema:2.1,busDefaults:{MUSIC:.70,SFX:.90,UI:.60,VOICE:.80,AMBIENCE:.45},get:id=>aliases.get(id)||rows.get(id)||null,resident:[],scenes:{}});return engine;}
 async function play(id,owner,{loop=false,gain=1,entry=false}={}){if(!B.enabled(owner)||!window.RAAudio?.isUnlocked?.()||document.hidden)return false;const n=visit,e=get(),target=entry?id+'_ENTRY':id;e.unlock();await e.preload(target);if(n!==visit||document.hidden)return false;e.applyMix();const ok=loop?e.loop(target,{gain}):e.sfx(target,{gain});return ok;}
 function stop(){visit++;engine?.stopAll(600);engine?.restoreMusic(400);scope=null;}
 const starts={ 'ARC-X1:arrive':['SEAL_01','ARC-X'], 'ARC-X2:entry':['SEAL_02','ARC-X'], 'ARC-X:arrive':['SEAL_03','ARC-X',true], 'S01:arrive':['SEAL_04','S01',true], 'S02:arrive':['SEAL_05','S02',true], 'S05:dark':['SEAL_06','S05',true], 'S06:hatch':['SEAL_07','S06'], 'S07:arrive':['SEAL_08','S07',true], 'S08:intro':['SEAL_10','S08',true], 'M1:railing':['SEAL_11','M1'], 'KITCHEN:BUILD3-C1-memory':['SEAL_12','C1',true], 'H7:booth':['SEAL_09','H7',true], 'H2:laptop':['SEAL_14','H2'], 'H2:milestones':['SEAL_15','H2'], 'H2:released':['SEAL_16','H2'], 'H5:hills':['SEAL_18','H5',true] };
 if(delivery){starts['G3:arrive']=['GX_03','G9',true];starts['G5:platform']=['GX_01','G9',true];starts['G5:club']=['GX_02','G9'];starts['H5:hills']=['OL050_HOUSE','H5',true];starts['H5:home']=['OL050_MONTANA','H5'];}
 function cue(id,node){const spec=starts[id+':'+node];if(!spec)return false;if(scope!==id){stop();scope=id;}const [sound,owner,loop]=spec;if(!B.enabled(owner))return false;if(rows.get(sound)?.type==='loop set')play(sound,owner,{entry:true});play(sound,owner,{loop:!!loop,gain:loop?.3:1});if(id==='H7')play('SEAL_17','H7',{loop:true,gain:.2});return true;}
 const enter=RAAdventures.enter;RAAdventures.enter=function(node){const r=enter(node);if(r){if(r.def.id==='G3'&&node==='sermon')stop();else cue(r.def.id,node);}return r;};
 const complete=RAAdventures.complete;RAAdventures.complete=function(node){const a=RAAdventures.active(),r=complete(node);if(r&&a?.id===scope)stop();return r;};
 // Existing on-WAKE spawn writes are authoritative; audio observes the actual spawned day without changing chance or cash.
 B.wake('S14-H4',97,()=>{if(B.enabled('H4')&&B.S7.state().penguin?.day===RALife.today().day){scope='H4';play('SEAL_13','H4',{loop:true,gain:.2});}else engine?.stop('SEAL_13',600);});
 const render=window.RABedroomCompany?.render;if(render)RABedroomCompany.render=function(...args){const r=render.apply(this,args);if(B.enabled('H4')&&B.S7.state().penguin?.day===RALife.today().day&&!engine?.isPlaying('SEAL_13')){scope='H4';play('SEAL_13','H4',{loop:true,gain:.2});}return r;};
 for(const method of ['setVolume','setMuted','toggleMuted']){const original=window.RAAudio?.[method];if(typeof original!=='function')continue;RAAudio[method]=function(...args){const r=original.apply(this,args);engine?.applyMix();return r;};}
 if(typeof document.addEventListener==='function'){document.addEventListener('ra:scene',e=>{if(e.detail?.id!=='adventure'&&scope!=='H4')stop();if(e.detail?.id!=='bedroom'&&scope==='H4')stop();});document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});}
 B.S14={catalog,rows,starts,cue,play,stop,engine:()=>engine,scope:()=>scope,aliases,music,radio,delivery};
});

RABuild3Stages.push(function(B){
 'use strict';const H=B.S10,life=()=>RALife.life(),draft=(code,key)=>window.RABuild3DraftedLines?.rows.find(row=>row.code===code&&row.key===key),subtitle=key=>{const row=draft('C1',key);return row?['C1-N',row.text,{subtitle:true,vp:false,drafted:'DRAFTED-OL050'}]:null;};
 const kitchen=RAAdventures.get('KITCHEN');if(kitchen?.nodes['BUILD3-C1-memory']){const memory=kitchen.nodes['BUILD3-C1-memory'];RAAdventures.define({...kitchen,nodes:{...kitchen.nodes,'BUILD3-C1-memory':{...memory,lines:()=>[B.N('The cube is glowing. Rich crumbles it into a pot.'),B.N('A small, bright, loud kitchen in Nigeria, decades ago. Grandma is cooking.'),subtitle('subtitle.01'),B.N('She hands Rich a spoon. He tastes.'),subtitle('subtitle.02'),subtitle('subtitle.03'),B.R('real talk. that’s the best stew in the game.'),B.N('The castle kitchen returns. The pot is full.')].filter(Boolean)}}});}
 window.RAReplyFx=window.RAReplyFx||{};RAReplyFx.BUILD3_C2_OL050=function(){if(!B.enabled('C2')||H.state().c2DraftReplySent)return;const message=(life().phone.threads.C2||[]).find(message=>message.id==='C2:5');if(!message?.answered)return;const row=draft('C2','reply.rematch');if(!row)return;H.update({c2DraftReplySent:true});RALife.text('C2','UNKNOWN NUMBER',row.text,{id:'C2:5:OL050'});};
 function c2Reply(){if(!B.enabled('C2'))return;const thread=life().phone.threads.C2||[],index=thread.findIndex(message=>message.id==='C2:5');if(index<0||thread[index].answered||thread[index].choices?.[0]?.fx==='BUILD3_C2_OL050')return;const row=draft('C2','reply.rich'),choices=(thread[index].choices||[]).map((choice,i)=>i?choice:{...choice,say:row?.text||choice.say,fx:'BUILD3_C2_OL050'});RAState.patch('life.phone.threads',{...life().phone.threads,C2:thread.map((message,i)=>i===index?{...message,choices}:message)});}
 const wakeC2=H.wakeC2;H.wakeC2=function(...args){const result=wakeC2(...args);c2Reply();return result;};B.wake('OL050-C2',98,c2Reply);c2Reply();
 function c4Eligible(){return B.enabled('C4')&&(life().creativeLife.music.cooked||[]).length>=8&&RALife.done('A55')&&RALife.done('A58');}
 function c4(){if(!H.state().c4Eligible||!c4Eligible())return false;const selected=B.S14.music('C4','C4');if(!selected?.file)return false;const row=B.S14.radio('C4','C4');Object.assign(row,{file:selected.file,build3SourceRequired:false});delete row.gate;const songs=life().creativeLife.music.songs||[];if(!songs.some(song=>song.id==='C4'))RAState.patch('life.creativeLife.music.songs',[...songs,{id:'C4',trackId:'C4',day:RALife.today().day}]);const cover=B.S12.src('C4-cover');if(cover){window.RAArtRegistry=window.RAArtRegistry||{};RAArtRegistry.ui=RAArtRegistry.ui||{};RAArtRegistry.ui.radio=RAArtRegistry.ui.radio||{};RAArtRegistry.ui.radio.C4={asset:cover};}return true;}
 function c4Played(){const audio=document.querySelector('#soundtrack'),row=RARadio.TRACKS.find(row=>row.id==='C4');if(!c4Eligible()||!H.state().c4Eligible||!row?.file||!audio||audio.paused||!(audio.currentSrc||audio.src||'').endsWith(row.file))return false;return B.once('C4:played',()=>{B.activity('remix');H.update({c4PlayedDay:RALife.today().day});for(const[index,text]of ['who leaked the rich alucard collab','it leaked.','it’s everywhere.'].entries())RALife.mail({id:'C4:leak:'+index,kind:'music',title:'VAMPGRAM',body:text});});}
 const wakeC4=H.wakeC4;H.wakeC4=function(...args){const result=wakeC4(...args);c4();return result;};B.wake('OL050-C4',49,c4);if(H.state().c4Eligible)c4();
 const setTrack=RARadio.setTrack;RARadio.setTrack=function(id){const result=setTrack(id);if(id==='C4'&&c4Eligible()&&H.state().c4Eligible){const audio=document.querySelector('#soundtrack');audio?.play?.().then(c4Played).catch(()=>{});}return result;};const audio=document.querySelector('#soundtrack');audio?.addEventListener?.('play',()=>{if(RARadio.current()==='C4')c4Played();});
 function initializeLeader(){if(!B.enabled('RM-S1')||!window.RAF15?.enabled?.()||Number.isFinite(H.state().lauraTarget))return false;const initial=window.RABuild3BalanceOL050?.rainLeaderInitial;if(!Number.isFinite(initial))throw Error('OL050_RM_BALANCE_REQUIRED');H.update({lauraTarget:initial,lauraBalanceRuling:'OL-050'});return true;}
 const rainPassed=H.rainPassed;H.rainPassed=function(...args){if((window.RAF06Rainmaker?.state?.().spent||0)>0)initializeLeader();return rainPassed(...args);};
 if(window.RAF15Club?.open){const open=RAF15Club.open;RAF15Club.open=function(opts){initializeLeader();const club=open(opts),spend=club.onSpend;club.onSpend=function(...args){const result=spend.apply(this,args);H.rainPassed();return result;};return club;};}
 const enter=RAAdventures.enter;RAAdventures.enter=function(node){const result=enter(node);if(!result||result.def.id!=='H7'||node!=='booth'||!B.enabled('RM-S1'))return result;initializeLeader();if(!Number.isFinite(H.state().lauraTarget))return result;const lines=result.node.lines;return {...result,node:{...result.node,lines:A=>[...(typeof lines==='function'?lines(A):lines||[]),B.N('WALL OF RAIN · LAURA '+RALife.fmt(H.state().lauraTarget))]}};};
 function transcript(){if(!B.enabled('NO-S3')||!H.state().canopy)return false;const thread=life().phone.threads.gbenga||[],message=thread.find(message=>message.id==='NO-S3:final');if(!message||message.voiceNoteTranscript)return false;RAState.patch('life.phone.threads',{...life().phone.threads,gbenga:thread.map(message=>message.id==='NO-S3:final'?{...message,voiceNote:false,voiceNoteTranscript:true,voiceAudio:null,transcriptAuthority:'OL-050'}:message)});return true;}
 const canopy=H.canopy;H.canopy=function(...args){const result=canopy(...args);transcript();return result;};B.onComplete(transcript);transcript();
 B.OL050={draft,c2Reply,c4,c4Eligible,c4Played,initializeLeader,transcript};
});

RABuild3Stages.push(function(B){
 'use strict';
 // RC2 (OL-063 2a): coexistence of the NEW story (public rc2_story.js) with the sealed beats. The NEW story adjusts, the sealed beat never does (OL-040 pattern).
 // ASOEBI (owambe saturday, carson_owambe, day 8+) and sealed S07 (UNCLE SUNDAY'S 60TH, the same owambe) must not both be on offer at once:
 // while S07 is available or running, ASOEBI waits; once S07 is done ASOEBI opens as written.
 const s07Open=()=>{if(!B.enabled('S07'))return false;const active=RAAdventures.active?.();if(active?.id==='S07')return true;return !!RAAdventures.get('S07')&&!!RAAdventures.available('S07');};
 const asoebi=RAAdventures.get('ASOEBI');
 if(asoebi&&!asoebi._rc2Coexist){const original=asoebi.available;RAAdventures.define({...asoebi,_rc2Coexist:true,available:(...args)=>(typeof original==='function'?original(...args):true)&&!s07Open()});}

 // RC2 radio ships BLOODBATH and Ube's library as always-owned. The sealed ARC-X beat takes its master away on a failed signing: the new radio defers to it.
 window.RARadio?.hideWhen?.(id=>B.enabled('ARC-X')&&B.S2?.arc?.().master===id);
});

RABuild3Stages.push(function(B){
 'use strict';
 if(!window.RARC3)return;
 const policy=window.RARC3PrivatePolicy;
 const privateCodes={S01:'S01',S05:'S05',G5:'G5',G3:'G3',G7:'G7',H3:'H3',H7:'H7',H8:'H8',C3:'C3',P2:'P2',P5:'P5',P6:'P6','NO-S1':'NO-S1','RM-S2':'RM-S2','RM-S3':'RM-S3'};
 const hosts={S01:'texts',S05:'vampgpt',G5:'vampgpt',G3:'vampgpt',G7:'vampgpt',H3:'vampgpt',H7:'stripClub',H8:'vampgpt',C3:'vampgpt',P2:'warRoom',P5:'warRoom',P6:'warRoom','NO-S1':'warRoom','RM-S2':'stripClub','RM-S3':'stripClub'};
 for(const code of policy.patch)RAFeatures.set(`BUILD3.${code}`,false);
 const privateAllowed=id=>!!privateCodes[id]&&B.isPrivate(id)&&B.enabled(privateCodes[id]);
 const allowed=RARC3.allowed,canStart=RARC3.canStart;
 RARC3.allowed=id=>allowed(id)||privateAllowed(id);
 RARC3.canStart=(id,from)=>privateAllowed(id)||canStart(id,from);
 const available=id=>privateAllowed(id)&&!!B.state().discovered[id]&&RAAdventures.available(id);
 const start=async id=>{if(!available(id))return false;await RAPhone.close();return RAAdventureScene.begin(id,{from:`rc3-private:${hosts[id]}`});};

 // Exact sealed crafting choices move from a removed kitchen outing to the
 // brother's existing office. No cut public outing or public kitchen reward runs.
 const installGift=()=>{
  const d=RAAdventures.get('G3'),k=RAAdventures.get('KITCHEN');
  if(!d||d._rc3Gift||!k?.nodes['BUILD3-G4'])return;
  const old=d.nodes.office.choices;
  RAAdventures.define({...d,_rc3Gift:true,nodes:{...d.nodes,
   office:{...d.nodes.office,choices:A=>{const list=typeof old==='function'?old(A):[...old];return B.enabled('G4')&&RARelations.level('G1')>=3?[...list,{label:'MAKE THE FREE WILL',next:'rc3_gift'}]:list;}},
   rc3_gift:{...k.nodes['BUILD3-G4'],choices:A=>k.nodes['BUILD3-G4'].choices(A).map(c=>({...c,next:'rc3_gift_plate'}))},
   rc3_gift_plate:{...k.nodes['BUILD3-G4-plate'],next:'office'}
  }});
 };
 const gRegister=B.S5.register;
 B.S5.register=function(){const r=gRegister();installGift();return r;};
 B.wake('RC3-gift',90,installGift);installGift();

 // The kept LAN night already has the authored company and discussion. Give
 // the discussion a reachable entrance before a tee has been earned.
 const lan=RAAdventures.get('A50');
 if(lan){const back='sunrise';RAAdventures.define({...lan,nodes:{...lan.nodes,
  league:{...lan.nodes.league,next:()=>B.enabled('H8')?'rc3_topic':back},
  rc3_topic:{choices:[
   {label:'DOOM AS A WORLD-BUILDER',fx:A=>B.S7.rant(A,'DOOM','tristan'),next:'BUILD3-H8-rant'},
   {label:"BERSERK'S ART",fx:A=>B.S7.rant(A,'BERSERK','tristan'),next:'BUILD3-H8-rant'},
   {label:'ONE MORE TURN',fx:()=>B.S7.earnTee('CIV'),next:back}
  ]}
 }});}
 const define=B.define;
 B.define=function(d){
  if(d.id==='H8'){const n=RAAdventures.get('A50')?.nodes?.league;d={...d,nodes:{...d.nodes,arrive:{...d.nodes.arrive,env:n?.env||'cafe'}}};}
  if(d.id==='H7'&&!d._rc3Voice){const lines=d.nodes.booth.lines,enter=d.nodes.booth.enter;d={...d,_rc3Voice:true,nodes:{...d.nodes,booth:{...d.nodes.booth,enter:A=>{enter?.(A);A.set('h7Woman',null);A.set('h7Reaction',false);},lines:A=>[...(typeof lines==='function'?lines(A):lines||[]),...(B.enabled('H1')&&(B.S9.state().club?.paid||0)>=20000?[B.R('these brothers dont know me they couldnt even comprehend me')]:[])]}}};}
  if(d.id==='H3')d={...d,nodes:{...d.nodes,arrive:{...d.nodes.arrive,choices:d.nodes.arrive.choices.filter(c=>c.next!=='date')},date:{end:{outcome:'retired'}}}};
  return define(d);
 };
 B.onComplete(r=>{if(r.id==='A50'&&B.enabled('H8')&&B.S7.state().lastTee&&!B.S7.state().h8Done)B.discover('H8');});
 if(RAAdventures.get('H3'))B.define(RAAdventures.get('H3'));
 if(RAAdventures.get('H8'))B.define(RAAdventures.get('H8'));
 if(RAAdventures.get('H7'))B.define(RAAdventures.get('H7'));

 // Wake hooks used to rely on the cut general-purpose morning mail surface.
 // Kept Texts/VampGPT now expose only earned sealed invitations.
 function wake(){
  B.S3.wake01();B.S4.wake05();
  if(B.enabled('H3')){B.S7.registerH3();B.discover('H3');}
  if(B.enabled('H8')&&B.S7.state().lastTee&&!B.S7.state().h8Done)B.discover('H8');
 }
 B.wake('RC3-private-invites',996,wake);

 // Add earned options to kept apps without changing the nine tiles, twenty
 // public Maps entries, mission order, cash floor, or public routing policy.
 function decorate(){
  if(!window.RAPhone)return;
  const page=RAPhone.page(),host=page==='vampgpt'?'vampgpt':page.startsWith('app:')?page.split(':')[1]:null;
  if(!host||!RAPhone.isOpen())return;
  const root=document.querySelector('#phoneContent');if(!root)return;
  const ids=Object.keys(hosts).filter(id=>hosts[id]===host&&available(id));
  const existing=root.querySelector('[data-rc3-private-options]');
  const signature=ids.join('|')+(B.S4.state().mementoPlaced?'|placed':'');
  if(existing?.dataset.signature===signature)return;
  existing?.remove();
  const box=document.createElement('section');box.dataset.rc3PrivateOptions='';box.dataset.signature=signature;
  for(const id of ids){const button=document.createElement('button');button.type='button';button.className='phone-button';button.textContent=RAAdventures.get(id)?.title|| (id==='S05'?'THE LIGHTS WENT OUT':'AN INVITATION');button.dataset.rc3Private=id;box.append(button);}
  if(host==='vampgpt'&&!B.S4.state().mementoPlaced&&RALife.count('sensei_memento')){const b=document.createElement('button');b.type='button';b.className='phone-button';b.textContent='PLACE THE CORAL';b.dataset.rc3Coral='';box.append(b);}
  root.append(box);
 }
 if(typeof MutationObserver!=='undefined'){
  new MutationObserver(decorate).observe(document.querySelector('#phoneContent')||document.body,{childList:true,subtree:true});
 }
 document.addEventListener('click',async e=>{
  const b=e.target.closest?.('[data-rc3-private],[data-rc3-coral]');if(!b)return;
  e.preventDefault();e.stopImmediatePropagation();
  if(b.hasAttribute('data-rc3-coral')){B.S4.placeMemento();decorate();return;}
  await start(b.dataset.rc3Private);
 },true);

 // Paid booth and earned dancer scenes belong to the kept club, whose tile
 // remains direct. Present extras only after BACK returns to the phone.
 if(window.RAPhone){
  const refresh=RAPhone.refresh;
  RAPhone.refresh=function(...args){const r=refresh(...args);decorate();return r;};
  const openApp=RAPhone.openApp;
  RAPhone.openApp=function(...args){const r=openApp(...args);decorate();return r;};
 }
 // The club returns to HOME. Earned club invitations are also discoverable in
 // VampGPT, avoiding a fallback strip-club page that the direct tile skips.
 for(const id of ['H7','RM-S2','RM-S3'])hosts[id]='vampgpt';
 if(window.RAF15){const spend=RAF15.recordSpend;RAF15.recordSpend=function(dancer,amount){const r=spend(dancer,amount);if(r)decorate();return r;};}

 // Cut-host spark candidates stay archived, never synthesized. The kept PLAY
 // candidate and native New Oga fame floor remain intact.
 const candidates=B.S1.candidates;
 B.S1.candidates=()=>candidates().filter(c=>c.id==='P5');
 B.RC3={policy,hosts,privateCodes,privateAllowed,available,start,wake,decorate,installGift};
});

