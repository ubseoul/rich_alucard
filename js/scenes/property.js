(function(){
  const SPEAKER_NAMES={shannon:'SHANNON',rich:'RICH'};
  function mount(stageId,host,{scope:parentScope,definition={},phase}={}){
    const scope=parentScope?parentScope.child('property-stage'):RAScenes.createScope('property-stage');
    const contract=RAStageLayout.contract(stageId);
    const isInterior=stageId==='property-la-4p-interior';
    const root=document.createElement('section');root.className='property-scene';root.setAttribute('aria-label',isInterior?'Fourplex interior':'Fourplex exterior');root.tabIndex=-1;
    const addImage=(className,src,alt='')=>{const img=document.createElement('img');img.className=className;img.src=src;img.alt=alt;img.draggable=false;root.append(img);return img;};
    const envImg=addImage('property-environment',contract.environment);
    let overlay=null;
    if(isInterior){overlay=addImage('property-overlay property-hidden',contract.problemOverlay);}
    const rich=addImage('property-actor property-rich',contract.actors.rich.states.neutral,'Rich');
    const shannon=addImage('property-actor property-shannon property-hidden',contract.actors.shannon.states.neutral,'Shannon');
    const ratNodes=isInterior?[0,1,2].map(i=>{const img=addImage(`property-rat property-rat-${i} property-hidden`,contract.rat.states.alert,'');return img;}):[];
    const dialogue=document.createElement('div');dialogue.className='property-dialogue panel';dialogue.dataset.pdUi='dialogue';dialogue.setAttribute('role','status');
    const speakerLabel=document.createElement('p');speakerLabel.className='property-speaker';dialogue.append(speakerLabel);
    const textEl=document.createElement('p');textEl.className='property-line-text';dialogue.append(textEl);
    const advanceHint=document.createElement('span');advanceHint.className='property-advance-hint';advanceHint.textContent='▼';dialogue.append(advanceHint);
    root.append(dialogue);
    const hotspotLayer=document.createElement('div');hotspotLayer.className='property-hotspots';root.append(hotspotLayer);
    const hotspotButtons={};
    for(const id of Object.keys(contract.hotspots||{})){
      const button=document.createElement('button');button.type='button';button.className='property-hotspot';button.dataset.hotspot=id;button.setAttribute('aria-label',id);
      hotspotLayer.append(button);hotspotButtons[id]=button;
    }
    const choices=document.createElement('div');choices.className='property-choices';choices.dataset.pdUi='choices';choices.hidden=true;root.append(choices);
    const numbersPanel=document.createElement('div');numbersPanel.className='property-numbers-panel';numbersPanel.hidden=true;root.append(numbersPanel);
    host.append(root);
    // Presentation Director (Wave 3): camera, actor size, overlays and hotspots come from the Director.
    const directed=!!window.RAPresentationDirector&&!window.__pdLegacy;
    if(directed)RAPresentationDirector.enterMounted({stage:stageId,host:root,scope,env:envImg,actors:{rich,shannon,...Object.fromEntries(ratNodes.map((node,i)=>[`rat${i}`,node]))},overlays:[overlay],hotspots:hotspotButtons});
    const previousFocus=document.activeElement;
    const siblings=[...host.children].filter(node=>node!==root).map(node=>[node,node.inert]);
    for(const [node] of siblings)node.inert=true;
    root.focus({preventScroll:true});
    scope.cleanup(()=>{for(const [node,inert] of siblings)node.inert=inert;if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});});

    function rectStyle(node,rect){const bounds=root.getBoundingClientRect(),native=contract.native;Object.assign(node.style,{left:`${rect.x*bounds.width/native.width}px`,top:`${rect.y*bounds.height/native.height}px`,width:`${rect.width*bounds.width/native.width}px`,height:`${rect.height*bounds.height/native.height}px`});}
    function layout(){
      if(directed){RAPresentationDirector.relayout();dialogue.style.fontSize=choices.style.fontSize=`${8*root.getBoundingClientRect().width/contract.native.width}px`;return}
      const bounds=root.getBoundingClientRect();
      const r1=RAStageLayout.transform(contract,RAStageLayout.actorRect(contract,'rich'),bounds,bounds);
      Object.assign(rich.style,{left:`${r1.left}px`,top:`${r1.top}px`,width:`${r1.width}px`,height:`${r1.height}px`});
      const r2=RAStageLayout.transform(contract,RAStageLayout.actorRect(contract,'shannon'),bounds,bounds);
      Object.assign(shannon.style,{left:`${r2.left}px`,top:`${r2.top}px`,width:`${r2.width}px`,height:`${r2.height}px`});
      if(isInterior&&contract.ratSlots){
        ratNodes.forEach((img,i)=>{
          const slot=contract.ratSlots[i];
          const rect={x:slot.x-contract.rat.source.anchor.x*contract.referenceScale,y:slot.y-contract.rat.source.anchor.y*contract.referenceScale,width:contract.rat.source.width*contract.referenceScale,height:contract.rat.source.height*contract.referenceScale,contact:slot};
          const r=RAStageLayout.transform(contract,rect,bounds,bounds);
          Object.assign(img.style,{left:`${r.left}px`,top:`${r.top}px`,width:`${r.width}px`,height:`${r.height}px`});
        });
      }
      rectStyle(dialogue,contract.dialogueSafeZones[0]);
      rectStyle(choices,contract.uiExclusionZones[0]);
      const scale=bounds.width/contract.native.width;
      dialogue.style.fontSize=choices.style.fontSize=`${8*scale}px`;
      for(const [id,rect] of Object.entries(contract.hotspots||{}))if(hotspotButtons[id])rectStyle(hotspotButtons[id],rect);
    }

    function renderRats(activeState){
      if(!isInterior)return;
      const count=activeState==='scurry'?2:activeState?1:0;
      ratNodes.forEach((img,i)=>{
        img.classList.toggle('property-hidden',i>=count);
        if(i<count)img.src=contract.rat.states[activeState]||contract.rat.states.alert;
      });
    }

    let lastView=null;
    function render(view){
      lastView=view;
      shannon.classList.toggle('property-hidden',!view.actors?.shannon);
      overlay?.classList.toggle('property-hidden',!['first_sign','rat_reveal','rat_pressure','pressure_resolve','offer'].includes(view.phaseId));
      renderRats(view.rat?.state||null);
      const speaker=SPEAKER_NAMES[view.speakerId]||'';
      speakerLabel.textContent=speaker;speakerLabel.hidden=!speaker;
      textEl.textContent=view.text;
      advanceHint.hidden=view.linesDone||view.hotspotActive;
      dialogue.hidden=!view.text;
      numbersPanel.hidden=true;
      const showChoices=view.linesDone&&!view.hotspotActive&&view.choices.length>0;
      choices.hidden=!showChoices;choices.replaceChildren();
      if(showChoices)for(const choice of view.choices){const button=document.createElement('button');button.type='button';button.textContent=choice.label;button.dataset.propertyChoice=choice.id;choices.append(button);}
      for(const [id,button] of Object.entries(hotspotButtons)){
        const visible=view.mode==='hotspot'&&view.linesDone&&!view.hotspotActive;
        button.hidden=!visible;
        button.classList.toggle('property-hotspot-inspected',view.inspected?.includes(id));
      }
      // Wave 4: the interior camera widens only while the player inspects hotspots.
      if(directed&&isInterior){const beat=view.mode==='hotspot'&&view.linesDone&&!view.hotspotActive?'inspect':'talk';if(RAPresentationDirector.current()?.beat!==beat)RAPresentationDirector.setBeat(beat,{transition:'snap-pan',ms:280});}
      layout();
    }

    function advanceOrDismiss(){
      if(!session)return;
      if(!session.view().linesDone||session.view().hotspotActive)session.advance();
    }
    scope.listen(dialogue,'click',advanceOrDismiss);
    scope.listen(choices,'click',e=>{const button=e.target.closest('[data-property-choice]');if(button)session.choose(button.dataset.propertyChoice)});
    scope.listen(hotspotLayer,'click',e=>{const button=e.target.closest('[data-hotspot]');if(button)session.inspect(button.dataset.hotspot)});
    const observer=new ResizeObserver(layout);observer.observe(root);scope.cleanup(()=>observer.disconnect());

    const session=window.RAProperty.createSession({...definition,onView:render});
    scope.cleanup(()=>{try{session.leave();}finally{root.remove();}});
    session.setPhase(phase||(isInterior?'int_entry':'ext_arrival'));
    layout();
    return {root,session,
      flashNumbers(){numbersPanel.hidden=false;numbersPanel.innerHTML=`<p>ASKING (CUT): $${new Intl.NumberFormat('en-US').format(window.RAPropertyQuest?.priceCut||0)}</p><p>ASKING (AS-IS): $${new Intl.NumberFormat('en-US').format(window.RAPropertyQuest?.priceAsis||0)}</p><p>EST. MONTHLY: $${new Intl.NumberFormat('en-US').format(window.RAPropertyQuest?.monthlyIncome||0)}</p>`;scope.timeout(()=>{numbersPanel.hidden=true;},4200);},
      flashMessage(text){numbersPanel.hidden=false;numbersPanel.innerHTML=`<p>${text}</p>`;scope.timeout(()=>{numbersPanel.hidden=true;},2600);}
    };
  }
  let current=null;
  function enter(stageId,{scope,payload}){
    document.body.classList.add('property-mode');
    current=mount(stageId,document.querySelector('#screen'),{scope,definition:payload?.definition||{},phase:payload?.phase});
  }
  function exit(){current?.root?.remove();current=null;}
  RAScenes.register('property-la-4p-exterior',{enter:({scope,payload})=>enter('property-la-4p-exterior',{scope,payload}),exit});
  RAScenes.register('property-la-4p-interior',{enter:({scope,payload})=>enter('property-la-4p-interior',{scope,payload}),exit});
  window.RAPropertyScene={current:()=>current,mount,
    flashNumbers(){current?.flashNumbers?.();},
    flashMessage(text){current?.flashMessage?.(text);}
  };
})();
