# F01 — THE PLAY · FEEL LOCK · asset tickets (F12 Visual A/B)

Authority: OL-023. **Placeholders are in use and everything ships without waiting for final art.** No frozen art was modified; every placeholder is CSS/SVG or an existing frozen sprite used as-is.
Permanent art goes through F12 Visual A/B. Ube judges identity. Native canvas for every scene is **270 × 480 portrait**, 1× pixel art, night palette.

| ID | Asset | Where it is used | Placeholder today | Needed |
|---|---|---|---|---|
| FL-A01 | **Rich-in-bed POV with hand + phone** | THE LIVE FEED (the core PLAY screen) | `feel-art.mjs › richBed / richHand` — SVG blanket, forearm, fingers over a DOM phone; bedroom backdrop is the frozen Portobello room, darkened + red-washed | pixel art: bed foreground (blanket, pillow edge), Rich's forearm/hand holding the phone (idle, JOLT, thumb-typing), lamp/window glow behind; layered so the phone screen stays live DOM. Shake is done in code |
| FL-A02 | **Base return scene** (alley / castle drive) | RETURN / AFTERMATH | the frozen `street_night` backdrop + the Rich contextual-state sprite | a dedicated base curb/driveway with a parking spot, a spot for bags and a spot for loot; empty variant for the catastrophe ("Rich alone") |
| FL-A03 | **Cash bag tiers** | payoff | `duffelSVG` (one green duffel, optionally open) repeated | SMALL: 1 duffel · MEDIUM: 2–3 bags · LARGE: a visibly stacked haul; open-with-cash variants; a counting-hands overlay for Rich |
| FL-A04 | **OBA DE GWINNETT — Visual A card / identity** | the rare hunter (placeholder silhouette flashes on the wall at the moment the feed cuts) | `obaSilhouette()` — a black coat-and-hat shape with two red eyes. **It is not his design.** | full Visual A card for Ube's judgment; final appearance is Ube's |
| FL-A05 | **Target exteriors per PLAY** | ARRIVAL | every offense job uses the castle exterior at night | one exterior per job spec (boba shop, church lot, dental office, docks, car wash, stash house, gala, Lil Smack's crib, counting house) |
| FL-A06 | **Side-view owned cars** | crew/car, departure, arrival, return | the frozen JDM Supra sprite; HOOPTIE, S2000, URUS are placeholder SVGs | side views for HOOPTIE / S2000 / URUS (+ any owned car) facing left, headlight-on variant, wrecked and impounded states |
| FL-A07 | **Oga full-body sprites** | departure, arrival, return | the procedural F01 face busts with a small gun overlay | walking/boarding/standing/wounded/carried states per Oga (named + generic template) |
| FL-A08 | **Weapon icons** | crew/car weapon slot, trunk | existing frozen gun sprites (SHOTGUN, PISTOL=Lil Oga, SNIPER); SPRAYER uses the Holy Baby Drake sprite; SLIPPER and BARE HANDS are SVG | icons for PISTOL (plain), SPRAYER (Mac & Cheese), SLIPPER, BARE HANDS |
| FL-A09 | Phone chat skin | live feed | dark CSS bubbles | optional pixel bubble/phone bezel |
| FL-A10 | Trunk loot pieces | payoff | procedural crate SVGs + the frozen Blood X sprite | per-category loot silhouettes for the physical drop beside the bags |

Sound: only approved library sounds are used (`ui_phone`, `combat`, `touge`, `home_castle`, `locations`); no SEAL_* / BX stingers. A dedicated distant-gunshot bed, a phone-jolt and a cash-count loop are nice-to-have F12 audio tickets, not blockers.
