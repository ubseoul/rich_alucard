(function(){
  const $=id=>document.getElementById(id),enabled=new URLSearchParams(location.search).get('dev')==='1';
  let mounted=null,scope=null;
  function exit(){scope?.cancel();scope=null;mounted?.dispose();mounted=null;$('inspection').hidden=true;$('enterRave').hidden=false;$('reviewStatus').textContent='Review ended. Close this tab to return to your game.';}
  function enter(){
    if(!enabled)return;exit();scope=RAScenes.createScope('rave-review');mounted=RARaveScene.mount($('screen'),{scope,review:true});
    for(const id of ['zones','dialogueProof','depthProbe'])$(id).checked=false;
    $('behavior').value='';$('adapterState').textContent='No authored situation loaded.';$('reviewStatus').textContent='';$('inspection').hidden=false;$('enterRave').hidden=true;
    const inspect=()=>mounted.inspect({zones:$('zones').checked,dialogueProof:$('dialogueProof').checked,probe:$('depthProbe').checked});
    for(const id of ['zones','dialogueProof','depthProbe'])scope.listen($(id),'change',inspect);
    scope.listen($('behavior'),'change',()=>{const id=$('behavior').value;if(id)mounted.session.equip(id);$('adapterState').textContent=id?'Equipped. No authored situation loaded.':'No authored situation loaded.';});
    scope.listen($('exitRave'),'click',exit);scope.listen($('resetRave'),'click',enter);scope.listen(document,'keydown',event=>{if(event.key==='Escape')exit();});
  }
  for(const behavior of RAPartyBehaviors){const option=document.createElement('option');option.value=behavior.id;option.textContent=behavior.label;$('behavior').append(option);}
  $('buildIdentity').textContent=RABuild.releaseId;$('enterRave').disabled=!enabled;
  if(!enabled)$('reviewStatus').textContent='DEV MODE REQUIRED';
  $('enterRave').addEventListener('click',enter);addEventListener('pagehide',exit);
})();
