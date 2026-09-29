(function(){
 'use strict';
 // F04 — PLAYMAKERS WAR ROOM — districts.js
 // Registers the three authored Blood X districts with RADistricts (IF-1 4J).
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

 // Authored districts — label and meta from Vol 7 §3.1.
 const DISTRICT_DEFS = [
  {
   id: 'koreatown',
   label: 'KOREATOWN',
   meta: {
    profile: 'dense, high demand, rival-heavy',
    demandBase: 3,   // relative demand weight (tuning placeholder; authored numbers SOURCE_REQUIRED)
    heatBase: 2      // rival activity raises heat faster here
   }
  },
  {
   id: 'arts_district',
   label: 'THE ARTS DISTRICT',
   meta: {
    profile: 'rich clients, high heat',
    demandBase: 2,
    heatBase: 3
   }
  },
  {
   id: 'inglewood',
   label: 'INGLEWOOD',
   meta: {
    profile: 'steady, loyal, low glamour',
    demandBase: 2,
    heatBase: 1
   }
  }
 ];

 for (const def of DISTRICT_DEFS) {
  window.RADistricts.define({ ...def, fragment: 'F04' });
 }

 // Expose authored constants for other F04 modules.
 window.RAWarRoomDistricts = Object.freeze({
  IDS: Object.freeze(DISTRICT_DEFS.map(d => d.id)),
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
   const base = d.meta.demandBase || 1;
   const control = window.RADistricts.get(id)?.state;
   if (control === 'CONTROLLED' && window.RADistricts.get(id)?.holder === HOLDERS.RIVAL) return 0; // lost this district
   return base;
  },
  snapshot() {
   return window.RADistricts.IDS
    ? null
    : Object.fromEntries(
     DISTRICT_DEFS.map(def => [
      def.id,
      {
       ...window.RADistricts.get(def.id),
       rivalPressure: this.pressure(def.id)
      }
     ])
    );
  }
 });
})();
