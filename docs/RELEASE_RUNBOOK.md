# Release runbook

This runbook supports Engineer/Codex responsibilities described in [Studio Production Control](PRODUCTION_CONTROL.md): implementation, testing, tooling, deployment and evidence. Documentation-only production-control patches do not require deployment unless the repository workflow or HQ explicitly requires it.

## One-time GitHub Pages cutover

The repository now contains the complete static release workflow, but GitHub Pages is currently configured to publish the repository root from `main`. A repository administrator must make this one-time GitHub setting change:

1. Open **Settings → Pages** in `ubseoul/rich_alucard`.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.

Keep the existing Pages URL unchanged. Do not select a branch or move files.

GitHub requires this setting to be changed by an administrator; the workflow token can deploy an artifact but cannot alter the repository publishing source. Until this is changed, GitHub's legacy branch deployment can overwrite the tested artifact.

## Every release

1. `npm test`
2. `npm run build`
3. `npm run verify:artifact`
4. Push `main`.
5. Wait for **Build and deploy Pages** to pass.
6. Check the public `build.json` and open the game with `?dev=1`. Release ID and commit must agree with the workflow’s commit.

The Pages workflow performs steps 1–6 automatically after the one-time cutover.
