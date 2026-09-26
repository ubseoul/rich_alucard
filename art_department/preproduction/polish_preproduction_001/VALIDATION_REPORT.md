# Validation and source integrity

Status: **PASS for exploratory HQ review packaging.** This is technical validation, not visual approval, canon acceptance, freeze or runtime acceptance.

## Results

- Source checkpoint is `1c96101213a996b2975c31029ef6e823f9ebc745`; it matched fetched `origin/art/art_ship_010` when the branch was created.
- All work is confined to `art_department/preproduction/polish_preproduction_001/`. No tracked source file differed from the checkpoint before the package was staged.
- 9/9 selected native candidates exist at manifest hashes and dimensions; every file has nonempty binary alpha (`0/255`). Total depicted adults: 21.
- Candidate native cells use 4–24 opaque RGBA colors, undithered nearest-neighbor preparation and recorded contact points. The source generation, alpha-extraction method, crop and resampling are recorded per asset.
- 6/6 review layers are RGBA 270x480 exact-origin canvases. All six source environment hashes match their recorded values; composition comparison reports zero changed pixels outside candidate layer alpha.
- Combat inventory: 35 primary individual components across four packages, plus six Blood Bath legacy travel/impact evidence PNGs. Eight sprite-sheet/atlas checks reproduce every referenced individual component exactly.
- Rich audit: 34 individual files classified (33 sprite/state PNGs plus one portrait); the state sheets and six Portobello raw/native archival records were reconciled without inflating the total.
- Supplemental combat FX: zero.
- SEALED/HQ-only payload accessed: false. Family/blocked identities generated: false.
- Approval/freeze/runtime integration/HOLD resolution claimed: false.
- Runtime source extensions changed (`.js`, `.css`, `.html` outside this self-contained review page): none.
- Full repository `npm test`: PASS, including the deterministic release gate, 110 JavaScript syntax checks, 179 registered frozen files and 212 runtime art references.
- `npm run build`: PASS; produced artifact `ra-1c96101213a9-20260926172310` from the requested checkpoint.
- `npm run verify:artifact`: PASS for that artifact and exact checkpoint SHA.
- HQ review document: 24 local references checked; zero missing files.

Machine-readable detail is in `validation.json`, `candidate_manifest.json`, `review_composition_manifest.json`, `combat_inventory.json`, `rich_inventory.json` and `rich_continuity_audit.json`.

## Manual internal visual review

- Native candidates were inspected at 1x and exact 4x. All nine retain distinguishable silhouettes and clearly adult presentation. A03's silver dress was specifically rechecked after deterministic alpha extraction; the connected-region mask preserves the garment.
- Sparse party-hall placement leaves the largest actor lane. Dense party hall and Catacomb foreground silhouettes introduce intentional near-camera depth but risk hiding named actors in tighter Director shots.
- Rooftop social remains readable because fragments occupy separate side pockets. Roof lounge is the most naturally integrated composite; A07 fits a low social grouping without repainting the environment.
- Castle entry creates foreground arrivals while preserving the distant frozen queue and doorway. It should not be interpreted as a canonical queue layout.
- Combat pieces have distinct POWER/SPEED/FEAR/WEIRDNESS identities. Static phone-size diagnostics identify sequencing/visibility questions; no missing bitmap was proven.
- Rich remains broadly recognizable across the corpus. Hookah seated is the single strongest drift; laptop states are possible drift; Portobello remains authorized intentional variation with an earring-verification note.

## Generation transparency exception

Six imagegen sources were delivered as RGB images with a baked checkerboard despite actual transparency being requested. One background-extraction retry again returned RGB/checkerboard; a subsequent retry was rejected by the image service safety filter. The user explicitly authorized deterministic removal and native export preparation. The selected source files remain archived; the candidate manifest records the exact transformation. No filtered imagegen retry was substituted after the rejection.

## Reproducibility

The scripts in `tools/` regenerate candidate native files, review evidence, inventories and validation from the archived selected sources and repository assets. They write only inside this preproduction directory. Pillow, NumPy and SciPy were used for deterministic image preparation and inspection. Review boards never become production sources.

## Remaining limits

- No live gameplay capture was made and no runtime JS was inspected or modified to resolve behavior. Combat sequence judgments remain static-art findings.
- Environment composites show full native frames, not final Presentation Director crops.
- Generated candidates are a deliberately selected option set, not a complete world population solution. HQ taste review remains required before any future production authorization.
- `START_HERE.md` contains a stale Ship 009 Current state paragraph at the frozen checkpoint; later Ship 010 records resolve it. This branch records the discrepancy and does not edit production authority.
