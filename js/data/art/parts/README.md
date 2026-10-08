# Art registry parts

One file per fragment: `<FRAGMENT>_<name>.js` (for example `F03_tokens.js`) that calls `RAArtParts.register("<FRAGMENT>", { ...subtree of RAArtRegistry... })`.
Parts are merged ADDITIVELY after `js/data/art_registry.js`; overwriting an existing or frozen entry throws `FROZEN_ASSET_COLLISION`.
The loader globs this folder in sorted order — run `npm run loader:sync` (integration owner) after adding a file. See `docs/engineering/INTEGRATION_OWNER.md`.
