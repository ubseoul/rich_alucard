# F11 — PATCH SOUND INGEST + ENGINEERING WIRING (engineering handoff)

Branch `frag/audio-completion/001` (worktree `rich_alucard_audio_completion_001`) · base `integration/ube-portal`
frozen IF-1 SHA `101a394b5fa9c41ec089bc7022ee86ff43f5f31c` (`if1-v1.0`) · F1 canonical accepted SHA
`249c5f720c475862b00a28d98c4f382071b95e31`. No merge, no deploy, `main` / `integration/ube-portal` / `hq/integration` untouched.

Disposition: **READY FOR F11 AUDIO INTEGRATION AUDIT**.

This document records the engineering half of F11: taking the accepted F11-A source masters
(`C:\Users\Ube\Downloads\PATCH_SOUND_FINDER_DELIVERY`, authority OL-011 “Wave 0 Audio Sourcing”, all CC0 1.0 originals)
and making them usable by the authorized OPEN fragments through the project's existing audio pipeline. It is audio
engineering only — no game mechanic, story, or sound-design substitution.

---

## 1. Source delivery validated

| Check | Result |
|---|---|
| Delivery directory found | `C:\Users\Ube\Downloads\PATCH_SOUND_FINDER_DELIVERY` (audio_src/ + MANIFEST.csv + MISSING.txt + SOURCE_LOG.md + LICENSES.md) |
| Source files | **41 WAV** masters, 16-bit PCM, 44.1 kHz, mono/stereo |
| Logical IDs | **37** (35 patch + 2 legacy gaps) — matches `MISSING.txt` (0 missing) |
| Duplicate filenames | 0 (case-insensitive) |
| Missing expected source IDs | **none** |
| Zero-duration / unreadable | none |
| Clipping (peak ≥ 0 dBFS) | none (all masters peak −1.5 dBFS) |
| Channels > 2 | none |
| Licenses | 37/37 CC0 1.0 Universal (original in-project synthesis, Antigravity) |

Per-file sha256 + technical validity is committed at
[`tools/tests/f11/patch_sound_delivery.json`](../../tools/tests/f11/patch_sound_delivery.json). Source masters were **not**
modified, renamed, normalized, re-synthesized, or overwritten in the delivery directory.

Four source files are sub-components / alternates of an ID rather than extra IDs: `NO_01__blip`, `NO_01__hum`,
`NO_04__pant`, `BX_COVER_HIT__alt1`.

## 2. Pipeline and runtime format

The sanctioned accepted pipeline is [`tools/audio-build.mjs`](../../tools/audio-build.mjs) (UL-L2-002): WAV masters →
runtime MP3 (`assets/audio/sfx/<category>/`), schema-2.1 manifest. F11 extends the **same** tool additively:

* `--patch DIR` (repeatable) merges a delivery's `MANIFEST.csv` rows into the one approved-library build.
  * existing inert ids become drop-in registrations (`NO_01–NO_06`, `DRAGON_WINGS`, `BARS_PUNCHLINE`);
  * genuinely new ids are added by the owning fragment part instead (see §4).
* `--manifest-exclude ID,ID,…` encodes a patch id's runtime MP3 but omits it from the generated manifest because a
  fragment audio part owns its registration.

Encoding is unchanged from the accepted convention: **one-shots** mono 96 kbps libmp3lame, lead/trail silence trim,
5 ms fades, 20 Hz high-pass; **loops** stereo/mono 128 kbps with an equal-power tail→head crossfade and a measured
`loopEnd`. Category → bus follows the delivery (`SFX`/`UI`/`AMBIENCE`); `guns`→`iron_and_grace` and `legacy`→`combat`
runtime folders keep the owning fragment/legacy paths stable.

**Exact regeneration command** (needs the accepted F1 library available locally, as the tool always has):

```powershell
$env:RA_SFX_SRC = "C:\Users\Ube\OneDrive\Desktop\RA_SFX_DELIVERY_v1"
node tools/audio-build.mjs `
  --patch "C:\Users\Ube\Downloads\PATCH_SOUND_FINDER_DELIVERY" `
  --manifest-exclude "TR_01,TR_02,TR_03,TR_04,TR_05,TR_06,GN_01,GN_02,GN_03,GN_04,GN_05,GN_06,RM_01,RM_02,RM_03,RM_04,RM_05,RM_06,RM_07,RM_08,BX_SLIDEIN_IDLE,BX_NAMECARD_SLAM,BX_POD_REVEAL,BX_OVERWATCH,BX_COVER_HIT,BX_DOWNED,BX_GONE,BX_WARROOM,BX_CRATE"
npm run loader:sync
```

Running the tool re-encodes the accepted F1 assets too; those are byte-identical (verified — no F1 asset changed).

Runtime totals after F11: **41 new MP3s** (37 ids + 4 variations), **302** runtime MP3s total
(261 accepted F1 + 41 F11), 60.4 MB.

## 3. Audio manifest & owner surfaces (explicitly reported)

The global manifest `js/data/audio_manifest.js` is **generated**, not hand-edited. It was regenerated with the
sanctioned tool above, preserving all 241 accepted F1 entries **byte-for-byte** (differential check: 0 diffs, 0 missing)
and turning the F1 inert slots into registrations:

* `NO_01–NO_06` — registered (drop-in hooks filled); `NO_05` is an AMBIENCE loop, `NO_06` is UI.
* `DRAGON_WINGS`, `BARS_PUNCHLINE` — registered (`combat`), legacy gaps restored.
* `MAGIC_SEANCE` — still `registered:false`, `file:null`, `reason:"defective-render-do-not-wire"` (never repaired/activated).

Owner surfaces touched, all through sanctioned tooling/gates and reported here:

| Surface | Change | How |
|---|---|---|
| `js/data/audio_manifest.js` | regenerated (241 F1 entries unchanged; NO/legacy registered) | `tools/audio-build.mjs --patch` |
| `index.html` | LOADER region regenerated (adds the 4 audio parts) | `npm run loader:sync` |
| `js/systems/smoke.js` | library-count reconciliation `244/241/3` → `244/243/1` | F00 precedent (§4 of `F00_INTEGRATION_SPINE.md`) |
| `tools/release.mjs` | NEW OGA hook gate: inert→registered; added MAGIC_SEANCE inert gate | F11 authority, regression gate |
| `tools/audio-build.mjs` | additive `--patch` / `--manifest-exclude` | sanctioned pipeline extension |

No manual edit was made to any generated owner surface.

## 4. Fragment ownership — `RAAudioParts`

New fragment-owned families register in `js/data/audio/parts/<ID>_*.js` (IF-1 4P). Part ids are new; the F1 registries
are untouched. Each part is independently valid with every fragment flag OFF.

| Part | Fragment | IDs |
|---|---|---|
| `F02_guns.js` | F02 IRON & GRACE | `GN_01–GN_06` |
| `F04_blood_x.js` | F04 PLAYMAKERS / BLOOD X | `BX_SLIDEIN_IDLE, BX_NAMECARD_SLAM, BX_POD_REVEAL, BX_OVERWATCH, BX_COVER_HIT, BX_DOWNED, BX_GONE, BX_WARROOM, BX_CRATE` |
| `F05_trap.js` | F05 THE TRAP / COUNTING | `TR_01–TR_06` |
| `F06_rainmaker.js` | F06 RAINMAKER | `RM_01–RM_08` |

`F02_guns.js` **supersedes** the earlier inert drop-in hook of the same path on the F02 branch (same ids / fragment /
category / runtime paths, now `registered:true`). On merge the owner resolves that same-path file in favour of this
registered version. No other branch authors a part for these ids (`origin/frag/playmakers-war-room/001` has none).

## 5. Complete ID mapping

`runtime format` is MP3 (libmp3lame); one-shots ≈ mono 96 kbps, loops ≈ 128 kbps crossfaded with measured `loopEnd`.
Hashes are truncated to 12 hex; full hashes are in `tools/tests/f11/patch_sound_delivery.json` (source) and
`assets/audio/sfx/**` (runtime).

|ID|source file|source sha256|runtime file|runtime sha256|format|registration owner|consumer status|
|---|---|---|---|---|---|---|---|
|`GN_01`|`audio_src/guns/GN_01.wav`|`89d3638840fd`|`assets/audio/sfx/iron_and_grace/GN_01.mp3`|`1274abb83f02`|MP3|F02_guns.js|REGISTERED — CONSUMER_PENDING (no authored call site on the frozen base)|
|`GN_02`|`audio_src/guns/GN_02.wav`|`ddae6c529a68`|`assets/audio/sfx/iron_and_grace/GN_02.mp3`|`44d3dd63c374`|MP3|F02_guns.js|REGISTERED — CONSUMER_PENDING (no authored call site on the frozen base)|
|`GN_03`|`audio_src/guns/GN_03.wav`|`e8d56962c65c`|`assets/audio/sfx/iron_and_grace/GN_03.mp3`|`1f94c92f753d`|MP3|F02_guns.js|REGISTERED — CONSUMER_PENDING (no authored call site on the frozen base)|
|`GN_04`|`audio_src/guns/GN_04.wav`|`78bb9f5878f9`|`assets/audio/sfx/iron_and_grace/GN_04.mp3`|`420a41e75abd`|MP3|F02_guns.js|REGISTERED — CONSUMER_PENDING (no authored call site on the frozen base)|
|`GN_05`|`audio_src/guns/GN_05.wav`|`46bce63f9bec`|`assets/audio/sfx/iron_and_grace/GN_05.mp3`|`505f544836fd`|MP3|F02_guns.js|REGISTERED — CONSUMER_PENDING (no authored call site on the frozen base)|
|`GN_06`|`audio_src/guns/GN_06.wav`|`3f3239f55771`|`assets/audio/sfx/iron_and_grace/GN_06.mp3`|`a1e982fd19f0`|MP3|F02_guns.js|REGISTERED — CONSUMER_PENDING (no authored call site on the frozen base)|
|`BARS_PUNCHLINE`|`audio_src/legacy/BARS_PUNCHLINE.wav`|`dff67a3d7126`|`assets/audio/sfx/combat/BARS_PUNCHLINE.mp3`|`f0f88f84539e`|MP3|base manifest (generated)|REGISTERED — CONSUMER_PENDING (restored legacy; no authored call site on the frozen base)|
|`DRAGON_WINGS`|`audio_src/legacy/DRAGON_WINGS.wav`|`4eca218d98d4`|`assets/audio/sfx/combat/DRAGON_WINGS.mp3`|`e1d8d316f0e0`|MP3|base manifest (generated)|REGISTERED — CONSUMER_PENDING (restored legacy; no authored call site on the frozen base)|
|`NO_01`|`audio_src/new_oga/NO_01.wav`|`b5cddb5337b7`|`assets/audio/sfx/new_oga/NO_01.mp3`|`475812144351`|MP3|base manifest (generated)|REGISTERED — CONSUMER_PENDING (NEW OGA hooks; call sites on the F02/F03 branches)|
|`NO_01`|`audio_src/new_oga/NO_01__blip.wav`|`d45d42433c56`|`assets/audio/sfx/new_oga/NO_01__blip.mp3`|`5ce4c71ff22e`|MP3|base manifest (generated)|REGISTERED — CONSUMER_PENDING (NEW OGA hooks; call sites on the F02/F03 branches)|
|`NO_01`|`audio_src/new_oga/NO_01__hum.wav`|`23fb9c3aa2fe`|`assets/audio/sfx/new_oga/NO_01__hum.mp3`|`3e72e6cf92a2`|MP3|base manifest (generated)|REGISTERED — CONSUMER_PENDING (NEW OGA hooks; call sites on the F02/F03 branches)|
|`NO_02`|`audio_src/new_oga/NO_02.wav`|`036526a9af40`|`assets/audio/sfx/new_oga/NO_02.mp3`|`99713480467c`|MP3|base manifest (generated)|REGISTERED — CONSUMER_PENDING (NEW OGA hooks; call sites on the F02/F03 branches)|
|`NO_03`|`audio_src/new_oga/NO_03.wav`|`2f237ef6c792`|`assets/audio/sfx/new_oga/NO_03.mp3`|`6ba9512e55ac`|MP3|base manifest (generated)|REGISTERED — CONSUMER_PENDING (NEW OGA hooks; call sites on the F02/F03 branches)|
|`NO_04`|`audio_src/new_oga/NO_04.wav`|`8b973bd9494e`|`assets/audio/sfx/new_oga/NO_04.mp3`|`467ebb93f015`|MP3|base manifest (generated)|REGISTERED — CONSUMER_PENDING (NEW OGA hooks; call sites on the F02/F03 branches)|
|`NO_04`|`audio_src/new_oga/NO_04__pant.wav`|`477e7cf671df`|`assets/audio/sfx/new_oga/NO_04__pant.mp3`|`c91ecbbf1768`|MP3|base manifest (generated)|REGISTERED — CONSUMER_PENDING (NEW OGA hooks; call sites on the F02/F03 branches)|
|`NO_05`|`audio_src/new_oga/NO_05.wav`|`6752329662bd`|`assets/audio/sfx/new_oga/NO_05.mp3`|`0e2bcf7e03bc`|MP3|base manifest (generated)|REGISTERED — CONSUMER_PENDING (NEW OGA hooks; call sites on the F02/F03 branches)|
|`NO_06`|`audio_src/new_oga/NO_06.wav`|`ad77d906d9c7`|`assets/audio/sfx/new_oga/NO_06.mp3`|`131986096c7e`|MP3|base manifest (generated)|REGISTERED — CONSUMER_PENDING (NEW OGA hooks; call sites on the F02/F03 branches)|
|`RM_01`|`audio_src/rainmaker/RM_01.wav`|`c09b4e39a66e`|`assets/audio/sfx/rainmaker/RM_01.mp3`|`663132b86d51`|MP3|F06_rainmaker.js|REGISTERED — CONSUMER_PENDING (no authored call site on the frozen base)|
|`RM_02`|`audio_src/rainmaker/RM_02.wav`|`6499be5676fb`|`assets/audio/sfx/rainmaker/RM_02.mp3`|`3b94467ee997`|MP3|F06_rainmaker.js|REGISTERED — CONSUMER_PENDING (no authored call site on the frozen base)|
|`RM_03`|`audio_src/rainmaker/RM_03.wav`|`2b215290a3e0`|`assets/audio/sfx/rainmaker/RM_03.mp3`|`49700ef36e6e`|MP3|F06_rainmaker.js|REGISTERED — CONSUMER_PENDING (no authored call site on the frozen base)|
|`RM_04`|`audio_src/rainmaker/RM_04.wav`|`3ba6ab29df1d`|`assets/audio/sfx/rainmaker/RM_04.mp3`|`e605718ef6c0`|MP3|F06_rainmaker.js|REGISTERED — CONSUMER_PENDING (no authored call site on the frozen base)|
|`RM_05`|`audio_src/rainmaker/RM_05.wav`|`63a894234cd8`|`assets/audio/sfx/rainmaker/RM_05.mp3`|`5c79057633a4`|MP3|F06_rainmaker.js|REGISTERED — CONSUMER_PENDING (no authored call site on the frozen base)|
|`RM_06`|`audio_src/rainmaker/RM_06.wav`|`5a29ec5744e4`|`assets/audio/sfx/rainmaker/RM_06.mp3`|`ccf5eefbfc3b`|MP3|F06_rainmaker.js|REGISTERED — CONSUMER_PENDING (no authored call site on the frozen base)|
|`RM_07`|`audio_src/rainmaker/RM_07.wav`|`7f5ab89bd58c`|`assets/audio/sfx/rainmaker/RM_07.mp3`|`f4ef564fdd3d`|MP3|F06_rainmaker.js|REGISTERED — CONSUMER_PENDING (no authored call site on the frozen base)|
|`RM_08`|`audio_src/rainmaker/RM_08.wav`|`7ee66a70b4e4`|`assets/audio/sfx/rainmaker/RM_08.mp3`|`a775e652dfaf`|MP3|F06_rainmaker.js|REGISTERED — CONSUMER_PENDING (no authored call site on the frozen base)|
|`BX_COVER_HIT`|`audio_src/showdown/BX_COVER_HIT.wav`|`cb8e3ceb8c6f`|`assets/audio/sfx/showdown/BX_COVER_HIT.mp3`|`30819d48597e`|MP3|F04_blood_x.js|REGISTERED — CONSUMER_PENDING (no authored call site on the frozen base)|
|`BX_COVER_HIT`|`audio_src/showdown/BX_COVER_HIT__alt1.wav`|`0de894d23241`|`assets/audio/sfx/showdown/BX_COVER_HIT__alt1.mp3`|`8f5cf9523c64`|MP3|F04_blood_x.js|REGISTERED — CONSUMER_PENDING (no authored call site on the frozen base)|
|`BX_CRATE`|`audio_src/showdown/BX_CRATE.wav`|`242cc58ce0e8`|`assets/audio/sfx/showdown/BX_CRATE.mp3`|`a02514f9a4c5`|MP3|F04_blood_x.js|REGISTERED — CONSUMER_PENDING (no authored call site on the frozen base)|
|`BX_DOWNED`|`audio_src/showdown/BX_DOWNED.wav`|`cab6cfa56b3e`|`assets/audio/sfx/showdown/BX_DOWNED.mp3`|`8bb0d9ab6438`|MP3|F04_blood_x.js|REGISTERED — CONSUMER_PENDING (no authored call site on the frozen base)|
|`BX_GONE`|`audio_src/showdown/BX_GONE.wav`|`22e20df78607`|`assets/audio/sfx/showdown/BX_GONE.mp3`|`5cfaf7686822`|MP3|F04_blood_x.js|REGISTERED — CONSUMER_PENDING (no authored call site on the frozen base)|
|`BX_NAMECARD_SLAM`|`audio_src/showdown/BX_NAMECARD_SLAM.wav`|`bc12a1b343e6`|`assets/audio/sfx/showdown/BX_NAMECARD_SLAM.mp3`|`a148179acc1b`|MP3|F04_blood_x.js|REGISTERED — CONSUMER_PENDING (no authored call site on the frozen base)|
|`BX_OVERWATCH`|`audio_src/showdown/BX_OVERWATCH.wav`|`6c1bc181e2c2`|`assets/audio/sfx/showdown/BX_OVERWATCH.mp3`|`b03b54f972b4`|MP3|F04_blood_x.js|REGISTERED — CONSUMER_PENDING (no authored call site on the frozen base)|
|`BX_POD_REVEAL`|`audio_src/showdown/BX_POD_REVEAL.wav`|`6343ef545dc4`|`assets/audio/sfx/showdown/BX_POD_REVEAL.mp3`|`974f0174984f`|MP3|F04_blood_x.js|REGISTERED — CONSUMER_PENDING (no authored call site on the frozen base)|
|`BX_SLIDEIN_IDLE`|`audio_src/showdown/BX_SLIDEIN_IDLE.wav`|`a8557b9a3a39`|`assets/audio/sfx/showdown/BX_SLIDEIN_IDLE.mp3`|`050765ceb1ce`|MP3|F04_blood_x.js|REGISTERED — CONSUMER_PENDING (no authored call site on the frozen base)|
|`BX_WARROOM`|`audio_src/showdown/BX_WARROOM.wav`|`d972cc3396d4`|`assets/audio/sfx/showdown/BX_WARROOM.mp3`|`b06b272f9fc1`|MP3|F04_blood_x.js|REGISTERED — CONSUMER_PENDING (no authored call site on the frozen base)|
|`TR_01`|`audio_src/trap/TR_01.wav`|`3ca5fafa763a`|`assets/audio/sfx/trap/TR_01.mp3`|`7ec2e11a2afc`|MP3|F05_trap.js|REGISTERED — CONSUMER_PENDING (no authored call site on the frozen base)|
|`TR_02`|`audio_src/trap/TR_02.wav`|`54a3dd988f95`|`assets/audio/sfx/trap/TR_02.mp3`|`cce571b9c62b`|MP3|F05_trap.js|REGISTERED — CONSUMER_PENDING (no authored call site on the frozen base)|
|`TR_03`|`audio_src/trap/TR_03.wav`|`4f6b7f6c6e94`|`assets/audio/sfx/trap/TR_03.mp3`|`77fc669add66`|MP3|F05_trap.js|REGISTERED — CONSUMER_PENDING (no authored call site on the frozen base)|
|`TR_04`|`audio_src/trap/TR_04.wav`|`50800268320a`|`assets/audio/sfx/trap/TR_04.mp3`|`12572b16c216`|MP3|F05_trap.js|REGISTERED — CONSUMER_PENDING (no authored call site on the frozen base)|
|`TR_05`|`audio_src/trap/TR_05.wav`|`034b8c2e0ad3`|`assets/audio/sfx/trap/TR_05.mp3`|`f96318f489e0`|MP3|F05_trap.js|REGISTERED — CONSUMER_PENDING (no authored call site on the frozen base)|
|`TR_06`|`audio_src/trap/TR_06.wav`|`3ea5e5bb1a01`|`assets/audio/sfx/trap/TR_06.mp3`|`c09bdfb99062`|MP3|F05_trap.js|REGISTERED — CONSUMER_PENDING (no authored call site on the frozen base)|

## 6. Consumers (frozen IF-1 base reality)

No authored runtime call site for **any** F11 id exists on the frozen IF-1 base (checked with `git grep`): the
`NO_*` hooks are manifest-only, and F02/F04/F05/F06 are separate, unmerged fragment branches. Therefore every F11
sound is **REGISTERED — CONSUMER_PENDING**: registered cleanly, no fake call site invented.

| Family | Intended consumer | Consumer branch presence | Status |
|---|---|---|---|
| `NO_01–NO_06` | F02/F03 NEW OGA drop-in hooks | hooks exist; no `sfx()` call on base | REGISTERED — CONSUMER_PENDING |
| `GN_01–GN_06` | F02 IRON & GRACE (`js/frag/F02/catalog.js` `audio:'GN_0X'`) | F02 branch only | REGISTERED — CONSUMER_PENDING |
| `TR_01–TR_06` | F05 THE TRAP | absent | REGISTERED — CONSUMER_PENDING |
| `RM_01–RM_08` | F06 RAINMAKER | absent | REGISTERED — CONSUMER_PENDING |
| `BX_*` | F04 PLAYMAKERS / BLOOD X (F07 if owner reassigns) | absent | REGISTERED — CONSUMER_PENDING |
| `DRAGON_WINGS`, `BARS_PUNCHLINE` | existing combat/story behaviour | restored, no authored call site | REGISTERED — CONSUMER_PENDING |

## 7. Legacy restoration

`DRAGON_WINGS` and `BARS_PUNCHLINE` were absent (`missing-from-delivery`, `file:null`, no-op). Their source masters now
exist and were run through the accepted pipeline under the **same ids**: both entries transitioned cleanly from inert →
available, resolving to `assets/audio/sfx/combat/{DRAGON_WINGS,BARS_PUNCHLINE}.mp3`. No game behaviour was altered
beyond making the authored sound available.

## 8. MAGIC_SEANCE

Unchanged and deliberately inert: `registered:false`, `file:null`,
`reason:'defective-render-do-not-wire'`. It was **not** replaced, activated, re-synthesized, or reinterpreted from
another sound. Enforced by `tools/release.mjs`, the in-page smoke suite, and the F11 test.

## 9. Collisions / defects

| Check | Result |
|---|---|
| duplicate logical ids | none (live registry 279 unique ids) |
| duplicate runtime paths (case-insensitive) | none |
| F11 id colliding with an accepted F1 id | none (F1 ids are disjoint; `RAAudioParts` refuses redefinition) |
| overwrite of accepted audio | none (all F1 assets byte-identical) |
| identical-file duplicates | none introduced by F11 |
| source defects | none (no clipping/silence/corrupt headers; sane durations 0.30–59.5 s) |

## 10. Tests

* `npm test` → **PASS** deterministic release gate (144 JS syntax checks, 30 fragment suites incl. the new F11 suite,
  loader, leak check, zero-change replay).
* `npm run build` → **PASS** (includes `verifyArtifact`: index references resolve, OPEN leak check).
* `node tools/run-tests.mjs --fragment f11` → **PASS** `tools/tests/f11/audio_completion.test.mjs` covers: deliveries
  parse (41/37 + hashes), runtime derivatives exist and decode (MP3 frame check), every registered id resolves, no
  id/path collisions, F1 unchanged (241 ids), `DRAGON_WINGS`/`BARS_PUNCHLINE` resolve, `MAGIC_SEANCE` inert, GN/TR/RM/BX
  part registration, and no-gesture/absent-consumer calls never throw.
* `node tools/ul-l2-001-browser.mjs` → **PASS 57/57** at 360/390/430 (in-page RASmoke 0 failures; reconciled library
  totals and the 14 audio/phone checks pass).

## 11. Browser / autoplay smoke

`node tools/tests/f11/audio_completion-browser.mjs --dist dist` → **PASS 8/8** on a real headless Chromium:

* audio stays locked before any gesture (autoplay policy respected — not weakened);
* a real pointer gesture unlocks the engine;
* a safely callable one-shot from every reachable family (`NO_02`, `TR_02`, `GN_01`, `RM_01`, `BX_POD_REVEAL`) plus both
  restored legacy sounds (`DRAGON_WINGS`, `BARS_PUNCHLINE`) fetches, decodes and plays;
* F11 loops (`NO_05`, `TR_01`, `GN_03`, `RM_05`, `BX_WARROOM`) start with measured loop points and stop;
* zero page/console/network errors — no 404, decode failure, missing id or unhandled playback promise.

## 12. Owner integration actions

1. **Merge** `frag/audio-completion/001`; resolve `js/data/audio/parts/F02_guns.js` against the F02 branch in favour of
   this registered version, and drop any duplicate F02 part. `check-owner-surfaces --as-owner` (the owner's own gate).
2. Confirm fragment id ownership if BLOOD X belongs to F07 rather than F04 — rename `F04_blood_x.js`/registration only;
   **no ids change**.
3. When a consumer branch lands, add the authored `sfx()`/`loop()` call sites; nothing else is required (ids already
   resolve). If the F1 library is ever rebuilt, re-run the two commands in §2.
4. Source masters remain external (as with the accepted F1 delivery); no WAVs were added to the repository.

## 13. Remaining SOURCE_REQUIRED

None. All 37 sourced ids resolve. `MAGIC_SEANCE` is **not** SOURCE_REQUIRED — it is DEFECTIVE/INERT by authority and
must stay so.

## 14. Files changed

* `tools/audio-build.mjs` — additive patch ingest (`--patch`, `--manifest-exclude`)
* `js/data/audio_manifest.js` — regenerated (generated surface)
* `index.html` — LOADER region (generated surface)
* `js/systems/smoke.js`, `tools/release.mjs` — regression-gate reconciliation
* `js/data/audio/parts/F02_guns.js`, `F04_blood_x.js`, `F05_trap.js`, `F06_rainmaker.js` — new
* `assets/audio/sfx/{new_oga,trap,iron_and_grace,rainmaker,showdown,combat}/*.mp3` — 41 new runtime MP3s
* `tools/tests/f11/audio_completion.test.mjs`, `audio_completion-browser.mjs`, `patch_sound_delivery.json` — new
* `docs/engineering/F11_AUDIO_COMPLETION_001.md` — this document
