# F13-A — HOLISTIC BALANCE SIMULATION HARNESS

Status: **INFRASTRUCTURE DELIVERED — READY FOR F13 HARNESS AUDIT.**
No gameplay number was changed and no economy value is declared good or bad. F13 balance itself is **not** done.

- Base: `integration/ube-portal` @ frozen IF-1 `101a394b5fa9c41ec089bc7022ee86ff43f5f31c`
- Branch: `frag/f13-balance-harness/001`
- Scope: reusable deterministic simulation tooling only.

## 1. Architecture

The harness drives the **real** game headlessly; it reimplements no game logic and changes no numbers.

```
tools/f13/
  game.mjs        headless loader (accepted tools/btf-test.mjs loadBtf; IF-1 in; fragment flags OFF)
  rng.mjs         harness-only PRNG (mulberry32) with restorable stream position
  serialize.mjs   snapshot / normalize(volatile scrub) / sha256 fingerprint / reload
  adapters.mjs    fragment + service adapters -> AVAILABLE | NOT_AVAILABLE (never fake)
  contracts.mjs   source-derived bounds (rank from RANewOga source, trust from RANewOgaTunables)
  catalog.mjs     legal action catalogue + executor (thin bindings to accepted services)
  policies.mjs    policy interface + six neutral QA policies
  metrics.mjs     economy / HEAT / progression / mission / failure metric collector
  invariants.mjs  reusable invariant checks
  run.mjs         day/night loop; RAClock.sleep is the only day advance
  report.mjs      JSON / CSV / human output
  cli.mjs         command-line entry
tools/tests/f13/  adapters · determinism · flags · invariants · output · policies · serialize
```

Reuse (no duplication): `loadBtf` (production load order), `tools/pilot/headless.mjs`
`drive/driveChain/offers/seed`, `RAStateWatch`, `RAMoneyLedger`, `RAHeat`, `RASocial`, `RACrew`, `RAVehicles`,
`RADistricts`, `RASalesChannels`, `RANewOga`, `RACars`, `RACastle`, `RARealEstate`, `RADating`, `RARelations`.

**Determinism.** One seed + policy + RNG position reproduces byte-identical state (`fingerprint`), action trace,
save/reload continuation, and split-vs-whole run. `serialize.mjs` scrubs the only volatile save fields the accepted
code writes (wall-clock `at`/`…At`, the `Date.now()` embedded in the accepted rent-collection id).

**Missing fragments.** Presence is decided by `js/frag/<ID>/manifest.json` (what the loader actually expands), never
by a reserved flag. A missing fragment/service surfaces `NOT_AVAILABLE` with a reason. Nothing is cherry-picked.

## 2. Player policy model

Interface: `chooseAction(legalActions, env)`, `choose(choices, env)`, `minigame(...)`, `fight(...)`. The runner only
ever hands a policy actions marked **executable/legal**; the invariant `unavailable-content-not-selected` enforces it.
Neutral QA policies (not canon archetypes): `conservative`, `spend-heavy`, `completionist`, `low-risk`, `high-risk`,
`randomized` (seeded). Minigame/fight outcomes are synthesized by policy (canvas games cannot run headless); synthetic
**rewards are OFF by default**, so the measured economy only sees accepted-code rewards.

## 3. Metrics schema (`f13.metrics/1`)

`cash{series,min,max,final,netWorthFinal}` · `income{bySource,byFamily,totalIn}` · `expense{…}` ·
`bankruptcy{nonPositive,everNonPositive,minCash}` · `heat{series,max,tierChanges}` ·
`progression{series,rank,rankTitle,trust,gangClout,streetClout,reputation,tendency,newOgaStatus,missions}` ·
`missions{records,completed,surfaced,notSurfaced,completionEvents}` · `relationships{met,byLevel,people}` ·
`inventory{items,props,followers}` · `assets{cars,guns,rooms,properties}` · `crew{status}` ·
`failures{count,errors,abandoned,repeated,softlocks}` · `unreachable{adventures,surfacesNotDriven}` ·
`duplicates{onceOnly,historyIds}` · `suspicious[]` · `ledger{saturated,entries,sources,byFamily}` ·
`duration{days,endDay,firstCompletionDay,milestones}` · `activity{actions,changed,stalls}`.

Outputs: canonical JSON (`f13.report/1`), summary CSV, long-format per-day series CSV, and a human summary. CLI:
`npm run sim:f13 -- --seeds 1,2 --policies conservative,randomized --days 30 --seed-flows ogunsRave,supra,property`.

## 4. Invariants (13)

money finite · rank legal (source-derived ladder `[0,4]`) · trust within authored-delta bounds · HEAT non-negative +
tier contract · NEW OGA once-only guard consistency · GONE crew terminal · no illegal/unavailable selection · no
infinite action loop · no duplicate once-only payout · unique history ids · feature OFF creates no fragment
progression · save-namespace allowlist · money-ledger conservation.

## 5. Sample deterministic runs

20 days, `--seed-flows ogunsRave,supra,property`, seed 1 (all invariants pass, 0 failures each):

| policy | final $ | min $ | heat | rank | trust | income | expense | completions | stalled |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| conservative | 26,493 | 22,000 | COOL | 0 | 0 | 5,250 | 78,757 | 41 | no |
| spend-heavy | 26 | **0 (day 14)** | COOL | 0 | 0 | 1,020 | 100,994 | 43 | no |
| completionist | 2 | 2 | COOL | 0 | 0 | 1,020 | 101,018 | 53 | no |
| low-risk | 26,842 | 22,216 | COOL | 0 | 0 | 5,580 | 78,738 | 36 | no |
| high-risk | 59,429 | 22,000 | WARM | 0 | 0 | 37,429 | 78,000 | 12 | no |
| randomized | 17,009 | 17,009 | COOL | 0 | 0 | 1,365 | 84,356 | 39 | no |

`spend-heavy` reaches $0 on day 14 → a **bankruptcy/starvation point** the harness reports (`bankruptcy=true`).

**Seed divergence** (same policy, different seed) — 20 days:

| seed | policy | final $ | rank | trust | heat | completions | fingerprint |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | randomized | 17,009 | 0 | 0 | COOL | 39 | `3a0eb5f5…` |
| 2 | randomized | 23,621 | 0 | 0 | COOL | 35 | `deb0da4b…` |
| 1 | completionist | 2 | 0 | 0 | COOL | 53 | `db218be9…` |
| 2 | completionist | 13,109 | **4** | **3** | **WARM** | 62 | `cc6dab44…` |

**Mission-resolution demonstration** (seed 2, completionist, 20 days): the full accepted NEW OGA ladder resolved —
M1 `TOUGE_ESCAPE` → M2 `flex`/`work_off` → M3 `complete` → M4 `beat_2` (Alternative) → M5 `BACK_OUT` → M6 `walked`
→ M7 `take`; `rank 4 · SENIOR ASSOCIATE · trust 3 · HEAT 7 (WARM, tier change day 8)`; `m8Held=true`, M8 content
absent. Income families `adventure 1,720 / new_oga 12,000`; expense `untagged 78,000 / adventure 22,611`;
`duplicates.onceOnly=[]`, `failures=0`.

## 6. Unsupported / missing fragment list (at this base)

- **Fragments F01–F12 — NOT_AVAILABLE** (`js/frag/` has no fragment manifest; no cherry-picking).
- **IF-1 content inside present services — NOT_AVAILABLE**: crew units (none defined), districts (none defined),
  TRAP / RAINMAKER sales channels (reserved, unclaimed). Services themselves are AVAILABLE.
- **Surfaces not driven headlessly** (`unreachable.surfacesNotDriven`, ~27/run): go-handler / UI-only surfaces with no
  adventure resolvable. Reported, never faked.
- **Adventures never surfaced** in a run (`unreachable.adventures`): content gated by progression the policy did not
  reach — reported per run, not a balance claim.
- **Player-contact legacy flows** (Ogun's Rave, The Property, I Want a Supra): declared `--seed-flows` only.

## 7. Tests

`npm run test:f13` (also runs inside `npm test` via auto-discovery):

- `determinism` — same seed ⇒ identical fingerprint + trace; seeds diverge; save+reload continuation; split == whole.
- `policies` — six policies; no policy selects a non-executable action; no legality/loop invariant failures.
- `serialize` — volatile scrub; captured save reloads to the same fingerprint.
- `adapters` — F01–F12 NOT_AVAILABLE; crew/districts/sales content NOT_AVAILABLE; manifest detection.
- `flags` — default all-OFF writes no fragment namespace; forcing `F05.trap` ON still yields NOT_AVAILABLE content.
- `invariants` — source-derived bounds; once-only idempotency probe; reporter catches fabricated corruption.
- `output` — JSON schema, summary/series CSV, human summary.

Full repo gate: `npm test` is green (all existing suites + 7 f13 suites; 140 JS syntax checks; loader/leak/IF-1
contracts unchanged).

## 8. Handoff

- Final SHA: see branch tip.
- Files: `tools/f13/*` (12 modules + README), `tools/tests/f13/*` (7 suites + `_lib.mjs`), `package.json` scripts
  (`test:f13`, `sim:f13`), this doc.
- No tuning: no prices, rewards, penalties, probabilities, HEAT values or thresholds were modified.
- **F13 balance is NOT complete.** This is the tooling the later F13 pass runs on once F01–F12 are integrated.
