# Bedroom cloud sprites

Three static clouds only. Each PNG has genuine binary transparency and a shared three-color palette. No environment pixels or animation frames are included.

| File | PNG dimensions | Visible shape | Center anchor |
|---|---|---|---|
| bedroom_cloud_large.png | 136x40 | 128x32 | 68,20 |
| bedroom_cloud_medium.png | 88x44 | 80x36 | 44,22 |
| bedroom_cloud_small.png | 52x24 | 44x16 | 26,12 |

Each sprite includes 4 pixels of transparent padding on every side. The sheet is 288x48; precise rectangles are in manifest.json. Anchors are local to each individual sprite, not the sheet.

Render at native size with nearest-neighbor filtering, integer screen coordinates, CSS image-rendering: pixelated, and canvas imageSmoothingEnabled=false. Runtime controls slow right-to-left movement, spawn timing, layering, and clipping to the blue window. The bedroom remains unchanged.
