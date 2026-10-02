# F15 date-scene assets - START HERE

Art publication only. **No runtime integration, no release-readiness claim.** Branch `art/f15-date-scene-assets`, base `8a1dc98a373339d25d613e2651be0a6280064486`.

## Status

All **7 backgrounds + the cockroach master** are published and approved. The Roxy, Rosalyn, boxing gym and Plénitude production PNGs were originally recorded as pending native-size review; Ube approved those exact bytes later (2026-10-02, see `APPROVAL_ADDENDUM.json`). The earlier records under `provenance/` still say "pending" and are kept unchanged as history; the addendum supersedes only that status field.

## Production paths (approved, frozen, copied unchanged)

| Path (under `art_department/production/f15-date-scene-assets/`) | Dims / mode | Bytes | SHA-256 | Status |
|---|---|---|---|---|
| `production/the_bing_270x480.png` | 270x480 RGB | 184014 | `16c82c11f017960da8eb18a8e5f5363132aca4c1d124088f5d2ac5c8ec410fe0` | FROZEN - UBE APPROVED (production) |
| `production/roxy_apartment_270x480.png` | 270x480 RGB | 188084 | `f30c32450876b2077d6374165630ed7b1dc9b05b42c56f80c92c6a7d9c3f0b51` | FROZEN - UBE APPROVED (production, addendum 2026-10-02) |
| `production/rosalyn_apartment_270x480.png` | 270x480 RGB | 192736 | `8247c05d7c6bafdb9009f08b3c98ebe274db63f1aadaeff4c65b0eb6f403e8e7` | FROZEN - UBE APPROVED (production, addendum 2026-10-02) |
| `production/boxing_gym_270x480.png` | 270x480 RGB | 161542 | `9a0e80798bc8c7a74d96c06578c6d4e02ee4170284651d93ac4569432877f24f` | FROZEN - UBE APPROVED (production, addendum 2026-10-02) |
| `production/plenitude_270x480.png` | 270x480 RGB | 163201 | `686b97067b6776c8e7de992fb60f67c663610489cfc567b4c3fb8c8c2314b9cb` | FROZEN - UBE APPROVED (production, addendum 2026-10-02) |
| `production/convention_hall_270x480.png` | 270x480 RGB | 186868 | `469564c607b94bcd7fdceb64d1bcacdd5bf9ff02c7f343a7798636ec885d8664` | FROZEN - UBE APPROVED (production) |
| `production/shrine_auditorium_270x480.png` | 270x480 RGB | 177418 | `58359742eb37d7cd4ff9f05c9312207f109528a59397268cd7d73491ae02cab9` | FROZEN - UBE APPROVED (production) |
| `production/spirit_of_uncle_bunmi_candidate_original.png` | 1774x887 RGBA | 804694 | `2c1589a8214c8f3eda935f416e1808a83aa71ec3be1d4c3f4b8d29a0333aa783` | FROZEN - UBE APPROVED |

`spirit_of_uncle_bunmi_candidate_original.png` is the frozen cockroach master: 1774x887 RGBA with partial alpha preserved (transparent 1016648, partial 553579, opaque 3311). Do not resize, recolor, clean or repack it. Its runtime display size is unspecified.

## Approved source originals (941x1672 RGB, all seven)

| Path | Dims / mode | Bytes | SHA-256 |
|---|---|---|---|
| `originals/the_bing_f15_candidate_original.png` | 941x1672 RGB | 1578194 | `f5c2555e69ded12fad1ff3ddb3ecc8bda7c0c235540231ad931b395b9032c63b` |
| `originals/roxy_apartment_f15_candidate_original.png` | 941x1672 RGB | 1733158 | `555c54a3401ac17cbb9e67fe34d733c6eb86a9cda9dc55d403cbf786d31a2415` |
| `originals/rosalyn_apartment_f15_candidate_original.png` | 941x1672 RGB | 1840642 | `b947200de0b2b5b172b1dfecc781f6b6923f46aa2d699177c85c35aecd5c3739` |
| `originals/boxing_gym_f15_candidate_original.png` | 941x1672 RGB | 1494456 | `8205129b30baef801c0f851e2de7ccc0b2827bd285f014e6146da35184a4b097` |
| `originals/plenitude_f15_candidate_original.png` | 941x1672 RGB | 1487021 | `d851d57039f6f6678396500d7cd8e7e4cb7410253a60c2f091b9d7fa67161b0f` |
| `originals/convention_hall_candidate_original.png` | 941x1672 RGB | 1690038 | `85ad0c17c2c0dffb89aee6d724f9ad569647b53af309007e58c50dd838242ebc` |
| `originals/shrine_auditorium_candidate_original.png` | 941x1672 RGB | 1606938 | `023adf2df27500c50c9a07bdd79fa6cb974e3a41b4bf5a658410a77ccd1aa7a4` |

## Layout

- `production/` - approved production assets only.
- `originals/` - approved source originals (archived byte-for-byte).
- `qa/` - QA-only previews and gameplay reference screenshots for the three approved backgrounds. Not production.
- `provenance/` - verbatim source-package records, prompts, reviews, manifests and zip sidecars (text contains mojibake from the source; left as-is).
- `granny_bing/GRANNY_BING_SOURCE.md` - existing frozen source (commit `61a8a5599d6c`), documented only.
- `APPROVAL_ADDENDUM.json` - Ube’s production approval for the four later-approved backgrounds.
- `manifest.json`, `SHA256SUMS.txt` - machine-readable records. Checksum scheme: `SHA256SUMS.txt` covers every file except itself; the manifest omits its own and the sums file's hashes, so nothing hashes itself. Verify with `sha256sum -c SHA256SUMS.txt` from this directory.

## Placement

Actor/UI placement is **UNVERIFIED** for every asset until runtime integration. Provenance records note possible furniture/actor overlaps; none were measured.

Authority: Ube's approvals as quoted in `provenance/`. Convention Hall and Shrine Auditorium production PNGs and the cockroach master are frozen.
