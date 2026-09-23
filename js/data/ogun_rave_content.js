(function(){
  // Authored PLAYER-BLIND content for the Ogun's Rave adventure (Engineering 03).
  // Party situations use the accepted PRODUCTION classification; every situation
  // supplies a result for each accepted behavior (TWO STEP, HEAD NOD, TOO COOL TO DANCE).
  const result=(reaction,response,opening=null)=>({reaction,response,opening});
  const situations={
    floor1:{
      id:'ogun-rave-floor-1',classification:'PRODUCTION',
      title:'OGUN CLOCKS YOU ON THE FLOOR.',
      prompt:"The crowd thins for a second. Ogun's eyes find you across the room.",
      results:{
        'two-step':result('Rich falls into it like he has done this a thousand times. Ogun grins and nods along.','floor-approve',
          {label:'LET OGUN VOUCH FOR YOU',reaction:"Ogun tells the whole room whose castle throws the real ones. The crowd doubles.",response:'floor-vouch'}),
        'head-nod':result('Rich just nods. Cool, unreadable, exactly enough.','floor-nod'),
        'too-cool':result("Rich doesn't move. Somehow that's worse for everybody else on the floor.",'floor-cool')
      }
    },
    sprinklers:{
      id:'ogun-rave-sprinklers',classification:'PRODUCTION',
      title:'BLOOD RAINS FROM THE CEILING.',
      prompt:"Ogun's signature trick, right on cue — chilled blood, straight down on the crowd.",
      results:{
        'two-step':result('Rich keeps stepping through it. His locs are catching every drop and he is NOT about that life.','sprinkler-dance'),
        'head-nod':result('Rich tilts his head just enough to dodge the worst of it. Barely.','sprinkler-dodge',
          {label:'CATCH SOME ON PURPOSE, LOOK UNBOTHERED',reaction:'Rich lets a little hit his shoulder like he planned it. The room buys it completely.',response:'sprinkler-flex'}),
        'too-cool':result("Rich doesn't flinch. Doesn't dance. Just watches blood fall and refuses to react.",'sprinkler-still',
          {label:'STEP UNDER THE WORST OF IT ANYWAY',reaction:'Rich walks dead-eyed straight into the worst of it, locs be damned. The crowd loses it.',response:'sprinkler-dare'})
      }
    },
    tension:{
      id:'ogun-rave-tension',classification:'PRODUCTION',
      title:'THE ROOM FORGETS HOW TO DANCE.',
      prompt:"Nobody's moving. He's still just standing there. Somebody has to do something.",
      results:{
        'two-step':result("Rich keeps his two-step going like nothing's wrong. Stupid. It works — the beat comes back.",'tension-step',
          {label:'PULL THE FLOOR BACK IN WITH YOU',reaction:"Rich waves the room back in like it's his party, not Ogun's. Half of them listen.",response:'tension-lead'}),
        'head-nod':result("Rich just nods at him. Not a threat, not scared. An acquaintance. Weirdly, it lands.",'tension-nod'),
        'too-cool':result("Rich doesn't dance, doesn't flinch, just matches his energy exactly.",'tension-cool',
          {label:'HOLD THE STARE',reaction:"Neither of them blinks first. The room realizes Rich isn't scared, and that changes everything.",response:'tension-hold'})
      }
    }
  };
  const interiorPhases=[
    {id:'arrival',dialogue:"Rich shows up late. Obviously. Meatpacking District, a door lit up blood-red, a line that doesn't apply to him.",
      choices:[{id:'go-in',label:'WALK IN LIKE YOU OWN THE PLACE',next:'greet'}]},
    {id:'greet',dialogue:"OGUN: \"Rich Alucard. Late as usual.\"\nRICH: \"Fashionably.\"\nOgun laughs and waves him toward the floor.",
      choices:[{id:'floor',label:'HIT THE FLOOR',next:'floor1'}]},
    {id:'floor1',dialogue:'Pick how Rich moves. Then show them.',party:{situations:[situations.floor1]},
      choices:[{id:'continue',label:'MOVE ON',next:'banter'}]},
    {id:'banter',dialogue:"Somebody Rich has never met hands him a drink that's definitely not for him and asks if he's \"the guy with the castle.\" Before Rich can answer, the music cuts for half a second — like the room is bracing for something.",
      choices:[{id:'brace',label:'WHAT NOW',next:'sprinklers'}]},
    {id:'sprinklers',dialogue:"The ceiling opens up. Not water — cold, thick, unmistakably blood, right on the crowd. Ogun's signature move. Rich's first thought is his locs.",
      party:{situations:[situations.sprinklers]},choices:[{id:'continue',label:'SHAKE IT OFF',next:'bllad33Enter'}]},
    {id:'bllad33Enter',actors:{bllad33:true},
      dialogue:"The door doesn't open so much as it gets opened. Everyone feels it before they see it — the music doesn't stop, but half the room does. He's dressed like he came to work, not to dance, and the whole rave suddenly remembers it's full of vampires.\nRICH: \"NIGGA IS THAT Bllad33\"",
      choices:[{id:'hold',label:'HOLD YOUR SPOT',next:'tension'}]},
    {id:'tension',actors:{bllad33:true},dialogue:"Nobody on the floor is moving.",party:{situations:[situations.tension]},
      choices:[{id:'continue',label:'SEE WHAT HE WANTS',next:'deescalate'}]},
    {id:'deescalate',actors:{bllad33:true},
      dialogue:"Bllad33 doesn't draw anything. He just looks around the room like he's counting exits, clocks Rich, and — nothing. A short nod, the kind that means later, not now. Ogun appears at his shoulder already talking him down with a drink. Whatever this was, it wasn't about Rich. Not tonight.",
      choices:[{id:'bounce',label:'DIP OUTSIDE WHILE YOU CAN',commit:'leaveRave'}]}
  ];
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
