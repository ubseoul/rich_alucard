(function(){
 // Frozen-art runtime integration map (authored). Art identity comes ONLY from the generated RAArtRegistry
 // (js/data/art_registry.js); this file adds what the frozen corpus does not carry: which runtime id uses which
 // frozen art, and the presentation metadata Engineering authored by inspecting the frozen pixels (floor/contact
 // line, depth base, exact-origin condition layers). Presentation metadata only — no canon, no pixel changes.
 //
 // Environment staging: every ART SHIP 005/006/007 master is authored to the Art contract (270×480, primary
 // characters at the approved ~1.85× presentation, recommended contact line y≈372); each was inspected with Rich
 // standing on the line at base depth 1 and the floor verified walkable. ART SHIP 004 follows its staging notes.
 const FLOOR=372;
 const env=(art,o={})=>({art,floorY:FLOOR,base:1,...o});
 const environments={
  // ART SHIP 004 — ocean floor base + exact-origin ladder condition (never both layers at once).
  ocean_floor:env('ocean_floor',{floorY:370,layers:['ladder_intact']}),
  ocean_floor_collapsed:env('ocean_floor',{floorY:370,layers:['ladder_collapsed']}),
  // ART SHIP 005 masters.
  armory:env('armory'),ballroom:env('ballroom'),blood_bank:env('blood_bank'),
  castle_exterior:env('castle_exterior'),family_house:env('family_house'),fish_tank:env('fish_tank'),
  garage:env('garage'),grave:env('grave'),kush_crypt:env('kush_crypt'),music_room:env('music_room'),
  naija_mart:env('naija_mart'),party_hall:env('party_hall'),pet_crypt:env('pet_crypt'),pier:env('pier'),roof:env('roof'),
  slurp:env('slurp'),waffle_haven:env('waffle_haven'),
  // ART SHIP 006 condition masters (distinct opaque masters, not overlays).
  castle_exterior_party:env('castle_exterior_party'),grave_closed:env('grave_closed'),party_hall_packed:env('party_hall_packed'),
  // ART SHIP 007 masters.
  boba_shop:env('boba_shop'),food_court:env('food_court'),kush_back:env('kush_back'),kitchen:env('kitchen'),movie_room:env('movie_room'),
  peking_naija:env('peking_naija'),salon:env('salon'),brunch:env('brunch'),onsen:env('onsen'),little_tokyo:env('little_tokyo'),
  venice:env('venice'),gallery:env('gallery'),tristan_apt:env('tristan_apt'),taco_truck:env('taco_truck'),maul:env('maul'),
  lennox:env('lennox'),centennial:env('centennial'),suya_spot:env('suya_spot'),crest:env('crest'),
  // ART SHIP 005/007 masters with ART SHIP 008 exact-origin layers. The layers are SURFACE-SCOPED: they draw only on
  // the screens the Art Engineering Asset Map lists (registry `surfaces`, resolved per adventure node through
  // js/data/art_surfaces.js). `conditions` draw above the base and below actors; `foreground` above actors, below UI.
  // Hollow Bowl (NC-FA-10): ART SHIP 009 adds a stage-band crowd companion drawn over the Ship 008 seating crowd, same
  // surface. `conditions` draw in list order: base → seating crowd → stage-band crowd → actors → UI. The stage-band
  // crowd flanks the stage (x≈0–95 and ≈172–270 on y≈244–311); at the default slots (72/198) the pair stands in front
  // of both flanks and hides them, so while these layers are active the Director stages the pair on the open stage
  // apron between the flanks (left x=108, right x=164, contact line unchanged) and the audience reads beside them.
  catacomb:env('catacomb',{conditions:['crowd_condition']}),
  hollow_bowl:env('hollow_bowl',{conditions:['crowd_condition','stage_band_crowd_condition'],registered:{left:{x:108},right:{x:164}}}),
  duchess_castle:env('duchess_castle',{conditions:['reception_condition']}),
  // The café seat/table support is registered to one contact zone (the seat's centre, x=143 on the contact line):
  // while those layers are active the seated `left` slot stands there, so the table occludes the lower pose.
  cafe:env('cafe',{conditions:['laptop_support_rear'],foreground:['laptop_table_foreground'],registered:{left:{x:143}}}),
  // ART SHIP 008 master (Art proposed contact line y=372; verified with Rich on the line at base depth 1).
  street_night:env('street_night'),
  // ART SHIP 008 condition over the approved throne base: runtime env `throne` supplies the base, contact line and
  // cover framing; the 765×1024 exact-origin layer is drawn with the identical transform.
  throne_party_mess:{art:'throne_party_mess',baseEnv:'throne',conditions:['condition']},
  // ART SHIP 009 masters (Art proposed contact line y=372; each checked with the live cast on the line at base depth 1).
  atl_house_party:env('atl_house_party'),la_sky:env('la_sky'),naija_lot:env('naija_lot'),neighbor_castle:env('neighbor_castle'),
  portobello_bedroom:env('portobello_bedroom'),portobello_office:env('portobello_office'),portobello_porch:env('portobello_porch'),
  rooftop_dtla:env('rooftop_dtla'),tokyo_tease:env('tokyo_tease'),
  // ART SHIP 009 approved zero-pixel reuse (AS9-REUSE-LAN-NIGHT): `lan_night` is the same authored location as
  // `tristan_apt` (Tristan's apartment at night), so it presents that exact frozen master. Only registry `aliases`
  // may share a master this way; the runtime id keeps its own display name.
  lan_night:env('tristan_apt')
 };
 window.RAArtIntegration={environments};
})();
