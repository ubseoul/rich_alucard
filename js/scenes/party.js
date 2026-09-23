(function(){
  const $=id=>document.getElementById(id),data=window.RAPartyData;
  const session=RAParty.createSession();let scope=null;
  // DEV room-local geometry inside the 270x480 shell, not an approved production stage.
  // Reuse Stage Contract anchor math; the entire shell scales as one unit.
  const stage={id:'dev-party-placeholder',native:{width:246,height:144},environment:null,referenceScale:1,
    contactLines:[{id:'floor',y:132}],actors:{rich:{anchor:{x:125,y:132},source:{width:80,height:96,anchor:{x:40,y:88}},facing:'right'}},
    dialogueSafeZones:[{x:3,y:3,width:240,height:34}],uiExclusionZones:[{x:0,y:132,width:246,height:12}],layers:[{id:'floor',z:0},{id:'crowd',z:1},{id:'rich',z:2},{id:'reaction',z:4}]};
  function placeRich(response){
    const anchor={x:response==='corner'?185:response==='follow'?122:125,y:132};
    const rect=RAStageLayout.actorRect({...stage,actors:{rich:{...stage.actors.rich,anchor}}},'rich');
    Object.assign($('rich').style,{left:`${rect.x}px`,top:`${rect.y}px`,width:`${rect.width}px`,height:`${rect.height}px`});
  }
  function render(){
    const state=session.snapshot(),situation=data.situations[state.index],behavior=data.behaviors.find(item=>item.id===state.equipped);
    $('situationTitle').textContent=`${state.index+1}/${data.situations.length} ${situation.title}`;
    $('prompt').textContent=situation.prompt;
    $('reaction').textContent=state.outcome?.reaction||'Pick your behavior. Then show them.';
    $('room').dataset.response=state.outcome?.response||'';
    $('room').dataset.performing=state.outcome?state.equipped:'';
    $('roomState').textContent=state.outcome?.opening?'AN OPENING. TAKE IT?':behavior?`EQUIPPED: ${behavior.label}`:'CHOOSE HOW RICH ACTS';
    for(const button of $('behaviors').children)button.setAttribute('aria-pressed',String(button.dataset.behavior===state.equipped));
    $('act').disabled=!behavior||state.phase==='opening';
    $('act').textContent=state.phase==='choose'?'SHOW THEM':state.outcome?.opening?.label||'TRY ANOTHER BEHAVIOR';
    if(state.phase==='opening')$('act').textContent='YOU TOOK THE OPENING';
    $('next').disabled=!['react','opening'].includes(state.phase);
    placeRich(state.outcome?.response);
  }
  function enter(){
    if(new URLSearchParams(location.search).get('dev')!=='1')return;
    scope?.cancel();scope=RAScenes.createScope('dev-party');session.reset();$('gate').hidden=true;
    scope.listen($('behaviors'),'click',event=>{const button=event.target.closest('[data-behavior]');if(button){session.equip(button.dataset.behavior);render();}});
    scope.listen($('act'),'click',()=>{const state=session.snapshot();if(state.phase==='choose')session.resolve();else if(state.outcome?.opening)session.takeOpening();else session.equip(state.equipped);render();});
    scope.listen($('next'),'click',()=>{session.next();render();});
    scope.listen($('reset'),'click',()=>{session.reset();render();});
    scope.listen($('leave'),'click',leave);
    scope.listen(document,'keydown',event=>{if(event.key==='Escape')leave();});
    render();$('behaviors').firstElementChild.focus();
  }
  function leave(){
    scope?.cancel();scope=null;session.leave();$('room').dataset.response='';$('room').dataset.performing='';
    $('gate').hidden=false;$('exitNote').hidden=false;$('enter').textContent='ENTER AGAIN';$('enter').focus();
  }
  for(const behavior of data.behaviors){const button=document.createElement('button');button.type='button';button.dataset.behavior=behavior.id;button.setAttribute('aria-pressed','false');button.textContent=behavior.label;const hint=document.createElement('small');hint.textContent=behavior.hint;button.append(hint);$('behaviors').append(button);}
  function fit(){document.documentElement.style.setProperty('--scale',Math.min(innerWidth/270,innerHeight/480));}
  addEventListener('resize',fit);fit();placeRich();
  $('build').textContent=window.RABuild?.releaseId||'Source preview';
  if(new URLSearchParams(location.search).get('dev')==='1')$('enter').addEventListener('click',enter);
  else{$('enter').disabled=true;$('enter').textContent='DEV MODE REQUIRED';}
  addEventListener('pagehide',()=>scope?.cancel());
  addEventListener('pageshow',event=>{if(event.persisted)leave();});
})();
