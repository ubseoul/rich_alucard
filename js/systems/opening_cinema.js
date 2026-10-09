(() => {
'use strict';
const root=document.querySelector('#cinematicIntro');
if(!root)return;
const canvas=root.querySelector('#film'),ctx=canvas.getContext('2d',{alpha:false});
const DURATION=40;
let t=0,playing=false,started=false,last=0,audio=null,sound=false,lastShot=-1,ready=false,raf=0;
const imgs={},paths={"background":"opening-assets/roadside-master.png","car":"opening-assets/car.png","ogaIdle":"opening-assets/ogaIdle.png","ogaWalk":"opening-assets/ogaWalk.png","ogaAim":"opening-assets/ogaAim.png","driver":"opening-assets/driver.png","gbengaIdle":"opening-assets/gbenga-idle-trim.png","gbengaWalk1":"opening-assets/gbenga-walk1-trim.png","gbengaWalk2":"opening-assets/gbenga-walk2-trim.png","gbengaTalk":"opening-assets/gbenga-talk-trim.png"};
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=(a,x,b)=>Math.max(a,Math.min(x,b)),lerp=(a,b,x)=>a+(b-a)*x;
const ease=x=>{x=clamp(0,x,1);return x*x*(3-2*x)};
const between=(a,b)=>t>=a&&t<b;
function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}
function polygon(p,c){ctx.fillStyle=c;ctx.beginPath();p.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill()}
function text(s,x,y,size=9,c="#f6efd9",align="left",font="Pixel"){ctx.font=size+"px "+font;ctx.textAlign=align;ctx.textBaseline="top";ctx.fillStyle="#07060e";ctx.fillText(s,x+1,y+1);ctx.fillStyle=c;ctx.fillText(s,x,y)}
function shadow(x,y,w=26,a=.5){ctx.globalAlpha=a;ctx.fillStyle="#07070d";ctx.beginPath();ctx.ellipse(Math.round(x),Math.round(y),w,3,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1}
function sprite(key,x,y,height=92,flip=false,walking=false,opacity=1){
 const im=imgs[key];if(!im)return;const h=height,w=im.width/im.height*h;
 shadow(x,y,w*.34,opacity*.48);
 ctx.save();ctx.globalAlpha=opacity;ctx.translate(Math.round(x),Math.round(y));if(flip)ctx.scale(-1,1);
 const bob=walking?Math.floor(Math.sin(t*15)*1):0;ctx.drawImage(im,-Math.round(w/2),-Math.round(h)+bob,Math.round(w),Math.round(h));ctx.restore()
}
function cloud(x,y,scale=1,alpha=.25){
 ctx.save();ctx.globalAlpha=alpha;
 const c="#6b4a80";[[0,6,75,3],[12,2,41,7],[23,0,17,5],[53,5,23,3],[-12,8,115,2]].forEach(r=>rect(x+r[0]*scale,y+r[1]*scale,r[2]*scale,r[3]*scale,c));ctx.restore()
}
function grassPatch(x,y,front=false){
 let breeze=Math.floor(Math.sin(t*1.6+x*.3)*2);
 for(let i=0;i<30;i++){
  const xx=x+i*2.5-35,h=8+(i*17%20),sw=breeze+(i%5)-2;
  ctx.strokeStyle=i%4===0?"#535236":front?"#283322":"#222b21";ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(xx,y);ctx.lineTo(xx+sw,y-h*.55);ctx.lineTo(xx+sw*2,y-h);ctx.stroke();
  if(i%7===0)rect(xx+sw*2,y-h,1,3,"#6c6540")
 }
}
function caption(speaker,lines,phase=1){
 const y=311;rect(21,y,598,39,"#10101bed");rect(21,y,2,39,"#c18b3c");text(speaker,32,y+4,9,"#c18b3c");
 lines.forEach((s,i)=>text(s,32,y+17+i*15,14)); 
}
function board(title,subtitle,alpha){
 ctx.save();ctx.globalAlpha=alpha;rect(0,0,640,360,"#090813");rect(68,101,2,130,"#d7193f");text("RICH ALUCARD",88,110,19);text("BEFORE THE FAME",89,140,10,"#d7193f");text(title,89,183,10);text(subtitle,89,210,7,"#c18b3c");ctx.restore()
}
function driver(x,opacity=1){
 const im=imgs.driver;if(!im)return;ctx.save();ctx.globalAlpha=opacity;ctx.drawImage(im,Math.round(x+122),225,25,32);ctx.restore()
}
function dust(cx,age){
 if(age<0||age>4)return;
 for(let i=0;i<74;i++){
  const ang=i*2.399,vel=8+(i*13%25),rise=11+(i*17%27),life=2+(i%6)*.23;
  if(age>life)continue;
  const xx=cx+Math.cos(ang)*vel*age,yy=242-rise*age+age*age*5;
  ctx.globalAlpha=(1-age/life)*.8;rect(xx,yy,i%4===0?3:2,2,i%3===0?"#c18b3c":i%2?"#ada5bd":"#655b79");
 }
 ctx.globalAlpha=1
}
function drawCar(left,occupants=true,flash=false){
 const car=imgs.car;if(!car)return;
 shadow(left+154,303,158,.72);
 if(t<5.8&&t>1.4){
  ctx.save();ctx.globalAlpha=.13;polygon([[left+18,266],[left-130,280],[left-130,297],[left+18,280]],"#f9d987");ctx.restore();
 }
 if(occupants){
  driver(left,t<18.35?1:clamp(0,1-(t-18.35)*4,1));
  if(t<10.1||t>=32.7){ctx.save();ctx.beginPath();ctx.rect(left+163,225,54,28);ctx.clip();
  if(t<7.5||t>=33.6)sprite("gbengaIdle",left+202,289,64,false);
  if(t<10.1)sprite("ogaIdle",left+181,287,61,false);
  if(t>=33.6){rect(left+185,241,9,10,"#a07842");rect(left+188,239,3,3,"#bd9354")}
  ctx.restore()}
  if(t>=32.7){ctx.save();ctx.beginPath();ctx.rect(left+108,225,48,28);ctx.clip();sprite("ogaIdle",left+134,288,64,false);ctx.restore()}
 }
 ctx.drawImage(car,Math.round(left),216,310,88);
 // Front and rear wheels: restrained rotation only while travelling.
 if(t<5.8||t>34.7){
  const spin=t*6,centers=[left+58,left+234];
  for(const wx of centers){ctx.strokeStyle="#585266";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(wx-Math.cos(spin)*7,286-Math.sin(spin)*7);ctx.lineTo(wx+Math.cos(spin)*7,286+Math.sin(spin)*7);ctx.stroke()}
 }
 // Original cabin glint and tail lamps remain on the same physical car.
 rect(left+299,269,5,3,"#941c35");if(between(5.4,6.8))rect(left+299,269,5,3,"#ff3156");
 if(flash){ctx.save();ctx.globalAlpha=.55;polygon([[left+108,224],[left+155,224],[left+154,251],[left+106,251]],"#d9c78c");ctx.restore()}
}
function door(left,open,offset=206){
 if(open<=0)return;
 const x=left+offset;const w=38*open;
 polygon([[x,249],[x+w,258],[x+w,289],[x,284]],"#10101b");
 ctx.strokeStyle="#5b5664";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,249);ctx.lineTo(x+w,258);ctx.lineTo(x+w,289);ctx.lineTo(x,284);ctx.stroke();
 rect(x+w-10,265,6,2,"#c1bdaf")
}
function render(time=t){
 t=clamp(0,time,DURATION);ctx.imageSmoothingEnabled=false;rect(0,0,640,360,"#17142c");
 ctx.drawImage(imgs.background,0,0,640,360);
 cloud(35+(t*1.6)%720-80,57,1.45,.23);cloud(450-t*.65,112,1.1,.19);
 for(let i=0;i<3;i++)grassPatch(91+i*34,272,false);
 // Keep one screen direction throughout. Camera push preserves the world coordinates.
 const zoom=between(16.9,22.6)?lerp(1,1.13,ease((t-16.9)/1.2)):between(26,32.7)?lerp(1,1.08,ease((t-26)/1.2)):1;
 ctx.save();ctx.translate(320,235);ctx.scale(zoom,zoom);ctx.translate(-320,-235);
 let left=277;
 if(t<5.8)left=lerp(677,277,ease((t-1.7)/4.1));
 if(t>34.7)left=lerp(277,-420,ease((t-34.7)/4.5));
 const flash=between(18.3,18.37)||between(18.55,18.62);
 drawCar(left,true,flash);
 let doorOpen=0;
 if(between(6,8))doorOpen=Math.min(ease((t-6)/.4),1-ease((t-7.65)/.35));
 if(between(9.6,11.7))doorOpen=Math.min(ease((t-9.6)/.35),1-ease((t-11.35)/.35));
 if(between(29.7,34.1))doorOpen=Math.min(ease((t-29.7)/.35),1-ease((t-33.5)/.5));
 door(left,doorOpen);
 if(between(31.4,33.4))door(left,Math.min(ease((t-31.4)/.3),1-ease((t-33)/.4)),125);
 // Gbenga steps out, crosses the shoulder, waits in the grass, and visibly returns.
 if(t>=6.4&&t<33.6){
  let gx=490,gy=311,walk=false,flip=true;
  if(t<7.5){gx=lerp(490,468,ease((t-6.4)/1.1));gy=lerp(289,311,ease((t-6.4)/1.1));}
  else if(t<12){gx=lerp(468,123,clamp(0,(t-7.5)/4.5,1));gy=lerp(311,275,ease((t-7.5)/4.5));walk=true;}
  else if(t<22.3){gx=123;gy=275;}
  else if(t<26){gx=lerp(123,373,clamp(0,(t-22.3)/3.7,1));gy=lerp(275,311,ease((t-22.3)/3.7));walk=true;flip=false;}
  else if(t<31.7){gx=373;gy=311;flip=false;}
  else{gx=lerp(373,491,ease((t-31.7)/1.6));gy=lerp(311,288,ease((t-32.8)/.8));walk=true;flip=false;}
  const key=walk?(Math.floor(t*6)%2?"gbengaWalk1":"gbengaWalk2"):between(26.8,31.7)?"gbengaTalk":"gbengaIdle";
  sprite(key,gx,gy,94,flip,walk,clamp(0,(t-6.4)*3,1)*clamp(0,(33.6-t)*3,1));
  if(t>12&&t<22.3){grassPatch(122,278,true);text("...",128,156,12,"#c18b3c","center")}
 }
 // The oga leaves the same rear door, then walks to the driver window.
 if(t>=10.1&&t<32.7){
  let ox=486,oy=312,walk=false;
  if(t<11.3){ox=lerp(489,517,ease((t-10.1)/1.2));oy=lerp(286,312,ease((t-10.1)/1.2));}
  else if(t<15.4){ox=lerp(517,300,ease((t-11.3)/4.1));walk=true;}
  else if(t<22.7)ox=300;
  else if(t<25.8){ox=lerp(300,479,ease((t-22.7)/3.1));walk=true;}
  else if(t<30.6)ox=479;
  else if(t<32.1){ox=lerp(479,410,ease((t-30.6)/1.5));walk=true;}
  else{ox=410;oy=lerp(312,286,ease((t-32.1)/.6));}
  const key=between(17,20.3)?"ogaAim":walk?"ogaWalk":"ogaIdle";
  sprite(key,ox,oy,96,key==="ogaAim"||(walk&&t>=22.7&&t<30.6),walk,clamp(0,(t-10.1)*3,1)*clamp(0,(32.7-t)*3,1));
  if(flash){
   polygon([[337,230],[345,224],[343,231],[352,233],[343,235],[343,240],[336,235]],"#f6efd9");rect(350,232,left+139-350,1,"#c18b3c");
  }
 }
 dust(left+135,t-18.35);
 if(t>20.4&&t<30.4){rect(331,300,10,3,"#10101b");rect(333,299,8,1,"#887b95")}
 // Oga puts the gun down; the puff-puff bag stays in the car until the punchline.
 if(t>=24.9&&t<37.7){rect(467,306,13,4,"#07070d");rect(469,309,4,4,"#07070d");rect(468,306,10,1,"#aaa2b4")}
 if(t>=28&&t<33.4){
  const gx=t<31.7?373:lerp(373,491,ease((t-31.7)/1.6)),gy=t<32.8?311:lerp(311,288,ease((t-32.8)/.8));
  const ox=t<30.6?479:lerp(479,410,ease((t-30.6)/1.5));
  let bx=t<31.7?ox+20:gx+25,by=t<31.7?281:gy-33;
  ctx.save();ctx.globalAlpha=t<33?1:clamp(0,(33.6-t)*3,1);
  rect(bx,by,16,17,"#a07842");rect(bx+2,by+2,12,11,"#cca465");rect(bx+4,by-5,8,6,"#bd9354");rect(bx+6,by-4,4,4,"#10101b");rect(bx+5,by+5,6,2,"#6c412a");
  if(t<30.7){rect(bx+4,by+2,4,4,"#c18b3c");rect(bx+9,by+4,4,4,"#dfb665")}ctx.restore()
 }
 ctx.restore();
 rect(0,0,640,15,"#090813");rect(0,351,640,9,"#090813");
 text("OPENING STUDY / 01",20,25,6,"#ada5bd");text("02:17 AM",621,25,6,"#ada5bd","right");
 if(between(2.2,5.2))text("SOMEWHERE AFTER THE LAST BUS.",320,115,9,"#f6efd9","center");
 if(between(7.7,10.8))caption("GBENGA",["Oga. Small stop. Nature is calling."]);
 if(between(13.1,15.4))caption("DRIVER",["I can wait all night."]);
 if(between(19.9,22))caption("OGA",["Not this night."]);
 if(between(26.7,28.6))caption("GBENGA",["Leave the gun."]);
 if(between(29,32.4))caption("GBENGA",["Take the puff puff."]);
 if(t<1.65)board("GBENGA / THE ROADSIDE","AN ORIGINAL PIXEL OPENING SAMPLE",clamp(0,1-(t-1.1)/.5,1));
 if(t>=37.7)board("LEAVE THE GUN. TAKE THE PUFF PUFF.","SAMPLE ONLY / END",ease((t-37.7)/.7));
 if(!started&&!playing){rect(0,0,640,360,"#09081355")}
}
function startAudio(){
 if(audio)return;
 const A=window.AudioContext||window.webkitAudioContext;if(!A)return;
 const ac=new A(),master=ac.createGain();master.gain.value=.075;master.connect(ac.destination);
 const size=ac.sampleRate*2,buf=ac.createBuffer(1,size,ac.sampleRate),a=buf.getChannelData(0);
 for(let i=0;i<size;i++)a[i]=(Math.random()*2-1)*.1;
 const noise=ac.createBufferSource();noise.buffer=buf;noise.loop=true;const filter=ac.createBiquadFilter();filter.type="lowpass";filter.frequency.value=600;noise.connect(filter);filter.connect(master);noise.start();
 audio={ac,master};
}
function sfx(at){
 if(!sound||!audio)return;
 const ac=audio.ac,g=ac.createGain(),osc=ac.createOscillator();g.connect(audio.master);osc.connect(g);osc.type="triangle";osc.frequency.setValueAtTime(at==="shot"?90:45,ac.currentTime);osc.frequency.exponentialRampToValueAtTime(25,ac.currentTime+.14);g.gain.setValueAtTime(at==="shot"?1.1:.3,ac.currentTime);g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+.2);osc.start();osc.stop(ac.currentTime+.21)
}
const hint=root.querySelector('#cinemaSkipHint');
let heldSkipKey=null,resumeOnShow=false;
const visible=()=>!root.hidden;
function lock(){const stage=document.querySelector('#stage'),title=document.querySelector('#startOverlay');if(stage)stage.inert=visible()||!!(title&&!title.hidden&&getComputedStyle(title).display!=='none');if(title)title.inert=visible();}
function setPlaying(value){playing=!!value;if(raf){cancelAnimationFrame(raf);raf=0;}if(playing&&ready&&visible()){last=performance.now();raf=requestAnimationFrame(loop);}}
function begin(){started=true;if(t>=40)t=0;if(ready&&visible()){root.dataset.ready='true';render();setPlaying(true);}}
function finish(){setPlaying(false);resumeOnShow=false;root.hidden=true;document.body.classList.remove('cinema-opening');const title=document.querySelector('#startOverlay');if(title){title.hidden=false;title.inert=false;}lock();const button=document.querySelector('#startButton');if(button&&!button.disabled)button.focus({preventScroll:true});document.dispatchEvent(new CustomEvent('ra:opening-cinema-complete'));}
function replay(){t=0;root.hidden=false;document.body.classList.add('cinema-opening');const title=document.querySelector('#startOverlay');if(title)title.hidden=true;lock();started=true;render();if(!reduced.matches)begin();}
function hintText(){hint.textContent='Click here to skip';}
hintText();matchMedia('(pointer: coarse)').addEventListener?.('change',hintText);
hint.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();finish();});
// Capture both halves of a skip key, including repeats, so it never activates the title beneath.
window.addEventListener('keydown',e=>{
 const key=e.code==='Space'||e.key===' '?'Space':e.key;
 if(heldSkipKey===key){e.preventDefault();e.stopImmediatePropagation();return;}
 if(!visible())return;
 if(key==='Space'||key==='Escape'||(key==='Enter'&&e.target===hint)){e.preventDefault();e.stopImmediatePropagation();heldSkipKey=key;finish();return;}
 if(key==='Enter'){e.preventDefault();e.stopImmediatePropagation();hint.focus({preventScroll:true});}
},true);
window.addEventListener('keyup',e=>{const key=e.code==='Space'||e.key===' '?'Space':e.key;if(heldSkipKey===key){e.preventDefault();e.stopImmediatePropagation();heldSkipKey=null;}},true);
document.addEventListener('visibilitychange',()=>{if(document.hidden){resumeOnShow=playing;setPlaying(false);}else if(resumeOnShow&&visible()&&!reduced.matches){resumeOnShow=false;begin();}});
reduced.addEventListener?.('change',()=>{if(reduced.matches)setPlaying(false);else if(ready&&visible()&&!document.hidden)begin();});
function loop(now){raf=0;if(!visible()||!playing||!ready)return;const dt=Math.min(.05,(now-last)/1000)||0;last=now;t=Math.min(40,t+dt);render();if(t>=40){finish();return;}raf=requestAnimationFrame(loop);}
window.RAOpeningCinema={get time(){return t;},get playing(){return playing;},get ready(){return ready;},get framePending(){return !!raf;},get sound(){return false;},get audioState(){return 'not-created';},isVisible:visible,skip:finish,replay,begin,render,seek(time){setPlaying(false);started=true;render(time);}};
lock();document.addEventListener('DOMContentLoaded',lock,{once:true});
Promise.all(Object.entries(paths).map(([key,src])=>new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>{imgs[key]=image;resolve();};image.onerror=()=>reject(Error('Opening asset failed: '+key));image.src=src;}))).then(async()=>{await document.fonts.ready;ready=true;started=true;root.dataset.ready='true';render();if(visible()&&!reduced.matches&&!document.hidden)begin();}).catch(error=>{root.querySelector('#cinemaStatus').textContent='Opening could not load. Use the skip hint to continue.';console.warn(error.message);});
})();
