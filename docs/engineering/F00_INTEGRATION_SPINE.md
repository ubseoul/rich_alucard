# F00 — UBE_PORTAL_FRAGMENT_INTEGRATION_SPINE (engineering record)

Branch `integration/ube-portal` · IF-1 v1.0 **FROZEN** (F00 accepted; tag `if1-v1.0`) · main untouched.
API reference: [IF1_INTEGRATION_SPINE.md](IF1_INTEGRATION_SPINE.md) · ownership: [INTEGRATION_OWNER.md](INTEGRATION_OWNER.md).

## 1. Lineage reconciliation

The packet expected two lineages (F1 and NEW OGA) with no common trunk. The repository shows otherwise, so **no merge was needed**:

| Ref | SHA | Relation |
|---|---|---|
| lineage base (OL proposal) | `974ea1c` BREAK I chassis hardening | ancestor of everything below; verified correct |
| accepted F1 (`deepseek/ul-l2-001`) | `249c5f7` | 974ea1c + 3 commits |
| accepted NEW OGA M1–M6 | `5c719f9` | **descendant of `249c5f7`** (F1 is inside the NEW OGA line) |
| accepted NEW OGA M7 (`codex/ul-f2-004-new-oga-m7`) | `54930b2` | descendant of `5c719f9` |

`integration/ube-portal` therefore starts at `54930b2` (fast-forward; F1 + M1–M7 all present, history preserved) and F00 sits on top.
Legacy lines are tagged for audit: `legacy/lineage-base-974ea1c`, `legacy/f1-accepted-249c5f7`,
`legacy/new-oga-m1-m6-accepted-5c719f9`, `legacy/new-oga-m7-accepted-54930b2`. `origin/main` (`b8ab4fe`, Art Ship 007) is an
ancestor of the line; local `main` (`c60b5e3`) is stale relative to it — neither was touched. No `ARCHITECTURE_COLLISION`.

One stale-assertion reconciliation was required between two accepted lines (not a behavior contradiction): the F1 in-page DEV
check "library registration totals: 244 planned…" counted the whole audio manifest, but accepted F2 later added six inert
`NO_01..NO_06` hooks (250 rows). The check now counts the F1 library only (excluding NO_01–06 and fragment audio parts).

## 2. F1 EXIT AUDIT

| F1 exit-gate item | Finding |
|---|---|
| **H1 pass on existing Rich lines** | **NOT COMPLETED — and not completable in OPEN.** F1 (UL-L2-001/002) delivered the audio engine, SFX library and phone hierarchy; no packet touched existing Rich lines. H1 is sealed/agent-only authority; F2 applied it only to *new* NEW OGA Rich lines (UL_F2_001–004). The accepted W1–W5 content still carries **243 Rich `[VP]` lines** (`node tools/vp-lines.mjs`; `docs/btf/VP_LINES.md` is stale at 239 — 4 lines added by NEW OGA are missing from the list). **Source-sensitive gap: not fixed here.** **PRIVATE PRE-FCPB H1 REVIEW REQUIRED** for these existing 243 Rich `[VP]` lines (owner: the private/sealed H1 authority; non-blocking to the IF-1 freeze; the review itself is not performed in OPEN). |
| **Phone readability / hierarchy** | **Implemented and re-verified on the integrated trunk.** Grouped sections (`NOW/PEOPLE/MONEY/LIFE/SYSTEM`), ≤3-word lock reasons, one in-world line on tap, GO SOMEWHERE grouping — UL-L2-001 browser evidence **57/57** at 360/390/430 on the integrated build (it was 51/57 before the reconciliation in §1: every failure was the one stale library-count assertion). Placement is provisional by design: final placement review is after F4 (OL-001). |
| Ordinary technical cleanup logged (not source-sensitive) | (a) `docs/btf/VP_LINES.md` was stale (239 vs 243) — **synced to 243 in the closure commit** (regenerated with `node tools/vp-lines.mjs`). (b) UL-F2 CDB non-blocking notes carried forward for the **F03 NEW_OGA_LADDER_CLOSE** owner: debt paydown behavior, boba insufficient-funds, pointer-cancel on canopy drag, TOUGE record pollution, days 8–12 start window, `newOga` type/clamp hardening, placeholder/F10 runtime enforcement, cousin-loss retry structure. (c) Fixed in F00 test layer only: `tools/playtest-qa.mjs` compared the save version to the literal `12`. (d) Pre-existing: `tools/party-browser-test.mjs` fails at baseline; `tools/rave-browser-test.mjs` needs `sharp`. |

## 3. CUT-FALLBACK AUDIT (SR-6 / OL-011 freeze)

OL-011 itself is not in the repository; findings are from the accepted code and engineering records.

| Item | Result | Downstream restoration |
|---|---|---|
| **M3 chairs** (`NEW_OGA_M3`) | **No cut fallback used.** Interactive SLURP canopy-chair harness (authored total 60, bundles of 10, 45 s); the accepted fail-forward is an authored "auntie critique, rank not blocked". | none |
| **M4 THE ALTERNATIVE** (`NEW_OGA_ALTERNATIVE`) | **Cut fallback IS used**: UL_F2_002 records "authorized scene fallback rather than replaying the chair activity"; the node is `The rental delivery is completed as a scene.` | **MANDATORY PRE-FCPB — owner F03 NEW_OGA_LADDER_CLOSE.** The scene fallback must be replaced by the full chair activity before the First Complete Playable Build (doctrine: FULL IMPLEMENTATION → FCPB → CUT / KEEP / EXPAND / REWORK). Not restored in F00. |
| **M5 MAKE IT RAIN** (`owambe_collection`) | **No fallback used.** Interactive reverse-make-it-rain minigame with equivalent pointer/touch input; UL_F2_003: "the scene fallback was not used". No fallback node exists in `new_oga_m5_m6.js`. | none |
| M6 beats | Egusi/Mazda beats are authored conditionals (skipped when the pet is absent); Agege bread is scene-only per the authored text ("No inventory changes hands"). Not cuts. | none |

## 4. Discretion log

* **Zero-change strategy.** Save shape, schema (still v16), wake roster, economy and NEW OGA are byte-identical with all flags OFF (differential replay). `save.frag` is lazy so a flag-OFF save has no new keys.
* **No schema bump.** IF-1 changes no save shape; the ledger is empty. State ownership is split: accepted v≤16 steps stay in `state.js`, higher versions come only from the owner ledger.
* **`RAStateWatch`** wraps `RAState.patch/save/reset/load` once (behavior-preserving) so money/HEAT/trust observe accepted writes without editing accepted systems.
* **Flag namespace assumption:** `F02.armory` (Armory phone app) is assigned to F02 IRON_AND_GRACE; War Room `F04`, Trap/Counting `F05`, RAINMAKER `F06`. Reassignable additively by the owner.
* **Mission voice-note band 75–89** with ladder 85→78 recorded; 77–75 reserved; ties refused.
* **HEAT tier floors: SOURCE_REQUIRED · NON-CANON · CONFIGURABLE · NON-BLOCKING.** Vol 7 numeric floors are not in the repo. The placeholder values (`COOL 0 · WARM 6 · HOT 12 · ON FIRE 24`) are engineering scaffolding, **not authoritative Vol 7 canon**. Isolated behind `RAHeat.configure`; deltas are never scaled.
* **Crew statuses** ACTIVE/DOWNED/CAPTURED/GONE and **district states** UNCONTROLLED/CONTROLLED are minimal, extensible (`registerStatus/registerState`); no crew member, class, district or outcome was invented.
* **Loader** is manifest → generated static `<script>` tags (no runtime loader) so static deployment is unchanged.
* **Private overlay** is a copy-on-build layer confined to `js/sealed/` and `assets/sealed/`; the OPEN `dist/` is never modified.
* **Tests touched (accepted infra):** `tools/btf-test.mjs` (`loadBtf` gains `if1` toggle + IF-1 modules), `tools/release.mjs` (loader/fragment/leak gates), `tools/playtest-qa.mjs` (stale version literal), `js/systems/smoke.js` (library-count reconciliation).

## 5. Blockers / escalations

None blocking. Non-blocking: **SOURCE_REQUIRED / NON-CANON / CONFIGURABLE** — Vol 7 HEAT numeric tier floors; **PRIVATE PRE-FCPB H1 REVIEW REQUIRED** — existing 243 Rich `[VP]` lines (see §2). **MANDATORY PRE-FCPB (F03)** — THE ALTERNATIVE chair activity (see §3).

## 6. Verification evidence (tip of integration/ube-portal; tag if1-v1.0-rc1 is the code-identical predecessor)

| Gate | Result |
|---|---|
| `npm run verify:all -- --require-browser` | PASS — loader · build (all regression + 9 IF-1 suites + zero-change replay + leak) · artifact verification · artifact leak check · EMPTY-pack private overlay == OPEN · real-browser smoke (22 checks) |
| Existing `npm test` suites | PASS unchanged (party, rave, Ogun, property, 10 minigames, BTF 121 adventures / 348 walks, NEW OGA M1–M7, presentation, art integration, reachability, mid-life fixtures) |
| Historical migrations | PASS — real v7…v16 saves generated from git history load, additive + idempotent; legacy fixtures + 4 mid-life v12 fixtures too |
| Zero behavior change | PASS — 4 lives × 6 nights (72 route plays) byte-identical saves/traces with IF-1 present and every flag OFF; NEW OGA M1–M3 identical |
| Real browser: New Game → Day 4 | PASS — `playtest-qa --only newgame,life --days 3` at 360/390/430, 0 findings |
| Real browser: NEW OGA M1–M7 | PASS — UL-F2-001…004 harnesses 12/12 + 8/8 + 10/10 + 4/4 |
| Real browser: F1 phone + audio/settings | PASS — UL-L2-001 57/57 (3 widths); IF-1 smoke: settings persist across reload, reserved apps absent |
| Owner surfaces / leak range | PASS — `check-owner-surfaces --as-owner`, `leak-check --range 54930b2..HEAD` |
| Private HQ | `RA_HQ_PRIVATE=1` IF-1 suites PASS on `hq/integration`; the OPEN leak check correctly FAILS there (overlay directory) |

## 7. Freeze status

IF-1 **v1.0 FROZEN**: `RAIF1.freeze.status==='frozen'` (flipped at F00 acceptance after the independent audit: PASS, no P0/P1), surface snapshot
`tools/tests/if1/contract-v1.0.json`, tag `if1-v1.0`. IF-1 changes are additive and owner-only. (`if1-v1.0-rc1` marks the pre-freeze code.)
