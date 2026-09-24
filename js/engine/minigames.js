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
 function launch(id,params={},{host,returnScene=null,returnPayload={}}={}){
  const def=registry.get(id);if(!def)return Promise.resolve({quit:true,error:'unknown-minigame'});
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
   quitButton.addEventListener('click',()=>ctx.quit());
   current={id,abort:()=>ctx.quit(),ctx};
   try{instance=def.mount(stage,ctx)||{};}catch(error){console.error(error);end({quit:true,error:String(error?.message||error)});}
  });
 }
 function active(){return current?{id:current.id}:null}
 function quitActive(){current?.abort();}
 window.RAMinigames={register,launch,list:()=>[...registry.values()].map(({id,title})=>({id,title})),get:id=>registry.get(id)||null,progress,saveProgress,active,quitActive,mergeRewards};
})();
