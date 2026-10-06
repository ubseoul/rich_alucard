# RC4 first comb audit — cut consequences and access

Audit base: `4981d5245d0600c062a7f431acd8253dc28b9cc6` (`origin/integration/rc3`). Audit branch: `rc4/comb-audit`. This is an OPEN-only review and proposed refinement plan, not implementation or RC4 acceptance. Stable finding IDs resolve to [COMB_LEDGER.md](COMB_LEDGER.md).

## Cars first

**Fresh normal players cannot buy a personal car through the shipped phone/Maps routes.** This is deliberate removal of purchase surfaces, followed by incomplete repair of their consumers (RC4-001/002/006/007). Catalog prices are dormant acquisition data, not visible purchasing instructions. Garage rooms, JDM collection and imports do not become reachable simply because their scripts are loaded.

War Room already makes PLAY possible with a four-seat HOOPTIE loaner. M8 does not share it. Finale part 1 uses encounter-specific transport; it does not require personal ownership. Carlos escape still dereferences ownedCars[0] after dialogue was changed to a borrowed van. Those are three different transport policies, not one economy shortage.

Prefer the smallest complete required-play loop: **encounter supplies adequate transport → player chooses crew → launch → settle or recover → return to story**, with enough-seat feedback before launch. Add one personal-car purchase/receipt/recovery loop only if Ube retains ownership/tribute as a meaningful feature. A whole restored car app ecosystem is unnecessary.

| FEATURE | PLAYER ENTRY | PREREQUISITE | ACQUISITION | CONSUMER | FAILURE/RECOVERY | VERIFIED STATUS |
|---|---|---|---|---|---|---|
| Personal car | No fresh normal purchase surface | Old ownership or legacy acquisition checkpoint | Catalog buy functions; Supra collection dormant | M1 car option, M4, M8, M9 | No visible fresh recovery shop | **Stranded acquisition** RC4-006; existing-save checkpoints not exhaustively tested |
| War Room transport | War Room jobs → PLAY → crew picker | Active War Room and crew selection | Four-seat HOOPTIE fallback if no compatible personal car | F04/F01 job request | Crew selection/seat refusals; F01 recovery UI; loans do not enter ownership | **Working entry fixture:** picker with no personal car; settlement source-traced |
| Carlos van | M4 TELL CARLOS TO RUN | Current mandatory mission | Text promises uncle’s loan | Touge escape | Actual params throws on no car; alternative story choice survives | **Broken branch**, RC4-001 |
| M8 transport | TURF WAR → PLAY | M8, team/transport | F07 garage snapshot only | Tactical encounter | NO_CAR; SEND THE BOYS bypass | **Broken PLAY access**, RC4-002 |
| Finale transport | Mandatory finale PLAY | Finale state | Encounter loaner defined by bridge | Finale tactical part | F07 result handling; not dependent on car inventory | **Source verified**, not late-game browser play |
| Tribute | M9 | RC3 forces mission even without favorite | No new acquisition | Tributes favorite or Urus/Aventador | GIVE hidden if raw owned list empty; OTHER disabled; NAH works; later grants inconsistent | **Fiction/consequence mismatch** RC4-006/007 |
| Lost/tributed last car | Legacy-save car state | Owned car lost or tribute marker | F01 recovery supports recoverable cars; not all unique cars recoverable | Available garage/seat readers | F04 fallback; F07 M8 lacks fallback; tribe excludes available reader | **Mixed policies**, source only for recovery; do not promise tribute buyback |
| Guns | Armory → buy | Cash; five-gun ordinary shop | Buy/equip; cheapest LIL OGA $25K | Menu combat, Range Day | Affordability and ammo rules; signature moves remain free alternative | **Fresh route works** ordinary Armory inspected; F02 13-gun/mod catalog not normal roster |
| Moves | Armory → move slot | Home; learned move | Four canon moves; A19 can add Petty Slap | Four equipped action slots | Swap known moves, no shop dependency | **Working** ordinary swap; fresh known count4, optional5; old-save full known list not capped by audit |
| Crew | War Room | Activation/offer; recruiting rules | Existing crew recruitment, later queued M10 recruits | PLAY jobs | Cap/injury/death/seat refusal and queued grants | **Entry/picker verified**, mortality and queue source-only |
| Rentals | Bank BUY RENTAL $34K | $39K cash incl $5K reserve | completePurchase(cut) | Automatic aggregate rent at wake; about $600/day for retained property | Disabled purchase if poor; existing holdings retained | **Complete source loop**; purchase/wake not replayed |
| Party Hall | Bank BUILD PARTY HALL $250K | $255K with reserve | Castle.buy(party_hall), old party gate removed | Only BUILT; host/room entries blocked | No useful active interaction | **Stranded consumer** RC4-005 |
| Stripper dates | Club roster, eligible scene | Support thresholds10K/35K/80K/150K; sequential scene/wake rules | Paid support with selected performer | Twelve retained F15 scenes, three women | Off-night limits, one date per wake; persisted scene completion | **Source loop exists**; full threshold progression not played |
| VIP | Club hype/encore loop | Encore progress | Three persistent tiers | Club presentation/progression | Clearer distinction from support needed | **Active**, ordinary throw feedback; tiers source-only |
| Ramen day job | War Room job / A08 SLURP | Route/coach | Shift orders/receipt | Cash/work memory | Clock out/quit receipt; first tutorial freeform | **Only visible day job**, targeted ingredient/receipt verified |
| Other jobs / Trap | No normal route | Removed app/flag policy | Legacy definitions | Legacy economy | RC3 shared router/flags reject | **Intentionally cut**, no restore recommendation |
| Maps | Phone Maps | Optional choice, no daily-story requirement | Twenty retained definitions forced available | Optional fights, jokes, unlocks | Chronology/preconditions lost; some chains rejected | **Reachable but incoherent gates** RC4-009/021 |
| Marisol/home service | Maps hiring | Prior quarters gate erased | Hire/remember | Maid route/quarter inaccessible | Retain one existing owned interaction or remove promised consumer | **Stranded payoff risk** RC4-030; source-only |
| Range medal | Armory owned gun → Range Day | Gun, score threshold | Medal/story crit in F02 registry | Active mod discounts/workbench remain; conflicts with no-mod direction | Reward presentation needs active consumer | **Scope-dependent reward mismatch** RC4-030 |
| Non-stripper dates, parts garage, legacy rooms | No normal app/shared entry | Cut routes | Existing old saves may contain assets | Blocked surfaces | Preserve inventory/history; do not reactivate by default | **Intentionally cut/dormant**, not individually repaired |

## Required integrity criteria

Future repair must test fresh carless M4 run, M8 hands-on PLAY, full-team seats, sole car lost/tributed, legacy held-car semantics and cancel/retry returns. One shared available-car reader should exclude unusable cars consistently; raw ownership length is insufficient. Preserve capture bands and PLAY odds. Disabled options need an explanation and a reachable alternative, not a dead purchase instruction.

Acquisition and recovery proposals overlap `rc3.js`, F04 `play_adapter.js`, F07 `play_bridge.js`, F03 `new_oga_ladder_close.js` and `js/frag/F01/play/adapter.mjs` / `js/frag/F01/play/world.mjs`. Ownership fiction depends on Ube’s decision before M9 copy repair. See RC4-001/002/005/006/007/030 for complete finding fields.
