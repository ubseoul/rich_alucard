# Audio manifest parts

One file per fragment: `<FRAGMENT>_<name>.js` that calls `RAAudioParts.register("<FRAGMENT>", { entries:[...], scenes:{...} })`.
`js/data/audio_manifest.js` is generated and must not be edited. Part ids must be NEW; inert hooks (`file:null`, `registered:false`) stay inert.
The loader globs this folder in sorted order — run `npm run loader:sync` (integration owner) after adding a file. See `docs/engineering/INTEGRATION_OWNER.md`.
