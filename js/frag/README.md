# Fragment code (js/frag/<ID>/)

Each campaign fragment (F01 SHOWDOWN_CORE, F02 IRON_AND_GRACE, F03 NEW_OGA_LADDER_CLOSE, F04 PLAYMAKERS_WAR_ROOM, F05 THE_TRAP,
F06 RAINMAKER, F07 M8_AND_FINALE) works here, in NEW files:

    js/frag/F03/manifest.json   {"files":["js/frag/F03/a.js"],"css":["js/frag/F03/f.css"]}   (ordered; only files under this folder)
    js/frag/F03/migrations.js   optional; loaded BEFORE js/engine/state.js: RAMigrations.namespace(...) / RAMigrations.submit(...)

Fragments integrate DARK behind `RAFeatures` flags and reach the game through IF-1 (`js/if1/`). The integration owner assigns
schema versions, orders the loader (`npm run loader:sync`) and merges. See `docs/engineering/INTEGRATION_OWNER.md`.
