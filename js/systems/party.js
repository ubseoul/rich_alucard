(function(){
  // Pure, ephemeral attending-party session. No save, economy, people or event API.
  function createSession(data=window.RAPartyData){
    let index=0,equipped=null,phase='choose',outcome=null;
    const situation=()=>data.situations[index];
    const snapshot=()=>({index,equipped,phase,situation:situation().id,outcome:outcome?structuredClone(outcome):null});
    function equip(id){
      if(phase==='left'||!data.behaviors.some(item=>item.id===id))return false;
      equipped=id;phase='choose';outcome=null;return true;
    }
    function resolve(){
      if(phase!=='choose'||!equipped)return false;
      outcome=structuredClone(situation().results[equipped]);phase='react';return true;
    }
    function takeOpening(){
      if(phase!=='react'||!outcome.opening)return false;
      outcome={...outcome,...outcome.opening,opening:null};phase='opening';return true;
    }
    function next(){
      if(!['react','opening'].includes(phase))return false;
      index=(index+1)%data.situations.length;phase='choose';outcome=null;return true;
    }
    function reset(){index=0;equipped=null;phase='choose';outcome=null;return snapshot();}
    function leave(){phase='left';equipped=null;outcome=null;}
    return {snapshot,equip,resolve,takeOpening,next,reset,leave};
  }
  window.RAParty={createSession};
})();
