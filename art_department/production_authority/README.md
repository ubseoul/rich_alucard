# Before the Fame — Art-facing production authority

This directory is the repository-readable OPEN visual/canon subset for future Art Agents. It exists so a fresh agent can work from the repository alone; Ube does not need to re-upload the source packets.

## Authority and provenance

| Repository reference | Original source | Source/version/date | Repo treatment | Source SHA-256 |
|---|---|---|---|---|
| `VOL2_CHARACTER_VISUAL_BIBLE_OPEN.md` | `Rich_Alucard_BTF_Vol2_Character_Visual_Bible.docx` | Vol 2 — Character & Visual Bible; embedded revision 1; created/modified 2026-09-24 | Art-facing OPEN subset and structured mirror; sealed references omitted | `d841fafe94a8440f827b34c36b1beb37181150f1f992b846e6e248bd65f2d4c5` |
| `VOL5_OPEN_VISUAL_ADDITIONS.md` | `Rich_Alucard_BTF_Vol5_Dragon_Maggi_Cube.docx` | Vol 5 — The Dragon Maggi Cube; embedded revision 1; created/modified 2026-09-24 | Art-facing OPEN subset and structured mirror; Vol 5-S material omitted | `023132bed8847179494660ecd05e4881f0f539cea328eb5dbe8760e7284a3280` |
| `HQ_PRODUCTION_ADDENDUM_OPEN_ART.md` | `Rich_Alucard_BTF_HQ_Production_Addendum_v1.docx` and accompanying `.md` | HQ Production Addendum v1; repository baseline in source text is historical | Art-facing OPEN execution subset; HQ-M01/M02/M03 and sealed material omitted | DOCX `d78466f8215c902d5fed046425563d8c112b4ad4f518c6c0d9961976eb0c0cf9`; MD `aeb9f21a69e9d774da5982ccbcbd6545593d3f65c410479a3b01e7b7186d9f36` |

The complete source packet ZIP is provenance only: `Rich_Alucard_BTF_Rough_Complete_OPEN_Packet_v1.zip`, SHA-256 `b5be1445fda7501b7e5ca9f3820a5c82aa4aa4e3b0b5e9327b54c9305140072`. Future agents must use these committed subsets and current repository records, not the external packet.


## How to use this area

1. Start at `art_department/START_HERE.md`.
2. Read `CURRENT_HANDOFF.md`, then this directory's three source subsets.
3. Treat `art_department/APPROVED_ASSET_INDEX.md`, `ASSET_REGISTER.json`, and frozen Ship manifests as pixel authority.
4. Use `CURRENT_OPEN_ART_GAPS.md` / `.json` for current demand. Historical `docs/btf/ART_INPUTS.md` is an audit source only.

The subsets preserve source intent without silently rewriting canon. Where a source leaves a name, likeness, staging, or taste decision to Ube, the subset says so. Where a source marks content GUIDED, PLAYER-BLIND, SEALED, or HQ-only, this repository area records only the boundary and does not reproduce the restricted material.

## Frozen-pixel rule

Once an asset is frozen, its canonical bytes, `ASSET_REGISTER.json` entry, and `APPROVED_ASSET_INDEX.md` entry are the authority. A review board, candidate, generated image, or runtime placeholder can never become style authority by existing in the repository.
