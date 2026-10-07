(function(){
 'use strict';
 // RAHeatFloors — FCPB CONVERGENCE (integration-owned). The ONE owner of the authored Vol 7 §8 HEAT tier floors.
 // F04 (WAR ROOM) and F05 (THE TRAP) both used to call RAHeat.configure() with these same numbers (last writer wins, and F04
 // deferred to "whoever configured first"). Neither fragment configures HEAT any more: both delegate here.
 //   COOL 0-29 · WARM 30-59 · HOT 60-84 · ON FIRE 85+
 // Zero-change while dark: the floors are applied only while a fragment that consumes them is ON (F04.war_room or F05.trap), so
 // with every flag OFF RAHeat keeps its shipped provisional floors exactly as IF-1 v1.0 froze them. The values never change here;
 // apply() is idempotent and every caller passes through this one function, so there is no ordering dependency.
 const FLOORS=Object.freeze({COOL:0,WARM:30,HOT:60,'ON FIRE':85});
 const CONSUMERS=Object.freeze(['F04.war_room','F05.trap']);
 let applied=false;
 const wanted=()=>CONSUMERS.some(id=>!!window.RAFeatures?.enabled(id));
 function apply(){
  if(!window.RAHeat)return false;
  window.RAHeat.configure({floors:{...FLOORS},provisional:false});
  applied=true;return true;
 }
 // ensure(): what a consumer calls at its own boot. Applies (idempotently) when a consumer flag is ON.
 function ensure(){return wanted()?apply():false;}
 window.RAHeatFloors={FLOORS,CONSUMERS,apply,ensure,applied:()=>applied,owner:'integration (js/if1/heat_floors.js)'};
 window.RAFeatures?.onChange(()=>ensure());
 ensure();
})();
