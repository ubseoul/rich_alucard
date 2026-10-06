(function(){
 // JOLLOF WARS — cooking minigame, four skill stages: BASE, FRY, SEASON, STEAM.
 const P=()=>window.RAPixel,palette=()=>P().palette;

 // ---------- pure logic (also exported for tests) ----------
 const JUDGES={
  nneka:{name:'NNEKA',weights:{flavor:.4,texture:.15,color:.35,smoke:.1},pref:{thyme:.4,curry:.9,bayleaf:.3,salt:.5,cubes:.6},dialogue:'"Color tells me everything before I taste it. Don\'t lie to me with red oil."',reactions:{hi:'"Now THAT is jollof."',mid:'"...it will do."',lo:'"This is an insult to my ancestors."'}},
  uncle_sunday:{name:'UNCLE SUNDAY',weights:{flavor:.25,texture:.15,color:.1,smoke:.5},pref:{thyme:.7,curry:.5,bayleaf:.6,salt:.4,cubes:.5},dialogue:'"Where is the bottom-pot? A party rice with no smoke is not a party."',reactions:{hi:'*wipes eye* "...my father used to make it like this."',mid:'"Good. Not great. Good."',lo:'"No smoke, no soul, my brother."'}},
  bunmi:{name:'BUNMI',weights:{flavor:.25,texture:.45,color:.1,smoke:.2},pref:{thyme:.5,curry:.4,bayleaf:.4,salt:.6,cubes:.4},dialogue:'"I just want the grains to stand up straight. Is that too much to ask?"',reactions:{hi:'"Every grain separate. Respect."',mid:'"Little mushy, but I ate it."',lo:'"This is porridge, not jollof."'}},
  mom:{name:'MOM (VIDEO CALL)',weights:{flavor:.3,texture:.3,color:.2,smoke:.2},pref:{thyme:.8,curry:.5,bayleaf:.7,salt:.4,cubes:.3},cap:.9,dialogue:'"Show me the pot. No, tilt it. ...hm."',reactions:{hi:'"It\'s good, oh. Not like mine. But good."',mid:'"You tried. Call your aunty for the real recipe."',lo:'"Ah ah. Come home, let me teach you again."'}},
  lil_smack:{name:'LIL SMACK',weights:{flavor:.25,texture:.25,color:.25,smoke:.25},pref:{thyme:.5,curry:.5,bayleaf:.5,salt:.5,cubes:.5},meaningless:true,dialogue:'*already has a spoon in his mouth*',reactions:{hi:'*mouth full* "s\'good."',mid:'*chewing loud* "mid ngl."',lo:'*spits a little* "bro what."'}}
 };
 const clamp=(v,a=1,b=10)=>Math.max(a,Math.min(b,v));
 function blendQuality(level){
  level=Math.max(0,Math.min(1,level));
  if(level<.3)return {texture:'chunky',textureScore:4,tag:'chunky — you rushed it'};
  if(level>.78)return {texture:'watery',textureScore:3,tag:'sad and watery — too far'};
  return {texture:'smooth',textureScore:9,tag:'smooth base — green zone'};
 }
 function fryResult(darkness,stoppedAtSheen){
  darkness=Math.max(0,Math.min(1,darkness));
  if(darkness<.35)return {flavor:3,color:4,tag:'raw tomato — pulled too soon'};
  if(darkness>.92)return {flavor:4,color:3,tag:'bitter — burnt the paste'};
  if(stoppedAtSheen)return {flavor:9,color:9,tag:'oil floats — the secret is safe with you'};
  return {flavor:6,color:6,tag:'decent, not legendary'};
 }
 function steamResult(t,crust){
  t=Math.max(0,Math.min(1,t));
  if(t<.35)return {textureAdj:-3,smoke:1,tag:'undercooked — still crunchy'};
  if(t>.93)return {textureAdj:crust?-1:-3,smoke:crust?9:4,tag:crust?'burnt bottom — party rice crust':'burnt through, no glory in it'};
  return {textureAdj:2,smoke:crust?8:2,tag:crust?'perfect, with a bonus crust':'perfect steam'};
 }
 function seasonMatch(season,pref){
  const keys=['thyme','curry','bayleaf','salt','cubes'];let dev=0;
  for(const k of keys)dev+=Math.abs((season[k]||0)-(pref[k]||0));
  return Math.max(0,1-dev/keys.length);
 }
 function scoreDish(stages,judgeId){
  const judge=JUDGES[judgeId]||JUDGES.bunmi;
  const blend=blendQuality(stages.blend||0);
  const fry=fryResult(stages.fry?.darkness||0,!!stages.fry?.stoppedAtSheen);
  const steam=steamResult(stages.steam?.liftTime||0,!!stages.steam?.crust);
  const texture=clamp(blend.textureScore+steam.textureAdj);
  const color=clamp(fry.color);
  const smoke=clamp(steam.smoke);
  let flavor;
  if(stages.season?.dragon)flavor=10;
  else{
   const match=seasonMatch(stages.season||{},judge.pref);
   flavor=clamp(Math.round(fry.flavor*.5+match*10*.5));
  }
  let total=flavor+texture+color+smoke;
  if(judge.cap)total=Math.min(total,Math.round(40*judge.cap));
  const tier=total>=32?'hi':total>=22?'mid':'lo';
  return {flavor,texture,color,smoke,total,reaction:judge.reactions[tier],meaningless:!!judge.meaningless};
 }
 function total(stages,judgeIds){
  const ids=(judgeIds&&judgeIds.length?judgeIds:['nneka','uncle_sunday','bunmi']);
  const judgeScores={};let sum=0,f=0,t=0,c=0,s=0;
  for(const id of ids){const r=scoreDish(stages,id);judgeScores[id]=r;if(!r.meaningless){sum+=r.total;f+=r.flavor;t+=r.texture;c+=r.color;s+=r.smoke;}}
   const n=ids.filter(id=>!JUDGES[id]?.meaningless).length||1;
  return {judgeScores,average:sum/n,breakdown:{flavor:Math.round(f/n),texture:Math.round(t/n),color:Math.round(c/n),smoke:Math.round(s/n)}};
 }
 window.RAMinigameLogic=window.RAMinigameLogic||{};
 window.RAMinigameLogic.jollof={judges:JUDGES,blendQuality,fryResult,steamResult,scoreDish,total};

 // ---------- presentation ----------
 const STEAM_LINES=['the pot is quiet, smells like raw tomato still...','a thin steam curls up, onion and thyme...','the kitchen smells like somebody\'s aunty\'s house...','smoke is starting to catch at the bottom — careful...','it smells like it might be burning down there...'];
 function env(mode){
  return {sky:mode==='final'?palette().neon:palette().night,wall:'#2a2340',floor:'#241e2e',horizon:300,seed:'jollof-'+mode,stars:mode==='final'?18:0,
   props:[
    {type:'sign',x:20,y:18,w:230,h:22,text:mode==='final'?'JOLLOF WARS — A54 FINAL':mode==='cookoff'?'JOLLOF WARS — COOKOFF':'CASTLE KITCHEN',size:7,color:'#1a1528',glow:palette().gold},
    {type:'counter',x:0,y:300,w:270,h:20},
    {type:'window',x:20,y:110,w:36,h:44,color:'#241d33'},
    {type:'window',x:214,y:110,w:36,h:44,color:'#241d33'}
   ],label:null};
 }
 function drawPot(ctx,x,y,glow){
  const R=P().rect;R(ctx,x-26,y,52,26,'#2c2c34');R(ctx,x-28,y-3,56,6,'#454452');
  if(glow)R(ctx,x-24,y-8,48,6,glow);
 }

 window.RAMinigames.register('jollof',{title:'JOLLOF WARS',rule:'Cook the jollof in four steps: blend, fry, season, steam, and stop at each green zone.',mount(root,ctx){ctx.audio?.sound('AMB_COOKOFF');
  const {canvas,ctx:g}=P().createCanvas(root);
  const J=window.RAJuice?window.RAJuice.create(g):{burst(){},float(){},ring(){},shake(){},flash(){},update(){},begin(){g.save();},end(){g.restore();}};
  const params=ctx.params||{};const mode=params.mode||'practice';
  const judgeIds=(()=>{let ids=(params.judges&&params.judges.length?params.judges.slice():['nneka','uncle_sunday','bunmi']);
   if(mode==='final'){if(!ids.includes('mom'))ids.push('mom');if(!ids.includes('lil_smack'))ids.push('lil_smack');}
   return ids;})();
  const rivals=params.rivals||['AUNTIE BISI','HINA (RAMEN-JOLLOF FUSION, OUT OF SPITE)'];
  const laura=typeof params.lauraScore==='number'?params.lauraScore:34;
  const rng=P().rng('jollof-'+(params.seed||Date.now()));
  const hasDragon=(params.inventory?.maggi_dragon_crumble||0)>0;

  let stage='blend',dead=false;
  const stages={blend:0,fry:{darkness:0,stoppedAtSheen:false},season:{thyme:0,curry:0,bayleaf:0,salt:0,cubes:0,dragon:false},steam:{liftTime:0,crust:false}};
  let dragonUsed=false;
  // BLEND
  let holding=false,holdStart=0;
  // FRY
  let fryStart=0,fryLastTap=0,fryLastSide=null,fryBurnPenalty=0,fryStopped=false;
  // SEASON
  const seasonItems=['thyme','curry','bayleaf','salt','cubes'];
  let seasonTaps=0;
  // STEAM
  let steamStart=0,mazdaBurn=false,mazdaCrust=false,steamLifted=false;
  if(params.mazdaHelps)mazdaBurn=rng()<1/3;

  // judging
  let judgeIdx=-1,scoreResult=null,resultShown=false;
  let raf=null,lastT=performance.now();

  function pointToStage(){if(dead)return;ctx.audio?.stop('BLENDER');ctx.audio?.sound('OIL_SIZZLE_PASTE');stage='fry';fryStart=performance.now();fryLastTap=fryStart;}
  function toSeason(){if(dead)return;ctx.audio?.stop('OIL_SIZZLE_PASTE');ctx.audio?.stop('BURNT_CRACKLE');stage='season';}
  function toSteam(){ctx.audio?.sound('LID_CLANK');ctx.audio?.sound('STEAM_HISS');stage='steam';steamStart=performance.now();}
  function toJudging(){if(dead)return;ctx.audio?.stop('STEAM_HISS');
   scoreResult=window.RAMinigameLogic.jollof.total(stages,judgeIds);
   const best=ctx.progress();
   const bestTotal=Math.max(best.bestTotal||0,scoreResult.average);
   const rivalsBar=laura-2;
   const beatLaura=scoreResult.average>laura;
   const beatRivals=scoreResult.average>rivalsBar;
   const win=mode!=='practice'&&beatLaura&&beatRivals;
   ctx.saveProgress({bestTotal,wins:(best.wins||0)+(win?1:0)});
   scoreResult.beatLaura=beatLaura;scoreResult.win=win;
   stage='judging';judgeIdx=0;J.flash('#ffd36a',120);
  }
  function finishRun(){
   const win=!!scoreResult.win;
   if(win){
    const prize=mode==='final'?5000:500;
    ctx.reward({money:prize,items:{jollof_trophy:1},memories:['won jollof wars']});
   }
   if(dragonUsed)ctx.reward({consumed:{maggi_dragon_crumble:1}});
   ctx.finish({outcome:mode==='practice'?'done':(win?'win':'lose'),score:Math.round(scoreResult.average),
    data:{scores:scoreResult.breakdown,judgeScores:scoreResult.judgeScores,beatLaura:scoreResult.beatLaura}});
  }

  function onDown(nx,ny){
   if(dead)return;
   if(stage==='blend'){if(holding)return;ctx.audio?.sound('BLENDER');holding=true;holdStart=performance.now();}
   else if(stage==='fry'){
    if(fryStopped)return;
    if(ny>380&&ny<420&&nx>75&&nx<195&&(performance.now()-fryStart)>1200){
     const darkness=stages.fry.darkness;fryStopped=true;J.burst(135,236,['#d7193f','#ffd36a'],14,70);J.ring(135,236,'#ffd36a',30);
     stages.fry.stoppedAtSheen=darkness>=.45&&darkness<=.88;
     const r=fryResult(darkness,stages.fry.stoppedAtSheen);stages.fry.result=r;
     ctx.scope.timeout(toSeason,650);return;
    }
    if(ny>=150&&ny<=280){const side=nx<135?'left':'right';const now=performance.now();ctx.audio?.sound('STIR_POT');if(side!==fryLastSide){fryLastSide=side;fryLastTap=now;}else fryBurnPenalty+=.02;}

   } else if(stage==='season'){
    for(let i=0;i<seasonItems.length;i++){
     const ix=30+i*48,iy=210;
     if(nx>ix-20&&nx<ix+20&&ny>iy-20&&ny<iy+20){
      ctx.audio?.sound('SPICE_SHAKE');const k=seasonItems[i];stages.season[k]=Math.min(1,(stages.season[k]||0)+.2);seasonTaps++;J.burst(ix,iy,['#20c66b','#ffd36a'],8,50);J.float('+',ix,iy-22,{color:'#20c66b',size:8,life:.5,rise:12});
     }
    }
    if(hasDragon&&!dragonUsed&&nx>105&&nx<165&&ny>270&&ny<310){stages.season.dragon=true;dragonUsed=true;}
    if(ny>400&&ny<440&&nx>75&&nx<195&&seasonTaps>=3)toSteam();
   } else if(stage==='steam'){
    if(steamLifted)return;
    if(ny>380&&ny<440&&nx>75&&nx<195){
     steamLifted=true;J.burst(135,215,['#e6e6ff','#9aa0c8'],24,80);J.shake(2);ctx.audio?.sound('LID_CLANK');ctx.audio?.stop('STEAM_HISS');
     const elapsed=performance.now()-steamStart;
     const liftTime=Math.min(1,elapsed/8000);
     const crust=params.mazdaHelps?!mazdaBurn:(liftTime>.6&&liftTime<.92);
     stages.steam.liftTime=liftTime;stages.steam.crust=crust&&!(params.mazdaHelps&&mazdaBurn);
     if(params.mazdaHelps&&mazdaBurn){stages.steam.liftTime=.95;stages.steam.crust=false;}
     ctx.scope.timeout(toJudging,500);
    }
   } else if(stage==='judging'){
    judgeIdx++;
    if(judgeIdx>=judgeIds.length){stage='result';}
   } else if(stage==='result'){
    if(!resultShown){resultShown=true;finishRun();}
   }
  }
  function onUp(){
   if(stage==='blend'&&holding){
    holding=false;J.burst(135,230,['#e8dcb8','#d7193f'],14,70);const level=Math.min(1,(performance.now()-holdStart)/3000);
    stages.blend=level;stages.blendResult=blendQuality(level);pointToStage();
   }
  }
  function pos(e){const t=e.touches?e.touches[0]:e;const n=canvas.__toNative?canvas.__toNative(t.clientX,t.clientY):{x:t.clientX,y:t.clientY};return n;}
  const toNative=(x,y)=>{const r=canvas.getBoundingClientRect();return {x:(x-r.left)*270/(r.width||270),y:(y-r.top)*480/(r.height||480)};};
  let pointerId=null;
  function handleDown(e){if(pointerId!==null)return;e.preventDefault();pointerId=e.pointerId;try{canvas.setPointerCapture(e.pointerId);}catch(_){}const n=toNative(e.clientX,e.clientY);onDown(n.x,n.y);}
  function handleUp(e){if(e.pointerId!==pointerId)return;e.preventDefault();pointerId=null;if(e.type==='pointercancel'){holding=false;ctx.audio?.stop('BLENDER');return;}onUp();}
  canvas.addEventListener('pointerdown',handleDown);canvas.addEventListener('pointerup',handleUp);canvas.addEventListener('pointercancel',handleUp);
  function keyDown(e){if(dead||e.repeat)return;if(e.key===' '&&stage==='blend'){e.preventDefault();onDown(135,230);}else if(stage==='fry'&&['a','d','ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();onDown(e.key==='a'||e.key==='ArrowLeft'?70:200,220);}else if(stage==='season'&&/^[1-5]$/.test(e.key)){e.preventDefault();onDown(30+(Number(e.key)-1)*48,210);}else if(e.key==='Enter'){e.preventDefault();if(stage==='fry')onDown(135,400);else if(stage==='season')onDown(135,420);else if(stage==='steam')onDown(135,420);else if(stage==='judging'||stage==='result')onDown(135,420);}}
  function keyUp(e){if(e.key===' '&&holding){e.preventDefault();onUp();}}
  window.addEventListener('keydown',keyDown);window.addEventListener('keyup',keyUp);

  function draw(){
   const dt=performance.now()-lastT;lastT=performance.now();J.update(dt/1000);J.begin();
   root.dataset.phase=stage;root.dataset.blend=String(holding?Math.min(1,(performance.now()-holdStart)/3000):stages.blend);root.dataset.fry=String(stages.fry.darkness);root.dataset.steam=String((performance.now()-steamStart)/8000);root.dataset.season=JSON.stringify(stages.season);
   const rp=P(),pal=palette();
   if(!rp.drawBoard(g,({practice:'jollof_kitchen',cookoff:'jollof_cookoff',final:'jollof_final'}[mode]||'jollof_kitchen')))rp.paintEnvironment(g,env(mode));
   else rp.text(g,mode==='final'?'JOLLOF WARS — A54 FINAL':mode==='cookoff'?'JOLLOF WARS — COOKOFF':'CASTLE KITCHEN',135,25,{size:7,align:'center',color:pal.gold});
   // The approved incidental cook has no identity or dialogue; named judges retain their own frozen art.
   if(stage==='blend'||stage==='fry')rp.drawRegistered(g,'jollof_cook',35,365);
   if(stage==='blend'){
    rp.text(g,'HOLD / SPACE TO BLEND',135,140,{size:8,align:'center'});
    rp.text(g,'RELEASE IN THE GREEN ZONE',135,155,{size:6,align:'center',color:pal.grey});
    drawPot(g,135,230);
    const level=holding?Math.min(1,(performance.now()-holdStart)/3000):stages.blend;
    rp.rect(g,45,270,180,14,'#151321');
    rp.rect(g,47,272,54,10,'#5a4432');rp.rect(g,45+.3*176,272,.48*176,10,pal.green);rp.rect(g,185,272,38,10,'#5a4432');
    rp.rect(g,45+level*176,271,4,12,pal.bone);
    if(!holding&&stages.blend>0)rp.text(g,stages.blendResult?.tag||'',135,300,{size:6,align:'center'});
   } else if(stage==='fry'){
    const elapsed=performance.now()-fryStart;
    stages.fry.darkness=Math.min(1,elapsed/9000+fryBurnPenalty);
    rp.text(g,'STIR LEFT / RIGHT · A / D',135,140,{size:7,align:'center'});
    rp.text(g,'STOP WHEN OIL FLOATS',135,154,{size:6,align:'center',color:pal.grey});
    ctx.audio?.edge('burnt',stages.fry.darkness>.88,'BURNT_CRACKLE');const dk=stages.fry.darkness;const sheen=dk>=.45&&dk<=.88;
    drawPot(g,135,230,sheen?'rgba(215,25,63,.55)':null);
    rp.rect(g,60,236,150,16,`rgb(${Math.round(180-120*dk)},${Math.round(70-40*dk)},${Math.round(40-20*dk)})`);
    rp.rect(g,20,150,110,120,fryLastSide==='left'?'rgba(255,255,255,.06)':'transparent');
    rp.rect(g,140,150,110,120,fryLastSide==='right'?'rgba(255,255,255,.06)':'transparent');
    rp.rect(g,45,318,180,12,'#151321');rp.rect(g,47+.45*176,320,.43*176,8,pal.green);rp.rect(g,47+dk*172,317,4,14,pal.bone);rp.text(g,'STOP IN THE GREEN',135,336,{size:6,align:'center',color:pal.grey});
    if(!fryStopped&&elapsed>1200)rp.frame(g,75,380,120,40,{fill:pal.gold});
    if(!fryStopped&&elapsed>1200)rp.text(g,'STOP',135,395,{size:8,align:'center',color:pal.ink});
    if(sheen&&!fryStopped)rp.text(g,'the oil is floating...',135,270,{size:6,align:'center',color:pal.red});
    if(dk>=1)rp.text(g,'IT\'S BURNING',135,270,{size:7,align:'center',color:pal.red});
   } else if(stage==='season'){
    rp.text(g,'SPICES 1–5 · AT LEAST 3 TAPS',135,140,{size:7,align:'center'});
    drawPot(g,135,230);
    seasonItems.forEach((k,i)=>{
     const x=30+i*48,y=210;rp.rect(g,x-18,y-18,36,36,'#1b1830');rp.rect(g,x-16,y-16,32*(stages.season[k]||0),4,pal.green);
     rp.text(g,k.slice(0,3).toUpperCase(),x,y,{size:6,align:'center'});
    });
    if(hasDragon&&!dragonUsed){rp.rect(g,105,270,60,40,'rgba(255,90,90,.25)');rp.text(g,'DRAGON',135,285,{size:6,align:'center',color:pal.red});rp.text(g,'MAGGI',135,296,{size:6,align:'center',color:pal.red});}
    if(dragonUsed)rp.text(g,'dragon maggi crumbled in — judges go quiet',135,320,{size:6,align:'center',color:pal.gold});
    if(seasonTaps>=3){rp.frame(g,75,400,120,36,{fill:pal.gold});rp.text(g,'DONE',135,414,{size:8,align:'center',color:pal.ink});}
   } else if(stage==='steam'){
    const elapsed=performance.now()-steamStart;
    drawPot(g,135,230);rp.rect(g,105,224,60,8,'#5b5a68');
    const li=Math.min(STEAM_LINES.length-1,Math.floor((elapsed/8000)*STEAM_LINES.length));
    rp.text(g,'COVER & WAIT. LIFT IN THE GREEN.',135,140,{size:6,align:'center'});
    {const lv=Math.min(1,elapsed/8000);rp.rect(g,45,270,180,14,'#151321');rp.rect(g,47+.6*176,272,.32*176,10,pal.green);rp.rect(g,47+lv*172,269,4,16,pal.bone);}
    rp.wrap(g,STEAM_LINES[li],220,7).forEach((ln,i)=>rp.text(g,ln,135,300+i*12,{size:7,align:'center',color:pal.grey}));
    if(params.mazdaHelps)rp.text(g,'MAZDA IS BREATHING ON THE POT',135,180,{size:6,align:'center',color:pal.mazda});
    rp.frame(g,75,400,120,36,{fill:pal.gold});rp.text(g,'LIFT LID',135,414,{size:8,align:'center',color:pal.ink});
   } else if(stage==='judging'){
    const id=judgeIds[Math.min(judgeIdx,judgeIds.length-1)];const j=JUDGES[id];const r=scoreResult.judgeScores[id];
    if(!rp.drawSprite(g,rp.personSprite(id),135,220))rp.drawActor(g,{top:'#5a4d63',bottom:'#302840',hairShape:'bun'},135,220,1.4);
    rp.text(g,j.name,135,260,{size:8,align:'center',color:pal.gold});
    rp.wrap(g,r.reaction,220,7).forEach((ln,i)=>rp.text(g,ln,135,280+i*12,{size:7,align:'center'}));
    if(!j.meaningless)rp.text(g,`${r.total}/40`,135,330,{size:9,align:'center',color:pal.green});
    else rp.text(g,'(doesn\'t count)',135,330,{size:6,align:'center',color:pal.grey});
    rp.text(g,'TAP / ENTER TO CONTINUE',135,440,{size:6,align:'center',color:pal.grey});
   } else if(stage==='result'){
    const b=scoreResult.breakdown;
    rp.text(g,'RESULT',135,140,{size:9,align:'center',color:pal.gold});
    rp.text(g,`FLAVOR ${b.flavor}  TEXTURE ${b.texture}`,135,170,{size:6,align:'center'});
    rp.text(g,`COLOR ${b.color}  SMOKE ${b.smoke}`,135,182,{size:6,align:'center'});
    rp.text(g,`AVERAGE ${scoreResult.average.toFixed(1)}/40`,135,210,{size:8,align:'center',color:pal.green});
    rp.text(g,`LAURA — ${laura}/40`,135,230,{size:7,align:'center',color:pal.grey});
    if(mode!=='practice')rp.text(g,scoreResult.win?'YOU WON JOLLOF WARS':'YOU LOST — TRY AGAIN',135,255,{size:7,align:'center',color:scoreResult.win?pal.green:pal.red});
    rp.text(g,'rivals: '+rivals.join(', '),135,290,{size:5,align:'center',color:pal.grey,maxWidth:250});
    rp.frame(g,75,400,120,36,{fill:pal.gold});rp.text(g,'DONE',135,414,{size:8,align:'center',color:pal.ink});
   }
   J.end();
   if(!dead)raf=requestAnimationFrame(draw);
  }
  raf=requestAnimationFrame(draw);
  return {dispose(){dead=true;if(raf)cancelAnimationFrame(raf);canvas.removeEventListener('pointerdown',handleDown);canvas.removeEventListener('pointerup',handleUp);canvas.removeEventListener('pointercancel',handleUp);window.removeEventListener('keydown',keyDown);window.removeEventListener('keyup',keyUp);}};
 }});
})();
