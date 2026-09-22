# Rich Alucard

A playable 9:16 pixel-RPG vertical slice built to feel like a strange lost handheld game — and to double as a screen-recordable music visual.

You play as **Rich Alucard**, a vampire boss lounging in his castle when adventurers break into the throne room.

## Vertical Slice

The current build includes:

- Turn-based throne-room combat
- **Blood Bath**
- **Octopus Brain** — alternative problem-solving choices during combat
- **Vampire Bite**
- **Revenge**
- CEO Zombie Prince + assistant encounter
- Authored pixel-art attack and character states
- Music-synchronized Rich Alucard lyric bubbles
- Victory choice and walk-off sequence
- Mobile-first **9:16** presentation

## Play

Open the GitHub Pages build, press **START**, then choose moves from the battle menu.

For the intended presentation, play in a tall/mobile-sized browser window or on a phone.

## Status

**v0.23 Engine Foundation**

The playable vertical slice remains the active experience while the reusable engine foundation is introduced incrementally. Combat values, dialogue, animation timing, and broader castle/dating/party systems are still in development.

The foundation currently includes persistent local game state, a scene manager, an audio manager, character and move registries, runtime character state, and the monthly budget system. The existing battle and music implementation remains in `game.js` until a feature needs to move into a dedicated module.

## Built with

Vanilla HTML, CSS, and JavaScript. No framework required.

## Development

The game runtime remains vanilla HTML, CSS and JavaScript. Build-time tooling only creates the static Pages artifact.

```powershell
npm test
npm run build
npm run verify:artifact
python -m http.server 4174 --directory dist
```

`dist/` is the complete deployable artifact. Its generated `build.json` and `js/build-info.js` carry the same release ID, commit SHA and timestamp; `?dev=1` displays that identity without affecting normal play. GitHub Actions runs the deterministic gate, builds that one artifact, deploys it to Pages, then compares the public build identity with the commit that triggered the deployment.

---

Rich Alucard is an original game/music-world project.
