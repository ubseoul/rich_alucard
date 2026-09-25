(function(){
 // HATCH — the dragon app. A care screen for Blueberry Mazda (Neopets meets Fable, game-inside-game).
 const R=window.RAPixel;
 const STAGES=['egg','hatchling','young','majestic'];
 const BODY='#3a6ff0',BELLY='#8fb4ff',HORN='#f0e6c8';

 function pick(rng,arr){return arr[Math.floor(rng()*arr.length)%arr.length];}

 function poseFor(dragon){
  dragon=dragon||{};
  if(dragon.sulking)return 'sulk';
  if(!dragon.fedToday)return 'hungry';
  if(dragon.playedToday||(dragon.bond||0)>=60)return 'happy';
  return 'neutral';
 }
 function availableActions(dragon,inventory,catOwned){
  dragon=dragon||{};
  if((dragon.stage||'egg')==='egg')return ['keepWarm'];
  const actions=['feed','play','talk'];
  if(catOwned)actions.push('feedCat');
  return actions;
 }
 function chirp(stage,rng){
  rng=rng||Math.random;
  const early=['mrrp.','prrt?','*sneeze*','mrr.','skree?'];
  const words=['rich. fish.','warm now.','more crumble.','play again?','fish. now.'];
  if(stage==='majestic')return rng()<0.5?pick(rng,words):pick(rng,early);
  return pick(rng,early);
 }

 window.RAMinigameLogic=window.RAMinigameLogic||{};
 window.RAMinigameLogic.hatch={stages:STAGES,poseFor,availableActions,chirp};

 function truthy(v){return v===true||v==='true'||v===1||v==='1';}
 function numOr(v,def){const n=Number(v);return Number.isFinite(n)?n:def;}
 function parseMaybe(v){if(typeof v!=='string')return v;try{return JSON.parse(v);}catch(e){return null;}}

 function normalizeDragon(params){
  let d=parseMaybe(params.dragon)||params.dragon||{};
  d=Object.assign({name:'BLUEBERRY MAZDA',stage:'egg',fedToday:false,playedToday:false,sulking:false,bond:0,personality:null,form:'dragon'},d);
  if(params.stage)d.stage=params.stage; // lab shortcut
  if(!STAGES.includes(d.stage))d.stage='egg';
  d.bond=numOr(d.bond,0);d.fedToday=truthy(d.fedToday);d.playedToday=truthy(d.playedToday);d.sulking=truthy(d.sulking);
  return d;
 }
 function normalizeInventory(params){
  let inv=parseMaybe(params.inventory)||params.inventory||{};
  inv=Object.assign({fish_common:0,treats:0,dragon_keef:0,agege_bread:0,maggi_dragon_crumble:0},inv);
  for(const k of Object.keys(inv))inv[k]=numOr(inv[k],0);
  if(params.fish!=null)inv.fish_common=numOr(params.fish,inv.fish_common);
  if(params.treats!=null)inv.treats=numOr(params.treats,inv.treats);
  if(params.keef!=null)inv.dragon_keef=numOr(params.keef,inv.dragon_keef);
  if(params.bread!=null)inv.agege_bread=numOr(params.bread,inv.bread);
  if(params.crumble!=null)inv.maggi_dragon_crumble=numOr(params.crumble,inv.maggi_dragon_crumble);
  return inv;
 }

 const FOOD_LABEL={fish_common:'FISH',treats:'TREATS',dragon_keef:'DRAGON KEEF',agege_bread:'AGEGE BREAD',maggi_dragon_crumble:'DRAGON MAGGI CRUMBLE'};

 function mount(root,ctx){
  if(!window.RAPixel||!root)return {dispose(){}};
  const params=ctx.params||{};
  const lab=truthy(params.lab);
  const dragon=normalizeDragon(params);
  const inventory=normalizeInventory(params);
  const catOwned=truthy(params.catOwned);
  const catFedFirstToday=truthy(params.catFedFirstToday);
  const prevProgress=ctx.progress()||{};
  const {canvas,ctx:g,toNative}=R.createCanvas(root);
  const rng=R.rng('hatch-'+Date.now()+'-'+Math.random());

  const sessionActions=[];const consumed={};
  let keefIntroduced=!!prevProgress.keefIntroduced;
  let overlay=null; // {type:'food'|'confirmBread'|'talk'|'flavor',text,...}
  let overlayUntil=0;
  let play=null; // active PLAY mini-moment
  let sparkClock=0,sparks=[];

  function addAction(type,extra){
   const a={type,...extra};sessionActions.push(a);
   const partial={dragonActions:[a]};
   if(extra&&extra.food){partial.consumed={[extra.food]:1};consumed[extra.food]=(consumed[extra.food]||0)+1;}
   ctx.reward(partial);
  }

  function doKeepWarm(){addAction('keepWarm');flashOverlay('flavor','KEEPING THE EGG WARM.',1100);}
  function openFeedMenu(){
   const foods=Object.keys(FOOD_LABEL).filter(k=>inventory[k]>0);
   if(!foods.length){flashOverlay('flavor','NOTHING TO FEED HER WITH.',1200);return;}
   overlay={type:'food',foods};
  }
  function chooseFood(food){
   if(food==='agege_bread'){overlay={type:'confirmBread'};return;}
   commitFeed(food);
  }
  function commitFeed(food){
   inventory[food]=Math.max(0,inventory[food]-1);
   dragon.fedToday=true;
   addAction('feed',{food});
   overlay=null;
   if(food==='dragon_keef'&&!keefIntroduced){
    keefIntroduced=true;ctx.saveProgress({keefIntroduced:true});
    flashOverlay('flavor','this is reggie not keef.',1400);
   } else if(food==='maggi_dragon_crumble'){
    dragon.happiest=true;flashOverlay('flavor','HER FAVORITE. SHE LIGHTS UP.',1300);
   } else if(food==='agege_bread'){
    flashOverlay('flavor','THE AGEGE BREAD. LEGENDARY.',1400);
   } else {
    flashOverlay('flavor',`FED ${FOOD_LABEL[food]}.`,1000);
   }
  }
  function startPlay(){
   if(dragon.sulking){flashOverlay('flavor','SHE’S NOT IN THE MOOD.',1100);return;}
   const game=rng()<0.5?'fetch':'goldfish';
   play={game,hits:0,need:5,t:0,dur:10,item:{x:135,y:260,vx:(rng()<0.5?1:-1)*70,vy:-50},flakes:game==='goldfish'?spawnFlakes():null};
  }
  function spawnFlakes(){const arr=[];for(let i=0;i<5;i++)arr.push({x:20+rng()*230,y:-20-rng()*100,v:40+rng()*30,hit:false});return arr;}
  function endPlay(success){
   dragon.playedToday=true;
   addAction('play',{game:play.game,success});
   flashOverlay('flavor',success?'SHE’S THRILLED.':'GOOD EFFORT.',1100);
   play=null;
  }
  function doTalk(){
   const line=chirp(dragon.stage,rng);
   addAction('talk');
   overlay={type:'talk',text:line};overlayUntil=performance.now()+1500;
  }
  function doFeedCat(){
   addAction('feedCat');
   dragon.sulking=true;
   flashOverlay('flavor','THE CAT EATS FIRST. SHE SAW.',1400);
  }
  function flashOverlay(type,text,ms){overlay={type,text};overlayUntil=performance.now()+(ms||1200);}

  function onDone(){
   ctx.finish({outcome:'done',summary:`${sessionActions.length} ACTION${sessionActions.length===1?'':'S'}`,data:{actions:sessionActions}});
  }

  let buttons=[];
  function hitButton(x,y){for(const b of buttons)if(x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h)return b.id;return null;}
  function onDown(e){
   const p=e.touches?e.touches[0]:e;const n=toNative(p.clientX,p.clientY);
   if(play){
    if(play.game==='fetch'){
     const it=play.item,dx=n.x-it.x,dy=n.y-it.y;
     if(dx*dx+dy*dy<20*20){play.hits++;it.vx*=-1.1;it.vy=-90;if(play.hits>=play.need)endPlay(true);}
     return;
    } else {
     for(const f of play.flakes){if(!f.hit&&Math.abs(n.x-f.x)<14&&Math.abs(n.y-f.y)<14){f.hit=true;play.hits++;if(play.hits>=play.need)endPlay(true);}}
     return;
    }
   }
   const btn=hitButton(n.x,n.y);
   if(!btn)return;
   if(btn==='keepWarm')doKeepWarm();
   else if(btn==='feed')openFeedMenu();
   else if(btn==='play')startPlay();
   else if(btn==='talk')doTalk();
   else if(btn==='cat')doFeedCat();
   else if(btn==='done')onDone();
   else if(btn.startsWith('food:'))chooseFood(btn.slice(5));
   else if(btn==='breadYes')commitFeed('agege_bread');
   else if(btn==='breadNo')overlay=null;
   else if(btn==='dismiss')overlay=null;
  }
  canvas.addEventListener('pointerdown',onDown);

  // ---- render ----
  function backdrop(){
   if(dragon.stage==='majestic'){
    R.paintEnvironment(g,{sky:'#0b1024',wall:'#1d1a33',floor:'#141225',horizon:360,seed:'hatch-castle',stars:24,
     props:[{type:'rect',x:0,y:340,w:270,h:6,color:'#2a2440'},{type:'rect',x:0,y:346,w:270,h:134,color:'#1a1730'},
      {type:'rect',x:30,y:300,w:14,h:46,color:'#2a2440'},{type:'rect',x:226,y:300,w:14,h:46,color:'#2a2440'}]});
   } else {
    R.paintEnvironment(g,{sky:'#7fb0e8',wall:'#a9cdf0',floor:'#cfe6c0',horizon:360,seed:'hatch-room',stars:0,
     props:[{type:'window',x:70,y:40,w:130,h:90,color:'#bfe0ff'},{type:'rect',x:0,y:356,w:270,h:124,color:'#c9a876'}]});
   }
  }
  // Frozen ART SHIP 005 Blueberry Mazda egg (32×32 prop master) at an integer 2× nearest-neighbour scale, centred
  // where the placeholder egg sat; the placeholder shape remains only until the image has loaded.
  const eggSrc=window.RAArtRegistry?.props?.mazda_egg?.asset,eggImg=eggSrc?Object.assign(new Image(),{src:eggSrc}):null;
  function eggShape(){
   if(eggImg?.complete&&eggImg.naturalWidth){const k=2,w=eggImg.naturalWidth*k,h=eggImg.naturalHeight*k;R.rect(g,135-w/2-4,220+h/2-6,w+8,10,'rgba(255,220,140,.15)');g.imageSmoothingEnabled=false;g.drawImage(eggImg,135-w/2,220-h/2,w,h);return;}
   R.rect(g,105,190,60,10,'rgba(255,220,140,.15)');
   R.rect(g,112,180,46,80,'#2540a0');R.rect(g,118,186,34,68,'#3a6ff0');
   for(let i=0;i<10;i++){const sx=118+((i*13)%34),sy=190+((i*23)%56);R.rect(g,sx,sy,3,3,'#8fb4ff');}
  }
  function hatchlingShape(pose){
   const bob=pose==='happy'?Math.sin(performance.now()/220)*3:0;
   const yOff=pose==='sulk'?6:0;
   R.rect(g,110,236+bob,50,34,BODY); // body
   R.rect(g,150+yOff,224+bob,28,26,BODY); // big head
   R.rect(g,156+yOff,232+bob,16,12,BELLY);
   R.rect(g,158+yOff,214+bob,4,6,HORN);R.rect(g,168+yOff,214+bob,4,6,HORN);
   R.rect(g,104,244+bob,10,16,BODY);R.rect(g,102,240+bob,14,6,'#274fb0'); // tiny wing
   if(pose==='sulk'){R.rect(g,150,224,28,26,'#274fb0');} // faces away, darker silhouette
   R.rect(g,110,268,50,4,'rgba(0,0,0,.2)');
   if(sparks.length)for(const s of sparks)R.rect(g,s.x,s.y,2,2,'#ffd98a');
  }
  function youngShape(pose){
   const bob=pose==='happy'?Math.sin(performance.now()/260)*3:0;
   R.rect(g,88,232+bob,90,60,BODY);
   R.rect(g,166,206+bob,20,36,BODY); // neck
   R.rect(g,176,190+bob,26,24,BODY); // head
   R.rect(g,184,198+bob,12,10,BELLY);
   R.rect(g,182,180+bob,5,10,HORN);R.rect(g,196,180+bob,5,10,HORN);
   R.rect(g,100,240+bob,20,26,'#274fb0');
   R.rect(g,88,286,90,6,'rgba(0,0,0,.2)');
   if(pose==='sulk'){R.rect(g,176,190,26,24,'#274fb0');}
  }
  function majesticShape(pose){
   const bob=pose==='happy'?Math.sin(performance.now()/300)*2:0;
   R.rect(g,40,240+bob,190,140,BODY);
   R.rect(g,150,180+bob,40,66,BODY);
   R.rect(g,168,150+bob,50,44,BODY);
   R.rect(g,180,160+bob,22,18,BELLY);
   R.rect(g,178,130+bob,8,20,HORN);R.rect(g,202,130+bob,8,20,HORN);
   R.rect(g,10,220+bob,60,90,'#274fb0');R.rect(g,190,190+bob,70,90,'#274fb0'); // great wings
   R.rect(g,40,378,190,8,'rgba(0,0,0,.25)');
   if(pose==='sulk'){R.rect(g,168,150,50,44,'#1c356e');}
  }
  function drawDragon(){
   const pose=poseFor(dragon);
   if(dragon.stage==='egg')eggShape();
   else if(dragon.stage==='hatchling')hatchlingShape(pose);
   else if(dragon.stage==='young')youngShape(pose);
   else majesticShape(pose);
   let label=dragon.stage.toUpperCase();
   if(pose==='hungry')label+=' · HUNGRY';else if(pose==='sulk')label+=' · SULKING';else if(pose==='happy')label+=' · HAPPY';
   const dark=dragon.stage==='majestic';
   R.text(g,dragon.name,8,8,{size:8,color:dark?'#f6efd9':'#10101b'});
   R.text(g,label,8,20,{size:6,color:dark?'rgba(246,239,217,.75)':'rgba(16,16,27,.7)'});
  }
  function drawButtons(){
   buttons=[];
   const y=430,h=30;
   if(dragon.stage==='egg'){
    buttons.push({id:'keepWarm',x:60,y,w:150,h});
    R.rect(g,60,y,150,h,'#3a6ff0');R.text(g,'KEEP WARM',95,y+10,{size:7,color:'#f6efd9'});
   } else {
    const labels=[{id:'feed',t:'FEED'},{id:'play',t:'PLAY'},{id:'talk',t:'TALK'}];
    if(catOwned)labels.push({id:'cat',t:'CAT'});
    const w=Math.floor(250/labels.length);
    labels.forEach((b,i)=>{
     const x=10+i*w;buttons.push({id:b.id,x,y,w:w-4,h});
     R.rect(g,x,y,w-4,h,'#3a6ff0');R.text(g,b.t,x+6,y+10,{size:7,color:'#f6efd9'});
    });
   }
   buttons.push({id:'done',x:200,y:8,w:0,h:0}); // placeholder no-op (host QUIT lives here); real DONE below
   buttons.pop();
   R.rect(g,10,y-38,60,20,'#20c66b');R.text(g,'DONE',20,y-32,{size:7,color:'#10101b'});
   buttons.push({id:'done',x:10,y:y-38,w:60,h:20});
  }
  function drawOverlay(now){
   if(!overlay)return;
   if(overlay.type==='flavor'){
    if(now>overlayUntil){overlay=null;return;}
    R.frame(g,20,340,230,50,{});
    R.text(g,overlay.text,30,358,{size:6,color:'#10101b',maxWidth:210});
    return;
   }
   if(overlay.type==='talk'){
    if(now>overlayUntil){overlay=null;return;}
    R.frame(g,60,150,150,40,{});
    R.text(g,overlay.text,70,166,{size:8,color:'#10101b',maxWidth:130});
    return;
   }
   if(overlay.type==='food'){
    R.frame(g,20,150,230,200,{});
    R.text(g,'FEED WHAT?',34,164,{size:8,color:'#10101b'});
    overlay.foods.forEach((f,i)=>{
     const by=190+i*30;
     buttons.push({id:'food:'+f,x:30,y:by,w:210,h:24});
     R.rect(g,30,by,210,24,'#c18b3c');R.text(g,`${FOOD_LABEL[f]} (${inventory[f]})`,38,by+8,{size:6,color:'#10101b'});
    });
    buttons.push({id:'dismiss',x:30,y:320,w:100,h:20});
    R.rect(g,30,320,100,20,'#6b6780');R.text(g,'NEVER MIND',38,326,{size:6,color:'#f6efd9'});
    return;
   }
   if(overlay.type==='confirmBread'){
    R.frame(g,20,180,230,120,{});
    R.text(g,'USE THE AGEGE BREAD?',30,198,{size:7,color:'#10101b',maxWidth:200});
    buttons.push({id:'breadYes',x:30,y:250,w:100,h:24});buttons.push({id:'breadNo',x:140,y:250,w:100,h:24});
    R.rect(g,30,250,100,24,'#20c66b');R.text(g,'YES',65,258,{size:7,color:'#10101b'});
    R.rect(g,140,250,100,24,'#d7193f');R.text(g,'NO',180,258,{size:7,color:'#f6efd9'});
    return;
   }
  }
  function drawPlay(now,dt){
   if(!play)return;
   play.t+=dt;
   R.rect(g,10,60,250,300,'rgba(8,7,15,.6)');
   R.text(g,play.game==='fetch'?'FETCH THE SAPPORO':'CATCH THE FLAKES',20,70,{size:7,color:'#f6efd9'});
   R.text(g,`${play.hits}/${play.need}`,20,86,{size:7,color:'#20c66b'});
   if(play.game==='fetch'){
    const it=play.item;
    it.x+=it.vx*dt;it.y+=it.vy*dt;it.vy+=140*dt;
    if(it.x<30||it.x>240)it.vx*=-1;
    if(it.y>330){it.y=330;it.vy=-Math.abs(it.vy)*0.8;}
    R.rect(g,it.x-8,it.y-10,16,20,'#c9d6de');R.rect(g,it.x-8,it.y-10,16,4,'#e0473f');
   } else {
    for(const f of play.flakes){if(f.hit)continue;f.y+=f.v*dt;if(f.y>330)f.y=-10;R.rect(g,f.x-4,f.y-4,8,8,'#ffd98a');}
   }
   if(play.t>=play.dur)endPlay(play.hits>=play.need);
  }

  let raf=null,last=performance.now();
  function loop(now){
   const dt=Math.min(0.05,(now-last)/1000);last=now;
   if(dragon.stage==='hatchling'){
    sparkClock-=dt;
    if(sparkClock<=0){sparkClock=1.4+rng()*1.4;sparks=[{x:150+rng()*20,y:220,life:0.4}];}
    sparks=sparks.filter(s=>{s.y-=40*dt;s.life-=dt;return s.life>0;});
   }
   g.clearRect(0,0,270,480);
   backdrop();drawDragon();
   if(!play)drawButtons();
   drawPlay(now,dt);
   drawOverlay(now);
   raf=requestAnimationFrame(loop);
  }
  raf=requestAnimationFrame(loop);

  return {dispose(){if(raf)cancelAnimationFrame(raf);canvas.removeEventListener('pointerdown',onDown);}};
 }

 if(window.RAMinigames)RAMinigames.register('hatch',{title:'HATCH',mount});
})();
