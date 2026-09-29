# F13 HOLISTIC BALANCE HARNESS

**INFRASTRUCTURE ONLY.** This tool simulates the integrated game headlessly so a later F13 pass can read economy,
HEAT, progression and mission data. It changes no gameplay number and declares no economy value good or bad. It is
not a balance verdict.

## What it is

A deterministic, seeded, headless driver over the **real** game services. It reuses:

- `tools/btf-test.mjs` `loadBtf` — the accepted production load order with IF-1 spliced in, every fragment flag OFF.
- `tools/pilot/headless.mjs` — `drive`/`driveChain`/`offers`/`seed`, the existing headless control layer (real
  adventure engine calls, real route surfaces, real stores).
- The IF-1 observation seam (`RAStateWatch`) and services (`RAMoneyLedger`, `RAHeat`, `RASocial`, `RACrew`,
  `RAVehicles`, `RADistricts`, `RASalesChannels`).

It never reimplements game logic. Minigames and fights are canvas-driven and cannot run headless, so their **results
are synthesized by the policy** (the adventure engine then applies real rewards and routing). Synthetic monetary
rewards are **OFF by default**, so economy metrics only ever see rewards the accepted code grants.

## Run it

```bash
node tools/f13/cli.mjs --seeds 1,2,3 --policies conservative,randomized --days 30 \
  --seed-flows ogunsRave,supra,property \
  --out report.json --csv summary.csv --series series.csv
# npm run sim:f13 -- --seeds 1 --policies completionist --days 30
```

Options: `--days`, `--max-actions`, `--start post-prologue|fresh`, `--synthetic-rewards`, `--fragment-flags F05.trap=true` (via API),
`--capture-state`, `--include-actions`, `--quiet`, `--no-gate`.

Exit code is non-zero when an invariant fails (a correctness problem), unless `--no-gate`.

## Module map

| file | role |
| --- | --- |
| `game.mjs` | headless loader wrapper (accepted `loadBtf`) |
| `rng.mjs` | harness-only deterministic PRNG + restorable state |
| `serialize.mjs` | snapshot / normalize / fingerprint / reload |
| `adapters.mjs` | fragment + service adapters: `AVAILABLE` / `NOT_AVAILABLE` |
| `contracts.mjs` | source-derived bounds (rank, trust) + once-only probe |
| `catalog.mjs` | legal action catalogue + executor (thin bindings to real services) |
| `policies.mjs` | policy interface + six neutral QA policies |
| `metrics.mjs` | economy / HEAT / progression / mission / failure metrics |
| `invariants.mjs` | reusable invariant checks |
| `run.mjs` | the day loop (`RAClock.sleep` is the only day advance) |
| `report.mjs` | JSON / CSV / human output |
| `cli.mjs` | command line entry |

## Policies (QA tools, not canon archetypes)

`conservative`, `spend-heavy`, `completionist`, `low-risk`, `high-risk`, `randomized` (seeded). A policy only ever
selects an action the catalogue marks **executable** and currently legal. Policies do not know final balance.

## Metrics schema (`f13.metrics/1`)

```
cash        { series[{day,money,netWorth}], min, minDay, max, maxDay, final, netWorthFinal }
income      { bySource{}, byFamily{}, totalIn }        // accepted RAMoneyLedger
expense     { bySource{}, byFamily{}, totalOut }
bankruptcy  { nonPositive[], everNonPositive, minCash }
heat        { series[{day,value,tier}], max, tierChanges[] }
progression { series[], rank, rankTitle, trust, gangClout, streetClout, streetCloutPoints, reputation, tendency, newOgaStatus, missions{} }
missions    { records{}, completed[], surfaced[], notSurfaced[], completionEvents[] }
relationships { met, byLevel{}, people[] }
inventory   { items{}, props[], followers }
assets      { cars[], guns[], rooms[], properties[] }
crew        { status, reason, ids? }
failures    { count, errors[], abandoned, repeated[], softlocks[] }
unreachable { adventures[], surfacesNotDriven[] }
duplicates  { onceOnly[], historyIds[] }
suspicious  [{ code, ... }]
ledger      { saturated, entries, sources[], byFamily{} }
duration    { days, endDay, firstCompletionDay, milestones{} }
activity    { actions, changed, stalls{longest,start} }
```

## Invariants (`13` checks)

money finite · rank legal (source-derived ladder) · trust within authored-delta bounds · HEAT non-negative + tier
contract · NEW OGA once-only guard consistency · GONE crew is terminal · no illegal/unavailable content selected ·
harness daily action cap (internal adventure loops are bounded separately by the `drive()` step ceiling, the
`driveChain` chain-depth guard, and the repeated-failure metrics) · no duplicate once-only payout · unique history
ids · feature OFF creates no fragment progression · save namespace allowlist · money ledger conservation.

## Missing fragments today

At this base **no campaign fragment is integrated** (`js/frag/` has no fragment manifest). The harness reports every
fragment `F01–F12` as `NOT_AVAILABLE`, and the fragment-populated IF-1 content (crew units, districts, TRAP/RAINMAKER
channels) as `NOT_AVAILABLE` while the services themselves are available. Nothing is cherry-picked; the adapters
flip to `AVAILABLE` automatically as fragments land.

## Limits (documented, not hidden)

- Minigame/fight outcomes are synthetic by policy (canvas games cannot run headless); synthetic rewards are off.
- Player-contact legacy flows (Ogun's Rave, The Property, I Want a Supra) are **declared seeds** (`--seed-flows`),
  matching the project's existing PLAYER-BLIND handling.
- The accepted `RAMoneyLedger` keeps the last 500 entries in memory; all-time source **totals** remain exact, and
  `ledger.saturated` flags a long run.
- Driving the real engine is I/O-light but not free; a run is roughly linear in days × actions.
