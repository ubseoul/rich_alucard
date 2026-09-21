# Vampire Bite reusable FX

Seven character-free PNG components. The imagery is symbolic: no Rich face, enemy, enemy silhouette, room or UI is baked in. The approved `rich_vampire_bite.png` remains a separate, unchanged character pose.

## Components

| File | Dimensions | Local anchor | Layer role |
|---|---|---|---|
| vampire_bite_jaw_upper.png | 270×480 | (135,0) | Screen-space upper jaw; enters from above |
| vampire_bite_jaw_lower.png | 270×480 | (135,480) | Screen-space lower jaw; enters from below |
| vampire_bite_snap_closed.png | 270×480 | (0,0) | Single combined snap replacement |
| vampire_bite_contact.png | 64×64 | (32,32) | Center on the runtime target contact point |
| vampire_bite_lifesteal_drop_01.png | 16×16 | (8,8) | Small traveling blood droplet |
| vampire_bite_lifesteal_orb_01.png | 16×16 | (8,8) | Small traveling blood orb |
| vampire_bite_lifesteal_drop_02.png | 16×16 | (8,8) | Alternate traveling droplet |

Transparent padding is intentional. Draw at `worldAnchor - localAnchor`. Never recenter or trim based on opaque bounds.

## One snap

The jaw components use the full 270×480 coordinate system. At their neutral positions, both images have canvas origin (0,0). The runtime can move the upper component in from a negative Y offset and the lower component in from a positive Y offset.

The closed PNG is assembled from the exact exported components: lower at (0,-100), upper at (0,70), drawn in that order, with near-black jaw mass extended to the top and bottom screen edges. Use the supplied closed PNG for the held snap, or reproduce these integer offsets and edge extensions. Do not draw the combined closed PNG and the moving jaw components at the same time.

This provides an open-to-snap visual endpoint, not a prescribed animation duration. Code controls speed, hit-stop and screen response.

## Target independence

Place the contact burst using the current target's bite/contact anchor. It has no target-size assumption. Lifesteal particles share a center anchor; runtime supplies start points, paths, count, destination near Rich and timing. Their travel is not drawn into the PNGs.

Keep Rich's authored pose and the target's reaction layer separate. Teleportation, afterimages, positioning, lifesteal and returning Rich to the throne remain runtime responsibilities. No new attacks, mechanics or environment changes are included.

Suggested compositing roles: existing scene/character layers; target-local contact effect; screen-space jaw components or combined snap; traveling lifesteal particles when visible under the existing game sequence; existing UI policy. The package does not impose gameplay timing or UI behavior.

## Rendering

All assets have binary alpha and share exactly three opaque colors: near-black #10050D, red #EC2949, off-white #FFE3DE. Use integer placement and nearest-neighbor scaling; Canvas `imageSmoothingEnabled=false`, CSS `image-rendering:pixelated`. No blur or filtered scaling.

`vampire_bite_jaw_sheet.png` contains three 270×480 cells in one row: upper, lower, closed. `vampire_bite_lifesteal_atlas.png` contains three 16×16 cells in one row: drop01, orb01, drop02. They match the individual PNG files exactly.
