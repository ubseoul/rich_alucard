(function(){
 // LOCKED presentation contracts (SOLVE → SEARCH → LINT → AI JUDGE → LOCK). A lock stores the judged choice
 // (contact position + zoom), never pixels: the Director still solves each device analytically from it.
 // `inputs` is tools/presentation/inputs.mjs#inputsHash; the release gate fails when it goes stale.
 // Judge evidence lives in docs/presentation/golden/ (reviewer-only images under work/, not committed).
 const locks={
  'jdm-imports-docks':{
   combat:{contact:.8,zoom:1.06,candidate:'c2',inputs:'6a34f438f857c050',rehash:'inputs definition narrowed to the stage variant matrix (pd-1); judged composition unchanged',
    judge:{rubric:'RAPresentationData.rubric',pass1:{order:['c1','c2','c3','c4','c5','c6'],winner:'c2'},pass2:{order:['c5','c4','c2','c6','c3','c1'],winner:'c2'},agreed:true,
     reasons:['largest readable combatant pair inside the combat size band','crane/container skyline sits in the upper-middle third, keeping the location readable with the least empty sky of the legal set','clear floor under both contacts for contact FX and knockback','observer stays secondary at the frame edge; HUD and command bands never touch a body']},
    golden:{body:.345}}
  },
  'throne-room':{
   combat:{contact:.8,zoom:1,candidate:'c1',inputs:'a7b3748ef4252e37',
    judge:{rubric:'RAPresentationData.rubric',single:true,
     history:'First search offered two near-identical framings (2.6% of the view apart); the shuffled passes disagreed → HOLD. SEARCH now requires perceptible separation (≥4% position / ≥3% zoom), leaving one legal framing; it was reviewed twice for acceptability.',
     pass1:{order:['c1'],verdict:'accept'},pass2:{order:['c1'],verdict:'accept'},agreed:true,
     reasons:['Rich (throne) and CEO read as the confrontation at combat size; the assistant stays in frame as the stakes','candles, shelves and window keep the room identity; the floor plane grounds all three','HUD and command bands never touch a body'],
     weaknesses:["Rich's wall portrait is cropped at the top in the combat framing (fully shown in the tableau beat)"]},
    golden:{body:.306}}
  }
 };
 window.RAPresentationLocks={get:(stage,beat)=>locks[stage]?.[beat]||null,golden:(stage,beat)=>locks[stage]?.[beat]?.golden||null,all:()=>locks};
})();
