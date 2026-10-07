# Current working baseline — Claude checkpoint

Recorded October 7, 2026 (America/New_York).

## Creator instruction

> can you make this current point of the game our current point from claude and lets start from this base line

This selects a working starting point. It does not declare the game bug-free, release accepted, or OL-085 complete.

## Pinned source pair

| Repository | Permanent baseline branch | Exact commit |
| --- | --- | --- |
| rich_alucard | baseline/rc5-claude-20261007 | 0035a6553d189cc9e337f48911372510f3540ae8 |
| rich_alucard_hq | baseline/rc5-claude-20261007 | dabca0e47428fb202cb4c88d8a6dce9eba676ac5 |

Use these exact commits for future isolated repair branches. Never advance, reset or force-push the baseline branches. Preserve existing refs and original art. Private payloads stay in HQ or the private play deployment, never the public repository.

## Claude's published changes above 79408f3

- ae054df: restore Maps access to Atlanta/Powder Springs butter-chicken trip after Ogun's rave.
- d155504: bedroom and throne adventure floor positions adjusted; before/after image evidence included.
- 0035a65: phone-sized title, duplicate cash/HOME controls, zero-dollar cards, club feedback placement, adventure title contrast, canopy title and dance rule text fixes.

Actual diff: 11 runtime files and 8 evidence images. No private changes on final-refine above dabca0e.

## Unfinished scope and verification

- OL-085 step 3: octopus prologue removal NOT implemented; move remains present.
- Step 4: full days 1–5 clarity/pacing review NOT established.
- Step 5: main-path script-sense review and changed-lines list NOT delivered.
- Adjusted grounding is not proof that every scene is correct. User reports substantial bugs; these require reproduction rather than dismissal based on geometry tests.
- OPEN artifact verification, loader verification (253 scripts), and private overlay verification passed during checkpoint packaging.
- Clean Linux npm test fails at F02 import casing. A local, temporary case alias plus fetched preservation refs allowed 213 PASS lines before another f04/F04 import failure. No full-suite pass claimed; alias removed; public tree left clean.
- Browser installation failed in this environment; no independent fresh browser playthrough or real-device verification claimed.

## Current private playable checkpoint

URL: https://rich-alucard-rc4-ube.princeube.chatgpt.site

Game build: ra-0035a6553d18-20261007142323.

Hosting source: 85a03fc690818f3609352d9db9a3b1ccfd638685; deployment succeeded. Existing private audience preserved. Packaging reused verified unchanged private payloads, replaced the HQ pack with its exact Git blob, and retained the prior same-duration PCM16 hosting adaptation for one oversized WAV. No game source changes were made during packaging.

## Next-work discipline

Preserve this checkpoint. Diagnose actual player-visible regressions before repair. Make bounded repairs on new branches from the source pair above; record expected versus observed behavior and before/after evidence. Do not substitute old audit runtimes, start a broad rewrite, or replace the playable deployment without completing the relevant actual-game checks. New user instructions govern future changes.
