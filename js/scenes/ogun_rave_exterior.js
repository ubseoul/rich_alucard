(function(){
  // Exterior incidental companions remain text-only until a future Art Production Card
  // supplies dedicated companion sprites.
  const stageId='ogun-rave-exterior';
  const ENVIRONMENT='assets/ogun_rave/masters/rave_exterior_270x480.png';
  function mount(host){
    const scope=RAScenes.createScope('ogun-rave-exterior-stage');
    const root=document.createElement('section');root.className='rave-exterior-scene';root.setAttribute('aria-label',"Outside Ogun's Rave");
    const sky=document.createElement('img');sky.className='rave-exterior-environment';sky.src=ENVIRONMENT;sky.alt='';sky.draggable=false;root.append(sky);
    const sign=document.createElement('div');sign.className='rave-exterior-sign';sign.textContent='IN-N-GHOUL';root.append(sign);
    const rich=document.createElement('img');rich.className='rave-exterior-rich';rich.src='assets/rich_standing_right.png';rich.alt='Rich';rich.draggable=false;root.append(rich);
    const dialogue=document.createElement('div');dialogue.className='rave-dialogue rave-exterior-dialogue';dialogue.dataset.pdUi='dialogue';dialogue.hidden=true;dialogue.setAttribute('role','status');root.append(dialogue);
    const choices=document.createElement('div');choices.className='rave-choices rave-exterior-choices';choices.dataset.pdUi='choices';choices.hidden=true;root.append(choices);
    host.append(root);
    // Presentation Director (Wave 3): same adapter contract as the adventure screens in this environment
    // (Rich on the environment floor, conversation framing); the neon sign is world-anchored type.
    if(window.RAPresentationDirector&&!window.__pdLegacy){
     const stage=RAPresentationDirector.adventureStage(RAEnvironments.get('rave_exterior'),{left:{id:'rich',x:72}},{});stage.id=stageId;
     RAPresentationDirector.enter({stage,mode:'dialogue',beat:'default',host:root,scope,env:sky,envAsset:ENVIRONMENT,actors:{left:rich},worldLayers:[{el:sign,rect:[150,178,98,16]}],autoShot:true});
    }
    const previousFocus=document.activeElement;
    const siblings=[...host.children].filter(node=>node!==root).map(node=>[node,node.inert]);
    for(const [node] of siblings)node.inert=true;
    root.tabIndex=-1;root.focus({preventScroll:true});
    scope.cleanup(()=>{for(const [node,inert] of siblings)node.inert=inert;if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});});
    const definition=window.RAOgunRave.buildExteriorDefinition();
    const session=RARave.createSession({...definition,onView(view){
      dialogue.textContent=view.dialogue;dialogue.hidden=!view.dialogue;
      choices.replaceChildren();choices.hidden=!view.choices.length;
      for(const choice of view.choices){const button=document.createElement('button');button.type='button';button.textContent=choice.label;button.dataset.raveChoice=choice.id;choices.append(button);}
    }});
    window.RAOgunRave.mountExterior(session);
    scope.listen(choices,'click',event=>{const button=event.target.closest('[data-rave-choice]');if(button)session.choose(button.dataset.raveChoice);});
    scope.cleanup(()=>{try{session.leave();}finally{window.RAOgunRave.unmountExterior();root.remove();}});
    const record=window.RAOgunRave.active();
    const startPhase=record?.phase?.startsWith('exterior-')?record.phase.slice('exterior-'.length):'outside';
    session.setPhase(startPhase);
    return {root,session,dispose:()=>scope.cancel()};
  }
  let production=null;
  RAScenes.register(stageId,{
    enter({scope}){document.body.classList.add('ogun-rave-mode');production=mount(document.querySelector('#screen'));},
    exit(){production?.dispose();production=null;}
  });
  window.RAOgunRaveExterior={mount,current:()=>production};
})();
