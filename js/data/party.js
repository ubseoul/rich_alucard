(function(){
  // Only these behavior concepts are canonical. ALL situations/results are DEV placeholders.
  const behaviors=[
    {id:'two-step',label:'TWO STEP',hint:'Take up space.'},
    {id:'head-nod',label:'HEAD NOD',hint:'Catch the room.'},
    {id:'too-cool',label:'TOO COOL TO DANCE',hint:'Let them look.'}
  ];
  const result=(reaction,response,opening=null)=>({reaction,response,opening});
  const situations=[
    {id:'dev-floor',classification:'DEV/PLACEHOLDER',title:'THE FLOOR OPENS.',prompt:'A circle leaves a gap.',results:{
      'two-step':result('They make room. Your floor.','circle',{label:'TAKE THE FLOOR',reaction:'Now they follow your steps.',response:'follow'}),
      'head-nod':result('A nod back. Still on the edge.','nod'),
      'too-cool':result('The gap closes. Nobody waits.','closed')
    }},
    {id:'dev-break',classification:'DEV/PLACEHOLDER',title:'THE BEAT FALLS BACK.',prompt:'The room takes a breath.',results:{
      'two-step':result('Still stepping. By yourself.','awkward'),
      'head-nod':result('Same wavelength. A nod back.','nod',{label:'MOVE CLOSER',reaction:'A quiet corner opens for you.',response:'corner'}),
      'too-cool':result('Unbothered. A few heads turn.','notice')
    }},
    {id:'dev-edge',classification:'DEV/PLACEHOLDER',title:'EYES AT THE EDGE.',prompt:'A small group watches the floor.',results:{
      'two-step':result('They watch. Nobody joins in.','watch'),
      'head-nod':result('They nod, then turn away.','closed'),
      'too-cool':result('They come to you. Interesting.','approach',{label:'HOLD YOUR SPOT',reaction:'The edge becomes your circle.',response:'gather'})
    }}
  ];
  window.RAPartyData={behaviors,situations};
})();
