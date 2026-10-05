# RC3 Build B · OL-074 / OL-075

## Failures first

No outstanding product failures after validation. Fixed during this build:

- Rave overlay intercepted the rhythm START button. The adventure now yields the screen to rhythm/combat and restores it afterward.
- Old rave phases could strand saved progression. Legacy saves resume at the dance floor or hunter entrance; quitting allows retry, losing advances, saved fights resume.
- PLAY composited a static hand under its animated hand. A new pixel quilt background leaves one hand rig.
- PLAY crew avatars collided with the notch; loadout hints and weapon slots crowded adjacent controls. The header and loadout now have dedicated space.

Browser harness retries also exposed automated throws landing late, or starting after the round timeout under machine load. It now loads before waiting for the spotlight, then flicks; an expired round uses the real RUN IT BACK button. No collision, odds or capture-band shortcuts were introduced.

## Delivered

Branch `rc3/club-001`, based on `ae87ec401f5d73063e2408cf5601bd1f1eba3cb8`.

Club: Roxy / Rosalyn / Emerald rotate nightly. One dancer follows a turning left/right platform and the exact moving collision target. Timed throws build hit combos and tip-to-hype multipliers, max hype triggers a five-second gold encore with confetti and faster dancing, and lifetime encores unlock three persistent VIP tiers. Digitized pixel portraits show the nightly roster; all dancers are 21+. Spending/support retains its original ledger and date thresholds.

Rave: arrival → Ogun greeting → original 126 BPM blood-rave rhythm to blend in → BLAD33EE entrance → **“oh shit, that's Blad33ee!”** → immediate hunter-faction fight → exterior closeout → night completion and party-hosting unlock. Either game outcome progresses; quit remains retryable.

Ramen: clearer ingredient orders, waiting-ticket patience, bowl streak feedback and a shift receipt. Existing payouts remain.

Kept: club, dance/rave, ramen, TOUGE, owambe collection, hatch, pier, bars, Jollof Wars, hookah. Garage is TOUGE preparation; pickup is retired with reward-free compatibility for old story routes. Decisions and mechanics are detailed in [MINIGAMES.md](MINIGAMES.md).

PLAY: offer, crew/car, live chat, decisions and return use RC2 Life OS colors, pixel fonts and square borders. Original simulation, odds, capture bands, clocks and result consumption remain intact. Frozen art and Build A's phone/story/cut files are unchanged.

## Validation

- Full `npm test`: exit 0; deterministic release gate includes 249 JavaScript syntax checks and all fragment tests, including RC3 progression regressions.
- Browser: Edge Chromium at **390 × 844**, real pointer/keyboard input. Three club nights each reach an encore; VIP survives reload. Rave quit/retry → rhythm → exact OL-075 reaction → actual fight → exterior completion. Ramen orders → receipt → rewards. One canonical PLAY → consumed exactly once.
- Browser checks cover missing assets/errors, one-hand composition, phone header width and offer/loadout control bounds.
- Evidence: [browser results](evidence/build-b/results.json), [full test log](evidence/build-b/npm-test.log), and PNGs under `evidence/build-b/`.

PLAY screenshots: [offer](evidence/build-b/play-390-offer.png), [loadout](evidence/build-b/play-390-loadout.png), [live](evidence/build-b/play-390-live.png), [decision](evidence/build-b/play-390-decision.png), [return](evidence/build-b/play-390-return.png).
