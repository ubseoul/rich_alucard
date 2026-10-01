# F07 — M8_AND_FINALE (M8 THE TURF WAR + the finale "NEW OGA")

Fragment `js/frag/F07/**` · flag `F07.m8_and_finale` (reserved by IF-1; **dark by default**, promotion is the integration owner's job).
Base: F03 FINAL `78557ce46569aa57efa08c95cfc643bd0b56f36b`. Source: `Rich_Alucard_PLAYMAKERS_Patch1_NEW_OGA.docx` (Source Vault V1.1 `e76f840`) §3 M8, §4, §5, §8 — read directly.
No SEALED material was opened. No F03, F01, F04 or accepted-lane file was modified (only the stale F07-parked guard in `tools/tests/if1/convergence.test.mjs`).

## What it does
**M8 (`NEW_OGA_M8`)** — WAKE voice note at the reserved priority **77**, after M7. Normal PLAY / Showdown-class (never a BIG PLAY) on F01's PLAY seam (`RAShowdown.play.launch`): job `smack_crib` (Lil Smack is there), or `car_wash_stickup` (LIEUTENANT leads) while the existing `lilSmackGone` flag is set. Roster = 3 of Gbenga's boys ON LOAN (`RACrew` units owned by F07, never a War Room slot) + any ACTIVE Ogas. F01's own auto-carry / crew rules apply untouched. Choices: GO MYSELF / SEND THE BOYS (back-out). Win: authored **$18K** + **+12 HEAT** (through the lane's `heat`, which `RAHeat` reads). A loss resolves nothing (TRY AGAIN). A refusal (no car, F01 off) resolves nothing; SEND THE BOYS or NOT YET.
**State contract:** resolution writes `life.newOga.m8Resolved` (+ `m8Outcome` `win|send_the_boys`) — exactly what F03's `m9Ready` reads. Proven by running M8 and then the real WAKE arbiter delivering `NEW_OGA_M9` (no fixture).

**Finale (`NEW_OGA_FINALE`, priority 72)** — the WAKE after F03's VampGPT `…SAY LESS.` (`finaleBegun`). Plan: pick 3 of THE OGAS / SHANNON / MAZDA / PINKY / TRISTAN / CARLOS (only if walked in at M4) / SENATOR (only if `senatorCommands`). Phase 1 THE PARTY = F01 PLAY (`car_wash_stickup`: ENFORCER/CHEWER + one LIEUTENANT, §8). Phase 2 THE OFFICE = Combat 2.0 vs `gbenga` (`gbenga_combat.js`: enemy card + IF-1 boss-script seam): HP 260 / 320 high trust, AGBADA SWEEP 24, VOICE NOTE (interruptible only by REVENGE / DEAD RINGER), "MY SON" heal 30 + strips buffs, GOLDEN DRACO 2×20 below 30%, 50% Mama Gbenga phone line + lost turn; OCTOPUS: RETIRE, UNCLE (needs leftovers) → THE BLESSING, WORK FOR ME (needs high trust) → THE CONSIGLIERE, ROAST (two lost turns); winning → THE TAKEOVER.
Every ending: rank 6 NEW OGA, Koreatown + Inglewood CONTROLLED by Rich (`RADistricts`), War Room starts (queued while F04 is dark), GBENGA ENTERPRISES → RICH ENTERPRISES, Gbenga's boys offered as recruits, §5 fame: the three headlines ride the receipt roll, a SPARK exists, and `fameEligible` is set on the first sleep with Day ≥ 25. TAKEOVER calls F03's `RANewOgaLadder.returnTribute()` (car returns); BLESSING/CONSIGLIERE leave it tributed. BLESSING posts Gbenga's authored VampGram line; CONSIGLIERE sends "Hello. Hello. Oga. Hello." every 7 days.

## Interpretations (flagged, all in `tunables.js`)
* "Cost: $18K" is read as the authored **job pay** (Patch 1 §8 "Job pay … M8 $18K"); flip `AUTHORED_PAY` handling if the creator meant a cost.
* F07 pays the authored $18K / +12 HEAT; the PLAY's pot and HEAT are not added (no duplicate rewards, same rule as F04). Only crew results and the PLAY's cash spend are applied.
* Phase 1 roster is always the ACTIVE Ogas (the only squad the PLAY has); the lane picks are recorded in `finaleCrew`.

## SOURCE GAPS
NON-BLOCKING (nothing invented; placeholders named):
1. M8 Gbenga job text / reaction voice note: none authored → narration restating §3 only. No voice notes (per ruling).
2. Shannon: no spoken lines authored in OPEN source → on screen with the authored §4.1 sentence as narration only. Required Shannon dialogue: none required by the flow.
3. Lane mechanics (§4.1): effects of SHANNON/MAZDA/PINKY/TRISTAN/CARLOS/SENATOR are not authored → recorded, shown, no combat effect.
4. Back-out cost of SEND THE BOYS is not numeric in source ("always costs something") → trust −1, no pay (F07-TUNABLE).
5. Gbenga's pattern order, VOICE NOTE telegraph text (uses the authored VOICE NOTE pose), clout/trust for a win, recruit count/names/classes, loan-squad names/classes: not authored.
6. Phase 1 canopy-pole collapse + aunties (non-combatants blocking fire) need new F01 PLAY job content; F01 is frozen → narrated only. Needs an F01 content ticket.
7. OWAMBE warehouse condition art / repainted sign (GBENGA faintly visible): no frozen art; existing `gbenga_rentals` env used.
8. §6 Mister December "visits as an equal" scene: Vol 7 / F04 content, out of §3–§4 scope; the War Room does begin.
9. If THE OGAS lane is not picked, who fights Phase 1 is unauthored (default: the Ogas).
BLOCKING: none.

## Risk worth an owner decision
After M9 GIVE IT, F01's rule "no car refuses the job" applies at Phase 1: with no remaining car that seats a 3+ crew (S2000 alone does not, `NO_CAR_FITS`) the finale waits (NOT YET) until Rich owns a fitting car (e.g. Urus). Nothing is invented as a loaner.

## Tests
`node tools/run-tests.mjs --fragment f07` (real F01 engine as PLAY host, real Combat 2.0 rules, real F03, WAKE arbiter, save/reload) · `node tools/tests/f07/browser-path.mjs` (real Chromium: M8 via the real PLAY iframe, SEND THE BOYS, finale + real Combat 2.0, reload).
