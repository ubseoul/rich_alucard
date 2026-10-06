# RC4 B1 integration handoff

## K campaign flow candidate

Exact base `9b511d7cacc8f30fb105ab33b8503ffbde6ae321`, branch `rc4/campaign-flow-polish`; scoped receipt: `builds/K.md`. Integrate the named campaign/phone/bedtime/report/CSS sections rather than replacing shared files. No loader or global migration patch. Completion and compensation stay campaign-owned; retained minigame dispatch and PLAY request settlement stay intact. Private ordinary-input evidence is separate from seeded save diagnostics. Final integrated packaged campaign acceptance remains coordinator-owned.

## B2 candidate integration notes

B2 starts only at reviewed `0b408fdd827fd6b14dadaaa8bc91d888cc708440`, isolated `rc4/b2-economy-maps`. Receipt: `builds/B2.md`. Integrate by function/section, retaining sibling visual/combat/date edits.

- B2 keeps nine tiles; Bank links to existing JDM page and hidden `cars` actions. Canon Supra/S15 buying and saved selection use existing records; no parts/exotic ecosystem. No new manifest entries or frozen art.
- `RAVehicles.available()` is the shared host usable-car reader used by F03/F04/F07 and garage. Preserve B1 request `garage.encounter`, consumed settlement and retry functions. F01 tactical loss/recovery stays in its existing namespaces; a natural cross-surface loss/recovery playthrough remains integration coverage, not a promised new buyback.
- Gross story/action floor $28K with persisted `rc3Day.earnedIncome` and atomic paid+receipt; current-day legacy missing earnings receives no extra floor until tomorrow. `rc4Maps` adds only release metadata; one new eligible outing per two days, no burst. B1 mission/advance interfaces unchanged.
- B4 coordination: first club visit now literally half-off (.5); cap remains half opening cash. RC4 Armory retires mod buying/attaching UI while preserving legacy inventory/effects. Range medal's existing story/crit payoff stays; retain sibling range/date presentation work.
- Party Hall restores only existing owned-home A26/HOST via Bank; active `rc4BarPaid` guards bar expense across reload. A27/Jade automatic follow-ups remain dormant; Maps ten-list is explicit in B2. Do not restore wider property/room/roster entry without authority.
- Silent phone threads retain all content while clearing unread state. B2 did not change creator dialogue, NAH consequences, masters, F01 probabilities, main, private packs or deployment.
## B3 candidate art/render contract

B3 bases on reviewed B1 `0b408fdd827fd6b14dadaaa8bc91d888cc708440`; runtime checkpoint `b29060b14500de57349b8de191fc0b45455c248f`. Dispositions/evidence: `docs/rc4/builds/B3.md` and `docs/rc4/evidence/B3/`. No self acceptance.

- Frozen `RAArtRegistry.assets[path]` images bypass runtime re-pixelation; preserve approved bytes and the actual path. For older transformed images, Director lookup uses `dataset.rc2Src` when `src` is a data URL. Do not erase source provenance.
- Adventure `actorElement` preserves explicit `state` and `src` overrides. Presentation-only defaults match M4 beat4 Carlos→betrayed, M4 walk_in Carlos→canopy_apron, M6 walked Senator→asleep. Creator dialogue and outcomes remain intact.
- `dataset.artPath`, `artState`, and explicit `artFallback` make loaded selection reviewable. Missing identities/states are diagnostic, not substituted with another named character.
- Legacy placement reads approved native width/height and contact anchor from presentation metadata (then registry cell/contact); registered `stageScale` remains honored. Director remains responsible for support contact, crop, facing, depth, and UI-aware camera placement. Keep exact-origin prop/foreground layer order.
- B4 keeps club layout/dancer and portrait sizing. B5 keeps combat timelines/FX; reuse the exact approved pose scope and frozen master, retaining measured anchor/scale across frames. B3 does not attach named Gbenga poses to generic combat events.
- BLAD33EE's actual rave card must be inspected after the rave entry replaces startup slash with hunter bolt; retain the exact RT SHIP001 neutral master. Seeded screenshots do not prove natural reachability or accepted move animation.
- HQ-R01 HOLD; HQ-R02 PASS. Private evidence/dispositions remain in HQ.

Foundation is the annotated `rc4-base` peeled commit `c9c273ff91a417d7953b30e718421339edd98c01` (OL079 ending recovery included). `rc4/b1-campaign` is the isolated candidate branch. The final delivery message identifies the immutable candidate SHA; branch names alone are not a review base. B2/B3/B4 branch from the reviewed immutable B1 SHA, and one later integrator consolidates. B1 does not declare RC acceptance.

## Exact shared interfaces

- `RARC3.settlePlay(result, summary)` returns boolean. A canonical `status:'COMPLETE'`, nonempty `requestId`, same-day `summary.day`, and no `summary.errors` earns daily action once, including a completed loss. `REFUSED`, `DECLINED`, invalid, quit and error do not. Both F04 and F07 call after their persisted consumed record. Duplicate result paths retry credit safely without repeating money/crew consequences.
- `RARC3.attemptAllowed(id,node)` returns boolean; `settleAttempt(id,node,result)` returns `'settled'` or `'paused'`; `suspend()` persists the active adventure's `vars.rc4Paused`. Each activity key gets an initial settled failure and one retry per calendar day. Quit/error/cancel/refusal costs no attempt, action or mission completion. Positive authored fail-forward outcomes are still authored outcomes. F04 uses `id:'warRoom', node:jobCard.id`; adventures use adventure ID and node ID. B4/B5 should call these functions rather than add separate counters.
- `RARC3.missionReady(id)` preserves one required beat per day and the authored VampGPT seven-day reask. `canStart` preserves live eligibility; exact `A54→A56` completed-win continuation is allowed through `from:'chain'`. A20 keeps its original wake predicate for one stage/day. B2 owns explicit substitutions for cut-only dependencies; it must not replace every `available` callback with true.
- `RARC3.campaignComplete()` reads actual prologue/rave/ladder/alternative/finale completion. `claimsEnding()` additionally requires Day21 or later, no active adventure, and no fired ending. Day21–24 is the normal window; Day25 is the safety boundary, with immediate safe-bedroom recovery for overdue completed saves. Incomplete mandatory work beyond Day25 remains visible/recoverable; the ending waits until it is actually finished. No skipped or fabricated mandatory flags. This timing limit is explicit rather than falsely claiming every stalled run ends by Day25.
- `F04.play_request` version1 retains all existing fields and accepts optional `garage.encounter:['HOOPTIE']`. The existing four-seat HOOPTIE is request-scoped and has no `carMap` entry. `prepareWorld` clears only its old loss record when that encounter fallback is supplied. Personal cars, tribute, drives and acquisitions use their existing IDs/records. Carlos's rental van uses the existing neutral Touge `supra` handling profile as encounter params only; it never creates an owned Supra. No PLAY engine odds, capture bands or car stat changes.
- PLAY iframe transports expose `QUIT PLAY` above the iframe. Quit disposes iframe/listener/timer and returns a typed REFUSED/QUIT boundary. F04/F07 clear pending with no host spend; adventure dispatch preserves its node instead of invoking authored completion callbacks. Browser reload rehydrates the saved pending request/checkpoint through the existing APIs.

## Section ownership and cross-lane patches

| Shared file/surface | Section/function | Owner |
|---|---|---|
| `js/systems/rc3.js` | pendingMission, missionReady, next/advance, read/patch, canSleep, campaignComplete/claimsEnding/recoverEnding, settlement/retry helpers, M4 encounter params, mission gates | B1 |
| `js/systems/rc3.js` | claimCash monetary formula, apps/phoneRoute/phoneAction for JDM access, Maps cut-dependency substitutions, bankMarkup/hall consumers, silent inbox migration | B2; coordinate next/advance calls with B1 |
| `js/systems/rc3.js` | combat presentation/HUD and hunter presentation | B5; preserve authored encounter data |
| `js/scenes/adventure.js` | run activity dispatch, pause/error/retry settlement and returnHome/continuation boundaries | B1 |
| `js/scenes/adventure.js` | actorElement, renderActors, paintEnv, stageDirector, image/alias/grounding | B3 |
| `js/scenes/adventure.js` | dialogue/choice layout and date/minigame presentation | B4; B3 owns actor grounding |
| `js/scenes/bedroom_life.js` | active paused-checkpoint resume guard and ending sleep dispatch | B1 |
| F01 `showdown.js` / `play/adapter.mjs` | iframe transport cancellation / encounter garage projection | B1; gameplay engine and odds remain protected |
| F04/F07 PLAY adapters | request transport, pending/consumed settlement, daily credit calls, retry handoff | B1 |
| F04/F07 adapters | money arithmetic/economy, owned car mapping/ownership migration | B2 with B1 settlement integration |
| Art registries/renderers | alias lookup, approved art wiring, load diagnostics, grounding | B3 by function; no whole-file lock |
| F15/club/minigames | club layout, date consistency, UI/rules/reload of existing games | B4; common settlement helpers stay B1 |
| Combat animation/HUD/audio | timing owner, move costs, attack effects, music pin/restore | B5; F01 protected odds/capture untouched |
| Loader/sync tools and index | each lane's necessary new manifest entries; generated ordering reviewed by integrator | Integrator; no independent ad hoc ordering |
| Save migrations | campaign retry/pause/ending fields | B1 additive fields |
| Save migrations | money/JDM/Maps/Hall/ownership/inbox | B2 additive normalization |

B1 cross-lane patches are narrowly named: F04 encounter garage projection plus settlement callback; F07 encounter garage projection plus settlement callback; F01 request projection/iframe cancel; bedroom paused guard; shared adventure dispatch. B2 preserves these interfaces while restoring JDM buying; B1 does not implement or remove that loop. No whole-file locks are implied.

## Save compatibility

No save-version bump or destructive global migration. Existing state migration preserves world flags and active vars. New lazy fields: `world.flags.rc4Attempts={day,failures:{'adventure:node':number}}`, `rc4PlayCredit={requestId:day}`, and `adventures.active.vars.rc4Paused:boolean`. Missing fields mean no failures/credits/pause. Day mismatch resets the attempt view. Existing `rc3Day`, mission flags, ownership and consumed PLAY records retain their shape. Old pending requests without `garage.encounter` retain the old F01 projection; new requests have encounter metadata. Old save recovery never confiscates cars/grants or rewrites M9 history.

M9 authority is resolved: `docs/engineering/F03_NEW_OGA_LADDER_CLOSE.md:74` explicitly rules rank4, no trust penalty, normal M10/grants reachable after NAH. Audit RC4-007's withholding proposal is superseded; the existing regression remains authoritative. B1 corrects contradictory comments only.

## Validation and independent browser review

Run `npm test`, `node tools/run-tests.mjs --fragment rc4`, `node tools/rc2/protected-lines.mjs check`, `npm run loader:verify`, `npm run leak-check`, then build only from the candidate SHA. Full packaged natural playthrough remains later integration work.

Documented existing browser harness (no installation):

```powershell
$env:RA_CHROMIUM_PATH='C:/Program Files/Google/Chrome/Application/chrome.exe'
$env:RA_PLAYWRIGHT_PATH='C:/Users/Ube/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core'
node tools/rc4/b1-browser.mjs
```

The harness starts/closes a local HTTP server automatically. For manual independent review: `python -m http.server 4176 --directory .` from the checkout; open `http://localhost:4176/index.html?mute=1` at390×844. Optional `RA_B1_DIR` points the browser script to a packaged directory; it must contain this candidate's runtime. The script writes `docs/rc4/evidence/B1/browser.json` and six screenshots.

Fixtures are deliberately seeded: Day5 M3-complete carless Carlos `run` node; Day10 M7-complete carless M8 `play` node; two seeded settled failures; canonical settlement boundary fixture; actual mandatory-completed spine at Day20/21-25/37; incomplete M8 at37. Expected: Carlos Touge loads; quit returns a paused checkpoint without credit/completion; reload preserves it; two failures force tomorrow and reload cannot bypass; next day resets; M8 iframe loads with HOOPTIE; visible host QUIT cleans up with no action/pending; one COMPLETE result credit; actual protected ending starts at21; incomplete mandatory fallback stays false. These are fixtures, not a natural playthrough. Real canonical-engine outcomes and duplicate settlement are separately covered by the headless suite.

## B4 bounded integration handoff

Base: reviewed immutable `0b408fdd827fd6b14dadaaa8bc91d888cc708440`; branch `rc4/b4-club-minigames`. Assistant implementation choices, not new creator quotes: paid support equals the actual debit; quit before any throw consumes neither visit nor discount; first successful throw consumes the first-visit flag (remaining mounted visit retains its terms; reload is departure). Legacy saves are not revalued. Club portraits become 32x36; dancer scale uses the existing manifest/contact anchor with the shorter replacement HUD's headroom. No asset bytes, animation timing, identity, or registry sections changed.

- **B2 seam:** `js/data/rc2_economy.js` only `stripClub.firstVisit.discount=.5`. `js/systems/strip_club.js` open no longer credits a visit. F06 credits it only after payment. `js/frag/F02/armory.js` range action adds attempt refusal and quit return, preserving purchases/mods/loadout.
- **B3 seam:** `js/frag/F15/club.js` owns its existing overlay `measure()`/layout, retaining manifest transforms/feet. `js/scenes/adventure.js:showLine` accepts explicit `opts.narration`, preserving `opts.entrance`; three protected staging texts gain that metadata. No `actorElement`, `renderActors`, `paintEnv`, `stageDirector`, alias or art registry changes.
- **B5 seam:** `js/engine/combat2.js:act` adds an early opt-in `params.spar` branch; `js/scenes/combat2.js` adds spar-only HUD visibility, JAB/CROSS/GUARD/QUIT menu/action and safe result/quit. `js/frag/F15/roxy.js:bout` supplies `spar:true`. Normal combat and F01 odds stay unchanged. Spar reaches five clean contacts, loser stays at1HP; no guns/items/companions/bite, no defeat penalty or defeat sound. Assistant tuning: jab .9/cross .7 clean-contact probability; opponent .55 normally/.15 against guard. Review these exact sections when merging B5, rather than overwriting the file.
- **B1 retained-story dependencies:** generic minigame listing now exposes only `slurp`, `dance`, `range_day` (club has its existing phone entry). Source remains registered for existing story consumers. Do not remove callbacks without authored replacement: `NEW_OGA_M1:touge`, `NEW_OGA_M4:run` -> Touge; `NEW_OGA_M3:chairs`, `NEW_OGA_ALTERNATIVE:chairs` -> canopy activity in slurp; `NEW_OGA_M5:collect` -> owambe_collection; `NEW_OGA_M6:care` -> hatch; `JOLLOF_WARS:cook`, `A54:cook` -> jollof. B1 decides how these required beats survive a four-game-only runtime. `NEW_OGA_M8:play`, `NEW_OGA_FINALE:p1` -> `f07_play` are PLAY transports and stay B1-owned. Exact static inventory: `node tools/rc4/b4-dependencies.mjs`.
- **B5 bounded writing requests:** RC4-038 remains protected M7 patio summary; request a short reciprocal acknowledgement adjacent to it, preserving all supplied words and existing vault facts. Roxy L3 retains the existing towel branch; Emerald L2 retains ASK, removing the duplicate WAIT. If distinct ice-pack or WAIT initiative is desired, author only that existing prop/response beat. No new date, affection stat or story scope. Additional historical entrance-description tags outside the three verified mission entries remain a bounded attribution follow-up.
- **Scope gaps:** RC4-029 social-stakes presentation for retired Owambe/Senator games depends on B1's retained-story decision. VIS-007 crew card fit belongs to the War Room presentation integrator; B4 did not introduce a new roster or modify F04 crew rendering. No claim of closure for these rows.

Range's direct Armory path now calls B1 `attemptAllowed('range_day','range')`/`settleAttempt`; adventure games retain B1's existing dispatcher. Cancel never settles a failure. Rave's authored poor-rhythm fail-forward still proceeds after the result acknowledgement; it is not replaced with a replay grind.

## B5 candidate seam / coordinator release gate

B5 starts exact74f4179; changes only combat HUD/menu/presentation,enemy move pose/FX timing,existing-player scoped combat cues,one M7 acknowledgment,and throne-exit legacy overlay cleanup. Approved candidate frames live separately under assets/rc4/combat_candidates_v1; never overwrite frozen originals. Four new exact reactions/triggers and rollback decisions are in builds/B5.md. B4 nonlethal spar,B1 attempt/settlement/transport,B2 JDM/earnings and B3 actor grounding remain intact.

Coordinator owns final natural packaged fresh-save-to-ending and alternate checkpoint run. B5 must hand off actual dist/build.json identity,ZIP/checksum,final suite/source and packaged browser evidence,and status-only private verification. Registry move coverage is not natural reachability; no perceptual listening or RC-ready claim without actual review. Legacy CEO no-steal overlay was a natural pointer blocker; verify ordinary M1 pointer input after repaired throne exit.
