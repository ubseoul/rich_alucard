# IF-1 — Integration Spine v1.0 (API reference)

IF-1 is **code**, not a spec: `js/if1/**` plus additive seams in accepted files, guarded by contract tests
(`tools/tests/if1/`). Everything is inert with all fragment flags OFF; `tools/tests/if1/zero-change.test.mjs` proves the
accepted game (saves, wake traces, economy, NEW OGA) is byte-identical with IF-1 present.

Load order is owned by `js/loader/manifest.json` (see §N). Module surface is frozen in `tools/tests/if1/contract-v1.0.json`.

## 4A `RAFeatures` — feature flags (`js/if1/features.js`, `flag_defaults.js`)
`register({id:'F03.thing',fragment:'F03',persist?,requires?,description?})` · `enabled(id)` · `set(id,bool,{persist})` ·
`clear(id)` · `onChange(fn)` · `list([fragment])` · `snapshot()` · `anyEnabled()`.
Resolution: DEV session override (`?dev=1&ff=a.b,-c.d`) > persisted (only `persist:true`, own key `rich_alucard_features_v1`,
never the save) > owner default (`RAFlagDefaults`) > OFF. Unknown ids are OFF; a fragment can register only inside its own
namespace and can never ship ON. Reserved dark flags: `F01.showdown F02.iron_and_grace F02.armory F03.new_oga_ladder_close
F04.war_room F05.trap F06.rainmaker F07.m8_and_finale`.

## 4B Migrations + namespaces (`migration_ledger.js`, `migrations.js`, `frag_state.js`; hooks in `state.js`)
Fragments `RAMigrations.submit({id:'F03.x',fragment:'F03',migrate(save)})` and `RAMigrations.namespace('F03',defaults)` from
`js/frag/F03/migrations.js` (loaded before `state.js`). **Only the owner assigns version numbers** in
`RAMigrationLedger.assigned` (contiguous from base 16, F00 assigns none — saves are unchanged). `RAFrag.get/read/ensure/patch`
manage `save.frag.<ID>` — created lazily on first write, so with flags OFF a save is byte-identical to pre-IF-1. `state.js`
takes `VERSION`, the extra migration steps and namespace normalization from the registry (falls back to accepted v16 if the
registry is absent). Contract-tested: additive, idempotent, ordering set by the ledger, orphans/gaps/claims rejected.

## 4C `RAWakeBus` — WAKE/NIGHT (`wake_bus.js`; `RAClock.handlerInfo` added)
`subscribe({id,fragment,phase:'wake'|'night',priority,fn,flag?})` (wraps `RAClock.onWake`; refuses priority ties — order can
never depend on load order; night needs priority < 0; flag-gated; replays of `wake({first:true})` cannot double-fire) ·
`voiceNotes.define(fragment,[{adventure,priority,when,flag?}])` over the accepted `RAWakeTriggers` arbiter (band 75–89, unique
priorities, one mission voice note per WAKE; accepted NEW OGA ladder 85→78 recorded) · `nightReport.contribute/last/consume` ·
`order(phase)` · `trace()` · `bands`. Accepted WAKE handler roster is asserted unchanged.

## 4D `RAPhoneRegistry` (`phone_registry.js`; `RAPhoneApps.unregister` added)
`declare(fragment,{id,render,onAction,section,order,flag?,…})` — the app is registered with the phone only while its flag is ON.
Reserved (dark, not implemented): `warRoom` F04, `trap` (Trap / Counting) F05, `armory` F02, `rainmaker` F06. `unlock(id)`,
`reserved()`, `declaredApps()`. OL-001: final placement review after F4.

## 4E `RAMoneyLedger` (`money_ledger.js`)
Observes every change of `life.resources.money` (via `RAStateWatch`, whichever accepted path caused it) and tags it:
`withSource(tag,fn)` · `credit/debit(amount,{source})` · `entries()` · `query({source,family})` · `byFamily()` ·
`registerFamily(regex,name)`. Untagged mutations inherit `adventure:<ID>`; NEW OGA outcome functions are tagged
`new_oga:m1…` by a compatibility adapter. In-memory by default; flag `if1.ledger_persist` mirrors totals to `save.frag.if1.ledger`.
Never changes an amount; the economy stays frozen until F13.

## 4F `RAHeat` (`heat.js`)
Scale COOL · WARM · HOT · ON FIRE. `global()` = accepted `life.newOga.heat` + service component; `district(id)`;
`add(delta,{district,source})`; `onTierChange(fn)`; `snapshot()`; `configure({floors})`; `subscribePrivate(fn)` (accepted only once a
pack is installed — inert in OPEN). **SOURCE_REQUIRED:** Vol 7 numeric tier floors are not in the OPEN repository; the shipped
floors are PROVISIONAL (`describe().provisional===true`) and are replaced by the owner via `configure`.

## 4G `RASocial` (`social.js`)
`trust` / `gangClout` / `streetClout` / `tendency` wrappers that delegate every write to the accepted functions
(`RANewOga.adjust`, `RALife.tendency`, `RALife.addPoints`) — results identical (tested). Authored deltas are never modified;
modifiers apply only to explicit `{authored:false}` deltas. No symbol mapping is defined here.

## 4H `RACrew` · 4I `RAVehicles` · 4J `RADistricts`
Infrastructure only; they invent no unit, district or outcome. `RACrew`: `define`, statuses ACTIVE/DOWNED/CAPTURED/GONE
(+`registerStatus`), stories, bonds, day-timers with `tick()` (driven by a WAKE subscriber), GONE terminal.
`RAVehicles`: view over accepted ownership + TRIBUTED + per-car drive counts (accepted global `drives` counter untouched).
`RADistricts`: `define`, `setControl(id,state,{holder})`, HEAT mirrored through `RAHeat`. All persist lazily in `save.frag.if1`.

## 4K `RAVampGramAPI` · 4L `RASalesChannels`
`registerAccount({handle,fragment,avatar,flag})`, `post(handle,{id,…})` (flag-gated, id-deduplicated, delegates to the accepted
`RAVampGram.post`), `feed`, `onPost`. `RASalesChannels`: reserved `trap` (F05) and `rainmaker` (F06, alias `bing`); `claim`,
`register`, `record(channel,{amount,kind})` → money ledger tag `<channel>:<kind>`. No authored posts, no channel economy.

## 4M `RACombat2Ext` (`combat2_ext.js`; seams in `engine/combat2.js` + `scenes/combat2.js`)
`registerWeapon` (main-menu button + action), `registerBossScript(enemy,{onCreate,beforeEnemyTurn,afterEnemyTurn,onEnd})`,
`registerItemHook(item,{before,after})`, `registerAction(type)`. Flag required; inert when empty — Combat 2.0 with empty seams
plays byte-identically (tested with a seeded RNG). No weapon/boss/item is implemented.

## 4N Script loader — `js/loader/manifest.json`, `tools/loader.mjs`
Ordered entries (`file`, `{glob}`, `{btf}`, `{fragments}`, `{overlay}`); `npm run loader:sync` regenerates the `LOADER` region of
`index.html` (plain `<script>` tags — static deployment unchanged); `npm run loader:verify` checks duplicates, missing files,
owner-maintained dependency rules, staleness and unregistered `js/` files. Fragment files: `js/frag/<ID>/manifest.json`;
fragment migrations and art/audio parts are globbed into their slots.

## 4O/4P Art and audio parts
`RAArtParts.register(fragment,subtree)` merges additively into `RAArtRegistry` (overwriting an entry ⇒ `FROZEN_ASSET_COLLISION`,
part rejected whole). `RAAudioParts.register(fragment,{entries,scenes})` extends `RAAudioManifest` (same API; new ids only;
inert hooks stay inert). Part files: `js/data/{art,audio}/parts/<ID>_*.js`.

## 4Q/4R Tests, CI, nightly hook
`tools/tests/<fragment>/*.test.mjs` auto-discovered by `tools/run-tests.mjs` and run inside `npm test`.
`npm run verify:all` = loader → build (regression + fragment suites + contracts + zero-change + leak) → artifact verification →
artifact leak check → empty-pack private overlay equivalence → real-browser smoke. `node tools/nightly-smoke.mjs --build
--require-browser` is the nightly hook (JSON report + exit code; no Google-specific infrastructure needed).
