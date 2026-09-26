# Frozen-art integration — open HQ decisions

Spoiler-safe: ids, surface keys and runtime evidence only.

## HQ-AS10-01 — PD-W1-04 layout exception retired (Rich resolved, cast still blocked)

**Status:** LAYOUT RESOLVED / SCREEN STILL HOLD. ART SHIP 010 supplied `rich_portobello`'s real frozen geometry (80×96,
narrower than the Rich-proxy metrics HQ-AS9-01 measured). Re-running the existing generic, metadata-driven Director
solver (no per-screen authoring, no tuning) against the live cast — real Rich + still-placeholder
wife/kid1/kid2 — now clears the shot-size/shot-consistency checks at 360/390/430 without the `EXCEPTION-LAYOUT`
staging HQ-AS9-01 recommended waiting for. `node tools/presentation-adventure-dryrun.mjs --write-lock` confirms this
(the release gate itself refuses a stale exception entry, so it was removed from `js/data/presentation.js` and the
regenerated Wave 1 lock). Visually confirmed in-browser at all three sizes: all four figures stay on-frame, none
clipped or overlapping.

This is **not** option 2 or 3 from HQ-AS9-01 (no consistency exception was accepted, no two-shot was authored) — it
is option 1 (wait for real cast, re-run the Director), reached earlier than expected because only Rich's geometry
needed to change to clear the floor. The screen's PASS/HOLD **status is unchanged**: it stays **HOLD** under NC-FA-07
because `portobello_wife`, `portobello_kid1` and `portobello_kid2` are still RAPixel placeholders — BLOCKED BY CANON,
no committed visual card exists for any of them. When their real art eventually lands, the Director should be
re-run once more (their real geometry may shift the compaction again); no further exception is anticipated but this
is not guaranteed until that art exists.

## HQ-AS9-01 — PD-W1-04 Portobello four-actor staging (historical; layout question resolved by HQ-AS10-01)

**Status:** OPEN — HQ/Presentation decision. The screen stays HOLD (also NC-FA-07 cast art).

**Screen:** `portobello_bedroom|farRight:portobello_kid2,left:portobello_wife,mid:rich_portobello,right:portobello_kid1` (A30 `breakfast`; narration names both kids; the wife speaks, then Rich).

**Evidence.** Measured on the frozen ART SHIP 009 bedroom master at 360/390/430, contact y=372. The four figures are RAPixel placeholders, so the Director measures them with Rich-proxy metrics.
- Generic default: the four slots compact to 83/135/187/227. Body 0.359 is in the conversation band, but it is 8.5% under the consistency reference, so it fails.
- Authored conversation with all four focal: body 0.322. Fails size and consistency.
- Establishing: 0.274, between bands. Fails.
- Rich + wife focal only: lint passes (≈0.41), but both kids leave the frame.

**Options**
1. **Recommended: wait for the Portobello cast art (NC-FA-07), then re-run the generic Director.** Real kid sprites (content height 0.55–0.6) give slot compaction slack that the Rich-proxy doesn't. Staging authored against placeholder metrics would have to be redone.
2. Accept `shot-consistency` for this beat, like PD-W3-02: keep the generic 0.359 four-shot, which is in band but 8.5% under the reference.
3. Author a Rich + wife two-shot for `breakfast`, with the kids off-frame and carried by narration only. This changes what the beat stages, so it's a creative call.

No Director change was made. The exception entry is unchanged. **Update (ART SHIP 010): see HQ-AS10-01** — option 1 happened for Rich's geometry only; the exception entry was retired because the screen now lints clean, but the screen itself stays HOLD on the remaining canon-blocked cast.

## HQ-AS8-01 — HOOKAH default company visual (Rookoko `default_alias`)

**Status:** DECIDED — HQ chose **Option 2 (HOMIES)**.

**Decision as implemented:**
- A41 `roofgame` passes `company:'HOMIES'` explicitly, since the beat stages the crew.
- Rookoko is **not** a default alias. `AS8-ROOKOKO-HOOKAH` stays reserved for beats that explicitly author ROOKOKO.
- Crew seated visuals are NEEDS CREATIVE **NC-FA-11** (`docs/presentation/NEEDS_CREATIVE.md`).
- The `minigame:hookah?company=HOMIES` surface stays HOLD until that coverage exists and passes runtime review.
- A launch without a company still falls back to the ROOKOKO line set with no figure. No content beat uses that path now.

**Question:** When the HOOKAH minigame is launched without a `company` param, should a companion be drawn? If so, who?

**Background.** The ART SHIP 008 Engineering Asset Map records `AS8-ROOKOKO-HOOKAH` with `default_alias: true` (surfaces `minigame:hookah?company=ROOKOKO` and `minigame:hookah?company=default`). Art recorded this as a proposal only and asked Engineering to verify it against runtime/content intent.

**Runtime/content evidence**

| Evidence | What it shows |
|---|---|
| `js/minigames/hookah.js`: `const company=params.company\|\|'ROOKOKO'` (since the W0 feel batch, commit f9a696c) | The code falls back to the ROOKOKO **line set** (companion dialogue lines). Before this integration no companion was drawn for ROOKOKO. Only BLLAD33 and DATE had figures. |
| A21 `HOOKAH` (w3.js) | Passes `company:'BLLAD33'` explicitly. The default is not used. |
| A41 `roofgame` (w4.js) is the **only** content caller that uses the default (`params:A=>({})`) | The beat narrates "the crew is already up here", the choice is "HOOKAH WITH THE CREW", and the date is on stage. Rookoko is neither named nor staged in the beat. The minigame already has a separate `HOMIES` company whose line set is written for a crew. |
| No content beat passes `company:'ROOKOKO'` | Rookoko's hookah hangout isn't currently authored anywhere. |

**Determination.** The runtime establishes ROOKOKO only as a mechanical fallback for the line set. It doesn't establish Rookoko as the intended default companion. The one beat that reaches the default contradicts it, because the content stages the crew and the date. Drawing Rookoko there would add a cast member the beat doesn't stage, so the alias was **not** made permanent.

**What shipped at `98ff0ac` (before the decision)**
- `minigame:hookah?company=ROOKOKO`: the frozen Rookoko seated state is drawn when a beat names ROOKOKO explicitly (integrated, PASS).
- `minigame:hookah?company=default`: Rich is drawn alone and the existing ROOKOKO line set is unchanged. Matrix surface status is HOLD (HQ-AS8-01).

**Options that were put to HQ**
1. Accept Rookoko as the default companion. This is a one-line runtime change: draw on `company` instead of `namedCompany`.
2. Have A41 pass `company:'HOMIES'` (crew line set). This is a content change. Crew figures would still need Art: a NEEDS CREATIVE ticket for crew seated states.
3. Keep the default companion-less. HQ would accept Rich alone for the crew roof and close the surface.
