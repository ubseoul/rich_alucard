# Velvet Loop Studio

Internal preview tool for Rich Alucard sprite sheets. Upload a horizontal PNG strip
(equal-size frames, transparent background) and it plays in a nightclub stage next to a chrome pole.
Frame count and size are detected automatically; rendering is nearest-neighbor only.

## Getting the Windows app (one-time)

Either:

1. **On Windows:** install [Node.js LTS](https://nodejs.org), then double-click `Build-Windows-Installer.bat`.
   It builds `dist/Velvet-Loop-Studio-Setup-1.0.0.exe` and launches it.
2. **From GitHub:** the *Velvet Loop Studio (Windows installer)* workflow builds the same installer;
   download it from the run's *Artifacts*.

Running the installer takes one click, no prompts. It installs per-user, creates a
**Velvet Loop Studio** desktop shortcut (plus Start Menu entry) and starts the app.
After that, double-click the desktop icon. Nothing else needs to be installed.

## Development

```
npm install
npm start      # run in Electron
npm test       # slicer + animator tests
```

## Layout

| Path | Role |
| --- | --- |
| `src/core/spriteLoader.js` | File → decoded bitmap + pixels |
| `src/core/spriteSlicer.js` | Frame count/size detection, frame rects, content bounds |
| `src/core/animator.js` | FPS / loop / play state machine |
| `src/render/renderer.js` | Canvas, `requestAnimationFrame` loop, cached static stage |
| `src/scenes/` | Scenes (`nightclub.js`). Add a scene by exporting `{id, name, layout, paintStage}` and registering it in `index.js` |
| `src/ui/controls.js` | Control bar wiring |
| `src/app.js` | Composition root |
| `electron/main.js` | Window shell |

**Slicing note:** the sheet height is the frame height; the frame count is the largest count whose
cut lines all land on fully transparent columns. Keep a little transparent padding between/inside frames.
