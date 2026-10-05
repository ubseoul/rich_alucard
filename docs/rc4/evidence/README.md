# RC4 evidence and reproduction

Base4981d5245d0600c062a7f431acd8253dc28b9cc6. Real Chromium390×844 on repository source using tools/rc2/harness.mjs. Source preview is not a successful built artifact. No dev query/feature flags. Ordinary script uses fresh storage and real controls; fixture scripts explicitly reset/patch state or directly launch games and are not a campaign playthrough. Scripts are audit tools, not runtime changes.

Run from repo root with Playwright and Chromium installed:

```sh
RA_PLAYWRIGHT_PATH=/path/to/playwright-core RA_CHROMIUM_PATH=/path/to/chromium node docs/rc4/evidence/scripts/ordinary.mjs
```

Use the other scripts only when fixture coverage is desired; running overwrites evidence in its corresponding directory. The harness opens a local server and browser and needs loopback permission. Fixture completion is recorded rather than used to claim release acceptance; inspect JSON failure/errors fields. `firstFightSeconds` measures time to first fight entry at automated tap pace, not fight duration or human reading time.

- ordinary/: fresh full Day1 loop and Day2 start, real keys/combat/throws.
- targeted/: direct minigame views and initial incomplete late/phone fixtures. Several phone tiles are locked before proper wake; $100K is reset default. dance mode:rave is generic (wrong parameter), not ordinary rave. Day31 state is incomplete. Multi-game residual toast is fixture contamination.
- access/: actual M9 NAH, M8 bridge NO_CAR, completed-finale Day37 state, canopy drag and real War Room picker/HOOPTIE. rave:true uses44 notes and bloodRain:true, whereas ordinary uses36 notes/moodStart70; art mode is correct but chart is a fixture.
- final-check/: actual M4 params throw, explicitly eligible ending false, initialized-wake actual Armory home/MODS click. No fresh starting-money inference.
- combat-reference.zip/inventory: exact repo reference bytes and metadata; approval statuses distinguished from existence. No new art.

No natural late-game save, full PLAY settlement, all dates/VIP, full high/low minigame outcomes, all-car recovery, real Gbenga fight or audio listening study. See PLAYER_LOGIC_REVIEW for source coverage and COMB_LEDGER for uncertainty.

Validation: all4 scripts passed node --check and browser runs produced no captured page errors. npm test fails baseline before suite due absent case-sensitive tools/tests/F02/_lib.mjs; source check fails5 stale hashes. No baseline repair or test bypass performed.
