# Approved opening and title

The forty-second Gbenga/Mercedes canvas cinematic is the first screen. Natural completion or Skip opens the approved title page; PLAY NOW and CONTINUE use the existing native start handler. NEW GAME keeps its native confirmation and reset. REPLAY OPENING is available on the title page. Internal game transitions do not reopen the cinematic.

The approved drawing functions, dialogue, sprites, camera and forty-second creative timeline are preserved. The standalone preview shell and source link are excluded. The intro and end cards remain. The title preserves the approved expanded stepped red backdrop, centered action panel, black padding and soft red pulse.

Startup is silent. Sound requires a user gesture; pause, Skip, completion and hidden-document events suspend cinematic sound. Reduced motion starts on a static frame with an explicit Play control, pauses the title preview video and disables the button pulse. The cinematic keeps its 16:9 canvas within the available viewport; the title can scroll on short screens. Both introductory screens keep the game stage inert until native start.

Run the deterministic source regression with `node tools/release.mjs test`. With an installed Chrome and playwright-core, run `node tools/tests/intro/opening.browser.mjs <origin> <output-directory>`. To include historical save continuity and native reset confirmation, set `RA_INTRO_OLD_SAVE` to a disposable QA save JSON. The browser test otherwise covers a fresh run and its real reload/CONTINUE checkpoint. Do not supply a user's active save or profile.

The integration changes only the existing native start label to PLAY NOW for a fresh career. Current gameplay, private pack, driving inputs, story and save schema remain inherited. Browser evidence covers Chromium emulation and actual input, not physical-device or full-campaign certification.
