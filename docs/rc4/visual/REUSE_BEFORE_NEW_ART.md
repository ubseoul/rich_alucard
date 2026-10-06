# Reuse Before New Art — Visual Asset Analysis

**Purpose**: Per RC4 visual audit principles, maximize the utilization of existing approved artwork before requesting new artistic assets.

---

## 1. Existing Approved Art Needing Wiring (Zero Art Generation Required)
These assets already exist in the repository, are present in the packaged build, and have verified approval authority in `APPROVAL_LEDGER.md`. They are currently rendered as blank procedural silhouettes solely due to missing entries in `js/data/art_registry.js` or `js/data/btf/people.js`.

| Character ID | Display Name | Existing Approved File in Repo / Build | Approval Authority | Target Wiring |
| :--- | :--- | :--- | :--- | :--- |
| **`gbenga`** | GBENGA | `assets/before_the_fame/characters/gbenga/runtime_80x96/gbenga_neutral_anchor_80x96_v2.png` | BUILD-4 / OL-039 (Ledger #241) | `RAArtRegistry.characters.gbenga` |
| **`carlos`** | CARLOS | `assets/before_the_fame/characters/carlos/runtime_80x96/carlos_neutral_happy_anchor_80x96_review_v1.png` | BUILD-4 / OL-039 (Ledger #241) | `RAArtRegistry.characters.carlos` |
| **`senator`** | SENATOR | `assets/build4/p_d/p_d_senator_sitting_160x160.png` | BUILD-4 Presentation Director / OL-039 | `RAArtRegistry.characters.senator` |
| **`mama_gbenga`** | MAMA GBENGA | `assets/build4/p_d/p_d_mama_gbenga_80x96.png` | BUILD-4 Presentation Director / OL-039 | `RAArtRegistry.characters.mama_gbenga` |
| **`smallie`** | SMALLIE | `assets/build4/p_d/p_d_smallie_80x96.png` | BUILD-4 Presentation Director / OL-039 | `RAArtRegistry.characters.smallie` |
| **`smallie_cousin`** | SMALLIE'S COUSIN | `assets/build4/p_d/p_d_smallie_cousin_80x96.png` | BUILD-4 Presentation Director / OL-039 | `RAArtRegistry.characters.smallie_cousin` |
| **`uncle_bamidele`**| UNCLE BAMIDELE | `assets/build4/p_d/p_d_uncle_bamidele_80x96.png` | BUILD-4 Presentation Director / OL-039 | `RAArtRegistry.characters.uncle_bamidele` |
| **`G1`** (Sealed) | RESERVED CAST | (Archived in private HQ) | PRIVATE REVIEW REQUIRED | PRIVATE |

*Wiring these 8 characters resolves 100% of the confirmed P1/P2 "Wrong Art" and "Missing Art" defects across the entire campaign.*

---

## 2. Existing Approved Art Needing Placement / Staging Tuning
These assets exist and are wired, but require coordinate, slot, or CSS adjustments in scene scripts:

1. **Senator Meeting (`NEW_OGA_M6`)**: When wired, `p_d_senator_sitting_160x160.png` requires proper vertical offset (`y: 400`) to align the large 160×160 sitting frame with the office floorline.
2. **Carson Owambe Chairs Activity**: The Owambe background (`assets/before_the_fame/environments/carson_owambe/carson_owambe_bg_270x480.png`) is already rendered during dialogue, but should remain visible as a canvas underlay during the chair carrying minigame instead of reverting to solid CSS dark background.
3. **Uncle Sunday Agege Bread (`A10`)**: Uncle Sunday's bread tray prop (`assets/props/agege_bread.png`) is defined in data but not added to node `props: [{src: '...', x: 198, y: 360}]`.

---

## 3. Assets Needing Approval or Provenance Verification
Assets present in runtime whose formal hash or ledger entry is not yet finalized in `APPROVAL_LEDGER.md`:

1. **Combat Particle FX**: `assets/fx/cash_particle.png` and `assets/fx/blood_splatter.png` are referenced in `combat2.js` and render cleanly, but need formal recording in `ASSET_REGISTER.json`.
2. **Radio Player Album Art Derivatives**: 4 cassette cover thumbnails in Rich Radio are dynamically scaled from 80×96 character master sprites rather than standalone frozen 64×64 icons.

---

## 4. Genuinely New Art Candidates (Low Priority / Post-RC)
Genuinely missing art where no existing asset or suitable crop exists in the repository:

1. **Gbenga Combat Defeated Stance**: While Gbenga v2 anchor has an `adjusting_sleeves` state, a dedicated 80×96 KO/Defeated frame for combat conclusion does not exist. (Currently uses standard fade-out).
2. **Carlos Warehouse Driving Pose**: In `NEW_OGA_M4:beat3` inside the car, Carlos is staged standing. An interior passenger seated crop could enhance immersion but is not strictly required.
