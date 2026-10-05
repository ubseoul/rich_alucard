# BTF OPEN — UBE/HQ DECISIONS 001

Status: **D1–D6 DECIDED / DISPOSITIONED** by Ube/HQ for the rough-complete OPEN build on 2026-09-27.

This record preserves the Engineering 06 finding beneath each decision, then records the subsequent HQ disposition.
Spoiler-safe. No disposition authorizes SEALED / PLAYER-BLIND inspection, hidden-patch installation, frozen-Art changes,
Combat 2.0 changes, economy/fame rebalancing, deployment, or rigorous testing in this pass.

### D1 — CRACK
- **Status:** DECIDED / DISPOSITIONED.
- **Engineering 06 finding:** `CRACK 🔒` is shown locked at the end of CLOSE+ dates and at A44 night 4; beats that call
  for it use “she stays.” + a non-graphic fade + next-WAKE bedroom company. CURRENT_CANON says the threshold, roll,
  outcome, and progression are TBD; VOL 3 §6.1 numbers are proposals pending Ube.
- **HQ decision:** Keep CRACK locked for the current build. Do not implement the proposed threshold, roll, outcome,
  progression, or any new CRACK behavior.
- **Runtime disposition:** No change required; the existing locked presentation remains authoritative for OPEN.

### D2 — Economy/pacing against the fame floor
- **Status:** DECIDED / DISPOSITIONED; major rigorous-playtest question recorded.
- **Engineering 06 finding:** VOL 3 prices include Party Hall $250K and rooms $40K–$400K, against $100K per 28 days
  and fame eligibility from Day 35. In simulated ordinary lives (5 personas × seeds, including a Party Hall saver),
  fame fired on Day 36 and no life afforded the Party Hall. That kept A26 → A27 Sir Bonesworth, hosting,
  DRAGON NIGHT/Jade, and most castle rooms outside the ordinary pre-ending path; A33 also was not reached. The paths
  work when reached through DEV/saver setup.
- **HQ decision:** Preserve the current economy, prices, income, fame floor, and progression tuning.
- **Testing disposition:** Party Hall / Bonesworth / castle-room affordability is a major rigorous-playtest question.
  Testing—not this closure pass—will determine whether prices, income, or fame timing should eventually change.
- **Runtime disposition:** No change required; no rebalance was made.

### D3 — Vampire pressure sources (Hilt, A23)
- **Status:** DECIDED / DISPOSITIONED.
- **Engineering 06 finding:** A21 → A23 Hilt triggers at pressure warning; A23R is player-routed. OPEN’s two existing
  conversions can reach only pressure 3 while the provisional warning is 4. VOL 1 §9.5 establishes pressure, but
  thresholds/timing belong to protected content and no OPEN conversion flow exists for the other women.
- **HQ decision:** Hilt waits for the hidden/protected content installation. Do not lower the OPEN warning threshold
  and do not invent additional conversion flows. Keep A23 DEV-reachable for testing.
- **Runtime disposition:** No change required; A23 remains DEV-reachable and A23R remains player-routed.

### D4 — ONLYVAMPS collisions
- **Status:** DECIDED / IMPLEMENTED.
- **Engineering 06 finding:** ONLYVAMPS already had creator tiles, subscriptions, and the “you know her. this is weird
  now.” collision path. VOL 1 says some women have pages and Rich may discover someone he knows, but did not name
  them; the dormant runtime candidate roster was an Engineering guess and was never granted.
- **HQ decision:** Velvet is the sole named/known woman with an ONLYVAMPS page in the rough-complete OPEN build. All
  remaining creator tiles are anonymous adult creators with no relationship arc or broader canon significance. Rich
  encounters Velvet’s page through ordinary ONLYVAMPS browsing, not as a relationship/date/progression unlock. Do not
  add other named creators.
- **Runtime disposition:** Replaced the guessed named roster with stable anonymous creator tiles and one person-linked
  Velvet tile. Velvet is the sole known-person collision; anonymous subscriptions, cancellation, renewal, and save
  behavior continue to use the existing system.

### D5 — Adult nightlife beyond parties
- **Status:** DECIDED / DEFERRED TO FUTURE EXPANSION.
- **Engineering 06 finding:** OPEN establishes Lane 3 parties, raves, shows, one concert, and ONLYVAMPS with separate
  swappable packages. It supplies no strip-club, dancer, or adult-nightlife loop; Engineering 06 built none.
- **HQ decision:** Adult nightlife is deferred to a future expansion. Do not build a strip-club/dancer/nightlife system
  in this pass. Existing OPEN parties, raves, shows, and ONLYVAMPS remain.
- **Runtime disposition:** No change required.

### D6 — Frozen-Art staging conflicts
- **Status:** DECIDED / DISPOSITIONED.
- **Engineering 06 finding:** Approved optional states conflicted with already frozen surfaces or cast composition:
  Tasha `stage_rush`, Vicky `doorway`, J-Circle’s A33 entrance, June `working`, and three Ship 014 bedroom overlays.
- **HQ decision:** Do not modify frozen Art. Prefer valid staging without the conflicting layer where that requires no
  change to approved/frozen art; otherwise leave the conflicting optional asset/layer unwired. Do not reopen Art
  production solely to close these presentation conflicts.
- **Runtime disposition:** No art or runtime change required. Existing valid non-conflicting staging remains; the
  conflicting optional J-Circle, June, and bedroom layers remain unwired, as do any Tasha/Vicky condition layers that
  cannot be used without changing their frozen surface keys.
