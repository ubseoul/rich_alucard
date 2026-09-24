# BTF ROUGH COMPLETE — CHECKPOINT 1 (OPEN coverage)

- **Branch:** `claude/eloquent-shannon-kc5qkn` (not merged, not deployed; Pages only deploys `main`).
- **Code SHA verified:** `001e7095522fc54fdcdca34c53b898c66992eec9` (this report is the commit after it).
- **Save schema:** v12 (additive migration from v11; existing Rave/Property/Supra/people/history preserved).

## What is playable
- New life: START → A00 ocean prologue → existing CEO throne fight → bedroom → A02 Day 1 (Oct 1 family ping) → the life clock (sleep-only time, Morning Mail, rain nights, full moons, Shannon Fridays, $100K budget months).
- Phone Life OS: canon seven + TEXTS, HATCH, TOUGE, BARS, RICH RADIO, RECEIPTS; VampGPT WHAT WE ON + MAKE MONEY / MEET PEOPLE / GO SOMEWHERE.
- 110 authored adventures across W1–W5 (A00–A58 open set, repeatable forms, top-5 arcs, meet scenes for all 22 women), date loop with per-woman content (10 × 3 dates, 12 × 1), Combat 2.0 (Bonesworth, Hilt, Vicky's Party, Lil Smack, Kevins…), castle rooms, property listings, cars incl. RICHBOIMPORTS, music cook → real catalog → drops → shows, dragon egg → majestic → human form, ecology/Hilt, parties + hosting, fame ending with RECEIPTS credits.
- FEEL BATCH (Play Window A): `minigame-lab.html` — TOUGE, GARAGE, PIER, HATCH, BARS, SLURP, JOLLOF WARS, HOOKAH RINGS, PICKUP.

## Tests run
- `npm test`: party, rave, Ogun's Rave, Property, 9 minigame logic suites, BTF gate (v12 migration + idempotency on every fixture, calendar, clock/budget/rent/family, 110 adventure graphs validated incl. [VP] marking, 258 branch walks win+lose) — PASS. `npm run build` + `verify:artifact` — PASS.
- Browser (Chromium 390×844 / 360×740): new-game path incl. reload/resume and a sleep; ~20 adventures driven to completion; all phone apps; migrated-save Rave + Property regression — zero page errors.
- Persona sims (`node tools/persona-sim.mjs`): Homebody, Party Animal, Landlord, Weirdo each reach the protected ending on Day 36 with 31–39 distinct adventures. The sims are hyperactive (≈4 outings/day), so the Day-35 floor binds; real pacing should land later in the 35–50 window.

## Known roughness
- All new environments/characters are honest RAPixel placeholders (`docs/btf/ART_INPUTS.md`: 61 envs, 56 characters, Rich contextual states, creatures, vehicles).
- Only BLOODBATH audio exists; the other four loops show "LOOP PENDING".
- Non-Rich dialogue is functional draft text pending HQ Story; tuning is VOL 3 v1 (normal fights are easy; bosses match VOL 3 targets in simulation).
- Momentum saturates quickly for very active play; lit threshold/caps are tunable in `js/systems/life.js` / `js/systems/fame.js`.
- Throne-room and bedroom composed art are not rescaled to 1.85× (deliberate; see DECISIONS).

## Required Art/Audio inputs
See `docs/btf/ART_INPUTS.md` (generated). Priority for Play Window B: The Grave, Kiki, Blueberry Mazda stages, Pinky + S15/Supra top-down, Nneka, Castle exterior, Party Hall, Bonesworth, the four missing song loops.

## Unresolved [VP] voice slots
239 draft Rich lines in `docs/btf/VP_LINES.md` (regenerate with `node tools/vp-lines.mjs`). Also Ube-named items: the sphynx cat (placeholder EGUSI), family names, Maggi vs Magi label.

## Sealed hooks waiting for HQ
Neutral slots S01–S08, ARC-X, HQ-M01–M03, SPARK, PRESSURE, LEDGER, CUBE, CHEST, DRAGON2, CRYPTRAT, PROPERTY, TENDENCY fire as no-ops (`js/systems/sealed.js`); `js/sealed/pack.js` is the empty install slot. Provisional tunings (pressure levels 2/4, neutral spark) are replaced wholesale by a pack.

## Next
Continue in a fresh session (this one's context is large): (1) HQ-authorized sealed session installs the pack; (2) Art Ships against ART_INPUTS; (3) Ube Voice Harvest over VP_LINES; (4) Play Window A (feel batch) now, Play Window B after art/voice. CRACK stays canon-locked until Ube sets it.
