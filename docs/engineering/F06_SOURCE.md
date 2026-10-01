# F06 source identification (recorded before port)

Fresh clone: https://github.com/ubseoul/rich_alucard.git, 2026-09-30.
Base: origin/integration/ube-portal, 5e4b3a31f96624f1e8dc87b4412a9b23fdc4bf79 (frozen IF-1 v1.0, OL-019 rewritten lineage).
Source: origin/frag/rainmaker/make-it-rain-sandbox-polish-001, fd7b5f5ca9bb8baad93a3d0a6bee492d41a79397.
OL-019 map: original fabdfdc4f5361aa21631daed9d38c46b304480d5 -> fd7b5f5.
Original mechanic commit a22b254 -> rewritten 5c87d773c8902c6ed05c583eeff28c900b198291.

Approved source files:
- js/systems/rainmaker/make_it_rain_core.js
- js/systems/rainmaker/make_it_rain_tunables.js
- js/minigames/make_it_rain.js (polished renderer/input adapter)
- make_it_rain_sandbox.html / make_it_rain_sandbox.css
- make_it_rain_review.html (responsive review only)
- tools/minigames/make-it-rain-test.mjs
- tools/minigames/make-it-rain-browser-check.mjs
- docs/rainmaker/MAKE_IT_RAIN_SANDBOX_F06A.md

The supplied packet is the human approval authority (34/34 browser, full suite, strong feel pass).
The source documentation confirms polish preserved the core and tunables byte-for-byte.
This approved implementation has no shared rewards, dancers, inventory, persistence or active audio.
The OPEN Rainmaker patch in the supplied local OVERLORD_PACKAGE defines immediate bill expenses and RM_01–RM_08; its wider club content is not part of this approved port.

Ownership: docs/engineering/INTEGRATION_OWNER.md and js/frag/README.md explicitly assign F06 files and manifests to this fragment; production index regeneration belongs to the integration owner.
No pre-rewrite checkout contributes history or pushes.
