# Source Vault V1.1 — start here

Open [manifest.json](manifest.json), filter `feature_ids`, then read the registered
OPEN source at its repository-relative `path`. Run `npm run sources:check` first.
This is a registry and faithful storage layer, **not canon, approval, or runtime**.
The accepted production base is `2e6a446539aafeb04fb2e8e18747be58c0cdd063`.
R3-1 is ACCEPTED / CLOSED. Vault V1.1 ingests the authorized OPEN source batch
per OL-029 / OL-030, resolving M8, Finale, Rainmaker, Character Relationships,
Dancer Generation / Wardrobe, Sound Finder Brief, and Vol 7 car recovery.
F03/F07 integration requires explicit HQ/Overlord authorization; source discovery
and historical passing tests do not grant it.

## Authority and absence

Ube's explicit current canon/taste decisions govern; HQ owns scope, classification,
acceptance and integration. Apply `docs/CURRENT_CANON.md` and
`docs/PRODUCTION_CONTROL.md` within their scope. Exact approved frozen pixels,
their asset register and applicable freeze/HQ records govern visual identity.
Later explicit decisions supersede older records only for the stated delta.
Historical build IDs in older prose do not change this assignment's base.

`AUTHORITATIVE` applies only to the source's explicit accepted scope. `SUPPORTING`
is evidence; `HISTORICAL` is retained earlier/other-lineage evidence; `PROPOSED`
awaits acceptance; `SOURCE_REQUIRED` means the necessary input is unresolved.
Mixed documents retain their internal PROPOSED/TBD/COOK boundaries. Asset or file
existence is never approval. Do not promote any status or invent missing canon.

`present=true` means the registered file is in this checkout. `present=false`
means no usable exact file is registered (`path=null`). A small OPEN historical
file may be archived here verbatim, with original path/commit/branch provenance;
its availability does not make it current. Do not substitute an audit or a
reported creator decision for an absent original packet. In particular, the exact
**CEO ENCOUNTER CREATIVE LOCK V1** still needs ingestion.

If a required input is absent, report its `source_id`, exact safe title, affected
feature and scope blocked. Continue independent authorized work, but stop that
source-dependent implementation. Do not reconstruct a packet from summaries.
The missing queue includes future requirements as well as current source gaps;
it is not a list of runtime defects.

## Visibility

`OPEN` may be read within scope. `PRIVATE` requires explicit authorized access;
`SEALED` must not be opened, quoted, summarized or hashed for discovery.
This public vault stores **OPEN payloads only**. Restricted entries contain only
already-public safe metadata: no private paths, payloads or hashes. Classification
on an absent entry covers its safe registry label; confirm the actual packet's
classification from HQ before ingestion. Keep GUIDED/PLAYER-BLIND restrictions
inside existing sources; an OPEN policy reference never opens hidden content.
Do not fetch the private repository or copy its history into this public branch.

## Ingest once

1. Confirm exact authority, scope, provenance and spoiler class. Place an approved
   OPEN original in an appropriate existing vault folder (create a folder only
   when needed), or point to a canonical file already in Git.
2. Preserve original bytes, filename/version identity and source content. Do not
   convert, restyle or rewrite it; do not duplicate large existing asset trees.
   `source_vault/.gitattributes` disables text conversion for stored originals.
3. Register/update a stable `source_id`; record title, path, source type, authority,
   visibility, features, owner, provenance, notes and availability. Use
   `source_commit` / `source_branch` / `source_path` for an archived Git origin.
   Record only known metadata; an ingestion commit can supply its own provenance
   through Git history rather than a self-referential SHA.
4. Record SHA-256: default `hash_mode=bytes` hashes exact bytes; `hash_mode=lf`
   hashes UTF-8 text with CRLF changed to LF **for verification only**, supporting
   existing repo text across Windows/Linux checkouts. No source file is rewritten.
   External-original hashes mentioned by a subset remain provenance in that
   subset, not the hash of the registered subset. For a new original, calculate:
   `node --input-type=module -e "import {readFileSync} from 'node:fs'; import {createHash} from 'node:crypto'; console.log(createHash('sha256').update(readFileSync(process.argv[1])).digest('hex'))" source_vault/path/to/original`
5. Run the checks, review the diff and commit/push the source and manifest together.
   Future agents fetch this branch/accepted successor and start at this manifest;
   Ube need not upload an already-ingested file again.

## Fields and commands

Manifest envelope: `schema_version=1`, `base_production_commit`, `sources` array.
Each entry requires `source_id`, `title`, `path`, `source_type`,
`authority_status`, `spoiler_class`, `feature_ids`, `owner`, `provenance`,
`present`, and `notes`. Source type is descriptive, not another approval taxonomy.
Feature IDs are `F00`…`F99`, `T10`, or `CEO_ENCOUNTER`; `[]` means project-wide.
Optional fields: `source_commit` (full SHA), `source_branch`, `source_path`,
`sha256` and `hash_mode` (`bytes`/`lf`). Paths name files, never directories.
The validator checks structure, duplicate IDs, enums, features, file presence,
path containment and hashes without printing or executing source bodies.

```sh
npm run sources:check
npm run sources:missing
npm run sources:missing -- --json
npm run sources:stats
node --test tools/sources.test.mjs
```

Missing means `!present || authority_status === 'SOURCE_REQUIRED'`. Valid missing
entries do not fail `sources:check`. No generated dashboard or separate queue
needs maintaining. [DISCOVERY.md](DISCOVERY.md) records the public inventory and
pinned branch tips; it is evidence, not additional creative authority.

In an implementation record cite: `source_id — path — source_commit (if known)
— sha256/hash_mode — authority + spoiler — section used — authorized scope`.
Include missing IDs and unimplemented scope; preserve PRIVATE/SEALED redaction.
