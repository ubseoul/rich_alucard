# Frozen-art integration — open HQ decisions

Spoiler-safe: ids, surface keys and runtime evidence only.

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
