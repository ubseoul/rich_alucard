// SLURP — ramen shift at SLURP DYNASTY, Little Tokyo. See docs/btf/MINIGAME_CONTRACT.md.
// Registers RAMinigames 'slurp' and exposes pure logic at window.RAMinigameLogic.slurp.
(function(){
 'use strict';
 const BROTHS=['SHOYU','TONKOTSU','MISO'];
 const NOODLES=['THIN','THICK'];
 const TOPPINGS=['EGG','CHASHU','NORI','SCALLION','NARUTO','CORN'];
 const JOLLOF_TOPPING='JOLLOF';

 function pick(arr,rng){return arr[Math.floor((rng?rng():Math.random())*arr.length)];}

 // ---------- pure logic ----------
 function makeOrder(rng,opts){
  opts=opts||{};rng=rng||Math.random;
  if(opts.kevin){
   const base=makeOrderSingle(rng,opts);
   return {id:'kevin-'+Math.floor(rng()*1e6),kevin:true,batch:40,broth:base.broth,noodles:base.noodles,toppings:base.toppings,label:'KEVIN x40'};
  }
  return makeOrderSingle(rng,opts);
 }
 function makeOrderSingle(rng,opts){
  opts=opts||{};
  const broth=pick(BROTHS,rng);
  const noodles=pick(NOODLES,rng);
  const toppingCount=1+Math.floor(rng()*3);
  const pool=TOPPINGS.concat(opts.jollofRamen?[JOLLOF_TOPPING]:[]);
  const toppings=[];
  while(toppings.length<toppingCount){
   const t=pick(pool,rng);
   if(!toppings.includes(t))toppings.push(t);
  }
  return {id:'order-'+Math.floor(rng()*1e6),kevin:false,batch:1,broth,noodles,toppings};
 }
 function sortedToppings(list){return [...list].map(String).map(s=>s.toUpperCase()).sort();}
 function checkBowl(order,bowl){
  bowl=bowl||{};
  const brothOk=order.broth===bowl.broth;
  const noodlesOk=order.noodles===bowl.noodles;
  const toppingsOk=JSON.stringify(sortedToppings(order.toppings))===JSON.stringify(sortedToppings(bowl.toppings||[]));
  const perfect=brothOk&&noodlesOk&&toppingsOk;
  return {perfect,wrong:!perfect,brothOk,noodlesOk,toppingsOk};
 }
 function tipFor(secondsTaken){
  const t=Math.max(0,Number(secondsTaken)||0);
  // faster = bigger tip; $10 at <=3s, linearly down to $2 at >=15s
  const pct=Math.max(0,Math.min(1,(15-t)/(15-3)));
  return Math.round((2+pct*8)*100)/100;
 }
 function orderInterval(elapsedMs){
  const el=Math.max(0,Number(elapsedMs)||0);
  // 6000ms at start -> 3000ms at/after 90s (peak rush)
  const t=Math.min(1,el/90000);
  return Math.round(6000-t*3000);
 }
 window.RAMinigameLogic=window.RAMinigameLogic||{};
 window.RAMinigameLogic.slurp={makeOrder,checkBowl,tipFor,orderInterval,BROTHS,NOODLES,TOPPINGS};

 // ---------- mount (DOM/game) ----------
 function mount(root,ctx){
  const P=RAPixel;
  const {canvas,ctx:g,toNative}=P.createCanvas(root);
  const params=ctx.params||{};
  const savedProgress=ctx.progress()||{};
  let rng=P.rng(params.seed||('slurp'+Date.now()));

  let jollofRamen=!!params.jollofRamen;
  let money=0,bowlsServed=0,perfect=0,walkouts=0,tickets=[],bowl={broth:null,noodles:null,toppings:[]},
      served=[],dragging=null,dragPos=null,hinaBest=params.hinaBest||savedProgress.hinaBest||0;
  let firstShift=!!params.firstShift;
  let tutorialStep=firstShift?0:-1; // 0 broth,1 noodles,2 toppings,3 serve,4 rich-special,-1 none
  let jollofPending=false,jollofChosen=null;
  let lastOrderAt=0,startTime=performance.now(),ended=false,serveStart=null;
  let flash=null,flashUntil=0;
  const SHIFT_MS=firstShift?45000:90000;
  let kevinTicket=null,kevinServesLeft=0;

  const BROTH_BINS=BROTHS.map((b,i)=>({label:b,x:10+i*86,y:400,w:78,h:26,kind:'broth',value:b}));
  const NOODLE_BINS=NOODLES.map((n,i)=>({label:n,x:10+i*130,y:430,w:122,h:26,kind:'noodles',value:n}));
  function toppingBins(){
   const pool=TOPPINGS.concat(jollofRamen?[JOLLOF_TOPPING]:[]);
   return pool.map((t,i)=>({label:t,x:6+(i%4)*66,y:220+Math.floor(i/4)*24,w:60,h:20,kind:'topping',value:t}));
  }
  const BOWL_ZONE={x:190,y:150,w:64,h:56};

  function spawnOrder(){
   const kevin=!firstShift&&(!tickets.length)&&rng()<(params.kevinChance!=null?params.kevinChance:0.06);
   const order=makeOrder(rng,{jollofRamen,kevin});
   if(firstShift&&tickets.length===0&&tutorialStep<4){
    order.tutorial=true;order.broth=null;order.noodles=null;order.toppings=[];order.label='RICH SPECIAL (???)';
   }
   tickets.push(order);
   if(order.kevin){kevinTicket=order;kevinServesLeft=order.batch;}
  }

  function resetBowl(){bowl={broth:null,noodles:null,toppings:[]};}

  function serveCurrent(){
   const order=tickets[0];
   if(!order)return;
   if(order.tutorial){
    // Rich invents the RICH SPECIAL from whatever bowl he built.
    jollofChosen={broth:bowl.broth||'SHOYU',noodles:bowl.noodles||'THIN',toppings:bowl.toppings.length?bowl.toppings:['EGG']};
    jollofRamen=true;
    ctx.reward({flags:{jollofRamenOnMenu:true}});
    tickets.shift();money+=8;bowlsServed++;perfect++;
    flash={text:'IT\'S NOW "JOLLOF RAMEN" FOREVER',color:P.palette.gold};flashUntil=performance.now()+1800;
    tutorialStep=-1;resetBowl();serveStart=performance.now();
    return;
   }
   const res=checkBowl(order,bowl);
   const took=serveStart?(performance.now()-serveStart)/1000:8;
   if(res.perfect){
    const tip=order.kevin?tipFor(took)*3:tipFor(took);
    money+=6+tip;perfect++;bowlsServed++;
    flash={text:`PERFECT +$${(6+tip).toFixed(2)}`,color:P.palette.green};
   } else {
    walkouts++;
    flash={text:'WRONG ORDER — WALKOUT',color:P.palette.red};
   }
   flashUntil=performance.now()+900;
   if(order.kevin){
    kevinServesLeft--;
    if(kevinServesLeft<=0){tickets.shift();kevinTicket=null;}
   } else tickets.shift();
   resetBowl();serveStart=performance.now();
   if(walkouts>=3)finishShift();
  }

  function hitTest(p,list){for(const b of list){if(p.x>=b.x&&p.x<=b.x+b.w&&p.y>=b.y&&p.y<=b.y+b.h)return b;}return null;}

  function pointerDown(ev){
   if(ended)return;
   const t=ev.touches?ev.touches[0]:ev;
   const p=toNative(t.clientX,t.clientY);
   const allBins=[...BROTH_BINS,...NOODLE_BINS,...toppingBins()];
   const bin=hitTest(p,allBins);
   if(bin){dragging=bin;dragPos=p;if(!serveStart)serveStart=performance.now();return;}
   if(p.x>=BOWL_ZONE.x&&p.x<=BOWL_ZONE.x+BOWL_ZONE.w&&p.y>=BOWL_ZONE.y&&p.y<=BOWL_ZONE.y+BOWL_ZONE.h){
    serveCurrent();
   }
  }
  function pointerMove(ev){
   if(!dragging)return;
   const t=ev.touches?ev.touches[0]:ev;
   dragPos=toNative(t.clientX,t.clientY);
  }
  function pointerUp(ev){
   if(!dragging)return;
   const p=dragPos||{x:-1,y:-1};
   if(p.x>=BOWL_ZONE.x-10&&p.x<=BOWL_ZONE.x+BOWL_ZONE.w+10&&p.y>=BOWL_ZONE.y-10&&p.y<=BOWL_ZONE.y+BOWL_ZONE.h+10){
    if(dragging.kind==='broth'){bowl.broth=dragging.value;if(tutorialStep===0)tutorialStep=1;}
    else if(dragging.kind==='noodles'){bowl.noodles=dragging.value;if(tutorialStep===1)tutorialStep=2;}
    else if(dragging.kind==='topping'){if(bowl.toppings.length<3&&!bowl.toppings.includes(dragging.value)){bowl.toppings.push(dragging.value);}if(tutorialStep===2)tutorialStep=3;}
   }
   dragging=null;dragPos=null;
  }
  canvas.addEventListener('pointerdown',pointerDown);
  canvas.addEventListener('pointermove',pointerMove);
  window.addEventListener('pointerup',pointerUp);

  function clockOut(){finishShift();}
  const clockBtn=document.createElement('button');
  clockBtn.textContent='CLOCK OUT';
  clockBtn.style.cssText='position:absolute;right:4%;top:58%;z-index:4;font:6px "Press Start 2P";padding:.5em .6em;background:#f6efd9;color:#10101b;border:2px solid #10101b;box-shadow:2px 2px #7d194b;cursor:pointer';
  clockBtn.addEventListener('click',clockOut);
  root.append(clockBtn);

  let raf=null,ended2=false;
  function finishShift(){
   if(ended)return;ended=true;
   const beatHina=money>hinaBest;
   if(beatHina)hinaBest=money;
   ctx.saveProgress({hinaBest,bestRush:Math.max(savedProgress.bestRush||0,bowlsServed)});
   ctx.reward({money,memories:firstShift?['first shift']:[]});
   showEndCard(beatHina);
  }

  function showEndCard(beatHina){
   const div=document.createElement('div');
   div.style.cssText='position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;background:rgba(8,7,15,.92);color:#f6efd9;font-family:"Press Start 2P",monospace;text-align:center;padding:0 20px;z-index:6';
   div.innerHTML=`<div style="font-size:12px;color:#c18b3c">CLOCKED OUT</div>
    <div style="font-size:9px">SERVED ${bowlsServed}</div>
    <div style="font-size:8px">MONEY $${money.toFixed(2)}</div>
    <div style="font-size:7px">PERFECT ${perfect} · WALKOUTS ${walkouts}</div>
    <div style="font-size:7px;color:${beatHina?'#20c66b':'#d7193f'}">HINA'S BEST: $${hinaBest.toFixed(2)} ${beatHina?'— BEATEN':''}</div>`;
   const btnRow=document.createElement('div');btnRow.style.cssText='display:flex;gap:8px;margin-top:6px';
   const done=document.createElement('button');done.textContent='DONE';
   done.style.cssText='font:8px "Press Start 2P";padding:.7em .9em;background:#f6efd9;color:#10101b;border:2px solid #10101b;box-shadow:2px 2px #7d194b;cursor:pointer';
   done.addEventListener('click',()=>{
    ctx.finish({outcome:'done',score:bowlsServed,data:{money,perfect,walkouts,beatHina}});
   });
   btnRow.append(done);div.append(btnRow);root.append(div);
  }

  function drawBins(){
   BROTH_BINS.forEach(b=>{P.frame(g,b.x,b.y,b.w,b.h,{fill:'#3a2f2a',border:'#10101b',accent:'#6e5846'});P.text(g,b.label,b.x+b.w/2,b.y+b.h/2,{size:6,align:'center',baseline:'middle',color:'#f6efd9'});});
   NOODLE_BINS.forEach(b=>{P.frame(g,b.x,b.y,b.w,b.h,{fill:'#4a3a30',border:'#10101b',accent:'#6e5846'});P.text(g,b.label,b.x+b.w/2,b.y+b.h/2,{size:6,align:'center',baseline:'middle',color:'#f6efd9'});});
   toppingBins().forEach(b=>{const gold=b.value===JOLLOF_TOPPING;P.frame(g,b.x,b.y,b.w,b.h,{fill:gold?'#c18b3c':'#2a2340',border:'#10101b',accent:gold?'#f6efd9':'#3a2f2a'});P.text(g,b.label,b.x+b.w/2,b.y+b.h/2,{size:5,align:'center',baseline:'middle',color:gold?'#10101b':'#f6efd9'});});
  }
  function drawBowl(){
   P.frame(g,BOWL_ZONE.x,BOWL_ZONE.y,BOWL_ZONE.w,BOWL_ZONE.h,{fill:'#1e1a2a',border:'#10101b',accent:'#3d9ddd'});
   P.text(g,bowl.broth||'—',BOWL_ZONE.x+BOWL_ZONE.w/2,BOWL_ZONE.y+8,{size:5,align:'center',color:'#f6efd9'});
   P.text(g,bowl.noodles||'—',BOWL_ZONE.x+BOWL_ZONE.w/2,BOWL_ZONE.y+18,{size:5,align:'center',color:'#f6efd9'});
   P.text(g,(bowl.toppings||[]).join(' '),BOWL_ZONE.x+BOWL_ZONE.w/2,BOWL_ZONE.y+30,{size:5,align:'center',color:'#f6efd9',maxWidth:BOWL_ZONE.w-4});
   P.text(g,'SERVE',BOWL_ZONE.x+BOWL_ZONE.w/2,BOWL_ZONE.y+44,{size:5,align:'center',color:'#c18b3c'});
  }
  function drawTicket(order,x,y){
   if(!order)return;
   const w=126,h=44;
   P.frame(g,x,y,w,h,{fill:'#f6efd9',border:'#10101b',accent:order.kevin?P.palette.gold:'#7d194b'});
   const title=order.tutorial?'RICH SPECIAL (???)':order.kevin?`KEVIN x${kevinServesLeft}`:`${order.broth} ${order.noodles}`;
   P.text(g,title,x+w/2,y+8,{size:5,align:'center',color:'#10101b'});
   if(!order.tutorial){
    const lines=P.wrap(g,order.toppings.join(' '),w-8,5);
    lines.slice(0,2).forEach((l,i)=>P.text(g,l,x+w/2,y+20+i*9,{size:5,align:'center',color:'#10101b'}));
   }
  }

  function frame(now){
   if(raf===null)return;
   g.clearRect(0,0,270,480);
   P.paintEnvironment(g,{sky:P.palette.night,wall:'#2a2340',floor:'#3a2f2a',horizon:150,seed:'slurp',
    props:[{type:'sign',x:8,y:24,w:180,h:20,text:'SLURP DYNASTY',glow:'#ff6fb5',size:7},
     {type:'counter',x:0,y:150,w:270,h:14,color:'#4a3a30'}]});
   P.drawActor(g,{top:'#1b1824',bottom:'#111018',hair:'#0b0a12',hairShape:'locs',shades:true,accent:P.palette.green,prop:'food'},40,150,0.9);

   const elapsed=now-startTime;
   if(!ended){
    if(tickets.length===0||(now-lastOrderAt>=orderInterval(elapsed)&&tickets.length<4)){
     spawnOrder();lastOrderAt=now;
    }
   }
   tickets.slice(0,2).forEach((t,i)=>drawTicket(t,8+i*136,60));

   drawBins();drawBowl();

   if(firstShift&&tutorialStep>=0){
    const words=['BROTH.','NOODLES.','TOPPINGS.','SERVE.'];
    P.text(g,words[Math.min(tutorialStep,3)],135,180,{size:10,align:'center',color:P.palette.gold});
   }

   if(dragging&&dragPos){
    P.frame(g,dragPos.x-24,dragPos.y-10,48,20,{fill:'#c18b3c',border:'#10101b'});
    P.text(g,dragging.label,dragPos.x,dragPos.y,{size:5,align:'center',baseline:'middle',color:'#10101b'});
   }

   P.text(g,`$${money.toFixed(2)}`,8,462,{size:8,color:'#20c66b'});
   P.text(g,`WALKOUTS ${walkouts}/3`,90,462,{size:6,color:walkouts>=2?'#d7193f':'#c9c0a8'});
   P.text(g,`HINA ${hinaBest.toFixed(0)}`,200,462,{size:6,color:'#3d9ddd'});

   if(flash&&now<flashUntil){
    P.text(g,flash.text,135,110,{size:7,align:'center',color:flash.color});
   } else flash=null;

   if(!ended&&now-startTime>=SHIFT_MS)finishShift();
   raf=requestAnimationFrame(frame);
  }
  raf=requestAnimationFrame(frame);

  return {
   dispose(){
    const r=raf;raf=null;if(r)cancelAnimationFrame(r);
    canvas.removeEventListener('pointerdown',pointerDown);
    canvas.removeEventListener('pointermove',pointerMove);
    window.removeEventListener('pointerup',pointerUp);
    try{clockBtn.remove();}catch(e){}
   }
  };
 }

 window.RAMinigames.register('slurp',{title:'SLURP',mount});
})();
