# PLAYER-BLIND — HQ ONLY

# The Property: Engineering Integration Notes

These notes describe a bounded implementation contract. They do not authorize runtime work.

## Proposed scene contracts

### Exterior — `property-la-4p-exterior`

- Native: 270×480.
- Environment: `assets/property_exterior_270x480.png` after HQ acceptance/promotion.
- Reference actor scale: 1.25× for Rich and Shannon.
- Contact line: `sidewalk`, `y=370`, suggested usable x-range `28..242`.
- Rich source: existing approved `assets/rich_standing_right.png`, source anchor `(40,88)`, suggested world anchor `(65,370)`, facing right.
- Shannon source: candidate `shannon_neutral_80x96.png`, source anchor `(40,88)`, suggested world anchor `(195,370)`, facing left/authored.
- Dialogue safe zone: `(16,32,238,88)`.
- Control exclusion: `(8,404,254,68)`.
- Hotspots: meter bank, stair/rail, courtyard/doors, entry. Define data rectangles after in-browser inspection; do not derive collision/navigation.
- Layers: environment 1, incidental focus 3, actors 5, dialogue 9, controls 10, inspection 11.

### Interior — `property-la-4p-interior`

- Native: 270×480.
- Environment base: `assets/property_interior_base_270x480.png` after HQ acceptance/promotion.
- Registered problem overlay: `assets/property_problem_overlay_270x480.png`, exact origin `(0,0)`, layer above environment and below actors.
- Reference actor scale: 1.25× for Rich, Shannon, and rats.
- Contact line: `unit-floor`, `y=352`, suggested x-range `20..252`.
- Rich source anchor `(40,88)`, suggested world anchor `(55,352)`.
- Shannon source anchor `(40,88)`, suggested world anchor `(132,352)`.
- Rat source anchor `(48,56)`, initial suggested world anchor `(218,352)`; movement anchors remain within floor range.
- Dialogue safe zone: `(16,28,238,88)`.
- Control exclusion: `(8,394,254,78)`.
- Hotspots: kitchen, patch/stain, floor, door, maintenance panel, paint can.
- Layers: environment 1, problem overlay 2, props/focus 3, rats 4, actors 5, front rat crossings 6, dialogue 9, controls 10, inspection 11.

## Asset state maps

### Shannon

- `neutral` → `shannon_neutral_80x96.png`.
- `controlled_reaction` → `shannon_controlled_reaction_80x96.png`.
- Sheet order: neutral, controlled reaction.
- Keep contact `(40,88)` stable. Do not auto-trim or center by opaque bounds.
- Facing may be mirrored only after visual QA confirms the asymmetric hair/bag/key read remains acceptable. Preferred authored presentation faces left.

### Rat

- `alert` → `giant_rat_alert_96x64.png`.
- `scurry` → `giant_rat_scurry_96x64.png`.
- `recoil` → `giant_rat_recoil_96x64.png`.
- Sheet order: alert, scurry, recoil.
- Keep source anchor `(48,56)` stable across states.
- Use held states and short integer-position movement. No tween blur, rotation, squash, smooth scale, or added particle trail.
- Reuse the same sprites for multiple instances. At most three simultaneous rats.
- Mirroring is acceptable for direction changes after actual-resolution inspection.

## Problem overlay handling

- Base and overlay are both 270×480 and must register at exact origin.
- Do not flatten the base and overlay in source unless HQ later requests a separate composite master.
- The overlay is a visible condition state, not collision or navigation data.
- If phase-specific partial reveal is desired, Engineering may clip/reveal the existing overlay or request an explicit Art delta. Do not repaint it with CSS shapes.
- PB-01 reuses the clean base by omitting the overlay. No secret art asset is required.

## Dialogue contract

Recommended data shape:

```js
{
  id,
  kind: 'spoken' | 'narration' | 'system',
  speakerId: null | 'shannon' | 'rich',
  text,
  purpose,
  stageDependency,
  richVoiceStatus: null | 'hq_supplied' | 'voice_pass_required'
}
```

- Spoken dialogue renders a separate speaker label/attachment.
- Narration never receives a fake speaker.
- The shared game dialogue grammar owns chrome, typography, placement, advance behavior, and accessibility.
- Creative metadata does not authorize arbitrary scene-specific boxes.
- Keep current Press Start 2P default and validate at 270×480 plus real phone viewport.
- Do not obscure active actors, rat scale comparison, access opening, or hotspots.

## State/persistence requirements

Names below are semantic suggestions, not mandated schema paths:

- Opportunity: discovered / deferred / inspection active / offer available / completed.
- Ownership: property ID, acquired timestamp, transaction mode, current condition, income readiness.
- Shannon: persistent contact created idempotently; no invented relationship score.
- Inspection: optional hotspot memories may be session-local unless a later event needs one.
- Rat approach: `block`, `open_wider`, or `stand_ground` for later flavor only.
- PB-01 prerequisites: `firstSignChoice === 'wait'` and `ratApproach === 'stand_ground'`.
- PB-01 delivery: authored safe-boundary event, one-time, idempotent, no real-time scheduling.
- Return/reload: resume active inspection phase; completed acquisition never restarts automatically.

Use the existing authoritative `life` record, explicit migration, recovery behavior, safe-boundary event delivery, and scene-scope cleanup. Do not create a parallel property save store.

## Economy boundaries

Creative supplies no numeric property price, down payment, closing cost, rent, repair amount, income tick, or profitability formula.

Engineering/HQ must define:

- affordability check against the canonical monthly-budget/money system;
- price/credit differences between `CUT THE PRICE` and `BUY IT AS-IS`;
- whether rent begins immediately or after stabilization;
- how later income is surfaced without replaying the acquisition;
- whether ownership can ever be lost or sold.

The arc's writing supports variable numbers and should interpolate them only in system panels, not Shannon's authored dialogue.

## Suggested phase IDs

`property_discovery` → `property_arrival` → `property_exterior_inspection` → `property_interior_base` → `property_first_sign` → `property_rat_reveal` → `property_rat_pressure` → `property_offer` → `property_return`.

These IDs are PLAYER-BLIND implementation detail. Player UI should show natural action labels, not a quest log or objectives.

## QA acceptance needs

- Fresh save and representative existing save through normal phone/opportunity entry.
- Reload/resume at exterior inspection, base interior, rat pressure, and offer.
- Property ownership and Shannon contact idempotency.
- Acquisition cannot double-charge or duplicate ownership/history.
- Deferred opportunity remains accessible without a silent lock.
- All visible narration claims match an on-screen actor/object/state.
- Shannon/Rich/rat placement inspected at actual 270×480 and target phone viewport.
- Dialogue never covers the speaking face or active rat.
- Problem overlay exact registration and clean omission on base/PB-01 state.
- Multiple rat instances do not alias state or DOM identity.
- No production report, DEV label, or test direction reveals PB-01 or protected-concept disposition.
- Existing frozen assets remain byte-identical.

## Explicit non-requirements

- No free walking, pathfinding, combat system, rat AI, generic quest engine, construction simulation, tenant simulation, backend, real-time scheduler, new currency, or property-management dashboard is required.
- No new art beyond the candidate package is required for the core path.
- No runtime code or schema modification is authorized by this Creative handoff itself.
