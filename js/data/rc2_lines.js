(function(){
 'use strict';
 // RC2 · BUILD 1 — LINES BUILD 3 OWES (filled from rc2_writing.js, OL-063) (docs/rc2/LINES_FOR_BUILD3.md). Build 1 writes NO story text. Every id below is a hook:
 // the text here is a plain, functional placeholder (what the screen is doing, no joke, no character voice) so the UI is never
 // blank. Build 3 replaces the string for an id and nothing else changes. Keep each line within 3 short sentences.
 const LINES={
  'club.first_visit':'FIRST NIGHT. HALF OFF AT THE DOOR. BRING HALF YOUR CASH, THE REST STAYS HOME.',
  'club.cap_reached':'THAT IS HALF YOUR CASH. THE DOORMAN IS PROUD OF YOU.',
  'club.need_cash':'NO CASH, NO SPRAY. THE DANCERS CAN TELL.',
  'cheap.meet':'YOU BOUGHT SOMETHING SMALL. SOMEBODY NOTICED YOU.',
  'cheap.unlock':'THAT SNACK PAID OFF. CHECK YOUR PHONE.',
  'rent.in':'RENT IS IN. YOUR BUILDINGS WORKED WHILE YOU SLEPT.',
  'guide.next_play':'MAKE A PLAY. SOMEONE ELSE HAS MONEY. YOU HAVE A PLAN.',
  'guide.next_offer':'THE BLACK CAR IS OUTSIDE. IT HAS AN OFFER. DO NOT ASK.'
 };
 window.RAEconLines=Object.freeze({get:id=>LINES[id]||'',ids:()=>Object.keys(LINES)});
})();
