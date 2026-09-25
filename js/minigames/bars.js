// BARS — freestyle rhyme-chain minigame. See docs/btf/MINIGAME_CONTRACT.md.
// Registers RAMinigames 'bars' and exposes pure logic at window.RAMinigameLogic.bars.
(function(){
 'use strict';
 // ---------- compact fallback pool (used until js/data/bars_words.js loads, and by node-vm logic tests) ----------
 const FALLBACK={
  families:{
   uck:['DUCK','TRUCK','LUCK','STUCK','BUCK','PLUCK','TUCK','CHUCK'],
   ame:['GAME','FAME','NAME','FLAME','BLAME','SAME','TAME','FRAME'],
   ight:['NIGHT','LIGHT','FIGHT','SIGHT','FLIGHT','MIGHT','TIGHT','RIGHT'],
   ow:['FLOW','GLOW','SHOW','GROW','SLOW','BLOW','THROW','SNOW'],
   un:['SUN','RUN','FUN','GUN','STUN','SPUN','BUN','SHUN'],
   ay:['DAY','WAY','SAY','PLAY','STAY','PAY','TRAY','SWAY'],
   ock:['ROCK','LOCK','CLOCK','BLOCK','SOCK','KNOCK','STOCK','DOCK'],
   ars:['CARS','STARS','BARS','JARS','MARS','SCARS','WARS','GUITARS'],
   ats:['RATS','CATS','HATS','BATS','MATS','STATS','CHATS','FLATS'],
   ocs:['LOCS','ROCKS','BLOCKS','SOCKS','DOCKS','KNOCKS']
  },
  slant:{uck:['CUP','UP','LOVE'],ay:['GAME','SAME'],ock:['DOG','LOG'],ats:['MATCH','BATCH']},
  falseFriends:[['COUGH','DOUGH','ROUGH','THROUGH'],['BOMB','TOMB','COMB'],['HEARD','BEARD'],['GOOD','FOOD'],['LOVE','MOVE'],['FIVE','GIVE'],['NOW','KNOW']],
  punchlines:['JOLLOF','MAZDA','SUPRA','SAPPORO'],
  pools:{}
 };

 // ---------- pure logic (no DOM) ----------
 let ACTIVE=null;
 function norm(w){return String(w==null?'':w).trim().toUpperCase();}
 function buildIndex(data){
  const d=data&&data.families?data:FALLBACK;
  const wordFamily=new Map();
  const famSource=d.families||{};
  for(const key of Object.keys(famSource)){for(const w of famSource[key])wordFamily.set(norm(w),key);}
  return {families:famSource,slant:d.slant||{},falseFriendSets:(d.falseFriends||[]).map(set=>set.map(norm)),
   punchlines:(d.punchlines||[]).map(norm),pools:d.pools||{},wordFamily};
 }
 function setWords(data){ACTIVE=buildIndex(data);}
 setWords(FALLBACK);

 function poolIndex(poolName){
  if(poolName&&poolName!=='default'&&ACTIVE.pools[poolName]&&ACTIVE.pools[poolName].families){
   return buildIndex({families:ACTIVE.pools[poolName].families,slant:ACTIVE.slant,falseFriends:[],punchlines:ACTIVE.punchlines,pools:{}});
  }
  return ACTIVE;
 }
 function familyOf(word,idx){idx=idx||ACTIVE;return idx.wordFamily.get(norm(word))||null;}
 function isFalseFriend(a,b){
  const A=norm(a),B=norm(b);if(A===B)return false;
  for(const set of ACTIVE.falseFriendSets){if(set.includes(A)&&set.includes(B))return true;}
  return false;
 }
 function rhymes(a,b,opts){
  opts=opts||{};const combo=opts.combo||0;const idx=poolIndex(opts.pool);
  const A=norm(a),B=norm(b);
  if(A===B)return false;
  if(isFalseFriend(A,B))return false;
  const fa=familyOf(A,idx),fb=familyOf(B,idx);
  if(fa&&fb&&fa===fb)return true;
  if(fa&&idx.slant[fa]&&idx.slant[fa].map(norm).includes(B))return combo>=10;
  if(fb&&idx.slant[fb]&&idx.slant[fb].map(norm).includes(A))return combo>=10;
  return false;
 }
 function speedFor(combo){return 1+Math.floor(Math.max(0,combo)/5)*0.05;}
 function pick(arr,rng){return arr&&arr.length?arr[Math.floor((rng?rng():Math.random())*arr.length)]:null;}

 function buildChoices(chainWord,rng,opts){
  opts=opts||{};rng=rng||Math.random;const combo=opts.combo||0;const seedWords=(opts.seedWords||[]).map(norm);
  const idx=poolIndex(opts.pool);
  const famKeys=Object.keys(idx.families);
  let fam=familyOf(chainWord,idx)||pick(famKeys,rng)||Object.keys(ACTIVE.families)[0];
  let famWords=(idx.families[fam]||ACTIVE.families[fam]||[]).map(norm).filter(w=>w!==norm(chainWord));
  if(!famWords.length){fam=pick(famKeys,rng);famWords=(idx.families[fam]||[]).map(norm).filter(w=>w!==norm(chainWord));}
  const correct1=pick(famWords,rng)||norm(chainWord);
  const choices=[{word:correct1,correct:true,type:'normal'}];
  if(rng()<0.2&&famWords.length>1){
   const rest=famWords.filter(w=>w!==correct1);
   const c2=pick(rest,rng);
   if(c2)choices.push({word:c2,correct:true,type:'multi'});
  }
  if(rng()<0.08&&ACTIVE.punchlines.length){
   choices.push({word:pick(ACTIVE.punchlines,rng),correct:true,type:'punchline'});
  }
  if(idx.slant[fam]&&idx.slant[fam].length&&rng()<0.25){
   const sw=norm(pick(idx.slant[fam],rng));
   choices.push({word:sw,correct:combo>=10,type:'curveball'});
  }
  if(rng()<0.3){
   const cluster=ACTIVE.falseFriendSets.find(set=>set.includes(norm(chainWord)));
   if(cluster){
    const opts2=cluster.filter(w=>w!==norm(chainWord));
    const d=pick(opts2,rng);
    if(d)choices.push({word:d,correct:false,type:'falseFriend'});
   }
  }
  const allWords=[...idx.wordFamily.keys()];
  let guard=0;
  while(choices.length<4&&guard<40){
   guard++;
   let candidate;
   if(seedWords.length&&rng()<0.3)candidate=pick(seedWords,rng);
   else candidate=pick(allWords,rng)||pick(Object.values(FALLBACK.families)[0],rng);
   if(!candidate)break;
   candidate=norm(candidate);
   if(candidate===norm(chainWord)||choices.some(c=>c.word===candidate))continue;
   const correct=rhymes(chainWord,candidate,{combo,pool:opts.pool});
   choices.push({word:candidate,correct,type:correct?'normal':'wrong'});
  }
  while(choices.length<4)choices.push({word:pick(allWords,rng)||'YO',correct:false,type:'wrong'});
  let final=choices.slice(0,4);
  if(!final.some(c=>c.correct))final[0]={word:correct1,correct:true,type:'normal'};
  for(let i=final.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));const t=final[i];final[i]=final[j];final[j]=t;}
  return final;
 }
 function scoreTap(state,word,now,opts){
  opts=opts||{};state.combo=state.combo||0;state.score=state.score||0;
  const W=norm(word);
  if(ACTIVE.punchlines.includes(W)){
   state.combo+=1;const points=1000;state.score+=points;state.lastTapTime=now;
   return {correct:true,points,combo:state.combo,punchline:true,multi:false,chainWord:state.chainWord};
  }
  const correct=rhymes(state.chainWord,W,{combo:state.combo,pool:opts.pool});
  if(correct){
   state.combo+=1;
   let points=100*state.combo;
   if(opts.multi)points*=2;
   state.score+=points;state.chainWord=W;state.lastTapTime=now;
   return {correct:true,points,combo:state.combo,punchline:false,multi:!!opts.multi,chainWord:W};
  }
  state.combo=0;state.lastTapTime=now;
  return {correct:false,points:0,combo:0,punchline:false,multi:false,chainWord:state.chainWord};
 }
 window.RAMinigameLogic=window.RAMinigameLogic||{};
 window.RAMinigameLogic.bars={rhymes,isFalseFriend,buildChoices,scoreTap,speedFor,_setWords:setWords,_fallback:FALLBACK};

 // ---------- mount (DOM/game) ----------
 function pickStartWord(seedWords,pool,rng){
  const idx=poolIndex(pool);
  const seeds=(seedWords||[]).map(norm).filter(w=>idx.wordFamily.has(w));
  if(seeds.length&&rng()<0.7)return pick(seeds,rng);
  const keys=Object.keys(idx.families);
  const fam=pick(keys,rng);
  return pick(idx.families[fam],rng)||'RICH';
 }
 const SNACKS=['IRON JAW: "...THIS CAPRI SUN GOT NO STRAW."','IRON JAW: "SUCKED IT DRY IN ONE VERSE. NEXT ROUND."','IRON JAW: "POUCH EMPTY. HEART FULL."'];
 const PARTNER_LINES={TRISTAN:['UH... "TRUCK"? NO WAIT—','TRISTAN FLUBS IT LOL','TRISTAN: "DUCK... TRUCK... BUCK... TRUCK AGAIN"'],JUNE:['JUNE SNAPS BACK CLEAN','JUNE: SMOOTH.','JUNE CHAINS THREE DEEP']};

 function mount(root,ctx){
  const P=RAPixel;
  const {canvas,ctx:g,toNative}=P.createCanvas(root);
  const params=ctx.params||{};
  const savedProgress=ctx.progress()||{};
  let rngSeed=(params.seed||('bars'+Date.now()));
  let rng=P.rng(rngSeed);

  var dispose_extra=[];
  if(!window.RABarsWords){
   setWords(FALLBACK);
   const s=document.createElement('script');s.src='js/data/bars_words.js';
   s.onload=()=>{if(window.RABarsWords)setWords(window.RABarsWords);};
   s.onerror=()=>{};
   document.head.appendChild(s);
   dispose_extra.push(()=>{try{s.remove();}catch(e){}});
  } else setWords(window.RABarsWords);

  // audio (muted by default; simple synthesized kick/hat)
  let audioCtx=null,muted=true;
  function beat(strong){
   if(muted)return;
   try{
    audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();
    const t=audioCtx.currentTime;
    const o=audioCtx.createOscillator(),v=audioCtx.createGain();
    o.frequency.value=strong?90:220;o.type=strong?'sine':'square';
    v.gain.setValueAtTime(strong?0.5:0.15,t);v.gain.exponentialRampToValueAtTime(0.001,t+(strong?0.22:0.06));
    o.connect(v);v.connect(audioCtx.destination);o.start(t);o.stop(t+(strong?0.24:0.08));
   }catch(e){}
  }

  const battle=params.opponent||null;
  const duet=params.duet||null;
  const roundMs0=1500;
  const runMs=battle?(battle.rounds||3)*20000:60000;

  let state={combo:0,score:0,chainWord:norm(pickStartWord(params.seedWords,params.pool,rng))};
  let best=savedProgress.best||0,bestCombo=savedProgress.bestCombo||0;
  let today=params.day||null;
  let dailyHooks=(savedProgress.hookDay===today?(savedProgress.hookCount||0):0);
  let hookAwardedThisRun=false;
  let choices=buildChoices(state.chainWord,rng,{combo:state.combo,pool:params.pool,seedWords:params.seedWords});
  let roundStart=performance.now();
  let roundMs=roundMs0;
  let startTime=performance.now();
  let flashUntil=0,flashColor=null,flashMsg='';
  let multiPending=null; // {word, until}
  let ended=false,paused=false;
  let battleRound=0,battleScore=0,battleTargetShown=battle?battle.target||500:0,battleRounds=[],betweenRounds=false,betweenUntil=0,betweenText='';
  let duetTurn='PLAYER',duetUntil=0,duetLog=[];
  let nodPhase=0;

  function layoutChoices(){
   const cols=2,rows=2,cw=118,ch=54,gx=10,gy=190;
   choices.forEach((c,i)=>{c.x=gx+(i%2)*(cw+10);c.y=gy+Math.floor(i/2)*(ch+10);c.w=cw;c.h=ch;});
  }
  layoutChoices();

  function newRound(word){
   state.chainWord=norm(word);
   choices=buildChoices(state.chainWord,rng,{combo:state.combo,pool:params.pool,seedWords:params.seedWords});
   layoutChoices();
   roundStart=performance.now();
   roundMs=Math.max(650,roundMs0/speedFor(state.combo));
   beat(true);
  }

  function awardHook(){
   if(hookAwardedThisRun)return;
   if(today&&dailyHooks>=3)return;
   hookAwardedThisRun=true;dailyHooks++;
   ctx.reward({hooks:[{word:state.chainWord,fromMemory:params.memoryRef||null}]});
   ctx.saveProgress({hookDay:today,hookCount:dailyHooks});
  }

  function onCorrect(res,tappedType){
   flashUntil=performance.now()+260;flashColor=res.punchline?P.palette.gold:P.palette.green;
   flashMsg=res.punchline?'+1000 PUNCHLINE':(res.multi?`+${res.points} MULTI x2`:`+${res.points}`);
   if(state.combo>bestCombo)bestCombo=state.combo;
   if(state.score>best)best=state.score;
   if(state.combo===15)awardHook();
   beat(state.combo%4===0);
   if(battle)battleScore=state.score;
  }
  function onWrong(){
   flashUntil=performance.now()+220;flashColor=P.palette.red;flashMsg='OFF BEAT';
   multiPending=null;
  }

  function handleTap(word,type){
   const now=performance.now();
   let opts={pool:params.pool};
   if(multiPending&&multiPending.word!==word&&now<=multiPending.until){
    const otherIsCorrect=choices.find(c=>c.word===word)?.correct;
    if(otherIsCorrect)opts.multi=true;
   }
   const res=scoreTap(state,word,now,opts);
   if(res.correct){
    onCorrect(res,type);
    const twoCorrect=choices.filter(c=>c.correct).length>=2;
    if(twoCorrect&&!opts.multi&&!res.punchline){
     multiPending={word,until:now+800};
     choices=choices.filter(c=>c.word!==word);
     roundStart=now;roundMs=900;
     return;
    }
    multiPending=null;
    newRound(res.chainWord);
   } else {
    onWrong();
    newRound(state.chainWord);
   }
  }

  function pointerDown(ev){
   if(ended||paused||betweenRounds)return;
   if(duet&&duetTurn!=='PLAYER')return;
   const t=ev.touches?ev.touches[0]:ev;
   const p=toNative(t.clientX,t.clientY);
   for(const c of choices){
    if(p.x>=c.x&&p.x<=c.x+c.w&&p.y>=c.y&&p.y<=c.y+c.h){handleTap(c.word,c.type);break;}
   }
   if(p.x<=34&&p.y<=20){muted=!muted;return;}
  }
  canvas.addEventListener('pointerdown',pointerDown);

  // duet auto-play
  function duetTick(now){
   if(!duet)return;
   if(duetTurn==='PLAYER'&&now>duetUntil){
    duetTurn='PARTNER';duetUntil=now+10000;
   } else if(duetTurn==='PARTNER'){
    if(now>duetUntil){duetTurn='PLAYER';duetUntil=now+10000;duetLog=[];return;}
    if(!duetTurn._last||now-duetTurn._last>1100){
     const skillGood=duet.partner==='JUNE';
     const success=rng()<(skillGood?0.85:0.35);
     const lines=PARTNER_LINES[duet.partner]||PARTNER_LINES.TRISTAN;
     duetLog=[pick(lines,rng)];
     if(success){
      const fam=familyOf(state.chainWord)||pick(Object.keys(ACTIVE.families),rng);
      const w=pick((ACTIVE.families[fam]||[]).filter(x=>norm(x)!==state.chainWord),rng);
      if(w){state.combo++;state.score+=100*state.combo;state.chainWord=norm(w);}
     } else state.combo=0;
     choices=buildChoices(state.chainWord,rng,{combo:state.combo,pool:params.pool});layoutChoices();
    }
   }
  }

  function endBattleRoundIfNeeded(now){
   if(!battle)return;
   const elapsedRound=now-battleRoundStart;
   if(elapsedRound>=20000&&!betweenRounds){
    const target=Math.round((battle.target||500)*(1+battleRound*0.15));
    battleRounds.push({round:battleRound+1,score:battleScore,target,won:battleScore>=target});
    battleRound++;
    if(battleRound>=(battle.rounds||3)){finishRun();return;}
    betweenRounds=true;betweenUntil=now+2200;betweenText=pick(SNACKS,rng);
    battleScore=0;state.combo=0;
   }
   if(betweenRounds&&now>=betweenUntil){betweenRounds=false;battleRoundStart=now;newRound(state.chainWord);}
  }
  let battleRoundStart=performance.now();

  function finishRun(){
   if(ended)return;ended=true;
   ctx.saveProgress({best,bestCombo,hookDay:today,hookCount:dailyHooks});
   showEndCard();
  }

  let endCardEl=null;
  function showEndCard(){
   const div=document.createElement('div');
   div.style.cssText='position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;background:rgba(8,7,15,.92);color:#f6efd9;font-family:"Press Start 2P",monospace;text-align:center;padding:0 20px;z-index:6';
   let lines=`<div style="font-size:14px;color:#c18b3c">${battle?(battleRounds.filter(r=>r.won).length>battleRounds.length/2?'YOU WIN':'IRON JAW WINS'):'RUN DONE'}</div>`;
   lines+=`<div style="font-size:10px">SCORE ${state.score}</div>`;
   lines+=`<div style="font-size:8px">BEST ${best}</div>`;
   if(params.ironJawDaily)lines+=`<div style="font-size:7px;color:#d7193f">IRON JAW POSTED ${Math.round(params.ironJawDaily)}</div>`;
   if(params.lauraDaily)lines+=`<div style="font-size:7px;color:#3d9ddd">LAURA — ${params.lauraDaily.toLocaleString?params.lauraDaily.toLocaleString():params.lauraDaily}</div>`;
   div.innerHTML=lines;
   const btnRow=document.createElement('div');btnRow.style.cssText='display:flex;gap:8px;margin-top:6px';
   const again=document.createElement('button');again.textContent='RUN IT BACK';again.style.cssText='font:8px "Press Start 2P";padding:.7em .9em;background:#f6efd9;color:#10101b;border:2px solid #10101b;box-shadow:2px 2px #7d194b;cursor:pointer';
   again.addEventListener('click',()=>{root.removeChild(div);restart();});
   const done=document.createElement('button');done.textContent='DONE';done.style.cssText=again.style.cssText;
   done.addEventListener('click',()=>{
    ctx.finish({outcome:battle?(battleRounds.filter(r=>r.won).length>battleRounds.length/2?'win':'lose'):'done',score:state.score,
     data:{bestCombo,hook:hookAwardedThisRun,battleRounds}});
   });
   btnRow.append(again,done);div.append(btnRow);
   root.append(div);endCardEl=div;
  }
  function restart(){
   ended=false;hookAwardedThisRun=false;
   state={combo:0,score:0,chainWord:norm(pickStartWord(params.seedWords,params.pool,rng))};
   startTime=performance.now();battleRound=0;battleScore=0;battleRoundStart=performance.now();battleRounds=[];betweenRounds=false;
   newRound(state.chainWord);
  }

  // ---------- render ----------
  function drawChoiceChip(c,now){
   const bob=Math.sin(now/220+c.x)*2;
   const y=c.y+bob;
   const consumed=multiPending&&multiPending.word===c.word;
   const col=consumed?'#3a3550':(c.type==='punchline'?'#c18b3c':'#f6efd9');
   P.frame(g,c.x,y,c.w,c.h,{fill:col,border:'#10101b',accent:c.type==='curveball'?P.palette.neon:'#7d194b'});
   P.text(g,c.word,c.x+c.w/2,y+c.h/2,{size:c.word.length>7?7:9,align:'center',baseline:'middle',color:'#10101b'});
  }
  function frame(){
   if(dispose_extra.__stopped)return;
   const now=performance.now();
   g.clearRect(0,0,270,480);
   const pulse=0.5+0.5*Math.sin(now/(260-Math.min(160,state.combo*6)));
   P.rect(g,0,0,270,480,P.palette.night);
   P.rect(g,0,0,270,80,`rgba(125,25,75,${0.15+pulse*0.15})`);
   nodPhase+=0.05+state.combo*0.01;
   const nodY=94+Math.sin(nodPhase)*2*(1+state.combo*0.05);
   // Frozen Rich: the on-stage (mic) state in a battle, the standing anchor otherwise; the nod stays a whole-pixel bob.
   if(!P.drawSprite?.(g,P.personSprite?.('rich',battle?'on_stage':null),40,Math.round(nodY)+382))P.drawActor(g,{top:'#1b1824',bottom:'#111018',hair:'#0b0a12',hairShape:'locs',shades:true,accent:P.palette.blood},40,nodY+390,1.05);

   // speaker toggle
   P.frame(g,4,4,30,16,{fill:muted?'#3a3550':'#20c66b',border:'#10101b'});
   P.text(g,muted?'MUTE':'SND',19,12,{size:5,align:'center',baseline:'middle',color:'#f6efd9'});

   if(betweenRounds){
    P.text(g,'ROUND BREAK',135,120,{size:9,align:'center',color:P.palette.gold});
    P.wrap(g,betweenText,220,7).forEach((l,i)=>P.text(g,l,135,150+i*12,{size:7,align:'center',color:'#c9c0a8'}));
   } else {
    P.text(g,'CHAIN',135,96,{size:6,align:'center',color:'#c9c0a8'});
    P.text(g,state.chainWord,135,108,{size:16,align:'center',color:'#f6efd9'});
    const elapsedRound=now-roundStart;
    const pct=Math.max(0,1-elapsedRound/roundMs);
    P.rect(g,10,132,250,6,'#231f2c');P.rect(g,10,132,250*pct,6,pct>0.3?P.palette.green:P.palette.red);
    choices.forEach(c=>drawChoiceChip(c,now));
   }

   P.text(g,`SCORE ${state.score}`,8,340,{size:8,color:'#f6efd9'});
   P.text(g,`COMBO x${state.combo}`,8,354,{size:8,color:state.combo>=10?P.palette.gold:'#f6efd9'});
   P.text(g,`BEST ${best}`,8,368,{size:6,color:'#c9c0a8'});
   if(battle)P.text(g,`ROUND ${Math.min(battleRound+1,battle.rounds||3)}/${battle.rounds||3}  TARGET ${Math.round((battle.target||500)*(1+battleRound*0.15))}`,135,388,{size:6,align:'center',color:'#d7193f'});
   if(duet)P.text(g,duetTurn==='PLAYER'?'YOUR TURN':`${duet.partner}'S TURN — ${duetLog[0]||''}`,135,402,{size:6,align:'center',color:'#3d9ddd'});

   if(now<flashUntil&&flashColor){
    g.save();g.globalAlpha=0.35;P.rect(g,0,0,270,480,flashColor);g.restore();
    P.text(g,flashMsg,135,230,{size:10,align:'center',color:flashColor});
   }
   if(!ended){
    if(!betweenRounds&&multiPending&&now>multiPending.until){multiPending=null;newRound(state.chainWord);}
    if(duet)duetTick(now);
    if(battle)endBattleRoundIfNeeded(now);
    else if(now-startTime>=runMs)finishRun();
   }
   raf=requestAnimationFrame(frame);
  }
  let raf=requestAnimationFrame(frame);

  return {
   dispose(){
    dispose_extra.__stopped=true;
    cancelAnimationFrame(raf);
    canvas.removeEventListener('pointerdown',pointerDown);
    dispose_extra.forEach(f=>{try{f();}catch(e){}});
   }
  };
 }

 window.RAMinigames.register('bars',{title:'BARS',mount});
})();
