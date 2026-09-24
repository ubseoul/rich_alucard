(function(){
 // LOCKED presentation contracts (SOLVE → SEARCH → LINT → AI JUDGE → LOCK). A lock stores the judged choice
 // (contact position + zoom), never pixels: the Director still solves each device analytically from it.
 // `inputs` is tools/presentation/inputs.mjs#inputsHash; the release gate fails when it goes stale.
 // Judge evidence lives in docs/presentation/golden/ (reviewer-only images under work/, not committed).
 const locks={
  'jdm-imports-docks':{
   combat:{contact:.8,zoom:1,candidate:'c1',inputs:'c75a8873baea0987',rehash:'acceptance dead-space threshold locked (0.8); locked framing re-linted PASS, no re-judgment required',
    judge:{rubric:'RAPresentationData.rubric',pass1:{order:['c1','c3','c5'],winner:'c1'},pass2:{order:['c5','c3','c1'],winner:'c1'},agreed:true,
     history:'Midpoint lock c2 (zoom 1.06) became illegal when the cross-scene combat reference (0.325 ±5%) was locked from the three pilot combat screens; re-judged among the remaining legal framings. Process note: the pass-2 order mapping was visible to the judge before pass 2 (census now hides it).',
     reasons:['least empty sky of the legal set; crane/container skyline band reads as the docks','clear floor under both contacts for contact FX and knockback','combatants read first; observer secondary at the frame edge; HUD and command bands never touch a body']},
    golden:{body:.327}}
  },
  'throne-room':{
   combat:{contact:.8,zoom:1,candidate:'c1',inputs:'37e6b2f5152d929f',rehash:'acceptance dead-space threshold locked (0.8); locked framing re-linted PASS, no re-judgment required',
    judge:{rubric:'RAPresentationData.rubric',single:true,
     history:'Rich re-staged 290→300 so the width-limited framing meets the cross-scene combat reference. First search offered two near-identical framings (2.6% of the view apart); the shuffled passes disagreed → HOLD. SEARCH now requires perceptible separation (≥4% position / ≥3% zoom), leaving one legal framing; it was reviewed twice for acceptability.',
     pass1:{order:['c1'],verdict:'accept'},pass2:{order:['c1'],verdict:'accept'},agreed:true,
     reasons:['Rich (throne) and CEO read as the confrontation at combat size; the assistant stays in frame as the stakes','candles, shelves and window keep the room identity; the floor plane grounds all three','HUD and command bands never touch a body'],
     weaknesses:["Rich's wall portrait is cropped at the top in the combat framing (fully shown in the tableau beat)"]},
    golden:{body:.312}}
  }
 };
 window.RAPresentationLocks={get:(stage,beat)=>locks[stage]?.[beat]||null,golden:(stage,beat)=>locks[stage]?.[beat]?.golden||null,all:()=>locks};
})();
