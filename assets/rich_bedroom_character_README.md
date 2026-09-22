# Rich bedroom character assets

Six isolated transparent PNGs, one 3-column by 2-row transparent sprite sheet, and manifest.json.

Order: lounge idle, phone scroll, small idle, phone reaction, sleeping, drowsy wake.

Each cell is 128x64. Shared anchor: (24,56). The visible character is approximately 108 pixels wide, or 40% of a 270-pixel screen. Suggested starting placement is top-left (14,282), corresponding to world anchor (38,338), in the approved 270x480 bedroom. Apply exactly the same placement to all states.

Use integer coordinates, nearest-neighbor sampling, canvas imageSmoothingEnabled=false and CSS image-rendering: pixelated. PNG alpha is binary (0/255); there are 10 opaque colors across the package. Keep long holds between brief state changes. Runtime chooses timings and sleep/wake transitions.

No bedroom, bed, pillow, furniture or background pixels are included. The approved environment was not modified. The included phone belongs to each character state.

These assets are ready for visual review; they are not designated as a newly approved canonical model.
