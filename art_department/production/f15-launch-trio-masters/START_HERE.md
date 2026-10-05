# F15 Velvet Rotation — Approved Launch Trio Input Package

**STATUS:** PUBLISHED ART PRODUCTION PACKAGE — PENDING RUNTIME IMPLEMENTATION  
**AUTHORITY BASE:** Ube Creator Ruling & Approvals (October 1, 2026)  
**LOCATION:** `art_department/production/f15-launch-trio-masters/`  

---

## 1. Quick Navigation & Package Layout

```text
art_department/production/f15-launch-trio-masters/
├── START_HERE.md                       <- THIS GUIDE: Scope, invariants, and implementation roadmap
├── README.md                           <- Frozen master specifications (688x688 RGBA, 24 FPS)
├── INDEX.md                            <- Detailed asset index and frame counts
├── manifest.json                       <- Machine-readable package manifest and verification metadata
├── wolf/                               <- Cleaned animation master (146 frames, 688x688 RGBA PNG)
├── dragon/                             <- Cleaned animation master (144 frames, 688x688 RGBA PNG)
├── pink/                               <- Cleaned animation master (145 frames, 688x688 RGBA PNG)
├── foundation_cards/                   <- Character foundation PNGs (roxy, emerald, rosalyn)
├── manifests/                          <- Creator approval statement and full SHA-256 hash manifests
├── provenance/                         <- Historical candidate animation metadata
└── rulings/
    ├── CREATOR_RULING_2026-10-01_F15_LAUNCH_ROSTER.md  <- Authored launch ruling text
    └── OPEN_RULING_EVIDENCE.md                         <- Underlying OPEN rulings (cadence, spend, progression)
```

---

## 2. Launch Roster & Availability (Creator Ruling — Oct 1, 2026)
- **Launch Trio:** F15 launches with **Roxy**, **Rosalyn**, and **Emerald** only.
- **Stage Availability:** All three dancers are available on stage **every WAKE**.
- **Player Agency:** The player chooses which dancer to support during a visit.
- **Rotation Dormant:** The older Rainmaker §5 four-from-ten rotation is **dormant** for this launch. Do not assign Common/Rare/Legendary tiers to the trio.
- **Ten-Dancer Roster:** Remains deferred to a separate approved future production task.
- **Creator D1 Resolved:** Old tier-placement D1 is resolved as **not applicable to the three-dancer launch**.

---

## 3. Frozen Masters vs Pending Runtime Derivatives
- **Frozen Masters (Included Here):**
  - Lossless 688×688 8-bit RGBA PNG frame sequences at 24 FPS.
  - Inherited source clipping, restart jumps, and native integer placement are accepted and frozen.
  - Frame bytes are frozen; no repainting, smoothing, or recreation permitted.
- **Pending Runtime Implementation (OL-026):**
  - These 688×688 PNG sequences are production masters, **not final in-game runtime assets**.
  - Technical conversion into hard-pixel sprite sheets or lightweight web video loops remains pending F15 implementation.
  - **No final in-game scale, screen coordinates, stage placement, or runtime container format is approved by this package.**
  - **No "270×480 dancer production canvas":** The game's 270×480 viewport applies to overall background environments, not dancer stage sprites. Final dancer display scale, downsampling ratios, and coordinate bounding remain undecided runtime engineering choices.

---

## 4. Identity Mapping Evidence (Explicit Status)
- **Animation Master Handles:** `wolf` (146 frames), `dragon` (144 frames), `pink` (145 frames).
- **Foundation Card Names:** `roxy-foundation.png`, `emerald-foundation.png`, `rosalyn-foundation.png`.
- **Mapping Evidence Status:**
  - The visual masters were cleaned and frozen under sequence identifiers (`wolf`, `dragon`, `pink`).
  - While visual affinities exist between foundation cards and dance sequences, **no formal 1:1 binding metadata connects sequence handles to character identities** in the frozen corpus.
  - **Engineering and integration agents must keep this 1:1 binding explicit and configurable** (e.g. in a config dictionary) until confirmed by creator direction.

---

## 5. Source Vault Availability
The full historical OPEN feature sources, patches, and relationship documents remain accessible in the repository at commit `e76f840` (`origin/integration/source-vault-v1.1`):
- `source_vault/relationships/UNDERLORD_Character_Relationship_Packet_v0_2.docx`
- `source_vault/art_authority/RAINMAKER_Dancer_Generation_Sheets_and_Wardrobe_Levels.docx`
- `source_vault/feature_sources/Rich_Alucard_Patch_RAINMAKER_Ba_Dah_Ba_Dah_Bing_Bing.docx`
- `source_vault/relationships/F15_VELVET_ROTATION_CREATIVE_AUDIT.md`

Its absence from this branch's runtime tree is intentional; builders read it via separate read-only extraction.

---

## 6. Remaining Implementation Decisions & Progression Gaps
1. **Progression Dollar Thresholds & Level Count (F13):** Undecided. While wardrobe tiers (Tier 1 full costume → Tier 2 reduced costume → Tier 3 reference two-piece) are distinct from lifetime progression, **neither a 5-level structure nor specific dollar thresholds are canon**. The exact number of lifetime relationship tiers, their names, and numeric dollar thresholds remain an open design gap to be proposed by Underlord and approved by Overlord.
2. **Date Scripts:** Dialogue branches and narrative nodes in the adventure DSL for dates with Roxy, Rosalyn, and Emerald.
3. **Stage Layout Geometry:** Exact screen positioning, canvas scaling, and UI safe areas for the 3-dancer stage.
4. **Runtime Date System Wiring:** Connecting the 1-date-per-WAKE global gate in `wake_bus.js`.
