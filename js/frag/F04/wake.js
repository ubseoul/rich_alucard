(function(){
 'use strict';
 // F04 — PLAYMAKERS WAR ROOM — wake.js
 // Registers nightly wake handlers via RAWakeBus (IF-1 4C).
 // Handles: Offer availability check, rival pressure tick, crew timer expiry, retaliation scheduling.
 // SOURCE: Vol 7 §1 (unlock conditions), §3.1 (clock / rival pressure), §3.1 (2 job slots at 6+ Ogas).

 if (!window.RAFeatures?.get('F04.war_room')) return;

 // ── Offer availability (Vol 7 §1) ────────────────────────────────────────
 // Unlocks Days 16–22 (mid-game) when ALL are true:
 //   Ogun's Rave done; Vampire Rep ≥ MID; Rich owns at least one car; 2+ homies at COOL.
 // Second offer: ~8 sleeps after first decline.
 function checkOfferEligibility() {
  const life = window.RAState.get().life;
  const day = window.RALife.today().day;
  if (day < 16 || day > 22) return false;

  // Ogun's Rave done
  const raveDone = !!life.world?.flags?.ogunRaveDone;
  if (!raveDone) return false;

  // Vampire Rep ≥ MID (street clout tier)
  const clout = window.RASocial.streetClout.tier();
  if (clout === 'LOW') return false;

  // Rich owns at least one car
  const cars = window.RALife.ownedCars?.() || [];
  if (cars.length < 1) return false;

  // 2+ homies at COOL (relations)
  const known = window.RARelations?.known?.() || [];
  const coolHomies = known.filter(p => {
   const rel = window.RARelations?.get?.(p.id);
   return rel && (rel.level || 0) >= 2; // COOL ≈ relation level 2+
  });
  if (coolHomies.length < 2) return false;

  return true;
 }

 // Wake handler: check and update offer availability.
 window.RAWakeBus.subscribe({
  id: 'F04.offer-check',
  fragment: 'F04',
  phase: 'wake',
  priority: 62, // CONTENT band
  flag: 'F04.war_room',
  fn(ctx) {
   const offer = window.RAFrag.read('F04', 'offer', {});
   const day = ctx?.info?.day || window.RALife.today().day;

   // Already accepted or finally declined
   if (['accepted', 'declined_final', 'closed_fame'].includes(offer.status)) return;

   // Second offer: ~8 sleeps after first decline
   if (offer.status === 'declined_once' && offer.declinedOnDay != null) {
    const secondDay = offer.declinedOnDay + 8;
    if (day >= secondDay && offer.secondOfferDay == null) {
     window.RAFrag.patch('F04', 'offer.secondOfferDay', day);
     window.RAFrag.patch('F04', 'offer.status', 'available');
    }
    return;
   }

   // First offer
   if (offer.status === 'unavailable' && checkOfferEligibility()) {
    window.RAFrag.patch('F04', 'offer.status', 'available');
   }
  }
 });

 // ── Rival pressure tick (Vol 7 §3.1) ─────────────────────────────────────
 // Every night that a district is not serviced, rival pressure rises.
 // "You cannot service everything. That's the strategy."
 window.RAWakeBus.subscribe({
  id: 'F04.rival-pressure',
  fragment: 'F04',
  phase: 'wake',
  priority: 63, // CONTENT band — after offer check
  flag: 'F04.war_room',
  fn(ctx) {
   if (!window.RAFrag.read('F04', 'active', false)) return;

   const day = ctx?.info?.day || window.RALife.today().day;
   const log = window.RAFrag.read('F04', 'jobs.log', []);
   // Districts serviced tonight (jobs completed on this day)
   const servicedTonight = new Set(
    log.filter(e => e.day === day - 1 && e.result === 'success').map(e => e.district)
   );

   for (const distId of window.RAWarRoomDistricts.IDS) {
    const dist = window.RADistricts.get(distId);
    if (!dist) continue;
    // Only tick districts that Rich has some interest in (not already lost)
    if (dist.state === 'CONTROLLED' && dist.holder === 'rival') continue;
    if (!servicedTonight.has(distId)) {
     window.RAWarRoomDistricts.tickPressure(distId);
    }
   }

   // Update slot count in frag state
   window.RAFrag.patch('F04', 'jobs.slotsPerNight', window.RAWarRoomCrew.slotsPerNight());

   // Retaliation: check if a retaliation event is due
   for (const distId of window.RAWarRoomDistricts.IDS) {
    const retDay = window.RAFrag.read('F04', `districts.${distId}.retaliationDay`, null);
    if (retDay != null && day >= retDay) {
     window.RAFrag.patch('F04', `districts.${distId}.retaliationDay`, null);
     window.RAFrag.patch('F04', `districts.${distId}.retaliationPending`, true);
    }
   }
  }
 });

 // ── Night report contribution ─────────────────────────────────────────────
 window.RAWakeBus.nightReport.contribute({
  id: 'F04.war-room-summary',
  fragment: 'F04',
  priority: 30,
  flag: 'F04.war_room',
  fn(ctx) {
   if (!window.RAFrag.read('F04', 'active', false)) return null;
   const cards = window.RAWarRoomReportCard?.recent(1) || [];
   if (!cards.length) return null;
   const c = cards[0];
   return {
    title: 'WAR ROOM',
    text: `${c.districtLabel}: ${c.success ? 'clean run' : 'rough night'}. Cash ${c.tally.cash >= 0 ? '+' : ''}$${c.tally.cash.toLocaleString()}.`
   };
  }
 });

 // ── Fame closure (Vol 7 §9) ───────────────────────────────────────────────
 // Route closes when fame arrives. Detected via the accepted fame system.
 window.RAWakeBus.subscribe({
  id: 'F04.fame-close',
  fragment: 'F04',
  phase: 'wake',
  priority: 95, // TAIL band — after everything
  flag: 'F04.war_room',
  fn() {
   const fame = window.RAState.get().life?.fame;
   if (!fame?.arrived) return;
   const offer = window.RAFrag.read('F04', 'offer', {});
   if (offer.status === 'accepted') {
    window.RAFrag.patch('F04', 'offer.status', 'closed_fame');
    window.RAFrag.patch('F04', 'active', false);
    // Final report card tease is sealed (Vol 7 §9).
   }
  }
 });
})();
