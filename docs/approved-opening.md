# Approved title and new-game opening

The approved title appears immediately. With no saved progress its primary action is NEW GAME. With existing progress it shows CONTINUE and a secondary NEW GAME action.

NEW GAME plays the approved forty-second Gbenga/Mercedes cinematic, then enters the native new-game opening. Its natural ending and the unchanged tiny top-left Click here to skip hint both enter the game directly. Continue bypasses the cinematic and resumes the native saved-game route.

Existing-save replacement remains protected inside the title action area: NEW GAME offers REPLACE SAVE and CANCEL with a readable saved-game notice. This replaces the browser confirmation popup. Cancel and the cinematic itself leave the save intact; the existing native reset runs once after the confirmed cinematic. A failed reset commit retains the save and allows Continue or retry. Optional startup music failure no longer shows the intermediate TAP AGAIN FOR AUDIO toast. Browser permission/security controls are unchanged.

The approved title/cinematic artwork, drawing functions, dialogue, forty-second timeline and hint styling remain unchanged. Startup and the film are silent. Reduced motion keeps a static opening frame; the same skip hint remains available. Repeated activation and held skip keys cannot launch twice or advance the game beneath.

Run the full deterministic source gate with `node tools/release.mjs test`. For native browser acceptance with Chrome and playwright-core, run `node tools/tests/intro/opening.browser.mjs <origin> <output-directory>`. Set `RA_INTRO_OLD_SAVE` to a disposable qualified QA save to include old-save preservation/reset failure tests and `RA_INTRO_FRAME_REFERENCES` to the approved frame JSON. These are isolated test fixtures; never use an active personal profile/save.

The narrow release preserves gameplay, the private pack, driving inputs and the native reset/default state. Browser evidence is Chromium emulation, not physical iPhone/Safari or full-campaign certification.