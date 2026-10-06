// SLURP — ramen shift at SLURP DYNASTY, Little Tokyo. See docs/btf/MINIGAME_CONTRACT.md.
// Registers RAMinigames 'slurp' and exposes pure logic at window.RAMinigameLogic.slurp.
(function(){
 'use strict';
 const BROTHS=['SHOYU','TONKOTSU','MISO'];
 const NOODLES=['THIN','THICK'];
 const MEATS=['CHASHU','CHICKEN','SHRIMP'];
 const TOPS=['EGG','NORI','SCALLION','CORN'];
 const TOPPINGS=MEATS.concat(TOPS);
 const JOLLOF_TOPPING='JOLLOF';

 function pick(arr,rng){return arr[Math.floor((rng?rng():Math.random())*arr.length)];}

 // ---------- pure logic ----------
 function makeOrder(rng,opts){
  opts=opts||{};rng=rng||Math.random;
  if(opts.kevin){
   const base=makeOrderSingle(rng,opts);
   return {id:'kevin-'+Math.floor(rng()*1e6),kevin:true,batch:40,broth:base.broth,noodles:base.noodles,meat:base.meat,topping:base.topping,toppings:base.toppings,label:'KEVIN x40'};
  }
  return makeOrderSingle(rng,opts);
 }
 function makeOrderSingle(rng,opts){
  opts=opts||{};
  const broth=pick(BROTHS,rng);
  const noodles=pick(NOODLES,rng);
  const meat=pick(MEATS,rng);
  const topping=opts.jollofRamen&&rng()<0.35?JOLLOF_TOPPING:pick(TOPS,rng);
  return {id:'order-'+Math.floor(rng()*1e6),kevin:false,batch:1,broth,noodles,meat,topping,toppings:[meat,topping]};
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
 function chairProgress(stacked,total=window.RANewOgaTunables?.chairs?.AUTHORED_TOTAL){const safe=Math.max(1,Number(total)),done=Math.max(0,Math.min(safe,Number(stacked)||0));return {stacked:done,total:safe,remaining:safe-done,success:done>=safe};}
 window.RAMinigameLogic=window.RAMinigameLogic||{};
 window.RAMinigameLogic.slurp={makeOrder,checkBowl,tipFor,orderInterval,chairProgress,BROTHS,NOODLES,MEATS,TOPS,TOPPINGS};

 function mountCanopy(root,ctx){
  const P=RAPixel,{canvas,ctx:g,toNative}=P.createCanvas(root),params=ctx.params||{};
  const defaults=window.RANewOgaTunables?.chairs||{};
  const total=Math.max(1,Number(params.totalChairs||defaults.AUTHORED_TOTAL)),bundle=Math.max(1,Number(params.bundleSize||defaults.BUNDLE_SIZE)),duration=Math.max(1000,Number(params.durationMs||defaults.DURATION_MS));
  const STACK={x:18,y:370,w:92,h:62},CANOPY={x:156,y:122,w:96,h:142};
  let stacked=0,dragging=false,dragPos=null,start=performance.now(),ended=false,raf=null;
  const inRect=(p,r)=>p.x>=r.x&&p.x<=r.x+r.w&&p.y>=r.y&&p.y<=r.y+r.h;
  function down(ev){if(ended)return;const p=toNative(ev.clientX,ev.clientY);if(inRect(p,STACK)&&stacked<total){dragging=true;dragPos=p;}}
  function move(ev){if(dragging)dragPos=toNative(ev.clientX,ev.clientY);}
  function up(){if(!dragging)return;if(inRect(dragPos||{},CANOPY))stacked=Math.min(total,stacked+bundle);dragging=false;dragPos=null;if(stacked>=total)finish();}
  canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);window.addEventListener('pointerup',up);
  const clock=document.createElement('button');clock.className='canopy-finish';clock.textContent='FINISH STACK';clock.style.cssText='position:absolute;right:4%;top:58%;z-index:4;font:6px "Press Start 2P";padding:.5em .6em;background:#f6efd9;color:#10101b;border:2px solid #10101b;box-shadow:2px 2px #7d194b;cursor:pointer';clock.addEventListener('click',finish);root.append(clock);
  function finish(){if(ended)return;ended=true;const result=chairProgress(stacked,total);const card=document.createElement('div');card.className='canopy-result';card.style.cssText='position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;background:rgba(8,7,15,.92);color:#f6efd9;font-family:"Press Start 2P",monospace;text-align:center;padding:20px;z-index:6';card.innerHTML=`<div style="font-size:11px;color:#c18b3c">CHAIRS ${result.stacked}/${result.total}</div><div style="font-size:7px">${result.success?'DELIVERY STACKED':'AUNTIE CRITIQUE'}</div>`;const done=document.createElement('button');done.className='canopy-done';done.textContent='DONE';done.style.cssText='font:8px "Press Start 2P";padding:.7em .9em;background:#f6efd9;color:#10101b;border:2px solid #10101b;cursor:pointer';done.addEventListener('click',()=>ctx.finish({outcome:'done',score:result.stacked,data:result}));card.append(done);root.append(card);}
  function frame(now){if(raf===null)return;g.clearRect(0,0,270,480);P.paintEnvironment(g,{sky:'#191027',wall:'#4a234c',floor:'#4a3a36',horizon:330,seed:'canopy-duty',props:[{type:'string',x1:8,x2:262,y:76,color:'#ffd36a'},{type:'sign',x:65,y:36,w:140,h:18,text:'CANOPY DUTY',glow:'#ffb040'}]});P.frame(g,STACK.x,STACK.y,STACK.w,STACK.h,{fill:'#d9d2c7',border:'#10101b',accent:'#8e8578'});P.text(g,'CHAIR STACK',64,390,{size:6,align:'center',color:'#10101b'});P.text(g,`${Math.max(0,total-stacked)} LEFT`,64,407,{size:6,align:'center',color:'#10101b'});P.frame(g,CANOPY.x,CANOPY.y,CANOPY.w,CANOPY.h,{fill:'rgba(240,225,205,.18)',border:'#f6efd9',accent:'#ffd36a'});P.text(g,'DROP HERE',204,180,{size:7,align:'center',color:'#f6efd9'});P.text(g,`${stacked}/${total}`,204,204,{size:9,align:'center',color:'#ffd36a'});if(dragging&&dragPos){P.frame(g,dragPos.x-28,dragPos.y-12,56,24,{fill:'#d9d2c7',border:'#10101b'});P.text(g,`+${bundle}`,dragPos.x,dragPos.y,{size:7,align:'center',baseline:'middle',color:'#10101b'});}const left=Math.max(0,Math.ceil((duration-(now-start))/1000));P.text(g,`${left}s`,262,466,{size:7,align:'right',color:'#f6efd9'});if(!ended&&now-start>=duration)finish();raf=requestAnimationFrame(frame);}raf=requestAnimationFrame(frame);
  return {dispose(){const r=raf;raf=null;if(r)cancelAnimationFrame(r);canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);try{clock.remove();}catch(e){}}};
 }

 // ---------- mount (DOM/game) ----------
 // RC2 B3 rework: ONE order card, four steps in a fixed order (BROTH → NOODLES → MEAT → TOPPING), a visible patience
 // timer and shift clock, tap-to-add (no dragging), wrong taps cost nothing but time. Pay is unchanged.
 const STEPS=[{id:'broth',label:'BROTH'},{id:'noodles',label:'NOODLES'},{id:'meat',label:'MEAT'},{id:'topping',label:'TOPPING'}];
 const SWATCH={SHOYU:'#7a4a2a',TONKOTSU:'#e8dcb8',MISO:'#c9923a',THIN:'#f0e0a0',THICK:'#e0c070',CHASHU:'#c0707a',CHICKEN:'#e8c898',SHRIMP:'#ff9a7a',EGG:'#fff2b0',NORI:'#1c3a2a',SCALLION:'#4aa84a',CORN:'#f5d020',JOLLOF:'#e0562a'};
 const KEVIN_BOWLS=5; // "KEVIN x40" is the claim; he only needs five bowls made, the rest are on the way.
 function mount(root,ctx){ctx.audio?.sound('AMB_RAMEN');
  if(ctx.params?.canopyDuty)return mountCanopy(root,ctx);
  const P=RAPixel;
  const {canvas,ctx:g,toNative}=P.createCanvas(root);
  const approvedKitchen=new Image();approvedKitchen.src='assets/before_the_fame/environments/slurp/slurp_dynasty_little_tokyo_270x480.png';
  const J=window.RAJuice?window.RAJuice.create(g):{burst(){},float(){},ring(){},shake(){},flash(){},update(){},begin(){g.save();},end(){g.restore();}};
  const params=ctx.params||{};
  const savedProgress=ctx.progress()||{};
  let rng=P.rng(params.seed||('slurp'+Date.now()));
  let jollofRamen=!!params.jollofRamen;
  let money=0,bowlsServed=0,perfect=0,walkouts=0,tickets=[],hinaBest=params.hinaBest||savedProgress.hinaBest||0,streak=0,bestStreak=0;
  let firstShift=!!params.firstShift,tutorialDone=!firstShift;
  let step=0,bowl={broth:null,noodles:null,toppings:[]},workStart=null,kevinServesLeft=0;
  let lastOrderAt=0,startTime=performance.now(),last=startTime,ended=false,orderNo=0;
  let flashBin=null,flashBinUntil=0,serving=null,flash=null,flashUntil=0;
  const SHIFT_MS=firstShift?45000:90000,PATIENCE_MS=firstShift?32000:24000;
  root.dataset.phase='run';
  const itemsFor=s=>s===0?BROTHS:s===1?NOODLES:s===2?MEATS:TOPS.concat(jollofRamen?[JOLLOF_TOPPING]:[]);
  function binsFor(s){
   const items=itemsFor(s),n=items.length,cols=n<=3?n:2,rows=Math.ceil(n/cols),W=254,gap=6,bw=(W-gap*(cols-1))/cols,bh=Math.min(74,(216-gap*(rows-1))/rows);
   return items.map((v,i)=>({value:v,x:8+(i%cols)*(bw+gap),y:226+Math.floor(i/cols)*(bh+gap),w:bw,h:bh}));
  }
  function spawnOrder(){ctx.audio?.sound('ORDER_BELL');ctx.audio?.sound('TICKET_PRINT');
   const kevin=!firstShift&&(!tickets.length)&&rng()<(params.kevinChance!=null?params.kevinChance:0.06);
   const order=makeOrder(rng,{jollofRamen,kevin});order.no=++orderNo;if(order.kevin)kevinServesLeft=KEVIN_BOWLS;
   if(firstShift&&!tutorialDone&&tickets.length===0){order.tutorial=true;order.broth=null;order.noodles=null;order.toppings=[];order.meat=null;order.topping=null;order.label='RICH SPECIAL (???)';}
   order.patienceStart=order.tutorial?null:performance.now();tickets.push(order);
  }
  const current=()=>tickets[0]||null;
  function want(order,s){return !order||order.tutorial?null:s===0?order.broth:s===1?order.noodles:s===2?order.meat:order.topping;}
  function startWork(){const o=current();if(o&&workStart===null){workStart=performance.now();if(o.patienceStart==null)o.patienceStart=workStart;}}
  function resetBowl(){bowl={broth:null,noodles:null,toppings:[]};step=0;workStart=null;}
  function tapBin(bin){
   const o=current();if(!o||(serving&&performance.now()<serving.until))return;if(o.patienceStart==null)o.patienceStart=performance.now();startWork();
   const need=want(o,step),cx=bin.x+bin.w/2,cy=bin.y+bin.h/2;
   if(need&&need!==bin.value){
    ctx.audio?.sound('UI_ERROR');flashBin={value:bin.value,bad:true};flashBinUntil=performance.now()+420;J.shake(2);J.float('NOT THAT ONE',cx,cy-10,{color:'#d7193f',size:6,life:.7,rise:14});return;
   }
   ctx.audio?.sound('BOWL_CLINK');ctx.audio?.sound(step===0?'BROTH_POUR':'NOODLE_DROP');
   if(step===0)bowl.broth=bin.value;else if(step===1)bowl.noodles=bin.value;else bowl.toppings.push(bin.value);
   flashBin={value:bin.value,bad:false};flashBinUntil=performance.now()+300;J.burst(cx,cy,[SWATCH[bin.value]||'#f6efd9','#f6efd9'],10,60);J.ring(cx,cy,'#ffd36a',20);
   step++;if(step>=4)serve();
  }
  function serve(){
   const o=current();if(!o)return;
   const took=workStart?(performance.now()-workStart)/1000:8;
   if(o.tutorial){
    ctx.reward({flags:{jollofRamenOnMenu:true}});jollofRamen=true;tutorialDone=true;money+=8;bowlsServed++;perfect++;
    tickets.shift();flash={text:'IT\'S NOW "JOLLOF RAMEN" FOREVER',color:P.palette.gold};flashUntil=performance.now()+2200;
    J.burst(135,150,['#e0562a','#ffd36a','#20c66b'],24,110);J.flash('#e0562a',160);serving={until:performance.now()+450,bowl:{...bowl}};resetBowl();return;
   }
   const res=checkBowl(o,bowl),tip=o.kevin?tipFor(took)*3:tipFor(took);
   ctx.audio?.sound('TIP_COINS');money+=6+tip;perfect++;bowlsServed++;streak++;bestStreak=Math.max(bestStreak,streak);
   if(streak%3===0){ctx.audio?.sound('COMBO_UP');J.flash('#efc16b',90);J.float(`${streak} BOWL STREAK`,135,184,{color:'#efc16b',size:7});}
   flash={text:`+$${(6+tip).toFixed(2)}${tip>=8?' · FAST!':''}`,color:P.palette.green};flashUntil=performance.now()+1100;
   J.burst(135,150,['#20c66b','#ffd36a','#f6efd9'],20,100);J.float(`+$${(6+tip).toFixed(2)}`,200,170,{color:'#20c66b',size:8,life:1,rise:34});J.ring(135,150,'#ffd36a',30);
   serving={until:performance.now()+450,bowl:{...bowl}};
   if(o.kevin){kevinServesLeft--;o.patienceStart=null;if(kevinServesLeft<=0){tickets.shift();}}else tickets.shift();
   resetBowl();
  }
  function walkout(){
   const o=current();if(!o)return;
   walkouts++;streak=0;ctx.audio?.sound('MISS');J.shake(4);J.flash('#d7193f',160);
   flash={text:'TOO SLOW — THEY LEFT',color:P.palette.red};flashUntil=performance.now()+1200;
   tickets.shift();kevinServesLeft=0;resetBowl();
   if(walkouts>=3)finishShift();
  }
  function pointerDown(ev){
   if(ended)return;const p=toNative(ev.clientX,ev.clientY);
   for(const b of binsFor(step))if(p.x>=b.x&&p.x<=b.x+b.w&&p.y>=b.y&&p.y<=b.y+b.h){tapBin(b);return;}
  }
  canvas.addEventListener('pointerdown',pointerDown);
  const keyDown=e=>{if(ended||e.repeat)return;const n=Number(e.key)-1,bin=binsFor(step)[n];if(bin&&/^[1-4]$/.test(e.key)){e.preventDefault();tapBin(bin);}};
  window.addEventListener('keydown',keyDown);
  const clockBtn=document.createElement('button');
  clockBtn.textContent='CLOCK OUT';
  clockBtn.style.cssText='position:absolute;right:3%;bottom:1.2%;z-index:4;font:6px "Press Start 2P";padding:.5em .6em;background:#f6efd9;color:#10101b;border:2px solid #10101b;box-shadow:2px 2px #7d194b;cursor:pointer';
  clockBtn.addEventListener('click',()=>finishShift());
  root.append(clockBtn);
  let raf=null;
  function finishShift(){
   if(ended)return;ended=true;root.dataset.phase='results';
   const beatHina=money>hinaBest;if(beatHina)hinaBest=money;
   ctx.saveProgress({hinaBest,bestRush:Math.max(savedProgress.bestRush||0,bowlsServed)});
   ctx.reward({money,memories:firstShift?['first shift']:[]});
   showEndCard(beatHina);
  }
  function showEndCard(beatHina){
   const div=document.createElement('div');
   div.style.cssText='position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;background:rgba(8,7,15,.92);color:#f6efd9;font-family:"Press Start 2P",monospace;text-align:center;padding:0 20px;z-index:6';
   div.className='slurp-shift-result';div.setAttribute('role','status');
   div.innerHTML=`<div style="font-size:8px;color:#ff6fb5">SLURP DYNASTY · SHIFT RECEIPT</div><div style="font-size:12px;color:#efc16b">${walkouts>=3?'RUSH OVER':'CLOCKED OUT'}</div>
    <div style="font-size:9px">SERVED ${bowlsServed}</div>
    <div style="font-size:14px;color:#88dbad">EARNED $${money.toFixed(2)}</div><div style="font-size:7px">BEST BOWL STREAK ${bestStreak}</div>
    <div style="font-size:7px">PERFECT ${perfect} · WALKOUTS ${walkouts}</div>
    <div style="font-size:7px;color:${beatHina?'#20c66b':'#d7193f'}">HINA'S BEST: $${hinaBest.toFixed(2)} ${beatHina?'— BEATEN':''}</div>`;
   const btnRow=document.createElement('div');btnRow.style.cssText='display:flex;gap:8px;margin-top:6px';
   const done=document.createElement('button');done.textContent='DONE';
   done.style.cssText='font:8px "Press Start 2P";padding:.7em .9em;background:#f6efd9;color:#10101b;border:2px solid #10101b;box-shadow:2px 2px #7d194b;cursor:pointer';
   done.addEventListener('click',()=>{ctx.finish({outcome:'done',score:bowlsServed,data:{money,perfect,walkouts,beatHina}});});
   btnRow.append(done);div.append(btnRow);root.append(div);
  }
  const mmss=ms=>{const s=Math.max(0,Math.ceil(ms/1000));return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;};
  function drawBowl(x,y,b,t){
   // a pixel bowl that fills layer by layer so the order visibly BUILDS
   P.rect(g,x,y+26,84,6,'#10101b');P.rect(g,x+4,y+30,76,10,'#f6efd9');P.rect(g,x+10,y+40,64,5,'#d9d2c7');
   P.rect(g,x+2,y+16,80,14,'#e8e2cf');
   if(b.broth)P.rect(g,x+6,y+16,72,10,SWATCH[b.broth]||'#7a4a2a');
   if(b.noodles){for(let i=0;i<6;i++)P.rect(g,x+10+i*11,y+17+(i%2)*3,8,2,SWATCH[b.noodles]||'#f0e0a0');}
   if(b.toppings[0])P.rect(g,x+14,y+11,22,7,SWATCH[b.toppings[0]]||'#c0707a');
   if(b.toppings[1])P.rect(g,x+46,y+11,16,7,SWATCH[b.toppings[1]]||'#fff2b0');
   if(b.broth){const k=Math.floor(t/260)%2;P.rect(g,x+24,y+2-k*2,2,6,'rgba(246,239,217,.55)');P.rect(g,x+44,y+4+k*2,2,6,'rgba(246,239,217,.45)');P.rect(g,x+60,y+1-k*2,2,6,'rgba(246,239,217,.55)');}
  }
  function drawOrderCard(o,now){
   const x=8,y=30,w=254,h=106;P.frame(g,x,y,w,h,{fill:'#f6efd9',border:'#10101b',accent:o?.kevin?P.palette.gold:'#7d194b'});
   if(!o){P.text(g,'WAITING FOR A CUSTOMER…',135,y+44,{size:7,color:'#10101b',align:'center'});return;}
   const title=o.tutorial?'RICH SPECIAL: INVENT ANYTHING':o.kevin?`KEVIN x40 · MAKE ${kevinServesLeft} MORE`:`ORDER #${o.no}`;
   P.text(g,title,x+8,y+7,{size:6,color:'#10101b'});
   // patience timer: a visible bar + seconds left
   const ps=o.patienceStart==null?PATIENCE_MS:Math.max(0,PATIENCE_MS-(now-o.patienceStart)),pct=ps/PATIENCE_MS;
   P.rect(g,x+8,y+19,w-60,7,'#10101b');P.rect(g,x+9,y+20,(w-62)*pct,5,pct>.5?'#20c66b':pct>.25?'#c18b3c':'#d7193f');
   P.text(g,`${Math.ceil(ps/1000)}s`,x+w-10,y+18,{size:7,color:pct>.25?'#10101b':'#d7193f',align:'right'});
   for(let i=0;i<4;i++){
    const ry=y+32+i*17,isCur=i===step,done=i<step,val=o.tutorial?(done?[bowl.broth,bowl.noodles,bowl.toppings[0],bowl.toppings[1]][i]:'?'):want(o,i);
    if(isCur)P.rect(g,x+4,ry-1,w-8,16,'#ffd36a');
    P.rect(g,x+8,ry+1,12,12,done?'#20c66b':'#10101b');P.text(g,done?'✓':String(i+1),x+14,ry+7,{size:6,color:'#f6efd9',align:'center',baseline:'middle'});
    P.text(g,STEPS[i].label,x+26,ry+4,{size:7,color:done?'#8a8296':'#10101b'});
    P.rect(g,x+112,ry+3,10,10,SWATCH[val]||'#d9d2c7');P.text(g,String(val||'?'),x+126,ry+4,{size:7,color:done?'#8a8296':'#10101b'});
    if(isCur&&Math.floor(now/320)%2===0)P.text(g,'◄',x+w-14,ry+4,{size:7,color:'#7d194b',align:'right'});
   }
  }
  function drawStation(o,now){
   const hdr=o?`STEP ${step+1} OF 4: PICK THE ${STEPS[step].label}`:'GET READY…';
   P.text(g,hdr,135,206,{size:7,color:'#ffd36a',align:'center'});
   if(!o)return;
   const need=want(o,step),tut=firstShift&&!tutorialDone&&!o.tutorial;
   for(const b of binsFor(step)){
    const flashed=flashBin&&flashBin.value===b.value&&now<flashBinUntil,bad=flashed&&flashBin.bad,good=flashed&&!flashBin.bad;
    const hint=(!need||need===b.value); // every shift: match the highlighted order row to this bin
    P.rect(g,b.x+2,b.y+2,b.w,b.h,'#10101b');P.rect(g,b.x,b.y,b.w,b.h,bad?'#d7193f':good?'#20c66b':hint?'#ffd36a':'#f6efd9');P.rect(g,b.x+3,b.y+3,b.w-6,b.h-6,'#1e1a2a');
    P.rect(g,b.x+b.w/2-14,b.y+8,28,Math.min(24,b.h-30),SWATCH[b.value]||'#d9d2c7');
    P.text(g,`${binsFor(step).findIndex(bin=>bin.value===b.value)+1}: ${b.value}`,b.x+b.w/2,b.y+b.h-14,{size:6,color:'#f6efd9',align:'center'});
   }
  }
  function frame(now){
   if(raf===null)return;
   const dt=(now-last)/1000;last=now;J.update(dt);
   g.clearRect(0,0,270,480);
   J.begin();
   P.paintEnvironment(g,{sky:P.palette.night,wall:'#2a2340',floor:'#3a2f2a',horizon:150,seed:'slurp',props:[{type:'counter',x:0,y:150,w:270,h:14,color:'#4a3a30'}]});
   if(approvedKitchen.complete&&approvedKitchen.naturalWidth){g.imageSmoothingEnabled=false;g.drawImage(approvedKitchen,0,0,270,480);g.fillStyle='#08070f66';g.fillRect(0,0,270,480);}
   P.rect(g,0,0,270,28,'#17142c');P.text(g,'SLURP DYNASTY',72,9,{size:6,color:'#ff6fb5'});
   const elapsed=now-startTime;
   if(!ended){
    if(tickets.length===0||(now-lastOrderAt>=orderInterval(elapsed)&&tickets.length<3)){spawnOrder();lastOrderAt=now;}
    const o=current();
    if(o&&o.patienceStart!=null&&!o.tutorial&&now-o.patienceStart>PATIENCE_MS)walkout();
    if(now-startTime>=SHIFT_MS)finishShift();
   }
   const o=current(),left=SHIFT_MS-(now-startTime);
   P.text(g,mmss(left),6,9,{size:7,color:left<10000?'#d7193f':'#f6efd9'});
   drawOrderCard(o,now);
   // Rich at the counter + the bowl that builds
   if(!P.drawSprite?.(g,P.personSprite?.('rich','ramen_apron'),34,206))P.drawActor(g,{top:'#1b1824',bottom:'#111018',hair:'#0b0a12',hairShape:'locs',shades:true,accent:P.palette.green,prop:'food'},34,206,0.62);
   const bx=96,by=146;if(serving&&now<serving.until){drawBowl(bx+Math.round((1-(serving.until-now)/450)*110),by,serving.bowl,now);}else drawBowl(bx,by,bowl,now);
   if(tickets.length>1)P.text(g,`+${tickets.length-1} WAITING`,262,150,{size:6,color:'#ffd36a',align:'right'});
   drawStation(o,now);
   P.text(g,`$${money.toFixed(2)}`,8,462,{size:8,color:'#20c66b'});
   P.text(g,`WALKOUTS ${walkouts}/3`,92,462,{size:6,color:walkouts>=2?'#d7193f':'#c9c0a8'});
   P.text(g,`HINA ${hinaBest.toFixed(0)}`,196,462,{size:6,color:'#3d9ddd'});
   if(flash&&now<flashUntil)P.text(g,flash.text,135,128+(flashUntil-now<300?-6:0),{size:7,align:'center',color:flash.color});else flash=null;
   if(o){root.dataset.step=String(step);root.dataset.need=String(want(o,step)||'');}
   J.end();
   raf=requestAnimationFrame(frame);
  }
  raf=requestAnimationFrame(frame);
  return {
   dispose(){
    const r=raf;raf=null;if(r)cancelAnimationFrame(r);
    canvas.removeEventListener('pointerdown',pointerDown);
    window.removeEventListener('keydown',keyDown);
    try{clockBtn.remove();}catch(e){}
   }
  };
 }

 window.RAMinigames.register('slurp',{title:'SLURP',rule:'Tap ingredients left to right or use keys 1–4: broth, noodles, meat, topping; match the ticket before its patience runs out.',ruleFor:p=>p?.canopyDuty?'Drag chair bundles from the stack into the canopy before the timer ends.':null,mount});
})();
