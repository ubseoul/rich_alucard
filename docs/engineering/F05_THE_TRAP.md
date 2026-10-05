# F05 - THE TRAP (engineering record)

Fragment: `F05` - `THE_TRAP` (TRAPHOUSE & BLOOD X PRODUCTION)
Base: `integration/ube-portal` @ frozen IF-1 `5e4b3a31f96624f1e8dc87b4412a9b23fdc4bf79` (post-OL-019 rewrite of the pre-rewrite SHA `101a394b5fa9c41ec089bc7022ee86ff43f5f31c`; see `docs/engineering/OL019_HISTORY_REWRITE_SHA_MAP.md`)
Branch: `frag/the-trap/001`
Feature flag: `F05.the_trap` (master, dark) mirrored onto the frozen reserved flag `F05.trap`
Status: READY FOR F05 NON-RAID AUDIT (see disposition in the hand-off)

## 1. Source authority used

| Source | Classification | Used for |
|---|---|---|
| `Rich_Alucard_PLAYMAKERS_Patch2_THE_TRAP.docx` | OPEN | THE TRAP: traphouses, Blood X grades, the COOK, the loop, sales channels, levels, the cost, connections, art/sound scope |
| `Rich_Alucard_BTF_Vol7_PLAYMAKERS_Blood_X_Operations.docx` | OPEN | the ONE shared HEAT scale/floors/decay (sec.8), Showdown/raid context, Oga/role context, report-card style |
| `Rich_Alucard_PLAYMAKERS_Patch1_NEW_OGA.docx` + accepted NEW OGA M1-M7 code | OPEN | unlock (ASSOCIATE rank; JUG THE PLUG), warehouse-with-the-chair, Carlos |
| `Rich_Alucard_Patch_IRON_AND_GRACE_Guns.docx` + F02 branch | OPEN | the TRAP-facing weapon API (`assign/owner/clear/list/holdTurns`), guns protect traphouses |
| `Rich_Alucard_Patch_RAINMAKER_...docx` | OPEN | THE BING status requirement (`BIG TIPPER`) |
| `Rich_Alucard_BTF_Vol5_Dragon_Maggi_Cube.docx` | OPEN | S-grade dragon-scale source (Mazda's roost) |

SEALED/HQ-only material was not opened or inspected. No sealed content is referenced.

## 2. Exact authored scope implemented

All of THE TRAP that does not require F01 tactical execution:

- **Entry/unlock (sec.1).** Any one of: NEW OGA rank >= ASSOCIATE; Mister December's Offer accepted (read from F04's namespace if present); Day >= 14 and JUG THE PLUG completed. The authored Shannon line and listing title are used verbatim. The listing is delivered through the TRAP phone app and the Shannon text thread.
- **Traphouses (sec.2).** THE BANDO ($45,000 / 2 cases), THE CUL-DE-SAC ($140,000 / 4), THE LAUNDROMAT BACK ROOM ($260,000 / 6), THE WAREHOUSE (free with the chair, 10, requires NEW OGA finished). Purchase, ownership, per-house ready stock, and the authored "hot" state.
- **Product + quality (sec.3).** Grades D/C/B/A/S with authored street names, base, buyer, price/case, aging sleeps, and rare-ingredient rule. Quality 0-100: >=90 is PREMIUM +25%; <50 sells at half and damages street rep; wholesale 60%.
- **The COOK (sec.4).** A real 3-station canvas minigame (`f05_cook`): BLEND hold/target band, HEAT tap-to-pulse green band, BOTTLE flick the vials. Quality comes from the run. Crew can cook for you at lower quality (provisional).
- **The loop (sec.5).** COOK -> ASSIGN SALES -> night resolution at sleep -> NIGHT REPORT -> COUNT THE MONEY (`f05_counter`, tap-and-hold, a band every $10K). Five authored sales channels with their needs/risk/grades/notes. Counted cash is credited to the phone balance through the ledger; uncounted cash is "unbanked" (and at risk).
- **Levels + upgrades (sec.6).** Levels 1-5 with authored names/unlocks/visual notes; level up by cases sold + an authored level-up job interface; COUNTING ROOM at Level 4. Upgrades: better burner, aging racks, vault, cameras, money counter, panic room, with their documented effects.
- **The cost (sec.7).** Shared HEAT per channel and grade; heat tiers (Officer Nodd outside, hunters sniffing, ON FIRE); RAIDS (see section 4 below); robbery by your own people (runner skimming, "numbers look light", confront TALK/FIRE/OCTOPUS BRAIN); bad product ending an elite client forever; PEOPLE NOTICE one-time reactions; the EMPIRE BIG RAID.
- **Connections (sec.9).** NEW OGA (warehouse/chair, Gbenga base ingredients), PLAYMAKERS/F04 (district supply mapping + Oga roles via IF-1), RAINMAKER (BING/BIG TIPPER adapter), Guns/F02 (weapon seam), Mazda (dragon scale), fish scale (Rich handles it).
- **UI/persistence.** TRAP phone app (`RAPhoneRegistry`), save namespace `save.frag.F05`, lazy and declaration-only.

### Deliberate fidelity choices

- **Authored numbers win.** Every price, capacity, aging sleep, quality band, tier floor, decay, raid cadence, stash loss and BIG RAID keep-value is quoted from source.
- **Silent numbers.** The source gives no ingredient/upgrade costs, no per-channel/per-grade HEAT weights, no level-case thresholds, and no upgrade prices. Those live only in `F05_PROVISIONAL` (owner F13, `provisional:true`) and are centralized. Money-like values default to 0.
- **No invented story.** Level-up job scenes, people-notice lines, December dialogue and raid outcomes are not authored in OPEN, so the system records the one-time state and reports `contentSourceRequired` / `F01_INTEGRATION_PENDING`; no dialogue or outcome is fabricated. Authored lines (Shannon, listing title, "COUNT THE MONEY", "numbers look light.") are used verbatim.

## 3. F01_INTEGRATION_PENDING list (tactical execution only)

`js/frag/F05/raids.js` implements eligibility, setup, state, participants, gear/loadout handoff, an entry packet and a resolution interface. It implements **no** combat, no grid, no substitute resolution.

1. `raid-eligibility` - HEAT >= HOT (Vol 7 sec.8) or a scheduled retaliation, cadence 7 nights (THE TRAP sec.7).
2. `raid-setup` - attacker (hunters / Open Mouth Gang / rival crew), house, map `traphouse` (Vol 7 sec.5.1).
3. `raid-state` - `save.frag.F05.raids` (pending + history), persisted around the event.
4. `raid-participants` - trap crew with role + assigned weapon.
5. `raid-gear-loadout` - `RATrap.weapons` handoff (`holdTurns` door-hold is data only, per F02).
6. `raid-entry-packet` - `{f01Pending:'F01_INTEGRATION_PENDING', map, attacker, defenders, weapons, supports}`.
7. `raid-resolution-interface` - `resolve({outcome})` applies the AUTHORED losses only; the tactical result must come from F01 or an authored source.
8. `raid-loss-consequences` - stash cases + 30% unbanked cash, house hot 5 nights, no production.
9. `raid-crew-capture` - without PANIC ROOM a defender can be CAPTURED (3-night extract timer -> GONE), state only.
10. `empire-big-raid` - `big_raid` removes a property permanently; Rich keeps castle, cars, counting-room banked cash.
11. `rich-pull-up` / `showdown-slide-in` (Vol 7 sec.5.6/7.2) - not modelled; presentation belongs to F01.
12. `hilt-on-fire` - ON FIRE feeds the existing sealed pressure system; this fragment never lowers Hilt gates.

`RAStrap`/`RATrap.raids` deliberately expose **no** `simulate`, `resolveShot` or grid surface.

## 4. F02 weapon seam status

F02 IRON_AND_GRACE is **not** on the frozen base. `js/frag/F05/weapons.js` is an isolated adapter:

- When F02 is present (`window.RAIronAndGrace.trap`), every call delegates, owner ids are namespaced `trap:<crewId>`, and **nothing** is stored locally (no duplicate ownership).
- When F02 is absent it keeps an isolated fallback in `save.frag.F05.weapons` and reports `F02_INTEGRATION_PENDING`.
- `assign`, `owner`, `clear`, `list`, `holdTurns` match the documented F02 TRAP-facing API. Tests cover both modes.

Integration requirement: when F02 lands, no F05 change is needed beyond the flag ordering; the adapter switches automatically. Do **not** cherry-pick F02 into F05.

## 5. F04 / shared-state seam status

- **HEAT:** the ONE `RAHeat` service. Boot configures the authored Vol 7 sec.8 floors (`0/30/60/85`, `provisional:false`) and uses `-3` decay. No Trap-specific HEAT store. With flags OFF the shipped provisional floors are untouched.
- **Crew:** `RACrew` (IF-1). F05 defines no named Oga; it assigns roles (cook/runner/lookout) to existing crew where possible and can hire unnamed placeholder workers (`crewVisual:'artSourceRequired'`). A `DISMISSED` status is registered additively.
- **Districts:** F05 does not define districts. It exposes `RATrap.f04.districtSupply()`-equivalent data (house -> district map) for the War Room; F04 owns the geoscape.
- **Sales channels:** the reserved IF-1 channel `trap` is claimed; income is banked through `RASalesChannels.record` with a `trap:` ledger family.
- F04's December offer is read through `RAFrag` only; absent -> `F04_INTEGRATION_PENDING` (never simulated).

## 6. Economy / tunables

`js/frag/F05/tunables.js` centralizes everything. `AUTHORED` holds only source numbers. `PROVISIONAL` (`provisional:true, owner:'F13'`) holds exactly what the system needs that the source leaves silent:

- per-channel / per-grade HEAT weights; crew cook quality; level cases-sold thresholds; base-ingredient and upgrade costs (default 0); loyalty/robbery odds; upgrade effect multipliers; raid heat tier.

Nothing is globally retuned. These are the F13 balance program's to replace.

## 7. Art / audio gaps

- **Art:** no trap art is generated. `RATrap.artNeeds()` lists every required item (4 interiors x 3 stages, COUNTING ROOM, HOA meeting room, HOA president, 2 cooks, 2 runners, 1 lookout, grade stamps, bench, counter, report card) with `artSourceRequired:true`. Trap crew Visual A is owned separately; this fragment renders no invented final assets.
- **Audio:** `js/data/audio/parts/F05_trap.js` registers `TR_01`-`TR_06` as inert drop-in hooks (file `null`, `registered:false`, expected path `assets/audio/sfx/the_trap/TR_0X.mp3`) and a `the_trap` scene. Missing masters stay inert, as the IF-1 convention allows.
- **Level-up job scenes / people-notice lines / December dialogue:** authored text is not in OPEN -> `contentSourceRequired`.

## 8. Owner integration requests

1. **Regenerate the loader.** `index.html` was regenerated with `node tools/loader.mjs sync` (the sanctioned tool) to include the F05 scripts and CSS. The integration owner must re-run `npm run loader:sync` when f05 lands on the trunk (this is the one owner-surface change; `check-owner-surfaces` will flag `index.html` on the fragment branch by design).
2. **Assign a schema version if required.** F05 declares `RAMigrations.namespace('F05', ...)` only; it submits **no** migration module, so `RAMigrations.validate()` stays clean. If the owner wants a structural step, assign the next ledger number and point it at an F05 module.
3. **Reconcile `F05.the_trap` with the reserved `F05.trap`.** The brief names `F05.the_trap`; the frozen spine reserves `F05.trap`. F05 registers the former and mirrors it onto the latter at runtime. If the owner prefers a single flag, promote `F05.trap` in `flag_defaults.js` and drop the alias.
4. **F04 integration:** wire districts/supply and the December offer into the War Room; the adapter reads F04's namespace only.
5. **F02 integration:** no action; the weapon adapter switches automatically once `RAIronAndGrace.trap` exists.
6. **F13 balance:** replace `F05_PROVISIONAL` with authored numbers.
7. **Authoring/Art:** level-up job scenes, people-notice lines, December lines, and the `artNeeds()` list.

## 9. Tests and evidence

- `node tools/run-tests.mjs --fragment f05` - **PASS** (19 PASS lines: flags OFF zero-change; boot; namespace; unlock; listing/buy; production/aging/rare; sales/pricing/wholesale/bad-product/COUNT; robbery+vault; shared HEAT; levels/upgrades; crew roles; reactions; raids/F01 boundary; F02 weapon seam; persistence; edge/malformed; minigame logic; audio/art honesty).
- `npm test` - **PASS** (all existing suites + F05 + IF-1 contracts + zero-behavior-change + leak).
- `npm run build` - **PASS** (`ra-101a394b5fa9-20260929043207`; historical pre-OL-019 build id, base rewritten to `5e4b3a3`).
- `node tools/leak-check.mjs` - **PASS** (1586 files, no sealed content).
- `node tools/check-owner-surfaces.mjs --base <frozen> --fragment F05` - see the hand-off (expects the generated `index.html` only).

### Real-browser path (specified; execution blocked in this environment)

Serve the built artifact and open, at 360/390/430 px width:

```
npm run build
npx http-server dist -p 8137          # or any static server
http://127.0.0.1:8137/index.html?dev=1&ff=F05.the_trap
```

Then: unlock (DEV console `RANewOga.patch({rank:3,status:'associate'})`), WAKE once (TRAP app appears), buy THE BANDO, load a base ingredient, open TRAP -> house -> COOK, ASSIGN SALES -> CORNER, sleep, read the NIGHT REPORT, COUNT THE MONEY, buy upgrades, level up.

`?dev=1&ff=F05.the_trap` is the DEV master switch; `?dev=1&ff=-F05.the_trap` proves the OFF path.

**Environment note:** the OpenCode desktop browser connection returned `ERR_FAILED`/`OC2` for every navigation (including `about:blank`), and spawning the bundled headless Chromium/Edge from the shell produced no output. The real-browser path therefore could not be executed here; it is scripted above for the integration owner and CI (`tools/if1/browser-smoke.mjs --require-browser` pattern). All DOM-level behavior is covered by the headless suite.
