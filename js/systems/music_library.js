(function(){
 // RC2 · Ube's own songs, shipped in the public music library (assets/audio/music) and rotated through the one
 // #soundtrack element: title -> home -> background. A song picked on RICH RADIO pins (loops) until unpinned.
 const LIBRARY=[
  {id:'ice_level_intro',title:'ICE LEVEL INTRO',file:'assets/audio/music/ice_level_intro.mp3',feel:'cold open; clean and icy',home:'title, bedroom'},
  {id:'montana',title:'IN MONTANA',file:'assets/audio/music/in_montana.mp3',feel:'laid back; cruising',home:'bedroom, cafe, cruising'},
  {id:'on_the_moon',title:'ON THE MOON',file:'assets/audio/music/on_the_moon.mp3',feel:'floaty; late night',home:'late nights'},
  {id:'almond_freestyle',title:'ALMOND FREESTYLE',file:'assets/audio/music/almond_freestyle.mp3',feel:'freestyle; loose',home:'background'},
  {id:'oxblood',title:'OXBLOOD',file:'assets/audio/music/oxblood_remastered.mp3',feel:'dark; heavy',home:'night moves'},
  {id:'playmakers',title:'PLAYMAKERS',file:'assets/audio/music/playmakers.mp3',feel:'"your girl just asked me where i was."',home:'parties, dates'}
 ];
 const ORDER=['bloodbath',...LIBRARY.map(t=>t.id)];
 let pinned=false,scoped=null,musicGeneration=0,needsGesture=false,restored=false;
 function requestPlay(a){const generation=musicGeneration;return a.play().then(()=>{if(generation===musicGeneration)needsGesture=false;return true;}).catch(()=>{if(generation===musicGeneration)needsGesture=true;return false;});}
 function remember(){const a=audioEl();if(!a||scoped)return;const radio=RAState.get().life.phone.radio||{};const next={...radio,track:a.dataset.track||radio.track,pinned,time:Number(a.currentTime)||0};if(next.track!==radio.track||next.pinned!==radio.pinned||Math.abs(next.time-(radio.time||0))>=3)RAState.patch('life.phone.radio',next);}
 const audioEl=()=>document.querySelector('#soundtrack');
 const trackFor=id=>id==='bloodbath'?{id,file:'assets/bloodbath_mix3.wav'}:LIBRARY.find(t=>t.id===id);
 function play(id,{pin=false,restart=false}={}){const a=audioEl(),t=trackFor(id);if(!a||!t)return null;musicGeneration++;scoped=null;pinned=!!pin;a.dataset.track=t.id;a.dataset.pin=pinned?'1':'';a.loop=pinned;const same=a.src&&a.src.endsWith(t.file);if(!same){a.src=t.file;}else if(restart)a.currentTime=0;requestPlay(a);remember();return t;}
 function next(){const a=audioEl();const cur=a?.dataset.track||'bloodbath';const i=Math.max(0,ORDER.indexOf(cur));return play(ORDER[(i+1)%ORDER.length]);}
 function onEnded(){if(scoped){const a=audioEl();if(a){a.currentTime=0;requestPlay(a);}return true;}if(pinned)return false;next();return true;}
 function unpin(){pinned=false;const a=audioEl();if(a){a.loop=false;a.dataset.pin='';remember();}}
 // A combat cue temporarily borrows the existing player; user radio pins take precedence.
 function combat(owner,enemyId,{spar=false,trackId=null,force=false,resumeOnRestore=true}={}){
  const a=audioEl();if(!a||(pinned&&!force))return ()=>{};
  scoped?.restore();
  const saved={src:a.getAttribute('src'),track:a.dataset.track,time:a.currentTime,loop:a.loop,paused:a.paused,pinned};
  const id=trackId|| (spar?'almond_freestyle':enemyId==='gbenga'?'oxblood':'bloodbath'),t=trackFor(id);if(!t)return ()=>{};if(force)pinned=false;
  let live=true;
  function restore(){if(!live)return;live=false;if(scoped?.owner!==owner)return;scoped=null;if(pinned)return;pinned=saved.pinned;a.dataset.pin=pinned?'1':'';const generation=++musicGeneration;a.pause();a.src=saved.src||'assets/bloodbath_mix3.wav';a.dataset.track=saved.track||'bloodbath';a.loop=saved.loop;const seek=()=>{if(!scoped&&generation===musicGeneration){a.currentTime=Math.min(saved.time,Number.isFinite(a.duration)?Math.max(0,a.duration-.05):saved.time);if(resumeOnRestore&&!saved.paused)requestPlay(a);else a.pause();}};a.addEventListener('loadedmetadata',seek,{once:true});a.load();}
  musicGeneration++;scoped={owner,restore};a.dataset.track=id;a.loop=true;a.src=t.file;requestPlay(a);owner.dataset.musicCue=id;
  owner.addEventListener('c2:close',restore,{once:true});return restore;
 }
 // New Game borrows this one player for the film without changing the saved radio.
 // Native entry owns the later gameplay play request; Skip must stop the cue first.
 function cinematic(owner,trackId,{resumeOnRestore=false}={}){
  const a=audioEl(),track=trackFor(trackId);if(!a||!track)return null;
  const restore=combat(owner,null,{trackId,force:true,resumeOnRestore});
  const active=()=>scoped?.owner===owner;
  return {track:track.id,file:track.file,active,
   pause(){if(active()){musicGeneration++;needsGesture=false;a.pause();}},
   resume(){return active()?requestPlay(a):Promise.resolve(false);},
   stop(){if(active())a.pause();restore();}
  };
 }
 function init(){const a=audioEl();if(!a)return;
  const radio=RAState.get().life.phone.radio||{},saved=trackFor(radio.track);
  if(saved){restored=true;pinned=!!radio.pinned;a.src=saved.file;a.dataset.track=saved.id;a.dataset.pin=pinned?'1':'';a.loop=pinned;const seek=()=>{if(!scoped&&a.dataset.track===saved.id)a.currentTime=Math.min(Number(radio.time)||0,Number.isFinite(a.duration)?Math.max(0,a.duration-.05):Number(radio.time)||0);};a.addEventListener('loadedmetadata',seek,{once:true});}
  a.addEventListener('timeupdate',remember);
  const retry=()=>{if(needsGesture&&!document.hidden)requestPlay(a);};
  document.addEventListener('pointerdown',retry,{capture:true,passive:true});document.addEventListener('keydown',retry,{capture:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)remember();else if(!a.ended)requestPlay(a);});
  window.addEventListener('pagehide',remember);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
 window.RAMusicLibrary={LIBRARY,ORDER,play,next,onEnded,unpin,combat,cinematic,trackFor,restored:()=>restored,isPinned:()=>pinned,needsGesture:()=>needsGesture,resume:()=>{const a=audioEl();return a?requestPlay(a):Promise.resolve(false);},performance:(owner,trackId)=>combat(owner,null,{trackId,force:true})};
})();
