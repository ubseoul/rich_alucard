(function(){
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
  const HOLD_RATE=46,FALL_RATE=30;
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
 function isSnapped(state){return !!state&&(state.overTime||0)>=1500;}

 window.RAMinigameLogic=window.RAMinigameLogic||{};
 window.RAMinigameLogic.pier={catchTable,rollCatch,tensionStep,isSnapped};

 function truthy(v){return v===true||v==='true'||v===1||v==='1';}
 function num(v,def){const n=Number(v);return Number.isFinite(n)?n:def;}

 function mount(root,ctx){
  if(!window.RAPixel||!root)return {dispose(){}};
  const params=ctx.params||{};
  const rain=truthy(params.rain),uncleSunday=truthy(params.uncleSunday),tutorial=truthy(params.tutorial),lab=truthy(params.lab);
  const {canvas,ctx:g,toNative}=R.createCanvas(root);
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
   const n=Math.floor(rng()*3); // 0-2 fakes before the real bite
   const events=[];let t=0.6+rng()*0.8;
   for(let i=0;i<n;i++){events.push({t,kind:'fake',dur:0.35+rng()*0.2});t+=0.7+rng()*1.1;}
   events.push({t,kind:'real',dur:0.8+rng()*0.3});
   return events;
  }

  function startCast(){S.phase='cast';S.power=0;S.charging=false;}
  function startWait(){
   S.phase='wait';S.waitSchedule=newSchedule();S.waitIndex=0;S.waitClock=0;S.waitEventActive=false;S.scaredUntil=0;
  }
  function startReel(caught){
   S.phase='reel';S.currentCatch=caught;S.tension=0;S.overTime=0;S.progress=0;S.leanDir=0;
   const big=caught.category==='big';
   S.bigOnLine=big;S.fish={pull:0,big};S.fishClock=0;
  }
  function resolveCatch(caught,landed){
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
   if(c.kind==='gun_part')ctx.reward({items:{gun_part:1}});
   else if(c.kind==='sensei_memento')ctx.reward({items:{sensei_memento:1}});
   else ctx.reward({flags:{},sealedSlots:[c.sealedSlot]});
   prevProgress.everCaught=true;saveNow();
   S.phase='result';S.result={landed:true,caught:c,chest:true};
   flash('CHEST OPENED.',1200);
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
    const caught=forceCommon?buildCatch('common',rng):rollCatch(rng,{rain});
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
   R.drawActor(g,{top:'#111018',bottom:'#0c0a14',hair:'#050408',hairShape:'locs',shades:true,skin:'#7a5236',accent:'#3a6ff0'},70,392,1.05);
   if(holding){
    R.rect(g,104,356,26,3,'#211d33'); // extended arm bar
    drawFish(S.result.caught,124,352,0.7);
   } else if(S.phase!=='intro'){
    R.rect(g,84,368,3,-38+390-352,'#211d33'); // rod (rough)
    R.rect(g,84,332,42,2,'#c9bfa6'); // line hint
   }
  }
  function drawFish(caught,x,y,scale){
   if(!caught)return;
   const cat=caught.category;
   const col=cat==='rare'?'#f4c95d':cat==='big'?'#7fa8ff':cat==='junk'?'#8a8a8a':'#c7d6e8';
   g.save();g.translate(x,y);g.scale(scale,scale);
   R.rect(g,-10,-5,20,10,col);R.rect(g,-14,-2,5,4,col);R.rect(g,8,-7,4,4,'#0008');
   g.restore();
  }
  function drawUncle(now){
   if(!uncleSunday)return;
   R.drawActor(g,{top:'#3a2f2a',bottom:'#26221f',hair:'#1a1410',hairShape:'hat',skin:'#6b4326',accent:'#c18b3c'},210,392,0.95);
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
    R.text(g,'hold to reel, don’t let tension snap',30,292,{size:6,color:'#10101b',maxWidth:200});
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
    R.text(g,`$${S.walletPrompt.value} INSIDE.`,34,224,{size:7,color:'#10101b'});
    buttons.push({id:'walletKeep',x:30,y:268,w:100,h:24});buttons.push({id:'walletReturn',x:140,y:268,w:100,h:24});
    R.rect(g,30,268,100,24,'#c18b3c');R.text(g,'KEEP CASH',35,276,{size:7,color:'#10101b'});
    R.rect(g,140,268,100,24,'#20c66b');R.text(g,'RETURN IT',150,276,{size:7,color:'#10101b'});
   }
   if(S.phase==='rare'){
    R.frame(g,20,190,230,120,{});
    R.text(g,S.rarePrompt.name,34,206,{size:7,color:'#10101b',maxWidth:200});
    R.text(g,`WORTH $${S.rarePrompt.value}`,34,224,{size:7,color:'#10101b'});
    buttons.push({id:'rareSell',x:30,y:268,w:100,h:24});buttons.push({id:'rareKeep',x:140,y:268,w:100,h:24});
    R.rect(g,30,268,100,24,'#c18b3c');R.text(g,'SELL',60,276,{size:7,color:'#10101b'});
    R.rect(g,140,268,100,24,'#3d9ddd');R.text(g,'FISH TANK',150,276,{size:7,color:'#f6efd9'});
   }
   if(S.phase==='chest'){
    R.frame(g,20,190,230,120,{});
    const c=S.chestReveal;
    R.rect(g,116,206,38,30,'#6b6780');R.rect(g,116,206,38,4,'#c18b3c');
    if(c.kind==='sealed')R.text(g,'...',126,246,{size:10,color:'#10101b'});
    else if(c.kind==='gun_part')R.text(g,'GUN PART (-20% ARMORY)',34,246,{size:6,color:'#10101b',maxWidth:200});
    else R.text(g,"OCTOPUS SENSEI MEMENTO",34,246,{size:6,color:'#10101b',maxWidth:200});
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
     if(S.waitClock>=ev.t){S.waitEventActive=true;S.waitEventKind=ev.kind;S.waitEventUntil=S.waitClock+ev.dur;}
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
    tensionStep(S,{holding:pointerIsDown,dt,fish:S.fish});
    S.progress=Math.max(0,Math.min(100,S.progress+(pointerIsDown?dt*22:-dt*6)));
    if(isSnapped(S)){resolveCatch(S.currentCatch,false);}
    else if(S.progress>=100){resolveCatch(S.currentCatch,true);}
   }
   if(uncleSunday&&now>S.uncleNext){
    S.uncleLine=pick(rng,['have you eaten?','patience. the fish can smell fear.','you gonna eat that boot?']);
    S.uncleLineUntil=now+2600;S.uncleNext=now+7000+rng()*6000;
   }
   g.clearRect(0,0,270,480);
   env();drawUncle(now);drawBobber();drawRich();drawHUD(now);
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

 if(window.RAMinigames)RAMinigames.register('pier',{title:'PIER',mount});
})();
