# Preserved walker observations and production guard

`bounded-walker-repro.json` independently repeats the same original policies/seeds against the same numeric source. Original population rows and error counts remain unchanged.

| Build/policy/seed | Day | Adventure/node | Cash | Available choices | Authored next |
|---|---:|---|---:|---:|---|
| before/trap_committed/9 |9|DATE/where|$3|0|none|
| before/trap_committed/9 |10|TACOS/arrive|$3|0|none|
| before/trap_committed/9 |10|DATE/where|$3|0|none|
| after/trap_committed/5 |14|DATE/where|$5|0|none|

The original headless walker followed an absent next node and recorded `bounded walker at undefined`. The production renderer guard in `js/scenes/adventure.js` offers NOT TONIGHT, abandons the adventure and returns home without counting a completed night. These four observations are limitations of that walker, not unresolved player defects. The separate supplemental walker models the existing production guard. No production repair or numeric/source change was made.

The completed post18 census preserves one additional observation: hoarder/seed1,Day25,A45/soak,cash$81,832. This differs from the empty-choice guard: the declared first-choice policy repeatedly chooses STAY LONGER, while the original loop-exit keyword list omits the visible GET OUT choice. `soak-walker-repro.json` uses an ordinary fresh OPEN entry, reproduces180 first-choice steps at soak, then selects the actual available GET OUT and completes A45. No cash/eligibility fixture is used; the proof isolates the same policy loop rather than replaying the entire Day25 career. The raw census error stays intact and is a harness-only policy limitation.
