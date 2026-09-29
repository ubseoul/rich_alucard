# F02 — IRON & GRACE (pre-Showdown implementation pass)

Fragment: `UBE_PORTAL_FRAGMENT_IRON_AND_GRACE` · Branch: `frag/iron-and-grace/001`
Base: `integration/ube-portal` @ `101a394` (IF-1 v1.0 FROZEN) · Owner: the integration owner merges.

Authoritative source: `Rich_Alucard_Patch_IRON_AND_GRACE_Guns.docx` (OPEN, Overlord package
`02_OPEN_PATCHES/`). Transcribed verbatim below so the implementation can be audited against it.

## Authority (verbatim summary)

PATCH "IRON & GRACE" — THE GUNS PATCH. Expands Gun Weaving and the Armory into a real gun game:
more guns with funny names, mods, rarity, a shooting-range minigame, and clear roles in menu combat
and Showdowns. Numbers are v1; final tuning happens in the combat role/peak polish phase.

* **Gun Weaving (canon, Vol 1/3):** guns become part of Rich's blood and appear only when needed; bought at
  THE ARMORY (Deacon Brass, behind a church in South LA). Rich has no default weapon identity; guns are
  tools he chooses. Guns are rare and expensive. Everyone can use them: Rich in menu combat (GUN button),
  Ogas in Showdowns, lookouts at traphouses. `TRIPLE K-KRATOS` stays dev-code only.
* **The Arsenal (v1) — 13 guns:** LIL OGA, SAPPORO SHOTGUN, MAC & CHEESE, CHOPSTICK SNIPER, THE TOMMY TONY,
  HOLY BABY DRAKE, JOLLOF BURNER, BLUEBERRY BLASTER, LEGENDARY DRACO — "DECEMBER'S GIFT", THE GOLDEN DRACO,
  THE RPG, AUNTIE'S SLIPPER, TRIPLE K-KRATOS (dev).
* **Mods (max 2 per gun):** BLESSED ROUNDS, DRUM MAG, SILENCER, SCOPE, GOLD PLATING, CUSTOM ENGRAVING.
* **Range Day:** the Armory basement range. Portrait lanes, tap-aim/release-fire, moving/hostage targets,
  a one-second cardboard Hilt. Rewards (no XP): gun STORIES (+10% crit), Deacon's approval medals
  (bronze/silver/gold → one mod discount), recoil/casing/juice.
* **Fights:** menu combat — 1 gun slot (2 with ARMORY WALL), GUN button with ammo; ammo refills after each
  fight. Showdowns — each Oga carries one gun, guns change class play. Traphouse raids — armed lookouts hold
  the door 1–2 extra turns. Enemies get guns (Open Mouth Gang Enforcers: shotguns; hunters: silver crossbows;
  Gbenga: the Golden Draco).
* **Sound:** existing ids cover Lil Oga, shotgun, sniper, Holy Baby Drake, RPG and the dev gun. ADD neutral
  codes `GN_01`–`GN_06`: GN_01 SMG burst · GN_02 drum-mag rattle · GN_03 flamethrower whoosh loop ·
  GN_04 dragon-fire rifle roar-shot · GN_05 slipper whap + "OOOH" crowd · GN_06 range target clack.
* **Cut order:** Tommy Tony → gold plating/engraving → Range Day challenges beyond bronze.
  **Never cut:** the Armory expansion, mods, Auntie's Slipper.

## What this branch implements (pre-Showdown)

| Area | Status | Notes |
|---|---|---|
| 13-gun authored catalog + stats | **COMPLETE** | `js/frag/F02/catalog.js`; base 5 mirror accepted `RACombatData.GUNS` numbers exactly |
| Mods (6, max 2/gun) | **COMPLETE** | purchase, equip validation, combat resolution |
| Armory (phone app) | **COMPLETE** | `js/frag/F02/armory.js`, `F02.armory` |
| Range Day (minigame) | **COMPLETE** | deterministic core + host adapter, `F02.range_day` |
| Ownership / equip / use contracts | **COMPLETE** | rides accepted `life.ownership.guns`; equip/engraving/loadout in `save.frag.F02` |
| Ammo / reload per fight | **COMPLETE** | per-fight ammo on the combat state, refill on `create` |
| Firearm feedback/FX hooks | **COMPLETE (hooks)** | `RAIronAndGrace.fx`; caller binding is an integration seam |
| Audio hooks GN_01–GN_06 | **COMPLETE (inert)** | `js/data/audio/parts/F02_guns.js`; **SOURCE_REQUIRED** (not in RA_SFX_DELIVERY_v1) |
| Weapon registry via IF-1 | **COMPLETE** | `RACombat2Ext.registerWeapon` (main-menu GUN), `RAPhoneRegistry`, `RAFrag`, `RAMigrations`, `RAAudioParts`, `RAMoneyLedger` |
| TRAP-facing weapon API | **COMPLETE (data + API)** | `RAIronAndGrace.trap`; F04/F05 binding **pending** |
| Enemy/weapon data interfaces | **COMPLETE (data)** | `RAIronAndGrace.enemies`; F01 binding **pending** |
| Showdown combat | **NOT IMPLEMENTED** | `RAIronAndGrace.showdown` is data/contract only — `F01_INTEGRATION_PENDING` |
| Persistence | **COMPLETE** | `save.frag.F02`, lazy |
| Tests | **COMPLETE** | `tools/tests/f02/` |
| Real-browser success path | **COMPLETE** | `tools/tests/f02/browser-path.mjs` |

## Not implemented here (by design)

* **SHOWDOWN_CORE (F01).** Per-gun Showdown stats, class affinities and enemy-gun behaviour are authored as
  data/contracts only. No tactical combat, no Oga loadouts resolved into a fight, no substitute systems.
  Every seam is marked `F01_INTEGRATION_PENDING`.
* **Traphouse raids (F04/F05).** The lookout weapon API exists; door-holding turns are not simulated.
* **Acquisition routes owned by other fragments.** Blueberry Blaster (Mazda's roost), Legendary Draco
  (sealed Playmakers), Golden Draco (NEW OGA finale) are defined but not purchasable/grantable here.
* **Art for the 7 new guns.** `ART_SOURCE_REQUIRED` — no art is invented; only the 5 frozen case/held pairs
  are referenced.
* **GN_01–GN_06 audio.** `SOURCE_REQUIRED` — not present in `RA_SFX_DELIVERY_v1`; registered as inert,
  drop-in hook entries exactly like the accepted `NO_01`–`NO_06` pattern.

## Flag model (all dark by default)

* `F02.iron_and_grace` — reserved; weapon registry, firearm feedback, Showdown/Trap data.
* `F02.armory` — reserved; the Armory phone app.
* `F02.range_day` — fragment sub-flag, `requires: ['F02.armory']`; Range Day.

Nothing is written to a save while every flag is OFF (`save.frag` stays absent — `zero-change` invariant).

## IF-1 interfaces used

`RAFeatures` (flags) · `RAMigrations.namespace` (defaults; **no version claimed**) · `RAFrag`
(`save.frag.F02`) · `RAPhoneRegistry.declare` (Armory app) · `RACombat2Ext.registerWeapon` (main-menu GUN)
· `RAAudioParts.register` (GN hooks) · `RAMoneyLedger.withSource('iron_and_grace:…')` (purchases) ·
`RAVampGramAPI` (gold-plating notice — only when the flag is ON) · `RAMinigames.register` (Range Day host).

## Discretionary values (F13)

All non-authored numbers (provisional ammo for guns whose ammo is not in the patch, Range Day medals
thresholds, mod discounts, the +10% range-story crit) live in `RAIronCatalog.TUNABLES`, tagged
`provisional:true`, `owner:'F13'`, and are replaceable without touching authored stats.

## INTEGRATION-OWNER ACTIONS REQUIRED (produced as exact requests; no owner surface was edited by hand)

### A. `index.html` loader region (generated, committed for review)

The fragment's scripts are listed in `js/frag/F02/manifest.json`; `node tools/loader.mjs sync` regenerates
the `LOADER` region of `index.html` (10 F02 lines + the `armory.css` link). This commit contains that
generated region so the real-browser path loads the fragment. The owner should confirm it and keep
`js/loader/manifest.json` (which already lists `F02` in its `fragments` slot) unchanged.

### B. IF-1 loader test collision (`tools/tests/if1/loader.test.mjs`) — OWNER-ONLY

`tools/tests/if1/loader.test.mjs` uses **`F02` as its synthetic scratch fragment** (it copies `js/`, then
overwrites `js/frag/F02/manifest.json` with a one-file test manifest). Now that F02 is a real fragment with
eight files, those files become "not loaded by any page" inside the sandbox copy and the suite fails:

```
FAIL [if1/loader.test.mjs] after sync: js file is not loaded by any page and not allow-listed: js/frag/F02/*.js
```

**Exact fix (owner applies; the fragment may not touch `tools/tests/if1/**`).** Immediately before the
synthetic F02 manifest is written, clear the copied real F02 folder so the scratch fragment is isolated:

```js
// in the tmp sandbox, just before writing tmp/js/frag/F02/x.js + its manifest:
await rm(path.join(tmp,'js','frag','F02'),{recursive:true,force:true});
await mkdir(path.join(tmp,'js','frag','F02'),{recursive:true});
```

Everything else in the suite already passes (`scriptList`, sync, order rules, orphan/duplicate detection);
this is the only edit needed. (Renaming the scratch id is not sufficient on its own: the loader's
`fragments` list only expands `F01`–`F07`, so a scratch `F09` would itself become an orphan.)

### C. Audio — GN_01–GN_06 (F11-A)

`RA_SFX_DELIVERY_v1` does not contain `GN_01`–`GN_06`. They ship as inert drop-in hooks in
`js/data/audio/parts/F02_guns.js` (`registered:false`, `file:null`,
`expectedPath:assets/audio/sfx/iron_grace/GN_0X.mp3`). When Audio supplies the files, wire them through
`RAAudioParts`/the fragment part only — do not hand-edit the generated `js/data/audio_manifest.js`:

| id | authored use | type | expected file |
|---|---|---|---|
| GN_01 | MAC & CHEESE — SMG burst | one-shot | `assets/audio/sfx/iron_grace/GN_01.mp3` |
| GN_02 | THE TOMMY TONY — drum-mag rattle | one-shot | `assets/audio/sfx/iron_grace/GN_02.mp3` |
| GN_03 | JOLLOF BURNER — flamethrower whoosh loop | loop | `assets/audio/sfx/iron_grace/GN_03.mp3` |
| GN_04 | BLUEBERRY BLASTER — dragon-fire rifle roar-shot | one-shot | `assets/audio/sfx/iron_grace/GN_04.mp3` |
| GN_05 | AUNTIE'S SLIPPER — slipper whap + "OOOH" crowd | one-shot | `assets/audio/sfx/iron_grace/GN_05.mp3` |
| GN_06 | RANGE DAY — range target clack | one-shot | `assets/audio/sfx/iron_grace/GN_06.mp3` |

`LEGENDARY DRACO` and `THE GOLDEN DRACO` have **no authored sound id** and are left `audio:null`
(`audioSourceRequired:true`) rather than assigned an existing gun sound.

### D. Art

The seven new guns have no frozen art. F02 invents none: their `art` key is `null`
(`artSourceRequired:true`). The five accepted case/held pairs are referenced by their existing
`RAArtRegistry.items.guns` keys. Art needs to produce case + held (+ a Showdown top-down variant) for the
new guns before their Armory cards show an icon.
