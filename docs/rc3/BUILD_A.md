# RC3 Build A — OL-074 / OL-075 / OL-076

Base: `origin/integration/rc2` (`ae87ec401f5d73063e2408cf5601bd1f1eba3cb8`). Branch: `rc3/cut-001`.

## Chapter map

| Chapter | Ordered beats | Daily action |
|---|---|---|
| Prologue | THE GOLDFISH YEARS → CEO fight → castle | CEO fight |
| Ogun's Rave | Invite → rave → BLAD33EE crashes → fight → home | BLAD33EE fight |
| New Oga ladder | JUG THE PLUG → THE INTERVIEW → CANOPY DUTY → SET UP CARLOS (or THE ALTERNATIVE) → THE OWAMBE COLLECTION → SENATOR → DINNER AT GBENGA'S → THE TURF WAR → THE TRIBUTE → VICE PRESIDENT → VAMPGPT | Authored fight/PLAY; PROTECT THE CREW fills a dialogue-only day |
| Finale | NEW OGA → Gbenga | Authored finale PLAY/fight |

VampGPT gives one next action: story → fight/PLAY → COLLECT CASH → STRIP CLUB NIGHT → SLEEP. One ladder beat per day. The opening day includes the compact prologue and rave; subsequent days have one ladder beat. Optional content never fills or blocks the story step. The finale remains reachable without a car, unrelated friends, property purchases, ramen work or The Trap.

## Phone and cuts

Exactly nine tiles: VampGPT · Texts · War Room · Strip Club · Armory · Bank · Maps · Rich Radio · VampGram.

Only the next story notification is surfaced. Other messages remain silent badges. Maps has the 20 optional scenes in editorial rank order; wake triggers, Texts invitations and VampGPT cannot launch them. The Trap is disabled even if an old save or feature override tries to enable it. Non-stripper dates and 94 disallowed adventures are rejected at the shared adventure entry point; the 12 stripper scenes retain their existing thresholds and one-date-per-wake rules. No frozen art or content file was deleted.

[CUT_LIST.md](CUT_LIST.md) contains titles only: 51 kept, 95 cut, including the standalone rave and The Trap. [ADVENTURE_RANKING.md](ADVENTURE_RANKING.md) ranks all 114 optional/legacy adventure entries (20 kept, 94 cut). Mandatory spine, Armory, ramen and stripper scenes are outside that ranking.

OL-075: visible hunter name BLAD33EE; Rich says exactly "oh shit, that's Blad33ee!". Historical asset identity stays intact.

OL-076: War Room has jobs → existing crew picker → GO, with role/squad calculations backstage. Ramen is its sole day-job route. Bank shows one aggregate rental-income line, one rental purchase and the $250,000 Party Hall goal; other property/room tiers are inaccessible. Move swapping is folded into Armory. Host combat/resource meters run silently; cash is always visible. Mechanic coaches persist a once-only acknowledgement across save/reload.

Build B handoff: the strip-club canvas still displays its legacy CROWD/score/spent/wasted counters in this Build A screenshot. Build B owns the club, minigames and PLAY presentation and must reduce those to cash + club hype under OL-076. Build A does not alter the frozen club core or PLAY UI. The host cash overlay is ready.

## Economy

RC2 starting cash ($40,000), rental rates, first-club discount and cap are unchanged. The removed income routes leave dialogue-only days without club funding. A once-per-day receipt tops up successful story + action earnings to $15,000; existing authored income counts toward that amount. Duplicate collection is refused. Purchases require an additional $5,000 club reserve. Party Hall no longer depends on the cut first-castle-party scene.

[economy.json](economy.json) traces the canonical no-side-content ladder with $5,000 club spending each night. Balance grows from $40,000 to $153,000 by the VampGPT pre-finale beat. Tests also verify the Party Hall can be bought at $255,000 while leaving $5,000. This is a club-funding floor, not a grant on entering an optional scene or repeated fight.

## Validation

Full `npm test` transcript: [full-test.log](full-test.log). RC3 regression verifies all cut entry points, Maps-only admission, one daily cash receipt, canonical ladder order, nine apps, Trap override rejection, Armory move swapping and the reachable Party Hall goal.

Actual browser path at 390×844, fresh storage, normal animation timings, real clicks and combat: prologue → CEO fight → rave/BLAD33EE → collect cash → club canvas throws → home → sleep → day 2 → Jug the Plug. No patched saves or debug wins. First fight: **21.235 seconds at automated tap pace** (not a human reading-time measurement). Day 1 complete, day 2 mission started, no browser errors. [browser-path.json](evidence/browser-path.json), screenshots in `evidence/`.

Failures found and fixed: obsolete old hunter-line assertion; absent historical commit in the narrow clone (fetched normal remote history); obsolete separate-property-tile assertion; rave overlay hiding combat controls; Party Hall depending on cut content. Earlier browser harness timing failures were repaired and the complete fresh path rerun successfully.
