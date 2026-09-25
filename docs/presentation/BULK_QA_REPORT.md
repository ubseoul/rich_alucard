# Presentation Director — bulk migration QA checkpoint

Branch `claude/presentation-director`. It isn't merged or deployed. This report is spoiler-safe: metrics and assessments only. Captures are regenerated with the census and sweep tools into `work/presentation_census/REVIEWER_ONLY/`, which git ignores and which is player-blind.

**Recommendation: PASS for HQ review.** The generic architecture carried all four waves without scene-specific layout code. Every exception is a data entry with a ticket.

## Sync
- Merged `origin/main` b8ab4fe (Art Ship 007) before migrating. Art Ship 007's frozen art isn't runtime-integrated, which is a separate Engineering change.
- Frozen assets: the register has 313 entries (173 frozen), with 0 hash mismatches. There are no asset or Art Department changes against `origin/main`.
- HQ-approved pilot screens (docks, throne, curb at 360/390/430) are pixel-identical to the approved pilot after every wave. The Combat 2.0 fixture changed intentionally: its command panel now fills the band.

## Coverage

| Wave | Scope | Result at 360×740 / 390×844 / 430×932 |
|---|---|---|
| 1 | All adventure screens (94 distinct across 315 nodes) through the adapter | 94/94 pass live lint in the real scene; 5 accepted exceptions (PD-W1-01…04) |
| 2 | All Combat 2.0 fights (17 fight × environment screens) | 17/17 pass live lint |
| 3 | Desire Trip curb and stargazing, docks story and Supra payoff, Property exterior and interior, Rave interior and exterior, bedroom hub, UI-only cards (trip travel/return, character reveal) | Complete census, 33 scene×size rows: lint, runtime variants, effects playback and aspect integrity all green |
| 4 | Property interior talk/inspect choreography | Both beats pass; PD-W3-01 narrowed to the inspect beat |

**Real player paths:**
- New game → prologue → throne fight → victory → bedroom → character reveal → Desire Trip loop: the screen keeps one shape throughout, and there are no page errors.
- An adventure fight played to victory and back.
- An adventure-launched minigame at a true 9:16.
- No leftover Director state across scene changes.

**Release gate** (`npm test` / `build` / `verify:artifact`) passes in a clean checkout. It enforces:
- the locked hero framings across their runtime variant matrix
- the Wave 1 regression lock over all 94 adventure screens
- the Wave 2 regression lock over all 17 fights
- asset metadata against the frozen register

## Defects found and fixed during the waves
- **Minigames stretched (Wave 1 regression).** Adventure-launched minigames were stretched to 2.16:1 on the tall screen. The minigame stage now keeps 9:16.
- **Full-screen effects stretched.** Full-screen authored effects (impacts, bite jaws, octopus tentacles) were stretched on tall screens. They now use aspect-preserving cover. The tentacles were already stretched 33% in legacy.
- **Legacy transform displaced the trip sprite.** A new placement lint compares each actor's rendered position with the camera's, which catches this class of bug everywhere.
- **Rave dialogue and choices overlapped.** The Director now stacks the UI band for every scene.
- **Combat 2.0 environment functions never resolved.** Two fights rendered without a backdrop.
- **The unadopted throne room layer stretched under other scenes.** It's now hidden.
- **Combat 2.0 lint was silently skipped** after Wave 3e, because a `ui` option collided with the new UI-only flag. This QA pass caught it. The flag was renamed, and the sweep is back to 17/17. Game behaviour wasn't affected.

## Open tickets (all data exceptions; see NEEDS_CREATIVE.md)
- **PD-W1-01…04:** four wide-cast adventure screens (three- and four-person line-ups, mostly in placeholder environments). The full-width frame lands between the establishing and conversation bands. They resolve through environment art integration or an authored override.
- **PD-W3-01:** Property interior, inspect beat only. Every hotspot must be in frame.
- **PD-W3-02:** Rave interior. The HQ-accepted wide composition is 10% under the conversation reference. Tightening it is a creative decision.

## Remaining weaknesses and risks
1. **Placeholder art dominates many adventure screens.** Dead space and size on placeholder actors and environments are marked PROVISIONAL and should be re-checked when art is integrated. The Wave 1 lock will show exactly which screens change.
2. **Out of scope by HQ direction:** desktop 9:16 presentation, and dev-only pages (party foundation, rave review, minigame lab).
3. **Wide-shot gap:** on full-bleed 270×480 environments the camera can't zoom out past full width. The environment's depth scale therefore sets the widest possible shot, and some wide casts fall between the establishing and conversation bands.
4. **Adventure sweep page error:** it logs one out-of-order-jump content error (a null person in a W2 line function), which comes from the census jumping to mid-adventure nodes. It isn't a Director issue and doesn't occur in real play order, but it's worth a content-side null guard.
5. **Judge process:** judging used sealed candidate keys from Wave 3 onward. Two locks (pilot docks and throne) predate sealing, and their history is recorded.
