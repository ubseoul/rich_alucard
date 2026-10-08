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
  sleeve(c,f,a,t,o){const {C,line,star}=H();
   if(f<2){line(c,a.x-8,a.y+12,a.x-2-f*3,a.y+4,C.gold,2);return;}
   if(f<5){const u=(f-1)/4;for(let i=0;i<3;i++)line(c,a.x-10,a.y+8+i*4,lerp(a.x-10,t.x+12,u),a.y+8+i*8,'#6f173b',3);return;}
   if(f<8){for(let i=0;i<3;i++)line(c,t.x+22,t.y-12+i*12,t.x-14,t.y-8+i*9,i===1?C.gold:'#6f173b',2);if(f===5)star(c,t.x,t.y+6,12,C.gold);}
  },
  voiceNote(c,f,a,t,o){const {C,rect,line}=H();
   if(f<2)return;
   for(let i=0;i<4;i++){const x=a.x-16-i*7,y=a.y-12;const height=2+((i+f)%3)*3;line(c,x,y-height,x,y+height,C.gold,1);}
   if(f>=5&&f<8)for(let i=0;i<3;i++)rect(c,t.x-10+i*10,t.y-25+(i%2)*4,2,3,C.gold);
  },
  fatherPalm(c,f,a,t,o){const {C,line,cross}=H();
   if(f<2)return;
   if(f<5){line(c,a.x-22,a.y+10,a.x-22,a.y+17-f*2,C.gold,2);return;}
   if(f<8){cross(c,a.x,a.y+5,4+(f-5)*3,C.gold);line(c,a.x-14,a.floor-3,a.x+14,a.floor-3,C.gold,2);}
  },
  draco(c,f,a,t,o){const {C,line,star,rect}=H();const x=a.x-12,y=a.y+7;
   if(f<2){rect(c,x+4,y+6-f*3,3,3,C.gold);return;}
   if(f<5){line(c,x,y,t.x+12,t.y,C.gold,1);return;}
   if(f===5||f===7){star(c,x,y,7,C.gold);line(c,x-5,y,t.x+4,t.y,C.bone,2);star(c,t.x,t.y+(f===7?6:-4),11,C.gold);}
   if(f>=8)rect(c,x+2+(f-8)*3,y+10,2,2,C.gold);
  },
  heel(c,f,a,t,o){const {C,line,star}=H();
   if(f<2){line(c,a.x-8,a.floor-12,a.x-13,a.floor-19-f*2,C.gold,2);return;}
   if(f<5){const u=(f-1)/4;line(c,a.x-12,a.floor-22,lerp(a.x-12,t.x+10,u),lerp(a.floor-22,t.y+12,u),C.gold,3);return;}
   if(f<8){line(c,t.x+17,t.y+12,t.x-14,t.y+12,C.bone,3);if(f===5)star(c,t.x,t.y+12,16,C.gold);}
  },
  boxing(c,f,a,t,o){const {C,line,star}=H();const y=t.y+(o.cross?4:-4);
   if(f<2)return;
   if(f<5){const u=(f-1)/4;line(c,a.x-8,a.y+(o.cross?6:-3),lerp(a.x-8,t.x+9,u),lerp(a.y,y,u),C.bone,2);}
   else if(f<7){if(o.cross)line(c,t.x+14,y-8,t.x-7,y+6,C.gold,2);star(c,t.x,y,o.cross?9:6,C.bone);}
  },
  antenna(c,f,a,t,o){const {C,line,rect}=H();
   if(f<5){const u=f/5;line(c,a.x-20,a.y-12,a.x-32-u*10,a.y-28+u*12,C.orange,2);return;}
   if(f<8)for(let i=0;i<3;i++)rect(c,t.x-12+i*10,t.y-22-i%2*3,2,4,C.orange);
  },
  scuttle(c,f,a,t,o){const {C,rect,line,star}=H();
   const u=Math.max(0,Math.min(1,(f-1)/4)),floor=t.floor-3;
   if(f<5)for(let i=0;i<4;i++)rect(c,lerp(a.x,t.x+18,u)+i*5,floor-i%2*3,3,2,C.orange);
   else if(f<8){line(c,t.x+19,floor,t.x-12,floor,C.orange,2);if(f===5)star(c,t.x,t.y+17,12,C.orange);}
  },
  stare(c,f,a,t,o){const {C,rect,line}=H();
   if(f<5){rect(c,a.x-26,a.y-8,3+f,2,C.gold);return;}
   if(f<8)for(let i=0;i<3;i++)line(c,t.x-12+i*10,t.y-27,t.x-14+i*10,t.y-21,C.orange,1);
  },
  wingbeat(c,f,a,t,o){const {C,line,star}=H();
   if(f<2)return;
   if(f<5){for(let i=0;i<3;i++)line(c,a.x+14+i*8,a.y-10-i*3,a.x+20+i*8,a.y-15-i*3,C.orange,2);return;}
   if(f<8){line(c,t.x+12,t.y-25,t.x-8,t.y+8,C.orange,2);if(f===5)star(c,t.x,t.y,15,C.gold);}
  },
  word(c,f,a,t,o){const {C,rect,line,ring,star}=H();const col=o.color||C.gold;
   if(f<=4){for(let i=0;i<3;i++){const u=Math.min(1,Math.max(0,(f-i*.6)/3.4));if(u>0)blit(c,'exclaim',a.x-6+(i-1)*16,a.y-34-u*18+(i%2)*3,1.4,col);}return;}
   const u=(f-4)/5;for(let i=0;i<3;i++){const x=lerp(a.x-12,t.x+14,u)+i*-6;ring(c,x,a.y-4+(i-1)*5,6+i*3,i%2?C.bone:col);}
   if(f>=6)star(c,t.x,t.y,16+(f-6)*4,col);}
 };
 // enemy -> move -> {style,...options}. Keys fall back to MOVE_DEFAULT[moveId] then STYLE_BY_DMG.
 const CC={bone:'#f5e8c5',gold:'#d6af62',red:'#ae2446',violet:'#9460c0',blue:'#6876d3',green:'#72b58a',orange:'#d98241',pink:'#d85a8a',brown:'#9a6a3c'};
 const MAP={
  gbenga:{sweep:{s:'sleeve'},voice:{s:'voiceNote'},my_son:{s:'fatherPalm'},draco:{s:'draco'}},
  blad33ee:{bolt:{s:'projectile',sprite:'arrow',color:CC.bone,arc:2},slash:{s:'slash',color:CC.bone}},
  uncle_sunday:{wag:{s:'word',color:CC.gold},father:{s:'word',color:CC.orange,heavy:1},marriage:{s:'burst',glyph:'heart',color:CC.pink,count:5,at:'toRich'}},
  bruce_loose:{flurry:{s:'flurry',hits:3,color:'#e6c23a'},kick:{s:'heel'},noise:{s:'burst',glyph:'exclaim',color:'#e6c23a',at:'self',count:5}},
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
  ogun_rave_hilt:{bolt:{s:'projectile',sprite:'arrow',color:CC.bone,arc:2}},
  groupies:{hug:{s:'flurry',hits:3,color:CC.pink,sprite:'heart'}},
  werewolf:{swipe:{s:'slash',color:CC.bone,claws:1},howl:{s:'burst',glyph:'exclaim',color:CC.violet,at:'self',count:5}},
  training:{bonk:{s:'smash',color:CC.brown}},
  f15_roxy_spar:{jab:{s:'boxing'},cross:{s:'boxing',cross:true}},
  f15_uncle_bunmi:{antenna:{s:'antenna'},scuttle:{s:'scuttle'},stare:{s:'stare'},flies:{s:'wingbeat'}}
 };
 const MOVE_DEFAULT={briefcase_throw:{s:'projectile',sprite:'briefcase',color:CC.gold,arc:14},importer_shove:{s:'smash',color:CC.orange,heavy:1}};
 function specFor(enemyId,moveId,dmg){const base=MAP[enemyId]?.[moveId]||MOVE_DEFAULT[moveId];if(base)return base;return dmg>=30?{s:'smash',color:CC.red,heavy:1}:dmg>0?{s:'slash',color:CC.bone}:{s:'burst',glyph:'star',color:CC.violet,at:'self',count:3};}
 const POSES={smallie:{chew:'smallie-chew',crumb:'smallie-crumb'},smallie_cousin:{dagger:'cousin-dagger',feint:'cousin-feint'}};
 const GBENGA={sweep:'adjusting_sleeves',voice:'voice_note',my_son:'my_son',draco:'golden_draco'};
 // Additive reviewed candidates. Four named body states share the mechanical frame5 contact.
 // Callers may register private sequences without exposing their paths in the public registry.
 const TIMELINES={},warmImages=new Map();
 function register(enemyId,moveId,sequence){
  if(!sequence||!['prepare','action','contact','recover'].every(k=>typeof sequence[k]==='string'))throw new Error('enemy timeline requires four explicit body-state assets');
  if(new Set(['prepare','action','contact','recover'].map(k=>sequence[k])).size<2)throw new Error('enemy timeline requires distinct drawn body assets');
  if(sequence.frames&&(!Array.isArray(sequence.frames)||sequence.frames.length!==FRAMES||sequence.frames.some(p=>typeof p!=='string')))throw new Error('enemy timeline frames require ten explicit source slots');
  (TIMELINES[enemyId]??={})[moveId]=Object.freeze({...sequence});return TIMELINES[enemyId][moveId];
 }
 function preload(enemyId,appearance=null){
  const timelineId=appearance?`${enemyId}@${appearance}`:enemyId;
  const paths=new Set();
  for(const id of new Set([...Object.keys(window.RACombatData?.ENEMIES?.[enemyId]?.moves||{}),...Object.keys(TIMELINES[timelineId]||{})]))for(let f=0;f<FRAMES;f++){const src=poseFor(enemyId,id,f,appearance);if(src)paths.add(src);}
  for(const src of paths)if(!warmImages.has(src)){const img=new Image();img.src=src;warmImages.set(src,img);}
  return [...paths];
 }
 function poseFor(enemyId,moveId,f,appearance=null){
  const sequence=TIMELINES[appearance?`${enemyId}@${appearance}`:enemyId]?.[moveId];
  if(sequence)return sequence.frames?.[f]||sequence[f<2?'prepare':f<5?'action':f<8?'contact':'recover'];
  if(appearance)return null; // Never replace an authored appearance with another stage's body poses.
  const key=POSES[enemyId]?.[moveId];
  // Contact is frame5: hold the drawn action through impact, then recover at frame7.
  if(key)return `assets/rc4/combat_candidates_v1/${key}-f${f<2?1:f<7?2:3}.png`;
  if(enemyId==='gbenga'){const states=window.RABtfPeople?.get('gbenga')?.states||{},key=GBENGA[moveId];return f<7?states[key]||null:null;}
  return null;
 }
 // Batch2 exact reviewed PNGs; originals remain unchanged.
 register("gbenga","sweep",{"prepare":"assets/rc4/combat_candidates_v2/gbenga-sweep-prepare.png","action":"assets/rc4/combat_candidates_v2/gbenga-sweep-action.png","contact":"assets/rc4/combat_candidates_v2/gbenga-sweep-contact.png","recover":"assets/rc4/combat_candidates_v2/gbenga-sweep-recovery.png","review":"assistant-delegated accepted batch2"});
 register("gbenga","voice",{"prepare":"assets/rc4/combat_candidates_v2/gbenga-voice-prepare.png","action":"assets/rc4/combat_candidates_v2/gbenga-voice-action.png","contact":"assets/rc4/combat_candidates_v2/gbenga-voice-contact.png","recover":"assets/rc4/combat_candidates_v2/gbenga-voice-recovery.png","review":"assistant-delegated accepted batch2"});
 register("gbenga","my_son",{"prepare":"assets/rc4/combat_candidates_v2/gbenga-my_son-prepare.png","action":"assets/rc4/combat_candidates_v2/gbenga-my_son-action.png","contact":"assets/rc4/combat_candidates_v2/gbenga-my_son-contact.png","recover":"assets/rc4/combat_candidates_v2/gbenga-my_son-recovery.png","review":"assistant-delegated accepted batch2"});
 register("gbenga","draco",{"prepare":"assets/rc4/combat_candidates_v2/gbenga-draco-prepare.png","action":"assets/rc4/combat_candidates_v2/gbenga-draco-action.png","contact":"assets/rc4/combat_candidates_v2/gbenga-draco-contact.png","recover":"assets/rc4/combat_candidates_v2/gbenga-draco-recovery.png","review":"assistant-delegated accepted batch2"});
 register("blad33ee","bolt",{"prepare":"assets/rc4/combat_candidates_v2/blad33ee-bolt-prepare.png","action":"assets/rc4/combat_candidates_v2/blad33ee-bolt-action.png","contact":"assets/rc4/combat_candidates_v2/blad33ee-bolt-contact.png","recover":"assets/rc4/combat_candidates_v2/blad33ee-bolt-recovery.png","review":"assistant-delegated accepted batch2"});
 // Batch3B exact accepted wolf boxing and left-facing native cockroach states.
 register("f15_roxy_spar","jab",{"prepare":"assets/rc4/combat_candidates_v3/roxy-jab-prepare.png","action":"assets/rc4/combat_candidates_v3/roxy-jab-action.png","contact":"assets/rc4/combat_candidates_v3/roxy-jab-contact.png","recover":"assets/rc4/combat_candidates_v3/roxy-jab-recovery.png","neutral":"assets/rc4/combat_candidates_v3/roxy-guard.png","review":"assistant-delegated accepted batch3B"});
 register("f15_roxy_spar","cross",{"prepare":"assets/rc4/combat_candidates_v3/roxy-cross-prepare.png","action":"assets/rc4/combat_candidates_v3/roxy-cross-action.png","contact":"assets/rc4/combat_candidates_v3/roxy-cross-contact.png","recover":"assets/rc4/combat_candidates_v3/roxy-cross-recovery.png","neutral":"assets/rc4/combat_candidates_v3/roxy-guard.png","review":"assistant-delegated accepted batch3B"});
 register("f15_uncle_bunmi","antenna",{"prepare":"assets/rc4/combat_candidates_v3/bunmi-antenna-prepare.png","action":"assets/rc4/combat_candidates_v3/bunmi-antenna-action.png","contact":"assets/rc4/combat_candidates_v3/bunmi-antenna-contact.png","recover":"assets/rc4/combat_candidates_v3/bunmi-antenna-recovery.png","review":"assistant-delegated accepted batch3B"});
 register("f15_uncle_bunmi","scuttle",{"prepare":"assets/rc4/combat_candidates_v3/bunmi-scuttle-prepare.png","action":"assets/rc4/combat_candidates_v3/bunmi-scuttle-action.png","contact":"assets/rc4/combat_candidates_v3/bunmi-scuttle-contact.png","recover":"assets/rc4/combat_candidates_v3/bunmi-scuttle-recovery.png","review":"assistant-delegated accepted batch3B"});
 register("f15_uncle_bunmi","stare",{"prepare":"assets/rc4/combat_candidates_v3/bunmi-stare-prepare.png","action":"assets/rc4/combat_candidates_v3/bunmi-stare-action.png","contact":"assets/rc4/combat_candidates_v3/bunmi-stare-contact.png","recover":"assets/rc4/combat_candidates_v3/bunmi-stare-recovery.png","review":"assistant-delegated accepted batch3B"});
 register("f15_uncle_bunmi","flies",{"prepare":"assets/rc4/combat_candidates_v3/bunmi-flies-prepare.png","action":"assets/rc4/combat_candidates_v3/bunmi-flies-action.png","contact":"assets/rc4/combat_candidates_v3/bunmi-flies-contact.png","recover":"assets/rc4/combat_candidates_v3/bunmi-flies-recovery.png","review":"assistant-delegated accepted batch3B"});
 // Batch3A exact accepted martial, low-stance and compact two-palm body states.
 register("bruce_loose","flurry",{"prepare":"assets/rc4/combat_candidates_v3/bruce-flurry-prepare.png","action":"assets/rc4/combat_candidates_v3/bruce-flurry-action.png","contact":"assets/rc4/combat_candidates_v3/bruce-flurry-contact.png","recover":"assets/rc4/combat_candidates_v3/bruce-flurry-recovery.png","review":"assistant-delegated accepted batch3A"});
 register("bruce_loose","kick",{"prepare":"assets/rc4/combat_candidates_v3/bruce-kick-prepare.png","action":"assets/rc4/combat_candidates_v3/bruce-kick-action.png","contact":"assets/rc4/combat_candidates_v3/bruce-kick-contact.png","recover":"assets/rc4/combat_candidates_v3/bruce-kick-recovery.png","review":"assistant-delegated accepted batch3A"});
 register("bruce_loose","noise",{"prepare":"assets/rc4/combat_candidates_v3/bruce-noise-prepare.png","action":"assets/rc4/combat_candidates_v3/bruce-noise-action.png","contact":"assets/rc4/combat_candidates_v3/bruce-noise-contact.png","recover":"assets/rc4/combat_candidates_v3/bruce-noise-recovery.png","review":"assistant-delegated accepted batch3A"});
 register("phil","punch",{"prepare":"assets/rc4/combat_candidates_v3/phil-punch-prepare.png","action":"assets/rc4/combat_candidates_v3/phil-punch-action.png","contact":"assets/rc4/combat_candidates_v3/phil-punch-contact.png","recover":"assets/rc4/combat_candidates_v3/phil-punch-recovery.png","review":"assistant-delegated accepted batch3A"});
 register("phil","beam",{"prepare":"assets/rc4/combat_candidates_v3/phil-beam-prepare.png","action":"assets/rc4/combat_candidates_v3/phil-beam-action.png","contact":"assets/rc4/combat_candidates_v3/phil-beam-contact.png","recover":"assets/rc4/combat_candidates_v3/phil-beam-recovery.png","review":"assistant-delegated accepted batch3A"});
 register("legacy_importer","importer_shove",{"prepare":"assets/rc4/combat_candidates_v3/importer-shove-prepare.png","action":"assets/rc4/combat_candidates_v3/importer-shove-action.png","contact":"assets/rc4/combat_candidates_v3/importer-shove-contact.png","recover":"assets/rc4/combat_candidates_v3/importer-shove-recovery.png","review":"assistant-delegated accepted batch3A"});
 // Authored A20 day-three charged appearance; day-one sequences remain separate.
 register("phil@charging_day3","punch",{"prepare":"assets/rc4/combat_candidates_v4/phil-day3-punch-prepare.png","action":"assets/rc4/combat_candidates_v4/phil-day3-punch-action.png","contact":"assets/rc4/combat_candidates_v4/phil-day3-punch-contact.png","recover":"assets/rc4/combat_candidates_v4/phil-day3-punch-recovery.png","review":"assistant-delegated accepted Phil day3"});
 register("phil@charging_day3","beam",{"prepare":"assets/rc4/combat_candidates_v4/phil-day3-beam-prepare.png","action":"assets/rc4/combat_candidates_v4/phil-day3-beam-action.png","contact":"assets/rc4/combat_candidates_v4/phil-day3-beam-contact.png","recover":"assets/rc4/combat_candidates_v4/phil-day3-beam-recovery.png","review":"assistant-delegated accepted Phil day3"});
 // Named rave encounter only. Native LEFT assets are displayed without the canonical neutral's mirror.
 // Zero-based frame5 remains the sole mechanical contact at450ms; artist preview slot numbering is independent.
 const hiltBase='assets/rc5/hilt_v001/',hiltSrc=s=>hiltBase+s+'.png';
 // Additive metadata for these five new paths only; measured native contacts, unchanged image bytes.
 const hiltBounds={prepare:[23,31,46,56],aim:[13,24,53,61],release:[16,27,55,57],contact:[9,32,66,54],recovery:[21,28,44,62]};
 if(window.RAPresentationAssets)for(const [s,y] of [['prepare',87],['aim',84],['release',84],['contact',85],['recovery',90]]){
  const visible=hiltBounds[s];RAPresentationAssets[hiltSrc(s)]={width:80,height:96,anchor:[40,y],visible,face:[36,visible[1],16,14],faceSource:'estimated candidate pose',authority:'ASSISTANT REVIEWED CANDIDATE',support:{y,x1:28,x2:57,threshold:128}};
 }
 register('ogun_rave_hilt','bolt',{
  prepare:hiltSrc('prepare'),action:hiltSrc('release'),contact:hiltSrc('contact'),recover:hiltSrc('recovery'),
  frames:['prepare','prepare','aim','aim','release','contact','contact','recovery','recovery','recovery'].map(hiltSrc),
  native:Object.fromEntries([['prepare',87],['aim',84],['release',84],['contact',85],['recovery',90]].map(([s,y])=>[hiltSrc(s),{canvas:[80,96],contact:[40,y],facing:'left'}]))
 });
 // Player-feedback choreography, scoped to Gbenga and the native JDM encounter.
 // Drawn hard-pixel prop frames complement the retained, separately drawn body poses.
 const FEEDBACK={
  gbenga:{phone:{frames:12,ms:80,contact:6,body:'voice',quote:'HELLO HELLO RICH CAN YOU HEAR ME'},draco:{frames:16,ms:68,contact:5,body:'draco',quote:'scatta dem'}},
  legacy_importer:{importer_shove:{frames:12,ms:78,contact:6,body:'importer_shove',prop:'wheel'},importer_parts:{frames:12,ms:78,contact:6,body:'importer_shove',prop:'bumper'}}
 };
 function phonePixels(c,x,y,f){const {C,rect,line}=H(),w=58,h=100;
  rect(c,x-w/2-2,y-h/2,w+4,h,C.ink);rect(c,x-w/2,y-h/2+3,w,h-6,'#5b456d');rect(c,x-w/2+3,y-h/2+5,w-6,h-12,C.gold);
  rect(c,x-w/2+7,y-h/2+13,w-14,h-29,C.ink);rect(c,x-w/2+9,y-h/2+15,w-18,h-33,'#372742');
  rect(c,x-7,y-h/2+7,14,3,C.ink);rect(c,x-6,y+h/2-13,12,6,C.ink);rect(c,x-3,y+h/2-12,6,3,C.bone);
  // Handset and distinct ringing display beats, drawn into each frame.
  rect(c,x-13,y-18,7,23,C.bone);rect(c,x-9,y-17,9,5,C.bone);rect(c,x-9,y+1,9,5,C.bone);rect(c,x+7,y-16,4,20,C.gold);
  for(let i=0;i<3;i++)rect(c,x+5+i*5,y-22+i*5,2,4+(f+i)%3*3,C.gold);
  for(let i=0;i<3;i++)line(c,x-w/2+10+i*12,y+17,x-w/2+15+i*12,y+17+(f%2),i%2?C.gold:C.bone,2);
 }
 function wheelPixels(c,x,y,f,r=36){const {C,rect,line}=H();
  // Scanline tire/rim silhouette, alternating five-spoke orientation, no transformed static bitmap.
  for(let yy=-r;yy<=r;yy++){const xx=Math.floor(Math.sqrt(r*r-yy*yy));rect(c,x-xx,y+yy,xx*2+1,1,C.ink);if(Math.abs(yy)<r-5){const ii=Math.floor(Math.sqrt((r-5)*(r-5)-yy*yy));rect(c,x-ii,y+yy,ii*2+1,1,'#747180');}}
  for(let yy=-r+10;yy<=r-10;yy++){const rr=r-10,xx=Math.floor(Math.sqrt(rr*rr-yy*yy));rect(c,x-xx,y+yy,xx*2+1,1,'#282333');}
  for(let i=0;i<5;i++){const a=i*Math.PI*2/5+f*.48;line(c,x,y,x+Math.cos(a)*(r-7),y+Math.sin(a)*(r-7),C.ink,6);line(c,x,y,x+Math.cos(a)*(r-7),y+Math.sin(a)*(r-7),C.bone,3);}
  rect(c,x-5,y-5,11,11,C.ink);rect(c,x-3,y-3,7,7,C.gold);rect(c,x-1,y-1,3,3,C.bone);
  for(let i=0;i<8;i++){const a=i*Math.PI/4;rect(c,x+Math.cos(a)*(r-2),y+Math.sin(a)*(r-2),2,2,'#544658');}
 }
 function bumperPixels(c,x,y,f){const {C,rect,line}=H(),tilt=[-10,-12,-9,-5,1,6,0,7,12,14,14,14][f]||0;
  // Each scanline is authored at its travelling orientation; grille, lamps and plate stay readable.
  for(let xx=-43;xx<=43;xx++){const yy=Math.round(xx*tilt/86),edge=Math.abs(xx)>36?3:0;rect(c,x+xx,y+yy-12+edge,1,27-edge*2,C.ink);rect(c,x+xx,y+yy-9+edge,1,20-edge*2,'#9e7688');rect(c,x+xx,y+yy+8-edge,1,3,'#4e364e');}
  const sy=xx=>y+Math.round(xx*tilt/86);for(let i=0;i<9;i++)rect(c,x-22+i*5,sy(-22+i*5)-4,3,9,C.ink);
  for(const xx of [-34,28]){rect(c,x+xx,sy(xx)-6,9,7,C.ink);rect(c,x+xx+1,sy(xx)-5,7,4,C.bone);}
  rect(c,x-9,sy(0)+7,18,5,C.bone);rect(c,x-6,sy(0)+8,12,2,C.ink);line(c,x-36,sy(-36)+12,x+36,sy(36)+12,C.gold,1);
 }
 function feedbackPaint(c,f,a,t,plan,id){const {C,rect,line,star,ring}=H();
  // Ground shadows stay on the support plane, independent of flying prop height.
  if(id==='phone'){
   const x=t.x,cy=f<=6?lerp(-58,t.floor-51,Math.pow(f/6,2)):t.floor-51+(f===7?5:f===8?-3:0);
   if(f<9){for(let i=0;i<4;i++)rect(c,x-24-i*3,t.floor-2+i%2,48+i*6,2,i%2?'#312237':C.ink);phonePixels(c,x,cy,f);}
   if(f>=2&&f<6){for(let i=0;i<3;i++)line(c,x-21+i*21,cy-80-i*5,x-21+i*21,cy-58,C.gold,2);}
   if(f>=6){if(f<=8)star(c,x,t.y+10,[31,22,14][f-6],C.gold);for(let i=0;i<7;i++){const d=f-6;rect(c,x-30+i*10+(i%2?d*3:-d*3),t.floor-8-d*(i%3+2),3,3,i%2?C.bone:C.gold);}line(c,x-36-(f-6)*5,t.floor-1,x+36+(f-6)*5,t.floor-1,C.gold,2);}
  }else if(id==='draco'){
   const mx=a.x-a.w*.55,my=a.y-a.h*.28;
   if(f>=3&&f<=13){const phase=f-3;
    if(f%2){star(c,mx,my,8+(f%3)*2,C.gold);rect(c,mx-14,my-2,9,5,C.bone);}
    // Eight independently staggered pixel rounds: each has its own flight and hit frame.
    for(let i=0;i<8;i++){const k=f-(3+i),u=Math.min(1,k/2);if(k<0||k>3)continue;const yy=t.y+(i%3-1)*10;
     if(k<2){const x=lerp(mx,t.x+3,u),y=lerp(my,yy,u);rect(c,x-10,y-2,12,5,C.ink);rect(c,x-9,y-1,9,3,C.gold);rect(c,x-4,y-1,4,1,C.bone);line(c,x+4,y,x+12,y,C.gold,1);}
     else star(c,t.x+(i%2?5:-5),yy,k===2?13:7,i%2?C.gold:C.bone);
    }
    for(let i=0;i<3;i++)rect(c,a.x+8+i*5+phase*2,a.floor-14-(phase%4)*3+i*3,3,2,C.gold);
   }
   if(f>=12&&f<15)for(let i=0;i<5;i++)rect(c,t.x-16+i*8,t.floor-5-(15-f)*(i%2+1),2,3,i%2?C.gold:C.bone);
  }else{
   const u=Math.min(1,Math.max(0,(f-1)/5)),x=lerp(a.x-14,t.x+2,u),y=lerp(a.y-10,t.y+8,u)-Math.sin(u*Math.PI)*(plan.prop==='wheel'?36:48);
   if(f<=6){if(plan.prop==='wheel')wheelPixels(c,x,y,f);else bumperPixels(c,x,y,f);for(let i=1;i<=3;i++)line(c,x+30+i*6,y-i*3,x+38+i*6,y-i*3,C.gold,1);}
   if(f>=6){if(f<9)star(c,t.x,t.y+8,[30,23,15][f-6],plan.prop==='wheel'?C.bone:C.gold);
    const d=f-6;if(f>6&&f<10){if(plan.prop==='wheel')wheelPixels(c,t.x-4-d*10,t.floor-26+d*3,f);else bumperPixels(c,t.x-d*8,t.floor-13+d*4,f);}
    for(let i=0;i<6;i++)rect(c,t.x-24+i*9+(i%2?d*3:-d*4),t.floor-8-d*(i%3+2),3+i%2,3,i%2?C.bone:C.gold);ring(c,t.x,t.floor-3,9+d*5,C.gold);
   }
  }
 }
 async function feedbackAttack(spec){const {root,enemyId,moveId,attacker,target,onContact,onPose,freeze=null,isActive}=spec,plan=FEEDBACK[enemyId]?.[moveId],fx=H();if(!plan||!fx||!root?.isConnected)return 0;
  active.get(root)?.cancel();const V=fx.view(root,target,attacker),L=fx.layer(root,V,`enemy:${enemyId}:${moveId}`),a=V.enemy,t=V.rich;
  L.canvas.classList.add('rc2-enemy-fx');if(enemyId==='legacy_importer')L.canvas.style.zIndex='9';L.canvas.dataset.choreography='feedback';root.dataset.lastEnemyFx=`${enemyId}:${moveId}:feedback`;
  const sequence=TIMELINES[enemyId]?.[plan.body],original={src:attacker.getAttribute('src'),style:attacker.getAttribute('style'),targetStyle:target.getAttribute('style'),importerMove:attacker.dataset.importerMove};
  let contact=false,cancelled=false,timer=null,wake=null,bubble=null;const owns=()=>active.get(root)===owner;
  const restore=(el,style)=>{if(style===null)el.removeAttribute('style');else el.setAttribute('style',style);};
  const owner={cancel:()=>{if(cancelled)return;cancelled=true;clearTimeout(timer);wake?.();cleanup();}};
  const live=()=>!cancelled&&owns()&&root.isConnected&&attacker.isConnected&&target.isConnected&&isActive?.()!==false;
  function cleanup(){L.canvas.remove();bubble?.remove();root.removeEventListener('c2:close',owner.cancel);document.removeEventListener('ra:scene',sceneChanged);if(!owns())return;
   if(root.isConnected&&attacker.isConnected){if(original.src!==null)attacker.setAttribute('src',original.src);restore(attacker,original.style);if(original.src)onPose?.(original.src,null);}
   if(target.isConnected)restore(target,original.targetStyle);if(enemyId==='legacy_importer'){if(original.importerMove===undefined)delete attacker.dataset.importerMove;else attacker.dataset.importerMove=original.importerMove;}delete attacker.dataset.movePose;delete root.dataset.enemyPhase;active.delete(root);
  }
  const sceneChanged=()=>{if(isActive?.()===false||!root.isConnected)owner.cancel();};
  const pause=ms=>new Promise(resolve=>{wake=resolve;timer=setTimeout(()=>{wake=null;resolve();},ms);});
  const draw=f=>{if(!live())return false;L.ctx.clearRect(0,0,270,V.H);feedbackPaint(L.ctx,f,a,t,plan,moveId);L.canvas.dataset.frame=String(f);
   const phase=f<2?'prepare':f<plan.contact?'action':f<plan.frames-3?'contact':'recover',src=sequence?.[phase];
   if(src){if(attacker.tagName==='IMG')attacker.src=src;else{attacker.style.backgroundImage=`url('${src}')`;if(enemyId==='legacy_importer')attacker.dataset.importerMove=phase;}attacker.dataset.movePose=src;onPose?.(src,sequence.native?.[src]);}
   root.dataset.enemyPhase=f<2?'anticipation':f<plan.contact?'action':f<plan.frames-3?'impact':'recovery';
   if(f>=plan.contact&&!contact){contact=true;onContact?.();}
   if(!reduced()&&f>=plan.contact&&f<=plan.contact+2){const probe=document.createElement('div');if(original.targetStyle)probe.setAttribute('style',original.targetStyle);target.style.transform=`translate(${-7+(f-plan.contact)*3}px,${f===plan.contact?4:0}px) ${probe.style.transform||''}`;}
   else restore(target,original.targetStyle);return true;
  };
  active.set(root,owner);root.addEventListener('c2:close',owner.cancel,{once:true});document.addEventListener('ra:scene',sceneChanged);
  try{if(plan.quote){root.dataset.combatQuote=plan.quote;bubble=window.RABarks?.show({root,anchor:{x:V.world.x+a.x*V.S,y:V.world.y+(a.y-a.h*.35)*V.S},text:plan.quote,speaker:'enemy',hold:plan.frames*plan.ms+160});}
   if(freeze!==null){if(draw(freeze))await pause(700);return live()?700:0;}
   if(reduced()){if(draw(plan.contact))await pause(220);return live()?220:0;}
   for(let f=0;f<plan.frames;f++){if(!draw(f))break;await pause(plan.ms);}return live()?plan.frames*plan.ms:0;
  }finally{clearTimeout(timer);cleanup();}
 }

 register("gbenga","phone",TIMELINES.gbenga.voice);
 const active=new WeakMap();
 // attack({root,enemyId,moveId,dmg,attacker:enemyEl,target:richEl}) -> resolves when the animation ends (<= ~650 ms).
 async function attack({root,enemyId,moveId,dmg=0,attacker,target,freeze=null,onContact=null,onPose=null,appearance=null}){
  if(FEEDBACK[enemyId]?.[moveId])return feedbackAttack({root,enemyId,moveId,attacker,target,onContact,onPose,freeze,appearance});
  const fx=H();if(!fx||!root||!root.isConnected||!attacker||!target)return 0;
  // One owner per stage. Finish the old owner's cleanup before taking its pose snapshot.
  active.get(root)?.cancel();
  const sp=specFor(enemyId,moveId,dmg),paint=PAINT[sp.s];if(!paint)return 0;
  let V,L;try{V=fx.view(root,target,attacker);L=fx.layer(root,V,`enemy:${enemyId}:${moveId}`);}catch(e){return 0;}
  // fx.view(root,attacker,target) names rich as "attacker"; here the enemy attacks, so anchors are: enemy=V.enemy, rich=V.rich.
  const a=V.enemy,t=V.rich;L.canvas.classList.add('rc2-enemy-fx');root.dataset.lastEnemyFx=`${enemyId}:${moveId}:${sp.s}`;
 const opts={...sp,hits:sp.hits},original=attacker.getAttribute('src');
 const sequence=TIMELINES[appearance?`${enemyId}@${appearance}`:enemyId]?.[moveId],originalStyle=attacker.getAttribute('style');
 const savedTransform=sequence?.native?attacker.style.transform:null,nativeScale=sequence?.native?attacker.getBoundingClientRect().height/96:0;
 const savedTop=sequence?.native?(parseFloat(attacker.style.top)||0)-(sequence.native[original]?(88-sequence.native[original].contact[1])*nativeScale:0):0;
  let contact=false,cancelled=false,timer=null,wake=null;
  const owner={cancel:()=>{if(cancelled)return;cancelled=true;clearTimeout(timer);wake?.();cleanup();}};
  const owns=()=>active.get(root)===owner;
  function cleanup(){
   L.canvas.remove();root.removeEventListener('c2:close',owner.cancel);
   if(!owns())return;
   // A closed stage cannot restore over the next fight's identity or schedule a new effect.
  if(root.isConnected&&attacker.isConnected&&original&&attacker.tagName==='IMG'){attacker.src=original;if(sequence?.native){if(originalStyle==null)attacker.removeAttribute('style');else attacker.setAttribute('style',originalStyle);onPose?.(original,sequence.native[original]);}}
   delete attacker.dataset.movePose;delete root.dataset.enemyPhase;active.delete(root);
  }
  const pause=ms=>new Promise(resolve=>{wake=resolve;timer=setTimeout(()=>{wake=null;resolve();},ms);});
  const draw=f=>{
   if(cancelled||!owns()||!root.isConnected||!attacker.isConnected||!target.isConnected)return false;
   L.ctx.clearRect(0,0,270,V.H);paint(L.ctx,f,a,t,opts);L.canvas.dataset.frame=String(f);
   const pose=poseFor(enemyId,moveId,f,appearance);
  if(pose&&attacker.tagName==='IMG'){attacker.src=pose;attacker.dataset.movePose=pose;
   const meta=sequence?.native?.[pose];if(meta){if(onPose)onPose(pose,meta);else{attacker.style.transform=meta.facing==='left'?'none':savedTransform;attacker.style.top=(savedTop+(88-meta.contact[1])*nativeScale)+'px';}}
  }
   else if(f>=7&&original&&attacker.tagName==='IMG'){attacker.src=original;delete attacker.dataset.movePose;}
   root.dataset.enemyPhase=f<2?'anticipation':f<5?'action':f<(TIMELINES[appearance?`${enemyId}@${appearance}`:enemyId]?.[moveId]?8:7)?'impact':'recovery';
   if(f>=5&&!contact){contact=true;onContact?.();}return true;
  };
  active.set(root,owner);root.addEventListener('c2:close',owner.cancel,{once:true});
  try{
   if(freeze!==null){if(draw(freeze))await pause(700);return cancelled?0:700;}
   if(reduced()){if(draw(6))await pause(220);return cancelled?0:220;}
   for(let f=0;f<FRAMES;f++){if(!draw(f))break;await pause(FRAME_MS);}
   return cancelled?0:FRAMES*FRAME_MS;
  }finally{clearTimeout(timer);cleanup();}
 }
 window.RAEnemyFX={attack,cancel:root=>active.get(root)?.cancel(),register,preload,TIMELINES,specFor,poseFor,POSES,GBENGA,MAP,PAINT,SPRITES,FRAMES,FRAME_MS,FEEDBACK,feedbackAttack,feedbackPaint};
})();
