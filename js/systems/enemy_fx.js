(function(){
 'use strict';
 // RC2 BUILD 2 · enemy attack FX. Every enemy move gets its own multi-frame, hard-pixel attack animation in the
 // grammar of Rich's BLOOD BATH / VAMPIRE BITE: wind-up frames -> travelling streak -> contact starburst -> debris/fade.
 // Code-drawn on the same 270-wide world canvas as RACombatPixelFX; presentation only (never writes rules/save).
 const H=()=>window.RACombatPixelFX?.helpers;
 const reduced=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 const FRAMES=10,FRAME_MS=62;
 // ---- bitmap sprites (hard pixels) for thrown things. '.' empty, letters index the palette passed with the sprite.
 const SPRITES={
  briefcase:{p:{k:'#17131e',b:'#7a4a28',g:'#d6af62'},m:['.kkkk.','kbbbbk','kbggbk','kbbbbk','kbbbbk','.kkkk.'].map(r=>r.padEnd(8,'.')).map(r=>r),s:2},
  lunchbox:{p:{k:'#17131e',r:'#ae2446',g:'#d6af62',w:'#f5e8c5'},m:['.kkkkk.','krrrrrk','kwwgwwk','krrrrrk','.kkkkk.'],s:2},
  glass:{p:{k:'#17131e',w:'#f5e8c5',o:'#d98241'},m:['kwwwk','kooook','.kook.','..ko..','..ko..','.kkkk.'],s:2},
  arrow:{p:{k:'#17131e',w:'#f5e8c5',b:'#7a4a28',r:'#ae2446'},m:['..k.....','.kwk....','kwwwkkkk','.kwbbbbr','..k.....'].map(r=>r),s:2},
  crumb:{p:{k:'#17131e',y:'#d6af62',o:'#d98241'},m:['kyk','yoy','kyk'],s:2},
  note:{p:{k:'#17131e',v:'#9460c0'},m:['..kkk','..kvk','..kvk','kkkvk','kvvvk','.kkk.'],s:2},
  heart:{p:{k:'#17131e',r:'#d85a8a'},m:['.kk.kk.','krrkrrk','krrrrrk','.krrrk.','..krk..','...k...'],s:2},
  cross:{p:{k:'#17131e',g:'#d6af62',w:'#f5e8c5'},m:['..kk..','.kwwk.','kkwwkk','kwwwwk','kkwwkk','.kwwk.','.kwwk.','..kk..'],s:2},
  bone:{p:{k:'#17131e',w:'#f5e8c5'},m:['kk...kk','kwkkkwk','.kwwwk.','kwkkkwk','kk...kk'],s:2},
  star:{p:{k:'#17131e',y:'#d6af62',w:'#f5e8c5'},m:['..k..','.kyk.','kywyk','.kyk.','..k..'],s:2},
  exclaim:{p:{k:'#17131e',w:'#f5e8c5'},m:['kkk','kwk','kwk','kwk','kkk','kwk','kkk'],s:2}
 };
 function blit(c,name,cx,cy,scale=1,tint=null,flip=false){const sp=SPRITES[name];if(!sp)return;const {rect}=H(),s=sp.s*scale,w=Math.max(...sp.m.map(r=>r.length)),h=sp.m.length;
  for(let y=0;y<h;y++)for(let x=0;x<sp.m[y].length;x++){const ch=sp.m[y][x];if(ch==='.')continue;const col=(tint&&ch!=='k')?tint:sp.p[ch];if(!col)continue;const xx=flip?(w-1-x):x;rect(c,cx-w*s/2+xx*s,cy-h*s/2+y*s,s,s,col);}}
 // ---- painters. a = enemy anchor, t = Rich anchor, f = frame 0..FRAMES-1, o = options.
 const lerp=(a,b,u)=>a+(b-a)*Math.max(0,Math.min(1,u));
 const PAINT={
  slash(c,f,a,t,o){const {C,rect,line,star,cross}=H();const col=o.color||C.bone;
   if(f<=2){const k=f;line(c,a.x-6-k*3,a.y-20+k,a.x-2-k*3,a.y-12+k*2,col,2);cross(c,a.x-10,a.y-16,2+k,C.gold);return;}
   const u=Math.min(1,(f-2)/3),x0=t.x+26,y0=t.y-30,x1=t.x-24,y1=t.y+26;
   const len=f<=5?u:1;line(c,x0,y0,lerp(x0,x1,len),lerp(y0,y1,len),C.ink,8);line(c,x0,y0,lerp(x0,x1,len),lerp(y0,y1,len),col,5);line(c,x0,y0,lerp(x0,x1,len),lerp(y0,y1,len),C.bone,2);
   if(o.claws)for(let i=1;i<=2;i++)line(c,x0-i*9,y0,lerp(x0,x1,len)-i*9,lerp(y0,y1,len),col,2);
   if(f>=5&&f<=7)star(c,t.x,t.y,18+(f-5)*5,col);
   if(f>=6)for(let i=0;i<5;i++)rect(c,t.x-16+i*8+((f*3+i)%4),t.y+8+(f-6)*3+(i%2)*4,2,2,i%2?C.bone:col);},
  stab(c,f,a,t,o){const {C,rect,line,star}=H();const col=o.color||C.bone;
   const u=f<=2?0:Math.min(1,(f-2)/3);line(c,a.x-8,a.y-2,lerp(a.x-8,t.x+6,u),lerp(a.y-2,t.y,u),C.ink,8);line(c,a.x-8,a.y-2,lerp(a.x-8,t.x+6,u),lerp(a.y-2,t.y,u),col,4);
   if(f>=5&&f<=8)star(c,t.x,t.y,16+(f-5)*4,C.red);if(f>=6)for(let i=0;i<4;i++)rect(c,t.x+4+i*3,t.y-8+((i*5+f)%9),2,2,C.red);},
  smash(c,f,a,t,o){const {C,rect,line,star,ring}=H();const col=o.color||C.gold;
   if(f<=2){for(let i=0;i<4;i++)rect(c,a.x-14-f*6-i*3,a.y-14+i*9,16,4,i%2?C.bone:col);return;}
   if(f<=4){const u=(f-2)/2;for(let i=0;i<3;i++){const y=t.y-12+i*12;line(c,lerp(a.x-10,t.x+12,u),y,lerp(a.x+20,t.x+30,u),y,i===1?C.bone:col,4);}return;}
   if(f<=8){star(c,t.x,t.y,f===5?30:f===6?24:f===7?18:12,col);ring(c,t.x,t.y,8+(f-5)*8,C.ink);ring(c,t.x,t.y,7+(f-5)*8,C.bone);
    if(o.heavy)ring(c,t.x,t.y,9+(f-5)*9,col);for(let i=0;i<6;i++){const ang=i*1.05+.4,r=10+(f-5)*7;rect(c,t.x+Math.cos(ang)*r,t.y+Math.sin(ang)*r,3,3,i%2?C.bone:col);}return;}
   ring(c,t.x,t.y,22,col);},
  projectile(c,f,a,t,o){const {C,rect,line,star}=H();
   const sx=a.x-12,sy=a.y-6;if(f<=1){blit(c,o.sprite,sx+2,sy-2-f*2,(o.scale||1)*1.5);return;}
   const u=Math.min(1,(f-1)/4),arc=Math.sin(u*Math.PI)*(o.arc??14);
   for(let g=3;g>=1;g--){const uu=Math.max(0,u-g*.1);rect(c,lerp(sx,t.x+6,uu),lerp(sy,t.y-2,uu)-Math.sin(uu*Math.PI)*(o.arc??14),3,3,g%2?(o.color||C.bone):C.ink);}
   if(f<=5)blit(c,o.sprite,lerp(sx,t.x+6,u),lerp(sy,t.y-2,u)-arc,(o.scale||1)*1.5,null,false);
   if(f>=5){star(c,t.x,t.y,f===5?26:f===6?20:f===7?14:9,o.color||C.bone);for(let i=0;i<(o.spray||5);i++){const ang=i*1.3+f,r=6+(f-5)*6;rect(c,t.x+Math.cos(ang)*r,t.y+Math.sin(ang)*r-2,2,2,i%2?C.bone:(o.color||C.gold));}}},
  beam(c,f,a,t,o){const {C,rect,line,diamond,star,ring}=H();const col=o.color||C.blue,sx=o.fromTop?t.x:a.x-6,sy=o.fromTop?4:a.y-4;
   if(f<=3){const r=Math.max(3,18-f*4);diamond(c,sx,sy,r,col,2);diamond(c,sx,sy,Math.max(2,r-6),C.bone,1);for(let i=0;i<4;i++)rect(c,sx+Math.cos(i*1.57+f)*r*1.6,sy+Math.sin(i*1.57+f)*r*1.6,2,2,C.bone);return;}
   if(f<=7){const w=[0,0,0,0,3,7,9,5][f];line(c,sx,sy,t.x,t.y,C.ink,w+4);line(c,sx,sy,t.x,t.y,col,w+2);line(c,sx,sy,t.x,t.y,C.bone,Math.max(1,w-2));star(c,t.x,t.y,10+w,col);return;}
   ring(c,t.x,t.y,14+(f-7)*4,col);},
  burst(c,f,a,t,o){const {C,rect,line,ring,diamond,cross,star}=H();const col=o.color||C.violet,src=o.at==='rich'?t:a;
   const r=6+f*6;if(f<=7){ring(c,src.x,src.y,r,C.ink);ring(c,src.x,src.y,r-1,col);ring(c,src.x,src.y,r-3,col);if(f%2===0)diamond(c,src.x,src.y,r+4,o.accent||C.bone,1);}
   const glyph=o.glyph;if(glyph){for(let i=0;i<(o.count||4);i++){const u=Math.min(1,Math.max(0,(f-1-i*.5)/6));if(u<=0)continue;const toRich=o.at!=='self'&&o.at!=='rich';const x=toRich?lerp(a.x-8,t.x+4,u)+Math.sin(u*6+i)*5:src.x+Math.cos(i*1.7+1)*(10+u*22),y=toRich?lerp(a.y-6,t.y-4,u)-Math.sin(u*Math.PI)*10+(i%3-1)*10:src.y-u*28-i*3;blit(c,glyph,x,y,1.4,col);}}
   if(o.hitStar&&f>=5&&f<=8)star(c,t.x,t.y,8+(f-5)*3,col);},
  flurry(c,f,a,t,o){const {C,rect,line,star}=H();const n=o.hits||3,col=o.color||C.gold;
   for(let i=0;i<n;i++){const start=1+i*Math.max(1,Math.floor(6/n)),k=f-start;if(k<0||k>3)continue;
    const jx=((i*37)%17)-8,jy=((i*23)%23)-11;if(k<=1)line(c,lerp(a.x-8,t.x+8,.3+k*.4),a.y+jy*.4,t.x+8+jx*.4,t.y+jy,col,2);else{star(c,t.x+jx,t.y+jy,k===2?16:11,o.sprite?C.bone:col);if(o.sprite&&k===2)blit(c,o.sprite,t.x+jx,t.y+jy-12,.8,col);}}},
  word(c,f,a,t,o){const {C,rect,line,ring,star}=H();const col=o.color||C.gold;
   if(f<=4){for(let i=0;i<3;i++){const u=Math.min(1,Math.max(0,(f-i*.6)/3.4));if(u>0)blit(c,'exclaim',a.x-6+(i-1)*16,a.y-34-u*18+(i%2)*3,1.4,col);}return;}
   const u=(f-4)/5;for(let i=0;i<3;i++){const x=lerp(a.x-12,t.x+14,u)+i*-6;ring(c,x,a.y-4+(i-1)*5,6+i*3,i%2?C.bone:col);}
   if(f>=6)star(c,t.x,t.y,16+(f-6)*4,col);}
 };
 // enemy -> move -> {style,...options}. Keys fall back to MOVE_DEFAULT[moveId] then STYLE_BY_DMG.
 const CC={bone:'#f5e8c5',gold:'#d6af62',red:'#ae2446',violet:'#9460c0',blue:'#6876d3',green:'#72b58a',orange:'#d98241',pink:'#d85a8a',brown:'#9a6a3c'};
 const MAP={
  uncle_sunday:{wag:{s:'word',color:CC.gold},father:{s:'word',color:CC.orange,heavy:1},marriage:{s:'burst',glyph:'heart',color:CC.pink,count:5,at:'toRich'}},
  bruce_loose:{flurry:{s:'flurry',hits:3,color:'#e6c23a'},kick:{s:'smash',color:'#e6c23a',heavy:1},noise:{s:'burst',glyph:'exclaim',color:'#e6c23a',at:'self',count:5}},
  kevins:{poke:{s:'flurry',hits:5,color:CC.blue},honor:{s:'slash',color:CC.bone}},
  phil:{beam:{s:'beam',color:'#7ad0ff'},punch:{s:'smash',color:CC.orange}},
  bonesworth:{sway:{s:'burst',glyph:'star',color:CC.green,at:'self',count:5},cleave:{s:'slash',color:CC.bone},bash:{s:'smash',color:CC.bone,heavy:1},rattle:{s:'burst',glyph:'bone',color:CC.bone,count:5,at:'toRich'},second_wind:{s:'burst',glyph:'cross',color:CC.green,at:'self',count:4},death_charge:{s:'smash',color:CC.red,heavy:1}},
  hilt:{jab:{s:'stab',color:CC.bone},lunch:{s:'projectile',sprite:'lunchbox',color:CC.red,arc:18},pin:{s:'smash',color:CC.bone,heavy:1}},
  hilt_rematch:{jab:{s:'stab',color:CC.bone},lunch:{s:'projectile',sprite:'lunchbox',color:CC.red,arc:18},pin:{s:'smash',color:CC.bone,heavy:1}},
  paladin:{swing:{s:'slash',color:CC.gold},shield:{s:'burst',glyph:'cross',color:CC.gold,at:'self',count:4}},
  bard:{cover:{s:'burst',glyph:'note',color:CC.violet,count:6,at:'toRich'},strum:{s:'burst',glyph:'note',color:CC.pink,count:3,at:'toRich',hitStar:1}},
  cleric:{heal:{s:'burst',glyph:'cross',color:CC.green,at:'self',count:4},judge:{s:'beam',color:CC.gold,fromTop:1}},
  coffe:{backstab:{s:'slash',color:CC.violet},dagger:{s:'stab',color:CC.violet},sip:{s:'burst',glyph:'star',color:CC.brown,at:'self',count:3}},
  lil_smack:{chew:{s:'flurry',hits:3,color:CC.orange,sprite:'crumb'},crumb:{s:'projectile',sprite:'crumb',color:CC.gold,spray:9,arc:8}},
  smallie:{chew:{s:'flurry',hits:3,color:CC.orange,sprite:'crumb'},crumb:{s:'projectile',sprite:'crumb',color:CC.gold,spray:9,arc:8}},
  smallie_cousin:{dagger:{s:'stab',color:CC.violet},feint:{s:'burst',glyph:'star',color:CC.violet,at:'self',count:4,hitStar:1}},
  buckhead:{empire:{s:'burst',glyph:'star',color:CC.gold,count:6,at:'toRich',hitStar:1},mimosa:{s:'projectile',sprite:'glass',color:CC.orange,arc:16}},
  hunter:{bolt:{s:'projectile',sprite:'arrow',color:CC.bone,arc:2}},
  groupies:{hug:{s:'flurry',hits:3,color:CC.pink,sprite:'heart'}},
  werewolf:{swipe:{s:'slash',color:CC.bone,claws:1},howl:{s:'burst',glyph:'exclaim',color:CC.violet,at:'self',count:5}},
  training:{bonk:{s:'smash',color:CC.brown}}
 };
 const MOVE_DEFAULT={briefcase_throw:{s:'projectile',sprite:'briefcase',color:CC.gold,arc:14},importer_shove:{s:'smash',color:CC.orange,heavy:1}};
 function specFor(enemyId,moveId,dmg){const base=MAP[enemyId]?.[moveId]||MOVE_DEFAULT[moveId];if(base)return base;return dmg>=30?{s:'smash',color:CC.red,heavy:1}:dmg>0?{s:'slash',color:CC.bone}:{s:'burst',glyph:'star',color:CC.violet,at:'self',count:3};}
 const wait=ms=>new Promise(r=>setTimeout(r,ms));
 // attack({root,enemyId,moveId,dmg,attacker:enemyEl,target:richEl}) -> resolves when the animation ends (<= ~650 ms).
 async function attack({root,enemyId,moveId,dmg=0,attacker,target,freeze=null}){
  const fx=H();if(!fx||!root||!root.isConnected)return 0;
  const sp=specFor(enemyId,moveId,dmg),paint=PAINT[sp.s];if(!paint)return 0;
  let V,L;try{V=fx.view(root,target,attacker);L=fx.layer(root,V,`enemy:${enemyId}:${moveId}`);}catch(e){return 0;}
  // fx.view(root,attacker,target) names rich as "attacker"; here the enemy attacks, so anchors are: enemy=V.enemy, rich=V.rich.
  const a=V.enemy,t=V.rich;L.canvas.classList.add('rc2-enemy-fx');root.dataset.lastEnemyFx=`${enemyId}:${moveId}:${sp.s}`;
  const opts={...sp,hits:sp.hits};
  const draw=f=>{L.ctx.clearRect(0,0,270,V.H);paint(L.ctx,f,a,t,opts);L.canvas.dataset.frame=String(f);};
  if(freeze!==null){draw(freeze);await wait(700);L.canvas.remove();return 700;}
  if(reduced()){draw(6);await wait(220);L.canvas.remove();return 220;}
  for(let f=0;f<FRAMES;f++){if(!root.isConnected)break;draw(f);await wait(FRAME_MS);}
  L.canvas.remove();return FRAMES*FRAME_MS;
 }
 window.RAEnemyFX={attack,specFor,MAP,PAINT,SPRITES,FRAMES,FRAME_MS};
})();
