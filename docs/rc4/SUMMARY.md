# RC4 Stove B — current experience and asset review

**Review plan only; no runtime repair, new writing/art, balance change or RC4 acceptance.** Runtime `4981d5245d0600c062a7f431acd8253dc28b9cc6`, continuing audit `55b7f9c34ef0632f181f339ad0bf29b5c4e9ebe5`, branch `rc4/comb-audit`. The original Stove A summary follows as historical context. Commit identity is recorded by Git and the delivery receipt rather than a self-referential hash in this commit.

## Failures first — ten new or strengthened findings

1. **042 / P1:** Range Day never refills ammunition after reload; meaningful play stops after the first magazine. Full50s and isolated4-shot/wait probe confirm it.
2. **034 / P1:** QUIT permanently loses the one-time Jollof final, even before cooking. Cancellation needs a reversible route.
3. **001/002 / P1 retained:** supplied-van M4 and fresh M8 PLAY still conflict with removed personal-car access. Existing mission loans/adequate seats are the smallest complete repair; no new car-shop system required unless ownership/tribute retained.
4. **003 / P1 retained:** public ending trigger remains disabled; seeded ending dialogue is not a naturally completed campaign or confirmed OL-079 integration.
5. **015/014 strengthened:** actual Roxy “first to five/no biting” spar offers Blood Bath/Bite/lethal HP grammar; cash overlaps enemy label and strategic resources are hidden.
6. **037/009:** Phil progresses twice on one day after Maps overwrites the authored daily guard; multi-day joke becomes repeated taps.
7. **009:** A54 winning follow-up cannot start A56 through Maps-only policy. It safely returns home but drops the authored payoff.
8. **036:** cat/Mazda choices assume companions with cut acquisition; repair option/cast premise rather than restoring pets wholesale.
9. **039/035:** food receipts disagree with chosen events, and clear scene narration is tagged as NPC speech. Use existing result/narrator fields; preserve protected lines.
10. **040/038:** Emerald’s initiative choice goes to one response; Gbenga’s pivotal patio conversation becomes synopsis. Honest choice response is repair; reciprocal patio exchange is optional depth.

041 additionally identifies inconsistent caller QUIT→forced retry or fictional completion. Actual optional PLAY failed/settled with report card, two DOWNED and heat+2 while daily action stayed false, strengthening017 without touching protected odds.

## Coverage and continuity

524 inventory rows: **PLAYED 9; INSPECTED WITH FIXTURE 228; SOURCE-ONLY 171; BLOCKED 10; CUT 106; NOT REVIEWED 0**. These are source/fixture classifications, not524 played scenes. 331 authored nodes,51 allowed definitions,94 cut definitions;144 requested visual checkpoints, all12 date scripts read,10 date paths completed after threshold fixtures,2 combat-boundary paths continued from labelled checkpoints. The ordinary9 rows cite unchanged Stove A coverage. No natural full campaign or21-day playthrough claimed.

Rich/Gbenga’s ladder, loyalty test, entrusted Senator and leftovers gate are coherent and consequential; patio reciprocity and visible later acknowledgement deserve bounded depth. Roxy has recognizable chemistry but objective spar/item/pet contradictions. Rosalyn’s concealed-self/glasses/roach/kiss arc earns its place, including quietness. Emerald’s duty/help/recital arc works; initiative and performance focus deserve attention. Mandatory spine source floor is Day13 (alternate14), while authored fame floor25 and disabled endpoint conflict with~21goal. Optional time and the original Day31 money/Day37 reports are not newly reproduced natural runs.

## Asset and minigame verdicts

**BROKEN LOAD0 observed** in144 samples; **mandatory NEW ART REQUIRED0 established**. Current frozen library/exam/dining/patio/Jollof boards already ship. Six principal approved-reuse groups: Carlos states, Carson chairs backing, Senator states, Armory/Hilt Range frame, Rich apron ramen counter, rave world. Combat/Jollof HUD staging and watcher/recital focus are bounded code work; seven optional candidate families in ART_QUEUE await creator choice, not seven missing files. FX approval provenance remains unresolved022. Approved F15 single poses stay KEEP.

Club KEEP/REFINE; ramen KEEP/REFINE; chairs REPLACE PRESENTATION; rave REFINE PRESENTATION; Range REPAIR RELOAD then REPLACE PRESENTATION; Owambe REFINE/SCOPE DECISION; Senator REFINE/SCOPE DECISION; Jollof KEEP/REFINE with cancellation/chain repair; Touge REFINE/SCOPE DECISION after access; PLAY KEEP/REFINE with transport/credit seams. Actual meaningful controls/results and unplayed upper tiers are detailed in MINIGAME_HANDS_ON. No listening study claimed.

Blood Bath/Bite/Revenge briefs are source/access ready, pending FX provenance/timing/creator approval. Gbenga now has actual fight placement captures; its candidate state/FX treatment remains unapproved. New target/chair/prop art is optional after reuse and logic repair. Both unchanged-byte reference ZIPs and their manifests are supplied.

## Five builds and required decisions

R1 required-play access/checks → R2 endpoint/consequences/economy/Maps guards → R3 club/date coherence → R4 minigame reload/cancel/results/presentation → R5 signature combat/music. DEPTH_MAP separates **A necessary repairs** from **B optional depth**, assigns owners/effort/resources, dependencies and shared-file conflicts. All future repairs require full npm test + one390 smoke.

Ube/Overlord decisions: OPEN ending/OL-079 authority and21-versus25 pacing; mission loans versus retained car ownership/tribute; Hall’s one payoff and NAH grant consequence; retained adventure/minigame roster/no-mod medals; literal half-off and bounded spar; pet premise, Phil cadence, cancellation/follow-up policy and Emerald initiative; optional protected patio exchange/recital cue; signature FX authority and exact three music stand-in slots. These do not authorize new sprawl or story rewrites here.

Remaining gaps: winning PLAY/interrupt restore, natural VIP9/encores/date spend gates, Range medals blocked by reload, full Owambe SUCCESS/GREEDY, alternate Touge story bands, natural tribute/impound recovery, natural finale/three endings and long-term recurrence/music. Source server uses production defaults, not a built release artifact. Baseline npm test fails at missing uppercase tools/tests/F02 import; sources:check reports5 existing hash mismatches. Audit scripts are syntax-checked; JSON/CSV/counts/reference hashes/publication diff verified. No runtime files changed.

Full reports: EXPERIENCE_COVERAGE, SCENE_CRITIQUE, ASSET_GAP_MATRIX, MINIGAME_HANDS_ON, CAMPAIGN_CONTINUITY, ART_QUEUE; updated ledger/depth/voice requests and combat placement addendum. Return to refinement-lead and Overlord for review; no implementation launched.

---

## Historical Stove A summary (unchanged below)

# RC4 first comb audit — review handoff — failures first

Audit base: `4981d5245d0600c062a7f431acd8253dc28b9cc6` (`origin/integration/rc3`). Audit branch: `rc4/comb-audit`. This is an OPEN-only review and proposed refinement plan, not implementation or RC4 acceptance. Stable finding IDs resolve to [COMB_LEDGER.md](COMB_LEDGER.md).

## Failures first

1. **RC4-001:** Carlos’s “uncle’s van” branch still reads an absent personal car and throws. This is a real production-parameter failure, reproduced with a fixture.
2. **RC4-002:** M8 hands-on PLAY returns NO_CAR, while War Room already supplies a loaner. SEND THE BOYS remains a bypass.
3. **RC4-003:** RC3 disables the ending wake trigger, so completed-finale state keeps offering another daily fight. OL-079 integration could not be located in fetched OPEN history/source.
4. **RC4-004:** Fresh Linux `npm test` fails before the suite on import casing; five source-vault hashes also fail. Historical green logs do not validate this SHA.
5. **RC4-005:** Party Hall can be bought for $250K but has no reachable hosted/room action beyond BUILT.
6. **RC4-006/007:** Personal-car purchase routes are cut, tribute fiction remains, and NAH never sets the withholding flag read by promotion code.
7. **RC4-008:** The daily cash floor counts net balance change, so spending can cause another grant despite sufficient real earnings; missing endpoint/sinks compound late money.
8. **RC4-009/021:** Maps exposes20 outings with erased story prerequisites, including a final and episode5; retained-game documentation misses mandatory/optional minigames; the active six-mod Armory bench also contradicts the no-mod direction (RC4-033).
9. **RC4-010/011:** First club says half off but charges75%; two HUDs show conflicting cash/legacy counters around a strong stage.
10. **RC4-012/013/014/015:** Range and canopy chairs look unfinished; chairs teaches ramen. Combat hides useful costs/Revenge value, and Roxy’s no-biting five-hit spar uses ordinary lethal combat grammar.

Full evidence, impact, reproduction, exact files, smallest repair, effort, confidence, owner and ruling are in [COMB_LEDGER](COMB_LEDGER.md). No repairs implemented.

## Starting point and branch

Audited exact base: **`4981d5245d0600c062a7f431acd8253dc28b9cc6`**, verified local and remote `origin/integration/rc3`. Isolated worktree `/workspace/rc4-comb`; branch **`rc4/comb-audit`**. Primary checkout/accepted refs left untouched. The audit commit is the commit introducing these documents/evidence; obtain its immutable ID with `git log -1 --format=%H origin/rc4/comb-audit` after push (also supplied in final report). A commit cannot embed its own hash in its tree.

## Car verdict

Fresh normal players have no personal-car acquisition surface. This deliberate cut became broken when M4/M8 still consumed personal ownership. Smallest repair: borrowed encounter transport, adequate seats and recovery shared with the working War Room policy. If ownership remains part of tribute depth, add one complete listing→receipt→consumer→recovery loop in an existing app; do not restore imports, parts, racing shops and an entire property ecosystem. Distinguish absent acquisition from ordinary insufficient funds and lost/tributed inventory. See [CUT_DEPENDENCIES](CUT_DEPENDENCIES.md).

## Minigame verdicts

**Keep/refine:** club and PLAY; **refine presentation:** rave; **refine:** ramen; **replace presentation:** Range Day and canopy chairs; **scope decision, then modest refine:** mandatory Owambe/Senator, Maps Jollof, Carlos Touge. The generic direct-launch dance fixture is not the shipped rave view. Touge’s presentation is unjudged until broken fresh access is repaired. See [MINIGAME_PRESENTATION](MINIGAME_PRESENTATION.md) for screenshots, mechanical vs visual work, missing assets and acceptance.

## Signature art readiness

Blood Bath source exists and explicitly specifies chunky left→right POWER, not invented choreography. Blood Bath, Bite and Revenge briefs are authored/source and access ready, with proposed frame budgets/timings awaiting approval. Gbenga sleeves/voice-note brief has frozen80×96 identity and actual authored behavior, but needs a real boss-placement capture before final anchoring. FX asset approval/status provenance needs steward reconciliation; candidate assets are never automatically approved. [COMBAT_ART_BRIEFS](COMBAT_ART_BRIEFS.md) and [prepared reference ZIP](evidence/combat-reference.zip) distinguish approved identity, runtime FX status and screenshot placement. BLAD33EE/other elaborate sequences need a later creator decision. No art generated or artist launched.

## Five refinement builds and decisions

[DEPTH_MAP](DEPTH_MAP.md) gives bounded scopes, dependencies, overlapping files and exit criteria:

1. Required-play access and trustworthy test/source gate.
2. Story endpoint, refusal/Maps consequences, gross income and usable hall goal.
3. Club price/HUD/progression, purposeful free visit, Roxy semantics, unread requests.
4. Retained minigame presentation and Armory/mod reward scope, after explicit roster decision.
5. Signature combat timeline and music cues, after art/track approval.

Necessary rulings: OL-079 exact provenance and OPEN ending/21-day cadence; one personal-car loop versus explicit carless tribute; NAH grant consequence; one hall payoff; approximately ten Maps choices/four-core-plus-vignette and no-mod/medal scope; literal first-visit half-off and Roxy spar semantics; FX reference approval and candidate timing; exact three music slot IDs/masters. Voice work is narrowly requested in [VOICE_SHEET_2_REQUESTS](VOICE_SHEET_2_REQUESTS.md), with protected lines preserved verbatim.

## Known-issue confidence

| Report | Result |
|---|---|
| ~$353K Day31 | Not reproduced from supplied save (none supplied); ongoing income/missing endpoint and net-income flaw traced. No arbitrary rebalance proposed |
| Past Day37 | Completed-finale Day37 fixture still offers generic daily fight; ending override false even explicitly eligible. Not a natural37-day playthrough |
| OL-079 ending fix | Not locatable by ID or ending/trigger commit searches in fetched public history; need exact SHA/path, do not invent integration credit |
| 18 unread texts | Not reproduced fresh; one story notification implemented, silent unread accumulation preserved; legacy/request migration review needed |
| Three music stand-ins | Not verified as exactly3; seven file-backed fresh tracks and two file:null catalog entries found. Need slot IDs |
| Half off applies25% | Confirmed ordinary $5000 throw costs$3750, fixture1000 costs750 |
| Missing doorman | Legacy narrated entrance is cut; no active missing sprite placeholder. Optional entrance decision, not broken club access |
| Combat UI during conversation | Defensive current/next-scene CSS/guard integrated; not reproduced on ordinary/targeted paths; moderate confidence, frame-level gap |

## Coverage and validation

Ordinary browser390×844 fresh start through Day1 complete and Day2 Jug the Plug start: real CEO/rave/hunter combat, five supplied lines, move swap, phone/Bank/Maps, actual rhythm keys and three club flicks, cash and sleep. Separate explicit fixtures inspect minigames, M9 NAH, M8 refusal, F04 loaner picker, M4 parameter throw and completed-finale state. OPEN source covers retained route graph and impractical late states. **No full campaign playthrough claimed.** No full PLAY settlement, all-date/VIP progression, natural late save, complete score tiers, real Gbenga fight, frame-perfect timeline or listening study. Repository source preview, not production build artifact.

`npm test`: failed before suite (case-sensitive F02 import). `npm run sources:check`: failed5 hashes (asset register, art START_HERE, content-authoring doc, IF1 feature scaffold, F01 play content). Browser captured errors empty on completed runs. Safe audit scripts were syntax-checked; docs/reference inventory validated. Runtime files unchanged. Future builds require full `npm test` plus one quick390 smoke after gate repair.

Return this plan to refinement-lead and Overlord for review. RC4 is not accepted; implementation is not launched.
