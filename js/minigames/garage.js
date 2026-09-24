(function(){
 'use strict';
 // GARAGE — car customization that teaches. See docs/btf/MINIGAME_CONTRACT.md.
 const clamp=(v,a,b)=>v<a?a:v>b?b:v;
 const clamp01=v=>clamp(v,0,1);

 // Small duplicate handling table used only if window.RAMinigameLogic.touge is absent.
 const FALLBACK_CARS={
  supra:{power:8,grip:6,driftEase:6,style:1.0,manual:true,color:'#d9d9d9'},
  s15:{power:6,grip:6,driftEase:9,style:1.1,manual:true,color:'#f2f2f2'},
  s2000:{power:6,grip:7,driftEase:7,style:1.2,manual:true,color:'#ff6fb5'},
  r34_awd:{power:8,grip:9,driftEase:1,style:1.0,manual:true,color:'#3a5fbf'},
  r34_rwd:{power:8,grip:6,driftEase:8,style:1.3,manual:true,color:'#3a5fbf'},
  urus:{power:9,grip:7,driftEase:3,style:1.5,manual:false,color:'#5a1420'},
  aventador:{power:10,grip:8,driftEase:2,style:1.4,manual:false,color:'#3b1a5c'},
  ferrari:{power:9,grip:6,driftEase:7,style:1.6,manual:false,color:'#c81d25'}
 };
 function fallbackHandling(carId,parts){
  parts=parts||{};
  const base=FALLBACK_CARS[carId]||FALLBACK_CARS.s15;
  let driftEase=base.driftEase,grip=base.grip,stability=1;
  if(parts.tires){driftEase+=2;grip-=2;}
  if(parts.lsd)driftEase+=3;
  if(parts.coilovers)stability+=0.6;
  if(parts.rwd&&carId==='r34_awd')driftEase+=7;
  return {driftEase:clamp(driftEase,0.2,12),grip:clamp(grip,1,12),stability,color:base.color};
 }

 // ---- Parts table --------------------------------------------------------
 const PARTS=[
  {id:'tires',label:'TIRES',price:1200,speaker:'IMPORT GUY',
   line:'Rear tires with less grip slide easier; front grip lets you steer while sliding.',
   effect:{driftEase:2,control:1}},
  {id:'coilovers',label:'COILOVERS',price:3500,speaker:'IMPORT GUY',
   line:'Adjustable suspension; lowers the car and stiffens it so weight shifts predictably.',
   effect:{stability:1,snapback:-1}},
  {id:'lsd',label:'LSD',price:2800,speaker:'IMPORT GUY',
   line:'Sends power to both rear wheels so they spin together — the heart of a drift car.',
   effect:{driftEase:3}},
  {id:'anglekit',label:'ANGLE KIT',price:4000,speaker:'IMPORT GUY',
   line:'Lets the front wheels turn much farther so you can hold huge angle without spinning.',
   effect:{maxAngle:15}},
  {id:'hydro',label:'HYDRAULIC HANDBRAKE',price:900,speaker:'PINKY',
   line:'A stronger, instant e-brake for initiating and fixing lines.',
   effect:{ebrakePower:0.6}},
  {id:'turbo',label:'TURBO',prices:[6000,12000,18000],leveled:true,speaker:'PINKY',
   line:'More power means longer slides and more smoke — but it is easier to spin.',
   effect:{power:2}},
  {id:'weight',label:'WEIGHT REDUCTION',price:1500,speaker:'PINKY',
   line:'Removing weight makes the car more responsive.',
   effect:{weight:-1}},
  {id:'bucket',label:'BUCKET SEAT',price:1100,speaker:'PINKY',
   line:'Holds you in place; you feel the car better.',
   effect:{counterWindow:0.5}},
  {id:'bodykit',label:'BODY KIT',price:6000,carOnly:'s15',speaker:'PINKY',
   line:'Style; aero at high speed.',
   effect:{style:1.3}},
  {id:'rwd',label:'RWD CONVERSION',price:12000,carOnly:'r34_awd',speaker:'IMPORT GUY',
   line:'Removes front-wheel drive so the car can drift.',
   effect:{driftEase:7}},
  {id:'livery',label:'FUZZY WHEELS / LIVERY',price:600,speaker:'PINKY',
   line:'Pure drip.',
   effect:{style:0.1}}
 ];
 const CORE_DRIFT_PARTS=['tires','lsd','anglekit','coilovers'];

 function priceOf(partId,owned){
  const part=PARTS.find(p=>p.id===partId);if(!part)return Infinity;
  if(part.leveled){const lvl=owned&&owned.turbo||0;return part.prices[Math.min(lvl,part.prices.length-1)];}
  return part.price;
 }
 function canBuy(partId,carId,owned,money){
  const part=PARTS.find(p=>p.id===partId);if(!part)return false;
  if(part.carOnly&&part.carOnly!==carId)return false;
  owned=owned||{};
  if(part.leveled){if((owned.turbo||0)>=part.prices.length)return false;}
  else if(owned[partId])return false;
  return (money||0)>=priceOf(partId,owned);
 }
 function feelOf(carId,parts){
  let h;
  const ext=window.RAMinigameLogic&&window.RAMinigameLogic.touge;
  if(ext&&typeof ext.computeHandling==='function')h=ext.computeHandling(carId,parts);
  else h=fallbackHandling(carId,parts);
  return {slidey:clamp01((h.driftEase||1)/12),snappy:clamp01(1-((h.stability||1)-1)/1.5)};
 }
 function pinkyRating(parts){
  const owned=Object.keys(parts||{}).filter(k=>parts[k]);
  if(owned.length<4)return null;
  const core=CORE_DRIFT_PARTS.every(id=>parts[id]);
  return core?"that's a real drift car now.":"you built a meme.";
 }

 window.RAMinigameLogic=window.RAMinigameLogic||{};
 window.RAMinigameLogic.garage={parts:PARTS,feelOf,pinkyRating,canBuy,priceOf};

 if(typeof window.RAMinigames==='undefined'||typeof document==='undefined')return;

 function mount(root,ctx){
  const P=ctx.params||{};
  const carId=P.car||'s15';
  const carColor=(FALLBACK_CARS[carId]||FALLBACK_CARS.s15).color;
  let owned=Object.assign({},P.owned||P.parts||{});
  let money=typeof P.money==='number'?P.money:20000;
  const prog=ctx.progress();
  let lessonsSeen=new Set(prog.lessonsSeen||[]);
  const {canvas,ctx:c}=RAPixel.createCanvas(root);

  let tab='parts',scroll=0,selected=null,ratingText=null;

  function toNative(clientX,clientY){const r=canvas.getBoundingClientRect();return{x:(clientX-r.left)*270/(r.width||270),y:(clientY-r.top)*480/(r.height||480)};}
  function inRect(p,r){return p.x>=r.x&&p.x<=r.x+r.w&&p.y>=r.y&&p.y<=r.y+r.h;}

  const TAB_PARTS={x:10,y:36,w:120,h:20};
  const TAB_GLOSSARY={x:140,y:36,w:120,h:20};
  const BTN_TESTDRIVE={x:10,y:444,w:120,h:26};
  const BTN_DONE={x:140,y:444,w:120,h:26};
  const listTop=62,rowH=34,listBottom=title=>440;
  const BTN_BUY={x:20,y:400,w:150,h:26};
  const BTN_CLOSE={x:230,y:150,w:26,h:20};

  function rowRects(){
   return PARTS.filter(p=>!p.carOnly||p.carOnly===carId).map((p,i)=>({part:p,rect:{x:8,y:listTop+i*rowH-scroll,w:254,h:rowH-4}}));
  }

  function onDown(e){
   const p=toNative(e.clientX,e.clientY);
   if(inRect(p,TAB_PARTS)){tab='parts';selected=null;return;}
   if(inRect(p,TAB_GLOSSARY)){tab='glossary';selected=null;return;}
   if(inRect(p,BTN_TESTDRIVE)){ctx.finish({outcome:'done',data:{testDrive:true,car:carId,parts:owned}});return;}
   if(inRect(p,BTN_DONE)){ctx.finish({outcome:'done',data:{parts:owned}});return;}
   if(selected){
    if(inRect(p,BTN_CLOSE)){selected=null;return;}
    if(inRect(p,BTN_BUY)&&canBuy(selected.id,carId,owned,money)){
     const price=priceOf(selected.id,owned);
     const patch={money:-price,parts:{}};
     if(selected.leveled)patch.parts.turbo=(owned.turbo||0)+1;
     else patch.parts[selected.id]=true;
     patch.lessons=[selected.id];
     ctx.reward(patch);
     money-=price;
     if(selected.leveled)owned.turbo=(owned.turbo||0)+1;else owned[selected.id]=true;
     lessonsSeen.add(selected.id);
     ctx.saveProgress({lessonsSeen:[...lessonsSeen]});
     const owned4=Object.keys(owned).filter(k=>owned[k]).length;
     if(owned4>=4)ratingText=pinkyRating(owned);
     return;
    }
    return;
   }
   if(tab==='parts'){
    for(const row of rowRects()){
     if(inRect(p,row.rect)){selected=row.part;lessonsSeen.add(row.part.id);ctx.saveProgress({lessonsSeen:[...lessonsSeen]});return;}
    }
   }
  }
  let dragStartY=null,dragStartScroll=0,dragging=false;
  function onMove(e){
   if(dragStartY==null)return;
   const p=toNative(e.clientX,e.clientY);
   if(Math.abs(p.y-dragStartY)>4)dragging=true;
   if(dragging){scroll=clamp(dragStartScroll-(p.y-dragStartY),0,Math.max(0,PARTS.length*rowH-260));}
  }
  function onPointerDown(e){
   const p=toNative(e.clientX,e.clientY);
   dragStartY=p.y;dragStartScroll=scroll;dragging=false;
   onDown(e);
  }
  function onUp(){dragStartY=null;dragging=false;}
  canvas.addEventListener('pointerdown',onPointerDown);
  canvas.addEventListener('pointermove',onMove);
  canvas.addEventListener('pointerup',onUp);
  canvas.addEventListener('pointercancel',onUp);

  function draw(){
   c.fillStyle='#17142c';c.fillRect(0,0,270,480);
   // car on lift
   RAPixel.rect(c,60,2,150,30,'#0d0b18');
   RAPixel.rect(c,80,6,110,20,carColor);
   RAPixel.rect(c,86,10,20,10,'#233a6b');
   RAPixel.rect(c,150,10,20,10,'#233a6b');
   RAPixel.rect(c,88,24,8,6,'#111018');
   RAPixel.rect(c,168,24,8,6,'#111018');
   RAPixel.rect(c,120,0,4,32,'#3a2f2a');
   RAPixel.rect(c,140,0,4,32,'#3a2f2a');
   RAPixel.text(c,`$${money}`,264,4,{size:7,align:'right',color:'#20c66b'});
   RAPixel.text(c,carId.toUpperCase(),6,4,{size:7,color:'#f6efd9'});

   RAPixel.rect(c,TAB_PARTS.x,TAB_PARTS.y,TAB_PARTS.w,TAB_PARTS.h,tab==='parts'?'#f6efd9':'#2a2340');
   RAPixel.text(c,'PARTS',TAB_PARTS.x+TAB_PARTS.w/2,TAB_PARTS.y+6,{size:6,align:'center',color:tab==='parts'?'#10101b':'#c9c0a8',shadow:null});
   RAPixel.rect(c,TAB_GLOSSARY.x,TAB_GLOSSARY.y,TAB_GLOSSARY.w,TAB_GLOSSARY.h,tab==='glossary'?'#f6efd9':'#2a2340');
   RAPixel.text(c,'GLOSSARY',TAB_GLOSSARY.x+TAB_GLOSSARY.w/2,TAB_GLOSSARY.y+6,{size:6,align:'center',color:tab==='glossary'?'#10101b':'#c9c0a8',shadow:null});

   c.save();c.beginPath();c.rect(0,listTop,270,378);c.clip();
   if(tab==='parts'){
    for(const row of rowRects()){
     const r=row.rect,part=row.part;
     if(r.y+r.h<listTop||r.y>440)continue;
     const isOwned=part.leveled?(owned.turbo||0)>=part.prices.length:!!owned[part.id];
     RAPixel.rect(c,r.x,r.y,r.w,r.h,isOwned?'#20361f':'#241f36');
     RAPixel.text(c,part.label,r.x+6,r.y+5,{size:6,color:'#f6efd9'});
     const price=priceOf(part.id,owned);
     RAPixel.text(c,isOwned?'OWNED':`$${price}`,r.x+r.w-6,r.y+5,{size:6,align:'right',color:isOwned?'#20c66b':'#c18b3c'});
    }
   } else {
    let ly=listTop+6;
    if(lessonsSeen.size===0)RAPixel.text(c,'LOOK AT A PART TO LEARN IT.',14,ly,{size:6,color:'#6b6780'});
    for(const id of lessonsSeen){
     const part=PARTS.find(p=>p.id===id);if(!part)continue;
     RAPixel.text(c,part.label,14,ly,{size:6,color:'#c18b3c'});ly+=10;
     for(const l of RAPixel.wrap(c,part.line,244,6)){RAPixel.text(c,l,14,ly,{size:6,color:'#f6efd9'});ly+=9;}
     ly+=6;
    }
   }
   c.restore();

   if(ratingText){RAPixel.text(c,`PINKY: ${ratingText}`,135,428,{size:6,align:'center',color:'#ff6fb5'});}

   RAPixel.rect(c,BTN_TESTDRIVE.x,BTN_TESTDRIVE.y,BTN_TESTDRIVE.w,BTN_TESTDRIVE.h,'#3d9ddd');
   RAPixel.text(c,'TEST DRIVE',BTN_TESTDRIVE.x+BTN_TESTDRIVE.w/2,BTN_TESTDRIVE.y+9,{size:6,align:'center',color:'#0d0b18',shadow:null});
   RAPixel.rect(c,BTN_DONE.x,BTN_DONE.y,BTN_DONE.w,BTN_DONE.h,'#f6efd9');
   RAPixel.text(c,'DONE',BTN_DONE.x+BTN_DONE.w/2,BTN_DONE.y+9,{size:6,align:'center',color:'#10101b',shadow:null});

   if(selected)drawDetail();
  }

  function drawDetail(){
   RAPixel.frame(c,15,90,240,320,{fill:'#17142c',border:'#f6efd9',accent:'#7d194b'});
   RAPixel.rect(c,BTN_CLOSE.x,BTN_CLOSE.y,BTN_CLOSE.w,BTN_CLOSE.h,'#d7193f');
   RAPixel.text(c,'X',BTN_CLOSE.x+13,BTN_CLOSE.y+5,{size:7,align:'center',color:'#f6efd9'});
   RAPixel.text(c,selected.label,135,105,{size:8,align:'center',color:'#f6efd9'});
   RAPixel.text(c,`${selected.speaker}:`,30,128,{size:6,color:'#c18b3c'});
   let ly=140;
   for(const l of RAPixel.wrap(c,selected.line,214,6)){RAPixel.text(c,l,30,ly,{size:6,color:'#f6efd9'});ly+=10;}
   ly+=8;
   const before=feelOf(carId,owned);
   const after=feelOf(carId,{...owned,[selected.leveled?'turbo':selected.id]:selected.leveled?(owned.turbo||0)+1:true});
   drawSlider(30,ly,'SLIDEY','GRIPPY',1-before.slidey,1-after.slidey);ly+=28;
   drawSlider(30,ly,'CALM','SNAPPY',before.snappy,after.snappy);ly+=34;
   const price=priceOf(selected.id,owned);
   const affordable=canBuy(selected.id,carId,owned,money);
   const isOwned=selected.leveled?(owned.turbo||0)>=selected.prices.length:!!owned[selected.id];
   RAPixel.rect(c,BTN_BUY.x,BTN_BUY.y,BTN_BUY.w,BTN_BUY.h,isOwned?'#3a3a30':affordable?'#20c66b':'#6b6780');
   RAPixel.text(c,isOwned?'OWNED':`BUY INSTALL $${price}`,BTN_BUY.x+BTN_BUY.w/2,BTN_BUY.y+9,{size:6,align:'center',color:'#0d0b18',shadow:null});
  }
  function drawSlider(x,y,lo,hi,beforeV,afterV){
   RAPixel.text(c,lo,x,y,{size:6,color:'#6b6780'});
   RAPixel.text(c,hi,x+160,y,{size:6,align:'right',color:'#6b6780'});
   RAPixel.rect(c,x,y+10,160,4,'#2a2340');
   RAPixel.rect(c,x+clamp01(beforeV)*156,y+9,4,6,'#6b6780');
   RAPixel.rect(c,x+clamp01(afterV)*156,y+9,4,6,'#20c66b');
  }

  let raf=null;
  function loop(){draw();raf=requestAnimationFrame(loop);}
  raf=requestAnimationFrame(loop);

  return {dispose(){
   if(raf)cancelAnimationFrame(raf);
   canvas.removeEventListener('pointerdown',onPointerDown);
   canvas.removeEventListener('pointermove',onMove);
   canvas.removeEventListener('pointerup',onUp);
   canvas.removeEventListener('pointercancel',onUp);
  }};
 }

 window.RAMinigames.register('garage',{title:'GARAGE',mount});
})();
