# Stage 4 · Authored world reactions and lived money

Authority: OL-054 and OL-055/056/057, Baseline V1B creator answers, master packet §2. North star: “vampire lost gameboy game by a horny mad man”. Parked audit: annotated `preserve/world-reaction-pass`, underlying commit `b7bd4392d6ed771595343b6701c645bd05762187`, `docs/world_reaction/WORLD_REACTION_PASS_001.md`. Its C2/C5/C6 and M12 are now wired with existing state and existing words. No PLAYER-BLIND scene contents were inspected by this pass.

| Connection | Preserved base | Current build | Proof |
|---|---|---|---|
| C6 rave handshake | Reads unwritten `ogunRaveDone` | Reads canonical `ogunsRaveCompleted` | Canonical prerequisites followed by actual Day16 sleep; offer becomes available |
| C2 morning after a PLAY | Night report is built but unshown | Existing F04 section enters Morning Mail, once, after sleep | Same stored report text and amount; wake replay cannot duplicate; idle night cannot replay stale report |
| C5 returned crew | PLAY result has no bedroom consumer | Active Tunde/Dre from previous-night report can use existing homie asleep-floor pose | Active returned Tunde selected; downed Dre excluded; earlier woman/party candidates keep priority |
| M12 fame closure | Reads unwritten `life.fame.arrived` | Reads actual `life.momentum.fameFired` | Eligibility alone leaves route active; accepted fame marker closes route |

Automated regressions: `tools/tests/f13/world_reaction.test.mjs` PASS and `tools/tests/f13/surfacing.test.mjs` PASS. `reaction-before-after.json` is a seeded fixture comparison, distinct from the fresh-save career population in [Stage 5](../stage5/index.md). Existing report formatting, including `Cash $-50.`, is preserved verbatim.

Money already changes the world through priced rooms with verbs, car deliveries, owned props, receipts, Shannon's rent, and the RICHBOI unlock. The paired career audit measures those actual purchases. A committed pilot with the actual clock, authored prices, real F01 results and no free ownership reached PARTY HALL on Day25, URUS on Day29 and FISH TANK ROOM on Day32 before its Day36 ending. That pilot used the earlier surfacing ordering and is a feasibility observation, not the final paired measurement; its raw save trace is `stage5/pilot-committed.json`. The final tables supersede it.

The one-more-day change uses existing invitation windows. WHAT WE ON preserves story priority, surfaces addressed invitations, reserves visibility for one first visit, and brings soon-expiring asks forward. GO SOMEWHERE brings unvisited authored activities forward. The four-card money/people lane rotates familiar choices across days. Generation cadence, weighted lottery, cooldowns, expiration spans, four/six-card caps, prices, rewards, relationship decay and ending thresholds are unchanged. The existing A46 repeat-after-cooldown proof passes.

`surfacing-before-after.json` records identical isolated display-cap fixtures against preserved base and current. These are seeded UI logic probes with test-only labels, not career exposure or added canon:

| Display observation | Preserved base | Current build |
|---|---:|---:|
| Older first-visit invite, behind six newer repeats plus story priority | omitted | visible |
| WHAT WE ON card count | 6 | 6 |
| Story-priority entry first | yes | yes |
| Distinct eligible money-lane entries surfaced across12days (8eligible in fixture) | 4 | 8 |
| Maximum lane card count | 4 | 4 |
| Unvisited place position in the same eligible list, zero-based | 15 | 7 |
| Locked place surfaced | no | no |
| Day1/15/35 generation cadence | original | identical |

## Source and creator work still needed

| Parked item | Exact missing authority or ownership |
|---|---|
| C1 authored F01 VampGram line; C3 all crew texts | Additive F01 result contract fields; F01 owner and feel-lock exception |
| C4 Nodd stare, C7 Bllad33 hookah line, C8 Nneka quiet | HQ/Vol7 authored reaction lines; existing flags alone do not authorize invented copy |
| C9 Trap “PEOPLE NOTICE” | Ube's five lines/silence decisions: Nneka, Bllad33, Tristan, Mom, Carlos |
| C10 elder address per scene | Existing address ladder, but scene-specific replacement words require creator source |
| C11 wrecked/impounded ownership mirror | Cross-fragment owner ruling; F04 deliberately leaves life ownership intact |
| C12 first underworld receipts; C13 PLAY song memories | Ube's inclusion rule and captions/short memory text |
| C14 Marisol after castle defense | Ube's line or action; F05 traphouse fiction separately source-owned |
| C15 state-aware family; C16 budget scale; C17 wealthy VampGPT | Ube's family and money voice variants |
| C18 BIG TIPPER / BING | Authored threshold from RAINMAKER OPEN patch, plus outside-F06 reaction source |
| C19 ON FIRE fiction | HQ/Vol7 source; no invented tier labels or crisis fiction |
| C20 call aftermath | Ube/F01 owner's authored callback and allowed wire contract |

No substitute canon was written for these items. F01 and F06 executable locks and frozen art remain outside this pass.
