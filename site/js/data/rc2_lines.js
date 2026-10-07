(function(){
 'use strict';
 // RC2 · BUILD 1 — LINES BUILD 3 OWES (filled from rc2_writing.js, OL-063) (docs/rc2/LINES_FOR_BUILD3.md). Build 1 writes NO story text. Every id below is a hook:
 // the text here is a plain, functional placeholder (what the screen is doing, no joke, no character voice) so the UI is never
 // blank. Build 3 replaces the string for an id and nothing else changes. Keep each line within 3 short sentences.
 const LINES={
  'club.first_visit':"first night half off bring half your cash leave the other half home",
  'club.cap_reached':"half your cash gone doorman saving your ass",
  'club.need_cash':"no funds no dance bro",
  'cheap.meet':"small purchase big introduction",
  'cheap.unlock':"snack did networking check your phone",
  'rent.in':"rent landed building got a job now",
  'guide.next_play':"somebody got funds go make a play",
  'guide.next_offer':"black car outside rich ass offer waiting"
 };
 window.RAEconLines=Object.freeze({get:id=>LINES[id]||'',ids:()=>Object.keys(LINES)});
})();
