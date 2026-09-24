(function(){
 // PICKUP — 2v2 arcade half-court basketball at Venice Beach Courts, night.
 const P=()=>window.RAPixel,palette=()=>P().palette;

 function shotChance(meter,distance,contested){
  meter=Math.max(0,Math.min(1,meter));distance=Math.max(0,Math.min(1,distance));
  const timing=1-Math.abs(meter-1)*1.1; // best right at the top of the meter (meter=1)
  let chance=.15+Math.max(0,timing)*.75-distance*.25;
  if(contested)chance*=.6;
  return Math.max(.03,Math.min(.97,chance));
 }
 function aiStep(state,dt,rng){
  rng=rng||Math.random;
  const s={...state};
  s.t=(s.t||0)+dt;
  if(rng()<0.02+dt/4000)s.action=rng()<.5?'drive':'pass';
  else s.action=s.action||'hold';
  return s;
 }
 function scoreAfterShot(state,made,distance){
  const s={...state};
  if(made){
   const pts=distance>=.5?2:1;
   s.rich=(s.rich||0)+pts;
   s.lastPts=pts;
  } else s.lastPts=0;
  return s;
 }
 window.RAMinigameLogic=window.RAMinigameLogic||{};
 window.RAMinigameLogic.pickup={shotChance,aiStep,scoreAfterShot};

 const TALK=['"you can\'t guard me, blood."','"ball don\'t lie!"','"run that back after this one."','"soft. that was soft."','"that\'s game, that\'s game."'];

 window.RAMinigames.register('pickup',{title:'PICKUP',mount(root,ctx){
  const {canvas,ctx:g}=P().createCanvas(root);
  const params=ctx.params||{};
  const teammateName=params.teammate||'TRISTAN';
  const fresh=!!params.fresh;
  const filmed=!!params.filmed;
  const lilSmack=!!params.lilSmack;
  const prog=ctx.progress();
  let wins=prog.wins||0,losses=prog.losses||0;
  const rng=P().rng('pickup-'+(params.seed||Date.now()));

  let score={rich:0,them:0};
  let bloodDunkUsed=false,dead=false,ended=false;
  let holdStart=0,holding=false,meter=0,meterDir=1;
  let swipeStart=null,talk=null,talkT=0,ogInvite=false;
  let possession='us'; // us | them
  let flashT=0;
  let aiState={t:0,action:'hold'};
  let raf=null,lastT=performance.now();
  const start=performance.now();

  function toNative(x,y){const r=canvas.getBoundingClientRect();return {x:(x-r.left)*270/(r.width||270),y:(y-r.top)*480/(r.height||480)};}
  function say(t){talk=t;talkT=performance.now();}

  function attemptShot(){
   const distance=.2+rng()*.6;
   const contested=rng()<.4;
   let made;
   if(fresh&&!bloodDunkUsed&&meter>.85){bloodDunkUsed=true;made=rng()<.94;flashT=performance.now();}
   else made=rng()<window.RAMinigameLogic.pickup.shotChance(meter,distance,contested);
   score=window.RAMinigameLogic.pickup.scoreAfterShot(score,made,distance);
   if(made)say(TALK[Math.floor(rng()*TALK.length)]);
   possession=made?'them':(rng()<.5?'us':'them');
   checkEnd();
  }
  function teammatePass(){
   // tap = pass; small chance teammate scores on the give-and-go
   if(possession!=='us')return;
   const made=rng()<.4;
   if(made){score={...score,rich:score.rich}; score.them=score.them;} // teammate points don't count toward rich's personal tally
   say('"good look."');
   possession=rng()<.6?'us':'them';
  }
  function crossover(){
   if(possession!=='us')return;
   const beat=rng()<.65;
   if(!beat)possession='them';
   say(beat?'"ankles broken."':'"nice try."');
  }
  function vampireSteal(){
   if(possession!=='them')return;
   const success=rng()<.5;
   const foul=!success&&rng()<.35;
   if(success){possession='us';say('*fangs flash* "MINE."');}
   else if(foul){say('"c\'mon that\'s a foul!"');possession='them';}
   else say('"missed him."');
  }
  function opponentsTurn(dt){
   if(possession!=='them')return;
   aiState=window.RAMinigameLogic.pickup.aiStep(aiState,dt,rng);
   if(aiState.t>1400){
    aiState.t=0;
    const made=rng()<.45;
    score={...score,them:score.them+(made?(rng()<.4?2:1):0)};
    possession='us';
    if(made)say(TALK[Math.floor(rng()*TALK.length)]);
   }
  }
  function checkEnd(){
   if(score.rich>=11||score.them>=11){
    ended=true;const win=score.rich>score.them;
    if(win)wins++;else losses++;
    ctx.saveProgress({wins,losses});
    if(win)ctx.reward({clout:8,followers:filmed?20:0,memories:['won pickup at venice']});
    ogInvite=true;
   }
  }
  function finishRun(){
   ctx.saveProgress({wins,losses});
   ctx.finish({outcome:score.rich>score.them?'win':'lose',score:score.rich,data:{rich:score.rich,them:score.them}});
  }

  function onDown(e){
   if(dead)return;e.preventDefault();
   const t=e.touches?e.touches[0]:e;const n=toNative(t.clientX,t.clientY);
   if(ended){if(n.x>95&&n.x<175&&n.y>290&&n.y<324)finishRun();return;}
   swipeStart={x:n.x,y:n.y,t:performance.now()};
   if(n.y>420&&n.x>10&&n.x<95){vampireSteal();return;}
   if(n.y>420&&n.x>175&&n.x<260){finishRun();return;}
   holding=true;holdStart=performance.now();meter=0;meterDir=1;
  }
  function onMove(e){}
  function onUp(e){
   if(dead||ended)return;e.preventDefault?.();
   const t=e.changedTouches?e.changedTouches[0]:e;const n=toNative(t.clientX,t.clientY);
   const dx=swipeStart?n.x-swipeStart.x:0,dy=swipeStart?n.y-swipeStart.y:0,dt=swipeStart?performance.now()-swipeStart.t:999;
   if(holding){
    holding=false;
    if(Math.abs(dx)>26&&Math.abs(dx)>Math.abs(dy)&&dt<400){crossover();swipeStart=null;return;}
    if(dt<180&&Math.abs(dx)<12&&Math.abs(dy)<12){teammatePass();swipeStart=null;return;}
    attemptShot();
   }
   swipeStart=null;
  }
  canvas.addEventListener('pointerdown',onDown);canvas.addEventListener('pointerup',onUp);canvas.addEventListener('pointercancel',onUp);
  canvas.addEventListener('touchstart',onDown,{passive:false});canvas.addEventListener('touchend',onUp,{passive:false});

  function env(){
   return {sky:'#0a1226',wall:null,floor:'#33475a',horizon:300,seed:'venice',stars:10,
    props:[
     {type:'sign',x:20,y:14,w:230,h:20,text:'VENICE BEACH COURTS',size:6,color:'#0e1a12',glow:palette().green},
     {type:'rect',x:0,y:300,w:270,h:180,color:'#2b3f50'},
     {type:'rect',x:0,y:300,w:270,h:2,color:'rgba(255,255,255,.15)'},
     {type:'lamp',x:24,y:80,r:20,glow:'rgba(255,240,180,.18)'},{type:'lamp',x:246,y:80,r:20,glow:'rgba(255,240,180,.18)'},
     {type:'rect',x:128,y:100,w:14,h:60,color:'#1a1a22'},{type:'rect',x:120,y:96,w:30,h:4,color:'#e8e2cf'}
    ],crowd:6};
  }
  function draw(){
   const now=performance.now();const dt=now-lastT;lastT=now;
   opponentsTurn(dt);
   const rp=P(),pal=palette();
   rp.paintEnvironment(g,env());
   rp.drawActor(g,{top:'#111018',bottom:'#0d0c14',hairShape:'locs',shades:true,accent:pal.green},80,400,1.15);
   rp.drawActor(g,{top:'#213548',bottom:'#182430',hairShape:'spiky'},50,412,1.05);
   rp.drawActor(g,{top:'#3a1a1a',bottom:'#241212',hairShape:'short'},190,404,1.1);
   rp.drawActor(g,lilSmack?{top:'#4a4a1a',bottom:'#2a2a10',hairShape:'bald',height:.75,width:.85}:{top:'#1a3a2a',bottom:'#102418',hairShape:'hat'},220,414,1.05);
   rp.text(g,`RICH ${score.rich} — ${score.them} THEM`,135,50,{size:9,align:'center',color:pal.gold});
   rp.text(g,'w/ '+teammateName,135,64,{size:6,align:'center',color:pal.grey});
   if(holding){meter=Math.min(1,(now-holdStart)/900);
    rp.rect(g,20,360,10,90,'#151228');rp.rect(g,22,448-meter*80,6,meter*80,meter>.85?pal.gold:pal.green);
   }
   rp.rect(g,10,420,85,34,'rgba(215,25,63,.25)');rp.text(g,'STEAL',52,437,{size:6,align:'center'});
   rp.rect(g,175,420,85,34,'rgba(200,200,200,.15)');rp.text(g,'STOP',217,437,{size:6,align:'center'});
   rp.text(g,'TAP=PASS  HOLD-RELEASE=SHOOT  SWIPE=CROSS',135,470,{size:5,align:'center',color:pal.grey});
   if(fresh&&!bloodDunkUsed)rp.text(g,'BLOOD DUNK READY',135,80,{size:6,align:'center',color:pal.red});
   if(flashT&&now-flashT<300){g.save();g.globalAlpha=.35;g.fillStyle=pal.red;g.fillRect(0,0,270,480);g.restore();}
   if(talk&&now-talkT<2000)rp.wrap(g,talk,220,7).forEach((ln,i)=>rp.text(g,ln,135,110+i*12,{size:7,align:'center',color:pal.pink}));
   if(ended){
    rp.rect(g,20,150,230,180,'rgba(8,7,15,.9)');
    rp.text(g,score.rich>score.them?'YOU WON':'YOU LOST',135,180,{size:9,align:'center',color:score.rich>score.them?pal.green:pal.red});
    rp.text(g,`${score.rich} — ${score.them}`,135,205,{size:8,align:'center'});
    if(ogInvite)rp.wrap(g,'an OG on the sideline: "run it back?"',200,7).forEach((ln,i)=>rp.text(g,ln,135,235+i*12,{size:7,align:'center',color:pal.grey}));
    rp.frame(g,95,290,80,34,{fill:pal.gold});rp.text(g,'DONE',135,303,{size:7,align:'center',color:pal.ink});
   }
   if(!dead)raf=requestAnimationFrame(draw);
  }
  raf=requestAnimationFrame(draw);
  return {dispose(){dead=true;if(raf)cancelAnimationFrame(raf);
   canvas.removeEventListener('pointerdown',onDown);canvas.removeEventListener('pointerup',onUp);canvas.removeEventListener('pointercancel',onUp);
   canvas.removeEventListener('touchstart',onDown);canvas.removeEventListener('touchend',onUp);
  }};
 }});
})();
