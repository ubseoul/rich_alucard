(function(){
 // IF-1 FLAG DEFAULTS — INTEGRATION-OWNER ONLY. The one place a flag's shipped default may be flipped to ON.
 // Fragments register flags DARK (default OFF) in their own files; only the integration owner promotes them here,
 // one commit per promotion, after the fragment is accepted. F00 ships everything OFF.
 //
 // RC2 · BUILD 1 (OL-063, rc2/economy-001): PLAYs -> cash -> strip club is the main path, so the four flags it runs on ship ON.
 // F05 (trap), F03 (ladder close), F07 (M8 / finale) and F02 (armory) stay DARK.
 //   F01.showdown_core    THE PLAY (live group-chat UI and capture bands, untouched)
 //   F04.war_room         WAR ROOM: the board that sends crew out on PLAYs (offer window moved to Day 2, js/frag/F04/wake.js)
 //   F06.rainmaker        MAKE IT RAIN, the strip-club spend loop
 //   F15.velvet_rotation  club dancers on the real MAKE IT RAIN stage (requires F06.rainmaker)
 window.RAFlagDefaults=Object.freeze({'F01.showdown_core':true,'F04.war_room':true,'F06.rainmaker':true,'F15.velvet_rotation':true});
})();
