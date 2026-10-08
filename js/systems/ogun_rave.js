(function(){
  const NIGHT_ID='ogun_rave_001';
  const active=()=>RAState.get().life.night?.active||null;
  function patchActive(fields){const prior=active();if(!prior)return false;return RAState.patch('life.night.active',{...prior,...fields});}
  function findChoice(phaseId,choiceId,phases){const phase=phases.find(p=>p.id===phaseId);return phase?.choices?.find(c=>c.id===choiceId)||null;}
  function currentInteriorSession(){return RARaveScene.current()?.session||null;}
  let running=null;
  const advance=phase=>{patchActive({phase});currentInteriorSession()?.setPhase(phase);};
  async function dance(){
    if(running)return;running='dance';
    try{
      advance('floor1');
      const session=RARaveScene.current(),night=active();const root=session?.root;if(root)root.hidden=true;
      const live=()=>root?.isConnected&&RARaveScene.current()===session&&active()?.startedAt===night?.startedAt&&RAScenes.current()==='ogun-rave';
      const result=await RAMinigames.launch('dance',{rave:true,seed:'ogun-blood-rave',bpm:126,notes:36,moodStart:70,quitLabel:'LEAVE FLOOR'});
      if(!live())return;if(root)root.hidden=false;
      if(result.quit){return;}
      patchActive({danceResult:result.outcome});
      // Poor rhythm changes the crowd's reaction, never prevents the hunter arrival or quest progress.
      advance('bllad33Enter');
      // Hold the spectacular entrance until the player chooses to get clear; no orphaned automatic fight.
    }finally{const current=RARaveScene.current();if(RAScenes.current()==='ogun-rave'&&current?.root?.isConnected)current.root.hidden=false;running=null;}
  }
  async function fight(){
    if(running)return;running='fight';
    try{
      const session=RARaveScene.current(),night=active(),root=session?.root;
      const live=()=>root?.isConnected&&RARaveScene.current()===session&&active()?.startedAt===night?.startedAt&&RAScenes.current()==='ogun-rave';
      if(!live())return;
      advance('fight');if(root)root.hidden=true;
      // Q5 delegated named encounter: Hilt body, existing crossbow rules. Generic hunters and Blade remain intact.
      RACombatData.ENEMIES.ogun_rave_hilt={...RACombatData.ENEMIES.hunter,name:'HILT',person:'hilt',noRun:true,drop:{},octopus:{}};
      if(!window.RARelations?.met?.('hilt'))window.RARelations?.meet?.('hilt','ogun_rave_001');
      const result=await RACombat2.run('ogun_rave_hilt',{env:'rave_interior',name:'HILT',noPenalty:true,intro:'HILT BLOCKS THE WAY OUT. GET CLEAR OF THE PARTY.'});
      if(!live())return;
      if(result?.quit||result?.outcome==='run'){root.hidden=false;advance('bllad33Enter');return;}
      patchActive({fightResult:result?.outcome||'done',phase:'exterior-outside'});
      await RAScenes.go('ogun-rave-exterior');
    }finally{const current=RARaveScene.current();if(RAScenes.current()==='ogun-rave'&&current?.root?.isConnected)current.root.hidden=false;running=null;}
  }
  function buildInteriorDefinition(){
    const phases=RAOgunRaveContent.interiorPhases;
    return {phases,onChoice(id,snapshot){
      const choice=findChoice(snapshot.phase,id,phases);if(!choice)return;
      if(choice.next){patchActive({phase:choice.next});currentInteriorSession()?.setPhase(choice.next);}
      else if(choice.commit)currentInteriorSession()?.commit(choice.commit,{});
    },consequences:{
      dance,fight,
      leaveRave(){patchActive({phase:'exterior-outside'});RAScenes.go('ogun-rave-exterior');}
    }};
  }
  function buildExteriorDefinition(){
    const phases=RAOgunRaveContent.exteriorPhases;
    return {phases,onChoice(id,snapshot){
      const choice=findChoice(snapshot.phase,id,phases);if(!choice)return;
      if(choice.next){patchActive({phase:`exterior-${choice.next}`});exteriorSessionRef?.setPhase(choice.next);}
      else if(choice.commit)exteriorSessionRef?.commit(choice.commit,{});
    },consequences:{
      finishNight(){
        const prior=active(),completedAt=new Date().toISOString();
        RAState.patch('life.night.active',null);
        const completed=[...(RAState.get().life.night.completed||[])];
        if(prior&&!completed.some(x=>x.id===prior.id)){completed.push({id:prior.id,completedAt});RAState.patch('life.night.completed',completed);}
        RAState.patch('life.world.flags.ogunsRaveCompleted',true);
        RAState.patch('life.world.flags.castlePartyHostingUnlocked',true);
        RAState.patch('life.world.location','LA');
        RAState.recordEvent({id:'ogun-rave-completed',type:'night_completed',nightId:NIGHT_ID,at:completedAt});
        document.body.classList.remove('ogun-rave-mode');
        RAScenes.go('bedroom',{ogunRave:true});
      }
    }};
  }
  let exteriorSessionRef=null;
  async function begin(){
    const current=active();
    if(current&&current.status!=='completed')return resume();
    RAState.patch('life.night.active',{id:NIGHT_ID,status:'in_progress',phase:'arrival',startedAt:new Date().toISOString()});
    document.body.classList.add('ogun-rave-mode');
    if(window.RAPhone?.isOpen?.())await window.RAPhone.close();
    await RAScenes.go('ogun-rave',{definition:buildInteriorDefinition(),phase:'arrival'});
  }
  async function resume(){
    const record=active();if(!record)return begin();
    document.body.classList.add('ogun-rave-mode');
    if(window.RAPhone?.isOpen?.())await window.RAPhone.close();
    if(String(record.phase||'').startsWith('exterior')){await RAScenes.go('ogun-rave-exterior');return;}
    const aliases={banter:'floor1',sprinklers:'floor1',tension:'bllad33Enter',deescalate:'bllad33Enter'};
    const phase=aliases[record.phase]||record.phase||'arrival';patchActive({phase});
    await RAScenes.go('ogun-rave',{definition:buildInteriorDefinition(),phase});
    if(phase==='fight')await fight();
  }
  function resetForDev(){
    RAState.patch('life.night.active',null);RAState.patch('life.night.completed',[]);
    RAState.patch('life.world.flags.ogunsRaveInvited',false);
    RAState.patch('life.world.flags.ogunsRaveCompleted',false);
    RAState.patch('life.world.flags.castlePartyHostingUnlocked',false);
    window.RAWorldEvents?.reset?.('ogun_rave_invite_001');
    document.body.classList.remove('ogun-rave-mode');
  }
  document.addEventListener('DOMContentLoaded',()=>{
    document.querySelector('#devResetOgunRave')?.addEventListener('click',async()=>{
      resetForDev();
      if(window.RAPhone?.isOpen?.())await window.RAPhone.close();
      if(window.RAScenes?.current?.()!=='bedroom')await window.RAScenes?.go?.('bedroom',{devReset:'ogun-rave'});
    });
    document.querySelector('#devEnterOgunRave')?.addEventListener('click',async()=>{
      RAState.patch('life.world.flags.ogunsRaveInvited',true);
      await begin();
    });
  });
  window.RAOgunRave={
    nightId:NIGHT_ID,active,begin,resume,resetForDev,
    buildInteriorDefinition,buildExteriorDefinition,dance,fight,
    mountExterior(session){exteriorSessionRef=session;},
    unmountExterior(){exteriorSessionRef=null;}
  };
})();
