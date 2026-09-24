(function(){
 // RICH RADIO (VOL 1 §7.1): a persistent mini-player on the phone header once Rich owns a song.
 // Supplied WAVs are short loops; only BLOODBATH (bloodbath_mix3.wav) exists in the build today — the others
 // are listed in docs/btf/ART_INPUTS.md as required audio. Missing loops never break playback.
 const TRACKS=[
  {id:'bloodbath',title:'BLOODBATH',file:'assets/bloodbath_mix3.wav',feel:'~129 BPM; heavy drop',home:'combat, hilt, the skeleton'},
  {id:'octopus_brain',title:'OCTOPUS BRAIN',file:null,feel:'~152/76 BPM; steady, hypnotic',home:'weird nights, bars'},
  {id:'montana',title:'MONTANA',file:null,feel:'~81 BPM; laid back',home:'bedroom, café, cruising'},
  {id:'playmakers',title:'PLAYMAKERS',file:null,feel:'"your girl just asked me where i was."',home:'castle parties, dates'},
  {id:'shopping_addict',title:'SHOPPING ADDICT',file:null,feel:'"bounce on it like a rabbit"',home:'the grave, richboi'}
 ];
 const music=()=>RAState.get().life.creativeLife.music;
 const owned=()=>TRACKS.filter(t=>(music().songs||[]).some(s=>s.id===t.id||s.trackId===t.id));
 const current=()=>RAState.get().life.phone.radio?.track||owned()[0]?.id||null;
 function setTrack(id){RAState.patch('life.phone.radio',{...(RAState.get().life.phone.radio||{}),track:id});const t=TRACKS.find(x=>x.id===id);const audio=document.querySelector('#soundtrack');if(t?.file&&audio&&!audio.src.endsWith(t.file)){const playing=!audio.paused;audio.src=t.file;audio.dataset.track=t.id;if(playing)audio.play().catch(()=>{});}return t;}
 function cycle(){const list=owned();if(!list.length)return null;const i=list.findIndex(t=>t.id===current());return setTrack(list[(i+1)%list.length].id);}
 function setCastleSong(id){const m={...music(),castleSong:id};RAState.patch('life.creativeLife.music',m);}
 function miniPlayer(){if(!owned().length)return '';const t=TRACKS.find(x=>x.id===current());return `<button type="button" class="radio-mini" data-phone-action="do:radio:cycle"><i></i><span>RICH RADIO · ${t?.title||''}${t&&!t.file?' (LOOP PENDING)':''}</span></button>`;}
 window.RAPhoneApps?.register({id:'radio',label:'RICH RADIO',order:8,
  render(){const list=owned();const castle=music().castleSong;return `<h1>RICH RADIO</h1>${list.map(t=>`<div class="phone-card"><b>${t.title}${t.id===current()?' ▶':''}</b>${t.feel}<br><span class="phone-small">${t.file?'':'LOOP PENDING · '}${castle===t.id?'CASTLE SONG':''}</span><div class="phone-row"><button type="button" class="phone-button" data-phone-action="do:radio:play:${t.id}">PLAY</button><button type="button" class="phone-button" data-phone-action="do:radio:castle:${t.id}">SET AS CASTLE SONG</button></div></div>`).join('')}${(music().cooked||[]).length?`<p class="phone-speaker">YOUR COOKS</p>${music().cooked.slice(-10).reverse().map(c=>`<div class="phone-card"><b>${c.title}</b>from: ${c.memory} · beat: ${c.beat}${c.dropped?' · DROPPED':''}</div>`).join('')}`:''}`;},
  onAction(act,arg,api){if(act==='cycle')cycle();if(act==='play')setTrack(arg);if(act==='castle')setCastleSong(arg);api.refresh();}});
 window.RARadio={TRACKS,owned,current,setTrack,cycle,setCastleSong,miniPlayer};
})();
