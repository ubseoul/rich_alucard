(function(){
  // Authored PLAYER-BLIND content for the Property adventure (Massive Push 001).
  // Important Rich lines marked RICH LINE — VOICE PASS REQUIRED in the approved writing
  // package are intentionally omitted here; only the HQ-supplied ownership line is voiced.
  // Choices/narration carry Rich's intent without inventing replacement personality writing.
  const sh=text=>({speakerId:'shannon',kind:'spoken',text});
  const n=text=>({speakerId:null,kind:'narration',text});
  const rich=text=>({speakerId:'rich',kind:'spoken',text,richVoiceStatus:'hq_supplied'});

  const exteriorPhases=[
    {id:'ext_arrival',mode:'lines',actors:{shannon:true},
      lines:[sh("You're Rich. Good. The seller said cash buyer. He did not mention sunglasses at night, but that's not a financing issue."),sh('Four units. Separate meters. Seller wants speed. The disclosure says pest activity and an odor.'),sh('You want the numbers first or the building first?')],
      choices:[{id:'numbers',label:'SHOW ME THE MONEY',next:'ext_hotspot'},{id:'building',label:'SHOW ME THE BUILDING',next:'ext_hotspot'}]},
    {id:'ext_hotspot',mode:'hotspot',actors:{shannon:true},
      hotspots:{
        meter:[n('Four meters. Four doors. Somebody at least planned to get paid separately.'),sh('Separate service is good. I like good facts.')],
        stair:[n('The rail moves before Rich touches it.'),sh('That rail wants an adult.')],
        court:[n('Four doors face the same concrete. Rent can come from four directions.'),sh('Potential does not pay the water bill. Four leases can.')],
        numbers:[{speakerId:null,kind:'system',text:'__NUMBERS_PANEL__'}]
      },
      choices:[{id:'enter',label:'LOOK INSIDE',commit:'enterInterior'}]},
    {id:'curb_offer',mode:'lines',actors:{shannon:true},
      lines:[n('Shannon leans on the car, waiting.')],
      choices:[{id:'cut',label:'CUT THE PRICE',commit:'acquire'},{id:'asis',label:'BUY IT AS-IS',commit:'acquire'},{id:'wait',label:'NOT YET',commit:'deferOffer'}]},
    {id:'acquired',mode:'lines',actors:{shannon:true},
      lines:[sh('Congratulations. You own four units, one bad rail, and a problem with feet.'),rich("That's my fucking property now."),sh("I'll send the leases. And the number for somebody who doesn't ask what made the hole.")],
      choices:[{id:'home',label:'HEAD HOME',commit:'returnHome'}]}
  ];

  const interiorPhases=[
    {id:'int_entry',mode:'lines',actors:{shannon:true},
      lines:[n('Vacant. Tired. Still standing.'),sh('This unit is ugly in ways I can price.')],
      choices:[{id:'begin',label:'LOOK AROUND',next:'int_hotspot'}]},
    {id:'int_hotspot',mode:'hotspot',actors:{shannon:true},
      autoAdvance:{onIds:['panel'],afterCount:3,next:'first_sign'},
      hotspots:{
        kitchen:[n('Old cabinets. Working layout. Paint can trying to look employed.'),sh('Cabinets stay until the rent says otherwise.')],
        patch:[n('Fresh plaster over an older problem.'),sh('That patch is doing public relations.')],
        floor:[n('The floor is scarred, not soft.'),sh("Refinish. Don't replace.")],
        door:[n('The interior door sticks, then opens like it was listening.')],
        paintcan:[n('The paint can is half empty. Somebody has been using it.')],
        panel:[n('A maintenance panel sits too low and too clean around the edges.')]
      },
      choices:[]},
    {id:'first_sign',mode:'lines',actors:{shannon:true},
      lines:[n('Something hits the wall from the wrong side.'),n('Then something answers from the kitchen.'),sh("I'm changing pest activity to material fact.")],
      choices:[{id:'open',label:'OPEN THE PANEL',commit:'firstSign'},{id:'kitchen',label:'CHECK THE KITCHEN',commit:'firstSign'},{id:'wait',label:'WAIT',commit:'firstSign'}]},
    {id:'rat_reveal',mode:'lines',actors:{shannon:true},rat:{state:'alert'},
      lines:[n('The print has toes. The print also has opinions about scale.'),sh('That is not a city rat. That is a zoning issue.')],
      choices:[{id:'continue',label:'CONTINUE',next:'rat_pressure'}]},
    {id:'rat_pressure',mode:'lines',actors:{shannon:true},rat:{state:'alert'},
      lines:[n('The rat looks at Rich like he entered without notice.'),sh('Do not let it take the keys.')],
      choices:[{id:'block',label:'BLOCK THE KITCHEN',commit:'ratApproach'},{id:'wider',label:'OPEN IT WIDER',commit:'ratApproach'},{id:'stand_ground',label:'STAND YOUR GROUND',commit:'ratApproach'}]},
    {id:'pressure_resolve',mode:'lines',actors:{shannon:true},rat:{state:'scurry'},
      lines:[n('One leaves. Two more disagree with the vacancy status.'),sh('I have photos. I have video. I have a seller who is about to become flexible.')],
      choices:[{id:'continue',label:'CONTINUE',next:'offer'}]},
    {id:'offer',mode:'lines',actors:{shannon:true},
      lines:[sh("You still want it. That's either conviction or a symptom."),sh('Fine. Then the seller gets to pay for every tooth mark.')],
      choices:[{id:'cut',label:'CUT THE PRICE',commit:'acquire'},{id:'asis',label:'BUY IT AS-IS',commit:'acquire'},{id:'curb',label:'GO TO THE CURB',commit:'goCurb'}]}
  ];

  window.RAPropertyContent={exteriorPhases,interiorPhases};
})();
