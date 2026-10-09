(function(){
 // LANE 7 — MUSIC (VOL 1 §9.7, VOL 3 §8): MAKE → DROP → PLAY IT OUT → WORLD REACTS → PEOPLE → (hidden) MOMENTUM.
 // A saved draft combines a real memory, an existing master and an optional BARS hook; no new audio is fabricated.
 // Missing catalog slots never unlock as audio.
 const music=()=>RAState.get().life.creativeLife.music;
 const REAL=[{type:'party',track:'playmakers'},{type:'fight',track:'bloodbath'},{type:'weird',track:'on_the_moon'},{type:'quiet',track:'montana'},{type:'mall',track:'almond_freestyle'}];
 function memoryType(m){const t=`${m.lane||''} ${m.type||''} ${m.text||''}`.toLowerCase();
  if(/party|rave|hosting|castle party|show|club/.test(t))return 'party';if(/fight|defeat|beat|combat|hilt|skeleton/.test(t))return 'fight';if(/weird|octopus|portobello|kevin|phil|god|ladder/.test(t))return 'weird';if(/mall|grave|shop|buy|bought/.test(t))return 'mall';return 'quiet';}
 function memories(){return RALife.recentMemories(10).filter(m=>!['followers'].includes(m.type));}
 function beats(){const own=RARadio.owned();return own.map(t=>({id:t.id,label:t.title}));}
 function hooks(){return (music().hooks||[]).filter(h=>!h.used).slice(-6);}
 // Title options are drafts. Ube names his songs: every option is [VP].
 function titles(mem){const words=String(mem.text||'untitled').toUpperCase().replace(/[^A-Z0-9 ']/g,'').split(' ').filter(w=>w.length>2);const core=words.slice(-2).join(' ')||'THAT NIGHT';
  return [{title:core,vp:true},{title:`${words[0]||'NIGHT'} FREESTYLE`,vp:true},{title:`THE NIGHT OF THE ${words.at(-1)||'THING'}`,vp:true}];}
 function cook({memoryId,beat,hookIndex=null,title,operationId=null}){
  const prior=(music().cooked||[]).find(s=>operationId&&s.operationId===operationId);if(prior)return {song:prior,unlocked:null};
  const master=RARadio.TRACKS.find(t=>t.id===beat&&t.file);if(!master)return null;
  const mem=memoryId?RAState.get().life.memoryLog.find(m=>m.id===memoryId):memories()[0];if(!mem)return null;
  const m={...music()};const type=memoryType(mem);let unlocked=null;
  const cookedCount=(m.cooked||[]).length;
  const hook=hookIndex!=null?hooks()[hookIndex]:null;if(hook)m.hooks=(m.hooks||[]).map(h=>h===hook||(h.word===hook.word&&h.day===hook.day)?{...h,used:true}:h);
  const song={id:`song:${RALife.today().day}:${cookedCount}`,title:title||titles(mem)[0].title,titleVp:true,operationId,trackId:master.id,masterTitle:master.title,memory:mem.text,memoryId:mem.id,type,beat:master.id,hook:hook?.word||null,quality:(mem.quality||1)+(hook?1:0),day:RALife.today().day,dropped:false};
  m.cooked=[...(m.cooked||[]),song];RAState.patch('life.creativeLife.music',m);
  RALife.setFlag('firstSongCooked',true);RALife.unlockApp('radio');RARadio.setTrack(master.id);
  RALife.light('expression',1,`cook:${song.id}`);RALife.remember({id:`cooked:${song.id}`,text:`cooked "${song.title.toLowerCase()}"`,lane:'music'});
  return {song,unlocked};
 }
 function drop(songId,where='vampgram'){const m={...music()};const song=(m.cooked||[]).find(s=>s.id===songId);if(!song||song.dropped)return false;
  m.cooked=m.cooked.map(s=>s.id===songId?{...s,dropped:true,droppedDay:RALife.today().day,where}:s);m.drops=[...(m.drops||[]),{songId,day:RALife.today().day,where,wakes:0,total:Math.round(20+Math.min(180,song.quality*45+(RALife.clout()*20)))}];
  RAState.patch('life.creativeLife.music',m);window.RAVampGram?.post?.({id:`music:release:${songId}`,songId,trackId:song.trackId,draftTitle:song.title,memoryId:song.memoryId,responseKind:'release',photoKey:'rc5_music_castle_release',photoCaption:`Draft: ${song.title}. Reference master: ${song.masterTitle||song.beat}.`,handle:'richalucard',text:`new: "${song.title.toLowerCase()}" 🩸`,likes:20});RALife.light('expression',1,`drop:${songId}`);RALife.receipt({id:`drop:${songId}`,caption:`dropped "${song.title.toLowerCase()}".`,lane:'music'});return true;}
 // Saved stages use stable IDs, including on repeated WAKE delivery or resumed saves.
 function respond(day=RALife.today().day){
  for(const pending of [...(music().drops||[])]){
   const stage=Number(pending.wakes)||0;if(stage>=3||day<=pending.day||pending.lastResponseDay===day)continue;
   const m={...music()},song=(m.cooked||[]).find(s=>s.id===pending.songId);if(!song)continue;
   const id=`music:response:${song.id}:${stage}`;if((m.responses||[]).some(r=>r.id===id))continue;
   const handle=stage===1?'iron_jaw':'tasha';
   const text=stage===0?`"${song.title}" — that ${song.hook?`"${song.hook}" hook`:'raw verse'} stayed with me. What's the story behind it?`:stage===1?`"${song.title}": you turned ${song.memory} into a verse. Bring that one to the Catacomb; let's hear it live.`:`Coming to hear "${song.title}" at the Catacomb. Put it in your set.`;
   const nominal=stage===2?pending.total-Math.round(pending.total*.5)-Math.round(pending.total*.3):Math.round(pending.total*(stage===0?.5:.3));
   const n=window.RALegendaryFollowers?.normalGain?.(nominal)??nominal;
   const response={id,songId:song.id,trackId:song.trackId||song.beat,draftTitle:song.title,title:song.title,masterTitle:song.masterTitle||RARadio.TRACKS.find(t=>t.id===song.beat)?.title||null,memoryId:song.memoryId,handle,text,responseKind:stage===1?'invitation':'release-response',day,followers:n};
   // Response ID, stage and follower award commit together: an interrupted wake cannot award twice.
   const tx=RAState.transaction(s=>{const next=s.life.creativeLife.music;if((next.responses||[]).some(r=>r.id===id))return false;
    next.responses=[...(next.responses||[]),response];next.drops=next.drops.map(d=>d.songId===song.id?{...d,wakes:stage+1,lastResponseDay:day}:d);
    s.life.resources.followers=Math.max(0,(Number(s.life.resources.followers)||0)+n);return true;});if(!tx.ok)continue;
   window.RAVampGram?.post?.(response);RALife.mail({id,kind:'music',title:handle.toUpperCase(),body:text,app:'vampgram'});
   RALife.receipt({id,caption:text,lane:'music'});
  }
 }
 RAClock.onWake('music-drops',45,({info})=>respond(info.day));
 function showResult(crowd,{id=`show:${RALife.today().day}`,songId=null,outcome='success'}={}){
  const m={...music()},prior=(m.shows||[]).find(s=>s.id===id);if(prior)return prior.pay;
  const song=(m.cooked||[]).find(s=>s.id===songId);crowd=Math.max(0,Number(crowd)||0);
  const pay=outcome==='success'?Math.min(3000,300+15*crowd):0;
  const followers=pay?(window.RALegendaryFollowers?.normalGain?.(10+Math.round(crowd/2))??(10+Math.round(crowd/2))):0;
  const entry={followers,id,receiptId:`music:${id}`,day:RALife.today().day,crowd,pay,outcome,songId:song?.id||null,title:song?.title||'Freestyle',trackId:song?.trackId||song?.beat||null,masterTitle:song?.masterTitle||null};
  m.shows=[...(m.shows||[]),entry];RAState.patch('life.creativeLife.music',m);
  if(pay){window.RAVampGram?.post?.({id:`music:performance:${id}`,songId:entry.songId,trackId:entry.trackId,draftTitle:entry.title,handle:'tasha',responseKind:'performance-success',photoKey:'rc5_music_catacomb_success',photoCaption:`${entry.title} at the Catacomb. ${entry.masterTitle||'Existing Rich master'}; the room stayed with him.`,text:`${entry.title} at the Catacomb. That last verse landed.`,likes:Math.round(crowd)});RALife.addMoney(pay);RALife.addPoints('clout',6);RALife.addPoints('rep',2);RALife.addFollowers(followers);RALife.light('expression',1,`show:${id}`);}
  RALife.receipt({id:entry.receiptId,caption:pay?`Performed "${entry.title}" at the Catacomb. ${RALife.fmt(pay)} paid.`:`"${entry.title}" set ${outcome}. No performance pay.`,lane:'music'});return pay;
 }
 function getCareer(){const m=music(),c=m.cooked||[];return {cooked:c.at(-1)||null,released:c.filter(s=>s.dropped).at(-1)||null,responses:[...(m.responses||[])],performed:(m.shows||[]).filter(s=>s.outcome==='success').at(-1)||null};}
 // BARS app: the tiny addictive game, seeded with words from Rich's recent life.
 function seedWords(){const words=new Set();for(const mm of memories())for(const w of String(mm.text).toUpperCase().split(/[^A-Z]+/))if(w.length>=4&&w.length<=8)words.add(w);return [...words].slice(0,12);}
 window.RAPhoneApps?.register({id:'bars',label:'BARS',order:16,
  render(){const p=RAMinigames.progress('bars');const best=p.best||0;const jaw=Math.round(Math.max(best,500)*1.1);
   return `<h1>BARS</h1><div class="phone-card"><b>TODAY</b>YOUR BEST: ${new Intl.NumberFormat('en-US').format(best)}<br>IRON JAW POSTED: ${new Intl.NumberFormat('en-US').format(jaw)}<br>LAURA — 9,800</div><div class="phone-card"><b>HOOK VAULT</b>${hooks().map(h=>`"${h.word}"${h.fromMemory?` · from: ${h.fromMemory}`:''}`).join('<br>')||'combo 15+ earns a hook.'}</div><button type="button" class="phone-button" data-phone-action="do:bars:play">FREESTYLE (60s)</button>`;},
  async onAction(act,arg,api){if(act==='play')return playBars(api);}});
 async function playBars(api){const p=RAMinigames.progress('bars');return api.launch('bars',{seedWords:seedWords(),day:RALife.today().day,memoryRef:memories()[0]?.text||null,ironJawDaily:Math.round(Math.max(p.best||0,500)*1.1),lauraDaily:9800},r=>{if(r.score>9800)RALife.counter('lauraLedger');});}
 window.RAMusic={memories,beats,hooks,titles,cook,drop,showResult,playBars,getCareer,storyContext:getCareer,respond,memoryType,seedWords,REAL};
})();
