# F01 — THE PLAY (design spec, OL-013 follow-up)

Status: **PLAY SPEC — READY FOR OVERLORD APPROVAL** · design only, no code · supersedes the F01 tactical interaction model
Base: `frag/showdown-core/001` @ `4d93dc9` · Source authority: Vol 7 (OPEN), Ube canon decisions (locked, OL-013), Ube feel-gate lessons, F02/F04 contracts as read at their branch tips.
Convention: every number below is a **structural default, PROVISIONAL, owner F13**. Nothing here is final economy.

---------------------------------------------------------------------------------------------------------------------------------

## A. THE PLAY — one-page spec

**Fantasy:** *I run a dangerous vampire street crew.* The player picks the job, the people, the guns, the approach and the risk; then **watches the crew collide with the plan**. No grid, no hit %, no action buttons.

**Shape of one PLAY (60–90 s, phone, portrait, night):**
`OFFER → CREW → LOADOUT → APPROACH → (FORMATION) → SLIDE-IN → 5 BEATS (autonomous, ≤ 2 CALLS) → GETAWAY → NAME-CARD SLAM → HAUL REVEAL → TAKE THE WIN | HIT ONE MORE → REPORT CARD`
The 8 strategic job shapes of Vol 7 (DROP, RE-UP, COLLECT, PROTECT, TAKE THE BLOCK, EXTRACT, BAIT, LAY LOW) collapse into **PLAY shapes** with one engine; LAY LOW stays a non-play. RETALIATION and Trap defense = **HOLD THE HOUSE** (§F). F04 keeps ownership of districts, pressure clock, jobs-per-night, HEAT, SUPPLY, the 3-night EXTRACT clock, stories and the report-card voice; F01 owns *resolution of one PLAY*.

**1 · JOB OFFER (≤ 6 things, no numbers you must compute).**
`SHAPE · DISTRICT` (e.g. COLLECT · KOREATOWN) · **PAY** band (Vol 7 bands: DROP $8–25K, COLLECT $10–40K, PROTECT $15K+REP, RE-UP +3–6 SUPPLY, TAKE THE BLOCK control+$$) · **RISK** word: `EASY / TOUGH / NASTY / BIG PLAY` · **LOOT PREVIEW**: up to 3 silhouette chips (the categories this job can pay, one always `?`) · **OPPOSITION**: faction + one tell ("OPEN MOUTH GANG — shotguns", "HUNTERS — silver") · **HEAT**: LOW/MED/HIGH · night tags (RAIN, FRIDAY, NODD ON PATROL). Tap `MORE` for the rest. `BIG PLAY` = red plate (§G). *Risk is a word, not a %* (see §J-3).

**2 · CREW PICK.** 2–4 Ogas per the authored squad size of the shape (default 3, cap 4). Each chip = portrait, class glyph, status (READY / WOUNDED n / SHOT n / AWAY), **one** relevant trait word, a ★ if the class fits the job, a ♥ link if two picked Ogas are DAY ONES, a **red skull pip on generic Ogas** ("CAN DIE"). No stat numbers. `AUTO` fills the best-fit crew.

**3 · LOADOUT.** One gun per Oga (F02 carried gun) + ≤ 2 mods; the vehicle if a WHEELS is in (Vol 7: "the car's stats matter"). Each gun shows a **role word** derived from the F02 Showdown data (`BREACHER · SNIPER · TWO-TAP · SPRAY · AREA · CLOSE`), never stats. `AUTO` equips the best. Warnings only where they change a decision: RPG `+10 HEAT`, SILENCER `QUIET`, dry/empty clip. Gear/ITEM stays **SOURCE_REQUIRED** (no item is authored).

**4 · APPROACH (exactly Vol 7's three; no new canon).**
`QUIET` — GHOST/TALKER shine, low heat, if spotted it turns bad fast (high COOL start, big PRESSURE spike on discovery). `LOUD` — MUSCLE/SHOOTER shine, success likely, high heat, injuries likely (low COOL start, high PRESSURE, more damage both ways). `OCTOPUS BRAIN` — the weird lateral plan unique to the job, **only shown when the job has an authored plan and Rich's life has the pieces** (content = HQ; SOURCE_REQUIRED per job). Approach sets starting COOL/PRESSURE, the beat-pool weights, loot weights and heat. It is a **strategy choice, never a difficulty setting**; there is no difficulty selector anywhere.

**5 · FORMATION.** Yes, but tiny: **three lanes — FRONT / MID / BACK**, two Ogas max each, drag or tap-swap, `AUTO` pre-filled so a new player just presses GO. It earns its place because it is the only spatial choice left and it makes four things legible at once: who eats the first shots (FRONT), whose gun works (shotgun/breacher wants FRONT, sniper wants BACK), where the DOC/TALKER live (MID), and who a FLANKER (CHEWER) or SNIPER ignores lanes for. Rejected: numbered turn order, role slots, any grid.

**6 · AUTONOMOUS BEAT RESOLUTION (deterministic, seeded).** 5 beats: `ENTRY → CONTACT → TROUBLE → THE PRIZE → GETAWAY` (Vol 7: "3–4 decision beats" per run, "6 beat pools" per job type — reused as the content authoring unit). Per beat:
1. Draw a **beat card** from the job's pool (weights from approach + PRESSURE zone); it may reveal an opposition pod (2–5 enemies from the authored roster).
2. Build the **actor queue**: crew + opposition ordered by lane, class, IMPATIENT etc., seeded tiebreak.
3. Each actor takes **one exchange**: crew pick an intent from class/role/weapon/traits (breach, cover, pick off, talk, patch, hold); enemies use their **AI-as-beat-resolver** (CHEWER goes for the BACK lane, ENFORCER charges FRONT and ignores cover, HUNTER seeks vampires with silver and ignores VANISH, LIEUTENANT lifts neighbours, LIL SMACK's CHEW sours his crew and he **flees at low HP instead of dying**). Outcome tier: `CRIT / HIT / GLANCE / MISS / FUMBLE` from hidden odds (F01's honest-RNG core, unchanged); a "sure thing" that fails raises the authored **`95%???`** caption.
4. After every exchange the **trigger scan** (§B) may add a *moment* (≤ 1 per Oga per beat, ≤ 6 per PLAY).
5. **Threshold checks**: PRESSURE/COOL zone change, an Oga hits 0 HP (DROPPING), reinforcement arrival → may open a CALL (§9).
6. **Feed:** every event is logged (replay), but only the top **3 moment cards per beat** are staged, by an interest score (`clutch > disaster > bond > trait > routine`); the rest scroll as a one-line ticker. Cause and effect is one sentence each: *WHO did WHAT → what it did to COOL/PRESSURE/the haul.*
Signature class abilities become **once-per-PLAY auto-moments** (SHOULDER CHECK = breach, DEAD EYE = pick off the LIEUTENANT, THE CAR = getaway boost or ram, TALK HIM DOWN = honest 60 % surrender of a hurt non-hunter, VANISH = skip a detection, PATCH UP = save a DROPPING Oga).

**7 · COOL / PRESSURE (the only two operation meters; per-PLAY, reset each PLAY).**
- **COOL** = *the crew's composure and discretion* — how much the operation is still theirs. Falls when things go loud, allies drop, plans slip; rises with clean beats, TALKER/GHOST wins, CALM/DAY ONES moments. Read as a teal bar with three named zones: `STEADY · SHAKY · LOSING IT`.
- **PRESSURE** = *how hard the block is closing* — heat of the room: opposition weight, alarms, law, reinforcements. Rises every beat by the card's weight and by noise; falls when opposition is removed or talked down. Red bar, zones: `QUIET · ALERT · ALL HANDS`.
- **Effects:** COOL scales crew success/fumble/clutch/stupid odds and trait behaviour (low COOL wakes IMPATIENT and the hotheads; high COOL raises clutch). PRESSURE scales opposition count/damage and triggers reinforcements at `ALL HANDS`. **COOL − PRESSURE at beat 5 is the Getaway margin** and feeds HEAT. Per-Oga HP is shown as pips on the name cards; no third meter. *(Naming: the in-PLAY "COOL" is a bar; HEAT's tier COOL/WARM/HOT/ON FIRE is a candle — see §J-4.)*

**8 · TRAIT TRIGGERS** — §B.

**9 · CALLS (rare, dramatic, not turn control).** ≤ 2 windows per PLAY (3 on BIG PLAY). The sim **freezes** on a lit scene; 2–3 big buttons; one tap; no real-time reflex timer; if the player waits, the crew uses its judgement. Buttons show **who is best**, not odds ("TALK — DRE · PAY $3K · LEAN ON HIM — TUNDE", the authored Vol 7 doorman pattern). A window opens when: PRESSURE reaches `ALL HANDS` · an Oga starts DROPPING · an authored fork beat · Rich becomes available. Call verbs (fixed set): **PUSH** (commit to the prize) · **FOLD** (cut losses, go to Getaway early) · **SAVE** (go back for the dropping Oga: costs COOL, improves his outcome) · **SWITCH** (QUIET↔LOUD pivot) · **PULL UP** (Rich, from beat 3, once; +15 HEAT hook and VampGram post exactly as authored) · job-specific authored choices.

**10 · GETAWAY (beat 5).** Score = COOL − PRESSURE ± car/WHEELS ± carrying a downed Oga (slower, as authored) ± prep (SILENCER etc.). Five results: **CLEAN** (everyone in, full haul, low HEAT) · **MESSY** (haul intact, wounded, extra HEAT, one chase card) · **COSTLY** (part of the pot dropped, someone SHOT/CAPTURED) · **SPLIT** (someone left behind → CAPTURED, or JUGGED if the law is on the block) · **WASH** (haul lost, crew scattered = FAILURE). Vehicle costs stay as authored (IMPOUNDED at WARM+, WRECKED if THE CAR rams below half durability).

**11 · LOSS RULES** — §C. **12 · LOOT** — §D. **13 · TURNING** — §D-2. **14 · HIT ONE MORE** — §E. **15 · HOLD THE HOUSE** — §F. **16 · BIG PLAY** — §G. **17 · REUSE** — §H.

**18 · MOBILE / UX.** Night palette darker than F01 (the "too bright" lesson): near-black ground, one teal accent, red only for danger, bone panels only for the offer/report. **Max 3 tappable things per screen after the offer**; big type; the PLAY screen is a *stage* (a strip of portraits + a scene line + the two bars), not a board. No icon wall: glyphs only for class, lane, HEAT. Portrait-first at 360/390/430; every touch target ≥ 48 px; everything skippable (tap = fast-forward one beat). Sound cues from the authored `BX_*` set (slide-in, name-card slam, pod reveal, downed, cover hit) with placeholders until Audio delivers.

---------------------------------------------------------------------------------------------------------------------------------

## B. TRAIT TRIGGER FRAMEWORK

**Model.** A trigger = `WHEN (event tag + state) → EFFECT (mechanical, hidden) → MOMENT (one staged line) → TAG`. Tags: `CLUTCH · STUPID · FUNNY · SCARY · WARM · TURN`. Rules: ≤ 1 trigger per Oga per beat, ≤ 6 per PLAY, each seeded (a trigger *can* fail funny). Ogas keep their voice through **six layers**, evaluated in this order: STORY perk → named trait → DAY ONES → class tendency → vampire moment → generic quirk.

| Layer | WHEN | EFFECT | MOMENT (example) | Tag |
|---|---|---|---|---|
| Class MUSCLE | ENTRY, locked door / FRONT | breach; soaks the first exchange | "TUNDE-type walks through the door, door stays behind" | CLUTCH |
| Class SHOOTER | BACK lane, LIEUTENANT present | pick-off: lowers PRESSURE | "one shot, the green fur drops" | CLUTCH |
| Class WHEELS | GETAWAY | + margin; ram once | "takes the corner on two wheels" | CLUTCH/FUNNY |
| Class TALKER | door / doorman / surrender beat | honest 60 % surrender (75 % MOUTHPIECE); hunters immune unless TALKED DOWN A HUNTER | "talks a chewer out of his own tracksuit" | FUNNY |
| Class GHOST | QUIET ENTRY | skip a detection; VANISH first strike | "was never in the room" | CLUTCH |
| Class DOC | any Oga DROPPING | PATCH UP: downgrade SHOT→WOUNDED once/PLAY | "nurse voice: sit down" | WARM |
| Named CALM | PRESSURE ≥ ALERT and held in FRONT | absorbs one PRESSURE rise | "doesn't blink" | CLUTCH |
| Named ALWAYS EATING | idle exchange | +1 HP between beats; or FUNNY fumble mid-bite | "finishes the sandwich first" | FUNNY |
| Named MOUTHPIECE | any talk beat | +15 % | "sells the lie twice" | FUNNY |
| Named PHONE OUT | ENTRY | reveals the hidden pod → no ambush beat | "already has their photos" | CLUTCH |
| Named SMALL | incoming crit | −10 to be hit; dodge line | "wasn't there" | FUNNY |
| Named IMPATIENT | ENTRY | goes early: variance up (big hit or blown quiet) | "couldn't wait" | STUPID/CLUTCH |
| Named DRESSED TO KILL | while unhurt | +1 damage; suit-ruined gag when first hit | "the pocket square is gone" | FUNNY |
| Named CHURCH SHOES | roof/fire-escape/stairs card | no route penalty | "climbs like Sunday" | CLUTCH |
| Named ROOKIE | until first STORY | fumble odds up; first success = STORY seed | "first real one" | WARM |
| Named BIG POTENTIAL | STORY moment | perk doubled | — | WARM |
| Named SEEN IT ALL | — | **inert** (no PANIC authored) | — | — |
| Named SIT DOWN | ally DROPPING beside her | stabilize free, once | "SIT DOWN." | WARM |
| DAY ONES | one DROPPING while partner alive | partner goes back: **SAVE chance up, COOL down** (or recklessly charges: STUPID) | "goes back for him" | WARM/CLUTCH |
| DAY ONES | one lost | other WOUNDED-in-spirit (−aim 5 nights, changed WAKE line — authored) | — | SCARY |
| STORY SURVIVED THE CAR WASH | in cover card | +5 aim | — | — |
| STORY CARRIED TUNDE 6 TILES | carrying | no slowdown at Getaway | "still running" | CLUTCH |
| STORY TALKED DOWN A HUNTER | hunter pod | TALK works on hunters | "the crossbow lowers" | FUNNY |
| STORY SAW 95 % MISS | any | +5 aim; and the joke: a sure thing fails → `95%???` | caption | FUNNY |
| Vampire (any vampire Oga) | a bleeder in the room, no Blood X on hand | THIRST check: resist (CLUTCH) or slip (STUPID: noise, PRESSURE up) | "eyes go red" | SCARY/STUPID |
| Vampire vs HUNTER | silver bolt hit | +2 dmg authored; SCARY moment | "silver in the ribs" | SCARY |
| Clutch (any) | COOL LOSING IT & unhurt | 1 in ~8: turns the beat | "last one standing" | CLUTCH |
| Stupid (any) | COOL LOSING IT | wrong door, dropped case, shot the alarm | "wrong door" | STUPID |
| Funny disaster | seeded, uncommon | pot / PRESSURE swing | "the van was the wrong van" | FUNNY |
| Generic quirks (recruits: one each, **placeholder pool**) | SKITTISH · SHOWBOAT · LOYAL · STICKY FINGERS · HOTHEAD · STEADY | small hooks into the same events (STICKY FINGERS: +1 loot card, +PRESSURE) | — | mixed |

*Notes.* Vampire "THIRST" content and generic quirk names are **design placeholders needing HQ authoring** (no canon claimed). All authored numbers (CALM +10, MOUTHPIECE +15, SMALL −10, DRESSED +1, ROOKIE −10, story +5, silver +2, bond +10, 60 % talk) are kept from Vol 7.

---------------------------------------------------------------------------------------------------------------------------------

## C. LOSS / CONSEQUENCE TABLE

Principle: **loss costs time and the unbanked pot, not hours of progress.** Mercy invariant: one failed *routine* PLAY can put at most **2** Ogas away; extra losses downgrade to WOUNDED.

| State | Who | Cause (routine PLAY) | Effect | Recovery |
|---|---|---|---|---|
| **WOUNDED** | any | hit to 0 HP but carried/patched/lucky | unavailable this night | 1 night, or DOC |
| **SHOT** | **named** (and generics that live) | named Oga reaches 0 HP and is still with the crew (carried/patched) or the Getaway held | away, one scar line; **cannot die** | 2–3 nights (RACrew DOWNED + timer) |
| **CAPTURED** | any not dead | left behind at 0 HP on SPLIT/COSTLY (authored: left-behind DOWNED → CAPTURED) | opens an **EXTRACT** job that expires in **3 nights** | win EXTRACT; expire ⇒ strategic layer (§C-GONE) |
| **JUGGED** | any | law on the block (NODD ON PATROL / HEAT ≥ HOT at Getaway) and left behind | held by the law, not by rivals | bail $ or 2 nights; never lasts longer; never permanent |
| **DEAD** | **generic Ogas only** | sudden: crit or execution at 0 HP, seeded, visible when it happens | removed; seat frees for a recruit | — (the price of expendables) |
| **GONE** | named | (a) failed/expired EXTRACT — authored, player's fault; (b) **BIG PLAY only**, knowingly accepted (§G) | removed for Before the Fame; ribbon; Day One mourns | truth waits for after fame |

- A named Oga **cannot** reach GONE/DEAD from routine RNG. Engine invariant (tested across all seeds): `named.status ∈ {GONE,DEAD} ⇒ play.bigPlay && play.acceptedNamed ∋ id`.
- Failed PLAY: pot lost (this PLAY only); HEAT still applies; banked/earlier stuff untouched. HIT ONE MORE failure also loses the escalated pot (§E).
- Statuses map to IF-1 `RACrew`: WOUNDED/SHOT = DOWNED + timer; CAPTURED and GONE exist; **JUGGED and DEAD need `RACrew.registerStatus`** (F04/owner).

---------------------------------------------------------------------------------------------------------------------------------

## D. LOOT / REWARD STRUCTURE

**Reveal (the pillar).** After the Getaway the bag drops: **3–5 face-down crates** (base 3 + clean getaway + tier + HIT ONE MORE steps). Each crate's **lid glow** tells rarity before it opens (dull → teal → red → gold; `WEIRD` = pulsing white). Crates open one by one, smallest to biggest, each with a hit-stop; a rare+ open triggers the name-card-style **slam** and a screen flash; the **last crate is always the KICKER** (best card, floor by tier). Bad luck protection: no dry stretch of RARE+ longer than N PLAYs (N = F13). Everything is added to a single **pot** that is *not banked* until TAKE THE WIN.

**Categories:** `CASH` · `BLOOD X` (SUPPLY; $3,500/case reference) · `GUN` · `RARE GUN` · `MOD` · `RECRUIT` (a willing candidate, §D-2) · `STORY` (a perk seed for an Oga who did the thing) · `DISTRICT` (rival pressure −, demand +, control) · `WEIRD` (unusual finds; content authored later). **Rarity:** `COMMON · RARE · LEGENDARY` plus `WEIRD` (F02's rarity vocabulary).
**Weights by:** shape and district demand · approach (LOUD → cash/guns, QUIET → rare/intel/weird) · Getaway quality · tier · HIT ONE MORE step · BIG PLAY table (exclusive, HQ-authored) · crew quirks (STICKY FINGERS).
**Gun pool now:** F02 catalog guns that have **no sealed/other-fragment acquisition** — LIL OGA, SAPPORO, MAC & CHEESE, CHOPSTICK, HOLY BABY DRAKE, THE RPG, AUNTIE'S SLIPPER, plus TOMMY TONY / JOLLOF BURNER **only after their F02 acquisition gate** (tandem win / Jollof Wars). **Excluded:** LEGENDARY DRACO (sealed Playmakers), BLUEBERRY BLASTER (F03 Mazda), GOLDEN DRACO (F03 finale). Mods: SILENCER, SCOPE, DRUM MAG, BLESSED ROUNDS (still SOURCE_REQUIRED in-fight), GOLD PLATING, ENGRAVING. Drops grant through the F02 ownership contract.
**Anchors, not tuning:** base cash stays inside the authored Vol 7 job bands; the `$60–150K / week well-run` target is F13's to protect; a gun drop (F02 price $25K–$400K) is worth several jobs, so RARE GUN cards are rare by design.

**D-2 · VAMPIRE TURNING (bounded).** Rich never turns anyone. A `RECRUIT` crate or a rare beat card ("WILLING") offers one **generic willing person**. Only a **vampire Oga who is conscious and in the crew** may offer: `TURN` or `LET GO`. Bounds: ≤ 1 candidate per PLAY, cooldown 3 nights, needs a free generic seat (roster cap, §J-2), **never named humans** (TUNDE, AUNTIE GRIT), never automatic. Seeded outcomes: *it takes* (new generic Oga, class by need, 1 quirk, "TURNED BY <name>" story seed with the turner) · *it takes weird* (odd quirk, funny) · *they bail* (candidate walks; no penalty). No claims about Blood X, bloodlines or lore beyond "a vampire Oga turned a willing person".

---------------------------------------------------------------------------------------------------------------------------------

## E. HIT ONE MORE — rule

**Offered:** after any successful Getaway (CLEAN/MESSY/COSTLY), before the haul is banked. **Choice:** `TAKE THE WIN` (bank everything now) or `HIT ONE MORE`.
**What it is:** a short follow-up on the same block (3 beats, no re-pick, no re-prep) — the "next floor / the back room / the stash".
**Escalates (each step):** PRESSURE starts higher, COOL starts where the crew *ended* (no reset), wounds carry, opposition jumps a tier (LIEUTENANT → HUNTERS → LIL SMACK-class), HEAT keeps accumulating (feeds the retaliation gate at HEAT ≥ 60, a cost that lands *outside* the PLAY). **Improves:** pot multiplier, +1 crate, rarity weights shift up, a visible **tease** (one gold-lit crate silhouette before you choose), and a jackpot table at step 2+.
**Can be lost:** the whole pot of that PLAY (including the steps already won), plus normal loss rules on the crew. Previously banked things are never at risk.
**Stops:** hard cap **3 steps**; auto-cash if any Oga is CAPTURED/JUGGED or COOL ended `LOSING IT` ("TOO HOT — GET OUT").
**Anti always-click:** the button carries a plain-word read of the crew (`FRESH / BANGED UP / RAGGED`); each step lowers COOL and raises the disaster chance faster than the reward, so EV peaks around step 1 for a healthy crew and turns negative by step 3 except for the jackpot tail (F13 fits the curve); short-handed crews get a visible penalty; the tease makes the choice *emotional*, the read makes it *informed*.

## F. HOLD THE HOUSE — rule

Same engine, mirrored direction. Trigger: a scheduled **retaliation** (F04: a district flipped or HEAT ≥ 60) or a Trap defense (F05). The offer is a **NOTICE** ("RAID INCOMING") not a choice; the player picks who is home and lanes (`DOOR / HALL / INNER` = FRONT/MID/BACK) and a loadout; approach is replaced by **STANCE**: `HOLD THE DOOR` (COOL up, slow bleed) or `LET THEM IN` (PRESSURE up, bigger counter chances). Beats = **3 waves + the push** ("the castle's own halls"); the "prize" is the stash. Result: **HELD** (no loss) / **BREACHED** (authored: STASH RAIDED — lose 50 % SUPPLY + 20 % cash) / **OVERRUN** (breached + FAILURE). Loot = captured weapons + STREET REP + a chance at a `COUNTERATTACK` (= one HIT ONE MORE step, hunting them down). Rich may PULL UP from wave 2 (turn-3 equivalent). No Getaway; the "getaway" is the AFTERMATH card. Loss rules identical (§C); BIG PLAY not offered on defence (the house is the stake).

## G. BIG PLAY — rule

A BIG PLAY is a job flagged *exceptional* (boss, HAND BACK-class, marquee district flip). It is the **only** context where a named Oga can be lost.
1. **Job card:** red `BIG PLAY` plate; RISK word `BIG PLAY`; the reward line shows the exclusive prize category.
2. **STAKES screen (mandatory, cannot be skipped):** three lines — `WHAT YOU GET` (guaranteed floor + exclusive table) · `WHAT YOU RISK` · `WHO CAN DIE`. Every generic chip has the skull; **every named Oga picked gets a filled red skull and the label `MAY NOT COME BACK`**. The player must **hold-to-confirm** and tick each named Oga individually ("I accept for TUNDE"). Unticked named Ogas are simply not on the crew.
3. **Legible in the PLAY:** named Ogas in danger go `DROPPING` with a visible beat and a **SAVE** call before any loss resolves — never a silent roll.
4. **Outcome:** GONE with the authored presentation ("taken, went dark, or left town — the truth waits for after fame") **until Overlord rules** on the canon guard (§J-1). Player fault is preserved: the stakes were accepted.
5. Never exposes an unticked named Oga; engine invariant tested (§C).

---------------------------------------------------------------------------------------------------------------------------------

## H. F01 — KEEP / MODIFY / DISCARD

| | Item | Why |
|---|---|---|
| **KEEP** | `rng.js` (sfc32, calls counter), determinism pattern (immutable `apply`, event stream, state hash, `replay`, serialize/deserialize), replay log | the whole "seeded, honest" spine |
| **KEEP** | authored data in `data.js` (classes, enemies, weapons, Rich, traits, stories, bond, PROVISIONAL / SOURCE_REQUIRED registries) — **trimmed schemas**: unit `{id,name,cls,hp,aim,lane,traits,stories,bonds,weapon,mods,statusFlags}`; weapon `{id,band,dmg,hits,notes}` | reused as hidden inputs |
| **KEEP** | `packets.js`: F04 packet in / `toF04Resolution` / `toStrategic` (no GONE), F02 `bindF02` + conflict report, `registerProfile` (F05/F07), `showdown.js` facade (sessions, hooks incl. `richSeen`, stores), IF-1 registration (`F01.showdown_core` DARK), namespace-only migration, `F01_showdown.js` audio hooks | all the crew hooks / adapters |
| **KEEP** | sprites (portraits for name cards), `sfx.js` placeholders, sandbox/arcade-mirror deployment pattern, test infrastructure (bots, invariants, vm harness, browser-path skeleton) | cheap wins |
| **MODIFY** | `engine.js` → `play.js`: same create/apply/events/hash contract, but the state machine is `beats/exchanges/CALLS`; results add `pot`, `loot[]`, `losses[]`, `cool/pressure trace`, `moments[]` | |
| **MODIFY** | `ai.js` → enemy **beat resolvers** (same behaviour tags: flank, charge, silver, aura, CHEW/flee; targeting by lane instead of tiles) | the part Ube liked |
| **MODIFY** | `rules.js` → keep only `preview`-style odds math internally (hidden), lane + cover-as-card-property; delete geometry | |
| **MODIFY** | `maps.js` → job/beat-pool templates (6 pools × shapes) and opposition tables | |
| **MODIFY** | `ui.js`/`showdown.css` → cinematic **stage feed**, name cards, report card, offer/crew/loadout screens, darker palette; `sandbox.js` → mission = job offer | |
| **MODIFY** | `data.PROVISIONAL` list rewritten for the new interpretations | |
| **DISCARD** | grid, LOS, pathing, directional cover, height, fog, POD-by-sight, tile highlights, movement / dash | player-facing tactics retired |
| **DISCARD** | action buttons, hit-chance sheet, cover shield badges, overwatch/hunker commands, 2-action economy, tooltips, difficulty toggle (`HARD`) | information overload / no selector |
| **DISCARD** | the 3 ASCII maps and the four F01 sandbox missions; `browser-path` checks tied to tiles | |
| **DISCARD** | as sunk cost: nothing that is only there because it was built | |

---------------------------------------------------------------------------------------------------------------------------------

## I. 200-SEED PAPER-SIM DESIGN

**Goal:** evidence that seeded PLAYs produce *varied, tellable stories* before any browser work. **No economy tuning.**
**Harness:** headless node, reuses `rng.js` + trimmed `data.js`; a `paperPlay(seed, spec)` that implements §A.6 (beats, exchanges, triggers, thresholds, CALL policy, Getaway, losses, loot, HIT ONE MORE, turning) with the *same* hidden-odds math; outputs one JSON record per PLAY + a text "story digest" (≤ 8 lines from the top-interest events).
**Inputs (200 PLAYs = 10 job specs × 20 seeds):** COLLECT/DROP-low, PROTECT, TAKE THE BLOCK, EXTRACT, QUIET-favoured, LOUD-favoured, HUNTER-heavy, LIEUTENANT/LIL SMACK boss, one BIG PLAY, one HOLD THE HOUSE. Crews: rotating from 6 named + 2 generics (with DAY ONES pairs in ~half). Policies: **careful** (best-fit crew, uses SAVE/FOLD wisely, cashes out at step 1), **greedy** (always HIT ONE MORE to cap), **naive** (AUTO everything, no CALLS), **random**.
**Per-PLAY record:** outcome, Getaway class, cool/pressure trace + zone changes, reward value (cash-equivalent, unbalanced) by category, loot rarity list + kicker rarity, statuses issued (WOUNDED/SHOT/JUGGED/CAPTURED/DEAD/GONE), trait triggers by id/tag, CALLs used/result, turning event, HIT ONE MORE steps and result, BIG PLAY named exposure and outcome, `memorable[]`.
**Memorable classifier (≥ 1 of):** CLUTCH save/turn · FUNNY DISASTER · REVERSAL (won from `ALL HANDS`, or lost from a clean start) · NEAR-DEATH (survived at 1 HP / SAVE success) · BOND moment · TURN event · LEGENDARY/`WEIRD` kicker · 95%??? · trait chain (≥ 2 triggers in one beat) · generic death.
**Evidence thresholds (suggestions to judge the design, not targets to tune):** ≥ 70 % of PLAYs have ≥ 1 memorable event, ≥ 25 % have ≥ 2 · ≥ 80 % of the catalogue's event ids appear at least once in 200 PLAYs · no single event id > 20 % of all memorable events · outcome spread for *careful*: clear win 50–75 %, never ≥ 90 % · outcomes differ across crews for the same job (crew choice matters) and across seeds for the same crew (variance exists) · HIT ONE MORE: greedy loses the pot in a large minority of climbs and ≥ 1 in 8 climbs shows a jackpot; careful take-rate < greedy · loss-sting proxy: P(failed routine PLAY leaves > 2 Ogas away) = 0, median nights lost per failure ≤ 3 · **hard invariants over all 200 (and a 5 000-seed smoke):** named `GONE/DEAD` = 0 outside accepted BIG PLAYs; identical output on rerun; replay equals live.
**Ablations (prove the design, not the noise):** re-run the 200 with (a) traits/bonds/stories off → memorable rate must fall clearly; (b) COOL/PRESSURE off (flat) → outcome variance/reversal rate must fall; (c) formation forced random vs. AUTO → lane choice must move outcomes. **Deliverables:** `summary.json`, `plays.csv`, `digest.txt` with the 10 best and 10 worst stories in plain prose for Ube/Overlord to read.

---------------------------------------------------------------------------------------------------------------------------------

## J. SOURCE_REQUIRED / CANON_COLLISION

1. **CANON_COLLISION — permadeath.** Vol 7 §0: *"No one close to Rich is ever confirmed dead before fame; the lost are GONE"*; §6.4: *"GONE is never confirmed death… always the player's fault, never random."* Ube's locked decisions allow (a) generic Ogas dying suddenly and (b) named Ogas dying only on a knowingly accepted BIG PLAY. (a) is defensible if generics are "not close to Rich" (they are "thinner characters by design") and use a separate `DEAD` status; (b) directly collides with the guard. **Safe default in this spec:** BIG PLAY named loss resolves as **GONE** (no confirmed death) behind a switch `bigPlayNamedOutcome: GONE | DEAD`; Overlord/Ube must rule whether the guard is amended before `DEAD` for named is enabled.
2. **CANON_COLLISION (roster cap).** Vol 7: *"6 named; recruit up to 8"* ⇒ at most **2 generic seats**, which fits neither frequent generic deaths nor turning. Needs a ruling: raise the generic bench (e.g. to 4) or keep 2 seats and make recruits scarce.
3. **Vol 7 §3.2 job cards show ODDS "plain words + a %".** New direction wants low density and no %. Spec uses plain words only (RISK word); % optional in DEV. Confirm.
4. **Naming collision:** in-PLAY **COOL** (a bar) vs HEAT tier **COOL** (0–29). Recommend UI copy "COOL" for the bar and "HEAT: LOW/WARM/HOT/ON FIRE" for the candle; or rename the bar.
5. **SOURCE_REQUIRED — JUGGED.** Not in any source. Defined here as "held by the law (Officer Nodd territory), bail or 2 nights, never permanent". Needs authoring: who, what bail, any Nodd reaction.
6. **SOURCE_REQUIRED (unchanged from F01):** OCTOPUS BRAIN's "three context tricks" and each job's OCTOPUS plan; ITEM/gear; SEEN IT ALL (inert: no PANIC); RAIN/night-modifier math; FULL MOON werewolves; F02 gun conflicts (LIL OGA range, SAPPORO "hits two"), JOLLOF burn scale, TOMMY TONY consecutive bonus; HAND BACK / December / final report-card wording (sealed).
7. **SOURCE_REQUIRED — content:** vampire THIRST moment text, generic quirk pool, WEIRD finds list, BIG PLAY exclusive prize table, TURNING flavour lines.
8. **Turning limits** (never named humans, cooldown, outcome list) are design proposals; Ube approved the mechanic, not these bounds.
9. **Ownership seams:** F04 must remap its job menu (RUNS + SHOWDOWNS → PLAY shapes) and add `JUGGED`/`DEAD`/`WOUNDED`/`SHOT` statuses (`RACrew.registerStatus`); F02 grant path for loot guns and gated acquisitions; F13 owns every number.
