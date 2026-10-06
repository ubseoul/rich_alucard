import {open} from '../rc2/harness.mjs';
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
const out=process.env.RA_B5_EVIDENCE||'docs/rc4/evidence/B5';fs.mkdirSync(out,{recursive:true});
const h=await open({width:390,height:844,dir:process.env.RA_B5_DIR?path.resolve(process.env.RA_B5_DIR):undefined,query:'?mute=1'}),p=h.page;
const report={kind:'focused seeded combat fixtures; registry coverage is not natural reachability',platform:'Windows installed Chrome / Playwright',errors:h.errors,moves:[],signatures:[],music:[]};
try{
 await p.locator('#startButton').click();await p.waitForFunction(()=>!!window.RAEnemyFX);
 await p.evaluate(()=>{RAAdventures.abandon();void RAOgunRave.fight();});await p.waitForTimeout(400);
 report.rave=await p.evaluate(()=>({moves:Object.keys(RACombatData.ENEMIES.blad33ee.moves),art:RACombatData.enemyArt('blad33ee')}));assert(report.rave.moves.includes('bolt'));
 await p.evaluate(()=>RACombat2.active()?.abort());
 await p.evaluate(async()=>{document.querySelector('#victoryOverlay').classList.add('on');const e=document.querySelector('#endingText');e.textContent='RICH STAYS ON THE THRONE.';e.classList.add('on');await RAScenes.go('battle');await RAScenes.go('bedroom');});assert.equal(await p.locator('#endingText').textContent(),'');assert.equal(await p.locator('#victoryOverlay').evaluate(e=>e.classList.contains('on')),false);report.throneCleanup='PASS';await p.evaluate(async()=>{RAAdventures.abandon();RALife.setFlag('ogunsRaveCompleted',true);RARC3.patch({story:false});RAAdventures.get('NEW_OGA_M1').testSetup?.({RAState,RALife});RAAdventures.start('NEW_OGA_M1',{from:'dev'});await RAAdventureScene.resume();});await p.locator('.adv-title').waitFor({state:'visible'});await p.locator('.adv-title').click();report.thronePointer='actual title pointer click after seeded legacy exit; full natural CEO no-steal regression assigned coordinator';await p.evaluate(()=>RAAdventures.abandon());
 const cards=await p.evaluate(()=>Object.keys(RACombatData.ENEMIES).filter(id=>id!=='f15_roxy_spar'));
 for(const enemyId of cards){
  await p.evaluate(id=>{void RACombat2.run(id,{env:'street_night'});},enemyId);await p.waitForTimeout(110);
  const moves=await p.evaluate(id=>Object.keys(RACombatData.ENEMIES[id].moves),enemyId);
  for(const moveId of moves){
   const row=await p.evaluate(async({enemyId,moveId})=>{
    const root=document.querySelector('.c2-scene'),attacker=root.querySelector('.c2-enemy'),target=root.querySelector('.c2-rich'),frames=[],poses=[];
    // Observe the actual active drawn canvas without replacing presentation helpers.
    const interval=setInterval(()=>{const c=root.querySelector('.rc2-enemy-fx');if(c&&!frames.some(x=>x.frame===+c.dataset.frame)){frames.push({frame:+c.dataset.frame,pixels:c.toDataURL()});poses.push({frame:+c.dataset.frame,src:attacker.getAttribute('src'),pose:attacker.dataset.movePose||null});}},8);
    await RAEnemyFX.attack({root,enemyId,moveId,dmg:RACombatData.ENEMIES[enemyId].moves[moveId].dmg,attacker,target});clearInterval(interval);
    return {enemyId,moveId,frames,poses,fx:RAEnemyFX.specFor(enemyId,moveId,RACombatData.ENEMIES[enemyId].moves[moveId].dmg),phase:root.dataset.enemyPhase};
   },{enemyId,moveId});
   const hashes=row.frames.map(f=>({frame:f.frame,sha256:createHash('sha256').update(Buffer.from(f.pixels.split(',')[1],'base64')).digest('hex')}));
   row.distinctDrawnFrames=new Set(hashes.map(x=>x.sha256)).size;assert(row.distinctDrawnFrames>=2,`${enemyId}:${moveId}`);
   for(const frame of row.frames.filter(x=>[1,4,6,9].includes(x.frame)))fs.writeFileSync(`${out}/${enemyId}-${moveId}-fx-${frame.frame}.png`,Buffer.from(frame.pixels.split(',')[1],'base64'));
   delete row.frames;row.captures=[1,4,6,9].filter(f=>hashes.some(x=>x.frame===f)).map(f=>`${enemyId}-${moveId}-fx-${f}.png`);row.frameHashes=hashes;report.moves.push(row);
  }
  await p.screenshot({path:`${out}/combat-${enemyId}-390.png`});await p.evaluate(()=>RACombat2.active()?.abort());
 }
 await p.evaluate(()=>{void RACombat2.run('smallie',{env:'street_night'});});await p.waitForTimeout(300);
 await p.locator('[data-c2="fight"]').click();assert(await p.locator('.c2-btn small').first().isVisible());assert.equal(await p.locator('.c2-hp span').first().evaluate(e=>getComputedStyle(e).visibility),'visible');
 for(const id of ['blood','bite','revenge']){
  const record=await p.evaluate(async id=>{const root=document.querySelector('.c2-scene'),frames=[];const timer=setInterval(()=>{frames.push({time:performance.now(),assets:[...root.querySelectorAll('.c2-approved-fx img')].map(x=>x.getAttribute('src'))});},25);RACombatPresentation.move({root,attacker:root.querySelector('.c2-rich'),target:root.querySelector('.c2-enemy'),action:{type:'move',id},events:[]});await new Promise(r=>setTimeout(r,780));clearInterval(timer);return {id,frames};},id);report.signatures.push(record);
 }
 await p.locator('[data-c2="move:blood"]').click();await p.waitForTimeout(2400);await p.screenshot({path:`${out}/real-blood-action-390.png`});
 await p.setViewportSize({width:1280,height:900});await p.waitForTimeout(120);await p.screenshot({path:`${out}/combat-desktop.png`});await p.evaluate(()=>RACombat2.active()?.abort());
 for(const track of await p.evaluate(()=>RARadio.TRACKS)){
  if(!track.file){report.music.push({id:track.id,status:'NO_MASTER'});continue;}
  const row=await p.evaluate(async track=>{const ctx=new AudioContext(),buf=await ctx.decodeAudioData(await (await fetch(track.file)).arrayBuffer());const data=buf.getChannelData(0);let energy=0,peak=0;for(let i=0;i<data.length;i+=100){energy+=data[i]*data[i];peak=Math.max(peak,Math.abs(data[i]));}await ctx.close();const a=document.querySelector('#soundtrack');RAMusicLibrary.play(track.id);await a.play().catch(()=>{});await new Promise(r=>setTimeout(r,250));if(a.paused)await a.play();return {id:track.id,file:track.file,duration:buf.duration,channels:buf.numberOfChannels,sampleRate:buf.sampleRate,peak,rms:Math.sqrt(energy/(data.length/100)),playing:!a.paused,position:a.currentTime,listening:'not independently perceptually reviewed'};},track);
  assert(row.duration>0&&row.peak>0&&row.playing);report.music.push(row);
 }

 await p.setViewportSize({width:390,height:844});
 // Actual stage captures keep the accepted 80x96 anchors/facing in view through action and recovery.
 for(const enemyId of ['smallie','smallie_cousin','gbenga']){
  await p.evaluate(id=>{void RACombat2.run(id,{env:'street_night'});},enemyId);await p.waitForTimeout(200);
  const moves=await p.evaluate(id=>Object.keys(RACombatData.ENEMIES[id].moves),enemyId);
  for(const moveId of moves)for(const frame of [1,4,9]){
   await p.evaluate(({enemyId,moveId,frame})=>{const root=document.querySelector('.c2-scene');void RAEnemyFX.attack({root,enemyId,moveId,dmg:RACombatData.ENEMIES[enemyId].moves[moveId].dmg,attacker:root.querySelector('.c2-enemy'),target:root.querySelector('.c2-rich'),freeze:frame});},{enemyId,moveId,frame});
   await p.waitForTimeout(90);await p.screenshot({path:`${out}/stage-${enemyId}-${moveId}-frame${frame}.png`});await p.waitForTimeout(620);
  }
  await p.evaluate(()=>RACombat2.active()?.abort());
 }
 const transitions=await p.evaluate(async()=>{
  const a=document.querySelector('#soundtrack');RAMusicLibrary.play('montana');await a.play();await new Promise(r=>{a.addEventListener('seeked',r,{once:true});a.currentTime=8;});const before={src:a.getAttribute('src'),time:a.currentTime};
  void RACombat2.run('gbenga',{env:'street_night'});await new Promise(r=>setTimeout(r,160));const cue={track:a.dataset.track,src:a.getAttribute('src')};RACombat2.active().abort();await new Promise(r=>setTimeout(r,220));const after={src:a.getAttribute('src'),time:a.currentTime};
  RAMusicLibrary.play('playmakers',{pin:true});await a.play();const pinned=a.getAttribute('src');void RACombat2.run('smallie',{env:'street_night'});await new Promise(r=>setTimeout(r,100));const retained=a.getAttribute('src');RACombat2.active().abort();RAMusicLibrary.unpin();return {before,cue,after,pinned,retained};
 });assert(transitions.before.time>=7.9);assert.equal(transitions.cue.track,'oxblood');assert.equal(transitions.before.src,transitions.after.src);assert(Math.abs(transitions.after.time-transitions.before.time)<1);assert.equal(transitions.pinned,transitions.retained);report.transitions=transitions;
 await p.evaluate(()=>{void RACombat2.run('f15_roxy_spar',{spar:true,noPenalty:true,env:'f15_gym'});});await p.waitForTimeout(200);
 assert.equal(await p.locator('[data-c2^="move:"]').count(),0);await p.locator('[data-c2="spar:guard"]').click();await p.waitForTimeout(2100);assert(await p.evaluate(()=>RACombat2.active().state.rich.hp>=1));await p.locator('[data-c2="run"]').click();await p.waitForTimeout(600);assert.equal(await p.locator('.c2-scene').count(),0);report.spar='guard + quit no lethal controls';
 report.ok=h.errors.length===0;assert(report.ok,JSON.stringify(h.errors));
}finally{fs.writeFileSync(`${out}/browser.json`,JSON.stringify(report,null,2)+'\n');await h.close();}
