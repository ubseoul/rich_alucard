# RC3 Build C · OL-074 · Voice pass

## Integration status

Build B appeared during final validation and is now merged. Ordered base merges on `rc3/voice-001`: `origin/rc3/cut-001` (174e3eadc430f29c445b5df9d7f4372252fd8324), then `origin/rc3/club-001` (0fdca7596cce6512dfa217af038f0a9fce58d531). Integration commit: e041b8b.

Voice changes were saved while merging B, then reapplied. Additive A/main conflicts retained both package scripts, both workflow checks, and both art-department instructions. B owns the rave state machine, rhythm/combat progression, club rotation/target/encore/VIP and PLAY presentation. Those mechanics and B regression checks are retained; C changes prose and presentation hooks. Rave conflicts use B's five phases and progression; club conflicts preserve B's mechanics with C's greetings and reactions. The max-hype sheet line is attached to B's actual encore event.

## Counts and scope

- **20/20** supplied lines placed verbatim, with contextual live hooks on the combined build.
- **28/28** blank slots authored: dancer greetings and amount reactions, Rich fight lines, enemy barks, daily guidance, end-of-night captions, wild barks.
- **203 cuts**: 11 kept-adventure boxes, 73 date dialogue boxes (Roxy 28, Rosalyn 25, Emerald 20), 119 bark slots.
- **823 rewritten text units**: 669 adventure/date/rave/later-story/common-copy units and 154 bark slots.
- Bark pool: 275 source slots -> 168 (154 rewritten, 2 prior Ube lines preserved, 12 new). These are source slots, including duplicate values, not unique strings.
- **221 protected Nigerian lines retained**, word for word. Existing 29 authored date lines, the authored date thought, and the protected Roxy quote remain intact.

A text unit is a dialogue/narration box, keyed bark, or public-copy field, not a physical source line. A combined rave dialogue field counts once. Mirrored UI data counts at each edited source slot. Supplied-sheet placements are counted separately; a rewritten field containing a supplied line can also be a rewrite. New shared 21–48 declarations and wiring changes do not inflate rewrite totals. Counts were recomputed for B’s five-phase rave; obsolete pre-B phase rewrites are excluded. `voice-audit.json` provides the individual before/after records; code-only changes and no-ops are excluded.

The pass covers the combined Build A kept map, NEW OGA non-protected prose, rave, F15 dates, shared barks, club presentation, phone guidance, and late NEW OGA/finale prose. Parked adventures and frozen gameplay/asset contracts were retained. Functional labels and explicit amounts remain legible. Protected NEW OGA boxes account for intentionally unchanged formal prose.

## Supplied lines

The numbered sheet is the authority for #7: **whats haddenning**. #13 retains **O ma ṣe o** exactly. BLAD33EE remains the hunter identity. Build B’s BLAD33EE rhythm-to-fight sequence retains the exact reaction.

| # | Exact line | Placement |
|---|---|---|
| 1 | damn im tired as fuck | Day 1 wake notice |
| 2 | im broke as fuck i need funds | Day 1 VampGPT opening |
| 3 | this shit couldnt cover fly shoes | Day 1 VampGPT opening |
| 4 | all that work for beans? | A08 first shift return home |
| 5 | damn i move like tony now | first PLAY jobs panel |
| 6 | yall listen to carti? | Ogun rave arrival |
| 7 | whats haddenning | Ogun rave greeting |
| 8 | never met vampire ogas who listen to country | Ogun rave first floor beat |
| 9 | oh shit, that's Blad33ee! | BLAD33EE rave entrance |
| 10 | here we go again | Build B hunter arrival immediately before fight |
| 11 | say big bro, gonna need to leave that here | NEW_OGA_M1 robbery table |
| 12 | please man you cant do this i need this for my student loans | NEW_OGA_M1 Jug response (smallie actor) |
| 13 | O ma ṣe o | NEW_OGA_M2 first voice line |
| 14 | i own land uncle castle even | NEW_OGA_M2 FLEX response |
| 15 | the only reason i dont open the blinds to show you the sun is because my rags are in the wash | NEW_OGA_M2 FLEX roast |
| 16 | damn this shit is like magic city | F06 club entry |
| 17 | dance for me dance! | F06 first paid throw |
| 18 | why are they leaving? | F15 maximum hype / encore |
| 19 | wait one more round | F06 out-of-funds/error response |
| 20 | gonna make it rain like hell | CLUB_FIRST + F06 first-visit terms |

## Blank slots

21–23: Roxy/Rosalyn/Emerald greeting, on selection and after dancer art loads. 24–26: big throw (at least $1,000). 27–29: cheap throw. Date-unlock notices take priority over throw reactions. 30: pre-fight Rich line; 31–32: Rich combat bubbles; 33–35: relationship-specific enemy barks. 36–40: next-step guidance. 41–42: day-end and sleep captions. 43–48: wild bark pool. Exact copy lives in `tools/rc3/voice-slots.json`.

## Ten before / after samples

| Before | After |
|---|---|
| behind the register, on its own chair: a yam the size of a toddler. | a yam got its own chair before you did |
| that is not a vegetable. that is a commitment. | this a dependent |
| my feet hurt. worth it. | feet hurt funds barely worth it |
| kevin. all of them. kevin. | all forty named kevin mama ran out of ideas |
| a church with a gun shop in the back. of course. | church got guns grace came with recoil |
| a hungover skeleton. of course there was a hungover skeleton. | skeleton hungover how he got a liver |
| one more turn. every time. forever. | one more turn bro its tomorrow |
| The nameplate says VICE PRESIDENT in gold. | gold nameplate vice president rent finally scared of you |
| a guy in line is whispering to his taco. it seems to be going well. | bro whispering sweet shit to a taco |
| it is called not going broke on your first night. | we trying to keep you off gofundme |

## Validation

- Loader sync -> verify: PASS, 246 scripts, deterministic order.
- Integrated 390 x 844 real Chrome browser: PASS. Fresh save, normal timings, actual pointer/keyboard actions. Prologue first fight: 18.137 seconds. Build B rhythm -> BLAD33EE fight -> exterior -> first club night with paid throws -> sleep -> day-two Jug entry. Zero browser errors.
- Integrated browser asserts all five exact rave lines plus the club entry, first-visit bankroll line, and first paid-throw line. Evidence: `voice-evidence/browser-path.json`, 11 screenshots, `voice-browser.log`.
- Final full npm test: pending.

Earlier failures corrected: missing RC helper import; source-wording expectations updated to the new VampGPT/finale/date conversations while retaining speaker/order and choice assertions; browser voice assertions changed to inspect the club shadow-root status rather than body text. The finale phone-only-role check caught a rewrite aimed at Rich; it was corrected to target the crew, preserving the original encounter facts. Emerald’s recital-sheet-music identity is explicitly retained in the rewritten lost/found lines and the regression assertion. The integrated browser captures the hunter arrival before clicking FIGHT so the short reaction is recorded.
