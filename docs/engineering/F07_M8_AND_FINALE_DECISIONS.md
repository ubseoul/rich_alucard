# F07 — D-QUEUE and CREATOR-DELEGATED RULINGS (M8 + the finale)

## OL-042 A1/B1 applied

Existing RICH ENTERPRISES exterior approved, exact pixels retained. F07-owned exterior adapter selects it only in the winning TAKEOVER node or saved finaleDone/finaleEnding=takeover/rentalWarehouseOwned state, with F07 enabled. No change to BLESSING/CONSIGLIERE art or narration. Approval sign rectangle (54,104,163,30): 701 changed pixels, zero outside. Earlier A1 review status below is superseded.

Source read directly: `Rich_Alucard_PLAYMAKERS_Patch1_NEW_OGA.docx` §1, §3 (M8), §4, §5, §7, §8 (Source Vault V1.1 `e76f840`). Searches run before declaring each gap: the full Patch 1 text; `Rich_Alucard_BTF_Vol7_PLAYMAKERS_Blood_X_Operations.docx` (no "SEND THE BOYS", no canopy/aunties text, Showdown rules §5); the other OPEN vault documents (Patch 2/RAINMAKER/IRON AND GRACE mention Gbenga only incidentally); `docs/engineering/UL_F2_001..004.md` and `BTF_OPEN_UBE_DECISIONS_001.md` (OL-002/004/008/010 are the M1–M7 fill-ins; UL_F2_004: "M8 remains an inert hold state"); `F03_NEW_OGA_LADDER_CLOSE.md`. Nothing SEALED was opened.


## Creator-delegated rulings (recorded as NEW rulings, not historical source facts)
Ube explicitly delegated these gameplay decisions to UNDERLORD; they are applied in this candidate.

| # | Ruling | Applied as |
|---|---|---|
| F07-D1 | SEND THE BOYS: no additional cost or penalty; forgoing the M8 payout is sufficient | Resolves M8; no pay, HEAT, clout or trust change (tested, browser-verified) |
| F07-D2 | M8 win: clout/trust stay 0; keep $18K and +12 HEAT | `tunables.js` m8.clout/trust = 0; pay/HEAT unchanged |
| F07-D3 | THE OGAS mandatory, fills ONE of the THREE lane slots, preselected and not deselectable; the player picks TWO others; conditional-lane eligibility unchanged; a saved plan without THE OGAS reopens selection with THE OGAS fixed and no other lane silently discarded | Plan UI shows `THE OGAS · SQUAD · FIXED` as a locked entry + two picks; `routePlan()` reconciles saved plans (kept lanes retained; three saved others reopen selection with each marked PREVIOUSLY PICKED); a UI-built plan cannot reach the PLAY without a squad (the `NO_SQUAD` refusal remains only as a backstop) |
| F07-D4 | Aunties/canopy gameplay implemented with no invented critique dialogue; minimal factual narration authorised | Exact narration below; spoken critique lines remain in the D-queue (non-blocking) |
| F07-D5 | Generic transient "GBENGA’S BOY n" labels; mechanical classes only as encounter tuning; `gbengasBoysCanJoin` is eligibility only, no fabricated recruits | Unchanged from the previous candidate (no recruit state is written) |
| F07-D6 | Source-silent lane effects stay neutral; no invented bonuses; UI must not imply effects | Lane entries are names only; picks change nothing but `finaleCrew` (tested) |
| F07-D7 | Finale Phase 1 reachable without a car or seat capacity — this encounter only, via F07-owned configuration; no persistent loaner, no vehicle lore, no inventory change; ordinary F01/M8 car rules unchanged; F03 tribute/TAKEOVER preserved | The finale request carries F01's own stock encounter vehicle (`HOOPTIE`) instead of Rich's garage, no `carMap`, no `recordDrive`; F07's PLAY page keeps its PLAY world under `ra.f07.play.v1.*`, so the vehicle cannot become a lost car, a recovery card or any F01 state. M8 and stock F01 requests still refuse with no car / too few seats (tested) |
| F07-D8 | Source-silent mechanical tuning may remain if compatible with authored moves/numbers | Unchanged: pattern order, VOICE NOTE telegraph (authored §7 pose), GOLDEN DRACO cadence, hazard magnitudes, loan-squad size, consigliere cadence |

### Exact narration recorded (F07-D4)
* AUNTIES event (feed, every occurrence): `THE AUNTIES BLOCK THE LINE OF FIRE AND CRITIQUE THE TACTICS OUT LOUD.`
* CANOPY POLE event (feed, every occurrence): `A CANOPY POLE IS HIT. THE CANOPY COLLAPSES ON WHOEVER IS UNDER IT.`
* Stage-card text (engine event record): AUNTIES `The aunties are non-combatants: they block lines of fire and critique the tactics out loud.` · CANOPY POLE `A canopy pole is hit and the canopy collapses on whoever is under it, Rich’s crew included.`
* Engine-named hazard causes (aftermath): `the aunties were standing in the line of fire` · `a canopy pole came down on whoever was under it`.
* Phase 1 scene narration (adventure) — **recast by BUILD-1 (OL-029 F)**, Rich is no longer the subject or target: `Gbenga’s boys are cleared through a warehouse full of canopies and stacked chairs without disrupting the owambe.` / `A canopy pole collapses on whoever is under it. The aunties are non-combatants: they block lines of fire and critique the tactics out loud.` (Previously: `Rich clears Gbenga’s boys …` / `… on whoever is under it, Rich included. … critique Rich’s tactics out loud.`)
No jokes, character claims or story events were added.

### Phase 1 framing (OL-029 F, BUILD-1)
Finale Phase 1 THE PARTY is a PLAY that Rich WATCHES ON HIS PHONE from the owambe. F01's PLAY presentation already is that phone (the group chat is the only live UI; Rich appears only as his own texts); the squad is the Ogas + the two picked lanes, Rich is not on the field (no Rich unit in the pods) and no hazard is aimed at Rich. The repair is therefore a text recast (above) plus `tools/tests/f07/phase1_phone.test.mjs`; no F01 file, number or feel changed. No new sentence stating "Rich watches on his phone" was authored — see D_QUEUE item `F07-P1-FRAMING`. Phase 2 THE OFFICE is unchanged (menu combat as authored).

## Remaining D-queue (non-blocking)
| # | Item | Status |
|---|---|---|
| D4b | The aunties' actual spoken critique lines (non-Rich dialogue) | Absent from source; not written. Needs a writer. |
| D5b | Names/classes/count if Gbenga's boys are ever to join as recruits | Eligibility recorded only |
| D6b | What, if anything, each of the six non-squad lanes changes | Deferred; neutral |
| E1 | Enemy-side effect of the canopy collapse ("whoever is under it" includes Gbenga's boys) | F01's generic hazard acts on Rich's crew only (`ctx.hazard`, engine.mjs); an enemy-side effect exists only for the engine's own `power_cut` card id. Needs an F01 engine hook — outside the authorised F07-owned seams. The collapse is proven on Rich's side (below). |
| A1 | Art: OWAMBE warehouse condition, repainted sign, an exterior for `owambe_party` | BUILD-4: frozen party interior and base exterior integrated; repainted sign preserved/registered, post-TAKEOVER condition mapping remains P-B creator review. Exact-byte provenance in `art_department/build4/INTEGRATION_MANIFEST.json`. |
| A2 | §6 Mister December "visits as an equal" scene | Vol 7 / F04 scope |
