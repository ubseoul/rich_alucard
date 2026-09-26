# ART SHIP 012 Closeout Foundation Validation

Machine-readable results are recorded in `VALIDATION_REPORT.json`.

Required acceptance conditions:

- all four HQ-passed candidate hashes match exactly;
- both prior Buckhead candidates match their historical hashes and remain rejected provenance;
- all 219 ART SHIP 013 frozen asset hashes match the current Asset Register;
- every change from base commit `9d6f521bdfc404f03a5f5bba7c700860de1eb293` is isolated beneath `art_department/ships/art_ship_012_closeout/`;
- no runtime file is changed;
- no Buckhead generation is attempted on this foundation checkpoint;
- three review-only boards exist: candidates at native 1×, candidates at exact 4×, and rejected Buckhead provenance at exact 4×.

An `overall_pass: true` result confirms this clean-foundation checkpoint only. It does not freeze, promote, runtime-integrate, or approve Buckhead.
