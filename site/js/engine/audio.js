(function(){
  // RA AUDIO ENGINE — extends the original RAAudio element helper with the approved M1–M2 foundation
  // described in docs/RA_Sound_Deployment_Plan_HQ.md §3. The engine is ID-driven: callers pass manifest IDs,
  // never file paths. When a sound is not registered yet (file === null), every call is a safe no-op, so the
  // game is unchanged until HQ accepts and encodes the Finder delivery.
  //
  // Preserved legacy API: RAAudio.get(id) / play(id) / pause(id) — the soundtrack <audio> element helpers.
  const BUSSES=['MUSIC','SFX','UI','VOICE','AMBIENCE'];
  const SETTING_FOR_BUS={MUSIC:'music',SFX:'sfx',UI:'sfx',VOICE:'sfx',AMBIENCE:'ambience'};
  const HAPTIC_IDS={HIT_HEAVY:18,CRIT:22,KO:30,NOTIF_TEXT:12,NOTIF_VAMPGRAM:12,APP_UNLOCK:16,CASH_IN:12,CASH_OUT:12};
  const clamp01=v=>Math.min(1,Math.max(0,Number(v)));

  const manifest=()=>window.RAAudioManifest;
  const busDefaults=()=>manifest()?.busDefaults||{MUSIC:.70,SFX:.90,UI:.60,VOICE:.80,AMBIENCE:.45};
  const settingsStorage=()=>({audio:{music:1,sfx:1,ambience:1,muted:false,haptics:true}});
  function readSettings(){
    try{const stored=window.RAState?.get?.()?.life?.settings?.audio;return {...settingsStorage().audio,...(stored&&typeof stored==='object'?stored:{})};}
    catch(e){return {...settingsStorage().audio};}
  }
  function writeSetting(key,value){
    try{const current={...readSettings(),[key]:value};window.RAState?.patch?.('life.settings.audio',current);return current;}catch(e){return {...readSettings(),[key]:value};}
  }

  // ---- Web Audio graph ----
  let ctx=null,master=null,duckNode=null;const busNodes={};
  let unlocked=false,ducked=false,duckTimeout=null;
  const buffers=new Map(),missing=new Set(),active=new Map(),loops=new Map(),plays=new Map(),variantBuffers=new Map();
  let sceneState={id:null,preload:[]},sceneToken=0,ambienceAttempts=0,pendingAmbience=false,pendingToken=0,residentPreloaded=false;

  function ensureCtx(){
    if(ctx)return ctx;
    const AC=window.AudioContext||window.webkitAudioContext;
    if(!AC)return null;
    try{ctx=new AC();}catch(e){return null;}
    master=ctx.createGain();master.gain.value=1;master.connect(ctx.destination);
    duckNode=ctx.createGain();duckNode.gain.value=1;
    for(const bus of BUSSES){const g=ctx.createGain();g.gain.value=busDefaults()[bus]??1;busNodes[bus]=g;if(bus==='MUSIC'){g.connect(duckNode);duckNode.connect(master);}else g.connect(master);}
    applyMix();
    return ctx;
  }
  // The shipped soundtrack is a plain <audio> element, not a Web Audio node, so MUSIC + MUTE are mirrored onto it
  // (R2). This is applied even before an AudioContext exists so settings control the current soundtrack immediately.
  function applyElementMix(){
    const element=get('soundtrack');if(!element)return;
    const s=readSettings();element.volume=clamp01(s.music);element.muted=!!s.muted;
  }
  function applyMix(){
    applyElementMix();
    if(!ctx)return;
    const s=readSettings();
    for(const bus of BUSSES){const node=busNodes[bus];if(!node)continue;const base=busDefaults()[bus]??1;const user=bus==='MUSIC'?s.music:bus==='AMBIENCE'?s.ambience:s.sfx;node.gain.value=clamp01(base)*clamp01(user);}
    if(master)master.gain.value=s.muted?0:1;
  }
  function ramp(node,value,ms){if(!ctx||!node)return;const at=ctx.currentTime;const dur=Math.max(0.01,(Number(ms)||0)/1000);try{node.gain.cancelScheduledValues(at);node.gain.setValueAtTime(node.gain.value,at);node.gain.linearRampToValueAtTime(value,at+dur);}catch(e){node.gain.value=value;}}

  const UNLOCK_EVENTS=['pointerdown','touchstart','keydown'];
  function unlock(){
    const c=ensureCtx();if(!c)return false;
    if(c.state==='suspended')c.resume().catch(()=>{});
    unlocked=true;
    detachUnlockListeners();
    if(!residentPreloaded){residentPreloaded=true;preloadScene(manifest()?.resident||[]);}
    const known=sceneState.id!==null?sceneState.id:window.RAScenes?.current?.()||null;
    if(known)enterScene(known);
    return true;
  }
  function unlockOnce(){if(!unlocked)unlock();}
  function detachUnlockListeners(){for(const event of UNLOCK_EVENTS)document.removeEventListener(event,unlockOnce,{capture:true});}
  UNLOCK_EVENTS.forEach(event=>document.addEventListener(event,unlockOnce,{capture:true,passive:true}));
  // M1 UI_TAP / UI_BACK seam: any button press, in the bubble phase. An owning handler can claim the click with
  // event.__raSfxHandled so a specific sound (UI_CONFIRM/UI_ERROR/PHONE_APP_OPEN) does not also fire generic UI_TAP.
  function uiClick(event){
    if(event.__raUITapRouted)return;
    if(event.__raSfxHandled&&[...plays.values()].reduce((a,b)=>a+b,0)>(event.__raUIBefore??0))return;
    const target=event.__raUITarget||event.target?.closest?.('button,a[href],input,select,[role="button"],[data-phone-action],[data-move],[data-c2],.adv-scene,.bedroom-return');
    if(!target||(event.__raWasEnabled===undefined?target.disabled:!event.__raWasEnabled))return;
    event.__raUITapRouted=true;
    const action=target.dataset?.phoneAction||'';
    const id=/^(close|home|back|nah)$/.test(action)?'UI_BACK':'UI_TAP';
    if(!oneShot(id,{restartVoice:true}))preload(id).then(()=>oneShot(id,{restartVoice:true}));
  }
  document.addEventListener('click',event=>{event.__raUIBefore=[...plays.values()].reduce((a,b)=>a+b,0);event.__raUITarget=event.target?.closest?.('button,a[href],input,select,[role="button"],[data-phone-action],[data-move],[data-c2],.adv-scene,.bedroom-return');event.__raWasEnabled=!!event.__raUITarget&&!event.__raUITarget.disabled;Promise.resolve().then(()=>uiClick(event));},{capture:true});
  document.addEventListener('click',uiClick);
  document.addEventListener('pointerdown',event=>{if(event.target?.matches?.('.ra-minigame canvas,.rd-lane')){if(!oneShot('UI_TAP',{restartVoice:true}))preload('UI_TAP').then(()=>oneShot('UI_TAP',{restartVoice:true}));}});

  // ---- loading ----
  function preloadVariant(path){
    if(!unlocked||!path)return Promise.resolve(null);
    const c=ensureCtx();if(!c)return Promise.resolve(null);
    if(variantBuffers.has(path))return Promise.resolve(variantBuffers.get(path));
    if(missing.has(path))return Promise.resolve(null);
    return fetch(path,{cache:'force-cache'}).then(response=>{if(!response.ok)throw new Error(`audio ${path}: ${response.status}`);return response.arrayBuffer();})
      .then(data=>new Promise((resolve,reject)=>c.decodeAudioData(data,b=>resolve(b),reject)))
      .then(buffer=>{variantBuffers.set(path,buffer);return buffer;})
      .catch(()=>{missing.add(path);return null;});
  }
  function preload(id){
    if(!unlocked)return Promise.resolve(null); // never create an AudioContext before the first user gesture (§3.3)
    const c=ensureCtx(),entry=manifest()?.get?.(id);
    if(!c||!entry)return Promise.resolve(null);
    for(const variant of entry.variations||[])preloadVariant(variant);
    if(entry.type==='loop set')return Promise.all((entry.parts||[]).map(p=>preloadVariant(p.file)));
    if(!entry.file||!entry.registered)return Promise.resolve(null);
    if(buffers.has(id))return Promise.resolve(buffers.get(id));
    if(missing.has(id))return Promise.resolve(null);
    return fetch(entry.file,{cache:'force-cache'}).then(response=>{if(!response.ok)throw new Error(`audio ${id}: ${response.status}`);return response.arrayBuffer();})
      .then(data=>new Promise((resolve,reject)=>c.decodeAudioData(data,b=>resolve(b),reject)))
      .then(buffer=>{buffers.set(id,buffer);return buffer;})
      .catch(()=>{missing.add(id);return null;});
  }
  function installBuffer(id,buffer){if(buffer)buffers.set(id,buffer);missing.delete(id);return buffer||null;}
  // DEV/smoke only: synthesize a short tone into the engine's normal decode cache. Never used by gameplay.
  function installTestTone(id,{freq=440,duration=0.05}={}){
    const c=ensureCtx();if(!c||!id)return null;
    const length=Math.max(1,Math.floor(c.sampleRate*duration));const buffer=c.createBuffer(1,length,c.sampleRate);const data=buffer.getChannelData(0);
    for(let i=0;i<length;i++)data[i]=Math.sin((2*Math.PI*freq*i)/c.sampleRate)*(1-i/length)*.5;
    buffers.set(id,buffer);missing.delete(id);return buffer;
  }
  function preloadScene(ids=[]){return Promise.all(ids.map(preload));}
  function releaseScene(ids=[]){
    const resident=new Set(manifest()?.resident||[]);
    for(const id of ids){if(!resident.has(id))buffers.delete(id);}
  }

  // ---- playback ----
  function nodeGainFor(entry){return entry.gain==null?1:clamp01(entry.gain);}
  function busFor(entry){return busNodes[entry.bus]||busNodes.SFX;}
  // Variation sets (schema 2.1 `variations`) pick one candidate at random; loop sets (`parts`) are never played as a whole.
  function candidate(entry){
    const list=[];
    if(entry.file)list.push({primary:true,path:entry.file});
    for(const v of entry.variations||[])list.push({primary:false,path:v});
    if(!list.length)return null;
    return list.length===1?list[0]:list[Math.floor(Math.random()*list.length)];
  }
  function candidateBuffer(id,cand){if(!cand)return null;return cand.primary?(buffers.get(id)||null):(variantBuffers.get(cand.path)||null);}
  const voiceSources=new Map();
  function oneShot(id,opts={}){
    if(!unlocked)return false;
    const c=ensureCtx(),entry=manifest()?.get?.(id);
    if(!c||!entry)return false;
    if(entry.type==='loop')return loop(id,opts);
    if(entry.type==='loop set')return part(id,opts.part||'idle',opts);
    const cand=candidate(entry),buffer=candidateBuffer(id,cand);
    if(!buffer){if(entry.registered)preload(id);return false;}
    const limit=Math.max(1,entry.maxVoices||3);
    if((active.get(id)||0)>=limit){
      // A new UI tap restarts the oldest voice, keeping the authored voice cap.
      const oldest=opts.restartVoice&&voiceSources.get(id)?.values().next().value;
      if(!oldest)return false;oldest.onended=null;try{oldest.stop();}catch(e){}
      voiceSources.get(id).delete(oldest);active.set(id,Math.max(0,(active.get(id)||1)-1));
    }
    const source=c.createBufferSource();source.buffer=buffer;
    const jitter=entry.pitchJitter||0;if(jitter)source.playbackRate.value=1+(Math.random()*2-1)*jitter;
    const gain=c.createGain();gain.gain.value=clamp01(nodeGainFor(entry)*(opts.gain==null?1:clamp01(opts.gain)));
    source.connect(gain).connect(busFor(entry));
    active.set(id,(active.get(id)||0)+1);
    if(!voiceSources.has(id))voiceSources.set(id,new Set());voiceSources.get(id).add(source);
    source.onended=()=>{voiceSources.get(id)?.delete(source);active.set(id,Math.max(0,(active.get(id)||1)-1));};
    try{source.start();}catch(e){active.set(id,Math.max(0,(active.get(id)||1)-1));return false;}
    plays.set(id,(plays.get(id)||0)+1);
    if(entry.ducksMusic)duckMusic(12,entry.duckMs||1200);
    haptic(id);
    return true;
  }
  function loop(id,opts={}){
    if(!unlocked)return false;
    const c=ensureCtx(),entry=manifest()?.get?.(id);
    if(!c||!entry)return false;
    if(entry.type==='loop set')return part(id,opts.part||'idle',opts);
    if(loops.has(id))return true;
    const cand=candidate(entry),buffer=candidateBuffer(id,cand);
    if(!buffer){if(entry.registered)preload(id);return false;}
    const source=c.createBufferSource();source.buffer=buffer;source.loop=true;
    if(Number.isFinite(entry.loopStart))source.loopStart=entry.loopStart;
    if(Number.isFinite(entry.loopEnd))source.loopEnd=entry.loopEnd;
    const gain=c.createGain();gain.gain.value=clamp01(nodeGainFor(entry)*(opts.gain==null?1:clamp01(opts.gain)));
    source.connect(gain).connect(busFor(entry));
    try{source.start();}catch(e){return false;}
    loops.set(id,{source,gain});
    plays.set(id,(plays.get(id)||0)+1);
    return true;
  }
  // Play a delivered component of a loop set; the parent remains the public sound ID and statistics key.
  function part(id,role,opts={}){
    const entry=manifest()?.get?.(id),p=entry?.parts?.find(p=>p.file.endsWith(`__${role}.mp3`))||(role==='idle'?entry?.parts?.find(p=>p.type==='loop'):null);
    if(!unlocked||!p)return false;const buffer=variantBuffers.get(p.file),c=ensureCtx();
    if(!buffer){preload(id);return false;}const key=`${id}:${role}`;
    if(p.type==='loop'&&loops.has(key))return true;
    const source=c.createBufferSource(),gain=c.createGain();source.buffer=buffer;source.loop=p.type==='loop';
    if(Number.isFinite(p.loopStart))source.loopStart=p.loopStart;if(Number.isFinite(p.loopEnd))source.loopEnd=p.loopEnd;
    gain.gain.value=clamp01(nodeGainFor(entry)*(opts.gain??1));source.connect(gain).connect(busFor(entry));
    try{source.start();}catch(e){return false;}if(source.loop)loops.set(key,{source,gain});
    plays.set(id,(plays.get(id)||0)+1);return true;
  }
  function stop(id,fadeMs=250){
    for(const key of [...loops.keys()])if(key.startsWith(id+':'))stop(key,fadeMs);
    const handle=loops.get(id);if(!handle)return false;
    loops.delete(id);
    ramp(handle.gain,0,fadeMs);
    const delay=Math.max(20,(Number(fadeMs)||0)+20);
    setTimeout(()=>{try{handle.source.stop();}catch(e){}},delay);
    return true;
  }
  function stopAll(fadeMs=250){for(const id of [...loops.keys()])stop(id,fadeMs);}
  function isPlaying(id){return loops.has(id)||(active.get(id)||0)>0;}

  function duckMusic(db=6,ms=400){
    if(!duckNode)return false;
    ducked=true;ramp(duckNode,Math.pow(10,-Math.abs(db)/20),ms);
    if(duckTimeout)clearTimeout(duckTimeout);
    return true;
  }
  function restoreMusic(ms=400){
    if(!duckNode)return false;
    ducked=false;ramp(duckNode,1,ms);
    if(duckTimeout)clearTimeout(duckTimeout);
    return true;
  }
  function duckFor(db,holdMs=1200,restoreMs=400){duckMusic(db,restoreMs);if(duckTimeout)clearTimeout(duckTimeout);duckTimeout=setTimeout(()=>restoreMusic(restoreMs),Math.max(0,holdMs));return true;}

  function haptic(id){
    const strength=HAPTIC_IDS[id];if(!strength)return false;
    if(!readSettings().haptics)return false;
    try{if(navigator.vibrate)navigator.vibrate(strength);else return false;}catch(e){return false;}
    return true;
  }

  // ---- scene binding (§3.3 preload by scene) ----
  // Ambience starts through a single bounded async attempt tied to the current scene visit. Unregistered entries
  // (file:null) never retry, and a scene change invalidates the attempt so stale ambience cannot start.
  function startSceneAmbience(sceneId,ambienceId,token){
    if(!ambienceId)return false;
    const entry=manifest()?.get?.(ambienceId);
    if(!entry||!entry.file||!entry.registered)return false;
    if(loops.has(ambienceId))return true;
    if(!unlocked)return false;
    ambienceAttempts+=1;pendingAmbience=true;pendingToken=token;
    preload(ambienceId).then(buffer=>{
      if(pendingToken===token)pendingAmbience=false;
      if(token!==sceneToken||sceneState.id!==sceneId)return; // scene changed: never start stale ambience
      if(buffer&&unlocked)loop(ambienceId,{});
    }).catch(()=>{if(pendingToken===token)pendingAmbience=false;});
    return true;
  }
  function enterScene(id){
    const table=manifest()?.scenes||{},next=table[id];
    if(sceneState.id&&sceneState.id!==id){const previous=table[sceneState.id]||{};if(previous.ambience)stop(previous.ambience,300);releaseScene(previous.preload||[]);}
    sceneToken+=1;
    sceneState={id,preload:(next?.preload||[]).slice()};
    startSceneAmbience(id,next?.ambience||null,sceneToken);
    return preloadScene(sceneState.preload);
  }

  // ---- settings ----
  function setVolume(bus,value){const key=SETTING_FOR_BUS[bus];if(!key)return settings();const next=writeSetting(key,clamp01(value));applyMix();return {...next};}
  function setMuted(value){const next=writeSetting('muted',!!value);applyMix();return {...next};}
  function toggleMuted(){return setMuted(!readSettings().muted);}
  function setHaptics(value){return {...writeSetting('haptics',!!value)};}
  function settings(){return {...readSettings()};}

  function describe(){
    const s=readSettings();
    return {schema:manifest()?.schema||null,unlocked,context:ctx?ctx.state:'none',scene:sceneState.id,sceneToken,ducked,muted:!!s.muted,settings:s,busGains:BUSSES.reduce((acc,bus)=>({...acc,[bus]:busNodes[bus]?.gain.value??(busDefaults()[bus]??1)}),{}),loaded:[...buffers.keys()],missing:[...missing.keys()],playing:[...loops.keys()],voices:[...active.entries()].filter(([,n])=>n>0).reduce((acc,[id,n])=>({...acc,[id]:n}),{}),plays:[...plays.entries()].reduce((acc,[id,n])=>({...acc,[id]:n}),{}),ambienceAttempts,pendingAmbience,variants:[...variantBuffers.keys()]};
  }

  // ---- original element helpers (unchanged behavior) ----
  function get(id='soundtrack'){return document.getElementById(id);}
  async function play(id='soundtrack'){const element=get(id);if(element)try{await element.play();}catch(e){}}
  function pause(id='soundtrack'){const element=get(id);if(element)element.pause();}

  window.RAAudio={get,play,pause,unlock,isUnlocked:()=>unlocked,sfx:oneShot,oneShot,loop,part,stop,stopAll,isPlaying,duckMusic,restoreMusic,duckFor,preload,preloadScene,releaseScene,installBuffer,installTestTone,enterScene,startSceneAmbience,scene:()=>sceneState.id,setVolume,setMuted,toggleMuted,setHaptics,settings,applyMix,applyElementMix,describe,
    buses:{...{MUSIC:'MUSIC',SFX:'SFX',UI:'UI',VOICE:'VOICE',AMBIENCE:'AMBIENCE'}},defaults:()=>({...busDefaults()})};
  document.addEventListener('ra:scene',event=>{if(event.detail?.id)enterScene(event.detail.id);});
  // CDB note: RAState.load() can be called by DEV restore/reset after the engine loaded; re-apply element settings.
  try{const originalLoad=window.RAState?.load;if(typeof originalLoad==='function'&&!originalLoad.__raAudioWrapped){const wrapped=function(...rest){const result=originalLoad.apply(this,rest);applyElementMix();return result;};wrapped.__raAudioWrapped=true;window.RAState.load=wrapped;}}catch(e){}
  applyElementMix();
  document.addEventListener('DOMContentLoaded',applyElementMix);
})();
