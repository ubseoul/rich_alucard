# OL-042 applied — final Ube authority

Hash authority: build4/PRESERVED_ART_HASH_AUDIT.json supersedes PRESERVED_ART_HASHES.json. The Overlord's 1,226 empty-stream/null entries describe the defect subset; the earlier 1,659 audit mismatch total also includes other metadata mismatches. Keep historical records with the supersession note; future checks use the audit.

Exact-byte approvals A1/A2/D1 and current reduced loops C1:

```json
[
  {
    "path": "assets/f15/layers/lights_off_270x480.png",
    "sha256": "3aa6cd5456781dfd6c96a68ab7560018a02e3556d47fe8e6e116c6cceed1f6cb",
    "decision": "A1"
  },
  {
    "path": "assets/f15/characters/spirit_of_uncle_bunmi_444x222.png",
    "sha256": "e4cc409314da51b99627452dc92e5ce597f22b531ee57983c41af68aa4886c7d",
    "decision": "A2"
  },
  {
    "path": "assets/f15/portraits/roxy.png",
    "sha256": "863f603116b19be9c696ccd28257e3818832c396af9dac5ef939027e33eefa7d",
    "decision": "D1"
  },
  {
    "path": "assets/f15/portraits/rosalyn.png",
    "sha256": "f912029dd2729b8fc4ac22496435087b75294305dd004b9b20c302c3e8fbd916",
    "decision": "D1"
  },
  {
    "path": "assets/f15/portraits/emerald.png",
    "sha256": "3fc896931d65b480537f11e68c0e0b5cf7e35903be1ae56f108d242b78b4d842",
    "decision": "D1"
  },
  {
    "path": "assets/f15/dancers/wolf.png",
    "sha256": "32fdbd87572a3b7cb388ebc5121bc135c2d5b3c8772a044dbb8537642450dce3",
    "decision": "C1"
  },
  {
    "path": "assets/f15/dancers/pink.png",
    "sha256": "c8ae3cc0ccc74743a811ba7fc70675b631325cc8f386f85f277423a3513638cf",
    "decision": "C1"
  },
  {
    "path": "assets/f15/dancers/dragon.png",
    "sha256": "0ef213967c4380b333594ce063cc43d2c318c3206ffa90c195a4aab87576456c",
    "decision": "C1"
  }
]
```

B1: sign change only in the authored winning TAKEOVER node or saved finaleDone + finaleEnding=takeover + rentalWarehouseOwned state, with F07 enabled. BLESSING/CONSIGLIERE/pre-finale/flags-OFF retain the old exterior. No dialogue or economy changes. Sign-rect proof remains (54,104,163,30), 701 changed pixels, zero outside.

D2: the current PIER drawn big catch is approved production art and no longer an SR-7 placeholder. D3: three neutral category tokens are authorized; physical-prop decision rows closed, separate image requests remain. D4 F06 mannequin and D5 DEV fixture are accepted in their scoped uses. D6 kiosk, cook and HOOKAH partner are generic unnamed NPCs; image work remains.

Closed row IDs: `f15_dark_condition_review`, `f15_roach_derivative_review`, `f07_rich_enterprises_condition`, `f15_roxy_single_pose_review`, `dancer_roxy_t2_poses`, `dancer_roxy_t2_pole`, `dancer_roxy_t2_floor`, `f15_rosalyn_single_pose_review`, `dancer_rosalyn_t2_poses`, `dancer_rosalyn_t2_pole`, `dancer_rosalyn_t2_floor`, `f15_emerald_single_pose_review`, `dancer_emerald_t2_poses`, `dancer_emerald_t2_pole`, `dancer_emerald_t2_floor`, `f15_wardrobe_mapping_decisions`, `pier_big_fish`, `fl_a10_recruit`, `fl_a10_story`, `fl_a10_district`, `f06_generic_target`.

Excluded: party_dev_room. Remaining: P-A 0 / P-B 0 / P-C 18 / P-D 42. Ube returns named PNG/video files only; Codex supplies all manifests, normalization, hashes and contact sheets.

Step 5: F15 owns per-dance wardrobe tiers, distinct from She fw Me progression; F06 remains untouched. Authored thresholds and numeric behavior are transcribed in P-C_STEPS.md. Rarity classification for the launch trio must be grounded in authored source; none is inferred from a legacy species/name. Required tests: tier selection, persistence, save/reload, flags-OFF zero change, widths 360/390/430.
