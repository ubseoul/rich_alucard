# Dance Lab (R&D)

Open `index.html` in a browser (works from `file://`). Animates a frozen pixel sprite **without redrawing it**.

- `assets/source_sprite.png` — untouched source (lossless conversion of the supplied image).
- `dance.js` — scanline-warp engine. Every output pixel is copied from a source pixel; only integer row/column positions change. Nearest-neighbour only, no smoothing.
- `RIG` (top of `dance.js`) — landmarks as fractions of the sprite bbox; retune for another character, or load any PNG via the file picker.
- Controls: Play/Pause (Space), Reset, Speed, Intensity, 24/12 fps stepping, zoom, ponytail lag toggle, side-by-side original.
- Self-checks shown in the UI: amp=0 render is bit-identical to the source; loop frame 0 == frame 2π (verified 0 differing pixels).
- `python3 build-sprite-data.py [png]` regenerates `sprite-data.js` (base64 embed used to avoid canvas tainting on file://).
