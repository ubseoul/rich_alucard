(function(){
  // RC3 OL-075: creator-approved parody name and exact reaction. Internal actor key preserves frozen art.
  const interiorPhases=[
    {id:'arrival',dialogue:"RICH: \"yall listen to carti?\"",choices:[{id:'go-in',label:'ENTER THE RAVE',next:'greet'}]},
    {id:'greet',dialogue:"OGUN: \"whats haddenning\"",choices:[{id:'floor',label:'BLEND IN ON THE BEAT',next:'floor1'}]},
    {id:'floor1',dialogue:"RICH: \"never met vampire ogas who listen to country\". four moves stay on beat bro",choices:[{id:'dance',label:'DANCE TO BLEND IN',commit:'dance'}]},
    {id:'bllad33Enter',actors:{bllad33:true},dialogue:"BLAD33EE kicks the door in.\nRICH: \"oh shit, that's Blad33ee!\"\nRICH: \"here we go again\"",choices:[{id:'clear',label:'GET CLEAR OF THE PARTY',next:'hilt_exit'}]},
    {id:'hilt_exit',actors:{hilt:true},dialogue:"A different hunter in a windbreaker blocks the way out: Hilt. Rich needs to get clear of the interrupted party.",choices:[{id:'fight',label:'GET PAST HILT',commit:'fight'}]},
    {id:'fight',actors:{hilt:true},dialogue:"HILT blocks the exit. Rich is fighting the hunter, while BLAD33EE's entrance has the whole room moving.",choices:[{id:'fight',label:'BACK TO THE HILT FIGHT',commit:'fight'}]}
  ];
  // Exterior closeout retained verbatim.
  const exteriorPhases=[
    {id:'outside',dialogue:"in-n-ghoul still open damn vampire drive thru. two girls smoking outside",
      choices:[{id:'approach',label:'JOIN THEM',next:'smoke'}]},
    {id:'smoke',dialogue:"lighter passed nobody doing the most finally",
      choices:[{id:'linger',label:'STAY OUT HERE A WHILE',next:'closeout'}]},
    {id:'closeout',dialogue:"RICH: \"my castle could clear this party easy\"",
      choices:[{id:'head-home',label:'HEAD HOME',commit:'finishNight'}]}
  ];
  window.RAOgunRaveContent={interiorPhases,exteriorPhases};
})();
