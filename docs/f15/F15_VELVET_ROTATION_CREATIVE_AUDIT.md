# F15 VELVET ROTATION — Creative Audit + Design Spec (DESIGN ONLY)

**Status:** DRAFT — design only. No runtime code, data, art or save changes are proposed in this commit.
**Scope:** Roxy, Emerald, Rosalyn — the three RAINMAKER dancer routes ("She fw Me Levels" 1–4) in *Rich Alucard: Before the Fame*.
**Spoiler class:** OPEN to Ube (Ube authored the routes).
**Companion file:** [`F15_RECONCILIATION_ITEMS.md`](F15_RECONCILIATION_ITEMS.md) — every missing, uncertain or board-dependent item, kept separate so UNDERLORD can check it against the current production board.

---

## 0. Authority, evidence and tags

### 0.1 What this audit used

| Source | Where | How it's treated |
|---|---|---|
| UNDERLORD Character Relationship Packet (file `v0_2_1`; the title inside says `V0.1`) | Ube upload (not in repo) | **Canon intent, verbatim.** Levels 1–4, Core Thoughts, the "WHAT WE CURRENTLY AGREE ON" list. Nothing in it is rewritten here. |
| Final pixel art: Roxy, Emerald, Rosalyn | Ube uploads plus the packet's embedded images (not in repo) | **Visual authority, per the brief.** It has **not** been ingested, registered or frozen. See §7. |
| `dragon-dance-loop-twice.mp4` (Emerald), `gold.mp4` (Rosalyn) | Ube uploads (not in repo) | **Dancer animation authority, per the brief.** Each is 496×592, 24 fps, about 6 s and 144–145 frames, with an audio track. |
| Brief "known authority" list (money thrown, one date per WAKE, REQUEST at L1, etc.) | The OVERLORD prompt for this task | Binding for this audit. Where the list depends on board detail I wasn't given, it's marked `SOURCE_REQUIRED — BOARD NOT PROVIDED`. |
| OL-017 Open Visual Character Authority | `art_department/production_authority/OL017_…md` | Used **only within its stated scope.** It covers Lane A characters. The ten RAINMAKER dancers are explicitly **out of its scope** (Lane B, governed by `RAINMAKER_Dancer_Generation_Sheets_and_Wardrobe_Levels`, which is **not in the repo**). For this audit it is authoritative only for Big Bing, Granny Bing, DJ Peachtree and the 21+ adults rule. |
| Frozen Big Bing (NEUTRAL and NO) and Granny Bing (CALLING NUMBERS) | `origin/art/f01-feel-lock-freeze` (`art_department/visual_a/…`) | **Frozen pixel authority.** Frozen 2026-09-30. Not yet on `main`. |
| F06 MAKE IT RAIN core, tunables and production port | `origin/integration/overlord/pre-fcpb-walkthrough-fixes` → `js/frag/F06/*`, `docs/engineering/F06_*.md` | The **feel being preserved.** Core and tunables are approved byte-for-byte. |
| Existing world: dates, relations, castle, combat 2.0, minigames, places, people, environments | Same integration branch → `js/data/btf/*`, `js/systems/*`, `js/engine/combat2.js` | Shows what systems already exist for F15 to reuse. |
| Asset registers | `main` (313 entries) and the integration branch (551 entries) → `art_department/ASSET_REGISTER.json` | Shows what art exists. See §7. |

Not used and not reconstructed: the RAINMAKER OPEN patch text (THE BING, REQUEST, BIG TIPPER, POLE/FLOOR/VIP modes, wardrobe levels), the Dancer Generation Sheets, and any F12/R4/F15 production-board text. Any requirement that would need one of those is marked **`SOURCE_REQUIRED — BOARD NOT PROVIDED`**. No SEALED, HQ-only or PLAYER-BLIND material was opened.

### 0.2 Tags used in this document

- **[SOURCE]** — CAN IMPLEMENT FROM SOURCE. The packet, the brief, frozen art or existing code already settles it.
- **[COOK]** — UBE COOK WINDOW. The space is deliberately left for Ube. Seeds are deliberately unfinished.
- **[SOURCE_REQUIRED]** — Missing input. **`— BOARD NOT PROVIDED`** means the newer OVERLORD board probably holds the answer.
- **[OPTIONAL]** — Nice to have. The route works without it.
- **[PROPOSED]** — A structural suggestion from this audit. It is **not canon** until Ube or HQ accepts it.
- **[VP]** — A Rich line that needs a voice pass. This audit writes **no** final Rich lines.

---

## 1. Character diagnosis

The three routes already have something most romance routes don't: **each woman's Core Thought is a different relationship to depending on someone.** The packet's money details line up with this too, which is the key to telling them apart (see §3). The visual designs share one template, so **personality, behavior and animation have to do all the differentiation work.**

### 1.1 ROXY — anthro wolf
**Core Thought (canon):** *"If I rely on someone, I'll get hurt."*

**What the art says (visual authority, not frozen):**
- Dark charcoal fur with lighter grey markings.
- A huge wild near-black mane pulled into a high ponytail with a gold hair cuff.
- Red-brown eyes and a small black nose. Upright wolf ears.
- A single gold hoop earring and a gold bracelet.
- A mint/teal crop top and denim shorts with a gold button.
- Teal platform ankle-strap heels, with claws showing at the toes.
- A big bushy tail with a pale tip.
- Her expression is a sideways, slightly guarded glance.

**First impression (target):** confident and in control. She's the one deciding how this goes. That reads as **ownership**, not "tough girl." Canon: she strips *because she wants ownership over her own future*, and she studies data science.

**Chemistry with Rich:**
- Rich is straightforward, doesn't overthink, and spends freely.
- Roxy is the woman who **won't let him spend on her.** She pays the whole bill at L1.
- So the comedy and the tension come from the same place: Rich's money doesn't work on her. That's rare in a game where Rich's money works on everything.

**Progression shape:** control → competition → a crack → being cared for when she can't refuse it.
- L4 is "Roxy gets sick." It's the one situation where she *can't* do it herself. The canon is built so she relies on Rich without having to decide to.

**Emotional specificity risk:**
- If the L3 hard hit is over-explained, she becomes "the trauma girl." Canon already guards against this ("Nothing is explicitly explained"), and that has to hold everywhere: posts, texts, home lines, receipts.
- Her fur matters. **Never draw marks or bruises.** The tell has to be behavioral.

**Funniest opportunities:**
- "Loves animals, hates cats." Rich can own a sphynx cat in this game. → [COOK] CW-R3
- She's competitive at boxing against a vampire boss.
- A data-science student near a minigame whose score is literally *hype per dollar*. → CW-R2
- A vampire watching vampire movies with her. → CW-R10

### 1.2 EMERALD — dragon / anthro dragon (horns, scales, tail)
**Core Thought (canon):** *"My responsibilities matter more than my dreams."*

**What the art says:**
- Green scaled skin, with a lighter belly and inner-limb scale pattern.
- A long dark-green mane in a high ponytail with a gold band.
- Two small cream horns, plus **finned or frilled ears** (flagged in CW-E12).
- Brown eyes and purple triangle drop earrings.
- A purple one-shoulder top, purple denim shorts and a gold bracelet.
- Lilac platform heels with claws.
- A long tail with cream dorsal spikes.
- The dance video shows a **floor routine.** She faces away, head down so her face is hidden, and her tail is the expressive instrument (it curls and sways on the beat).

**First impression (target):** warm, hard-working and a little tired. **She works the floor, she doesn't perform to the room.** Her face is hidden in her routine, and that's a gift: the one dancer whose face you don't see is the one whose real self is somewhere else (singing).

**Chemistry with Rich:**
- She asks *him* for help on day one (L1 cleaning).
- She treats Rich like a coworker before anything else, which is very different from a client.
- Rich is a working man in BTF too: he pulls ramen shifts at SLURP DYNASTY for tips. Their bond is **two people who work.**

**Progression shape:** coworker → learning her obligations (pre-med, the daily calls to her father, the money she sends home) → she depends on someone for the first time (L3 lost item) → a dream of her own (L4 recital, singing).

**Emotional specificity risk:**
- The "sacrificing daughter" trope.
- Specificity has to come from the family details. Who is her father? What language do they speak? What does she send, and where? None of that is canon yet: CW-E4. Do **not** fill it generically.

**Funniest opportunities:**
- Cleaning a castle *with a vampire who has a maid* (Marisol). → CW-E2
- Rich's fish weakness vs. her fin ears. → CW-E12
- Rich's strip-club instinct to throw money at a performer, at a **recital**. → CW-E10

### 1.3 ROSALYN — human
**Core Thought (canon):** *"The real me isn't enough."*

**What the art says:**
- Dark-brown skin and long black hair: a high ponytail with a gold tie and a long braided and curled tail.
- Gold hoop earrings and a gold bracelet.
- A magenta sleeveless top, black shorts and sheer dark tights.
- Black heeled ankle boots.
- The `gold.mp4` routine is the **most choreographed** of the three: back to the crowd → bend and drop → look back over her shoulder → stand → **turn to face the camera with a smile** → turn to profile and **walk off**.
- Note: one upload has a white background; the packet and video versions are on black.

**First impression (target):** polished, flawless and *agreeable*. She's the most "performed" of the three, on stage and off. Her routine has a beginning, middle and exit, like a person running a script.

**Chemistry with Rich:**
- At L1 she has **no chemistry on purpose.** She mirrors him ("I like what you like.") and splits the bill exactly.
- The route is the slow arrival of her actual taste, which is **Yuck Wars.**
- Rich's straightforwardness is the right partner. He isn't impressed by performance and doesn't overthink. He just keeps showing up after seeing the real her.

**The world-level joke (from canon):**
- In a city of vampires, dragons, ghosts, werewolves and zombies, the human woman's terrifying secret is that she's a nerd.
- Her L4 emergency is a **cockroach.**
- The comedy and the Core Thought are the same thing.

**Emotional specificity risk:**
- "Secret nerd girl" is a stock trope.
- The specificity lives in **Yuck Wars itself** (Ube's parody universe: names, lore, what she loves about it) and in **what she runs from twice** (L2, L3).
- Both are Ube's to cook: CW-S4, CW-S6, CW-S9.

**Funniest opportunities:**
- At L1 she agrees with *anything*, including Octopus Brain nonsense. → CW-S2
- The exact-half bill split down to the cent. → CW-S1
- Rich running into her at a Yuck Wars convention. → CW-S8
- The cockroach boss. → CW-S12

---

## 2. Route beat map

Legend: **Canon** = packet, verbatim intent. **System** = the existing system that carries the beat. **Played** = what the player does, as opposed to what they're told.

### 2.0 The shared spine — [PROPOSED], within the brief's known authority

1. **Club (F06 MAKE IT RAIN, feel unchanged).**
   - Money thrown while a dancer is on stage adds to **her** cumulative total.
   - Thresholds T1–T4: **[SOURCE_REQUIRED — BOARD NOT PROVIDED]**.
   - Whether *wasted* bills count: **[SOURCE_REQUIRED — BOARD NOT PROVIDED]**. The brief says "money thrown," so the default is that all flicked money counts.
2. **Level Ln becomes available** when all of these hold:
   - her total ≥ Tn;
   - L(n−1) is complete;
   - **no F15 date has happened this WAKE** (brief: one date per WAKE maximum).
3. **Delivery.** L1 starts from the club, right after the round that crosses T1. L2–L4 arrive through the existing phone and World Events channels at safe boundaries. Rosalyn's L4 arrives as an *incoming call*.
4. **REQUEST unlocks at L1** (brief).
   - Before L1, who dances is the rotation ("VELVET ROTATION"). After L1 you can call her up.
   - What REQUEST does exactly, and how the rotation works: **[SOURCE_REQUIRED — BOARD NOT PROVIDED]**.
5. **No club income.** Nothing in F15 pays Rich, refunds Rich or creates dancer favor currency (brief, and the F06 port's "no payout").

### 2.1 ROXY

| L | Canon beat | Location (existing?) | System | Played, not told | Rich's role | Cook windows |
|---|---|---|---|---|---|---|
| 1 | Confident. Strips for ownership of her future. Studies data science. Doesn't split the bill; pays the whole thing. Gives Rich her number. | Venue unspecified **[SOURCE_REQUIRED]**. It starts at the club. | Club approach → short date scene (adventure DSL). **Money ledger:** Rich's spend for the date is **$0** [PROPOSED]. | The receipt and ledger show she paid. Her number arrives as a new InstaHoe/TEXTS contact (the existing `RARelations.meet` path). | Lets her. Gets out-controlled. | CW-R1, CW-R2, CW-R13 |
| 2 | Boxing gym date. Surprisingly competitive. Ramen afterward. Talks about loving animals. Says she hates cats. | **Boxing gym: no environment exists** (§7). Ramen: SLURP DYNASTY or Little Tokyo (both frozen). | **Existing combat 2.0** as a spar (`noPenalty`, like the existing training-dummy spar). Her enemy card has a pattern, telegraphs and three Octopus options. Ramen is a scene (see §3.3). | Her pattern **escalates** when Rich lands hits. That's "surprisingly competitive," and it's *played*. Her hit reactions are normal and readable here. That sets up L3. | Sparring partner, then dinner guest. | CW-R4, CW-R5, CW-R3 |
| 3 | Rich notices something feels different. A hard hit during boxing. "Rich asks if she's okay." She says quietly: **"...I've gotten used to it."** She changes the subject. Nothing explained. | Same gym as L2. **Repeating the place is deliberate.** | Same combat setup as L2. The **existing heavy-reaction rule** (one hit ≥ 20% of max HP → heavy presentation) is the instrument. | **The difference from L2 is the story.** The heavy reaction fires, but her response doesn't match it. She resets her stance with no flinch. Who delivers the hit is **Ube's call** (CW-R6). The one explanatory line is spoken once and never repeated anywhere in the game. | Asks. Doesn't push. Doesn't fix. | CW-R6, CW-R7, CW-R8 |
| 4 | Roxy gets sick. Rich brings food over. Vampire movies together. Becomes romantic naturally. | **Roxy's apartment: no environment exists.** | Scene. Optionally the existing kitchen or SLURP to make the food. **Money ledger:** the first Roxy beat where *Rich* pays [PROPOSED]. | She can't refuse help, so the ledger finally shows Rich's spend. That's her first reliance, shown by a number instead of a speech. | Shows up. Stays. | CW-R9, CW-R10, CW-R11, CW-R14 |
| post | — | Existing date spots. Movie room. Pet Crypt. | Date loop (`RADateContent`). Companion at CLOSE+. Posts. Neglect text. Club reactions. | — | — | CW-R12, CW-R15, CW-C9 |

### 2.2 EMERALD

| L | Canon beat | Location (existing?) | System | Played, not told | Rich's role | Cook windows |
|---|---|---|---|---|---|---|
| 1 | Asks Rich to help clean the castle. They bond while working. Ramen afterward. | **Which castle is ambiguous [SOURCE_REQUIRED].** Candidates that exist: Rich's throne room as `throne_party_mess` (frozen overlay), or `neighbor_castle` "THE CASTLE DOWN THE BLOCK" (frozen). | **"Existing chores": no chores system was found in the repository** (§7, reconciliation list). The closest existing pieces are the `MAID` / Marisol scene (flavor only) and the `throne_party_mess` environment. | Cleaning should be *done*, not described. Tap-to-clean through an existing minigame or interaction **[SOURCE_REQUIRED — BOARD NOT PROVIDED: which chores system]**. | Coworker, not boss. | CW-E1, CW-E2, CW-E3 |
| 2 | Pre-med. Calls her father every day. Sends money home. Works because her family depends on her. | Open. | Scene, plus the phone. **Action, not exposition:** she steps away mid-date to take the daily call [PROPOSED]. | Rich overhears or watches the call. He isn't told. | Witness. **Never pays her family's bills** (§5 "Do not"). | CW-E4, CW-E5, CW-E6 |
| 3 | Panics after losing something very important. Asks Rich for help. One of the first times she truly depends on someone. | **Existing locations** (brief). Proposed search set: places the route has already been. | Search through existing `RAPlaces` hotspots or locations. **The item and where it's found are Ube's.** | The *ask* is the climax. Searching is how Rich answers it. Finding it at a place that hints at singing would set up L4 [PROPOSED, seed only]. | Searches. Doesn't lecture. | CW-E7, CW-E8, CW-E9 |
| 4 | Invites Rich to a recital. Rich discovers singing, not medicine, is her true passion. Rich encourages her to believe she deserves dreams of her own. | **Recital venue is open.** Existing candidates: Hollywood Hotel Ballroom, Hollow Bowl, the Catacomb (all frozen). | Scene. Optional audio (her voice). | **The single most important rule:** she performs something that isn't for money, and Rich doesn't throw money at it. (Whether his hand *goes for the stack* is CW-E10.) Rich's encouragement should be an action. A speech would turn it into "fixing." | Audience. Not a sponsor. | CW-E10, CW-E11, CW-E14 |
| post | — | Existing music room (castle). | Date loop. Companion. Posts. | — | — | CW-E15, CW-E16, CW-E17 |

**Note — [SOURCE_REQUIRED]:** the packet does **not** say Emerald's L4 becomes romantic. Roxy and Rosalyn's L4s explicitly do. Do not assume Emerald's does (CW-E14).

### 2.3 ROSALYN

| L | Canon beat | Location (existing?) | System | Played, not told | Rich's role | Cook windows |
|---|---|---|---|---|---|---|
| 1 | Fancy restaurant. Rich offers to pay. She insists on splitting exactly in half. Mirrors Rich's opinions: **"I like what you like."** Rich leaves thinking **"...something felt off."** | **No fancy-restaurant environment.** Existing candidates: `rooftop_dtla` (frozen, but it's a party scene), `duchess_castle` (gated), Peking Naija. | **Date "asks" system:** at L1 every answer **lands**, including contradictory or absurd Octopus answers [PROPOSED]. **Money ledger:** exactly half. | The player *feels* the wrongness. A system that usually pushes back stops pushing back. The home line is canon. | Offers to pay. Notices. | CW-S1, CW-S2, CW-S3 |
| 2 | Boba date. Rich casually mentions Yuck Wars. She lights up and nerds out. Realizes she's exposing herself. Runs away embarrassed. | **Kiki's Boba** (frozen; it's the only boba place in the game). | Scene. Her first *non-mirrored* answer. | Her mirroring breaks **because she can't help it.** The run-away is a visible exit from the scene. | Mentions it casually. Doesn't chase (to be decided). | CW-S4, CW-S5, CW-S6, CW-S7 |
| 3 | Rich accidentally finds her at a Yuck Wars convention: full cosplay, glasses underneath, a completely different person. She notices Rich, freezes, runs away. | **No convention environment.** Reuse options: Hollywood Hotel Ballroom or Party Hall (packed) plus Yuck Wars dressing as a *composited* delta, which needs Ube approval. | World encounter. Not a date she invited him to. | The second run-away has to **escalate**, not repeat: at L2 she runs from a sentence, at L3 from being seen whole. What Rich does *after* she runs matters most. | Lets her go, or something else (Ube). | CW-S8, CW-S9, CW-S10 |
| 4 | Calls Rich terrified because of a giant cockroach. Comedic boss battle. Rich visits her apartment, which is covered in Yuck Wars collectibles. They watch Yuck Wars together. Becomes romantic naturally. | **Rosalyn's apartment: no environment exists.** | **Existing combat 2.0** boss card (pattern, telegraphs, Octopus ×3). **Incoming phone call** through the existing World Events phone channel. | **She calls him.** After running twice, she reaches out. That's the progression, and it's played. The fight is comedy. The apartment is the real reveal. | Shows up. Sees everything. Stays. | CW-S11 to CW-S15 |
| post | — | Existing movie room. Kiki's Boba. | Date loop. Companion. Posts. | Payoff: the **first time she disagrees with Rich** [PROPOSED]. | — | CW-S16 to CW-S19 |

---

## 3. Differentiation problems

### 3.1 Inside the triad

| # | Problem | Evidence | Proposed handling |
|---|---|---|---|
| D1 | **One visual template** | All three art pieces share the same 3/4 standing pose and a high ponytail with a gold tie. All have a gold bracelet, crop top plus shorts, and platform/heeled footwear. Roxy and Rosalyn both wear gold hoops. Species and palette are the only big differences. | Don't redesign. Difference has to come from **dance language** (Emerald: floor, face hidden, tail; Rosalyn: choreographed turn and walk-off; Roxy: **missing**), **derivative states and props** (gloves; scrubs or phone; glasses or cosplay), and behavior. |
| D2 | **Two ramens** (Roxy L2, Emerald L1) | Canon requires both. The brief says they must feel meaningfully different. | **[PROPOSED] Ramen axis = who serves whom.** **Roxy:** Rich is the *customer*. She picks the spot, she pays, and Hina's existing stopwatch gives competitive Roxy something to beat. **Emerald:** Rich is the *cook*. He makes it at SLURP (his workplace) through the existing SLURP ticket, or in the castle kitchen. Each one maps onto her Core Thought: Roxy won't be served, Emerald is never served. |
| D3 | **Two "watch something at her place → romantic" L4s** (Roxy: vampire movies; Rosalyn: Yuck Wars) | Canon. | Same structure, opposite meaning. **Roxy's** is about *being cared for*: she's sick, she can't perform strength, Rich stays. **Rosalyn's** is about *being seen*: she talks, explains and rewinds, and her voice finally isn't a mirror. Keep the texture different: quiet vs. talkative, dim vs. bright collectibles. |
| D4 | **Rosalyn runs away twice** (L2, L3) | Canon. | Escalate (sentence → whole self) and make **Rich's response** after L3 the differentiator (CW-S10). L4 is her calling him. Running → reaching out is the arc. |
| D5 | **Three different money relationships** (this is the asset, not the problem) | Canon: Roxy pays everything. Rosalyn splits exactly half. Emerald sends money home. | Use the **money ledger and receipts** to show it. **Protect:** in a route system gated by money Rich throws at them, each woman redefining Rich's money is the thematic spine. |
| D6 | **Two boxing levels** (Roxy L2, L3) | Canon. | Same place on purpose. L2 sets the baseline (normal hit reactions). L3 breaks it. Don't change the venue. |

### 3.2 Against the existing BTF roster (repo evidence)

| # | Collision | Existing character (repo) | Risk | Proposed handling |
|---|---|---|---|---|
| X1 | **Emerald vs. JADE WYRMWOOD** | `jade`: green dragon woman, rare, "she keeps the receipt. she keeps everything." Frozen neutral + impressed. | **High.** Same color family, gemstone names, and a money-keeping trait close to Emerald's saving and sending. | Ube ruling (CW-E13). At minimum: no hoarding, receipt or treasure gags for Emerald. |
| X2 | Emerald vs. BLUEBERRY MAZDA, EMBERLY | `mazda_human` (dragon, Rich's hatched dragon, roost); `emberly` (dragon woman; heat, warm seats). | Medium. **Four** dragon women in the game. | Emerald avoids fire, heat and hatch gags. Her dragon traits are **scales, tail and claws** (and maybe fins, CW-E12). |
| X3 | **Roxy vs. MOONIE DORSEY** | `moonie`: werewolf. Big eater ("eats your steak too"), loud under full moon, "you scared of dogs?", Pet Crypt gift. Frozen neutral + wolfed-out. | **High.** Two wolf women. | Roxy is **never** the big eater, never full-moon-driven, never the butt of dog jokes. She's controlled, precise and paying. Ramen at Roxy L2 must **not** turn into an eating gag (Hina times *speed*, not quantity). |
| X4 | Rosalyn vs. KIKI | `kiki`: owns the boba shop; "orders for you. wrong on purpose." | Medium, or an opportunity. Rosalyn's L2 is at **Kiki's** shop. | Kiki deliberately orders *wrong*. Rosalyn orders *the same as Rich*. If Kiki is behind the counter, that contrast is free comedy (CW-S7). |
| X5 | Ramen vs. HINA / MR. OKADA | SLURP DYNASTY is Rich's job. Hina times how fast you eat. | Opportunity. | See D2. |
| X6 | Boxing vs. BRUCE LOOSE | Kung-fu legend enemy; teaches ONE-INCH PETTY. | Low. | Keep Roxy's fighting style clearly boxing, not martial arts. |
| X7 | Emerald cleaning vs. MARISOL | Marisol lives in the Maid Quarters and "judges everything." | Opportunity. | CW-E2. |
| X8 | Emerald's scales vs. THE TRAP | F05 records **dragon scale** as an S-grade Blood X ingredient (from Mazda's roost), and **THE BING** as a Trap sales channel ("dancers' clients"). | **High tone risk.** | **Do not** connect Emerald's scales to the Trap economy. Whether the dancers ever learn Rich sells at the Bing is an Ube/HQ decision (reconciliation list). |
| X9 | Title "VELVET ROTATION" vs. VELVET VANTABLACK | `velvet`: a frozen MEET+1 vampire influencer. | Low. | It's a naming echo only. Make sure no one assumes Velvet is part of F15. |
| X10 | Generic `nightlife_population.dancer` (frozen) | "named-actor clearance required". | Medium. | It must **never** stand in for Roxy, Emerald or Rosalyn. |

### 3.3 Structural genericness to avoid
- Three routes that each end "she opens up → romance" in one scene. Each route's emotional climax is at a **different level** in canon: Roxy at L3 (the crack), Emerald at L3 (the ask), Rosalyn at L4 (the call). Keep the weight where canon puts it.
- Rich "saying the lesson" (be yourself / you deserve dreams / you can rely on me). Canon note 2 says Rich doesn't fix them. The packet's own wording for Emerald L4 ("Rich encourages her…") is the riskiest beat for this, so it's a cook window (CW-E10).

---

## 4. Strongest existing moments — protect these

1. **"...I've gotten used to it."** Exact text. Played, not narrated (brief). Said once and never quoted back. No callback text anywhere: posts, receipts, memories, neglect texts, home lines. The **only** explanatory line. *Nothing is explicitly explained.*
2. **Roxy pays the whole thing.** A woman whose job is collecting Rich's money refuses his money. Don't soften it into "she let him get the tip."
3. **Rosalyn: "I like what you like." → "...something felt off."** Both exact. The player should notice the wrongness through play before Rich says the line.
4. **Rosalyn's exact-half split.** "Exactly" is the joke and the character. Precise, not approximate.
5. **Emerald asking for help** at L1 (a chore) and again at L3 (something that matters). The first ask is casual, the second is vulnerable. That echo is built in. Protect both asks as *her* initiative.
6. **"Singing — not medicine."** A reveal through attending, not telling.
7. **"Rich Alucard vs. a giant cockroach."** The final boss of the game's tone: a vampire lord, Blood Bath, a bug.
8. **Rosalyn at the convention: glasses under the cosplay.** That detail is Ube's. It's the image of the route. Keep it in the art brief (§7).
9. **The packet's agreement list:** different emotional journeys, Rich doesn't fix them, actions over exposition, gameplay in every relationship, personalities over visuals.
10. **F06 MAKE IT RAIN feel.** Approved core and tunables, byte-for-byte: 30 s rounds, $100 bills, 120 BPM beat, spotlight, fan, streak up to ×5, RAIN SCORE. F15 adds **presentation and attribution only**.
11. **Frozen Big Bing (NEUTRAL, NO) and Granny Bing (CALLING NUMBERS).** Club identity that already exists. Use the pixels exactly as frozen.
12. **Ube's dance loops.** Emerald's tail-led floor loop and Rosalyn's "gold" routine with its turn and walk-off. These are personality, not decoration.

---

## 5. Opportunities to connect existing systems and world

Everything below exists in the repository (integration branch), and every item is [PROPOSED] for F15 use.

| Existing system | Evidence | F15 use |
|---|---|---|
| **F06 RAINMAKER round summary** (`spent`, `hype`, `waste`, `bestStreak`, `rainScore`) | `js/frag/F06/production.js` saves `lastResult` | Roxy (data science) reacts to **RAIN SCORE = hype per dollar** in her post-round line (CW-R2). Wasted bills on the floor are a possible Emerald animation beat (CW-C3). **Core untouched.** |
| **Money ledger / sales channels** | `RAMoneyLedger`, `RASalesChannels` (`rainmaker:flick` expense) | Per-dancer attribution of thrown money. The **date bill as characterization**: Roxy pays $0 for Rich; Rosalyn exactly half; Rich pays for the first time at Roxy L4. |
| **Combat 2.0 enemy cards** (pattern, telegraph, Octopus charisma/recruit/roast, `noPenalty` spar) | `js/data/btf/combat.js`, the training-dummy spar in `w1_life.js` | Roxy spar (L2, L3). Rosalyn's cockroach boss (L4). |
| **Heavy reaction rule** (≥ 20% max HP), LOCKED canon | `combat2.js` `heavy:dmg>=e.max*.2`; `CURRENT_CANON.md` | The Roxy L3 instrument (CW-R6). |
| **Date loop** (`arrival`, `asks` + Octopus option, `reads`, `likesIt`/`meh`, `moments`, `richLine` [VP], `posts`, gifts, `homeLine` [VP]) | `js/systems/dating.js`, `js/data/btf/dates*.js` | Rosalyn L1 "every read lands." Post-L4 repeatable dates for all three. |
| **Relations ladder** MET/COOL/CLOSE/RIDE-OR-DIE, **companions at CLOSE+**, **neglect** (10 sleeps) | `js/systems/relations.js` | Post-L4: each woman becomes a combat companion with existing move *kinds*. Per-woman neglect text replaces the generic "it's cool. it's whatever." **Decision needed** on whether F15 levels map onto this ladder (reconciliation list). |
| **World Events + incoming phone** | `docs/RICH_ALUCARD_GAME_BIBLE.md` Foundation Wave 6 | Rosalyn L4's terrified call. L2–L4 invitations at safe boundaries. |
| **WAKE bus / night report** | `js/if1/wake_bus.js` | Enforce one F15 date per WAKE. An optional night-report line ("roxy paid again."). |
| **Receipts and memories** | `end:{memory, receipt}` in adventures | One receipt caption per level (all [COOK]). |
| **Castle rooms**: movie room, music room, kitchen, maid quarters | `js/systems/castle.js` | Movie room (Yuck Wars night). Music room (Emerald post-L4, CW-E15). Kitchen (food for sick Roxy). Marisol (CW-E2). |
| **THE CAT** (sphynx; frozen sitting, judging-combat and on-bed art; placeholder name pending Ube) | `relations.js` companions; art ship 014 | Roxy hates cats (CW-R3). |
| **SLURP DYNASTY minigame** (broths, noodles, toppings, JOLLOF topping "the Rich Special") | `js/minigames/slurp.js`, A08 | Emerald's ramen: Rich makes her ticket (CW-E3). |
| **Tristan** (close friend; brings 2 extra tickets — A41) | `w4.js` | A ready-made, in-character reason Rich is at a Yuck Wars convention (CW-S8 seed). |
| **Rich's family pings, Jollof Wars, Mom** | BTF W1/W5 | Rich's own family mirrors Emerald's daily call to her father (CW-E6). |
| **Granny Bing calls numbers; critiques Rich's shoes** (OL-017 MUST) | Frozen CALLING NUMBERS anchor | Club color. Bingo calls for each dancer (CW-C5). |
| **Big Bing** says the club's name in a low, slow voice; has a NO state | Frozen | Door ritual. Post-L4 door gag (CW-C5). |
| **DJ Peachtree** (Atlanta DJ) | OL-017 card; **no art yet** | Stage introductions = first impressions (CW-C1). |

### Do not
- Don't change F06 core or tunables, its round length, bill value, beat, spotlight, scoring or budget presets.
- Don't give Rich money from any F15 beat. No tips back, no dancer favor currency, no club-income system.
- Don't let Rich solve anything with money: Emerald's family obligations, Roxy's situation, Rosalyn's rent. Rich's money is what brought him in. It is never the answer.
- Don't make "I've gotten used to it" into a mechanic (no "absorbs hits" companion move for Roxy).
- Don't use Vampire Bite or conversion on any F15 woman. Conversion is an existing system, but here it would be "fixing" and a canon shift. **Ube ruling if ever.**
- Don't connect Emerald's scales to the Trap (dragon-scale ingredient).
- Don't put Vampireflix in Roxy L4. It's on the **rejected** list (`CURRENT_CANON.md`).
- Don't use the generic nightlife dancer as any of the three.
- Don't exceed the current content tier. All dancers and women are 21+ (OL-017 rule). Romance is shown at the tier already in the game.

---

## 6. UBE COOK WINDOWS

Format: **CONTEXT** (spoiler-safe) · **WHY IT'S JUICY** · **SEEDS** (deliberately unfinished; ignore freely) · **QUESTION FOR UBE**.

### 6.1 Club and shared

**CW-C1 — DJ Peachtree's stage intro for each dancer**
- **CONTEXT:** Before the first round with each dancer, the DJ (Atlanta, ATL club classics) introduces her. This is the player's first impression.
- **WHY:** One line has to separate three women who share a pose template.
- **SEEDS:** "…put your hands together for the one and only ___ (she ain't splitting nothing)" · a stage name vs. the DJ's nickname for her · the DJ intro has a running bit that changes after L4.
- **QUESTION:** What does Peachtree call each of them on the mic, and what's his ATL catchphrase?

**CW-C2 — Stage names vs. real names**
- **CONTEXT:** It's unknown whether "Roxy / Emerald / Rosalyn" are stage names.
- **WHY:** A real-name reveal can be a quiet intimacy beat at no art cost.
- **SEEDS:** she tells Rich at L__ · Rich learns it from her phone screen (the father's call?) · they're real names and the joke is that nobody believes it.
- **QUESTION:** Stage names or real names? If stage names, what are the real ones, and when does Rich learn each?

**CW-C3 — Each dancer's in-round reactions (presentation only)**
- **CONTEXT:** F06's existing feedback events: HIT, MISS, OVERTHROW, ON BEAT, FAN, STREAK, STORM, WASTE.
- **WHY:** This is a personality layer that doesn't touch the core.
- **SEEDS:** Roxy reacts to *streaks* (she respects consistency) · Emerald glances at bills on the floor between beats, but **does she pick them up?** · Rosalyn's reaction is always the polished one, until after L3 it isn't.
- **QUESTION:** Pick one reaction per dancer that you want to be *the* one.

**CW-C4 — REQUEST: what Rich does and says**
- **CONTEXT:** REQUEST unlocks at L1. The mechanics are `SOURCE_REQUIRED — BOARD NOT PROVIDED`.
- **WHY:** It's the first time Rich *chooses her* in front of the club.
- **SEEDS:** Rich tells the DJ "___" · Big Bing relays it · Granny Bing calls it like a bingo number.
- **QUESTION:** What's Rich's request call, and does each girl react to being requested differently?

**CW-C5 — Granny Bing and Big Bing on Rich's favorite**
- **CONTEXT:** Granny Bing calls numbers into the DJ mic and critiques Rich's shoes (OL-017). Big Bing says the club name low and slow, and has a NO.
- **WHY:** Frozen characters with a built-in comic edge.
- **SEEDS:** a bingo call that's secretly about which girl Rich keeps requesting · Big Bing's NO, used once for the funniest possible reason after L4 · Granny's shoe critique changes depending on whose route Rich is on.
- **QUESTION:** What's Granny Bing's line when she clocks Rich's favorite?

**CW-C6 — The bill moment, three ways** *(see CW-R1, CW-S1, CW-E3)*
- **CONTEXT:** Each route has a money moment.
- **WHY:** It's the triad's spine.
- **SEEDS:** the receipt captions side by side would read like a three-panel joke.
- **QUESTION:** Do you want the three receipts to deliberately rhyme?

**CW-C7 — What "VELVET ROTATION" means in the world**
- **CONTEXT:** The fragment's title.
- **WHY:** It could be an in-world name (the club's rotation board, a DJ segment) or just a production label.
- **SEEDS:** a velvet rope · the rotation board on the wall · something Granny Bing calls.
- **QUESTION:** Is it diegetic? If yes, who says it?

**CW-C8 — Rich's make-it-rain instinct outside the club**
- **CONTEXT:** The core verb of F06 is throwing money at a performer.
- **WHY:** At a recital, a convention or a sickbed, the habit is either the funniest moment or the most telling one.
- **SEEDS:** his hand goes to his pocket and ___ · he throws exactly one bill · he does it, and she ___.
- **QUESTION:** In which of the three routes, if any, does Rich's club reflex fire in public?

**CW-C9 — After L4, does Rich still throw money at her?**
- **CONTEXT:** The routes go romantic while the club loop continues.
- **WHY:** This is the most awkward and honest question the system raises.
- **SEEDS:** Roxy: "___" (she'd rather he didn't, or she'd rather he did, because it's her job and her choice) · Emerald: she ___ · Rosalyn: she hits a Yuck Wars pose for one beat (CW-S19).
- **QUESTION:** How does each one react to Rich in the crowd post-L4? Does anything change for the player?

**CW-C10 — Socials**
- **CONTEXT:** The existing date loop has `posts`. InstaHoe and VampGram exist.
- **WHY:** What a dancer posts publicly vs. privately is characterization.
- **SEEDS:** Roxy never posts Rich · Emerald posts her family, never herself · Rosalyn has a second account.
- **QUESTION:** Does each of them post, and what's in each one's grid?

### 6.2 Roxy

**CW-R1 — L1: where she pays the whole thing**
- **CONTEXT:** Canon has no venue.
- **WHY:** The first "no" to Rich's money.
- **SEEDS:** she pays before Rich ___ · she already paid when he got there · she tips the server more than Rich would have.
- **QUESTION:** Where is L1, and what does she say (or not say) when she pays?

**CW-R2 — Data science, played**
- **CONTEXT:** She's studying data science. F06 computes RAIN SCORE = hype per dollar.
- **WHY:** She's the only person in the game who'd judge Rich by the metric.
- **SEEDS:** "your hype-per-dollar is ___" · she has a spreadsheet about ___ (careful: Brenda already has a castle spreadsheet) · she predicts Rich's next move in the spar.
- **QUESTION:** What's the one data joke that's *hers*?

**CW-R3 — "Loves animals. Hates cats." / Rich's sphynx**
- **CONTEXT:** Canon L2 line. Rich can own THE CAT (sphynx; its name is still a placeholder waiting on you).
- **WHY:** The cat already has a JUDGE combat move. A cat that judges vs. a wolf who hates cats.
- **SEEDS:** she hates cats *except* ___ · the cat ___ her on sight · she finds out Rich has a cat and ___.
- **QUESTION:** Why does she hate cats (or is it never explained)? Does she ever meet Rich's?

**CW-R4 — The boxing gym: rules and trash talk**
- **CONTEXT:** The L2 spar uses existing combat: her move names, telegraph text and Rich's three Octopus options.
- **WHY:** A move list *is* a personality ("surprisingly competitive").
- **SEEDS:** her telegraph line is ___ · an Octopus option where Rich ___ · a gym rule she enforces on a vampire: "no biting," and ___.
- **QUESTION:** Name her moves, and give Rich's CHARISMA, RECRUIT and ROAST options.

**CW-R5 — Ramen after boxing**
- **CONTEXT:** [PROPOSED] Rich is the customer; she picks and pays.
- **WHY:** Hina's stopwatch exists, and Roxy is competitive.
- **SEEDS:** she wants to beat Hina's time · she orders for both ___ · she pays again, and Rich ___.
- **QUESTION:** Slurp or another spot, and who pays this time?

**CW-R6 — L3: who delivers the hard hit, and what's different before it**
- **CONTEXT:** "Played, not narrated." The existing heavy reaction (≥ 20% max HP) is the tool.
- **WHY:** This is the heaviest beat in F15. The mechanism decides what the player *feels responsible for*.
- **SEEDS:**
  - **(a)** Rich's own move lands heavy, and she just resets her stance.
  - **(b)** She's hit by ___ while Rich ___.
  - Before the spar, the tell is ___ (an animation, a missing habit, she doesn't ___).
- **QUESTION:** Who throws it? What's the first tell Rich notices ("something feels different")?

**CW-R7 — L3: the subject change**
- **CONTEXT:** Canon: "She immediately changes the subject."
- **WHY:** *What* she changes it to is the only window into her that she chooses.
- **SEEDS:** animals · Rich's footwork · food.
- **QUESTION:** What does she change the subject to?

**CW-R8 — L3: Rich's response options**
- **CONTEXT:** Rich asks if she's okay (canon). Then what?
- **WHY:** "Doesn't fix, safe to grow around" lives or dies here.
- **SEEDS:** a choice where every option is respectful but different · Rich follows her subject change · Rich does something small with his hands.
- **QUESTION:** Does the player get a choice after the line, or does Rich just go with her?

**CW-R9 — L4: the food Rich brings**
- **CONTEXT:** She's sick. Rich brings food.
- **WHY:** This is personal and cultural. Generic "soup" is a waste.
- **SEEDS:** something from Rich's family table · something from SLURP · Rich cooks it himself in the castle kitchen and ___.
- **QUESTION:** What food, and who taught Rich to make it (if he made it)?

**CW-R10 — L4: the vampire movies**
- **CONTEXT:** A vampire watching vampire movies. Vampireflix is **rejected** canon.
- **WHY:** Rich is "meta." Free comedy.
- **SEEDS:** a title parody of ___ · Rich critiques the fangs · she roots for the ___.
- **QUESTION:** Which movies, and what does Rich say about them?

**CW-R11 — L4: the action that makes it romantic**
- **CONTEXT:** "Naturally becomes romantic," at the current content tier.
- **WHY:** One small action replaces any confession.
- **SEEDS:** she falls asleep ___ · she doesn't pay for something · she asks him to ___.
- **QUESTION:** What's the moment, in one action?

**CW-R12 — Roxy's companion move (post-L4)**
- **CONTEXT:** Women at CLOSE+ join combat with existing move kinds.
- **WHY:** Her move should express ownership and competition, **not** the L3 hit.
- **SEEDS:** a 'damage' or 'first' kind named ___ · a 'buff' where she coaches Rich · an 'intel' kind (data).
- **QUESTION:** Move name(s)?

**CW-R13 — Nicknames**
- **CONTEXT:** What she calls Rich, and what Rich calls her.
- **WHY:** Nicknames carry the relationship without exposition.
- **SEEDS:** ___.
- **QUESTION:** Names?

**CW-R14 — Her apartment**
- **CONTEXT:** A new environment.
- **WHY:** Her space tells you about her without a word of exposition.
- **SEEDS:** pets, or none? · data-science notes · a "nobody else has a key" detail.
- **QUESTION:** Three things in the room.

**CW-R15 — Roxy's neglect text**
- **CONTEXT:** The existing generic text is "haven't heard from you. it's cool. it's whatever."
- **WHY:** For her Core Thought, neglect hits hard.
- **SEEDS:** ___.
- **QUESTION:** Her line, and should her level ever drop at all?

### 6.3 Emerald

**CW-E1 — L1: which castle and why**
- **CONTEXT:** Canon: "asks Rich to help clean the castle."
- **WHY:** If it's Rich's own castle, it's a role reversal. If it's someone else's, it's a side hustle.
- **SEEDS:** she has a cleaning gig at ___ · Rich's castle after a party (the `throne_party_mess` art exists) · the castle down the block (art exists).
- **QUESTION:** Whose castle, and why does she ask *Rich*?

**CW-E2 — Marisol**
- **CONTEXT:** If Marisol is hired, she "judges everything."
- **WHY:** Two cleaners, one throne room.
- **SEEDS:** Marisol approves of exactly one thing Emerald does · Marisol ___ · they team up against Rich's mess.
- **QUESTION:** Do they meet? What does Marisol say?

**CW-E3 — L1: ramen Rich makes for her**
- **CONTEXT:** [PROPOSED] Rich cooks, through the SLURP ticket system. The Rich Special (jollof ramen) exists.
- **WHY:** She's always the one serving.
- **SEEDS:** she orders the cheapest thing and Rich adds ___ · she tries to pay with ___ · she tries to wash the bowl.
- **QUESTION:** What does she order, and what does Rich put in it?

**CW-E4 — The daily call to her father**
- **CONTEXT:** Canon: she calls her father every day.
- **WHY:** This is the most culturally specific beat in the route.
- **SEEDS:** the call happens at ___ every day, no matter what · the language is ___ · what she calls him: ___.
- **QUESTION:** Where is home, who is he, and what does Rich overhear?

**CW-E5 — Pre-med texture**
- **CONTEXT:** She's studying pre-med.
- **WHY:** The decoy dream. It needs to be real enough to give up on.
- **SEEDS:** flashcards in the dressing room · she diagnoses Rich's ___ · she knows exactly what fish does to him (careful).
- **QUESTION:** One pre-med habit.

**CW-E6 — Rich's mirror: his own family**
- **CONTEXT:** Rich's mom and siblings ping him in BTF.
- **WHY:** He sees himself in her.
- **SEEDS:** after her call, Rich ___ his mom · he doesn't · his mom asks about "the dragon girl."
- **QUESTION:** Does Rich's family ever cross into this route?

**CW-E7 — L3: the lost item**
- **CONTEXT:** "Something very important."
- **WHY:** It's the hinge of her whole route.
- **SEEDS:** something of her father's · something about ___ (pre-med) · something about ___ (singing — the L4 setup).
- **QUESTION:** What is it?

**CW-E8 — L3: where it's found**
- **CONTEXT:** The search uses existing locations.
- **WHY:** *Where* it turns up can hint at singing.
- **SEEDS:** at a place where she ___ · at Rich's castle · she had it the whole time.
- **QUESTION:** Search route and final spot?

**CW-E9 — L3: her ask**
- **CONTEXT:** One of the first times she truly depends on someone.
- **WHY:** One line has to carry the whole beat.
- **SEEDS:** she starts to say ___ and stops · she asks by text · she asks in person, panicking.
- **QUESTION:** How does she ask?

**CW-E10 — L4: the recital and Rich's encouragement as action**
- **CONTEXT:** "Rich encourages her to believe she deserves dreams of her own." This is the riskiest wording for "fixing."
- **WHY:** One gesture can replace a speech.
- **SEEDS:** Rich is the only one ___ · his hand goes to his pocket and ___ (CW-C8) · afterward he asks her ___.
- **QUESTION:** What does Rich *do*? Is there any line at all?

**CW-E11 — The song**
- **CONTEXT:** Rich is a music artist. Ube makes the music.
- **WHY:** Her voice could be a real track.
- **SEEDS:** a cover of ___ · something her father ___ · original.
- **QUESTION:** Does she sing audibly? What song?

**CW-E12 — Fins vs. fish**
- **CONTEXT:** Her art has finned or frilled ears. Rich's unexplained weakness is fish.
- **WHY:** Possibly the funniest visual fact in F15.
- **SEEDS:** Rich panics at ___ · it's never mentioned · she's ___ part ___.
- **QUESTION:** Are those fins, and does Rich react?

**CW-E13 — Emerald vs. the other dragons (Jade, Mazda, Emberly)**
- **CONTEXT:** Jade is also a green dragon with a gemstone name, and she "keeps everything."
- **WHY:** Avoid confusing them, or lean into it.
- **SEEDS:** they've met · they never share a scene · Mazda ___.
- **QUESTION:** Any crossover? Should Jade's or Emerald's palette or name be re-checked?

**CW-E14 — Is Emerald's L4 romantic?**
- **CONTEXT:** The packet doesn't say. Roxy's and Rosalyn's do.
- **WHY:** Leaving it non-romantic could be the strongest choice, or a gap.
- **SEEDS:** —
- **QUESTION:** Romantic at L4, later, or never?

**CW-E15 — Companion move: a song, not medicine?**
- **CONTEXT:** [PROPOSED] Her move kind is buff or regen, framed as singing, not healing. That's the L4 payoff, shown in play.
- **WHY:** The game would agree with her choice.
- **SEEDS:** ___.
- **QUESTION:** Move name?

**CW-E16 — Her neglect text**
- **SEEDS:** ___.
- **QUESTION:** Her line?

**CW-E17 — Does she ever look up?**
- **CONTEXT:** Her dance hides her face.
- **WHY:** One frame after L4 could say everything.
- **SEEDS:** a head lift on the last beat · only when Rich is there · never.
- **QUESTION:** Yes or no, and when?

### 6.4 Rosalyn

**CW-S1 — L1: the restaurant and the exact split**
- **CONTEXT:** "Exactly in half."
- **WHY:** The precision is the character.
- **SEEDS:** an odd cent, and she ___ · she does the math ___ · the venue is ___.
- **QUESTION:** Venue, and how exact is "exactly"?

**CW-S2 — L1: the mirror test**
- **CONTEXT:** [PROPOSED] Every date answer lands, even contradictory or Octopus ones.
- **WHY:** The player discovers "off" through play.
- **SEEDS:** Rich claims to love ___ (absurd) and she agrees · Rich contradicts himself and ___ · the Octopus option is "SAY SOMETHING INSANE."
- **QUESTION:** What's the absurd thing Rich tests her with?

**CW-S3 — What precedes "...something felt off."**
- **CONTEXT:** The home line is canon. The beat before it is not.
- **WHY:** That beat decides whether the line lands.
- **SEEDS:** the walk to the car · the receipt · her goodbye.
- **QUESTION:** The last image before the line?

**CW-S4 — The Yuck Wars universe**
- **CONTEXT:** Ube's parody.
- **WHY:** Every Rosalyn joke depends on it.
- **SEEDS:** the hero is ___ · the villain says ___ · the fandom argues about ___.
- **QUESTION:** Names, iconic line, signature object?

**CW-S5 — L2: why Rich knows Yuck Wars**
- **CONTEXT:** He "casually mentions" it.
- **WHY:** Does Rich secretly know it? That's a Rich trait.
- **SEEDS:** Tristan made him watch ___ · Rich only knows one quote, and it's wrong · Rich is a closet fan.
- **QUESTION:** What does Rich say?

**CW-S6 — L2: the nerd-out and the realization**
- **CONTEXT:** She lights up, then catches herself.
- **WHY:** The first real Rosalyn, for about 5 seconds.
- **SEEDS:** she corrects Rich's quote · she starts a sentence with "technically" · the moment she realizes is ___.
- **QUESTION:** What does she gush about, and what's the last word before she runs?

**CW-S7 — Kiki at the counter**
- **CONTEXT:** The L2 boba is at Kiki's shop.
- **WHY:** Kiki orders wrong on purpose; Rosalyn orders the same as Rich.
- **SEEDS:** Kiki clocks the mirroring · Kiki ___ when Rosalyn runs · Kiki says nothing, which is worse.
- **QUESTION:** Is Kiki there? What does she do?

**CW-S8 — L3: why Rich is at the convention**
- **CONTEXT:** "Accidentally finds her."
- **WHY:** The reason is a joke in itself.
- **SEEDS:** Tristan's 2 extra tickets (an existing behavior pattern) · Rich is there for ___ · Rich is *in cosplay* too.
- **QUESTION:** Why is Rich there?

**CW-S9 — L3: her cosplay and the glasses**
- **CONTEXT:** Full cosplay, glasses underneath.
- **WHY:** The image of the route.
- **SEEDS:** she's dressed as ___ (a side character nobody picks) · the glasses are ___ · she's mid-___ when Rich sees her.
- **QUESTION:** Which character?

**CW-S10 — L3: after she runs**
- **CONTEXT:** The second run-away.
- **WHY:** Rich's response decides whether L4's call feels earned.
- **SEEDS:** he doesn't chase · he buys the thing she was looking at · he texts ___ · he tells nobody (and Tristan ___).
- **QUESTION:** What does Rich do, if anything?

**CW-S11 — L4: the call**
- **CONTEXT:** She calls, terrified.
- **WHY:** She reaches out. The arc turns here.
- **SEEDS:** she starts with ___ · Rich hears ___ in the background · she says his name like ___.
- **QUESTION:** Her first line on the call?

**CW-S12 — The cockroach boss**
- **CONTEXT:** Existing combat: name, HP, moves, telegraphs, Octopus ×3.
- **WHY:** A vampire lord vs. a bug.
- **SEEDS:** a telegraph like "IT'S DOING THE ___" · Octopus ROAST: ___ · it flies in phase 2 (or ___).
- **QUESTION:** Name, moves and Rich's three Octopus options.

**CW-S13 — Rosalyn's role in the fight**
- **CONTEXT:** Is she screaming, helping, or both?
- **WHY:** Her real self could be *useful* here.
- **SEEDS:** she uses a Yuck Wars prop ___ · she yells lore at the roach · she's on the counter the whole time.
- **QUESTION:** What does she do?

**CW-S14 — The apartment reveal: three collectibles**
- **CONTEXT:** Covered in Yuck Wars collectibles.
- **WHY:** Specific items make it real.
- **SEEDS:** ___ · ___ · the one she's most embarrassed by.
- **QUESTION:** Three items, and does the reveal come before or after the fight?

**CW-S15 — Watching Yuck Wars**
- **CONTEXT:** [PROPOSED] She talks; Roxy's movie night is quiet.
- **WHY:** Her voice, not a mirror.
- **SEEDS:** she pauses to explain ___ · she asks Rich his favorite and ___ · they argue.
- **QUESTION:** Which episode, and what's her favorite thing about it?

**CW-S16 — The first disagreement**
- **CONTEXT:** [PROPOSED] The post-L4 payoff of "I like what you like."
- **WHY:** The best callback in F15.
- **SEEDS:** she says she *hates* ___ (something Rich loves) · the Rich Special · Rich's shoes (Granny Bing agrees).
- **QUESTION:** What's the first thing she doesn't like?

**CW-S17 — Companion move**
- **SEEDS:** a Yuck Wars move ___ · a 'reflect' kind (mirror callback) vs. her *own* move.
- **QUESTION:** Name and kind?

**CW-S18 — Her neglect text**
- **SEEDS:** ___.
- **QUESTION:** Her line?

**CW-S19 — A Yuck Wars pose in her routine**
- **CONTEXT:** Her dance is choreographed.
- **WHY:** One secret beat, only when Rich is there.
- **SEEDS:** ___.
- **QUESTION:** Yes or no? Which pose?

---

## 7. Asset audit (repository evidence only)

### 7.1 What the repository proves exists

| Asset | Status | Where |
|---|---|---|
| Big Bing NEUTRAL, NO (80×96) | **FROZEN** 2026-09-30 | `origin/art/f01-feel-lock-freeze` — **not on `main`** |
| Granny Bing CALLING NUMBERS (80×96) | **FROZEN** 2026-09-30 | same branch — **not on `main`** |
| SLURP DYNASTY, Little Tokyo, Kiki's Boba, Hollywood Hotel Ballroom, Hollow Bowl, Catacomb, Party Hall (empty and packed), castle kitchen, movie room, music room, Pet Crypt, Venice Courts, Tristan's apartment, Peking Naija, Duchess castle, rooftop DTLA, neighbor castle, `throne_party_mess` overlay | **FROZEN** environments | integration branch register (551 entries). A subset is on `main` (313). |
| Kiki, Hina, Mr. Okada, Marisol, Tristan, Jade, Moonie, Emberly, Mazda (human), THE CAT | **FROZEN** characters / creature | same |
| Rich: ramen apron, laptop, on-stage, contextual sheet | **FROZEN** states | same |
| Nightlife population (dancer, performer, bartender, crowds) | **FROZEN** | requires named-actor clearance; not for F15 leads |
| F06 audio RM_01–RM_08; AMB_RAMEN; AMB_BOBA | in the audio manifest | integration branch |

### 7.2 What the repository proves is missing

| Missing | Notes |
|---|---|
| **Any Roxy, Emerald or Rosalyn asset** (anchor, state, dance loop) | Not in any register or branch. Ube's uploads are the visual authority, but they're **not ingested, registered or frozen**. Native pixel grid and anchor/contact not established. |
| **Roxy's dance loop** | No video supplied. |
| **THE BING club interior** | No environment found on any branch. |
| **DJ Peachtree** | OL-017 card exists (CGA-F2-033). No art. |
| **Boxing gym** | — |
| **Fancy restaurant** | Only candidate reuses exist. |
| **Roxy's apartment, Rosalyn's apartment** (including a lights-off variant for the boss) | — |
| **Yuck Wars convention** | Only reuse plus composited dressing, which needs Ube approval. |
| **Recital setting** | Reuse candidates only. |
| **Giant cockroach** (combat states) | — |
| **Derivative states** | Roxy: boxing stance, jab, normal hit, L3 no-flinch, sick in bed, ramen. Emerald: cleaning, phone call, panicked, singing, recital outfit. Rosalyn: restaurant, boba, run, cosplay + glasses, terrified call, home + glasses, watching. Rich: bringing food, at a convention, at a recital. |
| **Props** | Yuck Wars collectibles, Emerald's lost item (TBD), boxing gloves. |
| **Audio** | Emerald's voice and song (CW-E11), cockroach SFX, glove impacts, convention ambience. |
| **"Existing chores" system** | No chores system found in code. The closest pieces are the MAID scene (flavor) and the `throne_party_mess` environment. |

### 7.3 Reuse first
Before any new art: SLURP and Little Tokyo for ramen. Kiki's Boba for Rosalyn L2. Ballroom, Hollow Bowl or Catacomb for the recital. `throne_party_mess` or `neighbor_castle` for cleaning. The movie room for post-L4. Any composited delta on frozen environments needs Ube approval (`CURRENT_CANON.md`: surgical edits only).

---

## 8. Implementation-ready F15 creative spec (for HQ; not authorized)

**8.1 Identity**
- Person ids `roxy`, `emerald`, `rosalyn`.
- `kind: 'woman'`, `adult: true` (21+).
- Species per the brief: wolf, dragon, human.
- Registered in the person catalog when L1 completes.

**8.2 State** — an own namespace, `save.frag.F15`, additive and lazy, with no migration requested:

```
dancers: { <id>: { thrown, levelDone: [..], levelDay: {..}, requestUnlocked } }
lastF15DateWake
```

**8.3 Attribution**
- The F06 adapter knows which dancer is on stage.
- Each `rainmaker:flick` expense is added to that dancer's `thrown`.
- **F06 core and tunables stay byte-identical**, enforced by the existing hash tests.

**8.4 Gating** — level `n` is available when **all** of these hold:
- `thrown ≥ Tn` (T1–T4: `SOURCE_REQUIRED — BOARD NOT PROVIDED`);
- level `n−1` is done;
- `lastF15DateWake ≠ today`;
- for `n ≥ 2`, at least one WAKE has passed since level `n−1`.

**8.5 Level scenes**
- One authored adventure per level (`F15_ROXY_L1` … `F15_ROSALYN_L4`), built in the existing adventure DSL.
- Each scene ends with:
  - a `memory`;
  - a `receipt` (caption is [COOK]);
  - a `home` line marked [VP].

**8.6 Systems per beat** — the tables in §2.

**8.7 Post-L4**
- Each woman joins the date loop (`RADateContent`) and becomes a combat companion through an existing move kind.
- She gets her own neglect text.
- **Whether F15 levels map onto the relations ladder: HQ/Ube decision.**

**8.8 Acceptance criteria**
1. F06 feel is unchanged (core and tunable hashes, the 34-check browser suite).
2. No money is added from any F15 beat.
3. At most one F15 date per WAKE.
4. The Roxy L3 line text is exact, and no other text explains it.
5. Rosalyn's L1 home line text is exact.
6. The two ramens use different roles and staging.
7. Combat Staging QA for the spar and the cockroach.
8. Every L scene is reachable on the real player path.
9. All Rich lines are marked [VP].
10. No Vampireflix, no conversion, no Trap link.
11. Content stays within the current tier.

---

*Design only. Nothing in this file is canon until Ube/HQ accepts it. All seeds are optional and deliberately unfinished.*
