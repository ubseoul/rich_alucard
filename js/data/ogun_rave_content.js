(function(){
  // RC3 OL-075: creator-approved parody name and exact reaction. Internal actor key preserves frozen art.
  const interiorPhases=[
    {id:'arrival',dialogue:'Meatpacking District. A blood-red door. Inside, vampires move as one.',choices:[{id:'go-in',label:'ENTER THE RAVE',next:'greet'}]},
    {id:'greet',dialogue:'OGUN: "Keep moving. Blend in."\nRich steps into the crowd. The bass takes over.',choices:[{id:'floor',label:'BLEND IN ON THE BEAT',next:'floor1'}]},
    {id:'floor1',dialogue:'Match the crowd. Four moves. Stay on the beat while the blood rains.',choices:[{id:'dance',label:'DANCE TO BLEND IN',commit:'dance'}]},
    {id:'bllad33Enter',actors:{bllad33:true},dialogue:'The doors crash open. A hunter stands in the blood rain.\nRICH: "oh shit, that\'s Blad33ee!"',choices:[{id:'fight',label:'FIGHT BLAD33EE',commit:'fight'}]},
    {id:'fight',actors:{bllad33:true},dialogue:'BLAD33EE crashes the rave. No time to talk.',choices:[{id:'fight',label:'BACK TO THE FIGHT',commit:'fight'}]}
  ];
  // Exterior closeout retained verbatim.
  const exteriorPhases=[
    {id:'outside',dialogue:"Outside is quieter. Colder. Somewhere down the block a sign buzzes red and yellow — IN-N-GHOUL, some knockoff burger spot open all night for exactly this kind of crowd. Two women are already out here, smoking, in no hurry to go back in.",
      choices:[{id:'approach',label:'JOIN THEM',next:'smoke'}]},
    {id:'smoke',dialogue:"Nobody asks why he's out here instead of in there. One of them passes him a lighter he didn't ask for. Nobody's performing anything. It's the calmest Rich has felt all night.",
      choices:[{id:'linger',label:'STAY OUT HERE A WHILE',next:'closeout'}]},
    {id:'closeout',dialogue:"Rich looks back at the rave glowing behind him, still going, still loud, still somebody else's party.\nRICH: \"I could throw a better one than this.\"\nNobody argues with him.",
      choices:[{id:'head-home',label:'HEAD HOME',commit:'finishNight'}]}
  ];
  window.RAOgunRaveContent={interiorPhases,exteriorPhases};
})();
