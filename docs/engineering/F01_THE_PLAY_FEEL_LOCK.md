# F01 — THE PLAY · FEEL LOCK IMPLEMENTATION (OL-023)

Authority: **OL-023 RATIFIED** (THE PLAY FEEL LOCK). Base: `frag/showdown-core/play-sandbox-001` @ `8561e09` (F01 OL-022 FALL BACK v1).
Design law: **DANGER IS FELT, NEVER EXPLAINED.** DEEP SIMULATION, SIMPLE SURFACE. The rough feel-first MVP was the reference; this is the real F01 presentation over the real F01 engine and state.
Run it: `node tools/tests/f01/play-sim/serve-play.mjs` → `http://localhost:8123/assets/f01/play/index.html` (`?fresh=1` new career; QA: `?speed=8`, `?oba=1`, `?hold=1`, `?devbig=1`, `?qa=wash`, `?falsealarm=1`, `?reduce=1`, `?moretime=1`).

## 0. Process record
- Fresh post-rewrite clone: local `main` HEAD = `origin/main` = `625f3c6` (OL-019 history-rewrite map + HQ_ONLY/SEALED path guard). The F01 branch predates that guard commit (it branched from `6683f34`), so the guard files are not in its tree; `node tools/guards/hq-path-guard.mjs --tracked` from `main`, run against this branch's tracked paths, **passes (exit 0)**. Nothing was merged; `main` is untouched.
- No SEALED source was opened. No frozen art was modified.
- **OL-022 FALL BACK rerun — PASS.** `fallback.test.mjs` (15 requirement groups, 1,000 PLAYs, FELL BACK on HOLD, invariant violations 0) and the tuned sim before any change reproduced the OL-022 table exactly (T2 5.5 / 20.0 / 6.3, T5 36.3, T13 83.0/67.0/16.0). FALL BACK and BAILED needed no redesign and still pass after the feel lock (§6).

## 1. OPEN hunter canon check
Searched OPEN canon (docs, `js/data/btf`, F01 content; SEALED not inspected). Existing OPEN material: the **HUNTERS faction** as an enemy type (`HUNTER`, silver +2 vs vampires, crossbows under tactical vests — F01 content, BTF `combat.js` `hunter`), two named hunter NPC roles in BTF people (`BLLAD33`, `HILT`, role `hunter`), and the frozen character **DEACON BRASS** (an unrelated blessing-merchandise NPC — the working name DEACON is **not used anywhere**). There is **no existing hunter authority, leader or faction chief**, so there is **no canon collision**: **OBA DE GWINNETT** is the rare hunter identity, a top tier of the existing HUNTERS faction. Placeholder silhouette only (asset ticket FL-A04); no lore or quest line was invented.

## 2. What was preserved (backstage) — untouched in spirit
Seeded sfc32 simulation and deterministic replay (`rng.js`, event log, recorded answers), the beat resolvers and enemy AI, schemas, the outcome adapter (`packets.js`), **BAILED** (`bailEligible`), **FALL BACK** (`fallBackEligible`), the R1 brakes (one EXTRACT per capture group, EXTRACT off the nightly cap, RANSOM, mercy, last-stand bail), the T4 HIT ONE MORE curve, T9 line memory (no repeat within 3 PLAYs, ≥4 variants), the nightly job cap, T10 job specs, the F13 balance targets. `js/frag/F01/*.js` (the old tactical core) is not touched.

## 3. What was retired (visible only — the logic behind stays)
Visible NERVE meter and PRESSURE bar · the seating puzzle (drag-to-seat, glow chips) · moment cards and the 3-card beat grammar · the freeze-frame CALL screen · the report-card screen and the morning-after screen · the pitch-card board and pre-raid explanation panels · every percentage and tactical stat · the tactical board. `assets/f01/play/{play-ui,screens-a,ui-state}.mjs`, `play.css` and the old screenshots were removed; nothing was kept "because it existed".

## 4. The feel-lock presentation (one continuous piece of Rich's life)
`PHONE OFFER → CREW / CAR → DEPARTURE → ARRIVAL → LIVE FEED → ESCAPE or SILENCE → BLACK → RETURN / AFTERMATH` — a 270×480 portrait stage scaled to any window. Files: `assets/f01/play/feel-{core,art,scenes,ui}.mjs`, `feel.css`; pure logic in `js/frag/F01/play/feed.mjs` + `feedlines.mjs`.

| Scene | Question it answers | Source |
|---|---|---|
| **Phone offer** | Do I take the job? | a contact calls: name, `UP TO $`, minimum Ogas, the pitcher's line, and danger as **fiction** ("they got somebody watching the back") — never a percentage. HOLD THE HOUSE is a NOTICE (no decline). Last night's crew text and anything Rich can still recover (a lost car or gun, a last-night ransom) sit on the lock screen first |
| **Crew / car** | Who am I sending, what are they carrying, what are they taking? | ONE screen. Preselected crew ("my usual guys"), face + name + **at most one trait word**, weapon slot per Oga (SHOTGUN / PISTOL / SNIPER / SPRAYER / SLIPPER / **BARE HANDS**, nickname secondary), one swap allowed, the owned car (tap to cycle). Seating and QUIET/LOUD/OCTOPUS are **backstage** (`autoSeat`, `autoApproach`). BIG PLAY: named Ogas carry a skull and SEND is hold-to-confirm ("some may not come back"). Rich does not go |
| **Departure** | I sent my people out. | the SLIDE event: the selected Ogas + guns walk up, name-cards **slam** in seat order, they board the selected car, headlights, engine, it drives off |
| **Arrival** | They actually went in there. | the selected car arrives at the target, the Ogas walk in (HOLD THE HOUSE: headlights sweep the gate, the crew takes the door) |
| **Live feed** | What the hell is happening? | Rich **in bed at home**, hand on the phone, the room behind it, the group chat in front — the ONLY live combat UI. Sparse, uneven, human (typing, interrupted typing, pauses); EVENTS in ALL CAPS, chatter in lowercase; ≤ ~12 bubbles per PLAY outside calls; **never** an HP / NERVE / % number. Ordinary hits: LIGHT shake; downs, cuts, Oba: STRONG shake + red pulse + distant gunshots; REDUCE MOTION removes the movement |
| **Return** | Who came back and what did we get? | fade to black → base. The selected car pulls in (unless it was lost), the **actual survivors** step out (wounded look wounded; the missing are an empty outline), cash **bags scaled to the score** (1 duffel / 2–3 / stacked), Rich **counts** while the total rolls up, then the trunk drops **one item at a time**, each with a small label |
| **Catastrophe** | What did I lose? | nobody returns: black, the base, **Rich alone** — no car, no bags, no sting, no panel |

## 5. Timed calls (a formal pillar)
0–2 per PLAY (3 on a BIG PLAY); **hard max 3 timed prompts** (calls + HIT ONE MORE share one budget). **Two buttons at most**, fiction first ("FEDS CLOSE." / KEEP GOING · GET OUT). A shrinking bar, **no digits**, 7 s (MORE TIME setting: 14 s, off by default). **On timeout the crew decides from its own nerve** — steady crews follow their instinct, a shaky crew does the default, a crew that is losing it pulls back — **never the option the crew's own read says is worst** (`crewDecides`; tested over 160×2 PLAYs). A timeout on an authored call records `RICH_WENT_QUIET`. Story flags come only from authored calls: `MADE_US_STAY`, `PULLED_US_OUT`, `LEFT_SOMEONE`. HIT ONE MORE speaks the same language (a crew line about their condition, a fiction line about what is really in the next room — the truth rule holds — then KEEP GOING / GET OUT); its T4 numbers stay backstage.

## 6. Enemy tells, T5, and what the player can now do about them
Tells surface **before consequence**: as fiction hints on the phone offer and crew screen (`offerHints`) and again as crew chatter in the feed. The player may counter with **SWAP** (a different Oga), **WEAPON** (a gun that answers the tell: shotgun vs ENFORCER charge, MAC & CHEESE vs the flank, sniper vs the LIEUTENANT), **CAR** (URUS shrugs off the charge) or **CALLS**. Seating is automatic and is never a cause (`SEAT` no longer occurs). An uncountered tell is attributed to the lever that WOULD have countered it; a collapse (BAILED / FALL BACK / WASH) carries the **root cause** of the hits that produced it (most common cause among the Ogas who went down; no relabelling).

Tuned in this pass (F13-tunable, all in `engine.mjs`): auto-seat replaces the seat lever; `TELL_K` (uncountered tell strength) `{flank 3, charge 4, silver 4, aim +4}`; strict call gap 3.6 → 3.0 (two-option calls need a lower bar); `BLOCK_CLOSES` step 2 0.05 → 0.10 (auto-seat lifted everyone's step-2 odds; T4 wants step 2 in −10…0 % of the pot).

## 7. Possession loss (persistent)
Cars and carried weapons are lost on **CRASH** (car wrecked → DEALER), **WASH** (car left at the scene → IMPOUND; every carried gun lost), **SPLIT** (the left-behind Ogas' guns → IMPOUND) and **OBA** (each carried gun 65 % dropped). Persisted in `world.garage {owned, lost, unique}` and `world.lostGuns`; a lost gun leaves its Oga with a sidearm. **CREW / CAR shows only cars Rich actually owns; no loaner cars exist** — a garage with no car that seats the crew cannot roll (`canRoll`). Rebuy uses the existing weapon source at `GUN_PRICE`; cars: dealer for wrecked, impound for police/SPLIT/WASH; **canon-unique cars (`garage.unique`) are never relisted**, only recovered through impound. **No global price was invented**: there is no authored car price, so the sandbox recovers a car for the fee the caller supplies (default 0) — SOURCE_REQUIRED for F13/F03. Which cars are canon-unique is likewise SOURCE_REQUIRED (F03): the mechanism is built and tested, `UNIQUE_CARS` is empty.
Oga loss is unchanged and now visible only by absence: generic recruits may die; named Ogas — routine PLAY: CAPTURED → EXTRACT / RANSOM under R1; BIG PLAY: **GONE, never DEAD**; named Ogas are never bought back. **Banked money is safe** (J.5).

## 8. OBA DE GWINNETT (dev state)
Implemented: first encounter guaranteed in **PLAYs 3–6** (seeded, the player is never told), afterwards **≤ 1 in 25** and **never twice within 10 PLAYs** (`world.obaDue`). Eligible on routine offense only (never HOLD THE HOUSE, BIG PLAY or EXTRACT). At TROUBLE the feed cuts mid-event ("OH SHIT IS THAT OBA DE GWINNETT?!"), goes silent, Rich: "hello?" / "hello??", the call, then the crew: "we out. dont ask." The run **collapses: payout $0, forced retreat**, carried guns may be dropped (lost), **no Oga becomes CAPTURED, GONE, SHOT or DEAD** (named or generic), the car comes home, `OBA_DE_GWINNETT_SEEN` is set. A collapse that ends the PLAY before TROUBLE does not consume the encounter. Visual: a placeholder silhouette flashes on the wall (FL-A04); no downstream quest line exists.

## 9. Silence, false alarm, sibling meme, humor
- **Catastrophic silence** (WASH / total capture, Oba): the feed stops MID-EVENT, a beat, Rich "hello?", pause, "hello??", a typing bubble that vanishes, Rich calls, no answer, BLACK. No failure panel. Cannot softlock (browser-tested).
- **False alarm** (rare silence on a run that is going fine): ≤ 1 in 8 PLAYs (min gap 8, never in PLAYs 1–2), only while nobody is down and pressure is not ALL HANDS; silence, "hello?", then "my bad phone died lmao" (locked).
- **Sibling meme** (Ube-authored, locked): exactly once on the first-ever PLAY — "i think… I THINK THERES SOMEONE IN THIS ROOM!" then "shut up" — then a rare callback, ≤ 1 in 15. Once per player, not per save.
- **Humor:** ≤ 1 joke beat per PLAY (the sibling meme is that beat on run 1). Locked crew lines are verbatim and never transformed: "this nigga got a machete oh shit", "these brudahs don't know im a vampire" (a vampire says it), "oh shit they brought garlic". Rich's only feed text is "hello?" / "hello??" (H1 governs his voice).
- **NO SCRATCH** is a crew flex line in the chat, not a panel. Line variety: every feed trigger has ≥ 4 variants; no repeat within 3 PLAYs.

## 10. Accessibility
**MORE TIME** (off by default) doubles the call clock. **REDUCE MOTION** (also follows `prefers-reduced-motion`) removes shake and bounce; the red pulse becomes a static tint. Sound toggle. Settings live behind a discreet ⚙.

## 11. Verification — numbers (`node tools/tests/f01/play-sim/run_tuned.mjs`, deterministic, ≈ 4 min; raw `out/tuned/tuned_summary.json`)

| metric | OL-022 | **OL-023 feel lock** | target | |
|---|---|---|---|---|
| T1 generic death | 10.4 % | **10.0 %** | 10–12 % | ✔ (at the floor) |
| **T2 routine offense** | 5.5 % | **3.9 %** | ≤ 8 % | ✔ |
| **T2 BIG PLAY** | 20.0 % | **18.8 %** | ≤ 20 % | ✔ |
| **T2 HOLD THE HOUSE** | 6.3 % | **7.5 %** | ≤ 8 % | ✔ (thin; n = 80) |
| T2 global (info) | 7.0 % | 5.8 % | — | |
| T3 SPLIT | 5.9 % | **4.8 %** (HOOPTIE 7.8, URUS 4.5, S2000 4.4, SUPRA 2.5) | 4–6 % | ✔ |
| T4 step 1 / 2 / 3 (aggregate EV / pot) | +21.8 / −7.0 / −49.1 % | **+24.9 / −3.5 / −46.1 %** | + / −10…0 / clearly − | ✔ |
| **T5 player-attributable** | 36.3 % | **36.9 %** | ≥ 35 % | ✔ **thin — see below** |
| T13 careful / naive / gap | 83.0 / 67.0 / 16.0 | **80.0 / 67.5 / 12.5** | 70–85 / 55–70 / ≥ 12 | ✔ (gap at the line) |
| strict-call gap | 0.54 | **0.43** (calls off 0.22; 0.39 calls/PLAY) | ≥ 0.4 | ✔ (thin) |
| R1 random mean / ≥ 6 / worst | 8.25 / 100 % / 6 | **8.35 / 95 % / 5** | ≥ 95 % ≥ 6, worst ≥ 4 | ✔ (thin) |
| R1 careful ≥ 6 | 100 % | 100 % (worst 8) | 100 % | ✔ |
| T9 engine lines, repeats within 3 PLAYs | 0 | **0 of 73,074** (all 178 triggers pool > 3× max uses) | 0 | ✔ |
| T9 feed lines | — | **0 of 975 uses** (every feed trigger ≥ 4 variants) | 0 | ✔ |
| BAILED invariants | 0 | **0 violations / 474 BAILED PLAYs** | 0 | ✔ |
| FALL BACK invariants | 0 | **0 violations / 24 FELL BACK PLAYs** (HOLD FELL BACK 11.3 %) | 0 | ✔ |

**T5 re-measure — attributable lever breakdown (of 1,608 losses):** SWAP 220 · WEAPON 130 · CAR 55 · CALLS 144 (HIT ONE MORE / greed 134 + call-choice 10) · TRAIT 45 (crew composition) = 594 → **36.9 %**. Previous seating share (271 SEAT) is gone and was **not restored**. Read honestly: (a) T5 clears the ≥ 35 % gate **by the standing metric definition** (the OL-016 strict set, with SEAT → SWAP), by 1.9 points; (b) counting only the four levers OL-023 names (SWAP + WEAPON + CAR + call-choice) it is 25.8 %, and 34.1 % with HIT ONE MORE counted as CALLS — the metric's TRAIT share is a crew-composition lever the player still owns; (c) call-choice attribution is nearly empty because calls surface only 0.39 per PLAY. Reaching 36.9 % took root-cause tracing of collapses, attributing uncountered tells to the lever that would have countered them, and gun/car/swap attribution of the remaining causes — no cause was relabelled after the fact. **Recommendation to OVERLORD/F13: the margin is thin; strengthen the WEAPON and CAR counters (or raise call frequency) rather than restoring seating.** Not an escalation trigger (T5 ≥ 35 % holds), flagged as watch.

Other honest notes: the auto-seat also lifts the naive policy (careful−naive gap fell from 16.0 to 12.5, at the floor); T4 step 2 needed `BLOCK_CLOSES[1]` 0.05 → 0.10 to stay in band; T1 sits at the 10 % floor; T2 HOLD is 1.7 points above OL-022's 6.3 % (n = 80, directional).

## 12. Tests (all green)
`node tools/run-tests.mjs --fragment f01` → **14 suites incl. `feellock.test.mjs`** (auto-seat ignores the player · owned cars only / no loaner / `canRoll` · one gun per Oga + BARE HANDS · ≤ 2 options, ≤ 3 timed prompts, timeout never picks the worst and cannot softlock (320 PLAYs) · story flags only from authored calls · Oba cadence 3–6 / gap ≥ 10 / ≤ 1 in 25, Oba never removes anyone · loss persistence, rebuy at `GUN_PRICE`, unique cars never relisted · return roster = state, shown loot = awarded loot = inventory delta · feed: ≤ 12 bubbles, EVENT caps / chatter lowercase, no numbers, ≤ 1 joke, sibling meme exactly once + callback ≤ 1/15, silence cuts mid-event and ends black, false alarm ≤ 1/8, Oba feed · locked Ube lines verbatim · T9 feed repeats 0 · deterministic replay incl. timeouts · MORE TIME doubles the clock · recorded T5 ≥ 35 %, T2 bands) plus the unchanged BAILED / FALL BACK / determinism / seams suites.
`node tools/tests/f01/play-sim/feel_gate.mjs` (real Chromium, 35 checks): the whole first run (offer has no %, ≤ 4 preselected Ogas with one trait word, the selected car is the one that departs and returns, Rich in bed / hand on the phone, the sibling meme once, survivors on screen = state, bags + exactly the awarded trunk items), timeout, MORE TIME, REDUCE MOTION, WASH silence, loss persistence across a reload, Oba, HOLD THE HOUSE as a NOTICE, BIG PLAY hold-to-send, layouts 360 / 390 / 430 / desktop, approved-sound-only audio, no console errors.

## 13. Known P2
- All art is placeholder (FL-A01…A10 in `F01_FEEL_LOCK_ASSET_TICKETS.md`): the arrival exterior is the castle for every job, Ogas are face busts, three cars are SVG.
- Car recovery has no authored price and no canon-unique list (SOURCE_REQUIRED, F03/F13); the sandbox recovers for free.
- The first-Oba guarantee is "the first eligible PLAY at or after the seeded 3–6 slot on which the crew reaches TROUBLE": a run that folds/washes earlier keeps the encounter pending (it never lands before PLAY 3).
- T5 / T2 HOLD / T13 gap / strict-call gap / R1 tail each pass with ≤ 2 points of margin; F13 owns the numbers.
- Turning (TURN / LET GO) is an untimed chat choice; the WHO GETS IT? gun prompt is answered in the chat before the return scene (one tap on a face).
- QA hooks (`?qa=wash`, `?oba=1`, `?hold=1`, `?devbig=1`, `?falsealarm=1`) exist for the gate only.
