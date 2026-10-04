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

---
# OL-068 follow-up: all first-release features ON + money retuned down

## Flags shipped ON (js/if1/flag_defaults.js) — 10
F01.showdown_core, F02.iron_and_grace, F02.armory, F02.range_day, F03.new_oga_ladder_close, F04.war_room, F05.trap, F06.rainmaker, F07.m8_and_finale, F15.velvet_rotation.
Not promoted: `F01.showdown` (legacy sandbox flag, superseded by showdown_core), `if1.ledger_persist` (diagnostic ledger mirror).
`RA_FLAGS_DARK=1` keeps the zero-change suites honest: tools/run-tests.mjs runs every suite except tools/tests/rc2 on an unpromoted build; the browser path and rc2 tests run the shipped defaults.

## Retune (supersedes rows 3/8/9 above where they overlap)
| What | Was (OL-063) | Now | Why |
|---|---|---|---|
| Start cash (first wake, Day 1; `RAEcon.start.cash`, rc2-start wake handler) | $100,000 | $40,000 | week-1 cash toward the $10–25K target; monthly budget ($100K, Day 29/57) unchanged |
| PLAY job bands ($K) | halved (6–15, 4–7, 9–13, 5–9, 11–20, 6–14, 8–12, 15–23, 30–55, 4–10) | 70% of F13: 8–21, 6–10, 13–18, 7–13, 15–28, 8–20, 11–17, 21–32, 42–77, 6–14 | with ALL features on the naive follower earns too little for Party Hall at the halved setting; 70% of F13 is the middle. Floors still >= 5x / 15x a day-job day (6K / 42K vs 1.6K / 4.8K) |
| Board slots | 2 with 6+ Ogas | 1 through Day 8 (crew new), then 2 | week 1 cannot out-earn the whole retune |
| Rent per day | Paloma 800, duplex 2,400, bungalow 3,400, courtyard 5,600, laundromat 7,400 | 600 / 1,700 / 2,400 / 3,900 / 5,200 | Paloma+duplex nets ~$1.4K/day (a $2K+ night every ~1.5 days), +bungalow ~$3K/day |
| Desires | club only | VampGPT also recommends the cheapest castle rooms (<= $60K until the Party Hall is built, any after), club nightly in week 1 then every 2 days, keep $15K back | desires keep escalating: club -> rooms -> Party Hall -> bigger rooms |

## New sim (all features ON via the full production load; 36 days x 3 seeds; docs/evidence/rc2/sim/)
| persona | D7 cash | min cash | final cash | Party Hall |
|---|---|---|---|---|
| follower (naive, works down RECOMMENDED) | 34K / 38K / 50K | 7.9K / 15.9K / 15.2K | 66K / 40K / 15K (+ rooms: NW 116–295K) | D29 / D31 / not by D36 (2 of 3) |
| follower strong play | 62K / 25K / 83K | 7K–18K | 18–66K | D21 / D31 / D29 (none before D18) |
| normal | 59–70K | 15–28K | 106–124K | n/a (NW 0.6–1.1M with rentals) |
| aggressive (greedy) | 18–71K | 11–12K | 18–65K | n/a, wins 2–3 of 13–22 PLAYs |
| conservative / hoarder | 51–126K | 20–39K | 127–795K | n/a |
| loser (random) | 14–85K | 10–36K | 250–417K | n/a |
| winner | 55–57K | 15–27K | 71–146K | n/a (5–6 rooms, 4–5 buildings) |
| spender ($ club nightly) | 22–31K | 2.3K–8.9K | 23–98K | n/a (club $619–644K) |
| jobber (day jobs only) | 18K | 10K | 103K | n/a |
| landlord | 26–57K | 10–26K | 80–189K | n/a |

Targets: first PLAY Day 2 (all); never broke (lowest follower cash $7.9K); club night >= $2K every 1–2 days from week 1 (follower 20–21 nights in 36 days; spender 25); PLAYs >= 5x a day job (routine floor 6K = 19x of a $320 shift); capture bands untouched (F01 capture code unchanged; naive follower captured 0–5 of 59–62 PLAYs).
**Misses, stated plainly:** (1) naive-follower Day-7 cash is $34–50K, not $10–25K: week-1 PLAY income (~$40K) outruns even a nightly club + one room, and lowering start cash alone did not move it; getting there needs either lower early payouts or a bigger early sink (e.g. a first car/rental recommended on Day 1). (2) Party Hall lands Day 29/31/none for the naive follower: it clusters on Day 29 because the $100K monthly budget arrives then, i.e. the budget lump, not the PLAY pace, decides it. Strong play is Day 21+.
