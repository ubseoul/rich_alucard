(function(){
 // LOCKED presentation contracts (SOLVE → SEARCH → LINT → AI JUDGE → LOCK). A lock stores the judged choice
 // (contact position + zoom), never pixels: the Director still solves each device analytically from it.
 // `inputs` is tools/presentation/inputs.mjs#inputsHash; the release gate fails when it goes stale.
 // Judge evidence lives in docs/presentation/golden/ (reviewer-only images under work/, not committed).
 const locks={
  'jdm-imports-docks':{
   combat:{contact:.8,zoom:1,candidate:'c1',inputs:'48137425e60dd2be',rehash:'lock inputs narrowed to the locked beat (pd-1, Wave 3); locked framing re-linted and pixel-identical',
    judge:{rubric:'RAPresentationData.rubric',pass1:{order:['c1','c3','c5'],winner:'c1'},pass2:{order:['c5','c3','c1'],winner:'c1'},agreed:true,
     history:'Midpoint lock c2 (zoom 1.06) became illegal when the cross-scene combat reference (0.325 ±5%) was locked from the three pilot combat screens; re-judged among the remaining legal framings. Process note: the pass-2 order mapping was visible to the judge before pass 2 (census now hides it).',
     reasons:['least empty sky of the legal set; crane/container skyline band reads as the docks','clear floor under both contacts for contact FX and knockback','combatants read first; observer secondary at the frame edge; HUD and command bands never touch a body']},
    golden:{body:.327}}
  },
  'throne-room':{
   combat:{contact:.8,zoom:1,candidate:'c1',inputs:'7bf9f0a6f55762da',rehash:'lock inputs narrowed to the locked beat (pd-1, Wave 3); locked framing re-linted and pixel-identical',
    judge:{rubric:'RAPresentationData.rubric',single:true,
     history:'Rich re-staged 290→300 so the width-limited framing meets the cross-scene combat reference. First search offered two near-identical framings (2.6% of the view apart); the shuffled passes disagreed → HOLD. SEARCH now requires perceptible separation (≥4% position / ≥3% zoom), leaving one legal framing; it was reviewed twice for acceptability.',
     pass1:{order:['c1'],verdict:'accept'},pass2:{order:['c1'],verdict:'accept'},agreed:true,
     reasons:['Rich (throne) and CEO read as the confrontation at combat size; the assistant stays in frame as the stakes','candles, shelves and window keep the room identity; the floor plane grounds all three','HUD and command bands never touch a body'],
     weaknesses:["Rich's wall portrait is cropped at the top in the combat framing (fully shown in the tableau beat)"]},
    golden:{body:.312}}
  }
,
  'powder-springs-trip':{
   curb:{contact:.9,zoom:1,candidate:'c4',inputs:'b1a30a3a63964bf8',judge:{rubric:'RAPresentationData.rubric',pass1:{order:'sealed',winner:'c4'},pass2:{order:'sealed',winner:'c4'},agreed:true,history:'Wave 3 hero scene. Dialogue-mode framing left ~40% of the screen as an empty UI band under a one-button scene; moved to cinematic mode (tall world, slim action band). Candidate keys were sealed until both passes were recorded.',reasons:['largest night sky of the legal set — the scene is about the stars','Rich small but grounded on the curb, face readable (≥24 px at 360)','road strip and houses keep Powder Springs readable; the single action sits just under the world']},golden:{body:.21}},
   stargazing:{contact:.9,zoom:1,candidate:'c4',inputs:'b1a30a3a63964bf8',judge:{rubric:'RAPresentationData.rubric',pass1:{order:'sealed',winner:'c4'},pass2:{order:'sealed',winner:'c4'},agreed:true,history:'Wave 3 hero scene. Dialogue-mode framing left ~40% of the screen as an empty UI band under a one-button scene; moved to cinematic mode (tall world, slim action band). Candidate keys were sealed until both passes were recorded.',reasons:['largest night sky of the legal set — the scene is about the stars','Rich small but grounded on the curb, face readable (≥24 px at 360)','road strip and houses keep Powder Springs readable; the single action sits just under the world']},golden:{body:.21}}
  }
 };
 window.RAPresentationLocks={get:(stage,beat)=>locks[stage]?.[beat]||null,golden:(stage,beat)=>locks[stage]?.[beat]?.golden||null,all:()=>locks};
})();
