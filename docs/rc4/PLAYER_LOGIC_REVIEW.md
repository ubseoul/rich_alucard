# RC4 first comb audit — player logic and coverage

Audit base: `4981d5245d0600c062a7f431acd8253dc28b9cc6` (`origin/integration/rc3`). Audit branch: `rc4/comb-audit`. This is an OPEN-only review and proposed refinement plan, not implementation or RC4 acceptance. Stable finding IDs resolve to [COMB_LEDGER.md](COMB_LEDGER.md).

## What actually ships

The runtime is a compact daily spine plus a much larger retained route graph. `index.html`, registrations, `js/if1/features.js`, shared `RAAdventures.canStart`, phone actions and RC3 overrides were traced together. A loaded script or a catalog record is not evidence of player access. Repository source was served in Chromium because the production build gate fails on this clean Linux checkout (RC4-004).

| Intended RC3 direction | Audited implementation | Provenance / verdict |
|---|---|---|
| story → fight/PLAY → cash → club → sleep | Explicit RARC3 next/read/canSleep; mandatory outcomes count; optional War Room PLAY credit does not | Build A + rc3.js; coherent guidance, incomplete credit RC4-017 |
| Nine phone apps | VampGPT, Texts, War Room, Strip Club, Armory, Bank, Maps, Radio, VampGram | Fresh ordinary screenshot; **matches**, fixtures after reset can temporarily show locked tiles before wake |
| One story notification | Guidance returns one; pending event filter is story-only, sliced1; other mail silent | **Matches visible story policy**, unread backlog separate RC4-023 |
| Maps-only optional adventures, ~10 | Shared gate enforces Maps; **20** entries | Build A explicitly chose20; user’s target~10 differs, RC4-009/021; review target, no silent cuts |
| Club, ramen, rave, Range retained | Four core games plus mandatory chairs/owambe/Senator/escape and Maps Jollof/PLAY | Actual route graph wider than scope list, RC4-021 |
| ~5 guns, no mods | Active F02 Armory displays5 sale guns; five guns sell on the ordinary home, and MODS/workbench is reachable (confirmed final-check fixture through actual UI) | **Five-gun sale count matches; no-mod direction does not**, RC4-033 |
| ≤6 visible combat moves | Four canon learned/equipped; optional Petty Slap fifth; four active slots | **Matches fresh state**; old-save learned inventory can exceed, no destructive trim proposed |
| Ramen only day job | Simplified War Room job surface | **Matches normal route**; canopy is story labor, not a second day job |
| Party Hall main goal | Bank offers $250K then BUILT only | Acquisition retained, payoff cut RC4-005 |
| Cash + club hype focus | Host cash; club still CROWD/SPENT/WASTED/budget/timer/extra progression | **Mismatch**, explicit Build A → B handoff left unfinished RC4-011 |
| ~21-day campaign | One ladder mission/wake; no endpoint; direct spine ~13 days, possible extra alternative day; ending disabled | **Not implemented as coherent21-day arc**, RC4-003/008/018 |

### Access classes

**Normal visible:** bedroom, guidance/phone, nine apps, daily mandatory spine, simplified Armory and Bank, club. **Optional player actions:** War Room PLAY/ramen, 20 Maps outings, Range after a gun purchase, F15 support/date/VIP routes. **Dev-only:** query/dev flags, state inspector/reset and test fixtures; none used in ordinary path. **Dormant:** non-sale F02 catalog acquisition routes, parts garage and many old utility systems; loaded code is not a tile. **Intentionally cut:** Trap, non-stripper dates, old room tree, imports/car shops, automatic optional wake invitations. **Broken/stranded:** required car branches, hall consumer, ending, surviving consumer promises. Legacy acquisition checkpoints/old-save edge routes have incomplete browser coverage and are not declared universally unreachable.

## Screen/action/transition review

| Moment | Player expectation / why choose | Observed or traced result | Common-sense judgment / smallest direction |
|---|---|---|---|
| Title/start/prologue | Learn Rich’s premise and powers | Real normal-time clicks lead to CEO fight; signature effects and frozen character identity visible | Strong memorable premise; automated time to first-fight entry is not reading time or a fun score |
| CEO fight → castle/wake | Victory changes status and starts life loop | Ordinary win, assistant left alone, nine-app phone opens | Coherent; exact historical combat renderer differs from later move presentation RC4-020 |
| Morning/VampGPT | One clear next thing | Rave then crew/story/cash/club/sleep | Clear dominant path; repeated NEXT/RECOMMENDED/helper copy can be shortened only where it repeats no new information |
| Phone home | Explore life from a small phone | Nine icons + cash + radio/header/guidance | Coherent aesthetic; repeated cash labels and old badge load can clutter; no general layout redesign needed |
| Texts | Read a meaningful current request | Silent persistent unread threads; legacy dateable classification differs under RC3 | Separate current actionable story from history; preserve messages RC4-023 |
| War Room | Choose a job and crew; play rather than automate | Actual no-car picker supplies HOOPTIE; optional PLAY settlement not daily credit | Good meaningful choice entry, incomplete integration RC4-002/017 |
| Armory | Buy/equip gun or change supernatural loadout | Five-gun shop and real move swap; active six-mod workbench confirmed in final-check | Sensible; decide whether to cut the surviving mod surface; show action costs when fighting RC4-014 |
| Bank | Understand income/save for a payoff | Rental route and auto income; hall buy has no use | Rental simplified coherently; hall breaks promise RC4-005 |
| Maps | Optional adventures in sensible order | Twenty choices, finals/numbered later episodes immediately available | Optional entry correct; erased chronology is not good simplification RC4-009 |
| Radio | Pick music that stays or follows moment | File-backed tracks plus dormant missing entries; scene policies share several owners | Need explicit pin/restore and moment cue map RC4-024 |
| VampGram | Flavor/social recognition | Rave post appears on fresh route; existing receipts/feed data | Fits phone fantasy; not proof all late consequence posts work |
| Rave → BLAD33EE | Music party interrupted by hunter | Real rhythm key input and5 supplied lines, real fight | Good story/music/action moment; retain exact Ube lines; hunter animation could later deepen after main signatures |
| Daily mandatory missions | Rise through Gbenga’s hierarchy, choices remembered | Conditions, outcomes and memories traceable; M4 run throws; M8 hand-on refuses; M9 consequence reader lacks flag | Repair specific consumers; no need to restore all cut systems RC4-001/002/007 |
| Cash collection | Receive useful earned reward | Source gross-vs-net floor flaw; repeat collection guarded | Clear receipt must distinguish money already earned from topup RC4-008 |
| Club | Spend, perform, meet an adult dancer | Real flicks, moving platform, hype; discounted cost differs from promise; crowded dual HUD | Strongest depth home; simplify presentation and fulfill terms before adding depth RC4-010/011/026 |
| Leave club/sleep | Wind down, next day remembers visit | Ordinary three-throw day sleeps successfully; fixture zero-throw visit also counts | Free leave must stay possible; give it a small purposeful beat RC4-027 |
| Stripper dates | Relationship progresses with chosen woman | Twelve authored scenes, support and per-wake limits; Roxy spar/prop contradictions | Good distinct adult voices; fix actions to agree with text, then add small memory callbacks RC4-015/016 |
| Finale/post-finale | Resolve Rich×Gbenga and choose postgame | Source trigger disabled; complete-state Day37 still daily fight | Biggest pacing failure RC4-003; no ending claimed seen |

## Opening, middle and late interpretation

Opening has the most coherent authored rhythm: distinctive prologue fight, life phone, rave intrusion, money and club. The ordinary path through Day2 confirms it can work without debug wins. Middle-game source tracing reveals trim damage: supplied transport is text-only on Carlos’s run branch, M8 uses another garage policy, and an unavoidable tribute has no fresh acquisition loop. Gbenga’s sleeve/phone/Mama behavior and Carlos’s escape-band consequences are existing depth worth preserving, not permission to invent new arcs.

Late game has no usable major-property payoff and no terminal loop. A straight one-mission-per-wake ladder is around13–14 days depending on an alternative route, not a reviewed21-day campaign. A player can nonetheless pass37 because post-finale story defaults complete and another generic fight/cash/club cycle is offered. The reported Day31 ~$353K was not replayed: likely contributors are ongoing reserve floors, $100K monthly credit at Day29, rental income and promotion income, plus missing ending/sinks. Fix cause before arbitrary cash/day caps.

## Actual coverage and limitations

**Ordinary browser,390×844, fresh storage:** start/prologue, CEO win (no debug result), leave assistant, wake/phone, Armory move swap, Bank, Maps, rave with real key events, five supplied BLAD33EE lines, Blood Bath/Revenge combat, cash collection, club with three real flick throws, sleep, Day2 Jug the Plug beginning. See [ordinary/browser-path.json](evidence/ordinary/browser-path.json). Automation supplies tap/key timing; this is not a human full playthrough or reading-time study.

**Explicit patched-state/direct-launch fixtures,390×844:** phone snapshots, ramen first ingredient and receipt, canopy drag, Owambe, Senator care view, generic dance view (not rave), corrected rave launch, Jollof, Range, M9 actual NAH, M8 actual bridge refusal, Day31 incomplete-state view, Day37 completed-finale state, War Room offer/crew picker with HOOPTIE, M4 actual params throw, ending eligible override. `RAState.reset()` fixtures initially show $100K default until proper wake initialization; they are not evidence of normal starting money. Some reset phone screenshots retain locked tiles before the wake; ordinary fresh phone is the authoritative nine-app access evidence; the final-check fixture initializes wake before opening the Armory home and MODS bench. The Day31 fixture is not a coherent completed campaign. Immediate multi-game transition toast overlap is fixture contamination, not an ordinary bug finding.

**Source:** all retained IDs/nodes and registry entry points, shared allowlist, build flags/configuration, car and property acquisition/consumer/recovery code, F15 progression/scenes, combat rules/presentation/FX, audio ownership, late wake/ending. No private sealed implementation or sealed source document was opened. Registration/manifest metadata was used only to distinguish OPEN and unavailable authority.

**Gaps:** no full campaign playthrough; no full F01/F07 PLAY settlement in this audit; no natural Day31/37 save; no complete all-dates/support/VIP progression; no car-loss/tribute recovery played; no all minigame high/low scores; no full boss battle or frame-perfect hit trace; no listening study or mobile-device touch hardware latency check. Source review extends coverage, not experiential proof. No exhaustive population simulation or width sweep was run.

**Validation:** fresh fetch/remote SHA verification and isolated worktree; `npm test` fails at case-sensitive import before executing suite; `npm run sources:check` fails five entries. Historical RC3 passing logs are not fresh results. Browser paths on repository source completed without captured page errors. Future repairs require full `npm test` plus one quick390 smoke after gate repair.
