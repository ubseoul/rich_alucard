# F06 production port handoff

## Scope and behavior

Approved pure core and tunables copied byte-for-byte to js/frag/F06 so the frozen fragment loader can discover them without editing its ownership rules. The polished renderer/input path is retained; its only executable delta is an idempotent destroy method plus a guard against delayed font redraw after disposal. Core duration, bill value ($100), pacing, gesture model, scoring and budget presets ($5K/$10K/$25K) are unchanged. The broader OPEN club patch is not reimplemented.

Production-only compatibility behavior:
- A selected budget requires enough real cash; selecting/restarting reserves no money and refunds none.
- Each flick is an immediate rainmaker:flick expense through RASalesChannels/RAMoneyLedger.
- Results persist once per round in save.frag.F06; no payout, Clout, inventory or dancer favor is invented.
- Reload abandons an unfinished round and retains paid expenses; it never replays costs or completions.
- BACK/Escape/scene departure/flag OFF stop and dispose the canvas and return focus.
- The DARK phone app is declared through RAPhoneRegistry. Production unlock/activation is a caller/integration-owner handoff, not an invented shared flag or progression rule.

No migration version is requested: F06 declares additive lazy namespace defaults. Shared migration ledger is unchanged.

## Audio

Source: rewritten F11 branch frag/audio-completion/001 at 9eb87323caa88252a98b931879d0712d4e235304.
RM_01–RM_08 and their metadata are imported from its F06-owned part. MP3 bytes are unchanged, relocated under assets/f06/audio to respect fragment ownership. RM_01 load, RM_02 flick and RM_04 hit consume the known registered one-shots; other authored codes are registered for future club consumers. No invented IDs, synthesis, ambience loop or optional broader club feature.
If F11 is also integrated, the owner must use ONE F06_rainmaker part and reconcile its asset path rather than declare the same IDs twice.

## Verification

- Approved core suite: PASS, 20 groups.
- Original polished real-browser acceptance suite: PASS, 34/34 at 360/390/430 and CDP touch; first width uses a natural 30-second round. Test paths were remapped to F06; checks unchanged.
- F06 deterministic persistence/ledger tests: PASS (actual saved JSON, three reloads, duplicate charge/completion, no payout, shared-state equality, budget refusal, dark flag, disposal).
- Core/tunable and RM asset byte-fidelity tests: PASS.
- Projected production browser: PASS (temporary generated loader response, real phone route, real pointer expense, partial reload, natural result, reload after completion, BACK/Escape, flag OFF, no page errors).
- IF-1 services, migrations, zero-change (72 route plays), registry parts, sealed containment, wake bus: PASS.
- Leak checker source: PASS.
- Source npm test and loader verification: FAIL at stale generated index; F06 files deliberately await owner regeneration.
- OL-019 path guard from current origin/main: existing baseline tools/tests/if1/sealed.test.mjs is rejected by its SEALED path pattern; empty slot is comments-only. F06 additions introduce no protected path.

## Required owner actions / blockers

1. Regenerate the shared production index with node tools/loader.mjs sync, then rerun npm test and loader verification. This is explicitly integration-owner-only in docs/engineering/INTEGRATION_OWNER.md. The shipped branch does not edit index.html or any IF-1 service.
2. Connect authored club access/unlock to RAPhoneRegistry.unlock('rainmaker') and decide activation. The projected browser unlock uses the canonical service only as a test fixture; no production flag is promoted.
3. Reconcile the existing OL-019 guard rejection of the IF-1 sealed architecture test; install current guard enforcement on the integration lineage if required. Do not weaken it in F06.

Final disposition: REPAIR REQUIRED pending owner integration. No main merge, no F07, no sealed content or frozen art change.

## Final validation evidence

Separate detached validation checkout: ../f06_validation. Only that checkout's generated index was synchronized. Full npm test: PASS (146 JavaScript syntax checks, 121 adventures / 348 branch walks, presentation/art/reachability, all F06 and IF-1 suites, containment). The deliverable branch index remains unchanged and its loader gate remains pending owner work.

Source-fidelity tests use approved golden hashes so they work in shallow CI checkouts without fetching the source branches. Exact core/tunable Git blob equality was separately verified. Owner-surface audit: PASS, 25 F06-owned changed files. Leak source and commit-range checks: PASS. Branch remains local; no push attempted while the owner handoff is incomplete.

> **FCPB CONVERGENCE UPDATE.** RAINMAKER's production unlock is wired by the integration owner (`js/if1/first_event_unlock.js`): `RAPhoneRegistry.unlock('rainmaker')` fires once, persisted, after the player's first completed event (a `RAWorldEvents` record reaching `resolved`); the flag alone never unlocks it. See `docs/engineering/FCPB_CONVERGENCE_001.md`. No flag was promoted.
