# RC4 first comb audit — finding ledger

Audit base: `4981d5245d0600c062a7f431acd8253dc28b9cc6` (`origin/integration/rc3`). Audit branch: `rc4/comb-audit`. This is an OPEN-only review and proposed refinement plan, not implementation or RC4 acceptance. Stable finding IDs resolve to [COMB_LEDGER.md](COMB_LEDGER.md).

## How to use this ledger

Order is broken play → coherence/presentation → depth → polish. P1 means a required advertised branch or release verification fails; P2 means substantial player coherence or presentation damage; P3 means depth/polish. MONITOR is not an asserted defect. Effort is a planning estimate, not a commitment; S usually 1–2 engineering days, M 2–5, art/approval additional. No P0 total campaign lock was proven: M4/M8 have alternate routes.

Evidence is explicitly **ordinary browser**, **fixture browser** or **source inspection**. Source-reproduced consequences are not claimed as completed player paths. The audit preserves existing refs and runtime files. Each proposal is subject to lead/Overlord review.

| ID | Severity | Finding | Confidence | Owner |
|---|---|---|---|---|
| RC4-001 | P1 | [Carlos’s supplied van still requires a personal car](#rc4-001) | High for throw; medium for exact on-screen stranded state | Engineering / PLAY integration |
| RC4-002 | P1 | [M8 PLAY refuses a carless player](#rc4-002) | High | Engineering / PLAY integration |
| RC4-003 | P1 | [No reachable ending after the finale](#rc4-003) | High for disabled entry; missing integration provenance unresolved | Refinement lead / story engineering / Overlord |
| RC4-004 | P1 | [Clean-checkout validation is blocked](#rc4-004) | High | Engineering / source-vault steward |
| RC4-005 | P2 | [Party Hall is purchasable but unusable](#rc4-005) | High for dead consumer; proposed reuse needs integration assessment | Design / property engineering |
| RC4-006 | P2 | [Car ownership was cut, but ownership fiction survived](#rc4-006) | High for fresh acquisition; legacy checkpoints not exhaustively exercised | Design / vehicles engineering |
| RC4-007 | P2 | [Refusing tribute still leads to promotion grants](#rc4-007) | High | Story-state engineering |
| RC4-008 | P2 | [Cash floor measures net balance, not earned income](#rc4-008) | High for arithmetic; user Day31 $353K save not reproduced | Economy engineering / design |
| RC4-009 | P2 | [Maps removes story prerequisites as well as cut dependencies](#rc4-009) | High for bypass; individual chain behavior source-only | Content integration / design |
| RC4-010 | P2 | [Club first-visit price contradicts protected promise](#rc4-010) | High | Economy / club engineering |
| RC4-011 | P2 | [Club still shows conflicting legacy counters](#rc4-011) | High | Club UI engineering / design |
| RC4-012 | P2 | [Range Day clashes with the game’s pixel presentation](#rc4-012) | High visual; responsiveness not fully played | UI engineer / artist / design |
| RC4-013 | P2 | [Canopy chairs looks unfinished and teaches ramen](#rc4-013) | High | Minigame engineer / artist |
| RC4-014 | P2 | [Combat trim hides information needed to choose](#rc4-014) | High for selector; legacy/new move variants need final smoke | Combat UI engineering |
| RC4-015 | P2 | [Roxy’s light spar uses lethal combat grammar](#rc4-015) | High source; runtime menu not date-tested | Combat / F15 design |
| RC4-016 | P2 | [Roxy’s ice-pack choice turns into a towel](#rc4-016) | High | F15 content integration / writer |
| RC4-017 | P2 | [Daily fight credit ignores voluntary War Room PLAY](#rc4-017) | Medium-high; no completed optional PLAY run in this audit | PLAY / daily-loop engineering |
| RC4-018 | P2 | [Repeated generic street fight substitutes for depth](#rc4-018) | High source | Combat design / writer |
| RC4-019 | P2 | [Boss intent is richer than its generic effects](#rc4-019) | High source; Gbenga animation live QA outstanding | Combat engineer / artist |
| RC4-020 | P2 | [Animation and hit timing have multiple owners](#rc4-020) | Medium-high; synchronization concern source-led | Combat presentation engineer |
| RC4-021 | P2 | [Four-game target and shipped routes disagree](#rc4-021) | High | Refinement lead / design |
| RC4-022 | P2 | [Art/source authority needs reconciliation before artist launch](#rc4-022) | High | Art steward / Overlord |
| RC4-032 | P2 | [Actual rave rhythm screen still looks blocky](#rc4-032) | High visual | Minigame artist / engineer |
| RC4-033 | P2 | [No-mod direction is not implemented](#rc4-033) | High | Armory engineering / design |
| RC4-023 | P3 | [Silent notification policy does not clear unread backlog](#rc4-023) | High policy; medium reported symptom | Phone / save migration engineering |
| RC4-024 | P3 | [Music does not consistently belong to the moment](#rc4-024) | Medium | Audio integration / Ube |
| RC4-025 | P3 | [Doorman is narration, not a missing active sprite](#rc4-025) | High source | Club design / artist |
| RC4-026 | P3 | [Club progression has several poorly distinguished currencies](#rc4-026) | High source; full progression not played | Club design / UI |
| RC4-027 | P3 | [A zero-action club exit still completes the daily visit](#rc4-027) | High | Club / daily-loop design |
| RC4-028 | P3 | [Ramen is mechanically readable but visually sparse](#rc4-028) | High visual; later orders source-only | Minigame UI / artist |
| RC4-029 | P3 | [Senator and Owambe do not visualize their main social stakes](#rc4-029) | High visual; medium complete loop | Minigame engineering / art |
| RC4-030 | P3 | [Some optional rewards point at cut consumers](#rc4-030) | Medium-high; reward copy variants require browser finish | Content / unlock engineering |
| RC4-031 | MONITOR | [Conversation combat-UI patch is integrated; symptom not reproduced](#rc4-031) | Medium confidence patch coverage; no active repro | UI engineering / QA |

## RC4-001

**P1 — Carlos’s supplied van still requires a personal car**

**Evidence:** RC3 changes the run narration to an uncle’s van but leaves the old personal-car parameter. Browser evaluation of the actual production node with ownedCars=[] throws TypeError reading id. See evidence/final-check/results.json.

**Player impact:** Choosing to help Carlos escape can strand an ordinary player at minigame dispatch.

**Reproduction:** Fresh-carless state; reach M4; choose TELL CARLOS TO RUN. The audit reproduced the parameter boundary with a fixture, not the entire Day 5 scene. Adventure dispatch evaluates params after hiding dialogue.

**Exact files:** js/systems/rc3.js:89; js/data/btf/adventures/new_oga_m4.js:34; js/systems/cars.js:13; js/scenes/adventure.js

**Smallest repair:** Pass explicit borrowed transport to this encounter; keep the authored escape bands and Carlos consequences. Provide a recoverable error return if launch fails.

**Effort:** S (1–2 days)

**Confidence:** High for throw; medium for exact on-screen stranded state

**Owner:** Engineering / PLAY integration

**Ruling needed:** Approve borrowed transport; no shop restoration needed


## RC4-002

**P1 — M8 PLAY refuses a carless player**

**Evidence:** Production RAF07Play.run(m8) returns NO_CAR with garage owned=[]. War Room’s F04 request supplies a four-seat HOOPTIE instead. See evidence/access/results.json and m8-no-car.png.

**Player impact:** The advertised hands-on alternative fails after car shopping was removed; SEND THE BOYS remains a story bypass.

**Reproduction:** Fixture M8 eligibility, no cars; launch actual M8 bridge. Ordinary acquisition was traced separately.

**Exact files:** js/frag/F07/play_bridge.js; js/frag/F04/play_adapter.js; js/frag/F01/play/adapter.mjs; js/frag/F07/m8_and_finale.js

**Smallest repair:** Share the existing encounter-transport fallback with M8, including enough seats and a retry/crew-edit route. Do not turn a loan into owned property.

**Effort:** S (1–2 days)

**Confidence:** High

**Owner:** Engineering / PLAY integration

**Ruling needed:** Approve shared loaner policy


## RC4-003

**P1 — No reachable ending after the finale**

**Evidence:** RC3 overwrites RAFame.claimsWake with ()=>false. Fixture finaleDone at Day 37 produces another PROTECT THE CREW day; even fameEligible=true returns false. No OL-079-labelled fix found in fetched public history or OPEN source.

**Player impact:** Campaign continues indefinitely; no final recognition, pacing horizon or clean postgame boundary.

**Reproduction:** Complete finale in source state; wake subsequent day; next action is generic fight. Ending eligibility probe is an explicit fixture, not a Day 37 playthrough.

**Exact files:** js/systems/rc3.js:110; js/systems/fame.js; js/scenes/bedroom_life.js; js/frag/F07/m8_and_finale.js

**Smallest repair:** Connect the approved OPEN ending to completed spine, with one persistent completion receipt and an explicit optional postgame. Locate OL-079 before creating a competing fix.

**Effort:** M (2–4 days after authority)

**Confidence:** High for disabled entry; missing integration provenance unresolved

**Owner:** Refinement lead / story engineering / Overlord

**Ruling needed:** Supply OL-079 SHA/path and approved ending trigger; settle ~21-day endpoint


## RC4-004

**P1 — Clean-checkout validation is blocked**

**Evidence:** npm test exits before tests: tools/rc3/policy-test.mjs imports absent tools/tests/F02/_lib.mjs (case differs from repository). npm run sources:check reports five stale SHA entries. Build requires the test gate.

**Player impact:** Cannot demonstrate a reproducible release build or rely on historical passing logs for this SHA.

**Reproduction:** Run npm test and npm run sources:check on this Linux checkout. No tests were bypassed to claim build success.

**Exact files:** tools/rc3/policy-test.mjs; package.json; source_vault/manifest.json; tools/tests/f02/_lib.mjs

**Smallest repair:** Correct import casing in a future build; reconcile changed OPEN source hashes with their owners rather than blindly blessing them.

**Effort:** S (0.5–1 day plus authority review)

**Confidence:** High

**Owner:** Engineering / source-vault steward

**Ruling needed:** No creative ruling; steward confirms changed sources


## RC4-005

**P2 — Party Hall is purchasable but unusable**

**Evidence:** Bank offers $250K hall with $5K reserve, then only BUILT. Castle.open redirects to Bank; room markup blank; HOST and A26 are rejected by shared RC3 allowlist.

**Player impact:** The largest stated goal consumes cash without a playable payoff.

**Reproduction:** Save/fixture with >=$255K; buy from Bank; inspect BUILT and try ordinary room entry. Purchase/consumer conclusion source-traced, not browser-purchased.

**Exact files:** js/systems/rc3.js:112–126; js/systems/castle.js; js/systems/castle.js (HOST registration); js/data/btf/adventures/w3.js

**Smallest repair:** Give the owned hall one bounded hosted night using existing approved room/party components, a receipt and one recurring consequence; expose it from Bank. No room-tree restoration.

**Effort:** M (3–5 days)

**Confidence:** High for dead consumer; proposed reuse needs integration assessment

**Owner:** Design / property engineering

**Ruling needed:** Choose one finite hall payoff or revise goal before economy tuning


## RC4-006

**P2 — Car ownership was cut, but ownership fiction survived**

**Evidence:** Nine-app router blocks JDM/Imports/Richboi/Touge; kept adventures offer no complete acquisition. Catalog still prices S15 $38K, S2000 $42K, R34 $185K, Urus $260K, Aventador $520K, Ferrari $2.4M; legacy Supra route $78K. None supplies a fresh normal-player purchase entry.

**Player impact:** Tribute asks for a favorite car the player cannot acquire. Legacy ownership and fresh play have different rules.

**Reproduction:** Fresh path phone/Maps; inspect acquisition registrations and shared allowlist; compare old save with owned or tributed car.

**Exact files:** js/systems/rc3.js; js/systems/cars.js; js/systems/jdm_imports.js; js/if1/vehicles.js; js/frag/F03/new_oga_ladder_close.js

**Smallest repair:** Keep loans for required missions. If personal ownership remains meaningful, add one listing, purchase receipt, ownership consumer and recovery entry inside an existing app; otherwise adapt tribute fiction to the carless branch.

**Effort:** M (2–4 days if ownership retained)

**Confidence:** High for fresh acquisition; legacy checkpoints not exhaustively exercised

**Owner:** Design / vehicles engineering

**Ruling needed:** Retain one personal-car loop or explicitly remove ownership promises


## RC4-007

**P2 — Refusing tribute still leads to promotion grants**

**Evidence:** Actual M9 NAH choice sets rank4 and resolves mission; m9GrantsWithheld remains undefined and pendingMission is NEW_OGA_M10. The reader checks this flag but completeM9(nah) never writes it.

**Player impact:** A meaningful refusal appears to lose its stated consequence at the next promotion.

**Reproduction:** Carless M9 fixture; select NAH; inspect persisted state and next mission. Full M10 grant consequence source-traced.

**Exact files:** js/frag/F03/new_oga_ladder_close.js:79–96,140–172; js/systems/rc3.js:27; js/frag/F03/new_oga_ladder_close.js

**Smallest repair:** Persist the authored refusal consequence once and make M10/recap consumers agree; migrate only applicable existing saves.

**Effort:** S (1–2 days)

**Confidence:** High

**Owner:** Story-state engineering

**Ruling needed:** Confirm refusal’s intended grant/rank outcome before repair


## RC4-008

**P2 — Cash floor measures net balance, not earned income**

**Evidence:** claimCash computes current cash minus moneyBefore, then tops up to $15K. Purchases during the interval reduce the counted earnings. Daily cash can therefore be topped up after already earning enough.

**Player impact:** Reward receipts misrepresent work; spending changes the grant without a fictional reason.

**Reproduction:** Source-level example: snapshot40K, earn20K, spend20K, claim grants15K; no spending would grant0. Day receipt prevents repeated collection, not this accounting flaw.

**Exact files:** js/systems/rc3.js:55–59; js/if1/money_ledger.js; js/systems/life_clock.js:32; js/data/rc2_economy.js

**Smallest repair:** Count eligible gross source receipts per day; distinguish authored reward and reserve supplement. First fix endpoint and useful sinks, then tune economy.

**Effort:** M (2–3 days)

**Confidence:** High for arithmetic; user Day31 $353K save not reproduced

**Owner:** Economy engineering / design

**Ruling needed:** Approve eligible earnings definition; no arbitrary balance wipe


## RC4-009

**P2 — Maps removes story prerequisites as well as cut dependencies**

**Evidence:** All 20 retained definitions get available=()=>true. Day1 Maps exposes JOLLOF WARS: THE FINAL and LIL SMACK #5. Kept chains may then be rejected because follow-up starts are not from rc3-maps.

**Player impact:** Optional choice can begin at a payoff without its setup; chronological titles and consequences become confusing.

**Reproduction:** Open Day1 Maps (ordinary evidence/10-maps.png); compare A54/A56 original prerequisites and chain dispatch to canStart.

**Exact files:** js/systems/rc3.js:6,14,81; js/data/btf/adventures (A54,A56,A57,A39 registrations); js/engine/adventures.js

**Smallest repair:** Replace deleted-system gates individually while preserving story-stage gates; present unlocked follow-ups as deliberate Maps choices.

**Effort:** M (2–4 days)

**Confidence:** High for bypass; individual chain behavior source-only

**Owner:** Content integration / design

**Ruling needed:** Select approximately ten scenes after dependency review; do not silently enforce cuts


## RC4-010

**P2 — Club first-visit price contradicts protected promise**

**Evidence:** First terms line says half off; RAEcon discount=.25. Ordinary $5000 throw costs $3750; fixture price1000=750. Cap is half the opening balance, which is a separate rule.

**Player impact:** The club immediately breaks a plainly stated price promise.

**Reproduction:** Fresh first visit; note line; compare cash before/after first paid throw. See ordinary/11-first-paid-throw.png and targeted/results.json.

**Exact files:** js/data/rc2_economy.js:18; js/data/rc2_lines.js:7; js/data/rc2_writing.js:519; js/systems/strip_club.js:16–23

**Smallest repair:** Make charge agree with the authoritative promise after economy ruling; preserve supplied line verbatim and keep discount distinct from cap.

**Effort:** S (<1 day)

**Confidence:** High

**Owner:** Economy / club engineering

**Ruling needed:** Confirm literal half-off applies to this paid action; prefer honoring supplied copy


## RC4-011

**P2 — Club still shows conflicting legacy counters**

**Evidence:** At 390 the club has host cash, canvas CASH round budget, CROWD, SPENT/WASTED, timer, plus hype/combo/encore/VIP and roster/support. Build A explicitly handed removal of legacy meters to B; current runtime retains them.

**Player impact:** A strong pixel stage feels like two HUDs layered together. The canvas cash number looks like a contradictory bank balance.

**Reproduction:** Ordinary first club, three real throws; see ordinary/04-club-night.png and 11-first-paid-throw.png.

**Exact files:** js/frag/F06/make_it_rain_core.js; js/frag/F15/club.js; js/systems/strip_club.js; js/systems/rc3.js; docs/rc3/BUILD_A.md

**Smallest repair:** Use one cash source and hype focus; retain timer/input feedback and put support/VIP progression into one compact result/roster view.

**Effort:** M (2–3 days)

**Confidence:** High

**Owner:** Club UI engineering / design

**Ruling needed:** Approve reduced HUD hierarchy; frozen stage pixels untouched


## RC4-012

**P2 — Range Day clashes with the game’s pixel presentation**

**Evidence:** 390 screenshot shows rounded gradient panels, circular colored lane targets, small monospace HUD and large empty lower space instead of a grounded pixel shooting range.

**Player impact:** Retained core activity looks like a web prototype beside the club and story environments.

**Reproduction:** Armory owns a gun then RANGE DAY; audit direct launch was an unowned-gun fixture for presentation only. See targeted/range.png.

**Exact files:** js/frag/F02/range.js; js/frag/F02/armory.css; js/frag/F02/armory.js; js/frag/F02/catalog.js

**Smallest repair:** Replace presentation around the existing three-lane rules: pixel targets/hostage silhouettes, readable aim/reload/status, compact composition. Keep scoring/odds separate.

**Effort:** M (3–5 days including approved assets)

**Confidence:** High visual; responsiveness not fully played

**Owner:** UI engineer / artist / design

**Ruling needed:** Approve presentation brief and target/hostage art identity


## RC4-013

**P2 — Canopy chairs looks unfinished and teaches ramen**

**Evidence:** Canopy uses flat background, a labelled grey CHAIR STACK rectangle and white DROP HERE rectangle. Once-only coach uses slurp ramen instruction despite canopyDuty mode. Actual drag produces feedback.

**Player impact:** Mandatory story labor lacks place/character grounding and initially teaches the wrong input task.

**Reproduction:** M3 canopyDuty or explicit fixture; dismiss coach, drag stack to zone. See access/chairs-wrong-rule.png, chairs-clean.png, chairs-after-drag.png.

**Exact files:** js/minigames/slurp.js; js/engine/minigames.js; js/data/btf/adventures/new_oga_m1_m3.js; assets/build4/p_d/gbenga_rentals_workday_270x480.png

**Smallest repair:** Mode-specific instruction; replace rectangles with approved chair/stack/environment treatment while keeping drag loop and authored outcomes.

**Effort:** M (2–4 days)

**Confidence:** High

**Owner:** Minigame engineer / artist

**Ruling needed:** Confirm chair task stays as story vignette despite four-game target


## RC4-014

**P2 — Combat trim hides information needed to choose**

**Evidence:** RC3 CSS hides move small text, old move spans and revengeValue. These include PP/action cost and exact stored Revenge damage, explicitly part of FEAR canon.

**Player impact:** Minimal meters also removes the information that makes moves tactical and Revenge readable.

**Reproduction:** Inspect combat at390 and style.css final RC3 rules; compare move markup and exact-value canon. Ordinary combat played, zero/nonzero visual comparison source-traced.

**Exact files:** style.css:959; js/scenes/combat2.js; index.html:53; docs/CURRENT_CANON.md:44; js/engine/combat2.js

**Smallest repair:** Restore concise action-local cost/available ammo/stored Revenge value; keep general lifestyle meters hidden.

**Effort:** S (1–2 days)

**Confidence:** High for selector; legacy/new move variants need final smoke

**Owner:** Combat UI engineering

**Ruling needed:** Approve action-local info as exception to meter reduction


## RC4-015

**P2 — Roxy’s light spar uses lethal combat grammar**

**Evidence:** Date says no biting and first to five clean shots, but dispatches ordinary Combat2 with noPenalty and no local move restriction or five-hit scoring; all outcomes continue the same authored after scene.

**Player impact:** Player can contradict her boundary with vampire attacks/guns; authored score calls occur before the interactive bout.

**Reproduction:** Unlock Roxy L2 through support; inspect bout params and combat menu. Date source-traced, not browser-unlocked.

**Exact files:** js/frag/F15/roxy.js:44–82; js/frag/F15/dates.js:67; js/engine/combat2.js; js/scenes/combat2.js

**Smallest repair:** Use a bounded spar mode/loadout and clean-hit result presentation, or approve framing the interactive beat differently. No global damage retune.

**Effort:** M (2–4 days)

**Confidence:** High source; runtime menu not date-tested

**Owner:** Combat / F15 design

**Ruling needed:** Choose literal five-hit spar or alternate presentation preserving supplied lines


## RC4-016

**P2 — Roxy’s ice-pack choice turns into a towel**

**Evidence:** HAND HER THE ICE PACK and TOSS HER A TOWEL both enter after, which says takes the towel keeps it.

**Player impact:** A small intimate choice visibly ignores the player’s action.

**Reproduction:** Roxy L3 ring choice; select ice pack; next narration mentions towel. Source only.

**Exact files:** js/frag/F15/roxy.js:95–116

**Smallest repair:** Persist chosen prop and route a matching approved narration/visual beat; keep supplied Rich lines untouched.

**Effort:** S (<1 day after voice pass)

**Confidence:** High

**Owner:** F15 content integration / writer

**Ruling needed:** Approve matching narrator alternatives


## RC4-017

**P2 — Daily fight credit ignores voluntary War Room PLAY**

**Evidence:** RC3 action credit only patches RAAdventures afterFight/afterMinigame for mandatory missions/RC3_FIGHT. F04 War Room settles through its own adapter and does not enter this hook.

**Player impact:** Player chooses PLAY, then still owes a repeated crew fight on a dialogue-only day; the guidance promise is too narrow.

**Reproduction:** Dialogue-only day; complete voluntary War Room PLAY then inspect RARC3.read().action. Audit reached real picker with loaner; settlement credit conclusion is source-only.

**Exact files:** js/systems/rc3.js:99–105; js/frag/F04/play_adapter.js; js/frag/F04/phone_app.js

**Smallest repair:** Consume a trustworthy successful PLAY settlement once per day for action credit, while retaining required story combats and protected odds.

**Effort:** S (1–2 days)

**Confidence:** Medium-high; no completed optional PLAY run in this audit

**Owner:** PLAY / daily-loop engineering

**Ruling needed:** Confirm optional successful PLAY can satisfy daily action


## RC4-018

**P2 — Repeated generic street fight substitutes for depth**

**Evidence:** Dialogue-only and every post-finale day inject the same smallie_cousin crew blockage. Prologue/rave authored fights are distinctive; this fallback is not.

**Player impact:** Daily fighting becomes a tax disconnected from current story, rather than an awesome consequence.

**Reproduction:** Compare RC3_FIGHT definition across M1/dialogue days and completed-finale Day37 fixture.

**Exact files:** js/systems/rc3.js:93–98; js/data/btf/combat.js; js/systems/enemy_fx.js

**Smallest repair:** Fix ending/action credit first; contextualize only remaining required fights with existing enemy/story states and short varied consequences.

**Effort:** M (2–3 days)

**Confidence:** High source

**Owner:** Combat design / writer

**Ruling needed:** Choose a small contextual set; no new fight sprawl


## RC4-019

**P2 — Boss intent is richer than its generic effects**

**Evidence:** Gbenga has sleeve telegraph, interruptible voice note, heal, cooler gun and Mama interruption. enemy_fx has no explicit Gbenga/BLAD33EE/F15 mapping, so fallback effect grammar dominates.

**Player impact:** Bosses can look interchangeable while their rules and jokes are specific.

**Reproduction:** Trace Gbenga move actions into RAEnemyFX.specFor; compare named move telegraphs. Gbenga source-only; BLAD33EE ordinary browser fight.

**Exact files:** js/frag/F07/gbenga_combat.js; js/systems/enemy_fx.js; js/systems/combat_presentation.js; js/scenes/combat2.js

**Smallest repair:** Signature set Blood Bath/Bite/Revenge plus Gbenga sleeve/phone states; trigger existing frozen states and layered candidate FX at authored events.

**Effort:** M (3–5 days integration; art separate)

**Confidence:** High source; Gbenga animation live QA outstanding

**Owner:** Combat engineer / artist

**Ruling needed:** Approve candidate briefs, not new identity pixels


## RC4-020

**P2 — Animation and hit timing have multiple owners**

**Evidence:** Legacy game.js, CombatPresentation and RACombatPixelFX layer different sequences. Rules act before presentation, while approved FX layer timings and code canvas playback can have different skip/duration behavior.

**Player impact:** HP/impact/return can feel disconnected; repeated effects risk clutter and inconsistent attack identity.

**Reproduction:** Compare legacy prologue Blood Bath to Combat2 fight; trace action resolution, presentation timeout and pixel FX teardown. Ordinary both renderers exercised but frame-perfect capture not made.

**Exact files:** game.js; js/systems/combat_presentation.js; js/systems/combat_pixel_fx.js; js/scenes/combat2.js; js/engine/combat2.js

**Smallest repair:** One presentation event timeline per attack with named contact and recovery; game rules remain authoritative, UI reveal synchronized without recalculating hits.

**Effort:** M (3–5 days)

**Confidence:** Medium-high; synchronization concern source-led

**Owner:** Combat presentation engineer

**Ruling needed:** Approve timing proposals after native-size candidate preview


## RC4-021

**P2 — Four-game target and shipped routes disagree**

**Evidence:** RC3 retains mandatory chairs, owambe, Senator care and Carlos escape, plus Maps Jollof and PLAY. docs/rc3/MINIGAMES.md and BUILD-B.md are narrower than route graph.

**Player impact:** Scope and QA expectations differ; rough mandatory games can be missed by a retained-set review.

**Reproduction:** Inventory registry and every kept node minigame/fight entry; compare MINIGAME_PRESENTATION table.

**Exact files:** js/systems/rc3.js; js/minigames/index.js; js/data/btf/adventures/new_oga_*.js; docs/rc3/MINIGAMES.md; docs/rc3/BUILD-B.md

**Smallest repair:** Decide explicitly which existing story vignettes remain. Publish one route-based roster; refine retained mandatory beats without restoring cut side systems.

**Effort:** S decision / M implementation

**Confidence:** High

**Owner:** Refinement lead / design

**Ruling needed:** Four activities only, or four core games plus bounded story vignettes?


## RC4-022

**P2 — Art/source authority needs reconciliation before artist launch**

**Evidence:** sources:check finds five changed OPEN/HISTORICAL entries, including ASSET_REGISTER and START_HERE. Register approves Rich idle/bite and freezes Gbenga runtime states, but cast and several FX rows remain STATUS UNKNOWN despite runtime/canon documentation.

**Player impact:** Artists could treat runtime existence as approval and extend a candidate identity or FX treatment.

**Reproduction:** Run source check; compare reference inventory statuses and current hashes against register. No frozen originals changed.

**Exact files:** source_vault/manifest.json; art_department/ASSET_REGISTER.json; art_department/START_HERE.md; art_department/APPROVAL_LEDGER.md; assets/*_manifest.json

**Smallest repair:** Steward reconciles provenance and explicitly approves the FX/style reference subset; use approved Rich/Gbenga identity only. Bundle exact current bytes with status distinctions.

**Effort:** S (0.5–1 day plus ruling)

**Confidence:** High

**Owner:** Art steward / Overlord

**Ruling needed:** Approve reference subset and reconcile stale register evidence


## RC4-023

**P3 — Silent notification policy does not clear unread backlog**

**Evidence:** RC3 filters story pending to one and mail to silent; Texts still sums persistent unread thread badges. Roxy/other records can survive old saves; dateable texts no longer use the old DM grouping under RARC3.

**Player impact:** One story card can coexist with many red unread texts and obsolete requests. Reported18 unread is plausible but not reproduced fresh.

**Reproduction:** Fresh ordinary phone had limited badges; inspect old-save thread migration and Texts badge sum; no supplied18-unread save used.

**Exact files:** js/systems/rc3.js:145; js/scenes/phone.js; js/systems/life.js; js/frag/F15/core.js

**Smallest repair:** Archive obsolete actionable requests with an explanatory read state; keep relationship history and one current story notification. Add a simple read-all route if absent.

**Effort:** S (1–2 days)

**Confidence:** High policy; medium reported symptom

**Owner:** Phone / save migration engineering

**Ruling needed:** No creative ruling; do not erase conversations


## RC4-024

**P3 — Music does not consistently belong to the moment**

**Evidence:** Rich Radio has seven file-backed fresh tracks; two declared tracks file:null. Rave timing uses its own oscillator/chart; scene-specific music choices and pinned radio can diverge. Exactly three stand-in slots were not identified.

**Player impact:** A strong soundtrack feels like background rotation rather than story, club and attack punctuation.

**Reproduction:** Inspect radio TRACKS, music-library scene changes and rave audio start. Browser paths exercised sound-enabled code but no listening study/waveform sync proof.

**Exact files:** js/systems/radio.js:5–14; js/systems/music_library.js; js/minigames/dance.js; js/systems/ogun_rave.js

**Smallest repair:** Make an explicit moment-to-track cue map with pin/restore policy and chart/audio synchronization; replace only identified authorized stand-ins.

**Effort:** M (2–4 days after track decisions)

**Confidence:** Medium

**Owner:** Audio integration / Ube

**Ruling needed:** Name the three slot IDs and intended masters; preserve title-only recital constraints


## RC4-025

**P3 — Doorman is narration, not a missing active sprite**

**Evidence:** Legacy CLUB_FIRST contains narrated doorman and intentionally no placeholder actor; RC3 blocks CLUB_FIRST and opens club directly. First visit still mentions terms but no rope encounter.

**Player impact:** Requested personality is absent, but restoring an entire cut entrance just for a sprite would add taps.

**Reproduction:** Fresh club entry; inspect blocked CLUB_FIRST and its actor setup. No doorman PNG found as an active actor.

**Exact files:** js/data/btf/adventures/rc2_story.js:110; js/systems/strip_club.js; js/systems/rc3.js

**Smallest repair:** If an entrance moment is desired, add one skippable terms beat using an approved adult doorman reference; otherwise treat as optional polish.

**Effort:** S–M (1–2 days plus approved art)

**Confidence:** High source

**Owner:** Club design / artist

**Ruling needed:** Choose whether the entrance earns its tap


## RC4-026

**P3 — Club progression has several poorly distinguished currencies**

**Evidence:** Support thresholds10K/35K/80K/150K coexist with hit-driven hype, encore count and three VIP tiers. Spend can count as support even when misses produce no hype; off-night performer selection is disabled.

**Player impact:** Player may mistake performance score for relationship progress and not understand which dancer/date is available tonight.

**Reproduction:** Compare paid miss/hit accounting and support eligibility with F15 roster; real three throws, no full threshold progression.

**Exact files:** js/frag/F15/core.js; js/frag/F15/tunables.js:51; js/frag/F15/club.js; js/frag/F15/dates.js

**Smallest repair:** One receipt distinguishes paid support, hype and next date; rotate availability clearly; preserve thresholds until useful payoff pacing is evaluated.

**Effort:** M (2–3 days)

**Confidence:** High source; full progression not played

**Owner:** Club design / UI

**Ruling needed:** Approve concise progress vocabulary


## RC4-027

**P3 — A zero-action club exit still completes the daily visit**

**Evidence:** stripClubLastDay is set on opening; fixture enters and quits with zero throws, then visit condition passes. This prevents poverty deadlock but makes nightly instruction ceremonial.

**Player impact:** Player can satisfy the compulsory loop without an actual club moment.

**Reproduction:** Open club and immediately quit; inspect lastDay and canSleep after paid daily state.

**Exact files:** js/systems/strip_club.js; js/systems/rc3.js:60; js/frag/F15/club.js

**Smallest repair:** Make a free purposeful hello/watch/leave choice count as a visit; never require spending to unlock sleep.

**Effort:** S (1–2 days)

**Confidence:** High

**Owner:** Club / daily-loop design

**Ruling needed:** Choose free visit completion semantics


## RC4-028

**P3 — Ramen is mechanically readable but visually sparse**

**Evidence:** Large flat floor, tiny apron sprite/bowl, swatch ingredient buttons and sparse ticket. First tutorial intentionally says RICH SPECIAL: INVENT ANYTHING and masks requirements; actual ingredient action/receipt works.

**Player impact:** Sole job feels like a scaffold and its first exception can mis-teach later exact orders.

**Reproduction:** WarRoom ramen or A08; firstShift fixture; one ingredient and clock out. See targeted/ramen*.png.

**Exact files:** js/minigames/slurp.js; js/data/btf/adventures/w1_life.js; assets/before_the_fame/characters/rich/rich_ramen_apron_corrected_80x96.png

**Smallest repair:** Ground counter/ticket/bowl in existing kitchen art, distinguish first freeform lesson from later orders, improve mistake feedback without another tutorial wall.

**Effort:** M (2–3 days)

**Confidence:** High visual; later orders source-only

**Owner:** Minigame UI / artist

**Ruling needed:** No new job; approve counter treatment


## RC4-029

**P3 — Senator and Owambe do not visualize their main social stakes**

**Evidence:** Senator has good approved dog/background but care buttons and generic dragon happy/sulk sound; Owambe has rich tent background and falling money but attention-givers are not shown. Both are mandatory story games.

**Player impact:** The fiction’s personality is carried by instructions rather than readable action/feedback.

**Reproduction:** Direct senator-mode hatch and owambe fixtures; inspect feedback/audio. No complete high/low outcome play.

**Exact files:** js/minigames/hatch.js; js/minigames/owambe_collection.js; js/data/btf/adventures/new_oga_m5_m6.js; js/data/btf/adventures/new_oga_m5_m6.js

**Smallest repair:** Reuse dog poses and approved tent actors for concise reaction cues; care-specific audio; attention warning near source, not additional meters.

**Effort:** M (2–3 days each only if retained)

**Confidence:** High visual; medium complete loop

**Owner:** Minigame engineering / art

**Ruling needed:** Scope decision RC4-021 first


## RC4-030

**P3 — Some optional rewards point at cut consumers**

**Evidence:** Marisol hiring survives while maid-quarter/maid routes are cut; Range medals historically grant mod discounts and the active RC3 Armory still exposes the F02 workbench despite the requested no-mod direction. Mods are actually reachable, not merely old-save state (RC4-033); old room inventory can still exist.

**Player impact:** Marisol can promise a cut consumer; Range’s mod reward is currently usable but would become stranded if the requested cut is enforced.

**Reproduction:** Trace A39 hiring end into castle/maid routes; compare Range reward registry and actual active F02 Armory and its workbench.

**Exact files:** js/data/btf/adventures/w4.js; js/systems/castle.js; js/frag/F02/registry.js:104; js/scenes/phone.js; js/if1/features.js

**Smallest repair:** Retarget retained rewards to active consumers or expose one bounded owned interaction; if mods are cut in a future build, retarget the medal reward without deleting old inventory.

**Effort:** S–M (1–3 days)

**Confidence:** Medium-high; reward copy variants require browser finish

**Owner:** Content / unlock engineering

**Ruling needed:** Confirm active payoff for Marisol and Range medal


## RC4-031

**MONITOR — Conversation combat-UI patch is integrated; symptom not reproduced**

**Evidence:** scene_guard sets current/next scene attributes; rc2_feel.css hides base combat actors/UI during nonbattle transitions and disables battle commands while speaker bubble active. Ordinary dialogue screenshots show no leak.

**Player impact:** A historic transient leak would damage story presentation, but this audit cannot honestly label it still broken.

**Reproduction:** Prologue, rave/BLAD33EE, day2 dialogue and targeted mission transitions at390; no one-frame trace or every overlay combination.

**Exact files:** js/systems/scene_guard.js; js/systems/rc2_feel.css:61–64; index.html:346; js/scenes/combat2.js

**Smallest repair:** Keep patch; add a narrowly timed regression only if reproduced, particularly separate Combat2 teardown and restored overlays.

**Effort:** XS monitoring; S if reproduction

**Confidence:** Medium confidence patch coverage; no active repro

**Owner:** UI engineering / QA

**Ruling needed:** None


## RC4-032

**P2 — Actual rave rhythm screen still looks blocky**

**Evidence:** Correct rave-mode fixture shows OGUN'S BLOOD RAVE, blood rain, block-figure dancer, colored block crowd and sparse flat stage. Ordinary real rave chart was played. `evidence/access/rave-rhythm.png` is a modified44-note fixture; ordinary RAOgunRave uses36 notes, bpm126, moodStart70. This parameter difference does not change the block-figure identity finding.

**Player impact:** A good music/story/fight beat visually reads as a rough rhythm prototype beside approved character sprites and detailed club art.

**Reproduction:** Enter ordinary Ogun rave; compare native-size dance canvas to club. Presentation screenshot uses explicit rave:true fixture; targeted/dance.png uses wrong mode:rave and is generic, not ordinary entry evidence.

**Exact files:** js/minigames/dance.js; js/systems/ogun_rave.js:14; js/data/ogun_rave_content.js; js/data/art_registry.js.

**Smallest repair:** Retain chart/input and blood-rain cue; replace block-figure/crowd presentation with approved Rich/stage treatment or tightly scoped candidate dance poses after approval. Do not create another dance game.

**Effort:** M (2–4 days plus approved asset work).

**Confidence:** High visual; human timing/audio enjoyment not measured.

**Owner:** Minigame engineer / artist / audio integration.

**Ruling needed:** Approve retained rave presentation reference/pose scope; candidate pixels pending Ube approval.

## RC4-033

**P2 — No-mod direction is not implemented**

**Evidence:** F02.armory and F02.iron_and_grace ship ON in js/if1/flag_defaults.js. Actual Armory home offers DEACON'S WORKBENCH → MODS; clicking opens six purchasable mods and MAX 2 MODS PER GUN. Browser final-check/results.json and armory-mods.png confirm this through production UI after initialized wake. Five guns are sold; the no-mod direction is the mismatch.

**Player impact:** Scope/economy/strategic complexity survived the intended trim; medal discounts remain useful today and would be stranded by a later blind cut. Player-facing RANGE/PRICE TUNING: F13 also exposes internal scaffolding.

**Reproduction:** Ordinary phone Armory → MODS. Audit fixture initializes actual wake, opens same app and clicks the real bench button; no feature override used, $100K fixture balance is not fresh starting money.

**Exact files:** js/if1/flag_defaults.js; js/frag/F02/armory.js:34–64; js/frag/F02/catalog.js:135–207; js/frag/F02/registry.js:68–105; js/systems/rc3.js:122–125.

**Smallest repair:** Decide explicit no-mod scope, then gate active mod entry/action consistently while preserving old inventory and retargeting Range medal payoff; remove internal tuning-owner label from player UI. Do not mutate accepted weapon stats or PLAY odds.

**Effort:** S–M (1–3 days plus reward ruling).

**Confidence:** High, actual UI and shipped flags.

**Owner:** Armory engineering / design.

**Ruling needed:** Confirm requested no-mod cut and active replacement for medal discount; this audit does not enforce it.
