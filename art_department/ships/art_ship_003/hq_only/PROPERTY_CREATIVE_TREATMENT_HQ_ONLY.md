# PLAYER-BLIND — HQ ONLY

# The Property: Creative Treatment

**Package:** MASSIVE PUSH 001 — THE PROPERTY  
**Status:** Creative candidate  
**Working property label:** Paloma Fourplex / internal ID `property_la_4p_01`  
**First-play target:** approximately 25–35 minutes, expandable toward 40 through optional inspection rather than mandatory padding  
**Later-use target:** property ownership card, income/pending-repair status, occasional authored follow-up events

Do not expose this document, its phase names, choice outcomes, optional beats, protected-concept decision, or surprise proposal in player-facing material.

## Creative promise

Rich wants rental income. He follows a plausible opportunity, meets a capable real-estate professional, inspects a building that is almost boring enough to be a good idea, discovers a problem much larger than the disclosure language, makes practical and ridiculous decisions under pressure, uses the defect as leverage, and leaves as an owner.

It should feel like Rich wanted something, went somewhere, and some bullshit happened—not like he accepted a quest from Shannon.

The property is a modest fourplex: meaningful because it can create recurring income and future situations, attainable because it is worn and mispriced, and visually specific enough to become a recurring place. No canon address or neighborhood is required. “Paloma Fourplex” is a production working label, not locked lore.

## Shannon

### Functional identity

Shannon is an adult real-estate agent who handles small income properties and distressed-but-viable listings. This is role definition, not major backstory. She is competent, dry, observant, and allergic to euphemism. She does not pretend a bad building is charming; she converts bad facts into negotiating leverage.

She remains useful in ordinary situations because she understands access, disclosures, leases, inspections, vendors, and seller behavior. She remains useful in Rich situations because she can update her vocabulary when reality becomes ridiculous without becoming passive or hysterical.

### Voice rules

- Short declarative sentences.
- Professional terms used as comedy because the visible situation exceeds them.
- One dry observation is stronger than five jokes.
- She asks Rich what he wants and then acts on the answer.
- She does not flirt by default, explain Rich to himself, or become impressed merely because he is Rich.
- When surprised, she documents first and reacts second.
- Her recurring bond with Rich is pragmatic trust: he makes strange decisions; she can still close.

### Visual identity

The candidate sprite establishes plum/cream/charcoal/oxblood, a document bag, keys, asymmetrical natural curls, and grounded posture. Neutral is her default. The one reaction state is contained disbelief, never screaming panic.

## Adventure shape

The flow below is authored as a connected desire-driven night. Phase IDs are implementation handles, not player-visible objectives.

### 0. Ordinary life / discovery — `property_discovery`

Entry is the existing bedroom/phone life loop. RealMoneyRealEstate becomes the relevant lane, or VampGPT can surface it as a money opportunity if that app remains the routing authority.

Player-facing opportunity card:

- Label: `FOURPLEX / AS-IS`
- Short summary: `FOUR DOORS. ONE PRICE. SELLER WANTS SPEED.`
- Status detail: `INCOME PROPERTY. INSPECTION REQUIRED.`
- Choices: `SEE IT` / `NOT TODAY`

No exact price is authored here. Engineering/economy must supply affordability and transaction values from the canonical budget system. The listing should communicate that the property is within meaningful reach because of condition and seller urgency, not because Rich is already endgame-rich.

The action is voluntary. Rich sees a way to own something that pays him and decides to look.

### 1. Travel / arrival — `property_arrival`

Use a brief existing-style location transition, then the exterior candidate. Rich and Shannon stand on the open sidewalk/drive field at proposed 1.25× scale.

Shannon establishes four facts without dumping lore:

1. Four units.
2. Some existing lease/income value, exact occupancy left to systems.
3. Seller wants an as-is close.
4. The disclosure mentions “pest activity” and an odor.

She hands Rich no quest. She asks whether he wants the numbers first or the building first.

Player choice:

- `SHOW ME THE MONEY` — Shannon gives a short systems-populated income/expense summary.
- `SHOW ME THE BUILDING` — inspection begins immediately; the numbers remain accessible as an optional hotspot.

Both preserve agency and pacing without branching the entire production.

### 2. Exterior inspection — `property_exterior_inspection`

The player may inspect the visible items in any order:

- Meter bank: suggests separate-unit billing and a real landlord object.
- Stair/rail: obvious repair item.
- Courtyard/doors: four-unit fantasy.
- Main entry: proceeds inside.
- Numbers: opens a compact runtime panel; no new art.

Each interaction is one observation, one Shannon response at most, then control returns. Do not turn the space into a checklist UI. The player can skip directly inside.

The exterior must remain ordinary. No rats, moving shadows, supernatural effect, or foreshadow text appears here.

### 3. Base interior / property fantasy — `property_interior_base`

Load the interior base without the problem overlay. Rich and Shannon enter at proposed contact `y=352`, scale 1.25×.

Available inspection hotspots:

- Kitchen recess / cabinet condition.
- Wall patch / water stain.
- Floor condition.
- Closed interior door.
- Low maintenance panel.
- Paint can.

The order is free. Three inspected items are enough to naturally trigger the next interruption, but the player can inspect all six. There is no visible objective counter. The scene should feel like Rich looking at something he may buy.

Shannon frames defects as priceable facts. Rich's attention stays on ownership and income, not renovation simulation.

### 4. First interruption — `property_first_sign`

Trigger from one of three conditions:

- Player inspects the maintenance panel.
- Player inspects three other hotspots.
- A short idle threshold passes after two inspections.

Apply only the pawprint/debris portion of the problem overlay if Engineering supports a mask or sublayer; otherwise apply the full overlay with the panel still visually closed until the next beat through a small runtime occlusion. A heavy impact comes from behind the low wall, followed by a second impact from somewhere that should not physically connect to it.

Shannon changes “pest activity” to “material fact.”

Player response:

- `OPEN THE PANEL`
- `CHECK THE KITCHEN`
- `WAIT`

These determine staging order, not whether the adventure continues.

### 5. Rat reveal / visible problem — `property_rat_reveal`

The full problem overlay becomes visible. One giant rat enters using `giant_rat_alert_96x64.png`, at 1.25×, anchored on the same floor plane. It is large enough that nobody can plausibly call it an ordinary rat.

The rat is not a gore enemy. It watches. It owns the silence for a beat. Shannon raises the key hand close and documents it.

Choice consequences:

- `OPEN THE PANEL`: rat appears near the access point; fastest reveal.
- `CHECK THE KITCHEN`: rat crosses behind Rich via scurry state and stops between Shannon and the panel.
- `WAIT`: rat emerges more slowly, giving the player the clearest scale comparison and setting the condition for the optional PLAYER-BLIND proposal.

No combat UI appears automatically. This is first an inspection situation, not an encounter reskin.

### 6. Escalation / player agency — `property_rat_pressure`

More movement is implied through sound, foreground crossings, and reuse of the three rat states. Show at most three simultaneous rat instances. Do not commission variants merely to fake a swarm. The screen must always show at least one rat when narration refers to one.

The rats push through the room toward the low access point and kitchen. Their behavior is territorial and coordinated enough to be funny, not explained as a new species civilization.

Player chooses an approach:

#### `BLOCK THE KITCHEN`

Rich and Shannon cut off the easiest route. Use scurry and recoil states. The rats retreat through the access opening after damaging more baseboard. This is the practical-control response.

#### `OPEN IT WIDER`

Rich gives the rats a clean exit and watches where they go. They leave faster, but the visible scale of the problem becomes undeniable. This produces the strongest disclosure leverage.

#### `STAND YOUR GROUND`

Rich refuses to yield actor space. Use alert, scurry past, and recoil without combat. Shannon moves only enough to preserve her keys and documents. This is the most character-forward response and can set the optional surprise condition if `WAIT` was previously chosen.

All three converge on the rats withdrawing, the room remaining visibly damaged, and Shannon contacting the seller from inside the unit. The difference is a small saved approach flag and later flavor, not a giant mechanics tree.

### 7. Negotiation / ownership decision — `property_offer`

Shannon states that the seller's disclosure materially understated the condition. She can reopen the deal immediately. This turns the absurd problem into landlord leverage.

Player choices:

- `CUT THE PRICE` — Shannon pushes a lower systems-defined acquisition cost or repair credit. Recommended default.
- `BUY IT AS-IS` — fastest ownership; preserve a larger pending-repair burden.
- `GO TO THE CURB` — return to exterior for one quiet decision beat; player may submit either offer or leave for now.

`GO TO THE CURB` is a real pause, not failure. If the player leaves, the opportunity remains available until the seller timer/availability rule—if any—is explicitly designed by HQ. Do not invent a hidden fail timer.

At commitment, show the property thumbnail/card, systems-defined transaction result, ownership status, and pending condition. Shannon confirms the close in plain language.

The ownership line supplied in the brief may land here or on the exterior after the close:

> That's my fucking property now.

This is the broad fantasy payoff and may be treated as HQ-supplied language.

### 8. Return to ordinary Rich life — `property_return`

Use the existing return transition and bedroom. Do not replay the inspection on later ownership visits.

Persistent visible consequences:

- `life.ownership.properties[property_la_4p_01]` or Engineering's equivalent.
- Property card uses `property_ownership_thumbnail_96x96.png`.
- Status may expose `OWNED`, income readiness, and pending repair/problem in systems language.
- Shannon becomes a persistent contact in the real-estate lane.
- Later interactions start from ownership management, visits, income, or authored events—not acquisition replay.

No automatic income amount, cadence, repair duration, or monthly reset is authored by Creative.

## Optional PLAYER-BLIND creative surprise — proposal PB-01

**Trigger:** Player selected `WAIT` at the first interruption and `STAND YOUR GROUND` during pressure.  
**Delivery:** One later safe-boundary return visit or phone follow-up after ownership, never during the acquisition climax.  
**Visual reuse:** Load the clean interior base without the problem overlay. The access panel is closed again. No new art is required.  
**Beat:** Shannon reports that the access panel, damaged baseboard, and loose wall patch have been repaired overnight. No vendor was sent. The paint can is empty. She refuses to call the repair “good,” but confirms it is competent.

Purpose:

- Rewards restraint and observation without currency or a large branch.
- Turns the property problem into a future possibility.
- Uses the existing clean/base state as a surprising visual change instead of commissioning a secret illustration.
- Preserves ambiguity. The rats are not canonized as contractors, tenants, magical beings, or a civilization.

Suggested Shannon notification:

> I did not send a contractor. The panel is closed, the baseboard is patched, and somebody used the paint. I am documenting that sentence and moving on.

No important Rich reply is required. Optional reply candidates remain in the voice-pass file.

HQ may accept, modify, or reject PB-01 without affecting the core package.

## Cryptrat disposition — protected

**RESERVE. No direct appearance in this arc.**

Do not use the protected line, weapons, crypto/money iconography, a boss silhouette, foreshadowing sound, secret text, clothing, jewelry, or an “elite rat” variant. The ordinary giant-rat family is intentionally material-poor and property-specific. PB-01 does not identify the rats as Cryptrat or as part of a Cryptrat organization.

This preserves the long-term concept's impact and prevents casual enemy dilution.

## Duration and pacing

Expected first play:

- Discovery and travel: 3–5 minutes.
- Exterior meeting/inspection: 5–8 minutes.
- Interior inspection: 6–10 minutes.
- Rat situation and choices: 6–9 minutes.
- Negotiation, ownership, return: 4–6 minutes.

Natural range: approximately 24–38 minutes depending on optional inspection and reading pace. Do not add extra rooms, rats, dialogue, or repeated choices merely to hit duration.

## Production discipline

- Every spoken line must identify its speaker.
- Narration is not placed over an important actor or rat.
- Shannon neutral/reaction states are enough; runtime staging carries most emotion.
- At least one rat is visible whenever the text makes a rat-specific claim.
- Use no more than three simultaneous rat instances.
- No rat combat is required for the core path.
- Rich's important dialogue remains subject to the voice pass.
- The final ownership transaction depends on economy/system authority, not Creative numbers.
