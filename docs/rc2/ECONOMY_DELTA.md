# RC2 · BUILD 1 · ECONOMY DELTA (OL-063)

Branch `rc2/economy-001`, base `final-a-accepted` (181d3f5). SR-11 and the F13 economy lock are lifted only for the rows below.
Still locked and untouched: THE PLAY live UI and timing, the OL-022 capture bands, day-job pay.

| # | What | Old | New | Why |
|---|---|---|---|---|
| 1 | F04/F01/F06/F15 flags (`js/if1/flag_defaults.js`) | all dark (F05/F03/F07/F02 still dark) | F01, F04, F06, F15 ON | on the base no PLAY, War Room or club was reachable in a normal save |
| 2 | War Room first offer (`RAEcon.offer.firstDay`) | Days 16–22, rave done, MID rep, a car, 2 COOL homies | Day 2, intro done | first PLAY by Day 2 |
| 3 | Second offer gap | 8 sleeps | 3 | main path |
| 4 | War Room app unlock | on accept only (unreachable) | when the offer lands | the offer could not be answered |
| 5 | Ride for the first PLAY | a car F01 knows (else NO_CAR) | crew HOOPTIE when none owned | no car needed on Day 2 |
| 6 | First two nights' menu | any job | no TAKE THE BLOCK | gentle first PLAYs |
| 7 | NEW OGA M1 window | Days 8–12 | Days 3–24 | Ogas early |
| 8 | Job cash bands ($K, `content.mjs`) | boba 12–30, tupperware 8–14, dentist 18–25, dock 10–18, car wash 22–40, quiet lift 12–28, gala 15–24, smack crib 30–45, counting house 60–110, hold 8–20 | 6–15, 4–7, 9–13, 5–9, 11–20, 6–14, 8–12, 15–23, 30–55, 4–10 | PLAYs from Day 2 triple volume; halved to keep Party Hall in Day 20–30. Capture risk untouched |
| 9 | Rent | weekly, Fridays, collected by hand | paid into cash every wake: Paloma 800, duplex 2,400, bungalow 3,400, courtyard 5,600, laundromat 7,400 per day | rentals fund club nights |
| 10 | Strip club access | after the first world event | open Day 1 (STRIP CLUB app, direct launch); old RAINMAKER tile hidden | open immediately |
| 11 | Club first visit | none | 25% discount, spend capped at 50% of cash on hand, min round $500 | protection |
| 12 | Cheap buys | none | purchase <= $60: 50%/day to push one of 4 existing wants early (Tristan, boba, Reggie, cafe) | tacos pay off |

## Measured (tools/rc2/econ-sim.mjs, 9 personas + follower x 3 seeds x 36 days; data in docs/evidence/rc2/sim/)
- Follower (naive PLAY policy): intro Day 1, first PLAY Day 2, cash Day 7 = $93K/131K/124K (min over run $3.6K–$80K, never $0), Party Hall Day 25–29. Strong-play follower: Day 13–15 (skill upper bound).
- Day-job day: ceiling ~ $320 (90 s shift). Routine floor $4K = 12x; BIG floor $30K = 93x (briefs asked 5x / 15x).
- Rentals (landlord, Shannon financing): rent over 36 days $140–153K vs $34–43K on the old weekly rule. Paloma+duplex+bungalow nets ~$3.5K/day = a $10K night every ~3 days.
- Cheap buys: Day-1 taco payoff 32/60 lives (53%).
- Capture bands: not changed (F01 capture code untouched); sim capture counts 0–6 per 23–70 PLAYs.
- Aggressive/greedy persona goes broke at times (min $0 earlier run), so PLAYs stay risky.

## Owner surfaces touched (granted by OL-063)
`js/if1/flag_defaults.js`, `js/scenes/phone.js`, `js/systems/life_clock.js`, `js/data/phone_hierarchy.js`, `js/loader/manifest.json`/`index.html`, `tools/btf-test.mjs` (rent expectation), if1/f01/f04/f15 test helpers (flags now explicit).

## Final sim table (36 days, 3 seeds, final code; tools/rc2/econ-sim.mjs)
| persona | firstPlay | cash D7 | min cash | final cash | notes |
|---|---|---|---|---|---|
| follower (naive PLAYs, works down RECOMMENDED) | D2 | 93K / 131K / 124K | 80.7K / 11.6K / 3.6K | 187K / 255K / 123K | intro D1; Party Hall D29 / D25 / D27 |
| follower strong play | D2 | 130–153K | 10–20K | 401–622K | Party Hall D13–15 |
| normal / winner / conservative / landlord | D2 | 57–150K | 50K+ | 71K–484K | 4–5 rentals, rent 96–250K total |
| aggressive (greedy) | D2 | 55–130K | 10.8K | 31–137K | wins 1–17 of 23–62 PLAYs: still risky |
| spender ($25K nightly) | D2 | 27–34K | 1.2K–10K | 1.2–34K | club $443–569K |
| hoarder / loser / jobber | D2 / D2 / none | 78–212K | 61K+ | 152K–770K | jobber (day jobs only) nets ~$150/day |

Validation: `npm test` full run, 0 FAIL (docs/evidence/rc2/npm-test.log); loader verify PASS; browser path 24/24 at 390 (docs/evidence/rc2/browser/).
Test edits (flags now ship ON): if1 suites run with RA_FLAGS_DARK=1 (tools/run-tests.mjs), f01/f02/f04/f05/f07/f15 helpers set flags explicitly, btf-test rent expectation updated. Cheap-buy salt is random only in real browsers (headless stays deterministic).
