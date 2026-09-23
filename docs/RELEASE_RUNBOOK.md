# Release runbook

This runbook supports Engineer/Codex responsibilities described in [Studio Production Control](PRODUCTION_CONTROL.md): implementation, testing, tooling, deployment and evidence. Documentation-only production-control patches do not require deployment unless the repository workflow or HQ explicitly requires it.

## One-time GitHub Pages cutover

**Verified as of the `de5575ac2ccf3550bcff46161e974ff475baa9c2` reconciliation checkpoint:** the public site is serving the generated release artifact, not raw repository-root source. The committed `js/build-info.js` at repo root is a fallback placeholder (`releaseId:'source-checkout', commit:'unbuilt'`); the public `https://ubseoul.github.io/rich_alucard/js/build-info.js` instead returns generated metadata (`ra-de5575ac2ccf-20260923162403`, commit `de5575ac2ccf...`) matching `main` HEAD, and `tools/release.mjs verify-deployment` passes against local HEAD. This is only possible if Pages is publishing the Actions-built `dist/` artifact, which means the cutover below is already in effect. The steps remain here as a reference in case Pages Source is ever reset (for example, by disabling and re-enabling Pages); if public `build.json` ever again shows `commit:"unbuilt"` or otherwise fails to match `main`, redo this check before assuming the workflow is broken.

If it ever needs to be redone, a repository administrator must make this one-time GitHub setting change:

1. Open **Settings → Pages** in `ubseoul/rich_alucard`.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.

Keep the existing Pages URL unchanged. Do not select a branch or move files.

GitHub requires this setting to be changed by an administrator; the workflow token can deploy an artifact but cannot alter the repository publishing source. If this setting were ever reverted, GitHub's legacy branch deployment could overwrite the tested artifact.

## Every release

1. `npm test`
2. `npm run build`
3. `npm run verify:artifact`
4. Push `main`.
5. Wait for **Build and deploy Pages** to pass.
6. Check the public `build.json` and open the game with `?dev=1`. Release ID and commit must agree with the workflow’s commit.

The Pages workflow performs steps 1–6 automatically after the one-time cutover.
