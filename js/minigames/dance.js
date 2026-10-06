// DANCE FLOOR — falling-moves rhythm game (RC2 B3). Moves fall from the sky; tap the matching move when it
// hits the glowing zone. Four moves, one tap each, no holds, nobody gets hurt. Guitar Hero, but make it an owambe.
// Registers RAMinigames 'dance' and exposes pure logic at window.RAMinigameLogic.dance.
(function(){
 'use strict';
 const MOVES=[
  {id:'up',label:'HANDS UP',color:'#ff6fb5',key:['ArrowLeft','a','1']},
  {id:'spin',label:'SPIN',color:'#3d9ddd',key:['ArrowDown','s','2']},
  {id:'shake',label:'SHAKE',color:'#20c66b',key:['ArrowUp','d','3']},
  {id:'dip',label:'DIP',color:'#c18b3c',key:['ArrowRight','f','4']}
 ];
 // Hard-pixel poses on a 16x16 grid: [x,y,w,h]. Head + torso + legs are shared; arms/legs/accents are per move.
 const BODY=[[6,3,4,3],[6,6,4,5],[6,11,2,4],[8,11,2,4]];
 const POSES={
  up:{body:BODY,extra:[[5,6,1,1],[4,5,1,1],[3,4,1,1],[3,2,1,2],[10,6,1,1],[11,5,1,1],[12,4,1,1],[12,2,1,2]]},
  spin:{body:[[6,2,4,3],[6,5,4,5],[6,10,2,4],[8,10,2,4],[9,13,3,1]],extra:[[1,6,5,1],[10,6,5,1],[1,3,2,1],[13,10,2,1]]},
  shake:{body:BODY,extra:[[4,6,1,3],[3,8,1,1],[11,6,1,3],[12,8,1,1],[2,5,1,1],[1,6,1,1],[13,5,1,1],[14,6,1,1]]},
  dip:{body:[[6,7,4,3],[5,10,6,3],[3,13,3,2],[10,13,3,2],[2,15,2,1],[12,15,2,1]],extra:[[3,10,2,1],[11,10,2,1]]}
 };
 const DEFAULTS={firstMs:700,bpm:92,notes:32,fallMs:1900,leadMs:2600,perfectMs:120,goodMs:240,winAccuracy:.55,moodStart:55,moodPerfect:4,moodGood:2,moodMiss:-6,
  payPerPerfect:3,payPerGood:1,payCap:100};
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 // ---------- pure logic ----------
 function config(over={}){const c={...DEFAULTS};for(const k of Object.keys(DEFAULTS)){const v=Number(over[k]);if(Number.isFinite(v)&&over[k]!==null&&over[k]!=='')c[k]=v;}return c;}
 function makeChart(seed='dance',over={}){
  const cfg=config(over),rng=window.RAPixel?window.RAPixel.rng(String(seed)):(()=>{let s=7;return()=>{s=(s*9301+49297)%233280;return s/233280;};})();
  const beat=60000/cfg.bpm,notes=[];let last=-1,run=0,beatIx=0;
  for(let i=0;i<cfg.notes;i++){
   // teach in three steps: HANDS UP + SPIN only, then three moves, then all four
   const lanes=i<6?2:i<14?3:4;let lane=Math.floor(rng()*lanes);
   if(i===0)lane=0;if(i===1)lane=0;if(i===2)lane=1;
   if(lane===last&&run>=2)lane=(lane+1+Math.floor(rng()*(lanes-1)))%lanes;
   run=lane===last?run+1:1;last=lane;
   // mostly every beat; a rest now and then so nobody gets tired
   beatIx+=i>=10&&rng()<.18?2:1;
   notes.push({t:Math.round(cfg.firstMs+beatIx*beat),lane,hit:false,judged:null});
  }
  return notes;
 }
 function judge(dtMs,cfg=DEFAULTS){const a=Math.abs(dtMs);return a<=cfg.perfectMs?'perfect':a<=cfg.goodMs?'good':null;}
 function moodDelta(kind,cfg=DEFAULTS){return kind==='perfect'?cfg.moodPerfect:kind==='good'?cfg.moodGood:cfg.moodMiss;}
 function summarize(stats,cfg=DEFAULTS,{spray=false}={}){
  const total=Math.max(1,stats.perfect+stats.good+stats.miss),acc=(stats.perfect+stats.good)/total;
  const win=acc>=cfg.winAccuracy&&stats.mood>0;
  const money=spray?Math.min(cfg.payCap,stats.perfect*cfg.payPerPerfect+stats.good*cfg.payPerGood):0;
  return {accuracy:acc,win,outcome:win?'win':'lose',money,stars:acc>=.9?3:acc>=.75?2:acc>=cfg.winAccuracy?1:0};
 }
 // nearest un-judged note in a lane within the GOOD window (taps never pick far-away notes)
 function pickNote(notes,lane,songMs,cfg=DEFAULTS){let best=null,bd=1e9;for(const n of notes){if(n.judged||n.lane!==lane)continue;const d=Math.abs(n.t-songMs);if(d<=cfg.goodMs&&d<bd){best=n;bd=d;}}return best;}
 function memoriesFor(result){return result.win?[result.money>0?'danced. they sprayed me':'danced']:[];}
 window.RAMinigameLogic=window.RAMinigameLogic||{};
 window.RAMinigameLogic.dance={MOVES,DEFAULTS,config,makeChart,judge,moodDelta,summarize,pickNote,memoriesFor};

 // ---------- drawing ----------
 function drawPose(g,P,pose,x,y,u,color,shade='#10101b'){
  const p=POSES[pose];if(!p)return;
  [...p.body,...p.extra].forEach(([rx,ry,rw,rh],i)=>P.rect(g,x+rx*u,y+ry*u,rw*u,rh*u,i===0?'#6a4028':color));
  // shades + accent so it reads as Rich, not a mannequin
  const head=p.body[0];P.rect(g,x+head[0]*u,y+(head[1]+1)*u,head[2]*u,Math.max(1,u),shade);
 }
 function mount(root,ctx){
  const P=window.RAPixel,params=ctx.params||{};
  if(!P||!root)return {dispose(){}};
  const cfg=config(params),spray=!!params.spray,seed=params.seed||`dance-${params.song||'owambe'}-${params.day||1}`;
  // The rave's original kick/hat pulse is aligned to chart timestamps, not a licensed track or radio tempo.
  let beatAudio=null,beatIndex=-1;
  function raveBeat(index){
   if(!params.rave||index<0||index===beatIndex)return;beatIndex=index;
   const settings=window.RAState?.get?.()?.life?.settings?.audio||{};if(settings.muted||settings.sfx===0)return;
   const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
   try{beatAudio=beatAudio||new AC();if(beatAudio.state==='suspended')beatAudio.resume().catch(()=>{});
    const n=beatAudio.currentTime,o=beatAudio.createOscillator(),v=beatAudio.createGain();o.type=index%2?'triangle':'sine';o.frequency.setValueAtTime(index%2?1800:95,n);o.frequency.exponentialRampToValueAtTime(index%2?600:38,n+.12);
    v.gain.setValueAtTime((index%2?.025:.13)*(settings.sfx??1),n);v.gain.exponentialRampToValueAtTime(.001,n+.14);o.connect(v);v.connect(beatAudio.destination);o.start(n);o.stop(n+.15);
   }catch(_){/* audio unavailable: visual beat stays fully playable */}
  }
  const {canvas,ctx:g,toNative}=P.createCanvas(root);
  const approvedRich=P.personSprite?.('rich');
  const poseSprites=Object.fromEntries(MOVES.map(m=>[m.id,Object.assign(new Image(),{src:`assets/rc4/minigame_candidates_v1/dance/${m.id}.png`})]));
  const approvedRave=new Image();approvedRave.src='assets/ogun_rave/masters/rave_interior_270x480.png';
  const J=window.RAJuice?window.RAJuice.create(g):{burst(){},float(){},ring(){},shake(){},flash(){},update(){},begin(){g.save();},end(){g.restore();}};
  root.dataset.phase='ready';root.dataset.input='pointer';
  const notes=makeChart(seed,params);
  const LANE_W=64,LANE_X=7,ZONE_Y=352,SPAWN_Y=182,TILE_H=30;
  const stats={perfect:0,good:0,miss:0,combo:0,maxCombo:0,mood:cfg.moodStart};
  const pressFlash=[0,0,0,0];let lastPose='up',poseUntil=0,rivalPose='up',rivalAt=0,lastTapMs=-Infinity,timingText='FOLLOW THE GOLD LINE',timingUntil=0;
  let songMs=-cfg.leadMs,raf=null,last=performance.now(),ended=false,countSounded=-1;
  const endMs=notes.length?notes[notes.length-1].t+1400:2000;
  let spent=0;
  const laneOf=x=>clamp(Math.floor((x-LANE_X)/LANE_W),0,3);
  function press(lane){
   if(ended||songMs<0||songMs-lastTapMs<75)return;lastTapMs=songMs;
   pressFlash[lane]=1;lastPose=MOVES[lane].id;poseUntil=songMs+480;
   const n=pickNote(notes,lane,songMs,cfg);
   if(!n){const next=notes.find(n=>!n.judged&&n.lane===lane);timingText=next&&next.t>songMs?'EARLY · WAIT FOR THE LINE':'NO NOTE · FOLLOW THE CHART';timingUntil=songMs+550;J.float('EARLY',LANE_X+lane*LANE_W+LANE_W/2,ZONE_Y-25,{color:'#b9a9c9',size:6,life:.45,rise:8});return;}
   const kind=judge(n.t-songMs,cfg);n.judged=kind;timingText=kind==='perfect'?'PERFECT · ON THE BEAT':n.t>songMs?'GOOD · A LITTLE EARLY':'GOOD · A LITTLE LATE';timingUntil=songMs+550;
   stats[kind]++;stats.combo++;stats.maxCombo=Math.max(stats.maxCombo,stats.combo);
   stats.mood=clamp(stats.mood+moodDelta(kind,cfg),0,100);
   const cx=LANE_X+lane*LANE_W+LANE_W/2,col=MOVES[lane].color;
   if(kind==='perfect'){ctx.audio?.sound(stats.combo%5===0?'COMBO_UP':'TIP_COINS');J.burst(cx,ZONE_Y,[col,'#f6efd9','#ffd36a'],16,95);J.ring(cx,ZONE_Y,col);J.float('PERFECT',cx,ZONE_Y-26,{color:'#ffd36a',size:7});J.shake(1.5);}
   else{ctx.audio?.sound('UI_TAP');J.burst(cx,ZONE_Y,[col,'#f6efd9'],8,60);J.float('GOOD',cx,ZONE_Y-26,{color:'#f6efd9',size:6});}
   if(spray){const pay=Math.min(Math.max(0,cfg.payCap-spent),kind==='perfect'?cfg.payPerPerfect:cfg.payPerGood);if(spent<cfg.payCap){spent+=pay;J.float(`+$${pay}`,cx,ZONE_Y-44,{color:'#20c66b',size:6,life:1.1,rise:40});}}
   if(stats.combo>0&&stats.combo%8===0){J.flash(col,140);J.float(`${stats.combo} IN A ROW!`,135,210,{color:'#ff6fb5',size:8,life:1.1});ctx.audio?.sound('CROWD_CHEER_SMALL');}
   if(stats.mood>=100&&!stats.hype){stats.hype=true;J.float('THE ROOM IS YOURS',135,190,{color:'#ffd36a',size:8,life:1.4});}
  }
  function miss(n){
   n.judged='miss';timingText='MISSED · MATCH THE NEXT NOTE';timingUntil=songMs+550;stats.miss++;stats.combo=0;stats.mood=clamp(stats.mood+moodDelta('miss',cfg),0,100);
   const cx=LANE_X+n.lane*LANE_W+LANE_W/2;J.float('OOPS',cx,ZONE_Y+22,{color:'#d7193f',size:6,life:.6,rise:10});ctx.audio?.sound('MISS');J.shake(1);
  }
  function pointerDown(ev){
   const p=toNative(ev.clientX,ev.clientY);
   if(p.y<ZONE_Y-TILE_H||p.y>452||p.x<LANE_X||p.x>LANE_X+LANE_W*4)return;ev.preventDefault();
   press(laneOf(p.x));
  }
  const keyMap=new Map();MOVES.forEach((m,i)=>m.key.forEach(k=>keyMap.set(k.toLowerCase(),i)));
  function keyDown(ev){if(ev.repeat)return;const i=keyMap.get(String(ev.key).toLowerCase());if(i!==undefined){ev.preventDefault();press(i);}}
  canvas.addEventListener('pointerdown',pointerDown);window.addEventListener('keydown',keyDown);
  function finish(){
   if(ended)return;ended=true;root.dataset.phase='results';
   const sum=summarize(stats,cfg,{spray});root.dataset.outcome=sum.outcome;
   if(sum.money)ctx.reward({money:sum.money});
   ctx.reward({clout:sum.win?3:0,memories:memoriesFor(sum)});
   const best=Math.max(ctx.progress()?.bestAccuracy||0,sum.accuracy);ctx.saveProgress({bestAccuracy:best,bestCombo:Math.max(ctx.progress()?.bestCombo||0,stats.maxCombo)});
   const card=document.createElement('div');card.className='dance-result';
   card.style.cssText='position:absolute;inset:0;z-index:6;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:22px;background:rgba(8,7,15,.93);color:#f6efd9;text-align:center;font-family:"Press Start 2P",monospace';
   const headline=params.rave?(sum.win?'YOU BLENDED IN':'THE CROWD CLOCKED YOU'):sum.stars>=3?'THE ROOM LOST IT':sum.win?'THE CROWD LOVED IT':stats.mood<=0?'THE CROWD LEFT':'THE CROWD PRAYED FOR YOU';
   // Rave shares the readable result card; CONTINUE advances the existing phase only after acknowledgement.
   card.innerHTML=`<div style="font-size:11px;color:${sum.win?'#ffd36a':'#d7193f'};line-height:1.5">${headline}</div><div style="font-size:8px;color:#ffd36a">${'★'.repeat(sum.stars)}${'☆'.repeat(3-sum.stars)}</div><div style="font-size:7px;line-height:1.8">PERFECT ${stats.perfect} · GOOD ${stats.good} · OOPS ${stats.miss}<br>BEST STREAK ${stats.maxCombo}<br>MATCHED ${Math.round(sum.accuracy*100)}% · NEED ${Math.round(cfg.winAccuracy*100)}%</div>${spray?`<div style="font-size:8px;color:#20c66b">SPRAYED $${sum.money}</div>`:''}`;
   const done=document.createElement('button');done.type='button';done.className='dance-done';done.textContent=params.rave?'CONTINUE RAVE':'DONE';
   done.style.cssText='font:8px "Press Start 2P",monospace;padding:.8em 1.1em;background:#f6efd9;color:#10101b;border:2px solid #10101b;box-shadow:2px 2px #7d194b;cursor:pointer';
   done.addEventListener('click',()=>ctx.finish({outcome:sum.outcome,score:stats.perfect*2+stats.good,summary:headline.toLowerCase(),data:{...stats,...sum,spray}}));
   card.append(done);root.append(card);
   ctx.audio?.sound(sum.win?'VICTORY':'CROWD_OOH');
  }
  function drawBg(now){
   P.paintEnvironment(g,{sky:'#170d27',wall:'#4d214b',floor:'#3d302d',horizon:150,seed:'dance-floor',props:[{type:'string',x1:8,x2:262,y:40,color:'#ffd36a'},{type:'sign',x:48,y:52,w:174,h:18,text:params.rival?`VS ${params.rival}`:'DANCE FLOOR',glow:'#ffb040',size:6}],crowd:16,crowdColors:['#9d4a5a','#4a6a9d','#6a9d4a','#9d8a4a']});
   if(params.rave&&approvedRave.complete&&approvedRave.naturalWidth){g.imageSmoothingEnabled=false;g.drawImage(approvedRave,0,0,270,480);g.fillStyle='#08070f88';g.fillRect(0,0,270,480);}
   const beat=60000/cfg.bpm,pulse=songMs>0?1-((songMs%beat)/beat):0;
   if(params.rave){P.rect(g,0,0,270,54,'#170811');P.text(g,"OGUN'S BLOOD RAVE",135,40,{size:8,color:'#ff6fb5',align:'center'});for(let i=0;i<36;i++){const x=(i*43)%270,y=((i*61+Math.floor(Math.max(0,songMs)/15))%146);P.rect(g,x,y,2,5,'#9c173f');}P.rect(g,4,148,262,3,pulse>.75?'#ffd36a':'#7d194b');}
   // the floor under the lanes: dark lanes, bright zone that pulses on the beat
   for(let i=0;i<4;i++){g.fillStyle=i%2?'rgba(8,7,15,.62)':'rgba(8,7,15,.74)';g.fillRect(LANE_X+i*LANE_W,SPAWN_Y-6,LANE_W,ZONE_Y+40-SPAWN_Y+6);}
   g.fillStyle=`rgba(255,211,106,${.18+.18*pulse})`;g.fillRect(LANE_X,ZONE_Y-TILE_H/2-4,LANE_W*4,TILE_H+8);
   P.rect(g,LANE_X,ZONE_Y-TILE_H/2-4,LANE_W*4,2,'#ffd36a');P.rect(g,LANE_X,ZONE_Y+TILE_H/2+2,LANE_W*4,2,'#ffd36a');
   P.text(g,'TAP HERE',135,ZONE_Y-TILE_H/2-14,{size:6,color:'#ffd36a',align:'center'});
  }
  function drawTile(n){
   const prog=(songMs-(n.t-cfg.fallMs))/cfg.fallMs;if(prog<0||prog>1.25)return;
   const y=SPAWN_Y+(ZONE_Y-SPAWN_Y)*prog,x=LANE_X+n.lane*LANE_W+6,w=LANE_W-12,m=MOVES[n.lane];
   if(n.judged&&n.judged!=='miss')return;
   g.globalAlpha=n.judged==='miss'?.35:1;
   P.rect(g,x+2,y-TILE_H/2+2,w,TILE_H,'#10101b');P.rect(g,x,y-TILE_H/2,w,TILE_H,m.color);P.rect(g,x+2,y-TILE_H/2+2,w-4,TILE_H-4,'#f6efd9');
   drawArrow(m.id,x+w/2,y,2,m.color);
   g.globalAlpha=1;
  }
  function drawButtons(){
   for(let i=0;i<4;i++){const m=MOVES[i],x=LANE_X+i*LANE_W+3,y=388,w=LANE_W-6,h=58,f=pressFlash[i];
    P.rect(g,x+2,y+2,w,h,'#10101b');P.rect(g,x,y,w,h,f>.2?'#f6efd9':m.color);P.rect(g,x+3,y+3,w-6,h-6,f>.2?m.color:'#1e1a2a');
    drawArrow(m.id,x+w/2,y+22,2,f>.2?'#10101b':m.color);
    P.text(g,['A / ←','S / ↓','D / ↑','F / →'][i],x+w/2,y+h+10,{size:5,color:'#b9a9c9',align:'center'});
    P.text(g,m.label,x+w/2,y+h-9,{size:5,color:f>.2?'#10101b':'#f6efd9',align:'center'});}
  }
  function drawArrow(id,x,y,u,color){
   const points=[[0,-6],[0,-4],[0,-2],[0,0],[0,2],[0,4],[0,6],[-2,-4],[-4,-2],[2,-4],[4,-2]];
   g.save();g.translate(Math.round(x),Math.round(y));g.rotate(({up:-Math.PI/2,spin:Math.PI,shake:0,dip:Math.PI/2})[id]);for(const [a,b] of points)P.rect(g,a*u-u/2,b*u-u/2,u,u,color);g.restore();
  }
  function drawDancer(now){
   const beat=60000/cfg.bpm,bob=songMs>0&&Math.floor(songMs/(beat/2))%2?2:0,active=songMs<poseUntil;
   const sprite=active&&poseSprites[lastPose]?.complete&&poseSprites[lastPose].naturalWidth?poseSprites[lastPose]:approvedRich;
   P.rect(g,78,50,114,122,'#ffd36a18');P.rect(g,98,166,74,3,'#08070f88');
   if(sprite?.complete&&sprite.naturalWidth){g.save();g.imageSmoothingEnabled=false;g.translate(135,166-bob);g.drawImage(sprite,-80,-176,160,192);g.restore();root.dataset.pose=active?lastPose:'neutral';root.dataset.poseArt=sprite===approvedRich?'reference':'candidate';}
   if(params.rival){drawPose(g,P,active?lastPose:'dip',28,114+bob,3,'#e0b040');P.text(g,'UNCLE',44,170,{size:5,color:'#e0b040',align:'center'});}
   if(spray&&stats.perfect>0){for(let i=0;i<Math.min(6,stats.perfect);i++){const bx=104+((i*37+Math.floor(songMs/90))%60),by=70+((i*23+Math.floor(songMs/60))%70);P.rect(g,bx,by,6,3,'#20c66b');}}
  }
  function drawHud(){
   P.text(g,`STREAK ${stats.combo}`,8,8,{size:6,color:'#f6efd9'});P.text(g,`${Math.min(notes.length,stats.perfect+stats.good+stats.miss)}/${notes.length}`,194,8,{size:6,color:'#ffd36a'});
   P.text(g,songMs<timingUntil?timingText:'MATCH THE ARROW AT THE GOLD LINE',135,376,{size:5,color:'#ffd36a',align:'center'});
   P.text(g,params.rave?'BLEND':'CROWD',8,22,{size:5,color:'#f6efd9'});P.rect(g,44,20,150,8,'#21182c');P.rect(g,45,21,148*(stats.mood/100),6,stats.mood<25?'#d7193f':stats.mood>75?'#20c66b':'#c18b3c');
   if(spray)P.text(g,`$${Math.min(cfg.payCap,spent)}`,200,22,{size:6,color:'#20c66b'});
  }
  function frame(now){
   if(raf===null)return;
   const dt=(now-last)/1000;last=now;J.update(dt);
   if(!ended){
    songMs+= Math.min(50,dt*1000);
    raveBeat(Math.floor((songMs-cfg.firstMs)/(60000/cfg.bpm/2)));
    for(const n of notes)if(!n.judged&&songMs>n.t+cfg.goodMs)miss(n);
    const sec=Math.ceil(-songMs/1000);if(songMs<0&&sec>0&&sec<=3&&sec!==countSounded){countSounded=sec;ctx.audio?.sound('COUNTDOWN');}
    if(songMs>=0)root.dataset.phase='run';
    if(stats.mood<=0||songMs>endMs)finish();
    if(raf===null)return; // rave completion disposes immediately; never resurrect its animation loop
   }
   for(let i=0;i<4;i++)pressFlash[i]=Math.max(0,pressFlash[i]-dt*5);
   root.dataset.due=notes.filter(n=>!n.judged&&Math.abs(n.t-songMs)<=cfg.goodMs).map(n=>n.lane).join(',');
   root.dataset.streak=String(stats.combo);root.dataset.perfect=String(stats.perfect);root.dataset.good=String(stats.good);root.dataset.miss=String(stats.miss);
   g.clearRect(0,0,270,480);J.begin();drawBg(now);drawDancer(now);for(const n of notes)drawTile(n);drawButtons();drawHud();
   if(songMs<0)P.text(g,songMs<-1600?'GET READY':String(Math.ceil(-songMs/1000)),135,250,{size:12,color:'#ffd36a',align:'center'});
   J.end();
   raf=requestAnimationFrame(frame);
  }
  raf=requestAnimationFrame(frame);
  return {dispose(){const r=raf;raf=null;if(r)cancelAnimationFrame(r);if(beatAudio)beatAudio.close().catch(()=>{});canvas.removeEventListener('pointerdown',pointerDown);window.removeEventListener('keydown',keyDown);}};
 }
 window.RAMinigames.register('dance',{title:'DANCE FLOOR',rule:'Match arrows at the gold line with the pads, A S D F or left/down/up/right; keep blend above zero.',ruleFor:p=>`Match arrows at the gold line with the pads or A S D F; hit ${Math.round(config(p).winAccuracy*100)}% and keep blend above zero.`,mount});
})();
