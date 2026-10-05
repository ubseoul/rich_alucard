# CREATOR RULING — F15 LAUNCH ROSTER AND STAGE AVAILABILITY

**Authority:** Ube (Creator Ruling)  
**Date:** October 1, 2026 (America/New_York)  
**Status:** CREATOR RULING — RECORDED & STAGED  
**Scope:** F15 Velvet Rotation Launch Roster & Stage Selection Architecture  

---

## 1. Authored Ruling (Verbatim)

1. **Launch Roster:**
   F15 launches with **Roxy**, **Rosalyn**, and **Emerald** only.

2. **Stage Availability:**
   All three dancers are available on stage **every WAKE**.

3. **Player Agency:**
   The player chooses which dancer to support.

4. **Rainmaker §5 Rotation Dormant:**
   The older Rainmaker §5 four-from-ten rotation is dormant for this launch. Do not assign the trio COMMON/RARE/LEGENDARY placement to satisfy that older pool.

5. **Ten-Dancer Roster Deferred:**
   The ten-dancer roster remains deferred. Any future activation requires a separate approved production task.

6. **Historical Record Preservation & Supersession:**
   This ruling supersedes conflicting launch-roster and rotation instructions in older handoffs, OL-029/OL-031 summaries, and startup checks. Those historical records are preserved with their conflicting provisions marked superseded rather than deleted or rewritten.

7. **Boundaries & Unchanged Rulings:**
   Other non-conflicting rulings remain unchanged. This ruling does not decide missing dialogue, progression rules, final dancer scale, placement, or runtime format.

---

## 2. Supersession & Conflict Closure

| Topic | Earlier Direction (OL-029 / OL-031) | Current Creator Ruling (2026-10-01) | Disposition |
|---|---|---|---|
| **Roster Size** | 10 dancers (Rainmaker §5) | 3 dancers: Roxy, Rosalyn, Emerald only | **SUPERSEDED** |
| **Stage Availability** | 4 dancers drawn nightly from pool | All 3 available on stage every WAKE | **SUPERSEDED** |
| **Dancer Tiers** | Common / Rare / Legendary weekday/weekend pool | None; no pool tier assignment for the trio | **SUPERSEDED** |
| **Creator D1** | "How Roxy/Rosalyn/Emerald fit among 10 dancers" | **RESOLVED: Not applicable to the three-dancer launch** | **CLOSED** |
| **10-Dancer Roster** | Ingestion / board requirement | Deferred to future approved production task | **DEFERRED** |
| **Date Cadence** | Max 1 date per WAKE globally | Max 1 date per WAKE globally | **UNCHANGED** |
| **Wardrobe vs Levels** | Per-dance wardrobe tiers separate from lifetime levels | Per-dance wardrobe tiers separate from lifetime levels | **UNCHANGED** |
| **Spend Attribution** | All dancer spend counts incl. floor bills | All dancer spend counts incl. floor bills | **UNCHANGED** |
| **Club Income** | Zero club income / favor payout | Zero club income / favor payout | **UNCHANGED** |

---

## 3. Implementation Invariants for F15 Launch

1. `save.frag.F15` tracks progression only for `roxy`, `rosalyn`, and `emerald`.
2. Stage selection presents all three dancers concurrently every WAKE.
3. No RNG rotation logic is executed to gate dancer presence during this launch.
4. Player chooses the active dancer per session; support/spend attributes directly to that dancer.
