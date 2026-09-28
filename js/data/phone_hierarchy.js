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
    {id:'life',label:'LIFE',order:40,note:'activities and records'},
    {id:'system',label:'SYSTEM',order:90,note:'settings and utilities'}
  ];
  // Provisional runtime-app → section mapping. New apps should declare a `section` on RAPhoneApps.register instead
  // of editing this table. Apps without a mapping fall back to LIFE.
  const PLACEMENT={vampgpt:'now',vampgram:'social',instahoe:'social',onlyvamps:'social',realEstate:'money',jdmImports:'money',richboi:'money',texts:'life',hatch:'life',touge:'life',bars:'life',radio:'life',receipts:'life'};
  // Reserved, data-only slots for F2–F4. They render nothing until an app registers against them; they exist so a
  // future app has a stable place to land without reworking this framework.
  const RESERVED=[
    {slot:'f2a',section:'now',note:'F2 priority surface'},
    {slot:'f2b',section:'social',note:'F2 social surface'},
    {slot:'f3a',section:'money',note:'F3 economy surface'},
    {slot:'f3b',section:'life',note:'F3 life surface'},
    {slot:'f4a',section:'life',note:'F4 activity surface'},
    {slot:'f4b',section:'system',note:'F4 utility surface'}
  ];
  // Concise lock communication. `short` (≤3 words) shows under the locked icon; `line` is the single in-world
  // sentence shown only after the player taps. Keep both short — no tutorial walls.
  const LOCKS={
    vampgram:{short:'NO TAGS',line:'nobody tagged you yet.'},
    instahoe:{short:'NOT LISTED',line:'you not on there yet. somebody gotta dm you first.'},
    richboi:{short:'WAITLIST',line:'you not on the list. yet.'},
    onlyvamps:{short:'INVITE ONLY',line:'invite only.'}
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
  function describe(){return {schema:'1',provisional:true,sections:sections(),placement:placement(),reserved:reserved(),locks:Object.keys(LOCKS)};}
  window.RAPhoneHierarchy={schema:'1',provisional:true,sections,sectionIds,sectionFor,lockFor,placement,reserved,describe};
})();
