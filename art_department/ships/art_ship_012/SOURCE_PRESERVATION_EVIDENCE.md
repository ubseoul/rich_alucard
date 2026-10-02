# ART SHIP 012 — Source Preservation Evidence

**Result: PASS**

- Production base checked out exactly at `c6a49410e558be34aa44703015556c00a4e592c9` before the candidate branch was created.
- Five generated source renders are preserved unchanged with SHA-256 records in `RAW_GENERATION_HASHES.json`.
- The deterministic transform is committed in `tools/build_candidates.py`; rerunning it reproduces the five native candidates and review boards.
- All 212 pre-existing frozen Asset Register file hashes pass.
- Frozen/approved source files overwritten: **0**.
- Runtime/gameplay files changed: **0**.
- Review-only context composites use actual frozen environments and remain under this Ship's `review/` directory.
- Environment masters remain separate and unchanged; no figure is baked into an environment asset.
- SEALED/HQ-only and PLAYMAKERS material accessed: **0**.

Machine-readable evidence is in `SOURCE_PRESERVATION_EVIDENCE.json`.
