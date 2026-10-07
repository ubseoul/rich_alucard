(function(){
 // RC2: 5x the clouds (incl. many tiny ones), 2x faster, plus the odd plane and a flock of birds.
 const CLOUD_TIMING={spawnGapMin:7000,spawnGapMax:19000,maxVisible:10,initialCount:6,initialSecondChance:.26,initialXMin:20,initialYMin:18,initialYMax:225,initialSeparationY:26,speed:{large:2.2,medium:2.7,small:3.2,tiny:3.8,micro:4.4},yMin:18,yMax:225,planeGapMin:30000,planeGapMax:75000,birdGapMin:22000,birdGapMax:50000};
 const RICH_AMBIENT_TIMING={gapMin:17000,gapMax:39000,scrollMin:1900,scrollMax:3900,smallIdleMin:2200,smallIdleMax:3600,reactionMin:1400,reactionMax:2200,smallIdleChance:.17,reactionChance:.045};
 const states={lounge_idle:'rich_bedroom_lounge_idle.png',phone_scroll:'rich_bedroom_phone_scroll.png',small_idle:'rich_bedroom_small_idle.png',phone_reaction:'rich_bedroom_phone_reaction.png',sleeping:'rich_bedroom_sleeping.png',drowsy_wake:'rich_bedroom_drowsy_wake.png'};
 const sizes={large:{file:'bedroom_cloud_large.png',w:136},medium:{file:'bedroom_cloud_medium.png',w:88},small:{file:'bedroom_cloud_small.png',w:52},tiny:{file:'bedroom_cloud_small.png',w:26,scale:.5},micro:{file:'bedroom_cloud_small.png',w:13,scale:.25}};
 const scene=document.querySelector('#bedroomScene'),canvas=document.querySelector('#bedroomCloudCanvas'),rich=document.querySelector('#bedroomRich'),ctx=canvas.getContext('2d',{alpha:true});
 ctx.imageSmoothingEnabled=false;
 const cloudImages=Object.fromEntries(Object.entries(sizes).map(([key,s])=>{const img=new Image();img.src=`assets/${s.file}`;return[key,img]}));
 const maskImage=new Image();
 let windowMask=null;
 maskImage.onload=()=>{const m=document.createElement('canvas');m.width=270;m.height=480;const c=m.getContext('2d',{willReadFrequently:true});c.drawImage(maskImage,0,0);const data=c.getImageData(0,0,270,480),pixels=data.data;for(let i=0;i<pixels.length;i+=4){const inside=pixels[i]===61&&pixels[i+1]===157&&pixels[i+2]===221;pixels[i]=255;pixels[i+1]=255;pixels[i+2]=255;pixels[i+3]=inside?255:0}c.putImageData(data,0,0);windowMask=m};maskImage.src='assets/rich_bedroom_environment_270x480.png';
 let active=false,forced=false,clouds=[],raf=0,ambientTimer=0,cloudTimer=0,lastFrame=0,sceneScope=null;
 const rand=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
 function setRichState(state){if(!states[state])return;rich.src=`assets/${states[state]}`;rich.dataset.state=state;if(window.RADevState){window.RADevState.bedroomRichState=state;window.RADevState.richState=state}}
 function scheduleAmbient(){if(typeof ambientTimer==='function')ambientTimer();else clearTimeout(ambientTimer);if(!active||forced)return;const scope=sceneScope;ambientTimer=scope?.timeout(async()=>{if(!active||forced)return;const r=Math.random(),state=r<RICH_AMBIENT_TIMING.reactionChance?'phone_reaction':r<RICH_AMBIENT_TIMING.reactionChance+RICH_AMBIENT_TIMING.smallIdleChance?'small_idle':'phone_scroll';const duration=state==='phone_scroll'?rand(RICH_AMBIENT_TIMING.scrollMin,RICH_AMBIENT_TIMING.scrollMax):state==='small_idle'?rand(RICH_AMBIENT_TIMING.smallIdleMin,RICH_AMBIENT_TIMING.smallIdleMax):rand(RICH_AMBIENT_TIMING.reactionMin,RICH_AMBIENT_TIMING.reactionMax);setRichState(state);if(!await scope.delay(duration))return;if(active&&!forced)setRichState('lounge_idle');scheduleAmbient();},rand(RICH_AMBIENT_TIMING.gapMin,RICH_AMBIENT_TIMING.gapMax))||0;}
 function spawnCloud(size,{initial=false,avoidY=null}={}){if(!active||!sizes[size]||clouds.length>=CLOUD_TIMING.maxVisible)return null;const width=sizes[size].w,x=initial?rand(CLOUD_TIMING.initialXMin,269-width):266;let y=rand(initial?CLOUD_TIMING.initialYMin:CLOUD_TIMING.yMin,initial?CLOUD_TIMING.initialYMax:CLOUD_TIMING.yMax);if(initial&&avoidY!==null){for(let i=0;i<24&&Math.abs(y-avoidY)<CLOUD_TIMING.initialSeparationY;i++)y=rand(CLOUD_TIMING.initialYMin,CLOUD_TIMING.initialYMax)}const cloud={size,x,y};clouds.push(cloud);return cloud;}
 function initializeClouds(){const choices=['large','medium','small','tiny','tiny','micro','micro'];let lastY=null;for(let i=0;i<CLOUD_TIMING.initialCount;i++){const size=choices[(Math.floor(Math.random()*choices.length))],c=spawnCloud(size,{initial:true,avoidY:lastY});if(c)lastY=c.y}}
 function scheduleCloud(){if(typeof cloudTimer==='function')cloudTimer();else clearTimeout(cloudTimer);if(!active)return;cloudTimer=sceneScope?.timeout(()=>{if(active&&clouds.length<CLOUD_TIMING.maxVisible){const list=['large','medium','small','tiny','tiny','tiny','micro','micro','micro'];spawnCloud(list[Math.floor(Math.random()*list.length)])}scheduleCloud();},rand(CLOUD_TIMING.spawnGapMin,CLOUD_TIMING.spawnGapMax))||0;}
 // ---- RC2 ambient fliers (drawn in the window, under the same window mask as the clouds) ----
 let fliers=[],trail=[],planeTimer=0,birdTimer=0;
 function spawnPlane(){if(!active||fliers.some(f=>f.kind==='plane'))return null;const f={kind:'plane',x:274,y:rand(24,130),vx:-(16+Math.random()*8),t:0};fliers.push(f);return f}
 function spawnBirds(){if(!active)return null;const n=rand(3,5),y0=rand(40,170),out=[];for(let i=0;i<n;i++){const f={kind:'bird',x:274+i*13,y:y0+(i%2?6:0)+Math.round(Math.sin(i*2)*5),vx:-(11+Math.random()*3),t:i*.3};fliers.push(f);out.push(f)}return out}
 function stepFliers(dt){for(const f of fliers){f.x+=f.vx*dt;f.t+=dt;if(f.kind==='plane'&&Math.random()<dt*14)trail.push({x:f.x+14,y:f.y+3,a:1})}for(const p of trail)p.a-=dt*.22;trail=trail.filter(p=>p.a>0);fliers=fliers.filter(f=>f.x>-40)}
 function drawFliers(){
  for(const p of trail){ctx.fillStyle=`rgba(255,255,255,${Math.max(0,p.a*.8).toFixed(2)})`;ctx.fillRect(Math.round(p.x),Math.round(p.y),2,1)}
  for(const f of fliers){const x=Math.round(f.x),y=Math.round(f.y);
   if(f.kind==='plane'){ctx.fillStyle='#8892a6';ctx.fillRect(x+1,y+2,13,2);ctx.fillStyle='#f4f6fb';ctx.fillRect(x,y+1,14,2);ctx.fillRect(x+4,y,6,1);ctx.fillStyle='#8892a6';ctx.fillRect(x+5,y+3,5,1);ctx.fillStyle='#d7193f';ctx.fillRect(x+12,y-1,2,2);ctx.fillStyle='#26324a';ctx.fillRect(x+1,y+1,2,1)}
   else{const up=Math.floor(f.t*5)%2===0;ctx.fillStyle='#1b1f2e';if(up){ctx.fillRect(x,y,2,1);ctx.fillRect(x+2,y+1,1,1);ctx.fillRect(x+3,y,2,1)}else{ctx.fillRect(x,y+1,2,1);ctx.fillRect(x+2,y,1,1);ctx.fillRect(x+3,y+1,2,1)}}}
 }
 function scheduleFliers(){if(typeof planeTimer==='function')planeTimer();if(typeof birdTimer==='function')birdTimer();if(!active)return;
  const nextPlane=()=>{planeTimer=sceneScope?.timeout(()=>{spawnPlane();nextPlane()},rand(CLOUD_TIMING.planeGapMin,CLOUD_TIMING.planeGapMax))||0};
  const nextBird=()=>{birdTimer=sceneScope?.timeout(()=>{spawnBirds();nextBird()},rand(CLOUD_TIMING.birdGapMin,CLOUD_TIMING.birdGapMax))||0};
  planeTimer=sceneScope?.timeout(()=>{spawnPlane();nextPlane()},rand(6000,14000))||0;birdTimer=sceneScope?.timeout(()=>{spawnBirds();nextBird()},rand(9000,20000))||0}
 function animate(now){if(!active)return;if(!lastFrame)lastFrame=now;const dt=Math.min(100,now-lastFrame)/1000;lastFrame=now;for(const c of [...clouds]){c.x-=CLOUD_TIMING.speed[c.size]*dt;if(c.x+sizes[c.size].w<0)clouds=clouds.filter(x=>x!==c)}ctx.clearRect(0,0,270,480);ctx.imageSmoothingEnabled=false;stepFliers(dt);for(const c of clouds){const img=cloudImages[c.size];if(img.complete&&img.naturalWidth){const sc=sizes[c.size].scale||1;ctx.drawImage(img,Math.round(c.x),Math.round(c.y),Math.round(img.naturalWidth*sc),Math.round(img.naturalHeight*sc))}}drawFliers();if(windowMask){ctx.globalCompositeOperation='destination-in';ctx.drawImage(windowMask,0,0);ctx.globalCompositeOperation='source-over'}raf=sceneScope?.frame(animate)||0;}
 function clearClouds(){clouds=[];fliers=[];trail=[];ctx.clearRect(0,0,270,480);}
 function enter({scope}={}){sceneScope=scope||window.RAScenes?.createScope('bedroom');active=true;forced=false;scene.setAttribute('aria-hidden','false');document.body.classList.add('bedroom-mode');if(window.RADevState){window.RADevState.scene='bedroom';window.RADevState.bedroomRichState='lounge_idle'}setRichState('lounge_idle');initializeClouds();scheduleAmbient();scheduleCloud();scheduleFliers();lastFrame=0;raf=sceneScope?.frame(animate)||0;stageDirector();}
 // Presentation Director: the whole approved room is framed by the Director (room profile, cinematic mode); the
 // cloud canvas and the company/props overlay are world layers; controls move to the UI band.
 function stageDirector(){if(!window.RAPresentationDirector||window.__pdLegacy)return;RAPresentationDirector.enter({stage:'bedroom-hub',mode:'cinematic',beat:'default',scope:sceneScope,host:scene,env:scene.querySelector('.bedroom-base'),envAsset:'assets/rich_bedroom_environment_270x480.png',actors:{rich},worldLayers:[{el:canvas,rect:[0,0,270,480]}],worldLayerSelectors:[{sel:'.bedroom-overlay-canvas',rect:[0,0,270,480]}]})}
 function exit(){window.RAPresentationDirector?.exit();active=false;if(typeof ambientTimer==='function')ambientTimer();if(typeof cloudTimer==='function')cloudTimer();raf=0;lastFrame=0;clearClouds();document.body.classList.remove('bedroom-mode');scene.setAttribute('aria-hidden','true');if(window.RADevState){window.RADevState.scene='battle';window.RADevState.richState='idle'}sceneScope=null}
 function holdForPhone(){forced=true;if(typeof ambientTimer==='function')ambientTimer();setRichState('phone_scroll')}
 function releasePhone(){forced=false;setRichState('lounge_idle');scheduleAmbient()}
 window.RABedroom={enter,exit,setRichState(state){forced=true;if(typeof ambientTimer==='function')ambientTimer();setRichState(state)},holdForPhone,releasePhone,spawnCloud,spawnPlane,spawnBirds,fliers:()=>fliers.length,clearClouds,cloudCount:()=>clouds.length,cloudTiming:CLOUD_TIMING,ambientTiming:RICH_AMBIENT_TIMING};
 if(window.RAScenes)RAScenes.register('bedroom',{enter,exit});
 document.addEventListener('DOMContentLoaded',()=>{
  document.querySelector('#devEnterBedroom')?.addEventListener('click',()=>RAScenes.go('bedroom',{dev:true}));
  document.querySelector('#devReturnThrone')?.addEventListener('click',()=>RAScenes.go('battle',{dev:true}));
  document.querySelectorAll('[data-bedroom-state]').forEach(b=>b.addEventListener('click',()=>window.RABedroom.setRichState(b.dataset.bedroomState)));
  document.querySelectorAll('[data-bedroom-cloud]').forEach(b=>b.addEventListener('click',()=>window.RABedroom.spawnCloud(b.dataset.bedroomCloud)));
  document.querySelector('#devClearBedroomClouds')?.addEventListener('click',clearClouds);
 });
})();
