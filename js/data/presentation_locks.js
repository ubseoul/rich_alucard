(function(){
 // LOCKED presentation contracts (SOLVE → SEARCH → LINT → AI JUDGE → LOCK). A lock stores the judged choice
 // (contact position + zoom), never pixels: the Director still solves each device analytically from it.
 // `inputs` is tools/presentation/inputs.mjs#inputsHash; the release gate fails when it goes stale.
 // Judge evidence lives in docs/presentation/golden/ (reviewer-only images under work/, not committed).
 const locks={
  'jdm-imports-docks':{
   combat:{contact:.8,zoom:1.06,candidate:'c2',inputs:'7006d8efb938da64',
    judge:{rubric:'RAPresentationData.rubric',pass1:{order:['c1','c2','c3','c4','c5','c6'],winner:'c2'},pass2:{order:['c5','c4','c2','c6','c3','c1'],winner:'c2'},agreed:true,
     reasons:['largest readable combatant pair inside the combat size band','crane/container skyline sits in the upper-middle third, keeping the location readable with the least empty sky of the legal set','clear floor under both contacts for contact FX and knockback','observer stays secondary at the frame edge; HUD and command bands never touch a body']},
    golden:{body:.345}}
  }
 };
 window.RAPresentationLocks={get:(stage,beat)=>locks[stage]?.[beat]||null,golden:(stage,beat)=>locks[stage]?.[beat]?.golden||null,all:()=>locks};
})();
