# F01 — THE PLAY (design spec, revision 2: OL-014 + OL-015 incorporated)

Status: **PLAY SPEC REVISION + 800-PLAY SIM DIGEST — READY FOR OVERLORD REVIEW** · design only, no browser sandbox built · supersedes the F01 tactical interaction model
Base: `frag/showdown-core/001` @ `4d93dc9` · Revision 1: `01291a8` (OL-013) · Sources: Vol 7 (OPEN), Ube canon decisions, **OL-014** (Overlord: PLAY CORE APPROVED WITH MODIFICATIONS, rulings J.1–J.9, modifications M1–M9), **OL-015** (Ube PLAY MANDATE — experience pass; supplements OL-014, weakens nothing), F02/F04 contracts at their branch tips.
Convention: every number below is a **structural default, PROVISIONAL, owner F13**. Nothing here is final economy. Sim evidence: `tools/tests/f01/play-sim/` and `docs/engineering/F01_PLAY_SIM_DIGEST.md`.

**What changed from revision 1:** the pre-play flow is now two screens (PITCH → CAR); odds are words not %; COOL became NERVE; JUGGED means ROBBED; ITEM is gone; GONE (not DEAD) for named Ogas on a BIG PLAY; the roster cap follows territory; every screen has one feeling, one decision, one sound; calls fire only on genuine divergence; the trunk, morning after, combos and pitches are specified; and the 200-seed design was replaced by the exact 800-PLAY prototype sim (§I) whose findings changed several rules below (each marked **[sim]**).

---------------------------------------------------------------------------------------------------------------------------------

## 0. GOVERNING RULES

**Governing rule (OL-015):** every screen has **one feeling, one decision, one sound**. If a stage cannot name its feeling, the stage is cut. (Applied: the separate CREW, LOADOUT, APPROACH and FORMATION screens were cut — their decisions live on the CAR screen; LOADOUT survives only as the *WHO GETS IT?* prompt in the trunk.)

**Replay guardrails ("earned, not manipulative"):** honest odds · truthful teases · banked money never at risk · no timers, login rewards or paid anything · generous floors on success · every loss tagged with a visible cause. Authored nightly cap holds: 1 job per night (2 at 6+ Ogas); "one more" lives in HIT ONE MORE and in sleeping to the next night. The PLAY is one lane of Rich's life, not the whole game.

**Retired and not to be restored** (no sunk-cost protection): grid, LOS, pathing, directional cover, tactical action economy, hit-% UI, overwatch/hunker, tooltip walls, the HARD/difficulty selector. There is no difficulty selector anywhere; approach is a strategy choice.

**Reused from F01 (preserved by Overlord):** seeded sfc32 simulation (`rng.js`), deterministic event/replay log, enemy AI as beat resolvers, trimmed unit/weapon schemas, outcome record/adapters (`packets.js`), crew hooks, slide-in, name-card slam, report card (§H).

---------------------------------------------------------------------------------------------------------------------------------

## A. THE PLAY — the loop

`PITCH → CAR → SLIDE-IN → BEATS (autonomous, contextual CALLS) → GETAWAY → THE TRUNK → TAKE THE WIN | HIT ONE MORE → REPORT / MORNING AFTER → NEXT TEMPTATION`

**PITCH and CAR are the only pre-operation screens.** 60–90 s on a phone, portrait, night palette. The 8 Vol 7 job shapes collapse into PLAY shapes (COLLECT, DROP, RE-UP, PROTECT, TAKE THE BLOCK; EXTRACT is the rescue pitch; RETALIATION/Trap = HOLD THE HOUSE §F; LAY LOW stays a non-play). F04 keeps districts, pressure clock, jobs-per-night, HEAT, SUPPLY, the 3-night EXTRACT clock, stories and the report-card voice; F01 owns *resolution of one PLAY*.

| Stage | Feeling | The one decision | The one sound | Cap |
|---|---|---|---|---|
| **PITCH** | "do I want this smoke?" | pick one of 2–3 pitch cards (or sleep) | a text-message ping + the pitcher's voice | picked in ~5 s without opening MORE |
| **CAR** | "these are MY people / the plan" | who sits where, with what, and QUIET / LOUD / OCTOPUS BRAIN | idle engine, door thumps | one screen, then GO |
| **SLIDE-IN** | "we're really doing this" | none | headlights cut, doors, name slams in seat order, music locks | 3–4 s; skippable only after the 5th PLAY |
| **BEATS** | "I can't look away" | none (watch) | rises: ENTRY quiet → CONTACT sudden → TROUBLE peak → PRIZE release | ≤ 3 moment cards / beat, ≤ 5 s / beat, tap = speed up |
| **CALLS** | "OH SHIT, WHAT DO WE DO?" | one face-plus-verb tap, or "let them handle it" | music drops, world freezes | ≤ 2 per PLAY (3 on BIG PLAY), only on genuine divergence |
| **GETAWAY** | "we're not out yet" | (optional call: FLOOR IT / DUMP THE LOAD) | engine, siren, tire squeal | always one tension beat, even on a clean win |
| **THE TRUNK** | "what did we GET?" | WHO GETS IT? (gun → one face) | commons flip 0.3 s, rare lid-glow + gasp, KICKER last with its own sting | reveal ≤ 8 s |
| **TAKE / HIT ONE MORE** | "I should leave… fuck it" | TAKE THE WIN or HIT ONE MORE | a held breath | stakes line + crew read + one crew line |
| **REPORT / MORNING AFTER** | "the world noticed" | none | VampGram chime, phone buzz | tap through |
| **NEXT TEMPTATION** | "one more" | one tap back to the pitch board | the ping again | exactly one card |

### A.1 PITCH (M1, OL-015 §1)
Jobs **arrive through people**: an Oga texts the pitch in their own voice ("Dre: i know a spot"). Dre oversells, Tunde understates, Young Mazi is clearly lying about how easy it is; **trusting a pitcher is part of the skill.** The card is the whole first screen and has exactly four things:

- **JOB NAME** — specific and funny ("THE BOBA BACKROOM", "AUNTIE'S TUPPERWARE MONEY", "SOMEBODY OWES THE BOBA GUY").
- **THE TAKE** — the advertised cash range as one big number, **one loot silhouette, and a `?`**.
- **HOW UGLY** — a risk *word*: `EASY / TOUGH / NASTY / BIG PLAY`. **No percentages anywhere on the card (J.3).** The authored "95%???" joke becomes **SURE THING???**.
- **WHO** — the enemy face plus one tell ("OPEN MOUTH GANG — enforcers with shotguns, all of them chewing").

District, HEAT and night tags move to the CAR screen and appear **only when they change something** (e.g. FULL MOON). Truth rules: card facts are always true; the pitcher's *spin lives only in the text line*; the silhouette and the `?` are **real crates pre-rolled from the actual pool and guaranteed in the trunk on any PLAY that reaches THE PRIZE and gets home** (a FOLD is the stated exception and the card says so); a clean win pays at least the lower bound and, in the sim, reached ≥ 85% of the advertised range on the large majority of clean wins — so the big number is worded **"UP TO"**, never "you will get".

**Board rules.** 2–3 pitches per night of **different shapes**; the shape of the PLAY just played never appears on the next board; one pitcher per card and no pitcher twice on a board; no spec from last night's board (rules B, §I.9 — the plain OL-015 rules alone let 23% of specs repeat night to night and 137/600 boards double a pitcher). BIG PLAY appears as a red fourth card at most every few nights and replaces the same-shape card. A RETALIATION NOTICE replaces the board.

### A.2 CAR — the car is the formation (M2, OL-015 §2–§4)
One screen: **Rich's car seen from above.** Crew, loadout, approach and formation collapse into it.

- **Seats are roles.** `DRIVER` owns the getaway; `SHOTGUN` (FRONT) goes in first and eats the first shots; the back seats (`MID` ×2, `BACK`) cover. Drag an Oga onto a seat; **a good fit shows as the chip glowing** while dragged over the right seat — no class glyphs, stars, icon rows or numbers. A gun hangs on each seat chip.
- **The car sets crew size and gets a trait in words.** 2 seats: S2000 / Aventador; 4 seats: Supra / S15 / R34; 5 seats: Urus; a 4-seat **HOOPTIE is always available** so no-car lives can play; TRIBUTED cars are excluded. Placeholder car words (SOURCE_REQUIRED, owner F03/F13): HOOPTIE "SMELLS LIKE SOMEONE'S LUNCH" (stalls), S2000 "TWITCHY" (grippy, crash-prone), SUPRA "ALL BUSINESS", URUS "HEAVY AND PROUD" (tough). Every PLAY counts as a drive for M9 and F03's collecting loop. **[sim]** A 2-seat car on a 3–4 Oga job silently shrinks the crew and collapsed the outcome (49% win vs 83–85% for the 4-seat cars; 44% WASH) — so the CAR screen must **disable** a car that cannot seat the pitch's minimum crew and say why, never let it happen silently.
- **Oga chip** (OL-015 §2): face, NERVE pips, **one** trait word, nickname if earned, scars/badges from STORIES; favourites emerge from history (MVP count, best story line, who they've saved). **AUTO** fills seats with the player's *most-used crew* — "my usual guys" — never a hidden optimum.
- **Approach is three big buttons and then GO:** `QUIET` · `LOUD` · `OCTOPUS BRAIN` (only when the job has an authored plan; content is HQ's). Approach sets starting NERVE/PRESSURE, beat-pool weights, loot weights and HEAT. Nothing else is added.
- **Combos that cook (M9)** glow as a named link between seats once discovered (§B.3).
- **[sim]** Seating is not decoration: same careful crew, same jobs/seeds, best seating vs random seating vs worst seating = 85.5% / 77.0% / 73.3% win, clean wins 29.8% / 20.3% / 14.0%, robbed getaways 0.3% / 3.3% / 4.8%. The car itself is a personality generator (HOOPTIE produces a car/split story in ~20% of PLAYs; SUPRA ~7%).

### A.3 SLIDE-IN (OL-015 §5)
3–4 s: headlights cut the dark, the car rolls in, doors open, names slam in seat order, then **one crew line** from the most nervous or most storied Oga, then the music locks. The block establishes with **one environmental tell** (Open Mouth Gang chewing on the stoop). Skippable with a tap only after the player's 5th PLAY.

### A.4 BEATS (M3, OL-015 §6)
Five beats: `ENTRY → CONTACT → TROUBLE → THE PRIZE → GETAWAY`. Beats **escalate** in sound and camera (ENTRY quiet, CONTACT sudden, TROUBLE the peak, PRIZE the release).

- **Watching grammar.** At most **3 moment cards per beat**; each card is **WHO + WHAT + the trait word that caused it** ("Half-Pint vanished — SMALL"). Traits read as personality, never as modifiers. Frozen character sprites on a night stage with barks; slow-mo on clutches and deaths; tap to speed up; **a beat is never longer than 5 seconds**.
- **Causality rule.** Every important swing shows its *because* — a trait word or a visible earlier event ("…because Dre's phone went off"). The player learns what happened without seeing the math.
- **Caption voice** is short, deadpan, in the crew's world — never "Oga A dealt 7". **[sim]** Beats where nothing staged-worthy happens are common; they need a deadpan caption ("Two seconds. Nobody had a story.") or the transcript reads empty (§I.6, finding F-6).
- **Enemies have personality.** The Open Mouth Gang chews through the fight and flanks; ENFORCERS charge the front seat; HUNTERS go straight for vampires (silver +2); the LIEUTENANT lifts his crew; LIL SMACK flees at low HP — "he always comes back". They are the AI *beat resolvers* (F01's `ai.js` tags, targeted by seat lane instead of tile).
- **Resolution (hidden, deterministic, seeded):** per beat, draw a card, resolve an approach check (ENTRY) or 2–3 abstract exchange rounds between the pods and the crew (hidden hit odds from the preserved F01 numbers; honest RNG), then the **trait scan**, then threshold checks (NERVE/PRESSURE zone changes, an Oga at 0 HP → DROPPING with a visible beat, reinforcements). A DROPPING Oga is rescued automatically only by authored traits/classes (SIT DOWN, DOC PATCH UP, DAY ONES partner); otherwise the next call window offers SAVE.
- **Each beat card carries one authored "smart way out" line** (J.6, OCTOPUS BRAIN), e.g. "throw the dog a whole rotisserie chicken". Writing them is content work, not a blocker (J.7).

### A.5 NERVE and PRESSURE (J.4)
The in-PLAY meter is **NERVE** ("he lost his nerve"), **per Oga**, zones `STEADY / SHAKY / LOSING IT`. (Structural defaults: 0–100, named baseline 60, generics 50; STEADY ≥ 55, SHAKY 30–54, LOSING IT < 30.) The HEAT tiers keep `COOL / WARM / HOT / ON FIRE`. **PRESSURE** is crew-wide: how hard the block is closing, zones `QUIET / ALERT / ALL HANDS`. NERVE moves with clean/bad beats, hits taken, allies dropping (a DAY ONES partner hurts more), and recovers at the trunk. LOSING IT causes fumbles, flight (SKITTISH) and a panicking driver. **Auntie Grit's NERVE can never drop below SHAKY** (SEEN IT ALL, J.6). PRESSURE at `ALERT` adds a reinforcement pod at TROUBLE; at `ALL HANDS` the whole reinforcement list, and enemies aim better. **[sim]** Flattening both meters cut reversals (won-from-ALL-HANDS) by 15 points, outcome variance by 9% and memorable families by 9% — they are earning their place.

### A.6 CALLS (M4, OL-015 §7)
The world freezes and the music drops. **Each button is a face plus a verb** ("TUNDE — BUST THROUGH", "DRE — TALK HIM DOWN", "FOLD"). Calls come from the beat card, so they are always contextual; verbs: TALK, SNEAK, BUST, PAY, PUSH, FOLD, SAVE, PULL UP. **Every call has a "let them handle it" default.** Rich's **PULL UP** (from beat 3, once; +15 HEAT hook + VampGram post as authored) offers his moves as buttons — `BLOOD BATH / BITE / OCTOPUS BRAIN / REVENGE`, **max 3, contextual**. No timers.

**A call fires only when the options genuinely diverge.** The resolver forks the beat into six futures on **common random numbers** for every button plus the default; a call surfaces only if the best and worst button differ by an expected swing ≥ ~1.2 beat-tiers **and** the paired difference is not dice noise (t ≥ 2). Otherwise there is no call. Budget: 2 per PLAY, 3 on a BIG PLAY, none in HIT ONE MORE steps. **[sim]** At this rule 1.23 calls surface per PLAY (82% of PLAYs see ≥ 1); at a stricter gap (0.54/PLAY) every measured effect is unchanged — so the stricter setting is free and should be the shipping default. The OL-015 test result is honest and awkward: **CALLS OFF does not drop the memorable rate** (story-beat share −0.5 pt, within noise; rare-wow PLAYs −3.2 pt) but removes ~87% of the skill gap between a careful and a naive player (0.58 → 0.08). Calls are the *agency* mechanic, not the story mechanic; the sim cannot measure the felt "freeze", which is a feel-gate question (§K).

### A.7 GETAWAY (M5, OL-015 §8)
"Ube's chaos zone." **Driver NERVE + the car's trait + how much is in the trunk** decide it. Outcomes: `CLEAN` (still gets one tension beat: headlights behind them, a siren that turns out to be nothing, a tire squeal) · `MESSY` (scored as a **WIN with a story**, never a partial failure) · `CRASH` (car out N nights or a repair cost; crew WOUNDED) · `SPLIT` (the driver panics and leaves half the crew — left-behinds are CAPTURED, or walk home for comedy: "Half-Pint took the bus") · **Officer Nodd chase** (he waves, he gives up, he gets hungry) · `ROBBED` (J.5, §C). Optional call: FLOOR IT (+grip, +crash chance) / DUMP THE LOAD (drop a crate). **[sim]** Crash 6.3%, SPLIT 1.8%, ROBBED 5.8% — SPLIT is the funniest outcome and appears once in ~55 PLAYs; widen its trigger (SKITTISH/ROOKIE/BIG POTENTIAL drivers at SHAKY, HOOPTIE stall under ALL HANDS) in the feel gate rather than tuning it down.

### A.8 THE TRUNK (M6, OL-015 §9), TAKE / HIT ONE MORE, REPORT, MORNING AFTER — §D, §E, §J.

---------------------------------------------------------------------------------------------------------------------------------

## B. TRAITS — every trait has an upside and a failure mode (OL-015 §2)

**Model.** `WHEN (event + state) → EFFECT (hidden) → MOMENT (one staged line, ends with the trait word) → TAG`. There are **no dead picks**: a HOTHEAD in the SHOTGUN seat is a coin flip between legend and disaster *by design*. Tags: `CLUTCH · STUPID · FUNNY · SCARY · WARM · TURN`. A trait line is staged **once per PLAY** (repeats apply silently) **[sim]** — otherwise the same "Tunde did not blink — CALM" fills three beats.

### B.1 Named traits and generic quirks (both halves, as simmed)

| Trait | Upside | Failure mode |
|---|---|---|
| CALM (Tunde) | absorbs one NERVE hit under pressure; +aim at ALERT | lets the first shot land when ambushed |
| ALWAYS EATING (Tunde) | heals 1 between beats | finishes the sandwich first — skips a shot |
| MOUTHPIECE (Dre) | TALK +15; haggles the take up | oversells; the client wants a discount / PRESSURE up |
| PHONE OUT (Dre) | photos of the pod: no ambush | the phone goes off in a QUIET entry |
| SMALL (Half-Pint) | harder to hit; fits the gap | can't lift the safe — trunk one crate lighter |
| IMPATIENT (Half-Pint) | first through the door | jumps early and blows the QUIET entry |
| DRESSED TO KILL (Sunday Best) | +1 damage while unhurt | first hit ruins the suit — NERVE drops |
| CHURCH SHOES (Sunday Best) | climbs fire escapes/roofs like Sunday | slips on wet ramps and dirty alleys |
| ROOKIE (Young Mazi) | first kill = first real one (+NERVE, STORY seed) | −aim until the first STORY; freezes at TROUBLE |
| BIG POTENTIAL (Young Mazi) | STORY perks doubled (campaign) | shows off at the wheel — crash chance |
| SEEN IT ALL (Auntie Grit) | NERVE floor SHAKY; lectures a chewer into leaving | stops mid-fight to give the lecture |
| SIT DOWN (Auntie Grit) | a dropping ally beside her is stabilised free | sits the wrong person down mid-fight |
| Generic: SKITTISH | hears it first (entry +) | leaves when hit / at LOSING IT |
| Generic: SHOWBOAT | "watch this" — big hit | everyone watches it miss; draws fire |
| Generic: LOYAL | goes back for anyone | jumps out of the car to go back |
| Generic: STICKY FINGERS | +1 crate | is seen: PRESSURE up |
| Generic: HOTHEAD | goes first, hits hard | breaks formation |
| Generic: STEADY | halves NERVE damage ("mm.") | doesn't mention the guy on the roof |

Vampire THIRST (a bleeder in the room, no Blood X on hand: resist = CLUTCH, slip = STUPID) and the generic-quirk names remain **design placeholders needing HQ authoring** (J.7); Blood X in the bag **only feeds THIRST — ITEM is removed from the PLAY (J.6)**. Authored numbers kept from Vol 7: CALM +10, MOUTHPIECE +15, SMALL −10, DRESSED +1, ROOKIE −10, story +5, silver +2, bond +10, class ability numbers. **[sim]** With the trait layer removed, memorable families per 20 PLAYs fall 37.9 → 24.5 (−35%) and novelty −14% — the strongest single contributor.

**[sim] Thin traits — must be widened before the feel gate** (share of PLAYs with the trait aboard in which upside/failure surfaced): CHURCH SHOES 7.6% / 2.7%, LOYAL 0% / 1.8%, IMPATIENT failure 3.5% (QUIET-only), CALM failure 5.3%, SEEN IT ALL 9% / 8%, MOUTHPIECE 22% / 8% (was 6% / 0% before it was allowed to haggle at the prize). BIG POTENTIAL's upside is silent inside a PLAY (it pays in the morning-after). Rule: a trait must be able to surface on *any* job shape, not only on a particular card tag or approach.

### B.2 Enemy personalities, the boss and the pull-up — as A.4. Class abilities (SHOULDER CHECK, DEAD EYE, THE CAR, TALK HIM DOWN, VANISH, PATCH UP) are **once-per-PLAY auto-moments** with their authored numbers.

### B.3 COMBOS THAT COOK (M9)
Hidden named synergies (bond pairs, weapon+seat, trait+trait, and two *negative* ones) **reveal the first time they fire** — a "NEW IN THE CREW BOOK" card — after which the CAR screen shows the named link between the seats and the **CREW BOOK** keeps the list (the replay-discovery loop). Simmed set: DAY ONES (adjacent partners, +aim), DOOR'S A SUGGESTION (SAPPORO in the SHOTGUN seat, on a door/dock card), SUNDAY SERVICE (CHOPSTICK sniper in the back), THE SLIPPER (AUNTIE'S SLIPPER up front — the target forgets his shot), THE LEASH (Tunde beside Half-Pint), SIT DOWN, BABY (Auntie beside Young Mazi), SNACK BREAK (Tunde beside Auntie), and the negatives HANDS FREE (Dre driving) and COIN FLIP (a HOTHEAD in the SHOTGUN seat). **[sim]** Removing combos costs 10% of memorable families and 5% novelty: KEEP, but **DOOR'S A SUGGESTION fired in ~1 of 8 PLAYs**; a signature combo that fires that often stops being a discovery — ration each combo to ≤ 1 PLAY in 15.

---------------------------------------------------------------------------------------------------------------------------------

## C. LOSS / CONSEQUENCE TABLE (J.1, J.5)

Principle: **loss costs time and the unbanked pot, not hours of progress.** Mercy invariant: one failed *routine* PLAY puts at most **2** Ogas away (SHOT/CAPTURED); extra losses downgrade to WOUNDED. **Every loss carries a visible cause** on the report card (§J.2).

| State | Who | Cause | Effect | Recovery |
|---|---|---|---|---|
| **WOUNDED** | any | hurt below half / carried / crash | unavailable this night | 1 night, or DOC |
| **SHOT** | **named** | reaches 0 HP and is carried home | away, a scar line; **cannot die** | 2–3 nights |
| **CAPTURED** | any not dead | left behind (SPLIT, WASH) | opens an **EXTRACT** job with the authored **3-night clock** | win EXTRACT; expiry ⇒ GONE (the player's fault, as authored) |
| **JUGGED = ROBBED** (J.5) | the crew's pot | a failed getaway, or a HIT ONE MORE auto-cash whose way back is watched | the **unbanked pot is lost plus a small share of Rich's pocket cash**; never permanent; **banked money is always safe**; nobody is arrested | none needed |
| **DEAD** | **generic Ogas only** | sudden: a hit at 0 HP with no rescue, or bleeding out | removed, seat frees for a recruit; the line is dark-comic, never gory: "Lil Tuesday caught one. He's gone." | — |
| **GONE** | named | (a) an expired EXTRACT, (b) a **BIG PLAY** the player knowingly accepted (§G) | removed for Before the Fame; black ribbon; Day One mourns | the truth waits for after fame |

- **J.1 — a named Oga on a BIG PLAY becomes GONE, never confirmed DEAD.** This keeps Vol 7's guard ("no one close to Rich is ever confirmed dead before fame"), the HQ material that depends on it, and GONE's sound, ribbon and mystery. Generics can DIE (Ube's rule). The switch `bigPlayNamedOutcome` exists **locked to `GONE`**; only Ube can flip it, via a canon packet.
- **"Held by the law" is REMOVED.** CAPTURED covers being taken. JUGGED is canon and means ROBBED (Ube's word: "jug" is rob, as in "jug the plug").
- **Engine invariant (tested over all 800 + a 3,000-PLAY smoke):** `named ∈ {DEAD}` never; `named = GONE ⇒ BIG PLAY ∧ accepted`; SHOT+CAPTURED ≤ 2 on any routine PLAY; a jugged/wash PLAY banks 0.
- IF-1 mapping: WOUNDED/SHOT = DOWNED + timer; CAPTURED and GONE exist; **JUGGED and DEAD need `RACrew.registerStatus`** (F04/owner).
- **[sim]** Named SHOT 0.35 per PLAY (24% of PLAYs have one), generic DEAD in 24.9% of PLAYs with generics aboard, named CAPTURED in 18.0% (almost all from WASH). That is steep for a one-job-a-night pacing — see §I.8.

---------------------------------------------------------------------------------------------------------------------------------

## D. THE TRUNK, LOOT AND TURNING (M6, OL-015 §3, §9)

### D.1 The reveal
After the getaway the trunk opens; **commons flip in 0.3 s each; rares get a 1 s lid glow and a crew gasp; the KICKER is always last, has its own sound, and draws one crew reaction line** in that Oga's voice (Tunde "[stops chewing]", Sunday Best "The Lord provides. Openly."). Bands snap like COUNT THE MONEY.
- **Truth rule.** Every tease (gold crate, silhouette, `?`) reflects the real pool — **no fake near-misses.** Honest odds, generous floors. **[sim]** 0 fake teases in 488 played PLAYs + 254 teased HIT ONE MORE steps; the floor held on every win.
- **Generosity.** A successful PLAY always pays at least the job's authored band lower bound; the KICKER is floored by tier (EASY common; TOUGH sometimes rare; NASTY rare; BIG PLAY rare with a legendary chance) — **no empty trunks on a win**. **[sim]** The kicker is a *thing*, never "a wad of cash" or "a corner of the block changes hands": cash, DISTRICT, STORY and RECRUIT crates cannot be the kicker.
- **Variety.** The WEIRD pool is ≥ 40 authored items that rotate so repeats stay rare (42 drafted); RARE and LEGENDARY items each carry a name and one line of lore (8 legendaries drafted). Authoring is under H1, Underlord-reviewed, with an optional Ube seed of 10 WEIRD finds and 5 quirks "in his own words — weird specificity beats generic".
- **Crates:** 3 base + clean getaway + tier + STICKY FINGERS − SMALL's weight, capped at 5 (+ HIT ONE MORE steps). Rarity `COMMON / RARE / LEGENDARY` plus `WEIRD` (F02's vocabulary); bad-luck protection for RARE+ is F13's.

### D.2 WHO GETS IT? (loadout as an act)
When a gun drops, the next prompt is **WHO GETS IT?** — tap one face and you're done; acquiring a gun *is* assigning it. Guns speak in role words (`BREACHER / TWO-TAP / SNIPER / CHAOS / QUIET / SIDEARM`) plus one flavour line; an Oga who earns STORIES with the same gun gets a joint nickname ("SUNDAY BEST & THE DEACON"). Gun pool = F02 catalog guns with no sealed acquisition; excluded: LEGENDARY DRACO, BLUEBERRY BLASTER, GOLDEN DRACO; TOMMY TONY / JOLLOF BURNER only after their F02 gate. **F02 owns unresolved gun behaviour; the PLAY consumes whatever F02 resolves (J.6).**

### D.3 VAMPIRE TURNING (J.8: mechanic approved, bounds provisional)
Rich never turns anyone. A `RECRUIT` crate offers one **willing** generic person; only a **conscious vampire Oga in the crew** may offer `TURN` or `LET GO`. Bounds (provisional): ≤ 1 candidate per PLAY, cooldown 3 nights, needs a free roster seat (§J.3), **never named humans** (TUNDE, AUNTIE GRIT), never automatic. Seeded outcomes: *it takes* (new generic Oga, "TURNED BY <name>" seed) · *it takes weird* (funny quirk) · *they bail* (no penalty). **[sim]** A recruit crate appears in 11.4% of PLAYs and a conscious vampire is aboard to offer it in 10.5% (2.1 per 20 PLAYs, ≈ one offer per 10 PLAYs). Of 84 offers, 82% were taken: it takes 61%, it takes weird 21%, they bail 10%, LET GO 8%. In the 24-night campaigns the offer rate is not the binding limit — the roster cap is: of 56 accepted turns in one arm, 25 (45%) landed on a full roster and could not be seated (§I.7). Overlord sets the bounds from this frequency.

---------------------------------------------------------------------------------------------------------------------------------

## E. HIT ONE MORE (M7, OL-015 §10)

**Offered** after any successful getaway, before banking, unless the crew is `TOO HOT` (someone CAPTURED, or two dropping, or half the crew LOSING IT): "TOO HOT — GET OUT." **The prompt is three things:** (1) one line of stakes in plain words — `RISKING: $38K + 2 crates`; (2) the crew read `FRESH / BANGED UP / RAGGED`; (3) **one crew line voicing the temptation or the warning** ("Dre: we good… right?", "Auntie Grit: Get in the car."). A gold- or teal-lit crate is shown **only if it is really in the next step** (the truth rule); the step's kicker is pre-rolled so the reveal cannot differ from the tease.

**A step** is a short second run on the same block (TROUBLE + PRIZE, no re-pick), PRESSURE +15, NERVE carries (−5, BIG POTENTIAL −6), wounds carry, opposition escalates, then a mini-getaway. **THE BLOCK CLOSES:** an extra escalating chance (6% / 22% / 38%) that the way back is watched. **Failure = the whole PLAY's unbanked pot is lost** (J.5 ROBBED, plus a small share of Rich's pocket) **and is always tagged `GREED` on the report card**, with the exact moment it turned replayed ("It turned at HIT ONE MORE #2: Dre went down and the room closed"). The game never hides that it was the player's call. Hard cap 3 steps; **banked money is never at risk**; a forced auto-cash whose way back is watched is a J.5 ROBBED too.

**[sim] EV by step** (4 replicate futures for every offered PLAY, value in $K-equivalent; honest read taken *before* the step):

| | reached | P(success) | pot at stake | EV of going |
|---|---|---|---|---|
| step 1 | 2,080 | 72.0% | 68.2 | **+11.2** |
| step 2 | 1,414 | 44.1% | 108.8 | **−35.5** |
| step 3 | 577 | 23.7% | 163.0 | **−102.2** |

By read: FRESH step 1 = 81.9% / **+20.1**, BANGED UP = 61.8% / +2.6, RAGGED = 35.0% / −33.2; step 2 is negative for every read (FRESH −9.7). This is the shape the spec asks for (peak at step 1 for a healthy crew, negative from step 2); the three knobs are the step opposition size, the fatigue term and the BLOCK CLOSES curve — **F13 owns the values.** Policy behaviour: careful goes only when FRESH with a lit crate (24% of offers; 88% of goes win); greedy always goes and loses the pot on 64% of its PLAYs (126 lost pots, 179 won steps, jackpots on 22% of won steps); naive never goes. The read is honest and predictive — that keeps the game fair, and it means the *emotional* work of the temptation is done by the crew line and the lit crate, which is a feel-gate question.

---------------------------------------------------------------------------------------------------------------------------------

## F. HOLD THE HOUSE

Same engine, mirrored direction. Trigger: a scheduled **retaliation** (HEAT ≥ 60 / a flipped district) or a Trap defence. The offer is a **NOTICE** ("RAID INCOMING"), not a choice. The CAR screen shows the castle instead of the car: seats are `DOOR / HALL / INNER`; **STANCE** replaces approach (`HOLD THE DOOR` / `LET THEM IN`). Beats = the castle's own halls; the prize is the stash; **no getaway — the AFTERMATH card takes its place.** Results: **HELD** / **BREACHED** (authored: STASH RAIDED — half the SUPPLY and a fifth of the cash, worded, no %) / **OVERRUN** (breached + a WASH). Loot = captured weapons; a HIT ONE MORE step is the COUNTERATTACK. Rich may PULL UP from beat 3. BIG PLAY is not offered on defence. **[sim]** careful/naive win 80% / 65%; BREACHED shows up as a COSTLY win and is a clean, readable failure state.

## G. BIG PLAY

The only context where a named Oga can be lost — and the loss is **GONE, never DEAD (J.1)**. A red `BIG PLAY` plate; risk word `BIG PLAY`. A mandatory **STAKES screen**: `WHAT YOU GET` (floor + exclusive table) · `WHAT YOU RISK` · `WHO MAY NOT COME BACK`; every generic carries the skull; **every named Oga picked gets a filled red skull and `MAY NOT COME BACK`**, and each must be ticked individually ("I accept for TUNDE") with a hold-to-confirm. Unticked named Ogas are simply not on the crew. Named Ogas in danger go `DROPPING` with a visible beat and a SAVE call before any loss resolves — never a silent roll. **[sim]** BIG PLAY = 80 of the 800 PLAYs (COUNTING HOUSE): careful 75% win / naive 70%; 11 named GONE, all on ticked names, none outside BIG PLAY, 0 named DEAD (invariant holds across the 800 and a 3,000-PLAY smoke). Roster impact is in §J.3.

---------------------------------------------------------------------------------------------------------------------------------

## H. F01 — KEEP / MODIFY / DISCARD

| | Item | Why |
|---|---|---|
| **KEEP** | `rng.js` (sfc32), the determinism pattern (immutable `apply`, event stream, state hash, `replay`, serialize), replay log | the seeded, honest spine — the sim uses it unchanged |
| **KEEP** | authored data in `data.js` (classes, enemies, weapons, Rich, traits, stories, bond, PROVISIONAL/SOURCE_REQUIRED) with trimmed schemas | hidden inputs |
| **KEEP** | `packets.js`, `showdown.js` facade, IF-1 registration (`F01.showdown_core` dark), namespace-only migration, audio hooks | crew hooks and adapters |
| **KEEP** | sprites (portraits, name cards), `sfx.js` placeholders, the mirror/deploy pattern, bots/invariants/vm harness | cheap wins |
| **MODIFY** | `engine.js` → `play.js` (same create/apply/events/hash contract; state machine = beats + call windows + trunk + climb); `ai.js` → beat resolvers; `rules.js` → hidden odds only; `maps.js` → job/beat-card templates; `ui.js`/CSS → night stage, car screen, trunk, report | |
| **DISCARD** | grid, LOS, pathing, directional cover, height, fog, movement, action buttons, hit-chance sheet, cover badges, overwatch/hunker, 2-action economy, tooltips, the HARD toggle, the three ASCII maps and four F01 sandbox missions | retired |

---------------------------------------------------------------------------------------------------------------------------------

## I. THE PROTOTYPE SIM — what was run, and what it found

**Protocol (exact, OL-014).** `tools/tests/f01/play-sim/` (fragment-owned; node ESM; reuses the preserved `rng.js` + `data.js` only — no grid, LOS, pathing, cover or hit-% UI exists in it). **10 job specs × 20 seeds × 4 policies (careful / greedy / naive / random) = 800 PLAYs**; roster 6 named + 3 generics; cars HOOPTIE / SUPRA / URUS / S2000; M2 seating, M5 getaways, J.5 JUGGED (=ROBBED); seed = `jobIndex×1000 + k` (k = 1..20), identical across the four policies (paired). Outputs: `out/summary.json`, `out/plays.csv`, `out/digest.txt`, `out/transcripts.txt`; the prose digest is `docs/engineering/F01_PLAY_SIM_DIGEST.md`. Ablations and the car/seat experiments use 40 seeds/job (1,600 PLAYs each); BEEF and the pitch audit use 80 careers × 24 nights per arm. Determinism: 0 mismatches in 40 full re-runs; invariants: 0 violations in the 800 and in a 3,000-PLAY smoke (named never DEAD; GONE only on accepted BIG PLAY names; mercy ≤ 2; a jugged/wash PLAY banks 0; no `%`, `ITEM`, "arrest" or difficulty wording in player-facing text; tease = reveal; a failed PLAY always leaves a report line and a morning-after story).

**Policies see only what a player sees** (faces, words, the crew read, the lit crate) — never hidden odds. Careful reads the card's smart way out and matches faces to verbs; greedy pushes and always climbs; naive taps the defaults; random is random.

### I.1 Headline (800 PLAYs)
| Metric (OL-014) | Result | Target |
|---|---|---|
| "Nothing happened" PLAYs | **4.1%** strict (no story beat, no hard loss, no turning call) · 0.1% lenient | ≤ 10% ✓ |
| Blame clarity (every loss has a visible cause) | **97.2%** of 1,749 losses (98.8% excluding plain WOUNDED); 92.2% of PLAYs with losses have all losses traceable; only **18.5%** are player-attributable (trait/choice/greed/car/weapon/seat/relationship) — the rest are *situational* (earlier event 33%, enemy tell 34%, card hazard 13%) | ≥ 90% ✓ |
| Funny-or-dramatic share of losses | **66.0%** (funny 13.0%, dramatic 53.0%) | ≥ 40% ✓ |
| Unique memorable-event families per 20 PLAYs | mean **37.9** (min 21, max 53); 82 families in 800 PLAYs; biggest family in 28% of PLAYs | — |
| Generic death (PLAYs with generics aboard) | **24.9%** lose ≥ 1 generic (0.29/PLAY; careful 16%, greedy 26%, random 31%) | — |
| Named SHOT | **0.35 per PLAY**; 23.9% of PLAYs have one | — |
| Crash / SPLIT / ROBBED-on-the-way-back | **6.3% / 1.8% / 5.8%** | — |
| Turning offers | 10.5% of PLAYs (2.1 per 20); 82% accepted | — |
| Visible-cause coverage of important swings | **91.0%** of 8,602 swings (10.8 per PLAY); 9.0% unexplained luck | OL-015 |
| Calls | 3,678 beats evaluated; 1,064 (28.9%) diverged meaningfully; 981 surfaced (1.23/PLAY); 2,614 suppressed for no divergence, 83 for budget | rare |

Careful outcome spread: clean 33.5%, messy-win 29.5% (**clear win 63.0%**, inside the asked 50–75%), costly win 22.0%, WASH 11.5%, greed-lost 3.0%; naive wins 70.0% (a lot of it costly), random 56.0%, greedy 14.5% (64% of greedy PLAYs lose the pot to HIT ONE MORE).

### I.2 Ablations (1,600 PLAYs each; SE of a story-beat delta ≈ 0.8 pt)
| Variant | story-beat | rare-wow | novelty | families/20 | outcome SD | careful−naive | reversals | Verdict |
|---|---|---|---|---|---|---|---|---|
| baseline | 94.9% | 50.1% | 24.8 | 37.9 | 1.04 | 0.58 | 23.1% | — |
| traits OFF | 91.8% | 43.1% | 21.3 | **24.5** | 1.01 | 0.61 | 24.4% | **KEEP** (−35% families, −14% novelty) |
| NERVE/PRESSURE flattened | 92.5% | 53.3% | 23.9 | 34.4 | 0.95 | 0.75 | **7.7%** | **KEEP** (reversals −15 pt, variance −9%) |
| formation randomized | 95.4% | 52.3% | 24.8 | 38.8 | 1.04 | 0.48 | 27.8% | **KEEP** — see I.4: the all-policy ablation hid it; the controlled test does not |
| CALLS OFF | 94.4% | 46.9% | 24.2 | 35.0 | 1.10 | **0.08** | 27.6% | **KEEP for agency, not for story** (skill gap −0.50) |
| CALLS rarer (gap 3.6) | 94.8% | 51.6% | 24.8 | 37.9 | 1.06 | 0.55 | 21.6% | **the extra calls are a CUT** — nothing measured changed at 0.54 calls/PLAY |
| CAR OFF (default seats) | 95.4% | 49.4% | 24.4 | 36.6 | 1.07 | 0.35 | 27.1% | **KEEP** (skill gap −0.24) |
| combos (M9) OFF | 92.1% | 48.8% | 23.5 | 34.1 | 1.04 | 0.67 | 23.7% | **KEEP** (−10% families) |

No mechanic among the five required ablations was a pure CUT on the removal test; but the OL-015 calls test came back the awkward way (I.5), and BEEF fails outright (I.7).

### I.3 CAR verdict — KEEP, with three conditions
Controlled test (careful policy, same jobs/seeds; only the named factor changes): **car** HOOPTIE 82.8% win / SUPRA 85.3% / URUS 82.3% / **S2000 49.0% (WASH 44%)** · **seats** best 85.5% (clean 29.8%, robbed 0.3%) / random 77.0% / worst 73.3% (clean 14.0%, robbed 4.8%). The seat is a real decision (+0.33 score best-vs-random), the car is a personality generator (HOOPTIE: 20.5% of PLAYs produce a car/split story, SUPRA 7%, URUS 6%), and the HOOPTIE fallback costs almost nothing in outcome while being the funniest car. **Conditions:** (1) disable a car that cannot seat the pitch's minimum crew (the S2000 trap); (2) keep the seat-fit signal visible only as the glow — the sim shows the effect is large enough that guessing costs ~8 win-points, so the glow is essential, not decorative; (3) ration signature combos (B.3).

### I.4 Traits, formation, NERVE — see B, A.5. The all-policy "formation randomized" ablation looked like noise because three of four policies already seat badly; only the controlled seat test (best vs random vs worst) shows the effect.

### I.5 Calls — what the divergence check did
The fork-with-common-random-numbers resolver (6 futures, gap ≥ 2.4 score, t ≥ 2) suppressed 71% of possible calls. The 1.23 that survive are real: careful calls move a beat by +1.70 score on identical dice vs the default, random +1.61, greedy +0.43 (greedy always picks PUSH/BUST — it uses the button but not the face). But by every measure of *story* the calls are optional: CALLS OFF loses 0.5 pt of story-beat share, 2.4% novelty and 3.2 pt of rare-wow PLAYs, and the "rarer" arm is indistinguishable from baseline. Per the OL-015 rule ("if it doesn't drop the memorable rate, calls get rarer") the shipping default is the strict gap (~0.5 per PLAY) and the design claim is *agency*: calls are where a careful player beats a naive one (0.58 → 0.08 without them). Where calls surfaced: ENTRY 132, CONTACT 365, TROUBLE 366, PRIZE 101, GETAWAY 17 — the PRIZE and GETAWAY windows almost never diverge; the rule may simply skip them. The smart way out was chosen in 22% of calls.

### I.6 Is it entertaining? — the honest read
What the sim can and cannot say. It can say the **supply** of tellable moments is high and readable: 95.9% of PLAYs carry a story beat, 82 families exist, 97% of losses carry a because. It cannot say a human will laugh; the "I want to run another PLAY" gate is Ube's (§K).
- **F-1 Repetition is the risk, not scarcity.** 52.9% of PLAYs share their two-family signature with ≥ 4 others (251 distinct signatures in 800). Routine stingers dominate: NERVE lost (28% of PLAYs), the sandwich (24%), LT drop (22%), the DRESSED TO KILL crease line. By PLAY 10 these are filler. Fix: ration each stinger (once per PLAY staged — already applied), give signature events a cooldown across PLAYs, and lean on the rare heavy events (SPLIT "took the bus", COIN FLIP, MAC & CHEESE friendly fire, generic death lines, the GREED replay, Rich's pull-up) which are each 2–10% of PLAYs.
- **F-2 Failures tell better than wins.** Ten best stories (by novelty-weighted interest): 4 jugged/HIT ONE MORE failures, 3 costly wins, 3 wins-with-a-story, **0 clean wins**, and 5 of the 10 are the BIG PLAY; ten worst: 5 clean wins, 3 folds, 2 wins-with-a-story — and four of them are the same QUIET LIFT with "Half-Pint could not lift it alone" (the SMALL failure line repeats). A clean win is the least tellable PLAY (transcript 1 reads as competence, not story). That is Hades-normal, but the clean run needs the pitch → trunk arc (a real kicker, a crew reaction, a next temptation) to carry it, which is why the kicker rule (D.1) matters.
- **F-3 The boring PLAY is a small, quiet job with a 2–3 crew.** 33 of 800 PLAYs have no story beat; the lowest-novelty 15% are 90% wins: QUIET approach 24% boring vs LOUD 9%; HOOPTIE/SUPRA 18–21% vs URUS 7%; crew of 2–3 = 21% vs 4 = 9%; DOCK RESTOCK 24%, DENTIST 23%, TUPPERWARE 21%. And 25 of those 120 are **FOLDs that leave nothing behind**. Fixes: a FOLD must write a line (report, reaction, or seed — the Hades rule already requires it and the invariant now checks it); QUIET jobs need a designed wrinkle card (the dog, the wrong pizza) so a clean quiet PLAY still has a beat.
- **F-4 Empty beats.** 25.1% of the 3,866 beats stage nothing. Rule: a beat with nothing to show is a one-line deadpan caption at ~1.5 s ("Two seconds. Nobody had a story."), not a 5-second beat.
- **F-5 Some morning-after content repeats.** Retaliation is 32% of next temptations, rare-pitch 28%, rescue 18.5%, recruit 12.6%, demand 8.9%; the Oga text lines repeated until keyed by event. Nickname/scar/STORY bookkeeping: cap at one seed and one nickname per PLAY.
- **F-6 The tension is in the trunk and the climb, and it is honest.** HIT ONE MORE EV is +11.2 at step 1, −35.5 at step 2, −102.2 at step 3 (E); teases were never false.

### I.7 BEEF verdict — CUT (as proposed); do not rework for the feel gate
"Whoever got left behind resents the driver; seating them together next time can trigger a quirk." Campaign arms, 80 careers × 24 nights each (~1,650 PLAYs per arm): as proposed it is **created 2.7 per 100 PLAYs and triggers 1.1 per 100** — once per ~90 PLAYs. Aggregate story-beat (88.4% vs 88.8%) and novelty (23.66 vs 23.71) do not move. Widened to friendly fire (BEEF ON+): 18.4 created / 5.3 triggers per 100 PLAYs (65 arguments, 22 settlements); the PLAYs where a BEEF fired are richer (novelty 27.5 vs 23.7, +16%) but the aggregate still does not move, and it carries **1.2 open grudges on average (max 9)** of bookkeeping to buy one moment per ~19 PLAYs. It creates memorable crew history *when it fires* and noise while it doesn't. The same history is available for free from what already exists: the SPLIT line on the Oga card ("left on the curb") and the nickname. Recommend CUT; revisit after the feel gate if Ube asks for grudges.

### I.8 The loss economy has a death spiral for weak play (new finding)
Campaign layer, 40 careers × 24 nights per policy: **careful** — roster 8.15/9 at the end, READY 8.0 at night start, 0.28 Ogas lost per career, 139 of 146 EXTRACTs won, WASH 8.3%. **random** — roster **2.25/9**, READY 4.3 (< 4 on 40% of nights, 272 nights with too few Ogas), **4.65 Ogas lost per career (167 named + 19 generic)** to expired EXTRACT clocks, only 29 of 48 rescues won, WASH 18.5%. The mechanism: a WASH (11.5–24% of PLAYs by policy) leaves up to 2 Ogas CAPTURED; only one PLAY per night can be an EXTRACT; a failed rescue burns a night and a captive's 3-night clock; expiry = GONE (the authored Vol 7 path). That collides with "loss costs time and the unbanked pot, not hours of progress" and with the no-punishment guardrail. **Spec response (REWORK, F04/F13 to confirm):** (a) a **last-stand bail-out**: when the crew is down to one able Oga the crew drags the others to the car — a WASH becomes a BAILED failure (wounded, no captives); (b) the EXTRACT clock pauses while READY < 4 (or the first captive of a career gets a free clock); (c) two captives may share one EXTRACT. The authored 3-night clock and GONE-on-expiry stay canon; these are brakes on how often the clock is reached.

### I.9 Pitch-board variety audit (10 consecutive nights, 80 careers; plus 60 board-only 10-night sequences per rule set)
- 2–3 pitches per night: yes (2 pitches: 285 nights, 3 pitches: 315; 4–5 only when a red BIG PLAY or an EXTRACT card is added, 83 nights). **Same shape twice on one board: 0. Same shape played back-to-back: 0** (EXTRACT retries excluded — the rescue clock forces them). Shape overlap night to night: 30%; spec overlap 6%.
- **Rules A alone (the OL-015 minimum)** allow 23% night-to-night spec overlap and 137 of 600 boards with a repeated pitcher; **rules B** (no spec from last night, one pitcher per card) cut those to 1% and 29. Rules B are therefore mandatory.
- Pitcher variety: 5.8 of 6 named pitchers per 10 nights; lead-pitcher repeat 18%; names 18 distinct per 10 nights; 94% of boards mix ≥ 2 emotional propositions (COMEDY / DREAD / TENSION / VIOLENCE).
- **Algorithmic-repetition flags (real):** every one of 80 careers meets some spec ≥ 3 times in 10 nights (9 playable specs, ~26 pitches per 10 nights → ~2.9 each); OPEN MOUTH GANG is 58–60% of pitches; only 5 playable shapes exist for a board of 3 minus last night's shape. The first feel gate (3 hand-authored jobs) cannot test this; the launch pool needs ~20+ specs or a template system (faction × place × twist), and HUNTERS/COUSINS/third-crew pitches need equal billing.
- Truthful `?`: 497 played PLAYs checked, **0 fake teases**; every shown silhouette is in its job's pool; the floor held on every win; **the advertised top of the band was reached on 88% of clean wins** — so the card says "UP TO".

---------------------------------------------------------------------------------------------------------------------------------

## J. CANON RULINGS (OL-014) — how each is applied — and what remains open

**J.1** named Oga on a BIG PLAY → GONE, never DEAD; `bigPlayNamedOutcome` locked to GONE, Ube-only via a canon packet. **Applied (C, G).** · **J.2** ROSTER: the War Room table stays at the authored **8 base seats + 1 per district Rich controls (max 11; F13 tunes)** — the sim's 6 named + 3 generics is the 8 + 1 (Koreatown) case; generic deaths sting because refill needs a seat; the feel gate runs at 9. · **J.3** ODDS: risk words only; supersedes Vol 7 §3.2 display; "95%???" → **SURE THING???** (a sure thing that misses is a staged FUNNY moment and a STORY seed). **Applied (A.1).** · **J.4** NERVE (STEADY / SHAKY / LOSING IT); HEAT tiers keep COOL / WARM / HOT / ON FIRE. **Applied (A.5).** · **J.5** JUGGED = ROBBED; "held by the law" removed. **Applied (C).** · **J.6** OCTOPUS BRAIN = one authored smart way out per beat card + PULL UP move buttons (max 3); ITEM removed; Blood X only feeds THIRST; SEEN IT ALL = NERVE floor SHAKY; F02 gun conflicts / JOLLOF BURN / TOMMY TONY stay in F02's discretion log; HAND BACK and report-card sealed wording via the sealed annex through the Underlord. **Applied.** · **J.7** content (THIRST, quirks, WEIRD finds, BIG PLAY prizes, turning lines, generic names) drafted under H1 for Underlord review — 42 WEIRD, 8 LEGENDARY, 6 quirks, 27 beat cards each with a smart-way-out line, 10 job specs (30 names), 6 pitcher voice sets, 5 octopus plans, 8 generic names are in `content.mjs`; Ube may replace any. · **J.8** turning approved; "never a named human" and "always willing" kept; bounds provisional, frequency reported (D.3). · **J.9** seams approved as specified: F04 job-menu remap, `RACrew.registerStatus` for JUGGED/DEAD/WOUNDED/SHOT, F02 grant path, F13 numbers.

**Remaining CANON_COLLISION**
1. **EXTRACT-expiry GONE (Vol 7, authored) vs the death spiral (I.8).** Both are canon-safe (GONE is not death) but the frequency for weak play breaks the loss principle. Needs a ruling on the brakes in I.8.
2. **Vol 7 §3.2** still shows odds "plain words + a %"; J.3 supersedes it — the Vol 7 text needs an erratum so F04's job cards are not rebuilt with %.
3. **Roster cap vs "recruit up to 8"** in Vol 7 §0 — J.2 replaces it, but Vol 7's recruit texts still say 8.
4. **"Slide-in skippable after the 5th PLAY"** needs a persistent play counter (F04/F14 save field) that no owner has claimed.
5. **Nightly job cap vs the rescue clock:** a night spent on EXTRACT is the night's job (2 at 6+ Ogas); confirm that is intended.

**Remaining SOURCE_REQUIRED**
Car trait words and stats (F03/F13; TRIBUTED cars excluded) · OCTOPUS BRAIN plans per job (drafted for 5) and smart-way-out lines for the whole beat-card library (27 drafted) · vampire THIRST moment text · generic quirk pool (6 placeholders) · WEIRD/LEGENDARY names (42 + 8 drafted; Ube seeds welcome) · BIG PLAY exclusive prize table · turning flavour lines · DAY ONES pairs (three placeholder pairs used; Vol 7 says pairs earn it by 3 shared jobs — the campaign layer forms them on that rule) · nickname/scar tables · RAIN / FULL MOON night-modifier math · pocket-loss size for ROBBED (sim: $1–3K) · JUGGED report wording · HAND BACK / December / final report-card wording (sealed) · pitcher voice sets for jobs beyond the first three · VampGram lines for the morning after · F02 gun behaviours (LIL OGA range, SAPPORO "hits two", JOLLOF burn, TOMMY TONY bonus) · sound-library code matches (only approved codes; BX stingers stay silent) · every number (F13).

---------------------------------------------------------------------------------------------------------------------------------

## K. FIRST BROWSER FEEL GATE (after digest approval) — scope and what the sim changes about it

**In scope (unchanged from OL-014):** Koreatown only · 3 hand-authored jobs (one LOUD stick-up vs Open Mouth Gang, one QUIET lift, one HOLD THE HOUSE raid) · 6 named Ogas + 3 generics with turning on · cars HOOPTIE / S2000 / Supra / Urus · 5 F02 guns including AUNTIE'S SLIPPER · the full loop PITCH → CAR → SLIDE-IN → BEATS → CALLS → GETAWAY → TRUNK → HIT ONE MORE → MORNING AFTER · night mode with frozen sprites and logged placeholders · only approved library sounds whose codes truly match, BX stingers silent · one-line first-time tips, no tutorial wall · sandbox resets. **Out of scope:** War Room board, district economy, TRAP, final art. **Before Ube:** the bot gate plus a Google QA pass. **Ube's gate question:** "Did you immediately want to run another PLAY?" plus the §10 notes template.

**Recommended adjustments from the sim (all inside that scope):**
1. **LOUD stick-up:** author it so a decision matters — the sim's car-wash job had careful 85% vs naive 85% (no skill gap); give it a seat/gun combo that pays off (DOOR'S A SUGGESTION) and a mid-fight call.
2. **Calls:** ship the strict gap (~0.5/PLAY); skip PRIZE/GETAWAY windows unless they diverge.
3. **Beats with nothing to stage collapse to a 1.5 s caption.**
4. **Trunk:** no cash/DISTRICT/STORY/RECRUIT kicker; per-Oga reaction lines; the tease truth rule tested live.
5. **Cars:** disable a car that cannot seat the minimum crew; show the car word.
6. **CUT BEEF.** Cap STORY seeds and nicknames at one each per PLAY.
7. **Widen thin traits** (CHURCH SHOES, LOYAL, IMPATIENT, CALM, SEEN IT ALL) so each can surface on any job shape; ration DOOR'S A SUGGESTION.
8. **SPLIT** trigger widened (SKITTISH/ROOKIE/BIG POTENTIAL driver at SHAKY, HOOPTIE stall under ALL HANDS): it is the funniest event and currently 1.8%.
9. **Last-stand bail-out** for the WASH (naive 19.5%, random 24%): a wiped crew that drags the downed home is a BAILED failure, not a WASH with captives.
10. **Instrument the Ube question:** log time-from-report-to-next-PITCH and "ran another PLAY within 30 s" so the gate has a number as well as an answer.

---------------------------------------------------------------------------------------------------------------------------------

## L. TRACEABILITY — packet clause → section

| Clause | Where |
|---|---|
| OL-014 J.1 GONE not DEAD, switch locked | C, G, J |
| J.2 roster 8 + 1/district, max 11 | J, K |
| J.3 words not %, SURE THING??? | A.1, J |
| J.4 NERVE zones, HEAT tiers kept | A.5 |
| J.5 JUGGED = ROBBED, law-held removed | C, E |
| J.6 OCTOPUS BRAIN line per card, PULL UP ≤ 3 buttons, ITEM removed, Blood X → THIRST, SEEN IT ALL floor SHAKY, F02 discretion, sealed annex | A.4, A.6, B.1, D.2 |
| J.7 content under H1 | B.1, D.1, J |
| J.8 turning bounds provisional, frequency reported | D.3, I.1 |
| J.9 seams | J, H |
| M1 pitch cards | A.1 |
| M2 car = formation | A.2, I.3 |
| M3 watching grammar | A.4 |
| M4 calls are people | A.6, I.5 |
| M5 getaway | A.7 |
| M6 trunk + truth rule | D.1 |
| M7 HIT ONE MORE crew line, GREED tag | E |
| M8 morning after (VampGram, texts, nicknames, seeds, district, ≥ 1 temptation, Hades principle) | A, I.6 F-5 |
| M9 combos + CREW BOOK | B.3 |
| Authored pacing kept (1 job/night, 2 at 6+ Ogas), no timers/login/paid | 0 |
| OL-015 §1–§12, replay guardrails | 0, A, B, D, E, I |
| Sim additions (because cue, call divergence, BEEF on/off, 10-night board audit, 5 transcripts) | I.5, I.7, I.9, digest |
