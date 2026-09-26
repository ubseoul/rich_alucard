# ART SHIP 010 — Technical Validation

Status: **PASS for candidate package; not approved or frozen**.

- Candidate contract validator: PASS (`CANDIDATE_VALIDATION_REPORT.json`). Four candidate files exist with required dimensions and RGBA binary alpha. Character contacts land at y=88; rooftop layer is exact-origin 270×480, has no opaque pixels below y=372, and leaves the protected Rich corridor clear.
- Source hash validation: PASS. Rich master, rooftop master and both crowd references match the recorded SHA-256 values.
- Repository test suite: PASS (`npm test`). Existing release checks report the frozen runtime matrix at 105 PASS / 16 HOLD.
- Release build: PASS (`npm run build`) from checkpoint `5af730a132c035f6f2f5afb20eef5149ca3f2761`.
- Artifact verification: PASS (`npm run verify:artifact`).
- Scope check: PASS. `git diff --name-only -- assets js docs` is empty; canonical assets, runtime/gameplay code and integration docs remain untouched.

The Ship 009 promotion validator was not used as a Ship 010 gate because it is hard-coded to Ship 009 promotion manifests; its generated report was reverted immediately and is not part of this package.
