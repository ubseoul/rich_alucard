(function(){
 // LANE 7 — MUSIC (VOL 1 §9.7, VOL 3 §8): MAKE → DROP → PLAY IT OUT → WORLD REACTS → PEOPLE → (hidden) MOMENTUM.
 // The cook is a 60-second choice ritual: a MEMORY from recent life + a BEAT + a HOOK (from BARS) → a titled song.
 // The first five cooks unlock Rich's real catalog, framed as "the song that came out of that night".
 const music=()=>RAState.get().life.creativeLife.music;
 const REAL=[{type:'party',track:'playmakers'},{type:'fight',track:'bloodbath'},{type:'weird',track:'octopus_brain'},{type:'quiet',track:'montana'},{type:'mall',track:'shopping_addict'}];
 function memoryType(m){const t=`${m.lane||''} ${m.type||''} ${m.text||''}`.toLowerCase();
  if(/party|rave|hosting|castle party|show|club/.test(t))return 'party';if(/fight|defeat|beat|combat|hilt|skeleton/.test(t))return 'fight';if(/weird|octopus|portobello|kevin|phil|god|ladder/.test(t))return 'weird';if(/mall|grave|shop|buy|bought/.test(t))return 'mall';return 'quiet';}
 function memories(){return RALife.recentMemories(10).filter(m=>!['followers'].includes(m.type));}
 function beats(){const own=RARadio.owned();return own.length?own.map(t=>({id:t.id,label:t.title})):[{id:'demo_2019',label:'A BEAT FROM 2019'}];}
 function hooks(){return (music().hooks||[]).filter(h=>!h.used).slice(-6);}
 // Title options are drafts. Ube names his songs: every option is [VP].
 function titles(mem){const words=String(mem.text||'untitled').toUpperCase().replace(/[^A-Z0-9 ']/g,'').split(' ').filter(w=>w.length>2);const core=words.slice(-2).join(' ')||'THAT NIGHT';
  return [{title:core,vp:true},{title:`${words[0]||'NIGHT'} FREESTYLE`,vp:true},{title:`THE NIGHT OF THE ${words.at(-1)||'THING'}`,vp:true}];}
 function cook({memoryId,beat,hookIndex=null,title}){
  const mem=RAState.get().life.memoryLog.find(m=>m.id===memoryId)||memories()[0];if(!mem)return null;
  const m={...music()};const type=memoryType(mem);let unlocked=null;
  const cookedCount=(m.cooked||[]).length;
  if(cookedCount<5){const owned=new Set((m.songs||[]).map(s=>s.id));const pick=REAL.find(r=>r.type===type&&!owned.has(r.track))||REAL.find(r=>!owned.has(r.track));if(pick){m.songs=[...(m.songs||[]),{id:pick.track,trackId:pick.track,fromMemory:mem.text,day:RALife.today().day}];unlocked=pick.track;}}
  const hook=hookIndex!=null?hooks()[hookIndex]:null;if(hook)m.hooks=(m.hooks||[]).map(h=>h===hook||(h.word===hook.word&&h.day===hook.day)?{...h,used:true}:h);
  const song={id:`song:${RALife.today().day}:${cookedCount}`,title:title||titles(mem)[0].title,titleVp:true,memory:mem.text,memoryId:mem.id,type,beat:beat||'demo_2019',hook:hook?.word||null,quality:(mem.quality||1)+(hook?1:0),day:RALife.today().day,dropped:false};
  m.cooked=[...(m.cooked||[]),song];RAState.patch('life.creativeLife.music',m);
  if(unlocked){RALife.unlockApp('radio');RARadio.setTrack(unlocked);}
  RALife.light('expression',1,`cook:${song.id}`);RALife.remember({id:`cooked:${song.id}`,text:`cooked "${song.title.toLowerCase()}"`,lane:'music'});
  return {song,unlocked};
 }
 function drop(songId,where='vampgram'){const m={...music()};const song=(m.cooked||[]).find(s=>s.id===songId);if(!song||song.dropped)return false;
  m.cooked=m.cooked.map(s=>s.id===songId?{...s,dropped:true,droppedDay:RALife.today().day,where}:s);m.drops=[...(m.drops||[]),{songId,day:RALife.today().day,where,wakes:0,total:Math.round(20+Math.min(180,song.quality*45+(RALife.clout()*20)))}];
  RAState.patch('life.creativeLife.music',m);window.RAVampGram?.post?.({handle:'richalucard',text:`new: "${song.title.toLowerCase()}" 🩸`,likes:20});RALife.light('expression',1,`drop:${songId}`);RALife.receipt({id:`drop:${songId}`,caption:`dropped "${song.title.toLowerCase()}".`,lane:'music'});return true;}
 // Reactions trickle in over 1–3 WAKEs.
 RAClock.onWake('music-drops',45,({info})=>{const m={...music()};let changed=false;m.drops=(m.drops||[]).map(d=>{if(d.wakes>=3)return d;changed=true;const share=d.wakes===0?.5:d.wakes===1?.3:.2;const n=Math.round(d.total*share);RALife.addFollowers(n);const song=(m.cooked||[]).find(s=>s.id===d.songId);RALife.mail({id:`drop:${d.songId}:${info.day}`,kind:'music',title:'VAMPGRAM',body:`"${(song?.title||'your song').toLowerCase()}" is moving. +${n} followers.`,app:'vampgram'});return {...d,wakes:d.wakes+1};});if(changed)RAState.patch('life.creativeLife.music',m);});
 // Shows (VOL 3: $300 + $15 per crowd point, max $3,000; clout +6, rep +2).
 function showResult(crowd){const pay=Math.min(3000,300+15*Math.max(0,crowd));const m={...music()};m.shows=[...(m.shows||[]),{day:RALife.today().day,crowd,pay}];RAState.patch('life.creativeLife.music',m);RALife.addMoney(pay);RALife.addPoints('clout',6);RALife.addPoints('rep',2);RALife.addFollowers(10+Math.round(crowd/2));RALife.light('expression',1,`show:${RALife.today().day}`);return pay;}
 // BARS app: the tiny addictive game, seeded with words from Rich's recent life.
 function seedWords(){const words=new Set();for(const mm of memories())for(const w of String(mm.text).toUpperCase().split(/[^A-Z]+/))if(w.length>=4&&w.length<=8)words.add(w);return [...words].slice(0,12);}
 window.RAPhoneApps?.register({id:'bars',label:'BARS',order:16,
  render(){const p=RAMinigames.progress('bars');const best=p.best||0;const jaw=Math.round(Math.max(best,500)*1.1);
   return `<h1>BARS</h1><div class="phone-card"><b>TODAY</b>YOUR BEST: ${new Intl.NumberFormat('en-US').format(best)}<br>IRON JAW POSTED: ${new Intl.NumberFormat('en-US').format(jaw)}<br>LAURA — 9,800</div><div class="phone-card"><b>HOOK VAULT</b>${hooks().map(h=>`"${h.word}"${h.fromMemory?` · from: ${h.fromMemory}`:''}`).join('<br>')||'combo 15+ earns a hook.'}</div><button type="button" class="phone-button" data-phone-action="do:bars:play">FREESTYLE (60s)</button>`;},
  async onAction(act,arg,api){if(act==='play'){const p=RAMinigames.progress('bars');await api.launch('bars',{seedWords:seedWords(),day:RALife.today().day,memoryRef:memories()[0]?.text||null,ironJawDaily:Math.round(Math.max(p.best||0,500)*1.1),lauraDaily:9800},r=>{if(r.score>9800)RALife.counter('lauraLedger');});}}});
 window.RAMusic={memories,beats,hooks,titles,cook,drop,showResult,memoryType,seedWords,REAL};
})();
