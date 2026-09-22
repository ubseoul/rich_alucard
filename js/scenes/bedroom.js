(function(){
 const CLOUD_TIMING={spawnGapMin:50000,spawnGapMax:125000,maxVisible:2,initialSecondChance:.26,initialXMin:48,initialYMin:18,initialYMax:225,initialSeparationY:70,speed:{large:1.1,medium:1.35,small:1.6},yMin:18,yMax:225};
 const RICH_AMBIENT_TIMING={gapMin:17000,gapMax:39000,scrollMin:1900,scrollMax:3900,smallIdleMin:2200,smallIdleMax:3600,reactionMin:1400,reactionMax:2200,smallIdleChance:.17,reactionChance:.045};
 const states={lounge_idle:'rich_bedroom_lounge_idle.png',phone_scroll:'rich_bedroom_phone_scroll.png',small_idle:'rich_bedroom_small_idle.png',phone_reaction:'rich_bedroom_phone_reaction.png',sleeping:'rich_bedroom_sleeping.png',drowsy_wake:'rich_bedroom_drowsy_wake.png'};
 const sizes={large:{file:'bedroom_cloud_large.png',w:136},medium:{file:'bedroom_cloud_medium.png',w:88},small:{file:'bedroom_cloud_small.png',w:52}};
 const scene=document.querySelector('#bedroomScene'),canvas=document.querySelector('#bedroomCloudCanvas'),rich=document.querySelector('#bedroomRich'),ctx=canvas.getContext('2d',{alpha:true});
 ctx.imageSmoothingEnabled=false;
 const cloudImages=Object.fromEntries(Object.entries(sizes).map(([key,s])=>{const img=new Image();img.src=`assets/${s.file}`;return[key,img]}));
 const maskImage=new Image();
 let windowMask=null;
 maskImage.onload=()=>{const m=document.createElement('canvas');m.width=270;m.height=480;const c=m.getContext('2d',{willReadFrequently:true});c.drawImage(maskImage,0,0);const data=c.getImageData(0,0,270,480),pixels=data.data;for(let i=0;i<pixels.length;i+=4){const inside=pixels[i]===61&&pixels[i+1]===157&&pixels[i+2]===221;pixels[i]=255;pixels[i+1]=255;pixels[i+2]=255;pixels[i+3]=inside?255:0}c.putImageData(data,0,0);windowMask=m};maskImage.src='assets/rich_bedroom_environment_270x480.png';
 let active=false,forced=false,clouds=[],raf=0,ambientTimer=0,cloudTimer=0,lastFrame=0;
 const rand=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
 function setRichState(state){if(!states[state])return;rich.src=`assets/${states[state]}`;rich.dataset.state=state;if(window.RADevState){window.RADevState.bedroomRichState=state;window.RADevState.richState=state}}
 function scheduleAmbient(){clearTimeout(ambientTimer);if(!active||forced)return;ambientTimer=setTimeout(async()=>{if(!active||forced)return;const r=Math.random(),state=r<RICH_AMBIENT_TIMING.reactionChance?'phone_reaction':r<RICH_AMBIENT_TIMING.reactionChance+RICH_AMBIENT_TIMING.smallIdleChance?'small_idle':'phone_scroll';const duration=state==='phone_scroll'?rand(RICH_AMBIENT_TIMING.scrollMin,RICH_AMBIENT_TIMING.scrollMax):state==='small_idle'?rand(RICH_AMBIENT_TIMING.smallIdleMin,RICH_AMBIENT_TIMING.smallIdleMax):rand(RICH_AMBIENT_TIMING.reactionMin,RICH_AMBIENT_TIMING.reactionMax);setRichState(state);await new Promise(resolve=>setTimeout(resolve,duration));if(active&&!forced)setRichState('lounge_idle');scheduleAmbient();},rand(RICH_AMBIENT_TIMING.gapMin,RICH_AMBIENT_TIMING.gapMax));}
 function spawnCloud(size,{initial=false,avoidY=null}={}){if(!active||!sizes[size]||clouds.length>=CLOUD_TIMING.maxVisible)return null;const width=sizes[size].w,x=initial?rand(CLOUD_TIMING.initialXMin,269-width):266;let y=rand(initial?CLOUD_TIMING.initialYMin:CLOUD_TIMING.yMin,initial?CLOUD_TIMING.initialYMax:CLOUD_TIMING.yMax);if(initial&&avoidY!==null){for(let i=0;i<24&&Math.abs(y-avoidY)<CLOUD_TIMING.initialSeparationY;i++)y=rand(CLOUD_TIMING.initialYMin,CLOUD_TIMING.initialYMax)}const cloud={size,x,y};clouds.push(cloud);return cloud;}
 function initializeClouds(){const choices=Object.keys(sizes),firstSize=choices[Math.floor(Math.random()*choices.length)],first=spawnCloud(firstSize,{initial:true});if(first&&Math.random()<CLOUD_TIMING.initialSecondChance){const alternatives=choices.filter(size=>size!==firstSize),secondSize=alternatives[Math.floor(Math.random()*alternatives.length)];spawnCloud(secondSize,{initial:true,avoidY:first.y})}}
 function scheduleCloud(){clearTimeout(cloudTimer);if(!active)return;cloudTimer=setTimeout(()=>{if(active&&clouds.length<CLOUD_TIMING.maxVisible){const list=['large','medium','small'];spawnCloud(list[Math.floor(Math.random()*list.length)])}scheduleCloud();},rand(CLOUD_TIMING.spawnGapMin,CLOUD_TIMING.spawnGapMax));}
 function animate(now){if(!active)return;if(!lastFrame)lastFrame=now;const dt=Math.min(100,now-lastFrame)/1000;lastFrame=now;for(const c of [...clouds]){c.x-=CLOUD_TIMING.speed[c.size]*dt;if(c.x+sizes[c.size].w<0)clouds=clouds.filter(x=>x!==c)}ctx.clearRect(0,0,270,480);ctx.imageSmoothingEnabled=false;for(const c of clouds){const img=cloudImages[c.size];if(img.complete&&img.naturalWidth)ctx.drawImage(img,Math.round(c.x),Math.round(c.y))}if(windowMask){ctx.globalCompositeOperation='destination-in';ctx.drawImage(windowMask,0,0);ctx.globalCompositeOperation='source-over'}raf=requestAnimationFrame(animate);}
 function clearClouds(){clouds=[];ctx.clearRect(0,0,270,480);}
 function enter(){active=true;forced=false;scene.setAttribute('aria-hidden','false');document.body.classList.add('bedroom-mode');if(window.RADevState){window.RADevState.scene='bedroom';window.RADevState.bedroomRichState='lounge_idle'}setRichState('lounge_idle');initializeClouds();scheduleAmbient();scheduleCloud();lastFrame=0;raf=requestAnimationFrame(animate);}
 function exit(){active=false;clearTimeout(ambientTimer);clearTimeout(cloudTimer);cancelAnimationFrame(raf);raf=0;lastFrame=0;clearClouds();document.body.classList.remove('bedroom-mode');scene.setAttribute('aria-hidden','true');if(window.RADevState){window.RADevState.scene='battle';window.RADevState.richState='idle'}}
 function holdForPhone(){forced=true;clearTimeout(ambientTimer);setRichState('phone_scroll')}
 function releasePhone(){forced=false;setRichState('lounge_idle');scheduleAmbient()}
 window.RABedroom={enter,exit,setRichState(state){forced=true;clearTimeout(ambientTimer);setRichState(state)},holdForPhone,releasePhone,spawnCloud,clearClouds,cloudCount:()=>clouds.length,cloudTiming:CLOUD_TIMING,ambientTiming:RICH_AMBIENT_TIMING};
 if(window.RAScenes)RAScenes.register('bedroom',{enter,exit});
 document.addEventListener('DOMContentLoaded',()=>{
  document.querySelector('#devEnterBedroom')?.addEventListener('click',()=>RAScenes.go('bedroom',{dev:true}));
  document.querySelector('#devReturnThrone')?.addEventListener('click',()=>RAScenes.go('battle',{dev:true}));
  document.querySelectorAll('[data-bedroom-state]').forEach(b=>b.addEventListener('click',()=>window.RABedroom.setRichState(b.dataset.bedroomState)));
  document.querySelectorAll('[data-bedroom-cloud]').forEach(b=>b.addEventListener('click',()=>window.RABedroom.spawnCloud(b.dataset.bedroomCloud)));
  document.querySelector('#devClearBedroomClouds')?.addEventListener('click',clearClouds);
 });
})();
