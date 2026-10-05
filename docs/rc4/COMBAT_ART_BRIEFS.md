# RC4 first comb audit — custom multi-frame attack briefs

Audit base: `4981d5245d0600c062a7f431acd8253dc28b9cc6` (`origin/integration/rc3`). Audit branch: `rc4/comb-audit`. This is an OPEN-only review and proposed refinement plan, not implementation or RC4 acceptance. Stable finding IDs resolve to [COMB_LEDGER.md](COMB_LEDGER.md).

## Readiness and source authority

**BLOOD BATH has authored authority.** `docs/CURRENT_CANON.md:40–44` and `docs/RICH_ALUCARD_GAME_BIBLE.md:75–86` define POWER: chunky blood projectiles/orbs/tendrils traveling from Rich to target, left-to-right, Pokémon-style resolution rather than bullet hell. No choreography has been inferred from the name. The existing reusable package defines floor rise, engulf, contact and impact layers; it contains no character or baked enemy silhouette. A new candidate must reconcile the travel grammar with this inherited floor-rise staging, not substitute an invented bath gag.

**Approved identity:** Rich seated idle and Vampire Bite pose have explicit APPROVED MASTER rows. Gbenga’s six80×96 runtime v2 states are FROZEN. `rich_seated_cast.png` and several FX register rows remain STATUS UNKNOWN; runtime/canon docs describe use but do not independently settle asset approval. RC4-022 requires steward reconciliation before artist launch. Never edit/trace over frozen source pixels into replacement masters. Candidate animation files are separate, pending Ube approval.

**Access package prepared:** [combat-reference.zip](evidence/combat-reference.zip), [exact paths/hashes/dimensions/statuses](evidence/combat-reference-inventory.json). The ZIP contains unchanged repo bytes, source authority and placement screenshots, not generated art. It is a small job-focused reference set; artist must inspect status, not treat every bundled image as approved. Hashes allow steward to identify drift. No standalone artist should start from a description without this package.

| Brief | Status | Missing dependency |
|---|---|---|
| BB-01 Rich BLOOD BATH | Authored/source-ready; access-ready; candidate timing/treatment needs creator approval | FX approval/status reconciliation; agree travel-to-floor-rise staging |
| VB-01 Rich VAMPIRE BITE | Authored/source-ready; approved identity available; access-ready | Approve proposed timing; reconcile FX rows |
| RV-01 Rich REVENGE | Authored/source-ready; exact mechanic locked; access-ready | Restore exact stored-value UI; approve timeline/FX status |
| GB-01 Gbenga sleeves/voice-note signature pair | Authored/source-ready; frozen identity states/access ready | Approve candidate in-between/FX treatment; boss placement screenshot during real fight still needed |
| Later BLAD33EE / other bosses | **Needs creator decision**, not launched | Hunter slash label/telegraph alone does not authorize elaborate new choreography; choose only after core set |

## Renderer contract before choosing deliverables

Runtime authority is `game.js` (legacy prologue), `js/scenes/combat2.js`, `js/systems/combat_presentation.js`, `combat_pixel_fx.js`, `enemy_fx.js`, `js/engine/stage.js` and `js/data/art_registry.js`. `RACombatPresentation.move()` creates a world-clipped overlay, scales world width from270, projects actor visible/contact boxes and draws pixelated images. World height is computed from director worldRect; it is **not always362 or480**. Code pixel FX uses a270-wide dynamic canvas. Existing sheets are read as individual source cells, not displayed as whole sheets. People often use80×96 runtime cells; actual Rich seated/bite dimensions are in the inventory, not assumed to equal a standing person.

Current Blood Bath FX in Combat2 uses rear states105/210ms, foreground/engulf315, contact405, impact585, close720, scaled to the code FX duration. Legacy volley and canonical FX use another sequence. Vampire Bite swaps jaw/snap/contact phases; Revenge extraction/mass/crack/impact runs another layered timeline. These are observations, not newly approved timings. Rules resolve before presentation; future integration must reveal hit/HP at the agreed contact event without re-rolling damage. RC4-020 covers multiple timing owners.

Delivery format proposed: **individual binary-alpha PNG states plus JSON metadata**, optionally a single-row uniform-cell sheet generated from exactly those candidate states. Runtime already supports separate files through art registry; a new sheet decoder would be engineering work, not assumed support. Metadata fields: move, character, sourceAuthority, candidateStatus, file/cell, anchor, phase, durationMs, contactEvent, floor/contact role, facing, drawLayer, fullMotionBounds, safeAreaPolicy, playback/skip/reducedMotion. Do not promise unsupported GIF/APNG/video playback.

### Shared placement, naming and QA

ART ACCESS MODE **A** for every brief: repo-connected at exact ref `4981d5245d0600c062a7f431acd8253dc28b9cc6`, paths listed in inventory. Mode **B** fallback: the prepared ZIP, its inventory and this brief supplied before launch. Mode C is not assumed; no onboarded artist task references have been established in this audit.

Facing: Rich starts left, target right in ordinary battle; use runtime attacker/target points rather than baking positions. Opposite-facing states, if needed, are explicit candidate variants; do not blindly flip clothing/identity details. Actors use existing contact/floor projection. Gbenga80×96 anchor proposal `(40,88)` must be checked against existing art registry grounding before use. Rich anchor is existing actor contact, not an invented universal80×96 point. Screenshot evidence governs current placement, approved art governs identity.

UI safe areas: draw only within director worldRect, beneath command/log/HP UI. Full-screen270×480 impact states must be fitted/clipped to the intended world effect region; they are not permission to cover phone controls or dialogue. Document actual safe rectangles from a real combat capture before integrating; do not hardcode390 CSS pixels into sprites. Full-motion bounds include anticipation extension, travel, contact splash and recoil; nothing spills into command buttons. Contact roles must distinguish center burst from ground-anchored engulf.

Draw order: environment → rear FX → current target reaction → optional target-alpha overlay → foreground FX/contact → short opaque impact if approved → UI. Mask with current reaction alpha at runtime; never bake a particular enemy silhouette into reusable Rich FX. Recovery returns every actor/FX layer to its prior position and releases input. Trigger from actual resolved move event once, not button hover/menu opening. First/repeat/skip/reduced-motion/lethal/interrupt cases tested; cancel/scene exit tears down all layers/timers.

Naming proposal: `assets/rc4_candidates/combat/<brief-id>/<move>_<phase>_<nn>.png`, `<move>_candidate_manifest.json`, `<move>_native_review.png` (candidate contact sheet only after authorized art work). Never overwrite existing `assets/blood_bath*`, `vampire_bite*`, `revenge*` or frozen Gbenga/Rich files. Supply file SHA, cell dimensions, anchor and duration per state.

QA: native100%270-wide preview and real390 host playback; no smoothing, integer source/destination placement, consistent binary alpha/palette; identical character face/outfit/scale/floor across states; no cropping anchor drift; approved original pixels unchanged; contact at actual target, effect does not mask readable telegraph; hit/HP/heal/value reset each happens once; repeated move remains readable; return pose/music restored. Each candidate requires Ube’s explicit approval before integration.

## BB-01 — Rich Alucard / BLOOD BATH

ART ACCESS MODE: **A exact repo ref and inventory**, **B ZIP prepared fallback**. Source: CURRENT_CANON40–43, GAME_BIBLE75–76, `assets/blood_bath_README.md`, `blood_bath_manifest.json`; runtime in game.js and combat_presentation.js. Identity: approved `assets/rich_seated_idle.png`; existing cast is runtime reference with unresolved register status, not an approved new identity master. FX paths: floor_rise01–03, foreground01, engulf01–02, contact01–02, impact_fullscreen, exact inventory above.

Treatment proposal: **layered, primarily FX-only**, keep Rich’s approved seated identity; optional minimal cast transition only after steward approval. Anticipation: hold existing seated/cast state while first chunky blood mass gathers. Action: authored left→right chunky travel, resolving into existing target-side floor rise. Impact: target-centered contact plus short optional abstract flash. Recovery: blood clears, target reaction returns, Rich remains/returns to approved seated state. Do not make water, bathing props, explicit body content or a baked victim.

Proposed state budget/timing, not canon: **8–10 states, ~720–900ms total**, anticipation120ms, travel180–240, impact180–240, recovery180–300; choose one contact marker at travel arrival, not every blood fragment. Existing floor/engulf/contact package can be reused without repainting; any new traveling blobs are candidates. Cells: rear/foreground270×362 anchor135,362; engulf96×96 anchor48,88; contact96×96 anchor48,48; optional impact270×480 origin0,0. Runtime travel path/target and dynamic world clipping own placement. Full-motion bounds proposed: attacker-to-target corridor inside world, target rear effect clipped so it cannot erase Rich/companions.

Playback: move event `type:move,id:blood`; contact synchronized to damage UI reveal, not additional damage execution. First and repeated duration must use same timeline semantics; skip removes every layer and returns to resolved state. Acceptance: travel reads as POWER at native size, no bullet-hell stream, no doubled legacy/code spectacle, correct reaction and recovery on all target sizes. Creator ruling: approve proposed travel→target-rise staging and state budget after FX provenance reconciliation.

## VB-01 — Rich Alucard / VAMPIRE BITE

ART ACCESS MODE: **A exact repo ref and inventory**, **B prepared ZIP fallback**. Source: GAME_BIBLE78–79, CURRENT_CANON43, `vampire_bite_README.md` and manifest; locked existing damage/healing. Identity: approved `rich_seated_idle.png`, `rich_vampire_bite.png`. FX upper/lower jaws, snap,64×64 contact,16×16 lifesteal states in inventory.

Treatment proposal: **layered**; preserve approved bite pose, use authored disappear→symbolic jaws→beside-target bite→lifesteal→throne. Anticipation: disappearance cue, jaw entry. Action: fast snap with readable hold. Impact: bite pose at runtime contact; actual hit/heal event only once. Recovery: approved particles return toward Rich, then immediate throne pose, no lingering duplicate Rich sprite.

Proposed budget: **6–8 phase states, ~800–1050ms**;120–180 anticipation,180–240 jaws/hold,120–180 contact,300–450 lifesteal/return. Existing jaw cells270×480; upper anchor135,0; lower135,480; snap origin0,0; contact64×64 anchor32,32; particle16×16 anchor8,8. Jaw bounds extend off world edge with near-black fill as manifest specifies; do not trim original padding. Rich bite placed by current target contact and existing approved pose anchor; do not invent a new standing likeness.

Playback `move:bite`; contact reveals damage, lifesteal phase reveals healing from already-resolved amount. UI stays safe, target remains interpretable at contact. Acceptance: unmistakable SPEED, snap hold readable, no cut-off jaws, no broken actor floor, zero/dodged/lethal heal cases do not fabricate healing, skip/reduced motion and return correct. Candidate timing requires approval; no new choreography authority missing.

## RV-01 — Rich Alucard / REVENGE

ART ACCESS MODE: **A exact ref and inventory**, **B prepared ZIP fallback**. Source: CURRENT_CANON44, GAME_BIBLE85–86, `revenge_README.md` and manifest. **Locked mechanic:** reflect exactly actual accumulated received HP damage, once, then reset0; no minimum fallback. Rich remains seated; music uninterrupted. Approved seated identity, exact wound/extraction/mass/crack references in package, FX approval distinctions retained.

Treatment proposal **FX-only layered**: anticipation shows stored wounds already on Rich; action extracts wounds into one mass and holds; impact ruptures current target using alpha mask; recovery drains/reveals exact value and clears storage/FX. No new standing Rich animation, no target-shaped source sprite. Proposed **10–12 reused/candidate states, ~900–1200ms**: persistent wounds before move,180–240 extraction,240–360 mass/hold,180–240 rupture,240–360 recovery. Wounds16×16 anchor8,8; extraction24×24 anchor12,12; mass/crack96×96 anchor48,48; impact270×480 origin0,0. Place wounds relative to Rich, crack mask from current target reaction alpha; floor unchanged.

Playback `move:revenge`; named contact matches the single reflected-damage UI reveal; stored-value reset reflects resolved rules, not animation completion arithmetic. Show exact value in action-local UI (RC4-014). Zero stored value must not imply a damaging spectacle or invent a fallback. Acceptance: FEAR from contained hold/rupture, uninterrupted music, persistent wound amount readable, value exact before/after, no forced audio silence, skip/death/scene exit clean. Creator approves proposed holds/state count; mechanic stays locked.

## GB-01 — Gbenga / AGBADA SWEEP and VOICE NOTE

ART ACCESS MODE: **A exact repo ref and inventory**, **B prepared ZIP fallback**. Source: OPEN authored patch attribution in `js/frag/F07/gbenga_combat.js:5–24`, actual resolve/interrupt logic55–75, frozen runtime v2 states. AGBADA SWEEP deals authored24 to Rich/companion, telegraphed sleeves. VOICE NOTE skips Rich’s next turn and is interruptible only by Revenge or Dead Ringer. MY SON heals30/removes buffs; cooler Draco below30%; Mama interruption at50% are existing boss identity, not new suggestions.

Identity paths `assets/before_the_fame/characters/gbenga/runtime_80x96/gbenga_{neutral_anchor,adjusting_sleeves,voice_note,my_son,golden_draco,defeated}_80x96_v2.png`, all FROZEN. Proposed **sprite-state swaps plus layered FX**, not repainting frozen character. Sleeve: anticipation existing adjusting-sleeves state; action short cloth-motion/force arc candidate if approved; impact runtime Rich/companion contacts; recovery neutral. Phone: anticipation frozen phone-flat-mouth pose; action held note with small pixel voice pulse; impact/status skip/interruption feedback; recovery neutral or interrupted reaction. Do not invent costume, phone orientation, weapon or new attack.

Proposed sleeve **4–6 states ~500–700ms**, phone **3–4 states ~600–900ms** (the four-minute joke is not an actual four-minute wait). Sprite cells80×96; candidate overlay96×96 contact-centered; proposed actor anchor40,88 only after register grounding verification. Gbenga faces Rich at left from right-side boss slot; reaction/target points come from renderer. Cloth/pulse full-motion bounds remain within actor+small FX box; no massive full-screen wash that hides phone telegraph. Draw rear arc if used, frozen sprite, foreground contact/pulse, UI. No unsupported skeleton or per-limb deformation.

Trigger `enemy:sweep`/`enemy:voice` after actual chosen boss action, telegraph pose before turn decision; on interruption do not play successful skip feedback. Each companion hit indicator follows resolved event count once. Acceptance: sleeves/phone readable before choosing a counter, visible interruption, correct shared target contact, Mama/MySon/Draco states distinct with existing frozen assets, neutral recovery, no modified rules/odds. **Missing placement evidence:** real late Gbenga battle screenshot needed before artist final anchoring; prologue/hunter screenshots are not substitute boss placement. Brief is source/access ready, not ready to integrate without this capture and creator approval.

## Deferred set

Octopus Brain already has four authored frames and a hold/choice function; protect weirdness and action readability before another animation request. BLAD33EE has an authored hunter slash/telegraph and approved historical identity, but no elaborate sequence authorized by that label. Roxy needs spar semantic repair before new attack art. Bunmi/other bosses should not get interchangeable new slash packs; nominate at most one next signature after the approved core set. No artist launched and no art generated during this audit.
