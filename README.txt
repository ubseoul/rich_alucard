RICH ALUCARD — OCTOPUS BRAIN v0.15

PROTOTYPE
- Eight animated tentacles / three actual options.
- CHARISMA: STEAL YOUR HOE — successful roll moves Assistant to Rich's side immediately; combat continues.
- RECRUIT: JOIN MY SQUAD — successful roll recruits CEO and ends encounter.
- ROAST: GET OUT MY CASTLE — successful roll makes CEO leave and ends encounter.
- All three currently use a visible d20-style prototype check: need 12.
- Failure has a short reaction and combat continues.
- Existing Blood Bath, Vampire Bite, Revenge, Briefcase Throw, music, cast, and corrected room preserved.

NOT CANON YET
- Target number 12
- Exact failure dialogue
- Exact roll presentation / timing
- Exact success dialogue

v0.15.1 VISUAL PASS
- Octopus Brain now blue-tints the battle screen.
- Eight tentacles rise from the ground instead of radiating from a center icon.
- Floating bubbles continuously rise while the player is choosing.
- Tentacles, bubbles, title, and choices disappear immediately after a choice is made.
- Three-choice mechanic and roll logic unchanged.

v0.15.2 AUTHORED TENTACLES
- Replaced procedural CSS tentacles with the supplied 270x362 authored A/B/C/D effect frames.
- Animation: A -> B -> C -> D <-> C while choosing.
- Exact eight tentacles now physically rise from the throne-room floor plane.
- Blue tint, bubbles, and three-choice interface preserved.
- Tentacle artwork disappears immediately once a choice is selected.

v0.15.3 FLOOR-PLANE PLACEMENT
- Authored tentacles are no longer treated as bottom-of-screen foreground UI.
- Effect layer is repositioned into the throne-room scene so its bases visually originate from the room floor.
- Overflow remains clipped to the room/effect region; battle UI is preserved.
- No mechanic, roll, music, character, or tentacle-art changes.

v0.15.4 TRUE ROOM FLOOR FIX
- Fixed coordinate-system mistake from v0.15.3.
- The authored 270x362 tentacle frame now fills the exact same vertical region as .room (75.5% of the 9:16 screen).
- Therefore the bottom edge/root line of the tentacle artwork maps to the actual throne-room floor, not the viewport bottom and not a fixed 270px box.
- No art or mechanic changes.

v0.15.5 CHARACTER-FLOOR ANCHOR
- Previous fix incorrectly treated the bottom of the background image as the floor.
- Using the supplied screenshot, tentacle roots now align to the visible floor beneath the characters (~61.5% of stage height).
- The background continues below that point into foreground/UI space, but the tentacle roots no longer do.
- Authored tentacle scale/art and all mechanics unchanged.

v0.16 VICTORY WALK-OFF
- Normal combat victory now ends the CEO encounter instead of immediately continuing.
- CEO enters defeated state.
- Post-battle prompt: STEAL HIS HOE? YES / NO.
- YES: Rich enters victory state; Assistant enters walk state; both travel off the right side of the screen together.
- NO: Rich remains on his throne.
- Octopus Brain remains available in the build but is not required for the first recording.
- Existing attack systems, music, room, cast, and Octopus Brain visuals preserved.

NOTE
- Current walk-off uses the existing Rich victory state and Assistant walk state; this is a vertical-slice animation, not final bespoke walk-cycle art.

v0.17 AUTHORED WALK-OFF
- Uses supplied Rich get-up 01/02/03, standing-right, and four walk-right frames.
- Rich's seated composite hides while the throne stays fixed.
- Rich gets up, pauses standing, walks toward Assistant, then both exit screen-right together.
- 80x96 source frames are rendered nearest-neighbor.

v0.18.1 VICTORY ROUTING FIX
- Fixed inconsistent ending after lethal Vampire Bite / legacy catch-all victory path.
- Every normal CEO kill now routes to the same new STEAL HIS HOE? authored walk-off flow.
- Legacy victory() retained only as an alias to the new flow, preventing old text-only ending from resurfacing.
