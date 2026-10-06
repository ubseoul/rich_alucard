# RC4 Stove B — campaign and character continuity

Exact runtime4981d5245d0600c062a7f431acd8253dc28b9cc6, unchanged integration/rc3. **Full public spine source-traced; opening/rave ordinary play from Stove A; later labelled checkpoints and actual limited battles. No natural full campaign claimed.** Private overlay excluded.

## Progression requirements and pacing

RC3 uses `pendingMission` plus `day > lastMissionDay` and daily `story→action→cash→club→sleep`. A successful/spared mandatory combat supplies action credit; a non-quit/non-error/non-lose mandatory minigame also does. Dialogue-only days require the generic cousin fight. Morning notification is one story item, but silent unread texts survive. Optional Maps content takes player time, not a mandatory extra day; date completion has a separate global one-date-per-wake cap.

| Beat | Source lower-bound day, assuming first-day rave and every required action succeeds | Blocking/branch/mandatory waiting |
|---|---:|---|
| Prologue/CEO/throne/rave |1 | Fast production prologue removes repeated climbs and growth setup; actual Day1 loop played in Stove A |
| M1 robbery |2 | Fresh car/Kiki alternatives unavailable; STICK-UP can advance |
| M2 interview |3 | Repay/exit cut; only WORK branch; extra daily fight needed |
| M3 delivery |4 | Chair minigame supplies action; full/coolers-left differs trust/pay |
| M4 Carlos |5 | WALK IN direct; escape dispatch broken; protecting Carlos adds ALTERNATIVE day |
| M5 collection |6 direct /7 alternative | Four resolved outcomes advance; quit currently reopens minigame |
| M6 Senator |7 /8 | Walk success/failure changes trust; no mandatory rank-block retry |
| M7 dinner |8 /9 | Leftovers fork; extra daily fight required |
| M8 turf |9 /10 | Fresh GO MYSELF NO_CAR; SEND THE BOYS bypasses; postponed/loss do not resolve mission |
| M9 tribute |10 /11 | Fresh NAH only; still leads to M10 contrary to withheld-grant intent |
| M10 vice president |11 /12 | Weekly income/grants; extra daily fight required |
| VampGPT choice |12 /13 | SAY LESS advances next wake; NAH has a legacy7-night reask contract bypassed by RC3 picker eligibility |
| Finale |13 /14 | Two selected lanes + ogas; PLAY vehicle/crew requirements, then real Gbenga duel; losses retry |
| Fame/terminal recognition |No reachable endpoint | F07 authored `FAME_FLOOR_DAY:25`; RC3 replaces `RAFame.claimsWake` with false |

These are **source lower bounds**, not measured completion days or a repair proposal to force Day13. Failed fights, optional time, unaffordable visits, postponed jobs and remaining transport defects extend them. M4 protection adds one mandatory wake. A stay-at-VP decision needs an approved voluntary-end policy. There is no source mechanism deliberately stretching the currently driven spine to about21 days; an authored25-day fame floor also disagrees with that review target. The reported Day31 cash and Day37+ campaign are not reproduced natural runs; RC4-003/008 trace the lack of endpoint and continuing cash/rents/grants rather than changing numbers to hide them.

**Smallest coherent pacing plan:** settle the OPEN endpoint and OL-079 provenance, connect earned completion once, and make further club/adventure/PLAY voluntary. Then decide whether ~21 days is an intended natural median or a required authored story cadence. Deepen existing dinner/consequence beats before adding waiting days or new missions. Owner story lead/design+engineer, M, Overlord approval; sources `js/systems/rc3.js`, `js/frag/F03/new_oga_ladder_close.js`, `js/frag/F07/m8_and_finale.js`, `js/frag/F07/tunables.js`.

## Setup → remembered state → actual payoff

| Thread/choice | What persists | What consumes it | Verdict / smallest action |
|---|---|---|---|
| M1 loud/switch/Touge |m1Route, rank/debt, money/items |M2 recognizes robbed boy; most later ladder prose fixed | KEEP setup; repair fresh alternate acquisition only if retained (006) |
| M2 honest/flex/fish |Trust, answer |Later Senator command eligibility, high-trust boss HP/recruit | KEEP meaningful answer; supplied roast preserved |
| M3 complete/chairs-only |Money, trust/clout, Carlos mutual fallback |Promotion/crew and later boss gates | KEEP fail-forward; do not count a literal quit as stacked chairs (041) |
| M4 WALK IN |Pay/rank, Carlos unfollowed/apron, messy tendency |VampGram decorator stops displaying mutual follow; finale Carlos lane only available here | KEEP actual social consequence. “unfollows Rich” persists; later-party flag loses HOST consumer (030). Reuse betrayed/apron frozen state in existing scene if approved |
| M4 warn/act trouble/run |Trust changes, alternativePending, Carlos escaped/run band, solid tendency |One ALTERNATIVE wake; Carlos finale lane excluded | KEEP distinct effects; transport dispatch blocks earned run outcome (001). No band retune |
| M5 full/short/greedy/dance |Amount, payout, trust/clout/heat, outcome |Rank/trust/boss eligibility |KEEP costs; uncle/aunties not visibly responding to the collection stakes (029) |
| M6 walked/lost |Care flags, senatorLost, trust; rank4 granted after M5/M6 |High-trust senator command lane / boss HP and recruit gate |KEEP genuine failure memory; lost dog recovery is explicitly off-screen, not a missing quest |
| M7 take/refuse leftovers |leftoversAte/refusedMama/trust, vault and business knowledge |Gbenga Combat2 local `items.leftovers` unlocks RETIRE UNCLE |KEEP strongest relational payoff. Mama’s remembered refusal is mostly combat gating, not a later conversation. Optional one existing phone/ending callback, not more dates with Mama |
| M9 give/other/nah |Tributed identity/day, rank/trust, outcome |Takeover returns actual tribute record; blessing/consigliere do not promise it. NAH grant policy not implemented |Repair007/006; keep explicit possession recovery contract |
| Three finale endings |finaleEnding/Day/crew/renamed business, rental ownership, consig­liere |Rental/territory state and recurring advisor notes; fame eligible at25; RC3 dailyfight still forced |Repair003 endpoint; show distinct receipt before optional continuation |
| Aunties/FUFU/YAM |Approval/style/cooking flags, relations, receipts/memories |Some flags only record flavor; memories are intentionally modest rewards |Repair039 records that contradict their own selected outcome; do not invent power rewards for every family joke |
| Phil |philProgress, philLastDay, phil3Done |Wake trigger respects days; RC3 Maps available override ignores last-day semantics |Repair037; two normal Maps/FOOD entries on same Day40 proved the contradiction |
| Jollof → Lil Smack |cookoff wins/trophy, final result/legend, departure flag |A54 final entry gate overwritten; A54 winning chain uses `from:'chain'` rejected for A56 |Repair009/034/009; honour final cancellation and one reviewed continuation |
| Marisol/Bonesworth/Hall |Hired/resident/sword/room flags |MAID/HOST/Armory wall cut or route blocked |030/005 smallest existing-app payoff; no restoration of the whole removed ecosystem |

## Relationship verdicts

**Rich × Gbenga:** The interview, Carlos loyalty test, entrusted dog and the leftovers combat gate form a coherent relationship with real costs. The weakest bridge is M7: its migration/business/family revelation is told as a synopsis. The finale then converts trust into harder HP and a recruit option, but the compulsory daily cousin fights dilute that escalation. Preserve the dinner and family warmth, put one reciprocal exchange into its existing patio beat, and make one remembered choice visible in an existing message/ending slot (038/018/019). Artist need is staging/state reuse, not a new family or mansion.

**Roxy:** Competition, paying, study plans, animal preferences, vulnerability and unsent payment produce recognizable chemistry. The game contradicts its own no-biting/five-hit spar and ICE PACK choice, and assumes Rich’s cat. Repair015/016/036 before optional new poses. Her4th scene’s respectful untouched phone is a better payoff than a generic affection meter.

**Rosalyn:** SAME→fandom tangent→glasses flight→roach crisis→disagreement/kiss is the clearest concealed-self arc. The awkwardness earns its length. Approved dark/lit home and exact roach derivative are present; earlier historical missing-art notes are obsolete. The meta-lighting interruption is a taste decision, not an objective defect or permission to paraphrase supplied Rich lines.

**Emerald:** Chores→study/remittance→asking for help→recital creates a strong reciprocal relationship, with family duty continuing after the kiss. The false ASK/WAIT branch undermines initiative; the recital deserves a clear performance/audio beat using existing Shrine framing. Neither requires a new quest. Baba stays intentionally off-screen.

All twelve scenes were source reviewed; ten paths completed via normal controls after thresholds, two combat boundaries resumed from checkpoints. Only actual Roxy spar/Blood Bath and Gbenga4-turn retirement battle were played here. Threshold fixtures are not proof of natural spending pace, date availability notification discoverability or every combat outcome.

## Continuation and save boundaries

Once-only adventure enter effects use `applied`, completion writes records/memory/receipts and clears active. F15 payOnce and completion guards prevent repeating approved expenses. The saved Roxy door/applied list and money survived reload+explicit resume; this was a completed-expense checkpoint, not a fresh debit experiment. Normal title/start resume is source traced through bedroom’s active-adventure handling. Real club debit/lastVisitDay survived reload; Day2 performer is Rosalyn, so probing Roxy alone is not a failed support attribution.

Remaining gaps: interrupted PLAY restore, natural returned tribute/impound, all three natural endings, daily welfare edge cases, VIP9, continuous music listening and frame-perfect scene guards. Open source has enough evidence for a review plan, not RC4 acceptance.
