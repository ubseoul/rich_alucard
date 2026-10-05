(function(){
 'use strict';
 // F04 — PLAYMAKERS WAR ROOM — districts.js
 // Registers F04's authored Blood X districts with RADistricts (IF-1 4J) and CONSUMES Koreatown from F03.
 // Also registers the CONTESTED control state and the RIVAL holder names.
 // SOURCE: Vol 7 §3.1 — "Districts (demo: 3): KOREATOWN, THE ARTS DISTRICT, INGLEWOOD"
 // Inert when F04.war_room is OFF (RADistricts is infrastructure; no player-visible surface touched).

 if (!window.RAFeatures?.get('F04.war_room')) return; // guard: flag must be registered first

 // Register CONTESTED as an additional control state (UNCONTROLLED and CONTROLLED are base).
 window.RADistricts.registerState('CONTESTED');

 // Holder name constants used by the War Room system.
 // 'rich' = Rich's crew controls the district.
 // 'rival' = Open Mouth Gang controls (Vol 7 §5.4: "Open Mouth Gang — Lil Smack's crew").
 // null    = no holder (UNCONTROLLED or CONTESTED)
 const HOLDERS = Object.freeze({ RICH: 'rich', RIVAL: 'rival' });

 // F04 strategic overlay for the three authored districts (Vol 7 §3.1). This is F04's OWN data (demand / heat weights);
// it is never written into RADistricts, so it works whoever owns the RADistricts definition.
const STRATEGIC = Object.freeze({
 koreatown:     { label: 'KOREATOWN',         meta: { profile: 'dense, high demand, rival-heavy', demandBase: 3, heatBase: 2 } },
 arts_district: { label: 'THE ARTS DISTRICT', meta: { profile: 'rich clients, high heat',         demandBase: 2, heatBase: 3 } },
 inglewood:     { label: 'INGLEWOOD',         meta: { profile: 'steady, loyal, low glamour',      demandBase: 2, heatBase: 1 } }
});
const ALL_IDS = Object.freeze(Object.keys(STRATEGIC));

// OWNERSHIP (DeepSeek provider-contract audit): KOREATOWN is DEFINED by F03 (NEW_OGA_LADDER_CLOSE). F04 only CONSUMES it.
// F04 defines exactly the districts nobody else owns; it never calls RADistricts.define('koreatown'). A define() failure for one
// district can therefore no longer stop the others from registering (each define is isolated).
const F03_OWNED = Object.freeze(['koreatown']);
const provider = { errors: [] };
for (const id of ALL_IDS) {
 if (F03_OWNED.includes(id)) continue;
 if (window.RADistricts.get(id)) continue; // already defined by its owner: consume
 try {
  window.RADistricts.define({ id, label: STRATEGIC[id].label, meta: STRATEGIC[id].meta, fragment: 'F04' });
 } catch (e) { provider.errors.push({ id, message: String(e.message || e) }); console.error('F04 district define', id, e); }
}

// A district is USABLE by the War Room only when RADistricts knows it. Koreatown is usable when F03's definition is present
// (F03 loads before F04; if F03 is not in the build, Koreatown reports PROVIDER_MISSING and the War Room skips it).
const usable = id => !!window.RADistricts.get(id);
const activeIds = () => ALL_IDS.filter(usable);

// Expose authored constants for other F04 modules.
 window.RAWarRoomDistricts = Object.freeze({
  IDS: ALL_IDS,
  // ids the War Room can use right now (registered in RADistricts, whoever defined them)
  activeIds,
  usable,
  strategic: id => STRATEGIC[id] ? { label: STRATEGIC[id].label, ...STRATEGIC[id].meta } : null,
  // provider contract: who defines each district, and what is missing. Koreatown is F03-owned; F04 never defines it.
  provider: () => ({
   owned: { koreatown: 'F03', arts_district: 'F04', inglewood: 'F04' },
   consumed: F03_OWNED.filter(usable),
   missing: F03_OWNED.filter(id => !usable(id)).map(id => ({ id, code: 'PROVIDER_MISSING', owner: 'F03' })),
   errors: provider.errors.slice()
  }),
  HOLDERS,
  // Pressure track: 0–5. At 5, district flips to rival. Vol 7 §3.1.
  MAX_PRESSURE: 5,
  // Get the live pressure for a district (stored in frag.F04.districts.<id>.rivalPressure)
  pressure(id) {
   return Number(window.RAFrag.read('F04', `districts.${id}.rivalPressure`, 0));
  },
  // Increment rival pressure by 1; if it reaches MAX_PRESSURE, flip district to rival.
  // Called by the nightly wake handler when a district is not serviced.
  tickPressure(id) {
   const current = this.pressure(id);
   const next = Math.min(current + 1, this.MAX_PRESSURE);
   window.RAFrag.patch('F04', `districts.${id}.rivalPressure`, next);
   if (next >= this.MAX_PRESSURE) {
    const was = window.RADistricts.get(id);
    window.RADistricts.setControl(id, 'CONTROLLED', { holder: HOLDERS.RIVAL, reason: 'pressure-maxed' });
    // Schedule retaliation event (3 nights out): stored as a pending event flag
    const day = window.RALife.today().day;
    window.RAFrag.patch('F04', `districts.${id}.retaliationDay`, day + 3);
    window.RAFrag.patch('F04', `districts.${id}.rivalPressure`, 0); // reset after flip
   }
   return next;
  },
  // Reset pressure when a district is successfully serviced tonight.
  resetPressure(id) {
   window.RAFrag.patch('F04', `districts.${id}.rivalPressure`, 0);
  },
  // Demand multiplier: how much the DEMAND track in a district scales tonight.
  // Vol 7 §3 — demand is a property of each district; not a global number.
  demand(id) {
   const d = window.RADistricts.get(id);
   if (!d) return 0;
   // Base demand from meta, scaled by control holder
   const base = STRATEGIC[id]?.meta.demandBase || d.meta?.demandBase || 1;
   const control = window.RADistricts.get(id)?.state;
   if (control === 'CONTROLLED' && window.RADistricts.get(id)?.holder === HOLDERS.RIVAL) return 0; // lost this district
   return base;
  },
  snapshot() {
   return Object.fromEntries(activeIds().map(id => [id, { ...window.RADistricts.get(id), rivalPressure: this.pressure(id) }]));
  }
 });
})();
