(function(){
 'use strict';
 // F05 - THE TRAP - minigame_cook.js
 // THE TRAP sec.4 THE COOK: "Portrait lab bench at night. Three stations, ~60 seconds:
 //   1. BLEND - drag the base into the flask and hold to stir; a color gradient must land in the target band
 //   2. HEAT  - a thermometer climbs; tap the burner to pulse heat and keep the needle in the green
 //   3. BOTTLE- flick filled vials into a case; misses shatter and cost product."
 // Pure logic is exported on RAF05.cookLogic so it is testable headlessly; the canvas binding registers at boot.
 window.RAF05=window.RAF05||{};
 const R=window.RAF05;

 const BLEND={lo:0.55,hi:0.82};
 function blendScore(level){
  const v=R.util.clamp(Number(level)||0,0,1);
  if(v<BLEND.lo)return Math.round((v/BLEND.lo)*60);
  if(v>BLEND.hi)return Math.round(Math.max(0,100-(v-BLEND.hi)*300));
  return 100;
 }
 function heatScore(samples){
  const list=(samples||[]).map(v=>R.util.clamp(Number(v)||0,0,1));
  if(!list.length)return 0;
  const good=list.filter(v=>v>=0.6&&v<=0.85).length;
  return Math.round((good/list.length)*100);
 }
 function bottleScore(clean,misses){
  const c=Math.max(0,Math.trunc(Number(clean)||0)),m=Math.max(0,Math.trunc(Number(misses)||0));
  if(c+m===0)return 0;
  return Math.round(Math.max(0,(c/(c+m))*100-m*4));
 }
 function quality(parts){
  const b=blendScore(parts&&parts.blend),h=heatScore(parts&&parts.heat),t=bottleScore(parts&&parts.clean,parts&&parts.misses);
  return Math.round(0.34*b+0.33*h+0.33*t);
 }
 // Assistant repair: pulses add heat; the flask cools between pulses. Former UI never changed or sampled its needle.
 function heatStep(needle,dt,pulses=0){return R.util.clamp((Number(needle)||0)+Math.max(0,pulses)*0.12-Math.max(0,dt)*0.08,0,1);}
 R.cookLogic={BLEND,blendScore,heatScore,bottleScore,quality,heatStep};

 function env(){
  const pal=RAPixel.palette;
  return {sky:pal.night,wall:'#241d33',floor:'#1b1626',horizon:340,seed:'f05-cook',props:[
   {type:'sign',x:15,y:14,w:240,h:22,text:'THE COOK',size:8,color:'#140f1f',glow:pal.gold},
   {type:'counter',x:0,y:300,w:270,h:16},
   {type:'rect',x:24,y:120,w:52,h:150,color:'#2c2438'},
   {type:'rect',x:110,y:110,w:70,h:160,color:'#332a42'},
   {type:'rect',x:206,y:120,w:44,h:150,color:'#2c2438'}
  ]};
 }

 R.cookMinigame={title:'THE COOK',rule:'Hold to blend, tap to keep the heat steady, then tap each vial before it slips away.',mount(root,ctx){
  const params=ctx.params||{};
  const {canvas,ctx:g,toNative}=RAPixel.createCanvas(root);
  const pal=RAPixel.palette,rp=RAPixel;
  let stage='blend',dead=false,raf=null;
  let hold=false,holdStart=0,blend=0,heldPointer=null,keyHeld=false;
  let heatSamples=[],needle=0.4,heatStart=0,burner=0,heatSampleClock=0,lastFrame=performance.now();
  let vials=[],bottleStart=0,clean=0,misses=0,spawnAt=0;
  const HEAT_MS=8000,BOTTLE_MS=11000;
  let result=null;

  function startHeat(){stage='heat';heatStart=performance.now();needle=0.4;heatSamples=[];burner=0;heatSampleClock=0;lastFrame=performance.now();}
  function startBottle(){stage='bottle';bottleStart=performance.now();vials=[];clean=0;misses=0;spawnAt=0;}
  function finish(){
   const heat=heatSamples.slice();const q=quality({blend,heat,clean,misses});
   result={blend:blendScore(blend),heat:heatScore(heat),bottle:bottleScore(clean,misses),quality:q};
   const best=ctx.progress();ctx.saveProgress({bestQuality:Math.max(Number(best.bestQuality)||0,q)});
   ctx.finish({outcome:'done',quality:q,data:result,rewards:{}});
  }

  function pointer(e){const t=e.touches?e.touches[0]:e;const n=toNative(t.clientX,t.clientY);return n;}
  function onDown(e){
   if(dead||heldPointer!==null)return;e.preventDefault();heldPointer=e.pointerId;try{canvas.setPointerCapture(e.pointerId);}catch(_){}const n=pointer(e);
   if(stage==='blend'){hold=true;holdStart=performance.now();}
   else if(stage==='heat'){needle=heatStep(needle,0,1);burner=1;}
   else if(stage==='bottle'){
    for(const v of vials){if(v.done)continue;if(Math.abs(n.x-v.x)<22&&Math.abs(n.y-v.y)<22){v.done=true;clean++;return;}}
   }
  }
  function onUp(e){
   if(e.pointerId!==heldPointer)return;e.preventDefault?.();heldPointer=null;try{canvas.releasePointerCapture(e.pointerId);}catch(_){}if(dead)return;
   if(e.type==='pointercancel'){hold=false;return;}
   if(stage==='blend'&&hold){hold=false;blend=R.util.clamp((performance.now()-holdStart)/3000,0,1);stage='heat';startHeat();}
  }
  canvas.addEventListener('pointerdown',onDown);canvas.addEventListener('pointerup',onUp);canvas.addEventListener('pointercancel',onUp);
  function keyDown(e){if(dead||e.repeat||e.key!==' ')return;e.preventDefault();keyHeld=true;if(stage==='blend'&&!hold){hold=true;holdStart=performance.now();}else if(stage==='heat'){needle=heatStep(needle,0,1);burner=1;}else if(stage==='bottle'){const v=vials.filter(v=>!v.done).sort((a,b)=>b.y-a.y)[0];if(v){v.done=true;clean++;}}}
  function keyUp(e){if(e.key!==' '||!keyHeld)return;e.preventDefault();keyHeld=false;if(stage==='blend'&&hold){hold=false;blend=R.util.clamp((performance.now()-holdStart)/3000,0,1);startHeat();}}
  window.addEventListener('keydown',keyDown);window.addEventListener('keyup',keyUp);

  function draw(){
   const now=performance.now(),dt=Math.max(0,Math.min(.1,(now-lastFrame)/1000));lastFrame=now;root.dataset.phase=stage;root.dataset.heat=needle.toFixed(3);root.dataset.clean=String(clean);root.dataset.misses=String(misses);root.dataset.vials=JSON.stringify(vials.filter(v=>!v.done).map(v=>({x:v.x,y:v.y})));
   rp.paintEnvironment(g,env());
   rp.text(g,'THE COOK',135,44,{size:8,align:'center',color:pal.gold});
   rp.text(g,`${params.grade||''} - ${params.cases||1} CASE(S)`,135,58,{size:6,align:'center',color:pal.grey});
   if(stage==='blend'){
    rp.text(g,'HOLD TO BLEND',135,150,{size:8,align:'center'});
    rp.text(g,'RELEASE IN THE TARGET BAND',135,164,{size:6,align:'center',color:pal.grey});
    rp.rect(g,45,300,180,16,'#151321');
    rp.rect(g,45+BLEND.lo*176,300,BLEND.hi*176-BLEND.lo*176,16,pal.green);
    const level=hold?R.util.clamp((now-holdStart)/3000,0,1):blend;
    rp.rect(g,45+level*176,296,4,24,pal.bone);
    rp.rect(g,128,120,14,120,'#3a2f42');rp.rect(g,124,100,22,22,'#4a3a55');
    if(!hold&&blend>0)rp.text(g,`BLEND ${blendScore(blend)}`,135,336,{size:7,align:'center',color:pal.green});
   }else if(stage==='heat'){
    const t=(now-heatStart);needle=heatStep(needle,dt);burner=Math.max(0,burner-dt*3);heatSampleClock+=dt;while(heatSampleClock>=.1){heatSamples.push(needle);heatSampleClock-=.1;}const inBand=needle>=0.6&&needle<=0.85;
    rp.text(g,'TAP THE BURNER - KEEP IT GREEN',135,150,{size:6,align:'center'});
    rp.rect(g,120,170,30,150,'#2b2436');rp.rect(g,116,164,38,6,'#4a3f5a');
    rp.rect(g,120,170+ (1-0.85)*150,30,(0.85-0.6)*150,pal.green);
    rp.rect(g,118,168+(1-needle)*150,34,4,inBand?pal.gold:pal.red);
    rp.frame(g,90,340,90,36,{fill:burner>0?pal.red:pal.gold});rp.text(g,'BURNER',135,354,{size:7,align:'center',color:pal.ink});
    rp.text(g,`${Math.ceil(Math.max(0,HEAT_MS-t)/1000)}s / ${heatScore(heatSamples)}% GREEN`,135,398,{size:6,align:'center',color:inBand?pal.green:pal.red});
    if(t>=HEAT_MS){startBottle();}
   }else if(stage==='bottle'){
    const t=now-bottleStart;
    rp.text(g,'TAP VIALS / SPACE TO BOTTLE',135,150,{size:6,align:'center'});
    rp.rect(g,55,330,160,40,'#3a2f42');rp.rect(g,55,330,160,4,'#6e5846');
    if(t-spawnAt>700&&vials.filter(v=>!v.done).length<4){spawnAt=t;vials.push({x:40+Math.random()*190,y:180,done:false,born:t});}
    for(const v of vials){if(v.done)continue;v.y=180+(t-v.born)*0.09;if(v.y>330){v.done=true;misses++;}const col=v.y>290?pal.red:'#ff6fb5';rp.rect(g,v.x-4,v.y-8,8,16,col);}
    if(t>=BOTTLE_MS){finish();}
   }
   rp.text(g,'SPACE: HOLD / HEAT / BOTTLE',135,420,{size:6,align:'center',color:pal.grey});
   rp.text(g,`CLEAN ${clean}  BROKEN ${misses}`,135,380,{size:6,align:'center',color:pal.grey});
   if(!dead)raf=requestAnimationFrame(draw);
  }
  raf=requestAnimationFrame(draw);
  return {dispose(){dead=true;if(raf)cancelAnimationFrame(raf);canvas.removeEventListener('pointerdown',onDown);canvas.removeEventListener('pointerup',onUp);canvas.removeEventListener('pointercancel',onUp);if(heldPointer!==null){try{canvas.releasePointerCapture(heldPointer);}catch(_){}}heldPointer=null;hold=false;window.removeEventListener('keydown',keyDown);window.removeEventListener('keyup',keyUp);}};
 }};
})();
