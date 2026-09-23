(function(){
  const stageId='ogun-rave';
  function mount(host,{scope:parentScope,definition={},review=false}={}){
    const scope=parentScope?parentScope.child('rave-stage'):RAScenes.createScope('rave-stage');
    const contract=RAStageLayout.contract(stageId);
    const root=document.createElement('section');root.className='rave-scene';root.setAttribute('aria-label',"Ogun's Rave stage");
    const addImage=(className,src,alt='')=>{const img=document.createElement('img');img.className=className;img.src=src;img.alt=alt;img.draggable=false;root.append(img);return img;};
    addImage('rave-environment',contract.environment);
    const rich=addImage('rave-rich',contract.actors.rich.states.neutral,'Rich');
    const ogun=addImage('rave-ogun',contract.actors.ogun.states.neutral,'Ogun');
    addImage('rave-foreground',contract.foreground.asset);
    const dialogue=document.createElement('div');dialogue.className='rave-dialogue';dialogue.hidden=true;dialogue.setAttribute('role','status');root.append(dialogue);
    const choices=document.createElement('div');choices.className='rave-choices';choices.hidden=true;root.append(choices);
    const overlay=document.createElement('canvas');overlay.width=270;overlay.height=480;overlay.className='rave-contract-overlay';overlay.hidden=true;root.append(overlay);
    host.append(root);
    if(!review){
      const previousFocus=document.activeElement;
      const siblings=[...host.children].filter(node=>node!==root).map(node=>[node,node.inert]);
      for(const [node] of siblings)node.inert=true;
      root.tabIndex=-1;root.focus({preventScroll:true});
      scope.cleanup(()=>{for(const [node,inert] of siblings)node.inert=inert;if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});});
    }
    let depthProbe=false;
    function rectStyle(node,rect){const bounds=root.getBoundingClientRect(),native=contract.native;Object.assign(node.style,{left:`${rect.x*bounds.width/native.width}px`,top:`${rect.y*bounds.height/native.height}px`,width:`${rect.width*bounds.width/native.width}px`,height:`${rect.height*bounds.height/native.height}px`});}
    function layout(){
      const stage=depthProbe?{...contract,actors:{...contract.actors,rich:{...contract.actors.rich,anchor:{x:12,y:320}}}}:contract;
      const bounds=root.getBoundingClientRect();
      for(const [slot,node] of [['rich',rich],['ogun',ogun]]){
        const r=RAStageLayout.transform(stage,RAStageLayout.actorRect(stage,slot),bounds,bounds);
        Object.assign(node.style,{left:`${r.left}px`,top:`${r.top}px`,width:`${r.width}px`,height:`${r.height}px`});
      }
      rectStyle(dialogue,contract.dialogueSafeZones[0]);rectStyle(choices,contract.uiExclusionZones[0]);
      const scale=bounds.width/contract.native.width;
      dialogue.style.fontSize=choices.style.fontSize=`${8*scale}px`;
    }
    const authoredView=definition.onView||(()=>{});
    const session=RARave.createSession({...definition,review,onView(view){
      dialogue.textContent=view.dialogue;dialogue.hidden=!view.dialogue;
      choices.replaceChildren();choices.hidden=!view.choices.length;
      for(const choice of view.choices){const button=document.createElement('button');button.type='button';button.textContent=choice.label;button.dataset.raveChoice=choice.id;choices.append(button);}
      authoredView(view);
    }});
    scope.listen(choices,'click',event=>{const button=event.target.closest('[data-rave-choice]');if(button)session.choose(button.dataset.raveChoice);});
    const observer=new ResizeObserver(layout);observer.observe(root);scope.cleanup(()=>observer.disconnect());
    scope.cleanup(()=>{try{session.leave();}finally{root.remove();}});layout();
    function inspect({zones=false,dialogueProof=false,probe=false}={}){
      if(!review||!scope.active)return false;
      depthProbe=probe;layout();overlay.hidden=!zones;
      const ctx=overlay.getContext('2d');ctx.clearRect(0,0,270,480);ctx.font='6px monospace';
      for(const [color,rects] of [['#71e7ac',contract.dialogueSafeZones],['#e4be70',contract.uiExclusionZones],['#61d1ed',[contract.partyFloor]]]){ctx.strokeStyle=color;for(const r of rects)ctx.strokeRect(r.x,r.y,r.width,r.height);}
      for(const line of contract.contactLines){ctx.strokeStyle='#fc7293';ctx.beginPath();ctx.moveTo(line.x1,line.y);ctx.lineTo(line.x2,line.y);ctx.stroke();}
      dialogue.hidden=!dialogueProof;dialogue.textContent=dialogueProof?'DEV LAYOUT CHECK\nDialogue-safe region. No story content.':'';
      return true;
    }
    return {root,session,inspect,dispose:()=>scope.cancel(),setActorState(slot,state){
      if(!scope.active)return false;const src=contract.actors[slot]?.states?.[state];if(!src)return false;
      ({rich,ogun})[slot].src=src;return true;
    }};
  }
  // Real scene registration, with no production route or authored adventure attached.
  let production=null;
  RAScenes.register(stageId,{
    enter({scope,payload}){production=mount(document.querySelector('#screen'),{scope,definition:payload?.definition||{}});if(payload?.phase)production.session.setPhase(payload.phase);},
    exit(){production?.dispose();production=null;}
  });
  window.RARaveScene={mount,current:()=>production};
})();
