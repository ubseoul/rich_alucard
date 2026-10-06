(function(){
 // Minigame host contract (W0 FEEL TRACK).
 // A minigame registers {id,title,mount(root,ctx)} and returns {dispose(),pause?(),resume?()}.
 // ctx: {params, progress(), saveProgress(patch), reward(partial), finish(result), quit(), scope, native}
 // Host guarantees: an always-visible QUIT control (instant quit), per-game persistent progress
 // (best scores, logs) that survives quits, and a Promise result for the caller.
 const registry=new Map();
 const LAB_KEY='rich_alucard_minigame_lab_v1';
 let current=null;
 const clone=v=>JSON.parse(JSON.stringify(v??null));
 function inGame(){return !!window.RAState&&!window.RA_MINIGAME_LAB;}
 function labStore(){try{return JSON.parse(localStorage.getItem(LAB_KEY)||'{}')}catch(e){return {}}}
 function progress(id){
  if(inGame()){const all=RAState.get().life.minigames||{};return clone(all[id]||{});}
  return clone(labStore()[id]||{});
 }
 function saveProgress(id,patch){
  const next={...progress(id),...clone(patch)};
  if(inGame()){const all={...(RAState.get().life.minigames||{})};all[id]=next;RAState.patch('life.minigames',all);}
  else{const all=labStore();all[id]=next;try{localStorage.setItem(LAB_KEY,JSON.stringify(all))}catch(e){}}
  return next;
 }
 function register(id,def){if(!id||typeof def?.mount!=='function')throw new Error(`Bad minigame ${id}`);registry.set(id,{id,title:def.title||id.toUpperCase(),...def});}
 function mergeRewards(into,partial){
  for(const [k,v] of Object.entries(partial||{})){
   if(typeof v==='number')into[k]=(into[k]||0)+v;
   else if(Array.isArray(v))into[k]=[...(into[k]||[]),...v];
   else if(v&&typeof v==='object'){into[k]=into[k]||{};for(const [ik,iv] of Object.entries(v))into[k][ik]=typeof iv==='number'?(into[k][ik]||0)+iv:iv;}
   else into[k]=v;
  }
  return into;
 }
 // One-sentence rule card: title, the rule in plain words, one big START. Space/Enter also starts.
 function showRuleCard(stage,def,ctx,begin){
  const card=document.createElement('div');card.className='ra-minigame-rule';card.dataset.ruleCard='1';
  card.style.cssText='position:absolute;inset:0;z-index:20;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:28px 22px;background:rgba(8,7,15,.97);color:#f6efd9;text-align:center;font-family:"Press Start 2P",monospace';
  const h=document.createElement('div');h.textContent=def.title||'';h.style.cssText='font-size:12px;color:#c18b3c;line-height:1.5';
  const r=document.createElement('div');r.className='ra-minigame-rule-text';r.textContent=def.rule;r.style.cssText='font-size:9px;line-height:1.9;max-width:230px';
  const b=document.createElement('button');b.type='button';b.className='ra-minigame-start';b.textContent='START';b.style.cssText='font:10px "Press Start 2P",monospace;padding:1em 1.6em;background:#f6efd9;color:#10101b;border:3px solid #10101b;box-shadow:3px 3px #7d194b;cursor:pointer;margin-top:6px';
  let gone=false;const go=()=>{if(gone)return;gone=true;window.removeEventListener('keydown',key);try{ctx.audio?.sound('UI_CONFIRM')}catch(e){}card.remove();begin();};
  const key=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go();}};
  b.addEventListener('click',go);window.addEventListener('keydown',key);
  const obs=new MutationObserver(()=>{if(!stage.isConnected){gone=true;window.removeEventListener('keydown',key);obs.disconnect();}});obs.observe(document.body,{childList:true,subtree:true});
  card.append(h,r,b);stage.append(card);
 }
 function launch(id,params={},{host,returnScene=null,returnPayload={}}={}){
  const def=registry.get(id);if(!def)return Promise.resolve({quit:true,error:'unknown-minigame'});
  // Range's Armory entry has no adventure dispatcher; use B1's same daily contract here.
  if(id==='range_day'&&window.RARC3&&!window.RARC3.attemptAllowed('range_day','range'))return Promise.resolve({quit:true,outcome:'refused',error:'retry-tomorrow'});
  if(current)current.abort();
  const screen=host||document.querySelector('#screen');
  return new Promise(resolve=>{
   const scope=window.RAScenes?.createScope?.(`minigame:${id}`)||{cleanup(){},cancel(){},timeout:(f,m)=>{const t=setTimeout(f,m);return()=>clearTimeout(t)}};
   const root=document.createElement('section');root.className='ra-minigame';root.dataset.minigame=id;root.setAttribute('aria-label',def.title);
   const stage=document.createElement('div');stage.className='ra-minigame-stage';root.append(stage);
   const quitButton=document.createElement('button');quitButton.type='button';quitButton.className='ra-minigame-quit';quitButton.textContent=params.quitLabel||'✕ QUIT';quitButton.setAttribute('aria-label','Quit minigame');root.append(quitButton);
   screen.append(root);document.body.classList.add('minigame-mode');
   const rewards={};let done=false,instance=null;
   function end(result){
    if(done)return;done=true;current=null;
    try{instance?.dispose?.()}catch(e){console.error(e)}
    scope.cancel?.();root.remove();document.body.classList.remove('minigame-mode');
    const final={quit:false,...result,rewards:mergeRewards(clone(rewards)||{},result?.rewards||{}),minigame:id};
    if(id==='range_day')window.RARC3?.settleAttempt('range_day','range',final);
    const best=progress(id);final.progress=best;
    resolve(final);
    if(returnScene&&window.RAScenes)RAScenes.go(returnScene,{...returnPayload,minigameResult:final});
   }
   const ctx={
    id,params:clone(params),native:{width:270,height:480},scope,
    progress:()=>progress(id),saveProgress:patch=>saveProgress(id,patch),
    reward:partial=>mergeRewards(rewards,partial),
    finish:(result={})=>end({outcome:'done',...result}),
    quit:()=>end({quit:true,outcome:'quit'})
   };
   ctx.audio=window.RAOpenAudio?.scope(root,scope);
   quitButton.addEventListener('click',()=>ctx.quit());
   current={id,abort:()=>ctx.quit(),ctx};
   // RC2 B3: every minigame states its one-sentence rule before it starts (def.rule). Quit stays live on the card.
   const begin=()=>{if(done)return;stage.style.pointerEvents='none';setTimeout(()=>{stage.style.pointerEvents='';},300);try{instance=def.mount(stage,ctx)||{};}catch(error){console.error(error);end({quit:true,error:String(error?.message||error)});}};
   const ruleText=def.ruleFor?.(params)||(typeof def.rule==='function'?def.rule(params):def.rule);
   const coachKey=`rc3Coach:${id}${params.canopyDuty?':chairs':''}`;
   const coached=window.RARC3&&window.RALife?.flag?.(coachKey);
   if(ruleText&&!coached&&!params.skipRule&&!window.RA_SKIP_MINIGAME_RULE){if(window.RARC3)window.RALife.setFlag(coachKey,true);showRuleCard(stage,{...def,rule:ruleText},ctx,begin);}else begin();
  });
 }
 function active(){return current?{id:current.id}:null}
 function quitActive(){current?.abort();}
 window.RAMinigames={register,launch,list:()=>[...registry.values()].filter(d=>!d.retired&&d.kind!=='utility'&&['slurp','dance','range_day'].includes(d.id)).map(({id,title})=>({id,title})),get:id=>registry.get(id)||null,progress,saveProgress,active,quitActive,mergeRewards};
})();
