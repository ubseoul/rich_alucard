(function(){
  // Content-free phase/Party adapter. No production situations or consequences are supplied here.
  // Authored callbacks use existing scene/state/people/event APIs only when separately authorized.
  function createSession({phases=[],initialState={},review=false,onView=()=>{},onResult=()=>{},onChoice=()=>{},onExit=()=>{},consequences={}}={}){
    const phaseMap=new Map(phases.map(phase=>[phase.id,phase]));
    if(phaseMap.size!==phases.length)throw new Error('Duplicate rave phase');
    let active=true,phase=null,party=null,equipped=null,state=structuredClone(initialState);
    const snapshot=()=>({active,phase:phase?.id||null,state:structuredClone(state),equipped,party:party?.snapshot()||null});
    const view=()=>({dialogue:phase?.dialogue||'',choices:(phase?.choices||[]).map(({id,label})=>({id,label})),...snapshot()});
    function emit(){onView(view());}
    function setPhase(id){
      if(!active||!phaseMap.has(id))return false;
      const next=phaseMap.get(id);let nextParty=null;
      if(next.party){
        const data=next.party;
        if(!Array.isArray(data.situations)||!data.situations.length)throw new Error('Authored Party situations required');
        for(const situation of data.situations){
          if(situation.classification!=='PRODUCTION')throw new Error('DEV situations cannot enter the production adapter');
          for(const behavior of RAPartyBehaviors)if(!situation.results?.[behavior.id])throw new Error('Missing behavior result');
        }
        nextParty=RAParty.createSession({behaviors:RAPartyBehaviors,situations:data.situations});
        if(equipped)nextParty.equip(equipped);
      }
      party?.leave();phase=next;party=nextParty;emit();return true;
    }
    function equip(id){if(!active||!RAPartyBehaviors.some(b=>b.id===id))return false;equipped=id;party?.equip(id);emit();return true;}
    function interact(action='resolve'){
      if(!active||!party||!['resolve','takeOpening','next'].includes(action))return false;
      if(!party[action]())return false;
      const result=party.snapshot();emit();
      if(action!=='next')onResult(structuredClone(result.outcome),snapshot());
      return true;
    }
    function choose(id){if(!active||!(phase?.choices||[]).some(choice=>choice.id===id))return false;onChoice(id,snapshot());return true;}
    function patch(values){if(!active)return false;state={...state,...structuredClone(values)};emit();return true;}
    function commit(id,payload){
      if(!active||review||!Object.prototype.hasOwnProperty.call(consequences,id)||typeof consequences[id]!=='function')return false;
      consequences[id](structuredClone(payload),snapshot());return true;
    }
    function leave(){if(!active)return;active=false;party?.leave();party=null;onExit(snapshot());}
    return {snapshot,view,setPhase,equip,interact,choose,patch,commit,leave};
  }
  window.RARave={createSession};
})();
