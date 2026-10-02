# F07 warehouse art integration 001

Branch `feat/f07-warehouse-art-001`, from art commit `a29daaae2ec5377de68fd9e57174190a668a7039` (descendant of runtime base `4800055a96cf9ce06434c3451d5a4f61c6ec195d`, ancestry verified).
Source package: `art_department/production/f07-warehouse-backgrounds/` (frozen, creator-approved; unchanged here).

## Wired
| Asset | Where |
|---|---|
| `warehouse_owambe_party_270x480.png` (sha256 `4431afd5…0899`) | New env `f07_warehouse_party`, F07-owned adapter in `js/frag/F07/m8_and_finale.js`; used by the finale nodes `party`, `office` and the `duel` Combat 2.0 env. Byte-identical copy at `assets/f07/backgrounds/`. Stock nearest-neighbour image path; canvas pixels measured identical to the PNG (0 differing pixels). |

## Published but unwired (no suitable existing F07 surface; nothing invented)
- `warehouse_workday_270x480.png`: F07 has no workday-at-the-warehouse scene (M1–M4/F03 voice-note scenes use the shared `gbenga_rentals` placeholder and are not F07-owned).
- `warehouse_exterior_270x480.png` (before sign change): same; the only exterior-context scenes (M1–M4 arrive/door) are not F07-owned.
- `warehouse_exterior_rich_enterprises_270x480.png`: the authored sign change is a text line inside the ending nodes (`blessing`/`consigliere`/`takeover`), which are interior scenes. No existing exterior-after-change scene exists, and none was added. Those three nodes still use the `gbenga_rentals` placeholder (owner decision needed: leave, or give the endings the party interior).

Interiors are separate complete backgrounds; no overlay; pixel-perfect registration unestablished. No dialogue, gameplay, tuning, F01, or owner-surface edits.
