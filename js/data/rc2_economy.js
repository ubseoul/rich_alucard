(function(){
 'use strict';
 // RC2 · BUILD 1 · ECONOMY & GUIDANCE (OL-063). Every number RC2 changed in the economy lives here, one source, so the sim and
 // docs/rc2/ECONOMY_DELTA.md read the same values. SR-11 and the F13 economy lock are lifted ONLY for the rows below.
 // Still locked and NOT in this file: THE PLAY live UI and timing (F01 feel), the OL-022 capture bands, day-job pay.
 window.RAEcon=Object.freeze({
  // ---- PLAYs are the main path -------------------------------------------------------------------------------------------
  // F04 Mister December's first offer (was: Days 16-22, Ogun's Rave done, MID rep, a car, two COOL homies).
  offer:Object.freeze({firstDay:2,secondOfferGapDays:3}),                       // second gap was 8
  // NEW OGA M1 JUG THE PLUG window (was Days 8-12). A way into the crew story that starts early and stays open.
  newOgaM1:Object.freeze({fromDay:3,toDay:24}),
  // ---- strip club ---------------------------------------------------------------------------------------------------------
  stripClub:Object.freeze({
   openDay:1,                       // the phone app is there from the first wake (was: after the first world event)
   firstVisit:Object.freeze({
    discount:0.25,                  // the house comps this share of every throw on the first visit
    capShare:0.5                    // and a first-visit round never risks more than this share of the cash on hand
   }),
   minRound:500                     // a capped round below this is refused ("NEED CASH")
  }),
  // ---- rentals pay daily --------------------------------------------------------------------------------------------------
  // Daily income per owned rental (was: weeklyRent accrued on Fridays, collected by hand). Paid into cash at WAKE.
  rent:Object.freeze({
   daily:true,
   perDay:Object.freeze({property_la_4p_01:800,re_duplex_inglewood:2400,re_bungalow_highland:3400,re_courtyard_ktown:5600,re_laundromat_ktown:7400})
  }),
  // ---- cheap buys pay off -------------------------------------------------------------------------------------------------
  cheapBuys:Object.freeze({maxPrice:60,chance:0.5,cooldownDays:1}),
  // ---- guidance -----------------------------------------------------------------------------------------------------------
  guidance:Object.freeze({recommended:4})
 });
})();
