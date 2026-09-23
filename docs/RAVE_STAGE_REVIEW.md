# Rave stage + content-free hooks

Engineering decision: **HQ PASS — ENGINEERING 02**, granted by HQ for commit `1905774afae66398c46ec55340c9d07f820b9c18`.
Branch checkpoint: **READY FOR INTEGRATION REVIEW**. No merge, push or deployment is authorized or performed for this card.

HQ accepts the 270×480 Stage Contract, 1× Rich/Ogun presentation, Rich contact (75,344), Ogun contact (192,273), shared source anchor (40,88), exact approved composition, foreground speaker/depth behavior, dialogue/control safe regions, frozen-art byte preservation, Party production adapter, empty authored-phase framework, DEV review isolation and unchanged production saves/progression. This records HQ's decision; it grants no story or additional framework scope.

Base: integrated Party Foundation `3d306591ec16ec77b677856f52e9ed22088a9b56` (UBE FUN PASS, HQ SYSTEM PASS, HQ INTEGRATION PASS). The current Production Card authorizes frozen Art Card 02 ingestion, stage integration and hooks only. No adventure content is supplied or authored.

## Frozen art and provenance

The supplied package README/manifest still say READY FOR HQ REVIEW/candidate. HQ's newer Production Card explicitly grants UBE TASTE PASS + HQ ART PASS and freezes the delivered masters/layers/masks. That newer authority governs ingestion; the original manifest is retained unedited as historical provenance.

Exact imports, with package-relative paths preserved under `assets/ogun_rave/`:

| File | SHA-256 |
| --- | --- |
| `masters/ogun_neutral_80x96.png` | `093bf68ef4b4d3ff64228b50a94b8e57e568886a582b13e005636581c18e412b` |
| `masters/rave_interior_270x480.png` | `597591188a9f3b7865625f967933b07586930982fb31d0c92ab4e5fc38c51118` |
| `layers/room_without_foreground.png` | `fc1690873d84d492e49756cde4daf4ae16befbaead4410aef59d090864ee5556` |
| `layers/speaker_foreground_overlay.png` | `04e5fb68a58df316c1848941390fdac7968d1691385604958490ac6ec698913c` |
| `masks/crowd_removal_edit_region.png` | `dc6440802dc5190b27bd9f044ccdb67b4254017ddaaf7b5f42b0400a1b4d6c2b` |
| `masks/ogun_neutral_silhouette.png` | `b788634871cbe6bb354b7d2ce9950b1ebdeecb01a7652548767a6b729b6e42f1` |
| `masks/speaker_foreground_mask.png` | `810a9b02e4325c27932318e153f9353b90df24b2ef7109ff252707d51dc54628` |

`PACKAGE_MANIFEST.json` is copied byte-for-byte as `assets/ogun_rave/ART_PACKAGE_MANIFEST.json`. The existing `assets/rich_standing_right.png` is reused without copying or modification; its hash `765170076e8d3a9af9e8857e176e079b2a68c7ee1daafb7c8d551482228f144b` matches Art's frozen Rich reference. No review enlargement or generated reference is used as runtime art.

## Completed Stage Contract

Machine-readable contract: `js/data/stages.js`, ID `ogun-rave`. Existing docks contract remains unchanged.

| Property | Engineering integration value |
| --- | --- |
| Native canvas | 270×480; origin (0,0) |
| Runtime scale | Both actors 1×; uniform responsive stage scaling, `image-rendering: pixelated` |
| Actor source cells | Both 80×96, local contact-edge anchor (40,88); shoe pixels end at row 87 |
| Rich | World contact (75,344); source cell origin (35,256); authored facing right; z=5 |
| Ogun | World contact (192,273); source cell origin (152,185); authored facing retained, no mirroring; z=6 |
| Contact lines | Party floor y=344, x=28–242; host landing y=273, x=166–248 |
| Host landing | (166,273), 82×21; Ogun's contact edge aligns to its top |
| Party floor | (36,300), 198×66 composition region; not movement/collision geometry |
| Dialogue-safe region | (32,132), 206×60, above both actors |
| UI exclusion | (16,376), 238×88 for bounded choices; below both actors |
| Layer order | Opaque room z=1 → Rich z=5 → Ogun z=6 → speaker foreground z=7 → dialogue/choices z=9 → inspection z=10 |

The supplied proof placement is adopted without changing pixels or enlarging Ogun. The native runtime screenshot matches the supplied native proof pixel-for-pixel. The composition preserves the host landing hierarchy and open floor.

Use the opaque room master below actors and the speaker foreground overlay above them. Do not draw the partition base simultaneously. The complementary base is retained for reconstruction evidence only. The overlay includes adjacent background margins; it is not a tightly traced speaker cutout. The fixed stack is intentional for these fixed actor slots. A review-only speaker overlap probe moves Rich temporarily to contact (12,320), then reset restores the contract. It defines no walking or gameplay position.

Masks preserve Art's semantics: speaker redraw, Ogun alpha silhouette and historical crowd-removal edit evidence. No mask defines collision, navigation, triggers or interactions. No runtime mask processing modifies the masters.

## Party adapter and adventure hooks

- `js/data/party_behaviors.js` contains only accepted behavior IDs/labels. The old DEV data still owns its original temporary hints/situations/results; its behavior labels reference this shared list without changing the prototype's output.
- `js/systems/rave.js` adapts the existing `RAParty.createSession` to authored phases. Default phase list is empty. A future phase can supply Party definitions; the adapter requires explicit PRODUCTION classification, at least one situation and a result for each accepted behavior. DEV placeholder definitions are rejected.
- API: `setPhase`, `equip`, `interact`, `choose`, `patch`, `snapshot`, `view`, `commit`, `leave`. Phase IDs, dialogue, choices and mappings are supplied by future authorized code; none are provided by this card. `patch` changes only session memory. `onView`, `onResult`, `onChoice` and `onExit` callbacks let authorized code use existing scene/people/event/state APIs. This is a short JavaScript adapter, not a scripting language or quest engine.
- Consequences are opt-in: `commit(id,payload)` can call only an explicitly supplied own-key callback. The callback map is empty by default; review mode rejects commits even if callbacks are supplied. No concrete persistent consequence is implemented. Future authored callbacks remain responsible for their scoped semantics and idempotence.
- `js/scenes/rave.js` registers the real `ogun-rave` scene with `RAScenes`. A future authorized caller can pass `payload.definition` and an optional initial `payload.phase`. It reuses child scopes, Stage Contract geometry, scoped listeners and resize cleanup. Scene exit disposes the adapter and restores prior input access. Actor states are asset maps containing neutral only; unsupported states are rejected.
- Production entry remains unconnected. Existing `RAScenes.go` owns ordinary production scene persistence when a future caller explicitly transitions; the DEV review never calls it. No save schema/migration changes. The only battle integration edit makes its keyboard handler ignore `ogun-rave`, as it already ignores bedroom; hidden sibling controls are inert only while the production rave scene is mounted, then restored.

## DEV review

Run `npm run build`, serve `dist/`, then open `/?dev=1` and select **ENTER RAVE STAGE REVIEW**. It opens a separate `rave-review.html?dev=1` tab with `noopener`. Click ENTER RAVE STAGE REVIEW there. Direct review without `dev=1` stays gated.

The initial stage has no UI over the art. Below it are inspection-only contact/safe-zone, dialogue-layout and speaker-depth controls, accepted behavior selection (no authored situation), RESET REVIEW and EXIT REVIEW. Escape also exits. All controls are review-only. No dialogue or reaction is attributed to Ogun. Reload ends the session. Close the tab to return to the unchanged original game.

## QA / evidence

- `npm test`: frozen byte hashes/dimensions, unchanged Rich, existing docks geometry, rave actor geometry, all three production-adapter behavior resolutions using text-free mechanical fixtures, phase/choice hooks, default-empty content, DEV rejection, closed-session behavior and explicit consequence boundary; existing deterministic checks also run.
- `npm run build` / `npm run verify:artifact`: review page is included in the generated artifact and uses the same release query version and build identity as other pages.
- `tools/rave-browser-test.mjs`: normal-entry isolation, real DEV new-tab path, source proof pixel equality, exact complementary-layer reconstruction, speaker occlusion, reset/exit/re-entry/reload, save byte equality with storage-write traps, production scene registration/cleanup, battle keyboard isolation, phone sizing and no runtime errors.
- Native `rave-native-270x480.png`, `rave-dialogue-zones-native.png` and `rave-speaker-probe-native.png` are actual browser captures. `rave-review-4x.png` is an exact nearest-neighbor enlargement of the native browser capture. Native composition, contact, readable character scale, host landing, safe dialogue placement and speaker rendering are visually inspected, not inferred from automated tests alone.
- Existing Party prototype browser regressions retain all nine outcomes, three openings and save isolation. Existing fresh-save smoke has 37 checks. The progressed-save World Events smoke failure is the same documented baseline failure; it is not fixed under this card.

For reproducible browser QA, install/provide Playwright + Edge and Sharp, or set `RA_PLAYWRIGHT_PATH` / `RA_SHARP_PATH` to installed package paths. Run `node tools/rave-browser-test.mjs <local-url> <evidence-directory> <Art-package-directory>`. The final argument enables exact supplied-proof comparison. Existing Party regression tooling accepts the unchanged baseline URL for comparison.

## Limitations and HQ decisions

No authored phases, Party situations, reactions, choices, persistent consequences or production entry route are included. No new motion, sound, crowd, art or story is created. Stage masks support visual composition only. Arbitrary future actor movement/depth needs a separately reviewed delta; the speaker probe is evidence, not movement support. Dialogue/choice UI is bounded and scrollable, with final content fit to be checked when authorized content exists.

HQ has accepted the adopted 1× composition, contract regions and hook boundaries. No blocking art-metadata conflict was found: both source anchors agree with runtime conventions. Recommend integration at HQ's controlled checkpoint with the DEV-only route and documented baseline issue preserved. This branch stops at READY FOR INTEGRATION REVIEW; merge, push, deployment and Engineering 03 require HQ authorization. No story content or additional framework is authorized.
