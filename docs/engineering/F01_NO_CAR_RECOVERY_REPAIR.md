# F01 NO-CAR RECOVERY REPAIR (closes F13 R1 + R2)

**Base:** `claude/quirky-ptolemy-1eccex @ b4593fd` (F13 balance complete). Surgical F01 repair; no F13 value, art, audio, copy, economy or rule changed.

## Root cause
- **R1.** In embed mode `runEmbedded` (`assets/f01/play/feel-ui.mjs`) called `AD.pitchFor` and returned its `NO_CAR` / `NO_CAR_FITS` refusal **before** the home scene that offers `GET IT BACK`. With the Supra and Urus lost, every job was refused and the recovery surface could never be reached.
- **R2.** `pitchFor` skipped `canRoll` for EXTRACT, so with zero cars `carStage` read `options[0].id` of an empty list (`engine.mjs`) -> `PLAY_ERROR`; F04 never got the captive back.

## Repair
- `adapter.mjs`: `needsRecovery(w,picked)` / `recoverableCars(w)` / `isCarRefusal` — a car refusal is final only when no lost car can be got back. `pitchFor` now applies the same `canRoll` gate to EXTRACT (every job already went through it), so zero cars is a `NO_CAR` / `NO_CAR_FITS` **refusal**, never a crash. A refusal commits nothing; F04 (which owns the captive clock) keeps the captive exactly as it was.
- `feel-ui.mjs` `runEmbedded`: if the refusal is a car refusal and a lost car is recoverable, the existing home scene (`GET IT BACK`) is shown first, then the job is judged again; what was got back is persisted even if the job still refuses. Otherwise unchanged.
- `runHeadless`: the same gate, with the player taking `GET IT BACK` (same `W.recoverCar(w,id,{fee:0})` call the home scene makes), so the F13 harness measures the real flow.
- Recovery is the **existing authored call, unchanged** (`recoverCar`, fee 0 as the home scene already calls it). No price, free car, loaner, penalty, dialogue or unlock was added. **Car recovery price stays SOURCE_REQUIRED (F13 S1).**

## Tests
`tools/tests/f01/norecovery.test.mjs` (headless, in `npm test`) and `tools/tests/f01/play-sim/norecovery_browser.mjs` (real Chromium, real embed scenes).
