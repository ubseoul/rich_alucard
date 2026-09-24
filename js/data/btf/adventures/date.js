(function(){
 // THE DATE LOOP as one repeatable adventure. Per-woman content: RADateContent (js/data/btf/dates.js).
 // CRACK stays canon-locked (CURRENT_CANON: threshold/roll/outcome TBD): visible as locked, never invented.
 const {R,S,N,E}=RAContent;
 const who=A=>A.vars.person;const P=A=>RABtfPeople.get(who(A));const C=A=>window.RADateContent?.get?.(who(A))||{};
 const nth=A=>(RARelations.get(who(A))?.datesCount||0);
 const pick=(arr,i)=>arr?.length?arr[Math.min(i,arr.length-1)]:null;
 const GENERIC_ASKS=[
  {q:'so what do you actually do?',a:{label:"I'M A MUSIC ARTIST.",topic:'music'},b:{label:'I OWN A CASTLE.',topic:'castle'},o:{label:"HONESTLY? I'M TRYING DIFFERENT LANES.",topic:'honest'}},
  {q:"what's the weirdest thing that happened to you this week?",a:{label:'TELL HER ABOUT THE FIGHT.',topic:'fight'},b:{label:'TELL HER ABOUT THE FOOD.',topic:'food'},o:{label:'TELL HER THE TRUTH. ALL OF IT.',topic:'weird'}},
  {q:'what do you want? like, actually.',a:{label:'MORE.',topic:'flex'},b:{label:'THIS. RIGHT NOW.',topic:'present'},o:{label:'ASK HER THE SAME QUESTION.',topic:'listen'}}
 ];
 RAAdventures.define({id:'DATE',title:'A DATE',lane:'dating',repeatable:true,scope:'MUST',memoryType:'date',start:'where',
  testSetup:ctx=>{ctx.RARelations.meet('kiki','test');ctx.RARelations.add('kiki',60);},testVars:{person:'kiki'},
  nodes:{
  where:{env:'street_night',actors:{left:'rich'},lines:A=>[N(`${P(A)?.name||'she'} said yes. where you taking her?`)],
   choices:A=>RADating.availableSpots(who(A)).map(s=>({label:s.label,sub:`${s.cost?RALife.fmt(s.cost):'FREE'}${s.liked?' · SHE LIKES THIS':''}`,when:()=>RALife.money()>=s.cost,fx:X=>{X.set('spot',s.id);RALife.spend(s.cost);},next:'arrive'}))},
  arrive:{env:A=>RADating.SPOTS[A.vars.spot]?.env||'street_night',actors:A=>({left:'rich',right:who(A)}),title:A=>RADating.spotLabel(A.vars.spot),
   enter:A=>{RAClock.logOuting({type:'date',person:who(A),spot:A.vars.spot});},
   lines:A=>{const c=C(A);const line=pick(c.arrival,nth(A))||'she looks good tonight. she knows it.';return [E(who(A),'…'),N(line)];},next:'talk'},
  talk:{lines:A=>{const ask=pick(C(A).asks,nth(A))||GENERIC_ASKS[nth(A)%GENERIC_ASKS.length];return [S(who(A),ask.q)];},
   choices:A=>{const ask=pick(C(A).asks,nth(A))||GENERIC_ASKS[nth(A)%GENERIC_ASKS.length];const reads=C(A).reads||{honest:true};
    const mk=(o,octopus)=>({label:o.label,octopus,fx:X=>{const right=o.right??!!reads[o.topic];X.set('readRight',right);X.set('octoFit',octopus&&right);X.set('reply',o.reply||null);if(o.topic)X.set('topic',o.topic);if(o.tendency)RALife.tendency(o.tendency);},next:'react'});
    return [mk(ask.a,false),mk(ask.b,false),mk(ask.o,true)];}},
  react:{lines:A=>{const right=A.vars.readRight;const c=C(A);const r=A.vars.reply||(right?pick(c.likesIt,nth(A))||'she laughs. for real.':pick(c.meh,nth(A))||'she nods. polite.');return [S(who(A),r)];},next:'moment'},
  moment:{lines:A=>{const c=C(A);const spotMoment=c.spots?.[A.vars.spot];const m=spotMoment||pick(c.moments,nth(A))||P(A)?.moment||'a small good moment happens.';return [N(m),...(c.richLine?[R(pick(c.richLine,nth(A)))]:[])];},next:'close'},
  close:{choices:A=>{const lvl=RARelations.level(who(A));const gifts=Object.keys(RALife.life().ownership.items).filter(k=>k.startsWith('gift_')&&RALife.count(k)>0);
    return [{label:'WALK HER HOME',next:'end'},...gifts.slice(0,2).map(g=>({label:`GIVE HER THE ${g.slice(5).replace(/_/g,' ').toUpperCase()} GIFT`,fx:X=>{RALife.consume(g);const right=RARelations.gift(who(X),g.slice(5));X.set('gift',right?'right':'wrong');},next:'gift'})),
     ...(lvl>=3&&(RARelations.get(who(A))?.datesCount||0)>=2?[{label:'CRACK 🔒',sub:'LOCKED',when:()=>false,hideLocked:false,next:'end'}]:[])];}},
  gift:{lines:A=>[S(who(A),A.vars.gift==='right'?(pick(C(A).giftRight,0)||'…how did you know.'):(pick(C(A).giftWrong,0)||"i'm posting it anyway."))],next:'end'},
  end:{end:{outcome:A=>A.vars.readRight?'good':'ok',
   fx:A=>{const res=RARelations.date(who(A),A.vars.spot,{readRight:!!A.vars.readRight,octopusFit:!!A.vars.octoFit});A.set('dateNo',res.datesCount);
    const posts=res.liked||A.vars.readRight;if(posts){RALife.addFollowers(10+Math.round(RALife.hash(RALife.today().day)%30));window.RAVampGram?.post?.({handle:(P(A)?.name||'her').toLowerCase().replace(/[^a-z]/g,''),text:pick(C(A).posts,res.datesCount-1)||`${RADating.spotLabel(A.vars.spot).toLowerCase()} 🖤`,likes:40+res.datesCount*12});}
    if(res.after>=3)RALife.setFlag('lastCloseDate',{person:who(A),day:RALife.today().day});
    if(A.vars.topic==='music'&&!RALife.life().creativeLife.music.cooked.length)RARelations.add(who(A),-2);
    window.RADateHooks?.after?.(who(A),A.vars,res);},
   memory:A=>({text:`${RADating.spotLabel(A.vars.spot).toLowerCase()} with ${(P(A)?.name||'her').toLowerCase()}`,lane:'dating'}),
   receipt:A=>((RARelations.get(who(A))?.datesCount||0)<=1?{id:`first:${who(A)}`,caption:`first date with ${(P(A)?.name||'her').toLowerCase()}. ${RADating.spotLabel(A.vars.spot).toLowerCase()}.`}:null),
   home:A=>['rich',pick(C(A).homeLine,nth(A)-1)||'…she was different tonight.',{vp:true}]}}
 }});
})();
