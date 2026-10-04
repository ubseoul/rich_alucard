(function(){
 'use strict';
 // OL-054: code-drawn presentation. No save/rule writes and no replacement of frozen sprite bytes.
 // Palette and beat grammar are revived from preserve/combat-fx-language; GUN WEAVE/SCAR remains unsourced.
 const C={ink:'#17131e',bone:'#f5e8c5',red:'#ae2446',blood:'#671c37',violet:'#9460c0',deep:'#472c66',green:'#72b58a',gold:'#d6af62',blue:'#6876d3',orange:'#d98241'};
 const MOVES=Object.freeze({blood:{family:'BLOOD',sound:'MOVE_BLOODBATH',contact:405},bite:{family:'BLOOD',sound:'MOVE_BITE',contact:300},revenge:{family:'BLOOD',sound:'MOVE_REVENGE',contact:540},octopus:{family:'OCCULT',sound:'MOVE_OCTOPUS',contact:180},petty:{family:'BLUNT',sound:'MOVE_ONEINCH',contact:180},hex:{family:'OCCULT',sound:'MAGIC_HEX',contact:220},veil:{family:'GUARD',sound:'MAGIC_VEIL',contact:220},seance:{family:'OCCULT',sound:'MAGIC_SEANCE',contact:240},ringer:{family:'OCCULT',sound:'MAGIC_RINGER',contact:220}});
 const GUNS=Object.freeze({lil_oga:{shape:'pistol',color:C.gold,shots:1},sapporo_shotgun:{shape:'double-barrel',color:C.bone,shots:2},mac_and_cheese:{shape:'smg',color:C.orange,shots:5},chopstick_sniper:{shape:'sniper',color:C.bone,shots:1},tommy_tony:{shape:'drum-smg',color:C.gold,shots:6},holy_baby_drake:{shape:'hand-cannon',color:C.gold,shots:1},jollof_burner:{shape:'flame',color:C.orange,shots:1},blueberry_blaster:{shape:'dragon-rifle',color:C.blue,shots:1},legendary_draco:{shape:'two-tap',color:C.violet,shots:2},golden_draco:{shape:'gold-two-tap',color:C.gold,shots:2},rpg:{shape:'launcher',color:C.green,shots:1},auntie_slipper:{shape:'thrown',color:C.bone,shots:1},triple_k_kratos:{shape:'triple-cannon',color:C.red,shots:3}});
 const active=new WeakMap(),repeats=new WeakMap(),warmImages=new Map();
 const reduced=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 function rect(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
 function line(c,x,y,tx,ty,color,width=1){x=Math.round(x);y=Math.round(y);tx=Math.round(tx);ty=Math.round(ty);let dx=Math.abs(tx-x),sx=x<tx?1:-1,dy=-Math.abs(ty-y),sy=y<ty?1:-1,e=dx+dy;for(let n=0;n<1200;n++){rect(c,x,y,width,width,color);if(x===tx&&y===ty)break;const e2=2*e;if(e2>=dy){e+=dy;x+=sx;}if(e2<=dx){e+=dx;y+=sy;}}}
 function diamond(c,x,y,r,color,width=2){line(c,x,y-r,x+r,y,color,width);line(c,x+r,y,x,y+r,color,width);line(c,x,y+r,x-r,y,color,width);line(c,x-r,y,x,y-r,color,width);}
 function cross(c,x,y,r,color){rect(c,x-r,y-1,r*2+1,3,color);rect(c,x-1,y-r,3,r*2+1,color);}
 function star(c,x,y,r,color){diamond(c,x,y,r,C.ink,3);cross(c,x,y,r,color);diamond(c,x,y,Math.max(3,r-5),C.bone);}
 function ring(c,x,y,r,color){for(let yy=-r;yy<=r;yy++){const xx=Math.round(Math.sqrt(Math.max(0,r*r-yy*yy)));rect(c,x-xx,y+yy,2,1,color);rect(c,x+xx-1,y+yy,2,1,color);}}
 function ghost(c,x,y,f,color=C.bone){rect(c,x-8,y-11,16,23,C.ink);rect(c,x-5,y-14,10,3,C.ink);rect(c,x-6,y-9,12,19,color);rect(c,x-4,y-12,8,4,color);rect(c,x-4,y-5,2,3,C.deep);rect(c,x+2,y-5,2,3,C.deep);for(let i=0;i<3;i++)rect(c,x-6+i*4,y+8+(f+i)%2*2,2,4,color);}
 function view(root,attacker,target){const box=root.getBoundingClientRect(),world=window.RAPresentationDirector?.worldRect?.()||{x:0,y:0,w:box.width,h:box.height},S=world.w/270,H=Math.round(world.h/S);const point=(el,role)=>{const a=window.RAPresentationDirector?.actorBox?.(role),b=el.getBoundingClientRect();if(a)return{x:Math.round((a.visible.x+a.visible.w/2-world.x)/S),y:Math.round((a.visible.y+a.visible.h*.42-world.y)/S),floor:Math.round((a.contact.y-world.y)/S),w:a.visible.w/S,h:a.visible.h/S};return{x:Math.round((b.left-box.left+b.width/2-world.x)/S),y:Math.round((b.top-box.top+b.height*.42-world.y)/S),floor:Math.round((b.bottom-box.top-world.y)/S),w:b.width/S,h:b.height/S};};return{box,world,S,H,rich:point(attacker,'rich'),enemy:point(target,'enemy')};}
 function layer(root,V,id){const c=document.createElement('canvas');c.className='c2-pixel-fx';c.width=270;c.height=V.H;c.dataset.presentation=id;c.setAttribute('aria-hidden','true');Object.assign(c.style,{position:'absolute',left:`${V.world.x}px`,top:`${V.world.y}px`,width:`${V.world.w}px`,height:`${V.world.h}px`,zIndex:'4',pointerEvents:'none',imageRendering:'pixelated'});root.append(c);const ctx=c.getContext('2d');ctx.imageSmoothingEnabled=false;return{canvas:c,ctx};}
 function mods(gun){return window.RAIronAndGrace?.modsFor?.(gun)||[];}
 function gunBody(c,a,p,attachments,frame){const x=a.x+7,y=a.y+Math.round(a.h*.14),gold=attachments.includes('gold_plating'),color=gold?C.gold:['flame','dragon-rifle','launcher'].includes(p.shape)?p.color:'#767581';
  if(p.shape==='thrown')return{x:x+4,y};
  const long=['sniper','dragon-rifle','double-barrel','launcher'].includes(p.shape),w=long?34:22;
  rect(c,x,y,w,8,C.ink);rect(c,x+2,y+2,w-4,4,color);rect(c,x+5,y+7,6,10,C.ink);rect(c,x+7,y+7,3,8,color);
  if(p.shape==='double-barrel')rect(c,x+14,y+6,20,3,C.ink);
  if(p.shape==='drum-smg'||attachments.includes('drum_mag')){rect(c,x+10,y+7,12,11,C.ink);rect(c,x+12,y+9,8,7,color);}
  if(p.shape==='smg')rect(c,x+12,y+7,4,12,C.ink);
  if(p.shape==='launcher'){rect(c,x-4,y-3,38,14,C.ink);rect(c,x-2,y-1,34,10,color);rect(c,x+30,y-1,3,10,C.bone);}
  if(p.shape==='hand-cannon')rect(c,x+10,y-2,12,3,color);
  if(p.shape==='triple-cannon')for(let i=0;i<3;i++)rect(c,x+12,y-4+i*5,17,3,C.red);
  if(attachments.includes('scope')||p.shape==='sniper'){rect(c,x+10,y-5,13,4,C.ink);rect(c,x+20,y-4,2,2,C.blue);}
  if(attachments.includes('silencer')){rect(c,x+w,y,10,8,C.ink);rect(c,x+w+1,y+2,8,4,C.deep);}
  if(gold){rect(c,x+2,y+1,w-4,1,C.bone);cross(c,x+12,y-9,3,C.gold);}
  if(attachments.includes('custom_engraving'))for(let i=0;i<3;i++)rect(c,x+4+i*3,y+3,1,2,C.bone);
  return{x:x+w+(attachments.includes('silencer')?10:0),y:y+3};
 }
 function gunPaint(c,V,p,attachments,f){const a=V.rich,b=V.enemy,m=gunBody(c,a,p,attachments,f),shot=Math.max(0,Math.min(p.shots-1,Math.floor((f-2)*p.shots/6))),contact=f>=2&&f<=8;
  if(p.shape==='thrown'){const t=reduced()?1:Math.min(1,f/5),x=Math.round(m.x+(b.x-m.x)*t),y=Math.round(m.y+(b.y-m.y)*t);rect(c,x-9,y-4,18,8,C.ink);rect(c,x-7,y-2,14,4,C.bone);rect(c,x-5,y-5,8,2,C.gold);if(f>=5)star(c,b.x,b.y,14,C.bone);return;}
  if(!contact)return;
  if(p.shape==='flame'){for(let i=0;i<7;i++){const x=m.x+i*9,y=m.y+(i%3-1)*3;rect(c,x,y-i,10+i*2,3+i*2,C.red);rect(c,x+2,y,7+i,3,C.orange);rect(c,x+3,y+1,4,2,C.bone);}star(c,b.x,b.y,14,C.orange);return;}
  if(p.shape==='launcher'){const t=reduced()?1:Math.min(1,(f-2)/3),x=Math.round(m.x+(b.x-m.x)*t);rect(c,x-8,m.y-3,14,6,C.ink);rect(c,x-6,m.y-2,10,4,C.green);rect(c,x-12,m.y-1,4,2,C.orange);if(f>=5){diamond(c,b.x,b.y,24,C.orange,4);star(c,b.x,b.y,18,C.bone);for(let i=0;i<4;i++)rect(c,b.x-22+i*15,b.floor-2,8,2,C.ink);}return;}
  const r=p.shape==='hand-cannon'?15:p.shape==='triple-cannon'?20:8;star(c,m.x,m.y,r,p.color);
  if(p.shape==='double-barrel')for(let i=-1;i<=1;i++)line(c,m.x+3,m.y,b.x-4,b.y+i*9,C.gold);
  else if(p.shape==='sniper'){line(c,m.x,m.y,b.x,b.y,C.bone,2);cross(c,b.x,b.y,16,C.gold);}
  else if(p.shape==='dragon-rifle'){line(c,m.x,m.y,b.x,b.y,C.blue,3);for(let i=0;i<4;i++)diamond(c,m.x+22+i*18,m.y,5+i,C.violet);star(c,b.x,b.y,17,C.blue);}
  else{line(c,m.x,m.y,b.x,b.y+(shot%3-1)*4,p.color);star(c,b.x,b.y+(shot%3-1)*4,p.shape==='gold-two-tap'?17:10,p.color);}
  if(p.shape==='gold-two-tap')for(let i=0;i<4;i++)cross(c,b.x-20+i*12,b.y-22,3,C.gold);
  if(p.shape==='two-tap')diamond(c,b.x,b.y,18,C.violet);
  if(p.shape==='hand-cannon'||attachments.includes('blessed_rounds'))cross(c,b.x,b.y-18,7,C.gold);
  rect(c,m.x-12-(f%3)*2,m.y+12,3,2,C.gold); // one casing, not a particle shower
 }
 function paintMove(c,V,id,f){const a=V.rich,b=V.enemy,on=f>=3;
  if(id==='petty'){const x=b.x-11;rect(c,x-14,b.y-3,16,6,C.ink);rect(c,x-3,b.y-7,9,14,C.ink);rect(c,x-2,b.y-5,7,10,C.bone);for(let i=0;i<3;i++)rect(c,x-11,b.y-7+i*5,7,2,C.gold);if(on){star(c,b.x+4,b.y,19,C.bone);rect(c,b.x-24,b.y-21,2,42,C.gold);rect(c,b.x-26,b.y-21,6,2,C.gold);rect(c,b.x-26,b.y+19,6,2,C.gold);}return;}
  if(id==='hex'){const r=on?18:26-f*3;diamond(c,b.x,b.y,r,C.violet,2);diamond(c,b.x,b.y,Math.max(4,r-6),C.deep,2);for(let i=0;i<4;i++){const s=i<2?-1:1;cross(c,b.x+s*(18+(i%2)*6),b.y+(i%2?12:-12),3,C.violet);}if(on){line(c,b.x-12,b.y-12,b.x+12,b.y+12,C.bone,2);line(c,b.x+12,b.y-12,b.x-12,b.y+12,C.bone,2);}return;}
  if(id==='veil'){const top=a.y-28,bottom=a.floor-3;for(let yy=top;yy<bottom;yy+=6){const w=18+Math.min(18,Math.floor((yy-top)/3));rect(c,a.x-w,yy,3,5,C.violet);rect(c,a.x+w-3,yy,3,5,C.violet);if(on&&yy%12<6)rect(c,a.x-w+4,yy,w*2-8,2,C.deep);}line(c,a.x-17,top,a.x,top-11,C.bone,2);line(c,a.x,top-11,a.x+17,top,C.bone,2);cross(c,a.x,top+12,6,C.violet);return;}
  if(id==='seance'){const x=on?b.x-26:a.x+24,y=on?b.y-12:a.y-16;ghost(c,x,y,f,C.bone);ring(c,x,y+27,19,C.violet);for(let i=0;i<3;i++)rect(c,x-15+i*12,y+29+(i%2)*3,3,3,C.green);if(on){line(c,x+9,y,b.x-4,b.y,C.violet,2);diamond(c,b.x,b.y,9,C.green);}return;}
  if(id==='ringer'){const x=b.x,y=b.y-23;rect(c,x-10,y-13,20,2,C.ink);rect(c,x-8,y-11,16,15,C.ink);rect(c,x-6,y-9,12,12,C.gold);rect(c,x-12,y+2,24,4,C.ink);rect(c,x-10,y+3,20,2,C.bone);rect(c,x-1,y+6,3,4,C.gold);if(on){for(let i=0;i<2;i++){diamond(c,x,y,19+i*9+(f%2)*2,C.violet);rect(c,x-24-i*8,y-4,3,9,C.bone);rect(c,x+22+i*8,y-4,3,9,C.bone);}}return;}
  if(!on)return;
  if(id==='blood')star(c,b.x,b.y,14,C.red);
  if(id==='bite'){for(let i=0;i<3;i++)rect(c,a.x-9+i*9,a.y-8-(f%3)*2,3,7,C.green);}
  if(id==='revenge'){diamond(c,b.x,b.y,20,C.red,2);line(c,b.x-14,b.y-20,b.x+8,b.y+19,C.bone,2);}
  if(id==='octopus'){diamond(c,b.x,b.y,21,C.violet,2);cross(c,b.x,b.y,7,C.green);}
 }
 function cue(root,id){const A=window.RAAudio;if(!id||!A)return;A.preload(id).then(()=>{if(root.isConnected)A.oneShot(id);});}
 function badges(root,gun,attachments,V){root.querySelector('.c2-gun-mods')?.remove();if(!attachments.length)return;const b=document.createElement('div');b.className='c2-gun-mods';b.setAttribute('aria-label','Attached passive gun modifications');b.textContent=attachments.map(id=>window.RAIronCatalog.MODS[id].label+(id==='custom_engraving'?` · ${window.RAIronAndGrace.engravedName(gun)}`:'')).join(' · ');b.style.top=`${V.world.y+V.world.h-22}px`;root.append(b);}
 function move(spec){const{root,attacker,target,action,gun}=spec,id=gun?`gun:${gun}`:action.id,plan=gun?GUNS[gun]:MOVES[id];if(!plan)return null;active.get(root)?.();const V=view(root,attacker,target),L=layer(root,V,id),seen=repeats.get(root)||new Map(),count=seen.get(id)||0;seen.set(id,count+1);repeats.set(root,seen);const duration=count?360:720,attachments=gun?mods(gun):[],sound=gun?window.RAIronCatalog?.byId(gun)?.audio||'GUN_LILOGA':plan.sound;let frame=0,done=false,timer;
  root.dataset.lastPresentation=id;root.dataset.fxFamily=gun?'IRON':plan.family;root.dataset.fxDuration=String(duration);root.dataset.fxRepeat=String(count);if(gun)badges(root,gun,attachments,V);
  const draw=f=>{L.ctx.clearRect(0,0,270,V.H);if(gun)gunPaint(L.ctx,V,plan,attachments,f);else paintMove(L.ctx,V,id,f);L.canvas.dataset.frame=String(f);};
  const close=()=>{if(done)return;done=true;clearInterval(timer);L.canvas.remove();root.removeEventListener('pointerdown',skip);root.removeEventListener('c2:close',close);if(gun&&window.RAAudioManifest?.get(sound)?.type==='loop')window.RAAudio.stop(sound,0);};
  const skip=e=>{if(e.target.closest('[data-c2],[data-octo]'))return;frame=4;draw(frame);setTimeout(close,120);};
  draw(reduced()?4:0);if(!gun||!spec.events?.some(e=>e.gun===gun))cue(root,sound);root.addEventListener('pointerdown',skip);root.addEventListener('c2:close',close,{once:true});active.set(root,close);
  const start=performance.now();timer=setInterval(()=>{const elapsed=performance.now()-start;frame=Math.min(10,Math.floor(elapsed/duration*11));draw(reduced()?4:frame);if(elapsed>=duration)close();},60);return{duration,sound,id,close,world:V.world};
 }
 function impact({root,target,attacker,severity='normal',tick=false}){const V=view(root,attacker,target),L=layer(root,V,'contact'),onRich=target===root.querySelector('.c2-rich'),p=onRich?V.rich:V.enemy,r=tick?6:severity==='lethal'?19:severity==='heavy'?14:10;
  const actor=window.RAPresentationDirector?.actorBox?.(onRich?'rich':'enemy'),b=actor?.sprite,drawable=target.tagName==='CANVAS'||target.tagName==='IMG'&&target.complete&&target.naturalWidth;
  if(!tick&&b&&drawable){const x=Math.round((b.x-V.world.x)/V.S),y=Math.round((b.y-V.world.y)/V.S),w=Math.round(b.w/V.S),h=Math.round(b.h/V.S);L.ctx.save();if(actor.flip){L.ctx.translate(x+w,y);L.ctx.scale(-1,1);L.ctx.drawImage(target,0,0,w,h);}else L.ctx.drawImage(target,x,y,w,h);L.ctx.restore();L.ctx.save();L.ctx.globalCompositeOperation='source-in';rect(L.ctx,0,0,270,V.H,severity==='lethal'?C.ink:C.bone);L.ctx.restore();}
  star(L.ctx,p.x,p.y,r,C.bone);if(!tick){const world=root.querySelector('#pdWorld');world?.classList.add(`c2-world-impact-${severity}`);setTimeout(()=>world?.classList.remove(`c2-world-impact-${severity}`),150);}setTimeout(()=>L.canvas.remove(),tick?65:105);return severity==='lethal'?105:severity==='heavy'?85:55;}
 function prewarm(){const ids=[...Object.values(MOVES).map(m=>m.sound),'HIT_LIGHT','HIT_HEAVY','KO','TELEGRAPH','MISS',...Object.keys(GUNS).map(id=>window.RAIronCatalog?.byId(id)?.audio).filter(Boolean)];
  // Decode accepted compositing packages before the first input instead of at their impact frame.
  for(const art of Object.values(window.RAArtRegistry?.combatMoves||{}))for(const src of Object.values(art).flat())if(typeof src==='string'&&src.endsWith('.png')&&!warmImages.has(src)){const image=new Image();image.src=src;warmImages.set(src,image);}
  return window.RAAudio?.preloadScene?.([...new Set(ids)]);
 }
 window.RACombatPixelFX=Object.freeze({MOVES,GUNS,move,impact,reduced,prewarm,helpers:Object.freeze({C,rect,line,diamond,cross,star,ring,ghost,view,layer,cue})});
})();
