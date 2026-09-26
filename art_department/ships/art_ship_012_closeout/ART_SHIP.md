# ART SHIP 012 CLOSEOUT — OPEN HOLD CLEARANCE

**Status:** APPROVED MASTER / FROZEN / COMPLETE.

**Branch:** `art/art_ship_012_closeout`

**Frozen Art base:** `art/art_ship_013` at `9d6f521bdfc404f03a5f5bba7c700860de1eb293`

**Historical branch only:** `art/art_ship_012` at `fcf094b30d5f8288f7727e5faf3f61fed8ff5016`

## Scope

This isolated package rebases ART SHIP 012 closeout work onto the exact ART SHIP 013 frozen checkpoint. It carries forward the four HQ-passed candidate PNG byte streams without pixel or encoding changes, preserves both prior Buckhead candidates as rejected provenance only, and submits one new ImageGen-derived Buckhead candidate for HQ review.

## Carried forward exactly

| Runtime identity | Candidate | Dimensions | Contact | SHA-256 |
|---|---|---:|---:|---|
| `portobello_manager` | `portobello_manager_neutral_80x96.png` | 80×96 | (40,88) | `0e69dc024e59fc9dbd5bed7944081fbc9f83226ba44d7c9c16b3c9b6d68ff26c` |
| `auntie` | `auntie_register_neutral_80x96.png` | 80×96 | (40,88) | `cf5ae278f87c9a339ac15c115f9a754f78cd58d6efa2e289515f90036ae9836e` |
| `soul` | `ocean_soul_climbing_80x96.png` | 80×96 | (40,88) | `21b21879c070ba61944091683201eb89c57a18e05731f66f5fce3e687ed8dbd1` |
| `training_dummy` | `training_dummy_combat_80x96.png` | 80×96 | (40,88) | `e30e3189af01afdd05300fc913ea541aab0e0f1f8c88704a094afac2b5f9face` |

These four assets retain their prior HQ visual PASS. They are closeout candidates, not frozen or runtime-integrated assets.

## Buckhead rejected provenance

Both historical Buckhead PNGs are preserved under `rejected/`, clearly renamed and classified as rejected/provenance only:

- initial naturalistic candidate — rejected for being too naturalistic relative to the approved cast;
- deterministic native-grid revision — not accepted under the closeout direction and prohibited as the production method for the next revision.

Neither is eligible for promotion.

## Buckhead final revision candidate

`candidates/native/characters/buckhead_vampire_neutral_80x96.png`

- SHA-256: `710bede4d4372f20cd27956313d6589df528c3ec9b795b3c4e5cc996ea033b97`
- 80×96 RGBA, binary alpha
- contact `(40,88)`; opaque bounding box `(24,31)–(55,88)`
- 13 opaque RGB colors
- status: **APPROVED MASTER / FROZEN** by explicit Ube Taste Pass / HQ final acceptance

The transparent source render was produced with built-in ImageGen from the accepted concept brief, using the initial rejected candidate as concept-only evidence and frozen Rich, Ms. Patrice, Uncle Sunday and Bllad33 sprites as style references. It was nativeized through significant-alpha crop, BOX downsample, 14-color adaptive reduction without dithering, binary-alpha thresholding and contact alignment. No deterministic pixel surgery, native-grid redraw, procedural body compression or scripted anatomy alteration was used.

## Authority boundary

The ART SHIP 013 frozen corpus remains at 219 assets and its Asset Register remains at 359 entries. The current accepted Engineering runtime authority remains `claude/hold-clearance-001` at `a66170218375e52404715789dde48c23726a6044`, with 108 PASS / 13 HOLD.

Closure updates only the required Art authority records and adds the five exact canonical masters. It changes no pre-existing frozen pixel, runtime/gameplay code, Presentation Director mapping, PASS/HOLD total, audio, SEALED material, PLAYMAKERS material or deployment state.

## Final promotion

Ube Taste Pass / HQ final acceptance approved the Buckhead candidate as-is at checkpoint `da2c251be814a91fe89154d7a9fac02770e4f66d` and authorized final promotion of all five Ship assets. Each canonical production PNG is byte-for-byte identical to its accepted candidate.

The frozen corpus is now 224 assets across 364 Asset Register entries. Both earlier Buckhead attempts remain rejected provenance only. No runtime integration or PASS/HOLD movement is claimed.

## Stop point

**ART SHIP 012 CLOSEOUT — APPROVED MASTER / FROZEN / COMPLETE.**

Do not runtime-integrate, merge or deploy from this Art closure.
