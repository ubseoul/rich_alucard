# BTF Content Authoring Guide (Rough Complete)

Adventures are data in `js/data/btf/adventures/*.js`, registered with `RAAdventures.define(...)`. Read `js/engine/adventures.js` (header comment = node schema), `js/data/btf/adventures/w1_life.js` and `js/data/btf/adventures/date.js` as worked examples before writing anything.

## Authority & hard rules
- Canon order: Ube → `docs/CURRENT_CANON.md` → frozen pixels → HQ Addendum → volumes. The volumes' adventure beats (TRIGGER · BEATS · FORK · LEAVES BEHIND · MEMORY) are the spec. Follow them; do not add new plots, characters or lore.
- **Rich lines**: every line spoken by Rich uses `R('...')` (marked `[VP]`, voice pass required). Use the volume's drafted `[VP]` lines verbatim where given. Keep Rich lines few, short, lowercase, straightforward, oddly optimistic, self-interested, meta. Only Pidgin word is "oga". Never write the n-word. Do not become Rich's screenwriter — when a moment needs Rich to react, one short `R()` line or a narration beat is enough.
- **Non-Rich lines** (NPCs, narration): functional drafts pending HQ Story. Keep them short, specific, funny, sincere where the volume says sincere. Use `S(personId,'...')`, `N('narration')`, `E(personId,'...')` for a held status entrance (important NPCs: entrance beat + a crowd reaction line before they speak).
- **CRACK is canon-locked**: never implement it. If a beat says "CRACK fade", write "she stays." + a non-graphic fade narration line and set `RALife.setFlag('stayedOver',{person,day:RALife.today().day})`. A locked `CRACK 🔒` choice may be shown (`when:()=>false,hideLocked:false`).
- All romance characters are adults. Non-graphic. No slurs. No real-world religious iconography. Substances only: za, portobellos, Dragon Keef.
- **PLAYER-BLIND**: do not write sealed content. Never open/quote `js/data/ogun_rave_content.js`, `js/data/property_content.js` or `art_department/ships/art_ship_003`. Sealed slots are neutral hooks only (`RASealed.fire('S05',ctx)`); never invent what a sealed slot contains.
- **Claims must match pixels**: if a line says packed, the env must be a crowded one (`crowd` count high in `js/data/btf/environments.js`). Environments are centralized in `js/data/btf/environments.js` (do not edit it); use the closest existing env id, keep narration honest to what is drawn, and list any env you really need in your report.
- Every adventure: ends with `end:{...}` (return beat to the bedroom), writes a memory (`end.memory`), and should leave something a later moment reads (a flag, a person memory via `RARelations.memory(id,'event')`, a receipt, an unlocked app/place/temptation). Night-ender adventures (Ogun-scale, castle parties, Portobellos, Hilt) set `nightEnder:true` in `end`.
- Failure writes story, not reload: both branches of every fight (`win`/`lose`, often `spared`) must continue the adventure.

## Helpers you can use (read the files)
- `RAContent` DSL: `R, S, N, E` (`js/data/btf/dsl.js`).
- `RALife` (`js/systems/life.js`): money (`spend`, `addMoney`, `fmt`), points (`addPoints('clout'|'rep',n)`), `addFollowers`, flags (`flag`, `setFlag`, `counter`), items (`addItem`, `consume`, `count`), ownership (`addCar`, `hasRoom`, `addGun`, `addProp`, `addFit`), `unlockApp(id)`, `remember`, `receipt`, `mail`, `text(threadId,from,body,{choices})`, `light(dimension,amount,key)` (hidden momentum: expression/connection/ownership/legend/chaos), `tendency('solid'|'messy')`, `today()` (day/weekday/rain/fullMoon), `L()` query helper for predicates.
- `RARelations`: `meet`, `add(id,points)`, `level(id)` (0 none,1 met,2 cool,3 close,4 ride-or-die), `memory`, `remembers`, `setFlag`, `flag`.
- `RATemptations.define([...])` — wants generated at WAKE (see w1_life.js). `RAWakeTriggers.define([{adventure,when(L),priority}])` — adventures that start after the morning mail (at most one per morning).
- `RAPlaces.define([...])` — GO SOMEWHERE destinations (first-time adventure, then repeatable form). `RAVampGPT.defineLane('money'|'people',[...])`.
- `RAParties.choices(situation,next)` / `earn(id)` / `register(fn)` / `attended(kind)` for party lanes.
- Fights: `fight:{enemy:'bonesworth',params:{env:'throne_party_mess',intro:'...'},win:'x',lose:'y',spared:'z'}` — enemies in `js/data/btf/combat.js`. `params.noPenalty:true` for story losses with their own consequence (Hilt).
- Minigames: `minigame:{id:'pier'|'touge'|'bars'|'slurp'|'jollof'|'hookah'|'pickup'|'hatch'|'garage',params:A=>({...}),next:(A,result)=>'node'}`. Check each minigame file's params (search `ctx.params`).
- Systems: `RADragon.adoptEgg()`, `RACars.buy(key)`, `RAMusic`, `RAStores`, `RAEcology.add(n,reason)/level()`, `RANodd`, `RADating`, `window.RADateContent.define(id,{...})`.
- Dynamic nodes: `env`, `actors`, `title`, `lines`, `choices` may be functions of `A` (adventure context: `A.vars`, `A.set(k,v)`).
- `chain:'A19'` in an end node starts another available adventure immediately instead of going home.

## Testing (required before you report)
`node tools/btf-test.mjs` validates every node graph, [VP] marking (including dynamic lines) and walks every branch with synthetic minigame/fight results. Add `testSetup:ctx=>{...}` / `testVars:{...}` to an adventure whose availability needs setup (see date.js). Then run `npm test` — all PASS. Do not edit any file you do not own; if an engine change is needed, describe it in your report instead.
