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
 let pinned=false,scoped=null,musicGeneration=0;
 const audioEl=()=>document.querySelector('#soundtrack');
 const trackFor=id=>id==='bloodbath'?{id,file:'assets/bloodbath_mix3.wav'}:LIBRARY.find(t=>t.id===id);
 function play(id,{pin=false}={}){const a=audioEl(),t=trackFor(id);if(!a||!t)return null;musicGeneration++;pinned=!!pin;a.dataset.track=t.id;a.dataset.pin=pinned?'1':'';a.loop=pinned;const same=a.src&&a.src.endsWith(t.file);if(!same){a.src=t.file;}else a.currentTime=0;a.play().catch(()=>{});return t;}
 function next(){const a=audioEl();const cur=a?.dataset.track||'bloodbath';const i=Math.max(0,ORDER.indexOf(cur));return play(ORDER[(i+1)%ORDER.length]);}
 function onEnded(){if(scoped){const a=audioEl();if(a){a.currentTime=0;a.play().catch(()=>{});}return true;}if(pinned)return false;next();return true;}
 function unpin(){pinned=false;const a=audioEl();if(a){a.loop=false;a.dataset.pin='';}}
 // A combat cue temporarily borrows the existing player; user radio pins take precedence.
 function combat(owner,enemyId,{spar=false}={}){
  const a=audioEl();if(!a||pinned)return ()=>{};
  scoped?.restore();
  const saved={src:a.getAttribute('src'),track:a.dataset.track,time:a.currentTime,loop:a.loop,paused:a.paused};
  const id=spar?'almond_freestyle':enemyId==='gbenga'?'oxblood':'bloodbath',t=trackFor(id);
  let live=true;
  function restore(){if(!live)return;live=false;if(scoped?.owner!==owner)return;scoped=null;if(pinned)return;const generation=++musicGeneration;a.src=saved.src||'assets/bloodbath_mix3.wav';a.dataset.track=saved.track||'bloodbath';a.loop=saved.loop;const seek=()=>{if(!scoped&&!pinned&&generation===musicGeneration){a.currentTime=saved.time;if(!saved.paused)a.play().catch(()=>{});else a.pause();}};a.addEventListener('loadedmetadata',seek,{once:true});a.load();}
  musicGeneration++;scoped={owner,restore};a.dataset.track=id;a.loop=true;a.src=t.file;a.play().catch(()=>{});owner.dataset.musicCue=id;
  owner.addEventListener('c2:close',restore,{once:true});return restore;
 }
 window.RAMusicLibrary={LIBRARY,ORDER,play,next,onEnded,unpin,combat,trackFor,isPinned:()=>pinned};
})();
