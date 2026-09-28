(function(){
 'use strict';
 const R=window.RAPixel;
 const tunables=()=>window.RANewOgaTunables.m5;
 function config(overrides={}){
  const t=tunables();return {...t,SONG_SECONDS:Number(overrides.durationSeconds)>0?Number(overrides.durationSeconds):t.SONG_SECONDS};
 }
 function payout(amount,cfg=config()){
  const caught=Math.max(0,Math.min(cfg.AUTHORED_DEBT_TARGET,Math.trunc(Number(amount)||0)));
  return Math.floor(caught*cfg.AUTHORED_KEEP_NUMERATOR/cfg.AUTHORED_KEEP_DENOMINATOR);
 }
 function catchAttention(attention,elapsedSinceCatch,cfg=config()){
  const burst=Number.isFinite(elapsedSinceCatch)&&elapsedSinceCatch<=cfg.QUICK_CATCH_WINDOW_MS?cfg.QUICK_CATCH_ACCELERATION:0;
  return Math.min(cfg.ATTENTION_MAX,Math.max(0,attention)+cfg.ATTENTION_RISE+burst);
 }
 function decayAttention(attention,elapsedMs,cfg=config()){return Math.max(0,attention-cfg.ATTENTION_DECAY_PER_SECOND*Math.max(0,elapsedMs)/1000);}
 function resolve({amountCaught=0,attention=0,elapsedMs=0,backout=false}={},cfg=config()){
  if(backout)return 'BACK_OUT';
  if(amountCaught>=cfg.AUTHORED_DEBT_TARGET)return 'SUCCESS';
  if(attention>=cfg.ATTENTION_MAX)return 'GREEDY';
  if(elapsedMs>=cfg.SONG_SECONDS*1000)return 'SHORT';
  return null;
 }
 function simulateCatchSchedule(catchTimes=[],cfg=config()){
  let attention=0,amountCaught=0,lastTime=0,lastCatch=-Infinity,outcome=null;
  for(const raw of catchTimes){const time=Math.max(lastTime,Number(raw)||0);attention=decayAttention(attention,time-lastTime,cfg);amountCaught+=cfg.BILL_VALUE;attention=catchAttention(attention,time-lastCatch,cfg);lastCatch=time;lastTime=time;outcome=resolve({amountCaught,attention,elapsedMs:time},cfg);if(outcome)break;}
  if(!outcome){attention=decayAttention(attention,cfg.SONG_SECONDS*1000-lastTime,cfg);outcome=resolve({amountCaught,attention,elapsedMs:cfg.SONG_SECONDS*1000},cfg);}
  return {outcome,amountCaught:Math.min(amountCaught,cfg.AUTHORED_DEBT_TARGET),attention,payout:outcome==='SUCCESS'||outcome==='SHORT'?payout(amountCaught,cfg):0};
 }
 function backOutHit(x,y){return x>=20&&x<=250&&y>=430&&y<=460;}
 window.RAMinigameLogic=window.RAMinigameLogic||{};
 window.RAMinigameLogic.owambeCollection={config,payout,catchAttention,decayAttention,resolve,simulateCatchSchedule,backOutHit};

 function mount(root,ctx){
  if(!R||!root)return {dispose(){}};
  const cfg=config(ctx.params||{}),scale=Math.max(1,Math.min(20,Number(ctx.params?.timeScale)||1));
  const {canvas,ctx:g,toNative}=R.createCanvas(root),rng=R.rng(`owambe-${ctx.params?.seed||'m5'}`);
  root.dataset.phase='run';root.dataset.input='pointer';
  let elapsedMs=0,spawnClock=0,attention=0,amountCaught=0,lastCatch=-Infinity,terminal=null,raf=null,last=performance.now(),nextId=1;
  const bills=[];
  function spawn(){bills.push({id:nextId++,x:24+rng()*222,y:92+rng()*34,v:24+rng()*18,born:elapsedMs});}
  function finish(outcome){
   if(terminal)return;terminal=outcome;root.dataset.phase='results';root.dataset.outcome=outcome;
   const kept=outcome==='SUCCESS'||outcome==='SHORT'?payout(amountCaught,cfg):0;
   const card=document.createElement('div');card.className='owambe-result';card.style.cssText='position:absolute;inset:0;z-index:6;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:22px;background:rgba(8,7,15,.94);color:#f6efd9;text-align:center;font-family:"Press Start 2P",monospace';
   card.innerHTML=`<div style="color:#c18b3c;font-size:11px">${outcome.replace('_',' ')}</div><div style="font-size:8px">CAUGHT $${amountCaught.toLocaleString()}</div><div style="font-size:7px">RICH KEEPS $${kept.toLocaleString()}</div>`;
   const done=document.createElement('button');done.type='button';done.className='owambe-done';done.textContent='DONE';done.style.cssText='font:8px "Press Start 2P";padding:.8em 1em;background:#f6efd9;color:#10101b;border:2px solid #10101b;cursor:pointer';
   done.addEventListener('click',()=>ctx.finish({outcome:outcome.toLowerCase(),score:amountCaught,data:{result:outcome,amountCaught,attention,payout:kept}}));card.append(done);root.append(card);
  }
  function catchAt(x,y){
   if(terminal)return;let caught=0;
   for(let i=bills.length-1;i>=0;i--){const b=bills[i];if(Math.abs(x-b.x)<=20&&Math.abs(y-b.y)<=14){bills.splice(i,1);caught++;}}
   if(!caught)return;
   for(let i=0;i<caught;i++){amountCaught=Math.min(cfg.AUTHORED_DEBT_TARGET,amountCaught+cfg.BILL_VALUE);attention=catchAttention(attention,elapsedMs-lastCatch,cfg);lastCatch=elapsedMs;}
   const outcome=resolve({amountCaught,attention,elapsedMs},cfg);if(outcome)finish(outcome);
  }
  function pointerDown(e){const p=toNative(e.clientX,e.clientY);if(backOutHit(p.x,p.y)){finish('BACK_OUT');return;}catchAt(p.x,p.y);}
  const pointerMove=e=>{if(e.buttons||e.pressure>0){const p=toNative(e.clientX,e.clientY);catchAt(p.x,p.y);}};canvas.addEventListener('pointerdown',pointerDown);canvas.addEventListener('pointermove',pointerMove);
  function draw(){
   R.paintEnvironment(g,{sky:'#170d27',wall:'#4d214b',floor:'#3d302d',horizon:326,seed:'bamidele-60',props:[{type:'string',x1:8,x2:262,y:70,color:'#ffd36a'},{type:'sign',x:38,y:98,w:194,h:20,text:"UNCLE BAMIDELE'S 60TH",glow:'#ffb040'}],crowd:18,crowdColors:['#9d5ca8','#2b8c75','#d18b3f']});
   R.text(g,`COLLECT $${amountCaught.toLocaleString()} / $${cfg.AUTHORED_DEBT_TARGET.toLocaleString()}`,10,12,{size:7,color:'#f6efd9'});
   R.text(g,`SONG ${Math.max(0,Math.ceil(cfg.SONG_SECONDS-elapsedMs/1000))}`,10,28,{size:6,color:'#f6efd9'});
   R.text(g,'ATTENTION',10,44,{size:6,color:'#f6efd9'});R.rect(g,78,42,180,10,'#21182c');R.rect(g,80,44,176*Math.min(1,attention/cfg.ATTENTION_MAX),6,attention>70?'#d7193f':'#c18b3c');
   for(const b of bills){R.rect(g,b.x-15,b.y-7,30,14,'#d9d2a4');R.rect(g,b.x-10,b.y-4,20,8,'#7aa06a');R.text(g,'$',b.x-3,b.y-4,{size:6,color:'#16311c'});}
   R.rect(g,20,430,230,30,'#7d194b');R.text(g,'DANCE WITH UNCLE · BACK OUT',34,440,{size:6,color:'#f6efd9'});
   root.dataset.amountCaught=String(amountCaught);root.dataset.attention=attention.toFixed(2);root.dataset.billTargets=JSON.stringify(bills.map(b=>[Math.round(b.x),Math.round(b.y)]));
  }
  function loop(now){
   const real=Math.min(50,now-last);last=now;if(!terminal){const dt=real*scale;elapsedMs+=dt;spawnClock+=dt;attention=decayAttention(attention,dt,cfg);while(spawnClock>=cfg.BILL_SPAWN_MS){spawnClock-=cfg.BILL_SPAWN_MS;spawn();}for(const b of bills)b.y+=b.v*dt/1000;for(let i=bills.length-1;i>=0;i--)if(elapsedMs-bills[i].born>=cfg.BILL_LIFETIME_MS||bills[i].y>412)bills.splice(i,1);const outcome=resolve({amountCaught,attention,elapsedMs},cfg);if(outcome)finish(outcome);draw();}raf=requestAnimationFrame(loop);
  }
  raf=requestAnimationFrame(loop);
  return {dispose(){if(raf)cancelAnimationFrame(raf);canvas.removeEventListener('pointerdown',pointerDown);canvas.removeEventListener('pointermove',pointerMove);}};
 }
 if(window.RAMinigames)RAMinigames.register('owambe_collection',{title:'OWAMBE COLLECTION',mount});
})();
