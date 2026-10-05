# F15 VELVET ROTATION — OPEN RULING EVIDENCE

**Status:** CANONICAL RULING EXCERPTS & EVIDENCE BASE  
**Date:** October 1, 2026  
**Scope:** Progression, Date Cadence, Financial Boundaries, and Launch Architecture  
**Exclusion Note:** All SEALED/private materials (including H1 restricted voice, Vol 4, and player-blind packets) are strictly excluded.

---

## 1. Primary Authority Rulings (Verbatim Texts)

### A. Creator Ruling (Ube — October 1, 2026)
*Source: `rulings/CREATOR_RULING_2026-10-01_F15_LAUNCH_ROSTER.md`*
- F15 launches with **Roxy**, **Rosalyn**, and **Emerald** only.
- All three dancers are available on stage **every WAKE**.
- The player chooses which dancer to support.
- The older Rainmaker §5 four-from-ten rotation is dormant for this launch. The trio is not assigned Common/Rare/Legendary pool tiers.
- Ten-dancer roster remains deferred.
- Supersedes conflicting launch-roster and rotation instructions in older handoffs and OL-029/OL-031 summaries.
- Old tier-placement D1 is resolved as **not applicable to the three-dancer launch**.

### B. Creator Source 001 (Ube — Binding Canon for F15)
*Source: `source_vault/relationships/F15_VELVET_ROTATION_CREATIVE_AUDIT.md` §0.2*
- **Date Cadence:** At most **one F15 date per WAKE** globally.
- **Financial Invariant:** **No club income.** Nothing in F15 pays Rich, refunds Rich, or creates dancer favor currency (preserves F06 port's "no payout" rule).
- **Character Invariant:** No vampire conversion or vampire bite on F15 dancers.
- **Minigame Feel:** Reuses F06 Make It Rain approved core and tunables byte-for-byte (30s rounds, $100 bills, 120 BPM beat, spotlight, fan, streak up to ×5, RAIN SCORE). F15 adds presentation and attribution only.

### C. Packet OL-031 Decision 3 (Overlord Authority)
*Source: `PACKET OL-031 · Startup checks — all forwards answered` · Decision 3*
- **Spend Attribution:** All money spent on a dancer counts toward progression, including floor bills thrown during dances.
- **Wardrobe Tiers vs Lifetime Levels:** Per-dance wardrobe tiers (Tier 1 full costume → Tier 2 reduced costume → Tier 3 reference two-piece) are distinct from lifetime "She fw Me" levels.
- **Progression Non-Regression:** Dancer relationship / progress levels never regress.
- **Tunables:** Level thresholds are F13-tunable (proposed by Underlord, approved by Overlord).
- **Club Environment:** The Bing interior reuses existing club environments or becomes an R4 art ticket.

### D. Packet OL-026 (Asset Format Authority)
*Source: `OVERLORD HANDOFF — through OL-029.md` §3*
- "Dancer videos are Ube's PIXEL dancers, not real people. Videos are the stage loops; convert to hard-pixel sprite sheets or web video; originals to private HQ; no restyling."

### E. Packet OL-027 (Evaluation Lens & Money Loop)
*Source: `OVERLORD HANDOFF — through OL-029.md` §3*
- Pixel art is dancer design authority.
- Existing money loop applies; no club-income system.

---

## 2. Distinction: Canonical Rulings vs Ledger Summaries

| Element | Primary Authored Ruling | Secondary Ledger Summary (`RULINGS_LEDGER.json`) | Status / Notes |
|---|---|---|---|
| **Launch Roster** | Roxy, Rosalyn, Emerald only (Creator Ruling 2026-10-01) | Recorded as `CREATOR-RULING-2026-10-01` | **Authoritative Canon** |
| **Rotation Pool** | Dormant for launch (Creator Ruling 2026-10-01) | Supersedes OL-029 / OL-031 references to Rainmaker §5 pool | **Dormant for Launch** |
| **10-Dancer Roster** | Deferred to future task (Creator Ruling 2026-10-01) | Tracked in ledger supersession index | **Deferred** |
| **Creator D1** | Resolved: N/A to 3-dancer launch | Marked resolved in startup checks & ledger | **Closed** |
| **Date Cadence** | Max 1 date per WAKE globally (Creator Source 001) | Reflected in OL-031 summary | **Active Invariant** |
| **Spend Tracking** | All spend counts incl. floor bills (OL-031 D3) | Reflected in ledger entry OL-031 | **Active Invariant** |
| **Income from Club** | $0 payout / no favor currency (Creator Source 001, OL-027 Q3) | Reflected in ledger entry OL-027 | **Active Invariant** |

---

## 3. Accessible Source Vault Context (`e76f840`)
The underlying feature and relationship documents remain readable in the repository at commit `e76f840` (`origin/integration/source-vault-v1.1`):
- `source_vault/relationships/UNDERLORD_Character_Relationship_Packet_v0_2.docx` (Relationship ladder intent)
- `source_vault/art_authority/RAINMAKER_Dancer_Generation_Sheets_and_Wardrobe_Levels.docx` (§2.2 Wardrobe thresholds)
- `source_vault/feature_sources/Rich_Alucard_Patch_RAINMAKER_Ba_Dah_Ba_Dah_Bing_Bing.docx` (§5 Rotation rules - dormant for launch)
- `source_vault/relationships/F15_VELVET_ROTATION_CREATIVE_AUDIT.md` (Design spec & audit)
