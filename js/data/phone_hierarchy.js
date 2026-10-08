(function(){
  // PHONE HIERARCHY — PROVISIONAL framework only.
  //
  // Purpose (PACKET UL-L2-001 / F1): give the phone a clear, data-driven hierarchy and let locked surfaces
  // communicate WHY they are locked in a few words. Placement is intentionally NOT finalized: F2–F4 will add
  // apps and navigation, and the phone-placement review happens later in F7. Treat every mapping here as a slot
  // that may move. Nothing here invents an app or a mechanic.
  const SECTIONS=[
    {id:'now',label:'NOW',order:10,note:'priority surfaces'},
    {id:'social',label:'PEOPLE',order:20,note:'contacts, feeds, DMs'},
    {id:'money',label:'MONEY',order:30,note:'income, cars, property'},
    {id:'life',label:'LIFE',order:40,note:'activities, records and utilities'}
  ];
  // Provisional runtime-app → section mapping. New apps should declare a `section` on RAPhoneApps.register instead
  // of editing this table. Apps without a mapping fall back to LIFE.
  const PLACEMENT={vampgpt:'now',maps:'now',vampgram:'social',instahoe:'social',onlyvamps:'social',contacts:'social',realEstate:'money',bank:'money',jdmImports:'money',richboi:'money',texts:'social',hatch:'life',touge:'life',bars:'life',radio:'life',receipts:'life',moves:'life'};
  // Reserved, data-only slots for F2–F4. They render nothing until an app registers against them; they exist so a
  // future app has a stable place to land without reworking this framework.
  const RESERVED=[
    {slot:'f2a',section:'now',note:'F2 priority surface'},
    {slot:'f2b',section:'social',note:'F2 social surface'},
    {slot:'f3a',section:'money',note:'F3 economy surface'},
    {slot:'f3b',section:'life',note:'F3 life surface'},
    {slot:'f4a',section:'life',note:'F4 activity surface'},
    {slot:'f4b',section:'life',note:'F4 utility surface'}
  ];
  // Concise lock communication. `short` (≤3 words) shows under the locked icon; `line` is the single in-world
  // sentence shown only after the player taps. Keep both short — no tutorial walls.
  const LOCKS={
    vampgram:{short:'NO TAGS',line:'nobody tagged you yet.',unlock:"Finish Ogun's rave."},
    instahoe:{short:'NOT LISTED',line:'you not on there yet. somebody gotta dm you first.',unlock:'Meet Kiki or the assistant in the daytime people lane.'},
    richboi:{short:'WAITLIST',line:'you not on the list. yet.',unlock:'$500,000 net worth or the Duchess invitation; checked next morning.'},
    onlyvamps:{short:'INVITE ONLY',line:'invite only.',unlock:'Meet Velvet at the Grave Mall.'},
    texts:{short:'NO MESSAGES',line:'nobody yet.',unlock:'Receive your first text.'},
    hatch:{short:'NO EGG',line:'not yet.',unlock:'Adopt the dragon egg.'},
    touge:{short:'NO DRIVER',line:'not yet.',unlock:"Complete Pinky's drift lesson."},
    bars:{short:'NO SONG',line:'not yet.',unlock:'Cook your first song with Wispa.'},
    radio:{short:'NO TRACK',line:'not yet.',unlock:'Unlock a song.'},
    receipts:{short:'NO RECEIPTS',line:'nothing yet. go live.',unlock:'Complete the butter-chicken trip.'},
    armory:{short:'UNKNOWN DEALER',line:'not yet.',unlock:'Discover the Armory.'},
    warRoom:{short:'NO OFFER',line:'nothing yet.',unlock:"Day 2: the offer lands after your first sleep. Say yes."},
    trap:{short:'NO LISTING',line:'not yet.',unlock:'Reach NEW OGA Associate, accept Mister December, or finish JUGGED THE PLUG from Day 14.'},
    rainmaker:{short:'NO INVITE',line:'not yet.',unlock:'Complete your first world event.'},
    moves:{short:'HOME ONLY',line:'not yet.',unlock:'Return to the bedroom.'}
  };
  function sections(){return SECTIONS.slice().sort((a,b)=>a.order-b.order);}
  function sectionIds(){return sections().map(s=>s.id);}
  function sectionFor(appId,app){
    const declared=app?.section||PLACEMENT[appId];if(declared&&SECTIONS.some(s=>s.id===declared))return declared;
    const slot=RESERVED.find(s=>s.slot===app?.slot);if(slot)return slot.section;
    return 'life';
  }
  function lockFor(appId,app){
    if(LOCKS[appId])return {...LOCKS[appId]};
    if(app?.lock)return {short:app.lock.short||'LOCKED',line:app.lock.line||app.lock.text||'not yet.'};
    return {short:'LOCKED',line:app?.lockedLine||'not yet.'};
  }
  function placement(){return {...PLACEMENT};}
  function reserved(){return RESERVED.map(slot=>({...slot}));}
  function describe(){return {schema:'1',provisional:false,sections:sections(),placement:placement(),reserved:reserved(),locks:Object.keys(LOCKS)};}
  window.RAPhoneHierarchy={schema:'1',provisional:false,sections,sectionIds,sectionFor,lockFor,placement,reserved,describe};
})();
