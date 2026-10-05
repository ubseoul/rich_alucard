# RC3 · THE STORY SPINE (OL-074 / OL-077 / OL-078)

Source of truth in code: `js/systems/guidance.js` (the steps), `js/data/rc3_cut.js` (the pace table, the apps, the Maps keepers),
`js/systems/rc3_cut.js` (enforcement). Proof: `tools/tests/rc3/*.test.mjs`, `tools/rc3/spine-sim.mjs`, `tools/rc3/cut_path.mjs` (browser, 390).

## The day
Every day: **one story beat → a fight (the PLAY) → cash → a strip club night → sleep.**
VampGPT shows the day as that checklist, with the next story step on top. The home screen's NEXT UP card is the same item;
tapping it does the thing (the PLAY launches directly; the club launches directly; a story beat starts). Phone + one tap = two taps.

## Chapter map (a ~21-day game)
| Chapter | Beat | Earliest day |
|---|---|---|
| 1 PROLOGUE | THE GOLDFISH YEARS → the throne fight (before Day 1) → MISTER DECEMBER'S OFFER (War Room; the first PLAY) | Day 1 |
| 2 OGUN'S RAVE | the invite (the one phone notification) → the rave night | Day 2 |
| 3 NEW OGA | 1 JUG THE PLUG · 2 THE INTERVIEW · 3 CANOPY DUTY · 4 SET UP CARLOS (+ THE ALTERNATIVE) · 5 THE OWAMBE COLLECTION · 6 SENATOR · 7 DINNER AT GBENGA'S | Days 3, 5, 7, 9, (10), 11, 13, 15 |
| 4 FINALE | THE TURF WAR · THE TRIBUTE · VICE PRESIDENT (the Koreatown grant) · THE CALL · NEW OGA (Gbenga) | Days 16, 17, 18, 19, 21 |

Between beats there are breather days: the story says TOMORROW / DAY n, and the day is PLAY, club, Maps if the player wants it.
The Koreatown missions (F03 M9/M10) are chapter-4 beats of the ladder; there is no separate Koreatown line.

## Rules the enforcement keeps
- The ladder cannot end early: the NAH on the JUG THE PLUG pitch, BUY A BOBA AND LEAVE and PAY $20,000 · END are hidden.
- The ladder cannot stall on a car: CANOPY DUTY ends with Gbenga's loaner (one text, one hooptie) if Rich owns none.
- Beats land no earlier than the pace table; one a day at most (each mission already waits for the day after the last).
- Optional adventures (Maps, ten) are never pushed: no notification, no VampGPT line, no morning card, no temptation, no wake trigger.
- Notifications: one at a time, story only (the morning card for today's beat, or Ogun's invite). Everything else is a silent badge.

## Phone: eight apps
VampGPT · Texts (also the VampGram feed) · War Room · Strip Club · Armory · Bank (money, property, cars) · Maps · Rich Radio.

## Friction (OL-078)
- Strip club / next fight / next story beat: phone + NEXT UP = two taps (the morning story card is one).
- SLEEP has no confirm box. No confirm anywhere except dev tools.
- Every adventure line and title is tap-to-skip; a SKIP button jumps to the next choice; a repeat of a finished adventure plays instantly.
- Combat: a tap during a turn collapses the animation waits; waits are 30% shorter by default.
- Fades and day-card waits cut by 50–70%; travel choices auto-pick (a car you own, else a walk; only a flight is still a choice).
