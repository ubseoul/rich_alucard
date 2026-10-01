(function(){
 'use strict';
 // F04 — PLAYMAKERS WAR ROOM — crew.js
 // Defines the six named Ogas with RACrew (IF-1 4H).
 // SOURCE: Vol 7 §6.3 — starting roster of 6.
 //
 // CANON GUARDS (Vol 7 §0):
 //   - Rich never turns men; Ogas are vampires who chose him or humans who ride with him.
 //   - Tristan NEVER joins (Vol 7 §6.3: "Tristan never joins. If asked, he says no and stays Rich's friend anyway.").
 //   - Roster can grow up to 8 via recruits (Catacomb, Rave, Tokyo Tony's crew).
 //   - "Any Ogas" means current registry — do not hardcode a fixed roster anywhere else.

 if (!window.RAFeatures?.get('F04.war_room')) return;

 // Crew classes from Vol 7 §5.4 (units table) and §6.3 (roster entries).
 // GHOST: stealth; TALKER: diplomacy; MUSCLE: brute; SHOOTER: ranged; WHEELS: driving; DOC: medic.
 const CLASSES = Object.freeze(['GHOST','TALKER','MUSCLE','SHOOTER','WHEELS','DOC']);

 // Named six — sourced from Vol 7 §6.3 and §7 (character visual concept cards).
 // Tunde and Dre are existing homies (Vol 2 cards); the four new are authored in Vol 7 §7.
 const NAMED_SIX = [
  {
   id: 'tunde',
   name: 'TUNDE',
   class: 'MUSCLE',
   meta: { existing: true, vol: 2, note: 'existing homie card (Vol 2)' }
  },
  {
   id: 'dre',
   name: 'DRE',
   class: 'TALKER',
   meta: { existing: true, vol: 2, note: 'existing homie card (Vol 2)' }
  },
  {
   id: 'half_pint',
   name: 'HALF-PINT',
   class: 'GHOST',
   meta: {
    description: 'tiny, hoodie, fingerless gloves',
    artNote: 'Vol 7 §7 visual concept card'
   }
  },
  {
   id: 'sunday_best',
   name: 'SUNDAY BEST',
   class: 'SHOOTER',
   meta: {
    description: 'three-piece church suit, pocket square, long rifle case',
    artNote: 'Vol 7 §7 visual concept card'
   }
  },
  {
   id: 'young_mazi',
   name: 'YOUNG MAZI',
   class: 'WHEELS',
   meta: {
    description: 'copied shades, too-big chain, a WHEELS lanyard',
    artNote: 'Vol 7 §7 visual concept card'
   }
  },
  {
   id: 'auntie_grit',
   name: 'AUNTIE GRIT',
   class: 'DOC',
   meta: {
    description: 'scrubs under a puffer jacket, medical bag, reading glasses on a chain',
    artNote: 'Vol 7 §7 visual concept card'
   }
  }
 ];

 for (const def of NAMED_SIX) {
  window.RACrew.define({ ...def, fragment: 'F04' });
 }

 // Recruit registry: vampires from Catacomb, Rave, or Tokyo Tony's crew.
 // Recruits are defined dynamically by the game systems; they are registered here
 // using the same RACrew.define path when they join, so "Any Ogas" = RACrew.list({fragment:'F04'}).
 // (No recruit is pre-defined here; they are thinner characters by design — Vol 7 §6.3.)

 // Bond tracking: Vol 7 §6.2 — DAY ONES when 3 jobs together.
 // RACrew.bond(id, other, delta) handles this; the 3-run threshold is checked by the jobs system.
 const DAY_ONE_THRESHOLD = 3; // jobs together

 // Story system: each job an Oga survives adds a STORY. Max 4 in the demo (Vol 7 §6.1).
 const MAX_STORIES = 4;

 // GONE ribbon flag: set when an Oga is GONE; stored in meta by the jobs system.
 // Black ribbon appears on the War Room table; bedroom company can never pick them again.

 // Expose crew helpers for other F04 modules.
 window.RAWarRoomCrew = Object.freeze({
  CLASSES,
  NAMED_SIX_IDS: Object.freeze(NAMED_SIX.map(d => d.id)),
  DAY_ONE_THRESHOLD,
  MAX_STORIES,

  // All active Ogas in the War Room (fragment F04, not GONE).
  activeOgas() {
   return window.RACrew.list({ fragment: 'F04' }).filter(u => u.status === 'ACTIVE');
  },

  // All Ogas (any status) in this fragment.
  allOgas() {
   return window.RACrew.list({ fragment: 'F04' });
  },

  // Slots per night: 1 early, 2 once 6+ active Ogas (Vol 7 §3.1).
  slotsPerNight() {
   return this.activeOgas().length >= 6 ? 2 : 1;
  },

  // Record a job run between two Ogas and check for DAY ONE bond threshold.
  recordJobTogether(idA, idB) {
   const countA = window.RACrew.get(idA)?.bonds?.[idB] || 0;
   const next = window.RACrew.bond(idA, idB, 1);
   window.RACrew.bond(idB, idA, 1); // symmetric
   // If either direction just crossed the threshold, mark DAY ONE
   if (next >= DAY_ONE_THRESHOLD && countA < DAY_ONE_THRESHOLD) {
    window.RACrew.story(idA, `day_one_with_${idB}`, true);
    window.RACrew.story(idB, `day_one_with_${idA}`, true);
   }
  },

  // Check if two Ogas are DAY ONES.
  areDayOnes(idA, idB) {
   return (window.RACrew.get(idA)?.bonds?.[idB] || 0) >= DAY_ONE_THRESHOLD;
  },

  // Add a story to an Oga. Respects MAX_STORIES cap (demo).
  // key: snake_case story id; value: authored story line (string).
  addStory(id, key, line) {
   const unit = window.RACrew.get(id);
   if (!unit) return false;
   if (Object.keys(unit.stories || {}).length >= MAX_STORIES) return false; // capped
   window.RACrew.story(id, key, line);
   return true;
  },

  // DOWNED: set status + 3-turn bleed timer (translates to 3 nights for non-Showdown expiry).
  // For Showdown use, F01 integration handles the in-battle bleed. Here we handle the persistence.
  setDowned(id, { reason = null } = {}) {
   return window.RACrew.setStatus(id, 'DOWNED', {
    reason,
    timer: { name: 'bleed', days: 3, onExpire: 'GONE' }
   });
  },

  // DOWNED but carried home (a PLAY brought them back hurt): recoverable, NOT the bleed-out clock. Back to ACTIVE after `days` nights.
  // (setDowned above is the un-carried case: bleed timer -> GONE.)
  setRecovering(id, { days = 1, reason = null } = {}) {
   return window.RACrew.setStatus(id, 'DOWNED', {
    reason,
    timer: { name: 'recovery', days: Math.max(1, Number(days) || 1), onExpire: 'ACTIVE' }
   });
  },

  // CAPTURED: set status + 3-night EXTRACT window timer (Vol 7 §5.7).
  setCaptured(id, { reason = null } = {}) {
   return window.RACrew.setStatus(id, 'CAPTURED', {
    reason,
    timer: { name: 'extract_window', days: 3, onExpire: 'GONE' }
   });
  },

  // GONE: terminal. Called when EXTRACT fails or expires. Also called on bleed-timer expiry.
  // GONE is always the player's fault — never random (Vol 7 §6.4).
  setGone(id, { reason = null } = {}) {
   const result = window.RACrew.setStatus(id, 'GONE', { reason });
   if (result.ok) {
    // Day One partner mourns: -10 aim for 5 nights (tracked as a bond penalty story)
    const unit = window.RACrew.get(id);
    if (unit) {
     for (const [otherId, count] of Object.entries(unit.bonds || {})) {
      if (count >= DAY_ONE_THRESHOLD) {
       const other = window.RACrew.get(otherId);
       if (other && other.status === 'ACTIVE') {
        window.RACrew.story(otherId, `mourning_${id}`, `mourning ${unit.name} (-10 aim, 5 nights)`);
        window.RACrew.setTimer(otherId, `mourning_${id}`, { days: 5, onExpire: null });
       }
      }
     }
    }
   }
   return result;
  },

  // Recruit a new Oga from the registry. Source: 'catacomb' | 'rave' | 'touge'.
  // id, name, cls must be provided by the source system.
  recruit({ id, name, cls, source = 'recruit' } = {}) {
   if (!id || !name || !cls) return { ok: false, reason: 'missing-fields' };
   if (!CLASSES.includes(cls)) return { ok: false, reason: `unknown-class-${cls}` };
   if (window.RACrew.get(id)) return { ok: false, reason: 'already-defined' };
   if (this.allOgas().length >= 8) return { ok: false, reason: 'roster-full' }; // Vol 7 §6.3: max 8
   window.RACrew.define({ id, name, class: cls, fragment: 'F04', meta: { recruit: true, source } });
   return { ok: true, id };
  }
 });
})();
