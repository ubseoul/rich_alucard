# Combat feedback scoped handoff

Status: scoped native browser and source checks pass; coordinator accepted latest 390px phone contact, Draco muzzle/gold rounds and JDM contact visuals. Full integrated player acceptance remains separate. No deployment, push or main merge.

## Provenance and isolated work
Engine base: e608bf7878c93acc362b19c44e2228f92d353245.
Private base: a942875e6a8fe7fc78bc07ce37e55e4b7a718e2e; combat-private is unchanged.
Branch: feedback/combat-20261008 in task-10/combat-engine.
Candidate: task-10/candidate-combat, copied from R4 then overlaid with the four runtime files below. Original release metadata remains R4; COMBAT-CANDIDATE.json records the overlay.
Preview: http://127.0.0.1:8894/ (task-10 own listener PID 35408). Existing LAN 8787 PID 7064 was read and remains unchanged.
Sources, baseline copy, sealed originals, user profiles/saves and Pages main were not edited.

## Exact runtime scope
- game.js: importerTurn function and JDM-only enemyTurn dispatch.
- js/data/combat.js: JDM move/encounter/combatant entries only.
- js/frag/F07/gbenga_combat.js: phone opener and first received player hit activates Draco.
- js/systems/enemy_fx.js: enemy-specific Gbenga phone/Draco and legacy_importer choreography, with owning-root cleanup.
- New docs/feedback-combat/{DEMAND.md,source-preservation.json,VALIDATION.md,browser-results.json,preview-capture.json,evidence-index.json}.
- New tools/tests/feedback/{combat-rules.test.mjs,combat.browser.mjs}.

No private code, Combat2 lifecycle, CEO adapter, other enemy timeline, original PNG, registry architecture, G1-G9 or brother frozen region was edited.

## Behavior and preservation
Gbenga has a 12 x 80ms descending 58x100px phone with contact at frame 6, exact speech HELLO HELLO RICH CAN YOU HEAR ME. It replaces the first 24-damage sleeve sweep slot; other authored dialogue remains.
His first positive PLAYER hit equips Draco. The phone opener still resolves; the next telegraphed turn uses Draco. The original pattern then alternates with Draco. Draco has 16 x 68ms drawn muzzle/individual gold-round beats, contact at frame 5, exact speech scatta dem. Original 2 x 20 damage remains.
JDM selects a 72px wheel throw and an 86px bumper/grille/lamps toss with equal weight. Each uses 12 x 78ms drawn frames, frame 6 contact and original 16 damage. Existing Importer line is unchanged. Existing four authored body states and their left-facing marker remain.
Scoped owner cancellation restores body source/style, target style and the importer facing marker, removes effect/bark, and guards contact once. Reduced motion draws one contact frame and resolves after 220ms.
Sixteen canonical/body PNG SHA256 comparisons match the R4 baseline. Private S5/S6 match. Removing only the two authorized game.js regions yields byte-identical other legacy source. See source-preservation.json.

## Actual browser results
360x800, 390x844, 430x932 and 1280x900: PASS native FIGHT/BLOOD then BITE at Gbenga; JDM menu actions cover each attack. Phone HP 100->76 and Blood PP 8->7; first-hit flag equipped; Draco after Bite healing takes 94->54 through its two 20 hits and queues voice, not a duplicate Draco. JDM HP 100->84->68.
All four moves reached every slot (12/16/12/12). 47-48 distinct drawn canvas images per viewport (idle/recovery slots may repeat).
Before-contact cancel: 0 contacts. After observed-contact cancel: 1. Owner replacement: old 0/new 1. Styles restored and no residual layer. Reduced-motion bumper: 1 contact/220ms/no residual layer.
Actual JDM scene interruption before contact: bedroom/0 contacts/0 effects; reentry HP100. Reload preserves money/cars/day and removes effects. No page errors.

## Test setup and exact limits
Fresh headless Chromium contexts with no user profile, loopback ephemeral QA server, dev=1/speed=10/mute=1 and dev tools disabled.
A prior legitimately earned QA checkpoint is copied into the disposable context solely for access. It is not a new campaign completion. Gbenga access uses RACombat2.run; JDM access uses its actual scene. Player RNG is .5 and both weighted JDM choices are selected deterministically solely for coverage. Native combat buttons drive the turn/damage evidence.
Twenty stage contact screenshots are separately frozen through the actual renderer for inspection. This does not prove live timing by itself; the native turn/frame evidence does.
Library preview captures every frame via native menu actions, with frame dwell extended only in that disposable capture context for precise screenshots; packaging reports that separately. Production source timing is unchanged.
No full campaign, all choices, victory/defeat route, real device, audio or full game polish claim. Full integrated candidate/player eyes acceptance remains coordinator-owned.

## Reproduction
From combat-engine:
node tools/tests/feedback/combat-rules.test.mjs
node -e "import('./tools/tests/rc4/enemy-lifecycle.test.mjs').then(m=>m.test(process.cwd()))"
node -e "import('./tools/tests/final_a/combat-presentation.test.mjs').then(m=>m.test(process.cwd()))"
node tools/tests/rc5/lane-o-timeline.test.mjs
node tools/tests/feedback/combat.browser.mjs

Browser test env overrides: RA_COMBAT_PRIVATE_ROOT, COMBAT_DIST, COMBAT_CHECKPOINT, COMBAT_EVIDENCE, RA_PLAYWRIGHT_PATH and RA_CHROME. Defaults match task-10 paths.
Scoped new source tests and all three existing regressions pass. The older general F07 test expects the superseded sweep/30-percent trigger and was not represented as passing.

## Evidence and failure investigation
task-10/evidence/baseline: original native baseline screenshots at all widths.
task-10/evidence/candidate-final/results.json: final detailed native state/contact/frame/lifecycle outcomes.
task-10/evidence/candidate-final/four-width-board.png: 20 final stage views.
task-10/evidence/actual-preview: full actual native screenshot sequence and capture.json provenance.
task-10/COMBAT-TEST-RESULTS.json: compact results.
The first 1280-failure.png is archived in evidence/superseded-20261008-desktop-delay with its failure.json and explanation. It was a test using a fixed540ms post-contact assumption under load. The test now observes contact before cancellation; final four-width run passed after the JDM-facing fix.

## Library preview
Confirmed Library ID: libfile_d212a707b4608191b622369f49625a33.
File ID: file_0000000014b4822fa5e518d0e7a0b2d4; version 0; path /Rich-Alucard-combat-actual-sequence.gif.
Create status succeeded; size 3,481,539 bytes. GIF SHA256 f65c489b17f2b9f09f31009e5c58af855f60302f4274195819721fe52d983e1a.
All 52 actual native full-browser screenshots are included. GIF is5.6seconds after required10ms frame rounding and500ms end-of-move holds. Stage contact sheet is an extra local preview. Capture provenance and immutable evidence hashes are committed.
Exact metadata limitation: current Library skill helper apply-xattrs on the local GIF failed in Windows Python with AttributeError: module 'os' has no attribute 'setxattr'. External save is confirmed. Returned identity/version and complete xattrs are retained in task-10/COMBAT-LIBRARY.json; local extended attributes were not applied. No helper modification, bypass or duplicate upload.

## Access limits
Ordinary workspace exec/apply_patch infrastructure fails before launch (sandbox helper_unknown_error). Narrow reviewed PowerShell task-10 commands worked and were automatically accepted; no review rejection and no bypass.
Direct reporting to parent thread 01a10dac-6236-738a-988b-c3ec8f7db0cf returned thread not found; coordinator reporting to 01a11bee-1088-71c7-9a1e-c46d222eb03e succeeds. Final delegated reply is also delivered to parent automatically.
