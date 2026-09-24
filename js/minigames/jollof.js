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
  if(level<.35)return {texture:'chunky',textureScore:4,tag:'chunky — you rushed it'};
  if(level>.7)return {texture:'watery',textureScore:3,tag:'sad and watery — too far'};
  return {texture:'smooth',textureScore:9,tag:'smooth base — green zone'};
 }
 function fryResult(darkness,stoppedAtSheen){
  darkness=Math.max(0,Math.min(1,darkness));
  if(darkness<.4)return {flavor:3,color:4,tag:'raw tomato — pulled too soon'};
  if(darkness>.88)return {flavor:4,color:3,tag:'bitter — burnt the paste'};
  if(stoppedAtSheen)return {flavor:9,color:9,tag:'oil floats — the secret is safe with you'};
  return {flavor:6,color:6,tag:'decent, not legendary'};
 }
 function steamResult(t,crust){
  t=Math.max(0,Math.min(1,t));
  if(t<.35)return {textureAdj:-3,smoke:1,tag:'undercooked — still crunchy'};
  if(t>.85)return {textureAdj:crust?-1:-3,smoke:crust?9:4,tag:crust?'burnt bottom — party rice crust':'burnt through, no glory in it'};
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
  for(const id of ids){const r=scoreDish(stages,id);judgeScores[id]=r;sum+=r.total;f+=r.flavor;t+=r.texture;c+=r.color;s+=r.smoke;}
  const n=ids.length||1;
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

 window.RAMinigames.register('jollof',{title:'JOLLOF WARS',mount(root,ctx){
  const {canvas,ctx:g}=P().createCanvas(root);
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

  function pointToStage(){stage='fry';fryStart=performance.now();fryLastTap=fryStart;}
  function toSeason(){stage='season';}
  function toSteam(){stage='steam';steamStart=performance.now();}
  function toJudging(){
   scoreResult=window.RAMinigameLogic.jollof.total(stages,judgeIds);
   const best=ctx.progress();
   const bestTotal=Math.max(best.bestTotal||0,scoreResult.average);
   const rivalsBar=laura-2;
   const beatLaura=scoreResult.average>laura;
   const beatRivals=scoreResult.average>rivalsBar;
   const win=mode!=='practice'&&beatLaura&&beatRivals;
   ctx.saveProgress({bestTotal,wins:(best.wins||0)+(win?1:0)});
   scoreResult.beatLaura=beatLaura;scoreResult.win=win;
   stage='judging';judgeIdx=0;
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
   if(stage==='blend'){holding=true;holdStart=performance.now();}
   else if(stage==='fry'){
    if(fryStopped)return;
    const side=nx<135?'left':'right';const now=performance.now();
    if(side!==fryLastSide){fryLastSide=side;fryLastTap=now;}
    else{fryBurnPenalty+=.02;} // tapping same side repeatedly doesn't stir properly
    if(ny>380&&ny<420&&nx>75&&nx<195&&(performance.now()-fryStart)>1200){
     const darkness=stages.fry.darkness;fryStopped=true;
     stages.fry.stoppedAtSheen=darkness>=.5&&darkness<=.82;
     const r=fryResult(darkness,stages.fry.stoppedAtSheen);stages.fry.result=r;
     ctx.progress&&null;setTimeout(toSeason,650);
    }
   } else if(stage==='season'){
    for(let i=0;i<seasonItems.length;i++){
     const ix=30+i*48,iy=210;
     if(nx>ix-20&&nx<ix+20&&ny>iy-20&&ny<iy+20){
      const k=seasonItems[i];stages.season[k]=Math.min(1,(stages.season[k]||0)+.2);seasonTaps++;
     }
    }
    if(hasDragon&&!dragonUsed&&nx>105&&nx<165&&ny>270&&ny<310){stages.season.dragon=true;dragonUsed=true;}
    if(ny>400&&ny<440&&nx>75&&nx<195&&seasonTaps>=3)toSteam();
   } else if(stage==='steam'){
    if(steamLifted)return;
    if(ny>380&&ny<440&&nx>75&&nx<195){
     steamLifted=true;
     const elapsed=performance.now()-steamStart;
     const liftTime=Math.min(1,elapsed/8000);
     const crust=params.mazdaHelps?!mazdaBurn:(liftTime>.68&&liftTime<.85);
     stages.steam.liftTime=liftTime;stages.steam.crust=crust&&!(params.mazdaHelps&&mazdaBurn);
     if(params.mazdaHelps&&mazdaBurn){stages.steam.liftTime=.95;stages.steam.crust=false;}
     setTimeout(toJudging,500);
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
    holding=false;const level=Math.min(1,(performance.now()-holdStart)/3000);
    stages.blend=level;stages.blendResult=blendQuality(level);pointToStage();
   }
  }
  function pos(e){const t=e.touches?e.touches[0]:e;const n=canvas.__toNative?canvas.__toNative(t.clientX,t.clientY):{x:t.clientX,y:t.clientY};return n;}
  const toNative=(x,y)=>{const r=canvas.getBoundingClientRect();return {x:(x-r.left)*270/(r.width||270),y:(y-r.top)*480/(r.height||480)};};
  function handleDown(e){e.preventDefault();const t=e.touches?e.touches[0]:e;const n=toNative(t.clientX,t.clientY);onDown(n.x,n.y);}
  function handleUp(e){e.preventDefault?.();onUp();}
  canvas.addEventListener('pointerdown',handleDown);canvas.addEventListener('pointerup',handleUp);canvas.addEventListener('pointercancel',handleUp);
  canvas.addEventListener('touchstart',handleDown,{passive:false});canvas.addEventListener('touchend',handleUp,{passive:false});

  function draw(){
   const dt=performance.now()-lastT;lastT=performance.now();
   const rp=P(),pal=palette();
   rp.paintEnvironment(g,env(mode));
   if(stage==='blend'){
    rp.text(g,'HOLD TO BLEND',135,140,{size:8,align:'center'});
    rp.text(g,'RELEASE IN THE GREEN ZONE',135,155,{size:6,align:'center',color:pal.grey});
    drawPot(g,135,230);
    const level=holding?Math.min(1,(performance.now()-holdStart)/3000):stages.blend;
    rp.rect(g,45,270,180,14,'#151321');
    rp.rect(g,47,272,66,10,'#5a4432');rp.rect(g,113,272,44,10,pal.green);rp.rect(g,157,272,66,10,'#5a4432');
    rp.rect(g,45+level*176,271,4,12,pal.bone);
    if(!holding&&stages.blend>0)rp.text(g,stages.blendResult?.tag||'',135,300,{size:6,align:'center'});
   } else if(stage==='fry'){
    const elapsed=performance.now()-fryStart;
    stages.fry.darkness=Math.min(1,elapsed/7000+fryBurnPenalty);
    rp.text(g,'TAP LEFT / RIGHT TO STIR',135,140,{size:7,align:'center'});
    rp.text(g,'STOP WHEN OIL FLOATS',135,154,{size:6,align:'center',color:pal.grey});
    const dk=stages.fry.darkness;const sheen=dk>=.5&&dk<=.82;
    drawPot(g,135,230,sheen?'rgba(215,25,63,.55)':null);
    rp.rect(g,60,236,150,16,`rgb(${Math.round(180-120*dk)},${Math.round(70-40*dk)},${Math.round(40-20*dk)})`);
    rp.rect(g,20,150,110,120,fryLastSide==='left'?'rgba(255,255,255,.06)':'transparent');
    rp.rect(g,140,150,110,120,fryLastSide==='right'?'rgba(255,255,255,.06)':'transparent');
    if(!fryStopped&&elapsed>1200)rp.frame(g,75,380,120,40,{fill:pal.gold});
    if(!fryStopped&&elapsed>1200)rp.text(g,'STOP',135,395,{size:8,align:'center',color:pal.ink});
    if(sheen&&!fryStopped)rp.text(g,'the oil is floating...',135,270,{size:6,align:'center',color:pal.red});
    if(dk>=1)rp.text(g,'IT\'S BURNING',135,270,{size:7,align:'center',color:pal.red});
   } else if(stage==='season'){
    rp.text(g,'DRAG / TAP TO SEASON',135,140,{size:7,align:'center'});
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
    rp.text(g,'COVER & WAIT',135,140,{size:8,align:'center'});
    rp.wrap(g,STEAM_LINES[li],220,7).forEach((ln,i)=>rp.text(g,ln,135,300+i*12,{size:7,align:'center',color:pal.grey}));
    if(params.mazdaHelps)rp.text(g,'MAZDA IS BREATHING ON THE POT',135,180,{size:6,align:'center',color:pal.mazda});
    rp.frame(g,75,400,120,36,{fill:pal.gold});rp.text(g,'LIFT LID',135,414,{size:8,align:'center',color:pal.ink});
   } else if(stage==='judging'){
    const id=judgeIds[Math.min(judgeIdx,judgeIds.length-1)];const j=JUDGES[id];const r=scoreResult.judgeScores[id];
    rp.drawActor(g,{top:'#5a4d63',bottom:'#302840',hairShape:'bun'},135,220,1.4);
    rp.text(g,j.name,135,260,{size:8,align:'center',color:pal.gold});
    rp.wrap(g,r.reaction,220,7).forEach((ln,i)=>rp.text(g,ln,135,280+i*12,{size:7,align:'center'}));
    if(!j.meaningless)rp.text(g,`${r.total}/40`,135,330,{size:9,align:'center',color:pal.green});
    else rp.text(g,'(doesn\'t count)',135,330,{size:6,align:'center',color:pal.grey});
    rp.text(g,'TAP TO CONTINUE',135,440,{size:6,align:'center',color:pal.grey});
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
   if(!dead)raf=requestAnimationFrame(draw);
  }
  raf=requestAnimationFrame(draw);
  return {dispose(){dead=true;if(raf)cancelAnimationFrame(raf);canvas.removeEventListener('pointerdown',handleDown);canvas.removeEventListener('pointerup',handleUp);canvas.removeEventListener('pointercancel',handleUp);canvas.removeEventListener('touchstart',handleDown);canvas.removeEventListener('touchend',handleUp);}};
 }});
})();
