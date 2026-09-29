# INTEGRATION OWNER — single-owner surfaces after F00 (IF-1 v1.0)

From F00 onward exactly one role — the **integration owner** — controls the shared architectural surfaces below. Fragment builders
produce branches and commits **in their own files**, talk to the game through IF-1 interfaces, and never merge. The integration
owner merges, cherry-picks, resolves conflicts, assigns schema versions, orders the loader and promotes feature flags.

Machine-readable source of truth: [`tools/if1/owner-surfaces.json`](../../tools/if1/owner-surfaces.json), enforced by
`node tools/check-owner-surfaces.mjs --base <ref> [--fragment F01]` and `.github/CODEOWNERS`.

## Integration-owner-only files

| Surface | Files |
|---|---|
| IF-1 itself (all services, registries, contracts) | `js/if1/**` |
| Integration base SHA · merges · cherry-picks · reconciliation | (process — the owner alone) |
| Migration authority + version assignment | `js/engine/state.js`, `js/if1/migration_ledger.js`, `js/if1/migrations.js`, `js/data/save_fixtures.js` |
| Script loader / load order | `js/loader/manifest.json`, `index.html` (generated `LOADER` regions), `tools/loader.mjs`, `tools/sync-index.mjs` |
| WAKE/NIGHT event bus + mission voice-note arbiter | `js/systems/life_clock.js`, `js/systems/temptations.js` (`RAWakeTriggers`), `js/if1/wake_bus.js` |
| Phone registry / phone core / hierarchy | `js/scenes/phone.js`, `js/phone/apps_core.js`, `js/data/phone_hierarchy.js`, `js/if1/phone_registry.js` |
| Combat 2.0 core extension surface | `js/engine/combat2.js`, `js/scenes/combat2.js`, `js/if1/combat2_ext.js` |
| Art / audio shared registries | `js/data/art_registry.js`, `js/data/art/registry_parts.js`, `js/data/audio_manifest.js`, `js/data/audio/manifest_parts.js`, `js/engine/audio.js` |
| Sealed slot + private overlay / leak protection | `js/sealed/**`, `js/systems/sealed.js`, `tools/overlay.mjs`, `tools/leak-check.mjs`, `tools/if1/leak-rules.json`, `tools/hq-mirror.mjs` |
| Regression / CI architecture | `tools/release.mjs`, `tools/run-tests.mjs`, `tools/verify-all.mjs`, `tools/nightly-smoke.mjs`, `tools/btf-test.mjs`, `tools/if1/**`, `tools/tests/if1/**`, `package.json`, `.github/**`, `.gitignore` |
| Feature-flag defaults | `js/if1/flag_defaults.js` (the only place a flag ships ON) |
| IF-2 coordination (later) | this document + `docs/engineering/IF1_*.md` |

## What a fragment owns (work here)

`js/frag/<ID>/**` (its code, `manifest.json`, optional `migrations.js`), `js/data/art/parts/<ID>_*.js`,
`js/data/audio/parts/<ID>_*.js`, `tools/tests/<id>/**`, `docs/engineering/<ID>*.md`, `assets/<id>/**`.
Anything else — including accepted content files — is changed only through an integration-owner-authorised ticket.

## Fragment workflow

1. **Flags.** Register DARK flags in your own file: `RAFeatures.register({id:'F03.thing',fragment:'F03'})` (reserved top-level
   flags `F01.showdown … F07.m8_and_finale`, `F02.armory` already exist). You may never register a flag that defaults ON.
2. **Files.** List your scripts in `js/frag/<ID>/manifest.json` (`{"files":[...],"css":[...]}`). The owner runs
   `npm run loader:sync`; you do not edit `index.html`. `npm run loader:verify` must pass.
3. **Save state.** Use `RAFrag` (`save.frag.<ID>`), never new top-level or `life.*` keys, unless the owner approves. Declare
   defaults and any structural migration in `js/frag/<ID>/migrations.js` (`RAMigrations.namespace/submit`) — **no version number**.
   The owner assigns it in `js/if1/migration_ledger.js`.
4. **Hooks.** WAKE/NIGHT → `RAWakeBus`; phone apps → `RAPhoneRegistry.declare`; money → `RAMoneyLedger.withSource('<tag>:…')`;
   HEAT/trust/crew/vehicles/districts/VampGram/sales → their IF-1 services; combat → `RACombat2Ext`; art/audio → part files.
5. **Tests.** Put suites in `tools/tests/<id>/*.test.mjs` (`export async function test(root)`); they run in `npm test` automatically.
6. **Hand-off.** Push a branch; the owner runs `check-owner-surfaces --fragment <ID>`, `npm run verify:all`, and merges.

## IF-1 v1.0 freeze rules

* `tools/tests/if1/contract-v1.0.json` lists every frozen member. A missing/renamed member fails `npm test`.
* After freeze IF-1 changes are **additive** and made only by the integration owner: add the member, run
  `node tools/tests/if1/make-contract.mjs` (it can only grow the snapshot), bump nothing that already shipped.
* The flag-OFF invariant is a test: `tools/tests/if1/zero-change.test.mjs` replays real lives with and without IF-1 and requires
  byte-identical saves. A fragment that changes accepted behavior with its flag OFF fails it.

## Private HQ / sealed work

Sealed implementation exists only in the private repository as an **overlay** (`private_overlay/`), applied to a copy of the OPEN
artifact by `tools/overlay.mjs`. The public repository never receives overlay files, the sealed pack, sealed strings or logs.
`tools/leak-check.mjs` runs in `npm test`, on every built artifact and in CI. See `node tools/hq-mirror.mjs plan`.
