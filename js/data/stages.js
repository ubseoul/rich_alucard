(function(){const source={width:80,height:96,anchor:{x:40,y:88}};const docks={id:'jdm-imports-docks',native:{width:270,height:480},environment:'assets/jdm_imports/environment/docks_night_270x480.png',referenceScale:1.25,contactLines:[{id:'combat',y:350,x1:0,x2:270,scale:2.3125},{id:'curb',y:354,x1:0,x2:270,scale:2.3125}],actors:{rich:{anchor:{x:55,y:350,line:'combat'},facing:'right',source,layer:6},importer:{anchor:{x:180,y:350,line:'combat'},facing:'left',source,layer:6},daughter:{anchor:{x:230,y:350,line:'combat'},facing:'left',source,observer:true,layer:5}},objects:{supra:{anchor:{x:168,y:354,line:'curb'},source:{width:136,height:50,anchor:{x:68,y:50}},scale:1.75,layer:2}},dialogueSafeZones:[{id:'combat-dialogue',x:10,y:42,width:250,height:102}],uiExclusionZones:[{id:'hp-panels',x:0,y:0,width:270,height:48},{id:'battle-controls',x:0,y:362,width:270,height:118}],layers:[{id:'environment',z:1},{id:'objects',z:2},{id:'observers',z:5},{id:'combatants',z:6},{id:'dialogue',z:9},{id:'ui',z:10}],
 // Presentation Director (docs/PRESENTATION_DIRECTOR.md). The combat line scale 2.3125 is the approved docks
 // composition (1.25 reference × 1.85 primary-character rule) made explicit; the global RADisplay multiplier
 // does not apply to Director scenes. Camera size comes only from the shot profile.
 director:{roles:{rich:'rich',enemy:'importer'},
  // Story scenes (arrival/meet/aftermath) and the Supra payoff reveal reuse this contract.
  modes:{story:'dialogue',payoff:'cinematic'},
  // Runtime variant matrix: every approved state each slot can show on this screen (first = default).
  states:{rich:['assets/rich_standing_right.png'],importer:['assets/jdm_imports/characters/importer/importer_combat_ready.png','assets/jdm_imports/characters/importer/importer_hit.png','assets/jdm_imports/characters/importer/importer_defeated.png'],daughter:['assets/jdm_imports/characters/daughter/daughter_neutral.png','assets/jdm_imports/characters/daughter/daughter_reaction.png','assets/jdm_imports/characters/daughter/daughter_post_battle.png']},
  shots:{combat:{profile:'combat',focal:['rich','importer'],speakers:['rich','importer'],reference:'rich'},story:{profile:'conversation',focal:['rich','importer'],include:['daughter'],speakers:['rich','importer','daughter'],reference:'rich'},payoff:{profile:'establishing',focal:['rich','supra'],speakers:['rich'],reference:'rich'}},
  // Key prop: the legacy key-to-Rich relationship (authored at Rich scale 1.25: key at +12,−31, 24×16) rescaled to the
  // combat line's 2.3125 so it stays in Rich's hand.
  keyProp:[77.2,292.6,44.4,29.6],worldLayers:{bloodBath:[0,0,270,362]}}};window.RAStages={get:id=>id===docks.id?docks:null,all:()=>[docks]};})();

(function(){
  const source={width:80,height:96,anchor:{x:40,y:88}};
  const base='assets/ogun_rave/';
  const rave={
    id:'ogun-rave',native:{width:270,height:480},referenceScale:1,
    environment:base+'masters/rave_interior_270x480.png',
    contactLines:[{id:'party-floor',y:344,x1:28,x2:242,scale:1.85},{id:'host-landing',y:273,x1:166,x2:248,scale:1.85}],
    actors:{
      rich:{source,anchor:{x:75,y:344,line:'party-floor'},facing:'right',layer:5,states:{neutral:'assets/rich_standing_right.png'}},
      ogun:{source,anchor:{x:192,y:273,line:'host-landing'},facing:'authored',layer:6,states:{neutral:base+'masters/ogun_neutral_80x96.png'}},
      bllad33:{source,anchor:{x:225,y:344,line:'party-floor'},facing:'left',layer:8,states:{neutral:'assets/bllad33/masters/bllad33_neutral_candidate_80x96.png'}}
    },
    hostLanding:{x:166,y:273,width:82,height:21},
    foreground:{asset:base+'layers/speaker_foreground_overlay.png',mask:base+'masks/speaker_foreground_mask.png',layer:7,mode:'fixed visual redraw above actors; includes background margins'},
    masks:{speakers:base+'masks/speaker_foreground_mask.png',ogunSilhouette:base+'masks/ogun_neutral_silhouette.png',artEditEvidence:base+'masks/crowd_removal_edit_region.png',semantics:'visual only; no collision, triggers or navigation'},
    reconstructionBase:base+'layers/room_without_foreground.png',
    dialogueSafeZones:[{id:'rave-dialogue',x:32,y:132,width:206,height:60}],
    uiExclusionZones:[{id:'rave-choices',x:16,y:376,width:238,height:88}],
    partyFloor:{id:'central-party-floor',x:36,y:300,width:198,height:66,semantics:'composition area, not a walk mesh'},
    layers:[{id:'environment',z:1},{id:'rich',z:5},{id:'ogun',z:6},{id:'speaker-foreground',z:7},{id:'dialogue',z:9},{id:'inspection',z:10}],
    // Presentation Director (Wave 3): the accepted 1× composition at the legacy runtime 1.85 rule, made explicit;
    // the speaker foreground stays an environment-sized layer drawn above the actors.
    director:{states:{rich:['assets/rich_standing_right.png'],ogun:[base+'masters/ogun_neutral_80x96.png'],bllad33:['assets/bllad33/masters/bllad33_neutral_candidate_80x96.png']},
     shots:{default:{profile:'conversation',focal:['rich','ogun'],include:['bllad33'],speakers:['rich','ogun','bllad33'],reference:'rich'}},
     exception:{status:'EXCEPTION-LAYOUT',ticket:'PD-W3-02',accept:['shot-consistency']}}
  };
  const previous=window.RAStages;
  window.RAStages={get:id=>id===rave.id?rave:previous.get(id),all:()=>[...previous.all(),rave]};
})();

(function(){
  const source={width:80,height:96,anchor:{x:40,y:88}};
  const ratSource={width:96,height:64,anchor:{x:48,y:56}};
  const base='assets/property/';
  const exterior={
    id:'property-la-4p-exterior',native:{width:270,height:480},referenceScale:1.25,
    environment:base+'masters/property_exterior_270x480.png',
    contactLines:[{id:'sidewalk',y:370,x1:28,x2:242,scale:2.3125}],
    actors:{
      rich:{source,anchor:{x:65,y:370,line:'sidewalk'},facing:'right',layer:5,states:{neutral:'assets/rich_standing_right.png'}},
      shannon:{source,anchor:{x:195,y:370,line:'sidewalk'},facing:'left',layer:5,states:{neutral:base+'characters/shannon/shannon_neutral_80x96.png',controlled_reaction:base+'characters/shannon/shannon_controlled_reaction_80x96.png'}}
    },
    dialogueSafeZones:[{id:'property-exterior-dialogue',x:16,y:24,width:238,height:96}],
    uiExclusionZones:[{id:'property-exterior-controls',x:8,y:404,width:254,height:68}],
    hotspots:{
      meter:{x:56,y:220,width:22,height:28},
      stair:{x:150,y:190,width:40,height:110},
      court:{x:95,y:135,width:112,height:70},
      numbers:{x:6,y:400,width:24,height:30}
    },
    layers:[{id:'environment',z:1},{id:'incidental',z:3},{id:'actors',z:5},{id:'dialogue',z:9},{id:'controls',z:10},{id:'inspection',z:11}],
    // Presentation Director (Wave 3): line scale = legacy runtime 1.25 × 1.85; interaction hotspots stay in frame.
    director:{states:{rich:['assets/rich_standing_right.png'],shannon:[base+'characters/shannon/shannon_neutral_80x96.png',base+'characters/shannon/shannon_controlled_reaction_80x96.png']},
     shots:{default:{profile:'conversation',focal:['rich','shannon'],speakers:['rich','shannon'],reference:'rich',includeHotspots:true}}}
  };
  const interior={
    id:'property-la-4p-interior',native:{width:270,height:480},referenceScale:1.25,
    environment:base+'masters/property_interior_base_270x480.png',
    problemOverlay:base+'layers/property_problem_overlay_270x480.png',
    contactLines:[{id:'unit-floor',y:352,x1:20,x2:252,scale:2.3125}],
    actors:{
      rich:{source,anchor:{x:55,y:352,line:'unit-floor'},facing:'right',layer:5,states:{neutral:'assets/rich_standing_right.png'}},
      shannon:{source,anchor:{x:132,y:352,line:'unit-floor'},facing:'left',layer:5,states:{neutral:base+'characters/shannon/shannon_neutral_80x96.png',controlled_reaction:base+'characters/shannon/shannon_controlled_reaction_80x96.png'}}
    },
    rat:{source:ratSource,anchor:{x:218,y:352,line:'unit-floor'},layer:4,states:{alert:base+'creatures/giant_rat/giant_rat_alert_96x64.png',scurry:base+'creatures/giant_rat/giant_rat_scurry_96x64.png',recoil:base+'creatures/giant_rat/giant_rat_recoil_96x64.png'}},
    ratSlots:[{x:218,y:352},{x:150,y:352},{x:90,y:352}],
    dialogueSafeZones:[{id:'property-interior-dialogue',x:16,y:20,width:238,height:96}],
    uiExclusionZones:[{id:'property-interior-controls',x:8,y:394,width:254,height:78}],
    hotspots:{
      kitchen:{x:197,y:91,width:70,height:145},
      patch:{x:133,y:104,width:36,height:62},
      floor:{x:60,y:290,width:150,height:90},
      door:{x:74,y:95,width:56,height:140},
      panel:{x:150,y:180,width:36,height:52},
      paintcan:{x:213,y:162,width:16,height:22}
    },
    layers:[{id:'environment',z:1},{id:'problem-overlay',z:2},{id:'props',z:3},{id:'rats',z:4},{id:'actors',z:5},{id:'front-rats',z:6},{id:'dialogue',z:9},{id:'controls',z:10},{id:'inspection',z:11}],
    // Rats are floor objects at their legacy scale (1.25, no primary-character rule); slots from ratSlots.
    objects:Object.fromEntries([{x:218,y:352},{x:150,y:352},{x:90,y:352}].map((slot,i)=>[`rat${i}`,{source:ratSource,anchor:{x:slot.x,y:slot.y,line:'unit-floor'},scale:1.25,layer:4}])),
    director:{states:{rich:['assets/rich_standing_right.png'],shannon:[base+'characters/shannon/shannon_neutral_80x96.png',base+'characters/shannon/shannon_controlled_reaction_80x96.png']},
     shots:{default:{profile:'conversation',focal:['rich','shannon'],speakers:['rich','shannon'],reference:'rich',includeHotspots:true}},
     exception:{status:'EXCEPTION-LAYOUT',ticket:'PD-W3-01',accept:['shot-consistency']}}
  };
  const previous=window.RAStages;
  window.RAStages={get:id=>id===exterior.id?exterior:id===interior.id?interior:previous.get(id),all:()=>[...previous.all(),exterior,interior]};
})();

(function(){
  // Throne room (CEO fight) — composed legacy room art, 765×1024 native grid. Presentation Director stage.
  // The legacy CSS composition (Rich 1.95 / CEO 2 / assistant 1.7 CSS px per source px on a 390-wide room)
  // becomes two depth lines: front (Rich, CEO) and a slightly farther back line (assistant); the smaller
  // back-line scale follows floor perspective instead of a per-character size. The throne chair is part of
  // Rich's seated sprites, so the pilot re-stages the fight closer together without touching pixels.
  const source={width:80,height:96,anchor:{x:40,y:88}};
  const throne={
    id:'throne-room',native:{width:765,height:1024},environment:'assets/throne_room_scene_portrait.png',referenceScale:1,
    contactLines:[{id:'front',y:940,x1:40,x2:725,scale:3.9},{id:'back',y:905,x1:40,x2:725,scale:3.59}],
    actors:{
      rich:{source,anchor:{x:300,y:940,line:'front'},facing:'right',layer:6},
      ceo:{source,anchor:{x:500,y:940,line:'front'},facing:'left',layer:7},
      assistant:{source,anchor:{x:615,y:905,line:'back'},facing:'left',observer:true,layer:6}
    },
    dialogueSafeZones:[],uiExclusionZones:[],
    layers:[{id:'environment',z:1},{id:'ambience',z:2},{id:'actors',z:6},{id:'ceo',z:7},{id:'fx',z:8}],
    director:{roles:{rich:'rich',enemy:'ceo'},
     states:{rich:['assets/rich_seated_idle.png','assets/rich_seated_cast.png','assets/rich_seated_hit.png','assets/rich_seated_victory.png'],ceo:['assets/ceo_idle.png','assets/ceo_briefcase_throw.png','assets/ceo_hit.png','assets/ceo_defeated.png','assets/ceo_hit_reaction_sheet.png#0','assets/ceo_hit_reaction_sheet.png#1','assets/ceo_hit_reaction_sheet.png#2'],assistant:['assets/assistant_idle.png','assets/assistant_heal.png','assets/assistant_reaction.png','assets/assistant_walk.png']},
     // `include`: secondary actors kept inside the frame (horizontal fit only; not part of the size target).
     shots:{combat:{profile:'combat',focal:['rich','ceo'],include:['assistant'],speakers:['rich','ceo'],reference:'rich'},
      // Held tableau when the assistant crosses to Rich's side (snap-pan out, hold, snap-pan back).
      tableau:{profile:'establishing',focal:['rich','ceo','assistant'],speakers:['rich','ceo'],reference:'rich'}},
     // Beat marks: authored world positions for scripted moves (assistant joins Rich; CEO leaves the room).
     marks:{assistantJoin:{slot:'assistant',x:160,line:'front'},ceoExit:{slot:'ceo',x:1000,line:'front'}},
     worldLayers:{bloodBath:[0,0,765,1024]}}
  };
  const previous=window.RAStages;
  window.RAStages={get:id=>id===throne.id?throne:previous.get(id),all:()=>[...previous.all(),throne]};
})();

(function(){
  // Desire Trip #001 — Powder Springs curb (known, Ube-approved Milestone 5 composition). Presentation Director
  // stage. The trip keeps its own approved depth (1.5 on the curb line, not the adventure ×1.85 rule): the
  // Director's establishing shot at full width then reproduces "small Rich under a big sky".
  const source={width:80,height:96,anchor:{x:40,y:88}};
  const trip={
    id:'powder-springs-trip',native:{width:270,height:480},environment:'assets/powder_springs_night_270x480.png',referenceScale:1.5,
    contactLines:[{id:'curb',y:406,x1:0,x2:270,scale:1.5}],
    actors:{rich:{source,anchor:{x:135,y:406,line:'curb'},facing:'right',layer:1}},
    dialogueSafeZones:[],uiExclusionZones:[],layers:[{id:'environment',z:0},{id:'rich',z:1}],
    director:{states:{rich:['assets/rich_curb_eating.png','assets/rich_curb_chilling.png','assets/rich_curb_stargazing.png']},
     // Hero scene: cinematic mode (tall world, slim action band). Establishing near its lower end keeps a big sky
     // while Rich's face stays ≥ 24 px at 360 wide; the sky is the subject.
     mode:'cinematic',
     shots:{curb:{profile:'establishing',target:.21,focal:['rich'],speakers:['rich'],reference:'rich'},stargazing:{profile:'establishing',target:.21,focal:['rich'],speakers:['rich'],reference:'rich'}},
     accept:{checks:['dead-space'],reason:'INTENT: the night sky is the subject of this scene (stargazing)'}}
  };
  const previous=window.RAStages;
  window.RAStages={get:id=>id===trip.id?trip:previous.get(id),all:()=>[...previous.all(),trip]};
})();
