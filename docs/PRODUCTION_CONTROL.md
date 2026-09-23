# Rich Alucard — Studio Production Control

**Mode:** production operating model  
**Current production build:** `a2b1b8246fd15836fe3904704c9fc21094ebfc83`  
**Core Foundation Season:** FROZEN / PASS  
**Current milestone:** RICH'S LA #001 — OGUN'S RAVE  
**Current status:** PRE-PRODUCTION / PRODUCTION CONTROL  
**Next production step:** HQ-controlled integration review of accepted ENGINEERING 01: Party Foundation. No merge, push, deployment, actual story implementation or next milestone is authorized.

**ENGINEERING 01 decision:** HQ PASS / UBE FUN PASS for the attending-party interaction model. The isolated DEV prototype is accepted as a system concept; its temporary situations, writing and visuals are non-canon and are not frozen production content. See `PARTY_FOUNDATION_REVIEW.md`. The milestone status above describes the broader story, which remains unimplemented.

This document preserves how Rich Alucard work moves between Creative Direction, HQ, Artist and Engineer/Codex. It does not change canon, gameplay, runtime behavior, art, saves or deployment behavior.

## Roles

**Ube — Creative Director / Player** owns canon, taste, fantasy, major character/environment identity, veto power and the final experiential FUN PASS. Ube should not be required to judge technical correctness.

**HQ — Game/Product Director** owns roadmap and sequencing, feature scope, system boundaries, art direction, spoiler classification, cross-discipline integration, acceptance/rejection of Artist and Engineering work, and the decision that work is ready for Ube.

**Artist** executes approved visual briefs, maintains Visual Style Bible compliance, creates requested production assets/states, provides visual QA evidence and may make bounded execution-level visual decisions inside an approved brief. Artist may not independently invent canon, invent gameplay, redesign characters, establish new lore or change approved/frozen assets.

**Engineer / Codex** owns architecture, implementation, integration, persistence, testing, tooling and deployment. Engineer may not independently establish canon, establish art direction, create final production artwork, redesign approved visuals, expand product scope or begin future milestones.

Artist and Engineer do not manage each other. Both report completed work to HQ.

## Authority levels

- **Ube-only:** anything that materially changes canon, player fantasy, player experience, approved visuals or feature scope.
- **HQ:** product, system, pacing and integration decisions that do not redefine locked creative identity.
- **Artist:** bounded visual execution decisions inside an approved brief/style.
- **Engineer:** internal implementation decisions that preserve the approved product contract.

When uncertain, escalate rather than invent.

## Production states

`DRAFT → AUTHORIZED FOR PRODUCTION → READY FOR HQ REVIEW → PASS or NEEDS FIX → FROZEN`

Specialists cannot mark their own work PASS or FROZEN. Only HQ may do that after reviewing evidence. Ube supplies a separate experiential FUN PASS when applicable.

Once an asset, system or canon decision is FROZEN, downstream work must treat it as immutable. Future changes require an explicit delta request that identifies what may change, such as: “Keep the approved asset identical. Change only runtime scale from 1.25× to 1.75×.” Never silently improve frozen work.

## Production Cards

Production Cards are for meaningful cross-discipline features/assets, not every tiny task. Keep them short and useful.

A card should include: feature/asset name, production ID, status, owner, current milestone, player purpose, canon constraints, authority level, spoiler classification, inputs/dependencies, required output, frozen elements, owner may decide, owner may not decide, art requirements where applicable, engineering requirements where applicable, Stage Contract requirements where applicable, persistence requirements where applicable, acceptance criteria, required evidence, known deferrals, HQ decision and Ube FUN PASS where applicable.

## Spoiler classifications

- **OPEN:** Ube may see all production details.
- **GUIDED:** Ube establishes fantasy/constraints; HQ fills execution details.
- **PLAYER-BLIND:** Ube establishes premise/boundaries; hidden encounters, consequences, surprises and branches remain concealed.

Completion reports for PLAYER-BLIND work must not spoil hidden content. DEV tooling should avoid unnecessarily revealing hidden content during player testing.

## QA ownership and evidence

Completion is a claim. Evidence earns acceptance.

Engineering evidence may include tests, browser path, screenshots, build identity, deployment verification and state inspection. Art evidence may include native asset, enlarged nearest-neighbor preview, state sheet, anchor/contact diagram and in-game composition preview. HQ decides which evidence is required for each Production Card.

Functional QA is primarily Engineering/HQ. Visual QA is primarily Artist/HQ. Product/integration QA belongs to HQ. Experiential/Fun QA belongs to Ube. Ube should not become the primary detector of engineering or visual-production defects.

## Current locked creative direction for RICH'S LA #001 — OGUN'S RAVE

Known direction: Ogun's vampire rave, Meatpacking District, attending-party mechanic, dance loadout concept, Bllad33 later in arc, blood sprinklers later, Rich hates blood in his locs, later outside sequence and eventual Castle Party Hosting unlock.

Do not expose PLAYER-BLIND implementation details here. Do not begin Ogun's Rave implementation until HQ accepts production control and authorizes the next production step.

## Release-readiness checklist

Before work is sent forward as ready, verify the relevant items:

- serves Current Rich
- authorized scope only
- canon respected
- spoiler classification respected
- approved assets only
- Visual Bible compliant
- correct native dimensions
- anchors/scales documented
- actual gameplay presentation inspected
- no unauthorized regeneration/modification
- acceptance requirements implemented
- deterministic tests green
- relevant browser/player paths tested
- save compatibility safe
- lifecycle safe
- no known blocking regression
- exact artifact deployed when deployment is required
- public build identity verified when deployment is required
- HQ has reviewed integration
- build can be opened normally
- PLAYER-BLIND details remain hidden where required
- Ube receives only information necessary to play/test
