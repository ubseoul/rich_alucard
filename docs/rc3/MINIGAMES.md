# RC3 minigames · Build B · OL-074

Base: `origin/integration/rc2` at `ae87ec4`. Branch: `rc3/club-001`.

| Game | Decision | Distinct play loop |
| --- | --- | --- |
| Strip club / Make It Rain | Flagship rebuilt | Aim a bill fan at one moving dancer per night, time spotlight throws, build combos and hype, trigger encores, earn persistent VIP tiers. |
| Ogun's rave / Dance | Keep, rebuild rave route | Four rhythm lanes at 126 BPM, blend into the vampire crowd under pixel blood rain, then the hunter crashes directly into combat. The same rhythm engine serves owambe dancing with its own setting and rewards. |
| Slurp / ramen | Keep, polish | Read four-part tickets, assemble bowls in sequence, manage the queue, serve fast for tips. New visible ingredient hints, bowl streaks and shift receipt. |
| TOUGE | Keep | Steering, throttle, countersteering, drift chains, different handling by car. |
| Garage | Merge into TOUGE preparation | Parts shopping/tuning utility reached from the existing garage route; removed from the playable minigame roster. No standalone game claim. |
| Owambe collection | Keep | Catch sprayed money while managing auntie suspicion. Authored debt target and payout fractions stay intact. |
| Hatch | Keep | Persistent dragon care with mood, growth and companion consequences; story-specific care variants remain compatible. |
| Pier | Keep | Cast, read the bite, balance reeling against line tension, collect varied catches. |
| Bars | Keep | Rhyme recognition with false friends, speed and streak pressure. |
| Jollof Wars | Keep | Four cooking stages with timing, heat control and judges. Different inputs and pacing from ramen service. |
| Hookah rings | Keep | Inhale, shape rings, thread existing rings and interact with sky targets. |
| Pickup | Cut | Generic charge-and-release shot game overlaps the stronger timing loops. Hidden from the roster; an existing story save entering this old route receives a reward-free `retired` result and continues immediately. Pure legacy rules stay for compatibility tests; players cannot enter the retired game. |

No Build A phone/story/cut files are changed. Frozen art files are untouched. Dancer cards are rendered as new 42×48, 24-color canvas portraits from their frozen originals; animations use hard alpha and nearest-neighbor rendering. Roxy, Rosalyn and Emerald are adults 21+.

## Club mechanics

- Night 1 Roxy, night 2 Rosalyn, night 3 Emerald; repeats every three days. A visit locks its performer. Off-night cards show the rotation and existing support progress.
- Platform turns and moves left/right over a 4.8-second cycle. Its visible axis uses the exact F06 collision target (±22% of stage width). Spotlight hit windows and release-time collision snapshots remain authoritative.
- Paid tips retain the existing once-only ledger debit, first-visit discount/cap and per-dancer support/date progress, including misses. No income is fabricated.
- Consecutive hits add a tip-to-hype boost of +25% per hit, capped at ×4. Misses break the combo and remove 120 hype. The original F06 on-beat/spotlight/fan/streak multipliers remain active.
- At 3,000 hype, a five-second encore adds gold platform lights, pixel confetti and a max-hype announcement; then hype resets for another build. Each encore is saved once.
- VIP tiers at 1 / 4 / 9 lifetime encores: Front Row / Velvet VIP / Headliner. Each tier adds 10% hype efficiency, Velvet VIP upgrades stage lights, and Headliner labels the gold stage. VIP and best combo survive departure/reload.

## Rave flow and progression

Arrival → Ogun greeting → four-lane blood-rave rhythm → doors crash open → Rich: **“oh shit, that's Blad33ee!”** (OL-075) → BLAD33EE fight using the existing hunter faction → exterior closeout → completed night and castle-party unlock.

Quitting rhythm keeps a retryable floor phase. Either rhythm outcome triggers the hunter; either combat outcome advances the night. Legacy `banter` / `sprinklers` saves resume at the floor; `tension` / `deescalate` saves resume at the hunter entrance. A saved fight resumes through the existing combat engine. The underlying `bllad33` actor key remains solely to resolve approved frozen art and existing relationship continuity.

## PLAY

Offer, crew/car, live chat, decisions and return share RC2 Life OS colors, Monogram/Tiny5 type, square pixel borders and offset shadows. Live chat header has two rows so all crew avatars fit. One frozen idle hand plus the thumb overlay moves as a rig over a code-drawn quilt; the static base containing a second hand is no longer composited beneath it. Simulation, odds, capture bands, decision clocks and canonical result handling are unchanged.

Validation: `npm test` and `tools/rc3/build-b-browser.mjs` (real pointer/keyboard inputs, Edge Chromium, 390×844). Evidence and final results: `docs/rc3/evidence/build-b/`.
