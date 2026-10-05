# Stage 1 — Rich's pixel smartphone

Authority: OL-054, amended by OL-055/056/057; BLOOD MIRROR master §2 and Ube's Baseline V1B. North star: **vampire lost gameboy game by a horny mad man**.

The phone now has a stepped physical bezel, speaker/camera, device local-time/signal/battery bar, persistent game date, device lock and swipe-up unlock, Home key and edge swipe, notification banners/badges, hard-pixel icons, and one app system. Contact search has a working pixel keyboard; it filters existing people and authors no dialogue. Device time is display-only; the game still advances exclusively through sleep. Battery is decorative UI and introduces no drain mechanic.

Home is NOW / PEOPLE / MONEY / LIFE. NEXT UP selects an existing pending event, raid, PLAY, unread texts, December offer or available outing. Locks explain the existing prerequisite when tapped. Bank, Maps and Contacts expose existing state. The accepted app behavior, catalogues, prices and story outcomes remain their authority.

| Measurement | Accepted base | Final |
|---|---:|---:|
| Phone screenshots at 360/390/430 | 99 | 117 |
| Horizontal overflow | 0 | 0 |
| Browser errors | 0 | 0 |
| Device swipe / app-lock guidance / keyboard checks | absent | 9/9 pass |
| F01 timers, animation durations, call bars, geometry, gameplay record | reference | 3/3 widths match |

Each app, registered nonhidden surface, VampGPT lane, settings, representative text/profile/DM, Armory bench, War Room jobs/crew/reports and Trap report is indexed in [before/screens.json](before/screens.json) and [after/screens.json](after/screens.json). Screenshot fixture state is deliberately controlled; the fresh Home fixture skips the prologue, and the progressed fixture supplies known contacts/apps for exhaustive UI coverage. These are screen tests, not career or first-playthrough observations.

Representative pairs: [base Home](before/390-fresh-home.png) → [final Home](after/390-fresh-home.png); [base VampGPT](before/390-vampgpt.png) → [final VampGPT](after/390-vampgpt.png); [base property](before/390-realEstate.png) → [final property](after/390-realEstate.png). New device [lock](after/390-device-lock.png), [lock guidance](after/390-app-lock-guidance.png), and [contact keyboard](after/390-contacts-keyboard.png).

F01 changed only the appended color tokens in `assets/f01/play/feel.css`. Its JS/MJS source, geometry, call clock and input flow are unchanged. [Timing comparison](feel-comparison.json) compares scheduled intervals/animation durations, exact call-bar sequence, computed geometry and the complete gameplay record with deterministic inputs. Ambient heartbeat tick counts vary with wall-clock scheduling and are retained in the raw [base](before/feel-trace.json) / [final](after/feel-trace.json) records; they are not timing-engine changes. All comparison gates pass at 360, 390 and 430. The existing full F01 browser gate and release suites are indexed with Stage 6.
