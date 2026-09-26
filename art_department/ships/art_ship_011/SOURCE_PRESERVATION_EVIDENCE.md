# ART SHIP 011 — Source preservation evidence

Production authority begins from `8eab30dc790071ec8da98f65311e2b4676fabad0`. Exploratory source evidence is read from `d8c24b632ecdc134986b4f81ff5d3f3959609eea` only.

For each of A01–A09:

1. the exploratory native candidate is identified by commit, path and SHA-256;
2. its selected design source, source mode and SHA-256 are recorded;
3. the original deterministic extraction/crop/nearest-neighbor/no-dither transform is recorded;
4. the Ship candidate and production-path candidate are byte-identical to the exploratory native file;
5. deterministic reproduction from the archived selected source matches the exact native pixel array.

No selected-source render or review composite is promoted as a production asset. No frozen asset is used as an editable source, and no environment master is modified.

See `SOURCE_PROVENANCE.json`, `SOURCE_PACKAGE_SHA256SUMS.txt`, `CANDIDATE_SHA256SUMS.txt`, `PRODUCTION_SHA256SUMS.txt` and `PROMOTION_EVIDENCE.json`.
