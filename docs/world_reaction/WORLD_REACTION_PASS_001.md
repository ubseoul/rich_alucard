# WORLD REACTION / CONSEQUENCE PASS 001 — Rich Alucard: Before the Fame

**Status:** DESIGN + SOURCE AUDIT ONLY — **COMPLETE / PARKED.** No runtime code, data, art, audio, copy or save changes were made.
**Source audited:** Whole-Game Candidate 001, `origin/claude/amazing-darwin-s4x3o6` @ `7a3c2ee`. This is the newest full integration: F01 THE PLAY (feel lock + frozen art + no-car repair), F04 War Room, F05 THE TRAP/HOLD, F06 RAINMAKER, F13 values and the BTF life engine. `main` is older and does not contain these systems. OL-027 walkthrough fixes (`integration/overlord/pre-fcpb-walkthrough-fixes`) are not in this lineage. They don't change anything cited here.
**Not opened:** SEALED, HQ-only and PLAYER-BLIND content (`js/sealed`, RASealed tunings and fire payloads, Property and Ogun's Rave hidden beats, PROOF EVENT #001). Wherever this document touches one of those systems, it names only the hook, never the content.
**Tags:** `[WIRE]` connects state that already exists, with no new words · `[COOK]` needs words from Ube · `[SOURCE_REQUIRED]` the authored source exists but isn't in the repo, or HQ owns it · `[OWNER]` an integration/F13 decision · `[DEFECT]` the code contradicts itself (verified by grep; reported here, not fixed) · `[VP]` a Rich line that needs a voice pass. **This document writes no final lines.** Any line-shaped text below is labelled *seed* and is not canon.

---

## 1. WORLD REACTION DNA

These rules come from the reactions that already land in the game. Combat 2.0's blood-bank bill, the unfollow mail, Carlos's 🔥🔥🔥, the Import Guy's stick-shift line, Marisol on hangover mornings and Officer Nodd's 5th and 10th stops all follow them.

1. **Late, not live.** A consequence arrives *after*: the next WAKE, the next visit or the next time someone texts. It never comes as a popup in the moment. Morning Mail, return beats, texts and VampGram are the channels. (Blood-bank bill = next morning. Neglect text = 10 sleeps later.)
2. **Through a person, not a panel.** Someone says it, posts it, bills it or does it. A meter never moves. ("chelsea saw you get your ass beat and unfollowed" beats "−FOLLOWERS".)
3. **One line, specific, a little petty.** One noun the player recognizes, such as GLOW STICK REMOVAL — $40, the sandwich photo or the 720 bus. Never a summary.
4. **Read the save; don't add one.** A good echo is a *predicate on state the game already holds*, plus one authored string. If a reaction needs a new counter, a new meter or a new character, it fails this pass.
5. **Once is a memory, every time is a system.** Default to fire-once (`mail id` / `receipt id` / `RARelations.memory`). Repeatables need ≥4 variants and the F01 T9 rule (no repeat within 3).
6. **The world is allowed not to care.** Some of the best echoes are refusals: Don Chuy's tacos stay $3, Mom still asks if he ate, and Nodd says nothing. A rich man's world stays partly indifferent, and that contrast is the point (F04 code comment: "the contrast is the point").
7. **Never explain, never number.** This is the F01 law extended: danger is felt, never explained. No percentages, no "HEAT +12", no tier names in fiction. People act scared; they don't say WARM.
8. **Never telegraph the protected ending.** Fame is hidden by design: no meter, no warning. Reactions scale on *existing* tiers (clout, rep, net worth, HEAT tier) and must never hint at "almost famous".
9. **Respect who owns the words.** Rich's lines are [VP]. F01 lines are locked verbatim. F04's world-reaction text is HQ-sealed (Ube may overwrite Rich's line only). F05's PEOPLE NOTICE lines are OPEN but unwritten, so they are a cook window.
10. **Silence is a reaction too.** F01 owns silence-as-dread. Elsewhere, "TUESDAY. NOTHING GOING ON." is only honest if nothing happened. If something happened, the morning must not say it didn't.

**Feel-lock firewall for this pass**
- **F01 THE PLAY:** nothing inside the PLAY changes: not the feed, calls, return scene, lock screen, ≤12 bubbles, Rich's "hello?/hello??", or the locked Ube lines. Echoes live *outside* the PLAY and consume only the canonical `F01.play_result`. Exposing more of what F01 already computes (§4 C1) is an additive contract field and an F01-owner change.
- **F06 RAINMAKER:** the core, tunables and renderer are approved byte-for-byte. Echoes may read only F06's persisted state (`completed`, `spent`, `bestRainScore`, `lastResult`) and must fire elsewhere: mail, texts, VampGram, other scenes. They never fire inside MAKE IT RAIN.

---

## 2. CURRENT REACTIVITY MAP — what already remembers Rich

### 2.1 Channels (all existing, all reusable)
| Channel | API | When the player sees it |
|---|---|---|
| Morning Mail | `RALife.mail(card)` → `life.clock.mail` | WAKE card stack (bedroom), tap opens an app or adventure |
| Weekday line | `life_clock.js` `weekday` @999 | Last card every morning; "NOTHING GOING ON." if no other mail |
| Return beat | `life.clock.returnBeat` (adventure `end.home`) | One line on the bedroom after an outing |
| Texts / DMs | `RALife.text(thread, from, body, {choices})` | TEXTS / InstaHoe, with reply choices + `fx` |
| VampGram | `RAVampGram.post` · `RAVampGramAPI.post(handle)` · `ambient()` | Feed (save-reading ambient posts + elder comments by rep tier) |
| Receipts | `RALife.receipt` → RECEIPTS app (memoir, share → followers) | Also rolled in a protected sequence (not detailed here) |
| Memory log | `RALife.remember` (every adventure end) | Feeds COOK A SONG titles (`RAMusic.memories`) |
| Person memory | `RARelations.memory/remembers/flag` | Only one consumer today (Shannon, `systems.js:55`) |
| Bedroom overlay | `RABedroomCompany` (props, rain window, company) | Owned props; one companion per WAKE (woman / homie on floor / cat / Mazda) |
| Castle micro-scenes | THRONE, MAID, COFFIN, FISHTANK, GARAGE_VIEW, HOOKAH | Already branch on `hungover`, cars owned, fish owned |
| Temptations | `RATemptations` (WAKE, 1–5 sleep life, `expired` "come back changed") | VampGPT WHAT WE ON, invites, texts |
| WAKE triggers | `RAWakeTriggers.define` (one world interruption per morning) | e.g. A57 Officer Nodd when `noddPending` |
| Night report | `RAWakeBus.nightReport.contribute` | **Built every night; never shown (see M2)** |

### 2.2 What already reacts (and works)
- **Money:** $100K BUDGET mail on month day 1; SHANNON FRIDAY rent mail; BLOOD BANK BILL after a defeat; F05 TRAP NIGHT REPORT / COUNT THE MONEY / "numbers look light."; RICHBOIMPORTS unlocks at $500K net worth (NEW APP mail).
- **Ownership:** bought rooms and cars write memory + receipt; props draw in the bedroom; GARAGE_VIEW counts cars; FISHTANK counts rare fish; Import Guy's line changes after A13; URUS in the Grave Garage → viral post + follower spike + `RANodd.after('urus')`.
- **Relationships:** MET→COOL→CLOSE→RIDE-OR-DIE (hidden); 10-sleep neglect text ("it's cool. it's whatever."); `stayedOver` / `lastCloseDate` put her in the bedroom next morning; companions fight with you at CLOSE+; injured-companion text after combat; Carlos mutual comments 🔥🔥🔥 / unfollows (NEW OGA).
- **Combat:** defeat → bill + unfollow mail + memory + chaos light; companion hurt text; Lil Smack counter cameos at Peking.
- **Clout / rep:** VampGPT "clout still low"; Tokyo "almost. not yet." at rep ≥2; elder comment ladder `cute → go off young man → respect, Rich → Mr. Alucard.`.
- **World pressure:** ecology headlines (BAT SIGHTINGS… / HUNTER SEEN ON SUNSET) once per level.
- **Calendar:** rain/full-moon mail, rain window art, Wispa stays longer in rain, Halloween / Thanksgiving content, family thread every Sunday.
- **THE PLAY → world:** bank, HEAT (district + 30% global), crew statuses, story seeds → RACrew stories, recruits, per-car drive count, War Room job log + report card → @whosrunninLA post (placeholder caption).

---

## 3. MISSED ECHOES — the game knows, but barely says

Ranked by how much the player loses. Every row was verified in source.

| # | What the game knows | Where it's written | What reads it | Gap |
|---|---|---|---|---|
| **M1** `[DEFECT]` | Ogun's Rave is done | game writes `life.world.flags.ogunsRaveCompleted` (`ogun_rave.js:29`) | F04 offer reads **`ogunRaveDone`** (`F04/wake.js:20`) | Nothing ever writes `ogunRaveDone`, so the War Room offer can never open organically. Tests seed `offer.status='accepted'` directly. |
| **M2** | Last night's War Room and Trap summary | `nightReport.contribute` (F04 @30, F05 @40) | nobody calls `nightReport.last/consume` | Built every night, never rendered. |
| **M3** | A PLAY happened tonight (crew shot, car lost, bag counted) | F04 consume → job log / report card | Morning Mail: nothing | The next morning can read **"TUESDAY. NOTHING GOING ON."** after the crew got shot. That breaks DNA rule 10. |
| **M4** | F01 already picked an authored, outcome-matched @whosrunninLA line (`vg:clean/brag/messy/costly/fail/greed`, 4+ variants each) | `engine.mjs:1227` `morning().vg` | not in the result contract | F04 posts a placeholder ("ARTS DISTRICT — clean run. +$X"). The authored line dies in the engine. |
| **M5** | F01 crew aftermath texts (`text:down`, `text:captured`, `text:thanks`, sandwich photos, the 720 bus…), nicknames, district line, next temptation | `morning()` | F01 lock screen shows **only `texts[0]`, in memory** (`feel-ui.mjs:83`). `nicks`, `flags` cross the wire and F04 ignores them | Most of the crew's after-life is authored and never seen. |
| **M6** | War Room accepted → Nodd stares; Nneka goes quiet; Bllad33 has a hookah line | `F04/vampgram.js` sets `noddStaring`, `nnekaSilentPending`, `bllad33HookahPending` | **no reader** | A57 Nodd, DATE (Nneka) and HOOKAH already exist and are the obvious readers. |
| **M7** | Trap is live → Nneka, Bllad33, Tristan, Mom's group chat, Carlos each "notice" once | `F05/reactions.js` marks seen; `hooks.onReaction` | **no hook installed** | Records the reaction day; no one ever speaks. |
| **M8** | Story flags from authored calls: `MADE_US_STAY`, `PULLED_US_OUT`, `LEFT_SOMEONE`, `RICH_WENT_QUIET` | `result.flags` | nobody outside F01 | The crew remembers how Rich called it. The world never does. |
| **M9** | A car was wrecked or impounded in THE PLAY | F01 embed `world.garage.lost` | Life `ownership.cars` is untouched (F04 "never mutates vehicle ownership") | A Supra wrecked tonight can still be picked in TOUGE, GARAGE_VIEW and the passenger seat tomorrow. |
| **M10** | Global HEAT hit ON FIRE | F04 `heat_crisis`, F05 `flags.onFire`, `ra:heat-tier` event | no world reader (F13 S2: nothing past ON FIRE) | HEAT tiers have no fiction outside the War Room/Trap UI. |
| **M11** | Rainmaker lifetime spend, sessions, best rain score | F06 `spent`, `completed`, `bestRainScore` | nobody. F05 THE BING reads `F06.status==='big_tipper'`, which **F06 never writes** | Money thrown at the club leaves no trace, and THE BING sales channel is permanently locked. |
| **M12** | Fame arrived | fame writes `life.momentum.fameFired` | F04 `fame-close` reads **`life.fame.arrived`** | `[DEFECT]` The War Room never closes on fame as Vol 7 §9 intends. |
| **M13** | Rich's rep tier as an honorific | `RALife.elderName()` (`baby / young man / Rich / Mr. Alucard`) | **no caller** | A ready-made, authored address ladder that nobody uses. |
| **M14** | Adventure choices | `records[id].picks` saved at completion | nobody | Every fork Rich takes is saved and never remembered. |
| **M15** | Underworld life | PLAY, Trap and Rainmaker write **no receipts and no memory log entries** | RECEIPTS app, COOK A SONG | Rich's memoir is missing his biggest nights. Songs can't be cooked about them. |
| **M16** | Family thread | fixed 8-message rotation (`w1_opening.js`) | — | It's blind to state: "who is she" fires with nobody met, "u got a castle" fires forever, and nothing reacts to the Urus. |
| **M17** | Money scale | VampGPT "you got $X… clout still {tier}", money-lane intro "you got a budget. but ok:" | — | The same words at $100K and $3M; "clout still crazy" reads wrong. |
| **M18** | `hpBruise`, `noddAfter` | rewards / `RANodd.after` | nobody | Minor: written, never read. |

---

## 4. TOP 20 CONNECTION BOARD

Scores: **Soul** (how much it makes Rich feel watched, remembered and changed) / **Scope** (XS = one predicate + one string; S = a small handler on an existing channel; M = a contract field or a cross-fragment hook). "Words" means who supplies the text.

| Rank | Connection | Existing state → existing channel | Soul | Scope | Words | Tag |
|---|---|---|---|---|---|---|
| **C1** | **@whosrunninLA posts F01's own authored line.** Add `vg` (the string F01 already picks) to `F01.play_result`; F04 posts it instead of the placeholder caption. | `morning().vg` → `RAVampGramAPI.post('whosrunla')` | ★★★★★ | M (additive contract field, F01-owner) | already authored (F01) | `[WIRE]` |
| **C2** | **The morning after a PLAY isn't "NOTHING GOING ON."** Render the night report (M2) as one Morning Mail card, e.g. "WAR ROOM · rough night". | `nightReport.last()` → `RALife.mail` at WAKE | ★★★★★ | S | existing F04/F05 section text | `[WIRE]` |
| **C3** | **Crew texts land in TEXTS, not just the lock screen.** Write `texts[0..n]` from the PLAY into the named Oga's thread (Tunde/Dre have BTF threads already). | `morning().texts` → `RALife.text(ogaId,…)` | ★★★★★ | M (field + F04 consume) | already authored (F01) | `[WIRE]` |
| **C4** | **Officer Nodd stops nodding.** A57 reads `noddStaring` and swaps the nod narration for a stare variant. | `noddStaring` → A57 lines | ★★★★★ | XS | HQ-sealed (Vol 7 §2) | `[SOURCE_REQUIRED]` |
| **C5** | **The crew crashed at the castle.** The morning after a PLAY that Tunde or Dre returned from READY, `bedroom-company` may pick them asleep on the floor. Frozen `asleep_floor` art already exists. | F04 job log (`ogas`, result) → bedroom company candidate | ★★★★★ | S | none (visual) | `[WIRE]` |
| **C6** | **Fix the Ogun's Rave handshake** (M1) so the War Room offer can actually arrive. | `ogunsRaveCompleted` → F04 offer check | ★★★★ (gate) | XS | none | `[DEFECT]` |
| **C7** | **Bllad33's hookah line.** HOOKAH reads `bllad33HookahPending`, plays one line and clears it. | `bllad33HookahPending` → HOOKAH `hang` | ★★★★ | XS | HQ-sealed | `[SOURCE_REQUIRED]` |
| **C8** | **Nneka goes quiet.** DATE (who = nneka) reads `nnekaSilentPending`; the moment node uses a quieter variant once, the way `smackAtPeking` already does. | `nnekaSilentPending` → DATE `moment` | ★★★★ | XS | HQ-sealed | `[SOURCE_REQUIRED]` |
| **C9** | **PEOPLE NOTICE the Trap.** Install `RAF05.hooks.onReaction` to deliver one text each over separate mornings (Tristan, Bllad33, Carlos as a VampGram comment, Mom's group chat in FAMILY, Nneka in DM). | F05 reactions → `RALife.text` / VampGram | ★★★★★ | S | **Ube** (OPEN, unwritten) | `[COOK]` |
| **C10** | **Elders call him by name.** Use the unused `elderName()` ladder wherever an elder or vampire addresses Rich (Ogun's post, J-Circle, Duchess). | `RALife.elderName()` → existing elder lines | ★★★★ | XS per site | authored ladder | `[WIRE]` (ladder) / `[COOK]` (per site) |
| **C11** | **The wrecked car is gone from the life garage.** Mirror F01 `car.lost` as a status (AT THE IMPOUND / AT THE DEALER) on the life car; GARAGE_VIEW shows the empty spot; TOUGE greys it out. | `result.car.lost/route` → life car field | ★★★★ | M | label only | `[OWNER]` (F04 "never mutates ownership") |
| **C12** | **Receipts for the underworld.** One receipt the *first* time for: first PLAY, first car lost, first HOLD survived, first trap house, first Rainmaker session. | result / F05 / F06 state → `RALife.receipt` | ★★★★★ | S | **Ube** (captions are [VP]) | `[COOK]` |
| **C13** | **Memory log for big PLAYs** so COOK A SONG can title a song after one. Only for MESSY/COSTLY/LEGENDARY-loot or `LEFT_SOMEONE` nights. | result → `RALife.remember` | ★★★★ | XS | memory text (short) | `[COOK]` |
| **C14** | **Marisol saw the mess.** After an F04 RETALIATION → HOLD THE HOUSE at the castle, the next MAID visit gets one variant. (F05 trap raids are out: traphouse HOLD fiction is SOURCE_REQUIRED.) | F04 job log `type==='RETALIATION'` → MAID lines | ★★★★ | XS | **Ube** | `[COOK]` |
| **C15** | **The family thread notices, sometimes.** Gate 1–2 existing family slots on state (SISTER "who is she" only after a first date). Optionally add a small pool keyed to big ownership (Urus, a building). | relations / ownership → family rotation | ★★★★ | S | **Ube** (family voice) | `[COOK]` |
| **C16** | **$100K stops being news.** The BUDGET mail line varies by net-worth band (≈ <$500K / RICHBOI unlocked / far beyond). Same event, different weight. | `netWorth()` → budget mail body | ★★★★ | XS | **Ube** | `[COOK]` |
| **C17** | **VampGPT reads the room.** Fix "clout still {tier}" so it isn't wrong at MID+, and give the money-lane intro 3 net-worth bands. | `clout`, `netWorth()` → VampGPT copy | ★★★ | XS | **Ube** (VampGPT voice is canon-adjacent) | `[COOK]` |
| **C18** | **The club remembers a big tipper.** F06 lifetime `spent` past an authored threshold writes `F06.status='big_tipper'`, which unlocks THE BING (F05 already reads it) plus one mail. | F06 `spent` → F06 status → F05 bing | ★★★★ | S | threshold from the RAINMAKER OPEN patch | `[SOURCE_REQUIRED]` |
| **C19** | **ON FIRE has a face.** On the `ra:heat-tier` → ON FIRE event, once: an @whosrunninLA post or an ecology-style mail. On cooling to COOL, once: a relief beat. No numbers, no tier names. | `ra:heat-tier` → VampGram / mail | ★★★★ | S | Vol 7 / HQ (F13 S2 says nothing is authored past ON FIRE) | `[SOURCE_REQUIRED]` |
| **C20** | **How Rich called it is remembered.** When `result.flags` has `LEFT_SOMEONE` or `PULLED_US_OUT`, the named Oga's next text, or one RACrew story line, reflects it once. | `result.flags` → RACrew story / text | ★★★★ | S | F01-voice (Ube/F01 owner) | `[COOK]` |

**Honourable mentions (not top 20):**
- War Room fame-close defect fix (M12, `[DEFECT]`, XS).
- J-Circle's "somebody new is making noise downtown. cute." shown only after War Room acceptance instead of on a day rotation (XS, existing line).
- Tokyo lock line by rep (it already has two steps).
- The `noddAfter('urus')` reason read by A57 (XS, `[COOK]`).
- Adventure `picks` (M14) as a later callback key for one NPC per lane.

**Build order if HQ green-lights:**
1. XS wires with no new words: C6, C2, C5, C10-ladder.
2. Additive F01 contract: C1, C3. One contract bump covers both, plus `nicks` usage.
3. Sealed-line hooks: C4, C7, C8. Wire them dark and fill them when HQ supplies text.
4. Cook-dependent items: C9, C12–C17, C20.
5. Owner decisions: C11, C18, C19.

---

## 5. MONEY CHANGES LIFE (no new progression system)

Rich's wealth should be *perceived through how people and things treat him*. Use only thresholds and state that already exist:

| Existing signal | Already there | Make it perceptible by… |
|---|---|---|
| `$100K` monthly BUDGET mail | yes | **C16** band-based body. The richer he is, the smaller the line. |
| `netWorth()` ≥ $500K → RICHBOIMPORTS | yes (NEW APP mail) | Let that unlock be the first "the world reclassified you" moment. RICHBOI's static "browse. dream. or don't." could change once Rich owns one of its cars. `[COOK]` |
| Rep tier (LOW→CRAZY) | elder comments, Tokyo | **C10** elderName everywhere; DJ / bouncer / Shannon address him differently by tier. `[COOK]` |
| Owned props | drawn in the bedroom | Already the best "money visibly changes his room" system. Keep feeding it; no change needed. |
| Castle rooms ($40K–$400K) | rooms open scenes | Marisol (who "judges everything") gets one line per *expensive* room bought, starting with the FISH TANK ROOM, which Rich can't enter. `[COOK]` |
| Cars ($38K → $2.4M F40) | garage, touge, Nodd, viral post | Arrival matters: dates and Nodd already know the car exists (`hasCar`). One date-arrival variant when Rich pulls up in the Urus/F40. `[COOK]` |
| Spending (Rainmaker, PLAY costs, blood bank) | ledger only | Petty receipts: a monthly "ITEMIZED" style mail exists for the blood bank and could be the template for a once-a-month bank-statement joke. `[COOK]`, optional |
| Things that **don't** change | Don Chuy $3 tacos, Mom "have you eaten", the 720 bus | Protect them. They're the control group that makes the change visible (DNA rule 6). |

**Guardrails:**
- No wealth meter and no "tier up" banner.
- Bands are read silently from `netWorth()` / `money()`.
- F13 O8 (wealth outruns sinks) is a balance item. Reactions don't fix it, and they must not *reward* hoarding.

---

## 6. THE WORLD WITHOUT RICH

The game already lets the world move while Rich sleeps or is busy. These are the threads that imply life continued, and how to surface them more:

| Thread | Already moving | Surface it by |
|---|---|---|
| War Room districts | rival pressure ticks every unserviced night (`F04.rival-pressure`); districts can be lost for good (O7) | One @whosrunninLA post when a district flips to rival. Text `[SOURCE_REQUIRED]`, Vol 7. |
| Captured / recovering Ogas | F04 timers; F01 `tempt:RESCUE` lines are authored | C3: the clock ticks in TEXTS ("{a} still isn't picking up"), not only on the PLAY lock screen. |
| The Trap at night | sales, robbery, raids already mail | Working. It's the model for M2/M3. |
| Temptations | expire quietly; some come back changed (`expired` mail) | Working. Use `expired` on F01's next-temptation (RARE_PITCH: "someone else took it") `[COOK]`. |
| Relationships | 10-sleep neglect text | Working. Extend the *same* rule to RIDE-OR-DIE homies (Tristan) with one line. `[COOK]` |
| VampGram ambient | J-Circle every 4 days, Dragoon "…", Ogun "next one soon" | Gate one J-Circle line on War Room / HEAT state so the city visibly notices Rich. |
| Mazda / the cat / bedroom company | appear on their own | Working. C5 adds the crew. |
| Family | Sunday thread | C15: they live their own lives (the Falcons–Hawks argument is perfect). Keep most of it Rich-independent. |
| Ecology headlines | once per pressure level | Working. They're sealed-fired, so don't extend. |
| Lil Smack | turns up at Peking on dates | Working. Template for one cameo per lane. |

---

## 7. UBE COOK PLATE 001

**Law:** context first, never blind. Seeds are unfinished and optional; Ube can throw them out. Nothing here reveals PLAYER-BLIND or sealed content. Answers will be recorded verbatim as CREATOR SOURCE.

### UC-1 · The crew's morning-after texts (C3, C20)
**Context:** When the crew comes back from a PLAY, they already have authored texts. Some examples:
- Tunde sends a photo of a sandwich.
- Half-Pint asks if there's a bus stop near the castle.
- Auntie Grit: "Eat. Then talk."

Right now the player sees only the first one, once, on the next job's lock screen. We want them in Rich's actual TEXTS app, so the crew feels like people with phones.
**Questions:**
- Should Rich ever reply? If yes, replies would be one-tap choices like the family thread, e.g. "👍" / "leave on read".
- Is there one Oga whose texts *always* get through, even on quiet nights?
**Seeds:** ① Rich never replies; reading is the point. ② Two-option replies, and "leave on read" is remembered. ③ Auntie Grit texts the morning after *every* rough night, no matter who was there.
**Need back:** a rule for replies (none / emoji / choices). Optionally, the always-texting Oga.

### UC-2 · People notice the Trap (C9)
**Context:** When Rich's first traphouse is running, five people are *supposed* to react once each: **Nneka, Bllad33, Tristan, Mom's group chat, Carlos**.
- The system already records the moment each of them "notices", but nobody has ever written what they say.
- Existing flavour to anchor on:
  - Nneka tells Rich the jollof is wrong and finishes the plate.
  - Bllad33 tells half-stories about his Michigan dorm.
  - Tristan is the passenger-seat commentator.
  - Mom asks if he ate.
  - Carlos comments 🔥🔥🔥 or unfollows.
**Question:** one line each. Delivery would be a text/DM; Carlos's would be a VampGram comment, and Mom's would go in the FAMILY thread.
- Does anyone *not* say it out loud, and just act different instead?
- Should Mom's group chat know *what* it is, or just know *something* is up?
**Seeds:** Mom forwards a news-anchor video with no caption. Carlos unfollows, then refollows. Tristan asks for a job. *(Seeds only.)*
**Need back:** up to five lines (or "silent" for any of them), plus who knows what.

### UC-3 · The receipts of a gangster life (C12, C13)
**Context:** RECEIPTS is Rich's memoir app. Every big life moment becomes a little photo-card with a caption, like "the ladder. never again." or "the s15. mine." Right now **none** of these write a receipt:
- THE PLAY
- the Trap
- holding the house
- making it rain

So his biggest nights aren't in his own memoir.
**Questions:**
- Should they be in there at all? Or does Rich keep that life *out* of the memoir on purpose?
- If they belong: which "firsts" earn a card, and what's the caption tone?
**Seeds:** ① Yes, but captions are deliberately vague ("a long night. the car is fine."). ② No, and the *absence* is the joke. ③ Only the bad nights get receipts.
**Need back:** in or out. If in, which firsts, and captions (or a tone note; captions stay [VP]).

### UC-4 · $100K stops being news (C16, C17, §5)
**Context:** On the first of every month, Rich's phone says "**$100,000 landed. new month.**" It says exactly that whether he has $40K or $4M. VampGPT also always opens with "you got $X… clout still low… we got options though."
**Question:** how should the same message *feel* when Rich is rich-rich? Pick a direction, or write 2–3 versions keyed to "regular / RICHBOI-rich / absurd".
**Seeds:** ① It gets shorter ("$100K. ok."). ② It gets petty ("$100,000 landed. you spent that in the club last tuesday."). ③ It never changes, and VampGPT is the one who changes ("you good. you don't need me.").
**Need back:** a direction, plus lines if you want them.

### UC-5 · The control group: what never changes? (DNA rule 6)
**Context:** Some things should *stay the same* however rich or notorious Rich gets. That's how the player notices everything else moving. Today, three things are naturally constant:
- Don Chuy's tacos are $3.
- Mom asks if he ate.
- Officer Nodd doesn't talk.
**Question:** which 2–4 things in Rich's world should be *sacred and unchanging* (people, places, prices, rituals)? Is there anyone who should treat him **worse** as he gets richer?
**Need back:** the protected list. Optionally, the one person who's unimpressed.

### UC-6 · Marisol saw the mess (C14)
**Context:** Marisol is the maid Rich hires. Her room's tagline is "SHE JUDGES EVERYTHING." On hangover mornings she's already put water on the armrest and shut the curtains. Sometimes the crew defends the castle at night in a fight Rich watches from bed through the group chat.
**Question:** the morning after the castle got defended, what does Marisol say or do? Should she also have one opinion when Rich buys an expensive room (the Fish Tank Room he can't even walk into)?
**Seeds:** a broom leaning on the throne, no words. *(Seed only.)*
**Need back:** one line or action per case, or "she says nothing".

---

## 8. OWNER / HQ ITEMS SURFACED (not decided here)

- **[DEFECT] M1** `ogunRaveDone` vs `ogunsRaveCompleted`. The War Room offer is unreachable organically.
- **[DEFECT] M12** `life.fame.arrived` vs `life.momentum.fameFired`. The War Room never closes on fame.
- **[OWNER] C11** Should F01 car loss mirror into life ownership? F04 currently refuses by design. Car recovery price is still F13 S1.
- **[OWNER] C1/C3** F01 result contract additive fields (`vg`, `texts`) are an F01-owner contract bump.
- **[SOURCE_REQUIRED]** F04 world-reaction lines (Nodd stare, Nneka quiet, Bllad33 line, the "…who is he working with." placeholder): HQ-sealed, Vol 7 §2.
- **[SOURCE_REQUIRED]** BIG TIPPER threshold (RAINMAKER OPEN patch, THE BING) and HEAT past ON FIRE (F13 S2).
- **[SOURCE_REQUIRED]** Traphouse-specific HOLD fiction (so no castle-staff echoes for F05 raids).

**PARKED.** Next step belongs to HQ: green-light the XS wires, route the two defects, and send UBE COOK PLATE 001.
