(function(){
  // Content-free Property phase/dialogue engine. Authored phases/hotspots live in js/data/property_content.js.
  // Speaker-labeled lines advance one at a time; hotspot phases allow free-order inspection before choices unlock.
  function createSession({phases=[],onView=()=>{},onChoice=()=>{},onHotspot=()=>{},onPhase=()=>{},onExit=()=>{},consequences={}}={}){
    const phaseMap=new Map(phases.map(phase=>[phase.id,phase]));
    if(phaseMap.size!==phases.length)throw new Error('Duplicate property phase');
    let active=true,phase=null,lineIndex=0,inspected=new Set(),hotspotQueue=null,hotspotIndex=0;
    function currentLine(){
      if(hotspotQueue)return hotspotQueue[hotspotIndex]||null;
      const lines=phase?.lines||[];
      return lines[lineIndex]||null;
    }
    function linesDone(){return lineIndex>=(phase?.lines||[]).length;}
    function autoTrigger(){
      if(!phase||phase.mode!=='hotspot'||!phase.autoAdvance)return;
      const rule=phase.autoAdvance;
      const hit=(rule.onIds||[]).some(id=>inspected.has(id))||(rule.afterCount&&inspected.size>=rule.afterCount);
      if(hit&&rule.next)setPhase(rule.next);
    }
    function view(){
      const line=currentLine();
      return {
        active,phaseId:phase?.id||null,mode:phase?.mode||null,
        speakerId:line?.speakerId||null,kind:line?.kind||null,text:line?.text||'',
        linesDone:linesDone()&&!hotspotQueue,
        hotspotActive:!!hotspotQueue,
        choices:(linesDone()&&!hotspotQueue&&(phase?.choices||[])).length?phase.choices.map(({id,label})=>({id,label})):[],
        hotspots:phase?.mode==='hotspot'?Object.keys(phase.hotspots||{}):[],
        inspected:[...inspected],
        actors:phase?.actors||{},
        rat:phase?.rat||null
      };
    }
    function emit(){onView(view());}
    function setPhase(id){
      if(!active||!phaseMap.has(id))return false;
      phase=phaseMap.get(id);lineIndex=0;hotspotQueue=null;hotspotIndex=0;
      if(phase.mode==='hotspot')inspected=new Set();
      emit();onPhase(id);return true;
    }
    function advance(){
      if(!active)return false;
      if(hotspotQueue){
        if(hotspotIndex<hotspotQueue.length-1){hotspotIndex+=1;emit();return true;}
        hotspotQueue=null;hotspotIndex=0;emit();autoTrigger();return true;
      }
      if(linesDone())return false;
      lineIndex+=1;emit();return true;
    }
    function inspect(hotspotId){
      if(!active||phase?.mode!=='hotspot'||!linesDone()||hotspotQueue)return false;
      const lines=phase.hotspots?.[hotspotId];
      if(!lines||!lines.length)return false;
      inspected.add(hotspotId);hotspotQueue=lines;hotspotIndex=0;emit();
      onHotspot(hotspotId,view());
      return true;
    }
    function choose(id){
      if(!active||hotspotQueue||!linesDone())return false;
      const choice=(phase?.choices||[]).find(item=>item.id===id);
      if(!choice)return false;
      onChoice(id,{phaseId:phase.id,inspected:[...inspected]});
      return true;
    }
    function commit(id,payload){
      if(!active||!Object.prototype.hasOwnProperty.call(consequences,id)||typeof consequences[id]!=='function')return false;
      consequences[id](structuredClone(payload||{}),{phaseId:phase?.id||null,inspected:[...inspected]});
      return true;
    }
    function leave(){if(!active)return;active=false;onExit();}
    return {view,setPhase,advance,inspect,choose,commit,leave,snapshot:()=>({phaseId:phase?.id||null,inspected:[...inspected]})};
  }
  window.RAProperty={createSession};
})();
