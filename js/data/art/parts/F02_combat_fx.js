(function(){
 'use strict';
 // OL-045: index existing accepted, target-agnostic FX packages. No new pixels or frozen registry overwrites.
 // These exact assets already render in game.js; their manifests define role/anchor, not game numbers.
 const frames=(prefix,n)=>Array.from({length:n},(_,i)=>`assets/${prefix}_0${i+1}.png`);
 window.RAArtParts.register('F02',{combatMoves:{
  blood:{manifest:'assets/blood_bath_manifest.json',rear:frames('blood_bath_floor_rise',3),foreground:'assets/blood_bath_foreground_01.png',contact:frames('blood_bath_contact',2),overlay:frames('blood_bath_engulf_overlay',2),impact:'assets/blood_bath_impact_fullscreen.png'},
  bite:{manifest:'assets/vampire_bite_manifest.json',upper:'assets/vampire_bite_jaw_upper.png',lower:'assets/vampire_bite_jaw_lower.png',snap:'assets/vampire_bite_snap_closed.png',contact:'assets/vampire_bite_contact.png',life:['assets/vampire_bite_lifesteal_drop_01.png','assets/vampire_bite_lifesteal_orb_01.png','assets/vampire_bite_lifesteal_drop_02.png']},
  revenge:{manifest:'assets/revenge_manifest.json',stored:frames('revenge_stored_wound',4),extraction:frames('revenge_extraction',4),mass:frames('revenge_mass',3),crack:frames('revenge_target_crack',3),impact:'assets/revenge_impact_fullscreen.png'},
  octopus:{frames:['assets/octopus_brain_a.png','assets/octopus_brain_b.png','assets/octopus_brain_c.png','assets/octopus_brain_d.png']}
 }});
})();
