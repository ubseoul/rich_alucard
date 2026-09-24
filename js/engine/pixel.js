(function(){
 // Shared 270x480 native pixel canvas helpers for minigames, placeholder environments and placeholder actors.
 // Placeholder output is ROUGH-COMPLETE ONLY and never replaces approved/frozen art.
 const NATIVE={width:270,height:480};
 const palette={ink:'#10101b',night:'#17142c',bone:'#f6efd9',red:'#d7193f',blood:'#7d194b',gold:'#c18b3c',green:'#20c66b',blue:'#3d9ddd',mazda:'#3a6ff0',pink:'#ff6fb5',grey:'#6b6780',dark:'#08070f',sky:'#233a6b',wall:'#2a2340',floor:'#3a2f2a',neon:'#b44cff'};
 const FONT='"Press Start 2P","Courier New",monospace';
 function createCanvas(root,{width=NATIVE.width,height=NATIVE.height,className='ra-pixel-canvas'}={}){
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;canvas.className=className;
  Object.assign(canvas.style,{position:'absolute',left:'0',top:'0',width:'100%',height:'100%',imageRendering:'pixelated',touchAction:'none'});
  root.append(canvas);const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
  function toNative(clientX,clientY){const r=canvas.getBoundingClientRect();return {x:(clientX-r.left)*width/(r.width||width),y:(clientY-r.top)*height/(r.height||height)};}
  return {canvas,ctx,toNative,width,height};
 }
 function text(ctx,str,x,y,{size=8,color=palette.bone,align='left',baseline='top',shadow=palette.ink,maxWidth}={}){
  ctx.save();ctx.font=`${size}px ${FONT}`;ctx.textAlign=align;ctx.textBaseline=baseline;
  if(shadow){ctx.fillStyle=shadow;ctx.fillText(String(str),Math.round(x)+1,Math.round(y)+1,maxWidth);}
  ctx.fillStyle=color;ctx.fillText(String(str),Math.round(x),Math.round(y),maxWidth);ctx.restore();
 }
 function wrap(ctx,str,maxWidth,size=8){ctx.save();ctx.font=`${size}px ${FONT}`;const words=String(str).split(/\s+/),lines=[];let line='';for(const word of words){const next=line?`${line} ${word}`:word;if(ctx.measureText(next).width>maxWidth&&line){lines.push(line);line=word;}else line=next;}if(line)lines.push(line);ctx.restore();return lines;}
 function rect(ctx,x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
 function frame(ctx,x,y,w,h,{fill=palette.bone,border=palette.ink,accent=palette.blood}={}){rect(ctx,x+2,y+2,w,h,accent);rect(ctx,x,y,w,h,border);rect(ctx,x+2,y+2,w-4,h-4,fill);}
 // Seeded PRNG so placeholder scenes are stable between frames/reloads.
 function rng(seed){let s=(typeof seed==='string'?[...seed].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,7):seed>>>0)||1;return ()=>{s^=s<<13;s>>>=0;s^=s>>17;s^=s<<5;s>>>=0;return s/4294967296;};}
 // Placeholder actor silhouette: compact figure, one big identity shape, 2-3 tones. Drawn at native 80x96 with contact at (40,88).
 function drawActor(ctx,spec={},x=40,y=88,scale=1){
  const c=Object.assign({skin:'#8a5a3c',top:'#26222f',bottom:'#1b1824',hair:'#111018',accent:palette.green,height:1,width:1,hairShape:'short',prop:null,tail:false,horns:false,translucent:false},spec);
  ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.scale(scale,scale);if(c.translucent)ctx.globalAlpha=.62;
  const h=c.height,w=c.width,bodyW=Math.round(22*w),legH=Math.round(26*h),torsoH=Math.round(26*h),head=13;
  const r=(xx,yy,ww,hh,col)=>{ctx.fillStyle=col;ctx.fillRect(Math.round(xx),Math.round(yy),Math.round(ww),Math.round(hh));};
  r(-12*w,-2,24*w,3,'rgba(0,0,0,.35)');
  if(c.tail)r(bodyW/2-2,-legH-6,16,6,c.tailColor||c.skin);
  r(-bodyW/2+2,-legH,bodyW/2-3,legH,c.bottom);r(1,-legH,bodyW/2-3,legH,c.bottom);
  r(-bodyW/2,-legH-torsoH,bodyW,torsoH,c.top);
  r(-bodyW/2-4,-legH-torsoH+2,4,torsoH-6,c.top);r(bodyW/2,-legH-torsoH+2,4,torsoH-6,c.top);
  r(-bodyW/2-4,-legH-6,4,4,c.skin);r(bodyW/2,-legH-6,4,4,c.skin);
  const hy=-legH-torsoH-head;r(-7,hy,14,head,c.skin);
  if(c.hairShape==='locs'){r(-13,hy-9,26,12,c.hair);r(-14,hy-2,5,16,c.hair);r(9,hy-2,5,16,c.hair);}
  else if(c.hairShape==='long'){r(-9,hy-4,18,6,c.hair);r(-10,hy,4,22,c.hair);r(6,hy,4,22,c.hair);}
  else if(c.hairShape==='bun'){r(-8,hy-3,16,5,c.hair);r(-4,hy-8,8,6,c.hair);}
  else if(c.hairShape==='bald'){}
  else if(c.hairShape==='hood'){r(-9,hy-4,18,7,c.top);r(-10,hy,3,12,c.top);r(7,hy,3,12,c.top);}
  else if(c.hairShape==='hat'){r(-11,hy-3,22,3,c.hair);r(-7,hy-8,14,6,c.hair);}
  else if(c.hairShape==='spiky'){r(-9,hy-5,18,6,c.hair);for(let i=-8;i<8;i+=4)r(i,hy-10,3,6,c.hair);}
  else r(-8,hy-3,16,5,c.hair);
  if(c.horns){r(-8,hy-8,3,6,c.hornColor||'#e8e2cf');r(5,hy-8,3,6,c.hornColor||'#e8e2cf');}
  if(c.shades)r(-6,hy+4,12,3,'#050508');
  r(4,hy+7,2,2,c.accent);
  if(c.prop==='cup'){r(bodyW/2+2,-legH-12,5,7,'#dfe9ee');r(bodyW/2+3,-legH-16,1,5,'#ff5a5a');}
  else if(c.prop==='mic'){r(bodyW/2+2,-legH-torsoH-2,3,10,'#cfcfcf');}
  else if(c.prop==='box'){r(-8,-legH-torsoH+8,16,10,'#d9c7a0');}
  else if(c.prop==='sword'){r(bodyW/2+3,-legH-torsoH-10,2,34,'#9b8f78');}
  else if(c.prop==='food'){r(bodyW/2+1,-legH-10,7,5,'#e0a040');}
  ctx.restore();
 }
 // Environment painter from a small declarative spec. Honest rough: shapes, lights, crowd silhouettes.
 function paintEnvironment(ctx,spec={}){
  const s=Object.assign({sky:palette.night,wall:palette.wall,floor:palette.floor,horizon:300,seed:'env',props:[],crowd:0,crowdColors:['#2b2540','#3a2c3e','#241d33'],stars:0,rain:false,lights:[],label:null},spec);
  const rand=rng(s.seed);
  rect(ctx,0,0,270,480,s.sky);
  for(let i=0;i<s.stars;i++)rect(ctx,rand()*270,rand()*s.horizon*.8,1,1,rand()>.8?'#fff5c0':'#cfd8ff');
  if(s.wall)rect(ctx,0,s.wallTop??90,270,s.horizon-(s.wallTop??90),s.wall);
  rect(ctx,0,s.horizon,270,480-s.horizon,s.floor);
  rect(ctx,0,s.horizon,270,2,'rgba(0,0,0,.35)');
  for(const p of s.props){
   if(p.type==='rect')rect(ctx,p.x,p.y,p.w,p.h,p.color);
   else if(p.type==='window'){rect(ctx,p.x,p.y,p.w,p.h,p.frame||'#16121f');rect(ctx,p.x+3,p.y+3,p.w-6,p.h-6,p.color||'#3d9ddd');}
   else if(p.type==='sign'){rect(ctx,p.x,p.y,p.w,p.h,p.color||'#1a1528');rect(ctx,p.x,p.y+p.h-2,p.w,2,p.glow||palette.pink);text(ctx,p.text||'',p.x+p.w/2,p.y+Math.max(2,(p.h-8)/2),{size:p.size||6,align:'center',color:p.glow||palette.pink});}
   else if(p.type==='lamp'){rect(ctx,p.x,p.y,2,p.h||40,'#231f2c');ctx.fillStyle=p.glow||'rgba(255,220,140,.18)';ctx.beginPath();ctx.arc(p.x+1,p.y,p.r||16,0,Math.PI*2);ctx.fill();rect(ctx,p.x-1,p.y-2,4,3,p.color||'#ffd98a');}
   else if(p.type==='string'){for(let x=p.x1;x<p.x2;x+=8)rect(ctx,x,p.y+Math.sin(x/12)*3,2,2,p.color||'#ffd98a');}
   else if(p.type==='counter'){rect(ctx,p.x,p.y,p.w,p.h,p.color||'#4a3a30');rect(ctx,p.x,p.y,p.w,3,p.top||'#6e5846');}
   else if(p.type==='table'){rect(ctx,p.x,p.y,p.w,4,p.color||'#5a4636');rect(ctx,p.x+2,p.y+4,2,12,'#2b211a');rect(ctx,p.x+p.w-4,p.y+4,2,12,'#2b211a');}
   else if(p.type==='circle'){ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();}
   else if(p.type==='text')text(ctx,p.text,p.x,p.y,{size:p.size||6,color:p.color||palette.bone,align:p.align||'left'});
  }
  for(const l of s.lights){ctx.fillStyle=l.color||'rgba(180,76,255,.14)';ctx.beginPath();ctx.moveTo(l.x,l.y);ctx.lineTo(l.x-(l.spread||40),s.horizon+60);ctx.lineTo(l.x+(l.spread||40),s.horizon+60);ctx.fill();}
  // Crowd: repeated silhouettes packed from horizon down; count is literal so "packed" claims are visible.
  for(let i=0;i<s.crowd;i++){const row=Math.floor(i/14),x=(i%14)*20+rand()*10-5+(row%2?10:0),y=s.horizon+14+row*9+rand()*4,col=s.crowdColors[Math.floor(rand()*s.crowdColors.length)];rect(ctx,x,y-18,9,18,col);rect(ctx,x+1,y-24,7,7,col);if(rand()>.8)rect(ctx,x+2,y-26,1,4,'#ffd98a');}
  if(s.rain){for(let i=0;i<120;i++)rect(ctx,rand()*270,rand()*480,1,5,'rgba(170,200,255,.35)');}
  if(s.label)text(ctx,s.label,6,s.labelY??70,{size:6,color:'rgba(246,239,217,.8)'});
 }
 window.RAPixel={NATIVE,palette,FONT,createCanvas,text,wrap,rect,frame,rng,drawActor,paintEnvironment};
})();
