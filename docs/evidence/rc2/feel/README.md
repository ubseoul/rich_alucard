# OL-067 evidence (390 wide, real Chromium, source checkout)
1. `01_f15_lineup_stagecards_390.png` — MAKE IT RAIN with the frozen Roxy / Rosalyn / Emerald stage cards on the dancer chips (3 images, 945x1680, naturalWidth verified).
2. `02_gbenga_dining_390.png` — NEW_OGA_M7, env `gbenga_house_dining` = `assets/build4/p_d/p_d_gbenga_house_dining.png`.
3. `03_night_flight_390.png` — ARC_MAZDA_2, env `ocean_night_flight` = `assets/build4/p_d/p_d_ocean_night_flight.png`.
4. `04_cockroach_390.png` — F15_ROSALYN_L4 node `dark`, the cockroach = `assets/f15/characters/spirit_of_uncle_bunmi_444x222.png`.
Reproduce: `node tools/rc2/ol067_shots.mjs docs/evidence/rc2/feel NEW_OGA_M7 ARC_MAZDA_2 scene F15_ROSALYN_L4 dark` (needs RA_PLAYWRIGHT_PATH / RA_CHROMIUM_PATH).
Backgrounds 2–3 pass through the RC2 display-time re-pixelation (64-colour palette, light dither); file bytes are unchanged.
