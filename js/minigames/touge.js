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

 // ---- Courses ------------------------------------------------------------
 const COURSE_THEME={
  angeles_crest:{sky:'#233a6b',floor:'#3a4a3a',road:'#332f3f',stars:1,label:'ANGELES CREST'},
  docks:{sky:'#1c2433',floor:'#26302e',road:'#2c2d38',stars:0,label:'THE DOCKS'},
  grave_garage:{sky:'#17142c',floor:'#241f2e',road:'#2e2838',stars:0,label:'GRAVE GARAGE'}
 };
 function buildCourse(id,seed){
  const rng=(window.RAPixel&&RAPixel.rng)?RAPixel.rng(`${id}:${seed}`):(()=>{let s=(seed>>>0)||1;return()=>{s^=s<<13;s>>>=0;s^=s>>17;s^=s<<5;s>>>=0;return s/4294967296;};})();
  const tight=id==='grave_garage';
  const roadWidth=tight?128:172;
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
      clips.push({distance,x:x-seg.dir*(roadWidth/2-20),range:tight?24:32,dir:seg.dir,hit:false});
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
 window.RAMinigameLogic.touge={cars:CARS,computeHandling,scoreSlideFrame,clipBonus,nextChain,buildCourse,step};

 // ---- Rendering / mount ----------------------------------------------------
 if(typeof window.RAMinigames==='undefined'||typeof document==='undefined')return;

 const LESSON_WORD={1:'INITIATE.',2:'COUNTERSTEER.',3:'THROTTLE.',4:'CLIP.'};

 function mount(root,ctx){
  const P=ctx.params||{};
  const carId=CARS[P.car]?P.car:'s15';
  const parts=P.parts||{};
  const handling=computeHandling(carId,parts);
  const rain=!!P.rain;
  const tandem=P.tandem||null;
  const passengerName=P.passenger||null;
  const leaderboard=Array.isArray(P.leaderboard)?P.leaderboard:[];
  const lesson=P.lesson;
  const {canvas,ctx:c}=RAPixel.createCanvas(root);
  const prog=ctx.progress();
  let course=buildCourse(P.course&&COURSE_THEME[P.course]?P.course:'angeles_crest',P.seed||Math.floor(Math.random()*1e9));

  let state={heading:0,slideAngle:0,speed:0,x:0,distance:0,sliding:false,spinning:false};
  let score=0,chain=1,spins=0,maxAngleSeen=0,clipHits=0,wallCooldown=0,tandemScore=0;
  let phase='run',runElapsed=0,resultShown=null;
  let cleanTimer=0,rewardedClean=false;
  let lessonFlash={text:LESSON_WORD[lesson]||null,t:LESSON_WORD[lesson]?1.6:0};
  let lessonCounts={1:0,2:0,3:0,4:0};
  let episodeCounterOk=false,episodeThrottleOk=false,lastAbsAngle=0;
  let passengerBubble=null,passengerTimer=1.5+Math.random()*2;
  const PASSENGER_LINES=['nice line','whoa','my stomach','again again','DO A SPIN'];

  // ---- input -------------------------------------------------------------
  const input={steer:0,throttle:0,ebrake:false};
  const pointers=new Map();
  let ebrakeHeld=false,prevThrottleHeld=false,clutchKick=false;
  const EBRAKE_RECT={x:172,y:300,w:82,h:34};
  function toNative(clientX,clientY){const r=canvas.getBoundingClientRect();return{x:(clientX-r.left)*270/(r.width||270),y:(clientY-r.top)*480/(r.height||480)};}
  function inRect(p,rct){return p.x>=rct.x&&p.x<=rct.x+rct.w&&p.y>=rct.y&&p.y<=rct.y+rct.h;}
  function safeCapture(id){try{canvas.setPointerCapture&&canvas.setPointerCapture(id);}catch(e){}}
  function onDown(e){
   const p=toNative(e.clientX,e.clientY);
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
   pointers.delete(e.pointerId);
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
   if(phase==='results'&&(e.key==='Enter'||e.key==='r'))runItBack();
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
   input.steer=steer;input.throttle=throttle;input.ebrake=ebrakeHeld;
   clutchKick=handling.manual&&ebrakeHeld&&throttle>0.5&&!prevThrottleHeld;
   prevThrottleHeld=throttle>0.5;
  }

  // ---- run lifecycle -------------------------------------------------------
  function bestKey(){return `${course.id}:${carId}`;}
  function runItBack(){
   course=buildCourse(P.course&&COURSE_THEME[P.course]?P.course:'angeles_crest',Math.floor(Math.random()*1e9));
   state={heading:0,slideAngle:0,speed:0,x:0,distance:0,sliding:false,spinning:false};
   score=0;chain=1;spins=0;maxAngleSeen=0;clipHits=0;wallCooldown=0;tandemScore=0;
   runElapsed=0;phase='run';resultShown=null;cleanTimer=0;rewardedClean=false;
   lessonCounts={1:0,2:0,3:0,4:0};
   lessonFlash={text:LESSON_WORD[lesson]||null,t:LESSON_WORD[lesson]?1.6:0};
  }
  function endRun(){
   phase='results';
   const prev=ctx.progress();
   const best=Math.max(score,(prev.best&&prev.best[bestKey()])||0);
   const nextBest={...(prev.best||{}),[bestKey()]:best};
   ctx.saveProgress({best:nextBest,runs:(prev.runs||0)+1});
   resultShown={score,best,isNew:score>=best&&score>0};
  }
  const RESULT_BTN_BACK={x:20,y:400,w:110,h:36};
  const RESULT_BTN_DONE={x:150,y:400,w:100,h:36};
  function handleResultsTap(p){
   if(inRect(p,RESULT_BTN_BACK)){runItBack();return;}
   if(inRect(p,RESULT_BTN_DONE)){
    ctx.finish({outcome:tandem?(tandemScore>=(tandem.threshold||3000)?'win':'lose'):'done',score,
     summary:`${Math.round(score)} pts on ${course.theme.label}`,
     data:{course:course.id,car:carId,lessonPassed:lesson?lessonCounts[lesson]>=2:undefined,spins,maxAngle:Math.round(maxAngleSeen),tandemWin:tandem?tandemScore>=(tandem.threshold||3000):undefined}});
   }
  }

  // ---- update ---------------------------------------------------------------
  function update(dt){
   if(phase!=='run')return;
   readInput();
   const wasSliding=state.sliding;
   state=step(state,{steer:input.steer,throttle:input.throttle,ebrake:input.ebrake,clutchKick},dt,handling);
   const absAngle=Math.abs(state.slideAngle);
   maxAngleSeen=Math.max(maxAngleSeen,absAngle);
   if(state.sliding&&!state.spinning){
    score+=scoreSlideFrame(absAngle,state.speed,dt,handling.maxAngle)*chain;
    if(absAngle>30){cleanTimer+=dt;if(cleanTimer>1.5&&!rewardedClean){ctx.reward({memories:['first clean drift']});rewardedClean=true;}}
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
   if(state.spinning){spins++;chain=1;episodeCounterOk=false;episodeThrottleOk=false;}
   if(lesson&&LESSON_WORD[lesson]&&lessonCounts[lesson]===1&&lessonFlash.t<=0){lessonFlash={text:LESSON_WORD[lesson],t:1.1};}
   if(lessonFlash.t>0)lessonFlash.t-=dt;

   const centerX=course.xAt(state.distance);
   const dev=state.x-centerX;
   const half=course.roadWidth/2-8;
   if(Math.abs(dev)>half){
    if(wallCooldown<=0){chain*=0.7;wallCooldown=0.6;}
    state.x=centerX+clamp(dev,-half,half);
    state.speed*=0.85;
   }
   wallCooldown=Math.max(0,wallCooldown-dt);

   for(const clip of course.clips){
    if(clip.hit)continue;
    if(Math.abs(clip.distance-state.distance)<14&&state.sliding&&Math.abs(state.x-clip.x)<clip.range){
     clip.hit=true;clipHits++;lessonCounts[4]++;
     score+=clipBonus(chain);chain=nextChain(chain);
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
   if(state.distance>=course.length||runElapsed>90)endRun();
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
    if(sy>-20&&sy<500)drawCar(sx,sy,0,0,'#20c66b',0.85);
   }
   drawCar(screenXforWorld(state.x),carY,state.heading,state.slideAngle,handling.color,1);

   // HUD (avoid top-right 60x24 quit zone)
   RAPixel.text(c,`${Math.round(score)}`,6,4,{size:10,color:'#f6efd9'});
   RAPixel.text(c,`x${chain.toFixed(1)}`,6,18,{size:7,color:'#c18b3c'});
   RAPixel.text(c,`${Math.round(state.slideAngle)}°`,6,468,{size:7,color:Math.abs(state.slideAngle)>15?'#20c66b':'#6b6780',baseline:'bottom'});
   RAPixel.text(c,`${runElapsed.toFixed(0)}s`,264,468,{size:7,align:'right',baseline:'bottom',color:'#f6efd9'});
   if(passengerBubble&&passengerName){RAPixel.text(c,`${passengerName}: ${passengerBubble.text}`,135,40,{size:6,align:'center',color:'#ff6fb5'});}
   if(lessonFlash.t>0&&lessonFlash.text){RAPixel.text(c,lessonFlash.text,135,220,{size:12,align:'center',color:'#20c66b'});}
   RAPixel.rect(c,EBRAKE_RECT.x,EBRAKE_RECT.y,EBRAKE_RECT.w,EBRAKE_RECT.h,ebrakeHeld?'#d7193f':'#7d194b');
   RAPixel.text(c,'E-BRAKE',EBRAKE_RECT.x+EBRAKE_RECT.w/2,EBRAKE_RECT.y+EBRAKE_RECT.h/2-4,{size:7,align:'center',color:'#f6efd9'});

   if(phase==='results')drawResults();
  }
  function drawCar(x,y,heading,slide,color,alpha){
   c.save();c.globalAlpha=alpha;c.translate(Math.round(x),Math.round(y));c.rotate((heading-slide*0.4)*Math.PI/180);
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
   RAPixel.rect(c,RESULT_BTN_BACK.x,RESULT_BTN_BACK.y,RESULT_BTN_BACK.w,RESULT_BTN_BACK.h,'#f6efd9');
   RAPixel.text(c,'RUN IT BACK',RESULT_BTN_BACK.x+RESULT_BTN_BACK.w/2,RESULT_BTN_BACK.y+RESULT_BTN_BACK.h/2-4,{size:6,align:'center',color:'#10101b',shadow:null});
   RAPixel.rect(c,RESULT_BTN_DONE.x,RESULT_BTN_DONE.y,RESULT_BTN_DONE.w,RESULT_BTN_DONE.h,'#f6efd9');
   RAPixel.text(c,'DONE',RESULT_BTN_DONE.x+RESULT_BTN_DONE.w/2,RESULT_BTN_DONE.y+RESULT_BTN_DONE.h/2-4,{size:6,align:'center',color:'#10101b',shadow:null});
  }

  let raf=null,last=null;
  function loop(t){
   if(last==null)last=t;
   const dt=Math.min(0.05,(t-last)/1000);last=t;
   update(dt);draw();
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
   window.removeEventListener('keyup',onKeyUp);
  }};
 }

 window.RAMinigames.register('touge',{title:'TOUGE',mount});
})();
