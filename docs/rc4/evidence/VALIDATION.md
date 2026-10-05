# Audit validation at the unchanged RC3 base

Audited4981d5245d0600c062a7f431acd8253dc28b9cc6; isolated rc4/comb-audit. Only docs/rc4 is added.

- npm test: exit1 before suite; `Cannot find module tools/tests/F02/_lib.mjs imported from tools/rc3/policy-test.mjs`. Repository has lowercase tools/tests/f02/_lib.mjs. Other case-sensitive imports also require review. No test bypass or baseline fix made.
- npm run sources:check: exit1,5 SHA mismatches, reconfirmed after audit drafting. Index3 art_department/ASSET_REGISTER.json;52 art_department/START_HERE.md;76 docs/btf/CONTENT_AUTHORING.md;144 js/if1/features.js;161 js/frag/F01/play/content.mjs. These are manifest metadata findings; no sealed contents accessed or hashes silently updated.
- Browser ordinary: fresh storage,390×844, no dev flags/state patches/debug wins; completed Day1 and began Day2, errors[].
- Browser fixtures: targeted/access/final-check JSON errors[], no failure field; scope and limitations in README. Actual scripts use production controllers but patched state is not ordinary progression.
- node --check: all4 evidence/scripts files pass. These are portable copies of the scripts actually used, replacing absolute paths with module-relative repository paths.
- Document validation:8 required documents;33 findings each has severity/evidence/impact/reproduction/exact files/smallest repair/effort/confidence/owner/ruling; local document/image links resolve.
- Reference validation: every bundled file hash matches combat-reference-inventory.json. Images remain exact repo bytes. Register approval status is retained separately from runtime availability.
- No exhaustive population simulation, multi-width sweep, balance change, story rewrite, new art, runtime repair or accepted-ref movement.

Future repair builds: full npm test plus one quick390px smoke after fixing baseline gate; broaden tests only for demonstrated issues.
