# FINAL-A tap census · real Chrome

**978/978 taps start a sound; 0 missing cues; 0 page errors.** The historical OL-054 acceptance scope was 720/720; new phone device and search-keyboard controls extend the actual state census. Counts are taps across screen states and widths, including repeated controls, rather than unique DOM nodes.

| Run | Taps | With sound | Failures |
|---|---:|---:|---:|
| [tap-census.json](tap-census.json) | 756 | 756 | 0 |
| [tap-supplement.json](tap-supplement.json) | 121 | 121 | 0 |
| [tap-paths-all.json](tap-paths-all.json) | 67 | 67 | 0 |
| [tap-phone-controls.json](tap-phone-controls.json) | 34 | 34 | 0 |

The main shell run walks enabled phone controls, owned/attached Armory states, bedroom/castle menus, combat and every registered minigame. It includes all **29/29** contact keyboard keys (26 letters, Clear, Space and Backspace), the search input, device Lock/Unlock/Home, and Bank's authored next-room/SEE YOUR CASTLE controls. Device locks are inventoried as separate page states so the actual Unlock receiver is exercised. A separate direct phone receipt proves all 29 keyboard keys invoke UI_TAP and update their values, Lock/Unlock/Home change the expected state, and the physically distinct SEE YOUR CASTLE CTA invokes PHONE_APP_OPEN and reaches realEstate. Supplemental paths cover nine moves, thirteen guns, secondary slot, companion moves, Octopus decisions, mail/sleep, rapid taps and minigame results. PLAY returns also carry actual sound-origin receipts: child media promises and parent WebAudio starts are counted after successful playback startup. A once-only parent UI_BACK observes the existing legitimate current-child transport return so reduced motion can close the child immediately without losing feedback; no locked child code, reward/state handling or timing changes. The integrated path audit repeats actual THE PLAY, trap raid, bought-gun and return controls at 360/390/430. Historical BUILD-2 evidence is retained byte-for-byte; current harnesses use configurable --out.

Audio voices/loops: twenty rapid taps honor the accepted UI cap (0/3 active/max at the observation). Post-reset leaked combat loops: **0**. Context running, unlocked true; permitted ambience ["AMB_BEDROOM"]. F01/trap path gate: **PASS**. Raw merged numeric receipts: [tap-summary.json](tap-summary.json).

Reproduce serially with installed Chrome/Playwright: `node tools/build2/tap-census.mjs --out docs/evidence/final_a/stage6`; `node tools/build2/tap-supplement.mjs --out docs/evidence/final_a/stage6`; `node tools/build2/browser-path.mjs --out docs/evidence/final_a/stage6`; `node tools/final_a/phone-tap-controls.mjs`; `node tools/final_a/tap-report.mjs`. No Ube review build is created.
