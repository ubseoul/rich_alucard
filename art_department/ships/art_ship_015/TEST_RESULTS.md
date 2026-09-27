# ART SHIP 015 — repository verification

Status: **PASS**

Executed on the exact promotion worktree before commit:

- `python art_department/ships/art_ship_015/tools/validate_promotion_ship015.py` — PASS
- `npm test` — PASS; all deterministic release gates passed
- `npm run build` — PASS; built `ra-f1ae59a3f342-20260927054944` from the Ship 014 parent before the Art-only commit
- `npm run verify:artifact` — PASS for that artifact

The repository test output included:

- BTF validation: 110 adventures, 258 branch walks
- Presentation: 17 Combat 2.0 screens; 104 adventure screens, 103 pass and 1 accepted exception
- Art integration: 183 registered runtime frozen files, 217 runtime art references resolved, branch-local matrix 106 PASS / 15 HOLD
- Deterministic release gate: 110 JavaScript syntax checks plus save/recovery/opportunity fixtures

The current accepted external runtime authority remains separately recorded as `claude/hold-clearance-001` at `a66170218375e52404715789dde48c23726a6044`, 108 PASS / 13 HOLD. Ship 015 makes zero runtime/gameplay changes and does not alter either runtime result.
