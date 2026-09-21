const revengeShade=document.querySelector('#revengeShade'),revengeStoredText=document.querySelector('#revengeStoredText'),revengeMass=document.querySelector('#revengeMass'),revengeImpact=document.querySelector('#revengeImpact');
const octopusOverlay=document.querySelector('#octopusOverlay'),octoRoll=document.querySelector('#octoRoll');
const victoryOverlay=document.querySelector('#victoryOverlay'),victoryCard=document.querySelector('#victoryCard'),endingText=document.querySelector('#endingText'),stealYes=document.querySelector('#stealYes'),stealNo=document.querySelector('#stealNo');
const productionCEO=document.querySelector('#productionCEO');
const productionAssistant=document.querySelector('#productionAssistant');
function setCEOState(s){if(productionCEO)productionCEO.className='production-ceo state-'+s;}
function setAssistantState(s){if(productionAssistant)productionAssistant.className='production-assistant state-'+s;}

function setRichState(state){
  if(!geminiRich) return;
  geminiRich.className='gemini-rich state-'+state;
  if(window.RADevState)window.RADevState.richState=state;
}
const geminiRich=document.querySelector('#geminiRich');

const audio=document.querySelector('#soundtrack');
const overlay=document.querySelector('#startOverlay');
const start=document.querySelector('#startButton');
const toast=document.querySelector('#toast');
const battleUI=document.querySelector('#battleUI');
const attackLayer=document.querySelector('#attackLayer');
const richCast=document.querySelector('#richCast');
const bloodFlash=document.querySelector('#bloodFlash');
const projectiles=document.querySelector('#projectiles');
const enemyHit=document.querySelector('#enemyHit');
const bloodBurst=document.querySelector('#bloodBurst');
const damageNumber=document.querySelector('#damageNumber');
const hitShade=document.querySelector('#hitShade');
const bloodCurtain=document.querySelector('#bloodCurtain');
const impactCore=document.querySelector('#impactCore');
const ceoRecoil=document.querySelector('#ceoRecoil');
const briefcaseProjectile=document.querySelector('#briefcaseProjectile');
const briefcaseImpact=document.querySelector('#briefcaseImpact');
const richHit=document.querySelector('#richHit');
const richBar=document.querySelector('#richHPBar');
const ceoBar=document.querySelector('#ceoHPBar');
const richText=document.querySelector('#richHPText');
const ceoText=document.querySelector('#ceoHPText');
const choiceOverlay=document.querySelector('#choiceOverlay');
const choiceTitle=document.querySelector('#choiceTitle');
const choiceYes=document.querySelector('#choiceYes');
const choiceNo=document.querySelector('#choiceNo');
const mainButtons=[...document.querySelectorAll('[data-main]')];
const moves=[...document.querySelectorAll('[data-move]')];
const MUSIC_START=15;
const MAX_HP=100;
let richHP=100,ceoHP=100,mainIndex=0,moveIndex=0,inMoves=false,busy=false,battleOver=false,revengeStored=0,lastRichHP=100,lastCeoHP=100;
window.RADevState={scene:'battle',richState:'idle',revengeStoredDamage:0};

const moveData={
 blood:{name:'BLOOD BATH',damage:26},
 octopus:{name:'OCTOPUS BRAIN',damage:18},
 bite:{name:'VAMPIRE BITE',damage:38},
 revenge:{name:'REVENGE',damage:0}
};
function wait(ms){return new Promise(r=>setTimeout(r,ms))}
function say(msg,ms=900){toast.textContent=msg;toast.classList.add('show');clearTimeout(say.t);say.t=setTimeout(()=>toast.classList.remove('show'),ms)}
function clamp(v){return Math.max(0,Math.min(MAX_HP,v))}
function updateHP(){
 richHP=clamp(richHP);ceoHP=clamp(ceoHP);
 richBar.style.width=richHP+'%';ceoBar.style.width=ceoHP+'%';
 richText.textContent=`${richHP}/100`;ceoText.textContent=`${ceoHP}/100`;
  if(richHP<lastRichHP)richText.classList.remove('drain'),void richText.offsetWidth,richText.classList.add('drain');
  if(ceoHP<lastCeoHP)ceoText.classList.remove('drain'),void ceoText.offsetWidth,ceoText.classList.add('drain');
  lastRichHP=richHP;lastCeoHP=ceoHP;
}
function paint(){
 mainButtons.forEach((b,i)=>b.classList.toggle('selected',!inMoves&&i===mainIndex));
 moves.forEach((b,i)=>b.classList.toggle('active',inMoves&&i===moveIndex));
 if(inMoves&&!busy)moves[moveIndex].focus();
}
function resetBattle(){
 richHP=100;ceoHP=100;revengeStored=0;battleOver=false;busy=false;inMoves=false;mainIndex=0;moveIndex=0;
 window.RADevState.revengeStoredDamage=0;
 lastRichHP=richHP;lastCeoHP=ceoHP;
 choiceOverlay.classList.remove('show');battleUI.classList.remove('attack-mode');updateHP();paint();
}
function activateMain(){
 if(busy||battleOver)return;
 const id=mainButtons[mainIndex].dataset.main;
 if(id==='fight'){inMoves=true;paint()}
 else say('NOT AVAILABLE YET.');
}
function pressFeedback(node){if(!node)return;node.classList.remove('pressed');void node.offsetWidth;node.classList.add('pressed');setTimeout(()=>node.classList.remove('pressed'),150)}
async function hitStop(ms=70){const screen=document.querySelector('#screen');screen.classList.add('hit-stop');await wait(ms);screen.classList.remove('hit-stop')}
async function projectileVolley(){battleUI.classList.add('attack-mode');attackLayer.classList.add('active');richCast.classList.add('cast');say('BLOOD BATH!',420);await wait(150);const lanes=[35,40,45,32,43,38],starts=[22,27,23,30,26,32];for(let i=0;i<6;i++){const o=document.createElement('div');o.className='detailed-blood-missile';o.style.left=starts[i]+'%';o.style.top=lanes[i]+'%';o.style.setProperty('--row',`${-i*24}px`);o.style.setProperty('--delay',`${i*70}ms`);o.style.setProperty('--flight',`${420+(i%3)*30}ms`);projectiles.appendChild(o);for(let t=1;t<=2;t++){const g=document.createElement('div');g.className='missile-ghost';g.style.left=starts[i]+'%';g.style.top=lanes[i]+'%';g.style.setProperty('--row',`${-i*24}px`);g.style.setProperty('--delay',`${i*70+t*34}ms`);g.style.setProperty('--flight',`${420+(i%3)*30}ms`);g.style.setProperty('--ghost',`${.22/t}`);projectiles.appendChild(g);}}projectiles.classList.add('charge-orbs');await wait(310);projectiles.classList.remove('charge-orbs');setRichState('cast');setCEOState('hit');projectiles.classList.add('fire-orbs');for(let i=0;i<6;i++){await wait(i===0?355:74);const q=document.createElement('div');q.className='detailed-impact';q.style.top=`${31+(i%4)*3.4}%`;projectiles.appendChild(q);const s=document.querySelector('#screen');s.classList.remove('micro-shake');void s.offsetWidth;s.classList.add('micro-shake');setTimeout(()=>q.remove(),430);}document.querySelector('#screen').classList.add('blood-shake');enemyHit.classList.add('hit');ceoRecoil.classList.add('active');damageNumber.classList.add('show');await wait(390);document.querySelector('#screen').classList.remove('blood-shake','micro-shake');enemyHit.classList.remove('hit');ceoRecoil.classList.remove('active');damageNumber.classList.remove('show');projectiles.classList.remove('fire-orbs');setRichState('idle');if(typeof ceoHP==='undefined'||ceoHP>0)setCEOState('idle');projectiles.replaceChildren();richCast.classList.remove('cast');await wait(70);attackLayer.classList.remove('active');battleUI.classList.remove('attack-mode');}

async function revengeFX(amount){
  const stage=document.querySelector('#screen');
  battleUI.classList.add('attack-mode'); attackLayer.classList.add('active');
  revengeStoredText.textContent=`-${amount}`;
  revengeShade.classList.remove('on');revengeStoredText.classList.remove('on');
  void revengeShade.offsetWidth;
  revengeShade.classList.add('on');revengeStoredText.classList.add('on');
  await wait(260);
  revengeMass.classList.remove('fire','gather');void revengeMass.offsetWidth;revengeMass.classList.add('gather');
  await wait(320);
  revengeMass.classList.remove('gather');void revengeMass.offsetWidth;revengeMass.classList.add('fire');
  await wait(300);
  setCEOState('hit');
  revengeImpact.classList.remove('hit');void revengeImpact.offsetWidth;revengeImpact.classList.add('hit');
  await hitStop(75);
  stage.classList.add('revenge-shake');
  await wait(250);
  stage.classList.remove('revenge-shake');
  attackLayer.classList.remove('active');battleUI.classList.remove('attack-mode');
}



async function normalVictory(){
  if(battleOver) return;
  battleOver=true; busy=true;
  if(window.RAState) RAState.patch('encounters.ceo_prince.defeated',true);
  setCEOState('defeated');
  say('CEO DEFEATED.',700);
  await wait(800);
  victoryOverlay.classList.add('on');
  victoryCard.style.display='block';
  endingText.classList.remove('on');

  return new Promise(resolve=>{
    stealYes.onclick=async()=>{
      stealYes.onclick=stealNo.onclick=null;
      if(window.RACharacterSystem) RACharacterSystem.mark('ceo_assistant_001','stolen',true);
      if(window.RAState) RAState.patch('encounters.ceo_prince.completed',false);
      victoryCard.style.display='none';
      victoryOverlay.classList.remove('on');
      document.querySelector('.battle-ui')?.classList.add('victory-retract');
      if(window.RACharacterReveal) await RACharacterReveal.open();
      resolve();
    };
    stealNo.onclick=async()=>{
      stealYes.onclick=stealNo.onclick=null;
      if(window.RAState) RAState.patch('encounters.ceo_prince.completed',true);
      victoryCard.style.display='none';
      endingText.textContent='RICH STAYS ON THE THRONE.';
      endingText.classList.add('on');
      resolve();
    };
  });
}

function octopusBrainFX(){
  return new Promise(resolve=>{
    octopusOverlay.classList.remove('choosing-away');
    octopusOverlay.classList.add('on');
    octoRoll.classList.remove('on');
    const buttons=[...octopusOverlay.querySelectorAll('[data-octo]')];
    const cleanup=()=>buttons.forEach(b=>b.onclick=null);
    buttons.forEach(b=>b.onclick=async()=>{
      cleanup();
      const kind=b.dataset.octo;
      octopusOverlay.classList.add('choosing-away');
      const need=12;
      const roll=1+Math.floor(Math.random()*20);
      octoRoll.classList.add('on');
      octoRoll.innerHTML=`${kind==='hoe'?'CHARISMA':kind==='squad'?'RECRUIT':'ROAST'} CHECK<br>NEED: ${need}<br><br>ROLLING...`;
      await wait(550);
      octoRoll.innerHTML+=`<br><b>${roll}</b>`;
      await wait(450);
      const success=roll>=need;
      octoRoll.innerHTML+=`<br>${success?'SUCCESS':'FAILED'}`;
      await wait(600);
      octopusOverlay.classList.remove('on','choosing-away');
      octoRoll.classList.remove('on');
      resolve({kind,success,roll});
    });
  });
}

async function resolveOctopus(result){
  if(!result.success){
    say(result.kind==='hoe'?'SHE IS NOT IMPRESSED.':result.kind==='squad'?'CEO SAYS NO.':'THE ROAST DID NOT LAND.',800);
    return false;
  }
  if(result.kind==='hoe'){
    say('SHE JOINS RICH.',650);
    setAssistantState('walk');
    const a=document.querySelector('.production-assistant');
    if(a){a.style.transition='left 1s steps(8,end)';a.style.left='28%';}
    await wait(1050);
    setAssistantState('idle');
    return false; // combat continues
  }
  if(result.kind==='squad'){
    say('CEO JOINS THE SQUAD.',850);
    ceoHP=0; updateHP(); setCEOState('defeated');
    battleOver=true;
    return true;
  }
  say('CEO HAS HEARD ENOUGH.',850);
  const c=document.querySelector('.production-ceo');
  if(c){c.style.transition='left 1s steps(8,end)';c.style.left='115%';}
  ceoHP=0; updateHP();
  battleOver=true;
  return true;
}

async function genericPlayerFX(kind){
 battleUI.classList.add('attack-mode');attackLayer.classList.add('active');richCast.classList.add('cast');
 if(kind==='bite') document.querySelector('#screen').classList.add('bite-flash');
 else if(kind==='octopus') document.querySelector('#screen').classList.add('brain-flash');
 else document.querySelector('#screen').classList.add('revenge-flash');
 await wait(320);enemyHit.classList.add('hit');await hitStop(65);await wait(220);enemyHit.classList.remove('hit');
 document.querySelector('#screen').classList.remove('bite-flash','brain-flash','revenge-flash');richCast.classList.remove('cast');attackLayer.classList.remove('active');battleUI.classList.remove('attack-mode');
}
async function enemyTurn(){
 if(battleOver)return;
 await wait(360);
 say('BRIEFCASE THROW!',620);
 attackLayer.classList.add('active');
 battleUI.classList.add('attack-mode');
 ceoRecoil.classList.add('windup');
 await wait(220);
 ceoRecoil.classList.remove('windup');
 briefcaseProjectile.classList.add('fly');
 await wait(430);
 document.querySelector('#screen').classList.add('briefcase-shake');
 setRichState('hit');richHit.classList.add('active');
 briefcaseImpact.classList.add('active');
 await hitStop(70);
 await wait(90);
 const dmg=16;
 const actualDamage=Math.min(richHP,dmg);
 richHP-=actualDamage;revengeStored+=actualDamage;window.RADevState.revengeStoredDamage=revengeStored;updateHP();
 await wait(260);
 document.querySelector('#screen').classList.remove('briefcase-shake');
 richHit.classList.remove('active');setRichState('idle');
 briefcaseImpact.classList.remove('active');
 briefcaseProjectile.classList.remove('fly');
 attackLayer.classList.remove('active');
 battleUI.classList.remove('attack-mode');
 say(`RICH TOOK ${actualDamage} DAMAGE.`,650);
 await wait(600);
 if(richHP<=0){return defeat()}
 busy=false;inMoves=true;paint();
}
async function activateMove(){
 if(busy||battleOver)return;
 busy=true;
 const id=moves[moveIndex].dataset.move;
 const m=moveData[id];
 if(id==='revenge'){
   say('REVENGE!',500);await genericPlayerFX('revenge');
   const dmg=Math.max(0,revengeStored);ceoHP-=dmg;revengeStored=0;window.RADevState.revengeStoredDamage=0;updateHP();say(dmg>0?`${dmg} DAMAGE REFLECTED.`:'NOTHING TO RETURN.',700);
 }else{
   say(m.name+'!',500);
   if(id==='blood')await projectileVolley();
   else if(id==='bite'){
     const rich=document.querySelector('.gemini-rich'),stage=document.querySelector('#screen');
     battleUI.classList.add('attack-mode');attackLayer.classList.add('active');
     if(rich)rich.style.opacity='0';
     biteTrail.classList.remove('flash');void biteTrail.offsetWidth;biteTrail.classList.add('flash');
     await wait(150);
     richBiteSprite.classList.add('active');
     await wait(140);
     setCEOState('hit');
     biteImpact.classList.remove('flash');void biteImpact.offsetWidth;biteImpact.classList.add('flash');
     stage.classList.add('bite-shake');
     await hitStop(75);await wait(180);
     stage.classList.remove('bite-shake');
     richBiteSprite.classList.remove('active');
     await wait(80);
     if(rich)rich.style.opacity='1';
     attackLayer.classList.remove('active');battleUI.classList.remove('attack-mode');
     ceoHP-=24;richHP=Math.min(MAX_HP,richHP+18);updateHP();
     healFloat.classList.remove('show');void healFloat.offsetWidth;healFloat.classList.add('show');
     say('24 DAMAGE. +18 HP.',700);
     await wait(250);
   }else if(id==='octopus'){
     const result=await octopusBrainFX();
     const ended=await resolveOctopus(result);
     if(ended){if(ceoHP<=0){battleOver=false;await normalVictory();}busy=false;return;}
   }else if(id==='revenge'){
     const reflected=Math.max(0,revengeStored);
     await revengeFX(reflected);
     ceoHP-=reflected;
     revengeStored=0;window.RADevState.revengeStoredDamage=0;
     updateHP();
     if(ceoHP<=0){await normalVictory();busy=false;return;}
     say(reflected>0?`${reflected} DAMAGE RETURNED.`:'NOTHING TO RETURN.',750);
     await wait(250);
   }else await genericPlayerFX(id);
   if(id!=='bite'&&id!=='revenge'&&id!=='octopus'){
     ceoHP-=m.damage;updateHP();say(`${m.damage} DAMAGE.`,650);
     if(ceoHP<=0){await normalVictory();busy=false;return;}
   }
 }
 await wait(650);
 if(ceoHP<=0){await normalVictory();busy=false;return;}
 await enemyTurn();
}
async function victory(){
  // Compatibility alias: all victories now use the authored walk-off flow.
  return normalVictory();
}

async function defeat(){
 battleOver=true;busy=true;richHP=0;updateHP();battleUI.classList.add('attack-mode');say('UGH. WE LOST AGAIN.',1300);
 await wait(1400);choiceTitle.textContent='RESPAWN HUNGOVER?';choiceYes.textContent='▶ YES';choiceNo.textContent='STAY DEAD';choiceOverlay.classList.add('show');
}
choiceYes.addEventListener('click',async()=>{
 if(richHP<=0){choiceOverlay.classList.remove('show');resetBattle();say('RICH RESPAWNS HUNGOVER.',1000);return}
 choiceOverlay.classList.remove('show');say('SHE IS A VAMPIRE NOW.',1100);await wait(1150);say('RICH + ASSISTANT WALK OFF →',1500);
});
choiceNo.addEventListener('click',()=>{
 if(richHP<=0){say('NOT A VERY LONG GAME.',900);return}
 choiceOverlay.classList.remove('show');say('RICH LETS HER WALK.',1000);
});
// Audio playback and lyric synchronization.
// HTML native `loop` is intentionally disabled. This code owns the loop.
const LOOP_START = MUSIC_START;
const LOOP_END_PADDING = 0.025;
const LYRIC_LEAD = 0.35;
let loopEnd = 45.80;
let lastRichLyric = -1;

const richLyricBubble=document.querySelector('#richLyricBubble');
const richLyricLines=[
  [15.932,'cali hoes'],
  [17.548,'i love cali hoes'],
  [19.39,'i love zombie hoes'],
  [21.470,'balling out of control'],
  [23.316,'cali hoes'],
  [25.507,'i love cali hoes'],
  [27.353,'i love zombie hoes'],
  [29.315,'balling out of control'],
  [32.319,'control c ya hoe'],
  [34.165,'control v ya hoe'],
  [36.011,'i might steal ya hoe'],
  [37.857,'i might steal ya hoe'],
  [39.703,'control c ya hoe'],
  [41.549,'control v ya hoe'],
  [43.395,'i might steal ya hoe'],
  [45.24,'i might steal ya hoe']
];

function resetRichLyric(){
  lastRichLyric=-1;
  if(richLyricBubble){
    richLyricBubble.textContent='';
    richLyricBubble.classList.remove('on');
  }
}

function seekToLoopStart(){
  resetRichLyric();
  audio.currentTime=LOOP_START;
}

audio.addEventListener('loadedmetadata',()=>{
  if(Number.isFinite(audio.duration)) loopEnd=audio.duration-LOOP_END_PADDING;
});
audio.addEventListener('seeking',resetRichLyric);
audio.addEventListener('ended',()=>{
  seekToLoopStart();
  audio.play().catch(()=>{});
});

start.addEventListener('click',async()=>{
  overlay.style.display='none';
  resetBattle();
  try{
    if(audio.readyState<1){
      await new Promise(resolve=>audio.addEventListener('loadedmetadata',resolve,{once:true}));
    }
    seekToLoopStart();
    await audio.play();
  }catch(e){
    console.error(e);
    say('TAP AGAIN FOR AUDIO');
  }
});

mainButtons.forEach((b,i)=>b.addEventListener('click',()=>{if(busy||battleOver)return;pressFeedback(b);mainIndex=i;inMoves=false;paint();activateMain()}));
moves.forEach((b,i)=>b.addEventListener('click',()=>{if(busy||battleOver)return;pressFeedback(b);moveIndex=i;inMoves=true;paint();activateMove()}));
window.addEventListener('keydown',e=>{
  if(overlay.style.display!=='none'&&(e.key==='Enter'||e.key===' ')){start.click();return}
  if(busy||battleOver)return;
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Enter','Escape',' '].includes(e.key))e.preventDefault();
  if(!inMoves){if(e.key==='ArrowUp')mainIndex=(mainIndex+3)%4;if(e.key==='ArrowDown')mainIndex=(mainIndex+1)%4;if(e.key==='Enter'||e.key===' ')activateMain()}
  else{if(e.key==='ArrowLeft')moveIndex=(moveIndex+3)%4;if(e.key==='ArrowRight')moveIndex=(moveIndex+1)%4;if(e.key==='Escape')inMoves=false;else if(e.key==='Enter'||e.key===' ')activateMove()}
  paint();
});

updateHP();

const richBiteSprite=document.querySelector('#richBiteSprite'),biteTrail=document.querySelector('#biteTrail'),biteImpact=document.querySelector('#biteImpact'),healFloat=document.querySelector('#healFloat');const biteSleep=ms=>new Promise(r=>setTimeout(r,ms));async function vampireBiteAttack(){const rich=document.querySelector('.gemini-rich'),stage=document.querySelector('.game')||document.querySelector('.game-shell')||document.querySelector('#game')||document.body;if(rich)rich.style.opacity='0';biteTrail.classList.remove('flash');void biteTrail.offsetWidth;biteTrail.classList.add('flash');await biteSleep(125);richBiteSprite.classList.add('active');await biteSleep(115);setCEOState('hit');biteImpact.classList.remove('flash');void biteImpact.offsetWidth;biteImpact.classList.add('flash');stage.classList.add('bite-shake');if(typeof ceoHP!=='undefined')ceoHP=Math.max(0,ceoHP-24);if(typeof richHP!=='undefined')richHP=Math.min(100,richHP+18);if(typeof updateHP==='function')updateHP();if(typeof updateBars==='function')updateBars();healFloat.classList.remove('show');void healFloat.offsetWidth;healFloat.classList.add('show');await biteSleep(210);stage.classList.remove('bite-shake');richBiteSprite.classList.remove('active');await biteSleep(90);if(rich)rich.style.opacity='1';if(typeof ceoHP!=='undefined'&&ceoHP<=0){setCEOState('defeated');setAssistantState('reaction');if(typeof victory==='function')victory();}else{setCEOState('idle');if(typeof enemyTurn==='function')setTimeout(()=>enemyTurn(),180);else if(typeof ceoTurn==='function')setTimeout(()=>ceoTurn(),180);}}

function syncRichLyrics(){
  if(!audio || audio.paused){
    richLyricBubble?.classList.remove('on');
    requestAnimationFrame(syncRichLyrics);
    return;
  }
  if(audio.currentTime>=loopEnd){
    seekToLoopStart();
    requestAnimationFrame(syncRichLyrics);
    return;
  }
  const t=audio.currentTime+LYRIC_LEAD;
  let idx=-1;
  for(let i=0;i<richLyricLines.length;i++){
    if(t>=richLyricLines[i][0]) idx=i;
    else break;
  }
  if(idx<0){
    resetRichLyric();
  }else if(idx!==lastRichLyric){
    lastRichLyric=idx;
    if(richLyricBubble){
      richLyricBubble.textContent=richLyricLines[idx][1];
      richLyricBubble.classList.add('on');
    }
  }
  requestAnimationFrame(syncRichLyrics);
}
requestAnimationFrame(syncRichLyrics);
