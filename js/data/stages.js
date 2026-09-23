(function(){const source={width:80,height:96,anchor:{x:40,y:88}};const docks={id:'jdm-imports-docks',native:{width:270,height:480},environment:'assets/jdm_imports/environment/docks_night_270x480.png',referenceScale:1.25,contactLines:[{id:'combat',y:350}],actors:{rich:{anchor:{x:55,y:350,line:'combat'},facing:'right',source,layer:6},importer:{anchor:{x:180,y:350,line:'combat'},facing:'left',source,layer:6},daughter:{anchor:{x:230,y:350,line:'combat'},facing:'left',source,observer:true,layer:5}},objects:{supra:{anchor:{x:168,y:354,line:'curb'},source:{width:136,height:50,anchor:{x:68,y:50}},scale:1.75,layer:2}},dialogueSafeZones:[{id:'combat-dialogue',x:10,y:42,width:250,height:102}],uiExclusionZones:[{id:'hp-panels',x:0,y:0,width:270,height:48},{id:'battle-controls',x:0,y:362,width:270,height:118}],layers:[{id:'environment',z:1},{id:'objects',z:2},{id:'observers',z:5},{id:'combatants',z:6},{id:'dialogue',z:9},{id:'ui',z:10}]};window.RAStages={get:id=>id===docks.id?docks:null,all:()=>[docks]};})();

(function(){
  const source={width:80,height:96,anchor:{x:40,y:88}};
  const base='assets/ogun_rave/';
  const rave={
    id:'ogun-rave',native:{width:270,height:480},referenceScale:1,
    environment:base+'masters/rave_interior_270x480.png',
    contactLines:[{id:'party-floor',y:344,x1:28,x2:242},{id:'host-landing',y:273,x1:166,x2:248}],
    actors:{
      rich:{source,anchor:{x:75,y:344,line:'party-floor'},facing:'right',layer:5,states:{neutral:'assets/rich_standing_right.png'}},
      ogun:{source,anchor:{x:192,y:273,line:'host-landing'},facing:'authored',layer:6,states:{neutral:base+'masters/ogun_neutral_80x96.png'}}
    },
    hostLanding:{x:166,y:273,width:82,height:21},
    foreground:{asset:base+'layers/speaker_foreground_overlay.png',mask:base+'masks/speaker_foreground_mask.png',layer:7,mode:'fixed visual redraw above actors; includes background margins'},
    masks:{speakers:base+'masks/speaker_foreground_mask.png',ogunSilhouette:base+'masks/ogun_neutral_silhouette.png',artEditEvidence:base+'masks/crowd_removal_edit_region.png',semantics:'visual only; no collision, triggers or navigation'},
    reconstructionBase:base+'layers/room_without_foreground.png',
    dialogueSafeZones:[{id:'rave-dialogue',x:32,y:132,width:206,height:60}],
    uiExclusionZones:[{id:'rave-choices',x:16,y:376,width:238,height:88}],
    partyFloor:{id:'central-party-floor',x:36,y:300,width:198,height:66,semantics:'composition area, not a walk mesh'},
    layers:[{id:'environment',z:1},{id:'rich',z:5},{id:'ogun',z:6},{id:'speaker-foreground',z:7},{id:'dialogue',z:9},{id:'inspection',z:10}]
  };
  const previous=window.RAStages;
  window.RAStages={get:id=>id===rave.id?rave:previous.get(id),all:()=>[...previous.all(),rave]};
})();
