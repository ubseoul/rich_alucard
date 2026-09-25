(function(){
 // Adventure stage: the one dialogue grammar for all new content (HQ Addendum §5 "Dialogue grammar").
 // Speaker tag always; Rich's lines render near his head when he is on stage, otherwise bottom box with RICH tag.
 // Important NPC entrances get a held beat (opts.entrance) before they speak.
 const SLOTS={farLeft:34,left:72,mid:135,right:198,farRight:238};
 const imageCache=new Map();
 function loadImage(src){if(!imageCache.has(src)){const img=new Image();img.src=src;imageCache.set(src,img);}return imageCache.get(src);}
 let root=null,scope=null,envCanvas=null,actorLayer=null,box=null,choicesEl=null,titleEl=null,bubble=null,tapResolver=null,currentEnv=null;
 const personName=id=>{if(!id)return '';if(id==='rich')return 'RICH';const p=window.RABtfPeople?.get(id);return p?p.name:String(id).toUpperCase();};
 function build(host){
  root=document.createElement('section');root.id='adventureScene';root.className='adv-scene';root.setAttribute('aria-label','Adventure');
  const env=RAPixel.createCanvas(root,{className:'adv-env'});envCanvas=env;
  actorLayer=document.createElement('div');actorLayer.className='adv-actors';root.append(actorLayer);
  const loc=document.createElement('div');loc.className='adv-location';root.append(loc);
  bubble=document.createElement('div');bubble.className='adv-bubble';bubble.hidden=true;root.append(bubble);
  box=document.createElement('div');box.className='adv-box';box.hidden=true;box.innerHTML='<b class="adv-speaker"></b><p class="adv-text"></p><i class="adv-more" aria-hidden="true">▼</i>';root.append(box);
  choicesEl=document.createElement('div');choicesEl.className='adv-choices';choicesEl.hidden=true;root.append(choicesEl);
  titleEl=document.createElement('div');titleEl.className='adv-title';titleEl.hidden=true;root.append(titleEl);
  host.append(root);
  scope.listen(root,'click',e=>{if(e.target.closest('button'))return;if(tapResolver){const r=tapResolver;tapResolver=null;r();}});
  scope.listen(document,'keydown',e=>{if((e.key==='Enter'||e.key===' ')&&tapResolver&&!e.target.closest?.('button')){e.preventDefault();const r=tapResolver;tapResolver=null;r();}});
 }
 function waitTap(){return new Promise(resolve=>{tapResolver=resolve;scope?.cleanup(()=>{if(tapResolver===resolve){tapResolver=null;resolve();}});});}
 function paintEnv(id){
  const env=RAEnvironments.get(id)||RAEnvironments.get('street_night');currentEnv=env;const {ctx}=envCanvas;ctx.clearRect(0,0,270,480);
  root.querySelector('.adv-location').textContent=env.name||'';
  if(env.image){const img=loadImage(env.image);const draw=()=>{if(currentEnv!==env)return;ctx.imageSmoothingEnabled=false;if(env.cover){const s=Math.max(270/img.naturalWidth,480/img.naturalHeight),w=img.naturalWidth*s,h=img.naturalHeight*s;ctx.drawImage(img,(270-w)/2,(480-h)/2,w,h);}else ctx.drawImage(img,0,0,270,480);
    // Exact-origin frozen condition layers (e.g. the ocean-floor ladder) draw above the base, below actors.
    for(const layer of env.layers||[]){const L=loadImage(layer);const put=()=>{if(currentEnv===env)ctx.drawImage(L,0,0,270,480)};if(L.complete&&L.naturalWidth)put();else L.addEventListener('load',()=>{if(img.complete)put()},{once:true});}};if(img.complete&&img.naturalWidth)draw();else img.addEventListener('load',draw,{once:true});}
  else RAPixel.paintEnvironment(ctx,env.paint);
  root.dataset.env=env.id;root.classList.toggle('adv-placeholder-env',!!env.placeholder);
 }
 function actorElement(spec){
  const id=typeof spec==='string'?spec:spec.id;const state=typeof spec==='object'?spec.state:null;
  const person=id==='rich'?window.RABtfPeople.rich:window.RABtfPeople.get(id);
  let src=null;
  if(person?.sprite){src=person.sprite;if(state==='vampire'&&person.spriteVampire)src=person.spriteVampire;if(id==='jdm_importer_daughter_001'&&RARelations?.get(id)?.conversionState==='converted')src='assets/jdm_imports/characters/daughter/daughter_vampire_reveal.png';if(id==='ceo_assistant_001'&&RARelations?.get(id)?.conversionState==='converted')src=person.spriteVampire;}
  if(state&&person?.states?.[state])src=person.states[state];// approved frozen state by name (RAArtRegistry)
  if(typeof spec==='object'&&spec.src)src=spec.src;
  let el;
  if(src){el=document.createElement('img');el.src=src;el.alt='';el.draggable=false;}
  else{el=document.createElement('canvas');el.width=80;el.height=96;const c=el.getContext('2d');c.imageSmoothingEnabled=false;RAPixel.drawActor(c,{...(person?.look||{}),...(typeof spec==='object'?spec.look:{})},40,88,1);el.classList.add('adv-placeholder-actor');}
  el.className+=' adv-actor';el.dataset.actor=id;return el;
 }
 function renderActors(actors){
  actorLayer.replaceChildren();const env=currentEnv||{floorY:372,base:1};const s=RADisplay.scaled(env.base||1);
  for(const [slot,spec] of Object.entries(actors||{})){
   if(!spec)continue;const x=typeof spec==='object'&&spec.x!=null?spec.x:SLOTS[slot]??135;const y=typeof spec==='object'&&spec.y!=null?spec.y:env.floorY;
   const el=actorElement(spec);const id=typeof spec==='string'?spec:spec.id;
   Object.assign(el.style,{left:`${(x-40*s)/270*100}%`,top:`${(y-88*s)/480*100}%`,width:`${80*s/270*100}%`,height:`${96*s/480*100}%`});
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
  const stage=RAPresentationDirector.adventureStage(currentEnv,cast,{slots:SLOTS,node,assets});
  const exception=RAPresentationData.adventure.exceptions?.[RAPresentationData.screenKey(currentEnv.id,actors||{})]||null;
  RAPresentationDirector.enter({stage,mode:'dialogue',beat:'default',scope,host:root,env:envCanvas.canvas||envCanvas,actors:elements,autoShot:!node?.shot,exception,envPlaceholder:!!currentEnv.placeholder});
  directorNode=true;
 }
 async function typeText(el,text){el.textContent=text;}
 async function showLine([speaker,text,opts={}]){
  if(!scope?.isActive())return;
  const dev=document.body.classList.contains('dev-enabled');
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
    b.innerHTML=`${c.octopus?'<em>OCTOPUS BRAIN</em>':''}<span>${c.label}</span>${c.sub?`<small>${c.sub}</small>`:''}`;b.disabled=!!c.locked;
    b.addEventListener('click',()=>{choicesEl.hidden=true;choicesEl.replaceChildren();resolve(c);},{once:true});choicesEl.append(b);}
   scope?.cleanup(()=>resolve(null));
  });
 }
 // ROUTE beat: 1–3 legible ways to get there.
 function routeOptions(dest){
  const L=RALife.L(),out=[];const far=dest?.far;
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
   const {node,env,actors}=r;if(directorNode){window.RAPresentationDirector?.exit();directorNode=false;}paintEnv(typeof env==='function'?env(RAAdventures.context()):env);renderActors(actors);stageDirector(actors,node);
   const a=RAAdventures.active();
   if(node.title&&!(a.titles||[]).includes(nodeId)){hideDialogue();await showTitle(typeof node.title==='function'?node.title(RAAdventures.context()):node.title);RAAdventures.patchActive({titles:[...(RAAdventures.active()?.titles||[]),nodeId]});}
   const lines=typeof node.lines==='function'?node.lines(RAAdventures.context()):(node.lines||[]);
   for(const line of lines){if(!scope?.isActive())return;if(line)await showLine(line);}
   if(!scope?.isActive())return;
   if(node.end){hideDialogue();const res=RAAdventures.complete(nodeId);await returnHome(res);return;}
   if(node.route){const opts=routeOptions(typeof node.route.dest==='function'?node.route.dest(RAAdventures.context()):node.route.dest);const pick=await showChoices(opts.map(o=>({...o})));if(!pick)return;applyRoute(pick);nodeId=node.route.next;continue;}
   if(node.choices){const list=RAAdventures.choicesFor(nodeId);if(!list.length){nodeId=node.next?RAAdventures.nextOf(nodeId):null;continue;}const pick=await showChoices(list);if(!pick)return;nodeId=RAAdventures.choose(nodeId,pick.index);continue;}
   if(node.minigame){hideDialogue();const params=typeof node.minigame.params==='function'?node.minigame.params(RAAdventures.context()):(node.minigame.params||{});const result=await RAMinigames.launch(node.minigame.id,params);if(!scope?.isActive())return;nodeId=RAAdventures.afterMinigame(nodeId,result);continue;}
   if(node.fight){hideDialogue();const params=typeof node.fight.params==='function'?node.fight.params(RAAdventures.context()):(node.fight.params||{});const result=await RACombat2.run(node.fight.enemy,params);if(!scope?.isActive())return;nodeId=RAAdventures.afterFight(nodeId,result);continue;}
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
  scope=s;document.body.classList.add('adventure-mode');build(document.querySelector('#screen'));
  const a=RAAdventures.active();if(!a){RAScenes.go('bedroom');return;}
  scope.cleanup(()=>{root?.remove();root=null;tapResolver=null;document.body.classList.remove('adventure-mode');});
  run(payload?.node||a.node);
 }
 RAScenes.register('adventure',{enter,exit(){scope=null;}});
 async function begin(id,opts){if(window.RAPhone?.isOpen?.())await RAPhone.close();const run=RAAdventures.start(id,opts);if(!run)return false;await RAScenes.go('adventure',{});return true;}
 async function resume(){if(!RAAdventures.active())return false;if(window.RAPhone?.isOpen?.())await RAPhone.close();await RAScenes.go('adventure',{});return true;}
 window.RAAdventureScene={begin,resume,routeOptions,slots:SLOTS};
})();
