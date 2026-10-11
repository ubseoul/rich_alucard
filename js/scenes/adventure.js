(function(){
 // Adventure stage: the one dialogue grammar for all new content (HQ Addendum §5 "Dialogue grammar").
 // Speaker tag always; Rich's lines render near his head when he is on stage, otherwise bottom box with RICH tag.
 // Important NPC entrances get a held beat (opts.entrance) before they speak.
 const SLOTS={farLeft:34,left:72,mid:135,right:198,farRight:238};
 const imageCache=new Map();
 function loadImage(src){if(!imageCache.has(src)){const img=new Image();img.src=src;imageCache.set(src,img);}return imageCache.get(src);}
 let root=null,scope=null,envCanvas=null,actorLayer=null,foreground=null,box=null,choicesEl=null,titleEl=null,bubble=null,tapResolver=null,currentEnv=null,audio=null;
 const personName=id=>{if(!id)return '';if(id==='rich')return 'RICH';const p=window.RABtfPeople?.get(id);return p?p.name:String(id).toUpperCase();};
 // Both adventure beats and embedded conversations use these same dialogue elements.
 function dialogueElements(parent){
  const speech=document.createElement('div');speech.className='adv-bubble';speech.hidden=true;parent.append(speech);
  const card=document.createElement('div');card.className='adv-box';card.hidden=true;card.innerHTML='<b class="adv-speaker"></b><p class="adv-text"></p><i class="adv-more" aria-hidden="true"></i>';parent.append(card);
  return {bubble:speech,box:card};
 }
 function createDialogue(host,{richNode}={}){
  const ui=dialogueElements(host);
  function show(row){
   const speaker=row.speaker==='RICH'?'rich':row.speaker,text=String(row.text||'');
   ui.box.hidden=!!(speaker==='rich'&&richNode);ui.bubble.hidden=!ui.box.hidden;
   if(!ui.bubble.hidden){
    ui.bubble.replaceChildren();const tag=document.createElement('b');tag.className='adv-speaker';tag.textContent='RICH';const line=document.createElement('span');line.textContent=text;ui.bubble.append(tag,line);
    const r=richNode.getBoundingClientRect(),rr=host.getBoundingClientRect();
    Object.assign(ui.bubble.style,{left:`${Math.max(4,Math.min(rr.width-ui.bubble.offsetWidth-4,r.left-rr.left+r.width*.5-ui.bubble.offsetWidth*.5))}px`,top:`${Math.max(rr.height*.06,r.top-rr.top+r.height*.18-ui.bubble.offsetHeight)}px`});
   }else{
    const tag=ui.box.querySelector('.adv-speaker');tag.textContent=speaker?personName(speaker):'';tag.hidden=!speaker;ui.box.classList.toggle('adv-narration',!speaker);ui.box.querySelector('.adv-text').textContent=text;
   }
  }
  return {show,clear(){ui.box.hidden=true;ui.bubble.hidden=true;},dispose(){ui.box.remove();ui.bubble.remove();}};
 }
 function build(host){
  root=document.createElement('section');root.id='adventureScene';root.className='adv-scene';root.setAttribute('aria-label','Adventure');
  const env=RAPixel.createCanvas(root,{className:'adv-env'});envCanvas=env;
  actorLayer=document.createElement('div');actorLayer.className='adv-actors';root.append(actorLayer);
  foreground=document.createElement('canvas');foreground.width=270;foreground.height=480;foreground.className='adv-foreground';foreground.hidden=true;root.append(foreground);
  const loc=document.createElement('div');loc.className='adv-location';root.append(loc);
  ({bubble,box}=dialogueElements(root));
  choicesEl=document.createElement('div');choicesEl.className='adv-choices';choicesEl.hidden=true;root.append(choicesEl);
  titleEl=document.createElement('div');titleEl.className='adv-title';titleEl.hidden=true;root.append(titleEl);
  host.append(root);
  scope.listen(root,'click',e=>{if(e.target.closest('button'))return;if(tapResolver){const r=tapResolver;tapResolver=null;r();}});
  scope.listen(document,'keydown',e=>{if((e.key==='Enter'||e.key===' ')&&tapResolver&&!e.target.closest?.('button')){e.preventDefault();const r=tapResolver;tapResolver=null;r();}});
 }
 function waitTap(){return new Promise(resolve=>{tapResolver=resolve;scope?.cleanup(()=>{if(tapResolver===resolve){tapResolver=null;resolve();}});});}
 // `props`: frozen world art a node names ([{src,x,y}] — x centre, y contact line), drawn at native 1:1 in the
 // environment's 270×480 space above the base and its layers, below actors (e.g. a delivered car).
 const propSupports=new Map();
 // Only approved vehicle props use opaque wheel support. Frozen arcs retain full-cell placement.
 function propSupport(p,img,env){
  const active=window.RAAdventures?.active?.(),frozen=/^G[1-9](?:[-:]|$)/.test(active?.id||'')||active?.id==='LEGENDARY_RECOGNITION'||/^G3-/.test(env.id)||Object.values(active?.actors||{}).some(v=>['G1','LEGENDARY-MASK'].includes(typeof v==='string'?v:v?.id));
  if(frozen||!Object.values(window.RAArtRegistry?.vehicles?.world||{}).some(v=>v?.asset===p.src))return img.naturalHeight;
  if(Number.isFinite(p.supportY))return p.supportY;
  const authored=window.RAPresentationAssets?.[p.src]?.support?.y;if(Number.isFinite(authored))return authored;
  if(propSupports.has(p.src))return propSupports.get(p.src);
  const cv=document.createElement('canvas');cv.width=img.naturalWidth;cv.height=img.naturalHeight;const c=cv.getContext('2d');c.drawImage(img,0,0);const a=c.getImageData(0,0,cv.width,cv.height).data;
  let y=cv.height;outer:for(let j=cv.height-1;j>=0;j--)for(let x=0;x<cv.width;x++)if(a[(j*cv.width+x)*4+3]>=128){y=j+1;break outer;}
  propSupports.set(p.src,y);return y;
 }
 function paintEnv(id,surface,props=[]){
  window.RAOpenAudio?.environment(audio,id,RAEnvironments.get(id)?.paint?.rain);const env=RAEnvironments.get(id)||RAEnvironments.get('street_night');currentEnv=env;const {ctx}=envCanvas;ctx.clearRect(0,0,270,480);
  root.querySelector('.adv-location').textContent=env.name||'';
  // Exact-origin frozen layers: always-on (e.g. the ocean-floor ladder) plus surface-scoped conditions draw above the
  // base, below actors; surface-scoped foreground layers draw on their own layer above actors, below the UI.
  const scoped=RAEnvironments.surfaceLayers(env,surface);
  const fctx=foreground.getContext('2d');fctx.clearRect(0,0,270,480);foreground.hidden=!scoped.over.length;
  if(env.image){const img=loadImage(env.image);const draw=()=>{if(currentEnv!==env)return;RAEnvironments.drawImage(ctx,img,env);
    for(const [layers,c] of [[[...(env.layers||[]),...scoped.under],ctx],[scoped.over,fctx]])for(const layer of layers){const L=loadImage(layer);const put=()=>{if(currentEnv===env)RAEnvironments.drawImage(c,L,env)};if(L.complete&&L.naturalWidth)put();else L.addEventListener('load',()=>{if(img.complete)put()},{once:true});}
    const pending=props.map(p=>loadImage(p.src)).filter(P=>!(P.complete&&P.naturalWidth));
    if(pending.length){for(const P of pending)P.addEventListener('load',()=>{if(currentEnv===env&&pending.every(q=>q.complete&&q.naturalWidth))draw();},{once:true});}
    else for(const p of props){const P=loadImage(p.src);ctx.imageSmoothingEnabled=false;const support=propSupport(p,P,env);if(support!==P.naturalHeight){ctx.fillStyle='rgba(8,7,17,.35)';ctx.fillRect(Math.round(p.x-P.naturalWidth/2)+8,Math.round(p.y)-1,P.naturalWidth-16,2);}ctx.drawImage(P,Math.round(p.x-P.naturalWidth/2),Math.round(p.y-support));}};if(img.complete&&img.naturalWidth)draw();else img.addEventListener('load',draw,{once:true});}
  else RAPixel.paintEnvironment(ctx,env.paint);
  root.dataset.env=env.id;root.classList.toggle('adv-placeholder-env',!!env.placeholder);
  return scoped;
 }
 // Slot positions registered to active surface-scoped layers (a seat, a table) act as the slot's authored x.
 function registeredActors(actors,slots){
  if(!actors||!Object.keys(slots||{}).length)return actors;
  return Object.fromEntries(Object.entries(actors).map(([slot,spec])=>[slot,spec&&slots[slot]?{...(typeof spec==='string'?{id:spec}:spec),...slots[slot]}:spec]));
 }
 function actorElement(spec){
  const id=typeof spec==='string'?spec:spec.id;
  // Presentation only: match these existing authored beats to their approved costume/pose.
  // Explicit node states always win. Combat move poses remain owned by the combat timeline adapter.
  const active=RAAdventures.active(),beat=`${active?.id}:${active?.node}`;
  const poses={'NEW_OGA_M4:beat4':{carlos:'betrayed'},'NEW_OGA_M4:walk_in':{carlos:'canopy_apron'},'NEW_OGA_M6:walked':{senator:'asleep'}};
  const state=(typeof spec==='object'?spec.state:null)||poses[beat]?.[id]||null;
  const person=id==='rich'?window.RABtfPeople.rich:window.RABtfPeople.get(id);
  let src=null;
  if(person?.sprite){src=person.sprite;if(state==='vampire'&&person.spriteVampire)src=person.spriteVampire;if(id==='jdm_importer_daughter_001'&&RARelations?.get(id)?.conversionState==='converted')src='assets/jdm_imports/characters/daughter/daughter_vampire_reveal.png';if(id==='ceo_assistant_001'&&RARelations?.get(id)?.conversionState==='converted')src=person.spriteVampire;}
  if(state&&person?.states?.[state])src=person.states[state];// approved frozen state by name (RAArtRegistry)
  if(typeof spec==='object'&&spec.src)src=spec.src;
  let el;
  if(src){el=document.createElement('img');el.src=src;el.alt='';el.draggable=false;}
  else{el=document.createElement('canvas');el.width=80;el.height=96;const c=el.getContext('2d');c.imageSmoothingEnabled=false;RAPixel.drawActor(c,{...(person?.look||{}),...(typeof spec==='object'?spec.look:{})},40,88,1);el.classList.add('adv-placeholder-actor');}
  el.className+=' adv-actor';el.dataset.actor=id;
  el.dataset.artPath=src||'';el.dataset.artState=state||person?.anchorPose||'default';
  if(state&&!person?.states?.[state]&&state!=='vampire'&&!(typeof spec==='object'&&spec.src))el.dataset.artFallback='missing-state';
  if(!src)el.dataset.artFallback='missing-identity';return el;
 }
 function renderActors(actors){
  actorLayer.replaceChildren();const env=currentEnv||{floorY:372,base:1};const s=RADisplay.scaled(env.base||1);
  for(const [slot,spec] of Object.entries(actors||{})){
   if(!spec)continue;const x=typeof spec==='object'&&spec.x!=null?spec.x:SLOTS[slot]??135;const y=typeof spec==='object'&&spec.y!=null?spec.y:env.floorY;
   const el=actorElement(spec);const id=typeof spec==='string'?spec:spec.id;
   const art=window.RAArtRegistry?.characters?.[id]||window.RAArtRegistry?.creatures?.[id];
   const meta=window.RAPresentationAssets?.[el.dataset.artPath];
   const [w,h]=meta?[meta.width,meta.height]:art?.cell||[80,96];
   const [ax,ay]=meta?.anchor||art?.contact||[40,88],scale=s*(art?.stageScale||1);
   Object.assign(el.style,{left:`${(x-ax*scale)/270*100}%`,top:`${(y-ay*scale)/480*100}%`,width:`${w*scale/270*100}%`,height:`${h*scale/480*100}%`});
   const faceLeft=(typeof spec==='object'&&spec.flip)||(id==='rich'&&x>150);if(faceLeft)el.style.transform='scaleX(-1)';
   if(typeof spec==='object'&&spec.hidden)el.style.opacity='0';
   el.dataset.slot=slot;actorLayer.append(el);
  }
 }
 function actorNode(id){return actorLayer.querySelector(`[data-actor="${CSS.escape(id)}"]`)||root?.querySelector(`#pdWorld [data-actor="${CSS.escape(id)}"]`);}
 // Presentation Director adapter (pilot allowlist): the node's environment + slot actors become a Director
 // stage; the Director owns camera, actor size and the UI-aware world viewport. Other environments keep the
 // legacy full-frame staging until migrated.
 let directorNode=false;
 function directorEnabled(env){const list=window.RAPresentationData?.adventure?.environments;return !!window.RAPresentationDirector&&!window.__pdLegacy&&!!env&&(list==='all'||(list||[]).includes(env.id));}
 function stageDirector(actors,node){
  directorNode=false;if(!directorEnabled(currentEnv)){window.RAPresentationDirector?.exit();return;}
  const cast={},elements={};
  for(const el of actorLayer.children){const slot=el.dataset.slot,spec=actors?.[slot];if(!slot||!spec)continue;const id=typeof spec==='string'?spec:spec.id;const x=typeof spec==='object'&&spec.x!=null?spec.x:SLOTS[slot]??135;
   cast[slot]={...(typeof spec==='object'?spec:{}),id,x,flip:(typeof spec==='object'&&spec.flip)||(id==='rich'&&x>150)};elements[slot]=el;}
  const assets=Object.fromEntries(Object.entries(elements).map(([slot,el])=>[slot,RAPresentationDirector.assetOf(el)]));
  const stage=window.RAWorldPresentation?.stage(currentEnv,cast)||RAPresentationDirector.adventureStage(currentEnv,cast,{slots:SLOTS,node,assets});
  const exception=RAPresentationData.adventure.exceptions?.[RAPresentationData.screenKey(currentEnv.id,actors||{})]||null;
  RAPresentationDirector.enter({stage,mode:'dialogue',beat:'default',scope,host:root,env:envCanvas.canvas||envCanvas,actors:elements,worldLayers:foreground.hidden?[]:[{el:foreground,rect:[0,0,270,480]}],autoShot:!node?.shot?.profile,exception,envPlaceholder:!!currentEnv.placeholder});
  directorNode=true;
 }
 async function typeText(el,text){el.textContent=text;}
 async function showLine([speaker,text,opts={}]){
  if(!scope?.isActive())return;
  speaker=opts.narration?speaker:(window.RAWorldPresentation?.speaker(speaker)??speaker);
  if(opts.narration)speaker=null; // preserve entrance actor while presenting explicit staging as narration
  window.RAOpenAudio?.voice(audio,speaker,opts);const dev=document.body.classList.contains('dev-enabled');
  if(opts.entrance){const node=actorNode(opts.entrance);if(node){node.classList.add('adv-entrance');}}
  const richOnStage=speaker==='rich'&&actorNode('rich');
  if(richOnStage){
   box.hidden=true;bubble.hidden=false;bubble.innerHTML=`<b class="adv-speaker">RICH${opts.vp&&dev?' <span class="adv-vp">VP</span>':''}</b><span></span>`;await typeText(bubble.querySelector('span'),text);
   const n=actorNode('rich'),r=n.getBoundingClientRect(),rr=root.getBoundingClientRect();
   // Director scenes: bubble sits just above the visible head, clamped inside the world viewport.
   const slot=n.dataset.slot,body=directorNode?RAPresentationDirector.actorBox(slot):null,world=directorNode?RAPresentationDirector.worldRect():null;
   const left=body?Math.max(world.x+4,Math.min(world.x+world.w-bubble.offsetWidth-4,body.visible.x+body.visible.w*.5-bubble.offsetWidth*.5)):Math.max(4,Math.min(rr.width-bubble.offsetWidth-4,r.left-rr.left+r.width*.5-bubble.offsetWidth*.5));
   const top=body?Math.max(world.y+4,body.visible.y-bubble.offsetHeight-6):Math.max(rr.height*.06,r.top-rr.top+r.height*.18-bubble.offsetHeight);
   Object.assign(bubble.style,{left:`${left}px`,top:`${top}px`});
  }else{
   bubble.hidden=true;box.hidden=false;const sp=box.querySelector('.adv-speaker');
   sp.textContent=speaker?personName(speaker):'';sp.hidden=!speaker;box.classList.toggle('adv-narration',!speaker);
   if(opts.vp&&dev)sp.insertAdjacentHTML('beforeend',' <span class="adv-vp">VP</span>');
   await typeText(box.querySelector('.adv-text'),text);
  }
  for(const n of actorLayer.children)n.classList.toggle('adv-speaking',n.dataset.actor===speaker);
  await waitTap();
  if(opts.entrance)actorNode(opts.entrance)?.classList.remove('adv-entrance');
 }
 function hideDialogue(){box.hidden=true;bubble.hidden=true;}
 async function showTitle(text){titleEl.hidden=false;titleEl.innerHTML=`<span>${text}</span><small>TAP</small>`;await waitTap();titleEl.hidden=true;}
 function showChoices(list){
  hideDialogue();choicesEl.hidden=false;choicesEl.replaceChildren();
  return new Promise(resolve=>{
   for(const c of list){const b=document.createElement('button');b.type='button';b.className='adv-choice'+(c.octopus?' adv-octopus':'')+(c.locked?' adv-locked':'');
    // A choice may carry frozen item art (a store's fit/item, the armory's gun case), shown at native pixels.
    b.innerHTML=`${c.icon?`<img class="adv-choice-icon" src="${c.icon}" alt="" draggable="false">`:''}${c.octopus?'<em>OCTOPUS BRAIN</em>':''}<span>${c.label}</span>${c.sub?`<small>${c.sub}</small>`:''}`;b.disabled=!!c.locked;
    b.addEventListener('click',()=>{choicesEl.hidden=true;choicesEl.replaceChildren();resolve(c);},{once:true});choicesEl.append(b);}
   scope?.cleanup(()=>resolve(null));
  });
 }
 // ROUTE beat: 1–3 legible ways to get there.
 function routeOptions(dest){
  const L=RALife.L(),out=[];
  // Georgia is a flight away (VOL 1 A37 "fly or dragon to Atlanta"): string destinations 'atl' / 'POWDER SPRINGS' are far.
  const far=typeof dest==='string'?/^(atl|powder springs)$/i.test(dest):dest?.far;
  if(far){out.push({id:'fly',label:'BOOK A FLIGHT',sub:'$420'});if(L.hasRoom('dragon_roost')&&L.dragon?.stage==='majestic')out.push({id:'dragon',label:'FLY ON MAZDA',sub:'FREE. SHE IS FAST.'});return out;}
  for(const car of RALife.ownedCars().slice(0,2))out.push({id:`car:${car.id}`,label:`DRIVE THE ${(car.short||car.model||'CAR').toUpperCase()}`,sub:car.kit?'BODY KIT ON':''});
  if(dest?.walkable!==false)out.push({id:'walk',label:dest?.walkLabel||'WALK IT',sub:''});
  if(out.length<3)out.push({id:'ride',label:'CALL A RIDE',sub:'$18'});
  if(L.hasRoom('dragon_roost')&&L.dragon?.stage==='majestic'&&out.length<4)out.push({id:'dragon',label:'FLY ON MAZDA',sub:''});
  return out.slice(0,4);
 }
 function applyRoute(opt){const A=RAAdventures.context();A.set('route',opt.id);if(opt.id==='fly')RALife.spend(420);if(opt.id==='ride')RALife.spend(18);if(opt.id.startsWith('car:')){A.set('car',opt.id.slice(4));window.RANodd?.maybeStop?.();}}
 async function run(nodeId){
  while(scope?.isActive()&&nodeId){
   const r=RAAdventures.enter(nodeId);if(!r){await leave();return;}
   const {node,env,actors}=r;if(directorNode){window.RAPresentationDirector?.exit();directorNode=false;}const envId=typeof env==='function'?env(RAAdventures.context()):env;const props=(typeof node.props==='function'?node.props(RAAdventures.context()):node.props||[]).filter(p=>p?.src);const registered=registeredActors(actors,paintEnv(envId,{key:window.RAPresentationData?.screenKey(RAEnvironments.get(envId)?.id||'street_night',actors||{}),node:`${r.def.id}:${nodeId}`},props).slots);const staged=window.RAWorldPresentation?.actors(currentEnv,registered)||registered;renderActors(staged);stageDirector(staged,node);window.RAWorldPresentation?.mount(root,scope,currentEnv,staged);
   window.RAOpenAudio?.beat?.(audio,r.def.id,nodeId);const a=RAAdventures.active();
   if(node.openingAction){hideDialogue();const shown=await window.RAOpeningTimeline?.play(root,scope,node);if(!scope?.isActive()||shown?.cancelled)return;}
   if(node.title&&!(a.titles||[]).includes(nodeId)){hideDialogue();await showTitle(typeof node.title==='function'?node.title(RAAdventures.context()):node.title);RAAdventures.patchActive({titles:[...(RAAdventures.active()?.titles||[]),nodeId]});}
   const lines=RAAdventures.linesFor(nodeId);
   for(const line of lines){if(!scope?.isActive())return;if(line)await showLine(line);}
   if(!scope?.isActive())return;
   if(node.presentation){hideDialogue();const presented=await window.RAWorldPresentation?.play(root,scope,node);if(presented?.cancelled||!scope?.isActive())return;if(presented?.reason)root.dataset.presentationLimit=presented.reason;}
   if(node.end){hideDialogue();let res=RAAdventures.complete(nodeId);while(!res&&RAAdventures.active()){const retry=await showChoices([{label:'TRY SAVING AGAIN',sub:'YOUR PROGRESS COULD NOT BE SAVED'}]);if(!retry||!scope?.isActive())return;res=RAAdventures.complete(nodeId);}await returnHome(res);return;}
   if(node.route){const opts=routeOptions(typeof node.route.dest==='function'?node.route.dest(RAAdventures.context()):node.route.dest);const pick=await showChoices(opts.map(o=>({...o})));if(!pick)return;applyRoute(pick);nodeId=node.route.next;continue;}
   // Every choice locked (e.g. nothing affordable) and no authored fallback: never strand the player on a screen with
   // no control. They leave the way the castle menu answers — "not tonight." — and the night is not counted.
   if(node.choices){const list=RAAdventures.choicesFor(nodeId);if(!list.length){if(node.next){nodeId=RAAdventures.nextOf(nodeId);continue;}const out=await showChoices([{label:'NOT TONIGHT',sub:'NOTHING HERE YOU CAN DO RIGHT NOW'}]);if(!out)return;RAAdventures.abandon();await leave();return;}const pick=await showChoices(list);if(!pick)return;nodeId=RAAdventures.choose(nodeId,pick.index);continue;}
   if(node.minigame||node.fight){
    hideDialogue();const id=RAAdventures.active().id,policy=window.RARC3;
    if(policy&&!policy.attemptAllowed(id,nodeId)){policy.suspend();await leave();return;}
    let result;
    try{const spec=node.minigame||node.fight,params=typeof spec.params==='function'?spec.params(RAAdventures.context()):(spec.params||{});
     result=node.minigame?await RAMinigames.launch(spec.id,params):await RACombat2.run(spec.enemy,params);
    }catch(error){console.error('adventure activity',id,nodeId,error);result={quit:true,error:String(error?.message||error)};}
    if(!scope?.isActive())return;
    if(policy&&policy.settleAttempt(id,nodeId,result)==='paused'){
     policy.suspend();await leave();return;
    }
    nodeId=node.minigame?RAAdventures.afterMinigame(nodeId,result):RAAdventures.afterFight(nodeId,result);continue;
   }
   nodeId=RAAdventures.nextOf(nodeId);
  }
 }
 async function returnHome(res){
  if(res?.chain&&RAAdventures.available(res.chain)){RAAdventures.start(res.chain,{from:'chain',vars:res.chainVars||{}});await RAScenes.go('adventure',{chained:true});return;}
  document.body.classList.remove('adventure-mode');
  const dest=res?.location||'bedroom';
  await RAScenes.go(dest==='bedroom'?'bedroom':dest,{returnBeat:true,adventure:res?.id});
 }
 async function leave(){await RAScenes.go('bedroom',{});}
 function enter({scope:s,payload}){
  scope=s;document.body.classList.add('adventure-mode');build(document.querySelector('#screen'));audio=window.RAOpenAudio?.scope(root,scope);
  scope.cleanup(()=>{root?.remove();root=null;tapResolver=null;document.body.classList.remove('adventure-mode');});
  const a=RAAdventures.active();if(!a){RAScenes.go('bedroom');return;} // RC2: the blank overlay must be torn down even when there is nothing to run
  run(payload?.node||a.node);
 }
 RAScenes.register('adventure',{enter,exit(){scope=null;}});
 async function begin(id,opts){if(window.RAPhone?.isOpen?.())await RAPhone.close();const run=RAAdventures.start(id,opts);if(!run)return false;await RAScenes.go('adventure',{});return true;}
 async function resume(){if(!RAAdventures.active())return false;if(window.RAPhone?.isOpen?.())await RAPhone.close();await RAScenes.go('adventure',{});return true;}
 window.RAAdventureScene={begin,resume,routeOptions,slots:SLOTS,createDialogue};
})();
