(function(){
 // HOOKAH RINGS — hangout on the castle Hookah Roof at night. Not a score-chaser.
 const P=()=>window.RAPixel,palette=()=>P().palette;
 const TARGETS={moon:{x:210,y:70,r:22},antenna:{x:48,y:330,r:14}};
 // Presentation only: seated contact points for the frozen hookah states (Rich centre, company between him and the antenna).
 const SEATS={rich:[135,386],company:[90,388]};

 function makeRing(releaseSpeed,smoothness){
  releaseSpeed=Math.max(0,Math.min(1,releaseSpeed));smoothness=Math.max(0,Math.min(1,smoothness));
  const size=8+releaseSpeed*30;
  const wobble=smoothness<.4;
  const stability=wobble?smoothness*.5:smoothness;
  return {size,stability,wobble,age:0,x:135,y:400,vy:-(20+releaseSpeed*40)};
 }
 function ringPassesThrough(a,b){
  if(!a||!b)return false;
  if(a.wobble||b.wobble)return false;
  return a.size<b.size*0.92 && Math.abs((a.x||0)-(b.x||0))<10;
 }
 function stepRing(ring,dt){
  const r={...ring};
  r.age+=dt;
  r.y+=r.vy*(dt/1000);
  r.size+=(dt/1000)*(r.wobble?3:6);
  r.x+=r.wobble?Math.sin(r.age/120)*1.4:0;
  return r;
 }
 function hitsMoon(ring){
  if(!ring||ring.wobble)return false;
  const dx=ring.x-TARGETS.moon.x,dy=ring.y-TARGETS.moon.y;
  return Math.sqrt(dx*dx+dy*dy)<TARGETS.moon.r+ring.size*0.3;
 }
 function hitsAntenna(ring){
  if(!ring||ring.wobble)return false;
  const dx=ring.x-TARGETS.antenna.x,dy=ring.y-TARGETS.antenna.y;
  return Math.sqrt(dx*dx+dy*dy)<TARGETS.antenna.r+ring.size*0.3;
 }
 window.RAMinigameLogic=window.RAMinigameLogic||{};
 window.RAMinigameLogic.hookah={TARGETS,makeRing,ringPassesThrough,stepRing,hitsMoon,hitsAntenna};

 const COMPANY_LINES={
  BLLAD33:null,
  TRISTAN:{start:'"aaand he inhales... deep breath, folks."',stack:'"OH! THROUGH THE RING! CALL THE GAME!"',moon:'"IT HIT THE MOON. THE MOON, PEOPLE."',antenna:'"RIGHT OVER THE ANTENNA. UNREAL."'},
  ROOKOKO:{start:'"take your time."',stack:'"...nice."',moon:'"the moon says hi."',antenna:'"Don Chuy is gonna be mad."'},
  HOMIES:{start:'"run it back, run it back!"',stack:'"STACKED IT!! AYYYE"',moon:'"MOON RING MOON RING"',antenna:'"antenna boy!!"'},
  DATE:{start:'"okay okay, watch this."',stack:'*laughs* "wait how did you DO that"',moon:'"...did that just hit the moon?"',antenna:'*laughs* "poor taco truck."'}
 };

 window.RAMinigames.register('hookah',{title:'HOOKAH RINGS',mount(root,ctx){
  const {canvas,ctx:g}=P().createCanvas(root);
  const params=ctx.params||{};
  // No company param keeps the long-standing ROOKOKO line set; the Rookoko seated figure is drawn only when a beat
  // names ROOKOKO explicitly (the default-company visual is an open HQ decision: docs/art_integration/HQ_DECISIONS.md).
  const company=params.company||'ROOKOKO',namedCompany=params.company||null;
  const dateName=params.dateName||'her';
  const song=params.song||'MONTANA';
  const lines=COMPANY_LINES[company];
  const prog=ctx.progress();
  let bestStack=prog.bestStack||0,moonHits=prog.moonHits||0,antennaHits=prog.antennaHits||0;
  let sessionStack=0,rewarded=false,dead=false;

  let lung=0,inhaling=false,holdStart=0;
  let flick=[]; // recent pointer y samples while releasing for smoothness calc
  const rings=[]; // {ring, prevPassed}
  let lastRing=null;
  let toast=null,toastT=0;
  let bllad33Ring=null,bllad33T=0;
  let raf=null,lastT=performance.now();

  function toNative(x,y){const r=canvas.getBoundingClientRect();return {x:(x-r.left)*270/(r.width||270),y:(y-r.top)*480/(r.height||480)};}
  function say(id){ if(!lines)return; const txt=lines[id]; if(txt){toast=txt;toastT=performance.now();} }

  function onDown(e){
   if(dead)return;e.preventDefault();
   const t=e.touches?e.touches[0]:e;const n=toNative(t.clientX,t.clientY);
   if(n.y>436&&n.x>75&&n.x<195){finishUp();return;}
   inhaling=true;holdStart=performance.now();flick=[{y:n.y,t:performance.now()}];
   if(lung===0)say('start');
  }
  function onMove(e){
   if(!inhaling)return;const t=e.touches?e.touches[0]:e;const n=toNative(t.clientX,t.clientY);
   flick.push({y:n.y,t:performance.now()});if(flick.length>8)flick.shift();
  }
  function onUp(e){
   if(!inhaling||dead)return;e.preventDefault?.();
   inhaling=false;
   const releaseSpeed=lung;
   let smoothness=.8;
   if(flick.length>=2){
    let jitter=0;for(let i=1;i<flick.length;i++)jitter+=Math.abs((flick[i].y-flick[i-1].y));
    smoothness=Math.max(0,Math.min(1,1-jitter/60));
    const dy=flick[0].y-flick[flick.length-1].y;
    if(dy<4)smoothness=Math.min(smoothness,.25); // needs an upward flick
   }
   const ring=window.RAMinigameLogic.hookah.makeRing(releaseSpeed,smoothness);
   ring.x=135;
   if(lastRing&&window.RAMinigameLogic.hookah.ringPassesThrough(ring,lastRing)){
    sessionStack++;bestStack=Math.max(bestStack,sessionStack);ctx.saveProgress({bestStack,moonHits,antennaHits});say('stack');
   } else if(!ring.wobble) sessionStack=1; else sessionStack=0;
   rings.push(ring);lastRing=ring;lung=0;
   if(rings.length>6)rings.shift();
  }
  function finishUp(){
   if(!rewarded){rewarded=true;ctx.reward({memories:['hookah on the roof with '+company.toLowerCase()]});}
   ctx.saveProgress({bestStack,moonHits,antennaHits});
   ctx.finish({outcome:'done',score:sessionStack,data:{stack:sessionStack,moon:moonHits,antenna:antennaHits}});
  }
  canvas.addEventListener('pointerdown',onDown);canvas.addEventListener('pointermove',onMove);canvas.addEventListener('pointerup',onUp);canvas.addEventListener('pointercancel',onUp);
  canvas.addEventListener('touchstart',onDown,{passive:false});canvas.addEventListener('touchmove',onMove,{passive:false});canvas.addEventListener('touchend',onUp,{passive:false});

  function env(){
   return {sky:'#0c0f22',wall:null,floor:'#141224',horizon:340,seed:'hookah',stars:26,
    props:[
     {type:'circle',x:TARGETS.moon.x,y:TARGETS.moon.y,r:TARGETS.moon.r,color:'#eee7c8'},
     {type:'sign',x:10,y:16,w:250,h:20,text:'HOOKAH ROOF',size:7,color:'#1a1528',glow:palette().pink},
     {type:'text',x:135,y:44,text:'NOW PLAYING: '+song,size:6,color:palette().grey,align:'center'},
     {type:'rect',x:0,y:340,w:270,h:140,color:'#1c1930'},
     {type:'rect',x:TARGETS.antenna.x-1,y:TARGETS.antenna.y,w:2,h:60,color:'#3a3550'},
     {type:'circle',x:TARGETS.antenna.x,y:TARGETS.antenna.y,r:3,color:palette().red},
     {type:'text',x:TARGETS.antenna.x,y:TARGETS.antenna.y+62,text:"DON CHUY'S",size:5,color:palette().grey,align:'center'},
     {type:'lamp',x:40,y:120,r:14,glow:'rgba(255,220,140,.12)'},{type:'lamp',x:230,y:130,r:14,glow:'rgba(255,220,140,.12)'}
    ],crowd:0};
  }
  function drawRing(rp,ring,alpha){
   g.save();g.globalAlpha=Math.max(0,alpha);g.strokeStyle=ring.wobble?'rgba(255,255,255,.4)':'rgba(230,230,255,.85)';
   g.lineWidth=2;g.beginPath();g.ellipse(ring.x,ring.y,ring.size,ring.size*.4,0,0,Math.PI*2);g.stroke();g.restore();
  }
  function draw(){
   const now=performance.now();const dt=now-lastT;lastT=now;
   const rp=P(),pal=palette();
   rp.paintEnvironment(g,env());
   // Frozen seated states (ART SHIP 008) at native 1:1 on their contact point, seated on the roof above the score
   // lines and clear of the antenna target; placeholders only if art is unavailable.
   if(!rp.drawSprite?.(g,rp.personSprite?.('rich','hookah_seated'),SEATS.rich[0],SEATS.rich[1]))rp.drawActor(g,{top:'#111018',bottom:'#0d0c14',hairShape:'locs',shades:true,accent:pal.green},135,410,1.4);
   if(namedCompany==='ROOKOKO')rp.drawSprite?.(g,rp.personSprite?.('rookoko','hookah_seated'),SEATS.company[0],SEATS.company[1]);
   if(lines&&company==='DATE')rp.drawActor(g,{top:'#3a1f33',bottom:'#241830',hairShape:'long',accent:pal.pink},185,410,1.2);
   if(company==='BLLAD33'){
    bllad33T+=dt;
    if(!bllad33Ring||bllad33T>2600){bllad33Ring=window.RAMinigameLogic.hookah.makeRing(.7,1);bllad33Ring.x=SEATS.company[0];bllad33T=0;}
    else bllad33Ring=window.RAMinigameLogic.hookah.stepRing(bllad33Ring,dt);
    drawRing(rp,bllad33Ring,1-bllad33Ring.age/3000);
    if(!rp.drawSprite?.(g,rp.personSprite?.('bllad33','hookah_seated'),SEATS.company[0],SEATS.company[1]))rp.drawActor(g,{top:'#1a1a22',bottom:'#101014',hairShape:'hood',shades:true},60,415,1.1);
   }
   for(let i=rings.length-1;i>=0;i--){
    const r=rings[i]=window.RAMinigameLogic.hookah.stepRing(rings[i],dt);
    const alpha=1-r.age/3200;
    if(alpha<=0)continue;
    drawRing(rp,r,alpha);
    if(!r._checked&&r.age>60){
     r._checked=true;
     if(window.RAMinigameLogic.hookah.hitsMoon(r)){moonHits++;ctx.saveProgress({bestStack,moonHits,antennaHits});say('moon');}
     if(window.RAMinigameLogic.hookah.hitsAntenna(r)){antennaHits++;ctx.saveProgress({bestStack,moonHits,antennaHits});say('antenna');}
    }
   }
   if(inhaling)lung=Math.min(1,(now-holdStart)/1600);
   rp.rect(g,20,20,10,120,'#151228');rp.rect(g,22,138-lung*116,6,lung*116,pal.green);
   rp.text(g,'INHALE',25,150,{size:5,align:'center',color:pal.grey});
   rp.text(g,`STACK ${sessionStack}  BEST ${bestStack}`,135,392,{size:6,align:'center'});
   rp.text(g,`MOON ${moonHits}  ANTENNA ${antennaHits}`,135,405,{size:5,align:'center',color:pal.grey});
   if(toast&&now-toastT<2600)rp.wrap(g,toast,220,7).forEach((ln,i)=>rp.text(g,ln,135,200+i*12,{size:7,align:'center',color:pal.gold}));
   rp.frame(g,75,436,120,34,{fill:pal.bone});rp.text(g,"I'M GOOD",135,449,{size:7,align:'center',color:pal.ink});
   if(!dead)raf=requestAnimationFrame(draw);
  }
  raf=requestAnimationFrame(draw);
  return {dispose(){dead=true;if(raf)cancelAnimationFrame(raf);
   canvas.removeEventListener('pointerdown',onDown);canvas.removeEventListener('pointermove',onMove);canvas.removeEventListener('pointerup',onUp);canvas.removeEventListener('pointercancel',onUp);
   canvas.removeEventListener('touchstart',onDown);canvas.removeEventListener('touchmove',onMove);canvas.removeEventListener('touchend',onUp);
  }};
 }});
})();
