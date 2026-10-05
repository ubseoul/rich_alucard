# BTF TEST PILOT — ARCHITECTURE HANDOFF 001

Knowledge transfer from Engineering 05 / 05B (retired) to whoever builds **BTF TEST PILOT / DEV MODE**. It records what exists, what I actually learned while using it, and what I would build next. It is not an implementation plan, and **no game or testing code was changed to write it**.

| | |
|---|---|
| Accepted checkpoint | `claude/ship015-integration-001` @ `d526c7f8e9d9f1240a24cddc4f330a227eba1c90` (Engineering 05B, HQ technical PASS) |
| Lineage | `229e41a` (Eng 04 playtest candidate) → `459f252` (Eng 05) → `d526c7f` (Eng 05B) |
| Sources | Engineering 05/05B work, the harnesses I ran, `docs/engineering/PLAYTEST_READINESS_001.md` (Eng 04), `OPEN_ART_LIFE_INTEGRATION_001.md` (Eng 05), `SHIP015_INTEGRATION_001.md` (Eng 05B) |
| Spoiler rule | Ids, codes and mechanics only. SEALED material was not opened. PLAYER-BLIND flows are named only as flows |

**Provenance.** "Observed" means I hit it myself in Engineering 05/05B. "Inherited" means it came from Engineering 04 or earlier and is encoded in the harness or its notes, but I did not reproduce it.

---

## 1. The shortest useful summary

1. **There are two worlds: headless and browser.** Headless tools (`loadBtf` in a Node `vm`) are fast, deterministic and good at *logic*. Browser tools (Playwright over `dist/` or the source root) are slow and the only proof of *what a player sees and can tap*. Most false conclusions came from treating one as the other.
2. **"Exists" is not "reachable", and "reachable" is not "seen".** Engineering 05 found:
   - 9 adventures with no player route;
   - a repeatable adventure (`PIER`) that routes pointed at but that did not exist;
   - hub choices that could never appear (A18, A19, CAFE `COOK A TRACK`);
   - frozen art that was registered but never drawn.
   All of these passed the older tests.
3. **Harness failures looked exactly like game failures.** Every time, what separated them was:
   - re-running the same harness on the untouched baseline build;
   - checking what a player actually sees (the element on top at the tap point, not just "an element exists");
   - rebuilding the state a real player would have (inherited adventure context, side effects of prerequisites) instead of jumping there.
4. **Build one shared control and evidence layer** over the game, with several modes on top (surgical, player-path, life, chaos). Do not build several unrelated bots. §9 covers what to reuse.

---

## 2. Current testing architecture (what exists at `d526c7f`)

"State" = the tool writes game state directly (`RAState.patch`, flags, fixtures). "Player" = it acts only through player controls (taps, choices, phone buttons).

### 2.1 Release gate — `npm test` / `npm run build` / `npm run verify:artifact`

| | |
|---|---|
| Path | `tools/release.mjs` (`test`, `build`, `verify-artifact`, `verify-deployment`) |
| Runs | `party-test`, `rave-test`, `ogun-rave-adventure-test`, `property-test`, `tools/minigames/*-test.mjs` (9 minigame logic suites), `btf-test`, `presentation-test`, `art-integration`, `reachability-audit`, plus its own deterministic gate (JS syntax of every file, save fixtures, recovery, opportunity access, scene/stage/combat self-tests, people/world-event idempotency, the paused-Supra migration assertions added in Eng 05) |
| Proves | Logic invariants, migration/idempotency, adventure graph validity, that every adventure branch can be walked, generated data being current, the Presentation lock, the frozen-art contract, route proofs |
| Cannot prove | Anything about pixels, layout, taps, timing, animation, refresh in a real browser, audio |
| Mode | Headless, mostly state + walker; source tree |
| Evidence | Console `PASS …`/`FAIL …` lines only |
| Notes | `build` runs `test` first, so **any stale generated file or lock blocks the build**. `verify:artifact` checks build identity only (`build.json`, `build-info.js`, cache-busting placeholders), not behaviour |

### 2.2 Headless world — `tools/btf-test.mjs` (`loadBtf`, `walk`)

| | |
|---|---|
| Purpose | Loads the engine and content into a Node `vm` with DOM stubs. `walk(ctx,id,{pick,minigame,fight})` drives one adventure from start to end with synthetic minigame/fight results |
| Proves | v12 migration and idempotency, calendar/clock/budget/rent, temptation cap, graph validation, every branch walk (262 at `d526c7f`) |
| Cannot prove | Rendering, the phone UI (`js/scenes/phone.js` is not loaded, so `RAPhoneApps` is absent and phone apps register as no-ops), real minigame play, real combat, audio |
| Mode | State + scripted choices |
| Notes (observed) | Because `RAPhoneApps` is absent, phone app markup (FAMILY avatars, VampGram) could only be checked in a browser. `walk` feeds fixed minigame/fight outcomes, so it cannot find input or timing bugs |

### 2.3 Reachability — `tools/reachability-audit.mjs` (Eng 05, in `npm test`)

| | |
|---|---|
| Purpose | (1) Classifies every adventure by the player routes that name it: literal references in `js/` (DEV files flagged separately, `js/sealed/` never read) **plus the live want and wake-trigger registries**. (2) 12 dynamic route proofs |
| Proves | For each of the nine formerly unreachable adventures, plus PICKUP (`VENICE`), `PIER` and ONLYVAMPS: the **real route code** offers or starts the target, the target completes, one-time content is not offered again, and repeatables stay repeatable. Time moves through the **real** `RAClock.sleep()` (all wake handlers) |
| Cannot prove | Taps or UI; the PLAYER-BLIND prerequisites (Ogun's Rave outcome flags are seeded); anything inside the SEALED pack (not loaded headless) |
| Mode | Headless. Prerequisites come from real adventure walks where possible; the remaining seeds are listed per proof |
| Evidence | `--json out.json`: `{rows, proofs:[{name,route,seeds,evidence,result}], none}` |
| Notes (observed) | The first static version flagged 15 `ARC_*` beats as unreachable because their ids are built from a template. Reading the live registries fixed that. **Static text search is not enough for classification** |

### 2.4 Built-game player-path QA — `tools/playtest-qa.mjs` (Eng 04, extended in Eng 05)

| | |
|---|---|
| Purpose | Plays `dist/` through player controls: START, taps, adventure choices, phone buttons, ⌂ CASTLE, ☾ SLEEP, minigame canvases, ✕ QUIT. Checks invariants after every outing and night |
| Scenarios (`--only`) | `newgame` (×3 widths), `prologue-reload`, `life` (`--days N --seed N`), `minigames` (`--mg a,b`), `migration` (all fixtures), `widths`, `legacy`, `systems`, `ending`, `wake-reload`, `reachability` (Eng 04 text scan), **`routes`** (Eng 05, `--route a,b`: nine HQ routes through taps) |
| Proves | Player-path navigation, clean return to an idle bedroom, save/refresh fidelity (`reloadCheck`), no duplicate one-time rewards, correct migration on real load, minigame enter/finish/quit/return, the protected ending firing once |
| Invariants | Save v12; finite money; valid day; no duplicate ids in receipts, memoryLog, mail, history, cars, properties, castleRooms or text threads; no non-repeatable adventure completed more than once; no world event delivered twice; persisted save = live state; at idle: bedroom scene, no active adventure, no leftover minigame/combat/adventure mode or DOM, bedroom controls present |
| Cannot prove | Fun, visual quality, audio, text correctness |
| Mode | Player taps, but **some scenarios start from a seeded state** (listed in the tool; e.g. Eng 05's `routes` seeds Ogun's Rave outcome flags, castle rooms, a met woman). The `drive()` brain picks randomly among enabled controls |
| Evidence | REVIEWER-ONLY folder: numbered screenshots, `report.json` `{build, results, findings:[{cls,code,detail}], log}` |
| Assumptions | Needs `RA_PLAYWRIGHT_PATH` and `RA_CHROMIUM_PATH` on this machine. It serves `dist/` itself, so run `npm run build` first. `reloadCheck` ignores `life.world.scene`, `life.clock.returnBeat` and `life.history` |
| Known limitations | TOUGE natural finish (§3.4); 8 s click timeout (a blocked control shows up as a timeout, §3.2); `drive()` is random, so coverage depends on the seed |

### 2.5 Presentation Director census and sweeps

| Tool | Purpose | Proves | Cannot prove / notes |
|---|---|---|---|
| `tools/presentation-adventure-dryrun.mjs` (`--write-lock`, `--combat`) | Headless: builds every distinct `(environment, cast)` adventure screen from content (declared `presentationVariants` included), solves the camera at 360×740/390×844/430×932, lints geometry | 149 adventure screens / 17 fights at `d526c7f`; the Wave 1/2 locks | **Skips adventure end nodes** (§8.1). Runtime-bound casts are invisible unless the adventure declares `presentationVariants`. Actors without metadata use Rich as a proxy. Headless and live lint can disagree (§3.7) |
| `tools/presentation-sweep.mjs` (`--combat`, `--only key`) | Browser (source root, `?dev=1`): renders each census screen through the real adventure scene, live-lints at 3 widths, 390 contact sheets | Director staging holds in the real DOM; 0 page errors | Seeds each screen's env/cast from the dry run. Sees exactly the census set, so it inherits the end-node gap. Covers non-actor props (e.g. Eng 05 `props` cars) only as pixels in the sheet, never in lint |
| `tools/presentation-census.mjs` | Browser: deterministic captures + metrics for the named Director scenes (`--scenes`) | Scene-level framing metrics | I did not run it in Eng 05/05B |
| `tools/presentation-test.mjs` (in `npm test`) | Asset metadata up to date, Director self-test, lock comparison | Regression lock | Lock changes must be reviewed, then rewritten (`--write-lock`) |
| `tools/presentation-assets.mjs` + `tools/presentation/annotations.json` | Generates per-sprite metadata (visible box, contact, face box) | Face-size and face-visibility lint inputs | Face boxes are hand-authored; derived boxes can pass lint while being wrong (§3.9) |

### 2.6 Frozen Art gate

| | |
|---|---|
| Paths | `tools/art-registry.mjs` → `js/data/art_registry.js`; `tools/art-integration.mjs` → `docs/art_integration/INTEGRATION_MATRIX.json`, `js/data/art_surfaces.js`; runtime maps `tools/art-integration/ship014_runtime_map.json`, `ship015_runtime_map.json`; reviewer record `tools/art-integration/review.json` |
| Proves | Every runtime art path is in `ASSET_REGISTER.json` as FROZEN with matching bytes and dimensions; Ship 011 is never referenced; every Ship 014/015 file claimed "integrated" is actually consumed (a staged content state, or its token present in its consumer file); every file that isn't carries a written reason |
| Cannot prove | That the art looks right where it is drawn. That came from browser captures |
| Separate manual check | `sha256sum -c` over `art_department/ships/*/FROZEN_CORPUS_SHA256SUMS.txt` (needs `tr -d '\r'` on this CRLF checkout). Some provenance lists (Ship 011 source package, Ship 013 candidates) reference files on other branches and always "fail". They are identical at baseline and are not regressions |

### 2.7 Save migration

| | |
|---|---|
| Paths | `js/data/save_fixtures.js` (`fresh`, `legacyV4`, `lifeV6`, `butterChickenCompleted`, `supraPaused`, `supraOwned`, `malformedJson`, `partialCorrupt`); `js/engine/state.js` (`migrateWithReport`, `migrateRecord`, `read`); `js/systems/smoke.js` (in-page DEV smoke, `#devSmoke`) |
| Tested by | `release.mjs` gate, `btf-test` (every fixture → v12, idempotency), `playtest-qa --only migration` (real page load → START → play → refresh) |
| Gap | Fixtures are hand-made states from before v12. There is no fixture from a mid-life v12 save made by a real run. `playtest-qa --only life` writes `progressed-save.json`, which could become one |

### 2.8 Other tools and pages (context)

| Path | Use | Notes |
|---|---|---|
| `tools/persona-sim.mjs` | Headless four-persona lives until the protected ending | Eng 04 used it (Day-36 ending, 31–39 distinct adventures). I did not run it. Headless only |
| `tools/btf-browser-test.mjs`, `party-browser-test.mjs`, `rave-browser-test.mjs` | Older browser tests | Inherited: they call `chromium.launch()` with no executable path. `party-browser-test` fails on the accepted baseline (it expects START → bedroom); `rave-browser-test` needs `sharp`. `playtest-qa` replaced them for Eng 04/05 |
| `minigame-lab.html` | Plays each minigame directly | **Lab reachability is not world reachability** (PICKUP was lab-only until Eng 05) |
| `party-dev.html`, `rave-review.html` | DEV review pages | Not player paths |
| `?dev=1` / F2 DEV panel (`js/systems/devtools.js`, `js/systems/btf_dev.js`) | Fresh/wipe save, life money/location/clout inputs, life/people/events inspectors, sleep/skip-7-days, +$1M, **RUN ADVENTURE** (any id, from its start node, empty vars), **MINIGAME** (launched with `{lab:true}`), JDM/Ogun/Property resets, smoke | A useful base for DEV MODE (§5), but RUN ADVENTURE and MINIGAME use neither the real route nor the real params |
| `js/systems/presentation_fixtures.js` | DEV-only neutral Director fixtures | Never counts as content |
| `tools/art-inputs.mjs`, `tools/vp-lines.mjs`, `tools/sync-index.mjs` | Placeholder list, [VP] line list, `index.html` script block sync | `sync-index` output is checked by `btf-test` |

---

## 3. Harness lessons (false positives, limits, and how each was told apart)

### 3.1 Combat 2.0 / throne stall — Octopus Brain *(inherited)*
- **Symptom:** a long life run appeared to stall at a throne fight (around Day 7, per HQ's account of Engineering 04). The harness reports this as `STUCK`: "no progress for 40 inputs".
- **Cause:** the fight was waiting on an **OCTOPUS BRAIN sub-choice** (`.c2-octo:not([hidden]) [data-octo]` in Combat 2.0; `#octopusOverlay.on [data-octo]` in the legacy throne fight). The driver only knew FIGHT/moves, and the combat menu is empty while the overlay waits.
- **How it was told apart:** the screenshot at `STUCK` showed the overlay. Game state showed a fight awaiting an octopus choice, not a hang.
- **Lesson:** a driver must enumerate every interactive layer the scene can show, including overlays that replace the menu. `drive()` now clicks octopus choices first.

### 3.2 Width checks — layout failure vs. controls covered by a modal *(inherited, and observed in Eng 05)*
- **Real layout failure:** a control is off-screen or clipped at 360/390/430, or content overflows with no way to scroll.
- **Harness failure:** the control exists and is laid out correctly but sits **under a modal** (Morning Mail, phone, castle menu, bed confirm). The phone content itself scrolled fine; controls behind a layer are covered *by design*.
- **Observed in Eng 05:** the first `--only routes` run crashed with Playwright `TimeoutError`: "`<button class="mail-done">GET UP</button>` … intercepts pointer events". A progressed save opens on Morning Mail, and the route tapped the phone before dismissing it. **Fix:** settle to an idle bedroom (`drive()`) before any route.
- **Lesson:** layout checks should test the **top-most element at the control's centre** (`document.elementFromPoint`), which `drive()` already does for legacy scenes. Report "covered by <layer>" separately from "off-screen/clipped". Don't treat an 8 s click timeout as a layout finding without looking at what intercepted it.

### 3.3 A46 — weighted wants, the wrong mail card, and the real DM path *(observed)*
- **Wants are weighted and capped.** `RATemptations.generate(day)` picks priority wants first, then weighted variety, up to a cap (1–3/≤4 live on days ≤10, 3–5/≤8 on days ≤30, then 5–8/≤12). A repeatable weighted want like `a46_special` appears on *some* day, so **asserting a weighted want on a particular day is invalid**. Assert "appears within N sleeps", or pin the RNG seed and record it.
- **The cap can starve story beats.** In the headless proof, A37's Friday invite was missing because WHAT WE ON was full. That's why Eng 05 added `RATemptations.ensure(id)` for one-time routed wants. Also: a want's `when` must return a strict `false`; `undefined` counts as eligible (Velvet's DM surfaced too early in a proof until fixed).
- **The wrong card matched.** The harness waited for a Morning Mail card matching `/KIKI/` and clicked an unrelated card that mentioned her before her ask existed. Match the want's **own text or id** (`take me somewhere special` / `tempt:a46_special`), never a name.
- **Seeding by fiat skipped a side effect.** Meeting Kiki via `RARelations.meet` left InstaHoe locked, because it unlocks inside A07. **Seed prerequisites by walking the adventure that provides them**, or replicate every side effect.
- **The real player path:** InstaHoe home → her **profile** (`app:instahoe:p:kiki`) → **DMS** (`app:instahoe:dm:kiki`) → reply **SAY LESS** (`do:instahoe:reply:kiki|tempt:a46_special:<day>|0`) → A46. A DM button only exists on the profile page. Tapping `app:instahoe:dm:kiki` from the InstaHoe home silently does nothing. The ask also appears in WHAT WE ON.

### 3.4 TOUGE natural finish *(observed; harness limit, not a regression)*
- **Symptom:** `--only minigames --mg touge`, mode `play`, ends with `exit:"quit"` instead of `finished`, even with `--tougeMs 200000` and nothing else running.
- **How it was told apart:** I built the untouched baseline (`git archive 229e41a` into a short scratch directory, then `node tools/release.mjs build --commit 229e41a…`) and ran the identical command. **The baseline behaves the same.** Quit, return and refresh pass on both.
- **Still open:** the driver's result-screen tap and timing don't produce a natural finish on this machine. Engineering 04's report records a natural finish, so it may depend on machine or timing. In Eng 05 I also could not provoke a live drift headlessly to capture the new HUD face; that stays code-verified only.
- **Lesson:** before calling a minigame regression, **run the same harness on the baseline build**. Minigames driven by synthetic pointer input need their own deterministic test hooks (§5).

### 3.5 Final-node census gap — A31 / God's fade *(observed in 05B)*
- `presentation-adventure-dryrun.mjs` skips any node with `end` (`if(!env||node.end)continue`), but end nodes often carry player-visible lines. After God's `fading` state was staged on A31's end node, the census count didn't change and the sweep never rendered it.
- I verified it manually (live lint PASS at 360/390/430). This is a **coverage gap**, not a pass (§8.1).

### 3.6 Inherited cast/state — jumping to a node in isolation *(observed in 05B)*
- My focused check jumped straight to A31 `stars` with `RAAdventures.start(...)` + `patchActive({node:'stars'})`. That node inherits its cast from `arrive`, so the screen had **no actors** (key `curb|`) and lint failed `dead-space`. The first jump to `fade` without `env` produced a `null` environment key and the wrong backdrop.
- In play, `stars` inherits `arrive`'s cast and is the same census screen that passes.
- **Lesson:** a node is only valid with its **inherited context** (env, actors, vars, applied `enter` effects, titles shown). A surgical launcher must replay the path from `start` to the target node, or rebuild env+actors+vars exactly (the sweep seeds env/cast from the dry run for this reason). Same for DEV RUN ADVENTURE: it starts at the start node with empty `vars`, which is invalid for runtime-bound adventures (DATE, A46, RB_DELIVERY).

### 3.7 Headless lint vs live lint disagree *(observed in 05B)*
- A31 with Rich `mid` and God `right`: the **dry run passed**, but the **live lint failed `face-visible:mid` at all three widths**. In the real DOM, the Director closed the pair's gap until God's wide seated pose covered Rich.
- **Lesson:** dry-run PASS is necessary, not sufficient. Any staging change needs a live check.

### 3.8 "Available" means different things inside and outside a run *(observed; was a real game bug)*
- `RAAdventures.available(id)` returns false for **every other id while any adventure is running**. Grave hub encounters (A18, A19) and CAFE's `COOK A TRACK` therefore never appeared, and A19 is the only source of `armoryKnown`, so the Armory and guns were unreachable in normal play. Fixed with `{ignoreActive:true}`.
- **Test lesson:** a headless probe that calls `available()` *outside* a run would say "available" and miss this entirely. Check choices **from inside the running hub** (`choicesFor` after `enter`), as the audit does.

### 3.9 Other traps I actually hit
- **Launching a surface without its real params gives a misleading picture.** Launching HATCH with `{}` shows the egg whatever the save says, because HATCH reads its dragon from params the phone passes. Launch surfaces through their real entry (or copy the params exactly).
- **Assets registered but not visible.** Placing the delivered-car `props` at x=192 left the car half outside the conversation camera. No lint covers props; only the capture showed it.
- **Automatic face boxes can pass lint while wrong.** New staged states passed lint with derived boxes. My anchor-transfer method (move the anchor face box by the head-top offset) put Marisol's disapproving box on her raised duster, and June's below her face because of her tall locs. Hand-check every face on an overlay.
- **Static reachability misses template-built ids** (§2.3) and cannot see runtime-bound casts (§2.5).
- **A dangling route shows no error.** `PIER` was referenced by a place, a lane and a want but never defined. The place simply vanished after A12, silently.
- **Parallel runs change timing.** Five `playtest-qa` sets in parallel slowed TOUGE's frame budget. Rerun timing-sensitive checks alone before judging them.
- **Tooling on this Windows machine** (also in the session memory note):
  - the in-app preview pane serves the *main checkout's* `dist/`, not a worktree's;
  - long scratch paths break `git worktree add` (use `git archive | tar` into a short directory);
  - `sha256sum -c` needs `tr -d '\r'`;
  - a `cat > file` placed in front of a heredoc hangs the shell.

---

## 4. Real player reachability vs. technical existence (major)

Engineering 05 showed that each of these can be true while the next is false:
- an adventure is defined in data, but no place, lane, want, trigger, chain or hub leads to it;
- a minigame works in `minigame-lab.html`, but nothing in Rich's world launches it (PICKUP);
- a frozen asset is registered, but no scene draws it (46 Ship 014 files + 2 Ship 015 files are "registered, unwired" by design);
- a route test succeeds, but only because it seeded state the player could not have reached that way.

### Proposed levels (each needs the level below it)

| Level | Meaning | Evidence required |
|---|---|---|
| **REGISTERED** | The thing exists in data (adventure def, minigame registration, registry entry) | Static presence: adventure validates, registry verifies bytes. *Tools: `btf-test` validate, `art-registry`* |
| **DEV-REACHABLE** | A developer can start it through a DEV control or a direct engine call | It starts **with valid inherited context** and completes without errors. Record the seed/setup. *Tools: DEV panel, `walk()`, a future surgical launcher.* **Never counts as reachability** |
| **PLAYER-REACHABLE** | A player can arrive there through normal UI and game rules | (a) Static: a real route names it, read from literals **and** live registries. (b) Dynamic proof: the real route code offers/starts it in a life whose prerequisites were produced by **walking** the prerequisite adventures, not setting flags (list every remaining seed, e.g. PLAYER-BLIND outcomes). (c) Browser: reached by **taps only** from an idle bedroom, returns cleanly, invariants hold, refresh diff 0. For one-time content: shown not to recur. For repeatables: shown to recur. *Tools: `reachability-audit`, `playtest-qa --only routes`* |
| **PLAYER-REACHABLE + PRESENTATION-VERIFIED** | What the player sees on arrival is correct | Every screen along the route (**including end nodes**) passes live Director lint at 360/390/430 with authored face boxes. Art actually drawn (matrix "consumed", not just registered). A reviewer capture at each meaningful checkpoint. No page errors |

**Rule for reports:** say which level was proven, and list every state seed. A seed that stands in for PLAYER-BLIND content (e.g. Ogun's Rave outcome flags) is acceptable only if it is written down and that flow is exercised separately for function.

---

## 5. DEV MODE — what would actually have saved time

The DEV panel already has good bones: fresh/wipe save, inspectors, sleep/skip days, +$1M, RUN ADVENTURE, MINIGAME, resets and smoke. Below is the smallest set of *additions* that would have removed the repeated work I did by hand in Eng 05/05B. Each is a thin wrapper over existing engine APIs (`RAState`, `RALife`, `RAClock`, `RARelations`, `RAAdventures`, `RAMinigames`, `RACombat2`, `RACastle`, `RACars`), exposed once as `window.RATestPilot` for both the panel and Playwright.

| Capability | Why (what I kept rebuilding) | Build on |
|---|---|---|
| **Load named fixture / scenario** (existing `RASaveFixtures` + new "life scenarios", e.g. "after Ogun's Rave", "Kiki CLOSE", "prepared for A23R") | Every route proof and QA scenario rebuilt the same states with inline `evaluate` snippets | `RASaveFixtures`, `RAState.write` |
| **Advance to day N / next weekday via real sleeps** | Days had to be reached through `RAClock.sleep()` so wake handlers run; patching `life.world.day` skips them | `RAClock.sleep` (the panel has sleep ×1/×7) |
| **Establish a prerequisite by walking it** ("complete A07/A09/A19/A24 as a player would") | Flag seeds skipped side effects (InstaHoe lock) | `walk()` logic moved in-page |
| **Launch an OPEN adventure at a node *with reconstructed context*** (replay from start, or seed env/actors/vars from the dry-run row) | §3.6; DEV RUN starts at `start` with empty vars | `RAAdventures.start/enter/patchActive`, dry-run rows |
| **Launch a minigame with the real params its route passes** | §3.9 HATCH | the route's own params builder |
| **Launch a fight** by enemy id + env | Combat checks went through whole adventures | `RACombat2.run(enemy,{env})` (the sweep already does this) |
| **Set money / relationship level / grant car, property, room, gun, item, fit** | Constant inline setup | existing `RALife`/`RARelations`/`RACastle`/`RACars` APIs |
| **Inspect + dump state** (JSON download, diff since last dump) | `reloadCheck` diffs and manual state reads | `devtools.js` inspectors, harness `diffKeys` |
| **Deterministic RNG seed** for wants, pier catches, pickup, touge input timing | Weighted content was not reproducible (§3.3, §3.4) | temptations already use `RAPixel.rng(seed)`; minigames mix `Math.random` and `performance.now` |
| **Minigame test hooks** (read phase/score; request natural end) | TOUGE finish and drift face were unobservable (§3.4) | per-minigame, read-only |
| **Checkpoint capture** (screenshot + state digest + lint result in one call) | I stitched these together per run | Playwright + `RAPresentationDirector.lint()` |

**Hard rule:** anything done through DEV MODE is recorded as DEV-REACHABLE at most. It never upgrades a result to PLAYER-REACHABLE. DEV stays behind `?dev=1`/F2 and must never be reachable on a phone.

**Not recommended now:** editing arbitrary nested state from the panel (too easy to create impossible states), or DEV controls inside SEALED/PLAYER-BLIND flows beyond the existing neutral resets.

---

## 6. Test Pilot modes

One shared control layer (§5) and one evidence format (§7), used four ways:

| Mode | State manipulation | Purpose | Pass means | Built from |
|---|---|---|---|---|
| **CONTROLLED / SURGICAL** | Allowed (fixtures, launchers, setters), always recorded | Reproduce and inspect one feature or state fast | The target behaves and presents correctly *in valid context* | DEV MODE + sweep/lint + `walk` |
| **PLAYER-PATH** | Only the declared starting save (fresh, or a save produced by an earlier player-path run). No setters afterwards | Prove reachability through normal UI | Target reached by taps only, clean return, invariants, refresh diff 0 | `playtest-qa` `drive()`/`outing()`/`routes` |
| **LIFE SIMULATION** | Starting save only | Long runs of ordinary actions to find starvation, repetition, unreachable systems, dead evenings, economy and progression stalls, over-represented content | Coverage + distribution report within agreed thresholds, 0 invariant findings | `playtest-qa --only life` (browser) + `persona-sim` (headless, many days fast) |
| **CHAOS / ADVERSARIAL** | Starting save only | Break state with odd timing and order | 0 invariant findings, refresh diff 0 after every disruption | `drive()` + an adversarial action policy |

**Life-simulation outputs I would want** (none exist as reports today; `playtest-qa --only life` prints a summary line with outings, distinct adventures, fights, save size and reloads):
- per-day list of what was offered (wants, mail, lanes, places) vs. what was taken;
- adventures never offered in N days;
- repeat counts per adventure;
- evenings with no available outing ("dead evenings");
- money curve and purchases;
- relationship levels over time;
- which apps/rooms/systems were never opened.

Run headless personas for breadth (fast, hundreds of days) and the browser for fidelity (slow, ~14 days).

**Chaos behaviours worth scripting** (each followed by invariants + `reloadCheck`):
- refresh during Morning Mail, mid-node, mid-minigame, mid-fight, during a chain hand-off, and during the wake overlay;
- open and close the phone in the middle of routes; go home (quit) from every quittable surface;
- enter an adventure and immediately leave;
- overspend to $0, then try every paid choice; buy things in odd order (a gun before the Armory is known, rooms whose prerequisites are unmet);
- ignore invitations until they expire; revisit completed one-time content through every route that ever named it;
- quit every minigame at its first frame; double-tap choices; navigate phone pages in random order;
- sleep repeatedly without going out.

---

## 7. A small evidence package

What actually helped me review a run: build identity, what was seeded, the route taken, what completed, invariant findings, refresh diffs, page errors, and **one screenshot at the moment that mattered**. What didn't help: hundreds of per-tap screenshots and prose logs.

### Proposed layout (one directory per run)

```
evidence/<run-id>/                      run-id = <mode>-<commit12>-<seed>-<utc>
  run.json            mode, commit, releaseId, build path, seed(s), widths, harness version,
                      starting save id or sha256, declared seeds [{what, why, playerBlind?}]
  start-save.json     exact starting save (or pointer to a fixture id + sha256)
  actions.jsonl       one line per player action: {t, day, scene, adv, node, action, target, result}
  transitions.jsonl   meaningful state changes only: adventure start/complete (outcome, chain),
                      minigame launch/finish/quit, fight start/end, day change, purchases,
                      money delta, relationship level change, app unlock, want offered/taken/expired
  refreshes.jsonl     {t, where, diffKeys[]}   (empty diff = pass)
  errors.jsonl        page errors, console errors, failed requests, HTTP ≥400
  assertions.json     [{id, level: REGISTERED|DEV|PLAYER|PLAYER+PRESENTATION, target, pass, evidence:[refs]}]
  coverage.json       adventures offered/taken/completed, systems opened, minigames played,
                      screens rendered vs census, never-offered list, repeat counts
  checkpoints/        NNN-<width>-<label>.png  ONLY at: route arrival, each assertion target,
                      each failure, final state   (+ NNN-<label>.json: state digest + lint result)
  end-save.json       final save
  summary.md          ≤40 lines, generated: verdict per assertion, findings, links into the files above
```

**Principles:**
- Ids and codes only, so evidence stays spoiler-safe. PLAYER-BLIND screens stay REVIEWER-ONLY.
- A reviewer reads `summary.md` and `assertions.json` first and opens other files only through their references.
- **Every seed is listed in `run.json`.** A run with undeclared seeds can't claim PLAYER level.
- Screenshots are evidence for an assertion or a failure, never a transcript.
- The package should be reproducible from `run.json` + `start-save.json` + the seeds.

`playtest-qa`'s `report.json` `{build, results, findings, log}` is the natural starting point: split `log` into `actions`/`transitions`, and turn `results` into `assertions`.

---

## 8. Known coverage gaps at `d526c7f`

1. **The Presentation census skips final adventure nodes.** End nodes with lines are player-visible but never dry-run or swept (e.g. A31 `fade`, verified manually in 05B; A30 `wakeup`). Screens that appear only on an end node are uncounted.
2. **TOUGE natural finish.** The harness quits rather than finishing on baseline and current alike (§3.4). The TOUGE HUD face (locked/spun) is code-verified only.
3. **Headless vs live discrepancies.** Dry-run lint can pass while live lint fails (§3.7). Headless tests can't render phone apps (§2.2). Non-actor `props` aren't linted (§3.9).
4. **Inherited context / node isolation.** DEV RUN and ad-hoc jumps create impossible states (§3.6). The sweep reconstructs env/cast, but not vars or applied `enter` effects.
5. **Weighted and random content isn't deterministic.** Wants are seeded per day; pier catches, PICKUP AI and TOUGE input mix `Math.random`/`performance.now`. "Happens within N days" is the only honest assertion today.
6. **Runtime-bound casts.** They are only in the census where the adventure declares `presentationVariants` (DATE, A46, A20, A33, A57 at `d526c7f`). Other runtime-bound casts (e.g. A41's companion) are rendered for one representative or none.
7. **PLAYER-BLIND prerequisites** (Ogun's Rave, The Property) are seeded as outcome flags in route proofs and exercised separately for function.
8. **No real mid-life v12 fixtures.** Migration fixtures predate v12 life.
9. **Life-simulation reporting** is a single summary line. There's no starvation, repetition, dead-evening or economy report.
10. **Entrance cues without the person on stage (05B).** 20 `E(person)` cues fire in a node where that person is not staged. I checked each against the adventure's cast and its fights:
    - **Staged in another node of the same adventure (1):** A37 (Bunmi, at the party).
    - **On screen only as the Combat 2.0 enemy (6):** A23 (Hilt), A29C (bard, cleric, paladin, Coffe), A44_N3 (Buckhead). They are seen, but only in the fight.
    - **Never staged (13), the possible genuine presentation gaps:**
      - the MEET beats for **Emberly (A_EMBERLY1), Jade (A_JADE1), Lo (A_LO1), Hina (A_HINA1), Anfeesa (A_ANFEESA1)**;
      - **A18** (Kaede), **A25** (Nightshade), **A38** (Brenda);
      - also MOONIE_MEET (Moonie), A29 (Coffe), A33 (J-Circle), A41 (Trippin' Red, a performer) and A55 (Anfeesa at the booth).
    - This corrects the looser example in `SHIP015_INTEGRATION_001.md` §6, which grouped A29C with "staged later". A29C's cast is seen only as fight enemies.
    - These are observations for the next OPEN completeness pass. Engineering 05/05B kept the no-new-cast rule. A31 (God) was staged only because the node text seats her beside Rich and Art staged it.
11. **PICKUP's other three players** remain placeholder figures (NC-FA-07); only Rich (frozen) and, at game end, the OG (Ship 015) are frozen art.
12. **Ship 014/015 files registered but unwired** (46 + 2), each with its reason in the runtime maps. Test Pilot should report them at REGISTERED, not as failures.

---

## 9. Architecture principle for the next agent

**One game, one shared testing control and evidence layer, several modes.**

| Reuse as is | Generalize | Replace | Keep separate |
|---|---|---|---|
| `release.mjs` gate and its suites; `loadBtf`/`walk`; `reachability-audit` (classification + proofs); the frozen-art gate and runtime maps; `presentation-adventure-dryrun` and the Wave locks; `playtest-qa`'s `probe`, `invariants`, `reloadCheck`, `diffKeys`, `drive`, `playMinigame`, `newPage` error capture | Move `playtest-qa`'s helpers into a shared module (`tools/pilot/`), used by the player-path, life and chaos modes. Turn the proof seeds and harness setup snippets into named **scenarios** in one place, shared by DEV MODE and the tests. Extend the census to end nodes and to declared runtime-bound casts. Give `persona-sim` and `life` one coverage report format | `btf-browser-test`, `party-browser-test` and `rave-browser-test` (stale assumptions, unpinned browser) once their scenarios are covered by the shared layer. Ad-hoc `evaluate` setup snippets inside scenarios | The release gate stays fast and headless (no browser). REVIEWER-ONLY evidence stays out of the repo. DEV MODE stays behind `?dev=1`/F2. SEALED and PLAYER-BLIND flows keep neutral hooks and are exercised for function only |

**Guardrails I would keep:**
- A result's reachability level is decided by the **mode that produced it**, never by what the target is.
- Before calling anything a regression, rerun it on the baseline build with the same harness and seed.
- Every "cannot reproduce" must say which of §8's gaps it falls into.

---

*Engineering 05/05B retired after this handoff. No runtime, gameplay, Art, balance, story, save-schema, SEALED or testing-code change was made to write it.*
