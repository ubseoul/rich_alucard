(function(){
 // RICH RADIO (VOL 1 §7.1): a persistent mini-player on the phone header once Rich owns a song.
 // Seven supplied Rich masters are playable. Two named catalog slots have no recording and stay unavailable.
 const TRACKS=[
  {id:'bloodbath',title:'BLOODBATH',file:'assets/bloodbath_mix3.wav',feel:'~129 BPM; heavy drop',home:'combat, hilt, the skeleton'},
  {id:'ice_level_intro',title:'ICE LEVEL INTRO',file:'assets/audio/music/ice_level_intro.mp3',library:true,feel:'cold open; clean and icy',home:'title, bedroom'},
  {id:'on_the_moon',title:'ON THE MOON',file:'assets/audio/music/on_the_moon.mp3',library:true,feel:'floaty; late night',home:'late nights'},
  {id:'almond_freestyle',title:'ALMOND FREESTYLE',file:'assets/audio/music/almond_freestyle.mp3',library:true,feel:'freestyle; loose',home:'background'},
  {id:'oxblood',title:'OXBLOOD',file:'assets/audio/music/oxblood_remastered.mp3',library:true,feel:'dark; heavy',home:'night moves'},
  {id:'octopus_brain',title:'OCTOPUS BRAIN',file:null,feel:'~152/76 BPM; steady, hypnotic',home:'weird nights, bars'},
  {id:'montana',title:'IN MONTANA',file:'assets/audio/music/in_montana.mp3',library:true,feel:'~81 BPM; laid back',home:'bedroom, café, cruising'},
  {id:'playmakers',title:'PLAYMAKERS',file:'assets/audio/music/playmakers.mp3',library:true,feel:'"your girl just asked me where i was."',home:'castle parties, dates'},
  {id:'shopping_addict',title:'SHOPPING ADDICT',file:null,feel:'"bounce on it like a rabbit"',home:'the grave, richboi'}
 ];
 const music=()=>RAState.get().life.creativeLife.music;
 // hideWhen(fn): other systems may withhold a track (e.g. a private story beat that takes a master away). Library/BLOODBATH stay owned otherwise.
 const hiders=[],hidden=id=>hiders.some(h=>{try{return !!h(id);}catch(e){return false;}});
 const owned=()=>TRACKS.filter(t=>t.file&&!hidden(t.id)&&(t.library||t.id==='bloodbath'||(music().songs||[]).some(s=>s.id===t.id||s.trackId===t.id)));
 const current=()=>RAState.get().life.phone.radio?.track||owned()[0]?.id||null;
 function setTrack(id){if(!owned().some(t=>t.id===id))return null;RAState.patch('life.phone.radio',{...(RAState.get().life.phone.radio||{}),track:id});const t=TRACKS.find(x=>x.id===id);if(t?.file&&window.RAMusicLibrary)window.RAMusicLibrary.play(t.id,{pin:true});return t;}
 function cycle(){const list=owned();if(!list.length)return null;const i=list.findIndex(t=>t.id===current());return setTrack(list[(i+1)%list.length].id);}
 function setCastleSong(id){if(!owned().some(t=>t.id===id))return false;const m={...music(),castleSong:id};RAState.patch('life.creativeLife.music',m);}
 function miniPlayer(){if(!owned().length)return '';const t=TRACKS.find(x=>x.id===current());return `<button type="button" class="radio-mini" data-phone-action="do:radio:cycle"><i></i><span>RICH RADIO · ${t?.title||''}${t&&!t.file?' (LOOP PENDING)':''}</span></button>`;}
 window.RAPhoneApps?.register({id:'radio',label:'RICH RADIO',order:8,
  render(){const list=owned();const castle=music().castleSong;const cover=id=>{const src=window.RAArtRegistry?.ui?.radio?.[id]?.asset;return src?`<img class="radio-cover" src="${src}" alt="" width="32" height="32" draggable="false">`:'';};return `<h1>RICH RADIO</h1><p class="phone-small">Seven existing Rich masters. Draft choices do not generate new recordings. OCTOPUS BRAIN and SHOPPING ADDICT have no supplied audio.</p><div style="display:grid;grid-template-columns:1fr;gap:6px"><button type="button" class="phone-button" data-phone-action="do:radio:resume">RESUME MUSIC</button><button type="button" class="phone-button" data-phone-action="do:radio:unpin">ROTATE MASTERS</button><button type="button" class="phone-button" data-phone-action="do:radio:cook">WRITE A TRACK</button><button type="button" class="phone-button" data-phone-action="do:radio:show">CATACOMB / OPEN MIC</button><button type="button" class="phone-button" data-phone-action="do:radio:bars">BARS / HOOK PRACTICE</button></div>${list.map(t=>`<div class="phone-card">${cover(t.id)}<b>${t.title}${t.id===current()?' ▶':''}</b>${t.feel}<br><span class="phone-small">${t.file?'':'LOOP PENDING · '}${castle===t.id?'CASTLE SONG':''}</span><div class="phone-row"><button type="button" class="phone-button" data-phone-action="do:radio:play:${t.id}">PLAY</button><button type="button" class="phone-button" data-phone-action="do:radio:castle:${t.id}">SET AS CASTLE SONG</button></div></div>`).join('')}${(music().cooked||[]).length?`<p class="phone-speaker">YOUR COOKS</p>${music().cooked.slice(-10).reverse().map(c=>`<div class="phone-card"><b>${c.title}</b>from: ${c.memory} · beat: ${c.beat}${c.dropped?' · DROPPED':`<button type="button" class="phone-button" data-phone-action="do:radio:drop:${c.id}">DROP IT ON VAMPGRAM</button>`}</div>`).join('')}`:''}`;},
  async onAction(act,arg,api){if(act==='resume')window.RAMusicLibrary?.resume();if(act==='unpin')window.RAMusicLibrary?.unpin();if(act==='cook'){api.begin?.('COOK',{vars:{where:'music_room'}});return;}if(act==='show'){api.begin?.(RALife.done('A14')?'SHOW':'A14');return;}if(act==='bars'){await window.RAMusic?.playBars?.(api);return;}if(act==='cycle')cycle();if(act==='drop')window.RAMusic?.drop?.(arg,'vampgram');if(act==='play')setTrack(arg);if(act==='castle')setCastleSong(arg);api.refresh();}});
 window.RARadio={TRACKS,owned,current,setTrack,cycle,setCastleSong,miniPlayer,hideWhen:fn=>{if(typeof fn==='function')hiders.push(fn);}};
})();
