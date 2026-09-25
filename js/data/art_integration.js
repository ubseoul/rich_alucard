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
  armory:env('armory'),ballroom:env('ballroom'),blood_bank:env('blood_bank'),cafe:env('cafe'),
  castle_exterior:env('castle_exterior'),catacomb:env('catacomb'),family_house:env('family_house'),fish_tank:env('fish_tank'),
  garage:env('garage'),grave:env('grave'),hollow_bowl:env('hollow_bowl'),kush_crypt:env('kush_crypt'),music_room:env('music_room'),
  naija_mart:env('naija_mart'),party_hall:env('party_hall'),pet_crypt:env('pet_crypt'),pier:env('pier'),roof:env('roof'),
  slurp:env('slurp'),waffle_haven:env('waffle_haven'),
  // ART SHIP 006 condition masters (distinct opaque masters, not overlays).
  castle_exterior_party:env('castle_exterior_party'),grave_closed:env('grave_closed'),party_hall_packed:env('party_hall_packed'),
  // ART SHIP 007 masters.
  boba_shop:env('boba_shop'),food_court:env('food_court'),kush_back:env('kush_back'),kitchen:env('kitchen'),movie_room:env('movie_room'),
  peking_naija:env('peking_naija'),salon:env('salon'),brunch:env('brunch'),onsen:env('onsen'),little_tokyo:env('little_tokyo'),
  venice:env('venice'),gallery:env('gallery'),tristan_apt:env('tristan_apt'),taco_truck:env('taco_truck'),maul:env('maul'),
  lennox:env('lennox'),centennial:env('centennial'),suya_spot:env('suya_spot'),crest:env('crest'),duchess_castle:env('duchess_castle')
 };
 window.RAArtIntegration={environments};
})();
