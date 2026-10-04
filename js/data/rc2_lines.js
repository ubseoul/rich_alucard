(function(){
 'use strict';
 // RC2 · BUILD 1 — LINES BUILD 3 OWES (docs/rc2/LINES_FOR_BUILD3.md). Build 1 writes NO story text. Every id below is a hook:
 // the text here is a plain, functional placeholder (what the screen is doing, no joke, no character voice) so the UI is never
 // blank. Build 3 replaces the string for an id and nothing else changes. Keep each line within 3 short sentences.
 const LINES={
  'club.first_visit':'FIRST VISIT. THE HOUSE COVERS PART OF EVERY THROW. YOU CAN SPEND UP TO HALF YOUR CASH.',
  'club.cap_reached':'THAT IS HALF YOUR CASH. COME BACK LATER.',
  'club.need_cash':'NEED CASH.',
  'cheap.meet':'SOMEBODY AT THE COUNTER KNOWS YOU.',
  'cheap.unlock':'SOMETHING NEW IS ON YOUR PHONE.',
  'rent.in':'RENT IN.',
  'guide.next_play':'MAKE A PLAY.',
  'guide.next_offer':'THE BLACK CAR IS OUTSIDE.'
 };
 window.RAEconLines=Object.freeze({get:id=>LINES[id]||'',ids:()=>Object.keys(LINES)});
})();
