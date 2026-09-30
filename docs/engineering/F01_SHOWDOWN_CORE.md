# F01 — SHOWDOWN_CORE (principal implementation + feel track)

Fragment: `UBE_PORTAL_F01_SHOWDOWN_CORE` · Branch: `frag/showdown-core/001`
Base: `integration/ube-portal` @ `101a394b5fa9c41ec089bc7022ee86ff43f5f31c` (IF-1 v1.0 FROZEN) · Flag: `F01.showdown_core` (DARK)
Owner of tactical execution and of the player-facing tactical presentation. **Nothing was merged. `main`, `integration/ube-portal`, `hq/integration` were not touched.**

Disposition: **READY FOR UBE SHOWDOWN FEEL GATE** (technical + presentation complete; fun is *not* self-approved — see §13).

---------------------------------------------------------------------------------------------------------------------------------

## 1. What this is

A reusable, deterministic, production-quality tactical combat system: a 6 × 9 portrait grid, HALF / FULL directional cover, height,
destructible cover, POD reveal, the authored hit model, six Oga classes, five rival types, DOWNED / CARRY / CAPTURED, Rich's PULL UP,
structured VICTORY / RETREAT / FAILURE results, and a playable non-story sandbox. It powers TAKE THE BLOCK, EXTRACT, retaliation raids,
emergency RUN escalations, HAND BACK THE BLOCKS, Trap raids/defense (F05) and later finale hooks (F07) through **profiles** — it contains
no War Room state, no Trap logic and no story.

## 2. Source authority used

| Source | Use |
|---|---|
| `Rich_Alucard_BTF_Vol7_PLAYMAKERS_Blood_X_Operations.docx` (OPEN) | §5 SHOWDOWNS (field, turns, math, units, weapons, Rich), §6 OGAS (stories, bond, roster traits, GONE rule), §7 LOOK (visual language, UI cards), §8 NUMBERS (HEAT tiers), §11 SOUND, §12 feel gate |
| `RICH_ALUCARD_PROJECT_STATE_AI_MANAGEMENT_HANDOFF_2026-09-28` | governance (NEVER GUESS, SOURCE REQUIRED), art freeze, protected material rules |
| Repository @ `101a394` | IF-1 v1.0 contracts (`docs/engineering/IF1_INTEGRATION_SPINE.md`, `INTEGRATION_OWNER.md`, `js/if1/**`), visual style bible, accepted fonts/colours |
| OPEN fragment branches read **read-only** for the integration seams (never merged) | `frag/playmakers-war-room/001` @ `583ae5e` (F04 `showdown_stub.js`, `crew.js`, `jobs.js`), `frag/iron-and-grace/001` @ `3faadeb` (F02 `showdown.js`, `catalog.js`, `registry.js`) |

Not inspected: anything SEALED / HQ-only. Nothing about story outcomes is inferred. Every value that is **not** in the source is listed in
§10 (PROVISIONAL) or §11 (SOURCE_REQUIRED) and is also machine-readable at runtime: `RAShowdown.describe().provisional / .sourceRequired`,
and every result packet carries the ids (`result.provisional`, `result.sourceRequired`).

## 3. Tactical architecture

All files are new and live in fragment-owned locations. Pure logic has **no DOM and no IF-1 dependency** (it runs in a bare `vm`, which is how the tests use it).

| File | Role |
|---|---|
| `js/frag/F01/rng.js` | seedable, serialisable sfc32 RNG (`{seed,s[4],calls}` lives *inside* the tactical state) |
| `js/frag/F01/data.js` | frozen authored data (HIT, CLASSES, ENEMIES, WEAPONS, RICH, TRAITS, STORIES, BOND) + `TUNABLES` + `PROVISIONAL` + `SOURCE_REQUIRED` registries |
| `js/frag/F01/rules.js` | pure geometry + hit math: reach/path, LOS, directional cover, height, `preview()` (the honest odds + full breakdown), `canShoot`, targeting |
| `js/frag/F01/engine.js` | the state machine. `create(cfg)`, `apply(state,action) → {ok,state,events,code}` (input never mutated), `validate`, `available`, `replay`, `serialize/deserialize`, `hash` |
| `js/frag/F01/ai.js` | enemy AI — **PROVISIONAL**, deterministic (ties by cost, y, x, id; zero RNG) |
| `js/frag/F01/maps.js` | ASCII map format + three NEUTRAL sandbox maps + four sandbox missions |
| `js/frag/F01/packets.js` | entry/result translation: F04 packet in, F04 resolution out, F02 weapon binding, F05/F07 profiles |
| `js/frag/F01/showdown.js` | `RAShowdown` facade: sessions, hooks, persistence stores, entry points, flag gate |
| `js/frag/F01/sprites.js` `sfx.js` `ui.js` `showdown.css` `sandbox.js` | presentation + the sandbox (procedural neutral art, WebAudio placeholder sounds) |
| `js/frag/F01/migrations.js` | save namespace **declaration only** (`RAMigrations.namespace('F01',{active:null})`) — no version number, no module |
| `js/frag/F01/integration.js` | registers the DARK flag; nothing else |
| `js/data/audio/parts/F01_showdown.js` | six Vol 7 §11 sound ids as INERT drop-in hooks |
| `assets/f01/showdown-sandbox.html` | the standalone sandbox page (ships in the artifact under `assets/`) |
| `tools/tests/f01/**` | 11 suites (auto-discovered by `npm test`) + a real-browser path test |

**State** is plain JSON: `units{}`, `props[]`, `pods[]`, `rng`, `turn`, `phase`, `status`, `result`, `actions[]` (the replay log), `weapons{}` (resolved
at creation so replays never depend on a registry), `tun{}` (tunables). **Determinism receipt:** `same config + same actions + same seed ⇒ identical
state hash` (tested over 30 fights × 2 runs, plus replay-from-log, plus save/reload mid-fight, plus in a real browser). RNG draw order is fixed:
hit roll → (on hit) damage roll → crit roll; NEVER MISSES (LIL OGA on overwatch) draws no hit roll. Presentation randomness never touches the RNG.

## 4. Public API / contracts

```js
// headless
const made = RAShowdown.createSession(config, {store:'local'|'frag'|null});   // {ok,session}  | {ok:false,code:'FLAG_OFF'|'BAD_CONFIG'}
made.session.dispatch({type:'MOVE', unit:'a', to:{x:2,y:5}});                 // → {ok,state,events,code}   refusals never mutate
made.session.state / .result / .on(fn) / .save() / .serialize()
RAShowdown.replay(config, actions)      RAShowdown.hash(state)      RAShowdown.describe()
// actions (all cost 1 of 2): MOVE DASH SHOOT OVERWATCH HUNKER ABILITY CARRY RELOAD ITEM ; PULL_UP RICH_MOVE (Rich) ; RETREAT END_TURN (free)
// queries: engine.available(state,unit) (what the UI shows), rules.preview(state,shooter,target,{reaction,ability}) (the honest odds)
// consumers
RAShowdown.f04.enter(packet, {container, deliver:true})    // TAKE THE BLOCK / EXTRACT / RETALIATION / HAND BACK / emergency; delivers to RAWarRoomShowdown.receiveResolution
RAShowdown.enter('TRAP_RAID'|'TRAP_DEFENSE'|'FINALE'|<registered profile>, {squad, enemies, map?, headless?})
RAShowdown.registerProfile('F07_X', {objective:{kind:'ELIMINATE'|'EXTRACT_TARGET'|'SURVIVE', turns?}, turnLimit?})
RAShowdown.hooks.on('richSeen'|'end'|'event', fn)          // richSeen = {heat:15, vampgramPost:true}
RAShowdown.f02.bind(RAIronShowdown) / .report()
```

**Result packet** (`F01.result/1`): `outcome` `VICTORY|RETREAT|FAILURE`, `reason` (`FIELD_CLEARED, TARGET_EXTRACTED, SURVIVED, PLAYER_CALLED, TURN_LIMIT, RICH_DOWN, SQUAD_DOWN, STALEMATE`),
`ogaResults[{id,finalStatus:ACTIVE|DOWNED|CAPTURED, how, hp, stabilized, leftBehind, facts{shots,hits,misses,crits,kills,damageDealt,damageTaken,carriedTiles,talkedDown[],saw95Miss,tookHitInHalfCover,stabilizedAllies,healed}}]`,
`enemyResults[{type,status:ELIMINATED|SURRENDERED|FLED|REMAINING}]`, `bossFled[]`, `captive`, `rich{used,visible,pullTurn,knockedDown,gone:false}`,
`heat{base,rpg,silencerRelief,richSeen,total}`, `car{rammed,placed}`, `modifiers`, `stats`, `determinism{seed,rngCalls,actions,stateHash}`, `gone:[]`.
**F01 never emits GONE.** It hands over CAPTURED / DOWNED facts; a failed or expired EXTRACT → GONE is the strategic layer's call (`RAShowdown.packets.toStrategic()` says so in its `note`).
`facts` are raw events (e.g. `saw95Miss`, `carriedTiles`, `talkedDown`): F04 turns them into STORIES — F01 invents none.

## 5. Field, turns, hit model — as authored

* 6 × 9 grid; HALF / FULL cover; directional (a cardinal-neighbour piece protects against shooters within 45° of that side, inclusive); FLANKED = the target has cover but none faces the shooter (an open target is *not* flanked); height (+15, ignores HALF, not FULL); destructible cover (`C` car hood, `D` dumpster) destroyed by explosives (THE RPG); POD reveal (LOS within sight; the whole pod reveals together; hidden enemies are untargetable).
* 2 actions per Oga; `MOVE` (≤ MOBILITY), second `MOVE`/`DASH`, `SHOOT`, `OVERWATCH`, `HUNKER`, `ABILITY`, `CARRY`, `RELOAD`, `ITEM`; then the enemy turn.
* Hit model constants live in `RAShowdownData.HIT` and are tested one by one: AIM 55–80 base, HALF −20, FULL −40, FLANKED (cover ignored, +30 crit), height +15, OVERWATCH −15, shotgun close +15 (≤ 2 tiles), pistol long −10/tile past 5, HUNKERED target −20, crit base 10 %, ×1.5.
* **Honesty:** the displayed % is the number compared with the RNG (`percent < chance`). 20 000 raw rolls and 4 000 engine shots at a displayed 95 % miss 5 % ± 1.5 pp; every such miss raises the `"95%???"` caption (only at ≥ 95 %).

## 6. Classes / enemies / weapons (all source values, tested against a literal table)

| Class | HP | AIM | MOB | Ability (implemented as authored) |
|---|---|---|---|---|
| MUSCLE | 9 | 60 | 5 | SHOULDER CHECK: charge adjacent, 3 dmg, target EXPOSED (out of cover) |
| SHOOTER | 6 | 78 | 5 | DEAD EYE: shot at −10 aim, +3 damage |
| WHEELS | 6 | 62 | 7 | THE CAR: once per showdown — FULL-cover car tile, or ram 5 dmg (`result.car.rammed` feeds F04's CAR WRECKED) |
| TALKER | 6 | 58 | 5 | TALK HIM DOWN: honest 60 % (75 % with MOUTHPIECE) on enemies under 50 % HP → surrendered = removed |
| GHOST | 5 | 70 | 6 | VANISH: concealed 1 turn, first shot +20; HUNTER ignores it; SILENCER keeps concealment |
| DOC | 6 | 60 | 5 | PATCH UP: heal 4, or stabilize a downed Oga |

Rivals: CHEWER 5/60 (flanks), ENFORCER 9/55 (charges, shrugs off HALF cover), HUNTER 6/70 (silver +2 vs vampires, ignores VANISH), LIEUTENANT 10/68 (adjacent allies +10 aim), LIL SMACK 14/65 (CHEW −10 aim, **flees at 4 HP instead of dying** → `bossFled`, "he always comes back").
Weapons: PISTOL, LIL OGA (never misses on overwatch), SAPPORO SHOTGUN, CHOPSTICK SNIPER (no fire — and no overwatch — after moving), HOLY BABY DRAKE, THE RPG (area 3×3, destroys cover, 1 per showdown, +10 HEAT reported), LEGENDARY DRACO (two taps at −10 each). Named-Oga traits (12), the four example STORY perks and DAY ONES (+10 aim adjacent, free move toward a downed partner) are implemented as authored.
Downed: 0 HP → DOWNED, bleeding **3** turns, DOC/SIT DOWN stabilizes, any Oga CARRYs (slower; CARRIED TUNDE removes it) to the extraction zone (EXTRACTED = safe); mission end with enemies still up ⇒ left-behind DOWNED → **CAPTURED**.

## 7. Seams

**F04 (War Room).** `RAShowdown.f04.enter(packet)` accepts exactly what `RAWarRoomShowdown.buildEntryPacket` produces and returns/delivers exactly what `receiveResolution` requires: `{outcome:'victory'|'retreat'|'defeat', ogaResults:[{id,finalStatus}], heatDelta, cashDelta, richUsedPullUp, richVisible}`.
Two deliberate consequences, both reported to the owner: (1) F04's per-unit `stats` block is **ignored** (Vol 7 §5.4 numbers rule; noted as `STATS_IGNORED:<id>`); (2) `receiveResolution` adds the Rich-seen +15 HEAT and the VampGram post itself, so `heatDelta` **excludes** the 15 (`result.heat.richSeen` carries it) — passing it would double count. DAY ONES come from `bonds ≥ 3` both ways (F04's own threshold) or an explicit `dayOnes`. Emergency RUN escalation = `{emergency:true}` → 4-turn fight ending RETREAT. HAND BACK = profile `HAND_BACK`. Cash is `0` — rewards are strategic.
**F02 (guns).** `RAShowdown.f02.bind(RAIronShowdown)` (auto-attempted the first time a packet is built) converts `stats(gunId)` into F01 weapons: damage ranges, `2x3` multi-hit, two taps, area 3×3 / cone, suppress, blind, knockback, undead ×2 + self-heal, condition-gated (BLUEBERRY BLASTER needs `conditions.mazdaMajestic`), per-Oga carried gun via `iron.carried(id)`, mods (SILENCER, SCOPE +10 at range ≥ 5, DRUM MAG +1 ammo). `bind()` returns `{conflicts, unsupported}`: LIL OGA range (Vol 7 medium vs F02 close) is reported, JOLLOF BURNER burn scale, TOMMY TONY consecutive bonus, the AUNTIE'S SLIPPER fear tag and SAPPORO "hits two" are SOURCE_REQUIRED and *not* invented. **Exact integration steps when F02 lands:** nothing to edit in F01 — load order already puts F01 before F02; F02's `RAIronShowdown` is picked up lazily; owner runs `loader:sync`.
**F05 (Trap).** `RAShowdown.enter('TRAP_RAID'|'TRAP_DEFENSE', …)` — ELIMINATE / SURVIVE-N-turns profiles; no Trap management logic exists here.
**F07 (finale).** `registerProfile('F07_…', spec)` adds a profile (objective kind + turn limit) without touching F01; no finale content exists here.

## 8. Sandbox — how Ube plays it

Served with the artifact: **`/assets/f01/showdown-sandbox.html`** (phone or desktop; touch, mouse and keyboard).
Local: `npm run build && npx http-server dist -c-1` → `http://localhost:8080/assets/f01/showdown-sandbox.html` (or serve the repo root). URL params: `?dev=1` (seed field, RNG/hash/log in the pause menu), `&seed=…`, `&mission=skirmish|extract|boss|emergency`, `&squad=MUSCLE,SHOOTER,GHOST,DOC`, `&hard=1` (enemies shoot twice), `&tun=enemyShotsPerTurn:2`, `&autostart=1`.
In the game (flag ON via DEV `?dev=1&ff=F01.showdown_core`) `RAShowdownSandbox.open()` shows the same thing as an overlay.
Four neutral missions: **ALLEY SKIRMISH** (learn), **DOCK EXTRACT** (destructible cover, RPG, captive), **BOSS TEST** (LIL SMACK in the rain), **EMERGENCY (4 TURNS)**. Squad of 3–4 from six placeholder Ogas (BRICK, HAWK, CLUTCH, SMOOTH, SHADE, PATCH — none of them a canon character). Enemies use placeholder sprites. Rich's slide-in is a neutral headlights card labelled placeholder.
Controls: tap an Oga (or chip) → tap a teal tile (preview) → tap again (go). Gold tiles = dash (both actions). Tap an enemy → the odds sheet with every modifier → tap again / FIRE. END TURN warns if Ogas still have actions. Keys: `1–8` actions, `Tab` next Oga, `Enter` confirm, `Esc` cancel, `E` end turn.

## 9. UX / UI summary (sole owner: F01)

Cold neon noir over the accepted Gothic-Pokémon-hybrid panels: Press Start 2P, bone-cream ink-outlined panels, nocturnal purple chips, teal streetlight vs blood-red menace, hard pixel edges, stepped (`steps()`) motion, rain and haze as overlays over a procedural asphalt (a real location keeps its frozen art underneath — the overlay contract from Vol 7 §7.1 — via `map.env.art`). Clear selected tile, teal/gold move range with path preview, red target rings, half/full shield badges and an ✕ for FLANKED on units, fog for tiles no Oga can see, pod-reveal snap (zoom + red flash + banner), tracer lines, hit-stop, damage numbers (`CRIT`, `MISS`), the `95%???` VampGram-style caption, down/bleed tags, ENEMY TURN banner with the acting enemy's card, result card (VICTORY / RETREAT / FAILURE) listing every Oga's final status. Turn order = squad chips with HP and action pips (enemy chips during their phase). Dev tooling (seed, RNG calls, state hash, action-log copy) only with `?dev=1`.
No canon character/environment art is generated, no frozen asset is used or changed, no art is registered.

## 10. PROVISIONAL (not source — every one is in `RAShowdownData.PROVISIONAL`, owner F13)

RANGE_BANDS · DISTANCE_METRIC (Chebyshev) · WEAPON_CLIPS · ENEMY_WEAPONS · ENEMY_MOBILITY / one shot per enemy turn · ENEMY_AI · SIGHT_RANGE 5 · CLIMB_COST +1 · CARRY_PENALTY −2 · BLEED_OUT (timer expiry ⇒ TAKEN ⇒ CAPTURED) · DEFEAT_RULES · HUNKER_SEMANTICS (blocks active SHOOT, allows OVERWATCH, so CALM has meaning) · OVERWATCH_RULES · SHOULDER_CHECK (EXPOSED) · THE_CAR ranges · TALK_RULES · PATCH_UP_RANGE · CHEW_TARGET (literal "adjacent allies"; `tun.chewAffects='OGAS'` flips it) · ENFORCER_SHRUG · SMACK_FLEE · AREA_SHAPES (3×3) · RICH_ON_FIELD (2 actions, 6 tiles, moves auto-hit) · REVENGE_RULES · PULL_UP_ENTRY · RICH_DOWN · TURN_LIMIT · CRIT_ROUNDING · CLOSE_RULE (§5.3 ≤ 2 tiles wins over the §5.5 note "adjacent") · HEAT_SILENCER · NIGHT_MODIFIERS.

## 11. SOURCE_REQUIRED (refused, never invented)

OCTOPUS BRAIN's "three context tricks" (action returns `SOURCE_REQUIRED`) · ITEM (no item is authored; action returns `SOURCE_REQUIRED`) · F02 JOLLOF BURN scale · F02 TOMMY TONY consecutive bonus · BLESSED ROUNDS (needs enemy vampire/undead tags) · FULL MOON werewolves · RAIN/WHEELS night-modifier math on the grid · SEEN IT ALL (no PANIC exists: displayed, inert) · Vol 7 vs F02 gun conflicts (**HQ ruling wanted**).

## 12. Owner integration requests (nothing below was hand-edited on an owner surface)

1. **`index.html` — generated only.** `node tools/loader.mjs sync` produced 16 lines (F01 css link, `js/frag/F01/migrations.js`, the audio part, 12 scripts in the F01 slot). Committed so the real-browser path loads; `git diff 101a394 -- index.html` is the whole change. `check-owner-surfaces --fragment F01` therefore reports this one file — expected, same as F02/F04.
2. **`tools/tests/if1/loader.test.mjs` (OWNER-ONLY) collides with real F01 files** (its synthetic scratch fragment reuses the ids F01/F02, exactly as F02 reported). Apply after the scratch copy of `js/` is made (3 lines; verified: `npm test` then passes in full):
   ```js
   for(const dir of ['F01','F02'])await rm(path.join(tmp,'js','frag',dir),{recursive:true,force:true});
   for(const f of ['F01_showdown.js','F02_guns.js'])await rm(path.join(tmp,'js','data','audio','parts',f),{force:true});
   ```
   Without it `npm test` stops at `[if1/loader.test.mjs] new files land in their slots` (F01's own suites all pass before that point).
3. **Flag:** `F01.showdown_core` is registered DARK by `js/frag/F01/integration.js`. The IF-1 reserved flag `F01.showdown` exists and is unused; the owner may alias/retire it. Nothing was added to `flag_defaults.js`.
4. **Migrations:** namespace `F01` (`{active:null}`) declared only. No `RAMigrations.submit`, no ledger entry, no version number. `save.frag.F01` is created lazily and only by an opt-in persistence store while the flag is ON.
5. **HEAT tiers:** Vol 7 §8 authors COOL 0–29 · WARM 30–59 · HOT 60–84 · ON FIRE 85+ (F04's branch already configures them). F01 reads no tier.
6. **Audio ids (FCPB convergence: NO LONGER registered by F01; F11's F04_blood_x.js master owns them):** F01 emitted `BX_SLIDEIN_IDLE, BX_NAMECARD_SLAM, BX_POD_REVEAL, BX_OVERWATCH, BX_COVER_HIT, BX_DOWNED` (inert). `BX_GONE, BX_WARROOM, BX_CRATE` are left for F04 to avoid duplicate-id throws.
7. **F04:** wire `RAWarRoomShowdown` to `RAShowdown.f04.enter(packet,{container})` (its `PENDING_F01` state → `RESOLVING`); pass `seed`; pass `dayOnes` if F04 tracks them; F04 may delete `buildOgaStats` (ignored).
8. **F02:** rule on the Vol 7 / F02 conflicts (§11) — until then F02 stats win for guns F02 defines, and `RAShowdown.f02.report().conflicts` lists each difference.
9. **Real locations:** four authored maps (Koreatown alley, Arts District dock, Inglewood car wash, castle halls) need a `maps.js`-format spec from Art/F04; `map.env.art` is the frozen-art key. The neutral maps are sandbox-only.

## 13. Feel gate

Do **not** tune around an imagined reaction. Ube plays `assets/f01/showdown-sandbox.html` for several turns on a phone-size window and on desktop; the pass condition from Vol 7 §12 is that he says **"one more turn"** out loud. Suggested order: ALLEY SKIRMISH (default squad) → DOCK EXTRACT (carry the captive) → BOSS TEST → try HARD. Things worth watching and reporting: is the odds sheet trusted; does a downed Oga hurt; does overwatch feel earned; is the enemy turn too long (SPEED in the menu); is PULL UP (turn 3+) a moment. The provisional enemy AI/damage are the first knobs (`&tun=`), and a smart bot beats the default missions 77–100 % of the time while random play essentially never wins.

## 14. Verification

| Gate | Result |
|---|---|
| F01 fragment suites (`node tools/run-tests.mjs --fragment f01`) | **PASS — 11 suites**: grid · hit model · turn system · classes · enemies · downed/carry/capture · Rich · determinism · seams (F04/F02/F05/F07) · integration (flag OFF = zero change) · soak (64 full bot fights, 1 314 actions, invariants after *every* action) |
| `npm test` (full release gate) | **PASS (48 suites, exit 0) with the 3-line owner patch of §12.2 applied.** As committed (the patch is on an owner-only file) it stops at `[if1/loader.test.mjs] new files land in their slots` — a test-scaffold id collision, not a product failure; every F01 suite runs and passes before that point |
| `npm run build` + `verify:artifact` | **PASS** (with §12.2 applied): artifact `ra-101a394b5fa9-20260929045513` verified; `assets/f01/showdown-sandbox.html` and `js/frag/F01/*` ship in `dist/` |
| `node tools/leak-check.mjs` / `--dist dist` | **PASS** (1 586 tree files / 986 artifact files, no sealed implementation content) |
| `npm run verify:all -- --skip-build --require-browser` | **PASS** — loader, artifact, leak, empty-overlay equivalence, IF-1 real-browser smoke (22 checks incl. 360/390/430 no overflow; "every fragment flag OFF" still holds with `F01.showdown_core` registered) |
| `node tools/loader.mjs verify` | **PASS** (151 scripts, index.html in sync) |
| `node tools/check-owner-surfaces.mjs --base 101a394… --fragment F01` | only `index.html` (the generated loader region) — see §12.1 |
| **Real-browser path** `node tools/tests/f01/browser-path.mjs --dist dist` | **PASS 86/86** on the built artifact: layout at 360×640, 360×780, 390×844, 430×932, 1280×800 (no overflow, no page scroll, every control ≥ 32 px, zero console/network errors); two-tap move; POD reveal; cover/flank badges; honest hit-chance sheet == engine preview; shoot; overwatch; hunker; ability targeting; END TURN warning; enemy turn; downed/bleed tag; CARRY → EXTRACTED; PATCH UP; Rich pull-up cut + Rich buttons; RETREAT / VICTORY / FAILURE result cards; reload-resume with identical state hash; same seed + same taps ⇒ identical fight; the integrated game with the flag OFF (registered dark, refuses, draws nothing, no save namespace, schema v16) and ON via DEV (overlay opens) |

**Phone results** (tile = the board's touch cell; controls: END TURN 64×56+, actions 41–100 × 40–54): 360×640 → tile 42 px (the one place below the 44 px guideline; the command panel is already compacted and the hint line hidden) · 360×780 → 47 px · 390×844 → 54 px · 430×932 → 65 px · desktop 1280×800 → 81 px with the command rail beside the board. Zero horizontal overflow at every size. Screenshots are written to `reports/f01/` by the browser test (git-ignored).

**Honest limits.** The fun is unjudged. The enemy AI, enemy damage and every PROVISIONAL value are the smallest playable choices, not tuned. Bots (not people) say the default missions are winnable and a careful player is rewarded, and that lethality is real (≈ 1.8 Ogas downed per fight for a good bot on BOSS TEST). Audio in the sandbox is synthesised placeholder sound; no real BX_* audio exists yet.

