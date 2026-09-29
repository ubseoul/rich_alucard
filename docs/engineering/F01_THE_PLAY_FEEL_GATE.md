# F01 — THE PLAY: browser feel-gate sandbox

Authority: OL-014 + OL-015 + OL-016. Spec/sim baseline: `frag/showdown-core/play-spec-001` @ `3abc08c`. Tuned sim: `F01_THE_PLAY_TUNED_SIM.md`.
**Not FCPB.** This is the first browser build of the PLAY loop, exactly the OL-014 scope: Koreatown only, no grid, no LOS/pathing/cover, no hit-% UI, no HARD, no War Room / district economy / TRAP / final art.

```
PITCH → CAR → SLIDE-IN → BEATS → CALLS → GETAWAY → THE TRUNK → HIT ONE MORE → MORNING AFTER → NEXT PITCH
```

## 1. Run it

```
node tools/serve-play.mjs            # → http://localhost:8123/assets/f01/play/index.html
```

ES modules do not load from `file://`; use any static server that serves `.mjs` as JavaScript (`serve-play.mjs` does, zero dependencies).

| URL parameter | effect |
|---|---|
| `?seed=N` | world seed for a **new** career (default random). Same seed + same taps = same night. |
| `?fresh=1` | wipe the save, tips and telemetry (removed from the URL after boot so reloads keep the save) |
| `?dev=1` | DEV MODE: seed / night / PLAY counter / morning→pitch timings bar, engine log on the report, HOLD THE HOUSE trigger, telemetry copy |
| `?mute=1` · `?calm=1` | sound off · NIGHT MODE (dimmed, motion frozen). Both are also toggles in ☰. |
| `?fast=0.05` | scales every pause (bots only; players use tap-to-hurry) |

Save namespace: `localStorage` keys `ra.f01.play.v1.*` — world, `counter` (**R3: the persistent PLAY counter, F01's own namespace**), `lastCrew`, `prefs`, `tele`. Nothing touches the main game save.

## 2. Exactly what is playable

**Jobs (3 hand-authored + 1 derived rescue)**

| job | shape | take | ugly | who | Ogas | notes |
|---|---|---|---|---|---|---|
| **THE CAR WASH STICK-UP** (SOAP AND SHOTGUNS / SPOT-FREE RINSE) | LOUD stick-up, TAKE THE BLOCK | up to $40K | NASTY | OPEN MOUTH GANG — enforcers with shotguns, all of them chewing | 3–4 | pitchers Tunde / Dre; favours LOUD |
| **THE QUIET LIFT** (NOBODY WAS HOME / A VERY POLITE SAFE) | QUIET lift, COLLECT | up to $28K | TOUGH | OPEN MOUTH GANG — one lookout, one dog, zero patience | 2–3 | pitchers Half-Pint / Dre; favours QUIET; OCTOPUS BRAIN plan: ring the doorbell as the wrong pizza |
| **HOLD THE HOUSE** (THEY'RE COMING TO THE CASTLE / RETALIATION, NO APPOINTMENT / LOCK THE GOOD DOOR) | defense raid | up to $20K | NASTY | HUNTERS + THE GANG | 4 | arrives as a **notice** after a RETALIATION card; no car (seats: DOOR, HALL L, HALL R, INNER), no getaway; AFTERMATH = HELD / BREACHED |
| EXTRACT (GET *name* BACK) | rescue | a friend back | TOUGH | derived from THE QUIET LIFT | 2–3 | OL-016 R1: free — never counts against tonight's job; one job rescues *every* captive from that PLAY |

**Ogas** — 6 named + 3 generics, all turning on:

| Oga | class | | traits | starting gun |
|---|---|---|---|---|
| TUNDE | MUSCLE | human | CALM · ALWAYS EATING | SAPPORO SHOTGUN |
| DRE | TALKER | vampire | MOUTHPIECE · PHONE OUT | LIL OGA |
| HALF-PINT | GHOST | vampire | SMALL · IMPATIENT | PISTOL |
| SUNDAY BEST | SHOOTER | vampire | DRESSED TO KILL · CHURCH SHOES | CHOPSTICK SNIPER |
| YOUNG MAZI | WHEELS | vampire | ROOKIE · BIG POTENTIAL | PISTOL |
| AUNTIE GRIT | DOC | human | SEEN IT ALL · SIT DOWN | AUNTIE'S SLIPPER |
| 3 generics (seeded from Lil Tuesday, Marcus Two-Phones, Cousin Bode, Big Wendell, Pastor Kev, Nephew Chidi, Deshawn From The DMV, Little Rasheed) | random class | 50/50 | one quirk: SKITTISH / SHOWBOAT / LOYAL / STICKY FINGERS / HOTHEAD / STEADY | PISTOL / LIL OGA / MAC & CHEESE |

Rich (the player) appears as PULL UP / PAY calls. Turning: a free seat only (cap 9 = 8 base + 1 Koreatown), ≤ 1 willing generic per PLAY, never a named human, 3-night cooldown.

**Cars** — HOOPTIE (4 seats, "smells like someone's lunch", stalls) · S2000 (2 seats, "twitchy") · SUPRA (4, "all business") · URUS (5, "heavy and proud"). A car that can't seat the crew for the pitched job is greyed out with the reason printed on it. (S2000 is legal on THE QUIET LIFT, disabled on the stick-up.)

**Guns (5 F02 + the pistol)** — LIL OGA (QUIET) · SAPPORO SHOTGUN (BREACHER) · CHOPSTICK SNIPER (SNIPER) · MAC & CHEESE (CHAOS) · **AUNTIE'S SLIPPER** (CHAOS, front) · PISTOL. Guns are *assigned*, not bought: swap from the armory on the CAR screen, and WHO GETS IT? when the trunk drops one.

## 3. Screens and the UX decisions behind them

I own the UX/UI outright. Priorities, in order: clarity, pace, emotional rhythm, readable causality, crew personality, a satisfying trunk, a tempting greed choice, an honest aftermath, one tap back to the pitch. The screenshots are in `docs/engineering/play_feel_gate_shots/` (390 px).

1. **PITCH** — the pitcher's face and voice sell the job (six distinct voices; ≥ 4 variants each, no repeats within 3 PLAYs). The job card is a fixed grammar: THE TAKE ("up to $40K" + the shown loot icon + a `?`), HOW UGLY (dots), WHO, the enemy's tell in italics, crew size. Retaliation arrives as a red pulsing *notice*, and it cannot be laid low. Captive banners sit above the pitches: clock, EXTRACT card, and — on the last night — PAY RANSOM with the exact cost and whether Rich can afford it.
2. **CAR** — the screen where the game is won. Cars are tabs (disabled cars say why). **WHAT'S WAITING** lists each enemy tell with its counter in plain words and a live verdict: `SEATED ✔` / `aboard — wrong seat` / `somebody at home could do it` / `nobody in your crew is built for it` (T5). Seats glow **green with a shield** when a counter sits in them, **amber** when an empty seat is where a still-unmet counter belongs; Ogas who could counter a tell wear a COUNTER badge in the tray. Tap a seat, then an Oga (or just tap an Oga: it takes the seat a tell wants). Approach cards (QUIET / LOUD / OCTOPUS BRAIN) state what they do in one line and mark the job's favourite. Known combos glow gold as they form. Gun chips open the armory. GO always says *why* it is disabled.
3. **SLIDE-IN** — headlights on a night street, the chosen car rolls in, the nerviest Oga barks, known combos flare. ~3 s, tap to skip.
4. **BEATS** — each of ENTRY / CONTACT / TROUBLE / PRIZE shows the situation card with its hazard word, then at most three moment cards (★ clutch, ☺ funny, ▲ scary, ♥ warm) that name the Oga and, when a trait caused it, the trait as a tag. HP pips shake and float a `−2` on the face that took it; NERVE is a bar and the face changes (steady → sweating → wide-eyed → X). PRESSURE is a needle across QUIET / ALERT / ALL HANDS. Empty beats collapse to a ~1.5 s caption. Each beat ends with a SMOOTH / ROUGH / BAD tag.
5. **CALLS** — the world *freezes* (desaturated, blurred): the card, its hazard, and one button per verb, each with **the face of the Oga who would do it**, their trait and what it means; "let them handle it" is always there. Calls are rationed by the strict divergence gate, so a freeze is rare and worth reading. After the beat, a SMART call is named ("SMART — walk in carrying a tray"); a missed angle is revealed only in the post-night replay, so the skill is learnable without being spoon-fed.
6. **GETAWAY** — the driver named, the car in motion, then the verdict: CLEAN / MESSY / CRASH / SPLIT ("the crew scatters", who was left) / JUGGED, with the car-out notice and Rich's pocket cost when they apply.
7. **THE TRUNK** — the reward is a *show*: the lid, a cash counter ticking up, crates dropping in one at a time with a rarity sound and glow (teal RARE, gold LEGENDARY with a flash and a buzz), the NO SCRATCH bonus crate with its own ribbon, then the kicker with a crew line. Tap to hurry.
8. **HIT ONE MORE** — the greed screen never shows a percentage. It shows the three doors as a ladder, what you are RISKING ($ + crates), what is lit ("a GOLD crate and a fat envelope are lit — JACKPOT" on step 2 about one time in seven), the crew's read (FRESH / BANGED UP / RAGGED), a **risk word** (LOW / MID / HIGH, R2), and one Oga's greed line in their own voice. Step 3 is titled THE LEGENDARY DOOR and promises a LEGENDARY crate if it pays. TAKE THE WIN is green and calm; HIT ONE MORE is pink and pulsing. If it turns: a red screen, the siren, everything in the trunk slides away.
9. **REPORT** — the verdict in one line, the crew with a status stamp each, then **WHAT IT COST — AND WHY**: every loss with its cause in plain words and, when it was the player's (seat, choice, car, greed, gun, an earlier beat), one `Try:` line. "HOW IT WENT" replays the whole night beat by beat.
10. **MORNING AFTER** — a VampGram post (brag variant on NO SCRATCH), the crew's texts as chat bubbles with their faces, the nickname / story seed / day-ones pills, WHILE YOU SLEPT (who is hurt or held), the district line, and the **next temptation card**. The dock button is the only thing you need: `NEXT NIGHT →`, and the next board is one tap behind it.

Also: first-run tips (5, once each), the crew book (traits, guns, scars, discovered combos, day ones, armory), NIGHT MODE, sound toggle, **the Ube gate question** (☰ → THE UBE GATE: YES / MAYBE / NO, logged with the PLAY count), new-career reset.

## 4. Telemetry (the timing you asked to be logged)

Everything is appended to `localStorage ra.f01.play.v1.tele` and readable at `window.__raPlay.tele` (`tele.summary()`):

- `M2P_TAP` — **ms from THE MORNING AFTER appearing to the first tap on a PITCH** (the headline number).
- `M2NEXT_NIGHT` — ms from the morning to the `NEXT NIGHT →` tap.
- `PLAY_START` / `PLAY_END` (duration, class, win, PLAY counter), `CAR_GO`, `CALL`, `CLIMB`, `TURN`, `GUN`, `GUN_SWAP`, `RANSOM_PAID`, `LAY_LOW`, `TIP`, `GATE_Q`, `ERROR`.
- ☰ (DEV MODE) → COPY TELEMETRY JSON.

Determinism: every PLAY records its answers; `window.__raPlay.replayCheck()` re-runs the last PLAY headlessly from the log and compares outcomes (the bot gate calls it after every PLAY).

## 5. Bot gate (this build)

Playwright + Chromium drives the real page through whole careers; per width it fails on: any console error / page error / HTTP ≥ 400, horizontal overflow, an unresolved `{token}` / `undefined` / `NaN` / `[object` in any visible text, a stuck screen, or a replay mismatch.

| run | widths | PLAYs each | result |
|---|---|---|---|
| careful bot (calls picked, HIT ONE MORE ~35%) | 360 / 390 / 430 | 15 | **PASS** — 45/45 replays identical, 0 console errors, 0 overflow, 0 token leaks |
| random bot (random cars/calls/greed) | 360 / 390 / 430 / 1280 | 15 | **PASS** — 60/60 replays identical, 0 errors |
| forced HOLD THE HOUSE (via `forceHold()`) | 390 | 4 | **PASS** (castle car, aftermath, report, morning) |
| roster trimmed to 7 (so TURN can fire) | 390 | 45 | **PASS** — TURN prompt reached; 45/45 replays identical |

Screens exercised: splash, tips, pitch (incl. EXTRACT + RANSOM banners), car, scene, call freeze, getaway, trunk, greed, step ok/fail, turn, gun, count, report, morning, menu. Run it yourself:
`node tools/tests/f01/play-sim/bot_gate.mjs --plays 15 --widths 360,390,430 --shots /tmp/shots` (exit 0 = pass). Raw results: `tools/tests/f01/play-sim/out/bot/*.json`.

Pace (unhurried, bot never taps): a full PLAY with a HIT ONE MORE ≈ 65 s from GO to REPORT; a bailed PLAY ≈ 25 s. Tap-to-hurry cuts every wait to ~0.2 s.

## 6. Known issues (honest list)

1. **Art and sound are placeholders by design** — procedural SVG portraits, synth blips, no BX stingers. Sound cues are logged to `window.__raPlaySfx`.
2. **Pace:** ~65 s for a full PLAY is on the long side for "one more PLAY" energy. I trimmed waits 15% already; tap-to-hurry exists. Watch the M2P number and the Ube answer before trimming further.
3. **Reload behaviour:** the save is written between PLAYs. Reloading *during* a PLAY returns to that night's pitch (same seed — same dice, new choices). Reloading on the morning screen skips it (the night is already banked).
4. **TURN cannot fire on a fresh roster** (9/9 = cap). It needs a free seat, i.e. someone lost. Verified by trimming the roster.
5. **Board shapes:** only two normal shapes exist, so "never the same shape twice" is suspended; expect repeats within a few nights.
6. **Content pool (T10):** 3 hand-authored jobs by scope. Open Mouth Gang is ~58% of the sim pool — flagged for F04. Expect the gate to feel repetitive after ~10 nights; that is a content limit, not a systems one.
7. **BAILED** (last-stand bail-out) is a rule I added to hit T2/R1; needs ratification (see `F01_THE_PLAY_TUNED_SIM.md` §3).
8. **T5 margin is thin** (35.8% vs ≥ 35%) and R1's worst random career keeps only 4.
9. **Pre-existing test failure, not from this branch:** `tools/tests/if1/loader.test.mjs › new files land in their slots` fails identically on `3abc08c` (its fixture expects `js/frag/F01/migrations.js` to be a *new* file; F01 already ships one). Every other fragment test passes. Left alone — IF-1 owner surface.
10. Desktop is a centred 480 px column (phone-first). `navigator.vibrate` is a no-op on iOS. Crew book shows story-seed ids in raw form.
11. Not in this build, by ruling: grid, LOS/pathing/cover, hit-% UI, HARD, other districts, War Room, TRAP, final art. **R2** (Vol 7 errata) is the Underlord's document. An Arcade mirror was **not** made (offered below).

## 7. Google QA handoff packet

**Build**: branch `frag/showdown-core/play-sandbox-001` → `assets/f01/play/index.html` (see the SHA in the return message). Serve with `node tools/serve-play.mjs`, open on a phone-sized viewport (360 / 390 / 430) and once at desktop width.

**Please verify** (expected in parentheses):

1. *First run.* Splash → START. Tips appear once each and dismiss; a reload keeps the save; `?fresh=1` restarts. (No console errors at any point.)
2. *Pitch.* Two cards each night, distinct pitchers, no repeated quote inside 3 PLAYs. A job needing more READY Ogas than you have is locked and says so. LAY LOW advances the night; heals WOUNDED; heat cools.
3. *Car.* S2000 is greyed on THE CAR WASH STICK-UP with its reason; enabled on THE QUIET LIFT. Seating a SMALL or MUSCLE in a FRONT seat turns WHAT'S WAITING → "SEATED ✔" and the seat glows green; the wrong seat says "aboard — wrong seat". GO stays disabled with a reason until a driver is seated. The armory swap moves the old gun into the armory. SAME AS LAST TIME restores car/crew/seats/approach.
4. *Beats and calls.* A freeze offers ≤ 3 verbs + "let them handle it", each with an Oga face. Tap-to-hurry skips the current wait. Nothing renders `{...}`, `undefined`, `NaN`.
5. *Getaway.* HOOPTIE splits noticeably more often than SUPRA/URUS over ~10 PLAYs; a CRASH takes the car out for N nights (car tab shows "OUT n NIGHTS").
6. *Trunk / greed.* Crates reveal one by one; LEGENDARY flashes; NO SCRATCH bonus crate has its ribbon. HIT ONE MORE shows RISK words, never a percentage; step 3 is THE LEGENDARY DOOR. A failed step clears the trunk and reports "GREED".
7. *Report / morning.* Every loss lists its cause; player-caused losses add a `Try:` line. Morning always ends in one `NEXT NIGHT →` button and one temptation card. After a capture: banner with the clock; EXTRACT card is offered *in addition to* tonight's two pitches; on the last night PAY RANSOM appears and works (cash drops, the Oga returns WOUNDED).
8. *HOLD THE HOUSE.* ☰ → DEV MODE → "MAKE TONIGHT HOLD THE HOUSE" (or `window.__raPlay.forceHold()`): red notice card, no LAY LOW, four castle seats, no getaway, HELD / BREACHED.
9. *Accessibility / layout.* No horizontal scroll at 360; tap targets ≥ 40 px; ☰ NIGHT MODE freezes motion; `prefers-reduced-motion` honoured; sound toggle mutes.
10. *Determinism.* `window.__raPlay.replayCheck()` → `{ok:true}` after every PLAY.

Send back: any console output, the telemetry JSON (`☰ → COPY TELEMETRY JSON`), and the `M2P_TAP` list.

## 8. Recommendation for the Ube feel gate

**Proceed, after Google QA clears item 3 and 6 — with three things named up front.**

- What is worth Ube's time: the loop closes and the numbers behind it hold (tuned sim, 100% replay determinism, no console errors across 120+ bot PLAYs at four widths). The CAR screen makes a real decision legible; the freeze makes calls feel like a moment rather than a menu; the trunk and the morning give the payoff a rhythm.
- What Ube should *not* judge: art, sound, content variety (3 jobs), the economy beyond cash and HEAT.
- Run it as a 20–25 minute session, ≥ 5 nights, no coaching. Do not explain the CAR screen; the tips do that. Log: the Ube answer to **"Did you immediately want to run another PLAY?"** (☰ → THE UBE GATE after nights 3 and 6), the `M2P_TAP` median, whether they used tap-to-hurry, and whether they took HIT ONE MORE and what they said before/after.
- Suggested pass line: **median M2P ≤ 4 s, "YES" on at least 2 of 3 asks, at least one unprompted story told about an Oga.** Fail signals: M2P > 8 s (the morning is a wall), tap-to-hurry used on > 60% of beats (pace), never touching a tell/counter (CAR screen unreadable), or HIT ONE MORE taken/refused 100% of the time (the ladder isn't tempting).
- Named risks: a full PLAY is ~65 s unhurried; T5 rests mostly on seat choice; two normal job shapes will repeat.
- Next step if it passes: F04 job-pool expansion (T10), art/sound pass, and the Arcade mirror (not built here; say the word).
