# Approved title and new-game opening

The approved title appears immediately. With no saved progress its primary action is NEW GAME. With existing progress it shows CONTINUE and a secondary NEW GAME action.

NEW GAME plays the approved forty-second Gbenga/Mercedes cinematic, then enters the native new-game opening. Its natural ending and the unchanged tiny top-left Click here to skip hint both enter the game directly. Continue bypasses the cinematic and resumes the native saved-game route.

Existing-save replacement remains protected inside the title action area: NEW GAME offers REPLACE SAVE and CANCEL with a readable saved-game notice. This replaces the browser confirmation popup. Cancel and the cinematic itself leave the save intact; the existing native reset runs once after the confirmed cinematic. A failed reset commit retains the save and allows Continue or retry. Optional startup music failure no longer shows the intermediate TAP AGAIN FOR AUDIO toast. Browser permission/security controls are unchanged.

The approved source artwork, roadside animation, spoken dialogue, forty-second timeline and hint styling remain unchanged. The ending card now contains only red "Rich Alucard" on black, using the game's --font-system family (Press Start 2P). Its text fades to black before the native game appears. Old sample labels and the stale sample poster runtime binding are removed; the unused original poster asset remains byte-identical. The title and cinematic drawing remain silent; native game music and sound settings continue through their existing systems. Rejected startup music now joins the music library's existing next-input retry, while saved mute, volume, track and pin settings remain respected. Reduced motion keeps a static opening frame; the same skip hint remains available. Repeated activation and held launch, Continue or skip keys cannot launch twice or advance the game beneath.

Run the full deterministic source gate with `node tools/release.mjs test`. For native browser acceptance with Chrome and playwright-core, run `node tools/tests/intro/opening.browser.mjs <origin> <output-directory>`. Set `RA_INTRO_OLD_SAVE` to a disposable qualified QA save to include old-save preservation/reset failure tests and `RA_INTRO_FRAME_REFERENCES` to the approved frame JSON. These are isolated test fixtures; never use an active personal profile/save.

The narrow release preserves gameplay, the private pack, driving inputs and the native reset/default state. Browser evidence is Chromium emulation, not physical iPhone/Safari or full-campaign certification.
For the focused audio recovery suite, run `node tools/audio-startup-browser.mjs <output-json>`; set `RA_AUDIO_ORIGIN` to test an existing isolated compiled origin. Default browser autoplay policy is retained. This checks rejection recovery and playback state, not physical device audibility.

For the ending-only acceptance and native recording, run `node tools/tests/intro/ending.browser.mjs <origin> <output-directory>`. The recording is an unretimed natural film; any earlier-frame probes are separately labelled fixtures.
