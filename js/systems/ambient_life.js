(function(){
 'use strict';
 // RC2 BUILD 2 · AMBIENT LIFE for adventure scenes (the bedroom's clouds/planes/birds live in bedroom.js).
 // A transparent 270x480 hard-pixel canvas sits between the environment and the actors: fireflies on warm night
 // exteriors, drifting dust motes indoors, the odd shooting star over open night sky. Presentation only.
 const FIREFLY_ENVS=new Set(['curb','castle_exterior','castle_exterior_party','gbenga_house_patio','property_exterior','grave','rave_exterior']);
 const INDOOR=new Set(['throne','throne_party_mess','boba_shop','cafe','slurp','pet_crypt','kush_crypt','kush_back','rave_interior','gbenga_house_dining','carson_owambe','food_court','catacomb','catacomb_dead','gbenga_rentals']);
 const STAR_ENVS=new Set(['curb','castle_exterior','castle_exterior_party','gbenga_house_patio','property_exterior','pier','docks']);
 const reduced=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 const OCEAN=new Set(['ocean_floor','ocean_floor_collapsed']);
 let bubbles=[],zs=[];
 let alignT=0;
 let cv=null,ctx=null,raf=0,root=null,envName=null,last=0,acc=0,flies=[],motes=[],star=null,obs=null;
 const rnd=(a,b)=>a+Math.random()*(b-a);
 function makeFlies(){flies=Array.from({length:14},(_,i)=>({x:rnd(10,260),y:rnd(190,400),ph:rnd(0,6.28),sp:rnd(.6,1.4),r:rnd(6,16),cx:rnd(10,260),cy:rnd(190,400),hue:i%3}));}
 function makeMotes(){motes=Array.from({length:10},()=>({x:rnd(0,270),y:rnd(40,420),vy:rnd(-3,-.8),vx:rnd(-1.5,1.5),a:rnd(.15,.4)}));}
 function align(){if(!cv||!root)return;const env=root.querySelector('.adv-env');if(!env)return;const r=root.getBoundingClientRect(),e=env.getBoundingClientRect();Object.assign(cv.style,{left:`${e.left-r.left}px`,top:`${e.top-r.top}px`,width:`${e.width}px`,height:`${e.height}px`});
  const w=window.RAPresentationDirector?.worldRect?.();if(w){const L=e.left-r.left,T=e.top-r.top,t=Math.max(0,w.y-T),b=Math.max(0,(T+e.height)-(w.y+w.h)),l=Math.max(0,w.x-L),rt=Math.max(0,(L+e.width)-(w.x+w.w));cv.style.clipPath=`inset(${t}px ${rt}px ${b}px ${l}px)`;}else cv.style.clipPath='';}
 function tick(now){
  raf=requestAnimationFrame(tick);if(!cv||!cv.isConnected){stop();return;}
  const dt=Math.min(.1,(now-last)/1000||0);last=now;acc+=dt;if(acc<.05)return;const step=acc;acc=0;alignT+=step;if(alignT>.8){alignT=0;align();}
  ctx.clearRect(0,0,270,480);
  if(FIREFLY_ENVS.has(envName)){for(const f of flies){f.ph+=step*f.sp;f.cx+=Math.sin(f.ph*.4)*step*4;f.x=f.cx+Math.sin(f.ph)*f.r;f.y=f.cy+Math.cos(f.ph*1.3)*f.r*.6;f.cy+=Math.sin(f.ph*.2)*step*2;
    const glow=Math.max(0,Math.sin(f.ph*2.1+f.hue));if(glow<.08)continue;const x=Math.round(f.x),y=Math.round(f.y);const core=f.hue===1?'#d8ff9a':'#fff7a0';
    ctx.fillStyle=`rgba(180,255,120,${(.18*glow).toFixed(2)})`;ctx.fillRect(x-2,y-1,5,3);ctx.fillRect(x-1,y-2,3,5);ctx.fillStyle=core;ctx.globalAlpha=Math.min(1,.4+glow);ctx.fillRect(x,y,2,2);ctx.globalAlpha=1;}}
  else if(INDOOR.has(envName)){for(const m of motes){m.x+=m.vx*step;m.y+=m.vy*step;if(m.y<20||m.x<0||m.x>270){m.y=rnd(300,430);m.x=rnd(0,270);}ctx.fillStyle=`rgba(255,240,200,${m.a})`;ctx.fillRect(Math.round(m.x),Math.round(m.y),1,1);}}
  if(OCEAN.has(envName)){if(bubbles.length<16&&Math.random()<step*6)bubbles.push({x:rnd(10,260),y:rnd(380,470),r:Math.random()<.3?3:2,vy:rnd(14,34),ph:rnd(0,6)});for(const b of bubbles){b.y-=b.vy*step;b.ph+=step*3;const x=Math.round(b.x+Math.sin(b.ph)*3),y=Math.round(b.y);ctx.fillStyle='rgba(190,230,255,.55)';ctx.fillRect(x,y,b.r,b.r);ctx.fillStyle='rgba(255,255,255,.8)';ctx.fillRect(x,y,1,1);}bubbles=bubbles.filter(b=>b.y>-6);}
  const adv=window.RAAdventures?.active?.();if(envName==='bedroom'&&adv?.id==='A00'&&adv.node==='dream'){if(Math.random()<step*1.2)zs.push({x:92,y:290,t:0});for(const z of zs){z.t+=step;const k=Math.min(1,z.t/2.4),x=Math.round(z.x+k*26+Math.sin(z.t*3)*3),y=Math.round(z.y-k*60);ctx.fillStyle='rgba(246,239,217,'+(1-k).toFixed(2)+')';const q=k<.4?1:2;ctx.fillRect(x,y,3*q,q);ctx.fillRect(x+2*q,y+q,q,q);ctx.fillRect(x+q,y+2*q,q,q);ctx.fillRect(x,y+3*q,3*q,q);}zs=zs.filter(z=>z.t<2.4);}
  if(STAR_ENVS.has(envName)){if(!star&&Math.random()<step*.03)star={x:rnd(120,260),y:rnd(10,80),life:0};if(star){star.life+=step;star.x-=step*120;star.y+=step*60;for(let i=0;i<6;i++){ctx.fillStyle=`rgba(255,255,255,${(1-i/6)*Math.max(0,1-star.life*1.6)})`;ctx.fillRect(Math.round(star.x+i*3),Math.round(star.y-i*1.5),2,1);}if(star.life>.7)star=null;}}
 }
 function stop(){cancelAnimationFrame(raf);raf=0;obs?.disconnect();obs=null;cv?.remove();cv=null;ctx=null;root=null;envName=null;star=null;}
 function attach(){
  const r=document.querySelector('#adventureScene');if(!r){stop();return;}
  if(r===root&&cv?.isConnected){envName=r.dataset.env;return;}
  stop();root=r;envName=r.dataset.env;cv=document.createElement('canvas');cv.width=270;cv.height=480;cv.className='rc2-ambient';cv.setAttribute('aria-hidden','true');
  const env=r.querySelector('.adv-env');if(env&&env.parentNode)env.after(cv);else r.append(cv);ctx=cv.getContext('2d');ctx.imageSmoothingEnabled=false;
  makeFlies();makeMotes();align();obs=new MutationObserver(()=>{envName=root?.dataset.env;align();});obs.observe(r,{attributes:true,attributeFilter:['data-env']});
  window.addEventListener('resize',align);
  if(!reduced()){last=performance.now();raf=requestAnimationFrame(tick);}
  else{ctx.fillStyle='#fff7a0';if(FIREFLY_ENVS.has(envName))flies.slice(0,6).forEach(f=>ctx.fillRect(Math.round(f.x),Math.round(f.y),2,2));}
 }
 document.addEventListener('ra:scene',e=>{if(e.detail?.id==='adventure')setTimeout(attach,30);else stop();});
 window.RAAmbientLife={attach,stop,envs:{FIREFLY_ENVS,INDOOR,STAR_ENVS},active:()=>!!cv};
})();
